import { TSidebarItem } from ".";
import { Files } from "lucide-react"
import { useGlobalState } from "@/hooks";

const item:TSidebarItem = {
    icon: Files,
    label: "Files",
    value: "FILES"
}

export default item;