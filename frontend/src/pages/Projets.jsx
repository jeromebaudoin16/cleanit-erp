import { useState, useEffect, useCallback, useRef } from 'react';

const BASE = import.meta.env.VITE_API_URL || 'https://backend-cleanit-erp.vercel.app';
const tk = () => localStorage.getItem('token') || '';
const h = () => ({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tk() });
const api = (url, opts = {}) => fetch(BASE + url, { ...opts, headers: { ...h(), ...(opts.headers || {}) } });

const C = {
  bg: '#F0F4F9', white: '#FFFFFF', border: '#EEF2F8', borderHover: '#DBEAFE',
  text: '#0F172A', text2: '#374151', text3: '#64748B', text4: '#94A3B8',
  blue: '#2563EB', blueL: '#EFF6FF', green: '#16A34A', greenL: '#F0FDF4',
  red: '#DC2626', redL: '#FEF2F2', orange: '#EA580C', orangeL: '#FFF7ED',
  purple: '#7C3AED', purpleL: '#F5F3FF', teal: '#0D9488', tealL: '#F0FDFA',
  gray: '#64748B',
};

const TYPES = ['MPBN','DWDM','IP Core','IP RAN','B2B Entreprise','FTTH/FTTB',
  'Faisceau hertzien','Installation DAS','Maintenance préventive',
  'Rural Start','Alarme & Supervision','Énergie / Solaire',
  'Climatisation / Ventilation','Autre'];

const SP = {
  en_cours: { label: 'En cours', color: C.blue, bg: C.blueL },
  planifie: { label: 'Planifié', color: C.purple, bg: C.purpleL },
  termine:  { label: 'Terminé',  color: C.green,  bg: C.greenL },
  suspendu: { label: 'Suspendu', color: C.gray,   bg: '#F8FAFC' },
  annule:   { label: 'Annulé',   color: C.red,    bg: C.redL },
};
const SS = {
  pending:     { label: 'À démarrer', color: C.gray },
  in_progress: { label: 'En cours',   color: C.blue },
  done:        { label: 'Terminé',    color: C.green },
  blocked:     { label: 'Bloqué',     color: C.red },
};
const SPH = {
  pending:     { label: 'À faire',  color: C.gray },
  in_progress: { label: 'En cours', color: C.blue },
  done:        { label: 'Terminé',  color: C.green },
  blocked:     { label: 'Bloqué',   color: C.red },
};

const fM = v => { const n = parseFloat(v)||0; return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(0)+'K':n.toLocaleString('fr-FR'); };

const Pill = ({ label, color, bg }) => (
  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20, background: bg, color, whiteSpace: 'nowrap', display:'inline-flex', alignItems:'center' }}>{label}</span>
);

