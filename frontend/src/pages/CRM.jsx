import { useState, useEffect } from "react";
import "../components/RHDesign.css";

// ===== DESIGN SYSTEM CRM =====
const C = {
  blue:    "#0070F2", blue2:  "#0057B8", blue_bg: "#E8F3FF",
  green:   "#107E3E", green2: "#0B5C2B", green_bg:"#F1F8F1",
  red:     "#BB0000", red_bg: "#FFF0F0",
  orange:  "#E76500", orange_bg:"#FEF3E6",
  purple:  "#6B00A4", purple_bg:"#F5EEFF",
  teal:    "#0D6E6E", teal_bg: "#E6F5F5",
  gold:    "#B45300", gold_bg: "#FFF3E0",
  shell:   "#1B3A52", shell2:  "#0D2B40",
  gray1:   "#32363A", gray2:  "#515456", gray3: "#6A6D70",
  gray4:   "#89898B", gray5:  "#BDBDBD", gray6: "#D9D9D9",
  gray7:   "#EBEBEB", gray8:  "#F4F4F4", gray9: "#FAFAFA",
  white:   "#FFFFFF", border: "#D9D9D9", border2:"#EBEBEB",
};

const fmtN = n => new Intl.NumberFormat("fr-FR").format(Math.round(n||0));
const fmtD = d => d ? new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}) : "—";

// ===== ICÔNES =====
const Ico = ({n,s=16,c="currentColor"}) => {
  const d = {
    home:    "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
    users:   "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
    user:    "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
    building:"M3 21h18 M3 7v14 M21 7v14 M9 21V7 M15 21V7 M3 7l9-4 9 4",
    chart:   "M18 20V10 M12 20V4 M6 20v-6",
    pipeline:"M22 12h-4l-3 9L9 3l-3 9H2",
    target:  "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 18c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6z M12 14c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z",
    deal:    "M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
    activity:"M22 12h-4l-3 9L9 3l-3 9H2",
    phone:   "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.63 19.79 19.79 0 01.06 4 2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.91a16 16 0 006.12 6.12l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
    mail:    "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
    calendar:"M8 2v4 M16 2v4 M3 10h18 M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z",
    add:     "M12 5v14 M5 12h14",
    close:   "M18 6L6 18 M6 6l12 12",
    search:  "M21 21l-4.35-4.35 M17 11A6 6 0 115 11a6 6 0 0112 0z",
    check:   "M20 6L9 17l-5-5",
    edit:    "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
    eye:     "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12m-3 0a3 3 0 106 0 3 3 0 00-6 0",
    arrow_r: "M5 12h14 M12 5l7 7-7 7",
    star:    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    filter:  "M22 3H2l8 9.46V19l4 2v-8.54L22 3",
    link:    "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
    loc:     "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10m-3 0a3 3 0 106 0 3 3 0 00-6 0",
    doc:     "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6",
    trend_up:"M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
    alert:   "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
    more:    "M12 5h.01 M12 12h.01 M12 19h.01",
    tag:     "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01",
    kanban:  "M3 3h5v18H3z M10 3h5v18h-5z M17 3h4v18h-4z",
    list:    "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01",
    won:     "M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
    lost:    "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
    refresh: "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15",
    globe:   "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M2 12h20 M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z",
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

// ===== COMPOSANTS UI =====
const Btn = ({label,onClick,variant="ghost",sm,icon,disabled,full}) => {
  const v = {
    primary: {bg:C.blue,   c:"white", border:C.blue},
    success: {bg:C.green,  c:"white", border:C.green},
    danger:  {bg:C.red,    c:"white", border:C.red},
    ghost:   {bg:"white",  c:C.gray2, border:C.border},
    outline: {bg:"white",  c:C.blue,  border:C.blue},
  }[variant]||{bg:"white",c:C.gray2,border:C.border};
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,
      padding:sm?"5px 12px":"8px 16px",width:full?"100%":"auto",
      borderRadius:6,border:`1px solid ${disabled?C.gray6:v.border}`,
      background:disabled?C.gray8:v.bg,color:disabled?C.gray4:v.c,
      fontSize:sm?12:13,fontWeight:600,cursor:disabled?"not-allowed":"pointer",
      fontFamily:"inherit",whiteSpace:"nowrap",transition:"all 0.15s",
    }}
      onMouseEnter={e=>{if(!disabled){e.currentTarget.style.opacity="0.88";e.currentTarget.style.transform="translateY(-1px)";}}}
      onMouseLeave={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="translateY(0)";}}>
      {icon&&<Ico n={icon} s={sm?13:15} c={disabled?C.gray4:v.c}/>}
      {label}
    </button>
  );
};

const Badge = ({s,label}) => {
  const cfg = {
    prospect:    {l:"Prospect",     bg:"#F4F4F4",  c:C.gray2},
    qualifie:    {l:"Qualifié",     bg:C.blue_bg,  c:C.blue},
    proposition: {l:"Proposition",  bg:"#FFF3E0",  c:C.gold},
    negociation: {l:"Négociation",  bg:C.purple_bg,c:C.purple},
    gagne:       {l:"Gagné",        bg:C.green_bg, c:C.green},
    perdu:       {l:"Perdu",        bg:C.red_bg,   c:C.red},
    actif:       {l:"Actif",        bg:C.green_bg, c:C.green},
    inactif:     {l:"Inactif",      bg:"#F4F4F4",  c:C.gray3},
    chaud:       {l:"Chaud",        bg:C.red_bg,   c:C.red},
    tiede:       {l:"Tiède",        bg:C.orange_bg,c:C.orange},
    froid:       {l:"Froid",        bg:C.blue_bg,  c:C.blue},
    appel:       {l:"Appel",        bg:C.blue_bg,  c:C.blue},
    reunion:     {l:"Réunion",      bg:C.purple_bg,c:C.purple},
    email:       {l:"Email",        bg:"#FFF3E0",  c:C.gold},
    relance:     {l:"Relance",      bg:C.orange_bg,c:C.orange},
    visite:      {l:"Visite site",  bg:C.teal_bg,  c:C.teal},
    fait:        {l:"Fait",         bg:C.green_bg, c:C.green},
    planifie:    {l:"Planifié",     bg:C.blue_bg,  c:C.blue},
  }[s]||{l:label||s,bg:"#F4F4F4",c:C.gray3};
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:20,background:cfg.bg,color:cfg.c,fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:cfg.c,flexShrink:0}}/>
      {cfg.l}
    </span>
  );
};

const Input = ({value,onChange,placeholder,type="text",sm}) => (
  <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||""}
    style={{width:"100%",padding:sm?"6px 10px":"9px 12px",border:`1px solid ${C.border}`,borderRadius:6,fontSize:13,color:C.gray1,background:"white",boxSizing:"border-box",outline:"none",fontFamily:"inherit",transition:"border-color 0.15s"}}
    onFocus={e=>e.target.style.borderColor=C.blue}
    onBlur={e=>e.target.style.borderColor=C.border}/>
);

