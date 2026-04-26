import { useState, useEffect, useRef, useCallback } from "react";
import "../components/RHDesign.css";

// ===== CONSTANTES =====
const fmtN = n => new Intl.NumberFormat("fr-FR").format(Math.round(n||0));
const fmtD = d => d ? new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"}) : "—";
const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const MOIS_S = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

const DEPT_CLASSES = {
  "Gestion de Projets":    "dept-projet",
  "Technique & Ingénierie":"dept-technique",
  "Finance & Comptabilité":"dept-finance",
  "Ressources Humaines":   "dept-rh",
  "Commercial & Business": "dept-commercial",
  "Direction Générale":    "dept-direction",
  "Logistique & Opérations":"dept-logistique",
  "Juridique & Conformité":"dept-juridique",
};

const AVATAR_PALETTE = [
  {bg:"#DFE9FF",c:"#0057B8"},{bg:"#FFDEFF",c:"#6B00A4"},
  {bg:"#DAFBE1",c:"#107E3E"},{bg:"#FEF3E6",c:"#AD4E00"},
  {bg:"#FFE9E9",c:"#BB0000"},{bg:"#E0F5FF",c:"#0070F2"},
  {bg:"#FFF8D6",c:"#6B5100"},{bg:"#F0EEFF",c:"#5B4AF7"},
];
const getAC = name => AVATAR_PALETTE[(name||"").charCodeAt(0)%AVATAR_PALETTE.length];
const getInit = (f="",l="") => `${f[0]||""}${l[0]||""}`.toUpperCase();

// ===== ICÔNES SVG =====
const Ico = ({n,s=16,c="currentColor",cls=""}) => {
  const d = {
    home:   "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
    group:  "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
    person: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
    cal:    "M8 2v4 M16 2v4 M3 10h18 M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z",
    clock:  "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 6v6l4 2",
    doc:    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
    pay:    "M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
    chart:  "M18 20V10 M12 20V4 M6 20v-6",
    add:    "M12 5v14 M5 12h14",
    close:  "M18 6L6 18 M6 6l12 12",
    srch:   "M21 21l-4.35-4.35 M17 11A6 6 0 115 11a6 6 0 0112 0z",
    chk:    "M20 6L9 17l-5-5",
    edit:   "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
    eye:    "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12m-3 0a3 3 0 106 0 3 3 0 00-6 0",
    dl:     "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
    ul:     "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
    mail:   "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
    phone:  "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.63 19.79 19.79 0 01.06 4 2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.91a16 16 0 006.12 6.12l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
    loc:    "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10m-3 0a3 3 0 106 0 3 3 0 00-6 0",
    bldg:   "M3 21h18 M3 7v14 M21 7v14 M9 21V7 M15 21V7 M3 7l9-4 9 4",
    alert:  "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
    print:  "M6 9V2h12v7 M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2 M6 14h12v8H6z",
    star:   "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    grid:   "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
    list:   "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01",
    link:   "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
    bell:   "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
    hist:   "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    set:    "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    brief:  "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2",
  };
  const path = d[n]; if(!path) return null;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c}
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      className={cls} style={{flexShrink:0,display:"block"}}>
      {path.split(" M ").map((seg,i)=><path key={i} d={i===0?seg:`M ${seg}`}/>)}
    </svg>
  );
};

// ===== AVATAR =====
const Av = ({first="",last="",size=40,status,onClick}) => {
  const ac = getAC(first+last);
  const statusClass = {actif:"active",conge:"leave",inactif:"",absent:"absent"}[status]||"";
  return (
    <div className="rh-avatar" onClick={onClick}
      style={{width:size,height:size,background:ac.bg,color:ac.c,fontSize:size*0.32,position:"relative"}}>
      {getInit(first,last)}
      {statusClass && <div className={`rh-status-dot ${statusClass}`}/>}
    </div>
  );
};

// ===== BADGE STATUT =====
const BadgeCfg = {
  actif:     {cls:"active",  l:"Actif"},
  inactif:   {cls:"neutral", l:"Inactif"},
  conge:     {cls:"leave",   l:"En congé"},
  suspendu:  {cls:"absent",  l:"Suspendu"},
  paye:      {cls:"paid",    l:"Payé"},
  en_attente:{cls:"pending", l:"En attente"},
  valide:    {cls:"info",    l:"Validé"},
  brouillon: {cls:"neutral", l:"Brouillon"},
  present:   {cls:"paid",    l:"Présent"},
  absent:    {cls:"absent",  l:"Absent"},
  retard:    {cls:"pending", l:"Retard"},
  approuve:  {cls:"paid",    l:"Approuvé"},
  refuse:    {cls:"absent",  l:"Refusé"},
  cdi:       {cls:"paid",    l:"CDI"},
  cdd:       {cls:"info",    l:"CDD"},
  freelance: {cls:"pending", l:"Freelance"},
};
const Badge = ({s,label}) => {
  const cfg = BadgeCfg[s]||{cls:"neutral",l:label||s};
  return <span className={`rh-badge ${cfg.cls}`}><span className="dot"/>{cfg.l}</span>;
};

// ===== BOUTONS =====
const Btn = ({label,onClick,variant="ghost",sm,icon,full,disabled,tooltip}) => (
  <button onClick={onClick} disabled={disabled} title={tooltip}
    className={`rh-btn rh-btn-${variant}${sm?" rh-btn-sm":""}${full?" w-full":""}`}
    style={{width:full?"100%":"auto",opacity:disabled?0.5:1,cursor:disabled?"not-allowed":"pointer"}}>
    {icon&&<Ico n={icon} s={sm?13:15} c="currentColor"/>}
    {label}
  </button>
);

// ===== INPUTS =====
const Inp = ({type="text",value,onChange,placeholder,disabled,compact}) => (
  <input type={type} value={value} onChange={e=>onChange(e.target.value)}
    placeholder={placeholder||""} disabled={disabled}
    className="rh-input" style={{padding:compact?"6px 10px":undefined}}/>
);
const Sel = ({value,onChange,options,placeholder,disabled}) => (
  <select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled} className="rh-select">
    <option value="">{placeholder||"Sélectionner..."}</option>
    {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
  </select>
);
const Fld = ({label,required,children,colSpan}) => (
  <div style={{gridColumn:colSpan?"1/-1":"auto"}}>
    <label className="rh-label">{label}{required&&<span style={{color:"#BB0000",marginLeft:2}}>*</span>}</label>
    {children}
  </div>
);

// ===== ANIMATED COUNTER =====
const Counter = ({value,duration=1000,prefix="",suffix=""}) => {
  const [display,setDisplay] = useState(0);
  const target = typeof value === "number" ? value : 0;
  useEffect(() => {
    if(target===0){setDisplay(0);return;}
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now()-start;
      const progress = Math.min(elapsed/duration,1);
      const eased = 1-Math.pow(1-progress,3);
      setDisplay(Math.round(eased*target));
      if(progress<1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },[target,duration]);
  return <span className="rh-counter">{prefix}{typeof value==="number"?fmtN(display):value}{suffix}</span>;
};

// ===== KPI CARD =====
const KpiCard = ({title,value,subtitle,color="#0070F2",icon,trend,onClick,delay=0}) => (
  <div className="rh-kpi-card rh-grid-item" onClick={onClick}
    style={{"--kpi-color":color,cursor:onClick?"pointer":"default",animationDelay:`${delay}s`}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"12px"}}>
      <div style={{fontSize:"11px",fontWeight:600,color:"#89898B",textTransform:"uppercase",letterSpacing:"0.4px",lineHeight:1.4}}>{title}</div>
      {icon&&(
        <div className="rh-kpi-icon" style={{width:"34px",height:"34px",borderRadius:"8px",background:`${color}18`,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Ico n={icon} s={17} c={color}/>
        </div>
      )}
    </div>
    <div className="rh-kpi-value" style={{fontSize:typeof value==="string"&&value.length>12?"16px":"28px",fontWeight:700,color,marginBottom:"4px",letterSpacing:"-0.3px"}}>
      {typeof value === "number" ? <Counter value={value} duration={1200}/> : value}
    </div>
    {subtitle&&<div style={{fontSize:"12px",color:"#89898B"}}>{subtitle}</div>}
    {trend!==undefined&&(
      <div style={{marginTop:"8px",fontSize:"11px",fontWeight:600,color:trend>=0?"#107E3E":"#BB0000",display:"flex",alignItems:"center",gap:"3px"}}>
        <span style={{fontSize:"13px"}}>{trend>=0?"↑":"↓"}</span> {Math.abs(trend)}% vs mois dernier
      </div>
    )}
  </div>
);

// ===== PROGRESS BAR ANIMÉE =====
const Progress = ({value,max=100,color="#0070F2",label,showPct,delay=0}) => {
  const pct = max>0?Math.round((value/max)*100):0;
  return (
    <div>
      {(label||showPct)&&(
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"5px",fontSize:"12px",color:"#6A6D70"}}>
          {label&&<span>{label}</span>}
          {showPct&&<span style={{fontWeight:600,color}}>{pct}%</span>}
        </div>
      )}
      <div className="rh-progress">
        <div className="rh-progress-fill" style={{width:`${pct}%`,background:color,animationDelay:`${delay}s`}}/>
      </div>
    </div>
  );
};

