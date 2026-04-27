import { useState, useEffect, useCallback } from "react";
import "../components/CRMDesign.css";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

// ===== CONSTANTS =====
const fmtN = n => new Intl.NumberFormat("fr-FR").format(Math.round(n||0));
const fmtM = n => n>=1000000?`${(n/1000000).toFixed(1)}M`:n>=1000?`${(n/1000).toFixed(0)}K`:`${n}`;
const fmtD = d => d ? new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}) : "—";

// Avatar
const AVATAR_COLORS = [
  {bg:"#EAF0F6",c:"#2D3E50"},{bg:"#E6F9F7",c:"#00A38D"},
  {bg:"#FFF3F0",c:"#F5593E"},{bg:"#E5F5F8",c:"#007A8C"},
  {bg:"#F0ECFB",c:"#6B50C8"},{bg:"#FEF9E7",c:"#C9A200"},
  {bg:"#E6F9F7",c:"#006B3F"},{bg:"#FFF3F0",c:"#E31E24"},
];
const getAC = name => AVATAR_COLORS[(name||"").charCodeAt(0)%AVATAR_COLORS.length];
const getInit = name => (name||"").split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();

// Icons SVG inline
const Ico = ({n,s=16,c="currentColor",cls=""}) => {
  const paths = {
    home:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
    contacts:"M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
    companies:"M3 21h18 M3 7v14 M21 7v14 M9 21V7 M15 21V7 M3 7l9-4 9 4",
    deals:"M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
    tasks:"M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
    reports:"M18 20V10 M12 20V4 M6 20v-6",
    add:"M12 5v14 M5 12h14",
    search:"M21 21l-4.35-4.35 M17 11A6 6 0 115 11a6 6 0 0112 0z",
    filter:"M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
    edit:"M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
    close:"M18 6L6 18 M6 6l12 12",
    check:"M20 6L9 17l-5-5",
    phone:"M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.63 19.79 19.79 0 01.06 4 2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.91a16 16 0 006.12 6.12l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
    mail:"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
    calendar:"M8 2v4 M16 2v4 M3 10h18 M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z",
    note:"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8",
    chev_r:"M9 18l6-6-6-6",
    chev_d:"M6 9l6 6 6-6",
    more:"M12 5h.01 M12 12h.01 M12 19h.01",
    tag:"M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01",
    export:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
    notify:"M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
    settings:"M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
    link:"M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
    trend_up:"M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  };
  const p = paths[n]; if(!p) return null;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c}
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      className={cls} style={{flexShrink:0,display:"block"}}>
      {p.split(" M ").map((seg,i)=><path key={i} d={i===0?seg:`M ${seg}`}/>)}
    </svg>
  );
};

// Avatar component
const Av = ({name="",size=32}) => {
  const ac = getAC(name);
  return <div className="crm-avatar" style={{width:size,height:size,background:ac.bg,color:ac.c,fontSize:size*0.32}}>{getInit(name)}</div>;
};

// Company logo
const CoLogo = ({co,size=30}) => (
  <div className="crm-co-logo" style={{width:size,height:size,background:co.logoColor,color:co.logoText,fontSize:size*0.28}}>{co.logo}</div>
);

// Badge
const Badge = ({status}) => <span className={`crm-badge crm-badge-${status}`}>{STATUS_LABELS[status]||status}</span>;

const STATUS_LABELS = {
  prospect:"Prospect",qualifie:"Qualifié",proposition:"Proposition",
  negociation:"Négociation",gagne:"Gagné",perdu:"Perdu",
  chaud:"Chaud",tiede:"Tiède",froid:"Froid",
  actif:"Actif",inactif:"Inactif",
  fait:"Fait",planifie:"Planifié",urgent:"Urgent",
};

// Button
const Btn = ({label,onClick,variant="default",sm,icon,full,disabled,type="button"}) => (
  <button type={type} onClick={onClick} disabled={disabled}
    className={`crm-btn crm-btn-${variant}${sm?" crm-btn-sm":""}${full?" w-full":""}`}
    style={{width:full?"100%":"auto"}}>
    {icon&&<Ico n={icon} s={sm?13:15} c="currentColor"/>}
    {label}
  </button>
);

// Input
const Inp = ({value,onChange,placeholder,type="text",disabled}) => (
  <input className="crm-input" type={type} value={value}
    onChange={e=>onChange(e.target.value)} placeholder={placeholder||""} disabled={disabled}/>
);
const Sel = ({value,onChange,options,placeholder,disabled}) => (
  <select className="crm-select" value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}>
    <option value="">{placeholder||"Sélectionner..."}</option>
    {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
  </select>
);
const Fld = ({label,required,children,span}) => (
  <div style={{gridColumn:span?"1/-1":"auto"}}>
    <label className="crm-field-label">{label}{required&&<span style={{color:"#F2545B",marginLeft:2}}>*</span>}</label>
    {children}
  </div>
);

// Animated counter
const Counter = ({to,duration=900}) => {
  const [v,setV] = useState(0);
  useEffect(()=>{
    if(!to) return;
    const t = Date.now();
    const r = ()=>{
      const p = Math.min((Date.now()-t)/duration,1);
      const e = 1-Math.pow(1-p,3);
      setV(Math.round(e*to));
      if(p<1) requestAnimationFrame(r);
    };
    requestAnimationFrame(r);
  },[to]);
  return <span>{fmtM(v)}</span>;
};

// Drawer
const Drawer = ({title,onClose,children,width=700,footer}) => (
  <div>
    <div className="crm-overlay" onClick={onClose}/>
    <div className="crm-drawer crm-scroll" style={{width,maxWidth:"96vw"}}>
      <div className="crm-drawer-header">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2 style={{margin:0,fontSize:16,fontWeight:700,color:"var(--hs-g1)"}}>{title}</h2>
          <button onClick={onClose} className="crm-btn crm-btn-ghost crm-btn-sm" style={{width:28,height:28,padding:0}}>
            <Ico n="close" s={14} c="var(--hs-g3)"/>
          </button>
        </div>
      </div>
      <div className="crm-drawer-body crm-scroll">{children}</div>
      {footer&&<div className="crm-drawer-footer">{footer}</div>}
    </div>
  </div>
);

// Modal
const Modal = ({title,onClose,children,maxWidth=520}) => (
  <div className="crm-modal-wrap">
    <div className="crm-modal-bg" onClick={onClose}/>
    <div className="crm-modal" style={{width:"100%",maxWidth}}>
      <div className="crm-modal-header">
        <span className="crm-modal-title">{title}</span>
        <button onClick={onClose} className="crm-btn crm-btn-ghost crm-btn-sm" style={{padding:"3px 6px"}}>
          <Ico n="close" s={14} c="var(--hs-g3)"/>
        </button>
      </div>
      <div className="crm-modal-body crm-scroll">{children}</div>
    </div>
  </div>
);

