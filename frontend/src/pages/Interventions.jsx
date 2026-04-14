import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const STATUS = {
  planifiee:  { label:'Planifiée',   color:'#7c3aed', bg:'#f5f3ff' },
  en_cours:   { label:'En cours',    color:'#0078d4', bg:'#eff6ff' },
  terminee:   { label:'Terminée',    color:'#16a34a', bg:'#f0fdf4' },
  validee:    { label:'Validée Huawei', color:'#059669', bg:'#ecfdf5' },
  annulee:    { label:'Annulée',     color:'#dc2626', bg:'#fef2f2' },
};

const TYPES = ['installation','maintenance','swap','survey','demantelement','urgence'];

const SEED = [
  { id:1, code:'INT-00001', title:'Installation 5G DLA-001', type:'installation', site:'DLA-001', technicien:'Thomas Ngono', status:'en_cours', priority:'haute', dateDebut: new Date(Date.now()-3600000).toISOString(), dateFin: new Date(Date.now()+7200000).toISOString(), progression:45, description:'Installation BBU 5900 + RRU 5258 site Akwa Douala', equipements:['BBU 5900','RRU 5258 x2','Câblage'], validationHuawei:false },
  { id:2, code:'INT-00002', title:'Maintenance YDE-001', type:'maintenance', site:'YDE-001', technicien:'Jean Mbarga', status:'planifiee', priority:'normale', dateDebut: new Date(Date.now()+86400000).toISOString(), dateFin: new Date(Date.now()+90000000).toISOString(), progression:0, description:'Maintenance préventive mensuelle', equipements:[], validationHuawei:false },
  { id:3, code:'INT-00003', title:'Swap 4G→5G KRI-001', type:'swap', site:'KRI-001', technicien:'Pierre Etoga', status:'validee', priority:'haute', dateDebut: new Date(Date.now()-172800000).toISOString(), dateFin: new Date(Date.now()-86400000).toISOString(), progression:100, description:'Swap complet infrastructure 4G vers 5G NR', equipements:['BBU 5900','RRU 5258 x3','AAU 5614'], validationHuawei:true },
  { id:4, code:'INT-00004', title:'Survey BFN-001', type:'survey', site:'BFN-001', technicien:'Samuel Djomo', status:'terminee', priority:'normale', dateDebut: new Date(Date.now()-259200000).toISOString(), dateFin: new Date(Date.now()-172800000).toISOString(), progression:100, description:'Survey technique pour nouveau site Bafoussam', equipements:[], validationHuawei:false },
  { id:5, code:'INT-00005', title:'Urgence DLA-003', type:'urgence', site:'DLA-003', technicien:'Thomas Ngono', status:'en_cours', priority:'critique', dateDebut: new Date(Date.now()-1800000).toISOString(), dateFin: null, progression:30, description:'Panne critique BBU. Intervention urgente requise.', equipements:['BBU 5900 (remplacement)'], validationHuawei:false },
];

