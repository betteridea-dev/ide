import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useGlobalState, useProjectManager } from "@/hooks"
import { runLua, Tag } from "@/lib/ao-vars"
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog"
import { Loader, LoaderIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useSessionStorage } from "usehooks-ts"

interface TInboxMessage {
    Data: string,
    From: string,
    Action: string,
    Timestamp: number
}

export default function Interact() {
    const globalState = useGlobalState()
    const manager = useProjectManager()
    const [action, setAction] = useState<string>("")
    const [data, setData] = useState<string>("")
    const [inputTags, setInputTags] = useState<Tag[]>([])
    const [output, setOutput] = useState<string>("")
    const [eqLua, setEqLua] = useState<string>("")
    const [sendingMessage, setSendingMessage] = useState<boolean>(false)
    const project = globalState.activeProject && manager.projects[globalState.activeProject]

    useEffect(() => {
        if (!globalState.activeProject) return
        
        setEqLua(`Send({
    Target = "${project.process}",${action?`\n\tAction = "${action}",`:""}${data?`\n\tData = "${data}",`:""}${inputTags.length > 0 ? "\n\t" : ""}${inputTags.map(tag => `["${tag.name}"] = "${tag.value}"`).join(",\n\t")}
})`)
    }, [action, data, inputTags, project, globalState.activeProject])

    async function sendMessage() {
        setSendingMessage(true)
        const res = await runLua(eqLua, project.process)
        setSendingMessage(false)
        setOutput(JSON.stringify(res, null, 2))
    }

    return <div className="p-2">
        <h1 className="text-sm mb-2 text-muted-foreground">Interact with your process through messages in a <i>better</i> way</h1>
        <div className="grid grid-cols-2 gap-2">
            <div>
                {/* <div className="flex gap-2 mb-2"> */}
                    <Input placeholder="Action" onChange={(e) => setAction(e.target.value)} className="rounded-none mb-2" />
                    <Input placeholder="Data" onChange={(e) => setData(e.target.value)} className="rounded-none mb-2" />
                {/* </div> */}
                {
                    inputTags.map((tag, i) => <div key={i} className="flex gap-2 mb-2">
                        <Input placeholder="Name" className="rounded-none" value={tag.name} onChange={(e) => {
                            const tags = [...inputTags]
                            tags[i].name = e.target.value
                            setInputTags(tags)
                        }} />
                        <Input placeholder="Value" className="rounded-none" value={tag.value} onChange={(e) => {
                            const tags = [...inputTags]
                            tags[i].value = e.target.value
                            setInputTags(tags)
                        }} />
                        <Button className="rounded-none" variant="destructive"
                            onClick={() => {
                                const tags = [...inputTags]
                                tags.splice(i, 1)
                                setInputTags(tags)
                            }}>- Remove Tag</Button>
                    </div>)
                }
                <div className="flex gap-2 mb-2">
                    <Input id="input-tag-name" placeholder="Name" className="rounded-none" />
                    <Input id="input-tag-value" placeholder="Value" className="rounded-none" />
                    <Button className="rounded-none"
                        onClick={() => {
                            const name = (document.getElementById("input-tag-name") as HTMLInputElement)?.value
                            const value = (document.getElementById("input-tag-value") as HTMLInputElement)?.value
                            if (!name || !value) {
                                toast.error("Name and Value are required")
                                return
                            }
                            (document.getElementById("input-tag-name") as HTMLInputElement).value = "";
                            (document.getElementById("input-tag-value") as HTMLInputElement).value = "";
                            setInputTags([...inputTags, { name, value }])
                        }}>+ Add Tag</Button>
                </div>
                <span className="text-sm text-muted-foreground">Equivalent Lua code:</span>
                <pre className="text-sm font-btr-code border rounded-md p-2 overflow-scroll">
                    {eqLua}
                </pre>
            </div>
            <div>
                <Button className="w-full rounded-none" disabled={sendingMessage}
                    onClick={sendMessage}>Send Message {sendingMessage&&<Loader size={18} className="animate-spin ml-1"/> }</Button>
                <pre className="border my-2 overflow-scroll text-xs rounded-md p-2">
                    {output}
                </pre>
            </div>
        </div>
    </div>
}