import { useState, useEffect, useCallback, useRef } from 'react';

const BASE = import.meta.env.VITE_API_URL || 'https://backend-cleanit-erp.vercel.app';
const tk = () => localStorage.getItem('token') || '';
const api = (url, opts = {}) => fetch(BASE + url, { headers: { 'Authorization': 'Bearer ' + tk(), ...(opts.json ? {'Content-Type':'application/json'} : {}), ...(opts.headers||{}) }, ...opts });
const apiJ = (url, opts = {}) => api(url, { ...opts, json: true, body: opts.body ? JSON.stringify(opts.body) : undefined });

// ─── DESIGN SYSTEM ─────────────────────────────────────────────────────
const C = {
  bg: '#F2F5FA',
  white: '#FFFFFF',
  // Cards avec bordure élégante ultra-fine (style des screenshots)
  cardBorder: '1px solid rgba(0,0,0,0.07)',
  cardShadow: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(0,0,0,0.04)',
  cardBorderHover: '1px solid rgba(37,99,235,0.25)',
  cardShadowHover: '0 4px 16px rgba(37,99,235,0.08), 0 0 0 0.5px rgba(37,99,235,0.15)',
  text: '#0F172A', text2: '#374151', text3: '#6B7280', text4: '#9CA3AF',
  blue: '#2563EB', blueL: '#EFF6FF',
  green: '#16A34A', greenL: '#F0FDF4',
  amber: '#D97706', amberL: '#FFFBEB',
  red: '#DC2626', redL: '#FEF2F2',
  purple: '#7C3AED', purpleL: '#F5F3FF',
  teal: '#0D9488', tealL: '#F0FDFA',
  orange: '#EA580C', orangeL: '#FFF7ED',
  border: 'rgba(0,0,0,0.07)',
};

const Card = ({ children, onClick, style = {} }) => {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      style={{ background: C.white, borderRadius: 11, border: hov ? C.cardBorderHover : C.cardBorder, boxShadow: hov ? C.cardShadowHover : C.cardShadow, transition: 'all .15s ease', cursor: onClick ? 'pointer' : 'default', ...style }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {children}
    </div>
  );
};

const Badge = ({ label, color, bg }) => (
  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: bg, color, display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
    {label}
  </span>
);

const Toast = ({ msg }) => msg ? (
  <div style={{ position:'fixed', bottom:24, right:24, background:C.text, color:'#fff', padding:'10px 18px', borderRadius:9, fontSize:13, fontWeight:500, zIndex:9999, boxShadow:'0 8px 24px rgba(0,0,0,0.2)' }}>{msg}</div>
) : null;

