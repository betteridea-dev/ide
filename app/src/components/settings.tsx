import { useState, useEffect, useMemo } from "react"
import { ArrowLeft, Moon, Sun, Save, RotateCcw, Settings as SettingsIcon, Edit3, Check, X, Plus, Tag as TagIcon, ChevronDown, ChevronRight, FileText } from "lucide-react"
import { useSearchParams } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useTheme } from "@/components/theme-provider"
import { useGlobalState } from "@/hooks/use-global-state"
import { useProjects } from "@/hooks/use-projects"
import { useSettings } from "@/hooks/use-settings"
import { toast } from "sonner"
import { cn, validateArweaveId, pingUrl, pingGraphql } from "@/lib/utils"
import { MainnetAO } from "@/lib/ao"
import Constants from "@/lib/constants"
import { useActiveAddress, useApi } from "@arweave-wallet-kit/react"
import { createSigner } from "@permaweb/aoconnect"
import { Badge } from "./ui/badge"

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

export default function Settings() {
    const { theme, setTheme } = useTheme()
    const globalState = useGlobalState()
    const projects = useProjects()
    const settings = useSettings()
    const activeAddress = useActiveAddress()
    const api = useApi()
    const [searchParams, setSearchParams] = useSearchParams()

    // Local state for UI inputs (for URLs and API key)
    const [customCuUrl, setCustomCuUrl] = useState(settings.actions.getCuUrl())
    const [customHbUrl, setCustomHbUrl] = useState(settings.actions.getHbUrl())
    const [customGatewayUrl, setCustomGatewayUrl] = useState(settings.actions.getGatewayUrl())
    const [customGraphqlUrl, setCustomGraphqlUrl] = useState(settings.actions.getGraphqlUrl())
    const [geminiApiKey, setGeminiApiKey] = useState(() => {
        const key = settings.actions.getGeminiApiKey()
        return key ? "*".repeat(key.length) : ""
    })

    // Debounced URL states for pinging (500ms delay)
    const debouncedCuUrl = useDebounce(customCuUrl, 500)
    const debouncedHbUrl = useDebounce(customHbUrl, 500)
    const debouncedGatewayUrl = useDebounce(customGatewayUrl, 500)
    const debouncedGraphqlUrl = useDebounce(customGraphqlUrl, 500)

    // Tab state - check URL params for initial tab
    const [activeTab, setActiveTab] = useState(() => {
        const tabParam = searchParams.get("tab")
        return tabParam && ["general", "editor", "network", "project"].includes(tabParam) ? tabParam : "general"
    })

    // Handle tab changes and update URL
    const handleTabChange = (newTab: string) => {
        setActiveTab(newTab)
        const newParams = new URLSearchParams(searchParams)
        if (newTab === "general") {
            newParams.delete("tab") // Remove tab param for default tab
        } else {
            newParams.set("tab", newTab)
        }
        setSearchParams(newParams)
    }

    // Listen for URL parameter changes (e.g., browser back/forward)
    useEffect(() => {
        const tabParam = searchParams.get("tab")
        const validTab = tabParam && ["general", "editor", "network", "project"].includes(tabParam) ? tabParam : "general"
        if (validTab !== activeTab) {
            setActiveTab(validTab)
        }
    }, [searchParams, activeTab])

    // Helper function to handle back navigation
    const handleBackNavigation = () => {
        // Clear URL parameters when going back
        setSearchParams(new URLSearchParams())
        globalState.actions.setActiveView(null)
    }

    // Ping state
    const [pingResults, setPingResults] = useState<{
        cu: { latency?: number; success: boolean; error?: string } | null
        hb: { latency?: number; success: boolean; error?: string } | null
        gateway: { latency?: number; success: boolean; error?: string } | null
        graphql: { latency?: number; success: boolean; error?: string } | null
    }>({
        cu: null,
        hb: null,
        gateway: null,
        graphql: null
    })

    // Process editing state
    const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false)
    const [processEditMode, setProcessEditMode] = useState<"paste" | "spawn" | null>(null)
    const [editProcessId, setEditProcessId] = useState("")
    const [isSpawningProcess, setIsSpawningProcess] = useState(false)

    // Custom tags for process spawning
    const [customTags, setCustomTags] = useState<{ name: string; value: string }[]>([])
    const [newTagName, setNewTagName] = useState("")
    const [newTagValue, setNewTagValue] = useState("")
    const [tagErrors, setTagErrors] = useState<string[]>([])

    // Files section state
    const [isFilesSectionExpanded, setIsFilesSectionExpanded] = useState(false)
    const [fileProcessDialogOpen, setFileProcessDialogOpen] = useState(false)
    const [fileProcessEditMode, setFileProcessEditMode] = useState<"paste" | "spawn" | null>(null)
    const [selectedFileName, setSelectedFileName] = useState("")
    const [editFileProcessId, setEditFileProcessId] = useState("")
    const [isSpawningFileProcess, setIsSpawningFileProcess] = useState(false)
    const [fileCustomTags, setFileCustomTags] = useState<{ name: string; value: string }[]>([])
    const [fileNewTagName, setFileNewTagName] = useState("")
    const [fileNewTagValue, setFileNewTagValue] = useState("")
    const [fileTagErrors, setFileTagErrors] = useState<string[]>([])

    const activeProject = globalState.activeProject ? projects.projects[globalState.activeProject] : null

    // Get filtered files (.lua and .luanb only)
    const filteredFiles = activeProject ? Object.values(activeProject.files).filter(file =>
        file.name.endsWith('.lua') || file.name.endsWith('.luanb')
    ) : []

    // Ping URLs when network tab is active and URLs change (debounced)
    useEffect(() => {
        if (activeTab !== "network") {
            // Reset ping results when leaving network tab
            setPingResults({ cu: null, hb: null, gateway: null, graphql: null })
            return
        }

        // Pinging URLs

        const pingUrls = async () => {
            try {
                const [cuResult, hbResult, gatewayResult, graphqlResult] = await Promise.all([
                    pingUrl(debouncedCuUrl),
                    pingUrl(debouncedHbUrl),
                    pingUrl(debouncedGatewayUrl),
                    pingGraphql(debouncedGraphqlUrl)
                ])

                // Ping results logged

                setPingResults({
                    cu: cuResult,
                    hb: hbResult,
                    gateway: gatewayResult,
                    graphql: graphqlResult
                })
            } catch (error) {
                // Error pinging URLs
            }
        }

        // Initial ping with debounced URLs
        pingUrls()

        // Set up interval for continuous pinging every 3 seconds
        const interval = setInterval(pingUrls, 3000)

        return () => clearInterval(interval)
    }, [activeTab, debouncedCuUrl, debouncedHbUrl, debouncedGatewayUrl, debouncedGraphqlUrl])

    // Helper function to render ping status
    const renderPingStatus = (result: { latency?: number; success: boolean; error?: string; status?: number } | null) => {
        if (!result) {
            return <span className="text-xs text-muted-foreground font-btr-code">pinging...</span>
        }

        if (!result.success) {
            const errorText = result.error || "error"
            const shortError = errorText.length > 20 ? errorText.substring(0, 20) + "..." : errorText
            return (
                <span
                    className="text-xs text-red-500 font-btr-code cursor-help"
                    title={result.error || "Unknown error"}
                >
                    {shortError}
                </span>
            )
        }

        const latency = result.latency || 0
        const color = latency < 500 ? 'text-green-500' : latency < 1000 ? 'text-yellow-500' : 'text-red-500'

        // Show latency with status code on hover for successful requests
        return (
            <span
                className={`text-xs font-btr-code ${color} cursor-help`}
                title={result.status ? `HTTP ${result.status} - ${latency}ms` : `${latency}ms`}
            >
                {latency}ms
            </span>
        )
    }

    const handleVimModeChange = (enabled: boolean) => {
        settings.actions.setVimMode(enabled)
        localStorage.setItem("betteridea-vim-mode", enabled.toString())
        toast.success(`VIM mode ${enabled ? "enabled" : "disabled"}`)
    }

    const handleSaveAllUrls = () => {
        // Validate all URLs first
        const urls = [
            { type: "CU", url: customCuUrl },
            { type: "Hyperbeam", url: customHbUrl },
            { type: "Gateway", url: customGatewayUrl },
            { type: "GraphQL", url: customGraphqlUrl }
        ]

        for (const { type, url } of urls) {
            if (!settings.actions.isValidUrl(url)) {
                toast.error(`Invalid ${type} URL format`)
                return
            }
        }

        // Save all URLs if validation passes
        settings.actions.setCU_URL(customCuUrl)
        settings.actions.setHB_URL(customHbUrl)
        settings.actions.setGATEWAY_URL(customGatewayUrl)
        settings.actions.setGRAPHQL_URL(customGraphqlUrl)

        toast.success("Network settings saved successfully")

        // Refresh the app to apply new network settings
        setTimeout(() => {
            window.location.reload()
        }, 1000) // Small delay to show the success message
    }

    const handleUrlReset = (type: "cu" | "hb" | "gateway" | "graphql") => {
        switch (type) {
            case "cu":
                settings.actions.resetCuUrl()
                setCustomCuUrl(settings.actions.getCuUrl())
                break
            case "hb":
                settings.actions.resetHbUrl()
                setCustomHbUrl(settings.actions.getHbUrl())
                break
            case "gateway":
                settings.actions.resetGatewayUrl()
                setCustomGatewayUrl(settings.actions.getGatewayUrl())
                break
            case "graphql":
                settings.actions.resetGraphqlUrl()
                setCustomGraphqlUrl(settings.actions.getGraphqlUrl())
                break
        }
        toast.success(`${type.toUpperCase()} URL reset to default`)
    }

    const handleResetAllUrls = () => {
        settings.actions.resetCuUrl()
        settings.actions.resetHbUrl()
        settings.actions.resetGatewayUrl()
        settings.actions.resetGraphqlUrl()

        setCustomCuUrl(settings.actions.getCuUrl())
        setCustomHbUrl(settings.actions.getHbUrl())
        setCustomGatewayUrl(settings.actions.getGatewayUrl())
        setCustomGraphqlUrl(settings.actions.getGraphqlUrl())

        toast.success("All network settings reset to defaults")
    }

    const handleGeminiKeySave = () => {
        if (geminiApiKey.match(/^\*+$/)) return

        if (!settings.actions.isValidGeminiKey(geminiApiKey)) {
            toast.error("Invalid Gemini API Key")
            return
        }

        settings.actions.setGeminiApiKey(geminiApiKey)
        toast.success("Gemini API Key saved")
        setGeminiApiKey("*".repeat(geminiApiKey.length))
    }

    const handleEditProcess = () => {
        setIsProcessDialogOpen(true)
        setProcessEditMode(null)
        setEditProcessId("")
    }

    const handleSelectPasteMode = () => {
        setProcessEditMode("paste")
        setEditProcessId(activeProject?.process || "")
    }

    const handleSelectSpawnMode = () => {
        setProcessEditMode("spawn")
    }

    const handleCancelEditProcess = () => {
        setIsProcessDialogOpen(false)
        setProcessEditMode(null)
        setEditProcessId("")
        // Reset custom tags state
        setCustomTags([])
        setNewTagName("")
        setNewTagValue("")
        setTagErrors([])
    }

    const addTag = () => {
        if (!newTagName.trim() || !newTagValue.trim()) return

        const tagName = newTagName.trim()
        const tagValue = newTagValue.trim()

        // Clear previous errors
        setTagErrors([])

        // Check for reserved tag names
        const reservedTags = ["Name", "Module", "Scheduler", "SDK"]
        if (reservedTags.some(reserved => reserved.toLowerCase() === tagName.toLowerCase())) {
            setTagErrors([`"${tagName}" is a reserved tag name`])
            return
        }

        // Check if tag name already exists
        const existingTag = customTags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase())
        if (existingTag) {
            setTagErrors(["A tag with this name already exists"])
            return
        }

        // Validate tag name format (alphanumeric, hyphens, underscores)
        if (!/^[a-zA-Z0-9\-_]+$/.test(tagName)) {
            setTagErrors(["Tag name can only contain letters, numbers, hyphens, and underscores"])
            return
        }

        setCustomTags([...customTags, { name: tagName, value: tagValue }])
        setNewTagName("")
        setNewTagValue("")
    }

    const removeTag = (index: number) => {
        setCustomTags(customTags.filter((_, i) => i !== index))
        setTagErrors([]) // Clear errors when removing tags
    }

    const handleSaveProcess = () => {
        if (!activeProject) return

        const validation = validateArweaveId(editProcessId, "Process ID")
        if (!validation.isValid) {
            toast.error(validation.error || "Invalid Process ID")
            return
        }

        // Update the project with new process ID
        const updatedProject = {
            ...activeProject,
            process: editProcessId
        }

        projects.actions.setProject(updatedProject)
        setIsProcessDialogOpen(false)
        setProcessEditMode(null)
        toast.success("Process ID updated successfully")
    }

    const handleSpawnNewProcess = async () => {
        if (!activeProject || !activeAddress) {
            toast.error("Wallet connection required to spawn new process")
            return
        }

        if (!activeProject.isMainnet) {
            toast.error("Process spawning is only available for mainnet projects")
            return
        }

        setIsSpawningProcess(true)

        try {
            const signer = createSigner(api)
            const ao = new MainnetAO({
                GATEWAY_URL: settings.actions.getGatewayUrl(),
                HB_URL: settings.actions.getHbUrl(),
                signer
            })

            const tags = [
                { name: "Name", value: activeProject.name },
                ...customTags
            ]

            const processId = await ao.spawn({
                tags,
                module_: Constants.modules.mainnet.hyperAos
            })

            // Update the project with new process ID and current owner address
            const updatedProject = {
                ...activeProject,
                process: processId,
                ownerAddress: activeAddress // Update owner to current connected wallet
            }

            projects.actions.setProject(updatedProject)
            toast.success("New process spawned successfully")

            // Close dialog immediately after successful spawn
            setIsProcessDialogOpen(false)
            setProcessEditMode(null)
            // Reset custom tags state
            setCustomTags([])
            setNewTagName("")
            setNewTagValue("")
            setTagErrors([])

        } catch (error) {
            // Failed to spawn process
            toast.error(`Failed to spawn process: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setIsSpawningProcess(false)
        }
    }

    // File process management handlers
    const handleEditFileProcess = (fileName: string) => {
        setSelectedFileName(fileName)
        setFileProcessDialogOpen(true)

        // Check if file already has a process
        const file = activeProject?.files[fileName]
        if (file?.process) {
            // If file has a process, show paste mode by default with existing process ID
            setFileProcessEditMode("paste")
            setEditFileProcessId(file.process)
        } else {
            // If no process, show selection mode
            setFileProcessEditMode(null)
            setEditFileProcessId("")
        }

        // Reset file-specific state
        setFileCustomTags([])
        setFileNewTagName("")
        setFileNewTagValue("")
        setFileTagErrors([])
    }

    const handleSelectFilePasteMode = () => {
        setFileProcessEditMode("paste")
        const file = activeProject?.files[selectedFileName]
        setEditFileProcessId(file?.process || "")
    }

    const handleSelectFileSpawnMode = () => {
        setFileProcessEditMode("spawn")
    }

    const handleResetFileProcess = () => {
        setEditFileProcessId("")
    }

    const handleCancelEditFileProcess = () => {
        setFileProcessDialogOpen(false)
        setFileProcessEditMode(null)
        setSelectedFileName("")
        setEditFileProcessId("")
        // Reset file-specific state
        setFileCustomTags([])
        setFileNewTagName("")
        setFileNewTagValue("")
        setFileTagErrors([])
    }

    const addFileTag = () => {
        if (!fileNewTagName.trim() || !fileNewTagValue.trim()) return

        const tagName = fileNewTagName.trim()
        const tagValue = fileNewTagValue.trim()

        // Clear previous errors
        setFileTagErrors([])

        // Check for reserved tag names
        const reservedTags = ["Name", "Module", "Scheduler", "SDK"]
        if (reservedTags.some(reserved => reserved.toLowerCase() === tagName.toLowerCase())) {
            setFileTagErrors([`"${tagName}" is a reserved tag name`])
            return
        }

        // Check if tag name already exists
        const existingTag = fileCustomTags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase())
        if (existingTag) {
            setFileTagErrors(["A tag with this name already exists"])
            return
        }

        // Validate tag name format (alphanumeric, hyphens, underscores)
        if (!/^[a-zA-Z0-9\-_]+$/.test(tagName)) {
            setFileTagErrors(["Tag name can only contain letters, numbers, hyphens, and underscores"])
            return
        }

        setFileCustomTags([...fileCustomTags, { name: tagName, value: tagValue }])
        setFileNewTagName("")
        setFileNewTagValue("")
    }

    const removeFileTag = (index: number) => {
        setFileCustomTags(fileCustomTags.filter((_, i) => i !== index))
        setFileTagErrors([]) // Clear errors when removing tags
    }

    const handleSaveFileProcess = () => {
        if (!activeProject || !selectedFileName) return

        // Allow empty process ID to remove file's process assignment
        if (editFileProcessId.trim()) {
            const validation = validateArweaveId(editFileProcessId, "Process ID")
            if (!validation.isValid) {
                toast.error(validation.error || "Invalid Process ID")
                return
            }
        }

        // Update the file with new process ID (or remove it if empty)
        const updatedFile = {
            ...activeProject.files[selectedFileName],
            process: editFileProcessId.trim() || undefined
        }

        projects.actions.setFile(activeProject.name, updatedFile)
        setFileProcessDialogOpen(false)
        setFileProcessEditMode(null)

        if (editFileProcessId.trim()) {
            toast.success(`Process ID updated for ${selectedFileName}`)
        } else {
            toast.success(`Process ID removed for ${selectedFileName} (will use project default)`)
        }
    }

    const handleSpawnNewFileProcess = async () => {
        if (!activeProject || !activeAddress || !selectedFileName) {
            toast.error("Wallet connection required to spawn new process")
            return
        }

        if (!activeProject.isMainnet) {
            toast.error("Process spawning is only available for mainnet projects")
            return
        }

        setIsSpawningFileProcess(true)

        try {
            const signer = createSigner(api)
            const ao = new MainnetAO({
                GATEWAY_URL: settings.actions.getGatewayUrl(),
                HB_URL: settings.actions.getHbUrl(),
                signer
            })

            const tags = [
                { name: "Name", value: `${activeProject.name}-${selectedFileName}` },
                ...fileCustomTags
            ]

            const processId = await ao.spawn({
                tags,
                module_: Constants.modules.mainnet.hyperAos
            })

            // Update the file with new process ID
            const updatedFile = {
                ...activeProject.files[selectedFileName],
                process: processId
            }

            projects.actions.setFile(activeProject.name, updatedFile)
            toast.success(`New process spawned for ${selectedFileName}`)

            // Close dialog immediately after successful spawn
            setFileProcessDialogOpen(false)
            setFileProcessEditMode(null)
            // Reset file-specific state
            setFileCustomTags([])
            setFileNewTagName("")
            setFileNewTagValue("")
            setFileTagErrors([])

        } catch (error) {
            // Failed to spawn file process
            toast.error(`Failed to spawn process: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setIsSpawningFileProcess(false)
        }
    }

    return (
        <div className="h-full flex flex-col bg-background text-foreground">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border/40 bg-sidebar/30">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={handleBackNavigation}
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Back
                </Button>
                <Separator orientation="vertical" className="h-4" />
                <SettingsIcon size={16} className="text-muted-foreground" />
                <h1 className="text-sm font-medium">Settings</h1>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                <div className="max-w-4xl mx-auto p-6 space-y-6">

                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 items-center justify-center bg-muted/30">
                            <TabsTrigger
                                value="general"
                                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                            >
                                General
                            </TabsTrigger>
                            <TabsTrigger
                                value="editor"
                                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                            >
                                Editor
                            </TabsTrigger>
                            <TabsTrigger
                                value="network"
                                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                            >
                                Network
                            </TabsTrigger>
                            <TabsTrigger
                                id="project-settings"
                                value="project"
                                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                            >
                                Project
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="space-y-4 mt-6">
                            <Card className="border-border/40 bg-card/50">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-medium">Appearance</CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground">
                                        Customize the look and feel of your IDE
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label className="text-sm font-medium">Theme</Label>
                                            <div className="text-xs text-muted-foreground">
                                                Choose your preferred color scheme
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Button
                                                variant={theme === "light" ? "default" : "ghost"}
                                                size="sm"
                                                onClick={() => setTheme("light")}
                                                className={cn(
                                                    "h-8 px-3 text-xs",
                                                    theme === "light" && "bg-primary text-primary-foreground"
                                                )}
                                            >
                                                <Sun className="h-3 w-3 mr-1.5" />
                                                Light
                                            </Button>
                                            <Button
                                                variant={theme === "dark" ? "default" : "ghost"}
                                                size="sm"
                                                onClick={() => setTheme("dark")}
                                                className={cn(
                                                    "h-8 px-3 text-xs",
                                                    theme === "dark" && "bg-primary text-primary-foreground"
                                                )}
                                            >
                                                <Moon className="h-3 w-3 mr-1.5" />
                                                Dark
                                            </Button>
                                            <Button
                                                variant={theme === "system" ? "default" : "ghost"}
                                                size="sm"
                                                onClick={() => setTheme("system")}
                                                className={cn(
                                                    "h-8 px-3 text-xs",
                                                    theme === "system" && "bg-primary text-primary-foreground"
                                                )}
                                            >
                                                System
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="editor" className="space-y-4 mt-6">
                            <Card className="border-border/40 bg-card/50">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-medium">Editor Preferences</CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground">
                                        Configure your code editing experience
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label htmlFor="vim-mode" className="text-sm font-medium">VIM Mode (buggy, help needed, not recommended)</Label>
                                            <div className="text-xs text-muted-foreground">
                                                Enable VIM keybindings in the editor
                                            </div>
                                        </div>
                                        <Switch
                                            id="vim-mode"
                                            checked={settings.actions.getVimMode()}
                                            onCheckedChange={handleVimModeChange}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="network" className="space-y-4 mt-6">
                            <Card className="border-border/40 bg-card/50">
                                <div className="flex justify-between items-center">
                                    <CardHeader className="pb-3 grow">
                                        <CardTitle className="text-base font-medium">AO Network Configuration</CardTitle>
                                        <CardDescription className="text-xs text-muted-foreground">
                                            Configure custom URLs for AO services
                                        </CardDescription>
                                    </CardHeader>
                                    <Button
                                        onClick={handleSaveAllUrls}
                                        size="sm"
                                        className="flex items-center gap-2 w-fit mr-8"
                                    >
                                        <Save className="h-3 w-3" />
                                        Save Network Settings
                                    </Button>
                                </div>

                                <CardContent className="space-y-5">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-start gap-2">
                                            <Label htmlFor="cu-url" className="text-sm font-medium">CU URL</Label>
                                            {renderPingStatus(pingResults.cu)}
                                        </div>
                                        <div className="flex space-x-2">
                                            <Input
                                                id="cu-url"
                                                placeholder="https://cu.arweave.tech"
                                                value={customCuUrl}
                                                onChange={(e) => setCustomCuUrl(e.target.value)}
                                                className="bg-background/50 border-border/60 text-sm font-btr-code"
                                            />
                                            <Button
                                                onClick={() => handleUrlReset("cu")}
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 px-3"
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <div className="space-x-1">
                                            {Constants.CUs.map((cu) => (
                                                <Badge
                                                    key={cu}
                                                    variant="outline"
                                                    className={cn("cursor-pointer", customCuUrl.replace("https://", "").replace("http://", "") === cu && "bg-primary text-primary-foreground")}
                                                    onClick={() => setCustomCuUrl("https://" + cu)}
                                                >
                                                    {cu}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-start gap-2">
                                            <Label htmlFor="hb-url" className="text-sm font-medium">Hyperbeam URL</Label>
                                            {renderPingStatus(pingResults.hb)}
                                        </div>
                                        <div className="flex space-x-2">
                                            <Input
                                                id="hb-url"
                                                placeholder="https://forward.computer"
                                                value={customHbUrl}
                                                onChange={(e) => setCustomHbUrl(e.target.value)}
                                                className="bg-background/50 border-border/60 text-sm font-btr-code"
                                            />
                                            <Button
                                                onClick={() => handleUrlReset("hb")}
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 px-3"
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <div className="space-x-1">
                                            {Constants.nodes.map((node) => (
                                                <Badge
                                                    key={node}
                                                    variant="outline"
                                                    className={cn("cursor-pointer", customHbUrl.replace("https://", "").replace("http://", "") === node && "bg-primary text-primary-foreground")}
                                                    onClick={() => setCustomHbUrl("https://" + node)}
                                                >
                                                    {node}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-start gap-2">
                                            <Label htmlFor="gateway-url" className="text-sm font-medium">Gateway URL</Label>
                                            {renderPingStatus(pingResults.gateway)}
                                        </div>
                                        <div className="flex space-x-2">
                                            <Input
                                                id="gateway-url"
                                                placeholder="https://arweave.tech"
                                                value={customGatewayUrl}
                                                onChange={(e) => setCustomGatewayUrl(e.target.value)}
                                                className="bg-background/50 border-border/60 text-sm font-btr-code"
                                            />
                                            <Button
                                                onClick={() => handleUrlReset("gateway")}
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 px-3"
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <div className="space-x-1">
                                            {Constants.Gateways.map((gateway) => (
                                                <Badge
                                                    key={gateway}
                                                    variant="outline"
                                                    className={cn("cursor-pointer", customGatewayUrl.replace("https://", "").replace("http://", "") === gateway && "bg-primary text-primary-foreground")}
                                                    onClick={() => setCustomGatewayUrl("https://" + gateway)}
                                                >
                                                    {gateway}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-start gap-2">
                                            <Label htmlFor="graphql-url" className="text-sm font-medium">GraphQL URL</Label>
                                            {renderPingStatus(pingResults.graphql)}
                                        </div>
                                        <div className="flex space-x-2">
                                            <Input
                                                id="graphql-url"
                                                placeholder="https://arweave.tech/graphql"
                                                value={customGraphqlUrl}
                                                onChange={(e) => setCustomGraphqlUrl(e.target.value)}
                                                className="bg-background/50 border-border/60 text-sm font-btr-code"
                                            />
                                            <Button
                                                onClick={() => handleUrlReset("graphql")}
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 px-3"
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* <div className="flex gap-2 pt-2 justify-end">
                                        <Button
                                            onClick={handleSaveAllUrls}
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <Save className="h-3 w-3" />
                                            Save Network Settings
                                        </Button>
                                        <Button
                                            onClick={handleResetAllUrls}
                                            variant="ghost"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <RotateCcw className="h-3 w-3" />
                                            Reset All to Defaults
                                        </Button>
                                    </div> */}

                                    <div className="text-xs text-muted-foreground bg-muted/50 border border-border/40 p-3 rounded-md">
                                        <strong>Note:</strong> When using custom URLs, it is recommended to use the same providers for CU, Hyperbeam, Gateway & GraphQL for optimal performance. The app will refresh after saving to apply the new settings.
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="project" className="space-y-4 mt-6">
                            {activeProject ? (
                                <Card className="border-border/40 bg-card/50">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-base font-medium">Current Project</CardTitle>
                                        <CardDescription className="text-xs text-muted-foreground">
                                            Settings for {activeProject.name}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between py-2 border-b border-border/30">
                                                <Label className="text-sm font-medium">Owner Wallet</Label>
                                                <p className="text-sm font-btr-code text-foreground/80 truncate">
                                                    {activeProject.ownerAddress || <span className="text-muted-foreground italic">Not set</span>}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between py-2 border-b border-border/30">
                                                <Label className="text-sm font-medium">Default Process</Label>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        onClick={handleEditProcess}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Edit3 className="h-3 w-3" />
                                                    </Button>
                                                    <p className="text-sm font-btr-code text-foreground/80 truncate">
                                                        {activeProject.process || <span className="text-muted-foreground italic">Not set</span>}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between py-2 border-b border-border/30">
                                                <Label className="text-sm font-medium">Network</Label>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${activeProject.isMainnet ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                                    <p className="text-sm font-medium">
                                                        {activeProject.isMainnet ? "Mainnet" : "Testnet"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-2 -mx-3">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setIsFilesSectionExpanded(!isFilesSectionExpanded)}
                                                    className="w-full justify-between py-2 px-0 h-auto hover:bg-transparent"
                                                >
                                                    <Label className="text-sm font-medium cursor-pointer">Files ({filteredFiles.length})</Label>
                                                    {isFilesSectionExpanded ? (
                                                        <ChevronDown className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )}
                                                </Button>

                                                {isFilesSectionExpanded && (
                                                    <div className="space-y-2 pl-4 border-l border-border/30">
                                                        {filteredFiles.length > 0 ? (
                                                            filteredFiles.map((file) => (
                                                                <div key={file.name} className="flex items-center justify-between py-2 border-b border-border/30 last:border-b-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <FileText className="h-3 w-3 text-muted-foreground" />
                                                                        <Label className="text-sm font-medium">{file.name}</Label>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Button
                                                                            onClick={() => handleEditFileProcess(file.name)}
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 w-8 p-0"
                                                                        >
                                                                            <Edit3 className="h-3 w-3" />
                                                                        </Button>
                                                                        <p className="text-sm font-btr-code text-foreground/80 break-all">
                                                                            {file.process ? (
                                                                                file.process
                                                                            ) : (
                                                                                <span className="text-muted-foreground italic">
                                                                                    default
                                                                                </span>
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-xs text-muted-foreground pl-5">
                                                                No .lua or .luanb files found
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="border-border/40 bg-card/50">
                                    <CardContent className="flex items-center justify-center py-12">
                                        <div className="text-center space-y-2">
                                            <p className="text-muted-foreground text-sm">No active project</p>
                                            <p className="text-xs text-muted-foreground">
                                                Open a project to view its settings
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Process Edit Dialog */}
            <AlertDialog open={isProcessDialogOpen} onOpenChange={(open) => {
                // Prevent closing dialog while spawning process
                if (!open && isSpawningProcess) return
                setIsProcessDialogOpen(open)
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Edit Default Process</AlertDialogTitle>
                        <AlertDialogDescription>
                            Choose how you want to update the default process for this project.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {processEditMode === null && (
                        <div className="space-y-4">
                            <Button
                                onClick={handleSelectPasteMode}
                                variant="outline"
                                className="w-full justify-start h-auto p-4"
                            >
                                <div className="text-left">
                                    <div className="font-medium">Paste Existing Process ID</div>
                                    <div className="text-sm text-muted-foreground">Enter an existing process ID to use</div>
                                </div>
                            </Button>

                            {activeProject?.isMainnet && activeAddress && (
                                <Button
                                    onClick={handleSelectSpawnMode}
                                    variant="outline"
                                    className="w-full justify-start h-auto p-4"
                                >
                                    <div className="text-left">
                                        <div className="font-medium">Spawn New Process</div>
                                        <div className="text-sm text-muted-foreground">Create a new process on the blockchain</div>
                                    </div>
                                </Button>
                            )}
                        </div>
                    )}

                    {processEditMode === "paste" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="process-id">Process ID</Label>
                                <Input
                                    id="process-id"
                                    value={editProcessId}
                                    onChange={(e) => setEditProcessId(e.target.value)}
                                    placeholder="Enter process ID"
                                    className="font-btr-code"
                                />
                            </div>
                        </div>
                    )}

                    {processEditMode === "spawn" && (
                        <div className="space-y-4">
                            <div className="p-4 bg-muted/50 rounded-md">
                                <p className="text-sm">
                                    This will create a new process on the blockchain using the HyperAOS module.
                                    {!activeProject?.isMainnet && (
                                        <span className="text-red-500"> Process spawning is only available for mainnet projects.</span>
                                    )}
                                    {!activeAddress && (
                                        <span className="text-red-500"> Please connect your wallet to spawn a new process.</span>
                                    )}
                                </p>
                                {isSpawningProcess && (
                                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                            🔄 Spawning process on the blockchain... This may take a few moments.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Custom Tags Section */}
                            {!isSpawningProcess && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <TagIcon className="w-4 h-4" />
                                        <Label className="text-sm font-medium">Custom Tags</Label>
                                    </div>

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
                                                className="flex-1"
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
                                        {tagErrors.length > 0 && (
                                            <div className="space-y-1">
                                                {tagErrors.map((error, index) => (
                                                    <p key={index} className="text-sm text-red-500">{error}</p>
                                                ))}
                                            </div>
                                        )}
                                        <p className="text-xs text-muted-foreground">Press Enter to add tag</p>
                                    </div>
                                </div>
                            )}

                            {isSpawningProcess && (
                                <div className="text-xs text-muted-foreground">
                                    <p>• Creating new process with HyperAOS module</p>
                                    <p>• Updating project with new process ID</p>
                                    <p>• Updating owner to current wallet: {activeAddress?.slice(0, 8)}...{activeAddress?.slice(-8)}</p>
                                    {customTags.length > 0 && (
                                        <p>• Adding {customTags.length} custom tag{customTags.length > 1 ? 's' : ''}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={handleCancelEditProcess}
                            disabled={isSpawningProcess}
                        >
                            Cancel
                        </AlertDialogCancel>

                        {processEditMode === "paste" && (
                            <AlertDialogAction onClick={handleSaveProcess}>
                                Save Process ID
                            </AlertDialogAction>
                        )}

                        {processEditMode === "spawn" && (
                            <Button
                                onClick={handleSpawnNewProcess}
                                disabled={isSpawningProcess || !activeProject?.isMainnet || !activeAddress}
                            >
                                {isSpawningProcess ? "Spawning..." : "Spawn Process"}
                            </Button>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* File Process Edit Dialog */}
            <AlertDialog open={fileProcessDialogOpen} onOpenChange={(open) => {
                // Prevent closing dialog while spawning process
                if (!open && isSpawningFileProcess) return
                setFileProcessDialogOpen(open)
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Edit Process for {selectedFileName}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Choose how you want to update the process for this file. If no process is set, the file will use the project's default process.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {fileProcessEditMode === null && (
                        <div className="space-y-4">
                            <Button
                                onClick={handleSelectFilePasteMode}
                                variant="outline"
                                className="w-full justify-start h-auto p-4"
                            >
                                <div className="text-left">
                                    <div className="font-medium">Paste Existing Process ID</div>
                                    <div className="text-sm text-muted-foreground">Enter an existing process ID to use for this file</div>
                                </div>
                            </Button>

                            {activeProject?.isMainnet && activeAddress && (
                                <Button
                                    onClick={handleSelectFileSpawnMode}
                                    variant="outline"
                                    className="w-full justify-start h-auto p-4"
                                >
                                    <div className="text-left">
                                        <div className="font-medium">Spawn New Process</div>
                                        <div className="text-sm text-muted-foreground">Create a new process on the blockchain for this file</div>
                                    </div>
                                </Button>
                            )}
                        </div>
                    )}

                    {fileProcessEditMode === "paste" && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="file-process-id">Process ID</Label>
                                <div className="flex space-x-2">
                                    <Input
                                        id="file-process-id"
                                        value={editFileProcessId}
                                        onChange={(e) => setEditFileProcessId(e.target.value)}
                                        placeholder="Enter process ID (leave empty to use project process)"
                                        className="font-btr-code flex-1"
                                    />
                                    <Button
                                        onClick={handleResetFileProcess}
                                        variant="ghost"
                                        size="sm"
                                        className="h-9 px-3"
                                        title="Reset and show options"
                                    >
                                        <RotateCcw className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>

                            {/* Show spawn new process option below when in paste mode */}
                            {activeProject?.isMainnet && activeAddress && (
                                <div className="pt-2 border-t border-border/30">
                                    <Button
                                        onClick={handleSelectFileSpawnMode}
                                        variant="outline"
                                        className="w-full justify-start h-auto p-4"
                                    >
                                        <div className="text-left">
                                            <div className="font-medium">Spawn New Process</div>
                                            <div className="text-sm text-muted-foreground">Create a new process on the blockchain for this file</div>
                                        </div>
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {fileProcessEditMode === "spawn" && (
                        <div className="space-y-4">
                            <div className="p-4 bg-muted/50 rounded-md">
                                <p className="text-sm">
                                    This will create a new process on the blockchain using the HyperAOS module for {selectedFileName}.
                                    {!activeProject?.isMainnet && (
                                        <span className="text-red-500"> Process spawning is only available for mainnet projects.</span>
                                    )}
                                    {!activeAddress && (
                                        <span className="text-red-500"> Please connect your wallet to spawn a new process.</span>
                                    )}
                                </p>
                                {isSpawningFileProcess && (
                                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                            🔄 Spawning process on the blockchain... This may take a few moments.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Custom Tags Section */}
                            {!isSpawningFileProcess && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <TagIcon className="w-4 h-4" />
                                        <Label className="text-sm font-medium">Custom Tags</Label>
                                    </div>

                                    {/* Display existing tags */}
                                    {fileCustomTags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {fileCustomTags.map((tag, index) => (
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
                                                        onClick={() => removeFileTag(index)}
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
                                                value={fileNewTagName}
                                                onChange={(e) => setFileNewTagName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && fileNewTagName.trim() && fileNewTagValue.trim()) {
                                                        e.preventDefault()
                                                        addFileTag()
                                                    }
                                                }}
                                                className="flex-1"
                                            />
                                            <Input
                                                placeholder="Tag value"
                                                value={fileNewTagValue}
                                                onChange={(e) => setFileNewTagValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && fileNewTagName.trim() && fileNewTagValue.trim()) {
                                                        e.preventDefault()
                                                        addFileTag()
                                                    }
                                                }}
                                                className="flex-1 font-btr-code"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addFileTag}
                                                disabled={!fileNewTagName.trim() || !fileNewTagValue.trim()}
                                                className="px-3"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        {fileTagErrors.length > 0 && (
                                            <div className="space-y-1">
                                                {fileTagErrors.map((error, index) => (
                                                    <p key={index} className="text-sm text-red-500">{error}</p>
                                                ))}
                                            </div>
                                        )}
                                        <p className="text-xs text-muted-foreground">Press Enter to add tag</p>
                                    </div>
                                </div>
                            )}

                            {isSpawningFileProcess && (
                                <div className="text-xs text-muted-foreground">
                                    <p>• Creating new process with HyperAOS module</p>
                                    <p>• Updating {selectedFileName} with new process ID</p>
                                    <p>• Process will be owned by: {activeAddress?.slice(0, 8)}...{activeAddress?.slice(-8)}</p>
                                    {fileCustomTags.length > 0 && (
                                        <p>• Adding {fileCustomTags.length} custom tag{fileCustomTags.length > 1 ? 's' : ''}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={handleCancelEditFileProcess}
                            disabled={isSpawningFileProcess}
                        >
                            Cancel
                        </AlertDialogCancel>

                        {fileProcessEditMode === "paste" && (
                            <AlertDialogAction onClick={handleSaveFileProcess}>
                                {editFileProcessId.trim() ? "Save Process ID" : "Remove Process ID"}
                            </AlertDialogAction>
                        )}

                        {fileProcessEditMode === "spawn" && (
                            <Button
                                onClick={handleSpawnNewFileProcess}
                                disabled={isSpawningFileProcess || !activeProject?.isMainnet || !activeAddress}
                            >
                                {isSpawningFileProcess ? "Spawning..." : "Spawn Process"}
                            </Button>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
