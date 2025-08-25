import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [isInstallable, setIsInstallable] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        // Check if app is already installed
        const checkIfInstalled = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            const isInWebAppiOS = (window.navigator as any).standalone === true
            setIsInstalled(isStandalone || isInWebAppiOS)
        }

        checkIfInstalled()

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            const promptEvent = e as BeforeInstallPromptEvent
            setDeferredPrompt(promptEvent)
            setIsInstallable(true)
        }

        // Listen for app installed event
        const handleAppInstalled = () => {
            setIsInstalled(true)
            setIsInstallable(false)
            setDeferredPrompt(null)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [])

    const installApp = async (): Promise<boolean> => {
        if (!deferredPrompt) {
            return false
        }

        try {
            await deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice

            if (outcome === 'accepted') {
                setDeferredPrompt(null)
                setIsInstallable(false)
                return true
            }

            return false
        } catch (error) {
            console.error('Error installing PWA:', error)
            return false
        }
    }

    const openInstalledApp = () => {
        // If we're already in standalone mode, we're in the installed app
        if (isInstalled) {
            // Try to focus the current window or open a new instance
            if (window.focus) {
                window.focus()
            }
            return true
        }

        // If not in standalone mode but app is installed, try to open it
        // This works by opening the start_url in a new window/tab
        // The browser should recognize it as the installed PWA
        try {
            const startUrl = window.location.origin + '/'
            window.open(startUrl, '_blank')
            return true
        } catch (error) {
            console.error('Error opening installed app:', error)
            return false
        }
    }

    return {
        isInstallable,
        isInstalled,
        installApp,
        openInstalledApp,
        canInstall: isInstallable && !isInstalled,
        canOpen: isInstalled || (!isInstallable && !isInstalled) // Can open if installed or if install not available (likely already installed)
    }
}
