import type { AnalyticsSummary } from '../../types';

// ─── Verdict Distribution Card ────────────────────────────────────────────────
type VerdictKey = 'ADVERSE' | 'REQUIRES_REVIEW' | 'CLEARED';

const VERDICT_META: { key: VerdictKey; label: string; color: string }[] = [
    { key: 'ADVERSE', label: 'Adverse', color: '#ef4444' },
    { key: 'REQUIRES_REVIEW', label: 'Requires Review', color: '#eab308' },
    { key: 'CLEARED', label: 'Cleared', color: '#22c55e' },
];

export function VerdictDistributionCard({ distribution }: { distribution: AnalyticsSummary['verdict_distribution'] }) {
    const total = distribution.ADVERSE + distribution.REQUIRES_REVIEW + distribution.CLEARED;

    return (
        <div className="ams-card">
            <div className="ams-section-title" style={{ marginBottom: 20 }}>Verdict Distribution</div>
            {VERDICT_META.map(({ key, label, color }) => {
                const count = distribution[key];
                const pct = total ? Math.round((count / total) * 100) : 0;
                return (
                    <div key={key} style={{ marginBottom: 18 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 13, color, fontWeight: 600 }}>{label}</span>
                            <span style={{ fontSize: 13, color: '#666' }}>
                                {count.toLocaleString()} ({pct}%)
                            </span>
                        </div>
                        <div style={{ height: 8, background: '#1e1e1e', borderRadius: 4, overflow: 'hidden' }}>
                            <div
                                style={{
                                    height: '100%', width: `${pct}%`, background: color,
                                    borderRadius: 4, transition: 'width 1s ease',
                                }}
                            />
                        </div>
                    </div>
                );
            })}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #1e1e1e', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#555' }}>Total verdicts</span>
                <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{total.toLocaleString()}</span>
            </div>
        </div>
    );
}

// ─── Top Domains Card ─────────────────────────────────────────────────────────
export function TopDomainsCard({ domains }: { domains: AnalyticsSummary['top_domains'] }) {
    const top15 = domains.slice(0, 15);
    const maxCount = top15[0]?.count ?? 1;

    return (
        <div className="ams-card">
            <div className="ams-section-title" style={{ marginBottom: 16 }}>Top 15 Source Domains</div>
            {top15.length === 0 ? (
                <div className="ams-empty" style={{ padding: 20 }}>
                    <div className="ams-empty-text">No domain data yet</div>
                </div>
            ) : (
                top15.map((d, i) => {
                    const pct = Math.round((d.count / maxCount) * 100);
                    return (
                        <div key={d.domain} style={{ marginBottom: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                <span style={{ fontSize: 12, color: '#aaa' }}>
                                    <span style={{ color: '#444', marginRight: 8, fontSize: 11 }}>{i + 1}.</span>
                                    {d.domain}
                                </span>
                                <span style={{ fontSize: 12, color: '#e8530a', fontWeight: 600 }}>{d.count}</span>
                            </div>
                            <div style={{ height: 4, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden' }}>
                                <div
                                    style={{
                                        height: '100%', width: `${pct}%`,
                                        background: 'rgba(232,83,10,0.5)', borderRadius: 2,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}

// ─── Analytics KPI Cards ──────────────────────────────────────────────────────
export function AnalyticsKPIs({ analytics }: { analytics: AnalyticsSummary }) {
    const kpis = [
        { title: 'Total Articles', value: analytics.total_articles.toLocaleString(), label: 'Ingested across all cases' },
        { title: 'AI Analyses', value: analytics.total_analyses.toLocaleString(), label: 'Total LLM analyses performed' },
        { title: 'Unique Sources', value: analytics.unique_sources, label: 'Distinct domains seen' },
    ];
    return (
        <div className="ams-grid-3" style={{ marginBottom: 24 }}>
            {kpis.map((k) => (
                <div className="ams-card" key={k.title}>
                    <div className="ams-card-title">{k.title}</div>
                    <div className="ams-stat-val">{k.value}</div>
                    <div className="ams-stat-label">{k.label}</div>
                </div>
            ))}
        </div>
    );
}
