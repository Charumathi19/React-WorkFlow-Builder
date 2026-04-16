import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, FileText, Download } from 'lucide-react';
import { useCases } from '../contexts/CasesContext';
import { usePolling } from '../hooks/usePolling';
import StatusBadge from '../components/ui/StatusBadge';
import {
    PipelineTab,
    JurisdictionsTab,
    SanctionsTab,
    ArticlesTab,
    RiskSummaryTab,
    AuditTrailTab,
} from '../components/ui/CaseDetailUI';
import type {
    Case, PipelineProgress, PipelineStatus,
    Jurisdiction, SanctionHit, Article, ArticleResults, AuditEvent,
} from '../types';

type Tab = 'pipeline' | 'jurisdiction' | 'sanctions' | 'articles' | 'risk' | 'audit';
const TABS: { key: Tab; label: string }[] = [
    { key: 'pipeline', label: 'Pipeline' },
    { key: 'jurisdiction', label: 'Jurisdictions' },
    { key: 'sanctions', label: 'Sanctions' },
    { key: 'articles', label: 'Articles' },
    { key: 'risk', label: 'Risk Summary' },
    { key: 'audit', label: 'Audit Trail' },
];

export default function CaseDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        fetchCase, fetchCaseStatus, fetchPipelineProgress,
        fetchJurisdictions, fetchSanctions, fetchArticles, fetchArticleResults,
        fetchCaseAudit, genReport, downloadReportUrl,
    } = useCases();

    const [caseData, setCaseData] = useState<Case | null>(null);
    const [status, setStatus] = useState<PipelineStatus | null>(null);
    const [pipeline, setPipeline] = useState<PipelineProgress | null>(null);
    const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
    const [sanctions, setSanctions] = useState<SanctionHit[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [articleResults, setArticleResults] = useState<ArticleResults | null>(null);
    const [auditLog, setAuditLog] = useState<AuditEvent[]>([]);
    const [tab, setTab] = useState<Tab>('pipeline');
    const [loading, setLoading] = useState(true);
    const [reportLoading, setReportLoading] = useState(false);

    const isProcessing = status?.status === 'PROCESSING';

    const loadAll = useCallback(async () => {
        if (!id) return;
        try {
            const [c, s, p] = await Promise.all([
                fetchCase(id).catch(() => null),
                fetchCaseStatus(id).catch(() => null),
                fetchPipelineProgress(id).catch(() => null),
            ]);
            if (c) setCaseData(c);
            if (s) setStatus(s);
            if (p) setPipeline(p);
        } finally { setLoading(false); }
    }, [id, fetchCase, fetchCaseStatus, fetchPipelineProgress]);

    useEffect(() => { loadAll(); }, [loadAll]);
    usePolling(loadAll, 8_000, isProcessing);

    const loadTab = useCallback(async (t: Tab) => {
        if (!id) return;
        switch (t) {
            case 'jurisdiction': setJurisdictions(await fetchJurisdictions(id).catch(() => [])); break;
            case 'sanctions': setSanctions(await fetchSanctions(id).catch(() => [])); break;
            case 'articles': setArticles(await fetchArticles(id).catch(() => [])); break;
            case 'risk': setArticleResults(await fetchArticleResults(id).catch(() => null)); break;
            case 'audit': setAuditLog(await fetchCaseAudit(id).catch(() => [])); break;
        }
    }, [id, fetchJurisdictions, fetchSanctions, fetchArticles, fetchArticleResults, fetchCaseAudit]);

    const handleTabChange = (t: Tab) => { setTab(t); if (t !== 'pipeline') loadTab(t); };

    const handleGenReport = async () => {
        if (!id) return;
        setReportLoading(true);
        try { await genReport(id); } finally { setReportLoading(false); }
    };

    if (loading) return (
        <div className="ams-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ color: '#666' }}>Loading case…</div>
        </div>
    );

    if (!caseData) return (
        <div className="ams-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ color: '#ef4444' }}>Case not found</div>
        </div>
    );

    return (
        <>
            <div className="ams-topbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => navigate('/ams/cases')}>
                        <ArrowLeft size={15} />
                    </button>
                    <div>
                        <div className="ams-topbar-title">{caseData.entities[0]}</div>
                        <div className="ams-topbar-sub" style={{ fontFamily: 'monospace', fontSize: 11 }}>{caseData.case_id}</div>
                    </div>
                    <StatusBadge status={caseData.status} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={loadAll}><RefreshCw size={13} /> Refresh</button>
                    <button className="btn btn-ghost btn-sm" onClick={handleGenReport} disabled={reportLoading}>
                        <FileText size={13} /> {reportLoading ? 'Generating…' : 'Report'}
                    </button>
                    {id && (
                        <a className="btn btn-ghost btn-sm" href={downloadReportUrl(id)} target="_blank" rel="noreferrer">
                            <Download size={13} /> Download
                        </a>
                    )}
                </div>
            </div>

            <div className="ams-page">
                <div className="ams-tabs" style={{ marginBottom: 20 }}>
                    {TABS.map(({ key, label }) => (
                        <button key={key} className={`ams-tab${tab === key ? ' active' : ''}`}
                            onClick={() => handleTabChange(key)}>
                            {label}
                        </button>
                    ))}
                </div>

                {tab === 'pipeline' && <PipelineTab pipeline={pipeline} />}
                {tab === 'jurisdiction' && <JurisdictionsTab jurisdictions={jurisdictions} />}
                {tab === 'sanctions' && <SanctionsTab sanctions={sanctions} />}
                {tab === 'articles' && <ArticlesTab articles={articles} />}
                {tab === 'risk' && <RiskSummaryTab articleResults={articleResults} />}
                {tab === 'audit' && <AuditTrailTab events={auditLog} />}
            </div>
        </>
    );
}
