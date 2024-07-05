import { Button } from "@/components/ui/button";
import { TView } from "."
import { ArrowLeft, Folder, PlusSquare, Search } from "lucide-react";
import { useGlobalState, useProjectManager } from "@/hooks";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Image from "next/image";
import dinBharCode from "@/assets/din-bhar-code.png"
import { useLocalStorage } from "usehooks-ts";
import { pushToRecents } from "@/lib/utils";


function AllProjects() {
    const globalState = useGlobalState();
    const manager = useProjectManager();
    const [searchInput, setSearchInput] = useState("")
    const [recents, setRecents] = useLocalStorage<string[]>("recents", [], {initializeWithValue:true})

    const projectList = Object.keys(manager.projects)

    return <div className="p-10 h-[calc(100vh-50px)] overflow-y-scroll">
        <Button variant="link" className="text-sm text-muted p-0" onClick={() => globalState.setActiveView(null)}>
            <ArrowLeft size={15} className="inline-block mr-2" /> home
        </Button>
        {/* <Button variant="ghost" className="bg-accent hover:bg-primary hover:text-white p-7 gap-2" onClick={() => {}}><PlusSquare/> New Project</Button> */}

        <div className="my-5 text-xl">Recently Opened Projects</div> 
        <div className="flex my-5 items-center justify-start gap-6 mb-14">
            {
                recents.length == 0 && <div className="text-muted">No recent projects</div>
            }
            {
                recents.toReversed().slice(0,3).map((project, id) => {
                    return <Button variant="ghost" className="bg-accent hover:bg-primary hover:text-white p-6 md:p-10 lg:p-11 !aspect-video relative"
                        key={id} onClick={() => {
                            globalState.setActiveView("EDITOR")
                            globalState.setActiveProject(project) 
                            globalState.setActiveFile(Object.keys(manager.projects[project].files)[0])
                            pushToRecents(project)
                        }}>
                        <Folder size={30} className="fill-accent-foreground/60" strokeWidth={0}/> 
                        <div className="absolute text-foreground -bottom-5">{ project}</div>
                        </Button>
                })
            }
            <Button variant="ghost" className="bg-accent text-accent-foreground/60 hover:bg-primary hover:text-white p-6 md:p-10 lg:p-11 aspect-video relative"
                onClick={() => document.getElementById("new-project")?.click()}>
                <PlusSquare />
                <div className="absolute text-foreground -bottom-5">New Project</div>
            </Button>
        </div>
        <h1 className=" mt-5 text-xl">All Projects</h1>
        <div className="relative">
            <Search className="absolute left-4 top-3.5 text-border" size={17} />
            <Input placeholder="Search Projects" className="w-full max-w-[50vw] my-5 pl-10 py-6 bg-accent/50 border-none" onChange={(e) => setSearchInput(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2 z-20 relative">
            {
                projectList.length == 0 && <div className="text-muted">No projects found</div>
            }
            {
                projectList.map((project, id) => {
                    const item = <Button variant="ghost" className="bg-accent hover:bg-primary hover:text-white justify-start p-7 max-w-[50vw]"
                        key={id} onClick={() => {
                            globalState.setActiveView("EDITOR")
                            globalState.setActiveProject(project) 
                            globalState.setActiveFile(Object.keys(manager.projects[project].files)[0])
                            pushToRecents(project)
                        }}>{project}</Button>
                    return searchInput ? project.includes(searchInput) && item:item})
            }
        </div>
        <Image src={dinBharCode} width={350} height={150} className="absolute right-0 bottom-6 z-0" alt="din bhar code" draggable={false} />
    </div>
}

const viewItem: TView = {
    component: AllProjects,
    label: "All Projects",
    value: "ALL_PROJECTS" // udpate this and add to the list in ./index.ts
}

export default viewItem;