const Select = ({value,onChange,options,placeholder}) => (
  <select value={value} onChange={e=>onChange(e.target.value)}
    style={{width:"100%",padding:"9px 12px",border:`1px solid ${C.border}`,borderRadius:6,fontSize:13,color:value?C.gray1:C.gray4,background:"white",cursor:"pointer",outline:"none",fontFamily:"inherit"}}>
    <option value="">{placeholder||"Sélectionner..."}</option>
    {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
  </select>
);

const Field = ({label,required,children,span}) => (
  <div style={{gridColumn:span?"1/-1":"auto"}}>
    <label style={{display:"block",fontSize:11,fontWeight:700,color:C.gray3,marginBottom:5,textTransform:"uppercase",letterSpacing:0.4}}>
      {label}{required&&<span style={{color:C.red,marginLeft:2}}>*</span>}
    </label>
    {children}
  </div>
);

// ===== ANIMATED COUNTER =====
const Counter = ({value,prefix="",suffix="",duration=1000}) => {
  const [n,setN] = useState(0);
  useEffect(()=>{
    if(!value) return;
    const target = typeof value==="number"?value:0;
    const start = Date.now();
    const tick = ()=>{
      const p = Math.min((Date.now()-start)/duration,1);
      const e = 1-Math.pow(1-p,3);
      setN(Math.round(e*target));
      if(p<1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },[value]);
  return <span>{prefix}{typeof value==="number"?fmtN(n):value}{suffix}</span>;
};

// ===== PANEL LATÉRAL =====
const Panel = ({title,subtitle,onClose,children,width=860,footer}) => (
  <div>
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:500,background:"rgba(13,43,64,0.5)",backdropFilter:"blur(3px)"}}/>
    <div style={{position:"fixed",top:0,right:0,bottom:0,width,maxWidth:"96vw",zIndex:501,background:"white",boxShadow:"-8px 0 48px rgba(0,0,0,0.2)",display:"flex",flexDirection:"column",animation:"slideInRight 0.3s cubic-bezier(0.4,0,0.2,1) both"}}>
      <style>{`@keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
      <div style={{padding:"16px 24px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <div>
          {subtitle&&<div style={{fontSize:11,color:C.gray4,textTransform:"uppercase",letterSpacing:0.4,marginBottom:2}}>{subtitle}</div>}
          <h2 style={{margin:0,fontSize:17,fontWeight:700,color:C.gray1}}>{title}</h2>
        </div>
        <button onClick={onClose} style={{width:34,height:34,borderRadius:6,border:`1px solid ${C.border}`,background:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Ico n="close" s={16} c={C.gray4}/>
        </button>
      </div>
      <div style={{flex:1,overflow:"auto"}}>{children}</div>
      {footer&&<div style={{padding:"14px 24px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,justifyContent:"flex-end",background:C.gray9,flexShrink:0}}>{footer}</div>}
    </div>
  </div>
);

// ===== MODAL =====
const Modal = ({title,onClose,children,maxWidth=560}) => (
  <div style={{position:"fixed",inset:0,zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(13,43,64,0.55)",backdropFilter:"blur(4px)"}}/>
    <div style={{position:"relative",width:"100%",maxWidth,background:"white",borderRadius:10,boxShadow:"0 20px 60px rgba(0,0,0,0.25)",overflow:"hidden",maxHeight:"92vh",display:"flex",flexDirection:"column",animation:"scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both"}}>
      <style>{`@keyframes scaleIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}`}</style>
      <div style={{padding:"14px 20px",background:C.shell,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <h3 style={{margin:0,fontSize:15,fontWeight:700,color:"white"}}>{title}</h3>
        <button onClick={onClose} style={{width:28,height:28,borderRadius:6,border:"1px solid rgba(255,255,255,0.2)",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Ico n="close" s={14} c="white"/>
        </button>
      </div>
      <div style={{overflow:"auto",flex:1,padding:"20px 24px"}}>{children}</div>
    </div>
  </div>
);

// ===== TABLE =====
const Table = ({cols,rows,onRow,empty="Aucune donnée"}) => (
  <div style={{overflowX:"auto"}}>
    <table style={{width:"100%",borderCollapse:"collapse"}}>
      <thead>
        <tr style={{background:C.gray8,borderBottom:`2px solid ${C.border}`}}>
          {cols.map(c=><th key={c} style={{padding:"10px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:C.gray3,textTransform:"uppercase",letterSpacing:0.5,whiteSpace:"nowrap"}}>{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.length===0&&<tr><td colSpan={cols.length} style={{padding:48,textAlign:"center",color:C.gray4,fontSize:14}}>{empty}</td></tr>}
        {rows.map((row,i)=>(
          <tr key={i} onClick={()=>onRow&&onRow(i)}
            style={{borderBottom:`1px solid ${C.border2}`,background:i%2===0?"white":C.gray9,cursor:onRow?"pointer":"default",transition:"background 0.1s"}}
            onMouseEnter={e=>{if(onRow)e.currentTarget.style.background=C.blue_bg}}
            onMouseLeave={e=>{e.currentTarget.style.background=i%2===0?"white":C.gray9}}>
            {row.map((cell,j)=><td key={j} style={{padding:"12px 16px",fontSize:13,color:C.gray1,verticalAlign:"middle"}}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ===== KPI CARD =====
const KpiCard = ({title,value,subtitle,color=C.blue,icon,trend,prefix="",suffix="",onClick,delay=0}) => (
  <div onClick={onClick} style={{
    background:"white",borderRadius:10,padding:"20px",
    border:`1px solid ${C.border}`,borderTop:`3px solid ${color}`,
    cursor:onClick?"pointer":"default",transition:"all 0.2s",
    animation:`fadeUp 0.5s ease both`,animationDelay:`${delay}s`,
    flex:1,minWidth:160,
  }}
    onMouseEnter={e=>{if(onClick){e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.1)";e.currentTarget.style.transform="translateY(-2px)";}}}
    onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none";}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
      <div style={{fontSize:11,fontWeight:700,color:C.gray4,textTransform:"uppercase",letterSpacing:0.4}}>{title}</div>
      {icon&&<div style={{width:34,height:34,borderRadius:8,background:`${color}18`,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <Ico n={icon} s={17} c={color}/>
      </div>}
    </div>
    <div style={{fontSize:typeof value==="string"&&value.length>12?16:28,fontWeight:800,color,marginBottom:4,letterSpacing:"-0.3px"}}>
      {typeof value==="number"?<Counter value={value} prefix={prefix} suffix={suffix} duration={1200}/>:value}
    </div>
    {subtitle&&<div style={{fontSize:12,color:C.gray4}}>{subtitle}</div>}
    {trend!==undefined&&<div style={{marginTop:8,fontSize:11,fontWeight:600,color:trend>=0?C.green:C.red,display:"flex",alignItems:"center",gap:3}}>
      <span style={{fontSize:13}}>{trend>=0?"↑":"↓"}</span>{Math.abs(trend)}% vs mois dernier
    </div>}
  </div>
);

// ===== DONNÉES CRM =====
const CLIENTS = [
  {id:"CL001",nom:"MTN Cameroun",secteur:"Télécommunications",type:"Grands comptes",statut:"actif",ca:450000000,potentiel:600000000,lead:"chaud",ville:"Douala",adresse:"Boulevard de la Liberté, Akwa",tel:"+237 222 500 500",email:"business@mtn.cm",site:"www.mtn.cm",contacts:[{nom:"Jean-Paul Biya",titre:"Directeur Technique",tel:"+237 677 500 001",email:"jp.biya@mtn.cm"},{nom:"Marie Essama",titre:"Responsable Achats",tel:"+237 677 500 002",email:"m.essama@mtn.cm"}],responsable:"Marie Kamga",dateCreation:"2020-01-15",dernierContact:"2024-03-12",projets:["PROJ-2024-001","PROJ-2024-005"],logo:"MTN",couleur:"#FFCC00",logoC:"#000000",notes:"Client prioritaire. Renouvellement contrat cadre prévu Q2 2024."},
  {id:"CL002",nom:"Orange Cameroun",secteur:"Télécommunications",type:"Grands comptes",statut:"actif",ca:320000000,potentiel:400000000,lead:"chaud",ville:"Yaoundé",adresse:"Avenue Kennedy, Centre Ville",tel:"+237 222 600 600",email:"enterprise@orange.cm",site:"www.orange.cm",contacts:[{nom:"Paul Ndongo",titre:"DSI",tel:"+237 677 600 001",email:"p.ndongo@orange.cm"},{nom:"Alice Foé",titre:"Chef de Projet",tel:"+237 677 600 002",email:"a.foe@orange.cm"}],responsable:"Jean Fouda",dateCreation:"2020-03-01",dernierContact:"2024-03-10",projets:["PROJ-2024-002"],logo:"ORA",couleur:"#FF7900",logoC:"#FFFFFF",notes:"Excellent relationnel. Opportunité déploiement 5G en cours."},
  {id:"CL003",nom:"Huawei Technologies",secteur:"Technologies",type:"Grands comptes",statut:"actif",ca:280000000,potentiel:350000000,lead:"tiede",ville:"Douala",adresse:"Bonanjo, Rue du Commerce",tel:"+237 222 700 700",email:"cm.enterprise@huawei.com",site:"www.huawei.com",contacts:[{nom:"Wang Lei",titre:"Country Manager",tel:"+237 677 700 001",email:"wang.lei@huawei.com"},{nom:"Chen Ming",titre:"Technical Director",tel:"+237 677 700 002",email:"chen.ming@huawei.com"}],responsable:"Pierre Etoga",dateCreation:"2021-06-01",dernierContact:"2024-02-28",projets:["PROJ-2024-003"],logo:"HUA",couleur:"#CF0A2C",logoC:"#FFFFFF",notes:"Partenaire stratégique pour équipements 5G."},
  {id:"CL004",nom:"Nexttel Cameroun",secteur:"Télécommunications",type:"Comptes intermédiaires",statut:"actif",ca:120000000,potentiel:200000000,lead:"tiede",ville:"Douala",adresse:"Akwa Nord",tel:"+237 222 800 800",email:"b2b@nexttel.cm",site:"www.nexttel.cm",contacts:[{nom:"Amina Diallo",titre:"DG Adjointe",tel:"+237 677 800 001",email:"a.diallo@nexttel.cm"}],responsable:"Jean Fouda",dateCreation:"2022-01-10",dernierContact:"2024-02-15",projets:[],logo:"NXT",couleur:"#E31E24",logoC:"#FFFFFF",notes:"En attente décision budget 2024."},
  {id:"CL005",nom:"CAMTEL",secteur:"Télécommunications",type:"Secteur public",statut:"actif",ca:95000000,potentiel:300000000,lead:"chaud",ville:"Yaoundé",adresse:"Avenue Ahmadou Ahidjo",tel:"+237 222 223 000",email:"dg@camtel.cm",site:"www.camtel.cm",contacts:[{nom:"Dir. Infrastructure",titre:"Directeur Infrastructure",tel:"+237 677 223 001",email:"infra@camtel.cm"}],responsable:"Marie Kamga",dateCreation:"2021-09-01",dernierContact:"2024-03-08",projets:["PROJ-2024-006"],logo:"CAM",couleur:"#006B3F",logoC:"#FFFFFF",notes:"Appel d'offres fibre nationale en cours. Priorité haute."},
  {id:"CL006",nom:"Ministère des Postes",secteur:"Administration publique",type:"Secteur public",statut:"actif",ca:65000000,potentiel:150000000,lead:"froid",ville:"Yaoundé",adresse:"Quartier Administratif",tel:"+237 222 234 000",email:"minpostel@camnet.cm",site:"www.minpostel.cm",contacts:[{nom:"Secrétaire Général",titre:"Secrétaire Général",tel:"+237 677 234 001",email:"sg@minpostel.cm"}],responsable:"David Mballa",dateCreation:"2022-06-15",dernierContact:"2024-01-20",projets:[],logo:"MIN",couleur:"#1B3A52",logoC:"#FFFFFF",notes:"Processus décisionnel lent. Suivi trimestriel."},
];

const OPPORTUNITES = [
  {id:"OPP001",titre:"Déploiement 5G Réseau Cœur MTN",clientId:"CL001",client:"MTN Cameroun",montant:180000000,proba:75,etape:"negociation",dateClose:"2024-06-30",responsable:"Marie Kamga",description:"Extension réseau 5G sur 15 sites à Douala et Yaoundé",activites:3,dateCreation:"2024-01-15",tags:["5G","Infrastructure","Prioritaire"]},
  {id:"OPP002",titre:"Optimisation RF Orange Q2",clientId:"CL002",client:"Orange Cameroun",montant:85000000,proba:60,etape:"proposition",dateClose:"2024-05-15",responsable:"Jean Fouda",description:"Mission d'optimisation RF sur 8 régions",activites:2,dateCreation:"2024-02-01",tags:["RF","Optimisation"]},
  {id:"OPP003",titre:"Fibre Optique CAMTEL Phase 2",clientId:"CL005",client:"CAMTEL",montant:220000000,proba:45,etape:"qualifie",dateClose:"2024-08-31",responsable:"Marie Kamga",description:"Déploiement fibre optique nationale phase 2",activites:1,dateCreation:"2024-02-15",tags:["Fibre","National","Stratégique"]},
  {id:"OPP004",titre:"Maintenance Préventive Huawei Sites",clientId:"CL003",client:"Huawei Technologies",montant:45000000,proba:85,etape:"negociation",dateClose:"2024-04-30",responsable:"Pierre Etoga",description:"Contrat maintenance préventive 50 sites BTS",activites:4,dateCreation:"2024-01-20",tags:["Maintenance","Contrat cadre"]},
  {id:"OPP005",titre:"Audit Réseau Nexttel",clientId:"CL004",client:"Nexttel Cameroun",montant:25000000,proba:30,etape:"prospect",dateClose:"2024-07-31",responsable:"Jean Fouda",description:"Audit complet infrastructure réseau existante",activites:1,dateCreation:"2024-03-01",tags:["Audit"]},
  {id:"OPP006",titre:"Infrastructure MINPOSTEL",clientId:"CL006",client:"Ministère des Postes",montant:65000000,proba:20,etape:"prospect",dateClose:"2024-09-30",responsable:"David Mballa",description:"Modernisation infrastructure réseau ministère",activites:0,dateCreation:"2024-03-05",tags:["Secteur public"]},
  {id:"OPP007",titre:"5G Small Cells MTN Douala",clientId:"CL001",client:"MTN Cameroun",montant:95000000,proba:90,etape:"gagne",dateClose:"2024-02-28",responsable:"Pierre Etoga",description:"Installation small cells 5G centre-ville Douala",activites:5,dateCreation:"2023-12-01",tags:["5G","Gagné"]},
  {id:"OPP008",titre:"Réseau VSAT Orange Régions",clientId:"CL002",client:"Orange Cameroun",montant:38000000,proba:0,etape:"perdu",dateClose:"2024-01-31",responsable:"Jean Fouda",description:"Déploiement VSAT zones rurales",activites:2,dateCreation:"2023-11-15",tags:["VSAT","Perdu"]},
];

const ACTIVITES = [
  {id:"ACT001",type:"appel",titre:"Appel qualification MTN 5G",clientId:"CL001",client:"MTN Cameroun",oppId:"OPP001",contact:"Jean-Paul Biya",date:"2024-03-15",heure:"10:00",duree:45,statut:"fait",responsable:"Marie Kamga",notes:"Discussion budget Q2. Décision finale semaine prochaine.",resultat:"Positif — RDV physique planifié"},
  {id:"ACT002",type:"reunion",titre:"Présentation offre Orange RF",clientId:"CL002",client:"Orange Cameroun",oppId:"OPP002",contact:"Paul Ndongo",date:"2024-03-18",heure:"14:00",duree:90,statut:"planifie",responsable:"Jean Fouda",notes:"Préparer deck technique + chiffrage détaillé",resultat:""},
  {id:"ACT003",type:"email",titre:"Envoi proposition CAMTEL",clientId:"CL005",client:"CAMTEL",oppId:"OPP003",contact:"Dir. Infrastructure",date:"2024-03-12",heure:"09:00",duree:0,statut:"fait",responsable:"Marie Kamga",notes:"Proposition technique et commerciale envoyée par email",resultat:"Accusé réception. Délai réponse 15 jours."},
  {id:"ACT004",type:"visite",titre:"Visite site Huawei BTS Bonanjo",clientId:"CL003",client:"Huawei Technologies",oppId:"OPP004",contact:"Chen Ming",date:"2024-03-20",heure:"08:00",duree:180,statut:"planifie",responsable:"Pierre Etoga",notes:"Inspection 5 sites BTS pour évaluation contrat maintenance",resultat:""},
  {id:"ACT005",type:"relance",titre:"Relance Nexttel budget 2024",clientId:"CL004",client:"Nexttel Cameroun",oppId:"OPP005",contact:"Amina Diallo",date:"2024-03-22",heure:"11:00",duree:30,statut:"planifie",responsable:"Jean Fouda",notes:"Relancer sur décision budget audit réseau",resultat:""},
  {id:"ACT006",type:"appel",titre:"Suivi MINPOSTEL appel d'offres",clientId:"CL006",client:"Ministère des Postes",oppId:"OPP006",contact:"Secrétaire Général",date:"2024-03-08",heure:"15:00",duree:20,statut:"fait",responsable:"David Mballa",notes:"Confirmation participation AO. Documents à soumettre avant le 30/04.",resultat:"À surveiller"},
];

const ETAPES = [
  {id:"prospect",    label:"Prospect",     color:C.gray3,  bg:"#F4F4F4"},
  {id:"qualifie",    label:"Qualifié",     color:C.blue,   bg:C.blue_bg},
  {id:"proposition", label:"Proposition",  color:C.gold,   bg:"#FFF3E0"},
  {id:"negociation", label:"Négociation",  color:C.purple, bg:C.purple_bg},
  {id:"gagne",       label:"Gagné ✓",     color:C.green,  bg:C.green_bg},
  {id:"perdu",       label:"Perdu ✗",     color:C.red,    bg:C.red_bg},
];

// ===== LOGO CLIENT =====
const ClientLogo = ({client,size=40}) => (
  <div style={{
    width:size,height:size,borderRadius:size*0.2,
    background:client.couleur,color:client.logoC,
    display:"flex",alignItems:"center",justifyContent:"center",
    fontSize:size*0.28,fontWeight:800,flexShrink:0,
    boxShadow:"0 2px 8px rgba(0,0,0,0.15)",
    letterSpacing:0.5,
  }}>
    {client.logo}
  </div>
);

// ===== FICHE CLIENT DÉTAILLÉE =====
const FicheClient = ({client,onClose,opportunites,activites}) => {
  const [tab,setTab] = useState("infos");
  const clientOpps = opportunites.filter(o=>o.clientId===client.id);
  const clientActs = activites.filter(a=>a.clientId===client.id);
  const caTotal = clientOpps.filter(o=>o.etape==="gagne").reduce((s,o)=>s+o.montant,0);
  const pipeline = clientOpps.filter(o=>!["gagne","perdu"].includes(o.etape)).reduce((s,o)=>s+o.montant,0);

  const TABS = [
    {id:"infos",l:"Informations",i:"building"},
    {id:"contacts",l:"Contacts",i:"users"},
    {id:"opportunites",l:`Opportunités (${clientOpps.length})`,i:"target"},
    {id:"activites",l:`Activités (${clientActs.length})`,i:"activity"},
    {id:"notes",l:"Notes",i:"doc"},
  ];

  return (
    <Panel title={client.nom} subtitle="Fiche client" onClose={onClose} width={900}
      footer={<>
        <Btn label="Fermer" onClick={onClose} variant="ghost"/>
        <Btn label="Nouvelle activité" icon="add" variant="outline"/>
        <Btn label="Nouvelle opportunité" icon="target" variant="primary"/>
      </>}>

      {/* Header client */}
      <div style={{background:`linear-gradient(135deg,${C.shell},${C.shell2})`,padding:"24px 32px 0",position:"relative",overflow:"hidden"}}>
        {/* Fond décoratif */}
        <div style={{position:"absolute",top:-40,right:-40,width:200,height:200,borderRadius:"50%",background:`${client.couleur}20`}}/>
        <div style={{position:"absolute",bottom:-20,right:60,width:120,height:120,borderRadius:"50%",background:`${client.couleur}15`}}/>

        <div style={{display:"flex",gap:20,alignItems:"flex-end",position:"relative"}}>
          <div style={{flexShrink:0,marginBottom:"-20px"}}>
            <ClientLogo client={client} size={80}/>
          </div>
          <div style={{flex:1,paddingBottom:16}}>
            <div style={{fontSize:22,fontWeight:800,color:"white",marginBottom:4}}>{client.nom}</div>
            <div style={{fontSize:14,color:"rgba(255,255,255,0.7)",marginBottom:10}}>
              {client.secteur} · {client.type}
            </div>
            <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
              {[{i:"loc",v:client.ville},{i:"globe",v:client.site},{i:"phone",v:client.tel}].map(item=>(
                <div key={item.i} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"rgba(255,255,255,0.6)"}}>
                  <Ico n={item.i} s={12} c="rgba(255,255,255,0.5)"/>
                  {item.v}
                </div>
              ))}
            </div>
          </div>

          {/* Stats rapides */}
          <div style={{display:"flex",gap:0,paddingBottom:16}}>
            {[
              {l:"CA généré",v:`${fmtN(client.ca/1000000)}M FCFA`,c:"#4ade80"},
              {l:"Pipeline",v:`${fmtN(pipeline/1000000)}M FCFA`,c:"#60a5fa"},
              {l:"Statut lead",v:<Badge s={client.lead}/>},
            ].map((s,i)=>(
              <div key={s.l} style={{textAlign:"center",padding:"8px 20px",borderLeft:i>0?"1px solid rgba(255,255,255,0.1)":"none"}}>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.45)",textTransform:"uppercase",letterSpacing:0.4,marginBottom:4}}>{s.l}</div>
                <div style={{fontSize:14,fontWeight:700,color:s.c||"white"}}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:0,marginTop:16,borderTop:"1px solid rgba(255,255,255,0.1)",paddingTop:4}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              display:"flex",alignItems:"center",gap:6,
              padding:"10px 18px",border:"none",
              borderBottom:`2px solid ${tab===t.id?"white":"transparent"}`,
              background:"transparent",
              color:tab===t.id?"white":"rgba(255,255,255,0.5)",
              fontWeight:tab===t.id?700:400,
              fontSize:13,cursor:"pointer",whiteSpace:"nowrap",
              fontFamily:"inherit",transition:"all 0.15s",
            }}>
              <Ico n={t.i} s={13} c={tab===t.id?"white":"rgba(255,255,255,0.5)"}/>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div style={{padding:"24px 32px"}}>

        {tab==="infos"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:C.blue,textTransform:"uppercase",letterSpacing:0.5,marginBottom:14,paddingBottom:8,borderBottom:`2px solid ${C.blue}`}}>
                Informations générales
              </div>
              {[
                ["Nom","nom"],["Secteur","secteur"],["Type","type"],
                ["Ville","ville"],["Adresse","adresse"],
                ["Téléphone","tel"],["Email","email"],["Site web","site"],
              ].map(([l,k])=>(
                <div key={l} style={{display:"grid",gridTemplateColumns:"140px 1fr",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.border2}`,alignItems:"center"}}>
                  <span style={{fontSize:13,color:C.gray4,fontWeight:500}}>{l}</span>
                  <span style={{fontSize:13,color:C.gray1}}>{client[k]||"—"}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:C.blue,textTransform:"uppercase",letterSpacing:0.5,marginBottom:14,paddingBottom:8,borderBottom:`2px solid ${C.blue}`}}>
                Données commerciales
              </div>
              {[
                ["CA actuel",`${fmtN(client.ca)} FCFA`],
                ["Potentiel estimé",`${fmtN(client.potentiel)} FCFA`],
                ["Lead scoring",<Badge s={client.lead}/>],
                ["Statut",<Badge s={client.statut}/>],
                ["Responsable commercial",client.responsable],
                ["Date création",fmtD(client.dateCreation)],
                ["Dernier contact",fmtD(client.dernierContact)],
              ].map(([l,v])=>(
                <div key={l} style={{display:"grid",gridTemplateColumns:"160px 1fr",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.border2}`,alignItems:"center"}}>
                  <span style={{fontSize:13,color:C.gray4,fontWeight:500}}>{l}</span>
                  <span style={{fontSize:13,color:C.gray1}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="contacts"&&(
          <div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
              <Btn label="Ajouter contact" icon="add" variant="primary" sm/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {client.contacts.map((ct,i)=>(
                <div key={i} style={{background:"white",border:`1px solid ${C.border}`,borderRadius:10,padding:20,transition:"all 0.15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.blue;e.currentTarget.style.boxShadow="0 4px 16px rgba(0,112,242,0.1)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.boxShadow="none"}}>
                  <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:14}}>
                    <div style={{width:48,height:48,borderRadius:"50%",background:C.blue_bg,color:C.blue,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,flexShrink:0}}>
                      {ct.nom.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:C.gray1}}>{ct.nom}</div>
                      <div style={{fontSize:12,color:C.gray4,marginTop:2}}>{ct.titre}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {[{i:"phone",v:ct.tel},{i:"mail",v:ct.email}].map(item=>(
                      <div key={item.i} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:C.gray2}}>
                        <Ico n={item.i} s={13} c={C.gray4}/>
                        {item.v}
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:14,paddingTop:12,borderTop:`1px solid ${C.border2}`}}>
                    <Btn label="Appeler" icon="phone" variant="ghost" sm full/>
                    <Btn label="Email" icon="mail" variant="ghost" sm full/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="opportunites"&&(
          <div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
              <Btn label="Nouvelle opportunité" icon="add" variant="primary" sm/>
            </div>
            {clientOpps.length===0
              ? <div style={{padding:40,textAlign:"center",color:C.gray4,background:C.gray9,borderRadius:8,border:`1px dashed ${C.border}`}}>Aucune opportunité</div>
              : clientOpps.map(opp=>(
                  <div key={opp.id} style={{background:"white",border:`1px solid ${C.border}`,borderRadius:8,padding:"16px 20px",marginBottom:12,transition:"all 0.15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=C.blue;e.currentTarget.style.transform="translateX(4px)"}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="none"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div>
                        <div style={{fontSize:14,fontWeight:700,color:C.gray1,marginBottom:4}}>{opp.titre}</div>
                        <div style={{fontSize:12,color:C.gray4}}>{opp.description}</div>
                      </div>
                      <Badge s={opp.etape}/>
                    </div>
                    <div style={{display:"flex",gap:20,marginTop:10,paddingTop:10,borderTop:`1px solid ${C.border2}`}}>
                      {[
                        {l:"Montant",v:`${fmtN(opp.montant)} FCFA`,bold:true,c:C.blue},
                        {l:"Probabilité",v:`${opp.proba}%`,c:opp.proba>=70?C.green:opp.proba>=40?C.orange:C.red},
                        {l:"Clôture prévue",v:fmtD(opp.dateClose)},
                        {l:"Responsable",v:opp.responsable},
                      ].map(item=>(
                        <div key={item.l}>
                          <div style={{fontSize:10,color:C.gray4,textTransform:"uppercase",letterSpacing:0.4,marginBottom:2}}>{item.l}</div>
                          <div style={{fontSize:13,fontWeight:item.bold?700:500,color:item.c||C.gray1}}>{item.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            }
          </div>
        )}

        {tab==="activites"&&(
          <div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
              <Btn label="Nouvelle activité" icon="add" variant="primary" sm/>
            </div>
            {clientActs.length===0
              ? <div style={{padding:40,textAlign:"center",color:C.gray4,background:C.gray9,borderRadius:8,border:`1px dashed ${C.border}`}}>Aucune activité</div>
              : clientActs.map((act,i)=>{
                  const typeColors = {appel:C.blue,reunion:C.purple,email:C.gold,relance:C.orange,visite:C.teal};
                  const tc = typeColors[act.type]||C.gray3;
                  return (
                    <div key={act.id} style={{display:"flex",gap:14,marginBottom:16,animation:`fadeUp 0.3s ease both`,animationDelay:`${i*0.05}s`}}>
                      <div style={{width:36,height:36,borderRadius:"50%",background:`${tc}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:`2px solid ${tc}30`}}>
                        <Ico n={act.type==="appel"?"phone":act.type==="email"?"mail":act.type==="reunion"?"users":"refresh"} s={16} c={tc}/>
                      </div>
                      <div style={{flex:1,background:"white",border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 16px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                          <span style={{fontSize:13,fontWeight:700,color:C.gray1}}>{act.titre}</span>
                          <div style={{display:"flex",gap:8,alignItems:"center"}}>
                            <Badge s={act.statut}/>
                            <span style={{fontSize:11,color:C.gray4}}>{fmtD(act.date)} {act.heure}</span>
                          </div>
                        </div>
                        <div style={{fontSize:12,color:C.gray4,marginBottom:4}}>{act.contact} · {act.responsable}</div>
                        {act.notes&&<div style={{fontSize:12,color:C.gray2,background:C.gray9,padding:"6px 10px",borderRadius:6,marginTop:6}}>{act.notes}</div>}
                        {act.resultat&&<div style={{fontSize:12,color:C.green,marginTop:6,fontWeight:500}}>→ {act.resultat}</div>}
                      </div>
                    </div>
                  );
                })
            }
          </div>
        )}

        {tab==="notes"&&(
          <div>
            <div style={{background:C.gray9,borderRadius:8,padding:20,border:`1px solid ${C.border}`,marginBottom:16}}>
              <div style={{fontSize:13,color:C.gray1,lineHeight:1.6}}>{client.notes}</div>
            </div>
            <Btn label="Modifier les notes" icon="edit" variant="outline" sm/>
          </div>
        )}
      </div>
    </Panel>
  );
};

