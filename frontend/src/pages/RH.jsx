import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const SEED = [
  { id:1, firstName:'Thomas', lastName:'Ngono', poste:'Ingénieur Senior 5G', departement:'Technique', statut:'actif', dateEmbauche:'2021-03-15', salaire:450000, conges:15, certifications:['HCNP-5G','HCIP-Carrier'], email:'thomas@cleanit.cm', phone:'+237 677 001 001', region:'Littoral', performance:92 },
  { id:2, firstName:'Marie', lastName:'Kamga', poste:'Project Manager', departement:'Management', statut:'actif', dateEmbauche:'2020-06-01', salaire:650000, conges:20, certifications:['PMP','PRINCE2'], email:'marie@cleanit.cm', phone:'+237 677 002 001', region:'Centre', performance:96 },
  { id:3, firstName:'Jean', lastName:'Mbarga', poste:'Technicien Réseau', departement:'Technique', statut:'actif', dateEmbauche:'2022-01-10', salaire:320000, conges:12, certifications:['HCNA-5G'], email:'jean@cleanit.cm', phone:'+237 677 001 002', region:'Centre', performance:85 },
  { id:4, firstName:'Samuel', lastName:'Djomo', poste:'Technicien Senior', departement:'Technique', statut:'actif', dateEmbauche:'2021-09-01', salaire:380000, conges:18, certifications:['HCNP-4G'], email:'samuel@cleanit.cm', phone:'+237 677 001 003', region:'Ouest', performance:88 },
  { id:5, firstName:'Alain', lastName:'Biya', poste:'Technicien Réseau', departement:'Technique', statut:'conge', dateEmbauche:'2023-02-15', salaire:280000, conges:5, certifications:['HCNA-4G'], email:'alain@cleanit.cm', phone:'+237 677 001 006', region:'Centre', performance:78 },
  { id:6, firstName:'Pierre', lastName:'Etoga', poste:'Ingénieur Fibre Optique', departement:'Technique', statut:'actif', dateEmbauche:'2020-11-01', salaire:420000, conges:22, certifications:['HCIP-5G','HCNP-4G'], email:'pierre@cleanit.cm', phone:'+237 677 001 005', region:'Littoral', performance:94 },
];

