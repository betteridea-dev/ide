import { Button } from "@/components/ui/button";
import { useGlobalState } from "@/hooks";
import useProjectManager, { PFile, ProjectManager, Project } from "@/hooks/useProjectManager";
import { runLua } from "@/lib/ao-vars";
import { DiffEditor, Editor, useMonaco } from "@monaco-editor/react";
import { sendGAEvent } from "@next/third-parties/google";
import { editor } from "monaco-editor";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Check, ChevronsDownUpIcon, ChevronsUpDown, Edit, FoldVertical, LoaderIcon, Play, SquareCheckBig, Trash2, UnfoldVertical } from "lucide-react";
import { capOutputTo200Lines } from "@/lib/utils";
import Ansi from "ansi-to-react";
import notebookTheme from "@/monaco-themes/notebook.json";
import Markdown from "react-markdown";
import Latex from "react-latex-next";
import remarkGfm from "remark-gfm";
import { v4 } from "uuid";
import dynamic from "next/dynamic";
import runIcon from "@/assets/icons/run.svg";

const Plot = dynamic(
    () =>
        import('react-plotly.js'),
    {
        ssr: false,
        loading: () => <>Loading Graph...</>,
    },
);

const monacoConfig: editor.IStandaloneEditorConstructionOptions = {
    fontSize: 14,
    inlineSuggest: { enabled: true },
    fontFamily: "monospace",
    minimap: { enabled: false },
    // lineNumbers: "off",
    lineHeight: 20,
    lineNumbersMinChars: 2,
    scrollBeyondLastLine: false,
    scrollBeyondLastColumn: 10,
    scrollbar: {
        vertical: "hidden", horizontal: "hidden",
        alwaysConsumeMouseWheel: false
    },
    renderLineHighlight: "none",
    smoothScrolling: true,
}

const diffMonacoConfig: editor.IDiffEditorConstructionOptions = {
    ...monacoConfig,
    renderSideBySide: false,
}

