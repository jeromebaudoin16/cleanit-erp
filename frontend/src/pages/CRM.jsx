import { useState, useEffect, useRef } from "react";

// ===== HUBSPOT DESIGN SYSTEM =====
const HS = {
  // HubSpot exact colors
  orange:     "#FF7A59",
  orange2:    "#F5593E",
  orange_bg:  "#FFF3F0",
  orange_brd: "#FFBFB0",
  blue:       "#0091AE",
  blue2:      "#007A8C",
  blue_bg:    "#E5F5F8",
  green:      "#00BDA5",
  green2:     "#00A38D",
  green_bg:   "#E6F9F7",
  red:        "#F2545B",
  red_bg:     "#FEF0F1",
  yellow:     "#F5C400",
  yellow_bg:  "#FEF9E7",
  purple:     "#6B50C8",
  purple_bg:  "#F0ECFB",
  // Neutrals
  nav_bg:     "#2D3E50",
  nav_text:   "#FFFFFF",
  sidebar_bg: "#F5F8FA",
  sidebar_brd:"#DFE3EB",
  white:      "#FFFFFF",
  gray1:      "#33475B",
  gray2:      "#516F90",
  gray3:      "#7C98B6",
  gray4:      "#99ACC2",
  gray5:      "#B0C1D4",
  gray6:      "#CBD6E2",
  gray7:      "#DFE3EB",
  gray8:      "#EAF0F6",
  gray9:      "#F5F8FA",
  border:     "#DFE3EB",
  border2:    "#EAF0F6",
  text:       "#33475B",
  text2:      "#516F90",
  muted:      "#7C98B6",
};

const fmtN = n => new Intl.NumberFormat("fr-FR").format(Math.round(n||0));
const fmtD = d => d ? new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const fmtShort = d => d ? new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"}) : "—";

// Avatar initiales
const getInit = (name="") => name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
const AVATAR_COLORS = [
  {bg:"#EAF0F6",c:"#2D3E50"},{bg:"#E6F9F7",c:"#00A38D"},
  {bg:"#FFF3F0",c:"#F5593E"},{bg:"#E5F5F8",c:"#007A8C"},
  {bg:"#F0ECFB",c:"#6B50C8"},{bg:"#FEF9E7",c:"#C9A200"},
];
const getAC = name => AVATAR_COLORS[(name||"").charCodeAt(0)%AVATAR_COLORS.length];

// ===== ICÔNES HUBSPOT STYLE =====
const Ico = ({n,s=16,c="currentColor"}) => {
  const d = {
    home:    "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
    contacts:"M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
    companies:"M3 21h18 M3 7v14 M21 7v14 M9 21V7 M15 21V7 M3 7l9-4 9 4",
    deals:   "M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
    tasks:   "M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
    reports: "M18 20V10 M12 20V4 M6 20v-6",
    add:     "M12 5v14 M5 12h14",
    search:  "M21 21l-4.35-4.35 M17 11A6 6 0 115 11a6 6 0 0112 0z",
    filter:  "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
    sort:    "M8 6h13 M8 12h9 M8 18h5",
    edit:    "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
    del:     "M3 6h18 M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6 M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2",
    close:   "M18 6L6 18 M6 6l12 12",
    check:   "M20 6L9 17l-5-5",
    phone:   "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.63 19.79 19.79 0 01.06 4 2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.91a16 16 0 006.12 6.12l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
    mail:    "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
    calendar:"M8 2v4 M16 2v4 M3 10h18 M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z",
    note:    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8",
    link:    "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
    arrow_r: "M5 12h14 M12 5l7 7-7 7",
    chev_d:  "M6 9l6 6 6-6",
    chev_r:  "M9 18l6-6-6-6",
    more:    "M12 5h.01 M12 12h.01 M12 19h.01",
    star:    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    tag:     "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01",
    up:      "M18 15l-6-6-6 6",
    down2:   "M6 9l6 6 6-6",
    export:  "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
    import:  "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
    notify:  "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
    settings:"M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  };
  const path = d[n]; if(!path) return null;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c}
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      style={{flexShrink:0,display:"block"}}>
      {path.split(" M ").map((seg,i)=><path key={i} d={i===0?seg:`M ${seg}`}/>)}
    </svg>
  );
};

// ===== AVATAR =====
const Av = ({name="",size=32,color}) => {
  const ac = color||getAC(name);
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:ac.bg,color:ac.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.32,fontWeight:700,flexShrink:0,letterSpacing:"0.3px"}}>
      {getInit(name)}
    </div>
  );
};

// ===== BADGE STATUS HUBSPOT =====
const StatusBadge = ({status,label}) => {
  const cfg = {
    // Deal stages
    "prospect":    {l:"Prospect",    bg:"#EAF0F6",c:"#516F90"},
    "qualifie":    {l:"Qualifié",    bg:"#E5F5F8",c:"#0091AE"},
    "proposition": {l:"Proposition", bg:"#FEF9E7",c:"#C9A200"},
    "negociation": {l:"Négociation", bg:"#F0ECFB",c:"#6B50C8"},
    "gagne":       {l:"Gagné",       bg:"#E6F9F7",c:"#00A38D"},
    "perdu":       {l:"Perdu",       bg:"#FEF0F1",c:"#F2545B"},
    // Lead
    "chaud":       {l:"Chaud",       bg:"#FFF3F0",c:"#F5593E"},
    "tiede":       {l:"Tiède",       bg:"#FEF9E7",c:"#C9A200"},
    "froid":       {l:"Froid",       bg:"#E5F5F8",c:"#0091AE"},
    // Task
    "fait":        {l:"Fait",        bg:"#E6F9F7",c:"#00A38D"},
    "planifie":    {l:"Planifié",    bg:"#EAF0F6",c:"#516F90"},
    "urgent":      {l:"Urgent",      bg:"#FFF3F0",c:"#F5593E"},
    // Contact
    "actif":       {l:"Actif",       bg:"#E6F9F7",c:"#00A38D"},
    "inactif":     {l:"Inactif",     bg:"#EAF0F6",c:"#7C98B6"},
  }[status]||{l:label||status,bg:"#EAF0F6",c:"#516F90"};
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:3,background:cfg.bg,color:cfg.c,fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>
      {cfg.l}
    </span>
  );
};

// ===== BOUTONS HUBSPOT =====
const Btn = ({label,onClick,variant="default",sm,icon,full,disabled}) => {
  const v = {
    primary: {bg:HS.orange,  c:"white", border:HS.orange,  hover:HS.orange2},
    default: {bg:HS.white,   c:HS.gray1,border:HS.border,  hover:HS.gray9},
    ghost:   {bg:"transparent",c:HS.gray2,border:"transparent",hover:HS.gray9},
    danger:  {bg:HS.red,     c:"white", border:HS.red,     hover:"#D94048"},
    success: {bg:HS.green,   c:"white", border:HS.green,   hover:HS.green2},
    blue:    {bg:HS.blue,    c:"white", border:HS.blue,     hover:HS.blue2},
  }[variant]||{bg:HS.white,c:HS.gray1,border:HS.border,hover:HS.gray9};
  const [hov,setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,padding:sm?"5px 10px":"7px 14px",width:full?"100%":"auto",borderRadius:3,border:`1px solid ${disabled?HS.border:v.border}`,background:disabled?HS.gray8:hov?v.hover:v.bg,color:disabled?HS.muted:v.c,fontSize:sm?12:13,fontWeight:500,cursor:disabled?"not-allowed":"pointer",fontFamily:"inherit",whiteSpace:"nowrap",transition:"all 0.12s"}}>
      {icon&&<Ico n={icon} s={sm?13:15} c={disabled?HS.muted:v.c}/>}
      {label}
    </button>
  );
};

// ===== INPUTS =====
const Inp = ({type="text",value,onChange,placeholder,disabled,sm}) => (
  <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||""} disabled={disabled}
    style={{width:"100%",padding:sm?"5px 8px":"7px 10px",border:`1px solid ${HS.border}`,borderRadius:3,fontSize:13,color:HS.text,background:disabled?HS.gray9:HS.white,boxSizing:"border-box",outline:"none",fontFamily:"inherit",transition:"border-color 0.12s"}}
    onFocus={e=>e.target.style.borderColor=HS.blue}
    onBlur={e=>e.target.style.borderColor=HS.border}/>
);

