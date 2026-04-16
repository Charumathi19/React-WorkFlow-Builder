import { useState, useEffect } from 'react';
import { Tag, Plus } from 'lucide-react';
import { useKeywords } from '../contexts/KeywordsContext';
import { KeywordRow, KeywordFormModal } from '../components/ui/KeywordUI';
import type { Keyword } from '../types';

const EMPTY_KW: Partial<Keyword> = {
    keyword_en: '', category: 'adverse', active: true,
    purpose: 'general', entity_types: ['person', 'organisation'],
};

export default function KeywordManagement() {
    const {
        keywords, keywordsLoading,
        fetchKeywords, addKeyword, editKeyword, toggleKeyword, removeKeyword,
    } = useKeywords();

    const [showInactive, setShowInactive] = useState(false);
    const [filterPurpose, setFilterPurpose] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [modal, setModal] = useState<'add' | 'edit' | null>(null);
    const [editing, setEditing] = useState<Partial<Keyword>>(EMPTY_KW);
    const [editId, setEditId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => { fetchKeywords(); }, [fetchKeywords]);

    const filtered = keywords.filter((k) => {
        if (!showInactive && !k.active) return false;
        if (filterPurpose && k.purpose !== filterPurpose) return false;
        if (filterCategory && k.category !== filterCategory) return false;
        return true;
    });

    const openAdd = () => { setEditing(EMPTY_KW); setEditId(null); setError(''); setModal('add'); };
    const openEdit = (k: Keyword) => { setEditing({ ...k }); setEditId(k.id ?? k.keyword_en); setError(''); setModal('edit'); };

    const handleSave = async () => {
        if (!editing.keyword_en?.trim()) { setError('Keyword is required'); return; }
        setSaving(true); setError('');
        try {
            if (modal === 'add') await addKeyword(editing);
            else if (editId) await editKeyword(editId, editing);
            setModal(null);
        } catch (err: unknown) {
            const e = err as { response?: { status?: number; data?: { detail?: string } } };
            setError(e?.response?.status === 409 ? 'Keyword already exists' : (e?.response?.data?.detail ?? 'Save failed'));
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
                        <Tag size={20} style={{ color: '#e8530a' }} /> Keyword Management
                    </div>
                    <div className="ams-topbar-sub">{filtered.length} keywords</div>
                </div>
                <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Keyword</button>
            </div>

            <div className="ams-page">
                <div className="ams-filters">
                    <select className="ams-select" style={{ width: 140 }} value={filterPurpose} onChange={(e) => setFilterPurpose(e.target.value)}>
                        <option value="">All Purposes</option>
                        <option value="general">General</option><option value="site_query">Site Query</option>
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
                            {keywordsLoading && !keywords.length ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#555', padding: 40 }}>Loading…</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6}><div className="ams-empty"><div className="ams-empty-text">No keywords found</div></div></td></tr>
                            ) : (
                                filtered.map((k) => (
                                    <KeywordRow
                                        key={k.keyword_en}
                                        keyword={k}
                                        onEdit={openEdit}
                                        onToggle={toggleKeyword}
                                        onDelete={removeKeyword}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && (
                <KeywordFormModal
                    mode={modal}
                    editing={editing}
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
