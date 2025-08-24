import { MainnetAO } from './ao'
import { parseOutput, isExecutionError } from './utils'

interface LiveResult {
    slot: number
    output?: string
    error?: string
    hasNewData: boolean
    hasPrint: boolean
}

/**
 * Monitor a process for new computation results and handle them
 * @param processId - The AO process ID to monitor
 * @param options - Configuration options
 * @returns Function to stop monitoring
 */
export function startLiveMonitoring(
    processId: string,
    options: {
        hbUrl?: string
        gatewayUrl?: string
        intervalMs?: number
        onResult?: (result: LiveResult) => void
        lastKnownSlot?: number
        hasShownSlot?: (slot: number) => boolean
        markSlotAsShown?: (slot: number) => void
    } = {}
): () => void {
    const {
        hbUrl = "https://hb.betteridea.dev",
        gatewayUrl = "https://arweave.net",
        intervalMs = 2000,
        onResult,
        hasShownSlot,
        markSlotAsShown
    } = options

    let lastSlot: number | undefined = options.lastKnownSlot
    let isRunning = true

    const ao = new MainnetAO({
        HB_URL: hbUrl,
        GATEWAY_URL: gatewayUrl
    })

    const checkForUpdates = async () => {
        if (!isRunning) return

        try {
            // Get the current slot
            const currentSlotPath = `/${processId}~process@1.0/slot/current/body`
            const currentSlot = await ao.read<{ body: number }>({ path: currentSlotPath })
            const currentSlotNumber = currentSlot.body

            // Determine which slot to check
            const slotToCheck = lastSlot ? lastSlot + 1 : currentSlotNumber

            // If we're already at the latest slot, no new data
            if (slotToCheck > currentSlotNumber) {
                // Schedule next check
                if (isRunning) {
                    setTimeout(checkForUpdates, intervalMs)
                }
                return
            }

            // Check if this slot has already been shown to avoid duplicates
            if (hasShownSlot && hasShownSlot(slotToCheck)) {
                // Update lastSlot and continue to next slot
                lastSlot = slotToCheck
                if (isRunning) {
                    setTimeout(checkForUpdates, intervalMs)
                }
                return
            }

            // Fetch computation results for the slot
            const resultsPath = `/${processId}~process@1.0/compute&slot=${slotToCheck}/results`
            const results = await ao.read<any>({ path: resultsPath })

            // Check if results have print output
            const hasPrint = !!(results?.output?.print)

            let output: string | undefined
            let error: string | undefined
            let hasNewData = false

            if (results && hasPrint) {
                if (isExecutionError(results)) {
                    error = parseOutput(results)
                    output = results.output.data
                } else {
                    output = parseOutput(results)
                }
                hasNewData = !!(output || error)
            }

            const result: LiveResult = {
                slot: slotToCheck,
                output,
                error,
                hasNewData,
                hasPrint
            }

            // Update last slot regardless of whether there's new data
            lastSlot = slotToCheck

            // Only call handler and log if there's new data with print output
            if (hasNewData && hasPrint) {
                // Mark this slot as shown to prevent duplicates
                if (markSlotAsShown) {
                    markSlotAsShown(slotToCheck)
                }

                // Call custom handler if provided
                if (onResult) {
                    onResult(result)
                }
            }

        } catch (error) {
            console.error('Error in live monitoring:', error)
        }

        // Schedule next check
        if (isRunning) {
            setTimeout(checkForUpdates, intervalMs)
        }
    }

    // Start monitoring
    checkForUpdates()

    // Return stop function
    return () => {
        isRunning = false
    }
}
