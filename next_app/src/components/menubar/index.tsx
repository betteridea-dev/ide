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
import RenameFile from "./components/rename-file"
import RenameProject from "./components/rename-project"
import DuplicateProject from "./components/duplicate-project"
import DuplicateFile from "./components/duplicate-file"
import PublishTemplateBtn from "./components/publish-template"
import { toast } from "sonner"
import { GitHubLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import Sponsor from "./components/sponsor"
import Upload from "./components/upload"

export default function Menubar() {
    const globalState = useGlobalState()
    const manager = useProjectManager()
    const project = globalState.activeProject && manager.getProject(globalState.activeProject)

    function logoClicked() {
        toast.custom((id) => <div className="rounded-lg bg-primary text-white p-3 flex flex-col gap-1 border-2 border-background/50">
            <div className="flex gap-1">
                <svg width="15" height="25" viewBox="0 0 14 25" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <g id="betteridea-icon-svg"><path d="M1 1V9.22857L6.48571 12.3143L13 8.2L1 1Z" fill="white" /><path d="M6.48571 12.3143L1 15.4V23.6286L13 16.4286L6.48571 12.3143Z" fill="white" /></g>
                </svg> BetterIDEa

                <div className="flex gap-1.5 items-center ml-auto">
                    <Link href="https://x.com/betteridea_dev" target="_blank"><TwitterLogoIcon width={25} height={25} className="mt-0.5" /></Link>
                    <Link href="https://github.com/betteridea-dev" target="_blank"><GitHubLogoIcon width={25} height={25} className="" /></Link>
                </div>
            </div>
            <span className="my-2">Building a better developer experience on ao</span>
            <div>Feel free to support the development of our tools by sponsoring us or donating :)</div>
        </div>, { position: "top-center", icon: "/icon.svg", duration: 15000, style: { backgroundColor: "transparent", boxShadow: "none", color: "transparent" } })
    }

    return <div className="border-b h-[30px] text-xs flex items-center overflow-clip">
        <Image src="/icon.svg" alt="Logo" width={40} height={40} className="py-1 min-w-12 h-[30px] cursor-pointer hover:bg-accent" onClick={logoClicked} />
        <MenubarComponent className="border-none m-0 p-0 min-w-[calc(100vw-50px)]">
            <MenubarMenu>
                <MenubarTrigger className="rounded-none m-0">Project</MenubarTrigger>
                <MenubarContent sideOffset={1} alignOffset={0} className="rounded-b-md rounded-t-none bg-background">
                    <MenubarLabel className="text-muted-foreground">
                        {project ? "Project: " + project.name : "No Project Selected"}
                    </MenubarLabel>
                    <MenubarSeparator />
                    <MenubarItem onClick={() => document.getElementById("new-project")?.click()}>New Project</MenubarItem>
                    <MenubarItem onClick={() => document.getElementById("all-projects")?.click()}>All Projects</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onClick={() => document.getElementById("publish-template")?.click()} >Publish Template (coming soon)</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem disabled={!project} onClick={() => document.getElementById("rename-project")?.click()}>Rename</MenubarItem>
                    <MenubarItem disabled={!project} onClick={() => document.getElementById("duplicate-project")?.click()}>Duplicate</MenubarItem>
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
                <MenubarContent sideOffset={1} alignOffset={0} className="rounded-b-md rounded-t-none bg-background">
                    <MenubarLabel className="text-muted-foreground">
                        {globalState.activeFile || "No File Selected"}
                    </MenubarLabel>
                    <MenubarSeparator />
                    <MenubarItem disabled={!project} onClick={() => document.getElementById("new-file")?.click()}>New File</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem disabled={!project || !globalState.activeFile} onClick={() => document.getElementById("rename-file")?.click()}>Rename</MenubarItem>
                    <MenubarItem disabled={!project || !globalState.activeFile} onClick={() => document.getElementById("duplicate-file")?.click()}>Duplicate</MenubarItem>
                    <MenubarItem disabled={!project || !globalState.activeFile} onClick={() => document.getElementById("download-file")?.click()}>Download File</MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem disabled={!project || !globalState.activeFile} onClick={() => document.getElementById("delete-file")?.click()} className="!text-destructive-foreground hover:!bg-destructive">Delete File</MenubarItem>
                    <MenubarItem disabled={!project || !globalState.activeFile} onClick={() => globalState.closeOpenedFile(globalState.activeFile)}>Close File</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger className="rounded-none m-0">Utils</MenubarTrigger>
                <MenubarContent sideOffset={1} alignOffset={0} className="rounded-b-md rounded-t-none bg-background">
                    {/* <MenubarLabel className="text-muted-foreground">Utilities</MenubarLabel> */}
                    {/* <MenubarSeparator /> */}
                    <MenubarItem onClick={() => document.getElementById("upload-file")?.click()}>Upload to Arweave</MenubarItem>
                </MenubarContent>
            </MenubarMenu>
            <div className="grow"></div>
            <MenubarMenu>
                <MenubarTrigger className="rounded-none">More from us</MenubarTrigger>
                <MenubarContent sideOffset={1} alignOffset={0} className="rounded-b-md rounded-t-none bg-background">
                    <MenubarLabel className="text-muted-foreground">Our products in the ecosystem</MenubarLabel>
                    <MenubarSeparator />
                    <Link href="https://learn.betteridea.dev" target="_blank"><MenubarItem>LearnAO</MenubarItem></Link>
                    <Link href="https://www.npmjs.com/package/@betteridea/codecell" target="_blank"><MenubarItem>Portable Codecells</MenubarItem></Link>
                    <Link href="https://apm.betteridea.dev" target="_blank"><MenubarItem>APM - ao Package Manager</MenubarItem></Link>
                    <MenubarItem disabled>VSCode Extension (releasing soon)</MenubarItem>
                    <MenubarSeparator />
                    <MenubarLabel className="text-muted-foreground">Socials</MenubarLabel>
                    <MenubarSeparator />
                    <Link href="https://discord.gg/nm6VKUQBrA" target="_blank"><MenubarItem>Chat with us on Discord</MenubarItem></Link>
                    <Link href="https://x.com/twitter.com/betteridea_dev" target="_blank"><MenubarItem>Follow us on X (Twitter)</MenubarItem></Link>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger className="rounded-none" onClick={() => document.getElementById("sponsor-us")?.click()}>Sponsor Us</MenubarTrigger>
                <MenubarContent sideOffset={1} alignOffset={0} className="rounded-b-md rounded-t-none bg-background max-w-sm">
                    <MenubarLabel className="text-muted-foreground">
                        ♥️ Sponsor BetterIDEa
                        so we can continue working on enhancing the developer experience on ao
                    </MenubarLabel>
                </MenubarContent>
            </MenubarMenu>
        </MenubarComponent>

        <div className="grow" />

        <AllProjectsBtn />

        <NewProject />
        <RenameProject />
        <DuplicateProject />
        <DeleteProject />
        <PublishTemplateBtn />

        <Share />
        <Blueprints />
        <Download />

        <NewFile />
        <RenameFile />
        <DeleteFile />
        <DownloadFile />
        <DuplicateFile />

        <Upload />

        <Sponsor />
    </div>
}