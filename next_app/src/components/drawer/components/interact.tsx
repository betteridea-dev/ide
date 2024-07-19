import { useGlobalState, useProjectManager, useWallet } from "@/hooks";
import { TDrawerItem } from "."
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { runLua, Tag } from "@/lib/ao-vars";
import { Delete, Loader, MinusCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function Interact() {
    const manager = useProjectManager();
    const globalState = useGlobalState();
    const wallet = useWallet()
    const project = globalState.activeProject ? manager.projects[globalState.activeProject] : null;
    const [target, setTarget] = useState<string>(project?.process || "");
    const [inputTags, setInputTags] = useState<Tag[]>([]);
    const [output, setOutput] = useState<string>("");
    const [eqLua, setEqLua] = useState<string>("");
    const [sendingMessage, setSendingMessage] = useState<boolean>(false);
    const [id, setId] = useState<string>();
    const [action, setAction] = useState<string>("");
    const [data, setData] = useState<string>("");

    useEffect(() => {
        setEqLua(`Send({
    Target = "${target || project?.process}",${action ? `\n\tAction = "${action}",` : ""}${data ? `\n\tData = "${data}",` : ""}${inputTags.length > 0 ? "\n\t" : ""}${inputTags.map(tag => `["${tag.name}"] = "${tag.value}"`).join(",\n\t")}
})`);
    }, [target, action, data, inputTags, project, globalState.activeProject]);

    async function sendMessage() {
        setSendingMessage(true);
        setOutput("...")
        setId("...")
        try {
            const res = await runLua(eqLua, project?.process || wallet.address);
            console.log(res);
            setId((res as any).id);
            setSendingMessage(false);
            setOutput(JSON.stringify(res, null, 2));
        } catch (e) {
            setSendingMessage(false);
            return toast.error(e);
        }
    }

    return <div className="max-h-[calc(100vh-50px)]">
        <h1 className="text-left p-3 text-muted-foreground">INTERACT</h1>
        {globalState.activeProject ? <div className="overflow-scroll p-2 pt-0 flex flex-col gap-2">
            <Input placeholder={`Target (${project?.process})`} onChange={(e) => setTarget(e.target.value)} />
            <Input placeholder="Action" onChange={(e) => setAction(e.target.value)} />
            <Input placeholder="Data" onChange={(e) => setData(e.target.value)} />
            <span className="text-sm text-muted-foreground">Tags:</span>
            {
                inputTags.map((tag, i) => <div key={i} className="flex gap-2">
                    <Input placeholder="Name" value={tag.name} onChange={e => {
                        const tags = [...inputTags];
                        tags[i].name = e.target.value;
                        setInputTags(tags);
                    }} />
                    <Input placeholder="Value" value={tag.value} onChange={e => {
                        const tags = [...inputTags];
                        tags[i].value = e.target.value;
                        setInputTags(tags);
                    }} />
                    <Button variant="destructive" className="p-3" onClick={() => {
                        const tags = [...inputTags];
                        tags.splice(i, 1);
                        setInputTags(tags);
                    }}><MinusCircle size={18} /></Button>
                </div>)
            }
            <div className="flex gap-1">
                <Input placeholder="Name" id="input-tag-name-1" />
                <Input placeholder="Value" id="input-tag-value-1" />
                <Button onClick={() => {
                    const name = (document.getElementById("input-tag-name-1") as HTMLInputElement)?.value;
                    const value = (document.getElementById("input-tag-value-1") as HTMLInputElement)?.value;
                    if (!name || !value) return toast.error("Name and Value are required");
                    setInputTags([...inputTags, { name, value }]);
                    (document.getElementById("input-tag-name-1") as HTMLInputElement).value = "";
                    (document.getElementById("input-tag-value-1") as HTMLInputElement).value = "";
                }}>+ Add Tag</Button>
            </div>
            <span className="text-sm text-muted-foreground">Eequivalent Lua code:</span>
            <pre className="text-xs overflow-scroll border border-border/40 p-2 rounded-md">{eqLua}</pre>
            <Button onClick={sendMessage} disabled={sendingMessage}>Send Message {sendingMessage && <Loader size={18} className="animate-spin ml-1.5" />}</Button>
            <span className="text-sm text-muted-foreground">Result: {id && id != "..." && <Link className="text-primary" href={`https://www.ao.link/#/message/${id}`} target="_blank">View on ao.link</Link>} <pre className="overflow-scroll">{id || "..."}</pre></span>
            <pre className="text-xs overflow-scroll border border-border/40 p-2 rounded-md">{output || "..."}</pre>
        </div> : <div className="p-2 text-muted text-center">No active project</div>}
    </div>
}

const drawerItem: TDrawerItem = {
    component: Interact,
    label: "Interact",
    value: "INTERACT"
}

export default drawerItem;