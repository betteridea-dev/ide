import { Button } from "@/components/ui/button"
import { useGlobalState, useProjectManager } from "@/hooks"
import { APM_ID, runLua, Tag, TPackage } from "@/lib/ao-vars"
import { connect, createDataItemSigner } from "@permaweb/aoconnect"
import { DownloadIcon, ExternalLink, Loader, LoaderIcon, PackageCheckIcon, PackageOpen, Wallet } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import Markdown from "react-markdown"
import { toast } from "sonner"
import { dryrun } from "@permaweb/aoconnect"
import remarkGfm from "remark-gfm"
import { getRelativeTime } from "@/lib/utils"
import { useLocalStorage } from "usehooks-ts"

export default function PackageView() {
    const globalState = useGlobalState()
    const manager = useProjectManager()
    const ao = connect()
    const [installed, setInstalled] = useLocalStorage<{ [pname: string]: { [packageName: string]: string } }>("installed-packages", {}, { initializeWithValue: true })
    // const [installed, setInstalled] = useState(false)
    const [fullData, setFullData] = useState<TPackage | null>(null)
    const [fetching, setFetching] = useState(false)
    const [installing, setInstalling] = useState(false)

    const project = globalState.activeProject && manager.getProject(globalState.activeProject)
    const packageData = globalState.openedPackages.find((pkg) => `${pkg.Vendor}/${pkg.Name}` == globalState.activeFile.split("PKG: ")[1])
    console.log(packageData)

    async function checkInstalled() {
        if (!project) return
        if (!project.process) return
        const res = await runLua(`return require("json").encode(apm.installed or {})`, project.process, [
            { name: "BetterIDEa-Function", value: "Packages" }
        ])
        let { Output: { data: { output } } } = res
        if (!output) output = res.Output.data
        const installed = JSON.parse(output)
        console.log("installed", installed)
        if (installed[`${packageData.Vendor}/${packageData.Name}`]) {
            setInstalled(p => {
                if (!p[project.process]) p[project.process] = {}
                p[project.process][`${packageData.Vendor}/${packageData.Name}`] = installed[`${packageData.Vendor}/${packageData.Name}`]
                return p
            })
        }
    }

    useEffect(() => {
        if (!packageData || !globalState.activeFile) return
        if (!globalState.activeFile.startsWith("PKG:")) return
        checkInstalled()
    }, [globalState.activeFile])

    useEffect(() => {
        if (!packageData || !globalState.activeFile) return
        if (!globalState.activeFile.startsWith("PKG:")) return
        if (packageData.PkgID) {
            setFullData(null)
            setFetching(true)
            dryrun({
                process: APM_ID,
                tags: [
                    { name: "Action", value: "APM.Info" }
                ],
                data: `${packageData.Vendor}/${packageData.Name}`
            }).then((res) => {
                if (res.Error) return toast.error("Error fetching package info", { description: res.Error, id: "error" })
                const { Messages } = res;
                const msg = Messages.find((msg) => msg.Tags.find((tag) => tag.name == "Action").value == "APM.InfoResponse")
                if (!msg) return toast.error("Error fetching package info", { description: "No info response found", id: "error" })
                const data: TPackage = JSON.parse(msg.Data);
                setFullData(data)
                globalState.addOpenedPackage(data)
            }).finally(() => setFetching(false))
        }
    }, [globalState.activeFile])

    async function loadapm() {
        if (!globalState.activeProject) return toast.error("No active project", { description: "You need to have an active project to use Packages", id: "error" })
        const p = manager.getProject(globalState.activeProject);
        console.log("Installing apm")
        const res = await fetch('https://raw.githubusercontent.com/betteridea-dev/ao-package-manager/refs/heads/main/client/client.lua');
        const apmSource = await res.text();
        const loadResp = await runLua(apmSource, p.process, [{ name: "BetterIDEa-Function", value: "Load-APM" }])
        console.log(loadResp)
        if (loadResp.Error) return toast.error("Error loading APM", { description: loadResp.Error, id: "error" })
    }

    async function installPackage() {
        if (!globalState.activeProject) return toast.error("No active project", { description: "You need to have an active project to use Packages", id: "error" })
        console.log("Installing package", packageData.Name)
        setInstalling(true);
        await loadapm()
        const p = manager.getProject(globalState.activeProject);
        const m_id = await ao.message({
            process: p.process,
            tags: [
                { name: "Action", value: "Eval" }
            ],
            data: `apm.install "${packageData.Vendor}/${packageData.Name}"`,
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
        //parse through messages and find a tag with name "Result"
        //if the value is "success" then package is installed
        //if the value is "error" then package is not installed

        const { Messages } = res
        console.log("msgs", Messages)


        // setInstalled(p => {
        //     if (!p[project.process]) p[project.process] = {}
        //     p[project.process][`${packageData.Vendor}/${packageData.Name}`] = "installed"
        //     return p
        // })
    }

    if (!packageData) {
        console.log(globalState.openedPackages)
        return <div className="p-5">No package data found</div>
    }

    return <div className="p-5 overflow-scroll w-full">
        <div className="flex gap-3 text-nowrap w-full">
            <div className="min-w-[120px] max-w-[120px] aspect-square bg-accent/60 rounded-sm flex items-center justify-center">
                <PackageOpen className="opacity-50" size={80} />
            </div>
            <div className="w-full">
                <div className="font-medium text-2xl">{packageData?.Name}
                    <span className="mx-4 text-sm bg-accent px-1.5 rounded-md">v{packageData.Version}</span>
                    <span className="text-sm bg-accent px-1.5 rounded-md">Updated {packageData.Timestamp == 0 ? "NA" : getRelativeTime(packageData.Timestamp)}</span>
                </div>
                <div className="text-sm  flex gap-5 items-center">
                    <span>by {packageData.Vendor}</span> ·
                    <span><DownloadIcon className="inline pb-1" size={18} /> {packageData.Installs}</span>
                </div>
                <div className="text-sm my-2">{packageData.Description}</div>
                <div className="flex gap-1.5">
                    {/* <Button variant="default" disabled={!globalState.activeProject || !project.process || installing} className="rounded-none h-6 p-3 text-white mr-auto" onClick={installPackage}>{(project && project.process && (installed[project.process][packageData.Vendor + "/" + packageData.Name])) ? "Update" : "Install"} {installing && <Loader className="animate-spin ml-2" size={16} />}</Button> */}
                    <Button variant="default" disabled={!globalState.activeProject || !project.process || installing} className="rounded-none h-6 p-3 text-white mr-auto" onClick={installPackage}>{"Install"} {installing && <Loader className="animate-spin ml-2" size={16} />}</Button>
                    <Link href={`https://apm.betteridea.dev/pkg?name=${packageData.Vendor}/${packageData.Name}`} target="_blank"><Button variant="default" className="rounded-none h-6 p-3 text-white">APM <ExternalLink size={16} className="ml-1 pb-0.5" /></Button></Link>
                    <Link href={packageData.Repository || "#"} target="_blank"><Button variant="default" className="rounded-none h-6 p-3 text-white">Repository <ExternalLink size={16} className="ml-1 pb-0.5" /></Button></Link>
                </div>
            </div>
        </div>
        <div className="text-sm mt-3 flex gap-1 text-muted text-nowrap">
            <Wallet size={16} /> <span> {packageData.Owner}</span> <PackageCheckIcon className="ml-5" size={16} /> <span> {packageData.PkgID}</span>
        </div>
        <hr className="my-3" />
        {!packageData?.Readme && <LoaderIcon className="animate-spin mx-auto" />}
        <Markdown remarkPlugins={[remarkGfm]} className="markdown" components={{
            a: ({ node, ...props }) => <a {...props} className="text-primary hover:underline" />,
        }}>
            {
                Buffer.from(packageData?.Readme || "", 'hex').toString()
            }
        </Markdown>
    </div>
}
