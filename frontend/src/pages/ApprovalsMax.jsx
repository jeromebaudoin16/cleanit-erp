import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const C = {
  navy:'#0A2D6E', navyL:'#E6EDF8', navyD:'#071D4A',
  white:'#FFFFFF', bg:'#F0F2F5', bg2:'#E8EBF0',
  border:'#D4D7DC', border2:'#E8EBF0',
  text:'#1A1D23', text2:'#3D4458', text3:'#6B7280', text4:'#9CA3AF',
  green:'#0E7A0D', greenL:'#E8F5E9',
  orange:'#D04A00', orangeL:'#FEF3E8',
  red:'#C50F1F', redL:'#FEECEC',
  blue:'#0369A1', blueL:'#E0F2FE',
  purple:'#5C2D91', purpleL:'#F3EEF9',
  shadow:'0 1px 3px rgba(0,0,0,0.07)',
};

const fD = d => d ? new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const fDT = d => d ? new Date(d).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'}) : '—';
const fN = n => new Intl.NumberFormat('fr-FR').format(Math.round(n||0));

// ── ICÔNES SVG ─────────────────────────────────────────────────
const Ic = ({d,s=16,c='currentColor'}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    {(Array.isArray(d)?d:[d]).map((p,i)=><path key={i} d={p}/>)}
  </svg>
);
const I = {
  check:    'M5 13l4 4L19 7',
  x:        'M6 18L18 6M6 6l12 12',
  clock:    'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  alert:    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  list:     'M4 6h16M4 10h16M4 14h16M4 18h16',
  grid:     'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  chart:    'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  search:   'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  filter:   'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
  plus:     'M12 4v16m8-8H4',
  back:     'M10 19l-7-7m0 0l7-7m-7 7h18',
  user:     ['M16 7a4 4 0 11-8 0 4 4 0 018 0z','M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'],
  send:     'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  download: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
  audit:    'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  settings: ['M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z','M15 12a3 3 0 11-6 0 3 3 0 016 0z'],
  matrix:   ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M14 14h7v7h-7z'],
  payment:  'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  purchase: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
  leave:    'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  expense:  'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z',
  mission:  'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
  report:   'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  cancel:   'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
};

const TYPES = {
  payment_request:  {l:'Paiement',        c:C.navy,   ik:'payment'},
  purchase_request: {l:'Achat',           c:C.blue,   ik:'purchase'},
  expense_report:   {l:'Note de frais',   c:C.orange, ik:'expense'},
  leave_request:    {l:'Congé',           c:C.green,  ik:'leave'},
  mission_request:  {l:'Mission',         c:C.purple, ik:'mission'},
  advance_request:  {l:'Avance',          c:C.red,    ik:'payment'},
  training_request: {l:'Formation',       c:C.blue,   ik:'report'},
  equipment_request:{l:'Équipement',      c:C.orange, ik:'purchase'},
  autre:            {l:'Autre',           c:C.text3,  ik:'list'},
};

