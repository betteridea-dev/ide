import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { ProjectManager } from "@/hooks/useProjectManager";
import { useGlobalState } from "@/states";
import { spawnProcess } from "@/lib/ao-vars";
import { GraphQLClient, gql } from "graphql-request";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Combobox } from "@/components/ui/combo-box";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { ReloadIcon } from "@radix-ui/react-icons"


import { GetAOTemplates } from "@/templates";


const templates = GetAOTemplates();
// const templates = [
//   { label: "ArweaveIndia Deathmatch Arena", value: "ARIN_DEATH_ARENA" },
//   { label: "AO Effect Bot", value: "THE_GRID_BOT" },
// ];


export function NewAOProjectDialog({ manager, collapsed }: { manager: ProjectManager; collapsed: boolean }) {
  const globalState = useGlobalState();
  const [popupOpen, setPopupOpen] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [processUsed, setProcessUsed] = useState("");
  const [newProcessName, setNewProcessName] = useState("");
  const [defaultFiletype, setDefaultFiletype] = useState<"NORMAL" | "NOTEBOOK">("NORMAL");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [loadingProcess, setLoadingProcess] = useState(false);

  async function createProject() {
    if (!newProjName)
      return toast({
        title: "Need a project name 😑",
        description: "A new project always needs a name",
      });
    if (!processUsed)
      return toast({
        title: "Process options not set",
        description: "You must choose wether to create a new process or use an existing one",
      });
    const ownerWallet = await window.arweaveWallet.getActiveAddress();
    setLoadingProcess(true);
    const p = manager.newProject({
      name: newProjName,
      mode: "AO",
      defaultFiletype,
      ownerWallet
    });
    console.log(processUsed);
    if (processUsed == "NEW_PROCESS") {
      const newProcessId = await spawnProcess(newProcessName, [
        { name: "File-Type", value: defaultFiletype == "NOTEBOOK" ? "Notebook" : "Normal" }
      ]);
      manager.setProjectProcess(p, newProcessId);
    } else {
      manager.setProjectProcess(p, processUsed);
    }
    var initialContent = "print('Hello AO!')";
    initialContent = templates[selectedTemplate];
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
    manager.newFile(p, {
      name: "main.lua",
      type: defaultFiletype,
      initialContent,
    });
    globalState.clearFiles();
    globalState.setActiveProject(newProjName);
    globalState.setActiveFile("main.lua");
    setLoadingProcess(false);
    setPopupOpen(false);
  }

  // make graphql request and append processes with names to this
  const [processes, setProcesses] = useState([{ label: "+ Create New", value: "NEW_PROCESS" }]);

  async function fetchProcesses() {
    const client = new GraphQLClient("https://arweave.net/graphql");
    const address = await window.arweaveWallet.getActiveAddress();

    const query = gql`
      query {
        transactions(owners: "${address}", tags: [{ name: "Data-Protocol", values: ["ao"] }, { name: "Type", values: ["Process"] }]) {
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

  useEffect(() => {
    fetchProcesses();
  }, []);

  return (
    <Dialog open={popupOpen} onOpenChange={(e) => {
      setSelectedTemplate("");
      setProcessUsed("");
      setPopupOpen(e)
    }}>
      <DialogTrigger data-collapsed={collapsed} className="flex m-2 mx-auto w-[90%] hover:bg-accent gap-2 items-center data-[collapsed=false]:justify-start data-[collapsed=true]:justify-center p-2"
        onClick={async (e) => {
          e.preventDefault()
          try {
            await window.arweaveWallet.getActiveAddress()
            setPopupOpen(true)
          }
          catch (e) {
            console.log(e)
            setPopupOpen(false)
            toast({
              title: "Connect Wallet",
              description: "Please connect your wallet (bottom left corner) before creating a project",
            });
          }
        }}
      >
        <Icons.sqPlus data-collapsed={collapsed} height={25} width={25} className=" " />

        {!collapsed && "New Project"}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a project</DialogTitle>
          <DialogDescription>Add details of your project.</DialogDescription>
        </DialogHeader>

        <Input type="text" placeholder="Project Name" onChange={(e) => setNewProjName(e.target.value)} />

        <Combobox placeholder="Select Process" options={processes} onChange={(e) => setProcessUsed(e)} onOpen={fetchProcesses} />

        {processUsed == "NEW_PROCESS" && <Input type="text" placeholder="Process Name (optional)" onChange={(e) => setNewProcessName(e.target.value)} />}

        <Combobox placeholder="Select Template" options={Object.keys(templates).map((key) => ({ label: key, value: key })).filter((e) => e.value != "")}
          onChange={(e) => setSelectedTemplate(e)} onOpen={() => { }} />
        <RadioGroup defaultValue="NORMAL" className="py-2" onValueChange={(e) => setDefaultFiletype(e as "NORMAL" | "NOTEBOOK")}>
          <div>
            What type of files do you want to use? <span className="text-sm text-muted">(can be changed later)</span>
          </div>

          <div className="flex flex-col gap-2 items-center justify-center">
            <div className="flex flex-row items-center gap-4 justify-between w-full">
              <div className="flex items-center space-x-2 p-2">
                <RadioGroupItem value="NORMAL" id="option-one" />
                <Label data-selected={defaultFiletype == "NORMAL"} className="data-[selected=true]:text-primary" htmlFor="option-one">
                  Regular
                </Label>
              </div>

              <div className="text-sm  col-span-2">Write code line by line - simple & efficient</div>
            </div>

            <div className="flex flex-row gap-0 items-center justify-between w-full">
              <div className="flex items-center space-x-2 p-2">
                <RadioGroupItem value="NOTEBOOK" id="option-two" />
                <Label data-selected={defaultFiletype == "NOTEBOOK"} className="data-[selected=true]:text-primary" htmlFor="option-two">
                  Notebook
                </Label>
              </div>

              <div className="text-sm   col-span-2 text-right">Split code in cells - For Rapid development and testing</div>
            </div>
          </div>
        </RadioGroup>

        <Button disabled={loadingProcess} className="bg-primary" onClick={createProject}>
          {loadingProcess && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
          Create Project
        </Button>
      </DialogContent>
    </Dialog>
  );
}
