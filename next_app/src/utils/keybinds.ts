import { useGlobalState } from '@/hooks'
import { KeyboardEvent, useEffect } from 'react'

export type Shortcut = {
    code: string,
    metaKey?: boolean,
    altKey?: boolean,
    shiftKey?: boolean,
    ctrlKey?: boolean,
    callback: () => void
}

export function useKeyBinds() {
    const { setIsAiPanelOpen, isAiPanelOpen } = useGlobalState()

    const shortcuts: { [key: string]: Shortcut } = {
        "open-ai-panel": {
            code: "KeyB",
            metaKey: true,
            altKey: true,
            callback: () => {
                setIsAiPanelOpen(!isAiPanelOpen)
            }
        }
    }

    function setupKeyBinds() {
        function onKeyDown(e: globalThis.KeyboardEvent) {

            const shortcut = Object.values(shortcuts).find(shortcut =>
                shortcut.code === e.code &&
                shortcut.metaKey === e.metaKey &&
                shortcut.altKey === e.altKey
            )

            if (shortcut) {
                e.preventDefault()
                console.log("shortcut found", shortcut)
                shortcut.callback()
            }
        }

        document.addEventListener("keydown", onKeyDown)

        return () => {
            document.removeEventListener("keydown", onKeyDown)
        }
    }

    useEffect(() => {
        return setupKeyBinds()
    }, [isAiPanelOpen])
}