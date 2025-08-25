import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { useEffect, useState } from "react"
import Constants from "@/lib/constants"
import { useProjects } from "@/hooks/use-projects"
import { CheckCircle, AlertCircle, X, Plus } from "lucide-react"
import { validateArweaveId, createNewProject } from "@/lib/utils"
import { MainnetAO } from "@/lib/ao"
type SimpleTag = { name: string; value: string }
import { useActiveAddress, useApi } from "@arweave-wallet-kit/react"
import { useGlobalState } from "@/hooks/use-global-state"
import { useSettings } from "@/hooks/use-settings"
import { createSigner } from "@permaweb/aoconnect"

interface ValidationError {
    field: string
    message: string
}

export default function NewProject() {
    const [projectName, setProjectName] = useState("")
    const [network, setNetwork] = useState<"legacynet" | "mainnet">("mainnet")
    const [module_, setModule] = useState<string>(Constants.modules.mainnet.hyperAos)
    const [processType, setProcessType] = useState<"new" | "existing">("new")
    const [existingProcessId, setExistingProcessId] = useState("")
    const [customModuleId, setCustomModuleId] = useState("")
    const [customTags, setCustomTags] = useState<SimpleTag[]>([])
    const [newTagName, setNewTagName] = useState("")
    const [newTagValue, setNewTagValue] = useState("")
    const [errors, setErrors] = useState<ValidationError[]>([])
    const [isCreating, setIsCreating] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string>("")
    const [generalError, setGeneralError] = useState<string>("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const api = useApi()

    const modules = network === "legacynet" ? Constants.modules.testnet : Constants.modules.mainnet
    const { projects, actions } = useProjects()
    const activeAddress = useActiveAddress()
    const globalState = useGlobalState()
    const settings = useSettings()

    useEffect(() => {
        if (network === "legacynet") {
            // Set to the first available module for testnet
            const firstModule = Object.values(Constants.modules.testnet)[0]
            setModule(firstModule)
        } else {
            setModule(Constants.modules.mainnet.hyperAos)
        }
        // Clear custom module when switching networks
        setCustomModuleId("")
    }, [network])

    // Clear standard module selection when custom module is entered
    useEffect(() => {
        if (customModuleId) {
            setModule("")
        }
    }, [customModuleId])

    // Clear errors and messages when inputs change
    useEffect(() => {
        if (errors.length > 0 || successMessage || generalError) {
            setErrors([])
            setSuccessMessage("")
            setGeneralError("")
        }
    }, [projectName, network, module_, processType, existingProcessId, customModuleId, customTags])

    const addTag = () => {
        if (newTagName.trim() && newTagValue.trim()) {
            const tagName = newTagName.trim()
            const tagValue = newTagValue.trim()

            // Check for reserved tag names
            const reservedTags = ["Name", "Module", "Scheduler", "SDK"]
            if (reservedTags.some(reserved => reserved.toLowerCase() === tagName.toLowerCase())) {
                setErrors([{
                    field: "tagName",
                    message: `"${tagName}" is a reserved tag name`
                }])
                return
            }

            // Check if tag name already exists
            const existingTag = customTags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase())
            if (existingTag) {
                setErrors([{
                    field: "tagName",
                    message: "A tag with this name already exists"
                }])
                return
            }

            // Validate tag name format (alphanumeric, hyphens, underscores)
            if (!/^[a-zA-Z0-9\-_]+$/.test(tagName)) {
                setErrors([{
                    field: "tagName",
                    message: "Tag name can only contain letters, numbers, hyphens, and underscores"
                }])
                return
            }

            setCustomTags([...customTags, { name: tagName, value: tagValue }])
            setNewTagName("")
            setNewTagValue("")
        }
    }

    const removeTag = (index: number) => {
        setCustomTags(customTags.filter((_, i) => i !== index))
    }

    const validateForm = (): ValidationError[] => {
        const validationErrors: ValidationError[] = []

        // Wallet connection check for mainnet
        if (network === "mainnet" && !activeAddress) {
            validationErrors.push({
                field: "wallet",
                message: "Please connect your wallet to create mainnet projects"
            })
        }

        // Project name validation
        if (!projectName.trim()) {
            validationErrors.push({
                field: "projectName",
                message: "Project name is required"
            })
        } else if (projectName.trim().length < 2) {
            validationErrors.push({
                field: "projectName",
                message: "Project name must be at least 2 characters long"
            })
        } else if (projectName.trim().length > 50) {
            validationErrors.push({
                field: "projectName",
                message: "Project name must be less than 50 characters"
            })
        } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(projectName.trim())) {
            validationErrors.push({
                field: "projectName",
                message: "Project name can only contain letters, numbers, spaces, hyphens, and underscores"
            })
        } else if (projects[projectName.trim()]) {
            validationErrors.push({
                field: "projectName",
                message: "A project with this name already exists"
            })
        }

        // Process type validation
        if (processType === "existing") {
            const processIdValidation = validateArweaveId(existingProcessId, "Process ID")
            if (!processIdValidation.isValid) {
                validationErrors.push({
                    field: "existingProcessId",
                    message: processIdValidation.error!
                })
            }
        } else {
            // New process validation
            if (customModuleId) {
                const moduleIdValidation = validateArweaveId(customModuleId, "Module ID")
                if (!moduleIdValidation.isValid) {
                    validationErrors.push({
                        field: "customModuleId",
                        message: moduleIdValidation.error!
                    })
                }
            } else if (!module_) {
                validationErrors.push({
                    field: "module",
                    message: "Please select a module or provide a custom module ID"
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

        // Check wallet connection for mainnet projects
        if (network === "mainnet" && !activeAddress) {
            setGeneralError("Please connect your wallet to create mainnet projects.")
            return
        }

        setIsCreating(true)

        try {
            let processId = ""

            if (processType === "existing") {
                // Use existing process ID
                processId = existingProcessId.trim()
            } else if (network === "mainnet") {
                // Create new process on mainnet
                const signer = createSigner(api)
                const ao = new MainnetAO({
                    GATEWAY_URL: settings.actions.getGatewayUrl(),
                    HB_URL: settings.actions.getHbUrl(),
                    signer
                })

                const moduleId = customModuleId || module_
                const tags: SimpleTag[] = [
                    { name: "Name", value: projectName.trim() },
                    ...customTags
                ]

                console.log("Spawning process with module:", moduleId)
                console.log("Tags:", tags)
                processId = await ao.spawn({
                    tags,
                    module_: moduleId
                })

                console.log("Created process:", processId)
            }

            // Create the project structure
            const project = createNewProject(
                projectName.trim(),
                activeAddress || "",
                network === "mainnet",
                processId
            )

            // Save to projects store
            actions.setProject(project)
            actions.addRecent(project.name)

            // Set as active project
            globalState.actions.setActiveProject(project.name)
            globalState.actions.setActiveFile("main.lua")

            setSuccessMessage(`Project "${projectName.trim()}" created successfully!`)

            // Close dialog and reset form after a short delay to show success message
            setTimeout(() => {
                setIsDialogOpen(false)
                setProjectName("")
                setExistingProcessId("")
                setCustomModuleId("")
                setCustomTags([])
                setNewTagName("")
                setNewTagValue("")
                setErrors([])
                setSuccessMessage("")
                setGeneralError("")
            }, 1500)

        } catch (error) {
            console.error("Failed to create project:", error)
            setGeneralError(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
        } else {
            // Reset all form fields when dialog closes
            setProjectName("")
            setExistingProcessId("")
            setCustomModuleId("")
            setCustomTags([])
            setNewTagName("")
            setNewTagValue("")
            setErrors([])
            setSuccessMessage("")
            setGeneralError("")
        }
    }

    return <div>
        <AlertDialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <AlertDialogTrigger id="new-project"></AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>New Project</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will create a new project.
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
                        placeholder="Project Name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className={getFieldError("projectName") ? "border-red-500" : ""}
                    />
                    {getFieldError("projectName") && (
                        <p className="text-sm text-red-500">{getFieldError("projectName")}</p>
                    )}
                </div>

                <div className="flex gap-2 text-sm items-center">
                    <div className="text-muted-foreground mr-auto">Network</div>
                    {/* <Badge className={`cursor-pointer bg-muted ${network === "legacynet" ? "bg-primary" : ""}`} onClick={() => { return; setNetwork("legacynet") }}>Legacynet</Badge> */}
                    <Badge className={`cursor-pointer bg-muted ${network === "mainnet" ? "bg-primary" : ""}`} onClick={() => setNetwork("mainnet")}>Mainnet</Badge>
                </div>

                {processType === "new" && (
                    <div className="space-y-1">
                        <div className="flex gap-2 text-sm items-center">
                            <div className="text-muted-foreground mr-auto">Module</div>
                            {customModuleId ? (
                                <Badge className="bg-primary">Custom</Badge>
                            ) : (
                                Object.entries(modules).map(([key, value]) => (
                                    <Badge
                                        key={key}
                                        className={`cursor-pointer bg-muted ${module_ === value ? "bg-primary" : ""}`}
                                        onClick={() => {
                                            setModule(value)
                                            setCustomModuleId("")
                                        }}
                                    >
                                        {key}
                                    </Badge>
                                ))
                            )}
                        </div>
                        {getFieldError("module") && (
                            <p className="text-sm text-red-500">{getFieldError("module")}</p>
                        )}
                    </div>
                )}

                {/* advanced options dropdown */}
                <details className="my-4">
                    <summary className="text-muted-foreground/80 cursor-pointer text-sm">Advanced Options</summary>
                    <div className="space-y-3 mt-3">
                        <div className="flex gap-2 text-sm items-center">
                            <div className="text-muted-foreground mr-auto">Process</div>
                            <Badge className={`cursor-pointer bg-muted ${processType === "new" ? "bg-primary" : ""}`} onClick={() => setProcessType("new")}>Create New</Badge>
                            <Badge className={`cursor-pointer bg-muted ${processType === "existing" ? "bg-primary" : ""}`} onClick={() => setProcessType("existing")}>Use Existing</Badge>
                        </div>

                        {processType === "existing" && (
                            <div className="space-y-1">
                                <div className="flex gap-2 text-sm items-center">
                                    <div className="text-muted-foreground mr-auto">Process ID</div>
                                    <Input
                                        placeholder="Paste Process ID"
                                        value={existingProcessId}
                                        onChange={(e) => setExistingProcessId(e.target.value)}
                                        className={`font-btr-code flex-1 ${getFieldError("existingProcessId") ? "border-red-500" : ""}`}
                                    />
                                </div>
                                {getFieldError("existingProcessId") && (
                                    <p className="text-sm text-red-500 ml-auto">{getFieldError("existingProcessId")}</p>
                                )}
                            </div>
                        )}

                        {processType === "new" && (
                            <div className="space-y-1">
                                <div className="flex gap-2 text-sm items-center">
                                    <div className="text-muted-foreground mr-auto">Module ID</div>
                                    <Input
                                        placeholder="Enter custom module ID (optional)"
                                        value={customModuleId}
                                        onChange={(e) => setCustomModuleId(e.target.value)}
                                        className={`font-btr-code flex-1 ${getFieldError("customModuleId") ? "border-red-500" : ""}`}
                                    />
                                </div>
                                {getFieldError("customModuleId") && (
                                    <p className="text-sm text-red-500 ml-auto">{getFieldError("customModuleId")}</p>
                                )}
                            </div>
                        )}

                        {processType === "new" && (
                            <div className="space-y-3">
                                <div className="text-muted-foreground text-sm">Custom Tags</div>

                                {/* Display existing tags */}
                                {customTags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {customTags.map((tag, index) => (
                                            <div key={index} className="group relative inline-flex items-center">
                                                <div className="flex items-center border border-border rounded-md overflow-hidden bg-background group-hover:pr-3 transition-all duration-150">
                                                    <div className="px-2 py-1 text-xs font-medium bg-primary/50 border-r border-border">
                                                        {tag.name}
                                                    </div>
                                                    <div className="px-2 py-1 text-xs font-btr-code">
                                                        {tag.value}
                                                    </div>
                                                </div>
                                                <button
                                                    className="absolute right-0.5 top-1/2 -translate-y-1/2 p-0.5 mr-0.5 rounded-sm hover:bg-muted/60 dark:hover:bg-muted/40 transition-all duration-150 opacity-0 group-hover:opacity-100"
                                                    onClick={() => removeTag(index)}
                                                    aria-label={`Remove ${tag.name} tag`}
                                                >
                                                    <X size={12} className="text-muted-foreground/70 hover:text-foreground/90" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add new tag form */}
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Tag name"
                                            value={newTagName}
                                            onChange={(e) => setNewTagName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && newTagName.trim() && newTagValue.trim()) {
                                                    e.preventDefault()
                                                    addTag()
                                                }
                                            }}
                                            className={`flex-1 ${getFieldError("tagName") ? "border-red-500" : ""}`}
                                        />
                                        <Input
                                            placeholder="Tag value"
                                            value={newTagValue}
                                            onChange={(e) => setNewTagValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && newTagName.trim() && newTagValue.trim()) {
                                                    e.preventDefault()
                                                    addTag()
                                                }
                                            }}
                                            className="flex-1 font-btr-code"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addTag}
                                            disabled={!newTagName.trim() || !newTagValue.trim()}
                                            className="px-3"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    {getFieldError("tagName") && (
                                        <p className="text-sm text-red-500">{getFieldError("tagName")}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">Press Enter to add tag</p>
                                </div>
                            </div>
                        )}
                    </div>
                </details>
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