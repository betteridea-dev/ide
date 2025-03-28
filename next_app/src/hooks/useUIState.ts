import { create } from "zustand";
import { TSidebarOptions } from "@/components/sidebar/components";

interface UIState {
    // Sidebar state
    activeSidebarItem: TSidebarOptions;
    isSidebarCollapsed: boolean;

    // Theme state
    theme: 'light' | 'dark' | 'system';

    // Mobile view state
    isMobileMenuOpen: boolean;

    // Methods
    setActiveSidebarItem: (item: TSidebarOptions) => void;
    toggleSidebar: () => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    toggleMobileMenu: () => void;
    setMobileMenuOpen: (isOpen: boolean) => void;
}

export const useUIState = create<UIState>((set) => ({
    // Initial state
    activeSidebarItem: "FILES",
    isSidebarCollapsed: false,
    theme: 'dark',
    isMobileMenuOpen: false,

    // Methods
    setActiveSidebarItem: (item: TSidebarOptions) => set({ activeSidebarItem: item }),
    toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    setTheme: (theme) => set({ theme }),
    toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
    setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
})); 