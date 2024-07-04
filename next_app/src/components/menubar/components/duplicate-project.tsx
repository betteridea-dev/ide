import { useGlobalState, useProjectManager } from "@/hooks";
import { toast } from "sonner";

export default function DuplicateProject() {
    const globalState = useGlobalState();
    const manager = useProjectManager();

    function duplicateProject() {
        const project = manager.getProject(globalState.activeProject);
        if (!project) return;
        const duplicatedName = `copy - ${project.name}`;
        manager.newProject({
            name: duplicatedName,
            defaultFiletype: project.defaultFiletype,
            files: project.files,
            ownerWallet: project.ownerWallet,
        });
        const dupProject = manager.getProject(duplicatedName)
        manager.setProjectProcess(dupProject, project.process)
        toast.success("Project duplicated")
    }

    return <div onClick={duplicateProject} id="duplicate-project" className="invisible">duplicate project</div>
}