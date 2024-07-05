import { useGlobalState, useProjectManager } from "@/hooks"
import Ansi from "ansi-to-react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default function Output() {
    const globalState = useGlobalState()
    const manager = useProjectManager()

    const project = globalState.activeProject && manager.getProject(globalState.activeProject)
    const file = project && project.getFile(globalState.activeFile)
    const extension = file && file.name.split(".").pop()

    const output = extension == "md"? file.content.cells[0].code : globalState.lastOutput

    return <>
        {
            output ? <pre className="bg-background p-2 rounded-md text-sm font-btr-code">
                {extension == "md" ? <Markdown remarkPlugins={[remarkGfm]} components={{
                    a: ({node, ...props}) => <a {...props} className="text-primary hover:underline"/>
                }} className="markdown">{output}</Markdown>:<Ansi>{output}</Ansi>}
            </pre> : <div className="bg-background p-2 rounded-md text-sm text-muted-foreground">
                Run lua to get output
            </div>
        }
    </>
}