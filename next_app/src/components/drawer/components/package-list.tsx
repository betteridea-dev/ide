import { useGlobalState, useProjectManager } from "@/hooks";
import { TDrawerItem } from "."
import { TPackage, APM_ID, Tag } from "@/lib/ao-vars";
import { useEffect, useState } from "react";
import { connect } from "@permaweb/aoconnect";
import { toast } from "sonner";
import { LoaderIcon } from "lucide-react";

function PackageList() {
    const globalState = useGlobalState();
    const manager = useProjectManager();
    const ao = connect();
    const [packages, setPackages] = useState<TPackage[]>([]);
    const [loading, setLoading] = useState(false);
    const [installing, setInstalling] = useState(false);
    const [activePackage, setActivePackage] = useState<TPackage | null>(null);

    const project = globalState.activeProject && manager.getProject(globalState.activeProject);

    async function fetchPopular() {
        console.log("Fetching popular packages")
        setLoading(true);
        const pop = await ao.dryrun({
            process: APM_ID,
            tags: [ { name: "Action", value: "APM.GetPopular" }],
        })
        setLoading(false);
        if (pop.Error) return toast.error("Error fetching popular packages", { description: pop.Error, id: "error" })
        const { Messages } = pop;
        const msg = Messages.find((msg) => msg.Tags.find((tag:Tag) => tag.name == "Action").value == "APM.GetPopularResponse")
        if (!msg) return toast.error("Error fetching popular packages", { description: "No popular response found", id: "error" })
        const data = JSON.parse(msg.Data);
        setPackages(data);
        console.log(`found ${data.length} popular packages`)
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
            globalState.addOpenedPackage(activePackage);
            globalState.setActiveFile(`PKG: ${activePackage.Vendor!="@apm"?`${activePackage.Vendor}/`:""}${activePackage.Name}`);
        }
    },[activePackage])



    return <div className="flex flex-col max-h-[calc(100vh-50px)]">
        <h1 className="text-center my-3">Browse Packages</h1>
        <div className="grid grid-cols-1 overflow-scroll py-0.5">
            {
                loading ? <><LoaderIcon className=" animate-spin mx-auto" /></> : packages.map((pkg: TPackage, _: number) => {
                    return <div key={_} data-active={pkg.PkgID == activePackage?.PkgID} className="p-1 px-2 border-b first:border-t  border-border/30 cursor-pointer data-[active=true]:bg-foreground/5" onClick={() => setActivePackage(pkg)}>
                        <div>{ pkg.Vendor!="@apm"&&`${pkg.Vendor}/`}{pkg.Name}</div>
                        <div className="truncate">{pkg.Description}</div>
                        <div className="text-xs text-right">{pkg.Installs} installs</div>
                    </div>
                })
            }
        </div>
    </div>
}

const drawerItem:TDrawerItem = {
    component: PackageList,
    label: "Packages",
    value: "PACKAGES"
}

export default drawerItem;