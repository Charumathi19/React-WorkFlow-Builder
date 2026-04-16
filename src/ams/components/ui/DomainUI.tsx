import type { Domain } from '../../types';
import StatusBadge from './StatusBadge';
import { Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

// ─── Domain Table Row ─────────────────────────────────────────────────────────
interface DomainRowProps {
    domain: Domain;
    onEdit: (d: Domain) => void;
    onToggle: (d: Domain) => void;
    onDelete: (d: Domain) => void;
}

export function DomainRow({ domain: d, onEdit, onToggle, onDelete }: DomainRowProps) {
    return (
        <tr>
            <td style={{ fontWeight: 500, color: '#e2e8f0' }}>{d.domain}</td>
            <td style={{ fontSize: 12, color: '#888', textTransform: 'capitalize' }}>
                {d.category.replace('_', ' ')}
            </td>
            <td>
                <span style={{ background: '#1e1e1e', color: '#e8530a', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                    T{d.tier}
                </span>
            </td>
            <td style={{ fontSize: 12, color: '#888' }}>{d.purpose}</td>
            <td style={{ fontSize: 12, color: '#666' }}>{d.region ?? '—'}</td>
            <td style={{ fontSize: 11, color: '#666' }}>{d.entity_types.join(', ')}</td>
            <td><StatusBadge status={d.active ? 'active' : 'inactive'} /></td>
            <td>
                <div style={{ display: 'flex', gap: 5 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onEdit(d)} title="Edit">
                        <Pencil size={13} />
                    </button>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onToggle(d)} title="Toggle">
                        {d.active
                            ? <ToggleRight size={15} style={{ color: '#22c55e' }} />
                            : <ToggleLeft size={15} style={{ color: '#555' }} />}
                    </button>
                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => onDelete(d)} title="Delete">
                        <Trash2 size={13} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ─── Domain Form Modal ────────────────────────────────────────────────────────
interface DomainFormModalProps {
    mode: 'add' | 'edit';
    editing: Partial<Domain>;
    entityTypes: string[];
    saving: boolean;
    error: string;
    onChange: (patch: Partial<Domain>) => void;
    onToggleEntityType: (et: string) => void;
    onSave: () => void;
    onClose: () => void;
}

export function DomainFormModal({
    mode, editing, entityTypes, saving, error,
    onChange, onToggleEntityType, onSave, onClose,
}: DomainFormModalProps) {
    return (
        <div className="ams-modal-overlay" onClick={onClose}>
            <div className="ams-modal" onClick={(e) => e.stopPropagation()}>
                <div className="ams-modal-title">{mode === 'add' ? 'Add Domain' : 'Edit Domain'}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="ams-form-group" style={{ gridColumn: '1/-1' }}>
                        <label className="ams-form-label">Domain *</label>
                        <input className="ams-input" placeholder="reuters.com" value={editing.domain ?? ''}
                            onChange={(e) => onChange({ domain: e.target.value })} disabled={mode === 'edit'} />
                    </div>
                    <div className="ams-form-group">
                        <label className="ams-form-label">Category *</label>
                        <select className="ams-select" value={editing.category ?? 'global_media'}
                            onChange={(e) => onChange({ category: e.target.value as Domain['category'] })}>
                            <option value="compliance">Compliance</option>
                            <option value="global_media">Global Media</option>
                            <option value="regional">Regional</option>
                            <option value="specialist">Specialist</option>
                        </select>
                    </div>
                    <div className="ams-form-group">
                        <label className="ams-form-label">Tier</label>
                        <select className="ams-select" value={editing.tier ?? 2}
                            onChange={(e) => onChange({ tier: Number(e.target.value) as 1 | 2 | 3 })}>
                            <option value={1}>1 (Highest trust)</option>
                            <option value={2}>2</option>
                            <option value={3}>3 (Lowest trust)</option>
                        </select>
                    </div>
                    <div className="ams-form-group">
                        <label className="ams-form-label">Purpose</label>
                        <select className="ams-select" value={editing.purpose ?? 'filter'}
                            onChange={(e) => onChange({ purpose: e.target.value as Domain['purpose'] })}>
                            <option value="whitelist">Whitelist</option>
                            <option value="filter">Filter</option>
                            <option value="search">Search</option>
                        </select>
                    </div>
                    <div className="ams-form-group">
                        <label className="ams-form-label">Region (ISO)</label>
                        <input className="ams-input" placeholder="US, GB…" value={editing.region ?? ''}
                            onChange={(e) => onChange({ region: e.target.value || null })} />
                    </div>
                    <div className="ams-form-group">
                        <label className="ams-form-label">Sector</label>
                        <input className="ams-input" placeholder="finance, sanctions…" value={editing.sector ?? ''}
                            onChange={(e) => onChange({ sector: e.target.value || null })} />
                    </div>
                    <div className="ams-form-group" style={{ gridColumn: '1/-1' }}>
                        <label className="ams-form-label">Entity Types</label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {entityTypes.map((et) => {
                                const active = (editing.entity_types ?? []).includes(et);
                                return (
                                    <button key={et} type="button" className="btn btn-sm"
                                        style={{
                                            background: active ? 'rgba(232,83,10,0.15)' : '#1a1a1a',
                                            color: active ? '#e8530a' : '#666',
                                            border: `1px solid ${active ? 'rgba(232,83,10,0.4)' : '#2a2a2a'}`,
                                        }}
                                        onClick={() => onToggleEntityType(et)}>
                                        {et}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="ams-form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                            <input type="checkbox" checked={editing.active ?? true}
                                onChange={(e) => onChange({ active: e.target.checked })} />
                            Active
                        </label>
                    </div>
                </div>
                {error && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 12 }}>{error}</div>}
                <div className="ams-modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={onSave} disabled={saving}>
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}
