import Image from "next/image";
import { Button } from "@/components/ui/button";
// import Icons from "@/assets/icons";
import { Icons } from "@/components/icons";
import { ProjectManager } from "@/hooks/useProjectManager";
import { useState, useEffect } from "react";
import { useGlobalState } from "@/states";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
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
      setActiveAddress(await window.arweaveWallet.getActiveAddress());
    }
    a()
  }, [globalState.activeProject]);

  return (
    <>
      {globalState.activeMode == "AO" ? <NewAOProjectDialog collapsed={collapsed} manager={manager} /> : <NewWarpProjectDialog collapsed={collapsed} manager={manager} />}

      {mounted &&
        projects.map((pname, _) => {
          const active = pname === globalState.activeProject;
          const ownedByActiveWallet = manager.projects[pname].ownerWallet == activeAddress;
          return (
            <ContextMenu key={_}>
              <ContextMenuTrigger >
                <div data-active={active} data-collapsed={collapsed} className="text-btr-grey-1 cursor-default h-fit rounded-none flex relative gap-2 p-2 pl-2.5 hover:bg-btr-grey-3 items-start data-[collapsed=false]:justify-start data-[collapsed=true]:justify-center data-[active=true]:bg-btr-grey-3 data-[active=true]:text-white " key={_}>
                  <Icons.folder
                    data-collapsed={collapsed}
                    data-not-owned={!ownedByActiveWallet}
                    className="fill-btr-grey-1 data-[active=true]:invert data-[active=true]:text-white cursor-pointer"
                    data-active={active}
                    onClick={() => {
                      const shortAddress = activeAddress.slice(0, 5) + "..." + activeAddress.slice(-5);
                      if (!ownedByActiveWallet) toast({ title: "The owner wallet for this project cant be verified", description: `It was created with ${shortAddress}.\nSome things might be broken` })
                      globalState.setActiveProject(active ? "" : pname);
                    }}
                  />

                  {!collapsed && (
                    <div className="flex flex-col w-full">
                      <div
                        className="flex gap-1 cursor-pointer items-center"
                        onClick={() => {
                          const shortAddress = activeAddress.slice(0, 5) + "..." + activeAddress.slice(-5);
                          if (!ownedByActiveWallet) toast({ title: "The owner wallet for this project cant be verified", description: `It was created with ${shortAddress}.\nSome things might be broken` })
                          globalState.setActiveProject(active ? "" : pname);
                          if (active) return
                          const file = Object.keys(manager.projects[pname].files)[0];
                          console.log(file)
                          if (file)
                            globalState.setActiveFile(file);

                        }}
                      >
                        <Icons.play data-active={active} className="fill-btr-grey-1 mr-1 data-[active=true]:rotate-90 data-[active=true]:fill-white" height={12} width={12} />

                        {pname}
                      </div>

                      {active && (
                        <div className="flex flex-col items-start mt-1">
                          <NewFileDialog manager={manager} project={pname} />

                          {Object.keys(manager.projects[pname].files).map((fname, _) => {
                            return (
                              <ContextMenu key={_}>
                                <ContextMenuTrigger className="w-full">
                                  <Button
                                    data-active={globalState.activeFile == fname}
                                    variant="ghost"
                                    className="rounded-none p-1 h-6 justify-start w-full data-[active=true]:bg-btr-grey-2"
                                    key={_}
                                    onClick={() => {
                                      globalState.setActiveFile(fname);
                                    }}
                                  >
                                    {fname}
                                  </Button>

                                  <ContextMenuContent>
                                    <ContextMenuItem
                                      onClick={() => {
                                        manager.deleteFile(manager.getProject(pname), fname);
                                        globalState.fileDeleted(fname);
                                      }}
                                    >
                                      Delete file
                                    </ContextMenuItem>
                                  </ContextMenuContent>
                                </ContextMenuTrigger>
                              </ContextMenu>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ContextMenuTrigger>

              <ContextMenuContent>
                <ContextMenuItem
                  onClick={() => {
                    manager.deleteProject(pname);
                    globalState.projectDeleted(pname);
                  }}
                >
                  Delete project
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}

      <div className="grow" id="spacer"></div>

      <Button
        data-active={globalState.activeFile == "Settings"}
        variant="ghost"
        className="rounded-none p-1 text-btr-grey-1 hover:bg-btr-grey-3 w-full data-[active=true]:bg-btr-grey-3 flex justify-center"
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
