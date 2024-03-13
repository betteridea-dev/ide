import { useState, useEffect } from "react";
import useDeployments from "../../../hooks/useDeployments";
import { ContractsType } from "../../../hooks/useContracts";
import { viewContractState, writeContract } from "arweavekit/contract";

export default function WarpTest({
  contracts,
  target,
}: {
  contracts: ContractsType;
  target: string;
}) {
  const [activeDeployment, setActiveDeployment] = useState<string>();
  const [callType, setCallType] = useState<"read" | "write">("read");
  const [functionName, setFunctionName] = useState<string>("");
  const { deployments, removeDeployment } = useDeployments();

  const [success, setSuccess] = useState<boolean>(false);
  const [latestState, setLatestState] = useState<string>("");
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    contracts.setContracts({
      ...contracts.contracts,
      input: {
        "README.md":
          "This is not a contract. The state.json is used to send arguments to the contract for testing.",
        "state.json": JSON.stringify({ name: "ankushKun" }),
        "contract.js": "",
      },
    });
    if (!target) return;
    setActiveDeployment(target);
  }, []);

  useEffect(() => {
    setFunctionName("");
    setCallType("read");
  }, [activeDeployment]);

  useEffect(() => {
    if (!activeDeployment) return;
    if (functionName.toLowerCase().startsWith("get")) setCallType("read");
    else if (functionName.toLowerCase().startsWith("set")) setCallType("write");
  }, [functionName, activeDeployment]);

  async function run() {
    console.log("RRRR");
    if (!activeDeployment) return alert("Select a deployment");
    if (!functionName) return alert("Select a function");
    if (!callType) return alert("Select a call type");
    if (!contracts) return alert("No contracts found");
    const contract = contracts.contracts[activeDeployment];
    console.log(activeDeployment, contract, contracts);
    if (!contract) return alert("No contract found");
    const input = JSON.parse(contracts.contracts["input"]["state.json"]);
    if (!input) return;

    if (callType == "read") {
      try {
        const res = await viewContractState({
          contractTxId: deployments[activeDeployment].txid,
          environment: deployments[activeDeployment].env,
          strategy: "arweave",
          options: {
            function: functionName,
            ...input,
          },
        });
        console.log(res);
        if (res.result.status == 200) {
          setSuccess(true);
          setResult(
            JSON.stringify({ result: res.viewContract.result }, null, 2),
          );
          setLatestState(JSON.stringify(res.viewContract.state, null, 2));
        } else {
          setResult(`error: ${res.result.status}
${res.result.statusText}

${res.viewContract.errorMessage}`);
        }
      } catch (e) {
        console.log(e);
        setResult(`error: ${e}`);
      }
    } else if (callType == "write") {
      try {
        const res = await writeContract({
          contractTxId: deployments[activeDeployment].txid,
          environment: deployments[activeDeployment].env,
          wallet: "use_wallet",
          strategy: "arweave",
          options: {
            function: functionName,
            ...input,
          },
          cacheOptions: {
            inMemory: true,
          },
        });
        console.log(res);
        if (res.result.status == 200) {
          setSuccess(true);
          setResult(`TXID: ${res.writeContract.originalTxId}`);
          setLatestState(JSON.stringify(res.state, null, 2));
        } else {
          setResult(`error: ${res.result.status}
${res.result.statusText}

${res.writeContract.errorMessage}`);
        }
      } catch (e) {
        console.log(e);
        setResult(`error: ${e}`);
      }
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5">
      <div className="w-fit">
        <label className="block text-white">Select a deployment</label>
        <select
          className=""
          defaultValue={target || "none"}
          onChange={(e) => setActiveDeployment(e.target.value)}
        >
          <option value="none" disabled>
            Select a deployment
          </option>
          {Object.keys(deployments).map((key) => {
            return (
              <option key={key} value={key}>
                {key} ({deployments[key].env}-{deployments[key].txid})
              </option>
            );
          })}
        </select>
      </div>
      <div className="grid w-full grid-cols-2 gap-5 p-5">
        <div className="flex flex-col gap-1">
          <div className="text-2xl">Call a Function</div>
          <div className="flex items-center gap-5">
            <div>Type:</div>
            <div className="flex items-center gap-1">
              <input
                type="radio"
                name="calltype"
                id="read"
                value="read"
                checked={callType == "read"}
                onClick={() => setCallType("read")}
              />
              <label htmlFor="read">Read</label>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="radio"
                name="calltype"
                id="write"
                value="write"
                checked={callType == "write"}
                onClick={() => setCallType("write")}
              />
              <label htmlFor="write">Write</label>
            </div>
          </div>
          <div className="mt-5 text-lg">Function Name</div>
          <select
            className=""
            defaultValue="none"
            onChange={(e) => setFunctionName(e.target.value)}
          >
            <option value="none" disabled>
              Select a function
            </option>
            {activeDeployment &&
              deployments[activeDeployment].functionNames.map((func) => (
                <option key={func} value={func}>
                  {func}
                </option>
              ))}
          </select>
          {/* input json */}
          <div className="h-full w-full overflow-clip rounded p-0.5 ring-1 ring-white/20">
            <iframe
              className="h-full w-full rounded"
              src={`/betterIDE?editor&language=json&file=input/state.json`}
            />
          </div>
          {/* call button */}
          <button
            className="my-5 w-fit rounded-md bg-green-500 p-1 px-4 text-black hover:scale-105 active:scale-95"
            onClick={run}
          >
            RUN
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-2xl">Output</div>
          <div>Result</div>
          <pre
            className={`overflow-scroll rounded bg-white/10 p-1 ${
              success ? "text-green-400" : "text-red-400"
            }`}
          >
            {result || "..."}
          </pre>
          <div>Latest State</div>
          <pre className="overflow-scroll rounded bg-white/10 p-1">
            {latestState || "..."}
          </pre>
        </div>
      </div>
    </div>
  );
}
