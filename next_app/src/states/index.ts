import { create } from "zustand";

interface State {
  activeProject: string;
  activeFile: string;
  openedFiles: string[];
  setActiveProject: (projectName: string) => void;
  setActiveFile: (fileName: string) => void;
  clearFiles: () => void;
}

export const useOpenedFiles = create<State>((set) => ({
  activeProject: "",
  activeFile: "",
  openedFiles: [],
  setActiveProject: (projectName: string) => set((state) => ({ activeProject: projectName, openedFiles: ["main.lua"], activeFile: "main.lua" })),
  setActiveFile: (fileName: string) => set((state) => ({ activeFile: fileName, openedFiles: state.openedFiles.includes(fileName) ? state.openedFiles : [...state.openedFiles, fileName] })),
  clearFiles: () => set((state) => ({ openedFiles: [] })),
}));
