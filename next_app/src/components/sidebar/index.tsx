import { Settings } from "lucide-react"
import { Button } from "../ui/button"
import sidebarItems, { TSidebarOptions } from "./components"
import { useGlobalState } from "@/hooks"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MutableRefObject } from "react"
import { ImperativePanelHandle } from "react-resizable-panels"


export default function Sidebar({ drawerRef }: { drawerRef: MutableRefObject<ImperativePanelHandle> }) {
    const globalState = useGlobalState()

    // common handler for all sidebar buttons
    function sidebarButtonClicked(sidebarValue: TSidebarOptions) {
        return () => {
            switch (sidebarValue) {
                case "SETTINGS":
                    globalState.setActiveView("SETTINGS")
                    break;
                default:
                    if (globalState.activeSidebarItem == sidebarValue)
                        drawerRef.current.isCollapsed() ? drawerRef.current.expand() : drawerRef.current.collapse()
                    else{drawerRef.current.expand()
                    globalState.setActiveSidebarItem(sidebarValue)}
            }
        }
    }

    return <div className="w-[50px] border-r flex flex-col items-center justify-start overflow-x-clip overflow-y-scroll">
        {
            sidebarItems.map((Item, i) => <TooltipProvider key={i} delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger>
                    <Button variant="ghost" data-active={globalState.activeSidebarItem == Item.value}
                        className="rounded-none h-12 w-12 flex items-center justify-center p-0 data-[active=true]:bg-primary"
                        onClick={sidebarButtonClicked(Item.value)}
                        ><Item.icon data-active={globalState.activeSidebarItem == Item.value}
                                className="data-[active=true]:text-white"
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
                        <Settings />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={-1}>Settings</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
}