// ===== TABLE =====
const Table = ({cols,rows,onRow,empty="Aucune donnée"}) => (
  <div style={{overflowX:"auto"}}>
    <table className="rh-table">
      <thead><tr>{cols.map(c=><th key={c}>{c}</th>)}</tr></thead>
      <tbody>
        {rows.length===0&&<tr><td colSpan={cols.length} style={{padding:"48px",textAlign:"center",color:"#89898B"}}>{empty}</td></tr>}
        {rows.map((row,i)=>(
          <tr key={i} onClick={()=>onRow&&onRow(i)}>
            {row.map((cell,j)=><td key={j}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ===== SECTION HEADER =====
const Sec = ({title,action,actionLabel,icon}) => (
  <div className="rh-section-title" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
    <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
      {icon&&<Ico n={icon} s={14} c="#0070F2"/>}
      {title}
    </div>
    {action&&<button onClick={action} style={{fontSize:"12px",color:"#0070F2",background:"none",border:"none",cursor:"pointer",fontWeight:500}}>{actionLabel}</button>}
  </div>
);

// ===== TOAST =====
const Toast = ({msg,type="success",onDone}) => {
  useEffect(()=>{const t=setTimeout(onDone,3000);return()=>clearTimeout(t);},[]);
  const icons = {success:"chk",error:"close",warning:"alert"};
  return (
    <div className={`rh-toast ${type}`}>
      <Ico n={icons[type]||"chk"} s={16} c="white"/>
      {msg}
    </div>
  );
};

// ===== DONNÉES =====
const DEPTS = ["Direction Générale","Technique & Ingénierie","Finance & Comptabilité","Ressources Humaines","Commercial & Business","Juridique & Conformité","Logistique & Opérations","Gestion de Projets"];
const POSTES = ["Directeur Général","Directeur Technique","Chef de Projet Senior","Chef de Projet","Ingénieur Télécom Senior","Ingénieur Télécom","Comptable Senior","Comptable","RH Manager","Commercial Senior","Juriste","Logisticien","Assistante de Direction","Technicien Senior"];
const POSTES_EXT = ["Technicien Installation 5G","Technicien Installation 4G","Technicien Maintenance","Ingénieur RF Senior","Ingénieur RF","Chef équipe terrain","Câbleur fibre optique","Électricien télécom"];
const BANQUES = ["BICEC","Société Générale Cameroun","Afriland First Bank","UBA Cameroun","Ecobank","MTN Mobile Money","Orange Money"];
const CONTRATS = ["CDI","CDD","Stage","Freelance"];
const VILLES = ["Douala","Yaoundé","Bafoussam","Garoua","Bamenda","Kribi","Limbé","Buea"];

// Photo placeholder URLs (Unsplash avatars)
const PHOTOS = {
  "EI001":"https://i.pravatar.cc/150?img=5",
  "EI002":"https://i.pravatar.cc/150?img=11",
  "EI003":"https://i.pravatar.cc/150?img=9",
  "EI004":"https://i.pravatar.cc/150?img=12",
  "EI005":"https://i.pravatar.cc/150?img=8",
  "EI006":"https://i.pravatar.cc/150?img=20",
  "EE001":"https://i.pravatar.cc/150?img=15",
  "EE002":"https://i.pravatar.cc/150?img=17",
  "EE003":"https://i.pravatar.cc/150?img=22",
  "EE004":"https://i.pravatar.cc/150?img=3",
  "EE005":"https://i.pravatar.cc/150?img=25",
};

const EMPLOYES = [
  {id:"EI001",first:"Marie",last:"Kamga",email:"marie.kamga@cleanit.cm",phone:"+237 677 001 001",role:"Chef de Projet Senior",department:"Gestion de Projets",hireDate:"2021-03-15",birthDate:"1988-07-22",birthPlace:"Douala",nationality:"Camerounaise",cin:"12345678",salary:650000,contract:"CDI",status:"actif",gender:"F",city:"Douala",address:"Akwa, Rue des Palmiers",bank:"BICEC",rib:"CM21 1001 1234 5678",matricule:"CLN-INT-001",education:"Master/Ingénieur",emergencyName:"Paul Kamga",emergencyPhone:"+237 699 001 001",emergencyLink:"Époux",docs:[{name:"Contrat CDI",type:"Contrat",date:"2021-03-15"},{name:"Pièce identité",type:"CIN",date:"2021-03-15"},{name:"Diplôme Master",type:"Diplôme",date:"2021-03-10"}],history:[{type:"Promotion",date:"01/01/2023",detail:"Chef de Projet → Chef de Projet Senior",by:"DG Jérôme Bell"},{type:"Embauche",date:"15/03/2021",detail:"Recrutement CDI - Chef de Projet",by:"RH Aline Biya"}]},
  {id:"EI002",first:"Pierre",last:"Etoga",email:"pierre.etoga@cleanit.cm",phone:"+237 677 002 002",role:"Ingénieur Télécom Senior",department:"Technique & Ingénierie",hireDate:"2020-06-01",birthDate:"1985-11-30",birthPlace:"Yaoundé",nationality:"Camerounaise",cin:"87654321",salary:580000,contract:"CDI",status:"actif",gender:"M",city:"Douala",address:"Bonanjo, Avenue de Gaulle",bank:"SGC",rib:"CM21 2001 9876 5432",matricule:"CLN-INT-002",education:"Master/Ingénieur",emergencyName:"Claire Etoga",emergencyPhone:"+237 699 002 002",emergencyLink:"Épouse",docs:[{name:"Contrat CDI",type:"Contrat",date:"2020-06-01"}],history:[{type:"Augmentation",date:"01/06/2022",detail:"Révision salariale +8%",by:"DG"},{type:"Embauche",date:"01/06/2020",detail:"Recrutement CDI",by:"RH"}]},
  {id:"EI003",first:"Aline",last:"Biya",email:"aline.biya@cleanit.cm",phone:"+237 677 003 003",role:"RH Manager",department:"Ressources Humaines",hireDate:"2022-01-10",birthDate:"1990-04-15",birthPlace:"Bafoussam",nationality:"Camerounaise",cin:"11223344",salary:480000,contract:"CDI",status:"actif",gender:"F",city:"Douala",address:"Bonapriso",bank:"Afriland",rib:"CM21 3001 1111 2222",matricule:"CLN-INT-003",education:"Master/Ingénieur",emergencyName:"Jean Biya",emergencyPhone:"+237 699 003 003",emergencyLink:"Frère",docs:[{name:"Contrat CDI",type:"Contrat",date:"2022-01-10"}],history:[{type:"Embauche",date:"10/01/2022",detail:"Recrutement CDI",by:"DG"}]},
  {id:"EI004",first:"David",last:"Mballa",email:"david.mballa@cleanit.cm",phone:"+237 677 004 004",role:"Comptable Senior",department:"Finance & Comptabilité",hireDate:"2021-09-01",birthDate:"1987-02-18",birthPlace:"Douala",nationality:"Camerounaise",cin:"44332211",salary:420000,contract:"CDI",status:"actif",gender:"M",city:"Douala",address:"Deido",bank:"BICEC",rib:"CM21 1001 4444 5555",matricule:"CLN-INT-004",education:"Licence",emergencyName:"Rose Mballa",emergencyPhone:"+237 699 004 004",emergencyLink:"Épouse",docs:[{name:"Contrat CDI",type:"Contrat",date:"2021-09-01"}],history:[{type:"Embauche",date:"01/09/2021",detail:"Recrutement CDI",by:"RH"}]},
  {id:"EI005",first:"Jean",last:"Fouda",email:"jean.fouda@cleanit.cm",phone:"+237 677 005 005",role:"Commercial Senior",department:"Commercial & Business",hireDate:"2023-02-15",birthDate:"1992-09-05",birthPlace:"Yaoundé",nationality:"Camerounaise",cin:"55667788",salary:380000,contract:"CDI",status:"conge",gender:"M",city:"Yaoundé",address:"Bastos",bank:"MTN Mobile Money",rib:"677005005",matricule:"CLN-INT-005",education:"Master/Ingénieur",emergencyName:"Alice Fouda",emergencyPhone:"+237 699 005 005",emergencyLink:"Soeur",docs:[],history:[{type:"Embauche",date:"15/02/2023",detail:"Recrutement CDI",by:"RH"}]},
  {id:"EI006",first:"Sandra",last:"Nguele",email:"sandra.nguele@cleanit.cm",phone:"+237 677 006 006",role:"Assistante de Direction",department:"Direction Générale",hireDate:"2020-11-01",birthDate:"1994-12-20",birthPlace:"Kribi",nationality:"Camerounaise",cin:"99887766",salary:320000,contract:"CDI",status:"actif",gender:"F",city:"Douala",address:"Akwa Nord",bank:"Orange Money",rib:"698006006",matricule:"CLN-INT-006",education:"BTS/DUT",emergencyName:"Marc Nguele",emergencyPhone:"+237 699 006 006",emergencyLink:"Père",docs:[{name:"Contrat CDI",type:"Contrat",date:"2020-11-01"}],history:[{type:"Embauche",date:"01/11/2020",detail:"Recrutement CDI",by:"RH"}]},
];

const EXTERNES = [
  {id:"EE001",first:"Thomas",last:"Ngono",phone:"+237 677 100 001",role:"Technicien Installation 5G",speciality:"5G NR / 4G LTE",status:"actif",matricule:"CLN-EXT-001",bank:"MTN Mobile Money",rib:"677100001",city:"Douala",cin:"EXT001",birthDate:"1990-05-12",projects:["PROJ-2024-001"],totalEarned:13500000,dailyRate:85000,contract:"Freelance",rating:4.8,projectCount:7},
  {id:"EE002",first:"Jean",last:"Mbarga",phone:"+237 677 100 002",role:"Ingénieur RF Senior",speciality:"Survey & Optimisation RF",status:"actif",matricule:"CLN-EXT-002",bank:"Orange Money",rib:"698100002",city:"Yaoundé",cin:"EXT002",birthDate:"1985-09-22",projects:["PROJ-2024-002"],totalEarned:8500000,dailyRate:120000,contract:"Freelance",rating:4.9,projectCount:12},
  {id:"EE003",first:"Samuel",last:"Djomo",phone:"+237 677 100 003",role:"Technicien Maintenance",speciality:"3G UMTS / 4G LTE",status:"actif",matricule:"CLN-EXT-003",bank:"BICEC",rib:"CM21 1001 8888",city:"Douala",cin:"EXT003",birthDate:"1992-03-18",projects:["PROJ-2024-004"],totalEarned:6200000,dailyRate:70000,contract:"Freelance",rating:4.5,projectCount:5},
  {id:"EE004",first:"Ali",last:"Moussa",phone:"+237 677 100 004",role:"Chef équipe terrain",speciality:"Supervision & HSE",status:"actif",matricule:"CLN-EXT-004",bank:"MTN Mobile Money",rib:"677100004",city:"Garoua",cin:"EXT004",birthDate:"1983-11-30",projects:["PROJ-2024-003"],totalEarned:4800000,dailyRate:95000,contract:"Freelance",rating:4.7,projectCount:9},
  {id:"EE005",first:"René",last:"Talla",phone:"+237 677 100 005",role:"Câbleur fibre optique",speciality:"Fibre optique FTTH",status:"actif",matricule:"CLN-EXT-005",bank:"Orange Money",rib:"698100005",city:"Bafoussam",cin:"EXT005",birthDate:"1995-07-08",projects:[],totalEarned:2100000,dailyRate:55000,contract:"Freelance",rating:4.2,projectCount:3},
];

const BULLETINS = [
  {id:"B001",empId:"EI001",month:2,year:2024,base:650000,bonus:75000,benefits:50000,deductions:0,gross:775000,net:775000,status:"paye",paidOn:"2024-02-28",payMethod:"Virement BICEC"},
  {id:"B002",empId:"EI002",month:2,year:2024,base:580000,bonus:40000,benefits:30000,deductions:0,gross:650000,net:650000,status:"paye",paidOn:"2024-02-28",payMethod:"Virement SGC"},
  {id:"B003",empId:"EI003",month:2,year:2024,base:480000,bonus:0,benefits:25000,deductions:0,gross:505000,net:505000,status:"paye",paidOn:"2024-02-28",payMethod:"Virement Afriland"},
  {id:"B004",empId:"EI001",month:3,year:2024,base:650000,bonus:75000,benefits:50000,deductions:0,gross:775000,net:775000,status:"en_attente",paidOn:null,payMethod:"Virement BICEC"},
  {id:"B005",empId:"EI002",month:3,year:2024,base:580000,bonus:40000,benefits:30000,deductions:0,gross:650000,net:650000,status:"en_attente",paidOn:null,payMethod:"Virement SGC"},
  {id:"B006",empId:"EI003",month:3,year:2024,base:480000,bonus:0,benefits:25000,deductions:0,gross:505000,net:505000,status:"en_attente",paidOn:null,payMethod:"Virement Afriland"},
  {id:"B007",empId:"EI004",month:3,year:2024,base:420000,bonus:20000,benefits:20000,deductions:0,gross:460000,net:460000,status:"en_attente",paidOn:null,payMethod:"Virement BICEC"},
  {id:"B008",empId:"EI006",month:3,year:2024,base:320000,bonus:0,benefits:15000,deductions:0,gross:335000,net:335000,status:"en_attente",paidOn:null,payMethod:"Orange Money"},
];
const POINTAGES = [
  {id:"P001",empId:"EI001",arrival:"08:02",departure:"17:45",hours:8.72,status:"present",note:""},
  {id:"P002",empId:"EI002",arrival:"07:55",departure:"18:10",hours:9.25,status:"present",note:""},
  {id:"P003",empId:"EI003",arrival:"09:15",departure:"17:30",hours:7.25,status:"retard",note:"Retard 1h15"},
  {id:"P004",empId:"EI004",arrival:"08:00",departure:"17:00",hours:8,status:"present",note:""},
  {id:"P005",empId:"EI005",arrival:"",departure:"",hours:0,status:"absent",note:"Congé annuel"},
  {id:"P006",empId:"EI006",arrival:"08:30",departure:"17:30",hours:8,status:"present",note:""},
];
const CONGES = [
  {id:"C001",empId:"EI005",empName:"Jean Fouda",type:"Congé annuel",start:"2024-03-01",end:"2024-03-20",days:20,status:"approuve",reason:"Congé annuel Q1",substitute:"Pierre Etoga",approvedBy:"Aline Biya"},
  {id:"C002",empId:"EI003",empName:"Aline Biya",type:"Congé maladie",start:"2024-03-10",end:"2024-03-12",days:3,status:"approuve",reason:"Ordonnance médicale",substitute:"Sandra Nguele",approvedBy:"Marie Kamga"},
  {id:"C003",empId:"EI001",empName:"Marie Kamga",type:"Congé exceptionnel",start:"2024-04-05",end:"2024-04-06",days:2,status:"en_attente",reason:"Mariage",substitute:"",approvedBy:""},
];
const PAI_EXT = [
  {id:"PE001",empId:"EE001",project:"PROJ-2024-001",client:"MTN Cameroun",phase:"Phase 1 (30%)",projectAmount:45000000,pct:30,net:13500000,status:"paye",paidOn:"2024-01-20",payMethod:"MTN Mobile Money",ref:"PAY-EXT-001"},
  {id:"PE002",empId:"EE002",project:"PROJ-2024-002",client:"Orange Cameroun",phase:"Paiement unique",projectAmount:12000000,pct:100,net:8500000,status:"paye",paidOn:"2024-02-15",payMethod:"Orange Money",ref:"PAY-EXT-002"},
  {id:"PE003",empId:"EE001",project:"PROJ-2024-001",client:"MTN Cameroun",phase:"Phase 2 (40%)",projectAmount:45000000,pct:40,net:18000000,status:"en_attente",paidOn:null,payMethod:"MTN Mobile Money",ref:null},
  {id:"PE004",empId:"EE003",project:"PROJ-2024-004",client:"MTN Cameroun",phase:"Phase 1 (25%)",projectAmount:18500000,pct:25,net:4625000,status:"en_attente",paidOn:null,payMethod:"Virement BICEC",ref:null},
];

// ===== PROFIL EMPLOYÉ — COMPLET AVEC PHOTOS =====
const EmployeeProfile = ({employee,isExt,bulletins,onClose,onToast}) => {
  const [tab,setTab] = useState("info");
  const [photoError,setPhotoError] = useState(false);
  const ac = getAC(employee.first+employee.last);
  const photo = PHOTOS[employee.id];
  const seniority = employee.hireDate ? Math.floor((Date.now()-new Date(employee.hireDate))/(365.25*24*3600*1000)) : 0;
  const empBulletins = bulletins.filter(b=>b.empId===employee.id);
  const deptClass = DEPT_CLASSES[employee.department]||"dept-default";

  const TABS = isExt
    ? [{id:"info",l:"Informations"},{id:"projects",l:"Projets & Paiements"},{id:"perf",l:"Performance"}]
    : [{id:"info",l:"Informations personnelles"},{id:"job",l:"Emploi & Contrat"},{id:"payroll",l:"Paie & Rémunération"},{id:"docs",l:"Documents RH"},{id:"history",l:"Historique"}];

  return (
    <div>
      <div className="rh-overlay" onClick={onClose}/>
      <div className="rh-panel rh-scroll" style={{width:"920px",maxWidth:"96vw"}}>

        {/* HEADER PROFIL — Photo + gradient */}
        <div className="rh-profile-header" style={{position:"relative"}}>
          {/* Background photo blur */}
          {photo&&!photoError&&(
            <div style={{position:"absolute",inset:0,overflow:"hidden",borderRadius:0}}>
              <img src={photo} onError={()=>setPhotoError(true)}
                style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.12,filter:"blur(20px) saturate(0.5)",transform:"scale(1.1)"}} alt=""/>
            </div>
          )}

          <div style={{position:"relative",display:"flex",gap:"22px",alignItems:"flex-end",paddingTop:"28px"}}>
            {/* Photo / Avatar large */}
            <div className="rh-profile-avatar" style={{background:ac.bg,color:ac.c}}>
              {photo&&!photoError
                ? <img src={photo} onError={()=>setPhotoError(true)} alt={`${employee.first} ${employee.last}`} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : getInit(employee.first,employee.last)
              }
              <div className="rh-profile-avatar-overlay">
                <Ico n="ul" s={22} c="white"/>
              </div>
            </div>

            {/* Infos */}
            <div style={{flex:1,paddingBottom:"16px"}}>
              <div style={{fontSize:"23px",fontWeight:800,color:"white",marginBottom:"4px",letterSpacing:"-0.3px",animation:"headerReveal 0.4s ease both",animationDelay:"0.15s"}}>{employee.first} {employee.last}</div>
              <div style={{fontSize:"14px",color:"rgba(255,255,255,0.75)",marginBottom:"10px",animation:"headerReveal 0.4s ease both",animationDelay:"0.2s"}}>{employee.role}{employee.department?` · ${employee.department}`:""}</div>
              <div style={{display:"flex",gap:"18px",flexWrap:"wrap",animation:"headerReveal 0.4s ease both",animationDelay:"0.25s"}}>
                {[{i:"loc",v:employee.city},{i:"mail",v:employee.email||employee.phone},{i:"brief",v:employee.contract||(isExt?"Freelance":"")}].filter(x=>x.v).map(item=>(
                  <div key={item.i} style={{display:"flex",alignItems:"center",gap:"5px",fontSize:"12px",color:"rgba(255,255,255,0.65)"}}>
                    <Ico n={item.i} s={12} c="rgba(255,255,255,0.55)"/>
                    {item.v}
                  </div>
                ))}
              </div>
            </div>

            {/* Status + info */}
            <div style={{paddingBottom:"16px",display:"flex",flexDirection:"column",gap:"8px",alignItems:"flex-end"}}>
              <Badge s={employee.status}/>
              <div style={{fontSize:"11px",color:"rgba(255,255,255,0.5)",fontFamily:"monospace"}}>{employee.matricule}</div>
              {!isExt&&<div style={{fontSize:"11px",color:"rgba(255,255,255,0.55)"}}>{employee.contract} · {seniority} an{seniority>1?"s":""}</div>}
              {isExt&&(
                <div style={{display:"flex",gap:"3px"}}>
                  {[1,2,3,4,5].map(s=>(
                    <svg key={s} width="15" height="15" viewBox="0 0 24 24"
                      fill={s<=Math.round(employee.rating)?"#F0AB00":"rgba(255,255,255,0.2)"} stroke="none">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                  ))}
                  <span style={{fontSize:"12px",color:"rgba(255,255,255,0.7)",marginLeft:"4px"}}>{employee.rating}/5</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",gap:0,marginTop:"20px",borderTop:"1px solid rgba(255,255,255,0.12)",paddingTop:"4px"}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                padding:"10px 18px",border:"none",
                borderBottom:`2px solid ${tab===t.id?"white":"transparent"}`,
                background:"transparent",
                color:tab===t.id?"white":"rgba(255,255,255,0.5)",
                fontWeight:tab===t.id?700:400,
                fontSize:"13px",cursor:"pointer",
                whiteSpace:"nowrap",fontFamily:"inherit",
                transition:"all 0.15s",
              }}>
                {t.l}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu */}
        <div style={{flex:1,overflow:"auto",padding:"28px 32px"}} className="rh-scroll">

          {/* Infos personnelles */}
          {tab==="info"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"24px",animation:"fadeUp 0.3s ease both"}}>
              <div>
                <Sec title="Informations personnelles" icon="person"/>
                {[["Prénom",employee.first],["Nom de famille",employee.last],["Genre",employee.gender==="M"?"Masculin":"Féminin"],["Date de naissance",fmtD(employee.birthDate)],["Lieu de naissance",employee.birthPlace],["Nationalité",employee.nationality],["N° CIN / Passeport",employee.cin],["Niveau études",employee.education]].map(([l,v],i)=>(
                  <div key={l} className="rh-info-row">
                    <span className="rh-info-label">{l}</span>
                    <span className="rh-info-value" style={{fontFamily:l==="N° CIN / Passeport"?"monospace":"inherit"}}>{v||"—"}</span>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
                <div>
                  <Sec title="Coordonnées" icon="phone"/>
                  {[["Téléphone",employee.phone],["Email",employee.email],["Ville",employee.city],["Adresse",employee.address]].map(([l,v])=>(
                    <div key={l} className="rh-info-row">
                      <span className="rh-info-label">{l}</span>
                      <span className="rh-info-value">{v||"—"}</span>
                    </div>
                  ))}
                </div>
                {employee.emergencyName&&(
                  <div>
                    <Sec title="Contact urgence" icon="alert"/>
                    {[["Nom",employee.emergencyName],["Téléphone",employee.emergencyPhone],["Lien",employee.emergencyLink]].map(([l,v])=>(
                      <div key={l} className="rh-info-row">
                        <span className="rh-info-label">{l}</span>
                        <span className="rh-info-value">{v||"—"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Emploi */}
          {tab==="job"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"24px",animation:"fadeUp 0.3s ease both"}}>
              <div>
                <Sec title="Poste & Organisation" icon="brief"/>
                {[["Matricule",employee.matricule,true],["Poste actuel",employee.role],["Département",employee.department],["Type de contrat",employee.contract],["Date embauche",fmtD(employee.hireDate)],["Ancienneté",`${seniority} an${seniority>1?"s":""}`]].map(([l,v,mono])=>(
                  <div key={l} className="rh-info-row">
                    <span className="rh-info-label">{l}</span>
                    <span className="rh-info-value" style={{fontFamily:mono?"monospace":"inherit"}}>{v||"—"}</span>
                  </div>
                ))}
              </div>
              <div>
                <Sec title="Coordonnées bancaires" icon="shield"/>
                {[["Banque",employee.bank],["RIB / Numéro",employee.rib]].map(([l,v])=>(
                  <div key={l} className="rh-info-row">
                    <span className="rh-info-label">{l}</span>
                    <span className="rh-info-value" style={{fontFamily:"monospace"}}>{v||"—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paie */}
          {tab==="payroll"&&(
            <div style={{animation:"fadeUp 0.3s ease both"}}>
              <div className="rh-alert info" style={{marginBottom:"16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"8px",color:"#0057B8",fontSize:"13px"}}>
                  <Ico n="alert" s={15} c="#0070F2"/>
                  Les informations de rémunération sont confidentielles — Accès restreint
                </div>
              </div>
              {/* Salaire card */}
              <div style={{background:"linear-gradient(135deg,#1B3A52,#0D2B40)",borderRadius:"10px",padding:"22px 26px",marginBottom:"24px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.2)"}}>
                <div>
                  <div style={{fontSize:"11px",color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"6px"}}>Salaire de base mensuel</div>
                  <div style={{fontSize:"34px",fontWeight:800,color:"white",letterSpacing:"-0.5px"}}>{fmtN(employee.salary)} <span style={{fontSize:"16px",fontWeight:400,opacity:0.6}}>FCFA</span></div>
                  <div style={{fontSize:"12px",color:"rgba(255,255,255,0.5)",marginTop:"4px"}}>{employee.contract} · Versement mensuel</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:"11px",color:"rgba(255,255,255,0.5)",marginBottom:"4px"}}>Banque de versement</div>
                  <div style={{fontSize:"14px",fontWeight:600,color:"rgba(255,255,255,0.85)"}}>{employee.bank}</div>
                  <div style={{fontSize:"11px",color:"rgba(255,255,255,0.4)",fontFamily:"monospace",marginTop:"2px"}}>{employee.rib}</div>
                </div>
              </div>
              <Sec title="Bulletins de paie" icon="doc"/>
              {empBulletins.length===0
                ? <div style={{padding:"32px",textAlign:"center",color:"#89898B",background:"#FAFAFA",borderRadius:"8px",border:"1px dashed #D9D9D9"}}>Aucun bulletin généré</div>
                : <div className="rh-card">
                    <Table
                      cols={["Période","Brut","Net à payer","Mode","Date","Statut",""]}
                      rows={empBulletins.map(b=>[
                        <strong>{MOIS_S[b.month-1]} {b.year}</strong>,
                        <span>{fmtN(b.gross)} FCFA</span>,
                        <strong style={{color:"#0070F2",fontSize:"14px"}}>{fmtN(b.net)} FCFA</strong>,
                        <span style={{fontSize:"12px",color:"#89898B"}}>{b.payMethod}</span>,
                        <span style={{fontSize:"12px",color:"#89898B"}}>{b.paidOn?fmtD(b.paidOn):"—"}</span>,
                        <Badge s={b.status}/>,
                        <div style={{display:"flex",gap:"4px"}}>
                          <Btn icon="eye" variant="ghost" sm/>
                          <Btn icon="print" variant="ghost" sm/>
                        </div>
                      ])}
                    />
                  </div>
              }
            </div>
          )}

          {/* Documents */}
          {tab==="docs"&&(
            <div style={{animation:"fadeUp 0.3s ease both"}}>
              <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"16px"}}>
                <Btn label="Ajouter document" icon="ul" variant="secondary" sm/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
                {(employee.docs||[]).map((doc,i)=>(
                  <div key={i} className="rh-card" style={{display:"flex",alignItems:"center",gap:"14px",padding:"14px 16px",cursor:"pointer",transition:"all 0.18s"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor="#0070F2";e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 4px 16px rgba(0,112,242,0.12)"}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor="#D9D9D9";e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none"}}>
                    <div style={{width:"44px",height:"44px",borderRadius:"8px",background:"#E8F3FF",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <Ico n="doc" s={22} c="#0070F2"/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:"13px",fontWeight:600,color:"#32363A"}}>{doc.name}</div>
                      <div style={{fontSize:"11px",color:"#89898B",marginTop:"2px"}}>{doc.type} · {fmtD(doc.date)}</div>
                    </div>
                    <Btn icon="dl" variant="ghost" sm/>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historique */}
          {tab==="history"&&(
            <div style={{animation:"fadeUp 0.3s ease both"}}>
              <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"16px"}}>
                <Btn label="Ajouter événement" icon="add" variant="secondary" sm/>
              </div>
              <div style={{position:"relative",paddingLeft:"28px"}}>
                <div style={{position:"absolute",left:"10px",top:0,bottom:0,width:"2px",background:"#EBEBEB"}}/>
                {(employee.history||[]).map((h,i)=>{
                  const dotC={Promotion:"#107E3E",Embauche:"#0070F2",Augmentation:"#E76500",Avenant:"#0070F2"}[h.type]||"#89898B";
                  return (
                    <div key={i} className="rh-timeline-item" style={{display:"flex",gap:"12px",marginBottom:"16px",position:"relative"}}>
                      <div style={{position:"absolute",left:"-25px",width:"20px",height:"20px",borderRadius:"50%",background:dotC,border:"2px solid white",display:"flex",alignItems:"center",justifyContent:"center",top:"10px",zIndex:1,boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
                        <div style={{width:"6px",height:"6px",borderRadius:"50%",background:"white"}}/>
                      </div>
                      <div className="rh-card" style={{flex:1,padding:"12px 16px",transition:"all 0.15s"}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor=dotC;e.currentTarget.style.background="#FAFAFA"}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor="#D9D9D9";e.currentTarget.style.background="white"}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                          <span style={{fontSize:"13px",fontWeight:700,color:dotC}}>{h.type}</span>
                          <span style={{fontSize:"11px",color:"#89898B"}}>{h.date}</span>
                        </div>
                        <div style={{fontSize:"13px",color:"#515456",marginBottom:"3px"}}>{h.detail}</div>
                        <div style={{fontSize:"11px",color:"#89898B"}}>Par {h.by}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Projets externes */}
          {tab==="projects"&&(
            <div style={{animation:"fadeUp 0.3s ease both"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"14px",marginBottom:"24px"}}>
                <KpiCard title="Projets réalisés" value={employee.projectCount} color="#0070F2" icon="brief"/>
                <KpiCard title="Total perçu" value={`${fmtN(employee.totalEarned)} FCFA`} color="#107E3E" icon="pay"/>
                <KpiCard title="Taux journalier" value={`${fmtN(employee.dailyRate)} FCFA`} color="#32363A" icon="chart"/>
              </div>
              <Sec title="Paiements par projet" icon="link"/>
              <div className="rh-card">
                <Table
                  cols={["Projet","Phase","% Négocié","Montant net","Date","Statut"]}
                  rows={PAI_EXT.filter(p=>p.empId===employee.id).map(p=>[
                    <strong style={{color:"#0070F2"}}>{p.project}</strong>,
                    <span style={{fontSize:"12px",color:"#89898B"}}>{p.phase}</span>,
                    <span style={{padding:"2px 8px",borderRadius:"20px",background:"#F1F8F1",color:"#107E3E",fontSize:"12px",fontWeight:600}}>{p.pct}%</span>,
                    <strong style={{color:"#E76500",fontSize:"14px"}}>{fmtN(p.net)} FCFA</strong>,
                    <span style={{fontSize:"12px",color:"#89898B"}}>{p.paidOn?fmtD(p.paidOn):"—"}</span>,
                    <Badge s={p.status}/>,
                  ])}
                  empty="Aucun paiement"
                />
              </div>
            </div>
          )}

          {/* Performance */}
          {tab==="perf"&&(
            <div style={{textAlign:"center",padding:"40px 20px",animation:"fadeUp 0.3s ease both"}}>
              <div style={{fontSize:"80px",fontWeight:800,color:"#0070F2",letterSpacing:"-4px",marginBottom:"8px",animation:"kpiCount 0.8s ease both"}}>{employee.rating}</div>
              <div style={{fontSize:"16px",color:"#89898B",marginBottom:"20px"}}>/ 5 — Note de performance globale</div>
              <div style={{display:"flex",justifyContent:"center",gap:"8px",marginBottom:"28px"}}>
                {[1,2,3,4,5].map(s=>(
                  <svg key={s} width="32" height="32" viewBox="0 0 24 24"
                    fill={s<=Math.round(employee.rating)?"#F0AB00":"#EBEBEB"}
                    stroke={s<=Math.round(employee.rating)?"#D4960A":"#D9D9D9"} strokeWidth="1"
                    style={{animation:`scaleIn 0.4s ease both`,animationDelay:`${s*0.08}s`}}>
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                ))}
              </div>
              <div style={{display:"inline-block",padding:"12px 24px",background:"#E8F3FF",borderRadius:"20px",color:"#0070F2",fontWeight:600,fontSize:"14px"}}>
                Basé sur {employee.projectCount} projets réalisés
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{padding:"14px 24px",borderTop:"1px solid #D9D9D9",display:"flex",gap:"8px",justifyContent:"space-between",background:"#FAFAFA",flexShrink:0}}>
          <Btn label="Fermer" onClick={onClose} variant="ghost"/>
          <div style={{display:"flex",gap:"8px"}}>
            {!isExt&&<Btn label="Générer bulletin" icon="doc" variant="secondary"/>}
            <Btn label="Télécharger dossier" icon="dl" variant="secondary"/>
            <Btn label="Modifier le profil" icon="edit" variant="primary"/>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== EMPLOYEE CARD VISUELLE =====
const EmpCard = ({employee,onClick,delay=0}) => {
  const ac = getAC(employee.first+employee.last);
  const photo = PHOTOS[employee.id];
  const [photoErr,setPhotoErr] = useState(false);
  const deptClass = DEPT_CLASSES[employee.department||""]||"dept-default";
  const seniority = employee.hireDate ? Math.floor((Date.now()-new Date(employee.hireDate))/(365.25*24*3600*1000)) : 0;

  return (
    <div className={`rh-emp-card rh-grid-item ${deptClass}`} onClick={onClick} style={{animationDelay:`${delay}s`}}>
      {/* Bande couleur gradient en haut */}
      <div className="card-accent"/>

      <div style={{padding:"18px 18px 14px"}}>
        {/* Header: photo + infos */}
        <div style={{display:"flex",gap:"14px",alignItems:"flex-start",marginBottom:"14px"}}>
          {/* Photo ou avatar */}
          <div style={{width:"58px",height:"58px",borderRadius:"50%",overflow:"hidden",flexShrink:0,border:"2.5px solid white",boxShadow:"0 0 0 1.5px #D9D9D9",transition:"all 0.25s"}}>
            {photo&&!photoErr
              ? <img src={photo} onError={()=>setPhotoErr(true)} alt={`${employee.first} ${employee.last}`}
                  style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.3s ease"}}/>
              : <div style={{width:"100%",height:"100%",background:ac.bg,color:ac.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",fontWeight:700}}>
                  {getInit(employee.first,employee.last)}
                </div>
            }
          </div>

          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:"14px",fontWeight:700,color:"#32363A",marginBottom:"3px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{employee.first} {employee.last}</div>
            <div style={{fontSize:"12px",color:"#6A6D70",marginBottom:"7px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{employee.role}</div>
            <Badge s={employee.status}/>
          </div>
        </div>

        {/* Infos */}
        <div style={{display:"flex",flexDirection:"column",gap:"5px",marginBottom:"12px"}}>
          {[
            {i:"bldg",v:employee.department||employee.speciality},
            {i:"phone",v:employee.phone},
          ].filter(x=>x.v).map(item=>(
            <div key={item.i} style={{display:"flex",alignItems:"center",gap:"7px",fontSize:"12px",color:"#515456"}}>
              <Ico n={item.i} s={12} c="#89898B"/>
              <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.v}</span>
            </div>
          ))}
        </div>

        {/* Footer card */}
        <div style={{paddingTop:"10px",borderTop:"1px solid #EBEBEB",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:"11px",color:"#89898B",fontFamily:"monospace"}}>{employee.matricule}</span>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            {employee.hireDate&&<span style={{fontSize:"11px",color:"#89898B"}}>{seniority}an{seniority>1?"s":""}</span>}
            {employee.rating&&(
              <div style={{display:"flex",alignItems:"center",gap:"2px"}}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#F0AB00" stroke="none"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                <span style={{fontSize:"11px",fontWeight:600,color:"#6A6D70"}}>{employee.rating}</span>
              </div>
            )}
            <span style={{fontSize:"11px",fontWeight:600,color:"#0070F2",padding:"3px 8px",background:"#E8F3FF",borderRadius:"4px"}}>Ouvrir →</span>
          </div>
        </div>
      </div>
    </div>
  );
};


// ===== BULLETIN MODAL COMPOSANT SÉPARÉ =====
const BulletinModal = ({selB, onClose, onValidate}) => {
  const [pErr, setPErr] = useState(false);
  const e = EMPLOYES.find(emp => emp.id === selB.empId);
  const photo = PHOTOS[selB.empId];
  const ac = getAC((e?.first||"") + (e?.last||""));

  return (
    <div style={{position:"fixed",inset:0,zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(13,43,64,0.6)",backdropFilter:"blur(4px)"}}/>
      <div className="rh-modal" style={{position:"relative",width:"100%",maxWidth:"700px",maxHeight:"94vh",overflow:"auto",borderRadius:"12px",boxShadow:"0 24px 80px rgba(0,0,0,0.35)",background:"white"}}>

        {/* Header */}
        <div style={{background:"linear-gradient(135deg,#1B3A52,#0D2B40)",padding:"16px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",borderRadius:"12px 12px 0 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            <div style={{width:"36px",height:"36px",borderRadius:"8px",background:"#0070F2",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Ico n="doc" s={18} c="white"/>
            </div>
            <div>
              <div style={{fontSize:"15px",fontWeight:700,color:"white"}}>Bulletin de Paie</div>
              <div style={{fontSize:"11px",color:"rgba(255,255,255,0.55)"}}>{MOIS[selB.month-1]} {selB.year} · Réf: {selB.id}</div>
            </div>
          </div>
          <button onClick={onClose} style={{width:"32px",height:"32px",borderRadius:"6px",border:"1px solid rgba(255,255,255,0.2)",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Ico n="close" s={15} c="white"/>
          </button>
        </div>

        {/* Bandeau société + tampon */}
        <div style={{background:"linear-gradient(135deg,#f8fafc,#e8f3ff)",borderBottom:"1px solid #D9D9D9",padding:"20px 28px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:"26px",fontWeight:900,color:"#1B3A52",letterSpacing:"0.5px",lineHeight:1}}>CLEAN<span style={{color:"#0070F2"}}>IT</span></div>
            <div style={{fontSize:"10px",color:"#89898B",marginTop:"3px",textTransform:"uppercase",letterSpacing:"0.8px"}}>Télécommunications · Douala, Cameroun</div>
            <div style={{fontSize:"10px",color:"#BDBDBD",marginTop:"2px",fontFamily:"monospace"}}>RCCM: DLA/2019/B/1234 · NIU: M012345678901P</div>
          </div>
          <div style={{textAlign:"center",padding:"10px 20px",border:"2px solid #0070F2",borderRadius:"8px",background:"white"}}>
            <div style={{fontSize:"10px",color:"#0070F2",textTransform:"uppercase",letterSpacing:"1px",fontWeight:700}}>Bulletin de Paie</div>
            <div style={{fontSize:"18px",fontWeight:800,color:"#1B3A52",marginTop:"2px"}}>{MOIS[selB.month-1]}</div>
            <div style={{fontSize:"13px",fontWeight:600,color:"#6A6D70"}}>{selB.year}</div>
          </div>
        </div>

        {/* Profil employé avec photo */}
        <div style={{padding:"20px 28px",background:"white",borderBottom:"1px solid #EBEBEB",display:"flex",gap:"20px",alignItems:"center"}}>
          <div style={{width:"72px",height:"72px",borderRadius:"50%",overflow:"hidden",flexShrink:0,border:"3px solid #0070F2",boxShadow:"0 4px 16px rgba(0,112,242,0.2)"}}>
            {photo&&!pErr
              ? <img src={photo} onError={()=>setPErr(true)} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              : <div style={{width:"100%",height:"100%",background:ac.bg,color:ac.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",fontWeight:700}}>{getInit(e?.first,e?.last)}</div>
            }
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:"18px",fontWeight:800,color:"#1B3A52",marginBottom:"3px"}}>{e?.first} {e?.last}</div>
            <div style={{fontSize:"13px",color:"#6A6D70",marginBottom:"8px"}}>{e?.role}{e?.department ? ` · ${e.department}` : ""}</div>
            <div style={{display:"flex",gap:"20px",flexWrap:"wrap"}}>
              {[
                {l:"Matricule", v:e?.matricule, mono:true},
                {l:"Contrat",   v:e?.contract},
                {l:"Banque",    v:e?.bank},
              ].map(item=>(
                <div key={item.l}>
                  <div style={{fontSize:"9px",color:"#BDBDBD",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"1px"}}>{item.l}</div>
                  <div style={{fontSize:"12px",fontWeight:600,color:"#32363A",fontFamily:item.mono?"monospace":"inherit"}}>{item.v||"—"}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <Badge s={selB.status}/>
            {selB.paidOn && <div style={{fontSize:"11px",color:"#89898B",marginTop:"6px"}}>Payé le {fmtD(selB.paidOn)}</div>}
          </div>
        </div>

        {/* Tableau de paie */}
        <div style={{padding:"20px 28px",background:"white"}}>
          <table style={{width:"100%",borderCollapse:"collapse",borderRadius:"8px",overflow:"hidden",border:"1px solid #EBEBEB"}}>
            <thead>
              <tr style={{background:"#1B3A52"}}>
                <th style={{padding:"12px 18px",textAlign:"left",fontSize:"11px",fontWeight:700,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:"0.5px"}}>Libellé</th>
                <th style={{padding:"12px 18px",textAlign:"center",fontSize:"11px",fontWeight:700,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:"0.5px"}}>Type</th>
                <th style={{padding:"12px 18px",textAlign:"right",fontSize:"11px",fontWeight:700,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:"0.5px"}}>Montant (FCFA)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{borderBottom:"1px solid #EBEBEB",background:"white"}}>
                <td style={{padding:"14px 18px"}}>
                  <div style={{fontSize:"13px",fontWeight:600,color:"#32363A"}}>Salaire de base</div>
                  <div style={{fontSize:"11px",color:"#89898B",marginTop:"2px"}}>Rémunération mensuelle contractuelle</div>
                </td>
                <td style={{padding:"14px 18px",textAlign:"center"}}>
                  <span style={{padding:"3px 10px",borderRadius:"20px",background:"#E8F3FF",color:"#0070F2",fontSize:"11px",fontWeight:600}}>Base</span>
                </td>
                <td style={{padding:"14px 18px",textAlign:"right",fontSize:"15px",fontWeight:700,color:"#32363A"}}>{fmtN(selB.base)}</td>
              </tr>
              {selB.bonus > 0 && (
                <tr style={{borderBottom:"1px solid #EBEBEB",background:"#FAFAFA"}}>
                  <td style={{padding:"14px 18px"}}>
                    <div style={{fontSize:"13px",fontWeight:600,color:"#107E3E"}}>Primes & Bonus</div>
                    <div style={{fontSize:"11px",color:"#89898B",marginTop:"2px"}}>Prime mensuelle</div>
                  </td>
                  <td style={{padding:"14px 18px",textAlign:"center"}}>
                    <span style={{padding:"3px 10px",borderRadius:"20px",background:"#F1F8F1",color:"#107E3E",fontSize:"11px",fontWeight:600}}>Prime</span>
                  </td>
                  <td style={{padding:"14px 18px",textAlign:"right",fontSize:"15px",fontWeight:700,color:"#107E3E"}}>+ {fmtN(selB.bonus)}</td>
                </tr>
              )}
              {selB.benefits > 0 && (
                <tr style={{borderBottom:"1px solid #EBEBEB",background:"white"}}>
                  <td style={{padding:"14px 18px"}}>
                    <div style={{fontSize:"13px",fontWeight:600,color:"#6B00A4"}}>Avantages en nature</div>
                    <div style={{fontSize:"11px",color:"#89898B",marginTop:"2px"}}>Transport, restauration, etc.</div>
                  </td>
                  <td style={{padding:"14px 18px",textAlign:"center"}}>
                    <span style={{padding:"3px 10px",borderRadius:"20px",background:"#FFDEFF",color:"#6B00A4",fontSize:"11px",fontWeight:600}}>Avantage</span>
                  </td>
                  <td style={{padding:"14px 18px",textAlign:"right",fontSize:"15px",fontWeight:700,color:"#6B00A4"}}>+ {fmtN(selB.benefits)}</td>
                </tr>
              )}
              <tr style={{background:"#F1F8F1",borderTop:"2px solid #107E3E"}}>
                <td style={{padding:"14px 18px"}}>
                  <div style={{fontSize:"14px",fontWeight:700,color:"#107E3E"}}>SALAIRE BRUT</div>
                </td>
                <td/>
                <td style={{padding:"14px 18px",textAlign:"right",fontSize:"16px",fontWeight:800,color:"#107E3E"}}>{fmtN(selB.gross)}</td>
              </tr>
              {selB.deductions > 0 && (
                <tr style={{background:"#FFF0F0",borderTop:"1px solid #BB0000"}}>
                  <td style={{padding:"14px 18px"}}>
                    <div style={{fontSize:"13px",fontWeight:600,color:"#BB0000"}}>Retenues & Déductions</div>
                  </td>
                  <td style={{padding:"14px 18px",textAlign:"center"}}>
                    <span style={{padding:"3px 10px",borderRadius:"20px",background:"#FFF0F0",color:"#BB0000",fontSize:"11px",fontWeight:600}}>Retenue</span>
                  </td>
                  <td style={{padding:"14px 18px",textAlign:"right",fontSize:"15px",fontWeight:700,color:"#BB0000"}}>- {fmtN(selB.deductions)}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr style={{background:"linear-gradient(135deg,#0070F2,#0057B8)"}}>
                <td style={{padding:"16px 18px"}}>
                  <div style={{fontSize:"16px",fontWeight:800,color:"white",letterSpacing:"0.3px"}}>NET À PAYER</div>
                  <div style={{fontSize:"11px",color:"rgba(255,255,255,0.6)",marginTop:"2px"}}>Mode: {selB.payMethod}</div>
                </td>
                <td/>
                <td style={{padding:"16px 18px",textAlign:"right"}}>
                  <div style={{fontSize:"26px",fontWeight:900,color:"white",letterSpacing:"-0.5px"}}>{fmtN(selB.net)}</div>
                  <div style={{fontSize:"12px",color:"rgba(255,255,255,0.7)",marginTop:"1px"}}>FCFA</div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Résumé + signatures */}
        <div style={{padding:"16px 28px 20px",background:"#FAFAFA",borderTop:"1px solid #EBEBEB"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"12px",marginBottom:"16px"}}>
            {[
              {l:"Salaire brut",  v:`${fmtN(selB.gross)} FCFA`, bold:false},
              {l:"Déductions",    v:selB.deductions ? `- ${fmtN(selB.deductions)} FCFA` : "Aucune", bold:false},
              {l:"Net versé",     v:`${fmtN(selB.net)} FCFA`, bold:true},
            ].map(item=>(
              <div key={item.l} style={{textAlign:"center",padding:"12px 10px",background:"white",borderRadius:"8px",border:`1px solid ${item.bold?"#0070F2":"#EBEBEB"}`}}>
                <div style={{fontSize:"10px",color:"#89898B",textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:"5px"}}>{item.l}</div>
                <div style={{fontSize:item.bold?"16px":"13px",fontWeight:item.bold?800:600,color:item.bold?"#0070F2":"#32363A"}}>{item.v}</div>
              </div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"32px",paddingTop:"14px",borderTop:"1px solid #EBEBEB"}}>
            {["Signature & Cachet Employé","Signature Direction / DRH"].map(s=>(
              <div key={s} style={{textAlign:"center"}}>
                <div style={{fontSize:"10px",color:"#89898B",marginBottom:"32px",textTransform:"uppercase",letterSpacing:"0.4px"}}>{s}</div>
                <div style={{height:"1px",background:"#D9D9D9"}}/>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{padding:"14px 28px",borderTop:"1px solid #EBEBEB",background:"white",display:"flex",gap:"8px",justifyContent:"flex-end",borderRadius:"0 0 12px 12px"}}>
          <Btn label="Fermer" onClick={onClose} variant="ghost"/>
          <Btn label="Imprimer" icon="print" variant="secondary"/>
          <Btn label="Télécharger PDF" icon="dl" variant="secondary"/>
          {selB.status==="en_attente" && (
            <Btn label="Valider & Marquer payé" icon="chk" variant="success"
              onClick={()=>{onValidate(selB.id); onClose();}}/>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== DASHBOARD =====
const Dashboard = ({employees,externals,bulletins,payExt,setTab}) => {
  const active = employees.filter(e=>e.status==="actif").length;
  const pendingB = bulletins.filter(b=>b.status==="en_attente");
  const pendingP = payExt.filter(p=>p.status==="en_attente");
  const present = POINTAGES.filter(p=>p.status==="present").length;
  const late = POINTAGES.filter(p=>p.status==="retard").length;
  const absent = POINTAGES.filter(p=>p.status==="absent").length;

  const byDept = ["Technique & Ingénierie","Gestion de Projets","Finance & Comptabilité","Commercial & Business","Ressources Humaines","Direction Générale"]
    .map(d=>({d,n:employees.filter(e=>e.department===d).length})).filter(x=>x.n>0);
  const maxN = Math.max(...byDept.map(x=>x.n),1);

  return (
    <div className="rh-page-enter">
      {/* Alertes */}
      {pendingB.length>0&&(
        <div className="rh-alert warning">
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <Ico n="alert" s={16} c="#E76500"/>
            <span style={{fontSize:"13px",fontWeight:600,color:"#AD4E00"}}>{pendingB.length} bulletin(s) de paie en attente de validation — Mars 2024</span>
          </div>
          <Btn label="Traiter" onClick={()=>setTab("payroll")} variant="ghost" sm/>
        </div>
      )}
      {pendingP.length>0&&(
        <div className="rh-alert error">
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <Ico n="alert" s={16} c="#BB0000"/>
            <span style={{fontSize:"13px",fontWeight:600,color:"#BB0000"}}>{pendingP.length} paiement(s) externe(s) en attente · {fmtN(pendingP.reduce((s,p)=>s+p.net,0))} FCFA</span>
          </div>
          <Btn label="Voir" onClick={()=>setTab("ext_payments")} variant="ghost" sm/>
        </div>
      )}

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"14px",marginBottom:"20px"}}>
        <KpiCard title="Effectif interne" value={employees.length} subtitle={`${active} actifs · ${employees.length-active} congé`} color="#0070F2" icon="group" trend={5} onClick={()=>setTab("employees")} delay={0}/>
        <KpiCard title="Techniciens externes" value={externals.length} subtitle={`${externals.filter(e=>e.status==="actif").length} actifs`} color="#6B00A4" icon="person" onClick={()=>setTab("externals")} delay={0.06}/>
        <KpiCard title="Présents aujourd'hui" value={present} subtitle={`${late} retard(s) · ${absent} absent(s)`} color="#107E3E" icon="clock" onClick={()=>setTab("attendance")} delay={0.12}/>
        <KpiCard title="Bulletins en attente" value={pendingB.length} subtitle="À valider avant fin du mois" color={pendingB.length>0?"#E76500":"#107E3E"} icon="doc" onClick={()=>setTab("payroll")} delay={0.18}/>
      </div>

      {/* Main grid */}
      <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:"16px",marginBottom:"16px"}}>
        {/* Profils récents */}
        <div className="rh-card">
          <div className="rh-card-header">
            <span className="rh-card-title">Équipe interne — Profils récents</span>
            <button onClick={()=>setTab("employees")} style={{fontSize:"12px",color:"#0070F2",background:"none",border:"none",cursor:"pointer",fontWeight:500}}>Voir tous →</button>
          </div>
          {employees.slice(0,5).map((e,i)=>{
            const photo = PHOTOS[e.id];
            const [pErr,setPErr] = useState(false);
            const ac = getAC(e.first+e.last);
            return (
              <div key={e.id} className="rh-emp-row"
                style={{animationDelay:`${i*0.05}s`}}>
                {/* Mini photo */}
                <div style={{width:"38px",height:"38px",borderRadius:"50%",overflow:"hidden",flexShrink:0,border:"2px solid white",boxShadow:"0 0 0 1.5px #D9D9D9"}}>
                  {photo&&!pErr
                    ? <img src={photo} onError={()=>setPErr(true)} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    : <div style={{width:"100%",height:"100%",background:ac.bg,color:ac.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:700}}>{getInit(e.first,e.last)}</div>
                  }
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:"13px",fontWeight:600,color:"#32363A"}}>{e.first} {e.last}</div>
                  <div style={{fontSize:"11px",color:"#89898B"}}>{e.role} · {e.matricule}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <Badge s={e.status}/>
                  <div style={{fontSize:"10px",color:"#89898B",marginTop:"3px"}}>{e.department?.split(" ")[0]}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Droite */}
        <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
          {/* Présence */}
          <div className="rh-card">
            <div className="rh-card-header">
              <span className="rh-card-title">Présence — Aujourd'hui</span>
              <button onClick={()=>setTab("attendance")} style={{fontSize:"12px",color:"#0070F2",background:"none",border:"none",cursor:"pointer",fontWeight:500}}>Pointage →</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",borderBottom:"1px solid #EBEBEB"}}>
              {[{l:"Présents",v:present,c:"#107E3E"},{l:"Retards",v:late,c:"#E76500"},{l:"Absents",v:absent,c:"#BB0000"}].map((k,i)=>(
                <div key={k.l} style={{padding:"14px 8px",textAlign:"center",borderRight:i<2?"1px solid #EBEBEB":"none",animation:"kpiCount 0.6s ease both",animationDelay:`${i*0.1}s`}}>
                  <div style={{fontSize:"24px",fontWeight:700,color:k.c}}><Counter value={k.v} duration={800}/></div>
                  <div style={{fontSize:"10px",color:"#89898B",textTransform:"uppercase",letterSpacing:"0.3px",marginTop:"2px"}}>{k.l}</div>
                </div>
              ))}
            </div>
            <div style={{padding:"12px 18px"}}>
              <Progress value={present} max={employees.length} color="#107E3E" label="Taux de présence" showPct delay={0.3}/>
            </div>
          </div>

          {/* Répartition */}
          <div className="rh-card" style={{flex:1}}>
            <div className="rh-card-header">
              <span className="rh-card-title">Effectifs par département</span>
            </div>
            {byDept.map(({d,n},i)=>(
              <div key={d} className="rh-stat-bar">
                <Progress value={n} max={maxN} color="#0070F2" label={d.split(" ")[0]} showPct delay={i*0.08}/>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bulletins récents */}
      <div className="rh-card">
        <div className="rh-card-header">
          <span className="rh-card-title">Activité paie récente</span>
          <button onClick={()=>setTab("payroll")} style={{fontSize:"12px",color:"#0070F2",background:"none",border:"none",cursor:"pointer",fontWeight:500}}>Gérer →</button>
        </div>
        <Table
          cols={["Employé","Département","Période","Mode paiement","Statut"]}
          rows={bulletins.slice(0,6).map(b=>{
            const e=employees.find(emp=>emp.id===b.empId);
            const photo=PHOTOS[b.empId];
            const [pErr,setPErr]=useState(false);
            const ac=getAC(e?.first+e?.last);
            return [
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <div style={{width:"32px",height:"32px",borderRadius:"50%",overflow:"hidden",flexShrink:0,border:"2px solid white",boxShadow:"0 0 0 1px #D9D9D9"}}>
                  {photo&&!pErr
                    ?<img src={photo} onError={()=>setPErr(true)} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    :<div style={{width:"100%",height:"100%",background:ac.bg,color:ac.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:700}}>{getInit(e?.first,e?.last)}</div>
                  }
                </div>
                <div>
                  <div style={{fontSize:"13px",fontWeight:500}}>{e?`${e.first} ${e.last}`:"—"}</div>
                  <div style={{fontSize:"11px",color:"#89898B"}}>{e?.matricule}</div>
                </div>
              </div>,
              <span style={{fontSize:"12px",color:"#89898B"}}>{e?.department||"—"}</span>,
              <strong>{MOIS_S[b.month-1]} {b.year}</strong>,
              <span style={{fontSize:"12px",color:"#89898B"}}>{b.payMethod}</span>,
              <Badge s={b.status}/>,
            ];
          })}
        />
      </div>
    </div>
  );
};

// ===== LISTE EMPLOYÉS =====
const EmployeeList = ({employees,type,onSelect,onAdd}) => {
  const [search,setSearch] = useState("");
  const [filterStatus,setFilterStatus] = useState("tous");
  const [view,setView] = useState("grid");
  const isInt = type==="internal";

  const filtered = employees.filter(e=>{
    const ms = !search||`${e.first} ${e.last} ${e.matricule} ${e.role||""} ${e.speciality||""}`.toLowerCase().includes(search.toLowerCase());
    const mf = filterStatus==="tous"||e.status===filterStatus;
    return ms&&mf;
  });

  return (
    <div className="rh-page-enter">
      {/* Toolbar */}
      <div style={{display:"flex",gap:"10px",marginBottom:"16px",alignItems:"center",flexWrap:"wrap",padding:"12px 16px",background:"white",border:"1px solid #D9D9D9",borderRadius:"8px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
        <div className="rh-search" style={{flex:1,minWidth:"220px"}}>
          <Ico n="srch" s={15} c="#89898B"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Rechercher ${isInt?"un employé":"un technicien"}...`}/>
          {search&&<button onClick={()=>setSearch("")} style={{border:"none",background:"none",cursor:"pointer",padding:0,display:"flex"}}><Ico n="close" s={13} c="#89898B"/></button>}
        </div>
        <div style={{display:"flex",background:"#F4F4F4",border:"1px solid #D9D9D9",borderRadius:"6px",padding:"2px",gap:"2px"}}>
          {[{v:"tous",l:"Tous"},{v:"actif",l:"Actifs"},{v:"conge",l:"Congés"},{v:"inactif",l:"Inactifs"}].map(s=>(
            <button key={s.v} onClick={()=>setFilterStatus(s.v)} style={{padding:"6px 12px",borderRadius:"4px",border:"none",background:filterStatus===s.v?"#0070F2":"transparent",color:filterStatus===s.v?"white":"#89898B",fontWeight:filterStatus===s.v?700:400,fontSize:"12px",cursor:"pointer",fontFamily:"inherit",transition:"all 0.12s"}}>
              {s.l}
            </button>
          ))}
        </div>
        <div style={{display:"flex",background:"#F4F4F4",border:"1px solid #D9D9D9",borderRadius:"6px",padding:"2px"}}>
          {[{v:"grid",i:"grid"},{v:"list",i:"list"}].map(vt=>(
            <button key={vt.v} onClick={()=>setView(vt.v)} style={{width:"32px",height:"32px",borderRadius:"4px",border:"none",background:view===vt.v?"#0070F2":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.12s"}}>
              <Ico n={vt.i} s={14} c={view===vt.v?"white":"#89898B"}/>
            </button>
          ))}
        </div>
        <Btn label={isInt?"+ Nouvel employé":"+ Nouveau technicien"} icon="add" variant="primary" sm onClick={onAdd}/>
      </div>

      <div style={{fontSize:"12px",color:"#89898B",marginBottom:"14px",display:"flex",alignItems:"center",gap:"8px"}}>
        <span style={{fontWeight:600,color:"#32363A"}}>{filtered.length}</span> enregistrement(s)
        {search&&<span>· Recherche: "<strong>{search}</strong>"</span>}
      </div>

      {/* Grid view avec photos */}
      {view==="grid"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(264px,1fr))",gap:"14px"}}>
          {filtered.map((e,i)=>(
            <EmpCard key={e.id} employee={e} onClick={()=>onSelect(e)} delay={i*0.04}/>
          ))}
          {filtered.length===0&&(
            <div style={{gridColumn:"1/-1",padding:"60px",textAlign:"center",background:"white",borderRadius:"8px",border:"1px dashed #D9D9D9",animation:"fadeIn 0.3s ease"}}>
              <Ico n="srch" s={48} c="#D9D9D9"/>
              <div style={{fontSize:"16px",fontWeight:600,color:"#89898B",marginTop:"16px"}}>Aucun résultat</div>
              <div style={{fontSize:"13px",color:"#BDBDBD",marginTop:"6px"}}>Modifiez vos critères de recherche</div>
            </div>
          )}
        </div>
      )}

      {/* List view */}
      {view==="list"&&(
        <div className="rh-card">
          <Table
            cols={isInt?["Employé","Poste","Département","Contrat","Embauche","Téléphone","Statut","Actions"]:["Technicien","Spécialité","Projets actifs","Taux/jour","Total perçu","Téléphone","Statut","Actions"]}
            rows={filtered.map((e,i)=>{
              const photo=PHOTOS[e.id];
              const [pErr,setPErr]=useState(false);
              const ac=getAC(e.first+e.last);
              return [
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <div style={{width:"36px",height:"36px",borderRadius:"50%",overflow:"hidden",flexShrink:0,border:"2px solid white",boxShadow:"0 0 0 1.5px #D9D9D9"}}>
                    {photo&&!pErr
                      ?<img src={photo} onError={()=>setPErr(true)} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      :<div style={{width:"100%",height:"100%",background:ac.bg,color:ac.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:700}}>{getInit(e.first,e.last)}</div>
                    }
                  </div>
                  <div>
                    <div style={{fontSize:"13px",fontWeight:700,color:"#32363A"}}>{e.first} {e.last}</div>
                    <div style={{fontSize:"11px",color:"#89898B",fontFamily:"monospace"}}>{e.matricule}</div>
                  </div>
                </div>,
                <span style={{fontSize:"12px"}}>{e.role}</span>,
                isInt
                  ?<span style={{padding:"2px 8px",borderRadius:"4px",background:"#E8F3FF",color:"#0057B8",fontSize:"11px",fontWeight:500}}>{e.department}</span>
                  :<span style={{padding:"2px 8px",borderRadius:"4px",background:"#FFDEFF",color:"#6B00A4",fontSize:"11px",fontWeight:500}}>{e.speciality}</span>,
                isInt
                  ?<Badge s={(e.contract||"cdi").toLowerCase()}/>
                  :<div style={{display:"flex",gap:"3px",flexWrap:"wrap"}}>{e.projects?.length>0?e.projects.map(p=><span key={p} style={{padding:"1px 6px",borderRadius:"3px",background:"#E8F3FF",color:"#0070F2",fontSize:"10px",fontWeight:600}}>{p}</span>):<span style={{color:"#89898B",fontSize:"12px"}}>Aucun</span>}</div>,
                isInt
                  ?<span style={{fontSize:"12px",color:"#89898B"}}>{fmtD(e.hireDate)}</span>
                  :<strong style={{color:"#107E3E"}}>{fmtN(e.dailyRate)} FCFA</strong>,
                isInt
                  ?<span style={{fontSize:"12px",color:"#89898B"}}>{e.phone}</span>
                  :<strong style={{color:"#E76500"}}>{fmtN(e.totalEarned)} FCFA</strong>,
                <Badge s={e.status}/>,
                <div style={{display:"flex",gap:"4px"}}>
                  <Btn label="Ouvrir" onClick={()=>onSelect(e)} variant="secondary" sm/>
                  <Btn icon="edit" variant="ghost" sm/>
                </div>
              ];
            })}
            onRow={i=>onSelect(filtered[i])}
          />
        </div>
      )}
    </div>
  );
};

// ===== POINTAGE =====
const Attendance = ({employees}) => (
  <div className="rh-page-enter">
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"14px",marginBottom:"20px"}}>
      {[
        {t:"Total",v:employees.length,c:"#32363A"},
        {t:"Présents",v:POINTAGES.filter(p=>p.status==="present").length,c:"#107E3E"},
        {t:"Retards",v:POINTAGES.filter(p=>p.status==="retard").length,c:"#E76500"},
        {t:"Absents",v:POINTAGES.filter(p=>p.status==="absent").length,c:"#BB0000"},
        {t:"Moy. heures",v:"8.2h",c:"#0070F2"},
      ].map((k,i)=><KpiCard key={k.t} title={k.t} value={k.v} color={k.c} delay={i*0.06}/>)}
    </div>
    <div className="rh-card">
      <div className="rh-card-header">
        <span className="rh-card-title">Pointage — 15 mars 2024</span>
        <Btn label="Exporter" icon="dl" variant="ghost" sm/>
      </div>
      <Table
        cols={["Employé","Département","Arrivée","Départ","Heures","Statut","Notes"]}
        rows={POINTAGES.map(pt=>{
          const e=employees.find(emp=>emp.id===pt.empId);
          if(!e) return null;
          const photo=PHOTOS[pt.empId];
          const [pErr,setPErr]=useState(false);
          const ac=getAC(e.first+e.last);
          return [
            <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
              <div style={{width:"34px",height:"34px",borderRadius:"50%",overflow:"hidden",flexShrink:0,border:"2px solid white",boxShadow:"0 0 0 1px #D9D9D9"}}>
                {photo&&!pErr
                  ?<img src={photo} onError={()=>setPErr(true)} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  :<div style={{width:"100%",height:"100%",background:ac.bg,color:ac.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:700}}>{getInit(e.first,e.last)}</div>
                }
              </div>
              <div>
                <div style={{fontSize:"13px",fontWeight:500}}>{e.first} {e.last}</div>
                <div style={{fontSize:"11px",color:"#89898B"}}>{e.matricule}</div>
              </div>
            </div>,
            <span style={{fontSize:"12px",color:"#89898B"}}>{e.department}</span>,
            <span style={{fontSize:"13px",fontWeight:600,color:pt.arrival?"#107E3E":"#89898B"}}>{pt.arrival||"—"}</span>,
            <span style={{color:pt.departure?"#515456":"#89898B"}}>{pt.departure||"—"}</span>,
            <span style={{fontWeight:600,color:pt.hours>=8?"#107E3E":pt.hours>0?"#E76500":"#89898B"}}>{pt.hours?`${pt.hours}h`:"—"}</span>,
            <Badge s={pt.status}/>,
            <span style={{fontSize:"11px",color:"#89898B"}}>{pt.note||"—"}</span>,
          ];
        }).filter(Boolean)}
      />
    </div>
  </div>
);

// ===== CONGÉS =====
const Leaves = () => (
  <div className="rh-page-enter">
    <div style={{display:"flex",gap:"14px",marginBottom:"20px",alignItems:"center",flexWrap:"wrap"}}>
      {[{t:"En attente",v:CONGES.filter(c=>c.status==="en_attente").length,c:"#E76500"},{t:"Approuvés",v:CONGES.filter(c=>c.status==="approuve").length,c:"#107E3E"},{t:"Refusés",v:0,c:"#BB0000"}].map((k,i)=><KpiCard key={k.t} title={k.t} value={k.v} color={k.c} delay={i*0.06}/>)}
      <div style={{marginLeft:"auto"}}><Btn label="Nouvelle demande" icon="add" variant="primary"/></div>
    </div>
    <div className="rh-card">
      <Table
        cols={["Employé","Type","Début","Fin","Durée","Remplaçant","Statut","Actions"]}
        rows={CONGES.map(c=>[
          <strong>{c.empName}</strong>,
          <span style={{fontSize:"12px"}}>{c.type}</span>,
          <span style={{fontSize:"12px",color:"#89898B"}}>{fmtD(c.start)}</span>,
          <span style={{fontSize:"12px",color:"#89898B"}}>{fmtD(c.end)}</span>,
          <span style={{padding:"2px 8px",borderRadius:"20px",background:"#E8F3FF",color:"#0070F2",fontSize:"12px",fontWeight:600}}>{c.days}j</span>,
          <span style={{fontSize:"12px",color:"#89898B"}}>{c.substitute||"—"}</span>,
          <Badge s={c.status}/>,
          <div style={{display:"flex",gap:"4px"}}>
            {c.status==="en_attente"&&<>
              <button className="rh-btn rh-btn-success rh-btn-sm">Approuver</button>
              <button className="rh-btn rh-btn-danger rh-btn-sm">Refuser</button>
            </>}
            {c.status!=="en_attente"&&<span style={{fontSize:"11px",color:"#89898B"}}>par {c.approvedBy}</span>}
          </div>
        ])}
      />
    </div>
  </div>
);

// ===== PAIE MENSUELLE =====
const Payroll = ({employees,bulletins,setBulletins,onToast}) => {
  const [selB,setSelB] = useState(null);
  const [month,setMonth] = useState("3");
  const [year,setYear] = useState("2024");
  const filtered = bulletins.filter(b=>b.month===Number(month)&&b.year===Number(year));
  const pending = filtered.filter(b=>b.status==="en_attente").length;
  const totalNet = filtered.reduce((s,b)=>s+b.net,0);
  const totalGross = filtered.reduce((s,b)=>s+b.gross,0);
  const validate = id => { setBulletins(p=>p.map(b=>b.id===id?{...b,status:"paye",paidOn:new Date().toISOString().split("T")[0]}:b)); onToast("Bulletin validé avec succès","success"); };
  const validateAll = () => { setBulletins(p=>p.map(b=>filtered.find(f=>f.id===b.id&&b.status==="en_attente")?{...b,status:"paye",paidOn:new Date().toISOString().split("T")[0]}:b)); onToast(`${pending} bulletin(s) validé(s)`,"success"); };

  return (
    <div className="rh-page-enter">
      <div style={{display:"flex",gap:"10px",marginBottom:"16px",alignItems:"center",padding:"12px 16px",background:"white",border:"1px solid #D9D9D9",borderRadius:"8px",flexWrap:"wrap"}}>
        <select value={month} onChange={e=>setMonth(e.target.value)} className="rh-select" style={{width:"auto",minWidth:"100px"}}>
          {MOIS_S.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
        </select>
        <select value={year} onChange={e=>setYear(e.target.value)} className="rh-select" style={{width:"auto"}}>
          {["2024","2023"].map(y=><option key={y} value={y}>{y}</option>)}
        </select>
        <div style={{marginLeft:"auto",display:"flex",gap:"8px"}}>
          {pending>0&&<Btn label={`Valider tous (${pending})`} icon="chk" variant="success" sm onClick={validateAll}/>}
          <Btn label="Générer la paie" icon="add" variant="primary" sm/>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"14px",marginBottom:"20px"}}>
        <KpiCard title="Masse salariale brute" value={`${fmtN(totalGross)} FCFA`} color="#32363A" icon="chart" delay={0}/>
        <KpiCard title="Total net à payer" value={`${fmtN(totalNet)} FCFA`} color="#0070F2" icon="pay" delay={0.06}/>
        <KpiCard title="Bulletins en attente" value={pending} color={pending>0?"#E76500":"#107E3E"} icon="doc" delay={0.12}/>
      </div>

      <div className="rh-card">
        <div className="rh-card-header">
          <span className="rh-card-title">Bulletins — {MOIS[Number(month)-1]} {year}</span>
        </div>
        <Table
          cols={["Employé","Département","Base","Primes","Brut","Net à payer","Mode","Statut","Actions"]}
          rows={filtered.map(b=>{
            const e=employees.find(emp=>emp.id===b.empId);
            const photo=PHOTOS[b.empId];
            const [pErr,setPErr]=useState(false);
            const ac=getAC(e?.first+e?.last);
            return [
              <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <div style={{width:"32px",height:"32px",borderRadius:"50%",overflow:"hidden",flexShrink:0,border:"2px solid white",boxShadow:"0 0 0 1px #D9D9D9"}}>
                  {photo&&!pErr
                    ?<img src={photo} onError={()=>setPErr(true)} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    :<div style={{width:"100%",height:"100%",background:ac.bg,color:ac.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:700}}>{getInit(e?.first,e?.last)}</div>
                  }
                </div>
                <div>
                  <div style={{fontSize:"13px",fontWeight:500}}>{e?`${e.first} ${e.last}`:"—"}</div>
                  <div style={{fontSize:"11px",color:"#89898B"}}>{e?.matricule}</div>
                </div>
              </div>,
              <span style={{fontSize:"12px",color:"#89898B"}}>{e?.department||"—"}</span>,
              <span>{fmtN(b.base)}</span>,
              <span style={{color:"#107E3E"}}>{b.bonus>0?`+${fmtN(b.bonus)}`:"—"}</span>,
              <span style={{fontWeight:500}}>{fmtN(b.gross)}</span>,
              <strong style={{color:"#0070F2",fontSize:"14px"}}>{fmtN(b.net)} FCFA</strong>,
              <span style={{fontSize:"11px",color:"#89898B"}}>{b.payMethod}</span>,
              <Badge s={b.status}/>,
              <div style={{display:"flex",gap:"4px"}}>
                <Btn label="Voir" onClick={()=>setSelB(b)} variant="secondary" sm/>
                {b.status==="en_attente"&&<Btn label="Valider" onClick={()=>validate(b.id)} variant="success" sm/>}
                <Btn icon="print" variant="ghost" sm/>
              </div>
            ];
          })}
          empty="Aucun bulletin pour cette période"
        />
      </div>

      {selB&&(
        <div style={{position:"fixed",inset:0,zIndex:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
          <div onClick={()=>setSelB(null)} style={{position:"absolute",inset:0,background:"rgba(13,43,64,0.55)",backdropFilter:"blur(3px)"}}/>
          <div className="rh-modal rh-card" style={{position:"relative",width:"100%",maxWidth:"660px",maxHeight:"92vh",overflow:"auto",borderRadius:"8px",boxShadow:"0 16px 64px rgba(0,0,0,0.25)"}}>
            {(()=>{
              const e=EMPLOYES.find(emp=>emp.id===selB.empId);
              const photo=PHOTOS[selB.empId];
              const ac=getAC((e?.first||"")+(e?.last||""));
              const [pErr,setPErr]=useState(false);
              return (
                <>
                  {/* Header du modal */}
                  <div style={{background:"linear-gradient(135deg,#1B3A52,#0D2B40)",padding:"16px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",borderRadius:"12px 12px 0 0"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                      <div style={{width:"36px",height:"36px",borderRadius:"8px",background:"#0070F2",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <Ico n="doc" s={18} c="white"/>
                      </div>
                      <div>
                        <div style={{fontSize:"15px",fontWeight:700,color:"white"}}>Bulletin de Paie</div>
                        <div style={{fontSize:"11px",color:"rgba(255,255,255,0.55)"}}>{MOIS[selB.month-1]} {selB.year} · Réf: {selB.id}</div>
                      </div>
                    </div>
                    <button onClick={()=>setSelB(null)} style={{width:"32px",height:"32px",borderRadius:"6px",border:"1px solid rgba(255,255,255,0.2)",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <Ico n="close" s={15} c="white"/>
                    </button>
                  </div>

                  <div style={{padding:"0"}}>
                    {/* Bandeau entreprise + employé */}
                    <div style={{background:"linear-gradient(135deg,#f8fafc,#e8f3ff)",borderBottom:"1px solid #D9D9D9",padding:"20px 28px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      {/* Logo entreprise */}
                      <div>
                        <div style={{fontSize:"26px",fontWeight:900,color:"#1B3A52",letterSpacing:"0.5px",lineHeight:1}}>CLEAN<span style={{color:"#0070F2"}}>IT</span></div>
                        <div style={{fontSize:"10px",color:"#89898B",marginTop:"3px",textTransform:"uppercase",letterSpacing:"0.8px"}}>Télécommunications · Douala, Cameroun</div>
                        <div style={{fontSize:"10px",color:"#BDBDBD",marginTop:"2px",fontFamily:"monospace"}}>RCCM: DLA/2019/B/1234 · NIU: M012345678901P</div>
                      </div>
                      {/* Tampon BULLETIN */}
                      <div style={{textAlign:"center",padding:"10px 20px",border:"2px solid #0070F2",borderRadius:"8px",background:"white"}}>
                        <div style={{fontSize:"10px",color:"#0070F2",textTransform:"uppercase",letterSpacing:"1px",fontWeight:700}}>Bulletin de Paie</div>
                        <div style={{fontSize:"18px",fontWeight:800,color:"#1B3A52",marginTop:"2px"}}>{MOIS[selB.month-1]}</div>
                        <div style={{fontSize:"13px",fontWeight:600,color:"#6A6D70"}}>{selB.year}</div>
                      </div>
                    </div>

                    {/* Profil employé avec photo */}
                    <div style={{padding:"20px 28px",background:"white",borderBottom:"1px solid #EBEBEB",display:"flex",gap:"20px",alignItems:"center"}}>
                      {/* Photo */}
                      <div style={{width:"72px",height:"72px",borderRadius:"50%",overflow:"hidden",flexShrink:0,border:"3px solid #0070F2",boxShadow:"0 4px 16px rgba(0,112,242,0.2)"}}>
                        {photo&&!pErr
                          ?<img src={photo} onError={()=>setPErr(true)} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                          :<div style={{width:"100%",height:"100%",background:ac.bg,color:ac.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",fontWeight:700}}>{getInit(e?.first,e?.last)}</div>
                        }
                      </div>
                      {/* Infos */}
                      <div style={{flex:1}}>
                        <div style={{fontSize:"18px",fontWeight:800,color:"#1B3A52",marginBottom:"3px"}}>{e?.first} {e?.last}</div>
                        <div style={{fontSize:"13px",color:"#6A6D70",marginBottom:"8px"}}>{e?.role} {e?.department?`· ${e.department}`:""}</div>
                        <div style={{display:"flex",gap:"20px",flexWrap:"wrap"}}>
                          {[
                            {l:"Matricule",v:e?.matricule,mono:true},
                            {l:"Contrat",v:e?.contract},
                            {l:"Banque",v:e?.bank},
                          ].map(item=>(
                            <div key={item.l}>
                              <div style={{fontSize:"9px",color:"#BDBDBD",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"1px"}}>{item.l}</div>
                              <div style={{fontSize:"12px",fontWeight:600,color:"#32363A",fontFamily:item.mono?"monospace":"inherit"}}>{item.v||"—"}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Status badge */}
                      <div style={{textAlign:"right"}}>
                        <Badge s={selB.status}/>
                        {selB.paidOn&&<div style={{fontSize:"11px",color:"#89898B",marginTop:"6px"}}>Payé le {fmtD(selB.paidOn)}</div>}
                      </div>
                    </div>

                    {/* Tableau de paie */}
                    <div style={{padding:"20px 28px",background:"white"}}>
                      <table style={{width:"100%",borderCollapse:"collapse",marginBottom:"0",borderRadius:"8px",overflow:"hidden",border:"1px solid #EBEBEB"}}>
                        <thead>
                          <tr style={{background:"#1B3A52"}}>
                            <th style={{padding:"12px 18px",textAlign:"left",fontSize:"11px",fontWeight:700,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:"0.5px"}}>Libellé</th>
                            <th style={{padding:"12px 18px",textAlign:"center",fontSize:"11px",fontWeight:700,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:"0.5px"}}>Type</th>
                            <th style={{padding:"12px 18px",textAlign:"right",fontSize:"11px",fontWeight:700,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:"0.5px"}}>Montant (FCFA)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{borderBottom:"1px solid #EBEBEB",background:"white"}}>
                            <td style={{padding:"14px 18px"}}>
                              <div style={{fontSize:"13px",fontWeight:600,color:"#32363A"}}>Salaire de base</div>
                              <div style={{fontSize:"11px",color:"#89898B",marginTop:"2px"}}>Rémunération mensuelle contractuelle</div>
                            </td>
                            <td style={{padding:"14px 18px",textAlign:"center"}}>
                              <span style={{padding:"3px 10px",borderRadius:"20px",background:"#E8F3FF",color:"#0070F2",fontSize:"11px",fontWeight:600}}>Base</span>
                            </td>
                            <td style={{padding:"14px 18px",textAlign:"right",fontSize:"15px",fontWeight:700,color:"#32363A"}}>{fmtN(selB.base)}</td>
                          </tr>
                          {selB.bonus>0&&(
                            <tr style={{borderBottom:"1px solid #EBEBEB",background:"#FAFAFA"}}>
                              <td style={{padding:"14px 18px"}}>
                                <div style={{fontSize:"13px",fontWeight:600,color:"#107E3E"}}>Primes & Bonus</div>
                                <div style={{fontSize:"11px",color:"#89898B",marginTop:"2px"}}>Prime mensuelle</div>
                              </td>
                              <td style={{padding:"14px 18px",textAlign:"center"}}>
                                <span style={{padding:"3px 10px",borderRadius:"20px",background:"#F1F8F1",color:"#107E3E",fontSize:"11px",fontWeight:600}}>Prime</span>
                              </td>
                              <td style={{padding:"14px 18px",textAlign:"right",fontSize:"15px",fontWeight:700,color:"#107E3E"}}>+ {fmtN(selB.bonus)}</td>
                            </tr>
                          )}
                          {selB.benefits>0&&(
                            <tr style={{borderBottom:"1px solid #EBEBEB",background:"white"}}>
                              <td style={{padding:"14px 18px"}}>
                                <div style={{fontSize:"13px",fontWeight:600,color:"#6B00A4"}}>Avantages en nature</div>
                                <div style={{fontSize:"11px",color:"#89898B",marginTop:"2px"}}>Transport, restauration, etc.</div>
                              </td>
                              <td style={{padding:"14px 18px",textAlign:"center"}}>
                                <span style={{padding:"3px 10px",borderRadius:"20px",background:"#FFDEFF",color:"#6B00A4",fontSize:"11px",fontWeight:600}}>Avantage</span>
                              </td>
                              <td style={{padding:"14px 18px",textAlign:"right",fontSize:"15px",fontWeight:700,color:"#6B00A4"}}>+ {fmtN(selB.benefits)}</td>
                            </tr>
                          )}
                          {/* Ligne BRUT */}
                          <tr style={{background:"#F1F8F1",borderTop:"2px solid #107E3E"}}>
                            <td style={{padding:"14px 18px"}}>
                              <div style={{fontSize:"14px",fontWeight:700,color:"#107E3E"}}>SALAIRE BRUT</div>
                            </td>
                            <td/>
                            <td style={{padding:"14px 18px",textAlign:"right",fontSize:"16px",fontWeight:800,color:"#107E3E"}}>{fmtN(selB.gross)}</td>
                          </tr>
                          {selB.deductions>0&&(
                            <tr style={{background:"#FFF0F0",borderTop:"1px solid #BB0000"}}>
                              <td style={{padding:"14px 18px"}}>
                                <div style={{fontSize:"13px",fontWeight:600,color:"#BB0000"}}>Retenues & Déductions</div>
                              </td>
                              <td style={{padding:"14px 18px",textAlign:"center"}}>
                                <span style={{padding:"3px 10px",borderRadius:"20px",background:"#FFF0F0",color:"#BB0000",fontSize:"11px",fontWeight:600}}>Retenue</span>
                              </td>
                              <td style={{padding:"14px 18px",textAlign:"right",fontSize:"15px",fontWeight:700,color:"#BB0000"}}>- {fmtN(selB.deductions)}</td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot>
                          <tr style={{background:"linear-gradient(135deg,#0070F2,#0057B8)"}}>
                            <td style={{padding:"16px 18px"}}>
                              <div style={{fontSize:"16px",fontWeight:800,color:"white",letterSpacing:"0.3px"}}>NET À PAYER</div>
                              <div style={{fontSize:"11px",color:"rgba(255,255,255,0.6)",marginTop:"2px"}}>Mode: {selB.payMethod}</div>
                            </td>
                            <td/>
                            <td style={{padding:"16px 18px",textAlign:"right"}}>
                              <div style={{fontSize:"26px",fontWeight:900,color:"white",letterSpacing:"-0.5px"}}>{fmtN(selB.net)}</div>
                              <div style={{fontSize:"12px",color:"rgba(255,255,255,0.7)",marginTop:"1px"}}>FCFA</div>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Signatures */}
                    <div style={{padding:"16px 28px 20px",background:"#FAFAFA",borderTop:"1px solid #EBEBEB"}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"20px",marginBottom:"16px"}}>
                        {[
                          {l:"Salaire brut",v:`${fmtN(selB.gross)} FCFA`},
                          {l:"Déductions",v:selB.deductions?`- ${fmtN(selB.deductions)} FCFA`:"Aucune"},
                          {l:"Net versé",v:`${fmtN(selB.net)} FCFA`,bold:true},
                        ].map(item=>(
                          <div key={item.l} style={{textAlign:"center",padding:"10px",background:"white",borderRadius:"6px",border:"1px solid #EBEBEB"}}>
                            <div style={{fontSize:"10px",color:"#89898B",textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:"4px"}}>{item.l}</div>
                            <div style={{fontSize:item.bold?"15px":"13px",fontWeight:item.bold?800:600,color:item.bold?"#0070F2":"#32363A"}}>{item.v}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"32px",paddingTop:"12px",borderTop:"1px solid #EBEBEB"}}>
                        {["Signature & Cachet Employé","Signature Direction / DRH"].map(s=>(
                          <div key={s} style={{textAlign:"center"}}>
                            <div style={{fontSize:"10px",color:"#89898B",marginBottom:"28px",textTransform:"uppercase",letterSpacing:"0.4px"}}>{s}</div>
                            <div style={{height:"1px",background:"#D9D9D9"}}/>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{padding:"14px 28px",borderTop:"1px solid #EBEBEB",background:"white",display:"flex",gap:"8px",justifyContent:"flex-end",borderRadius:"0 0 12px 12px"}}>
                      <Btn label="Fermer" onClick={()=>setSelB(null)} variant="ghost"/>
                      <Btn label="Imprimer" icon="print" variant="secondary"/>
                      <Btn label="Télécharger PDF" icon="dl" variant="secondary"/>
                      {selB.status==="en_attente"&&<Btn label="Valider & Marquer payé" icon="chk" variant="success" onClick={()=>{validate(selB.id);setSelB(null);}}/>}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

// ===== PAIEMENTS EXTERNES =====
const ExtPayments = ({externals,payExt,setPayExt,onToast}) => {
  const [showNew,setShowNew] = useState(false);
  const pending = payExt.filter(p=>p.status==="en_attente");
  const totalPending = pending.reduce((s,p)=>s+p.net,0);
  const totalPaid = payExt.filter(p=>p.status==="paye").reduce((s,p)=>s+p.net,0);
  const validate = id => { setPayExt(p=>p.map(pe=>pe.id===id?{...pe,status:"paye",paidOn:new Date().toISOString().split("T")[0],ref:"PAY-EXT-"+Date.now().toString().slice(-6)}:pe)); onToast("Paiement effectué avec succès","success"); };

  return (
    <div className="rh-page-enter">
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"14px",marginBottom:"20px"}}>
        <KpiCard title="En attente de paiement" value={`${fmtN(totalPending)} FCFA`} subtitle={`${pending.length} paiements`} color="#E76500" icon="pay" delay={0}/>
        <KpiCard title="Total versé aux techniciens" value={`${fmtN(totalPaid)} FCFA`} subtitle="Historique complet" color="#107E3E" icon="chk" delay={0.06}/>
        <KpiCard title="Techniciens actifs" value={externals.filter(e=>e.status==="actif").length} subtitle="Sur projets en cours" color="#0070F2" icon="person" delay={0.12}/>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"12px"}}>
        <Btn label="Nouveau paiement" icon="add" variant="primary" onClick={()=>setShowNew(true)}/>
      </div>
      <div className="rh-card">
        <Table
          cols={["Technicien","Projet","Phase","% Négocié","Montant net","Mode","Date","Réf.","Statut","Actions"]}
          rows={payExt.map(p=>{
            const ext=externals.find(e=>e.id===p.empId);
            const photo=PHOTOS[p.empId];
            const [pErr,setPErr]=useState(false);
            const ac=getAC(ext?.first+ext?.last);
            return [
              <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <div style={{width:"32px",height:"32px",borderRadius:"50%",overflow:"hidden",flexShrink:0,border:"2px solid white",boxShadow:"0 0 0 1px #D9D9D9"}}>
                  {photo&&!pErr
                    ?<img src={photo} onError={()=>setPErr(true)} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    :<div style={{width:"100%",height:"100%",background:ac.bg,color:ac.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:700}}>{getInit(ext?.first,ext?.last)}</div>
                  }
                </div>
                <div>
                  <div style={{fontSize:"13px",fontWeight:500}}>{ext?`${ext.first} ${ext.last}`:"—"}</div>
                  <div style={{fontSize:"11px",color:"#89898B"}}>{ext?.matricule}</div>
                </div>
              </div>,
              <strong style={{color:"#0070F2",fontSize:"12px"}}>{p.project}</strong>,
              <span style={{fontSize:"12px",color:"#89898B"}}>{p.phase}</span>,
              <span style={{padding:"2px 8px",borderRadius:"20px",background:"#F1F8F1",color:"#107E3E",fontSize:"12px",fontWeight:600}}>{p.pct}%</span>,
              <strong style={{color:"#E76500",fontSize:"14px"}}>{fmtN(p.net)} FCFA</strong>,
              <span style={{fontSize:"12px",color:"#89898B"}}>{p.payMethod}</span>,
              <span style={{fontSize:"12px",color:"#89898B"}}>{p.paidOn?fmtD(p.paidOn):"—"}</span>,
              <span style={{fontSize:"11px",fontFamily:"monospace",color:"#89898B"}}>{p.ref||"—"}</span>,
              <Badge s={p.status}/>,
              <div style={{display:"flex",gap:"4px"}}>
                {p.status==="en_attente"&&<Btn label="Payer" onClick={()=>validate(p.id)} variant="success" sm/>}
                <Btn icon="print" variant="ghost" sm/>
              </div>
            ];
          })}
        />
      </div>
    </div>
  );
};

// ===== FORMULAIRE EMPLOYÉ =====
const EmployeeForm = ({type,onClose,onSave}) => {
  const [step,setStep] = useState(1);
  const [f,setF] = useState({first:"",last:"",email:"",phone:"",gender:"",birthDate:"",cin:"",education:"",city:"",address:"",role:"",department:"",contract:"CDI",hireDate:"",salary:"",bank:"",rib:"",emergencyName:"",emergencyPhone:"",emergencyLink:"",speciality:"",dailyRate:""});
  const u = (k,v) => setF(p=>({...p,[k]:v}));
  const isInt = type==="internal";
  const steps = isInt?["Identité & Contact","Poste & Contrat","Banque & Urgence"]:["Identité","Spécialité & Taux","Coordonnées bancaires"];

  const save = () => {
    if(!f.first||!f.last) return;
    onSave({
      id:`${isInt?"EI":"EE"}${Date.now()}`,
      first:f.first,last:f.last,email:f.email,phone:f.phone,gender:f.gender,
      birthDate:f.birthDate,birthPlace:f.city,nationality:"Camerounaise",
      cin:f.cin,education:f.education,city:f.city,address:f.address,
      role:f.role,bank:f.bank,rib:f.rib,
      matricule:`CLN-${isInt?"INT":"EXT"}-${String(Math.floor(Math.random()*900+100))}`,
      status:"actif",emergencyName:f.emergencyName,emergencyPhone:f.emergencyPhone,emergencyLink:f.emergencyLink,
      docs:[],history:[{type:"Embauche",date:new Date().toLocaleDateString("fr-FR"),detail:`Recrutement ${f.contract||"Freelance"} - ${f.role}`,by:"RH"}],
      ...(isInt?{department:f.department,contract:f.contract,hireDate:f.hireDate,salary:Number(f.salary)||0}
            :{speciality:f.speciality,dailyRate:Number(f.dailyRate)||0,contract:"Freelance",projects:[],totalEarned:0,rating:0,projectCount:0}),
    });
    onClose();
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(13,43,64,0.55)",backdropFilter:"blur(3px)"}}/>
      <div className="rh-modal rh-card" style={{position:"relative",width:"100%",maxWidth:"620px",borderRadius:"8px",boxShadow:"0 16px 64px rgba(0,0,0,0.25)"}}>
        <div style={{padding:"14px 20px",background:"#1B3A52",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h3 style={{margin:0,fontSize:"15px",fontWeight:700,color:"white"}}>{isInt?"Nouvel employé interne":"Nouveau technicien externe"}</h3>
          <Btn icon="close" onClick={onClose} variant="ghost" sm/>
        </div>
        <div style={{padding:"20px 24px"}}>
          {/* Stepper */}
          <div className="rh-stepper">
            {steps.map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",flex:i<steps.length-1?1:"auto"}}>
                <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                  <div className={`rh-step-circle ${step>i+1?"done":step===i+1?"active":"pending"}`}>
                    {step>i+1?<Ico n="chk" s={13} c="white"/>:i+1}
                  </div>
                  <span className="rh-step-label" style={{color:step===i+1?"#0070F2":step>i+1?"#107E3E":"#89898B",fontWeight:step===i+1?600:400}}>{s}</span>
                </div>
                {i<steps.length-1&&<div className="rh-step-line" style={{background:step>i+1?"#107E3E":"#EBEBEB"}}/>}
              </div>
            ))}
          </div>

          {step===1&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",animation:"fadeUp 0.25s ease both"}}>
              <Fld label="Prénom" required><input value={f.first} onChange={e=>u("first",e.target.value)} placeholder="Prénom" className="rh-input"/></Fld>
              <Fld label="Nom" required><input value={f.last} onChange={e=>u("last",e.target.value)} placeholder="Nom de famille" className="rh-input"/></Fld>
              <Fld label="Genre"><select value={f.gender} onChange={e=>u("gender",e.target.value)} className="rh-select"><option value="">Genre...</option><option value="M">Masculin</option><option value="F">Féminin</option></select></Fld>
              <Fld label="Date de naissance"><input type="date" value={f.birthDate} onChange={e=>u("birthDate",e.target.value)} className="rh-input"/></Fld>
              <Fld label="N° CIN / Passeport"><input value={f.cin} onChange={e=>u("cin",e.target.value)} placeholder="Ex: 12345678" className="rh-input"/></Fld>
              <Fld label="Téléphone" required><input value={f.phone} onChange={e=>u("phone",e.target.value)} placeholder="+237 6XX XXX XXX" className="rh-input"/></Fld>
              {isInt&&<Fld label="Email"><input type="email" value={f.email} onChange={e=>u("email",e.target.value)} placeholder="prenom.nom@cleanit.cm" className="rh-input"/></Fld>}
              <Fld label="Niveau études"><select value={f.education} onChange={e=>u("education",e.target.value)} className="rh-select"><option value="">Niveau...</option>{["BEP/CAP","Bac","BTS/DUT","Licence","Master/Ingénieur","Doctorat"].map(n=><option key={n} value={n}>{n}</option>)}</select></Fld>
              <Fld label="Ville" colSpan><select value={f.city} onChange={e=>u("city",e.target.value)} className="rh-select"><option value="">Ville...</option>{["Douala","Yaoundé","Bafoussam","Garoua","Bamenda","Kribi","Limbé","Buea"].map(v=><option key={v} value={v}>{v}</option>)}</select></Fld>
            </div>
          )}
          {step===2&&isInt&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",animation:"fadeUp 0.25s ease both"}}>
              <Fld label="Poste" required><select value={f.role} onChange={e=>u("role",e.target.value)} className="rh-select"><option value="">Sélectionner...</option>{POSTES.map(p=><option key={p} value={p}>{p}</option>)}</select></Fld>
              <Fld label="Département" required><select value={f.department} onChange={e=>u("department",e.target.value)} className="rh-select"><option value="">Département...</option>{DEPTS.map(d=><option key={d} value={d}>{d}</option>)}</select></Fld>
              <Fld label="Contrat"><select value={f.contract} onChange={e=>u("contract",e.target.value)} className="rh-select">{CONTRATS.map(c=><option key={c} value={c}>{c}</option>)}</select></Fld>
              <Fld label="Date embauche" required><input type="date" value={f.hireDate} onChange={e=>u("hireDate",e.target.value)} className="rh-input"/></Fld>
              <Fld label="Salaire de base (FCFA)" required colSpan><input type="number" value={f.salary} onChange={e=>u("salary",e.target.value)} placeholder="Ex: 450 000" className="rh-input"/></Fld>
            </div>
          )}
          {step===2&&!isInt&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",animation:"fadeUp 0.25s ease both"}}>
              <Fld label="Poste" required><select value={f.role} onChange={e=>u("role",e.target.value)} className="rh-select"><option value="">Sélectionner...</option>{POSTES_EXT.map(p=><option key={p} value={p}>{p}</option>)}</select></Fld>
              <Fld label="Spécialité" required><input value={f.speciality} onChange={e=>u("speciality",e.target.value)} placeholder="Ex: 5G NR / 4G LTE" className="rh-input"/></Fld>
              <Fld label="Taux journalier (FCFA)"><input type="number" value={f.dailyRate} onChange={e=>u("dailyRate",e.target.value)} placeholder="Ex: 85 000" className="rh-input"/></Fld>
            </div>
          )}
          {step===3&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",animation:"fadeUp 0.25s ease both"}}>
              <div style={{gridColumn:"1/-1"}}><div className="rh-section-title">Coordonnées bancaires</div></div>
              <Fld label="Banque / Mobile Money" required><select value={f.bank} onChange={e=>u("bank",e.target.value)} className="rh-select"><option value="">Sélectionner...</option>{BANQUES.map(b=><option key={b} value={b}>{b}</option>)}</select></Fld>
              <Fld label="RIB / Numéro de compte" required><input value={f.rib} onChange={e=>u("rib",e.target.value)} placeholder="CM21 XXXX ou 6XX XXX XXX" className="rh-input"/></Fld>
              {isInt&&<>
                <div style={{gridColumn:"1/-1",marginTop:"8px"}}><div className="rh-section-title">Contact urgence</div></div>
                <Fld label="Nom complet"><input value={f.emergencyName} onChange={e=>u("emergencyName",e.target.value)} placeholder="Prénom Nom" className="rh-input"/></Fld>
                <Fld label="Téléphone"><input value={f.emergencyPhone} onChange={e=>u("emergencyPhone",e.target.value)} placeholder="+237 6XX XXX XXX" className="rh-input"/></Fld>
                <Fld label="Lien de parenté"><select value={f.emergencyLink} onChange={e=>u("emergencyLink",e.target.value)} className="rh-select"><option value="">Lien...</option>{["Époux/Épouse","Père","Mère","Frère","Soeur","Ami(e)","Autre"].map(l=><option key={l} value={l}>{l}</option>)}</select></Fld>
              </>}
            </div>
          )}

          <div style={{display:"flex",justifyContent:"space-between",gap:"8px",paddingTop:"20px",borderTop:"1px solid #EBEBEB",marginTop:"20px"}}>
            <Btn label="Annuler" onClick={onClose} variant="ghost"/>
            <div style={{display:"flex",gap:"8px"}}>
              {step>1&&<Btn label="← Retour" onClick={()=>setStep(s=>s-1)} variant="secondary"/>}
              {step<steps.length&&<Btn label="Suivant →" onClick={()=>setStep(s=>s+1)} variant="primary"/>}
              {step===steps.length&&<Btn label="✓ Créer le profil" onClick={save} variant="success"/>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== NAVIGATION =====
const NAV = [
  {id:"dashboard",    l:"Tableau de bord",     i:"home"},
  {id:"employees",    l:"Employés internes",    i:"group"},
  {id:"externals",    l:"Techniciens externes", i:"person"},
  {id:"leaves",       l:"Congés & Absences",    i:"cal"},
  {id:"attendance",   l:"Pointage & Présence",  i:"clock"},
  {id:"payroll",      l:"Bulletins de paie",    i:"doc"},
  {id:"ext_payments", l:"Paiements externes",   i:"pay"},
];

// ===== COMPOSANT PRINCIPAL =====
export default function RH() {
  const [tab,setTab] = useState("dashboard");
  const [employees,setEmployees] = useState(EMPLOYES);
  const [externals,setExternals] = useState(EXTERNES);
  const [bulletins,setBulletins] = useState(BULLETINS);
  const [payExt,setPayExt] = useState(PAI_EXT);
  const [selEmp,setSelEmp] = useState(null);
  const [selType,setSelType] = useState(null);
  const [showAddEmp,setShowAddEmp] = useState(false);
  const [showAddExt,setShowAddExt] = useState(false);
  const [toast,setToast] = useState(null);

  const pendingB = bulletins.filter(b=>b.status==="en_attente").length;
  const pendingP = payExt.filter(p=>p.status==="en_attente").length;
  const onToast = (msg,type="success") => setToast({msg,type});

  return (
    <div className="rh-app" style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>

      {/* SHELL BAR */}
      <div className="rh-shell">
        <div style={{display:"flex",alignItems:"center",gap:"10px",marginRight:"16px"}}>
          <div style={{width:"30px",height:"30px",background:"#0070F2",borderRadius:"6px",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,112,242,0.4)"}}>
            <Ico n="group" s={16} c="white"/>
          </div>
          <div>
            <div style={{fontSize:"14px",fontWeight:700,color:"white",letterSpacing:"0.3px"}}>CLEAN<span style={{color:"#4da6ff"}}>IT</span> <span style={{fontWeight:300,opacity:0.7,fontSize:"12px"}}>People & HR</span></div>
          </div>
        </div>

        <div style={{flex:1}}/>

        {/* Search */}
        <div style={{display:"flex",alignItems:"center",gap:"8px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"6px",padding:"6px 12px",width:"220px",transition:"all 0.2s"}}
          onFocus={e=>e.currentTarget.style.background="rgba(255,255,255,0.14)"}
          onBlur={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"}>
          <Ico n="srch" s={13} c="rgba(255,255,255,0.5)"/>
          <input placeholder="Rechercher..." style={{background:"transparent",border:"none",outline:"none",color:"white",fontSize:"12px",width:"100%",fontFamily:"inherit"}}/>
        </div>

        {/* Notif badge */}
        <div style={{position:"relative",cursor:"pointer"}}>
          <div style={{width:"34px",height:"34px",borderRadius:"50%",background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(255,255,255,0.15)",transition:"all 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.15)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"}>
            <Ico n="bell" s={16} c="rgba(255,255,255,0.75)"/>
          </div>
          {(pendingB+pendingP)>0&&(
            <div style={{position:"absolute",top:"-3px",right:"-3px",width:"18px",height:"18px",borderRadius:"50%",background:"#E76500",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",fontWeight:700,color:"white",border:"2px solid #1B3A52",animation:"pulse 2s infinite"}}>
              {pendingB+pendingP}
            </div>
          )}
        </div>

        {/* Settings */}
        <div style={{width:"34px",height:"34px",borderRadius:"50%",background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(255,255,255,0.15)",cursor:"pointer",transition:"all 0.2s"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.15)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"}>
          <Ico n="set" s={15} c="rgba(255,255,255,0.7)"/>
        </div>

        {/* User */}
        <div style={{display:"flex",alignItems:"center",gap:"8px",cursor:"pointer",padding:"4px 8px",borderRadius:"6px",transition:"background 0.15s"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <div style={{width:"32px",height:"32px",borderRadius:"50%",background:"#0070F2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:700,color:"white",boxShadow:"0 2px 8px rgba(0,112,242,0.4)"}}>AB</div>
          <div>
            <div style={{fontSize:"11px",fontWeight:600,color:"rgba(255,255,255,0.9)",lineHeight:1.3}}>Aline Biya</div>
            <div style={{fontSize:"9px",color:"rgba(255,255,255,0.45)",lineHeight:1.3}}>RH Manager</div>
          </div>
        </div>
      </div>

      {/* TAB BAR */}
      <div className="rh-tab-nav">
        {NAV.map(t=>{
          const isActive=tab===t.id;
          const hasAlert=(t.id==="payroll"&&pendingB>0)||(t.id==="ext_payments"&&pendingP>0);
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} className={`rh-tab-btn${isActive?" active":""}`}>
              <Ico n={t.i} s={14} c={isActive?"#0070F2":"#89898B"}/>
              {t.l}
              {hasAlert&&<span className="tab-alert"/>}
            </button>
          );
        })}
        {/* Actions contextuelles */}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:"8px",paddingRight:"8px"}}>
          {tab==="employees"&&<Btn label="+ Nouvel employé" icon="add" variant="primary" sm onClick={()=>setShowAddEmp(true)}/>}
          {tab==="externals"&&<Btn label="+ Nouveau technicien" icon="add" variant="primary" sm onClick={()=>setShowAddExt(true)}/>}
          {tab==="payroll"&&<Btn label="Générer la paie" icon="doc" variant="secondary" sm/>}
          {tab==="ext_payments"&&<Btn label="Nouveau paiement" icon="add" variant="primary" sm/>}
        </div>
      </div>

      {/* CONTENU */}
      <div style={{flex:1,maxWidth:"1440px",margin:"0 auto",padding:"20px 24px",width:"100%"}}>
        {tab==="dashboard"&&<Dashboard employees={employees} externals={externals} bulletins={bulletins} payExt={payExt} setTab={setTab}/>}
        {tab==="employees"&&<EmployeeList employees={employees} type="internal" onSelect={e=>{setSelEmp(e);setSelType("internal");}} onAdd={()=>setShowAddEmp(true)}/>}
        {tab==="externals"&&<EmployeeList employees={externals} type="external" onSelect={e=>{setSelEmp(e);setSelType("external");}} onAdd={()=>setShowAddExt(true)}/>}
        {tab==="leaves"&&<Leaves/>}
        {tab==="attendance"&&<Attendance employees={employees}/>}
        {tab==="payroll"&&<Payroll employees={employees} bulletins={bulletins} setBulletins={setBulletins} onToast={onToast}/>}
        {tab==="ext_payments"&&<ExtPayments externals={externals} payExt={payExt} setPayExt={setPayExt} onToast={onToast}/>}
      </div>

      {/* PANEL PROFIL */}
      {selEmp&&(
        <EmployeeProfile
          employee={selEmp}
          isExt={selType==="external"}
          bulletins={bulletins}
          onClose={()=>setSelEmp(null)}
          onToast={onToast}
        />
      )}

      {/* MODALS AJOUT */}
      {showAddEmp&&<EmployeeForm type="internal" onClose={()=>setShowAddEmp(false)} onSave={e=>{setEmployees(p=>[e,...p]);onToast("Employé créé avec succès","success");}}/>}
      {showAddExt&&<EmployeeForm type="external" onClose={()=>setShowAddExt(false)} onSave={e=>{setExternals(p=>[e,...p]);onToast("Technicien créé avec succès","success");}}/>}

      {/* TOAST */}
      {toast&&<Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </div>
  );
}
