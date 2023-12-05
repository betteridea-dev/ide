import { useState, useEffect } from "react"
import { createContract } from "arweavekit/contract";
import tick from "../assets/tick.svg"
import copy from "../assets/copy.svg"
import { Link } from "react-router-dom";


const derivations = [
  "not allowed",
  "Allowed-With-Credit",
  "Allowed-With-Indication",
  "Allowed-With-License-Passthrough",
  "Allowed-With-RevenueShare"
]

const commercialUses = [
  "not allowed",
  "Allowed",
  "Allowed-With-Credit"
]

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
  const [derivation, setDerivation] = useState("")
  const [commercialUse, setCommercialUse] = useState("")
  const [fileName, setFileName] = useState("")
  const [walletUploaded, setWalletUploaded] = useState(false)
  const [walletJWK, setWalletJWK] = useState<string>()
  const [useWallet, setUseWallet] = useState(false)
  const [error, setError] = useState("")
  const [deploySuccess, setDeploySuccess] = useState(false)
  const [contractTxID, setContractTxID] = useState("")

  const urlParams = new URLSearchParams(window.location.search)
  const conName = urlParams.get("conName")
  const depEnv = urlParams.get("depEnv")


  useEffect(() => {
    const contracts = localStorage.getItem("contracts")
    if (!contracts) return
    const parsed = JSON.parse(contracts)
    const keys = Object.keys(parsed)
    setAvailableContracts(keys)
    if (conName) setContractTarget(conName)
    if (depEnv) setDeployEnv(depEnv)
    console.log(conName, depEnv)
    // console.log(keys)
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
    <div className="p-5 h-screen flex flex-col justify-evenly items-center">
      {
        !deploySuccess ? <> <div className="flex gap-10 justify-center">
          <div>
            <div>Select Contract</div>
            <select className="px-5 rounded" value={contractTarget} defaultValue={contractTarget} onChange={(e) => setContractTarget(e.target.value)}>
              <option value="" disabled>Select a contract</option>
              {availableContracts.map((c) => <option value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div>Select Environment</div>
            <select className="px-5 rounded" value={deployEnv} defaultValue={deployEnv} onChange={(e) => setDeployEnv(e.target.value)}>
              <option value="" disabled>Select an environment</option>
              <option value="local">Local (npx arlocal)</option>
              <option value="mainnet">Mainnet</option>
            </select>
          </div>
        </div>
          <div>
            <label htmlFor="wallet" className="p-2 px-4 cursor-pointer rounded bg-[#093E49] text-center">{!walletUploaded ? "Import a wallet.json file" : `Imported: ${fileName} ✅`}</label>
            <input type="file" accept="application/JSON" id="wallet" className="hidden" onChange={(e) => fileUploaded(e.target.files!)} />
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-center">
              <span className="font-bold text-xl">Universal Data Licensing</span><br />
              <span className="font-base">Protect the ownership of your content</span>
            </div>
            <div className="flex gap-10">
              <div>
                <div>License your code</div>
                <select className="px-5 rounded" defaultValue={derivation[0]} onChange={(e) => setDerivation(e.target.value)}>
                  {derivations.map((c) => <option value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <div>Add a commercial license</div>
                <select className="px-5 rounded" defaultValue={commercialUse[0]} onChange={(e) => setCommercialUse(e.target.value)}>
                  {commercialUses.map((c) => <option value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
          <button className="bg-[#093E49] p-2 px-4 rounded" onClick={() => deploy()}>Deploy! 🚀</button>
        </> : <div className="text-center flex flex-col gap-4 justify-center items-center">
          <div className="text-3xl font-bold flex gap-2"><img src={tick} width={22} /> Your contract has been successfully deployed!</div>
          <div className="flex gap-1 mx-auto">Txn ID: {contractTxID} <img src={copy} width={22} /></div>
          <Link to={`/test?conName=${contractTarget}`} className="bg-[#093E49] p-2 px-4 rounded">Test this contract</Link>
        </div>}
    </div>
  )
}

export default Deploy;