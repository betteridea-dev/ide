export type TBody = {
    action: "codecell_load" | "codecell_run"
    cellId: string
    userId: string
    appName: string
    messageId?: string
    referrer: string
    geo?: {
        country?: string
        countryCode?: string
        region?: string
        regionName?: string
        city?: string
        zip?: string
        lat?: number
        lon?: number
        timezone?: string
        isp?: string
        org?: string
        as?: string
        query?: string
    }
}

export type ChatRequest = {
    message: string
    fileContext?: string
    chat: Array<{ role: string, content: string }>
    model: string
} 