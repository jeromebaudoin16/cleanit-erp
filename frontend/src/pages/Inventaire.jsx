import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const STATUS_EQ = {
  actif:       { label:'Actif',        color:'#16a34a', bg:'#f0fdf4' },
  maintenance: { label:'Maintenance',  color:'#f59e0b', bg:'#fefce8' },
  hors_service:{ label:'Hors service', color:'#dc2626', bg:'#fef2f2' },
  stock:       { label:'En stock',     color:'#0078d4', bg:'#eff6ff' },
};

const SEED = [
  { id:1, code:'BBU-5900-001', name:'BBU 5900 5G NR', type:'BBU', model:'Client BBU5900', serialNumber:'SN20240001', site:'DLA-001', status:'actif', condition:'bon', dateInstallation:'2024-01-15', garantieExpiry:'2027-01-15', prix:8500000 },
  { id:2, code:'RRU-5258-001', name:'RRU 5258 4T4R', type:'RRU', model:'Client RRU5258', serialNumber:'SN20240002', site:'DLA-001', status:'actif', condition:'bon', dateInstallation:'2024-01-15', garantieExpiry:'2027-01-15', prix:2500000 },
  { id:3, code:'AAU-5614-001', name:'AAU 5614 Massive MIMO', type:'AAU', model:'Client AAU5614', serialNumber:'SN20240003', site:'YDE-001', status:'actif', condition:'bon', dateInstallation:'2024-02-01', garantieExpiry:'2027-02-01', prix:3200000 },
  { id:4, code:'BBU-5900-002', name:'BBU 5900 5G NR', type:'BBU', model:'Client BBU5900', serialNumber:'SN20240004', site:'', status:'stock', condition:'neuf', dateInstallation:'', garantieExpiry:'2027-03-01', prix:8500000 },
  { id:5, code:'RRU-5258-002', name:'RRU 5258 4T4R', type:'RRU', model:'Client RRU5258', serialNumber:'SN20240005', site:'DLA-003', status:'maintenance', condition:'moyen', dateInstallation:'2023-06-15', garantieExpiry:'2026-06-15', prix:2500000 },
  { id:6, code:'SW-CE6870-001', name:'Switch CE6870', type:'Switch', model:'Client CE6870', serialNumber:'SN20240006', site:'YDE-001', status:'actif', condition:'bon', dateInstallation:'2024-02-01', garantieExpiry:'2027-02-01', prix:4500000 },
  { id:7, code:'RTR-NE40-001', name:'Routeur NE40E', type:'Routeur', model:'Client NE40E', serialNumber:'SN20240007', site:'DLA-001', status:'actif', condition:'bon', dateInstallation:'2024-01-15', garantieExpiry:'2027-01-15', prix:12000000 },
  { id:8, code:'BBU-5900-003', name:'BBU 5900 5G NR', type:'BBU', model:'Client BBU5900', serialNumber:'SN20240008', site:'KRI-001', status:'actif', condition:'bon', dateInstallation:'2024-03-01', garantieExpiry:'2027-03-01', prix:8500000 },
];

