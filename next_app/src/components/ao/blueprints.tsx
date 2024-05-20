import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Icons from "@/assets/icons";
import { useGlobalState } from "@/states";
import { toast } from "../ui/use-toast";
import { useState } from "react";
import { Combobox } from "../ui/combo-box";
import { useProjectManager } from "@/hooks";
import { runLua, parseOutupt } from "@/lib/ao-vars";
import { ReloadIcon } from "@radix-ui/react-icons"

const rawBlueprintBase = "https://raw.githubusercontent.com/permaweb/aos/main/blueprints/"
const blueprints = [
    "arena.lua",
    "arns.lua",
    "chat.lua",
    "chatroom.lua",
    "credUtils.lua",
    "staking.lua",
    "token.lua",
    "voting.lua"
]

export default function Blueprints() {
    const globalState = useGlobalState();
    const projectManager = useProjectManager();
    const [open, setOpen] = useState(false);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger onClick={(e) => {
            e.preventDefault();
            setCode("");
            if (!globalState.activeProject) return toast({ title: "No active project", description: "You need to have an active project to use blueprints" });
            if (globalState.activeMode != "AO") return toast({ title: "Not in AO mode", description: "Blueprints only work in AO" });
            const project = projectManager.getProject(globalState.activeProject);
            if (!project) return toast({ title: "Project not found", description: "The active project was not found" });
            if (!project.process) return toast({ title: "Process id missing", description: "The active project doesnot seem to have a process id" });
            setOpen(true);
        }}>
            <Button variant="link" className="p-2 h-10">
                <Image src={Icons.blueprintSVG} alt="Blueprints" width={25} height={25} />
            </Button>
        </DialogTrigger>
        <DialogContent className="">
            <DialogHeader>
                <DialogTitle>Load a Blueprint</DialogTitle>
                <DialogDescription>
                    Blueprints are pre-written code that you can use to get started quickly.
                </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 items-center justify-center">
                <Combobox
                    placeholder="Select a blueprint"
                    options={blueprints.map((bp) => ({ label: bp, value: bp }))}
                    onChange={async (val) => {
                        console.log(val);
                        const resp = await fetch(rawBlueprintBase + val);
                        const code = await resp.text();
                        setCode(code);
                    }}
                    onOpen={() => { }}
                />
                <pre className="w-full max-w-[450px] text-xs h-[300px] overflow-scroll ring-1 ring-btr-grey-2 rounded-md p-1">
                    {code}
                </pre>
                <Button disabled={loading} onClick={async () => {
                    setLoading(true);
                    const project = projectManager.getProject(globalState.activeProject);
                    const res = await runLua(code, project.process, [
                        { name: "BetterIDEa-Function", value: "load-Blueprint" }
                    ]);
                    console.log(res);
                    const output = parseOutupt(res);
                    console.log(output);
                    setLoading(false);
                    setOpen(false);
                }}>
                    {loading && <ReloadIcon className="animate-spin mr-2" />}
                    Load
                </Button>
            </div>
        </DialogContent>
    </Dialog>
}