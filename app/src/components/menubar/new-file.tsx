import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { useEffect, useState } from "react"
import { useGlobalState } from "@/hooks/use-global-state"
import { useProjects, type File } from "@/hooks/use-projects"
import { CheckCircle, AlertCircle } from "lucide-react"

interface ValidationError {
    field: string
    message: string
}

type FileType = "lua" | "luanb" | "md"

const FILE_TYPES: { [key in FileType]: string } = {
    lua: "lua",
    luanb: "luanb",
    md: "md"
}

export default function NewFile() {
    const [fileName, setFileName] = useState("")
    const [fileType, setFileType] = useState<FileType>("lua")
    const [errors, setErrors] = useState<ValidationError[]>([])
    const [isCreating, setIsCreating] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string>("")
    const [generalError, setGeneralError] = useState<string>("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const globalState = useGlobalState()
    const { projects, actions } = useProjects()

    // Clear errors and messages when inputs change
    useEffect(() => {
        if (errors.length > 0 || successMessage || generalError) {
            setErrors([])
            setSuccessMessage("")
            setGeneralError("")
        }
    }, [fileName, fileType])

    const validateForm = (): ValidationError[] => {
        const validationErrors: ValidationError[] = []

        // Check if there's an active project
        if (!globalState.activeProject) {
            validationErrors.push({
                field: "project",
                message: "No active project. Please select or create a project first."
            })
            return validationErrors
        }

        // File name validation
        if (!fileName.trim()) {
            validationErrors.push({
                field: "fileName",
                message: "File name is required"
            })
        } else if (fileName.trim().length < 1) {
            validationErrors.push({
                field: "fileName",
                message: "File name must be at least 1 character long"
            })
        } else if (fileName.trim().length > 100) {
            validationErrors.push({
                field: "fileName",
                message: "File name must be less than 100 characters"
            })
        } else if (!/^[a-zA-Z0-9\s\-_.]+$/.test(fileName.trim())) {
            validationErrors.push({
                field: "fileName",
                message: "File name can only contain letters, numbers, spaces, hyphens, underscores, and dots"
            })
        } else {
            // Check if file already exists in the current project
            const activeProject = projects[globalState.activeProject]
            const fullFileName = `${fileName.trim()}.${fileType}`

            if (activeProject && activeProject.files[fullFileName]) {
                validationErrors.push({
                    field: "fileName",
                    message: "A file with this name already exists in the current project"
                })
            }
        }

        return validationErrors
    }

    const handleCreate = async () => {
        // Clear previous messages
        setSuccessMessage("")
        setGeneralError("")

        const validationErrors = validateForm()

        if (validationErrors.length > 0) {
            setErrors(validationErrors)
            return
        }

        if (!globalState.activeProject) {
            setGeneralError("No active project selected.")
            return
        }

        setIsCreating(true)

        try {
            const fullFileName = `${fileName.trim()}.${fileType}`

            // Get the active project
            const activeProject = projects[globalState.activeProject]
            if (!activeProject) {
                throw new Error("Active project not found")
            }

            // Create default file structure based on file type
            let newFile: File
            const cellId = `cell-${Date.now()}`

            switch (fileType) {
                case "lua":
                    newFile = {
                        name: fullFileName,
                        cellOrder: [cellId],
                        cells: {
                            [cellId]: {
                                id: cellId,
                                content: 'print("Hello AO!")\n',
                                output: "",
                                type: "CODE",
                                editing: false
                            }
                        },
                        isMainnet: activeProject.isMainnet,
                        ownerAddress: activeProject.ownerAddress
                    }
                    break
                case "luanb":
                    newFile = {
                        name: fullFileName,
                        cellOrder: [cellId],
                        cells: {
                            [cellId]: {
                                id: cellId,
                                content: 'print("Hello AO!")\n',
                                output: "",
                                type: "CODE",
                                editing: false
                            }
                        },
                        isMainnet: activeProject.isMainnet,
                        ownerAddress: activeProject.ownerAddress
                    }
                    break
                case "md":
                    newFile = {
                        name: fullFileName,
                        cellOrder: [cellId],
                        cells: {
                            [cellId]: {
                                id: cellId,
                                content: `# ${fileName.trim()}\n\nNew markdown file.\n`,
                                output: "",
                                type: "MARKDOWN",
                                editing: false
                            }
                        },
                        isMainnet: activeProject.isMainnet,
                        ownerAddress: activeProject.ownerAddress
                    }
                    break
            }

            // Add the new file to the project
            const updatedProject = {
                ...activeProject,
                files: {
                    ...activeProject.files,
                    [fullFileName]: newFile
                }
            }

            // Update the project in the store
            actions.setProject(updatedProject)

            // Set the new file as active
            globalState.actions.setActiveFile(fullFileName)

            setSuccessMessage(`File "${fullFileName}" created successfully!`)

            // Close dialog and reset form after a short delay to show success message
            setTimeout(() => {
                setIsDialogOpen(false)
                setFileName("")
                setFileType("lua")
                setErrors([])
                setSuccessMessage("")
                setGeneralError("")
            }, 1500)

        } catch (error) {
            console.error("Failed to create file:", error)
            setGeneralError(`Failed to create file: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setIsCreating(false)
        }
    }

    const getFieldError = (fieldName: string): string | undefined => {
        return errors.find(error => error.field === fieldName)?.message
    }

    const handleDialogOpenChange = (open: boolean) => {
        setIsDialogOpen(open)
        if (open) {
            // Reset form state when dialog opens
            setErrors([])
            setSuccessMessage("")
            setGeneralError("")
        }
    }

    return <div>
        <AlertDialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <AlertDialogTrigger id="new-file"></AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>New File</AlertDialogTitle>
                    <AlertDialogDescription>
                        Create a new file in the current project.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Success Message */}
                {successMessage && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
                    </div>
                )}

                {/* General Error Message */}
                {generalError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <p className="text-sm text-red-800 dark:text-red-200">{generalError}</p>
                    </div>
                )}

                {/* Validation Errors Summary */}
                {errors.length > 0 && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">Please fix the following errors:</p>
                            <ul className="text-sm text-red-700 dark:text-red-300 mt-1 space-y-1">
                                {errors.map((error, index) => (
                                    <li key={index}>• {error.message}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    <Input
                        placeholder="File Name (without extension)"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className={getFieldError("fileName") ? "border-red-500" : ""}
                    />
                    {getFieldError("fileName") && (
                        <p className="text-sm text-red-500">{getFieldError("fileName")}</p>
                    )}
                </div>

                <div className="flex gap-2 text-sm items-center">
                    <div className="text-muted-foreground mr-auto">File Type</div>
                    {Object.entries(FILE_TYPES).map(([key, value]) => (
                        <Badge
                            key={key}
                            className={`cursor-pointer bg-muted ${fileType === value ? "bg-primary" : ""}`}
                            onClick={() => setFileType(value as FileType)}
                        >
                            {key}
                        </Badge>
                    ))}
                </div>

                <AlertDialogFooter className="mt-4">
                    <AlertDialogCancel disabled={isCreating || !!successMessage}>Cancel</AlertDialogCancel>
                    <Button
                        onClick={handleCreate}
                        disabled={isCreating || !!successMessage}
                    >
                        {isCreating ? "Creating..." : successMessage ? "Created!" : "Create"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
}