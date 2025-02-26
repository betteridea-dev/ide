import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combo-box"
import { useGlobalState, useProjectManager } from "@/hooks"
import { runLua } from "@/lib/ao-vars"
import { stripAnsiCodes } from "@/lib/utils"
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog"
import Ansi from "ansi-to-react"
import { LoaderIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { useSessionStorage } from "usehooks-ts"

interface TInboxMessage {
    Data: string,
    From: string,
    Action: string,
    Timestamp: number
}

export default function Inbox() {
    const globalState = useGlobalState()
    const manager = useProjectManager()
    const [inbox, setInbox] = useSessionStorage<TInboxMessage[]>("inbox-" + globalState.activeProject || "null", [], { initializeWithValue: true })
    const [fetchingInbox, setFetchingInbox] = useState(false)
    const [selectedInboxProcess, setSelectedInboxProcess] = useState("")

    const project = globalState.activeProject && manager.projects[globalState.activeProject]
    const processes = project ? Object.values(project.files)
        .filter(f => f && f.name)
        .map(f => ({ name: f.name, process: f.process }))
        : []

    async function fetchInbox(): Promise<TInboxMessage[] | undefined> {
        if (!project) return
        if (!project.process) {
            toast.error("No process found. Please assign one from settings")
            return
        }

        try {
            setFetchingInbox(true)
            const res = await runLua(`return require("json").encode(Inbox)`, selectedInboxProcess || project.process, [
                { name: "BetterIDEa-Function", value: "Inbox" }
            ])

            if (res.Error) {
                toast.error(res.Error)
                return
            }

            let output
            try {
                const { Output } = res
                output = Output.data.output || Output.data
                globalState.setPrompt(Output.prompt || Output.data.prompt)

                const parsedOutput = JSON.parse(output)
                setInbox(Array.isArray(parsedOutput) ? parsedOutput : [])
                return parsedOutput
            } catch (e) {
                toast.error("Failed to parse inbox data")
                return []
            }
        } catch (e) {
            toast.error("Failed to fetch inbox")
            return []
        } finally {
            setFetchingInbox(false)
        }
    }

    useEffect(() => {
        if (project?.process || selectedInboxProcess) {
            fetchInbox()
        }
    }, [project?.process, selectedInboxProcess])

    function InboxItem({ item }: { item: TInboxMessage }) {
        const hasData = item.Data
        const hasAction = item.Action
        const hasSender = item.From

        return <AlertDialog>
            <AlertDialogTrigger className="w-full">
                <div className="flex flex-col p-2 border-b border-border/60 w-full items-start justify-start">
                    <div className="text-sm text-muted">{new Date(item.Timestamp).toString()} {hasAction && <span className="text-md text-foreground">[{item.Action}]</span>}</div>
                    {hasSender ? <div className="text-xs text-muted">from: {item.From}</div> : <div className="text-xs text-muted">unknown sender</div>}
                    {hasData ? <div className="text-md text-left truncate w-full"><Ansi>{item.Data}</Ansi></div> : <div className="text-sm text-muted">no data</div>}
                </div>
            </AlertDialogTrigger>
            <AlertDialogContent className="md:min-w-[50vw]">
                <AlertDialogHeader>
                    Viewing Inbox Message
                </AlertDialogHeader>
                <pre className="font-btr-code max-h-[50vh] overflow-scroll text-xs ring-1 ring-border rounded-md p-1">
                    {item && <Ansi>{JSON.stringify(item, null, 2)}</Ansi>}
                </pre>
                <AlertDialogCancel>close</AlertDialogCancel>
            </AlertDialogContent>
        </AlertDialog>
    }

    return <>
        <div className="flex p-1">
            <Combobox
                triggerClassName=""
                defaultValue={processes.length > 0 ? `${processes[0].name} - ${processes[0].process || "Default"}` : undefined}
                options={processes.map(p => ({
                    label: `${p.name} - ${p.process || "Default"}`,
                    value: p.process
                }))}
                onChange={e => setSelectedInboxProcess(e)}
                className="w-full"
                placeholder="Showing Inbox for default process"
            />
            <Button
                variant="link"
                onClick={() => fetchInbox()}
                className=" !z-20 rounded-none bg-background text-foreground"
                disabled={fetchingInbox}
            >
                {fetchingInbox ? <><LoaderIcon className="w-5 h-5 mr-1 animate-spin" /> Fetching...</> : "refresh"}
            </Button>
        </div>
        {Array.isArray(inbox) && (
            inbox.length > 0
                ? inbox.toReversed().map((item, i) => item && <InboxItem key={i} item={item} />)
                : <>{!fetchingInbox && <div>No messages in inbox</div>}</>
        )}
    </>
}