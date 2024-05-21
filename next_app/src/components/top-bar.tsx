import Image from "next/image";
import { Button } from "@/components/ui/button";
import Icons from "@/assets/icons";
import { SwitchCustom } from "@/components/ui/custom/switch";
import { useRouter } from "next/navigation";
import { useGlobalState } from "@/states";
import Link from "next/link";
import { toast } from "./ui/use-toast";
import { useState } from "react";
import Blueprints from "./ao/blueprints";
import Modules from "./ao/modules";
import { useProjectManager } from "@/hooks";
import { parseOutupt, runLua } from "@/lib/ao-vars";

export default function TopBar() {
  const router = useRouter();
  const globalState = useGlobalState();
  const projectManager = useProjectManager();
  const [sharing, setSharing] = useState(false);

  async function shareProject() {
    if (!globalState.activeProject) return toast({ title: "No active project", description: "You need to have an active project to share" });
    if (globalState.activeMode != "AO") return toast({ title: "Not in AO mode", description: "Sharing only works in AO" });
    const project = projectManager.getProject(globalState.activeProject);
    if (!project) return toast({ title: "Project not found", description: "The active project was not found" });
    if (!project.process) return toast({ title: "Process id missing", description: "The active project doesnot seem to have a process id" });

    const processBackup = project.process
    delete project.ownerWallet
    delete project.process

    const luaToRun = `_BETTERIDEA_SHARE = '${JSON.stringify(project, (k, v) => {
      if (typeof v === "string") return v.replaceAll('"', '\\"').replaceAll("'", "\'").replaceAll("\n", "\\n")
      return v
    }).toString()}'
   
Handlers.add(
  "Get-Better-IDEa-Share",
  Handlers.utils.hasMatchingTag("Action","Get-BetterIDEa-Share"),
  function(msg)
    ao.send({Target=msg.From, Action="BetterIDEa-Share-Response", Data=_BETTERIDEA_SHARE})
    return _BETTERIDEA_SHARE
  end
)   
`
    console.log(luaToRun)
    setSharing(true);
    const res = await runLua(luaToRun, processBackup, [
      { name: "BetterIDEa-Function", value: "Share-Project" }
    ]);
    console.log(res)

    const url = `${window.location.origin}/import?id=${processBackup}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Project URL copied", description: "The URL to the project has been copied to your clipboard" });
    setSharing(false);
  }

  return (
    <nav className="py-5 px-3 flex border-b justify-between items-center h-16">
      <div className="flex px-3 gap-0.5 items-center">
        <Link href="/">
          <Image src="/icon.svg" alt="BetterIDEa" width={15} height={15} className="mr-5" />
        </Link>

        <Link href="/">
          <Button variant="ghost" className="text-md">
            Home
          </Button>
        </Link>
        <Link href="https://docs.betteridea.dev" target="_blank">
          <Button variant="ghost" className="text-md">
            Docs
          </Button>
        </Link>
        <Link href="https://learn.betteridea.dev" target="_blank">
          <Button variant="ghost" className="text-md">
            Learn
          </Button>
        </Link>
      </div>


      <div className="flex gap-1 items-center">
        {globalState.activeMode == "AO"
          && globalState.activeProject && <>
            <Button variant="ghost" className="p-2.5 h-10" onClick={shareProject}>
              <Image src={sharing ? Icons.loadingSVG : Icons.sendSVG} alt="Send" width={20} height={20} className={`${sharing && "animate-spin bg-foreground rounded-full"}`} />
            </Button>
            <Modules />
            <Blueprints />
          </>
        }

        {/* <Button variant="link" className="p-2 h-7 hover:invert">
          <Image src={Icons.mailSVG} alt="Inbox" width={15} height={15} />
        </Button>

        <Button variant="link" className="p-2 h-7 hover:invert">
          <Image src={Icons.downloadSVG} alt="Download" width={15} height={15} />
        </Button>

        <Button variant="link" className="p-2 h-7 hover:invert">
          <Image src={Icons.sendSVG} alt="Send" width={15} height={15} />
        </Button> */}

        <SwitchCustom
          className="ml-5"
          onCheckedChange={(checked) => {
            globalState.activeMode == "AO" ? globalState.setActiveMode("WARP") : globalState.setActiveMode("AO");
            // checked ? router.replace(`/warp`) : router.replace(`/ao`);
          }}
          checked={globalState.activeMode == "WARP"}
        />
      </div>
    </nav>
  );
}
