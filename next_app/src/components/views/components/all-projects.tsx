import { Button } from "@/components/ui/button";
import { TView } from "."
import { ArrowLeft, Folder, Search } from "lucide-react";
import { useGlobalState, useProjectManager } from "@/hooks";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Image from "next/image";
import dinBharCode from "@/assets/din-bhar-code.png"
import { useLocalStorage } from "usehooks-ts";


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
        <h1 className="my-10 mt-5 text-xl">All Projects</h1>
        {/* <div className="my-5">Recently Opened</div>  */}
        {/* <div className="grid grid-cols-5 gap-1 max-w-[50vw]">
            {

            }
        </div> */}
        {/* <hr className="my-5 max-w-[50vw] border-border/30"/> */}
        <div className="relative">
            <Search className="absolute left-3 top-2.5" size={17}/>
            <Input placeholder="Search Projects" className="w-full max-w-[50vw] my-5 pl-10 bg-accent/50 border-none" onChange={(e)=>setSearchInput(e.target.value)}  />
        </div>
        <div className="flex flex-col gap-2 z-20 relative">
            {
                projectList.map((project, id) => {
                    const item = <Button variant="ghost" className="bg-accent hover:bg-primary hover:text-white justify-start p-7 max-w-[50vw]"
                        key={id} onClick={() => {
                            globalState.setActiveView("EDITOR")
                            globalState.setActiveProject(project) 
                            globalState.setActiveFile(Object.keys(manager.projects[project].files)[0])
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