"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Icons from "@/assets/icons";
import { ProjectManager } from "@/hooks/useProjectManager";
import { Combobox } from "@/components/ui/combo-box";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useOpenedFiles } from "@/states";

export default function SideBar({ collapsed, manager }: { collapsed: boolean; manager: ProjectManager }) {
  const openedFiles = useOpenedFiles();
  const [mounted, setMounted] = useState(false);
  const projects = Object.keys(manager.projects);

  useEffect(() => {
    if (typeof window == "undefined") return;
    setMounted(true);
  }, []);

  // DIALOG
  const NewAOProject = () => {
    const [newProjName, setNewProjName] = useState("");
    const [processUsed, setProcessUsed] = useState("");
    const [defaultFiletype, setDefaultFiletype] = useState<"NORMAL" | "NOTEBOOK">("NORMAL");

    function createProject() {
      if (!newProjName) return;
      const p = manager.newProject({ name: newProjName, mode: "AO", defaultFiletype });
      console.log(processUsed);
      if (processUsed == "NEW_PROCESS") {
      } else {
        manager.setProjectProcess(p, processUsed);
      }
      manager.newFile(p, { name: "main.lua", type: defaultFiletype, initialContent: "print('Hello AO!')" });
      openedFiles.clearFiles();
      openedFiles.setActiveProject(newProjName);
      openedFiles.setActiveFile("main.lua");
    }

    const processes = [{ label: "+ Create New", value: "NEW_PROCESS" }];

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
          </DialogHeader>
          <Input type="text" placeholder="Project Name" onChange={(e) => setNewProjName(e.target.value)} />
          <Combobox options={processes.map((l) => l.label)} onChange={(e) => setProcessUsed(e)} />
          <RadioGroup defaultValue="NORMAL" className="py-2" onValueChange={(e) => setDefaultFiletype(e as "NORMAL" | "NOTEBOOK")}>
            <div>
              What type of files do you want to use? <span className="text-sm text-btr-grey-1">(can be changed later)</span>
            </div>
            <div className="grid grid-cols-3 items-center justify-center">
              <div className="flex items-center space-x-2 p-2">
                <RadioGroupItem value="NORMAL" id="option-one" />
                <Label data-selected={defaultFiletype == "NORMAL"} className="data-[selected=true]:text-btr-green" htmlFor="option-one">
                  Regular
                </Label>
              </div>
              <div className="text-sm  text-btr-grey-1 col-span-2">Write code line by line - simple & efficient</div>
              <div className="col-span-3">
                <hr />
              </div>
              <div className="flex items-center space-x-2 p-2">
                <RadioGroupItem value="NOTEBOOK" id="option-two" />
                <Label data-selected={defaultFiletype == "NOTEBOOK"} className="data-[selected=true]:text-btr-green" htmlFor="option-two">
                  Notebook
                </Label>
              </div>
              <div className="text-sm  text-btr-grey-1 col-span-2">Jupyter notebook like UI for rapid development and testing</div>
            </div>
          </RadioGroup>
          <Button className="bg-btr-green" onClick={createProject}>
            Create Project
          </Button>
        </DialogContent>
      </Dialog>
    );
  };

  // DIALOG
  const NewProjectFile = ({ project }: { project: string }) => {
    const [newFileName, setNewFileName] = useState("");

    function newFile() {
      const proj = manager.getProject(project);
      const newFilenameFixed = newFileName.endsWith(".lua") ? newFileName : newFileName + ".lua";
      manager.newFile(proj, { name: newFilenameFixed, type: proj.defaultFiletype, initialContent: "ok" });
      openedFiles.setActiveFile(newFilenameFixed);
    }

    return (
      <Dialog>
        <DialogTrigger>
          <Button variant="ghost" className="rounded-none p-1 h-6 justify-start w-full">
            + new file
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new file</DialogTitle>
            <DialogDescription>Enter the name of the file you want to create.</DialogDescription>
          </DialogHeader>
          <Input type="text" placeholder="File Name" onChange={(e) => setNewFileName(e.target.value)} />
          <Button onClick={() => newFile()}>Create File</Button>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <NewAOProject />
      {mounted &&
        projects.map((pname, _) => {
          const active = pname === openedFiles.activeProject;
          return (
            <div data-active={active} data-collapsed={collapsed} className="text-btr-grey-1 cursor-default h-fit rounded-none flex gap-2 p-2 pl-2.5 hover:bg-btr-grey-3 items-start data-[collapsed=false]:justify-start data-[collapsed=true]:justify-center data-[active=true]:bg-btr-grey-3 data-[active=true]:text-white " key={_}>
              <Image
                data-collapsed={collapsed}
                data-active={active}
                src={Icons.folderSVG}
                alt={pname}
                width={25}
                height={25}
                className="data-[active=true]:invert cursor-pointer"
                onClick={() => {
                  openedFiles.setActiveProject(active ? "" : pname);
                }}
              />
              {!collapsed && (
                <div className="flex flex-col w-full">
                  <div
                    className="flex gap-1 cursor-pointer"
                    onClick={() => {
                      openedFiles.setActiveProject(active ? "" : pname);
                    }}
                  >
                    <div data-active={active} className="data-[active=true]:rotate-90">
                      ▶
                    </div>
                    {pname}
                  </div>
                  {active && (
                    <div className="flex flex-col items-start mt-1">
                      <NewProjectFile project={pname} />

                      {Object.keys(manager.projects[pname].files).map((fname, _) => {
                        return (
                          <Button
                            data-active={openedFiles.activeFile == fname}
                            variant="ghost"
                            className="rounded-none p-1 h-6 justify-start w-full data-[active=true]:bg-btr-grey-2"
                            key={_}
                            onClick={() => {
                              openedFiles.setActiveFile(fname);
                            }}
                          >
                            {fname}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
    </>
  );
}
