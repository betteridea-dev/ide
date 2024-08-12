import { Input } from "@/components/ui/input";
import { TView } from "."
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import { useGlobalState } from "@/hooks";

function Boilerplate() {
    return <div className="p-5 border rounded">

        <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Boilerplate Name</div>
            <div className="text-sm text-gray-500">Publisher: <span className="font-semibold">Username</span></div>
        </div>

    </div>
}

function Marketplace() {
    const globalState = useGlobalState();

    return <div className="p-10">
        <Button variant="link" className="mb-5 text-sm text-muted p-0" onClick={() => {
            globalState.setActiveView(null)
            globalState.setActiveSidebarItem(null)
        }}>
            <ArrowLeft size={15} className=" inline-block mr-2" /> home
        </Button>
        <div className="text-2xl">Boilerplate Marketplace</div>
        <div className="relative my-8">
            <Input placeholder="Search" className="pl-8" />
            <Search className="absolute top-1/2 left-2 transform -translate-y-1/2" size={18} />
        </div>

        <div className="grid gap-3">
            <Boilerplate />
            <Boilerplate />
            <Boilerplate />
            <Boilerplate />
            <Boilerplate />
        </div>

    </div>
}

const viewItem: TView = {
    component: Marketplace,
    label: "Boilerplate Marketplace",
    value: "MARKETPLACE" // udpate this and add to the list in ./index.ts
}

export default viewItem;