import Head from "next/head";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useState } from "react";
import TopBar from "@/components/top-bar";
import FileBar from "@/components/file-bar";
import SideBar from "@/components/side-bar";
import { useProjectManager } from "@/hooks";

export default function IDE() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const manager = useProjectManager();

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
              <ResizablePanel defaultSize={70} minSize={15} id="editor-panel" onResize={console.log}>
                <FileBar />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={30} minSize={15} id="terminal-panel" onResize={console.log} className="p-2"></ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </>
  );
}
