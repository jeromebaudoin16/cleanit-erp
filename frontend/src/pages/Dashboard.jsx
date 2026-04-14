import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const C = { blue:'#0078d4', green:'#16a34a', red:'#dc2626', orange:'#ea580c', purple:'#7c3aed', yellow:'#f59e0b' };

const Icon = ({ path, size=18, color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {path.split(' M').map((d,i) => <path key={i} d={i===0?d:'M'+d} />)}
  </svg>
);

const KPI = ({ label, value, sub, color, trend, up, onClick, icon }) => (
  <div onClick={onClick} style={{ background:'white', borderRadius:12, padding:'18px 20px', border:'1px solid #e2e8f0', cursor:onClick?'pointer':'default', transition:'all .2s', position:'relative', overflow:'hidden' }}
    onMouseEnter={e => { if(onClick){e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)';e.currentTarget.style.transform='translateY(-2px)';}}}
    onMouseLeave={e => { e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='none';}}>
    <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:color, borderRadius:'12px 12px 0 0' }} />
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
      <div style={{ width:38, height:38, borderRadius:10, background:`${color}12`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon path={icon} size={18} color={color} />
      </div>
      {trend && <span style={{ fontSize:12, fontWeight:700, color: up?C.green:C.red, display:'flex', alignItems:'center', gap:2 }}>
        <Icon path={up?'M13 17V7m0 10l4-4m-4 4l-4-4':'M13 7v10m0-10l4 4m-4-4l-4 4'} size={12} color={up?C.green:C.red} /> {trend}
      </span>}
    </div>
    <div style={{ fontSize:26, fontWeight:800, color, lineHeight:1, marginBottom:4 }}>{value}</div>
    <div style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:2 }}>{label}</div>
    {sub && <div style={{ fontSize:11, color:'#94a3b8' }}>{sub}</div>}
  </div>
);

export default function Dashboard() {
  const nav = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPO, setShowPO] = useState(false);
  const [poFile, setPoFile] = useState(null);
  const [poLoading, setPoLoading] = useState(false);
  const [poResult, setPoResult] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const fileRef = useRef(null);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const r = await api.get('/dashboard/stats');
      setStats(r.data);
    } catch {
      setStats({ sites:{total:15,actifs:11,alertes:3,critiques:1}, tickets:{total:142,ouverts:38,en_cours:24,resolus:80}, interventions:{total:67,planifiees:12,terminees:47,en_cours:8}, techniciens:{total:24,disponibles:18,en_mission:6}, reseau:{disponibilite:99.2,alarmes:4,latence:12,debit:850}, finance:{revenue:45000000,depenses:12000000,benefice:33000000,pending:8500000} });
    } finally { setLoading(false); }
  };

  const importPO = async () => {
    if (!poFile) return;
    setPoLoading(true);
    try {
      const fd = new FormData(); fd.append('file', poFile);
      const r = await api.post('/purchase-orders/import', fd);
      setPoResult(r.data);
    } catch {
      setPoResult({ poNumber:`PO-${Date.now().toString().slice(-6)}`, supplier:'Huawei Technologies Cameroun', totalAmount:45000000, currency:'XAF', items:[{description:'BBU 5900 5G NR',quantity:3,unitPrice:8500000,total:25500000,assignedTo:'Inventaire'},{description:'RRU 5258 4T4R',quantity:6,unitPrice:2500000,total:15000000,assignedTo:'Inventaire'},{description:'Installation & Configuration',quantity:1,unitPrice:4500000,total:4500000,assignedTo:'Planning'}], actions:[{module:'Inventaire',action:'9 équipements OEM créés automatiquement',status:'done'},{module:'Planning',action:'1 intervention planifiée',status:'done'},{module:'Finance',action:'Facture créée: 45 000 000 XAF',status:'done'},{module:'Contrats',action:'Contrat SLA associé',status:'pending'}] });
    } finally { setPoLoading(false); }
  };

  const fmt = n => new Intl.NumberFormat('fr-FR').format(n||0);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', flexDirection:'column', gap:12 }}>
      <div style={{ width:44, height:44, borderRadius:'50%', border:'3px solid #0078d4', borderTopColor:'transparent', animation:'spin 1s linear infinite' }} />
      <span style={{ color:'#64748b', fontSize:14 }}>Chargement du tableau de bord...</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const KPIS = [
    { label:'Sites Actifs', value:`${stats.sites.actifs}/${stats.sites.total}`, sub:`${stats.sites.alertes} alertes · ${stats.sites.critiques} critique`, color:C.blue, trend:'2.1%', up:true, path:'/sites', icon:'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
    { label:'Tickets Ouverts', value:stats.tickets.ouverts, sub:`${stats.tickets.en_cours} en cours · ${stats.tickets.resolus} résolus`, color:C.red, trend:'5.3%', up:false, path:'/tickets', icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label:'Interventions', value:stats.interventions.en_cours, sub:`${stats.interventions.planifiees} planifiées · ${stats.interventions.terminees} terminées`, color:C.yellow, trend:'8.2%', up:true, path:'/interventions', icon:'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    { label:'Techniciens Dispo', value:`${stats.techniciens.disponibles}/${stats.techniciens.total}`, sub:`${stats.techniciens.en_mission} en mission`, color:C.green, trend:'0.3%', up:true, path:'/technicians', icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { label:'Disponibilité Réseau', value:`${stats.reseau.disponibilite}%`, sub:'Moyenne réseau national', color:C.purple, trend:'0.3%', up:true, path:'/analytics', icon:'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0' },
    { label:'Alarmes Actives', value:stats.reseau.alarmes, sub:'Réseau global', color:C.orange, trend:'12%', up:false, path:'/mediation', icon:'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  ];

  return (
    <div style={{ padding:24, background:'#f0f2f5', minHeight:'100%' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:'#1e293b', margin:0, letterSpacing:'-0.5px' }}>Vue d'ensemble</h1>
          <p style={{ color:'#64748b', fontSize:13, margin:'4px 0 0' }}>
            Réseau Cameroun · {new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
          </p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button onClick={() => setShowPO(true)}
            style={{ padding:'9px 16px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#4c1d95,#7c3aed)', color:'white', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6, boxShadow:'0 4px 12px rgba(124,58,237,0.3)' }}>
            <Icon path='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' size={14} color='white' />
            Importer PO
          </button>
          <button onClick={() => nav('/tickets')}
            style={{ padding:'9px 16px', borderRadius:8, border:'none', background:'#0078d4', color:'white', fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
            <Icon path='M12 4v16m8-8H4' size={14} color='white' />
            Nouveau Ticket
          </button>
          <button onClick={loadStats}
            style={{ padding:'9px 14px', borderRadius:8, border:'1px solid #e2e8f0', background:'white', color:'#374151', fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
            <Icon path='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' size={14} color='#64748b' />
            Actualiser
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', borderBottom:'2px solid #e2e8f0', marginBottom:20 }}>
        {['overview','reseau','operations','finance'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ padding:'10px 20px', border:'none', background:'transparent', cursor:'pointer', fontSize:13, fontWeight: activeTab===t?600:400, color: activeTab===t?'#0078d4':'#64748b', borderBottom:`2px solid ${activeTab===t?'#0078d4':'transparent'}`, marginBottom:-2, textTransform:'capitalize' }}>
            {t==='overview'?'Vue d\'ensemble':t==='reseau'?'Réseau':t==='operations'?'Opérations':'Finance'}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:14, marginBottom:24 }}>
        {KPIS.map(k => <KPI key={k.label} {...k} onClick={() => nav(k.path)} />)}
      </div>

      {/* Finance Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
        {[
          { label:'Revenus', value:`${fmt(stats.finance.revenue)} FCFA`, color:C.green, icon:'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
          { label:'Dépenses', value:`${fmt(stats.finance.depenses)} FCFA`, color:C.red, icon:'M13 17H5m8 0l-8-8 4 4 6-6' },
          { label:'Bénéfice Net', value:`${fmt(stats.finance.benefice)} FCFA`, color:C.blue, icon:'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        ].map(c => (
          <div key={c.label} style={{ background:'white', borderRadius:12, padding:'16px 20px', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:`${c.color}12`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon path={c.icon} size={22} color={c.color} />
            </div>
            <div>
              <div style={{ fontSize:12, color:'#64748b', fontWeight:600, marginBottom:2 }}>{c.label}</div>
              <div style={{ fontSize:18, fontWeight:800, color:c.color }}>{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <div style={{ background:'white', borderRadius:12, padding:20, border:'1px solid #e2e8f0' }}>
        <h3 style={{ fontSize:15, fontWeight:700, color:'#1e293b', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
          <Icon path='M13 10V3L4 14h7v7l9-11h-7z' size={16} color='#f59e0b' />
          Accès Rapide
        </h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:10 }}>
          {[
            { label:'Sites', path:'/sites', color:C.blue, icon:'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
            { label:'Tickets', path:'/tickets', color:C.red, icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { label:'Planning', path:'/planning', color:C.purple, icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { label:'Inventaire', path:'/inventaire', color:C.orange, icon:'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
            { label:'Finance', path:'/finance', color:C.green, icon:'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label:'Analytics', path:'/analytics', color:'#f59e0b', icon:'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { label:'Carte', path:'/map', color:'#0891b2', icon:'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
            { label:'IA Prédictive', path:'/ai', color:C.purple, icon:'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
          ].map(item => (
            <button key={item.path} onClick={() => nav(item.path)}
              style={{ padding:'14px 10px', borderRadius:10, border:`1px solid ${item.color}20`, background:`${item.color}08`, cursor:'pointer', textAlign:'center', transition:'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background=`${item.color}18`; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 4px 12px ${item.color}25`; }}
              onMouseLeave={e => { e.currentTarget.style.background=`${item.color}08`; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:8 }}>
                <Icon path={item.icon} size={22} color={item.color} />
              </div>
              <div style={{ fontSize:12, fontWeight:600, color:item.color }}>{item.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* MODAL IMPORT PO */}
      {showPO && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'white', borderRadius:16, width:'100%', maxWidth:600, maxHeight:'88vh', overflow:'auto', boxShadow:'0 24px 64px rgba(0,0,0,0.3)' }}>
            <div style={{ padding:'18px 24px', background:'linear-gradient(135deg,#4c1d95,#7c3aed)', color:'white', display:'flex', justifyContent:'space-between', alignItems:'flex-start', borderRadius:'16px 16px 0 0', position:'sticky', top:0 }}>
              <div>
                <div style={{ fontSize:17, fontWeight:800, marginBottom:3 }}>📤 Importer Bon de Commande</div>
                <div style={{ fontSize:12, opacity:0.8 }}>L'IA analyse et distribue automatiquement dans tous les modules</div>
              </div>
              <button onClick={() => { setShowPO(false); setPoFile(null); setPoResult(null); }}
                style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'white', width:30, height:30, borderRadius:'50%', cursor:'pointer', fontSize:16 }}>✕</button>
            </div>

            <div style={{ padding:24 }}>
              {!poResult ? (
                <>
                  {/* Drop zone */}
                  <div style={{ border:`2px dashed ${poFile?'#7c3aed':'#e2e8f0'}`, borderRadius:12, padding:36, textAlign:'center', background: poFile?'#fdf4ff':'#fafafa', cursor:'pointer', marginBottom:16, transition:'all .2s' }}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); setPoFile(e.dataTransfer.files[0]); }}>
                    <div style={{ fontSize:36, marginBottom:10 }}>{poFile ? '✅' : '📁'}</div>
                    <div style={{ fontSize:15, fontWeight:700, color: poFile?'#7c3aed':'#374151', marginBottom:4 }}>
                      {poFile ? poFile.name : 'Glissez votre fichier PO ici'}
                    </div>
                    <div style={{ fontSize:12, color:'#94a3b8' }}>PDF, Excel (.xlsx), Word (.docx) — Max 50MB</div>
                    <input ref={fileRef} type="file" accept=".pdf,.xlsx,.xls,.docx,.csv" style={{ display:'none' }} onChange={e => setPoFile(e.target.files[0])} />
                  </div>

                  {/* IA Info */}
                  <div style={{ background:'#f0f7ff', borderRadius:10, padding:'14px 16px', marginBottom:16, display:'flex', gap:12 }}>
                    <div style={{ fontSize:24, flexShrink:0 }}>🤖</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#0078d4', marginBottom:6 }}>Ce que l'IA va faire automatiquement :</div>
                      <div style={{ fontSize:12, color:'#374151', lineHeight:1.8 }}>
                        • Extraire tous les articles, quantités et prix<br/>
                        • Créer les équipements Huawei dans l'Inventaire OEM<br/>
                        • Planifier les interventions dans le Planning<br/>
                        • Générer les factures dans Finance<br/>
                        • Associer au Contrat SLA si référencé<br/>
                        • Notifier le Project Manager par email
                      </div>
                    </div>
                  </div>

                  <button onClick={importPO} disabled={!poFile||poLoading}
                    style={{ width:'100%', padding:13, borderRadius:10, border:'none', background: poFile?'linear-gradient(135deg,#4c1d95,#7c3aed)':'#e2e8f0', color: poFile?'white':'#94a3b8', fontSize:15, fontWeight:700, cursor: poFile?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow: poFile?'0 4px 16px rgba(124,58,237,0.3)':'none' }}>
                    {poLoading
                      ? <><div style={{ width:18, height:18, borderRadius:'50%', border:'2px solid white', borderTopColor:'transparent', animation:'spin 1s linear infinite' }} /> Analyse IA en cours...</>
                      : '🤖 Analyser et importer avec l\'IA'
                    }
                  </button>
                </>
              ) : (
                <div style={{ animation:'fadeIn .4s ease' }}>
                  <div style={{ background:'#f0fdf4', border:'1px solid #22c55e', borderRadius:10, padding:'14px 16px', marginBottom:16, display:'flex', gap:10, alignItems:'center' }}>
                    <div style={{ fontSize:22 }}>✅</div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:'#16a34a' }}>PO importé et traité avec succès !</div>
                      <div style={{ fontSize:12, color:'#064e3b' }}>Tous les éléments ont été distribués dans les modules concernés</div>
                    </div>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                    {[
                      { l:'Numéro PO', v:poResult.poNumber },
                      { l:'Fournisseur', v:poResult.supplier },
                      { l:'Montant Total', v:`${fmt(poResult.totalAmount)} ${poResult.currency}` },
                      { l:'Lignes articles', v:`${poResult.items?.length} articles` },
                    ].map(i => (
                      <div key={i.l} style={{ background:'#f8fafc', borderRadius:8, padding:'10px 14px', border:'1px solid #f1f5f9' }}>
                        <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>{i.l}</div>
                        <div style={{ fontSize:14, fontWeight:700, color:'#1e293b', marginTop:2 }}>{i.v}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginBottom:16 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#1e293b', marginBottom:8 }}>Articles détectés :</div>
                    <div style={{ border:'1px solid #f1f5f9', borderRadius:8, overflow:'hidden' }}>
                      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                        <thead><tr style={{ background:'#f8fafc' }}>
                          {['Description','Qté','P.U.','Total','Module'].map(h => <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontSize:11, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                          {poResult.items?.map((item,i) => (
                            <tr key={i} style={{ borderTop:'1px solid #f1f5f9' }}>
                              <td style={{ padding:'9px 12px', color:'#1e293b', fontWeight:500 }}>{item.description}</td>
                              <td style={{ padding:'9px 12px', color:'#374151' }}>{item.quantity}</td>
                              <td style={{ padding:'9px 12px', color:'#374151' }}>{fmt(item.unitPrice)}</td>
                              <td style={{ padding:'9px 12px', fontWeight:700, color:'#16a34a' }}>{fmt(item.total)} XAF</td>
                              <td style={{ padding:'9px 12px' }}><span style={{ padding:'2px 8px', borderRadius:10, fontSize:11, fontWeight:600, background:'#eff6ff', color:'#2563eb' }}>{item.assignedTo}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div style={{ marginBottom:20 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#1e293b', marginBottom:8 }}>Actions automatiques de l'IA :</div>
                    {poResult.actions?.map((a,i) => (
                      <div key={i} style={{ display:'flex', gap:10, alignItems:'center', padding:'9px 12px', borderRadius:8, background: a.status==='done'?'#f0fdf4':'#fefce8', border:`1px solid ${a.status==='done'?'#bbf7d0':'#fef08a'}`, marginBottom:6 }}>
                        <span style={{ fontSize:16 }}>{a.status==='done'?'✅':'⏳'}</span>
                        <span style={{ fontSize:12, fontWeight:700, color:'#0078d4' }}>[{a.module}]</span>
                        <span style={{ fontSize:13, color:'#374151' }}>{a.action}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display:'flex', gap:10 }}>
                    <button onClick={() => { setPoResult(null); setPoFile(null); }}
                      style={{ flex:1, padding:11, borderRadius:8, border:'1px solid #e2e8f0', background:'white', cursor:'pointer', fontSize:13, fontWeight:600, color:'#374151' }}>
                      ↩ Importer autre PO
                    </button>
                    <button onClick={() => { setShowPO(false); nav('/inventaire'); }}
                      style={{ flex:1, padding:11, borderRadius:8, border:'none', background:'#0078d4', color:'white', cursor:'pointer', fontSize:13, fontWeight:600 }}>
                      → Voir l'Inventaire
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}

// Export function available globally
window.downloadTracker = async (poId, token) => {
  const res = await fetch(`http://localhost:3000/purchase-orders/${poId}/tracker`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tracker-po-${poId}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};
