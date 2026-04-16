import type { CaseListItem } from '../../types';
import StatusBadge from './StatusBadge';

// ─── KPI Card ───────────────────────────────────────────────────────────────
interface KPICardProps {
    title: string;
    value: string | number;
    label: string;
    icon?: React.ReactNode;
    valueColor?: string;
}

export function KPICard({ title, value, label, icon, valueColor }: KPICardProps) {
    return (
        <div className="ams-card">
            <div className="ams-card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {icon && icon}
                {title}
            </div>
            <div className="ams-stat-val" style={{ color: valueColor }}>{value}</div>
            <div className="ams-stat-label">{label}</div>
        </div>
    );
}

// ─── Verdict Bar ────────────────────────────────────────────────────────────
interface VerdictBarProps {
    label: string;
    count: number;
    pct: number;
    color: string;
}

export function VerdictBar({ label, count, pct, color }: VerdictBarProps) {
    return (
        <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color }}>{label}</span>
                <span style={{ color: '#888' }}>{count} ({pct}%)</span>
            </div>
            <div style={{ height: 6, background: '#1e1e1e', borderRadius: 3, overflow: 'hidden' }}>
                <div
                    style={{
                        height: '100%', width: `${pct}%`, background: color,
                        borderRadius: 3, transition: 'width 0.8s ease',
                    }}
                />
            </div>
        </div>
    );
}

// ─── Top Domain Row ─────────────────────────────────────────────────────────
interface TopDomainRowProps {
    domain: string;
    count: number;
    rank: number;
}

export function TopDomainRow({ domain, count, rank }: TopDomainRowProps) {
    return (
        <div
            style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 0', borderBottom: '1px solid #1e1e1e', fontSize: 13,
            }}
        >
            <span style={{ color: '#aaa' }}>
                <span style={{ color: '#444', marginRight: 8, fontSize: 11 }}>{rank}.</span>
                {domain}
            </span>
            <span style={{ color: '#e8530a', fontWeight: 600 }}>{count}</span>
        </div>
    );
}

// ─── Recent Cases Table ─────────────────────────────────────────────────────
interface RecentCasesTableProps {
    cases: CaseListItem[];
    onRowClick: (caseId: string) => void;
    onNewCaseClick: () => void;
}

export function RecentCasesTable({ cases, onRowClick, onNewCaseClick }: RecentCasesTableProps) {
    const fmt = (d: string) =>
        new Date(d).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
        });

    if (cases.length === 0) {
        return (
            <div className="ams-empty">
                <div className="ams-empty-icon">📋</div>
                <div className="ams-empty-text">No cases yet. Create one to get started.</div>
                <button
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: 12 }}
                    onClick={onNewCaseClick}
                >
                    + New Case
                </button>
            </div>
        );
    }

    return (
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
                    {cases.map((c) => (
                        <tr
                            key={c.case_id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => onRowClick(c.case_id)}
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
    );
}
