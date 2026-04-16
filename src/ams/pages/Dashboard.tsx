import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp,
    RefreshCw,
} from 'lucide-react';
import { getCases, getAnalytics } from '../lib/api';
import { usePolling } from '../hooks/usePolling';
import StatusBadge from '../components/StatusBadge';
import HealthIndicator from '../components/HealthIndicator';
import type { CaseListItem, AnalyticsSummary } from '../types';

export default function Dashboard() {
    const navigate = useNavigate();
    const [cases, setCases] = useState<CaseListItem[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const hasProcessing = cases.some((c) => c.status === 'PROCESSING');

    const fetchData = useCallback(async () => {
        try {
            const [c, a] = await Promise.allSettled([getCases(100), getAnalytics()]);
            if (c.status === 'fulfilled') setCases(c.value);
            if (a.status === 'fulfilled') setAnalytics(a.value);
            setLastRefresh(new Date());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);
    usePolling(fetchData, 15_000, hasProcessing);

    const total = cases.length;
    const processing = cases.filter((c) => c.status === 'PROCESSING').length;
    const completed = cases.filter((c) => c.status === 'COMPLETED').length;
    const recent = [...cases]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8);

    const fmt = (d: string) =>
        new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <>
            {/* Topbar */}
            <div className="ams-topbar">
                <div>
                    <div className="ams-topbar-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <LayoutDashboard size={20} style={{ color: '#e8530a' }} />
                        Dashboard
                    </div>
                    <div className="ams-topbar-sub">
                        Operational overview · Refreshed {lastRefresh.toLocaleTimeString()}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <HealthIndicator />
                    <button className="btn btn-ghost btn-sm" onClick={fetchData}>
                        <RefreshCw size={13} /> Refresh
                    </button>
                </div>
            </div>

            <div className="ams-page">
                {loading ? (
                    <div className="ams-empty">
                        <div style={{ color: '#e8530a', fontSize: 14 }}>Loading data…</div>
                    </div>
                ) : (
                    <>
                        {/* KPI cards */}
                        <div className="ams-grid-4" style={{ marginBottom: 24 }}>
                            <div className="ams-card">
                                <div className="ams-card-title">Total Cases</div>
                                <div className="ams-stat-val">{total}</div>
                                <div className="ams-stat-label">All time</div>
                            </div>
                            <div className="ams-card">
                                <div className="ams-card-title" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <Clock size={12} style={{ color: '#eab308' }} /> Processing
                                </div>
                                <div className="ams-stat-val" style={{ color: '#eab308' }}>{processing}</div>
                                <div className="ams-stat-label">Active right now</div>
                            </div>
                            <div className="ams-card">
                                <div className="ams-card-title" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <CheckCircle size={12} style={{ color: '#22c55e' }} /> Completed
                                </div>
                                <div className="ams-stat-val" style={{ color: '#22c55e' }}>{completed}</div>
                                <div className="ams-stat-label">Finished screenings</div>
                            </div>
                            <div className="ams-card">
                                <div className="ams-card-title" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <AlertTriangle size={12} style={{ color: '#ef4444' }} /> Escalations
                                </div>
                                <div className="ams-stat-val" style={{ color: '#ef4444' }}>
                                    {/* escalation_required needs full case data — shown as dash when unavailable */}
                                    {analytics ? '—' : '—'}
                                </div>
                                <div className="ams-stat-label">Require review</div>
                            </div>
                        </div>

                        {/* Verdict distribution + Top domains */}
                        {analytics && (
                            <div className="ams-grid-2" style={{ marginBottom: 24 }}>
                                {/* Verdict distribution */}
                                <div className="ams-card">
                                    <div className="ams-section-header">
                                        <div className="ams-section-title" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <TrendingUp size={15} style={{ color: '#e8530a' }} /> Verdict Distribution
                                        </div>
                                    </div>
                                    {(['ADVERSE', 'REQUIRES_REVIEW', 'CLEARED'] as const).map((v) => {
                                        const total_v =
                                            analytics.verdict_distribution.ADVERSE +
                                            analytics.verdict_distribution.REQUIRES_REVIEW +
                                            analytics.verdict_distribution.CLEARED;
                                        const count = analytics.verdict_distribution[v];
                                        const pct = total_v ? Math.round((count / total_v) * 100) : 0;
                                        const color =
                                            v === 'ADVERSE' ? '#ef4444' : v === 'REQUIRES_REVIEW' ? '#eab308' : '#22c55e';
                                        return (
                                            <div key={v} style={{ marginBottom: 12 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                                    <span style={{ color }}>
                                                        {v === 'REQUIRES_REVIEW' ? 'Requires Review' : v.charAt(0) + v.slice(1).toLowerCase()}
                                                    </span>
                                                    <span style={{ color: '#888' }}>{count} ({pct}%)</span>
                                                </div>
                                                <div style={{ height: 6, background: '#1e1e1e', borderRadius: 3, overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.8s ease' }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div style={{ marginTop: 16, display: 'flex', gap: 20, fontSize: 12, color: '#666' }}>
                                        <span>Articles: {analytics.total_articles.toLocaleString()}</span>
                                        <span>Analyses: {analytics.total_analyses.toLocaleString()}</span>
                                        <span>Sources: {analytics.unique_sources}</span>
                                    </div>
                                </div>

                                {/* Top domains */}
                                <div className="ams-card">
                                    <div className="ams-section-title" style={{ marginBottom: 14 }}>Top Domains</div>
                                    {analytics.top_domains.slice(0, 10).map((d, i) => (
                                        <div
                                            key={d.domain}
                                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #1e1e1e', fontSize: 13 }}
                                        >
                                            <span style={{ color: '#aaa' }}>
                                                <span style={{ color: '#444', marginRight: 8, fontSize: 11 }}>{i + 1}.</span>
                                                {d.domain}
                                            </span>
                                            <span style={{ color: '#e8530a', fontWeight: 600 }}>{d.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent cases */}
                        <div className="ams-card">
                            <div className="ams-section-header">
                                <div className="ams-section-title">Recent Cases</div>
                                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/ams/cases')}>View All</button>
                            </div>
                            {recent.length === 0 ? (
                                <div className="ams-empty">
                                    <div className="ams-empty-icon">📋</div>
                                    <div className="ams-empty-text">No cases yet. Create one to get started.</div>
                                    <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/ams/cases/new')}>
                                        + New Case
                                    </button>
                                </div>
                            ) : (
                                <div className="ams-table-wrap" style={{ border: 'none' }}>
                                    <table className="ams-table">
                                        <thead>
                                            <tr>
                                                <th>Entity</th>
                                                <th>Case ID</th>
                                                <th>Status</th>
                                                <th>Created</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recent.map((c) => (
                                                <tr
                                                    key={c.case_id}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => navigate(`/ams/cases/${c.case_id}`)}
                                                >
                                                    <td style={{ fontWeight: 500, color: '#e2e8f0' }}>{c.entities[0]}</td>
                                                    <td style={{ fontFamily: 'monospace', color: '#666', fontSize: 11 }}>
                                                        {c.case_id.slice(0, 8)}…
                                                    </td>
                                                    <td><StatusBadge status={c.status} /></td>
                                                    <td style={{ color: '#666' }}>{fmt(c.created_at)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
