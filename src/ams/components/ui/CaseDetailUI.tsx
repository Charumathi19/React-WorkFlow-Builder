import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { PipelineProgress, Jurisdiction, SanctionHit, Article, ArticleResults, AuditEvent } from '../../types';
import StatusBadge from './StatusBadge';

// ─── Pipeline Stage Card ──────────────────────────────────────────────────────
interface PipelineStageCardProps {
    name: string;
    status: string;
    message?: string;
    started_at?: string;
    completed_at?: string;
}

export function PipelineStageCard({ name, status, message, started_at, completed_at }: PipelineStageCardProps) {
    const color =
        status === 'completed' ? '#22c55e'
            : status === 'running' ? '#e8530a'
                : status === 'failed' ? '#ef4444'
                    : '#444';

    return (
        <div className="ams-card" style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#ddd', textTransform: 'capitalize' }}>
                    {name.replace(/_/g, ' ')}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase' }}>{status}</span>
            </div>
            {message && <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{message}</div>}
            {started_at && (
                <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>
                    {new Date(started_at).toLocaleTimeString()}
                    {completed_at && ` → ${new Date(completed_at).toLocaleTimeString()}`}
                </div>
            )}
        </div>
    );
}

// ─── Pipeline Tab ─────────────────────────────────────────────────────────────
export function PipelineTab({ pipeline }: { pipeline: PipelineProgress | null }) {
    if (!pipeline) return <div className="ams-empty"><div className="ams-empty-text">No pipeline data yet</div></div>;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(pipeline.stages ?? {}).map(([name, stage]) => (
                <PipelineStageCard
                    key={name}
                    name={name}
                    status={stage.status}
                    message={stage.message}
                    started_at={stage.started_at}
                    completed_at={stage.completed_at}
                />
            ))}
        </div>
    );
}

