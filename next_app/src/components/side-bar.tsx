import Image from "next/image";
import { Button } from "@/components/ui/button";
// import Icons from "@/assets/icons";
import { Icons } from "@/components/icons";
import { ProjectManager } from "@/hooks/useProjectManager";
import { useState, useEffect } from "react";
import { useGlobalState } from "@/states";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NewAOProjectDialog } from "@/components/ao/new-ao-project-dialog";
import { NewWarpProjectDialog } from "@/components/warp/new-wrap-project-dialog";
import { NewFileDialog } from "@/components/new-file-dialog";
import { toast } from "./ui/use-toast";

export default function SideBar({ collapsed, manager }: { collapsed: boolean; manager: ProjectManager }) {
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
    a()
  }, [globalState.activeProject]);

  return (
    <>
      {globalState.activeMode == "AO" ? <NewAOProjectDialog collapsed={collapsed} manager={manager} /> : <NewWarpProjectDialog collapsed={collapsed} manager={manager} />}
      <div className="h-[1px] w-[90%] mb-2 bg-border mx-auto"></div>
      {mounted &&
        projects.map((pname, _) => {
          const active = pname === globalState.activeProject;
          const ownedByActiveWallet = manager.projects[pname].ownerWallet == activeAddress;
          const ownerAddress = manager.projects[pname].ownerWallet;
          return (
            <DropdownMenu key={_}>
              <div data-active={active} data-collapsed={collapsed} className=" cursor-default h-fit rounded-none flex relative gap-2 px-3 mb-2 data-[active=true]:mb-0 items-start data-[collapsed=false]:justify-start data-[collapsed=true]:justify-center" key={_}>
                <Icons.folder
                  data-collapsed={collapsed}
                  data-not-owned={!ownedByActiveWallet}
                  className="fill-foreground stroke-none cursor-pointer data-[active=true]:fill-primary"
                  data-active={active}
                  onClick={() => {
                    const shortAddress = ownerAddress.slice(0, 5) + "..." + ownerAddress.slice(-5);
                    if (!ownedByActiveWallet) toast({ title: "The owner wallet for this project cant be verified", description: `It was created with ${shortAddress}.\nSome things might be broken` })
                    globalState.setActiveProject(active ? "" : pname);
                  }}
                />

                {!collapsed && (
                  <div className="flex flex-col w-full">
                    <div
                      data-active={active}
                      className="flex gap-1 cursor-pointer items-center data-[active=true]:text-primary"
                      onClick={() => {
                        const shortAddress = ownerAddress.slice(0, 5) + "..." + ownerAddress.slice(-5);
                        if (!ownedByActiveWallet) toast({ title: "The owner wallet for this project cant be verified", description: `It was created with ${shortAddress}.\nSome things might be broken` })
                        globalState.setActiveProject(active ? "" : pname);
                        if (active) return
                        const file = Object.keys(manager.projects[pname].files)[0];
                        console.log(file)
                        if (file)
                          globalState.setActiveFile(file);

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
                    <DropdownMenuTrigger className="cursor-pointer hover:bg-accent/70 px-2">
                      :
                      {/* <Icons.settings className="cursor-pointer hover:bg-accent/70 p-1" width={24} /> */}
                    </DropdownMenuTrigger>
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
                              <DropdownMenu>
                                <DropdownMenuTrigger>
                                  <Button variant="ghost" className="h-6 px-2 rounded-none" onClick={(e) => {
                                    e.stopPropagation()
                                  }}>:</Button>
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
                              </DropdownMenu>
                            </div>
                          </Button>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => {
                    manager.deleteProject(pname);
                    globalState.projectDeleted(pname);
                  }}
                >
                  Delete project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
        <Icons.settings className="mr-2" />

        {!collapsed && "Settings"}
      </Button>
    </>
  );
}
