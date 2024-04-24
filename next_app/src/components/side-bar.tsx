"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Icons from "@/assets/icons";
import { ProjectManager } from "@/hooks/useProjectManager";
import { Combobox } from "@/components/ui/combo-box";
import { useState, useEffect } from "react";

export default function SideBar({ collapsed, manager, activeProject, setActiveProject }: { collapsed: boolean; manager: ProjectManager; activeProject: string; setActiveProject: Function }) {
  const [mounted, setMounted] = useState(false);
  const projects = Object.keys(manager.projects);

  useEffect(() => {
    if (typeof window == "undefined") return;
    setMounted(true);
  }, []);

  const NewAOProject = () => {
    const processes = [
      { label: "p1", value: "xyz" },
      { label: "p2", value: "abc" },
      { label: "p3", value: "def" },
    ];

    return (
      <Dialog>
        <DialogTrigger data-collapsed={collapsed} className="flex text-btr-grey-1 hover:text-white gap-2 items-center data-[collapsed=false]:justify-start data-[collapsed=true]:justify-center w-full p-2 hover:bg-btr-grey-3">
          <Image data-collapsed={collapsed} src={Icons.newProjectSVG} alt="New Project" width={25} height={25} />
          {!collapsed && "New Project"}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a project</DialogTitle>
            <DialogDescription>Add details of your project.</DialogDescription>
            <Input type="text" placeholder="Project Name" />
            <Combobox options={processes.map((l) => l.label)} onChange={(value) => console.log(value)} />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <NewAOProject />
      {mounted &&
        projects.map((pname, _) => {
          const active = pname === activeProject;
          return (
            <Button variant="ghost" data-active={active} data-collapsed={collapsed} className="text-btr-grey-1 h-fit rounded-none flex gap-2 p-2 hover:bg-btr-grey-3 items-start data-[collapsed=false]:justify-start data-[collapsed=true]:justify-center data-[active=true]:bg-btr-grey-3 data-[active=true]:text-white " key={_}>
              <Image data-collapsed={collapsed} data-active={active} src={Icons.folderSVG} alt={pname} width={25} height={25} className="data-[active=true]:invert" onClick={() => setActiveProject(active ? "" : pname)} />
              {!collapsed && (
                <div className="flex flex-col w-full">
                  <div className="flex gap-1" onClick={() => setActiveProject(active ? "" : pname)}>
                    <div data-active={active} className="data-[active=true]:rotate-90">
                      ▶
                    </div>
                    {pname}
                  </div>
                  {active && (
                    <div className="flex flex-col items-start ml-5 gap-1 pointer-events-none pointer">
                      <div>f1.txt</div>
                      <div>f1.txt</div>
                      <div>f1.txt</div>
                    </div>
                  )}
                </div>
              )}
            </Button>
          );
        })}
    </>
  );
}