export default function RH() {
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('tous');
  const [activeTab, setActiveTab] = useState('employes');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ firstName:'', lastName:'', poste:'', departement:'Technique', email:'', phone:'', region:'', salaire:'', certifications:'' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/rh');
      const data = Array.isArray(r.data) ? r.data : [];
      setEmployes(data.length > 0 ? data : SEED);
    } catch { setEmployes(SEED); }
    finally { setLoading(false); }
  };

  const save = async () => {
    setSaving(true);
    try { await api.post('/rh', { ...form, salaire: Number(form.salaire) }); }
    catch { setEmployes(p => [...p, { ...form, id:Date.now(), statut:'actif', salaire:Number(form.salaire), certifications:form.certifications.split(',').map(s=>s.trim()), conges:15, performance:0, dateEmbauche:new Date().toISOString().slice(0,10) }]); }
    finally { setSaving(false); setShowForm(false); }
  };

  const depts = [...new Set(employes.map(e=>e.departement).filter(Boolean))];
  const filtered = employes.filter(e => {
    const md = filterDept==='tous' || e.departement===filterDept;
    const mq = !search || `${e.firstName} ${e.lastName} ${e.poste}`.toLowerCase().includes(search.toLowerCase());
    return md && mq;
  });

  const fmtN = n => n ? new Intl.NumberFormat('fr-FR').format(n) : '—';
  const totalSalaires = employes.filter(e=>e.statut==='actif').reduce((s,e)=>s+(e.salaire||0),0);

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:12}}><div style={{width:40,height:40,borderRadius:'50%',border:'3px solid #0078d4',borderTopColor:'transparent',animation:'spin 1s linear infinite'}} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><span style={{color:'#64748b'}}>Chargement RH...</span></div>;

  return (
    <div style={{padding:24,background:'#f0f2f5',minHeight:'100%'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:'#1e293b',margin:0}}>Ressources Humaines</h1>
          <p style={{color:'#64748b',fontSize:13,margin:'4px 0 0'}}>Gestion du personnel · {employes.length} employés · Masse salariale: {fmtN(totalSalaires)} XAF/mois</p>
        </div>
        <button onClick={()=>setShowForm(true)} style={{padding:'9px 16px',borderRadius:8,border:'none',background:'#0078d4',color:'white',fontSize:13,fontWeight:600,cursor:'pointer'}}>+ Nouvel Employé</button>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:10,marginBottom:20}}>
        {[{l:'Total',v:employes.length,c:'#0078d4'},{l:'Actifs',v:employes.filter(e=>e.statut==='actif').length,c:'#16a34a'},{l:'En congé',v:employes.filter(e=>e.statut==='conge').length,c:'#f59e0b'},{l:'Moy. performance',v:`${Math.round(employes.reduce((s,e)=>s+(e.performance||0),0)/employes.length)}%`,c:'#7c3aed'},{l:'Certifications',v:employes.reduce((s,e)=>s+(e.certifications?.length||0),0),c:'#ea580c'}].map(s=>(
          <div key={s.l} style={{background:'white',borderRadius:10,padding:'14px 16px',border:'1px solid #e2e8f0',textAlign:'center',borderTop:`3px solid ${s.c}`}}>
            <div style={{fontSize:22,fontWeight:800,color:s.c}}>{s.v}</div>
            <div style={{fontSize:11,color:'#64748b',marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:'flex',borderBottom:'2px solid #e2e8f0',marginBottom:16}}>
        {[{v:'employes',l:'Employés'},{v:'certifications',l:'Certifications'},{v:'conges',l:'Congés'}].map(t=>(
          <button key={t.v} onClick={()=>setActiveTab(t.v)} style={{padding:'10px 20px',border:'none',background:'transparent',cursor:'pointer',fontSize:13,fontWeight:activeTab===t.v?600:400,color:activeTab===t.v?'#0078d4':'#64748b',borderBottom:`2px solid ${activeTab===t.v?'#0078d4':'transparent'}`,marginBottom:-2}}>{t.l}</button>
        ))}
      </div>

      {/* Filter */}
      <div style={{background:'white',borderRadius:10,padding:'12px 16px',border:'1px solid #e2e8f0',marginBottom:16,display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{position:'relative',flex:1,minWidth:200}}>
          <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#94a3b8'}}>🔍</span>
          <input placeholder="Rechercher par nom, poste..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:'100%',padding:'8px 12px 8px 32px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} />
        </div>
        <select value={filterDept} onChange={e=>setFilterDept(e.target.value)} style={{padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>
          <option value="tous">Tous les départements</option>
          {depts.map(d=><option key={d} value={d}>{d}</option>)}
        </select>
        <span style={{fontSize:12,color:'#94a3b8',marginLeft:'auto'}}>{filtered.length} employé(s)</span>
      </div>

      {activeTab==='employes' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:14}}>
          {filtered.map(emp=>(
            <div key={emp.id} onClick={()=>setSelected(emp)}
              style={{background:'white',borderRadius:12,border:'1px solid #e2e8f0',overflow:'hidden',cursor:'pointer',transition:'all .2s'}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)';e.currentTarget.style.transform='translateY(-2px)';}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='none';}}>
              <div style={{height:4,background:emp.statut==='actif'?'#16a34a':'#f59e0b'}} />
              <div style={{padding:'16px 18px'}}>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                  <div style={{width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,#0078d4,#00bcf2)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:17,flexShrink:0}}>
                    {emp.firstName?.[0]}{emp.lastName?.[0]}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15,fontWeight:700,color:'#1e293b'}}>{emp.firstName} {emp.lastName}</div>
                    <div style={{fontSize:12,color:'#64748b',marginTop:1}}>{emp.poste}</div>
                  </div>
                  <span style={{padding:'3px 9px',borderRadius:10,fontSize:11,fontWeight:600,background:emp.statut==='actif'?'#f0fdf4':'#fefce8',color:emp.statut==='actif'?'#16a34a':'#f59e0b'}}>{emp.statut==='actif'?'Actif':'En congé'}</span>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:4,marginBottom:12}}>
                  <div style={{fontSize:12,color:'#374151'}}>📧 {emp.email}</div>
                  <div style={{fontSize:12,color:'#374151'}}>📞 {emp.phone}</div>
                  <div style={{fontSize:12,color:'#374151'}}>📍 {emp.region}</div>
                  <div style={{fontSize:12,color:'#16a34a',fontWeight:600}}>💰 {fmtN(emp.salaire)} XAF/mois</div>
                </div>
                {emp.certifications?.length>0 && <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:10}}>
                  {emp.certifications.map(c=><span key={c} style={{padding:'2px 7px',borderRadius:8,fontSize:10,fontWeight:600,background:'#f5f3ff',color:'#7c3aed'}}>🏆 {c}</span>)}
                </div>}
                <div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#64748b',marginBottom:4}}><span>Performance</span><span style={{fontWeight:700,color:'#0078d4'}}>{emp.performance||0}%</span></div>
                  <div style={{background:'#f1f5f9',borderRadius:4,height:5,overflow:'hidden'}}><div style={{width:`${emp.performance||0}%`,height:'100%',background:emp.performance>=90?'#16a34a':emp.performance>=70?'#0078d4':'#f59e0b',borderRadius:4}} /></div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length===0 && <div style={{gridColumn:'1/-1',padding:48,textAlign:'center',color:'#94a3b8',background:'white',borderRadius:10,border:'1px solid #e2e8f0'}}>Aucun employé trouvé</div>}
        </div>
      )}

      {activeTab==='certifications' && (
        <div style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'#f8fafc',borderBottom:'2px solid #e2e8f0'}}>{['Employé','Poste','Certifications Huawei','Nombre'].map(h=><th key={h} style={{padding:'11px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:'#374151',textTransform:'uppercase',letterSpacing:'0.5px'}}>{h}</th>)}</tr></thead>
            <tbody>
              {employes.filter(e=>e.certifications?.length>0).map(emp=>(
                <tr key={emp.id} style={{borderBottom:'1px solid #f8fafc'}} onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background='white'}>
                  <td style={{padding:'11px 14px'}}><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:32,height:32,borderRadius:'50%',background:'#0078d4',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:12}}>{emp.firstName?.[0]}{emp.lastName?.[0]}</div><span style={{fontSize:13,fontWeight:600,color:'#1e293b'}}>{emp.firstName} {emp.lastName}</span></div></td>
                  <td style={{padding:'11px 14px',fontSize:12,color:'#64748b'}}>{emp.poste}</td>
                  <td style={{padding:'11px 14px'}}><div style={{display:'flex',flexWrap:'wrap',gap:4}}>{emp.certifications?.map(c=><span key={c} style={{padding:'3px 10px',borderRadius:8,fontSize:11,fontWeight:600,background:'#f5f3ff',color:'#7c3aed'}}>🏆 {c}</span>)}</div></td>
                  <td style={{padding:'11px 14px',fontSize:14,fontWeight:700,color:'#7c3aed'}}>{emp.certifications?.length||0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab==='conges' && (
        <div style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'#f8fafc',borderBottom:'2px solid #e2e8f0'}}>{['Employé','Département','Congés restants','Statut','Embauche'].map(h=><th key={h} style={{padding:'11px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:'#374151',textTransform:'uppercase',letterSpacing:'0.5px'}}>{h}</th>)}</tr></thead>
            <tbody>
              {employes.map(emp=>(
                <tr key={emp.id} style={{borderBottom:'1px solid #f8fafc'}} onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background='white'}>
                  <td style={{padding:'11px 14px'}}><div style={{fontSize:13,fontWeight:600,color:'#1e293b'}}>{emp.firstName} {emp.lastName}</div></td>
                  <td style={{padding:'11px 14px',fontSize:12,color:'#64748b'}}>{emp.departement}</td>
                  <td style={{padding:'11px 14px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{background:'#f1f5f9',borderRadius:4,height:8,overflow:'hidden',width:80}}><div style={{width:`${((emp.conges||0)/30)*100}%`,height:'100%',background:emp.conges>10?'#16a34a':emp.conges>5?'#f59e0b':'#dc2626',borderRadius:4}} /></div>
                      <span style={{fontSize:13,fontWeight:700,color:'#1e293b'}}>{emp.conges||0} jours</span>
                    </div>
                  </td>
                  <td style={{padding:'11px 14px'}}><span style={{padding:'3px 9px',borderRadius:10,fontSize:11,fontWeight:600,background:emp.statut==='actif'?'#f0fdf4':'#fefce8',color:emp.statut==='actif'?'#16a34a':'#f59e0b'}}>{emp.statut==='actif'?'Actif':'En congé'}</span></td>
                  <td style={{padding:'11px 14px',fontSize:12,color:'#64748b'}}>{emp.dateEmbauche ? new Date(emp.dateEmbauche).toLocaleDateString('fr-FR') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Détail */}
      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'white',borderRadius:14,width:'100%',maxWidth:500,overflow:'hidden',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
            <div style={{padding:'16px 20px',background:'linear-gradient(135deg,#1e3a5f,#0078d4)',color:'white',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><div style={{fontSize:17,fontWeight:800}}>{selected.firstName} {selected.lastName}</div><div style={{fontSize:12,opacity:0.8}}>{selected.poste}</div></div>
              <button onClick={()=>setSelected(null)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:28,height:28,borderRadius:'50%',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
            <div style={{padding:24}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                {[{l:'Email',v:selected.email},{l:'Téléphone',v:selected.phone},{l:'Région',v:selected.region},{l:'Département',v:selected.departement},{l:'Salaire',v:`${fmtN(selected.salaire)} XAF/mois`},{l:'Congés restants',v:`${selected.conges||0} jours`},{l:'Performance',v:`${selected.performance||0}%`},{l:'Embauche',v:selected.dateEmbauche?new Date(selected.dateEmbauche).toLocaleDateString('fr-FR'):'—'}].map(i=>(
                  <div key={i.l} style={{background:'#f8fafc',borderRadius:8,padding:'10px 14px'}}>
                    <div style={{fontSize:10,color:'#94a3b8',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px'}}>{i.l}</div>
                    <div style={{fontSize:13,fontWeight:600,color:'#1e293b',marginTop:3}}>{i.v}</div>
                  </div>
                ))}
              </div>
              {selected.certifications?.length>0 && <div style={{marginBottom:16}}><div style={{fontSize:11,color:'#94a3b8',fontWeight:700,marginBottom:6}}>CERTIFICATIONS</div><div style={{display:'flex',flexWrap:'wrap',gap:5}}>{selected.certifications.map(c=><span key={c} style={{padding:'3px 10px',borderRadius:8,fontSize:12,fontWeight:600,background:'#f5f3ff',color:'#7c3aed'}}>🏆 {c}</span>)}</div></div>}
              <button onClick={()=>setSelected(null)} style={{width:'100%',padding:11,borderRadius:8,border:'1px solid #e2e8f0',background:'white',cursor:'pointer',fontSize:13,fontWeight:600,color:'#374151'}}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'white',borderRadius:14,width:'100%',maxWidth:520,maxHeight:'85vh',overflow:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
            <div style={{padding:'16px 20px',background:'linear-gradient(135deg,#1e3a5f,#0078d4)',color:'white',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0}}>
              <div style={{fontSize:16,fontWeight:800}}>+ Nouvel Employé</div>
              <button onClick={()=>setShowForm(false)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:28,height:28,borderRadius:'50%',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
            <div style={{padding:24,display:'flex',flexDirection:'column',gap:12}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {[{l:'PRÉNOM *',k:'firstName',ph:'Thomas'},{l:'NOM *',k:'lastName',ph:'Ngono'},{l:'EMAIL',k:'email',ph:'thomas@cleanit.cm'},{l:'TÉLÉPHONE',k:'phone',ph:'+237 677 000 000'},{l:'POSTE *',k:'poste',ph:'Ingénieur Senior 5G'},{l:'SALAIRE (XAF/mois)',k:'salaire',ph:'350000'},{l:'RÉGION',k:'region',ph:'Littoral'}].map(f=>(
                  <div key={f.k}><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>{f.l}</label><input value={form[f.k]||''} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} /></div>
                ))}
                <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>DÉPARTEMENT</label><select value={form.departement} onChange={e=>setForm(p=>({...p,departement:e.target.value}))} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>{['Technique','Management','Administration','Logistique','Finance'].map(d=><option key={d} value={d}>{d}</option>)}</select></div>
              </div>
              <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>CERTIFICATIONS (séparées par virgule)</label><input value={form.certifications||''} onChange={e=>setForm(p=>({...p,certifications:e.target.value}))} placeholder="HCNP-5G, HCIP-Carrier" style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} /></div>
              <div style={{display:'flex',gap:10,marginTop:8}}>
                <button onClick={()=>setShowForm(false)} style={{flex:1,padding:11,borderRadius:8,border:'1px solid #e2e8f0',background:'white',cursor:'pointer',fontSize:13,color:'#374151'}}>Annuler</button>
                <button onClick={save} disabled={!form.firstName||!form.lastName||saving} style={{flex:2,padding:11,borderRadius:8,border:'none',background:(form.firstName&&form.lastName)?'#0078d4':'#e2e8f0',color:(form.firstName&&form.lastName)?'white':'#94a3b8',cursor:(form.firstName&&form.lastName)?'pointer':'not-allowed',fontSize:13,fontWeight:700}}>{saving?'Création...':'✓ Ajouter l\'employé'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
