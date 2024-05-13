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

import { source as aoBot } from "@/blueprints/ao/ao-bot"
import { source as chat } from "@/blueprints/ao/chat";
import { source as token } from "@/blueprints/ao/token";

const templates = [
  { label: "AO Bot (The Grid Arena)", value: "THE_GRID_BOT" },
  { label: "Chat", value: "CHAT" },
  // { label: "Token", value: "TOKEN" },
];


export function NewAOProjectDialog({ manager, collapsed }: { manager: ProjectManager; collapsed: boolean }) {
  const globalState = useGlobalState();
  const [popupOpen, setPopupOpen] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [processUsed, setProcessUsed] = useState("");
  const [newProcessName, setNewProcessName] = useState("");
  const [defaultFiletype, setDefaultFiletype] = useState<"NORMAL" | "NOTEBOOK">("NORMAL");
  const [selectedTemplate, setSelectedTemplate] = useState("");

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
    const p = manager.newProject({
      name: newProjName,
      mode: "AO",
      defaultFiletype,
      ownerWallet
    });
    console.log(processUsed);
    if (processUsed == "NEW_PROCESS") {
      const newProcessId = await spawnProcess(newProcessName);
      manager.setProjectProcess(p, newProcessId);
    } else {
      manager.setProjectProcess(p, processUsed);
    }
    var initialContent = "print('Hello AO!')";
    switch (selectedTemplate) {
      case "THE_GRID_BOT":
        initialContent = aoBot
        break;
      case "CHAT":
        initialContent = chat
        break;
      case "TOKEN":
        initialContent = token
        break;
      default:
        initialContent = "print('Hello AO!')"
    }
    manager.newFile(p, {
      name: "main.lua",
      type: defaultFiletype,
      initialContent,
    });
    globalState.clearFiles();
    globalState.setActiveProject(newProjName);
    globalState.setActiveFile("main.lua");
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
    <Dialog open={popupOpen} onOpenChange={(e) => setPopupOpen(e)}>
      <DialogTrigger data-collapsed={collapsed} className="flex text-btr-grey-1 hover:text-white gap-2 items-center data-[collapsed=false]:justify-start data-[collapsed=true]:justify-center w-full p-2 hover:bg-btr-grey-3">
        <Icons.sqPlus data-collapsed={collapsed} height={25} width={25} className="fill-btr-grey-1 text-black" />

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

        <Combobox placeholder="Select Template" options={templates} onChange={(e) => setSelectedTemplate(e)} onOpen={() => { }} />

        <RadioGroup defaultValue="NORMAL" className="py-2" onValueChange={(e) => setDefaultFiletype(e as "NORMAL" | "NOTEBOOK")}>
          <div>
            What type of files do you want to use? <span className="text-sm text-btr-grey-1">(can be changed later)</span>
          </div>

          <div className="flex flex-col gap-2 items-center justify-center">
            <div className="flex flex-row items-center gap-4 justify-between w-full">
              <div className="flex items-center space-x-2 p-2">
                <RadioGroupItem value="NORMAL" id="option-one" />
                <Label data-selected={defaultFiletype == "NORMAL"} className="data-[selected=true]:text-primary" htmlFor="option-one">
                  Regular
                </Label>
              </div>

              <div className="text-sm  text-btr-grey-1 col-span-2">Write code line by line - simple & efficient</div>
            </div>

            <div className="flex flex-row gap-0 items-center justify-between w-full">
              <div className="flex items-center space-x-2 p-2">
                <RadioGroupItem value="NOTEBOOK" id="option-two" />
                <Label data-selected={defaultFiletype == "NOTEBOOK"} className="data-[selected=true]:text-primary" htmlFor="option-two">
                  Notebook
                </Label>
              </div>

              <div className="text-sm  text-btr-grey-1 col-span-2 text-right">Split code in cells - For Rapid development and testing</div>
            </div>
          </div>
        </RadioGroup>

        <Button className="bg-btr-green" onClick={createProject}>
          Create Project
        </Button>
      </DialogContent>
    </Dialog>
  );
}
