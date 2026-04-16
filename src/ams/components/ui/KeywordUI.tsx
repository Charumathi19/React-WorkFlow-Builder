import { ToggleLeft, ToggleRight, Pencil, Trash2 } from 'lucide-react';
import type { Keyword } from '../../types';
import StatusBadge from './StatusBadge';

const ENTITY_TYPES = ['person', 'organisation', 'fund'];

// ─── Keyword Table Row ────────────────────────────────────────────────────────
interface KeywordRowProps {
    keyword: Keyword;
    onEdit: (k: Keyword) => void;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}

export function KeywordRow({ keyword: k, onEdit, onToggle, onDelete }: KeywordRowProps) {
    return (
        <tr>
            <td style={{ fontWeight: 500, color: '#e2e8f0' }}>{k.keyword_en}</td>
            <td style={{ fontSize: 12, color: '#888' }}>{k.category ?? '—'}</td>
            <td style={{ fontSize: 12, color: '#888' }}>{k.purpose}</td>
            <td style={{ fontSize: 11, color: '#666' }}>{k.entity_types.join(', ')}</td>
            <td><StatusBadge status={k.active ? 'active' : 'inactive'} /></td>
            <td>
                <div style={{ display: 'flex', gap: 5 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onEdit(k)}>
                        <Pencil size={13} />
                    </button>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onToggle(k.id ?? k.keyword_en)}>
                        {k.active
                            ? <ToggleRight size={15} style={{ color: '#22c55e' }} />
                            : <ToggleLeft size={15} style={{ color: '#555' }} />}
                    </button>
                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => onDelete(k.id ?? k.keyword_en)}>
                        <Trash2 size={13} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ─── Keyword Form Modal ───────────────────────────────────────────────────────
interface KeywordFormModalProps {
    mode: 'add' | 'edit';
    editing: Partial<Keyword>;
    saving: boolean;
    error: string;
    onChange: (patch: Partial<Keyword>) => void;
    onToggleEntityType: (et: string) => void;
    onSave: () => void;
    onClose: () => void;
}

export function KeywordFormModal({
    mode, editing, saving, error,
    onChange, onToggleEntityType, onSave, onClose,
}: KeywordFormModalProps) {
    return (
        <div className="ams-modal-overlay" onClick={onClose}>
            <div className="ams-modal" onClick={(e) => e.stopPropagation()}>
                <div className="ams-modal-title">{mode === 'add' ? 'Add Keyword' : 'Edit Keyword'}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="ams-form-group">
                        <label className="ams-form-label">Keyword (English) *</label>
                        <input className="ams-input" placeholder="e.g. fraud investigation"
                            value={editing.keyword_en ?? ''}
                            onChange={(e) => onChange({ keyword_en: e.target.value })}
                            disabled={mode === 'edit'} />
                    </div>
                    <div className="ams-form-group">
                        <label className="ams-form-label">Category</label>
                        <input className="ams-input" placeholder="adverse, regulatory, financial_crime…"
                            value={editing.category ?? ''}
                            onChange={(e) => onChange({ category: e.target.value })} />
                    </div>
                    <div className="ams-form-group">
                        <label className="ams-form-label">Purpose</label>
                        <select className="ams-select" value={editing.purpose ?? 'general'}
                            onChange={(e) => onChange({ purpose: e.target.value as Keyword['purpose'] })}>
                            <option value="general">General</option>
                            <option value="site_query">Site Query</option>
                        </select>
                    </div>
                    <div className="ams-form-group">
                        <label className="ams-form-label">Entity Types</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {ENTITY_TYPES.map((et) => {
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
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#aaa' }}>
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
