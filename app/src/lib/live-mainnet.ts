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
        hbUrl = "https://hb.arweave.tech",
        gatewayUrl = "https://arweave.tech",
        intervalMs = 2000,
        onResult,
        hasShownSlot,
        markSlotAsShown
    } = options

    let lastSlot: number | undefined = options.lastKnownSlot
    let isRunning = true
    let consecutiveErrors = 0
    const maxConsecutiveErrors = 3

    const ao = new MainnetAO({
        HB_URL: hbUrl,
        GATEWAY_URL: gatewayUrl
    })

    const checkForUpdates = async () => {
        if (!isRunning) return

        try {
            // Get the current slot
            const currentSlotPath = `/${processId}/slot/current`
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

            type resultBody = {
                info: string
                outbox: Record<string, any>[]
                output: {
                    data: string
                    print?: string
                    prompt: string
                }
                status: string
            }

            // Fetch computation results for the slot
            const resultsPath = `/${processId}/compute&slot=${slotToCheck}/results`
            const results = await ao.read<{ body: resultBody }>({ path: resultsPath })

            // Check if results have print output
            const hasPrint = !!(results?.body?.output?.print)

            let output: string | undefined
            let error: string | undefined
            let hasNewData = false

            if (results && hasPrint) {
                if (isExecutionError(results.body)) {
                    error = parseOutput(results.body)
                    output = results?.body?.output?.data
                } else {
                    output = parseOutput(results?.body?.output?.data)
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

            // Reset consecutive errors on successful execution
            consecutiveErrors = 0

        } catch (error) {
            consecutiveErrors++
            // Error in live monitoring

            // Stop monitoring if we've hit the maximum consecutive errors
            if (consecutiveErrors >= maxConsecutiveErrors) {
                // Live monitoring stopped for process
                // Maximum consecutive errors reached. Stopping live monitoring
                isRunning = false
                return
            }
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
