import Image from "next/image";
import Head from "next/head";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { useState, useRef } from "react";
import TopBar from "@/components/top-bar";
import FileBar from "@/components/file-bar";
import SideBar from "@/components/side-bar";
import { useProjectManager } from "@/hooks";
import BottomTabBar from "@/components/bottom-tab-bar";
import { Editor } from "@monaco-editor/react";
import { useGlobalState } from "@/states";
import { Button } from "./ui/button";
import Icons from "@/assets/icons";
import notebookTheme from "@/monaco-themes/notebook.json";
import { editor } from "monaco-editor";
import { v4 } from "uuid";
import { PFile, Project, ProjectManager } from "@/hooks/useProjectManager";
import { runLua } from "@/lib/ao-vars";
import { toast } from "./ui/use-toast";
import BottomStatusbar from "@/components/bottom-statusbar";
import Ansi from "ansi-to-react";

const CodeCell = ({ file, cellId, manager, project }: { file: PFile; cellId: string; manager: ProjectManager; project: Project }) => {
  const [mouseHovered, setMouseHovered] = useState(false);
  const [running, setRunning] = useState(false);
  const cell = file.content.cells[cellId];

  async function runCode() {
    const p = manager.getProject(project.name);
    console.log(p);
    if (!p.process)
      return toast({
        title: "No process for this project :(",
        description: "Please assign a process id from project settings before trying to run Lua code",
      });
    console.log("running");
    setRunning(true);
    const result = await runLua(cell.code, p.process);
    console.log(result);
    const outputData = result.Output.data;
    const fileContent = { ...file.content };
    if (outputData.json != "undefined") {
      console.log(outputData.json);
      fileContent.cells[cellId].output = JSON.stringify(outputData.json, null, 2);
    } else {
      console.log(outputData.output);
      fileContent.cells[cellId].output = outputData.output;
    }
    manager.updateFile(project, { file, content: fileContent });
    setRunning(false);
  }

  return (
    <div className="rounded-md relative  flex flex-col bg-btr-grey-3" onMouseEnter={() => setMouseHovered(true)} onMouseLeave={() => setMouseHovered(false)}>
      {/* buttons that appear on hover */}
      {mouseHovered && (
        <div className="absolute h-8 -top-3.5 right-10 z-10 border border-dashed border-btr-grey-1 rounded-md p-0.5 px-1 bg-btr-grey-3">
          <Button
            variant="ghost"
            className="p-0 h-6 px-1"
            onClick={() => {
              const newContent = { ...file.content };
              delete newContent.cells[cellId];
              newContent.cellOrder = newContent.cellOrder.filter((id) => id !== cellId);
              manager.updateFile(project, { file, content: newContent });
            }}
          >
            <Image src={Icons.deleteSVG} alt="Delete" width={20} height={20} />
          </Button>
        </div>
      )}
      <div className="flex h-full relative justify-center rounded-t-md border-b border-btr-grey-2/70 min-h-[69px]">
        <Button variant="ghost" className="p-5 block h-full rounded-l rounded-b-none rounded-r-none min-w-[60px]" onClick={runCode}>
          <Image src={running ? Icons.loadingSVG : Icons.runSVG} alt="Run" data-running={running} width={30} height={30} className="data-[running=true]:animate-spin" />
        </Button>
        <Editor
          onMount={(editor, monaco) => {
            monaco.editor.defineTheme("notebook", notebookTheme as editor.IStandaloneThemeData);
            monaco.editor.setTheme("notebook");
          }}
          onChange={(value) => {
            // console.log(value);
            const newContent = { ...file.content };
            newContent.cells[cellId] = { ...cell, code: value };
            manager.updateFile(project, { file, content: newContent });
          }}
          height={(cell.code.split("\n").length > 10 ? 10 : cell.code.split("\n").length) * 20}
          width="94%"
          className="min-h-[68px] pt-1"
          value={cell.code}
          defaultValue={cell.code}
          language={file.language}
          options={{
            minimap: { enabled: false },
            // lineNumbers: "off",
            lineHeight: 20,
            lineNumbersMinChars: 2,
            scrollBeyondLastLine: false,
            scrollbar: { vertical: "hidden", horizontal: "hidden" },
            renderLineHighlight: "none",
          }}
        />
      </div>
      <pre className="w-full max-h-[250px] min-h-[40px] overflow-scroll p-2 ml-20 rounded-b-md">{<Ansi>{cell.output.toString()}</Ansi> || ""}</pre>
    </div>
  );
};

