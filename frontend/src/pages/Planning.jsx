import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const STATUS = {
  planifie:   { label:'Planifié',    color:'#7c3aed', bg:'#f5f3ff' },
  en_cours:   { label:'En cours',    color:'#0078d4', bg:'#eff6ff' },
  termine:    { label:'Terminé',     color:'#16a34a', bg:'#f0fdf4' },
  annule:     { label:'Annulé',      color:'#dc2626', bg:'#fef2f2' },
};

const SEED = [
  { id:1, title:'Installation 5G DLA-001', site:'DLA-001', technicien:'Thomas Ngono', type:'installation', status:'en_cours', priority:'haute', dateDebut:new Date(Date.now()-86400000).toISOString(), dateFin:new Date(Date.now()+172800000).toISOString(), budgetEstime:12500000, progression:45 },
  { id:2, title:'Survey MAR-001', site:'MAR-001', technicien:'Ali Moussa', type:'survey', status:'planifie', priority:'normale', dateDebut:new Date(Date.now()+259200000).toISOString(), dateFin:new Date(Date.now()+432000000).toISOString(), budgetEstime:2000000, progression:0 },
  { id:3, title:'Maintenance GAR-001', site:'GAR-001', technicien:'Samuel Djomo', type:'maintenance', status:'planifie', priority:'normale', dateDebut:new Date(Date.now()+518400000).toISOString(), dateFin:new Date(Date.now()+604800000).toISOString(), budgetEstime:3500000, progression:0 },
  { id:4, title:'Swap 4G→5G BFN-001', site:'BFN-001', technicien:'Pierre Etoga', type:'swap', status:'planifie', priority:'haute', dateDebut:new Date(Date.now()+864000000).toISOString(), dateFin:new Date(Date.now()+950400000).toISOString(), budgetEstime:9000000, progression:0 },
  { id:5, title:'Démantèlement 3G LIM-001', site:'LIM-001', technicien:'Jean Mbarga', type:'demantelement', status:'en_cours', priority:'normale', dateDebut:new Date(Date.now()-172800000).toISOString(), dateFin:new Date(Date.now()+86400000).toISOString(), budgetEstime:4500000, progression:75 },
];

