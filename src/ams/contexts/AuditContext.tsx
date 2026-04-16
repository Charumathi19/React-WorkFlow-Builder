import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { getGlobalAudit as apiGetGlobalAudit } from '../services/audit.service';
import type { AuditEvent } from '../types';

// ─── Context Shape ───────────────────────────────────────────────────────────
interface AuditContextType {
    auditEvents: AuditEvent[];
    auditLoading: boolean;
    fetchGlobalAudit: (limit?: number) => Promise<void>;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────
export function AuditProvider({ children }: { children: ReactNode }) {
    const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
    const [auditLoading, setAuditLoading] = useState(false);

    const fetchGlobalAudit = useCallback(async (limit = 200) => {
        setAuditLoading(true);
        try {
            const data = await apiGetGlobalAudit(limit);
            setAuditEvents(data);
        } finally {
            setAuditLoading(false);
        }
    }, []);

    return (
        <AuditContext.Provider value={{ auditEvents, auditLoading, fetchGlobalAudit }}>
            {children}
        </AuditContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useAudit(): AuditContextType {
    const ctx = useContext(AuditContext);
    if (!ctx) throw new Error('useAudit must be used within <AuditProvider>');
    return ctx;
}
