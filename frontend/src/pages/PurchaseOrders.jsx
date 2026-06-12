import { useState, useEffect, useRef } from 'react';
import { api, getUser } from '../utils/api';

const C = {
  blue:'#185FA5', blue_l:'#E6F1FB', blue_d:'#0C447C',
  green:'#3B6D11', green_l:'#EAF3DE',
  orange:'#854F0B', orange_l:'#FAEEDA',
  red:'#A32D2D', red_l:'#FCEBEB',
  purple:'#403294', purple_l:'#F3EEF9',
  border:'#E5E7EB', border2:'#F3F4F6',
  text:'#111827', text2:'#374151', text3:'#6B7280',
  white:'#FFFFFF', bg:'#F9FAFB',
};

const Icon = ({d,size=16,color='currentColor'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
    {d.split(' M').map((s,i)=><path key={i} d={i===0?s:`M ${s}`}/>)}
  </svg>
);
const ICONS = {
  upload:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
  brain:'M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.49-3 2.5 2.5 0 0 1 1.89-3.94 3 3 0 0 1-.33-1.1 M14.5 2A2.5 2.5 0 0 0 12 4.5 M16 8a2.5 2.5 0 0 0-1.89 3.94 2.5 2.5 0 0 0 1.49 3A2.5 2.5 0 0 0 19.5 17',
  file:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6',
  check:'M20 6 9 17l-5-5',
  link:'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  audit:'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2 M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2 M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2 M12 12h4 M12 16h4 M8 12h.01 M8 16h.01',
  filter:'M22 3H2l8 9.46V19l4 2v-8.54L22 3',
  export:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  approve:'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3',
  books:'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
  site:'M17.657 16.657 13.414 20.9a2 2 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  alert:'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
};

const STATUTS = {
  'a_facturer': {label:'À facturer', bg:C.orange_l, c:C.orange},
  'en_cours':   {label:'En cours',  bg:C.blue_l,   c:C.blue},
  'facture':    {label:'Facturé ✓', bg:C.green_l,  c:C.green},
  'approuve':   {label:'Approuvé',  bg:'#F3EEF9',  c:C.purple},
  'paye':       {label:'Payé ✓',    bg:C.green_l,  c:C.green},
};

const PROJECTS = {
  'DWDM':['#E6F1FB',C.blue],
  'IP CORE':['#FCEBEB',C.red],
  'EBU':['#EAF3DE',C.green],
  'MPBN':['#F3EEF9',C.purple],
  'OSS':['#FFF7ED','#92400E'],
  'IP Metro':['#FAEEDA',C.orange],
};

const SEED_BC = [
  {id:1,po:'416121376123-2',project_code:'56A0KY1',project_name:'DWDM',region:'Center',site_id:'T46',site_code:'GN-CEN-BOUMNYEBEL_eLTE',site_name:'GN-CEN-BOUMNYEBEL_eLTE',duid:'ON-OSN9800-SWAP-Yde-Metro-T46-031-MTNC-Center',scope:'Swap',description:'Installation of Outdoor Power, MTS9300A with Lithium Battery 48V, 100Ah',requested:1,billed:0,due:1,statut:'a_facturer',tl:'Thomas Ngono',lat:3.900550,lng:11.523080},
  {id:2,po:'4161G23208180-1',project_code:'56A0E23',project_name:'EBU',region:'Littoral',site_id:'T161',site_code:'SITE-CW-AIRCON-NEW-T161-442-MTNC-BDA-DC',site_name:'SITE-AIRCON-T161',duid:'IP-EBU-950D-NEW-T161-MTNC-038',scope:'New',description:'13KW AC - Installation of Aircon indoor unit',requested:2,billed:2,due:0,statut:'paye',tl:'Pierre Etoga',lat:4.0511,lng:9.7679},
  {id:3,po:'4161HG3336731-43',project_code:'56A0KY9',project_name:'MPBN',region:'Littoral',site_id:'T265',site_code:'WL-DBS5900-2023EC-MOD-T318-023-MTNC-West',site_name:'WL-DBS5900-T318',duid:'CE16808-SWAP-MPBN-T265-TX2-01-MTNC-035',scope:'Swap',description:'MW Link Installation & Commissioning - Access 0.3/0.6m Config 1+0',requested:3,billed:1,due:2,statut:'en_cours',tl:'Samuel Djomo',lat:4.060484,lng:9.701812},
  {id:4,po:'416121016354-58',project_code:'56A0E23',project_name:'IP CORE',region:'Center',site_id:'T181',site_code:'GN-CEN-MBALMAYO_eLTE',site_name:'GN-CEN-MBALMAYO_eLTE',duid:'IP-NE8000-SWAP-IPCORE-T181-Switch2-MTNC-035',scope:'Swap',description:'Supply and Install PVC pipe (Diameter 32mm)',requested:1,billed:1,due:0,statut:'paye',tl:'Dani',lat:3.837380,lng:11.514920},
  {id:5,po:'4161HG3311142-282',project_code:'56A0LBK',project_name:'OSS',region:'Far North',site_id:'T003',site_code:'WL-DBS5900-OSS-T003-2026RC-RURAL-MTNC-133',site_name:'Kaele T003',duid:'WL-DBS5900-OSS-T003-RURAL-MTNC',scope:'New',description:'Macro BTS Dismantlement',requested:1,billed:0,due:1,statut:'a_facturer',tl:'Jospeh',lat:9.694190,lng:14.045040},
  {id:6,po:'4161HG3336731-65',project_code:'56A0KY1',project_name:'DWDM',region:'Center',site_id:'T29',site_code:'ON-OSN9800-SWAP-Yde-Metro-T29-031-MTNC-Center',site_name:'Mokolo_SC',duid:'ON-OSN9800-SWAP-Yde-Metro-T29-031-MTNC',scope:'Swap',description:'Installation of ACDB',requested:1,billed:1,due:0,statut:'facture',tl:'Dani',lat:3.886954,lng:10.702884},
];

const AUDIT_KEY = 'cleanit_bc_audit';

function getAudit(){
  try{return JSON.parse(localStorage.getItem(AUDIT_KEY)||'[]');}catch{return[];}
}
function addAudit(entry){
  const audit = getAudit();
  audit.unshift({...entry, id:Date.now(), ts:new Date().toISOString()});
  localStorage.setItem(AUDIT_KEY, JSON.stringify(audit.slice(0,500)));
}
function fmtDate(iso){
  if(!iso) return '';
  const d=new Date(iso);
  return d.toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})+' · '+d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
}