// ===== FICHE OPPORTUNITÉ =====
const FicheOpportunite = ({opp,onClose,clients,activites}) => {
  const client = clients.find(c=>c.id===opp.clientId);
  const oppActs = activites.filter(a=>a.oppId===opp.id);
  const etape = ETAPES.find(e=>e.id===opp.etape);

  return (
    <Panel title={opp.titre} subtitle="Opportunité commerciale" onClose={onClose} width={800}
      footer={<>
        <Btn label="Fermer" onClick={onClose} variant="ghost"/>
        <Btn label="Modifier" icon="edit" variant="outline"/>
        <Btn label="Marquer Gagnée" icon="won" variant="success"/>
      </>}>

      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${C.shell},${C.shell2})`,padding:"24px 32px"}}>
        <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:16}}>
          {client&&<ClientLogo client={client} size={52}/>}
          <div>
            <div style={{fontSize:20,fontWeight:800,color:"white",marginBottom:4}}>{opp.titre}</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.7)"}}>{opp.client}</div>
          </div>
          <div style={{marginLeft:"auto"}}><Badge s={opp.etape}/></div>
        </div>

        {/* Barre de progression étapes */}
        <div style={{display:"flex",gap:0}}>
          {ETAPES.filter(e=>!["gagne","perdu"].includes(e.id)).map((e,i,arr)=>{
            const etapeIdx = ETAPES.findIndex(et=>et.id===opp.etape);
            const thisIdx = ETAPES.findIndex(et=>et.id===e.id);
            const isDone = thisIdx<=etapeIdx;
            const isCurrent = e.id===opp.etape;
            return (
              <div key={e.id} style={{flex:1,display:"flex",alignItems:"center"}}>
                <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:isDone?e.color:"rgba(255,255,255,0.15)",border:isCurrent?`3px solid white`:"2px solid rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:isCurrent?"0 0 0 3px rgba(255,255,255,0.3)":""}}> 
                    {isDone&&!isCurrent?<Ico n="check" s={12} c="white"/>:<span style={{fontSize:11,fontWeight:700,color:"white"}}>{i+1}</span>}
                  </div>
                  <span style={{fontSize:10,color:isDone?"white":"rgba(255,255,255,0.4)",fontWeight:isCurrent?700:400,textAlign:"center"}}>{e.label}</span>
                </div>
                {i<arr.length-1&&<div style={{height:2,flex:0.5,background:isDone?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.15)",marginBottom:16}}/>}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{padding:"24px 32px"}}>
        {/* KPIs */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
          {[
            {t:"Montant estimé",v:`${fmtN(opp.montant)} FCFA`,c:C.blue},
            {t:"Probabilité",v:`${opp.proba}%`,c:opp.proba>=70?C.green:opp.proba>=40?C.orange:C.red},
            {t:"Date de clôture",v:fmtD(opp.dateClose),c:C.gray1},
            {t:"Valeur pondérée",v:`${fmtN(opp.montant*opp.proba/100)} FCFA`,c:C.purple},
          ].map(k=>(
            <div key={k.t} style={{background:"white",border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 16px"}}>
              <div style={{fontSize:10,color:C.gray4,textTransform:"uppercase",letterSpacing:0.4,marginBottom:5}}>{k.t}</div>
              <div style={{fontSize:15,fontWeight:700,color:k.c}}>{k.v}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div style={{marginBottom:24}}>
          <div style={{fontSize:12,fontWeight:700,color:C.blue,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10,paddingBottom:8,borderBottom:`2px solid ${C.blue}`}}>Description</div>
          <p style={{fontSize:13,color:C.gray2,lineHeight:1.6,margin:0}}>{opp.description}</p>
          {opp.tags?.length>0&&(
            <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
              {opp.tags.map(t=>(
                <span key={t} style={{padding:"3px 10px",borderRadius:20,background:C.blue_bg,color:C.blue,fontSize:11,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
                  <Ico n="tag" s={11} c={C.blue}/>{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Activités liées */}
        <div>
          <div style={{fontSize:12,fontWeight:700,color:C.blue,textTransform:"uppercase",letterSpacing:0.5,marginBottom:14,paddingBottom:8,borderBottom:`2px solid ${C.blue}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            Activités liées ({oppActs.length})
            <Btn label="Ajouter" icon="add" variant="outline" sm/>
          </div>
          {oppActs.length===0
            ? <div style={{padding:24,textAlign:"center",color:C.gray4,background:C.gray9,borderRadius:8}}>Aucune activité</div>
            : oppActs.map(act=>{
                const tc = {appel:C.blue,reunion:C.purple,email:C.gold,relance:C.orange,visite:C.teal}[act.type]||C.gray3;
                return (
                  <div key={act.id} style={{display:"flex",gap:12,marginBottom:12,background:"white",border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 16px"}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:`${tc}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <Ico n={act.type==="appel"?"phone":act.type==="email"?"mail":"users"} s={14} c={tc}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between"}}>
                        <span style={{fontSize:13,fontWeight:600,color:C.gray1}}>{act.titre}</span>
                        <Badge s={act.statut}/>
                      </div>
                      <div style={{fontSize:11,color:C.gray4,marginTop:2}}>{fmtD(act.date)} · {act.responsable}</div>
                    </div>
                  </div>
                );
              })
          }
        </div>
      </div>
    </Panel>
  );
};

