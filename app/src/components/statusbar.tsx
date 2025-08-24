import { useActiveAddress, useConnection, useProfileModal } from "@arweave-wallet-kit/react";
import { Button } from "./ui/button";
import { Database, Wallet, Wallet2, Copy } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { cn, stripAnsiCodes } from "@/lib/utils";
import { Link } from "react-router";
import { ThemeToggleButton } from "./theme-toggle";
import { useGlobalState } from "@/hooks/use-global-state";
import { useProjects } from "@/hooks/use-projects";
import { useSettings } from "@/hooks/use-settings";
import { useTerminalState } from "@/hooks/use-terminal-state";
import { startLiveMonitoring } from "@/lib/live-mainnet";
import { MainnetAO } from "@/lib/ao";
import { createSigner } from "@permaweb/aoconnect";
import { useApi } from "@arweave-wallet-kit/react";

export default function Statusbar() {
    const address = useActiveAddress();
    const { connect, disconnect, connected } = useConnection();
    const { setOpen } = useProfileModal()
    const globalState = useGlobalState();
    const projects = useProjects();
    const settings = useSettings();
    const { hasShownSlot, addShownSlot, addToQueue } = useTerminalState(s => s.actions);
    const [mounted, setMounted] = useState(false);
    const [performance, setPerformance] = useState({ memory: 0 });
    const stopMonitoringRef = useRef<(() => void) | null>(null);
    const api = useApi();

    // Get active project and process ID
    const activeProject = globalState.activeProject ? projects.projects[globalState.activeProject] : null;
    const activeProcessId = activeProject?.process;

    // Shorten address or process ID
    const shortenId = (id: string) => {
        if (!id) return "";
        if (id.length <= 8) return id;
        return `${id.slice(0, 5)}...${id.slice(-5)}`;
    };

    // Copy process ID to clipboard
    const copyProcessId = async () => {
        if (!activeProcessId) return;

        try {
            await navigator.clipboard.writeText(activeProcessId);
            toast.success("Process ID copied to clipboard");
        } catch (error) {
            toast.error("Failed to copy process ID");
        }
    };

    // Update performance metrics
    useEffect(() => {
        const updatePerformance = () => {
            if (typeof window !== 'undefined') {
                const performance = window.performance as any;
                const memory = performance.memory;
                if (memory) {
                    setPerformance({
                        memory: Math.round(memory.usedJSHeapSize / 1024 / 1024)
                    });
                }
            }
        };

        const interval = setInterval(updatePerformance, 1000);
        return () => clearInterval(interval);
    }, []);

    // Set mounted state
    useEffect(() => {
        setMounted(true);
    }, []);

    // Function to send output to terminal with response waiting and queue fallback
    const sendToTerminal = (output: string) => {
        if (!activeProcessId) return;

        const terminalEntry = {
            type: 'output' as const,
            content: output.trim(),
            timestamp: Date.now()
        };

        // Create a unique event ID for this request
        const eventId = `terminal-output-${Date.now()}-${Math.random()}`;

        // Set up response listener
        let responseReceived = false;
        const responseTimeout = setTimeout(() => {
            if (!responseReceived) {
                // Terminal didn't respond, add to queue
                addToQueue(activeProcessId, terminalEntry);
                console.log('Terminal not responding, added to queue:', output.slice(0, 50));
            }
            // Clean up listener
            window.removeEventListener(`terminal-response-${eventId}`, responseHandler);
        }, 1000); // 1 second timeout

        const responseHandler = () => {
            responseReceived = true;
            clearTimeout(responseTimeout);
            window.removeEventListener(`terminal-response-${eventId}`, responseHandler);
        };

        // Listen for terminal response
        window.addEventListener(`terminal-response-${eventId}`, responseHandler);

        // Dispatch custom event to terminal component
        const event = new CustomEvent("log-output", {
            detail: {
                output: '\r\n' + output,
                eventId: eventId
            }
        });
        window.dispatchEvent(event);
    };

    useEffect(() => {
        // Stop any existing monitoring
        if (stopMonitoringRef.current) {
            stopMonitoringRef.current();
            stopMonitoringRef.current = null;
        }

        // Start monitoring if we have an active mainnet process
        if (activeProcessId && activeProject?.isMainnet) {
            const hbUrl = settings.actions.getHbUrl();
            const gatewayUrl = settings.actions.getGatewayUrl();

            stopMonitoringRef.current = startLiveMonitoring(activeProcessId, {
                hbUrl,
                gatewayUrl,
                intervalMs: 2000,
                hasShownSlot: (slot: number) => hasShownSlot(activeProcessId, slot),
                markSlotAsShown: (slot: number) => addShownSlot(activeProcessId, slot),
                onResult: (result) => {
                    // Only send to terminal if there's new data with print output
                    if (result.hasNewData && result.hasPrint) {
                        const outputText = result.error || result.output || '';
                        if (outputText) {
                            sendToTerminal(outputText);
                            toast.info(stripAnsiCodes(outputText.slice(0, 200)));
                        }
                    }
                }
            });
        }

        // Cleanup function
        return () => {
            if (stopMonitoringRef.current) {
                stopMonitoringRef.current();
                stopMonitoringRef.current = null;
            }
        };
    }, [activeProcessId, activeProject?.isMainnet, settings, hasShownSlot, addShownSlot])

    useEffect(() => {
        function syncProjectToProcess() {
            if (!activeProcessId) return;
            const project = projects.projects[globalState.activeProject];
            if (!project) return;

            const hbUrl = settings.actions.getHbUrl();
            const gatewayUrl = settings.actions.getGatewayUrl();

            const ao = new MainnetAO({
                HB_URL: hbUrl,
                GATEWAY_URL: gatewayUrl,
                signer: createSigner(api)
            })

            // set a variable in the process containing the entire projects json
            console.log("SYNC")
            ao.runLua({ processId: activeProcessId, code: `betteridea = [[${JSON.stringify(project)}]]` })
        }

        const interval = setInterval(syncProjectToProcess, 15000);
        return () => clearInterval(interval);
    }, [activeProcessId, projects, globalState.activeProject, settings])

    if (!mounted) {
        return null;
    }

    return (
        <div className="border-t h-[20px] text-xs flex items-center overflow-clip px-1 pr-3 bg-background/50 backdrop-blur-sm">
            {/* Left Section - Connection Status */}
            <Button
                className={cn("h-full px-2 gap-1.5 text-xs font-medium rounded-none", connected && "bg-background text-foreground hover:text-background")}
                onClick={() => {
                    if (connected && address) {
                        setOpen(true)
                    } else {
                        connect();
                    }
                }}
                onContextMenu={(e) => {
                    e.preventDefault();
                    if (connected) {
                        disconnect();
                    }
                }}
                id="connect-btn"
            >
                <Wallet className={cn("w-3 h-3")} strokeWidth={1.5} />
                <span className={cn("font-btr-code text-xs")}>
                    {connected ? shortenId(address || "") : "connect"}
                </span>
            </Button>
            <ThemeToggleButton className="w-6 pb-0.5 scale-80 items-center justify-center rounded-none" />

            {/* Right Section - Performance and Version */}
            <div className="grow"></div>
            <div className="flex items-center gap-3">
                {/* Active Process ID */}
                {activeProcessId && (
                    <Button
                        variant="ghost"
                        className="h-full px-2 text-xs rounded-none text-muted-foreground hover:text-foreground transition-colors"
                        onClick={copyProcessId}
                        title={`Process ID: ${activeProcessId} (click to copy)`}
                    >
                        <span className="font-btr-code text-xs">{shortenId(activeProcessId)}</span>
                    </Button>
                )}

                {/* Memory Usage */}
                <div className="flex items-center gap-1 text-muted-foreground">
                    <Database className="w-3 h-3" />
                    <span className="text-xs font-medium">{performance.memory}MB</span>
                </div>

                {/* Version Information */}
                <div className="flex items-center gap-1 text-muted-foreground">
                    <span className="text-xs font-medium">
                        {/* @ts-ignore */}
                        v{version}
                    </span>
                    <Link
                        to={`https://github.com/betteridea-dev/ide/commit/${
                            /* @ts-ignore */
                            gitCommit
                            }`}
                        target="_blank"
                        className="text-xs font-btr-code text-muted-foreground hover:text-primary hover:underline transition-colors"
                    >
                        {/* @ts-ignore */}
                        {gitCommit}
                    </Link>
                </div>
            </div>
        </div>
    );
}