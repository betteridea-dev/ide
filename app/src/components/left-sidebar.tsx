import { useGlobalState } from "@/hooks/use-global-state"
import { Blocks, Bot, Database, File, Files, FlaskConical, Settings, TestTubeDiagonal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { useEffect, useState } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

export interface LeftSidebarOptions {
    label: string
    Icon: React.ElementType
    id: SidebarTabs
    onClick?: (params: any) => void
    isNew?: boolean
}

export type SidebarTabs = "files" | "packages" | "sqlite" | "interact" | "ao-companion"

const options: LeftSidebarOptions[] = [
    {
        label: "Files",
        Icon: Files,
        id: "files",
        onClick: (params: any) => {
        }
    },
    {
        label: "Packages",
        Icon: Blocks,
        id: "packages",
        onClick: (params: any) => {

        }
    },
    {
        label: "SQLite Explorer",
        Icon: Database,
        id: "sqlite",
        onClick: (params: any) => {

        }
    },
    {
        label: "Interact",
        Icon: FlaskConical,
        id: "interact",
        onClick: (params: any) => {

        }
    },
    {
        label: "AO Companion",
        Icon: Bot,
        id: "ao-companion",
        onClick: (params: any) => {
            // params.sidebarActions.setDrawerOpen(false)
            params.sidebarActions.setActiveTab(params.activeTab)
        },
        isNew: true
    }
]

export default function LeftSidebar() {
    const { activeDrawer: activeTab, drawerOpen, actions: sidebarActions } = useGlobalState()

    return <div className="h-full w-10 flex flex-col border-r">
        {options.map((option) => (
            <Tooltip key={option.id} delayDuration={250}>
                <TooltipTrigger>
                    <Button key={option.id} variant="ghost"
                        className={cn("h-10 w-10 flex flex-col relative items-center justify-center gap-0.5 rounded-none", activeTab === option.id && "!bg-primary !text-white")}
                        onClick={() => {
                            sidebarActions.setActiveView("project")
                            if (option.id === activeTab) {
                                sidebarActions.setDrawerOpen(!drawerOpen)
                            } else {
                                sidebarActions.setActiveTab(option.id)
                                sidebarActions.setDrawerOpen(true)
                            }
                            option.onClick?.({ sidebarActions, activeTab })
                        }}
                    >
                        {<option.Icon className="w-4.5 h-4.5" />}
                        {option.isNew && option.id !== activeTab && <span className="text-xxs -bottom-0 bg-primary text-white rounded px-1.5">new</span>}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="rounded">
                    {option.label}
                </TooltipContent>
            </Tooltip>
        ))}
        <div className="grow"></div>
        <Button variant="ghost" className="h-10 w-10 flex items-center justify-center gap-2 rounded-none"
            onClick={() => {
                sidebarActions.setActiveView("settings")
            }}
        >
            <Settings className="w-4.5 h-4.5" />
        </Button>
    </div>
}