// Table
const Table = ({cols,rows,onRow,empty="Aucune donnée"}) => (
  <div style={{overflowX:"auto"}}>
    <table className="crm-table">
      <thead><tr>{cols.map(c=><th key={c}>{c}</th>)}</tr></thead>
      <tbody>
        {rows.length===0&&<tr><td colSpan={cols.length} style={{textAlign:"center",padding:"40px",color:"var(--hs-g3)"}}>{empty}</td></tr>}
        {rows.map((row,i)=>(
          <tr key={i} onClick={()=>onRow&&onRow(i)}>
            {row.map((cell,j)=><td key={j}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ===== DATA =====
const CONTACTS = [
  {id:"CT001",name:"Jean-Paul Biya",company:"MTN Cameroun",title:"Directeur Technique",email:"jp.biya@mtn.cm",phone:"+237 677 500 001",status:"actif",lead:"chaud",owner:"Marie Kamga",lastContact:"2024-03-12",created:"2020-01-15",deals:2,notes:"Contact prioritaire. Décideur technique principal MTN."},
  {id:"CT002",name:"Marie Essama",company:"MTN Cameroun",title:"Responsable Achats",email:"m.essama@mtn.cm",phone:"+237 677 500 002",status:"actif",lead:"chaud",owner:"Marie Kamga",lastContact:"2024-03-10",created:"2020-01-15",deals:1,notes:""},
  {id:"CT003",name:"Paul Ndongo",company:"Orange Cameroun",title:"DSI",email:"p.ndongo@orange.cm",phone:"+237 677 600 001",status:"actif",lead:"chaud",owner:"Jean Fouda",lastContact:"2024-03-10",created:"2020-03-01",deals:1,notes:"Décideur final Orange."},
  {id:"CT004",name:"Alice Foé",company:"Orange Cameroun",title:"Chef de Projet",email:"a.foe@orange.cm",phone:"+237 677 600 002",status:"actif",lead:"tiede",owner:"Jean Fouda",lastContact:"2024-02-28",created:"2020-03-01",deals:1,notes:""},
  {id:"CT005",name:"Wang Lei",company:"Huawei Technologies",title:"Country Manager",email:"wang.lei@huawei.com",phone:"+237 677 700 001",status:"actif",lead:"tiede",owner:"Pierre Etoga",lastContact:"2024-02-28",created:"2021-06-01",deals:1,notes:"Partenaire clé Huawei."},
  {id:"CT006",name:"Amina Diallo",company:"Nexttel Cameroun",title:"DG Adjointe",email:"a.diallo@nexttel.cm",phone:"+237 677 800 001",status:"inactif",lead:"froid",owner:"Jean Fouda",lastContact:"2024-02-15",created:"2022-01-10",deals:0,notes:"En attente décision budget."},
];

const COMPANIES = [
  {id:"CO001",name:"MTN Cameroun",sector:"Télécommunications",type:"Grands comptes",city:"Douala",phone:"+237 222 500 500",website:"mtn.cm",ca:450000000,deals:3,contacts:2,owner:"Marie Kamga",lead:"chaud",logo:"MTN",logoColor:"#FFCC00",logoText:"#000000"},
  {id:"CO002",name:"Orange Cameroun",sector:"Télécommunications",type:"Grands comptes",city:"Yaoundé",phone:"+237 222 600 600",website:"orange.cm",ca:320000000,deals:2,contacts:2,owner:"Jean Fouda",lead:"chaud",logo:"ORA",logoColor:"#FF7900",logoText:"#FFFFFF"},
  {id:"CO003",name:"Huawei Technologies",sector:"Technologies",type:"Grands comptes",city:"Douala",phone:"+237 222 700 700",website:"huawei.com",ca:280000000,deals:1,contacts:2,owner:"Pierre Etoga",lead:"tiede",logo:"HUA",logoColor:"#CF0A2C",logoText:"#FFFFFF"},
  {id:"CO004",name:"Nexttel Cameroun",sector:"Télécommunications",type:"Intermédiaires",city:"Douala",phone:"+237 222 800 800",website:"nexttel.cm",ca:120000000,deals:1,contacts:1,owner:"Jean Fouda",lead:"froid",logo:"NXT",logoColor:"#E31E24",logoText:"#FFFFFF"},
  {id:"CO005",name:"CAMTEL",sector:"Télécommunications",type:"Secteur public",city:"Yaoundé",phone:"+237 222 223 000",website:"camtel.cm",ca:95000000,deals:1,contacts:1,owner:"Marie Kamga",lead:"chaud",logo:"CAM",logoColor:"#006B3F",logoText:"#FFFFFF"},
  {id:"CO006",name:"Ministère des Postes",sector:"Administration",type:"Secteur public",city:"Yaoundé",phone:"+237 222 234 000",website:"minpostel.cm",ca:65000000,deals:1,contacts:1,owner:"David Mballa",lead:"froid",logo:"MIN",logoColor:"#2D3E50",logoText:"#FFFFFF"},
];

const DEALS_SEED = [
  {id:"D001",name:"Déploiement 5G Réseau Cœur MTN",companyId:"CO001",company:"MTN Cameroun",contactId:"CT001",contact:"Jean-Paul Biya",amount:180000000,stage:"negociation",prob:75,closeDate:"2024-06-30",owner:"Marie Kamga",created:"2024-01-15",desc:"Extension réseau 5G sur 15 sites à Douala et Yaoundé",tags:["5G","Infrastructure","Prioritaire"],activities:3},
  {id:"D002",name:"Optimisation RF Orange Q2",companyId:"CO002",company:"Orange Cameroun",contactId:"CT003",contact:"Paul Ndongo",amount:85000000,stage:"proposition",prob:60,closeDate:"2024-05-15",owner:"Jean Fouda",created:"2024-02-01",desc:"Mission optimisation RF sur 8 régions",tags:["RF","Optimisation"],activities:2},
  {id:"D003",name:"Fibre Optique CAMTEL Phase 2",companyId:"CO005",company:"CAMTEL",contactId:"CT001",contact:"Jean-Paul Biya",amount:220000000,stage:"qualifie",prob:45,closeDate:"2024-08-31",owner:"Marie Kamga",created:"2024-02-15",desc:"Déploiement fibre optique nationale phase 2",tags:["Fibre","National"],activities:1},
  {id:"D004",name:"Maintenance Préventive Huawei",companyId:"CO003",company:"Huawei Technologies",contactId:"CT005",contact:"Wang Lei",amount:45000000,stage:"negociation",prob:85,closeDate:"2024-04-30",owner:"Pierre Etoga",created:"2024-01-20",desc:"Contrat maintenance préventive 50 sites BTS",tags:["Maintenance"],activities:4},
  {id:"D005",name:"Audit Réseau Nexttel",companyId:"CO004",company:"Nexttel Cameroun",contactId:"CT006",contact:"Amina Diallo",amount:25000000,stage:"prospect",prob:30,closeDate:"2024-07-31",owner:"Jean Fouda",created:"2024-03-01",desc:"Audit complet infrastructure réseau existante",tags:["Audit"],activities:1},
  {id:"D006",name:"5G Small Cells MTN Douala",companyId:"CO001",company:"MTN Cameroun",contactId:"CT001",contact:"Jean-Paul Biya",amount:95000000,stage:"gagne",prob:100,closeDate:"2024-02-28",owner:"Pierre Etoga",created:"2023-12-01",desc:"Installation small cells 5G centre-ville Douala",tags:["5G","Gagné"],activities:5},
  {id:"D007",name:"Réseau VSAT Orange Régions",companyId:"CO002",company:"Orange Cameroun",contactId:"CT003",contact:"Paul Ndongo",amount:38000000,stage:"perdu",prob:0,closeDate:"2024-01-31",owner:"Jean Fouda",created:"2023-11-15",desc:"Déploiement VSAT zones rurales",tags:["VSAT"],activities:2},
];

const TASKS_SEED = [
  {id:"T001",title:"Appel qualification MTN 5G",type:"appel",dealId:"D001",contact:"Jean-Paul Biya",company:"MTN Cameroun",dueDate:"2024-03-15",status:"fait",owner:"Marie Kamga",notes:"Résultat: Positif. Budget confirmé."},
  {id:"T002",title:"Présentation offre Orange RF",type:"reunion",dealId:"D002",contact:"Paul Ndongo",company:"Orange Cameroun",dueDate:"2024-03-18",status:"planifie",owner:"Jean Fouda",notes:"Préparer deck technique + chiffrage."},
  {id:"T003",title:"Envoi proposition CAMTEL",type:"email",dealId:"D003",contact:"Dir. Infrastructure",company:"CAMTEL",dueDate:"2024-03-12",status:"fait",owner:"Marie Kamga",notes:"Proposition envoyée. Délai réponse 15 jours."},
  {id:"T004",title:"Relance Nexttel budget",type:"appel",dealId:"D005",contact:"Amina Diallo",company:"Nexttel Cameroun",dueDate:"2024-03-22",status:"urgent",owner:"Jean Fouda",notes:"Relancer décision budget audit réseau."},
  {id:"T005",title:"Visite site Huawei BTS",type:"visite",dealId:"D004",contact:"Wang Lei",company:"Huawei Technologies",dueDate:"2024-03-20",status:"planifie",owner:"Pierre Etoga",notes:"Inspection 5 sites BTS."},
];

const STAGES = [
  {id:"prospect",    label:"Prospect",    color:"#99ACC2", bg:"#EAF0F6"},
  {id:"qualifie",    label:"Qualifié",    color:"#0091AE", bg:"#E5F5F8"},
  {id:"proposition", label:"Proposition", color:"#C9A200", bg:"#FEF9E7"},
  {id:"negociation", label:"Négociation", color:"#6B50C8", bg:"#F0ECFB"},
  {id:"gagne",       label:"Gagné ✓",    color:"#00BDA5", bg:"#E6F9F7"},
  {id:"perdu",       label:"Perdu ✗",    color:"#F2545B", bg:"#FEF0F1"},
];

// Chart colors
const CHART_COLORS = ["#FF7A59","#0091AE","#00BDA5","#6B50C8","#F5C400","#99ACC2"];

// Monthly CA data
const CA_DATA = [
  {month:"Oct",ca:85,pipeline:120},{month:"Nov",ca:110,pipeline:180},
  {month:"Déc",ca:95,pipeline:140},{month:"Jan",ca:130,pipeline:200},
  {month:"Fév",ca:118,pipeline:165},{month:"Mar",ca:145,pipeline:220},
];

// Tooltip custom Recharts
const CustomTooltip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{background:"white",border:"1px solid var(--hs-border)",borderRadius:4,padding:"10px 14px",boxShadow:"var(--shadow-md)",fontFamily:"Lexend,sans-serif"}}>
      <div style={{fontSize:12,fontWeight:600,color:"var(--hs-g1)",marginBottom:6}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"var(--hs-g2)",marginBottom:2}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:p.color,flexShrink:0}}/>
          {p.name}: <strong style={{color:"var(--hs-g1)"}}>{p.value}M FCFA</strong>
        </div>
      ))}
    </div>
  );
};

