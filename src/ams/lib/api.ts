import axios from 'axios';
import type {
    Case,
    CaseListItem,
    PipelineProgress,
    PipelineStatus,
    Jurisdiction,
    SanctionHit,
    Article,
    ArticleResults,
    AuditEvent,
    Domain,
    Keyword,
    AnalyticsSummary,
    HealthDetailed,
    NewCasePayload,
} from '../types';

const BASE_URL =
    (import.meta as unknown as { env: Record<string, string> }).env
        .VITE_API_BASE_URL ?? 'http://localhost:8000';

export const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30_000,
    headers: { 'Content-Type': 'application/json' },
});

// ─── Health ───────────────────────────────────────────────────────────────────
export const getHealth = () =>
    api.get<HealthDetailed>('/health/detailed').then((r) => r.data);

export const getSanctionsHealth = () =>
    api.get('/api/v1/sanctions/health').then((r) => r.data);

// ─── Cases ────────────────────────────────────────────────────────────────────
export const getCases = (limit = 100) =>
    api
        .get<CaseListItem[]>('/api/v1/cases', { params: { limit } })
        .then((r) => r.data);

export const getCase = (caseId: string) =>
    api.get<Case>(`/api/v1/cases/${caseId}`).then((r) => r.data);

export const createCase = (payload: NewCasePayload) =>
    api.post<{ case_id: string }>('/api/v1/cases', payload).then((r) => r.data);

export const runCase = (caseId: string) =>
    api.post(`/api/v1/cases/${caseId}/run`).then((r) => r.data);

export const rerunCase = (caseId: string) =>
    api.post(`/api/v1/cases/${caseId}/rerun`).then((r) => r.data);

export const cancelCase = (caseId: string) =>
    api.post(`/api/v1/cases/${caseId}/cancel`).then((r) => r.data);

// ─── Pipeline ─────────────────────────────────────────────────────────────────
export const getCaseStatus = (caseId: string) =>
    api
        .get<PipelineStatus>(`/api/v1/cases/${caseId}/status`)
        .then((r) => r.data);

export const getPipelineProgress = (caseId: string) =>
    api
        .get<PipelineProgress>(`/api/v1/cases/${caseId}/pipeline-progress`)
        .then((r) => r.data);

// ─── Jurisdiction ─────────────────────────────────────────────────────────────
export const getJurisdictions = (caseId: string) =>
    api
        .get<Jurisdiction[]>(`/api/v1/cases/${caseId}/jurisdiction`)
        .then((r) => r.data);

// ─── Sanctions ────────────────────────────────────────────────────────────────
export const getSanctions = (caseId: string) =>
    api
        .get<SanctionHit[]>(`/api/v1/cases/${caseId}/sanctions`)
        .then((r) => r.data);

// ─── Articles ─────────────────────────────────────────────────────────────────
export const getArticles = (caseId: string) =>
    api
        .get<Article[]>(`/api/v1/cases/${caseId}/articles`)
        .then((r) => r.data);

export const getArticleResults = (caseId: string) =>
    api
        .get<ArticleResults>(`/api/v1/cases/${caseId}/article-results`)
        .then((r) => r.data);

// ─── Audit ────────────────────────────────────────────────────────────────────
export const getCaseAudit = (caseId: string, module?: string) =>
    api
        .get<AuditEvent[]>(`/api/v1/cases/${caseId}/audit`, {
            params: module ? { module } : undefined,
        })
        .then((r) => r.data);

export const getGlobalAudit = (limit = 50) =>
    api
        .get<AuditEvent[]>('/api/v1/audit/recent', { params: { limit } })
        .then((r) => r.data);

// ─── Report ───────────────────────────────────────────────────────────────────
export const generateReport = (caseId: string) =>
    api.post(`/api/v1/cases/${caseId}/report`).then((r) => r.data);

export const downloadReportUrl = (caseId: string) =>
    `${BASE_URL}/api/v1/cases/${caseId}/report/download`;

// ─── Domains ──────────────────────────────────────────────────────────────────
export const getDomains = () =>
    api.get<Domain[]>('/api/v1/domains').then((r) => r.data);

export const createDomain = (payload: Partial<Domain>) =>
    api.post<Domain>('/api/v1/domains', payload).then((r) => r.data);

export const updateDomain = (id: string, payload: Partial<Domain>) =>
    api.patch<Domain>(`/api/v1/domains/${id}`, payload).then((r) => r.data);

export const toggleDomain = (id: string) =>
    api.patch(`/api/v1/domains/${id}/toggle`).then((r) => r.data);

export const deleteDomain = (id: string) =>
    api.delete(`/api/v1/domains/${id}`).then((r) => r.data);

export const getEntityTypes = () =>
    api.get<string[]>('/api/v1/entity-types').then((r) => r.data);

// ─── Keywords ─────────────────────────────────────────────────────────────────
export const getKeywords = () =>
    api.get<Keyword[]>('/api/v1/keywords').then((r) => r.data);

export const createKeyword = (payload: Partial<Keyword>) =>
    api.post<Keyword>('/api/v1/keywords', payload).then((r) => r.data);

export const updateKeyword = (id: string, payload: Partial<Keyword>) =>
    api.patch<Keyword>(`/api/v1/keywords/${id}`, payload).then((r) => r.data);

export const toggleKeyword = (id: string) =>
    api.patch(`/api/v1/keywords/${id}/toggle`).then((r) => r.data);

export const deleteKeyword = (id: string) =>
    api.delete(`/api/v1/keywords/${id}`).then((r) => r.data);

// ─── Analytics ────────────────────────────────────────────────────────────────
export const getAnalytics = () =>
    api.get<AnalyticsSummary>('/api/v1/analytics/summary').then((r) => r.data);
