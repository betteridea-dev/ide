import { TSidebarItem } from ".";
import { Bug, Files } from "lucide-react"
import { useGlobalState } from "@/hooks";

const item: TSidebarItem = {
    icon: Bug,
    label: "SAM Audit (coming soon)",
    value: "SAM"
}

export default item;