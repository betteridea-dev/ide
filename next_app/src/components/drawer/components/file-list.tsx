import { useGlobalState, useProjectManager } from "@/hooks";
import { TDrawerItem } from "."
import { Button } from "@/components/ui/button";
import Dropzone from "react-dropzone";
import { toast } from "sonner";

function FileList() {
    const manager = useProjectManager();
    const globalState = useGlobalState();

    if (globalState.activeProject) {
        const project = manager.projects[globalState.activeProject];
        return <div className="flex flex-col">
            <h1 className="text-left m-3 text-muted-foreground flex items-center justify-between">FILE EXPLORER
                <Button variant="ghost" className="rounded-none hover:bg-primary w-fit h-6 my-2.5 text-muted-foreground hover:text-black ml-auto px-2"
                    onClick={() => {
                        document.getElementById("new-file")?.click()
                    }}
                >+ New File</Button>
            </h1>
            {
                Object.keys(project.files).toSorted().map((fname, i) => <Button key={i} variant="ghost"
                    data-active={globalState.activeFile == fname}
                    className="w-full mx-auto justify-start truncate rounded-none data-[active=true]:bg-foreground/20"
                    onClick={() => {
                        globalState.setActiveFile(fname);
                        // globalState.addOpenedFile(fname);
                        globalState.setActiveView("EDITOR")
                    }}
                >
                    {fname}
                </Button>)
            }
            <div>
                <Dropzone
                    accept={{ 'text/markdown': ['.md'], 'application/json': ['.json', '.luanb'], 'text/x-lua': ['.lua'] }}
                    onDrop={acceptedFiles => {
                        console.log(acceptedFiles)
                        const file = acceptedFiles[0]
                        const reader = new FileReader()
                        reader.onload = () => {
                            console.log(reader.result)
                            // add new file to project
                            const proj = manager.getProject(globalState.activeProject);
                            if (proj.files[file.name]) return toast.error("File already exists")
                            const f = manager.newFile(proj, {
                                name: file.name,
                                type: file.name.endsWith(".luanb") ? "NOTEBOOK" : "NORMAL",
                                initialContent: reader.result as string,
                            });
                            // if notebook replace content
                            if (f.type == "NOTEBOOK") {
                                f.content = JSON.parse(reader.result as string).content;
                                proj.files[f.name] = f;
                                manager.projects[globalState.activeProject] = proj;
                                manager.saveProjects(manager.projects);
                            }
                            globalState.setActiveFile(file.name);
                        }
                        reader.readAsText(file)
                    }}>
                    {({ getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject }) => {
                        return (
                            <section data-active={isDragActive} className="text-center text-muted p-2 py-4 border m-2 rounded border-dashed data-[active=true]:border-primary">
                                <div {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    {/* <p>Drag 'n' drop some files here, or click to select files</p> */}
                                    Upload File (.lua, .luanb, .md)
                                </div>
                            </section>
                        )
                    }}
                </Dropzone>
            </div>
        </div>
    } else {
        return <div className="flex flex-col">
            <h1 className="text-center my-4">No Project opened</h1>
            <p className="text-center text-sm my-2">Open a project to view files</p>

            <Button variant="ghost" className="rounded-none !mt-0 m-4 bg-primary min-w-fit text-white"
                onClick={() => {
                    document.getElementById("all-projects")?.click()
                }}
            >View all projects</Button>


            <p className="text-center text-sm my-2">Or create a new one</p>

            <Button variant="ghost" className="rounded-none !mt-0 m-4 bg-primary min-w-fit text-white"
                onClick={() => {
                    document.getElementById("new-project")?.click()
                }}
            >Create New Project</Button>
        </div>
    }
}

const drawerItem: TDrawerItem = {
    component: FileList,
    label: "File List",
    value: "FILES"
}

export default drawerItem;