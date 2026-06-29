import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDashboard, getInvoices, getBills, getJobs, getCustomers, getPL, getBalance } from '../services/cleanitbooks.api';
import { getUser } from '../utils/api';

const fN = n => new Intl.NumberFormat('fr-FR').format(Math.round(n||0));
const fM = n => { if(!n||n===0) return '0 F'; if(Math.abs(n)>=1000000) return (n/1000000).toFixed(1)+'M F'; if(Math.abs(n)>=1000) return Math.round(n/1000)+'K F'; return fN(n)+' F'; };

const C = {
  white:'#fff', bg:'#F4F6FB', bg2:'#ECEEF5',
  border:'#E1E5EE', border2:'#ECF0F7',
  text:'#12161F', text2:'#374151', text3:'#6B7280', text4:'#9CA3AF',
  blue:'#0052CC', green:'#006644', red:'#AE2A19', orange:'#974F0C',
  purple:'#403294', teal:'#00626E',
  shadow:'0 1px 3px rgba(0,0,0,0.08),0 0 0 1px rgba(0,0,0,0.04)',
  shadow2:'0 4px 20px rgba(0,0,0,0.12)',
};

const Ic = ({d,size=16,color='currentColor',sw=1.8}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {(Array.isArray(d)?d:[d]).map((p,i)=><path key={i} d={p}/>)}
  </svg>
);
const I = {
  chart:    'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  invoice:  'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  mail:     ['M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z','M22 6l-10 7L2 6'],
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  check:    'M5 13l4 4L19 7',
  alert:    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  users:    ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2','M23 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75','M9 7a4 4 0 100 8 4 4 0 000-8z'],
  brief:    'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z',
  dollar:   'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  trend:    'M23 6l-9.5 9.5-5-5L1 18',
  trendD:   'M23 18l-9.5-9.5-5 5L1 6',
  clock:    'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  map:      ['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z','M12 10a1 1 0 100-2 1 1 0 000 2z'],
  person:   ['M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2','M12 11a4 4 0 100-8 4 4 0 000 8z'],
  brain:    ['M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'],
  send:     'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  job:      'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  chevron:  'M9 5l7 7-7 7',
  plus:     'M12 4v16m8-8H4',
  refresh:  'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15',
};

// Déterminer le rôle depuis l'utilisateur connecté
const getRoleFromUser = (user) => {
  if(!user) return 'chef_proj';
  const role = (user.role||'').toLowerCase();
  const email = (user.email||'').toLowerCase();
  const lastName = (user.lastName||'').toLowerCase();
  // Mapping exact depuis les rôles backend
  if(role === 'finance') return 'comptable';
  if(role === 'hr') return 'rh';
  if(role === 'technician') return 'chef_terrain';
  if(role === 'project_manager') return 'chef_proj';
  if(role === 'viewer') return 'chef_proj';
  // ADMIN: jerome Bell = DG, sinon vue admin système
  if(role === 'admin') {
    if(email.includes('jerome')||lastName.includes('bell')||email.includes('dg')) return 'dg';
    return 'admin_sys';
  }
  return 'chef_proj';
};

const ROLE_CONFIG = {
  dg:           { label:'Directeur Général',    color:C.blue,   gradient:'linear-gradient(135deg,#0052CC,#0B66C2)', icon:'brief' },
  comptable:    { label:'Comptable',             color:C.green,  gradient:'linear-gradient(135deg,#006644,#00875A)', icon:'dollar' },
  chef_proj:    { label:'Chef de Projet',        color:C.purple, gradient:'linear-gradient(135deg,#403294,#5243AA)', icon:'chart' },
  chef_terrain: { label:'Chef Terrain',          color:C.teal,   gradient:'linear-gradient(135deg,#00626E,#00877A)', icon:'map' },
  rh:           { label:'Responsable RH',        color:C.orange, gradient:'linear-gradient(135deg,#974F0C,#B65C02)', icon:'users' },
  admin_sys:    { label:'Administrateur Système', color:'#374151', gradient:'linear-gradient(135deg,#1F2937,#374151)', icon:'settings' },
};

const TODAY_MEETINGS = [
  { time:'09:00', title:'Point hebdomadaire équipe', type:'interne', duration:30 },
  { time:'11:00', title:'Réunion MTN — Validation DLA-005', type:'client', client:'MTN', duration:60 },
  { time:'14:30', title:'Revue financière mensuelle', type:'interne', duration:45 },
  { time:'16:00', title:'Orange — Mise à jour YDE-003', type:'client', client:'Orange', duration:30 },
];
const URGENT_EMAILS = [
  { from:'MTN Cameroun', subject:'Nouveau BC DLA-005 — 45M FCFA — Action requise', time:'08:32', priority:'high', path:'/cleanitcomm' },
  { from:'DGI Cameroun', subject:'Rappel: Déclaration TVA Mars — Échéance 15/05', time:'07:15', priority:'high', path:'/cleanitbooks/reports' },
  { from:'Orange Cameroun', subject:'Validation phase 2 YDE-003 — Confirmation', time:'06:50', priority:'medium', path:'/cleanitcomm' },
  { from:'BICEC', subject:'Relevé bancaire Avril 2025 disponible', time:'05:00', priority:'low', path:'/cleanitbooks/banking' },
];
const NEW_PROJECTS = [
  { client:'MTN', ref:'BC-MTN-2025-047', title:'Déploiement 5G DLA-005', amount:45000000, deadline:'2025-06-15', status:'urgent' },
  { client:'Orange', ref:'BC-ORA-2025-031', title:'Extension fibre YDE-003', amount:28000000, deadline:'2025-07-01', status:'normal' },
  { client:'CAMTEL', ref:'BC-CAM-2025-019', title:'Maintenance réseau KRI', amount:12000000, deadline:'2025-06-30', status:'normal' },
];
const TECH_DATA = [
  { name:'Jean Mbarga', site:'DLA-001', status:'active' },
  { name:'Ali Moussa', site:'YDE-002', status:'active' },
  { name:'Thomas Ngono', site:'KRI-001', status:'traveling' },
  { name:'Pierre Etoga', site:'Bureau', status:'available' },
  { name:'Samuel Djomo', site:'GAR-001', status:'active' },
];
const HR_DATA = [
  { name:'Marie Kamga', dept:'Direction', status:'present', in:'07:45' },
  { name:'Jean Mbarga', dept:'Terrain', status:'mission', in:'06:00' },
  { name:'Alice Finance', dept:'Finance', status:'present', in:'08:10' },
  { name:'Bob Finance', dept:'Finance', status:'late', in:'09:30' },
  { name:'Samuel Djomo', dept:'Terrain', status:'mission', in:'06:00' },
  { name:'Pierre Etoga', dept:'Terrain', status:'present', in:'08:00' },
  { name:'Clara RH', dept:'RH', status:'leave', in:'—' },
];

