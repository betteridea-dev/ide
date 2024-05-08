import { useState } from "react";
import { ProjectManager } from "@/hooks/useProjectManager";
import { useGlobalState } from "@/states";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";

export function NewWarpProjectDialog({
  manager,
  collapsed,
}: {
  manager: ProjectManager;
  collapsed: boolean;
}) {
  const globalState = useGlobalState();

  const [newProjName, setNewProjName] = useState("");

  function createProject() {
    if (!newProjName) return;
    const p = manager.newProject({
      name: newProjName,
      mode: "WARP",
      defaultFiletype: "NORMAL",
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
  }

  return (
    <>
      <Dialog>
        <DialogTrigger
          data-collapsed={collapsed}
          className="flex text-btr-grey-1 hover:text-white gap-2 items-center data-[collapsed=false]:justify-start data-[collapsed=true]:justify-center w-full p-2 hover:bg-btr-grey-3"
        >
          <Icons.add data-collapsed={collapsed} height={25} width={25} />

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
          <Button className="bg-btr-green" onClick={createProject}>
            Create Project
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
