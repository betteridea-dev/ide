import { useState, useEffect } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useGlobalState } from "@/hooks/use-global-state"
import { useProjects } from "@/hooks/use-projects"
import { toast } from "sonner"

export default function RenameFile() {
    const { activeFile, activeProject, actions: globalActions } = useGlobalState()
    const { projects, actions: projectActions } = useProjects()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newName, setNewName] = useState("")
    const [error, setError] = useState("")

    // Extract name without extension for initial value
    const getNameWithoutExtension = (fileName: string) => {
        const lastDotIndex = fileName.lastIndexOf('.')
        return lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName
    }

    const getExtension = (fileName: string) => {
        const lastDotIndex = fileName.lastIndexOf('.')
        return lastDotIndex > 0 ? fileName.substring(lastDotIndex) : ''
    }

    // Reset form when dialog opens
    useEffect(() => {
        if (isDialogOpen && activeFile) {
            setNewName(getNameWithoutExtension(activeFile))
            setError("")
        }
    }, [isDialogOpen, activeFile])

    const handleRename = () => {
        if (!activeProject || !activeFile) {
            toast.error("No file selected")
            return
        }

        if (!newName.trim()) {
            setError("File name cannot be empty")
            return
        }

        const trimmedName = newName.trim()
        const extension = getExtension(activeFile)

        // Determine final file name
        let finalName: string
        if (trimmedName.includes('.')) {
            // User provided extension, use as-is
            finalName = trimmedName
        } else {
            // No extension provided, preserve original extension
            finalName = trimmedName + extension
        }

        const project = projects[activeProject]
        if (!project) return

        const existingFiles = Object.keys(project.files)

        // Check if file with new name already exists
        if (existingFiles.includes(finalName)) {
            setError("File with this name already exists")
            return
        }

        // Create new file with new name
        const fileData = project.files[activeFile]
        const renamedFile = { ...fileData, name: finalName }

        // Add new file and delete old one
        projectActions.setFile(activeProject, renamedFile)
        projectActions.deleteFile(activeProject, activeFile)

        // Update opened files and active file if this file was opened
        globalActions.renameOpenedFile(activeFile, finalName)

        toast.success(`File renamed to "${finalName}"`)
        setIsDialogOpen(false)
    }

    const handleCancel = () => {
        setIsDialogOpen(false)
        setNewName("")
        setError("")
    }

    if (!activeFile) return null

    const extension = getExtension(activeFile)

    return (
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
                <button id="rename-file" className="hidden">
                    Rename File
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Rename File</AlertDialogTitle>
                    <AlertDialogDescription>
                        Enter a new name for "{activeFile}".
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="grid gap-2">
                    <Label htmlFor="filename">File Name</Label>
                    <Input
                        id="filename"
                        value={newName}
                        onChange={(e) => {
                            setNewName(e.target.value)
                            setError("")
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleRename()
                            }
                        }}
                        placeholder="Enter file name"
                        autoFocus
                    />
                    {extension && (
                        <p className="text-xs text-muted-foreground">
                            Extension "{extension}" will be preserved if not specified
                        </p>
                    )}
                    {error && (
                        <p className="text-xs text-destructive">{error}</p>
                    )}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRename}>Rename</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
