import { Button } from "@/components/ui/button";
import { TView } from "."
import { ArrowLeft } from "lucide-react";
import { useGlobalState } from "@/hooks";


function AllProjects() {
    const globalState = useGlobalState();

    return <div className="p-5">
        <Button variant="link" className="mb-5 text-sm text-muted p-0" onClick={() => globalState.setActiveView(null)}>
            <ArrowLeft size={15} className=" inline-block mr-2" /> home
        </Button>
        <div>All Projects (todo)</div>
    </div>
}

const viewItem: TView = {
    component: AllProjects,
    label: "All Projects",
    value: "ALL_PROJECTS" // udpate this and add to the list in ./index.ts
}

export default viewItem;