// ===== FORMULAIRE NOUVEAU CLIENT =====
const FormClient = ({onClose,onSave}) => {
  const [f,setF] = useState({nom:"",secteur:"",type:"",statut:"actif",lead:"froid",ville:"",adresse:"",tel:"",email:"",site:"",responsable:"",potentiel:"",notes:""});
  const u = (k,v) => setF(p=>({...p,[k]:v}));
  return (
    <Modal title="Nouveau client" onClose={onClose} maxWidth={640}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Field label="Nom de l'entreprise" required span><Input value={f.nom} onChange={v=>u("nom",v)} placeholder="Ex: MTN Cameroun"/></Field>
        <Field label="Secteur d'activité"><Select value={f.secteur} onChange={v=>u("secteur",v)} options={["Télécommunications","Technologies","Administration publique","Énergie","Banque & Finance","Industrie","Autre"]}/></Field>
        <Field label="Type de compte"><Select value={f.type} onChange={v=>u("type",v)} options={["Grands comptes","Comptes intermédiaires","Secteur public","PME","Autre"]}/></Field>
        <Field label="Lead scoring"><Select value={f.lead} onChange={v=>u("lead",v)} options={[{v:"chaud",l:"🔥 Chaud"},{v:"tiede",l:"🌡 Tiède"},{v:"froid",l:"❄️ Froid"}]}/></Field>
        <Field label="Ville"><Select value={f.ville} onChange={v=>u("ville",v)} options={["Douala","Yaoundé","Bafoussam","Garoua","Bamenda","Kribi"]}/></Field>
        <Field label="Adresse"><Input value={f.adresse} onChange={v=>u("adresse",v)} placeholder="Adresse complète"/></Field>
        <Field label="Téléphone"><Input value={f.tel} onChange={v=>u("tel",v)} placeholder="+237 222 XXX XXX"/></Field>
        <Field label="Email"><Input type="email" value={f.email} onChange={v=>u("email",v)} placeholder="contact@entreprise.cm"/></Field>
        <Field label="Site web"><Input value={f.site} onChange={v=>u("site",v)} placeholder="www.entreprise.cm"/></Field>
        <Field label="Responsable commercial"><Select value={f.responsable} onChange={v=>u("responsable",v)} options={["Marie Kamga","Jean Fouda","Pierre Etoga","David Mballa"]}/></Field>
        <Field label="Potentiel estimé (FCFA)" span><Input type="number" value={f.potentiel} onChange={v=>u("potentiel",v)} placeholder="Ex: 50 000 000"/></Field>
        <Field label="Notes" span>
          <textarea value={f.notes} onChange={e=>u("notes",e.target.value)} placeholder="Notes et commentaires..."
            style={{width:"100%",padding:"9px 12px",border:`1px solid ${C.border}`,borderRadius:6,fontSize:13,fontFamily:"inherit",resize:"vertical",minHeight:80,outline:"none",boxSizing:"border-box"}}
            onFocus={e=>e.target.style.borderColor=C.blue}
            onBlur={e=>e.target.style.borderColor=C.border}/>
        </Field>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",paddingTop:16,borderTop:`1px solid ${C.border2}`,marginTop:16}}>
        <Btn label="Annuler" onClick={onClose} variant="ghost"/>
        <Btn label="Créer le client" icon="check" variant="primary" onClick={()=>{
          if(!f.nom) return;
          const couleurs = ["#FFCC00","#FF7900","#CF0A2C","#E31E24","#006B3F","#1B3A52"];
          const c = couleurs[Math.floor(Math.random()*couleurs.length)];
          onSave({...f,id:"CL"+Date.now(),ca:0,potentiel:Number(f.potentiel)||0,contacts:[],projets:[],logo:f.nom.slice(0,3).toUpperCase(),couleur:c,logoC:"#FFFFFF",dateCreation:new Date().toISOString().split("T")[0],dernierContact:new Date().toISOString().split("T")[0]});
          onClose();
        }}/>
      </div>
    </Modal>
  );
};

