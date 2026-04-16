import type { CaseStatus, Verdict } from '../../types';

type BadgeType = CaseStatus | Verdict | 'active' | 'inactive';

interface Props {
    status: BadgeType;
    dot?: boolean;
}

const DOTS: Partial<Record<BadgeType, string>> = {
    SUBMITTED: '●',
    PROCESSING: '◌',
    COMPLETED: '●',
    FAILED: '●',
    CANCELLED: '●',
    ADVERSE: '▲',
    REQUIRES_REVIEW: '◆',
    CLEARED: '●',
    active: '●',
    inactive: '●',
};

export default function StatusBadge({ status, dot = true }: Props) {
    const label =
        status === 'REQUIRES_REVIEW'
            ? 'REVIEW'
            : status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ');
    return (
        <span className={`badge badge-${status}`}>
            {dot && <span style={{ fontSize: 8 }}>{DOTS[status]}</span>}
            {label}
        </span>
    );
}
