import { useGlobalState, useProjectManager } from "@/hooks";
import { TDrawerItem } from "."
import { Button } from "@/components/ui/button";

function FileList() {
    const manager = useProjectManager();
    const globalState = useGlobalState();

    if (globalState.activeProject) {
        const project = manager.projects[globalState.activeProject];
        return <div className="flex flex-col">
            <h1 className="text-center my-3">Files</h1>
            {
                Object.keys(project.files).map((fname, i) => <Button key={i} variant="ghost"
                    data-active={globalState.activeFile == fname}
                    className="w-full mx-auto justify-start truncate rounded-none data-[active=true]:bg-foreground/20"
                    onClick={() => {
                        globalState.setActiveFile(fname);
                        // globalState.addOpenedFile(fname);
                        globalState.setActiveView("EDITOR")
                    }}
                >
                    {fname}
                </Button>)
            }
        </div>
    } else {
        return <div className="flex flex-col">
            <h1 className="text-center my-2">No Project opened</h1>
            <p className="text-center text-sm my-2">Open a project to view files</p>

            <Button variant="ghost" className="rounded-none m-4 bg-primary min-w-fit text-white"
                onClick={() => {
                    document.getElementById("all-projects")?.click()
                }}
            >View all projects</Button>
        </div>
    }

    return <div>
        {
            Array(10).fill(0).map((_, i) => <div key={i}>File {i}</div>)
        }
    </div>
}

const drawerItem:TDrawerItem = {
    component: FileList,
    label: "File List",
    value: "FILES"
}

export default drawerItem;