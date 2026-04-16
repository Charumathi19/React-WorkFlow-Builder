import { useState, useEffect } from 'react';
import { Globe, Plus } from 'lucide-react';
import { useDomains } from '../contexts/DomainsContext';
import { DomainRow, DomainFormModal } from '../components/ui/DomainUI';
import type { Domain } from '../types';

const EMPTY_DOMAIN: Partial<Domain> = {
    domain: '', category: 'global_media', tier: 2, active: true,
    purpose: 'filter', entity_types: ['person', 'organisation'],
};

export default function DomainManagement() {
    const {
        domains, entityTypes, domainsLoading,
        fetchDomains, fetchEntityTypes, addDomain, editDomain, toggleDomain, removeDomain,
    } = useDomains();

    const [showInactive, setShowInactive] = useState(false);
    const [filterPurpose, setFilterPurpose] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterTier, setFilterTier] = useState('');
    const [modal, setModal] = useState<'add' | 'edit' | null>(null);
    const [editing, setEditing] = useState<Partial<Domain>>(EMPTY_DOMAIN);
    const [editId, setEditId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => { fetchDomains(); fetchEntityTypes(); }, [fetchDomains, fetchEntityTypes]);

    const filtered = domains.filter((d) => {
        if (!showInactive && !d.active) return false;
        if (filterPurpose && d.purpose !== filterPurpose) return false;
        if (filterCategory && d.category !== filterCategory) return false;
        if (filterTier && String(d.tier) !== filterTier) return false;
        return true;
    });

    const openAdd = () => { setEditing(EMPTY_DOMAIN); setEditId(null); setError(''); setModal('add'); };
    const openEdit = (d: Domain) => { setEditing({ ...d }); setEditId(d.id ?? d.domain); setError(''); setModal('edit'); };

    const handleSave = async () => {
        if (!editing.domain?.trim()) { setError('Domain is required'); return; }
        setSaving(true); setError('');
        try {
            if (modal === 'add') await addDomain(editing);
            else if (editId) await editDomain(editId, editing);
            setModal(null);
        } catch (err: unknown) {
            const e = err as { response?: { status?: number; data?: { detail?: string } } };
            setError(e?.response?.status === 409 ? 'Domain already exists' : (e?.response?.data?.detail ?? 'Save failed'));
        } finally { setSaving(false); }
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
                <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Domain</button>
            </div>

            <div className="ams-page">
                <div className="ams-filters">
                    <select className="ams-select" style={{ width: 140 }} value={filterPurpose} onChange={(e) => setFilterPurpose(e.target.value)}>
                        <option value="">All Purposes</option>
                        <option value="whitelist">Whitelist</option><option value="filter">Filter</option><option value="search">Search</option>
                    </select>
                    <select className="ams-select" style={{ width: 160 }} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                        <option value="">All Categories</option>
                        <option value="compliance">Compliance</option><option value="global_media">Global Media</option>
                        <option value="regional">Regional</option><option value="specialist">Specialist</option>
                    </select>
                    <select className="ams-select" style={{ width: 100 }} value={filterTier} onChange={(e) => setFilterTier(e.target.value)}>
                        <option value="">All Tiers</option>
                        <option value="1">Tier 1</option><option value="2">Tier 2</option><option value="3">Tier 3</option>
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
                            {domainsLoading && !domains.length ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', color: '#555', padding: 40 }}>Loading…</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={8}><div className="ams-empty"><div className="ams-empty-text">No domains found</div></div></td></tr>
                            ) : (
                                filtered.map((d) => (
                                    <DomainRow
                                        key={d.domain}
                                        domain={d}
                                        onEdit={openEdit}
                                        onToggle={async (domain) => { await toggleDomain(domain.id ?? domain.domain); }}
                                        onDelete={async (domain) => {
                                            if (window.confirm(`Deactivate ${domain.domain}?`))
                                                await removeDomain(domain.id ?? domain.domain);
                                        }}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && (
                <DomainFormModal
                    mode={modal}
                    editing={editing}
                    entityTypes={entityTypes}
                    saving={saving}
                    error={error}
                    onChange={(patch) => setEditing((e) => ({ ...e, ...patch }))}
                    onToggleEntityType={toggleEntityType}
                    onSave={handleSave}
                    onClose={() => setModal(null)}
                />
            )}
        </>
    );
}