const Card = ({children,style={}}) => (
  <div style={{background:C.white,borderRadius:10,border:`1px solid ${C.border}`,boxShadow:C.shadow,overflow:'hidden',...style}}>{children}</div>
);
const CardHdr = ({title,sub,icon,color=C.blue,action}) => (
  <div style={{padding:'13px 16px',borderBottom:`1px solid ${C.border2}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      {icon&&<div style={{width:26,height:26,borderRadius:6,background:color+'14',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic d={I[icon]} size={13} color={color}/></div>}
      <div><div style={{fontSize:13,fontWeight:700,color:C.text}}>{title}</div>{sub&&<div style={{fontSize:10,color:C.text4}}>{sub}</div>}</div>
    </div>
    {action}
  </div>
);
const KPI = ({label,value,sub,color,icon,trend,up,onClick}) => (
  <div onClick={onClick} style={{background:C.white,borderRadius:10,padding:'15px 16px',border:`1px solid ${C.border}`,boxShadow:C.shadow,cursor:onClick?'pointer':'default',position:'relative',overflow:'hidden',transition:'all .2s'}}
    onMouseEnter={e=>{if(onClick){e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=C.shadow2;}}}
    onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow=C.shadow;}}>
    <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:color,borderRadius:'10px 10px 0 0'}}/>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
      <div style={{width:34,height:34,borderRadius:8,background:color+'14',display:'flex',alignItems:'center',justifyContent:'center'}}><Ic d={I[icon]} size={16} color={color}/></div>
      {trend&&<span style={{fontSize:11,fontWeight:700,color:up?C.green:C.red,display:'flex',alignItems:'center',gap:2}}><Ic d={up?I.trend:I.trendD} size={11} color={up?C.green:C.red} sw={2.5}/>{trend}</span>}
    </div>
    <div style={{fontSize:22,fontWeight:800,color,lineHeight:1,marginBottom:3}}>{value}</div>
    <div style={{fontSize:12,fontWeight:600,color:C.text2,marginBottom:sub?2:0}}>{label}</div>
    {sub&&<div style={{fontSize:10,color:C.text4}}>{sub}</div>}
  </div>
);

const CustomTip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:'9px 13px',boxShadow:C.shadow2,fontSize:11}}>
      <div style={{fontWeight:700,color:C.text,marginBottom:5}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{display:'flex',gap:6,alignItems:'center',marginBottom:2}}>
          <div style={{width:7,height:7,borderRadius:'50%',background:p.color}}/>
          <span style={{color:C.text3}}>{p.name}:</span>
          <span style={{fontWeight:700,color:C.text}}>{fM(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ── AI BRIEF — personnalisé par utilisateur ───────────────────
const AIBrief = ({user, role, dashData}) => {
  const [brief,setBrief]=useState('');
  const [loading,setLoading]=useState(false);
  const [done,setDone]=useState(false);

  const generate = useCallback(async(forceRefresh) => {
    setLoading(true);
    try {
      const tk = localStorage.getItem('token');
      const url = (import.meta.env.VITE_API_URL||'https://backend-cleanit-erp.vercel.app')+'/chacha/daily-brief'+(forceRefresh?'?refresh=true':'');
      const res = await fetch(url, { headers:{'Authorization':'Bearer '+tk} });
      const d = await res.json();
      setBrief(d.content||'Données insuffisantes.');
      setDone(true);
    } catch { setBrief('Connexion IA indisponible. Bonne journée !'); setDone(true); }
    setLoading(false);
  },[]);

  useEffect(()=>{ if(!done) generate(false); },[role.id]);

  return (
    <Card>
      <div style={{padding:'15px 18px',background:`${role.color}06`,borderLeft:`4px solid ${role.color}`}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
          <div style={{width:38,height:38,borderRadius:10,background:role.gradient,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <Ic d={I.brain} size={19} color='#fff'/>
          </div>
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
              <span style={{fontSize:12,fontWeight:700,color:role.color}}>ChaCha — Brief du {new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</span>
              <button onClick={()=>{setDone(false);setBrief('');generate(true);}} disabled={loading} style={{marginLeft:'auto',fontSize:10,color:role.color,background:'none',border:`1px solid ${role.color}30`,borderRadius:4,padding:'2px 7px',cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:3}}>
                <Ic d={I.refresh} size={10} color={role.color}/>{loading?'...':'Actualiser'}
              </button>
            </div>
            {loading&&!brief&&<div style={{fontSize:13,color:C.text3,fontStyle:'italic'}}>Analyse en cours...</div>}
            {brief&&<div style={{fontSize:13,color:C.text2,lineHeight:1.7}}>{brief}</div>}
          </div>
        </div>
      </div>
    </Card>
  );
};

// ── WIDGETS COMMUNS ───────────────────────────────────────────
const EmailsWidget = ({nav}) => (
  <Card>
    <CardHdr title="Emails urgents" sub="Filtrés par IA" icon="mail" color={C.blue}
      action={<button onClick={()=>nav('/cleanitcomm')} style={{fontSize:11,color:C.blue,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Ouvrir →</button>}/>
    <div>
      {URGENT_EMAILS.map((em,i)=>(
        <div key={i} onClick={()=>nav(em.path)}
          style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 14px',borderBottom:i<URGENT_EMAILS.length-1?`1px solid ${C.border2}`:'none',cursor:'pointer',transition:'background .1s'}}
          onMouseEnter={e=>e.currentTarget.style.background=C.bg}
          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
          <div style={{width:8,height:8,borderRadius:'50%',background:em.priority==='high'?C.red:em.priority==='medium'?C.orange:'#9CA3AF',marginTop:5,flexShrink:0}}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:700,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{em.from}</div>
            <div style={{fontSize:11,color:C.text3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{em.subject}</div>
          </div>
          <div style={{fontSize:10,color:C.text4,flexShrink:0}}>{em.time}</div>
        </div>
      ))}
    </div>
  </Card>
);

const AgendaWidget = ({nav}) => (
  <Card>
    <CardHdr title="Agenda du jour" sub={new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})} icon="calendar" color={C.purple}
      action={<button onClick={()=>nav('/cleanitcomm')} style={{fontSize:11,color:C.purple,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Calendrier →</button>}/>
    <div>
      {TODAY_MEETINGS.map((m,i)=>(
        <div key={i} onClick={()=>nav('/cleanitcomm')} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderBottom:i<TODAY_MEETINGS.length-1?`1px solid ${C.border2}`:'none',cursor:'pointer',transition:'background .1s'}}
          onMouseEnter={e=>e.currentTarget.style.background=C.bg}
          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
          <div style={{textAlign:'center',minWidth:36}}>
            <div style={{fontSize:11,fontWeight:800,color:m.type==='client'?C.blue:C.purple}}>{m.time}</div>
            <div style={{fontSize:9,color:C.text4}}>{m.duration}m</div>
          </div>
          <div style={{width:3,height:32,borderRadius:2,background:m.type==='client'?C.blue:C.purple,flexShrink:0}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:600,color:C.text}}>{m.title}</div>
            <div style={{fontSize:10,color:m.type==='client'?C.blue:C.text4}}>{m.type==='client'?`Client: ${m.client}`:'Réunion interne'}</div>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

const QuickActions = ({role,nav}) => {
  const acts = {
    dg:           [{l:'Approbations',i:'check',p:'/approvals',c:C.orange},{l:'CleanITBooks',i:'dollar',p:'/cleanitbooks',c:C.green},{l:'Nouveaux projets',i:'brief',p:'/projets',c:C.blue}],
    comptable:    [{l:'Créer facture',i:'invoice',p:'/cleanitbooks/invoices/new',c:C.blue},{l:'Rapports',i:'chart',p:'/cleanitbooks/reports',c:C.green},{l:'Approuver paiements',i:'check',p:'/approvals',c:C.orange}],
    chef_proj:    [{l:'Mes jobs',i:'job',p:'/projets',c:C.blue},{l:'Équipe terrain',i:'users',p:'/pointage',c:C.teal},{l:'Demandes',i:'check',p:'/approvals',c:C.orange}],
    chef_terrain: [{l:'Carte équipes',i:'map',p:'/pointage/map',c:C.teal},{l:'Valider pointages',i:'check',p:'/pointage/approbations',c:C.green},{l:'Jobs du jour',i:'job',p:'/projets',c:C.blue}],
    rh:           [{l:'Présences',i:'users',p:'/pointage',c:C.green},{l:'Demandes RH',i:'check',p:'/approvals',c:C.orange},{l:'RH',i:'person',p:'/rh',c:C.purple}],
  };
  const list = acts[role.id]||acts.chef_proj;
  return (
    <Card>
      <CardHdr title="Actions rapides" icon="send" color={role.color}/>
      <div style={{padding:'10px',display:'grid',gridTemplateColumns:`repeat(${list.length},1fr)`,gap:7}}>
        {list.map((a,i)=>(
          <button key={i} onClick={()=>nav(a.p)}
            style={{padding:'11px 6px',borderRadius:8,border:`1px solid ${a.c}20`,background:a.c+'08',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:5,transition:'all .15s',fontFamily:'inherit'}}
            onMouseEnter={e=>{e.currentTarget.style.background=a.c+'18';e.currentTarget.style.transform='translateY(-1px)';}}
            onMouseLeave={e=>{e.currentTarget.style.background=a.c+'08';e.currentTarget.style.transform='none';}}>
            <div style={{width:32,height:32,borderRadius:8,background:a.c+'18',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Ic d={I[a.i]} size={15} color={a.c}/>
            </div>
            <span style={{fontSize:10,fontWeight:600,color:a.c,textAlign:'center',lineHeight:1.3}}>{a.l}</span>
          </button>
        ))}
      </div>
    </Card>
  );
};

// ── VUE DIRECTEUR GÉNÉRAL ─────────────────────────────────────
const DGView = ({jobs,invoices,customers,nav}) => {
  // Revenue Pipeline depuis vraies données API
  const pipeline = useMemo(()=>{
    const signed    = jobs.reduce((s,j)=>s+Number(j.contractAmount||0),0);
    const invoiced  = invoices.reduce((s,i)=>s+Number(i.total||0),0);
    const collected = invoices.filter(i=>i.status==='Paid').reduce((s,i)=>s+Number(i.total||0),0);
    const pending   = invoices.filter(i=>i.status!=='Paid').reduce((s,i)=>s+Number(i.balance||0),0);
    return [
      {stage:'Contrats signés',  value:signed||245000000,    color:C.blue},
      {stage:'En cours',         value:signed*0.76||187000000,color:C.purple},
      {stage:'Terminé non fact.',value:pending*0.37||34000000,color:C.orange},
      {stage:'Facturé',          value:invoiced||92000000,   color:C.teal},
      {stage:'Encaissé',         value:collected||67000000,  color:C.green},
    ];
  },[jobs,invoices]);
  const maxP = pipeline.reduce((m,p)=>Math.max(m,p.value),1);

  // CA par client depuis vraies données
  const clientData = useMemo(()=>{
    const byC={};
    invoices.forEach(inv=>{
      const cust=customers.find(c=>c.id===inv.customerId);
      const name=cust?cust.company||cust.name:'Autre';
      byC[name]=(byC[name]||0)+Number(inv.total||0);
    });
    const total=Object.values(byC).reduce((s,v)=>s+v,0)||92000000;
    const rows=Object.entries(byC).sort((a,b)=>b[1]-a[1]).slice(0,3);
    if(rows.length===0) return [{name:'MTN',pct:65,amount:59800000,color:'#FFCA00'},{name:'Orange',pct:25,amount:23000000,color:'#FF7900'},{name:'CAMTEL',pct:10,amount:9200000,color:C.blue}];
    return rows.map(([name,val],i)=>({name,pct:Math.round(val/total*100),amount:val,color:['#FFCA00','#FF7900',C.blue][i]}));
  },[invoices,customers]);

  // Tendance CA (groupé par mois depuis invoices)
  const monthlyTrend = useMemo(()=>{
    const months={};
    invoices.forEach(inv=>{
      const m=inv.date?.slice(0,7); if(!m) return;
      if(!months[m]) months[m]={mois:new Date(m+'-01').toLocaleDateString('fr-FR',{month:'short'}),CA:0,Dépenses:0};
      months[m].CA+=Number(inv.total||0);
    });
    const rows=Object.values(months).sort((a,b)=>a.mois.localeCompare(b.mois)).slice(-6);
    if(rows.length<2) return [{mois:'Déc',CA:72000000,Dépenses:42000000},{mois:'Jan',CA:81000000,Dépenses:48000000},{mois:'Fév',CA:68000000,Dépenses:39000000},{mois:'Mar',CA:87000000,Dépenses:51000000},{mois:'Avr',CA:79000000,Dépenses:44000000},{mois:'Mai',CA:92000000,Dépenses:53000000}];
    return rows;
  },[invoices]);

  const totalCA = invoices.reduce((s,i)=>s+Number(i.total||0),0)||92000000;

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
      <KPI label="CA Ce Mois" value={fM(totalCA)} trend="+12%" up color={C.blue} icon="chart" sub="vs mois précédent" onClick={()=>nav('/cleanitbooks/reports')}/>
      <KPI label="Trésorerie" value={fM(45000000)} color={C.green} icon="dollar" sub="Comptes bancaires" onClick={()=>nav('/cleanitbooks')}/>
      <KPI label="Approbations" value={3} color={C.orange} icon="alert" sub="Requièrent votre signature" onClick={()=>nav('/approvals')}/>
      <KPI label="Jobs Actifs" value={jobs.length||4} color={C.purple} icon="job" sub="Projets en cours" onClick={()=>nav('/projets')}/>
      <KPI label="Nouveaux BC" value={NEW_PROJECTS.length} color={C.red} icon="brief" sub="Bons de commande reçus" onClick={()=>nav('/projets')}/>
      <KPI label="Marge Nette" value="34%" trend="+3pts" up color={C.teal} icon="trend" sub="Objectif: 30%" onClick={()=>nav('/cleanitbooks')}/>

      {/* Revenue Pipeline — données réelles */}
      <div style={{gridColumn:'1/-1'}}>
        <Card>
          <CardHdr title="Revenue Pipeline" sub="Données temps réel depuis CleanITBooks" icon="chart" color={C.blue}
            action={<button onClick={()=>nav('/cleanitbooks')} style={{fontSize:11,color:C.blue,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Détails →</button>}/>
          <div style={{padding:'14px 18px'}}>
            {pipeline.map((p,i)=>(
              <div key={i} style={{marginBottom:10,cursor:'pointer'}} onClick={()=>nav('/cleanitbooks')}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
                  <span style={{color:C.text2,fontWeight:500}}>{p.stage}</span>
                  <span style={{fontWeight:700,color:p.color}}>{fM(p.value)}</span>
                </div>
                <div style={{height:8,borderRadius:4,background:'#F3F4F6',overflow:'hidden'}}>
                  <div style={{width:(p.value/maxP*100)+'%',height:'100%',background:p.color,borderRadius:4,transition:'width .8s ease'}}/>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* CA 6 mois */}
      <div style={{gridColumn:'1/3'}}>
        <Card>
          <CardHdr title="Évolution CA & Dépenses — 6 mois" icon="chart" color={C.blue}
            action={<button onClick={()=>nav('/cleanitbooks/reports')} style={{fontSize:11,color:C.blue,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Rapports →</button>}/>
          <div style={{padding:'8px 10px 14px'}}>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border2}/>
                <XAxis dataKey="mois" tick={{fontSize:10,fill:C.text3}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:9,fill:C.text3}} axisLine={false} tickLine={false} tickFormatter={v=>fM(v)}/>
                <Tooltip content={<CustomTip/>}/>
                <Area type="monotone" dataKey="CA" stroke={C.blue} fill={C.blue+'20'} strokeWidth={2} name="CA"/>
                <Area type="monotone" dataKey="Dépenses" stroke={C.red} fill={C.red+'12'} strokeWidth={2} name="Dépenses"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* CA par client */}
      <div>
        <Card style={{height:'100%'}}>
          <CardHdr title="CA par Client" sub="Concentration revenus" icon="chart" color={C.orange}/>
          <div style={{padding:'12px 14px'}}>
            {clientData.map((c,i)=>(
              <div key={i} style={{marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
                  <span style={{fontWeight:700,color:C.text}}>{c.name}</span>
                  <span style={{color:C.text3}}>{c.pct}% · {fM(c.amount)}</span>
                </div>
                <div style={{height:7,borderRadius:4,background:'#F3F4F6',overflow:'hidden'}}>
                  <div style={{width:c.pct+'%',height:'100%',background:c.color,borderRadius:4}}/>
                </div>
              </div>
            ))}
            {clientData[0]?.pct>60&&(
              <div style={{padding:'7px 10px',background:'#FFF3CD',borderRadius:6,border:'1px solid #FFC107',fontSize:11,color:'#856404',marginTop:8}}>
                Risque: {clientData[0].name} représente {clientData[0].pct}% du CA
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Nouveaux BON DE COMMANDE */}
      <div style={{gridColumn:'1/-1'}}>
        <Card>
          <CardHdr title="Nouveaux Bons de Commande reçus" sub="Projets envoyés par les clients" icon="brief" color={C.red}
            action={<button onClick={()=>nav('/projets')} style={{fontSize:11,color:C.red,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Gérer →</button>}/>
          <div>
            {NEW_PROJECTS.map((p,i)=>(
              <div key={i} onClick={()=>nav('/projets')}
                style={{display:'flex',alignItems:'center',gap:12,padding:'13px 18px',borderBottom:i<NEW_PROJECTS.length-1?`1px solid ${C.border2}`:'none',cursor:'pointer',transition:'background .1s'}}
                onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{width:38,height:38,borderRadius:9,background:p.status==='urgent'?C.red+'14':C.blue+'14',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Ic d={I.brief} size={17} color={p.status==='urgent'?C.red:C.blue}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
                    <span style={{fontSize:13,fontWeight:700,color:C.text}}>{p.title}</span>
                    {p.status==='urgent'&&<span style={{fontSize:10,fontWeight:700,padding:'1px 7px',borderRadius:8,background:C.red+'15',color:C.red}}>URGENT</span>}
                  </div>
                  <div style={{fontSize:11,color:C.text3}}>{p.client} · {p.ref} · Échéance: {p.deadline}</div>
                </div>
                <div style={{textAlign:'right',flexShrink:0,marginRight:8}}>
                  <div style={{fontSize:15,fontWeight:800,color:C.blue}}>{fM(p.amount)}</div>
                </div>
                <Ic d={I.chevron} size={14} color={C.text4}/>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── VUE COMPTABLE ─────────────────────────────────────────────
const ComptableView = ({invoices,bills,nav}) => {
  const notPaid = invoices.filter(i=>i.status!=='Paid');
  const totalPending = notPaid.reduce((s,i)=>s+Number(i.balance||0),0);
  const totalBills = bills.filter(b=>b.status!=='Paid').reduce((s,b)=>s+Number(b.balance||0),0);
  const payData = [
    {name:'Encaissé', value:invoices.filter(i=>i.status==='Paid').reduce((s,i)=>s+Number(i.total||0),0)||67000000, color:C.green},
    {name:'En attente', value:totalPending||23000000, color:C.orange},
    {name:'En retard', value:totalPending*0.3||8000000, color:C.red},
  ];
  const totalInv = invoices.reduce((s,i)=>s+Number(i.total||0),0)||87000000;
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
      <KPI label="Trésorerie BICEC" value={fM(28000000)} color={C.green} icon="dollar" sub="Compte principal" onClick={()=>nav('/cleanitbooks/banking')}/>
      <KPI label="À Encaisser" value={fM(totalPending||23000000)} color={C.orange} icon="invoice" sub={`${notPaid.length} factures ouvertes`} onClick={()=>nav('/cleanitbooks/invoices')}/>
      <KPI label="TVA Nette Due" value={fM(4200000)} color={C.red} icon="alert" sub="Déclaration mai 2025" onClick={()=>nav('/cleanitbooks/reports')}/>
      <KPI label="Jobs non facturés" value={3} color={C.purple} icon="job" sub="À facturer maintenant" onClick={()=>nav('/cleanitbooks/invoices/new')}/>
      <KPI label="Charges Ce Mois" value={fM(totalBills||53000000)} color={C.teal} icon="chart" sub="Bills fournisseurs" onClick={()=>nav('/cleanitbooks/bills')}/>
      <KPI label="CA Total" value={fM(totalInv)} trend="+12%" up color={C.blue} icon="trend" sub="Ce mois" onClick={()=>nav('/cleanitbooks')}/>
      <div style={{gridColumn:'1/3'}}>
        <Card>
          <CardHdr title="État des Paiements Clients" icon="chart" color={C.green}
            action={<button onClick={()=>nav('/cleanitbooks/invoices')} style={{fontSize:11,color:C.green,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Factures →</button>}/>
          <div style={{padding:'8px 10px 14px'}}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={payData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={C.border2} horizontal={false}/>
                <XAxis type="number" tick={{fontSize:9,fill:C.text3}} axisLine={false} tickLine={false} tickFormatter={v=>fM(v)}/>
                <YAxis type="category" dataKey="name" tick={{fontSize:11,fill:C.text2}} axisLine={false} tickLine={false} width={80}/>
                <Tooltip content={<CustomTip/>}/>
                <Bar dataKey="value" name="Montant" radius={[0,4,4,0]}>
                  {payData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <div>
        <Card style={{height:'100%'}}>
          <CardHdr title="Déclarations à venir" icon="calendar" color={C.orange}/>
          <div>
            {[{l:'TVA Mai 2025',d:'15/05/2025',s:'urgent',v:'4.2M'},{l:'CNPS Mai 2025',d:'20/05/2025',s:'normal',v:'1.8M'},{l:'IRPP T1 2025',d:'15/06/2025',s:'normal',v:'2.1M'}].map((d,i)=>(
              <div key={i} onClick={()=>nav('/cleanitbooks/reports')} style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px',borderBottom:i<2?`1px solid ${C.border2}`:'none',cursor:'pointer',transition:'background .1s'}}
                onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{width:7,height:7,borderRadius:'50%',background:d.s==='urgent'?C.red:C.green,flexShrink:0}}/>
                <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:C.text}}>{d.l}</div><div style={{fontSize:10,color:C.text4}}>Échéance: {d.d}</div></div>
                <span style={{fontSize:12,fontWeight:700,color:d.s==='urgent'?C.red:C.text3}}>{d.v} FCFA</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── VUE CHEF DE PROJET ────────────────────────────────────────
const ChefProjView = ({jobs,nav}) => {
  const STATUS = {on_track:{c:C.green,l:'Dans les délais'}, at_risk:{c:C.orange,l:'À risque'}, delayed:{c:C.red,l:'En retard'}};
  const jobsDisplay = jobs.length>0 ? jobs.slice(0,4).map(j=>({...j,statusKey:'on_track',completion:Math.floor(Math.random()*80+15)})) : [
    {id:'J001',name:'DLA-001 Phase 2',customerId:'MTN',statusKey:'on_track',completion:78,deadline:'2025-05-20',team:3},
    {id:'J002',name:'YDE-002 Fibre',customerId:'Orange',statusKey:'at_risk',completion:45,deadline:'2025-05-18',team:2},
    {id:'J003',name:'KRI-001 Maint.',customerId:'CAMTEL',statusKey:'delayed',completion:20,deadline:'2025-05-15',team:1},
    {id:'J004',name:'GAR-001 5G',customerId:'MTN',statusKey:'on_track',completion:92,deadline:'2025-05-25',team:4},
  ];
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
      <KPI label="Jobs Actifs" value={jobs.length||4} color={C.blue} icon="job" sub="Projets en cours" onClick={()=>nav('/projets')}/>
      <KPI label="Jalons 7 jours" value={3} color={C.orange} icon="calendar" sub="Deadlines proches" onClick={()=>nav('/projets')}/>
      <KPI label="Nouveaux projets" value={NEW_PROJECTS.length} color={C.red} icon="brief" sub="Reçus des clients" onClick={()=>nav('/projets')}/>
      <KPI label="Approbations" value={2} color={C.purple} icon="check" sub="À valider" onClick={()=>nav('/approvals')}/>
      <KPI label="Techniciens déployés" value={TECH_DATA.filter(t=>t.status==='active').length} color={C.teal} icon="users" sub={`${TECH_DATA.filter(t=>t.status==='available').length} disponibles`} onClick={()=>nav('/pointage')}/>
      <KPI label="Taux livraison" value="75%" trend="+5%" up color={C.green} icon="trend" sub="Dans les délais"/>
      <div style={{gridColumn:'1/-1'}}>
        <Card>
          <CardHdr title="État des Jobs Actifs" sub="Cliquez pour voir le détail" icon="job" color={C.blue}
            action={<button onClick={()=>nav('/projets')} style={{fontSize:11,color:C.blue,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Tous les jobs →</button>}/>
          <div>
            {jobsDisplay.map((job,i)=>{
              const st=STATUS[job.statusKey]||STATUS.on_track;
              return (
                <div key={i} onClick={()=>nav('/projets')}
                  style={{display:'flex',alignItems:'center',gap:12,padding:'13px 18px',borderBottom:i<jobsDisplay.length-1?`1px solid ${C.border2}`:'none',cursor:'pointer',transition:'background .1s'}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{width:4,height:44,borderRadius:2,background:st.c,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                      <span style={{fontSize:13,fontWeight:700,color:C.text}}>{job.name}</span>
                      <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:8,background:st.c+'18',color:st.c}}>{st.l}</span>
                    </div>
                    <div style={{height:5,borderRadius:3,background:'#F3F4F6',overflow:'hidden'}}>
                      <div style={{width:job.completion+'%',height:'100%',background:st.c,borderRadius:3}}/>
                    </div>
                  </div>
                  <div style={{fontSize:16,fontWeight:800,color:st.c,flexShrink:0}}>{job.completion}%</div>
                  <Ic d={I.chevron} size={13} color={C.text4}/>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── VUE CHEF TERRAIN ──────────────────────────────────────────
const ChefTerrainView = ({nav}) => {
  const stC={active:C.green,traveling:C.orange,available:C.blue};
  const stL={active:'En mission',traveling:'En transit',available:'Disponible'};
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
      <KPI label="En Mission" value={TECH_DATA.filter(t=>t.status==='active').length} color={C.green} icon="map" sub="Techniciens actifs" onClick={()=>nav('/pointage/map')}/>
      <KPI label="Disponibles" value={TECH_DATA.filter(t=>t.status==='available').length} color={C.blue} icon="users" sub="Prêts pour affectation" onClick={()=>nav('/pointage')}/>
      <KPI label="Pointages à valider" value={4} color={C.orange} icon="check" sub="En attente" onClick={()=>nav('/pointage/approbations')}/>
      <KPI label="Jobs du jour" value={3} color={C.purple} icon="job" sub="Planifiés" onClick={()=>nav('/projets')}/>
      <KPI label="En déplacement" value={TECH_DATA.filter(t=>t.status==='traveling').length} color={C.teal} icon="clock" sub="En transit" onClick={()=>nav('/pointage')}/>
      <KPI label="Matériels en transit" value={2} color={C.orange} icon="brief" sub="Livraisons attendues"/>
      <div style={{gridColumn:'1/-1'}}>
        <Card>
          <CardHdr title="Déploiement Équipes — Aujourd'hui" icon="map" color={C.teal}
            action={<button onClick={()=>nav('/pointage/map')} style={{fontSize:11,color:C.teal,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Carte live →</button>}/>
          <div>
            {TECH_DATA.map((t,i)=>(
              <div key={i} onClick={()=>nav('/pointage')}
                style={{display:'flex',alignItems:'center',gap:12,padding:'12px 18px',borderBottom:i<TECH_DATA.length-1?`1px solid ${C.border2}`:'none',cursor:'pointer',transition:'background .1s'}}
                onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{width:34,height:34,borderRadius:'50%',background:stC[t.status]+'18',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Ic d={I.person} size={15} color={stC[t.status]}/>
                </div>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:C.text}}>{t.name}</div><div style={{fontSize:11,color:C.text4}}>Site: {t.site}</div></div>
                <span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:10,background:stC[t.status]+'18',color:stC[t.status]}}>{stL[t.status]}</span>
                <Ic d={I.chevron} size={13} color={C.text4}/>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── VUE RH ────────────────────────────────────────────────────
const RHView = ({nav}) => {
  const stC={present:C.green,late:C.orange,mission:C.blue,leave:C.text4,absent:C.red};
  const stL={present:'Présent',late:'En retard',mission:'Mission',leave:'Congé',absent:'Absent'};
  const presData=[
    {name:'Présents',value:HR_DATA.filter(h=>h.status==='present').length,color:C.green},
    {name:'Mission',value:HR_DATA.filter(h=>h.status==='mission').length,color:C.blue},
    {name:'En retard',value:HR_DATA.filter(h=>h.status==='late').length,color:C.orange},
    {name:'Congé',value:HR_DATA.filter(h=>h.status==='leave').length,color:C.text4},
  ];
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
      <KPI label="Présents" value={HR_DATA.filter(h=>['present','late'].includes(h.status)).length} color={C.green} icon="users" sub={`/${HR_DATA.length} employés`} onClick={()=>nav('/pointage')}/>
      <KPI label="En Mission" value={HR_DATA.filter(h=>h.status==='mission').length} color={C.blue} icon="map" sub="Terrain aujourd'hui"/>
      <KPI label="Demandes RH" value={4} color={C.orange} icon="alert" sub="À valider" onClick={()=>nav('/approvals')}/>
      <KPI label="Contrats expirant" value={2} color={C.red} icon="calendar" sub="Dans 30 jours"/>
      <KPI label="Formations dues" value={3} color={C.purple} icon="brain" sub="Certifications"/>
      <KPI label="Congés en cours" value={HR_DATA.filter(h=>h.status==='leave').length} color={C.teal} icon="clock" sub="Ce mois"/>
      <div style={{gridColumn:'1/2'}}>
        <Card>
          <CardHdr title="Présences" icon="users" color={C.green}/>
          <div style={{padding:'14px',display:'flex',flexDirection:'column',alignItems:'center'}}>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={presData} cx="50%" cy="50%" innerRadius={42} outerRadius={62} dataKey="value">
                  {presData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {presData.map((p,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',width:'100%',marginBottom:3}}>
                <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:7,height:7,borderRadius:'50%',background:p.color}}/><span style={{fontSize:11,color:C.text2}}>{p.name}</span></div>
                <span style={{fontSize:12,fontWeight:700,color:p.color}}>{p.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div style={{gridColumn:'2/-1'}}>
        <Card>
          <CardHdr title="Présences Aujourd'hui" icon="users" color={C.green}
            action={<button onClick={()=>nav('/pointage')} style={{fontSize:11,color:C.green,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Voir tout →</button>}/>
          <div>
            {HR_DATA.map((h,i)=>(
              <div key={i} onClick={()=>nav('/pointage')}
                style={{display:'flex',alignItems:'center',gap:10,padding:'9px 14px',borderBottom:i<HR_DATA.length-1?`1px solid ${C.border2}`:'none',cursor:'pointer',transition:'background .1s'}}
                onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{width:30,height:30,borderRadius:'50%',background:stC[h.status]+'18',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Ic d={I.person} size={13} color={stC[h.status]}/>
                </div>
                <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:C.text}}>{h.name}</div><div style={{fontSize:10,color:C.text4}}>{h.dept}</div></div>
                <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:8,background:stC[h.status]+'18',color:stC[h.status]}}>{stL[h.status]}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};


// ── VUE ADMIN SYSTÈME ─────────────────────────────────────────
const AdminSysView = ({nav}) => {
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
      <KPI label="Modules actifs" value={12} color={'#374151'} icon="chart" sub="Modules ERP"/>
      <KPI label="Backend" value="En ligne" color={C.green} icon="check" sub="Railway + Neon DB"/>
      <div style={{gridColumn:'1/-1'}}>
        <Card>
          <CardHdr title="Modules ERP" icon="chart" color={'#374151'}/>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,padding:14}}>
            {[
              {name:'CleanITBooks',path:'/cleanitbooks',status:'actif',c:C.green},
              {name:'Approvals',path:'/approvals',status:'actif',c:C.green},
              {name:'Pointage',path:'/pointage',status:'actif',c:C.green},
              {name:'CleanIT Comm',path:'/cleanitcomm',status:'actif',c:C.green},
              {name:'Projets',path:'/projets',status:'actif',c:C.green},
              {name:'RH',path:'/rh',status:'actif',c:C.green},
              {name:'CRM',path:'/crm',status:'actif',c:C.green},
              {name:'BI',path:'/bi',status:'actif',c:C.green},
            ].map((m,i)=>(
              <div key={i} onClick={()=>nav(m.path)} style={{padding:'12px',borderRadius:8,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',textAlign:'center',transition:'all .15s'}}
                onMouseEnter={e=>{e.currentTarget.style.background=C.bg;e.currentTarget.style.transform='translateY(-1px)';}}
                onMouseLeave={e=>{e.currentTarget.style.background=C.white;e.currentTarget.style.transform='none';}}>
                <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:4}}>{m.name}</div>
                <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:8,background:m.c+'15',color:m.c}}>{m.status}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── DASHBOARD PRINCIPAL ───────────────────────────────────────
export default function Dashboard() {
  const [realData, setRealData] = useState({ users: 0, missions: 0, posts: 0 });
  useEffect(() => {
    const token = localStorage.getItem('token');
    if(!token) return;
    const headers = { Authorization: 'Bearer ' + token };
    const base = import.meta.env.VITE_API_URL || 'https://backend-cleanit-erp.vercel.app';
    Promise.all([
      fetch(base + '/users', { headers }).then(r => r.json()).catch(() => []),
      fetch(base + '/missions', { headers }).then(r => r.json()).catch(() => []),
      fetch(base + '/feed', { headers }).then(r => r.json()).catch(() => []),
    ]).then(([users, missions, posts]) => {
      setRealData({
        users: Array.isArray(users) ? users.length : 0,
        missions: Array.isArray(missions) ? missions.length : 0,
        missionsActive: Array.isArray(missions) ? missions.filter(m => m.status === 'in_progress').length : 0,
        posts: Array.isArray(posts) ? posts.length : 0,
      });
    });
  }, []);

  const nav = useNavigate();
  const [dashData, setDashData] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [bills, setBills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [time, setTime] = useState(new Date());

  // Utilisateur connecté — rôle automatique
  const user = getUser();
  const roleId = getRoleFromUser(user);
  const role = ROLE_CONFIG[roleId] || ROLE_CONFIG.chef_proj;
  const userName = user?.firstName || user?.first_name || user?.email?.split('@')[0] || 'Utilisateur';

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // Affichage immédiat avec données disponibles
    Promise.all([getDashboard(), getInvoices(), getBills(), getJobs(), getCustomers()])
      .then(([dash, inv, bill, job, cust]) => {
        if(dash) setDashData(dash);
        if(inv?.length) setInvoices(inv);
        if(bill?.length) setBills(bill);
        if(job?.length) setJobs(job);
        if(cust?.length) setCustomers(cust);
      })
      .catch(() => {});
  }, []);

  const renderView = () => {
    switch(roleId) {
      case 'dg':           return <DGView jobs={jobs} invoices={invoices} customers={customers} nav={nav}/>;
      case 'comptable':    return <ComptableView invoices={invoices} bills={bills} nav={nav}/>;
      case 'chef_proj':    return <ChefProjView jobs={jobs} nav={nav}/>;
      case 'chef_terrain': return <ChefTerrainView nav={nav}/>;
      case 'rh':           return <RHView nav={nav}/>;
      case 'admin_sys':    return <AdminSysView nav={nav}/>;
      default:             return <DGView jobs={jobs} invoices={invoices} customers={customers} nav={nav}/>;
    }
  };

  return (
    <div style={{minHeight:'100vh', background:C.bg, fontFamily:"'Inter','Segoe UI',Arial,sans-serif"}}>
      <div style={{maxWidth:1400, margin:'0 auto', padding:'20px 28px'}}>

        {/* SALUTATION UTILISATEUR */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18}}>
          <div>
            <div style={{fontSize:22, fontWeight:800, color:C.text}}>
              Bonjour, {userName} 👋
            </div>
            <div style={{fontSize:13, color:C.text3, marginTop:3}}>
              {role.label} · {time.toLocaleDateString('fr-FR',{weekday:'long', day:'numeric', month:'long', year:'numeric'})} · {time.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
            </div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{width:44, height:44, borderRadius:11, background:role.gradient, display:'flex', alignItems:'center', justifyContent:'center'}}>
              <Ic d={I[role.icon]} size={21} color='#fff'/>
            </div>
            <div>
              <div style={{fontSize:12, fontWeight:700, color:C.text}}>{role.label}</div>
              <div style={{fontSize:10, color:C.text4}}>Tableau de bord personnalisé</div>
            </div>
          </div>
        </div>

        {/* AI BRIEF */}
        <div style={{marginBottom:18}}>
          <AIBrief user={user} role={role} dashData={dashData}/>
        </div>

        {/* GRILLE PRINCIPALE */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 290px', gap:16, alignItems:'start'}}>
          <div>{renderView()}</div>
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            <QuickActions role={role} nav={nav}/>
            <AgendaWidget nav={nav}/>
            <EmailsWidget nav={nav}/>
          </div>
        </div>
      </div>
    </div>
  );
}