// ===== FORMULAIRE OPPORTUNITÉ =====
const FormOpportunite = ({onClose,onSave,clients}) => {
  const [f,setF] = useState({titre:"",clientId:"",montant:"",proba:"50",etape:"prospect",dateClose:"",responsable:"",description:""});
  const u = (k,v) => setF(p=>({...p,[k]:v}));
  return (
    <Modal title="Nouvelle opportunité" onClose={onClose} maxWidth={560}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Field label="Titre" required span><Input value={f.titre} onChange={v=>u("titre",v)} placeholder="Ex: Déploiement 5G MTN"/></Field>
        <Field label="Client" required><Select value={f.clientId} onChange={v=>u("clientId",v)} options={clients.map(c=>({v:c.id,l:c.nom}))}/></Field>
        <Field label="Étape"><Select value={f.etape} onChange={v=>u("etape",v)} options={ETAPES.map(e=>({v:e.id,l:e.label}))}/></Field>
        <Field label="Montant estimé (FCFA)"><Input type="number" value={f.montant} onChange={v=>u("montant",v)} placeholder="Ex: 50 000 000"/></Field>
        <Field label="Probabilité (%)"><Input type="number" value={f.proba} onChange={v=>u("proba",v)} placeholder="0-100"/></Field>
        <Field label="Date de clôture"><Input type="date" value={f.dateClose} onChange={v=>u("dateClose",v)}/></Field>
        <Field label="Responsable" span><Select value={f.responsable} onChange={v=>u("responsable",v)} options={["Marie Kamga","Jean Fouda","Pierre Etoga","David Mballa"]}/></Field>
        <Field label="Description" span>
          <textarea value={f.description} onChange={e=>u("description",e.target.value)} placeholder="Description de l'opportunité..."
            style={{width:"100%",padding:"9px 12px",border:`1px solid ${C.border}`,borderRadius:6,fontSize:13,fontFamily:"inherit",resize:"vertical",minHeight:80,outline:"none",boxSizing:"border-box"}}/>
        </Field>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",paddingTop:16,borderTop:`1px solid ${C.border2}`,marginTop:16}}>
        <Btn label="Annuler" onClick={onClose} variant="ghost"/>
        <Btn label="Créer l'opportunité" icon="check" variant="primary" onClick={()=>{
          if(!f.titre||!f.clientId) return;
          const cl = clients.find(c=>c.id===f.clientId);
          onSave({...f,id:"OPP"+Date.now(),client:cl?.nom||"",montant:Number(f.montant)||0,proba:Number(f.proba)||0,activites:0,dateCreation:new Date().toISOString().split("T")[0],tags:[]});
          onClose();
        }}/>
      </div>
    </Modal>
  );
};

// ===== FORMULAIRE ACTIVITÉ =====
const FormActivite = ({onClose,onSave,clients}) => {
  const [f,setF] = useState({type:"appel",titre:"",clientId:"",contact:"",date:"",heure:"",duree:"30",statut:"planifie",responsable:"",notes:""});
  const u = (k,v) => setF(p=>({...p,[k]:v}));
  const cl = clients.find(c=>c.id===f.clientId);
  return (
    <Modal title="Nouvelle activité" onClose={onClose} maxWidth={520}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Field label="Type" required><Select value={f.type} onChange={v=>u("type",v)} options={[{v:"appel",l:"📞 Appel"},{v:"reunion",l:"🤝 Réunion"},{v:"email",l:"📧 Email"},{v:"relance",l:"🔔 Relance"},{v:"visite",l:"🏢 Visite site"}]}/></Field>
        <Field label="Titre" required><Input value={f.titre} onChange={v=>u("titre",v)} placeholder="Ex: Appel qualification"/></Field>
        <Field label="Client" required><Select value={f.clientId} onChange={v=>u("clientId",v)} options={clients.map(c=>({v:c.id,l:c.nom}))}/></Field>
        <Field label="Contact"><Select value={f.contact} onChange={v=>u("contact",v)} options={cl?cl.contacts.map(ct=>({v:ct.nom,l:ct.nom})):[]} placeholder="Sélectionner contact"/></Field>
        <Field label="Date"><Input type="date" value={f.date} onChange={v=>u("date",v)}/></Field>
        <Field label="Heure"><Input type="time" value={f.heure} onChange={v=>u("heure",v)}/></Field>
        <Field label="Durée (min)"><Input type="number" value={f.duree} onChange={v=>u("duree",v)} placeholder="30"/></Field>
        <Field label="Responsable"><Select value={f.responsable} onChange={v=>u("responsable",v)} options={["Marie Kamga","Jean Fouda","Pierre Etoga","David Mballa"]}/></Field>
        <Field label="Notes" span>
          <textarea value={f.notes} onChange={e=>u("notes",e.target.value)} placeholder="Notes..."
            style={{width:"100%",padding:"9px 12px",border:`1px solid ${C.border}`,borderRadius:6,fontSize:13,fontFamily:"inherit",resize:"vertical",minHeight:70,outline:"none",boxSizing:"border-box"}}/>
        </Field>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",paddingTop:16,borderTop:`1px solid ${C.border2}`,marginTop:16}}>
        <Btn label="Annuler" onClick={onClose} variant="ghost"/>
        <Btn label="Créer l'activité" icon="check" variant="primary" onClick={()=>{
          if(!f.titre||!f.clientId) return;
          onSave({...f,id:"ACT"+Date.now(),client:clients.find(c=>c.id===f.clientId)?.nom||""});
          onClose();
        }}/>
      </div>
    </Modal>
  );
};

