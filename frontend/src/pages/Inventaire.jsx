import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const STATUS_EQ = {
  actif:       { label:'Actif',        color:'#16a34a', bg:'#f0fdf4' },
  maintenance: { label:'Maintenance',  color:'#f59e0b', bg:'#fefce8' },
  hors_service:{ label:'Hors service', color:'#dc2626', bg:'#fef2f2' },
  stock:       { label:'En stock',     color:'#0078d4', bg:'#eff6ff' },
};

const SEED = [
  { id:1, code:'BBU-5900-001', name:'BBU 5900 5G NR', type:'BBU', model:'Huawei BBU5900', serialNumber:'SN20240001', site:'DLA-001', status:'actif', condition:'bon', dateInstallation:'2024-01-15', garantieExpiry:'2027-01-15', prix:8500000 },
  { id:2, code:'RRU-5258-001', name:'RRU 5258 4T4R', type:'RRU', model:'Huawei RRU5258', serialNumber:'SN20240002', site:'DLA-001', status:'actif', condition:'bon', dateInstallation:'2024-01-15', garantieExpiry:'2027-01-15', prix:2500000 },
  { id:3, code:'AAU-5614-001', name:'AAU 5614 Massive MIMO', type:'AAU', model:'Huawei AAU5614', serialNumber:'SN20240003', site:'YDE-001', status:'actif', condition:'bon', dateInstallation:'2024-02-01', garantieExpiry:'2027-02-01', prix:3200000 },
  { id:4, code:'BBU-5900-002', name:'BBU 5900 5G NR', type:'BBU', model:'Huawei BBU5900', serialNumber:'SN20240004', site:'', status:'stock', condition:'neuf', dateInstallation:'', garantieExpiry:'2027-03-01', prix:8500000 },
  { id:5, code:'RRU-5258-002', name:'RRU 5258 4T4R', type:'RRU', model:'Huawei RRU5258', serialNumber:'SN20240005', site:'DLA-003', status:'maintenance', condition:'moyen', dateInstallation:'2023-06-15', garantieExpiry:'2026-06-15', prix:2500000 },
  { id:6, code:'SW-CE6870-001', name:'Switch CE6870', type:'Switch', model:'Huawei CE6870', serialNumber:'SN20240006', site:'YDE-001', status:'actif', condition:'bon', dateInstallation:'2024-02-01', garantieExpiry:'2027-02-01', prix:4500000 },
  { id:7, code:'RTR-NE40-001', name:'Routeur NE40E', type:'Routeur', model:'Huawei NE40E', serialNumber:'SN20240007', site:'DLA-001', status:'actif', condition:'bon', dateInstallation:'2024-01-15', garantieExpiry:'2027-01-15', prix:12000000 },
  { id:8, code:'BBU-5900-003', name:'BBU 5900 5G NR', type:'BBU', model:'Huawei BBU5900', serialNumber:'SN20240008', site:'KRI-001', status:'actif', condition:'bon', dateInstallation:'2024-03-01', garantieExpiry:'2027-03-01', prix:8500000 },
];

