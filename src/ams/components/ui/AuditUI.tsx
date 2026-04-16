import type { AuditEvent } from '../../types';

interface AuditTableProps {
    events: AuditEvent[];
    loading: boolean;
}

export function AuditTable({ events, loading }: AuditTableProps) {
    return (
        <div className="ams-table-wrap">
            <table className="ams-table">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Case ID</th>
                        <th>Module</th>
                        <th>Event Type</th>
                        <th>Actor</th>
                        <th>Hash</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center', color: '#555', padding: 40 }}>Loading…</td>
                        </tr>
                    ) : events.length === 0 ? (
                        <tr>
                            <td colSpan={6}>
                                <div className="ams-empty">
                                    <div className="ams-empty-icon">📋</div>
                                    <div className="ams-empty-text">No audit events found</div>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        events.map((ev) => (
                            <tr key={ev.event_id}>
                                <td style={{ fontSize: 11, color: '#555', whiteSpace: 'nowrap' }}>
                                    {new Date(ev.created_at).toLocaleString('en-GB')}
                                </td>
                                <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#555' }}>
                                    {ev.case_id ? ev.case_id.slice(0, 8) + '…' : '—'}
                                </td>
                                <td style={{ fontSize: 12, color: '#e8530a' }}>
                                    {ev.module?.replace(/_/g, ' ')}
                                </td>
                                <td style={{ fontSize: 12, color: '#ccc' }}>{ev.event_type}</td>
                                <td style={{ fontSize: 12, color: '#888' }}>{ev.actor}</td>
                                <td style={{ fontSize: 10, color: '#3a3a3a', fontFamily: 'monospace' }}>
                                    {ev.event_hash ? ev.event_hash.slice(0, 12) + '…' : '—'}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
