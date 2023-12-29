import { Editor, useMonaco } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"
import theme from "./themes/merbivore-modified.json"
import useContracts from "./hooks/useContracts";

export default function CEditor() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [searchParams, setSearchParams] = useSearchParams()
    const { contracts, setContracts } = useContracts()
    const [value, setValue] = useState("")
    const monaco = useMonaco()
    monaco?.editor.defineTheme("merbivore", theme as editor.IStandaloneThemeData)


    const file = searchParams.get("file")!.split("/")
    const contractName = file[0]
    const contractFile = file[1]

    useEffect(() => {
        if (!contracts) return
        // console.log(contracts, contractName, contractFile)
        const src = contracts[contractName][contractFile]
        setValue(src)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (!value) return
        const nc = { ...contracts }
        nc[contractName][contractFile] = value
        setContracts(nc)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    return <Editor
        height="100vh"
        language={searchParams.get("language")!}
        theme="merbivore"
        defaultValue={value}
        onChange={(value) => { setValue(value) }}
    />
}
