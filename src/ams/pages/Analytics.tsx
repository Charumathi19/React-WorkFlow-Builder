import { useEffect } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { AnalyticsKPIs, VerdictDistributionCard, TopDomainsCard } from '../components/ui/AnalyticsUI';

export default function Analytics() {
    const { analytics, analyticsLoading, fetchAnalytics } = useAnalytics();

    useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

    if (analyticsLoading && !analytics) {
        return (
            <div className="ams-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: '#666' }}>Loading analytics…</div>
            </div>
        );
    }

    return (
        <>
            <div className="ams-topbar">
                <div>
                    <div className="ams-topbar-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <BarChart3 size={20} style={{ color: '#e8530a' }} /> Analytics
                    </div>
                    <div className="ams-topbar-sub">Aggregated statistics across all cases</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={fetchAnalytics}>
                    <RefreshCw size={13} /> Refresh
                </button>
            </div>

            <div className="ams-page">
                {!analytics ? (
                    <div className="ams-empty">
                        <div className="ams-empty-icon">📊</div>
                        <div className="ams-empty-text">No analytics data available yet</div>
                    </div>
                ) : (
                    <>
                        <AnalyticsKPIs analytics={analytics} />
                        <div className="ams-grid-2">
                            <VerdictDistributionCard distribution={analytics.verdict_distribution} />
                            <TopDomainsCard domains={analytics.top_domains} />
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
