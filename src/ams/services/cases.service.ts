import { apiCaller, API_BASE_URL } from './api-caller';
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
    NewCasePayload,
} from '../types';

// ─── Cases ────────────────────────────────────────────────────────────────────
export const getCases = (limit = 100) =>
    apiCaller.get<CaseListItem[]>('/api/v1/cases', { params: { limit } }).then((r) => r.data);

export const getCase = (caseId: string) =>
    apiCaller.get<Case>(`/api/v1/cases/${caseId}`).then((r) => r.data);

export const createCase = (payload: NewCasePayload) =>
    apiCaller.post<{ case_id: string }>('/api/v1/cases', payload).then((r) => r.data);

export const runCase = (caseId: string) =>
    apiCaller.post(`/api/v1/cases/${caseId}/run`).then((r) => r.data);

export const rerunCase = (caseId: string) =>
    apiCaller.post(`/api/v1/cases/${caseId}/rerun`).then((r) => r.data);

export const cancelCase = (caseId: string) =>
    apiCaller.post(`/api/v1/cases/${caseId}/cancel`).then((r) => r.data);

// ─── Pipeline / Status ────────────────────────────────────────────────────────
export const getCaseStatus = (caseId: string) =>
    apiCaller.get<PipelineStatus>(`/api/v1/cases/${caseId}/status`).then((r) => r.data);

export const getPipelineProgress = (caseId: string) =>
    apiCaller
        .get<PipelineProgress>(`/api/v1/cases/${caseId}/pipeline-progress`)
        .then((r) => r.data);

// ─── Jurisdiction ─────────────────────────────────────────────────────────────
export const getJurisdictions = (caseId: string) =>
    apiCaller.get<Jurisdiction[]>(`/api/v1/cases/${caseId}/jurisdiction`).then((r) => r.data);

// ─── Sanctions ────────────────────────────────────────────────────────────────
export const getSanctions = (caseId: string) =>
    apiCaller.get<SanctionHit[]>(`/api/v1/cases/${caseId}/sanctions`).then((r) => r.data);

// ─── Articles ─────────────────────────────────────────────────────────────────
export const getArticles = (caseId: string) =>
    apiCaller.get<Article[]>(`/api/v1/cases/${caseId}/articles`).then((r) => r.data);

export const getArticleResults = (caseId: string) =>
    apiCaller.get<ArticleResults>(`/api/v1/cases/${caseId}/article-results`).then((r) => r.data);

// ─── Audit ────────────────────────────────────────────────────────────────────
export const getCaseAudit = (caseId: string, module?: string) =>
    apiCaller
        .get<AuditEvent[]>(`/api/v1/cases/${caseId}/audit`, {
            params: module ? { module } : undefined,
        })
        .then((r) => r.data);

// ─── Report ───────────────────────────────────────────────────────────────────
export const generateReport = (caseId: string) =>
    apiCaller.post(`/api/v1/cases/${caseId}/report`).then((r) => r.data);

export const downloadReportUrl = (caseId: string) =>
    `${API_BASE_URL}/api/v1/cases/${caseId}/report/download`;
