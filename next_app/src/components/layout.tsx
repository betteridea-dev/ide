import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import Sidebar from "./sidebar";
import SidebarDrawer from "./drawer";
import { useEffect, useRef } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import View from "./views";
import Statusbar from "./statusbar";
import Menubar from "./menubar";
import { useGlobalState, useProjectManager } from "@/hooks";
import {NextSeo} from "next-seo"
import { useSearchParams } from "next/navigation";


export default function Layout() {
    const globalState = useGlobalState()
    const manager= useProjectManager()
    const sidebarDrawerRef = useRef<ImperativePanelHandle>();
    const searchParams = useSearchParams()

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
    },[searchParams])

    function createTitle() {
        let title=""
        if (globalState.activeProject && !globalState.activeFile) {
            return title + globalState.activeProject
        }
        if (globalState.activeFile&& globalState.activeFile.startsWith("PKG: ")) {
            return title+globalState.activeFile.replace("PKG: ","")
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
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={20} maxSize={70} minSize={5} collapsible ref={sidebarDrawerRef}>
                    <SidebarDrawer />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel>
                    <View />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
        <Statusbar />
    </div>;
}