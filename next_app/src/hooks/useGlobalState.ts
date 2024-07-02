import { create } from "zustand";
import { TSidebarOptions } from "@/components/sidebar/components";// available options = ["a","b","c"], create a type from this
import { TViewOptions } from "@/components/views/components";


interface State {
    activeSidebarItem: TSidebarOptions; 
    activeView: TViewOptions;
    activeProject: null | string;
    activeFile: null | string;
    openedFiles: string[];
    setActiveSidebarItem: (item: TSidebarOptions) => void;
    setActiveView: (view: TViewOptions) => void;
    setActiveProject: (project: string) => void;
    setActiveFile: (file: string) => void;

    addOpenedFile: (file: string) => void;
    closeOpenedFile: (file: string) => void;

    closeProject: () => void;
}

export const useGlobalState = create<State>((set) => ({
    activeProject: null,
    activeSidebarItem: "ALL_PROJECTS",
    activeView: null,
    activeFile: null,
    openedFiles: [],
    setActiveSidebarItem: (item: TSidebarOptions) => set({ activeSidebarItem: item }),
    setActiveView: (view: TViewOptions) => set({ activeView: view }),
    setActiveProject: (project: string) => set({
        activeProject: project,
        activeFile: null,
        openedFiles: []
    }),
    setActiveFile: (file: string) => set((state)=>({
        activeFile: file,
        openedFiles: state.openedFiles.includes(file) ? [...state.openedFiles] : [...state.openedFiles, file]
    })),

    addOpenedFile: (file: string) => set((state) => ({
        openedFiles: state.openedFiles.includes(file)?[...state.openedFiles]: [...state.openedFiles, file]
    })),
    closeOpenedFile: (file: string) => set((state) => ({
        openedFiles: state.openedFiles.filter((f) => f !== file),
        // set active file to the file to the left of the closed file or if it was the last file, set it to the file to the right
        activeFile: state.openedFiles.length > 0 ?
            state.activeFile == file ?    
                state.openedFiles[state.openedFiles.indexOf(file) - 1] || state.openedFiles[state.openedFiles.indexOf(file) + 1]
                : state.activeFile
            : null 
    })),

    closeProject: () => set({ activeProject: null, activeFile: null, openedFiles: [] }),
}));