const CodeCell = ({
    file,
    cellId,
    manager,
    project
}: {
    file: PFile;
    cellId: string;
    manager: ProjectManager;
    project: Project;
}) => {
    const [mouseHovered, setMouseHovered] = useState(false);
    const [running, setRunning] = useState(false);
    const [showGfx, setShowGfx] = useState(false);
    const [expand, setExpand] = useState(false);
    const cell = file.content.cells[cellId];
    const [code, setCode] = useState("");
    const { theme } = useTheme();
    const monaco = useMonaco();
    const globalState = useGlobalState();
    const thisEditor = useRef<editor.IStandaloneCodeEditor>()
    const [active, setActive] = useState(false)

    const runCellCode = async () => {
        // get file state, run code get output, read latest file state and add output
        console.log("running cell code", cellId);
        const p = manager.getProject(project.name);
        const file = p.files[globalState.activeFile];
        if (!file) return
        const cell = file.content.cells[cellId];
        const prc = file.process || p.process;
        const isFileProcess = prc == file.process

        console.log(p);
        if (!p.process)
            return toast.error("No process for this project :(\nPlease assign a process id from project settings before trying to run Lua code")
        const ownerAddress = p.ownerWallet;
        const activeAddress = await window.arweaveWallet.getActiveAddress();
        const shortAddress = ownerAddress.slice(0, 5) + "..." + ownerAddress.slice(-5);
        // if (ownerAddress != activeAddress) return toast({ title: "The owner wallet for this project is differnet", description: `It was created with ${shortAddress}.\nSome things might be broken` })
        if (ownerAddress != activeAddress) return toast.error(`The owner wallet for this project is differnet\nIt was created with ${shortAddress}.\nSome things might be broken`)
        console.log("running", cell.code);
        setRunning(true);
        const fileContent = { ...file.content };
        const result = await runLua(cell.code, prc, [
            { name: "File-Type", value: "Notebook" }
        ]);
        console.log(result);
        globalState.appendHistory(project.name, { id: (result as any).id!, code: cell.code, timestamp: Date.now(), output: result.Output.data });

        // const fileContent = {...manager.getProject(project.name).getFile(file.name).content};


        // @ts-ignore
        if (result.Error || result.error) {
            // @ts-ignore
            console.log(result.Error || result.error);
            // @ts-ignore
            fileContent.cells[cellId].output = result.Error || result.error;
            globalState.setLastOutput("\x1b[1;31m" + result.Error);
            // @ts-ignore
            // toast({ title: "Error", description: result.Error || result.error })
            toast.error(result.Error || result.error)
        } else {
            !isFileProcess && globalState.setPrompt(result.Output.prompt || result.Output.data.prompt || globalState.prompt)
            const outputData = result.Output.data;
            if (typeof outputData == "string" || typeof outputData == "number") {
                console.log(outputData);
                fileContent.cells[cellId].output = outputData;
                globalState.setLastOutput(outputData as string);
            } else if (outputData.output) {
                console.log(outputData.output);
                try {
                    const parsedData = JSON.parse(outputData.output);
                    fileContent.cells[cellId].output = parsedData;
                    globalState.setLastOutput(outputData.output);
                    console.log(fileContent.cells[cellId].output)
                    setShowGfx(parsedData.__render_gfx || false);
                }
                catch {
                    fileContent.cells[cellId].output = outputData.output;
                    globalState.setLastOutput(outputData.output);
                    setShowGfx(false);
                }
            } else if (outputData.json) {
                console.log(outputData.json);
                fileContent.cells[cellId].output = JSON.stringify(
                    outputData.json,
                    null,
                    2
                );
                globalState.setLastOutput(JSON.stringify(outputData.json, null, 2));
            }
        }
        manager.updateFile(project, { file, content: fileContent });
        console.log("done running");
        sendGAEvent({ event: 'run_code', value: 'notebook' })
        sendGAEvent('run_code', "buttonClicked", { value: "notebook" })
        setRunning(false);
        // event('run_code')
    }

    useEffect(() => {
        // event handler for cmd+enter and cmd+esc to accept/reject changes
        function handleKeyDown(e: KeyboardEvent) {
            if (e.metaKey && e.key == "Enter") {
                document.getElementById(`accept-changes-btn-${cellId}`)?.click()
            } else if (e.metaKey && e.key == "Backspace") {
                document.getElementById(`reject-changes-btn-${cellId}`)?.click()
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [cellId])

    return (
        <div
            className="rounded-md relative bg-accent/60 flex flex-col border border-border/30"
            data-cellid={cellId}
            onMouseEnter={() => setMouseHovered(true)}
            onMouseLeave={() => setMouseHovered(false)}
        >
            {/* buttons that appear on hover */}
            {mouseHovered && (
                <div className="absolute  flex justify-center items-center -top-3.5 right-10 z-10 border border-dashed rounded-full p-0.5 px-1 bg-accent">
                    <Button
                        variant="ghost"
                        className="p-0 h-6 px-1 rounded-full"
                        onClick={() => {
                            const newContent = { ...file.content };
                            delete newContent.cells[cellId];
                            newContent.cellOrder = newContent.cellOrder.filter(
                                (id) => id !== cellId
                            );
                            manager.updateFile(project, { file, content: newContent });
                        }}
                    >
                        {/* <Image src={} alt="Delete" width={20} height={20} className="invert dark:invert-0" /> */}
                        <Trash2 size={20} className="" />
                    </Button>
                    <Button variant="ghost" onClick={() => setExpand(!expand)}
                        className="p-0 h-6 px-1 rounded-full">
                        {expand ? <ChevronsDownUpIcon size={20} className="" /> :
                            <ChevronsUpDown size={20} className="" />}
                    </Button>
                </div>
            )}
            <div className="flex h-fit relative justify-start rounded-t-md border-b border-border/30 min-h-[69px] overflow-clip">
                <Button
                    variant="ghost"
                    className="p-5 h-full rounded-l rounded-b-none rounded-r-none min-w-[50px] grow flex items-center justify-center"
                    onClick={runCellCode}
                    id={`run-cell-${cellId}`}
                >
                    {/* <Image
                        src={running ? Icons.loadingSVG : Icons.runSVG}
                        alt="Run"
                        data-running={running}
                        width={30}
                        height={30}
                        className="data-[running=true]:animate-spin bg-foreground/15  rounded-full p-1.5 block min-w-[30px]"
                    /> */}
                    {running ? <LoaderIcon size={30} className="bg-foreground/15 rounded-full p-1.5 block min-w-[30px] animate-spin text-primary" /> :
                        // <Play size={30} className="block min-w-[30px]" />
                        <div><Image draggable={false} src={runIcon} alt="Run" width={30} height={30} className="block min-w-[25px] bg-foreground/10 rounded-full p-1.5" /></div>
                    }
                </Button>
                <div className="w-full h-full text-xs grow relative bg-background">
                    {cell.diffNew ? <>
                        <div className="flex items-center justify-start">
                            <Button
                                variant="ghost"
                                id={`reject-changes-btn-${cellId}`}
                                className="text-sm p-2 h-5 rounded-none bg-none hover:bg-transparent text-destructive-foreground/40 hover:text-destructive-foreground/80"
                                onClick={() => {
                                    if (file && project) {
                                        console.log("reject changes")
                                        const newContent = { ...file.content };
                                        // clear the diffNew value
                                        newContent.cells[cellId].diffNew = undefined
                                        manager.updateFile(project, { file, content: newContent });
                                    }
                                }}
                            >
                                Reject Changes {/Mac/.test(navigator.userAgent) ? '⌘⌫' : 'Ctrl+⌫'}
                            </Button>
                            <Button
                                variant="ghost"
                                id={`accept-changes-btn-${cellId}`}
                                className="text-sm p-2 h-5 rounded-none bg-none hover:bg-transparent text-primary/60 hover:text-primary"
                                onClick={() => {
                                    if (file && project) {
                                        console.log("accept changes")
                                        const newContent = { ...file.content };
                                        // set the code to the diffNew value and clear the diffNew value
                                        newContent.cells[cellId].code = newContent.cells[cellId].diffNew
                                        newContent.cells[cellId].diffNew = undefined
                                        manager.updateFile(project, { file, content: newContent });
                                    }
                                }}
                            >
                                Accept Changes {/Mac/.test(navigator.userAgent) ? '⌘⏎' : 'Ctrl⏎'}
                            </Button>
                        </div>
                        <DiffEditor
                            data-cellId={cellId}
                            original={cell.code}
                            modified={cell.diffNew}
                            language="lua"
                            options={diffMonacoConfig}
                            height={
                                2 * (expand ? Math.max(cell.code.split("\n").length * 20, 60) :
                                    (cell.code.split("\n").length > 15 ? 15 * 20 : Math.max((cell.code.split("\n").length) * 20, 60)))
                            }
                            onMount={(editor, monaco) => {
                                monaco.editor.defineTheme(
                                    "notebook",
                                    notebookTheme as editor.IStandaloneThemeData
                                );
                                if (theme == "dark") monaco.editor.setTheme("notebook");
                                else monaco.editor.setTheme("vs-light");

                                editor.getContainerDomNode().addEventListener("keydown", async (e) => {
                                    if (e.metaKey && e.key == "Enter") {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        document.getElementById(`accept-changes-btn-${cellId}`)?.click()
                                    } else if (e.metaKey && e.key == "Backspace") {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        document.getElementById(`reject-changes-btn-${cellId}`)?.click()
                                    }
                                })
                            }}
                        /></> : <Editor
                        data-cellId={cellId}
                        onMount={(editor, monaco) => {
                            thisEditor.current = editor
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
                                    const statusNode = document.querySelector(`#status-${cellId}`);
                                    // const statusNode = document.getElementById(`vim-status`) as HTMLDivElement
                                    const vim = MonacoVim.initVimMode(editor, statusNode)
                                    console.log(vim)
                                });
                            }

                            // add command only to this particular cell
                            editor.getContainerDomNode().addEventListener("keydown", async (e) => {
                                if (e.shiftKey && e.key == "Enter" && !e.metaKey) {
                                    e.preventDefault()
                                    const runbtn = document.getElementById(`run-cell-${cellId}`)
                                    runbtn?.click()
                                }
                            })

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
                        onChange={(value) => {
                            // console.log(value);
                            const newContent = { ...file.content };
                            newContent.cells[cellId] = { ...cell, code: value };
                            manager.updateFile(project, { file, content: newContent });
                            setActive(true)
                        }}
                        height={
                            expand ? Math.max(cell.code.split("\n").length * 20, 60) :
                                (cell.code.split("\n").length > 15 ? 15 * 20 : Math.max((cell.code.split("\n").length) * 20, 60))
                        }
                        width="100%"
                        className="min-h-[60px] block py-0 font-btr-code overflow-y-clip"
                        value={cell.code}
                        defaultValue={cell.code}
                        language={file.language}
                        options={monacoConfig}
                    />}
                    <div id={`status-${cellId}`} className="h-fit text-[10px] grow ml-10 z-20 bg-inherit w-fit text-left flex items-start justify-start"></div>
                </div>
            </div>
            {cell.output && cell.output.__render_gfx ? <div className="relative w-full flex items-center justify-center ">
                <Plot className={"rounded-lg mx-auto"} data={cell.output.data}
                    layout={{
                        ...cell.output.layout,
                        dragmode: "pan",
                        plot_bgcolor: "white",
                        paper_bgcolor: "transparent",
                        font: { color: theme == "dark" ? "#999" : "#000" },
                    }} config={{
                        scrollZoom: false,
                        displayModeBar: "hover",
                        displaylogo: false,
                        modeBarButtons: [["zoomIn2d"], ["zoomOut2d"], ["autoScale2d"], ["resetScale2d"], ["pan2d"], ["zoom2d"]],
                    }} />
            </div> : <div className="flex">
                <div className="w-20 text-center flex items-start mt-3 justify-center text-muted-foreground/25 text-[10px]">[ cell {file.content.cellOrder.indexOf(cellId) + 1} ]</div><pre className="w-full text-sm font-btr-code max-h-[250px] min-h-[40px] overflow-scroll p-2">
                    {<Ansi useClasses className="font-btr-code">{`${capOutputTo200Lines(typeof cell.output == "object" ? JSON.stringify(cell.output, null, 2) : cell.output as string)}`}</Ansi>}
                </pre>
            </div>}
        </div>
    );
};

const VisualCell = (
    { file, cellId, manager, project }: { file: PFile; cellId: string; manager: ProjectManager; project: Project }
) => {
    const [mouseHovered, setMouseHovered] = useState(false);
    const [editing, setEditing] = useState(file.content.cells[cellId].editing);
    const [clickCount, setClickCount] = useState(0);
    const [expand, setExpand] = useState(false);
    const { theme } = useTheme();

    const cellType = file.content.cells[cellId].type

    function checkDoubleClick() {
        if (editing) return
        setClickCount(clickCount + 1);
        setTimeout(() => {
            if (clickCount == 1) {
                setEditing(true);
            }
            setClickCount(0);
        }, 200);
    }

    return <div data-editing={editing} className="rounded-md relative bg-accent/30"
        onMouseEnter={() => setMouseHovered(true)}
        onMouseLeave={() => setMouseHovered(false)}
    >
        {/* buttons that appear on hover */}
        {mouseHovered && (
            <div className="absolute flex justify-center items-center -top-3.5 right-10 z-10 border border-dashed bg-accent rounded-full p-0.5 px-1">
                <Button
                    variant="ghost"
                    className="h-6 px-1 rounded-full"
                    onClick={(e) => {
                        e.stopPropagation()
                        setEditing(!editing);
                        const newContent = { ...file.content };
                        newContent.cells[cellId].editing = !editing;
                        manager.updateFile(project, { file, content: newContent });
                    }}
                >
                    {/* <Image src={editing ? Icons.tickSVG : Icons.editSVG} alt="Save Markdown" width={20} height={20} className="invert dark:invert-0" /> */}
                    {
                        editing ? <SquareCheckBig size={20} className="" /> : <Edit size={20} className="" />
                    }
                </Button>
                <Button
                    variant="ghost"
                    className="p-0 h-6 px-1 rounded-full"
                    onClick={() => {
                        const newContent = { ...file.content };
                        delete newContent.cells[cellId];
                        newContent.cellOrder = newContent.cellOrder.filter(
                            (id) => id !== cellId
                        );
                        manager.updateFile(project, { file, content: newContent });
                    }}
                >
                    {/* <Image src={Icons.deleteSVG} alt="Delete" width={20} height={20} className="invert dark:invert-0" /> */}
                    <Trash2 size={20} className="" />
                </Button>
                <Button variant="ghost" onClick={() => setExpand(!expand)}
                    className="p-0 h-6 px-1 rounded-full">
                    {expand ? <ChevronsDownUpIcon size={20} className="" /> :
                        <ChevronsUpDown size={20} className="" />}
                </Button>
            </div>
        )}
        {editing ? <div className="min-h-[69px] m-0.5 rounded-sm overflow-clip bg-background">
            <Editor
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
                    // run function on ctrl+enter
                    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
                        setEditing(false);
                    });
                    editor.focus();

                    const vimMode = localStorage.getItem("vimMode") == "true"
                    if (vimMode) {
                        // @ts-ignore
                        window.require.config({
                            paths: {
                                "monaco-vim": "https://unpkg.com/monaco-vim/dist/monaco-vim"
                            }
                        });

                        // @ts-ignore
                        window.require(["monaco-vim"], function (MonacoVim) {
                            const statusNode = document.querySelector(`#status-${cellId}`);
                            const vim = MonacoVim.initVimMode(editor, statusNode)
                        });
                    }
                }}
                onChange={(value) => {
                    // console.log(value);
                    const newContent = { ...file.content };
                    newContent.cells[cellId] = { ...file.content.cells[cellId], code: value };
                    manager.updateFile(project, { file, content: newContent });
                }}
                // height={
                //     expand ? file.content.cells[cellId].code.split("\n").length * 20 :
                //         (file.content.cells[cellId].code.split("\n").length > 15
                //             ? 15
                //             : file.content.cells[cellId].code.split("\n").length) * 20
                // }
                height={
                    expand ? Math.max(file.content.cells[cellId].code.split("\n").length * 20, 60) :
                        (file.content.cells[cellId].code.split("\n").length > 15 ? 15 * 20 : Math.max((file.content.cells[cellId].code.split("\n").length) * 20, 60))
                }
                width="100%"
                className="min-h-[60px] block font-btr-code overflow-y-clip !rounded-sm"
                value={file.content.cells[cellId].code}
                defaultValue={file.content.cells[cellId].code}
                language={file.content.cells[cellId].type == "MARKDOWN" ? "markdown" : "latex"}
                options={monacoConfig}
            />
            <div id={`status-${cellId}`} className="h-fit text-[10px] ml-10 grow z-20 w-fit bg-inherit text-left flex items-start justify-start"></div>
        </div> : <div className="markdown m-5" onClick={checkDoubleClick}>
            {cellType == "MARKDOWN" ? <Markdown remarkPlugins={[remarkGfm]} components={{ a: ({ node, ...props }) => <a {...props} className="text-primary hover:underline" /> }}>
                {file.content.cells[cellId].code}
            </Markdown> :
                <Latex>{file.content.cells[cellId].code}</Latex>
            }
        </div>}
    </div>
}

