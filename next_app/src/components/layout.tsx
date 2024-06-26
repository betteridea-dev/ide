import Image from "next/image";
import Head from "next/head";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { useState, useRef, useEffect } from "react";
import TopBar from "@/components/top-bar";
import FileBar from "@/components/file-bar";
import SideBar from "@/components/side-bar";
import { useProjectManager } from "@/hooks";
import BottomTabBar from "@/components/bottom-tab-bar";
import { Editor, useMonaco } from "@monaco-editor/react";
import { useGlobalState } from "@/states";
import { Button } from "./ui/button";
import Icons from "@/assets/icons";
import notebookTheme from "@/monaco-themes/notebook.json";
import { editor } from "monaco-editor";
import { v4 } from "uuid";
import { PFile, Project, ProjectManager, TFileContent } from "@/hooks/useProjectManager";
import { runLua } from "@/lib/ao-vars";
import { toast } from "sonner"
import BottomStatusbar from "@/components/bottom-statusbar";
import Ansi from "ansi-to-react";
import SettingsTab from "@/components/settings-tab";
import { sendGAEvent } from '@next/third-parties/google'
import AOLanding from "./ao/landing";
import WarpLanding from "./warp/landing";
// import { event } from "nextjs-google-analytics";
// import { luaCompletionProvider } from "@/lib/monaco-completions";
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import Latex from 'react-latex-next';
import { useTheme } from "next-themes";

import dynamic from 'next/dynamic';
import { useRouter } from "next/router";
import { dryrun } from "@permaweb/aoconnect";
import { title } from "process";
import { capOutputTo200Lines } from "@/lib/utils";

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from "ai";
import { generateContext } from "@/lib/ai";
import { CompletionFormatter } from "@/lib/ai-completion-formatter";
import AllProjects from "./ao/all-projects";
import Packages from "./ao/packages";
import { specialFileTabs } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link";



const Plot = dynamic(
  () =>
    import('react-plotly.js'),
  {
    ssr: false,
    loading: () => <>Loading Graph...</>,
  },
);

const monacoConfig: {
  [key: string]: editor.IStandaloneEditorConstructionOptions
} = {
  CodeCell: {
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
  },
  CodeFile: {
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 20,
    lineNumbersMinChars: 3,
    scrollBeyondLastLine: false,
  }
}

