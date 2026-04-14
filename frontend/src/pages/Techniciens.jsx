import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const STATUTS = {
  disponible:   { label:'Disponible',   color:'#16a34a', bg:'#f0fdf4', dot:'#16a34a' },
  en_mission:   { label:'En mission',   color:'#0078d4', bg:'#eff6ff', dot:'#0078d4' },
  en_conge:     { label:'En congé',     color:'#f59e0b', bg:'#fefce8', dot:'#f59e0b' },
  indisponible: { label:'Indisponible', color:'#dc2626', bg:'#fef2f2', dot:'#dc2626' },
};

const SEED = [
  { id:1, firstName:'Thomas', lastName:'Ngono', email:'thomas@cleanit.cm', phone:'+237 677 001 001', region:'Littoral', ville:'Douala', status:'en_mission', skills:['5G NR','4G LTE','Installation'], certifications:['HCNP-5G','HCIP-Carrier'], missionsTotal:47, rating:4.8, latitude:4.0511, longitude:9.7085 },
  { id:2, firstName:'Jean', lastName:'Mbarga', email:'jean@cleanit.cm', phone:'+237 677 001 002', region:'Centre', ville:'Yaoundé', status:'disponible', skills:['5G NR','Survey','Démantèlement'], certifications:['HCNA-5G'], missionsTotal:32, rating:4.5, latitude:3.8480, longitude:11.5021 },
  { id:3, firstName:'Samuel', lastName:'Djomo', email:'samuel@cleanit.cm', phone:'+237 677 001 003', region:'Ouest', ville:'Bafoussam', status:'disponible', skills:['4G LTE','Maintenance','Swap'], certifications:['HCNP-4G'], missionsTotal:28, rating:4.6, latitude:5.4764, longitude:10.4214 },
  { id:4, firstName:'Ali', lastName:'Moussa', email:'ali@cleanit.cm', phone:'+237 677 001 004', region:'Nord', ville:'Garoua', status:'en_mission', skills:['3G','4G LTE','Survey'], certifications:['HCNA-3G'], missionsTotal:19, rating:4.2, latitude:9.3019, longitude:13.3920 },
  { id:5, firstName:'Pierre', lastName:'Etoga', email:'pierre@cleanit.cm', phone:'+237 677 001 005', region:'Littoral', ville:'Douala', status:'disponible', skills:['5G NR','4G LTE','Fibre'], certifications:['HCIP-5G','HCNP-4G'], missionsTotal:55, rating:4.9, latitude:4.0469, longitude:9.6952 },
  { id:6, firstName:'Alain', lastName:'Biya', email:'alain@cleanit.cm', phone:'+237 677 001 006', region:'Centre', ville:'Yaoundé', status:'en_conge', skills:['4G LTE','Maintenance'], certifications:['HCNA-4G'], missionsTotal:15, rating:4.0, latitude:3.8833, longitude:11.5167 },
  { id:7, firstName:'Martin', lastName:'Kameni', email:'martin@cleanit.cm', phone:'+237 677 001 007', region:'Sud-Ouest', ville:'Limbé', status:'disponible', skills:['3G','4G LTE','Swap'], certifications:['HCNA-3G'], missionsTotal:22, rating:4.3, latitude:4.0167, longitude:9.2000 },
  { id:8, firstName:'David', lastName:'Fon', email:'david@cleanit.cm', phone:'+237 677 001 008', region:'Nord-Ouest', ville:'Bamenda', status:'disponible', skills:['4G LTE','Survey','Installation'], certifications:['HCNP-4G'], missionsTotal:38, rating:4.7, latitude:5.9597, longitude:10.1458 },
];

