import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { getAnalytics as apiGetAnalytics } from '../services/analytics.service';
import type { AnalyticsSummary } from '../types';

// ─── Context Shape ───────────────────────────────────────────────────────────
interface AnalyticsContextType {
    analytics: AnalyticsSummary | null;
    analyticsLoading: boolean;
    fetchAnalytics: () => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────
export function AnalyticsProvider({ children }: { children: ReactNode }) {
    const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    const fetchAnalytics = useCallback(async () => {
        setAnalyticsLoading(true);
        try {
            const data = await apiGetAnalytics();
            setAnalytics(data);
        } finally {
            setAnalyticsLoading(false);
        }
    }, []);

    return (
        <AnalyticsContext.Provider value={{ analytics, analyticsLoading, fetchAnalytics }}>
            {children}
        </AnalyticsContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useAnalytics(): AnalyticsContextType {
    const ctx = useContext(AnalyticsContext);
    if (!ctx) throw new Error('useAnalytics must be used within <AnalyticsProvider>');
    return ctx;
}
