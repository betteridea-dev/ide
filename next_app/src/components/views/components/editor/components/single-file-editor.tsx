import { Editor } from "@monaco-editor/react";

import { useGlobalState, useProjectManager } from "@/hooks"
import notebookTheme from "@/monaco-themes/notebook.json";
import { editor } from "monaco-editor";
import { useTheme } from "next-themes";

const monacoConfig: editor.IStandaloneEditorConstructionOptions = {
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 20,
    lineNumbersMinChars: 3,
    scrollBeyondLastLine: false,
}

// THE CODE RUNNER BUTTON IS INSIDE FILE BAR

export default function SingleFileEditor() {
    const manager = useProjectManager();
    const globalState = useGlobalState();
    const { theme } = useTheme();

    const project = manager.getProject(globalState.activeProject);
    const file = project.getFile(globalState.activeFile);

    return <>
        <Editor
            className="font-btr-code"
            height="100%"
            // beforeMount={(m) => {
            //   m.editor.remeasureFonts()
            // }}
            onMount={(editor, monaco) => {
                monaco.editor.defineTheme(
                    "notebook",
                    notebookTheme as editor.IStandaloneThemeData
                );
                if (theme == "dark") monaco.editor.setTheme("notebook");
                else monaco.editor.setTheme("vs-light");
                // set font family
                // editor.updateOptions({ fontFamily: "DM Mono" });
                // monaco.editor.remeasureFonts();
                // run function on shift+enter
                editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
                    // runNormalCode();
                });

                editor.addAction({
                    id: "format-code",
                    label: "Format Code",
                    contextMenuGroupId: "navigation",
                    run: async function (editor) {
                        const luamin = require('lua-format')
                        const input = editor.getValue()
                        console.log("formatting code")
                        const output: string = luamin.Beautify(input, {
                            RenameVariables: false,
                            RenameGlobals: false,
                            SolveMath: true

                        })
                        // remove source first line
                        editor.setValue(output.split("\n").slice(1).join("\n").trimStart())
                    },
                })
            }}
            value={file ? file.content.cells[file.content.cellOrder[0]].code : ""}
            onChange={(value) => {
                const newContent = { ...file.content };
                newContent.cells[file.content.cellOrder[0]] = {
                    ...file.content.cells[file.content.cellOrder[0]],
                    code: value,
                };
                manager.updateFile(project, { file, content: newContent });
            }}
            language={file && file.language}
            options={monacoConfig}
        />
    </>
}