// ===== DASHBOARD =====
const Dashboard = ({contacts,companies,deals,tasks,setTab,onDealClick}) => {
  const activeDeals = deals.filter(d=>!["gagne","perdu"].includes(d.stage));
  const wonDeals = deals.filter(d=>d.stage==="gagne");
  const pipeline = activeDeals.reduce((s,d)=>s+d.amount,0);
  const wonAmount = wonDeals.reduce((s,d)=>s+d.amount,0);
  const totalCA = companies.reduce((s,c)=>s+c.ca,0);
  const pendingTasks = tasks.filter(t=>t.status!=="fait").length;
  const urgentTasks = tasks.filter(t=>t.status==="urgent").length;

  // Funnel data
  const funnelData = STAGES.map(s=>({
    ...s, count:deals.filter(d=>d.stage===s.id).length,
    amount:deals.filter(d=>d.stage===s.id).reduce((sum,d)=>sum+d.amount,0),
  }));
  const maxAmt = Math.max(...funnelData.map(s=>s.amount),1);

  // Pie data
  const sectorData = [
    {name:"Télécom",value:865},
    {name:"Tech",value:280},
    {name:"Public",value:160},
  ];
  const stagesPie = funnelData.filter(s=>s.count>0).map(s=>({name:s.label,value:s.count,color:s.color}));

  return (
    <div className="crm-fade-up">
      {/* KPIs */}
      <div className="crm-kpi-grid">
        {[
          {label:"Chiffre d'affaires",value:totalCA,color:"#FF7A59",bg:"#FFF3F0",icon:"deals",sub:`${companies.length} clients · +12% ce mois`,trend:"+12%",trendUp:true},
          {label:"Pipeline commercial",value:pipeline,color:"#0091AE",bg:"#E5F5F8",icon:"reports",sub:`${activeDeals.length} deals actifs`,trend:"+8%",trendUp:true},
          {label:"Deals gagnés",value:wonAmount,color:"#00BDA5",bg:"#E6F9F7",icon:"check",sub:`${wonDeals.length} deal(s) ce trimestre`,trend:"+25%",trendUp:true},
          {label:"Tâches en attente",value:pendingTasks,color:urgentTasks>0?"#F2545B":"#516F90",bg:urgentTasks>0?"#FEF0F1":"#EAF0F6",icon:"tasks",sub:urgentTasks>0?`${urgentTasks} urgente(s) !`:"Tout à jour",trend:urgentTasks>0?"Urgent":null,trendUp:false},
        ].map((k,i)=>(
          <div key={k.label} className="crm-kpi crm-fade-up" style={{"--kpi-c":k.color,"--kpi-bg":k.bg,animationDelay:`${i*0.05}s`}}>
            <div className="crm-kpi-icon"><Ico n={k.icon} s={16} c={k.color}/></div>
            <div className="crm-kpi-label">{k.label}</div>
            <div className="crm-kpi-value">
              {typeof k.value==="number"?<><Counter to={k.value}/> <span style={{fontSize:11,fontWeight:500}}>FCFA</span></>:k.value}
            </div>
            <div className="crm-kpi-sub">{k.sub}</div>
            {k.trend&&<div className="crm-kpi-trend" style={{color:k.trendUp?"#00BDA5":"#F2545B"}}><Ico n={k.trendUp?"trend_up":"trend_up"} s={12} c={k.trendUp?"#00BDA5":"#F2545B"}/>{k.trend}</div>}
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:16,marginBottom:16}}>

        {/* Graphique CA Recharts */}
        <div className="crm-card">
          <div className="crm-card-header">
            <div>
              <div className="crm-card-title">Évolution CA & Pipeline</div>
              <div className="crm-card-subtitle">6 derniers mois · en millions FCFA</div>
            </div>
            <button className="crm-btn crm-btn-ghost crm-btn-sm">Exporter</button>
          </div>
          <div style={{padding:"16px 12px 8px"}}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={CA_DATA} margin={{top:5,right:20,left:0,bottom:0}}>
                <defs>
                  <linearGradient id="gradCA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7A59" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#FF7A59" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gradPL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0091AE" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0091AE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAF0F6" vertical={false}/>
                <XAxis dataKey="month" tick={{fontSize:11,fill:"#99ACC2",fontFamily:"Lexend"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:"#99ACC2",fontFamily:"Lexend"}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}M`}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="ca" name="CA réalisé" stroke="#FF7A59" strokeWidth={2} fill="url(#gradCA)" dot={{r:3,fill:"#FF7A59"}} activeDot={{r:5}}/>
                <Area type="monotone" dataKey="pipeline" name="Pipeline" stroke="#0091AE" strokeWidth={2} fill="url(#gradPL)" strokeDasharray="4 2" dot={{r:3,fill:"#0091AE"}} activeDot={{r:5}}/>
              </AreaChart>
            </ResponsiveContainer>
            <div style={{display:"flex",gap:20,paddingLeft:12,marginTop:4}}>
              {[{c:"#FF7A59",l:"CA réalisé"},{c:"#0091AE",l:"Pipeline"}].map(item=>(
                <div key={item.l} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"var(--hs-g3)"}}>
                  <div style={{width:16,height:2,background:item.c,borderRadius:1}}/>
                  {item.l}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Donuts */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* Pie CA par secteur */}
          <div className="crm-card" style={{flex:1}}>
            <div className="crm-card-header">
              <div className="crm-card-title">CA par secteur</div>
              <button className="crm-btn crm-btn-ghost crm-btn-sm" onClick={()=>setTab("companies")}>Détails →</button>
            </div>
            <div style={{display:"flex",alignItems:"center",padding:"8px 8px 8px 4px"}}>
              <ResponsiveContainer width="55%" height={110}>
                <PieChart>
                  <Pie data={sectorData} cx="50%" cy="50%" innerRadius={28} outerRadius={48} paddingAngle={2} dataKey="value">
                    {sectorData.map((e,i)=><Cell key={i} fill={CHART_COLORS[i]}/>)}
                  </Pie>
                  <Tooltip formatter={(v)=>`${v}M FCFA`} contentStyle={{fontSize:12,fontFamily:"Lexend",border:"1px solid var(--hs-border)",borderRadius:4}}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{flex:1}}>
                {sectorData.map((s,i)=>(
                  <div key={s.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"var(--hs-g2)"}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:CHART_COLORS[i],flexShrink:0}}/>
                      {s.name}
                    </div>
                    <span style={{fontSize:12,fontWeight:600,color:"var(--hs-g1)"}}>{s.value}M</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pie deals par étape */}
          <div className="crm-card" style={{flex:1}}>
            <div className="crm-card-header">
              <div className="crm-card-title">Deals par étape</div>
              <button className="crm-btn crm-btn-ghost crm-btn-sm" onClick={()=>setTab("deals")}>Pipeline →</button>
            </div>
            <div style={{display:"flex",alignItems:"center",padding:"8px 8px 8px 4px"}}>
              <ResponsiveContainer width="55%" height={110}>
                <PieChart>
                  <Pie data={stagesPie} cx="50%" cy="50%" innerRadius={28} outerRadius={48} paddingAngle={2} dataKey="value">
                    {stagesPie.map((e,i)=><Cell key={i} fill={e.color}/>)}
                  </Pie>
                  <Tooltip formatter={(v,n)=>[`${v} deal(s)`,n]} contentStyle={{fontSize:12,fontFamily:"Lexend",border:"1px solid var(--hs-border)",borderRadius:4}}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{flex:1}}>
                {stagesPie.map(s=>(
                  <div key={s.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"var(--hs-g2)"}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:s.color,flexShrink:0}}/>
                      {s.name}
                    </div>
                    <span style={{fontSize:12,fontWeight:600,color:"var(--hs-g1)"}}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom grid */}
      <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:16,marginBottom:16}}>

        {/* Funnel pipeline */}
        <div className="crm-card">
          <div className="crm-card-header">
            <div>
              <div className="crm-card-title">Pipeline commercial — Entonnoir</div>
              <div className="crm-card-subtitle">Valeur par étape de vente</div>
            </div>
            <button className="crm-btn crm-btn-ghost crm-btn-sm" onClick={()=>setTab("deals")}>Vue Kanban →</button>
          </div>
          <div style={{padding:"14px 18px"}}>
            {funnelData.map((s,i)=>(
              <div key={s.id} className="crm-funnel-item" style={{marginBottom:i<funnelData.length-1?12:0}}>
                <div className="crm-funnel-header">
                  <span className="crm-funnel-label">
                    <div style={{width:10,height:10,borderRadius:2,background:s.color,flexShrink:0}}/>
                    {s.label}
                    <span style={{background:"var(--hs-g8)",color:"var(--hs-g2)",padding:"1px 6px",borderRadius:10,fontSize:10,fontWeight:600}}>{s.count}</span>
                  </span>
                  <span className="crm-funnel-amount" style={{color:s.color}}>{s.amount>0?`${fmtM(s.amount)} FCFA`:"—"}</span>
                </div>
                <div className="crm-funnel-track">
                  <div className="crm-funnel-fill" style={{width:`${s.amount>0?Math.max((s.amount/maxAmt)*100,s.count>0?8:0):0}%`,background:s.color}}/>
                </div>
              </div>
            ))}
          </div>
          {/* Summary */}
          <div style={{padding:"12px 18px",borderTop:"1px solid var(--hs-border2)",background:"var(--hs-g9)",display:"flex",gap:24}}>
            {[
              {l:"Pipeline total",v:`${fmtM(pipeline)} FCFA`,c:"#0091AE"},
              {l:"Gagné",v:`${fmtM(wonAmount)} FCFA`,c:"#00BDA5"},
              {l:"Conversion",v:`${deals.length>0?Math.round(wonDeals.length/deals.length*100):0}%`,c:"#FF7A59"},
            ].map(item=>(
              <div key={item.l}>
                <div style={{fontSize:10,color:"var(--hs-g3)",textTransform:"uppercase",letterSpacing:".4px",marginBottom:3}}>{item.l}</div>
                <div style={{fontSize:14,fontWeight:700,color:item.c}}>{item.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tâches + deals récents */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* Deals récents */}
          <div className="crm-card" style={{flex:1}}>
            <div className="crm-card-header">
              <span className="crm-card-title">Deals récents</span>
              <button className="crm-card-link" onClick={()=>setTab("deals")}>Voir tous →</button>
            </div>
            {deals.filter(d=>d.stage!=="perdu").slice(0,3).map((deal,i)=>{
              const co = COMPANIES.find(c=>c.id===deal.companyId);
              return (
                <div key={deal.id} className="crm-row" onClick={()=>onDealClick(deal)}>
                  {co&&<CoLogo co={co} size={28}/>}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:"var(--hs-g1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{deal.name}</div>
                    <div style={{fontSize:11,color:"var(--hs-g3)"}}>{deal.company}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:12,fontWeight:700}}>{fmtM(deal.amount)} FCFA</div>
                    <Badge status={deal.stage}/>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tâches urgentes */}
          <div className="crm-card" style={{flex:1}}>
            <div className="crm-card-header">
              <span className="crm-card-title">Tâches à venir</span>
              <button className="crm-card-link" onClick={()=>setTab("tasks")}>Voir toutes →</button>
            </div>
            {tasks.filter(t=>t.status!=="fait").slice(0,3).map((task,i)=>{
              const tc={appel:"#0091AE",reunion:"#6B50C8",email:"#FF7A59",visite:"#00BDA5",relance:"#F2545B"}[task.type]||"#99ACC2";
              return (
                <div key={task.id} style={{display:"flex",gap:10,padding:"10px 16px",borderBottom:i<2?"1px solid var(--hs-border2)":"none",alignItems:"flex-start"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:tc+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                    <Ico n={{appel:"phone",reunion:"contacts",email:"mail",visite:"companies",relance:"notify"}[task.type]||"tasks"} s={12} c={tc}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600,color:"var(--hs-g1)"}}>{task.title}</div>
                    <div style={{fontSize:11,color:"var(--hs-g3)",marginTop:1}}>{task.company} · {fmtD(task.dueDate)}</div>
                  </div>
                  <Badge status={task.status}/>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table entreprises */}
      <div className="crm-card">
        <div className="crm-card-header">
          <div>
            <div className="crm-card-title">Entreprises — Top clients</div>
            <div className="crm-card-subtitle">Classées par chiffre d'affaires</div>
          </div>
          <button className="crm-btn crm-btn-default crm-btn-sm" onClick={()=>setTab("companies")}>Gérer les entreprises</button>
        </div>
        <Table
          cols={["Entreprise","Secteur","CA","Deals","Lead","Responsable"]}
          rows={[...companies].sort((a,b)=>b.ca-a.ca).map(co=>[
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <CoLogo co={co} size={28}/>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:"#FF7A59",cursor:"pointer"}}>{co.name}</div>
                <div style={{fontSize:11,color:"var(--hs-g3)"}}>{co.city}</div>
              </div>
            </div>,
            <span style={{fontSize:12,color:"var(--hs-g2)"}}>{co.sector}</span>,
            <strong style={{fontSize:13}}>{fmtM(co.ca)} FCFA</strong>,
            <span style={{fontSize:12,fontWeight:600,color:co.deals>0?"#00BDA5":"var(--hs-g3)"}}>{co.deals}</span>,
            <Badge status={co.lead}/>,
            <div style={{display:"flex",alignItems:"center",gap:6}}><Av name={co.owner} size={22}/><span style={{fontSize:12,color:"var(--hs-g2)"}}>{co.owner}</span></div>,
          ])}
        />
      </div>
    </div>
  );
};

// ===== VUE CONTACTS =====
// ===== VUE CONTACTS =====
const VueContacts = ({contacts,deals,onSelect}) => {
  const [search,setSearch] = useState("");
  const [lead,setLead] = useState("tous");
  const [view,setView] = useState("list");
  const filtered = contacts.filter(c=>{
    const ms = !search||`${c.name} ${c.company} ${c.email}`.toLowerCase().includes(search.toLowerCase());
    const ml = lead==="tous"||c.lead===lead;
    return ms&&ml;
  });
  return (
    <div className="crm-page-enter">
      <div className="crm-toolbar-stats" style={{marginBottom:14}}>
        {[{l:"Total",v:contacts.length,c:"var(--hs-g1)"},{l:"Chauds",v:contacts.filter(c=>c.lead==="chaud").length,c:"#FF7A59"},{l:"Tièdes",v:contacts.filter(c=>c.lead==="tiede").length,c:"#C9A200"},{l:"Deals",v:contacts.reduce((s,c)=>s+c.deals,0),c:"#00BDA5"}].map(s=>(
          <div key={s.l} className="crm-toolbar-stat"><strong style={{color:s.c,fontSize:16}}>{s.v}</strong> {s.l}</div>
        ))}
      </div>
      <div className="crm-toolbar">
        <div className="crm-page-search">
          <Ico n="search" s={14} c="var(--hs-g4)"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nom, entreprise, email..." style={{border:"none",outline:"none",fontSize:13,color:"var(--hs-g1)",background:"transparent",flex:1,fontFamily:"inherit"}}/>
        </div>
        <div className="crm-filter-tabs">
          {[{v:"tous",l:"Tous"},{v:"chaud",l:"🔥 Chaud"},{v:"tiede",l:"🌡 Tiède"},{v:"froid",l:"❄️ Froid"}].map(f=>(
            <button key={f.v} className={`crm-filter-tab${lead===f.v?" active":""}`} onClick={()=>setLead(f.v)}>{f.l}</button>
          ))}
        </div>
        <div className="crm-view-toggle">
          <button className={`crm-view-btn${view==="list"?" active":""}`} onClick={()=>setView("list")}><Ico n="tasks" s={13} c="currentColor"/> Liste</button>
          <button className={`crm-view-btn${view==="grid"?" active":""}`} onClick={()=>setView("grid")}><Ico n="reports" s={13} c="currentColor"/> Grille</button>
        </div>
        <div style={{marginLeft:"auto"}}><Btn label="+ Créer un contact" icon="add" variant="primary" sm/></div>
      </div>
      <div style={{fontSize:12,color:"var(--hs-g3)",marginBottom:12}}><strong style={{color:"var(--hs-g1)"}}>{filtered.length}</strong> contact(s)</div>
      {view==="list"&&(
        <div className="crm-card">
          <Table
            cols={["Nom","Entreprise","Titre","Email","Téléphone","Lead","Propriétaire","Dernier contact","Deals"]}
            rows={filtered.map(ct=>[
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <Av name={ct.name} size={34}/>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:"#FF7A59",cursor:"pointer"}} onClick={()=>onSelect(ct)}>{ct.name}</div>
                  <div style={{fontSize:11,color:"var(--hs-g3)"}}>{ct.status==="actif"?"● Actif":"○ Inactif"}</div>
                </div>
              </div>,
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                {COMPANIES.find(co=>co.name===ct.company)&&<CoLogo co={COMPANIES.find(co=>co.name===ct.company)} size={20}/>}
                <span style={{fontSize:12}}>{ct.company}</span>
              </div>,
              <span style={{fontSize:12,color:"var(--hs-g2)"}}>{ct.title}</span>,
              <a href={`mailto:${ct.email}`} style={{fontSize:12,color:"#0091AE",textDecoration:"none"}} onClick={e=>e.stopPropagation()}>{ct.email}</a>,
              <span style={{fontSize:12,color:"var(--hs-g2)"}}>{ct.phone}</span>,
              <Badge status={ct.lead}/>,
              <div style={{display:"flex",alignItems:"center",gap:6}}><Av name={ct.owner} size={22}/><span style={{fontSize:12,color:"var(--hs-g2)"}}>{ct.owner.split(" ")[0]}</span></div>,
              <span style={{fontSize:12,color:"var(--hs-g3)"}}>{fmtD(ct.lastContact)}</span>,
              <span style={{fontSize:12,fontWeight:700,color:ct.deals>0?"#00BDA5":"var(--hs-g5)",padding:"2px 8px",borderRadius:10,background:ct.deals>0?"#E6F9F7":"transparent"}}>{ct.deals}</span>,
            ])}
            onRow={i=>onSelect(filtered[i])}
          />
        </div>
      )}
      {view==="grid"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
          {filtered.map((ct,i)=>(
            <div key={ct.id} className="crm-contact-card" onClick={()=>onSelect(ct)}>
              <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:12,paddingBottom:12,borderBottom:"1px solid var(--hs-border2)"}}>
                <Av name={ct.name} size={46}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:700,color:"var(--hs-g1)",marginBottom:2}}>{ct.name}</div>
                  <div style={{fontSize:12,color:"var(--hs-g3)",marginBottom:5}}>{ct.title}</div>
                  <div style={{display:"flex",gap:5}}><Badge status={ct.lead}/></div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:7,fontSize:12,color:"var(--hs-g2)",marginBottom:6,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                <Ico n="companies" s={12} c="var(--hs-g4)"/>{ct.company}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:7,fontSize:12,color:"var(--hs-g2)",marginBottom:6}}>
                <Ico n="mail" s={12} c="var(--hs-g4)"/>{ct.email}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:7,fontSize:12,color:"var(--hs-g2)",marginBottom:12}}>
                <Ico n="phone" s={12} c="var(--hs-g4)"/>{ct.phone}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:10,borderTop:"1px solid var(--hs-border2)"}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}><Av name={ct.owner} size={20}/><span style={{fontSize:11,color:"var(--hs-g3)"}}>{ct.owner.split(" ")[0]}</span></div>
                <span style={{fontSize:11,fontWeight:700,color:ct.deals>0?"#00BDA5":"var(--hs-g4)",padding:"2px 8px",borderRadius:10,background:ct.deals>0?"#E6F9F7":"transparent"}}>{ct.deals} deal{ct.deals>1?"s":""}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const VueCompanies = ({companies,deals,onSelect}) => {
  const [search,setSearch] = useState("");
  const [view,setView] = useState("grid");
  const [filterType,setFilterType] = useState("tous");
  const filtered = companies.filter(c=>{
    const ms = !search||c.name.toLowerCase().includes(search.toLowerCase())||c.sector.toLowerCase().includes(search.toLowerCase());
    const mt = filterType==="tous"||c.type===filterType;
    return ms&&mt;
  });
  const totalCA = companies.reduce((s,c)=>s+c.ca,0);
  return (
    <div className="crm-page-enter">
      {/* Stats */}
      <div className="crm-toolbar-stats">
        {[
          {l:"Entreprises",v:companies.length,c:"var(--hs-g1)"},
          {l:"CA total",v:`${fmtM(totalCA)} FCFA`,c:"#FF7A59"},
          {l:"Grands comptes",v:companies.filter(c=>c.type==="Grands comptes").length,c:"#0091AE"},
          {l:"Leads chauds",v:companies.filter(c=>c.lead==="chaud").length,c:"#F2545B"},
        ].map(s=>(
          <div key={s.l} className="crm-toolbar-stat"><strong style={{color:s.c,fontSize:15}}>{s.v}</strong> {s.l}</div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="crm-toolbar">
        <div className="crm-page-search">
          <Ico n="search" s={14} c="var(--hs-g4)"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nom, secteur..."
            style={{border:"none",outline:"none",fontSize:13,color:"var(--hs-g1)",background:"transparent",flex:1,fontFamily:"inherit"}}/>
        </div>
        <div className="crm-filter-tabs">
          {[{v:"tous",l:"Tous"},{v:"Grands comptes",l:"Grands comptes"},{v:"Secteur public",l:"Public"},{v:"Intermédiaires",l:"PME"}].map(f=>(
            <button key={f.v} className={`crm-filter-tab${filterType===f.v?" active":""}`} onClick={()=>setFilterType(f.v)}>{f.l}</button>
          ))}
        </div>
        <div className="crm-view-toggle">
          <button className={`crm-view-btn${view==="grid"?" active":""}`} onClick={()=>setView("grid")}><Ico n="reports" s={13} c="currentColor"/>Grille</button>
          <button className={`crm-view-btn${view==="list"?" active":""}`} onClick={()=>setView("list")}><Ico n="tasks" s={13} c="currentColor"/>Liste</button>
        </div>
        <div style={{marginLeft:"auto"}}><Btn label="+ Créer une entreprise" icon="add" variant="primary" sm/></div>
      </div>

      <div style={{fontSize:12,color:"var(--hs-g3)",marginBottom:12}}><strong style={{color:"var(--hs-g1)"}}>{filtered.length}</strong> entreprise(s)</div>

      {/* Vue grille */}
      {view==="grid"&&(
        <div className="crm-grid-4">
          {filtered.map((co,i)=>(
            <div key={co.id} className="crm-company-card" style={{"--co-color":co.logoColor,animationDelay:`${i*0.04}s`}} onClick={()=>onSelect(co)}>
              <div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:12}}>
                <CoLogo co={co} size={48}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:700,color:"var(--hs-g1)",marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{co.name}</div>
                  <div style={{fontSize:12,color:"var(--hs-g3)",marginBottom:6}}>{co.sector}</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    <Badge status={co.lead}/>
                    <span style={{fontSize:10,padding:"2px 6px",borderRadius:2,background:"var(--hs-g8)",color:"var(--hs-g2)"}}>{co.type}</span>
                  </div>
                </div>
              </div>
              <div className="crm-company-stats">
                <div>
                  <div className="crm-company-stat-label">CA actuel</div>
                  <div className="crm-company-stat-value" style={{color:"#FF7A59"}}>{fmtM(co.ca)}</div>
                  <div style={{fontSize:10,color:"var(--hs-g3)"}}>FCFA</div>
                </div>
                <div>
                  <div className="crm-company-stat-label">Deals actifs</div>
                  <div className="crm-company-stat-value" style={{color:"#00BDA5"}}>{co.deals}</div>
                  <div style={{fontSize:10,color:"var(--hs-g3)"}}>deal(s)</div>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"var(--hs-g3)"}}>
                  <Ico n="link" s={11} c="var(--hs-g4)"/>{co.website}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:4}}><Av name={co.owner} size={20}/><span style={{fontSize:11,color:"var(--hs-g3)"}}>{co.owner.split(" ")[0]}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vue liste */}
      {view==="list"&&(
        <div className="crm-card">
          <Table
            cols={["Entreprise","Secteur","Type","Ville","CA","Contacts","Deals","Lead","Propriétaire"]}
            rows={filtered.map(co=>[
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <CoLogo co={co} size={30}/>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:"#FF7A59",cursor:"pointer"}}>{co.name}</div>
                  <div style={{fontSize:11,color:"var(--hs-g3)"}}>{co.website}</div>
                </div>
              </div>,
              <span style={{fontSize:12,color:"var(--hs-g2)"}}>{co.sector}</span>,
              <span style={{fontSize:11,padding:"2px 6px",borderRadius:2,background:"var(--hs-g8)",color:"var(--hs-g2)"}}>{co.type}</span>,
              <span style={{fontSize:12,color:"var(--hs-g2)"}}>{co.city}</span>,
              <strong style={{fontSize:13,color:"#FF7A59"}}>{fmtM(co.ca)} FCFA</strong>,
              <span style={{fontSize:12}}>{co.contacts}</span>,
              <span style={{fontSize:12,fontWeight:700,color:co.deals>0?"#00BDA5":"var(--hs-g4)"}}>{co.deals}</span>,
              <Badge status={co.lead}/>,
              <div style={{display:"flex",alignItems:"center",gap:6}}><Av name={co.owner} size={22}/><span style={{fontSize:12,color:"var(--hs-g2)"}}>{co.owner.split(" ")[0]}</span></div>,
            ])}
            onRow={i=>onSelect(filtered[i])}
          />
        </div>
      )}
    </div>
  );
};

// ===== VUE DEALS KANBAN =====
const VueDeals = ({deals,setDeals,companies,onSelect}) => {
  const [view,setView] = useState("board");
  const [dragId,setDragId] = useState(null);
  const [search,setSearch] = useState("");
  const filtered = deals.filter(d=>!search||d.name.toLowerCase().includes(search.toLowerCase())||d.company.toLowerCase().includes(search.toLowerCase()));
  const moveD = (id,stage) => setDeals(p=>p.map(d=>d.id===id?{...d,stage}:d));

  return (
    <div>
      <div className="crm-toolbar">
        <div className="crm-page-search">
          <Ico n="search" s={14} c="var(--hs-g4)"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un deal..." style={{border:"none",outline:"none",fontSize:13,color:"var(--hs-g1)",background:"transparent",flex:1,fontFamily:"inherit"}}/>
        </div>
        <div className="crm-filter-tabs">
          {[{v:"board",l:"Kanban"},{v:"list",l:"Liste"}].map(vt=>(
            <button key={vt.v} className={`crm-filter-tab${view===vt.v?" active":""}`} onClick={()=>setView(vt.v)}>{vt.l}</button>
          ))}
        </div>
        <Btn label="Filtres" icon="filter" sm/>
        <div style={{marginLeft:"auto"}}><Btn label="Créer un deal" icon="add" variant="primary" sm/></div>
      </div>

      {view==="board"&&(
        <div className="crm-kanban">
          {STAGES.map(stage=>{
            const stageDeals = filtered.filter(d=>d.stage===stage.id);
            const total = stageDeals.reduce((s,d)=>s+d.amount,0);
            return (
              <div key={stage.id} className="crm-col"
                onDragOver={e=>{e.preventDefault();}}
                onDrop={e=>{e.preventDefault();if(dragId)moveD(dragId,stage.id);}}>
                {/* Header */}
                <div className="crm-col-header" style={{background:stage.bg,borderColor:stage.color+"30"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:12,fontWeight:700,color:stage.color}}>{stage.label}</span>
                      <span style={{width:18,height:18,borderRadius:"50%",background:stage.color,color:"white",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{stageDeals.length}</span>
                    </div>
                    <Ico n="add" s={13} c={stage.color} cls="" style={{cursor:"pointer"}}/>
                  </div>
                  {total>0&&<div style={{fontSize:11,fontWeight:600,color:stage.color,marginTop:2}}>{fmtM(total)} FCFA</div>}
                </div>
                {/* Body */}
                <div className="crm-col-body" style={{borderColor:stage.color+"20",background:"rgba(0,0,0,0.015)"}}>
                  {stageDeals.map(deal=>{
                    const co = companies.find(c=>c.id===deal.companyId);
                    return (
                      <div key={deal.id} className="crm-deal-card"
                        draggable onDragStart={()=>setDragId(deal.id)} onDragEnd={()=>setDragId(null)}
                        onClick={()=>onSelect(deal)}>
                        {co&&<div className="crm-deal-card-company">
                          <CoLogo co={co} size={16}/>{deal.company}
                        </div>}
                        <div className="crm-deal-card-name">{deal.name}</div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                          <span className="crm-deal-amount">{fmtM(deal.amount)} FCFA</span>
                          <span style={{fontSize:11,fontWeight:600,padding:"2px 6px",borderRadius:2,background:deal.prob>=70?"#E6F9F7":deal.prob>=40?"#FEF9E7":"#FEF0F1",color:deal.prob>=70?"#00BDA5":deal.prob>=40?"#C9A200":"#F2545B"}}>{deal.prob}%</span>
                        </div>
                        <div className="crm-progress">
                          <div className="crm-progress-fill" style={{width:`${deal.prob}%`,background:deal.prob>=70?"#00BDA5":deal.prob>=40?"#F5C400":"#F2545B"}}/>
                        </div>
                        <div className="crm-deal-footer">
                          <div style={{display:"flex",alignItems:"center",gap:4}}><Av name={deal.owner} size={16}/><span style={{fontSize:10,color:"var(--hs-g3)"}}>{deal.owner.split(" ")[0]}</span></div>
                          <span style={{fontSize:10,color:"var(--hs-g4)"}}>{fmtD(deal.closeDate).slice(0,6)}</span>
                        </div>
                        {deal.tags?.length>0&&<div style={{display:"flex",gap:4,marginTop:6,flexWrap:"wrap"}}>
                          {deal.tags.slice(0,2).map(t=><span key={t} style={{fontSize:9,padding:"1px 5px",borderRadius:2,background:"#E5F5F8",color:"#0091AE",fontWeight:500}}>{t}</span>)}
                        </div>}
                      </div>
                    );
                  })}
                  {stageDeals.length===0&&<div style={{padding:"16px 10px",textAlign:"center",color:"var(--hs-g4)",fontSize:12,border:"2px dashed var(--hs-border)",borderRadius:4}}>Glisser ici</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view==="list"&&(
        <div className="crm-card">
          <Table
            cols={["Deal","Entreprise","Contact","Montant","Étape","Prob.","Clôture","Propriétaire"]}
            rows={filtered.map(d=>{
              const co=companies.find(c=>c.id===d.companyId);
              return [
                <span style={{fontSize:13,fontWeight:600,color:"#FF7A59",cursor:"pointer"}} onClick={()=>onSelect(d)}>{d.name}</span>,
                <div style={{display:"flex",alignItems:"center",gap:8}}>{co&&<CoLogo co={co} size={20}/>}<span style={{fontSize:12}}>{d.company}</span></div>,
                <span style={{fontSize:12,color:"var(--hs-g2)"}}>{d.contact}</span>,
                <strong>{fmtM(d.amount)} FCFA</strong>,
                <Badge status={d.stage}/>,
                <div><span style={{fontSize:12,fontWeight:600,color:d.prob>=70?"#00BDA5":d.prob>=40?"#C9A200":"#F2545B"}}>{d.prob}%</span><div className="crm-progress" style={{marginTop:3,width:50}}><div className="crm-progress-fill" style={{width:`${d.prob}%`,background:d.prob>=70?"#00BDA5":d.prob>=40?"#F5C400":"#F2545B"}}/></div></div>,
                <span style={{fontSize:12,color:"var(--hs-g3)"}}>{fmtD(d.closeDate)}</span>,
                <div style={{display:"flex",alignItems:"center",gap:6}}><Av name={d.owner} size={20}/><span style={{fontSize:12,color:"var(--hs-g2)"}}>{d.owner.split(" ")[0]}</span></div>,
              ];
            })}
            onRow={i=>onSelect(filtered[i])}
          />
        </div>
      )}
    </div>
  );
};

// ===== VUE TÂCHES =====
const VueTasks = ({tasks,setTasks}) => {
  const [filter,setFilter] = useState("tous");
  const filtered = tasks.filter(t=>filter==="tous"||t.status===filter||t.type===filter);
  const markDone = id => setTasks(p=>p.map(t=>t.id===id?{...t,status:"fait"}:t));
  const urgent=tasks.filter(t=>t.status==="urgent").length;
  const planifie=tasks.filter(t=>t.status==="planifie").length;
  const fait=tasks.filter(t=>t.status==="fait").length;
  return (
    <div className="crm-page-enter">
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
        {[{l:"Total",v:tasks.length,c:"var(--hs-g1)",bg:"var(--hs-g9)",b:"var(--hs-border)"},{l:"Planifiées",v:planifie,c:"#0091AE",bg:"#E5F5F8",b:"#B3DDE5"},{l:"Urgentes",v:urgent,c:"#F2545B",bg:"#FEF0F1",b:"#F8B4B6"},{l:"Réalisées",v:fait,c:"#00BDA5",bg:"#E6F9F7",b:"#99E6DD"}].map(s=>(
          <div key={s.l} style={{background:s.bg,border:`1px solid ${s.b}`,borderRadius:4,padding:"14px 18px"}}>
            <div style={{fontSize:24,fontWeight:700,color:s.c,marginBottom:3}}>{s.v}</div>
            <div style={{fontSize:12,color:"var(--hs-g2)"}}>{s.l}</div>
          </div>
        ))}
      </div>
      <div className="crm-toolbar">
        <div className="crm-filter-tabs">
          {[{v:"tous",l:`Toutes (${tasks.length})`},{v:"planifie",l:"Planifiées"},{v:"urgent",l:"🔴 Urgentes"},{v:"fait",l:"✓ Faites"}].map(f=>(
            <button key={f.v} className={`crm-filter-tab${filter===f.v?" active":""}`} onClick={()=>setFilter(f.v)}>{f.l}</button>
          ))}
        </div>
        <div style={{marginLeft:"auto"}}><Btn label="+ Créer une tâche" icon="add" variant="primary" sm/></div>
      </div>
      <div className="crm-card">
        {filtered.map((task,i)=>{
          const tc={appel:"#0091AE",reunion:"#6B50C8",email:"#FF7A59",visite:"#00BDA5",relance:"#F2545B"}[task.type]||"#99ACC2";
          const typeIco={appel:"phone",reunion:"contacts",email:"mail",visite:"companies",relance:"notify"}[task.type]||"tasks";
          const isDone=task.status==="fait";
          const isUrgent=task.status==="urgent";
          return (
            <div key={task.id} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 18px",borderBottom:"1px solid var(--hs-border2)",background:isUrgent?"#FFF8F8":"white",borderLeft:`3px solid ${isUrgent?"#F2545B":isDone?"#00BDA5":"transparent"}`,transition:"background .1s",cursor:"pointer"}}
              onMouseEnter={e=>e.currentTarget.style.background=isUrgent?"#FFF0F0":"var(--hs-g9)"}
              onMouseLeave={e=>e.currentTarget.style.background=isUrgent?"#FFF8F8":"white"}>
              <div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${isDone?"#00BDA5":isUrgent?"#F2545B":"var(--hs-border)"}`,background:isDone?"#00BDA5":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,transition:"all .15s"}} onClick={()=>markDone(task.id)}>
                {isDone&&<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <div style={{width:32,height:32,borderRadius:"50%",background:tc+"15",border:`1px solid ${tc}25`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Ico n={typeIco} s={14} c={tc}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:isDone?400:600,color:isDone?"var(--hs-g4)":"var(--hs-g1)",textDecoration:isDone?"line-through":"none",marginBottom:3}}>{task.title}</div>
                <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                  {task.company&&<span style={{fontSize:11,color:"var(--hs-g3)",display:"flex",alignItems:"center",gap:3}}><Ico n="companies" s={10} c="var(--hs-g4)"/>{task.company}</span>}
                  {task.contact&&<span style={{fontSize:11,color:"var(--hs-g3)",display:"flex",alignItems:"center",gap:3}}><Ico n="contacts" s={10} c="var(--hs-g4)"/>{task.contact}</span>}
                </div>
              </div>
              <div style={{textAlign:"center",flexShrink:0,minWidth:90}}>
                <div style={{fontSize:10,color:"var(--hs-g3)",marginBottom:2}}>Échéance</div>
                <div style={{fontSize:12,fontWeight:600,color:isUrgent?"#F2545B":"var(--hs-g1)"}}>{fmtD(task.dueDate)}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
                <Av name={task.owner} size={24}/>
                <span style={{fontSize:11,color:"var(--hs-g3)"}}>{task.owner.split(" ")[0]}</span>
              </div>
              <Badge status={task.status}/>
              {!isDone&&<button onClick={()=>markDone(task.id)} className="crm-btn crm-btn-success crm-btn-sm">✓</button>}
              <button className="crm-btn crm-btn-default crm-btn-sm"><Ico n="edit" s={12} c="var(--hs-g3)"/></button>
            </div>
          );
        })}
        {filtered.length===0&&<div style={{padding:"48px",textAlign:"center",color:"var(--hs-g3)"}}>Aucune tâche</div>}
      </div>
    </div>
  );
};

