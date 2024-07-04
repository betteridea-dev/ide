import { AlertDialog, AlertDialogTitle, AlertDialogTrigger, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useGlobalState, useProjectManager } from "@/hooks"
import { useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";

export default function RenameProject() {
    const globalState = useGlobalState()
    const manager = useProjectManager()
    const [projectName, setProjectName] = useState<string>("")
    const [recents, setRecents] = useLocalStorage<string[]>("recents", [], {initializeWithValue:true})

    const project = globalState.activeProject && manager.getProject(globalState.activeProject)

    function renameProject() {
        if (project) {
            const oldProjectName = project.name
            if (!projectName) return
            const newProjectName = projectName
            const oldProject = manager.getProject(oldProjectName)
            const oldFiles = oldProject.files
            manager.newProject({
                name: newProjectName,
                defaultFiletype: oldProject.defaultFiletype,
                files: oldFiles,
                ownerWallet: oldProject.ownerWallet
            })
            globalState.setActiveProject(newProjectName)
            manager.deleteProject(oldProjectName)
            globalState.setActiveFile(Object.keys(oldFiles)[0])
            toast.success("Project renamed")
            setRecents(recents.map(r => r === oldProjectName ? newProjectName : r))
        }
    }

    return <AlertDialog>
        <AlertDialogTrigger className="invisible" id="rename-project">rename project</AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>You are about to rename this project</AlertDialogTitle>
                <AlertDialogDescription>
                    <Input placeholder="Enter new project name" onChange={(e) => setProjectName(e.target.value)} />
                </AlertDialogDescription>

            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={renameProject}>Rename</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
}