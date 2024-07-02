import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/archive/icons";
import { ProjectManager } from "@/hooks/useProjectManager";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useGlobalState } from "@/states";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NewAOProjectDialog } from "@/components/archive/ao/new-ao-project-dialog";
import { NewFileDialog } from "@/components/archive/new-file-dialog";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";

export default function SideBar({ collapsed, setCollapsed, manager }: { collapsed: boolean; setCollapsed: Dispatch<SetStateAction<boolean>>; manager: ProjectManager }) {
    const globalState = useGlobalState();
    const [mounted, setMounted] = useState(false);
    const [activeAddress, setActiveAddress] = useState("");

    const projects = Object.keys(manager.projects).filter((p) => manager.projects[p].mode == globalState.activeMode);

    useEffect(() => {
        if (typeof window == "undefined") return;
        setMounted(true);
        async function a() {
            if (!window.arweaveWallet) return;
            setActiveAddress(await window.arweaveWallet.getActiveAddress());
        }
        a();
    }, [globalState.activeProject]);

    const isValidExtension = (fileName: string) => {
        const validExtensions = ["lua", "luanb", "md"];
        const extension = fileName.split('.').pop();
        return validExtensions.includes(extension || "");
    };

    const handleRenameFile = (pname: string, oldName: string, newName: string) => {
        if (!isValidExtension(newName)) {
            toast.error("Invalid file extension. Only .lua, .luanb, and .md are supported.");
            return;
        }

        const p = manager.getProject(pname);
        const oldFile = p.files[oldName];
        manager.newFile(p, { name: newName, type: oldFile.type, initialContent: '' });
        const newFile = p.getFile(newName);
        newFile.content = oldFile.content;
        manager.deleteFile(p, oldName);
        globalState.closeFile(oldName);
        globalState.fileDeleted(oldName);
        globalState.setActiveFile(newName);
        p.files[newName] = newFile;
        manager.projects[pname] = p;
        manager.saveProjects(manager.projects);
    };

    return (
        <div data-collapsed={collapsed} className="absolute py-2 flex flex-col gap-1 truncate justify-center left-0 z-50 transition-all duration-200 w-[50px] data-[collapsed=false]:w-[250px] border-r border-border/40 bg-[#ececef] h-[calc(100vh-50px)]"
            onMouseEnter={() => setCollapsed(false)} onMouseLeave={() => setCollapsed(true)}>
 <NewAOProjectDialog collapsed={collapsed} manager={manager} setCollapsed={setCollapsed} />
            {/* <div className="h-[1px] w-[90%] my-2 bg-border mx-auto"></div> */}
            <Button
                data-active={globalState.activeFile == "AllProjects"}
                variant="ghost" id="all-projects"
                className="rounded-none p-1  w-full data-[active=true]:bg-accent flex justify-start px-3 items-center"
                onClick={()=>globalState.setActiveFile("AllProjects")}
            >
                <Icons.book className="" />
                {!collapsed && <span className="ml-2">All Projects</span>}
            </Button>
            <Button
                data-active={globalState.activeFile == "Packages"}
                variant="ghost"
                className="rounded-none p-1  w-full data-[active=true]:bg-accent flex justify-start px-3 items-center"
                onClick={()=>globalState.setActiveFile("Packages")}
            >
                <Icons.package className="" />
                {!collapsed && <span className="ml-2">Packages</span>}
            </Button>
            {/* <div className="h-[1px] w-[90%] my-2 bg-border mx-auto"></div> */}

            <div className="overflow-scroll flex flex-col grow">
                {mounted &&
                    projects.map((pname, _) => {
                        const active = pname === globalState.activeProject;
                        const ownedByActiveWallet = manager.projects[pname].ownerWallet == activeAddress;
                        let ownerAddress = manager.projects[pname].ownerWallet;
                        return (
                            <div key={_} hidden={!active}>
                                <div id={pname} data-active={active} data-collapsed={collapsed} className=" cursor-default h-fit rounded-none flex relative gap-2 px-3 mb-2 data-[active=true]:mb-0 items-start data-[collapsed=false]:justify-start data-[collapsed=true]:justify-center" key={_}
                                    onClick={() => {
                                        let shortAddress = "unknown";
                                        if (typeof ownerAddress == "string") shortAddress = ownerAddress.slice(0, 5) + "..." + ownerAddress.slice(-5);
                                        if (!ownedByActiveWallet) toast.error("The owner wallet for this project cant be verified", { description: `It was created with ${shortAddress}.\nSome things might be broken`, id: "error" });
                                        globalState.setActiveProject( pname);
                                        // if (active) return;
                                        const file = Object.keys(manager.projects[pname].files)[0];
                                        console.log(file);
                                        if (file) globalState.setActiveFile(file);
                                        const recents = JSON.parse(localStorage.getItem("recents") || "[]") as string[];
                                        if (!recents.includes(pname) && recents.length < 5) {
                                            recents.push(pname);
                                            localStorage.setItem("recents", JSON.stringify(recents));
                                        } else if (!recents.includes(pname) && recents.length >= 5) {
                                            recents.shift();
                                            recents.push(pname);
                                            localStorage.setItem("recents", JSON.stringify(recents));
                                        } else if (recents.includes(pname)) {
                                            recents.splice(recents.indexOf(pname), 1);
                                            recents.push(pname);
                                            localStorage.setItem("recents", JSON.stringify(recents));
                                        }
                                    }}>
                                    <div>
                                        <Icons.folder
                                            data-collapsed={collapsed}
                                            data-not-owned={!ownedByActiveWallet}
                                            className="fill-foreground stroke-none cursor-pointer data-[active=true]:fill-primary"
                                            data-active={active}
                                            onClick={() => document.getElementById(pname)?.click()}
                                        />
                                    </div>

                                    {!collapsed && (
                                        // <div className="flex flex-col w-full">
                                        //     <div
                                        //         data-active={active}
                                        //         className="flex gap-1 cursor-pointer items-center data-[active=true]:text-primary"
                                        //         onClick={() => document.getElementById(pname)?.click()}
                                        //     >
                                        //         <Icons.play data-active={active} className="fill-foreground data-[active=true]:fill-primary stroke-none mr-1 data-[active=true]:rotate-90" height={12} width={12} />

                                        //         {pname}
                                        //     </div>
                                        // </div>
                                        <details open className="w-full cursor-pointer" onClick={(e)=>e.stopPropagation()}>
                                            <summary className="truncate max-w-[195px]"> {pname} </summary>
                                            {active && !collapsed && (
                                                <div className="flex flex-col items-center justify-center mb-3 -ml-7">
                                                    <div className="flex justify-between items-center w-full">
                                                        <NewFileDialog manager={manager} project={pname} collapsed={collapsed} setCollapsed={setCollapsed} />
                                                        <Dialog onOpenChange={(open) => setCollapsed(!open)}>
                                                            <DialogTrigger className="hover:bg-accent/70 px-2">:</DialogTrigger>
                                                            <DialogContent>
                                                                <div className="flex flex-col gap-2">
                                                                    <Button
                                                                        disabled
                                                                        onClick={() => {
                                                                            // manager.duplicateProject(manager.getProject(pname));
                                                                            // globalState.projectDuplicated(pname);
                                                                        }}
                                                                    >
                                                                        Duplicate project
                                                                    </Button>
                                                                    <Button
                                                                        disabled
                                                                        onClick={() => {
                                                                            // manager.renameProject(manager.getProject(pname));
                                                                        }}
                                                                    >
                                                                        Rename project
                                                                    </Button>
                                                                    <Button
                                                                        variant="destructive"
                                                                        onClick={() => {
                                                                            manager.deleteProject(pname);
                                                                            globalState.projectDeleted(pname);
                                                                        }}
                                                                    >
                                                                        Delete project
                                                                    </Button>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>

                                                    {Object.keys(manager.projects[pname].files).map((fname, _) => {
                                                        return (
                                                            <div key={_} className="w-full">
                                                                <div className="w-full flex">
                                                                    <Button
                                                                        data-active={globalState.activeFile == fname}
                                                                        variant="ghost"
                                                                        className="rounded-none hover:bg-transparent text-foreground flex pl-0 pr-0 h-6 justify-between w-full"
                                                                        key={_}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            globalState.setActiveFile(fname);
                                                                        }}
                                                                    >
                                                                        <div data-active={globalState.activeFile == fname} className="hover:bg-accent/40 data-[active=true]:bg-accent/70 w-full pl-2 h-6 text-left truncate max-w-[203px]">{fname}</div>
                                                                        <div>
                                                                            <Dialog onOpenChange={(open) => setCollapsed(!open)}>
                                                                                <DialogTrigger className="px-2 hover:bg-accent/70">:</DialogTrigger>
                                                                                <DialogContent>
                                                                                    <div className="flex flex-col gap-2">
                                                                                        <Button
                                                                                            disabled
                                                                                            onClick={() => {
                                                                                                // manager.duplicateFile(manager.getProject(pname), fname);
                                                                                                // globalState.fileDuplicated(fname);
                                                                                            }}
                                                                                        >
                                                                                            Duplicate file
                                                                                        </Button>
                                                                                        <Button
                                                                                            onClick={() => {
                                                                                                const newName = prompt("Enter the new name for the file", fname);
                                                                                                if (!newName) return;
                                                                                                handleRenameFile(pname, fname, newName);
                                                                                            }}
                                                                                        >
                                                                                            Rename file
                                                                                        </Button>
                                                                                        <Button variant="destructive" onClick={() => manager.deleteFile(manager.getProject(pname), fname)}>
                                                                                            Delete file
                                                                                        </Button>
                                                                                    </div>
                                                                                </DialogContent>
                                                                            </Dialog>
                                                                        </div>
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </details>
                                    )}
                                </div>
                                
                            </div>
                        );
                    })}
            </div>

            <div className="grow" id="spacer"></div>

            <Button
                data-active={globalState.activeFile == "Settings"}
                variant="ghost"
                className="rounded-none p-1  w-full data-[active=true]:bg-accent flex justify-center"
                onClick={() => {
                    globalState.setActiveFile("Settings");
                }}
            >
                <Icons.settings className="" />

                {!collapsed && <span className="ml-2">Settings</span>}
            </Button>
        </div>
    );
}
