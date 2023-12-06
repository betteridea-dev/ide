import { Editor, useMonaco } from "@monaco-editor/react";
import { editor } from "monaco-editor"
import theem from "../themes/merbivore-modified.json"

export default function JsonArgs({ setShowSidebar }: { setShowSidebar: any }) {
    setShowSidebar(false);
    const monaco = useMonaco();
    monaco?.editor.defineTheme('custom', theem as editor.IStandaloneThemeData);

    localStorage.setItem("jsonArgs", `{ "name": "ankushKun" }`)
    return <Editor
        defaultLanguage="json"
        defaultValue={`{ "name": "ankushKun" }`}
        theme="custom"
        options={{
            minimap: { enabled: false },
            scrollbar: { vertical: "hidden" }
        }}
        onChange={(e) => localStorage.setItem("jsonArgs", e as string)}
    />
}