import { Editor, useMonaco, } from "@monaco-editor/react"
import theme from "../themes/merbivore-modified.json"
import { useEffect, useState } from "react"
import runIcon from "../assets/run.svg"
import { v4 } from "uuid"
import { connect, createDataItemSigner } from '@permaweb/ao-sdk'

interface celldata {
    [key: string]: {
        code: string,
        result: string,
    }
}

export default function AONotebook() {
    const [spawning, setSpawning] = useState(false)
    const [aosProcess, setAOSProcess] = useState(null)
    const [cellData, setCellData] = useState<celldata>({})
    const [cellOrder, setCellOrder] = useState<string[]>([])


    const monaco = useMonaco()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    monaco?.editor.defineTheme("merbivore", theme as any)


    async function spawnProcess() {
        if (aosProcess) return alert("already spawned")
        setSpawning(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const signer = createDataItemSigner((window as any).arweaveWallet)
        console.log(signer)
        const res = await connect().spawn({
            module: "MGUZ35GzZAlSFno6oeR0yb9Og1gPrSRDlp00G0wlXQE",
            scheduler: 'TZ7o7SIZ06ZEJ14lXwVtng1EtSx60QkPy-kh-kdAXog',
            signer,
            tags: [],
        })
        console.log(res)
        setAOSProcess(res)
        setSpawning(false)
    }

    function sendMessage({ data }: { data: string }) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const signer = createDataItemSigner((window as any).arweaveWallet)
        return connect().message({
            process: aosProcess,
            signer,
            tags: [{ name: 'Action', value: 'Eval' }],
            data
        })
    }

    function addCell() {
        const id = v4()
        setCellData({ ...cellData, [id]: { code: "", result: "" } })
        setCellOrder([...cellOrder, id])
    }


    function Cell({ cellId }: { cellId: string }) {
        const [code, setCode] = useState(cellData[cellId]?.code || "1+1")
        const [result, setResult] = useState(cellData[cellId]?.result || "...")

        async function run() {
            console.log("sending message", code)
            const r = await sendMessage({ data: code })
            console.log(r)
            setResult(r)
        }

        useEffect(() => {
            // NEED FIXING, HELP @PRATHAMESH
            // setting code and result from here will result in an infinite render loop
            // setCellData({ ...cellData, [cellId]: { code, result } })
        }, [code, result])

        return <div className="w-full flex bg-black/10 p-2 gap-2 ring-1 ring-white/5 my-3">
            <div className="flex flex-col">
                <button className="text-xl" onClick={run}>
                    <img src={runIcon} className="w-8 h-8" />
                </button>
            </div>
            <div className="flex flex-col text-left grow gap-2">
                <Editor
                    className="w-full max-h-[380px]"
                    language="lua"
                    theme="merbivore"
                    height={code.split("\n").length > 20 ? 20 * 19 : code.split("\n").length * 19}
                    onChange={(value) => {
                        setCode(value)
                    }}
                    value={code}
                    options={
                        {
                            minimap: { enabled: false },
                            // lineNumbers: "off",
                            lineNumbersMinChars: 2,
                            scrollBeyondLastLine: false,
                            renderLineHighlight: "none",
                        }
                    }
                />
                <pre className="p-0.5 ring-1 ring-white/5">
                    {result}
                </pre>
            </div>
        </div>
    }


    return <div className="h-[94vh] p-2 overflow-y-scroll flex flex-col">
        <div className="text-xl text-center">Welcome to AO Playground!</div>
        {spawning && <div className="text-center">Spawning process...</div>}
        {!spawning && <>{aosProcess ? <div className="text-center">Process ID: {aosProcess}</div> : <button onClick={spawnProcess}>spawn process</button>}</>}
        {
            cellOrder.map((cellId) => {
                return <Cell key={cellId} cellId={cellId} />
            })
        }
        <button onClick={addCell} className="bg-white text-black text-center px-3 font-bold text-xl mx-auto">+</button>
    </div>
}