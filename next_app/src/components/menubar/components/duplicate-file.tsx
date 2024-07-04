import { useGlobalState, useProjectManager } from "@/hooks";
import { toast } from "sonner";

export default function DuplicateFile() {
    const globalState = useGlobalState();
    const manager = useProjectManager();

    function duplicateFile() {
        const project = manager.getProject(globalState.activeProject);
        if (!project) return;
        const file = project?.files[globalState.activeFile];
        if(!file) return;
        const duplicatedName = `copy - ${file.name}`;
        manager.newFile(project, {
            name: duplicatedName,
            type: file.type,
        })
        const dupFile = project.getFile(duplicatedName)
        dupFile.content = file.content
        project.files[duplicatedName] = dupFile
        manager.projects[project.name] = project
        manager.saveProjects(manager.projects)
        toast.success("File duplicated")
    }

    return <div onClick={duplicateFile} id="duplicate-file" className="invisible">duplicate file</div>
}