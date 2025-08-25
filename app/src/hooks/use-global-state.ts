import type { SidebarTabs } from "@/components/left-sidebar"
import type { File } from "@/hooks/use-projects"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type ViewOptions = "settings" | "project"

export interface HistoryEntry {
    id: string;
    timestamp: Date;
    fileName: string;
    code: string;
    output: string;
    projectId: string;
    isMainnet: boolean;
    isError: boolean;
}



interface GlobalStateActions {
    setActiveTab: (tab: SidebarTabs) => void,
    setDrawerOpen: (open: boolean) => void

    setActiveProject: (projectId: string) => void
    setActiveFile: (fileName: string) => void
    setActiveView: (view: ViewOptions | null) => void
    addOpenedFile: (fileName: string) => void
    closeOpenedFile: (fileName: string) => void
    renameOpenedFile: (oldFileName: string, newFileName: string) => void
    closeProject: () => void
    setFile: (projectId: string, file: File) => void
    setOutput: (output: string) => void
    addHistoryEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void
    clearHistory: () => void
}

export interface GlobalState {
    activeDrawer: SidebarTabs
    activeView: ViewOptions | null
    activeProject: string
    activeFile: string
    openedFiles: string[]
    drawerOpen: boolean
    output: string
    history: HistoryEntry[]
    actions: GlobalStateActions
}

const globalStateStore = create<GlobalState>()(persist((set, get) => ({
    activeDrawer: "files",
    activeView: null,
    activeProject: "",
    activeFile: "",
    openedFiles: [],
    drawerOpen: true,
    output: "",
    history: [],
    actions: {
        setActiveTab: (tab: SidebarTabs) => set({ activeDrawer: tab }),
        setDrawerOpen: (open: boolean) => set({ drawerOpen: open }),
        setActiveView: (view: ViewOptions) => set({ activeView: view }),

        setActiveProject: (projectId: string) => set({
            activeProject: projectId,
            activeFile: "",
            openedFiles: []
        }),
        setActiveFile: (fileName: string) => set((state) => ({
            activeFile: fileName,
            openedFiles: state.openedFiles.includes(fileName)
                ? state.openedFiles
                : [...state.openedFiles, fileName]
        })),
        addOpenedFile: (fileName: string) => set((state) => ({
            openedFiles: state.openedFiles.includes(fileName)
                ? state.openedFiles
                : [...state.openedFiles, fileName]
        })),
        closeOpenedFile: (fileName: string) => set((state) => ({
            openedFiles: state.openedFiles.filter((f) => f !== fileName),
            activeFile: state.activeFile === fileName
                ? (state.openedFiles.length > 1
                    ? state.openedFiles[state.openedFiles.indexOf(fileName) - 1] ||
                    state.openedFiles[state.openedFiles.indexOf(fileName) + 1] || ""
                    : "")
                : state.activeFile
        })),
        renameOpenedFile: (oldFileName: string, newFileName: string) => set((state) => ({
            openedFiles: state.openedFiles.map(f => f === oldFileName ? newFileName : f),
            activeFile: state.activeFile === oldFileName ? newFileName : state.activeFile
        })),
        closeProject: () => set({
            activeProject: "",
            activeFile: "",
            openedFiles: []
        }),
        setFile: (projectId: string, file: File) => {
            // This will be handled by the useProjects hook
            // We're adding this here for consistency with the interface
            console.log("setFile called with:", projectId, file);
        },
        setOutput: (output: string) => set({ output }),
        addHistoryEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => set((state) => ({
            history: [{
                ...entry,
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date()
            }, ...state.history]
        })),
        clearHistory: () => set({ history: [] })
    }
}), {
    name: "betteridea-global-state",
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
        activeProject: state.activeProject,
        activeFile: state.activeFile,
        openedFiles: state.openedFiles,
        drawerOpen: state.drawerOpen
    })
}))

// Main hook that returns the full state
export const useGlobalState = globalStateStore

// Selective hooks to prevent unnecessary re-renders
export const useActiveDrawer = () => globalStateStore(state => state.activeDrawer)
export const useDrawerOpen = () => globalStateStore(state => state.drawerOpen)
export const useActiveProject = () => globalStateStore(state => state.activeProject)
export const useActiveFile = () => globalStateStore(state => state.activeFile)
export const useOpenedFiles = () => globalStateStore(state => state.openedFiles)
export const useActiveView = () => globalStateStore(state => state.activeView)
export const useOutput = () => globalStateStore(state => state.output)
export const useHistory = () => globalStateStore(state => state.history)
export const useGlobalActions = () => globalStateStore(state => state.actions)