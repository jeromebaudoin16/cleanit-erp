import { InvoiceForm, BillForm, CustomerForm, VendorForm, CustomerDetail, VendorDetail } from '../components/CIBForms';
import { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getPL, getBilan, getBalance, getInvoices, getBills, getJobs, getCustomers, getVendors, getPayments } from '../services/cleanitbooks.api';

// ═══ DESIGN SYSTEM QUICKBOOKS ONLINE 2025 ═══════════════════
const QB = {
  // Couleurs principales QB
  green:      '#2CA01C',  // Bouton primaire QB
  greenHover: '#1A8A0C',
  greenLight: '#EBF5E9',
  blue:       '#0077C5',  // Liens QB
  blueLight:  '#E6F1FB',
  blueDark:   '#004F8B',
  
  // Neutrals QB
  bg:         '#F4F5F7',  // Fond page QB
  white:      '#FFFFFF',
  gray1:      '#393A3D',  // Texte principal QB
  gray2:      '#6B6C72',  // Texte secondaire QB
  gray3:      '#9FA1A6',  // Placeholders QB
  gray4:      '#D4D6D8',  // Bordures QB
  gray5:      '#F4F5F7',  // Fond cartes QB
  
  // États QB
  orange:     '#FF8C00',
  orangeLight:'#FFF4E6',
  red:        '#D52B1E',
  redLight:   '#FEECEC',
  
  // Ombres QB
  shadow:     '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
  shadowMd:   '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)',
  
  // Radius QB
  radius:     4,
  radiusMd:   8,
};



// ── PDF FACTURE ──────────────────────────────────────────────────
const exportInvoicePDF = async (invoice, customer) => {
  if(!window.jspdf) {
    await new Promise(res => {
      const s1 = document.createElement('script');
      s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s1.onload = () => {
        const s2 = document.createElement('script');
        s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
        s2.onload = res;
        document.head.appendChild(s2);
      };
      document.head.appendChild(s1);
    });
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFillColor(44,160,28); doc.rect(0,0,220,32,'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(20); doc.setFont('helvetica','bold');
  doc.text('CLEANIT SARL', 14, 13);
  doc.setFontSize(9); doc.setFont('helvetica','normal');
  doc.text('Services Telecom - Douala, Cameroun', 14, 20);
  doc.setTextColor(0,0,0);
  doc.setFontSize(16); doc.setFont('helvetica','bold');
  doc.text('FACTURE', 148, 13);
  doc.setFontSize(10); doc.setFont('helvetica','normal');
  doc.text('N: '+(invoice.ref||invoice.id||'-'), 148, 20);
  doc.text('Date: '+(invoice.date||new Date().toLocaleDateString('fr-FR')), 148, 26);
  doc.setFillColor(240,250,240); doc.rect(12,38,85,26,'F');
  doc.setFontSize(9); doc.setFont('helvetica','bold');
  doc.text('FACTURE A:', 14, 45);
  doc.setFont('helvetica','normal');
  doc.text(String(customer?.company||customer?.name||'-'), 14, 52);
  doc.text(String(customer?.email||'-'), 14, 58);
  const rows = invoice.lines && invoice.lines.length > 0
    ? invoice.lines.map(l => [String(l.desc||l.description||'Service'),String(l.qty||1),String(l.unit||0)+' F',String(l.total||0)+' F'])
    : [['Prestations telecom','1',String(invoice.total||0)+' F',String(invoice.total||0)+' F']];
  doc.autoTable({head:[['Description','Qte','P.U.','Total']],body:rows,startY:70,
    headStyles:{fillColor:[44,160,28],textColor:255,fontSize:9},bodyStyles:{fontSize:9}});
  const y = doc.lastAutoTable.finalY + 8;
  const total = invoice.total||0;
  const tva = Math.round(total*0.1925);
  doc.setFontSize(9);
  doc.text('HT: '+total+' FCFA', 130, y+8);
  doc.text('TVA 19.25%: '+tva+' FCFA', 130, y+15);
  doc.setFillColor(44,160,28); doc.rect(120,y+20,76,12,'F');
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold');
  doc.text('TOTAL TTC: '+(total+tva)+' FCFA', 130, y+28);
  doc.setTextColor(100); doc.setFont('helvetica','normal'); doc.setFontSize(8);
  doc.text('Merci - CleanIT SARL', 105, 285, {align:'center'});
  doc.save('Facture_'+(invoice.ref||invoice.id||'XXX')+'_CleanIT.pdf');
};

// ── EXPORT XLSX UTILITY ────────────────────────────────────────
const exportXLSX = (rows, cols, filename) => {
  try {
    const data = rows.map(r => {
      const obj = {};
      cols.forEach(col => { obj[col.label] = r[col.key] !== undefined ? r[col.key] : ''; });
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Export');
    const today = new Date().toISOString().slice(0,10);
    XLSX.writeFile(wb, filename + '_' + today + '.xlsx');
  } catch(e) { alert('Erreur export: ' + e.message); }
};
const exportBalance = (rows) => exportXLSX(rows, [
  {key:'code',label:'Code'},{key:'nom',label:'Compte'},{key:'classe',label:'Classe'},
  {key:'debit',label:'Débit'},{key:'credit',label:'Crédit'},{key:'solde',label:'Solde'},
], 'Balance_CleanIT');
const exportPL = (pl) => {
  if(!pl) return;
  const rows = [
    ...( pl.produits||[]).map(p=>({categorie:'Produit',libelle:p.nom,montant:p.montant})),
    ...( pl.charges||[]).map(c=>({categorie:'Charge', libelle:c.nom,montant:c.montant})),
    {categorie:'RÉSULTAT', libelle:pl.beneficiaire?'Bénéfice net':'Perte nette', montant:pl.resultat},
  ];
  exportXLSX(rows,[{key:'categorie',label:'Catégorie'},{key:'libelle',label:'Libellé'},{key:'montant',label:'Montant FCFA'}],'PL_CleanIT');
};
const exportInvoicesList = (invoices, customers) => exportXLSX(invoices.map(inv => {
  const c = (customers||[]).find(x=>x.id===inv.customerId);
  return { ref:inv.ref||inv.id, client:c?.company||c?.name||inv.customerId||'—', date:inv.date||'—', echeance:inv.dueDate||'—', total:inv.total||0, statut:inv.status||'—', balance:inv.balance||0 };
}), [{key:'ref',label:'Référence'},{key:'client',label:'Client'},{key:'date',label:'Date'},{key:'echeance',label:'Échéance'},{key:'total',label:'Total'},{key:'statut',label:'Statut'},{key:'balance',label:'Solde dû'}], 'Factures_CleanIT');
const exportBillsList = (bills, vendors) => exportXLSX(bills.map(b => {
  const v = (vendors||[]).find(x=>x.id===b.vendorId);
  return { ref:b.ref||b.id, fournisseur:v?.company||v?.name||b.vendorId||'—', date:b.date||'—', total:b.total||0, statut:b.status||'—', balance:b.balance||0 };
}), [{key:'ref',label:'Référence'},{key:'fournisseur',label:'Fournisseur'},{key:'date',label:'Date'},{key:'total',label:'Total'},{key:'statut',label:'Statut'},{key:'balance',label:'Solde dû'}], 'Bills_CleanIT');

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
  brief:    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
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
  {id:"C003",name:"Client OEM", type:"OEM",        city:"Douala",   currency:"USD"},
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

const INIT_JOBS = []; // Données depuis CleanITBooks API

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
  const [budgetHW,   setBudgetHW]   = useState(initial?.budgetClient||"");
  const [contractAmt,setContractAmt]= useState(initial?.contractAmount||"");

  // Lignes Bon de commande
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
      budgetClient:+budgetHW||0,contractAmount:+contractAmt||0,
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
    {n:2,label:"Bon de commande (confidentiel)"},
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
        <div style={{padding:"16px 24px",borderBottom:"1px solid "+C.border,background:'#F4F5F7',display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
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
                    options={customers.map(c=>({v:c.id,l:c.company||c.name||c.id}))}/>
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

          {/* STEP 2 — Bon de commande confidentiel */}
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
                <Field label="Reference Bon de commande">
                  <Inp value={bcRef} onChange={setBcRef} placeholder="BC-2024-XXX"/>
                </Field>

                <Field label="Devise du BC">
                  <Sel value={currency} onChange={setCurrency} options={["FCFA","USD","EUR"]}/>
                </Field>

                <Field label="Montant total Client (prix Client)" required hint="Ce que Client vous paie — confidentiel">
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
                    {l:"Prix Client",v:fN(+budgetHW)+" "+currency,c:C.orange},
                    {l:"Contrat CleanIT",v:fN(+contractAmt)+" "+currency,c:C.blue},
                    {l:"Marge brute",v:fN(+budgetHW-+contractAmt)+" "+currency,c:+budgetHW>+contractAmt?C.green:C.red},
                  ].map((s,i)=>(
                    <div key={i} style={{padding:"12px 16px",background:'#F4F5F7',borderRadius:6,border:"1px solid "+C.border,borderTop:"3px solid "+s.c}}>
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
                      <tr style={{background:'#F4F5F7',borderBottom:"2px solid "+C.border}}>
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
                      <tr style={{borderTop:"2px solid "+C.border,background:'#F4F5F7'}}>
                        <td colSpan={3} style={{padding:"10px 12px",fontWeight:700,color:C.text}}>TOTAL BC CLIENT</td>
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
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,padding:"16px",background:'#F4F5F7',borderRadius:6,border:"1px solid "+C.border}}>
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
                    <div style={{padding:"12px 16px",background:'#F4F5F7',display:"flex",justifyContent:"space-between",alignItems:"center"}}>
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
                <div style={{marginTop:16,padding:"14px 16px",background:'#F4F5F7',borderRadius:6,border:"1px solid "+C.border}}>
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
                <div style={{padding:"16px",background:'#F4F5F7',borderRadius:6,border:"1px solid "+C.border}}>
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
                      {l:"Bon de commande",v:bcRef||"—"},
                      {l:"Budget Client",v:budgetHW?fN(+budgetHW)+" "+currency:"—"},
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
        <div style={{padding:"14px 24px",borderTop:"1px solid "+C.border,background:'#F4F5F7',display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
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
    {id:"bc",           label:"Bon de commande",           icon:"bc"},
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
            <div style={{fontSize:12,color:C.text3}}>{cust?.company||cust?.name||"—"} · Site {job.site||"—"} · {job.chefProjet}</div>
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
            {l:"Budget Client",      v:fN(job.budgetClient)+" F",  c:C.orange, lock:true,  sub:"Confidentiel"},
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
            <div style={{padding:"12px 16px",background:'#F4F5F7',borderRadius:6,border:"1px solid "+C.border2,marginBottom:16,fontSize:13,color:C.text2,lineHeight:1.7}}>
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
                  <div style={{padding:"12px 16px",background:'#F4F5F7',display:"flex",justifyContent:"space-between",alignItems:"center"}}>
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
              <Btn label="Nouvelle facture" variant="primary" sm icon="invoice" onClick={()=>navigate('/cleanitbooks/invoices/new')}/>
            </div>
            {job.invoices.length===0?(
              <div style={{textAlign:"center",padding:"40px",color:C.text4,fontSize:14,background:'#F4F5F7',borderRadius:6,border:"1px dashed "+C.border}}>
                Aucune facture pour ce job.<br/>
                <span style={{fontSize:12}}>Utilisez "Facturer une phase" pour creer votre premiere facture.</span>
              </div>
            ):(
              <div style={{border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:'#F4F5F7',borderBottom:"2px solid "+C.border}}>
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
                    <tr style={{background:'#F4F5F7',borderTop:"2px solid "+C.border}}>
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
              <div style={{textAlign:"center",padding:"40px",color:C.text4,fontSize:14,background:'#F4F5F7',borderRadius:6,border:"1px dashed "+C.border}}>
                Aucune depense enregistree pour ce job.
              </div>
            ):(
              <div style={{border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:'#F4F5F7',borderBottom:"2px solid "+C.border}}>
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
                    <tr style={{background:'#F4F5F7',borderTop:"2px solid "+C.border}}>
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
              <div style={{textAlign:"center",padding:"40px",color:C.text4,fontSize:14,background:'#F4F5F7',borderRadius:6,border:"1px dashed "+C.border}}>
                Aucune heure enregistree pour ce job.
              </div>
            ):(
              <div style={{border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:'#F4F5F7',borderBottom:"2px solid "+C.border}}>
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
                    <tr style={{background:'#F4F5F7',borderTop:"2px solid "+C.border}}>
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

        {/* BC CLIENT */}
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
                {l:"Prix Client",v:fN(job.budgetClient)+" "+job.currency,c:C.orange},
                {l:"Contrat CleanIT",v:fN(job.contractAmount)+" "+job.currency,c:C.blue},
                {l:"Marge brute",v:fN(job.budgetClient-job.contractAmount)+" "+job.currency,c:job.budgetClient>job.contractAmount?C.green:C.red},
              ].map((s,i)=>(
                <div key={i} style={{padding:"14px 16px",background:C.white,border:"1px solid "+C.border,borderRadius:6,borderTop:"3px solid "+s.c,textAlign:"center"}}>
                  <div style={{fontSize:11,color:C.text3,textTransform:"uppercase",letterSpacing:.4,marginBottom:5}}>{s.l}</div>
                  <div style={{fontSize:20,fontWeight:700,color:s.c}}>{s.v}</div>
                </div>
              ))}
            </div>

            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>Lignes du bon de commande Client</div>
            <div style={{border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:'#F4F5F7',borderBottom:"2px solid "+C.border}}>
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
                  <tr style={{background:'#F4F5F7',borderTop:"2px solid "+C.border}}>
                    <td colSpan={3} style={{padding:"12px 14px",fontWeight:700,color:C.text,fontSize:13}}>TOTAL BC CLIENT</td>
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
            <div style={{marginTop:16,padding:"12px 16px",background:'#F4F5F7',borderRadius:6,border:"1px solid "+C.border2}}>
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
//  COMPOSANT NAV PARTAGE — CIBTopBar
// ================================================================
const CIB_NAV = [
  {id:"jobs",      l:"Jobs",        icon:"job",     url:"/cleanitbooks/jobs"},
  {id:"customers", l:"Clients",     icon:"customer",url:"/cleanitbooks/customers"},
  {id:"vendors",   l:"Fournisseurs",icon:"vendor",  url:"/cleanitbooks/vendors"},
  {id:"invoices",  l:"Factures AR", icon:"invoice", url:"/cleanitbooks/invoices"},
  {id:"bills",     l:"Depenses AP", icon:"bill",    url:"/cleanitbooks/bills"},
  {id:"banking",   l:"Banking",     icon:"bank",    url:"/cleanitbooks/banking"},
  {id:"payroll",   l:"Paie RH",     icon:"payroll", url:"/cleanitbooks/payroll"},
  {id:"time",      l:"Heures",      icon:"time",    url:"/cleanitbooks/time"},
  {id:"reconciliation",l:"Rapprochement",icon:"bank",   url:"/cleanitbooks/reconciliation"},
  {id:"import-csv", l:"Import CSV",   icon:"download",url:"/cleanitbooks/import-csv"},
  {id:"recurring",  l:"Recurrentes", icon:"time",    url:"/cleanitbooks/recurring"},
  {id:"budget",     l:"Budget",      icon:"chart",   url:"/cleanitbooks/budget"},
  {id:"avoirs",     l:"Avoirs",      icon:"credit",  url:"/cleanitbooks/avoirs"},
  {id:"analytics",  l:"Analytics",   icon:"chart",   url:"/cleanitbooks/analytics"},
  {id:"reports",    l:"Rapports",    icon:"report",  url:"/cleanitbooks/reports"},
];

const CIBTopBar = ({title,icon,color,children}) => {
  return(
    <div style={{background:C.white,borderBottom:"1px solid "+C.border,padding:"8px 20px",display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:13,fontWeight:600,color:C.text}}>{title}</span>
      <div style={{flex:1}}/>
      {children}
    </div>
  );
};


// ================================================================
//  VENDOR CENTER — CleanITBooks
//  /cleanitbooks/vendors
//  /cleanitbooks/vendors/:vendorId
//  /cleanitbooks/vendors/new
// ================================================================

const INIT_VENDORS = []; // Données depuis CleanITBooks API

const VENDOR_TYPES  = ["Equipementier","Services","Telecom","Transport","Sous-traitant","Autre"];

// ================================================================
//  PAGE LISTE VENDORS
// ================================================================

// ═══ QB MONEY BAR — Barre financière QuickBooks style ═══════
const QBMoneyBar = ({items, actions}) => (
  <div style={{background:'#fff',borderBottom:'1px solid #E5E7EB',padding:'0 24px'}}>
    <div style={{display:'flex',alignItems:'stretch',gap:0}}>
      {items.map((item,i)=>(
        <div key={i} style={{
          padding:'16px 32px 16px 0', marginRight:32,
          borderRight:i<items.length-1?'1px solid #E5E7EB':'none',
          cursor:item.onClick?'pointer':'default'
        }} onClick={item.onClick}>
          <div style={{fontSize:11,fontWeight:700,color:'#6B6C72',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:6}}>{item.label}</div>
          <div style={{fontSize:22,fontWeight:700,color:item.color||'#393A3D'}}>{item.value}</div>
          {item.sub&&<div style={{fontSize:12,color:'#9FA1A6',marginTop:2}}>{item.sub}</div>}
        </div>
      ))}
      <div style={{flex:1}}/>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        {actions&&actions.map((a,i)=>(
          <button key={i} onClick={a.onClick} style={{
            background:a.primary?'#2CA01C':'#fff',
            color:a.primary?'#fff':'#393A3D',
            border:a.primary?'none':'1px solid #D4D6D8',
            borderRadius:4, padding:'8px 18px',
            fontSize:13, fontWeight:600, cursor:'pointer'
          }}>{a.label}</button>
        ))}
      </div>
    </div>
  </div>
);

// ═══ QB TABLE HEADER — En-tête tableau QuickBooks style ══════
const QBTableHead = ({cols}) => (
  <thead>
    <tr style={{background:'#F4F5F7'}}>
      {cols.map((col,i)=>(
        <th key={i} style={{
          padding:'10px 14px', textAlign:col.right?'right':'left',
          fontSize:12, fontWeight:700, color:'#6B6C72',
          textTransform:'uppercase', letterSpacing:'0.5px',
          borderBottom:'2px solid #E5E7EB', whiteSpace:'nowrap',
          width:col.w||'auto'
        }}>{col.l}</th>
      ))}
    </tr>
  </thead>
);

// ═══ QB EMPTY STATE — État vide QuickBooks style ═════════════
const QBEmpty = ({icon,title,sub,action,onAction}) => (
  <tr><td colSpan={20} style={{padding:'64px 24px',textAlign:'center'}}>
    <div style={{fontSize:56,marginBottom:16}}>{icon||'📋'}</div>
    <p style={{fontSize:16,fontWeight:700,color:'#393A3D',margin:'0 0 8px'}}>{title}</p>
    <p style={{fontSize:14,color:'#6B6C72',margin:'0 0 20px'}}>{sub||''}</p>
    {action&&<button onClick={onAction} style={{background:'#2CA01C',color:'#fff',border:'none',borderRadius:4,padding:'10px 24px',fontSize:14,fontWeight:600,cursor:'pointer'}}>{action}</button>}
  </td></tr>
);

// ═══ QB ACTION CELL — Cellule actions QuickBooks style ═══════
const QBActions = ({items}) => (
  <td style={{padding:'8px 14px',whiteSpace:'nowrap'}}>
    <div style={{display:'flex',gap:6,alignItems:'center'}}>
      {items.map((item,i)=>(
        <button key={i} onClick={item.onClick} style={{
          background:item.primary?'#2CA01C':item.danger?'#FEF3E2':'#F4F5F7',
          color:item.primary?'#fff':item.danger?'#E27000':'#393A3D',
          border:'none', borderRadius:4,
          padding:'5px 12px', fontSize:12, fontWeight:600, cursor:'pointer'
        }}>{item.label}</button>
      ))}
    </div>
  </td>
);
const PageVendorList = ({vendors,setVendors,jobs}) => {
  const navigate = useNavigate();
  const [search,     setSearch]     = useState("");
  const [filtreType, setFiltreType] = useState("Tous");

  const filtered = vendors.filter(v=>{
    const ms = !search||(v.company+v.contact+v.city+v.accountNum).toLowerCase().includes(search.toLowerCase());
    const mt = filtreType==="Tous"||v.type===filtreType;
    return ms&&mt;
  });

  const totalAP    = filtered.filter(v=>v.balance>0).reduce((s,v)=>s+v.balance,0);
  const totalBills = filtered.reduce((s,v)=>s+v.bills.length,0);

  return(
    <div style={{minHeight:"100vh",background:'#F4F5F7',fontFamily:"\"Segoe UI\",Arial,sans-serif"}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}*{box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px}`}</style>

      <CIBTopBar title="Vendor Center" icon="vendor" color={C.orange}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,background:'#F4F5F7',border:"1px solid "+C.border,borderRadius:4,padding:"6px 12px"}}>
            <Ico n="search" s={13} c={C.text4}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher fournisseur..."
              style={{border:"none",outline:"none",fontSize:12,color:C.text,background:"transparent",width:180,fontFamily:"inherit"}}/>
          </div>
          <Btn label="Nouveau fournisseur" variant="primary" sm icon="plus" onClick={()=>navigate('/cleanitbooks/vendors/new')}/>
        </div>
      </CIBTopBar>

      <div style={{padding:"24px",animation:"fadeUp .3s ease"}}>
        {/* KPIs */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          {[
            {l:"Fournisseurs actifs",  v:filtered.filter(v=>v.status==="Active").length, c:C.green,  icon:"vendor", sub:vendors.length+" au total"},
            {l:"Total AP du",          v:fM(totalAP)+" F",  c:C.red,    icon:"bill",   sub:filtered.filter(v=>v.balance>0).length+" avec solde ouvert"},
            {l:"Bills enregistres",    v:totalBills,        c:C.orange, icon:"invoice",sub:"Total toutes periodes"},
            {l:"Fournisseurs filtres", v:filtered.length,   c:C.text,   icon:"filter", sub:"Sur "+vendors.length+" total"},
          ].map((kpi,i)=>(
            <div key={i} style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"14px 16px",borderTop:"3px solid "+kpi.c}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:10,color:C.text3,textTransform:"uppercase",letterSpacing:.4,fontWeight:600}}>{kpi.l}</span>
                <div style={{width:28,height:28,borderRadius:4,background:kpi.c+"15",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n={kpi.icon} s={14} c={kpi.c}/></div>
              </div>
              <div style={{fontSize:20,fontWeight:700,color:kpi.c,marginBottom:3}}>{kpi.v}</div>
              <div style={{fontSize:11,color:C.text4}}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div style={{display:"flex",gap:10,marginBottom:14,alignItems:"center"}}>
          <select value={filtreType} onChange={e=>setFiltreType(e.target.value)}
            style={{padding:"7px 12px",borderRadius:4,border:"1px solid "+C.border,fontSize:12,color:C.text2,background:C.white,cursor:"pointer",fontFamily:"inherit",outline:"none"}}>
            {["Tous",...VENDOR_TYPES].map(t=><option key={t} value={t}>{t==="Tous"?"Tous les types":t}</option>)}
          </select>
          <div style={{marginLeft:"auto",display:"flex",gap:8}}>
            <Btn label="Saisir un bill" variant="ghost" sm icon="bill"/>
            <Btn label="Nouveau fournisseur" variant="primary" sm icon="plus" onClick={()=>navigate('/cleanitbooks/vendors/new')}/>
          </div>
        </div>

        {/* Tableau */}
        <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:800}}>
              <thead>
                <tr style={{background:"#F9FAFB",borderBottom:"2px solid "+C.border}}>
                  {["Fournisseur","Type","Ville","Contact","Conditions","Devise","Solde AP","Statut","Actions"].map((h,i)=>(
                    <th key={i} style={{padding:"10px 14px",textAlign:i===6?"right":"left",fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.4}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0&&<tr><td colSpan={9} style={{padding:"48px",textAlign:"center",color:C.text4}}>Aucun fournisseur</td></tr>}
                {filtered.map((v,i)=>{
                  const isAlt = i%2===1;
                  return(
                    <tr key={v.id} style={{borderBottom:"1px solid "+C.border2,cursor:"pointer",background:isAlt?"#FAFAFA":C.white,transition:"background .1s"}}
                      onMouseEnter={e=>e.currentTarget.style.background="#FFF7ED"}
                      onMouseLeave={e=>e.currentTarget.style.background=isAlt?"#FAFAFA":C.white}
                      onClick={()=>navigate("/cleanitbooks/vendors/"+v.id)}>
                      <td style={{padding:"13px 14px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:36,height:36,borderRadius:6,background:C.orange+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:C.orange,flexShrink:0}}>
                            {v.company.slice(0,2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{fontSize:13,fontWeight:700,color:C.orange}}>{v.company}</div>
                            <div style={{fontSize:10,color:C.text4}}>{v.accountNum} · {v.bills.length} bill(s)</div>
                          </div>
                        </div>
                      </td>
                      <td style={{padding:"13px 14px"}}><span style={{fontSize:11,padding:"3px 9px",borderRadius:10,background:C.orange+"15",color:C.orange,fontWeight:600}}>{v.type}</span></td>
                      <td style={{padding:"13px 14px",fontSize:12,color:C.text2}}>{v.city}</td>
                      <td style={{padding:"13px 14px"}}>
                        <div style={{fontSize:12,color:C.text2}}>{v.contact}</div>
                        <div style={{fontSize:11,color:C.text4}}>{v.title}</div>
                      </td>
                      <td style={{padding:"13px 14px",fontSize:12,color:C.text3}}>{v.terms}</td>
                      <td style={{padding:"13px 14px",textAlign:"center"}}><span style={{fontSize:11,padding:"2px 7px",borderRadius:10,background:v.currency==="USD"?C.orange_l:C.blue_l,color:v.currency==="USD"?C.orange:C.blue,fontWeight:600}}>{v.currency}</span></td>
                      <td style={{padding:"13px 14px",textAlign:"right",fontWeight:700,color:v.balance>0?C.red:C.green,fontSize:13}}>{v.balance>0?fN(v.balance)+" F":"—"}</td>
                      <td style={{padding:"13px 14px"}}><span style={{fontSize:11,padding:"3px 9px",borderRadius:10,fontWeight:600,background:v.status==="Active"?C.green_l:C.border2,color:v.status==="Active"?C.green:C.text3}}>{v.status==="Active"?"Actif":"Inactif"}</span></td>
                      <td style={{padding:"13px 14px"}} onClick={e=>e.stopPropagation()}>
                        <div style={{display:"flex",gap:4}}>
                          <Btn label="Ouvrir" variant="light" sm onClick={()=>navigate("/cleanitbooks/vendors/"+v.id)}/>
                          <Btn label="Bill" variant="primary" sm icon="bill"/>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {filtered.length>0&&(
                <tfoot>
                  <tr style={{background:"#F9FAFB",borderTop:"2px solid "+C.border}}>
                    <td colSpan={6} style={{padding:"10px 14px",fontWeight:700,color:C.text,fontSize:12}}>TOTAL AP — {filtered.length} fournisseur(s)</td>
                    <td style={{padding:"10px 14px",textAlign:"right",fontWeight:800,color:C.red,fontSize:14}}>{fM(totalAP)} F</td>
                    <td colSpan={2}/>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================================================================
//  PAGE DETAIL VENDOR
// ================================================================
const PageVendorDetail = ({vendors,jobs}) => {
  const navigate   = useNavigate();
  const {vendorId} = useParams();
  const [tab, setTab] = useState("overview");

  const vendor = vendors.find(v=>v.id===vendorId);

  if(!vendor) return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,background:'#F4F5F7'}}>
      <div style={{fontSize:18,color:C.text4}}>Fournisseur introuvable</div>
      <Btn label="Retour fournisseurs" variant="primary" onClick={()=>navigate("/cleanitbooks/vendors")}/>
    </div>
  );

  const totalBills  = vendor.bills.reduce((s,b)=>s+b.total,0);
  const totalPaid   = vendor.bills.reduce((s,b)=>s+(b.total-b.balance),0);
  const totalBalance= vendor.balance;
  const vendorJobs  = jobs.filter(j=>j.bcRef&&j.bcRef.includes(vendor.accountNum.split("-")[0]));

  const TABS = [
    {id:"overview",     l:"Vue generale",                       icon:"home"},
    {id:"transactions", l:"Bills ("+vendor.bills.length+")",    icon:"bill"},
    {id:"contacts",     l:"Contacts",                           icon:"customer"},
    {id:"notes",        l:"Notes",                              icon:"note"},
  ];

  return(
    <div style={{minHeight:"100vh",background:'#F4F5F7',fontFamily:"\"Segoe UI\",Arial,sans-serif"}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}*{box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px}`}</style>

      {/* TOPBAR */}
      <div style={{background:C.white,borderBottom:"1px solid "+C.border,position:"sticky",top:0,zIndex:200,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
        <div style={{display:"flex",alignItems:"center",padding:"0 24px",height:52,borderBottom:"1px solid "+C.border2}}>
          <div style={{display:"flex",alignItems:"center",gap:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",paddingRight:14,marginRight:6,borderRight:"1px solid "+C.border2}} onClick={()=>navigate("/cleanitbooks")}>
              <div style={{width:26,height:26,borderRadius:5,background:C.orange,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="vendor" s={13} c="white"/></div>
              <span style={{fontSize:12,fontWeight:700,color:C.text}}>CleanIT<span style={{color:C.green}}>Books</span></span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:4,padding:"0 10px"}}>
              <button onClick={()=>navigate("/cleanitbooks/vendors")} style={{border:"none",background:"none",cursor:"pointer",fontSize:12,color:C.blue,fontWeight:600,fontFamily:"inherit"}}>Vendor Center</button>
              <span style={{color:C.text4,fontSize:12}}>/</span>
              <span style={{fontSize:12,color:C.text,fontWeight:700}}>{vendor.company}</span>
            </div>
          </div>
          <div style={{flex:1}}/>
          <div style={{display:"flex",gap:8}}>
            <Btn label="Retour" variant="light" sm onClick={()=>navigate("/cleanitbooks/vendors")}/>
            <Btn label="Modifier" variant="default" sm icon="edit" onClick={()=>navigate("/cleanitbooks/vendors/"+vendorId+"/edit")}/>
            <Btn label="Saisir un bill" variant="primary" sm icon="bill"/>
          </div>
        </div>

        {/* Header vendor */}
        <div style={{padding:"16px 24px",borderBottom:"1px solid "+C.border2,background:C.white}}>
          <div style={{display:"flex",gap:16,alignItems:"flex-start",marginBottom:16}}>
            <div style={{width:56,height:56,borderRadius:10,background:C.orange+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:C.orange,flexShrink:0}}>
              {vendor.company.slice(0,2).toUpperCase()}
            </div>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                <span style={{fontSize:22,fontWeight:800,color:C.text}}>{vendor.company}</span>
                <span style={{fontSize:11,padding:"3px 9px",borderRadius:10,background:C.orange+"15",color:C.orange,fontWeight:600}}>{vendor.type}</span>
                <span style={{fontSize:11,padding:"3px 9px",borderRadius:10,background:vendor.status==="Active"?C.green_l:C.border2,color:vendor.status==="Active"?C.green:C.text3,fontWeight:600}}>{vendor.status==="Active"?"Actif":"Inactif"}</span>
              </div>
              <div style={{fontSize:13,color:C.text3,marginBottom:2}}>{vendor.contact} · {vendor.title} · {vendor.phone}</div>
              <div style={{fontSize:12,color:C.text4}}>{vendor.address}, {vendor.city} · {vendor.accountNum}</div>
            </div>
          </div>

          {/* KPIs */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {[
              {l:"Total bills",   v:fN(totalBills)+" "+vendor.currency,   c:C.orange},
              {l:"Total paye",    v:fN(totalPaid)+" "+vendor.currency,    c:C.green},
              {l:"Solde du",      v:fN(totalBalance)+" "+vendor.currency, c:totalBalance>0?C.red:C.green},
              {l:"Conditions",    v:vendor.terms,                          c:C.text},
            ].map((kpi,i)=>(
              <div key={i} style={{padding:"10px 14px",background:kpi.c+"08",borderRadius:6,border:"1px solid "+kpi.c+"25",borderTop:"3px solid "+kpi.c}}>
                <div style={{fontSize:9,color:kpi.c,textTransform:"uppercase",letterSpacing:.5,fontWeight:700,marginBottom:4}}>{kpi.l}</div>
                <div style={{fontSize:15,fontWeight:800,color:kpi.c}}>{kpi.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Onglets */}
        <div style={{display:"flex",padding:"0 24px",background:C.white,overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{display:"flex",alignItems:"center",gap:6,padding:"0 16px",height:42,border:"none",background:"transparent",borderBottom:tab===t.id?"2px solid "+C.orange:"2px solid transparent",color:tab===t.id?C.orange:C.text3,fontWeight:tab===t.id?700:400,fontSize:12,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
              <Ico n={t.icon} s={13} c={tab===t.id?C.orange:C.text3}/>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENU */}
      <div style={{padding:"24px",animation:"fadeUp .25s ease"}}>

        {/* OVERVIEW */}
        {tab==="overview"&&(
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:20}}>
            <div>
              <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden",marginBottom:16}}>
                <div style={{padding:"12px 16px",borderBottom:"1px solid "+C.border,fontSize:13,fontWeight:700,color:C.text}}>Informations fournisseur</div>
                <div style={{padding:"14px 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
                  {[{l:"Entreprise",v:vendor.company},{l:"Type",v:vendor.type},{l:"N Compte",v:vendor.accountNum},{l:"Statut",v:vendor.status==="Active"?"Actif":"Inactif"},{l:"Conditions",v:vendor.terms},{l:"Devise",v:vendor.currency},{l:"ID Fiscal",v:vendor.taxId||"—"},{l:"Limite credit",v:fM(vendor.creditLimit)+" "+vendor.currency},{l:"Pays",v:vendor.country},{l:"Client depuis",v:vendor.dateCreation}].map((it,i)=>(
                    <div key={it.l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<9?"1px solid "+C.border2:"none"}}>
                      <span style={{fontSize:12,color:C.text3}}>{it.l}</span>
                      <span style={{fontSize:12,fontWeight:600,color:C.text}}>{it.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bills recents */}
              <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
                <div style={{padding:"12px 16px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:13,fontWeight:700,color:C.text}}>Bills recents ({vendor.bills.length})</span>
                  <Btn label="Voir tous" variant="light" sm onClick={()=>setTab("transactions")}/>
                </div>
                {vendor.bills.length===0?(
                  <div style={{padding:"24px",textAlign:"center",color:C.text4,fontSize:13}}>Aucun bill pour ce fournisseur</div>
                ):vendor.bills.slice(0,3).map((b,i)=>(
                  <div key={b.id} style={{padding:"12px 16px",borderBottom:i<Math.min(vendor.bills.length,3)-1?"1px solid "+C.border2:"none"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:C.orange}}>{b.id}</div>
                        <div style={{fontSize:11,color:C.text4}}>{b.memo}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:13,fontWeight:700,color:C.red}}>{fM(b.total)} F</div>
                        <StatutBadge statut={b.status}/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel droit */}
            <div>
              <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden",marginBottom:14}}>
                <div style={{padding:"12px 16px",borderBottom:"1px solid "+C.border,fontSize:13,fontWeight:700,color:C.text}}>Contact principal</div>
                <div style={{padding:"14px 16px"}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:C.orange+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:C.orange,marginBottom:10}}>
                    {(vendor.contact||"?").split(" ").map(n=>n[0]).join("").slice(0,2)}
                  </div>
                  <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:2}}>{vendor.contact}</div>
                  <div style={{fontSize:12,color:C.text3,marginBottom:10}}>{vendor.title}</div>
                  {[{icon:"phone",v:vendor.phone},{icon:"mail",v:vendor.email}].filter(c=>c.v).map((it,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                      <Ico n={it.icon} s={14} c={C.text4}/>
                      <span style={{fontSize:12,color:C.blue}}>{it.v}</span>
                    </div>
                  ))}
                  <div style={{marginTop:12,display:"flex",gap:6}}>
                    <Btn label="Appeler" variant="ghost" sm icon="phone" full onClick={()=>window.open("tel:"+vendor.phone)}/>
                    <Btn label="Email" variant="light" sm icon="mail" full onClick={()=>window.open("mailto:"+vendor.email)}/>
                  </div>
                </div>
              </div>

              <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"14px 16px"}}>
                <div style={{fontSize:12,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.4,marginBottom:10}}>AP Aging</div>
                {[{l:"Courant",v:0,c:C.green},{l:"1-30 jours",v:vendor.balance>0?vendor.balance:0,c:C.orange},{l:"31-60 jours",v:0,c:C.red},{l:"Total du",v:vendor.balance,c:C.red}].map((s,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<3?"1px solid "+C.border2:"none"}}>
                    <span style={{fontSize:12,color:C.text3}}>{s.l}</span>
                    <span style={{fontSize:13,fontWeight:i===3?700:600,color:s.v>0?s.c:C.text4}}>{s.v>0?fN(s.v)+" F":"—"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TRANSACTIONS */}
        {tab==="transactions"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:16,fontWeight:700,color:C.text}}>Bills — {vendor.company}</div>
              <Btn label="Saisir un bill" variant="primary" sm icon="bill"/>
            </div>
            {vendor.bills.length===0?(
              <div style={{padding:"60px",textAlign:"center",background:C.white,border:"1px dashed "+C.border,borderRadius:6}}>
                <Ico n="bill" s={40} c={C.border}/>
                <div style={{fontSize:15,color:C.text4,marginTop:12,marginBottom:16}}>Aucun bill pour ce fournisseur</div>
                <Btn label="Saisir un bill" variant="primary" icon="bill"/>
              </div>
            ):(
              <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:"#F9FAFB",borderBottom:"2px solid "+C.border}}>
                      {["N Bill","Date","Echeance","Description","Montant","Solde","Statut","Actions"].map((h,i)=>(
                        <th key={i} style={{padding:"10px 14px",textAlign:i>=4&&i<=5?"right":"left",fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.3}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vendor.bills.map((b,i)=>(
                      <tr key={b.id} style={{borderBottom:"1px solid "+C.border2,transition:"background .1s"}}
                        onMouseEnter={e=>e.currentTarget.style.background="#FFF7ED"}
                        onMouseLeave={e=>e.currentTarget.style.background=C.white}>
                        <td style={{padding:"12px 14px",fontWeight:700,color:C.orange}}>{b.id}</td>
                        <td style={{padding:"12px 14px",color:C.text3,fontSize:12}}>{fD(b.date)}</td>
                        <td style={{padding:"12px 14px",color:C.text3,fontSize:12}}>{fD(b.dueDate)}</td>
                        <td style={{padding:"12px 14px",fontSize:12,color:C.text2}}>{b.memo}</td>
                        <td style={{padding:"12px 14px",textAlign:"right",fontWeight:600,fontSize:13}}>{fN(b.total)} {vendor.currency}</td>
                        <td style={{padding:"12px 14px",textAlign:"right",fontWeight:700,color:b.balance>0?C.red:C.green,fontSize:13}}>{fN(b.balance)} {vendor.currency}</td>
                        <td style={{padding:"12px 14px"}}><StatutBadge statut={b.status}/></td>
                        <td style={{padding:"12px 14px"}}>{b.balance>0&&<Btn label="Payer" variant="primary" sm/>}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{background:"#F9FAFB",borderTop:"2px solid "+C.border}}>
                      <td colSpan={4} style={{padding:"10px 14px",fontWeight:700,color:C.text}}>Total</td>
                      <td style={{padding:"10px 14px",textAlign:"right",fontWeight:800,color:C.orange,fontSize:14}}>{fN(totalBills)} {vendor.currency}</td>
                      <td style={{padding:"10px 14px",textAlign:"right",fontWeight:800,color:totalBalance>0?C.red:C.green,fontSize:14}}>{fN(totalBalance)} {vendor.currency}</td>
                      <td colSpan={2}/>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* CONTACTS */}
        {tab==="contacts"&&(
          <div style={{maxWidth:600}}>
            <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:16}}>Informations de contact</div>
            <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
              {[{l:"Entreprise",v:vendor.company},{l:"Contact",v:vendor.contact},{l:"Titre",v:vendor.title},{l:"Telephone",v:vendor.phone},{l:"Mobile",v:vendor.mobile||"—"},{l:"Email",v:vendor.email},{l:"Adresse",v:vendor.address},{l:"Ville",v:vendor.city},{l:"Pays",v:vendor.country}].map((it,i)=>(
                <div key={it.l} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:i<8?"1px solid "+C.border2:"none"}}>
                  <span style={{fontSize:12,color:C.text3,minWidth:100}}>{it.l}</span>
                  <span style={{fontSize:13,fontWeight:500,color:C.text}}>{it.v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NOTES */}
        {tab==="notes"&&(
          <div style={{maxWidth:700}}>
            <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:16}}>Notes internes</div>
            <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"16px",fontSize:13,color:C.text2,lineHeight:1.8,minHeight:100}}>
              {vendor.notes||<span style={{color:C.text4}}>Aucune note.</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// ================================================================
//  CUSTOMER CENTER — CleanITBooks
//  Page liste + Page detail + Formulaire creation/edition
//  URL: /cleanitbooks/customers
//  URL: /cleanitbooks/customers/:custId
//  URL: /cleanitbooks/customers/new
// ================================================================

const INIT_CUSTOMERS = []; // Données depuis CleanITBooks API

const CUSTOMER_TYPES = ["Telecom","OEM","Public","Privé","Autre"];
const PAYMENT_TERMS  = ["Net 15","Net 30","Net 45","Net 60","Net 90","Immediate","2/10 Net 30"];
const TAX_CODES      = ["TVA","Exonere","Hors champ"];
const CURRENCIES_LIST= ["FCFA","USD","EUR","CNY"];
const PRICE_LEVELS   = ["Standard","International","Gouvernement","Premium","Partenaire"];
const REGIONS_CM     = ["Littoral","Centre","Ouest","Nord-Ouest","Sud-Ouest","Nord","Adamaoua","Est","Sud","Extreme-Nord"];

// ================================================================
//  PAGE LISTE CLIENTS
// ================================================================
const PageCustomerList = ({customers,setCustomers,invoices,jobs}) => {
  const navigate = useNavigate();
  const [search,     setSearch]     = useState("");
  const [filtreType, setFiltreType] = useState("Tous");
  const [filtreStatut,setFiltreStatut]=useState("Tous");
  const [sortField,  setSortField]  = useState("company");
  const [sortAsc,    setSortAsc]    = useState(true);

  const filtered = customers.filter(c=>{
    const ms = !search||(c.company+c.contact+c.city+c.accountNum).toLowerCase().includes(search.toLowerCase());
    const mt = filtreType==="Tous"||c.type===filtreType;
    const ms2= filtreStatut==="Tous"||c.status===filtreStatut;
    return ms&&mt&&ms2;
  }).sort((a,b)=>{
    const va=a[sortField]||""; const vb=b[sortField]||"";
    return sortAsc?va>vb?1:-1:va<vb?1:-1;
  });

  const totalBalance  = filtered.reduce((s,c)=>s+c.balance,0);
  const totalCredit   = filtered.reduce((s,c)=>s+c.creditLimit,0);
  const activeCount   = filtered.filter(c=>c.status==="Active").length;
  const overdueCount  = filtered.filter(c=>c.balance>0&&invoices.filter(i=>i.customerId===c.id&&i.status==="Overdue").length>0).length;

  const sortHdr = (field,label) => (
    <span style={{cursor:"pointer",display:"inline-flex",alignItems:"center",gap:4,userSelect:"none"}}
      onClick={()=>{if(sortField===field)setSortAsc(s=>!s);else{setSortField(field);setSortAsc(true);}}}>
      {label}
      {sortField===field&&<span style={{fontSize:9}}>{sortAsc?"▲":"▼"}</span>}
    </span>
  );

  return(
    <div style={{minHeight:"100vh",background:'#F4F5F7',fontFamily:"\"Segoe UI\",Arial,sans-serif"}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}*{box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px}`}</style>

      <CIBTopBar title="Customer Center" icon="customer" color={C.green}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,background:'#F4F5F7',border:"1px solid "+C.border,borderRadius:4,padding:"6px 12px"}}>
            <Ico n="search" s={13} c={C.text4}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher client..."
              style={{border:"none",outline:"none",fontSize:12,color:C.text,background:"transparent",width:180,fontFamily:"inherit"}}/>
          </div>
          <Btn label="Nouveau client" variant="primary" sm icon="plus" onClick={()=>navigate('/cleanitbooks/customers/new')}/>
        </div>
      </CIBTopBar>

      {/* CONTENU */}
      <div style={{padding:"24px",animation:"fadeUp .3s ease"}}>

        {/* KPIs */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:20}}>
          {[
            {l:"Clients actifs",       v:activeCount,             c:C.green,  icon:"customer", sub:customers.length+" au total"},
            {l:"Encours total AR",     v:fM(totalBalance)+" F",   c:C.orange, icon:"invoice",  sub:filtered.filter(c=>c.balance>0).length+" avec solde ouvert"},
            {l:"Limite credit totale", v:fM(totalCredit)+" F",    c:C.blue,   icon:"money",    sub:"Capacite maximale"},
            {l:"En retard",            v:overdueCount,            c:C.red,    icon:"alert",    sub:"Clients avec factures en retard"},
            {l:"Clients filtres",      v:filtered.length,         c:C.text,   icon:"filter",   sub:"Sur "+customers.length+" total"},
          ].map((kpi,i)=>(
            <div key={i} style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"14px 16px",borderTop:"3px solid "+kpi.c}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:10,color:C.text3,textTransform:"uppercase",letterSpacing:.4,fontWeight:600}}>{kpi.l}</span>
                <div style={{width:28,height:28,borderRadius:4,background:kpi.c+"15",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n={kpi.icon} s={14} c={kpi.c}/></div>
              </div>
              <div style={{fontSize:20,fontWeight:700,color:kpi.c,marginBottom:3}}>{kpi.v}</div>
              <div style={{fontSize:11,color:C.text4}}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Filtres + actions */}
        <div style={{display:"flex",gap:10,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
          <select value={filtreType} onChange={e=>setFiltreType(e.target.value)}
            style={{padding:"7px 12px",borderRadius:4,border:"1px solid "+C.border,fontSize:12,color:C.text2,background:C.white,cursor:"pointer",fontFamily:"inherit",outline:"none"}}>
            {["Tous",...CUSTOMER_TYPES].map(t=><option key={t} value={t}>{t==="Tous"?"Tous les types":t}</option>)}
          </select>
          <select value={filtreStatut} onChange={e=>setFiltreStatut(e.target.value)}
            style={{padding:"7px 12px",borderRadius:4,border:"1px solid "+C.border,fontSize:12,color:C.text2,background:C.white,cursor:"pointer",fontFamily:"inherit",outline:"none"}}>
            {["Tous","Active","Inactive"].map(s=><option key={s} value={s}>{s==="Tous"?"Tous les statuts":s}</option>)}
          </select>
          <div style={{marginLeft:"auto",display:"flex",gap:8}}>
            <Btn label="Importer" variant="light" sm icon="import"/>
            <Btn label="Exporter" variant="light" sm icon="download" onClick={async ()=>{
              const ExcelJS = (await import("exceljs")).default;
              const wb = new ExcelJS.Workbook();
              const ws = wb.addWorksheet("Clients");
              ws.columns = [{key:"id",width:14,header:"ID"},{key:"company",width:30,header:"Entreprise"},{key:"contact",width:20,header:"Contact"},{key:"type",width:14,header:"Type"},{key:"city",width:16,header:"Ville"},{key:"terms",width:14,header:"Conditions"},{key:"currency",width:10,header:"Devise"},{key:"balance",width:18,header:"Solde FCFA"},{key:"creditLimit",width:18,header:"Limite Credit"},{key:"status",width:12,header:"Statut"}];
              const hdrRow = ws.getRow(1);
              hdrRow.eachCell(cell=>{ cell.font={name:"Calibri",bold:true,color:{argb:"FFFFFFFF"},size:10}; cell.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FF1F4E79"}}; cell.alignment={horizontal:"center",vertical:"middle"}; });
              filtered.forEach((c,i)=>{ const row=ws.addRow({id:c.id,company:c.company,contact:c.contact,type:c.type,city:c.city,terms:c.terms,currency:c.currency,balance:c.balance,creditLimit:c.creditLimit,status:c.status}); if(i%2===1) row.eachCell(cell=>cell.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FFDEEAF1"}}); });
              const buf=await wb.xlsx.writeBuffer();
              const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([buf],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}));
              a.download="CleanITBooks_Clients_"+new Date().toISOString().split("T")[0]+".xlsx"; a.click();
            }}/>
            <Btn label="Nouveau client" variant="primary" sm icon="plus" onClick={()=>navigate('/cleanitbooks/customers/new')}/>
          </div>
        </div>

        {/* Tableau clients */}
        <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:900}}>
              <thead>
                <tr style={{background:"#F9FAFB",borderBottom:"2px solid "+C.border}}>
                  {[
                    {f:"company",  l:"Entreprise",       w:""},
                    {f:"type",     l:"Type",             w:120},
                    {f:"city",     l:"Ville",            w:120},
                    {f:"contact",  l:"Contact",          w:160},
                    {f:"terms",    l:"Conditions",       w:110},
                    {f:"currency", l:"Devise",           w:80},
                    {f:"balance",  l:"Solde ouvert",     w:150,r:true},
                    {f:"creditLimit",l:"Limite credit",  w:150,r:true},
                    {f:"status",   l:"Statut",           w:100},
                    {f:"",         l:"Actions",          w:120},
                  ].map((h,i)=>(
                    <th key={i} style={{padding:"10px 14px",textAlign:h.r?"right":"left",fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.4,whiteSpace:"nowrap",width:h.w||"auto"}}>
                      {h.f?sortHdr(h.f,h.l):h.l}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0&&(
                  <tr><td colSpan={10} style={{padding:"48px",textAlign:"center",color:C.text4,fontSize:14}}>Aucun client ne correspond aux filtres</td></tr>
                )}
                {filtered.map((cust,i)=>{
                  const custInvs = invoices.filter(inv=>inv.customerId===cust.id);
                  const custJobs = jobs.filter(j=>j.customerId===cust.id);
                  const hasOverdue = custInvs.some(inv=>inv.status==="Overdue");
                  const isAlt = i%2===1;

                  return(
                    <tr key={cust.id}
                      style={{borderBottom:"1px solid "+C.border2,cursor:"pointer",background:isAlt?"#FAFAFA":C.white,transition:"background .1s"}}
                      onMouseEnter={e=>e.currentTarget.style.background="#EFF6FF"}
                      onMouseLeave={e=>e.currentTarget.style.background=isAlt?"#FAFAFA":C.white}
                      onClick={()=>navigate("/cleanitbooks/customers/"+cust.id)}>

                      <td style={{padding:"13px 14px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:36,height:36,borderRadius:6,background:C.green+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:C.green,flexShrink:0}}>
                            {cust.company.slice(0,2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{fontSize:13,fontWeight:700,color:C.blue,marginBottom:2}}>{cust.company}</div>
                            <div style={{fontSize:10,color:C.text4}}>{cust.accountNum} · {custJobs.length} job(s)</div>
                          </div>
                          {hasOverdue&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:10,background:C.red_l,color:C.red,fontWeight:600,flexShrink:0}}>En retard</span>}
                        </div>
                      </td>
                      <td style={{padding:"13px 14px"}}>
                        <span style={{fontSize:11,padding:"3px 9px",borderRadius:10,background:cust.type==="Telecom"?C.blue+"15":cust.type==="Public"?C.purple_l:C.border2,color:cust.type==="Telecom"?C.blue:cust.type==="Public"?C.purple:C.text3,fontWeight:600}}>{cust.type}</span>
                      </td>
                      <td style={{padding:"13px 14px",fontSize:12,color:C.text2}}>{cust.city}</td>
                      <td style={{padding:"13px 14px"}}>
                        <div style={{fontSize:12,color:C.text2}}>{cust.contact}</div>
                        <div style={{fontSize:11,color:C.text4}}>{cust.title}</div>
                      </td>
                      <td style={{padding:"13px 14px",fontSize:12,color:C.text3}}>{cust.terms}</td>
                      <td style={{padding:"13px 14px",textAlign:"center"}}>
                        <span style={{fontSize:11,padding:"2px 7px",borderRadius:10,background:cust.currency==="USD"?C.orange_l:C.blue_l,color:cust.currency==="USD"?C.orange:C.blue,fontWeight:600}}>{cust.currency}</span>
                      </td>
                      <td style={{padding:"13px 14px",textAlign:"right",fontWeight:700,color:cust.balance>0?C.orange:C.green,fontSize:13}}>
                        {cust.balance>0?fN(cust.balance)+" F":"—"}
                      </td>
                      <td style={{padding:"13px 14px",textAlign:"right",color:C.text3,fontSize:12}}>
                        {fM(cust.creditLimit)} F
                      </td>
                      <td style={{padding:"13px 14px"}}>
                        <span style={{fontSize:11,padding:"3px 9px",borderRadius:10,fontWeight:600,background:cust.status==="Active"?C.green_l:C.border2,color:cust.status==="Active"?C.green:C.text3}}>
                          {cust.status==="Active"?"Actif":"Inactif"}
                        </span>
                      </td>
                      <td style={{padding:"13px 14px"}} onClick={e=>e.stopPropagation()}>
                        <div style={{display:"flex",gap:4}}>
                          <Btn label="Ouvrir" variant="light" sm onClick={()=>navigate("/cleanitbooks/customers/"+cust.id)}/>
                          <Btn label="Modifier" variant="ghost" sm onClick={()=>navigate("/cleanitbooks/customers/"+cust.id+"/edit")}/>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {filtered.length>0&&(
                <tfoot>
                  <tr style={{background:"#F9FAFB",borderTop:"2px solid "+C.border}}>
                    <td colSpan={6} style={{padding:"10px 14px",fontWeight:700,color:C.text,fontSize:12}}>TOTAL — {filtered.length} client(s)</td>
                    <td style={{padding:"10px 14px",textAlign:"right",fontWeight:800,color:C.orange,fontSize:14}}>{fM(totalBalance)} F</td>
                    <td style={{padding:"10px 14px",textAlign:"right",fontWeight:700,color:C.blue,fontSize:13}}>{fM(totalCredit)} F</td>
                    <td colSpan={2}/>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================================================================
//  PAGE DETAIL CLIENT
// ================================================================
const PageCustomerDetail = ({customers,invoices,jobs}) => {
  const navigate = useNavigate();
  const {custId} = useParams();
  const [tab, setTab] = useState("overview");

  const cust     = customers.find(c=>c.id===custId);
  const custInvs = invoices.filter(i=>i.customerId===custId);
  const custJobs = jobs.filter(j=>j.customerId===custId);

  if(!cust) return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,background:'#F4F5F7'}}>
      <div style={{fontSize:18,color:C.text4}}>Client introuvable</div>
      <Btn label="Retour clients" variant="primary" onClick={()=>navigate("/cleanitbooks/customers")}/>
    </div>
  );

  const totalInvoiced = custInvs.reduce((s,i)=>s+i.total,0);
  const totalPaid     = custInvs.reduce((s,i)=>s+i.amountPaid,0);
  const totalBalance  = custInvs.reduce((s,i)=>s+i.balance,0);
  const hasOverdue    = custInvs.some(i=>i.status==="Overdue");
  const totalContrats = custJobs.reduce((s,j)=>s+j.contractAmount,0);

  const TABS = [
    {id:"overview",   l:"Vue generale",                 icon:"home"},
    {id:"transactions",l:"Transactions ("+custInvs.length+")", icon:"invoice"},
    {id:"jobs",       l:"Jobs ("+custJobs.length+")",   icon:"job"},
    {id:"contacts",   l:"Contacts",                     icon:"customer"},
    {id:"notes",      l:"Notes",                        icon:"note"},
  ];

  return(
    <div style={{minHeight:"100vh",background:'#F4F5F7',fontFamily:"\"Segoe UI\",Arial,sans-serif"}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}*{box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px}`}</style>

      {/* TOPBAR */}
      <div style={{background:C.white,borderBottom:"1px solid "+C.border,position:"sticky",top:0,zIndex:200,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
        <div style={{display:"flex",alignItems:"center",padding:"0 24px",height:52,borderBottom:"1px solid "+C.border2}}>
          <div style={{display:"flex",alignItems:"center",gap:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",paddingRight:14,marginRight:6,borderRight:"1px solid "+C.border2}} onClick={()=>navigate("/cleanitbooks")}>
              <div style={{width:26,height:26,borderRadius:5,background:C.green,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="customer" s={13} c="white"/></div>
              <span style={{fontSize:12,fontWeight:700,color:C.text}}>CleanIT<span style={{color:C.green}}>Books</span></span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:4,padding:"0 10px"}}>
              <button onClick={()=>navigate("/cleanitbooks/customers")} style={{border:"none",background:"none",cursor:"pointer",fontSize:12,color:C.blue,fontWeight:600,fontFamily:"inherit",padding:"4px 6px",borderRadius:4}}>Customer Center</button>
              <span style={{color:C.text4,fontSize:12}}>/</span>
              <span style={{fontSize:12,color:C.text,fontWeight:700}}>{cust.company}</span>
            </div>
          </div>
          <div style={{flex:1}}/>
          <div style={{display:"flex",gap:8}}>
            <Btn label="Retour" variant="light" sm onClick={()=>navigate("/cleanitbooks/customers")}/>
            <Btn label="Modifier" variant="default" sm icon="edit" onClick={()=>navigate("/cleanitbooks/customers/"+custId+"/edit")}/>
            <Btn label="Nouvelle facture" variant="primary" sm icon="invoice" onClick={()=>navigate('/cleanitbooks/invoices/new')}/>
          </div>
        </div>

        {/* Header client */}
        <div style={{padding:"16px 24px",borderBottom:"1px solid "+C.border2,background:C.white}}>
          <div style={{display:"flex",gap:16,alignItems:"flex-start",marginBottom:16}}>
            <div style={{width:56,height:56,borderRadius:10,background:C.green+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:C.green,flexShrink:0}}>
              {cust.company.slice(0,2).toUpperCase()}
            </div>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
                <span style={{fontSize:22,fontWeight:800,color:C.text}}>{cust.company}</span>
                <span style={{fontSize:11,padding:"3px 9px",borderRadius:10,background:cust.type==="Telecom"?C.blue+"15":C.border2,color:cust.type==="Telecom"?C.blue:C.text3,fontWeight:600}}>{cust.type}</span>
                <span style={{fontSize:11,padding:"3px 9px",borderRadius:10,background:cust.status==="Active"?C.green_l:C.border2,color:cust.status==="Active"?C.green:C.text3,fontWeight:600}}>{cust.status==="Active"?"Actif":"Inactif"}</span>
                {hasOverdue&&<span style={{fontSize:11,padding:"3px 9px",borderRadius:10,background:C.red_l,color:C.red,fontWeight:600}}>Factures en retard</span>}
              </div>
              <div style={{fontSize:13,color:C.text3,marginBottom:2}}>{cust.contact} · {cust.title} · {cust.phone}</div>
              <div style={{fontSize:12,color:C.text4}}>{cust.address}, {cust.city} · {cust.accountNum}</div>
            </div>
          </div>

          {/* 5 KPIs client */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
            {[
              {l:"Total facture",     v:fN(totalInvoiced)+" "+cust.currency, c:C.blue},
              {l:"Total encaisse",    v:fN(totalPaid)+" "+cust.currency,     c:C.green},
              {l:"Solde ouvert",      v:fN(totalBalance)+" "+cust.currency,  c:totalBalance>0?C.orange:C.green},
              {l:"Limite credit",     v:fM(cust.creditLimit)+" "+cust.currency, c:C.text},
              {l:"Contrats jobs",     v:fM(totalContrats)+" FCFA",           c:C.purple},
            ].map((kpi,i)=>(
              <div key={i} style={{padding:"10px 14px",background:kpi.c+"08",borderRadius:6,border:"1px solid "+kpi.c+"25",borderTop:"3px solid "+kpi.c}}>
                <div style={{fontSize:9,color:kpi.c,textTransform:"uppercase",letterSpacing:.5,fontWeight:700,marginBottom:4}}>{kpi.l}</div>
                <div style={{fontSize:15,fontWeight:800,color:kpi.c}}>{kpi.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Onglets */}
        <div style={{display:"flex",padding:"0 24px",background:C.white,overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{display:"flex",alignItems:"center",gap:6,padding:"0 16px",height:42,border:"none",background:"transparent",borderBottom:tab===t.id?"2px solid "+C.blue:"2px solid transparent",color:tab===t.id?C.blue:C.text3,fontWeight:tab===t.id?700:400,fontSize:12,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
              <Ico n={t.icon} s={13} c={tab===t.id?C.blue:C.text3}/>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENU ONGLETS */}
      <div style={{padding:"24px",animation:"fadeUp .25s ease"}}>

        {/* OVERVIEW */}
        {tab==="overview"&&(
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:20}}>
            {/* Infos client */}
            <div>
              <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden",marginBottom:16}}>
                <div style={{padding:"12px 16px",borderBottom:"1px solid "+C.border,fontSize:13,fontWeight:700,color:C.text}}>Informations generales</div>
                <div style={{padding:"14px 16px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
                  {[
                    {l:"Entreprise",  v:cust.company},
                    {l:"Type",        v:cust.type},
                    {l:"N Compte",    v:cust.accountNum},
                    {l:"Statut",      v:cust.status==="Active"?"Actif":"Inactif"},
                    {l:"Conditions",  v:cust.terms},
                    {l:"Devise",      v:cust.currency},
                    {l:"Code TVA",    v:cust.taxCode},
                    {l:"ID Fiscal",   v:cust.taxId||"—"},
                    {l:"Limite credit",v:fM(cust.creditLimit)+" "+cust.currency},
                    {l:"Niveau prix", v:cust.priceLevel},
                    {l:"Site web",    v:cust.website||"—"},
                    {l:"Client depuis",v:cust.dateCreation},
                  ].map((it,i)=>(
                    <div key={it.l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<11?"1px solid "+C.border2:"none",gridColumn:it.l==="Site web"||it.l==="Client depuis"?"auto":"auto"}}>
                      <span style={{fontSize:12,color:C.text3}}>{it.l}</span>
                      <span style={{fontSize:12,fontWeight:600,color:C.text}}>{it.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Jobs lies */}
              <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
                <div style={{padding:"12px 16px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:13,fontWeight:700,color:C.text}}>Jobs lies ({custJobs.length})</span>
                  <Btn label="Voir tous" variant="light" sm onClick={()=>setTab("jobs")}/>
                </div>
                {custJobs.length===0?(
                  <div style={{padding:"24px",textAlign:"center",color:C.text4,fontSize:13}}>Aucun job pour ce client</div>
                ):custJobs.slice(0,3).map((j,i)=>{
                  const totalInv=j.invoices.reduce((s,inv)=>s+inv.amount,0);
                  const pct=j.contractAmount>0?Math.round(totalInv/j.contractAmount*100):0;
                  return(
                    <div key={j.id} style={{padding:"12px 16px",borderBottom:i<Math.min(custJobs.length,3)-1?"1px solid "+C.border2:"none",cursor:"pointer"}}
                      onClick={()=>navigate("/cleanitbooks/jobs/"+j.id)}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,color:C.blue}}>{j.name}</div>
                          <div style={{fontSize:11,color:C.text4}}>{j.id} · {j.jobType}</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:13,fontWeight:700,color:C.green}}>{fM(j.contractAmount)} F</div>
                          <span style={{fontSize:10,padding:"1px 7px",borderRadius:10,background:j.statut==="In Progress"?C.blue_l:j.statut==="Closed"?C.green_l:C.orange_l,color:j.statut==="In Progress"?C.blue:j.statut==="Closed"?C.green:C.orange,fontWeight:600}}>{j.statut}</span>
                        </div>
                      </div>
                      <ProgBar value={totalInv} max={j.contractAmount||1} color={C.green} height={4}/>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Panel droit */}
            <div>
              {/* Contact */}
              <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden",marginBottom:14}}>
                <div style={{padding:"12px 16px",borderBottom:"1px solid "+C.border,fontSize:13,fontWeight:700,color:C.text}}>Contact principal</div>
                <div style={{padding:"14px 16px"}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:C.blue+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:C.blue,marginBottom:10}}>
                    {(cust.contact||"?").split(" ").map(n=>n[0]).join("").slice(0,2)}
                  </div>
                  <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:2}}>{cust.contact}</div>
                  <div style={{fontSize:12,color:C.text3,marginBottom:10}}>{cust.title}</div>
                  {[{icon:"phone",v:cust.phone},{icon:"phone",v:cust.mobile},{icon:"mail",v:cust.email}].filter(c=>c.v).map((it,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                      <Ico n={it.icon} s={14} c={C.text4}/>
                      <span style={{fontSize:12,color:C.blue}}>{it.v}</span>
                    </div>
                  ))}
                  <div style={{marginTop:12,display:"flex",gap:6}}>
                    <Btn label="Appeler" variant="ghost" sm icon="phone" full onClick={()=>window.open("tel:"+cust.phone)}/>
                    <Btn label="Email" variant="light" sm icon="mail" full onClick={()=>window.open("mailto:"+cust.email)}/>
                  </div>
                </div>
              </div>

              {/* Adresse */}
              <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"14px 16px",marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.4,marginBottom:10}}>Adresse de facturation</div>
                {[cust.company,cust.address,cust.city+", "+cust.region,cust.country].map((l,i)=>(
                  <div key={i} style={{fontSize:12,color:C.text2,marginBottom:3}}>{l}</div>
                ))}
              </div>

              {/* Stat rapide */}
              <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"14px 16px"}}>
                <div style={{fontSize:12,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.4,marginBottom:10}}>Statistiques</div>
                {[
                  {l:"Factures emises",v:custInvs.length},
                  {l:"Factures payees",v:custInvs.filter(i=>i.status==="Paid").length},
                  {l:"En attente",     v:custInvs.filter(i=>["Sent","Partial"].includes(i.status)).length},
                  {l:"En retard",      v:custInvs.filter(i=>i.status==="Overdue").length},
                  {l:"Nombre de jobs", v:custJobs.length},
                ].map((s,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<4?"1px solid "+C.border2:"none"}}>
                    <span style={{fontSize:12,color:C.text3}}>{s.l}</span>
                    <span style={{fontSize:13,fontWeight:700,color:s.l==="En retard"&&s.v>0?C.red:C.text}}>{s.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TRANSACTIONS */}
        {tab==="transactions"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:16,fontWeight:700,color:C.text}}>Transactions — {cust.company}</div>
              <Btn label="Nouvelle facture" variant="primary" sm icon="invoice" onClick={()=>navigate('/cleanitbooks/invoices/new')}/>
            </div>
            {custInvs.length===0?(
              <div style={{padding:"60px",textAlign:"center",background:C.white,border:"1px dashed "+C.border,borderRadius:6}}>
                <Ico n="invoice" s={40} c={C.border}/>
                <div style={{fontSize:15,color:C.text4,marginTop:12,marginBottom:16}}>Aucune transaction pour ce client</div>
                <Btn label="Creer une facture" variant="primary" icon="invoice"/>
              </div>
            ):(
              <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:"#F9FAFB",borderBottom:"2px solid "+C.border}}>
                      {["Type","N Document","Date","Echeance","Montant","Solde","Statut","Actions"].map((h,i)=>(
                        <th key={i} style={{padding:"10px 14px",textAlign:i>=4&&i<=5?"right":"left",fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.3}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {custInvs.map((inv,i)=>(
                      <tr key={inv.id} style={{borderBottom:"1px solid "+C.border2,cursor:"pointer",transition:"background .1s"}}
                        onMouseEnter={e=>e.currentTarget.style.background=C.blue_l}
                        onMouseLeave={e=>e.currentTarget.style.background=C.white}>
                        <td style={{padding:"12px 14px"}}><span style={{fontSize:11,padding:"2px 8px",borderRadius:10,background:C.green_l,color:C.green,fontWeight:600}}>Facture</span></td>
                        <td style={{padding:"12px 14px",fontWeight:700,color:C.blue}}>{inv.id}</td>
                        <td style={{padding:"12px 14px",color:C.text3,fontSize:12}}>{fD(inv.date)}</td>
                        <td style={{padding:"12px 14px",color:inv.status==="Overdue"?C.red:C.text3,fontSize:12}}>{fD(inv.dueDate)}</td>
                        <td style={{padding:"12px 14px",textAlign:"right",fontWeight:600,fontSize:13}}>{fN(inv.total)} {inv.currency}</td>
                        <td style={{padding:"12px 14px",textAlign:"right",fontWeight:700,color:inv.balance>0?C.orange:C.green,fontSize:13}}>{fN(inv.balance)} {inv.currency}</td>
                        <td style={{padding:"12px 14px"}}><StatutBadge statut={inv.status}/></td>
                        <td style={{padding:"12px 14px"}}><Btn label="Voir" variant="light" sm/></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{background:"#F9FAFB",borderTop:"2px solid "+C.border}}>
                      <td colSpan={4} style={{padding:"10px 14px",fontWeight:700,color:C.text}}>Total</td>
                      <td style={{padding:"10px 14px",textAlign:"right",fontWeight:800,color:C.blue,fontSize:14}}>{fN(totalInvoiced)} {cust.currency}</td>
                      <td style={{padding:"10px 14px",textAlign:"right",fontWeight:800,color:totalBalance>0?C.orange:C.green,fontSize:14}}>{fN(totalBalance)} {cust.currency}</td>
                      <td colSpan={2}/>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* JOBS */}
        {tab==="jobs"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:16,fontWeight:700,color:C.text}}>Jobs — {cust.company}</div>
              <Btn label="Nouveau job" variant="primary" sm icon="job" onClick={()=>navigate("/cleanitbooks/jobs/new")}/>
            </div>
            {custJobs.length===0?(
              <div style={{padding:"60px",textAlign:"center",background:C.white,border:"1px dashed "+C.border,borderRadius:6}}>
                <Ico n="job" s={40} c={C.border}/>
                <div style={{fontSize:15,color:C.text4,marginTop:12,marginBottom:16}}>Aucun job pour ce client</div>
                <Btn label="Creer un job" variant="primary" icon="job" onClick={()=>navigate("/cleanitbooks/jobs/new")}/>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {custJobs.map(j=>{
                  const totalInv=j.invoices.reduce((s,i)=>s+i.amount,0);
                  const totalCR=Object.values(j.coutsReels).reduce((s,v)=>s+v,0);
                  const pct=j.contractAmount>0?Math.round(totalInv/j.contractAmount*100):0;
                  return(
                    <div key={j.id} style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"16px 18px",cursor:"pointer",transition:"box-shadow .15s"}}
                      onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,.08)"}
                      onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}
                      onClick={()=>navigate("/cleanitbooks/jobs/"+j.id)}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                        <div>
                          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                            <span style={{fontSize:14,fontWeight:700,color:C.blue}}>{j.name}</span>
                            <StatutBadge statut={j.statut}/>
                          </div>
                          <div style={{fontSize:12,color:C.text3}}>{j.id} · {j.jobType} · Site {j.site||"—"}</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:16,fontWeight:700,color:C.green}}>{fM(j.contractAmount)} F</div>
                          <div style={{fontSize:11,color:C.text4}}>Contrat CleanIT</div>
                        </div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:10}}>
                        {[{l:"Facture",v:fM(totalInv)+" F",c:C.green},{l:"Couts reels",v:fM(totalCR)+" F",c:C.red},{l:"Marge",v:fM(totalInv-totalCR)+" F",c:totalInv>=totalCR?C.green:C.red},{l:"Chef",v:j.chefProjet||"—",c:C.text3}].map((s,i)=>(
                          <div key={i} style={{background:'#F4F5F7',borderRadius:4,padding:"7px 10px"}}>
                            <div style={{fontSize:10,color:C.text4,marginBottom:2}}>{s.l}</div>
                            <div style={{fontSize:12,fontWeight:600,color:s.c}}>{s.v}</div>
                          </div>
                        ))}
                      </div>
                      <ProgBar value={totalInv} max={j.contractAmount||1} color={C.green} height={5}/>
                      <div style={{fontSize:10,color:C.text4,marginTop:3}}>{pct}% facture</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CONTACTS */}
        {tab==="contacts"&&(
          <div style={{maxWidth:600}}>
            <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:16}}>Informations de contact</div>
            <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
              {[
                {l:"Entreprise",   v:cust.company,  icon:"customer"},
                {l:"Contact",      v:cust.contact,  icon:"customer"},
                {l:"Titre",        v:cust.title,    icon:"customer"},
                {l:"Telephone",    v:cust.phone,    icon:"phone"},
                {l:"Mobile",       v:cust.mobile||"—",icon:"phone"},
                {l:"Email",        v:cust.email,    icon:"mail"},
                {l:"Adresse",      v:cust.address,  icon:"info"},
                {l:"Ville",        v:cust.city,     icon:"info"},
                {l:"Region",       v:cust.region||"—",icon:"info"},
                {l:"Pays",         v:cust.country,  icon:"info"},
                {l:"Site web",     v:cust.website||"—",icon:"info"},
              ].map((it,i)=>(
                <div key={it.l} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:i<10?"1px solid "+C.border2:"none"}}>
                  <div style={{width:30,height:30,borderRadius:5,background:'#F4F5F7',display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <Ico n={it.icon} s={14} c={C.text4}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,color:C.text4,textTransform:"uppercase",letterSpacing:.4,marginBottom:1}}>{it.l}</div>
                    <div style={{fontSize:13,fontWeight:500,color:C.text}}>{it.v}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NOTES */}
        {tab==="notes"&&(
          <div style={{maxWidth:700}}>
            <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:16}}>Notes internes</div>
            <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"16px",marginBottom:16,fontSize:13,color:C.text2,lineHeight:1.8,minHeight:100}}>
              {cust.notes||<span style={{color:C.text4}}>Aucune note.</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ================================================================
//  PAGE FORMULAIRE CLIENT (creation / edition)
// ================================================================
const PageCustomerForm = ({customers,setCustomers,onCancel}) => {
  const navigate  = useNavigate();
  const {custId}  = useParams();
  const isEdit    = !!custId && custId!=="new";
  const initial   = isEdit?customers.find(c=>c.id===custId):null;

  const [step, setStep] = useState(1);
  const [company,  setCompany]  = useState(initial?.company||"");
  const [contact,  setContact]  = useState(initial?.contact||"");
  const [title,    setTitle]    = useState(initial?.title||"");
  const [email,    setEmail]    = useState(initial?.email||"");
  const [phone,    setPhone]    = useState(initial?.phone||"");
  const [mobile,   setMobile]   = useState(initial?.mobile||"");
  const [address,  setAddress]  = useState(initial?.address||"");
  const [city,     setCity]     = useState(initial?.city||"");
  const [region,   setRegion]   = useState(initial?.region||"");
  const [country,  setCountry]  = useState(initial?.country||"Cameroun");
  const [website,  setWebsite]  = useState(initial?.website||"");
  const [type,     setType]     = useState(initial?.type||"Telecom");
  const [terms,    setTerms]    = useState(initial?.terms||"Net 30");
  const [currency, setCurrency] = useState(initial?.currency||"FCFA");
  const [taxCode,  setTaxCode]  = useState(initial?.taxCode||"TVA");
  const [taxId,    setTaxId]    = useState(initial?.taxId||"");
  const [creditLimit,setCreditLimit]=useState(initial?.creditLimit||"");
  const [priceLevel,setPriceLevel]=useState(initial?.priceLevel||"Standard");
  const [accountNum,setAccountNum]=useState(initial?.accountNum||"");
  const [notes,    setNotes]    = useState(initial?.notes||"");
  const [status,   setStatus]   = useState(initial?.status||"Active");

  const STEPS = [
    {n:1,l:"Informations entreprise"},
    {n:2,l:"Contact principal"},
    {n:3,l:"Adresse"},
    {n:4,l:"Conditions commerciales"},
    {n:5,l:"Recap"},
  ];

  const save = () => {
    if(!company){alert("Nom entreprise obligatoire");return;}
    const cust = {
      id:initial?.id||"C"+String(Date.now()).slice(-6),
      company,contact,title,email,phone,mobile,
      address,city,region,country,website,
      type,terms,currency,taxCode,taxId,
      creditLimit:+creditLimit||0,priceLevel,accountNum,notes,status,
      balance:initial?.balance||0,
      openInvoices:initial?.openInvoices||0,
      dateCreation:initial?.dateCreation||TODAY,
    };
    if(isEdit){
      setCustomers(p=>p.map(c=>c.id===cust.id?cust:c));
    } else {
      setCustomers(p=>[...p,cust]);
    }
    navigate("/cleanitbooks/customers/"+cust.id);
  };

  return(
    <div style={{minHeight:"100vh",background:'#F4F5F7',fontFamily:"\"Segoe UI\",Arial,sans-serif"}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}*{box-sizing:border-box}`}</style>

      {/* TOPBAR */}
      <div style={{background:C.white,borderBottom:"1px solid "+C.border,position:"sticky",top:0,zIndex:200,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
        <div style={{display:"flex",alignItems:"center",padding:"0 24px",height:52,borderBottom:"1px solid "+C.border2}}>
          <div style={{display:"flex",alignItems:"center",gap:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",paddingRight:14,marginRight:6,borderRight:"1px solid "+C.border2}} onClick={()=>navigate("/cleanitbooks")}>
              <div style={{width:26,height:26,borderRadius:5,background:C.green,display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="customer" s={13} c="white"/></div>
              <span style={{fontSize:12,fontWeight:700,color:C.text}}>CleanIT<span style={{color:C.green}}>Books</span></span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:4,padding:"0 10px"}}>
              <button onClick={()=>navigate("/cleanitbooks/customers")} style={{border:"none",background:"none",cursor:"pointer",fontSize:12,color:C.blue,fontWeight:600,fontFamily:"inherit"}}>Customer Center</button>
              <span style={{color:C.text4,fontSize:12}}>/</span>
              <span style={{fontSize:12,color:C.text,fontWeight:700}}>{isEdit?"Modifier "+initial?.company:"Nouveau client"}</span>
            </div>
          </div>
          <div style={{flex:1}}/>
          <div style={{display:"flex",gap:8}}>
            <Btn label="Annuler" variant="light" sm onClick={()=>navigate(isEdit?"/cleanitbooks/customers/"+custId:"/cleanitbooks/customers")}/>
            {step===5&&<Btn label={isEdit?"Enregistrer":"Creer le client"} variant="primary" sm icon="check" onClick={save}/>}
          </div>
        </div>
      </div>

      <div style={{maxWidth:860,margin:"0 auto",padding:"32px 24px",animation:"fadeUp .3s ease"}}>
        <div style={{fontSize:22,fontWeight:800,color:C.text,marginBottom:6}}>{isEdit?"Modifier le client":"Nouveau client"}</div>
        <div style={{fontSize:14,color:C.text3,marginBottom:28}}>CleanITBooks · Customer Center</div>

        {/* Steps */}
        <div style={{display:"flex",gap:0,marginBottom:32,background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
          {STEPS.map((s,i)=>(
            <button key={s.n} onClick={()=>setStep(s.n)}
              style={{flex:1,padding:"14px 8px",border:"none",borderRight:i<STEPS.length-1?"1px solid "+C.border:"none",cursor:"pointer",fontFamily:"inherit",background:step===s.n?C.green_l:step>s.n?"#F0FDF4":"transparent",transition:"all .15s"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <div style={{width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:step===s.n?C.green:step>s.n?C.green:"#E5E7EB",color:step>=s.n?"white":C.text4,fontSize:11,fontWeight:700,flexShrink:0}}>
                  {step>s.n?<Ico n="check" s={11} c="white"/>:s.n}
                </div>
                <span style={{fontSize:12,fontWeight:step===s.n?700:400,color:step===s.n?C.green:step>s.n?C.green:C.text3}}>{s.l}</span>
              </div>
            </button>
          ))}
        </div>

        {/* STEP 1 — Entreprise */}
        {step===1&&(
          <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"28px"}}>
            <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:20}}>Informations de l entreprise</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              <Field label="Nom de l entreprise" required span>
                <Inp value={company} onChange={setCompany} placeholder="Ex: MTN Cameroun"/>
              </Field>
              <Field label="Type de client" required>
                <Sel value={type} onChange={setType} options={CUSTOMER_TYPES}/>
              </Field>
              <Field label="N de compte" hint="Identifiant unique ex: MTN-CM-001">
                <Inp value={accountNum} onChange={setAccountNum} placeholder="MTN-CM-001"/>
              </Field>
              <Field label="Site web">
                <Inp value={website} onChange={setWebsite} placeholder="www.exemple.cm"/>
              </Field>
              <Field label="Statut">
                <Sel value={status} onChange={setStatus} options={["Active","Inactive"]}/>
              </Field>
            </div>
          </div>
        )}

        {/* STEP 2 — Contact */}
        {step===2&&(
          <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"28px"}}>
            <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:20}}>Contact principal</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              <Field label="Nom complet" required>
                <Inp value={contact} onChange={setContact} placeholder="Prenom Nom"/>
              </Field>
              <Field label="Titre / Fonction">
                <Inp value={title} onChange={setTitle} placeholder="Directeur Technique"/>
              </Field>
              <Field label="Email professionnel" required>
                <Inp type="email" value={email} onChange={setEmail} placeholder="contact@entreprise.cm"/>
              </Field>
              <Field label="Telephone fixe">
                <Inp value={phone} onChange={setPhone} placeholder="+237 222 XXX XXX"/>
              </Field>
              <Field label="Mobile">
                <Inp value={mobile} onChange={setMobile} placeholder="+237 6XX XXX XXX"/>
              </Field>
            </div>
          </div>
        )}

        {/* STEP 3 — Adresse */}
        {step===3&&(
          <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"28px"}}>
            <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:20}}>Adresse de facturation</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              <Field label="Adresse" required span>
                <Inp value={address} onChange={setAddress} placeholder="Rue, Quartier, BP..."/>
              </Field>
              <Field label="Ville" required>
                <Inp value={city} onChange={setCity} placeholder="Douala / Yaounde"/>
              </Field>
              <Field label="Region">
                <Sel value={region} onChange={setRegion} placeholder="Selectionner..." options={REGIONS_CM}/>
              </Field>
              <Field label="Pays">
                <Inp value={country} onChange={setCountry} placeholder="Cameroun"/>
              </Field>
            </div>
          </div>
        )}

        {/* STEP 4 — Conditions */}
        {step===4&&(
          <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"28px"}}>
            <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:20}}>Conditions commerciales</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              <Field label="Conditions de paiement" required>
                <Sel value={terms} onChange={setTerms} options={PAYMENT_TERMS}/>
              </Field>
              <Field label="Devise">
                <Sel value={currency} onChange={setCurrency} options={CURRENCIES_LIST}/>
              </Field>
              <Field label="Code TVA">
                <Sel value={taxCode} onChange={setTaxCode} options={TAX_CODES}/>
              </Field>
              <Field label="ID Fiscal / NIF">
                <Inp value={taxId} onChange={setTaxId} placeholder="P045678901A"/>
              </Field>
              <Field label="Limite de credit (FCFA)" hint="Montant maximum autorise">
                <Inp type="number" value={creditLimit} onChange={setCreditLimit} prefix={currency} placeholder="0"/>
              </Field>
              <Field label="Niveau de prix">
                <Sel value={priceLevel} onChange={setPriceLevel} options={PRICE_LEVELS}/>
              </Field>
              <Field label="Notes internes" span>
                <Txt value={notes} onChange={setNotes} placeholder="Notes, informations importantes sur ce client..." rows={3}/>
              </Field>
            </div>
          </div>
        )}

        {/* STEP 5 — Recap */}
        {step===5&&(
          <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"28px"}}>
            <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:20}}>Recap avant {isEdit?"modification":"creation"}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Entreprise</div>
                {[{l:"Nom",v:company||"—"},{l:"Type",v:type},{l:"N Compte",v:accountNum||"—"},{l:"Statut",v:status},{l:"Site web",v:website||"—"}].map(it=>(
                  <div key={it.l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid "+C.border2}}>
                    <span style={{fontSize:12,color:C.text3}}>{it.l}</span>
                    <span style={{fontSize:12,fontWeight:600,color:C.text}}>{it.v}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Contact et conditions</div>
                {[{l:"Contact",v:contact||"—"},{l:"Email",v:email||"—"},{l:"Telephone",v:phone||"—"},{l:"Ville",v:city||"—"},{l:"Conditions",v:terms},{l:"Devise",v:currency},{l:"Code TVA",v:taxCode},{l:"Limite credit",v:creditLimit?fN(+creditLimit)+" "+currency:"—"}].map(it=>(
                  <div key={it.l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid "+C.border2}}>
                    <span style={{fontSize:12,color:C.text3}}>{it.l}</span>
                    <span style={{fontSize:12,fontWeight:600,color:C.text}}>{it.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation steps */}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:24}}>
          <div>{step>1&&<Btn label="Precedent" onClick={()=>setStep(s=>s-1)} variant="default"/>}</div>
          <div style={{display:"flex",gap:10}}>
            <Btn label="Annuler" onClick={()=>navigate(isEdit?"/cleanitbooks/customers/"+custId:"/cleanitbooks/customers")} variant="light"/>
            {step<5
              ?<Btn label="Suivant" onClick={()=>setStep(s=>s+1)} variant="primary"/>
              :<Btn label={isEdit?"Enregistrer":"Creer le client"} onClick={save} variant="primary" icon="check"/>
            }
          </div>
        </div>
      </div>
    </div>
  );
};


// ================================================================
//  ROUTING PAR URL — chaque job a sa propre page
//  /cleanitbooks          → liste des jobs
//  /cleanitbooks/jobs/JOB-001 → detail du job
// ================================================================

// PAGE LISTE DES JOBS
const PageJobList = ({jobs,setJobs,customers}) => {
  const navigate   = useNavigate();
  const [search,     setSearch]      = useState("");
  const [filtreStatut,setFiltreStatut]= useState("Tous");
  const [filtreType, setFiltreType]  = useState("Tous");
  const [showForm,   setShowForm]    = useState(false);

  const STATUTS_FILTRE = ["Tous","In Progress","Awarded","Closed","Pending","Not Awarded"];
  const TYPES_FILTRE   = ["Tous",...JOB_TYPES];

  const jobsFiltres = jobs.filter(j=>{
    const ms = !search||(j.name+j.customerId+j.bcRef+j.site).toLowerCase().includes(search.toLowerCase());
    const mf = filtreStatut==="Tous"||j.statut===filtreStatut;
    const mt = filtreType==="Tous"||j.jobType===filtreType;
    return ms&&mf&&mt;
  });

  const totalBudgetHW= jobs.reduce((s,j)=>s+(parseFloat(j.budgetClient||j.budgetHuawei)||0),0);
  const totalContrats= jobs.reduce((s,j)=>s+(parseFloat(j.contractAmount||j.contractAmt)||0),0);
  const totalCouts   = jobs.reduce((s,j)=>s+Object.values(j.coutsReels||{}).reduce((sc,v)=>sc+(v||0),0),0);
  const totalCA      = jobs.reduce((s,j)=>s+(Array.isArray(j.invoices)?j.invoices.reduce((si,i)=>si+(i.amount||0),0):0),0);

  return(
    <div style={{minHeight:"100vh",background:'#F4F5F7',fontFamily:"\"Segoe UI\",Arial,sans-serif"}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}*{box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px}`}</style>

      <CIBTopBar title="Job Center" icon="job" color={C.green}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,background:'#F4F5F7',border:"1px solid "+C.border,borderRadius:4,padding:"6px 12px"}}>
            <Ico n="search" s={13} c={C.text4}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un job..."
              style={{border:"none",outline:"none",fontSize:12,color:C.text,background:"transparent",width:170,fontFamily:"inherit"}}/>
          </div>
          <Btn label="Nouveau job" variant="primary" sm icon="plus" onClick={()=>navigate('/cleanitbooks/jobs/new')}/>
          <button onClick={()=>navigate("/terrain")}
            style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:4,border:"1px solid "+C.border,background:'#F4F5F7',cursor:"pointer",fontFamily:"inherit",fontSize:12,color:C.text3}}
            onMouseEnter={e=>{e.currentTarget.style.background=C.green_l;e.currentTarget.style.color=C.green;}}
            onMouseLeave={e=>{e.currentTarget.style.background=C.bg;e.currentTarget.style.color=C.text3;}}>
            <Ico n="terrain" s={12} c="currentColor"/>
            Terrain
          </button>
        </div>
      </CIBTopBar>

      {/* CONTENU — tableau des jobs */}
      <div style={{padding:"24px",animation:"fadeUp .3s ease"}}>

        {/* KPI résumé budget */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
          {[{l:"Bon de commande",v:fM(totalBudgetHW),c:C.orange},{l:"Contrats",v:fM(totalContrats),c:C.blue},{l:"Couts reels",v:fM(totalCouts),c:C.red},{l:"CA facture",v:fM(totalCA),c:C.green}].map(s=>(
            <div key={s.l} style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"10px 14px",borderTop:"3px solid "+s.c}}>
              <div style={{fontSize:9,color:C.text4,textTransform:"uppercase",letterSpacing:.4,marginBottom:3}}>{s.l}</div>
              <div style={{fontSize:15,fontWeight:700,color:s.c}}>{s.v} F</div>
            </div>
          ))}
        </div>

        {/* Filtres + actions */}
        <div style={{display:"flex",gap:10,marginBottom:18,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{fontSize:18,fontWeight:700,color:C.text}}>Job Center</div>
          <div style={{marginLeft:"auto",display:"flex",gap:8,flexWrap:"wrap"}}>
            <select value={filtreStatut} onChange={e=>setFiltreStatut(e.target.value)}
              style={{padding:"7px 12px",borderRadius:4,border:"1px solid "+C.border,fontSize:12,color:C.text2,background:C.white,cursor:"pointer",fontFamily:"inherit",outline:"none"}}>
              {STATUTS_FILTRE.map(s=><option key={s} value={s}>{s==="Tous"?"Tous les statuts":s}</option>)}
            </select>
            <select value={filtreType} onChange={e=>setFiltreType(e.target.value)}
              style={{padding:"7px 12px",borderRadius:4,border:"1px solid "+C.border,fontSize:12,color:C.text2,background:C.white,cursor:"pointer",fontFamily:"inherit",outline:"none"}}>
              {TYPES_FILTRE.map(t=><option key={t} value={t}>{t==="Tous"?"Tous les types":t}</option>)}
            </select>
            <Btn label="Exporter Excel" variant="light" sm icon="download" onClick={async ()=>{
              const ExcelJS = (await import('exceljs')).default;
              const today   = new Date().toISOString().split("T")[0];
              const wb      = new ExcelJS.Workbook();
              wb.creator    = "CleanITBooks";
              wb.created    = new Date();

              // ===== COULEURS =====
              const C_HDR   = "1F4E79";
              const C_SUB   = "2E75B6";
              const C_ALT   = "DEEAF1";
              const C_GREEN = "70AD47";
              const C_ORANGE= "FFC000";
              const C_RED   = "FF0000";
              const C_WHITE = "FFFFFF";

              const hdrFill  = (color) => ({type:"pattern",pattern:"solid",fgColor:{argb:"FF"+color}});
              const hdrFont  = (color="FFFFFF",bold=true,size=10) => ({name:"Calibri",bold,color:{argb:"FF"+color},size});
              const cellFont = (color="000000",bold=false,size=10) => ({name:"Calibri",bold,color:{argb:"FF"+color},size});
              const thinBorder = {top:{style:"thin",color:{argb:"FFBFBFBF"}},left:{style:"thin",color:{argb:"FFBFBFBF"}},bottom:{style:"thin",color:{argb:"FFBFBFBF"}},right:{style:"thin",color:{argb:"FFBFBFBF"}}};
              const centerAlign = {horizontal:"center",vertical:"middle",wrapText:true};
              const leftAlign   = {horizontal:"left",  vertical:"middle",wrapText:true};
              const rightAlign  = {horizontal:"right", vertical:"middle"};

              // ===== SHEET 1 — PO TRACKER =====
              const ws1 = wb.addWorksheet("PO Tracker");

              // Titre
              ws1.mergeCells("A1:T1");
              const title = ws1.getCell("A1");
              title.value     = "CLEANITBOOKS — PO TRACKER · CleanIT Telecom · "+today;
              title.font      = hdrFont("FFFFFF",true,14);
              title.fill      = hdrFill(C_HDR);
              title.alignment = centerAlign;
              ws1.getRow(1).height = 32;

              // Headers
              const hdrs1 = ["Code Job","Nom du Job","Client","Type","Site","N Bon de commande","Chef de Projet","Date debut","Date fin","Statut","Montant Contrat FCFA","Total Facture FCFA","Reste Facturer FCFA","Couts Reels FCFA","Marge Nette FCFA","% Facture","Nb Phases","Phases Fact.","Notes"];
              const widths1= [14,35,20,20,10,18,16,12,12,14,20,18,18,18,18,10,10,12,35];
              ws1.columns = hdrs1.map((h,i)=>({key:h,width:widths1[i]}));
              const hdrRow1 = ws1.getRow(2);
              hdrRow1.height = 28;
              hdrs1.forEach((h,i)=>{
                const cell = hdrRow1.getCell(i+1);
                cell.value     = h;
                cell.font      = hdrFont();
                cell.fill      = hdrFill(C_HDR);
                cell.alignment = centerAlign;
                cell.border    = thinBorder;
              });
              ws1.views = [{state:"frozen",ySplit:2}];

              const statusColor = (s) => s==="Termine"||s==="Closed"?C_GREEN:s==="En cours"||s==="In Progress"?C_ORANGE:s==="En attente"||s==="Pending"?C_RED:s==="Awarded"||s==="Attribue"?"2E75B6":"808080";

              let dataRowStart1 = 3;
              jobsFiltres.forEach((j,ri)=>{
                const cust    = customers.find(c=>c.id===j.customerId);
                const totalInv= j.invoices.reduce((s,i)=>s+i.amount,0);
                const totalCR = Object.values(j.coutsReels).reduce((s,v)=>s+v,0);
                const marge   = totalInv-totalCR;
                const pctF    = j.contractAmount>0?totalInv/j.contractAmount:0;
                const phasesF = j.phases.filter(p=>p.statut==="invoiced").length;
                const isAlt   = ri%2===1;
                const rowBg   = isAlt?C_ALT:C_WHITE;

                const row = ws1.addRow([
                  j.id,j.name,cust?cust.company||cust.name:"",j.jobType,j.site||"",j.bcRef||"",j.chefProjet||"",
                  j.startDate,j.endDate,j.statut,
                  j.contractAmount,totalInv,Math.max(0,j.contractAmount-totalInv),
                  totalCR,marge,pctF,j.phases.length,phasesF,j.notes||""
                ]);
                row.height = 42;

                row.eachCell((cell,cn)=>{
                  cell.border = thinBorder;
                  if(cn===10){ // Statut
                    const sc = statusColor(j.statut);
                    cell.fill      = hdrFill(sc);
                    cell.font      = hdrFont(sc===C_ORANGE||sc===C_GREEN?"000000":"FFFFFF",true,10);
                    cell.alignment = centerAlign;
                  } else if(cn>=11&&cn<=15){ // Montants
                    cell.numFmt    = "#,##0";
                    cell.font      = cellFont(cn===11?"1F4E79":cn===12?"70AD47":cn===13||cn===15?"C00000":"000000",cn===15,10);
                    cell.alignment = rightAlign;
                    cell.fill      = hdrFill(rowBg);
                  } else if(cn===16){ // %
                    cell.numFmt    = "0.0%";
                    cell.font      = cellFont("1F4E79",true,10);
                    cell.alignment = centerAlign;
                    const pctBg    = pctF>=1?C_GREEN:pctF>0?C_ORANGE:C_WHITE;
                    cell.fill      = hdrFill(pctBg);
                  } else {
                    cell.font      = cellFont("000000",false,10);
                    cell.alignment = cn===19?leftAlign:cn>=17&&cn<=18?centerAlign:leftAlign;
                    cell.fill      = hdrFill(rowBg);
                  }
                });
              });

              // Ligne totaux
              const totRow1 = ws1.addRow([
                "TOTAL","","","","","","","","","",
                jobsFiltres.reduce((s,j)=>s+j.contractAmount,0),
                jobsFiltres.reduce((s,j)=>s+j.invoices.reduce((si,i)=>si+i.amount,0),0),
                jobsFiltres.reduce((s,j)=>s+Math.max(0,j.contractAmount-j.invoices.reduce((si,i)=>si+i.amount,0)),0),
                jobsFiltres.reduce((s,j)=>s+Object.values(j.coutsReels).reduce((sc,v)=>sc+v,0),0),
                "","","","",""
              ]);
              totRow1.height = 22;
              totRow1.eachCell((cell,cn)=>{
                cell.font   = hdrFont();
                cell.fill   = hdrFill(C_HDR);
                cell.border = thinBorder;
                cell.alignment = cn>=11&&cn<=14?rightAlign:centerAlign;
                if(cn>=11&&cn<=14) cell.numFmt = "#,##0";
              });

              ws1.autoFilter = {from:{row:2,column:1},to:{row:2,column:19}};

              // ===== SHEET 2 — LIGNES BC =====
              const ws2 = wb.addWorksheet("Lignes BC Detail");
              ws2.mergeCells("A1:J1");
              const t2 = ws2.getCell("A1");
              t2.value = "DETAIL LIGNES BONS DE COMMANDE — "+today;
              t2.font  = hdrFont("FFFFFF",true,13);
              t2.fill  = hdrFill(C_HDR);
              t2.alignment = centerAlign;
              ws2.getRow(1).height = 26;

              const hdrs2 = ["Pays","Code Projet","Code Site","Nom Site","N BC","Client","Description","Qte Demandee","Qte Realisee","Qte Restante"];
              const w2    = [12,14,14,30,16,18,55,14,14,14];
              ws2.columns = hdrs2.map((h,i)=>({key:h,width:w2[i]}));
              const hr2 = ws2.getRow(2);
              hr2.height = 26;
              hdrs2.forEach((h,i)=>{ const c=hr2.getCell(i+1); c.value=h; c.font=hdrFont(); c.fill=hdrFill(C_HDR); c.alignment=centerAlign; c.border=thinBorder; });
              ws2.views = [{state:"frozen",ySplit:2}];

              jobsFiltres.forEach((j,ri)=>{
                const cust = customers.find(c=>c.id===j.customerId);
                const isAlt= ri%2===1;
                const bg   = isAlt?C_ALT:C_WHITE;
                (j.lignesBC||[]).forEach(l=>{
                  const row = ws2.addRow(["Cameroun",j.id,j.site||"",j.name,j.bcRef||"",cust?cust.company||cust.name:"",l.desc,l.qte,0,l.qte]);
                  row.height = 38;
                  row.eachCell((cell,cn)=>{
                    cell.border    = thinBorder;
                    cell.fill      = hdrFill(bg);
                    cell.alignment = cn===7?leftAlign:cn>=8?centerAlign:leftAlign;
                    cell.font      = cellFont(cn===10&&l.qte>0?"C00000":cn===9&&l.qte>0?"70AD47":"000000",false,cn===7?9:10);
                    if(cn>=8) cell.numFmt = "#,##0";
                  });
                });
              });
              ws2.autoFilter = {from:{row:2,column:1},to:{row:2,column:10}};

              // ===== SHEET 3 — PHASES =====
              const ws3 = wb.addWorksheet("Phases Facturation");
              ws3.mergeCells("A1:K1");
              const t3 = ws3.getCell("A1");
              t3.value = "PHASES DE FACTURATION — "+today;
              t3.font  = hdrFont("FFFFFF",true,13);
              t3.fill  = hdrFill(C_HDR);
              t3.alignment = centerAlign;
              ws3.getRow(1).height = 26;

              const hdrs3 = ["Code Job","Nom Job","Client","N Phase","Nom Phase","% Contrat","Montant FCFA","Statut","Date Prevue","Date Paiement","Ref Facture"];
              const w3    = [14,30,18,10,30,10,16,14,14,14,14];
              ws3.columns = hdrs3.map((h,i)=>({key:h,width:w3[i]}));
              const hr3 = ws3.getRow(2);
              hr3.height = 26;
              hdrs3.forEach((h,i)=>{ const c=hr3.getCell(i+1); c.value=h; c.font=hdrFont(); c.fill=hdrFill(C_HDR); c.alignment=centerAlign; c.border=thinBorder; });
              ws3.views = [{state:"frozen",ySplit:2}];

              jobsFiltres.forEach((j,ri)=>{
                const cust = customers.find(c=>c.id===j.customerId);
                j.phases.forEach((ph,pi)=>{
                  const isAlt = (ri+pi)%2===1;
                  const bg    = isAlt?C_ALT:C_WHITE;
                  const phBg  = ph.statut==="invoiced"?C_GREEN:C_ORANGE;
                  const row   = ws3.addRow([j.id,j.name,cust?cust.company||cust.name:"",ph.id,ph.name,ph.pct/100,ph.amount,ph.statut==="invoiced"?"Facture":"En attente",ph.datePrevue||"",ph.datePaiement||"",ph.invoiceRef||""]);
                  row.height  = 22;
                  row.eachCell((cell,cn)=>{
                    cell.border    = thinBorder;
                    if(cn===8){ cell.fill=hdrFill(phBg); cell.font=hdrFont(phBg===C_ORANGE?"000000":"FFFFFF",true,10); cell.alignment=centerAlign; }
                    else { cell.fill=hdrFill(bg); cell.font=cellFont("000000",false,10); cell.alignment=cn===6||cn===7?centerAlign:leftAlign; }
                    if(cn===6) cell.numFmt="0%";
                    if(cn===7) cell.numFmt="#,##0";
                  });
                });
              });
              ws3.autoFilter = {from:{row:2,column:1},to:{row:2,column:11}};

              // ===== TELECHARGER =====
              const buf  = await wb.xlsx.writeBuffer();
              const blob = new Blob([buf],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
              const url  = URL.createObjectURL(blob);
              const a    = document.createElement("a");
              a.href     = url;
              a.download = "CleanITBooks_Jobs_"+today+".xlsx";
              a.click();
              URL.revokeObjectURL(url);
            }}/>
            <Btn label="Nouveau job" variant="primary" sm icon="plus" onClick={()=>navigate('/cleanitbooks/jobs/new')}/>
          </div>
        </div>

        {/* KPIs row */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:20}}>
          {[
            {l:"Jobs total",     v:jobs.length,                                              c:C.text,  icon:"job",     sub:jobs.filter(j=>j.statut==="In Progress").length+" en cours"},
            {l:"Budget Client",  v:fM(totalBudgetHW)+" F",                                   c:C.orange,icon:"bc",      sub:"Confidentiel"},
            {l:"Contrats CleanIT",v:fM(totalContrats)+" F",                                  c:C.blue,  icon:"invoice", sub:fM(totalBudgetHW-totalContrats)+" F marge brute"},
            {l:"Couts reels",    v:fM(totalCouts)+" F",                                      c:C.red,   icon:"bill",    sub:fM(totalContrats-totalCouts)+" F marge nette"},
            {l:"CA facture",     v:fM(totalCA)+" F",                                         c:C.green, icon:"chart",   sub:fM(totalContrats-totalCA)+" F reste a facturer"},
          ].map((kpi,i)=>(
            <div key={i} style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"14px 16px",borderTop:"3px solid "+kpi.c}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:10,color:C.text3,textTransform:"uppercase",letterSpacing:.4,fontWeight:600}}>{kpi.l}</span>
                <div style={{width:28,height:28,borderRadius:4,background:kpi.c+"15",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Ico n={kpi.icon} s={14} c={kpi.c}/>
                </div>
              </div>
              <div style={{fontSize:20,fontWeight:700,color:kpi.c,marginBottom:3}}>{kpi.v}</div>
              <div style={{fontSize:11,color:C.text4}}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Tableau des jobs — style QB exact */}
        <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:900}}>
              <thead>
                <tr style={{background:"#F9FAFB",borderBottom:"2px solid "+C.border}}>
                  {[
                    {l:"Job",            w:""},
                    {l:"Client",         w:160},
                    {l:"Type",           w:160},
                    {l:"Site",           w:90},
                    {l:"Statut",         w:120},
                    {l:"Contrat",        w:130,r:true},
                    {l:"Facture",        w:130,r:true},
                    {l:"Couts reels",    w:130,r:true},
                    {l:"Marge",          w:130,r:true},
                    {l:"Avancement",     w:140},
                    {l:"",               w:80},
                  ].map((h,i)=>(
                    <th key={i} style={{padding:"10px 14px",textAlign:h.r?"right":"left",fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.4,whiteSpace:"nowrap",width:h.w||"auto"}}>{h.l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobsFiltres.length===0&&(
                  <tr><td colSpan={11} style={{padding:"48px",textAlign:"center",color:C.text4,fontSize:14}}>Aucun job ne correspond aux filtres</td></tr>
                )}
                {jobsFiltres.map((job,i)=>{
                  const cust    = customers.find(c=>c.id===job.customerId);
                  const totalInv= job.invoices.reduce((s,inv)=>s+inv.amount,0);
                  const totalCR = Object.values(job.coutsReels).reduce((s,v)=>s+v,0);
                  const marge   = totalInv-totalCR;
                  const pct     = job.contractAmount>0?Math.round(totalInv/job.contractAmount*100):0;

                  return(
                    <tr key={job.id}
                      style={{borderBottom:"1px solid "+C.border2,cursor:"pointer",background:i%2===0?C.white:"#FAFAFA",transition:"background .1s"}}
                      onMouseEnter={e=>e.currentTarget.style.background=C.blue_l}
                      onMouseLeave={e=>e.currentTarget.style.background=i%2===0?C.white:"#FAFAFA"}
                      onClick={()=>navigate("/cleanitbooks/jobs/"+job.id)}>

                      {/* Nom du job — cliquable */}
                      <td style={{padding:"13px 14px"}}>
                        <div style={{fontSize:13,fontWeight:700,color:C.blue,marginBottom:3}}>{job.name}</div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          <span style={{fontSize:10,color:C.text4}}>{job.id}</span>
                          {job.bcRef&&<span style={{fontSize:10,padding:"1px 7px",borderRadius:10,background:C.orange_l,color:C.orange,fontWeight:600}}>{job.bcRef}</span>}
                        </div>
                      </td>
                      <td style={{padding:"13px 14px",fontSize:13,color:C.text2}}>{cust?.company||cust?.name||"—"}</td>
                      <td style={{padding:"13px 14px"}}>
                        <span style={{fontSize:11,padding:"2px 8px",borderRadius:10,background:C.border2,color:C.text3}}>{job.jobType}</span>
                      </td>
                      <td style={{padding:"13px 14px",fontSize:12,color:C.text3}}>{job.site||"—"}</td>
                      <td style={{padding:"13px 14px"}}><StatutBadge statut={job.statut}/></td>
                      <td style={{padding:"13px 14px",textAlign:"right",fontWeight:600,fontSize:13}}>{fN(job.contractAmount)} F</td>
                      <td style={{padding:"13px 14px",textAlign:"right",fontWeight:600,color:C.green,fontSize:13}}>{fN(totalInv)} F</td>
                      <td style={{padding:"13px 14px",textAlign:"right",fontWeight:600,color:totalCR>Object.values(job.budgetEstime).reduce((s,v)=>s+v,0)?C.red:C.text,fontSize:13}}>{fN(totalCR)} F</td>
                      <td style={{padding:"13px 14px",textAlign:"right",fontWeight:700,color:marge>=0?C.green:C.red,fontSize:13}}>{marge>=0?"+":""}{fN(marge)} F</td>
                      <td style={{padding:"13px 14px"}}>
                        <ProgBar value={totalInv} max={job.contractAmount||1} color={C.green} height={5}/>
                        <div style={{fontSize:10,color:C.text4,marginTop:3}}>{pct}% facture</div>
                      </td>
                      <td style={{padding:"13px 14px"}} onClick={e=>e.stopPropagation()}>
                        <Btn label="Ouvrir" variant="light" sm onClick={()=>navigate("/cleanitbooks/jobs/"+job.id)}/>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {jobs.length>0&&(
                <tfoot>
                  <tr style={{borderTop:"2px solid "+C.border,background:"#F9FAFB"}}>
                    <td colSpan={5} style={{padding:"10px 14px",fontWeight:700,color:C.text,fontSize:12}}>TOTAL — {jobsFiltres.length} job(s)</td>
                    <td style={{padding:"10px 14px",textAlign:"right",fontWeight:700,color:C.blue}}>{fN(jobsFiltres.reduce((s,j)=>s+j.contractAmount,0))} F</td>
                    <td style={{padding:"10px 14px",textAlign:"right",fontWeight:700,color:C.green}}>{fN(jobsFiltres.reduce((s,j)=>s+j.invoices.reduce((si,i)=>si+i.amount,0),0))} F</td>
                    <td style={{padding:"10px 14px",textAlign:"right",fontWeight:700,color:C.red}}>{fN(jobsFiltres.reduce((s,j)=>s+Object.values(j.coutsReels).reduce((sc,v)=>sc+v,0),0))} F</td>
                    <td colSpan={3}/>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {showForm&&(
        <FormJob
          initial={null}
          customers={customers}
          onSave={(job)=>{setJobs(p=>[...p,job]);navigate("/cleanitbooks/jobs/"+job.id);}}
          onClose={()=>setShowForm(false)}
        />
      )}
    </div>
  );
};

// PAGE DETAIL JOB — URL: /cleanitbooks/jobs/JOB-001
const PageJobDetail = ({jobs,setJobs,customers}) => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [tab,     setTab]     = useState("overview");
  const [showEdit,setShowEdit]= useState(false);

  const job  = jobs.find(j=>j.id===jobId);
  const cust = customers.find(c=>c.id===job?.customerId);

  if(!job) return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,background:'#F4F5F7'}}>
      <div style={{fontSize:18,color:C.text4}}>Job introuvable : {jobId}</div>
      <Btn label="Retour aux jobs" variant="primary" onClick={()=>navigate("/cleanitbooks/jobs")}/>
    </div>
  );

  const totalInvoiced = job.invoices.reduce((s,i)=>s+i.amount,0);
  const totalBills    = job.bills.reduce((s,b)=>s+b.amount,0);
  const totalTime     = job.timeEntries.reduce((s,t)=>s+t.hours*t.rate,0);
  const totalCouts    = Object.values(job.coutsReels).reduce((s,v)=>s+v,0);
  const totalEst      = Object.values(job.budgetEstime).reduce((s,v)=>s+v,0);
  const marge         = totalInvoiced-totalCouts;

  const TABS = [
    {id:"overview",  label:"Vue generale",                 icon:"chart"},
    {id:"phases",    label:"Phases ("+job.phases.length+")", icon:"phase"},
    {id:"invoices",  label:"Factures ("+job.invoices.length+")", icon:"invoice"},
    {id:"bills",     label:"Depenses ("+job.bills.length+")",   icon:"bill"},
    {id:"time",      label:"Heures ("+job.timeEntries.length+")", icon:"time"},
    {id:"bc",        label:"Bon de commande",                    icon:"bc"},
    {id:"notes",     label:"Notes",                        icon:"note"},
  ];

  return(
    <div style={{minHeight:"100vh",background:'#F4F5F7',fontFamily:"\"Segoe UI\",Arial,sans-serif"}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}*{box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px}`}</style>

      {/* TOPBAR */}
      <div style={{background:C.white,borderBottom:"1px solid "+C.border,position:"sticky",top:0,zIndex:200,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>

        {/* Ligne 1 — breadcrumb + actions */}
        <div style={{display:"flex",alignItems:"center",padding:"0 24px",height:52,gap:0,borderBottom:"1px solid "+C.border2}}>
          {/* Logo + breadcrumb */}
          <div style={{display:"flex",alignItems:"center",gap:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",paddingRight:14,marginRight:6,borderRight:"1px solid "+C.border2}} onClick={()=>navigate("/cleanitbooks")}>
              <div style={{width:26,height:26,borderRadius:5,background:C.green,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Ico n="job" s={13} c="white"/>
              </div>
              <span style={{fontSize:12,fontWeight:700,color:C.text}}>CleanIT<span style={{color:C.green}}>Books</span></span>
            </div>
            {/* Breadcrumb */}
            <div style={{display:"flex",alignItems:"center",gap:4,padding:"0 10px"}}>
              <button onClick={()=>navigate("/cleanitbooks/jobs")}
                style={{border:"none",background:"none",cursor:"pointer",fontSize:12,color:C.blue,fontWeight:600,fontFamily:"inherit",padding:"4px 6px",borderRadius:4}}
                onMouseEnter={e=>e.currentTarget.style.background=C.blue_l}
                onMouseLeave={e=>e.currentTarget.style.background="none"}>
                Job Center
              </button>
              <span style={{color:C.text4,fontSize:12}}>/</span>
              <span style={{fontSize:12,color:C.text3,fontWeight:600}}>{job.id}</span>
              <span style={{color:C.text4,fontSize:12}}>/</span>
              <span style={{fontSize:12,color:C.text,fontWeight:700}}>{job.name}</span>
            </div>
          </div>
          <div style={{flex:1}}/>
          <div style={{display:"flex",gap:8}}>
            <Btn label="Retour aux jobs" variant="light" sm icon="chevr" onClick={()=>navigate("/cleanitbooks/jobs")}/>
            <Btn label="Modifier" variant="default" sm icon="edit" onClick={()=>navigate('/cleanitbooks/jobs/'+job.id+'/edit')}/>
            <Btn label="Facturer" variant="primary" sm icon="invoice"/>
            <Btn label="Imprimer" variant="light" sm icon="print"/>
          </div>
        </div>

        {/* Ligne 2 — Header job + KPIs */}
        <div style={{padding:"14px 24px",borderBottom:"1px solid "+C.border2,background:C.white}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:5,flexWrap:"wrap"}}>
                <span style={{fontSize:11,color:C.text4,fontWeight:600,fontFamily:"monospace"}}>{job.id}</span>
                <StatutBadge statut={job.statut}/>
                {job.bcRef&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:10,background:C.orange_l,color:C.orange,fontWeight:600}}>{job.bcRef}</span>}
                <span style={{fontSize:11,padding:"2px 8px",borderRadius:10,background:C.border2,color:C.text3}}>{job.jobType}</span>
              </div>
              <div style={{fontSize:22,fontWeight:800,color:C.text,marginBottom:4}}>{job.name}</div>
              <div style={{fontSize:13,color:C.text3}}>
                {cust?.company||cust?.name||"—"} · Site <strong>{job.site||"—"}</strong> · Chef: <strong>{job.chefProjet}</strong>
              </div>
              <div style={{fontSize:12,color:C.text4,marginTop:2}}>{fD(job.startDate)} — {fD(job.endDate)}</div>
            </div>
          </div>

          {/* 5 KPIs financiers */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
            {[
              {l:"Budget Client",   v:fN(job.budgetClient)+" "+job.currency,    c:C.orange, lock:true,  sub:"Prix Client confidentiel"},
              {l:"Contrat CleanIT", v:fN(job.contractAmount)+" "+job.currency,   c:C.blue,   lock:false, sub:"Ce que le client paie"},
              {l:"Budget estime",   v:fN(totalEst)+" "+job.currency,             c:C.text,   lock:false, sub:"Couts prevus"},
              {l:"Couts reels",     v:fN(totalCouts)+" "+job.currency,           c:totalCouts>totalEst?C.red:C.green, lock:false, sub:totalEst>0?Math.round(totalCouts/totalEst*100)+"% du budget":"—"},
              {l:"Marge nette",     v:(marge>=0?"+":"")+fN(marge)+" "+job.currency, c:marge>=0?C.green:C.red, lock:false, sub:job.contractAmount>0?Math.round(Math.abs(marge)/job.contractAmount*100)+"%":"—"},
            ].map((kpi,i)=>(
              <div key={i} style={{padding:"11px 14px",background:kpi.c+"08",borderRadius:6,border:"1px solid "+kpi.c+"25",borderTop:"3px solid "+kpi.c}}>
                <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:4}}>
                  <span style={{fontSize:9,color:kpi.c,textTransform:"uppercase",letterSpacing:.5,fontWeight:700}}>{kpi.l}</span>
                  {kpi.lock&&<Ico n="lock" s={9} c={C.orange}/>}
                </div>
                <div style={{fontSize:16,fontWeight:800,color:kpi.c}}>{kpi.v}</div>
                <div style={{fontSize:10,color:C.text4,marginTop:2}}>{kpi.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ligne 3 — Onglets */}
        <div style={{display:"flex",padding:"0 24px",background:C.white,overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{display:"flex",alignItems:"center",gap:6,padding:"0 16px",height:42,border:"none",background:"transparent",borderBottom:tab===t.id?"2px solid "+C.blue:"2px solid transparent",color:tab===t.id?C.blue:C.text3,fontWeight:tab===t.id?700:400,fontSize:12,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",transition:"all .12s"}}>
              <Ico n={t.icon} s={13} c={tab===t.id?C.blue:C.text3}/>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENU ONGLET */}
      <div style={{padding:"24px",animation:"fadeUp .25s ease"}}>

        {/* OVERVIEW */}
        {tab==="overview"&&(
          <div>
            <div style={{padding:"14px 18px",background:C.white,borderRadius:6,border:"1px solid "+C.border2,marginBottom:20,fontSize:13,color:C.text2,lineHeight:1.8}}>
              {job.description}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
              {/* Estimates vs Actuals */}
              <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
                <div style={{padding:"12px 16px",borderBottom:"1px solid "+C.border,fontSize:13,fontWeight:700,color:C.text}}>Estimates vs Actuals — par poste</div>
                <div style={{padding:"12px 16px",display:"flex",flexDirection:"column",gap:10}}>
                  {COST_CATS.map(cat=>{
                    const estime = job.budgetEstime[cat.key]||0;
                    const reel   = job.coutsReels[cat.key]||0;
                    const over   = reel>estime&&estime>0;
                    return(
                      <div key={cat.key}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <div style={{width:22,height:22,borderRadius:4,background:cat.color+"15",display:"flex",alignItems:"center",justifyContent:"center"}}>
                              <Ico n={cat.icon} s={11} c={cat.color}/>
                            </div>
                            <span style={{fontSize:12,color:C.text2,fontWeight:500}}>{cat.label}</span>
                          </div>
                          <div style={{display:"flex",gap:12,alignItems:"center"}}>
                            <span style={{fontSize:11,color:C.text4}}>Est: {fN(estime)} F</span>
                            <span style={{fontSize:12,fontWeight:700,color:over?C.red:C.green}}>Reel: {fN(reel)} F</span>
                            {over&&<span style={{fontSize:10,color:C.red,fontWeight:600}}>+{fN(reel-estime)} F</span>}
                          </div>
                        </div>
                        <ProgBar value={reel} max={estime||1} color={cat.color} height={5} showPct={false}/>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* P&L */}
              <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
                <div style={{padding:"12px 16px",borderBottom:"1px solid "+C.border,fontSize:13,fontWeight:700,color:C.text}}>P et L — Ce job</div>
                <div style={{padding:"14px 16px"}}>
                  {[
                    {l:"Revenus factures",    v:"+"+fN(totalInvoiced)+" F",      c:C.green,  bold:false},
                    {l:"Main oeuvre",         v:"- "+fN(job.coutsReels.labor)+" F",      c:C.text3,  bold:false},
                    {l:"Materiaux",           v:"- "+fN(job.coutsReels.materials)+" F",  c:C.text3,  bold:false},
                    {l:"Sous-traitance",      v:"- "+fN(job.coutsReels.subcontract)+" F",c:C.text3,  bold:false},
                    {l:"Equipements",         v:"- "+fN(job.coutsReels.equipment)+" F",  c:C.text3,  bold:false},
                    {l:"Frais generaux",      v:"- "+fN(job.coutsReels.overhead)+" F",   c:C.text3,  bold:false},
                    {l:"MARGE NETTE",         v:(marge>=0?"+":"")+fN(marge)+" F",        c:marge>=0?C.green:C.red, bold:true},
                  ].map((r,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:r.bold?"none":"1px solid "+C.border2}}>
                      <span style={{fontSize:r.bold?13:12,fontWeight:r.bold?700:400,color:r.bold?C.text:C.text3}}>{r.l}</span>
                      <span style={{fontSize:r.bold?17:13,fontWeight:r.bold?800:600,color:r.c}}>{r.v}</span>
                    </div>
                  ))}
                </div>
                <div style={{padding:"12px 16px",borderTop:"1px solid "+C.border,background:'#F4F5F7'}}>
                  <div style={{fontSize:11,color:C.text4,marginBottom:4}}>Progression facturation</div>
                  <ProgBar value={totalInvoiced} max={job.contractAmount||1} color={C.green} height={7}/>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                    <span style={{fontSize:11,color:C.text4}}>Facture: {fN(totalInvoiced)} F</span>
                    <span style={{fontSize:11,color:C.text4}}>Reste: {fN(Math.max(0,job.contractAmount-totalInvoiced))} F</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PHASES */}
        {tab==="phases"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:3}}>Phases de facturation</div>
                <div style={{fontSize:13,color:C.text3}}>Progress Invoicing — {job.phases.length} phase(s)</div>
              </div>
              <Btn label="Facturer une phase" variant="primary" sm icon="invoice"/>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {job.phases.map((ph,i)=>(
                <div key={ph.id} style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden",borderLeft:"4px solid "+(ph.statut==="invoiced"?C.green:C.blue)}}>
                  <div style={{padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid "+C.border2}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:32,height:32,borderRadius:"50%",background:ph.statut==="invoiced"?C.green:C.blue,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"white",flexShrink:0}}>{i+1}</div>
                      <div>
                        <div style={{fontSize:15,fontWeight:700,color:C.text}}>{ph.name}</div>
                        {ph.invoiceRef&&<div style={{fontSize:12,color:C.green,marginTop:2}}>Facture: {ph.invoiceRef}</div>}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:16,alignItems:"center"}}>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:20,fontWeight:800,color:C.blue}}>{fN(ph.amount)} {job.currency}</div>
                        <div style={{fontSize:12,color:C.text4}}>{ph.pct}% du contrat</div>
                      </div>
                      <StatutBadge statut={ph.statut}/>
                    </div>
                  </div>
                  <div style={{padding:"12px 18px",display:"flex",gap:24,alignItems:"center",background:'#F4F5F7'}}>
                    {[{l:"Date prevue",v:fD(ph.datePrevue)||"—"},{l:"Date paiement",v:fD(ph.datePaiement)||"En attente"},{l:"Facture ref",v:ph.invoiceRef||"—"}].map(it=>(
                      <div key={it.l}>
                        <div style={{fontSize:10,color:C.text4,textTransform:"uppercase",letterSpacing:.4,marginBottom:2}}>{it.l}</div>
                        <div style={{fontSize:13,fontWeight:600,color:it.l==="Date paiement"&&!ph.datePaiement?C.text4:C.text}}>{it.v}</div>
                      </div>
                    ))}
                    <div style={{marginLeft:"auto"}}>
                      {ph.statut!=="invoiced"
                        ?<Btn label="Creer la facture" variant="primary" sm icon="invoice"/>
                        :<Btn label="Voir la facture" variant="default" sm icon="invoice"/>
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FACTURES */}
        {tab==="invoices"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:16,fontWeight:700,color:C.text}}>Factures liees a ce job</div>
              <Btn label="Nouvelle facture" variant="primary" sm icon="invoice" onClick={()=>navigate('/cleanitbooks/invoices/new')}/>
            </div>
            {job.invoices.length===0?(
              <div style={{padding:"60px",textAlign:"center",background:C.white,border:"1px dashed "+C.border,borderRadius:6}}>
                <Ico n="invoice" s={40} c={C.border}/>
                <div style={{fontSize:15,color:C.text4,marginTop:12,marginBottom:16}}>Aucune facture pour ce job</div>
                <Btn label="Facturer une phase" variant="primary" icon="invoice"/>
              </div>
            ):(
              <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr style={{background:"#F9FAFB",borderBottom:"2px solid "+C.border}}>{["N Facture","Date","Montant","Solde","Statut","Actions"].map((h,i)=><th key={i} style={{padding:"10px 14px",textAlign:i>=2&&i<=3?"right":"left",fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.3}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {job.invoices.map((inv,i)=>(
                      <tr key={inv.id} style={{borderBottom:"1px solid "+C.border2,cursor:"pointer"}}
                        onMouseEnter={e=>e.currentTarget.style.background=C.blue_l}
                        onMouseLeave={e=>e.currentTarget.style.background=C.white}>
                        <td style={{padding:"12px 14px",fontWeight:700,color:C.blue}}>{inv.id}</td>
                        <td style={{padding:"12px 14px",color:C.text3,fontSize:12}}>{fD(inv.date)}</td>
                        <td style={{padding:"12px 14px",textAlign:"right",fontWeight:600,fontSize:13}}>{fN(inv.amount)} {job.currency}</td>
                        <td style={{padding:"12px 14px",textAlign:"right",fontWeight:700,color:inv.balance>0?C.orange:C.green,fontSize:13}}>{fN(inv.balance)} {job.currency}</td>
                        <td style={{padding:"12px 14px"}}><StatutBadge statut={inv.statut}/></td>
                        <td style={{padding:"12px 14px"}}><Btn label="Ouvrir" variant="light" sm/></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot><tr style={{background:"#F9FAFB",borderTop:"2px solid "+C.border}}><td colSpan={2} style={{padding:"10px 14px",fontWeight:700,color:C.text}}>Total facture</td><td style={{padding:"10px 14px",textAlign:"right",fontWeight:800,color:C.green,fontSize:15}}>{fN(totalInvoiced)} {job.currency}</td><td colSpan={3}/></tr></tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* DEPENSES */}
        {tab==="bills"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:16,fontWeight:700,color:C.text}}>Depenses liees a ce job</div>
              <Btn label="Saisir une depense" variant="primary" sm icon="bill"/>
            </div>
            {job.bills.length===0?(
              <div style={{padding:"60px",textAlign:"center",background:C.white,border:"1px dashed "+C.border,borderRadius:6}}>
                <Ico n="bill" s={40} c={C.border}/>
                <div style={{fontSize:15,color:C.text4,marginTop:12,marginBottom:16}}>Aucune depense pour ce job</div>
                <Btn label="Saisir une depense" variant="primary" icon="bill"/>
              </div>
            ):(
              <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr style={{background:"#F9FAFB",borderBottom:"2px solid "+C.border}}>{["N Bill","Fournisseur","Date","Montant","Statut","Actions"].map((h,i)=><th key={i} style={{padding:"10px 14px",textAlign:i===3?"right":"left",fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.3}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {job.bills.map((b,i)=>(
                      <tr key={b.id} style={{borderBottom:"1px solid "+C.border2,cursor:"pointer"}}
                        onMouseEnter={e=>e.currentTarget.style.background=C.blue_l}
                        onMouseLeave={e=>e.currentTarget.style.background=C.white}>
                        <td style={{padding:"12px 14px",fontWeight:700,color:C.orange}}>{b.id}</td>
                        <td style={{padding:"12px 14px",fontSize:12}}>{b.vendor}</td>
                        <td style={{padding:"12px 14px",color:C.text3,fontSize:12}}>{fD(b.date)}</td>
                        <td style={{padding:"12px 14px",textAlign:"right",fontWeight:700,color:C.red,fontSize:13}}>{fN(b.amount)} F</td>
                        <td style={{padding:"12px 14px"}}><StatutBadge statut={b.statut}/></td>
                        <td style={{padding:"12px 14px"}}><Btn label="Ouvrir" variant="light" sm/></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot><tr style={{background:"#F9FAFB",borderTop:"2px solid "+C.border}}><td colSpan={3} style={{padding:"10px 14px",fontWeight:700,color:C.text}}>Total depenses</td><td style={{padding:"10px 14px",textAlign:"right",fontWeight:800,color:C.red,fontSize:15}}>{fN(totalBills)} F</td><td colSpan={2}/></tr></tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* HEURES */}
        {tab==="time"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:16,fontWeight:700,color:C.text}}>Heures enregistrees</div>
              <Btn label="Saisir des heures" variant="primary" sm icon="time"/>
            </div>
            {job.timeEntries.length===0?(
              <div style={{padding:"60px",textAlign:"center",background:C.white,border:"1px dashed "+C.border,borderRadius:6}}>
                <Ico n="time" s={40} c={C.border}/>
                <div style={{fontSize:15,color:C.text4,marginTop:12,marginBottom:16}}>Aucune heure pour ce job</div>
                <Btn label="Saisir des heures" variant="primary" icon="time"/>
              </div>
            ):(
              <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr style={{background:"#F9FAFB",borderBottom:"2px solid "+C.border}}>{["Employe","Date","Service","Heures","Taux/h","Montant","Facturable"].map((h,i)=><th key={i} style={{padding:"10px 14px",textAlign:i>=3&&i<=5?"right":"left",fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.3}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {job.timeEntries.map((t,i)=>(
                      <tr key={i} style={{borderBottom:"1px solid "+C.border2}}>
                        <td style={{padding:"12px 14px",fontWeight:600}}>{t.emp}</td>
                        <td style={{padding:"12px 14px",color:C.text3,fontSize:12}}>{fD(t.date)}</td>
                        <td style={{padding:"12px 14px",fontSize:12}}>{t.service}</td>
                        <td style={{padding:"12px 14px",textAlign:"right",fontWeight:600}}>{t.hours}h</td>
                        <td style={{padding:"12px 14px",textAlign:"right",color:C.text3,fontSize:12}}>{fN(t.rate)} F</td>
                        <td style={{padding:"12px 14px",textAlign:"right",fontWeight:700,color:C.blue}}>{fN(t.hours*t.rate)} F</td>
                        <td style={{padding:"12px 14px"}}>{t.billable?<span style={{fontSize:11,color:C.green,fontWeight:600,background:C.green_l,padding:"2px 8px",borderRadius:10}}>Oui</span>:<span style={{fontSize:11,color:C.text4,background:C.border2,padding:"2px 8px",borderRadius:10}}>Non</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot><tr style={{background:"#F9FAFB",borderTop:"2px solid "+C.border}}><td colSpan={3} style={{padding:"10px 14px",fontWeight:700}}>Total</td><td style={{padding:"10px 14px",textAlign:"right",fontWeight:800}}>{job.timeEntries.reduce((s,t)=>s+t.hours,0)}h</td><td/><td style={{padding:"10px 14px",textAlign:"right",fontWeight:800,color:C.blue,fontSize:15}}>{fN(totalTime)} F</td><td/></tr></tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* BC CLIENT */}
        {tab==="bc"&&(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:"#FEF3C7",border:"1px solid "+C.orange+"50",borderRadius:6,marginBottom:20}}>
              <Ico n="lock" s={16} c={C.orange}/>
              <div style={{fontSize:13,color:C.text2}}>
                <strong style={{color:C.orange}}>CONFIDENTIEL Finance et Direction —</strong> Non visible par les Project Managers.
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
              {[
                {l:"Prix Client",    v:fN(job.budgetClient)+" "+job.currency,               c:C.orange},
                {l:"Contrat CleanIT",v:fN(job.contractAmount)+" "+job.currency,              c:C.blue},
                {l:"Marge brute",    v:fN(job.budgetClient-job.contractAmount)+" "+job.currency, c:job.budgetClient>job.contractAmount?C.green:C.red},
              ].map((s,i)=>(
                <div key={i} style={{padding:"16px 20px",background:C.white,border:"1px solid "+C.border,borderRadius:6,borderTop:"3px solid "+s.c,textAlign:"center"}}>
                  <div style={{fontSize:11,color:C.text3,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>{s.l}</div>
                  <div style={{fontSize:22,fontWeight:800,color:s.c}}>{s.v}</div>
                </div>
              ))}
            </div>
            <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid "+C.border,fontSize:13,fontWeight:700,color:C.text}}>Lignes du bon de commande</div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:"#F9FAFB",borderBottom:"1px solid "+C.border}}>{["Description","Quantite","Prix unitaire","Total"].map((h,i)=><th key={i} style={{padding:"10px 14px",textAlign:i>=1?"right":"left",fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.3}}>{h}</th>)}</tr></thead>
                <tbody>
                  {job.lignesBC.map((l,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid "+C.border2}}>
                      <td style={{padding:"12px 14px",fontSize:13}}>{l.desc}</td>
                      <td style={{padding:"12px 14px",textAlign:"right",color:C.text3}}>{l.qte}</td>
                      <td style={{padding:"12px 14px",textAlign:"right",color:C.text3}}>{fN(l.pu)} {job.currency}</td>
                      <td style={{padding:"12px 14px",textAlign:"right",fontWeight:700,color:C.orange,fontSize:13}}>{fN(l.total)} {job.currency}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr style={{background:"#F9FAFB",borderTop:"2px solid "+C.border}}><td colSpan={3} style={{padding:"12px 14px",fontWeight:700,fontSize:13}}>TOTAL BC</td><td style={{padding:"12px 14px",textAlign:"right",fontWeight:800,color:C.orange,fontSize:17}}>{fN(job.lignesBC.reduce((s,l)=>s+l.total,0))} {job.currency}</td></tr></tfoot>
              </table>
            </div>
          </div>
        )}

        {/* NOTES */}
        {tab==="notes"&&(
          <div style={{maxWidth:800}}>
            <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:16}}>Notes internes</div>
            <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"16px",marginBottom:16,fontSize:13,color:C.text2,lineHeight:1.8,minHeight:120}}>
              {job.notes||<span style={{color:C.text4}}>Aucune note pour ce job.</span>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,padding:"14px 16px",background:C.white,border:"1px solid "+C.border,borderRadius:6}}>
              {[{l:"Date creation",v:fD(job.dateCreation)},{l:"Derniere modif.",v:fD(TODAY)},{l:"ID du job",v:job.id}].map(it=>(
                <div key={it.l}>
                  <div style={{fontSize:10,color:C.text4,textTransform:"uppercase",letterSpacing:.4,marginBottom:3}}>{it.l}</div>
                  <div style={{fontSize:13,fontWeight:600,color:C.text}}>{it.v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      
    </div>
  );
};

// ================================================================
//  EXPORT PRINCIPAL — Router entre les pages
// ================================================================
const PageJobNew = ({initial,customers,onSave,onCancel}) => {
  const navigate = useNavigate();
  const isEdit   = !!initial;

  const [step,       setStep]       = useState(1);
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
  const [budgetHW,   setBudgetHW]   = useState(initial?.budgetClient||"");
  const [contractAmt,setContractAmt]= useState(initial?.contractAmount||"");
  const [lignesBC,   setLignesBC]   = useState(initial?.lignesBC||[{desc:"",qte:1,pu:0,total:0}]);
  const [budgetEst,  setBudgetEst]  = useState(initial?.budgetEstime||{labor:0,materials:0,subcontract:0,equipment:0,overhead:0});
  const [phases,     setPhases]     = useState(initial?.phases||[{id:"PH1",name:"Paiement unique",pct:100,amount:0,statut:"pending",invoiceRef:null,datePrevue:"",datePaiement:null}]);

  const totalBC    = lignesBC.reduce((s,l)=>s+(l.qte*(l.pu||0)),0);
  const totalEst   = Object.values(budgetEst).reduce((s,v)=>s+(+v||0),0);
  const totalPhases= phases.reduce((s,p)=>s+(+p.amount||0),0);
  const pctPhases  = +contractAmt>0?Math.round(totalPhases/+contractAmt*100):0;

  const updLigneBC = (i,k,v) => setLignesBC(p=>p.map((l,idx)=>{
    if(idx!==i) return l;
    const nl={...l,[k]:k==="qte"||k==="pu"?+v:v};
    if(k==="qte"||k==="pu") nl.total=nl.qte*nl.pu;
    return nl;
  }));

  const updPhase = (i,k,v) => setPhases(p=>p.map((ph,idx)=>{
    if(idx!==i) return ph;
    const nph={...ph,[k]:k==="pct"||k==="amount"?+v:v};
    if(k==="pct"&&+contractAmt>0) nph.amount=Math.round(+contractAmt*(+v/100));
    return nph;
  }));

  const save = () => {
    if(!name||!custId){alert("Nom et client obligatoires");return;}
    onSave({
      id:initial?.id||"JOB-"+String(Date.now()).slice(-6),
      name,customerId:custId,bcRef,jobType,statut,site,chefProjet:chef,
      startDate,endDate,currency,description:desc,notes,
      budgetClient:+budgetHW||0,contractAmount:+contractAmt||0,
      budgetEstime:Object.fromEntries(Object.entries(budgetEst).map(([k,v])=>[k,+v||0])),
      phases,lignesBC,
      coutsReels:initial?.coutsReels||{labor:0,materials:0,subcontract:0,equipment:0,overhead:0},
      invoices:initial?.invoices||[],
      bills:initial?.bills||[],
      timeEntries:initial?.timeEntries||[],
      dateCreation:initial?.dateCreation||TODAY,
    });
  };

  const STEPS = [
    {n:1,label:"Informations generales"},
    {n:2,label:"Bon de commande (confidentiel)"},
    {n:3,label:"Budget estime"},
    {n:4,label:"Phases de facturation"},
    {n:5,label:"Recapitulatif"},
  ];

  return(
    <div style={{minHeight:"100vh",background:'#F4F5F7',fontFamily:'"Segoe UI",Arial,sans-serif'}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}*{box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px}`}</style>

      {/* TOPBAR */}
      <div style={{background:C.white,borderBottom:"1px solid "+C.border,position:"sticky",top:0,zIndex:200,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
        <div style={{display:"flex",alignItems:"center",padding:"0 24px",height:52,gap:0,borderBottom:"1px solid "+C.border2}}>
          <div style={{display:"flex",alignItems:"center",gap:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",paddingRight:14,marginRight:6,borderRight:"1px solid "+C.border2}} onClick={()=>navigate("/cleanitbooks")}>
              <div style={{width:26,height:26,borderRadius:5,background:C.green,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Ico n="job" s={13} c="white"/>
              </div>
              <span style={{fontSize:12,fontWeight:700,color:C.text}}>CleanIT<span style={{color:C.green}}>Books</span></span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:4,padding:"0 10px"}}>
              <button onClick={()=>navigate("/cleanitbooks/jobs")}
                style={{border:"none",background:"none",cursor:"pointer",fontSize:12,color:C.blue,fontWeight:600,fontFamily:"inherit",padding:"4px 6px",borderRadius:4}}>
                Job Center
              </button>
              <span style={{color:C.text4,fontSize:12}}>/</span>
              <span style={{fontSize:12,color:C.text,fontWeight:700}}>{isEdit?"Modifier "+initial.id:"Nouveau job"}</span>
            </div>
          </div>
          <div style={{flex:1}}/>
          <div style={{display:"flex",gap:8}}>
            <Btn label="Annuler" variant="light" sm onClick={onCancel}/>
            {step===5&&<Btn label={isEdit?"Enregistrer":"Creer le job"} variant="primary" sm icon="check" onClick={save}/>}
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div style={{maxWidth:960,margin:"0 auto",padding:"32px 24px",animation:"fadeUp .3s ease"}}>
        <div style={{fontSize:22,fontWeight:800,color:C.text,marginBottom:6}}>{isEdit?"Modifier le job":"Creer un nouveau job"}</div>
        <div style={{fontSize:14,color:C.text3,marginBottom:28}}>CleanITBooks · Job Center · SYSCOHADA</div>

        {/* Steps */}
        <div style={{display:"flex",gap:0,marginBottom:32,background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
          {STEPS.map((s,i)=>(
            <button key={s.n} onClick={()=>setStep(s.n)}
              style={{flex:1,padding:"14px 8px",border:"none",borderRight:i<STEPS.length-1?"1px solid "+C.border:"none",cursor:"pointer",fontFamily:"inherit",background:step===s.n?C.green_l:step>s.n?"#F0FDF4":"transparent",transition:"all .15s"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <div style={{width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:step===s.n?C.green:step>s.n?C.green:"#E5E7EB",color:step>=s.n?"white":C.text4,fontSize:11,fontWeight:700,flexShrink:0}}>
                  {step>s.n?<Ico n="check" s={11} c="white"/>:s.n}
                </div>
                <span style={{fontSize:12,fontWeight:step===s.n?700:400,color:step===s.n?C.green:step>s.n?C.green:C.text3}}>{s.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* STEP 1 */}
        {step===1&&(
          <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"28px"}}>
            <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:20}}>Informations generales</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              <Field label="Nom du job" required span>
                <Inp value={name} onChange={setName} placeholder="Ex: Installation 5G NR DLA-001"/>
              </Field>
              <Field label="Client" required>
                <Sel value={custId} onChange={setCustId} placeholder="Selectionner un client" options={customers.map(c=>({v:c.id,l:c.company||c.name||c.id}))}/>
              </Field>
              <Field label="Type de job" required>
                <Sel value={jobType} onChange={setJobType} placeholder="Selectionner le type" options={JOB_TYPES}/>
              </Field>
              <Field label="Statut">
                <Sel value={statut} onChange={setStatut} options={JOB_STATUTS}/>
              </Field>
              <Field label="Site" hint="Code du site reseau ex: DLA-001">
                <Inp value={site} onChange={setSite} placeholder="DLA-001"/>
              </Field>
              <Field label="Chef de projet">
                <Inp value={chef} onChange={setChef} placeholder="Nom du responsable"/>
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

        {/* STEP 2 */}
        {step===2&&(
          <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"28px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:"#FEF3C7",border:"1px solid "+C.orange+"50",borderRadius:6,marginBottom:24}}>
              <Ico n="lock" s={16} c={C.orange}/>
              <div>
                <strong style={{color:C.orange,fontSize:13}}>CONFIDENTIEL — Finance et Comptabilite uniquement</strong>
                <div style={{fontSize:12,color:C.text2,marginTop:2}}>Non visible par les Project Managers.</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:24}}>
              <Field label="Reference Bon de commande">
                <Inp value={bcRef} onChange={setBcRef} placeholder="BC-2024-XXX"/>
              </Field>
              <Field label="Devise">
                <Sel value={currency} onChange={setCurrency} options={["FCFA","USD","EUR"]}/>
              </Field>
              <Field label="Montant total Client" required hint="Ce que Client vous paie">
                <Inp type="number" value={budgetHW} onChange={setBudgetHW} prefix={currency} placeholder="0"/>
              </Field>
              <Field label="Montant contrat CleanIT" required hint="Ce que vous facturez au client">
                <Inp type="number" value={contractAmt} onChange={setContractAmt} prefix={currency} placeholder="0"/>
              </Field>
            </div>
            {budgetHW&&contractAmt&&(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:24}}>
                {[
                  {l:"Prix Client",   v:fN(+budgetHW)+" "+currency,              c:C.orange},
                  {l:"Contrat CleanIT",v:fN(+contractAmt)+" "+currency,           c:C.blue},
                  {l:"Marge brute",   v:fN(+budgetHW-+contractAmt)+" "+currency,  c:+budgetHW>+contractAmt?C.green:C.red},
                ].map((s,i)=>(
                  <div key={i} style={{padding:"14px 16px",background:'#F4F5F7',borderRadius:6,borderTop:"3px solid "+s.c,textAlign:"center"}}>
                    <div style={{fontSize:11,color:C.text3,textTransform:"uppercase",letterSpacing:.4,marginBottom:4}}>{s.l}</div>
                    <div style={{fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:700,color:C.text}}>Lignes du bon de commande</div>
              <Btn label="+ Ajouter" variant="light" sm onClick={()=>setLignesBC(p=>[...p,{desc:"",qte:1,pu:0,total:0}])}/>
            </div>
            <div style={{border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:'#F4F5F7',borderBottom:"2px solid "+C.border}}>
                    {["Description","Qte","Prix unitaire ("+currency+")","Total",""].map((h,i)=>(
                      <th key={i} style={{padding:"10px 12px",textAlign:i>=1&&i<=3?"right":"left",fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.3}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lignesBC.map((l,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid "+C.border2}}>
                      <td style={{padding:"8px 10px"}}><Inp value={l.desc} onChange={v=>updLigneBC(i,"desc",v)} placeholder="Description" small/></td>
                      <td style={{padding:"8px 8px",width:80}}><Inp type="number" value={l.qte} onChange={v=>updLigneBC(i,"qte",v)} small/></td>
                      <td style={{padding:"8px 8px",width:160}}><Inp type="number" value={l.pu} onChange={v=>updLigneBC(i,"pu",v)} small/></td>
                      <td style={{padding:"8px 12px",textAlign:"right",fontWeight:700,color:C.orange,width:140}}>{fN(l.qte*(l.pu||0))} {currency}</td>
                      <td style={{padding:"8px 8px",width:36}}>
                        {lignesBC.length>1&&<button onClick={()=>setLignesBC(p=>p.filter((_,xi)=>xi!==i))} style={{width:24,height:24,borderRadius:4,border:"1px solid "+C.border,background:C.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="close" s={12} c={C.text3}/></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{borderTop:"2px solid "+C.border,background:'#F4F5F7'}}>
                    <td colSpan={3} style={{padding:"10px 12px",fontWeight:700,color:C.text}}>TOTAL BC CLIENT</td>
                    <td style={{padding:"10px 12px",textAlign:"right",fontWeight:800,color:C.orange,fontSize:15}}>{fN(totalBC)} {currency}</td>
                    <td/>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step===3&&(
          <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"28px"}}>
            <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:6}}>Budget estime par poste de cout</div>
            <div style={{fontSize:13,color:C.text3,marginBottom:24}}>Definissez votre budget previsionnel. Il sera compare aux couts reels en temps reel.</div>
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
              {COST_CATS.map(cat=>(
                <div key={cat.key} style={{display:"grid",gridTemplateColumns:"240px 1fr 160px",gap:16,alignItems:"center",padding:"16px 20px",background:'#F4F5F7',borderRadius:6,border:"1px solid "+C.border,borderLeft:"4px solid "+cat.color}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:36,height:36,borderRadius:6,background:cat.color+"15",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <Ico n={cat.icon} s={17} c={cat.color}/>
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:C.text}}>{cat.label}</div>
                      <div style={{fontSize:11,color:C.text4}}>Poste de cout</div>
                    </div>
                  </div>
                  <Inp type="number" value={budgetEst[cat.key]||""} onChange={v=>setBudgetEst(p=>({...p,[cat.key]:+v||0}))} placeholder="0" prefix={currency}/>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:15,fontWeight:700,color:cat.color}}>{fN(+budgetEst[cat.key]||0)} {currency}</div>
                    <div style={{fontSize:11,color:C.text4}}>{totalEst>0?Math.round((+budgetEst[cat.key]||0)/totalEst*100):0}% du total</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,padding:"16px",background:'#F4F5F7',borderRadius:6,border:"1px solid "+C.border}}>
              {[
                {l:"Budget total estime",   v:fN(totalEst)+" "+currency,              c:C.blue},
                {l:"Contrat CleanIT",       v:fN(+contractAmt||0)+" "+currency,       c:C.green},
                {l:"Marge prevue",          v:fN((+contractAmt||0)-totalEst)+" "+currency, c:(+contractAmt||0)-totalEst>=0?C.green:C.red},
              ].map((s,i)=>(
                <div key={i} style={{textAlign:"center"}}>
                  <div style={{fontSize:11,color:C.text3,textTransform:"uppercase",letterSpacing:.4,marginBottom:4}}>{s.l}</div>
                  <div style={{fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step===4&&(
          <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"28px"}}>
            <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:6}}>Phases de facturation</div>
            <div style={{fontSize:13,color:C.text3,marginBottom:20}}>Definissez les etapes de facturation. Chaque phase peut etre facturee independamment.</div>
            {pctPhases!==100&&phases.length>0&&(
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:C.orange_l,border:"1px solid "+C.orange+"40",borderRadius:6,marginBottom:16}}>
                <Ico n="alert" s={15} c={C.orange}/>
                <span style={{fontSize:12,color:C.orange}}>Total phases: {pctPhases}% — doit etre 100% ({fN(+contractAmt||0)} {currency})</span>
              </div>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16}}>
              {phases.map((ph,i)=>(
                <div key={i} style={{border:"1px solid "+C.border,borderRadius:6,overflow:"hidden",borderLeft:"4px solid "+(ph.statut==="invoiced"?C.green:C.blue)}}>
                  <div style={{padding:"12px 16px",background:'#F4F5F7',display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:26,height:26,borderRadius:"50%",background:ph.statut==="invoiced"?C.green:C.blue,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"white"}}>{i+1}</div>
                      <Inp value={ph.name} onChange={v=>updPhase(i,"name",v)} placeholder={"Phase "+(i+1)} small/>
                    </div>
                    {phases.length>1&&(
                      <button onClick={()=>setPhases(p=>p.filter((_,xi)=>xi!==i))} style={{width:24,height:24,borderRadius:4,border:"1px solid "+C.border,background:C.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="close" s={12} c={C.text3}/></button>
                    )}
                  </div>
                  <div style={{padding:"14px 16px",display:"grid",gridTemplateColumns:"120px 1fr 1fr 1fr",gap:12,alignItems:"end"}}>
                    <Field label="Pourcentage">
                      <Inp type="number" value={ph.pct} onChange={v=>updPhase(i,"pct",v)} min="0" max="100" suffix="%"/>
                    </Field>
                    <Field label={"Montant ("+currency+")"}>
                      <Inp type="number" value={ph.amount} onChange={v=>updPhase(i,"amount",v)} prefix={currency}/>
                    </Field>
                    <Field label="Date prevue">
                      <Inp type="date" value={ph.datePrevue||""} onChange={v=>updPhase(i,"datePrevue",v)}/>
                    </Field>
                    <Field label="Ref facture">
                      <Inp value={ph.invoiceRef||""} onChange={v=>updPhase(i,"invoiceRef",v)} placeholder="INV-XXXX"/>
                    </Field>
                  </div>
                </div>
              ))}
            </div>
            <Btn label="+ Ajouter une phase" variant="light" icon="plus" onClick={()=>setPhases(p=>[...p,{id:"PH"+(p.length+1),name:"Phase "+(p.length+1),pct:0,amount:0,statut:"pending",invoiceRef:null,datePrevue:"",datePaiement:null}])}/>
            {+contractAmt>0&&(
              <div style={{marginTop:16,padding:"14px 16px",background:'#F4F5F7',borderRadius:6,border:"1px solid "+C.border}}>
                <ProgBar value={totalPhases} max={+contractAmt} color={C.green} height={8}/>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                  <span style={{fontSize:12,color:C.text3}}>Total phases: {fN(totalPhases)} {currency}</span>
                  <span style={{fontSize:12,fontWeight:700,color:pctPhases===100?C.green:C.orange}}>{pctPhases}%</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5 — Recap */}
        {step===5&&(
          <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"28px"}}>
            <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:6}}>Recapitulatif avant {isEdit?"modification":"creation"}</div>
            <div style={{fontSize:13,color:C.text3,marginBottom:24}}>Verifiez les informations avant de valider.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Informations generales</div>
                {[{l:"Nom",v:name||"—"},{l:"Client",v:customers.find(c=>c.id===custId)?.name||"—"},{l:"Type",v:jobType||"—"},{l:"Statut",v:statut},{l:"Site",v:site||"—"},{l:"Chef de projet",v:chef||"—"},{l:"Dates",v:(startDate||"?")+" au "+(endDate||"?")}].map(it=>(
                  <div key={it.l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid "+C.border2}}>
                    <span style={{fontSize:12,color:C.text3}}>{it.l}</span>
                    <span style={{fontSize:12,fontWeight:600,color:C.text}}>{it.v}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Informations financieres</div>
                {[{l:"Bon de commande",v:bcRef||"—"},{l:"Prix Client",v:budgetHW?fN(+budgetHW)+" "+currency:"—",c:C.orange},{l:"Contrat CleanIT",v:contractAmt?fN(+contractAmt)+" "+currency:"—",c:C.blue},{l:"Marge brute",v:budgetHW&&contractAmt?fN(+budgetHW-+contractAmt)+" "+currency:"—",c:C.green},{l:"Budget estime",v:fN(totalEst)+" "+currency},{l:"Phases",v:phases.length+" phase(s)"},{l:"Total phases",v:fN(totalPhases)+" "+currency+(pctPhases===100?" (100%)":(" ("+pctPhases+"%)!"))}].map(it=>(
                  <div key={it.l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid "+C.border2}}>
                    <span style={{fontSize:12,color:C.text3}}>{it.l}</span>
                    <span style={{fontSize:12,fontWeight:600,color:it.c||C.text}}>{it.v}</span>
                  </div>
                ))}
              </div>
            </div>
            <Field label="Notes internes">
              <Txt value={notes} onChange={setNotes} placeholder="Notes, informations complementaires..." rows={3}/>
            </Field>
          </div>
        )}

        {/* Navigation steps */}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:24}}>
          <div>
            {step>1&&<Btn label="Precedent" onClick={()=>setStep(s=>s-1)} variant="default" icon="chevr"/>}
          </div>
          <div style={{display:"flex",gap:10}}>
            <Btn label="Annuler" onClick={onCancel} variant="light"/>
            {step<5
              ?<Btn label="Suivant" onClick={()=>setStep(s=>s+1)} variant="primary"/>
              :<Btn label={isEdit?"Enregistrer les modifications":"Creer le job"} onClick={save} variant="primary" icon="check"/>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

// ================================================================
//  FACTURATION AR
// ================================================================
const INIT_INVOICES_AR = []; // Données depuis CleanITBooks API

const STATUS_INV = {
  "Paid":    {c:C.green,  bg:C.green_l,  l:"Paye"},
  "Partial": {c:C.orange, bg:C.orange_l, l:"Partiel"},
  "Overdue": {c:C.red,    bg:C.red_l,    l:"En retard"},
  "Sent":    {c:C.blue,   bg:C.blue_l,   l:"Envoye"},
  "Draft":   {c:C.text3,  bg:C.border2,  l:"Brouillon"},
};

const PageInvoiceList = ({invoices,customers,jobs}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState("Tous");
  const filtered = invoices.filter(inv=>{
    const cust=customers.find(c=>c.id===inv.customerId);
    const ms=!search||(inv.id+(cust?cust.company||cust.name:"")).toLowerCase().includes(search.toLowerCase());
    return ms&&(filtre==="Tous"||inv.status===filtre);
  });
  const totalCA=filtered.reduce((s,i)=>s+i.total,0);
  const totalPaid=filtered.reduce((s,i)=>s+i.amountPaid,0);
  const totalBalance=filtered.reduce((s,i)=>s+i.balance,0);
  const totalOverdue=filtered.filter(i=>i.status==="Overdue").reduce((s,i)=>s+i.balance,0);
  return(
    <div style={{minHeight:"100vh",background:'#F4F5F7',fontFamily:"\"Segoe UI\",Arial,sans-serif"}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}*{box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px}`}</style>
      <CIBTopBar title="Facturation AR" icon="invoice" color={C.green}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,background:'#F4F5F7',border:"1px solid "+C.border,borderRadius:4,padding:"6px 12px"}}>
            <Ico n="search" s={13} c={C.text4}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
              style={{border:"none",outline:"none",fontSize:12,color:C.text,background:"transparent",width:150,fontFamily:"inherit"}}/>
          </div>
          <Btn label="Nouvelle facture" variant="primary" sm icon="plus" onClick={()=>navigate('/cleanitbooks/invoices/new')}/>
        </div>
      </CIBTopBar>
      <div style={{padding:"24px",animation:"fadeUp .3s ease"}}>
        {totalOverdue>0&&(
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 18px",background:"#FEF3C7",border:"1px solid "+C.orange+"40",borderRadius:6,marginBottom:18}}>
            <Ico n="alert" s={16} c={C.orange}/>
            <span style={{fontSize:13,color:C.text2,flex:1}}><strong style={{color:C.orange}}>Alerte : </strong>{filtered.filter(i=>i.status==="Overdue").length} facture(s) en retard — {fM(totalOverdue)} F</span>
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          {[{l:"CA total",v:fM(totalCA)+" F",c:C.blue,icon:"chart"},{l:"Encaisse",v:fM(totalPaid)+" F",c:C.green,icon:"receive"},{l:"Encours AR",v:fM(totalBalance)+" F",c:C.orange,icon:"invoice"},{l:"En retard",v:fM(totalOverdue)+" F",c:C.red,icon:"alert"}].map((kpi,i)=>(
            <div key={i} style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"14px 16px",borderTop:"3px solid "+kpi.c}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:10,color:C.text3,textTransform:"uppercase",letterSpacing:.4,fontWeight:600}}>{kpi.l}</span>
                <div style={{width:28,height:28,borderRadius:4,background:kpi.c+"15",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n={kpi.icon} s={14} c={kpi.c}/></div>
              </div>
              <div style={{fontSize:20,fontWeight:700,color:kpi.c}}>{kpi.v}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {["Tous","Sent","Partial","Paid","Overdue","Draft"].map(f=>(
            <button key={f} onClick={()=>setFiltre(f)}
              style={{padding:"7px 14px",border:"1px solid "+(filtre===f?C.green:C.border),borderRadius:4,background:filtre===f?C.green:C.white,color:filtre===f?"white":C.text3,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
              {f==="Tous"?"Toutes":f==="Sent"?"Envoyees":f==="Partial"?"Partielles":f==="Paid"?"Payees":f==="Overdue"?"En retard":"Brouillons"}
            </button>
          ))}
        </div>
        <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:"#F9FAFB",borderBottom:"2px solid "+C.border}}>
                {["N Facture","Client","Date","Echeance","Total TTC","Paye","Solde","Statut","Actions"].map((h,i)=>(
                  <th key={i} style={{padding:"10px 14px",textAlign:i>=4&&i<=6?"right":"left",fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.4}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={9} style={{padding:"48px",textAlign:"center",color:C.text4}}>Aucune facture</td></tr>}
              {filtered.map((inv,i)=>{
                const cust=customers.find(c=>c.id===inv.customerId);
                const sc=STATUS_INV[inv.status]||{c:C.text3,bg:C.border2,l:inv.status};
                return(
                  <tr key={inv.id} style={{borderBottom:"1px solid "+C.border2,cursor:"pointer",background:i%2===1?"#FAFAFA":C.white}}
                    onMouseEnter={e=>e.currentTarget.style.background=C.blue_l}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===1?"#FAFAFA":C.white}
                    onClick={()=>navigate("/cleanitbooks/invoices/"+inv.id)}>
                    <td style={{padding:"12px 14px",fontWeight:700,color:C.blue}}>{inv.id}</td>
                    <td style={{padding:"12px 14px",fontSize:13}}>{cust?cust.company||cust.name:"—"}</td>
                    <td style={{padding:"12px 14px",color:C.text3,fontSize:12}}>{fD2(inv.date)}</td>
                    <td style={{padding:"12px 14px",color:inv.status==="Overdue"?C.red:C.text3,fontSize:12}}>{fD2(inv.dueDate)}</td>
                    <td style={{padding:"12px 14px",textAlign:"right",fontWeight:700}}>{fN(inv.total)} {inv.currency}</td>
                    <td style={{padding:"12px 14px",textAlign:"right",color:C.green,fontWeight:600}}>{inv.amountPaid>0?fN(inv.amountPaid)+" "+inv.currency:"—"}</td>
                    <td style={{padding:"12px 14px",textAlign:"right",fontWeight:700,color:inv.balance>0?C.orange:C.green}}>{inv.balance>0?fN(inv.balance)+" "+inv.currency:"—"}</td>
                    <td style={{padding:"12px 14px"}}><span style={{fontSize:11,padding:"3px 9px",borderRadius:10,background:sc.bg,color:sc.c,fontWeight:600}}>{sc.l}</span></td>
                    <td style={{padding:"12px 14px"}} onClick={e=>e.stopPropagation()}>
                      <div style={{display:"flex",gap:4}}>
                        <Btn label="Voir" variant="light" sm onClick={()=>navigate("/cleanitbooks/invoices/"+inv.id)}/>
                        {inv.balance>0&&<Btn label="Paiement" variant="primary" sm/>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{background:"#F9FAFB",borderTop:"2px solid "+C.border}}>
                <td colSpan={4} style={{padding:"10px 14px",fontWeight:700,color:C.text}}>TOTAL — {filtered.length} facture(s)</td>
                <td style={{padding:"10px 14px",textAlign:"right",fontWeight:800,color:C.blue,fontSize:14}}>{fN(totalCA)} F</td>
                <td style={{padding:"10px 14px",textAlign:"right",fontWeight:800,color:C.green}}>{fN(totalPaid)} F</td>
                <td style={{padding:"10px 14px",textAlign:"right",fontWeight:800,color:totalBalance>0?C.orange:C.green}}>{fN(totalBalance)} F</td>
                <td colSpan={2}/>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

const PageInvoiceDetail = ({invoices,customers,jobs}) => {
  const navigate    = useNavigate();
  const {invoiceId} = useParams();
  const inv  = invoices.find(i=>i.id===invoiceId);
  const cust = inv?customers.find(c=>c.id===inv.customerId):null;
  const job  = inv?jobs.find(j=>j.id===inv.jobId):null;
  if(!inv) return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,background:'#F4F5F7'}}>
      <div style={{fontSize:18,color:C.text4}}>Facture introuvable</div>
      <Btn label="Retour" variant="primary" onClick={()=>navigate("/cleanitbooks/invoices")}/>
    </div>
  );
  const sc = STATUS_INV[inv.status]||{c:C.text3,bg:C.border2,l:inv.status};
  return(
    <div style={{minHeight:"100vh",background:'#F4F5F7',fontFamily:"\"Segoe UI\",Arial,sans-serif"}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}*{box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px}`}</style>
      <CIBTopBar title={"Facture "+inv.id} icon="invoice" color={C.green}>
        <div style={{display:"flex",gap:8}}>
          <Btn label="Retour" variant="light" sm onClick={()=>navigate("/cleanitbooks/invoices")}/>
          <button onClick={()=>exportInvoicePDF(inv,customers.find(x=>x.id===inv.customerId))}
            style={{background:"#2CA01C",border:"none",borderRadius:5,padding:"5px 12px",color:"white",fontSize:12,fontWeight:600,cursor:"pointer"}}>
            PDF
          </button>
          {inv.balance>0&&<Btn label="Recevoir paiement" variant="primary" sm icon="receive" onClick={()=>setShowPay(true)}/>}
        </div>
      </CIBTopBar>
      <div style={{padding:"24px",maxWidth:900,margin:"0 auto",animation:"fadeUp .3s ease"}}>
        <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden",marginBottom:20}}>
          <div style={{padding:"16px 24px",background:sc.bg,borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:11,color:sc.c,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Facture Client</div>
              <div style={{fontSize:28,fontWeight:800,color:sc.c}}>{fN(inv.total)} {inv.currency}</div>
            </div>
            <span style={{fontSize:13,padding:"5px 14px",borderRadius:20,background:sc.c,color:"white",fontWeight:700}}>{sc.l}</span>
          </div>
          <div style={{padding:"20px 24px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
              <div>
                <div style={{fontSize:10,color:C.text4,textTransform:"uppercase",letterSpacing:.4,marginBottom:8,fontWeight:600}}>Facture a</div>
                <div style={{fontSize:14,fontWeight:700,color:C.text}}>{cust?cust.company||cust.name:"—"}</div>
                <div style={{fontSize:12,color:C.text3}}>{cust?cust.contact:"—"} · {cust?cust.city:"—"}</div>
              </div>
              <div>
                <div style={{fontSize:10,color:C.text4,textTransform:"uppercase",letterSpacing:.4,marginBottom:8,fontWeight:600}}>Details</div>
                {[{l:"N Facture",v:inv.id},{l:"Date",v:fD(inv.date)},{l:"Echeance",v:fD(inv.dueDate)},{l:"Conditions",v:inv.terms}].map(it=>(
                  <div key={it.l} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:12,color:C.text3}}>{it.l}</span>
                    <span style={{fontSize:12,fontWeight:600,color:C.text}}>{it.v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{border:"1px solid "+C.border,borderRadius:4,overflow:"hidden",marginBottom:20}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"#F9FAFB",borderBottom:"2px solid "+C.border}}>
                    {["Description","Qte","Prix unitaire","TVA","Montant"].map((h,i)=>(
                      <th key={i} style={{padding:"10px 14px",textAlign:i>=1?"right":"left",fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inv.lines.map((line,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid "+C.border2,background:i%2===1?"#FAFAFA":C.white}}>
                      <td style={{padding:"12px 14px",fontSize:13}}>{line.desc}</td>
                      <td style={{padding:"12px 14px",textAlign:"right",color:C.text3}}>{line.qty}</td>
                      <td style={{padding:"12px 14px",textAlign:"right"}}>{fN(line.rate)} {inv.currency}</td>
                      <td style={{padding:"12px 14px",textAlign:"right",color:line.taxable?C.text3:C.text4}}>{line.taxable?"19.25%":"—"}</td>
                      <td style={{padding:"12px 14px",textAlign:"right",fontWeight:700,color:C.blue}}>{fN(line.amount)} {inv.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end"}}>
              <div style={{width:300}}>
                {[
                  {l:"Sous-total HT",v:fN(inv.subtotal)+" "+inv.currency,c:C.text,big:false},
                  {l:"TVA 19.25%",v:inv.taxAmount>0?fN(inv.taxAmount)+" "+inv.currency:"Exonere",c:C.red,big:false},
                  {l:"TOTAL TTC",v:fN(inv.total)+" "+inv.currency,c:C.blue,big:true},
                  ...(inv.amountPaid>0?[
                    {l:"Acomptes recus",v:"- "+fN(inv.amountPaid)+" "+inv.currency,c:C.green,big:false},
                    {l:"SOLDE DU",v:fN(inv.balance)+" "+inv.currency,c:inv.balance>0?C.orange:C.green,big:true},
                  ]:[]),
                ].map((t,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:t.big?"none":"1px solid "+C.border2}}>
                    <span style={{fontSize:t.big?13:12,color:C.text3,fontWeight:t.big?700:400}}>{t.l}</span>
                    <span style={{fontSize:t.big?18:13,fontWeight:t.big?800:600,color:t.c}}>{t.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {inv.payments&&inv.payments.length>0&&(
          <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid "+C.border,fontSize:13,fontWeight:700,color:C.text}}>Paiements recus</div>
            {inv.payments.map((p,i)=>(
              <div key={i} style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600}}>{fD(p.date)}</div>
                  <div style={{fontSize:11,color:C.text4}}>{p.method} · {p.ref}</div>
                </div>
                <div style={{fontSize:16,fontWeight:700,color:C.green}}>{fN(p.amount)} {inv.currency}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ================================================================
//  FORMULAIRE NOUVEAU FOURNISSEUR
// ================================================================
const PageVendorNew = ({vendors,setVendors}) => {
  const navigate = useNavigate();
  const [company,  setCompany]  = useState("");
  const [contact,  setContact]  = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [city,     setCity]     = useState("");
  const [country,  setCountry]  = useState("Cameroun");
  const [type,     setType]     = useState("Equipementier");
  const [terms,    setTerms]    = useState("Net 30");
  const [currency, setCurrency] = useState("FCFA");
  const [accountNum,setAccountNum]=useState("");
  const [notes,    setNotes]    = useState("");

  const save = async () => {
    if(!company){alert("Nom obligatoire");return;}
    const dto = {company,contact,email,phone,city,country,type,terms,currency,accountNum,notes,status:"Active"};
    try {
      const res = await import("../services/cleanitbooks.api");
      const saved = await res.createVendor(dto);
      if(saved && saved.id) navigate("/cleanitbooks/vendors");
      else navigate("/cleanitbooks/vendors");
    } catch(e) {
      console.warn("API indisponible, sauvegarde locale");
      navigate("/cleanitbooks/vendors");
    }
  };

  return(
    <div style={{minHeight:"100vh",background:'#F4F5F7',fontFamily:"\"Segoe UI\",Arial,sans-serif"}}>
      <style>{`*{box-sizing:border-box}`}</style>
      <CIBTopBar title="Nouveau fournisseur" icon="vendor" color={C.orange}>
        <div style={{display:"flex",gap:8}}>
          <Btn label="Annuler" variant="light" sm onClick={()=>navigate("/cleanitbooks/vendors")}/>
          <Btn label="Creer le fournisseur" variant="primary" sm icon="check" onClick={save}/>
        </div>
      </CIBTopBar>
      <div style={{maxWidth:720,margin:"0 auto",padding:"32px 24px"}}>
        <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"28px"}}>
          <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:20}}>Informations fournisseur</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <Field label="Nom de l entreprise" required span>
              <Inp value={company} onChange={setCompany} placeholder="Ex: Nokia Networks"/>
            </Field>
            <Field label="Type">
              <Sel value={type} onChange={setType} options={VENDOR_TYPES}/>
            </Field>
            <Field label="Contact">
              <Inp value={contact} onChange={setContact} placeholder="Nom du contact"/>
            </Field>
            <Field label="Email">
              <Inp type="email" value={email} onChange={setEmail} placeholder="email@exemple.com"/>
            </Field>
            <Field label="Telephone">
              <Inp value={phone} onChange={setPhone} placeholder="+237 222 XXX XXX"/>
            </Field>
            <Field label="Ville">
              <Inp value={city} onChange={setCity} placeholder="Douala / Yaounde"/>
            </Field>
            <Field label="Pays">
              <Inp value={country} onChange={setCountry} placeholder="Cameroun"/>
            </Field>
            <Field label="N de compte">
              <Inp value={accountNum} onChange={setAccountNum} placeholder="NOK-CM-001"/>
            </Field>
            <Field label="Conditions de paiement">
              <Sel value={terms} onChange={setTerms} options={["Net 15","Net 30","Net 45","Net 60","Net 90"]}/>
            </Field>
            <Field label="Devise">
              <Sel value={currency} onChange={setCurrency} options={["FCFA","USD","EUR","CNY"]}/>
            </Field>
            <Field label="Notes" span>
              <Txt value={notes} onChange={setNotes} placeholder="Notes internes..." rows={3}/>
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================================================================
//  FORMULAIRE NOUVELLE FACTURE
// ================================================================
const PageInvoiceNew = ({invoices,setInvoices,customers,jobs}) => {
  const navigate = useNavigate();
  const [custId,   setCustId]   = useState("");
  const [jobId,    setJobId]    = useState("");
  const [date,     setDate]     = useState(TODAY);
  const [dueDate,  setDueDate]  = useState("");
  const [terms,    setTerms]    = useState("Net 30");
  const [poNum,    setPoNum]    = useState("");
  const [memo,     setMemo]     = useState("");
  const [currency, setCurrency] = useState("FCFA");
  const [lines,    setLines]    = useState([{desc:"",qty:1,rate:0,amount:0,taxable:true}]);
  const [bcProject,  setBcProject]  = useState("");
  const [bcSiteCode, setBcSiteCode] = useState("");
  const [bcDuid,     setBcDuid]     = useState("");

  const cust = customers.find(c=>c.id===custId);
  const custJobs = jobs.filter(j=>j.customerId===custId);

  const updLine = (i,k,v) => setLines(p=>p.map((l,idx)=>{
    if(idx!==i) return l;
    const nl={...l,[k]:k==="qty"||k==="rate"?+v:v};
    if(k==="qty"||k==="rate") nl.amount=nl.qty*nl.rate;
    return nl;
  }));

  const subtotal = lines.reduce((s,l)=>s+l.amount,0);
  const taxAmt   = cust&&cust.taxCode==="TVA"?lines.filter(l=>l.taxable).reduce((s,l)=>s+l.amount*0.1925,0):0;
  const total    = subtotal+taxAmt;

  const save = async () => {
    if(!custId){alert("Client obligatoire");return;}
    const dto = {
      customerId:custId,jobId,date,dueDate,terms,poNumber:poNum,memo,currency,lines,
      bcProject,bcSiteCode,bcDuid,
      subtotal,taxRate:0.1925,taxAmount:Math.round(taxAmt),total:Math.round(total),
      amountPaid:0,balance:Math.round(total),status:"Draft",payments:[],
    };
    try {
      const api = await import("../services/cleanitbooks.api");
      const saved = await api.createInvoice(dto);
      navigate("/cleanitbooks/invoices");
    } catch(e) {
      console.warn("API indisponible");
      navigate("/cleanitbooks/invoices");
    }
  };

  return(
    <div style={{minHeight:"100vh",background:'#F4F5F7',fontFamily:"\"Segoe UI\",Arial,sans-serif"}}>
      <style>{`*{box-sizing:border-box}`}</style>
      <CIBTopBar title="Nouvelle facture" icon="invoice" color={C.green}>
        <div style={{display:"flex",gap:8}}>
          <Btn label="Annuler" variant="light" sm onClick={()=>navigate("/cleanitbooks/invoices")}/>
          <Btn label="Enregistrer brouillon" variant="default" sm onClick={save}/>
          <Btn label="Enregistrer et envoyer" variant="primary" sm icon="mail" onClick={save}/>
        </div>
      </CIBTopBar>
      <div style={{maxWidth:1440,margin:"0 auto",padding:"24px 24px",display:"grid",gridTemplateColumns:"1fr 460px",gap:20,alignItems:"start"}}>
        <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"28px",marginBottom:16}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:16,marginBottom:20}}>
            <Field label="Client" required>
              <Sel value={custId} onChange={v=>{setCustId(v);setCurrency((customers.find(c=>c.id===v)||{currency:"FCFA"}).currency);}} placeholder="Selectionner un client" options={customers.map(c=>({v:c.id,l:c.company||c.name}))}/>
            </Field>
            <Field label="Date"><Inp type="date" value={date} onChange={setDate}/></Field>
            <Field label="Conditions"><Sel value={terms} onChange={setTerms} options={["Net 15","Net 30","Net 45","Net 60","Net 90"]}/></Field>
            {custId&&custJobs.length>0&&(
              <Field label="Job lie">
                <Sel value={jobId} onChange={setJobId} placeholder="Aucun job" options={custJobs.map(j=>({v:j.id,l:j.name}))}/>
              </Field>
            )}
            <Field label="Date echeance"><Inp type="date" value={dueDate} onChange={setDueDate}/></Field>
            <Field label="N° PO client (MTN/Orange)"><Inp value={poNum} onChange={setPoNum} placeholder="ex: 416121376123-2"/></Field>
            <Field label="Project Code BC"><Inp value={bcProject||""} onChange={v=>setBcProject&&setBcProject(v)} placeholder="ex: 56A0KY1 — DWDM"/></Field>
            <Field label="Site Code MTN"><Inp value={bcSiteCode||""} onChange={v=>setBcSiteCode&&setBcSiteCode(v)} placeholder="ex: GN-CEN-BOUMNYEBEL_eLTE"/></Field>
            <Field label="DUID équipement"><Inp value={bcDuid||""} onChange={v=>setBcDuid&&setBcDuid(v)} placeholder="ex: ON-OSN9800-SWAP-T46-031-MTNC"/></Field>
            <Field label="Devise"><Sel value={currency} onChange={setCurrency} options={["FCFA","USD","EUR"]}/></Field>
          </div>
          <div style={{border:"1px solid "+C.border,borderRadius:4,overflow:"hidden",marginBottom:16}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:'#F4F5F7',borderBottom:"2px solid "+C.border}}>
                  {["Description","Qte","Prix unitaire","TVA","Montant",""].map((h,i)=>(
                    <th key={i} style={{padding:"9px 12px",textAlign:i>=1&&i<=4?"right":"left",fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lines.map((l,i)=>(
                  <tr key={i} style={{borderBottom:"1px solid "+C.border2}}>
                    <td style={{padding:"6px 8px"}}><Inp value={l.desc} onChange={v=>updLine(i,"desc",v)} placeholder="Description" small/></td>
                    <td style={{padding:"6px 8px",width:70}}><Inp type="number" value={l.qty} onChange={v=>updLine(i,"qty",v)} small/></td>
                    <td style={{padding:"6px 8px",width:140}}><Inp type="number" value={l.rate} onChange={v=>updLine(i,"rate",v)} small/></td>
                    <td style={{padding:"6px 10px",textAlign:"center",width:60}}>
                      <input type="checkbox" checked={l.taxable} onChange={e=>updLine(i,"taxable",e.target.checked)} style={{width:15,height:15,accentColor:C.green}}/>
                    </td>
                    <td style={{padding:"6px 12px",textAlign:"right",fontWeight:600,color:C.blue,width:130}}>{fN(l.amount)} {currency}</td>
                    <td style={{padding:"6px 8px",width:30}}>
                      {lines.length>1&&<button onClick={()=>setLines(p=>p.filter((_,xi)=>xi!==i))} style={{width:22,height:22,borderRadius:3,border:"1px solid "+C.border,background:C.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="close" s={11} c={C.text3}/></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{padding:"8px 10px",borderTop:"1px solid "+C.border2,background:'#F4F5F7'}}>
              <Btn label="+ Ajouter une ligne" variant="light" sm onClick={()=>setLines(p=>[...p,{desc:"",qty:1,rate:0,amount:0,taxable:true}])}/>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:16}}>
            <Field label="Memo"><Txt value={memo} onChange={setMemo} placeholder="Message ou note pour la facture..."/></Field>
            <div style={{background:'#F4F5F7',borderRadius:4,border:"1px solid "+C.border,padding:"14px 16px"}}>
              {[{l:"Sous-total HT",v:fN(subtotal)+" "+currency,c:C.text,big:false},{l:"TVA 19.25%",v:taxAmt>0?fN(Math.round(taxAmt))+" "+currency:"Exonere",c:C.red,big:false},{l:"TOTAL TTC",v:fN(Math.round(total))+" "+currency,c:C.blue,big:true}].map((t,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:t.big?"none":"1px solid "+C.border2}}>
                  <span style={{fontSize:t.big?13:12,color:C.text3,fontWeight:t.big?600:400}}>{t.l}</span>
                  <span style={{fontSize:t.big?20:13,fontWeight:t.big?800:600,color:t.c}}>{t.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* APERÇU LIVE — document facture, style QuickBooks */}
        <div style={{position:"sticky",top:20,background:C.white,border:"1px solid "+C.border,borderRadius:8,
          boxShadow:"0 2px 12px rgba(0,0,0,0.08)",overflow:"hidden",fontFamily:"'Times New Roman',serif"}}>
          <div style={{padding:"8px 16px",background:'#F4F5F7',borderBottom:"1px solid "+C.border,fontFamily:"'Segoe UI',Arial,sans-serif"}}>
            <span style={{fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.5}}>Aperçu de la facture</span>
          </div>
          <div style={{padding:"32px 28px",minHeight:560}}>
            {/* En-tête entreprise */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
              <div>
                <div style={{width:48,height:48,borderRadius:8,background:C.navy,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:8}}>
                  <span style={{color:"#fff",fontWeight:800,fontSize:13,fontFamily:"'Segoe UI',Arial,sans-serif"}}>CIT</span>
                </div>
                <div style={{fontSize:15,fontWeight:700,color:"#1a1a1a"}}>CleanIT SARL</div>
                <div style={{fontSize:11,color:"#666",lineHeight:1.5}}>
                  Douala, Cameroun<br/>Sous-traitant Huawei certifié<br/>contact@cleanit.cm
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:22,fontWeight:800,color:C.navy,letterSpacing:1}}>FACTURE</div>
                <div style={{fontSize:11,color:"#666",marginTop:4}}>N° {Date.now().toString().slice(-8)}</div>
              </div>
            </div>

            {/* Client + dates */}
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:24,paddingBottom:16,borderBottom:"1px solid #e5e5e5"}}>
              <div>
                <div style={{fontSize:9,color:"#999",textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>Facturé à</div>
                <div style={{fontSize:13,fontWeight:700,color:"#1a1a1a"}}>{cust?.company||cust?.name||"— Sélectionner un client —"}</div>
                {poNum && <div style={{fontSize:11,color:"#666",marginTop:2}}>PO: {poNum}</div>}
                {bcSiteCode && <div style={{fontSize:11,color:"#666"}}>Site: {bcSiteCode}</div>}
              </div>
              <div style={{textAlign:"right",fontSize:11,color:"#666"}}>
                <div>Date: <strong style={{color:"#1a1a1a"}}>{date?new Date(date).toLocaleDateString('fr-FR'):"—"}</strong></div>
                <div>Échéance: <strong style={{color:"#1a1a1a"}}>{dueDate?new Date(dueDate).toLocaleDateString('fr-FR'):"—"}</strong></div>
                <div>Conditions: <strong style={{color:"#1a1a1a"}}>{terms}</strong></div>
              </div>
            </div>

            {/* Table lignes */}
            <table style={{width:"100%",borderCollapse:"collapse",marginBottom:20}}>
              <thead>
                <tr style={{borderBottom:"2px solid #1a1a1a"}}>
                  <th style={{textAlign:"left",padding:"6px 4px",fontSize:9,color:"#666",textTransform:"uppercase"}}>Description</th>
                  <th style={{textAlign:"right",padding:"6px 4px",fontSize:9,color:"#666",textTransform:"uppercase"}}>Qté</th>
                  <th style={{textAlign:"right",padding:"6px 4px",fontSize:9,color:"#666",textTransform:"uppercase"}}>Prix unit.</th>
                  <th style={{textAlign:"right",padding:"6px 4px",fontSize:9,color:"#666",textTransform:"uppercase"}}>Montant</th>
                </tr>
              </thead>
              <tbody>
                {lines.filter(l=>l.desc||l.amount>0).length===0 ? (
                  <tr><td colSpan={4} style={{padding:"16px 4px",textAlign:"center",color:"#bbb",fontSize:11}}>Aucune ligne ajoutée</td></tr>
                ) : lines.map((l,i)=>(l.desc||l.amount>0) && (
                  <tr key={i} style={{borderBottom:"1px solid #f0f0f0"}}>
                    <td style={{padding:"7px 4px",fontSize:11,color:"#1a1a1a"}}>{l.desc||"—"}</td>
                    <td style={{padding:"7px 4px",fontSize:11,textAlign:"right",color:"#666"}}>{l.qty}</td>
                    <td style={{padding:"7px 4px",fontSize:11,textAlign:"right",color:"#666"}}>{fN(l.rate)}</td>
                    <td style={{padding:"7px 4px",fontSize:11,textAlign:"right",fontWeight:600,color:"#1a1a1a"}}>{fN(l.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totaux */}
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:24}}>
              <div style={{width:220}}>
                <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:11,color:"#666"}}>
                  <span>Sous-total HT</span><span>{fN(subtotal)} {currency}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:11,color:"#666"}}>
                  <span>TVA 19.25%</span><span>{taxAmt>0?fN(Math.round(taxAmt))+" "+currency:"Exonéré"}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",marginTop:6,borderTop:"2px solid #1a1a1a"}}>
                  <span style={{fontSize:13,fontWeight:700,color:"#1a1a1a"}}>TOTAL TTC</span>
                  <span style={{fontSize:16,fontWeight:800,color:C.navy}}>{fN(Math.round(total))} {currency}</span>
                </div>
              </div>
            </div>

            {memo && (
              <div style={{paddingTop:16,borderTop:"1px solid #e5e5e5",fontSize:11,color:"#666",fontStyle:"italic"}}>
                {memo}
              </div>
            )}

            <div style={{marginTop:32,paddingTop:16,borderTop:"1px solid #f0f0f0",fontSize:9,color:"#bbb",textAlign:"center"}}>
              CleanIT SARL — Document généré par CleanIT ERP
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================================================================
//  DEPENSES AP — Bills fournisseurs
// ================================================================
const INIT_BILLS_AP = []; // Données depuis CleanITBooks API

const STATUS_BILL = {
  "Paid":    {c:C.green,  bg:C.green_l,  l:"Paye"},
  "Partial": {c:C.orange, bg:C.orange_l, l:"Partiel"},
  "Unpaid":  {c:C.red,    bg:C.red_l,    l:"Non paye"},
  "Draft":   {c:C.text3,  bg:C.border2,  l:"Brouillon"},
};

const PageBillList = ({bills,vendors,jobs}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState("Tous");

  const filtered = bills.filter(b=>{
    const v=vendors.find(x=>x.id===b.vendorId);
    const ms=!search||(b.id+(v?v.company:"")).toLowerCase().includes(search.toLowerCase());
    return ms&&(filtre==="Tous"||b.status===filtre);
  });

  const totalAP     = filtered.reduce((s,b)=>s+b.total,0);
  const totalPaid   = filtered.reduce((s,b)=>s+b.amountPaid,0);
  const totalBalance= filtered.reduce((s,b)=>s+b.balance,0);
  const overdue     = filtered.filter(b=>b.balance>0&&b.dueDate&&new Date(b.dueDate)<new Date());

  return(
    <div style={{minHeight:"100vh",background:'#F4F5F7',fontFamily:"\"Segoe UI\",Arial,sans-serif"}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}*{box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px}`}</style>
      <CIBTopBar title="Depenses AP — Bills fournisseurs" icon="bill" color={C.orange}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,background:'#F4F5F7',border:"1px solid "+C.border,borderRadius:4,padding:"6px 12px"}}>
            <Ico n="search" s={13} c={C.text4}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher bill..."
              style={{border:"none",outline:"none",fontSize:12,color:C.text,background:"transparent",width:150,fontFamily:"inherit"}}/>
          </div>
          <Btn label="Exporter" variant="light" sm icon="download" onClick={async ()=>{
            const ExcelJS=(await import("exceljs")).default;
            const wb=new ExcelJS.Workbook();
            const ws=wb.addWorksheet("Bills AP");
            ws.columns=[{key:"id",width:16,header:"N Bill"},{key:"vendor",width:24,header:"Fournisseur"},{key:"date",width:13,header:"Date"},{key:"echeance",width:13,header:"Echeance"},{key:"total",width:18,header:"Total"},{key:"paye",width:16,header:"Paye"},{key:"solde",width:16,header:"Solde"},{key:"statut",width:14,header:"Statut"}];
            ws.getRow(1).eachCell(cell=>{cell.font={name:"Calibri",bold:true,color:{argb:"FFFFFFFF"},size:10};cell.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FFE27000"}};cell.alignment={horizontal:"center",vertical:"middle"};});
            filtered.forEach((b,i)=>{
              const v=vendors.find(x=>x.id===b.vendorId);
              const row=ws.addRow({id:b.id,vendor:v?v.company:"",date:b.date,echeance:b.dueDate,total:b.total,paye:b.amountPaid,solde:b.balance,statut:b.status});
              if(i%2===1) row.eachCell(cell=>cell.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FFFEF3E2"}});
            });
            const buf=await wb.xlsx.writeBuffer();
            const a=document.createElement("a");
            a.href=URL.createObjectURL(new Blob([buf],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}));
            a.download="Bills_AP_"+new Date().toISOString().split("T")[0]+".xlsx";a.click();
          }}/>
          <Btn label="Saisir un bill" variant="primary" sm icon="plus" onClick={()=>navigate('/cleanitbooks/bills/new')}/>
        </div>
      </CIBTopBar>

      <div style={{padding:"24px",animation:"fadeUp .3s ease"}}>
        {overdue.length>0&&(
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 18px",background:"#FEF3C7",border:"1px solid "+C.orange+"40",borderRadius:6,marginBottom:18}}>
            <Ico n="alert" s={16} c={C.orange}/>
            <span style={{fontSize:13,color:C.text2,flex:1}}><strong style={{color:C.orange}}>Alerte AP : </strong>{overdue.length} bill(s) en retard — {fM(overdue.reduce((s,b)=>s+b.balance,0))} F</span>
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          {[
            {l:"Total AP",       v:fM(totalAP)+" F",      c:C.orange, icon:"bill"},
            {l:"Paye",           v:fM(totalPaid)+" F",    c:C.green,  icon:"check"},
            {l:"Solde du",       v:fM(totalBalance)+" F", c:C.red,    icon:"alert"},
            {l:"Bills en retard",v:overdue.length,         c:C.red,    icon:"calendar"},
          ].map((kpi,i)=>(
            <div key={i} style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"14px 16px",borderTop:"3px solid "+kpi.c}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:10,color:C.text3,textTransform:"uppercase",letterSpacing:.4,fontWeight:600}}>{kpi.l}</span>
                <div style={{width:28,height:28,borderRadius:4,background:kpi.c+"15",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n={kpi.icon} s={14} c={kpi.c}/></div>
              </div>
              <div style={{fontSize:20,fontWeight:700,color:kpi.c}}>{kpi.v}</div>
            </div>
          ))}
        </div>

        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {["Tous","Unpaid","Partial","Paid"].map(f=>(
            <button key={f} onClick={()=>setFiltre(f)}
              style={{padding:"7px 14px",border:"1px solid "+(filtre===f?C.orange:C.border),borderRadius:4,background:filtre===f?C.orange:C.white,color:filtre===f?"white":C.text3,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
              {f==="Tous"?"Tous":f==="Unpaid"?"Non payes":f==="Partial"?"Partiels":"Payes"}
            </button>
          ))}
        </div>

        <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:"#F9FAFB",borderBottom:"2px solid "+C.border}}>
                {["N Bill","Fournisseur","Job","Date","Echeance","Total","Paye","Solde","Statut","Actions"].map((h,i)=>(
                  <th key={i} style={{padding:"10px 14px",textAlign:i>=5&&i<=7?"right":"left",fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.4}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={10} style={{padding:"48px",textAlign:"center",color:C.text4}}>Aucun bill</td></tr>}
              {filtered.map((b,i)=>{
                const v=vendors.find(x=>x.id===b.vendorId);
                const j=jobs.find(x=>x.id===b.jobId);
                const sc=STATUS_BILL[b.status]||{c:C.text3,bg:C.border2,l:b.status};
                const isOverdue=b.balance>0&&b.dueDate&&new Date(b.dueDate)<new Date();
                return(
                  <tr key={b.id} style={{borderBottom:"1px solid "+C.border2,cursor:"pointer",background:i%2===1?"#FAFAFA":C.white}}
                    onMouseEnter={e=>e.currentTarget.style.background="#FFF7ED"}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===1?"#FAFAFA":C.white}
                    onClick={()=>navigate("/cleanitbooks/bills/"+b.id)}>
                    <td style={{padding:"12px 14px",fontWeight:700,color:C.orange}}>{b.id}</td>
                    <td style={{padding:"12px 14px",fontSize:13}}>{v?v.company:"—"}</td>
                    <td style={{padding:"12px 14px"}}>{j?<span style={{fontSize:11,color:C.text3}}>{j.name}</span>:"—"}</td>
                    <td style={{padding:"12px 14px",color:C.text3,fontSize:12}}>{fD2(b.date)}</td>
                    <td style={{padding:"12px 14px",color:isOverdue?C.red:C.text3,fontSize:12,fontWeight:isOverdue?700:400}}>{fD2(b.dueDate)}</td>
                    <td style={{padding:"12px 14px",textAlign:"right",fontWeight:700}}>{fN(b.total)} {b.currency}</td>
                    <td style={{padding:"12px 14px",textAlign:"right",color:C.green,fontWeight:600}}>{b.amountPaid>0?fN(b.amountPaid)+" "+b.currency:"—"}</td>
                    <td style={{padding:"12px 14px",textAlign:"right",fontWeight:700,color:b.balance>0?C.red:C.green}}>{b.balance>0?fN(b.balance)+" "+b.currency:"—"}</td>
                    <td style={{padding:"12px 14px"}}><span style={{fontSize:11,padding:"3px 9px",borderRadius:10,background:sc.bg,color:sc.c,fontWeight:600}}>{sc.l}</span></td>
                    <td style={{padding:"12px 14px"}} onClick={e=>e.stopPropagation()}>
                      <div style={{display:"flex",gap:4}}>
                        <Btn label="Voir" variant="light" sm onClick={()=>navigate("/cleanitbooks/bills/"+b.id)}/>
                        {b.balance>0&&<Btn label="Payer" variant="primary" sm/>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{background:"#F9FAFB",borderTop:"2px solid "+C.border}}>
                <td colSpan={5} style={{padding:"10px 14px",fontWeight:700,color:C.text}}>TOTAL — {filtered.length} bill(s)</td>
                <td style={{padding:"10px 14px",textAlign:"right",fontWeight:800,color:C.orange,fontSize:14}}>{fN(totalAP)} F</td>
                <td style={{padding:"10px 14px",textAlign:"right",fontWeight:800,color:C.green}}>{fN(totalPaid)} F</td>
                <td style={{padding:"10px 14px",textAlign:"right",fontWeight:800,color:totalBalance>0?C.red:C.green}}>{fN(totalBalance)} F</td>
                <td colSpan={2}/>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

const PageBillDetail = ({bills,vendors,jobs}) => {
  const navigate = useNavigate();
  const {billId} = useParams();
  const bill = bills.find(b=>b.id===billId);
  const vendor = bill?vendors.find(v=>v.id===bill.vendorId):null;
  const job    = bill?jobs.find(j=>j.id===bill.jobId):null;

  if(!bill) return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,background:'#F4F5F7'}}>
      <div style={{fontSize:18,color:C.text4}}>Bill introuvable</div>
      <Btn label="Retour" variant="primary" onClick={()=>navigate("/cleanitbooks/bills")}/>
    </div>
  );

  const sc = STATUS_BILL[bill.status]||{c:C.text3,bg:C.border2,l:bill.status};

  return(
    <div style={{minHeight:"100vh",background:'#F4F5F7',fontFamily:"\"Segoe UI\",Arial,sans-serif"}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}*{box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px}`}</style>
      <CIBTopBar title={"Bill "+bill.id} icon="bill" color={C.orange}>
        <div style={{display:"flex",gap:8}}>
          <Btn label="Retour" variant="light" sm onClick={()=>navigate("/cleanitbooks/bills")}/>
          {bill.balance>0&&<Btn label="Payer ce bill" variant="primary" sm icon="money" onClick={()=>setShowPay(true)}/>}
        </div>
      </CIBTopBar>
      <div style={{padding:"24px",maxWidth:860,margin:"0 auto",animation:"fadeUp .3s ease"}}>
        <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden",marginBottom:16}}>
          <div style={{padding:"16px 24px",background:sc.bg,borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:11,color:sc.c,fontWeight:700,textTransform:"uppercase",marginBottom:4}}>Bill Fournisseur</div>
              <div style={{fontSize:28,fontWeight:800,color:sc.c}}>{fN(bill.total)} {bill.currency}</div>
            </div>
            <span style={{fontSize:13,padding:"5px 14px",borderRadius:20,background:sc.c,color:"white",fontWeight:700}}>{sc.l}</span>
          </div>
          <div style={{padding:"20px 24px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20,marginBottom:20}}>
              <div>
                <div style={{fontSize:10,color:C.text4,textTransform:"uppercase",letterSpacing:.4,marginBottom:8,fontWeight:600}}>Fournisseur</div>
                <div style={{fontSize:14,fontWeight:700,color:C.text}}>{vendor?vendor.company:"—"}</div>
                <div style={{fontSize:12,color:C.text3}}>{vendor?vendor.contact:"—"}</div>
                <div style={{fontSize:12,color:C.text3}}>{vendor?vendor.city:"—"}</div>
              </div>
              <div>
                <div style={{fontSize:10,color:C.text4,textTransform:"uppercase",letterSpacing:.4,marginBottom:8,fontWeight:600}}>Details</div>
                {[{l:"N Bill",v:bill.id},{l:"Ref fournisseur",v:bill.refNum||"—"},{l:"Date",v:fD(bill.date)},{l:"Echeance",v:fD(bill.dueDate)}].map(it=>(
                  <div key={it.l} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:12,color:C.text3}}>{it.l}</span>
                    <span style={{fontSize:12,fontWeight:600,color:C.text}}>{it.v}</span>
                  </div>
                ))}
              </div>
              {job&&(
                <div>
                  <div style={{fontSize:10,color:C.text4,textTransform:"uppercase",letterSpacing:.4,marginBottom:8,fontWeight:600}}>Job lie</div>
                  <div style={{padding:"10px 12px",background:'#F4F5F7',borderRadius:4,border:"1px solid "+C.border2,cursor:"pointer"}}
                    onClick={()=>navigate("/cleanitbooks/jobs/"+job.id)}>
                    <div style={{fontSize:12,fontWeight:700,color:C.blue}}>{job.name}</div>
                    <div style={{fontSize:11,color:C.text4}}>{job.id}</div>
                  </div>
                </div>
              )}
            </div>
            <div style={{border:"1px solid "+C.border,borderRadius:4,overflow:"hidden",marginBottom:20}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"#F9FAFB",borderBottom:"2px solid "+C.border}}>
                    {["Compte","Description","Montant"].map((h,i)=>(
                      <th key={i} style={{padding:"10px 14px",textAlign:i===2?"right":"left",fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bill.lines.map((line,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid "+C.border2}}>
                      <td style={{padding:"12px 14px",fontFamily:"monospace",fontSize:12,color:C.blue}}>{line.account}</td>
                      <td style={{padding:"12px 14px",fontSize:13}}>{line.desc}</td>
                      <td style={{padding:"12px 14px",textAlign:"right",fontWeight:700,color:C.orange}}>{fN(line.amount)} {bill.currency}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{background:"#F9FAFB",borderTop:"2px solid "+C.border}}>
                    <td colSpan={2} style={{padding:"10px 14px",fontWeight:700}}>TOTAL</td>
                    <td style={{padding:"10px 14px",textAlign:"right",fontWeight:800,color:C.orange,fontSize:16}}>{fN(bill.total)} {bill.currency}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {bill.amountPaid>0&&(
              <div style={{display:"flex",justifyContent:"flex-end"}}>
                <div style={{width:280,background:'#F4F5F7',borderRadius:4,border:"1px solid "+C.border,padding:"12px 16px"}}>
                  {[{l:"Total du",v:fN(bill.total)+" "+bill.currency,c:C.orange,big:false},{l:"Paye",v:"-"+fN(bill.amountPaid)+" "+bill.currency,c:C.green,big:false},{l:"SOLDE",v:fN(bill.balance)+" "+bill.currency,c:bill.balance>0?C.red:C.green,big:true}].map((t,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:t.big?"none":"1px solid "+C.border2}}>
                      <span style={{fontSize:t.big?13:12,color:C.text3,fontWeight:t.big?700:400}}>{t.l}</span>
                      <span style={{fontSize:t.big?18:13,fontWeight:t.big?800:600,color:t.c}}>{t.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {bill.memo&&<div style={{marginTop:16,padding:"10px 14px",background:'#F4F5F7',borderRadius:4,border:"1px solid "+C.border2,fontSize:12,color:C.text3}}><strong style={{color:C.text}}>Memo : </strong>{bill.memo}</div>}
          </div>
        </div>
        {bill.payments&&bill.payments.length>0&&(
          <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,overflow:"hidden"}}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid "+C.border,fontSize:13,fontWeight:700,color:C.text}}>Paiements effectues</div>
            {bill.payments.map((p,i)=>(
              <div key={i} style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:13,fontWeight:600}}>{fD(p.date)}</div><div style={{fontSize:11,color:C.text4}}>{p.method} · {p.ref}</div></div>
                <div style={{fontSize:16,fontWeight:700,color:C.green}}>{fN(p.amount)} {bill.currency}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PageBillNew = ({vendors,jobs}) => {
  const navigate = useNavigate();
  const [vendorId, setVendorId] = useState("");
  const [date,     setDate]     = useState(TODAY);
  const [dueDate,  setDueDate]  = useState("");
  const [refNum,   setRefNum]   = useState("");
  const [memo,     setMemo]     = useState("");
  const [jobId,    setJobId]    = useState("");
  const [lines,    setLines]    = useState([{account:"604",desc:"",amount:0}]);

  const total = lines.reduce((s,l)=>s+(+l.amount||0),0);

  const save = async () => {
    if(!vendorId){alert("Fournisseur obligatoire");return;}
    const total = lines.reduce((s,l)=>s+(+l.amount||0),0);
    const dto = {vendorId,date,dueDate,refNum,memo,jobId,lines,total,amountPaid:0,balance:total,status:"Unpaid",payments:[]};
    try {
      const api = await import("../services/cleanitbooks.api");
      await api.createBill(dto);
    } catch(e) { console.warn("API indisponible"); }
    navigate("/cleanitbooks/bills");
  };

  const ACCTS = ["604 — Achats matieres","624 — Transport","626 — Telecommunications","641 — Salaires","625 — Per diem terrain","628 — Autres charges"];

  return(
    <div style={{minHeight:"100vh",background:'#F4F5F7',fontFamily:"\"Segoe UI\",Arial,sans-serif"}}>
      <style>{`*{box-sizing:border-box}`}</style>
      <CIBTopBar title="Saisir un bill fournisseur" icon="bill" color={C.orange}>
        <div style={{display:"flex",gap:8}}>
          <Btn label="Annuler" variant="light" sm onClick={()=>navigate("/cleanitbooks/bills")}/>
          <Btn label="Enregistrer le bill" variant="primary" sm icon="check" onClick={save}/>
        </div>
      </CIBTopBar>
      <div style={{maxWidth:800,margin:"0 auto",padding:"32px 24px"}}>
        <div style={{background:C.white,border:"1px solid "+C.border,borderRadius:6,padding:"28px"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:16,marginBottom:20}}>
            <Field label="Fournisseur" required>
              <Sel value={vendorId} onChange={setVendorId} placeholder="Selectionner..." options={vendors.map(v=>({v:v.id,l:v.company}))}/>
            </Field>
            <Field label="Date"><Inp type="date" value={date} onChange={setDate}/></Field>
            <Field label="Date echeance"><Inp type="date" value={dueDate} onChange={setDueDate}/></Field>
            <Field label="Ref facture fournisseur"><Inp value={refNum} onChange={setRefNum} placeholder="N facture fournisseur"/></Field>
            <Field label="Job lie">
              <Sel value={jobId} onChange={setJobId} placeholder="Aucun job" options={jobs.map(j=>({v:j.id,l:j.name}))}/>
            </Field>
            <Field label="Memo" span><Inp value={memo} onChange={setMemo} placeholder="Description de la depense"/></Field>
          </div>
          <div style={{border:"1px solid "+C.border,borderRadius:4,overflow:"hidden",marginBottom:16}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:'#F4F5F7',borderBottom:"2px solid "+C.border}}>
                  {["Compte","Description","Montant (FCFA)",""].map((h,i)=>(
                    <th key={i} style={{padding:"9px 12px",textAlign:i===2?"right":"left",fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lines.map((l,i)=>(
                  <tr key={i} style={{borderBottom:"1px solid "+C.border2}}>
                    <td style={{padding:"6px 8px",width:200}}>
                      <Sel value={l.account} onChange={v=>setLines(p=>p.map((x,xi)=>xi===i?{...x,account:v}:x))} options={ACCTS} small/>
                    </td>
                    <td style={{padding:"6px 8px"}}>
                      <Inp value={l.desc} onChange={v=>setLines(p=>p.map((x,xi)=>xi===i?{...x,desc:v}:x))} placeholder="Description" small/>
                    </td>
                    <td style={{padding:"6px 8px",width:140}}>
                      <Inp type="number" value={l.amount} onChange={v=>setLines(p=>p.map((x,xi)=>xi===i?{...x,amount:+v}:x))} small/>
                    </td>
                    <td style={{padding:"6px 8px",width:30}}>
                      {lines.length>1&&<button onClick={()=>setLines(p=>p.filter((_,xi)=>xi!==i))} style={{width:22,height:22,borderRadius:3,border:"1px solid "+C.border,background:C.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ico n="close" s={11} c={C.text3}/></button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{padding:"8px 10px",borderTop:"1px solid "+C.border2,background:'#F4F5F7',display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <Btn label="+ Ajouter une ligne" variant="light" sm onClick={()=>setLines(p=>[...p,{account:"604",desc:"",amount:0}])}/>
              <div style={{fontSize:15,fontWeight:700,color:C.orange}}>Total: {fN(total)} FCFA</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================================================================
//  BANKING — Tresorerie et rapprochement
// ================================================================
const INIT_BANKS = []; // Données depuis CleanITBooks API

const INIT_TRANSACTIONS = []; // Données depuis CleanITBooks API

const PageBanking = () => {
  const [banks, setBanks] = useState([
    {id:'BICEC',name:'BICEC Compte principal',num:'****4521',balance:0,type:'Compte courant',color:'#0077C5'},
    {id:'SGC',name:'SGC Compte secondaire',num:'****8834',balance:0,type:'Compte courant',color:'#2CA01C'},
    {id:'CAISSE',name:'Caisse DLA-001',num:'Espèces',balance:0,type:'Caisse',color:'#E27000'},
  ]);
  const [transactions, setTransactions] = useState([]);
  const [selBank, setSelBank] = useState('BICEC');
  const [mode, setMode] = useState('feed');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('https://backend-cleanit-erp.vercel.app/journal',
      {headers:{'Authorization':'Bearer '+token}})
      .then(r=>r.json())
      .then(data => {
        if(Array.isArray(data)) {
          setTransactions(data.map(t=>({
            id:t.id, date:t.date, desc:t.description||t.label,
            ref:t.reference||'', debit:t.debit||0, credit:t.credit||0,
            status:t.reconciled?'matched':'unmatched', bankId:'BICEC',
            category:t.account||'—'
          })));
          const total = data.reduce((s,t)=>(s+(t.credit||0)-(t.debit||0)),0);
          setBanks(p=>p.map((b,i)=>i===0?{...b,balance:total}:b));
        }
        setLoading(false);
      }).catch(()=>setLoading(false));
  }, []);

  const totalBanks = banks.reduce((s,b)=>s+b.balance,0);
  const fmtF = n => new Intl.NumberFormat('fr-FR').format(Math.round(Math.abs(n||0)));
  const txns = transactions.filter(t=>t.bankId===selBank&&
    (!search||(t.desc+t.ref).toLowerCase().includes(search.toLowerCase())));
  const moneyIn = txns.reduce((s,t)=>s+(t.credit||0),0);
  const moneyOut = txns.reduce((s,t)=>s+(t.debit||0),0);

  // Évolution du solde dans le temps (cumul réel, pas inventé)
  const balanceHistory = useMemo(()=>{
    const sorted = [...txns].sort((a,b)=>new Date(a.date)-new Date(b.date));
    let cum = 0;
    const byDay = {};
    sorted.forEach(t=>{
      cum += (t.credit||0)-(t.debit||0);
      const day = (t.date||'').slice(0,10);
      if(day) byDay[day] = cum;
    });
    return Object.entries(byDay).map(([date,solde])=>({
      date: new Date(date).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'}),
      solde,
    })).slice(-30);
  },[txns]);

  return(
    <div style={{minHeight:'100vh',background:'#F4F5F7',fontFamily:"'Avenir Next','Helvetica Neue',Arial,sans-serif"}}>
      <CIBTopBar title="Banking et Trésorerie" icon="bank" color={C.blue}>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button onClick={()=>alert("La synchronisation bancaire automatique nécessite une intégration avec votre banque (API Open Banking). Cette fonctionnalité n'est pas encore configurée — contactez votre administrateur système.")} style={{background:C.blue,color:'#fff',border:'none',borderRadius:4,padding:'7px 16px',fontSize:13,fontWeight:600,cursor:'pointer'}}>Synchroniser</button>
          <button onClick={()=>alert("Le rapprochement bancaire automatique sera disponible une fois la synchronisation bancaire configurée.")} style={{background:C.green,color:'#fff',border:'none',borderRadius:4,padding:'7px 16px',fontSize:13,fontWeight:600,cursor:'pointer'}}>Rapprocher</button>
        </div>
      </CIBTopBar>

      <div style={{padding:'24px'}}>
        {/* COMPTES BANCAIRES QB STYLE */}
        <div style={{display:'flex',gap:16,marginBottom:24,overflowX:'auto',paddingBottom:4}}>
          {banks.map(b=>(
            <div key={b.id} onClick={()=>setSelBank(b.id)} style={{
              background:'#fff',borderRadius:8,padding:'16px 20px',
              border:`2px solid ${selBank===b.id?b.color:C.border}`,
              cursor:'pointer',minWidth:220,flex:'0 0 auto',
              boxShadow:selBank===b.id?`0 0 0 1px ${b.color}20`:'0 1px 3px rgba(0,0,0,0.08)',
              transition:'all 0.15s'
            }}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <span style={{fontSize:13,fontWeight:700,color:C.text}}>{b.name}</span>
                <span style={{fontSize:11,color:C.text3,background:C.gray_l,padding:'2px 8px',borderRadius:10}}>{b.type}</span>
              </div>
              <div style={{fontSize:11,color:C.text3,marginBottom:6}}>{b.num}</div>
              <div style={{fontSize:22,fontWeight:700,color:b.balance>=0?C.green:C.red}}>
                {b.balance>=0?'+':'-'}{fmtF(b.balance)} FCFA
              </div>
              <div style={{fontSize:11,color:C.text3,marginTop:4}}>Sync: aujourd hui</div>
            </div>
          ))}
          {/* Ajouter compte */}
          <div style={{background:'#fff',borderRadius:8,padding:'16px 20px',border:`2px dashed ${C.border}`,cursor:'pointer',minWidth:180,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8}}>
            <span style={{fontSize:28,color:C.text3}}>+</span>
            <span style={{fontSize:13,color:C.blue,fontWeight:600}}>Ajouter un compte</span>
          </div>
        </div>

        {/* MONEY IN / MONEY OUT QB STYLE */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
          <div style={{background:'#fff',borderRadius:8,padding:'16px 20px',border:'1px solid '+C.border,boxShadow:'0 1px 3px rgba(0,0,0,0.08)'}}>
            <div style={{fontSize:12,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>💰 Argent entrant</div>
            <div style={{fontSize:24,fontWeight:700,color:C.green}}>{fmtF(moneyIn)} F</div>
          </div>
          <div style={{background:'#fff',borderRadius:8,padding:'16px 20px',border:'1px solid '+C.border,boxShadow:'0 1px 3px rgba(0,0,0,0.08)'}}>
            <div style={{fontSize:12,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>💸 Argent sortant</div>
            <div style={{fontSize:24,fontWeight:700,color:C.red}}>{fmtF(moneyOut)} F</div>
          </div>
        </div>

        {/* ÉVOLUTION DU SOLDE — graphique réel */}
        <div style={{background:'#fff',borderRadius:8,border:'1px solid '+C.border,boxShadow:'0 1px 3px rgba(0,0,0,0.08)',marginBottom:20,overflow:'hidden'}}>
          <div style={{padding:'14px 20px',borderBottom:'1px solid '+C.border}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>Évolution du solde — {banks.find(b=>b.id===selBank)?.name}</div>
            <div style={{fontSize:11,color:C.text4}}>30 derniers mouvements</div>
          </div>
          <div style={{padding:'10px 14px'}}>
            {balanceHistory.length<2 ? (
              <div style={{height:160,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:C.text4,gap:5}}>
                <span style={{fontSize:13}}>Pas encore assez de mouvements</span>
                <span style={{fontSize:11}}>Le graphique apparaîtra dès qu'il y aura plusieurs transactions</span>
              </div>
            ) : AreaChart ? (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={balanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                  <XAxis dataKey="date" tick={{fontSize:10,fill:C.text3}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:9,fill:C.text3}} axisLine={false} tickLine={false} tickFormatter={v=>(v/1000000).toFixed(1)+'M'}/>
                  <Tooltip formatter={v=>fmtF(v)+' F'}/>
                  <Area type="monotone" dataKey="solde" stroke={C.blue} fill={C.blue+'22'} strokeWidth={2}/>
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* TABS QB STYLE */}
        <div style={{background:'#fff',borderRadius:8,border:'1px solid '+C.border,boxShadow:'0 1px 3px rgba(0,0,0,0.08)'}}>
          <div style={{display:'flex',borderBottom:'1px solid '+C.border,padding:'0 16px'}}>
            {[{id:'feed',l:'Bank Feed'},{id:'rapprochement',l:'Rapprochement'},{id:'virements',l:'Virements internes'}].map(t=>(
              <button key={t.id} onClick={()=>setMode(t.id)} style={{
                padding:'14px 20px',border:'none',background:'none',cursor:'pointer',
                fontSize:14,fontWeight:mode===t.id?700:400,
                color:mode===t.id?C.green:C.text3,
                borderBottom:mode===t.id?'3px solid '+C.green:'3px solid transparent',
                marginBottom:-1
              }}>{t.l}</button>
            ))}
            <div style={{flex:1}}/>
            <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0'}}>
              <div style={{display:'flex',alignItems:'center',gap:6,background:'#F4F5F7',border:'1px solid '+C.border,borderRadius:4,padding:'6px 12px'}}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." style={{border:'none',outline:'none',fontSize:13,color:C.text,background:'transparent',width:140}}/>
              </div>
              <button style={{background:C.white,border:'1px solid '+C.border,borderRadius:4,padding:'6px 14px',fontSize:13,cursor:'pointer',color:C.text2}}>Exporter</button>
            </div>
          </div>

          {mode==='feed'&&(
            <div>
              <div style={{padding:'12px 16px',background:'#F4F5F7',fontSize:13,fontWeight:600,color:C.text2,display:'flex',justifyContent:'space-between'}}>
                <span>Transactions — {banks.find(b=>b.id===selBank)?.name}</span>
                <span style={{color:C.text3}}>Solde: {fmtF(banks.find(b=>b.id===selBank)?.balance||0)} F</span>
              </div>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#F4F5F7'}}>
                  {['DATE','DESCRIPTION','RÉFÉRENCE','DÉBIT','CRÉDIT','STATUT','ACTIONS'].map(h=>(
                    <th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:12,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:'0.5px'}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {loading&&<tr><td colSpan={7} style={{padding:32,textAlign:'center',color:C.text3}}>Chargement...</td></tr>}
                  {!loading&&txns.length===0&&<tr><td colSpan={7} style={{padding:48,textAlign:'center',color:C.text3}}>
                    <div style={{fontSize:40,marginBottom:12}}>🏦</div>
                    <p style={{margin:0,fontWeight:600}}>Aucune transaction</p>
                    <p style={{margin:'4px 0 0',fontSize:13}}>Importez un relevé CSV ou synchronisez votre banque</p>
                  </td></tr>}
                  {txns.map((t,i)=>(
                    <tr key={i} style={{borderBottom:'1px solid '+C.border2}} onMouseOver={e=>e.currentTarget.style.background='#F9FAFB'} onMouseOut={e=>e.currentTarget.style.background='#fff'}>
                      <td style={{padding:'10px 14px',fontSize:13,color:C.text2}}>{t.date}</td>
                      <td style={{padding:'10px 14px',fontSize:13,color:C.text,fontWeight:500}}>{t.desc}</td>
                      <td style={{padding:'10px 14px',fontSize:12,color:C.text3}}>{t.ref}</td>
                      <td style={{padding:'10px 14px',fontSize:13,color:C.red,fontWeight:500}}>{t.debit>0?fmtF(t.debit)+' F':'—'}</td>
                      <td style={{padding:'10px 14px',fontSize:13,color:C.green,fontWeight:500}}>{t.credit>0?fmtF(t.credit)+' F':'—'}</td>
                      <td style={{padding:'10px 14px'}}>
                        <span style={{background:t.status==='matched'?C.green_l:C.orange_l,color:t.status==='matched'?C.green:C.orange,padding:'3px 10px',borderRadius:12,fontSize:12,fontWeight:600}}>
                          {t.status==='matched'?'✓ Rapproché':'En attente'}
                        </span>
                      </td>
                      <td style={{padding:'10px 14px'}}>
                        {t.status!=='matched'&&<button style={{background:C.blue,color:'#fff',border:'none',borderRadius:4,padding:'4px 12px',fontSize:12,cursor:'pointer'}}>Rapprocher</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading&&<div style={{padding:'12px 16px',borderTop:'1px solid '+C.border,display:'flex',justifyContent:'space-between',fontSize:13,color:C.text2}}>
                <span><strong>{txns.length}</strong> transaction(s)</span>
                <span>Débit: <strong style={{color:C.red}}>{fmtF(moneyOut)} F</strong> · Crédit: <strong style={{color:C.green}}>{fmtF(moneyIn)} F</strong></span>
              </div>}
            </div>
          )}
          {mode!=='feed'&&<div style={{padding:48,textAlign:'center',color:C.text3}}>
            <div style={{fontSize:40,marginBottom:12}}>{mode==='rapprochement'?'🔄':'🔀'}</div>
            <p style={{fontWeight:600,margin:0}}>{mode==='rapprochement'?'Rapprochement bancaire':'Virements internes'}</p>
            <p style={{fontSize:13,margin:'8px 0 0'}}>Importez un relevé pour commencer</p>
          </div>}
        </div>
      </div>
    </div>
  );
};


const PagePayroll = () => {
  const navigate = useNavigate();
  return (
    <div style={{minHeight:"100vh",background:'#F4F5F7',fontFamily:"\"Segoe UI\",Arial,sans-serif"}}>
      <CIBTopBar title="Paie et Ressources Humaines" icon="payroll" color={C.purple}>
        <div style={{display:"flex",gap:8}}>
          <Btn label="Ouvrir le module RH" variant="primary" sm icon="check" onClick={()=>navigate('/rh')}/>
        </div>
      </CIBTopBar>
      <div style={{padding:"60px 24px",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{maxWidth:480,textAlign:"center",background:C.white,border:"1px solid "+C.border,borderRadius:8,padding:"40px 32px"}}>
          <div style={{width:56,height:56,borderRadius:"50%",background:C.purple_l,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}>
            <Ico n="payroll" s={26} c={C.purple}/>
          </div>
          <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:8}}>La paie se gère dans le module RH</div>
          <div style={{fontSize:13,color:C.text3,lineHeight:1.6,marginBottom:24}}>
            Pour éviter deux systèmes de paie séparés, les bulletins, calculs CNPS/IRPP et déclarations
            fiscales sont gérés directement dans le module RH, connecté aux vraies données employés.
          </div>
          <Btn label="Aller au module RH" variant="primary" icon="check" onClick={()=>navigate('/rh')}/>
        </div>
      </div>
    </div>
  );
};

// ================================================================
// ================================================================
//  RAPPORTS — Dynamiques SYSCOHADA (données réelles API)
// ================================================================
const PageReports = () => {
  const navigate = useNavigate();
  const [activeGroup, setActiveGroup] = useState(null);
  const [selReport,   setSelReport]   = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [rData,       setRData]       = useState(null);
  const [invoices,    setInvoices]    = useState([]);
  const [bills,       setBills]       = useState([]);
  const [jobs,        setJobs]        = useState([]);
  const [customers,   setCustomers]   = useState([]);
  const [vendors,     setVendors]     = useState([]);

  const REPORT_GROUPS = [
    {id:'financial', name:'Etats financiers SYSCOHADA', color:C.green,  icon:'chart', reports:[
      {id:'pl',          name:'Compte de résultat (P&L)',           desc:'Produits, charges et résultat net'},
      {id:'bilan',       name:'Bilan comptable SYSCOHADA',           desc:'Actif, passif et capitaux propres'},
      {id:'cashpos',     name:'Position de trésorerie',              desc:'Solde de chaque compte bancaire'},
      {id:'plcomp',      name:'P&L comparatif période précédente',   desc:'Evolution des performances'},
      {id:'budget',      name:'Budget vs Réel',                      desc:'Ecart entre prévisions et réalité'},
    ]},
    {id:'ar', name:'Clients et Comptes Clients AR', color:C.blue, icon:'invoice', reports:[
      {id:'araging',     name:'AR Aging Summary',                    desc:'Encours clients par tranche d\'âge'},
      {id:'ardetail',    name:'AR Aging Détail',                     desc:'Détail par facture et client'},
      {id:'arbalance',   name:'Balance clients',                     desc:'Solde ouvert par client'},
      {id:'aroverdue',   name:'Factures en retard',                  desc:'Factures échues non payées'},
      {id:'collections', name:'Rapport de recouvrement',             desc:'Suivi des relances clients'},
    ]},
    {id:'sales', name:'Ventes et Chiffre d\'Affaires', color:C.green, icon:'chart', reports:[
      {id:'sales_cust',  name:'CA par client',                       desc:'Chiffre d\'affaires par client'},
      {id:'sales_job',   name:'CA par job',                          desc:'Revenus par projet'},
      {id:'sales_month', name:'CA mensuel',                          desc:'Evolution mensuelle du CA'},
      {id:'invoices_pending',name:'Factures en attente',             desc:'Devis et factures non encaissées'},
    ]},
    {id:'ap', name:'Fournisseurs et Comptes AP', color:C.orange, icon:'bill', reports:[
      {id:'apaging',     name:'AP Aging Summary',                    desc:'Dettes fournisseurs par tranche'},
      {id:'apdetail',    name:'AP Aging Détail',                     desc:'Détail par bill et fournisseur'},
      {id:'apbalance',   name:'Balance fournisseurs',                desc:'Solde dû par fournisseur'},
      {id:'bills_unpaid',name:'Bills non payés',                     desc:'Bills en attente de paiement'},
      {id:'purchases',   name:'Achats par fournisseur',              desc:'Historique achats fournisseurs'},
    ]},
    {id:'jobcosting', name:'Job Costing et Rentabilité', color:C.purple, icon:'job', reports:[
      {id:'profitability',name:'Rentabilité par job',                desc:'Marge nette par projet'},
      {id:'evactuals',   name:'Estimates vs Actuals',                desc:'Budget prévu vs coûts réels'},
      {id:'jobcost',     name:'Coûts par job',                       desc:'Détail des coûts engagés'},
      {id:'unbilled',    name:'Coûts non facturés',                  desc:'Dépenses sans facture associée'},
      {id:'jobtime',     name:'Temps par job',                       desc:'Heures enregistrées par projet'},
      {id:'bc_tracker',  name:'PO Tracker BC',                       desc:'Suivi des bons de commande'},
    ]},
    {id:'payroll', name:'Paie et Ressources Humaines', color:C.blue, icon:'payroll', reports:[
      {id:'pay_summary', name:'Résumé paie mensuelle',               desc:'Masse salariale par période'},
      {id:'pay_detail',  name:'Détail paie par employé',             desc:'Fiche de paie individuelle'},
      {id:'cnps_decl',   name:'Déclaration CNPS',                    desc:'Rapport CNPS mensuel'},
      {id:'irpp_decl',   name:'Déclaration IRPP',                    desc:'Rapport IRPP mensuel'},
      {id:'pay_annual',  name:'Masse salariale annuelle',            desc:'Bilan RH annuel'},
    ]},
    {id:'banking', name:'Banking et Trésorerie', color:C.green, icon:'bank', reports:[
      {id:'cashpos2',    name:'Position de trésorerie',              desc:'Solde de chaque compte'},
      {id:'cashflow2',   name:'Flux de trésorerie',                  desc:'Entrées et sorties de fonds'},
      {id:'recon',       name:'Historique rapprochements',           desc:'Rapprochements bancaires'},
      {id:'deposits',    name:'Détail des dépôts',                   desc:'Virements reçus par compte'},
    ]},
    {id:'tax', name:'Fiscalité SYSCOHADA', color:C.red, icon:'tax', reports:[
      {id:'tva_decl',    name:'Déclaration TVA mensuelle',           desc:'TVA collectée et déductible'},
      {id:'tva_coll',    name:'TVA collectée par client',            desc:'Détail TVA par client'},
      {id:'tva_ded',     name:'TVA déductible par fournisseur',      desc:'Détail TVA déductible'},
      {id:'is_acompte',  name:'Acomptes IS',                         desc:'Impôt sur les sociétés'},
    ]},
  ];

  const totalReports = REPORT_GROUPS.reduce((s,g)=>s+g.reports.length,0);

  const loadReport = async (report) => {
    setLoading(true); setRData(null);
    try {
      const id = report.id;
      if(id==='pl') {
        setRData(await getPL());
      } else if(id==='bilan') {
        setRData(await getBilan());
      } else if(id==='cashpos'||id==='cashpos2'||id==='cashflow2') {
        setRData(await getBalance());
      } else if(['tva_decl','tva_coll','tva_ded'].includes(id)) {
        setRData({_tva:true, ...(await getBalance())});
      } else if(['araging','ardetail','arbalance','aroverdue','collections','sales_cust','sales_job','invoices_pending'].includes(id)) {
        const [inv,cust,job] = await Promise.all([getInvoices(),getCustomers(),getJobs()]);
        setInvoices(inv||[]); setCustomers(cust||[]); setJobs(job||[]);
        setRData({_ar:true});
      } else if(['apaging','apdetail','apbalance','bills_unpaid','purchases'].includes(id)) {
        const [b,v] = await Promise.all([getBills(),getVendors()]);
        setBills(b||[]); setVendors(v||[]);
        setRData({_ap:true});
      } else if(['profitability','evactuals','jobcost','jobtime'].includes(id)) {
        const [j,inv,b,cust] = await Promise.all([getJobs(),getInvoices(),getBills(),getCustomers()]);
        setJobs(j||[]); setInvoices(inv||[]); setBills(b||[]); setCustomers(cust||[]);
        setRData({_job:true});
      } else {
        setRData({_generic:true});
      }
    } catch(e) { setRData({_error:e.message}); }
    setLoading(false);
  };

  useEffect(()=>{ if(selReport) loadReport(selReport); },[selReport?.id]);

  const ageBucket = (dueDate) => {
    const days = Math.floor((Date.now()-new Date(dueDate||Date.now()))/(1000*86400));
    if(days<=0)  return {label:'Courant', color:C.green};
    if(days<=30) return {label:'1-30j',   color:C.blue};
    if(days<=60) return {label:'31-60j',  color:C.orange};
    if(days<=90) return {label:'61-90j',  color:C.red};
    return       {label:'>90j',           color:'#7F1D1D'};
  };

  const KPICard = ({label,value,color}) => (
    <div style={{padding:'14px 16px',background:'#FFFFFF',border:'1px solid #E5E7EB',boxShadow:'0 1px 2px rgba(0,0,0,0.06)',borderRadius:6,boxShadow:'0 1px 3px rgba(0,0,0,0.08)',borderTop:'3px solid '+color,textAlign:'center'}}>
      <div style={{fontSize:11,color:C.text3,textTransform:'uppercase',letterSpacing:.4,marginBottom:4}}>{label}</div>
      <div style={{fontSize:20,fontWeight:700,color}}>{value}</div>
    </div>
  );

  const Th = ({children,right}) => <th style={{padding:'9px 12px',textAlign:right?'right':'left',fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase'}}>{children}</th>;
  const Td = ({children,right,bold,color}) => <td style={{padding:'9px 12px',textAlign:right?'right':'left',fontWeight:bold?700:400,color:color||C.text,fontSize:12}}>{children}</td>;

  const renderPL = (d) => {
    if(!d||!d.produits) return <div style={{padding:40,textAlign:'center',color:C.text4}}>Aucune donnée P&L — créez des factures d'abord</div>;
    return (
      <div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
          <KPICard label="Total Produits" value={fN(d.totalProduits)+' F'} color={C.blue}/>
          <KPICard label="Total Charges"  value={fN(d.totalCharges)+' F'}  color={C.red}/>
          <KPICard label="Résultat Net"   value={(d.resultat>=0?'+':'')+fN(d.resultat)+' F'} color={d.resultat>=0?C.green:C.red}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div style={{background:'#FFFFFF',border:'1px solid #E5E7EB',boxShadow:'0 1px 2px rgba(0,0,0,0.06)',borderRadius:6,boxShadow:'0 1px 3px rgba(0,0,0,0.08)',overflow:'hidden'}}>
            <div style={{padding:'10px 14px',background:C.green+'15',borderBottom:'2px solid '+C.green,fontWeight:700,fontSize:12,color:C.green}}>PRODUITS — Classe 7</div>
            {d.produits.filter(p=>p.montant>0).map((p,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 14px',borderBottom:'1px solid '+C.border2}}>
                <span style={{fontSize:12,color:C.text}}>{p.code} — {p.nom}</span>
                <span style={{fontSize:12,fontWeight:600,color:C.green}}>{fN(p.montant)} F</span>
              </div>
            ))}
            {d.produits.filter(p=>p.montant>0).length===0&&<div style={{padding:'20px 14px',fontSize:12,color:C.text4}}>Aucun produit enregistré</div>}
            <div style={{display:'flex',justifyContent:'space-between',padding:'10px 14px',background:C.green+'10',borderTop:'2px solid '+C.green}}>
              <span style={{fontWeight:700,fontSize:13}}>TOTAL PRODUITS</span>
              <span style={{fontWeight:800,fontSize:14,color:C.green}}>{fN(d.totalProduits)} F</span>
            </div>
          </div>
          <div style={{background:'#FFFFFF',border:'1px solid #E5E7EB',boxShadow:'0 1px 2px rgba(0,0,0,0.06)',borderRadius:6,boxShadow:'0 1px 3px rgba(0,0,0,0.08)',overflow:'hidden'}}>
            <div style={{padding:'10px 14px',background:C.red+'15',borderBottom:'2px solid '+C.red,fontWeight:700,fontSize:12,color:C.red}}>CHARGES — Classe 6</div>
            {d.charges.filter(c=>c.montant>0).map((c,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 14px',borderBottom:'1px solid '+C.border2}}>
                <span style={{fontSize:12,color:C.text}}>{c.code} — {c.nom}</span>
                <span style={{fontSize:12,fontWeight:600,color:C.red}}>({fN(c.montant)}) F</span>
              </div>
            ))}
            {d.charges.filter(c=>c.montant>0).length===0&&<div style={{padding:'20px 14px',fontSize:12,color:C.text4}}>Aucune charge enregistrée</div>}
            <div style={{display:'flex',justifyContent:'space-between',padding:'10px 14px',background:C.red+'10',borderTop:'2px solid '+C.red}}>
              <span style={{fontWeight:700,fontSize:13}}>TOTAL CHARGES</span>
              <span style={{fontWeight:800,fontSize:14,color:C.red}}>({fN(d.totalCharges)}) F</span>
            </div>
          </div>
        </div>
        <div style={{marginTop:16,padding:'14px 20px',background:d.resultat>=0?C.green+'15':C.red+'15',border:'2px solid '+(d.resultat>=0?C.green:C.red),borderRadius:6,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontWeight:700,fontSize:15,color:d.resultat>=0?C.green:C.red}}>RÉSULTAT NET — {d.beneficiaire?'BÉNÉFICIAIRE ✅':'DÉFICITAIRE ⚠️'}</span>
          <span style={{fontWeight:900,fontSize:22,color:d.resultat>=0?C.green:C.red}}>{d.resultat>=0?'+':''}{fN(d.resultat)} F CFA</span>
        </div>
      </div>
    );
  };

  const renderBilan = (d) => {
    if(!d||!d.actif) return <div style={{padding:40,textAlign:'center',color:C.text4}}>Aucune donnée bilan</div>;
    return (
      <div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
          <KPICard label="Total Actif"  value={fN(d.totalActif)+' F'}  color={C.blue}/>
          <KPICard label="Total Passif" value={fN(d.totalPassif)+' F'} color={C.orange}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          {[{title:'ACTIF',items:d.actif,color:C.blue,total:d.totalActif},{title:'PASSIF',items:d.passif,color:C.orange,total:d.totalPassif}].map(({title,items,color,total})=>(
            <div key={title} style={{background:'#FFFFFF',border:'1px solid #E5E7EB',boxShadow:'0 1px 2px rgba(0,0,0,0.06)',borderRadius:6,boxShadow:'0 1px 3px rgba(0,0,0,0.08)',overflow:'hidden'}}>
              <div style={{padding:'10px 14px',background:color+'15',borderBottom:'2px solid '+color,fontWeight:700,fontSize:12,color}}>{title}</div>
              {(items||[]).filter(a=>a.solde>0).map((a,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 14px',borderBottom:'1px solid '+C.border2}}>
                  <span style={{fontSize:12}}>{a.code} — {a.nom}</span>
                  <span style={{fontSize:12,fontWeight:600,color}}>{fN(a.solde)} F</span>
                </div>
              ))}
              {(items||[]).filter(a=>a.solde>0).length===0&&<div style={{padding:'20px 14px',fontSize:12,color:C.text4}}>Aucun compte mouvementé</div>}
              <div style={{display:'flex',justifyContent:'space-between',padding:'10px 14px',background:color+'10',borderTop:'2px solid '+color}}>
                <span style={{fontWeight:700}}>TOTAL {title}</span>
                <span style={{fontWeight:800,color}}>{fN(total)} F</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{marginTop:12,padding:'10px 16px',background:d.equilibre?C.green+'10':C.red+'10',border:'1px solid '+(d.equilibre?C.green:C.red),borderRadius:6,textAlign:'center',fontWeight:700,color:d.equilibre?C.green:C.red}}>
          {d.equilibre?'✅ Bilan équilibré SYSCOHADA':'⚠️ Écart: '+fN(Math.abs(d.totalActif-d.totalPassif))+' F — vérifiez les écritures'}
        </div>
      </div>
    );
  };

  const renderARaging = () => {
    const open = invoices.filter(i=>i.status!=='Paid');
    const buckets = {'Courant':[],'1-30j':[],'31-60j':[],'61-90j':[],'> 90j':[]};
    open.forEach(inv=>{
      const b = ageBucket(inv.dueDate||inv.date);
      const k = b.label==='Courant'?'Courant':b.label==='1-30j'?'1-30j':b.label==='31-60j'?'31-60j':b.label==='61-90j'?'61-90j':'> 90j';
      buckets[k].push(inv);
    });
    const bColors = {'Courant':C.green,'1-30j':C.blue,'31-60j':C.orange,'61-90j':C.red,'> 90j':'#7F1D1D'};
    return (
      <div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,marginBottom:16}}>
          {Object.entries(buckets).map(([k,arr])=>(
            <div key={k} style={{padding:'12px',background:'#FFFFFF',border:'1px solid #E5E7EB',boxShadow:'0 1px 2px rgba(0,0,0,0.06)',borderRadius:6,boxShadow:'0 1px 3px rgba(0,0,0,0.08)',borderTop:'3px solid '+(bColors[k]),textAlign:'center'}}>
              <div style={{fontSize:11,color:C.text3,marginBottom:4}}>{k}</div>
              <div style={{fontSize:16,fontWeight:700,color:bColors[k]}}>{fN(arr.reduce((s,i)=>s+Number(i.balance||0),0))} F</div>
              <div style={{fontSize:11,color:C.text4}}>{arr.length} fact.</div>
            </div>
          ))}
        </div>
        <div style={{background:'#FFFFFF',border:'1px solid #E5E7EB',boxShadow:'0 1px 2px rgba(0,0,0,0.06)',borderRadius:6,boxShadow:'0 1px 3px rgba(0,0,0,0.08)',overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:QB.bg,borderBottom:'2px solid '+C.border}}>
              <Th>Facture</Th><Th>Client</Th><Th>Date</Th><Th>Échéance</Th><Th right>Total</Th><Th right>Solde</Th><Th right>Tranche</Th>
            </tr></thead>
            <tbody>
              {open.sort((a,b)=>new Date(a.dueDate||a.date)-new Date(b.dueDate||b.date)).map((inv,i)=>{
                const cust = customers.find(c=>c.id===inv.customerId);
                const b = ageBucket(inv.dueDate||inv.date);
                return(
                  <tr key={inv.id} style={{borderBottom:'1px solid '+C.border2,background:i%2?'#FAFAFA':C.white}}>
                    <Td bold color={C.blue}>{inv.number||inv.id?.slice(-8)}</Td>
                    <Td>{cust?cust.company||cust.name:inv.customerId}</Td>
                    <Td>{inv.date}</Td>
                    <Td>{inv.dueDate||'—'}</Td>
                    <Td right bold>{fN(inv.total)} F</Td>
                    <Td right bold color={C.orange}>{fN(inv.balance||0)} F</Td>
                    <td style={{padding:'9px 12px',textAlign:'right'}}>
                      <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:10,background:b.color+'15',color:b.color}}>{b.label}</span>
                    </td>
                  </tr>
                );
              })}
              {open.length===0&&<tr><td colSpan={7} style={{padding:40,textAlign:'center',color:C.text4}}>✅ Aucune facture en attente</td></tr>}
            </tbody>
            <tfoot><tr style={{background:QB.bg,borderTop:'2px solid '+C.border}}>
              <td colSpan={4} style={{padding:'10px 12px',fontWeight:700}}>TOTAL ENCOURS</td>
              <td style={{padding:'10px 12px',textAlign:'right',fontWeight:800}}>{fN(invoices.reduce((s,i)=>s+Number(i.total||0),0))} F</td>
              <td style={{padding:'10px 12px',textAlign:'right',fontWeight:800,color:C.orange}}>{fN(open.reduce((s,i)=>s+Number(i.balance||0),0))} F</td>
              <td/>
            </tr></tfoot>
          </table>
        </div>
      </div>
    );
  };

  const renderSalesByCustomer = () => {
    const byC = {};
    invoices.forEach(inv=>{
      const cust = customers.find(c=>c.id===inv.customerId);
      const name = cust?cust.company||cust.name:inv.customerId||'Inconnu';
      if(!byC[name]) byC[name]={total:0,paid:0,count:0};
      byC[name].total+=Number(inv.total||0);
      byC[name].paid +=Number(inv.amountPaid||0);
      byC[name].count++;
    });
    const rows = Object.entries(byC).sort((a,b)=>b[1].total-a[1].total);
    const grand = rows.reduce((s,[,v])=>s+v.total,0);
    return(
      <div style={{background:'#FFFFFF',border:'1px solid #E5E7EB',boxShadow:'0 1px 2px rgba(0,0,0,0.06)',borderRadius:6,boxShadow:'0 1px 3px rgba(0,0,0,0.08)',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{background:QB.bg,borderBottom:'2px solid '+C.border}}>
            <Th>Client</Th><Th right>Factures</Th><Th right>CA Facturé</Th><Th right>Encaissé</Th><Th right>Solde</Th><Th right>Part %</Th>
          </tr></thead>
          <tbody>
            {rows.map(([name,v],i)=>(
              <tr key={name} style={{borderBottom:'1px solid '+C.border2,background:i%2?'#FAFAFA':C.white}}>
                <Td bold color={C.blue}>{name}</Td>
                <Td right>{v.count}</Td>
                <Td right bold>{fN(v.total)} F</Td>
                <Td right color={C.green}>{fN(v.paid)} F</Td>
                <Td right color={v.total-v.paid>0?C.orange:C.green}>{fN(v.total-v.paid)} F</Td>
                <td style={{padding:'9px 12px',textAlign:'right'}}>
                  <span style={{fontSize:12,fontWeight:700,padding:'2px 8px',borderRadius:10,background:C.blue+'15',color:C.blue}}>{grand>0?Math.round(v.total/grand*100):0}%</span>
                </td>
              </tr>
            ))}
            {rows.length===0&&<tr><td colSpan={6} style={{padding:40,textAlign:'center',color:C.text4}}>Aucune facture</td></tr>}
          </tbody>
          <tfoot><tr style={{background:QB.bg,borderTop:'2px solid '+C.border}}>
            <td style={{padding:'10px 12px',fontWeight:700}}>TOTAL</td>
            <td style={{padding:'10px 12px',textAlign:'right',fontWeight:700}}>{invoices.length}</td>
            <td style={{padding:'10px 12px',textAlign:'right',fontWeight:800,color:C.blue}}>{fN(grand)} F</td>
            <td colSpan={3}/>
          </tr></tfoot>
        </table>
      </div>
    );
  };

  const renderProfitability = () => (
    <div style={{background:'#FFFFFF',border:'1px solid #E5E7EB',boxShadow:'0 1px 2px rgba(0,0,0,0.06)',borderRadius:6,boxShadow:'0 1px 3px rgba(0,0,0,0.08)',overflow:'hidden'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr style={{background:QB.bg,borderBottom:'2px solid '+C.border}}>
          <Th>Job</Th><Th>Client</Th><Th right>Contrat</Th><Th right>Facturé</Th><Th right>Coûts</Th><Th right>Marge F</Th><Th right>Marge %</Th>
        </tr></thead>
        <tbody>
          {jobs.map((j,i)=>{
            const jobInv   = invoices.filter(inv=>inv.jobId===j.id);
            const jobBills = bills.filter(b=>b.jobId===j.id);
            const totInv   = jobInv.reduce((s,inv)=>s+Number(inv.total||0),0);
            const totBill  = jobBills.reduce((s,b)=>s+Number(b.total||0),0);
            const marge    = totInv - totBill;
            const pct      = totInv>0?Math.round(marge/totInv*100):0;
            const cust     = customers.find(c=>c.id===j.customerId);
            return(
              <tr key={j.id} style={{borderBottom:'1px solid '+C.border2,background:i%2?'#FAFAFA':C.white,cursor:'pointer'}}
                onClick={()=>navigate('/cleanitbooks/jobs/'+j.id)}>
                <Td bold color={C.blue}>{j.name}</Td>
                <Td color={C.text3}>{cust?cust.company||cust.name:'—'}</Td>
                <Td right>{fN(j.contractAmount||0)} F</Td>
                <Td right color={C.green}>{fN(totInv)} F</Td>
                <Td right color={C.red}>{fN(totBill)} F</Td>
                <Td right bold color={marge>=0?C.green:C.red}>{marge>=0?'+':''}{fN(marge)} F</Td>
                <td style={{padding:'9px 12px',textAlign:'right'}}>
                  <span style={{fontSize:12,fontWeight:700,padding:'3px 9px',borderRadius:10,background:pct>=20?C.green+'15':pct>=0?C.orange+'15':C.red+'15',color:pct>=20?C.green:pct>=0?C.orange:C.red}}>{pct}%</span>
                </td>
              </tr>
            );
          })}
          {jobs.length===0&&<tr><td colSpan={7} style={{padding:40,textAlign:'center',color:C.text4}}>Aucun job</td></tr>}
        </tbody>
      </table>
    </div>
  );

  const renderTVA = (d) => {
    if(!d||!d.rows) return <div style={{padding:40,textAlign:'center',color:C.text4}}>Aucune donnée TVA</div>;
    const tvaC = d.rows.find(r=>r.code==='443000');
    const tvaD = d.rows.find(r=>r.code==='445000');
    const coll = tvaC?Math.abs(tvaC.credit-tvaC.debit):0;
    const ded  = tvaD?Math.abs(tvaD.debit-tvaD.credit):0;
    const due  = Math.max(0, coll-ded);
    return(
      <div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
          <KPICard label="TVA Collectée (443)" value={fN(coll)+' F'} color={C.red}/>
          <KPICard label="TVA Déductible (445)" value={fN(ded)+' F'} color={C.green}/>
          <KPICard label="TVA Nette Due" value={fN(due)+' F'} color={C.orange}/>
        </div>
        <div style={{background:'#FFFFFF',border:'1px solid #E5E7EB',boxShadow:'0 1px 2px rgba(0,0,0,0.06)',borderRadius:6,boxShadow:'0 1px 3px rgba(0,0,0,0.08)',padding:20}}>
          <div style={{fontWeight:700,marginBottom:12,fontSize:14}}>Déclaration TVA — {new Date().toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}</div>
          {[['CA19 — TVA collectée sur ventes (19.25%)',fN(coll)+' F'],
            ['CA20 — TVA déductible sur achats',fN(ded)+' F'],
            ['TVA nette à reverser à la DGI',fN(due)+' F']
          ].map(([l,v],i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid '+C.border2}}>
              <span style={{fontSize:13}}>{l}</span><span style={{fontWeight:700,fontSize:14}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCashPos = (d) => {
    if(!d||!d.rows) return <div style={{padding:40,textAlign:'center',color:C.text4}}>Aucune donnée trésorerie</div>;
    const tresoRows = d.rows.filter(r=>r.classe==='5');
    const total = tresoRows.reduce((s,r)=>s+Number(r.debit)-Number(r.credit),0);
    return(
      <div>
        <div style={{padding:'14px',background:'#FFFFFF',border:'1px solid #E5E7EB',boxShadow:'0 1px 2px rgba(0,0,0,0.06)',borderRadius:6,boxShadow:'0 1px 3px rgba(0,0,0,0.08)',borderTop:'3px solid '+C.green,textAlign:'center',marginBottom:20}}>
          <div style={{fontSize:11,color:C.text3,textTransform:'uppercase',marginBottom:4}}>Position Trésorerie Totale</div>
          <div style={{fontSize:28,fontWeight:800,color:total>=0?C.green:C.red}}>{fN(total)} F CFA</div>
        </div>
        <div style={{background:'#FFFFFF',border:'1px solid #E5E7EB',boxShadow:'0 1px 2px rgba(0,0,0,0.06)',borderRadius:6,boxShadow:'0 1px 3px rgba(0,0,0,0.08)',overflow:'hidden'}}>
          {tresoRows.map((r,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px',borderBottom:'1px solid '+C.border2}}>
              <div>
                <div style={{fontWeight:600,fontSize:13}}>{r.nom}</div>
                <div style={{fontSize:11,color:C.text4}}>Compte {r.code}</div>
              </div>
              <span style={{fontWeight:700,fontSize:15,color:r.debit>=r.credit?C.green:C.red}}>{fN(Math.abs(r.debit-r.credit))} F</span>
            </div>
          ))}
          {tresoRows.length===0&&<div style={{padding:40,textAlign:'center',color:C.text4}}>Initialisez le plan comptable d'abord</div>}
        </div>
      </div>
    );
  };

  const renderAPaging = () => {
    const open = bills.filter(b=>b.status!=='Paid');
    return(
      <div style={{background:'#FFFFFF',border:'1px solid #E5E7EB',boxShadow:'0 1px 2px rgba(0,0,0,0.06)',borderRadius:6,boxShadow:'0 1px 3px rgba(0,0,0,0.08)',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{background:QB.bg,borderBottom:'2px solid '+C.border}}>
            <Th>Bill</Th><Th>Fournisseur</Th><Th>Date</Th><Th right>Total</Th><Th right>Solde</Th><Th right>Statut</Th>
          </tr></thead>
          <tbody>
            {open.map((b,i)=>{
              const v = vendors.find(vv=>vv.id===b.vendorId);
              return(
                <tr key={b.id} style={{borderBottom:'1px solid '+C.border2,background:i%2?'#FAFAFA':C.white}}>
                  <Td bold color={C.orange}>{b.number||b.id?.slice(-8)}</Td>
                  <Td>{v?v.company||v.name:b.vendorId}</Td>
                  <Td>{b.date}</Td>
                  <Td right bold>{fN(b.total)} F</Td>
                  <Td right bold color={C.red}>{fN(b.balance||0)} F</Td>
                  <td style={{padding:'9px 12px',textAlign:'right'}}>
                    <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:10,background:C.orange+'15',color:C.orange}}>{b.status||'Open'}</span>
                  </td>
                </tr>
              );
            })}
            {open.length===0&&<tr><td colSpan={6} style={{padding:40,textAlign:'center',color:C.text4}}>✅ Aucun bill en attente</td></tr>}
          </tbody>
          <tfoot><tr style={{background:QB.bg,borderTop:'2px solid '+C.border}}>
            <td colSpan={3} style={{padding:'10px 12px',fontWeight:700}}>TOTAL DÛ FOURNISSEURS</td>
            <td style={{padding:'10px 12px',textAlign:'right',fontWeight:800}}>{fN(bills.reduce((s,b)=>s+Number(b.total||0),0))} F</td>
            <td style={{padding:'10px 12px',textAlign:'right',fontWeight:800,color:C.red}}>{fN(open.reduce((s,b)=>s+Number(b.balance||0),0))} F</td>
            <td/>
          </tr></tfoot>
        </table>
      </div>
    );
  };

  const renderReportView = (report) => {
    if(loading) return(
      <div style={{textAlign:'center',padding:'80px',background:'#FFFFFF',border:'1px solid #E5E7EB',boxShadow:'0 1px 2px rgba(0,0,0,0.06)',borderRadius:6,boxShadow:'0 1px 3px rgba(0,0,0,0.08)'}}>
        <div style={{fontSize:14,color:C.text3,marginBottom:8}}>⏳ Chargement des données réelles...</div>
        <div style={{fontSize:12,color:C.text4}}>Connexion base de données en cours</div>
      </div>
    );
    if(!rData) return null;
    if(rData._error) return <div style={{padding:40,textAlign:'center',color:C.red,background:C.white,border:'1px solid '+C.red,borderRadius:6}}>⚠️ {rData._error}</div>;
    if(report.id==='pl') return renderPL(rData);
    if(report.id==='bilan') return renderBilan(rData);
    if(['cashpos','cashpos2','cashflow2'].includes(report.id)) return renderCashPos(rData);
    if(['tva_decl','tva_coll','tva_ded'].includes(report.id)) return renderTVA(rData);
    if(['araging','ardetail','arbalance','aroverdue','collections'].includes(report.id)) return renderARaging();
    if(['sales_cust','invoices_pending'].includes(report.id)) return renderSalesByCustomer();
    if(['profitability','evactuals','jobcost','jobtime'].includes(report.id)) return renderProfitability();
    if(['apaging','apdetail','apbalance','bills_unpaid','purchases'].includes(report.id)) return renderAPaging();
    return(
      <div style={{padding:'60px',textAlign:'center',background:C.white,border:'1px dashed '+C.border,borderRadius:6}}>
        <Ico n="chart" s={48} c={C.border}/>
        <div style={{fontSize:16,color:C.text4,marginTop:16,marginBottom:8}}>{report.name}</div>
        <div style={{fontSize:13,color:C.text4,marginBottom:20}}>{report.desc}</div>
        <Btn label="Générer" variant="primary" icon="chart" onClick={()=>loadReport(report)}/>
      </div>
    );
  };

  return(
    <div style={{minHeight:'100vh',background:'#F4F5F7',fontFamily:'"Segoe UI",Arial,sans-serif'}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}*{box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px}`}</style>
      <CIBTopBar title="Rapports et Analyses" icon="report" color={C.text}>
        <div style={{display:'flex',gap:8}}>
          {selReport&&<Btn label="← Retour" variant="light" sm onClick={()=>{setSelReport(null);setRData(null);}}/>}
          {selReport&&<Btn label="Excel" variant="light" sm icon="download"/>}
          {selReport&&<Btn label="Imprimer" variant="default" sm icon="print" onClick={()=>window.print()}/>}
        </div>
      </CIBTopBar>
      <div style={{padding:'24px',animation:'fadeUp .3s ease'}}>
        {!selReport&&(
          <div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div>
                <div style={{fontSize:18,fontWeight:700,color:C.text}}>Centre de rapports</div>
                <div style={{fontSize:13,color:C.text3}}>{totalReports} rapports · SYSCOHADA · TVA 19.25% · Données temps réel</div>
              </div>
              <div style={{display:'flex',gap:8}}>
                {REPORT_GROUPS.map(g=>(
                  <button key={g.id} onClick={()=>setActiveGroup(activeGroup===g.id?null:g.id)}
                    style={{padding:'6px 12px',borderRadius:4,border:'1px solid '+(activeGroup===g.id?g.color:C.border),background:activeGroup===g.id?g.color+'15':C.white,color:activeGroup===g.id?g.color:C.text3,fontSize:11,cursor:'pointer',fontFamily:'inherit',fontWeight:activeGroup===g.id?700:400}}>
                    {g.reports.length}
                  </button>
                ))}
              </div>
            </div>
            {REPORT_GROUPS.filter(g=>!activeGroup||g.id===activeGroup).map(group=>(
              <div key={group.id} style={{marginBottom:24}}>
                <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px',background:'#FFFFFF',border:'1px solid #E5E7EB',boxShadow:'0 1px 2px rgba(0,0,0,0.06)',borderRadius:6,boxShadow:'0 1px 3px rgba(0,0,0,0.08)',marginBottom:10,borderLeft:'4px solid '+group.color}}>
                  <div style={{width:30,height:30,borderRadius:5,background:group.color+'15',display:'flex',alignItems:'center',justifyContent:'center'}}><Ico n={group.icon} s={15} c={group.color}/></div>
                  <span style={{fontSize:13,fontWeight:700,color:C.text}}>{group.name}</span>
                  <span style={{fontSize:11,color:C.text4,marginLeft:4}}>({group.reports.length} rapports)</span>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:8}}>
                  {group.reports.map(report=>(
                    <div key={report.id}
                      style={{padding:'14px 16px',background:'#FFFFFF',border:'1px solid #E5E7EB',boxShadow:'0 1px 2px rgba(0,0,0,0.06)',borderRadius:6,cursor:'pointer',transition:'all .15s'}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=group.color;e.currentTarget.style.background=group.color+'08';e.currentTarget.style.transform='translateY(-1px)';}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border2;e.currentTarget.style.background=C.white;e.currentTarget.style.transform='none';}}
                      onClick={()=>setSelReport(report)}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                        <div>
                          <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:4}}>{report.name}</div>
                          <div style={{fontSize:11,color:C.text4}}>{report.desc}</div>
                        </div>
                        <Ico n="chevr" s={14} c={C.text4}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {selReport&&(
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,padding:'12px 16px',background:'#FFFFFF',border:'1px solid #E5E7EB',boxShadow:'0 1px 2px rgba(0,0,0,0.06)',borderRadius:6,boxShadow:'0 1px 3px rgba(0,0,0,0.08)'}}>
              <Ico n="chart" s={18} c={C.blue}/>
              <div>
                <div style={{fontWeight:700,fontSize:14,color:C.text}}>{selReport.name}</div>
                <div style={{fontSize:12,color:C.text4}}>{selReport.desc}</div>
              </div>
              <div style={{marginLeft:'auto',fontSize:11,color:C.text4}}>Généré le {new Date().toLocaleDateString('fr-FR')} — Données temps réel</div>
            </div>
            {renderReportView(selReport)}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// NAV QB STYLE
// ═══════════════════════════════════════════════════════════════
const CIB_TABS = [
  {id:'dashboard', label:'Tableau de bord',       icon:'home'},
  {id:'banking',   label:'Banking',               icon:'bank'},
  {id:'sales',     label:'Ventes & Factures',     icon:'receipt'},
  {id:'purchases', label:'Achats & Fournisseurs', icon:'credit'},
  {id:'projects',  label:'Projets',               icon:'brief'},
  {id:'reports',   label:'Rapports',              icon:'chart'},
  {id:'journal',   label:'Journal',               icon:'clock'},
];

const CIB_C = {
  navy:'#1A5276', navy2:'#154360', green:'#2CA01C', green_l:'#EBF9E8',
  blue_l:'#E5F2FC', red:'#E24B4A', red_l:'#FDECEA', orange:'#E27000', orange_l:'#FEF3E2',
  text:'#111827', text2:'#374151', text3:'#6B7280', text4:'#9CA3AF',
  border:'#E5E7EB', bg:'#F9FAFB', white:'#FFFFFF',
};

const CIBNav = ({active, onTab, navigate}) => {
  return (
    <div style={{
      background:CIB_C.navy, display:'flex', alignItems:'center', gap:4,
      padding:'0 16px', height:52, position:'sticky', top:0, zIndex:100, overflowX:'auto',
    }}>
      <div onClick={()=>navigate('/cleanitbooks')} style={{
        display:'flex', alignItems:'center', gap:8, cursor:'pointer', flexShrink:0, marginRight:10,
      }}>
        <div style={{width:26,height:26,background:'#2E86C1',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <span style={{color:'white',fontWeight:700,fontSize:9}}>CIB</span>
        </div>
        <span style={{color:'white',fontSize:13,fontWeight:700,whiteSpace:'nowrap'}}>CleanIT Books</span>
      </div>

      <div style={{display:'flex',gap:2,flex:1,overflowX:'auto'}}>
        {CIB_TABS.map(t=>(
          <button key={t.id} onClick={()=>onTab(t.id)} title={t.label} style={{
            display:'flex', alignItems:'center', gap:7, padding:'7px 12px', border:'none', borderRadius:7,
            background:active===t.id?'rgba(255,255,255,0.14)':'transparent',
            color:active===t.id?'#fff':'rgba(255,255,255,0.6)',
            fontSize:12, fontWeight:active===t.id?600:400, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
          }}>
            <Ico n={t.icon} s={14} c={active===t.id?'#fff':'rgba(255,255,255,0.55)'}/>
            {t.label}
          </button>
        ))}
      </div>

      <button onClick={()=>onTab('sales')} title="Nouveau" style={{
        display:'flex', alignItems:'center', justifyContent:'center', gap:6, flexShrink:0,
        padding:'7px 14px', background:CIB_C.green, border:'none', borderRadius:7,
        color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
      }}>
        <Ico n="plus" s={13} c="#fff"/> Nouveau
      </button>

      <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0,marginLeft:14,paddingLeft:14,borderLeft:'1px solid rgba(255,255,255,0.1)'}}>
        <div style={{width:26,height:26,borderRadius:'50%',background:'#2E86C1',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:10,fontWeight:600,flexShrink:0}}>JB</div>
      </div>
    </div>
  );
};

const PageDashboard = ({invoices=[],bills=[],customers=[],jobs=[],navigate=()=>{},onTab=()=>{}}) => {
  const totalRevenue = invoices.reduce((s,i)=>s+(i.total||i.amount||0),0);
  const totalExpenses = bills.reduce((s,b)=>s+(b.total||b.amount||0),0);
  const pendingAmount = invoices.filter(i=>['pending','sent','overdue'].includes(i.status||i.statut)).reduce((s,i)=>s+(i.total||i.amount||0),0);
  const netProfit = totalRevenue - totalExpenses;
  const margin = totalRevenue>0 ? (netProfit/totalRevenue*100).toFixed(1) : '0';

  // Tendance vs mois précédent (comparaison réelle, pas de chiffre inventé)
  const moisLabel=['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  const monthlyTrend = useMemo(()=>{
    const months={};
    (invoices||[]).forEach(inv=>{
      const m=inv.date?.slice(0,7)||inv.dueDate?.slice(0,7);
      if(!m) return;
      if(!months[m]) months[m]={key:m,mois:moisLabel[parseInt(m.split('-')[1])-1],CA:0,Dépenses:0};
      months[m].CA+=Number(inv.total||inv.amount||0);
    });
    (bills||[]).forEach(b=>{
      const m=b.date?.slice(0,7)||b.dueDate?.slice(0,7);
      if(!m) return;
      if(!months[m]) months[m]={key:m,mois:moisLabel[parseInt(m.split('-')[1])-1],CA:0,Dépenses:0};
      months[m].Dépenses+=Number(b.total||b.amount||0);
    });
    return Object.values(months).sort((a,b)=>a.key.localeCompare(b.key)).slice(-6);
  },[invoices,bills]);

  const trendPct = (() => {
    if(monthlyTrend.length<2) return null;
    const prev = monthlyTrend[monthlyTrend.length-2].CA;
    const curr = monthlyTrend[monthlyTrend.length-1].CA;
    if(prev<=0) return null;
    return ((curr-prev)/prev*100).toFixed(1);
  })();

  const kpis = [
    {label:'Solde bancaire',val:0,sub:'À synchroniser',color:CIB_C.navy,trend:null},
    {label:'Factures en attente',val:pendingAmount,sub:invoices.filter(i=>['pending','sent','overdue'].includes(i.status||i.statut)).length+' facture(s)',color:'#27AE60',trend:null},
    {label:'Dépenses du mois',val:totalExpenses,sub:'30 derniers jours',color:CIB_C.orange,trend:null},
    {label:'Approvals → à payer',val:0,sub:'Demandes approuvées DG',color:'#8E44AD',trend:null},
  ];

  const TrendArrow = ({pct}) => {
    if(pct===null||pct===undefined) return null;
    const up = Number(pct)>=0;
    return (
      <span style={{display:'inline-flex',alignItems:'center',gap:3,fontSize:11,fontWeight:700,
        color:up?'#27AE60':CIB_C.red}}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{transform:up?'none':'rotate(180deg)'}}>
          <path d="M7 17l5-5 5 5M7 7l5 5 5-5" style={{display:'none'}}/>
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
        {Math.abs(pct)}%
      </span>
    );
  };

  return (
    <div style={{padding:16,display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
        {kpis.map((k,i)=>(
          <div key={i} style={{background:CIB_C.white,border:'1px solid '+CIB_C.border,borderRadius:10,padding:14,borderLeft:'3px solid '+k.color}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div style={{fontSize:11,color:CIB_C.text3,marginBottom:5}}>{k.label}</div>
              {i===1&&<TrendArrow pct={trendPct}/>}
            </div>
            <div style={{fontSize:20,fontWeight:600,color:CIB_C.text}}>{fM(k.val)}</div>
            <div style={{fontSize:11,color:CIB_C.text3,marginTop:3}}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:14}}>
        {/* Graphique trésorerie réel */}
        <div style={{background:CIB_C.white,border:'1px solid '+CIB_C.border,borderRadius:10,overflow:'hidden'}}>
          <div style={{padding:'14px 16px',borderBottom:'1px solid '+CIB_C.border,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:CIB_C.text}}>Revenus & Dépenses</div>
              <div style={{fontSize:11,color:CIB_C.text4}}>6 derniers mois</div>
            </div>
            {trendPct!==null && <TrendArrow pct={trendPct}/>}
          </div>
          <div style={{padding:'8px 10px 14px'}}>
            {monthlyTrend.length===0 ? (
              <div style={{height:180,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:CIB_C.text4,gap:6}}>
                <span style={{fontSize:13}}>Pas encore assez de données</span>
                <span style={{fontSize:11,textAlign:'center',maxWidth:240}}>Le graphique apparaîtra automatiquement dès les premières factures et dépenses enregistrées</span>
              </div>
            ) : AreaChart ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CIB_C.border}/>
                  <XAxis dataKey="mois" tick={{fontSize:10,fill:CIB_C.text3}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:9,fill:CIB_C.text3}} axisLine={false} tickLine={false} tickFormatter={v=>fN(v/1000000)+'M'}/>
                  <Tooltip formatter={v=>fM(v)}/>
                  <Area type="monotone" dataKey="CA" stroke={CIB_C.navy} fill={CIB_C.navy+'20'} strokeWidth={2} name="Revenus"/>
                  <Area type="monotone" dataKey="Dépenses" stroke={CIB_C.orange} fill={CIB_C.orange+'15'} strokeWidth={2} name="Dépenses"/>
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* P&L récapitulatif */}
        <div style={{background:CIB_C.white,border:'1px solid '+CIB_C.border,borderRadius:10,padding:14}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>P&L — {new Date().toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}</div>
          {[
            ['Revenus',    totalRevenue, totalRevenue>0?'100%':'0%','#27AE60'],
            ['Dépenses',   totalExpenses, totalRevenue>0?Math.min(100,(totalExpenses/totalRevenue*100)).toFixed(0)+'%':'0%',CIB_C.orange],
            ['Bénéfice net', netProfit, totalRevenue>0?Math.max(0,(netProfit/totalRevenue*100)).toFixed(0)+'%':'0%',CIB_C.navy],
          ].map(([l,v,w,color])=>(
            <div key={l} style={{marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:3}}>
                <span style={{color:CIB_C.text3}}>{l}</span>
                <span style={{fontWeight:500}}>{fM(v)}</span>
              </div>
              <div style={{height:5,background:CIB_C.bg,borderRadius:3}}>
                <div style={{width:w,height:'100%',background:color,borderRadius:3}}/>
              </div>
            </div>
          ))}
          <div style={{marginTop:10,paddingTop:8,borderTop:'1px solid '+CIB_C.border,display:'flex',justifyContent:'space-between'}}>
            <span style={{fontSize:11,color:CIB_C.text3}}>Marge nette</span>
            <span style={{fontSize:13,fontWeight:600,color:netProfit>=0?'#27AE60':CIB_C.orange}}>{margin}%</span>
          </div>
        </div>
      </div>

      {/* Factures récentes — déplacé sous le graphique, pleine largeur */}
      <div style={{background:CIB_C.white,border:'1px solid '+CIB_C.border,borderRadius:10,padding:14}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <span style={{fontSize:13,fontWeight:600}}>Factures récentes</span>
          <span style={{fontSize:11,color:CIB_C.navy,cursor:'pointer'}} onClick={()=>onTab('sales')}>Voir tout →</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {invoices.slice(0,4).map((inv,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px',background:CIB_C.bg,borderRadius:7}}>
              <div>
                <div style={{fontSize:12,fontWeight:500}}>{customers.find(c=>c.id===inv.customerId)?.name||inv.customer||'Client'}</div>
                <div style={{fontSize:10,color:CIB_C.text3}}>#{inv.id}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:12,fontWeight:500}}>{fM(inv.total||inv.amount||0)}</div>
                <span style={{fontSize:10,padding:'1px 6px',borderRadius:3,background:inv.status==='paid'?CIB_C.green_l:CIB_C.orange_l,color:inv.status==='paid'?CIB_C.green:CIB_C.orange}}>
                  {inv.status==='paid'?'Payée':'En attente'}
                </span>
              </div>
            </div>
          ))}
        </div>
        {invoices.length===0&&(
          <div style={{textAlign:'center',padding:20,color:CIB_C.text3,fontSize:12}}>
            Aucune facture — <span style={{color:CIB_C.navy,cursor:'pointer'}} onClick={()=>onTab('sales')}>Créer</span>
          </div>
        )}
      </div>
    </div>
  );
};

const PageJournal = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('');
  const [sel,     setSel]     = useState(null);

  useEffect(()=>{
    fetch("https://backend-cleanit-erp.vercel.app/api/cleanitbooks/journal",{headers:{"Authorization":"Bearer "+localStorage.getItem("token")}}).then(r=>r.json()).then(d=>{ setEntries(Array.isArray(d)?d:[]); setLoading(false); }).catch(()=>setLoading(false));
  },[]);

  const JOURNALS = ['VENTES','ACHATS','BANQUE','CAISSE','OD'];
  const filtered = entries.filter(e=>!filter||e.journal===filter||e.journalType===filter);

  const JOURNAL_COLORS = {VENTES:'#16a34a',ACHATS:'#ea580c',BANQUE:'#2563eb',CAISSE:'#7c3aed',OD:'#6b7280'};

  if(loading) return <div style={{padding:40,textAlign:'center',color:C.text4}}>Chargement du journal...</div>;

  return(
    <div>
      <CIBTopBar title="Journal des écritures" icon="📒" color="#2563eb">
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {JOURNALS.map(j=>(
            <button key={j} onClick={()=>setFilter(filter===j?'':j)}
              style={{padding:'5px 12px',borderRadius:20,border:`1px solid ${filter===j?JOURNAL_COLORS[j]:C.border}`,background:filter===j?JOURNAL_COLORS[j]+'20':'transparent',color:filter===j?JOURNAL_COLORS[j]:C.text3,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
              {j}
            </button>
          ))}
        </div>
      </CIBTopBar>
      <div style={{padding:'20px 24px'}}>
        {filtered.length===0&&(
          <div style={{background:C.white,borderRadius:12,padding:'60px',textAlign:'center',border:`1px solid ${C.border}`}}>
            <div style={{fontSize:48,marginBottom:12}}>📒</div>
            <div style={{fontSize:16,fontWeight:700,color:C.text}}>Journal vide</div>
            <div style={{fontSize:13,color:C.text3,marginTop:4}}>Les écritures sont générées automatiquement lors de la création de factures et paiements</div>
          </div>
        )}
        {filtered.map((e,i)=>(
          <div key={e.id} style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,marginBottom:10,overflow:'hidden',boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
            <div onClick={()=>setSel(sel===e.id?null:e.id)}
              style={{display:'flex',alignItems:'center',gap:14,padding:'12px 18px',cursor:'pointer',transition:'background .1s'}}
              onMouseEnter={e=>e.currentTarget.style.background=C.bg}
              onMouseLeave={e=>e.currentTarget.style.background='white'}>
              <div style={{width:80,textAlign:'center',padding:'4px 8px',borderRadius:8,background:JOURNAL_COLORS[e.journal]+'15',border:`1px solid ${JOURNAL_COLORS[e.journal]}30`}}>
                <div style={{fontSize:10,fontWeight:800,color:JOURNAL_COLORS[e.journal]}}>{e.journal}</div>
              </div>
              <div style={{width:130,fontFamily:'monospace',fontSize:12,color:C.text3}}>{e.numero}</div>
              <div style={{width:100,fontSize:12,color:C.text3}}>{e.date}</div>
              <div style={{flex:1,fontSize:13,fontWeight:600,color:C.text}}>{e.libelle}</div>
              <div style={{textAlign:'right',minWidth:120}}>
                <div style={{fontSize:13,fontWeight:700,color:C.blue}}>{fN(e.totalDebit)} FCFA</div>
                <div style={{fontSize:10,color:C.text4}}>Débit = Crédit</div>
              </div>
              <div style={{fontSize:16,color:C.text4}}>{sel===e.id?'▲':'▼'}</div>
            </div>
            {sel===e.id&&(
              <div style={{borderTop:`1px solid ${C.border}`,padding:'0 18px 14px'}}>
                <table style={{width:'100%',borderCollapse:'collapse',marginTop:10}}>
                  <thead>
                    <tr style={{background:QB.bg}}>
                      {['Compte','Libellé','Tiers','Débit','Crédit','Lettrage'].map(h=>(
                        <th key={h} style={{padding:'8px 10px',textAlign:'left',fontSize:10,fontWeight:800,color:C.text3,textTransform:'uppercase',letterSpacing:.4}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(e.lines||[]).map((l,i)=>(
                      <tr key={i} style={{borderTop:`1px solid ${C.border2}`}}>
                        <td style={{padding:'8px 10px',fontFamily:'monospace',fontSize:12,fontWeight:700,color:C.blue}}>{l.accountCode}</td>
                        <td style={{padding:'8px 10px',fontSize:12,color:C.text2}}>{l.accountNom}</td>
                        <td style={{padding:'8px 10px',fontSize:11,color:C.text3}}>{l.tiers||'—'}</td>
                        <td style={{padding:'8px 10px',fontSize:12,fontWeight:700,color:l.debit>0?C.green:C.text4,textAlign:'right'}}>{l.debit>0?fN(l.debit):'—'}</td>
                        <td style={{padding:'8px 10px',fontSize:12,fontWeight:700,color:l.credit>0?C.red:C.text4,textAlign:'right'}}>{l.credit>0?fN(l.credit):'—'}</td>
                        <td style={{padding:'8px 10px',fontSize:10,color:C.purple,fontFamily:'monospace'}}>{l.lettrage||'—'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{background:QB.bg,borderTop:`2px solid ${C.border}`}}>
                      <td colSpan={3} style={{padding:'8px 10px',fontSize:11,fontWeight:700,color:C.text3}}>TOTAL</td>
                      <td style={{padding:'8px 10px',fontSize:13,fontWeight:800,color:C.green,textAlign:'right'}}>{fN(e.totalDebit)}</td>
                      <td style={{padding:'8px 10px',fontSize:13,fontWeight:800,color:C.red,textAlign:'right'}}>{fN(e.totalCredit)}</td>
                      <td/>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── PAGE PLAN COMPTABLE ────────────────────────────────────────────
const PagePlanComptable = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [classe,   setClasse]   = useState('');
  const [init,     setInit]     = useState(false);

  useEffect(()=>{
    getBalance().then(d=>{ setAccounts(Array.isArray(d)?d:[]); setLoading(false); });
  },[]);

  const initPlan = async () => {
    setInit(true);
    await Promise.resolve();
    const d = await getBalance();
    setAccounts(Array.isArray(d)?d:[]);
    setInit(false);
  };

  const CLASSES = ['1','2','3','4','5','6','7','8','9'];
  const CLASS_NAMES = {'1':'Ressources durables','2':'Actif immobilisé','3':'Stocks','4':'Tiers','5':'Trésorerie','6':'Charges','7':'Produits','8':'Comptes spéciaux','9':'Analytique'};
  const TYPE_COLORS = {actif:'#2563eb',passif:'#ea580c',charge:'#dc2626',produit:'#16a34a',tresorerie:'#7c3aed'};

  const filtered = accounts.filter(a=>
    (!classe||a.classe===classe)&&
    (!search||(a.code+a.nom).toLowerCase().includes(search.toLowerCase()))
  );

  if(loading) return <div style={{padding:40,textAlign:'center',color:C.text4}}>Chargement...</div>;

  return(
    <div>
      <CIBTopBar title="Plan comptable SYSCOHADA" icon="📋" color="#7c3aed">
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
            style={{padding:'6px 12px',borderRadius:8,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit',width:180}}/>
          {accounts.length===0&&(
            <button onClick={initPlan} disabled={init}
              style={{padding:'7px 16px',borderRadius:8,border:'none',background:'#7c3aed',color:'white',fontWeight:700,fontSize:12,cursor:'pointer'}}>
              {init?'Initialisation...':'⚡ Initialiser SYSCOHADA'}
            </button>
          )}
        </div>
      </CIBTopBar>
      <div style={{padding:'20px 24px'}}>
        {/* Filtres classes */}
        <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
          <button onClick={()=>setClasse('')}
            style={{padding:'5px 12px',borderRadius:20,border:`1px solid ${!classe?'#7c3aed':C.border}`,background:!classe?'#7c3aed20':'transparent',color:!classe?'#7c3aed':C.text3,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
            Toutes
          </button>
          {CLASSES.map(cl=>(
            <button key={cl} onClick={()=>setClasse(classe===cl?'':cl)}
              style={{padding:'5px 12px',borderRadius:20,border:`1px solid ${classe===cl?'#7c3aed':C.border}`,background:classe===cl?'#7c3aed20':'transparent',color:classe===cl?'#7c3aed':C.text3,fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>
              Cl. {cl} — {CLASS_NAMES[cl]}
            </button>
          ))}
        </div>

        <div style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,overflow:'hidden',boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
          <div style={{display:'grid',gridTemplateColumns:'120px 1fr 80px 80px 130px 130px',gap:0,padding:'10px 16px',background:QB.bg,borderBottom:`2px solid ${C.border}`,fontSize:10,fontWeight:800,color:C.text3,textTransform:'uppercase',letterSpacing:.4}}>
            <span>Code</span><span>Intitulé</span><span>Classe</span><span>Type</span><span>Solde Débit</span><span>Solde Crédit</span>
          </div>
          {filtered.length===0&&<div style={{padding:'40px',textAlign:'center',color:C.text4}}>
            {accounts.length===0?'Plan comptable non initialisé — Cliquez sur "Initialiser SYSCOHADA"':'Aucun compte'}
          </div>}
          {filtered.map((a,i)=>(
            <div key={a.id} style={{display:'grid',gridTemplateColumns:'120px 1fr 80px 80px 130px 130px',gap:0,padding:'10px 16px',borderBottom:`1px solid ${C.border2}`,background:i%2===0?C.white:'#fafafa',alignItems:'center'}}>
              <span style={{fontFamily:'monospace',fontSize:12,fontWeight:700,color:'#7c3aed'}}>{a.code}</span>
              <span style={{fontSize:12,color:C.text}}>{a.nom}</span>
              <span style={{fontSize:11,color:C.text3}}>Classe {a.classe}</span>
              <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:10,background:TYPE_COLORS[a.type]+'15',color:TYPE_COLORS[a.type]}}>{a.type}</span>
              <span style={{fontSize:12,fontWeight:700,color:Number(a.soldeDebit)>0?C.green:C.text4,textAlign:'right'}}>{Number(a.soldeDebit)>0?fN(a.soldeDebit):'—'}</span>
              <span style={{fontSize:12,fontWeight:700,color:Number(a.soldeCredit)>0?C.red:C.text4,textAlign:'right'}}>{Number(a.soldeCredit)>0?fN(a.soldeCredit):'—'}</span>
            </div>
          ))}
          <div style={{padding:'10px 16px',background:QB.bg,borderTop:`2px solid ${C.border}`,fontSize:11,color:C.text3}}>
            {filtered.length} comptes · Plan comptable SYSCOHADA révisé
          </div>
        </div>
      </div>
    </div>
  );
};

// ── PAGE BALANCE GÉNÉRALE ──────────────────────────────────────────
const PageBalance = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    getBalance().then(d=>{ setBalance(d); setLoading(false); });
  },[]);

  if(loading) return <div style={{padding:40,textAlign:'center',color:C.text4}}>Calcul de la balance...</div>;
  if(!balance) return <div style={{padding:40,textAlign:'center',color:C.text4}}>Aucune donnée</div>;

  const nonZero = (balance.rows||[]).filter(r=>r.debit>0||r.credit>0);

  return(
    <div>
      <CIBTopBar title="Balance générale" icon="⚖️" color="#0891b2">
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{padding:'5px 14px',borderRadius:20,background:balance.equilibre?C.green_l:C.red_l,color:balance.equilibre?C.green:C.red,fontSize:12,fontWeight:700}}>
            {balance.equilibre?'✅ Balance équilibrée':'⚠️ Balance déséquilibrée'}
          </div>
          <button onClick={()=>window.print()} style={{padding:'7px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:C.white,color:C.text2,fontSize:12,cursor:'pointer',fontWeight:600}}>
            🖨 Imprimer
          </button>
        </div>
      </CIBTopBar>
      <div style={{padding:'20px 24px'}}>
        {/* KPIs */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
          {[
            {l:'Total Débit',   v:fN(balance.totalDebit)+' FCFA',   c:'#16a34a', bg:'#f0fdf4'},
            {l:'Total Crédit',  v:fN(balance.totalCredit)+' FCFA',  c:'#dc2626', bg:'#fef2f2'},
            {l:'Écart',         v:fN(Math.abs(balance.totalDebit-balance.totalCredit))+' FCFA', c:balance.equilibre?'#16a34a':'#dc2626', bg:balance.equilibre?'#f0fdf4':'#fef2f2'},
          ].map(k=>(
            <div key={k.l} style={{background:k.bg,borderRadius:12,padding:'16px 20px',border:`1px solid ${k.c}20`}}>
              <div style={{fontSize:11,color:C.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:6}}>{k.l}</div>
              <div style={{fontSize:22,fontWeight:900,color:k.c}}>{k.v}</div>
            </div>
          ))}
        </div>

        <div style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,overflow:'hidden',boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
          <div style={{display:'grid',gridTemplateColumns:'100px 1fr 80px 130px 130px 130px',padding:'10px 16px',background:QB.bg,borderBottom:`2px solid ${C.border}`,fontSize:10,fontWeight:800,color:C.text3,textTransform:'uppercase',letterSpacing:.4}}>
            <span>Code</span><span>Intitulé</span><span>Classe</span><span>Débit</span><span>Crédit</span><span>Solde</span>
          </div>
          {nonZero.length===0&&<div style={{padding:'40px',textAlign:'center',color:C.text4}}>Aucune écriture enregistrée</div>}
          {nonZero.map((r,i)=>(
            <div key={r.code} style={{display:'grid',gridTemplateColumns:'100px 1fr 80px 130px 130px 130px',padding:'9px 16px',borderBottom:`1px solid ${C.border2}`,background:i%2===0?C.white:'#fafafa',alignItems:'center'}}>
              <span style={{fontFamily:'monospace',fontSize:11,fontWeight:700,color:'#7c3aed'}}>{r.code}</span>
              <span style={{fontSize:12,color:C.text}}>{r.nom}</span>
              <span style={{fontSize:11,color:C.text3}}>{r.classe}</span>
              <span style={{fontSize:12,fontWeight:700,color:C.green,textAlign:'right'}}>{fN(r.debit)}</span>
              <span style={{fontSize:12,fontWeight:700,color:C.red,textAlign:'right'}}>{fN(r.credit)}</span>
              <span style={{fontSize:12,fontWeight:800,color:r.solde>=0?C.blue:C.red,textAlign:'right'}}>{fN(Math.abs(r.solde))}</span>
            </div>
          ))}
          <div style={{display:'grid',gridTemplateColumns:'100px 1fr 80px 130px 130px 130px',padding:'12px 16px',background:'#0f172a',fontSize:12,fontWeight:800,color:'white'}}>
            <span colSpan={3}>TOTAUX</span><span/><span/>
            <span style={{color:'#86efac',textAlign:'right'}}>{fN(balance.totalDebit)}</span>
            <span style={{color:'#fca5a5',textAlign:'right'}}>{fN(balance.totalCredit)}</span>
            <span style={{color:balance.equilibre?'#86efac':'#fca5a5',textAlign:'right'}}>{balance.equilibre?'ÉQUILIBRÉ':'ÉCART'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── PAGE P&L ───────────────────────────────────────────────────────
const PagePL = () => {
  const [pl,      setPL]      = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    getPL().then(d=>{ setPL(d); setLoading(false); });
  },[]);

  if(loading) return <div style={{padding:40,textAlign:'center',color:C.text4}}>Calcul du P&L...</div>;
  if(!pl) return <div style={{padding:40,textAlign:'center',color:C.text4}}>Aucune donnée</div>;

  const marge = pl.totalProduits>0 ? Math.round(pl.resultat/pl.totalProduits*100) : 0;

  return(
    <div>
      <CIBTopBar title="Compte de résultat" icon="📊" color="#16a34a">
        <button onClick={()=>window.print()} style={{padding:'7px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:C.white,color:C.text2,fontSize:12,cursor:'pointer',fontWeight:600}}>
          🖨 Imprimer
        </button>
      </CIBTopBar>
      <div style={{padding:'20px 24px'}}>
        {/* KPIs */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
          {[
            {l:'Total Produits', v:fN(pl.totalProduits)+' FCFA', c:'#16a34a', bg:'#f0fdf4'},
            {l:'Total Charges',  v:fN(pl.totalCharges)+' FCFA',  c:'#dc2626', bg:'#fef2f2'},
            {l:'Résultat net',   v:fN(pl.resultat)+' FCFA',      c:pl.beneficiaire?'#16a34a':'#dc2626', bg:pl.beneficiaire?'#f0fdf4':'#fef2f2'},
            {l:'Marge nette',    v:marge+'%',                     c:marge>20?'#16a34a':marge>0?'#d97706':'#dc2626', bg:'#f8fafc'},
          ].map(k=>(
            <div key={k.l} style={{background:k.bg,borderRadius:12,padding:'16px 20px',border:`1px solid ${k.c}20`}}>
              <div style={{fontSize:11,color:C.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:6}}>{k.l}</div>
              <div style={{fontSize:22,fontWeight:900,color:k.c}}>{k.v}</div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          {/* Produits */}
          <div style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,overflow:'hidden',boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
            <div style={{padding:'14px 18px',background:'#f0fdf4',borderBottom:`1px solid #bbf7d0`,display:'flex',justifyContent:'space-between'}}>
              <span style={{fontSize:14,fontWeight:800,color:'#16a34a'}}>PRODUITS</span>
              <span style={{fontSize:14,fontWeight:900,color:'#16a34a'}}>{fN(pl.totalProduits)} FCFA</span>
            </div>
            {(pl.produits||[]).filter(p=>p.montant>0).map((p,i)=>(
              <div key={p.code} style={{display:'flex',justifyContent:'space-between',padding:'10px 18px',borderBottom:`1px solid ${C.border2}`,background:i%2===0?C.white:'#fafafa'}}>
                <div>
                  <div style={{fontSize:11,fontFamily:'monospace',color:'#7c3aed'}}>{p.code}</div>
                  <div style={{fontSize:12,color:C.text2}}>{p.nom}</div>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:'#16a34a'}}>{fN(p.montant)}</div>
              </div>
            ))}
          </div>

          {/* Charges */}
          <div style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,overflow:'hidden',boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
            <div style={{padding:'14px 18px',background:'#fef2f2',borderBottom:`1px solid #fecaca`,display:'flex',justifyContent:'space-between'}}>
              <span style={{fontSize:14,fontWeight:800,color:'#dc2626'}}>CHARGES</span>
              <span style={{fontSize:14,fontWeight:900,color:'#dc2626'}}>{fN(pl.totalCharges)} FCFA</span>
            </div>
            {(pl.charges||[]).filter(p=>p.montant>0).map((p,i)=>(
              <div key={p.code} style={{display:'flex',justifyContent:'space-between',padding:'10px 18px',borderBottom:`1px solid ${C.border2}`,background:i%2===0?C.white:'#fafafa'}}>
                <div>
                  <div style={{fontSize:11,fontFamily:'monospace',color:'#7c3aed'}}>{p.code}</div>
                  <div style={{fontSize:12,color:C.text2}}>{p.nom}</div>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:'#dc2626'}}>{fN(p.montant)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Résultat */}
        <div style={{marginTop:20,padding:'20px 24px',borderRadius:12,background:pl.beneficiaire?'linear-gradient(135deg,#f0fdf4,#dcfce7)':'linear-gradient(135deg,#fef2f2,#fee2e2)',border:`2px solid ${pl.beneficiaire?'#16a34a':'#dc2626'}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:pl.beneficiaire?'#16a34a':'#dc2626'}}>
              {pl.beneficiaire?'✅ BÉNÉFICE NET':'❌ PERTE NETTE'}
            </div>
            <div style={{fontSize:11,color:C.text3,marginTop:2}}>Produits {fN(pl.totalProduits)} — Charges {fN(pl.totalCharges)}</div>
          </div>
          <div style={{fontSize:32,fontWeight:900,color:pl.beneficiaire?'#16a34a':'#dc2626'}}>
            {fN(pl.resultat)} FCFA
          </div>
        </div>
      </div>
    </div>
  );
};


// ── PAGE ANALYTICS ─────────────────────────────────────────────────────
const PageAnalytics = ({invoices=[],bills=[],customers=[],jobs=[]}) => {
  // recharts importé en haut du fichier
  const [plData,setPlData]=useState(null);

  useEffect(()=>{ getPL().then(d=>setPlData(d)).catch(()=>{}); },[]);

  const COLORS=['#0052CC','#E05C5C','#006644','#974F0C','#403294'];

  // CA par mois depuis les factures
  const moisLabel=['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  const monthlyData = useMemo(()=>{
    const months={};
    (invoices||[]).forEach(inv=>{
      const m=inv.date?.slice(0,7)||inv.dueDate?.slice(0,7);
      if(!m) return;
      const label=moisLabel[parseInt(m.split('-')[1])-1];
      if(!months[m]) months[m]={mois:label,CA:0,Dépenses:0};
      months[m].CA+=Number(inv.total||0);
    });
    (bills||[]).forEach(b=>{
      const m=b.date?.slice(0,7)||b.dueDate?.slice(0,7);
      if(!m) return;
      const label=moisLabel[parseInt(m.split('-')[1])-1];
      if(!months[m]) months[m]={mois:label,CA:0,Dépenses:0};
      months[m].Dépenses+=Number(b.total||0);
    });
    const rows=Object.values(months).sort((a,b)=>a.mois.localeCompare(b.mois)).slice(-6);
    return rows;
  },[invoices,bills]);

  // CA par client
  const clientData = useMemo(()=>{
    const byC={};
    (invoices||[]).forEach(inv=>{
      const cust=(customers||[]).find(c=>c.id===inv.customerId);
      const name=cust?cust.company||cust.name:'Autre';
      byC[name]=(byC[name]||0)+Number(inv.total||0);
    });
    const total=Object.values(byC).reduce((s,v)=>s+v,0)||1;
    const rows=Object.entries(byC).sort((a,b)=>b[1]-a[1]).slice(0,4);
    return rows.map(([name,val])=>({name,value:val,pct:Math.round(val/total*100)}));
  },[invoices,customers]);

  // Ratios financiers
  const totalCA=monthlyData.reduce((s,m)=>s+m.CA,0);
  const totalDep=monthlyData.reduce((s,m)=>s+m.Dépenses,0);
  const marge=totalCA>0?Math.round((totalCA-totalDep)/totalCA*100):0;

  const CustomTooltip=({active,payload,label})=>{
    if(!active||!payload?.length) return null;
    return <div style={{background:'#fff',border:'1px solid '+C.border,borderRadius:8,boxShadow:'0 1px 3px rgba(0,0,0,0.08)',padding:'10px 14px',boxShadow:"0 1px 3px rgba(0,0,0,0.08)",fontSize:11}}>
      <div style={{fontWeight:700,color:C.text,marginBottom:4}}>{label}</div>
      {payload.map((p,i)=><div key={i} style={{display:'flex',gap:6,alignItems:'center',marginBottom:2}}><div style={{width:7,height:7,borderRadius:'50%',background:p.color}}/><span style={{color:C.text3}}>{p.name}:</span><span style={{fontWeight:700}}>{fN(p.value)} F</span></div>)}
    </div>;
  };

  return (
    <div style={{padding:'24px',background:'#F4F5F7',minHeight:'100vh'}}>
      <CIBTopBar title="Analytics — Analyse financière" icon="📊" color={C.blue}/>

      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:24}}>
        {[
          {l:'CA Total (6 mois)',v:fN(totalCA)+' F',c:C.blue,icon:'📈'},
          {l:'Dépenses (6 mois)',v:fN(totalDep)+' F',c:C.red,icon:'📉'},
          {l:'Marge Brute',v:marge+'%',c:marge>30?C.green:C.orange,icon:'💹'},
          {l:'Résultat Net',v:(plData?fN(plData.resultat):fN(totalCA-totalDep))+' F',c:C.green,icon:'🏆'},
        ].map((k,i)=>(
          <div key={i} style={{background:C.white,borderRadius:12,padding:'18px 20px',border:'1px solid '+C.border,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <span style={{fontSize:20}}>{k.icon}</span>
              <div style={{height:3,flex:1,marginLeft:10,borderRadius:2,background:k.c+'30'}}><div style={{height:'100%',width:'70%',background:k.c,borderRadius:2}}/></div>
            </div>
            <div style={{fontSize:20,fontWeight:800,color:k.c,marginBottom:3}}>{k.v}</div>
            <div style={{fontSize:11,color:C.text3,fontWeight:600}}>{k.l}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginBottom:16}}>
        {/* Évolution CA & Dépenses */}
        <div style={{background:C.white,borderRadius:12,border:'1px solid '+C.border,boxShadow:"0 1px 3px rgba(0,0,0,0.08)",overflow:'hidden'}}>
          <div style={{padding:'14px 18px',borderBottom:'1px solid '+C.border2}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>Évolution CA & Dépenses — 6 mois</div>
            <div style={{fontSize:11,color:C.text4}}>Tendance mensuelle</div>
          </div>
          <div style={{padding:'8px 10px 16px'}}>
            {monthlyData.length===0 ? (
              <div style={{height:220,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:C.text4,gap:6}}>
                <span style={{fontSize:13}}>Pas encore assez de données</span>
                <span style={{fontSize:11}}>Le graphique apparaîtra dès les premières factures et dépenses enregistrées</span>
              </div>
            ) : AreaChart ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border2}/>
                  <XAxis dataKey="mois" tick={{fontSize:10,fill:C.text3}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:9,fill:C.text3}} axisLine={false} tickLine={false} tickFormatter={v=>fN(v/1000000)+'M'}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Legend wrapperStyle={{fontSize:11}}/>
                  <Area type="monotone" dataKey="CA" stroke={C.blue} fill={C.blue+'20'} strokeWidth={2} name="CA"/>
                  <Area type="monotone" dataKey="Dépenses" stroke={C.red} fill={C.red+'15'} strokeWidth={2} name="Dépenses"/>
                </AreaChart>
              </ResponsiveContainer>
            ) : <div style={{height:220,display:'flex',alignItems:'center',justifyContent:'center',color:C.text4}}>Chargement graphique...</div>}
          </div>
        </div>

        {/* CA par client */}
        <div style={{background:C.white,borderRadius:12,border:'1px solid '+C.border,boxShadow:"0 1px 3px rgba(0,0,0,0.08)",overflow:'hidden'}}>
          <div style={{padding:'14px 18px',borderBottom:'1px solid '+C.border2}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>Répartition CA par Client</div>
            <div style={{fontSize:11,color:C.text4}}>Concentration des revenus</div>
          </div>
          <div style={{padding:'12px 16px'}}>
            {clientData.length===0 ? (
              <div style={{padding:'30px 10px',textAlign:'center',color:C.text4,fontSize:12}}>
                Aucune facture client enregistrée pour l'instant
              </div>
            ) : (
              <>
                {PieChart && (
                  <ResponsiveContainer width="100%" height={130}>
                    <PieChart>
                      <Pie data={clientData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value">
                        {clientData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                      </Pie>
                      <Tooltip formatter={v=>fN(v)+' F'}/>
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {clientData.map((d,i)=>(
                  <div key={i} style={{marginBottom:8}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:3}}>
                      <span style={{fontWeight:700,color:C.text}}>{d.name}</span>
                      <span style={{color:COLORS[i%COLORS.length],fontWeight:700}}>{d.pct}%</span>
                    </div>
                    <div style={{height:5,borderRadius:3,background:'#F4F5F7',overflow:'hidden'}}>
                      <div style={{width:d.pct+'%',height:'100%',background:COLORS[i%COLORS.length],borderRadius:3}}/>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Ratios financiers */}
      <div style={{background:C.white,borderRadius:12,border:'1px solid '+C.border,boxShadow:"0 1px 3px rgba(0,0,0,0.08)",padding:'18px 20px'}}>
        <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>Ratios Financiers Clés</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12}}>
          {[
            {l:'Marge brute',v:marge+'%',note:marge>30?'✅ Bon':'⚠️ Faible',c:marge>30?C.green:C.orange},
            {l:'Taux charges',v:totalCA>0?Math.round(totalDep/totalCA*100)+'%':'—',note:'Coût/CA',c:C.blue},
            {l:'CA moyen/mois',v:fN(Math.round(totalCA/6))+' F',note:'6 derniers mois',c:C.purple||'#7c3aed'},
            {l:'Top client',v:clientData[0]?.pct+'%',note:clientData[0]?.name||'—',c:clientData[0]?.pct>60?C.orange:C.green},
            {l:'Jobs actifs',v:String((jobs||[]).filter(j=>j.statut==='En cours').length||4),note:'En cours',c:"#00626E"||'#0f766e'},
          ].map((r,i)=>(
            <div key={i} style={{background:'#F4F5F7',borderRadius:8,padding:'14px',textAlign:'center',border:'1px solid '+C.border2}}>
              <div style={{fontSize:20,fontWeight:800,color:r.c,marginBottom:3}}>{r.v}</div>
              <div style={{fontSize:11,fontWeight:600,color:C.text2,marginBottom:2}}>{r.l}</div>
              <div style={{fontSize:10,color:C.text3}}>{r.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


// ── PAGE AVOIRS / NOTES DE CRÉDIT ─────────────────────────────
const PageAvoir = ({invoices=[], customers=[], setInvoices}) => {
  const [avoirs, setAvoirs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({invoiceRef:'', reason:'', amount:0, customerId:''});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      setAvoirs((invoices||[]).filter(i => i.type === 'credit_note' || i.creditNote));
    } catch(e) {}
  }, [invoices]);

  const createAvoir = async () => {
    if(!form.invoiceRef || !form.amount) { alert('Référence facture et montant requis'); return; }
    setLoading(true);
    const origInv = (invoices||[]).find(i => i.ref === form.invoiceRef || String(i.id) === form.invoiceRef);
    const newAvoirDto = {
      ref: 'AV-' + Date.now().toString().slice(-6),
      type: 'credit_note', creditNote: true,
      originalRef: form.invoiceRef,
      customerId: origInv?.customerId || form.customerId,
      date: new Date().toISOString().slice(0,10),
      dueDate: new Date().toISOString().slice(0,10),
      total: -Math.abs(Number(form.amount)),
      balance: -Math.abs(Number(form.amount)),
      status: 'Open',
      reason: form.reason,
      lines: [{description: 'Avoir — ' + (form.reason||'Note de crédit'), qty:1, unitPrice:-Math.abs(Number(form.amount)), total:-Math.abs(Number(form.amount))}],
    };
    try {
      const api = await import('../services/cleanitbooks.api');
      const saved = await api.createInvoice(newAvoirDto);
      const persisted = saved?.id ? {...newAvoirDto, id: saved.id} : newAvoirDto;
      if(setInvoices) setInvoices(p => [persisted, ...p]);
      setAvoirs(p => [persisted, ...p]);
      setForm({invoiceRef:'', reason:'', amount:0, customerId:''});
      setShowForm(false);
    } catch(e) {
      alert('Erreur lors de la création de l\'avoir : '+e.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <CIBTopBar title="Avoirs — Notes de crédit" icon="↩" color={C.orange}>
        <div style={{display:'flex',gap:8}}>
          <button onClick={() => exportXLSX(avoirs.map(a=>({ref:a.ref,date:a.date,montant:a.total,raison:a.reason||'—',statut:a.status})),
            [{key:'ref',label:'Référence'},{key:'date',label:'Date'},{key:'montant',label:'Montant'},{key:'raison',label:'Raison'},{key:'statut',label:'Statut'}],
            'Avoirs_CleanIT')} style={{padding:'7px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:C.white,color:C.text2,fontSize:12,cursor:'pointer',fontWeight:600}}>
            📥 Exporter Excel
          </button>
          <button onClick={()=>setShowForm(true)} style={{padding:'7px 14px',borderRadius:8,border:'none',background:C.blue,color:'#fff',fontSize:12,cursor:'pointer',fontWeight:700}}>
            + Créer un avoir
          </button>
        </div>
      </CIBTopBar>

      {showForm && (
        <div style={{padding:'20px 24px',background:C.blue_l,border:`1px solid ${"#BFDBFE"}`,borderRadius:10,margin:'16px 24px'}}>
          <div style={{fontSize:14,fontWeight:700,color:C.blue,marginBottom:14}}>Nouvel avoir / Note de crédit</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:12}}>
            <div>
              <label style={{fontSize:11,color:C.text3,display:'block',marginBottom:4}}>Référence facture originale *</label>
              <input value={form.invoiceRef} onChange={e=>setForm({...form,invoiceRef:e.target.value})}
                placeholder="ex: INV-001" style={{width:'100%',padding:'8px 10px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:13,outline:'none',boxSizing:'border-box'}}/>
            </div>
            <div>
              <label style={{fontSize:11,color:C.text3,display:'block',marginBottom:4}}>Montant de l'avoir (FCFA) *</label>
              <input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}
                placeholder="0" style={{width:'100%',padding:'8px 10px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:13,outline:'none',boxSizing:'border-box'}}/>
            </div>
            <div>
              <label style={{fontSize:11,color:C.text3,display:'block',marginBottom:4}}>Motif de l'avoir</label>
              <input value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})}
                placeholder="Retour marchandise, erreur..." style={{width:'100%',padding:'8px 10px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:13,outline:'none',boxSizing:'border-box'}}/>
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={createAvoir} disabled={loading} style={{padding:'8px 20px',borderRadius:6,border:'none',background:C.blue,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer'}}>
              {loading?'Création...':"Créer l'avoir"}
            </button>
            <button onClick={()=>setShowForm(false)} style={{padding:'8px 20px',borderRadius:6,border:`1px solid ${C.border}`,background:C.white,color:C.text2,fontSize:13,cursor:'pointer'}}>
              Annuler
            </button>
          </div>
        </div>
      )}

      <div style={{padding:'16px 24px'}}>
        {avoirs.length === 0 ? (
          <div style={{textAlign:'center',padding:'60px 20px',color:C.text4}}>
            <div style={{fontSize:40,marginBottom:12}}>↩</div>
            <div style={{fontSize:15,fontWeight:600,marginBottom:6}}>Aucun avoir enregistré</div>
            <div style={{fontSize:13}}>Créez un avoir pour annuler ou corriger une facture</div>
          </div>
        ) : (
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#F4F5F7',borderBottom:`2px solid ${C.border}`}}>
                {['Référence','Facture originale','Date','Montant','Motif','Statut'].map(h=>(
                  <th key={h} style={{padding:'10px 12px',textAlign:'left',fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:.5}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {avoirs.map((a,i)=>(
                <tr key={a.id} style={{borderBottom:`1px solid ${C.border2}`,background:i%2===0?C.white:'#fafafa'}}>
                  <td style={{padding:'10px 12px',fontWeight:700,color:C.orange,fontFamily:'monospace',fontSize:12}}>{a.ref}</td>
                  <td style={{padding:'10px 12px',fontSize:12,color:C.blue}}>{a.originalRef||'—'}</td>
                  <td style={{padding:'10px 12px',fontSize:12,color:C.text2}}>{a.date||'—'}</td>
                  <td style={{padding:'10px 12px',fontWeight:700,color:C.red,fontSize:13}}>{fN(a.total)} F</td>
                  <td style={{padding:'10px 12px',fontSize:12,color:C.text3,fontStyle:'italic'}}>{a.reason||'—'}</td>
                  <td style={{padding:'10px 12px'}}><span style={{padding:'3px 10px',borderRadius:10,background:C.orange_l,color:C.orange,fontSize:11,fontWeight:700}}>{a.status||'Émis'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};


const PageTimeTracking = () => (
  <div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>
    <div style={{fontSize:40,marginBottom:12}}>⏱</div>
    <div style={{fontSize:16,fontWeight:700,marginBottom:6,color:"#374151"}}>Suivi des heures</div>
    <div style={{fontSize:13}}>Module en cours de développement</div>
  </div>
);


// ── PAGE RAPPROCHEMENT BANCAIRE ────────────────────────────────
const PageReconciliation = ({invoices=[], bills=[]}) => {
  const [bankTx, setBankTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('https://backend-cleanit-erp.vercel.app/journal', {headers:{'Authorization':'Bearer '+token}})
      .then(r=>r.json())
      .then(data => {
        if(Array.isArray(data)) {
          setBankTx(data.map(t => ({
            id: t.id, date: t.date,
            desc: t.description||t.label||'—',
            amount: (t.credit||0) - (t.debit||0),
            matched: !!t.reconciled,
            type: (t.credit||0) > (t.debit||0) ? 'credit' : 'debit',
          })));
        }
        setLoading(false);
      }).catch(()=>setLoading(false));
  }, []);

  const matched = bankTx.filter(t=>t.matched).length;
  const unmatched = bankTx.filter(t=>!t.matched).length;
  const matchTx = id => setBankTx(p=>p.map(t=>t.id===id?{...t,matched:!t.matched}:t));

  return (
    <div>
      <CIBTopBar title="Rapprochement bancaire" icon="bank" color={C.blue}>
        <button onClick={()=>exportXLSX(bankTx,[
          {key:'date',label:'Date'},{key:'desc',label:'Description'},
          {key:'amount',label:'Montant'},{key:'matched',label:'Rapproché'}
        ],'Rapprochement')} style={{padding:'7px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:C.white,color:C.text2,fontSize:12,cursor:'pointer',fontWeight:600}}>
          📥 Exporter
        </button>
      </CIBTopBar>
      <div style={{padding:'16px 24px'}}>
        {loading ? (
          <div style={{textAlign:'center',padding:60,color:C.text3}}>Chargement des transactions...</div>
        ) : bankTx.length===0 ? (
          <div style={{textAlign:'center',padding:60,color:C.text3,background:C.white,borderRadius:10,border:`1px solid ${C.border}`}}>
            Aucune transaction bancaire enregistrée pour l'instant.
          </div>
        ) : (
        <>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
          {[
            {l:'Transactions',v:bankTx.length,c:C.blue},
            {l:'Rapprochées',v:matched,c:C.green},
            {l:'Non rapprochées',v:unmatched,c:C.orange},
            {l:'Taux',v:Math.round(matched/bankTx.length*100)+'%',c:matched===bankTx.length?C.green:C.red},
          ].map((k,i)=>(
            <div key={i} style={{background:C.white,borderRadius:10,padding:'14px 16px',border:`1px solid ${C.border}`,textAlign:'center'}}>
              <div style={{fontSize:22,fontWeight:800,color:k.c}}>{k.v}</div>
              <div style={{fontSize:11,color:C.text3,marginTop:2}}>{k.l}</div>
            </div>
          ))}
        </div>
        <div style={{background:C.white,borderRadius:10,border:`1px solid ${C.border}`,overflow:'hidden'}}>
          <div style={{padding:'12px 16px',borderBottom:`1px solid ${C.border2}`,fontWeight:700,fontSize:13,color:C.text}}>
            Transactions bancaires — BICEC Compte courant
          </div>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#F4F5F7'}}>
                {['Date','Description','Montant','Statut','Action'].map(h=>(
                  <th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:.5}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bankTx.map((tx,i)=>(
                <tr key={tx.id} style={{borderBottom:`1px solid ${C.border2}`,background:tx.matched?C.green_l:'inherit'}}>
                  <td style={{padding:'10px 14px',fontSize:12,color:C.text3}}>{tx.date}</td>
                  <td style={{padding:'10px 14px',fontSize:13,color:C.text,fontWeight:500}}>{tx.desc}</td>
                  <td style={{padding:'10px 14px',fontSize:13,fontWeight:700,color:tx.type==='credit'?C.green:C.red}}>
                    {tx.type==='credit'?'+':''}{fN(tx.amount)} F
                  </td>
                  <td style={{padding:'10px 14px'}}>
                    <span style={{padding:'3px 10px',borderRadius:10,fontSize:11,fontWeight:700,
                      background:tx.matched?C.green_l:C.orange_l,color:tx.matched?C.green:C.orange}}>
                      {tx.matched?'✓ Rapproché':'En attente'}
                    </span>
                  </td>
                  <td style={{padding:'10px 14px'}}>
                    <button onClick={()=>matchTx(tx.id)} style={{padding:'5px 12px',borderRadius:6,border:`1px solid ${tx.matched?C.red:C.green}`,
                      background:'none',color:tx.matched?C.red:C.green,fontSize:11,cursor:'pointer',fontWeight:600}}>
                      {tx.matched?'Annuler':'Rapprocher'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

// ── PAGE IMPORT CSV BANCAIRE ────────────────────────────────────
const PageImportCSV = () => {
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({date:'',desc:'',credit:'',debit:''});
  const [step, setStep] = useState(1); // 1=upload 2=mapping 3=preview 4=done
  const [imported, setImported] = useState(0);
  const [errors, setErrors] = useState([]);
  const token = localStorage.getItem('token');
  const fmtF = n => new Intl.NumberFormat('fr-FR').format(Math.round(Math.abs(n||0)));

  const QB_FIELDS = [
    {key:'date', label:'Date', required:true, hint:'Ex: 2024-01-15'},
    {key:'desc', label:'Description', required:true, hint:'Libellé transaction'},
    {key:'credit', label:'Crédit (entrée)', required:false, hint:'Montant entrant'},
    {key:'debit', label:'Débit (sortie)', required:false, hint:'Montant sortant'},
    {key:'ref', label:'Référence', required:false, hint:'N° chèque, virement...'},
  ];

  const parseCSV = (text) => {
    const lines = text.trim().split("\n");
    if(lines.length < 2) return;
    const hdrs = lines[0].split(",").map(h=>h.trim().replace(/"/g,""));
    setHeaders(hdrs);
    const data = lines.slice(1).map(line=>{
      const vals = line.split(",").map(v=>v.trim().replace(/"/g,""));
      const row = {};
      hdrs.forEach((h,i)=>row[h]=vals[i]||"");
      return row;
    }).filter(r=>Object.values(r).some(v=>v));
    setRows(data);
    // Auto-mapping intelligent
    const autoMap = {date:'',desc:'',credit:'',debit:'',ref:''};
    hdrs.forEach(h=>{
      const hl = h.toLowerCase();
      if(hl.includes('date')) autoMap.date = h;
      else if(hl.includes('desc')||hl.includes('libel')||hl.includes('label')) autoMap.desc = h;
      else if(hl.includes('credit')||hl.includes('entree')||hl.includes('in')) autoMap.credit = h;
      else if(hl.includes('debit')||hl.includes('sortie')||hl.includes('out')) autoMap.debit = h;
      else if(hl.includes('ref')||hl.includes('num')) autoMap.ref = h;
    });
    setMapping(autoMap);
    setStep(2);
  };

  const handleFile = (f) => {
    if(!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = e => parseCSV(e.target.result);
    reader.readAsText(f);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if(f&&(f.name.endsWith(".csv")||f.name.endsWith(".txt"))) handleFile(f);
    else alert("Veuillez déposer un fichier CSV");
  };

  const preview = rows.slice(0,5).map(r=>({
    date: r[mapping.date]||"—",
    desc: r[mapping.desc]||"—",
    credit: parseFloat(r[mapping.credit])||0,
    debit: parseFloat(r[mapping.debit])||0,
    ref: r[mapping.ref||""]||"",
  }));

  const doImport = async() => {
    setStep(4); setImported(0); setErrors([]);
    let ok=0, errs=[];
    for(const row of rows){
      try{
        const body = {
          date: row[mapping.date],
          description: row[mapping.desc],
          credit: parseFloat(row[mapping.credit])||0,
          debit: parseFloat(row[mapping.debit])||0,
          reference: row[mapping.ref||""]||"",
          type: "import_csv"
        };
        const r = await fetch("https://backend-cleanit-erp.vercel.app/journal",{
          method:"POST",
          headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},
          body: JSON.stringify(body)
        });
        if(r.ok) ok++;
        else errs.push(row[mapping.desc]||"ligne");
      }catch(e){ errs.push("Erreur réseau"); }
    }
    setImported(ok); setErrors(errs);
  };

  const downloadTemplate = () => {
    const csv = "Date,Description,Credit,Debit,Reference\n2024-01-15,Virement MTN Cameroun,53935625,0,VIR-MTN-001\n2024-01-20,Paiement fournisseur Huawei,0,28500000,FACT-HW-001\n";
    const blob = new Blob([csv],{type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="template_cleanit.csv"; a.click();
  };

  return(
    <div style={{minHeight:"100vh",background:"#F4F5F7",fontFamily:"'Avenir Next','Helvetica Neue',Arial,sans-serif"}}>
      <CIBTopBar title="Import relevé bancaire — CSV" icon="upload" color={C.blue}>
        <button onClick={downloadTemplate} style={{background:C.white,border:"1px solid "+C.border,borderRadius:4,padding:"7px 16px",fontSize:13,cursor:"pointer",color:C.text2,fontWeight:600}}>
          📥 Télécharger template
        </button>
      </CIBTopBar>

      <div style={{maxWidth:900,margin:"0 auto",padding:"32px 24px"}}>
        {/* ÉTAPES QB STYLE */}
        <div style={{display:"flex",alignItems:"center",marginBottom:32}}>
          {[{n:1,l:"Importer"},{n:2,l:"Mapper"},{n:3,l:"Vérifier"},{n:4,l:"Terminé"}].map((s,i)=>(
            <div key={s.n} style={{display:"flex",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:32,height:32,borderRadius:16,background:step>=s.n?C.green:"#D4D6D8",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:14,fontWeight:700}}>{step>s.n?"✓":s.n}</div>
                <span style={{fontSize:14,fontWeight:step===s.n?700:400,color:step>=s.n?C.text:C.text3}}>{s.l}</span>
              </div>
              {i<3&&<div style={{width:60,height:2,background:step>s.n?C.green:"#D4D6D8",margin:"0 12px"}}/>}
            </div>
          ))}
        </div>

        {/* ÉTAPE 1 — UPLOAD */}
        {step===1&&(
          <div style={{background:"#fff",borderRadius:8,border:"1px solid "+C.border,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
            <div style={{padding:"20px 24px",borderBottom:"1px solid "+C.border}}>
              <h3 style={{margin:0,fontSize:17,fontWeight:700,color:C.text}}>Importer un relevé bancaire</h3>
              <p style={{margin:"4px 0 0",fontSize:13,color:C.text3}}>Formats acceptés: CSV, TXT · Encodage: UTF-8</p>
            </div>
            <div style={{padding:32}}>
              {/* ZONE DRAG & DROP QB STYLE */}
              <div
                onDragOver={e=>{e.preventDefault();setDrag(true);}}
                onDragLeave={()=>setDrag(false)}
                onDrop={handleDrop}
                onClick={()=>document.getElementById("csv_input").click()}
                style={{
                  border:`2px dashed ${drag?C.green:C.gray4}`,
                  borderRadius:8, padding:"48px 24px",
                  textAlign:"center", cursor:"pointer",
                  background:drag?"#EBF9E8":"#F9FAFB",
                  transition:"all 0.15s"
                }}>
                <div style={{fontSize:48,marginBottom:12}}>📂</div>
                <p style={{fontSize:16,fontWeight:700,color:C.text,margin:"0 0 8px"}}>
                  {drag?"Relâchez pour importer":"Glissez-déposez votre fichier CSV ici"}
                </p>
                <p style={{fontSize:13,color:C.text3,margin:"0 0 20px"}}>ou</p>
                <button style={{background:C.blue,color:"#fff",border:"none",borderRadius:4,padding:"10px 24px",fontSize:14,fontWeight:600,cursor:"pointer"}}>
                  Choisir un fichier
                </button>
                <input id="csv_input" type="file" accept=".csv,.txt" style={{display:"none"}}
                  onChange={e=>handleFile(e.target.files[0])}/>
              </div>

              {/* FORMAT ATTENDU */}
              <div style={{marginTop:24,background:"#F4F5F7",borderRadius:8,padding:"16px 20px",border:"1px solid "+C.border}}>
                <p style={{margin:"0 0 10px",fontSize:13,fontWeight:700,color:C.text2}}>📋 Format CSV attendu :</p>
                <code style={{fontSize:12,color:C.text,background:"#fff",padding:"10px 14px",borderRadius:4,display:"block",border:"1px solid "+C.border}}>
                  Date,Description,Credit,Debit,Reference<br/>
                  2024-01-15,Virement MTN Cameroun,53935625,0,VIR-MTN-001<br/>
                  2024-01-20,Paiement fournisseur,0,28500000,FACT-HW-001
                </code>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 — MAPPING */}
        {step===2&&(
          <div style={{background:"#fff",borderRadius:8,border:"1px solid "+C.border,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
            <div style={{padding:"20px 24px",borderBottom:"1px solid "+C.border}}>
              <h3 style={{margin:0,fontSize:17,fontWeight:700,color:C.text}}>Correspondance des colonnes</h3>
              <p style={{margin:"4px 0 0",fontSize:13,color:C.text3}}>{rows.length} lignes détectées dans <strong>{file?.name}</strong></p>
            </div>
            <div style={{padding:24}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
                {QB_FIELDS.map(field=>(
                  <div key={field.key}>
                    <label style={{display:"block",fontSize:13,fontWeight:600,color:C.text2,marginBottom:4}}>
                      {field.label} {field.required&&<span style={{color:C.red}}>*</span>}
                    </label>
                    <select value={mapping[field.key]||""} onChange={e=>setMapping(p=>({...p,[field.key]:e.target.value}))}
                      style={{width:"100%",padding:"9px 12px",border:"1px solid "+C.border,borderRadius:4,fontSize:14,color:C.text,background:"#fff",outline:"none"}}>
                      <option value="">— Ne pas importer —</option>
                      {headers.map(h=><option key={h} value={h}>{h}</option>)}
                    </select>
                    <p style={{fontSize:11,color:C.text3,margin:"3px 0 0"}}>{field.hint}</p>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                <button onClick={()=>{setStep(1);setFile(null);setRows([]);}} style={{background:C.white,border:"1px solid "+C.border,borderRadius:4,padding:"9px 20px",fontSize:14,cursor:"pointer",color:C.text2}}>← Retour</button>
                <button onClick={()=>setStep(3)} disabled={!mapping.date||!mapping.desc} style={{background:(!mapping.date||!mapping.desc)?"#D4D6D8":C.green,color:"#fff",border:"none",borderRadius:4,padding:"9px 20px",fontSize:14,fontWeight:600,cursor:"pointer"}}>
                  Vérifier ({rows.length} lignes) →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 — PREVIEW */}
        {step===3&&(
          <div style={{background:"#fff",borderRadius:8,border:"1px solid "+C.border,boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
            <div style={{padding:"20px 24px",borderBottom:"1px solid "+C.border}}>
              <h3 style={{margin:0,fontSize:17,fontWeight:700,color:C.text}}>Vérification avant import</h3>
              <p style={{margin:"4px 0 0",fontSize:13,color:C.text3}}>Aperçu des 5 premières lignes sur {rows.length} au total</p>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:"#F4F5F7"}}>
                  {["Date","Description","Crédit","Débit","Référence"].map(h=>(
                    <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:12,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:"0.5px"}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>{preview.map((r,i)=>(
                  <tr key={i} style={{borderBottom:"1px solid "+C.border2}}>
                    <td style={{padding:"10px 14px",fontSize:13,color:C.text2}}>{r.date}</td>
                    <td style={{padding:"10px 14px",fontSize:13,color:C.text,fontWeight:500}}>{r.desc}</td>
                    <td style={{padding:"10px 14px",fontSize:13,color:C.green,fontWeight:r.credit>0?600:400}}>{r.credit>0?fmtF(r.credit)+" F":"—"}</td>
                    <td style={{padding:"10px 14px",fontSize:13,color:C.red,fontWeight:r.debit>0?600:400}}>{r.debit>0?fmtF(r.debit)+" F":"—"}</td>
                    <td style={{padding:"10px 14px",fontSize:13,color:C.text3}}>{r.ref||"—"}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            {rows.length>5&&<div style={{padding:"10px 14px",background:"#F4F5F7",borderTop:"1px solid "+C.border,fontSize:13,color:C.text3}}>
              ... et {rows.length-5} autres lignes
            </div>}
            <div style={{padding:"16px 24px",borderTop:"1px solid "+C.border,display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setStep(2)} style={{background:C.white,border:"1px solid "+C.border,borderRadius:4,padding:"9px 20px",fontSize:14,cursor:"pointer",color:C.text2}}>← Modifier</button>
              <button onClick={doImport} style={{background:C.green,color:"#fff",border:"none",borderRadius:4,padding:"9px 24px",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                ✓ Importer {rows.length} transactions
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 4 — RÉSULTAT */}
        {step===4&&(
          <div style={{background:"#fff",borderRadius:8,border:"1px solid "+C.border,boxShadow:"0 1px 3px rgba(0,0,0,0.08)",padding:48,textAlign:"center"}}>
            <div style={{fontSize:56,marginBottom:16}}>{errors.length===0?"✅":"⚠️"}</div>
            <h3 style={{fontSize:22,fontWeight:700,color:C.text,margin:"0 0 8px"}}>
              {errors.length===0?"Import réussi !":"Import terminé avec erreurs"}
            </h3>
            <p style={{fontSize:15,color:C.text2,margin:"0 0 24px"}}>
              <strong style={{color:C.green}}>{imported}</strong> transaction(s) importée(s) avec succès
              {errors.length>0&&<span style={{color:C.red}}> · {errors.length} erreur(s)</span>}
            </p>
            <div style={{display:"flex",gap:12,justifyContent:"center"}}>
              <button onClick={()=>{setStep(1);setFile(null);setRows([]);setImported(0);setErrors([]);}}
                style={{background:C.white,border:"1px solid "+C.border,borderRadius:4,padding:"10px 24px",fontSize:14,cursor:"pointer",color:C.text2,fontWeight:600}}>
                Importer un autre fichier
              </button>
              <button onClick={()=>window.location.href="/cleanitbooks/banking"}
                style={{background:C.blue,color:"#fff",border:"none",borderRadius:4,padding:"10px 24px",fontSize:14,fontWeight:700,cursor:"pointer"}}>
                Voir le Banking →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const PageRecurring = ({customers=[], invoices=[], setInvoices}) => {
  const [templates, setTemplates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({name:'',customerId:'',amount:0,freq:'Mensuelle',nextDate:TODAY});

  const generate = async (tpl) => {
    const newInvDto = {
      customerId:tpl.customerId, date:TODAY, dueDate:TODAY,
      total:tpl.amount, balance:tpl.amount, status:'Open',
      recurring:true, templateId:tpl.id,
      lines:[{description:tpl.name, qty:1, unitPrice:tpl.amount, total:tpl.amount}],
    };
    try {
      const api = await import('../services/cleanitbooks.api');
      const saved = await api.createInvoice(newInvDto);
      const persisted = saved?.id ? {...newInvDto, id:saved.id, ref:'INV-'+saved.id} : newInvDto;
      if(setInvoices) setInvoices(p=>[persisted,...p]);
      setTemplates(p=>p.map(t=>t.id===tpl.id?{...t,lastGen:TODAY}:t));
      alert('Facture générée: '+(persisted.ref||persisted.id));
    } catch(e) {
      alert('Erreur lors de la génération de la facture : '+e.message);
    }
  };

  const addTemplate = () => {
    if(!form.name||!form.amount) return;
    setTemplates(p=>[...p,{...form,id:'REC'+Date.now().toString().slice(-3),active:true,lastGen:'—'}]);
    setForm({name:'',customerId:'',amount:0,freq:'Mensuelle',nextDate:TODAY});
    setShowForm(false);
  };

  return (
    <div>
      <CIBTopBar title="Factures récurrentes" icon="time" color={C.blue}>
        <button onClick={()=>setShowForm(true)} style={{padding:'7px 14px',borderRadius:8,border:'none',background:C.blue,color:'#fff',fontSize:12,cursor:'pointer',fontWeight:700}}>
          + Nouveau modèle
        </button>
      </CIBTopBar>
      <div style={{padding:'16px 24px'}}>
        {showForm&&(
          <div style={{background:C.blue_l,borderRadius:10,padding:'18px 20px',marginBottom:20,border:`1px solid #BFDBFE`}}>
            <div style={{fontSize:14,fontWeight:700,color:C.blue,marginBottom:14}}>Nouveau modèle récurrent</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:12}}>
              {[
                {l:'Nom du modèle',k:'name',type:'text',ph:'Ex: Abonnement mensuel MTN'},
                {l:'Montant FCFA',k:'amount',type:'number',ph:'0'},
                {l:'Prochaine date',k:'nextDate',type:'date',ph:''},
              ].map(({l,k,type,ph})=>(
                <div key={k}>
                  <label style={{fontSize:11,color:C.text3,display:'block',marginBottom:4}}>{l}</label>
                  <input type={type} value={form[k]} placeholder={ph} onChange={e=>setForm({...form,[k]:e.target.value})}
                    style={{width:'100%',padding:'8px 10px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:13,outline:'none',boxSizing:'border-box'}}/>
                </div>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
              <div>
                <label style={{fontSize:11,color:C.text3,display:'block',marginBottom:4}}>Client</label>
                <select value={form.customerId} onChange={e=>setForm({...form,customerId:e.target.value})}
                  style={{width:'100%',padding:'8px 10px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:13,outline:'none',boxSizing:'border-box'}}>
                  <option value="">Choisir client</option>
                  {(customers||[]).map(c=><option key={c.id} value={c.id}>{c.company||c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:11,color:C.text3,display:'block',marginBottom:4}}>Fréquence</label>
                <select value={form.freq} onChange={e=>setForm({...form,freq:e.target.value})}
                  style={{width:'100%',padding:'8px 10px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:13,outline:'none',boxSizing:'border-box'}}>
                  {['Hebdomadaire','Mensuelle','Trimestrielle','Semestrielle','Annuelle'].map(f=><option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={addTemplate} style={{padding:'8px 20px',borderRadius:6,border:'none',background:C.blue,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer'}}>
                Créer le modèle
              </button>
              <button onClick={()=>setShowForm(false)} style={{padding:'8px 20px',borderRadius:6,border:`1px solid ${C.border}`,background:C.white,color:C.text2,fontSize:13,cursor:'pointer'}}>
                Annuler
              </button>
            </div>
          </div>
        )}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {templates.length===0 && (
            <div style={{textAlign:'center',padding:50,color:C.text3,background:C.white,borderRadius:10,border:`1px solid ${C.border}`}}>
              Aucun modèle de facture récurrente. Cliquez sur "+ Nouveau modèle" pour en créer un.
            </div>
          )}
          {templates.map((tpl,i)=>{
            const cust=(customers||[]).find(c=>c.id===tpl.customerId);
            return (
              <div key={tpl.id} style={{background:C.white,borderRadius:10,border:`1px solid ${C.border}`,padding:'16px 20px',display:'flex',alignItems:'center',gap:16}}>
                <div style={{width:40,height:40,borderRadius:10,background:tpl.active?C.blue_l:C.gray_l,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <span style={{fontSize:18}}>🔄</span>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:3}}>{tpl.name}</div>
                  <div style={{fontSize:12,color:C.text3}}>
                    {cust?.company||cust?.name||'—'} · {tpl.freq} · Prochaine: {tpl.nextDate} · Dernière: {tpl.lastGen}
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:18,fontWeight:800,color:C.blue}}>{fM(tpl.amount)} F</div>
                  <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:8,background:tpl.active?C.green_l:C.gray_l,color:tpl.active?C.green:C.gray}}>
                    {tpl.active?'Actif':'Inactif'}
                  </span>
                </div>
                <div style={{display:'flex',gap:8,flexShrink:0}}>
                  <button onClick={()=>generate(tpl)} style={{padding:'7px 14px',borderRadius:6,border:'none',background:C.green,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer'}}>
                    Générer maintenant
                  </button>
                  <button onClick={()=>setTemplates(p=>p.map(t=>t.id===tpl.id?{...t,active:!t.active}:t))}
                    style={{padding:'7px 14px',borderRadius:6,border:`1px solid ${C.border}`,background:'none',color:C.text2,fontSize:12,cursor:'pointer'}}>
                    {tpl.active?'Désactiver':'Activer'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


// ── PAGE BUDGET PRÉVU VS RÉEL ───────────────────────────────────
const PageBudget = ({invoices=[], bills=[]}) => {
  const [budgets, setBudgets] = useState([]);
  const [editing, setEditing] = useState(null);

  const totalCA = (invoices||[]).reduce((s,i)=>s+Number(i.total||0),0);
  const totalCharges = (bills||[]).reduce((s,b)=>s+Number(b.total||0),0);

  // Le "réel" par catégorie nécessite une vraie ventilation comptable par compte SYSCOHADA,
  // non disponible actuellement — on ne simule plus avec des pourcentages arbitraires.
  const getActual = (b) => null;

  return (
    <div>
      <CIBTopBar title="Budget prévu vs réel" icon="chart" color={C.blue}>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>{
            const category = prompt('Nom de la catégorie budgétaire (ex: Transport, Télécom...)');
            if(!category) return;
            const compte = prompt('Numéro de compte SYSCOHADA (ex: 624)') || '';
            const prevue = Number(prompt('Montant prévu (FCFA)') || 0);
            const type = confirm('Est-ce un produit (revenu) ? Annuler = charge') ? 'produit' : 'charge';
            setBudgets(p=>[...p, {id:'B'+Date.now(), category, compte, prevue, type}]);
          }} style={{padding:'7px 14px',borderRadius:8,border:'none',background:C.blue,color:'#fff',fontSize:12,cursor:'pointer',fontWeight:700}}>
            + Catégorie
          </button>
          <button onClick={()=>exportXLSX(budgets.map(b=>({
          categorie:b.category, prevu:b.prevue, reel:getActual(b)===null?'N/A':Math.round(getActual(b)),
          ecart:getActual(b)===null?'N/A':Math.round(getActual(b)-b.prevue), pct:getActual(b)===null?'N/A':Math.round(getActual(b)/b.prevue*100)+'%'
        })),[
          {key:'categorie',label:'Catégorie'},{key:'prevu',label:'Prévu'},{key:'reel',label:'Réel'},
          {key:'ecart',label:'Écart'},{key:'pct',label:'% réalisé'}
        ],'Budget_CleanIT')} style={{padding:'7px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:C.white,color:C.text2,fontSize:12,cursor:'pointer',fontWeight:600}}>
          📥 Exporter
        </button>
        </div>
      </CIBTopBar>
      <div style={{padding:'16px 24px'}}>
        <div style={{background:C.white,borderRadius:10,border:`1px solid ${C.border}`,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#F4F5F7'}}>
                {['Catégorie','Compte','Budget prévu','Réel','Écart','% réalisé',''].map(h=>(
                  <th key={h} style={{padding:'11px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:.5}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {budgets.length===0 && (
                <tr><td colSpan={7} style={{padding:50,textAlign:'center',color:C.text3}}>
                  Aucune catégorie budgétaire définie. Cliquez sur "+ Catégorie" pour commencer.
                </td></tr>
              )}
              {budgets.map((b,i)=>{
                const actual = getActual(b);
                const ecart = actual!==null ? actual - b.prevue : null;
                const pct = actual!==null ? Math.round(actual/b.prevue*100) : null;
                const over = b.type==='charge'&&actual!==null&&actual>b.prevue;
                const under = b.type==='produit'&&actual!==null&&actual<b.prevue;
                const bad = over||under;
                return (
                  <tr key={b.id} style={{borderBottom:`1px solid ${C.border2}`}}>
                    <td style={{padding:'11px 14px',fontWeight:600,color:C.text}}>{b.category}</td>
                    <td style={{padding:'11px 14px',fontSize:11,color:C.text3,fontFamily:'monospace'}}>{b.compte}</td>
                    <td style={{padding:'11px 14px',fontWeight:700,color:C.blue}}>
                      {editing===b.id?(
                        <input type="number" defaultValue={b.prevue} onBlur={e=>{setBudgets(p=>p.map(x=>x.id===b.id?{...x,prevue:Number(e.target.value)}:x));setEditing(null);}}
                          style={{width:100,padding:'4px 8px',borderRadius:4,border:`1px solid ${C.blue}`,fontSize:12,outline:'none'}} autoFocus/>
                      ):fN(b.prevue)+' F'}
                    </td>
                    <td style={{padding:'11px 14px',fontWeight:700,color:actual===null?C.text4:(bad?C.red:C.green)}}>
                      {actual===null?'Non disponible':fN(actual)+' F'}
                    </td>
                    <td style={{padding:'11px 14px',fontWeight:700,color:ecart===null?C.text4:(bad?C.red:C.green)}}>
                      {ecart===null?'—':(ecart>0?'+':'')+fN(ecart)+' F'}
                    </td>
                    <td style={{padding:'11px 14px'}}>
                      {pct===null ? <span style={{fontSize:11,color:C.text4}}>—</span> : (
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <div style={{flex:1,height:6,borderRadius:3,background:C.border2,overflow:'hidden',minWidth:60}}>
                            <div style={{width:Math.min(pct,100)+'%',height:'100%',background:bad?C.red:C.green,borderRadius:3}}/>
                          </div>
                          <span style={{fontSize:12,fontWeight:700,color:bad?C.red:C.green,minWidth:36}}>{pct}%</span>
                        </div>
                      )}
                    </td>
                    <td style={{padding:'11px 14px'}}>
                      <button onClick={()=>setEditing(b.id)} style={{padding:'4px 10px',borderRadius:4,border:`1px solid ${C.border}`,background:'none',color:C.text3,fontSize:11,cursor:'pointer'}}>
                        Modifier
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ── EMAIL FACTURE — Modale ───────────────────────────────────────
const EmailInvoiceModal = ({invoice, customer, onClose}) => {
  const [email, setEmail] = useState(customer?.email||'');
  const [msg, setMsg] = useState('Veuillez trouver ci-joint votre facture. Cordialement, CleanIT.');
  const [sent, setSent] = useState(false);

  const sendEmail = () => {
    const subject = encodeURIComponent('Facture '+( invoice?.ref||invoice?.id||''));
    const body = encodeURIComponent(msg + '\n\n' + 'Ref: '+(invoice?.ref||''));
    window.open('mailto:'+email+'?subject='+subject+'&body='+body);
    setSent(true);
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:C.white,borderRadius:14,padding:28,width:440,boxShadow:'0 8px 40px rgba(0,0,0,0.2)'}}>
        <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:16}}>📧 Envoyer la facture par email</div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,fontWeight:600,color:C.text3,display:'block',marginBottom:4}}>Email destinataire</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email"
            style={{width:'100%',padding:'9px 12px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:13,outline:'none',boxSizing:'border-box'}}/>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,fontWeight:600,color:C.text3,display:'block',marginBottom:4}}>Message</label>
          <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={3}
            style={{width:'100%',padding:'9px 12px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:13,outline:'none',boxSizing:'border-box',resize:'vertical'}}/>
        </div>
        <div style={{background:'#F4F5F7',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:12,color:C.text3}}>
          <strong>Facture:</strong> {invoice?.ref||invoice?.id} · <strong>Montant:</strong> {fN(invoice?.total||0)} FCFA
        </div>
        {sent&&<div style={{color:C.green,fontWeight:600,fontSize:13,marginBottom:12}}>✓ Client de messagerie ouvert</div>}
        <div style={{display:'flex',gap:8}}>
          <button onClick={sendEmail} style={{flex:1,padding:'10px',borderRadius:7,border:'none',background:C.blue,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer'}}>
            Envoyer
          </button>
          <button onClick={onClose} style={{padding:'10px 20px',borderRadius:7,border:`1px solid ${C.border}`,background:'none',color:C.text2,fontSize:13,cursor:'pointer'}}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

// ── PAGE BILAN ─────────────────────────────────────────────────────
const PageBilan = () => {
  const [bilan,   setBilan]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    getBilan().then(d=>{ setBilan(d); setLoading(false); });
  },[]);

  if(loading) return <div style={{padding:40,textAlign:'center',color:C.text4}}>Calcul du bilan...</div>;
  if(!bilan) return <div style={{padding:40,textAlign:'center',color:C.text4}}>Aucune donnée</div>;

  return(
    <div>
      <CIBTopBar title="Bilan comptable SYSCOHADA" icon="🏦" color="#0f172a">
        <div style={{display:'flex',gap:8}}>
          <div style={{padding:'5px 14px',borderRadius:20,background:bilan.equilibre?C.green_l:C.red_l,color:bilan.equilibre?C.green:C.red,fontSize:12,fontWeight:700}}>
            {bilan.equilibre?'✅ Bilan équilibré':'⚠️ Bilan déséquilibré'}
          </div>
          <button onClick={()=>window.print()} style={{padding:'7px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:C.white,color:C.text2,fontSize:12,cursor:'pointer',fontWeight:600}}>
            🖨 Imprimer
          </button>
        </div>
      </CIBTopBar>
      <div style={{padding:'20px 24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
          {[
            {l:'Total Actif', v:bilan.totalActif, c:C.blue, bg:C.blue_l},
            {l:'Total Passif',v:bilan.totalPassif,c:C.orange,bg:C.orange_l},
          ].map(k=>(
            <div key={k.l} style={{background:k.bg,borderRadius:12,padding:'20px 24px',border:`1px solid ${k.c}30`,textAlign:'center'}}>
              <div style={{fontSize:11,color:C.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:6}}>{k.l}</div>
              <div style={{fontSize:28,fontWeight:900,color:k.c}}>{fN(k.v)} FCFA</div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          {/* ACTIF */}
          <div style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,overflow:'hidden',boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
            <div style={{padding:'14px 18px',background:C.blue_l,borderBottom:`1px solid ${"#BFDBFE"}`,display:'flex',justifyContent:'space-between'}}>
              <span style={{fontSize:14,fontWeight:800,color:C.blue}}>ACTIF</span>
              <span style={{fontSize:14,fontWeight:900,color:C.blue}}>{fN(bilan.totalActif)} FCFA</span>
            </div>
            {(bilan.actif||[]).filter(a=>a.solde>0).map((a,i)=>(
              <div key={a.code} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 18px',borderBottom:`1px solid ${C.border2}`,background:i%2===0?C.white:'#fafafa'}}>
                <div>
                  <div style={{fontSize:11,fontFamily:'monospace',color:'#7c3aed'}}>{a.code} — Cl.{a.classe}</div>
                  <div style={{fontSize:12,color:C.text2}}>{a.nom}</div>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:C.blue}}>{fN(a.solde)}</div>
              </div>
            ))}
          </div>

          {/* PASSIF */}
          <div style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,overflow:'hidden',boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
            <div style={{padding:'14px 18px',background:C.orange_l,borderBottom:`1px solid ${C.orange_m}`,display:'flex',justifyContent:'space-between'}}>
              <span style={{fontSize:14,fontWeight:800,color:C.orange}}>PASSIF</span>
              <span style={{fontSize:14,fontWeight:900,color:C.orange}}>{fN(bilan.totalPassif)} FCFA</span>
            </div>
            {(bilan.passif||[]).filter(a=>a.solde>0).map((a,i)=>(
              <div key={a.code} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 18px',borderBottom:`1px solid ${C.border2}`,background:i%2===0?C.white:'#fafafa'}}>
                <div>
                  <div style={{fontSize:11,fontFamily:'monospace',color:'#7c3aed'}}>{a.code} — Cl.{a.classe}</div>
                  <div style={{fontSize:12,color:C.text2}}>{a.nom}</div>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:C.orange}}>{fN(a.solde)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default function CleanITBooks() {
  const [jobs,      setJobs]      = useState(INIT_JOBS);
  const [customers, setCustomers] = useState(INIT_CUSTOMERS);
  const [vendors,   setVendors]   = useState(INIT_VENDORS);
  const [invoices,  setInvoices]  = useState(INIT_INVOICES_AR);
  const [bills,     setBills]     = useState(INIT_BILLS_AP);
  const [loading,   setLoading]   = useState(true);
  const [cibTab,    setCibTab]    = useState('dashboard');
  const params   = useParams();
  const navigate = useNavigate();
  const loc      = window.location.pathname;

  useEffect(()=>{
    const load = async () => {
      try {
        const [j,c,v,i,b] = await Promise.all([
          getJobs(), getCustomers(), getVendors(),
          getInvoices(), getBills(),
        ]);
        if(Array.isArray(j)&&j.length>0) setJobs(j);
        if(Array.isArray(c)&&c.length>0) setCustomers(c);
        if(Array.isArray(v)&&v.length>0) setVendors(v);
        if(Array.isArray(i)&&i.length>0) setInvoices(i);
        if(Array.isArray(b)&&b.length>0) setBills(b);
      } catch(e){ console.warn('CIB backend indisponible'); }
      finally { setLoading(false); }
    };
    load();
  },[]);

  const getTabFromLoc = () => {
    if(loc.includes('/banking')||loc.includes('/import-csv')||loc.includes('/reconciliation')) return 'banking';
    if(loc.includes('/invoices')||loc.includes('/customers')||loc.includes('/avoirs')||loc.includes('/recurring')) return 'sales';
    if(loc.includes('/bills')||loc.includes('/vendors')) return 'purchases';
    if(loc.includes('/jobs')||loc.includes('/budget')) return 'projects';
    if(loc.includes('/reports')||loc.includes('/analytics')||loc.includes('/payroll')) return 'reports';
    if(loc.includes('/journal')||loc.includes('/balance')||loc.includes('/plan-comptable')) return 'journal';
    return cibTab;
  };

  const handleTab = (tab) => {
    setCibTab(tab);
    const routes = {
      dashboard:'/cleanitbooks', banking:'/cleanitbooks/banking',
      sales:'/cleanitbooks/invoices', purchases:'/cleanitbooks/bills',
      projects:'/cleanitbooks/jobs', reports:'/cleanitbooks/reports',
      journal:'/cleanitbooks/journal',
    };
    navigate(routes[tab]||'/cleanitbooks');
  };

  const renderContent = () => {
    try {
    if(loc.includes('/time')) return <PageTimeTracking/>;
    if(loc.includes('/payroll')) return <PagePayroll/>;
    if(loc.includes('/budget')) return <PageBudget invoices={invoices} bills={bills}/>;
    if(loc.includes('/reconciliation')) return <PageReconciliation invoices={invoices} bills={bills}/>;
    if(loc.includes('/import-csv')) return <PageImportCSV/>;
    if(loc.includes('/recurring')) return <PageRecurring customers={customers} invoices={invoices} setInvoices={setInvoices}/>;
    if(loc.includes('/banking')) return <PageBanking/>;
    if(loc.includes('/analytics')) return <PageAnalytics invoices={invoices} bills={bills} customers={customers} jobs={jobs}/>;
    if(loc.includes('/avoirs')) return <PageAvoir invoices={invoices} customers={customers} setInvoices={setInvoices}/>;
    if(loc.includes('/bills')){
      if(loc.endsWith('/new')) return <BillForm bill={null} vendors={vendors} onSave={()=>navigate('/cleanitbooks/bills')} onCancel={()=>navigate('/cleanitbooks/bills')}/>;
      if(params.billId&&params.billId!=='new') return <PageBillDetail bills={bills} vendors={vendors} jobs={jobs}/>;
      return <PageBillList bills={bills} vendors={vendors} jobs={jobs}/>;
    }
    if(loc.includes('/invoices')){
      if(loc.endsWith('/new')) return <InvoiceForm invoice={null} customers={customers} onSave={()=>navigate('/cleanitbooks/invoices')} onCancel={()=>navigate('/cleanitbooks/invoices')}/>;
      if(params.invoiceId&&params.invoiceId!=='new') return <PageInvoiceDetail invoices={invoices} customers={customers} jobs={jobs}/>;
      return <PageInvoiceList invoices={invoices} customers={customers} jobs={jobs}/>;
    }
    if(loc.includes('/vendors')){
      if(loc.endsWith('/new')) return <VendorForm vendor={null} onSave={()=>navigate('/cleanitbooks/vendors')} onCancel={()=>navigate('/cleanitbooks/vendors')}/>;
      if(params.vendorId&&params.vendorId!=='new') return <PageVendorDetail vendors={vendors} jobs={jobs}/>;
      return <PageVendorList vendors={vendors} setVendors={setVendors} jobs={jobs}/>;
    }
    if(loc.includes('/customers')){
      if(loc.endsWith('/new')) return <CustomerForm customer={null} onSave={()=>navigate('/cleanitbooks/customers')} onCancel={()=>navigate('/cleanitbooks/customers')}/>;
      if(params.custId&&loc.endsWith('/edit')) return <CustomerForm customer={null} onSave={()=>navigate('/cleanitbooks/customers')} onCancel={()=>navigate('/cleanitbooks/customers')}/>;
      if(params.custId) return <CustomerDetail customer={customers.find(c=>c.id==params.custId)||customers[0]} onEdit={()=>{}} onBack={()=>navigate('/cleanitbooks/customers')} onNewInvoice={()=>navigate('/cleanitbooks/invoices/new')}/>;
      return <PageCustomerList customers={customers} setCustomers={setCustomers} invoices={invoices} jobs={jobs}/>;
    }
    if(loc.includes('/reports')) return <PageReports/>;
    if(loc.includes('/journal')) return <PageJournal/>;
    if(loc.includes('/balance')) return <PageBalance/>;
    if(loc.includes('/plan-comptable')) return <PagePlanComptable/>;
    if(loc.endsWith('/new')&&loc.includes('/jobs')) return <PageJobNew customers={customers} onSave={(job)=>{setJobs(p=>[...p,job]);navigate('/cleanitbooks/jobs/'+job.id);}} onCancel={()=>navigate('/cleanitbooks/jobs')}/>;
    if(loc.endsWith('/edit')&&params.jobId){
      const job=jobs.find(j=>j.id===params.jobId);
      return <PageJobNew initial={job} customers={customers} onSave={(u)=>{setJobs(p=>p.map(j=>j.id===u.id?u:j));navigate('/cleanitbooks/jobs/'+u.id);}} onCancel={()=>navigate('/cleanitbooks/jobs/'+params.jobId)}/>;
    }
    if(params.jobId) return <PageJobDetail jobs={jobs} setJobs={setJobs} customers={customers}/>;
    if(loc.includes('/jobs')) return <PageJobList jobs={jobs} setJobs={setJobs} customers={customers}/>;
    return <PageDashboard invoices={invoices} bills={bills} customers={customers} jobs={jobs} navigate={navigate} onTab={handleTab}/>;
    } catch(err) {
      console.error('CleanITBooks renderContent error:', err);
      return <div style={{padding:40,textAlign:'center',color:'#D52B1E',fontSize:14}}>
        <div style={{fontSize:24,marginBottom:12}}>⚠️</div>
        <div><strong>Erreur de chargement</strong></div>
        <div style={{color:'#6B7280',marginTop:8,fontSize:13}}>{err?.message||'Erreur inconnue'}</div>
        <button onClick={()=>window.location.reload()} style={{marginTop:16,padding:'8px 16px',background:'#0077C5',color:'white',border:'none',borderRadius:6,cursor:'pointer',fontSize:13}}>
          Recharger
        </button>
      </div>;
    }
  };

  if(loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:12}}>
      <div style={{width:32,height:32,border:'3px solid '+CIB_C.navy,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
      <span style={{fontSize:13,color:CIB_C.text3}}>Chargement CleanIT Books...</span>
    </div>
  );

  return (
    <div style={{minHeight:'100%',background:CIB_C.bg}}>
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      <CIBNav active={getTabFromLoc()} onTab={handleTab} navigate={navigate}/>
      <div>{renderContent()}</div>
    </div>
  );
}

