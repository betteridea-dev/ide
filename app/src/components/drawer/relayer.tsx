import { useState, useEffect, useCallback, useRef, memo } from "react"
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
    X,
    EthernetPort
} from "lucide-react"
import { MainnetAO, TestnetAO, type Tag } from "@/lib/ao"
import type { InteractState } from "@/hooks/use-projects"
import { parseOutput, shortenAddress, isExecutionError } from "@/lib/utils"
import Constants from "@/lib/constants"
import { useSettings } from "@/hooks/use-settings"
import { createSigner } from "@permaweb/aoconnect"
import { useApi, useActiveAddress } from "@arweave-wallet-kit/react"
import { toast } from "sonner"
import JsonViewer from "../ui/json-viewer"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Editor } from "@monaco-editor/react"
import { useTheme } from "@/components/theme-provider"
import { editor } from "monaco-editor"
import notebookTheme from "@/assets/themes/notebook.json"

const monacoConfig: editor.IStandaloneEditorConstructionOptions = {
    fontFamily: '"DM Mono", monospace',
    fontSize: 12,
    lineHeight: 18,
    lineNumbersMinChars: 3,
    scrollBeyondLastLine: false,
    minimap: { enabled: false },
    wordWrap: "on",
    automaticLayout: true,
}

const Relayer = memo(function Relayer() {
    const globalState = useGlobalState()
    const projectsState = useProjects()
    const settings = useSettings()
    const api = useApi()
    const { theme } = useTheme()
    const activeAddress = useActiveAddress()

    const activeProject = globalState.activeProject ? projectsState.projects[globalState.activeProject] : null

    const [relayPath, setRelayPath] = useState("") // api url
    const [relayMethod, setRelayMethod] = useState<"POST" | "GET">("GET") // request method
    const [relayBody, setRelayBody] = useState(`{\n\t"foo":"bar"\n}`) // json string- only show if method is POST
    const [responseActions, setResponseActions] = useState("") // process will receive response with this action if entered

    // UI state
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [output, setOutput] = useState<any>(null)
    const [luaCode, setLuaCode] = useState<string>("")
    const [isCopied, setIsCopied] = useState<boolean>(false)

    const [monacoWidth, setMonacoWidth] = useState<number>(0)

    // Monaco editor ref
    const monacoRef = useRef<typeof import("monaco-editor") | null>(null)
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)

    // Helper function to apply theme
    const applyTheme = useCallback((monaco: typeof import("monaco-editor")) => {
        const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
        if (isDark) {
            monaco.editor.setTheme("notebook");
        } else {
            monaco.editor.setTheme("vs-light");
        }
    }, [theme])

    useEffect(() => {
        if (!containerRef.current) return
        const resizeObserver = new ResizeObserver((e: ResizeObserverEntry[]) => {
            const width = e[0].contentRect.width
            setMonacoWidth(width)
        })
        resizeObserver.observe(containerRef.current)
        return () => {
            resizeObserver.disconnect()
        }
    }, [containerRef.current])

    // Generate Lua code preview
    const generateLuaCode = () => {
        if (!relayPath.trim()) {
            setLuaCode('-- Enter a URL to generate Lua code')
            return
        }

        const luaLines = [`-- HTTP ${relayMethod} Request via Relay`]
        luaLines.push(`send({`)
        luaLines.push(`    target = id,`)
        luaLines.push(`    resolve = "~relay@1.0/call/~patch@1.0",`)
        luaLines.push(`    ["relay-path"] = "${relayPath}",`)
        luaLines.push(`    ["relay-method"] = "${relayMethod}",`)

        if (relayMethod === "POST" && relayBody.trim()) {
            // Minify JSON by removing whitespace and escape single quotes
            let minifiedBody = relayBody.trim()
            try {
                // Parse and stringify to minify JSON
                minifiedBody = JSON.stringify(JSON.parse(relayBody))
            } catch (e) {
                // If JSON is invalid, just use the original trimmed body
                minifiedBody = relayBody.trim()
            }
            const escapedBody = minifiedBody.replace(/'/g, "\\'")
            luaLines.push(`    ["relay-body"] = '${escapedBody}',`)
            luaLines.push(`    ["Content-Type"] = "application/json",`)
        }

        if (responseActions.trim()) {
            luaLines.push(`    action = "${responseActions}",`)
        } else {
            luaLines.push(`    action = "API-Response", -- Result is sent with this action tag`)
        }

        luaLines.push(`})`)

        setLuaCode(luaLines.join('\n'))
    }

    // Update Lua code when inputs change
    useEffect(() => {
        generateLuaCode()
    }, [relayPath, relayMethod, relayBody, responseActions])

    // React to theme context changes
    useEffect(() => {
        if (monacoRef.current) {
            applyTheme(monacoRef.current);
        }
    }, [theme, applyTheme])

    const clearForm = () => {
        setRelayPath("")
        setRelayMethod("GET")
        setRelayBody("")
        setResponseActions("")
        setOutput(null)
    }

    const loadGetExample = () => {
        setRelayMethod("GET")
        setRelayPath("https://jsonplaceholder.typicode.com/todos/1")
        setResponseActions("Get-Response")
        setRelayBody("")
    }

    const loadPostExample = () => {
        setRelayMethod("POST")
        setRelayPath("https://cu.arnode.asia/dry-run?process-id=RLvG3tclmALLBCrwc17NqzNFqZCrUf3-RKZ5v8VRHiU")
        setResponseActions("Post-Response")
        setRelayBody(JSON.stringify(JSON.parse(`{"Id":"1234","Target":"RLvG3tclmALLBCrwc17NqzNFqZCrUf3-RKZ5v8VRHiU","Owner":"1234","Anchor":"0","Data":"1234","Tags":[{"name":"Action","value":"APM.Popular"},{"name":"Data-Protocol","value":"ao"},{"name":"Type","value":"Message"},{"name":"Variant","value":"http://ao.TN.1"}]}`), null, 2))
    }

    const sendRequest = async () => {
        if (!relayPath.trim() || !activeProject?.process) return

        // Check if wallet is connected for mainnet execution
        if (activeProject.isMainnet && !activeAddress) {
            const errorMsg = "Error: Wallet connection required for mainnet execution"
            setOutput(errorMsg)
            toast.error("Please connect your wallet to run code on mainnet")
            return
        }

        setIsLoading(true)
        setOutput("Running Lua code on process...")

        try {
            const ao = new MainnetAO({
                GATEWAY_URL: settings.actions.getGatewayUrl(),
                HB_URL: settings.actions.getHbUrl(),
                signer: createSigner(api)
            })

            // Execute the generated Lua code
            const result = await ao.runLua({
                processId: activeProject.process,
                code: luaCode
            })

            console.log("Lua execution result:", result)

            const hasError = isExecutionError(result)
            console.log("Has error:", hasError)

            setOutput(result)
            console.log("Output:", result)

            // Show error toast if execution failed
            if (hasError) {
                toast.error("Lua code execution failed")
            }

        } catch (error) {
            console.error("Failed to execute Lua code:", error)
            const errorMsg = `Error: ${error}`
            setOutput(errorMsg)
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
        <div className="h-full w-full flex flex-col" ref={containerRef}>
            <div className="px-3 py-2 border-b border-border/40 bg-sidebar/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <EthernetPort className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Relayer
                        </span>
                    </div>
                    <div className="flex gap-1">
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
                <div className="text-[10px] text-muted-foreground mt-1.5 truncate">The relay device adds support for HTTP requests within ao processes</div>
            </div>

            <ScrollArea className="flex-1 max-h-[calc(100vh-107px)] overflow-x-auto">
                <div className="p-2.5 space-y-4">


                    {/* HTTP Request Form */}
                    <div className="space-y-4">
                        {/* Method and URL */}
                        <div className="space-y-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">URL</label>
                                <Input
                                    placeholder="https://api.example.com/endpoint"
                                    value={relayPath}
                                    onChange={(e) => setRelayPath(e.target.value)}
                                    className="w-full font-mono text-xs"
                                />
                            </div>
                            <div className="flex gap-2 text-sm items-center">
                                <div className="text-sm font-medium mr-auto">HTTP Method</div>
                                <Badge
                                    className={`cursor-pointer bg-muted ${relayMethod === "GET" ? "bg-primary" : ""}`}
                                    onClick={() => setRelayMethod("GET")}
                                >
                                    GET
                                </Badge>
                                <Badge
                                    className={`cursor-pointer bg-muted ${relayMethod === "POST" ? "bg-primary" : ""}`}
                                    onClick={() => setRelayMethod("POST")}
                                >
                                    POST
                                </Badge>
                            </div>
                        </div>

                        {/* Request Body - Only show for POST */}
                        {relayMethod === "POST" && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Request Body</label>
                                <div className="border border-border rounded-md overflow-hidden bg-background">
                                    <Editor
                                        width={monacoWidth - 22} // 22 is the padding offset
                                        height={(Math.min(Math.max(relayBody.split("\n").length, 5) * 18, 252))}
                                        language="json"
                                        defaultValue={`{\n\t"foo":"bar"\n}`}
                                        value={relayBody}
                                        onChange={(value) => setRelayBody(value || "")}
                                        options={{
                                            ...monacoConfig,
                                            automaticLayout: true,
                                            wordWrap: "off",
                                            scrollBeyondLastColumn: 5,
                                        }}
                                        onMount={(editor, monaco) => {
                                            // Store Monaco instances in refs
                                            monacoRef.current = monaco;
                                            editorRef.current = editor;

                                            // Define and set custom notebook theme
                                            monaco.editor.defineTheme(
                                                "notebook",
                                                notebookTheme as editor.IStandaloneThemeData
                                            );

                                            // Apply theme using helper function
                                            applyTheme(monaco);

                                            // Ensure font is properly applied
                                            editor.updateOptions({
                                                fontFamily: '"DM Mono", monospace',
                                                fontSize: 12,
                                                lineHeight: 18,
                                            });

                                            // Force font remeasuring
                                            setTimeout(() => {
                                                monaco.editor.remeasureFonts();
                                            }, 100);
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Enter JSON data for the request body
                                </p>
                            </div>
                        )}

                        {/* Response Actions */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Response Action</label>
                            <Input
                                placeholder="e.g., API-Response (optional)"
                                value={responseActions}
                                onChange={(e) => setResponseActions(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground truncate">
                                Action to send the HTTP response to your process
                            </p>
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
                            onClick={sendRequest}
                            disabled={isLoading || !relayPath.trim() || !activeProject?.process}
                            className="flex-1"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Running...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Run Lua Code
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Example Buttons */}
                    <div className="space-y-2">
                        <div className="text-xs text-muted-foreground font-medium">Quick Examples</div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={loadGetExample}
                                className="flex-1"
                            >
                                GET Example
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={loadPostExample}
                                className="flex-1"
                            >
                                POST Example
                            </Button>
                        </div>
                    </div>

                    {/* Results */}
                    {(output) && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center justify-between">
                                    Results
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
})

export default Relayer
