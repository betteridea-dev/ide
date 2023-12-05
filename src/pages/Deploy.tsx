import { useState, useEffect } from "react"
import { createContract } from "arweavekit/contract";

function extractFunctions(src: string) {
  // const functionRegex = /function\s+([^\s(]+)\s*\(([^)]*)\)\s*{([^}]*)}/g;
  const functionRegex = /case\s+"([^"]+)"/g;
  const matches = src.matchAll(functionRegex);
  const functions = [];

  for (const match of matches) {
    if (match[1] == "handle") continue
    functions.push(match[1])
  }

  return functions
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Deploy = ({ setShowSidebar }: { setShowSidebar: any }) => {
  setShowSidebar(true)
  const [availableContracts, setAvailableContracts] = useState<string[]>([])
  const [contractTarget, setContractTarget] = useState<string>("")
  const [src, setSrc] = useState<string>("")
  const [state, setState] = useState<string>("")
  const [deployEnv, setDeployEnv] = useState("")
  //
  const [fileName, setFileName] = useState("")
  const [walletUploaded, setWalletUploaded] = useState(false)
  const [walletJWK, setWalletJWK] = useState<string>()
  const [useWallet, setUseWallet] = useState(false)
  const [error, setError] = useState("")
  const [deploySuccess, setDeploySuccess] = useState(false)
  const [contractTxID, setContractTxID] = useState("")

  useEffect(() => {
    const contracts = localStorage.getItem("contracts")
    if (!contracts) return
    const parsed = JSON.parse(contracts)
    const keys = Object.keys(parsed)
    setAvailableContracts(keys)
    console.log(keys)
  }, [])

  useEffect(() => {
    if (!contractTarget) return
    const contracts = localStorage.getItem("contracts")
    if (!contracts) return
    const parsed = JSON.parse(contracts)
    const contract = parsed[contractTarget]
    if (!contract) return
    const sr = contract["contract.js"]
    const st = contract["state.json"]
    if (!sr || !st) return
    setSrc(sr)
    setState(st)
  }, [contractTarget])

  async function deploy() {
    if (!walletUploaded && !useWallet) return alert("please upload a wallet")
    if (deployEnv == "local") {
      console.log("deploying to localhost")
      console.log(src)
      console.log(state)
      try {
        const contract = await createContract({
          wallet: useWallet ? "use_wallet" : walletJWK!,
          contractSource: src!,
          initialState: state!,
          environment: "local",
          strategy: "both",
          tags: [
            { name: "App-Name", value: "AR-Contractor" },
            { name: "App-Version", value: "0.1.0" },
          ]
        })
        console.log(contract)
        if (contract.result.status == 200) {
          setDeploySuccess(true)
          setError("")
          setContractTxID(contract.contractTxId)
          const deployments = sessionStorage.getItem("deployments")
          if (!deployments) {
            sessionStorage.setItem("deployments", JSON.stringify({ [contractTarget]: { id: contract.contractTxId, env: deployEnv, functions: extractFunctions(src) } }))
          }
          else {
            const parsed = JSON.parse(deployments)
            parsed[contractTarget] = { id: contract.contractTxId, env: deployEnv, functions: extractFunctions(src) }
            sessionStorage.setItem("deployments", JSON.stringify(parsed))
          }
        }
      }
      catch (e) {
        console.log(e)
        setError(`${e} [See the console for more details]`)
      }
    } else if (deployEnv == "mainnet") {
      alert("mainnet deployment is not yet supported")
    } else {
      alert("invalid deployment target")
    }
  }

  function fileUploaded(e: FileList) {
    const file = e[0];
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setWalletUploaded(true);
      setWalletJWK(JSON.parse(text));
      setUseWallet(false);
      setFileName(file.name);
    };
    reader.readAsText(file);
  }

  return (
    <div>Deploy</div>
  )
}

export default Deploy;