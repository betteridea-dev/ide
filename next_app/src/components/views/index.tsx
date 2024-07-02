import { useGlobalState } from "@/hooks"
import viewItems from "./components"

export default function View() {
    const globalState = useGlobalState();
    
    
    return <>
        {
            viewItems.map((Item, i) => {
                return globalState.activeView==Item.value? <Item.component key={i} />:null
            })
        }
    </>
}