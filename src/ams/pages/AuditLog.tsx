import { useState, useEffect } from 'react';
import { ScrollText, RefreshCw } from 'lucide-react';
import { useAudit } from '../contexts/AuditContext';
import { AuditTable } from '../components/ui/AuditUI';

const MODULES = [
    '', 'input_case_management', 'jurisdiction_detection', 'keyword_expansion',
    'search_orchestration', 'content_retrieval', 'deduplication',
    'risk_classification', 'contextual_analysis', 'report_generation',
];

export default function AuditLog() {
    const { auditEvents, auditLoading, fetchGlobalAudit } = useAudit();
    const [filterModule, setFilterModule] = useState('');
    const [filterType, setFilterType] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => { fetchGlobalAudit(200); }, [fetchGlobalAudit]);

    const filtered = auditEvents
        .filter((ev) => {
            if (filterModule && ev.module !== filterModule) return false;
            if (filterType && !ev.event_type.toLowerCase().includes(filterType.toLowerCase())) return false;
            if (dateFrom && new Date(ev.created_at) < new Date(dateFrom)) return false;
            if (dateTo && new Date(ev.created_at) > new Date(dateTo + 'T23:59:59')) return false;
            return true;
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return (
        <>
            <div className="ams-topbar">
                <div>
                    <div className="ams-topbar-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <ScrollText size={20} style={{ color: '#e8530a' }} /> Global Audit Log
                    </div>
                    <div className="ams-topbar-sub">{filtered.length} events</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => fetchGlobalAudit(200)}>
                    <RefreshCw size={13} /> Refresh
                </button>
            </div>

            <div className="ams-page">
                <div className="ams-filters">
                    <select className="ams-select" style={{ width: 200 }} value={filterModule} onChange={(e) => setFilterModule(e.target.value)}>
                        <option value="">All Modules</option>
                        {MODULES.filter(Boolean).map((m) => (
                            <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
                        ))}
                    </select>
                    <input className="ams-input" style={{ width: 180 }} placeholder="Event type…"
                        value={filterType} onChange={(e) => setFilterType(e.target.value)} />
                    <input type="date" className="ams-input" style={{ width: 150 }} value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)} />
                    <input type="date" className="ams-input" style={{ width: 150 }} value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)} />
                    {(filterModule || filterType || dateFrom || dateTo) && (
                        <button className="btn btn-ghost btn-sm"
                            onClick={() => { setFilterModule(''); setFilterType(''); setDateFrom(''); setDateTo(''); }}>
                            Clear
                        </button>
                    )}
                </div>

                <AuditTable events={filtered} loading={auditLoading} />
            </div>
        </>
    );
}
