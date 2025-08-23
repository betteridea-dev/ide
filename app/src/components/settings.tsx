import { useState } from "react"
import { ArrowLeft, Moon, Sun, Save, RotateCcw, Settings as SettingsIcon, Edit3, Check, X, Plus } from "lucide-react"
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
import { cn, validateArweaveId, createAOSigner } from "@/lib/utils"
import { MainnetAO } from "@/lib/ao"
import Constants from "@/lib/constants"
import { useActiveAddress } from "@arweave-wallet-kit/react"

export default function Settings() {
    const { theme, setTheme } = useTheme()
    const globalState = useGlobalState()
    const projects = useProjects()
    const settings = useSettings()
    const activeAddress = useActiveAddress()

    // Local state for UI inputs (for URLs and API key)
    const [customCuUrl, setCustomCuUrl] = useState(settings.actions.getCuUrl())
    const [customHbUrl, setCustomHbUrl] = useState(settings.actions.getHbUrl())
    const [customGatewayUrl, setCustomGatewayUrl] = useState(settings.actions.getGatewayUrl())
    const [geminiApiKey, setGeminiApiKey] = useState(() => {
        const key = settings.actions.getGeminiApiKey()
        return key ? "*".repeat(key.length) : ""
    })

    // Process editing state
    const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false)
    const [processEditMode, setProcessEditMode] = useState<"paste" | "spawn" | null>(null)
    const [editProcessId, setEditProcessId] = useState("")
    const [isSpawningProcess, setIsSpawningProcess] = useState(false)

    const activeProject = globalState.activeProject ? projects.projects[globalState.activeProject] : null

    const handleVimModeChange = (enabled: boolean) => {
        settings.actions.setVimMode(enabled)
        toast.success(`VIM mode ${enabled ? "enabled" : "disabled"}`)
    }

    const handleUrlSave = (type: "cu" | "hb" | "gateway", url: string) => {
        if (!settings.actions.isValidUrl(url)) {
            toast.error("Invalid URL format")
            return
        }

        switch (type) {
            case "cu":
                settings.actions.setCU_URL(url)
                break
            case "hb":
                settings.actions.setHB_URL(url)
                break
            case "gateway":
                settings.actions.setGATEWAY_URL(url)
                break
        }
        toast.success(`${type.toUpperCase()} URL saved`)
    }

    const handleUrlReset = (type: "cu" | "hb" | "gateway") => {
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
        }
        toast.success(`${type.toUpperCase()} URL reset to default`)
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
            const signer = createAOSigner()
            const ao = new MainnetAO({
                GATEWAY_URL: settings.actions.getGatewayUrl(),
                HB_URL: settings.actions.getHbUrl(),
                signer
            })

            const tags = [
                { name: "Name", value: activeProject.name },
                { name: "Authority", value: Constants.authorities[0] }
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

            // Close dialog after successful spawn
            setTimeout(() => {
                setIsProcessDialogOpen(false)
                setProcessEditMode(null)
            }, 1000) // Small delay to show success message

        } catch (error) {
            console.error("Failed to spawn process:", error)
            toast.error(`Failed to spawn process: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setIsSpawningProcess(false)
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
                    onClick={() => globalState.actions.setActiveView(null)}
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

                    <Tabs defaultValue="general" className="w-full">
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
                                            <Label htmlFor="vim-mode" className="text-sm font-medium">VIM Mode</Label>
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
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-medium">AO Network Configuration</CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground">
                                        Configure custom URLs for AO services
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="cu-url" className="text-sm font-medium">CU URL</Label>
                                        <div className="flex space-x-2">
                                            <Input
                                                id="cu-url"
                                                placeholder="https://cu.arnode.asia"
                                                value={customCuUrl}
                                                onChange={(e) => setCustomCuUrl(e.target.value)}
                                                className="bg-background/50 border-border/60 text-sm font-btr-code"
                                            />
                                            <Button
                                                onClick={() => handleUrlSave("cu", customCuUrl)}
                                                size="sm"
                                                className="h-9 px-3"
                                            >
                                                <Save className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                onClick={() => handleUrlReset("cu")}
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 px-3"
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="hb-url" className="text-sm font-medium">Hyperbeam URL</Label>
                                        <div className="flex space-x-2">
                                            <Input
                                                id="hb-url"
                                                placeholder="https://hb.arnode.asia"
                                                value={customHbUrl}
                                                onChange={(e) => setCustomHbUrl(e.target.value)}
                                                className="bg-background/50 border-border/60 text-sm font-btr-code"
                                            />
                                            <Button
                                                onClick={() => handleUrlSave("hb", customHbUrl)}
                                                size="sm"
                                                className="h-9 px-3"
                                            >
                                                <Save className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                onClick={() => handleUrlReset("hb")}
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 px-3"
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="gateway-url" className="text-sm font-medium">Gateway URL</Label>
                                        <div className="flex space-x-2">
                                            <Input
                                                id="gateway-url"
                                                placeholder="https://arweave.net"
                                                value={customGatewayUrl}
                                                onChange={(e) => setCustomGatewayUrl(e.target.value)}
                                                className="bg-background/50 border-border/60 text-sm font-btr-code"
                                            />
                                            <Button
                                                onClick={() => handleUrlSave("gateway", customGatewayUrl)}
                                                size="sm"
                                                className="h-9 px-3"
                                            >
                                                <Save className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                onClick={() => handleUrlReset("gateway")}
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 px-3"
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="text-xs text-muted-foreground bg-muted/50 border border-border/40 p-3 rounded-md">
                                        <strong>Note:</strong> When using custom URLs, it is recommended to use the same providers for CU, Hyperbeam & Gateway for optimal performance.
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
                                            <div className="flex items-center justify-between py-2">
                                                <Label className="text-sm font-medium">Files</Label>
                                                <p className="text-sm font-medium text-foreground/80">
                                                    {Object.keys(activeProject.files).length} files
                                                </p>
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
                            {isSpawningProcess && (
                                <div className="text-xs text-muted-foreground">
                                    <p>• Creating new process with HyperAOS module</p>
                                    <p>• Updating project with new process ID</p>
                                    <p>• Updating owner to current wallet: {activeAddress?.slice(0, 8)}...{activeAddress?.slice(-8)}</p>
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
                            <AlertDialogAction
                                onClick={handleSpawnNewProcess}
                                disabled={isSpawningProcess || !activeProject?.isMainnet || !activeAddress}
                            >
                                {isSpawningProcess ? "Spawning..." : "Spawn Process"}
                            </AlertDialogAction>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