const Bar = ({ v, color = C.blue, h = 5 }) => (
  <div style={{ height: h, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${Math.min(100, v || 0)}%`, background: color, borderRadius: 3, transition: 'width .4s ease' }} />
  </div>
);

const Toast = ({ msg }) => msg ? (
  <div style={{ position:'fixed', bottom:24, right:24, background:C.text, color:'#fff', padding:'10px 18px', borderRadius:9, fontSize:13, fontWeight:500, zIndex:9999, boxShadow:'0 8px 24px rgba(0,0,0,0.2)' }}>{msg}</div>
) : null;

// ─── VUE LISTE ────────────────────────────────────────────────────────
function ListView({ projects, loading, onSelect, onNew }) {
  const [search, setSearch] = useState('');
  const [fs, setFs] = useState('tous');
  const filtered = projects.filter(p =>
    (fs === 'tous' || p.status === fs) &&
    (!search || [p.name, p.client, p.po_reference, p.type].some(x => x?.toLowerCase().includes(search.toLowerCase())))
  );
  const kpi = (s) => projects.filter(p => p.status === s).length;

  return (
    <div style={{ padding: 24, background: C.bg, minHeight: '100%' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: C.text, margin: 0, letterSpacing: '-0.02em' }}>Suivi des Projets</h1>
          <p style={{ color: C.text3, fontSize: 12, margin: '3px 0 0' }}>
            {projects.length} projet{projects.length > 1 ? 's' : ''} — chaque projet couvre un ou plusieurs sites
          </p>
        </div>
        <button onClick={onNew} style={{ padding:'8px 16px', borderRadius:7, border:'none', background:C.text, color:'#fff', fontSize:12, fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
          + Nouveau projet
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:14 }}>
        {[['En cours', kpi('en_cours'), C.blue], ['Planifiés', kpi('planifie'), C.purple], ['Terminés', kpi('termine'), C.green], ['Sites total', projects.reduce((s,p)=>s+(p.sites_count||0),0), C.teal]].map(([l,v,c]) => (
          <div key={l} style={{ background:C.white, borderRadius:9, padding:'12px 14px', border:`1px solid ${C.border}`, borderTop:`2px solid ${c}` }}>
            <div style={{ fontSize:20, fontWeight:600, color:c, letterSpacing:'-0.03em' }}>{v}</div>
            <div style={{ fontSize:11, color:C.text3, marginTop:2 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ background:C.white, borderRadius:9, padding:'10px 14px', border:`1px solid ${C.border}`, marginBottom:12, display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
        <input placeholder="Nom, client, référence BC, type..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex:1, minWidth:200, padding:'7px 11px', border:`1px solid ${C.border}`, borderRadius:7, fontSize:12, outline:'none', color:C.text }} />
        <select value={fs} onChange={e => setFs(e.target.value)}
          style={{ padding:'7px 11px', border:`1px solid ${C.border}`, borderRadius:7, fontSize:12, background:'white', color:C.text }}>
          <option value="tous">Tous statuts</option>
          {Object.entries(SP).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:48, color:C.text4 }}>Chargement des projets...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background:C.white, borderRadius:10, padding:48, textAlign:'center', border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:13, fontWeight:500, color:C.text, marginBottom:6 }}>{projects.length===0 ? 'Aucun projet créé' : 'Aucun résultat'}</div>
          <div style={{ fontSize:12, color:C.text3, marginBottom:16 }}>
            {projects.length===0 ? 'Créez votre premier projet pour commencer le suivi terrain.' : 'Essayez un autre filtre.'}
          </div>
          {projects.length===0 && <button onClick={onNew} style={{ padding:'8px 18px', borderRadius:7, border:'none', background:C.text, color:'#fff', fontSize:12, fontWeight:500, cursor:'pointer' }}>+ Créer un projet</button>}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {filtered.map(p => {
            const st = SP[p.status] || SP.en_cours;
            const prog = p.avg_progress || 0;
            return (
              <div key={p.id} onClick={() => onSelect(p.id)}
                style={{ background:C.white, borderRadius:9, border:`1px solid ${C.border}`, padding:'14px 18px', cursor:'pointer', transition:'all .12s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=C.blue; e.currentTarget.style.boxShadow='0 2px 12px rgba(37,99,235,0.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.boxShadow='none'; }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4, flexWrap:'wrap' }}>
                      <span style={{ fontSize:14, fontWeight:500, color:C.text }}>{p.name}</span>
                      <Pill label={st.label} color={st.color} bg={st.bg} />
                      {p.type && <Pill label={p.type} color={C.teal} bg={C.tealL} />}
                    </div>
                    <div style={{ fontSize:11, color:C.text3, marginBottom:10 }}>
                      {p.client && <span>{p.client}</span>}
                      {p.po_reference && <span style={{ marginLeft:8 }}>· Réf. {p.po_reference}</span>}
                      {p.chef_nom && <span style={{ marginLeft:8 }}>· CDP: {p.chef_nom}</span>}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                      <div style={{ flex:1, maxWidth:280 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                          <span style={{ fontSize:10, color:C.text3 }}>Avancement</span>
                          <span style={{ fontSize:10, fontWeight:600, color: prog>=100?C.green:C.blue }}>{prog}%</span>
                        </div>
                        <Bar v={prog} color={prog>=100?C.green:C.blue} />
                      </div>
                      <span style={{ fontSize:11, color:C.text4 }}>{p.sites_count||0} site{(p.sites_count||0)>1?'s':''}</span>
                      {p.budget>0 && <span style={{ fontSize:11, color:C.text2, fontWeight:500 }}>{fM(p.budget)} FCFA</span>}
                    </div>
                  </div>
                  <div style={{ color:C.text4, fontSize:16 }}>›</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── PHASES D'UN SITE ─────────────────────────────────────────────────
function SitePhases({ site, onClose }) {
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newPhase, setNewPhase] = useState({ title:'', description:'', status:'pending' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const fileRef = useRef();

  const showT = m => { setToast(m); setTimeout(()=>setToast(''),3000); };
  const load = useCallback(async () => {
    setLoading(true);
    const r = await api(`/project-sites/${site.id}/phases`).then(r=>r.json()).catch(()=>[]);
    setPhases(Array.isArray(r)?r:[]);
    setLoading(false);
  }, [site.id]);
  useEffect(()=>{ load(); },[load]);

  const addPhase = async () => {
    if (!newPhase.title) return showT('Titre requis');
    setSaving(true);
    await api(`/project-sites/${site.id}/phases`, {
      method:'POST', body:JSON.stringify({ ...newPhase, order_index: phases.length })
    });
    setNewPhase({ title:'', description:'', status:'pending' });
    setShowAdd(false);
    showT('Phase ajoutée ✓');
    load();
    setSaving(false);
  };

  const updPhase = async (phaseId, updates) => {
    await api(`/project-sites/${site.id}/phases/${phaseId}`, { method:'PUT', body:JSON.stringify(updates) });
    load();
  };

  const uploadPhoto = async (phaseId, currentUrls, file) => {
    showT('Upload en cours...');
    const form = new FormData();
    form.append('file', file);
    const r = await fetch(BASE+'/upload/photo', { method:'POST', headers:{'Authorization':'Bearer '+tk()}, body:form }).then(r=>r.json());
    if (r.url) {
      const newUrls = [...(currentUrls||[]), r.url];
      await updPhase(phaseId, { photo_urls: newUrls });
      showT('Photo ajoutée ✓');
    } else showT('Erreur upload');
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:9998, display:'flex', alignItems:'flex-start', justifyContent:'flex-end', padding:12 }}>
      <Toast msg={toast} />
      <div style={{ background:C.white, borderRadius:12, width:520, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ padding:'16px 18px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{site.site_code||site.site_name}</div>
            <div style={{ fontSize:11, color:C.text3 }}>{site.site_name} · {site.region}</div>
          </div>
          <button onClick={onClose} style={{ border:'none', background:'none', fontSize:18, cursor:'pointer', color:C.text3 }}>×</button>
        </div>

        {site.context && (
          <div style={{ margin:'12px 18px 0', padding:'10px 12px', background:C.blueL, borderRadius:7, fontSize:11, color:C.text2, lineHeight:1.55 }}>
            <strong style={{ color:C.blue }}>Contexte de ce site :</strong> {site.context}
          </div>
        )}

        <div style={{ padding:'12px 18px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div style={{ fontSize:13, fontWeight:500, color:C.text }}>Phases d'implémentation</div>
            <button onClick={()=>setShowAdd(!showAdd)} style={{ padding:'5px 12px', borderRadius:6, border:`1px solid ${C.blue}`, background:C.blueL, color:C.blue, fontSize:11, fontWeight:500, cursor:'pointer' }}>
              + Phase
            </button>
          </div>

          {showAdd && (
            <div style={{ background:C.bg, borderRadius:8, padding:14, marginBottom:12, border:`1px solid ${C.border}` }}>
              <div style={{ marginBottom:8 }}>
                <div style={{ fontSize:11, color:C.text3, marginBottom:4 }}>Titre de la phase *</div>
                <input value={newPhase.title} onChange={e=>setNewPhase(p=>({...p,title:e.target.value}))}
                  placeholder="ex: Installation BBU + AAU, Tests RF, Recette client..."
                  style={{ width:'100%', padding:'8px 10px', border:`1px solid ${C.border}`, borderRadius:7, fontSize:12, boxSizing:'border-box', outline:'none' }} />
              </div>
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:11, color:C.text3, marginBottom:4 }}>Description (optionnelle)</div>
                <textarea value={newPhase.description} onChange={e=>setNewPhase(p=>({...p,description:e.target.value}))}
                  rows={2} placeholder="Détails, équipements concernés, responsable..."
                  style={{ width:'100%', padding:'8px 10px', border:`1px solid ${C.border}`, borderRadius:7, fontSize:12, resize:'vertical', boxSizing:'border-box', outline:'none' }} />
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={addPhase} disabled={saving}
                  style={{ flex:1, padding:'8px', borderRadius:7, border:'none', background:C.green, color:'#fff', fontSize:12, fontWeight:500, cursor:'pointer' }}>
                  Ajouter
                </button>
                <button onClick={()=>setShowAdd(false)} style={{ padding:'8px 14px', borderRadius:7, border:`1px solid ${C.border}`, background:'white', fontSize:12, cursor:'pointer' }}>
                  Annuler
                </button>
              </div>
            </div>
          )}

          {loading ? <div style={{ padding:24, textAlign:'center', color:C.text4, fontSize:12 }}>Chargement...</div>
          : phases.length === 0 ? (
            <div style={{ padding:24, textAlign:'center', color:C.text4, fontSize:12 }}>
              Aucune phase définie — ajoutez les étapes d'implémentation de ce site
            </div>
          ) : (
            <div style={{ position:'relative' }}>
              <div style={{ position:'absolute', left:15, top:0, bottom:0, width:2, background:C.border }} />
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {phases.map((ph, idx) => {
                  const sph = SPH[ph.status] || SPH.pending;
                  const photos = ph.photo_urls || [];
                  return (
                    <div key={ph.id} style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:ph.status==='done'?C.green:ph.status==='in_progress'?C.blue:'white', border:`2px solid ${sph.color}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, zIndex:1, fontSize:11, fontWeight:700, color:['done','in_progress'].includes(ph.status)?'white':sph.color }}>
                        {ph.status==='done'?'✓':(idx+1)}
                      </div>
                      <div style={{ flex:1, background:C.bg, borderRadius:8, padding:'10px 12px', border:`1px solid ${C.border}` }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                          <span style={{ fontSize:12, fontWeight:500, color:C.text }}>{ph.title}</span>
                          <Pill label={sph.label} color={sph.color} bg={sph.color+'18'} />
                        </div>
                        {ph.description && <div style={{ fontSize:11, color:C.text3, marginBottom:8, lineHeight:1.5 }}>{ph.description}</div>}

                        {photos.length > 0 && (
                          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
                            {photos.map((url, i) => (
                              <img key={i} src={url} alt={`Photo ${i+1}`}
                                style={{ width:72, height:54, objectFit:'cover', borderRadius:5, border:`1px solid ${C.border}`, cursor:'pointer' }}
                                onClick={()=>window.open(url,'_blank')} />
                            ))}
                          </div>
                        )}

                        <div style={{ display:'flex', gap:5, flexWrap:'wrap', alignItems:'center' }}>
                          {['pending','in_progress','done'].map(s => (
                            <button key={s} onClick={()=>updPhase(ph.id,{status:s})}
                              style={{ padding:'3px 8px', borderRadius:5, border:`1px solid ${ph.status===s?SPH[s].color:C.border}`, background:ph.status===s?SPH[s].color:'white', color:ph.status===s?'white':C.text3, fontSize:10, fontWeight:500, cursor:'pointer' }}>
                              {SPH[s].label}
                            </button>
                          ))}
                          <label style={{ marginLeft:'auto', padding:'3px 8px', borderRadius:5, border:`1px solid ${C.border}`, background:'white', color:C.text3, fontSize:10, cursor:'pointer' }}>
                            📷 Photo
                            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}
                              onChange={e => { if(e.target.files[0]) uploadPhoto(ph.id, photos, e.target.files[0]); e.target.value=''; }} />
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── VUE DÉTAIL PROJET ────────────────────────────────────────────────
function DetailView({ projectId, onBack }) {
  const [proj, setProj] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('sites');
  const [selectedSite, setSelectedSite] = useState(null);
  const [showAddSite, setShowAddSite] = useState(false);
  const [showAddStep, setShowAddStep] = useState(false);
  const [editMethod, setEditMethod] = useState(false);
  const [methodology, setMethodology] = useState('');
  const [ns, setNs] = useState({ site_code:'', site_name:'', region:'', status:'pending', context:'' });
  const [nst, setNst] = useState({ label:'', status:'pending', target_date:'' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showT = m => { setToast(m); setTimeout(()=>setToast(''),3000); };
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api(`/projects-list/${projectId}`).then(r=>r.json());
      setProj(r);
      setMethodology(r.methodology||'');
    } catch {}
    setLoading(false);
  }, [projectId]);
  useEffect(()=>{ load(); },[load]);

  const addSite = async () => {
    if (!ns.site_code && !ns.site_name) return showT('Code ou nom requis');
    setSaving(true);
    await api(`/projects-list/${projectId}/sites`, { method:'POST', body:JSON.stringify(ns) });
    setNs({ site_code:'', site_name:'', region:'', status:'pending', context:'' });
    setShowAddSite(false);
    showT('Site ajouté ✓');
    load();
    setSaving(false);
  };
  const updSite = async (siteId, u) => {
    await api(`/projects-list/${projectId}/sites/${siteId}`, { method:'PUT', body:JSON.stringify(u) });
    load();
  };
  const addStep = async () => {
    if (!nst.label) return showT('Libellé requis');
    setSaving(true);
    await api(`/projects-list/${projectId}/steps`, { method:'POST', body:JSON.stringify({ ...nst, order_index:proj?.steps?.length||0 }) });
    setNst({ label:'', status:'pending', target_date:'' });
    setShowAddStep(false);
    showT('Étape ajoutée ✓');
    load();
    setSaving(false);
  };
  const updStep = async (stepId, u) => {
    await api(`/projects-list/${projectId}/steps/${stepId}`, { method:'PUT', body:JSON.stringify(u) });
    load();
  };
  const saveMethod = async () => {
    await api(`/projects-list/${projectId}/methodology`, { method:'PUT', body:JSON.stringify({ methodology }) });
    setEditMethod(false);
    showT('Méthodologie mise à jour ✓');
    load();
  };

  if (loading) return <div style={{ padding:48, textAlign:'center', color:C.text4 }}>Chargement...</div>;
  if (!proj || proj.message) return <div style={{ padding:48, textAlign:'center', color:C.red }}>Projet introuvable</div>;

  const st = SP[proj.status] || SP.en_cours;
  const totalS = proj.sites?.length||0, doneS = proj.sites?.filter(s=>s.status==='done').length||0;
  const avgP = totalS>0?Math.round(proj.sites.reduce((s,si)=>s+(si.progress||0),0)/totalS):0;
  const doneT = proj.steps?.filter(s=>s.status==='done').length||0, totalT = proj.steps?.length||0;

  return (
    <div style={{ padding:24, background:C.bg, minHeight:'100%' }}>
      <Toast msg={toast} />
      {selectedSite && <SitePhases site={selectedSite} onClose={()=>{ setSelectedSite(null); load(); }} />}

      <div style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:18 }}>
        <button onClick={onBack} style={{ padding:'7px 13px', borderRadius:7, border:`1px solid ${C.border}`, background:C.white, fontSize:12, cursor:'pointer', color:C.text3 }}>← Projets</button>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <h1 style={{ fontSize:18, fontWeight:600, color:C.text, margin:0, letterSpacing:'-0.02em' }}>{proj.name}</h1>
            <Pill label={st.label} color={st.color} bg={st.bg} />
            {proj.type && <Pill label={proj.type} color={C.teal} bg={C.tealL} />}
          </div>
          <div style={{ fontSize:11, color:C.text3, marginTop:3 }}>
            {proj.client && <span>{proj.client}</span>}
            {proj.po_reference && <span style={{ marginLeft:8 }}>· Réf. BC: <strong style={{ color:C.text2 }}>{proj.po_reference}</strong></span>}
            {proj.chef_nom && <span style={{ marginLeft:8 }}>· CDP: {proj.chef_nom}</span>}
          </div>
        </div>
      </div>

      {/* Description du projet */}
      {proj.description && (
        <div style={{ background:C.white, borderRadius:9, padding:'14px 16px', border:`1px solid ${C.border}`, marginBottom:12 }}>
          <div style={{ fontSize:11, fontWeight:600, color:C.text3, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>À propos de ce projet</div>
          <p style={{ fontSize:13, color:C.text2, lineHeight:1.65, margin:0 }}>{proj.description}</p>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:14 }}>
        {[['Sites', `${doneS}/${totalS}`, C.blue, 'terminés'], ['Avancement', `${avgP}%`, avgP>=100?C.green:C.blue, 'global'], ['Étapes', `${doneT}/${totalT}`, C.purple, 'complétées'], ['Budget', proj.budget>0?fM(proj.budget)+' F':'—', C.teal, proj.currency||'FCFA']].map(([l,v,c,s]) => (
          <div key={l} style={{ background:C.white, borderRadius:9, padding:'12px 14px', border:`1px solid ${C.border}`, borderTop:`2px solid ${c}` }}>
            <div style={{ fontSize:11, color:C.text3, marginBottom:4 }}>{l}</div>
            <div style={{ fontSize:18, fontWeight:600, color:c, letterSpacing:'-0.02em' }}>{v}</div>
            <div style={{ fontSize:10, color:C.text4 }}>{s}</div>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div style={{ background:C.white, borderRadius:10, border:`1px solid ${C.border}`, overflow:'hidden' }}>
        <div style={{ display:'flex', borderBottom:`1px solid ${C.border}` }}>
          {[['sites',`Sites (${totalS})`],['methodologie','Méthodologie commune'],['etapes',`Étapes (${totalT})`],['missions',`Missions (${proj.missions?.length||0})`]].map(([id,l]) => (
            <button key={id} onClick={()=>setTab(id)}
              style={{ padding:'11px 18px', border:'none', borderBottom:`2px solid ${tab===id?C.blue:'transparent'}`, background:'transparent', color:tab===id?C.blue:C.text3, fontWeight:tab===id?500:400, fontSize:12, cursor:'pointer', transition:'all .12s', whiteSpace:'nowrap' }}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ padding:18 }}>
          {/* SITES */}
          {tab==='sites' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                <span style={{ fontSize:12, color:C.text3 }}>Sites rattachés à ce projet</span>
                <button onClick={()=>setShowAddSite(!showAddSite)} style={{ padding:'5px 12px', borderRadius:6, border:'none', background:C.text, color:'#fff', fontSize:11, fontWeight:500, cursor:'pointer' }}>+ Ajouter un site</button>
              </div>
              {showAddSite && (
                <div style={{ background:C.bg, borderRadius:8, padding:14, marginBottom:14, border:`1px solid ${C.border}` }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:8 }}>
                    {[['site_code','Code site','GAR-001'],['site_name','Nom du site','Tour MTN Garoua Centre'],['region','Région','Nord Cameroun']].map(([f,l,ph]) => (
                      <div key={f}>
                        <div style={{ fontSize:10, color:C.text3, marginBottom:3 }}>{l}</div>
                        <input value={ns[f]} onChange={e=>setNs(p=>({...p,[f]:e.target.value}))} placeholder={ph}
                          style={{ width:'100%', padding:'7px 9px', border:`1px solid ${C.border}`, borderRadius:6, fontSize:11, boxSizing:'border-box', outline:'none' }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom:10 }}>
                    <div style={{ fontSize:10, color:C.text3, marginBottom:3 }}>Contexte spécifique de ce site (optionnel)</div>
                    <input value={ns.context} onChange={e=>setNs(p=>({...p,context:e.target.value}))} placeholder="Ex: site rural sans couverture 4G, accès difficile, alimentation solaire..."
                      style={{ width:'100%', padding:'7px 9px', border:`1px solid ${C.border}`, borderRadius:6, fontSize:11, boxSizing:'border-box', outline:'none' }} />
                  </div>
                  <div style={{ display:'flex', gap:7 }}>
                    <button onClick={addSite} disabled={saving} style={{ padding:'7px 16px', borderRadius:6, border:'none', background:C.green, color:'#fff', fontSize:11, fontWeight:500, cursor:'pointer' }}>Ajouter</button>
                    <button onClick={()=>setShowAddSite(false)} style={{ padding:'7px 12px', borderRadius:6, border:`1px solid ${C.border}`, background:'white', fontSize:11, cursor:'pointer' }}>Annuler</button>
                  </div>
                </div>
              )}
              {proj.sites?.length===0 ? (
                <div style={{ textAlign:'center', padding:24, color:C.text4, fontSize:12 }}>Aucun site rattaché — ajoutez les sites couverts par ce projet</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                  {proj.sites.map(site => {
                    const sst = SS[site.status]||SS.pending;
                    return (
                      <div key={site.id} style={{ background:C.bg, borderRadius:8, padding:'11px 14px', border:`1px solid ${C.border}` }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <div style={{ flex:1 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}>
                              {site.site_code && <span style={{ fontSize:11, fontWeight:600, color:C.blue, background:C.blueL, padding:'2px 7px', borderRadius:5 }}>{site.site_code}</span>}
                              <span style={{ fontSize:12, fontWeight:500, color:C.text }}>{site.site_name||site.site_code}</span>
                              {site.region && <span style={{ fontSize:10, color:C.text4 }}>· {site.region}</span>}
                            </div>
                            {site.context && <div style={{ fontSize:10, color:C.text3, marginBottom:5, fontStyle:'italic' }}>{site.context}</div>}
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                              <div style={{ flex:1, maxWidth:220 }}><Bar v={site.progress} color={site.status==='done'?C.green:C.blue} /></div>
                              <span style={{ fontSize:10, color:C.text3 }}>{site.progress||0}%</span>
                            </div>
                          </div>
                          <div style={{ display:'flex', gap:6, alignItems:'center', flexShrink:0 }}>
                            <select value={site.status} onChange={e=>updSite(site.id,{status:e.target.value})}
                              style={{ padding:'4px 7px', border:`1px solid ${C.border}`, borderRadius:5, fontSize:10, background:'white', cursor:'pointer' }}>
                              {Object.entries(SS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                            </select>
                            <input type="number" min="0" max="100" value={site.progress||0}
                              onChange={e=>updSite(site.id,{progress:parseInt(e.target.value)||0})}
                              style={{ width:52, padding:'4px 6px', border:`1px solid ${C.border}`, borderRadius:5, fontSize:10, textAlign:'center' }} title="%" />
                            <button onClick={()=>setSelectedSite(site)}
                              style={{ padding:'4px 10px', borderRadius:5, border:`1px solid ${C.blue}`, background:C.blueL, color:C.blue, fontSize:10, fontWeight:500, cursor:'pointer' }}>
                              Phases & Photos
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* MÉTHODOLOGIE COMMUNE */}
          {tab==='methodologie' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:C.text, marginBottom:2 }}>Méthodologie commune à tous les sites</div>
                  <div style={{ fontSize:11, color:C.text3 }}>Points qui s'appliquent identiquement à tous les sites de ce projet (équipements, HSE, approche générale)</div>
                </div>
                {!editMethod && <button onClick={()=>setEditMethod(true)} style={{ padding:'6px 13px', borderRadius:6, border:`1px solid ${C.border}`, background:'white', color:C.text2, fontSize:11, cursor:'pointer' }}>Modifier</button>}
              </div>
              {editMethod ? (
                <div>
                  <textarea value={methodology} onChange={e=>setMethodology(e.target.value)} rows={10}
                    placeholder="Décrivez la méthodologie commune à tous les sites de ce projet :&#10;&#10;• Équipements utilisés sur tous les sites : BBU5900, AAU5614...&#10;• Contraintes HSE communes : équipement de protection, autorisation d'accès...&#10;• Approche générale de déploiement : coordination avec le client, jalons communs...&#10;• Points de vigilance partagés..."
                    style={{ width:'100%', padding:'10px 12px', border:`1px solid ${C.border}`, borderRadius:8, fontSize:12, resize:'vertical', boxSizing:'border-box', outline:'none', lineHeight:1.65, fontFamily:'inherit' }} />
                  <div style={{ display:'flex', gap:7, marginTop:8 }}>
                    <button onClick={saveMethod} style={{ padding:'8px 18px', borderRadius:7, border:'none', background:C.green, color:'#fff', fontSize:12, fontWeight:500, cursor:'pointer' }}>Enregistrer</button>
                    <button onClick={()=>{ setEditMethod(false); setMethodology(proj.methodology||''); }} style={{ padding:'8px 12px', borderRadius:7, border:`1px solid ${C.border}`, background:'white', fontSize:12, cursor:'pointer' }}>Annuler</button>
                  </div>
                </div>
              ) : proj.methodology ? (
                <div style={{ background:C.bg, borderRadius:8, padding:14, border:`1px solid ${C.border}`, fontSize:13, color:C.text2, lineHeight:1.7, whiteSpace:'pre-wrap' }}>{proj.methodology}</div>
              ) : (
                <div style={{ textAlign:'center', padding:32, color:C.text4, fontSize:12 }}>
                  Aucune méthodologie définie — cliquez "Modifier" pour décrire l'approche commune à tous les sites
                </div>
              )}
            </div>
          )}

          {/* ÉTAPES */}
          {tab==='etapes' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                <span style={{ fontSize:12, color:C.text3 }}>Étapes globales du projet — à définir avec le Chef de Projet</span>
                <button onClick={()=>setShowAddStep(!showAddStep)} style={{ padding:'5px 12px', borderRadius:6, border:'none', background:C.text, color:'#fff', fontSize:11, fontWeight:500, cursor:'pointer' }}>+ Étape</button>
              </div>
              {showAddStep && (
                <div style={{ background:C.bg, borderRadius:8, padding:14, marginBottom:14, border:`1px solid ${C.border}` }}>
                  <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:8, marginBottom:8 }}>
                    <div>
                      <div style={{ fontSize:10, color:C.text3, marginBottom:3 }}>Libellé *</div>
                      <input value={nst.label} onChange={e=>setNst(p=>({...p,label:e.target.value}))} placeholder="ex: Étude & Validation, Installation..."
                        style={{ width:'100%', padding:'7px 9px', border:`1px solid ${C.border}`, borderRadius:6, fontSize:11, boxSizing:'border-box', outline:'none' }} />
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:C.text3, marginBottom:3 }}>Statut</div>
                      <select value={nst.status} onChange={e=>setNst(p=>({...p,status:e.target.value}))}
                        style={{ width:'100%', padding:'7px 9px', border:`1px solid ${C.border}`, borderRadius:6, fontSize:11, background:'white' }}>
                        {Object.entries(SPH).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:C.text3, marginBottom:3 }}>Date cible</div>
                      <input type="date" value={nst.target_date} onChange={e=>setNst(p=>({...p,target_date:e.target.value}))}
                        style={{ width:'100%', padding:'7px 9px', border:`1px solid ${C.border}`, borderRadius:6, fontSize:11, boxSizing:'border-box', outline:'none' }} />
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:7 }}>
                    <button onClick={addStep} disabled={saving} style={{ padding:'7px 16px', borderRadius:6, border:'none', background:C.green, color:'#fff', fontSize:11, fontWeight:500, cursor:'pointer' }}>Ajouter</button>
                    <button onClick={()=>setShowAddStep(false)} style={{ padding:'7px 12px', borderRadius:6, border:`1px solid ${C.border}`, background:'white', fontSize:11, cursor:'pointer' }}>Annuler</button>
                  </div>
                </div>
              )}
              {proj.steps?.length===0 ? (
                <div style={{ textAlign:'center', padding:28, color:C.text4, fontSize:12 }}>Aucune étape — les phases spécifiques seront définies avec Nodem Espérance</div>
              ) : (
                <div style={{ position:'relative' }}>
                  <div style={{ position:'absolute', left:15, top:0, bottom:0, width:2, background:C.border }} />
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {proj.steps.map((step, idx) => {
                      const sst = SPH[step.status]||SPH.pending;
                      return (
                        <div key={step.id} style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                          <div style={{ width:32, height:32, borderRadius:'50%', background:step.status==='done'?C.green:step.status==='in_progress'?C.blue:'white', border:`2px solid ${sst.color}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, zIndex:1, fontSize:11, fontWeight:700, color:['done','in_progress'].includes(step.status)?'white':sst.color }}>
                            {step.status==='done'?'✓':(idx+1)}
                          </div>
                          <div style={{ flex:1, background:C.bg, borderRadius:8, padding:'10px 13px', border:`1px solid ${C.border}` }}>
                            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
                              <span style={{ fontSize:12, fontWeight:500, color:C.text }}>{step.label}</span>
                              <Pill label={sst.label} color={sst.color} bg={sst.color+'18'} />
                              {step.target_date && <span style={{ fontSize:10, color:C.text4, marginLeft:'auto' }}>Cible: {new Date(step.target_date).toLocaleDateString('fr-FR')}</span>}
                            </div>
                            <div style={{ display:'flex', gap:5 }}>
                              {['pending','in_progress','done','blocked'].map(s => (
                                <button key={s} onClick={()=>updStep(step.id,{status:s})}
                                  style={{ padding:'2px 7px', borderRadius:4, border:`1px solid ${step.status===s?SPH[s].color:C.border}`, background:step.status===s?SPH[s].color:'white', color:step.status===s?'white':C.text3, fontSize:10, cursor:'pointer' }}>
                                  {SPH[s].label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MISSIONS */}
          {tab==='missions' && (
            <div>
              <div style={{ fontSize:12, color:C.text3, marginBottom:12 }}>Missions terrain liées aux sites de ce projet (depuis le module Terrain)</div>
              {proj.missions?.length===0 ? (
                <div style={{ textAlign:'center', padding:28, color:C.text4, fontSize:12 }}>Aucune mission terrain associée pour l'instant</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                  {proj.missions.map(m => (
                    <div key={m.id} style={{ background:C.bg, borderRadius:8, padding:'11px 14px', border:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:500, color:C.text }}>{m.code} — {m.type||'Mission'}</div>
                        <div style={{ fontSize:10, color:C.text3 }}>Site: {m.site} · Statut: {m.status}</div>
                      </div>
                      <div style={{ fontSize:11, color:C.text3 }}>{m.progress||0}%</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── FORMULAIRE NOUVEAU PROJET ─────────────────────────────────────────
function NewForm({ onSave, onCancel, users }) {
  const [form, setForm] = useState({ name:'', client:'', type:'', po_reference:'', chef_projet_id:'', status:'en_cours', start_date:'', target_date:'', description:'', methodology:'', budget:'', currency:'FCFA' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const r = await api('/projects-list', { method:'POST', body:JSON.stringify({ ...form, budget:parseFloat(form.budget)||0, chef_projet_id:form.chef_projet_id||null }) });
      const data = await r.json();
      if (r.ok) onSave(data.id);
    } catch {}
    setSaving(false);
  };
  const inp = (f, p={}) => (
    <input value={form[f]} onChange={e=>setForm(prev=>({...prev,[f]:e.target.value}))}
      style={{ width:'100%', padding:'8px 11px', border:`1px solid ${C.border}`, borderRadius:7, fontSize:12, boxSizing:'border-box', outline:'none', color:C.text }}
      {...p} />
  );

  return (
    <div style={{ padding:24, background:C.bg, minHeight:'100%' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button onClick={onCancel} style={{ padding:'7px 13px', borderRadius:7, border:`1px solid ${C.border}`, background:C.white, fontSize:12, cursor:'pointer', color:C.text3 }}>← Annuler</button>
        <h1 style={{ fontSize:18, fontWeight:600, color:C.text, margin:0, letterSpacing:'-0.02em' }}>Nouveau projet</h1>
      </div>

      <div style={{ background:C.white, borderRadius:10, padding:22, border:`1px solid ${C.border}`, maxWidth:660 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:13, marginBottom:13 }}>
          <div style={{ gridColumn:'1/-1' }}>
            <div style={{ fontSize:11, color:C.text3, marginBottom:4 }}>Nom du projet *</div>
            {inp('name', { placeholder:'ex: Déploiement 5G Nord Cameroun — MTN' })}
          </div>
          <div>
            <div style={{ fontSize:11, color:C.text3, marginBottom:4 }}>Client</div>
            {inp('client', { placeholder:'ex: MTN Cameroun' })}
          </div>
          <div>
            <div style={{ fontSize:11, color:C.text3, marginBottom:4 }}>Type de projet</div>
            <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}
              style={{ width:'100%', padding:'8px 11px', border:`1px solid ${C.border}`, borderRadius:7, fontSize:12, background:'white', color:C.text }}>
              <option value="">— Sélectionner —</option>
              {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize:11, color:C.text3, marginBottom:4 }}>Référence BC / PO</div>
            {inp('po_reference', { placeholder:'ex: 416121376123-2' })}
          </div>
          <div>
            <div style={{ fontSize:11, color:C.text3, marginBottom:4 }}>Chef de Projet</div>
            <select value={form.chef_projet_id} onChange={e=>setForm(p=>({...p,chef_projet_id:e.target.value}))}
              style={{ width:'100%', padding:'8px 11px', border:`1px solid ${C.border}`, borderRadius:7, fontSize:12, background:'white', color:C.text }}>
              <option value="">— Non assigné —</option>
              {(users||[]).filter(u=>['admin','project_manager'].includes(u.role)).map(u=><option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize:11, color:C.text3, marginBottom:4 }}>Statut</div>
            <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}
              style={{ width:'100%', padding:'8px 11px', border:`1px solid ${C.border}`, borderRadius:7, fontSize:12, background:'white', color:C.text }}>
              {Object.entries(SP).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize:11, color:C.text3, marginBottom:4 }}>Date de démarrage</div>
            {inp('start_date', { type:'date' })}
          </div>
          <div>
            <div style={{ fontSize:11, color:C.text3, marginBottom:4 }}>Date cible de fin</div>
            {inp('target_date', { type:'date' })}
          </div>
          <div>
            <div style={{ fontSize:11, color:C.text3, marginBottom:4 }}>Budget (FCFA)</div>
            {inp('budget', { type:'number', placeholder:'0' })}
          </div>
          <div style={{ gridColumn:'1/-1' }}>
            <div style={{ fontSize:11, color:C.text3, marginBottom:4 }}>Description / Contexte du projet</div>
            <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}
              rows={3} placeholder="À quoi sert ce projet ? Quelle problématique résout-il ? Contexte général pour l'équipe et les personnes qui consulteront le système..."
              style={{ width:'100%', padding:'8px 11px', border:`1px solid ${C.border}`, borderRadius:7, fontSize:12, resize:'vertical', boxSizing:'border-box', outline:'none', color:C.text, lineHeight:1.6, fontFamily:'inherit' }} />
          </div>
          <div style={{ gridColumn:'1/-1' }}>
            <div style={{ fontSize:11, color:C.text3, marginBottom:4 }}>Méthodologie commune (optionnelle — peut être remplie plus tard)</div>
            <textarea value={form.methodology} onChange={e=>setForm(p=>({...p,methodology:e.target.value}))}
              rows={3} placeholder="Points communs à tous les sites : équipements, contraintes HSE, approche générale..."
              style={{ width:'100%', padding:'8px 11px', border:`1px solid ${C.border}`, borderRadius:7, fontSize:12, resize:'vertical', boxSizing:'border-box', outline:'none', color:C.text, lineHeight:1.6, fontFamily:'inherit' }} />
          </div>
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onCancel} style={{ padding:'9px 18px', borderRadius:7, border:`1px solid ${C.border}`, background:'white', fontSize:12, cursor:'pointer' }}>Annuler</button>
          <button onClick={save} disabled={saving||!form.name}
            style={{ padding:'9px 22px', borderRadius:7, border:'none', background:form.name?C.text:'#CBD5E1', color:'white', fontSize:12, fontWeight:500, cursor:form.name?'pointer':'default' }}>
            {saving?'Création...':'Créer le projet'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ───────────────────────────────────────────────
export default function Projets() {
  const [view, setView] = useState('list');
  const [selId, setSelId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, u] = await Promise.all([
        api('/projects-list').then(r=>r.json()).catch(()=>[]),
        api('/users').then(r=>r.json()).catch(()=>[]),
      ]);
      setProjects(Array.isArray(r)?r:[]);
      setUsers(Array.isArray(u)?u:[]);
    } catch {}
    setLoading(false);
  }, []);
  useEffect(()=>{ load(); },[load]);

  if (view==='new') return <NewForm users={users} onSave={id=>{ setSelId(id); setView('detail'); load(); }} onCancel={()=>setView('list')} />;
  if (view==='detail'&&selId) return <DetailView projectId={selId} onBack={()=>{ setView('list'); load(); }} />;
  return <ListView projects={projects} loading={loading} onSelect={id=>{ setSelId(id); setView('detail'); }} onNew={()=>setView('new')} />;
}
