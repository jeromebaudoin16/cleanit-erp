import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ================================================================
//  CLEANITBOOKS — MODULE 1 : JOB CENTER
//  Structure exacte QuickBooks Enterprise
//  Navigation horizontale comme les autres modules
// ================================================================

const C = {
  green:    '#2CA01C',
  green_l:  '#EBF9E8',
  green_d:  '#1E8A10',
  blue:     '#0077C5',
  blue_l:   '#E5F2FC',
  red:      '#D52B1E',
  red_l:    '#FDECEA',
  orange:   '#E27000',
  orange_l: '#FEF3E2',
  purple:   '#6B3FA0',
  purple_l: '#F3EEF9',
  gray:     '#6B7280',
  gray_l:   '#F9FAFB',
  text:     '#111827',
  text2:    '#374151',
  text3:    '#6B7280',
  text4:    '#9CA3AF',
  border:   '#E5E7EB',
  border2:  '#F3F4F6',
  bg:       '#F9FAFB',
  white:    '#FFFFFF',
};

const TVA  = 0.1925;
const FX   = { FCFA:1, USD:610, EUR:660, CNY:84 };
const TODAY = new Date().toISOString().split("T")[0];

const fN = n => new Intl.NumberFormat("fr-FR").format(Math.round(n||0));
const fM = n => {
  const a = Math.abs(n||0);
  if(a>=1e9) return (n/1e9).toFixed(2)+"Md";
  if(a>=1e6) return (n/1e6).toFixed(1)+"M";
  if(a>=1e3) return (n/1e3).toFixed(0)+"K";
  return String(Math.round(n||0));
};
const fD  = d => d ? new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const fD2 = d => d ? new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"}) : "—";
const toF = (m,d) => (m||0)*(FX[d]||1);

// ===== ICONES =====
const ICONS = {
  job:      "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
  plus:     "M12 5v14 M5 12h14",
  search:   "M21 21l-4.35-4.35 M17 11A6 6 0 115 11a6 6 0 0112 0z",
  close:    "M18 6L6 18 M6 6l12 12",
  check:    "M20 6L9 17l-5-5",
  edit:     "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  del:      "M3 6h18 M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2",
  invoice:  "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8",
  bill:     "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6",
  time:     "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 6v6l4 2",
  money:    "M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  chart:    "M18 20V10 M12 20V4 M6 20v-6",
  lock:     "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4",
  info:     "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 16v-4 M12 8h.01",
  alert:    "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  print:    "M6 9V2h12v7 M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2 M6 14h12v8H6z",
  chevr:    "M9 18l6-6-6-6",
  chevd:    "M6 9l6 6 6-6",
  filter:   "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  calendar: "M8 2v4 M16 2v4 M3 10h18 M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  user:     "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  bc:       "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2",
  terrain:  "M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z",
  note:     "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  phase:    "M22 12h-4l-3 9L9 3l-3 9H2",
  cost:     "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  profit:   "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
};

const Ico = ({n,s=16,c="currentColor"}) => {
  const d = ICONS[n];
  if(!d) return null;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke={c} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      style={{display:"block",flexShrink:0}}>
      {d.split(" M ").map((seg,i)=>(
        <path key={i} d={i===0?seg:"M "+seg}/>
      ))}
    </svg>
  );
};

// ===== DONNEES =====
const CUSTOMERS = [
  {id:"C001",name:"MTN Cameroun",        type:"Telecom",    city:"Douala",   currency:"FCFA"},
  {id:"C002",name:"Orange Cameroun",     type:"Telecom",    city:"Yaounde",  currency:"FCFA"},
  {id:"C003",name:"Huawei Technologies", type:"OEM",        city:"Douala",   currency:"USD"},
  {id:"C004",name:"Gouvernement",        type:"Public",     city:"Yaounde",  currency:"FCFA"},
  {id:"C005",name:"CAMTEL",              type:"Telecom",    city:"Yaounde",  currency:"FCFA"},
  {id:"C006",name:"Nexttel Cameroun",    type:"Telecom",    city:"Douala",   currency:"FCFA"},
];

const JOB_TYPES   = ["Telecom Installation","Maintenance","Infrastructure","Fibre Optique","Survey RF","Configuration","Audit Reseau","Autre"];
const JOB_STATUTS = ["Pending","Awarded","In Progress","Closed","Not Awarded"];
const COST_CATS   = [
  {key:"labor",        label:"Main oeuvre",    icon:"user",    color:C.blue},
  {key:"materials",    label:"Materiaux",       icon:"bill",    color:C.orange},
  {key:"subcontract",  label:"Sous-traitants",  icon:"user",    color:C.purple},
  {key:"equipment",    label:"Equipements",     icon:"job",     color:C.green},
  {key:"overhead",     label:"Frais generaux",  icon:"chart",   color:C.gray},
];

