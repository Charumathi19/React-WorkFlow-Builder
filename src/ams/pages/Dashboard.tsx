import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, CheckCircle, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { useCases } from '../contexts/CasesContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { usePolling } from '../hooks/usePolling';
import HealthIndicator from '../components/ui/HealthIndicator';
import { KPICard, VerdictBar, TopDomainRow, RecentCasesTable } from '../components/ui/DashboardUI';

export default function Dashboard() {
    const navigate = useNavigate();
    const { cases, casesLoading, fetchCases } = useCases();
    const { analytics, fetchAnalytics } = useAnalytics();
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const hasProcessing = cases.some((c) => c.status === 'PROCESSING');

    const refresh = useCallback(async () => {
        await Promise.allSettled([fetchCases(), fetchAnalytics()]);
        setLastRefresh(new Date());
    }, [fetchCases, fetchAnalytics]);

    useEffect(() => { refresh(); }, [refresh]);
    usePolling(refresh, 15_000, hasProcessing);

    const total = cases.length;
    const processing = cases.filter((c) => c.status === 'PROCESSING').length;
    const completed = cases.filter((c) => c.status === 'COMPLETED').length;
    const recent = [...cases]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8);

    return (
        <>
            <div className="ams-topbar">
                <div>
                    <div className="ams-topbar-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <LayoutDashboard size={20} style={{ color: '#e8530a' }} /> Dashboard
                    </div>
                    <div className="ams-topbar-sub">
                        Operational overview · Refreshed {lastRefresh.toLocaleTimeString()}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <HealthIndicator />
                    <button className="btn btn-ghost btn-sm" onClick={refresh}>
                        <RefreshCw size={13} /> Refresh
                    </button>
                </div>
            </div>

            <div className="ams-page">
                {casesLoading && !cases.length ? (
                    <div className="ams-empty">
                        <div style={{ color: '#e8530a', fontSize: 14 }}>Loading data…</div>
                    </div>
                ) : (
                    <>
                        {/* KPI cards */}
                        <div className="ams-grid-4" style={{ marginBottom: 24 }}>
                            <KPICard title="Total Cases" value={total} label="All time" />
                            <KPICard title="Processing" value={processing} label="Active right now" valueColor="#eab308"
                                icon={<Clock size={12} style={{ color: '#eab308' }} />} />
                            <KPICard title="Completed" value={completed} label="Finished screenings" valueColor="#22c55e"
                                icon={<CheckCircle size={12} style={{ color: '#22c55e' }} />} />
                            <KPICard title="Escalations" value="—" label="Require review" valueColor="#ef4444"
                                icon={<AlertTriangle size={12} style={{ color: '#ef4444' }} />} />
                        </div>

                        {/* Verdict distribution + Top domains */}
                        {analytics && (
                            <div className="ams-grid-2" style={{ marginBottom: 24 }}>
                                <div className="ams-card">
                                    <div className="ams-section-header">
                                        <div className="ams-section-title" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <TrendingUp size={15} style={{ color: '#e8530a' }} /> Verdict Distribution
                                        </div>
                                    </div>
                                    {(['ADVERSE', 'REQUIRES_REVIEW', 'CLEARED'] as const).map((v) => {
                                        const totalV =
                                            analytics.verdict_distribution.ADVERSE +
                                            analytics.verdict_distribution.REQUIRES_REVIEW +
                                            analytics.verdict_distribution.CLEARED;
                                        const count = analytics.verdict_distribution[v];
                                        const pct = totalV ? Math.round((count / totalV) * 100) : 0;
                                        const color = v === 'ADVERSE' ? '#ef4444' : v === 'REQUIRES_REVIEW' ? '#eab308' : '#22c55e';
                                        const label = v === 'REQUIRES_REVIEW' ? 'Requires Review'
                                            : v.charAt(0) + v.slice(1).toLowerCase();
                                        return <VerdictBar key={v} label={label} count={count} pct={pct} color={color} />;
                                    })}
                                    <div style={{ marginTop: 16, display: 'flex', gap: 20, fontSize: 12, color: '#666' }}>
                                        <span>Articles: {analytics.total_articles.toLocaleString()}</span>
                                        <span>Analyses: {analytics.total_analyses.toLocaleString()}</span>
                                        <span>Sources: {analytics.unique_sources}</span>
                                    </div>
                                </div>

                                <div className="ams-card">
                                    <div className="ams-section-title" style={{ marginBottom: 14 }}>Top Domains</div>
                                    {analytics.top_domains.slice(0, 10).map((d, i) => (
                                        <TopDomainRow key={d.domain} domain={d.domain} count={d.count} rank={i + 1} />
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
                            <RecentCasesTable
                                cases={recent}
                                onRowClick={(id) => navigate(`/ams/cases/${id}`)}
                                onNewCaseClick={() => navigate('/ams/cases/new')}
                            />
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
