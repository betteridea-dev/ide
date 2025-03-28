import { create } from "zustand";
import { TViewOptions } from "@/components/views/components";

interface EditorState {
    // Active file and project
    activeView: TViewOptions;
    activeProject: string | null;
    activeFile: string | null;
    openedFiles: string[];
    lastOutput: string;

    // Editor preferences
    fontSize: number;
    tabSize: number;
    isWordWrapEnabled: boolean;
    isLineNumbersEnabled: boolean;
    isLiveTypingEnabled: boolean;

    // Methods
    setActiveView: (view: TViewOptions) => void;
    setActiveProject: (project: string) => void;
    setActiveFile: (file: string) => void;
    addOpenedFile: (file: string) => void;
    closeOpenedFile: (file: string) => void;
    closeProject: () => void;
    setLastOutput: (output: string) => void;

    // Editor preferences methods
    setFontSize: (size: number) => void;
    setTabSize: (size: number) => void;
    toggleWordWrap: () => void;
    toggleLineNumbers: () => void;
    toggleLiveTyping: () => void;
}

export const useEditorState = create<EditorState>((set) => ({
    // Initial state for active file/project
    activeProject: null,
    activeView: null,
    activeFile: null,
    openedFiles: [],
    lastOutput: "",

    // Editor preferences
    fontSize: 14,
    tabSize: 2,
    isWordWrapEnabled: true,
    isLineNumbersEnabled: true,
    isLiveTypingEnabled: true,

    // File/project methods
    setActiveView: (view: TViewOptions) => set({ activeView: view }),
    setActiveProject: (project: string) => set({
        activeProject: project,
        activeFile: null,
        openedFiles: [],
        lastOutput: ""
    }),
    setActiveFile: (file: string) => set((state) => ({
        activeFile: file,
        openedFiles: state.openedFiles.includes(file) ? [...state.openedFiles] : [...state.openedFiles, file]
    })),
    addOpenedFile: (file: string) => set((state) => ({
        openedFiles: state.openedFiles.includes(file) ? [...state.openedFiles] : [...state.openedFiles, file]
    })),
    closeOpenedFile: (file: string) => set((state) => ({
        openedFiles: state.openedFiles.filter((f) => f !== file),
        activeFile: state.openedFiles.length > 0 ?
            state.activeFile === file ?
                state.openedFiles[state.openedFiles.indexOf(file) - 1] || state.openedFiles[state.openedFiles.indexOf(file) + 1]
                : state.activeFile
            : null
    })),
    closeProject: () => set({ activeProject: null, activeFile: null, openedFiles: [], lastOutput: "" }),
    setLastOutput: (output: string) => set({ lastOutput: output }),

    // Editor preferences methods
    setFontSize: (fontSize: number) => set({ fontSize }),
    setTabSize: (tabSize: number) => set({ tabSize }),
    toggleWordWrap: () => set((state) => ({ isWordWrapEnabled: !state.isWordWrapEnabled })),
    toggleLineNumbers: () => set((state) => ({ isLineNumbersEnabled: !state.isLineNumbersEnabled })),
    toggleLiveTyping: () => set((state) => ({ isLiveTypingEnabled: !state.isLiveTypingEnabled })),
})); 