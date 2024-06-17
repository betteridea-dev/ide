import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useGlobalState } from "@/states";
import { useProjectManager } from "@/hooks";
import { toast } from "sonner";
import { Icons as LucidIcons } from "@/components/icons"
import Link from "next/link";
import { connect, createDataItemSigner } from "@permaweb/aoconnect";
import { APM_ID, runLua } from "@/lib/ao-vars";
import { Input } from "../ui/input";
import { ReloadIcon } from "@radix-ui/react-icons";
import Markdown from "react-markdown";
import { createLoaderFunc } from "@/lib/utils";

type TPackage = {
    Description: string;
    Installs: number;
    Name: string;
    Owner: string;
    PkgID: string;
    RepositoryUrl: string;
    Updated: number;
    Vendor: string;
    Version: string;
    README: string;
    Items: string;
}

export default function Packages() {
    const globalState = useGlobalState();
    const projectManager = useProjectManager();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [installing, setInstalling] = useState(false);
    const [packages, setPackages] = useState<TPackage[]>([]);
    const [activePackage, setActivePackage] = useState<TPackage | null>(null);
    const [activePackageInfo, setActivePackageInfo] = useState<TPackage | null>(null);
    const [debounce, setDebounceVal] = useState("");
    const [search, setSearch] = useState("");
    const p = projectManager.getProject(globalState.activeProject);

    const ao = connect();

    async function fetchPopular() {
        console.log("Fetching popular packages")
        setLoading(true);
        const pop = await ao.dryrun({
            process: APM_ID,
            tags: [
                { name: "Action", value: "APM.GetPopular" }
            ],
        })
        setLoading(false);
        console.log(pop)
        if (pop.Error) return toast.error("Error fetching popular packages", { description: pop.Error, id: "error" })
        const { Messages } = pop;
        // Messages.forEach((msg) => {
        //     const { Tags } = msg;
        //     const name = Tags.find((tag) => tag.name == "Action").value;
        //     if (name == "APM.GetPopularResponse") {
        //         const data = JSON.parse(msg.Data);
        //         setPackages(data);
        //         console.log(data)
        //     }
        // })
        const msg = Messages.find((msg) => msg.Tags.find((tag) => tag.name == "Action").value == "APM.GetPopularResponse")
        if (!msg) return toast.error("Error fetching popular packages", { description: "No popular response found", id: "error" })
        const data = JSON.parse(msg.Data);
        setPackages(data);
        console.log(data)
    }

    useEffect(() => {
        if (open) {
            setActivePackage(null);
            setInstalling(false)
            fetchPopular();
        }
    }, [open])

    useEffect(() => {
        if (activePackage) {
            setActivePackageInfo(null)
            ao.dryrun({
                process: APM_ID,
                tags: [
                    { name: "Action", value: "APM.Info" }
                ],
                data: `${activePackage.Vendor}/${activePackage.Name}`
            }).then((res) => {
                if (res.Error) return toast.error("Error fetching package info", { description: res.Error, id: "error" })
                const { Messages } = res;
                const msg = Messages.find((msg) => msg.Tags.find((tag) => tag.name == "Action").value == "APM.InfoResponse")
                if (!msg) return toast.error("Error fetching package info", { description: "No info response found", id: "error" })
                const data: TPackage = JSON.parse(msg.Data);
                setActivePackageInfo(data)
            })

        }
    }, [activePackage])

    async function loadapm() {
        //dryrun and check if apm is already installed
        const dry = await ao.dryrun({
            process: p.process,
            tags: [
                { name: "Action", value: "APM.UpdateNotice" }
            ],
            data: "CHECK"
        })
        console.log(dry)
        if (dry.Output.data == "CHECK") return
        console.log("Installing apm")
        // fetch latest apm source from repo
        const res = await fetch('https://raw.githubusercontent.com/ankushKun/ao-package-manager/main/client-tool.lua');
        const apmSource = await res.text();
        // console.log(apmSource)
        const loadResp = await runLua(apmSource, p.process)
        console.log(loadResp)
        if (loadResp.Error) return toast.error("Error loading APM", { description: loadResp.Error, id: "error" })
    }

    async function installPackage() {
        if (!activePackage) return;
        console.log("Installing package", activePackage.Name)
        setInstalling(true);
        await loadapm()
        const m_id = await ao.message({
            process: p.process,
            tags: [
                { name: "Action", value: "Eval" }
            ],
            data: `APM.install("${activePackage.Vendor}/${activePackage.Name}")`,
            signer: createDataItemSigner(window.arweaveWallet)
        })
        console.log("install request: ", m_id)
        const res = await ao.result({
            process: p.process,
            message: m_id
        })
        console.log(res)
        // const installRes = await ao.dryrun({
        //     process: APM_ID,
        //     tags: [
        //         { name: "Action", value: "APM.Info" }
        //     ],
        //     data: `${activePackage.Vendor}/${activePackage.Name}`
        // })
        // console.log(installRes)
        // if (installRes.Error) return toast.error("Error installing package", { description: installRes.Error, id: "error" })
        // const { Messages } = installRes;
        // Messages.forEach((msg) => {
        //     const { Tags } = msg;
        //     const name = Tags.find((tag) => tag.name == "Action").value;
        //     if (name == "APM.InfoResponse") {
        //         const data: TPackage = JSON.parse(msg.Data);
        //         // console.log(data)
        //         const Items = JSON.parse(Buffer.from(data.Items, 'hex').toString())
        //         console.log(Items)
        //         Items.forEach(async (item: any) => {
        //             if (item.meta.name == "main.lua") {
        //                 console.log("Installing package", item.meta.name)
        //                 const src = createLoaderFunc(`${data.Vendor == "@apm" ? "" : data.Vendor + "/"}${data.Name}`, item.data)
        //                 const r = await runLua(src, p.process, [
        //                     { name: "BetterIDEa-Function", value: "Install-Package" }
        //                 ])
        //                 console.log(r)
        //                 if (r.Error) return toast.error("Error installing package", { description: r.Error, id: "error" })
        //                 else {
        //                     toast.success("Package installed successfully")
        //                 }
        //             }
        //         })

        //     }
        // })
        // const msg = Messages.find((msg) => msg.Tags.find((tag) => tag.name == "Action").value == "APM.InfoResponse")
        // if (!msg) return toast.error("Error installing package", { description: "No info response found", id: "error" })
        // const data: TPackage = JSON.parse(msg.Data);
        // // console.log(data)
        // const Items = JSON.parse(Buffer.from(data.Items, 'hex').toString())
        // console.log(Items)
        // const mainSrc = Items.find((item: any) => item.meta.name == "main.lua").data
        // console.log("Installing package", data.Name)
        // const src = createLoaderFunc(`${data.Vendor == "@apm" ? "" : data.Vendor + "/"}${data.Name}`, mainSrc)
        // const r = await runLua(src, p.process, [
        //     { name: "BetterIDEa-Function", value: "Install-Package" }
        // ])
        // console.log(r)
        // if (r.Error) return toast.error("Error installing package", { description: r.Error, id: "error" })
        // else
        //     toast.success("Package installed successfully", { description: `Now you can import it using require('${data.Vendor == "@apm" ? "" : data.Vendor + "/"}${data.Name}')` })
        setInstalling(false);
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(debounce)
        }, 500);
        return () => clearTimeout(timer);
    }, [debounce])


    useEffect(() => {
        if (search) {
            console.log("Searching for", search)
            setLoading(true);
            ao.dryrun({
                process: APM_ID,
                tags: [
                    { name: "Action", value: "APM.Search" }
                ],
                data: search
            }).then((res) => {
                setLoading(false);
                if (res.Error) return toast.error("Error searching packages", { description: res.Error, id: "error" })
                const { Messages } = res;
                // Messages.forEach((msg) => {
                //     const { Tags } = msg;
                //     const name = Tags.find((tag) => tag.name == "Action").value;
                //     if (name == "APM.SearchResponse") {
                //         const data = JSON.parse(msg.Data);
                //         setPackages(data);
                //         console.log(data)

                //     }
                // })
                const msg = Messages.find((msg) => msg.Tags.find((tag) => tag.name == "Action").value == "APM.SearchResponse")
                if (!msg) return toast.error("Error searching packages", { description: "No search response found", id: "error" })
                const data = JSON.parse(msg.Data);
                setPackages(data);
                console.log(data)

            })
        } else {
            fetchPopular();
        }
    }, [search])

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger onClick={(e) => {
            e.preventDefault();
            // if (!globalState.activeProject) return toast({ title: "No active project", description: "You need to have an active project to use Modules" });
            if (!globalState.activeProject) return toast.error("No active project", { description: "You need to have an active project to use Modules", id: "error" });
            // if (globalState.activeMode != "AO") return toast({ title: "Not in AO mode", description: "Modules only work in AO" });
            if (globalState.activeMode != "AO") return toast.error("Not in AO mode", { description: "Modules only work in AO", id: "error" });
            const project = projectManager.getProject(globalState.activeProject);
            // if (!project) return toast({ title: "Project not found", description: "The active project was not found" });
            if (!project) return toast.error("Project not found", { description: "The active project was not found", id: "error" });
            // if (!project.process) return toast({ title: "Process id missing", description: "The active project doesnot seem to have a process id" });
            if (!project.process) return toast.error("Process id missing", { description: "The active project doesnot seem to have a process id", id: "error" });
            setOpen(true);
        }}>
            <div className="flex flex-col items-center justify-center opacity-50 hover:opacity-80 active:opacity-100">
                {/* <Image src={Icons.modulesSVG} alt="Modules" width={20} height={20} className="my-1 hover:invert" /> */}
                <LucidIcons.modules className="my-1 fill-foreground" />
                <div className="text-xs">PACKAGES</div>
            </div>
        </DialogTrigger>
        <DialogContent className="max-w-[75vw] max-h-[80vh]">
            <DialogHeader>
                <DialogTitle>Explore packages</DialogTitle>
                <DialogDescription>
                    Packages allow you to add extra functionality to your ao processes. To publish your own package visit <Link href="https://apm.betteridea.dev" target="_blank">apm.betteridea.dev</Link>
                </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2">
                <div className="flex flex-col gap-1 w-[269px]">
                    <div>
                        <Input placeholder="search packages" className="focus:!ring-transparent" onChange={(e) => setDebounceVal(e.target.value)} />
                    </div>
                    <div className="h-[60vh] overflow-scroll p-0.5 flex flex-col gap-0.5">
                        {
                            loading ? <><ReloadIcon className=" animate-spin mx-auto" /></> : packages.map((pkg: TPackage, _: number) => {
                                return <div key={_} data-active={pkg.PkgID == activePackage?.PkgID} className="p-1 px-2 ring-1 ring-foreground/10 m-0.5 rounded-lg cursor-pointer data-[active=true]:bg-foreground/5" onClick={() => setActivePackage(pkg)}>
                                    <div>{pkg.Name}</div>
                                    <div className="truncate">{pkg.Description}</div>
                                    <div className="text-xs text-right">{pkg.Installs} installs</div>
                                </div>
                            })
                        }
                    </div>
                </div>
                <div className="border border-foreground/10 rounded-lg grow overflow-scroll whitespace-normal max-w-[calc(75vw-300px)] h-[66vh]">
                    {activePackage && <div className="p-2 text-sm">
                        <div className="text-lg">{activePackage.Vendor !== "@apm" && activePackage.Vendor + "/"}{activePackage.Name}</div>
                        <div className="">{activePackage.Description}</div>
                        <div className="">{activePackage.Installs} installs | version: {activePackage.Version}</div>

                        {/* <div className="text-xs text-right">{activePackage.Vendor}</div> */}
                        <div className="">Last updated on {new Date(activePackage.Updated).toString()}</div>
                        <div className="">by {activePackage.Owner}</div>
                        <div className="flex items-center justify-center gap-2 p-1">
                            <Link href={`https://apm.betteridea.dev/pkg?id=${activePackage.PkgID}`} target="_blank" className="text-primary underline underline-offset-4">
                                <Button className="">View on APM</Button>
                            </Link>
                            <Button disabled={installing} onClick={installPackage}>
                                {installing && <ReloadIcon className="animate-spin mr-1" />} Install Package
                            </Button>
                        </div>
                        <div className="overflow-scroll h-[40vh]">
                            <Markdown className="markdown">{activePackageInfo ? Buffer.from(activePackageInfo.README, 'hex').toString() : "loading..."}</Markdown>

                        </div>
                    </div>}
                </div>
            </div>
        </DialogContent>
    </Dialog>
}
