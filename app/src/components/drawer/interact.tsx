import { useState, useEffect, useCallback, useRef } from "react"
import { useGlobalState } from "@/hooks/use-global-state"
import { useProjects } from "@/hooks/use-projects"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Send,
    Plus,
    Minus,
    Copy,
    Check,
    Loader2,
    ExternalLink,
    Tag as TagIcon,
    MessageSquare,
    X
} from "lucide-react"
import { MainnetAO, TestnetAO, type Tag } from "@/lib/ao"
import type { InteractState } from "@/hooks/use-projects"
import { parseOutput, shortenAddress } from "@/lib/utils"
import Constants from "@/lib/constants"
import { useSettings } from "@/hooks/use-settings"
import { createSigner } from "@permaweb/aoconnect"
import { useApi } from "@arweave-wallet-kit/react"
import JsonViewer from "../ui/json-viewer"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function Interact() {
    const globalState = useGlobalState()
    const projectsState = useProjects()
    const settings = useSettings()
    const api = useApi()

    const activeProject = globalState.activeProject ? projectsState.projects[globalState.activeProject] : null
    const savedInteractState = activeProject?.interactState

    // Form state - initialize from saved state or defaults
    const [target, setTarget] = useState<string>(activeProject?.process || "")
    const [selectedProcess, setSelectedProcess] = useState<string>(
        savedInteractState?.selectedProcess || activeProject?.process || "custom"
    )
    const [customProcessId, setCustomProcessId] = useState<string>(
        savedInteractState?.customProcessId || ""
    )
    const [action, setAction] = useState<string>(savedInteractState?.action || "")
    const [data, setData] = useState<string>(savedInteractState?.data || "")
    const [tags, setTags] = useState<Tag[]>(savedInteractState?.tags || [])
    const [newTagName, setNewTagName] = useState<string>("")
    const [newTagValue, setNewTagValue] = useState<string>("")

    // Interaction state
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [output, setOutput] = useState<string>("")
    const [messageId, setMessageId] = useState<string>("")
    const [luaCode, setLuaCode] = useState<string>("")
    const [isCopied, setIsCopied] = useState<boolean>(false)

    // No need for auto-save refs anymore



    // Manual save function
    const saveInteractState = () => {
        if (!globalState.activeProject) return

        const interactState: InteractState = {
            action,
            data,
            tags,
            customProcessId,
            selectedProcess
        }
        projectsState.actions.setInteractState(globalState.activeProject, interactState)
    }

    // Update target when active project changes
    useEffect(() => {
        if (activeProject?.process) {
            setTarget(activeProject.process)
            // Only update selectedProcess if there's no saved state
            if (!savedInteractState?.selectedProcess) {
                setSelectedProcess(activeProject.process)
            }
        } else {
            setTarget("")
            if (!savedInteractState?.selectedProcess) {
                setSelectedProcess("custom")
            }
        }
    }, [activeProject, savedInteractState])

    // Update target based on selected process
    useEffect(() => {
        if (selectedProcess === "custom") {
            setTarget(customProcessId)
        } else {
            setTarget(selectedProcess)
        }
    }, [selectedProcess, customProcessId])



    // Generate Lua code preview
    useEffect(() => {
        const targetProcess = target || activeProject?.process || ""
        const luaLines = [`send({`]
        luaLines.push(`    target = "${targetProcess}",`)

        if (action) {
            luaLines.push(`    action = "${action}",`)
        }

        if (data) {
            luaLines.push(`    data = "${data}",`)
        }

        tags.forEach(tag => {
            luaLines.push(`    ["${tag.name}"] = "${tag.value}",`)
        })

        luaLines.push(`})`)
        setLuaCode(luaLines.join('\n'))
    }, [target, action, data, tags, activeProject])

    // Get available processes for selection
    const getProcessOptions = () => {
        const options: { label: string; value: string }[] = []

        // Add current project process
        if (activeProject?.process) {
            options.push({
                label: `${activeProject.name}: ${shortenAddress(activeProject.process)}`,
                value: activeProject.process
            })
        }

        // Add other project processes
        Object.entries(projectsState.projects).forEach(([name, project]) => {
            if (project.process && project.process !== activeProject?.process) {
                options.push({
                    label: `${name}: ${shortenAddress(project.process)}`,
                    value: project.process
                })
            }
        })

        // Add custom option
        options.push({
            label: "Custom Process ID",
            value: "custom"
        })

        return options
    }

    const addTag = () => {
        if (!newTagName.trim() || !newTagValue.trim()) return

        setTags(prev => [...prev, { name: newTagName.trim(), value: newTagValue.trim() }])
        setNewTagName("")
        setNewTagValue("")
    }

    const removeTag = (index: number) => {
        setTags(prev => prev.filter((_, i) => i !== index))
    }

    const clearForm = () => {
        setTarget(activeProject?.process || "")
        setSelectedProcess(activeProject?.process || "custom")
        setCustomProcessId("")
        setAction("")
        setData("")
        setTags([])
    }

    const sendMessage = async () => {
        if (!target.trim()) return

        setIsLoading(true)
        setOutput("Sending message...")
        setMessageId("")

        try {
            const messageTags: Tag[] = []

            if (action) {
                messageTags.push({ name: "Action", value: action })
            }

            messageTags.push(...tags)
            console.log(api)

            // Use MainnetAO or TestnetAO based on project settings
            const ao = new MainnetAO({
                HB_URL: settings.HB_URL,
                GATEWAY_URL: settings.GATEWAY_URL,
                signer: createSigner(api)
            })

            const result = await ao.write({
                processId: target,
                tags: messageTags,
                data: data || undefined
            })
            console.log(result)

            setOutput(result)

        } catch (error) {
            console.error("Failed to send message:", error)
            setOutput(`Error: ${error}`)
        } finally {
            setIsLoading(false)
        }
    }

    const copyLuaCode = () => {
        navigator.clipboard.writeText(luaCode)
        setIsCopied(true)
        setTimeout(() => {
            setIsCopied(false)
        }, 1000)
    }

    if (!activeProject) {
        return (
            <div className="flex items-center justify-center h-full p-6 text-center">
                <div className="space-y-3">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-medium">No Active Project</h3>
                    <p className="text-sm text-muted-foreground">
                        Select or create a project to start interacting with AO processes.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full w-full flex flex-col">
            <div className="px-3 py-2 border-b border-border/40 bg-sidebar/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Interact
                        </span>
                    </div>
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 hover:bg-accent hidden sm:flex"
                            onClick={saveInteractState}
                        >
                            <span className="text-xs">Save</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 hover:bg-accent hidden sm:flex"
                            onClick={clearForm}
                        >
                            <span className="text-xs">Clear</span>
                        </Button>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1 max-h-[calc(100vh-86px)]">
                <div className="p-2.5 space-y-4">
                    {/* Message Form */}
                    <div className="space-y-4">
                        {/* Target Process */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Target Process</label>
                            <div className="space-y-2">
                                <Select value={selectedProcess} onValueChange={setSelectedProcess}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select target process" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getProcessOptions().map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                <span className="truncate">{option.label}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedProcess === "custom" && (
                                    <Input
                                        placeholder="Enter custom process ID"
                                        value={customProcessId}
                                        onChange={(e) => setCustomProcessId(e.target.value)}
                                        className="text-xs font-mono"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Action & Data - Side by side on larger screens */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Action</label>
                                <Input
                                    placeholder="e.g., Info, Balance"
                                    value={action}
                                    onChange={(e) => setAction(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Data</label>
                                <Input
                                    placeholder="Message data (optional)"
                                    value={data}
                                    onChange={(e) => setData(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <TagIcon className="w-4 h-4" />
                                <label className="text-sm font-medium">Tags</label>
                            </div>

                            {/* Add Tag Form */}
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Input
                                    placeholder="Tag name"
                                    value={newTagName}
                                    onChange={(e) => setNewTagName(e.target.value)}
                                    className="flex-1"
                                />
                                <Input
                                    placeholder="Tag value"
                                    value={newTagValue}
                                    onChange={(e) => setNewTagValue(e.target.value)}
                                    className="flex-1"
                                />
                                <Button
                                    size="sm"
                                    onClick={addTag}
                                    disabled={!newTagName.trim() || !newTagValue.trim()}
                                    className="w-full sm:w-auto"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="sm:hidden ml-2">Add Tag</span>
                                </Button>
                            </div>

                            {/* Existing Tags */}
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag, index) => (
                                        <div key={index} className="group relative inline-flex items-center">
                                            <div className="flex items-center border border-border rounded-md overflow-hidden bg-background group-hover:pr-3 transition-all duration-150">
                                                <div className="px-2 py-1 text-xs font-medium bg-primary/50 border-r border-border max-w-[100px] truncate">
                                                    {tag.name}
                                                </div>
                                                <div className="px-2 py-1 text-xs font-btr-code max-w-[100px] truncate">
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
                        </div>
                    </div>

                    <Separator />

                    {/* Lua Code Preview */}
                    <Card className="gap-1 p-2.5">
                        <CardHeader className="px-3">
                            <CardTitle className="text-sm flex items-center justify-between">
                                Lua Code
                                <Button size="sm" variant="ghost" onClick={copyLuaCode}>
                                    {isCopied ? (
                                        <Check className="!w-3 !h-3" size={10} />
                                    ) : (
                                        <Copy className="!w-3 !h-3" size={10} />
                                    )}
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 pb-2">
                            <SyntaxHighlighter
                                language="lua"
                                style={oneDark}
                                wrapLines={true}
                                wrapLongLines={true}
                                customStyle={{
                                    fontSize: '0.75rem',
                                    fontFamily: 'var(--font-btr-code)',
                                    margin: 0,
                                    borderRadius: '0.375rem',
                                    background: 'hsl(var(--muted))',
                                    whiteSpace: 'pre-wrap',
                                    padding: "0px",
                                    wordBreak: 'break-all',
                                    overflowWrap: 'break-word',
                                }}
                                codeTagProps={{
                                    style: {
                                        fontFamily: 'var(--font-btr-code)',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-all',
                                        overflowWrap: 'break-word',
                                    }
                                }}
                            >
                                {luaCode}
                            </SyntaxHighlighter>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                            onClick={sendMessage}
                            disabled={isLoading || !target.trim()}
                            className="flex-1"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send Message
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={clearForm}
                            variant="outline"
                            className="sm:hidden"
                        >
                            Clear Form
                        </Button>
                    </div>

                    {/* Results */}
                    {(output) && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center justify-between">
                                    Results
                                    {messageId && (
                                        <Button size="sm" variant="ghost" asChild>
                                            <a
                                                href={`https://www.ao.link/#/message/${messageId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                <span className="hidden sm:inline">ao.link</span>
                                            </a>
                                        </Button>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {typeof output == "string" ? <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto font-mono whitespace-pre-wrap break-all">
                                    {output}
                                </pre> : <JsonViewer data={output} />}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
