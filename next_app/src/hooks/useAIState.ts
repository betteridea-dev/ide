import { create } from "zustand";
import { MsgHistory } from "./useGlobalState";

interface AIState {
    // AI panel state
    isAiPanelOpen: boolean;
    selectedModel: string;
    prompt: string;
    history: { [projectName: string]: MsgHistory[] };

    // Methods
    setIsAiPanelOpen: (open: boolean) => void;
    toggleAiPanel: () => void;
    setSelectedModel: (model: string) => void;
    setPrompt: (prompt: string) => void;
    appendHistory: (projectName: string, msg: MsgHistory) => void;
    clearHistory: (projectName?: string) => void;
}

export const useAIState = create<AIState>((set) => ({
    // Initial state
    isAiPanelOpen: false,
    selectedModel: "gemini-2.0-flash-lite", // Default model
    prompt: "",
    history: {},

    // Methods
    setIsAiPanelOpen: (isAiPanelOpen: boolean) => set({ isAiPanelOpen }),
    toggleAiPanel: () => set((state) => ({ isAiPanelOpen: !state.isAiPanelOpen })),
    setSelectedModel: (selectedModel: string) => set({ selectedModel }),
    setPrompt: (prompt: string) => set({ prompt }),
    appendHistory: (projectName: string, msg: MsgHistory) => set((state) => ({
        history: {
            ...state.history,
            [projectName]: state.history[projectName] ? [...state.history[projectName], msg] : [msg]
        }
    })),
    clearHistory: (projectName?: string) => set((state) => {
        if (projectName) {
            const newHistory = { ...state.history };
            delete newHistory[projectName];
            return { history: newHistory };
        } else {
            return { history: {} };
        }
    })
})); 