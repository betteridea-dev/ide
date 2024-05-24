import { useRouter } from "next/navigation";
import { useGlobalState } from "@/states";
import { useProjectManager } from "@/hooks";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { MoonIcon, ReloadIcon, SunIcon } from "@radix-ui/react-icons"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Combobox } from "./ui/combo-box";
import { useEffect, useState } from "react";
import { GraphQLClient, gql } from "graphql-request";
import { spawnProcess } from "@/lib/ao-vars";
import { Icons } from "plotly.js";

function Title({ title }: { title: string }) {
  return (
    <div className="flex flex-row gap-6 items-center overflow-hidden mb-8">
      <h3 className="text-lg text-muted text-nowrap">{title}</h3>

      <Separator className="" />
    </div>
  );
}

export default function SettingsTab() {
  const manager = useProjectManager();
  const globalState = useGlobalState();
  const [processUsed, setProcessUsed] = useState("");
  const { theme, setTheme } = useTheme()
  const [processes, setProcesses] = useState([{ label: "+ Create New", value: "NEW_PROCESS" }]);
  const [newProcessName, setNewProcessName] = useState("");
  const [spawning, setSpawning] = useState(false);

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

  useEffect(() => {
    fetchProcesses()
  }, []);

  async function setProcess() {
    const p = manager.getProject(globalState.activeProject);
    const activeWallet = await window.arweaveWallet.getActiveAddress();
    if (processUsed === "NEW_PROCESS") {
      setSpawning(true);
      const np = await spawnProcess(newProcessName, [
        { name: "File-Type", value: p.defaultFiletype == "NOTEBOOK" ? "Notebook" : "Normal" }
      ]);
      manager.setProjectProcess(p, np, activeWallet);
      setSpawning(false);
    } else {
      manager.setProjectProcess(p, processUsed, activeWallet);
    }
    setNewProcessName("");
    setProcessUsed("");
  }

  return (
    <ScrollArea className="w-full h-full">
      <div className="h-full w-full p-8 max-w-4xl mx-auto">
        {/* <div className="my-5 mb-12 max-w-xl mx-auto">
          <Input type="text" placeholder="Search in settings"></Input>
        </div> */}

        <Title title="CURRENT PROJECT" />
        <div className="my-8 grid grid-cols-3 items-center">
          <div>Owner Wallet</div>
          <div className="col-span-2">{project.ownerWallet || "NA"}</div>
          <div>Current Process</div>
          <div className="col-span-2">{project.process || "NA"}</div>
          <div>Default Filetype</div>
          <div className="col-span-2">{project.defaultFiletype || "NA"}</div>
          <div className="col-span-3 h-5"></div>
          <div>Change Process</div>
          <div className="col-span-2 flex flex-col gap-1 items-center">
            <Combobox placeholder="Select Process" disabled={spawning} options={processes} onChange={(e) => setProcessUsed(e)} onOpen={fetchProcesses} />
            {processUsed == "NEW_PROCESS" && <Input disabled={spawning} type="text" placeholder="Enter new process name" className="w-[83%]" onChange={(e) => { setNewProcessName(e.target.value) }} />}
            <Button size="sm" disabled={
              processUsed === "" || (processUsed === "NEW_PROCESS" && newProcessName === "") || spawning
            } onClick={setProcess}>
              {spawning && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </Button>
          </div>
        </div>

        <Title title="GLOBAL" />
        <div className="my-8 grid grid-cols-3">
          <div>Theme</div>
          <Button variant="outline" size="icon" onClick={() => {
            setTheme(theme === "dark" ? "light" : "dark")
          }}>
            <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>


        {/* <div className="mb-8">
          <Title title="NOTIFICATIONS" />

          <div className="items-top flex space-x-2.5">
            <Checkbox id="terms1" />

            <Label htmlFor="terms1" className="">
              Toast notifications
            </Label>
          </div>
        </div> */}

        {/* <div className="mb-8">
          <Title title="EDITOR STYLE" />

          <div className="flex flex-col gap-3">
            <p>Open all projects as</p>

            <div className="items-top flex space-x-2.5 ml-8">
              <Checkbox id="terms1" />

              <Label htmlFor="terms1" className="">
                Cells
              </Label>
            </div>
            <div className="items-top flex space-x-2.5 ml-8">
              <Checkbox id="terms1" />

              <Label htmlFor="terms1" className="">
                Files
              </Label>
            </div>
          </div>
        </div> */}

        {/* <div className="mb-8">
          <Title title="DISABLE" />

          <div className="items-top flex space-x-2.5">
            <Checkbox id="terms1" />

            <Label htmlFor="terms1" className="">
              Force disable popups
              <span className="text-sm ml-2 text-muted">(some features might not work correctly if you enable this)</span>
            </Label>
          </div>
        </div> */}
      </div>
    </ScrollArea>
  );
}