const CodeCell = ({
  file,
  cellId,
  manager,
  project,
  inferenceFunction,
  aiSuggestions
}: {
  file: PFile;
  cellId: string;
  manager: ProjectManager;
  project: Project;
  inferenceFunction?: (textBeforeCursor: string, textBeforeCursorOnCurrentLine: string, range: {
    startLineNumber: number,
    startColumn: number,
    endLineNumber: number,
    endColumn: number
  }) => Promise<void>;
  aiSuggestions: AiSuggestion[]
}) => {
  const [mouseHovered, setMouseHovered] = useState(false);
  const [running, setRunning] = useState(false);
  const [showGfx, setShowGfx] = useState(false);
  const cell = file.content.cells[cellId];
  const [code, setCode] = useState("");
  const { theme } = useTheme();
  const monaco = useMonaco();
  const globalState = useGlobalState();
  const thisEditor = useRef<editor.IStandaloneCodeEditor>()
  const [active, setActive] = useState(false)
  const [generating, setGenerating] = useState(false)

  function generateAiSuggestions() {
    if(!thisEditor.current) return
    const val = thisEditor.current.getValue()
    const model = thisEditor.current.getModel()
    const position = thisEditor.current.getPosition()
    const currentLine = model.getLineContent(position.lineNumber)
    const offset = model.getOffsetAt(position)
    const textBeforeCursor = val.substring(0, offset - currentLine.length)
    const textBeforeCursorOnCurrentLine = currentLine.substring(0, position.column - 1)
    if (!textBeforeCursor) return
    setGenerating(true)
    inferenceFunction(textBeforeCursor, textBeforeCursorOnCurrentLine, {
      startLineNumber: position.lineNumber,
      startColumn: position.column,
      endLineNumber: position.lineNumber,
      endColumn: position.column
    })
    setGenerating(false)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (active) {
        generateAiSuggestions()
        setActive(false)
      }
    }, 1000)
    return () => clearInterval(interval)
  },[active])

  useEffect(() => {
    console.log("aiSuggestions", aiSuggestions)
    if (!monaco && !(aiSuggestions.length > 0)) return
    const cmp = monaco.languages.registerInlineCompletionsProvider("lua", {
      provideInlineCompletions(model, position, context, token) {
        const suggestionItems = aiSuggestions.filter(s => {
          return s.insertText.startsWith(model.getValueInRange(s.range))
        }).filter(s => {
          return s.range.startLineNumber == position.lineNumber && s.range.startColumn >= position.column - 3
        }).map(s => {
          return new CompletionFormatter(model, position).format(s.insertText, s.range)
        })

        console.log(suggestionItems)

        return Promise.resolve({
          items: suggestionItems
        })
      },
      freeInlineCompletions() { },
    })
    return () => cmp.dispose()
  }, [aiSuggestions, monaco])

  const runCellCode = async () => {
    // get file state, run code get output, read latest file state and add output
    console.log("running cell code", cellId);
    const p = manager.getProject(project.name);
    const file = p.files[globalState.activeFile];
    if (!file) return
    const cell = file.content.cells[cellId];

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
    const result = await runLua(cell.code, p.process, [
      { name: "File-Type", value: "Notebook" }
    ]);
    console.log(result);
    // const fileContent = {...manager.getProject(project.name).getFile(file.name).content};


    // @ts-ignore
    if (result.Error || result.error) {
      // @ts-ignore
      console.log(result.Error || result.error);
      // @ts-ignore
      fileContent.cells[cellId].output = result.Error || result.error;
      // @ts-ignore
      // toast({ title: "Error", description: result.Error || result.error })
      toast.error(result.Error || result.error)
    } else {
      const outputData = result.Output.data;
      if (outputData.output) {
        console.log(outputData.output);
        try {
          const parsedData = JSON.parse(outputData.output);
          fileContent.cells[cellId].output = parsedData;
          console.log(fileContent.cells[cellId].output)
          setShowGfx(parsedData.__render_gfx);
        }
        catch {
          fileContent.cells[cellId].output = outputData.output;
          setShowGfx(false);
        }
      } else if (outputData.json) {
        console.log(outputData.json);
        fileContent.cells[cellId].output = JSON.stringify(
          outputData.json,
          null,
          2
        );
      }
    }
    manager.updateFile(project, { file, content: fileContent });
    console.log("done running");
    sendGAEvent({ event: 'run_code', value: 'notebook' })
    sendGAEvent('run_code', "buttonClicked", { value: "notebook" })
    setRunning(false);
    // event('run_code')
  }

  return (
    <div
      className="rounded-md relative bg-accent/60 flex flex-col border border-border/30"
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
            <Image src={Icons.deleteSVG} alt="Delete" width={20} height={20} className="invert dark:invert-0" />
          </Button>
        </div>
      )}
      <div className="flex h-fit relative justify-center rounded-t-md border-b border-border/30 min-h-[69px] overflow-x-clip">
        <Button
          variant="ghost"
          className="p-5 h-full rounded-l rounded-b-none rounded-r-none min-w-[50px] grow flex items-center justify-center"
          onClick={runCellCode}
          id={`run-cell-${cellId}`}
        >
          <Image
            src={running ? Icons.loadingSVG : Icons.runSVG}
            alt="Run"
            data-running={running}
            width={30}
            height={30}
            className="data-[running=true]:animate-spin bg-foreground/15  rounded-full p-1.5 block min-w-[30px]"
          />
        </Button>
        <Editor
          data-cellId={cellId}
          onMount={(editor, monaco) => {
            thisEditor.current = editor
            monaco.editor.defineTheme(
              "notebook",
              notebookTheme as editor.IStandaloneThemeData
            );
            if (theme == "dark") monaco.editor.setTheme("notebook");
            else monaco.editor.setTheme("vs-light");
            // set font family
            // editor.updateOptions({ fontFamily: "DM Mono" });

            // add command only to this particular cell
            editor.getContainerDomNode().addEventListener("keydown", async (e) => {
              // console.log(e.key)
              if (e.shiftKey && e.key == "Enter" && !e.metaKey) {
                e.preventDefault()
                const runbtn = document.getElementById(`run-cell-${cellId}`)
                // console.log(cellId, runbtn)
                runbtn?.click()
              } else if (e.ctrlKey && e.key == ".") {
                e.preventDefault()
                generateAiSuggestions()
              }
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
            (cell.code.split("\n").length > 15 ? 15 : cell.code.split("\n").length) * 20
          }
          width="94%"
          className="min-h-[68px] pt-0 font-btr-code overflow-y-clip"
          value={cell.code}
          defaultValue={cell.code}
          language={file.language}
          options={monacoConfig.CodeCell}
        />
      </div>
      {cell.output.__render_gfx ? <div className="relative w-full flex items-center justify-center ">
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
      </div> : <pre className="w-full text-sm font-btr-code max-h-[250px] min-h-[40px] overflow-scroll p-2 ml-20">
        {<Ansi useClasses className="font-btr-code">{`${capOutputTo200Lines(typeof cell.output == "object" ? JSON.stringify(cell.output, null, 2) : cell.output as string)}`}</Ansi>}
      </pre>}
    </div>
  );
};

const VisualCell = (
  { file, cellId, manager, project }: { file: PFile; cellId: string; manager: ProjectManager; project: Project }
) => {
  const [mouseHovered, setMouseHovered] = useState(false);
  const [editing, setEditing] = useState(file.content.cells[cellId].editing);
  const [clickCount, setClickCount] = useState(0);
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
          <Image src={editing ? Icons.tickSVG : Icons.editSVG} alt="Save Markdown" width={20} height={20} className="invert dark:invert-0" />
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
          <Image src={Icons.deleteSVG} alt="Delete" width={20} height={20} className="invert dark:invert-0" />
        </Button>
      </div>
    )}
    {editing ? <div className="min-h-[69px]">
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
        }}
        onChange={(value) => {
          // console.log(value);
          const newContent = { ...file.content };
          newContent.cells[cellId] = { ...file.content.cells[cellId], code: value };
          manager.updateFile(project, { file, content: newContent });
        }}
        height={
          (file.content.cells[cellId].code.split("\n").length > 15
            ? 15
            : file.content.cells[cellId].code.split("\n").length) * 20
        }
        width="100%"
        className="min-h-[69px] block p-1 font-btr-code"
        value={file.content.cells[cellId].code}
        defaultValue={file.content.cells[cellId].code}
        language={file.content.cells[cellId].type == "MARKDOWN" ? "markdown" : "latex"}
        options={monacoConfig.CodeCell}
      />
    </div> : <div className="markdown m-5" onClick={checkDoubleClick}>
      {cellType == "MARKDOWN" ? <Markdown remarkPlugins={[remarkGfm]}>{file.content.cells[cellId].code}</Markdown> :
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

type AiSuggestion = {
  insertText: string,
  range: {
    startLineNumber: number,
    startColumn: number,
    endLineNumber: number,
    endColumn: number
  }
}

const EditorArea = ({
  isNotebook,
  file,
  project,
}: {
  isNotebook: boolean;
  file: PFile;
  project: Project;
}) => {
  const globalState = useGlobalState();
  const manager = useProjectManager();
  const [running, setRunning] = useState(false);
  const { theme } = useTheme();
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([])


  async function inferenceFunction(textBeforeCursor: string, textBeforeCursorOnCurrentLine: string, range: {
    startLineNumber: number,
    startColumn: number,
    endLineNumber: number,
    endColumn: number
  }) {
    const geminiApiKey = localStorage.getItem("geminiApiKey") || ""
    if (!geminiApiKey) {
      toast.error("No Gemini API key found\nPlease add your Gemini API key in the settings")
      throw new Error("No Gemini API key found")
    }

    const model = createGoogleGenerativeAI({
      apiKey: geminiApiKey,
    })("models/gemini-1.5-flash-latest")

    console.log(textBeforeCursor, textBeforeCursorOnCurrentLine, range)

    const res = await generateText({
      model,
      prompt: generateContext(textBeforeCursor, textBeforeCursorOnCurrentLine),
    })
    console.log(res.text)
    const newSuggestion = {
      insertText: res.text,
      range: {
        startLineNumber: range.startLineNumber,
        startColumn: range.startColumn,
        endLineNumber: range.endLineNumber + (res.text.match(/\n/g) || []).length,
        endColumn: range.endColumn + res.text.length
      }
    }
    setAiSuggestions((prev) => [...prev, newSuggestion])
    // setAiSuggestions((prev) => [...prev, res.text])
    // console.log(res.text)
    // return { current: res.text, all: [...aiSuggestions, res.text] }
  }

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



  async function runNormalCode() {
    const p = manager.getProject(project.name);
    if (!p.process)
      // return toast({
      //   title: "No process for this project :(",
      //   description:
      //     "Please assign a process id from project settings before trying to run Lua code",
      // });
      return toast.error("No process for this project :(\nPlease assign a process id from project settings before trying to run Lua code")
    const ownerAddress = p.ownerWallet;
    const activeAddress = await window.arweaveWallet.getActiveAddress();
    const shortAddress = ownerAddress.slice(0, 5) + "..." + ownerAddress.slice(-5);
    // if (ownerAddress != activeAddress) return toast({ title: "The owner wallet for this project is differnet", description: `It was created with ${shortAddress}.\nSome things might be broken` })
    if (ownerAddress != activeAddress) return toast.error(`The owner wallet for this project is differnet\nIt was created with ${shortAddress}.\nSome things might be broken`)


    console.log("running", file.content.cells[0].code);
    setRunning(true);
    const fileContent = { ...file.content };
    const result = await runLua(fileContent.cells[0].code, p.process, [
      { name: "File-Type", value: "Normal" }
    ]);
    console.log(result);
    if (result.Error) {
      console.log(result.Error);
      fileContent.cells[0].output = result.Error;
    } else {
      const outputData = result.Output.data;
      if (outputData.output) {
        console.log(outputData.output);
        fileContent.cells[0].output = outputData.output;
      } else if (outputData.json) {
        console.log(outputData.json);
        fileContent.cells[0].output = JSON.stringify(outputData.json, null, 2);
      }
    }
    manager.updateFile(project, { file, content: fileContent });
    setRunning(false);
    const address = await window.arweaveWallet.getActiveAddress()
    sendGAEvent({ event: 'run_code', value: 'warp' })
    // event('run_code', { label: "normal", userId: address })
  }

  return (
    <>
      {!isNotebook && file && (
        <div className="absolute h-10 overflow-clip flex items-center right-10 top-5 z-10 border border-dashed rounded-full p-0 bg-accent">
          <Button variant="ghost" className="p-1" onClick={runNormalCode}>
            <Image
              src={running ? Icons.loadingSVG : Icons.runSVG}
              width={25}
              height={25}
              data-running={running}
              className="data-[running=true]:animate-spin p-0.5"
              alt="run button"
            />
          </Button>
        </div>
      )}
      {globalState.activeFile ? (
        <div
          data-notebook={isNotebook}
          className="h-full w-full relative overflow-y-scroll overflow-x-clip flex flex-col gap-0.5 data-[notebook=true]:p-4"
        >
          {isNotebook ? (
            <>
              {/* {Object.keys(file.content.cells).map((cellId, index) => (
                <>
                  <CellUtilButtons key={index} position={index} addNewCell={addNewCell} />
                  <CodeCell
                    key={index}
                    file={file}
                    cellId={cellId}
                    manager={manager}
                    project={project}
                  /></>
              ))} */}
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
                      inferenceFunction={inferenceFunction}
                      aiSuggestions={aiSuggestions}
                    />}
                </>
              })}
              {/* <Button
                variant="ghost"
                className="w-fit mx-auto"
                onClick={() => addNewCell()}
              >
                + Add new cell
              </Button> */}
              <div className="mt-2"></div>
              <CellUtilButtons defaultVisible position={file.content.cellOrder.length} addNewCell={addNewCell} />
            </>
          ) : (
            <>
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
                    runNormalCode();
                  });
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
                options={monacoConfig.CodeFile}
              />
            </>
          )}
        </div>
      ) : (
        <div className="flex w-full h-full">
          <div>
            {globalState.activeMode == "AO" ? <AOLanding /> : <WarpLanding />}
          </div>
        </div>
      )}
    </>
  );
};