// ── ICÔNES CATALOGUE (style ligne, cohérent avec le reste de l'app) ───────
const CatIc = ({d,size=20,color='currentColor',sw=1.7}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {(Array.isArray(d)?d:[d]).map((p,i)=><path key={i} d={p}/>)}
  </svg>
);
const CAT_ICONS = {
  antenna:   ['M12 2v20','M7 9a5 5 0 0110 0','M4 6a8 8 0 0116 0','M9 20h6'],
  bbu:       ['M4 4h16v16H4V4z','M4 9.3h16','M4 14.7h16','M9.3 4v16','M14.7 4v16'],
  dish:      ['M3 17a9 9 0 0118 0','M12 17V8','M9 5l3 3 3-3'],
  router:    ['M4 4h16v4H4V4z','M4 10h16v4H4v-4z','M4 16h16v4H4v-4z','M7 6h.01','M7 12h.01','M7 18h.01'],
  fiber:     ['M2 12h6','M16 12h6','M9 12a3 3 0 106 0 3 3 0 10-6 0z'],
};
const CATALOG_CATEGORIES = [
  { id:'ran',          label:'Accès Radio (RAN)',         color:'#ea580c' },
  { id:'transmission', label:'Transmission / DWDM',       color:'#0078d4' },
  { id:'microwave',    label:'Faisceaux hertziens',       color:'#7c3aed' },
  { id:'ipcore',       label:'Cœur de réseau IP',         color:'#16a34a' },
  { id:'entreprise',   label:'Entreprise / B2B',          color:'#dc2626' },
];
const CATALOG_ITEMS = [
  { id:'bbu5900', cat:'ran', icon:'bbu', name:'BBU 5900', sub:'Unité bande de base 5G/4G/3G/2G',
    desc:"Cœur numérique de la station de base : traite le signal radio et pilote les unités RRU/AAU déportées par fibre optique. Un seul châssis peut combiner plusieurs générations technologiques (2G à 5G).",
    specs:["Jusqu'à 6 standards radio dans un même boîtier","Liaison optique CPRI vers RRU/AAU déportés","Format compact (~9U), intérieur ou armoire extérieure"] },
  { id:'aau', cat:'ran', icon:'antenna', name:'AAU Massive MIMO', sub:'Antenne active (ex. AAU5613/5619/5639)',
    desc:"Combine l'antenne et l'électronique radio dans un seul boîtier extérieur fixé en hauteur, pour une couverture 4G/5G plus large avec une emprise réduite sur le mât.",
    specs:["Plusieurs gammes de fréquences selon le modèle","Installation directe sur mât, sans câble RF séparé","Réduit le nombre d'équipements à installer en hauteur"] },
  { id:'rru3908', cat:'ran', icon:'antenna', name:'RRU 3908', sub:'Unité radio distante (RRU)',
    desc:"Amplifie et transmet le signal radio près de l'antenne, relié au BBU par fibre optique pour limiter les pertes de signal sur la liaison antenne-baie.",
    specs:["Liaison optique CPRI vers le BBU","Installation sur mât ou en façade, proche de l'antenne","Plusieurs variantes selon la bande de fréquence"] },
  { id:'antenne-dir', cat:'ran', icon:'antenna', name:'Antenne directionnelle multibande', sub:'Antenne passive sectorielle',
    desc:"Antenne passive installée par trois (un triptyque par secteur) pour couvrir une zone géographique donnée autour du site.",
    specs:["Plusieurs ports pour combiner plusieurs bandes","Réglage du downtilt pour ajuster la couverture","Montage sur mât ou pylône"] },
  { id:'osn9800', cat:'transmission', icon:'router', name:'OptiX OSN 9800', sub:'Transmission optique haute capacité',
    desc:"Plateforme de transmission utilisée pour le cœur du réseau de transport longue distance ; multiplexe plusieurs longueurs d'onde (DWDM) sur une seule fibre pour un très grand volume de trafic.",
    specs:["Technologie DWDM / OTN","Conçu pour les liaisons backbone et data center","Capacité évolutive par ajout de cartes"] },
  { id:'osn6800', cat:'transmission', icon:'router', name:'OptiX OSN 6800', sub:'Transmission métro (MS-OTN)',
    desc:"Plateforme orientée réseaux métropolitains : regroupe plusieurs types de trafic (TDM, paquet, OTN) sur une infrastructure unique, adaptée aux sites secondaires.",
    specs:["Convergence TDM + Ethernet + OTN","Architecture flexible (MS-OTN)","Bon compromis coût / capacité pour le métro"] },
  { id:'dc908', cat:'transmission', icon:'router', name:'OptiXtrans DC908', sub:'Interconnexion data centers (DCI)',
    desc:"Équipement dédié à l'interconnexion de data centers à très haut débit, avec un déploiement automatisé conçu pour être rapide à mettre en service.",
    specs:["Interconnexion data center longue distance","Déploiement automatisé","Bande passante élevée par longueur d'onde"] },
  { id:'rtn950', cat:'microwave', icon:'dish', name:'OptiX RTN 950', sub:'Faisceau hertzien — unité intérieure (IDU)',
    desc:"Unité intérieure de transmission par faisceau hertzien, utilisée pour relier un site au réseau de transport quand la fibre optique n'est pas disponible.",
    specs:["Liaison point-à-point sans fibre","Couplée à une unité extérieure (ODU) sur mât","Solution de backhaul pour sites isolés"] },
  { id:'odu', cat:'microwave', icon:'dish', name:'ODU faisceau hertzien', sub:'Unité extérieure (ODU) + antenne parabolique',
    desc:"Module extérieur monté sur mât et couplé à une antenne parabolique ; convertit et transmet le signal micro-ondes entre deux sites en visibilité directe.",
    specs:["Installation extérieure, résistant aux intempéries","Couplé à une antenne parabolique dédiée","Portée selon la fréquence et la taille d'antenne"] },
  { id:'ne40e', cat:'ipcore', icon:'router', name:'NE40E', sub:'Routeur de cœur de réseau IP',
    desc:"Routeur haut de gamme utilisé pour l'agrégation et le routage du trafic IP à fort débit, avec une haute disponibilité.",
    specs:["Hautes performances de routage IP","Redondance pour la haute disponibilité","Utilisé en cœur ou en agrégation réseau"] },
  { id:'cloudengine', cat:'entreprise', icon:'router', name:'CloudEngine', sub:'Gamme commutateurs entreprise',
    desc:"Commutateurs haute performance utilisés pour les réseaux d'entreprise et les services B2B : data centers clients, campus, agrégation.",
    specs:["Plusieurs modèles selon le débit requis","Adapté aux réseaux d'entreprise et data center","Utilisé pour les déploiements B2B chez le client"] },
  { id:'ea5800', cat:'entreprise', icon:'fiber', name:'EA5800', sub:'Terminal de ligne optique (OLT)',
    desc:"Point de départ du réseau fibre optique passif (PON) vers les clients finaux ou entreprises raccordés en fibre.",
    specs:["Point d'accès du réseau fibre passif (PON)","Dessert plusieurs clients depuis une seule fibre","Utilisé pour les raccordements FTTH / B2B fibre"] },
];