// ===== DASHBOARD CRM =====
const DashboardCRM = ({clients,opportunites,activites,setTab}) => {
  const totalCA = clients.reduce((s,c)=>s+c.ca,0);
  const pipeline = opportunites.filter(o=>!["gagne","perdu"].includes(o.etape)).reduce((s,o)=>s+o.montant,0);
  const gagnes = opportunites.filter(o=>o.etape==="gagne");
  const tauxConv = opportunites.length>0?Math.round(gagnes.length/opportunites.length*100):0;
  const actsAujourdhui = activites.filter(a=>a.statut==="planifie").length;

  // Pipeline par étape
  const pipelineParEtape = ETAPES.filter(e=>!["gagne","perdu"].includes(e.id)).map(e=>({
    ...e,
    count: opportunites.filter(o=>o.etape===e.id).length,
    montant: opportunites.filter(o=>o.etape===e.id).reduce((s,o)=>s+o.montant,0),
  }));
  const maxMontant = Math.max(...pipelineParEtape.map(e=>e.montant),1);

  return (
    <div style={{animation:"fadeIn 0.3s ease both"}}>
      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
      `}</style>

      {/* KPIs */}
      <div style={{display:"flex",gap:14,marginBottom:20,flexWrap:"wrap"}}>
        <KpiCard title="Chiffre d'affaires total" value={totalCA} prefix="" suffix=" FCFA" color={C.blue} icon="deal" trend={12} delay={0} onClick={()=>setTab("clients")}/>
        <KpiCard title="Pipeline commercial" value={pipeline} suffix=" FCFA" color={C.purple} icon="pipeline" trend={8} delay={0.06}/>
        <KpiCard title="Opportunités actives" value={opportunites.filter(o=>!["gagne","perdu"].includes(o.etape)).length} color={C.orange} icon="target" delay={0.12} onClick={()=>setTab("pipeline")}/>
        <KpiCard title="Taux de conversion" value={`${tauxConv}%`} color={C.green} icon="trend_up" trend={3} delay={0.18}/>
        <KpiCard title="Activités planifiées" value={actsAujourdhui} color={C.teal} icon="activity" delay={0.24} onClick={()=>setTab("activites")}/>
      </div>

      {/* Grille principale */}
      <div style={{display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:16,marginBottom:16}}>

        {/* Funnel pipeline */}
        <div style={{background:"white",border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border2}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:C.gray9}}>
            <span style={{fontSize:14,fontWeight:700,color:C.gray1}}>Pipeline commercial — Entonnoir</span>
            <Btn label="Voir pipeline →" onClick={()=>setTab("pipeline")} variant="ghost" sm/>
          </div>
          <div style={{padding:"20px"}}>
            {pipelineParEtape.map((e,i)=>{
              const width = maxMontant>0?Math.max((e.montant/maxMontant)*100,e.count>0?15:0):0;
              return (
                <div key={e.id} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:10,height:10,borderRadius:"50%",background:e.color}}/>
                      <span style={{fontSize:13,fontWeight:500,color:C.gray1}}>{e.label}</span>
                      <span style={{fontSize:11,color:C.gray4,background:C.gray8,padding:"1px 6px",borderRadius:10}}>{e.count}</span>
                    </div>
                    <span style={{fontSize:13,fontWeight:700,color:e.color}}>{fmtN(e.montant/1000000)}M FCFA</span>
                  </div>
                  <div style={{height:28,background:C.gray8,borderRadius:6,overflow:"hidden",position:"relative"}}>
                    <div style={{
                      height:"100%",width:`${width}%`,
                      background:`linear-gradient(90deg,${e.color}DD,${e.color}88)`,
                      borderRadius:6,
                      transition:"width 1s cubic-bezier(0.4,0,0.2,1)",
                      animationDelay:`${i*0.1}s`,
                    }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top clients */}
        <div style={{background:"white",border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border2}`,background:C.gray9,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:14,fontWeight:700,color:C.gray1}}>Top clients par CA</span>
            <Btn label="Voir tous →" onClick={()=>setTab("clients")} variant="ghost" sm/>
          </div>
          {[...clients].sort((a,b)=>b.ca-a.ca).slice(0,5).map((cl,i)=>(
            <div key={cl.id} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 20px",borderBottom:i<4?`1px solid ${C.border2}`:"none",background:i%2===0?"white":C.gray9,transition:"background 0.1s",cursor:"pointer"}}
              onMouseEnter={e=>e.currentTarget.style.background=C.blue_bg}
              onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"white":C.gray9}>
              <div style={{width:28,height:28,borderRadius:"50%",background:C.gray8,color:C.gray3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>
                #{i+1}
              </div>
              <ClientLogo client={cl} size={36}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:C.gray1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cl.nom}</div>
                <div style={{fontSize:11,color:C.gray4}}>{cl.secteur}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:13,fontWeight:700,color:C.blue}}>{fmtN(cl.ca/1000000)}M FCFA</div>
                <Badge s={cl.lead}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activités récentes + Opportunités chaudes */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

        {/* Activités récentes */}
        <div style={{background:"white",border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border2}`,background:C.gray9,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:14,fontWeight:700,color:C.gray1}}>Activités récentes</span>
            <Btn label="Voir tout →" onClick={()=>setTab("activites")} variant="ghost" sm/>
          </div>
          {activites.slice(0,4).map((act,i)=>{
            const tc={appel:C.blue,reunion:C.purple,email:C.gold,relance:C.orange,visite:C.teal}[act.type]||C.gray3;
            return (
              <div key={act.id} style={{display:"flex",gap:12,padding:"12px 20px",borderBottom:i<3?`1px solid ${C.border2}`:"none",background:i%2===0?"white":C.gray9}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:`${tc}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Ico n={act.type==="appel"?"phone":act.type==="email"?"mail":act.type==="reunion"?"users":"refresh"} s={15} c={tc}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.gray1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{act.titre}</div>
                  <div style={{fontSize:11,color:C.gray4,marginTop:2}}>{act.client} · {fmtD(act.date)}</div>
                </div>
                <Badge s={act.statut}/>
              </div>
            );
          })}
        </div>

        {/* Opportunités chaudes */}
        <div style={{background:"white",border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border2}`,background:C.gray9,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:14,fontWeight:700,color:C.gray1}}>Opportunités prioritaires</span>
            <Btn label="Voir pipeline →" onClick={()=>setTab("pipeline")} variant="ghost" sm/>
          </div>
          {opportunites.filter(o=>o.proba>=45&&!["gagne","perdu"].includes(o.etape)).sort((a,b)=>b.montant-a.montant).slice(0,4).map((opp,i)=>(
            <div key={opp.id} style={{padding:"12px 20px",borderBottom:i<3?`1px solid ${C.border2}`:"none",background:i%2===0?"white":C.gray9,transition:"background 0.1s",cursor:"pointer"}}
              onMouseEnter={e=>e.currentTarget.style.background=C.blue_bg}
              onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"white":C.gray9}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <span style={{fontSize:13,fontWeight:600,color:C.gray1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1,marginRight:8}}>{opp.titre}</span>
                <Badge s={opp.etape}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12,color:C.gray4}}>{opp.client}</span>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <span style={{fontSize:12,fontWeight:700,color:C.blue}}>{fmtN(opp.montant/1000000)}M FCFA</span>
                  <span style={{fontSize:11,fontWeight:600,color:opp.proba>=70?C.green:C.orange}}>{opp.proba}%</span>
                </div>
              </div>
              {/* Mini barre probabilité */}
              <div style={{height:3,background:C.gray7,borderRadius:2,marginTop:6,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${opp.proba}%`,background:opp.proba>=70?C.green:opp.proba>=40?C.orange:C.red,borderRadius:2}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===== VUE CLIENTS =====
