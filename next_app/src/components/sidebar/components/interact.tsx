import { TSidebarItem } from ".";
import { Files, FlaskConical } from "lucide-react"
import { useGlobalState } from "@/hooks";

const item:TSidebarItem = {
    icon: FlaskConical,
    label: "Interact",
    value: "INTERACT"
}

export default item;