export default function Layout() {
  const manager = useProjectManager();
  const globalState = useGlobalState();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [bottombarCollapsed, setBottombarCollapsed] = useState(true);
  const [topbarCollapsed, setTopbarCollapsed] = useState(false);
  const bottombarRef = useRef<ImperativePanelHandle>(null);
  const [mounted, setMounted] = useState(false);
  const monaco = useMonaco();
  const router = useRouter();
  const projectManager = useProjectManager();
  const { theme } = useTheme()
  const { open } = router.query;

  // const readGetRequests = async () => {
  //   try {
  //     console.log("run")
  //     const { Error, Messages } = await dryrun({
  //       // process: "4_jJUtiNjq5Xrg8OMrEDo-_bud7p5vbSJh1e69VJ76U",
  //       process: "WSXUI2JjYUldJ7CKq9wE1MGwXs-ldzlUlHOQszwQe0s",
  //       tags: [{ name: "Read", value: "GET_REQUESTS" }],
  //     })
  //     console.log("yooo", Messages)
  //     if (Error) throw Error
  //     if (!Messages[0] || !Messages[0].Data) throw new Error("Unable to read the message")
  //     return Messages[0].Data
  //   } catch (error) {
  //     throw new Error(`Error in dryrun GET: ${error}`)
  //   }
  // }

  useEffect(() => {
    // readGetRequests()
    if (!mounted && monaco) {
      // monaco.languages.registerCompletionItemProvider("lua", luaCompletionProvider(monaco))
      setMounted(true)
    }
    if (monaco) {
      if (theme == "dark") monaco.editor.setTheme("notebook");
      else monaco.editor.setTheme("vs-light");
    }
    if (open && typeof projectManager.projects[open as string] != "undefined") {
      const p = projectManager.getProject(open as string);
      const files = p.files;
      globalState.setActiveProject(open as string);
      if (Object.keys(files).length > 0) globalState.setActiveFile(files[Object.keys(files)[0]].name);
      // reset query params
      router.push({ query: {} })

      // globalState.setActiveProject(open as string)
      // const files = projectManager.projects[open as string].files
      // console.log(files)
      // if (Object.keys(files).length > 0) globalState.setActiveFile(files[0].name)
    }

  }, [mounted, monaco, open, theme])

  const toggleBottombar = () => {
    const panel = bottombarRef.current;
    console.log(panel);
    if (panel) {
      if (bottombarCollapsed) panel.expand();
      else panel.collapse();
      setBottombarCollapsed(!bottombarCollapsed);
    }
  };

  useEffect(() => {
    bottombarRef.current.collapse();
  }, [])

  useEffect(() => {
    if (!globalState.activeProject) bottombarRef.current.collapse()
  }, [globalState.activeProject])

  const project =
    globalState.activeProject && manager.getProject(globalState.activeProject);

  if (globalState.activeFile && !specialFileTabs.includes( globalState.activeFile)) {
    var file = project.getFile(globalState.activeFile);
    var isNotebook = file && globalState.activeFile && file.name.endsWith(".luanb");
  }

  function switchTab(tab: string) {
    switch (tab) {
      case "Settings":
        return <SettingsTab />;
      case "AllProjects":
        return <AllProjects/>;
      case "Packages":
        return <Packages/>;
      default:
        return <EditorArea isNotebook={isNotebook} file={file} project={project} />;
    }
  }

  return (
    <>
      <Head>
        <title>{`BetterIDEa ${globalState.activeProject && ("| " + globalState.activeProject)}`}</title>
      </Head>

      {/* <TopBar /> */}
      <div className="h-[25px] border-b border-border/50 px-1 text-sm flex items-center overflow-clip">
        {/* <Button variant="ghost" className="p-1.5">Project</Button>
        <div className="grow"/>
        <Button variant="ghost" className="p-1.5">Help</Button> */}
        <Link href="/">
          <Image src="/icon.svg" alt="BetterIDEa" width={15} height={15} className="mx-1 h-[20px]" />
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" className="p-1.5">Project</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="ml-1 -mt-2">
            <DropdownMenuLabel>{project.name || <span className="text-muted">No Project Selected</span>}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Share</DropdownMenuItem>
            <DropdownMenuItem>Download</DropdownMenuItem>
            <DropdownMenuItem>Load Blueprint</DropdownMenuItem>
            <DropdownMenuItem onClick={()=>globalState.setActiveProject("")}>Close</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <main className="h-[calc(100vh-50px)] flex flex-row">
        {/* <div className="w-fit border-r"> */}
        <SideBar collapsed={sidebarCollapsed} manager={manager} setCollapsed={setSidebarCollapsed} />
        {/* </div> */}
        <div className="flex flex-col justify-start items-start grow h-full w-screen pl-[50px]">
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel
              defaultSize={70}
              minSize={10}
              onCollapse={() => setTopbarCollapsed(true)}
              onExpand={() => setTopbarCollapsed(false)}
              collapsible
              id="editor-panel"
              className="flex relative flex-col items-start justify-start"
            >
             {!specialFileTabs.includes(globalState.activeFile)&& <FileBar />}
              {/* 
              {globalState.activeFile == "Settings" ? (
                <SettingsTab />
              ) : (
                <EditorArea
                  isNotebook={isNotebook}
                  file={file}
                  project={project}
                />
              )} */}
              {
                // add a switch case to match Settings/AllProjects/Packages
                switchTab(globalState.activeFile)

              }
            </ResizablePanel>
            {<ResizableHandle data-hidden={globalState.activeProject ? false : true} className="data-[hidden=true]:invisible data-[hidden=true]:pointer-actions-none" />}

            <ResizablePanel
              ref={bottombarRef}
              onCollapse={() => setBottombarCollapsed(true)}
              onExpand={() => setBottombarCollapsed(false)}
              collapsible
              collapsedSize={4}
              minSize={15}
              defaultSize={35}
              id="terminal-panel"
              data-hidden={globalState.activeProject ? false : true}
              className="relative flex data-[hidden=true]:invisible"
            >
              <BottomTabBar
                collapsed={bottombarCollapsed}
                fullscreen={topbarCollapsed}
                toggle={toggleBottombar}
                setFullScreen={() => {
                  const panel = bottombarRef.current;
                  if (panel) {
                    if (bottombarCollapsed) panel.expand();
                    panel.resize(100);
                  }
                }}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
        {/* <ResizablePanelGroup direction="horizontal"> */}
        {/* <ResizablePanel
            collapsedSize={5}
            collapsible
            defaultSize={20}
            minSize={10}
            maxSize={20}
            id="file-panel"
            onCollapse={() => setSidebarCollapsed(true)}
            onExpand={() => setSidebarCollapsed(false)}
            className="flex flex-col"
          >
          </ResizablePanel>

          <ResizableHandle /> */}

        {/* <ResizablePanel> */}

        {/* </ResizablePanel> */}
        {/* </ResizablePanelGroup> */}
      </main>
      <div className="h-fit">
        <BottomStatusbar />
      </div>
    </>
  );
}
