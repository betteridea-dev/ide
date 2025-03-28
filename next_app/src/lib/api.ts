import { apiRequest, ErrorCodes, AppError } from './utils';
import { MsgHistory } from '@/hooks/useGlobalState';

// Base API endpoints
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Types
export interface ChatRequest {
    message: string;
    fileContext?: string;
    chat: Array<{ role: string, content: string }>;
    model: string;
}

export interface ChatMessage {
    role: string;
    content: string;
}

export interface ChatCompletionResponse {
    response: string;
    fileContext?: string;
    error?: string;
}

export interface AnalyticsData {
    total: AnalyticsMetrics;
    today: AnalyticsMetrics;
    yesterday: AnalyticsMetrics;
    thisweek: AnalyticsMetrics;
    lastweek: AnalyticsMetrics;
    thismonth: AnalyticsMetrics;
    lastmonth: AnalyticsMetrics;
}

export interface AnalyticsMetrics {
    loads: number;
    runs: number;
    users: number;
    apps: number;
    referrers: number;
}

export interface ReferrerData {
    referrer: string;
    count: number;
}

export interface SystemInfo {
    cpu: string | null;
    ram: string | null;
    disk: string | null;
    os: string | null;
}

// API services
export const ChatAPI = {
    async getCompletion(params: ChatRequest): Promise<ChatCompletionResponse> {
        return apiRequest<ChatCompletionResponse>(`${API_BASE}/chat`, {
            method: 'POST',
            body: JSON.stringify(params),
        });
    },
};

export const AnalyticsAPI = {
    async getAnalytics(): Promise<AnalyticsData> {
        return apiRequest<AnalyticsData>(`${API_BASE}/analytics`);
    },

    async getReferrers(): Promise<ReferrerData[]> {
        return apiRequest<ReferrerData[]>(`${API_BASE}/analytics/referrers`);
    },

    async logEvent(data: {
        action: "codecell_load" | "codecell_run";
        cellId: string;
        userId: string;
        appName: string;
        messageId?: string;
        referrer: string;
    }): Promise<void> {
        return apiRequest<void>(`${API_BASE}/analytics`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};

export const SystemAPI = {
    async getSystemInfo(): Promise<SystemInfo> {
        return apiRequest<SystemInfo>(`${API_BASE}/system`);
    },
}; 