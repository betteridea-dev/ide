import { AlertDialog, AlertDialogTitle, AlertDialogTrigger, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useGlobalState, useProjectManager } from "@/hooks"
import { useState } from "react";
import { supportedExtensions } from "@/lib/utils";
import { toast } from "sonner";

export default function RenameFile() {
    const globalState = useGlobalState()
    const manager = useProjectManager()
    const [fileName, setFileName] = useState<string>("")

    const project = globalState.activeProject && manager.getProject(globalState.activeProject)
    const file = globalState.activeFile && project.getFile(globalState.activeFile)

    function renameFile() {
        if (project && file) {
            const oldFileName = file.name
            if (!fileName) return
            const newFileName = fileName.split(".").length > 1 ? fileName : `${fileName}${file.type == "NOTEBOOK" ? ".luanb" : ".lua"}`
            const ext = newFileName.split(".").pop()
            if (!supportedExtensions.includes(ext!)) return toast.error("Unsupported file extension")
            const oldFile = project.getFile(oldFileName)
            manager.newFile(project, {
                name: newFileName,
                type: oldFile.type
            })
            const newFile = project.getFile(newFileName)
            newFile.content = oldFile.content
            manager.deleteFile(project, oldFileName)
            project.files[newFileName] = newFile
            manager.projects[project.name] = project
            manager.saveProjects(manager.projects)
            globalState.closeOpenedFile(oldFileName)
            globalState.setActiveFile(newFileName)
            toast.success("File renamed")
        }
    }

    return <AlertDialog>
        <AlertDialogTrigger className="invisible" id="rename-file">rename file</AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>You are about to rename this file</AlertDialogTitle>
                <AlertDialogDescription>Allowed file extensions: .lua, .luanb, .md</AlertDialogDescription>

                <AlertDialogDescription>
                    <Input placeholder="Enter new file name" onChange={(e)=>setFileName(e.target.value)} />
                </AlertDialogDescription>

            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={renameFile}>Rename</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
}