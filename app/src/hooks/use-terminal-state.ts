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
    shownSlots: Set<number>
}

interface TerminalStateActions {
    addTerminalEntry: (processId: string, entry: TerminalHistoryEntry) => void
    setTerminalPrompt: (processId: string, prompt: string) => void
    clearTerminalHistory: (processId: string) => void
    getTerminalState: (processId: string) => ProcessTerminalState
    addShownSlot: (processId: string, slot: number) => void
    hasShownSlot: (processId: string, slot: number) => boolean
    clearShownSlots: (processId: string) => void
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
                    prompt: state.terminalStates[processId]?.prompt || "aos> ",
                    shownSlots: state.terminalStates[processId]?.shownSlots || new Set()
                }
            }
        })),

        setTerminalPrompt: (processId: string, prompt: string) => set((state) => ({
            terminalStates: {
                ...state.terminalStates,
                [processId]: {
                    ...state.terminalStates[processId],
                    history: state.terminalStates[processId]?.history || [],
                    prompt,
                    shownSlots: state.terminalStates[processId]?.shownSlots || new Set()
                }
            }
        })),

        clearTerminalHistory: (processId: string) => set((state) => ({
            terminalStates: {
                ...state.terminalStates,
                [processId]: {
                    history: [],
                    prompt: state.terminalStates[processId]?.prompt || "aos> ",
                    shownSlots: new Set() // Clear shown slots when clearing history
                }
            }
        })),

        getTerminalState: (processId: string) => {
            const state = get()
            return state.terminalStates[processId] || { history: [], prompt: "aos> ", shownSlots: new Set() }
        },

        addShownSlot: (processId: string, slot: number) => set((state) => {
            const currentState = state.terminalStates[processId] || { history: [], prompt: "aos> ", shownSlots: new Set() }
            const newShownSlots = new Set(currentState.shownSlots)
            newShownSlots.add(slot)

            return {
                terminalStates: {
                    ...state.terminalStates,
                    [processId]: {
                        ...currentState,
                        shownSlots: newShownSlots
                    }
                }
            }
        }),

        hasShownSlot: (processId: string, slot: number) => {
            const state = get()
            const processState = state.terminalStates[processId]
            return processState?.shownSlots?.has(slot) || false
        },

        clearShownSlots: (processId: string) => set((state) => ({
            terminalStates: {
                ...state.terminalStates,
                [processId]: {
                    ...state.terminalStates[processId],
                    history: state.terminalStates[processId]?.history || [],
                    prompt: state.terminalStates[processId]?.prompt || "aos> ",
                    shownSlots: new Set()
                }
            }
        }))
    }
}), {
    name: "betteridea-terminal-state",
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
        terminalStates: Object.fromEntries(
            Object.entries(state.terminalStates).map(([processId, terminalState]) => [
                processId,
                {
                    ...terminalState,
                    shownSlots: Array.from(terminalState.shownSlots || new Set())
                }
            ])
        )
    }),
    onRehydrateStorage: () => (state) => {
        if (state?.terminalStates) {
            // Convert arrays back to Sets when loading from storage
            Object.keys(state.terminalStates).forEach(processId => {
                const terminalState = state.terminalStates[processId]
                if (terminalState && Array.isArray(terminalState.shownSlots)) {
                    terminalState.shownSlots = new Set(terminalState.shownSlots)
                } else if (!terminalState.shownSlots) {
                    terminalState.shownSlots = new Set()
                }
            })
        }
    }
}))
