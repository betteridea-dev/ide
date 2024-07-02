import { useProjectManager } from "@/hooks"
import { useGlobalState } from "@/states"
import { Icons } from "../icons"
import { Button } from "../../ui/button"

export default function AllProjects() {
    const manager = useProjectManager()
    const globalState = useGlobalState()

    const projects = manager.projects


    
    return <div className="h-full ring-1 w-full p-10">
        <div className="text-xl ">All Projects</div>
        <div className="text-sm">(work in progress)</div>

        <div className="grid grid-cols-5 w-fit gap-3 p-3">
            <Button variant="ghost" className="flex h-fit gap-5 ring-1 ring-border p-5 rounded-sm items-center justify-center" onClick={()=>document.getElementById('new-proj-dialog')?.click()}>
                <Icons.sqPlus/>
                <h2>New Project</h2>
            </Button>
        {
            Object.keys(projects).map((key) => {
                const project = projects[key]
                return <Button variant="ghost" key={key} className="flex h-fit gap-5 ring-1 ring-border p-5 rounded-sm items-center justify-center"
                    onClick={()=>document.getElementById(key)?.click()}
                >
                    <Icons.folder fill="black"/>
                    <h2>{project.name}</h2>
                </Button>
            })
        }
    </div>
    </div>
}