import { create } from "zustand";

interface State {
  activeMode: "AO" | "WARP";
  activeProject: string;
  activeFile: string;
  openedFiles: string[];
  setActiveMode: (mode: "AO" | "WARP") => void;
  setActiveProject: (projectName: string) => void;
  setActiveFile: (fileName: string) => void;
  clearFiles: () => void;
  fileDeleted: (fileName: string) => void;
  projectDeleted: (projectName: string) => void;
}

export const useGlobalState = create<State>((set) => ({
  activeMode: "AO",
  activeProject: "",
  activeFile: "",
  openedFiles: [],
  setActiveMode: (mode: "AO" | "WARP") => set((state) => ({ activeMode: mode, activeProject: "", openedFiles: [], activeFile: "" })),
  setActiveProject: (projectName: string) => set((state) => ({ activeProject: projectName, openedFiles: [], activeFile: "" })),
  setActiveFile: (fileName: string) => set((state) => ({ activeFile: fileName, openedFiles: state.openedFiles.includes(fileName) ? state.openedFiles : [...state.openedFiles, fileName] })),
  clearFiles: () => set((state) => ({ openedFiles: [] })),
  fileDeleted: (fileName: string) => set((state) => ({ openedFiles: state.openedFiles.filter((file) => file !== fileName), activeFile: state.activeFile === fileName ? "" : state.activeFile })),
  projectDeleted: (projectName: string) => set((state) => ({ activeProject: state.activeProject === projectName ? "" : state.activeProject, activeFile: state.activeProject === projectName ? "" : state.activeFile, openedFiles: state.activeProject === projectName ? [] : state.openedFiles })),
}));
