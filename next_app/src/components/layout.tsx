import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import Sidebar from "./sidebar";
import SidebarDrawer from "./drawer";
import { useEffect, useRef, useState } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import View from "./views";
import Statusbar from "./statusbar";
import Menubar from "./menubar";
import { useGlobalState, useProjectManager } from "@/hooks";
import { NextSeo } from "next-seo"
import { useSearchParams } from "next/navigation";
import AiPanel from "./views/components/ai-panel";


export default function Layout() {
    const globalState = useGlobalState()
    const manager = useProjectManager()
    const sidebarDrawerRef = useRef<ImperativePanelHandle>();
    const searchParams = useSearchParams()
    const aiPanel = useRef<ImperativePanelHandle>()


    useEffect(() => {
        if (globalState.isAiPanelOpen) {
            aiPanel.current.expand()
            aiPanel.current.resize(25)
        } else {
            aiPanel.current.collapse()
        }
    }, [aiPanel, globalState.isAiPanelOpen])

    useEffect(() => {
        const urlParams = new URLSearchParams(Array.from(searchParams.entries()));
        const open = urlParams.get("open");
        if (open) {
            globalState.setActiveProject(open)
            globalState.setActiveView("EDITOR")
            globalState.setActiveFile(Object.keys(manager.projects[open].files)[0])
            urlParams.delete("open")
            window.history.replaceState({}, document.title, window.location.pathname + "?" + urlParams.toString());
        }
    }, [searchParams])

    useEffect(() => {
        function onCtrlS(e: KeyboardEvent) {
            //check ctrl s pressed
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault()
                // create new event
                document.dispatchEvent(new Event("save"))
                console.log("Ctrl + S pressed")
            }
        }

        document.addEventListener("keydown", onCtrlS)

        return () => document.removeEventListener("keydown", onCtrlS)
    }, [])

    function createTitle() {
        let title = ""
        if (globalState.activeProject && !globalState.activeFile) {
            return title + globalState.activeProject
        }
        if (globalState.activeFile && globalState.activeFile.startsWith("PKG: ")) {
            return title + globalState.activeFile.replace("PKG: ", "")
        }
        if (globalState.activeView) {
            if (globalState.activeView == "EDITOR") {
                if (globalState.activeFile) {
                    title += globalState.activeProject + "/" + globalState.activeFile
                } else {
                    title += globalState.activeProject
                }
            } else {
                title += globalState.activeView.toLowerCase().replaceAll(/_/g, " ")
            }
        } else {
            title += "Home"
        }
        return title
    }

    return <div className="flex flex-col h-screen">
        {/* <head>
            <title>{createTitle() ||""} | BetterIDEa</title>
        </head> */}
        <NextSeo title={`${createTitle()} | BetterIDEa`} />

        <Menubar />
        <div className="flex h-full">
            <Sidebar drawerRef={sidebarDrawerRef} />
            <ResizablePanelGroup direction="horizontal" className="!z-0">
                <ResizablePanel defaultSize={20} maxSize={70} minSize={5} collapsible ref={sidebarDrawerRef}>
                    <SidebarDrawer />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel>
                    <View />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={0} maxSize={50} minSize={5} collapsible ref={aiPanel} onCollapse={() => globalState.setIsAiPanelOpen(false)} onExpand={() => globalState.setIsAiPanelOpen(true)}>
                    <AiPanel />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
        <Statusbar />
    </div>;
}