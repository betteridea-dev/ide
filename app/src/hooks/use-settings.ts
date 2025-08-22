import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Default values for all settings
export const DEFAULT_SETTINGS = {
    // Network URLs
    CU_URL: "https://cu.arnode.asia",
    MU_URL: "https://mu.ao-testnet.xyz",
    GATEWAY_URL: "https://arweave.net",
    HB_URL: "", // Heartbeat URL - keeping for compatibility

    // Editor preferences
    VIM_MODE: false,

    // AI Integration
    GEMINI_API_KEY: "",

    // Theme (handled by theme provider, but we can store preference)
    THEME_PREFERENCE: "system" as "light" | "dark" | "system",
} as const;

export type SettingsKey = keyof typeof DEFAULT_SETTINGS;
export type ThemePreference = typeof DEFAULT_SETTINGS.THEME_PREFERENCE;

interface SettingsState {
    // Network URLs
    CU_URL: string;
    MU_URL: string;
    GATEWAY_URL: string;
    HB_URL: string;

    // Editor preferences  
    VIM_MODE: boolean;

    // AI Integration
    GEMINI_API_KEY: string;

    // Theme preference
    THEME_PREFERENCE: ThemePreference;

    // Actions
    actions: SettingsActions;
}

interface SettingsActions {
    // Network URL setters
    setCU_URL: (url: string) => void;
    setMU_URL: (url: string) => void;
    setGATEWAY_URL: (url: string) => void;
    setHB_URL: (url: string) => void;

    // Editor preference setters
    setVimMode: (enabled: boolean) => void;

    // AI Integration setters
    setGeminiApiKey: (key: string) => void;

    // Theme preference setter
    setThemePreference: (theme: ThemePreference) => void;

    // Utility functions
    resetToDefaults: () => void;
    resetNetworkUrls: () => void;
    resetEditorSettings: () => void;
    resetAISettings: () => void;

    // Individual URL resets
    resetCuUrl: () => void;
    resetMuUrl: () => void;
    resetGatewayUrl: () => void;

    // Validation functions
    isValidUrl: (url: string) => boolean;
    isValidGeminiKey: (key: string) => boolean;

    // Getters with fallbacks
    getCuUrl: () => string;
    getMuUrl: () => string;
    getGatewayUrl: () => string;
    getVimMode: () => boolean;
    getGeminiApiKey: () => string;
    getThemePreference: () => ThemePreference;

    // Bulk operations
    exportSettings: () => Omit<SettingsState, 'actions'>;
    importSettings: (settings: Partial<Omit<SettingsState, 'actions'>>) => void;
}

// URL validation function
const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return url.startsWith('http://') || url.startsWith('https://');
    } catch {
        return false;
    }
};

// Gemini API key validation (basic length check)
const isValidGeminiKey = (key: string): boolean => {
    return key.length >= 39 && !key.match(/^\*+$/);
};

