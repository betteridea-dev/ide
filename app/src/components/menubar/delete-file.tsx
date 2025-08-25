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

export default function DeleteFile() {
    const { activeFile, activeProject, actions: globalActions } = useGlobalState()
    const { actions: projectActions } = useProjects()
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleDelete = () => {
        if (!activeProject || !activeFile) {
            toast.error("No file selected")
            return
        }

        // Delete the file
        projectActions.deleteFile(activeProject, activeFile)

        // Close the file if it's currently opened in editor
        globalActions.closeOpenedFile(activeFile)

        toast.success(`File "${activeFile}" deleted`)
        setIsDialogOpen(false)
    }

    if (!activeFile) return null

    return (
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
                <button id="delete-file" className="hidden">
                    Delete File
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete File</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete "{activeFile}"? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
