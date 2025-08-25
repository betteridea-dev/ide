// Simple hotkey configuration file
// Edit this file to customize keyboard shortcuts

export interface SimpleHotkeyConfig {
    action: string
    key: string
    description: string
    category: string
}

// Simple list of all hotkeys - edit the 'key' field to change shortcuts
export const HOTKEY_CONFIG: SimpleHotkeyConfig[] = [
    // File operations
    {
        action: 'saveProject',
        key: 'Ctrl+S',  // Will show as ⌘+Shift+P on Mac
        description: 'Save current project',
        category: 'File'
    },
    {
        action: 'newProject',
        key: 'Alt+Shift+N',  // Will show as ⌘+Shift+P on Mac
        description: 'Create new project',
        category: 'File'
    },
    {
        action: 'openProject',
        key: 'Ctrl+Shift+O',  // Will show as ⌘+Shift+O on Mac
        description: 'Open project browser',
        category: 'File'
    },
    {
        action: 'closeProject',
        key: 'Alt+W',  // Will show as ⌥+W on Mac
        description: 'Close current project',
        category: 'File'
    },
    {
        action: 'importProject',
        key: 'Ctrl+Shift+I',  // Will show as ⌘+I on Mac
        description: 'Import project',
        category: 'File'
    },
    {
        action: 'exportProject',
        key: 'Ctrl+Shift+E',  // Will show as ⌘+E on Mac
        description: 'Export project',
        category: 'File'
    },

    // Edit operations
    {
        action: 'newFile',
        key: 'Alt+N',  // Will show as ⌥+N on Mac
        description: 'Create new file',
        category: 'Edit'
    },
    {
        action: 'renameFile',
        key: 'F2',
        description: 'Rename selected file',
        category: 'Edit'
    },
    {
        action: 'duplicateFile',
        key: 'Ctrl+Shift+D',  // Will show as ⌘+Shift+D on Mac
        description: 'Duplicate selected file',
        category: 'Edit'
    },
    {
        action: 'deleteFile',
        key: 'Delete',
        description: 'Delete selected file',
        category: 'Edit'
    },

    // Project operations
    {
        action: 'renameProject',
        key: 'Shift+F2',  // Will show as ⌘+R on Mac
        description: 'Rename current project',
        category: 'Project'
    },

    // View operations
    {
        action: 'toggleTerminal',
        key: 'Ctrl+`',  // Will show as ⌘+` on Mac
        description: 'Toggle terminal',
        category: 'View'
    },
    {
        action: 'openSettings',
        key: 'Ctrl+,',  // Will show as ⌘+, on Mac
        description: 'Open settings',
        category: 'View'
    },

    // Help
    {
        action: 'showShortcuts',
        key: 'Ctrl+K',  // Will show as ⌘+/ on Mac
        description: 'Show keyboard shortcuts',
        category: 'Help'
    }
]

// Instructions for customizing shortcuts:
// 
// 1. Edit the 'key' field for any shortcut you want to change
// 2. Use 'Ctrl' for the main modifier key (automatically converts to ⌘ on Mac)
// 3. Use 'Alt' for the alt/option key (automatically converts to ⌥ on Mac)  
// 4. Use 'Shift' for the shift key
// 5. Combine with '+' like: 'Ctrl+Shift+N'
// 6. Special keys: F1-F12, Delete, Backspace, Enter, Space, Tab, Escape
// 7. Letter keys: A-Z (case insensitive)
// 8. Number keys: 0-9
//
// Cross-Platform Behavior:
// - 'Ctrl+N' will trigger on Ctrl+N on Windows/Linux and ⌘+N on Mac
// - 'Alt+F' will trigger on Alt+F on Windows/Linux and ⌥+F on Mac
// - The display automatically shows the correct symbols for each platform
//
// Examples:
// - 'Ctrl+N' → Creates new file
// - 'F2' → Renames file  
// - 'Ctrl+Shift+P' → Creates new project
// - 'Alt+F4' → Custom action (if you add the handler)
//
// Avoid these combinations as they conflict with browsers:
// - Ctrl+T, Ctrl+W, Ctrl+R, Ctrl+N, Ctrl+Shift+N (browser tabs)
// - Ctrl+L, Ctrl+K (browser address bar)
// - Ctrl+F, Ctrl+G (browser find)
// - Ctrl+P (browser print)
// - Ctrl+S (browser save)
// - F5, Ctrl+F5 (browser refresh)
// - F11 (browser fullscreen)
// - F12 (browser dev tools)
