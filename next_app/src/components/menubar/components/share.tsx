import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useGlobalState, useProjectManager } from "@/hooks";
import { runLua } from "@/lib/ao-vars";
import { Copy, LoaderIcon, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";


export default function Share() {
    const globalState = useGlobalState();
    const projectManager = useProjectManager();
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState("");
    const [sharing, setSharing] = useState(false);
    const [shared, setShared] = useState(false);

    const p = globalState.activeProject && projectManager.getProject(globalState.activeProject);
    const shortProcess = p && p.process ? p.process.slice(0, 5) + "..." + p.process.slice(-5) : "";

    async function shareProject() {
        if (!globalState.activeProject) return toast.error("No active project", { description: "You need to have an active project to share", id: "error" })
        const project = projectManager.getProject(globalState.activeProject);
        if (!project) return toast.error("Project not found", { description: "The active project was not found", id: "error" })
        if (!project.process) return toast.error("Process id missing", { description: "The active project doesnot seem to have a process id", id: "error" })
        const ownerAddress = project.ownerWallet;
        const activeAddress = await window.arweaveWallet.getActiveAddress();
        const shortAddress = ownerAddress.slice(0, 5) + "..." + ownerAddress.slice(-5);
        if (ownerAddress != activeAddress) return toast.error("The owner wallet for this project is differnet", { description: `It was created with ${shortAddress}.\nSome things might be broken`, id: "error" })
        const processBackup = project.process
        delete project.ownerWallet
        delete project.process

        setShared(false);

        const urlEncodedJson = encodeURIComponent(JSON.stringify(project)).replaceAll("'", "\\'")

        const luaToRun = `_BETTERIDEA_SHARE = '${urlEncodedJson}'

    Handlers.add(
      "Get-Better-IDEa-Share",
      Handlers.utils.hasMatchingTag("Action","Get-BetterIDEa-Share"),
      function(msg)
        ao.send({Target=msg.From, Action="BetterIDEa-Share-Response", Data=_BETTERIDEA_SHARE})
        return _BETTERIDEA_SHARE
      end
    )   
    `
        console.log(luaToRun)
        setSharing(true);
        const res = await runLua(luaToRun, processBackup, [
            { name: "BetterIDEa-Function", value: "Share-Project" }
        ]);
        console.log(res)

        if (res.Error) {
            setSharing(false);
            setShared(false);
            return toast.error("Error sharing project", { description: res.Error, id: "error" })
        }

        const url = `${window.location.origin}/import?id=${processBackup}`;
        setUrl(url);
        setSharing(false);
        setShared(true);
    }

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger onClick={(e) => {
            e.preventDefault();
            setUrl("");
            setShared(false);
            setSharing(false);
            if (!globalState.activeProject) return toast.error("No active project", { description: "You need to have an active project to use share feature", id: "error" })
            const project = projectManager.getProject(globalState.activeProject);
            if (!project) return toast.error("Project not found", { description: "The active project was not found", id: "error" })
            if (!project.process) return toast.error("Process id missing", { description: "The active project doesnot seem to have a process id", id: "error" })

            setOpen(true);
        }} className="invisible" id="share">
            Share
        </DialogTrigger>
        <DialogContent className="w-screen">
            <DialogHeader>
                <DialogTitle>Share this Project</DialogTitle>
                <DialogDescription>
                    Sharing this project will create a variable <span className="font-btr-mono">_BETTERIDEA_SHARE</span> containing the project data inside your process along with a url which you can share.
                </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 items-center justify-center">
                {!shared && <Button disabled={sharing} onClick={shareProject}>
                    {sharing && <LoaderIcon className="animate-spin mr-2" />}
                    Share
                </Button>}
                {shared && <Button onClick={() => {
                    navigator.clipboard.writeText(url);
                    // toast({ title: "Project URL copied", description: "The URL to the project has been copied to your clipboard" });
                    toast.info("Project URL copied", { description: "The URL to the project has been copied to your clipboard", id: "success" })
                }}>
                    https://ide.betteridea.dev/import?id={shortProcess}
                    <Copy className="ml-2" />
                </Button>}
            </div>
        </DialogContent>
    </Dialog>
}