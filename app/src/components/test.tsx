import { useState, useEffect } from "react"
import useDeployments, { deployment } from "../hooks/useDeployments"
import useContracts from "../hooks/useContracts"
import { viewContractState, writeContract } from "arweavekit/contract"

export default function Test({ target }: { target: string }) {
    const [activeDeployment, setActiveDeployment] = useState<string>()
    const [callType, setCallType] = useState<"read" | "write">("read")
    const [functionName, setFunctionName] = useState<string>("")
    const { deployments, removeDeployment } = useDeployments()
    const { contracts, setContracts } = useContracts()
    const [success, setSuccess] = useState<boolean>(false)
    const [latestState, setLatestState] = useState<string>("")
    const [result, setResult] = useState<string>("")

    useEffect(() => {
        setContracts({
            ...contracts,
            "input": {
                "README.md": "This is not a contract. The state.json is used to send arguments to the contract for testing.",
                "state.json": JSON.stringify({ name: "ankushKun" }),
                "contract.js": ""
            }
        })
        if (!target) return
        setActiveDeployment(target)
    }, [])

    useEffect(() => {
        setFunctionName("")
        setCallType("read")
    }, [activeDeployment])

    useEffect(() => {
        if (!activeDeployment) return
        if (functionName.toLowerCase().startsWith("get"))
            setCallType("read")
        else if (functionName.toLowerCase().startsWith("set"))
            setCallType("write")
    }, [functionName, activeDeployment])

    async function run() {
        if (!activeDeployment) return
        if (!functionName) return
        if (!callType) return
        if (!contracts) return
        const contract = contracts[activeDeployment]
        if (!contract) return
        const input = JSON.parse(contracts["input"]["state.json"])
        if (!input) return

        if (callType == "read") {
            try {
                const res = await viewContractState({
                    contractTxId: deployments[activeDeployment].txid,
                    environment: deployments[activeDeployment].env,
                    strategy: "arweave",
                    options: {
                        function: functionName,
                        ...input
                    }
                })
                console.log(res)
                if (res.result.status == 200) {
                    setSuccess(true)
                    setResult(JSON.stringify({ result: res.viewContract.result }, null, 2))
                    setLatestState(JSON.stringify(res.viewContract.state, null, 2))

                } else {
                    setResult(`error: ${res.result.status}
${res.result.statusText}

${res.viewContract.errorMessage}`)
                }
            } catch (e) {
                console.log(e)
                setResult(`error: ${e}`)
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
                        ...input
                    },
                    cacheOptions: {
                        inMemory: true
                    }
                })
                console.log(res)
                if (res.result.status == 200) {
                    setSuccess(true)
                    setResult(`TXID: ${res.writeContract.originalTxId}`)
                    setLatestState(JSON.stringify(res.state, null, 2))
                } else {
                    setResult(`error: ${res.result.status}
${res.result.statusText}

${res.writeContract.errorMessage}`)
                }
            } catch (e) {
                console.log(e)
                setResult(`error: ${e}`)
            }
        }
    }

    return <div className="flex flex-col justify-center items-center h-full gap-5">
        <div className="w-fit">
            <label className="block text-white">Select a deployment</label>
            <select className=""
                defaultValue={target || "none"} onChange={(e) => setActiveDeployment(e.target.value)}>
                <option value="none" disabled>Select a deployment</option>
                {Object.keys(deployments).map((key) => {
                    return <option key={key} value={key}>{key} ({deployments[key].env}-{deployments[key].txid})</option>
                })}
            </select>
        </div>
        <div className="w-full grid grid-cols-2 p-5 gap-5">
            <div className="flex flex-col gap-1">
                <div className="text-2xl">Call a Function</div>
                <div className="flex gap-5 items-center">
                    <div>Type:</div>
                    <div className="flex items-center gap-1">
                        <input type="radio" name="calltype" id="read" value="read" checked={callType == "read"} onClick={() => setCallType("read")} />
                        <label htmlFor="read">Read</label>
                    </div>
                    <div className="flex items-center gap-1">
                        <input type="radio" name="calltype" id="write" value="write" checked={callType == "write"} onClick={() => setCallType("write")} />
                        <label htmlFor="write">Write</label>
                    </div>
                </div>
                <div className="text-lg mt-5">Function Name</div>
                <select className="" defaultValue="none" onChange={(e) => setFunctionName(e.target.value)}>
                    <option value="none" disabled>Select a function</option>
                    {activeDeployment && deployments[activeDeployment].functionNames.map((func) => <option key={func} value={func}>{func}</option>)}
                </select>
                {/* input json */}
                <div className="ring-1 ring-white/20 rounded overflow-clip p-0.5 h-full w-full"><iframe className="rounded h-full w-full" src={`/betterIDE?editor&language=json&file=input/state.json`} /></div>
                {/* call button */}
                <button className="bg-green-500 my-5 text-black rounded-md px-4 p-1 w-fit active:scale-95 hover:scale-105" onClick={run}>RUN</button>
            </div>
            <div className="flex flex-col gap-1">
                <div className="text-2xl">Output</div>
                <div>Result</div>
                <pre className={`bg-white/10 p-1 rounded overflow-scroll ${success ? "text-green-400" : "text-red-400"}`}>{result || "..."}</pre>
                <div>Latest State</div>
                <pre className="bg-white/10 p-1 rounded overflow-scroll">{latestState || "..."}</pre>
            </div>
        </div>
    </div>
}
