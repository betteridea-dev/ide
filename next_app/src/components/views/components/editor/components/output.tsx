import { useGlobalState, useProjectManager } from "@/hooks"
import Ansi from "ansi-to-react"

export default function Output() {
    const globalState = useGlobalState()


    return <>
        {
            globalState.lastOutput ? <pre className="bg-background p-2 rounded-md text-sm font-btr-code">
                <Ansi>{globalState.lastOutput}</Ansi>
            </pre> : <div className="bg-background p-2 rounded-md text-sm text-muted-foreground">
                Run lua to get output
            </div>
        }
    </>
}