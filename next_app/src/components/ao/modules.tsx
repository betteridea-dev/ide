import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Icons from "@/assets/icons";
import { Icons as LucidIcons } from "@/components/icons"
import { useGlobalState } from "@/states";
import { toast } from "../ui/use-toast";
import { useState } from "react";
import { Combobox } from "../ui/combo-box";
import { useProjectManager } from "@/hooks";
import { runLua, parseOutupt } from "@/lib/ao-vars";
import { ReloadIcon } from "@radix-ui/react-icons"

import { source as graphSource } from "@/modules/ao/graph";

const modules = [
    "graph.lua"
]

export default function Modules() {
    const globalState = useGlobalState();
    const projectManager = useProjectManager();
    const [open, setOpen] = useState(false);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger onClick={(e) => {
            e.preventDefault();
            setCode("");
            if (!globalState.activeProject) return toast({ title: "No active project", description: "You need to have an active project to use Modules" });
            if (globalState.activeMode != "AO") return toast({ title: "Not in AO mode", description: "Modules only work in AO" });
            const project = projectManager.getProject(globalState.activeProject);
            if (!project) return toast({ title: "Project not found", description: "The active project was not found" });
            if (!project.process) return toast({ title: "Process id missing", description: "The active project doesnot seem to have a process id" });
            setOpen(true);
        }}>
            <div className="flex flex-col items-center justify-center opacity-50 hover:opacity-80 active:opacity-100">
                {/* <Image src={Icons.modulesSVG} alt="Modules" width={20} height={20} className="my-1 hover:invert" /> */}
                <LucidIcons.modules className="my-1 fill-foreground" />
                <div className="text-xs">MODULES</div>
            </div>
        </DialogTrigger>
        <DialogContent className="max-w-[50vw]">
            <DialogHeader>
                <DialogTitle>Load a Module</DialogTitle>
                <DialogDescription>
                    Modules are tools that allow you to add extra functionality to AO through this IDE.
                </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 items-center justify-center">
                <Combobox
                    placeholder="Select a module"
                    options={modules.map((m) => ({ label: m, value: m }))}
                    onChange={async (val) => {
                        console.log(val);
                        switch (val) {
                            case "graph.lua":
                                setCode(graphSource);
                                break;
                            default:
                                setCode("");
                        }
                    }}
                    onOpen={() => { }}
                />
                <pre className="w-full max-w-[46vw] text-xs h-[300px] overflow-scroll ring-1 ring-btr-grey-2 rounded-md p-1">
                    {code}
                </pre>
                <Button disabled={loading} onClick={async () => {
                    if (!code) return toast({ title: "No module selected", description: "You need to select a module to load" });
                    setLoading(true);
                    const project = projectManager.getProject(globalState.activeProject);
                    const res = await runLua(code, project.process, [
                        { name: "BetterIDEa-Function", value: "load-module" }
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