import { Editor, useMonaco } from "@monaco-editor/react";
import { editor } from "monaco-editor"
import { useEffect, useState } from "react";
import theme from "../themes/merbivore-modified.json"

export default function CodeEditor() {
    const [value, setValue] = useState<string>("");
    const monaco = useMonaco();
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

    useEffect(() => {
        if (monaco)
            monaco?.editor.defineTheme("custom", theme as editor.IStandaloneThemeData)
    }, [monaco])

    return <div>
        <h1>Editor</h1>
        <p>Contract: {contractName}</p>
        <p>Type: {type}</p>
        <Editor
            className="h-[95vh] w-full"
            width="100%"
            language={type!}
            value={value}
            theme="custom"
            defaultValue={value}
            onChange={e => setValue(e as string)}
        />
    </div>

}