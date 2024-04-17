import { createContract } from "arweavekit/contract";
import { contractsType } from "../../../hooks/useContracts";
import useDeployments from "../../../hooks/useDeployments";
import { useReducer } from "react";
import { Icons } from "@/components/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const derivations = [
  "not allowed",
  "Allowed-With-Credit",
  "Allowed-With-Indication",
  "Allowed-With-License-Passthrough",
  // "Allowed-With-RevenueShare"
];

const commercialUses = ["not allowed", "Allowed", "Allowed-With-Credit"];

function extractFunctionsFromSwitchCase(src: string) {
  // const functionRegex = /function\s+([^\s(]+)\s*\(([^)]*)\)\s*{([^}]*)}/g;
  const functionRegex = /case\s+"([^"]+)"/g;
  const matches = src.matchAll(functionRegex);
  const functions = [];

  for (const match of matches) {
    if (match[1] == "handle") continue;
    functions.push(match[1]);
  }
  return functions;
}

interface DeployState {
  contractName: string;
  // contractSrc: string,
  // stateSrc: string,
  deployEnv: "local" | "testnet" | "mainnet";
  result: string;
  usingWebWallet: boolean;
  deploySuccess: boolean;
  fileName: string;
  walletJWK: object | undefined;
  contractTxID: string;
  derivation: string;
  commercialUse: string;
  isError: boolean;
}

