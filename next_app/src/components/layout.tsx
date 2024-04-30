import Image from "next/image";
import Head from "next/head";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useState } from "react";
import TopBar from "@/components/top-bar";
import FileBar from "@/components/file-bar";
import SideBar from "@/components/side-bar";
import { useProjectManager } from "@/hooks";
import BottomBar from "@/components/bottom-bar";
import { Editor } from "@monaco-editor/react";
import { useGlobalState } from "@/states";
import { Button } from "./ui/button";
import Icons from "@/assets/icons";
import notebookTheme from "@/monaco-themes/notebook.json";
import { editor } from "monaco-editor";
import { v4 } from "uuid";
import { PFile, Project, ProjectManager } from "@/hooks/useProjectManager";

const CodeCell = ({ file, cellId, manager, project }: { file: PFile; cellId: string; manager: ProjectManager; project: Project }) => {
  const cell = file.content.cells[cellId];
  return (
    <div className="min-h-[150px] rounded-md overflow-clip grid grid-rows-2 bg-btr-grey-3">
      <div className="flex grow h-full justify-center border-b border-btr-grey-2/30 min-h-[69px]">
        <Button variant="ghost" className="p-5 h-full rounded-none min-w-[60px]">
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
          height={(cell.code.split("\n").length > 20 ? 20 : cell.code.split("\n").length) * 20}
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
      <div className="w-full p-2 pl-20 bg-white/10">output</div>
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

      <main className="h-[calc(100vh-64px)]">
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

              <ResizablePanel defaultSize={30} minSize={15} id="terminal-panel" className="p-2">
                <BottomBar />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </>
  );
}