const INIT_JOBS = [
  {
    id:"JOB-001",
    name:"Installation 5G NR DLA-001",
    customerId:"C001",
    bcRef:"BC-HW-2024-143",
    jobType:"Telecom Installation",
    statut:"In Progress",
    description:"Deploiement complet station 5G NR sur le site Akwa Douala. Installation BBU 5900, 3 RRU 5258 4T4R, cablage alimentation DC, configuration parametres reseau et tests end-to-end. Supervision Huawei Technologies.",
    startDate:"2024-01-15",
    endDate:"2024-06-30",
    chefProjet:"Marie Kamga",
    site:"DLA-001",
    currency:"FCFA",
    // Prix Huawei - CONFIDENTIEL
    budgetHuawei:180000000,
    // Prix negocie CleanIT
    contractAmount:165000000,
    // Budget estime par poste de cout
    budgetEstime:{
      labor:      12000000,
      materials:  30000000,
      subcontract: 5000000,
      equipment:   2000000,
      overhead:    3000000,
    },
    // Phases de facturation
    phases:[
      {id:"PH1",name:"Phase 1 — Mobilisation et preparation",pct:30,amount:49500000,statut:"invoiced",invoiceRef:"INV-2024-001",datePrevue:"2024-01-20",datePaiement:"2024-01-25"},
      {id:"PH2",name:"Phase 2 — Installation et travaux",pct:40,amount:66000000,statut:"pending",invoiceRef:null,datePrevue:"2024-04-01",datePaiement:null},
      {id:"PH3",name:"Phase 3 — Tests et reception",pct:30,amount:49500000,statut:"pending",invoiceRef:null,datePrevue:"2024-06-30",datePaiement:null},
    ],
    // Lignes BC Huawei detaillees - CONFIDENTIEL
    lignesBC:[
      {desc:"BBU 5900 5G NR",qte:2,pu:25000000,total:50000000},
      {desc:"RRU 5258 4T4R",qte:6,pu:8500000,total:51000000},
      {desc:"Installation et configuration",qte:1,pu:35000000,total:35000000},
      {desc:"Engineering services supervision",qte:1,pu:44000000,total:44000000},
    ],
    // Couts reels engages
    coutsReels:{
      labor:      8500000,
      materials:  22000000,
      subcontract: 2000000,
      equipment:   1200000,
      overhead:    1800000,
    },
    // Factures emises
    invoices:[
      {id:"INV-2024-001",date:"2024-01-15",amount:49500000,balance:0,statut:"Paid"},
    ],
    // Bills fournisseurs lies
    bills:[
      {id:"BILL-2024-001",vendor:"Huawei Technologies",date:"2024-01-15",amount:101000000,statut:"Partial"},
      {id:"BILL-2024-003",vendor:"Total Energies",date:"2024-01-31",amount:850000,statut:"Paid"},
    ],
    // Heures enregistrees
    timeEntries:[
      {emp:"Marie Kamga",date:"2024-03-15",service:"Chef de Projet",hours:8,rate:53125,billable:true},
      {emp:"Jean Fouda",date:"2024-03-15",service:"PM Terrain",hours:8,rate:46875,billable:true},
      {emp:"Pierre Etoga",date:"2024-03-16",service:"Ingenieur Reseau",hours:10,rate:56250,billable:true},
    ],
    notes:"Job cree depuis BC Huawei. Prix Huawei confidentiel - PM ne voit pas les montants Huawei. Negociation equipe technique en cours pour Phase 2.",
    dateCreation:"2024-01-08",
  },
  {
    id:"JOB-002",
    name:"Maintenance 4G LTE YDE-001",
    customerId:"C002",
    bcRef:"BC-HW-2024-141",
    jobType:"Maintenance",
    statut:"Closed",
    description:"Maintenance corrective et preventive reseau 4G LTE Yaounde. Remplacement antennes defectueuses, optimisation parametres radio, mise a jour firmware equipements.",
    startDate:"2024-02-01",
    endDate:"2024-02-28",
    chefProjet:"Jean Fouda",
    site:"YDE-001",
    currency:"FCFA",
    budgetHuawei:45000000,
    contractAmount:38000000,
    budgetEstime:{
      labor:6000000,materials:12000000,subcontract:2000000,equipment:500000,overhead:1500000,
    },
    phases:[
      {id:"PH1",name:"Paiement unique",pct:100,amount:38000000,statut:"invoiced",invoiceRef:"INV-2024-002",datePrevue:"2024-02-28",datePaiement:"2024-03-05"},
    ],
    lignesBC:[
      {desc:"Survey RF et audit reseau",qte:1,pu:15000000,total:15000000},
      {desc:"Remplacement antennes 4G LTE x12",qte:12,pu:1500000,total:18000000},
      {desc:"Optimisation parametres",qte:1,pu:12000000,total:12000000},
    ],
    coutsReels:{
      labor:5200000,materials:10500000,subcontract:1800000,equipment:400000,overhead:1300000,
    },
    invoices:[
      {id:"INV-2024-002",date:"2024-02-01",amount:38000000,balance:0,statut:"Paid"},
    ],
    bills:[
      {id:"BILL-2024-002",vendor:"Nokia Networks",date:"2024-02-01",amount:9232000,statut:"Unpaid"},
    ],
    timeEntries:[
      {emp:"Jean Fouda",date:"2024-02-15",service:"PM Terrain",hours:8,rate:46875,billable:true},
      {emp:"Samuel Djomo",date:"2024-02-16",service:"Technicien",hours:10,rate:35000,billable:true},
    ],
    notes:"Job cloture. Toutes les phases facturees et payees.",
    dateCreation:"2024-01-20",
  },
  {
    id:"JOB-003",
    name:"Infrastructure Telecom GAR-001",
    customerId:"C004",
    bcRef:"BC-HW-2024-139",
    jobType:"Infrastructure",
    statut:"In Progress",
    description:"Deploiement infrastructure telecom zones rurales Garoua. Construction pylone 45m, installation equipements 3G/4G, raccordement electrique et fibre optique backbone.",
    startDate:"2024-03-08",
    endDate:"2024-04-30",
    chefProjet:"Pierre Etoga",
    site:"GAR-001",
    currency:"FCFA",
    budgetHuawei:35000000,
    contractAmount:29000000,
    budgetEstime:{
      labor:7000000,materials:8000000,subcontract:3000000,equipment:1000000,overhead:2000000,
    },
    phases:[
      {id:"PH1",name:"Acompte 30%",pct:30,amount:8700000,statut:"invoiced",invoiceRef:"INV-2024-004",datePrevue:"2024-03-10",datePaiement:"2024-03-15"},
      {id:"PH2",name:"Solde 70%",pct:70,amount:20300000,statut:"pending",invoiceRef:null,datePrevue:"2024-04-30",datePaiement:null},
    ],
    lignesBC:[
      {desc:"Inspection HSE pylone",qte:1,pu:15000000,total:15000000},
      {desc:"Mise aux normes securite",qte:1,pu:12000000,total:12000000},
      {desc:"Rapport conformite",qte:1,pu:8000000,total:8000000},
    ],
    coutsReels:{
      labor:4200000,materials:5100000,subcontract:1500000,equipment:600000,overhead:1200000,
    },
    invoices:[
      {id:"INV-2024-004",date:"2024-02-01",amount:8700000,balance:0,statut:"Paid"},
    ],
    bills:[
      {id:"BILL-2024-005",vendor:"Ericsson Cameroun",date:"2024-02-20",amount:5610000,statut:"Paid"},
      {id:"BILL-2024-006",vendor:"Per diem techniciens",date:"2024-02-25",amount:1800000,statut:"Paid"},
    ],
    timeEntries:[
      {emp:"Pierre Etoga",date:"2024-03-16",service:"Ingenieur Reseau",hours:10,rate:56250,billable:true},
      {emp:"Ali Moussa",date:"2024-03-17",service:"Technicien HSE",hours:8,rate:37500,billable:true},
    ],
    notes:"Acompte recu du Gouvernement. Travaux en cours sur site GAR-001.",
    dateCreation:"2024-03-01",
  },
  {
    id:"JOB-004",
    name:"Fibre Optique BFN-001",
    customerId:"C005",
    bcRef:"BC-HW-2024-148",
    jobType:"Fibre Optique",
    statut:"Awarded",
    description:"Deploiement reseau fibre optique FTTH 50km Bafoussam Nord. Genie civil (tranchees et fourreaux), pose cable G657A2, raccordements, boitiers epissure et tests optiques.",
    startDate:"2024-03-10",
    endDate:"2024-08-31",
    chefProjet:"Marie Kamga",
    site:"BFN-001",
    currency:"FCFA",
    budgetHuawei:220000000,
    contractAmount:195000000,
    budgetEstime:{
      labor:20000000,materials:80000000,subcontract:15000000,equipment:5000000,overhead:8000000,
    },
    phases:[
      {id:"PH1",name:"Phase 1 — Genie civil",pct:35,amount:68250000,statut:"pending",invoiceRef:null,datePrevue:"2024-05-01",datePaiement:null},
      {id:"PH2",name:"Phase 2 — Tirage cable",pct:40,amount:78000000,statut:"pending",invoiceRef:null,datePrevue:"2024-07-01",datePaiement:null},
      {id:"PH3",name:"Phase 3 — Raccordements",pct:25,amount:48750000,statut:"pending",invoiceRef:null,datePrevue:"2024-08-31",datePaiement:null},
    ],
    lignesBC:[
      {desc:"Cable fibre FTTH G657A2 50km",qte:50,pu:1500000,total:75000000},
      {desc:"Boitiers epissure etanche x50",qte:50,pu:200000,total:10000000},
      {desc:"Genie civil tranchees et fourreaux",qte:1,pu:85000000,total:85000000},
      {desc:"Raccordements et tests optiques",qte:1,pu:50000000,total:50000000},
    ],
    coutsReels:{
      labor:0,materials:27200000,subcontract:0,equipment:0,overhead:0,
    },
    invoices:[],
    bills:[
      {id:"BILL-2024-007",vendor:"Fournisseur Cable",date:"2024-03-15",amount:22500000,statut:"Paid"},
    ],
    timeEntries:[],
    notes:"Job attribue. Demarrage prevu debut avril. Equipe en cours de mobilisation.",
    dateCreation:"2024-03-05",
  },
  {
    id:"JOB-005",
    name:"Survey RF MAR-001",
    customerId:"C006",
    bcRef:"BC-HW-2024-149",
    jobType:"Survey RF",
    statut:"Pending",
    description:"Relevé mesures radiofréquences zones nord Maroua. Analyse couverture, optimisation paramètres, rapport technique détaillé avec recommandations.",
    startDate:"2024-04-01",
    endDate:"2024-04-30",
    chefProjet:"Jean Fouda",
    site:"MAR-001",
    currency:"FCFA",
    budgetHuawei:18000000,
    contractAmount:15000000,
    budgetEstime:{
      labor:5000000,materials:2000000,subcontract:0,equipment:500000,overhead:1000000,
    },
    phases:[
      {id:"PH1",name:"Paiement unique",pct:100,amount:15000000,statut:"pending",invoiceRef:null,datePrevue:"2024-04-30",datePaiement:null},
    ],
    lignesBC:[
      {desc:"Survey RF zones nord",qte:1,pu:10000000,total:10000000},
      {desc:"Rapport optimisation",qte:1,pu:8000000,total:8000000},
    ],
    coutsReels:{
      labor:0,materials:0,subcontract:0,equipment:0,overhead:0,
    },
    invoices:[],
    bills:[],
    timeEntries:[],
    notes:"En attente validation BC Huawei. Aucun technicien disponible dans rayon 50km.",
    dateCreation:"2024-03-15",
  },
];

// ===== COMPOSANTS UI =====

// Badge statut
const StatutBadge = ({statut}) => {
  const cfg = {
    "In Progress": {l:"En cours",    c:C.blue,   bg:C.blue_l},
    "Closed":      {l:"Cloture",     c:C.gray,   bg:C.border2},
    "Awarded":     {l:"Attribue",    c:C.purple, bg:C.purple_l},
    "Pending":     {l:"En attente",  c:C.orange, bg:C.orange_l},
    "Not Awarded": {l:"Non retenu",  c:C.gray,   bg:C.border2},
    "invoiced":    {l:"Facture",     c:C.green,  bg:C.green_l},
    "pending":     {l:"En attente",  c:C.orange, bg:C.orange_l},
    "Paid":        {l:"Paye",        c:C.green,  bg:C.green_l},
    "Partial":     {l:"Partiel",     c:C.orange, bg:C.orange_l},
    "Unpaid":      {l:"Non paye",    c:C.red,    bg:C.red_l},
  }[statut]||{l:statut,c:C.gray,bg:C.border2};
  return(
    <span style={{
      display:"inline-flex",alignItems:"center",gap:4,
      padding:"3px 10px",borderRadius:20,
      background:cfg.bg,color:cfg.c,
      fontSize:11,fontWeight:600,whiteSpace:"nowrap",
    }}>
      <span style={{width:5,height:5,borderRadius:"50%",background:cfg.c,flexShrink:0}}/>
      {cfg.l}
    </span>
  );
};

// Bouton
const Btn = ({label,onClick,variant="default",icon,sm,full,disabled}) => {
  const s = {
    primary: {bg:C.green,   c:"white", border:"none"},
    danger:  {bg:C.red,     c:"white", border:"none"},
    blue:    {bg:C.blue,    c:"white", border:"none"},
    default: {bg:C.white,   c:C.text2, border:"1px solid "+C.border},
    ghost:   {bg:"transparent",c:C.blue,border:"1px solid "+C.blue},
    light:   {bg:C.bg,      c:C.text2, border:"1px solid "+C.border},
  }[variant]||{bg:C.white,c:C.text2,border:"1px solid "+C.border};
  return(
    <button onClick={onClick} disabled={disabled}
      style={{
        display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,
        padding:sm?"5px 12px":"8px 18px",
        borderRadius:4,border:s.border,
        background:disabled?"#E5E7EB":s.bg,
        color:disabled?C.text4:s.c,
        fontWeight:600,fontSize:sm?12:13,
        cursor:disabled?"not-allowed":"pointer",
        fontFamily:"inherit",width:full?"100%":"auto",
        transition:"opacity .12s",flexShrink:0,
      }}
      onMouseEnter={e=>{if(!disabled)e.currentTarget.style.opacity=".85"}}
      onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
      {icon&&<Ico n={icon} s={sm?12:14} c={disabled?C.text4:s.c}/>}
      {label}
    </button>
  );
};

// Input
const Inp = ({type="text",value,onChange,placeholder,disabled,prefix,suffix,small,min,max}) => (
  <div style={{position:"relative",display:"flex",alignItems:"center"}}>
    {prefix&&<span style={{position:"absolute",left:9,fontSize:13,color:C.text3,pointerEvents:"none",zIndex:1}}>{prefix}</span>}
    <input
      type={type} value={value}
      onChange={e=>onChange(e.target.value)}
      placeholder={placeholder||""} disabled={disabled} min={min} max={max}
      style={{
        width:"100%",
        padding:small?"5px 9px":"9px 12px",
        paddingLeft:prefix?28:small?9:12,
        paddingRight:suffix?28:small?9:12,
        borderRadius:4,border:"1px solid "+C.border,
        fontSize:small?12:13,color:disabled?C.text4:C.text,
        background:disabled?C.bg:C.white,
        boxSizing:"border-box",outline:"none",fontFamily:"inherit",
        transition:"border-color .15s",
      }}
      onFocus={e=>e.target.style.borderColor=C.blue}
      onBlur={e=>e.target.style.borderColor=C.border}
    />
    {suffix&&<span style={{position:"absolute",right:9,fontSize:12,color:C.text3,pointerEvents:"none"}}>{suffix}</span>}
  </div>
);