const Sel = ({value,onChange,options,placeholder,disabled}) => (
  <select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
    style={{width:"100%",padding:"7px 10px",border:`1px solid ${HS.border}`,borderRadius:3,fontSize:13,color:value?HS.text:HS.muted,background:HS.white,cursor:"pointer",outline:"none",fontFamily:"inherit"}}>
    <option value="">{placeholder||"Sélectionner..."}</option>
    {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
  </select>
);

const Field = ({label,required,children,span}) => (
  <div style={{gridColumn:span?"1/-1":"auto"}}>
    <label style={{display:"block",fontSize:12,fontWeight:600,color:HS.gray2,marginBottom:4}}>{label}{required&&<span style={{color:HS.red,marginLeft:2}}>*</span>}</label>
    {children}
  </div>
);

// ===== ANIMATED COUNTER HUBSPOT =====
const Counter = ({value,duration=900}) => {
  const [n,setN] = useState(0);
  useEffect(()=>{
    if(!value||typeof value!=="number") return;
    let start = Date.now();
    const tick = ()=>{
      const p = Math.min((Date.now()-start)/duration,1);
      const e = 1-Math.pow(1-p,3);
      setN(Math.round(e*value));
      if(p<1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },[value]);
  return <span>{typeof value==="number"?fmtN(n):value}</span>;
};

// ===== PANEL DRAWER HUBSPOT =====
const Drawer = ({title,onClose,children,width=680,footer}) => (
  <div>
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:400,background:"rgba(45,62,80,0.35)"}}/>
    <div style={{position:"fixed",top:0,right:0,bottom:0,width,maxWidth:"96vw",zIndex:401,background:HS.white,boxShadow:"-4px 0 20px rgba(0,0,0,0.15)",display:"flex",flexDirection:"column",animation:"drawerIn 0.25s ease both"}}>
      <style>{`@keyframes drawerIn{from{transform:translateX(100%)}to{transform:none}}`}</style>
      <div style={{padding:"16px 20px",borderBottom:`1px solid ${HS.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:HS.gray9,flexShrink:0}}>
        <h2 style={{margin:0,fontSize:16,fontWeight:700,color:HS.gray1}}>{title}</h2>
        <button onClick={onClose} style={{width:28,height:28,borderRadius:3,border:`1px solid ${HS.border}`,background:HS.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Ico n="close" s={14} c={HS.muted}/>
        </button>
      </div>
      <div style={{flex:1,overflow:"auto"}}>{children}</div>
      {footer&&<div style={{padding:"12px 20px",borderTop:`1px solid ${HS.border}`,display:"flex",gap:8,background:HS.gray9,flexShrink:0}}>{footer}</div>}
    </div>
  </div>
);

// ===== MODAL HUBSPOT =====
const Modal = ({title,onClose,children,maxWidth=520}) => (
  <div style={{position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(45,62,80,0.4)"}}/>
    <div style={{position:"relative",width:"100%",maxWidth,background:HS.white,borderRadius:4,boxShadow:"0 4px 24px rgba(0,0,0,0.2)",maxHeight:"90vh",display:"flex",flexDirection:"column",animation:"modalIn 0.2s ease both"}}>
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:none}}`}</style>
      <div style={{padding:"14px 20px",borderBottom:`1px solid ${HS.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <h3 style={{margin:0,fontSize:15,fontWeight:700,color:HS.gray1}}>{title}</h3>
        <button onClick={onClose} style={{width:26,height:26,borderRadius:3,border:`1px solid ${HS.border}`,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Ico n="close" s={13} c={HS.muted}/>
        </button>
      </div>
      <div style={{overflow:"auto",flex:1,padding:"16px 20px"}}>{children}</div>
    </div>
  </div>
);

// ===== TABLE HUBSPOT =====
const HSTable = ({cols,rows,onRow,empty="Aucune donnée"}) => (
  <div style={{overflowX:"auto"}}>
    <table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead>
        <tr style={{borderBottom:`2px solid ${HS.border}`}}>
          {cols.map(c=>(
            <th key={c} style={{padding:"8px 12px",textAlign:"left",fontSize:12,fontWeight:600,color:HS.gray2,whiteSpace:"nowrap",background:HS.white,cursor:"pointer",userSelect:"none"}}
              onMouseEnter={e=>e.currentTarget.style.color=HS.gray1}
              onMouseLeave={e=>e.currentTarget.style.color=HS.gray2}>
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length===0&&<tr><td colSpan={cols.length} style={{padding:40,textAlign:"center",color:HS.muted,fontSize:14}}>{empty}</td></tr>}
        {rows.map((row,i)=>(
          <tr key={i} onClick={()=>onRow&&onRow(i)}
            style={{borderBottom:`1px solid ${HS.border2}`,cursor:onRow?"pointer":"default",transition:"background 0.1s"}}
            onMouseEnter={e=>e.currentTarget.style.background=HS.gray9}
            onMouseLeave={e=>e.currentTarget.style.background="white"}>
            {row.map((cell,j)=><td key={j} style={{padding:"10px 12px",fontSize:13,color:HS.text,verticalAlign:"middle"}}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ===== DONNÉES =====
const CONTACTS = [
  {id:"CT001",name:"Jean-Paul Biya",company:"MTN Cameroun",title:"Directeur Technique",email:"jp.biya@mtn.cm",phone:"+237 677 500 001",status:"actif",lead:"chaud",owner:"Marie Kamga",lastContact:"2024-03-12",created:"2020-01-15",deals:2,notes:"Contact prioritaire. Décideur technique principal MTN."},
  {id:"CT002",name:"Marie Essama",company:"MTN Cameroun",title:"Responsable Achats",email:"m.essama@mtn.cm",phone:"+237 677 500 002",status:"actif",lead:"chaud",owner:"Marie Kamga",lastContact:"2024-03-10",created:"2020-01-15",deals:1,notes:""},
  {id:"CT003",name:"Paul Ndongo",company:"Orange Cameroun",title:"DSI",email:"p.ndongo@orange.cm",phone:"+237 677 600 001",status:"actif",lead:"chaud",owner:"Jean Fouda",lastContact:"2024-03-10",created:"2020-03-01",deals:1,notes:"Décideur final Orange."},
  {id:"CT004",name:"Alice Foé",company:"Orange Cameroun",title:"Chef de Projet",email:"a.foe@orange.cm",phone:"+237 677 600 002",status:"actif",lead:"tiede",owner:"Jean Fouda",lastContact:"2024-02-28",created:"2020-03-01",deals:1,notes:""},
  {id:"CT005",name:"Wang Lei",company:"Huawei Technologies",title:"Country Manager",email:"wang.lei@huawei.com",phone:"+237 677 700 001",status:"actif",lead:"tiede",owner:"Pierre Etoga",lastContact:"2024-02-28",created:"2021-06-01",deals:1,notes:"Partenaire clé Huawei."},
  {id:"CT006",name:"Amina Diallo",company:"Nexttel Cameroun",title:"DG Adjointe",email:"a.diallo@nexttel.cm",phone:"+237 677 800 001",status:"inactif",lead:"froid",owner:"Jean Fouda",lastContact:"2024-02-15",created:"2022-01-10",deals:0,notes:"En attente décision budget."},
];

const COMPANIES = [
  {id:"CO001",name:"MTN Cameroun",sector:"Télécommunications",type:"Grands comptes",city:"Douala",phone:"+237 222 500 500",website:"www.mtn.cm",ca:450000000,deals:3,contacts:2,owner:"Marie Kamga",lead:"chaud",logo:"MTN",logoColor:"#FFCC00",logoText:"#000000"},
  {id:"CO002",name:"Orange Cameroun",sector:"Télécommunications",type:"Grands comptes",city:"Yaoundé",phone:"+237 222 600 600",website:"www.orange.cm",ca:320000000,deals:2,contacts:2,owner:"Jean Fouda",lead:"chaud",logo:"ORA",logoColor:"#FF7900",logoText:"#FFFFFF"},
  {id:"CO003",name:"Huawei Technologies",sector:"Technologies",type:"Grands comptes",city:"Douala",phone:"+237 222 700 700",website:"www.huawei.com",ca:280000000,deals:1,contacts:2,owner:"Pierre Etoga",lead:"tiede",logo:"HUA",logoColor:"#CF0A2C",logoText:"#FFFFFF"},
  {id:"CO004",name:"Nexttel Cameroun",sector:"Télécommunications",type:"Intermédiaires",city:"Douala",phone:"+237 222 800 800",website:"www.nexttel.cm",ca:120000000,deals:1,contacts:1,owner:"Jean Fouda",lead:"froid",logo:"NXT",logoColor:"#E31E24",logoText:"#FFFFFF"},
  {id:"CO005",name:"CAMTEL",sector:"Télécommunications",type:"Secteur public",city:"Yaoundé",phone:"+237 222 223 000",website:"www.camtel.cm",ca:95000000,deals:1,contacts:1,owner:"Marie Kamga",lead:"chaud",logo:"CAM",logoColor:"#006B3F",logoText:"#FFFFFF"},
  {id:"CO006",name:"Ministère des Postes",sector:"Administration",type:"Secteur public",city:"Yaoundé",phone:"+237 222 234 000",website:"www.minpostel.cm",ca:65000000,deals:1,contacts:1,owner:"David Mballa",lead:"froid",logo:"MIN",logoColor:"#2D3E50",logoText:"#FFFFFF"},
];

const DEALS_SEED = [
  {id:"D001",name:"Déploiement 5G Réseau Cœur MTN",companyId:"CO001",company:"MTN Cameroun",contactId:"CT001",contact:"Jean-Paul Biya",amount:180000000,stage:"negociation",prob:75,closeDate:"2024-06-30",owner:"Marie Kamga",created:"2024-01-15",desc:"Extension réseau 5G sur 15 sites à Douala et Yaoundé",tags:["5G","Infrastructure","Prioritaire"],activities:3},
  {id:"D002",name:"Optimisation RF Orange Q2",companyId:"CO002",company:"Orange Cameroun",contactId:"CT003",contact:"Paul Ndongo",amount:85000000,stage:"proposition",prob:60,closeDate:"2024-05-15",owner:"Jean Fouda",created:"2024-02-01",desc:"Mission d'optimisation RF sur 8 régions",tags:["RF","Optimisation"],activities:2},
  {id:"D003",name:"Fibre Optique CAMTEL Phase 2",companyId:"CO005",company:"CAMTEL",contactId:"CT005",contact:"Wang Lei",amount:220000000,stage:"qualifie",prob:45,closeDate:"2024-08-31",owner:"Marie Kamga",created:"2024-02-15",desc:"Déploiement fibre optique nationale phase 2",tags:["Fibre","National"],activities:1},
  {id:"D004",name:"Maintenance Préventive Huawei",companyId:"CO003",company:"Huawei Technologies",contactId:"CT005",contact:"Wang Lei",amount:45000000,stage:"negociation",prob:85,closeDate:"2024-04-30",owner:"Pierre Etoga",created:"2024-01-20",desc:"Contrat maintenance préventive 50 sites BTS",tags:["Maintenance"],activities:4},
  {id:"D005",name:"Audit Réseau Nexttel",companyId:"CO004",company:"Nexttel Cameroun",contactId:"CT006",contact:"Amina Diallo",amount:25000000,stage:"prospect",prob:30,closeDate:"2024-07-31",owner:"Jean Fouda",created:"2024-03-01",desc:"Audit complet infrastructure réseau existante",tags:["Audit"],activities:1},
  {id:"D006",name:"5G Small Cells MTN Douala",companyId:"CO001",company:"MTN Cameroun",contactId:"CT001",contact:"Jean-Paul Biya",amount:95000000,stage:"gagne",prob:100,closeDate:"2024-02-28",owner:"Pierre Etoga",created:"2023-12-01",desc:"Installation small cells 5G centre-ville Douala",tags:["5G","Gagné"],activities:5},
  {id:"D007",name:"Réseau VSAT Orange Régions",companyId:"CO002",company:"Orange Cameroun",contactId:"CT003",contact:"Paul Ndongo",amount:38000000,stage:"perdu",prob:0,closeDate:"2024-01-31",owner:"Jean Fouda",created:"2023-11-15",desc:"Déploiement VSAT zones rurales",tags:["VSAT"],activities:2},
];

const TASKS_SEED = [
  {id:"T001",title:"Appel qualification MTN 5G",type:"appel",dealId:"D001",contact:"Jean-Paul Biya",company:"MTN Cameroun",dueDate:"2024-03-15",status:"fait",owner:"Marie Kamga",notes:"Confirmer budget et timeline. Résultat: Positif."},
  {id:"T002",title:"Présentation offre Orange RF",type:"reunion",dealId:"D002",contact:"Paul Ndongo",company:"Orange Cameroun",dueDate:"2024-03-18",status:"planifie",owner:"Jean Fouda",notes:"Préparer deck technique + chiffrage."},
  {id:"T003",title:"Envoi proposition CAMTEL",type:"email",dealId:"D003",contact:"Dir. Infrastructure",company:"CAMTEL",dueDate:"2024-03-12",status:"fait",owner:"Marie Kamga",notes:"Proposition envoyée. Délai réponse 15 jours."},
  {id:"T004",title:"Relance Nexttel budget",type:"appel",dealId:"D005",contact:"Amina Diallo",company:"Nexttel Cameroun",dueDate:"2024-03-22",status:"urgent",owner:"Jean Fouda",notes:"Relancer décision budget audit réseau."},
  {id:"T005",title:"Visite site Huawei BTS",type:"visite",dealId:"D004",contact:"Wang Lei",company:"Huawei Technologies",dueDate:"2024-03-20",status:"planifie",owner:"Pierre Etoga",notes:"Inspection 5 sites BTS pour maintenance."},
];

const STAGES = [
  {id:"prospect",    label:"Prospect",     color:HS.gray3,  bg:HS.gray8},
  {id:"qualifie",    label:"Qualifié",     color:HS.blue,   bg:HS.blue_bg},
  {id:"proposition", label:"Proposition",  color:"#C9A200", bg:HS.yellow_bg},
  {id:"negociation", label:"Négociation",  color:HS.purple, bg:HS.purple_bg},
  {id:"gagne",       label:"Gagné",        color:HS.green,  bg:HS.green_bg},
  {id:"perdu",       label:"Perdu",        color:HS.red,    bg:HS.red_bg},
];

// ===== COMPANY LOGO =====
const CompLogo = ({company,size=32}) => (
  <div style={{width:size,height:size,borderRadius:4,background:company.logoColor,color:company.logoText,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.28,fontWeight:800,flexShrink:0,letterSpacing:"0.3px"}}>
    {company.logo}
  </div>
);

// ===== DASHBOARD HUBSPOT =====
const Dashboard = ({contacts,companies,deals,tasks,setTab,setSelDeal}) => {
  const activeDeals = deals.filter(d=>!["gagne","perdu"].includes(d.stage));
  const wonDeals = deals.filter(d=>d.stage==="gagne");
  const pipeline = activeDeals.reduce((s,d)=>s+d.amount,0);
  const wonAmount = wonDeals.reduce((s,d)=>s+d.amount,0);
  const pendingTasks = tasks.filter(t=>t.status!=="fait").length;
  const urgentTasks = tasks.filter(t=>t.status==="urgent").length;

  // Données par étape pour bar chart
  const stageData = STAGES.map(s=>({
    ...s,
    count: deals.filter(d=>d.stage===s.id).length,
    amount: deals.filter(d=>d.stage===s.id).reduce((sum,d)=>sum+d.amount,0),
  }));
  const maxAmount = Math.max(...stageData.map(s=>s.amount),1);

  return (
    <div>
      {/* Header page */}
      <div style={{marginBottom:20}}>
        <h1 style={{fontSize:20,fontWeight:700,color:HS.gray1,margin:"0 0 4px"}}>Tableau de bord commercial</h1>
        <p style={{fontSize:13,color:HS.gray3,margin:0}}>Vue d'ensemble de votre activité — Mars 2024</p>
      </div>

      {/* KPI CARDS HUBSPOT STYLE */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:20}}>
        {[
          {label:"Chiffre d'affaires total",value:companies.reduce((s,c)=>s+c.ca,0),suffix:" FCFA",color:HS.orange,icon:"deals",sub:`${companies.length} clients actifs`,trend:"+12%"},
          {label:"Pipeline commercial",value:pipeline,suffix:" FCFA",color:HS.blue,icon:"reports",sub:`${activeDeals.length} deals actifs`,trend:"+8%"},
          {label:"Deals gagnés",value:wonAmount,suffix:" FCFA",color:HS.green,icon:"tasks",sub:`${wonDeals.length} deal(s) ce trimestre`,trend:"+25%"},
          {label:"Tâches en attente",value:pendingTasks,color:urgentTasks>0?HS.red:HS.gray2,icon:"calendar",sub:urgentTasks>0?`${urgentTasks} urgente(s)`:"Tout à jour",trend:urgentTasks>0?"Urgent":null},
        ].map((k,i)=>(
          <div key={k.label} style={{background:HS.white,border:`1px solid ${HS.border}`,borderRadius:4,padding:"16px 18px",boxShadow:"0 1px 4px rgba(45,62,80,0.06)",transition:"box-shadow 0.15s",cursor:"pointer"}}
            onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 12px rgba(45,62,80,0.1)"}
            onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 4px rgba(45,62,80,0.06)"}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <span style={{fontSize:12,fontWeight:600,color:HS.gray2}}>{k.label}</span>
              <div style={{width:30,height:30,borderRadius:3,background:k.color+"18",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Ico n={k.icon} s={15} c={k.color}/>
              </div>
            </div>
            <div style={{fontSize:22,fontWeight:700,color:k.color,marginBottom:4,letterSpacing:"-0.3px"}}>
              {typeof k.value==="number"?<><Counter value={k.value}/>{k.suffix&&<span style={{fontSize:13,fontWeight:500}}> FCFA</span>}</>:k.value}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:HS.muted}}>{k.sub}</span>
              {k.trend&&<span style={{fontSize:11,fontWeight:600,color:k.color==="red"?HS.red:HS.green}}>{k.trend}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* GRILLE PRINCIPALE */}
      <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:16,marginBottom:16}}>

        {/* Pipeline par étape — HUBSPOT STYLE */}
        <div style={{background:HS.white,border:`1px solid ${HS.border}`,borderRadius:4,boxShadow:"0 1px 4px rgba(45,62,80,0.06)",overflow:"hidden"}}>
          <div style={{padding:"14px 18px",borderBottom:`1px solid ${HS.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:HS.gray1}}>Pipeline par étape</div>
              <div style={{fontSize:12,color:HS.muted,marginTop:2}}>Valeur des deals par phase</div>
            </div>
            <Btn label="Voir deals" onClick={()=>setTab("deals")} sm/>
          </div>
          <div style={{padding:"16px 18px"}}>
            {stageData.map((s,i)=>(
              <div key={s.id} style={{marginBottom:i<stageData.length-1?12:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:10,height:10,borderRadius:2,background:s.color,flexShrink:0}}/>
                    <span style={{fontSize:12,color:HS.gray1,fontWeight:500}}>{s.label}</span>
                    <span style={{fontSize:11,color:HS.muted,background:HS.gray8,padding:"1px 6px",borderRadius:10}}>{s.count}</span>
                  </div>
                  <span style={{fontSize:12,fontWeight:600,color:s.color}}>{s.amount>0?`${fmtN(s.amount/1000000)}M FCFA`:"—"}</span>
                </div>
                <div style={{height:8,background:HS.gray8,borderRadius:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${s.amount>0?(s.amount/maxAmount)*100:0}%`,background:s.color,borderRadius:4,transition:"width 1s cubic-bezier(0.4,0,0.2,1)"}}/>
                </div>
              </div>
            ))}
          </div>

          {/* Mini summary */}
          <div style={{padding:"12px 18px",borderTop:`1px solid ${HS.border}`,background:HS.gray9,display:"flex",gap:20}}>
            {[
              {l:"Pipeline total",v:`${fmtN(pipeline/1000000)}M FCFA`,c:HS.blue},
              {l:"Valeur gagnée",v:`${fmtN(wonAmount/1000000)}M FCFA`,c:HS.green},
              {l:"Taux conversion",v:`${deals.length>0?Math.round(wonDeals.length/deals.length*100):0}%`,c:HS.orange},
            ].map(item=>(
              <div key={item.l}>
                <div style={{fontSize:10,color:HS.muted,textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:2}}>{item.l}</div>
                <div style={{fontSize:14,fontWeight:700,color:item.c}}>{item.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne droite */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>

          {/* Activité récente deals */}
          <div style={{background:HS.white,border:`1px solid ${HS.border}`,borderRadius:4,boxShadow:"0 1px 4px rgba(45,62,80,0.06)",flex:1,overflow:"hidden"}}>
            <div style={{padding:"12px 16px",borderBottom:`1px solid ${HS.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,fontWeight:700,color:HS.gray1}}>Deals récents</span>
              <Btn label="Voir tous" onClick={()=>setTab("deals")} variant="ghost" sm/>
            </div>
            {deals.filter(d=>!["perdu"].includes(d.stage)).slice(0,4).map((deal,i)=>(
              <div key={deal.id} onClick={()=>setSelDeal(deal)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",borderBottom:i<3?`1px solid ${HS.border2}`:"none",cursor:"pointer",transition:"background 0.1s"}}
                onMouseEnter={e=>e.currentTarget.style.background=HS.gray9}
                onMouseLeave={e=>e.currentTarget.style.background="white"}>
                <Av name={deal.company} size={32}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:HS.gray1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{deal.name}</div>
                  <div style={{fontSize:11,color:HS.muted}}>{deal.company}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:12,fontWeight:700,color:HS.gray1}}>{fmtN(deal.amount/1000000)}M</div>
                  <StatusBadge status={deal.stage}/>
                </div>
              </div>
            ))}
          </div>

          {/* Tâches à faire */}
          <div style={{background:HS.white,border:`1px solid ${HS.border}`,borderRadius:4,boxShadow:"0 1px 4px rgba(45,62,80,0.06)",overflow:"hidden"}}>
            <div style={{padding:"12px 16px",borderBottom:`1px solid ${HS.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,fontWeight:700,color:HS.gray1}}>Tâches à venir</span>
              <Btn label="Voir toutes" onClick={()=>setTab("tasks")} variant="ghost" sm/>
            </div>
            {tasks.filter(t=>t.status!=="fait").slice(0,3).map((task,i)=>{
              const typeIco = {appel:"phone",reunion:"contacts",email:"mail",visite:"companies",relance:"notify"}[task.type]||"tasks";
              const typeColor = {appel:HS.blue,reunion:HS.purple,email:HS.orange,visite:HS.green,relance:HS.red}[task.type]||HS.gray3;
              return (
                <div key={task.id} style={{display:"flex",gap:10,padding:"10px 16px",borderBottom:i<2?`1px solid ${HS.border2}`:"none",alignItems:"flex-start"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:typeColor+"15",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                    <Ico n={typeIco} s={13} c={typeColor}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600,color:HS.gray1}}>{task.title}</div>
                    <div style={{fontSize:11,color:HS.muted,marginTop:1}}>{task.company} · {fmtD(task.dueDate)}</div>
                  </div>
                  <StatusBadge status={task.status}/>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top entreprises */}
      <div style={{background:HS.white,border:`1px solid ${HS.border}`,borderRadius:4,boxShadow:"0 1px 4px rgba(45,62,80,0.06)",overflow:"hidden"}}>
        <div style={{padding:"14px 18px",borderBottom:`1px solid ${HS.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:14,fontWeight:700,color:HS.gray1}}>Entreprises — Vue d'ensemble</span>
          <Btn label="Gérer les entreprises" onClick={()=>setTab("companies")} sm/>
        </div>
        <HSTable
          cols={["Entreprise","Secteur","Type","CA","Deals","Responsable","Lead","Dernier deal"]}
          rows={[...companies].sort((a,b)=>b.ca-a.ca).map(co=>[
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <CompLogo company={co} size={28}/>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:HS.orange,cursor:"pointer"}}>{co.name}</div>
                <div style={{fontSize:11,color:HS.muted}}>{co.city}</div>
              </div>
            </div>,
            <span style={{fontSize:12,color:HS.gray2}}>{co.sector}</span>,
            <span style={{fontSize:11,padding:"2px 6px",borderRadius:2,background:HS.gray8,color:HS.gray2}}>{co.type}</span>,
            <strong style={{color:HS.gray1}}>{fmtN(co.ca/1000000)}M FCFA</strong>,
            <span style={{fontSize:12,color:HS.gray2}}>{co.deals}</span>,
            <div style={{display:"flex",alignItems:"center",gap:6}}><Av name={co.owner} size={22}/><span style={{fontSize:12,color:HS.gray2}}>{co.owner}</span></div>,
            <StatusBadge status={co.lead}/>,
            <span style={{fontSize:12,color:HS.muted}}>{deals.filter(d=>d.companyId===co.id)[0]?.name?.slice(0,20)||"—"}...</span>,
          ])}
        />
      </div>
    </div>
  );
};

// ===== VUE CONTACTS HUBSPOT =====
const VueContacts = ({contacts,companies,deals,onSelect,onAdd}) => {
  const [search,setSearch] = useState("");
  const [filterLead,setFilterLead] = useState("tous");

  const filtered = contacts.filter(c=>{
    const ms = !search||`${c.name} ${c.company} ${c.email}`.toLowerCase().includes(search.toLowerCase());
    const ml = filterLead==="tous"||c.lead===filterLead;
    return ms&&ml;
  });

  return (
    <div>
      {/* Toolbar HubSpot style */}
      <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,background:HS.white,border:`1px solid ${HS.border}`,borderRadius:3,padding:"6px 10px",flex:1,minWidth:200}}>
          <Ico n="search" s={14} c={HS.muted}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un contact..."
            style={{border:"none",outline:"none",fontSize:13,color:HS.text,background:"transparent",flex:1,fontFamily:"inherit"}}/>
        </div>
        <select value={filterLead} onChange={e=>setFilterLead(e.target.value)}
          style={{padding:"7px 10px",border:`1px solid ${HS.border}`,borderRadius:3,fontSize:12,color:HS.gray2,background:HS.white,cursor:"pointer",fontFamily:"inherit"}}>
          <option value="tous">Tous leads</option>
          <option value="chaud">🔥 Chaud</option>
          <option value="tiede">🌡 Tiède</option>
          <option value="froid">❄️ Froid</option>
        </select>
        <Btn label="Filtres" icon="filter" sm/>
        <Btn label="Exporter" icon="export" sm/>
        <div style={{marginLeft:"auto"}}>
          <Btn label="Créer un contact" icon="add" variant="primary" sm onClick={onAdd}/>
        </div>
      </div>

      {/* Compteur */}
      <div style={{fontSize:12,color:HS.gray3,marginBottom:12}}>{filtered.length} contact(s)</div>

      {/* Table contacts HUBSPOT EXACT */}
      <div style={{background:HS.white,border:`1px solid ${HS.border}`,borderRadius:4,boxShadow:"0 1px 4px rgba(45,62,80,0.06)",overflow:"hidden"}}>
        <HSTable
          cols={["Nom","Entreprise","Titre","Email","Téléphone","Lead","Propriétaire","Dernier contact","Deals","Actions"]}
          rows={filtered.map(ct=>[
            <div style={{display:"flex",alignItems:"center",gap:8}} onClick={()=>onSelect(ct)}>
              <Av name={ct.name} size={28}/>
              <span style={{fontSize:13,fontWeight:600,color:HS.orange,cursor:"pointer"}}>{ct.name}</span>
            </div>,
            <span style={{fontSize:12,color:HS.gray2}}>{ct.company}</span>,
            <span style={{fontSize:12,color:HS.gray2}}>{ct.title}</span>,
            <span style={{fontSize:12,color:HS.blue}}>{ct.email}</span>,
            <span style={{fontSize:12,color:HS.gray2}}>{ct.phone}</span>,
            <StatusBadge status={ct.lead}/>,
            <div style={{display:"flex",alignItems:"center",gap:6}}><Av name={ct.owner} size={20}/><span style={{fontSize:12,color:HS.gray2}}>{ct.owner}</span></div>,
            <span style={{fontSize:12,color:HS.muted}}>{fmtD(ct.lastContact)}</span>,
            <span style={{fontSize:12,fontWeight:600,color:ct.deals>0?HS.green:HS.muted}}>{ct.deals}</span>,
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>onSelect(ct)} style={{padding:"4px 8px",border:`1px solid ${HS.border}`,borderRadius:3,background:HS.white,cursor:"pointer",fontSize:11,color:HS.gray2,fontFamily:"inherit"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=HS.orange}
                onMouseLeave={e=>e.currentTarget.style.borderColor=HS.border}>
                Voir
              </button>
            </div>
          ])}
          onRow={i=>onSelect(filtered[i])}
        />
      </div>
    </div>
  );
};

// ===== VUE ENTREPRISES =====
const VueCompanies = ({companies,deals,onSelect,onAdd}) => {
  const [search,setSearch] = useState("");
  const filtered = companies.filter(c=>!search||c.name.toLowerCase().includes(search.toLowerCase())||c.sector.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,background:HS.white,border:`1px solid ${HS.border}`,borderRadius:3,padding:"6px 10px",flex:1,minWidth:200}}>
          <Ico n="search" s={14} c={HS.muted}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher une entreprise..."
            style={{border:"none",outline:"none",fontSize:13,color:HS.text,background:"transparent",flex:1,fontFamily:"inherit"}}/>
        </div>
        <Btn label="Filtres" icon="filter" sm/>
        <div style={{marginLeft:"auto"}}>
          <Btn label="Créer une entreprise" icon="add" variant="primary" sm onClick={onAdd}/>
        </div>
      </div>

      <div style={{fontSize:12,color:HS.gray3,marginBottom:12}}>{filtered.length} entreprise(s)</div>

      <div style={{background:HS.white,border:`1px solid ${HS.border}`,borderRadius:4,boxShadow:"0 1px 4px rgba(45,62,80,0.06)",overflow:"hidden"}}>
        <HSTable
          cols={["Entreprise","Secteur","Type","Ville","CA total","Contacts","Deals","Lead","Propriétaire","Actions"]}
          rows={filtered.map(co=>[
            <div style={{display:"flex",alignItems:"center",gap:10}} onClick={()=>onSelect(co)}>
              <CompLogo company={co} size={30}/>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:HS.orange,cursor:"pointer"}}>{co.name}</div>
                <div style={{fontSize:11,color:HS.muted}}>{co.website}</div>
              </div>
            </div>,
            <span style={{fontSize:12,color:HS.gray2}}>{co.sector}</span>,
            <span style={{fontSize:11,padding:"2px 6px",borderRadius:2,background:HS.gray8,color:HS.gray2}}>{co.type}</span>,
            <span style={{fontSize:12,color:HS.gray2}}>{co.city}</span>,
            <strong style={{color:HS.gray1,fontSize:13}}>{fmtN(co.ca/1000000)}M FCFA</strong>,
            <span style={{fontSize:12,color:HS.gray2}}>{co.contacts}</span>,
            <span style={{fontSize:12,fontWeight:600,color:co.deals>0?HS.green:HS.muted}}>{co.deals}</span>,
            <StatusBadge status={co.lead}/>,
            <div style={{display:"flex",alignItems:"center",gap:6}}><Av name={co.owner} size={20}/><span style={{fontSize:12,color:HS.gray2}}>{co.owner}</span></div>,
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>onSelect(co)} style={{padding:"4px 8px",border:`1px solid ${HS.border}`,borderRadius:3,background:HS.white,cursor:"pointer",fontSize:11,color:HS.gray2,fontFamily:"inherit"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=HS.orange}
                onMouseLeave={e=>e.currentTarget.style.borderColor=HS.border}>
                Voir
              </button>
            </div>
          ])}
          onRow={i=>onSelect(filtered[i])}
        />
      </div>
    </div>
  );
};