// ===== FICHE CONTACT =====
const FicheContact = ({contact,deals,onClose}) => {
  const [tab,setTab] = useState("about");
  const contactDeals = deals.filter(d=>d.contactId===contact.id);
  return (
    <Drawer title="" onClose={onClose} width={680}
      footer={<><Btn label="Fermer" onClick={onClose}/><Btn label="Modifier" icon="edit" variant="primary"/></>}>
      <div className="crm-profile-hero">
        <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:14}}>
          <Av name={contact.name} size={54}/>
          <div style={{flex:1}}>
            <div className="crm-profile-name">{contact.name}</div>
            <div className="crm-profile-sub">{contact.title} · {contact.company}</div>
            <div style={{display:"flex",gap:6}}><Badge status={contact.lead}/><Badge status={contact.status}/></div>
          </div>
        </div>
        <div className="crm-quick-actions">
          <Btn label="Appeler" icon="phone" sm/><Btn label="Email" icon="mail" sm/><Btn label="Tâche" icon="tasks" sm/><Btn label="Note" icon="note" sm/>
        </div>
      </div>
      <div className="crm-tabs">
        {[{id:"about",l:"À propos"},{id:"activity",l:"Activité"},{id:"deals",l:`Deals (${contactDeals.length})`}].map(t=>(
          <button key={t.id} className={`crm-tab${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>{t.l}</button>
        ))}
      </div>
      <div style={{padding:"20px 24px"}}>
        {tab==="about"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
            <div>
              <div className="crm-section-title">Informations contact</div>
              {[["Email",contact.email],["Téléphone",contact.phone],["Entreprise",contact.company],["Titre",contact.title]].map(([l,v])=>(
                <div key={l} className="crm-info-row"><span className="crm-info-label">{l}</span><span className="crm-info-value">{v||"—"}</span></div>
              ))}
            </div>
            <div>
              <div className="crm-section-title">CRM</div>
              {[["Propriétaire",contact.owner],["Dernier contact",fmtD(contact.lastContact)],["Créé le",fmtD(contact.created)],["Deals associés",contact.deals]].map(([l,v])=>(
                <div key={l} className="crm-info-row"><span className="crm-info-label">{l}</span><span className="crm-info-value">{v||"—"}</span></div>
              ))}
              {contact.notes&&<div style={{marginTop:14,padding:"10px 12px",background:"#FEF9E7",border:"1px solid #F5C400",borderRadius:3,fontSize:12,color:"var(--hs-g1)"}}>{contact.notes}</div>}
            </div>
          </div>
        )}
        {tab==="activity"&&(
          <div className="crm-empty">
            <Ico n="calendar" s={36} c="var(--hs-border)" cls="crm-empty-icon"/>
            <div className="crm-empty-title">Aucune activité récente</div>
            <div className="crm-empty-sub">Commencez par créer un appel, email ou réunion</div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}><Btn label="Appeler" icon="phone" sm/><Btn label="Email" icon="mail" sm/><Btn label="Réunion" icon="contacts" sm/></div>
          </div>
        )}
        {tab==="deals"&&(
          <div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}><Btn label="Créer un deal" icon="add" variant="primary" sm/></div>
            {contactDeals.length===0?<div className="crm-empty"><div className="crm-empty-title">Aucun deal associé</div></div>
            :contactDeals.map(deal=>(
              <div key={deal.id} style={{border:"1px solid var(--hs-border)",borderRadius:3,padding:"14px 16px",marginBottom:10,cursor:"pointer",transition:"border-color .12s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="#FF7A59"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="var(--hs-border)"}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontSize:13,fontWeight:600,color:"#FF7A59"}}>{deal.name}</span>
                  <Badge status={deal.stage}/>
                </div>
                <div style={{display:"flex",gap:16}}>
                  {[["Montant",`${fmtM(deal.amount)} FCFA`],["Proba",`${deal.prob}%`],["Clôture",fmtD(deal.closeDate)]].map(([l,v])=>(
                    <div key={l}><div style={{fontSize:10,color:"var(--hs-g3)",marginBottom:1}}>{l}</div><div style={{fontSize:12,fontWeight:600}}>{v}</div></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
};

// ===== FICHE DEAL =====
const FicheDeal = ({deal,companies,contacts,tasks,onClose,onStageChange}) => {
  const [tab,setTab] = useState("overview");
  const co = companies.find(c=>c.id===deal.companyId);
  const dealTasks = tasks.filter(t=>t.dealId===deal.id);
  const stageIdx = STAGES.findIndex(s=>s.id===deal.stage);
  return (
    <Drawer title="" onClose={onClose} width={740}
      footer={<><Btn label="Fermer" onClick={onClose}/><Btn label="Modifier" icon="edit"/>{deal.stage!=="gagne"&&<Btn label="Marquer Gagné" icon="check" variant="success"/>}</>}>
      {/* Header */}
      <div style={{padding:"20px 24px",borderBottom:"1px solid var(--hs-border)",background:"var(--hs-g9)"}}>
        <div style={{fontSize:11,color:"var(--hs-g3)",marginBottom:6,display:"flex",alignItems:"center",gap:4}}>
          CRM <Ico n="chev_r" s={11} c="var(--hs-g3)"/> Deals <Ico n="chev_r" s={11} c="var(--hs-g3)"/> <span style={{color:"var(--hs-g1)"}}>{deal.name}</span>
        </div>
        <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:14}}>
          {co&&<CoLogo co={co} size={42}/>}
          <div style={{flex:1}}>
            <div style={{fontSize:19,fontWeight:700,color:"var(--hs-g1)",marginBottom:4}}>{deal.name}</div>
            <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
              <strong style={{fontSize:15}}>{fmtM(deal.amount)} FCFA</strong>
              <span style={{color:"var(--hs-g4)"}}>·</span>
              <Badge status={deal.stage}/>
              <span style={{color:"var(--hs-g4)"}}>·</span>
              <span style={{fontSize:12,color:"var(--hs-g3)"}}>Clôture: {fmtD(deal.closeDate)}</span>
            </div>
          </div>
        </div>
        {/* Stage pipeline */}
        <div className="crm-stage-pipeline">
          {STAGES.filter(s=>!["gagne","perdu"].includes(s.id)).map((s,i)=>{
            const sIdx = STAGES.findIndex(st=>st.id===s.id);
            const isActive = s.id===deal.stage;
            const isDone = sIdx<stageIdx && !["gagne","perdu"].includes(deal.stage);
            return (
              <div key={s.id} className={`crm-stage-step${isActive?" active":isDone?" done":""}`}
                onClick={()=>onStageChange(deal.id,s.id)}>
                {s.label}
              </div>
            );
          })}
        </div>
      </div>
      {/* Tabs */}
      <div className="crm-tabs">
        {[{id:"overview",l:"Aperçu"},{id:"activity",l:"Activité"},{id:"tasks",l:`Tâches (${dealTasks.length})`}].map(t=>(
          <button key={t.id} className={`crm-tab${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>{t.l}</button>
        ))}
      </div>
      <div style={{padding:"20px 24px"}}>
        {tab==="overview"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
            <div>
              <div className="crm-section-title">Informations du deal</div>
              {[["Montant",`${fmtN(deal.amount)} FCFA`],["Probabilité",`${deal.prob}%`],["Étape",<Badge status={deal.stage}/>],["Clôture prévue",fmtD(deal.closeDate)],["Propriétaire",deal.owner],["Créé le",fmtD(deal.created)]].map(([l,v])=>(
                <div key={l} className="crm-info-row"><span className="crm-info-label">{l}</span><span className="crm-info-value">{v}</span></div>
              ))}
            </div>
            <div>
              {co&&<>
                <div className="crm-section-title">Entreprise</div>
                <div style={{display:"flex",gap:10,alignItems:"center",padding:"10px 12px",border:"1px solid var(--hs-border)",borderRadius:3,marginBottom:14,cursor:"pointer",transition:"border-color .12s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="#FF7A59"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="var(--hs-border)"}>
                  <CoLogo co={co} size={30}/>
                  <div><div style={{fontSize:13,fontWeight:600,color:"#FF7A59"}}>{co.name}</div><div style={{fontSize:11,color:"var(--hs-g3)"}}>{co.sector}</div></div>
                </div>
              </>}
              {deal.desc&&<>
                <div className="crm-section-title">Description</div>
                <div style={{fontSize:13,color:"var(--hs-g2)",lineHeight:1.6,marginBottom:14}}>{deal.desc}</div>
              </>}
              {deal.tags?.length>0&&<>
                <div className="crm-section-title">Tags</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {deal.tags.map(t=><span key={t} style={{fontSize:11,padding:"3px 8px",borderRadius:2,background:"#E5F5F8",color:"#0091AE",fontWeight:500,display:"flex",alignItems:"center",gap:3}}><Ico n="tag" s={10} c="#0091AE"/>{t}</span>)}
                </div>
              </>}
            </div>
          </div>
        )}
        {tab==="activity"&&(
          <div className="crm-empty">
            <Ico n="calendar" s={36} c="var(--hs-border)" cls="crm-empty-icon"/>
            <div className="crm-empty-title">Aucune activité</div>
            <div className="crm-empty-sub">Planifiez un appel, email ou réunion</div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}><Btn label="Appeler" icon="phone" sm/><Btn label="Email" icon="mail" sm/><Btn label="Note" icon="note" sm/></div>
          </div>
        )}
        {tab==="tasks"&&(
          <div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}><Btn label="Créer une tâche" icon="add" variant="primary" sm/></div>
            {dealTasks.length===0?<div className="crm-empty"><div className="crm-empty-title">Aucune tâche</div></div>
            :dealTasks.map(task=>{
              const tc={appel:"#0091AE",reunion:"#6B50C8",email:"#FF7A59",visite:"#00BDA5",relance:"#F2545B"}[task.type]||"#99ACC2";
              return (
                <div key={task.id} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:"1px solid var(--hs-border2)",alignItems:"flex-start"}}>
                  <div style={{width:30,height:30,borderRadius:"50%",background:tc+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ico n={{appel:"phone",reunion:"contacts",email:"mail",visite:"companies",relance:"notify"}[task.type]||"tasks"} s={13} c={tc}/></div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:"var(--hs-g1)"}}>{task.title}</div>
                    <div style={{fontSize:11,color:"var(--hs-g3)",marginTop:1}}>{fmtD(task.dueDate)} · {task.owner}</div>
                    {task.notes&&<div style={{fontSize:12,color:"var(--hs-g2)",marginTop:4,background:"var(--hs-g9)",padding:"6px 10px",borderRadius:3}}>{task.notes}</div>}
                  </div>
                  <Badge status={task.status}/>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Drawer>
  );
};

// ===== FICHE ENTREPRISE =====
const FicheCompany = ({company,deals,contacts,onClose}) => {
  const [tab,setTab] = useState("about");
  const coDeals = deals.filter(d=>d.companyId===company.id);
  const coContacts = contacts.filter(c=>c.company===company.name);
  return (
    <Drawer title="" onClose={onClose} width={700}
      footer={<><Btn label="Fermer" onClick={onClose}/><Btn label="Modifier" icon="edit" variant="primary"/></>}>
      <div className="crm-profile-hero">
        <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:14}}>
          <CoLogo co={company} size={54}/>
          <div style={{flex:1}}>
            <div className="crm-profile-name">{company.name}</div>
            <div className="crm-profile-sub">{company.sector} · {company.city}</div>
            <Badge status={company.lead}/>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11,color:"var(--hs-g3)",marginBottom:4}}>CA TOTAL</div>
            <div style={{fontSize:20,fontWeight:700,color:"#FF7A59"}}>{fmtM(company.ca)} FCFA</div>
          </div>
        </div>
        <div className="crm-quick-actions">
          <Btn label="Appeler" icon="phone" sm/><Btn label="Email" icon="mail" sm/><Btn label="Nouveau deal" icon="deals" sm/><Btn label="Tâche" icon="tasks" sm/>
        </div>
      </div>
      <div className="crm-tabs">
        {[{id:"about",l:"À propos"},{id:"contacts",l:`Contacts (${coContacts.length})`},{id:"deals",l:`Deals (${coDeals.length})`}].map(t=>(
          <button key={t.id} className={`crm-tab${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>{t.l}</button>
        ))}
      </div>
      <div style={{padding:"20px 24px"}}>
        {tab==="about"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
            <div>
              <div className="crm-section-title">Informations entreprise</div>
              {[["Nom",company.name],["Secteur",company.sector],["Type",company.type],["Ville",company.city],["Téléphone",company.phone],["Site web",company.website]].map(([l,v])=>(
                <div key={l} className="crm-info-row"><span className="crm-info-label">{l}</span><span className="crm-info-value">{v||"—"}</span></div>
              ))}
            </div>
            <div>
              <div className="crm-section-title">Données commerciales</div>
              {[["CA actuel",`${fmtM(company.ca)} FCFA`],["Lead scoring",<Badge status={company.lead}/>],["Responsable",company.owner],["Contacts",company.contacts],["Deals",company.deals]].map(([l,v])=>(
                <div key={l} className="crm-info-row"><span className="crm-info-label">{l}</span><span className="crm-info-value">{v||"—"}</span></div>
              ))}
            </div>
          </div>
        )}
        {tab==="contacts"&&(
          <div>
            {coContacts.map(ct=>(
              <div key={ct.id} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:"1px solid var(--hs-border2)",alignItems:"center"}}>
                <Av name={ct.name} size={36}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#FF7A59"}}>{ct.name}</div>
                  <div style={{fontSize:11,color:"var(--hs-g3)"}}>{ct.title} · {ct.email}</div>
                </div>
                <Badge status={ct.lead}/>
              </div>
            ))}
          </div>
        )}
        {tab==="deals"&&(
          <div>
            {coDeals.length===0?<div className="crm-empty"><div className="crm-empty-title">Aucun deal associé</div></div>
            :coDeals.map(deal=>(
              <div key={deal.id} style={{border:"1px solid var(--hs-border)",borderRadius:3,padding:"14px 16px",marginBottom:10,cursor:"pointer",transition:"border-color .12s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="#FF7A59"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="var(--hs-border)"}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontSize:13,fontWeight:600,color:"#FF7A59"}}>{deal.name}</span>
                  <Badge status={deal.stage}/>
                </div>
                <div style={{display:"flex",gap:16}}>
                  {[["Montant",`${fmtM(deal.amount)} FCFA`],["Prob.",`${deal.prob}%`],["Clôture",fmtD(deal.closeDate)]].map(([l,v])=>(
                    <div key={l}><div style={{fontSize:10,color:"var(--hs-g3)",marginBottom:1}}>{l}</div><div style={{fontSize:12,fontWeight:600}}>{v}</div></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
};

// ===== MAIN CRM =====
const NAV = [
  {id:"dashboard",l:"Accueil",i:"home"},
  {id:"contacts",l:"Contacts",i:"contacts"},
  {id:"companies",l:"Entreprises",i:"companies"},
  {id:"deals",l:"Deals",i:"deals"},
  {id:"tasks",l:"Tâches",i:"tasks"},
];
const PAGE_TITLES = {dashboard:"Tableau de bord",contacts:"Contacts",companies:"Entreprises",deals:"Deals",tasks:"Tâches & Activités"};

export default function CRM() {
  const [tab,setTab] = useState("dashboard");
  const [contacts,setContacts] = useState(CONTACTS);
  const [companies,setCompanies] = useState(COMPANIES);
  const [deals,setDeals] = useState(DEALS_SEED);
  const [tasks,setTasks] = useState(TASKS_SEED);
  const [selContact,setSelContact] = useState(null);
  const [selCompany,setSelCompany] = useState(null);
  const [selDeal,setSelDeal] = useState(null);

  const urgentTasks = tasks.filter(t=>t.status==="urgent").length;
  const pendingTasks = tasks.filter(t=>t.status!=="fait").length;
  const moveStage = (id,stage) => setDeals(p=>p.map(d=>d.id===id?{...d,stage}:d));

  return (
    <div className="crm-app">
      {/* TOPBAR */}
      <div className="crm-topbar">
        <div className="crm-logo">
          <div className="crm-logo-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg></div>
          <span className="crm-logo-text">Clean<em>IT</em></span>
        </div>
        {NAV.map(item=>(
          <button key={item.id} onClick={()=>setTab(item.id)} className={`crm-nav-btn${tab===item.id?" active":""}`}>
            <Ico n={item.i} s={14} c={tab===item.id?"white":"rgba(255,255,255,.65)"}/>
            {item.l}
            {item.id==="tasks"&&urgentTasks>0&&<span className="crm-nav-badge"/>}
          </button>
        ))}
        <div className="crm-topbar-right">
          <div className="crm-search-bar">
            <Ico n="search" s={13} c="rgba(255,255,255,.4)"/>
            <input placeholder="Rechercher dans le CRM..."/>
          </div>
          <div className="crm-icon-btn">
            <Ico n="notify" s={15} c="rgba(255,255,255,.7)"/>
            {pendingTasks>0&&<span className="badge">{pendingTasks}</span>}
          </div>
          <div className="crm-icon-btn"><Ico n="settings" s={15} c="rgba(255,255,255,.7)"/></div>
          <div className="crm-user-pill">
            <div className="crm-user-av">MK</div>
            <span style={{fontSize:12,color:"rgba(255,255,255,.85)",fontWeight:500}}>Marie K.</span>
          </div>
        </div>
      </div>

      {/* PAGE HEADER */}
      <div className="crm-page-header">
        <div className="crm-page-title">
          <Ico n={NAV.find(n=>n.id===tab)?.i||"home"} s={18} c="#FF7A59"/>
          <h1>{PAGE_TITLES[tab]}</h1>
        </div>
      </div>

      {/* CONTENT */}
      <div className="crm-content">
        {tab==="dashboard"&&<Dashboard contacts={contacts} companies={companies} deals={deals} tasks={tasks} setTab={setTab} onDealClick={setSelDeal}/>}
        {tab==="contacts"&&<VueContacts contacts={contacts} deals={deals} onSelect={setSelContact}/>}
        {tab==="companies"&&<VueCompanies companies={companies} deals={deals} onSelect={setSelCompany}/>}
        {tab==="deals"&&<VueDeals deals={deals} setDeals={setDeals} companies={companies} onSelect={setSelDeal}/>}
        {tab==="tasks"&&<VueTasks tasks={tasks} setTasks={setTasks}/>}
      </div>

      {/* DRAWERS */}
      {selContact&&<FicheContact contact={selContact} deals={deals} onClose={()=>setSelContact(null)}/>}
      {selCompany&&<FicheCompany company={selCompany} deals={deals} contacts={contacts} onClose={()=>setSelCompany(null)}/>}
      {selDeal&&<FicheDeal deal={selDeal} companies={companies} contacts={contacts} tasks={tasks} onClose={()=>setSelDeal(null)} onStageChange={moveStage}/>}
    </div>
  );
}