const CellUtilButtons = ({ defaultVisible = false, position, addNewCell }: { defaultVisible?: boolean, position: number, addNewCell: (foo?: number, type?: "CODE" | "MARKDOWN" | "LATEX") => void }) => {
    const [visible, setVisible] = useState(defaultVisible);
    return <div className="relative" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(defaultVisible)}>
        <div data-visible={visible}
            className="h-3.5 w-5/6 mx-auto relative gap-2 text-center flex items-center text-btr-grey-1 z-10 overflow-visible text-xs justify-center data-[visible=true]:visible data-[visible=false]:invisible">
            <div className="grow h-[1px] bg-btr-grey-1"></div>
            <Button variant="ghost" className="h-6 hover:ring-1 ring-btr-grey-1" onClick={() => addNewCell(position)}>+ Code</Button>
            <Button variant="ghost" className="h-6 hover:ring-1 ring-btr-grey-1" onClick={() => addNewCell(position, "MARKDOWN")}>+ Markdown</Button>
            <Button variant="ghost" className="h-6 hover:ring-1 ring-btr-grey-1" onClick={() => addNewCell(position, "LATEX")}>+ Latex</Button>
            <div className="grow h-[1px] bg-btr-grey-1"></div>
        </div>
        <div data-visible={visible} className="h-[1px] w-[20px] mx-auto absolute left-0 right-0 top-2 bg-btr-grey-2 data-[visible=true]:invisible"></div>
    </div>
}

