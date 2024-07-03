import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menubar as MenubarComponent, MenubarContent, MenubarItem, MenubarLabel, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger, } from "@/components/ui/menubar"
import { useGlobalState, useProjectManager } from "@/hooks"
import NewProject from "./components/new-project"
import NewFile from "./components/new-file"
import AllProjectsBtn from "./components/all-projects"
import Share from "./components/share"
import Blueprints from "./components/blueprint"
import Download from "./components/download"
import DeleteProject from "./components/delete-project"
import DeleteFile from "./components/delete-file"
import DownloadFile from "./components/download-file"

const rawBlueprintBase = "https://raw.githubusercontent.com/permaweb/aos/main/blueprints/"
const blueprints = [
    "apm.lua",
    "arena.lua",
    "arns.lua",
    "chat.lua",
    "chatroom.lua",
    "credUtils.lua",
    "staking.lua",
    "token.lua",
    "voting.lua"
]

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
                    <MenubarItem disabled={!project} onClick={() => document.getElementById("share")?.click()}>Share</MenubarItem>
                    <MenubarItem disabled={!project} onClick={() => document.getElementById("blueprints")?.click()}>Load Blueprint</MenubarItem>
                    <MenubarItem disabled={!project} onClick={() => document.getElementById("download")?.click()}>Download zip</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem disabled={!project} onClick={() => document.getElementById("delete-project")?.click()} className="!text-destructive-foreground hover:!bg-destructive">Delete Project</MenubarItem>
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
                    <MenubarItem disabled={!project || !globalState.activeFile} onClick={()=>document.getElementById("download-file")?.click()}>Download File</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem disabled={!project || !globalState.activeFile} onClick={() => document.getElementById("delete-file")?.click()} className="!text-destructive-foreground hover:!bg-destructive">Delete File</MenubarItem>
                    <MenubarItem disabled={!project || !globalState.activeFile} onClick={() => globalState.closeOpenedFile(globalState.activeFile)}>Close File</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </MenubarComponent>
        
        <div className="grow" />

        <AllProjectsBtn />
        <NewProject />
        <DeleteProject />
        
        <Share />
        <Blueprints />
        <Download />
        
        <NewFile />
        <DeleteFile />
        <DownloadFile/>
    </div>
}