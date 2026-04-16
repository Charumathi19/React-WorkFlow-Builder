import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
    getCases,
    getCase,
    createCase as apiCreateCase,
    runCase as apiRunCase,
    rerunCase as apiRerunCase,
    cancelCase as apiCancelCase,
    getCaseStatus,
    getPipelineProgress,
    getJurisdictions,
    getSanctions,
    getArticles,
    getArticleResults,
    getCaseAudit,
    generateReport,
    downloadReportUrl as apiDownloadReportUrl,
} from '../services/cases.service';
import type {
    CaseListItem,
    Case,
    PipelineProgress,
    PipelineStatus,
    Jurisdiction,
    SanctionHit,
    Article,
    ArticleResults,
    AuditEvent,
    NewCasePayload,
} from '../types';

// ─── Context Shape ───────────────────────────────────────────────────────────
interface CasesContextType {
    // State
    cases: CaseListItem[];
    casesLoading: boolean;
    // Cases list
    fetchCases: (limit?: number) => Promise<void>;
    rerunCase: (caseId: string) => Promise<void>;
    cancelCase: (caseId: string) => Promise<void>;
    // Case creation
    createCase: (payload: NewCasePayload) => Promise<string>;
    runCase: (caseId: string) => Promise<void>;
    // Case detail
    fetchCase: (caseId: string) => Promise<Case>;
    fetchCaseStatus: (caseId: string) => Promise<PipelineStatus>;
    fetchPipelineProgress: (caseId: string) => Promise<PipelineProgress>;
    fetchJurisdictions: (caseId: string) => Promise<Jurisdiction[]>;
    fetchSanctions: (caseId: string) => Promise<SanctionHit[]>;
    fetchArticles: (caseId: string) => Promise<Article[]>;
    fetchArticleResults: (caseId: string) => Promise<ArticleResults>;
    fetchCaseAudit: (caseId: string, module?: string) => Promise<AuditEvent[]>;
    // Reports
    genReport: (caseId: string) => Promise<void>;
    downloadReportUrl: (caseId: string) => string;
}

const CasesContext = createContext<CasesContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────
export function CasesProvider({ children }: { children: ReactNode }) {
    const [cases, setCases] = useState<CaseListItem[]>([]);
    const [casesLoading, setCasesLoading] = useState(false);

    const fetchCases = useCallback(async (limit = 100) => {
        setCasesLoading(true);
        try {
            const data = await getCases(limit);
            setCases(data);
        } finally {
            setCasesLoading(false);
        }
    }, []);

    const rerunCase = useCallback(async (caseId: string) => {
        await apiRerunCase(caseId);
    }, []);

    const cancelCase = useCallback(async (caseId: string) => {
        await apiCancelCase(caseId);
    }, []);

    const createCase = useCallback(async (payload: NewCasePayload): Promise<string> => {
        const result = await apiCreateCase(payload);
        return result.case_id;
    }, []);

    const runCase = useCallback(async (caseId: string) => {
        await apiRunCase(caseId);
    }, []);

    const fetchCase = useCallback(async (caseId: string): Promise<Case> => {
        return getCase(caseId);
    }, []);

    const fetchCaseStatus = useCallback(async (caseId: string): Promise<PipelineStatus> => {
        return getCaseStatus(caseId);
    }, []);

    const fetchPipelineProgress = useCallback(async (caseId: string): Promise<PipelineProgress> => {
        return getPipelineProgress(caseId);
    }, []);

    const fetchJurisdictions = useCallback(async (caseId: string): Promise<Jurisdiction[]> => {
        return getJurisdictions(caseId);
    }, []);

    const fetchSanctions = useCallback(async (caseId: string): Promise<SanctionHit[]> => {
        return getSanctions(caseId);
    }, []);

    const fetchArticles = useCallback(async (caseId: string): Promise<Article[]> => {
        return getArticles(caseId);
    }, []);

    const fetchArticleResults = useCallback(async (caseId: string): Promise<ArticleResults> => {
        return getArticleResults(caseId);
    }, []);

    const fetchCaseAudit = useCallback(
        async (caseId: string, module?: string): Promise<AuditEvent[]> => {
            return getCaseAudit(caseId, module);
        },
        [],
    );

    const genReport = useCallback(async (caseId: string) => {
        await generateReport(caseId);
    }, []);

    const downloadReportUrl = useCallback(
        (caseId: string): string => apiDownloadReportUrl(caseId),
        [],
    );

    return (
        <CasesContext.Provider
            value={{
                cases,
                casesLoading,
                fetchCases,
                rerunCase,
                cancelCase,
                createCase,
                runCase,
                fetchCase,
                fetchCaseStatus,
                fetchPipelineProgress,
                fetchJurisdictions,
                fetchSanctions,
                fetchArticles,
                fetchArticleResults,
                fetchCaseAudit,
                genReport,
                downloadReportUrl,
            }}
        >
            {children}
        </CasesContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useCases(): CasesContextType {
    const ctx = useContext(CasesContext);
    if (!ctx) throw new Error('useCases must be used within <CasesProvider>');
    return ctx;
}
