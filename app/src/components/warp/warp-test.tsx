import { useState, useEffect } from "react";
import useDeployments from "../../../hooks/useDeployments";
import { ContractsType } from "../../../hooks/useContracts";
import { viewContractState, writeContract } from "arweavekit/contract";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
            JSON.stringify({ result: res.viewContract.result }, null, 2)
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
      <div className="w-[300px]">
        <Label>Select a deployment</Label>

        <Select
          // disabled={}
          defaultValue={target ?? "none"}
          onValueChange={(val) => {
            setActiveDeployment(val);
          }}
        >
          <SelectTrigger className="max-w-full flex-grow">
            <SelectValue placeholder="Deployment" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="none" disabled>
              Select a deployment
            </SelectItem>

            {Object.keys(deployments).map((key) => {
              return (
                <SelectItem key={key} value={key}>
                  {key} ({deployments[key].env}-{deployments[key].txid})
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="grid w-full grid-cols-2 gap-5 p-5">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="text-2xl">Call a Function</div>

            <div className="flex flex-row gap-4">
              <Label>Type: </Label>

              <RadioGroup
                value={callType}
                name="calltype"
                onValueChange={(val) => setCallType(val as "read" | "write")}
                className="flex flex-row"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="read" id="read" />
                  <Label htmlFor="read">Read</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="write" id="write" />
                  <Label htmlFor="write">Write</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="">
            <Label>Select a function</Label>

            <Select
              // disabled={}
              defaultValue={"none"}
              onValueChange={(val) => {
                setFunctionName(val);
              }}
            >
              <SelectTrigger className="max-w-full flex-grow">
                <SelectValue placeholder="Function Name" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="none" disabled>
                  Select a deployment
                </SelectItem>

                {activeDeployment &&
                  deployments[activeDeployment].functionNames.map((key) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}

                {Object.keys(deployments).map((key) => {
                  return (
                    <SelectItem key={key} value={key}>
                      {key} ({deployments[key].env}-{deployments[key].txid})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* JSON Input */}
          <div className="h-full w-full overflow-clip rounded p-0.5 ring-1 ring-white/20">
            <iframe
              className="h-full w-full rounded"
              src={`/?editor&language=json&file=input/state.json`}
            />
          </div>

          <Button className="w-fit" variant="default" onClick={run}>
            RUN
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-2xl">Output</h3>
          <p>Result</p>
          <pre
            className={`overflow-scroll rounded bg-white/10 p-1 ${
              success ? "text-green-400" : "text-red-400"
            }`}
          >
            {result || "..."}
          </pre>

          <div className="h-2"></div>

          <p>Latest State</p>
          <pre className="overflow-scroll rounded bg-white/10 p-1">
            {latestState || "..."}
          </pre>
        </div>
      </div>
    </div>
  );
}
