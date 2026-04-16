import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, ChevronRight, ChevronLeft, Plus, X } from 'lucide-react';
import { useCases } from '../contexts/CasesContext';
import { useDomains } from '../contexts/DomainsContext';
import { useKeywords } from '../contexts/KeywordsContext';
import type { NewCasePayload } from '../types';

const LANGUAGES = [
    'English', 'Mandarin Chinese', 'Spanish', 'French', 'Arabic', 'Russian',
    'Portuguese', 'Hebrew', 'Finnish', 'Croatian', 'Dutch', 'Italian', 'German',
];

const INITIAL_DETAILS = {
    entity_type: '' as '' | 'person' | 'organization',
    gender: '' as '' | 'male' | 'female',
    date_of_birth: '',
    nationality: '',
    place_of_birth: '',
    id_number: '',
    address: '',
    aliases: [] as string[],
};

export default function NewCase() {
    const navigate = useNavigate();
    const { createCase, runCase } = useCases();
    const { domains, fetchDomains } = useDomains();
    const { keywords, fetchKeywords } = useKeywords();

    const [step, setStep] = useState(0);
    const [entityName, setEntityName] = useState('');
    const [languages, setLanguages] = useState<string[]>(['English']);
    const [details, setDetails] = useState(INITIAL_DETAILS);
    const [aliasInput, setAliasInput] = useState('');
    const [selDomains, setSelDomains] = useState<string[]>([]);
    const [selKeywords, setSelKeywords] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDomains();
        fetchKeywords();
    }, [fetchDomains, fetchKeywords]);

    const toggleLang = (lang: string) =>
        setLanguages((prev) =>
            prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
        );

    const toggleDomain = (d: string) =>
        setSelDomains((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

    const toggleKeyword = (k: string) =>
        setSelKeywords((prev) => prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]);

    const addAlias = () => {
        if (aliasInput.trim()) {
            setDetails((d) => ({ ...d, aliases: [...d.aliases, aliasInput.trim()] }));
            setAliasInput('');
        }
    };

    const removeAlias = (i: number) =>
        setDetails((d) => ({ ...d, aliases: d.aliases.filter((_, idx) => idx !== i) }));

    const handleSubmit = async () => {
        if (!entityName.trim()) { setError('Entity name is required'); return; }
        if (languages.length === 0) { setError('Select at least one language'); return; }
        setSubmitting(true);
        setError('');
        try {
            const payload: NewCasePayload = {
                entities: [entityName.trim()],
                languages,
                subject_details: {
                    ...(details.entity_type && { entity_type: details.entity_type }),
                    ...(details.gender && { gender: details.gender }),
                    ...(details.date_of_birth && { date_of_birth: details.date_of_birth }),
                    ...(details.nationality && { nationality: details.nationality }),
                    ...(details.place_of_birth && { place_of_birth: details.place_of_birth }),
                    ...(details.id_number && { id_number: details.id_number }),
                    ...(details.address && { address: details.address }),
                    ...(details.aliases.length > 0 && { aliases: details.aliases }),
                },
                selected_domains: selDomains.length ? selDomains : null,
                selected_keywords: selKeywords.length ? selKeywords : null,
            };
            const caseId = await createCase(payload);
            await runCase(caseId);
            navigate(`/ams/cases/${caseId}`);
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { detail?: string } } };
            setError(axiosErr?.response?.data?.detail ?? 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const steps = ['Entity', 'Subject Details', 'Screening Options', 'Review'];

    return (
        <>
            <div className="ams-topbar">
                <div>
                    <div className="ams-topbar-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FilePlus size={20} style={{ color: '#e8530a' }} /> New Screening Case
                    </div>
                    <div className="ams-topbar-sub">Submit an entity for adverse media screening</div>
                </div>
            </div>

            <div className="ams-page">
                {/* Step indicator */}
                <div style={{ display: 'flex', gap: 0, marginBottom: 32 }}>
                    {steps.map((s, i) => (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : undefined }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: i < step ? '#22c55e' : i === step ? '#e8530a' : '#1e1e1e', color: i <= step ? '#fff' : '#444' }}>
                                    {i < step ? '✓' : i + 1}
                                </div>
                                <span style={{ fontSize: 13, color: i === step ? '#e2e8f0' : '#555', fontWeight: i === step ? 600 : 400 }}>{s}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <div style={{ flex: 1, height: 1, background: i < step ? '#22c55e44' : '#222', margin: '0 16px' }} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="ams-card" style={{ maxWidth: 680 }}>
                    {/* Step 0: Entity */}
                    {step === 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div className="ams-form-group">
                                <label className="ams-form-label">Entity Name *</label>
                                <input className="ams-input" placeholder="e.g. John Smith" value={entityName} onChange={(e) => setEntityName(e.target.value)} autoFocus />
                            </div>
                            <div className="ams-form-group">
                                <label className="ams-form-label">Languages *</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                                    {LANGUAGES.map((lang) => (
                                        <button key={lang} type="button" className="btn btn-sm"
                                            style={{ background: languages.includes(lang) ? 'rgba(232,83,10,0.15)' : '#1a1a1a', color: languages.includes(lang) ? '#e8530a' : '#666', border: `1px solid ${languages.includes(lang) ? 'rgba(232,83,10,0.4)' : '#2a2a2a'}` }}
                                            onClick={() => toggleLang(lang)}>
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Subject Details */}
                    {step === 1 && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="ams-form-group">
                                <label className="ams-form-label">Entity Type</label>
                                <select className="ams-select" value={details.entity_type} onChange={(e) => setDetails((d) => ({ ...d, entity_type: e.target.value as '' | 'person' | 'organization' }))}>
                                    <option value="">— Select —</option><option value="person">Person</option><option value="organization">Organization</option>
                                </select>
                            </div>
                            <div className="ams-form-group">
                                <label className="ams-form-label">Gender</label>
                                <select className="ams-select" value={details.gender} onChange={(e) => setDetails((d) => ({ ...d, gender: e.target.value as '' | 'male' | 'female' }))}>
                                    <option value="">— Select —</option><option value="male">Male</option><option value="female">Female</option>
                                </select>
                            </div>
                            <div className="ams-form-group">
                                <label className="ams-form-label">Date of Birth</label>
                                <input type="date" className="ams-input" value={details.date_of_birth} onChange={(e) => setDetails((d) => ({ ...d, date_of_birth: e.target.value }))} />
                            </div>
                            <div className="ams-form-group">
                                <label className="ams-form-label">Nationality (ISO)</label>
                                <input className="ams-input" placeholder="e.g. IL, MY" value={details.nationality} onChange={(e) => setDetails((d) => ({ ...d, nationality: e.target.value.toUpperCase() }))} maxLength={2} />
                            </div>
                            <div className="ams-form-group">
                                <label className="ams-form-label">Place of Birth</label>
                                <input className="ams-input" placeholder="City, Country" value={details.place_of_birth} onChange={(e) => setDetails((d) => ({ ...d, place_of_birth: e.target.value }))} />
                            </div>
                            <div className="ams-form-group">
                                <label className="ams-form-label">ID Number</label>
                                <input className="ams-input" placeholder="Passport / National ID" value={details.id_number} onChange={(e) => setDetails((d) => ({ ...d, id_number: e.target.value }))} />
                            </div>
                            <div className="ams-form-group" style={{ gridColumn: '1/-1' }}>
                                <label className="ams-form-label">Address</label>
                                <input className="ams-input" placeholder="Full address" value={details.address} onChange={(e) => setDetails((d) => ({ ...d, address: e.target.value }))} />
                            </div>
                            <div className="ams-form-group" style={{ gridColumn: '1/-1' }}>
                                <label className="ams-form-label">Aliases</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input className="ams-input" placeholder="Add alias…" value={aliasInput} onChange={(e) => setAliasInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addAlias()} />
                                    <button className="btn btn-ghost btn-sm" onClick={addAlias}><Plus size={13} /></button>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                                    {details.aliases.map((a, i) => (
                                        <span key={i} style={{ background: '#1e1e1e', color: '#aaa', padding: '4px 10px', borderRadius: 6, fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                                            {a}<button onClick={() => removeAlias(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 0 }}><X size={11} /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Screening options */}
                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div className="ams-form-group">
                                <label className="ams-form-label">Domain Overrides ({selDomains.length} selected)</label>
                                <div style={{ maxHeight: 200, overflowY: 'auto', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: 8 }}>
                                    {domains.filter(d => d.active).map((d) => (
                                        <label key={d.domain} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 6px', cursor: 'pointer', borderRadius: 5, fontSize: 13, color: '#aaa' }}>
                                            <input type="checkbox" checked={selDomains.includes(d.domain)} onChange={() => toggleDomain(d.domain)} />
                                            {d.domain} <span style={{ color: '#555', fontSize: 11 }}>tier {d.tier}</span>
                                        </label>
                                    ))}
                                    {domains.length === 0 && <div style={{ color: '#555', fontSize: 12, padding: 8 }}>No domains loaded.</div>}
                                </div>
                            </div>
                            <div className="ams-form-group">
                                <label className="ams-form-label">Keyword Overrides ({selKeywords.length} selected)</label>
                                <div style={{ maxHeight: 200, overflowY: 'auto', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: 8 }}>
                                    {keywords.filter(k => k.active).map((k) => (
                                        <label key={k.keyword_en} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 6px', cursor: 'pointer', borderRadius: 5, fontSize: 13, color: '#aaa' }}>
                                            <input type="checkbox" checked={selKeywords.includes(k.keyword_en)} onChange={() => toggleKeyword(k.keyword_en)} />
                                            {k.keyword_en} <span style={{ color: '#555', fontSize: 11 }}>{k.category}</span>
                                        </label>
                                    ))}
                                    {keywords.length === 0 && <div style={{ color: '#555', fontSize: 12, padding: 8 }}>No keywords loaded.</div>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px 0', fontSize: 13 }}>
                                <span style={{ color: '#666' }}>Entity</span><span style={{ fontWeight: 600 }}>{entityName || '—'}</span>
                                <span style={{ color: '#666' }}>Languages</span><span>{languages.join(', ')}</span>
                                {details.entity_type && <><span style={{ color: '#666' }}>Type</span><span style={{ textTransform: 'capitalize' }}>{details.entity_type}</span></>}
                                {details.date_of_birth && <><span style={{ color: '#666' }}>DOB</span><span>{details.date_of_birth}</span></>}
                                {details.nationality && <><span style={{ color: '#666' }}>Nationality</span><span>{details.nationality}</span></>}
                                {details.aliases.length > 0 && <><span style={{ color: '#666' }}>Aliases</span><span>{details.aliases.join(', ')}</span></>}
                                {selDomains.length > 0 && <><span style={{ color: '#666' }}>Domains</span><span>{selDomains.length} selected</span></>}
                                {selKeywords.length > 0 && <><span style={{ color: '#666' }}>Keywords</span><span>{selKeywords.length} selected</span></>}
                            </div>
                            {error && <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>{error}</div>}
                        </div>
                    )}

                    {/* Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid #1e1e1e' }}>
                        <button className="btn btn-ghost" onClick={() => step === 0 ? navigate('/ams/cases') : setStep(s => s - 1)}>
                            <ChevronLeft size={14} /> {step === 0 ? 'Cancel' : 'Back'}
                        </button>
                        {step < 3 ? (
                            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>
                                Next <ChevronRight size={14} />
                            </button>
                        ) : (
                            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                                {submitting ? 'Submitting…' : '🚀 Submit & Run'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
