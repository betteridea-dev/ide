import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import Sidebar from "./sidebar";
import SidebarDrawer from "./drawer";
import { useEffect, useRef } from "react";
import { useGlobalState } from "@/hooks";
import { ImperativePanelHandle } from "react-resizable-panels";
import View from "./views";


export default function Layout() {
    const globalState = useGlobalState();
    const sidebarDrawerRef = useRef<ImperativePanelHandle>();

    // useEffect(() => {
    //     if (!sidebarDrawerRef) return;
    //     if (!globalState.activeSidebarItem) sidebarDrawerRef.current.collapse();
    //     else {
    //         switch (globalState.activeSidebarItem) {
    //             case "SETTINGS":
    //                 return sidebarDrawerRef.current.collapse();
    //             default:
    //                 return sidebarDrawerRef.current.expand();
    //         }
    //     }
    // }, [globalState.activeSidebarItem, sidebarDrawerRef])

    return <div className="flex flex-col h-screen">
        <div className="border-b h-[20px] text-sm flex">top menubar</div>
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
        <div className="border-t h-[20px] text-sm">bottom status</div>
    </div>;
}