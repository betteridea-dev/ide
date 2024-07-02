import { TSidebarItem } from ".";
import { FileCode } from "lucide-react"
import { useGlobalState } from "@/hooks";

const item:TSidebarItem = {
    icon: FileCode,
    label: "Files",
    value: "FILES"
}

export default item;