// ===== VUE DEALS - KANBAN STYLE HUBSPOT =====
const VueDeals = ({deals,setDeals,companies,onSelect,onAdd}) => {
  const [view,setView] = useState("board");
  const [dragId,setDragId] = useState(null);
  const [search,setSearch] = useState("");

  const filtered = deals.filter(d=>!search||d.name.toLowerCase().includes(search.toLowerCase())||d.company.toLowerCase().includes(search.toLowerCase()));

  const moveD = (id,stage) => setDeals(p=>p.map(d=>d.id===id?{...d,stage}:d));

  return (
    <div>
      {/* Toolbar */}
      <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,background:HS.white,border:`1px solid ${HS.border}`,borderRadius:3,padding:"6px 10px",flex:1,maxWidth:300}}>
          <Ico n="search" s={14} c={HS.muted}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un deal..."
            style={{border:"none",outline:"none",fontSize:13,color:HS.text,background:"transparent",flex:1,fontFamily:"inherit"}}/>
        </div>
        {/* Vue toggle */}
        <div style={{display:"flex",background:HS.white,border:`1px solid ${HS.border}`,borderRadius:3,overflow:"hidden"}}>
          {[{v:"board",l:"Kanban"},{v:"list",l:"Liste"}].map(vt=>(
            <button key={vt.v} onClick={()=>setView(vt.v)} style={{padding:"6px 14px",border:"none",background:view===vt.v?HS.gray8:"white",color:view===vt.v?HS.gray1:HS.muted,fontSize:12,fontWeight:view===vt.v?600:400,cursor:"pointer",fontFamily:"inherit",borderRight:`1px solid ${HS.border}`}}>
              {vt.l}
            </button>
          ))}
        </div>
        <Btn label="Filtres" icon="filter" sm/>
        <div style={{marginLeft:"auto"}}>
          <Btn label="Créer un deal" icon="add" variant="primary" sm onClick={onAdd}/>
        </div>
      </div>

      {/* BOARD KANBAN HUBSPOT EXACT */}
      {view==="board"&&(
        <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:8,alignItems:"flex-start"}}>
          {STAGES.map(stage=>{
            const stageDeals = filtered.filter(d=>d.stage===stage.id);
            const stageTotal = stageDeals.reduce((s,d)=>s+d.amount,0);
            return (
              <div key={stage.id} style={{minWidth:240,flex:1,maxWidth:280}}
                onDragOver={e=>{e.preventDefault();e.currentTarget.style.background=`${stage.color}08`}}
                onDragLeave={e=>e.currentTarget.style.background="transparent"}
                onDrop={e=>{e.preventDefault();e.currentTarget.style.background="transparent";if(dragId)moveD(dragId,stage.id);}}>

                {/* Colonne header */}
                <div style={{padding:"10px 12px",marginBottom:8,borderRadius:4,background:stage.bg,border:`1px solid ${stage.color}30`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:12,fontWeight:700,color:stage.color}}>{stage.label}</span>
                      <span style={{width:18,height:18,borderRadius:"50%",background:stage.color,color:"white",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{stageDeals.length}</span>
                    </div>
                    <button onClick={()=>onAdd(stage.id)} style={{width:20,height:20,borderRadius:"50%",border:`1px solid ${stage.color}50`,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:stage.color}}>
                      <Ico n="add" s={11} c={stage.color}/>
                    </button>
                  </div>
                  {stageTotal>0&&<div style={{fontSize:11,fontWeight:600,color:stage.color,marginTop:3}}>{fmtN(stageTotal/1000000)}M FCFA</div>}
                </div>

                {/* Deal cards */}
                <div style={{display:"flex",flexDirection:"column",gap:8,minHeight:80}}>
                  {stageDeals.map(deal=>{
                    const co = companies.find(c=>c.id===deal.companyId);
                    return (
                      <div key={deal.id}
                        draggable
                        onDragStart={()=>setDragId(deal.id)}
                        onDragEnd={()=>setDragId(null)}
                        onClick={()=>onSelect(deal)}
                        style={{background:HS.white,border:`1px solid ${HS.border}`,borderRadius:4,padding:"12px 14px",cursor:"pointer",boxShadow:"0 1px 4px rgba(45,62,80,0.06)",transition:"all 0.15s",userSelect:"none"}}
                        onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 12px rgba(45,62,80,0.12)";e.currentTarget.style.borderColor=stage.color;e.currentTarget.style.transform="translateY(-1px)"}}
                        onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 4px rgba(45,62,80,0.06)";e.currentTarget.style.borderColor=HS.border;e.currentTarget.style.transform="none"}}>

                        {/* Company */}
                        {co&&<div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}>
                          <CompLogo company={co} size={18}/>
                          <span style={{fontSize:11,color:HS.muted,fontWeight:500}}>{deal.company}</span>
                        </div>}

                        {/* Deal name */}
                        <div style={{fontSize:13,fontWeight:600,color:HS.gray1,marginBottom:8,lineHeight:1.3}}>{deal.name}</div>

                        {/* Amount + prob */}
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                          <span style={{fontSize:14,fontWeight:700,color:HS.gray1}}>{fmtN(deal.amount/1000000)}M FCFA</span>
                          <span style={{fontSize:11,fontWeight:600,padding:"2px 6px",borderRadius:2,background:deal.prob>=70?HS.green_bg:deal.prob>=40?HS.yellow_bg:HS.red_bg,color:deal.prob>=70?HS.green:deal.prob>=40?"#C9A200":HS.red}}>{deal.prob}%</span>
                        </div>

                        {/* Progress bar proba */}
                        <div style={{height:3,background:HS.gray7,borderRadius:2,overflow:"hidden",marginBottom:8}}>
                          <div style={{height:"100%",width:`${deal.prob}%`,background:deal.prob>=70?HS.green:deal.prob>=40?"#F5C400":HS.red,borderRadius:2}}/>
                        </div>

                        {/* Footer */}
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            <Av name={deal.owner} size={18}/>
                            <span style={{fontSize:10,color:HS.muted}}>{deal.owner.split(" ")[0]}</span>
                          </div>
                          <span style={{fontSize:10,color:HS.muted}}>Clôture {fmtShort(deal.closeDate)}</span>
                        </div>

                        {/* Tags */}
                        {deal.tags?.length>0&&(
                          <div style={{display:"flex",gap:4,marginTop:8,flexWrap:"wrap"}}>
                            {deal.tags.slice(0,2).map(t=>(
                              <span key={t} style={{fontSize:10,padding:"1px 6px",borderRadius:2,background:HS.blue_bg,color:HS.blue,fontWeight:500}}>{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {stageDeals.length===0&&(
                    <div style={{padding:"20px 12px",textAlign:"center",color:HS.muted,fontSize:12,border:`2px dashed ${HS.border}`,borderRadius:4}}>
                      Glisser ici
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vue liste deals */}
      {view==="list"&&(
        <div style={{background:HS.white,border:`1px solid ${HS.border}`,borderRadius:4,boxShadow:"0 1px 4px rgba(45,62,80,0.06)",overflow:"hidden"}}>
          <HSTable
            cols={["Deal","Entreprise","Contact","Montant","Étape","Probabilité","Clôture","Propriétaire","Actions"]}
            rows={filtered.map(d=>[
              <span style={{fontSize:13,fontWeight:600,color:HS.orange,cursor:"pointer"}} onClick={()=>onSelect(d)}>{d.name}</span>,
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                {companies.find(c=>c.id===d.companyId)&&<CompLogo company={companies.find(c=>c.id===d.companyId)} size={20}/>}
                <span style={{fontSize:12,color:HS.gray2}}>{d.company}</span>
              </div>,
              <span style={{fontSize:12,color:HS.gray2}}>{d.contact}</span>,
              <strong style={{color:HS.gray1}}>{fmtN(d.amount/1000000)}M FCFA</strong>,
              <StatusBadge status={d.stage}/>,
              <div>
                <div style={{fontSize:12,fontWeight:600,color:d.prob>=70?HS.green:d.prob>=40?"#C9A200":HS.red}}>{d.prob}%</div>
                <div style={{height:3,background:HS.gray7,borderRadius:2,marginTop:3,width:50,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${d.prob}%`,background:d.prob>=70?HS.green:d.prob>=40?"#F5C400":HS.red,borderRadius:2}}/>
                </div>
              </div>,
              <span style={{fontSize:12,color:HS.muted}}>{fmtD(d.closeDate)}</span>,
              <div style={{display:"flex",alignItems:"center",gap:6}}><Av name={d.owner} size={20}/><span style={{fontSize:12,color:HS.gray2}}>{d.owner.split(" ")[0]}</span></div>,
              <div style={{display:"flex",gap:4}}>
                <button onClick={()=>onSelect(d)} style={{padding:"4px 8px",border:`1px solid ${HS.border}`,borderRadius:3,background:HS.white,cursor:"pointer",fontSize:11,color:HS.gray2,fontFamily:"inherit"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=HS.orange}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=HS.border}>Voir</button>
              </div>
            ])}
            onRow={i=>onSelect(filtered[i])}
          />
        </div>
      )}
    </div>
  );
};

// ===== VUE TÂCHES =====
const VueTasks = ({tasks,setTasks,companies,onAdd}) => {
  const [filter,setFilter] = useState("tous");
  const filtered = tasks.filter(t=>filter==="tous"||t.status===filter||t.type===filter);
  const markDone = id => setTasks(p=>p.map(t=>t.id===id?{...t,status:"fait"}:t));

  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{display:"flex",background:HS.white,border:`1px solid ${HS.border}`,borderRadius:3,overflow:"hidden"}}>
          {[{v:"tous",l:"Toutes"},{v:"planifie",l:"Planifiées"},{v:"urgent",l:"Urgentes"},{v:"fait",l:"Faites"}].map(f=>(
            <button key={f.v} onClick={()=>setFilter(f.v)} style={{padding:"6px 14px",border:"none",borderRight:`1px solid ${HS.border}`,background:filter===f.v?HS.orange_bg:"white",color:filter===f.v?HS.orange:HS.gray2,fontSize:12,fontWeight:filter===f.v?600:400,cursor:"pointer",fontFamily:"inherit"}}>
              {f.l}
            </button>
          ))}
        </div>
        <div style={{marginLeft:"auto"}}>
          <Btn label="Créer une tâche" icon="add" variant="primary" sm onClick={onAdd}/>
        </div>
      </div>

      <div style={{background:HS.white,border:`1px solid ${HS.border}`,borderRadius:4,boxShadow:"0 1px 4px rgba(45,62,80,0.06)",overflow:"hidden"}}>
        <HSTable
          cols={["","Type","Tâche","Entreprise","Contact","Échéance","Propriétaire","Statut","Actions"]}
          rows={filtered.map(task=>{
            const typeColors={appel:HS.blue,reunion:HS.purple,email:HS.orange,visite:HS.green,relance:HS.red};
            const typeIcos={appel:"phone",reunion:"contacts",email:"mail",visite:"companies",relance:"notify"};
            const tc = typeColors[task.type]||HS.gray3;
            return [
              <input type="checkbox" checked={task.status==="fait"} onChange={()=>markDone(task.id)}
                style={{width:14,height:14,cursor:"pointer",accentColor:HS.orange}}/>,
              <div style={{width:28,height:28,borderRadius:"50%",background:tc+"15",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Ico n={typeIcos[task.type]||"tasks"} s={13} c={tc}/>
              </div>,
              <div>
                <div style={{fontSize:13,fontWeight:task.status==="fait"?400:600,color:task.status==="fait"?HS.muted:HS.gray1,textDecoration:task.status==="fait"?"line-through":"none"}}>{task.title}</div>
                {task.notes&&<div style={{fontSize:11,color:HS.muted,marginTop:1}}>{task.notes.slice(0,60)}...</div>}
              </div>,
              <span style={{fontSize:12,color:HS.gray2}}>{task.company}</span>,
              <span style={{fontSize:12,color:HS.gray2}}>{task.contact}</span>,
              <span style={{fontSize:12,color:task.status==="urgent"?HS.red:HS.muted,fontWeight:task.status==="urgent"?600:400}}>{fmtD(task.dueDate)}</span>,
              <div style={{display:"flex",alignItems:"center",gap:6}}><Av name={task.owner} size={20}/><span style={{fontSize:12,color:HS.gray2}}>{task.owner.split(" ")[0]}</span></div>,
              <StatusBadge status={task.status}/>,
              <div style={{display:"flex",gap:4}}>
                {task.status!=="fait"&&<button onClick={()=>markDone(task.id)} style={{padding:"4px 8px",border:`1px solid ${HS.green}`,borderRadius:3,background:HS.green_bg,cursor:"pointer",fontSize:11,color:HS.green,fontFamily:"inherit"}}>✓ Fait</button>}
                <button style={{padding:"4px 8px",border:`1px solid ${HS.border}`,borderRadius:3,background:HS.white,cursor:"pointer",fontSize:11,color:HS.gray2,fontFamily:"inherit"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=HS.orange}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=HS.border}>Modifier</button>
              </div>
            ];
          })}
        />
      </div>
    </div>
  );
};

// ===== FICHE CONTACT HUBSPOT =====
const FicheContact = ({contact,deals,onClose}) => {
  const [tab,setTab] = useState("activite");
  const contactDeals = deals.filter(d=>d.contactId===contact.id);

  return (
    <Drawer title="" onClose={onClose} width={720}
      footer={<>
        <Btn label="Fermer" onClick={onClose}/>
        <Btn label="Modifier" icon="edit" variant="primary"/>
      </>}>

      {/* Header profil contact */}
      <div style={{background:HS.gray9,borderBottom:`1px solid ${HS.border}`,padding:"20px 24px"}}>
        <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:16}}>
          <Av name={contact.name} size={56}/>
          <div>
            <div style={{fontSize:18,fontWeight:700,color:HS.gray1,marginBottom:3}}>{contact.name}</div>
            <div style={{fontSize:13,color:HS.gray2}}>{contact.title} · {contact.company}</div>
          </div>
          <div style={{marginLeft:"auto",display:"flex",gap:8}}>
            <StatusBadge status={contact.lead}/>
            <StatusBadge status={contact.status}/>
          </div>
        </div>

        {/* Actions rapides HubSpot style */}
        <div style={{display:"flex",gap:8}}>
          <Btn label="Appeler" icon="phone" sm/>
          <Btn label="Email" icon="mail" sm/>
          <Btn label="Tâche" icon="tasks" sm/>
          <Btn label="Note" icon="note" sm/>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:`1px solid ${HS.border}`,padding:"0 24px",background:HS.white}}>
        {[{id:"activite",l:"Activité"},{id:"infos",l:"À propos"},{id:"deals",l:`Deals (${contactDeals.length})`}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"10px 14px",border:"none",borderBottom:`2px solid ${tab===t.id?HS.orange:"transparent"}`,background:"transparent",color:tab===t.id?HS.orange:HS.gray2,fontWeight:tab===t.id?600:400,fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all 0.12s"}}>
            {t.l}
          </button>
        ))}
      </div>

      <div style={{padding:"20px 24px"}}>
        {tab==="infos"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
            <div style={{borderRight:`1px solid ${HS.border}`,paddingRight:20}}>
              <div style={{fontSize:11,fontWeight:700,color:HS.gray2,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:12}}>Informations de contact</div>
              {[
                ["Email",contact.email],["Téléphone",contact.phone],["Entreprise",contact.company],["Titre",contact.title],
              ].map(([l,v])=>(
                <div key={l} style={{marginBottom:12}}>
                  <div style={{fontSize:11,color:HS.muted,marginBottom:2}}>{l}</div>
                  <div style={{fontSize:13,color:HS.gray1,fontWeight:500}}>{v||"—"}</div>
                </div>
              ))}
            </div>
            <div style={{paddingLeft:20}}>
              <div style={{fontSize:11,fontWeight:700,color:HS.gray2,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:12}}>CRM</div>
              {[
                ["Propriétaire",contact.owner],["Lead score",contact.lead],["Créé le",fmtD(contact.created)],
                ["Dernier contact",fmtD(contact.lastContact)],["Deals associés",contact.deals],
              ].map(([l,v])=>(
                <div key={l} style={{marginBottom:12}}>
                  <div style={{fontSize:11,color:HS.muted,marginBottom:2}}>{l}</div>
                  <div style={{fontSize:13,color:HS.gray1,fontWeight:500}}>{l==="Lead score"?<StatusBadge status={v}/>:v||"—"}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="activite"&&(
          <div>
            {contact.notes&&(
              <div style={{background:HS.yellow_bg,border:`1px solid ${HS.yellow}`,borderRadius:3,padding:"10px 14px",marginBottom:16,fontSize:13,color:HS.gray1}}>
                📝 {contact.notes}
              </div>
            )}
            <div style={{textAlign:"center",padding:"32px",color:HS.muted}}>
              <Ico n="calendar" s={40} c={HS.border}/>
              <div style={{fontSize:14,marginTop:12,fontWeight:500}}>Aucune activité récente</div>
              <div style={{fontSize:12,marginTop:4}}>Commencez par créer un appel, email ou réunion</div>
              <div style={{marginTop:16,display:"flex",gap:8,justifyContent:"center"}}>
                <Btn label="Appeler" icon="phone" sm/>
                <Btn label="Email" icon="mail" sm/>
                <Btn label="Réunion" icon="contacts" sm/>
              </div>
            </div>
          </div>
        )}

        {tab==="deals"&&(
          <div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
              <Btn label="Créer un deal" icon="add" variant="primary" sm/>
            </div>
            {contactDeals.length===0
              ? <div style={{padding:32,textAlign:"center",color:HS.muted}}>Aucun deal associé</div>
              : contactDeals.map((deal,i)=>(
                  <div key={deal.id} style={{border:`1px solid ${HS.border}`,borderRadius:3,padding:"14px 16px",marginBottom:10,cursor:"pointer",transition:"border-color 0.12s"}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=HS.orange}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=HS.border}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div style={{fontSize:13,fontWeight:600,color:HS.orange}}>{deal.name}</div>
                      <StatusBadge status={deal.stage}/>
                    </div>
                    <div style={{display:"flex",gap:16}}>
                      {[["Montant",`${fmtN(deal.amount/1000000)}M FCFA`],["Probabilité",`${deal.prob}%`],["Clôture",fmtD(deal.closeDate)]].map(([l,v])=>(
                        <div key={l}><div style={{fontSize:10,color:HS.muted,marginBottom:1}}>{l}</div><div style={{fontSize:12,fontWeight:600,color:HS.gray1}}>{v}</div></div>
                      ))}
                    </div>
                  </div>
                ))
            }
          </div>
        )}
      </div>
    </Drawer>
  );
};

// ===== FICHE DEAL HUBSPOT =====
const FicheDeal = ({deal,companies,contacts,tasks,onClose,onStageChange}) => {
  const [tab,setTab] = useState("apercu");
  const company = companies.find(c=>c.id===deal.companyId);
  const dealTasks = tasks.filter(t=>t.dealId===deal.id);
  const stage = STAGES.find(s=>s.id===deal.stage);

  return (
    <Drawer title="" onClose={onClose} width={760}
      footer={<>
        <Btn label="Fermer" onClick={onClose}/>
        <Btn label="Modifier" icon="edit"/>
        {deal.stage!=="gagne"&&<Btn label="Marquer Gagné" icon="check" variant="success"/>}
      </>}>

      {/* Header deal */}
      <div style={{borderBottom:`1px solid ${HS.border}`,padding:"20px 24px",background:HS.white}}>
        {/* Breadcrumb */}
        <div style={{fontSize:12,color:HS.muted,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
          <span>CRM</span><Ico n="chev_r" s={12} c={HS.muted}/><span>Deals</span><Ico n="chev_r" s={12} c={HS.muted}/><span style={{color:HS.gray1}}>{deal.name}</span>
        </div>

        <div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:16}}>
          {company&&<CompLogo company={company} size={44}/>}
          <div style={{flex:1}}>
            <div style={{fontSize:20,fontWeight:700,color:HS.gray1,marginBottom:4}}>{deal.name}</div>
            <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontSize:14,fontWeight:700,color:HS.gray1}}>{fmtN(deal.amount/1000000)}M FCFA</span>
              <span style={{fontSize:12,color:HS.muted}}>·</span>
              <StatusBadge status={deal.stage}/>
              <span style={{fontSize:12,color:HS.muted}}>·</span>
              <span style={{fontSize:12,color:HS.muted}}>Clôture: {fmtD(deal.closeDate)}</span>
            </div>
          </div>
        </div>

        {/* Pipeline étapes HubSpot style */}
        <div style={{display:"flex",gap:0,overflowX:"auto"}}>
          {STAGES.filter(s=>!["gagne","perdu"].includes(s.id)).map((s,i,arr)=>{
            const isActive = s.id===deal.stage;
            const isDone = STAGES.findIndex(st=>st.id===s.id) < STAGES.findIndex(st=>st.id===deal.stage);
            return (
              <div key={s.id} onClick={()=>onStageChange(deal.id,s.id)}
                style={{flex:1,padding:"8px 10px",textAlign:"center",cursor:"pointer",background:isActive?s.bg:"transparent",borderBottom:`3px solid ${isActive?s.color:isDone?HS.green:HS.border}`,transition:"all 0.15s",position:"relative",minWidth:80}}>
                <div style={{fontSize:11,fontWeight:isActive?700:500,color:isActive?s.color:isDone?HS.green:HS.muted,whiteSpace:"nowrap"}}>{s.label}</div>
                {isDone&&<div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",color:HS.green,fontSize:8}}>✓</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:`1px solid ${HS.border}`,padding:"0 24px",background:HS.white}}>
        {[{id:"apercu",l:"Aperçu"},{id:"activite",l:"Activité"},{id:"taches",l:`Tâches (${dealTasks.length})`}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"10px 14px",border:"none",borderBottom:`2px solid ${tab===t.id?HS.orange:"transparent"}`,background:"transparent",color:tab===t.id?HS.orange:HS.gray2,fontWeight:tab===t.id?600:400,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
            {t.l}
          </button>
        ))}
      </div>

      <div style={{padding:"20px 24px"}}>
        {tab==="apercu"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:HS.gray2,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:12}}>Informations du deal</div>
              {[
                ["Montant",`${fmtN(deal.amount)} FCFA`],
                ["Probabilité",`${deal.prob}%`],
                ["Étape",<StatusBadge status={deal.stage}/>],
                ["Date de clôture",fmtD(deal.closeDate)],
                ["Propriétaire",deal.owner],
                ["Créé le",fmtD(deal.created)],
              ].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${HS.border2}`,alignItems:"center"}}>
                  <span style={{fontSize:12,color:HS.gray3}}>{l}</span>
                  <span style={{fontSize:13,color:HS.gray1,fontWeight:500}}>{v}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:HS.gray2,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:12}}>Entreprise & Contact</div>
              {company&&(
                <div style={{display:"flex",gap:10,alignItems:"center",padding:"10px 12px",border:`1px solid ${HS.border}`,borderRadius:3,marginBottom:10,cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=HS.orange}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=HS.border}>
                  <CompLogo company={company} size={32}/>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:HS.orange}}>{company.name}</div>
                    <div style={{fontSize:11,color:HS.muted}}>{company.sector}</div>
                  </div>
                </div>
              )}
              {deal.contact&&(
                <div style={{display:"flex",gap:10,alignItems:"center",padding:"10px 12px",border:`1px solid ${HS.border}`,borderRadius:3,cursor:"pointer"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=HS.orange}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=HS.border}>
                  <Av name={deal.contact} size={32}/>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:HS.orange}}>{deal.contact}</div>
                    <div style={{fontSize:11,color:HS.muted}}>Contact principal</div>
                  </div>
                </div>
              )}
              {deal.desc&&(
                <div style={{marginTop:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:HS.gray2,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>Description</div>
                  <div style={{fontSize:13,color:HS.gray2,lineHeight:1.6}}>{deal.desc}</div>
                </div>
              )}
              {deal.tags?.length>0&&(
                <div style={{marginTop:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:HS.gray2,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>Tags</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {deal.tags.map(t=>(
                      <span key={t} style={{fontSize:11,padding:"3px 8px",borderRadius:2,background:HS.blue_bg,color:HS.blue,fontWeight:500,display:"flex",alignItems:"center",gap:4}}>
                        <Ico n="tag" s={10} c={HS.blue}/>{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab==="activite"&&(
          <div style={{textAlign:"center",padding:"32px",color:HS.muted}}>
            <Ico n="calendar" s={40} c={HS.border}/>
            <div style={{fontSize:14,marginTop:12,fontWeight:500}}>Aucune activité</div>
            <div style={{fontSize:12,marginTop:4}}>Planifiez un appel, email ou réunion</div>
            <div style={{marginTop:16,display:"flex",gap:8,justifyContent:"center"}}>
              <Btn label="Appeler" icon="phone" sm/>
              <Btn label="Email" icon="mail" sm/>
              <Btn label="Note" icon="note" sm/>
            </div>
          </div>
        )}

        {tab==="taches"&&(
          <div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
              <Btn label="Créer une tâche" icon="add" variant="primary" sm/>
            </div>
            {dealTasks.length===0
              ? <div style={{padding:32,textAlign:"center",color:HS.muted}}>Aucune tâche associée</div>
              : dealTasks.map(task=>{
                  const tc = {appel:HS.blue,reunion:HS.purple,email:HS.orange,visite:HS.green,relance:HS.red}[task.type]||HS.gray3;
                  return (
                    <div key={task.id} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:`1px solid ${HS.border2}`,alignItems:"flex-start"}}>
                      <div style={{width:30,height:30,borderRadius:"50%",background:tc+"15",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <Ico n={{appel:"phone",reunion:"contacts",email:"mail",visite:"companies",relance:"notify"}[task.type]||"tasks"} s={13} c={tc}/>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:600,color:HS.gray1}}>{task.title}</div>
                        <div style={{fontSize:11,color:HS.muted,marginTop:2}}>{fmtD(task.dueDate)} · {task.owner}</div>
                        {task.notes&&<div style={{fontSize:12,color:HS.gray2,marginTop:4,background:HS.gray9,padding:"6px 10px",borderRadius:3}}>{task.notes}</div>}
                      </div>
                      <StatusBadge status={task.status}/>
                    </div>
                  );
                })
            }
          </div>
        )}
      </div>
    </Drawer>
  );
};

// ===== FORMULAIRE DEAL =====
const FormDeal = ({onClose,onSave,companies,contacts,initialStage=""}) => {
  const [f,setF] = useState({name:"",companyId:"",contactId:"",amount:"",stage:initialStage||"prospect",prob:"50",closeDate:"",owner:"",desc:""});
  const u = (k,v) => setF(p=>({...p,[k]:v}));
  const co = companies.find(c=>c.id===f.companyId);
  const availableContacts = contacts.filter(c=>!f.companyId||c.company===co?.name);

  return (
    <Modal title="Créer un deal" onClose={onClose} maxWidth={520}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Nom du deal" required span><Inp value={f.name} onChange={v=>u("name",v)} placeholder="Ex: Déploiement 5G MTN"/></Field>
        <Field label="Entreprise" required><Sel value={f.companyId} onChange={v=>u("companyId",v)} options={companies.map(c=>({v:c.id,l:c.name}))}/></Field>
        <Field label="Contact"><Sel value={f.contactId} onChange={v=>u("contactId",v)} options={availableContacts.map(c=>({v:c.id,l:c.name}))} placeholder="Sélectionner contact"/></Field>
        <Field label="Montant (FCFA)"><Inp type="number" value={f.amount} onChange={v=>u("amount",v)} placeholder="Ex: 50 000 000"/></Field>
        <Field label="Étape"><Sel value={f.stage} onChange={v=>u("stage",v)} options={STAGES.map(s=>({v:s.id,l:s.label}))}/></Field>
        <Field label="Probabilité (%)"><Inp type="number" value={f.prob} onChange={v=>u("prob",v)} placeholder="0-100"/></Field>
        <Field label="Date de clôture"><Inp type="date" value={f.closeDate} onChange={v=>u("closeDate",v)}/></Field>
        <Field label="Propriétaire"><Sel value={f.owner} onChange={v=>u("owner",v)} options={["Marie Kamga","Jean Fouda","Pierre Etoga","David Mballa"]}/></Field>
        <Field label="Description" span>
          <textarea value={f.desc} onChange={e=>u("desc",e.target.value)} placeholder="Description du deal..."
            style={{width:"100%",padding:"7px 10px",border:`1px solid ${HS.border}`,borderRadius:3,fontSize:13,fontFamily:"inherit",resize:"vertical",minHeight:70,outline:"none",boxSizing:"border-box"}}
            onFocus={e=>e.target.style.borderColor=HS.blue}
            onBlur={e=>e.target.style.borderColor=HS.border}/>
        </Field>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",paddingTop:14,borderTop:`1px solid ${HS.border2}`,marginTop:14}}>
        <Btn label="Annuler" onClick={onClose}/>
        <Btn label="Créer le deal" icon="check" variant="primary" onClick={()=>{
          if(!f.name||!f.companyId) return;
          const co = companies.find(c=>c.id===f.companyId);
          const ct = contacts.find(c=>c.id===f.contactId);
          onSave({...f,id:"D"+Date.now(),company:co?.name||"",contact:ct?.name||"",amount:Number(f.amount)||0,prob:Number(f.prob)||0,created:new Date().toISOString().split("T")[0],tags:[],activities:0});
          onClose();
        }}/>
      </div>
    </Modal>
  );
};

// ===== NAVIGATION HUBSPOT =====
const NAV_ITEMS = [
  {id:"dashboard",  l:"Accueil",      i:"home"},
  {id:"contacts",   l:"Contacts",     i:"contacts"},
  {id:"companies",  l:"Entreprises",  i:"companies"},
  {id:"deals",      l:"Deals",        i:"deals"},
  {id:"tasks",      l:"Tâches",       i:"tasks"},
];

// ===== COMPOSANT PRINCIPAL =====
export default function CRM() {
  const [tab,setTab] = useState("dashboard");
  const [contacts,setContacts] = useState(CONTACTS);
  const [companies,setCompanies] = useState(COMPANIES);
  const [deals,setDeals] = useState(DEALS_SEED);
  const [tasks,setTasks] = useState(TASKS_SEED);
  const [selContact,setSelContact] = useState(null);
  const [selCompany,setSelCompany] = useState(null);
  const [selDeal,setSelDeal] = useState(null);
  const [showAddDeal,setShowAddDeal] = useState(false);
  const [addDealStage,setAddDealStage] = useState("");

  const urgentTasks = tasks.filter(t=>t.status==="urgent").length;
  const pendingTasks = tasks.filter(t=>t.status!=="fait").length;

  const moveStage = (dealId,stage) => setDeals(p=>p.map(d=>d.id===dealId?{...d,stage}:d));

  const PAGE_TITLES = {dashboard:"Accueil",contacts:"Contacts",companies:"Entreprises",deals:"Deals",tasks:"Tâches & Activités"};

  return (
    <div style={{minHeight:"100vh",background:HS.sidebar_bg,fontFamily:"'Lexend', 'Inter', 'Segoe UI', Arial, sans-serif",display:"flex",flexDirection:"column"}}>

      {/* TOPBAR HUBSPOT — orange foncé */}
      <div style={{background:HS.nav_bg,height:48,display:"flex",alignItems:"center",padding:"0 16px",gap:0,position:"sticky",top:0,zIndex:200,flexShrink:0}}>

        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"0 12px",marginRight:8}}>
          <div style={{width:24,height:24,background:HS.orange,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
          </div>
          <span style={{fontSize:14,fontWeight:700,color:"white",letterSpacing:"0.3px"}}>CleanIT <span style={{color:HS.orange,fontWeight:400}}>CRM</span></span>
        </div>

        {/* Nav items */}
        {NAV_ITEMS.map(item=>{
          const isActive = tab===item.id;
          const hasBadge = item.id==="tasks"&&urgentTasks>0;
          return (
            <button key={item.id} onClick={()=>setTab(item.id)}
              style={{display:"flex",alignItems:"center",gap:6,padding:"0 14px",height:"100%",border:"none",background:isActive?"rgba(255,255,255,0.12)":"transparent",color:isActive?"white":"rgba(255,255,255,0.7)",fontSize:13,fontWeight:isActive?600:400,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",position:"relative",transition:"background 0.12s"}}
              onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background="rgba(255,255,255,0.06)"}}
              onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background="transparent"}}>
              <Ico n={item.i} s={14} c={isActive?"white":"rgba(255,255,255,0.65)"}/>
              {item.l}
              {hasBadge&&<span style={{position:"absolute",top:8,right:6,width:7,height:7,borderRadius:"50%",background:HS.orange,border:"2px solid "+HS.nav_bg}}/>}
            </button>
          );
        })}

        <div style={{flex:1}}/>

        {/* Search */}
        <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:3,padding:"5px 12px",width:220}}>
          <Ico n="search" s={13} c="rgba(255,255,255,0.5)"/>
          <input placeholder="Rechercher dans le CRM..." style={{background:"transparent",border:"none",outline:"none",color:"white",fontSize:12,width:"100%",fontFamily:"inherit"}}/>
        </div>

        {/* Notifications */}
        <div style={{position:"relative",marginLeft:12,cursor:"pointer"}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(255,255,255,0.12)"}}>
            <Ico n="notify" s={15} c="rgba(255,255,255,0.7)"/>
          </div>
          {pendingTasks>0&&<div style={{position:"absolute",top:-2,right:-2,width:16,height:16,borderRadius:"50%",background:HS.orange,fontSize:9,fontWeight:700,color:"white",display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid "+HS.nav_bg}}>{pendingTasks}</div>}
        </div>

        {/* Settings */}
        <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(255,255,255,0.12)",cursor:"pointer",marginLeft:8}}>
          <Ico n="settings" s={15} c="rgba(255,255,255,0.7)"/>
        </div>

        {/* User */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:12,cursor:"pointer",padding:"4px 8px",borderRadius:3,transition:"background 0.12s"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <div style={{width:28,height:28,borderRadius:"50%",background:HS.orange,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"white"}}>MK</div>
          <span style={{fontSize:12,color:"rgba(255,255,255,0.85)",fontWeight:500}}>Marie K.</span>
        </div>
      </div>

      {/* SUB-HEADER PAGE TITLE */}
      <div style={{background:HS.white,borderBottom:`1px solid ${HS.border}`,padding:"0 24px",height:50,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Ico n={NAV_ITEMS.find(n=>n.id===tab)?.i||"home"} s={18} c={HS.orange}/>
          <h1 style={{fontSize:16,fontWeight:700,color:HS.gray1,margin:0}}>{PAGE_TITLES[tab]}</h1>
        </div>
        <div style={{display:"flex",gap:8}}>
          {tab==="contacts"&&<Btn label="Créer un contact" icon="add" variant="primary" sm onClick={()=>{}}/>}
          {tab==="companies"&&<Btn label="Créer une entreprise" icon="add" variant="primary" sm onClick={()=>{}}/>}
          {tab==="deals"&&<Btn label="Créer un deal" icon="add" variant="primary" sm onClick={()=>setShowAddDeal(true)}/>}
          {tab==="tasks"&&<Btn label="Créer une tâche" icon="add" variant="primary" sm onClick={()=>{}}/>}
        </div>
      </div>

      {/* CONTENU */}
      <div style={{flex:1,padding:"20px 24px",maxWidth:1400,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>
        {tab==="dashboard"&&<Dashboard contacts={contacts} companies={companies} deals={deals} tasks={tasks} setTab={setTab} setSelDeal={setSelDeal}/>}
        {tab==="contacts"&&<VueContacts contacts={contacts} companies={companies} deals={deals} onSelect={setSelContact} onAdd={()=>{}}/>}
        {tab==="companies"&&<VueCompanies companies={companies} deals={deals} onSelect={setSelCompany} onAdd={()=>{}}/>}
        {tab==="deals"&&<VueDeals deals={deals} setDeals={setDeals} companies={companies} onSelect={setSelDeal} onAdd={(stage)=>{setAddDealStage(stage||"");setShowAddDeal(true);}}/>}
        {tab==="tasks"&&<VueTasks tasks={tasks} setTasks={setTasks} companies={companies} onAdd={()=>{}}/>}
      </div>

      {/* DRAWERS & MODALS */}
      {selContact&&<FicheContact contact={selContact} deals={deals} onClose={()=>setSelContact(null)}/>}
      {selDeal&&<FicheDeal deal={selDeal} companies={companies} contacts={contacts} tasks={tasks} onClose={()=>setSelDeal(null)} onStageChange={moveStage}/>}
      {showAddDeal&&<FormDeal onClose={()=>setShowAddDeal(false)} companies={companies} contacts={contacts} initialStage={addDealStage} onSave={d=>{setDeals(p=>[d,...p]);setShowAddDeal(false);}}/>}
    </div>
  );
}
