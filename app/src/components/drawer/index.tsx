import { cn } from "@/lib/utils"
import { useGlobalState } from "../../hooks/use-global-state"
import Files from "./files"
import Packages from "./packages"
import Sqlite from "./sqlite"
import Interact from "./interact"

export default function Drawer() {
    const { drawerOpen, actions: sidebarActions } = useGlobalState()

    const Switcher = () => {
        const { activeDrawer: activeTab } = useGlobalState()

        switch (activeTab) {
            case "files":
                return <Files />
            case "packages":
                return <Packages />
            case "sqlite":
                return <Sqlite />
            case "interact":
                return <Interact />
            default:
                return <div>Drawer</div>
        }
    }

    return <div className={cn("w-full h-full bg-background", drawerOpen && "block")}>
        <Switcher />
    </div>
}