export default function Planning() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('gantt');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title:'', site:'', technicien:'', type:'installation', priority:'haute', dateDebut:'', dateFin:'', budgetEstime:'', description:'' });
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('tous');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/planning');
      const data = Array.isArray(r.data) ? r.data : [];
      setItems(data.length > 0 ? data : SEED);
    } catch { setItems(SEED); }
    finally { setLoading(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/planning', { ...form, budgetEstime: Number(form.budgetEstime) });
      setShowForm(false); load();
    } catch {
      setItems(p => [...p, { ...form, id: Date.now(), status:'planifie', progression:0, budgetEstime:Number(form.budgetEstime) }]);
      setShowForm(false);
    } finally { setSaving(false); }
  };

  const fmt = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
  const fmtN = n => n ? new Intl.NumberFormat('fr-FR').format(n) : '—';

  const filtered = items.filter(i => filterStatus === 'tous' || i.status === filterStatus);

  // Calcul Gantt
  const allDates = items.flatMap(i => [new Date(i.dateDebut), new Date(i.dateFin)]).filter(d => !isNaN(d));
  const minDate = allDates.length ? new Date(Math.min(...allDates)) : new Date();
  const maxDate = allDates.length ? new Date(Math.max(...allDates)) : new Date(Date.now() + 30*86400000);
  const totalDays = Math.max(1, (maxDate - minDate) / 86400000);

  const getGanttPos = (start, end) => {
    const s = Math.max(0, (new Date(start) - minDate) / 86400000);
    const e = Math.min(totalDays, (new Date(end) - minDate) / 86400000);
    return { left: `${(s/totalDays)*100}%`, width: `${Math.max(1,((e-s)/totalDays)*100)}%` };
  };

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:12}}><div style={{width:40,height:40,borderRadius:'50%',border:'3px solid #7c3aed',borderTopColor:'transparent',animation:'spin 1s linear infinite'}} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><span style={{color:'#64748b'}}>Chargement planning...</span></div>;

  return (
    <div style={{padding:24,background:'#f0f2f5',minHeight:'100%'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:'#1e293b',margin:0}}>Planning & Gantt</h1>
          <p style={{color:'#64748b',fontSize:13,margin:'4px 0 0'}}>Planification des interventions · {items.length} tâches</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          {['gantt','liste'].map(v=><button key={v} onClick={()=>setView(v)} style={{padding:'7px 14px',borderRadius:6,border:'none',background:view===v?'#7c3aed':'#f1f5f9',color:view===v?'white':'#64748b',fontSize:12,cursor:'pointer',fontWeight:view===v?600:400}}>{v==='gantt'?'📊 Gantt':'☰ Liste'}</button>)}
          <button onClick={()=>setShowForm(true)} style={{padding:'9px 16px',borderRadius:8,border:'none',background:'#7c3aed',color:'white',fontSize:13,fontWeight:600,cursor:'pointer'}}>+ Planifier</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:10,marginBottom:20}}>
        {[{l:'Total',v:items.length,c:'#0078d4'},{l:'Planifiées',v:items.filter(i=>i.status==='planifie').length,c:'#7c3aed'},{l:'En cours',v:items.filter(i=>i.status==='en_cours').length,c:'#0078d4'},{l:'Terminées',v:items.filter(i=>i.status==='termine').length,c:'#16a34a'},{l:'Budget total',v:`${fmtN(items.reduce((s,i)=>s+(i.budgetEstime||0),0))} XAF`,c:'#ea580c'}].map(s=>(
          <div key={s.l} style={{background:'white',borderRadius:10,padding:'12px 14px',border:'1px solid #e2e8f0',textAlign:'center',borderTop:`3px solid ${s.c}`}}>
            <div style={{fontSize:s.l==='Budget total'?13:24,fontWeight:800,color:s.c}}>{s.v}</div>
            <div style={{fontSize:11,color:'#64748b',marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{background:'white',borderRadius:10,padding:'10px 14px',border:'1px solid #e2e8f0',marginBottom:16,display:'flex',gap:8,alignItems:'center'}}>
        <span style={{fontSize:13,color:'#64748b',fontWeight:600}}>Filtrer :</span>
        {[{v:'tous',l:'Tous'}, ...Object.entries(STATUS).map(([k,v])=>({v:k,l:v.label}))].map(f=>(
          <button key={f.v} onClick={()=>setFilterStatus(f.v)} style={{padding:'5px 12px',borderRadius:6,border:'none',background:filterStatus===f.v?'#7c3aed':'#f1f5f9',color:filterStatus===f.v?'white':'#64748b',fontSize:12,cursor:'pointer',fontWeight:filterStatus===f.v?600:400}}>{f.l}</button>
        ))}
        <span style={{marginLeft:'auto',fontSize:12,color:'#94a3b8'}}>{filtered.length} tâche(s)</span>
      </div>

      {/* GANTT VIEW */}
      {view==='gantt' && (
        <div style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',overflow:'hidden'}}>
          <div style={{padding:'14px 16px',borderBottom:'1px solid #f1f5f9',display:'flex',gap:16,fontSize:12,color:'#64748b',fontWeight:600}}>
            <span style={{width:200,flexShrink:0}}>TÂCHE</span>
            <span style={{width:100,flexShrink:0}}>TECHNICIEN</span>
            <span style={{flex:1}}>PLANNING · {fmt(minDate)} → {fmt(maxDate)}</span>
          </div>
          {filtered.map(item => {
            const st = STATUS[item.status] || STATUS.planifie;
            const pos = getGanttPos(item.dateDebut, item.dateFin);
            return (
              <div key={item.id} style={{display:'flex',alignItems:'center',gap:16,padding:'10px 16px',borderBottom:'1px solid #f8fafc',minHeight:52}}
                onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background='white'}>
                <div style={{width:200,flexShrink:0}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#1e293b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.title}</div>
                  <div style={{display:'flex',gap:4,marginTop:3}}>
                    <span style={{fontSize:10,padding:'1px 6px',borderRadius:8,background:st.bg,color:st.color,fontWeight:600}}>{st.label}</span>
                    <span style={{fontSize:10,color:'#94a3b8'}}>{item.site}</span>
                  </div>
                </div>
                <div style={{width:100,flexShrink:0,fontSize:11,color:'#64748b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.technicien||'—'}</div>
                <div style={{flex:1,position:'relative',height:32}}>
                  <div style={{position:'absolute',top:4,height:24,...pos,background:st.color,borderRadius:12,opacity:0.85,display:'flex',alignItems:'center',paddingLeft:8,minWidth:40}}>
                    <span style={{fontSize:10,color:'white',fontWeight:700,whiteSpace:'nowrap'}}>{item.progression||0}%</span>
                  </div>
                  {/* Progress overlay */}
                  <div style={{position:'absolute',top:4,height:24,left:pos.left,width:`calc(${item.progression||0}% * ${pos.width.replace('%','')}/100)`,background:'rgba(0,0,0,0.15)',borderRadius:'12px 0 0 12px'}} />
                  {/* Today line */}
                  <div style={{position:'absolute',top:0,bottom:0,left:`${((Date.now()-minDate)/86400000/totalDays)*100}%`,width:2,background:'#dc2626',opacity:0.6}} />
                </div>
                <div style={{width:80,flexShrink:0,fontSize:11,color:'#64748b'}}>{fmtN(item.budgetEstime)}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* LISTE VIEW */}
      {view==='liste' && (
        <div style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'#f8fafc',borderBottom:'2px solid #e2e8f0'}}>{['Titre','Site','Technicien','Type','Statut','Priorité','Début','Fin','Budget','Progression'].map(h=><th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:'#374151',textTransform:'uppercase',letterSpacing:'0.5px',whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(item=>{
                const st=STATUS[item.status]||STATUS.planifie;
                return (
                  <tr key={item.id} style={{borderBottom:'1px solid #f8fafc'}} onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background='white'}>
                    <td style={{padding:'10px 14px',fontSize:13,fontWeight:600,color:'#1e293b'}}>{item.title}</td>
                    <td style={{padding:'10px 14px',fontSize:12,fontWeight:600,color:'#0078d4'}}>{item.site}</td>
                    <td style={{padding:'10px 14px',fontSize:12,color:'#374151'}}>{item.technicien||'—'}</td>
                    <td style={{padding:'10px 14px'}}><span style={{padding:'2px 8px',borderRadius:8,fontSize:11,background:'#f1f5f9',color:'#374151'}}>{item.type}</span></td>
                    <td style={{padding:'10px 14px'}}><span style={{padding:'3px 9px',borderRadius:10,fontSize:11,fontWeight:600,background:st.bg,color:st.color}}>{st.label}</span></td>
                    <td style={{padding:'10px 14px',fontSize:12,color:item.priority==='critique'?'#dc2626':item.priority==='haute'?'#ea580c':'#16a34a',fontWeight:600}}>{item.priority}</td>
                    <td style={{padding:'10px 14px',fontSize:11,color:'#64748b'}}>{fmt(item.dateDebut)}</td>
                    <td style={{padding:'10px 14px',fontSize:11,color:'#64748b'}}>{fmt(item.dateFin)}</td>
                    <td style={{padding:'10px 14px',fontSize:12,color:'#374151'}}>{fmtN(item.budgetEstime)} XAF</td>
                    <td style={{padding:'10px 14px',minWidth:100}}>
                      <div style={{background:'#f1f5f9',borderRadius:4,height:6,overflow:'hidden',marginBottom:2}}><div style={{width:`${item.progression||0}%`,height:'100%',background:st.color,borderRadius:4}} /></div>
                      <div style={{fontSize:10,color:'#94a3b8',textAlign:'right'}}>{item.progression||0}%</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'white',borderRadius:14,width:'100%',maxWidth:520,maxHeight:'85vh',overflow:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
            <div style={{padding:'16px 20px',background:'linear-gradient(135deg,#4c1d95,#7c3aed)',color:'white',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0}}>
              <div style={{fontSize:16,fontWeight:800}}>+ Planifier une intervention</div>
              <button onClick={()=>setShowForm(false)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:28,height:28,borderRadius:'50%',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
            <div style={{padding:24,display:'flex',flexDirection:'column',gap:12}}>
              <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>TITRE *</label><input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Ex: Installation 5G DLA-001" style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} /></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {[{l:'SITE',k:'site',ph:'DLA-001'},{l:'TECHNICIEN',k:'technicien',ph:'Thomas Ngono'},{l:'BUDGET ESTIMÉ (XAF)',k:'budgetEstime',ph:'12500000'}].map(f=>(
                  <div key={f.k}><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>{f.l}</label><input value={form[f.k]||''} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} /></div>
                ))}
                <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>TYPE</label><select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>{['installation','maintenance','swap','survey','demantelement','urgence'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>PRIORITÉ</label><select value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>{['critique','haute','normale','basse'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>DATE DÉBUT</label><input type="date" value={form.dateDebut} onChange={e=>setForm(p=>({...p,dateDebut:e.target.value}))} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} /></div>
                <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>DATE FIN</label><input type="date" value={form.dateFin} onChange={e=>setForm(p=>({...p,dateFin:e.target.value}))} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} /></div>
              </div>
              <div style={{display:'flex',gap:10,marginTop:8}}>
                <button onClick={()=>setShowForm(false)} style={{flex:1,padding:11,borderRadius:8,border:'1px solid #e2e8f0',background:'white',cursor:'pointer',fontSize:13,color:'#374151'}}>Annuler</button>
                <button onClick={save} disabled={!form.title||saving} style={{flex:2,padding:11,borderRadius:8,border:'none',background:form.title?'#7c3aed':'#e2e8f0',color:form.title?'white':'#94a3b8',cursor:form.title?'pointer':'not-allowed',fontSize:13,fontWeight:700}}>{saving?'Création...':'✓ Planifier'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