const EditorArea = ({ isNotebook, file, runCodeNormal, project, addNewCell }: { isNotebook: boolean; file: PFile; runCodeNormal: () => void; project: Project; addNewCell: () => void }) => {
  const globalState = useGlobalState();
  const manager = useProjectManager();

  return (
    <>
      {!isNotebook && file && (
        <div className="absolute h-10 overflow-clip flex items-center right-10 top-5 z-10 border border-dashed border-btr-grey-1 rounded-full p-0 bg-btr-grey-3">
          <Button variant="ghost" className="p-1" onClick={runCodeNormal}>
            <Image src={Icons.runSVG} width={30} height={30} alt="run button" />
          </Button>
        </div>
      )}
      {globalState.activeFile ? (
        <div data-notebook={isNotebook} className="h-full w-full relative overflow-y-scroll overflow-x-clip flex flex-col gap-4 data-[notebook=true]:p-4">
          {isNotebook ? (
            <>
              {Object.keys(file.content.cells).map((cellId, index) => (
                <CodeCell key={index} file={file} cellId={cellId} manager={manager} project={project} />
              ))}
              <Button variant="ghost" className="w-fit mx-auto" onClick={addNewCell}>
                + Add new cell
              </Button>
            </>
          ) : (
            <>
              <Editor
                height="100%"
                onMount={(editor, monaco) => {
                  monaco.editor.defineTheme("notebook", notebookTheme as editor.IStandaloneThemeData);
                  monaco.editor.setTheme("notebook");
                }}
                value={file ? file.content.cells[0].code : ""}
                onChange={(value) => {
                  const newContent = { ...file.content };
                  newContent.cells[0] = { ...file.content.cells[0], code: value };
                  manager.updateFile(project, { file, content: newContent });
                }}
                language={file.language}
              />
            </>
          )}
        </div>
      ) : (
        <div className="text-btr-grey-1">Open a file ^_^</div>
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

  const toggleBottombar = () => {
    const panel = bottombarRef.current;
    console.log(panel);
    if (panel) {
      if (bottombarCollapsed) panel.expand();
      else panel.collapse();
      setBottombarCollapsed(!bottombarCollapsed);
    }
  };

  const project = globalState.activeProject && manager.getProject(globalState.activeProject);

  if (globalState.activeFile && globalState.activeFile != "Settings") {
    var file = project.getFile(globalState.activeFile);
    var isNotebook = file && globalState.activeFile && file.type == "NOTEBOOK";
  }

  // console.log(isNotebook);

  function runCode() {}

  function addNewCell() {
    const p = manager.getProject(globalState.activeProject);
    const f = p.getFile(globalState.activeFile);
    const oldContent = f.content;
    const id = v4();
    const newContent = {
      cells: { ...oldContent.cells, [id]: { code: 'print("Hello World!")', output: "" } },
      cellOrder: [...oldContent.cellOrder, id],
    };
    manager.updateFile(p, { file: f, content: newContent });
  }

  return (
    <>
      <Head>
        <title>BetterIDEa</title>
      </Head>

      <TopBar />

      <main className="h-[calc(100vh-89px)]">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel collapsedSize={5} collapsible defaultSize={20} minSize={10} maxSize={20} id="file-panel" onCollapse={() => setSidebarCollapsed(true)} onExpand={() => setSidebarCollapsed(false)} className="flex flex-col">
            <SideBar collapsed={sidebarCollapsed} manager={manager} />
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={70} minSize={15} id="editor-panel" className="flex relative flex-col items-center justify-center">
                <FileBar />
                {globalState.activeFile == "Settings" ? <div className="h-full">settings</div> : <EditorArea isNotebook={isNotebook} file={file} runCodeNormal={runCode} project={project} addNewCell={addNewCell} />}
              </ResizablePanel>
              <ResizableHandle />

              <ResizablePanel ref={bottombarRef} onCollapse={() => setBottombarCollapsed(true)} onExpand={() => setBottombarCollapsed(false)} collapsible collapsedSize={5} defaultSize={20} minSize={10} id="terminal-panel" className="">
                <BottomTabBar collapsed={bottombarCollapsed} toggle={toggleBottombar} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>

        <BottomStatusbar />
      </main>
    </>
  );
}
