import { useState, useEffect, useCallback } from 'react';
import { Tag, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import {
    getKeywords, createKeyword, updateKeyword, toggleKeyword, deleteKeyword,
} from '../lib/api';
import StatusBadge from '../components/StatusBadge';
import type { Keyword } from '../types';

const EMPTY_KW: Partial<Keyword> = {
    keyword_en: '', category: 'adverse', active: true,
    purpose: 'general', entity_types: ['person', 'organisation'],
};

export default function KeywordManagement() {
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [showInactive, setShowInactive] = useState(false);
    const [filterPurpose, setFilterPurpose] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<'add' | 'edit' | null>(null);
    const [editing, setEditing] = useState<Partial<Keyword>>(EMPTY_KW);
    const [editId, setEditId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchAll = useCallback(async () => {
        try {
            const data = await getKeywords();
            setKeywords(data);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const filtered = keywords.filter((k) => {
        if (!showInactive && !k.active) return false;
        if (filterPurpose && k.purpose !== filterPurpose) return false;
        if (filterCategory && k.category !== filterCategory) return false;
        return true;
    });

    const openAdd = () => { setEditing(EMPTY_KW); setEditId(null); setError(''); setModal('add'); };
    const openEdit = (k: Keyword) => {
        setEditing({ ...k });
        setEditId(k.id ?? k.keyword_en);
        setError('');
        setModal('edit');
    };

    const handleSave = async () => {
        if (!editing.keyword_en?.trim()) { setError('Keyword is required'); return; }
        setSaving(true); setError('');
        try {
            if (modal === 'add') await createKeyword(editing);
            else if (editId) await updateKeyword(editId, editing);
            await fetchAll();
            setModal(null);
        } catch (err: unknown) {
            const e = err as { response?: { status?: number; data?: { detail?: string } } };
            if (e?.response?.status === 409) setError('Keyword already exists');
            else setError(e?.response?.data?.detail ?? 'Save failed');
        } finally { setSaving(false); }
    };

    const handleToggle = async (k: Keyword) => {
        await toggleKeyword(k.id ?? k.keyword_en);
        await fetchAll();
    };

    const handleDelete = async (k: Keyword) => {
        if (!window.confirm(`Deactivate "${k.keyword_en}"?`)) return;
        await deleteKeyword(k.id ?? k.keyword_en);
        await fetchAll();
    };

    const toggleEntityType = (et: string) => {
        const current = editing.entity_types ?? [];
        setEditing((e) => ({
            ...e,
            entity_types: current.includes(et) ? current.filter((x) => x !== et) : [...current, et],
        }));
    };

    const ENTITY_TYPES = ['person', 'organisation', 'fund'];

    return (
        <>
            <div className="ams-topbar">
                <div>
                    <div className="ams-topbar-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Tag size={20} style={{ color: '#e8530a' }} /> Keyword Management
                    </div>
                    <div className="ams-topbar-sub">{filtered.length} keywords</div>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>
                    <Plus size={14} /> Add Keyword
                </button>
            </div>

            <div className="ams-page">
                <div className="ams-filters">
                    <select className="ams-select" style={{ width: 140 }} value={filterPurpose} onChange={(e) => setFilterPurpose(e.target.value)}>
                        <option value="">All Purposes</option>
                        <option value="general">General</option>
                        <option value="site_query">Site Query</option>
                    </select>
                    <input className="ams-input" style={{ width: 180 }} placeholder="Filter category…"
                        value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} />
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#888', cursor: 'pointer' }}>
                        <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
                        Show inactive
                    </label>
                </div>

                <div className="ams-table-wrap">
                    <table className="ams-table">
                        <thead>
                            <tr><th>Keyword</th><th>Category</th><th>Purpose</th><th>Entity Types</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#555', padding: 40 }}>Loading…</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6}><div className="ams-empty"><div className="ams-empty-text">No keywords found</div></div></td></tr>
                            ) : (
                                filtered.map((k) => (
                                    <tr key={k.keyword_en}>
                                        <td style={{ fontWeight: 500, color: '#e2e8f0' }}>{k.keyword_en}</td>
                                        <td style={{ fontSize: 12, color: '#888' }}>{k.category ?? '—'}</td>
                                        <td style={{ fontSize: 12, color: '#888' }}>{k.purpose}</td>
                                        <td style={{ fontSize: 11, color: '#666' }}>{k.entity_types.join(', ')}</td>
                                        <td><StatusBadge status={k.active ? 'active' : 'inactive'} /></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 5 }}>
                                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(k)} title="Edit"><Pencil size={13} /></button>
                                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleToggle(k)} title="Toggle">
                                                    {k.active ? <ToggleRight size={15} style={{ color: '#22c55e' }} /> : <ToggleLeft size={15} style={{ color: '#555' }} />}
                                                </button>
                                                <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(k)} title="Delete"><Trash2 size={13} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && (
                <div className="ams-modal-overlay" onClick={() => setModal(null)}>
                    <div className="ams-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ams-modal-title">{modal === 'add' ? 'Add Keyword' : 'Edit Keyword'}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="ams-form-group">
                                <label className="ams-form-label">Keyword (English) *</label>
                                <input className="ams-input" placeholder="e.g. fraud investigation" value={editing.keyword_en ?? ''}
                                    onChange={(e) => setEditing((x) => ({ ...x, keyword_en: e.target.value }))} disabled={modal === 'edit'} />
                            </div>
                            <div className="ams-form-group">
                                <label className="ams-form-label">Category</label>
                                <input className="ams-input" placeholder="adverse, regulatory, financial_crime…" value={editing.category ?? ''}
                                    onChange={(e) => setEditing((x) => ({ ...x, category: e.target.value }))} />
                            </div>
                            <div className="ams-form-group">
                                <label className="ams-form-label">Purpose</label>
                                <select className="ams-select" value={editing.purpose ?? 'general'}
                                    onChange={(e) => setEditing((x) => ({ ...x, purpose: e.target.value as Keyword['purpose'] }))}>
                                    <option value="general">General</option>
                                    <option value="site_query">Site Query</option>
                                </select>
                            </div>
                            <div className="ams-form-group">
                                <label className="ams-form-label">Entity Types</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {ENTITY_TYPES.map((et) => (
                                        <button key={et} type="button" className="btn btn-sm"
                                            style={{ background: (editing.entity_types ?? []).includes(et) ? 'rgba(232,83,10,0.15)' : '#1a1a1a', color: (editing.entity_types ?? []).includes(et) ? '#e8530a' : '#666', border: `1px solid ${(editing.entity_types ?? []).includes(et) ? 'rgba(232,83,10,0.4)' : '#2a2a2a'}` }}
                                            onClick={() => toggleEntityType(et)}
                                        >
                                            {et}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="ams-form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#aaa' }}>
                                    <input type="checkbox" checked={editing.active ?? true}
                                        onChange={(e) => setEditing((x) => ({ ...x, active: e.target.checked }))} />
                                    Active
                                </label>
                            </div>
                        </div>
                        {error && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 12 }}>{error}</div>}
                        <div className="ams-modal-footer">
                            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving…' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
