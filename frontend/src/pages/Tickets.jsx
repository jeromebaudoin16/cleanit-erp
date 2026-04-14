import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const STATUS = {
  open:        { label:'Ouvert',     color:'#f59e0b', bg:'#fefce8' },
  in_progress: { label:'En cours',   color:'#0078d4', bg:'#eff6ff' },
  resolved:    { label:'Résolu',     color:'#16a34a', bg:'#f0fdf4' },
  closed:      { label:'Fermé',      color:'#64748b', bg:'#f8fafc' },
  critical:    { label:'Critique',   color:'#dc2626', bg:'#fef2f2' },
};
const PRIO = {
  critique: { color:'#dc2626', bg:'#fef2f2' },
  haute:    { color:'#ea580c', bg:'#fff7ed' },
  moyenne:  { color:'#f59e0b', bg:'#fefce8' },
  basse:    { color:'#16a34a', bg:'#f0fdf4' },
};

const SEED = [
  { id:1, code:'TK-00001', title:'Panne antenne secteur Akwa', type:'incident', priority:'critique', status:'in_progress', site:'DLA-001', technicien:'Thomas Ngono', description:'Antenne BBU-01 en panne depuis 14h. Signal coupé sur secteur Akwa Douala.', createdAt: new Date(Date.now()-3600000).toISOString() },
  { id:2, code:'TK-00002', title:'Maintenance préventive BFS-001', type:'maintenance', priority:'normale', status:'open', site:'BFN-001', technicien:'Samuel Djomo', description:'Maintenance mensuelle programmée. Vérification équipements.', createdAt: new Date(Date.now()-86400000).toISOString() },
  { id:3, code:'TK-00003', title:'Swap antenne 4G→5G Yaoundé Centre', type:'swap', priority:'haute', status:'in_progress', site:'YDE-001', technicien:'Jean Mbarga', description:'Remplacement RRU 4G par équipements 5G NR Huawei.', createdAt: new Date(Date.now()-172800000).toISOString() },
  { id:4, code:'TK-00004', title:'Survey nouveau site Garoua Nord', type:'survey', priority:'normale', status:'open', site:'GAR-001', technicien:'Ali Moussa', description:'Survey technique pour installation future.', createdAt: new Date(Date.now()-259200000).toISOString() },
  { id:5, code:'TK-00005', title:'Installation 5G Kribi Port', type:'installation', priority:'haute', status:'resolved', site:'KRI-001', technicien:'Thomas Ngono', description:'Installation complète BBU 5900 + RRU 5258.', createdAt: new Date(Date.now()-432000000).toISOString() },
  { id:6, code:'TK-00006', title:'Démantèlement 3G Limbé', type:'demantelement', priority:'basse', status:'open', site:'LIM-001', technicien:'', description:'Retrait équipements 3G obsolètes.', createdAt: new Date(Date.now()-518400000).toISOString() },
];

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [filterPrio, setFilterPrio] = useState('tous');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:'', type:'incident', priority:'haute', site:'', technicien:'', description:'' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/tickets');
      const data = Array.isArray(r.data) ? r.data : [];
      setTickets(data.length > 0 ? data : SEED);
    } catch { setTickets(SEED); }
    finally { setLoading(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/tickets', form);
      setShowForm(false);
      setForm({ title:'', type:'incident', priority:'haute', site:'', technicien:'', description:'' });
      load();
    } catch {
      const newT = { ...form, id: Date.now(), code:`TK-${String(tickets.length+1).padStart(5,'0')}`, status:'open', createdAt: new Date().toISOString() };
      setTickets(p => [newT, ...p]);
      setShowForm(false);
    } finally { setSaving(false); }
  };

  const changeStatus = async (id, status) => {
    try { await api.put(`/tickets/${id}`, { status }); }
    catch { setTickets(p => p.map(t => t.id===id ? {...t,status} : t)); }
    load();
  };

  const fmt = d => d ? new Date(d).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) : '—';

  const filtered = tickets.filter(t => {
    const ms = filterStatus==='tous' || t.status===filterStatus;
    const mp = filterPrio==='tous' || t.priority===filterPrio;
    const mq = !search || t.title?.toLowerCase().includes(search.toLowerCase()) || t.code?.toLowerCase().includes(search.toLowerCase()) || t.site?.toLowerCase().includes(search.toLowerCase());
    return ms && mp && mq;
  });

  const counts = Object.keys(STATUS).reduce((a,k) => ({...a,[k]:tickets.filter(t=>t.status===k).length}),{});

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:12}}><div style={{width:40,height:40,borderRadius:'50%',border:'3px solid #0078d4',borderTopColor:'transparent',animation:'spin 1s linear infinite'}} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><span style={{color:'#64748b'}}>Chargement des tickets...</span></div>;

  return (
    <div style={{padding:24,background:'#f0f2f5',minHeight:'100%'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:'#1e293b',margin:0}}>Tickets & Incidents</h1>
          <p style={{color:'#64748b',fontSize:13,margin:'4px 0 0'}}>Gestion des interventions et incidents réseau · {tickets.length} tickets</p>
        </div>
        <button onClick={()=>setShowForm(true)} style={{padding:'9px 18px',borderRadius:8,border:'none',background:'#0078d4',color:'white',fontSize:13,fontWeight:600,cursor:'pointer'}}>+ Nouveau Ticket</button>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:10,marginBottom:20}}>
        {[{l:'Total',v:tickets.length,c:'#0078d4'},{l:'Critiques',v:counts.critical||0,c:'#dc2626'},{l:'En cours',v:counts.in_progress||0,c:'#f59e0b'},{l:'Ouverts',v:counts.open||0,c:'#7c3aed'},{l:'Résolus',v:counts.resolved||0,c:'#16a34a'}].map(s=>(
          <div key={s.l} style={{background:'white',borderRadius:10,padding:'14px 16px',border:'1px solid #e2e8f0',textAlign:'center',borderTop:`3px solid ${s.c}`}}>
            <div style={{fontSize:26,fontWeight:800,color:s.c}}>{s.v}</div>
            <div style={{fontSize:12,color:'#64748b',marginTop:2}}>{s.l}</div>
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
        <select value={filterPrio} onChange={e=>setFilterPrio(e.target.value)} style={{padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>
          <option value="tous">Toutes priorités</option>
          {Object.keys(PRIO).map(k=><option key={k} value={k}>{k}</option>)}
        </select>
        <span style={{fontSize:12,color:'#94a3b8',marginLeft:'auto'}}>{filtered.length} résultat(s)</span>
      </div>

      {/* Table */}
      <div style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'#f8fafc',borderBottom:'2px solid #e2e8f0'}}>
              {['Code','Titre','Type','Site','Technicien','Priorité','Statut','Date','Actions'].map(h=>(
                <th key={h} style={{padding:'11px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:'#374151',textTransform:'uppercase',letterSpacing:'0.5px',whiteSpace:'nowrap'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => {
              const st = STATUS[t.status] || STATUS.open;
              const pr = PRIO[t.priority] || PRIO.normale;
              return (
                <tr key={t.id} style={{borderBottom:'1px solid #f8fafc',cursor:'pointer',transition:'background .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
                  onMouseLeave={e=>e.currentTarget.style.background='white'}>
                  <td style={{padding:'11px 14px'}}><span style={{fontWeight:700,color:'#0078d4',fontSize:13}}>{t.code}</span></td>
                  <td style={{padding:'11px 14px',maxWidth:200}}>
                    <div style={{fontSize:13,fontWeight:600,color:'#1e293b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.title}</div>
                    <div style={{fontSize:11,color:'#94a3b8',marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.description}</div>
                  </td>
                  <td style={{padding:'11px 14px'}}><span style={{padding:'2px 8px',borderRadius:10,fontSize:11,fontWeight:600,background:'#f1f5f9',color:'#374151'}}>{t.type}</span></td>
                  <td style={{padding:'11px 14px',fontSize:12,fontWeight:600,color:'#0078d4'}}>{t.site||'—'}</td>
                  <td style={{padding:'11px 14px',fontSize:12,color:'#374151'}}>{t.technicien||<span style={{color:'#cbd5e1'}}>Non assigné</span>}</td>
                  <td style={{padding:'11px 14px'}}><span style={{padding:'3px 9px',borderRadius:10,fontSize:11,fontWeight:600,background:pr.bg,color:pr.color}}>{t.priority}</span></td>
                  <td style={{padding:'11px 14px'}}>
                    <select value={t.status} onChange={e=>changeStatus(t.id,e.target.value)} onClick={e=>e.stopPropagation()}
                      style={{padding:'3px 8px',borderRadius:8,border:`1px solid ${st.color}`,background:st.bg,color:st.color,fontSize:11,fontWeight:600,cursor:'pointer',outline:'none'}}>
                      {Object.entries(STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </td>
                  <td style={{padding:'11px 14px',fontSize:11,color:'#94a3b8',whiteSpace:'nowrap'}}>{fmt(t.createdAt)}</td>
                  <td style={{padding:'11px 14px'}}>
                    <button onClick={()=>setSelected(t)} style={{padding:'4px 12px',borderRadius:6,border:'1px solid #0078d4',background:'white',color:'#0078d4',fontSize:11,cursor:'pointer',fontWeight:600}}>Voir</button>
                  </td>
                </tr>
              );
            })}
            {filtered.length===0 && <tr><td colSpan={9} style={{padding:48,textAlign:'center',color:'#94a3b8'}}>Aucun ticket trouvé</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Modal Détail */}
      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'white',borderRadius:14,width:'100%',maxWidth:560,maxHeight:'85vh',overflow:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
            <div style={{padding:'16px 20px',background:'linear-gradient(135deg,#1e3a5f,#0078d4)',color:'white',display:'flex',justifyContent:'space-between',alignItems:'center',borderRadius:'14px 14px 0 0',position:'sticky',top:0}}>
              <div><div style={{fontSize:16,fontWeight:800}}>{selected.code}</div><div style={{fontSize:12,opacity:0.8,marginTop:2}}>{selected.title}</div></div>
              <button onClick={()=>setSelected(null)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:28,height:28,borderRadius:'50%',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
            <div style={{padding:24}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16}}>
                {[{l:'Code',v:selected.code},{l:'Type',v:selected.type},{l:'Site',v:selected.site||'—'},{l:'Technicien',v:selected.technicien||'Non assigné'},{l:'Priorité',v:selected.priority},{l:'Statut',v:STATUS[selected.status]?.label||selected.status},{l:'Créé le',v:fmt(selected.createdAt)}].map(i=>(
                  <div key={i.l} style={{background:'#f8fafc',borderRadius:8,padding:'10px 14px'}}>
                    <div style={{fontSize:11,color:'#94a3b8',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px'}}>{i.l}</div>
                    <div style={{fontSize:14,fontWeight:600,color:'#1e293b',marginTop:3}}>{i.v}</div>
                  </div>
                ))}
              </div>
              <div style={{background:'#f8fafc',borderRadius:8,padding:'12px 14px',marginBottom:16}}>
                <div style={{fontSize:11,color:'#94a3b8',fontWeight:600,marginBottom:6}}>DESCRIPTION</div>
                <div style={{fontSize:13,color:'#374151',lineHeight:1.6}}>{selected.description||'Aucune description'}</div>
              </div>
              <div style={{display:'flex',gap:10}}>
                {selected.status !== 'in_progress' && <button onClick={()=>{changeStatus(selected.id,'in_progress');setSelected(p=>({...p,status:'in_progress'}));}} style={{flex:1,padding:10,borderRadius:8,border:'none',background:'#0078d4',color:'white',cursor:'pointer',fontSize:13,fontWeight:600}}>▶ Prendre en charge</button>}
                {selected.status !== 'resolved' && <button onClick={()=>{changeStatus(selected.id,'resolved');setSelected(p=>({...p,status:'resolved'}));}} style={{flex:1,padding:10,borderRadius:8,border:'none',background:'#16a34a',color:'white',cursor:'pointer',fontSize:13,fontWeight:600}}>✓ Résoudre</button>}
                <button onClick={()=>setSelected(null)} style={{padding:'10px 20px',borderRadius:8,border:'1px solid #e2e8f0',background:'white',cursor:'pointer',fontSize:13,color:'#374151'}}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Création */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'white',borderRadius:14,width:'100%',maxWidth:520,overflow:'hidden',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
            <div style={{padding:'16px 20px',background:'linear-gradient(135deg,#1e3a5f,#0078d4)',color:'white',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:16,fontWeight:800}}>+ Nouveau Ticket</div>
              <button onClick={()=>setShowForm(false)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:28,height:28,borderRadius:'50%',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
            <div style={{padding:24,display:'flex',flexDirection:'column',gap:14}}>
              <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>TITRE *</label><input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Ex: Panne antenne secteur Nord" style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} /></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>TYPE</label>
                  <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>
                    {['incident','maintenance','installation','swap','survey','demantelement'].map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>PRIORITÉ</label>
                  <select value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>
                    {Object.keys(PRIO).map(k=><option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>CODE SITE</label><input value={form.site} onChange={e=>setForm(p=>({...p,site:e.target.value}))} placeholder="DLA-001" style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} /></div>
                <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>TECHNICIEN</label><input value={form.technicien} onChange={e=>setForm(p=>({...p,technicien:e.target.value}))} placeholder="Nom du technicien" style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} /></div>
              </div>
              <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>DESCRIPTION</label><textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Décrivez l'incident ou la tâche..." rows={3} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box',resize:'vertical'}} /></div>
              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>setShowForm(false)} style={{flex:1,padding:11,borderRadius:8,border:'1px solid #e2e8f0',background:'white',cursor:'pointer',fontSize:13,color:'#374151'}}>Annuler</button>
                <button onClick={save} disabled={!form.title||saving} style={{flex:2,padding:11,borderRadius:8,border:'none',background:form.title?'#0078d4':'#e2e8f0',color:form.title?'white':'#94a3b8',cursor:form.title?'pointer':'not-allowed',fontSize:13,fontWeight:700}}>{saving?'Création...':'✓ Créer le ticket'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
