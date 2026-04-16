import { useState, useEffect, useCallback } from 'react';
import { ScrollText, RefreshCw } from 'lucide-react';
import { getGlobalAudit } from '../lib/api';
import type { AuditEvent } from '../types';

const MODULES = [
    '', 'input_case_management', 'jurisdiction_detection', 'keyword_expansion',
    'search_orchestration', 'content_retrieval', 'deduplication',
    'risk_classification', 'contextual_analysis', 'report_generation',
];

export default function AuditLog() {
    const [events, setEvents] = useState<AuditEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterModule, setFilterModule] = useState('');
    const [filterType, setFilterType] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const fetchEvents = useCallback(async () => {
        try {
            const data = await getGlobalAudit(200);
            setEvents(data);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    const filtered = events.filter((ev) => {
        if (filterModule && ev.module !== filterModule) return false;
        if (filterType && !ev.event_type.toLowerCase().includes(filterType.toLowerCase())) return false;
        if (dateFrom && new Date(ev.created_at) < new Date(dateFrom)) return false;
        if (dateTo && new Date(ev.created_at) > new Date(dateTo + 'T23:59:59')) return false;
        return true;
    });

    const fmt = (d: string) => new Date(d).toLocaleString('en-GB');

    return (
        <>
            <div className="ams-topbar">
                <div>
                    <div className="ams-topbar-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <ScrollText size={20} style={{ color: '#e8530a' }} /> Global Audit Log
                    </div>
                    <div className="ams-topbar-sub">{filtered.length} events</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={fetchEvents}><RefreshCw size={13} /> Refresh</button>
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
                        onChange={(e) => setDateFrom(e.target.value)} title="From date" />
                    <input type="date" className="ams-input" style={{ width: 150 }} value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)} title="To date" />
                    {(filterModule || filterType || dateFrom || dateTo) && (
                        <button className="btn btn-ghost btn-sm" onClick={() => { setFilterModule(''); setFilterType(''); setDateFrom(''); setDateTo(''); }}>
                            Clear
                        </button>
                    )}
                </div>

                <div className="ams-table-wrap">
                    <table className="ams-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Case ID</th>
                                <th>Module</th>
                                <th>Event Type</th>
                                <th>Actor</th>
                                <th>Model Version</th>
                                <th>Hash</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#555', padding: 40 }}>Loading…</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7}>
                                        <div className="ams-empty">
                                            <div className="ams-empty-icon">📋</div>
                                            <div className="ams-empty-text">No audit events found</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered
                                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                    .map((ev) => (
                                        <tr key={ev.event_id}>
                                            <td style={{ fontSize: 11, color: '#555', whiteSpace: 'nowrap' }}>{fmt(ev.created_at)}</td>
                                            <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#555' }}>
                                                {ev.case_id ? ev.case_id.slice(0, 8) + '…' : '—'}
                                            </td>
                                            <td style={{ fontSize: 12, color: '#e8530a' }}>{ev.module?.replace(/_/g, ' ')}</td>
                                            <td style={{ fontSize: 12, color: '#ccc' }}>{ev.event_type}</td>
                                            <td style={{ fontSize: 12, color: '#888' }}>{ev.actor}</td>
                                            <td style={{ fontSize: 11, color: '#555' }}>{ev.model_version ?? '—'}</td>
                                            <td style={{ fontSize: 10, color: '#3a3a3a', fontFamily: 'monospace' }}>
                                                {ev.event_hash ? ev.event_hash.slice(0, 12) + '…' : '—'}
                                            </td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
