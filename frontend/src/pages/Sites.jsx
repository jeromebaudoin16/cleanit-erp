import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const STATUS = {
  planifie:  { label:'Planifié',   color:'#7c3aed', bg:'#f5f3ff', dot:'#7c3aed' },
  en_cours:  { label:'En cours',   color:'#0078d4', bg:'#eff6ff', dot:'#0078d4' },
  termine:   { label:'Terminé',    color:'#16a34a', bg:'#f0fdf4', dot:'#16a34a' },
  livre:     { label:'Livré',      color:'#059669', bg:'#ecfdf5', dot:'#059669' },
  en_retard: { label:'En retard',  color:'#dc2626', bg:'#fef2f2', dot:'#dc2626' },
};

const PRIO = {
  critique: { color:'#dc2626', bg:'#fef2f2' },
  haute:    { color:'#ea580c', bg:'#fff7ed' },
  normale:  { color:'#16a34a', bg:'#f0fdf4' },
};

export default function Sites() {
  const [sites, setSites] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [filterRegion, setFilterRegion] = useState('tous');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState('table');
  const [form, setForm] = useState({ code:'', name:'', region:'', ville:'', typeTravauxEnum:'', technology:'4G LTE', status:'planifie', priorite:'normale', projectManager:'', budgetEstime:'', notes:'' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [s, st] = await Promise.all([api.get('/sites'), api.get('/sites/stats')]);
      setSites(s.data); setStats(st.data);
    } catch { setSites([]); }
    finally { setLoading(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      if (selected && !showForm) {
        await api.put(`/sites/${selected.id}`, selected);
      } else {
        await api.post('/sites', { ...form, budgetEstime: Number(form.budgetEstime) });
      }
      setShowForm(false); setSelected(null); load();
    } catch { alert('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  const deleteSite = async (id) => {
    if (!confirm('Supprimer ce site ?')) return;
    await api.delete(`/sites/${id}`);
    load();
  };

  const regions = [...new Set(sites.map(s => s.region).filter(Boolean))];

  const filtered = sites.filter(s => {
    const ms = filterStatus === 'tous' || s.status === filterStatus;
    const mr = filterRegion === 'tous' || s.region === filterRegion;
    const mq = !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.code?.toLowerCase().includes(search.toLowerCase()) || s.ville?.toLowerCase().includes(search.toLowerCase());
    return ms && mr && mq;
  });

  const fmt = n => n ? new Intl.NumberFormat('fr-FR').format(n) : '—';

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:12 }}>
      <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid #0078d4', borderTopColor:'transparent', animation:'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{ color:'#64748b' }}>Chargement des sites...</span>
    </div>
  );

  return (
    <div style={{ padding:24, background:'#f0f2f5', minHeight:'100%' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:'#1e293b', margin:0 }}>Sites Réseau</h1>
          <p style={{ color:'#64748b', fontSize:13, margin:'4px 0 0' }}>Gestion des sites Huawei au Cameroun · {sites.length} sites</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={load} style={{ padding:'8px 14px', borderRadius:8, border:'1px solid #e2e8f0', background:'white', color:'#374151', fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>↻ Actualiser</button>
          <button onClick={() => setShowForm(true)} style={{ padding:'8px 16px', borderRadius:8, border:'none', background:'#0078d4', color:'white', fontSize:13, fontWeight:600, cursor:'pointer' }}>+ Nouveau Site</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:10, marginBottom:20 }}>
        {[
          { label:'Total', value:stats.total||0, color:'#0078d4' },
          { label:'Planifiés', value:stats.planifie||0, color:'#7c3aed' },
          { label:'En cours', value:stats.en_cours||0, color:'#0078d4' },
          { label:'Terminés', value:stats.termine||0, color:'#16a34a' },
          { label:'Livrés', value:stats.livre||0, color:'#059669' },
          { label:'En retard', value:stats.en_retard||0, color:'#dc2626' },
        ].map(s => (
          <div key={s.label} onClick={() => setFilterStatus(s.label==='Total'?'tous':Object.entries(STATUS).find(([k,v])=>v.label===s.label)?.[0]||'tous')}
            style={{ background:'white', borderRadius:10, padding:'14px 16px', border:'1px solid #e2e8f0', cursor:'pointer', textAlign:'center', borderTop:`3px solid ${s.color}`, transition:'all .2s' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
            <div style={{ fontSize:26, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background:'white', borderRadius:10, padding:'12px 16px', border:'1px solid #e2e8f0', marginBottom:16, display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', fontSize:14 }}>🔍</span>
          <input placeholder="Rechercher par code, nom, ville..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width:'100%', padding:'8px 12px 8px 32px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', boxSizing:'border-box' }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding:'8px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13, background:'white', color:'#374151' }}>
          <option value="tous">Tous les statuts</option>
          {Object.entries(STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)} style={{ padding:'8px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13, background:'white', color:'#374151' }}>
          <option value="tous">Toutes les régions</option>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <div style={{ display:'flex', gap:4, marginLeft:'auto' }}>
          {['table','kanban'].map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding:'7px 14px', borderRadius:6, border:'none', background: view===v?'#0078d4':'#f1f5f9', color: view===v?'white':'#64748b', fontSize:12, cursor:'pointer', fontWeight: view===v?600:400 }}>
              {v === 'table' ? '☰ Liste' : '⊞ Kanban'}
            </button>
          ))}
        </div>
        <span style={{ fontSize:12, color:'#94a3b8' }}>{filtered.length} site(s)</span>
      </div>

      {/* Vue Table */}
      {view === 'table' && (
        <div style={{ background:'white', borderRadius:10, border:'1px solid #e2e8f0', overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc', borderBottom:'2px solid #e2e8f0' }}>
                {['Code','Nom du Site','Région / Ville','Type Travaux','Tech','Statut','Priorité','PM','Progression','Budget','Actions'].map(h => (
                  <th key={h} style={{ padding:'11px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.5px', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(site => {
                const st = STATUS[site.status] || STATUS.planifie;
                const pr = PRIO[site.priorite] || PRIO.normale;
                return (
                  <tr key={site.id} style={{ borderBottom:'1px solid #f8fafc', transition:'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background='white'}>
                    <td style={{ padding:'11px 14px' }}>
                      <span style={{ fontWeight:700, color:'#0078d4', fontSize:13 }}>{site.code}</span>
                    </td>
                    <td style={{ padding:'11px 14px' }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{site.name}</div>
                    </td>
                    <td style={{ padding:'11px 14px', fontSize:12, color:'#64748b' }}>
                      <div>{site.region}</div>
                      <div style={{ color:'#94a3b8' }}>{site.ville}</div>
                    </td>
                    <td style={{ padding:'11px 14px', fontSize:12, color:'#374151', maxWidth:150 }}>
                      <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{site.typeTravauxEnum || '—'}</div>
                    </td>
                    <td style={{ padding:'11px 14px' }}>
                      <span style={{ padding:'2px 8px', borderRadius:10, fontSize:11, fontWeight:600, background:'#eff6ff', color:'#0078d4' }}>{site.technology || '—'}</span>
                    </td>
                    <td style={{ padding:'11px 14px' }}>
                      <span style={{ padding:'3px 10px', borderRadius:10, fontSize:11, fontWeight:600, background:st.bg, color:st.color, display:'flex', alignItems:'center', gap:5, width:'fit-content' }}>
                        <span style={{ width:6, height:6, borderRadius:'50%', background:st.dot, flexShrink:0 }} />
                        {st.label}
                      </span>
                    </td>
                    <td style={{ padding:'11px 14px' }}>
                      <span style={{ padding:'2px 8px', borderRadius:10, fontSize:11, fontWeight:600, background:pr.bg, color:pr.color }}>{site.priorite || '—'}</span>
                    </td>
                    <td style={{ padding:'11px 14px', fontSize:12, color:'#374151' }}>{site.projectManager || '—'}</td>
                    <td style={{ padding:'11px 14px', minWidth:100 }}>
                      <div style={{ background:'#f1f5f9', borderRadius:6, height:8, overflow:'hidden', marginBottom:3 }}>
                        <div style={{ width:`${site.progression||0}%`, height:'100%', background: (site.progression||0)>=100?'#16a34a':(site.progression||0)>=50?'#0078d4':'#f59e0b', borderRadius:6, transition:'width .5s' }} />
                      </div>
                      <div style={{ fontSize:11, color:'#64748b', textAlign:'right' }}>{site.progression||0}%</div>
                    </td>
                    <td style={{ padding:'11px 14px', fontSize:12, color:'#374151', whiteSpace:'nowrap' }}>{fmt(site.budgetEstime)} XAF</td>
                    <td style={{ padding:'11px 14px' }}>
                      <div style={{ display:'flex', gap:5 }}>
                        <button onClick={() => setSelected(site)} style={{ padding:'4px 10px', borderRadius:6, border:'1px solid #0078d4', background:'white', color:'#0078d4', fontSize:11, cursor:'pointer', fontWeight:600 }}>✏</button>
                        <button onClick={() => deleteSite(site.id)} style={{ padding:'4px 10px', borderRadius:6, border:'1px solid #dc2626', background:'white', color:'#dc2626', fontSize:11, cursor:'pointer', fontWeight:600 }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={11} style={{ padding:48, textAlign:'center', color:'#94a3b8' }}>
                  Aucun site trouvé
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Vue Kanban */}
      {view === 'kanban' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14 }}>
          {Object.entries(STATUS).map(([key, cfg]) => {
            const colSites = filtered.filter(s => s.status === key);
            return (
              <div key={key} style={{ background:'white', borderRadius:10, border:'1px solid #e2e8f0', overflow:'hidden' }}>
                <div style={{ padding:'12px 14px', background:cfg.bg, borderBottom:`2px solid ${cfg.color}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:12, fontWeight:700, color:cfg.color }}>{cfg.label}</span>
                  <span style={{ width:22, height:22, borderRadius:'50%', background:cfg.color, color:'white', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{colSites.length}</span>
                </div>
                <div style={{ padding:8, display:'flex', flexDirection:'column', gap:8, maxHeight:500, overflowY:'auto' }}>
                  {colSites.map(site => (
                    <div key={site.id} onClick={() => setSelected(site)}
                      style={{ padding:'10px 12px', borderRadius:8, border:'1px solid #f1f5f9', background:'#fafafa', cursor:'pointer', transition:'all .15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background='#f0f7ff'; e.currentTarget.style.borderColor='#0078d4'; }}
                      onMouseLeave={e => { e.currentTarget.style.background='#fafafa'; e.currentTarget.style.borderColor='#f1f5f9'; }}>
                      <div style={{ fontSize:12, fontWeight:700, color:'#0078d4', marginBottom:3 }}>{site.code}</div>
                      <div style={{ fontSize:12, fontWeight:600, color:'#1e293b', marginBottom:4 }}>{site.name}</div>
                      <div style={{ fontSize:11, color:'#64748b', marginBottom:6 }}>{site.typeTravauxEnum}</div>
                      <div style={{ background:'#f1f5f9', borderRadius:4, height:5, overflow:'hidden' }}>
                        <div style={{ width:`${site.progression||0}%`, height:'100%', background:cfg.color }} />
                      </div>
                      <div style={{ fontSize:10, color:'#94a3b8', marginTop:3, textAlign:'right' }}>{site.progression||0}%</div>
                    </div>
                  ))}
                  {colSites.length === 0 && <div style={{ padding:16, textAlign:'center', color:'#cbd5e1', fontSize:12 }}>Aucun site</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Détail / Édition */}
      {(selected || showForm) && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'white', borderRadius:14, width:'100%', maxWidth:600, maxHeight:'90vh', overflow:'auto', boxShadow:'0 24px 64px rgba(0,0,0,0.25)' }}>
            <div style={{ padding:'16px 20px', background:'linear-gradient(135deg,#1e3a5f,#0078d4)', color:'white', display:'flex', justifyContent:'space-between', alignItems:'center', borderRadius:'14px 14px 0 0', position:'sticky', top:0 }}>
              <div>
                <div style={{ fontSize:16, fontWeight:800 }}>{showForm ? '+ Nouveau Site' : `✏ Modifier — ${selected?.code}`}</div>
                <div style={{ fontSize:12, opacity:0.8, marginTop:2 }}>{showForm ? 'Créer un nouveau site réseau' : selected?.name}</div>
              </div>
              <button onClick={() => { setSelected(null); setShowForm(false); }} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'white', width:28, height:28, borderRadius:'50%', cursor:'pointer', fontSize:16 }}>✕</button>
            </div>

            <div style={{ padding:24 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                {[
                  { label:'Code Site *', key:'code', ph:'DLA-001' },
                  { label:'Nom du Site *', key:'name', ph:'Site Akwa Douala' },
                  { label:'Région', key:'region', ph:'Littoral' },
                  { label:'Ville', key:'ville', ph:'Douala' },
                  { label:'Type de Travaux', key:'typeTravauxEnum', ph:'Installation 5G' },
                  { label:'Technologie', key:'technology', ph:'5G NR' },
                  { label:'Project Manager', key:'projectManager', ph:'Marie Kamga' },
                  { label:'Technicien Assigné', key:'technicienAssigne', ph:'Thomas Ngono' },
                  { label:'Budget Estimé (XAF)', key:'budgetEstime', ph:'12500000', type:'number' },
                  { label:'Progression (%)', key:'progression', ph:'0', type:'number' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize:12, fontWeight:700, color:'#64748b', display:'block', marginBottom:5 }}>{f.label}</label>
                    <input type={f.type||'text'} placeholder={f.ph}
                      value={showForm ? form[f.key]||'' : selected?.[f.key]||''}
                      onChange={e => showForm ? setForm(p=>({...p,[f.key]:e.target.value})) : setSelected(p=>({...p,[f.key]:e.target.value}))}
                      style={{ width:'100%', padding:'9px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', boxSizing:'border-box' }}
                      onFocus={e => e.target.style.borderColor='#0078d4'}
                      onBlur={e => e.target.style.borderColor='#e2e8f0'} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:'#64748b', display:'block', marginBottom:5 }}>Statut</label>
                  <select value={showForm ? form.status : selected?.status}
                    onChange={e => showForm ? setForm(p=>({...p,status:e.target.value})) : setSelected(p=>({...p,status:e.target.value}))}
                    style={{ width:'100%', padding:'9px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13, background:'white' }}>
                    {Object.entries(STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:'#64748b', display:'block', marginBottom:5 }}>Priorité</label>
                  <select value={showForm ? form.priorite : selected?.priorite}
                    onChange={e => showForm ? setForm(p=>({...p,priorite:e.target.value})) : setSelected(p=>({...p,priorite:e.target.value}))}
                    style={{ width:'100%', padding:'9px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13, background:'white' }}>
                    {Object.entries(PRIO).map(([k]) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop:14 }}>
                <label style={{ fontSize:12, fontWeight:700, color:'#64748b', display:'block', marginBottom:5 }}>Notes</label>
                <textarea placeholder="Observations, remarques..." rows={3}
                  value={showForm ? form.notes||'' : selected?.notes||''}
                  onChange={e => showForm ? setForm(p=>({...p,notes:e.target.value})) : setSelected(p=>({...p,notes:e.target.value}))}
                  style={{ width:'100%', padding:'9px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', boxSizing:'border-box', resize:'vertical' }} />
              </div>
              <div style={{ display:'flex', gap:10, marginTop:20 }}>
                <button onClick={() => { setSelected(null); setShowForm(false); }}
                  style={{ flex:1, padding:11, borderRadius:8, border:'1px solid #e2e8f0', background:'white', cursor:'pointer', fontSize:13, fontWeight:600, color:'#374151' }}>
                  Annuler
                </button>
                <button onClick={save} disabled={saving}
                  style={{ flex:2, padding:11, borderRadius:8, border:'none', background:saving?'#94a3b8':'#0078d4', color:'white', cursor:saving?'not-allowed':'pointer', fontSize:13, fontWeight:700 }}>
                  {saving ? 'Enregistrement...' : '✓ Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
