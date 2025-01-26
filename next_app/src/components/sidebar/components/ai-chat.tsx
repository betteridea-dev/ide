import { TSidebarItem } from ".";
import { Files, MessageCircleHeart } from "lucide-react"
import { useGlobalState } from "@/hooks";

const item: TSidebarItem = {
    icon: MessageCircleHeart,
    label: "AI Chat",
    value: "AI_CHAT"
}

export default item;