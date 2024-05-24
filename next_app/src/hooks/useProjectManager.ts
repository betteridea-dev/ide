"use client";
import { Dispatch, SetStateAction } from "react";
import { useLocalStorage } from "usehooks-ts";

///// TYPES /////

export type TFileContent = {
  cellOrder: string[];
  cells: { [cellId: string]: { code: string; output: string | any, type: "CODE" | "LATEX" | "MARKDOWN" } };
};

type TLanguages = "javascript" | "markdown" | "lua" | "plaintext" | "json";

type TProjectStorage = {
  [name: string]: Project;
};

function extensionToLanguage(extension: string) {
  switch (extension) {
    case "js":
      return "javascript";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "lua":
      return "lua";
    default:
      return "plaintext";
  }
}

///// PROJECT MANAGER /////

export class ProjectManager {
  projects: TProjectStorage;
  saveProjects: Dispatch<SetStateAction<TProjectStorage>>;

  constructor(projects: TProjectStorage, saveProjects: Dispatch<SetStateAction<TProjectStorage>>) {
    this.projects = projects;
    this.saveProjects = saveProjects;
    // console.log(saveProjects);
  }

  getProject(name: string) {
    if (!this.projects) this.saveProjects({});
    return new Project(this.projects[name]);
  }

  setProjectProcess(proj: Project, processId: string, ownerWallet?: string) {
    proj._setProcess(processId);
    if (ownerWallet) proj.ownerWallet = ownerWallet;
    this.projects[proj.name] = proj;
    this.saveProjects(this.projects);
  }

  newProject({ name, mode, defaultFiletype, ownerWallet, files }: { name: string; mode: "AO" | "WARP"; defaultFiletype: "NORMAL" | "NOTEBOOK", ownerWallet: string; files?: { [name: string]: PFile } }) {
    if (typeof window == "undefined") return;
    if (!this.projects) this.saveProjects({});
    if (Object.keys(this.projects).includes(name)) return this.getProject(name);

    const proj = new Project({ name, mode, defaultFiletype, ownerWallet });
    if (files) {
      proj.files = files;
    }
    this.projects[name] = proj;
    this.saveProjects(this.projects);
    return proj;
  }

  deleteProject(name: string) {
    if (typeof window == "undefined") return;
    if (!Object.keys(this.projects).includes(name)) return;
    delete this.projects[name];
    this.saveProjects(this.projects);
  }

  newFile(project: Project, { name, type, initialContent = "" }: { name: string; type: "NORMAL" | "NOTEBOOK"; initialContent?: string }) {
    console.log(project);
    project._newFile({ name, type, initialContent });
    this.projects[project.name] = project;
    this.saveProjects(this.projects);
  }

  deleteFile(project: Project, name: string) {
    project.deleteFile(name);
    this.projects[project.name] = project;
    this.saveProjects(this.projects);
  }

  updateFile(project: Project, { file, content }: { file: PFile; content: TFileContent }) {
    // console.log(file);
    project._updateFile(file.name, content);
    this.projects[project.name] = project;
    this.saveProjects(this.projects);
  }
}

///// PROJECT /////

export class Project {
  readonly name: string;
  readonly mode: "AO" | "WARP";
  files: { [name: string]: PFile };
  process: string;
  defaultFiletype: "NORMAL" | "NOTEBOOK";
  ownerWallet: string;

  constructor({ name, mode, files, defaultFiletype, process, ownerWallet }: { name: string; mode: "AO" | "WARP"; files?: { [name: string]: PFile }; defaultFiletype?: "NORMAL" | "NOTEBOOK"; process?: string, ownerWallet: string }) {
    this.name = name;
    this.mode = mode;
    this.files = files || {};
    this.defaultFiletype = defaultFiletype || "NORMAL";
    this.process = process;
    this.ownerWallet = ownerWallet;
  }

  _setProcess(process: string) {
    if (this.mode == "AO") this.process = process;
    else throw new Error("Cannot set process on WARP project");
  }

  getFile(name: string) {
    if (!Object.keys(this.files).includes(name)) return;
    return new PFile(this.files[name]);
  }

  _newFile({ name, type, initialContent }: { name: string; type?: "NORMAL" | "NOTEBOOK"; initialContent?: string }) {
    if (Object.keys(this.files).includes(name)) return;
    const file: PFile = new PFile({ name, type: type || this.defaultFiletype, initialContent });
    this.files[name] = file;
  }

  deleteFile(name: string) {
    if (!Object.keys(this.files).includes(name)) return;
    delete this.files[name];
  }

  _updateFile(name: string, content: TFileContent) {
    this.files[name].content = content;
  }
}

///// FILE /////

export class PFile {
  readonly name: string;
  readonly language: TLanguages;
  readonly type: "NORMAL" | "NOTEBOOK";
  content: TFileContent;

  constructor({ name, type = "NORMAL", initialContent, content }: { name: string; type?: "NORMAL" | "NOTEBOOK"; initialContent?: string; content?: TFileContent }) {
    this.name = name;
    this.content = {
      cellOrder: [],
      cells: {},
    };
    this.language = extensionToLanguage(this.name.split(".").pop());
    this.type = this.language == "lua" ? type : "NORMAL";
    if (initialContent) {
      this.content = {
        cellOrder: ["0"],
        cells: { "0": { code: initialContent, output: "", type: "CODE" } },
      };
    }
    if (content) {
      this.content = content;
    }
  }

  updateContent(content: TFileContent) {
    this.content = content;
  }
}

export default function useProjectManager() {
  const [projects, saveProjects] = useLocalStorage<TProjectStorage>("projects", {}, { initializeWithValue: true });
  const projectmanager = new ProjectManager(projects, saveProjects);

  return projectmanager;
}
