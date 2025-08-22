import { useActiveAddress, useConnection, useProfileModal } from "@arweave-wallet-kit/react";
import { Button } from "./ui/button";
import { Database, Wallet, Wallet2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Link } from "react-router";
import { ThemeToggleButton } from "./theme-toggle";

export default function Statusbar() {
    const address = useActiveAddress();
    const { connect, disconnect, connected } = useConnection();
    const { setOpen } = useProfileModal()
    const [mounted, setMounted] = useState(false);
    const [performance, setPerformance] = useState({ memory: 0 });

    // Shorten address or process ID
    const shortenId = (id: string) => {
        if (!id) return "";
        if (id.length <= 8) return id;
        return `${id.slice(0, 5)}...${id.slice(-5)}`;
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

    if (!mounted) {
        return null;
    }

    return (
        <div className="border-t h-[20px] !text-xs flex items-center overflow-clip px-1 pr-3 bg-background/50 backdrop-blur-sm">
            {/* Left Section - Connection Status */}
            <Button
                variant="ghost"
                className={cn("h-full !px-2 gap-2 text-xs rounded-none", !connected && "bg-primary text-white")}
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
                <Wallet className={cn("!w-3.5 !h-3.5", connected && "text-primary")} />
                {connected ? "" + shortenId(address || "") : "connect"}
            </Button>
            <ThemeToggleButton className="w-6 pb-0.5 scale-80 items-center justify-centerrounded-none" />

            {/* Right Section - Performance and Version */}
            <div className="grow"></div>
            <div className="flex items-center gap-2">
                {/* Memory Usage */}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Database size={12} />
                    <span>{performance.memory}MB</span>
                </div>

                {/* Version Information */}
                <code className="text-xs text-muted-foreground">
                    {/* @ts-ignore */}
                    v{version} <Link to={`https://github.com/betteridea-dev/ide/commit/${gitCommit}`} target="_blank" className="text-muted-foreground hover:underline hover:text-primary">{gitCommit}</Link>
                </code>
            </div>
        </div>
    );
}