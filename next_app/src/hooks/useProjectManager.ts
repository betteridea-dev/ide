"use client";
import { Dispatch, SetStateAction } from "react";
import { useLocalStorage } from "usehooks-ts";

///// TYPES /////

export type TFileContent = {
  cellOrder: string[];
  cells: { [cellId: string]: { code: string; output: string | any, type: "CODE" | "LATEX" | "MARKDOWN", editing: boolean } };
};

type TLanguages = "markdown" | "lua" | "plaintext" | "json";

export type TProjectStorage = {
  [name: string]: Project;
};

function extensionToLanguage(extension: string) {
  switch (extension) {
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "lua": case "luanb":
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

  setFileProcess(proj: Project, file: PFile, processId: string) {
    file._setProcess(processId);
    this.projects[proj.name] = proj;
    this.saveProjects(this.projects);
  }

  newProject({ name, defaultFiletype, ownerWallet, files }: { name: string; defaultFiletype: "NORMAL" | "NOTEBOOK", ownerWallet: string; files?: { [name: string]: PFile } }) {
    if (typeof window == "undefined") return;
    if (!this.projects) this.saveProjects({});
    if (Object.keys(this.projects).includes(name)) return this.getProject(name);

    const proj = new Project({ name, defaultFiletype, ownerWallet });
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
    return project.getFile(name);
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
  files: { [name: string]: PFile };
  process: string;
  defaultFiletype: "NORMAL" | "NOTEBOOK";
  ownerWallet: string;

  constructor({ name, files, defaultFiletype, process, ownerWallet }: { name: string; files?: { [name: string]: PFile }; defaultFiletype?: "NORMAL" | "NOTEBOOK"; process?: string, ownerWallet: string }) {
    this.name = name;
    this.files = files || {};
    this.defaultFiletype = defaultFiletype || "NORMAL";
    this.process = process;
    this.ownerWallet = ownerWallet;
  }

  _setProcess(process: string) {
    this.process = process;
  }

  getFile(name: string) {
    if (!Object.keys(this.files).includes(name)) return;
    return new PFile(this.files[name]);
  }

  _newFile({ name, type, initialContent }: { name: string; type?: "NORMAL" | "NOTEBOOK"; initialContent?: string }) {
    if (Object.keys(this.files).includes(name)) return;
    const file: PFile = new PFile({ name, type: type || this.defaultFiletype, initialContent, process: "" });
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
  process: string;
  content: TFileContent;

  constructor({ name, type = "NORMAL", initialContent, content, process }: { name: string; type?: "NORMAL" | "NOTEBOOK"; initialContent?: string; content?: TFileContent, process: string }) {
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
        cells: { "0": { code: initialContent, output: "", type: "CODE", editing: true } },
      };
    }
    if (content) {
      this.content = content;
    }
    if (process) {
      this.process = process;
    }
  }

  updateContent(content: TFileContent) {
    this.content = content;
  }

  _setProcess(process: string) {
    this.process = process;
  }
}

export default function useProjectManager() {
  const [projects, saveProjects] = useLocalStorage<TProjectStorage>("projects", {}, { initializeWithValue: true });
  const projectmanager = new ProjectManager(projects, saveProjects);

  return projectmanager;
}