export default function Interventions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [filterType, setFilterType] = useState('tous');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:'', type:'installation', site:'', technicien:'', priority:'haute', dateDebut:'', dateFin:'', description:'', equipements:'' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/interventions');
      const data = Array.isArray(r.data) ? r.data : [];
      setItems(data.length > 0 ? data : SEED);
    } catch { setItems(SEED); }
    finally { setLoading(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/interventions', { ...form, equipements: form.equipements.split(',').map(s=>s.trim()) });
      setShowForm(false); load();
    } catch {
      const n = { ...form, id:Date.now(), code:`INT-${String(items.length+1).padStart(5,'0')}`, status:'planifiee', progression:0, equipements:form.equipements.split(',').map(s=>s.trim()), validationHuawei:false };
      setItems(p=>[n,...p]); setShowForm(false);
    } finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    const prog = status==='terminee'||status==='validee' ? 100 : status==='en_cours' ? 50 : 0;
    try { await api.put(`/interventions/${id}`, { status, progression: prog }); }
    catch { setItems(p=>p.map(i=>i.id===id?{...i,status,progression:prog}:i)); return; }
    load();
  };

  const updateProgression = async (id, progression) => {
    try { await api.put(`/interventions/${id}`, { progression: Number(progression) }); }
    catch {}
    setItems(p=>p.map(i=>i.id===id?{...i,progression:Number(progression)}:i));
  };

  const fmt = d => d ? new Date(d).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) : '—';

  const filtered = items.filter(i => {
    const ms = filterStatus==='tous' || i.status===filterStatus;
    const mt = filterType==='tous' || i.type===filterType;
    const mq = !search || i.title?.toLowerCase().includes(search.toLowerCase()) || i.site?.toLowerCase().includes(search.toLowerCase()) || i.code?.toLowerCase().includes(search.toLowerCase());
    return ms && mt && mq;
  });

  const PRIO_C = { critique:'#dc2626', haute:'#ea580c', normale:'#16a34a', basse:'#64748b' };

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:12}}><div style={{width:40,height:40,borderRadius:'50%',border:'3px solid #7c3aed',borderTopColor:'transparent',animation:'spin 1s linear infinite'}} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><span style={{color:'#64748b'}}>Chargement des interventions...</span></div>;

  return (
    <div style={{padding:24,background:'#f0f2f5',minHeight:'100%'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:'#1e293b',margin:0}}>Interventions</h1>
          <p style={{color:'#64748b',fontSize:13,margin:'4px 0 0'}}>Suivi des interventions terrain · {items.length} interventions</p>
        </div>
        <button onClick={()=>setShowForm(true)} style={{padding:'9px 18px',borderRadius:8,border:'none',background:'#7c3aed',color:'white',fontSize:13,fontWeight:600,cursor:'pointer'}}>+ Nouvelle Intervention</button>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:10,marginBottom:20}}>
        {[{l:'Total',v:items.length,c:'#0078d4'},{l:'Planifiées',v:items.filter(i=>i.status==='planifiee').length,c:'#7c3aed'},{l:'En cours',v:items.filter(i=>i.status==='en_cours').length,c:'#0078d4'},{l:'Terminées',v:items.filter(i=>i.status==='terminee').length,c:'#16a34a'},{l:'Validées Huawei',v:items.filter(i=>i.status==='validee').length,c:'#059669'},{l:'Critiques',v:items.filter(i=>i.priority==='critique').length,c:'#dc2626'}].map(s=>(
          <div key={s.l} style={{background:'white',borderRadius:10,padding:'14px 16px',border:'1px solid #e2e8f0',textAlign:'center',borderTop:`3px solid ${s.c}`}}>
            <div style={{fontSize:22,fontWeight:800,color:s.c}}>{s.v}</div>
            <div style={{fontSize:11,color:'#64748b',marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{background:'white',borderRadius:10,padding:'12px 16px',border:'1px solid #e2e8f0',marginBottom:16,display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{position:'relative',flex:1,minWidth:200}}>
          <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#94a3b8'}}>🔍</span>
          <input placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:'100%',padding:'8px 12px 8px 32px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} />
        </div>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>
          <option value="tous">Tous les statuts</option>
          {Object.entries(STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>
          <option value="tous">Tous les types</option>
          {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
        <span style={{fontSize:12,color:'#94a3b8',marginLeft:'auto'}}>{filtered.length} résultat(s)</span>
      </div>

      {/* Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:14}}>
        {filtered.map(item => {
          const st = STATUS[item.status] || STATUS.planifiee;
          return (
            <div key={item.id} onClick={()=>setSelected(item)}
              style={{background:'white',borderRadius:12,border:'1px solid #e2e8f0',overflow:'hidden',cursor:'pointer',transition:'all .2s'}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)';e.currentTarget.style.transform='translateY(-2px)';}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='none';}}>
              <div style={{height:4,background:st.color}} />
              <div style={{padding:'14px 16px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:'#94a3b8',marginBottom:3}}>{item.code}</div>
                    <div style={{fontSize:14,fontWeight:700,color:'#1e293b'}}>{item.title}</div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                    <span style={{padding:'2px 8px',borderRadius:8,fontSize:10,fontWeight:700,background:st.bg,color:st.color}}>{st.label}</span>
                    <span style={{padding:'2px 8px',borderRadius:8,fontSize:10,fontWeight:700,background:`${PRIO_C[item.priority]||'#64748b'}15`,color:PRIO_C[item.priority]||'#64748b'}}>{item.priority}</span>
                  </div>
                </div>
                <div style={{display:'flex',gap:14,fontSize:12,color:'#64748b',marginBottom:10}}>
                  <span>📡 {item.site}</span>
                  <span>👷 {item.technicien||'Non assigné'}</span>
                  <span style={{padding:'1px 8px',borderRadius:8,background:'#f1f5f9',color:'#374151',fontSize:11}}>{item.type}</span>
                </div>
                <div style={{marginBottom:8}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#64748b',marginBottom:4}}>
                    <span>Progression</span><span style={{fontWeight:700,color:st.color}}>{item.progression||0}%</span>
                  </div>
                  <div style={{background:'#f1f5f9',borderRadius:6,height:8,overflow:'hidden'}}>
                    <div style={{width:`${item.progression||0}%`,height:'100%',background:st.color,borderRadius:6,transition:'width .5s'}} />
                  </div>
                </div>
                <div style={{display:'flex',gap:5,fontSize:11,color:'#94a3b8'}}>
                  <span>📅 {fmt(item.dateDebut)}</span>
                  {item.validationHuawei && <span style={{marginLeft:'auto',padding:'1px 8px',borderRadius:8,background:'#ecfdf5',color:'#059669',fontWeight:600}}>✓ Huawei</span>}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length===0 && <div style={{gridColumn:'1/-1',padding:48,textAlign:'center',color:'#94a3b8',background:'white',borderRadius:10,border:'1px solid #e2e8f0'}}>Aucune intervention trouvée</div>}
      </div>

      {/* Modal Détail */}
      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'white',borderRadius:14,width:'100%',maxWidth:580,maxHeight:'85vh',overflow:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
            <div style={{padding:'16px 20px',background:`linear-gradient(135deg,#1e3a5f,${STATUS[selected.status]?.color||'#7c3aed'})`,color:'white',display:'flex',justifyContent:'space-between',alignItems:'center',borderRadius:'14px 14px 0 0',position:'sticky',top:0}}>
              <div><div style={{fontSize:16,fontWeight:800}}>{selected.code} — {selected.title}</div><div style={{fontSize:12,opacity:0.8,marginTop:2}}>Site: {selected.site} · {selected.type}</div></div>
              <button onClick={()=>setSelected(null)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:28,height:28,borderRadius:'50%',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
            <div style={{padding:24}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                {[{l:'Site',v:selected.site},{l:'Technicien',v:selected.technicien||'Non assigné'},{l:'Type',v:selected.type},{l:'Priorité',v:selected.priority},{l:'Début',v:fmt(selected.dateDebut)},{l:'Fin prévue',v:fmt(selected.dateFin)},{l:'Validation Huawei',v:selected.validationHuawei?'✅ Validée':'⏳ En attente'}].map(i=>(
                  <div key={i.l} style={{background:'#f8fafc',borderRadius:8,padding:'10px 14px'}}>
                    <div style={{fontSize:10,color:'#94a3b8',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px'}}>{i.l}</div>
                    <div style={{fontSize:13,fontWeight:600,color:'#1e293b',marginTop:3}}>{i.v}</div>
                  </div>
                ))}
              </div>
              {selected.description && <div style={{background:'#f8fafc',borderRadius:8,padding:'12px 14px',marginBottom:14}}><div style={{fontSize:10,color:'#94a3b8',fontWeight:700,marginBottom:5}}>DESCRIPTION</div><div style={{fontSize:13,color:'#374151'}}>{selected.description}</div></div>}
              {selected.equipements?.length>0 && <div style={{background:'#f8fafc',borderRadius:8,padding:'12px 14px',marginBottom:14}}><div style={{fontSize:10,color:'#94a3b8',fontWeight:700,marginBottom:8}}>ÉQUIPEMENTS</div><div style={{display:'flex',flexWrap:'wrap',gap:5}}>{selected.equipements.map(e=><span key={e} style={{padding:'3px 10px',borderRadius:8,background:'#eff6ff',color:'#2563eb',fontSize:12,fontWeight:600}}>{e}</span>)}</div></div>}
              {/* Progression slider */}
              <div style={{marginBottom:16}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <span style={{fontSize:12,fontWeight:700,color:'#374151'}}>Progression</span>
                  <span style={{fontSize:14,fontWeight:800,color:STATUS[selected.status]?.color||'#7c3aed'}}>{selected.progression||0}%</span>
                </div>
                <input type="range" min={0} max={100} value={selected.progression||0}
                  onChange={e=>{setSelected(p=>({...p,progression:Number(e.target.value)}));updateProgression(selected.id,e.target.value);}}
                  style={{width:'100%',accentColor:STATUS[selected.status]?.color||'#7c3aed'}} />
              </div>
              {/* Status buttons */}
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}>
                {Object.entries(STATUS).map(([k,v])=>(
                  <button key={k} onClick={()=>{updateStatus(selected.id,k);setSelected(p=>({...p,status:k}));}}
                    style={{flex:1,minWidth:100,padding:'8px',borderRadius:8,border:`1px solid ${v.color}`,background:selected.status===k?v.color:'white',color:selected.status===k?'white':v.color,cursor:'pointer',fontSize:11,fontWeight:600}}>
                    {v.label}
                  </button>
                ))}
              </div>
              <button onClick={()=>setSelected(null)} style={{width:'100%',padding:11,borderRadius:8,border:'1px solid #e2e8f0',background:'white',cursor:'pointer',fontSize:13,fontWeight:600,color:'#374151'}}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'white',borderRadius:14,width:'100%',maxWidth:520,maxHeight:'85vh',overflow:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
            <div style={{padding:'16px 20px',background:'linear-gradient(135deg,#4c1d95,#7c3aed)',color:'white',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0}}>
              <div style={{fontSize:16,fontWeight:800}}>+ Nouvelle Intervention</div>
              <button onClick={()=>setShowForm(false)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:28,height:28,borderRadius:'50%',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
            <div style={{padding:24,display:'flex',flexDirection:'column',gap:12}}>
              <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>TITRE *</label><input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Ex: Installation 5G DLA-001" style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} /></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>TYPE</label><select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>{TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>PRIORITÉ</label><select value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>{['critique','haute','normale','basse'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>CODE SITE</label><input value={form.site} onChange={e=>setForm(p=>({...p,site:e.target.value}))} placeholder="DLA-001" style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} /></div>
                <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>TECHNICIEN</label><input value={form.technicien} onChange={e=>setForm(p=>({...p,technicien:e.target.value}))} placeholder="Thomas Ngono" style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} /></div>
                <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>DATE DÉBUT</label><input type="datetime-local" value={form.dateDebut} onChange={e=>setForm(p=>({...p,dateDebut:e.target.value}))} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} /></div>
                <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>DATE FIN PRÉVUE</label><input type="datetime-local" value={form.dateFin} onChange={e=>setForm(p=>({...p,dateFin:e.target.value}))} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} /></div>
              </div>
              <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>ÉQUIPEMENTS (séparés par virgule)</label><input value={form.equipements} onChange={e=>setForm(p=>({...p,equipements:e.target.value}))} placeholder="BBU 5900, RRU 5258, Câblage" style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} /></div>
              <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>DESCRIPTION</label><textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Détails de l'intervention..." rows={3} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box',resize:'vertical'}} /></div>
              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>setShowForm(false)} style={{flex:1,padding:11,borderRadius:8,border:'1px solid #e2e8f0',background:'white',cursor:'pointer',fontSize:13,color:'#374151'}}>Annuler</button>
                <button onClick={save} disabled={!form.title||saving} style={{flex:2,padding:11,borderRadius:8,border:'none',background:form.title?'#7c3aed':'#e2e8f0',color:form.title?'white':'#94a3b8',cursor:form.title?'pointer':'not-allowed',fontSize:13,fontWeight:700}}>{saving?'Création...':'✓ Créer l\'intervention'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
