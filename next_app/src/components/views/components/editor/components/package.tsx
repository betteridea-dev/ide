import { Button } from "@/components/ui/button"
import { useGlobalState, useProjectManager } from "@/hooks"
import { DownloadIcon, ExternalLink, PackageOpen } from "lucide-react"
import Link from "next/link"
import Markdown from "react-markdown"

export default function PackageView() {
    const globalState = useGlobalState()
    const manager = useProjectManager()

    const project = globalState.activeProject && manager.getProject(globalState.activeProject)
    const packageData = globalState.openedPackages.find((pkg) => `${pkg.Vendor}/${pkg.Name}` == globalState.activeFile.split("PKG: ")[1])

    if (!packageData) {
        console.log(globalState.openedPackages)
        return <div className="p-5">No package data found</div>
    }

    return <div className="p-5 overflow-scroll w-full">
        <div className="flex gap-3 text-nowrap">
            <div className="min-w-[120px] max-w-[120px] aspect-square bg-accent/60 rounded-sm flex items-center justify-center">
                <PackageOpen className="opacity-50" size={80} />
            </div>
            <div>
                <div className="font-medium text-2xl">{packageData?.Name}<span className="mx-5 text-sm bg-accent px-1.5 rounded-md">v{packageData.Version}</span></div>
                <div className="text-sm  flex gap-5 items-center">
                    <span>by {packageData.Vendor}</span> ·
                    <span><DownloadIcon className="inline pb-1" size={18} /> {packageData.Installs}</span>
                </div>
                <div className="text-sm my-2">{packageData.Description}</div>
                <div className="flex gap-1.5">
                    <Button variant="default" disabled={!globalState.activeProject || !project.process} className="rounded-none h-6 p-3 text-white">Install</Button>
                    <Link href={`https://apm.betteridea.dev/pkg?name=${packageData.Vendor}/${packageData.Name}@${packageData.Version}`} target="_blank"><Button variant="default" className="rounded-none h-6 p-3 text-white">APM <ExternalLink size={16} className="ml-1 pb-0.5" /></Button></Link>
                    <Link href={packageData.RepositoryUrl} target="_blank"><Button variant="default" className="rounded-none h-6 p-3 text-white">Repository <ExternalLink size={16} className="ml-1 pb-0.5" /></Button></Link>
                </div>
            </div>
        </div>
        <div className="text-sm mt-3 flex gap-3 text-muted text-nowrap">
            <span>Owner: {packageData.Owner}</span>|<span>PkgID: {packageData.PkgID}</span>
        </div>
        <hr className="my-3" />
        <Markdown >

        </Markdown>
    </div>
}