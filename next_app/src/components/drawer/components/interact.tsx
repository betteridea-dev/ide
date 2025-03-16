import { useGlobalState, useProjectManager } from "@/hooks";
import { TDrawerItem } from "."
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { runLua, Tag } from "@/lib/ao-vars";
import { ChevronsLeftRight, Copy, Delete, Loader, Minus, MinusCircle, Tag as TagIcon } from "lucide-react";
import { Combobox } from "@/components/ui/combo-box";
import { toast } from "sonner";
import Link from "next/link";
import { useLocalStorage } from "usehooks-ts";
import { useConnection, useActiveAddress } from "arweave-wallet-kit";
function Interact() {
    const manager = useProjectManager();
    const globalState = useGlobalState();
    const { connected, connect, disconnect } = useConnection()
    const address = useActiveAddress()
    const project = globalState.activeProject ? manager.projects[globalState.activeProject] : null;
    const [options, setOptions] = useState<{ label: string, value: string }[]>(Object.keys(manager.projects).filter(pid => { return manager.projects[pid].process }).map(pid => ({ label: `${pid}: ${manager.projects[pid].process}`, value: manager.projects[pid].process })));
    const [target, setTarget] = useState<string>(project?.process || "");
    const [inputTags, setInputTags] = useState<Tag[]>([]);
    const [output, setOutput] = useState<string>("");
    const [eqLua, setEqLua] = useState<string>("");
    const [sendingMessage, setSendingMessage] = useState<boolean>(false);
    const [id, setId] = useState<string>();
    const [action, setAction] = useState<string>("");
    const [data, setData] = useState<string>("");
    const [interactions, setInteractions] = useLocalStorage("interactions", {}, { initializeWithValue: true })

    function saveInteraction() {
        const confirm = window.confirm("Are you sure you want to save this interaction?");
        if (!confirm) return;
        const name = prompt("Enter a name for this interaction");
        if (!name) return;
        if (interactions[name]) {
            const overwrite = window.confirm("An interaction with this name already exists. Do you want to overwrite it?");
            if (!overwrite) return;
        }
        const interaction = {
            target,
            action,
            data,
            tags: inputTags
        }
        setInteractions({ ...interactions, [name]: interaction });
        toast.success("Interaction saved")
    }

    useEffect(() => {
        setEqLua(`Send({
    Target = [[${target || project?.process}]],${action ? `\n\tAction = [[${action}]],` : ""}${data ? `\n\tData = [[${data}]],` : ""}${inputTags.length > 0 ? "\n\t" : ""}${inputTags.map(tag => `["${tag.name}"] = [[${tag.value}]]`).join(",\n\t")}
})`);
    }, [target, action, data, inputTags, project, globalState.activeProject]);

    async function sendMessage() {
        setSendingMessage(true);
        setOutput("...")
        setId("...")
        try {
            const res = await runLua(eqLua, project?.process || address);
            console.log(res);
            if (res.Error) return toast.error(res.Error);
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
        <div className="px-2 flex items-center justify-between gap-1">
            <Combobox triggerClassName="bg-foreground/5 p-1.5 h-6" className="bg-background" placeholder="Load saved interactions"
                onChange={(e) => {
                    if (e) {
                        const interaction = interactions[e];
                        setTarget(interaction.target);
                        setAction(interaction.action);
                        setData(interaction.data);
                        setInputTags(interaction.tags);
                    }
                    else {
                        setTarget(project?.process || "");
                        setAction("");
                        setData("");
                        setInputTags([]);
                    }
                }}
                options={Object.keys(interactions).map(name => ({ label: name, value: name }))}
            />
            <Button className="p-0 h-6 px-3" onClick={saveInteraction}>+</Button>
        </div>
        <hr className="my-4" />
        {globalState.activeProject ? <div className="overflow-scroll p-2 pt-0 flex flex-col gap-2">
            {/* <Input placeholder={`Target (${project?.process})`} onChange={(e) => setTarget(e.target.value)} className="bg-foreground/5 rounded" /> */}
            <Combobox
                triggerClassName="bg-foreground/5 p-1.5" className="bg-background" placeholder={`Target: ${target} or paste id`}
                onChange={(e) => { if (e) { setTarget(e) } else { setTarget(project.process) } }}
                options={options}
                onSearchChange={(e) => {
                    if (e.length == 43) {
                        setOptions(p => {
                            const newOptions = (p.find(o => o.value == e)) ? p : [{ label: e, value: e }, ...p];
                            return newOptions;
                        })
                    }
                }}
            />
            <Input placeholder="Action" value={action} onChange={(e) => setAction(e.target.value)} className="bg-foreground/5 rounded" />
            <Input placeholder="Data" value={data} onChange={(e) => setData(e.target.value)} className="bg-foreground/5 rounded" />
            <hr className="my-3" />
            <span className="text-sm text-muted-foreground flex gap-1 items-center"><TagIcon size={16} />Tags</span>
            <div className="flex gap-2.5 my-4">
                <Input placeholder="Name" id="input-tag-name-1" className="bg-foreground/5 rounded h-8" />
                <Input placeholder="Value" id="input-tag-value-1" className="bg-foreground/5 rounded h-8" />
                <Button className="bg-foreground/5 text-foreground hover:text-background rounded border border-border/50 h-8"
                    onClick={() => {
                        const name = (document.getElementById("input-tag-name-1") as HTMLInputElement)?.value;
                        const value = (document.getElementById("input-tag-value-1") as HTMLInputElement)?.value;
                        if (!name || !value) return toast.error("Name and Value are required");
                        setInputTags([...inputTags, { name, value }]);
                        (document.getElementById("input-tag-name-1") as HTMLInputElement).value = "";
                        (document.getElementById("input-tag-value-1") as HTMLInputElement).value = "";
                    }}>+ Add</Button>
            </div>
            {
                inputTags.map((tag, i) => <div key={i} className="flex gap-1.5 my-1 items-center">
                    <Button variant="destructive" className="w-5 h-5 p-1 !aspect-square rounded-full border border-destructive-foreground" onClick={() => {
                        const tags = [...inputTags];
                        tags.splice(i, 1);
                        setInputTags(tags);
                    }}><Minus size={18} /></Button>
                    <span className="text-muted-foreground text-sm mx-2">TAG {i + 1}</span>
                    <Input placeholder="Name" value={tag.name} className="bg-primary/20 text-center text-primary border border-primary rounded-full h-6 p-0 px-1"
                        onChange={e => {
                            const tags = [...inputTags];
                            tags[i].name = e.target.value;
                            setInputTags(tags);
                        }} />
                    <Input placeholder="Value" value={tag.value} className="bg-primary/20 text-center text-primary border border-primary rounded-full h-6 p-0 px-1"
                        onChange={e => {
                            const tags = [...inputTags];
                            tags[i].value = e.target.value;
                            setInputTags(tags);
                        }} />
                </div>)
            }
            <hr className="my-3" />
            <details className="text-sm text-muted-foreground" open={true}>
                <summary><span className="inline-flex items-center gap-1.5 cursor-pointer mb-1.5">Lua Code <button><Copy size={15} className="cursor-pointer" onClick={() => { navigator.clipboard.writeText(eqLua); toast.info("Copied to clipboard") }} /></button></span></summary>
                <pre className="text-xs bg-foreground/10 text-foreground font-btr-code overflow-scroll border border-border/40 p-2 rounded-md">{eqLua}</pre>
            </details>
            <Button onClick={sendMessage} disabled={sendingMessage}>Send Message {sendingMessage && <Loader size={18} className="animate-spin ml-1.5" />}</Button>

            <span className="mt-4 items-center text-muted-foreground flex gap-1"><ChevronsLeftRight size={24} /> Results  <Link className="ml-auto" href={id ? `https://www.ao.link/#/message/${id}` : "#"} target={id ? "_blank" : "_self"}>view on <span className="text-primary">ao.link</span></Link></span>
            <pre className="text-xs overflow-scroll border border-border/40 p-2 rounded-md bg-foreground/10 font-btr-code">{output || "..."}</pre>
        </div> : <div className="p-2 text-muted text-center">No active project</div>}
    </div>
}

const drawerItem: TDrawerItem = {
    component: Interact,
    label: "Interact",
    value: "INTERACT"
}

export default drawerItem;