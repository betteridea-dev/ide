import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface Cell {
    id: string,
    content: string,
    output: string,
    type: "CODE" | "LATEX" | "MARKDOWN",
    editing: boolean,
    diffNew?: string  // For diff functionality
}

export interface File {
    name: string,
    cellOrder: string[],                    // list of cell ids in order
    cells: { [key: string]: Cell },         // cell id -> full cell data
    process?: string,
    isMainnet: boolean,
    ownerAddress?: string
}

export interface InteractState {
    action: string,
    data: string,
    tags: { name: string, value: string }[],
    customProcessId: string,
    selectedProcess: string
}

export interface Project {
    name: string,
    files: { [key: string]: File },
    process: string,
    ownerAddress: string,
    isMainnet: boolean,
    interactState?: InteractState
}

interface ProjectsActions {
    setProject: (project: Project) => void
    deleteProject: (projectId: string) => void

    setFile: (projectId: string, file: File) => void
    deleteFile: (projectId: string, fileName: string) => void

    setInteractState: (projectId: string, interactState: InteractState) => void

    addRecent: (projectId: string) => void
    removeRecent: (projectId: string) => void
}

export interface ProjectsState {
    projects: { [key: string]: Project }
    recents: string[] // list of project is order of access
    actions: ProjectsActions
}

export const useProjects = create<ProjectsState>()(persist((set) => ({
    projects: {},
    recents: [],
    actions: {
        setProject: (project: Project) => set((state) => ({ projects: { ...state.projects, [project.name]: project } })),
        deleteProject: (projectId: string) => set((state) => ({ projects: Object.fromEntries(Object.entries(state.projects).filter(([id]) => id !== projectId)) })),

        setFile: (projectId: string, file: File) => set((state) => ({ projects: { ...state.projects, [projectId]: { ...state.projects[projectId], files: { ...state.projects[projectId].files, [file.name]: file } } } })),
        deleteFile: (projectId: string, fileName: string) => set((state) => ({ projects: { ...state.projects, [projectId]: { ...state.projects[projectId], files: Object.fromEntries(Object.entries(state.projects[projectId].files).filter(([name]) => name !== fileName)) } } })),

        setInteractState: (projectId: string, interactState: InteractState) => set((state) => ({ projects: { ...state.projects, [projectId]: { ...state.projects[projectId], interactState } } })),

        addRecent: (projectId: string) => set((state) => ({ recents: [projectId, ...state.recents.filter((id) => id !== projectId)] })),
        removeRecent: (projectId: string) => set((state) => ({ recents: state.recents.filter((id) => id !== projectId) }))
    }
}), {
    name: "betteridea-projects",
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
        projects: state.projects,
        recents: state.recents
    })
}))