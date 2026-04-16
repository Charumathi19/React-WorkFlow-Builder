import { useState, useEffect, useCallback } from 'react';
import { Globe, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import {
    getDomains, createDomain, updateDomain,
    toggleDomain, deleteDomain, getEntityTypes,
} from '../lib/api';
import StatusBadge from '../components/StatusBadge';
import type { Domain } from '../types';

const EMPTY_DOMAIN: Partial<Domain> = {
    domain: '', category: 'global_media', tier: 2, active: true,
    purpose: 'filter', entity_types: ['person', 'organisation'],
};

export default function DomainManagement() {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [entityTypes, setEntityTypes] = useState<string[]>(['person', 'organisation', 'fund']);
    const [showInactive, setShowInactive] = useState(false);
    const [filterPurpose, setFilterPurpose] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterTier, setFilterTier] = useState('');
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<'add' | 'edit' | null>(null);
    const [editing, setEditing] = useState<Partial<Domain>>(EMPTY_DOMAIN);
    const [editId, setEditId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const fetchAll = useCallback(async () => {
        try {
            const [d, et] = await Promise.allSettled([getDomains(), getEntityTypes()]);
            if (d.status === 'fulfilled') setDomains(d.value);
            if (et.status === 'fulfilled') setEntityTypes(et.value);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const filtered = domains.filter((d) => {
        if (!showInactive && !d.active) return false;
        if (filterPurpose && d.purpose !== filterPurpose) return false;
        if (filterCategory && d.category !== filterCategory) return false;
        if (filterTier && String(d.tier) !== filterTier) return false;
        return true;
    });

    const openAdd = () => { setEditing(EMPTY_DOMAIN); setEditId(null); setError(''); setModal('add'); };
    const openEdit = (d: Domain) => {
        setEditing({ ...d });
        setEditId(d.id ?? d.domain);
        setError('');
        setModal('edit');
    };

    const handleSave = async () => {
        if (!editing.domain?.trim()) { setError('Domain is required'); return; }
        if (!editing.category) { setError('Category is required'); return; }
        setSaving(true); setError('');
        try {
            if (modal === 'add') {
                await createDomain(editing);
            } else if (editId) {
                await updateDomain(editId, editing);
            }
            await fetchAll();
            setModal(null);
        } catch (err: unknown) {
            const e = err as { response?: { status?: number; data?: { detail?: string } } };
            if (e?.response?.status === 409) setError('Domain already exists');
            else setError(e?.response?.data?.detail ?? 'Save failed');
        } finally { setSaving(false); }
    };

    const handleToggle = async (d: Domain) => {
        const id = d.id ?? d.domain;
        await toggleDomain(id);
        await fetchAll();
    };

    const handleDelete = async (d: Domain) => {
        if (!window.confirm(`Deactivate ${d.domain}?`)) return;
        const id = d.id ?? d.domain;
        await deleteDomain(id);
        await fetchAll();
    };

    const toggleEntityType = (et: string) => {
        const current = editing.entity_types ?? [];
        setEditing((e) => ({
            ...e,
            entity_types: current.includes(et) ? current.filter((x) => x !== et) : [...current, et],
        }));
    };

    return (
        <>
            <div className="ams-topbar">
                <div>
                    <div className="ams-topbar-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Globe size={20} style={{ color: '#e8530a' }} /> Domain Management
                    </div>
                    <div className="ams-topbar-sub">{filtered.length} domains</div>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>
                    <Plus size={14} /> Add Domain
                </button>
            </div>

            <div className="ams-page">
                {/* Filters */}
                <div className="ams-filters">
                    <select className="ams-select" style={{ width: 140 }} value={filterPurpose} onChange={(e) => setFilterPurpose(e.target.value)}>
                        <option value="">All Purposes</option>
                        <option value="whitelist">Whitelist</option>
                        <option value="filter">Filter</option>
                        <option value="search">Search</option>
                    </select>
                    <select className="ams-select" style={{ width: 160 }} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                        <option value="">All Categories</option>
                        <option value="compliance">Compliance</option>
                        <option value="global_media">Global Media</option>
                        <option value="regional">Regional</option>
                        <option value="specialist">Specialist</option>
                    </select>
                    <select className="ams-select" style={{ width: 100 }} value={filterTier} onChange={(e) => setFilterTier(e.target.value)}>
                        <option value="">All Tiers</option>
                        <option value="1">Tier 1</option>
                        <option value="2">Tier 2</option>
                        <option value="3">Tier 3</option>
                    </select>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#888', cursor: 'pointer' }}>
                        <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
                        Show inactive
                    </label>
                </div>

                <div className="ams-table-wrap">
                    <table className="ams-table">
                        <thead>
                            <tr><th>Domain</th><th>Category</th><th>Tier</th><th>Purpose</th><th>Region</th><th>Entity Types</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', color: '#555', padding: 40 }}>Loading…</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={8}><div className="ams-empty"><div className="ams-empty-text">No domains found</div></div></td></tr>
                            ) : (
                                filtered.map((d) => (
                                    <tr key={d.domain}>
                                        <td style={{ fontWeight: 500, color: '#e2e8f0' }}>{d.domain}</td>
                                        <td style={{ fontSize: 12, color: '#888', textTransform: 'capitalize' }}>{d.category.replace('_', ' ')}</td>
                                        <td style={{ fontSize: 12 }}>
                                            <span style={{ background: '#1e1e1e', color: '#e8530a', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>T{d.tier}</span>
                                        </td>
                                        <td style={{ fontSize: 12, color: '#888' }}>{d.purpose}</td>
                                        <td style={{ fontSize: 12, color: '#666' }}>{d.region ?? '—'}</td>
                                        <td style={{ fontSize: 11, color: '#666' }}>{d.entity_types.join(', ')}</td>
                                        <td><StatusBadge status={d.active ? 'active' : 'inactive'} /></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 5 }}>
                                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(d)} title="Edit"><Pencil size={13} /></button>
                                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleToggle(d)} title="Toggle active">
                                                    {d.active ? <ToggleRight size={15} style={{ color: '#22c55e' }} /> : <ToggleLeft size={15} style={{ color: '#555' }} />}
                                                </button>
                                                <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(d)} title="Delete"><Trash2 size={13} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modal && (
                <div className="ams-modal-overlay" onClick={() => setModal(null)}>
                    <div className="ams-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ams-modal-title">{modal === 'add' ? 'Add Domain' : 'Edit Domain'}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div className="ams-form-group" style={{ gridColumn: '1/-1' }}>
                                <label className="ams-form-label">Domain *</label>
                                <input className="ams-input" placeholder="reuters.com" value={editing.domain ?? ''}
                                    onChange={(e) => setEditing((x) => ({ ...x, domain: e.target.value }))} disabled={modal === 'edit'} />
                            </div>
                            <div className="ams-form-group">
                                <label className="ams-form-label">Category *</label>
                                <select className="ams-select" value={editing.category ?? 'global_media'}
                                    onChange={(e) => setEditing((x) => ({ ...x, category: e.target.value as Domain['category'] }))}>
                                    <option value="compliance">Compliance</option>
                                    <option value="global_media">Global Media</option>
                                    <option value="regional">Regional</option>
                                    <option value="specialist">Specialist</option>
                                </select>
                            </div>
                            <div className="ams-form-group">
                                <label className="ams-form-label">Tier</label>
                                <select className="ams-select" value={editing.tier ?? 2}
                                    onChange={(e) => setEditing((x) => ({ ...x, tier: Number(e.target.value) as 1 | 2 | 3 }))}>
                                    <option value={1}>1 (Highest trust)</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3 (Lowest trust)</option>
                                </select>
                            </div>
                            <div className="ams-form-group">
                                <label className="ams-form-label">Purpose</label>
                                <select className="ams-select" value={editing.purpose ?? 'filter'}
                                    onChange={(e) => setEditing((x) => ({ ...x, purpose: e.target.value as Domain['purpose'] }))}>
                                    <option value="whitelist">Whitelist</option>
                                    <option value="filter">Filter</option>
                                    <option value="search">Search</option>
                                </select>
                            </div>
                            <div className="ams-form-group">
                                <label className="ams-form-label">Region (ISO)</label>
                                <input className="ams-input" placeholder="US, GB…" value={editing.region ?? ''}
                                    onChange={(e) => setEditing((x) => ({ ...x, region: e.target.value || null }))} />
                            </div>
                            <div className="ams-form-group">
                                <label className="ams-form-label">Sector</label>
                                <input className="ams-input" placeholder="finance, sanctions…" value={editing.sector ?? ''}
                                    onChange={(e) => setEditing((x) => ({ ...x, sector: e.target.value || null }))} />
                            </div>
                            <div className="ams-form-group" style={{ gridColumn: '1/-1' }}>
                                <label className="ams-form-label">Entity Types</label>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {entityTypes.map((et) => (
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
                                <label className="ams-form-label">Active</label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                                    <input type="checkbox" checked={editing.active ?? true}
                                        onChange={(e) => setEditing((x) => ({ ...x, active: e.target.checked }))} />
                                    {editing.active ? 'Active' : 'Inactive'}
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
