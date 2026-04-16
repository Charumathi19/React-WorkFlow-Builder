import { Copy, Check } from 'lucide-react';
import type { CaseListItem, CaseStatus } from '../../types';
import StatusBadge from './StatusBadge';

// ─── Cases Table ─────────────────────────────────────────────────────────────
interface CasesTableProps {
    cases: CaseListItem[];
    loading: boolean;
    copiedId: string | null;
    actioning: string | null;
    onRowClick: (caseId: string) => void;
    onCopyId: (caseId: string) => void;
    onRerun: (e: React.MouseEvent, caseId: string) => void;
    onCancel: (e: React.MouseEvent, caseId: string) => void;
}

export function CasesTable({
    cases, loading, copiedId, actioning,
    onRowClick, onCopyId, onRerun, onCancel,
}: CasesTableProps) {
    const fmt = (d: string) =>
        new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
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
                    {loading && !cases.length ? (
                        <tr><td colSpan={6} style={{ textAlign: 'center', color: '#555', padding: 40 }}>Loading…</td></tr>
                    ) : cases.length === 0 ? (
                        <tr>
                            <td colSpan={6}>
                                <div className="ams-empty">
                                    <div className="ams-empty-icon">📂</div>
                                    <div className="ams-empty-text">No cases found</div>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        cases.map((c) => (
                            <tr key={c.case_id} style={{ cursor: 'pointer' }} onClick={() => onRowClick(c.case_id)}>
                                <td style={{ fontWeight: 500, color: '#e2e8f0' }}>{c.entities[0]}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontFamily: 'monospace', color: '#666', fontSize: 11 }}>
                                            {c.case_id.slice(0, 8)}…
                                        </span>
                                        <button
                                            className="btn btn-ghost btn-icon btn-sm"
                                            style={{ padding: '2px 5px' }}
                                            onClick={(e) => { e.stopPropagation(); onCopyId(c.case_id); }}
                                            title="Copy ID"
                                        >
                                            {copiedId === c.case_id
                                                ? <Check size={11} style={{ color: '#22c55e' }} />
                                                : <Copy size={11} />}
                                        </button>
                                    </div>
                                </td>
                                <td><StatusBadge status={c.status} /></td>
                                <td style={{ color: '#888', fontSize: 12 }}>{c.languages.join(', ')}</td>
                                <td style={{ color: '#666' }}>{fmt(c.created_at)}</td>
                                <td onClick={(e) => e.stopPropagation()}>
                                    <CaseActionButtons
                                        caseId={c.case_id}
                                        status={c.status}
                                        actioning={actioning}
                                        onRerun={onRerun}
                                        onCancel={onCancel}
                                    />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

// ─── Case Action Buttons ──────────────────────────────────────────────────────
interface CaseActionButtonsProps {
    caseId: string;
    status: CaseStatus;
    actioning: string | null;
    onRerun: (e: React.MouseEvent, caseId: string) => void;
    onCancel: (e: React.MouseEvent, caseId: string) => void;
}

export function CaseActionButtons({
    caseId, status, actioning, onRerun, onCancel,
}: CaseActionButtonsProps) {
    return (
        <div style={{ display: 'flex', gap: 6 }}>
            {(status === 'COMPLETED' || status === 'FAILED') && (
                <button
                    className="btn btn-ghost btn-sm"
                    disabled={actioning === caseId}
                    onClick={(e) => onRerun(e, caseId)}
                >
                    Re-run
                </button>
            )}
            {(status === 'SUBMITTED' || status === 'PROCESSING') && (
                <button
                    className="btn btn-danger btn-sm"
                    disabled={actioning === caseId}
                    onClick={(e) => onCancel(e, caseId)}
                >
                    Cancel
                </button>
            )}
        </div>
    );
}