export default function NotebookEditor() {
    const globalState = useGlobalState();
    const manager = useProjectManager();

    const project = manager.getProject(globalState.activeProject);
    const file = project.files[globalState.activeFile];

    function addNewCell(position?: number, type?: "CODE" | "MARKDOWN" | "LATEX") {
        const p = manager.getProject(globalState.activeProject);
        const f = p.getFile(globalState.activeFile);

        if (typeof position == "undefined") position = f.content.cellOrder.length;
        if (!type) type = "CODE";

        const oldContent = f.content;
        const id = v4();
        const newCellContent = {
            code: type == "CODE" ? 'print("Hello AO!")' : type == "MARKDOWN" ? "# Hello AO!" : `The LaTeX cell supports adding Math equations through MathTex syntax

$$\\int_a^b f'(x) dx = f(b)- f(a)$$`,
            output: "",
            type: type,
            editing: true
        };

        const newContent = {
            cells: {
                ...oldContent.cells,
                [id]: newCellContent
            },
            cellOrder: [...oldContent.cellOrder.slice(0, position), id, ...oldContent.cellOrder.slice(position)],
        };
        manager.updateFile(p, { file: f, content: newContent });
    }

    return <div className="h-full w-full relative overflow-y-scroll overflow-x-clip flex flex-col gap-2 p-4">
        {file.content.cellOrder.map((cellId, index) => {
            const cellType = file?.content?.cells[cellId!]?.type
            if (!cellType) return
            return <>
                <CellUtilButtons key={"util-" + index.toString()} position={index} addNewCell={addNewCell} />
                {(cellType == "MARKDOWN" || cellType == "LATEX") ?
                    <VisualCell
                        key={index}
                        file={file}
                        cellId={cellId}
                        manager={manager}
                        project={project}
                    /> : <CodeCell
                        key={index}
                        file={file}
                        cellId={cellId}
                        manager={manager}
                        project={project}
                    />}
            </>
        })}
        <CellUtilButtons position={file.content.cellOrder.length} addNewCell={addNewCell} defaultVisible />
    </div>
}