// Select
const Sel = ({value,onChange,options,placeholder,small,disabled}) => (
  <select
    value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
    style={{
      width:"100%",padding:small?"5px 9px":"9px 12px",
      borderRadius:4,border:"1px solid "+C.border,
      fontSize:small?12:13,color:value?C.text:C.text4,
      background:disabled?C.bg:C.white,
      cursor:disabled?"not-allowed":"pointer",
      outline:"none",fontFamily:"inherit",transition:"border-color .15s",
    }}
    onFocus={e=>e.target.style.borderColor=C.blue}
    onBlur={e=>e.target.style.borderColor=C.border}>
    {placeholder&&<option value="">{placeholder}</option>}
    {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
  </select>
);

// Textarea
const Txt = ({value,onChange,placeholder,rows=3}) => (
  <textarea
    value={value} onChange={e=>onChange(e.target.value)}
    placeholder={placeholder} rows={rows}
    style={{
      width:"100%",padding:"9px 12px",borderRadius:4,
      border:"1px solid "+C.border,fontSize:13,color:C.text,
      background:C.white,resize:"vertical",
      boxSizing:"border-box",outline:"none",fontFamily:"inherit",
      transition:"border-color .15s",
    }}
    onFocus={e=>e.target.style.borderColor=C.blue}
    onBlur={e=>e.target.style.borderColor=C.border}
  />
);

// Field
const Field = ({label,children,required,span,hint}) => (
  <div style={{gridColumn:span?"1/-1":"auto"}}>
    <label style={{display:"block",fontSize:12,fontWeight:600,color:C.text3,marginBottom:4}}>
      {label}
      {required&&<span style={{color:C.red,marginLeft:2}}>*</span>}
    </label>
    {children}
    {hint&&<div style={{fontSize:11,color:C.text4,marginTop:3}}>{hint}</div>}
  </div>
);

// Barre de progression
const ProgBar = ({value,max,color=C.green,height=6,showPct=true}) => {
  const pct = max>0?Math.min(Math.round(value/max*100),100):0;
  return(
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{flex:1,height,background:C.border2,borderRadius:height/2,overflow:"hidden"}}>
        <div style={{
          height:"100%",
          width:pct+"%",
          background:pct>90?C.red:pct>70?C.orange:color,
          borderRadius:height/2,
          transition:"width .6s ease",
        }}/>
      </div>
      {showPct&&<span style={{fontSize:11,fontWeight:600,color:C.text3,minWidth:32}}>{pct}%</span>}
    </div>
  );
};

