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
import { toast } from "./ui/use-toast";
import BottomStatusbar from "@/components/bottom-statusbar";
import Ansi from "ansi-to-react";
import SettingsTab from "@/components/settings-tab";
import { sendGAEvent } from '@next/third-parties/google'
import AOLanding from "./ao/landing";
import WarpLanding from "./warp/landing";
// import { event } from "nextjs-google-analytics";
import { luaCompletionProvider } from "@/lib/monaco-completions";
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import Latex from 'react-latex-next';
// import Plot from "react-plotly.js"

import dynamic from 'next/dynamic';
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
    minimap: { enabled: false },
    // lineNumbers: "off",
    lineHeight: 20,
    lineNumbersMinChars: 2,
    scrollBeyondLastLine: false,
    scrollbar: { vertical: "hidden", horizontal: "hidden" },
    renderLineHighlight: "none",
  },
  CodeFile: {
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
}: {
  file: PFile;
  cellId: string;
  manager: ProjectManager;
  project: Project;
}) => {
  const [mouseHovered, setMouseHovered] = useState(false);
  const [running, setRunning] = useState(false);
  const [showGfx, setShowGfx] = useState(false);
  const cell = file.content.cells[cellId];

  async function runCellCode() {
    const p = manager.getProject(project.name);
    console.log(p);
    if (!p.process)
      return toast({
        title: "No process for this project :(",
        description:
          "Please assign a process id from project settings before trying to run Lua code",
      });
    const ownerAddress = p.ownerWallet;
    const activeAddress = await window.arweaveWallet.getActiveAddress();
    const shortAddress = ownerAddress.slice(0, 5) + "..." + ownerAddress.slice(-5);
    if (ownerAddress != activeAddress) return toast({ title: "The owner wallet for this project is differnet", description: `It was created with ${shortAddress}.\nSome things might be broken` })
    console.log("running", cell.code);
    setRunning(true);
    const fileContent = { ...file.content };
    const result = await runLua(cell.code, p.process, [
      { name: "File-Type", value: "Notebook" }
    ]);
    console.log(result);
    if (result.Error) {
      console.log(result.Error);
      fileContent.cells[cellId].output = result.Error;
    } else {
      const outputData = result.Output.data;
      if (outputData.output) {
        console.log(outputData.output);
        try {
          const parsedData = JSON.parse(outputData.output);
          setShowGfx(parsedData.__render_gfx);
          fileContent.cells[cellId].output = parsedData;
          console.log(fileContent.cells[cellId].output)
        }
        catch {
          setShowGfx(false);
          fileContent.cells[cellId].output = outputData.output;
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
    setRunning(false);
    const address = await window.arweaveWallet.getActiveAddress()
    sendGAEvent({ event: 'run_code', value: 'notebook' })
    sendGAEvent('run_code', "buttonClicked", { value: "notebook" })
    // event('run_code')
  }

  return (
    <div
      className="rounded-md relative  flex flex-col bg-btr-grey-3"
      onMouseEnter={() => setMouseHovered(true)}
      onMouseLeave={() => setMouseHovered(false)}
    >
      {/* buttons that appear on hover */}
      {mouseHovered && (
        <div className="absolute  flex justify-center items-center -top-3.5 right-10 z-10 border border-dashed border-btr-grey-1 rounded-full p-0.5 px-1 bg-btr-grey-3">
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
            <Image src={Icons.deleteSVG} alt="Delete" width={20} height={20} />
          </Button>
        </div>
      )}
      <div className="flex h-full relative justify-center rounded-t-md border-b border-btr-grey-2/70 min-h-[69px]">
        <Button
          variant="ghost"
          className="p-5 block h-full rounded-l rounded-b-none rounded-r-none min-w-[60px]"
          onClick={runCellCode}
        >
          <Image
            src={running ? Icons.loadingSVG : Icons.runSVG}
            alt="Run"
            data-running={running}
            width={30}
            height={30}
            className="data-[running=true]:animate-spin"
          />
        </Button>
        <Editor
          onMount={(editor, monaco) => {
            monaco.editor.defineTheme(
              "notebook",
              notebookTheme as editor.IStandaloneThemeData
            );
            monaco.editor.setTheme("notebook");
            // set font family
            editor.updateOptions({ fontFamily: "DM mono" });
          }}
          onChange={(value) => {
            // console.log(value);
            const newContent = { ...file.content };
            newContent.cells[cellId] = { ...cell, code: value };
            manager.updateFile(project, { file, content: newContent });
          }}
          height={
            (cell.code.split("\n").length > 10
              ? 10
              : cell.code.split("\n").length) * 20
          }
          width="94%"
          className="min-h-[68px] pt-1 font-btr-code"
          value={cell.code}
          defaultValue={cell.code}
          language={file.language}
          options={monacoConfig.CodeCell}
        />
      </div>
      {cell.output.__render_gfx ? <div className="relative w-full flex items-center justify-center">
        <Plot className={"rounded-lg mx-auto"} data={cell.output.data}
          layout={{
            ...cell.output.layout,
            dragmode: "pan",
            plot_bgcolor: "transparent", paper_bgcolor: "#121212",
            font: { color: "#aaa" },
          }} config={{
            scrollZoom: false,
            displayModeBar: "hover",
            displaylogo: false,
            modeBarButtons: [["zoomIn2d"], ["zoomOut2d"], ["autoScale2d"], ["resetScale2d"], ["pan2d"], ["zoom2d"]],
          }} />
      </div> : <pre className="w-full text-sm font-btr-code max-h-[250px] min-h-[40px] overflow-scroll p-2 ml-20 rounded-b-md">
        {<Ansi useClasses className="font-btr-code">{`${cell.output}`}</Ansi>}
      </pre>}
    </div>
  );
};

const VisualCell = (
  { file, cellId, manager, project }: { file: PFile; cellId: string; manager: ProjectManager; project: Project }
) => {
  const [mouseHovered, setMouseHovered] = useState(false);
  const [editing, setEditing] = useState(false);

  const cellType = file.content.cells[cellId].type

  return <div data-editing={editing} className="rounded-md relative bg-transparent"
    onMouseEnter={() => setMouseHovered(true)}
    onMouseLeave={() => setMouseHovered(false)}
  >
    {/* buttons that appear on hover */}
    {mouseHovered && (
      <div className="absolute flex justify-center items-center -top-3.5 right-10 z-10 border border-dashed border-btr-grey-1 rounded-full p-0.5 px-1 bg-btr-grey-3">
        <Button
          variant="ghost"
          className="h-6 px-1 rounded-full"
          onClick={(e) => {
            e.stopPropagation()
            setEditing(!editing);
          }}
        >
          <Image src={editing ? Icons.tickSVG : Icons.editSVG} alt="Save Markdown" width={20} height={20} />
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
          <Image src={Icons.deleteSVG} alt="Delete" width={20} height={20} />
        </Button>
      </div>
    )}
    {editing ? <div className="min-h-[69px]">
      <Editor
        onMount={(editor, monaco) => {
          monaco.editor.defineTheme(
            "notebook",
            notebookTheme as editor.IStandaloneThemeData
          );
          monaco.editor.setTheme("notebook");
          // set font family
          editor.updateOptions({ fontFamily: "DM mono" });
        }}
        onChange={(value) => {
          // console.log(value);
          const newContent = { ...file.content };
          newContent.cells[cellId] = { ...file.content.cells[cellId], code: value };
          manager.updateFile(project, { file, content: newContent });
        }}
        height={
          (file.content.cells[cellId].code.split("\n").length > 10
            ? 10
            : file.content.cells[cellId].code.split("\n").length) * 20
        }
        width="94%"
        className="min-h-[69px] block pt-1 font-btr-code"
        value={file.content.cells[cellId].code}
        defaultValue={file.content.cells[cellId].code}
        language={file.content.cells[cellId].type == "MARKDOWN" ? "markdown" : "latex"}
        options={monacoConfig.CodeCell}
      />
    </div> : <div className="markdown m-5">
      {cellType == "MARKDOWN" ? <Markdown remarkPlugins={[remarkGfm]}>{file.content.cells[cellId].code}</Markdown> :
        <Latex>{file.content.cells[cellId].code}</Latex>
      }
    </div>}
  </div>
}

const CellUtilButtons = ({ position, addNewCell }: { position: number, addNewCell: (foo?: number, type?: "CODE" | "MARKDOWN" | "LATEX") => void }) => {
  const [visible, setVisible] = useState(false);
  return <div className="relative" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
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

  function addNewCell(position?: number, type?: "CODE" | "MARKDOWN" | "LATEX") {
    const p = manager.getProject(globalState.activeProject);
    const f = p.getFile(globalState.activeFile);

    if (typeof position == "undefined") position = f.content.cellOrder.length;
    if (!type) type = "CODE";

    const oldContent = f.content;
    const id = v4();
    const newCellContent = {
      code: type == "CODE" ? 'print("Hello AO!")' : type == "MARKDOWN" ? "# Hello AO!" : "New LaTeX Cell",
      output: "",
      type: type,
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
      return toast({
        title: "No process for this project :(",
        description:
          "Please assign a process id from project settings before trying to run Lua code",
      });
    const ownerAddress = p.ownerWallet;
    const activeAddress = await window.arweaveWallet.getActiveAddress();
    const shortAddress = ownerAddress.slice(0, 5) + "..." + ownerAddress.slice(-5);
    if (ownerAddress != activeAddress) return toast({ title: "The owner wallet for this project is differnet", description: `It was created with ${shortAddress}.\nSome things might be broken` })


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
        <div className="absolute h-10 overflow-clip flex items-center right-10 top-5 z-10 border border-dashed border-btr-grey-1 rounded-full p-0 bg-btr-grey-3">
          <Button variant="ghost" className="p-1" onClick={runNormalCode}>
            <Image
              src={running ? Icons.loadingSVG : Icons.runSVG}
              width={30}
              height={30}
              data-running={running}
              className="data-[running=true]:animate-spin"
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
                const cellType = file.content.cells[cellId].type
                return <>
                  <CellUtilButtons key={index} position={index} addNewCell={addNewCell} />
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
              {/* <Button
                variant="ghost"
                className="w-fit mx-auto"
                onClick={() => addNewCell()}
              >
                + Add new cell
              </Button> */}
              <CellUtilButtons position={file.content.cellOrder.length} addNewCell={addNewCell} />
            </>
          ) : (
            <>
              <Editor
                className="font-btr-code"
                height="100%"
                onMount={(editor, monaco) => {
                  monaco.editor.defineTheme(
                    "notebook",
                    notebookTheme as editor.IStandaloneThemeData
                  );
                  monaco.editor.setTheme("notebook");
                }}
                value={file ? file.content.cells[0].code : ""}
                onChange={(value) => {
                  const newContent = { ...file.content };
                  newContent.cells[0] = {
                    ...file.content.cells[0],
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
        <div className="text-btr-grey-1 h-full flex items-center">
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [bottombarCollapsed, setBottombarCollapsed] = useState(false);
  const bottombarRef = useRef<ImperativePanelHandle>(null);
  const [mounted, setMounted] = useState(false);
  const monaco = useMonaco();

  useEffect(() => {
    if (!mounted && monaco) {
      monaco.languages.registerCompletionItemProvider("lua", luaCompletionProvider(monaco))
      setMounted(true)
    }
  }, [mounted, monaco])

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

  const project =
    globalState.activeProject && manager.getProject(globalState.activeProject);

  if (globalState.activeFile && globalState.activeFile != "Settings") {
    var file = project.getFile(globalState.activeFile);
    var isNotebook = file && globalState.activeFile && file.type == "NOTEBOOK";
  }

  // console.log(isNotebook);

  return (
    <>
      <Head>
        <title>BetterIDEa</title>
      </Head>

      <TopBar />

      <main className="h-[calc(100vh-89px)]">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
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
            <SideBar collapsed={sidebarCollapsed} manager={manager} />
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel
                defaultSize={70}
                minSize={15}
                id="editor-panel"
                className="flex relative flex-col items-center justify-center"
              >
                <FileBar />
                {globalState.activeFile == "Settings" ? (
                  <SettingsTab />
                ) : (
                  <EditorArea
                    isNotebook={isNotebook}
                    file={file}
                    project={project}
                  />
                )}
              </ResizablePanel>
              <ResizableHandle />

              <ResizablePanel
                ref={bottombarRef}
                onCollapse={() => setBottombarCollapsed(true)}
                onExpand={() => setBottombarCollapsed(false)}
                collapsible
                collapsedSize={5}
                minSize={10}
                id="terminal-panel"
                className="relative flex"
              >
                <BottomTabBar
                  collapsed={bottombarCollapsed}
                  toggle={toggleBottombar}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>

        <BottomStatusbar />
      </main>
    </>
  );
}
