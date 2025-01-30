import { Settings } from "lucide-react"
import { Button } from "../ui/button"
import sidebarItems, { TSidebarOptions } from "./components"
import { useGlobalState } from "@/hooks"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MutableRefObject, useEffect } from "react"
import { ImperativePanelHandle } from "react-resizable-panels"


export default function Sidebar({ drawerRef }: { drawerRef: MutableRefObject<ImperativePanelHandle> }) {
    const globalState = useGlobalState()

    useEffect(() => {
        if (!globalState.activeSidebarItem) drawerRef.current.collapse()
    }, [globalState.activeSidebarItem, drawerRef])

    // common handler for all sidebar buttons
    function sidebarButtonClicked(sidebarValue: TSidebarOptions) {
        return () => {
            switch (sidebarValue) {
                case "SETTINGS":
                    globalState.setActiveView("SETTINGS")
                    break;
                case "AI_CHAT":
                    globalState.setIsAiPanelOpen(!globalState.isAiPanelOpen)
                    break;
                // above: donot toggle sidebar drawer
                // below: toggle sidebar drawer
                case "MARKETPLACE":
                    globalState.setActiveView("MARKETPLACE")
                default:
                    if (globalState.activeSidebarItem == sidebarValue)
                        drawerRef.current.isCollapsed() ? drawerRef.current.expand() : drawerRef.current.collapse()
                    else {
                        drawerRef.current.expand()
                        globalState.setActiveSidebarItem(sidebarValue)
                    }
            }
        }
    }

    return <div className="w-[50px] border-r flex flex-col items-center justify-start overflow-visible overflow-y-scroll bg-foreground/[3%]">
        {
            sidebarItems.map((Item, i) => <TooltipProvider key={i} delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger className="overflow-visible">
                        <Button variant="ghost" data-active={globalState.activeSidebarItem == Item.value}
                            className="rounded-none h-12 w-12 flex items-center justify-center p-0 data-[active=true]:bg-primary overflow-visible"
                            onClick={sidebarButtonClicked(Item.value)}
                        ><Item.icon strokeWidth={1.5} data-active={globalState.activeSidebarItem == Item.value}
                            className="data-[active=true]:text-white overflow-visible"
                            />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={-1}>{Item.label}</TooltipContent>
                </Tooltip>

            </TooltipProvider>)
        }
        <div className="grow" />
        {/* <Button variant="ghost" className="rounded-none" onClick={sidebarButtonClicked("SETTINGS")}>
            <Settings />
        </Button> */}
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger>
                    <Button variant="ghost" className="rounded-none" onClick={sidebarButtonClicked("SETTINGS")}>
                        <Settings strokeWidth={1.5} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={-1}>Settings</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
}