const VueClients = ({clients,onSelect,onAdd}) => {
  const [search,setSearch] = useState("");
  const [filterType,setFilterType] = useState("tous");
  const [filterLead,setFilterLead] = useState("tous");
  const [view,setView] = useState("grid");

  const filtered = clients.filter(c=>{
    const ms = !search||c.nom.toLowerCase().includes(search.toLowerCase())||c.secteur.toLowerCase().includes(search.toLowerCase());
    const mt = filterType==="tous"||c.type===filterType;
    const ml = filterLead==="tous"||c.lead===filterLead;
    return ms&&mt&&ml;
  });

  return (
    <div>
      {/* Toolbar */}
      <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center",flexWrap:"wrap",padding:"12px 16px",background:"white",border:`1px solid ${C.border}`,borderRadius:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:200,background:C.gray8,border:`1px solid ${C.border}`,borderRadius:6,padding:"8px 12px"}}>
          <Ico n="search" s={14} c={C.gray4}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un client..."
            style={{border:"none",outline:"none",fontSize:13,color:C.gray1,background:"transparent",flex:1,fontFamily:"inherit"}}/>
        </div>
        <Select value={filterType} onChange={setFilterType} options={[{v:"tous",l:"Tous types"},{v:"Grands comptes",l:"Grands comptes"},{v:"Comptes intermédiaires",l:"Intermédiaires"},{v:"Secteur public",l:"Secteur public"}]}/>
        <Select value={filterLead} onChange={setFilterLead} options={[{v:"tous",l:"Tous leads"},{v:"chaud",l:"🔥 Chaud"},{v:"tiede",l:"🌡 Tiède"},{v:"froid",l:"❄️ Froid"}]}/>
        <div style={{display:"flex",background:C.gray8,border:`1px solid ${C.border}`,borderRadius:6,padding:2}}>
          {[{v:"grid",i:"kanban"},{v:"list",i:"list"}].map(vt=>(
            <button key={vt.v} onClick={()=>setView(vt.v)} style={{width:32,height:32,borderRadius:4,border:"none",background:view===vt.v?C.blue:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.12s"}}>
              <Ico n={vt.i} s={14} c={view===vt.v?"white":C.gray4}/>
            </button>
          ))}
        </div>
        <Btn label="+ Nouveau client" icon="add" variant="primary" sm onClick={onAdd}/>
      </div>

      <div style={{fontSize:12,color:C.gray4,marginBottom:14}}>{filtered.length} client(s)</div>

      {/* Vue Grille */}
      {view==="grid"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
          {filtered.map((cl,i)=>(
            <div key={cl.id} onClick={()=>onSelect(cl)}
              style={{background:"white",borderRadius:10,border:`1px solid ${C.border}`,overflow:"hidden",cursor:"pointer",transition:"all 0.2s",animation:`fadeUp 0.4s ease both`,animationDelay:`${i*0.04}s`}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.1)";e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.borderColor=C.blue}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none";e.currentTarget.style.borderColor=C.border}}>
              {/* Bande couleur */}
              <div style={{height:5,background:`linear-gradient(90deg,${cl.couleur},${cl.couleur}88)`}}/>
              <div style={{padding:"18px 20px"}}>
                <div style={{display:"flex",gap:14,alignItems:"flex-start",marginBottom:14}}>
                  <ClientLogo client={cl} size={52}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:15,fontWeight:800,color:C.gray1,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cl.nom}</div>
                    <div style={{fontSize:12,color:C.gray4,marginBottom:6}}>{cl.secteur}</div>
                    <div style={{display:"flex",gap:6}}>
                      <Badge s={cl.lead}/>
                      <Badge s={cl.statut}/>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"12px 0",borderTop:`1px solid ${C.border2}`,borderBottom:`1px solid ${C.border2}`,margin:"0 0 12px"}}>
                  {[
                    {l:"CA actuel",v:`${fmtN(cl.ca/1000000)}M FCFA`,c:C.blue},
                    {l:"Potentiel",v:`${fmtN(cl.potentiel/1000000)}M FCFA`,c:C.green},
                  ].map(k=>(
                    <div key={k.l}>
                      <div style={{fontSize:10,color:C.gray4,textTransform:"uppercase",letterSpacing:0.4,marginBottom:3}}>{k.l}</div>
                      <div style={{fontSize:14,fontWeight:700,color:k.c}}>{k.v}</div>
                    </div>
                  ))}
                </div>

                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:C.gray4}}>
                    <Ico n="user" s={11} c={C.gray4}/>
                    {cl.responsable}
                  </div>
                  <div style={{fontSize:11,color:C.gray4}}>
                    Dernier contact: {fmtD(cl.dernierContact)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vue Liste */}
      {view==="list"&&(
        <div style={{background:"white",border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
          <Table
            cols={["Client","Secteur","Type","Lead","CA actuel","Potentiel","Responsable","Dernier contact","Actions"]}
            rows={filtered.map(cl=>[
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <ClientLogo client={cl} size={36}/>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:C.gray1}}>{cl.nom}</div>
                  <div style={{fontSize:11,color:C.gray4}}>{cl.ville}</div>
                </div>
              </div>,
              <span style={{fontSize:12,color:C.gray2}}>{cl.secteur}</span>,
              <span style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:C.blue_bg,color:C.blue,fontWeight:500}}>{cl.type}</span>,
              <Badge s={cl.lead}/>,
              <strong style={{color:C.blue}}>{fmtN(cl.ca/1000000)}M FCFA</strong>,
              <span style={{color:C.green,fontWeight:600}}>{fmtN(cl.potentiel/1000000)}M FCFA</span>,
              <span style={{fontSize:12,color:C.gray3}}>{cl.responsable}</span>,
              <span style={{fontSize:12,color:C.gray4}}>{fmtD(cl.dernierContact)}</span>,
              <div style={{display:"flex",gap:4}}>
                <Btn label="Ouvrir" onClick={()=>onSelect(cl)} variant="outline" sm/>
                <Btn icon="edit" variant="ghost" sm/>
              </div>
            ])}
            onRow={i=>onSelect(filtered[i])}
          />
        </div>
      )}
    </div>
  );
};

