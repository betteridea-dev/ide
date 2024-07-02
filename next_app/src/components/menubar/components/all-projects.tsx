import { Button } from "@/components/ui/button";
import { useGlobalState } from "@/hooks";

export default function AllProjectsBtn() {
    const globalState = useGlobalState()
    
    return <Button variant="ghost" className="text-xs p-2 invisible" id="all-projects" onClick={() => {
        globalState.setActiveView("ALL_PROJECTS")
    }}>
        all projects button
        </Button>
}