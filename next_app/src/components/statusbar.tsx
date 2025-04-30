import { useGlobalState, useProjectManager } from "@/hooks"
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { Button } from "./ui/button";
import { Database, File, UnplugIcon, Wallet2 } from "lucide-react"
import { getResults } from "@/lib/ao-vars";
import { stripAnsiCodes } from "@/lib/utils";
import { ConnectButton, useConnection, useActiveAddress, useProfileModal, useStrategy } from "arweave-wallet-kit"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Ansi from "ansi-to-react";

export default function Statusbar() {
    const { connected, connect, disconnect } = useConnection()
    const { open, setOpen } = useProfileModal()
    const strategy = useStrategy()
    const address = useActiveAddress()
    const manager = useProjectManager();
    const globalState = useGlobalState();
    const [autoconnect, setAutoconnect] = useLocalStorage("autoconnect", false, { initializeWithValue: true })
    const [mounted, setMounted] = useState(false)
    const [performance, setPerformance] = useState({ memory: 0 })

    const project = globalState.activeProject && manager.getProject(globalState.activeProject);
    const fileType = project?.files[globalState.activeFile]?.type

    // Get language mode based on file type
    const getLanguageMode = () => {
        if (!globalState.activeFile) return "Plain Text"
        const extension = globalState.activeFile.split('.').pop()?.toLowerCase()
        const languageMap: { [key: string]: string } = {
            'js': 'JavaScript',
            'lua': 'Lua',
            'md': 'Markdown',
            'json': 'JSON',
            'txt': 'Plain Text',
            'luanb': 'Lua Notebook'
        }
        return languageMap[extension] || 'Plain Text'
    }

    // Shorten address or process ID
    const shortenId = (id: string) => {
        if (!id) return ""
        if (id.length <= 8) return id
        return `${id.slice(0, 4)}...${id.slice(-4)}`
    }

    // Update performance metrics
    useEffect(() => {
        const updatePerformance = () => {
            if (typeof window !== 'undefined') {
                const performance = window.performance as any
                const memory = performance.memory
                if (memory) {
                    setPerformance({
                        memory: Math.round(memory.usedJSHeapSize / 1024 / 1024)
                    })
                }
            }
        }

        const interval = setInterval(updatePerformance, 1000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (connected) {
            if (["webwallet", "othent"].includes(strategy as string)) {
                toast.info("Connection through Web Wallet has issues, please use Wander Wallet")
                disconnect()
            }
        }
    }, [connected, strategy, disconnect])

    // INCOMING MESSAGS NOTIFICATION
    useEffect(() => {
        if (!project) return

        const processes = []
        if (project.process) processes.push(project.process)
        Object.values(project.files).forEach((file) => {
            if (file.process && !processes.includes(file.process)) processes.push(file.process)
        })
        console.log(processes)
        if (processes.length == 0) return

        const resultsInterval = setInterval(async () => {
            for (const process of processes) {
                const res = await getResults(process, localStorage.getItem("cursor") || "")
                if (res.cursor) localStorage.setItem("cursor", res.cursor)
                const { results } = res
                console.log(res)
                if (results.length > 0) {
                    console.log(res)
                    results.forEach((result) => {
                        if (result.Output.print && result.Output.data) {
                            toast.custom(() => <div className="p-3 bg-primary text-background rounded-[7px] max-h-[300px] overflow-scroll">{stripAnsiCodes(result.Output.data)}</div>, { style: { borderRadius: "7px" } })
                            globalState.setTerminalOutputs && globalState.setTerminalOutputs((prev) => [...prev, `${result.Output.data}`])
                        }
                    })
                }
            }
        }, 2000)

        return () => { clearInterval(resultsInterval) }
    }, [globalState.activeFile])

    // NOTIFICATION FOR WHEN THE CURRENT PROJECT OWNER WALLET AND CONNECTED WALLET ARE DIFFERENT
    useEffect(() => {
        if (!project || !connected) return
        if (project.ownerWallet != address) {
            toast.warning(`The active project uses a process owned by a different wallet address.\nPlease switch to ${address}\nor assign a new process.`, { id: "wallet-mismatch" });
        }
    }, [project, address, connected])

    return <div className="border-t h-[20px] text-xs flex items-center overflow-clip gap-2 px-3 bg-background/50 backdrop-blur-sm">
        {/* Left Section - Connection Status */}
        <Button
            variant="ghost"
            // data-connected={connected}
            // className="h-full px-2 gap-1 rounded-none data-[connected=false]:text-white data-[connected=false]:bg-primary hover:bg-accent/50"
            className="h-full px-2 gap-1 rounded-none hover:bg-primary text-foreground hover:text-background"
            onClick={() => connected ? setOpen(true) : connect()}
            id="connect-btn"
        >

            <Wallet2 className="w-3.5 h-3.5" color={connected ? "green" : "red"} />
            {connected ? "connected: " + shortenId(address) : "connect"}
        </Button>

        {/* Middle Section - File Information */}

        {/* Right Section - Project Info and Performance */}
        <div className="grow"></div>
        <div className="flex items-center gap-3">
            {/* Memory Usage */}
            <div className="flex items-center gap-1.5 text-muted-foreground">
                <Database size={12} />
                <span>{performance.memory}MB</span>
            </div>
            |
            {/* Project Information */}
            {(project && project.process) ? (
                <Button
                    variant="ghost"
                    className="h-full px-1.5 -mx-1.5 rounded-none hover:bg-accent/50 gap-1"
                    onClick={() => {
                        navigator.clipboard.writeText(project.process);
                        toast.info("Copied to clipboard");
                    }}
                >
                    {shortenId(project.files[globalState.activeFile]?.process || project.process)}
                    {project.files[globalState.activeFile]?.process && <File strokeWidth={2.2} className="w-3.5 h-3.5" />}

                </Button>
            ) : (
                <code className="text-xs text-muted-foreground font-extralight flex items-center gap-1">

                    <Link href={`https://github.com/betteridea-dev/ide/commit/${process.env.gitHash}`} target="_blank" className="hover:underline font-btr-code">
                        v{process.env.version} {" · "}
                        {shortenId(process.env.gitHash)}
                    </Link>
                </code>
            )}

            {/* {globalState.activeFile && <>
                | <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium">{getLanguageMode()}</span>
                </div>
            </>} */}
        </div>
    </div>
}