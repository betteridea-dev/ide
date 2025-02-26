import { TSidebarItem } from ".";
import { BotMessageSquare, MessageCircleHeart } from "lucide-react"
import { useGlobalState } from "@/hooks";

const item: TSidebarItem = {
    icon: () => (
        <div className="relative flex flex-col items-center">
            <BotMessageSquare />
            <div className="-mt-2 bg-primary text-primary-foreground px-1.5 rounded-full font-semibold text-[10px]">
                NEW
            </div>
        </div>)
    ,
    label: "AO Companion",
    value: "AI_CHAT"
}

export default item;