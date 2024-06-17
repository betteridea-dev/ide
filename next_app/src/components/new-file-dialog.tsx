import { Dispatch, SetStateAction, useState } from "react";
import { ProjectManager } from "@/hooks/useProjectManager";
import { useGlobalState } from "@/states";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function NewFileDialog({ manager, project, collapsed, setCollapsed }: { manager: ProjectManager; project: string; collapsed:boolean; setCollapsed: Dispatch<SetStateAction<boolean>> }) {
  const globalState = useGlobalState();
  const [popupOpen, setPopupOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const supportedExtensions = ["lua", "luanb", "md"];

  function newFile() {
    if (!supportedExtensions.includes(newFileName.split(".").pop()!)) return toast.error("Unsupported file extension")
    const proj = manager.getProject(project);
    // const newFilenameFixed = newFileName.split(".").length > 1 ? newFileName : newFileName + (globalState.activeMode == "AO" ? ".lua" : ".js");
    const newFilenameFixed = newFileName.split(".").length > 1 ? newFileName : `${newFileName}${proj.defaultFiletype=="NOTEBOOK"?".luanb":".lua"}`;
    manager.newFile(proj, {
      name: newFilenameFixed,
      type: newFilenameFixed.endsWith(".luanb") ? "NOTEBOOK" : "NORMAL",
      initialContent: "print('Hello AO!')",
    });
    globalState.setActiveFile(newFilenameFixed);
    setPopupOpen(false);
    setCollapsed(true);
  }

  return (
    <Dialog open={popupOpen} onOpenChange={(e) => { setPopupOpen(e); setCollapsed(!e)}}>
      <DialogTrigger>
        <Button variant="ghost" className="rounded-none hover:bg-accent/50 py-1 px-2 h-6 w-full grow">
          + new file
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new file</DialogTitle>
          <DialogDescription>Enter the name of the file you want to create<br/>(supported extensions: lua, luanb, md)</DialogDescription>
        </DialogHeader>
        <Input type="text" placeholder="File Name" onChange={(e) => setNewFileName(e.target.value)} />
        <Button onClick={() => newFile()}>Create File</Button>
      </DialogContent>
    </Dialog>
  );
}
