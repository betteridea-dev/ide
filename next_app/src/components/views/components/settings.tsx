import { Separator } from "@/components/ui/separator";
import { TView } from "."
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes"
import { ArrowLeft, Edit, File, Loader, LoaderIcon, MoonIcon, Plus, SunIcon, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useGlobalState, useProjectManager } from "@/hooks";
import { Combobox } from "@/components/ui/combo-box";
import { modules as AOModules, AOModule, runLua, spawnProcess, DEFAULT_CU_URL, DEFAULT_MU_URL, DEFAULT_GATEWAY_URL } from "@/lib/ao-vars";
import { useState } from "react";
import { GraphQLClient, gql } from "graphql-request";
import { PFile } from "@/hooks/useProjectManager";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "usehooks-ts";

function Title({ title }: { title: string }) {
    return (
        <div className="flex flex-row gap-6 items-center overflow-hidden mb-8">
            <h3 className="text-lg text-muted text-nowrap">{title}</h3>

            <Separator className="" />
        </div>
    );
}

function EditFileProcess({ fileName, processes, fetchProcessesFunc }: {
    fileName: string,
    processes: { label: string, value: string }[],
    fetchProcessesFunc: () => void
}) {
    const manager = useProjectManager();
    const globalState = useGlobalState();
    const [editing, setEditing] = useState(false);
    const [process, setProcess] = useState("");
    const [spawning, setSpawning] = useState(false);
    const [newProcessName, setNewProcessName] = useState("");
    const [newProcessModule, setNewProcessModule] = useState("");
    const [manualPid, setManualPid] = useState("");
    const [manualModule, setManualModule] = useState("");
    const p = manager.getProject(globalState.activeProject);
    const file = p.getFile(fileName);

    function setDefault() {
        manager.setFileProcess(p, file, "");
        file.process = "";
        p.files[fileName] = file;
        manager.projects[globalState.activeProject] = p;
        manager.saveProjects(manager.projects);
        setEditing(false);
        toast.success("Process Updated");
    }

    return <div className="grid grid-cols-3 border-b last:border-none py-2.5">
        <div className="col-span-1 flex items-center gap-2"><File size={15} className="inline" /> {fileName}</div>
        {editing ? <>
            <div className="col-span-2 flex gap-2 items-center">
                <div className="flex flex-col gap-2 w-full">
                    <Combobox placeholder="Select Process" options={
                        manualPid.length == 43 ? [{ label: `Process ID: ${manualPid}`, value: manualPid }] :
                            processes} onOpen={fetchProcessesFunc} onChange={(e) => setProcess(e)} onSearchChange={(e) => setManualPid(e)} />
                    {
                        process === "NEW_PROCESS" && <>
                            <Input type="text" placeholder="Enter new process name" onChange={(e) => { setNewProcessName(e.target.value) }} />
                            <Combobox placeholder="Select AO Process Module"
                                options={manualModule.length == 43 ? [{ label: `Module ID: ${manualModule}`, value: manualModule }] :
                                    Object.keys(AOModules).map((k) => ({ label: `${k} (${AOModules[k]})`, value: AOModules[k] }))} onChange={(e) => setNewProcessModule(e)} onSearchChange={(e) => setManualModule(e)} />
                        </>
                    }

                    <div className="flex items-center justify-center gap-2">
                        <Button size="sm" disabled={spawning} onClick={async () => {
                            setSpawning(true);
                            if (process === "NEW_PROCESS") {
                                const np = await spawnProcess(newProcessName || p.name + "-" + file.name, [], process === "NEW_PROCESS" ? newProcessModule : AOModule);
                                manager.setFileProcess(p, file, np);
                                file.process = np;
                                p.files[fileName] = file;
                                manager.projects[globalState.activeProject] = p;
                                manager.saveProjects(manager.projects);
                            } else {
                                manager.setFileProcess(p, file, process);
                                file.process = process;
                                p.files[fileName] = file;
                                manager.projects[globalState.activeProject] = p;
                                manager.saveProjects(manager.projects);
                            }
                            toast.success("Process Updated");
                            setEditing(false);
                            setSpawning(false);
                        }}>Confirm {spawning && <Loader size={16} className="animate-spin ml-2" />}</Button>
                        <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                        <Button variant="outline" onClick={setDefault}>Reset default</Button>
                    </div>
                </div>
            </div>
        </> : <div className="col-span-2 flex items-center gap-2">
            <div className="flex-1 text-muted-foreground">{file.process || <>default <span className="text-muted">{p.process}</span></>}</div>
            <Button variant="link" size="sm" className="flex items-center gap-1.5 text-foreground hover:text-primary" onClick={() => {
                setEditing(true)
                setProcess(null)
                setManualModule("")
                setManualPid("")
            }}>
                <Edit size={14} />
                Edit Process
            </Button>
        </div>}
    </div>
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
    const [manualModule, setManualModule] = useState("");
    const [changeDefaultProcessVisible, setChangeDefaultProcessVisible] = useState(false);
    const [vimMode, setVimMode] = useLocalStorage("vimMode", false, { initializeWithValue: true });
    const [customCuUrl, setCustomCuUrl] = useLocalStorage("ao-cu-url", "", { initializeWithValue: true });
    const [customMuUrl, setCustomMuUrl] = useLocalStorage("ao-mu-url", "", { initializeWithValue: true });
    const [customGatewayUrl, setCustomGatewayUrl] = useLocalStorage("gateway-url", "https://arweave.net", { initializeWithValue: true });

    const project = globalState.activeProject && manager.getProject(globalState.activeProject);
    const files: { [name: string]: PFile } = project ? project.files : {};
    const filesWithProcesses = Object.keys(files).filter((f) => files[f].process);
    // console.log(files, filesWithProcesses);

    async function fetchProcesses() {
        if (!window.arweaveWallet) return
        const client = new GraphQLClient("https://arnode.asia/graphql");
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
        setChangeDefaultProcessVisible(false);
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

    return <div className="p-10 max-w-4xl mx-auto max-h-[calc(100vh-55px)] overflow-scroll">
        <Button variant="link" className="mb-5 text-sm text-muted p-0" onClick={() => globalState.setActiveView(null)}>
            <ArrowLeft size={15} className=" inline-block mr-2" /> home
        </Button>
        <Title title="CURRENT PROJECT" />
        {
            project ? <div className="my-8 grid grid-cols-3 gap-1 items-center">
                <div>Owner Wallet</div>
                <div className="col-span-2">{typeof project.ownerWallet == "string" ? project.ownerWallet : "NA"}</div>
                <div>Default Process</div>
                <div className="col-span-2 flex items-center justify-start gap-2">
                    {changeDefaultProcessVisible ? <>
                        <div className="w-full flex flex-col gap-2 my-4 items-center">
                            <Combobox placeholder="Select Process" disabled={spawning} options={manualPid.length == 43 ? [{ label: `Process ID: ${manualPid}`, value: manualPid }] : processes} onChange={(e) => setProcessUsed(e)} onOpen={fetchProcesses} onSearchChange={(e) => setManualPid(e)} />
                            {processUsed == "NEW_PROCESS" && <>
                                <Input disabled={spawning} type="text" placeholder="Enter new process name" className="w-full" onChange={(e) => { setNewProcessName(e.target.value) }} />
                                <Combobox placeholder="Select AO Process Module" disabled={spawning} options={manualModule.length == 43 ? [{ label: `Module ID: ${manualModule}`, value: manualModule }] : Object.keys(AOModules).map((k) => ({ label: `${k} (${AOModules[k]})`, value: AOModules[k] }))} onChange={(e) => setNewProcessModule(e)} onSearchChange={(e) => setManualModule(e)} />
                            </>}
                            <div className="flex gap-2 items-center justify-center">
                                <Button size="sm"
                                    className="text-white"
                                    disabled={processUsed === "" || spawning}
                                    onClick={setProcess}>
                                    {spawning && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                                    Confirm
                                </Button>
                                <Button variant="outline" onClick={() => {
                                    setChangeDefaultProcessVisible(false);
                                    setProcessUsed("");
                                    setManualPid("");
                                    setManualModule("");
                                }}>Cancel</Button>
                            </div>
                        </div>
                    </> :
                        <div className="flex items-center gap-2 w-full">
                            <div className="flex-1 text-muted-foreground">{project.process || "NA"}</div>
                            <Button variant="link" size="sm" className="flex items-center gap-1.5 text-foreground hover:text-primary" onClick={(e) => setChangeDefaultProcessVisible(!changeDefaultProcessVisible)}>
                                <Edit size={14} />
                                Edit Process
                            </Button>
                        </div>}
                </div>
                <div>Default Filetype</div>
                <div className="col-span-2">{project.defaultFiletype || "NA"}</div>

                <details className="col-span-3 mt-6" open>
                    {/* <summary className="cursor-pointer flex items-center gap-2 font-medium">
                        File Processes
                        <span className="text-xs text-muted-foreground">(Configure process for individual files)</span>
                    </summary> */}
                    <summary className="-ml-6"><span className="pl-2 cursor-pointer">File Processes <span className="text-muted text-sm pl-1">(Configure process for individual files)</span></span></summary>
                    <div className="mt-4">
                        {/* <p className="text-sm text-muted-foreground text-center mb-4">Configure different processes for each file in your project</p> */}
                        <div className="flex flex-col rounded-md">
                            {Object.keys(files).map((f) => <EditFileProcess key={f} fileName={f} processes={processes} fetchProcessesFunc={fetchProcesses} />)}
                        </div>
                    </div>
                </details>
            </div> : <div className="text-center text-muted mb-10">No active project</div>
        }

        <Title title="GLOBAL SETTINGS" />
        <div className="my-8 grid grid-cols-3 gap-y-5 items-center justify-center">
            <div>Theme</div>
            <Button variant="outline" size="icon" className="col-span-2 relative" onClick={() => {
                setTheme(theme === "dark" ? "light" : "dark")
            }}>
                <SunIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </Button>
            <Label htmlFor="vim-mode">Enable VIM mode</Label>
            <Switch id="vim-mode" checked={vimMode} onCheckedChange={setVimMode} />
            <div className=""></div> {/*spacer*/}

            <details className="col-span-3 mt-4" open>
                <summary className="-ml-6"><span className="pl-2 cursor-pointer">URL Configuration <span className="text-muted text-sm pl-1">Custom URLs for aoconnect</span></span></summary>
                <div className="mt-4 grid grid-cols-3 gap-y-4 items-center justify-center">
                    <Label htmlFor="custom-cu-url">CU URL</Label>
                    <div className="col-span-2 flex gap-2 items-center">
                        <Input
                            id="custom-cu-url"
                            type="text"
                            placeholder={DEFAULT_CU_URL}
                            value={customCuUrl}
                            onChange={(e) => setCustomCuUrl(e.target.value)}
                            className="w-full"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setCustomCuUrl("");
                                toast.success("CU URL reset to default");
                            }}
                        >
                            Reset
                        </Button>
                    </div>

                    <Label htmlFor="custom-mu-url">MU URL</Label>
                    <div className="col-span-2 flex gap-2 items-center">
                        <Input
                            id="custom-mu-url"
                            type="text"
                            placeholder={DEFAULT_MU_URL}
                            value={customMuUrl}
                            onChange={(e) => setCustomMuUrl(e.target.value)}
                            className="w-full"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setCustomMuUrl("");
                                toast.success("MU URL reset to default");
                            }}
                        >
                            Reset
                        </Button>
                    </div>

                    <Label htmlFor="custom-gateway-url">Gateway URL</Label>
                    <div className="col-span-2 flex gap-2 items-center justify-center">
                        <Input
                            id="custom-gateway-url"
                            type="text"
                            placeholder={DEFAULT_GATEWAY_URL}
                            value={customGatewayUrl}
                            onChange={(e) => setCustomGatewayUrl(e.target.value)}
                            className="w-full"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setCustomGatewayUrl("");
                                toast.success("Gateway URL reset to default");
                            }}
                        >
                            Reset
                        </Button>
                    </div>
                </div>
                <div className="text-muted text-center text-sm p-2">
                    When using custom URLs, it is recommended to use the same providers for CU, MU & Gateway
                </div>
            </details>

            {/* <details className="col-span-3" open>
                <summary className="-ml-6"><span className="pl-2 cursor-pointer">Experimental</span></summary>
                <div className="grid grid-cols-3 gap-y-5 mt-5">
                    <div>
                        Gemini AI code suggestions (deprecated for <Button variant="link" className="text-primary p-0" onClick={() => { document.getElementById("AI_CHAT").click() }}>AI Chat</Button>)<br />
                        <span className="text-sm text-foreground/50">This is a beta feature and may not work correctly. If you are using this, we would love some feedback on our <Link href="https://discord.gg/nm6VKUQBrA" target="_blank" className="text-primary underline underline-offset-2">discord</Link></span>
                    </div>
                    <div className="flex gap-2 col-span-2 items-center">
                        <Input disabled type="text" className="w-full" id="gem-api-key" placeholder="Paste your gemini api key to use ai completions" defaultValue={"*".repeat(localStorage.getItem('geminiApiKey')?.length || 0) || ""} />
                        <Button disabled size="sm" className="w-fit" onClick={saveGeminiKey}>Save</Button>
                    </div>
                </div>
            </details> */}
        </div>
    </div>
}

const viewItem: TView = {
    component: Settings,
    label: "Settings",
    value: "SETTINGS"
}

export default viewItem;