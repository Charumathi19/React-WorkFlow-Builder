import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
    getKeywords as apiGetKeywords,
    createKeyword as apiCreateKeyword,
    updateKeyword as apiUpdateKeyword,
    toggleKeyword as apiToggleKeyword,
    deleteKeyword as apiDeleteKeyword,
} from '../services/keywords.service';
import type { Keyword } from '../types';

// ─── Context Shape ───────────────────────────────────────────────────────────
interface KeywordsContextType {
    keywords: Keyword[];
    keywordsLoading: boolean;
    fetchKeywords: () => Promise<void>;
    addKeyword: (payload: Partial<Keyword>) => Promise<void>;
    editKeyword: (id: string, payload: Partial<Keyword>) => Promise<void>;
    toggleKeyword: (id: string) => Promise<void>;
    removeKeyword: (id: string) => Promise<void>;
}

const KeywordsContext = createContext<KeywordsContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────
export function KeywordsProvider({ children }: { children: ReactNode }) {
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [keywordsLoading, setKeywordsLoading] = useState(false);

    const fetchKeywords = useCallback(async () => {
        setKeywordsLoading(true);
        try {
            const data = await apiGetKeywords();
            setKeywords(data);
        } finally {
            setKeywordsLoading(false);
        }
    }, []);

    const addKeyword = useCallback(async (payload: Partial<Keyword>) => {
        await apiCreateKeyword(payload);
        const data = await apiGetKeywords();
        setKeywords(data);
    }, []);

    const editKeyword = useCallback(async (id: string, payload: Partial<Keyword>) => {
        await apiUpdateKeyword(id, payload);
        const data = await apiGetKeywords();
        setKeywords(data);
    }, []);

    const toggleKeyword = useCallback(async (id: string) => {
        await apiToggleKeyword(id);
        const data = await apiGetKeywords();
        setKeywords(data);
    }, []);

    const removeKeyword = useCallback(async (id: string) => {
        await apiDeleteKeyword(id);
        const data = await apiGetKeywords();
        setKeywords(data);
    }, []);

    return (
        <KeywordsContext.Provider
            value={{
                keywords,
                keywordsLoading,
                fetchKeywords,
                addKeyword,
                editKeyword,
                toggleKeyword,
                removeKeyword,
            }}
        >
            {children}
        </KeywordsContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useKeywords(): KeywordsContextType {
    const ctx = useContext(KeywordsContext);
    if (!ctx) throw new Error('useKeywords must be used within <KeywordsProvider>');
    return ctx;
}
