// Hotkey configuration and utilities
// Cross-platform compatible shortcuts avoiding browser conflicts

import { HOTKEY_CONFIG } from './hotkey-config'

export interface HotkeyConfig {
    key: string
    description: string
    action: string
    category: string
    handler?: () => void
}

// Platform detection - more robust detection for Mac
const isMac = typeof navigator !== 'undefined' && (
    navigator.platform.toUpperCase().indexOf('MAC') >= 0 ||
    navigator.userAgent.toUpperCase().indexOf('MAC') >= 0 ||
    navigator.platform === 'MacIntel'
)

// Key mapping for cross-platform compatibility
export const getModifierKey = () => isMac ? '⌘' : 'Ctrl'
export const getAltKey = () => isMac ? '⌥' : 'Alt'
export const getShiftKey = () => '⇧'

// Convert simple config to display format
const convertKeyToDisplay = (key: string): string => {
    if (isMac) {
        return key
            .replace(/Ctrl/g, '⌘')
            .replace(/Alt/g, '⌥')
            .replace(/Shift/g, '⇧')
    }
    return key
}

// Build hotkeys from configuration
export const HOTKEYS: Record<string, HotkeyConfig> = {}

// Manual mapping to ensure correct key names
const ACTION_TO_KEY_MAP: Record<string, string> = {
    'newProject': 'NEW_PROJECT',
    'openProject': 'OPEN_PROJECT',
    'saveProject': 'SAVE_PROJECT',
    'closeProject': 'CLOSE_PROJECT',
    'importProject': 'IMPORT_PROJECT',
    'exportProject': 'EXPORT_PROJECT',
    'newFile': 'NEW_FILE',
    'renameFile': 'RENAME_FILE',
    'duplicateFile': 'DUPLICATE_FILE',
    'deleteFile': 'DELETE_FILE',
    'renameProject': 'RENAME_PROJECT',
    'duplicateProject': 'DUPLICATE_PROJECT',
    'shareProject': 'SHARE_PROJECT',
    'toggleSidebar': 'TOGGLE_SIDEBAR',
    'toggleTerminal': 'TOGGLE_TERMINAL',
    'openSettings': 'SETTINGS',
    'showShortcuts': 'SHOW_SHORTCUTS'
}

// Convert config array to keyed object
HOTKEY_CONFIG.forEach(config => {
    const key = ACTION_TO_KEY_MAP[config.action]
    if (key) {
        HOTKEYS[key] = {
            key: convertKeyToDisplay(config.key),
            description: config.description,
            action: config.action,
            category: config.category
        }
    }
})

// Create a mapping for parsing (using original key format)
const HOTKEY_PARSE_MAP: Record<string, string> = {}
HOTKEY_CONFIG.forEach(config => {
    HOTKEY_PARSE_MAP[config.action] = config.key
})

// Convert hotkey string to event key combination for matching
export const parseHotkey = (hotkey: string) => {
    const parts = hotkey.toLowerCase().split('+')
    const result = {
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        shiftKey: false,
        key: ''
    }

    parts.forEach(part => {
        const trimmed = part.trim()
        if (trimmed === 'ctrl') result.ctrlKey = true
        else if (trimmed === '⌘' || trimmed === 'cmd' || trimmed === 'meta') result.metaKey = true
        else if (trimmed === 'alt' || trimmed === '⌥') result.altKey = true
        else if (trimmed === 'shift' || trimmed === '⇧') result.shiftKey = true
        else result.key = trimmed
    })

    return result
}

// Check if event matches hotkey
export const matchesHotkey = (event: KeyboardEvent, hotkey: string): boolean => {
    const parsed = parseHotkey(hotkey)

    // Handle special keys
    let eventKey = event.key.toLowerCase()

    // Special handling for backtick/grave accent key
    // The backtick key can have different event.key values depending on keyboard layout
    // Sometimes event.key is empty string or other values, so we use event.code to detect it reliably
    if (event.code === 'Backquote' && parsed.key === '`') {
        eventKey = '`'
    }

    // On Mac, Option+key combinations generate special characters (e.g., Option+N = "ñ")
    // We need to use event.code instead of event.key for Alt combinations to get the physical key
    if (parsed.altKey && isMac) {
        // Convert event.code (like "KeyN") to the expected key ("n")
        if (event.code.startsWith('Key')) {
            eventKey = event.code.slice(3).toLowerCase() // "KeyN" -> "n"
        } else if (event.code.startsWith('Digit')) {
            eventKey = event.code.slice(5) // "Digit1" -> "1"
        }
    }

    // Cross-platform modifier key handling
    // When config says "Ctrl", it should match:
    // - metaKey (⌘) on Mac
    // - ctrlKey on Windows/Linux
    let expectedCtrlKey = parsed.ctrlKey
    let expectedMetaKey = parsed.metaKey

    if (isMac && parsed.ctrlKey) {
        // On Mac, "Ctrl" in config should trigger on metaKey (⌘)
        expectedMetaKey = true
        expectedCtrlKey = false
    }

    const matches = (
        event.ctrlKey === expectedCtrlKey &&
        event.metaKey === expectedMetaKey &&
        event.altKey === parsed.altKey &&
        event.shiftKey === parsed.shiftKey &&
        eventKey === parsed.key
    )

    // Debug logging for terminal toggle hotkey
    // if (hotkey === 'Ctrl+`' && (event.ctrlKey || event.metaKey)) {
    //     console.log('Terminal toggle hotkey debug:', {
    //         hotkey,
    //         parsed,
    //         eventKey,
    //         expectedCtrlKey,
    //         expectedMetaKey,
    //         event: {
    //             key: event.key,
    //             code: event.code,
    //             ctrlKey: event.ctrlKey,
    //             metaKey: event.metaKey,
    //             altKey: event.altKey,
    //             shiftKey: event.shiftKey
    //         },
    //         matches
    //     });
    // }

    return matches
}

// Get display string for hotkey (cross-platform)
export const getHotkeyDisplay = (hotkey: string): string => {
    if (isMac) {
        return hotkey
            .replace(/Ctrl/g, '⌘')
            .replace(/Alt/g, '⌥')
            .replace(/Shift/g, '⇧')
    } else {
        return hotkey
            .replace(/⌘/g, 'Ctrl')
            .replace(/⌥/g, 'Alt')
            .replace(/⇧/g, 'Shift')
    }
}

// Group hotkeys by category
export const getHotkeysByCategory = () => {
    const categories: Record<string, HotkeyConfig[]> = {}

    Object.values(HOTKEYS).forEach(hotkey => {
        if (!categories[hotkey.category]) {
            categories[hotkey.category] = []
        }
        categories[hotkey.category].push(hotkey)
    })

    return categories
}

// Debug function to test cross-platform compatibility
export const testPlatformCompatibility = () => {
    console.log('Platform Detection:')
    console.log('- isMac:', isMac)
    console.log('- navigator.platform:', navigator.platform)
    console.log('- navigator.userAgent:', navigator.userAgent)

    console.log('\nKey Display Examples:')
    console.log('- Ctrl+N displays as:', getHotkeyDisplay('Ctrl+N'))
    console.log('- Ctrl+Shift+P displays as:', getHotkeyDisplay('Ctrl+Shift+P'))
    console.log('- Alt+F displays as:', getHotkeyDisplay('Alt+F'))

    console.log('\nKey Parsing Examples:')
    console.log('- Ctrl+N parses as:', parseHotkey('Ctrl+N'))
    console.log('- Ctrl+Shift+P parses as:', parseHotkey('Ctrl+Shift+P'))
}
