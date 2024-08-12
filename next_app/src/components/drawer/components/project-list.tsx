import { useGlobalState, useProjectManager } from "@/hooks";
import { TDrawerItem } from "."
import { Button } from "@/components/ui/button";
import { pushToRecents } from "@/lib/utils";

function ProjectList() {
    const globalState = useGlobalState();
    const manager = useProjectManager();
    const projects = manager.projects;

    return <div className="flex flex-col max-h-[calc(100vh-50px)]">
        <h1 className="text-left text-muted-foreground m-3">PROJECTS</h1>
        <div className="grid grid-cols-1 overflow-scroll">
            {
                Object.keys(projects).toSorted().map((pname, i) => (
                    <Button variant="ghost" key={i} data-active={globalState.activeProject == pname}
                        className="rounded-none w-full mx-auto justify-start truncate data-[active=true]:bg-foreground/20"
                        onClick={() => {
                            globalState.setActiveProject(pname);
                            globalState.setActiveSidebarItem("FILES");
                            const files = Object.keys(projects[pname].files);
                            globalState.setActiveFile(files[0]);
                            globalState.setActiveView("EDITOR");
                            pushToRecents(pname);
                        }}
                    >{pname}</Button>
                ))
            }
        </div>
    </div>
}

const drawerItem: TDrawerItem = {
    component: ProjectList,
    label: "Project List",
    value: "ALL_PROJECTS"
}

export default drawerItem;