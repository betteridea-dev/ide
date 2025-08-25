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

export default function RenameProject() {
    const { activeProject, actions: globalActions } = useGlobalState()
    const { projects, actions: projectActions } = useProjects()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newName, setNewName] = useState("")
    const [error, setError] = useState("")

    // Reset form when dialog opens
    useEffect(() => {
        if (isDialogOpen && activeProject) {
            setNewName(activeProject)
            setError("")
        }
    }, [isDialogOpen, activeProject])

    const handleRename = () => {
        if (!activeProject) {
            toast.error("No active project selected")
            return
        }

        if (!newName.trim()) {
            setError("Project name cannot be empty")
            return
        }

        const trimmedName = newName.trim()

        if (trimmedName === activeProject) {
            setError("New name must be different from current name")
            return
        }

        // Check if project with new name already exists
        if (projects[trimmedName]) {
            setError("Project with this name already exists")
            return
        }

        const project = projects[activeProject]
        if (project) {
            // Create new project with new name
            const renamedProject = { ...project, name: trimmedName }
            projectActions.setProject(renamedProject)
            projectActions.deleteProject(activeProject)
            globalActions.setActiveProject(trimmedName)

            // Update recents
            projectActions.removeRecent(activeProject)
            projectActions.addRecent(trimmedName)

            toast.success(`Project renamed to "${trimmedName}"`)
            setIsDialogOpen(false)
        }
    }

    const handleCancel = () => {
        setIsDialogOpen(false)
        setNewName("")
        setError("")
    }

    if (!activeProject) return null

    return (
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
                <button id="rename-project" className="hidden">
                    Rename Project
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Rename Project</AlertDialogTitle>
                    <AlertDialogDescription>
                        Enter a new name for project "{activeProject}".
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="grid gap-2">
                    <Label htmlFor="projectname">Project Name</Label>
                    <Input
                        id="projectname"
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
                        placeholder="Enter project name"
                        autoFocus
                    />
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
