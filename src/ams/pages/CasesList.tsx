import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSearch, Plus, RefreshCw } from 'lucide-react';
import { useCases } from '../contexts/CasesContext';
import { usePolling } from '../hooks/usePolling';
import { CasesTable } from '../components/ui/CasesUI';
import type { CaseStatus } from '../types';

const ALL_STATUSES: CaseStatus[] = [
    'SUBMITTED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED',
];

export default function CasesList() {
    const navigate = useNavigate();
    const { cases, casesLoading, fetchCases, rerunCase, cancelCase } = useCases();
    const [filterStatus, setFilterStatus] = useState<CaseStatus | ''>('');
    const [search, setSearch] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [actioning, setActioning] = useState<string | null>(null);

    const hasProcessing = cases.some((c) => c.status === 'PROCESSING');
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
                <div className="ams-filters">
                    <input className="ams-input" style={{ width: 220 }} placeholder="Search entity name…"
                        value={search} onChange={(e) => setSearch(e.target.value)} />
                    <select className="ams-select" style={{ width: 170 }} value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as CaseStatus | '')}>
                        <option value="">All Statuses</option>
                        {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="btn btn-ghost btn-sm" onClick={() => fetchCases()}>
                        <RefreshCw size={13} />
                    </button>
                </div>

                <CasesTable
                    cases={filtered}
                    loading={casesLoading}
                    copiedId={copiedId}
                    actioning={actioning}
                    onRowClick={(id) => navigate(`/ams/cases/${id}`)}
                    onCopyId={copyId}
                    onRerun={handleRerun}
                    onCancel={handleCancel}
                />
            </div>
        </>
    );
}
