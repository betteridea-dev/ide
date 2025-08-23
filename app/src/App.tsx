import { fixConnection } from "@wauth/strategy";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";
import { useEffect, useRef } from "react";
import { useActiveAddress, useConnection } from "@arweave-wallet-kit/react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

import Menubar from "./components/menubar";
import Statusbar from "./components/statusbar";
import LeftSidebar from "./components/left-sidebar";
import Drawer from "./components/drawer";
import Terminal from "./components/terminal";
import { useGlobalState } from "./hooks/use-global-state";
import Settings from "./components/settings";
import Welcome from "./components/welcome";
import { useProjects } from "./hooks/use-projects";
import Editor from "./components/editor";
import type { ImperativePanelHandle } from "react-resizable-panels";

function Switcher() {
  const { activeView, activeProject, activeFile } = useGlobalState()

  if (activeView == "settings")
    return <Settings />

  if (activeProject == "" && activeFile == "") {
    return <Welcome />
  }


  return <Editor />
}

export default function App() {
  const address = useActiveAddress()
  const { disconnect, connected } = useConnection()
  const { activeDrawer: activeTab, drawerOpen } = useGlobalState()
  const drawerRef = useRef<ImperativePanelHandle>(null)

  useEffect(() => fixConnection(address, connected, disconnect), [address, connected, disconnect])

  useEffect(() => {
    if (drawerRef.current) {
      if (drawerOpen) {
        drawerRef.current.expand()
      } else {
        drawerRef.current.collapse()
      }
    }
  }, [drawerOpen])

  return (
    <div className="flex flex-col h-screen overflow-clip">
      <Menubar />
      <div className="flex grow">
        <LeftSidebar />
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={25} maxSize={40} minSize={3} collapsible ref={drawerRef}>
            <Drawer />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>

            <Switcher />



          </ResizablePanel>
        </ResizablePanelGroup>
        {/* <Drawer />
        <div className="grow">hi</div> */}
      </div>
      <Statusbar />
      <Toaster />
    </div>
  );
}