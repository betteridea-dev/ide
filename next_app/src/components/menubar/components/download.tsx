import { useGlobalState, useProjectManager } from "@/hooks";
import JSZip from "jszip";

export default function Download() {
    const globalState = useGlobalState();
    const projectManager = useProjectManager();
    
    function downloadProject() {
        const project = projectManager.getProject(globalState.activeProject);
        if (!project) return;
        const { files } = project;
        console.log(files)
        const fileContents = Object.values(files);
        const zip = new JSZip();
        fileContents.forEach(file => {
            console.log(file)
            // const fileName = file.name.split(".")[0] + ".luanb";
            const fileName = file.name;
            const contents = file.name.endsWith(".luanb") ? JSON.stringify(file) : file.content.cells[0].code;
            zip.file(fileName, contents);
        })
        zip.generateAsync({ type: "blob" }).then((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${globalState.activeProject}.zip`;
            a.click();
        })

    }

    return <div onClick={downloadProject} id="download" className="invisible">download</div>
}