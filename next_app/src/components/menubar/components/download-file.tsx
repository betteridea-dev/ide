import { useGlobalState, useProjectManager } from "@/hooks"

export default function DownloadFile() {
    const globalState = useGlobalState()
    const manager = useProjectManager()

    const project = globalState.activeProject && manager.getProject(globalState.activeProject)
    const file = globalState.activeFile && project.getFile(globalState.activeFile)


    function downloadFile() {
        if (project && file) {
            const fname = file.name
            // NEED BETTER FILE CONTENT HANDLING
            const content = file.name.endsWith(".luanb")?JSON.stringify(file,null,2):file.content.cells[0].code
            const blob = new Blob([JSON.stringify(content)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fname;
            a.click();
        }
    }

    return <div className="invisible" id="download-file" onClick={downloadFile}>download file</div>
}