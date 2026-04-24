import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';

const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'}) : '—';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fmtDuration = (ms) => {
  if (!ms) return '—';
  const h = Math.floor(ms/3600000);
  const m = Math.floor((ms%3600000)/60000);
  return `${h}h${m.toString().padStart(2,'0')}`;
};

const ZONES_SITES = {
  bureau_principal: { lat:4.0511, lng:9.7085, rayon:200, nom:'Bureau Principal' },
  'DLA-001': { lat:4.0511, lng:9.7085, rayon:300, nom:'Site Akwa Douala' },
  'YDE-001': { lat:3.8480, lng:11.5021, rayon:300, nom:'Site Yaoundé' },
  'KRI-001': { lat:2.9395, lng:9.9087, rayon:300, nom:'Site Kribi' },
  'GAR-001': { lat:9.3019, lng:13.3920, rayon:300, nom:'Site Garoua' },
  'LIM-001': { lat:4.0167, lng:9.2000, rayon:300, nom:'Site Limbé' },
};

function calcDist(lat1,lng1,lat2,lng2) {
  const R=6371000, dLat=(lat2-lat1)*Math.PI/180, dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

const SEED_POINTAGES = [
  { id:'1', userId:'u1', userName:'Thomas Ngono', userRole:'technician', type:'entree', typeEmploye:'externe', latitude:4.0511, longitude:9.7085, siteCode:'DLA-001', siteName:'Site Akwa Douala', horsZone:false, distanceZone:45, heurePointage:new Date(Date.now()-7200000).toISOString(), valide:true },
  { id:'2', userId:'u2', userName:'Marie Kamga', userRole:'project_manager', type:'entree', typeEmploye:'interne', latitude:4.0511, longitude:9.7085, siteCode:'bureau_principal', siteName:'Bureau Principal', horsZone:false, distanceZone:12, heurePointage:new Date(Date.now()-14400000).toISOString(), valide:true },
  { id:'3', userId:'u3', userName:'Jean Mbarga', userRole:'technician', type:'entree', typeEmploye:'externe', latitude:3.8480, longitude:11.5021, siteCode:'YDE-001', siteName:'Site Yaoundé', horsZone:false, distanceZone:88, heurePointage:new Date(Date.now()-10800000).toISOString(), valide:true },
  { id:'4', userId:'u4', userName:'Ali Moussa', userRole:'technician', type:'sortie', typeEmploye:'externe', latitude:9.3519, longitude:13.4120, siteCode:'GAR-001', siteName:'Site Garoua', horsZone:true, distanceZone:650, heurePointage:new Date(Date.now()-3600000).toISOString(), valide:false },
  { id:'5', userId:'u5', userName:'Samuel Djomo', userRole:'technician', type:'entree', typeEmploye:'externe', latitude:4.0167, longitude:9.2000, siteCode:'LIM-001', siteName:'Site Limbé', horsZone:false, distanceZone:23, heurePointage:new Date(Date.now()-5400000).toISOString(), valide:true },
  { id:'6', userId:'u6', userName:'Pierre Etoga', userRole:'project_manager', type:'entree', typeEmploye:'interne', latitude:4.0511, longitude:9.7085, siteCode:'bureau_principal', siteName:'Bureau Principal', horsZone:false, distanceZone:8, heurePointage:new Date(Date.now()-18000000).toISOString(), valide:true },
];

const SEED_PRESENCES = [
  { userId:'u1', nom:'Thomas Ngono', role:'Technicien', present:true, derniereAction:'entree', heureAction:new Date(Date.now()-7200000).toISOString(), site:'DLA-001', horsZone:false, typeEmploye:'externe', avatar:'TN', color:'#1d4ed8' },
  { userId:'u2', nom:'Marie Kamga', role:'Project Manager', present:true, derniereAction:'entree', heureAction:new Date(Date.now()-14400000).toISOString(), site:'bureau_principal', horsZone:false, typeEmploye:'interne', avatar:'MK', color:'#059669' },
  { userId:'u3', nom:'Jean Mbarga', role:'Technicien', present:true, derniereAction:'entree', heureAction:new Date(Date.now()-10800000).toISOString(), site:'YDE-001', horsZone:false, typeEmploye:'externe', avatar:'JM', color:'#d97706' },
  { userId:'u4', nom:'Ali Moussa', role:'Technicien', present:false, derniereAction:'sortie', heureAction:new Date(Date.now()-3600000).toISOString(), site:'GAR-001', horsZone:true, typeEmploye:'externe', avatar:'AM', color:'#dc2626' },
  { userId:'u5', nom:'Samuel Djomo', role:'Technicien', present:true, derniereAction:'entree', heureAction:new Date(Date.now()-5400000).toISOString(), site:'LIM-001', horsZone:false, typeEmploye:'externe', avatar:'SD', color:'#7c3aed' },
  { userId:'u6', nom:'Pierre Etoga', role:'Project Manager', present:true, derniereAction:'entree', heureAction:new Date(Date.now()-18000000).toISOString(), site:'bureau_principal', horsZone:false, typeEmploye:'interne', avatar:'PE', color:'#059669' },
  { userId:'u7', nom:'Aline Biya', role:'RH', present:false, derniereAction:'sortie', heureAction:new Date(Date.now()-7200000).toISOString(), site:'bureau_principal', horsZone:false, typeEmploye:'interne', avatar:'AB', color:'#be185d' },
  { userId:'u8', nom:'David Mballa', role:'Finance', present:true, derniereAction:'entree', heureAction:new Date(Date.now()-21600000).toISOString(), site:'bureau_principal', horsZone:false, typeEmploye:'interne', avatar:'DM', color:'#0891b2' },
];

// QR Code generator simple
const QRCodeDisplay = ({ value, size=200 }) => {
  const cells = 20;
  const cell = size/cells;
  // Simulation QR code pattern
  const pattern = Array.from({length:cells}, (_,i) =>
    Array.from({length:cells}, (_,j) => {
      if ((i<7&&j<7)||(i<7&&j>=cells-7)||(i>=cells-7&&j<7)) return 1;
      if ((i===0||i===6||i===cells-1||i===cells-7)&&j<7) return 1;
      if ((i===0||i===6)&&j>=cells-7) return 1;
      return Math.random() > 0.5 ? 1 : 0;
    })
  );
  return (
    <div style={{display:'inline-block',background:'white',padding:12,borderRadius:12,border:'2px solid #e5e7eb'}}>
      {pattern.map((row,i) => (
        <div key={i} style={{display:'flex'}}>
          {row.map((cell_val,j) => (
            <div key={j} style={{width:cell,height:cell,background:cell_val?'#111827':'white'}}/>
          ))}
        </div>
      ))}
      <div style={{textAlign:'center',fontSize:10,color:'#6b7280',marginTop:6,fontFamily:'monospace'}}>{value}</div>
    </div>
  );
};

// Modal Pointer manuellement
const PointerModal = ({ onClose, onSave }) => {
  const [employe, setEmploye] = useState('');
  const [type, setType] = useState('entree');
  const [site, setSite] = useState('bureau_principal');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [gps, setGps] = useState(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(pos => {
      setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }, []);

  const EMPLOYES = [
    { id:'u1', nom:'Thomas Ngono', role:'Technicien' },
    { id:'u2', nom:'Marie Kamga', role:'Project Manager' },
    { id:'u3', nom:'Jean Mbarga', role:'Technicien' },
    { id:'u4', nom:'Ali Moussa', role:'Technicien' },
    { id:'u5', nom:'Samuel Djomo', role:'Technicien' },
    { id:'u6', nom:'Pierre Etoga', role:'Project Manager' },
  ];

  const handleSave = async () => {
    if (!employe) { alert('Sélectionner un employé'); return; }
    setLoading(true);
    const emp = EMPLOYES.find(e => e.id === employe);
    const zone = ZONES_SITES[site];
    let horsZone = false, distanceZone = 0;
    if (gps && zone) {
      distanceZone = Math.round(calcDist(gps.lat, gps.lng, zone.lat, zone.lng));
      horsZone = distanceZone > zone.rayon;
    }
    const pointage = {
      id: Date.now().toString(),
      userId: employe,
      userName: emp?.nom || '',
      userRole: emp?.role || '',
      type,
      typeEmploye: ['u2','u6','u7','u8'].includes(employe) ? 'interne' : 'externe',
      latitude: gps?.lat,
      longitude: gps?.lng,
      siteCode: site,
      siteName: ZONES_SITES[site]?.nom,
      horsZone,
      distanceZone,
      notes,
      heurePointage: new Date().toISOString(),
      valide: true,
    };
    try { await api.post('/pointage', pointage); } catch {}
    onSave(pointage);
    setLoading(false);
    onClose();
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'white',borderRadius:20,width:'100%',maxWidth:520,boxShadow:'0 24px 64px rgba(0,0,0,0.2)'}}>
        <div style={{background:'linear-gradient(135deg,#0f172a,#1d4ed8)',padding:'20px 24px',borderRadius:'20px 20px 0 0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:1}}>Nouveau</div>
            <div style={{fontSize:20,fontWeight:900,color:'white'}}>Enregistrer un pointage</div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:9,background:'rgba(255,255,255,0.15)',border:'none',color:'white',cursor:'pointer',fontSize:16}}>✕</button>
        </div>
        <div style={{padding:24}}>
          {/* GPS */}
          <div style={{padding:'10px 14px',borderRadius:10,background:gps?'#f0fdf4':'#fff7ed',border:`1px solid ${gps?'#bbf7d0':'#fed7aa'}`,marginBottom:18,display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:10,height:10,borderRadius:5,background:gps?'#16a34a':'#d97706'}}/>
            <span style={{fontSize:13,fontWeight:600,color:gps?'#16a34a':'#d97706'}}>
              {gps ? `GPS: ${gps.lat.toFixed(5)}°N, ${gps.lng.toFixed(5)}°E` : 'Localisation GPS en cours...'}
            </span>
          </div>

          {[
            { label:'Employé *', type:'select', value:employe, set:setEmploye, options:EMPLOYES.map(e=>({v:e.id,l:`${e.nom} — ${e.role}`})) },
            { label:'Type de pointage *', type:'select', value:type, set:setType, options:[{v:'entree',l:'Entrée'},{v:'sortie',l:'Sortie'},{v:'pause_debut',l:'Début pause'},{v:'pause_fin',l:'Fin pause'}] },
            { label:'Site / Zone', type:'select', value:site, set:setSite, options:Object.entries(ZONES_SITES).map(([k,v])=>({v:k,l:v.nom})) },
          ].map(f => (
            <div key={f.label} style={{marginBottom:14}}>
              <label style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:0.5,display:'block',marginBottom:5}}>{f.label}</label>
              <select value={f.value} onChange={e=>f.set(e.target.value)} style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1.5px solid #e5e7eb',fontSize:13,color:'#111827',background:'#f9fafb'}}>
                <option value="">Sélectionner...</option>
                {f.options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
          ))}

          <div style={{marginBottom:18}}>
            <label style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:0.5,display:'block',marginBottom:5}}>Notes</label>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Remarques éventuelles..." style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1.5px solid #e5e7eb',fontSize:13,resize:'none',boxSizing:'border-box',fontFamily:'inherit'}}/>
          </div>

          <div style={{display:'flex',gap:10}}>
            <button onClick={onClose} style={{flex:1,padding:'12px',borderRadius:11,border:'1.5px solid #e5e7eb',background:'white',color:'#6b7280',fontWeight:700,fontSize:14,cursor:'pointer'}}>Annuler</button>
            <button onClick={handleSave} disabled={loading} style={{flex:2,padding:'12px',borderRadius:11,border:'none',background:'#1d4ed8',color:'white',fontWeight:800,fontSize:14,cursor:'pointer'}}>
              {loading ? 'Enregistrement...' : '✓ Enregistrer pointage'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TABS = [
  {id:'dashboard', label:'Tableau de bord', icon:'📊'},
  {id:'temps_reel', label:'Présence temps réel', icon:'🟢'},
  {id:'historique', label:'Historique pointages', icon:'📋'},
  {id:'geofencing', label:'Géofencing', icon:'📍'},
  {id:'qr_codes', label:'QR Codes', icon:'⬛'},
  {id:'rapports', label:'Rapports', icon:'📈'},
];

export default function Pointage() {
  const [tab, setTab] = useState('dashboard');
  const [pointages, setPointages] = useState(SEED_POINTAGES);
  const [presences, setPresences] = useState(SEED_PRESENCES);
  const [showPointer, setShowPointer] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('tous');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const addPointage = (p) => {
    setPointages(prev => [p, ...prev]);
    setPresences(prev => {
      const idx = prev.findIndex(pr => pr.userId === p.userId);
      const updated = {
        ...prev[idx] || {},
        userId: p.userId,
        nom: p.userName,
        role: p.userRole,
        present: p.type === 'entree' || p.type === 'pause_fin',
        derniereAction: p.type,
        heureAction: p.heurePointage,
        site: p.siteCode,
        horsZone: p.horsZone,
      };
      if (idx >= 0) { const n=[...prev]; n[idx]=updated; return n; }
      return [updated, ...prev];
    });
  };

  const presents = presences.filter(p => p.present);
  const absents = presences.filter(p => !p.present);
  const horsZone = presences.filter(p => p.horsZone);
  const internes = presences.filter(p => p.typeEmploye === 'interne');
  const externes = presences.filter(p => p.typeEmploye === 'externe');

  const filteredPointages = pointages.filter(p => {
    const ms = !search || p.userName.toLowerCase().includes(search.toLowerCase()) || (p.siteCode||"").toLowerCase().includes(search.toLowerCase());
    const mf = filterType === 'tous' || p.type === filterType;
    return ms && mf;
  });

  return (
    <div style={{minHeight:'100vh',background:'#f0f4ff',fontFamily:"'Segoe UI',Arial,sans-serif"}}>
      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#0f172a,#1e3a5f)',borderBottom:'1px solid rgba(255,255,255,.05)'}}>
        <div style={{maxWidth:1400,margin:'0 auto',padding:'20px 28px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div>
              <h1 style={{fontSize:22,fontWeight:900,color:'white',margin:'0 0 4px'}}>⏱ Pointage & Présence</h1>
              <p style={{color:'#64748b',margin:0,fontSize:12}}>
                GPS · Géofencing · Temps réel · {now.toLocaleTimeString('fr-FR')}
              </p>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setShowPointer(true)} style={{padding:'10px 18px',borderRadius:10,border:'none',background:'#1d4ed8',color:'white',fontWeight:800,fontSize:13,cursor:'pointer'}}>
                + Pointer manuellement
              </button>
              <button style={{padding:'10px 16px',borderRadius:10,border:'1px solid rgba(255,255,255,.2)',background:'transparent',color:'white',fontWeight:600,fontSize:13,cursor:'pointer'}}>
                📥 Exporter
              </button>
            </div>
          </div>
          <div style={{display:'flex',gap:2,overflowX:'auto'}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'9px 16px',borderRadius:'9px 9px 0 0',border:'none',background:tab===t.id?'#f0f4ff':'transparent',color:tab===t.id?'#1d4ed8':'rgba(255,255,255,.5)',fontWeight:tab===t.id?800:500,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap',transition:'all .15s'}}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1400,margin:'0 auto',padding:'24px 28px'}}>

        {/* DASHBOARD */}
        {tab==='dashboard' && (
          <div>
            {/* KPIs */}
            <div style={{display:'flex',gap:14,marginBottom:24,flexWrap:'wrap'}}>
              {[
                {l:'Présents',v:presents.length,total:presences.length,c:'#16a34a',icon:'🟢'},
                {l:'Absents',v:absents.length,total:presences.length,c:'#6b7280',icon:'⚫'},
                {l:'Hors zone',v:horsZone.length,total:presences.length,c:'#dc2626',icon:'⚠️'},
                {l:'Internes présents',v:internes.filter(p=>p.present).length,total:internes.length,c:'#1d4ed8',icon:'🏢'},
                {l:'Externes actifs',v:externes.filter(p=>p.present).length,total:externes.length,c:'#d97706',icon:'🔧'},
                {l:'Pointages today',v:pointages.filter(p=>new Date(p.heurePointage).toDateString()===now.toDateString()).length,c:'#7c3aed',icon:'📋'},
              ].map(k=>(
                <div key={k.l} style={{flex:1,minWidth:150,background:'white',borderRadius:14,padding:'16px 18px',borderLeft:`4px solid ${k.c}`,boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                    <span style={{fontSize:11,color:'#9ca3af',textTransform:'uppercase',letterSpacing:0.5}}>{k.l}</span>
                    <span style={{fontSize:18}}>{k.icon}</span>
                  </div>
                  <div style={{fontSize:26,fontWeight:900,color:k.c}}>{k.v}</div>
                  {k.total&&<div style={{fontSize:11,color:'#9ca3af',marginTop:2}}>sur {k.total} employés</div>}
                </div>
              ))}
            </div>

            {/* Alertes hors zone */}
            {horsZone.length>0&&(
              <div style={{background:'#fef2f2',borderRadius:14,padding:'14px 18px',border:'1px solid #fecaca',marginBottom:20}}>
                <div style={{fontSize:13,fontWeight:800,color:'#dc2626',marginBottom:8}}>⚠️ Alertes géofencing — Employés hors zone</div>
                <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                  {horsZone.map(p=>(
                    <div key={p.userId} style={{background:'white',borderRadius:10,padding:'10px 14px',border:'1px solid #fecaca',display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:32,height:32,borderRadius:9,background:'#dc2626',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:900,fontSize:12}}>{p.avatar||p.nom[0]}</div>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:'#111827'}}>{p.nom}</div>
                        <div style={{fontSize:11,color:'#dc2626'}}>Site: {p.site} — Hors périmètre</div>
                      </div>
                      <button style={{padding:'5px 10px',borderRadius:7,border:'none',background:'#dc2626',color:'white',fontSize:11,fontWeight:700,cursor:'pointer'}}>Contacter</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Présences du jour */}
            <div style={{display:'grid',gridTemplateColumns:'1.2fr 1fr',gap:18}}>
              <div style={{background:'white',borderRadius:16,border:'1px solid #e5e7eb',overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                <div style={{padding:'14px 18px',borderBottom:'1px solid #e5e7eb',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <h3 style={{margin:0,fontSize:14,fontWeight:800,color:'#111827'}}>Présences en cours — {now.toLocaleDateString('fr-FR')}</h3>
                  <span style={{fontSize:12,color:'#6b7280'}}>{presents.length} présents</span>
                </div>
                {presences.map((p,i)=>(
                  <div key={p.userId} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 18px',borderBottom:i<presences.length-1?'1px solid #f9fafb':'none',background:i%2===0?'white':'#fafbfc'}}>
                    <div style={{position:'relative'}}>
                      <div style={{width:38,height:38,borderRadius:11,background:p.color||'#6b7280',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:900,fontSize:13}}>{p.avatar}</div>
                      <div style={{position:'absolute',bottom:-2,right:-2,width:12,height:12,borderRadius:6,background:p.present?'#16a34a':'#9ca3af',border:'2px solid white'}}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:'#111827'}}>{p.nom}</div>
                      <div style={{fontSize:11,color:'#6b7280'}}>{p.role} · {ZONES_SITES[p.site]?.nom||p.site}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:11,fontWeight:700,color:p.present?'#16a34a':'#6b7280'}}>{p.present?'Présent':'Absent'}</div>
                      <div style={{fontSize:10,color:'#9ca3af'}}>{fmtTime(p.heureAction)}</div>
                    </div>
                    {p.horsZone&&<span style={{padding:'2px 7px',borderRadius:6,background:'#fef2f2',color:'#dc2626',fontSize:10,fontWeight:700}}>Hors zone</span>}
                  </div>
                ))}
              </div>

              {/* Derniers pointages */}
              <div style={{background:'white',borderRadius:16,border:'1px solid #e5e7eb',overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                <div style={{padding:'14px 18px',borderBottom:'1px solid #e5e7eb'}}>
                  <h3 style={{margin:0,fontSize:14,fontWeight:800,color:'#111827'}}>Derniers pointages</h3>
                </div>
                {pointages.slice(0,8).map((p,i)=>(
                  <div key={p.id} style={{display:'flex',alignItems:'center',gap:10,padding:'11px 18px',borderBottom:i<7?'1px solid #f9fafb':'none'}}>
                    <div style={{width:32,height:32,borderRadius:9,background:p.type==='entree'?'#f0fdf4':p.type==='sortie'?'#fef2f2':'#eff6ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>
                      {p.type==='entree'?'▶':p.type==='sortie'?'⏹':'⏸'}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:'#111827'}}>{p.userName}</div>
                      <div style={{fontSize:11,color:'#6b7280'}}>{ZONES_SITES[p.siteCode]?.nom||p.siteCode}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:12,fontWeight:700,color:p.type==='entree'?'#16a34a':p.type==='sortie'?'#dc2626':'#1d4ed8'}}>{p.type==='entree'?'Entrée':p.type==='sortie'?'Sortie':'Pause'}</div>
                      <div style={{fontSize:10,color:'#9ca3af'}}>{fmtTime(p.heurePointage)}</div>
                    </div>
                    {p.horsZone&&<span style={{fontSize:18}}>⚠️</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PRÉSENCE TEMPS RÉEL */}
        {tab==='temps_reel' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div style={{display:'flex',gap:8}}>
                {['tous','interne','externe'].map(f=>(
                  <button key={f} onClick={()=>setFilterType(f)} style={{padding:'8px 16px',borderRadius:20,border:'none',background:filterType===f?'#1d4ed8':'white',color:filterType===f?'white':'#6b7280',fontWeight:700,fontSize:13,cursor:'pointer',boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>
                    {f==='tous'?'Tous':f==='interne'?'Internes':'Externes'}
                  </button>
                ))}
              </div>
              <div style={{fontSize:13,color:'#6b7280',fontWeight:600}}>
                🔄 Mis à jour: {now.toLocaleTimeString('fr-FR')}
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
              {presences.filter(p=>filterType==='tous'||p.typeEmploye===filterType).map(p=>(
                <div key={p.userId} style={{background:'white',borderRadius:16,padding:18,border:`2px solid ${p.horsZone?'#fecaca':p.present?'#bbf7d0':'#e5e7eb'}`,boxShadow:'0 2px 8px rgba(0,0,0,0.05)',position:'relative'}}>
                  {p.horsZone&&<div style={{position:'absolute',top:12,right:12,padding:'3px 8px',borderRadius:6,background:'#fef2f2',color:'#dc2626',fontSize:10,fontWeight:800}}>HORS ZONE</div>}
                  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                    <div style={{position:'relative'}}>
                      <div style={{width:50,height:50,borderRadius:14,background:p.color||'#6b7280',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:900,fontSize:18}}>{p.avatar}</div>
                      <div style={{position:'absolute',bottom:-2,right:-2,width:14,height:14,borderRadius:7,background:p.present?'#16a34a':'#9ca3af',border:'2px solid white'}}/>
                    </div>
                    <div>
                      <div style={{fontSize:15,fontWeight:800,color:'#111827'}}>{p.nom}</div>
                      <div style={{fontSize:12,color:'#6b7280'}}>{p.role}</div>
                      <span style={{padding:'2px 7px',borderRadius:5,background:p.typeEmploye==='interne'?'#eff6ff':'#fff7ed',color:p.typeEmploye==='interne'?'#1d4ed8':'#d97706',fontSize:10,fontWeight:700}}>
                        {p.typeEmploye==='interne'?'Interne':'Externe'}
                      </span>
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                    {[
                      {l:'Statut',v:p.present?'✅ Présent':'⚫ Absent',c:p.present?'#16a34a':'#6b7280'},
                      {l:'Site',v:ZONES_SITES[p.site]?.nom||p.site||'—',c:'#374151'},
                      {l:'Dernière action',v:p.derniereAction==='entree'?'Entrée':p.derniereAction==='sortie'?'Sortie':'Pause',c:'#374151'},
                      {l:'Heure',v:fmtTime(p.heureAction),c:'#374151'},
                    ].map(item=>(
                      <div key={item.l} style={{background:'#f8fafc',borderRadius:9,padding:'8px 10px'}}>
                        <div style={{fontSize:9,color:'#9ca3af',textTransform:'uppercase',letterSpacing:0.4,marginBottom:2}}>{item.l}</div>
                        <div style={{fontSize:12,fontWeight:700,color:item.c}}>{item.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HISTORIQUE */}
        {tab==='historique' && (
          <div>
            <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
              <div style={{flex:1,minWidth:220,display:'flex',alignItems:'center',gap:8,background:'white',borderRadius:11,padding:'9px 13px',border:'1px solid #e5e7eb'}}>
                <span style={{color:'#9ca3af'}}>🔍</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Employé, site..." style={{flex:1,border:'none',outline:'none',fontSize:13}}/>
              </div>
              <div style={{display:'flex',gap:5,background:'white',borderRadius:11,padding:3,border:'1px solid #e5e7eb'}}>
                {[{v:'tous',l:'Tous'},{v:'entree',l:'Entrées'},{v:'sortie',l:'Sorties'},{v:'pause_debut',l:'Pauses'}].map(f=>(
                  <button key={f.v} onClick={()=>setFilterType(f.v)} style={{padding:'7px 12px',borderRadius:9,border:'none',background:filterType===f.v?'#1d4ed8':'transparent',color:filterType===f.v?'white':'#6b7280',fontWeight:700,fontSize:12,cursor:'pointer'}}>{f.l}</button>
                ))}
              </div>
              <button onClick={()=>setShowPointer(true)} style={{padding:'10px 16px',borderRadius:11,border:'none',background:'#1d4ed8',color:'white',fontWeight:800,fontSize:13,cursor:'pointer'}}>+ Pointer</button>
            </div>
            <div style={{background:'white',borderRadius:16,border:'1px solid #e5e7eb',overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',minWidth:800}}>
                  <thead>
                    <tr style={{background:'#f8fafc',borderBottom:'2px solid #e5e7eb'}}>
                      {['Employé','Type','Zone / Site','GPS','Distance zone','Heure','Valide','Actions'].map(h=>(
                        <th key={h} style={{padding:'12px 14px',textAlign:'left',fontSize:11,fontWeight:800,color:'#6b7280',textTransform:'uppercase',letterSpacing:0.5,whiteSpace:'nowrap'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPointages.map((p,i)=>(
                      <tr key={p.id} style={{borderBottom:'1px solid #f3f4f6',background:i%2===0?'white':'#fafbfc'}}
                        onMouseEnter={e=>e.currentTarget.style.background='#eff6ff'}
                        onMouseLeave={e=>e.currentTarget.style.background=i%2===0?'white':'#fafbfc'}>
                        <td style={{padding:'12px 14px'}}>
                          <div style={{fontSize:13,fontWeight:700,color:'#111827'}}>{p.userName}</div>
                          <div style={{fontSize:11,color:'#6b7280'}}>{p.userRole}</div>
                        </td>
                        <td style={{padding:'12px 14px'}}>
                          <span style={{padding:'3px 9px',borderRadius:8,background:p.type==='entree'?'#f0fdf4':p.type==='sortie'?'#fef2f2':'#eff6ff',color:p.type==='entree'?'#16a34a':p.type==='sortie'?'#dc2626':'#1d4ed8',fontSize:11,fontWeight:700}}>
                            {p.type==='entree'?'▶ Entrée':p.type==='sortie'?'⏹ Sortie':'⏸ Pause'}
                          </span>
                        </td>
                        <td style={{padding:'12px 14px',fontSize:13,color:'#374151'}}>{ZONES_SITES[p.siteCode]?.nom||p.siteCode}</td>
                        <td style={{padding:'12px 14px',fontSize:11,color:'#6b7280',fontFamily:'monospace'}}>
                          {p.latitude?`${Number(p.latitude).toFixed(4)}°N`:'—'}
                        </td>
                        <td style={{padding:'12px 14px'}}>
                          <span style={{fontSize:12,fontWeight:700,color:p.horsZone?'#dc2626':'#16a34a'}}>
                            {p.horsZone?'⚠️ ':''}±{Math.round(p.distanceZone||0)}m
                          </span>
                        </td>
                        <td style={{padding:'12px 14px',fontSize:12,color:'#374151'}}>{fmtTime(p.heurePointage)}</td>
                        <td style={{padding:'12px 14px'}}>
                          <span style={{padding:'2px 8px',borderRadius:6,background:p.valide?'#f0fdf4':'#fff7ed',color:p.valide?'#16a34a':'#d97706',fontSize:11,fontWeight:700}}>
                            {p.valide?'✓ Validé':'En attente'}
                          </span>
                        </td>
                        <td style={{padding:'12px 14px'}}>
                          <div style={{display:'flex',gap:4}}>
                            {[['👁','Voir'],['✅','Valider'],['❌','Rejeter']].map(([icon,title])=>(
                              <button key={title} title={title} style={{width:28,height:28,borderRadius:7,border:'1px solid #e5e7eb',background:'white',cursor:'pointer',fontSize:13}}>{icon}</button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* GÉOFENCING */}
        {tab==='geofencing' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:16,marginBottom:20}}>
              {Object.entries(ZONES_SITES).map(([key,zone])=>{
                const employes = presences.filter(p=>p.site===key);
                const horsZoneCount = employes.filter(p=>p.horsZone).length;
                return (
                  <div key={key} style={{background:'white',borderRadius:16,padding:20,border:`2px solid ${horsZoneCount>0?'#fecaca':'#e5e7eb'}`,boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                      <div>
                        <div style={{fontSize:10,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:0.5,marginBottom:4}}>{key}</div>
                        <div style={{fontSize:16,fontWeight:800,color:'#111827'}}>{zone.nom}</div>
                        <div style={{fontSize:12,color:'#6b7280',marginTop:2}}>Rayon: {zone.rayon}m · {zone.lat.toFixed(4)}°N, {zone.lng.toFixed(4)}°E</div>
                      </div>
                      {horsZoneCount>0&&<span style={{padding:'4px 10px',borderRadius:8,background:'#fef2f2',color:'#dc2626',fontSize:12,fontWeight:700}}>{horsZoneCount} hors zone</span>}
                    </div>
                    {/* Visualisation cercle */}
                    <div style={{position:'relative',width:'100%',height:120,background:'#f0f9ff',borderRadius:12,overflow:'hidden',marginBottom:12}}>
                      <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:80,height:80,borderRadius:'50%',border:'2px dashed #93c5fd',background:'#dbeafe30'}}/>
                      <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:12,height:12,borderRadius:'50%',background:'#1d4ed8'}}/>
                      {employes.map((e,i)=>{
                        const angle = (i/employes.length)*Math.PI*2;
                        const r = e.horsZone?55:25;
                        const x = 50+r*Math.cos(angle);
                        const y = 50+r*Math.sin(angle);
                        return (
                          <div key={e.userId} title={e.nom} style={{position:'absolute',width:24,height:24,borderRadius:7,background:e.horsZone?'#dc2626':(e.color||'#1d4ed8'),display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:9,fontWeight:900,left:`${x}%`,top:`${y}%`,transform:'translate(-50%,-50%)',border:`2px solid ${e.horsZone?'#fca5a5':'white'}`}}>
                            {e.avatar}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontSize:13,color:'#374151'}}>{employes.length} employé{employes.length>1?'s':''} sur ce site</span>
                      <div style={{display:'flex',gap:5}}>
                        <button style={{padding:'5px 10px',borderRadius:7,border:'none',background:'#eff6ff',color:'#1d4ed8',fontWeight:700,fontSize:11,cursor:'pointer'}}>Modifier zone</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* QR CODES */}
        {tab==='qr_codes' && (
          <div>
            <div style={{background:'white',borderRadius:16,padding:24,border:'1px solid #e5e7eb',marginBottom:20,boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
              <h3 style={{margin:'0 0 6px',fontSize:15,fontWeight:800,color:'#111827'}}>QR Codes de pointage</h3>
              <p style={{margin:'0 0 20px',fontSize:13,color:'#6b7280'}}>Imprimez et affichez ces QR codes dans vos locaux. Les employés les scannent pour pointer automatiquement avec leur position GPS.</p>
              <div style={{display:'flex',gap:24,flexWrap:'wrap'}}>
                {Object.entries(ZONES_SITES).map(([key,zone])=>(
                  <div key={key} style={{textAlign:'center'}}>
                    <QRCodeDisplay value={`CLEANIT-POINTAGE-${key}`} size={140}/>
                    <div style={{marginTop:10,fontSize:13,fontWeight:700,color:'#111827'}}>{zone.nom}</div>
                    <div style={{fontSize:11,color:'#6b7280',marginBottom:8}}>Code: {key}</div>
                    <button style={{padding:'7px 14px',borderRadius:9,border:'none',background:'#1d4ed8',color:'white',fontWeight:700,fontSize:12,cursor:'pointer'}}>🖨 Imprimer</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RAPPORTS */}
        {tab==='rapports' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginBottom:20}}>
              <div style={{background:'white',borderRadius:16,padding:24,border:'1px solid #e5e7eb',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                <h3 style={{margin:'0 0 16px',fontSize:14,fontWeight:800,color:'#111827'}}>Résumé du mois</h3>
                {[
                  {l:'Jours ouvrés',v:22,c:'#1d4ed8'},
                  {l:'Taux de présence moyen',v:'87%',c:'#16a34a'},
                  {l:'Total pointages',v:pointages.length,c:'#7c3aed'},
                  {l:'Alertes hors zone',v:horsZone.length,c:'#dc2626'},
                  {l:'Retards enregistrés',v:3,c:'#d97706'},
                ].map((item,i,arr)=>(
                  <div key={item.l} style={{display:'flex',justifyContent:'space-between',padding:'11px 0',borderBottom:i<arr.length-1?'1px solid #f3f4f6':'none'}}>
                    <span style={{fontSize:13,color:'#374151'}}>{item.l}</span>
                    <span style={{fontSize:14,fontWeight:800,color:item.c}}>{item.v}</span>
                  </div>
                ))}
              </div>
              <div style={{background:'white',borderRadius:16,padding:24,border:'1px solid #e5e7eb',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                <h3 style={{margin:'0 0 16px',fontSize:14,fontWeight:800,color:'#111827'}}>Exports disponibles</h3>
                {[
                  {l:'Rapport de présence mensuel',icon:'📊',desc:'Excel avec toutes les présences'},
                  {l:'Feuilles de temps individuelles',icon:'📋',desc:'Par employé, par mois'},
                  {l:'Rapport géofencing',icon:'📍',desc:'Alertes hors zone détaillées'},
                  {l:'Export paie',icon:'💰',desc:'Heures pour calcul salaires'},
                  {l:'Rapport DRH mensuel',icon:'📁',desc:'Synthèse pour la direction'},
                ].map(r=>(
                  <div key={r.l} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid #f9fafb',cursor:'pointer'}}
                    onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <div style={{width:36,height:36,borderRadius:10,background:'#eff6ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{r.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:'#111827'}}>{r.l}</div>
                      <div style={{fontSize:11,color:'#9ca3af'}}>{r.desc}</div>
                    </div>
                    <button style={{padding:'6px 12px',borderRadius:8,border:'none',background:'#1d4ed8',color:'white',fontWeight:700,fontSize:11,cursor:'pointer'}}>Exporter</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showPointer && <PointerModal onClose={()=>setShowPointer(false)} onSave={addPointage}/>}
    </div>
  );
}
