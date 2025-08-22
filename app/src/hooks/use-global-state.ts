import type { SidebarTabs } from "@/components/left-sidebar"
import type { File } from "@/hooks/use-projects"
import { create } from "zustand"

export type ViewOptions = "settings" | "project"

interface GlobalStateActions {
    setActiveTab: (tab: SidebarTabs) => void,
    setDrawerOpen: (open: boolean) => void

    setActiveProject: (projectId: string) => void
    setActiveFile: (fileName: string) => void
    setActiveView: (view: ViewOptions | null) => void
    addOpenedFile: (fileName: string) => void
    closeOpenedFile: (fileName: string) => void
    closeProject: () => void
    setFile: (projectId: string, file: File) => void
}

export interface GlobalState {
    activeDrawer: SidebarTabs
    activeView: ViewOptions | null
    activeProject: string
    activeFile: string
    openedFiles: string[]
    drawerOpen: boolean
    actions: GlobalStateActions
}

export const useGlobalState = create<GlobalState>((set) => ({
    activeDrawer: "files",
    activeView: null,
    activeProject: "",
    activeFile: "",
    openedFiles: [],
    drawerOpen: true,
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
        closeProject: () => set({
            activeProject: "",
            activeFile: "",
            openedFiles: []
        }),
        setFile: (projectId: string, file: File) => {
            // This will be handled by the useProjects hook
            // We're adding this here for consistency with the interface
            console.log("setFile called with:", projectId, file);
        }
    }
}))