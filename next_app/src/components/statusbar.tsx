import { useGlobalState, useProjectManager } from "@/hooks"
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { Button } from "./ui/button";
import { Unplug } from "lucide-react"
import { getResults } from "@/lib/ao-vars";
import { stripAnsiCodes } from "@/lib/utils";
import { ConnectButton, useConnection, useActiveAddress, useProfileModal, useStrategy } from "arweave-wallet-kit"

export default function Statusbar() {
    // const wallet = useWallet();
    const { connected, connect, disconnect } = useConnection()
    const { open, setOpen } = useProfileModal()
    const strategy = useStrategy()
    const address = useActiveAddress()
    const manager = useProjectManager();
    const globalState = useGlobalState();
    const [autoconnect, setAutoconnect] = useLocalStorage("autoconnect", false, { initializeWithValue: true })
    const [mounted, setMounted] = useState(false)

    const project = globalState.activeProject && manager.getProject(globalState.activeProject);
    const fileType = project?.files[globalState.activeFile]?.type

    useEffect(() => {
        if (connected) {
            if (["webwallet", "othent"].includes(strategy as string)) {
                toast.info("Connection through Web Wallet has issues, please use Wander Wallet")
                disconnect()
            }
        }
    }, [connected, strategy, disconnect])

    // async function connectWallet() {
    //     // if (!window.arweaveWallet)
    //     //     return toast.error("No Arweave wallet found, please install ArConnect and try again");
    //     //     wallet.connect().then((res) => {
    //     //     toast.success(`Connected to ${res.shortAddress}`, { id: "connected" });
    //     //     setAutoconnect(true);
    //     // })
    //     await connect()
    //     if (connected) {
    //         toast.success(`Connected to ${address}`, { id: "connected" });
    //         setAutoconnect(true);
    //     }
    // }

    // async function disconnectWallet() {
    //     if (!window.arweaveWallet) return;
    //     // wallet.disconnect();
    //     await disconnect()
    //     setAutoconnect(false);
    // }

    // useEffect(() => {
    //     if (autoconnect) {
    //         if (!window.arweaveWallet) { toast.error("No Arweave wallet found, please install ArConnect and try again"); return }
    //         if (!mounted)
    //             setTimeout(() => {
    //                 addEventListener("walletSwitch", connectWallet)
    //                 window.arweaveWallet.getActiveAddress().then((addr: string) => {
    //                     connectWallet()
    //                     setMounted(true);
    //                 }).catch(() => {
    //                     setAutoconnect(false);
    //                 });
    //             }, 150);
    //     }
    //     else {
    //         disconnectWallet();
    //     }
    // }, [autoconnect, mounted]);

    // INCOMING MESSAGS NOTIFICATION
    useEffect(() => {
        if (!connected) return
        if (!project) return

        const processes = []
        if (project.process) processes.push(project.process)
        Object.values(project.files).forEach((file) => {
            if (file.process && !processes.includes(file.process)) processes.push(file.process)
        })

        if (processes.length == 0) return

        const resultsInterval = setInterval(async () => {
            for (const process of processes) {
                const res = await getResults(process, localStorage.getItem("cursor") || "")
                if (res.cursor) localStorage.setItem("cursor", res.cursor)
                const { results } = res
                if (results.length > 0) {
                    console.log(res)
                    results.forEach((result) => {
                        if (typeof result.Output == "object") {
                            // globalState.setPrompt(result.Output.prompt || result.Output?.data?.prompt! || globalState.prompt)
                            if (result.Output.print) {
                                toast.custom(() => <div className="p-3 bg-primary text-background rounded-[7px] max-h-[300px]">{stripAnsiCodes(`${result.Output.data}`)}</div>, { style: { borderRadius: "7px" } })
                                globalState.setTerminalOutputs && globalState.setTerminalOutputs((prev) => [...prev, `${result.Output.data}`])
                            }
                        }
                    })
                }
            }
        }, 2000)

        return () => { clearInterval(resultsInterval) }
    }, [project, connected])

    // NOTIFICATION FOR WHEN THE CURRENT PROJECT OWNER WALLET AND CONNECTED WALLET ARE DIFFERENT
    useEffect(() => {
        if (!project || !connected) return
        if (project.ownerWallet != address) {
            toast.warning(`The active project uses a process owned by a different wallet address.\nPlease switch to ${address}\nor assign a new process.`, { id: "wallet-mismatch" });
        }
    }, [project, address, connected])

    return <div className="border-t h-[20px] text-xs flex items-center overflow-clip gap-0.5 px-2">
        <Button variant="ghost" data-connected={connected} className="p-1 rounded-none data-[connected=false]:text-white data-[connected=false]:bg-primary text-xs"
            onClick={() => connected ? setOpen(true) : connect()} id="connect-btn">
            {connected ? ` ${address}` : "Connect"}
        </Button>
        {/* <ConnectButton /> */}
        {/* {connected && <Button variant="ghost" className="p-1 rounded-none text-xs " onClick={disconnect}>
            <Unplug size={16} className="text-destructive-foreground" />
        </Button>} */}
        {fileType == "NORMAL" && <code id="vim-status" className="w-fit text-sm h-fit ml-2 bg-primary px-1 text-white"></code>}
        <div className="grow"></div>
        {(project && project.process) ? (
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
        ) : (
            <code className="text-xs text-muted-foreground mr-2">
                v{process.env.version} - <Link href={`https://github.com/betteridea-dev/ide/commit/${process.env.gitHash}`} target="_blank" className="hover:underline">
                    {process.env.gitHash}
                </Link>
            </code>
        )}
    </div>
}