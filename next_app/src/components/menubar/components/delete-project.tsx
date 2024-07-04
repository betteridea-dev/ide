import { AlertDialog, AlertDialogTitle, AlertDialogTrigger, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useGlobalState, useProjectManager } from "@/hooks";
import { useLocalStorage } from "usehooks-ts";

export default function DeleteProject() {
    const globalState = useGlobalState()
    const manager = useProjectManager()
    const [recents, setRecents] = useLocalStorage<string[]>("recents", [], { initializeWithValue: true })
    const project = globalState.activeProject && manager.getProject(globalState.activeProject)

    function deleteProject() {
        if (project) {
            const pname = project.name
            globalState.setActiveProject(null)
            globalState.setActiveFile(null)
            globalState.setActiveView(null)
            manager.deleteProject(pname)
            setRecents(recents.filter((p) => p != pname))
        }
    }

    return <AlertDialog>
        <AlertDialogTrigger className="invisible" id="delete-project">delete project</AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>You are about to delete this project</AlertDialogTitle>
                <AlertDialogDescription>This action is not reversible</AlertDialogDescription>
                <AlertDialogDescription>This will delete: {project?.name}</AlertDialogDescription>

            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteProject} className="p-0">
                    <Button variant="destructive">Delete</Button>
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
}