export default function Inventaire() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [filterType, setFilterType] = useState('tous');
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ code:'', name:'', type:'BBU', model:'', serialNumber:'', site:'', status:'stock', condition:'neuf', prix:'', garantieExpiry:'' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/inventaire');
      const data = Array.isArray(r.data) ? r.data : [];
      setItems(data.length > 0 ? data : SEED);
    } catch { setItems(SEED); }
    finally { setLoading(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/inventaire', { ...form, prix: Number(form.prix) });
      setShowForm(false); load();
    } catch {
      setItems(p => [...p, { ...form, id: Date.now(), prix: Number(form.prix) }]);
      setShowForm(false);
    } finally { setSaving(false); }
  };

  const types = [...new Set(items.map(i => i.type).filter(Boolean))];
  const filtered = items.filter(i => {
    const ms = filterStatus === 'tous' || i.status === filterStatus;
    const mt = filterType === 'tous' || i.type === filterType;
    const mq = !search || i.name?.toLowerCase().includes(search.toLowerCase()) || i.code?.toLowerCase().includes(search.toLowerCase()) || i.site?.toLowerCase().includes(search.toLowerCase());
    return ms && mt && mq;
  });

  const fmtN = n => n ? new Intl.NumberFormat('fr-FR').format(n) : '—';
  const valeurTotale = items.reduce((s, i) => s + (Number(i.prix) || 0), 0);

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:12}}><div style={{width:40,height:40,borderRadius:'50%',border:'3px solid #ea580c',borderTopColor:'transparent',animation:'spin 1s linear infinite'}} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><span style={{color:'#64748b'}}>Chargement inventaire...</span></div>;

  return (
    <div style={{padding:24,background:'#f0f2f5',minHeight:'100%'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:'#1e293b',margin:0}}>Inventaire OEM Huawei</h1>
          <p style={{color:'#64748b',fontSize:13,margin:'4px 0 0'}}>Gestion des équipements réseau · {items.length} équipements · Valeur: {fmtN(valeurTotale)} XAF</p>
        </div>
        <button onClick={()=>setShowForm(true)} style={{padding:'9px 16px',borderRadius:8,border:'none',background:'#ea580c',color:'white',fontSize:13,fontWeight:600,cursor:'pointer'}}>+ Nouvel Équipement</button>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:10,marginBottom:20}}>
        {[{l:'Total',v:items.length,c:'#0078d4'},{l:'Actifs',v:items.filter(i=>i.status==='actif').length,c:'#16a34a'},{l:'En stock',v:items.filter(i=>i.status==='stock').length,c:'#0078d4'},{l:'Maintenance',v:items.filter(i=>i.status==='maintenance').length,c:'#f59e0b'},{l:'Hors service',v:items.filter(i=>i.status==='hors_service').length,c:'#dc2626'}].map(s=>(
          <div key={s.l} style={{background:'white',borderRadius:10,padding:'14px 16px',border:'1px solid #e2e8f0',textAlign:'center',borderTop:`3px solid ${s.c}`}}>
            <div style={{fontSize:24,fontWeight:800,color:s.c}}>{s.v}</div>
            <div style={{fontSize:11,color:'#64748b',marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{background:'white',borderRadius:10,padding:'12px 16px',border:'1px solid #e2e8f0',marginBottom:16,display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{position:'relative',flex:1,minWidth:200}}>
          <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#94a3b8'}}>🔍</span>
          <input placeholder="Rechercher par code, nom, site..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:'100%',padding:'8px 12px 8px 32px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} />
        </div>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>
          <option value="tous">Tous les statuts</option>
          {Object.entries(STATUS_EQ).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>
          <option value="tous">Tous les types</option>
          {types.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
        <span style={{fontSize:12,color:'#94a3b8',marginLeft:'auto'}}>{filtered.length} équipement(s)</span>
      </div>

      {/* Table */}
      <div style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{background:'#f8fafc',borderBottom:'2px solid #e2e8f0'}}>{['Code','Nom','Type','Modèle','N° Série','Site','Statut','État','Prix','Garantie','Actions'].map(h=><th key={h} style={{padding:'10px 12px',textAlign:'left',fontSize:11,fontWeight:700,color:'#374151',textTransform:'uppercase',letterSpacing:'0.5px',whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(item => {
              const st = STATUS_EQ[item.status] || STATUS_EQ.stock;
              return (
                <tr key={item.id} style={{borderBottom:'1px solid #f8fafc',cursor:'pointer'}} onClick={()=>setSelected(item)}
                  onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background='white'}>
                  <td style={{padding:'10px 12px',fontSize:12,fontWeight:700,color:'#ea580c'}}>{item.code}</td>
                  <td style={{padding:'10px 12px',fontSize:12,fontWeight:600,color:'#1e293b'}}>{item.name}</td>
                  <td style={{padding:'10px 12px'}}><span style={{padding:'2px 8px',borderRadius:8,fontSize:11,background:'#eff6ff',color:'#2563eb',fontWeight:600}}>{item.type}</span></td>
                  <td style={{padding:'10px 12px',fontSize:11,color:'#64748b'}}>{item.model}</td>
                  <td style={{padding:'10px 12px',fontSize:11,color:'#94a3b8',fontFamily:'monospace'}}>{item.serialNumber}</td>
                  <td style={{padding:'10px 12px',fontSize:12,fontWeight:600,color:'#0078d4'}}>{item.site||<span style={{color:'#cbd5e1'}}>—</span>}</td>
                  <td style={{padding:'10px 12px'}}><span style={{padding:'3px 9px',borderRadius:10,fontSize:11,fontWeight:600,background:st.bg,color:st.color}}>{st.label}</span></td>
                  <td style={{padding:'10px 12px',fontSize:12,color: item.condition==='neuf'?'#16a34a':item.condition==='bon'?'#0078d4':'#f59e0b',fontWeight:600}}>{item.condition}</td>
                  <td style={{padding:'10px 12px',fontSize:12,color:'#374151',whiteSpace:'nowrap'}}>{fmtN(item.prix)} XAF</td>
                  <td style={{padding:'10px 12px',fontSize:11,color: item.garantieExpiry&&new Date(item.garantieExpiry)<new Date()?'#dc2626':'#16a34a'}}>{item.garantieExpiry ? new Date(item.garantieExpiry).toLocaleDateString('fr-FR') : '—'}</td>
                  <td style={{padding:'10px 12px'}}><button style={{padding:'4px 10px',borderRadius:6,border:'1px solid #ea580c',background:'white',color:'#ea580c',fontSize:11,cursor:'pointer',fontWeight:600}}>Voir</button></td>
                </tr>
              );
            })}
            {filtered.length===0 && <tr><td colSpan={11} style={{padding:48,textAlign:'center',color:'#94a3b8'}}>Aucun équipement trouvé</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Modal Détail */}
      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'white',borderRadius:14,width:'100%',maxWidth:500,overflow:'hidden',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
            <div style={{padding:'16px 20px',background:'linear-gradient(135deg,#7c2d12,#ea580c)',color:'white',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><div style={{fontSize:16,fontWeight:800}}>{selected.code}</div><div style={{fontSize:12,opacity:0.8}}>{selected.name}</div></div>
              <button onClick={()=>setSelected(null)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:28,height:28,borderRadius:'50%',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
            <div style={{padding:24}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {[{l:'Type',v:selected.type},{l:'Modèle',v:selected.model},{l:'N° Série',v:selected.serialNumber},{l:'Site assigné',v:selected.site||'En stock'},{l:'Statut',v:STATUS_EQ[selected.status]?.label||selected.status},{l:'État',v:selected.condition},{l:'Prix',v:`${fmtN(selected.prix)} XAF`},{l:'Garantie jusqu\'au',v:selected.garantieExpiry?new Date(selected.garantieExpiry).toLocaleDateString('fr-FR'):'—'},{l:'Date installation',v:selected.dateInstallation?new Date(selected.dateInstallation).toLocaleDateString('fr-FR'):'—'}].map(i=>(
                  <div key={i.l} style={{background:'#f8fafc',borderRadius:8,padding:'10px 14px'}}>
                    <div style={{fontSize:10,color:'#94a3b8',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px'}}>{i.l}</div>
                    <div style={{fontSize:13,fontWeight:600,color:'#1e293b',marginTop:3}}>{i.v}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>setSelected(null)} style={{width:'100%',marginTop:16,padding:11,borderRadius:8,border:'1px solid #e2e8f0',background:'white',cursor:'pointer',fontSize:13,fontWeight:600,color:'#374151'}}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'white',borderRadius:14,width:'100%',maxWidth:520,maxHeight:'85vh',overflow:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
            <div style={{padding:'16px 20px',background:'linear-gradient(135deg,#7c2d12,#ea580c)',color:'white',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0}}>
              <div style={{fontSize:16,fontWeight:800}}>+ Nouvel Équipement OEM</div>
              <button onClick={()=>setShowForm(false)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:28,height:28,borderRadius:'50%',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
            <div style={{padding:24,display:'flex',flexDirection:'column',gap:12}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {[{l:'CODE *',k:'code',ph:'BBU-5900-004'},{l:'NOM *',k:'name',ph:'BBU 5900 5G NR'},{l:'MODÈLE',k:'model',ph:'Huawei BBU5900'},{l:'N° SÉRIE',k:'serialNumber',ph:'SN20240009'},{l:'SITE',k:'site',ph:'DLA-001 (vide si stock)'},{l:'PRIX (XAF)',k:'prix',ph:'8500000'},{l:'DATE INSTALLATION',k:'dateInstallation',ph:'',type:'date'},{l:'GARANTIE JUSQU\'AU',k:'garantieExpiry',ph:'',type:'date'}].map(f=>(
                  <div key={f.k}><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>{f.l}</label><input type={f.type||'text'} value={form[f.k]||''} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph||''} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} /></div>
                ))}
                <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>TYPE</label><select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>{['BBU','RRU','AAU','Switch','Routeur','Antenne','Autre'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>STATUT</label><select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>{Object.entries(STATUS_EQ).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>
                <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>ÉTAT</label><select value={form.condition} onChange={e=>setForm(p=>({...p,condition:e.target.value}))} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>{['neuf','bon','moyen','mauvais'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
              </div>
              <div style={{display:'flex',gap:10,marginTop:8}}>
                <button onClick={()=>setShowForm(false)} style={{flex:1,padding:11,borderRadius:8,border:'1px solid #e2e8f0',background:'white',cursor:'pointer',fontSize:13,color:'#374151'}}>Annuler</button>
                <button onClick={save} disabled={!form.code||!form.name||saving} style={{flex:2,padding:11,borderRadius:8,border:'none',background:(form.code&&form.name)?'#ea580c':'#e2e8f0',color:(form.code&&form.name)?'white':'#94a3b8',cursor:(form.code&&form.name)?'pointer':'not-allowed',fontSize:13,fontWeight:700}}>{saving?'Création...':'✓ Ajouter l\'équipement'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
