import { Editor, DiffEditor } from "@monaco-editor/react";

import { useGlobalState, useProjectManager } from "@/hooks"
import notebookTheme from "@/monaco-themes/notebook.json";
import { editor } from "monaco-editor";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

const monacoConfig: editor.IStandaloneEditorConstructionOptions = {
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 20,
    lineNumbersMinChars: 3,
    scrollBeyondLastLine: false,
}

const diffMonacoConfig: editor.IDiffEditorConstructionOptions = {
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 20,
    lineNumbersMinChars: 3,
    scrollBeyondLastLine: false,
    renderSideBySide: false,
}

// Example usage:
const luaCode = `
// Your provided Lua code here
`;

// THE CODE RUNNER BUTTON IS INSIDE FILE BAR

export default function SingleFileEditor() {
    const manager = useProjectManager();
    const globalState = useGlobalState();
    const { theme } = useTheme();

    const project = manager.getProject(globalState.activeProject);
    const file = project.getFile(globalState.activeFile);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.metaKey && e.key == "Enter") {
                e.preventDefault();
                e.stopPropagation();
                document.getElementById("accept-changes-btn")?.click();
            } else if (e.metaKey && e.key == "Backspace") {
                e.preventDefault();
                e.stopPropagation();
                document.getElementById("reject-changes-btn")?.click();
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [])

    return <>
        {file.content.cells[0].diffNew ? (<>
            <div className="flex items-center justify-around">
                <Button
                    variant="ghost"
                    id="reject-changes-btn"
                    className="text-sm p-2 h-5 rounded-none bg-none hover:bg-transparent text-destructive-foreground/40 hover:text-destructive-foreground/80"
                    onClick={() => {
                        if (file && project) {
                            const updatedContent = {
                                ...file.content,
                                cells: {
                                    ...file.content.cells,
                                    "0": {
                                        ...file.content.cells[0],
                                        diffNew: undefined
                                    }
                                }
                            };
                            manager.updateFile(project, { file, content: updatedContent });
                        }
                    }}
                >
                    Reject Changes {/Mac/.test(navigator.userAgent) ? '⌘⌫' : 'Ctrl+⌫'}
                </Button>
                <Button
                    variant="ghost"
                    id="accept-changes-btn"
                    className="text-sm p-2 h-5 rounded-none bg-none hover:bg-transparent text-primary/60 hover:text-primary"
                    onClick={() => {
                        if (file && project) {
                            const updatedContent = {
                                ...file.content,
                                cells: {
                                    ...file.content.cells,
                                    "0": {
                                        ...file.content.cells[0],
                                        code: file.content.cells[0].diffNew || "",
                                        diffNew: undefined
                                    }
                                }
                            };
                            manager.updateFile(project, { file, content: updatedContent });
                        }
                    }}
                >
                    Accept Changes {/Mac/.test(navigator.userAgent) ? '⌘⏎' : 'Ctrl⏎'}
                </Button>
            </div>
            <DiffEditor
                language={file && file.language}
                options={diffMonacoConfig}
                className="font-btr-code"
                height="100%"
                width="100%"
                onMount={(editor, monaco) => {
                    monaco.editor.defineTheme(
                        "notebook",
                        notebookTheme as editor.IStandaloneThemeData
                    );
                    if (theme == "dark") monaco.editor.setTheme("notebook");
                    else monaco.editor.setTheme("vs-light");

                    // // Add keyboard shortcuts for accept/reject changes
                    // editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                    //     document.getElementById("accept-changes-btn")?.click();
                    // });

                    // editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Backspace, () => {
                    //     document.getElementById("reject-changes-btn")?.click();
                    // });

                    editor.getContainerDomNode().addEventListener("keydown", (e) => {
                        if (e.metaKey && e.key == "Enter") {
                            e.preventDefault()
                            e.stopPropagation()
                            document.getElementById("accept-changes-btn")?.click();
                        } else if (e.metaKey && e.key == "Backspace") {
                            e.preventDefault()
                            e.stopPropagation()
                            document.getElementById("reject-changes-btn")?.click();
                        }
                    })

                    const vimMode = localStorage.getItem("vimMode") == "true"
                    if (vimMode) {
                        console.log("vimMode", vimMode)
                        // setup monaco-vim
                        // @ts-ignore
                        window.require.config({
                            paths: {
                                "monaco-vim": "https://unpkg.com/monaco-vim/dist/monaco-vim"
                            }
                        });

                        // @ts-ignore
                        window.require(["monaco-vim"], function (MonacoVim) {
                            const statusNode = document.querySelector(`#vim-status`);
                            // const statusNode = document.getElementById(`vim-status`) as HTMLDivElement
                            const vim = MonacoVim.initVimMode(editor, statusNode)
                            console.log(vim)
                        });
                    }
                }}
                original={file.content.cells[0].code}
                modified={file.content.cells[0].diffNew}
            />
        </>
        ) : (
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

                    const vimMode = localStorage.getItem("vimMode") == "true"
                    if (vimMode) {
                        console.log("vimMode", vimMode)
                        // setup monaco-vim
                        // @ts-ignore
                        window.require.config({
                            paths: {
                                "monaco-vim": "https://unpkg.com/monaco-vim/dist/monaco-vim"
                            }
                        });

                        // @ts-ignore
                        window.require(["monaco-vim"], function (MonacoVim) {
                            const statusNode = document.querySelector(`#vim-status`);
                            // const statusNode = document.getElementById(`vim-status`) as HTMLDivElement
                            const vim = MonacoVim.initVimMode(editor, statusNode)
                            console.log(vim)
                        });
                    }

                    // set font family
                    // editor.updateOptions({ fontFamily: "DM Mono" });
                    // monaco.editor.remeasureFonts();
                    // run function on shift+enter
                    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
                        // runNormalCode();
                        document.getElementById("run-code-btn")?.click();
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
        )}
    </>
}