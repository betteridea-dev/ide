import { useState } from "react";
import { ProjectManager } from "@/hooks/useProjectManager";
import { useGlobalState } from "@/states";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";

export function NewWarpProjectDialog({ manager, collapsed }: { manager: ProjectManager; collapsed: boolean }) {
  const globalState = useGlobalState();
  const [popupOpen, setPopupOpen] = useState(false);
  const [newProjName, setNewProjName] = useState("");

  async function createProject() {
    if (!newProjName) return;
    const ownerWallet = await window.arweaveWallet.getActiveAddress();
    const p = manager.newProject({
      name: newProjName,
      mode: "WARP",
      defaultFiletype: "NORMAL",
      ownerWallet
    });
    manager.newFile(p, {
      name: "contract.js",
      type: "NORMAL",
      initialContent: "//code",
    });
    manager.newFile(p, {
      name: "state.json",
      type: "NORMAL",
      initialContent: "{}",
    });
    globalState.clearFiles();
    globalState.setActiveProject(newProjName);
    globalState.setActiveFile("state.json");
    globalState.setActiveFile("contract.js");
    setPopupOpen(false);
  }

  return (
    <>
      <Dialog open={popupOpen} onOpenChange={(e) => setPopupOpen(e)}>
        <DialogTrigger data-collapsed={collapsed} className="flex m-2 mx-auto w-[90%] hover:bg-accent gap-2 items-center data-[collapsed=false]:justify-start data-[collapsed=true]:justify-center p-2">
          <Icons.sqPlus data-collapsed={collapsed} height={25} width={25} className="" />

          {!collapsed && "New Project"}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a project</DialogTitle>
            <DialogDescription>Add details of your project.</DialogDescription>
          </DialogHeader>
          <Input type="text" placeholder="Project Name" onChange={(e) => setNewProjName(e.target.value)} />
          <Button className="" onClick={createProject}>
            Create Project
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
