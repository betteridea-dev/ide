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
}));
