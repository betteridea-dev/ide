import { Button } from "@/components/ui/button";
import { useGlobalState } from "@/hooks/useGlobalState";
import { Plus } from "lucide-react";

export default function AiPanel() {
    const { activeFile } = useGlobalState()

    if (!activeFile) {
        return <div className="p-6 text-center h-2/3 flex items-center justify-center">
            <div className="text-sm text-muted-foreground">
                Open a file to use AI
            </div>
        </div>
    }

    return <div className="flex flex-col items-center justify-center">
        <div className="flex gap-2 w-full">
            <Button disabled variant="ghost" className="rounded-none" >CHAT</Button>
        </div>
        <div className="text-sm text-muted-foreground p-2">coming soon ;)</div>
    </div>
}