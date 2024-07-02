import { useGlobalState, useProjectManager } from "@/hooks";
import { TDrawerItem } from "."

function PackageList() {
    const globalState = useGlobalState();
    const manager = useProjectManager();
    const projects = manager.projects;

    return <div className="flex flex-col max-h-[calc(100vh-40px)]">
        <h1 className="text-center my-3">Browse Packages</h1>
        <div className="grid grid-cols-1 overflow-scroll">
            {
                
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