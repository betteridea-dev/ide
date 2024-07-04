import { useGlobalState, useProjectManager } from "@/hooks";
import { TDrawerItem } from "."
import { TPackage, APM_ID, Tag } from "@/lib/ao-vars";
import { useEffect, useState } from "react";
import { connect } from "@permaweb/aoconnect";
import { toast } from "sonner";
import { LoaderIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

function PackageList() {
    const globalState = useGlobalState();
    const manager = useProjectManager();
    const ao = connect();
    const [packages, setPackages] = useState<TPackage[]>([]);
    const [loading, setLoading] = useState(false);
    const [activePackage, setActivePackage] = useState<TPackage | null>(null);
    const [search, setSearch] = useState("");
    const [debounce, setDebounceVal] = useState("");

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
            fetchPopular();
        }
    }, [open])

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
    
    function viewPackage(pkg: TPackage) {
        if (!pkg) return
        setActivePackage(pkg);
        globalState.addOpenedPackage(pkg);
        globalState.setActiveView("EDITOR");
        globalState.setActiveFile(`PKG: ${pkg.Vendor}/${pkg.Name}`);
    }



    return <div className="flex flex-col max-h-[calc(100vh-50px)]">
        <h1 className="text-center my-3">Browse Packages</h1>
        <Input placeholder="Search packages" className="rounded-none  border-y h-fit p-1" onChange={(e)=>setDebounceVal(e.target.value)} />
        <div className="grid grid-cols-1 overflow-scroll py-0.5">
            {
                loading ? <><LoaderIcon className=" animate-spin mx-auto" /></> :
                    packages.map((pkg: TPackage, _: number) => {
                    return <div key={_} data-active={pkg.PkgID == activePackage?.PkgID} className="p-1 px-2 border-b first:border-t  border-border/30 cursor-pointer data-[active=true]:bg-foreground/5" onClick={()=>viewPackage(pkg)}>
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