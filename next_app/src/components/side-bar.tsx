import Image from "next/image";
import { Button } from "@/components/ui/button";
// import Icons from "@/assets/icons";
import { Icons } from "@/components/icons";
import { ProjectManager } from "@/hooks/useProjectManager";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useGlobalState } from "@/states";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NewAOProjectDialog } from "@/components/ao/new-ao-project-dialog";
import { NewWarpProjectDialog } from "@/components/warp/new-wrap-project-dialog";
import { NewFileDialog } from "@/components/new-file-dialog";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";

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

  return (
    <div data-collapsed={collapsed} className="absolute flex flex-col truncate justify-center left-0 z-50 transition-all duration-200 bg-background w-[50px] data-[collapsed=false]:w-[250px] overflow-clip border-r h-[calc(100vh-89px)]" onMouseEnter={() => setCollapsed(false)} onMouseLeave={() => setCollapsed(true)}>
      {globalState.activeMode == "AO" ? <NewAOProjectDialog collapsed={collapsed} manager={manager} setCollapsed={setCollapsed} /> : <NewWarpProjectDialog collapsed={collapsed} manager={manager} />}
      <div className="h-[1px] w-[90%] mb-2 bg-border mx-auto"></div>
      {mounted &&
        projects.map((pname, _) => {
          const active = pname === globalState.activeProject;
          const ownedByActiveWallet = manager.projects[pname].ownerWallet == activeAddress;
          let ownerAddress = manager.projects[pname].ownerWallet;
          return (
            <div key={_}>
              <div data-active={active} data-collapsed={collapsed} className=" cursor-default h-fit rounded-none flex relative gap-2 px-3 mb-2 data-[active=true]:mb-0 items-start data-[collapsed=false]:justify-start data-[collapsed=true]:justify-center" key={_}>
                <Icons.folder
                  data-collapsed={collapsed}
                  data-not-owned={!ownedByActiveWallet}
                  className="fill-foreground stroke-none cursor-pointer data-[active=true]:fill-primary"
                  data-active={active}
                  onClick={() => {
                    let shortAddress = "unknown";
                    if (typeof ownerAddress == "string") shortAddress = ownerAddress.slice(0, 5) + "..." + ownerAddress.slice(-5);
                    // if (!ownedByActiveWallet) toast({ title: "The owner wallet for this project cant be verified", description: `It was created with ${shortAddress}.\nSome things might be broken` })
                    if (!ownedByActiveWallet) toast.error("The owner wallet for this project cant be verified", { description: `It was created with ${shortAddress}.\nSome things might be broken`, id: "error" });
                    globalState.setActiveProject(active ? "" : pname);
                  }}
                />

                {!collapsed && (
                  <div className="flex flex-col w-full">
                    <div
                      data-active={active}
                      className="flex gap-1 cursor-pointer items-center data-[active=true]:text-primary"
                      onClick={() => {
                        let shortAddress = "unknown";
                        if (typeof ownerAddress == "string") shortAddress = ownerAddress.slice(0, 5) + "..." + ownerAddress.slice(-5);
                        // if (!ownedByActiveWallet) toast({ title: "The owner wallet for this project cant be verified", description: `It was created with ${shortAddress}.\nSome things might be broken` })
                        if (!ownedByActiveWallet) toast.error("The owner wallet for this project cant be verified", { description: `It was created with ${shortAddress}.\nSome things might be broken`, id: "error" });
                        globalState.setActiveProject(active ? "" : pname);
                        if (active) return;
                        const file = Object.keys(manager.projects[pname].files)[0];
                        console.log(file);
                        if (file) globalState.setActiveFile(file);
                      }}
                    >
                      <Icons.play data-active={active} className="fill-foreground data-[active=true]:fill-primary stroke-none mr-1 data-[active=true]:rotate-90" height={12} width={12} />

                      {pname}
                    </div>
                  </div>
                )}
              </div>
              {active && !collapsed && (
                <div className="flex flex-col items-center justify-center px-3 mb-3 w-full">
                  <div className="flex justify-between items-center w-full">
                    <NewFileDialog manager={manager} project={pname} />
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
                            className="rounded-none flex pl-1 pr-0 h-6 justify-between w-full hover:bg-accent/30 data-[active=true]:bg-accent/60"
                            key={_}
                            onClick={() => {
                              globalState.setActiveFile(fname);
                            }}
                          >
                            <div>{fname}</div>
                            <div>
                              <Dialog onOpenChange={(open) => setCollapsed(!open)}>
                                <DialogTrigger>:</DialogTrigger>
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
                                      disabled
                                      onClick={() => {
                                        // manager.renameFile(manager.getProject(pname), fname);
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
                              {/* <DropdownMenu onOpenChange={(e) => setCollapsed(!e)}>
                                <DropdownMenuTrigger>
                                  <Button
                                    variant="ghost"
                                    className="h-6 px-2 rounded-none"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                  >
                                    :
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      manager.deleteFile(manager.getProject(pname), fname);
                                      globalState.fileDeleted(fname);
                                    }}
                                  >
                                    Delete file
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu> */}
                            </div>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

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
