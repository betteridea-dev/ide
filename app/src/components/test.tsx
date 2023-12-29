import { useState, useEffect } from "react"
import useDeployments, { deployment } from "../hooks/useDeployments"
import useContracts from "../hooks/useContracts"

export default function Test({ target }: { target: string }) {
    const [activeDeployment, setActiveDeployment] = useState<string>()
    const [callType, setCallType] = useState<"read" | "write">("read")
    const [functionName, setFunctionName] = useState<string>("")
    const { deployments, removeDeployment } = useDeployments()
    const { contracts, setContracts } = useContracts()

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

    return <div className="flex flex-col justify-center items-center h-full gap-5">
        <div className="w-fit">
            <label className="block text-white">Select a deployment</label>
            <select className="bg-white rounded-md px-2 py-1"
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
                <select className="bg-white rounded-md px-2 py-1 w-fit mb-2" defaultValue="none" onChange={(e) => setFunctionName(e.target.value)}>
                    <option value="none" disabled>Select a function</option>
                    <option value="test">test</option>

                </select>
                {/* input json */}
                <div className="ring-1 ring-white/20 rounded overflow-clip p-0.5 h-full"><iframe className="rounded" src={`/betterIDE?editor&language=json&file=input/state.json`} className="w-full h-full" /></div>
                {/* call button */}
                <button className="bg-green-500 my-5 text-black rounded-md px-4 p-1 w-fit active:scale-95 hover:scale-105">RUN</button>
            </div>
            <div className="flex flex-col gap-1">
                <div className="text-2xl">Output</div>
                <div>Result</div>
                <pre className="bg-white/10 p-1 rounded">...</pre>
                <div>Latest State</div>
                <pre className="bg-white/10 p-1 rounded">...</pre>
            </div>
        </div>
    </div>
}