// ─── Jurisdictions Tab ────────────────────────────────────────────────────────
export function JurisdictionsTab({ jurisdictions }: { jurisdictions: Jurisdiction[] }) {
    return (
        <div className="ams-table-wrap">
            <table className="ams-table">
                <thead>
                    <tr><th>Country</th><th>Code</th><th>Detected Via</th><th>Risk Score</th></tr>
                </thead>
                <tbody>
                    {jurisdictions.length === 0 ? (
                        <tr><td colSpan={4}><div className="ams-empty"><div className="ams-empty-text">No jurisdictions detected</div></div></td></tr>
                    ) : jurisdictions.map((j, i) => (
                        <tr key={i}>
                            <td>{j.country_name}</td>
                            <td style={{ fontFamily: 'monospace', color: '#e8530a' }}>{j.country_code}</td>
                            <td style={{ fontSize: 12, color: '#888' }}>{j.detected_via}</td>
                            <td style={{ color: j.risk_score > 0.7 ? '#ef4444' : '#22c55e' }}>
                                {(j.risk_score * 100).toFixed(0)}%
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─── Sanctions Tab ────────────────────────────────────────────────────────────
export function SanctionsTab({ sanctions }: { sanctions: SanctionHit[] }) {
    return (
        <div className="ams-table-wrap">
            <table className="ams-table">
                <thead>
                    <tr><th>Entity</th><th>List</th><th>Match Score</th><th>Match Type</th></tr>
                </thead>
                <tbody>
                    {sanctions.length === 0 ? (
                        <tr><td colSpan={4}><div className="ams-empty"><div className="ams-empty-text">No sanction matches</div></div></td></tr>
                    ) : sanctions.map((s, i) => (
                        <tr key={i}>
                            <td style={{ fontWeight: 500 }}>{s.matched_name}</td>
                            <td style={{ color: '#e8530a', fontSize: 12 }}>{s.list_name}</td>
                            <td>
                                <span style={{ color: s.match_score > 0.8 ? '#ef4444' : '#eab308' }}>
                                    {(s.match_score * 100).toFixed(0)}%
                                </span>
                            </td>
                            <td style={{ color: '#888', fontSize: 12 }}>{s.match_type}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─── Article Card ─────────────────────────────────────────────────────────────
export function ArticleCard({ article }: { article: Article }) {
    return (
        <div className="ams-card" style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                <a href={article.url} target="_blank" rel="noreferrer"
                    style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', textDecoration: 'none' }}>
                    {article.title || article.url}
                </a>
                <span style={{ fontSize: 11, color: '#555', whiteSpace: 'nowrap' }}>{article.domain}</span>
            </div>
            {article.snippet && (
                <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{article.snippet}</div>
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11, color: '#444' }}>
                {article.published_date && <span>{new Date(article.published_date).toLocaleDateString('en-GB')}</span>}
                {article.language && <span>{article.language}</span>}
            </div>
        </div>
    );
}

// ─── Articles Tab ─────────────────────────────────────────────────────────────
export function ArticlesTab({ articles }: { articles: Article[] }) {
    if (articles.length === 0) {
        return <div className="ams-empty"><div className="ams-empty-text">No articles retrieved</div></div>;
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {articles.map((a) => <ArticleCard key={a.article_id} article={a} />)}
        </div>
    );
}

// ─── Risk Result Card ─────────────────────────────────────────────────────────
interface RiskResultCardProps {
    result: ArticleResults['results'][number];
}

export function RiskResultCard({ result: r }: RiskResultCardProps) {
    const borderColor =
        r.verdict === 'ADVERSE' ? '#ef4444'
            : r.verdict === 'REQUIRES_REVIEW' ? '#eab308'
                : '#22c55e';

    return (
        <div className="ams-card" style={{ padding: '14px 18px', borderLeft: `3px solid ${borderColor}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>
                    {r.article_title || r.article_id}
                </span>
                <StatusBadge status={r.verdict} />
            </div>
            {r.adverse_indicators?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                    {r.adverse_indicators.map((ai: string, i: number) => (
                        <span key={i} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: 4, padding: '2px 8px', fontSize: 11 }}>
                            {ai}
                        </span>
                    ))}
                </div>
            )}
            {r.reasoning && (
                <div style={{ fontSize: 12, color: '#666', marginTop: 8, lineHeight: 1.6 }}>{r.reasoning}</div>
            )}
        </div>
    );
}

// ─── Risk Summary Tab ─────────────────────────────────────────────────────────
export function RiskSummaryTab({ articleResults }: { articleResults: ArticleResults | null }) {
    if (!articleResults) {
        return <div className="ams-empty"><div className="ams-empty-text">No risk analysis yet</div></div>;
    }
    const rs = articleResults.risk_summary;
    return (
        <>
            {rs && (
                <div className="ams-card" style={{ marginBottom: 16 }}>
                    <div className="ams-section-title" style={{ marginBottom: 12 }}>Risk Summary</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, fontSize: 13 }}>
                        <div>
                            <div style={{ color: '#666', marginBottom: 4 }}>Overall Verdict</div>
                            {rs.overall_verdict && <StatusBadge status={rs.overall_verdict} />}
                        </div>
                        <div>
                            <div style={{ color: '#666', marginBottom: 4 }}>Risk Score</div>
                            <div style={{ fontWeight: 700, fontSize: 22, color: '#e8530a' }}>
                                {((rs.risk_score ?? 0) * 100).toFixed(0)}%
                            </div>
                        </div>
                        <div>
                            <div style={{ color: '#666', marginBottom: 4 }}>Escalation</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {rs.escalation_required
                                    ? <><AlertTriangle size={15} color="#ef4444" /><span style={{ color: '#ef4444' }}>Required</span></>
                                    : <><CheckCircle size={15} color="#22c55e" /><span style={{ color: '#22c55e' }}>Not required</span></>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(articleResults.results ?? []).map((r) => (
                    <RiskResultCard key={r.result_id} result={r} />
                ))}
            </div>
        </>
    );
}

// ─── Audit Trail Tab ──────────────────────────────────────────────────────────
export function AuditTrailTab({ events }: { events: AuditEvent[] }) {
    return (
        <div className="ams-table-wrap">
            <table className="ams-table">
                <thead>
                    <tr><th>Time</th><th>Module</th><th>Event</th><th>Actor</th></tr>
                </thead>
                <tbody>
                    {events.length === 0 ? (
                        <tr><td colSpan={4}><div className="ams-empty"><div className="ams-empty-text">No audit events</div></div></td></tr>
                    ) : events.map((e) => (
                        <tr key={e.event_id}>
                            <td style={{ fontSize: 11, color: '#555', whiteSpace: 'nowrap' }}>
                                {new Date(e.created_at).toLocaleTimeString()}
                            </td>
                            <td style={{ color: '#e8530a', fontSize: 12 }}>{e.module?.replace(/_/g, ' ')}</td>
                            <td style={{ fontSize: 12 }}>{e.event_type}</td>
                            <td style={{ fontSize: 12, color: '#666' }}>{e.actor}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
