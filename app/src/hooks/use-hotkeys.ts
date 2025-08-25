import { useEffect, useCallback, useRef } from 'react'
import { HOTKEYS, matchesHotkey, type HotkeyConfig } from '@/lib/hotkeys'
import { HOTKEY_CONFIG } from '@/lib/hotkey-config'

export interface HotkeyHandler {
    [action: string]: () => void
}

export const useHotkeys = (handlers: HotkeyHandler, enabled = true) => {
    const handlersRef = useRef(handlers)

    // Update handlers ref when handlers change
    useEffect(() => {
        handlersRef.current = handlers
    }, [handlers])

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (!enabled) return

        // Don't trigger hotkeys when typing in inputs, textareas, or contenteditable elements
        const target = event.target as HTMLElement
        if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.contentEditable === 'true' ||
            target.closest('[contenteditable="true"]')
        ) {
            return
        }

        // Check each hotkey for a match using original key format
        for (const config of HOTKEY_CONFIG) {
            if (matchesHotkey(event, config.key)) {
                const handler = handlersRef.current[config.action]
                if (handler) {
                    event.preventDefault()
                    event.stopPropagation()
                    handler()
                    return
                }
            }
        }
    }, [enabled])

    useEffect(() => {
        if (enabled) {
            document.addEventListener('keydown', handleKeyDown, { capture: true })
            return () => {
                document.removeEventListener('keydown', handleKeyDown, { capture: true })
            }
        }
    }, [handleKeyDown, enabled])
}

// Hook specifically for global app hotkeys
export const useGlobalHotkeys = (handlers: HotkeyHandler) => {
    useHotkeys(handlers, true)
}

// Get all available hotkeys
export const getAvailableHotkeys = (): HotkeyConfig[] => {
    return Object.values(HOTKEYS)
}
