// ─── Case ─────────────────────────────────────────────────────────────────────
export type CaseStatus =
    | 'SUBMITTED'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELLED';

export type Verdict = 'ADVERSE' | 'REQUIRES_REVIEW' | 'CLEARED';

export interface SubjectDetails {
    entity_type?: 'person' | 'organization';
    gender?: 'male' | 'female';
    date_of_birth?: string;
    nationality?: string;
    place_of_birth?: string;
    id_number?: string;
    address?: string;
    aliases?: string[];
}

export interface Case {
    case_id: string;
    entities: string[];
    languages: string[];
    status: CaseStatus;
    subject_details?: SubjectDetails;
    selected_domains?: string[] | null;
    selected_keywords?: string[] | null;
    created_at: string;
    updated_at?: string;
}

export interface CaseListItem {
    case_id: string;
    entities: string[];
    status: CaseStatus;
    languages: string[];
    created_at: string;
    updated_at?: string;
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────
export interface PipelineProgress {
    case_id: string;
    completed_modules: string[];
}

export interface PipelineStatus {
    case_id: string;
    status: CaseStatus;
}

// ─── Jurisdiction ─────────────────────────────────────────────────────────────
export interface Jurisdiction {
    jurisdiction_code: string;
    confidence: number;
    decision_method: string;
    source: string;
    is_primary: boolean;
}

// ─── Sanctions ────────────────────────────────────────────────────────────────
export interface SanctionHit {
    match_name: string;
    match_score: number;
    match_schema: string;
    datasets: string[];
    countries: string[];
    decision_method: string;
    match_detail: Record<string, unknown>;
}

// ─── Articles ─────────────────────────────────────────────────────────────────
export interface ArticleAnalysis {
    entity_role: string;
    relevance_verdict: Verdict;
    confidence: number;
    rationale: string;
    llm_model: string;
}

export interface Article {
    article_id?: string;
    title: string;
    url: string;
    domain: string;
    language: string;
    word_count: number;
    proximity_score: number;
    retrieval_status: string;
    review_status: string;
    searched_keywords: string[];
    analysis?: ArticleAnalysis;
}

// ─── Article Results (Risk Summary) ───────────────────────────────────────────
export interface RiskSummary {
    overall_risk_score: number;
    sentiment: string;
    escalation_required: boolean;
    summary_text: string;
}

export interface EntityValidation {
    entity_found: boolean;
    context_classification: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

export interface Classification {
    risk_category: string;
    confidence: number;
}

export interface ArticleResult {
    article_title: string;
    article_url: string;
    searched_keywords: string[];
    entity_validation: EntityValidation;
    classification: Classification;
    analysis: ArticleAnalysis;
}

export interface ArticleResults {
    risk_summary: RiskSummary;
    articles: ArticleResult[];
}

// ─── Audit ────────────────────────────────────────────────────────────────────
export interface AuditEvent {
    event_id: string;
    case_id?: string;
    module: string;
    event_type: string;
    actor: string;
    detail: Record<string, unknown>;
    model_version?: string;
    registry_version?: string;
    event_hash?: string;
    created_at: string;
}

// ─── Domain ───────────────────────────────────────────────────────────────────
export type DomainPurpose = 'whitelist' | 'filter' | 'search';
export type DomainCategory =
    | 'compliance'
    | 'global_media'
    | 'regional'
    | 'specialist';

export interface Domain {
    id?: string;
    domain: string;
    category: DomainCategory;
    tier: 1 | 2 | 3;
    region?: string | null;
    sector?: string | null;
    active: boolean;
    purpose: DomainPurpose;
    entity_types: string[];
}

// ─── Keyword ──────────────────────────────────────────────────────────────────
export type KeywordPurpose = 'general' | 'site_query';

export interface Keyword {
    id?: string;
    keyword_en: string;
    category?: string | null;
    active: boolean;
    purpose: KeywordPurpose;
    entity_types: string[];
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export interface AnalyticsSummary {
    verdict_distribution: {
        ADVERSE: number;
        REQUIRES_REVIEW: number;
        CLEARED: number;
    };
    top_domains: Array<{ domain: string; count: number }>;
    total_articles: number;
    total_analyses: number;
    unique_sources: number;
}

// ─── Health ───────────────────────────────────────────────────────────────────
export interface ServiceHealth {
    status: 'online' | 'offline' | 'degraded' | 'not_configured';
}

export interface HealthDetailed {
    status: string;
    database: ServiceHealth;
    search_engine: ServiceHealth;
    llm_provider: ServiceHealth;
}

// ─── New Case Form ─────────────────────────────────────────────────────────────
export interface NewCasePayload {
    entities: string[];
    languages: string[];
    subject_details?: SubjectDetails;
    selected_domains?: string[] | null;
    selected_keywords?: string[] | null;
}