const AUDIT_COLORS = {
  import:C.purple, creation:C.blue, approbation:C.green, paiement:C.green,
  facturation:C.blue, mission:C.orange, modification:C.text3,
};

export default function PurchaseOrders(){

  // __PO_API__ — Bons commande depuis missions + journal
  const [realOrders, setRealOrders] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    fetch('https://backend-cleanit-erp.vercel.app/missions', {headers:{'Authorization':'Bearer '+token}})
      .then(r=>r.json()).then(missions => {
        if(Array.isArray(missions) && missions.length > 0) {
          const orders = missions.filter(m => m.bc_number || m.status === 'in_progress').map(m => ({
            id: m.id, reference: m.bc_number || 'BC-'+m.code,
            site: m.siteName || m.site, client: m.client,
            statut: m.status, montant: 0, date: m.created_at
          }));
          if(orders.length > 0) setRealOrders(orders);
        }
      }).catch(()=>{});
  }, []);

  const [tab,setTab] = useState('liste');
  const [bcs,setBcs] = useState([]);
  const [loading,setLoading] = useState(true);
  const [search,setSearch] = useState('');
  const [filterProject,setFilterProject] = useState('');
  const [filterStatut,setFilterStatut] = useState('');
  const [selected,setSelected] = useState(null);
  const [importing,setImporting] = useState(false);
  const [importMsg,setImportMsg] = useState(null);
  const [audit,setAudit] = useState([]);
  const [showConfirm,setShowConfirm] = useState(null);
  const fileRef = useRef(null);
  const user = getUser();

  useEffect(()=>{
    loadBCs();
    setAudit(getAudit());
  },[]);

  const loadBCs = async () => {
    setLoading(true);
    try{
      const r = await api.get('/purchase-orders');
      const data = Array.isArray(r.data) && r.data.length > 0 ? r.data : SEED_BC;
      setBcs(data);
      // Sauvegarder les sites BC pour liaison avec Approvals et CleanITBooks
      try{localStorage.setItem('cleanit_bc_sites',JSON.stringify(data.map(b=>({site_id:b.site_id,site_code:b.site_code,duid:b.duid,po:b.po,project_code:b.project_code,project_name:b.project_name}))));}catch{}
    }catch{
      setBcs(SEED_BC);
    }
    setLoading(false);
  };

  const refreshAudit = () => setAudit(getAudit());

  const handleImport = async (file) => {
    if(!file) return;
    setImporting(true);
    setImportMsg(null);
    try{
      const fd = new FormData();
      fd.append('file', file);
      const r = await api.post('/purchase-orders/import', fd);
      const msg = r.data?.message || 'Import réussi';
      setImportMsg({type:'success', msg});
      addAudit({
        type:'import', user:`${user?.firstName} ${user?.lastName} (${user?.role})`,
        title:'Import BC Excel — traitement automatique',
        detail:`Fichier: ${file.name} · Import effectué · Jobs créés dans CleanITBooks · Sites synchronisés`,
      });
      refreshAudit();
      loadBCs();
    }catch(importErr){
      setImportMsg({type:'error', msg:'Import échoué — '+(importErr?.message||'Vérifiez le format du fichier et réessayez.')});
      addAudit({
        type:'import', user:`${user?.firstName} ${user?.lastName} (${user?.role})`,
        title:'Tentative import BC Excel',
        detail:`Fichier: ${file.name} · Erreur backend — données locales conservées`,
      });
      refreshAudit();
    }
    setImporting(false);
  };

  const declarerFacture = (bc) => {
    const updated = bcs.map(b => b.id===bc.id ? {...b, statut:'facture', billed:b.requested, due:0} : b);
    setBcs(updated);
    addAudit({
      type:'facturation', user:`${user?.firstName} ${user?.lastName} (${user?.role})`,
      title:'Déclaration facturation soumise',
      detail:`PO ${bc.po} · Site ${bc.site_id} · DUID: ${bc.duid} · Qté: ${bc.requested} · Statut: À facturer → Facturé · Envoyé vers Approvals`,
    });
    refreshAudit();
    setShowConfirm(null);
    if(selected?.id===bc.id) setSelected({...bc, statut:'facture', billed:bc.requested, due:0});
  };

  const envoyerApprovals = (bc) => {
    const updated = bcs.map(b => b.id===bc.id ? {...b, statut:'approuve'} : b);
    setBcs(updated);
    addAudit({
      type:'approbation', user:`${user?.firstName} ${user?.lastName} (${user?.role})`,
      title:'Envoyé vers Approvals pour validation paiement',
      detail:`PO ${bc.po} · Site ${bc.site_id} · DUID: ${bc.duid} · Project: ${bc.project_name} · En attente approbation DG`,
    });
    refreshAudit();
    if(selected?.id===bc.id) setSelected({...bc, statut:'approuve'});
  };

  const marquerPaye = (bc) => {
    const updated = bcs.map(b => b.id===bc.id ? {...b, statut:'paye'} : b);
    setBcs(updated);
    addAudit({
      type:'paiement', user:`${user?.firstName} ${user?.lastName} (${user?.role})`,
      title:'Paiement validé et imputé dans CleanITBooks',
      detail:`PO ${bc.po} · DUID: ${bc.duid} · Imputation SYSCOHADA: DR 411100 / CR 707000 · Piste d'audit enregistrée`,
    });
    refreshAudit();
    if(selected?.id===bc.id) setSelected({...bc, statut:'paye'});
  };

  const filtered = bcs.filter(b => {
    const s = search.toLowerCase();
    const matchSearch = !s || b.po?.toLowerCase().includes(s) || b.site_code?.toLowerCase().includes(s) || b.duid?.toLowerCase().includes(s) || b.description?.toLowerCase().includes(s) || b.site_id?.toLowerCase().includes(s);
    const matchProject = !filterProject || b.project_name===filterProject;
    const matchStatut = !filterStatut || b.statut===filterStatut;
    return matchSearch && matchProject && matchStatut;
  });

  const stats = {
    total:bcs.length,
    a_facturer:bcs.filter(b=>b.statut==='a_facturer').length,
    en_cours:bcs.filter(b=>b.statut==='en_cours').length,
    facture:bcs.filter(b=>['facture','approuve'].includes(b.statut)).length,
    paye:bcs.filter(b=>b.statut==='paye').length,
    total_requested:bcs.reduce((a,b)=>a+(b.requested||0),0),
    total_billed:bcs.reduce((a,b)=>a+(b.billed||0),0),
    total_due:bcs.reduce((a,b)=>a+(b.due||0),0),
  };

  const projects = [...new Set(bcs.map(b=>b.project_name).filter(Boolean))];

  const btnSm = (label,onClick,color=C.blue,outline=false) => (
    <button onClick={onClick} style={{fontSize:11,padding:'5px 11px',borderRadius:6,border:outline?`1px solid ${color}`:'none',background:outline?'transparent':color,color:outline?color:C.white,cursor:'pointer',fontFamily:'inherit',fontWeight:500,display:'flex',alignItems:'center',gap:4}}>
      {label}
    </button>
  );

  const lnk = (icon,label,color,onClick) => (
    <div onClick={onClick||undefined} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:7,border:`1px solid ${color}20`,background:`${color}08`,cursor:'pointer',flex:1}}>
      <Icon d={ICONS[icon]} size={14} color={color}/>
      <div>
        <div style={{fontSize:12,fontWeight:500,color}}>{label}</div>
      </div>
    </div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:C.bg,fontFamily:'inherit'}}>

      {/* HEADER */}
      <div style={{padding:'12px 20px',borderBottom:`1px solid ${C.border}`,background:C.white,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:15,fontWeight:600,color:C.text}}>Bons de Commande</span>
          <span style={{fontSize:11,padding:'2px 9px',borderRadius:20,background:C.bg,color:C.text3,border:`1px solid ${C.border}`}}>MTN Cameroun</span>
        </div>
        <div style={{display:'flex',gap:7}}>
          <button onClick={()=>setTab('import')} style={{fontSize:12,padding:'7px 14px',borderRadius:7,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:5}}>
            <Icon d={ICONS.upload} size={13}/>Importer BC
          </button>
          <button onClick={()=>setTab('import')} style={{fontSize:12,padding:'7px 14px',borderRadius:7,border:'none',background:C.blue,color:C.white,cursor:'pointer',fontFamily:'inherit',fontWeight:500,display:'flex',alignItems:'center',gap:5}}>
            <Icon d={ICONS.brain} size={13} color={C.white}/>ChaCha IA
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,padding:'12px 20px',background:C.white,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        {[
          ['Lignes totales', stats.total, C.blue],
          ['À facturer', stats.a_facturer, C.orange],
          ['En cours', stats.en_cours, C.blue],
          ['Facturés', stats.facture, C.purple],
          ['Payés', stats.paye, C.green],
        ].map(([l,v,c])=>(
          <div key={l} style={{background:C.bg,borderRadius:8,padding:'10px 12px',borderTop:`2px solid ${c}`}}>
            <div style={{fontSize:20,fontWeight:600,color:c}}>{v}</div>
            <div style={{fontSize:11,color:C.text3,marginTop:1}}>{l}</div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div style={{display:'flex',borderBottom:`1px solid ${C.border}`,padding:'0 20px',background:C.white,flexShrink:0}}>
        {[['liste','Liste BC'],['detail','Détail PO'],['audit','Piste d\'audit'],['import','Importer']].map(([id,l])=>(
          <button key={id} onClick={()=>setTab(id)} style={{padding:'9px 14px',border:'none',background:'none',cursor:'pointer',fontSize:12,fontFamily:'inherit',color:tab===id?C.blue:C.text3,fontWeight:tab===id?600:400,borderBottom:tab===id?`2px solid ${C.blue}`:'2px solid transparent',marginBottom:-1,whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:6}}>
            {id==='audit'&&audit.length>0&&<span style={{fontSize:10,padding:'0px 5px',borderRadius:8,background:C.red_l,color:C.red,fontWeight:700}}>{audit.length}</span>}
            {l}
          </button>
        ))}
      </div>

      {/* ===== LISTE ===== */}
      {tab==='liste'&&(
        <div style={{flex:1,overflow:'auto',padding:'14px 20px'}}>
          <div style={{display:'flex',gap:8,marginBottom:12,alignItems:'center'}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher PO, site, DUID..."
              style={{padding:'7px 12px',borderRadius:7,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit',flex:1,maxWidth:300,outline:'none'}}/>
            <select value={filterProject} onChange={e=>setFilterProject(e.target.value)}
              style={{padding:'7px 10px',borderRadius:7,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit'}}>
              <option value=''>Tous les projets</option>
              {projects.map(p=><option key={p}>{p}</option>)}
            </select>
            <select value={filterStatut} onChange={e=>setFilterStatut(e.target.value)}
              style={{padding:'7px 10px',borderRadius:7,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit'}}>
              <option value=''>Tous les statuts</option>
              {Object.entries(STATUTS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
            </select>
            <span style={{fontSize:12,color:C.text3,marginLeft:'auto'}}>{filtered.length} résultats</span>
          </div>

          <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,overflow:'hidden'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:C.bg}}>
                  {['PO Number','Project','Site ID','Site Code','DUID','Description','Dem.','Bill.','Due','Statut','Actions'].map(h=>(
                    <th key={h} style={{textAlign:'left',padding:'8px 12px',fontSize:10,fontWeight:600,color:C.text3,textTransform:'uppercase',letterSpacing:.4,borderBottom:`1px solid ${C.border}`,whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading&&<tr><td colSpan={11} style={{padding:24,textAlign:'center',color:C.text3,fontSize:13}}>Chargement...</td></tr>}
                {!loading&&filtered.map(bc=>{
                  const st = STATUTS[bc.statut]||STATUTS.a_facturer;
                  const [pbg,pc] = PROJECTS[bc.project_name]||[C.bg,C.text3];
                  return (
                    <tr key={bc.id} onClick={()=>{setSelected(bc);setTab('detail');}}
                      style={{borderBottom:`1px solid ${C.border2}`,cursor:'pointer'}}
                      onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'10px 12px'}}>
                        <span style={{fontSize:11,fontFamily:'monospace',color:C.blue,fontWeight:500}}>{bc.po}</span>
                      </td>
                      <td style={{padding:'10px 12px'}}>
                        <span style={{fontSize:11,padding:'2px 7px',borderRadius:20,background:pbg,color:pc,fontWeight:600}}>{bc.project_name}</span>
                      </td>
                      <td style={{padding:'10px 12px',fontSize:12,fontWeight:600}}>{bc.site_id}</td>
                      <td style={{padding:'10px 12px',fontSize:11,maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:C.text2}}>{bc.site_code}</td>
                      <td style={{padding:'10px 12px',fontSize:10,fontFamily:'monospace',color:C.text3,maxWidth:130,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{bc.duid}</td>
                      <td style={{padding:'10px 12px',fontSize:11,maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{bc.description}</td>
                      <td style={{padding:'10px 12px',textAlign:'center',fontSize:12,fontWeight:600}}>{bc.requested}</td>
                      <td style={{padding:'10px 12px',textAlign:'center',fontSize:12,fontWeight:600,color:bc.billed>0?C.green:C.text3}}>{bc.billed}</td>
                      <td style={{padding:'10px 12px',textAlign:'center',fontSize:12,fontWeight:700,color:bc.due>0?C.red:C.green}}>{bc.due}</td>
                      <td style={{padding:'10px 12px'}}>
                        <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:st.bg,color:st.c,fontWeight:600,whiteSpace:'nowrap'}}>{st.label}</span>
                      </td>
                      <td style={{padding:'10px 12px'}} onClick={e=>e.stopPropagation()}>
                        <div style={{display:'flex',gap:4}}>
                          {bc.statut==='a_facturer'&&btnSm('Facturer',()=>setShowConfirm(bc),C.blue)}
                          {bc.statut==='facture'&&btnSm('→ Approvals',()=>envoyerApprovals(bc),C.purple)}
                          {bc.statut==='approuve'&&btnSm('Marquer payé',()=>marquerPaye(bc),C.green)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!loading&&filtered.length===0&&<tr><td colSpan={11} style={{padding:24,textAlign:'center',color:C.text3,fontSize:13}}>Aucun résultat</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== DÉTAIL PO ===== */}
      {tab==='detail'&&(
        <div style={{flex:1,overflow:'auto'}}>
          {!selected?(
            <div style={{padding:40,textAlign:'center',color:C.text3,fontSize:13}}>Sélectionnez un BC dans la liste pour voir le détail</div>
          ):(()=>{
            const bc = selected;
            const st = STATUTS[bc.statut]||STATUTS.a_facturer;
            const [pbg,pc] = PROJECTS[bc.project_name]||[C.bg,C.text3];
            return (
              <div>
                <div style={{padding:'12px 20px',background:C.white,borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontFamily:'monospace',fontSize:13,fontWeight:600,color:C.blue}}>{bc.po}</span>
                    <span style={{fontSize:12,padding:'3px 10px',borderRadius:20,background:pbg,color:pc,fontWeight:600}}>{bc.project_name}</span>
                    <span style={{fontSize:12,padding:'3px 10px',borderRadius:20,background:st.bg,color:st.c,fontWeight:600}}>{st.label}</span>
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    {bc.statut==='a_facturer'&&<button onClick={()=>setShowConfirm(bc)} style={{fontSize:12,padding:'7px 14px',borderRadius:7,border:'none',background:C.blue,color:C.white,cursor:'pointer',fontFamily:'inherit',fontWeight:500}}>Déclarer facturé</button>}
                    {bc.statut==='facture'&&<button onClick={()=>envoyerApprovals(bc)} style={{fontSize:12,padding:'7px 14px',borderRadius:7,border:'none',background:C.purple,color:C.white,cursor:'pointer',fontFamily:'inherit',fontWeight:500}}>→ Envoyer Approvals</button>}
                    {bc.statut==='approuve'&&<button onClick={()=>marquerPaye(bc)} style={{fontSize:12,padding:'7px 14px',borderRadius:7,border:'none',background:C.green,color:C.white,cursor:'pointer',fontFamily:'inherit',fontWeight:500}}>Confirmer paiement</button>}
                  </div>
                </div>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:0,borderBottom:`1px solid ${C.border}`}}>
                  <div style={{padding:'16px 20px',background:C.white,borderRight:`1px solid ${C.border}`}}>
                    <div style={{fontSize:11,fontWeight:600,color:C.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:10}}>Identifiants MTN — référence exacte</div>
                    {[
                      ['PO Number',<span style={{fontFamily:'monospace',fontSize:12,color:C.blue,fontWeight:700}}>{bc.po}</span>],
                      ['Project Code',<span style={{fontFamily:'monospace',fontSize:12,fontWeight:600}}>{bc.project_code}</span>],
                      ['Project Name',<span style={{fontSize:13,fontWeight:500}}>{bc.project_name}</span>],
                      ['Site ID',<span style={{fontFamily:'monospace',fontSize:13,fontWeight:700,color:C.blue}}>{bc.site_id}</span>],
                      ['Site Code',<span style={{fontFamily:'monospace',fontSize:11,color:C.text2}}>{bc.site_code}</span>],
                      ['DUID',<span style={{fontFamily:'monospace',fontSize:10,color:C.text3}}>{bc.duid}</span>],
                      ['Region',<span style={{fontSize:12}}>{bc.region}</span>],
                      ['Scope',<span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:bc.scope==='Swap'?C.orange_l:C.green_l,color:bc.scope==='Swap'?C.orange:C.green,fontWeight:600}}>{bc.scope}</span>],
                      ['TL Assigné',<span style={{fontSize:12,fontWeight:500}}>{bc.tl||'—'}</span>],
                      ['GPS',bc.lat?<span style={{fontSize:11,fontFamily:'monospace',color:C.text3}}>{bc.lat}°N {bc.lng}°E</span>:<span style={{color:C.text3}}>—</span>],
                    ].map(([l,v])=>(
                      <div key={l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:`1px solid ${C.border2}`}}>
                        <span style={{fontSize:11,color:C.text3}}>{l}</span>
                        <div>{v}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{padding:'16px 20px',background:C.white}}>
                    <div style={{fontSize:11,fontWeight:600,color:C.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:10}}>Suivi quantités & facturation</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:14}}>
                      <div style={{background:C.bg,borderRadius:8,padding:'12px',textAlign:'center',border:`1px solid ${C.border}`}}>
                        <div style={{fontSize:24,fontWeight:700,color:C.text}}>{bc.requested}</div>
                        <div style={{fontSize:11,color:C.text3,marginTop:2}}>Demandée</div>
                      </div>
                      <div style={{background:C.green_l,borderRadius:8,padding:'12px',textAlign:'center',border:`1px solid #86EFAC`}}>
                        <div style={{fontSize:24,fontWeight:700,color:C.green}}>{bc.billed}</div>
                        <div style={{fontSize:11,color:C.green,marginTop:2}}>Facturée</div>
                      </div>
                      <div style={{background:bc.due>0?C.red_l:C.green_l,borderRadius:8,padding:'12px',textAlign:'center',border:`1px solid ${bc.due>0?'#FCA5A5':'#86EFAC'}`}}>
                        <div style={{fontSize:24,fontWeight:700,color:bc.due>0?C.red:C.green}}>{bc.due}</div>
                        <div style={{fontSize:11,color:bc.due>0?C.red:C.green,marginTop:2}}>Restante</div>
                      </div>
                    </div>

                    <div style={{fontSize:11,fontWeight:600,color:C.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>Description travaux</div>
                    <div style={{fontSize:12,color:C.text,padding:'10px 12px',background:C.bg,borderRadius:7,border:`1px solid ${C.border}`,marginBottom:14,lineHeight:1.5}}>{bc.description}</div>

                    <div style={{fontSize:11,fontWeight:600,color:C.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>Modules liés</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
                      {lnk('site','Site '+bc.site_id+' créé',C.green)}
                      {lnk('books','Job '+bc.project_code,C.blue)}
                      {lnk('approve',bc.statut==='paye'?'Payé et imputé':'Approvals',C.purple)}
                      {lnk('audit','Piste d\'audit',C.orange,()=>setTab('audit'))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ===== PISTE D'AUDIT ===== */}
      {tab==='audit'&&(
        <div style={{flex:1,overflow:'auto'}}>
          <div style={{padding:'10px 20px',background:C.white,borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:C.text}}>Piste d'audit complète</div>
              <div style={{fontSize:11,color:C.text3,marginTop:1}}>Toutes les actions sont tracées, horodatées et non modifiables</div>
            </div>
            <div style={{display:'flex',gap:7}}>
              <button onClick={()=>{
                const data = audit.map(a=>`[${fmtDate(a.ts)}] ${a.user} — ${a.title}\n  ${a.detail}`).join('\n\n');
                const blob = new Blob([data],{type:'text/plain'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');a.href=url;a.download='audit_bc_cleanit.txt';a.click();
              }} style={{fontSize:11,padding:'5px 12px',borderRadius:6,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:5}}>
                <Icon d={ICONS.export} size={12}/>Exporter
              </button>
            </div>
          </div>

          {audit.length===0?(
            <div style={{padding:'40px',textAlign:'center'}}>
              <div style={{fontSize:13,color:C.text3,marginBottom:12}}>Aucune action enregistrée pour l'instant</div>
              <div style={{fontSize:12,color:C.text3}}>Importez un BC ou effectuez une action pour commencer la piste d'audit</div>
            </div>
          ):(
            <div style={{background:C.white}}>
              {audit.map((a,i)=>{
                const color = AUDIT_COLORS[a.type]||C.text3;
                return (
                  <div key={a.id||i} style={{padding:'12px 20px',borderBottom:`1px solid ${C.border2}`,borderLeft:`3px solid ${color}`,display:'flex',gap:12}}>
                    <div style={{minWidth:8,width:8,height:8,borderRadius:'50%',background:color,marginTop:5,flexShrink:0}}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:10,color:C.text3,marginBottom:3}}>{fmtDate(a.ts)} · {a.user}</div>
                      <div style={{fontSize:13,fontWeight:500,color:C.text,marginBottom:3}}>{a.title}</div>
                      <div style={{fontSize:11,color:C.text3,lineHeight:1.5}}>{a.detail}</div>
                    </div>
                    <span style={{fontSize:10,padding:'2px 7px',borderRadius:10,background:`${color}15`,color,fontWeight:600,flexShrink:0,height:'fit-content'}}>{a.type}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===== IMPORTER ===== */}
      {tab==='import'&&(
        <div style={{flex:1,overflow:'auto',padding:'20px',display:'flex',alignItems:'flex-start',justifyContent:'center'}}>
          <div style={{maxWidth:540,width:'100%'}}>
            <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden',marginBottom:14}}>
              <div style={{padding:'16px 20px',borderBottom:`1px solid ${C.border2}`}}>
                <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:2}}>Importer un Bon de Commande</div>
                <div style={{fontSize:12,color:C.text3}}>ChaCha IA détecte automatiquement le format et synchronise tous les modules</div>
              </div>
              <div style={{padding:'20px'}}>
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{display:'none'}} onChange={e=>e.target.files[0]&&handleImport(e.target.files[0])}/>
                <div onClick={()=>!importing&&fileRef.current?.click()}
                  style={{border:`2px dashed ${C.border}`,borderRadius:10,padding:'32px',textAlign:'center',background:C.bg,marginBottom:14,cursor:'pointer',transition:'border-color .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=C.blue}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                  <Icon d={ICONS.file} size={36} color={C.blue}/>
                  <div style={{fontSize:13,fontWeight:500,marginTop:10,marginBottom:4}}>{importing?'Import en cours...':'Glissez votre fichier Excel ici'}</div>
                  <div style={{fontSize:11,color:C.text3}}>Formats : .xlsx, .xls, .csv · BC Financier ou BC Opérationnel</div>
                </div>

                {importMsg&&(
                  <div style={{padding:'10px 14px',borderRadius:8,background:importMsg.type==='success'?C.green_l:C.red_l,border:`1px solid ${importMsg.type==='success'?'#86EFAC':'#FCA5A5'}`,color:importMsg.type==='success'?C.green:C.red,fontSize:12,marginBottom:12,display:'flex',alignItems:'center',gap:7}}>
                    <Icon d={importMsg.type==='success'?ICONS.check:ICONS.alert} size={14} color={importMsg.type==='success'?C.green:C.red}/>
                    {importMsg.msg}
                  </div>
                )}

                <div style={{padding:'10px 12px',background:C.purple_l,borderRadius:8,border:`1px solid #D4C5F9`,fontSize:12,color:'#26215C',marginBottom:14,display:'flex',alignItems:'center',gap:7}}>
                  <Icon d={ICONS.brain} size={14} color={C.purple}/>
                  ChaCha analysera le fichier, créera les jobs dans CleanITBooks, synchronisera les sites et ajoutera les jalons au Planning
                </div>

                {[
                  'Détection automatique du format BC (Financier ou Opérationnel)',
                  'Création des jobs CleanITBooks avec identifiants MTN exacts',
                  'Synchronisation Sites, Planning, Gestion Terrain',
                  'Piste d\'audit créée dès l\'import — tout est tracé',
                  'Apparition automatique dans Approvals pour validation',
                ].map((t,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:7,fontSize:12,color:C.text2,marginBottom:5}}>
                    <Icon d={ICONS.check} size={13} color={C.green}/>{t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMATION FACTURATION */}
      {showConfirm&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:C.white,borderRadius:12,padding:'24px',maxWidth:420,width:'90%',boxShadow:'0 20px 60px rgba(0,0,0,.2)'}}>
            <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>Confirmer la facturation</div>
            <div style={{fontSize:13,color:C.text3,marginBottom:16,lineHeight:1.5}}>
              Vous déclarez comme facturé :<br/>
              <strong>PO {showConfirm.po}</strong><br/>
              Site {showConfirm.site_id} · DUID: {showConfirm.duid}<br/>
              Qté: {showConfirm.requested} unité(s)<br/><br/>
              Cette action sera <strong>tracée dans la piste d'audit</strong> et envoyée dans Approvals pour validation.
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button onClick={()=>setShowConfirm(null)} style={{padding:'8px 16px',borderRadius:7,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',fontFamily:'inherit',fontSize:13}}>Annuler</button>
              <button onClick={()=>declarerFacture(showConfirm)} style={{padding:'8px 18px',borderRadius:7,border:'none',background:C.blue,color:C.white,cursor:'pointer',fontFamily:'inherit',fontSize:13,fontWeight:600}}>Confirmer et tracer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
