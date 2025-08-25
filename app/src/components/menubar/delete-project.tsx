import { useState } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useGlobalState } from "@/hooks/use-global-state"
import { useProjects } from "@/hooks/use-projects"
import { toast } from "sonner"

export default function DeleteProject() {
    const { activeProject, actions: globalActions } = useGlobalState()
    const { actions: projectActions } = useProjects()
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleDelete = () => {
        if (!activeProject) {
            toast.error("No active project selected")
            return
        }

        // Delete the project
        projectActions.deleteProject(activeProject)
        projectActions.removeRecent(activeProject)
        globalActions.closeProject()

        toast.success(`Project "${activeProject}" deleted`)
        setIsDialogOpen(false)
    }

    if (!activeProject) return null

    return (
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
                <button id="delete-project" className="hidden">
                    Delete Project
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Project</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete project "{activeProject}"? This action cannot be undone.
                        All files and data in this project will be permanently lost.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Delete Project
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
