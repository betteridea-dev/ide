import { AlertDialog, AlertDialogTitle, AlertDialogTrigger, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useGlobalState, useProjectManager } from "@/hooks";
import { useLocalStorage } from "usehooks-ts";

export default function DeleteFile() {
    const globalState = useGlobalState()
    const manager = useProjectManager()
    
    const project = globalState.activeProject && manager.getProject(globalState.activeProject)
    const file = globalState.activeFile && globalState.activeProject && project?.getFile(globalState.activeFile)
    
    function deleteFile() {
        if (project && file) {
            const fname = file.name
            globalState.closeOpenedFile(fname)
            manager.deleteFile(project, fname)
        }
    }

    return <AlertDialog>
        <AlertDialogTrigger className="invisible" id="delete-file">delete file</AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>You are about to delete this file</AlertDialogTitle>
                <AlertDialogDescription>This action is not reversible</AlertDialogDescription>
                <AlertDialogDescription>This will delete: {file?.name}</AlertDialogDescription>

            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteFile} className="p-0">
                    <Button variant="destructive">Delete</Button>
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
}