export const useSettings = create<SettingsState>()(
    persist((set, get) => ({
        // Initialize with default values
        ...DEFAULT_SETTINGS,

        actions: {
            // Network URL setters
            setCU_URL: (url: string) => {
                if (isValidUrl(url)) {
                    set({ CU_URL: url });
                }
            },
            setMU_URL: (url: string) => {
                if (isValidUrl(url)) {
                    set({ MU_URL: url });
                }
            },
            setGATEWAY_URL: (url: string) => {
                if (isValidUrl(url)) {
                    set({ GATEWAY_URL: url });
                }
            },
            setHB_URL: (url: string) => {
                if (!url || isValidUrl(url)) {
                    set({ HB_URL: url });
                }
            },

            // Editor preference setters
            setVimMode: (enabled: boolean) => {
                set({ VIM_MODE: enabled });
            },

            // AI Integration setters
            setGeminiApiKey: (key: string) => {
                set({ GEMINI_API_KEY: key });
            },

            // Theme preference setter
            setThemePreference: (theme: ThemePreference) => {
                set({ THEME_PREFERENCE: theme });
            },

            // Reset functions
            resetToDefaults: () => {
                set({
                    ...DEFAULT_SETTINGS
                });
            },

            resetNetworkUrls: () => {
                set({
                    CU_URL: DEFAULT_SETTINGS.CU_URL,
                    MU_URL: DEFAULT_SETTINGS.MU_URL,
                    GATEWAY_URL: DEFAULT_SETTINGS.GATEWAY_URL,
                });
            },

            resetEditorSettings: () => {
                set({
                    VIM_MODE: DEFAULT_SETTINGS.VIM_MODE,
                });
            },

            resetAISettings: () => {
                set({
                    GEMINI_API_KEY: DEFAULT_SETTINGS.GEMINI_API_KEY,
                });
            },

            // Individual URL resets
            resetCuUrl: () => set({ CU_URL: DEFAULT_SETTINGS.CU_URL }),
            resetMuUrl: () => set({ MU_URL: DEFAULT_SETTINGS.MU_URL }),
            resetGatewayUrl: () => set({ GATEWAY_URL: DEFAULT_SETTINGS.GATEWAY_URL }),

            // Validation functions
            isValidUrl,
            isValidGeminiKey,

            // Getters with fallbacks
            getCuUrl: () => get().CU_URL || DEFAULT_SETTINGS.CU_URL,
            getMuUrl: () => get().MU_URL || DEFAULT_SETTINGS.MU_URL,
            getGatewayUrl: () => get().GATEWAY_URL || DEFAULT_SETTINGS.GATEWAY_URL,
            getVimMode: () => get().VIM_MODE ?? DEFAULT_SETTINGS.VIM_MODE,
            getGeminiApiKey: () => get().GEMINI_API_KEY || DEFAULT_SETTINGS.GEMINI_API_KEY,
            getThemePreference: () => get().THEME_PREFERENCE || DEFAULT_SETTINGS.THEME_PREFERENCE,

            // Bulk operations
            exportSettings: () => {
                const state = get();
                return {
                    CU_URL: state.CU_URL,
                    MU_URL: state.MU_URL,
                    GATEWAY_URL: state.GATEWAY_URL,
                    HB_URL: state.HB_URL,
                    VIM_MODE: state.VIM_MODE,
                    GEMINI_API_KEY: state.GEMINI_API_KEY,
                    THEME_PREFERENCE: state.THEME_PREFERENCE,
                };
            },

            importSettings: (newSettings: Partial<Omit<SettingsState, 'actions'>>) => {
                set((state) => ({
                    ...state,
                    ...newSettings
                }));
            },
        }
    }), {
        name: "betteridea-settings",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
            CU_URL: state.CU_URL,
            MU_URL: state.MU_URL,
            GATEWAY_URL: state.GATEWAY_URL,
            HB_URL: state.HB_URL,
            VIM_MODE: state.VIM_MODE,
            GEMINI_API_KEY: state.GEMINI_API_KEY,
            THEME_PREFERENCE: state.THEME_PREFERENCE,
        }),
        // Migrate old localStorage keys to new structure
        onRehydrateStorage: () => (state) => {
            if (state) {
                // Migrate from old localStorage keys if they exist
                const oldCuUrl = localStorage.getItem("ao-cu-url");
                const oldMuUrl = localStorage.getItem("ao-mu-url");
                const oldGatewayUrl = localStorage.getItem("gateway-url");
                const oldVimMode = localStorage.getItem("vimMode");
                const oldGeminiKey = localStorage.getItem("geminiApiKey");
                const oldTheme = localStorage.getItem("vite-ui-theme");

                if (oldCuUrl && !state.CU_URL) state.CU_URL = oldCuUrl;
                if (oldMuUrl && !state.MU_URL) state.MU_URL = oldMuUrl;
                if (oldGatewayUrl && !state.GATEWAY_URL) state.GATEWAY_URL = oldGatewayUrl;
                if (oldVimMode && state.VIM_MODE === undefined) state.VIM_MODE = oldVimMode === "true";
                if (oldGeminiKey && !state.GEMINI_API_KEY) state.GEMINI_API_KEY = oldGeminiKey;
                if (oldTheme && !state.THEME_PREFERENCE) {
                    state.THEME_PREFERENCE = oldTheme as ThemePreference;
                }
            }
        }
    })
)

// Utility function to get settings outside of React components
export const getSettings = () => useSettings.getState()

// Utility function to get settings actions outside of React components  
export const getSettingsActions = () => useSettings.getState().actions