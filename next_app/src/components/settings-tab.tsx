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
import { AOModule, runLua, spawnProcess } from "@/lib/ao-vars";
import { Icons } from "plotly.js";
import { toast } from "sonner";
import { modules as AOModules } from "@/lib/ao-vars"
import Link from "next/link";

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
      ], processUsed === "NEW_PROCESS" ? newProcessModule : AOModule);
      manager.setProjectProcess(p, np, activeWallet);
      setSpawning(false);
    } else {
      manager.setProjectProcess(p, processUsed, activeWallet);
    }
    setNewProcessName("");
    setProcessUsed("");
    setManualPid("");
  }

  async function patch6524() {
    if (!globalState.activeProject) return toast.error("No active project", { id: "error" })
    const p = manager.getProject(globalState.activeProject);
    if (!p) return toast.error("No active project", { id: "error" })
    if (!p.process) return toast.error("Process for active project not found", { id: "error" })
    const activeWallet = await window.arweaveWallet.getActiveAddress();
    if (!activeWallet) return toast.error("No wallet connected", { id: "error" })
    const patchCode = `local AO_TESTNET = 'fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY'
local SEC_PATCH = 'sec-patch-6-5-2024'

if not Utils.includes(AO_TESTNET, ao.authorities) then
  table.insert(ao.authorities, AO_TESTNET)
end
if not Utils.includes(SEC_PATCH, Utils.map(Utils.prop('name'), Handlers.list)) then
  Handlers.prepend(SEC_PATCH, 
    function (msg)
      return msg.From ~= msg.Owner and not ao.isTrusted(msg)
    end,
    function (msg)
      Send({Target = msg.From, Data = "Message is not trusted."})
      print("Message is not trusted. From: " .. msg.From .. " - Owner: " .. msg.Owner)
    end
  )
end
return "Added Patch Handler"`
    const r = await runLua(patchCode, p.process)
    console.log(r)
    if (r.Output.data.output == "Added Patch Handler") toast.success("Process Patched")


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

  return (
    <ScrollArea className="w-full h-full">
      <div className="h-full w-full p-8 max-w-4xl mx-auto">
        {/* <div className="my-5 mb-12 max-w-xl mx-auto">
          <Input type="text" placeholder="Search in settings"></Input>
        </div> */}

        <Title title="CURRENT PROJECT" />
        {project ? <div className="my-8 grid grid-cols-3 items-center">
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
              <Combobox placeholder="AO Process Module" disabled={spawning} options={Object.keys(AOModules).map((k) => ({ label: `${k} (${AOModules[k]})`, value: AOModules[k] }))} onChange={(e) => setNewProcessModule(e)} />
            </>}
            <Button size="sm" disabled={
              processUsed === "" || (processUsed === "NEW_PROCESS" && newProcessName === "") || spawning
            } onClick={setProcess}>
              {spawning && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </Button>
          </div>
          <div>Security patch for processes spawned prior to AOS version 1.11.0</div>
          <Button onClick={patch6524} className="col-span-2 w-fit mx-auto">Patch 6-5-24</Button>
        </div> : <div className="text-center text-muted mb-10">No active project</div>}

        <Title title="GLOBAL" />
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
            <summary className="mb-5 -ml-3">experimental</summary>
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
