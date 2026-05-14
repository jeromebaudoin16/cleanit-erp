import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getDashboard, getInvoices, getBills, getJobs, getCustomers, getPL, getBalance } from '../services/cleanitbooks.api';
import { api } from '../utils/api';

// ── DESIGN TOKENS ─────────────────────────────────────────────
const C = {
  white:'#ffffff', bg:'#F4F6FB', bg2:'#ECEEF5',
  border:'#E1E5EE', border2:'#ECF0F7',
  text:'#12161F', text2:'#374151', text3:'#6B7280', text4:'#9CA3AF',
  blue:'#0052CC', green:'#006644', red:'#AE2A19', orange:'#974F0C',
  purple:'#403294', teal:'#00626E', sky:'#0B66C2',
  shadow:'0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
  shadow2:'0 4px 20px rgba(0,0,0,0.12)',
  gradBlue:'linear-gradient(135deg,#0052CC,#0B66C2)',
  gradGreen:'linear-gradient(135deg,#006644,#00875A)',
  gradPurple:'linear-gradient(135deg,#403294,#5243AA)',
};

const fN = n => new Intl.NumberFormat('fr-FR').format(Math.round(n||0));
const fM = n => { if(!n) return '0 F'; if(n>=1000000) return (n/1000000).toFixed(1)+'M F'; if(n>=1000) return (n/1000).toFixed(0)+'K F'; return fN(n)+' F'; };
const fDT = d => d ? new Date(d).toLocaleString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : '—';

// ── SVG ICONS ─────────────────────────────────────────────────
const Ic = ({d,size=16,color='currentColor',sw=1.8}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {(Array.isArray(d)?d:[d]).map((p,i)=><path key={i} d={p}/>)}
  </svg>
);
const I = {
  dashboard: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  chart:     'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  invoice:   'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  mail:      ['M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z','M22 6l-10 7L2 6'],
  calendar:  'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  check:     'M5 13l4 4L19 7',
  alert:     'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  users:     ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2','M23 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75','M9 7a4 4 0 100 8 4 4 0 000-8z'],
  briefcase: ['M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z','M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2'],
  dollar:    'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  trend:     'M23 6l-9.5 9.5-5-5L1 18',
  trendDown: 'M23 18l-9.5-9.5-5 5L1 6',
  clock:     'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  map:       ['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z','M12 10a1 1 0 100-2 1 1 0 000 2z'],
  person:    ['M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2','M12 11a4 4 0 100-8 4 4 0 000 8z'],
  brain:     ['M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'],
  chevron:   'M9 5l7 7-7 7',
  plus:      'M12 4v16m8-8H4',
  bell:      ['M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9','M13.73 21a2 2 0 01-3.46 0'],
  sun:       ['M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42','M12 17a5 5 0 100-10 5 5 0 000 10z'],
  settings:  ['M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z','M15 12a3 3 0 11-6 0 3 3 0 016 0z'],
  job:       'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  send:      'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  eye:       ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z','M12 9a3 3 0 100 6 3 3 0 000-6z'],
  logout:    ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
};

// ── ROLES ─────────────────────────────────────────────────────
const ROLES = [
  { id:'dg',        label:'Directeur Général',          color:C.blue,   gradient:C.gradBlue,   icon:'briefcase' },
  { id:'comptable', label:'Comptable',                   color:C.green,  gradient:C.gradGreen,  icon:'dollar'    },
  { id:'chef_proj', label:'Chef de Projet',              color:C.purple, gradient:C.gradPurple, icon:'chart'     },
  { id:'chef_terrain',label:'Chef Terrain',              color:C.teal,   gradient:'linear-gradient(135deg,#00626E,#00877A)', icon:'map' },
  { id:'rh',        label:'Responsable RH',              color:C.orange, gradient:'linear-gradient(135deg,#974F0C,#B65C02)', icon:'users' },
];