// ================================================================
//  FORMULAIRE CREATION / EDITION JOB
// ================================================================
const FormJob = ({initial,customers,onSave,onClose}) => {
  const isEdit = !!initial;

  // Infos generales
  const [name,       setName]       = useState(initial?.name||"");
  const [custId,     setCustId]     = useState(initial?.customerId||"");
  const [bcRef,      setBcRef]      = useState(initial?.bcRef||"");
  const [jobType,    setJobType]    = useState(initial?.jobType||"");
  const [statut,     setStatut]     = useState(initial?.statut||"Pending");
  const [site,       setSite]       = useState(initial?.site||"");
  const [chef,       setChef]       = useState(initial?.chefProjet||"");
  const [startDate,  setStartDate]  = useState(initial?.startDate||TODAY);
  const [endDate,    setEndDate]    = useState(initial?.endDate||"");
  const [currency,   setCurrency]   = useState(initial?.currency||"FCFA");
  const [desc,       setDesc]       = useState(initial?.description||"");
  const [notes,      setNotes]      = useState(initial?.notes||"");

  // Prix confidentiel
  const [budgetHW,   setBudgetHW]   = useState(initial?.budgetHuawei||"");
  const [contractAmt,setContractAmt]= useState(initial?.contractAmount||"");

  // Lignes BC Huawei
  const [lignesBC, setLignesBC] = useState(
    initial?.lignesBC||[{desc:"",qte:1,pu:0,total:0}]
  );

  // Budget estime par poste
  const [budgetEst, setBudgetEst] = useState(
    initial?.budgetEstime||{labor:0,materials:0,subcontract:0,equipment:0,overhead:0}
  );

  // Phases de facturation
  const [phases, setPhases] = useState(
    initial?.phases||[{id:"PH1",name:"Paiement unique",pct:100,amount:0,statut:"pending",invoiceRef:null,datePrevue:"",datePaiement:null}]
  );

  // Step courant du formulaire
  const [step, setStep] = useState(1);

  // Calculs
  const totalBC   = lignesBC.reduce((s,l)=>s+(l.qte*(l.pu||0)),0);
  const totalEst  = Object.values(budgetEst).reduce((s,v)=>s+(+v||0),0);
  const totalPhases = phases.reduce((s,p)=>s+(+p.amount||0),0);
  const pctPhases = +contractAmt>0?Math.round(totalPhases/+contractAmt*100):0;

  const updLigneBC = (i,k,v) => setLignesBC(p=>p.map((l,idx)=>{
    if(idx!==i) return l;
    const nl = {...l,[k]:k==="qte"||k==="pu"?+v:v};
    if(k==="qte"||k==="pu") nl.total = nl.qte*nl.pu;
    return nl;
  }));

  const updPhase = (i,k,v) => setPhases(p=>p.map((ph,idx)=>{
    if(idx!==i) return ph;
    const nph = {...ph,[k]:k==="pct"||k==="amount"?+v:v};
    if(k==="pct"&&+contractAmt>0) nph.amount = Math.round(+contractAmt*(+v/100));
    return nph;
  }));

  const addPhase = () => setPhases(p=>[...p,{
    id:"PH"+(p.length+1),
    name:"Phase "+(p.length+1),
    pct:0,amount:0,statut:"pending",
    invoiceRef:null,datePrevue:"",datePaiement:null,
  }]);

  const save = () => {
    if(!name||!custId){alert("Nom et client obligatoires");return;}
    const job = {
      id:initial?.id||"JOB-"+String(Date.now()).slice(-6),
      name,customerId:custId,bcRef,jobType,statut,site,chefProjet:chef,
      startDate,endDate,currency,description:desc,notes,
      budgetHuawei:+budgetHW||0,contractAmount:+contractAmt||0,
      budgetEstime:Object.fromEntries(Object.entries(budgetEst).map(([k,v])=>[k,+v||0])),
      phases,lignesBC,
      coutsReels:initial?.coutsReels||{labor:0,materials:0,subcontract:0,equipment:0,overhead:0},
      invoices:initial?.invoices||[],
      bills:initial?.bills||[],
      timeEntries:initial?.timeEntries||[],
      dateCreation:initial?.dateCreation||TODAY,
    };
    onSave(job);
    onClose();
  };

  const STEPS = [
    {n:1,label:"Informations generales"},
    {n:2,label:"BC Huawei (confidentiel)"},
    {n:3,label:"Budget estime"},
    {n:4,label:"Phases de facturation"},
    {n:5,label:"Notes"},
  ];

  return(
    <div style={{position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"30px 20px",background:"rgba(0,0,0,.45)"}}>
      <div style={{
        background:C.white,borderRadius:8,
        width:"100%",maxWidth:860,
        maxHeight:"95vh",overflow:"hidden",
        display:"flex",flexDirection:"column",
        boxShadow:"0 20px 60px rgba(0,0,0,.2)",
        animation:"fadeUp .25s ease",
      }}>
        {/* Header */}
        <div style={{padding:"16px 24px",borderBottom:"1px solid "+C.border,background:C.bg,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{fontSize:11,color:C.text3,textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>CleanITBooks · Job Center</div>
            <div style={{fontSize:18,fontWeight:700,color:C.text}}>{isEdit?"Modifier le job":"Creer un nouveau job"}</div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:4,border:"1px solid "+C.border,background:C.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Ico n="close" s={16} c={C.text3}/>
          </button>
        </div>

        {/* Steps indicator */}
        <div style={{padding:"12px 24px",borderBottom:"1px solid "+C.border,background:C.white,display:"flex",gap:0,flexShrink:0}}>
          {STEPS.map((s,i)=>(
            <div key={s.n} style={{display:"flex",alignItems:"center",flex:1}}>
              <button
                onClick={()=>setStep(s.n)}
                style={{
                  display:"flex",alignItems:"center",gap:7,padding:"6px 10px",
                  borderRadius:4,border:"none",cursor:"pointer",fontFamily:"inherit",
                  background:step===s.n?C.green_l:"transparent",
                  transition:"all .15s",
                }}>
                <div style={{
                  width:22,height:22,borderRadius:"50%",flexShrink:0,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  background:step===s.n?C.green:step>s.n?C.green:"#E5E7EB",
                  color:step>=s.n?"white":C.text4,
                  fontSize:11,fontWeight:700,
                }}>
                  {step>s.n?<Ico n="check" s={11} c="white"/>:s.n}
                </div>
                <span style={{fontSize:12,fontWeight:step===s.n?600:400,color:step===s.n?C.green:C.text3,whiteSpace:"nowrap"}}>{s.label}</span>
              </button>
              {i<STEPS.length-1&&<div style={{flex:1,height:1,background:C.border,margin:"0 4px"}}/>}
            </div>
          ))}
        </div>

        {/* Contenu scrollable */}
        <div style={{flex:1,overflow:"auto",padding:"24px"}}>

          {/* STEP 1 — Informations generales */}
          {step===1&&(
            <div>
              <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:16}}>Informations generales du job</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <Field label="Nom du job" required span>
                  <Inp value={name} onChange={setName} placeholder="Ex: Installation 5G NR DLA-001"/>
                </Field>

                <Field label="Client" required>
                  <Sel value={custId} onChange={setCustId} placeholder="Selectionner un client"
                    options={customers.map(c=>({v:c.id,l:c.name}))}/>
                </Field>

                <Field label="Type de job" required>
                  <Sel value={jobType} onChange={setJobType} placeholder="Selectionner le type"
                    options={JOB_TYPES}/>
                </Field>

                <Field label="Statut">
                  <Sel value={statut} onChange={setStatut} options={JOB_STATUTS}/>
                </Field>

                <Field label="Site" hint="Code du site reseau ex: DLA-001">
                  <Inp value={site} onChange={setSite} placeholder="DLA-001"/>
                </Field>

                <Field label="Chef de projet">
                  <Inp value={chef} onChange={setChef} placeholder="Nom du chef de projet"/>
                </Field>

                <Field label="Date de debut">
                  <Inp type="date" value={startDate} onChange={setStartDate}/>
                </Field>

                <Field label="Date de fin prevue">
                  <Inp type="date" value={endDate} onChange={setEndDate}/>
                </Field>

                <Field label="Devise">
                  <Sel value={currency} onChange={setCurrency} options={["FCFA","USD","EUR","CNY"]}/>
                </Field>

                <Field label="Description" span>
                  <Txt value={desc} onChange={setDesc} placeholder="Description detaillee du job, scope des travaux, objectifs..." rows={4}/>
                </Field>
              </div>
            </div>
          )}

          {/* STEP 2 — BC Huawei confidentiel */}
          {step===2&&(
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:"#FEF3C7",border:"1px solid "+C.orange+"50",borderRadius:6,marginBottom:20}}>
                <Ico n="lock" s={16} c={C.orange}/>
                <div>
                  <strong style={{color:C.orange,fontSize:13}}>CONFIDENTIEL — Finance et Comptabilite uniquement</strong>
                  <div style={{fontSize:12,color:C.text2,marginTop:2}}>Ces informations ne sont pas visibles par les Project Managers. Le PM voit uniquement le nom du job, le site et le type de mission.</div>
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
                <Field label="Reference BC Huawei">
                  <Inp value={bcRef} onChange={setBcRef} placeholder="BC-HW-2024-XXX"/>
                </Field>

                <Field label="Devise du BC">
                  <Sel value={currency} onChange={setCurrency} options={["FCFA","USD","EUR"]}/>
                </Field>

                <Field label="Montant total Huawei (prix Huawei)" required hint="Ce que Huawei vous paie — confidentiel">
                  <Inp type="number" value={budgetHW} onChange={setBudgetHW} prefix={currency} placeholder="0"/>
                </Field>

                <Field label="Montant contrat CleanIT" required hint="Ce que CleanIT facture au client final">
                  <Inp type="number" value={contractAmt} onChange={setContractAmt} prefix={currency} placeholder="0"/>
                </Field>
              </div>

              {/* Calcul marge */}
              {budgetHW&&contractAmt&&(
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
                  {[
                    {l:"Prix Huawei",v:fN(+budgetHW)+" "+currency,c:C.orange},
                    {l:"Contrat CleanIT",v:fN(+contractAmt)+" "+currency,c:C.blue},
                    {l:"Marge brute",v:fN(+budgetHW-+contractAmt)+" "+currency,c:+budgetHW>+contractAmt?C.green:C.red},
                  ].map((s,i)=>(
                    <div key={i} style={{padding:"12px 16px",background:C.bg,borderRadius:6,border:"1px solid "+C.border,borderTop:"3px solid "+s.c}}>
                      <div style={{fontSize:11,color:C.text3,textTransform:"uppercase",letterSpacing:.4,marginBottom:4}}>{s.l}</div>
                      <div style={{fontSize:17,fontWeight:700,color:s.c}}>{s.v}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Lignes BC detaillees */}
              <div style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text}}>Lignes detaillees du bon de commande</div>
                  <Btn label="+ Ajouter une ligne" variant="light" sm onClick={()=>setLignesBC(p=>[...p,{desc:"",qte:1,pu:0,total:0}])}/>
                </div>
                <div style={{border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr style={{background:C.bg,borderBottom:"2px solid "+C.border}}>
                        {["Description","Qte","Prix unitaire ("+currency+")","Total",""].map((h,i)=>(
                          <th key={i} style={{padding:"9px 12px",textAlign:i>=1&&i<=3?"right":"left",fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.3}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lignesBC.map((l,i)=>(
                        <tr key={i} style={{borderBottom:"1px solid "+C.border2}}>
                          <td style={{padding:"7px 10px"}}>
                            <Inp value={l.desc} onChange={v=>updLigneBC(i,"desc",v)} placeholder="Description de la prestation" small/>
                          </td>
                          <td style={{padding:"7px 8px",width:70}}>
                            <Inp type="number" value={l.qte} onChange={v=>updLigneBC(i,"qte",v)} small/>
                          </td>
                          <td style={{padding:"7px 8px",width:160}}>
                            <Inp type="number" value={l.pu} onChange={v=>updLigneBC(i,"pu",v)} small/>
                          </td>
                          <td style={{padding:"7px 12px",textAlign:"right",fontWeight:600,color:C.orange,fontSize:13,width:130}}>
                            {fN(l.qte*(l.pu||0))} {currency}
                          </td>
                          <td style={{padding:"7px 8px",width:36}}>
                            {lignesBC.length>1&&(
                              <button onClick={()=>setLignesBC(p=>p.filter((_,xi)=>xi!==i))}
                                style={{width:24,height:24,borderRadius:4,border:"1px solid "+C.border,background:C.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                                <Ico n="close" s={12} c={C.text3}/>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{borderTop:"2px solid "+C.border,background:C.bg}}>
                        <td colSpan={3} style={{padding:"10px 12px",fontWeight:700,color:C.text}}>TOTAL BC HUAWEI</td>
                        <td style={{padding:"10px 12px",textAlign:"right",fontWeight:800,color:C.orange,fontSize:15}}>{fN(totalBC)} {currency}</td>
                        <td/>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Budget estime par poste */}
          {step===3&&(
            <div>
              <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:6}}>Budget estime par poste de cout</div>
              <div style={{fontSize:13,color:C.text3,marginBottom:20}}>
                Definissez votre budget previsionnel par categorie. Ces montants seront compares aux couts reels au fur et a mesure de l avancement du job.
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
                {COST_CATS.map(cat=>(
                  <div key={cat.key} style={{
                    display:"grid",gridTemplateColumns:"220px 1fr auto",gap:16,alignItems:"center",
                    padding:"14px 18px",background:C.white,borderRadius:6,
                    border:"1px solid "+C.border,
                    borderLeft:"4px solid "+cat.color,
                  }}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:34,height:34,borderRadius:6,background:cat.color+"15",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <Ico n={cat.icon} s={16} c={cat.color}/>
                      </div>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:C.text}}>{cat.label}</div>
                        <div style={{fontSize:11,color:C.text4}}>Poste de cout</div>
                      </div>
                    </div>
                    <Inp
                      type="number"
                      value={budgetEst[cat.key]||""}
                      onChange={v=>setBudgetEst(p=>({...p,[cat.key]:+v||0}))}
                      placeholder="0"
                      prefix={currency}
                    />
                    <div style={{textAlign:"right",minWidth:120}}>
                      <div style={{fontSize:14,fontWeight:700,color:cat.color}}>{fN(+budgetEst[cat.key]||0)} {currency}</div>
                      <div style={{fontSize:11,color:C.text4}}>{totalEst>0?Math.round((+budgetEst[cat.key]||0)/totalEst*100):0}% du total</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recap */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,padding:"16px",background:C.bg,borderRadius:6,border:"1px solid "+C.border}}>
                {[
                  {l:"Budget total estime",v:fN(totalEst)+" "+currency,c:C.blue},
                  {l:"Contrat CleanIT",v:fN(+contractAmt||0)+" "+currency,c:C.green},
                  {l:"Marge prevue",v:fN((+contractAmt||0)-totalEst)+" "+currency,c:(+contractAmt||0)-totalEst>=0?C.green:C.red},
                ].map((s,i)=>(
                  <div key={i} style={{textAlign:"center"}}>
                    <div style={{fontSize:11,color:C.text3,textTransform:"uppercase",letterSpacing:.4,marginBottom:4}}>{s.l}</div>
                    <div style={{fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4 — Phases de facturation */}
          {step===4&&(
            <div>
              <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:6}}>Phases de facturation (Progress Invoicing)</div>
              <div style={{fontSize:13,color:C.text3,marginBottom:20}}>
                Definissez les etapes de facturation du job. Chaque phase peut etre facturee independamment selon l avancement des travaux.
              </div>

              {/* Alerte si total phases != 100% */}
              {pctPhases!==100&&phases.length>0&&(
                <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:C.orange_l,border:"1px solid "+C.orange+"40",borderRadius:6,marginBottom:16}}>
                  <Ico n="alert" s={15} c={C.orange}/>
                  <span style={{fontSize:12,color:C.orange}}>
                    Total des phases: {pctPhases}% ({fN(totalPhases)} {currency}) — doit etre 100% ({fN(+contractAmt||0)} {currency})
                  </span>
                </div>
              )}

              <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16}}>
                {phases.map((ph,i)=>(
                  <div key={i} style={{
                    border:"1px solid "+C.border,borderRadius:6,overflow:"hidden",
                    borderLeft:"4px solid "+(ph.statut==="invoiced"?C.green:C.blue),
                  }}>
                    <div style={{padding:"12px 16px",background:C.bg,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:26,height:26,borderRadius:"50%",background:ph.statut==="invoiced"?C.green:C.blue,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"white"}}>{i+1}</div>
                        <Inp value={ph.name} onChange={v=>updPhase(i,"name",v)} placeholder={"Phase "+(i+1)} small/>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <StatutBadge statut={ph.statut==="invoiced"?"invoiced":"pending"}/>
                        {phases.length>1&&(
                          <button onClick={()=>setPhases(p=>p.filter((_,xi)=>xi!==i))}
                            style={{width:24,height:24,borderRadius:4,border:"1px solid "+C.border,background:C.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                            <Ico n="close" s={12} c={C.text3}/>
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{padding:"14px 16px",display:"grid",gridTemplateColumns:"120px 1fr 1fr 1fr",gap:12,alignItems:"end"}}>
                      <Field label="Pourcentage (%)">
                        <Inp type="number" value={ph.pct} onChange={v=>updPhase(i,"pct",v)} min="0" max="100" suffix="%"/>
                      </Field>
                      <Field label={"Montant ("+currency+")"}>
                        <Inp type="number" value={ph.amount} onChange={v=>updPhase(i,"amount",v)} prefix={currency}/>
                      </Field>
                      <Field label="Date prevue">
                        <Inp type="date" value={ph.datePrevue||""} onChange={v=>updPhase(i,"datePrevue",v)}/>
                      </Field>
                      <Field label="Reference facture">
                        <Inp value={ph.invoiceRef||""} onChange={v=>updPhase(i,"invoiceRef",v)} placeholder="INV-XXXX" disabled={ph.statut!=="invoiced"}/>
                      </Field>
                    </div>
                  </div>
                ))}
              </div>

              <Btn label="+ Ajouter une phase" variant="light" icon="plus" onClick={addPhase}/>

              {/* Recap phases */}
              {+contractAmt>0&&(
                <div style={{marginTop:16,padding:"14px 16px",background:C.bg,borderRadius:6,border:"1px solid "+C.border}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.4,marginBottom:10}}>Recap phases</div>
                  <ProgBar value={totalPhases} max={+contractAmt} color={C.green} height={8}/>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                    <span style={{fontSize:12,color:C.text3}}>Total phases: {fN(totalPhases)} {currency}</span>
                    <span style={{fontSize:12,fontWeight:700,color:pctPhases===100?C.green:C.orange}}>{pctPhases}% du contrat</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5 — Notes */}
          {step===5&&(
            <div>
              <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:16}}>Notes et informations complementaires</div>
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                <Field label="Notes internes">
                  <Txt value={notes} onChange={setNotes} placeholder="Notes internes sur ce job, informations utiles pour le suivi..." rows={5}/>
                </Field>

                {/* Recap complet */}
                <div style={{padding:"16px",background:C.bg,borderRadius:6,border:"1px solid "+C.border}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12}}>Recap du job avant creation</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {[
                      {l:"Nom du job",v:name||"—"},
                      {l:"Client",v:customers.find(c=>c.id===custId)?.name||"—"},
                      {l:"Type",v:jobType||"—"},
                      {l:"Statut",v:statut},
                      {l:"Site",v:site||"—"},
                      {l:"Chef de projet",v:chef||"—"},
                      {l:"Dates",v:(startDate||"?")+" au "+(endDate||"?")},
                      {l:"BC Huawei",v:bcRef||"—"},
                      {l:"Budget Huawei",v:budgetHW?fN(+budgetHW)+" "+currency:"—"},
                      {l:"Contrat CleanIT",v:contractAmt?fN(+contractAmt)+" "+currency:"—"},
                      {l:"Budget estime",v:fN(totalEst)+" "+currency},
                      {l:"Phases",v:phases.length+" phase(s)"},
                    ].map(it=>(
                      <div key={it.l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid "+C.border2}}>
                        <span style={{fontSize:12,color:C.text3}}>{it.l}</span>
                        <span style={{fontSize:12,fontWeight:600,color:C.text}}>{it.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div style={{padding:"14px 24px",borderTop:"1px solid "+C.border,background:C.bg,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div style={{display:"flex",gap:8}}>
            {step>1&&<Btn label="Precedent" onClick={()=>setStep(s=>s-1)} variant="default"/>}
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn label="Annuler" onClick={onClose} variant="light"/>
            {step<5?(
              <Btn label="Suivant" onClick={()=>setStep(s=>s+1)} variant="primary" icon="chevr"/>
            ):(
              <Btn label={isEdit?"Enregistrer les modifications":"Creer le job"} onClick={save} variant="primary" icon="check"/>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ================================================================
//  VUE DETAIL JOB
// ================================================================
const DetailJob = ({job,customers,onEdit,onClose,onCreateInvoice}) => {
  const [tab, setTab] = useState("overview");
  const cust = customers.find(c=>c.id===job.customerId);

  const totalInvoiced = job.invoices.reduce((s,i)=>s+i.amount,0);
  const totalBills    = job.bills.reduce((s,b)=>s+b.amount,0);
  const totalTime     = job.timeEntries.reduce((s,t)=>s+t.hours*t.rate,0);
  const totalCouts    = Object.values(job.coutsReels).reduce((s,v)=>s+v,0);
  const totalEst      = Object.values(job.budgetEstime).reduce((s,v)=>s+v,0);
  const marge         = totalInvoiced - totalCouts;

  const TABS = [
    {id:"overview",     label:"Vue generale",       icon:"chart"},
    {id:"phases",       label:"Phases ("+job.phases.length+")", icon:"phase"},
    {id:"invoices",     label:"Factures ("+job.invoices.length+")", icon:"invoice"},
    {id:"bills",        label:"Depenses ("+job.bills.length+")", icon:"bill"},
    {id:"time",         label:"Heures ("+job.timeEntries.length+")", icon:"time"},
    {id:"bc",           label:"BC Huawei",           icon:"bc"},
    {id:"notes",        label:"Notes",               icon:"note"},
  ];

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
      {/* Header job */}
      <div style={{padding:"16px 20px",borderBottom:"1px solid "+C.border,background:C.white,flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
              <span style={{fontSize:11,color:C.text4,fontWeight:600}}>{job.id}</span>
              <StatutBadge statut={job.statut}/>
              {job.bcRef&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:10,background:C.orange_l,color:C.orange,fontWeight:600}}>{job.bcRef}</span>}
              <span style={{fontSize:11,padding:"2px 8px",borderRadius:10,background:C.border2,color:C.text3}}>{job.jobType}</span>
            </div>
            <div style={{fontSize:18,fontWeight:700,color:C.text,marginBottom:4}}>{job.name}</div>
            <div style={{fontSize:12,color:C.text3}}>{cust?.name||"—"} · Site {job.site||"—"} · {job.chefProjet}</div>
            <div style={{fontSize:11,color:C.text4,marginTop:2}}>{fD(job.startDate)} — {fD(job.endDate)}</div>
          </div>
          <div style={{display:"flex",gap:8,flexShrink:0,marginLeft:16}}>
            <Btn label="Modifier" variant="default" sm icon="edit" onClick={onEdit}/>
            <Btn label="Facturer" variant="primary" sm icon="invoice" onClick={()=>onCreateInvoice(job)}/>
          </div>
        </div>

        {/* 5 KPIs financiers — coeur du Job Costing */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
          {[
            {l:"Budget Huawei",      v:fN(job.budgetHuawei)+" F",  c:C.orange, lock:true,  sub:"Confidentiel"},
            {l:"Contrat CleanIT",    v:fN(job.contractAmount)+" F", c:C.blue,   lock:false, sub:"Montant facture"},
            {l:"Budget estime",      v:fN(totalEst)+" F",           c:C.text,   lock:false, sub:"Couts prevus"},
            {l:"Couts reels",        v:fN(totalCouts)+" F",         c:totalCouts>totalEst?C.red:C.green, lock:false, sub:"Depenses engagees"},
            {l:"Marge nette",        v:fN(marge)+" F",              c:marge>=0?C.green:C.red, lock:false, sub:job.contractAmount>0?Math.round(marge/job.contractAmount*100)+"%":"—"},
          ].map((kpi,i)=>(
            <div key={i} style={{
              padding:"10px 12px",background:C.white,borderRadius:6,
              border:"1px solid "+C.border,borderTop:"3px solid "+kpi.c,
            }}>
              <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:4}}>
                <span style={{fontSize:9,color:C.text4,textTransform:"uppercase",letterSpacing:.4,fontWeight:600}}>{kpi.l}</span>
                {kpi.lock&&<Ico n="lock" s={9} c={C.orange}/>}
              </div>
              <div style={{fontSize:15,fontWeight:800,color:kpi.c}}>{kpi.v}</div>
              <div style={{fontSize:10,color:C.text4,marginTop:2}}>{kpi.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Onglets */}
      <div style={{display:"flex",padding:"0 20px",borderBottom:"1px solid "+C.border,background:C.white,flexShrink:0,overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{
              display:"flex",alignItems:"center",gap:6,
              padding:"10px 14px",border:"none",background:"transparent",
              borderBottom:tab===t.id?"2px solid "+C.blue:"2px solid transparent",
              color:tab===t.id?C.blue:C.text3,
              fontWeight:tab===t.id?700:400,
              fontSize:12,cursor:"pointer",fontFamily:"inherit",
              whiteSpace:"nowrap",transition:"all .12s",
            }}>
            <Ico n={t.icon} s={13} c={tab===t.id?C.blue:C.text3}/>
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenu onglet */}
      <div style={{flex:1,overflow:"auto",padding:"18px 20px"}}>

        {/* OVERVIEW */}
        {tab==="overview"&&(
          <div>
            {/* Description */}
            <div style={{padding:"12px 16px",background:C.bg,borderRadius:6,border:"1px solid "+C.border2,marginBottom:16,fontSize:13,color:C.text2,lineHeight:1.7}}>
              {job.description}
            </div>

            {/* Budget estime vs Couts reels */}
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12}}>Estimates vs Actuals — par poste de cout</div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
              {COST_CATS.map(cat=>{
                const estime = job.budgetEstime[cat.key]||0;
                const reel   = job.coutsReels[cat.key]||0;
                const over   = reel>estime;
                return(
                  <div key={cat.key} style={{
                    padding:"12px 16px",background:C.white,borderRadius:6,
                    border:"1px solid "+C.border,
                    borderLeft:"4px solid "+(over?C.red:cat.color),
                  }}>
                    <div style={{display:"grid",gridTemplateColumns:"180px 1fr 140px 140px 80px",gap:12,alignItems:"center"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:28,height:28,borderRadius:5,background:cat.color+"15",display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <Ico n={cat.icon} s={13} c={cat.color}/>
                        </div>
                        <span style={{fontSize:12,fontWeight:600,color:C.text}}>{cat.label}</span>
                      </div>
                      <ProgBar value={reel} max={estime||1} color={cat.color} height={6}/>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:11,color:C.text4,marginBottom:2}}>Estime</div>
                        <div style={{fontSize:13,fontWeight:600,color:C.text}}>{fN(estime)} F</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:11,color:C.text4,marginBottom:2}}>Reel</div>
                        <div style={{fontSize:13,fontWeight:700,color:over?C.red:C.green}}>{fN(reel)} F</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:11,fontWeight:700,color:over?C.red:C.text3}}>
                          {over?"+":""}{fN(reel-estime)} F
                        </div>
                        {over&&<div style={{fontSize:10,color:C.red}}>Depasse</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* P&L du job */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div style={{padding:"16px",background:C.white,border:"1px solid "+C.border,borderRadius:6}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12}}>P et L — Ce job</div>
                {[
                  {l:"Revenus factures",   v:fN(totalInvoiced)+" F", c:C.green,  big:false},
                  {l:"Couts materiaux",    v:"- "+fN(job.coutsReels.materials)+" F", c:C.red, big:false},
                  {l:"Main oeuvre",        v:"- "+fN(job.coutsReels.labor)+" F", c:C.orange, big:false},
                  {l:"Sous-traitance",     v:"- "+fN(job.coutsReels.subcontract)+" F", c:C.orange, big:false},
                  {l:"Equipements",        v:"- "+fN(job.coutsReels.equipment)+" F", c:C.purple, big:false},
                  {l:"Frais generaux",     v:"- "+fN(job.coutsReels.overhead)+" F", c:C.gray, big:false},
                  {l:"Marge nette",        v:(marge>=0?"+":"")+fN(marge)+" F", c:marge>=0?C.green:C.red, big:true},
                ].map((r,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:r.big?"none":"1px solid "+C.border2}}>
                    <span style={{fontSize:r.big?13:12,fontWeight:r.big?600:400,color:C.text3}}>{r.l}</span>
                    <span style={{fontSize:r.big?17:13,fontWeight:r.big?800:600,color:r.c}}>{r.v}</span>
                  </div>
                ))}
              </div>

              <div style={{padding:"16px",background:C.white,border:"1px solid "+C.border,borderRadius:6}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12}}>Avancement financier</div>
                {[
                  {l:"Contrat CleanIT",      v:fN(job.contractAmount)+" F", c:C.blue},
                  {l:"Facture",              v:fN(totalInvoiced)+" F",      c:C.green},
                  {l:"Reste a facturer",     v:fN(Math.max(0,job.contractAmount-totalInvoiced))+" F", c:C.orange},
                  {l:"Budget estime total",  v:fN(totalEst)+" F",           c:C.text},
                  {l:"Couts reels totaux",   v:fN(totalCouts)+" F",         c:totalCouts>totalEst?C.red:C.green},
                  {l:"Ecart budget",         v:fN(totalEst-totalCouts)+" F", c:totalEst>totalCouts?C.green:C.red},
                ].map((r,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<5?"1px solid "+C.border2:"none"}}>
                    <span style={{fontSize:12,color:C.text3}}>{r.l}</span>
                    <span style={{fontSize:13,fontWeight:600,color:r.c}}>{r.v}</span>
                  </div>
                ))}
                <div style={{marginTop:10}}>
                  <div style={{fontSize:11,color:C.text4,marginBottom:4}}>Progression facturation</div>
                  <ProgBar value={totalInvoiced} max={job.contractAmount} color={C.green} height={8}/>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PHASES */}
        {tab==="phases"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>Phases de facturation — Progress Invoicing</div>
              <Btn label="Facturer une phase" variant="primary" sm icon="invoice"/>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {job.phases.map((ph,i)=>(
                <div key={ph.id} style={{
                  border:"1px solid "+C.border,borderRadius:6,overflow:"hidden",
                  borderLeft:"4px solid "+(ph.statut==="invoiced"?C.green:C.blue),
                }}>
                  <div style={{padding:"12px 16px",background:C.bg,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{
                        width:28,height:28,borderRadius:"50%",
                        background:ph.statut==="invoiced"?C.green:C.blue,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:13,fontWeight:700,color:"white",flexShrink:0,
                      }}>{i+1}</div>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:C.text}}>{ph.name}</div>
                        {ph.invoiceRef&&<div style={{fontSize:11,color:C.green}}>Ref: {ph.invoiceRef}</div>}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <StatutBadge statut={ph.statut}/>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:16,fontWeight:800,color:C.blue}}>{fN(ph.amount)} {job.currency}</div>
                        <div style={{fontSize:11,color:C.text4}}>{ph.pct}% du contrat</div>
                      </div>
                    </div>
                  </div>
                  <div style={{padding:"10px 16px",display:"flex",gap:20,alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:11,color:C.text4,marginBottom:2}}>Date prevue</div>
                      <div style={{fontSize:12,fontWeight:600,color:C.text}}>{fD(ph.datePrevue)||"—"}</div>
                    </div>
                    <div>
                      <div style={{fontSize:11,color:C.text4,marginBottom:2}}>Date paiement</div>
                      <div style={{fontSize:12,fontWeight:600,color:ph.datePaiement?C.green:C.text4}}>{fD(ph.datePaiement)||"En attente"}</div>
                    </div>
                    {ph.statut!=="invoiced"&&(
                      <div style={{marginLeft:"auto"}}>
                        <Btn label="Creer la facture" variant="primary" sm icon="invoice"/>
                      </div>
                    )}
                    {ph.statut==="invoiced"&&(
                      <div style={{marginLeft:"auto"}}>
                        <Btn label="Voir la facture" variant="default" sm icon="invoice"/>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FACTURES */}
        {tab==="invoices"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>Factures liees a ce job</div>
              <Btn label="Nouvelle facture" variant="primary" sm icon="invoice"/>
            </div>
            {job.invoices.length===0?(
              <div style={{textAlign:"center",padding:"40px",color:C.text4,fontSize:14,background:C.bg,borderRadius:6,border:"1px dashed "+C.border}}>
                Aucune facture pour ce job.<br/>
                <span style={{fontSize:12}}>Utilisez "Facturer une phase" pour creer votre premiere facture.</span>
              </div>
            ):(
              <div style={{border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:C.bg,borderBottom:"2px solid "+C.border}}>
                      {["N Facture","Date","Montant","Solde","Statut","Actions"].map((h,i)=>(
                        <th key={i} style={{padding:"9px 14px",textAlign:i>=2&&i<=3?"right":"left",fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.3}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {job.invoices.map((inv,i)=>(
                      <tr key={inv.id} style={{borderBottom:"1px solid "+C.border2}}>
                        <td style={{padding:"11px 14px",fontWeight:700,color:C.blue}}>{inv.id}</td>
                        <td style={{padding:"11px 14px",color:C.text3,fontSize:12}}>{fD(inv.date)}</td>
                        <td style={{padding:"11px 14px",textAlign:"right",fontWeight:600}}>{fN(inv.amount)} {job.currency}</td>
                        <td style={{padding:"11px 14px",textAlign:"right",fontWeight:700,color:inv.balance>0?C.orange:C.green}}>{fN(inv.balance)} {job.currency}</td>
                        <td style={{padding:"11px 14px"}}><StatutBadge statut={inv.statut}/></td>
                        <td style={{padding:"11px 14px"}}><Btn label="Voir" variant="light" sm/></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{background:C.bg,borderTop:"2px solid "+C.border}}>
                      <td colSpan={2} style={{padding:"10px 14px",fontWeight:700,color:C.text}}>Total facture</td>
                      <td style={{padding:"10px 14px",textAlign:"right",fontWeight:800,color:C.green,fontSize:15}}>{fN(totalInvoiced)} {job.currency}</td>
                      <td colSpan={3}/>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* DEPENSES */}
        {tab==="bills"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>Depenses et bills lies a ce job</div>
              <Btn label="Saisir une depense" variant="primary" sm icon="bill"/>
            </div>
            {job.bills.length===0?(
              <div style={{textAlign:"center",padding:"40px",color:C.text4,fontSize:14,background:C.bg,borderRadius:6,border:"1px dashed "+C.border}}>
                Aucune depense enregistree pour ce job.
              </div>
            ):(
              <div style={{border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:C.bg,borderBottom:"2px solid "+C.border}}>
                      {["N Bill","Fournisseur","Date","Montant","Statut","Actions"].map((h,i)=>(
                        <th key={i} style={{padding:"9px 14px",textAlign:i===3?"right":"left",fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.3}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {job.bills.map((b,i)=>(
                      <tr key={b.id} style={{borderBottom:"1px solid "+C.border2}}>
                        <td style={{padding:"11px 14px",fontWeight:700,color:C.orange}}>{b.id}</td>
                        <td style={{padding:"11px 14px",fontSize:12}}>{b.vendor}</td>
                        <td style={{padding:"11px 14px",color:C.text3,fontSize:12}}>{fD(b.date)}</td>
                        <td style={{padding:"11px 14px",textAlign:"right",fontWeight:700,color:C.red}}>{fN(b.amount)} F</td>
                        <td style={{padding:"11px 14px"}}><StatutBadge statut={b.statut}/></td>
                        <td style={{padding:"11px 14px"}}><Btn label="Voir" variant="light" sm/></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{background:C.bg,borderTop:"2px solid "+C.border}}>
                      <td colSpan={3} style={{padding:"10px 14px",fontWeight:700,color:C.text}}>Total depenses</td>
                      <td style={{padding:"10px 14px",textAlign:"right",fontWeight:800,color:C.red,fontSize:15}}>{fN(totalBills)} F</td>
                      <td colSpan={2}/>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* HEURES */}
        {tab==="time"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>Heures enregistrees pour ce job</div>
              <Btn label="Saisir des heures" variant="primary" sm icon="time"/>
            </div>
            {job.timeEntries.length===0?(
              <div style={{textAlign:"center",padding:"40px",color:C.text4,fontSize:14,background:C.bg,borderRadius:6,border:"1px dashed "+C.border}}>
                Aucune heure enregistree pour ce job.
              </div>
            ):(
              <div style={{border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:C.bg,borderBottom:"2px solid "+C.border}}>
                      {["Employe","Date","Service","Heures","Taux/h","Montant","Facturable"].map((h,i)=>(
                        <th key={i} style={{padding:"9px 14px",textAlign:i>=3&&i<=5?"right":"left",fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.3}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {job.timeEntries.map((t,i)=>(
                      <tr key={i} style={{borderBottom:"1px solid "+C.border2}}>
                        <td style={{padding:"11px 14px",fontWeight:600,color:C.text}}>{t.emp}</td>
                        <td style={{padding:"11px 14px",color:C.text3,fontSize:12}}>{fD(t.date)}</td>
                        <td style={{padding:"11px 14px",fontSize:12}}>{t.service}</td>
                        <td style={{padding:"11px 14px",textAlign:"right",fontWeight:600}}>{t.hours}h</td>
                        <td style={{padding:"11px 14px",textAlign:"right",color:C.text3,fontSize:12}}>{fN(t.rate)} F</td>
                        <td style={{padding:"11px 14px",textAlign:"right",fontWeight:700,color:C.blue}}>{fN(t.hours*t.rate)} F</td>
                        <td style={{padding:"11px 14px"}}>
                          {t.billable
                            ?<span style={{fontSize:11,color:C.green,fontWeight:600,background:C.green_l,padding:"2px 8px",borderRadius:10}}>Facturable</span>
                            :<span style={{fontSize:11,color:C.text4,background:C.border2,padding:"2px 8px",borderRadius:10}}>Non facturable</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{background:C.bg,borderTop:"2px solid "+C.border}}>
                      <td colSpan={3} style={{padding:"10px 14px",fontWeight:700,color:C.text}}>Total heures</td>
                      <td style={{padding:"10px 14px",textAlign:"right",fontWeight:800,color:C.blue}}>{job.timeEntries.reduce((s,t)=>s+t.hours,0)}h</td>
                      <td/>
                      <td style={{padding:"10px 14px",textAlign:"right",fontWeight:800,color:C.blue,fontSize:15}}>{fN(totalTime)} F</td>
                      <td/>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* BC HUAWEI */}
        {tab==="bc"&&(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:"#FEF3C7",border:"1px solid "+C.orange+"50",borderRadius:6,marginBottom:16}}>
              <Ico n="lock" s={15} c={C.orange}/>
              <div style={{fontSize:12,color:C.text2}}>
                <strong style={{color:C.orange}}>CONFIDENTIEL —</strong> Ces informations ne sont pas visibles par les PM. Accessible uniquement Finance et Direction.
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
              {[
                {l:"Prix Huawei",v:fN(job.budgetHuawei)+" "+job.currency,c:C.orange},
                {l:"Contrat CleanIT",v:fN(job.contractAmount)+" "+job.currency,c:C.blue},
                {l:"Marge brute",v:fN(job.budgetHuawei-job.contractAmount)+" "+job.currency,c:job.budgetHuawei>job.contractAmount?C.green:C.red},
              ].map((s,i)=>(
                <div key={i} style={{padding:"14px 16px",background:C.white,border:"1px solid "+C.border,borderRadius:6,borderTop:"3px solid "+s.c,textAlign:"center"}}>
                  <div style={{fontSize:11,color:C.text3,textTransform:"uppercase",letterSpacing:.4,marginBottom:5}}>{s.l}</div>
                  <div style={{fontSize:20,fontWeight:700,color:s.c}}>{s.v}</div>
                </div>
              ))}
            </div>

            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>Lignes du bon de commande Huawei</div>
            <div style={{border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:C.bg,borderBottom:"2px solid "+C.border}}>
                    {["Description","Quantite","Prix unitaire","Total"].map((h,i)=>(
                      <th key={i} style={{padding:"9px 14px",textAlign:i>=1?"right":"left",fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.3}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {job.lignesBC.map((l,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid "+C.border2}}>
                      <td style={{padding:"11px 14px",fontSize:13}}>{l.desc}</td>
                      <td style={{padding:"11px 14px",textAlign:"right",color:C.text3}}>{l.qte}</td>
                      <td style={{padding:"11px 14px",textAlign:"right",color:C.text3}}>{fN(l.pu)} {job.currency}</td>
                      <td style={{padding:"11px 14px",textAlign:"right",fontWeight:700,color:C.orange}}>{fN(l.total)} {job.currency}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{background:C.bg,borderTop:"2px solid "+C.border}}>
                    <td colSpan={3} style={{padding:"12px 14px",fontWeight:700,color:C.text,fontSize:13}}>TOTAL BC HUAWEI</td>
                    <td style={{padding:"12px 14px",textAlign:"right",fontWeight:800,color:C.orange,fontSize:16}}>{fN(job.lignesBC.reduce((s,l)=>s+l.total,0))} {job.currency}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* NOTES */}
        {tab==="notes"&&(
          <div>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12}}>Notes internes</div>
            <Txt value={job.notes||""} onChange={()=>{}} placeholder="Ajouter des notes..." rows={6}/>
            <div style={{marginTop:16,padding:"12px 16px",background:C.bg,borderRadius:6,border:"1px solid "+C.border2}}>
              <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
                {[
                  {l:"Date creation",v:fD(job.dateCreation)},
                  {l:"Derniere modification",v:fD(TODAY)},
                  {l:"Cree dans CleanITBooks",v:"Oui"},
                ].map(it=>(
                  <div key={it.l}>
                    <div style={{fontSize:10,color:C.text4,textTransform:"uppercase",letterSpacing:.4,marginBottom:2}}>{it.l}</div>
                    <div style={{fontSize:12,fontWeight:600,color:C.text}}>{it.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ================================================================
//  MODULE PRINCIPAL — JOB CENTER
// ================================================================
export default function CleanITBooks() {
  const navigate = useNavigate();
  const [jobs,       setJobs]       = useState(INIT_JOBS);
  const [selJobId,   setSelJobId]   = useState(INIT_JOBS[0].id);
  const [showForm,   setShowForm]   = useState(false);
  const [editJob,    setEditJob]    = useState(null);
  const [search,     setSearch]     = useState("");
  const [filtreStatut,setFiltreStatut]= useState("Tous");
  const [filtreType, setFiltreType] = useState("Tous");

  const TABS_NAV = [
    {id:"jobs",     label:"Job Center",          icon:"job"},
    {id:"invoices", label:"Facturation AR",       icon:"invoice"},
    {id:"bills",    label:"Depenses AP",          icon:"bill"},
    {id:"time",     label:"Saisie heures",        icon:"time"},
    {id:"reports",  label:"Rapports Job Costing", icon:"chart"},
    {id:"bc",       label:"Import BC Huawei",     icon:"bc"},
  ];
  const [activeTab, setActiveTab] = useState("jobs");

  const selJob = jobs.find(j=>j.id===selJobId);

  const STATUTS_FILTRE = ["Tous","In Progress","Awarded","Closed","Pending","Not Awarded"];
  const TYPES_FILTRE   = ["Tous",...JOB_TYPES];

  const jobsFiltres = jobs.filter(j=>{
    const ms = !search||(j.name+j.customerId+j.bcRef+j.site).toLowerCase().includes(search.toLowerCase());
    const mf = filtreStatut==="Tous"||j.statut===filtreStatut;
    const mt = filtreType==="Tous"||j.jobType===filtreType;
    return ms&&mf&&mt;
  });

  const handleSaveJob = (job) => {
    setJobs(p=>{
      const exists = p.find(j=>j.id===job.id);
      if(exists) return p.map(j=>j.id===job.id?job:j);
      return [...p,job];
    });
    setSelJobId(job.id);
    setEditJob(null);
  };

  // Stats globales
  const totalCA      = jobs.reduce((s,j)=>s+j.invoices.reduce((si,i)=>si+i.amount,0),0);
  const totalBudgetHW= jobs.reduce((s,j)=>s+j.budgetHuawei,0);
  const totalContrats= jobs.reduce((s,j)=>s+j.contractAmount,0);
  const totalCouts   = jobs.reduce((s,j)=>s+Object.values(j.coutsReels).reduce((sc,v)=>sc+v,0),0);

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:'"Segoe UI","Helvetica Neue",Arial,sans-serif',WebkitFontSmoothing:"antialiased"}}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px}
        ::-webkit-scrollbar-track{background:transparent}
      `}</style>

      {/* ===== TOPBAR PRINCIPAL ===== */}
      <div style={{background:C.white,borderBottom:"1px solid "+C.border,position:"sticky",top:0,zIndex:200,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>

        {/* Ligne 1 — Logo + KPIs + Actions */}
        <div style={{display:"flex",alignItems:"center",padding:"0 20px",height:52,gap:0,borderBottom:"1px solid "+C.border2}}>
          {/* Logo */}
          <div style={{display:"flex",alignItems:"center",gap:9,paddingRight:18,marginRight:6,borderRight:"1px solid "+C.border2}}>
            <div style={{width:30,height:30,borderRadius:6,background:C.green,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Ico n="job" s={15} c="white"/>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:C.text,letterSpacing:-.2}}>
                CleanIT<span style={{color:C.green}}>Books</span>
              </div>
              <div style={{fontSize:9,color:C.text4}}>SYSCOHADA · Cameroun</div>
            </div>
          </div>

          {/* KPIs inline */}
          <div style={{display:"flex",gap:1,marginRight:14}}>
            {[
              {l:"BC Huawei",v:fM(totalBudgetHW),c:C.orange},
              {l:"Contrats",v:fM(totalContrats),c:C.blue},
              {l:"Couts reels",v:fM(totalCouts),c:C.red},
              {l:"CA facture",v:fM(totalCA),c:C.green},
            ].map(s=>(
              <div key={s.l} style={{padding:"4px 12px",textAlign:"center",borderRight:"1px solid "+C.border2}}>
                <div style={{fontSize:8,color:C.text4,textTransform:"uppercase",letterSpacing:.4}}>{s.l}</div>
                <div style={{fontSize:12,fontWeight:700,color:s.c}}>{s.v} F</div>
              </div>
            ))}
          </div>

          {/* Spacer */}
          <div style={{flex:1}}/>

          {/* Actions */}
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:7,background:C.bg,border:"1px solid "+C.border,borderRadius:4,padding:"6px 12px"}}>
              <Ico n="search" s={13} c={C.text4}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un job..."
                style={{border:"none",outline:"none",fontSize:12,color:C.text,background:"transparent",width:170,fontFamily:"inherit"}}/>
            </div>
            <Btn label="Nouveau job" variant="primary" sm icon="plus" onClick={()=>{setEditJob(null);setShowForm(true);}}/>
            <button onClick={()=>navigate("/terrain")}
              style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:4,border:"1px solid "+C.border,background:C.bg,cursor:"pointer",fontFamily:"inherit",fontSize:12,color:C.text3}}
              onMouseEnter={e=>{e.currentTarget.style.background=C.green_l;e.currentTarget.style.borderColor=C.green;e.currentTarget.style.color=C.green;}}
              onMouseLeave={e=>{e.currentTarget.style.background=C.bg;e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.text3;}}>
              <Ico n="terrain" s={12} c="currentColor"/>
              Terrain
            </button>
          </div>
        </div>

        {/* Ligne 2 — Navigation onglets */}
        <div style={{display:"flex",padding:"0 20px",overflowX:"auto"}}>
          {TABS_NAV.map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)}
              style={{
                display:"flex",alignItems:"center",gap:6,
                padding:"0 16px",height:40,border:"none",background:"transparent",
                borderBottom:activeTab===t.id?"2px solid "+C.green:"2px solid transparent",
                color:activeTab===t.id?C.green:C.text3,
                fontWeight:activeTab===t.id?700:400,
                fontSize:12,cursor:"pointer",fontFamily:"inherit",
                whiteSpace:"nowrap",transition:"all .12s",
              }}>
              <Ico n={t.icon} s={13} c={activeTab===t.id?C.green:C.text3}/>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== CONTENU PRINCIPAL ===== */}
      {activeTab==="jobs"&&(
        <div style={{display:"flex",height:"calc(100vh - 92px)",overflow:"hidden"}}>

          {/* ===== LISTE JOBS (panneau gauche) ===== */}
          <div style={{width:320,borderRight:"1px solid "+C.border,display:"flex",flexDirection:"column",background:C.white,flexShrink:0}}>

            {/* Filtres */}
            <div style={{padding:"12px",borderBottom:"1px solid "+C.border,background:C.bg}}>
              <div style={{display:"flex",alignItems:"center",gap:6,background:C.white,border:"1px solid "+C.border,borderRadius:4,padding:"6px 10px",marginBottom:8}}>
                <Ico n="filter" s={12} c={C.text4}/>
                <select value={filtreStatut} onChange={e=>setFiltreStatut(e.target.value)}
                  style={{border:"none",outline:"none",fontSize:12,color:C.text2,background:"transparent",cursor:"pointer",fontFamily:"inherit",flex:1}}>
                  {STATUTS_FILTRE.map(s=><option key={s} value={s}>{s==="Tous"?"Tous les statuts":s}</option>)}
                </select>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,background:C.white,border:"1px solid "+C.border,borderRadius:4,padding:"6px 10px"}}>
                <Ico n="filter" s={12} c={C.text4}/>
                <select value={filtreType} onChange={e=>setFiltreType(e.target.value)}
                  style={{border:"none",outline:"none",fontSize:12,color:C.text2,background:"transparent",cursor:"pointer",fontFamily:"inherit",flex:1}}>
                  {TYPES_FILTRE.map(t=><option key={t} value={t}>{t==="Tous"?"Tous les types":t}</option>)}
                </select>
              </div>
            </div>

            {/* Compteur */}
            <div style={{padding:"8px 14px",borderBottom:"1px solid "+C.border2,background:C.bg,fontSize:11,color:C.text4,fontWeight:600,textTransform:"uppercase",letterSpacing:.4}}>
              {jobsFiltres.length} job{jobsFiltres.length>1?"s":""} · {jobs.filter(j=>j.statut==="In Progress").length} en cours
            </div>

            {/* Liste */}
            <div style={{flex:1,overflowY:"auto"}}>
              {jobsFiltres.length===0?(
                <div style={{padding:"32px 16px",textAlign:"center",color:C.text4,fontSize:13}}>
                  Aucun job ne correspond aux filtres
                </div>
              ):jobsFiltres.map(job=>{
                const cust   = CUSTOMERS.find(c=>c.id===job.customerId);
                const isSelected = selJobId===job.id;
                const totalInv   = job.invoices.reduce((s,i)=>s+i.amount,0);
                const pct        = job.contractAmount>0?Math.round(totalInv/job.contractAmount*100):0;
                const totalCR    = Object.values(job.coutsReels).reduce((s,v)=>s+v,0);

                return(
                  <div key={job.id}
                    onClick={()=>setSelJobId(job.id)}
                    style={{
                      padding:"12px 14px",
                      borderBottom:"1px solid "+C.border2,
                      cursor:"pointer",
                      background:isSelected?"#EFF6FF":"transparent",
                      borderLeft:"3px solid "+(isSelected?C.blue:job.statut==="In Progress"?C.green:job.statut==="Awarded"?C.purple:job.statut==="Closed"?C.gray:C.orange),
                      transition:"background .1s",
                    }}
                    onMouseEnter={e=>{if(!isSelected)e.currentTarget.style.background=C.bg}}
                    onMouseLeave={e=>{if(!isSelected)e.currentTarget.style.background="transparent"}}>

                    {/* Ligne 1 : ID + Statut */}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:10,color:C.text4,fontWeight:600}}>{job.id}</span>
                      <StatutBadge statut={job.statut}/>
                    </div>

                    {/* Ligne 2 : Nom */}
                    <div style={{fontSize:13,fontWeight:isSelected?700:600,color:isSelected?C.blue:C.text,marginBottom:3,lineHeight:1.4}}>
                      {job.name}
                    </div>

                    {/* Ligne 3 : Client + Type */}
                    <div style={{fontSize:11,color:C.text3,marginBottom:6}}>
                      {cust?.name||"—"} · {job.jobType}
                    </div>

                    {/* BC Ref */}
                    {job.bcRef&&(
                      <div style={{marginBottom:6}}>
                        <span style={{fontSize:10,padding:"1px 7px",borderRadius:10,background:C.orange_l,color:C.orange,fontWeight:600}}>{job.bcRef}</span>
                      </div>
                    )}

                    {/* Montants */}
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:11,color:C.text3}}>Contrat: <strong style={{color:C.blue}}>{fM(job.contractAmount)} F</strong></span>
                      <span style={{fontSize:11,color:C.text3}}>Facture: <strong style={{color:C.green}}>{fM(totalInv)} F</strong></span>
                    </div>

                    {/* Barre progression */}
                    <ProgBar value={totalInv} max={job.contractAmount||1} color={C.green} height={4} showPct={true}/>

                    {/* Couts reels */}
                    <div style={{marginTop:5,fontSize:10,color:totalCR>0?C.text3:C.text4}}>
                      Couts reels: {fM(totalCR)} F
                      {job.budgetEstime&&Object.values(job.budgetEstime).reduce((s,v)=>s+v,0)>0&&(
                        <span style={{marginLeft:6,color:totalCR>Object.values(job.budgetEstime).reduce((s,v)=>s+v,0)?C.red:C.text4}}>
                          / {fM(Object.values(job.budgetEstime).reduce((s,v)=>s+v,0))} F estime
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer liste */}
            <div style={{padding:"10px 12px",borderTop:"1px solid "+C.border,background:C.bg}}>
              <Btn label="Nouveau job" variant="primary" icon="plus" full onClick={()=>{setEditJob(null);setShowForm(true);}}/>
            </div>
          </div>

          {/* ===== DETAIL JOB (panneau principal) ===== */}
          <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
            {!selJob?(
              <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12,color:C.text4}}>
                <Ico n="job" s={48} c={C.border}/>
                <div style={{fontSize:16,color:C.text4}}>Selectionner un job</div>
                <Btn label="Creer un nouveau job" variant="primary" icon="plus" onClick={()=>setShowForm(true)}/>
              </div>
            ):(
              <DetailJob
                key={selJob.id}
                job={selJob}
                customers={CUSTOMERS}
                onEdit={()=>{setEditJob(selJob);setShowForm(true);}}
                onClose={()=>setSelJobId(null)}
                onCreateInvoice={()=>{}}
              />
            )}
          </div>
        </div>
      )}

      {/* Autres onglets — placeholder */}
      {activeTab!=="jobs"&&(
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"calc(100vh - 92px)",flexDirection:"column",gap:12}}>
          <Ico n={TABS_NAV.find(t=>t.id===activeTab)?.icon||"job"} s={48} c={C.border}/>
          <div style={{fontSize:16,color:C.text4}}>
            Module {TABS_NAV.find(t=>t.id===activeTab)?.label} — en cours de developpement
          </div>
          <Btn label="Retour au Job Center" variant="default" onClick={()=>setActiveTab("jobs")}/>
        </div>
      )}

      {/* Formulaire creation/edition */}
      {showForm&&(
        <FormJob
          initial={editJob}
          customers={CUSTOMERS}
          onSave={handleSaveJob}
          onClose={()=>{setShowForm(false);setEditJob(null);}}
        />
      )}
    </div>
  );
}
