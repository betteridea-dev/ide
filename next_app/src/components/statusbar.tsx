import { useGlobalState, useProjectManager, useWallet } from "@/hooks"
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { Button } from "./ui/button";
import { Unplug } from "lucide-react"
import { getResults } from "@/lib/ao-vars";
import { stripAnsiCodes } from "@/lib/utils";

export default function Statusbar() {
    const wallet = useWallet();
    const manager = useProjectManager();
    const globalState = useGlobalState();
    const [autoconnect, setAutoconnect] = useLocalStorage("autoconnect", false, { initializeWithValue: true })
    const [mounted, setMounted] = useState(false)

    const project = globalState.activeProject && manager.getProject(globalState.activeProject);


    async function connectWallet() {
        if (!window.arweaveWallet)
            return toast.error("No Arweave wallet found, please install ArConnect and try again");
        wallet.connect().then((res) => {
            toast.success(`Connected to ${res.shortAddress}`, { id: "connected" });
            setAutoconnect(true);
        })
    }

    function disconnectWallet() {
        if (!window.arweaveWallet) return;
        wallet.disconnect();
        setAutoconnect(false);
    }

    useEffect(() => {
        if (autoconnect) {
            if (!window.arweaveWallet) { toast.error("No Arweave wallet found, please install ArConnect and try again"); return }
            if (!mounted)
                setTimeout(() => {
                    addEventListener("walletSwitch", connectWallet)
                    window.arweaveWallet.getActiveAddress().then((addr: string) => {
                        connectWallet()
                        setMounted(true);
                    }).catch(() => {
                        setAutoconnect(false);
                    });
                }, 150);
        }
        else {
            disconnectWallet();
        }
    }, [autoconnect, mounted]);

    // INCOMING MESSAGS NOTIFICATION
    useEffect(() => {
        if (!project) return
        if (!project.process) return
        
        const resultsInterval = setInterval(async () => {
            const res = await getResults(project.process, localStorage.getItem("cursor")||"")
            if (res.cursor) localStorage.setItem("cursor", res.cursor)
                const { results } = res
            if (results.length > 0) {
                results.forEach((result) => {
                    if (result.Output.print) {
                        console.log(res)
                        toast.custom(() => <div className="p-3 bg-primary text-background rounded-[7px] max-h-[300px]">{stripAnsiCodes(result.Output.data)}</div>, {style:{borderRadius:"7px"}})
                    }
                    })
            }
        },2000)

        return () => { clearInterval(resultsInterval) }
    }, [project])
    
    // NOTIFICATION FOR WHEN THE CURRENT PROJECT OWNER WALLET AND CONNECTED WALLET ARE DIFFERENT
    useEffect(() => {
        if (!project || !wallet.isConnected) return
        if (project.ownerWallet != wallet.address) {
            toast.warning(`The active project uses a process owned by a different wallet address.\nPlease switch to ${wallet.shortAddress} to use this process`,{id:"wallet-mismatch"});
        }
    }, [project, wallet.address])

    return <div className="border-t h-[20px] text-xs flex items-center overflow-clip gap-0.5 px-2">
        <Button variant="ghost" data-connected={wallet.isConnected} className="p-1 rounded-none data-[connected=false]:text-white data-[connected=false]:bg-primary text-xs"
            onClick={connectWallet} id="connect-btn">
            {wallet.isConnected ? `Connected: ${wallet.address}` : "Connect"}
        </Button>
        {wallet.isConnected && <Button variant="ghost" className="p-1 rounded-none text-xs " onClick={() => setAutoconnect(false)}>
            {/* <Image src={Icons.disconnectSVG} alt="disconnect" width={20} height={20} className="invert dark:invert-0" /> */}
            <Unplug size={16} className="text-destructive-foreground" />
        </Button>}
        <div className="grow"></div>
        {project && project.process && (
            <Button
                variant="ghost"
                className="p-1 text-xs"
                onClick={() => {
                    navigator.clipboard.writeText(project.process);
                    toast.info("Copied to clipboard");
                }}
            >
                AO Process: {project.process}
            </Button>
        )}
    </div>
}