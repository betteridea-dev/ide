import Image from "next/image";
import Head from "next/head";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useState } from "react";
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

const CodeCell = ({ file, cellId, manager, project }: { file: PFile; cellId: string; manager: ProjectManager; project: Project }) => {
  const [mouseHovered, setMouseHovered] = useState(false);
  const cell = file.content.cells[cellId];

  function runCode() {
    if (!project.process)
      return toast({
        title: "No process for this project :(",
        description: "Please assign a process id from project settings before trying to run Lua code",
      });
    console.log("running");
    const result = runLua(cell.code, project.process);
    console.log(result);
  }

  return (
    <div className="rounded-md relative  flex flex-col bg-btr-grey-3" onMouseEnter={() => setMouseHovered(true)} onMouseLeave={() => setMouseHovered(false)}>
      {/* buttons that appear on hover */}
      {mouseHovered && (
        <div className="absolute -top-3.5 right-10 z-10 border border-btr-grey-2 rounded-md p-0.5 px-1 bg-btr-grey-3">
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
            delete
          </Button>
        </div>
      )}
      <div className="flex h-full justify-center rounded-t-md border-b border-btr-grey-2/30 min-h-[69px]">
        <Button variant="ghost" className="p-5 h-full rounded-l rounded-b-none rounded-r-none min-w-[60px]" onClick={runCode}>
          <Image src={Icons.runSVG} alt="Run" width={30} height={30} />
        </Button>
        <Editor
          onMount={(editor, monaco) => {
            monaco.editor.defineTheme("notebook", notebookTheme as editor.IStandaloneThemeData);
            monaco.editor.setTheme("notebook");
          }}
          onChange={(value) => {
            console.log(value);
            const newContent = { ...file.content };
            newContent.cells[cellId] = { ...cell, code: value };
            manager.updateFile(project, { file, content: newContent });
          }}
          height={(cell.code.split("\n").length > 10 ? 10 : cell.code.split("\n").length) * 20}
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
      <div className="w-full p-2 pl-20 bg-white/10 rounded-b-md">output</div>
    </div>
  );
};

export default function Layout() {
  const manager = useProjectManager();
  const globalState = useGlobalState();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const project = globalState.activeProject && manager.getProject(globalState.activeProject);
  const file = globalState.activeFile && project.getFile(globalState.activeFile);

  const isNotebook = globalState.activeFile && file.type == "NOTEBOOK";
  // console.log(isNotebook);

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
              <ResizablePanel defaultSize={70} minSize={15} id="editor-panel" className="flex flex-col items-center justify-center">
                <FileBar />
                {globalState.activeFile ? (
                  <div data-notebook={isNotebook} className="h-full w-full overflow-scroll flex flex-col gap-4 data-[notebook=true]:p-4">
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
                      <Editor
                        height="100%"
                        onMount={(editor, monaco) => {
                          monaco.editor.defineTheme("notebook", notebookTheme as editor.IStandaloneThemeData);
                          monaco.editor.setTheme("notebook");
                        }}
                        value={file.content.cells[0].code}
                        onChange={(value) => {
                          const newContent = { ...file.content };
                          newContent.cells[0] = { ...file.content.cells[0], code: value };
                          manager.updateFile(project, { file, content: newContent });
                        }}
                        language={file.language}
                      />
                    )}
                  </div>
                ) : (
                  <div className="text-btr-grey-1">Open a file ^_^</div>
                )}
              </ResizablePanel>
              <ResizableHandle />

              <ResizablePanel defaultSize={30} minSize={15} id="terminal-panel" className="">
                <BottomTabBar />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>

        <BottomStatusbar />
      </main>
    </>
  );
}
