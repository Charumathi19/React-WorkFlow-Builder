import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSearch, Plus, RefreshCw, Copy, Check } from 'lucide-react';
import { getCases, rerunCase, cancelCase } from '../lib/api';
import { usePolling } from '../hooks/usePolling';
import StatusBadge from '../components/StatusBadge';
import type { CaseListItem, CaseStatus } from '../types';

const ALL_STATUSES: CaseStatus[] = [
    'SUBMITTED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED',
];

export default function CasesList() {
    const navigate = useNavigate();
    const [cases, setCases] = useState<CaseListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<CaseStatus | ''>('');
    const [search, setSearch] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [actioning, setActioning] = useState<string | null>(null);

    const hasProcessing = cases.some((c) => c.status === 'PROCESSING');

    const fetchCases = useCallback(async () => {
        try {
            const data = await getCases(100);
            setCases(data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCases(); }, [fetchCases]);
    usePolling(fetchCases, 10_000, hasProcessing);

    const filtered = cases.filter((c) => {
        if (filterStatus && c.status !== filterStatus) return false;
        if (search && !c.entities[0]?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const copyId = (id: string) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const handleRerun = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setActioning(id);
        try { await rerunCase(id); await fetchCases(); } finally { setActioning(null); }
    };

    const handleCancel = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setActioning(id);
        try { await cancelCase(id); await fetchCases(); } finally { setActioning(null); }
    };

    const fmt = (d: string) =>
        new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <>
            <div className="ams-topbar">
                <div>
                    <div className="ams-topbar-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FileSearch size={20} style={{ color: '#e8530a' }} /> Cases
                    </div>
                    <div className="ams-topbar-sub">{filtered.length} case{filtered.length !== 1 ? 's' : ''}</div>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/ams/cases/new')}>
                    <Plus size={14} /> New Case
                </button>
            </div>

            <div className="ams-page">
                {/* Filters */}
                <div className="ams-filters">
                    <input
                        className="ams-input"
                        style={{ width: 220 }}
                        placeholder="Search entity name…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="ams-select"
                        style={{ width: 170 }}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as CaseStatus | '')}
                    >
                        <option value="">All Statuses</option>
                        {ALL_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <button className="btn btn-ghost btn-sm" onClick={fetchCases}>
                        <RefreshCw size={13} />
                    </button>
                </div>

                <div className="ams-table-wrap">
                    <table className="ams-table">
                        <thead>
                            <tr>
                                <th>Entity</th>
                                <th>Case ID</th>
                                <th>Status</th>
                                <th>Languages</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#555', padding: 40 }}>Loading…</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="ams-empty">
                                            <div className="ams-empty-icon">📂</div>
                                            <div className="ams-empty-text">No cases found</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((c) => (
                                    <tr
                                        key={c.case_id}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/ams/cases/${c.case_id}`)}
                                    >
                                        <td style={{ fontWeight: 500, color: '#e2e8f0' }}>{c.entities[0]}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span style={{ fontFamily: 'monospace', color: '#666', fontSize: 11 }}>
                                                    {c.case_id.slice(0, 8)}…
                                                </span>
                                                <button
                                                    className="btn btn-ghost btn-icon btn-sm"
                                                    style={{ padding: '2px 5px' }}
                                                    onClick={(e) => { e.stopPropagation(); copyId(c.case_id); }}
                                                    title="Copy ID"
                                                >
                                                    {copiedId === c.case_id ? <Check size={11} style={{ color: '#22c55e' }} /> : <Copy size={11} />}
                                                </button>
                                            </div>
                                        </td>
                                        <td><StatusBadge status={c.status} /></td>
                                        <td style={{ color: '#888', fontSize: 12 }}>{c.languages.join(', ')}</td>
                                        <td style={{ color: '#666' }}>{fmt(c.created_at)}</td>
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                {(c.status === 'COMPLETED' || c.status === 'FAILED') && (
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        disabled={actioning === c.case_id}
                                                        onClick={(e) => handleRerun(e, c.case_id)}
                                                    >
                                                        Re-run
                                                    </button>
                                                )}
                                                {(c.status === 'SUBMITTED' || c.status === 'PROCESSING') && (
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        disabled={actioning === c.case_id}
                                                        onClick={(e) => handleCancel(e, c.case_id)}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
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
