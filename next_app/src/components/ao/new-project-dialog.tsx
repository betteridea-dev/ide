import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { ProjectManager } from "@/hooks/useProjectManager";
import { useGlobalState } from "@/states";
import { spawnProcess } from "@/lib/ao-vars";
import { GraphQLClient, gql } from "graphql-request";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Combobox } from "@/components/ui/combo-box";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";

export function NewAOProjectDialog({
  manager,
  collapsed,
}: {
  manager: ProjectManager;
  collapsed: boolean;
}) {
  const globalState = useGlobalState();

  const [newProjName, setNewProjName] = useState("");
  const [processUsed, setProcessUsed] = useState("");
  const [newProcessName, setNewProcessName] = useState("");
  const [defaultFiletype, setDefaultFiletype] = useState<"NORMAL" | "NOTEBOOK">(
    "NORMAL"
  );

  async function createProject() {
    if (!newProjName)
      return toast({
        title: "Need a project name 😑",
        description: "A new project always needs a name",
      });
    if (!processUsed)
      return toast({
        title: "Process options not set",
        description:
          "You must choose wether to create a new process or use an existing one",
      });
    const p = manager.newProject({
      name: newProjName,
      mode: "AO",
      defaultFiletype,
    });
    console.log(processUsed);
    if (processUsed == "NEW_PROCESS") {
      const newProcessId = await spawnProcess(newProcessName);
      manager.setProjectProcess(p, newProcessId);
    } else {
      manager.setProjectProcess(p, processUsed);
    }
    manager.newFile(p, {
      name: "main.lua",
      type: defaultFiletype,
      initialContent: "print('Hello AO!')",
    });
    globalState.clearFiles();
    globalState.setActiveProject(newProjName);
    globalState.setActiveFile("main.lua");
  }

  // make graphql request and append processes with names to this
  const [processes, setProcesses] = useState([
    { label: "+ Create New", value: "NEW_PROCESS" },
  ]);

  useEffect(() => {
    const client = new GraphQLClient("https://arweave.net/graphql");

    const query = gql`
      query {
        transactions(
          owners: "jwJSkVToBnxSeL6nJuiSZ3MiHR49PnG-qJ5C94VpYG0"
          tags: [
            { name: "Data-Protocol", values: ["ao"] }
            { name: "Type", values: ["Process"] }
          ]
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

    async function fetchProcesses() {
      const address = await window.arweaveWallet.getActiveAddress();

      const res: any = await client.request(query, { address });

      const ids = res.transactions.edges.map((edge: any) => ({
        label: `${edge.node.tags[2].value} (${edge.node.id})`,
        value: edge.node.id,
      }));

      setProcesses([{ label: "+ Create New", value: "NEW_PROCESS" }, ...ids]);
    }

    fetchProcesses();
  }, []);

  return (
    <Dialog>
      <DialogTrigger
        data-collapsed={collapsed}
        className="flex text-btr-grey-1 hover:text-white gap-2 items-center data-[collapsed=false]:justify-start data-[collapsed=true]:justify-center w-full p-2 hover:bg-btr-grey-3"
      >
        <Icons.sqPlus
          data-collapsed={collapsed}
          height={25}
          width={25}
          className="fill-btr-grey-1 text-black"
        />

        {!collapsed && "New Project"}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a project</DialogTitle>
          <DialogDescription>Add details of your project.</DialogDescription>
        </DialogHeader>

        <Input
          type="text"
          placeholder="Project Name"
          onChange={(e) => setNewProjName(e.target.value)}
        />

        <Combobox options={processes} onChange={(e) => setProcessUsed(e)} />

        {processUsed == "NEW_PROCESS" && (
          <Input
            type="text"
            placeholder="Process Name (optional)"
            onChange={(e) => setNewProcessName(e.target.value)}
          />
        )}

        <RadioGroup
          defaultValue="NORMAL"
          className="py-2"
          onValueChange={(e) => setDefaultFiletype(e as "NORMAL" | "NOTEBOOK")}
        >
          <div>
            What type of files do you want to use?{" "}
            <span className="text-sm text-btr-grey-1">
              (can be changed later)
            </span>
          </div>

          <div className="flex flex-col gap-2 items-center justify-center">
            <div className="flex flex-row items-center gap-4 justify-between w-full">
              <div className="flex items-center space-x-2 p-2">
                <RadioGroupItem value="NORMAL" id="option-one" />
                <Label
                  data-selected={defaultFiletype == "NORMAL"}
                  className="data-[selected=true]:text-primary"
                  htmlFor="option-one"
                >
                  Regular
                </Label>
              </div>

              <div className="text-sm  text-btr-grey-1 col-span-2">
                Write code line by line - simple & efficient
              </div>
            </div>

            <div className="flex flex-row gap-0 items-center justify-between w-full">
              <div className="flex items-center space-x-2 p-2">
                <RadioGroupItem value="NOTEBOOK" id="option-two" />
                <Label
                  data-selected={defaultFiletype == "NOTEBOOK"}
                  className="data-[selected=true]:text-primary"
                  htmlFor="option-two"
                >
                  Notebook
                </Label>
              </div>

              <div className="text-sm  text-btr-grey-1 col-span-2 text-right">
                Split code in cells - For Rapid development and testing
              </div>
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
