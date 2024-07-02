import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
    Menubar as MenubarComponent,
    MenubarContent,
    MenubarItem,
    MenubarLabel,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
} from "@/components/ui/menubar"
import { useGlobalState, useProjectManager } from "@/hooks"
import NewProject from "./components/new-project"
import NewFile from "./components/new-file"
import AllProjectsBtn from "./components/all-projects"


export default function Menubar() {
    const globalState = useGlobalState()
    const manager = useProjectManager()

    const project = globalState.activeProject && manager.getProject(globalState.activeProject)


    return <div className="border-b h-[30px] text-xs flex items-center overflow-clip">
        <Image src="/icon.svg" alt="Logo" width={40} height={40} className="py-0.5 w-12 h-[30px] cursor-pointer" />
        {/* <Button variant="ghost" className="text-xs p-2">
            Options
        </Button>
        <Button variant="ghost" className="text-xs p-2">
            Download
        </Button>
        <Button variant="ghost" className="text-xs p-2">
            Share
        </Button>
        <Button variant="ghost" className="text-xs p-2">
            Load Blueprint
        </Button> */}
        <MenubarComponent className="border-none m-0 p-0">
            <MenubarMenu>
                <MenubarTrigger className="rounded-none m-0">Project</MenubarTrigger>
                <MenubarContent sideOffset={1} alignOffset={0} className="rounded-b-md rounded-t-none">
                    <MenubarLabel className="text-muted-foreground">
                        {project ? "Project: " + project.name : "No Project Selected"}
                    </MenubarLabel>
                    <MenubarSeparator />
                    <MenubarItem onClick={() => document.getElementById("new-project")?.click()}>New Project</MenubarItem>
                    <MenubarItem onClick={() => document.getElementById("all-projects")?.click()}>All Projects</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem disabled={!project}>Rename</MenubarItem>
                    <MenubarItem disabled={!project}>Duplicate</MenubarItem>
                    <MenubarItem disabled={!project}>Share</MenubarItem>
                    <MenubarItem disabled={!project}>Download zip</MenubarItem>
                    <MenubarSeparator />
                    <MenubarSub>
                        <MenubarSubTrigger disabled={!project}>Load blueprint</MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarItem>a</MenubarItem>
                            <MenubarItem>b</MenubarItem>
                            <MenubarItem>c</MenubarItem>
                            <MenubarItem>d</MenubarItem>
                        </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSeparator />
                    <MenubarItem disabled={!project} onClick={() => { }} className="!text-destructive-foreground hover:!bg-destructive">Delete Project</MenubarItem>
                    <MenubarItem disabled={!project} onClick={() => globalState.closeProject()}>Close Project</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger className="rounded-none m-0">File</MenubarTrigger>
                <MenubarContent sideOffset={1} alignOffset={0} className="rounded-b-md rounded-t-none">
                    <MenubarLabel className="text-muted-foreground">
                        {globalState.activeFile || "No File Selected"}
                    </MenubarLabel>
                    <MenubarSeparator />
                    <MenubarItem disabled={!project} onClick={() => document.getElementById("new-file")?.click()}>New File</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem disabled={!project || !globalState.activeFile}>Rename</MenubarItem>
                    <MenubarItem disabled={!project || !globalState.activeFile}>Duplicate</MenubarItem>
                    <MenubarItem disabled={!project || !globalState.activeFile}>Download File</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem disabled={!project || !globalState.activeFile} onClick={() => { }} className="!text-destructive-foreground hover:!bg-destructive">Delete File</MenubarItem>
                    <MenubarItem disabled={!project || !globalState.activeFile} onClick={() => globalState.closeOpenedFile(globalState.activeFile)}>Close File</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </MenubarComponent>
        <div className="grow" />
        <NewProject />
        <NewFile />
        <AllProjectsBtn />
    </div>
}