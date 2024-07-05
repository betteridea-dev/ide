import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGlobalState, useProjectManager } from "@/hooks";
import { useState } from "react";
import { toast } from "sonner";
import { supportedExtensions } from "@/lib/utils";

const initialContentFromExtension = {
    "lua": "print('Hello AO!')",
    "luanb": "print('Hello AO!')",
    "md": "# Hello AO!"
}

export default function NewFile() {
    const globalState = useGlobalState();
    const manager = useProjectManager()
    const [popupOpen, setPopupOpen] = useState(false);
    const [newFileName, setNewFileName] = useState("");

    function newFile() {
        if(!globalState.activeProject) return toast.error("No project opened")
        if(!newFileName) return toast.error("Please enter a file name")
        const proj = manager.getProject(globalState.activeProject);
        // check if the filename has an extension if not add the default extension
        const newFilenameFixed = newFileName.split(".").length > 1 ? newFileName : `${newFileName}${proj.defaultFiletype == "NOTEBOOK" ? ".luanb" : ".lua"}`;

        const extension = newFilenameFixed.split(".").pop();
        if (!supportedExtensions.includes(extension!)) return toast.error("Unsupported file extension")

        manager.newFile(proj, {
            name: newFilenameFixed,
            type: newFilenameFixed.endsWith(".luanb") ? "NOTEBOOK" : "NORMAL",
            initialContent: initialContentFromExtension[extension!] || "",
        });
        globalState.setActiveFile(newFilenameFixed);
        setPopupOpen(false);
    }

    const handleEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            newFile();
        }
    }
    
    return (
        <Dialog open={popupOpen} onOpenChange={(e) => { setPopupOpen(e) }}>
            <DialogTrigger className="invisible" id="new-file">
                new file
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a new file</DialogTitle>
                    <DialogDescription>Enter the name of the file you want to create<br />(supported extensions: lua, luanb, md)</DialogDescription>
                </DialogHeader>
                <Input type="text" placeholder="File Name" onChange={(e) => setNewFileName(e.target.value)} onKeyDown={handleEnter} />
                <div className="text-muted text-center rounded-md p-5 border border-dashed">
                    Upload File (coming soon...)
                </div>
                <Button onClick={() => newFile()}>Create File</Button>
            </DialogContent>
        </Dialog>
    );
}