const Av = ({name='?',size=32,color=C.navy}) => (
  <div style={{width:size,height:size,borderRadius:'50%',background:color,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:size*0.35,flexShrink:0}}>
    {(name||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
  </div>
);

const StatusBadge = ({status,n1,n2,dg}) => {
  if(status==='approved'||status==='paid') return <span style={{padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:C.greenL,color:C.green}}>Approuvé</span>;
  if(status==='rejected') return <span style={{padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:C.redL,color:C.red}}>Rejeté</span>;
  if(status==='cancelled') return <span style={{padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:C.bg2,color:C.text3}}>Annulé</span>;
  if(status==='draft') return <span style={{padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:C.bg2,color:C.text3}}>Brouillon</span>;
  if(!n1) return <span style={{padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:C.navyL,color:C.navy}}>Étape 1/3</span>;
  if(!n2) return <span style={{padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:C.blueL,color:C.blue}}>Étape 2/3</span>;
  if(!dg) return <span style={{padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:C.orangeL,color:C.orange}}>Étape 3/3</span>;
  return <span style={{padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:C.greenL,color:C.green}}>Approuvé</span>;
};

const Chain = ({a}) => {
  const steps = [
    {done:a.n1_done,active:!a.n1_done&&a.status==='pending',label:'N1'},
    {done:a.n2_done,active:a.n1_done&&!a.n2_done&&a.status==='pending',label:'N2'},
    {done:a.dg_done,active:a.n2_done&&!a.dg_done&&a.status==='pending',label:'DG'},
  ];
  if(a.status==='approved'||a.status==='paid') return (
    <div style={{display:'flex',alignItems:'center',gap:2}}>
      {[0,1,2].map(i=><div key={i} style={{width:18,height:18,borderRadius:'50%',background:C.green,border:'1.5px solid '+C.green,display:'flex',alignItems:'center',justifyContent:'center'}}><Ic d={I.check} s={10} c="#fff"/></div>)}
    </div>
  );
  if(a.status==='rejected') return <span style={{fontSize:11,color:C.red,fontWeight:600}}>Rejeté</span>;
  if(a.status==='draft') return <span style={{fontSize:11,color:C.text4}}>Brouillon</span>;
  return (
    <div style={{display:'flex',alignItems:'center',gap:2}}>
      {steps.map((s,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',gap:2}}>
          <div style={{width:18,height:18,borderRadius:'50%',border:'1.5px solid',borderColor:s.done?C.green:s.active?C.orange:C.border,background:s.done?C.green:s.active?C.orangeL:C.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
            {s.done ? <Ic d={I.check} s={10} c="#fff"/> : <span style={{fontSize:8,fontWeight:700,color:s.active?C.orange:C.text4}}>{s.label}</span>}
          </div>
          {i<2&&<div style={{width:10,height:1.5,background:s.done?C.green:C.border}}/>}
        </div>
      ))}
    </div>
  );
};

const REQUEST_TYPES = [
  {id:'achat_materiel',    l:'Achat matériel',        ic:'purchase'},
  {id:'transport',         l:'Transport équipements',  ic:'mission'},
  {id:'paiement_prestataire',l:'Paiement prestataire', ic:'payment'},
  {id:'frais_mission',     l:'Frais de mission',       ic:'expense'},
  {id:'location_engin',    l:'Location engin/véhicule',ic:'purchase'},
  {id:'frais_douane',      l:'Frais douane/transit',   ic:'report'},
  {id:'hebergement',       l:'Hébergement équipe',     ic:'leave'},
  {id:'paiement_technicien',l:'Paiement technicien',   ic:'user'},
  {id:'conge',             l:'Congé',                  ic:'leave'},
  {id:'avance_salaire',    l:'Avance sur salaire',     ic:'payment'},
  {id:'formation',         l:'Formation',              ic:'report'},
  {id:'autre',             l:'Autre dépense',          ic:'list'},
];

export default function ApprovalsMax() {
  const nav = useNavigate();
  const [section, setSection] = useState('requests'); // requests | reports | config
  const [tab, setTab] = useState('all');
  const [boardView, setBoardView] = useState('kanban'); // kanban | list
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [amtMin, setAmtMin] = useState('');
  const [amtMax, setAmtMax] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [comment, setComment] = useState('');
  const [acting, setActing] = useState(false);
  const user = JSON.parse(localStorage.getItem('cleanit_user')||localStorage.getItem('user')||'{}');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/approvals').catch(()=>({data:[]}));
      setApprovals(Array.isArray(r.data) ? r.data : []);
    } catch(e) {}
    setLoading(false);
  };

  const pending = approvals.filter(a=>['pending','submitted','review_1','review_2','draft'].includes(a.status));
  const approved = approvals.filter(a=>a.status==='approved'||a.status==='paid');
  const rejected = approvals.filter(a=>a.status==='rejected');
  const cancelled = approvals.filter(a=>a.status==='cancelled');
  const escalated = approvals.filter(a=>['pending','review_2'].includes(a.status)&&(a.n1_done||a.reviewer1Decision==='approved')&&!(a.dg_done||a.status==='approved'));

  const TABS = [
    {id:'all',     l:'Toutes',     n:approvals.length,  c:C.navy},
    {id:'pending', l:'En attente', n:pending.length,    c:C.orange},
    {id:'approved',l:'Approuvées', n:approved.length,   c:C.green},
    {id:'escalated',l:'Escalade',  n:escalated.length,  c:C.red},
    {id:'cancelled',l:'Annulées',  n:cancelled.length,  c:C.text3},
  ];

  const filtered = approvals.filter(a => {
    const n1 = a.n1_done||a.reviewer1Decision==='approved';
    const n2 = a.n2_done||a.reviewer2Decision==='approved';
    const dg = a.dg_done||['approved','paid'].includes(a.status);
    const isPending = ['pending','submitted','review_1','review_2','draft'].includes(a.status);
    const isApproved = ['approved','paid'].includes(a.status);
    const byTab = tab==='all'||
      (tab==='pending'&&isPending)||
      (tab==='approved'&&isApproved)||
      (tab==='escalated'&&isPending&&n1&&!dg)||
      (tab==='cancelled'&&(a.status==='cancelled'||a.status==='rejected'));
    const bySearch = !search||
      (a.label||'').toLowerCase().includes(search.toLowerCase())||
      (a.user_name||'').toLowerCase().includes(search.toLowerCase())||
      (a.id||'').toString().includes(search);
    const byType = !filterType||(a.type||'')=== filterType;
    const byMin = !amtMin||(a.amount||0)>=Number(amtMin);
    const byMax = !amtMax||(a.amount||0)<=Number(amtMax);
    const byFrom = !dateFrom||new Date(a.created_at)>=new Date(dateFrom);
    const byTo = !dateTo||new Date(a.created_at)<=new Date(dateTo+'T23:59:59');
    return byTab&&bySearch&&byType&&byMin&&byMax&&byFrom&&byTo;
  });

  const doAction = async (id, action) => {
    if(action==='reject'&&!comment.trim()){
      alert('Un commentaire est obligatoire pour rejeter une demande.');
      return;
    }
    setActing(true);
    try {
      await api.put('/approvals/'+id, {action, comment});
      setComment('');
      load();
      if(selected?.id===id) setSelected(null);
    } catch(e) {}
    setActing(false);
  };

  const typeInfo = t => TYPES[t]||TYPES.autre;

  // ── SIDEBAR VERTICALE (collapsible au survol, style ApprovalMax) ──
  // ── BARRE DE NAVIGATION HORIZONTALE (ne gêne plus la sidebar globale) ──
  const TopNav = () => (
    <div style={{background:C.navyD}}>
      <div style={{display:'flex',alignItems:'center',padding:'0 20px',height:46,gap:6}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginRight:16,flexShrink:0}}>
          <div style={{width:24,height:24,borderRadius:6,background:'rgba(255,255,255,0.18)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Ic d={I.check} s={13} c="#fff"/>
          </div>
          <span style={{fontSize:12.5,fontWeight:700,color:'#fff',whiteSpace:'nowrap'}}>CleanIT <span style={{opacity:.65,fontWeight:400}}>Approvals</span></span>
        </div>

        <div style={{display:'flex',gap:2}}>
          {[
            {id:'requests', l:'Demandes',     ic:I.list},
            {id:'reports',  l:'Rapports',     ic:I.report},
            {id:'audit',    l:'Audit Trail',  ic:I.audit},
            {id:'config',   l:'Configuration',ic:I.settings},
          ].map(s=>(
            <button key={s.id} onClick={()=>{setSection(s.id);setSelected(null);}} style={{
              display:'flex', alignItems:'center', gap:6, padding:'7px 12px', border:'none', borderRadius:7,
              background:section===s.id?'rgba(255,255,255,0.14)':'transparent',
              color:section===s.id?'#fff':'rgba(255,255,255,0.6)',
              fontSize:12, fontWeight:section===s.id?600:400, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
            }}>
              <Ic d={s.ic} s={13} c={section===s.id?'#fff':'rgba(255,255,255,0.55)'}/>
              {s.l}
            </button>
          ))}
        </div>

        <div style={{flex:1}}/>

        <button onClick={()=>setShowNew(true)} style={{
          display:'flex', alignItems:'center', gap:6, padding:'7px 14px',
          background:'#fff', border:'none', borderRadius:7, color:C.navyD, fontSize:12,
          fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap', flexShrink:0,
        }}>
          <Ic d={I.plus} s={13} c={C.navyD}/> Nouvelle demande
        </button>
      </div>

      {section==='requests' && (
        <div style={{display:'flex',alignItems:'center',gap:14,padding:'0 20px 10px',overflowX:'auto'}}>
          <div style={{display:'flex',gap:2,flexShrink:0}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                display:'flex',alignItems:'center',gap:5,padding:'5px 10px',border:'none',borderRadius:6,
                background:tab===t.id?'rgba(255,255,255,0.14)':'transparent',
                color:tab===t.id?'#fff':'rgba(255,255,255,0.55)',
                fontSize:11.5,fontWeight:tab===t.id?600:400,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',
              }}>
                {t.l}
                {t.n>0 && <span style={{fontSize:9.5,fontWeight:700,padding:'1px 6px',borderRadius:10,background:tab===t.id?'rgba(255,255,255,0.2)':'rgba(255,255,255,0.1)',color:'#fff'}}>{t.n}</span>}
              </button>
            ))}
          </div>

          <div style={{width:1,height:18,background:'rgba(255,255,255,0.15)',flexShrink:0}}/>

          <div style={{display:'flex',gap:2,overflowX:'auto'}}>
            {Object.entries(TYPES).map(([id,t])=>{
              const count = approvals.filter(a=>a.type===id).length;
              if(count===0) return null;
              return (
                <button key={id} onClick={()=>setFilterType(filterType===id?'':id)} style={{
                  display:'flex',alignItems:'center',gap:5,padding:'5px 10px',border:'none',borderRadius:6,
                  background:filterType===id?'rgba(255,255,255,0.14)':'transparent',
                  color:filterType===id?'#fff':'rgba(255,255,255,0.5)',
                  fontSize:11,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',
                }}>
                  <Ic d={I[t.ik]} s={11} c={filterType===id?'#fff':'rgba(255,255,255,0.4)'}/>
                  {t.l} <span style={{opacity:.6}}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // ── TOPBAR (barre fine au-dessus du contenu, vue toggle Liste/Kanban) ──
  const TopBar = () => (
    <div style={{background:C.white,boxShadow:C.shadow,position:'sticky',top:0,zIndex:200,padding:'10px 24px',display:'flex',alignItems:'center',gap:12}}>
      <span style={{fontSize:15,fontWeight:700,color:C.text}}>
        {section==='requests'?'Demandes':section==='reports'?'Rapports':section==='audit'?'Audit Trail':'Configuration'}
      </span>
      <div style={{flex:1}}/>
      {section==='requests' && (
        <div style={{display:'flex',border:'1px solid '+C.border,borderRadius:7,overflow:'hidden'}}>
          <button onClick={()=>setBoardView('kanban')} style={{display:'flex',alignItems:'center',gap:5,padding:'6px 12px',border:'none',borderRight:'1px solid '+C.border,background:boardView==='kanban'?C.navy:C.white,color:boardView==='kanban'?'#fff':C.text3,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
            <Ic d={I.grid} s={12} c={boardView==='kanban'?'#fff':C.text3}/> Kanban
          </button>
          <button onClick={()=>setBoardView('list')} style={{display:'flex',alignItems:'center',gap:5,padding:'6px 12px',border:'none',background:boardView==='list'?C.navy:C.white,color:boardView==='list'?'#fff':C.text3,fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
            <Ic d={I.list} s={12} c={boardView==='list'?'#fff':C.text3}/> Liste
          </button>
        </div>
      )}
    </div>
  );

  // ── KPI CARDS ─────────────────────────────────────────────
  const KpiCard = ({label,value,color,icon,sub}) => (
    <div style={{background:C.white,border:'1px solid '+C.border,borderLeft:'3px solid '+color,borderRadius:8,padding:'14px 16px',boxShadow:C.shadow}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
        <span style={{fontSize:11,color:C.text3,textTransform:'uppercase',letterSpacing:.4,fontWeight:600}}>{label}</span>
        <div style={{width:26,height:26,borderRadius:6,background:color+'18',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Ic d={I[icon]} s={13} c={color}/>
        </div>
      </div>
      <div style={{fontSize:24,fontWeight:700,color}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:C.text3,marginTop:3}}>{sub}</div>}
    </div>
  );

  // ── FILTRES ────────────────────────────────────────────────
  const FilterBar = () => (
    <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap'}}>
      <div style={{flex:2,minWidth:200,display:'flex',alignItems:'center',gap:8,background:C.white,border:'1px solid '+C.border,borderRadius:6,padding:'7px 12px'}}>
        <Ic d={I.search} s={14} c={C.text4}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par titre, demandeur, référence..."
          style={{flex:1,border:'none',outline:'none',fontSize:12,fontFamily:'inherit',color:C.text,background:'transparent'}}/>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:6,background:C.white,border:'1px solid '+C.border,borderRadius:6,padding:'7px 10px'}}>
        <Ic d={I.filter} s={13} c={C.text3}/>
        <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{border:'none',outline:'none',fontSize:12,fontFamily:'inherit',color:C.text,background:'transparent',cursor:'pointer'}}>
          <option value="">Tous types</option>
          {Object.entries(TYPES).map(([k,v])=><option key={k} value={k}>{v.l}</option>)}
        </select>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:4,background:C.white,border:'1px solid '+C.border,borderRadius:6,padding:'7px 10px'}}>
        <span style={{fontSize:11,color:C.text3,whiteSpace:'nowrap'}}>Montant</span>
        <input value={amtMin} onChange={e=>setAmtMin(e.target.value)} placeholder="Min" style={{width:55,border:'none',outline:'none',fontSize:11,fontFamily:'inherit',color:C.text,background:'transparent'}}/>
        <span style={{color:C.text4}}>—</span>
        <input value={amtMax} onChange={e=>setAmtMax(e.target.value)} placeholder="Max" style={{width:55,border:'none',outline:'none',fontSize:11,fontFamily:'inherit',color:C.text,background:'transparent'}}/>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:4,background:C.white,border:'1px solid '+C.border,borderRadius:6,padding:'7px 10px'}}>
        <span style={{fontSize:11,color:C.text3}}>Du</span>
        <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{border:'none',outline:'none',fontSize:11,fontFamily:'inherit',color:C.text,background:'transparent'}}/>
        <span style={{fontSize:11,color:C.text3}}>Au</span>
        <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} style={{border:'none',outline:'none',fontSize:11,fontFamily:'inherit',color:C.text,background:'transparent'}}/>
      </div>
      <button style={{display:'flex',alignItems:'center',gap:5,padding:'7px 12px',border:'1px solid '+C.border,borderRadius:6,background:C.white,cursor:'pointer',fontSize:12,color:C.text3,fontFamily:'inherit'}}>
        <Ic d={I.download} s={13} c={C.text3}/> Export
      </button>
    </div>
  );

  // ── VUE KANBAN (style ApprovalMax) ──────────────────────────
  const KANBAN_COLUMNS = [
    {id:'draft',     l:'Brouillon',       c:C.text3,  filter:a=>a.status==='draft'},
    {id:'n1',        l:'Étape 1 — N1',    c:C.navy,   filter:a=>['pending','submitted','review_1'].includes(a.status)&&!a.n1_done},
    {id:'n2',        l:'Étape 2 — N2',    c:C.blue,   filter:a=>['pending','review_2'].includes(a.status)&&a.n1_done&&!a.n2_done},
    {id:'dg',        l:'Étape 3 — DG',    c:C.orange, filter:a=>a.status==='pending'&&a.n2_done&&!a.dg_done},
    {id:'approved',  l:'Approuvées',      c:C.green,  filter:a=>['approved','paid'].includes(a.status)},
    {id:'rejected',  l:'Rejetées',        c:C.red,    filter:a=>['rejected','cancelled'].includes(a.status)},
  ];

  const KanbanCard = ({a}) => {
    const tp = typeInfo(a.type);
    return (
      <div onClick={()=>setSelected(a)} style={{
        background:C.white,border:'1px solid '+C.border,borderRadius:8,padding:'12px 13px',marginBottom:8,
        cursor:'pointer',boxShadow:C.shadow,
      }}
        onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 10px rgba(0,0,0,0.1)'}
        onMouseLeave={e=>e.currentTarget.style.boxShadow=C.shadow}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:7}}>
          <span style={{fontSize:11,fontWeight:700,color:C.navy,fontFamily:'monospace'}}>#{String(a.id).padStart(4,'0')}</span>
          <div style={{width:20,height:20,borderRadius:5,background:tp.c+'18',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Ic d={I[tp.ik]} s={11} c={tp.c}/>
          </div>
        </div>
        <div style={{fontSize:12.5,fontWeight:600,color:C.text,marginBottom:6,lineHeight:1.3,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
          {a.label||a.detail||tp.l}
        </div>
        {a.amount>0 && (
          <div style={{fontSize:13,fontWeight:700,color:tp.c,marginBottom:8}}>{fN(a.amount)} F</div>
        )}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:5}}>
            <Av name={a.user_name||a.submitted_by||'?'} size={20} color={C.navy}/>
            <span style={{fontSize:10.5,color:C.text3}}>{(a.user_name||'').split(' ')[0]||'—'}</span>
          </div>
          <span style={{fontSize:10,color:C.text4}}>{fD(a.created_at)}</span>
        </div>
        {a.status==='pending' && (
          <div style={{display:'flex',gap:5,marginTop:9}} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>doAction(a.id,'approve')} style={{flex:1,padding:'5px',background:C.greenL,color:C.green,border:'none',borderRadius:5,fontSize:10.5,fontWeight:700,cursor:'pointer'}}>
              Approuver
            </button>
            <button onClick={()=>{const c=prompt('Motif du refus (obligatoire) :');if(c){setComment(c);doAction(a.id,'reject');}}} style={{flex:1,padding:'5px',background:C.redL,color:C.red,border:'none',borderRadius:5,fontSize:10.5,fontWeight:700,cursor:'pointer'}}>
              Rejeter
            </button>
          </div>
        )}
      </div>
    );
  };

  const KanbanView = () => (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
        <KpiCard label="Total" value={approvals.length} color={C.navy} icon="list"/>
        <KpiCard label="En attente" value={pending.length} color={C.orange} icon="clock" sub={escalated.length>0?escalated.length+' en escalade':''}/>
        <KpiCard label="Approuvées" value={approved.length} color={C.green} icon="check" sub={fN(approved.reduce((s,a)=>s+(a.amount||0),0))+' F'}/>
        <KpiCard label="Rejetées" value={rejected.length} color={C.red} icon="x"/>
      </div>
      <FilterBar/>
      <div style={{display:'flex',gap:12,overflowX:'auto',paddingBottom:8,alignItems:'flex-start'}}>
        {KANBAN_COLUMNS.map(col=>{
          const items = filtered.filter(col.filter);
          return (
            <div key={col.id} style={{minWidth:230,flex:'0 0 230px',background:C.bg2,borderRadius:10,padding:10}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10,padding:'2px 4px'}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <div style={{width:8,height:8,borderRadius:4,background:col.c}}/>
                  <span style={{fontSize:11.5,fontWeight:700,color:C.text2}}>{col.l}</span>
                </div>
                <span style={{fontSize:10,fontWeight:700,color:C.text3,background:C.white,padding:'1px 7px',borderRadius:10}}>{items.length}</span>
              </div>
              <div style={{minHeight:60,maxHeight:'calc(100vh - 320px)',overflowY:'auto'}}>
                {items.length===0 ? (
                  <div style={{padding:'20px 8px',textAlign:'center',color:C.text4,fontSize:11}}>Aucune demande</div>
                ) : items.map(a=><KanbanCard key={a.id} a={a}/>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── LISTE TABLE ────────────────────────────────────────────
  const ListeView = () => (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
        <KpiCard label="Total" value={approvals.length} color={C.navy} icon="list"/>
        <KpiCard label="En attente" value={pending.length} color={C.orange} icon="clock" sub={escalated.length>0?escalated.length+' en escalade':''}/>
        <KpiCard label="Approuvées" value={approved.length} color={C.green} icon="check" sub={fN(approved.reduce((s,a)=>s+(a.amount||0),0))+' F'}/>
        <KpiCard label="Rejetées" value={rejected.length} color={C.red} icon="x"/>
      </div>
      <FilterBar/>
      <div style={{background:C.white,border:'1px solid '+C.border,borderRadius:8,overflow:'hidden',boxShadow:C.shadow}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:C.bg}}>
              {['Référence','Type','Demandeur','Montant','Date','Chaîne','Statut','Actions'].map(h=>(
                <th key={h} style={{padding:'9px 12px',textAlign:'left',fontSize:10,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:.5,borderBottom:'1px solid '+C.border}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length===0
              ? <tr><td colSpan={8} style={{padding:'40px',textAlign:'center',color:C.text4,fontSize:13}}>Aucune demande</td></tr>
              : filtered.map((a,i)=>{
                  const tp = typeInfo(a.type);
                  return (
                    <tr key={i} style={{borderBottom:'0.5px solid '+C.border2,cursor:'pointer'}}
                      onClick={()=>setSelected(a)}
                      onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'11px 12px'}}>
                        <span style={{fontSize:12,fontWeight:600,color:C.navy,fontFamily:'monospace'}}>#{String(a.id).padStart(4,'0')}</span>
                        <div style={{fontSize:11,color:C.text3,marginTop:1,maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.label||a.detail||'—'}</div>
                      </td>
                      <td style={{padding:'11px 12px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:5}}>
                          <div style={{width:22,height:22,borderRadius:4,background:tp.c+'18',display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <Ic d={I[tp.ik]} s={12} c={tp.c}/>
                          </div>
                          <span style={{fontSize:12,color:C.text2}}>{tp.l}</span>
                        </div>
                      </td>
                      <td style={{padding:'11px 12px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:6}}>
                          <Av name={a.user_name||a.submitted_by||'?'} size={24} color={C.navy}/>
                          <span style={{fontSize:12,color:C.text2}}>{a.user_name||a.submitted_by||'—'}</span>
                        </div>
                      </td>
                      <td style={{padding:'11px 12px',fontSize:12,fontWeight:700,color:a.amount>0?tp.c:C.text4,whiteSpace:'nowrap'}}>
                        {a.amount>0?fN(a.amount)+' F':'—'}
                      </td>
                      <td style={{padding:'11px 12px',fontSize:12,color:C.text3}}>{fD(a.created_at)}</td>
                      <td style={{padding:'11px 12px'}}><Chain a={a}/></td>
                      <td style={{padding:'11px 12px'}}><StatusBadge status={a.status} n1={a.n1_done} n2={a.n2_done} dg={a.dg_done}/></td>
                      <td style={{padding:'11px 12px'}} onClick={e=>e.stopPropagation()}>
                        <div style={{display:'flex',gap:4}}>
                          <button onClick={()=>setSelected(a)} style={{padding:'4px 8px',background:C.navyL,color:C.navy,border:'none',borderRadius:4,fontSize:11,fontWeight:600,cursor:'pointer'}}>Voir</button>
                          {a.status==='pending'&&<>
                            <button onClick={()=>doAction(a.id,'approve')} style={{padding:'4px 8px',background:C.greenL,color:C.green,border:'none',borderRadius:4,fontSize:11,fontWeight:700,cursor:'pointer'}}><Ic d={I.check} s={11} c={C.green}/></button>
                            <button onClick={()=>{const c=prompt('Motif du refus (obligatoire) :');if(c){setComment(c);doAction(a.id,'reject');}}} style={{padding:'4px 8px',background:C.redL,color:C.red,border:'none',borderRadius:4,fontSize:11,fontWeight:700,cursor:'pointer'}}><Ic d={I.x} s={11} c={C.red}/></button>
                          </>}
                        </div>
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
        <div style={{padding:'10px 14px',borderTop:'1px solid '+C.border2,background:C.bg,display:'flex',gap:20}}>
          <span style={{fontSize:12,fontWeight:600,color:C.text}}>TOTAL — {filtered.length} demande(s)</span>
          <span style={{fontSize:12,color:C.green,fontWeight:600,marginLeft:'auto'}}>{fN(filtered.filter(a=>a.status==='approved'||a.status==='paid').reduce((s,a)=>s+(a.amount||0),0))} F approuvés</span>
          <span style={{fontSize:12,color:C.orange,fontWeight:600}}>{fN(filtered.filter(a=>a.status==='pending').reduce((s,a)=>s+(a.amount||0),0))} F en attente</span>
        </div>
      </div>
    </div>
  );

  // ── DETAIL ─────────────────────────────────────────────────
  const DetailView = ({a}) => {
    if(!a) return null;
    const tp = typeInfo(a.type);
    const steps = [
      {l:'Responsable direct (N1)', done:a.n1_done, by:a.n1_by, at:a.n1_at, dec:a.n1_decision, comment:a.n1_comment, active:!a.n1_done&&a.status==='pending'},
      {l:'Project Manager (N2)',    done:a.n2_done, by:a.n2_by, at:a.n2_at, dec:a.n2_decision, comment:a.n2_comment, active:a.n1_done&&!a.n2_done&&a.status==='pending'},
      {l:'Direction Générale (DG)', done:a.dg_done, by:a.dg_by, at:a.dg_at, dec:a.dg_decision, comment:a.dg_comment, active:a.n2_done&&!a.dg_done&&a.status==='pending'},
    ];
    const hist = Array.isArray(a.history) ? a.history : (typeof a.history==='string'?JSON.parse(a.history||'[]'):[]);
    return (
      <div>
        <button onClick={()=>setSelected(null)} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 12px',background:C.white,border:'1px solid '+C.border,borderRadius:6,cursor:'pointer',fontSize:12,color:C.text2,fontFamily:'inherit',marginBottom:16}}>
          <Ic d={I.back} s={13} c={C.text2}/> Retour à la liste
        </button>
        <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:16}}>
          <div>
            {/* Infos principales */}
            <div style={{background:C.white,border:'1px solid '+C.border,borderRadius:8,padding:'20px',marginBottom:12,boxShadow:C.shadow}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:16}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:44,height:44,borderRadius:10,background:tp.c+'18',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Ic d={I[tp.ik]} s={22} c={tp.c}/>
                  </div>
                  <div>
                    <div style={{fontSize:16,fontWeight:700,color:C.text}}>{a.label||a.detail||tp.l}</div>
                    <div style={{fontSize:12,color:C.text3,marginTop:2}}>Réf. #{String(a.id).padStart(4,'0')} · {fD(a.created_at)}</div>
                  </div>
                </div>
                <StatusBadge status={a.status} n1={a.n1_done} n2={a.n2_done} dg={a.dg_done}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:16}}>
                {[
                  ['Demandeur', a.user_name||a.submitted_by||'—'],
                  ['Type', tp.l],
                  ['Montant', a.amount>0?fN(a.amount)+' F':'—'],
                  ['Site', a.site_code||'—'],
                  ['Projet', a.project_code||'—'],
                  ['Bénéficiaire', a.beneficiary_name||'—'],
                ].map(([k,v])=>(
                  <div key={k} style={{background:C.bg,borderRadius:6,padding:'8px 12px'}}>
                    <div style={{fontSize:10,color:C.text3,textTransform:'uppercase',letterSpacing:.3,marginBottom:2}}>{k}</div>
                    <div style={{fontSize:13,fontWeight:600,color:C.text}}>{v}</div>
                  </div>
                ))}
              </div>
              {a.justification&&(
                <div style={{background:C.bg,borderRadius:6,padding:'10px 12px',marginBottom:16}}>
                  <div style={{fontSize:10,color:C.text3,textTransform:'uppercase',letterSpacing:.3,marginBottom:4}}>Justification</div>
                  <div style={{fontSize:13,color:C.text2,lineHeight:1.5}}>{a.justification}</div>
                </div>
              )}
              {a.status==='pending'&&(
                <div style={{borderTop:'1px solid '+C.border,paddingTop:16}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:8}}>Commentaire</div>
                  <textarea value={comment} onChange={e=>setComment(e.target.value)}
                    placeholder="Ajouter un commentaire (obligatoire pour rejeter)..." rows={3}
                    style={{width:'100%',padding:'10px',border:'1px solid '+C.border,borderRadius:6,fontSize:13,resize:'vertical',outline:'none',boxSizing:'border-box',fontFamily:'inherit',marginBottom:12}}/>
                  <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                    <button onClick={()=>doAction(a.id,'reject')} disabled={acting} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 18px',background:C.redL,color:C.red,border:'1px solid '+C.red,borderRadius:6,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
                      <Ic d={I.x} s={14} c={C.red}/> Rejeter
                    </button>
                    <button onClick={()=>doAction(a.id,'approve')} disabled={acting} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 18px',background:C.navy,color:'#fff',border:'none',borderRadius:6,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
                      <Ic d={I.check} s={14} c="#fff"/> Approuver
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Audit trail */}
            <div style={{background:C.white,border:'1px solid '+C.border,borderRadius:8,padding:'16px',boxShadow:C.shadow}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12,display:'flex',alignItems:'center',gap:6}}>
                <Ic d={I.audit} s={15} c={C.navy}/> Audit Trail
              </div>
              {hist.length===0
                ? <div style={{fontSize:12,color:C.text4,textAlign:'center',padding:'16px'}}>Aucun événement</div>
                : hist.map((h,i)=>(
                  <div key={i} style={{display:'flex',gap:10,padding:'10px 0',borderBottom:i<hist.length-1?'0.5px solid '+C.border2:'none'}}>
                    <Av name={h.by||'?'} size={28} color={C.navy}/>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',justifyContent:'space-between'}}>
                        <span style={{fontSize:12,fontWeight:600,color:C.text}}>{h.action}</span>
                        <span style={{fontSize:11,color:C.text4}}>{fDT(h.at)}</span>
                      </div>
                      <div style={{fontSize:11,color:C.text3}}>par <strong>{h.by}</strong></div>
                      {h.comment&&<div style={{fontSize:11,color:C.text2,fontStyle:'italic',marginTop:4,padding:'4px 8px',background:C.bg,borderRadius:4,borderLeft:'2px solid '+C.border}}>{h.comment}</div>}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
          {/* Chaîne d'approbation */}
          <div>
            <div style={{background:C.white,border:'1px solid '+C.border,borderRadius:8,padding:'16px',boxShadow:C.shadow}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14,display:'flex',alignItems:'center',gap:6}}>
                <Ic d={I.list} s={15} c={C.navy}/> Chaîne d'approbation
              </div>
              {steps.map((s,i)=>(
                <div key={i} style={{position:'relative',paddingLeft:36,marginBottom:i<steps.length-1?20:0}}>
                  <div style={{position:'absolute',left:0,top:0,width:26,height:26,borderRadius:'50%',border:'2px solid',borderColor:s.done?C.green:s.active?C.orange:C.border,background:s.done?C.green:s.active?C.orangeL:C.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {s.done
                      ? <Ic d={I.check} s={12} c="#fff"/>
                      : <span style={{fontSize:9,fontWeight:700,color:s.active?C.orange:C.text4}}>{i+1}</span>}
                  </div>
                  {i<steps.length-1&&<div style={{position:'absolute',left:12,top:28,width:2,height:20,background:s.done?C.green:C.border}}/>}
                  <div style={{paddingBottom:4}}>
                    <div style={{fontSize:12,fontWeight:600,color:s.done?C.green:s.active?C.orange:C.text3}}>{s.l}</div>
                    <div style={{fontSize:11,color:C.text4}}>{s.done?'Validé le '+fD(s.at)+' par '+(s.by||'—'):s.active?'En attente de validation':'En attente'}</div>
                    {s.comment&&<div style={{fontSize:11,color:C.text2,fontStyle:'italic',marginTop:3,padding:'3px 8px',background:C.bg,borderRadius:4}}>{s.comment}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── RAPPORTS ───────────────────────────────────────────────
  const ReportsView = () => {
    const byType = Object.entries(REQUEST_TYPES).map(([k,v])=>({
      type:v.l, count:approvals.filter(a=>a.type===k||a.request_type===k).length,
      amount:approvals.filter(a=>(a.type===k||a.request_type===k)&&['approved','paid'].includes(a.status)).reduce((s,a)=>s+Number(a.amount||0),0),
      color:v.c
    })).filter(x=>x.count>0).sort((a,b)=>b.count-a.count);
    const total = approvals.length||1;
    const totalAmt = approvals.filter(a=>['approved','paid'].includes(a.status)).reduce((s,a)=>s+Number(a.amount||0),0);
    const tauxAppro = Math.round(approved.length/total*100);
    const exportXLSX = () => {
      const headers=['Référence','Type','Demandeur','Montant FCFA','Site Code','Statut','Date'];
      const data=approvals.map(a=>[a.reference||a.id,a.type||a.request_type||'—',a.user_name||a.submittedBy||'—',a.amount||0,a.siteCode||a.duid||'—',a.status||'—',a.createdAt?new Date(a.createdAt).toLocaleDateString('fr-FR'):'—']);
      const statusColor={'approved':'FF2E7D32','paid':'FF2E7D32','pending':'FFD04A00','rejected':'FFC50F1F','draft':'FF6B7280'};
      let xml='<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:x="urn:schemas-microsoft-com:office:excel"><Styles>';
      xml+='<Style ss:ID="header"><Alignment ss:Horizontal="Center"/><Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="11"/><Interior ss:Color="#0A2D6E" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2"/></Borders></Style>';
      xml+='<Style ss:ID="approved"><Interior ss:Color="#E8F5E9" ss:Pattern="Solid"/><Font ss:Color="#2E7D32"/></Style>';
      xml+='<Style ss:ID="pending"><Interior ss:Color="#FEF3E8" ss:Pattern="Solid"/><Font ss:Color="#D04A00"/></Style>';
      xml+='<Style ss:ID="rejected"><Interior ss:Color="#FEECEC" ss:Pattern="Solid"/><Font ss:Color="#C50F1F"/></Style>';
      xml+='<Style ss:ID="even"><Interior ss:Color="#F0F2F5" ss:Pattern="Solid"/></Style>';
      xml+='<Style ss:ID="amount"><NumberFormat ss:Format="#,##0"/><Font ss:Bold="1" ss:Color="#0A2D6E"/></Style>';
      xml+='</Styles><Worksheet ss:Name="Approvals CleanIT"><Table ss:DefaultColumnWidth="120">';
      xml+='<Column ss:Width="130"/><Column ss:Width="120"/><Column ss:Width="130"/><Column ss:Width="100"/><Column ss:Width="150"/><Column ss:Width="90"/><Column ss:Width="110"/>';
      xml+='<Row ss:Height="22">'+headers.map(h=>`<Cell ss:StyleID="header"><Data ss:Type="String">${h}</Data></Cell>`).join('')+'</Row>';
      data.forEach((row,i)=>{
        const st=approvals[i]?.status||'';
        const rowStyle=st==='approved'||st==='paid'?'approved':st==='pending'?'pending':st==='rejected'?'rejected':i%2===0?'even':'';
        xml+='<Row ss:Height="18">'+row.map((v,ci)=>{
          const style=ci===3?'amount':rowStyle;
          const type=ci===3?'Number':'String';
          return `<Cell${style?` ss:StyleID="${style}"`:''} ><Data ss:Type="${type}">${String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</Data></Cell>`;
        }).join('')+'</Row>';
      });
      xml+='</Table></Worksheet></Workbook>';
      const el=document.createElement('a');el.href='data:application/vnd.ms-excel;charset=utf-8,﻿'+encodeURIComponent(xml);el.download='approvals_export.xls';el.click();
    };
    return (
      <div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
          {[
            {l:'Total demandes',v:approvals.length,c:C.navy,ic:'list'},
            {l:'Taux approbation',v:tauxAppro+'%',c:tauxAppro>=70?C.green:C.orange,ic:'chart'},
            {l:'Montant approuvé',v:totalAmt.toLocaleString('fr-FR')+' F',c:C.green,ic:'payment'},
            {l:'En attente',v:pending.length,c:C.orange,ic:'clock'},
          ].map((k,i)=>(
            <div key={i} style={{background:C.white,border:'1px solid '+C.border,borderLeft:'3px solid '+k.c,borderRadius:8,padding:'12px 14px',boxShadow:C.shadow}}>
              <div style={{fontSize:10,color:C.text3,textTransform:'uppercase',marginBottom:4}}>{k.l}</div>
              <div style={{fontSize:20,fontWeight:700,color:k.c}}>{k.v}</div>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginBottom:16}}>
          <div style={{background:C.white,border:'1px solid '+C.border,borderRadius:8,padding:'16px',boxShadow:C.shadow}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>Répartition par type</div>
            {byType.length===0
              ? <div style={{color:C.text4,fontSize:13,textAlign:'center',padding:'24px'}}>Aucune donnée</div>
              : byType.map((t,i)=>(
                <div key={i} style={{marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <span style={{fontSize:12,color:C.text2}}>{t.type}</span>
                    <span style={{fontSize:12,fontWeight:600,color:t.color}}>{t.count} · {t.amount>0?t.amount.toLocaleString('fr-FR')+' F':''}</span>
                  </div>
                  <div style={{height:6,background:C.bg2,borderRadius:3}}>
                    <div style={{height:'100%',background:t.color,borderRadius:3,width:Math.round(t.count/total*100)+'%'}}/>
                  </div>
                </div>
              ))
            }
          </div>
          <div style={{background:C.white,border:'1px solid '+C.border,borderRadius:8,padding:'16px',boxShadow:C.shadow}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>Statuts</div>
            {[
              {l:'Approuvées',n:approved.length,c:C.green},
              {l:'En attente',n:pending.length,c:C.orange},
              {l:'Rejetées',n:rejected.length,c:C.red},
              {l:'Annulées',n:cancelled.length,c:C.text3},
            ].map((s,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:i<3?'0.5px solid '+C.border2:'none'}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:s.c}}/>
                  <span style={{fontSize:12,color:C.text2}}>{s.l}</span>
                </div>
                <span style={{fontSize:13,fontWeight:700,color:s.c}}>{s.n}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={exportXLSX} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',background:C.navy,color:'#fff',border:'none',borderRadius:6,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
          <Ic d={I.download} s={13} c="#fff"/> Exporter Excel
        </button>
      </div>
    );
  };
  // ── AUDIT ──────────────────────────────────────────────────
  const AuditView = () => {
    const events = approvals.flatMap(a=>(Array.isArray(a.history)?a.history:(typeof a.history==='string'?JSON.parse(a.history||'[]'):[])).map(h=>({...h,ref:'#'+String(a.id).padStart(4,'0'),type:a.type,amount:a.amount}))).sort((a,b)=>new Date(b.at)-new Date(a.at));
    return (
      <div>
        <div style={{background:C.white,border:'1px solid '+C.border,borderRadius:8,overflow:'hidden',boxShadow:C.shadow}}>
          <div style={{padding:'12px 16px',borderBottom:'1px solid '+C.border,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:13,fontWeight:700,color:C.text}}>{events.length} événements</span>
            <button onClick={()=>{
              const rows=[['Référence','Type','Demandeur','Montant FCFA','Action','Date'],...events.map(e=>[e.ref||'',e.type||'',e.by||'',e.amount||0,e.action||'',e.at?new Date(e.at).toLocaleDateString('fr-FR'):''])];
              let xml='<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles>';
              xml+='<Style ss:ID="h"><Font ss:Bold="1" ss:Color="#FFFFFF" ss:Size="11"/><Interior ss:Color="#0A2D6E" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center"/></Style>';
              xml+='<Style ss:ID="e"><Interior ss:Color="#F0F2F5" ss:Pattern="Solid"/></Style>';
              xml+='<Style ss:ID="amt"><Font ss:Bold="1" ss:Color="#0A2D6E"/><NumberFormat ss:Format="#,##0"/></Style>';
              xml+='</Styles><Worksheet ss:Name="Audit Approvals"><Table ss:DefaultColumnWidth="120">';
              xml+='<Column ss:Width="100"/><Column ss:Width="120"/><Column ss:Width="130"/><Column ss:Width="100"/><Column ss:Width="160"/><Column ss:Width="100"/>';
              xml+='<Row ss:Height="22">'+rows[0].map(h=>`<Cell ss:StyleID="h"><Data ss:Type="String">${h}</Data></Cell>`).join('')+'</Row>';
              rows.slice(1).forEach((r,i)=>{
                xml+='<Row ss:Height="18">'+r.map((v,ci)=>{
                  const st=ci===3?'amt':i%2===0?'e':'';
                  const tp=ci===3?'Number':'String';
                  return `<Cell${st?` ss:StyleID="${st}"`:''} ><Data ss:Type="${tp}">${String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</Data></Cell>`;
                }).join('')+'</Row>';
              });
              xml+='</Table></Worksheet></Workbook>';
              const a=document.createElement('a');a.href='data:application/vnd.ms-excel;charset=utf-8,﻿'+encodeURIComponent(xml);a.download='audit_approvals.xls';a.click();
            }} style={{display:'flex',alignItems:'center',gap:5,padding:'5px 10px',border:'1px solid '+C.border,borderRadius:6,background:C.white,cursor:'pointer',fontSize:12,color:C.text3,fontFamily:'inherit'}}>
              <Ic d={I.download} s={13} c={C.text3}/> Exporter Excel
            </button>
          </div>
          {events.length===0
            ? <div style={{padding:'40px',textAlign:'center',color:C.text4,fontSize:13}}>Aucun événement</div>
            : events.map((e,i)=>(
              <div key={i} style={{display:'flex',gap:12,padding:'12px 16px',borderBottom:'0.5px solid '+C.border2,alignItems:'flex-start'}}>
                <Av name={e.by||'?'} size={30} color={C.navy}/>
                <div style={{flex:1}}>
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <span style={{fontSize:12,fontWeight:600,color:C.text}}>{e.action}</span>
                    <span style={{fontSize:11,color:C.text4}}>{fDT(e.at)}</span>
                  </div>
                  <div style={{fontSize:11,color:C.text3}}>par <strong>{e.by}</strong> · <span style={{fontFamily:'monospace',color:C.navy}}>{e.ref}</span></div>
                  {e.comment&&<div style={{fontSize:11,fontStyle:'italic',color:C.text2,marginTop:3}}>{e.comment}</div>}
                </div>
                {e.amount>0&&<span style={{fontSize:12,fontWeight:700,color:C.navy,whiteSpace:'nowrap'}}>{fN(e.amount)} F</span>}
              </div>
            ))
          }
        </div>
      </div>
    );
  };

  // ── CONFIG / WORKFLOW BUILDER ──────────────────────────────
  const [workflows, setWorkflows] = React.useState([]);
  const [wfLoading, setWfLoading] = React.useState(true);

  React.useEffect(() => {
    api.get('/approval-workflows').then(r => {
      setWorkflows((r.data||[]).map(w => ({
        id: w.id, name: w.name,
        types: typeof w.types === 'string' ? JSON.parse(w.types) : (w.types||[]),
        steps: typeof w.steps === 'string' ? JSON.parse(w.steps) : (w.steps||[]),
      })));
      setWfLoading(false);
    }).catch(() => setWfLoading(false));
  }, []);

  const saveWorkflow = async (wf) => {
    try {
      if(String(wf.id).startsWith('wf-')) {
        const r = await api.post('/approval-workflows', {name:wf.name, types:wf.types, steps:wf.steps});
        setWorkflows(p => p.map(w => w.id===wf.id ? {...wf, id:r.data.id} : w));
      } else {
        await api.put('/approval-workflows/'+wf.id, {name:wf.name, types:wf.types, steps:wf.steps});
      }
    } catch(e) { console.error('Erreur sauvegarde workflow:', e); }
  };

  const deleteWorkflowRemote = async (id) => {
    if(!String(id).startsWith('wf-')) {
      try { await api.delete('/approval-workflows/'+id); } catch(e) { console.error(e); }
    }
  };
  const [editWF, setEditWF] = React.useState(null);
  const [auditDuid, setAuditDuid] = React.useState('');
  const [auditData, setAuditData] = React.useState(null);
  const [auditLoading, setAuditLoading] = React.useState(false);
  const [configTab, setConfigTab] = React.useState('workflow');

  const loadAuditDuid = async (duid) => {
    if(!duid||duid.length<3) return;
    setAuditLoading(true);
    try {
      const r = await api.get('/approvals/audit/duid/'+encodeURIComponent(duid));
      setAuditData(r.data);
    } catch(e) { setAuditData(null); }
    setAuditLoading(false);
  };

  const ROLES = [{id:'admin',l:'Admin'},{id:'project_manager',l:'Project Manager'},{id:'hr',l:'RH Manager'},{id:'dg',l:'Directeur Général'},{id:'finance',l:'Finance'}];

  const ConfigView = () => (
    <div>
      {/* Onglets config */}
      <div style={{display:'flex',gap:0,marginBottom:16,borderBottom:'1px solid '+C.border}}>
        {[{id:'workflow',l:'Workflow Builder'},{id:'audit_duid',l:'Audit par DUID'},{id:'audit_project',l:'Audit par Projet'},{id:'settings',l:'Paramètres'}].map(t=>(
          <button key={t.id} onClick={()=>setConfigTab(t.id)} style={{padding:'8px 16px',border:'none',borderBottom:configTab===t.id?'2px solid '+C.navy:'2px solid transparent',background:'transparent',color:configTab===t.id?C.navy:C.text3,fontWeight:configTab===t.id?600:400,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
            {t.l}
          </button>
        ))}
      </div>

      {/* WORKFLOW BUILDER */}
      {configTab==='workflow'&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <span style={{fontSize:13,fontWeight:700,color:C.text}}>Chaînes d'approbation configurables</span>
            <button onClick={async ()=>{
              const newWf = {id:'wf-'+Date.now(),name:'Nouveau workflow',types:[],steps:[{id:'n1',label:'Approbateur 1',role:'project_manager',amtMin:0,amtMax:null,required:true}]};
              setWorkflows(p=>[...p,newWf]);
              const r = await api.post('/approval-workflows', {name:newWf.name, types:newWf.types, steps:newWf.steps}).catch(()=>null);
              if(r?.data?.id) setWorkflows(p=>p.map(w=>w.id===newWf.id?{...w,id:r.data.id}:w));
            }}
              style={{display:'flex',alignItems:'center',gap:5,padding:'6px 12px',background:C.navy,color:'#fff',border:'none',borderRadius:6,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
              <Ic d={I.plus} s={12} c="#fff"/> Nouveau workflow
            </button>
          </div>
          {workflows.map((wf,wi)=>(
            <div key={wf.id} style={{background:C.white,border:'1px solid '+C.border,borderRadius:8,padding:'16px',marginBottom:12,boxShadow:C.shadow}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12,gap:8}}>
                <input value={wf.name} onChange={e=>setWorkflows(p=>p.map((w,i)=>i===wi?{...w,name:e.target.value}:w))}
                  style={{fontSize:13,fontWeight:700,color:C.navy,border:'none',outline:'none',background:'transparent',fontFamily:'inherit',flex:1}}/>
                <button onClick={()=>saveWorkflow(workflows[wi])}
                  style={{padding:'3px 10px',background:C.navy,color:'#fff',border:'none',borderRadius:4,fontSize:11,fontWeight:600,cursor:'pointer'}}>
                  Enregistrer
                </button>
                <button onClick={()=>{deleteWorkflowRemote(wf.id);setWorkflows(p=>p.filter((_,i)=>i!==wi));}}
                  style={{padding:'3px 8px',background:C.redL,color:C.red,border:'none',borderRadius:4,fontSize:11,cursor:'pointer'}}>
                  Supprimer
                </button>
              </div>
              {/* Types associés */}
              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,color:C.text3,textTransform:'uppercase',letterSpacing:.3,marginBottom:6}}>Types de demandes associés</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                  {REQUEST_TYPES.map(t=>(
                    <button key={t.id} onClick={()=>setWorkflows(p=>p.map((w,i)=>i===wi?{...w,types:w.types.includes(t.id)?w.types.filter(x=>x!==t.id):[...w.types,t.id]}:w))}
                      style={{padding:'3px 8px',border:'1px solid',borderColor:wf.types.includes(t.id)?C.navy:C.border,borderRadius:4,fontSize:11,cursor:'pointer',background:wf.types.includes(t.id)?C.navyL:'transparent',color:wf.types.includes(t.id)?C.navy:C.text3,fontFamily:'inherit'}}>
                      {t.l}
                    </button>
                  ))}
                </div>
              </div>
              {/* Étapes */}
              <div style={{marginBottom:8}}>
                <div style={{fontSize:11,color:C.text3,textTransform:'uppercase',letterSpacing:.3,marginBottom:8}}>Étapes d'approbation</div>
                {wf.steps.map((step,si)=>(
                  <div key={step.id} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr auto',gap:8,alignItems:'center',padding:'8px',background:C.bg,borderRadius:6,marginBottom:6}}>
                    <input value={step.label} onChange={e=>setWorkflows(p=>p.map((w,i)=>i===wi?{...w,steps:w.steps.map((s,j)=>j===si?{...s,label:e.target.value}:s)}:w))}
                      placeholder="Nom de l'étape" style={{padding:'5px 8px',border:'1px solid '+C.border,borderRadius:4,fontSize:12,fontFamily:'inherit'}}/>
                    <select value={step.role} onChange={e=>setWorkflows(p=>p.map((w,i)=>i===wi?{...w,steps:w.steps.map((s,j)=>j===si?{...s,role:e.target.value}:s)}:w))}
                      style={{padding:'5px 8px',border:'1px solid '+C.border,borderRadius:4,fontSize:12,fontFamily:'inherit'}}>
                      {ROLES.map(r=><option key={r.id} value={r.id}>{r.l}</option>)}
                    </select>
                    <div style={{display:'flex',alignItems:'center',gap:4}}>
                      <span style={{fontSize:10,color:C.text3}}>Min</span>
                      <input type="number" value={step.amtMin||0} onChange={e=>setWorkflows(p=>p.map((w,i)=>i===wi?{...w,steps:w.steps.map((s,j)=>j===si?{...s,amtMin:Number(e.target.value)}:s)}:w))}
                        style={{width:70,padding:'5px 6px',border:'1px solid '+C.border,borderRadius:4,fontSize:11,fontFamily:'inherit'}}/>
                    </div>
                    <label style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:C.text3,cursor:'pointer'}}>
                      <input type="checkbox" checked={step.required} onChange={e=>setWorkflows(p=>p.map((w,i)=>i===wi?{...w,steps:w.steps.map((s,j)=>j===si?{...s,required:e.target.checked}:s)}:w))}/>
                      Obligatoire
                    </label>
                    <button onClick={()=>setWorkflows(p=>p.map((w,i)=>i===wi?{...w,steps:w.steps.filter((_,j)=>j!==si)}:w))}
                      style={{padding:'3px 6px',background:C.redL,color:C.red,border:'none',borderRadius:4,fontSize:11,cursor:'pointer'}}>×</button>
                  </div>
                ))}
                <button onClick={()=>setWorkflows(p=>p.map((w,i)=>i===wi?{...w,steps:[...w.steps,{id:'step-'+Date.now(),label:'Nouvel approbateur',role:'project_manager',amtMin:0,amtMax:null,required:true}]}:w))}
                  style={{display:'flex',alignItems:'center',gap:5,padding:'5px 10px',border:'1px dashed '+C.border,borderRadius:6,background:'transparent',color:C.text3,fontSize:12,cursor:'pointer',fontFamily:'inherit',marginTop:4}}>
                  <Ic d={I.plus} s={12} c={C.text3}/> Ajouter étape
                </button>
              </div>
              {/* Visualisation de la chaîne */}
              <div style={{display:'flex',alignItems:'center',gap:6,padding:'8px',background:C.navyL,borderRadius:6,flexWrap:'wrap'}}>
                {wf.steps.map((s,si)=>(
                  <React.Fragment key={s.id}>
                    <div style={{padding:'4px 10px',background:C.navy,color:'#fff',borderRadius:4,fontSize:11,fontWeight:600}}>{s.label}</div>
                    {si<wf.steps.length-1&&<Ic d={I.back} s={12} c={C.navy}/>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
          <button onClick={()=>alert('Workflows sauvegardés !')}
            style={{padding:'8px 20px',background:C.navy,color:'#fff',border:'none',borderRadius:6,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
            Sauvegarder les workflows
          </button>
        </div>
      )}

      {/* AUDIT PAR DUID */}
      {configTab==='audit_duid'&&(
        <div>
          <div style={{display:'flex',gap:8,marginBottom:16,alignItems:'center'}}>
            <input value={auditDuid} onChange={e=>setAuditDuid(e.target.value)}
              placeholder="Entrez le DUID du site (ex: DLA-001)..."
              style={{flex:1,padding:'9px 12px',border:'1.5px solid '+C.navy,borderRadius:6,fontSize:13,fontFamily:'inherit',fontFamily:'monospace'}}/>
            <button onClick={()=>loadAuditDuid(auditDuid)} disabled={auditLoading}
              style={{padding:'9px 18px',background:C.navy,color:'#fff',border:'none',borderRadius:6,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
              {auditLoading?'Chargement...':'Rechercher'}
            </button>
          </div>
          {auditData&&(
            <div>
              <div style={{background:C.navyL,border:'1px solid '+C.border,borderRadius:8,padding:'14px 16px',marginBottom:12}}>
                <div style={{fontSize:14,fontWeight:700,color:C.navy}}>{auditData.site?.name||auditData.duid}</div>
                <div style={{fontSize:12,color:C.text3,marginTop:2}}>PO: {auditData.site?.poNumber||'—'} · {auditData.site?.region||''}</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginTop:12}}>
                  {[
                    {l:'Total demandes',v:auditData.summary?.total||0,c:C.navy},
                    {l:'Approuvées',v:auditData.summary?.approved||0,c:C.green},
                    {l:'En attente',v:auditData.summary?.pending||0,c:C.orange},
                    {l:'Montant engagé',v:(auditData.summary?.total_engage||0).toLocaleString('fr-FR')+' F',c:C.navy},
                  ].map((k,i)=>(
                    <div key={i} style={{background:C.white,border:'1px solid '+C.border,borderRadius:6,padding:'8px 10px',borderLeft:'3px solid '+k.c}}>
                      <div style={{fontSize:10,color:C.text3,textTransform:'uppercase',marginBottom:2}}>{k.l}</div>
                      <div style={{fontSize:16,fontWeight:700,color:k.c}}>{k.v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{background:C.white,border:'1px solid '+C.border,borderRadius:8,overflow:'hidden'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr style={{background:C.bg}}>
                    {['Référence','Type','Demandeur','Montant','Date','Statut'].map(h=>(
                      <th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:10,fontWeight:700,color:C.text3,textTransform:'uppercase',borderBottom:'1px solid '+C.border}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {(auditData.approvals||[]).length===0
                      ? <tr><td colSpan={6} style={{padding:'24px',textAlign:'center',color:C.text4}}>Aucune demande pour ce DUID</td></tr>
                      : (auditData.approvals||[]).map((a,i)=>{
                          const tp=TYPES[a.type]||TYPES.autre;
                          return (
                            <tr key={i} style={{borderBottom:'0.5px solid '+C.border2}}>
                              <td style={{padding:'10px 12px',fontSize:12,fontFamily:'monospace',color:C.navy}}>#{String(a.id).padStart(4,'0')}</td>
                              <td style={{padding:'10px 12px',fontSize:12,color:C.text2}}>{tp.l}</td>
                              <td style={{padding:'10px 12px',fontSize:12,color:C.text2}}>{a.user_name||a.submitted_by||'—'}</td>
                              <td style={{padding:'10px 12px',fontSize:12,fontWeight:700,color:a.amount>0?tp.c:C.text4}}>{a.amount>0?Number(a.amount).toLocaleString('fr-FR')+' F':'—'}</td>
                              <td style={{padding:'10px 12px',fontSize:12,color:C.text3}}>{fD(a.createdAt||a.created_at)}</td>
                              <td style={{padding:'10px 12px'}}><StatusBadge status={a.status} n1={a.n1_done} n2={a.n2_done} dg={a.dg_done}/></td>
                            </tr>
                          );
                        })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {!auditData&&!auditLoading&&<div style={{textAlign:'center',padding:'40px',color:C.text4,fontSize:13}}>Entrez un DUID pour voir l'audit du site</div>}
        </div>
      )}

      {/* AUDIT PAR PROJET */}
      {configTab==='audit_project'&&(
        <div>
          <div style={{display:'flex',gap:8,marginBottom:16,alignItems:'center'}}>
            <input placeholder="Entrez le PO Number du projet (ex: PO-2024-001)..."
              style={{flex:1,padding:'9px 12px',border:'1.5px solid '+C.navy,borderRadius:6,fontSize:13,fontFamily:'monospace'}}
              onKeyDown={async e=>{
                if(e.key==='Enter'){
                  setAuditLoading(true);
                  try{const r=await api.get('/approvals/audit/project/'+encodeURIComponent(e.target.value));setAuditData(r.data);}catch(err){}
                  setAuditLoading(false);
                }
              }}/>
            <button style={{padding:'9px 18px',background:C.navy,color:'#fff',border:'none',borderRadius:6,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
              Rechercher
            </button>
          </div>
          {auditData?.by_site&&(
            <div>
              <div style={{background:C.navyL,border:'1px solid '+C.border,borderRadius:8,padding:'14px',marginBottom:12}}>
                <div style={{fontSize:14,fontWeight:700,color:C.navy}}>Projet: {auditData.poNumber}</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginTop:10}}>
                  {[
                    {l:'Sites',v:auditData.sites_count||0,c:C.navy},
                    {l:'Total demandes',v:auditData.summary?.total||0,c:C.blue},
                    {l:'Approuvées',v:auditData.summary?.approved||0,c:C.green},
                    {l:'Montant engagé',v:(auditData.summary?.total_engage||0).toLocaleString('fr-FR')+' F',c:C.navy},
                  ].map((k,i)=>(
                    <div key={i} style={{background:C.white,border:'1px solid '+C.border,borderRadius:6,padding:'8px 10px',borderLeft:'3px solid '+k.c}}>
                      <div style={{fontSize:10,color:C.text3,textTransform:'uppercase',marginBottom:2}}>{k.l}</div>
                      <div style={{fontSize:16,fontWeight:700,color:k.c}}>{k.v}</div>
                    </div>
                  ))}
                </div>
              </div>
              {auditData.by_site.map((s,i)=>(
                <div key={i} style={{background:C.white,border:'1px solid '+C.border,borderRadius:8,padding:'14px',marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <div>
                      <span style={{fontSize:13,fontWeight:700,color:C.navy}}>{s.site?.name||s.site?.code}</span>
                      <span style={{fontSize:11,color:C.text3,marginLeft:8}}>DUID: {s.site?.duid||s.site?.code}</span>
                    </div>
                    <div style={{display:'flex',gap:12}}>
                      <span style={{fontSize:12,color:C.green,fontWeight:600}}>{Number(s.total_engage||0).toLocaleString('fr-FR')} F engagés</span>
                      <span style={{fontSize:12,color:C.orange,fontWeight:600}}>{Number(s.total_pending||0).toLocaleString('fr-FR')} F en attente</span>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:C.text3}}>{s.approvals?.length||0} demande(s)</div>
                </div>
              ))}
            </div>
          )}
          {!auditData?.by_site&&!auditLoading&&<div style={{textAlign:'center',padding:'40px',color:C.text4,fontSize:13}}>Entrez un PO Number pour voir l'audit du projet</div>}
        </div>
      )}

      {/* PARAMETRES */}
      {configTab==='settings'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div style={{background:C.white,border:'1px solid '+C.border,borderRadius:8,padding:'16px',boxShadow:C.shadow}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>Règles d'escalade</div>
            <div style={{fontSize:12,color:C.text3,marginBottom:8}}>Escalade auto si en attente depuis :</div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
              <input type="number" defaultValue={48} style={{width:70,padding:'7px',border:'1px solid '+C.border,borderRadius:6,fontSize:13,textAlign:'center'}}/>
              <span style={{fontSize:12,color:C.text3}}>heures</span>
            </div>
            <div style={{fontSize:12,color:C.text,fontWeight:600,marginBottom:8}}>Auto-approbation</div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:12,color:C.text3}}>Montant &lt;</span>
              <input type="number" defaultValue={50000} style={{width:90,padding:'7px',border:'1px solid '+C.border,borderRadius:6,fontSize:13,textAlign:'center'}}/>
              <span style={{fontSize:12,color:C.text3}}>FCFA → auto-approuvé</span>
            </div>
          </div>
          <div style={{background:C.white,border:'1px solid '+C.border,borderRadius:8,padding:'16px',boxShadow:C.shadow}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>Intégration CleanITBooks</div>
            <div style={{fontSize:12,color:C.text3,marginBottom:8,lineHeight:1.6}}>
              Quand une demande est approuvée par le dernier niveau, créer automatiquement une écriture dans CleanITBooks.
            </div>
            <label style={{display:'flex',alignItems:'center',gap:8,fontSize:12,cursor:'pointer',marginBottom:8}}>
              <input type="checkbox" defaultChecked style={{width:14,height:14}}/>
              Activer l'intégration automatique
            </label>
            <label style={{display:'flex',alignItems:'center',gap:8,fontSize:12,cursor:'pointer'}}>
              <input type="checkbox" defaultChecked style={{width:14,height:14}}/>
              Notifier le demandeur par email
            </label>
          </div>
        </div>
      )}
    </div>
  );

  // ── FORMULAIRE NOUVELLE DEMANDE ─────────────────────────────
  const [newForm, setNewForm] = useState({
    request_type:'achat_materiel', label:'', justification:'',
    amount:'', duid:'', beneficiaryName:'', beneficiaryBank:'',
    beneficiaryAccount:'', siteCode:'', projectCode:'', poNumber:''
  });
  const [duidInfo, setDuidInfo] = useState(null);
  const [duidLoading, setDuidLoading] = useState(false);



  const duidTimer = React.useRef(null);
  const loadDuid = (duid) => {
    if(duidTimer.current) clearTimeout(duidTimer.current);
    if(!duid||duid.length<3) { setDuidInfo(null); return; }
    duidTimer.current = setTimeout(async () => {
      setDuidLoading(true);
      try {
        const r = await api.get('/projects/duid/'+encodeURIComponent(duid));
        setDuidInfo(r.data);
        // Ne modifier que siteCode/projectCode, pas request_type
        setNewForm(p=>({
          ...p,
          siteCode: r.data.site?.code||duid,
          projectCode: r.data.site?.poNumber||'',
          poNumber: r.data.site?.poNumber||''
        }));
      } catch(e) { setDuidInfo(null); }
      setDuidLoading(false);
    }, 600);
  };
  const submitNew = async () => {
    if(!newForm.label.trim()) return alert('Le titre est obligatoire');
    if(!newForm.duid.trim()) return alert('Le DUID du site est obligatoire');
    try {
      await api.post('/approvals', {
        ...newForm,
        type: newForm.request_type,
        label: newForm.label,
        amount: Number(newForm.amount)||0,
        duid: newForm.duid,
      });
      setShowNew(false);
      setDuidInfo(null);
      setNewForm({request_type:'achat_materiel',label:'',justification:'',amount:'',duid:'',beneficiaryName:'',beneficiaryBank:'',beneficiaryAccount:'',siteCode:'',projectCode:'',poNumber:''});
      load();
    } catch(e) { alert('Erreur lors de la soumission'); }
  };

  const inp = {width:'100%',padding:'8px 10px',border:'1px solid '+C.border,borderRadius:6,fontSize:12,outline:'none',boxSizing:'border-box',fontFamily:'inherit',color:C.text};
  const lbl = {display:'block',fontSize:11,fontWeight:600,color:C.text3,textTransform:'uppercase',letterSpacing:.3,marginBottom:4};

  return (
    <div style={{minHeight:'100vh',background:C.bg,fontFamily:"'Inter','Helvetica Neue',Arial,sans-serif",display:'flex',flexDirection:'column'}}>
      <TopNav/>
      <div style={{flex:1,display:'flex',flexDirection:'column'}}>
        <TopBar/>
        <div style={{padding:'16px 24px',maxWidth:1400}}>
          {loading
            ? <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:12}}>
                <div style={{width:36,height:36,border:'3px solid '+C.navy,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
                <span style={{fontSize:13,color:C.text3}}>Chargement...</span>
              </div>
            : selected
              ? <DetailView a={selected}/>
              : section==='requests' ? (boardView==='kanban' ? <KanbanView/> : <ListeView/>)
              : section==='reports'  ? <ReportsView/>
              : section==='audit'    ? <AuditView/>
              : <ConfigView/>
          }
        </div>
      </div>

      {showNew&&(
        <div style={{position:'fixed',inset:0,background:'rgba(10,45,110,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div style={{background:C.white,borderRadius:10,padding:'24px',width:560,maxWidth:'90vw',boxShadow:'0 20px 60px rgba(0,0,0,0.2)',maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <span style={{fontSize:15,fontWeight:700,color:C.text}}>Nouvelle demande</span>
              <button onClick={()=>setShowNew(false)} style={{background:'none',border:'none',cursor:'pointer',color:C.text3,fontSize:20}}>×</button>
            </div>
            {/* DUID */}
            <div style={{marginBottom:14,padding:'12px',background:C.white,borderRadius:8,border:'1.5px solid '+C.navy}}>
              <label style={{...lbl,color:C.navy}}>DUID du site *</label>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <input value={newForm.duid}
                  onChange={e=>{setNewForm(p=>({...p,duid:e.target.value}));loadDuid(e.target.value);}}
                  placeholder="Ex: ON-OSN9800-DLA-001..."
                  style={{...inp,flex:1,fontFamily:'monospace',fontSize:13}}/>
                {duidLoading&&<div style={{width:18,height:18,border:'2px solid '+C.navy,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>}
              </div>
              {duidInfo&&(
                <div style={{marginTop:8,padding:'8px 10px',background:C.white,borderRadius:6,border:'1px solid '+C.border}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.navy}}>{duidInfo.site?.name||'—'}</div>
                  <div style={{fontSize:11,color:C.text3}}>PO: {duidInfo.site?.poNumber||'—'} · {duidInfo.site?.region||''} · {duidInfo.approvals_count||0} demande(s) existante(s)</div>
                </div>
              )}
              {newForm.duid&&!duidInfo&&!duidLoading&&<div style={{fontSize:11,color:C.orange,marginTop:4}}>DUID non reconnu — la demande sera quand même créée</div>}
            </div>
            {/* Type de demande */}
            <div style={{marginBottom:14}}>
              <label style={lbl}>Type de demande *</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:5}}>
                {REQUEST_TYPES.map(t=>(
                  <button key={t.id} onClick={()=>setNewForm(p=>({...p,request_type:t.id}))} style={{
                    padding:'7px 5px',border:'1.5px solid',
                    borderColor:newForm.request_type===t.id?C.navy:C.border,
                    borderRadius:6,cursor:'pointer',
                    background:newForm.request_type===t.id?C.navyL:'transparent',
                    display:'flex',flexDirection:'column',alignItems:'center',gap:3,
                  }}>
                    <Ic d={I[t.ic]} s={14} c={newForm.request_type===t.id?C.navy:C.text3}/>
                    <span style={{fontSize:9,fontWeight:600,color:newForm.request_type===t.id?C.navy:C.text3,textAlign:'center',lineHeight:1.2}}>{t.l}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:12}}><label style={lbl}>Titre / Objet *</label><input value={newForm.label} onChange={e=>setNewForm(p=>({...p,label:e.target.value}))} placeholder="Ex: Achat 200m câble fibre G657 pour raccordement DLA-001..." style={inp}/></div>
            <div style={{marginBottom:12}}><label style={lbl}>Justification / Description</label><textarea value={newForm.justification} onChange={e=>setNewForm(p=>({...p,justification:e.target.value}))} rows={3} placeholder="Détails, quantités, références..." style={{...inp,resize:'vertical'}}/></div>

            {/* Champs montant — tous types sauf congé */}
            {newForm.request_type!=='conge'&&(
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
              <div><label style={lbl}>Montant (FCFA)</label><input type="number" value={newForm.amount} onChange={e=>setNewForm(p=>({...p,amount:e.target.value}))} placeholder="0" style={inp}/></div>
              <div><label style={lbl}>Bénéficiaire / Fournisseur</label><input value={newForm.beneficiaryName} onChange={e=>setNewForm(p=>({...p,beneficiaryName:e.target.value}))} placeholder="Nom fournisseur ou technicien" style={inp}/></div>
              {['paiement_technicien','paiement_prestataire','avance_salaire'].includes(newForm.request_type)&&<>
                <div><label style={lbl}>Banque / Opérateur *</label><input value={newForm.beneficiaryBank} onChange={e=>setNewForm(p=>({...p,beneficiaryBank:e.target.value}))} placeholder="BICEC, MTN MoMo, Orange Money..." style={inp}/></div>
                <div><label style={lbl}>N° Compte / Mobile *</label><input value={newForm.beneficiaryAccount} onChange={e=>setNewForm(p=>({...p,beneficiaryAccount:e.target.value}))} placeholder="RIB ou numéro mobile" style={inp}/></div>
              </>}
              {['achat_materiel','location_engin','frais_douane'].includes(newForm.request_type)&&<>
                <div><label style={lbl}>Fournisseur</label><input value={newForm.beneficiaryBank} onChange={e=>setNewForm(p=>({...p,beneficiaryBank:e.target.value}))} placeholder="Nom du fournisseur ou prestataire" style={inp}/></div>
                <div><label style={lbl}>Référence devis/facture</label><input value={newForm.beneficiaryAccount} onChange={e=>setNewForm(p=>({...p,beneficiaryAccount:e.target.value}))} placeholder="N° devis ou proforma" style={inp}/></div>
              </>}
              {['transport','hebergement','frais_mission'].includes(newForm.request_type)&&<>
                <div><label style={lbl}>Prestataire transport/hôtel</label><input value={newForm.beneficiaryBank} onChange={e=>setNewForm(p=>({...p,beneficiaryBank:e.target.value}))} placeholder="Nom transporteur ou hôtel" style={inp}/></div>
                <div><label style={lbl}>Destination / Trajet</label><input value={newForm.beneficiaryAccount} onChange={e=>setNewForm(p=>({...p,beneficiaryAccount:e.target.value}))} placeholder="Ex: Douala → Kribi" style={inp}/></div>
              </>}
            </div>
            )}

            {/* Champs dates — congé, formation, mission */}
            {['conge','formation','frais_mission'].includes(newForm.request_type)&&(
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
              <div><label style={lbl}>Date début *</label><input type="date" value={newForm.dateDebut||''} onChange={e=>setNewForm(p=>({...p,dateDebut:e.target.value}))} style={inp}/></div>
              <div><label style={lbl}>Date fin *</label><input type="date" value={newForm.dateFin||''} onChange={e=>setNewForm(p=>({...p,dateFin:e.target.value}))} style={inp}/></div>
              {newForm.request_type==='conge'&&<div style={{gridColumn:'span 2'}}><label style={lbl}>Type de congé</label>
                <select value={newForm.leaveType||'annuel'} onChange={e=>setNewForm(p=>({...p,leaveType:e.target.value}))} style={inp}>
                  <option value="annuel">Congé annuel</option>
                  <option value="maladie">Congé maladie</option>
                  <option value="maternite">Congé maternité</option>
                  <option value="exceptionnel">Congé exceptionnel</option>
                </select>
              </div>}
              {newForm.request_type==='formation'&&<div style={{gridColumn:'span 2'}}><label style={lbl}>Organisme de formation</label><input value={newForm.beneficiaryName} onChange={e=>setNewForm(p=>({...p,beneficiaryName:e.target.value}))} placeholder="Nom organisme ou formateur" style={inp}/></div>}
            </div>
            )}
            <div style={{display:'flex',justifyContent:'flex-end',gap:8,borderTop:'1px solid '+C.border,paddingTop:14,marginTop:4}}>
              <button onClick={()=>setShowNew(false)} style={{padding:'8px 16px',border:'1px solid '+C.border,borderRadius:6,background:C.white,cursor:'pointer',fontSize:12,fontFamily:'inherit',color:C.text}}>Annuler</button>
              <button onClick={submitNew} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 18px',background:C.navy,color:'#fff',border:'none',borderRadius:6,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
                <Ic d={I.send} s={13} c="#fff"/> Soumettre
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