// ── SIMULATED DATA (will connect to real API) ─────────────────
const TODAY_MEETINGS = [
  { time:'09:00', title:'Point hebdomadaire équipe', type:'interne', duration:30 },
  { time:'11:00', title:'Réunion MTN — Validation DLA-005', type:'client', client:'MTN', duration:60 },
  { time:'14:30', title:'Revue financière mensuelle', type:'interne', duration:45 },
  { time:'16:00', title:'Orange — Mise à jour YDE-003', type:'client', client:'Orange', duration:30 },
];
const URGENT_EMAILS = [
  { from:'MTN Cameroun', subject:'Nouveau BC DLA-005 — 45M FCFA — Action requise', time:'08:32', priority:'high', type:'project' },
  { from:'DGI Cameroun', subject:'Rappel: Déclaration TVA Mars — Échéance 15/05', time:'07:15', priority:'high', type:'fiscal' },
  { from:'Orange Cameroun', subject:'Validation phase 2 YDE-003 — Confirmation', time:'06:50', priority:'medium', type:'project' },
  { from:'BICEC', subject:'Relevé bancaire Avril 2025 disponible', time:'05:00', priority:'low', type:'banking' },
];
const NEW_PROJECTS = [
  { client:'MTN', ref:'BC-MTN-2025-047', title:'Déploiement 5G DLA-005', amount:45000000, deadline:'2025-06-15', status:'urgent', received:'2025-05-14' },
  { client:'Orange', ref:'BC-ORA-2025-031', title:'Extension fibre YDE-003', amount:28000000, deadline:'2025-07-01', status:'normal', received:'2025-05-12' },
  { client:'CAMTEL', ref:'BC-CAM-2025-019', title:'Maintenance réseau KRI', amount:12000000, deadline:'2025-06-30', status:'normal', received:'2025-05-10' },
];
const ACTIVE_JOBS_SAMPLE = [
  { id:'J001', name:'DLA-001 Phase 2', client:'MTN', status:'on_track', completion:78, deadline:'2025-05-20', team:3 },
  { id:'J002', name:'YDE-002 Fibre', client:'Orange', status:'at_risk', completion:45, deadline:'2025-05-18', team:2 },
  { id:'J003', name:'KRI-001 Maint.', client:'CAMTEL', status:'delayed', completion:20, deadline:'2025-05-15', team:1 },
  { id:'J004', name:'GAR-001 5G', client:'MTN', status:'on_track', completion:92, deadline:'2025-05-25', team:4 },
];
const TECH_MAP = [
  { name:'Jean Mbarga', site:'DLA-001', status:'active', lat:4.05, lng:9.74 },
  { name:'Ali Moussa', site:'YDE-002', status:'active', lat:3.87, lng:11.52 },
  { name:'Thomas Ngono', site:'KRI-001', status:'traveling', lat:4.95, lng:9.93 },
  { name:'Pierre Etoga', site:'Bureau', status:'available', lat:4.05, lng:9.70 },
  { name:'Samuel Djomo', site:'GAR-001', status:'active', lat:9.30, lng:13.40 },
];
const HR_PRESENCE = [
  { name:'Marie Kamga', dept:'Direction', status:'present', in:'07:45' },
  { name:'Jean Mbarga', dept:'Terrain', status:'mission', in:'06:00' },
  { name:'Alice Finance', dept:'Finance', status:'present', in:'08:10' },
  { name:'Bob Finance', dept:'Finance', status:'late', in:'09:30' },
  { name:'Samuel Djomo', dept:'Terrain', status:'mission', in:'06:00' },
  { name:'Pierre Etoga', dept:'Terrain', status:'present', in:'08:00' },
  { name:'Clara RH', dept:'RH', status:'leave', in:'—' },
];

// ── MINI COMPONENTS ───────────────────────────────────────────
const Card = ({children, style={}}) => (
  <div style={{background:C.white, borderRadius:10, border:`1px solid ${C.border}`, boxShadow:C.shadow, overflow:'hidden', ...style}}>
    {children}
  </div>
);
const CardHeader = ({title, subtitle, action, icon, color=C.blue}) => (
  <div style={{padding:'14px 18px', borderBottom:`1px solid ${C.border2}`, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
    <div style={{display:'flex', alignItems:'center', gap:8}}>
      {icon && <div style={{width:28, height:28, borderRadius:7, background:color+'14', display:'flex', alignItems:'center', justifyContent:'center'}}><Ic d={I[icon]} size={14} color={color}/></div>}
      <div>
        <div style={{fontSize:13, fontWeight:700, color:C.text}}>{title}</div>
        {subtitle && <div style={{fontSize:11, color:C.text4}}>{subtitle}</div>}
      </div>
    </div>
    {action}
  </div>
);
const KPICard = ({label, value, sub, color, icon, trend, trendUp, onClick}) => (
  <div onClick={onClick} style={{background:C.white, borderRadius:10, padding:'16px 18px', border:`1px solid ${C.border}`, boxShadow:C.shadow, cursor:onClick?'pointer':'default', position:'relative', overflow:'hidden', transition:'all .2s'}}
    onMouseEnter={e=>{if(onClick){e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=C.shadow2;}}}
    onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow=C.shadow;}}>
    <div style={{position:'absolute', top:0, left:0, right:0, height:3, background:color, borderRadius:'10px 10px 0 0'}}/>
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12}}>
      <div style={{width:36, height:36, borderRadius:9, background:color+'14', display:'flex', alignItems:'center', justifyContent:'center'}}><Ic d={I[icon]} size={17} color={color}/></div>
      {trend && <div style={{display:'flex', alignItems:'center', gap:3, fontSize:12, fontWeight:700, color:trendUp?C.green:C.red}}>
        <Ic d={trendUp?I.trend:I.trendDown} size={12} color={trendUp?C.green:C.red} sw={2.5}/>{trend}
      </div>}
    </div>
    <div style={{fontSize:24, fontWeight:800, color, lineHeight:1, marginBottom:4}}>{value}</div>
    <div style={{fontSize:12, fontWeight:600, color:C.text2, marginBottom:sub?2:0}}>{label}</div>
    {sub && <div style={{fontSize:11, color:C.text4}}>{sub}</div>}
  </div>
);

