import { Editor, useMonaco } from "@monaco-editor/react"
import theme from "../themes/merbivore-modified.json"
import { useState } from "react"
import run from "../assets/run.svg"
function Cell() {
    const [code, setCode] = useState("x = 5")

    return <div className="w-full flex bg-black/10 p-2 gap-2 ring-1 ring-white/5 my-3">
        <div className="flex flex-col">
            <button className="text-xl">
                <img src={run} className="w-8 h-8" />
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
                    }
                }
            />
            <pre className="p-0.5 ring-1 ring-white/5">
                ...
            </pre>
        </div>
    </div>
}


export default function AONotebook() {
    const [cells, setCells] = useState([])
    const monaco = useMonaco()
    monaco?.editor.defineTheme("merbivore", theme as any)

    function addCell() {
        setCells([...cells, Cell])
    }

    return <div className="h-[94vh] p-2 overflow-y-scroll flex flex-col">
        <div className="text-xl text-center">Welcome to AO Playground!</div>
        {cells.map((Cellinlist, i) => <Cellinlist key={i} />)}
        <button onClick={addCell} className="bg-white text-black text-center px-3 font-bold text-xl mx-auto">+</button>
    </div>
}