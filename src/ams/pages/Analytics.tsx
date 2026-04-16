import { useState, useEffect, useCallback } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { getAnalytics } from '../lib/api';
import type { AnalyticsSummary } from '../types';

export default function Analytics() {
    const [data, setData] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const d = await getAnalytics();
            setData(d);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) {
        return (
            <div className="ams-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#666' }}>Loading analytics…</div>
            </div>
        );
    }

    const verdicts: Array<{ key: keyof AnalyticsSummary['verdict_distribution']; label: string; color: string }> = [
        { key: 'ADVERSE', label: 'Adverse', color: '#ef4444' },
        { key: 'REQUIRES_REVIEW', label: 'Requires Review', color: '#eab308' },
        { key: 'CLEARED', label: 'Cleared', color: '#22c55e' },
    ];

    const totalVerdicts = data
        ? (data.verdict_distribution.ADVERSE + data.verdict_distribution.REQUIRES_REVIEW + data.verdict_distribution.CLEARED)
        : 0;

    return (
        <>
            <div className="ams-topbar">
                <div>
                    <div className="ams-topbar-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <BarChart3 size={20} style={{ color: '#e8530a' }} /> Analytics
                    </div>
                    <div className="ams-topbar-sub">Aggregated statistics across all cases</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={fetchData}><RefreshCw size={13} /> Refresh</button>
            </div>

            <div className="ams-page">
                {!data ? (
                    <div className="ams-empty">
                        <div className="ams-empty-icon">📊</div>
                        <div className="ams-empty-text">No analytics data available yet</div>
                    </div>
                ) : (
                    <>
                        {/* Summary KPIs */}
                        <div className="ams-grid-3" style={{ marginBottom: 24 }}>
                            <div className="ams-card">
                                <div className="ams-card-title">Total Articles</div>
                                <div className="ams-stat-val">{data.total_articles.toLocaleString()}</div>
                                <div className="ams-stat-label">Ingested across all cases</div>
                            </div>
                            <div className="ams-card">
                                <div className="ams-card-title">AI Analyses</div>
                                <div className="ams-stat-val">{data.total_analyses.toLocaleString()}</div>
                                <div className="ams-stat-label">Total LLM analyses performed</div>
                            </div>
                            <div className="ams-card">
                                <div className="ams-card-title">Unique Sources</div>
                                <div className="ams-stat-val">{data.unique_sources}</div>
                                <div className="ams-stat-label">Distinct domains seen</div>
                            </div>
                        </div>

                        <div className="ams-grid-2" style={{ marginBottom: 24 }}>
                            {/* Verdict distribution */}
                            <div className="ams-card">
                                <div className="ams-section-title" style={{ marginBottom: 20 }}>Verdict Distribution</div>
                                {verdicts.map(({ key, label, color }) => {
                                    const count = data.verdict_distribution[key];
                                    const pct = totalVerdicts ? Math.round((count / totalVerdicts) * 100) : 0;
                                    return (
                                        <div key={key} style={{ marginBottom: 18 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <span style={{ fontSize: 13, color, fontWeight: 600 }}>{label}</span>
                                                <span style={{ fontSize: 13, color: '#666' }}>{count.toLocaleString()} <span style={{ color: '#444' }}>({pct}%)</span></span>
                                            </div>
                                            <div style={{ height: 8, background: '#1e1e1e', borderRadius: 4, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 1s ease' }} />
                                            </div>
                                        </div>
                                    );
                                })}
                                <div style={{ marginTop: 20, padding: '14px 0', borderTop: '1px solid #1e1e1e', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: '#555' }}>Total verdicts</span>
                                    <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{totalVerdicts.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Top domains */}
                            <div className="ams-card">
                                <div className="ams-section-title" style={{ marginBottom: 16 }}>Top 15 Source Domains</div>
                                {data.top_domains.slice(0, 15).length === 0 ? (
                                    <div className="ams-empty" style={{ padding: 20 }}>
                                        <div className="ams-empty-text">No domain data yet</div>
                                    </div>
                                ) : (
                                    data.top_domains.slice(0, 15).map((d, i) => {
                                        const maxCount = data.top_domains[0]?.count ?? 1;
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
                                                    <div style={{ height: '100%', width: `${pct}%`, background: 'rgba(232,83,10,0.5)', borderRadius: 2 }} />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
