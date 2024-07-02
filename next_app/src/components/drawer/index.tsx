import { useGlobalState } from "@/hooks"
import drawerItems from "./items"
import { useEffect } from "react"

export default function SidebarDrawer() {
    const globalState = useGlobalState()

    return <div className="whitespace-nowrap overflow-scroll">
        {
            drawerItems.map((item, i) => {
                return item.value == globalState.activeSidebarItem ? <item.component key={i} /> : null
            })
        }
    </div>
}