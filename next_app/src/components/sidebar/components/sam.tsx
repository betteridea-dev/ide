import { TSidebarItem } from ".";
import { SearchCode } from "lucide-react"
import { useGlobalState } from "@/hooks";

const item: TSidebarItem = {
    icon: SearchCode,
    label: "Auditing (beta)",
    value: "SAM"
}

export default item;