export default function Techniciens() {
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [filterRegion, setFilterRegion] = useState('tous');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState('cards');
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phone:'', region:'', ville:'', skills:'', certifications:'', status:'disponible' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/technicians');
      const data = Array.isArray(r.data) ? r.data : [];
      setTechs(data.length > 0 ? data : SEED);
    } catch { setTechs(SEED); }
    finally { setLoading(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/technicians', { ...form, skills: form.skills.split(',').map(s=>s.trim()), certifications: form.certifications.split(',').map(s=>s.trim()) });
      setShowForm(false); load();
    } catch {
      setTechs(p => [...p, { ...form, id: Date.now(), skills: form.skills.split(',').map(s=>s.trim()), certifications: form.certifications.split(',').map(s=>s.trim()), missionsTotal:0, rating:0 }]);
      setShowForm(false);
    } finally { setSaving(false); }
  };

  const changeStatus = async (id, status) => {
    try { await api.put(`/technicians/${id}`, { status }); }
    catch { setTechs(p => p.map(t => t.id===id ? {...t,status} : t)); return; }
    load();
  };

  const regions = [...new Set(techs.map(t=>t.region).filter(Boolean))];
  const filtered = techs.filter(t => {
    const ms = filterStatus==='tous' || t.status===filterStatus;
    const mr = filterRegion==='tous' || t.region===filterRegion;
    const mq = !search || `${t.firstName} ${t.lastName}`.toLowerCase().includes(search.toLowerCase()) || t.region?.toLowerCase().includes(search.toLowerCase());
    return ms && mr && mq;
  });

  const stars = n => '★'.repeat(Math.round(n||0)) + '☆'.repeat(5-Math.round(n||0));

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:12}}><div style={{width:40,height:40,borderRadius:'50%',border:'3px solid #16a34a',borderTopColor:'transparent',animation:'spin 1s linear infinite'}} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><span style={{color:'#64748b'}}>Chargement des techniciens...</span></div>;

  return (
    <div style={{padding:24,background:'#f0f2f5',minHeight:'100%'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:'#1e293b',margin:0}}>Techniciens Terrain</h1>
          <p style={{color:'#64748b',fontSize:13,margin:'4px 0 0'}}>Gestion des équipes terrain · {techs.length} techniciens</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          {['cards','table'].map(v=><button key={v} onClick={()=>setView(v)} style={{padding:'7px 14px',borderRadius:6,border:'none',background:view===v?'#0078d4':'#f1f5f9',color:view===v?'white':'#64748b',fontSize:12,cursor:'pointer',fontWeight:view===v?600:400}}>{v==='cards'?'⊞ Cartes':'☰ Liste'}</button>)}
          <button onClick={()=>setShowForm(true)} style={{padding:'9px 16px',borderRadius:8,border:'none',background:'#16a34a',color:'white',fontSize:13,fontWeight:600,cursor:'pointer'}}>+ Nouveau Technicien</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:10,marginBottom:20}}>
        {[{l:'Total',v:techs.length,c:'#0078d4'},{l:'Disponibles',v:techs.filter(t=>t.status==='disponible').length,c:'#16a34a'},{l:'En mission',v:techs.filter(t=>t.status==='en_mission').length,c:'#0078d4'},{l:'En congé',v:techs.filter(t=>t.status==='en_conge').length,c:'#f59e0b'},{l:'Indisponibles',v:techs.filter(t=>t.status==='indisponible').length,c:'#dc2626'}].map(s=>(
          <div key={s.l} style={{background:'white',borderRadius:10,padding:'14px 16px',border:'1px solid #e2e8f0',textAlign:'center',borderTop:`3px solid ${s.c}`}}>
            <div style={{fontSize:24,fontWeight:800,color:s.c}}>{s.v}</div>
            <div style={{fontSize:12,color:'#64748b',marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{background:'white',borderRadius:10,padding:'12px 16px',border:'1px solid #e2e8f0',marginBottom:16,display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{position:'relative',flex:1,minWidth:200}}>
          <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#94a3b8'}}>🔍</span>
          <input placeholder="Rechercher par nom, région..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:'100%',padding:'8px 12px 8px 32px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} />
        </div>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>
          <option value="tous">Tous les statuts</option>
          {Object.entries(STATUTS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterRegion} onChange={e=>setFilterRegion(e.target.value)} style={{padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>
          <option value="tous">Toutes les régions</option>
          {regions.map(r=><option key={r} value={r}>{r}</option>)}
        </select>
        <span style={{fontSize:12,color:'#94a3b8',marginLeft:'auto'}}>{filtered.length} technicien(s)</span>
      </div>

      {/* Cards View */}
      {view==='cards' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
          {filtered.map(t => {
            const st = STATUTS[t.status] || STATUTS.disponible;
            return (
              <div key={t.id} onClick={()=>setSelected(t)}
                style={{background:'white',borderRadius:12,border:'1px solid #e2e8f0',overflow:'hidden',cursor:'pointer',transition:'all .2s'}}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)';e.currentTarget.style.transform='translateY(-2px)';}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='none';}}>
                <div style={{height:4,background:st.color}} />
                <div style={{padding:'16px 18px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                    <div style={{width:48,height:48,borderRadius:'50%',background:`linear-gradient(135deg,${st.color},${st.color}aa)`,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:18,flexShrink:0}}>
                      {t.firstName?.[0]}{t.lastName?.[0]}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15,fontWeight:700,color:'#1e293b'}}>{t.firstName} {t.lastName}</div>
                      <div style={{fontSize:11,color:'#64748b',marginTop:1}}>{t.ville}, {t.region}</div>
                    </div>
                    <span style={{padding:'3px 9px',borderRadius:10,fontSize:11,fontWeight:600,background:st.bg,color:st.color,border:`1px solid ${st.color}30`,whiteSpace:'nowrap'}}>{st.label}</span>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:5,marginBottom:12}}>
                    <div style={{fontSize:12,color:'#374151'}}>📞 {t.phone}</div>
                    <div style={{fontSize:12,color:'#374151'}}>✉ {t.email}</div>
                    <div style={{fontSize:12,color:'#f59e0b'}}>{'★'.repeat(Math.round(t.rating||0))} {t.rating?.toFixed(1)} · {t.missionsTotal} missions</div>
                  </div>
                  {t.skills?.length>0 && <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:10}}>
                    {(Array.isArray(t.skills)?t.skills:t.skills?.split(',').map(s=>s.trim())||[]).map(s=><span key={s} style={{padding:'2px 8px',borderRadius:10,fontSize:10,fontWeight:600,background:'#eff6ff',color:'#2563eb'}}>{s}</span>)}
                  </div>}
                  {t.certifications?.length>0 && <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:12}}>
                    {(Array.isArray(t.certifications)?t.certifications:t.certifications?.split(',').map(s=>s.trim())||[]).map(c=><span key={c} style={{padding:'2px 8px',borderRadius:10,fontSize:10,fontWeight:600,background:'#f5f3ff',color:'#7c3aed'}}>🏆 {c}</span>)}
                  </div>}
                  <div style={{display:'flex',gap:6}}>
                    {t.status!=='disponible' && <button onClick={e=>{e.stopPropagation();changeStatus(t.id,'disponible');}} style={{flex:1,padding:'6px',borderRadius:6,border:'1px solid #16a34a',background:'white',color:'#16a34a',fontSize:11,cursor:'pointer',fontWeight:600}}>✓ Disponible</button>}
                    {t.status!=='en_mission' && <button onClick={e=>{e.stopPropagation();changeStatus(t.id,'en_mission');}} style={{flex:1,padding:'6px',borderRadius:6,border:'1px solid #0078d4',background:'white',color:'#0078d4',fontSize:11,cursor:'pointer',fontWeight:600}}>→ En mission</button>}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length===0 && <div style={{gridColumn:'1/-1',padding:48,textAlign:'center',color:'#94a3b8',background:'white',borderRadius:10,border:'1px solid #e2e8f0'}}>Aucun technicien trouvé</div>}
        </div>
      )}

      {/* Table View */}
      {view==='table' && (
        <div style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'#f8fafc',borderBottom:'2px solid #e2e8f0'}}>{['Nom','Contact','Région','Statut','Compétences','Missions','Note','Actions'].map(h=><th key={h} style={{padding:'11px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:'#374151',textTransform:'uppercase',letterSpacing:'0.5px'}}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(t=>{
                const st=STATUTS[t.status]||STATUTS.disponible;
                return (
                  <tr key={t.id} style={{borderBottom:'1px solid #f8fafc',cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background='white'}>
                    <td style={{padding:'11px 14px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:36,height:36,borderRadius:'50%',background:st.color,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:13,flexShrink:0}}>{t.firstName?.[0]}{t.lastName?.[0]}</div>
                        <div><div style={{fontSize:13,fontWeight:600,color:'#1e293b'}}>{t.firstName} {t.lastName}</div><div style={{fontSize:11,color:'#94a3b8'}}>{t.email}</div></div>
                      </div>
                    </td>
                    <td style={{padding:'11px 14px',fontSize:12,color:'#374151'}}>{t.phone}</td>
                    <td style={{padding:'11px 14px',fontSize:12,color:'#374151'}}>{t.ville}, {t.region}</td>
                    <td style={{padding:'11px 14px'}}><span style={{padding:'3px 9px',borderRadius:10,fontSize:11,fontWeight:600,background:st.bg,color:st.color}}>{st.label}</span></td>
                    <td style={{padding:'11px 14px'}}><div style={{display:'flex',flexWrap:'wrap',gap:4}}>{(Array.isArray(t.skills)?t.skills:[]).slice(0,2).map(s=><span key={s} style={{padding:'1px 7px',borderRadius:8,fontSize:10,background:'#eff6ff',color:'#2563eb'}}>{s}</span>)}</div></td>
                    <td style={{padding:'11px 14px',fontSize:12,fontWeight:600,color:'#374151'}}>{t.missionsTotal||0}</td>
                    <td style={{padding:'11px 14px',fontSize:12,color:'#f59e0b'}}>{t.rating?.toFixed(1)||'—'}</td>
                    <td style={{padding:'11px 14px'}}><button onClick={()=>setSelected(t)} style={{padding:'4px 12px',borderRadius:6,border:'1px solid #0078d4',background:'white',color:'#0078d4',fontSize:11,cursor:'pointer',fontWeight:600}}>Voir</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detail */}
      {selected && !showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'white',borderRadius:14,width:'100%',maxWidth:520,maxHeight:'85vh',overflow:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
            <div style={{padding:'16px 20px',background:`linear-gradient(135deg,#1e3a5f,${STATUTS[selected.status]?.color||'#0078d4'})`,color:'white',display:'flex',justifyContent:'space-between',alignItems:'center',borderRadius:'14px 14px 0 0',position:'sticky',top:0}}>
              <div>
                <div style={{fontSize:17,fontWeight:800}}>{selected.firstName} {selected.lastName}</div>
                <div style={{fontSize:12,opacity:0.8,marginTop:2}}>{selected.ville}, {selected.region}</div>
              </div>
              <button onClick={()=>setSelected(null)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:28,height:28,borderRadius:'50%',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
            <div style={{padding:24}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                {[{l:'Email',v:selected.email},{l:'Téléphone',v:selected.phone},{l:'Région',v:selected.region},{l:'Ville',v:selected.ville},{l:'Statut',v:STATUTS[selected.status]?.label||selected.status},{l:'Missions totales',v:selected.missionsTotal||0},{l:'Note',v:`${selected.rating?.toFixed(1)||'—'} / 5.0`}].map(i=>(
                  <div key={i.l} style={{background:'#f8fafc',borderRadius:8,padding:'10px 14px'}}>
                    <div style={{fontSize:10,color:'#94a3b8',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px'}}>{i.l}</div>
                    <div style={{fontSize:13,fontWeight:600,color:'#1e293b',marginTop:3}}>{i.v}</div>
                  </div>
                ))}
              </div>
              {selected.skills?.length>0 && <div style={{marginBottom:12}}>
                <div style={{fontSize:11,color:'#94a3b8',fontWeight:700,marginBottom:6}}>COMPÉTENCES</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:5}}>{(Array.isArray(selected.skills)?selected.skills:selected.skills?.split(',')||[]).map(s=><span key={s} style={{padding:'3px 10px',borderRadius:10,fontSize:12,fontWeight:600,background:'#eff6ff',color:'#2563eb'}}>{s.trim()}</span>)}</div>
              </div>}
              {selected.certifications?.length>0 && <div style={{marginBottom:16}}>
                <div style={{fontSize:11,color:'#94a3b8',fontWeight:700,marginBottom:6}}>CERTIFICATIONS HUAWEI</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:5}}>{(Array.isArray(selected.certifications)?selected.certifications:selected.certifications?.split(',')||[]).map(c=><span key={c} style={{padding:'3px 10px',borderRadius:10,fontSize:12,fontWeight:600,background:'#f5f3ff',color:'#7c3aed'}}>🏆 {c.trim()}</span>)}</div>
              </div>}
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {Object.entries(STATUTS).map(([k,v])=>(
                  <button key={k} onClick={()=>{changeStatus(selected.id,k);setSelected(p=>({...p,status:k}));}}
                    style={{flex:1,minWidth:120,padding:10,borderRadius:8,border:`1px solid ${v.color}`,background:selected.status===k?v.color:'white',color:selected.status===k?'white':v.color,cursor:'pointer',fontSize:12,fontWeight:600}}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'white',borderRadius:14,width:'100%',maxWidth:520,overflow:'hidden',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
            <div style={{padding:'16px 20px',background:'linear-gradient(135deg,#1e3a5f,#16a34a)',color:'white',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:16,fontWeight:800}}>+ Nouveau Technicien</div>
              <button onClick={()=>setShowForm(false)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:28,height:28,borderRadius:'50%',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
            <div style={{padding:24,display:'flex',flexDirection:'column',gap:12}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {[{l:'Prénom *',k:'firstName',ph:'Thomas'},{l:'Nom *',k:'lastName',ph:'Ngono'},{l:'Email *',k:'email',ph:'thomas@cleanit.cm'},{l:'Téléphone',k:'phone',ph:'+237 677 000 000'},{l:'Région',k:'region',ph:'Littoral'},{l:'Ville',k:'ville',ph:'Douala'}].map(f=>(
                  <div key={f.k}><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>{f.l}</label><input value={form[f.k]||''} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} /></div>
                ))}
              </div>
              {[{l:'Compétences (séparées par virgule)',k:'skills',ph:'5G NR, 4G LTE, Installation'},{l:'Certifications Huawei',k:'certifications',ph:'HCNP-5G, HCIP-Carrier'}].map(f=>(
                <div key={f.k}><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>{f.l}</label><input value={form[f.k]||''} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} /></div>
              ))}
              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>setShowForm(false)} style={{flex:1,padding:11,borderRadius:8,border:'1px solid #e2e8f0',background:'white',cursor:'pointer',fontSize:13,color:'#374151'}}>Annuler</button>
                <button onClick={save} disabled={!form.firstName||!form.lastName||saving} style={{flex:2,padding:11,borderRadius:8,border:'none',background:(form.firstName&&form.lastName)?'#16a34a':'#e2e8f0',color:(form.firstName&&form.lastName)?'white':'#94a3b8',cursor:(form.firstName&&form.lastName)?'pointer':'not-allowed',fontSize:13,fontWeight:700}}>{saving?'Création...':'✓ Ajouter le technicien'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