// ─── CATALOGUE — VUE LISTE ──────────────────────────────────────────────
function CatalogueView({ types, loading, onSelect, onNew, isAdmin }) {
  return (
    <div style={{ padding: 28, background: C.bg, minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: C.text, margin: 0, letterSpacing: '-0.02em' }}>Catalogue des Projets</h1>
          <p style={{ color: C.text3, fontSize: 12, margin: '4px 0 0' }}>
            Chaque type de projet décrit le processus d'exécution de CleanIT SARL, phase par phase, avec photos terrain
          </p>
        </div>
        {isAdmin && (
          <button onClick={onNew} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: C.text, color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
            + Nouveau type
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.text4, fontSize: 13 }}>Chargement du catalogue...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {types.map(t => (
            <Card key={t.id} onClick={() => onSelect(t.id)}>
              <div style={{ padding: '20px 20px 16px' }}>
                {/* Bande colorée en haut de la card */}
                <div style={{ width: 36, height: 4, borderRadius: 4, background: t.color || C.blue, marginBottom: 14 }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 600, color: C.text, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{t.name}</h2>
                  <span style={{ fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 6, background: C.bg, color: C.text3, whiteSpace: 'nowrap', flexShrink: 0, border: `1px solid ${C.border}` }}>
                    {t.phases_count} étapes
                  </span>
                </div>
                {t.category && (
                  <div style={{ fontSize: 11, color: t.color || C.blue, fontWeight: 500, marginBottom: 8 }}>{t.category}</div>
                )}
                {t.description && (
                  <p style={{ fontSize: 12, color: C.text3, lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {t.description}
                  </p>
                )}
              </div>
              <div style={{ padding: '10px 20px', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: C.text4 }}>Voir le processus complet</span>
                <span style={{ fontSize: 14, color: C.text4 }}>›</span>
              </div>
            </Card>
          ))}

          {/* Card "Ajouter" si admin */}
          {isAdmin && (
            <Card onClick={onNew} style={{ border: `1.5px dashed ${C.border}`, boxShadow: 'none', background: 'transparent' }}>
              <div style={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, height: '100%', minHeight: 140 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: C.text4 }}>+</div>
                <span style={{ fontSize: 12, color: C.text4, fontWeight: 500 }}>Nouveau type de projet</span>
                <span style={{ fontSize: 11, color: C.text4 }}>MPBN, DWDM, B2B...</span>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DÉTAIL D'UN TYPE DE PROJET ─────────────────────────────────────────
function TypeDetail({ typeId, onBack, isAdmin }) {
  const [pt, setPt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editDesc, setEditDesc] = useState(false);
  const [descDraft, setDescDraft] = useState('');
  const [ctxDraft, setCtxDraft] = useState('');
  const [tab, setTab] = useState('processus');
  const [selectedSite, setSelectedSite] = useState(null);
  const [showAttach, setShowAttach] = useState(false);
  const [showAddPhase, setShowAddPhase] = useState(false);
  const [newPhase, setNewPhase] = useState({ title: '', description: '', is_client_scope: false });
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [uploadingPhase, setUploadingPhase] = useState(null);
  const [toast, setToast] = useState('');
  const fileRef = useRef();

  const showT = m => { setToast(m); setTimeout(() => setToast(''), 3000); };
  const load = useCallback(async () => {
    setLoading(true);
    const r = await api(`/project-catalogue/${typeId}`).then(r => r.json()).catch(() => null);
    setPt(r);
    setDescDraft(r?.description || '');
    setCtxDraft(r?.context || '');
    setLoading(false);
  }, [typeId]);
  useEffect(() => { load(); }, [load]);

  const saveDesc = async () => {
    await apiJ(`/project-catalogue/${typeId}`, { method: 'PUT', body: { description: descDraft, context: ctxDraft } });
    setEditDesc(false);
    showT('Mis à jour ✓');
    load();
  };

  const addPhase = async () => {
    if (!newPhase.title) return showT('Titre requis');
    await apiJ(`/project-catalogue/${typeId}/phases`, { method: 'POST', body: { ...newPhase, order_index: pt?.phases?.length || 0 } });
    setNewPhase({ title: '', description: '', is_client_scope: false });
    setShowAddPhase(false);
    showT('Phase ajoutée ✓');
    load();
  };

  const deletePhase = async (phaseId) => {
    if (!confirm('Supprimer cette phase ?')) return;
    await apiJ(`/project-phases/${phaseId}`, { method: 'DELETE' });
    showT('Phase supprimée');
    load();
  };

  const uploadPhoto = async (phaseId) => {
    if (!fileRef.current) return;
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploadingPhase(phaseId);
      showT('Upload en cours...');
      const form = new FormData();
      form.append('file', file);
      const r = await fetch(BASE + `/project-phases/${phaseId}/photos`, { method: 'POST', headers: { 'Authorization': 'Bearer ' + tk() }, body: form }).then(r => r.json());
      if (r.url) { showT('Photo ajoutée ✓'); load(); }
      else showT('Erreur upload');
      setUploadingPhase(null);
    };
    input.click();
  };

  const deletePhoto = async (photoId) => {
    await apiJ(`/project-phase-photos/${photoId}`, { method: 'DELETE' });
    showT('Photo supprimée');
    load();
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: C.text4 }}>Chargement...</div>;
  if (!pt || pt.message) return <div style={{ padding: 60, textAlign: 'center', color: C.red }}>Type de projet introuvable</div>;

  const phases = pt.phases || [];
  const donePhases = phases.filter(p => p.status === 'done').length;

  return (
    <div style={{ padding: 24, background: C.bg, minHeight: '100%' }}>
      <Toast msg={toast} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
        <button onClick={onBack} style={{ padding: '7px 13px', borderRadius: 7, border: C.cardBorder, background: C.white, boxShadow: C.cardShadow, fontSize: 12, cursor: 'pointer', color: C.text3 }}>← Catalogue</button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: pt.color || C.blue }} />
            <h1 style={{ fontSize: 19, fontWeight: 600, color: C.text, margin: 0, letterSpacing: '-0.02em' }}>{pt.name}</h1>
          </div>
          {pt.category && <div style={{ fontSize: 12, color: pt.color || C.blue, fontWeight: 500, marginTop: 3 }}>{pt.category}</div>}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: C.text4 }}>{phases.length} phases</span>
        </div>
      </div>

      {/* Description & Contexte */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>À propos de ce type de projet</div>
            {isAdmin && !editDesc && (
              <button onClick={() => setEditDesc(true)} style={{ padding: '4px 10px', borderRadius: 5, border: C.cardBorder, background: 'transparent', fontSize: 11, color: C.text3, cursor: 'pointer' }}>Modifier</button>
            )}
          </div>
          {editDesc ? (
            <div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Description courte</div>
                <textarea value={descDraft} onChange={e => setDescDraft(e.target.value)} rows={3}
                  style={{ width: '100%', padding: '9px 11px', border: C.cardBorder, borderRadius: 7, fontSize: 12, resize: 'vertical', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6 }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Contexte détaillé (pour les personnes qui ne connaissent pas ce type de projet)</div>
                <textarea value={ctxDraft} onChange={e => setCtxDraft(e.target.value)} rows={5}
                  style={{ width: '100%', padding: '9px 11px', border: C.cardBorder, borderRadius: 7, fontSize: 12, resize: 'vertical', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6 }} />
              </div>
              <div style={{ display: 'flex', gap: 7 }}>
                <button onClick={saveDesc} style={{ padding: '7px 18px', borderRadius: 7, border: 'none', background: C.green, color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Enregistrer</button>
                <button onClick={() => { setEditDesc(false); setDescDraft(pt.description || ''); setCtxDraft(pt.context || ''); }} style={{ padding: '7px 12px', borderRadius: 7, border: C.cardBorder, background: 'white', fontSize: 12, cursor: 'pointer' }}>Annuler</button>
              </div>
            </div>
          ) : (
            <div>
              {pt.description && <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.65, margin: '0 0 10px' }}>{pt.description}</p>}
              {pt.context && (
                <div style={{ background: C.bg, borderRadius: 8, padding: '12px 14px', border: C.cardBorder }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Contexte</div>
                  <p style={{ fontSize: 12, color: C.text3, lineHeight: 1.7, margin: 0 }}>{pt.context}</p>
                </div>
              )}
              {!pt.description && !pt.context && (
                <p style={{ fontSize: 12, color: C.text4, margin: 0, fontStyle: 'italic' }}>Aucune description — {isAdmin ? 'cliquez Modifier pour ajouter' : 'à remplir par l\'administrateur'}</p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Onglets : Processus / Sites en cours */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, marginBottom: 18, background: C.white, borderRadius: '10px 10px 0 0', border: C.cardBorder, boxShadow: C.cardShadow }}>
        {[['processus', `Processus (${phases.length} phases)`], ['sites', 'Sites en cours']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ padding: '12px 20px', border: 'none', borderBottom: `2px solid ${tab === id ? (pt.color || C.blue) : 'transparent'}`, background: 'transparent', color: tab === id ? (pt.color || C.blue) : C.text3, fontWeight: tab === id ? 600 : 400, fontSize: 13, cursor: 'pointer', transition: 'all .12s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Vue Sites */}
      {tab === 'sites' && !selectedSite && !showAttach && (
        <SitesList typeId={typeId} typeColor={pt.color} isAdmin={isAdmin}
          onSelectSite={id => setSelectedSite(id)}
          onAttach={() => setShowAttach(true)} />
      )}
      {tab === 'sites' && showAttach && (
        <AttachSiteForm typeId={typeId} typeName={pt.name} typeColor={pt.color}
          onSave={id => { setSelectedSite(id); setShowAttach(false); setTab('sites'); }}
          onCancel={() => setShowAttach(false)} />
      )}
      {tab === 'sites' && selectedSite && !showAttach && (
        <div>
          <button onClick={() => setSelectedSite(null)} style={{ padding: '7px 13px', borderRadius: 7, border: C.cardBorder, background: C.white, boxShadow: C.cardShadow, fontSize: 12, cursor: 'pointer', color: C.text3, marginBottom: 14 }}>
            ← Tous les sites
          </button>
          <SiteDetail executionId={selectedSite} typeColor={pt.color} onBack={() => setSelectedSite(null)} />
        </div>
      )}

      {/* Vue Processus */}
      {tab === 'processus' && (
        <div>

      {/* Phases */}
      <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Processus d'exécution</div>
          <div style={{ fontSize: 11, color: C.text4, marginTop: 2 }}>{phases.length} phases — suivre dans l'ordre pour chaque mission de ce type</div>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAddPhase(!showAddPhase)}
            style={{ padding: '7px 14px', borderRadius: 7, border: C.cardBorder, background: C.white, boxShadow: C.cardShadow, fontSize: 11, fontWeight: 500, color: C.text2, cursor: 'pointer' }}>
            + Ajouter une phase
          </button>
        )}
      </div>

      {showAddPhase && (
        <Card style={{ marginBottom: 12, padding: 16 }}>
          <div style={{ padding: 0 }}>
            <div style={{ marginBottom: 9 }}>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Titre de la phase *</div>
              <input value={newPhase.title} onChange={e => setNewPhase(p => ({ ...p, title: e.target.value }))}
                placeholder="ex: Réception DN, Installation antennes, Power On..."
                style={{ width: '100%', padding: '8px 11px', border: C.cardBorder, borderRadius: 7, fontSize: 12, boxSizing: 'border-box', outline: 'none', color: C.text }} />
            </div>
            <div style={{ marginBottom: 9 }}>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Description détaillée</div>
              <textarea value={newPhase.description} onChange={e => setNewPhase(p => ({ ...p, description: e.target.value }))} rows={3}
                placeholder="Décrivez en détail ce qui se passe pendant cette phase..."
                style={{ width: '100%', padding: '8px 11px', border: C.cardBorder, borderRadius: 7, fontSize: 12, resize: 'vertical', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <input type="checkbox" id="client_scope" checked={newPhase.is_client_scope} onChange={e => setNewPhase(p => ({ ...p, is_client_scope: e.target.checked }))} />
              <label htmlFor="client_scope" style={{ fontSize: 12, color: C.text3, cursor: 'pointer' }}>
                Phase hors périmètre CleanIT (ex: configuration client)
              </label>
            </div>
            <div style={{ display: 'flex', gap: 7 }}>
              <button onClick={addPhase} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: C.text, color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Ajouter</button>
              <button onClick={() => setShowAddPhase(false)} style={{ padding: '7px 12px', borderRadius: 7, border: C.cardBorder, background: 'white', fontSize: 12, cursor: 'pointer' }}>Annuler</button>
            </div>
          </div>
        </Card>
      )}

      {/* Timeline des phases */}
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 19, top: 0, bottom: 0, width: 1.5, background: `linear-gradient(to bottom, ${pt.color||C.blue}44, transparent)` }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {phases.map((ph, idx) => {
            const isExpanded = expandedPhase === ph.id;
            const isClientScope = ph.is_client_scope;
            const photos = Array.isArray(ph.photos) ? ph.photos : [];

            return (
              <div key={ph.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                {/* Indicateur numéroté */}
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: isClientScope ? '#F3F4F6' : C.white, border: `2px solid ${isClientScope ? '#D1D5DB' : (pt.color || C.blue)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, fontSize: 13, fontWeight: 700, color: isClientScope ? '#9CA3AF' : (pt.color || C.blue), boxShadow: C.cardShadow }}>
                  {idx + 1}
                </div>

                {/* Card de la phase */}
                <Card style={{ flex: 1, cursor: 'default' }}>
                  <div style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: isExpanded ? 10 : 0 }}
                      onClick={() => setExpandedPhase(isExpanded ? null : ph.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: isExpanded ? 10 : 0 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: isClientScope ? C.text4 : C.text, letterSpacing: '-0.01em' }}>{ph.title}</span>
                          {isClientScope && (
                            <Badge label="Hors périmètre CleanIT" color="#9CA3AF" bg="#F3F4F6" />
                          )}
                          {photos.length > 0 && (
                            <Badge label={`${photos.length} photo${photos.length>1?'s':''}`} color={pt.color||C.blue} bg={(pt.color||C.blue)+'15'} />
                          )}
                        </div>
                        {!isExpanded && ph.description && (
                          <p style={{ fontSize: 11, color: C.text4, margin: '3px 0 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {ph.description}
                          </p>
                        )}
                      </div>
                      <span style={{ fontSize: 12, color: C.text4, flexShrink: 0, marginTop: 2 }}>{isExpanded ? '▲' : '▼'}</span>
                    </div>

                    {isExpanded && (
                      <div>
                        {ph.description && (
                          <div style={{ background: C.bg, borderRadius: 8, padding: '11px 13px', border: C.cardBorder, marginBottom: 12 }}>
                            <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.7, margin: 0 }}>{ph.description}</p>
                          </div>
                        )}

                        {/* Photos de la phase */}
                        {photos.length > 0 && (
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                              Photos terrain ({photos.length})
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {photos.map(p => (
                                <div key={p.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: C.cardBorder }}>
                                  <img src={p.url} alt={p.caption || 'Photo terrain'}
                                    style={{ width: 120, height: 90, objectFit: 'cover', display: 'block', cursor: 'pointer' }}
                                    onClick={() => window.open(p.url, '_blank')} />
                                  {p.caption && (
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', padding: '3px 6px', fontSize: 9, color: '#fff' }}>
                                      {p.caption}
                                    </div>
                                  )}
                                  {isAdmin && (
                                    <button onClick={() => deletePhoto(p.id)}
                                      style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%', border: 'none', background: 'rgba(220,38,38,0.85)', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                                      ×
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                          <button onClick={() => uploadPhoto(ph.id)} disabled={uploadingPhase === ph.id}
                            style={{ padding: '5px 12px', borderRadius: 6, border: C.cardBorder, background: C.white, color: C.text2, fontSize: 11, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                            📷 {uploadingPhase === ph.id ? 'Upload...' : 'Ajouter une photo'}
                          </button>
                          {isAdmin && (
                            <button onClick={() => deletePhase(ph.id)}
                              style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #FCA5A5', background: C.redL, color: C.red, fontSize: 11, cursor: 'pointer' }}>
                              Supprimer phase
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {phases.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: C.text4, fontSize: 13, background: C.white, borderRadius: 10, border: C.cardBorder }}>
          Aucune phase définie — {isAdmin ? 'ajoutez les étapes du processus' : 'à remplir par l\'administrateur'}
        </div>
      )}
        </div>
      )}
    </div>
  );
}

// ─── LISTE DES SITES EN COURS ─────────────────────────────────────────
function SitesList({ typeId, typeColor, onSelectSite, onAttach, isAdmin }) {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api(`/project-catalogue/${typeId}/sites`).then(r => r.json()).catch(() => []);
    setSites(Array.isArray(r) ? r : []);
    setLoading(false);
  }, [typeId]);
  useEffect(() => { load(); }, [load]);

  const STATUS_COLORS = {
    en_cours:  { label: 'En cours',  color: '#2563EB', bg: '#EFF6FF' },
    planifie:  { label: 'Planifié',  color: '#7C3AED', bg: '#F5F3FF' },
    termine:   { label: 'Terminé',   color: '#16A34A', bg: '#F0FDF4' },
    suspendu:  { label: 'Suspendu',  color: '#6B7280', bg: '#F3F4F6' },
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: C.text3 }}>
          {sites.length} site{sites.length > 1 ? 's' : ''} rattaché{sites.length > 1 ? 's' : ''} à ce type de projet
        </div>
        <button onClick={onAttach}
          style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: typeColor || C.blue, color: '#fff', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>
          + Rattacher un site
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 32, textAlign: 'center', color: C.text4, fontSize: 12 }}>Chargement...</div>
      ) : sites.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', background: C.bg, borderRadius: 10, border: C.cardBorder }}>
          <div style={{ fontSize: 13, color: C.text4, marginBottom: 8 }}>Aucun site rattaché pour l'instant</div>
          <div style={{ fontSize: 11, color: C.text4, marginBottom: 16 }}>Cliquez "+ Rattacher un site" pour démarrer le suivi d'une mission</div>
          <button onClick={onAttach} style={{ padding: '8px 18px', borderRadius: 7, border: 'none', background: typeColor || C.blue, color: '#fff', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
            + Rattacher un site
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {sites.map(site => {
            const st = STATUS_COLORS[site.status] || STATUS_COLORS.en_cours;
            const pct = site.total_phases > 0 ? Math.round((site.done_phases / site.total_phases) * 100) : 0;
            return (
              <Card key={site.id} onClick={() => onSelectSite(site.id)}>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: typeColor || C.blue, background: (typeColor || C.blue) + '14', padding: '2px 8px', borderRadius: 5, letterSpacing: '0.01em' }}>
                          {site.site_code}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{site.site_name || site.site_code}</span>
                        <Badge label={st.label} color={st.color} bg={st.bg} />
                      </div>
                      <div style={{ fontSize: 11, color: C.text4, marginBottom: 10 }}>
                        {site.client && <span>{site.client}</span>}
                        {site.bc_reference && <span style={{ marginLeft: 8 }}>· Réf. {site.bc_reference}</span>}
                        {site.region && <span style={{ marginLeft: 8 }}>· {site.region}</span>}
                        {site.chef_nom && <span style={{ marginLeft: 8 }}>· CDP: {site.chef_nom}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1, maxWidth: 260 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 10, color: C.text4 }}>{site.done_phases}/{site.total_phases} phases complétées</span>
                            <span style={{ fontSize: 10, fontWeight: 600, color: pct >= 100 ? C.green : (typeColor || C.blue) }}>{pct}%</span>
                          </div>
                          <div style={{ height: 4, background: C.bg, borderRadius: 3, overflow: 'hidden', border: C.cardBorder }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? C.green : (typeColor || C.blue), borderRadius: 3, transition: 'width .4s' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: 14, color: C.text4 }}>›</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── FORMULAIRE RATTACHEMENT SITE ────────────────────────────────────────
function AttachSiteForm({ typeId, typeName, typeColor, onSave, onCancel }) {
  const [form, setForm] = useState({ site_code: '', site_name: '', region: '', client: '', bc_reference: '', status: 'en_cours', start_date: '', target_date: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api('/users').then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d.filter(u => ['admin','project_manager'].includes(u.role)) : [])).catch(() => {});
  }, []);

  const save = async () => {
    if (!form.site_code) return;
    setSaving(true);
    const r = await api(`/project-catalogue/${typeId}/sites`, {
      json: true, method: 'POST',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' }
    });
    if (r.ok) { const data = await r.json(); onSave(data.id); }
    setSaving(false);
  };

  const inp = (f, p = {}) => (
    <input value={form[f]} onChange={e => setForm(prev => ({ ...prev, [f]: e.target.value }))}
      style={{ width: '100%', padding: '8px 11px', border: C.cardBorder, borderRadius: 7, fontSize: 12, boxSizing: 'border-box', outline: 'none', color: C.text, background: C.white }} {...p} />
  );

  return (
    <div style={{ padding: 24, background: C.bg, minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onCancel} style={{ padding: '7px 13px', borderRadius: 7, border: C.cardBorder, background: C.white, boxShadow: C.cardShadow, fontSize: 12, cursor: 'pointer', color: C.text3 }}>← Annuler</button>
        <div>
          <h1 style={{ fontSize: 17, fontWeight: 600, color: C.text, margin: 0 }}>Rattacher un site</h1>
          <div style={{ fontSize: 11, color: typeColor || C.blue, marginTop: 2 }}>Type : {typeName}</div>
        </div>
      </div>

      <Card>
        <div style={{ padding: 22 }}>
          <div style={{ background: (typeColor || C.blue) + '10', border: `1px solid ${(typeColor || C.blue)}25`, borderRadius: 8, padding: '10px 14px', marginBottom: 18, fontSize: 12, color: C.text2, lineHeight: 1.6 }}>
            Les <strong>{typeName === 'IP Core' ? '13' : '12'} phases</strong> du processus <strong>{typeName}</strong> seront automatiquement copiées pour ce site. Il suffira ensuite de cocher chaque phase au fur et à mesure de l'exécution et d'ajouter les photos terrain.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13, marginBottom: 13 }}>
            <div>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Code site *</div>
              {inp('site_code', { placeholder: 'ex: GAR-001' })}
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Nom du site</div>
              {inp('site_name', { placeholder: 'ex: Tour MTN Garoua Centre' })}
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Client</div>
              {inp('client', { placeholder: 'ex: MTN Cameroun' })}
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Référence BC / PO</div>
              {inp('bc_reference', { placeholder: 'ex: 416121376123-2' })}
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Région</div>
              {inp('region', { placeholder: 'ex: Nord Cameroun' })}
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Statut</div>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                style={{ width: '100%', padding: '8px 11px', border: C.cardBorder, borderRadius: 7, fontSize: 12, background: C.white, color: C.text }}>
                <option value="planifie">Planifié</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
                <option value="suspendu">Suspendu</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Date de démarrage</div>
              {inp('start_date', { type: 'date' })}
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Date cible de fin</div>
              {inp('target_date', { type: 'date' })}
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Notes (contexte spécifique à ce site)</div>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3}
                placeholder="Particularités de ce site : accès, contraintes, historique..."
                style={{ width: '100%', padding: '8px 11px', border: C.cardBorder, borderRadius: 7, fontSize: 12, resize: 'vertical', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6, color: C.text }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onCancel} style={{ padding: '9px 18px', borderRadius: 8, border: C.cardBorder, background: 'white', fontSize: 12, cursor: 'pointer', color: C.text2 }}>Annuler</button>
            <button onClick={save} disabled={saving || !form.site_code}
              style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: form.site_code ? (typeColor || C.blue) : '#CBD5E1', color: 'white', fontSize: 12, fontWeight: 500, cursor: form.site_code ? 'pointer' : 'default' }}>
              {saving ? 'Rattachement...' : 'Rattacher et créer les phases'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── DÉTAIL D'UN SITE EN COURS ───────────────────────────────────────────
function SiteDetail({ executionId, typeColor, onBack }) {
  const [exec, setExec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [uploadingPhase, setUploadingPhase] = useState(null);
  const [toast, setToast] = useState('');
  const [editNotes, setEditNotes] = useState(null);
  const [notesDraft, setNotesDraft] = useState('');

  const showT = m => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api(`/project-site-executions/${executionId}`).then(r => r.json()).catch(() => null);
    setExec(r);
    setLoading(false);
  }, [executionId]);
  useEffect(() => { load(); }, [load]);

  const updPhase = async (phaseId, updates) => {
    await api(`/project-execution-phases/${phaseId}`, {
      method: 'PUT', json: true,
      body: JSON.stringify(updates),
      headers: { 'Content-Type': 'application/json' }
    });
    load();
  };

  const saveNotes = async (phaseId) => {
    await updPhase(phaseId, { notes: notesDraft });
    setEditNotes(null);
    showT('Notes enregistrées ✓');
  };

  const uploadPhoto = async (phaseId) => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploadingPhase(phaseId);
      showT('Upload en cours...');
      const form = new FormData();
      form.append('file', file);
      const r = await fetch(BASE + `/project-execution-phases/${phaseId}/photos`, {
        method: 'POST', headers: { 'Authorization': 'Bearer ' + tk() }, body: form
      }).then(r => r.json());
      if (r.url) { showT('Photo ajoutée ✓'); load(); }
      else showT('Erreur upload photo');
      setUploadingPhase(null);
    };
    input.click();
  };

  const deletePhoto = async (photoId) => {
    await api(`/project-execution-photos/${photoId}`, { method: 'DELETE', json: true, headers: { 'Content-Type': 'application/json' } });
    showT('Photo supprimée');
    load();
  };

  const STATUS_PHASE = {
    pending:     { label: 'À faire',  color: '#6B7280', bg: '#F3F4F6' },
    in_progress: { label: 'En cours', color: '#2563EB', bg: '#EFF6FF' },
    done:        { label: 'Terminé',  color: '#16A34A', bg: '#F0FDF4' },
    blocked:     { label: 'Bloqué',   color: '#DC2626', bg: '#FEF2F2' },
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: C.text4 }}>Chargement...</div>;
  if (!exec || exec.message) return <div style={{ padding: 60, textAlign: 'center', color: C.red }}>Exécution introuvable</div>;

  const phases = exec.phases || [];
  const donePhases = phases.filter(p => p.status === 'done').length;
  const pct = phases.length > 0 ? Math.round((donePhases / phases.length) * 100) : 0;
  const color = exec.type_color || typeColor || C.blue;

  return (
    <div style={{ padding: 24, background: C.bg, minHeight: '100%' }}>
      <Toast msg={toast} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
        <button onClick={onBack} style={{ padding: '7px 13px', borderRadius: 7, border: C.cardBorder, background: C.white, boxShadow: C.cardShadow, fontSize: 12, cursor: 'pointer', color: C.text3 }}>
          ← Sites
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color, background: color + '14', padding: '2px 8px', borderRadius: 5 }}>{exec.site_code}</span>
            <h1 style={{ fontSize: 17, fontWeight: 600, color: C.text, margin: 0 }}>{exec.site_name || exec.site_code}</h1>
          </div>
          <div style={{ fontSize: 11, color: C.text4 }}>
            {exec.type_name && <span style={{ color, fontWeight: 500 }}>{exec.type_name}</span>}
            {exec.client && <span style={{ marginLeft: 8 }}>· {exec.client}</span>}
            {exec.bc_reference && <span style={{ marginLeft: 8 }}>· Réf. {exec.bc_reference}</span>}
            {exec.region && <span style={{ marginLeft: 8 }}>· {exec.region}</span>}
          </div>
        </div>
      </div>

      {/* Barre de progression globale */}
      <Card style={{ marginBottom: 14, padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>Avancement global</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: pct >= 100 ? C.green : color }}>{pct}%</span>
            </div>
            <div style={{ height: 6, background: C.bg, borderRadius: 4, overflow: 'hidden', border: C.cardBorder }}>
              <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? C.green : color, borderRadius: 4, transition: 'width .5s' }} />
            </div>
            <div style={{ fontSize: 10, color: C.text4, marginTop: 4 }}>{donePhases} / {phases.length} phases complétées</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: pct >= 100 ? C.green : color, letterSpacing: '-0.03em' }}>{donePhases}/{phases.length}</div>
            <div style={{ fontSize: 10, color: C.text4 }}>phases</div>
          </div>
        </div>
        {exec.notes && (
          <div style={{ marginTop: 12, fontSize: 12, color: C.text3, background: C.bg, borderRadius: 7, padding: '8px 11px', border: C.cardBorder }}>
            {exec.notes}
          </div>
        )}
      </Card>

      {/* Phases d'exécution */}
      <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 12 }}>Suivi des phases</div>

      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 19, top: 0, bottom: 0, width: 1.5, background: `linear-gradient(to bottom, ${color}55, transparent)` }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {phases.map((ph, idx) => {
            const sph = STATUS_PHASE[ph.status] || STATUS_PHASE.pending;
            const isExpanded = expandedPhase === ph.id;
            const isClientScope = ph.is_client_scope;
            const photos = Array.isArray(ph.photos) ? ph.photos : [];
            const isDone = ph.status === 'done';

            return (
              <div key={ph.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                {/* Cercle numéroté */}
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: isDone ? color : (isClientScope ? '#F3F4F6' : C.white), border: `2px solid ${isDone ? color : (isClientScope ? '#D1D5DB' : (ph.status === 'in_progress' ? color : C.border))}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, fontSize: 13, fontWeight: 700, color: isDone ? '#fff' : (isClientScope ? '#9CA3AF' : color), boxShadow: C.cardShadow, transition: 'all .2s' }}>
                  {isDone ? '✓' : (idx + 1)}
                </div>

                <Card style={{ flex: 1, cursor: 'default', opacity: isClientScope ? 0.75 : 1 }}>
                  <div style={{ padding: '12px 15px' }}>
                    {/* En-tête cliquable */}
                    <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 8 }}
                      onClick={() => setExpandedPhase(isExpanded ? null : ph.id)}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 12, fontWeight: 500, color: isClientScope ? C.text4 : C.text }}>{ph.title}</span>
                          <Badge label={sph.label} color={sph.color} bg={sph.bg} />
                          {isClientScope && <Badge label="Hors périmètre CleanIT" color="#9CA3AF" bg="#F3F4F6" />}
                          {photos.length > 0 && <Badge label={`${photos.length} photo${photos.length > 1 ? 's' : ''}`} color={color} bg={color + '15'} />}
                          {ph.notes && !isExpanded && <Badge label="Notes" color="#6B7280" bg="#F3F4F6" />}
                        </div>
                        {ph.completed_at && <div style={{ fontSize: 10, color: C.green, marginTop: 2 }}>Terminé le {new Date(ph.completed_at).toLocaleDateString('fr-FR')}</div>}
                      </div>
                      <span style={{ fontSize: 11, color: C.text4, flexShrink: 0 }}>{isExpanded ? '▲' : '▼'}</span>
                    </div>

                    {/* Contenu déplié */}
                    {isExpanded && (
                      <div style={{ marginTop: 12 }}>
                        {ph.description && (
                          <div style={{ background: C.bg, borderRadius: 8, padding: '11px 13px', border: C.cardBorder, marginBottom: 12 }}>
                            <p style={{ fontSize: 12, color: C.text2, lineHeight: 1.7, margin: 0 }}>{ph.description}</p>
                          </div>
                        )}

                        {/* Notes de l'équipe */}
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Notes de l'équipe</div>
                          {editNotes === ph.id ? (
                            <div>
                              <textarea value={notesDraft} onChange={e => setNotesDraft(e.target.value)} rows={3} autoFocus
                                placeholder="Observations, problèmes rencontrés, modifications du client..."
                                style={{ width: '100%', padding: '8px 10px', border: `1.5px solid ${color}`, borderRadius: 7, fontSize: 12, resize: 'vertical', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6 }} />
                              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                                <button onClick={() => saveNotes(ph.id)} style={{ padding: '5px 14px', borderRadius: 6, border: 'none', background: C.green, color: '#fff', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>Enregistrer</button>
                                <button onClick={() => setEditNotes(null)} style={{ padding: '5px 10px', borderRadius: 6, border: C.cardBorder, background: 'white', fontSize: 11, cursor: 'pointer' }}>Annuler</button>
                              </div>
                            </div>
                          ) : (
                            <div onClick={() => { setEditNotes(ph.id); setNotesDraft(ph.notes || ''); }}
                              style={{ padding: '8px 10px', background: ph.notes ? C.bg : 'transparent', borderRadius: 7, border: C.cardBorder, fontSize: 12, color: ph.notes ? C.text2 : C.text4, cursor: 'pointer', lineHeight: 1.6, minHeight: 36, display: 'flex', alignItems: ph.notes ? 'flex-start' : 'center', fontStyle: ph.notes ? 'normal' : 'italic' }}>
                              {ph.notes || 'Cliquer pour ajouter des notes...'}
                            </div>
                          )}
                        </div>

                        {/* Photos */}
                        {photos.length > 0 && (
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 10, fontWeight: 600, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Photos terrain ({photos.length})</div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {photos.map(p => (
                                <div key={p.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: C.cardBorder, boxShadow: C.cardShadow }}>
                                  <img src={p.url} alt={p.caption || 'Photo terrain'}
                                    style={{ width: 130, height: 95, objectFit: 'cover', display: 'block', cursor: 'pointer' }}
                                    onClick={() => window.open(p.url, '_blank')} />
                                  {p.caption && (
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.55)', padding: '4px 7px', fontSize: 9, color: '#fff' }}>{p.caption}</div>
                                  )}
                                  <button onClick={() => deletePhoto(p.id)}
                                    style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%', border: 'none', background: 'rgba(220,38,38,0.85)', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions phase */}
                        {!isClientScope && (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                            <div style={{ fontSize: 10, color: C.text4, marginRight: 4 }}>Statut :</div>
                            {['pending', 'in_progress', 'done', 'blocked'].map(s => (
                              <button key={s} onClick={() => updPhase(ph.id, { status: s })}
                                style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${ph.status === s ? STATUS_PHASE[s].color : C.border}`, background: ph.status === s ? STATUS_PHASE[s].color : C.white, color: ph.status === s ? '#fff' : C.text3, fontSize: 10, fontWeight: ph.status === s ? 600 : 400, cursor: 'pointer', transition: 'all .1s' }}>
                                {STATUS_PHASE[s].label}
                              </button>
                            ))}
                            <button onClick={() => uploadPhoto(ph.id)} disabled={uploadingPhase === ph.id}
                              style={{ marginLeft: 'auto', padding: '4px 11px', borderRadius: 6, border: C.cardBorder, background: C.white, color: C.text3, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                              📷 {uploadingPhase === ph.id ? 'Upload...' : 'Ajouter photo'}
                            </button>
                          </div>
                        )}
                        {isClientScope && (
                          <div style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>
                            Cette phase est gérée par le client — CleanIT n'intervient pas
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


function NewTypeForm({ onSave, onCancel }) {
  const COLORS = ['#1B4F8A','#0D9488','#7C3AED','#EA580C','#16A34A','#D97706','#DC2626','#0891B2'];
  const [form, setForm] = useState({ code: '', name: '', category: '', description: '', context: '', color: '#1B4F8A' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.code || !form.name) return;
    setSaving(true);
    const r = await apiJ('/project-catalogue', { method: 'POST', body: form });
    if (r.ok !== false) { const data = await r.json(); onSave(data.id); }
    setSaving(false);
  };

  return (
    <div style={{ padding: 28, background: C.bg, minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <button onClick={onCancel} style={{ padding: '7px 13px', borderRadius: 7, border: C.cardBorder, background: C.white, boxShadow: C.cardShadow, fontSize: 12, cursor: 'pointer', color: C.text3 }}>← Annuler</button>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: C.text, margin: 0 }}>Nouveau type de projet</h1>
      </div>

      <Card>
        <div style={{ padding: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Code court * (sans espace)</div>
              <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toLowerCase().replace(/\s/g, '_') }))}
                placeholder="ex: mpbn, dwdm, b2b_enterprise"
                style={{ width: '100%', padding: '8px 11px', border: C.cardBorder, borderRadius: 7, fontSize: 12, boxSizing: 'border-box', outline: 'none', color: C.text }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Nom complet *</div>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="ex: MPBN, DWDM, B2B Entreprise"
                style={{ width: '100%', padding: '8px 11px', border: C.cardBorder, borderRadius: 7, fontSize: 12, boxSizing: 'border-box', outline: 'none', color: C.text }} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Catégorie</div>
              <input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                placeholder="ex: Radio, Data Center, Câblage fibre..."
                style={{ width: '100%', padding: '8px 11px', border: C.cardBorder, borderRadius: 7, fontSize: 12, boxSizing: 'border-box', outline: 'none', color: C.text }} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Description courte</div>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
                placeholder="Résumé en 1-2 phrases de ce type de projet..."
                style={{ width: '100%', padding: '8px 11px', border: C.cardBorder, borderRadius: 7, fontSize: 12, resize: 'vertical', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Contexte (pour les personnes qui ne connaissent pas ce projet)</div>
              <textarea value={form.context} onChange={e => setForm(p => ({ ...p, context: e.target.value }))} rows={4}
                placeholder="Expliquer en détail à quoi sert ce type de projet, dans quel contexte il se produit..."
                style={{ width: '100%', padding: '8px 11px', border: C.cardBorder, borderRadius: 7, fontSize: 12, resize: 'vertical', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6 }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 8 }}>Couleur</div>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                    style={{ width: 26, height: 26, borderRadius: 7, background: c, border: form.color === c ? `3px solid #0F172A` : '2px solid transparent', cursor: 'pointer' }} />
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onCancel} style={{ padding: '9px 18px', borderRadius: 8, border: C.cardBorder, background: 'white', fontSize: 12, cursor: 'pointer' }}>Annuler</button>
            <button onClick={save} disabled={saving || !form.code || !form.name}
              style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: (form.code && form.name) ? C.text : '#CBD5E1', color: 'white', fontSize: 12, fontWeight: 500, cursor: (form.code && form.name) ? 'pointer' : 'default' }}>
              {saving ? 'Création...' : 'Créer le type de projet'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────
export default function Projets() {
  const [view, setView] = useState('catalogue');
  const [selId, setSelId] = useState(null);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Vérification admin
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const isAdmin = ['admin', 'project_manager'].includes(user.role);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api('/project-catalogue').then(r => r.json()).catch(() => []);
    setTypes(Array.isArray(r) ? r : []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  if (view === 'new') return <NewTypeForm onSave={id => { setSelId(id); setView('detail'); load(); }} onCancel={() => setView('catalogue')} />;
  if (view === 'detail' && selId) return <TypeDetail typeId={selId} isAdmin={isAdmin} onBack={() => { setView('catalogue'); load(); }} />;
  return <CatalogueView types={types} loading={loading} isAdmin={isAdmin} onSelect={id => { setSelId(id); setView('detail'); }} onNew={() => setView('new')} />;
}
