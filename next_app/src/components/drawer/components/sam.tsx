import { useGlobalState, useProjectManager } from "@/hooks";
import { TDrawerItem } from "."
import { Button } from "@/components/ui/button";
import { pushToRecents } from "@/lib/utils";
import { Combobox } from "@/components/ui/combo-box";
import { useState } from "react";
import axios from "axios"

function Sam() {
    const globalState = useGlobalState();
    const manager = useProjectManager();
    const projects = manager.projects;
    const project = globalState.activeProject && projects[globalState.activeProject];
    const files = Object.keys(project?.files || {})
    const [selectedFile, setSelectedFile] = useState<string | null>(null)

    async function analyze() {
        if (!project) return;
        if (!globalState.activeFile) return;
        if (!selectedFile) return;

        const file = project?.files[selectedFile!];
        console.log(file);

        let code = ''
        if (file.type == "NORMAL") {
            code = file.content.cells[0].code;
        } else {
            file.content.cellOrder.forEach(cellId => {
                if (file.content.cells[cellId].type == "CODE") {
                    code += file.content.cells[cellId].code;
                }
            })
        }
        console.log(code);

        const res = await axios.post("https://sam-api-ahqg.onrender.com/analyze", {
            code
        })
        console.log(res.data);
    }

    return <div className="flex flex-col max-h-[calc(100vh-40px)]">
        <h1 className="text-left text-muted-foreground m-3">SECURITY AUDITING MONITORING</h1>
        <div className="grid grid-cols-1 overflow-scroll p-2">
            <div className="flex gap-1">
                <Combobox placeholder="Select a file" triggerClassName="bg-foreground/5" options={files.map(file => ({ label: file, value: file }))} onChange={(e) => setSelectedFile(e)} />
                <Button disabled={!selectedFile} onClick={analyze}>Analyze</Button>
            </div>
        </div>
    </div>
}

const drawerItem: TDrawerItem = {
    component: Sam,
    label: "SAM Audit",
    value: "SAM"
}

export default drawerItem;