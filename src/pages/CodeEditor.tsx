import { Editor, useMonaco } from "@monaco-editor/react";
import { editor } from "monaco-editor"
import { useEffect, useState } from "react";
import theme from "../themes/merbivore-modified.json"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CodeEditor({ setShowSidebar }: { setShowSidebar: any }) {
    setShowSidebar(false)
    const [value, setValue] = useState<string>("");
    const monaco = useMonaco();
    monaco?.editor.defineTheme("custom", theme as editor.IStandaloneThemeData)
    const urlparams = new URLSearchParams(window.location.search);
    const contractName = urlparams.get("contract"); // contract name
    const type = urlparams.get("type"); // js or json

    useEffect(() => {
        if (contractName && type) {
            const c = localStorage.getItem("contracts")
            if (c) {
                const parsed = JSON.parse(c)
                setValue(type == "javascript" ? parsed[contractName]["contract.js"] : parsed[contractName]["state.json"])
            }
        }
    }, [contractName, type])

    function codeChanged(src: string) {
        if (contractName && type) {
            const c = localStorage.getItem("contracts")
            if (c) {
                const parsed = JSON.parse(c)
                parsed[contractName][type == "javascript" ? "contract.js" : "state.json"] = src
                localStorage.setItem("contracts", JSON.stringify(parsed))
            }
        }
    }


    return <div>
        {/* <h1>Editor</h1>
        <p>Contract: {contractName}</p>
        <p>Type: {type}</p> */}
        <Editor
            className="h-[100vh]"
            width="100%"
            language={type!}
            value={value}
            theme="custom"
            defaultValue={value}
            onChange={(e) => codeChanged(e as string)}
        />
    </div>

}