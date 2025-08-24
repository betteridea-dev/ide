import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface TerminalHistoryEntry {
    type: 'input' | 'output' | 'error' | 'system'
    content: string
    timestamp: number
}

export interface ProcessTerminalState {
    history: TerminalHistoryEntry[]
    prompt: string
}

interface TerminalStateActions {
    addTerminalEntry: (processId: string, entry: TerminalHistoryEntry) => void
    setTerminalPrompt: (processId: string, prompt: string) => void
    clearTerminalHistory: (processId: string) => void
    getTerminalState: (processId: string) => ProcessTerminalState
}

export interface TerminalState {
    terminalStates: { [processId: string]: ProcessTerminalState }
    actions: TerminalStateActions
}

export const useTerminalState = create<TerminalState>()(persist((set, get) => ({
    terminalStates: {},
    actions: {
        addTerminalEntry: (processId: string, entry: TerminalHistoryEntry) => set((state) => ({
            terminalStates: {
                ...state.terminalStates,
                [processId]: {
                    ...state.terminalStates[processId],
                    history: [
                        ...(state.terminalStates[processId]?.history || []),
                        entry
                    ],
                    prompt: state.terminalStates[processId]?.prompt || "aos> "
                }
            }
        })),

        setTerminalPrompt: (processId: string, prompt: string) => set((state) => ({
            terminalStates: {
                ...state.terminalStates,
                [processId]: {
                    ...state.terminalStates[processId],
                    history: state.terminalStates[processId]?.history || [],
                    prompt
                }
            }
        })),

        clearTerminalHistory: (processId: string) => set((state) => ({
            terminalStates: {
                ...state.terminalStates,
                [processId]: {
                    history: [],
                    prompt: state.terminalStates[processId]?.prompt || "aos> "
                }
            }
        })),

        getTerminalState: (processId: string) => {
            const state = get()
            return state.terminalStates[processId] || { history: [], prompt: "aos> " }
        }
    }
}), {
    name: "betteridea-terminal-state",
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
        terminalStates: state.terminalStates
    })
}))
