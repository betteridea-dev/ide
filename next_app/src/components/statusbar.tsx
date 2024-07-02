import { useGlobalState, useProjectManager, useWallet } from "@/hooks"
import Link from "next/link";
import { useEffect } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { Button } from "./ui/button";
import { Unplug } from "lucide-react"

export default function Statusbar() {
    const wallet = useWallet();
    const manager = useProjectManager();
    const globalState = useGlobalState();
    const [autoconnect, setAutoconnect] = useLocalStorage("autoconnect", false, { initializeWithValue: true })

    const project = globalState.activeProject && manager.getProject(globalState.activeProject);

    // async function connectWallet() {
    //     if (!window.arweaveWallet) return toast.custom(() => <Link href="https://arconnect.io" target="_blank">Wallet not found\Click here to install ArConnect</Link>, {
    //         id: "wallet-not-found",
    //     })
    //     await wallet.connect().then((res) => {
    //         console.log("connected to", res.address)
    //         setAutoconnect(true)
    //         toast.success(`Connected to ${res.shortAddress}`, { id: "connected" })
    //     })
    // }

    // async function disconnectWallet() {
    //     setAutoconnect(false)
    // }

    // useEffect(() => {
    //     async function onWalletChange (e:any) {
    //         wallet.connect().then((res) => {
    //             console.log("switched to", res.address)
    //             toast.success(`Switched to ${res.shortAddress}`, { id: "switch-wallet" })
    //             setAutoconnect(true)
    //         })
    //     }
    //     if (autoconnect) {
    //         setTimeout(async () => {
    //             connectWallet()
    //                 .then(() => {
    //                     setAutoconnect(true)
    //                     removeEventListener("walletSwitch", onWalletChange)
    //                     addEventListener("walletSwitch", onWalletChange);
    //                 })
    //                 .catch(() => {
    //                     console.log("failed to connect")
    //                     setAutoconnect(false)
    //                 })
    //         }, 150);
    //     }
    //     else {
    //         disconnectWallet();
    //     }
    // }, [autoconnect]);

    function walletSwitched() {
        wallet.connect().then((res) => {
            console.log("switched to", res.address)
            toast.success(`Switched to ${res.shortAddress}`, { id: "switch-wallet" })
            setAutoconnect(true)
        })
    }

    useEffect(() => {
        if (!wallet.isConnected) {
            removeEventListener("walletSwitch", walletSwitched)
            setAutoconnect(false)
        }
        if (wallet.isConnected) {
            toast.success(`Connected to ${wallet.shortAddress}`, { id: "connected" })
            setAutoconnect(true)
            removeEventListener("walletSwitch", walletSwitched)
            addEventListener("walletSwitch", walletSwitched);
        }
    }, [wallet.isConnected])

    useEffect(() => {
        if (autoconnect) {
            setTimeout(async () => {
                wallet.connect()
            }, 150);
        } else {
            wallet.disconnect()
        }
    }, [autoconnect])

    return <div className="border-t h-[20px] text-xs flex items-center overflow-clip gap-0.5 px-2">
        <Button variant="ghost" data-connected={wallet.isConnected} className="p-1 rounded-none data-[connected=false]:text-white data-[connected=false]:bg-primary text-xs"
            onClick={() => setAutoconnect(true)} id="connect-btn">
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