// ===== VUE PIPELINE KANBAN =====
const VuePipeline = ({opportunites,setOpportunites,clients,onSelect,onAdd}) => {
  const [dragOpp,setDragOpp] = useState(null);

  const moveOpp = (oppId,newEtape) => {
    setOpportunites(p=>p.map(o=>o.id===oppId?{...o,etape:newEtape}:o));
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{display:"flex",gap:12}}>
          {[
            {l:"Total pipeline",v:fmtN(opportunites.filter(o=>!["gagne","perdu"].includes(o.etape)).reduce((s,o)=>s+o.montant,0)/1000000)+"M FCFA",c:C.blue},
            {l:"Gagné ce mois",v:fmtN(opportunites.filter(o=>o.etape==="gagne").reduce((s,o)=>s+o.montant,0)/1000000)+"M FCFA",c:C.green},
            {l:"Perdu",v:opportunites.filter(o=>o.etape==="perdu").length+" opp.",c:C.red},
          ].map(k=>(
            <div key={k.l} style={{background:"white",border:`1px solid ${C.border}`,borderRadius:6,padding:"8px 14px",display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:12,color:C.gray4}}>{k.l}</span>
              <span style={{fontSize:13,fontWeight:700,color:k.c}}>{k.v}</span>
            </div>
          ))}
        </div>
        <Btn label="+ Nouvelle opportunité" icon="add" variant="primary" sm onClick={onAdd}/>
      </div>

      {/* Kanban */}
      <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:8}}>
        {ETAPES.map(etape=>{
          const opps = opportunites.filter(o=>o.etape===etape.id);
          const montant = opps.reduce((s,o)=>s+o.montant,0);
          return (
            <div key={etape.id} style={{minWidth:240,flex:1}}
              onDragOver={e=>{e.preventDefault();e.currentTarget.style.background=`${etape.color}08`}}
              onDragLeave={e=>e.currentTarget.style.background="transparent"}
              onDrop={e=>{e.preventDefault();e.currentTarget.style.background="transparent";if(dragOpp)moveOpp(dragOpp,etape.id);}}>

              {/* Header colonne */}
              <div style={{background:etape.bg,border:`1px solid ${etape.color}30`,borderRadius:"8px 8px 0 0",padding:"10px 14px",marginBottom:0,borderBottom:"none"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:etape.color}}/>
                    <span style={{fontSize:12,fontWeight:700,color:etape.color,textTransform:"uppercase",letterSpacing:0.4}}>{etape.label}</span>
                    <span style={{width:20,height:20,borderRadius:"50%",background:etape.color,color:"white",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{opps.length}</span>
                  </div>
                </div>
                <div style={{fontSize:12,fontWeight:600,color:etape.color,marginTop:4}}>{fmtN(montant/1000000)}M FCFA</div>
              </div>

              {/* Cards */}
              <div style={{background:"#F8F9FA",border:`1px solid ${etape.color}20`,borderTop:"none",borderRadius:"0 0 8px 8px",padding:8,minHeight:200,display:"flex",flexDirection:"column",gap:8}}>
                {opps.map(opp=>{
                  const cl = clients.find(c=>c.id===opp.clientId);
                  return (
                    <div key={opp.id}
                      draggable
                      onDragStart={()=>setDragOpp(opp.id)}
                      onDragEnd={()=>setDragOpp(null)}
                      onClick={()=>onSelect(opp)}
                      style={{
                        background:"white",borderRadius:8,padding:"12px 14px",
                        border:`1px solid ${C.border}`,
                        cursor:"grab",transition:"all 0.2s",
                        boxShadow:"0 1px 4px rgba(0,0,0,0.06)",
                        animation:"fadeUp 0.3s ease both",
                      }}
                      onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 4px 12px ${etape.color}30`;e.currentTarget.style.borderColor=etape.color;e.currentTarget.style.transform="translateY(-2px)"}}
                      onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.06)";e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="none"}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.gray1,marginBottom:4,lineHeight:1.3}}>{opp.titre}</div>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                        {cl&&<ClientLogo client={cl} size={20}/>}
                        <span style={{fontSize:11,color:C.gray4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{opp.client}</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <span style={{fontSize:13,fontWeight:700,color:C.blue}}>{fmtN(opp.montant/1000000)}M FCFA</span>
                        <span style={{fontSize:11,fontWeight:600,color:opp.proba>=70?C.green:opp.proba>=40?C.orange:C.red}}>{opp.proba}%</span>
                      </div>
                      {/* Barre probabilité */}
                      <div style={{height:4,background:C.gray7,borderRadius:2,overflow:"hidden",marginBottom:8}}>
                        <div style={{height:"100%",width:`${opp.proba}%`,background:opp.proba>=70?C.green:opp.proba>=40?C.orange:C.red,borderRadius:2}}/>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:10,color:C.gray4}}>Clôture: {fmtD(opp.dateClose)}</span>
                        {opp.tags?.slice(0,1).map(t=>(
                          <span key={t} style={{fontSize:10,padding:"2px 6px",borderRadius:10,background:C.blue_bg,color:C.blue,fontWeight:600}}>{t}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {/* Zone drop vide */}
                {opps.length===0&&(
                  <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:C.gray5,fontSize:12,minHeight:100,border:`2px dashed ${C.border}`,borderRadius:8}}>
                    Glisser ici
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ===== VUE ACTIVITÉS =====
const VueActivites = ({activites,clients,onAdd,setActivites}) => {
  const [filter,setFilter] = useState("tous");
  const filtered = activites.filter(a=>filter==="tous"||a.type===filter||a.statut===filter);
  const planifiees = activites.filter(a=>a.statut==="planifie").length;
  const faites = activites.filter(a=>a.statut==="fait").length;

  return (
    <div>
      <div style={{display:"flex",gap:12,marginBottom:20,alignItems:"center",flexWrap:"wrap"}}>
        {[
          {l:"Planifiées",v:planifiees,c:C.blue,s:"planifie"},
          {l:"Réalisées",v:faites,c:C.green,s:"fait"},
          {l:"Total",v:activites.length,c:C.gray2,s:"tous"},
        ].map(k=>(
          <div key={k.l} onClick={()=>setFilter(k.s)} style={{
            background:"white",border:`1px solid ${filter===k.s?k.c:C.border}`,
            borderRadius:8,padding:"10px 18px",cursor:"pointer",
            display:"flex",gap:10,alignItems:"center",
            boxShadow:filter===k.s?`0 0 0 2px ${k.c}30`:"none",
            transition:"all 0.15s",
          }}>
            <span style={{fontSize:20,fontWeight:700,color:k.c}}>{k.v}</span>
            <span style={{fontSize:12,color:C.gray4}}>{k.l}</span>
          </div>
        ))}
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <Select value={filter} onChange={setFilter} options={[{v:"tous",l:"Tous types"},{v:"appel",l:"📞 Appels"},{v:"reunion",l:"🤝 Réunions"},{v:"email",l:"📧 Emails"},{v:"relance",l:"🔔 Relances"}]}/>
          <Btn label="+ Nouvelle activité" icon="add" variant="primary" sm onClick={onAdd}/>
        </div>
      </div>

      <div style={{background:"white",border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
        <Table
          cols={["Type","Activité","Client","Contact","Date & Heure","Responsable","Statut","Actions"]}
          rows={filtered.map(act=>{
            const tc={appel:C.blue,reunion:C.purple,email:C.gold,relance:C.orange,visite:C.teal}[act.type]||C.gray3;
            return [
              <div style={{width:36,height:36,borderRadius:"50%",background:`${tc}15`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Ico n={act.type==="appel"?"phone":act.type==="email"?"mail":act.type==="reunion"?"users":"refresh"} s={16} c={tc}/>
              </div>,
              <div>
                <div style={{fontSize:13,fontWeight:600,color:C.gray1}}>{act.titre}</div>
                {act.notes&&<div style={{fontSize:11,color:C.gray4,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:200}}>{act.notes}</div>}
              </div>,
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                {clients.find(c=>c.id===act.clientId)&&<ClientLogo client={clients.find(c=>c.id===act.clientId)} size={24}/>}
                <span style={{fontSize:12}}>{act.client}</span>
              </div>,
              <span style={{fontSize:12,color:C.gray4}}>{act.contact}</span>,
              <div>
                <div style={{fontSize:12,fontWeight:600,color:C.gray1}}>{fmtD(act.date)}</div>
                {act.heure&&<div style={{fontSize:11,color:C.gray4}}>{act.heure}{act.duree?` · ${act.duree}min`:""}</div>}
              </div>,
              <span style={{fontSize:12,color:C.gray3}}>{act.responsable}</span>,
              <Badge s={act.statut}/>,
              <div style={{display:"flex",gap:4}}>
                {act.statut==="planifie"&&<Btn label="✓ Fait" onClick={()=>setActivites(p=>p.map(a=>a.id===act.id?{...a,statut:"fait"}:a))} variant="success" sm/>}
                <Btn icon="edit" variant="ghost" sm/>
              </div>
            ];
          })}
          empty="Aucune activité"
        />
      </div>
    </div>
  );
};

// ===== NAVIGATION =====
const NAV = [
  {id:"dashboard",   l:"Tableau de bord",   i:"home"},
  {id:"clients",     l:"Clients",            i:"building"},
  {id:"pipeline",    l:"Pipeline",           i:"pipeline"},
  {id:"opportunites",l:"Opportunités",       i:"target"},
  {id:"activites",   l:"Activités",          i:"activity"},
];

// ===== COMPOSANT PRINCIPAL =====
export default function CRM() {
  const [tab,setTab] = useState("dashboard");
  const [clients,setClients] = useState(CLIENTS);
  const [opportunites,setOpportunites] = useState(OPPORTUNITES);
  const [activites,setActivites] = useState(ACTIVITES);
  const [selClient,setSelClient] = useState(null);
  const [selOpp,setSelOpp] = useState(null);
  const [showAddClient,setShowAddClient] = useState(false);
  const [showAddOpp,setShowAddOpp] = useState(false);
  const [showAddAct,setShowAddAct] = useState(false);

  const pendingActs = activites.filter(a=>a.statut==="planifie").length;

  return (
    <div style={{minHeight:"100vh",background:C.gray8,fontFamily:"'Inter','Segoe UI',Arial,sans-serif"}}>

      {/* SHELL */}
      <div style={{background:`linear-gradient(135deg,${C.shell},${C.shell2})`,height:48,display:"flex",alignItems:"center",padding:"0 20px",gap:16,position:"sticky",top:0,zIndex:200,boxShadow:"0 2px 12px rgba(0,0,0,0.25)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginRight:16}}>
          <div style={{width:30,height:30,background:C.blue,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,112,242,0.4)"}}>
            <Ico n="users" s={16} c="white"/>
          </div>
          <div>
            <span style={{fontSize:14,fontWeight:700,color:"white",letterSpacing:0.3}}>CLEAN<span style={{color:"#4da6ff"}}>IT</span></span>
            <span style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginLeft:8}}>CRM</span>
          </div>
        </div>
        <div style={{flex:1}}/>
        {/* Search global */}
        <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:6,padding:"6px 12px",width:220}}>
          <Ico n="search" s={13} c="rgba(255,255,255,0.5)"/>
          <input placeholder="Rechercher client, opportunité..." style={{background:"transparent",border:"none",outline:"none",color:"white",fontSize:12,width:"100%",fontFamily:"inherit"}}/>
        </div>
        {/* Notif */}
        <div style={{position:"relative"}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <Ico n="activity" s={16} c="rgba(255,255,255,0.7)"/>
          </div>
          {pendingActs>0&&<div style={{position:"absolute",top:-2,right:-2,width:17,height:17,borderRadius:"50%",background:C.orange,fontSize:9,fontWeight:700,color:"white",display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #1B3A52"}}>{pendingActs}</div>}
        </div>
        {/* User */}
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"4px 8px",borderRadius:6,cursor:"pointer"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <div style={{width:30,height:30,borderRadius:"50%",background:C.blue,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"white"}}>MK</div>
          <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.85)"}}>Marie Kamga</div>
        </div>
      </div>

      {/* TAB NAV */}
      <div style={{background:"white",borderBottom:`1px solid ${C.border}`,position:"sticky",top:48,zIndex:100,boxShadow:"0 1px 6px rgba(0,0,0,0.06)",display:"flex",alignItems:"center",paddingLeft:20,paddingRight:16}}>
        {NAV.map(t=>{
          const isActive=tab===t.id;
          const hasAlert=t.id==="activites"&&pendingActs>0;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              display:"flex",alignItems:"center",gap:7,
              padding:"12px 18px",border:"none",
              borderBottom:`2.5px solid ${isActive?C.blue:"transparent"}`,
              background:"transparent",
              color:isActive?C.blue:C.gray3,
              fontWeight:isActive?700:400,
              fontSize:13,cursor:"pointer",
              whiteSpace:"nowrap",fontFamily:"inherit",
              transition:"all 0.12s",position:"relative",
              marginBottom:-1,
            }}>
              <Ico n={t.i} s={14} c={isActive?C.blue:C.gray4}/>
              {t.l}
              {hasAlert&&<span style={{position:"absolute",top:8,right:6,width:7,height:7,borderRadius:"50%",background:C.orange,border:"2px solid white"}}/>}
            </button>
          );
        })}
        {/* Actions contextuelles */}
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          {tab==="clients"&&<Btn label="+ Nouveau client" icon="add" variant="primary" sm onClick={()=>setShowAddClient(true)}/>}
          {tab==="pipeline"&&<Btn label="+ Opportunité" icon="add" variant="primary" sm onClick={()=>setShowAddOpp(true)}/>}
          {tab==="opportunites"&&<Btn label="+ Opportunité" icon="add" variant="primary" sm onClick={()=>setShowAddOpp(true)}/>}
          {tab==="activites"&&<Btn label="+ Activité" icon="add" variant="primary" sm onClick={()=>setShowAddAct(true)}/>}
        </div>
      </div>

      {/* CONTENU */}
      <div style={{maxWidth:1440,margin:"0 auto",padding:"20px 24px"}}>
        {tab==="dashboard"&&<DashboardCRM clients={clients} opportunites={opportunites} activites={activites} setTab={setTab}/>}
        {tab==="clients"&&<VueClients clients={clients} onSelect={setSelClient} onAdd={()=>setShowAddClient(true)}/>}
        {tab==="pipeline"&&<VuePipeline opportunites={opportunites} setOpportunites={setOpportunites} clients={clients} onSelect={setSelOpp} onAdd={()=>setShowAddOpp(true)}/>}
        {tab==="opportunites"&&(
          <div style={{background:"white",border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
            <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border2}`,background:C.gray9,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:14,fontWeight:700,color:C.gray1}}>Toutes les opportunités ({opportunites.length})</span>
              <Btn label="+ Nouvelle opportunité" icon="add" variant="primary" sm onClick={()=>setShowAddOpp(true)}/>
            </div>
            <Table
              cols={["Opportunité","Client","Étape","Montant","Probabilité","Clôture prévue","Responsable","Actions"]}
              rows={opportunites.map(opp=>{
                const cl=clients.find(c=>c.id===opp.clientId);
                return [
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:C.gray1}}>{opp.titre}</div>
                    <div style={{fontSize:11,color:C.gray4,marginTop:1}}>{opp.description?.slice(0,50)}...</div>
                  </div>,
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    {cl&&<ClientLogo client={cl} size={24}/>}
                    <span style={{fontSize:12}}>{opp.client}</span>
                  </div>,
                  <Badge s={opp.etape}/>,
                  <strong style={{color:C.blue}}>{fmtN(opp.montant/1000000)}M FCFA</strong>,
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:opp.proba>=70?C.green:opp.proba>=40?C.orange:C.red}}>{opp.proba}%</div>
                    <div style={{height:4,background:C.gray7,borderRadius:2,marginTop:3,width:60,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${opp.proba}%`,background:opp.proba>=70?C.green:opp.proba>=40?C.orange:C.red,borderRadius:2}}/>
                    </div>
                  </div>,
                  <span style={{fontSize:12,color:C.gray4}}>{fmtD(opp.dateClose)}</span>,
                  <span style={{fontSize:12,color:C.gray3}}>{opp.responsable}</span>,
                  <div style={{display:"flex",gap:4}}>
                    <Btn label="Ouvrir" onClick={()=>setSelOpp(opp)} variant="outline" sm/>
                    <Btn icon="edit" variant="ghost" sm/>
                  </div>
                ];
              })}
              onRow={i=>setSelOpp(opportunites[i])}
            />
          </div>
        )}
        {tab==="activites"&&<VueActivites activites={activites} clients={clients} onAdd={()=>setShowAddAct(true)} setActivites={setActivites}/>}
      </div>

      {/* PANELS & MODALS */}
      {selClient&&<FicheClient client={selClient} onClose={()=>setSelClient(null)} opportunites={opportunites} activites={activites}/>}
      {selOpp&&<FicheOpportunite opp={selOpp} onClose={()=>setSelOpp(null)} clients={clients} activites={activites}/>}
      {showAddClient&&<FormClient onClose={()=>setShowAddClient(false)} onSave={c=>{setClients(p=>[c,...p]);}}/>}
      {showAddOpp&&<FormOpportunite onClose={()=>setShowAddOpp(false)} onSave={o=>{setOpportunites(p=>[o,...p]);}} clients={clients}/>}
      {showAddAct&&<FormActivite onClose={()=>setShowAddAct(false)} onSave={a=>{setActivites(p=>[a,...p]);}} clients={clients}/>}
    </div>
  );
}
