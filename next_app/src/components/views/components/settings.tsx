import { Separator } from "@/components/ui/separator";
import { TView } from "."
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes"
import { ArrowLeft, LoaderIcon, MoonIcon, SunIcon } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useGlobalState, useProjectManager } from "@/hooks";
import { Combobox } from "@/components/ui/combo-box";
import { modules as AOModules, AOModule, runLua, spawnProcess } from "@/lib/ao-vars";
import { useState } from "react";
import { GraphQLClient, gql } from "graphql-request";

function Title({ title }: { title: string }) {
    return (
        <div className="flex flex-row gap-6 items-center overflow-hidden mb-8">
            <h3 className="text-lg text-muted text-nowrap">{title}</h3>

            <Separator className="" />
        </div>
    );
}

function Settings() {
    const { theme, setTheme } = useTheme()
    const globalState = useGlobalState()
    const manager = useProjectManager()
    const [processes, setProcesses] = useState([{ label: "+ Create New", value: "NEW_PROCESS" }]);
    const [processUsed, setProcessUsed] = useState("");
    const [newProcessName, setNewProcessName] = useState("");
    const [newProcessModule, setNewProcessModule] = useState("");
    const [spawning, setSpawning] = useState(false);
    const [manualPid, setManualPid] = useState("");

    const project = globalState.activeProject && manager.getProject(globalState.activeProject);

    async function fetchProcesses() {
        if (!window.arweaveWallet) return
        const client = new GraphQLClient("https://arweave.net/graphql");
        const address = await window.arweaveWallet.getActiveAddress();

        const query = gql`
      query {
        transactions(
          owners: "${address}", 
          tags: [{ name: "Data-Protocol", values: ["ao"] }, { name: "Type", values: ["Process"] }],
          first: 999
        ) {
          edges {
            node {
              id
              tags {
                name
                value
              }
            }
          }
        }
      }
    `;

        const res: any = await client.request(query);

        const ids = res.transactions.edges.map((edge: any) => ({
            label: `${edge.node.tags[2].value} (${edge.node.id})`,
            value: edge.node.id,
        }));

        setProcesses([{ label: "+ Create New", value: "NEW_PROCESS" }, ...ids]);
    }

    async function setProcess() {
        const p = manager.getProject(globalState.activeProject);
        const activeWallet = await window.arweaveWallet.getActiveAddress();
        if (processUsed === "NEW_PROCESS") {
            setSpawning(true);
            console.log(newProcessName);
            const np = await spawnProcess(newProcessName || project.name, [], processUsed === "NEW_PROCESS" ? newProcessModule : AOModule);
            manager.setProjectProcess(p, np, activeWallet);
            setSpawning(false);
        } else {
            manager.setProjectProcess(p, processUsed, activeWallet);
        }
        setNewProcessName("");
        setProcessUsed("");
        setManualPid("");
        toast.success("Process Updated");
    }


    function saveGeminiKey() {
        const input = document.getElementById("gem-api-key") as HTMLInputElement
        const key = input?.value || ""
        // if key is a string of ***************** dont save it
        if (key.match(/^\*+$/)) return
        if (key.length < 39) return toast.error("Invalid Gemini API Key")
        localStorage.setItem("geminiApiKey", key)
        toast.success("Gemini API Key saved")
        input.value = "*".repeat(key.length)
    }

    return <div className="p-10 max-w-4xl mx-auto">
        <Button variant="link" className="mb-5 text-sm text-muted p-0" onClick={()=>globalState.setActiveView(null)}>
            <ArrowLeft size={15} className=" inline-block mr-2" /> home
        </Button>
        <Title title="CURRENT PROJECT" />
        {
            project ? <div className="my-8 grid grid-cols-3 items-center">
                <div>Owner Wallet</div>
                <div className="col-span-2">{typeof project.ownerWallet == "string" ? project.ownerWallet : "NA"}</div>
                <div>Current Process</div>
                <div className="col-span-2">{project.process || "NA"}</div>
                <div>Default Filetype</div>
                <div className="col-span-2">{project.defaultFiletype || "NA"}</div>
                <div className="col-span-3 h-5"></div>
                <div>Change Process</div>

                <div className="col-span-2 flex flex-col gap-1 items-center">
                    <Combobox placeholder="Select Process" disabled={spawning} options={manualPid.length == 43 ? [{ label: `Process ID: ${manualPid}`, value: manualPid }] : processes} onChange={(e) => setProcessUsed(e)} onOpen={fetchProcesses} onSearchChange={(e) => setManualPid(e)} />
                    {processUsed == "NEW_PROCESS" && <>
                        <Input disabled={spawning} type="text" placeholder="Enter new process name" className="w-full" onChange={(e) => { setNewProcessName(e.target.value) }} />
                        <Combobox placeholder="Select AO Process Module" disabled={spawning} options={Object.keys(AOModules).map((k) => ({ label: `${k} (${AOModules[k]})`, value: AOModules[k] }))} onChange={(e) => setNewProcessModule(e)} />
                    </>}
                    <Button size="sm"
                        className="text-white"
                        disabled={
                        processUsed === "" || spawning
                    } onClick={setProcess}>
                        {spawning && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm
                    </Button>
                </div>
            </div> : <div className="text-center text-muted mb-10">No active project</div>
        }

        <Title title="GLOBAL SETTINGS" />
        <div className="my-8 grid grid-cols-3 gap-y-5">
            <div>Theme</div>
            <Button variant="outline" size="icon" className="col-span-2" onClick={() => {
                setTheme(theme === "dark" ? "light" : "dark")
            }}>
                <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </Button>
            <details className="col-span-3">
                <summary className="mb-5 cursor-pointer"><span className="pl-5">experimental</span></summary>
                <div className="grid grid-cols-3 gap-y-5">
                    <div>
                        Gemini AI code suggestions (beta)<br />
                        <span className="text-sm text-foreground/50">This is a beta feature and may not work correctly. If you are using this, we would love some feedback on our <Link href="https://discord.gg/nm6VKUQBrA" target="_blank" className="text-primary underline underline-offset-2">discord</Link></span>
                    </div>
                    <div className="flex gap-2 col-span-2 items-center">
                        <Input type="text" className="w-full" id="gem-api-key" placeholder="Paste your gemini api key to use ai completions" defaultValue={"*".repeat(localStorage.getItem('geminiApiKey')?.length || 0) || ""} />
                        <Button size="sm" className="w-fit" onClick={saveGeminiKey}>Save</Button>
                    </div>
                </div>
            </details>
        </div>
    </div>
}

const viewItem: TView = {
    component: Settings,
    label: "Settings",
    value: "SETTINGS"
}

export default viewItem;