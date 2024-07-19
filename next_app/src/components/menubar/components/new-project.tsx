import { Combobox } from "@/components/ui/combo-box";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGlobalState, useProjectManager, useWallet } from "@/hooks";
import { PFile } from "@/hooks/useProjectManager";
import { AOTemplates } from "@/templates";
import JSZip from "jszip";
import { useState } from "react";
import { toast } from "sonner";
import { modules as AOModules, spawnProcess } from "@/lib/ao-vars"
import { GraphQLClient, gql } from "graphql-request";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoaderIcon } from "lucide-react";
import { pushToRecents } from "@/lib/utils";

export default function NewProject() {
    const globalState = useGlobalState()
    const manager = useProjectManager()
    const wallet = useWallet()
    const [popupOpen, setPopupOpen] = useState(false);
    const [newProjName, setNewProjName] = useState("");
    const [processUsed, setProcessUsed] = useState("");
    const [newProcessName, setNewProcessName] = useState("");
    const [defaultFiletype, setDefaultFiletype] = useState<"NORMAL" | "NOTEBOOK">("NOTEBOOK");
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [loadingProcess, setLoadingProcess] = useState(false);
    const [searchName, setSearchName] = useState("");
    const [searchNameProxy, setSearchNameProxy] = useState("");
    const [searchTimeout, setSearchTimeout] = useState<any>(0)
    const [newProcessModule, setNewProcessModule] = useState("");
    const [usingManualProcessId, setUsingManualProcessId] = useState("");
    const [usingManualModuleId, setUsingManualModuleId] = useState("");
    const [fileDragOver, setFileDragOver] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<{ [foo: string]: PFile | string }>({});
    const [processes, setProcesses] = useState([{ label: "+ Create New Process", value: "NEW_PROCESS" }]);

    async function fetchProcesses() {
        if (!window.arweaveWallet) return;
        const client = new GraphQLClient("https://arweave.net/graphql");
        const address = wallet.address;

        const query = gql`
      query {
        transactions(owners: "${address}",
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

        const ids = res.transactions.edges.map((edge: any) => {
            const name = edge.node.tags.find((tag: any) => tag.name == "Name")?.value || "";
            // console.log(name)
            return {
                label: `${name} (${edge.node.id})`,
                value: edge.node.id,
            }
        });

        setProcesses([{ label: "+ Create New Process", value: "NEW_PROCESS" }, ...ids]);
    }

    async function createProject() {
        if (!newProjName)
            // return toast({
            //   title: "Need a project name 😑",
            //   description: "A new project always needs a name",
            // });
            return toast.error("Need a project name 😑", {
                description: "A new project always needs a name", id: "error"
            })
        if (!processUsed)
            // return toast({
            //   title: "Process options not set",
            //   description: "You must choose wether to create a new process or use an existing one",
            // });
            return toast.error("Process options not set", {
                description: "You must choose wether to create a new process or use an existing one", id: "error"
            })

        const ownerWallet = await window.arweaveWallet.getActiveAddress();
        setLoadingProcess(true);
        const p = manager.newProject({
            name: newProjName,
            defaultFiletype,
            ownerWallet
        });
        console.log(processUsed);
        if (processUsed == "NEW_PROCESS") {
            const newProcessId = await spawnProcess(newProcessName || newProjName, [
                { name: "File-Type", value: defaultFiletype == "NOTEBOOK" ? "Notebook" : "Normal" }
            ], processUsed == "NEW_PROCESS" ? newProcessModule : null);
            manager.setProjectProcess(p, newProcessId);
        } else {
            manager.setProjectProcess(p, processUsed);
        }
        var initialContent = "print('Hello AO!')";
        initialContent = AOTemplates[selectedTemplate];
        // switch (selectedTemplate) {
        //   case "THE_GRID_BOT":
        //     initialContent = aoBot
        //     break;
        //   case "ARIN_DEATH_ARENA":
        //     initialContent = arInGrid
        //     break;
        //   default:
        //     initialContent = "print('Hello AO!')"
        // }
        if (Object.keys(uploadedFiles).length > 0) {
            for (const file in uploadedFiles) {
                // manager.newFile(p, {
                //     name: file,
                //     type: uploadedFiles[file].type,
                // });
                if (file.endsWith(".luanb")) {
                    p.files[file] = uploadedFiles[file] as PFile;
                    console.log(p.files[file])
                    manager.projects[p.name] = p;
                    manager.saveProjects(manager.projects);
                } else {
                    manager.newFile(p, {
                        name: file,
                        type: defaultFiletype,
                        initialContent: uploadedFiles[file] as string,
                    });
                }
            }
        } else {
            manager.newFile(p, {
                name: defaultFiletype == "NOTEBOOK" ? "main.luanb" : "main.lua",
                type: defaultFiletype,
                initialContent,
            });
        }
        setLoadingProcess(false);
        setPopupOpen(false);
        globalState.setActiveProject(newProjName);
        globalState.setActiveFile(Object.keys(manager.projects[newProjName].files)[0]);
        globalState.setActiveView("EDITOR");

        pushToRecents(newProjName);
    }

    function handleFileDrop(e: any) {
        e.preventDefault();
        setFileDragOver(false)
        const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
        if (files == 0) return toast.error("No files dropped", { id: "error" })
        const file = files[0];
        if (file.type != "application/zip") return toast.error("Invalid file type. Need a project zip file", { id: "error" })
        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target.result;
            console.log(content)
            const zip = new JSZip();
            const zipFile = await zip.loadAsync(content);
            const files = Object.keys(zipFile.files);
            // console.log(files)
            if (files.length == 0) return toast.error("No files found in zip", { id: "error" })
            const localFiles: { [foo: string]: PFile | string } = {}
            // add all files to the project
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const allowedFileExtensions = ["lua", "luanb", "md"]
                const fileExtension = file.split(".").pop();
                if (!allowedFileExtensions.includes(fileExtension)) {
                    toast.info("Skipping file as the extension is not allowed", { description: file })
                    console.log("skipping", file)
                    continue;
                };
                const content = await zipFile.file(file).async("string");
                // console.log(file, content)
                if (file.endsWith(".luanb")) {
                    localFiles[file] = JSON.parse(content);
                } else {
                    localFiles[file] = content as string;
                }
            }
            setUploadedFiles(localFiles);
            setSelectedTemplate("");
            console.log(localFiles)
        }
        reader.readAsArrayBuffer(file);

    }

    function handleFileDragOver(e: any) {
        e.preventDefault();
        setFileDragOver(true);
        // console.log(e)
    }

    return <Dialog open={popupOpen} onOpenChange={(e) => {
        setSelectedTemplate("");
        setProcessUsed("");
        setUploadedFiles({});
        setNewProjName("");
        setNewProcessName("");
        setNewProcessModule("");
        setUsingManualProcessId("");
        setFileDragOver(false);

        setPopupOpen(e)
    }
    }>
        <DialogTrigger id="new-project" className="flex mx-auto w-fit invisible hover:bg-accent gap-2 items-center p-2"
        // onClick={async (e) => {
        //     e.preventDefault()
        //     if (!wallet.isConnected)
        //         toast.error("Connect Wallet", { description: "Please connect your wallet (bottom left corner) before creating a project", id: "error" })

        // }}
        >
            new project
        </DialogTrigger>

        <DialogContent className="min-w-fit">
            <DialogHeader>
                <DialogTitle>Create a project</DialogTitle>
                <DialogDescription>Add details of your project.</DialogDescription>
            </DialogHeader>

            <Input type="text" placeholder="Project Name" onChange={(e) => setNewProjName(e.target.value)} />

            <Combobox placeholder="Select Process (or search with ID)" options={usingManualProcessId.length == 43 ? [{ label: `Process ID: ${usingManualProcessId}`, value: usingManualProcessId }] : processes} onChange={(e) => setProcessUsed(e)} onOpen={fetchProcesses} onSearchChange={(e) => setUsingManualProcessId(e)} />

            <details>
                <summary className="text-muted-foreground">All Options</summary>
                <div className="flex flex-col gap-3 mt-2">
                    {processUsed == "NEW_PROCESS" && <Input type="text" placeholder={`Process Name (${newProjName || "optional"})`} onChange={(e) => setNewProcessName(e.target.value)} />}

                    <Combobox placeholder="Select Template" disabled={Object.keys(uploadedFiles).length > 0} options={Object.keys(AOTemplates).map((key) => ({ label: key, value: key })).filter((e) => e.value != "")}
                        onChange={(e) => setSelectedTemplate(e)} onOpen={() => { }} />

                    <Combobox disabled={processUsed != "NEW_PROCESS"} placeholder="AO Process Module (default: WASM64)" options={usingManualModuleId.length == 43 ? [{ label: `Module ID: ${usingManualModuleId}`, value: `${usingManualModuleId}` }] : Object.keys(AOModules).map((key) => ({ label: `${key} (${AOModules[key]})`, value: AOModules[key] }))} onChange={(e) => setNewProcessModule(e)} onSearchChange={(e) => setUsingManualModuleId(e)} />
                    <input id="projext-zip" type="file" accept=".zip" placeholder="Upload project zip" hidden onChange={handleFileDrop} />
                    <label htmlFor="projext-zip" className="text-center" onDragOver={handleFileDragOver} onDrop={handleFileDrop} onDragLeave={() => setFileDragOver(false)}>
                        <div data-draggedover={fileDragOver} className="border border-dashed data-[draggedover=true]:border-primary rounded-lg p-4">{Object.keys(uploadedFiles).length > 0 ? `Found ${Object.keys(uploadedFiles).length} files` : "Upload project zip"}</div>
                    </label>
                </div>
            </details>




            <RadioGroup defaultValue="NOTEBOOK" className="py-2" onValueChange={(e) => setDefaultFiletype(e as "NORMAL" | "NOTEBOOK")}>
                <div>
                    What type of files do you want to use? <span className="text-sm text-muted">(can be changed later)</span>
                </div>

                <div className="flex flex-col gap-2 items-center justify-center">
                    <div className="flex flex-row gap-0 items-center justify-between w-full">
                        <div className="flex items-center space-x-2 p-2">
                            <RadioGroupItem value="NOTEBOOK" id="option-one" className="" />
                            <Label data-selected={defaultFiletype == "NOTEBOOK"} className="data-[selected=true]:text-primary" htmlFor="option-one">
                                Notebook
                            </Label>
                        </div>

                        <div className="text-sm  col-span-2 text-right">Split code in cells</div>
                    </div>

                    <div className="flex flex-row items-center gap-4 justify-between w-full">
                        <div className="flex items-center space-x-2 p-2">
                            <RadioGroupItem value="NORMAL" id="option-two" />
                            <Label data-selected={defaultFiletype == "NORMAL"} className="data-[selected=true]:text-primary" htmlFor="option-two">
                                Regular
                            </Label>
                        </div>

                        <div className="text-sm  col-span-2">Write code line by line</div>
                    </div>

                </div>
            </RadioGroup>

            <Button disabled={loadingProcess} className="bg-primary" onClick={createProject}>
                {loadingProcess && <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />}
                Create Project
            </Button>
        </DialogContent>
    </Dialog>
}