const istate: DeployState = {
  contractName: "",
  deployEnv: "local",
  result: "",
  usingWebWallet: false,
  deploySuccess: false,
  walletJWK: undefined,
  fileName: "",
  contractTxID: "",
  derivation: "",
  commercialUse: "",
  isError: false,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function WarpDeploy({
  contracts,
  target,
  test,
}: {
  contracts: contractsType;
  target: string;
  test: any;
}) {
  const { newDeployment } = useDeployments();

  function init(state: DeployState): DeployState {
    return { ...state, contractName: target };
  }

  const [state, dispatch] = useReducer(reducer, istate, init);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function reducer(state: DeployState, action: any): DeployState {
    switch (action.type) {
      case "set_contract_name":
        return { ...state, contractName: action.payload };
      case "set_env":
        return { ...state, deployEnv: action.payload };
      case "set_result":
        return { ...state, result: action.payload };
      case "set_web_wallet":
        return { ...state, usingWebWallet: action.payload };
      case "set_deploy_success":
        return { ...state, deploySuccess: action.payload };
      case "set_file": {
        const fileObj = action.payload;
        const reader = new FileReader();
        reader.onload = () => {
          const wallet = JSON.parse(reader.result as string);
          dispatch({ type: "set_wallet_jwk", payload: wallet });
        };
        reader.readAsText(fileObj);
        return { ...state, fileName: fileObj.name };
      }
      case "set_wallet_jwk":
        return { ...state, walletJWK: action.payload, usingWebWallet: false };
      case "set_contract_id":
        return { ...state, contractTxID: action.payload };
      case "set_derivation":
        return { ...state, derivation: action.payload };
      case "set_commercial_use":
        return { ...state, commercialUse: action.payload };
      case "is_error":
        return { ...state, isError: action.payload };
      case "deploy_another":
        return {
          ...state,
          deploySuccess: false,
          contractName: "",
          contractTxID: "",
          derivation: "",
          commercialUse: "",
        };
    }
    return state;
  }

  async function deploy() {
    if (!state.contractName) return alert("Please select a contract");
    if (!state.deployEnv)
      return alert("Please select a deployment environment");
    if (!state.usingWebWallet && !state.walletJWK)
      return alert("Please upload a wallet file");

    const csource = contracts[state.contractName]["contract.js"];
    const cstate = contracts[state.contractName]["state.json"];

    const tags = [
      { name: "App-Name", value: "Better-IDE" },
      { name: "App-Version", value: "1.0.0" },
    ];

    if (state.derivation)
      tags.push({ name: "Derivation", value: state.derivation });
    if (state.commercialUse)
      tags.push({ name: "Commercial-Use", value: state.commercialUse });

    try {
      const contract = await createContract({
        wallet: state.usingWebWallet ? "web_wallet" : state.walletJWK,
        contractSource: csource,
        initialState: cstate,
        environment: state.deployEnv,
        strategy: "arweave",
        tags,
      });
      console.log(contract);
      dispatch({ type: "set_deploy_success", payload: true });
      dispatch({ type: "set_contract_id", payload: contract.contractTxId });
      dispatch({
        type: "set_result",
        payload: "Deployed successfully!\nID: " + contract.contractTxId,
      });
      newDeployment(
        state.contractName,
        contract.contractTxId,
        state.deployEnv,
        extractFunctionsFromSwitchCase(
          contracts[state.contractName]["contract.js"]
        )
      );
      dispatch({ type: "is_error", payload: false });
    } catch (e: any) {
      console.log(e);
      dispatch({ type: "is_error", payload: true });
      dispatch({ type: "set_result", payload: e.toString() });
      dispatch({ type: "set_deploy_success", payload: false });
      dispatch({ type: "set_contract_id", payload: "" });
    }
  }

  if (!state) return <></>;

  return (
    <div className="flex h-full w-full flex-col items-center justify-evenly">
      {!state.deploySuccess ? (
        <div className="flex flex-col justify-center items-center gap-5">
          <div className="flex flex-row items-center justify-center gap-10">
            <div className="w-[256px]">
              <Label>Select Contract</Label>

              <Select
                // disabled={}
                defaultValue={state.contractName}
                onValueChange={(val) => {
                  dispatch({
                    type: "set_contract_name",
                    payload: val,
                  });
                }}
              >
                <SelectTrigger className="max-w-full flex-grow">
                  <SelectValue placeholder="Contract" />
                </SelectTrigger>

                <SelectContent>
                  {Object.keys(contracts).map((c) => {
                    if (c == "input") return;

                    return (
                      <SelectItem value={c} key={c}>
                        {c}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[256px]">
              <Label>Select Environment</Label>

              <Select
                // disabled={}
                defaultValue={state.deployEnv}
                onValueChange={(val) => {
                  dispatch({ type: "set_env", payload: val });
                }}
              >
                <SelectTrigger className="max-w-full flex-grow">
                  <SelectValue placeholder="Enviornment" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="local">Local (npx arlocal)</SelectItem>
                  <SelectItem value="testnet">Testnet</SelectItem>
                  <SelectItem value="mainnet">Mainnet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-row justify-center gap-4">
            <div className="p-2 px-4 transition-all duration-200 hover:scale-105 active:scale-95">
              <Label
                htmlFor="wallet"
                className="w-fit h-full cursor-pointer rounded bg-[#093E49] p-2 px-4 text-center"
              >
                {!state.walletJWK
                  ? "Import a wallet.json file"
                  : `Imported: ${state.fileName}  ✅`}
              </Label>

              <Input
                type="file"
                accept="application/JSON"
                id="wallet"
                className="hidden"
                onChange={(e) =>
                  dispatch({ type: "set_file", payload: e.target.files![0] })
                }
              />
            </div>

            <Button
              className="w-fit"
              variant="secondary"
              onClick={() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any).arweaveWallet
                  .connect([
                    "ACCESS_ADDRESS",
                    "SIGN_TRANSACTION",
                    "ACCESS_PUBLIC_KEY",
                    "SIGNATURE",
                  ])
                  .then(() => {
                    dispatch({ type: "set_web_wallet", payload: true });
                  })
                  .catch(() => {
                    dispatch({ type: "set_web_wallet", payload: false });
                    alert("Error connecting to web wallet");
                  });
              }}
            >
              Use Web Wallet {state.usingWebWallet && "✅"}
            </Button>
          </div>

          <div className="text-center my-8">
            <h3 className="text-xl font-bold">Universal Data Licensing</h3>

            <p className="font-base">Protect the ownership of your content</p>
          </div>

          <div className="flex flex-row gap-10">
            <div className="w-[256px]">
              <Label>License your code</Label>

              <Select
                // disabled={}
                defaultValue={derivations[0]}
                onValueChange={(val) => {
                  dispatch({
                    type: "set_derivation",
                    payload: val,
                  });
                }}
              >
                <SelectTrigger className="max-w-full flex-grow">
                  <SelectValue placeholder="License" />
                </SelectTrigger>

                <SelectContent>
                  {derivations.map((c) => {
                    return (
                      <SelectItem value={c} key={c}>
                        {c}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[256px]">
              <Label>Add a commercial license</Label>

              <Select
                // disabled={}
                defaultValue={commercialUses[0]}
                onValueChange={(val) => {
                  dispatch({
                    type: "set_commercial_use",
                    payload: val,
                  });
                }}
              >
                <SelectTrigger className="max-w-full flex-grow">
                  <SelectValue placeholder="Commercial License" />
                </SelectTrigger>

                <SelectContent>
                  {commercialUses.map((c) => {
                    return (
                      <SelectItem value={c} key={c}>
                        {c}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-fit my-4"
            onClick={() => deploy()}
          >
            Deploy! 🚀
          </Button>

          {state.result && (
            <pre
              className={`border-t border-white/20 bg-black/20 p-2 ${!state.isError ? "text-green-300" : "text-red-300"
                }`}
            >
              [ Result ]<br />
              <br />
              {state.result}
            </pre>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-8 text-center">
          <div className="flex gap-3 items-center text-3xl font-bold">
            <Icons.tick height={32} width={32} />
            Your contract has been successfully deployed!
          </div>

          <div className="mx-auto flex gap-3 items-center text-xl">
            Txn ID: {state.contractTxID}
            <Icons.copy
              height={18}
              width={18}
              className="cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(state.contractTxID);

                // TODO: Replace Alert with Toast
                alert("Copied to clipboard");
              }}
            />
          </div>

          <div className="flex flex-row gap-4">
            <Button
              variant="secondary"
              onClick={() => dispatch({ type: "deploy_another" })}
            >
              Deploy Another
            </Button>

            <Button
              variant="secondary"
              onClick={() => test(state.contractName)}
            >
              Test this contract
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
