import { useActiveAddress, useConnection, useProfileModal } from "@arweave-wallet-kit/react";
import { Button } from "./ui/button";
import { Database, Wallet, Wallet2, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Link } from "react-router";
import { ThemeToggleButton } from "./theme-toggle";
import { useGlobalState } from "@/hooks/use-global-state";
import { useProjects } from "@/hooks/use-projects";

export default function Statusbar() {
    const address = useActiveAddress();
    const { connect, disconnect, connected } = useConnection();
    const { setOpen } = useProfileModal()
    const globalState = useGlobalState();
    const projects = useProjects();
    const [mounted, setMounted] = useState(false);
    const [performance, setPerformance] = useState({ memory: 0 });

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

    useEffect(() => {
        const interval = setInterval(() => {
            if (!activeProcessId) return;

            console.log(activeProcessId)
        }, 1000)
        return () => clearInterval(interval);
    }, [activeProcessId])

    if (!mounted) {
        return null;
    }

    return (
        <div className="border-t h-[20px] text-xs flex items-center overflow-clip px-1 pr-3 bg-background/50 backdrop-blur-sm">
            {/* Left Section - Connection Status */}
            <Button
                variant="ghost"
                className={cn("h-full px-2 gap-1.5 text-xs font-medium rounded-none", !connected && "bg-primary text-primary-foreground")}
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
                <Wallet className={cn("w-3 h-3", connected && "text-primary")} />
                <span className={cn("font-btr-code text-xs", connected && "text-muted-foreground")}>
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