export default function Inventaire() {
  const [tab, setTab] = useState('stock');
  const [catSearch, setCatSearch] = useState('');
  const [catFilter, setCatFilter] = useState('tous');
  const [catSelected, setCatSelected] = useState(null);


  // __INVENTAIRE_API__ — Inventaire OEM depuis missions
  const [realInventaire, setRealInventaire] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    fetch('https://backend-cleanit-erp.vercel.app/missions', {headers:{'Authorization':'Bearer '+token}})
      .then(r=>r.json()).then(missions => {
        if(Array.isArray(missions) && missions.length > 0) {
          const items = missions.map(m => ({
            id: m.id, reference: m.code, site: m.siteName || m.site,
            client: m.client, type: m.type, statut: m.status
          }));
          setRealInventaire(items);
        }
      }).catch(()=>{});
  }, []);

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
          <h1 style={{fontSize:22,fontWeight:800,color:'#1e293b',margin:0}}>Inventaire OEM Client</h1>
          <p style={{color:'#64748b',fontSize:13,margin:'4px 0 0'}}>Gestion des équipements réseau · {items.length} équipements · Valeur: {fmtN(valeurTotale)} XAF</p>
        </div>
        <button onClick={()=>setShowForm(true)} style={{padding:'9px 16px',borderRadius:8,border:'none',background:'#ea580c',color:'white',fontSize:13,fontWeight:600,cursor:'pointer'}}>+ Nouvel Équipement</button>
      </div>

      {/* Onglets */}
      <div style={{display:'flex',gap:0,marginBottom:18,borderBottom:'1px solid #e2e8f0'}}>
        {[{id:'stock',label:'Stock'},{id:'catalogue',label:'Catalogue Huawei'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'9px 16px',border:'none',borderBottom:`2px solid ${tab===t.id?'#ea580c':'transparent'}`,background:'transparent',color:tab===t.id?'#ea580c':'#64748b',fontWeight:tab===t.id?700:500,fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>{t.label}</button>
        ))}
      </div>

      {tab==='stock' && <>
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
      </>}

      {tab==='catalogue' && (
        <div>
          <div style={{background:'white',borderRadius:10,padding:'12px 16px',border:'1px solid #e2e8f0',marginBottom:16,display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
            <div style={{position:'relative',flex:1,minWidth:200}}>
              <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#94a3b8'}}>🔍</span>
              <input placeholder="Rechercher un équipement (BBU, RTN, OLT...)" value={catSearch} onChange={e=>setCatSearch(e.target.value)} style={{width:'100%',padding:'8px 12px 8px 32px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} />
            </div>
            <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>
              <option value="tous">Toutes les catégories</option>
              {CATALOG_CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
            {CATALOG_CATEGORIES.map(c=>(
              <span key={c.id} style={{padding:'4px 10px',borderRadius:12,fontSize:11,fontWeight:600,background:c.color+'15',color:c.color,border:`1px solid ${c.color}30`}}>{c.label}</span>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14}}>
            {CATALOG_ITEMS.filter(it=>{
              const mc = catFilter==='tous'||it.cat===catFilter;
              const mq = !catSearch || it.name.toLowerCase().includes(catSearch.toLowerCase()) || it.sub.toLowerCase().includes(catSearch.toLowerCase());
              return mc&&mq;
            }).map(it=>{
              const cat = CATALOG_CATEGORIES.find(c=>c.id===it.cat);
              return (
                <div key={it.id} onClick={()=>setCatSelected(it)} style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',padding:16,cursor:'pointer',transition:'all .15s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=cat.color;e.currentTarget.style.boxShadow='0 4px 14px rgba(0,0,0,0.07)';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='#e2e8f0';e.currentTarget.style.boxShadow='none';}}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:8}}>
                    <div style={{width:38,height:38,borderRadius:8,background:cat.color+'14',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <CatIc d={CAT_ICONS[it.icon]} size={19} color={cat.color}/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:700,color:'#1e293b'}}>{it.name}</div>
                      <div style={{fontSize:11,color:'#64748b',marginTop:1}}>{it.sub}</div>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:'#374151',lineHeight:1.5,marginBottom:8}}>{it.desc.slice(0,110)}{it.desc.length>110?'…':''}</div>
                  <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:8,background:cat.color+'12',color:cat.color}}>{cat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

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

      {/* Modal Détail Catalogue */}
      {catSelected && (() => { const cat = CATALOG_CATEGORIES.find(c=>c.id===catSelected.cat); return (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'white',borderRadius:14,width:'100%',maxWidth:480,overflow:'hidden',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
            <div style={{padding:'18px 20px',background:cat.color,color:'white',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                <div style={{width:38,height:38,borderRadius:8,background:'rgba(255,255,255,0.18)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><CatIc d={CAT_ICONS[catSelected.icon]} size={19} color="white"/></div>
                <div><div style={{fontSize:16,fontWeight:800}}>{catSelected.name}</div><div style={{fontSize:12,opacity:0.85}}>{catSelected.sub}</div></div>
              </div>
              <button onClick={()=>setCatSelected(null)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:28,height:28,borderRadius:'50%',cursor:'pointer',fontSize:16,flexShrink:0}}>✕</button>
            </div>
            <div style={{padding:22}}>
              <p style={{fontSize:13,color:'#374151',lineHeight:1.7,margin:'0 0 14px'}}>{catSelected.desc}</p>
              <div style={{fontSize:11,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:8}}>Points clés</div>
              <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:18}}>
                {catSelected.specs.map((s,i)=>(
                  <div key={i} style={{display:'flex',gap:8,fontSize:12,color:'#1e293b'}}><span style={{color:cat.color,fontWeight:700}}>•</span>{s}</div>
                ))}
              </div>
              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>setCatSelected(null)} style={{flex:1,padding:11,borderRadius:8,border:'1px solid #e2e8f0',background:'white',cursor:'pointer',fontSize:13,fontWeight:600,color:'#374151'}}>Fermer</button>
                <button onClick={()=>{ setForm(p=>({...p,name:catSelected.name,model:'Huawei '+catSelected.name,type:catSelected.icon==='dish'?'Antenne':catSelected.icon==='fiber'?'Autre':catSelected.icon==='bbu'?'BBU':catSelected.icon==='antenna'?'Antenne':'Routeur'})); setCatSelected(null); setTab('stock'); setShowForm(true); }}
                  style={{flex:2,padding:11,borderRadius:8,border:'none',background:cat.color,color:'white',cursor:'pointer',fontSize:13,fontWeight:700}}>+ Ajouter au stock</button>
              </div>
            </div>
          </div>
        </div>
      ); })()}

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
                {[{l:'CODE *',k:'code',ph:'BBU-5900-004'},{l:'NOM *',k:'name',ph:'BBU 5900 5G NR'},{l:'MODÈLE',k:'model',ph:'Client BBU5900'},{l:'N° SÉRIE',k:'serialNumber',ph:'SN20240009'},{l:'SITE',k:'site',ph:'DLA-001 (vide si stock)'},{l:'PRIX (XAF)',k:'prix',ph:'8500000'},{l:'DATE INSTALLATION',k:'dateInstallation',ph:'',type:'date'},{l:'GARANTIE JUSQU\'AU',k:'garantieExpiry',ph:'',type:'date'}].map(f=>(
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
