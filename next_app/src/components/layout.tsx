import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import Sidebar from "./sidebar";
import SidebarDrawer from "./drawer";
import { useRef } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import View from "./views";
import Statusbar from "./statusbar";
import Menubar from "./menubar";
import { useGlobalState } from "@/hooks";


export default function Layout() {
    const globalState = useGlobalState()
    const sidebarDrawerRef = useRef<ImperativePanelHandle>();

    function createTitle() {
        let title = "BetterIDEa | "
        if (globalState.activeProject && !globalState.activeFile) {
            return title + globalState.activeProject
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
    // const title = `${globalState.activeView ?
    //         globalState.activeView == "EDITOR" ?
    //             globalState.activeFile ?
    //                 globalState.activeProject + "/" + globalState.activeFile
    //                 :
    //                 globalState.activeProject
    //             :
    //             globalState.activeView.toLowerCase().replaceAll(/_/g, " ")
    //         :
    //         "Home"
    //     }`

    return <div className="flex flex-col h-screen">
        <head>
            <title>{createTitle()}</title>
        </head>
        <Menubar />
        <div className="flex h-full">
            <Sidebar drawerRef={sidebarDrawerRef} />
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={20} maxSize={25} minSize={5} collapsible ref={sidebarDrawerRef}>
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