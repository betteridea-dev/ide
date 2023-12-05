import { Editor, useMonaco } from "@monaco-editor/react";
import { editor } from "monaco-editor"
import theem from "../themes/merbivore-modified.json"

export default function JsonArgs({ setShowSidebar }: { setShowSidebar: any }) {
    setShowSidebar(false);
    const monaco = useMonaco();
    monaco?.editor.defineTheme('custom', theem as editor.IStandaloneThemeData);

    return <Editor
        defaultLanguage="json"
        defaultValue={`{ "name": "ankushKun" }`}
        theme="custom"
        options={{
            minimap: { enabled: false },
            scrollbar: { vertical: "hidden" }
        }}
        onChange={(e) => sessionStorage.setItem("jsonArgs", e as string)}
    />
}