// ── AI BRIEF ─────────────────────────────────────────────────
const AIBrief = ({role, data}) => {
  const [brief, setBrief] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const context = `Rôle: ${role.label}. Données: CA=${fM(data?.totalCA||0)}, Jobs actifs=${data?.jobsCount||0}, Factures en attente=${data?.invoicesCount||0}, Trésorerie=${fM(data?.tresorerie||0)}. Nouveaux projets clients: ${NEW_PROJECTS.length}. Réunions aujourd'hui: ${TODAY_MEETINGS.length}.`;
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+import.meta.env.VITE_GROQ_API_KEY},
        body:JSON.stringify({
          model:'llama-3.3-70b-versatile', max_tokens:150,
          messages:[{role:'user', content:`Tu es ChaCha, l'assistant IA de CleanIT ERP (entreprise de sous-traitance télécom au Cameroun). Génère un brief quotidien concis pour le/la ${role.label} en 2-3 phrases maximum en français. ${context} Sois précis, professionnel et actionnable. Commence directement par les informations importantes.`}]
        })
      });
      const d = await res.json();
      setBrief(d.choices?.[0]?.message?.content || 'Données insuffisantes pour générer le brief.');
      setGenerated(true);
    } catch {
      setBrief('Connexion IA indisponible. Vérifiez votre connexion internet.');
      setGenerated(true);
    }
    setLoading(false);
  }, [role, data]);

  useEffect(() => { if(!generated && !loading) generate(); }, [role.id]);

  return (
    <Card>
      <div style={{padding:'16px 20px', background:`linear-gradient(135deg, ${role.color}08, ${role.color}03)`}}>
        <div style={{display:'flex', alignItems:'flex-start', gap:12}}>
          <div style={{width:40, height:40, borderRadius:10, background:role.gradient, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
            <Ic d={I.brain} size={20} color='#fff'/>
          </div>
          <div style={{flex:1}}>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
              <span style={{fontSize:12, fontWeight:700, color:role.color}}>ChaCha IA — Brief du jour</span>
              <span style={{fontSize:10, color:C.text4}}>Personnalisé pour {role.label}</span>
              <button onClick={generate} disabled={loading} style={{marginLeft:'auto', fontSize:11, color:role.color, background:'none', border:`1px solid ${role.color}30`, borderRadius:4, padding:'2px 8px', cursor:'pointer', fontFamily:'inherit'}}>
                {loading ? 'Génération...' : 'Actualiser'}
              </button>
            </div>
            {loading && !brief && <div style={{fontSize:13, color:C.text3, fontStyle:'italic'}}>ChaCha analyse vos données...</div>}
            {brief && <div style={{fontSize:13, color:C.text2, lineHeight:1.7}}>{brief}</div>}
          </div>
        </div>
      </div>
    </Card>
  );
};

// ── COMMON WIDGETS ────────────────────────────────────────────
const EmailsWidget = () => (
  <Card>
    <CardHeader title="Emails urgents" subtitle="Filtrés par IA" icon="mail" color={C.blue}
      action={<button style={{fontSize:11,color:C.blue,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Voir tout →</button>}/>
    <div style={{padding:'8px 0'}}>
      {URGENT_EMAILS.map((em,i)=>(
        <div key={i} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 16px',borderBottom:i<URGENT_EMAILS.length-1?`1px solid ${C.border2}`:'none',cursor:'pointer',transition:'background .1s'}}
          onMouseEnter={e=>e.currentTarget.style.background=C.bg}
          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
          <div style={{width:8,height:8,borderRadius:'50%',background:em.priority==='high'?C.red:em.priority==='medium'?C.orange:'#D1D5DB',marginTop:5,flexShrink:0}}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:700,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{em.from}</div>
            <div style={{fontSize:11,color:C.text3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{em.subject}</div>
          </div>
          <div style={{fontSize:10,color:C.text4,whiteSpace:'nowrap',flexShrink:0}}>{em.time}</div>
        </div>
      ))}
    </div>
  </Card>
);

const AgendaWidget = () => (
  <Card>
    <CardHeader title="Agenda du jour" subtitle={new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})} icon="calendar" color={C.purple}/>
    <div style={{padding:'8px 0'}}>
      {TODAY_MEETINGS.map((m,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px',borderBottom:i<TODAY_MEETINGS.length-1?`1px solid ${C.border2}`:'none'}}>
          <div style={{textAlign:'center',minWidth:40}}>
            <div style={{fontSize:12,fontWeight:800,color:m.type==='client'?C.blue:C.purple}}>{m.time}</div>
            <div style={{fontSize:9,color:C.text4}}>{m.duration}min</div>
          </div>
          <div style={{width:3,height:36,borderRadius:2,background:m.type==='client'?C.blue:C.purple,flexShrink:0}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:600,color:C.text}}>{m.title}</div>
            <div style={{fontSize:10,color:m.type==='client'?C.blue:C.text4}}>{m.type==='client'?`Client: ${m.client}`:'Interne'}</div>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

// ── CUSTOM TOOLTIP ────────────────────────────────────────────
const CustomTooltip = ({active,payload,label,formatter}) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:'10px 14px',boxShadow:C.shadow2,fontSize:12}}>
      <div style={{fontWeight:700,color:C.text,marginBottom:6}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{display:'flex',gap:6,alignItems:'center',marginBottom:2}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:p.color}}/>
          <span style={{color:C.text3}}>{p.name}:</span>
          <span style={{fontWeight:700,color:C.text}}>{formatter?formatter(p.value):fM(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ── DG VIEW ───────────────────────────────────────────────────
const DGView = ({data, nav}) => {
  const monthlyData = [
    {mois:'Déc',CA:72000000,Dépenses:42000000},{mois:'Jan',CA:81000000,Dépenses:48000000},
    {mois:'Fév',CA:68000000,Dépenses:39000000},{mois:'Mar',CA:87000000,Dépenses:51000000},
    {mois:'Avr',CA:79000000,Dépenses:44000000},{mois:'Mai',CA:92000000,Dépenses:53000000},
  ];
  const clientData = [
    {name:'MTN',value:65,amount:59800000,color:'#FFCA00'},{name:'Orange',value:25,amount:23000000,color:'#FF7900'},
    {name:'CAMTEL',value:10,amount:9200000,color:'#0066CC'},
  ];
  const pipeline = [
    {stage:'Contrats signés',value:245000000,color:C.blue},{stage:'En cours',value:187000000,color:C.purple},
    {stage:'Terminé non facturé',value:34000000,color:C.orange},{stage:'Facturé',value:92000000,color:C.teal},
    {stage:'Encaissé',value:67000000,color:C.green},
  ];
  const maxPipe = pipeline[0].value;
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
      <KPICard label="CA Ce Mois" value={fM(92000000)} trend="+12%" trendUp color={C.blue} icon="chart" sub="vs 79M le mois dernier" onClick={()=>nav('/cleanitbooks/reports')}/>
      <KPICard label="Marge Nette" value="34%" trend="+3pts" trendUp color={C.green} icon="trend" sub="Objectif: 30%" onClick={()=>nav('/cleanitbooks')}/>
      <KPICard label="Trésorerie" value={fM(data?.totalCA*0.5||45000000)} color={C.teal} icon="dollar" sub="Comptes bancaires combinés" onClick={()=>nav('/cleanitbooks')}/>
      <KPICard label="Approbations" value={3} color={C.orange} icon="alert" sub="Requièrent votre signature" onClick={()=>nav('/approvals')}/>
      <KPICard label="Jobs Actifs" value={data?.jobsCount||4} color={C.purple} icon="job" sub={`${data?.jobsInProgress||2} en cours`} onClick={()=>nav('/projets')}/>
      <KPICard label="Nouveaux BC" value={NEW_PROJECTS.length} trend="Urgent" trendUp={false} color={C.red} icon="bell" sub="Bons de commande reçus"/>
      <div style={{gridColumn:'1/-1'}}>
        <Card>
          <CardHeader title="Revenue Pipeline" subtitle="Cycle complet du contrat à l'encaissement" icon="chart" color={C.blue}/>
          <div style={{padding:'16px 20px'}}>
            {pipeline.map((p,i)=>(
              <div key={i} style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
                  <span style={{color:C.text2,fontWeight:500}}>{p.stage}</span>
                  <span style={{fontWeight:700,color:p.color}}>{fM(p.value)}</span>
                </div>
                <div style={{height:8,borderRadius:4,background:'#F3F4F6',overflow:'hidden'}}>
                  <div style={{width:(p.value/maxPipe*100)+'%',height:'100%',background:p.color,borderRadius:4,transition:'width .8s ease'}}/>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div style={{gridColumn:'1/3'}}>
        <Card style={{height:'100%'}}>
          <CardHeader title="CA & Dépenses — 6 mois" icon="chart" color={C.blue}/>
          <div style={{padding:'8px 12px 16px'}}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border2}/>
                <XAxis dataKey="mois" tick={{fontSize:11,fill:C.text3}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:C.text3}} axisLine={false} tickLine={false} tickFormatter={v=>fM(v)}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend wrapperStyle={{fontSize:11}}/>
                <Area type="monotone" dataKey="CA" stroke={C.blue} fill={C.blue+'20'} strokeWidth={2} name="CA"/>
                <Area type="monotone" dataKey="Dépenses" stroke={C.red} fill={C.red+'15'} strokeWidth={2} name="Dépenses"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <div>
        <Card style={{height:'100%'}}>
          <CardHeader title="CA par Client" subtitle="Concentration revenus" icon="chart" color={C.orange}/>
          <div style={{padding:'12px 16px'}}>
            {clientData.map((c,i)=>(
              <div key={i} style={{marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
                  <span style={{fontWeight:700,color:C.text}}>{c.name}</span>
                  <span style={{fontWeight:600,color:C.text3}}>{c.value}% · {fM(c.amount)}</span>
                </div>
                <div style={{height:7,borderRadius:4,background:'#F3F4F6',overflow:'hidden'}}>
                  <div style={{width:c.value+'%',height:'100%',background:c.color,borderRadius:4}}/>
                </div>
              </div>
            ))}
            {clientData[0].value>60&&<div style={{padding:'8px 10px',background:'#FFF3CD',borderRadius:6,border:'1px solid #FFC107',fontSize:11,color:'#856404',marginTop:8}}>Risque concentration: {clientData[0].name} représente {clientData[0].value}% du CA</div>}
          </div>
        </Card>
      </div>
      <div style={{gridColumn:'1/-1'}}>
        <Card>
          <CardHeader title="Nouveaux Bons de Commande reçus" subtitle="Projets envoyés par les clients" icon="mail" color={C.red}/>
          <div>
            {NEW_PROJECTS.map((p,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 18px',borderBottom:i<NEW_PROJECTS.length-1?`1px solid ${C.border2}`:'none'}}>
                <div style={{width:40,height:40,borderRadius:10,background:p.status==='urgent'?C.red+'14':C.blue+'14',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Ic d={I.briefcase} size={18} color={p.status==='urgent'?C.red:C.blue}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                    <span style={{fontSize:13,fontWeight:700,color:C.text}}>{p.title}</span>
                    {p.status==='urgent'&&<span style={{fontSize:10,fontWeight:700,padding:'1px 7px',borderRadius:8,background:C.red+'15',color:C.red}}>URGENT</span>}
                  </div>
                  <div style={{fontSize:11,color:C.text3}}>{p.client} · Réf: {p.ref} · Reçu: {p.received}</div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:14,fontWeight:800,color:C.blue}}>{fM(p.amount)}</div>
                  <div style={{fontSize:11,color:C.text4}}>Échéance: {p.deadline}</div>
                </div>
                <button onClick={()=>nav('/projets')} style={{padding:'6px 14px',borderRadius:6,border:`1px solid ${C.blue}`,background:'none',color:C.blue,fontSize:12,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>
                  Traiter
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── COMPTABLE VIEW ────────────────────────────────────────────
const ComptableView = ({data, nav}) => {
  const paymentData = [
    {name:'Encaissé',value:67000000,color:C.green},{name:'En attente',value:23000000,color:C.orange},{name:'En retard',value:8000000,color:C.red},
  ];
  const monthlyExpense = [
    {mois:'Jan',Charges:48000000},{mois:'Fév',Charges:39000000},{mois:'Mar',Charges:51000000},
    {mois:'Avr',Charges:44000000},{mois:'Mai',Charges:53000000},
  ];
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
      <KPICard label="Trésorerie BICEC" value={fM(28000000)} color={C.green} icon="dollar" sub="Compte principal" onClick={()=>nav('/cleanitbooks/banking')}/>
      <KPICard label="À Encaisser" value={fM(23000000)} trend="3 factures" color={C.orange} icon="invoice" sub="Factures ouvertes" onClick={()=>nav('/cleanitbooks/invoices')}/>
      <KPICard label="TVA Nette Due" value={fM(4200000)} color={C.red} icon="alert" sub="Déclaration mai 2025" onClick={()=>nav('/cleanitbooks/reports')}/>
      <KPICard label="Jobs non facturés" value={3} color={C.purple} icon="job" sub="À facturer maintenant" onClick={()=>nav('/cleanitbooks/invoices')}/>
      <KPICard label="Charges Ce Mois" value={fM(53000000)} color={C.teal} icon="chart" sub="Bills fournisseurs" onClick={()=>nav('/cleanitbooks/bills')}/>
      <KPICard label="Marge Brute" value="34%" trend="+2pts" trendUp color={C.green} icon="trend" sub="Objectif: 30%" onClick={()=>nav('/cleanitbooks')}/>
      <div style={{gridColumn:'1/3'}}>
        <Card>
          <CardHeader title="Évolution des Charges" icon="chart" color={C.red}/>
          <div style={{padding:'8px 12px 16px'}}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyExpense}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border2}/>
                <XAxis dataKey="mois" tick={{fontSize:11,fill:C.text3}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:C.text3}} axisLine={false} tickLine={false} tickFormatter={v=>fM(v)}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="Charges" fill={C.red} radius={[4,4,0,0]} name="Charges"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <div>
        <Card style={{height:'100%'}}>
          <CardHeader title="État des Paiements" icon="chart" color={C.green}/>
          <div style={{padding:'16px',display:'flex',flexDirection:'column',alignItems:'center'}}>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value">
                  {paymentData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip formatter={(v)=>fM(v)}/>
              </PieChart>
            </ResponsiveContainer>
            {paymentData.map((p,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',width:'100%',marginBottom:4}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:8,height:8,borderRadius:'50%',background:p.color}}/><span style={{fontSize:11,color:C.text2}}>{p.name}</span></div>
                <span style={{fontSize:12,fontWeight:700,color:p.color}}>{fM(p.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div style={{gridColumn:'1/-1'}}>
        <Card>
          <CardHeader title="Déclarations à venir" icon="calendar" color={C.orange}/>
          <div style={{padding:'8px 0'}}>
            {[{label:'TVA Mai 2025',date:'2025-05-15',status:'urgent',amount:'4.2M FCFA'},{label:'CNPS Mai 2025',date:'2025-05-20',status:'normal',amount:'1.8M FCFA'},{label:'IRPP T1 2025',date:'2025-06-15',status:'normal',amount:'2.1M FCFA'}].map((d,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 18px',borderBottom:i<2?`1px solid ${C.border2}`:'none'}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:d.status==='urgent'?C.red:C.green,flexShrink:0}}/>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:C.text}}>{d.label}</div><div style={{fontSize:11,color:C.text4}}>Échéance: {d.date}</div></div>
                <div style={{fontWeight:700,color:d.status==='urgent'?C.red:C.text3,fontSize:13}}>{d.amount}</div>
                <button style={{padding:'5px 12px',borderRadius:5,border:`1px solid ${d.status==='urgent'?C.red:C.border}`,background:'none',color:d.status==='urgent'?C.red:C.text3,fontSize:11,cursor:'pointer',fontWeight:600}}>Préparer</button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── CHEF PROJET VIEW ──────────────────────────────────────────
const ChefProjView = ({data, nav}) => {
  const statusColors = {on_track:C.green, at_risk:C.orange, delayed:C.red};
  const statusLabels = {on_track:'Dans les délais', at_risk:'À risque', delayed:'En retard'};
  const completionData = ACTIVE_JOBS_SAMPLE.map(j=>({name:j.name.slice(0,8)+'…',completion:j.completion}));
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
      <KPICard label="Jobs Actifs" value={ACTIVE_JOBS_SAMPLE.length} color={C.blue} icon="job" sub={`${ACTIVE_JOBS_SAMPLE.filter(j=>j.status==='on_track').length} dans les délais`} onClick={()=>nav('/projets')}/>
      <KPICard label="À Risque / Retard" value={ACTIVE_JOBS_SAMPLE.filter(j=>j.status!=='on_track').length} color={C.red} icon="alert" sub="Nécessitent attention" onClick={()=>nav('/projets')}/>
      <KPICard label="Jalons 7 jours" value={3} color={C.orange} icon="calendar" sub="Deadlines proches" onClick={()=>nav('/projets')}/>
      <KPICard label="Techniciens déployés" value={TECH_MAP.filter(t=>t.status==='active').length} color={C.teal} icon="users" sub={`${TECH_MAP.filter(t=>t.status==='available').length} disponibles`} onClick={()=>nav('/pointage')}/>
      <KPICard label="Approbations projets" value={2} color={C.purple} icon="check" sub="À valider" onClick={()=>nav('/approvals')}/>
      <KPICard label="Nouveaux projets" value={NEW_PROJECTS.length} color={C.sky} icon="bell" sub="Reçus des clients" onClick={()=>nav('/projets')}/>
      <div style={{gridColumn:'1/-1'}}>
        <Card>
          <CardHeader title="État des Jobs Actifs" subtitle="Cliquez pour voir le détail" icon="job" color={C.blue}
            action={<button onClick={()=>nav('/projets')} style={{fontSize:11,color:C.blue,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Tous les jobs →</button>}/>
          <div>
            {ACTIVE_JOBS_SAMPLE.map((job,i)=>(
              <div key={i} onClick={()=>nav('/projets')} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 18px',borderBottom:i<ACTIVE_JOBS_SAMPLE.length-1?`1px solid ${C.border2}`:'none',cursor:'pointer',transition:'background .1s'}}
                onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{width:4,height:48,borderRadius:2,background:statusColors[job.status],flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                    <span style={{fontSize:13,fontWeight:700,color:C.text}}>{job.name}</span>
                    <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:8,background:statusColors[job.status]+'18',color:statusColors[job.status]}}>{statusLabels[job.status]}</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                    <span style={{fontSize:11,color:C.text4}}>Client: {job.client}</span>
                    <span style={{color:C.border2}}>·</span>
                    <span style={{fontSize:11,color:C.text4}}>Échéance: {job.deadline}</span>
                    <span style={{color:C.border2}}>·</span>
                    <span style={{fontSize:11,color:C.text4}}>{job.team} technicien{job.team>1?'s':''}</span>
                  </div>
                  <div style={{height:6,borderRadius:3,background:'#F3F4F6',overflow:'hidden'}}>
                    <div style={{width:job.completion+'%',height:'100%',background:statusColors[job.status],borderRadius:3,transition:'width .5s'}}/>
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:18,fontWeight:800,color:statusColors[job.status]}}>{job.completion}%</div>
                  <div style={{fontSize:10,color:C.text4}}>complété</div>
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

// ── CHEF TERRAIN VIEW ─────────────────────────────────────────
const ChefTerrainView = ({nav}) => {
  const statusColors = {active:C.green, traveling:C.orange, available:C.blue};
  const statusLabels = {active:'En mission', traveling:'En déplacement', available:'Disponible'};
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
      <KPICard label="En Mission" value={TECH_MAP.filter(t=>t.status==='active').length} color={C.green} icon="map" sub="Techniciens actifs"/>
      <KPICard label="Disponibles" value={TECH_MAP.filter(t=>t.status==='available').length} color={C.blue} icon="users" sub="Prêts pour affectation"/>
      <KPICard label="En Déplacement" value={TECH_MAP.filter(t=>t.status==='traveling').length} color={C.orange} icon="clock" sub="En transit vers site"/>
      <KPICard label="Jobs Aujourd'hui" value={3} color={C.purple} icon="job" sub="Planifiés" onClick={()=>nav('/pointage')}/>
      <KPICard label="Pointages à valider" value={4} color={C.orange} icon="check" sub="En attente" onClick={()=>nav('/pointage/approbations')}/>
      <KPICard label="Matériels en transit" value={2} color={C.teal} icon="briefcase" sub="Livraisons attendues"/>
      <div style={{gridColumn:'1/-1'}}>
        <Card>
          <CardHeader title="Déploiement Équipes — Aujourd'hui" icon="map" color={C.teal}
            action={<button onClick={()=>nav('/pointage/map')} style={{fontSize:11,color:C.teal,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Carte live →</button>}/>
          <div>
            {TECH_MAP.map((t,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 18px',borderBottom:i<TECH_MAP.length-1?`1px solid ${C.border2}`:'none'}}>
                <div style={{width:36,height:36,borderRadius:'50%',background:statusColors[t.status]+'20',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Ic d={I.person} size={16} color={statusColors[t.status]}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.text}}>{t.name}</div>
                  <div style={{fontSize:11,color:C.text4}}>Site: {t.site}</div>
                </div>
                <span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:10,background:statusColors[t.status]+'18',color:statusColors[t.status]}}>{statusLabels[t.status]}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── RH VIEW ───────────────────────────────────────────────────
const RHView = ({nav}) => {
  const statusColors = {present:C.green, late:C.orange, mission:C.blue, leave:C.text4, absent:C.red};
  const statusLabels = {present:'Présent', late:'En retard', mission:'Mission', leave:'Congé', absent:'Absent'};
  const presenceData = [
    {name:'Présents',value:HR_PRESENCE.filter(h=>h.status==='present').length,color:C.green},
    {name:'Mission',value:HR_PRESENCE.filter(h=>h.status==='mission').length,color:C.blue},
    {name:'En retard',value:HR_PRESENCE.filter(h=>h.status==='late').length,color:C.orange},
    {name:'Congé',value:HR_PRESENCE.filter(h=>h.status==='leave').length,color:C.text4},
  ];
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
      <KPICard label="Présents Aujourd'hui" value={HR_PRESENCE.filter(h=>['present','late'].includes(h.status)).length} color={C.green} icon="users" sub={`sur ${HR_PRESENCE.length} employés`} onClick={()=>nav('/pointage')}/>
      <KPICard label="En Mission" value={HR_PRESENCE.filter(h=>h.status==='mission').length} color={C.blue} icon="map" sub="Terrain aujourd'hui"/>
      <KPICard label="Demandes RH" value={4} color={C.orange} icon="alert" sub="Congés + avances à valider" onClick={()=>nav('/approvals')}/>
      <KPICard label="Contrats expirant" value={2} color={C.red} icon="calendar" sub="Dans les 30 prochains jours"/>
      <KPICard label="Formations dues" value={3} color={C.purple} icon="brain" sub="Certifications à renouveler"/>
      <KPICard label="Heures suppl. mois" value="47h" color={C.teal} icon="clock" sub="Total équipe"/>
      <div style={{gridColumn:'1/2'}}>
        <Card style={{height:'100%'}}>
          <CardHeader title="Présences" icon="users" color={C.green}/>
          <div style={{padding:'16px',display:'flex',flexDirection:'column',alignItems:'center'}}>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={presenceData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value">
                  {presenceData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {presenceData.map((p,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',width:'100%',marginBottom:3}}>
                <div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:8,height:8,borderRadius:'50%',background:p.color}}/><span style={{fontSize:11,color:C.text2}}>{p.name}</span></div>
                <span style={{fontSize:13,fontWeight:700,color:p.color}}>{p.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div style={{gridColumn:'2/-1'}}>
        <Card>
          <CardHeader title="État des Présences — Aujourd'hui" icon="users" color={C.green}
            action={<button onClick={()=>nav('/pointage')} style={{fontSize:11,color:C.green,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Voir tout →</button>}/>
          <div>
            {HR_PRESENCE.map((h,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 16px',borderBottom:i<HR_PRESENCE.length-1?`1px solid ${C.border2}`:'none'}}>
                <div style={{width:32,height:32,borderRadius:'50%',background:statusColors[h.status]+'20',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Ic d={I.person} size={14} color={statusColors[h.status]}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.text}}>{h.name}</div>
                  <div style={{fontSize:10,color:C.text4}}>{h.dept}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:8,background:statusColors[h.status]+'18',color:statusColors[h.status]}}>{statusLabels[h.status]}</span>
                  {h.in!=='—'&&<div style={{fontSize:10,color:C.text4,marginTop:2}}>Arrivée: {h.in}</div>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── QUICK ACTIONS ─────────────────────────────────────────────
const QuickActions = ({role, nav}) => {
  const actions = {
    dg:         [{label:'Voir les approbations',icon:'check',path:'/approvals',color:C.orange},{label:'CleanITBooks',icon:'dollar',path:'/cleanitbooks',color:C.green},{label:'Nouveau projet',icon:'plus',path:'/projets',color:C.blue}],
    comptable:  [{label:'Créer une facture',icon:'invoice',path:'/cleanitbooks/invoices/new',color:C.blue},{label:'Plan comptable',icon:'chart',path:'/cleanitbooks/reports',color:C.green},{label:'Approbations paiement',icon:'check',path:'/approvals',color:C.orange}],
    chef_proj:  [{label:'Voir les jobs',icon:'job',path:'/projets',color:C.blue},{label:'Gérer l\'équipe',icon:'users',path:'/pointage',color:C.teal},{label:'Approuver demandes',icon:'check',path:'/approvals',color:C.orange}],
    chef_terrain:[{label:'Carte des équipes',icon:'map',path:'/pointage/map',color:C.teal},{label:'Valider pointages',icon:'check',path:'/pointage/approbations',color:C.green},{label:'Jobs du jour',icon:'job',path:'/projets',color:C.blue}],
    rh:         [{label:'Présences',icon:'users',path:'/pointage',color:C.green},{label:'Demandes RH',icon:'check',path:'/approvals',color:C.orange},{label:'Gestion RH',icon:'person',path:'/rh',color:C.purple}],
  };
  const list = actions[role.id]||[];
  return (
    <Card>
      <CardHeader title="Actions rapides" icon="send" color={role.color}/>
      <div style={{padding:'12px',display:'grid',gridTemplateColumns:`repeat(${list.length},1fr)`,gap:8}}>
        {list.map((a,i)=>(
          <button key={i} onClick={()=>nav(a.path)} style={{padding:'12px 8px',borderRadius:8,border:`1px solid ${a.color}20`,background:a.color+'08',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:6,transition:'all .15s',fontFamily:'inherit'}}
            onMouseEnter={e=>{e.currentTarget.style.background=a.color+'18';e.currentTarget.style.transform='translateY(-1px)';}}
            onMouseLeave={e=>{e.currentTarget.style.background=a.color+'08';e.currentTarget.style.transform='none';}}>
            <div style={{width:34,height:34,borderRadius:9,background:a.color+'20',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Ic d={I[a.icon]} size={16} color={a.color}/>
            </div>
            <span style={{fontSize:11,fontWeight:600,color:a.color,textAlign:'center',lineHeight:1.3}}>{a.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
};

// ── MAIN DASHBOARD ────────────────────────────────────────────
export default function Dashboard() {
  const nav = useNavigate();
  const [roleId, setRoleId] = useState('dg');
  const [data, setData] = useState(null);
  const [time, setTime] = useState(new Date());

  const role = ROLES.find(r=>r.id===roleId)||ROLES[0];

  useEffect(()=>{
    const t = setInterval(()=>setTime(new Date()),60000);
    return ()=>clearInterval(t);
  },[]);

  useEffect(()=>{
    getDashboard().then(d=>setData(d)).catch(()=>setData({totalCA:87000000,jobsCount:4,jobsInProgress:2,invoicesCount:8,tresorerie:45000000}));
  },[]);

  const renderRoleView = () => {
    switch(roleId){
      case 'dg':          return <DGView data={data} nav={nav}/>;
      case 'comptable':   return <ComptableView data={data} nav={nav}/>;
      case 'chef_proj':   return <ChefProjView data={data} nav={nav}/>;
      case 'chef_terrain':return <ChefTerrainView nav={nav}/>;
      case 'rh':          return <RHView nav={nav}/>;
      default:            return <DGView data={data} nav={nav}/>;
    }
  };

  return (
    <div style={{minHeight:'100vh',background:C.bg,fontFamily:"'Inter','Segoe UI',Arial,sans-serif"}}>
      {/* HEADER */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:'0 28px',position:'sticky',top:0,zIndex:100,boxShadow:'0 1px 0 rgba(0,0,0,0.06)'}}>
        <div style={{maxWidth:1400,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',height:58}}>
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:36,height:36,borderRadius:9,background:role.gradient,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Ic d={I[role.icon]} size={18} color='#fff'/>
              </div>
              <div>
                <div style={{fontSize:15,fontWeight:800,color:C.text}}>CleanIT ERP</div>
                <div style={{fontSize:11,color:C.text4}}>Vue: {role.label}</div>
              </div>
            </div>
            {/* Role Switcher */}
            <div style={{display:'flex',gap:1,background:C.bg2,borderRadius:8,padding:3,border:`1px solid ${C.border}`}}>
              {ROLES.map(r=>(
                <button key={r.id} onClick={()=>setRoleId(r.id)}
                  style={{padding:'5px 12px',borderRadius:6,border:'none',background:roleId===r.id?C.white:'transparent',color:roleId===r.id?r.color:C.text3,fontWeight:roleId===r.id?700:400,fontSize:11,cursor:'pointer',transition:'all .2s',boxShadow:roleId===r.id?C.shadow:'none',fontFamily:'inherit',whiteSpace:'nowrap'}}>
                  {r.label.split(' ')[0]} {r.label.split(' ')[1]||''}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>{time.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</div>
              <div style={{fontSize:11,color:C.text4}}>{time.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</div>
            </div>
            <div style={{width:1,height:28,background:C.border}}/>
            <button onClick={()=>nav('/settings')} style={{width:34,height:34,borderRadius:9,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Ic d={I.settings} size={16} color={C.text3}/>
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1400,margin:'0 auto',padding:'20px 28px'}}>
        {/* AI BRIEF */}
        <div style={{marginBottom:16}}>
          <AIBrief role={role} data={data}/>
        </div>

        {/* MAIN GRID */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:16,alignItems:'start'}}>
          {/* ROLE CONTENT */}
          <div>{renderRoleView()}</div>

          {/* RIGHT SIDEBAR */}
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <QuickActions role={role} nav={nav}/>
            <AgendaWidget/>
            <EmailsWidget/>
          </div>
        </div>
      </div>
    </div>
  );
}
