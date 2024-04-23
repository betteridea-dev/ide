"use client";
import { Dispatch, SetStateAction } from "react";
import { useLocalStorage } from "usehooks-ts";

///// TYPES /////
type TFileContent = {
  cellOrder: string[];
  cells: { [cellId: string]: { code: string; output: string } };
};

type TLanguages = "javascript" | "markdown" | "lua" | "plaintext";

type TProjectStorage = {
  [name: string]: Project;
};

function extensionToLanguage(extension: string) {
  switch (extension) {
    case "js":
      return "javascript";
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
    console.log(saveProjects);
  }

  getProject(name: string) {
    if (!this.projects) this.saveProjects({});
    return new Project(this.projects[name]);
  }

  newProject({ name, mode }: { name: string; mode: "AO" | "WARP" }) {
    if (typeof window == "undefined") return;
    if (!this.projects) this.saveProjects({});
    if (Object.keys(this.projects).includes(name)) return this.projects[name];

    const proj = new Project({ name, mode });
    this.projects[name] = proj;
    this.saveProjects(this.projects);
    return this.projects[name];
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
    console.log(file);
    project._updateFile(file.name, content);
    this.projects[project.name] = project;
    this.saveProjects(this.projects);
  }
}

///// PROJECT /////

export class Project {
  readonly name: string;
  readonly mode: "AO" | "WARP";
  readonly files: { [name: string]: PFile };

  constructor({ name, mode, files }: { name: string; mode: "AO" | "WARP"; files?: { [name: string]: PFile } }) {
    this.name = name;
    this.mode = mode;
    this.files = files || {};
  }

  getFile(name: string) {
    if (!Object.keys(this.files).includes(name)) return;
    return new PFile(this.files[name]);
  }

  _newFile({ name, type, initialContent }: { name: string; type: "NORMAL" | "NOTEBOOK"; initialContent?: string }) {
    if (Object.keys(this.files).includes(name)) return;
    const file: PFile = new PFile({ name, type, initialContent });
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
        cells: { "0": { code: initialContent, output: "" } },
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
