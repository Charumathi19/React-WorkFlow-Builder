import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RotateCcw, XCircle, FileText } from 'lucide-react';
import {
    getCase, getCaseStatus, getPipelineProgress, getJurisdictions,
    getSanctions, getArticles, getArticleResults, getCaseAudit,
    rerunCase, cancelCase, generateReport, downloadReportUrl,
} from '../lib/api';
import { usePolling } from '../hooks/usePolling';
import StatusBadge from '../components/StatusBadge';
import type {
    Case, PipelineProgress, Jurisdiction, SanctionHit,
    Article, ArticleResults, AuditEvent, Verdict,
} from '../types';

const ALL_MODULES = [
    'input_case_management', 'jurisdiction_detection', 'keyword_expansion',
    'search_orchestration', 'content_retrieval', 'deduplication',
    'risk_classification', 'contextual_analysis', 'report_generation',
];

const TAB_LABELS = [
    'Pipeline', 'Jurisdiction', 'Sanctions', 'Articles', 'Risk Summary', 'Audit',
];

export default function CaseDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [tab, setTab] = useState(0);

    const [caseData, setCaseData] = useState<Case | null>(null);
    const [pipeline, setPipeline] = useState<PipelineProgress | null>(null);
    const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
    const [sanctions, setSanctions] = useState<SanctionHit[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [articleResults, setArticleResults] = useState<ArticleResults | null>(null);
    const [audit, setAudit] = useState<AuditEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [actioning, setActioning] = useState(false);

    // Article filters
    const [filterVerdict, setFilterVerdict] = useState<Verdict | ''>('');
    const [filterDomain, setFilterDomain] = useState('');

    const isProcessing = caseData?.status === 'PROCESSING' || caseData?.status === 'SUBMITTED';

    const fetchBase = useCallback(async () => {
        if (!id) return;
        try {
            const c = await getCase(id);
            setCaseData(c);
        } catch { navigate('/ams/cases'); }
        setLoading(false);
    }, [id, navigate]);

    const fetchPolled = useCallback(async () => {
        if (!id) return;
        const [status, prog] = await Promise.allSettled([
            getCaseStatus(id),
            getPipelineProgress(id),
        ]);
        if (status.status === 'fulfilled') {
            setCaseData((prev) => prev ? { ...prev, status: status.value.status } : prev);
        }
        if (prog.status === 'fulfilled') setPipeline(prog.value);
    }, [id]);

    const fetchAll = useCallback(async () => {
        if (!id) return;
        const [j, s, a, ar, au] = await Promise.allSettled([
            getJurisdictions(id),
            getSanctions(id),
            getArticles(id),
            getArticleResults(id),
            getCaseAudit(id),
        ]);
        if (j.status === 'fulfilled') setJurisdictions(j.value);
        if (s.status === 'fulfilled') setSanctions(s.value);
        if (a.status === 'fulfilled') setArticles(a.value);
        if (ar.status === 'fulfilled') setArticleResults(ar.value);
        if (au.status === 'fulfilled') setAudit(au.value);
    }, [id]);

    useEffect(() => {
        fetchBase().then(() => fetchPolled()).then(() => fetchAll());
    }, [fetchBase, fetchPolled, fetchAll]);

    usePolling(fetchPolled, 4_000, isProcessing);

    const handleRerun = async () => {
        if (!id) return;
        setActioning(true);
        try { await rerunCase(id); await fetchBase(); } finally { setActioning(false); }
    };

    const handleCancel = async () => {
        if (!id) return;
        setActioning(true);
        try { await cancelCase(id); await fetchBase(); } finally { setActioning(false); }
    };

    const handleGenerateReport = async () => {
        if (!id) return;
        try { await generateReport(id); } catch { /* ignore */ }
    };

    const handleDownloadReport = () => {
        if (!id) return;
        window.open(downloadReportUrl(id), '_blank');
    };

    const fmt = (d?: string) =>
        d ? new Date(d).toLocaleString('en-GB') : '—';

    if (loading) {
        return (
            <div className="ams-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div style={{ color: '#666' }}>Loading case…</div>
            </div>
        );
    }

    if (!caseData) return null;

    const filteredArticles = articles.filter((a) => {
        if (filterVerdict && a.analysis?.relevance_verdict !== filterVerdict) return false;
        if (filterDomain && !a.domain.toLowerCase().includes(filterDomain.toLowerCase())) return false;
        return true;
    });

    const verdictColor = (v?: Verdict) =>
        v === 'ADVERSE' ? '#ef4444' : v === 'REQUIRES_REVIEW' ? '#eab308' : v === 'CLEARED' ? '#22c55e' : '#666';

    return (
        <>
            {/* Topbar */}
            <div className="ams-topbar">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => navigate('/ams/cases')}>
                        <ArrowLeft size={15} />
                    </button>
                    <div>
                        <div className="ams-topbar-title">{caseData.entities[0]}</div>
                        <div className="ams-topbar-sub" style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 4 }}>
                            <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#555' }}>{caseData.case_id}</span>
                            <StatusBadge status={caseData.status} />
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={handleGenerateReport} title="Generate report">
                        <FileText size={13} /> Generate Report
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={handleDownloadReport} title="Download .docx">
                        <Download size={13} /> Download
                    </button>
                    {(caseData.status === 'COMPLETED' || caseData.status === 'FAILED') && (
                        <button className="btn btn-ghost btn-sm" onClick={handleRerun} disabled={actioning}>
                            <RotateCcw size={13} /> Re-run
                        </button>
                    )}
                    {(caseData.status === 'SUBMITTED' || caseData.status === 'PROCESSING') && (
                        <button className="btn btn-danger btn-sm" onClick={handleCancel} disabled={actioning}>
                            <XCircle size={13} /> Cancel
                        </button>
                    )}
                </div>
            </div>

            <div className="ams-page">
                {/* Meta card */}
                <div className="ams-card" style={{ marginBottom: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px 24px', fontSize: 13 }}>
                        <div><span style={{ color: '#555' }}>Created</span><br /><span style={{ color: '#ccc' }}>{fmt(caseData.created_at)}</span></div>
                        <div><span style={{ color: '#555' }}>Updated</span><br /><span style={{ color: '#ccc' }}>{fmt(caseData.updated_at)}</span></div>
                        <div><span style={{ color: '#555' }}>Languages</span><br /><span style={{ color: '#ccc' }}>{caseData.languages.join(', ')}</span></div>
                        {caseData.subject_details?.entity_type && (
                            <div><span style={{ color: '#555' }}>Type</span><br /><span style={{ color: '#ccc', textTransform: 'capitalize' }}>{caseData.subject_details.entity_type}</span></div>
                        )}
                        {caseData.subject_details?.date_of_birth && (
                            <div><span style={{ color: '#555' }}>DOB</span><br /><span style={{ color: '#ccc' }}>{caseData.subject_details.date_of_birth}</span></div>
                        )}
                        {caseData.subject_details?.nationality && (
                            <div><span style={{ color: '#555' }}>Nationality</span><br /><span style={{ color: '#ccc' }}>{caseData.subject_details.nationality}</span></div>
                        )}
                        {caseData.subject_details?.aliases && caseData.subject_details.aliases.length > 0 && (
                            <div><span style={{ color: '#555' }}>Aliases</span><br /><span style={{ color: '#ccc' }}>{caseData.subject_details.aliases.join(', ')}</span></div>
                        )}
                        {caseData.selected_domains && caseData.selected_domains.length > 0 && (
                            <div><span style={{ color: '#555' }}>Domain Overrides</span><br /><span style={{ color: '#e8530a' }}>{caseData.selected_domains.length} domains</span></div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="ams-tabs">
                    {TAB_LABELS.map((label, i) => (
                        <button key={label} className={`ams-tab${tab === i ? ' active' : ''}`} onClick={() => setTab(i)}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* ── Tab 0: Pipeline Progress ─────────────────────────────────────── */}
                {tab === 0 && (
                    <div className="ams-card">
                        <div className="ams-section-title" style={{ marginBottom: 16 }}>Pipeline Modules</div>
                        {isProcessing && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13, color: '#eab308' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#eab308', animation: 'pulse 1.5s infinite' }} />
                                Pipeline running… polling every 4s
                            </div>
                        )}
                        <div className="pipeline-steps">
                            {ALL_MODULES.map((m) => {
                                const done = pipeline?.completed_modules.includes(m) ?? false;
                                return (
                                    <div key={m} className={`pipeline-step ${done ? 'pipeline-step-done' : 'pipeline-step-pending'}`}>
                                        <span>{done ? '✓' : '○'}</span>
                                        {m.replace(/_/g, ' ')}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Tab 1: Jurisdictions ─────────────────────────────────────────── */}
                {tab === 1 && (
                    <div className="ams-table-wrap">
                        <table className="ams-table">
                            <thead>
                                <tr><th>Code</th><th>Confidence</th><th>Method</th><th>Source</th><th>Primary</th></tr>
                            </thead>
                            <tbody>
                                {jurisdictions.length === 0 ? (
                                    <tr><td colSpan={5}><div className="ams-empty"><div className="ams-empty-text">No jurisdiction data</div></div></td></tr>
                                ) : (
                                    jurisdictions.map((j, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{j.jurisdiction_code}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 60, height: 5, background: '#1e1e1e', borderRadius: 3, overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: `${j.confidence * 100}%`, background: '#e8530a', borderRadius: 3 }} />
                                                    </div>
                                                    <span>{(j.confidence * 100).toFixed(0)}%</span>
                                                </div>
                                            </td>
                                            <td style={{ color: '#888' }}>{j.decision_method}</td>
                                            <td style={{ color: '#888' }}>{j.source}</td>
                                            <td>{j.is_primary ? <span className="badge badge-COMPLETED">Primary</span> : <span style={{ color: '#444' }}>—</span>}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Tab 2: Sanctions ─────────────────────────────────────────────── */}
                {tab === 2 && (
                    <div className="ams-table-wrap">
                        <table className="ams-table">
                            <thead>
                                <tr><th>Match Name</th><th>Score</th><th>Schema</th><th>Datasets</th><th>Countries</th><th>Method</th></tr>
                            </thead>
                            <tbody>
                                {sanctions.length === 0 ? (
                                    <tr><td colSpan={6}><div className="ams-empty"><div className="ams-empty-icon">✅</div><div className="ams-empty-text">No sanctions hits found</div></div></td></tr>
                                ) : (
                                    sanctions.map((s, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 500, color: '#e2e8f0' }}>{s.match_name}</td>
                                            <td>
                                                <span style={{ color: s.match_score > 0.8 ? '#ef4444' : s.match_score > 0.5 ? '#eab308' : '#22c55e', fontWeight: 600 }}>
                                                    {(s.match_score * 100).toFixed(0)}%
                                                </span>
                                            </td>
                                            <td style={{ color: '#888', fontSize: 12 }}>{s.match_schema}</td>
                                            <td style={{ color: '#888', fontSize: 11 }}>{s.datasets.join(', ')}</td>
                                            <td style={{ color: '#888', fontSize: 12 }}>{s.countries.join(', ')}</td>
                                            <td style={{ color: '#666', fontSize: 12 }}>{s.decision_method}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Tab 3: Articles & AI Verdicts ────────────────────────────────── */}
                {tab === 3 && (
                    <>
                        <div className="ams-filters">
                            <select className="ams-select" style={{ width: 170 }} value={filterVerdict}
                                onChange={(e) => setFilterVerdict(e.target.value as Verdict | '')}>
                                <option value="">All Verdicts</option>
                                <option value="ADVERSE">Adverse</option>
                                <option value="REQUIRES_REVIEW">Requires Review</option>
                                <option value="CLEARED">Cleared</option>
                            </select>
                            <input className="ams-input" style={{ width: 200 }} placeholder="Filter by domain…"
                                value={filterDomain} onChange={(e) => setFilterDomain(e.target.value)} />
                            <span style={{ fontSize: 12, color: '#555' }}>{filteredArticles.length} articles</span>
                        </div>
                        <div className="ams-table-wrap">
                            <table className="ams-table">
                                <thead>
                                    <tr><th>Title</th><th>Domain</th><th>Lang</th><th>Words</th><th>Verdict</th><th>Confidence</th><th>Keywords</th></tr>
                                </thead>
                                <tbody>
                                    {filteredArticles.length === 0 ? (
                                        <tr><td colSpan={7}><div className="ams-empty"><div className="ams-empty-text">No articles found</div></div></td></tr>
                                    ) : (
                                        filteredArticles.map((a, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <a href={a.url} target="_blank" rel="noreferrer"
                                                        style={{ color: '#e2e8f0', textDecoration: 'none', maxWidth: 280, display: 'block' }}
                                                        className="truncate"
                                                        title={a.title}
                                                    >
                                                        {a.title}
                                                    </a>
                                                </td>
                                                <td style={{ fontSize: 12, color: '#888' }}>{a.domain}</td>
                                                <td style={{ fontSize: 12, color: '#666' }}>{a.language}</td>
                                                <td style={{ fontSize: 12, color: '#666' }}>{a.word_count?.toLocaleString()}</td>
                                                <td>
                                                    {a.analysis?.relevance_verdict ? (
                                                        <StatusBadge status={a.analysis.relevance_verdict} />
                                                    ) : <span style={{ color: '#444' }}>—</span>}
                                                </td>
                                                <td style={{ color: verdictColor(a.analysis?.relevance_verdict), fontSize: 12 }}>
                                                    {a.analysis?.confidence != null ? `${(a.analysis.confidence * 100).toFixed(0)}%` : '—'}
                                                </td>
                                                <td style={{ fontSize: 11, color: '#666' }}>
                                                    {a.searched_keywords?.slice(0, 2).join(', ')}
                                                    {(a.searched_keywords?.length ?? 0) > 2 && ` +${(a.searched_keywords?.length ?? 0) - 2}`}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* ── Tab 4: Risk Summary / Article Results ────────────────────────── */}
                {tab === 4 && (
                    <>
                        {/* Risk Summary card */}
                        {articleResults?.risk_summary && (
                            <div className="ams-card" style={{ marginBottom: 20 }}>
                                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                                    <div>
                                        <div className="ams-card-title">Risk Score</div>
                                        <div className="ams-stat-val" style={{ color: articleResults.risk_summary.overall_risk_score > 0.7 ? '#ef4444' : articleResults.risk_summary.overall_risk_score > 0.4 ? '#eab308' : '#22c55e' }}>
                                            {(articleResults.risk_summary.overall_risk_score * 100).toFixed(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="ams-card-title">Sentiment</div>
                                        <div style={{ fontSize: 18, fontWeight: 700, color: '#ccc', textTransform: 'capitalize' }}>
                                            {articleResults.risk_summary.sentiment}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="ams-card-title">Escalation</div>
                                        <div style={{ fontSize: 18, fontWeight: 700, color: articleResults.risk_summary.escalation_required ? '#ef4444' : '#22c55e' }}>
                                            {articleResults.risk_summary.escalation_required ? '⚠ Required' : '✓ Not Required'}
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div className="ams-card-title">Summary</div>
                                        <div style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>{articleResults.risk_summary.summary_text}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Article results table */}
                        <div className="ams-table-wrap">
                            <table className="ams-table">
                                <thead>
                                    <tr><th>Article</th><th>Entity Found</th><th>Context</th><th>Risk Category</th><th>Confidence</th><th>Verdict</th></tr>
                                </thead>
                                <tbody>
                                    {!articleResults || articleResults.articles.length === 0 ? (
                                        <tr><td colSpan={6}><div className="ams-empty"><div className="ams-empty-text">No article results available</div></div></td></tr>
                                    ) : (
                                        articleResults.articles.map((a, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <a href={a.article_url} target="_blank" rel="noreferrer"
                                                        style={{ color: '#e2e8f0', textDecoration: 'none', maxWidth: 260, display: 'block' }}
                                                        className="truncate" title={a.article_title}
                                                    >
                                                        {a.article_title}
                                                    </a>
                                                </td>
                                                <td>
                                                    <span style={{ color: a.entity_validation.entity_found ? '#22c55e' : '#ef4444', fontWeight: 600, fontSize: 12 }}>
                                                        {a.entity_validation.entity_found ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{ fontSize: 12, color: a.entity_validation.context_classification === 'NEGATIVE' ? '#ef4444' : a.entity_validation.context_classification === 'POSITIVE' ? '#22c55e' : '#888' }}>
                                                        {a.entity_validation.context_classification}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: 12, color: '#aaa' }}>{a.classification.risk_category}</td>
                                                <td style={{ fontSize: 12 }}>
                                                    <span style={{ color: verdictColor(a.analysis.relevance_verdict) }}>
                                                        {(a.classification.confidence * 100).toFixed(0)}%
                                                    </span>
                                                </td>
                                                <td><StatusBadge status={a.analysis.relevance_verdict} /></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* ── Tab 5: Audit Trail ───────────────────────────────────────────── */}
                {tab === 5 && (
                    <div className="ams-table-wrap">
                        <table className="ams-table">
                            <thead>
                                <tr><th>Time</th><th>Module</th><th>Event Type</th><th>Actor</th><th>Model</th><th>Hash</th></tr>
                            </thead>
                            <tbody>
                                {audit.length === 0 ? (
                                    <tr><td colSpan={6}><div className="ams-empty"><div className="ams-empty-text">No audit events</div></div></td></tr>
                                ) : (
                                    [...audit]
                                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                        .map((ev) => (
                                            <tr key={ev.event_id}>
                                                <td style={{ fontSize: 11, color: '#555', whiteSpace: 'nowrap' }}>{fmt(ev.created_at)}</td>
                                                <td style={{ fontSize: 12, color: '#e8530a' }}>{ev.module?.replace(/_/g, ' ')}</td>
                                                <td style={{ fontSize: 12 }}>{ev.event_type}</td>
                                                <td style={{ fontSize: 12, color: '#888' }}>{ev.actor}</td>
                                                <td style={{ fontSize: 11, color: '#555' }}>{ev.model_version ?? '—'}</td>
                                                <td style={{ fontSize: 10, color: '#444', fontFamily: 'monospace' }}>
                                                    {ev.event_hash?.slice(0, 10)}…
                                                </td>
                                            </tr>
                                        ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
