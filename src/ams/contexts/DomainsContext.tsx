import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
    getDomains as apiGetDomains,
    createDomain as apiCreateDomain,
    updateDomain as apiUpdateDomain,
    toggleDomain as apiToggleDomain,
    deleteDomain as apiDeleteDomain,
    getEntityTypes as apiGetEntityTypes,
} from '../services/domains.service';
import type { Domain } from '../types';

// ─── Context Shape ───────────────────────────────────────────────────────────
interface DomainsContextType {
    domains: Domain[];
    entityTypes: string[];
    domainsLoading: boolean;
    fetchDomains: () => Promise<void>;
    fetchEntityTypes: () => Promise<void>;
    addDomain: (payload: Partial<Domain>) => Promise<void>;
    editDomain: (id: string, payload: Partial<Domain>) => Promise<void>;
    toggleDomain: (id: string) => Promise<void>;
    removeDomain: (id: string) => Promise<void>;
}

const DomainsContext = createContext<DomainsContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────
export function DomainsProvider({ children }: { children: ReactNode }) {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [entityTypes, setEntityTypes] = useState<string[]>(['person', 'organisation', 'fund']);
    const [domainsLoading, setDomainsLoading] = useState(false);

    const fetchDomains = useCallback(async () => {
        setDomainsLoading(true);
        try {
            const data = await apiGetDomains();
            setDomains(data);
        } finally {
            setDomainsLoading(false);
        }
    }, []);

    const fetchEntityTypes = useCallback(async () => {
        try {
            const data = await apiGetEntityTypes();
            setEntityTypes(data);
        } catch {
            // keep defaults
        }
    }, []);

    const addDomain = useCallback(async (payload: Partial<Domain>) => {
        await apiCreateDomain(payload);
        const data = await apiGetDomains();
        setDomains(data);
    }, []);

    const editDomain = useCallback(async (id: string, payload: Partial<Domain>) => {
        await apiUpdateDomain(id, payload);
        const data = await apiGetDomains();
        setDomains(data);
    }, []);

    const toggleDomain = useCallback(async (id: string) => {
        await apiToggleDomain(id);
        const data = await apiGetDomains();
        setDomains(data);
    }, []);

    const removeDomain = useCallback(async (id: string) => {
        await apiDeleteDomain(id);
        const data = await apiGetDomains();
        setDomains(data);
    }, []);

    return (
        <DomainsContext.Provider
            value={{
                domains,
                entityTypes,
                domainsLoading,
                fetchDomains,
                fetchEntityTypes,
                addDomain,
                editDomain,
                toggleDomain,
                removeDomain,
            }}
        >
            {children}
        </DomainsContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useDomains(): DomainsContextType {
    const ctx = useContext(DomainsContext);
    if (!ctx) throw new Error('useDomains must be used within <DomainsProvider>');
    return ctx;
}
