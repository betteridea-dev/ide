import { cn } from "@/lib/utils"
import { useDrawerOpen, useActiveProject, useGlobalActions, useActiveDrawer } from "../../hooks/use-global-state"
import { useProjects } from "../../hooks/use-projects"
import { Button } from "../ui/button"
import { FolderPlus, FolderOpen } from "lucide-react"
import { memo, useCallback, useMemo } from "react"
import Files from "./files"
import Packages from "./packages"
import Sqlite from "./sqlite"
import Interact from "./interact"
import Relayer from "./relayer"

export default function Drawer() {
    const drawerOpen = useDrawerOpen()
    const activeProject = useActiveProject()
    const sidebarActions = useGlobalActions()
    const { projects } = useProjects()
    const project = projects[activeProject]
    const activeTab = useActiveDrawer()

    const handleViewAllProjects = useCallback(() => {
        sidebarActions.setActiveView("project")
        sidebarActions.setActiveTab("files")
    }, [sidebarActions])

    const handleCreateNewProject = useCallback(() => {
        // Trigger the new project dialog
        const trigger = document.getElementById("new-project")
        if (trigger) {
            trigger.click()
        }
    }, [])


    return <div className={cn("w-full h-full bg-background overflow-hidden", drawerOpen && "block")}>
        {!activeProject || !project ? <div className={cn("w-full h-full bg-background overflow-hidden", drawerOpen && "block")}>
            <div className="h-full flex flex-col">
                {/* No project state */}
                <div className="flex-1 flex flex-col items-center justify-start p-6 text-center">
                    <div className="mb-6">
                        <FolderOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                        <h3 className="text-lg font-medium">No Project Opened</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Select a project to start working
                        </p>
                    </div>

                    <div className="w-full max-w-xs space-y-3">
                        <Button
                            className="w-full h-10 text-sm font-medium"
                            onClick={handleViewAllProjects}
                        >
                            <FolderOpen className="w-4 h-4 mr-2" />
                            View All Projects
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">or</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full h-10 text-sm font-medium"
                            onClick={handleCreateNewProject}
                        >
                            <FolderPlus className="w-4 h-4 mr-2" />
                            Create New Project
                        </Button>
                    </div>
                </div>
            </div>
        </div> : <>
            <div className={activeTab === "files" ? "block" : "hidden"}>
                <Files />
            </div>
            <div className={activeTab === "packages" ? "block" : "hidden"}>
                <Packages />
            </div>
            <div className={activeTab === "sqlite" ? "block" : "hidden"}>
                <Sqlite />
            </div>
            <div className={activeTab === "interact" ? "block" : "hidden"}>
                <Interact />
            </div>
            <div className={activeTab === "relayer" ? "block" : "hidden"}>
                <Relayer />
            </div>
            <div className={activeTab === "ao-companion" ? "block" : "hidden"}>
                <div className="p-4 text-center text-muted-foreground">AO Companion coming soon...</div>
            </div>
            {!["files", "packages", "sqlite", "interact", "relayer", "ao-companion"].includes(activeTab) && (
                <div className="p-4 text-center text-muted-foreground">Select a tab</div>
            )}
        </>}

    </div>
}