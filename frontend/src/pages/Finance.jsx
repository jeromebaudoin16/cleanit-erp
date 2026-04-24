import { useState } from 'react';
import { api } from '../utils/api';

// ===== DESIGN TOKENS QUICKBOOKS EXACT =====
const C = {
  green:   '#2CA01C',
  green2:  '#1a7a0e',
  green_bg:'#f0faf0',
  blue:    '#0077C5',
  blue_bg: '#e8f1f9',
  red:     '#d52b1e',
  red_bg:  '#fdf0ef',
  orange:  '#e27000',
  orange_bg:'#fef5e7',
  gray:    '#6b6b6b',
  gray_bg: '#f4f4f6',
  border:  '#d4d4d8',
  border2: '#e8e8ec',
  text:    '#1a1a1a',
  text2:   '#3d3d3d',
  muted:   '#6b6b6b',
  light:   '#9b9b9b',
  bg:      '#f4f5f7',
  white:   '#ffffff',
  sidebar: '#ffffff',
  sidebar_active: '#f0faf0',
  sidebar_border: '#e8e8ec',
};

const fmtN = n => new Intl.NumberFormat('fr-FR').format(Math.round(n||0));
const fmtD = d => d ? new Date(d).toLocaleDateString('fr-FR', {day:'2-digit',month:'short',year:'numeric'}) : '—';
const TVA_RATE = 0.1925;
const DEVISES_RATES = { FCFA:1, USD:600, EUR:655, CNY:83 };

// ===== ICÔNES SVG QUICKBOOKS =====
const Ico = ({ name, size=18, color='currentColor' }) => {
  const icons = {
    home: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
    invoice: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    expense: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z',
    report: 'M18 20V10 M12 20V4 M6 20v-6',
    tax: 'M9 14l2 2 4-4 M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z',
    bank: 'M3 21h18 M3 10h18 M5 6l7-3 7 3 M4 10v11 M20 10v11 M8 14v3 M12 14v3 M16 14v3',
    chart: 'M18 20V10 M12 20V4 M6 20v-6',
    profit: 'M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6',
    vendor: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z',
    plus: 'M12 5v14 M5 12h14',
    search: 'M21 21l-4.35-4.35 M17 11A6 6 0 115 11a6 6 0 0112 0z',
    close: 'M18 6L6 18 M6 6l12 12',
    chevron_right: 'M9 18l6-6-6-6',
    chevron_down: 'M6 9l6 6 6-6',
    check: 'M20 6L9 17l-5-5',
    dots: 'M5 12h.01 M12 12h.01 M19 12h.01',
    download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3',
    edit: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
    filter: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
    calendar: 'M8 2v4 M16 2v4 M3 10h18 M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z',
    mail: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
    print: 'M6 9V2h12v7 M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2 M6 14h12v8H6z',
    project: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
  };
  const d = icons[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {d.split(' M ').map((seg, i) => <path key={i} d={i===0?seg:`M ${seg}`}/>)}
    </svg>
  );
};

// ===== BADGE STATUT =====
const Badge = ({ status }) => {
  const cfg = {
    paye:       {l:'Payée',      c:C.green,  bg:C.green_bg},
    envoye:     {l:'Envoyée',    c:C.blue,   bg:C.blue_bg},
    en_retard:  {l:'En retard',  c:C.red,    bg:C.red_bg},
    partiel:    {l:'Partiel',    c:C.orange, bg:C.orange_bg},
    brouillon:  {l:'Brouillon',  c:C.gray,   bg:C.gray_bg},
    annule:     {l:'Annulée',    c:C.gray,   bg:C.gray_bg},
    en_attente: {l:'En attente', c:C.orange, bg:C.orange_bg},
    valide:     {l:'Validée',    c:C.green,  bg:C.green_bg},
    rejete:     {l:'Rejetée',    c:C.red,    bg:C.red_bg},
  }[status] || {l:status,c:C.gray,bg:C.gray_bg};
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'3px 10px', borderRadius:20,
      background:cfg.bg, color:cfg.c,
      fontSize:12, fontWeight:600, whiteSpace:'nowrap',
    }}>
      <span style={{width:6,height:6,borderRadius:'50%',background:cfg.c,flexShrink:0}}/>
      {cfg.l}
    </span>
  );
};

// ===== DONNÉES =====
const CLIENTS = ['MTN Cameroun','Orange Cameroun','Huawei Technologies','Nexttel Cameroun','Gouvernement Cameroun','CAMTEL','Entreprise Privée'];
const DEVISES_LIST = ['FCFA','USD','EUR','CNY'];
const PROJETS_LIST = ['PROJ-2024-001 · DLA-001','PROJ-2024-002 · YDE-001','PROJ-2024-003 · GAR-001','PROJ-2024-004 · LIM-001'];
const FOURNISSEURS_LIST = ['Huawei Technologies','Nokia Networks','Ericsson','Total Énergies','CAMTEL','Fournisseur local'];
const CATEGORIES_DEP = ['Équipements','Transport','Hébergement','Matériel','Télécoms','Maintenance','Per diem','Sous-traitance','Autres'];
const MODES_PAI = ['Virement bancaire','Mobile Money MTN','Mobile Money Orange','Chèque','Espèces','Virement international'];
const BANQUES = ['BICEC','Société Générale Cameroun','Afriland First Bank','UBA','Ecobank'];

const SEED_FACTURES = [
  {id:1,numero:'FAC-2024-001',client:'MTN Cameroun',projet:'PROJ-2024-001 · DLA-001',lignes:[{desc:'Installation antennes 5G NR',qte:1,pu:8500000,tva:true},{desc:'Main d\'œuvre techniciens',qte:15,pu:350000,tva:true},{desc:'Matériel consommable',qte:1,pu:450000,tva:false}],montantHT:14050000,tva:2509625,montantTTC:16559625,status:'paye',dateEmission:'2024-01-15',dateEcheance:'2024-02-15',devise:'FCFA',modePaiement:'Virement bancaire',notes:'Paiement reçu le 12/02/2024',acomptes:[{date:'2024-01-20',montant:5000000,ref:'VIR-001'}]},
  {id:2,numero:'FAC-2024-002',client:'Orange Cameroun',projet:'PROJ-2024-002 · YDE-001',lignes:[{desc:'Déploiement 4G LTE',qte:1,pu:7200000,tva:true},{desc:'Configuration équipements',qte:1,pu:1350000,tva:true}],montantHT:8550000,tva:1645875,montantTTC:10195875,status:'en_retard',dateEmission:'2024-01-28',dateEcheance:'2024-03-01',devise:'FCFA',modePaiement:'Chèque',notes:'Relance envoyée',acomptes:[]},
  {id:3,numero:'FAC-2024-003',client:'Huawei Technologies',projet:'PROJ-2024-001 · DLA-001',lignes:[{desc:'Engineering services 5G',qte:40,pu:850,tva:false},{desc:'Technical supervision',qte:10,pu:1200,tva:false}],montantHT:46000,tva:0,montantTTC:46000,status:'envoye',dateEmission:'2024-02-10',dateEcheance:'2024-03-15',devise:'USD',modePaiement:'Virement international',notes:'',acomptes:[]},
  {id:4,numero:'FAC-2024-004',client:'Gouvernement Cameroun',projet:'PROJ-2024-003 · GAR-001',lignes:[{desc:'Infrastructure télécom',qte:1,pu:27000000,tva:true},{desc:'Maintenance annuelle',qte:1,pu:5000000,tva:true}],montantHT:32000000,tva:6160000,montantTTC:38160000,status:'partiel',dateEmission:'2024-02-01',dateEcheance:'2024-04-01',devise:'FCFA',modePaiement:'Virement bancaire',notes:'Acompte 30% reçu',acomptes:[{date:'2024-02-15',montant:11448000,ref:'TRESOR-001'}]},
  {id:5,numero:'DEV-2024-001',client:'Nexttel Cameroun',projet:'PROJ-2024-004 · LIM-001',lignes:[{desc:'Survey réseau',qte:1,pu:3500000,tva:true},{desc:'Rapport technique',qte:1,pu:800000,tva:true}],montantHT:4300000,tva:827750,montantTTC:5127750,status:'brouillon',dateEmission:'2024-03-01',dateEcheance:'2024-04-01',devise:'FCFA',modePaiement:'Virement bancaire',notes:'',acomptes:[]},
];

const SEED_DEPENSES = [
  {id:1,numero:'DEP-2024-001',fournisseur:'Huawei Technologies',description:'Équipements 5G NR DLA-001',categorie:'Équipements',montant:28500000,devise:'FCFA',date:'2024-01-15',status:'paye',projet:'PROJ-2024-001 · DLA-001',bc:'BC-001'},
  {id:2,numero:'DEP-2024-002',fournisseur:'Nokia Networks',description:'Antennes 4G LTE x12',categorie:'Équipements',montant:15200,devise:'USD',date:'2024-02-01',status:'en_attente',projet:'PROJ-2024-004 · LIM-001',bc:'BC-002'},
  {id:3,numero:'DEP-2024-003',fournisseur:'Total Énergies',description:'Carburant véhicules janvier',categorie:'Transport',montant:850000,devise:'FCFA',date:'2024-01-31',status:'paye',projet:'Général',bc:''},
  {id:4,numero:'DEP-2024-004',fournisseur:'CAMTEL',description:'Liaisons fibre optique Q1',categorie:'Télécoms',montant:1200000,devise:'FCFA',date:'2024-02-15',status:'en_attente',projet:'Général',bc:''},
  {id:5,numero:'DEP-2024-005',fournisseur:'Ericsson Cameroun',description:'Maintenance 3G/4G',categorie:'Maintenance',montant:8500,devise:'EUR',date:'2024-02-20',status:'paye',projet:'PROJ-2024-003 · GAR-001',bc:'BC-003'},
];

const CASHFLOW = [
  {mois:'Oct',e:18500000,s:12000000},{mois:'Nov',e:22000000,s:14500000},
  {mois:'Déc',e:28000000,s:16000000},{mois:'Jan',e:25000000,s:18000000},
  {mois:'Fév',e:31000000,s:19500000},{mois:'Mar',e:35000000,s:21000000},
];

// ===== FORMULAIRE FIELD =====
const Field = ({label, children, required, col1}) => (
  <div style={{gridColumn:col1?'1/-1':'auto'}}>
    <label style={{display:'block',fontSize:13,fontWeight:600,color:C.text2,marginBottom:6}}>
      {label}{required&&<span style={{color:C.red,marginLeft:2}}>*</span>}
    </label>
    {children}
  </div>
);
const Input = ({type='text',value,onChange,placeholder,min,disabled,small}) => (
  <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} min={min} disabled={disabled}
    style={{width:'100%',padding:small?'7px 10px':'9px 12px',borderRadius:4,border:`1px solid ${C.border}`,fontSize:13,color:C.text,background:disabled?C.bg:C.white,boxSizing:'border-box',outline:'none',fontFamily:'inherit'}}
    onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border}/>
);
const Select = ({value,onChange,options,placeholder,small}) => (
  <select value={value} onChange={e=>onChange(e.target.value)}
    style={{width:'100%',padding:small?'7px 10px':'9px 12px',borderRadius:4,border:`1px solid ${C.border}`,fontSize:13,color:value?C.text:C.light,background:C.white,cursor:'pointer',outline:'none',fontFamily:'inherit'}}
    onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border}>
    <option value="">{placeholder||'Sélectionner...'}</option>
    {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
  </select>
);
const Textarea = ({value,onChange,placeholder,rows=4}) => (
  <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} rows={rows}
    style={{width:'100%',padding:'9px 12px',borderRadius:4,border:`1px solid ${C.border}`,fontSize:13,color:C.text,background:C.white,resize:'vertical',boxSizing:'border-box',outline:'none',fontFamily:'inherit'}}
    onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border}/>
);
const Btn = ({label,onClick,primary,danger,ghost,disabled,sm,icon}) => (
  <button onClick={onClick} disabled={disabled} style={{
    display:'inline-flex',alignItems:'center',gap:6,
    padding:sm?'6px 12px':'9px 16px',
    borderRadius:4,border:danger?`1px solid ${C.red}`:primary?'none':ghost?`1px solid ${C.border}`:'none',
    background:disabled?'#e4e4e4':danger?C.red:primary?C.green:ghost?C.white:C.white,
    color:disabled?C.light:danger||primary?C.white:C.green,
    fontWeight:600,fontSize:sm?12:13,cursor:disabled?'not-allowed':'pointer',
    whiteSpace:'nowrap',fontFamily:'inherit',transition:'opacity .1s',
  }} onMouseEnter={e=>{if(!disabled)e.currentTarget.style.opacity='0.88'}}
     onMouseLeave={e=>{if(!disabled)e.currentTarget.style.opacity='1'}}>
    {icon&&<Ico name={icon} size={14} color={disabled?C.light:danger||primary?C.white:C.green}/>}
    {label}
  </button>
);

// ===== PANEL LATÉRAL (style QuickBooks) =====
const SidePanel = ({title, subtitle, onClose, children, width=620}) => (
  <div style={{position:'fixed',inset:0,zIndex:200,display:'flex',justifyContent:'flex-end'}}>
    <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.35)'}}/>
    <div style={{position:'relative',width,maxWidth:'95vw',height:'100vh',background:C.white,boxShadow:'-4px 0 24px rgba(0,0,0,0.15)',display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Header panel */}
      <div style={{padding:'16px 24px',borderBottom:`1px solid ${C.border2}`,display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
        <div>
          {subtitle&&<div style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:0.5,marginBottom:2}}>{subtitle}</div>}
          <h2 style={{margin:0,fontSize:17,fontWeight:700,color:C.text}}>{title}</h2>
        </div>
        <button onClick={onClose} style={{width:32,height:32,borderRadius:4,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Ico name="close" size={16} color={C.muted}/>
        </button>
      </div>
      {/* Contenu scrollable */}
      <div style={{flex:1,overflow:'auto',padding:'20px 24px'}}>{children}</div>
    </div>
  </div>
);

// ===== TABLEAU QB =====
const QBTable = ({cols, rows, onRowClick, empty='Aucune donnée'}) => (
  <div style={{border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden',background:C.white}}>
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',minWidth:500}}>
        <thead>
          <tr style={{background:C.bg,borderBottom:`2px solid ${C.border}`}}>
            {cols.map(col=>(
              <th key={col} style={{padding:'9px 14px',textAlign:'left',fontSize:12,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:0.4,whiteSpace:'nowrap'}}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length===0&&(
            <tr><td colSpan={cols.length} style={{padding:'40px 14px',textAlign:'center',color:C.light,fontSize:14}}>{empty}</td></tr>
          )}
          {rows.map((row,i)=>(
            <tr key={i} onClick={()=>onRowClick&&onRowClick(i)}
              style={{borderBottom:`1px solid ${C.border2}`,background:i%2===0?C.white:'#fafafa',cursor:onRowClick?'pointer':'default',transition:'background .1s'}}
              onMouseEnter={e=>{if(onRowClick)e.currentTarget.style.background='#f0faf0'}}
              onMouseLeave={e=>{if(onRowClick)e.currentTarget.style.background=i%2===0?C.white:'#fafafa'}}>
              {row.map((cell,j)=>(
                <td key={j} style={{padding:'11px 14px',fontSize:13,color:C.text,verticalAlign:'middle'}}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ===== SPARKLINE =====
const Sparkline = ({data, color, height=40, width=120}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v,i)=>{
    const x = (i/(data.length-1))*width;
    const y = height - ((v-min)/range)*(height-4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts.split(' ').pop().split(',')[0]} cy={pts.split(' ').pop().split(',')[1]} r="3" fill={color}/>
    </svg>
  );
};

// ===== KPI CARD QB =====
const KpiCard = ({title, amount, sub, trend, color, sparkData, onClick}) => (
  <div onClick={onClick} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:6,padding:'18px 20px',flex:1,minWidth:160,cursor:onClick?'pointer':'default',transition:'box-shadow .15s'}}
    onMouseEnter={e=>{if(onClick)e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.1)'}}
    onMouseLeave={e=>{if(onClick)e.currentTarget.style.boxShadow='none'}}>
    <div style={{fontSize:12,fontWeight:600,color:C.muted,marginBottom:8,textTransform:'uppercase',letterSpacing:0.4}}>{title}</div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
      <div>
        <div style={{fontSize:22,fontWeight:700,color:color||C.text,marginBottom:4}}>{amount}</div>
        {sub&&<div style={{fontSize:12,color:C.muted}}>{sub}</div>}
        {trend!==undefined&&(
          <div style={{fontSize:12,fontWeight:600,color:trend>=0?C.green:C.red,marginTop:4,display:'flex',alignItems:'center',gap:3}}>
            <span>{trend>=0?'↑':'↓'}</span> {Math.abs(trend)}% vs mois dernier
          </div>
        )}
      </div>
      {sparkData&&<Sparkline data={sparkData} color={color||C.blue}/>}
    </div>
  </div>
);

// ===== FORMULAIRE FACTURE =====
const FormulaireFacture = ({onClose, onSave}) => {
  const [client, setClient] = useState('');
  const [projet, setProjet] = useState('');
  const [devise, setDevise] = useState('FCFA');
  const [dateEcheance, setDateEcheance] = useState('');
  const [modePaiement, setModePaiement] = useState('Virement bancaire');
  const [notes, setNotes] = useState('');
  const [lignes, setLignes] = useState([{desc:'',qte:1,pu:0,tva:true}]);
  const [saving, setSaving] = useState(false);

  const addL = () => setLignes(p=>[...p,{desc:'',qte:1,pu:0,tva:true}]);
  const updL = (i,k,v) => setLignes(p=>p.map((l,idx)=>idx===i?{...l,[k]:v}:l));
  const delL = (i) => setLignes(p=>p.filter((_,idx)=>idx!==i));
  const ht = lignes.reduce((s,l)=>s+l.qte*l.pu,0);
  const tvaTotal = lignes.reduce((s,l)=>s+(l.tva?l.qte*l.pu*TVA_RATE:0),0);
  const ttc = ht+tvaTotal;

  const save = (submit) => {
    if (!client) { alert('Client obligatoire'); return; }
    onSave({id:Date.now(),numero:`FAC-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900+100))}`,client,projet,devise,dateEcheance,dateEmission:new Date().toISOString().split('T')[0],modePaiement,notes,lignes,montantHT:ht,tva:tvaTotal,montantTTC:ttc,status:submit?'envoye':'brouillon',acomptes:[]});
    onClose();
  };

  return (
    <SidePanel title="Nouvelle facture" subtitle="Créer" onClose={onClose} width={720}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
        <Field label="Client" required col1>
          <Select value={client} onChange={setClient} options={CLIENTS} placeholder="Sélectionner un client"/>
        </Field>
        <Field label="Projet associé">
          <Select value={projet} onChange={setProjet} options={PROJETS_LIST} placeholder="Aucun"/>
        </Field>
        <Field label="Devise">
          <Select value={devise} onChange={setDevise} options={DEVISES_LIST}/>
        </Field>
        <Field label="Date échéance">
          <Input type="date" value={dateEcheance} onChange={setDateEcheance}/>
        </Field>
        <Field label="Mode de paiement">
          <Select value={modePaiement} onChange={setModePaiement} options={MODES_PAI}/>
        </Field>
      </div>

      {/* Lignes */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:0.5,marginBottom:10}}>Prestations</div>
        <div style={{border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:C.bg,borderBottom:`1px solid ${C.border}`}}>
                {['Description','Qté','Prix unitaire',`TVA ${(TVA_RATE*100).toFixed(2)}%`,'Total TTC',''].map(h=>(
                  <th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:11,fontWeight:700,color:C.muted,textTransform:'uppercase'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lignes.map((l,i)=>{
                const total = l.qte*l.pu*(l.tva?1+TVA_RATE:1);
                return (
                  <tr key={i} style={{borderBottom:`1px solid ${C.border2}`}}>
                    <td style={{padding:'6px 8px'}}><Input value={l.desc} onChange={v=>updL(i,'desc',v)} placeholder="Description de la prestation" small/></td>
                    <td style={{padding:'6px 8px',width:60}}><Input type="number" value={l.qte} onChange={v=>updL(i,'qte',+v)} small/></td>
                    <td style={{padding:'6px 8px',width:130}}><Input type="number" value={l.pu} onChange={v=>updL(i,'pu',+v)} small/></td>
                    <td style={{padding:'6px 12px',width:80,textAlign:'center'}}><input type="checkbox" checked={l.tva} onChange={e=>updL(i,'tva',e.target.checked)} style={{width:16,height:16,cursor:'pointer',accentColor:C.green}}/></td>
                    <td style={{padding:'6px 12px',fontSize:13,fontWeight:600,color:C.blue,width:130}}>{fmtN(Math.round(total))} {devise}</td>
                    <td style={{padding:'6px 8px',width:30}}>
                      {lignes.length>1&&<button onClick={()=>delL(i)} style={{width:24,height:24,borderRadius:4,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ico name="close" size={12} color={C.muted}/></button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{padding:'8px 12px',borderTop:`1px solid ${C.border2}`}}>
            <Btn label="+ Ajouter une ligne" onClick={addL} ghost sm/>
          </div>
        </div>
      </div>

      {/* Totaux */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
        <Field label="Notes">
          <Textarea value={notes} onChange={setNotes} placeholder="Conditions, notes..." rows={3}/>
        </Field>
        <div style={{background:C.bg,borderRadius:6,padding:'14px 16px'}}>
          {[
            {l:'Montant HT',v:`${fmtN(ht)} ${devise}`,c:C.text},
            {l:`TVA (${(TVA_RATE*100).toFixed(2)}%)`,v:`${fmtN(Math.round(tvaTotal))} ${devise}`,c:C.red},
            {l:'Montant TTC',v:`${fmtN(Math.round(ttc))} ${devise}`,c:C.blue,big:true},
          ].map(t=>(
            <div key={t.l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:t.big?'none':`1px solid ${C.border2}`}}>
              <span style={{fontSize:t.big?14:12,color:C.muted,fontWeight:t.big?600:400}}>{t.l}</span>
              <span style={{fontSize:t.big?18:13,fontWeight:t.big?800:600,color:t.c}}>{t.v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:'flex',gap:10,justifyContent:'flex-end',paddingTop:16,borderTop:`1px solid ${C.border2}`}}>
        <Btn label="Annuler" onClick={onClose} ghost/>
        <Btn label="Enregistrer brouillon" onClick={()=>save(false)} ghost icon="download"/>
        <Btn label="Créer et envoyer" onClick={()=>save(true)} primary icon="mail"/>
      </div>
    </SidePanel>
  );
};

// ===== DÉTAIL FACTURE =====
const DetailFacture = ({facture, onClose}) => {
  const totalPaye = facture.acomptes?.reduce((s,a)=>s+a.montant,0)||0;
  const reste = facture.montantTTC - totalPaye;
  return (
    <SidePanel title={facture.numero} subtitle={facture.client} onClose={onClose} width={660}>
      {/* Status + montant */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,padding:'14px 16px',background:C.bg,borderRadius:6}}>
        <div>
          <div style={{fontSize:11,color:C.muted,marginBottom:4}}>Montant TTC</div>
          <div style={{fontSize:26,fontWeight:700,color:C.blue}}>{fmtN(facture.montantTTC)} {facture.devise}</div>
        </div>
        <Badge status={facture.status}/>
      </div>

      {/* Infos */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
        {[
          {l:'Client',v:facture.client},{l:'Projet',v:facture.projet||'—'},
          {l:'Émission',v:fmtD(facture.dateEmission)},{l:'Échéance',v:fmtD(facture.dateEcheance)},
          {l:'Devise',v:facture.devise},{l:'Paiement',v:facture.modePaiement},
        ].map(item=>(
          <div key={item.l} style={{padding:'10px 12px',background:C.bg,borderRadius:4}}>
            <div style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:0.5,marginBottom:3}}>{item.l}</div>
            <div style={{fontSize:13,fontWeight:600,color:C.text}}>{item.v}</div>
          </div>
        ))}
      </div>

      {/* Lignes */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:0.5,marginBottom:10}}>Prestations</div>
        <QBTable
          cols={['Description','Qté','P.U.','TVA','Total TTC']}
          rows={facture.lignes.map(l=>{
            const ht = l.qte*l.pu;
            const tva = l.tva?ht*TVA_RATE:0;
            return [l.desc, l.qte, `${fmtN(l.pu)} ${facture.devise}`, l.tva?`${(TVA_RATE*100).toFixed(2)}%`:'Exonéré', <strong style={{color:C.blue}}>{fmtN(ht+tva)} {facture.devise}</strong>];
          })}
        />
      </div>

      {/* Totaux */}
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:20}}>
        <div style={{width:280,background:C.bg,borderRadius:6,padding:'14px 16px'}}>
          {[
            {l:'Montant HT',v:`${fmtN(facture.montantHT)} ${facture.devise}`,c:C.text},
            {l:`TVA (${(TVA_RATE*100).toFixed(2)}%)`,v:`${fmtN(facture.tva)} ${facture.devise}`,c:C.red},
            {l:'Montant TTC',v:`${fmtN(facture.montantTTC)} ${facture.devise}`,c:C.blue,big:true},
            ...(totalPaye>0?[
              {l:'Acomptes reçus',v:`- ${fmtN(totalPaye)} ${facture.devise}`,c:C.green},
              {l:'Reste à payer',v:`${fmtN(reste)} ${facture.devise}`,c:C.orange,big:true},
            ]:[]),
          ].map(t=>(
            <div key={t.l} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:t.big?'none':`1px solid ${C.border2}`}}>
              <span style={{fontSize:t.big?13:12,fontWeight:t.big?600:400,color:C.muted}}>{t.l}</span>
              <span style={{fontSize:t.big?17:13,fontWeight:t.big?800:600,color:t.c}}>{t.v}</span>
            </div>
          ))}
        </div>
      </div>

      {facture.notes&&(
        <div style={{marginBottom:16,padding:12,background:'#fffbf0',borderRadius:4,border:`1px solid ${C.border2}`,fontSize:13,color:C.text2}}>{facture.notes}</div>
      )}

      {facture.acomptes?.length>0&&(
        <div style={{marginBottom:16,padding:12,background:C.green_bg,borderRadius:4,border:`1px solid ${C.border2}`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:6}}>Acomptes reçus</div>
          {facture.acomptes.map((a,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
              <span>{fmtD(a.date)} — {a.ref}</span>
              <strong style={{color:C.green}}>{fmtN(a.montant)} {facture.devise}</strong>
            </div>
          ))}
        </div>
      )}

      <div style={{display:'flex',gap:8,flexWrap:'wrap',paddingTop:16,borderTop:`1px solid ${C.border2}`}}>
        <Btn label="Imprimer" onClick={()=>{}} ghost icon="print" sm/>
        <Btn label="Envoyer" onClick={()=>{}} ghost icon="mail" sm/>
        <Btn label="Télécharger PDF" onClick={()=>{}} ghost icon="download" sm/>
        <Btn label="Enreg. paiement" onClick={()=>{}} primary icon="check" sm/>
        <Btn label="Dupliquer" onClick={()=>{}} ghost icon="edit" sm/>
        <Btn label="Annuler" onClick={()=>{}} danger sm/>
      </div>
    </SidePanel>
  );
};

// ===== FORMULAIRE DÉPENSE =====
const FormulaireDépense = ({onClose, onSave}) => {
  const [fournisseur, setFournisseur] = useState('');
  const [description, setDescription] = useState('');
  const [categorie, setCategorie] = useState('');
  const [montant, setMontant] = useState('');
  const [devise, setDevise] = useState('FCFA');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [projet, setProjet] = useState('');
  const [bc, setBc] = useState('');
  const [lignes, setLignes] = useState([{desc:'',qte:1,pu:0}]);

  const addL = () => setLignes(p=>[...p,{desc:'',qte:1,pu:0}]);
  const updL = (i,k,v) => setLignes(p=>p.map((l,idx)=>idx===i?{...l,[k]:v}:l));
  const delL = (i) => setLignes(p=>p.filter((_,idx)=>idx!==i));
  const total = lignes.reduce((s,l)=>s+l.qte*l.pu,0);

  const save = () => {
    if (!fournisseur) { alert('Fournisseur obligatoire'); return; }
    onSave({id:Date.now(),numero:`DEP-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900+100))}`,fournisseur,description,categorie,montant:total||Number(montant)||0,devise,date,projet,bc,status:'en_attente',lignes});
    onClose();
  };

  return (
    <SidePanel title="Nouvelle dépense" subtitle="Enregistrer" onClose={onClose} width={700}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
        <Field label="Fournisseur" required>
          <Select value={fournisseur} onChange={setFournisseur} options={FOURNISSEURS_LIST} placeholder="Sélectionner"/>
        </Field>
        <Field label="Catégorie" required>
          <Select value={categorie} onChange={setCategorie} options={CATEGORIES_DEP} placeholder="Catégorie"/>
        </Field>
        <Field label="Date" required>
          <Input type="date" value={date} onChange={setDate}/>
        </Field>
        <Field label="Devise">
          <Select value={devise} onChange={setDevise} options={DEVISES_LIST}/>
        </Field>
        <Field label="Projet lié">
          <Select value={projet} onChange={setProjet} options={[...PROJETS_LIST,'Général']} placeholder="Aucun"/>
        </Field>
        <Field label="Bon de commande">
          <Input value={bc} onChange={setBc} placeholder="BC-2024-XXX"/>
        </Field>
        <Field label="Description" col1>
          <Input value={description} onChange={setDescription} placeholder="Description de la dépense"/>
        </Field>
      </div>

      <div style={{marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:0.5,marginBottom:10}}>Lignes de dépense</div>
        <div style={{border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:C.bg,borderBottom:`1px solid ${C.border}`}}>
                {['Description','Qté','Prix unitaire','Total',''].map(h=>(
                  <th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:11,fontWeight:700,color:C.muted,textTransform:'uppercase'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lignes.map((l,i)=>(
                <tr key={i} style={{borderBottom:`1px solid ${C.border2}`}}>
                  <td style={{padding:'6px 8px'}}><Input value={l.desc} onChange={v=>updL(i,'desc',v)} placeholder="Description" small/></td>
                  <td style={{padding:'6px 8px',width:60}}><Input type="number" value={l.qte} onChange={v=>updL(i,'qte',+v)} small/></td>
                  <td style={{padding:'6px 8px',width:130}}><Input type="number" value={l.pu} onChange={v=>updL(i,'pu',+v)} small/></td>
                  <td style={{padding:'6px 12px',fontSize:13,fontWeight:600,color:C.red,width:130}}>{fmtN(l.qte*l.pu)} {devise}</td>
                  <td style={{padding:'6px 8px',width:30}}>
                    {lignes.length>1&&<button onClick={()=>delL(i)} style={{width:24,height:24,borderRadius:4,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ico name="close" size={12} color={C.muted}/></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{padding:'8px 12px',borderTop:`1px solid ${C.border2}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <Btn label="+ Ajouter une ligne" onClick={addL} ghost sm/>
            <span style={{fontSize:14,fontWeight:700,color:C.red}}>{fmtN(total||Number(montant)||0)} {devise}</span>
          </div>
        </div>
      </div>

      {total===0&&(
        <div style={{marginBottom:16}}>
          <Field label="Montant direct (si pas de lignes)">
            <Input type="number" value={montant} onChange={setMontant} placeholder="0"/>
          </Field>
        </div>
      )}

      <div style={{display:'flex',gap:10,justifyContent:'flex-end',paddingTop:16,borderTop:`1px solid ${C.border2}`}}>
        <Btn label="Annuler" onClick={onClose} ghost/>
        <Btn label="Enregistrer dépense" onClick={save} primary icon="check"/>
      </div>
    </SidePanel>
  );
};

// ===== DASHBOARD QB =====
const Dashboard = ({factures, depenses, onNavigate}) => {
  const totalCA = factures.reduce((s,f)=>s+f.montantTTC,0);
  const totalPaye = factures.filter(f=>f.status==='paye').reduce((s,f)=>s+f.montantTTC,0);
  const totalImpaye = factures.filter(f=>['envoye','partiel','en_retard'].includes(f.status)).reduce((s,f)=>s+f.montantTTC,0);
  const totalDep = depenses.reduce((s,d)=>s+(d.devise==='FCFA'?d.montant:d.montant*DEVISES_RATES[d.devise]||d.montant),0);
  const benefice = totalPaye - totalDep;
  const maxFlow = Math.max(...CASHFLOW.map(c=>Math.max(c.e,c.s)));

  return (
    <div>
      {/* KPI Cards */}
      <div style={{display:'flex',gap:14,marginBottom:24,flexWrap:'wrap'}}>
        <KpiCard title="Revenus (facturé)" amount={`${fmtN(totalCA)} FCFA`} sub={`${fmtN(totalPaye)} FCFA encaissé`} trend={12} color={C.blue} sparkData={CASHFLOW.map(c=>c.e)} onClick={()=>onNavigate('factures')}/>
        <KpiCard title="Dépenses" amount={`${fmtN(totalDep)} FCFA`} sub={`${depenses.filter(d=>d.status==='en_attente').length} en attente`} trend={5} color={C.red} sparkData={CASHFLOW.map(c=>c.s)} onClick={()=>onNavigate('depenses')}/>
        <KpiCard title="Bénéfice net" amount={`${fmtN(benefice)} FCFA`} sub={`${Math.round(benefice/totalCA*100)}% de marge`} trend={15} color={benefice>=0?C.green:C.red} sparkData={CASHFLOW.map((c,i)=>c.e-c.s)}/>
        <KpiCard title="À encaisser" amount={`${fmtN(totalImpaye)} FCFA`} sub={`${factures.filter(f=>f.status==='en_retard').length} en retard`} color={C.orange} onClick={()=>onNavigate('factures')}/>
      </div>

      {/* Graphiques */}
      <div style={{display:'grid',gridTemplateColumns:'1.6fr 1fr',gap:18,marginBottom:24}}>
        {/* Profit & Loss */}
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:6,padding:20}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
            <h3 style={{margin:0,fontSize:15,fontWeight:700,color:C.text}}>Profit & Loss — 6 mois</h3>
            <div style={{display:'flex',gap:14,fontSize:12,color:C.muted}}>
              <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:10,height:10,background:C.blue,borderRadius:2,display:'inline-block'}}/>Revenus</span>
              <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:10,height:10,background:C.red,borderRadius:2,display:'inline-block'}}/>Dépenses</span>
              <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:10,height:10,background:C.green,borderRadius:2,display:'inline-block'}}/>Bénéfice</span>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'flex-end',gap:8,height:150}}>
            {CASHFLOW.map((c,i)=>{
              const marge = c.e-c.s;
              return (
                <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                  <div style={{width:'100%',display:'flex',gap:2,alignItems:'flex-end',height:120}}>
                    <div style={{flex:1,height:`${(c.e/maxFlow)*120}px`,background:C.blue,borderRadius:'2px 2px 0 0',opacity:0.85}}/>
                    <div style={{flex:1,height:`${(c.s/maxFlow)*120}px`,background:C.red,borderRadius:'2px 2px 0 0',opacity:0.75}}/>
                    <div style={{flex:1,height:`${Math.max(0,(marge/maxFlow)*120)}px`,background:C.green,borderRadius:'2px 2px 0 0',opacity:0.85}}/>
                  </div>
                  <span style={{fontSize:10,color:C.muted,fontWeight:600}}>{c.mois}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comptes bancaires */}
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden'}}>
          <div style={{padding:'14px 18px',borderBottom:`1px solid ${C.border2}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <h3 style={{margin:0,fontSize:14,fontWeight:700,color:C.text}}>Comptes bancaires</h3>
            <button onClick={()=>onNavigate('tresorerie')} style={{fontSize:12,color:C.green,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Voir tout</button>
          </div>
          {[
            {nom:'BICEC Principal',solde:28450000},
            {nom:'SGC Secondaire',solde:12800000},
            {nom:'Caisse',solde:1250000},
          ].map((b,i)=>(
            <div key={i} style={{padding:'12px 18px',borderBottom:`1px solid ${C.border2}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:34,height:34,borderRadius:4,background:C.blue_bg,display:'flex',alignItems:'center',justifyContent:'center'}}><Ico name="bank" size={16} color={C.blue}/></div>
                <span style={{fontSize:13,fontWeight:500,color:C.text}}>{b.nom}</span>
              </div>
              <span style={{fontSize:14,fontWeight:700,color:C.green}}>{fmtN(b.solde)} FCFA</span>
            </div>
          ))}
          <div style={{padding:'12px 18px',background:C.green_bg,borderTop:`2px solid ${C.green}`}}>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <span style={{fontSize:13,fontWeight:700,color:C.green}}>Solde total</span>
              <span style={{fontSize:16,fontWeight:800,color:C.green}}>{fmtN(42500000)} FCFA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Factures récentes + Dépenses récentes */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <h3 style={{margin:0,fontSize:14,fontWeight:700,color:C.text}}>Factures récentes</h3>
            <button onClick={()=>onNavigate('factures')} style={{fontSize:12,color:C.green,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Voir tout</button>
          </div>
          <QBTable
            cols={['Client','Montant','Échéance','Statut']}
            rows={factures.slice(0,4).map(f=>[
              <span style={{fontWeight:500}}>{f.client}</span>,
              <span style={{fontWeight:600,color:C.blue}}>{fmtN(f.montantTTC)}</span>,
              <span style={{fontSize:12,color:new Date(f.dateEcheance)<new Date()&&f.status!=='paye'?C.red:C.muted}}>{fmtD(f.dateEcheance)}</span>,
              <Badge status={f.status}/>
            ])}
            onRowClick={()=>onNavigate('factures')}
          />
        </div>
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <h3 style={{margin:0,fontSize:14,fontWeight:700,color:C.text}}>Dépenses récentes</h3>
            <button onClick={()=>onNavigate('depenses')} style={{fontSize:12,color:C.green,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Voir tout</button>
          </div>
          <QBTable
            cols={['Fournisseur','Catégorie','Montant','Statut']}
            rows={depenses.slice(0,4).map(d=>[
              <span style={{fontWeight:500}}>{d.fournisseur}</span>,
              <span style={{fontSize:12,color:C.muted}}>{d.categorie}</span>,
              <span style={{fontWeight:600,color:C.red}}>{fmtN(d.montant)}</span>,
              <Badge status={d.status}/>
            ])}
            onRowClick={()=>onNavigate('depenses')}
          />
        </div>
      </div>
    </div>
  );
};

// ===== VUE FACTURES =====
const VueFactures = ({factures, setFactures}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const filtered = factures.filter(f=>{
    const ms = !search||f.client.toLowerCase().includes(search.toLowerCase())||f.numero.toLowerCase().includes(search.toLowerCase());
    const mf = filterStatus==='tous'||f.status===filterStatus;
    return ms&&mf;
  });

  const stats = {
    total: filtered.reduce((s,f)=>s+f.montantTTC,0),
    paye: filtered.filter(f=>f.status==='paye').reduce((s,f)=>s+f.montantTTC,0),
    retard: filtered.filter(f=>f.status==='en_retard').reduce((s,f)=>s+f.montantTTC,0),
    attente: filtered.filter(f=>['envoye','partiel'].includes(f.status)).length,
  };

  return (
    <div>
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <KpiCard title="Total TTC" amount={`${fmtN(stats.total)} FCFA`} color={C.blue}/>
        <KpiCard title="Encaissé" amount={`${fmtN(stats.paye)} FCFA`} color={C.green}/>
        <KpiCard title="En retard" amount={`${fmtN(stats.retard)} FCFA`} color={C.red}/>
        <KpiCard title="En attente" amount={stats.attente} sub="factures" color={C.orange}/>
      </div>

      <div style={{display:'flex',gap:10,marginBottom:16,alignItems:'center',flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:220,display:'flex',alignItems:'center',gap:8,background:C.white,border:`1px solid ${C.border}`,borderRadius:4,padding:'8px 12px'}}>
          <Ico name="search" size={16} color={C.muted}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Client, numéro de facture..."
            style={{flex:1,border:'none',outline:'none',fontSize:13,color:C.text,background:'transparent',fontFamily:'inherit'}}/>
        </div>
        <div style={{display:'flex',background:C.white,border:`1px solid ${C.border}`,borderRadius:4,padding:2,gap:2}}>
          {['tous','brouillon','envoye','partiel','paye','en_retard'].map(s=>(
            <button key={s} onClick={()=>setFilterStatus(s)} style={{padding:'6px 12px',borderRadius:3,border:'none',background:filterStatus===s?C.green:'transparent',color:filterStatus===s?C.white:C.muted,fontWeight:filterStatus===s?700:400,fontSize:12,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit'}}>
              {s==='tous'?'Toutes':s==='brouillon'?'Brouillon':s==='envoye'?'Envoyées':s==='partiel'?'Partielles':s==='paye'?'Payées':'En retard'}
            </button>
          ))}
        </div>
        <Btn label="Exporter" onClick={()=>{}} ghost icon="download" sm/>
        <Btn label="Nouvelle facture" onClick={()=>setShowNew(true)} primary icon="plus"/>
      </div>

      <QBTable
        cols={['Numéro','Client','Projet','Montant HT','TVA','Montant TTC','Devise','Émission','Échéance','Statut','']}
        rows={filtered.map(f=>[
          <span style={{fontWeight:700,color:C.blue,fontFamily:'monospace',cursor:'pointer'}} onClick={()=>setSelected(f)}>{f.numero}</span>,
          <span style={{fontWeight:500}}>{f.client}</span>,
          <span style={{fontSize:12,color:C.muted}}>{f.projet||'—'}</span>,
          fmtN(f.montantHT),
          <span style={{color:C.red}}>{fmtN(f.tva)}</span>,
          <strong style={{color:C.text}}>{fmtN(f.montantTTC)}</strong>,
          <span style={{padding:'2px 7px',borderRadius:10,background:f.devise==='FCFA'?C.blue_bg:f.devise==='USD'?C.green_bg:C.orange_bg,color:f.devise==='FCFA'?C.blue:f.devise==='USD'?C.green:C.orange,fontSize:11,fontWeight:700}}>{f.devise}</span>,
          <span style={{fontSize:12,color:C.muted}}>{fmtD(f.dateEmission)}</span>,
          <span style={{fontSize:12,fontWeight:new Date(f.dateEcheance)<new Date()&&f.status!=='paye'?700:400,color:new Date(f.dateEcheance)<new Date()&&f.status!=='paye'?C.red:C.muted}}>{fmtD(f.dateEcheance)}</span>,
          <Badge status={f.status}/>,
          <div style={{display:'flex',gap:4}}>
            {[{n:'eye',a:()=>setSelected(f)},{n:'edit',a:()=>{}},{n:'mail',a:()=>{}},{n:'print',a:()=>{}}].map(({n,a})=>(
              <button key={n} onClick={a} style={{width:28,height:28,borderRadius:4,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ico name={n} size={13} color={C.muted}/></button>
            ))}
          </div>
        ])}
        onRowClick={i=>setSelected(filtered[i])}
      />

      {selected&&<DetailFacture facture={selected} onClose={()=>setSelected(null)}/>}
      {showNew&&<FormulaireFacture onClose={()=>setShowNew(false)} onSave={f=>setFactures(p=>[f,...p])}/>}
    </div>
  );
};

// ===== VUE DÉPENSES =====
const VueDepenses = ({depenses, setDepenses}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [showNew, setShowNew] = useState(false);

  const filtered = depenses.filter(d=>{
    const ms = !search||d.fournisseur.toLowerCase().includes(search.toLowerCase())||d.description.toLowerCase().includes(search.toLowerCase());
    const mf = filterStatus==='tous'||d.status===filterStatus;
    return ms&&mf;
  });

  const totalFCFA = filtered.reduce((s,d)=>s+(d.devise==='FCFA'?d.montant:d.montant*DEVISES_RATES[d.devise]||d.montant),0);

  return (
    <div>
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <KpiCard title="Total dépenses" amount={`${fmtN(totalFCFA)} FCFA`} color={C.red}/>
        <KpiCard title="Payées" amount={`${fmtN(filtered.filter(d=>d.status==='paye').reduce((s,d)=>s+(d.devise==='FCFA'?d.montant:d.montant*DEVISES_RATES[d.devise]||d.montant),0))} FCFA`} color={C.green}/>
        <KpiCard title="En attente" amount={filtered.filter(d=>d.status==='en_attente').length} sub="dépenses" color={C.orange}/>
        <KpiCard title="Fournisseurs" amount={new Set(filtered.map(d=>d.fournisseur)).size} sub="actifs" color={C.blue}/>
      </div>

      <div style={{display:'flex',gap:10,marginBottom:16,alignItems:'center',flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:220,display:'flex',alignItems:'center',gap:8,background:C.white,border:`1px solid ${C.border}`,borderRadius:4,padding:'8px 12px'}}>
          <Ico name="search" size={16} color={C.muted}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Fournisseur, description..."
            style={{flex:1,border:'none',outline:'none',fontSize:13,color:C.text,background:'transparent',fontFamily:'inherit'}}/>
        </div>
        <div style={{display:'flex',background:C.white,border:`1px solid ${C.border}`,borderRadius:4,padding:2,gap:2}}>
          {[{v:'tous',l:'Toutes'},{v:'paye',l:'Payées'},{v:'en_attente',l:'En attente'},{v:'rejete',l:'Rejetées'}].map(s=>(
            <button key={s.v} onClick={()=>setFilterStatus(s.v)} style={{padding:'6px 12px',borderRadius:3,border:'none',background:filterStatus===s.v?C.green:'transparent',color:filterStatus===s.v?C.white:C.muted,fontWeight:filterStatus===s.v?700:400,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>{s.l}</button>
          ))}
        </div>
        <Btn label="Exporter" onClick={()=>{}} ghost icon="download" sm/>
        <Btn label="Nouvelle dépense" onClick={()=>setShowNew(true)} primary icon="plus"/>
      </div>

      <QBTable
        cols={['Référence','Fournisseur','Description','Catégorie','Projet','Montant','Devise','Date','Statut','']}
        rows={filtered.map(d=>[
          <span style={{fontWeight:700,color:C.red,fontFamily:'monospace'}}>{d.numero}</span>,
          <span style={{fontWeight:500}}>{d.fournisseur}</span>,
          <span style={{fontSize:12,color:C.muted}}>{d.description}</span>,
          <span style={{padding:'2px 8px',borderRadius:10,background:C.bg,fontSize:11,fontWeight:600,color:C.text2}}>{d.categorie}</span>,
          <span style={{fontSize:12,color:C.blue,fontWeight:500}}>{d.projet}</span>,
          <strong style={{color:C.text}}>{fmtN(d.montant)}</strong>,
          <span style={{padding:'2px 7px',borderRadius:10,background:C.green_bg,color:C.green,fontSize:11,fontWeight:700}}>{d.devise}</span>,
          <span style={{fontSize:12,color:C.muted}}>{fmtD(d.date)}</span>,
          <Badge status={d.status}/>,
          <div style={{display:'flex',gap:4}}>
            <button onClick={()=>setDepenses(p=>p.map(dep=>dep.id===d.id?{...dep,status:'paye'}:dep))} style={{width:28,height:28,borderRadius:4,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ico name="check" size={13} color={C.green}/></button>
            <button onClick={()=>setDepenses(p=>p.map(dep=>dep.id===d.id?{...dep,status:'rejete'}:dep))} style={{width:28,height:28,borderRadius:4,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ico name="close" size={13} color={C.red}/></button>
          </div>
        ])}
      />

      {showNew&&<FormulaireDépense onClose={()=>setShowNew(false)} onSave={d=>setDepenses(p=>[d,...p])}/>}
    </div>
  );
};

// ===== VUE RAPPORTS P&L =====
const VueRapports = ({factures, depenses}) => {
  const [periode, setPeriode] = useState('2024');
  const totalCA = factures.reduce((s,f)=>s+f.montantHT,0);
  const totalCharges = depenses.reduce((s,d)=>s+(d.devise==='FCFA'?d.montant:d.montant*DEVISES_RATES[d.devise]||d.montant),0);
  const salaires = 18200000;
  const loyers = 3600000;
  const amort = 3200000;
  const autresProduits = 2500000;
  const totalProduits = totalCA + autresProduits;
  const totalChargesTotal = totalCharges + salaires + loyers + amort;
  const resultat = totalProduits - totalChargesTotal;

  const PRODUITS = [
    {compte:'701',libelle:'Chiffre d\'affaires prestations',montant:totalCA},
    {compte:'706',libelle:'Autres produits exploitation',montant:autresProduits},
  ];
  const CHARGES = [
    {compte:'601',libelle:'Achats matières et sous-traitance',montant:Math.round(totalCharges*0.6)},
    {compte:'613',libelle:'Services extérieurs',montant:Math.round(totalCharges*0.25)},
    {compte:'624',libelle:'Transports et déplacements',montant:Math.round(totalCharges*0.15)},
    {compte:'641',libelle:'Charges de personnel',montant:salaires},
    {compte:'613',libelle:'Charges locatives',montant:loyers},
    {compte:'681',libelle:'Dotations amortissements',montant:amort},
  ];

  const TVA_collectee = factures.reduce((s,f)=>s+f.tva,0);
  const TVA_deductible = depenses.filter(d=>d.devise==='FCFA'&&d.status==='paye').reduce((s,d)=>s+d.montant*TVA_RATE,0);

  return (
    <div>
      {/* Sélecteur période */}
      <div style={{display:'flex',gap:10,marginBottom:20,alignItems:'center'}}>
        <div style={{fontSize:13,color:C.muted}}>Période :</div>
        <div style={{display:'flex',gap:4,background:C.white,border:`1px solid ${C.border}`,borderRadius:4,padding:2}}>
          {['2024','T1 2024','T4 2023'].map(p=>(
            <button key={p} onClick={()=>setPeriode(p)} style={{padding:'6px 14px',borderRadius:3,border:'none',background:periode===p?C.green:'transparent',color:periode===p?C.white:C.muted,fontWeight:periode===p?700:400,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>{p}</button>
          ))}
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <Btn label="Imprimer" onClick={()=>{}} ghost icon="print" sm/>
          <Btn label="Exporter PDF" onClick={()=>{}} ghost icon="download" sm/>
          <Btn label="Exporter Excel" onClick={()=>{}} primary icon="download" sm/>
        </div>
      </div>

      {/* KPIs P&L */}
      <div style={{display:'flex',gap:12,marginBottom:24}}>
        <KpiCard title="Total produits" amount={`${fmtN(totalProduits)} FCFA`} color={C.green} trend={12}/>
        <KpiCard title="Total charges" amount={`${fmtN(totalChargesTotal)} FCFA`} color={C.red} trend={5}/>
        <KpiCard title="Résultat net" amount={`${resultat>=0?'+':''}${fmtN(resultat)} FCFA`} color={resultat>=0?C.green:C.red} trend={15}/>
        <KpiCard title="Marge nette" amount={`${Math.round(resultat/totalProduits*100)}%`} color={resultat>=0?C.green:C.red}/>
      </div>

      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden',marginBottom:20}}>
        {/* En-tête rapport */}
        <div style={{padding:'16px 20px',background:C.green,color:C.white}}>
          <div style={{fontSize:16,fontWeight:700}}>Compte de Résultat — {periode}</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.75)',marginTop:2}}>Conforme au Plan Comptable OHADA · CleanIT ERP Télécom</div>
        </div>

        {/* Produits */}
        <div style={{padding:'16px 20px'}}>
          <div style={{fontSize:12,fontWeight:800,color:C.green,textTransform:'uppercase',letterSpacing:0.8,marginBottom:8,paddingBottom:6,borderBottom:`2px solid ${C.green}`}}>
            Produits d'exploitation
          </div>
          {PRODUITS.map((p,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 10px',background:i%2===0?C.white:'#fafafa',borderRadius:3,marginBottom:2}}>
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <span style={{fontSize:11,fontFamily:'monospace',color:C.muted,width:36}}>{p.compte}</span>
                <span style={{fontSize:13,color:C.text}}>{p.libelle}</span>
              </div>
              <span style={{fontSize:13,fontWeight:600,color:C.green}}>{fmtN(p.montant)} FCFA</span>
            </div>
          ))}
          <div style={{display:'flex',justifyContent:'space-between',padding:'11px 10px',background:C.green_bg,borderRadius:4,marginTop:6,border:`1px solid ${C.border2}`}}>
            <span style={{fontSize:14,fontWeight:700,color:C.green}}>TOTAL PRODUITS</span>
            <span style={{fontSize:16,fontWeight:900,color:C.green}}>{fmtN(totalProduits)} FCFA</span>
          </div>
        </div>

        {/* Charges */}
        <div style={{padding:'0 20px 16px'}}>
          <div style={{fontSize:12,fontWeight:800,color:C.red,textTransform:'uppercase',letterSpacing:0.8,marginBottom:8,paddingBottom:6,borderBottom:`2px solid ${C.red}`}}>
            Charges d'exploitation
          </div>
          {CHARGES.map((c,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 10px',background:i%2===0?C.white:'#fafafa',borderRadius:3,marginBottom:2}}>
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <span style={{fontSize:11,fontFamily:'monospace',color:C.muted,width:36}}>{c.compte}</span>
                <span style={{fontSize:13,color:C.text}}>{c.libelle}</span>
              </div>
              <span style={{fontSize:13,fontWeight:600,color:C.red}}>{fmtN(c.montant)} FCFA</span>
            </div>
          ))}
          <div style={{display:'flex',justifyContent:'space-between',padding:'11px 10px',background:C.red_bg,borderRadius:4,marginTop:6,border:`1px solid ${C.border2}`}}>
            <span style={{fontSize:14,fontWeight:700,color:C.red}}>TOTAL CHARGES</span>
            <span style={{fontSize:16,fontWeight:900,color:C.red}}>{fmtN(totalChargesTotal)} FCFA</span>
          </div>
        </div>

        {/* Résultat */}
        <div style={{padding:'16px 20px',background:resultat>=0?C.green_bg:C.red_bg,borderTop:`2px solid ${resultat>=0?C.green:C.red}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:16,fontWeight:800,color:resultat>=0?C.green:C.red}}>RÉSULTAT NET DE L'EXERCICE</span>
            <span style={{fontSize:28,fontWeight:900,color:resultat>=0?C.green:C.red}}>{resultat>=0?'+':''}{fmtN(resultat)} FCFA</span>
          </div>
        </div>
      </div>

      {/* TVA */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden'}}>
          <div style={{padding:'12px 16px',background:C.bg,borderBottom:`1px solid ${C.border}`,fontSize:14,fontWeight:700,color:C.text}}>TVA — Taux {(TVA_RATE*100).toFixed(2)}%</div>
          <div style={{padding:16}}>
            {[
              {l:'TVA collectée',v:TVA_collectee,c:C.red},
              {l:'TVA déductible',v:TVA_deductible,c:C.green},
              {l:'TVA nette à verser',v:TVA_collectee-TVA_deductible,c:C.orange,big:true},
            ].map(t=>(
              <div key={t.l} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:t.big?'none':`1px solid ${C.border2}`}}>
                <span style={{fontSize:t.big?13:12,fontWeight:t.big?600:400,color:C.muted}}>{t.l}</span>
                <span style={{fontSize:t.big?18:13,fontWeight:t.big?800:600,color:t.c}}>{fmtN(Math.round(t.v))} FCFA</span>
              </div>
            ))}
            <div style={{marginTop:12,padding:'8px 12px',background:'#fffbf0',borderRadius:4,border:`1px solid ${C.border2}`,fontSize:12,color:C.orange,fontWeight:600}}>
              ⚠️ Prochaine déclaration : 31/03/2024
            </div>
          </div>
        </div>

        {/* Balance âgée */}
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden'}}>
          <div style={{padding:'12px 16px',background:C.bg,borderBottom:`1px solid ${C.border}`,fontSize:14,fontWeight:700,color:C.text}}>Balance âgée des créances</div>
          <QBTable
            cols={['Client','Total','0-30j','+30j']}
            rows={[
              ['Orange Cameroun',<span style={{fontWeight:700}}>{fmtN(10195875)}</span>,<span style={{color:C.orange,fontWeight:700}}>{fmtN(10195875)}</span>,'—'],
              ['Gouvernement',<span style={{fontWeight:700}}>{fmtN(26712000)}</span>,<span style={{color:C.green,fontWeight:700}}>{fmtN(26712000)}</span>,'—'],
            ]}
          />
        </div>
      </div>
    </div>
  );
};

// ===== NAVIGATION LATÉRALE QB =====
const NAV = [
  {id:'dashboard',  label:'Tableau de bord', icon:'home'},
  {id:'factures',   label:'Factures',         icon:'invoice'},
  {id:'depenses',   label:'Dépenses',          icon:'expense'},
  {id:'rapports',   label:'Rapports',          icon:'report'},
  {id:'tva',        label:'TVA',              icon:'tax'},
  {id:'tresorerie', label:'Trésorerie',        icon:'bank'},
  {id:'comptable',  label:'Plan comptable',    icon:'chart'},
  {id:'fournisseurs',label:'Fournisseurs',     icon:'vendor'},
  {id:'rentabilite',label:'Rentabilité',       icon:'profit'},
];

// ===== RENTABILITÉ PROJETS =====
const VueRentabilite = ({factures, depenses}) => {
  const projets = [
    {code:'PROJ-2024-001',titre:'Installation 5G NR DLA-001',client:'MTN Cameroun',contrat:45000000},
    {code:'PROJ-2024-002',titre:'Maintenance Orange Q1',client:'Orange Cameroun',contrat:12000000},
    {code:'PROJ-2024-003',titre:'Survey Garoua Nord',client:'Gouvernement',contrat:8500000},
    {code:'PROJ-2024-004',titre:'Déploiement 4G LTE Limbé',client:'MTN Cameroun',contrat:18500000},
  ].map(p=>{
    const code = PROJETS_LIST.find(pl=>pl.startsWith(p.code));
    const dep = depenses.filter(d=>d.projet===code).reduce((s,d)=>s+(d.devise==='FCFA'?d.montant:d.montant*DEVISES_RATES[d.devise]||d.montant),0);
    const fac = factures.filter(f=>f.projet===code).reduce((s,f)=>s+f.montantTTC,0);
    const marge = p.contrat - dep;
    const pct = Math.round(marge/p.contrat*100);
    return {...p, dep, fac, marge, pct};
  });

  return (
    <div>
      <div style={{display:'flex',gap:12,marginBottom:20}}>
        <KpiCard title="CA total" amount={`${fmtN(projets.reduce((s,p)=>s+p.contrat,0))} FCFA`} color={C.blue}/>
        <KpiCard title="Dépenses" amount={`${fmtN(projets.reduce((s,p)=>s+p.dep,0))} FCFA`} color={C.red}/>
        <KpiCard title="Marge globale" amount={`${fmtN(projets.reduce((s,p)=>s+p.marge,0))} FCFA`} color={C.green}/>
        <KpiCard title="Marge %" amount={`${Math.round(projets.reduce((s,p)=>s+p.marge,0)/projets.reduce((s,p)=>s+p.contrat,0)*100)}%`} color={C.green}/>
      </div>
      <QBTable
        cols={['Projet','Client','Contrat','Dépenses engagées','Marge réelle','%','Indicateur']}
        rows={projets.map(p=>[
          <div><div style={{fontWeight:600,fontSize:13,color:C.text}}>{p.code}</div><div style={{fontSize:11,color:C.muted}}>{p.titre}</div></div>,
          p.client,
          <span style={{fontWeight:600,color:C.blue}}>{fmtN(p.contrat)}</span>,
          <span style={{fontWeight:600,color:C.red}}>{fmtN(p.dep)}</span>,
          <span style={{fontWeight:700,color:p.marge>=0?C.green:C.red}}>{p.marge>=0?'+':''}{fmtN(p.marge)}</span>,
          <span style={{padding:'3px 8px',borderRadius:10,background:p.pct>=20?C.green_bg:p.pct>=0?C.orange_bg:C.red_bg,color:p.pct>=20?C.green:p.pct>=0?C.orange:C.red,fontSize:12,fontWeight:700}}>{p.pct}%</span>,
          <div style={{width:80,height:6,background:C.border2,borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.max(0,Math.min(100,p.pct))}%`,background:p.pct>=20?C.green:p.pct>=0?C.orange:C.red,borderRadius:3}}/></div>,
        ])}
      />
    </div>
  );
};

// ===== TVA =====
const VueTVA = ({factures, depenses}) => {
  const coll = factures.reduce((s,f)=>s+f.tva,0);
  const deduct = depenses.filter(d=>d.devise==='FCFA'&&d.status==='paye').reduce((s,d)=>s+d.montant*TVA_RATE,0);
  const verser = coll-deduct;
  return (
    <div>
      <div style={{display:'flex',gap:12,marginBottom:20}}>
        <KpiCard title="TVA collectée" amount={`${fmtN(Math.round(coll))} FCFA`} color={C.red} sub="Sur vos ventes"/>
        <KpiCard title="TVA déductible" amount={`${fmtN(Math.round(deduct))} FCFA`} color={C.green} sub="Sur vos achats"/>
        <KpiCard title="TVA nette à verser" amount={`${fmtN(Math.round(verser))} FCFA`} color={C.orange} sub="DGI Cameroun"/>
        <KpiCard title="Taux appliqué" amount={`${(TVA_RATE*100).toFixed(2)}%`} color={C.blue} sub="Cameroun OHADA"/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden'}}>
          <div style={{padding:'14px 18px',background:C.green,color:C.white,fontSize:14,fontWeight:700}}>TVA du mois</div>
          <div style={{padding:18}}>
            {[{l:'TVA collectée (ventes)',v:coll,c:C.red,icon:'expense'},{l:'TVA déductible (achats)',v:deduct,c:C.green,icon:'invoice'},{l:'TVA nette à verser DGI',v:verser,c:C.orange,icon:'bank',big:true}].map(t=>(
              <div key={t.l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:t.big?'none':`1px solid ${C.border2}`}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:32,height:32,borderRadius:4,background:t.c===C.red?C.red_bg:t.c===C.green?C.green_bg:C.orange_bg,display:'flex',alignItems:'center',justifyContent:'center'}}><Ico name={t.icon} size={15} color={t.c}/></div>
                  <span style={{fontSize:t.big?14:13,fontWeight:t.big?600:400,color:C.text}}>{t.l}</span>
                </div>
                <span style={{fontSize:t.big?20:14,fontWeight:t.big?800:600,color:t.c}}>{fmtN(Math.round(t.v))} FCFA</span>
              </div>
            ))}
            <div style={{marginTop:14,display:'flex',gap:8}}>
              <Btn label="Générer déclaration DGI" onClick={()=>{}} primary icon="report"/>
              <Btn label="Exporter" onClick={()=>{}} ghost icon="download"/>
            </div>
          </div>
        </div>
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden'}}>
          <div style={{padding:'14px 18px',background:C.bg,borderBottom:`1px solid ${C.border}`,fontSize:14,fontWeight:700,color:C.text}}>Historique déclarations</div>
          <QBTable
            cols={['Mois','TVA à verser','Statut']}
            rows={[
              ['Mars 2024',`${fmtN(Math.round(verser))} FCFA`,<Badge status="en_attente"/>],
              ['Février 2024','6 700 000 FCFA',<Badge status="paye"/>],
              ['Janvier 2024','6 100 000 FCFA',<Badge status="paye"/>],
              ['Décembre 2023','9 300 000 FCFA',<Badge status="paye"/>],
            ]}
          />
        </div>
      </div>
    </div>
  );
};

// ===== TRÉSORERIE =====
const VueTresorerie = () => {
  const BANQUES_DATA = [
    {nom:'BICEC — Compte principal',numero:'CM21 1001 2345 6789',solde:28450000,devise:'FCFA',type:'Courant'},
    {nom:'Société Générale Cameroun',numero:'CM21 2001 8765 4321',solde:12800000,devise:'FCFA',type:'Courant'},
    {nom:'Afriland First Bank',numero:'CM21 3001 1111 2222',solde:5200000,devise:'FCFA',type:'Épargne'},
    {nom:'Compte USD BICEC',numero:'USD 9876 5432',solde:45000,devise:'USD',type:'Devises'},
  ];
  const totalFCFA = BANQUES_DATA.filter(b=>b.devise==='FCFA').reduce((s,b)=>s+b.solde,0);
  const maxFlow = Math.max(...CASHFLOW.map(c=>Math.max(c.e,c.s)));
  return (
    <div>
      <div style={{display:'flex',gap:12,marginBottom:20}}>
        <KpiCard title="Solde bancaire total" amount={`${fmtN(totalFCFA)} FCFA`} color={C.green}/>
        <KpiCard title="Total entrées (6 mois)" amount={`${fmtN(CASHFLOW.reduce((s,c)=>s+c.e,0))} FCFA`} color={C.blue}/>
        <KpiCard title="Total sorties (6 mois)" amount={`${fmtN(CASHFLOW.reduce((s,c)=>s+c.s,0))} FCFA`} color={C.red}/>
        <KpiCard title="Marge nette" amount={`${fmtN(CASHFLOW.reduce((s,c)=>s+(c.e-c.s),0))} FCFA`} color={C.green}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1.6fr 1fr',gap:18,marginBottom:20}}>
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden'}}>
          <div style={{padding:'14px 18px',background:C.bg,borderBottom:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:14,fontWeight:700,color:C.text}}>Flux de trésorerie — 6 mois</span>
            <div style={{display:'flex',gap:12,fontSize:12,color:C.muted}}>
              {[{c:C.blue,l:'Entrées'},{c:C.red,l:'Sorties'},{c:C.green,l:'Bénéfice'}].map(x=>(
                <span key={x.l} style={{display:'flex',alignItems:'center',gap:4}}><span style={{width:10,height:10,background:x.c,borderRadius:2,display:'inline-block'}}/>  {x.l}</span>
              ))}
            </div>
          </div>
          <div style={{padding:'16px 20px'}}>
            <div style={{display:'flex',alignItems:'flex-end',gap:10,height:150}}>
              {CASHFLOW.map((c,i)=>(
                <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                  <div style={{width:'100%',display:'flex',gap:2,alignItems:'flex-end',height:120}}>
                    <div style={{flex:1,height:`${(c.e/maxFlow)*120}px`,background:C.blue,borderRadius:'2px 2px 0 0'}}/>
                    <div style={{flex:1,height:`${(c.s/maxFlow)*120}px`,background:C.red,borderRadius:'2px 2px 0 0',opacity:0.8}}/>
                    <div style={{flex:1,height:`${Math.max(0,((c.e-c.s)/maxFlow)*120)}px`,background:C.green,borderRadius:'2px 2px 0 0'}}/>
                  </div>
                  <span style={{fontSize:10,color:C.muted,fontWeight:600}}>{c.mois}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden'}}>
          <div style={{padding:'14px 18px',background:C.bg,borderBottom:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between'}}>
            <span style={{fontSize:14,fontWeight:700,color:C.text}}>Comptes bancaires</span>
            <Btn label="+ Ajouter" onClick={()=>{}} ghost sm/>
          </div>
          {BANQUES_DATA.map((b,i)=>(
            <div key={i} style={{padding:'12px 16px',borderBottom:`1px solid ${C.border2}`,display:'flex',justifyContent:'space-between',alignItems:'center',background:i%2===0?C.white:'#fafafa'}}>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:C.text}}>{b.nom}</div>
                <div style={{fontSize:10,fontFamily:'monospace',color:C.muted,marginTop:1}}>{b.numero}</div>
                <span style={{padding:'1px 6px',borderRadius:10,background:C.bg,fontSize:10,color:C.muted,marginTop:2,display:'inline-block'}}>{b.type}</span>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:14,fontWeight:700,color:C.green}}>{fmtN(b.solde)}</div>
                <div style={{fontSize:10,color:C.muted}}>{b.devise}</div>
              </div>
            </div>
          ))}
          <div style={{padding:'12px 16px',background:C.green_bg,borderTop:`2px solid ${C.green}`}}>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <span style={{fontSize:13,fontWeight:700,color:C.green}}>Solde total FCFA</span>
              <span style={{fontSize:16,fontWeight:800,color:C.green}}>{fmtN(totalFCFA)} FCFA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== PLAN COMPTABLE =====
const VuePlanComptable = () => {
  const [expanded, setExpanded] = useState({});
  const PLAN = [
    {cl:'1',lib:'Capitaux',comptes:[{n:'101000',l:'Capital social',s:50000000,t:'passif'},{n:'106000',l:'Réserves',s:12500000,t:'passif'},{n:'120000',l:'Résultat exercice',s:8340000,t:'passif'}]},
    {cl:'2',lib:'Actif immobilisé',comptes:[{n:'215000',l:'Matériel et équipements',s:45000000,t:'actif'},{n:'218000',l:'Véhicules',s:18500000,t:'actif'},{n:'282000',l:'Amortissements',s:-12000000,t:'actif'}]},
    {cl:'4',lib:'Comptes de tiers',comptes:[{n:'411000',l:'Clients MTN',s:10195875,t:'actif'},{n:'401000',l:'Fournisseurs Huawei',s:-8500000,t:'passif'},{n:'445000',l:'TVA collectée',s:-12819500,t:'passif'},{n:'445200',l:'TVA déductible',s:4250000,t:'actif'}]},
    {cl:'5',lib:'Trésorerie',comptes:[{n:'521000',l:'Banque BICEC',s:28450000,t:'actif'},{n:'521001',l:'Banque SGC',s:12800000,t:'actif'},{n:'571000',l:'Caisse',s:1250000,t:'actif'}]},
    {cl:'6',lib:'Charges',comptes:[{n:'601000',l:'Achats matières',s:15200000,t:'charge'},{n:'621000',l:'Personnel externe',s:24500000,t:'charge'},{n:'641000',l:'Salaires',s:18200000,t:'charge'},{n:'645000',l:'Charges sociales',s:2184000,t:'charge'}]},
    {cl:'7',lib:'Produits',comptes:[{n:'701000',l:'Chiffre affaires',s:85000000,t:'produit'},{n:'706000',l:'Prestations services',s:12500000,t:'produit'}]},
  ];
  const tColors = {actif:{c:C.blue,bg:C.blue_bg},passif:{c:C.red,bg:C.red_bg},charge:{c:C.orange,bg:C.orange_bg},produit:{c:C.green,bg:C.green_bg}};
  return (
    <div>
      <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginBottom:14}}>
        <Btn label="Exporter Excel" onClick={()=>{}} ghost icon="download"/>
        <Btn label="+ Nouveau compte" onClick={()=>{}} primary icon="plus"/>
      </div>
      <div style={{border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden',background:C.white}}>
        {PLAN.map(cls=>(
          <div key={cls.cl}>
            <div onClick={()=>setExpanded(p=>({...p,[cls.cl]:!p[cls.cl]}))}
              style={{padding:'12px 18px',background:C.bg,borderBottom:`1px solid ${C.border}`,cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}}
              onMouseEnter={e=>e.currentTarget.style.background=C.green_bg}
              onMouseLeave={e=>e.currentTarget.style.background=C.bg}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:26,height:26,borderRadius:4,background:C.green,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:C.white}}>{cls.cl}</div>
                <span style={{fontSize:14,fontWeight:600,color:C.text}}>Classe {cls.cl} — {cls.lib}</span>
                <span style={{padding:'1px 8px',borderRadius:10,background:C.border2,fontSize:11,color:C.muted}}>{cls.comptes.length} comptes</span>
              </div>
              <Ico name={expanded[cls.cl]?'chevron_down':'chevron_right'} size={16} color={C.muted}/>
            </div>
            {expanded[cls.cl]&&(
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'#fafafa',borderBottom:`1px solid ${C.border2}`}}>
                    {['N° Compte','Libellé','Type','Solde'].map(h=>(
                      <th key={h} style={{padding:'8px 18px',textAlign:'left',fontSize:11,fontWeight:700,color:C.muted,textTransform:'uppercase'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cls.comptes.map((c,i)=>{
                    const tc = tColors[c.t]||tColors.actif;
                    return (
                      <tr key={c.n} style={{borderBottom:`1px solid ${C.border2}`,background:i%2===0?C.white:'#fafafa'}}>
                        <td style={{padding:'10px 18px',fontSize:13,fontWeight:700,color:C.blue,fontFamily:'monospace'}}>{c.n}</td>
                        <td style={{padding:'10px 18px',fontSize:13,color:C.text}}>{c.l}</td>
                        <td style={{padding:'10px 18px'}}><span style={{padding:'2px 8px',borderRadius:10,background:tc.bg,color:tc.c,fontSize:11,fontWeight:600}}>{c.t.charAt(0).toUpperCase()+c.t.slice(1)}</span></td>
                        <td style={{padding:'10px 18px',fontSize:13,fontWeight:700,color:c.s>=0?C.green:C.red,textAlign:'right'}}>{fmtN(Math.abs(c.s))} FCFA</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== FOURNISSEURS =====
const VueFournisseurs = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const FDATA = [
    {id:1,nom:'Huawei Technologies',pays:'Chine',contact:'Li Wei',email:'lwei@huawei.com',tel:'+86 755 2878 0808',devise:'CNY',cat:'Équipements télécoms',achats:85000000,solde:-8500000},
    {id:2,nom:'Nokia Networks',pays:'Finlande',contact:'Mikael Virtanen',email:'m.virtanen@nokia.com',tel:'+358 10 448 8000',devise:'EUR',cat:'Équipements télécoms',achats:45000000,solde:-12000000},
    {id:3,nom:'Ericsson Cameroun',pays:'Cameroun',contact:'Paul Biya Jr',email:'p.biya@ericsson.cm',tel:'+237 222 200 001',devise:'FCFA',cat:'Équipements télécoms',achats:32000000,solde:0},
    {id:4,nom:'Total Énergies',pays:'Cameroun',contact:'Jean Mfou',email:'j.mfou@total.cm',tel:'+237 222 300 200',devise:'FCFA',cat:'Transport',achats:8500000,solde:0},
    {id:5,nom:'CAMTEL',pays:'Cameroun',contact:'David Minlo',email:'d.minlo@camtel.cm',tel:'+237 222 400 000',devise:'FCFA',cat:'Télécoms',achats:12000000,solde:-1200000},
  ];
  const filtered = FDATA.filter(f=>!search||f.nom.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <div style={{display:'flex',gap:12,marginBottom:20}}>
        <KpiCard title="Fournisseurs" amount={FDATA.length} color={C.blue} sub="actifs"/>
        <KpiCard title="Total achats" amount={`${fmtN(FDATA.reduce((s,f)=>s+f.achats,0))} FCFA`} color={C.red}/>
        <KpiCard title="Soldes dus" amount={`${fmtN(Math.abs(FDATA.reduce((s,f)=>s+f.solde,0)))} FCFA`} color={C.orange}/>
      </div>
      <div style={{display:'flex',gap:10,marginBottom:14,alignItems:'center'}}>
        <div style={{flex:1,display:'flex',alignItems:'center',gap:8,background:C.white,border:`1px solid ${C.border}`,borderRadius:4,padding:'8px 12px'}}>
          <Ico name="search" size={16} color={C.muted}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nom, contact..." style={{flex:1,border:'none',outline:'none',fontSize:13,color:C.text,background:'transparent',fontFamily:'inherit'}}/>
        </div>
        <Btn label="+ Nouveau fournisseur" onClick={()=>{}} primary icon="plus"/>
      </div>
      <QBTable
        cols={['Fournisseur','Pays','Catégorie','Devise','Total achats','Solde','']}
        rows={filtered.map(f=>[
          <span style={{fontWeight:600}}>{f.nom}</span>,
          f.pays, f.cat, f.devise,
          <span style={{fontWeight:600,color:C.blue}}>{fmtN(f.achats)} FCFA</span>,
          <span style={{fontWeight:600,color:f.solde<0?C.red:C.green}}>{fmtN(Math.abs(f.solde))} FCFA</span>,
          <button onClick={()=>setSelected(f)} style={{padding:'5px 10px',borderRadius:4,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',fontSize:12,color:C.muted,display:'flex',alignItems:'center',gap:4}}><Ico name="eye" size={13} color={C.muted}/> Voir</button>
        ])}
        onRowClick={i=>setSelected(filtered[i])}
      />
      {selected&&(
        <SidePanel title={selected.nom} subtitle="Fournisseur" onClose={()=>setSelected(null)}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
            {[{l:'Pays',v:selected.pays},{l:'Contact',v:selected.contact},{l:'Email',v:selected.email},{l:'Téléphone',v:selected.tel},{l:'Devise',v:selected.devise},{l:'Catégorie',v:selected.cat}].map(item=>(
              <div key={item.l} style={{padding:'10px 12px',background:C.bg,borderRadius:4}}>
                <div style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:0.5,marginBottom:3}}>{item.l}</div>
                <div style={{fontSize:13,fontWeight:600,color:C.text}}>{item.v}</div>
              </div>
            ))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
            <KpiCard title="Total achats" amount={`${fmtN(selected.achats)} FCFA`} color={C.blue}/>
            <KpiCard title="Solde" amount={`${fmtN(Math.abs(selected.solde))} FCFA`} color={selected.solde<0?C.red:C.green}/>
          </div>
          <div style={{display:'flex',gap:8}}>
            <Btn label="Envoyer email" onClick={()=>{}} ghost icon="mail" sm/>
            <Btn label="Nouveau BC" onClick={()=>{}} ghost icon="edit" sm/>
            <Btn label="Enreg. paiement" onClick={()=>{}} primary icon="check" sm/>
          </div>
        </SidePanel>
      )}
    </div>
  );
};

// ===== COMPOSANT PRINCIPAL =====
export default function Finance() {
  const [nav, setNav] = useState('dashboard');
  const [factures, setFactures] = useState(SEED_FACTURES);
  const [depenses, setDepenses] = useState(SEED_DEPENSES);

  const SCREENS = {
    dashboard:   <Dashboard factures={factures} depenses={depenses} onNavigate={setNav}/>,
    factures:    <VueFactures factures={factures} setFactures={setFactures}/>,
    depenses:    <VueDepenses depenses={depenses} setDepenses={setDepenses}/>,
    rapports:    <VueRapports factures={factures} depenses={depenses}/>,
    tva:         <VueTVA factures={factures} depenses={depenses}/>,
    tresorerie:  <VueTresorerie/>,
    comptable:   <VuePlanComptable/>,
    fournisseurs:<VueFournisseurs/>,
    rentabilite: <VueRentabilite factures={factures} depenses={depenses}/>,
  };

  const currentNav = NAV.find(n=>n.id===nav);
  const totalCA = factures.reduce((s,f)=>s+f.montantTTC,0);
  const totalDep = depenses.reduce((s,d)=>s+(d.devise==='FCFA'?d.montant:d.montant*DEVISES_RATES[d.devise]||d.montant),0);

  return (
    <div style={{minHeight:'100vh',display:'flex',fontFamily:'Segoe UI,Arial,sans-serif',background:C.bg}}>

      {/* SIDEBAR QUICKBOOKS — fond blanc, bordure droite */}
      <div style={{width:210,background:C.sidebar,borderRight:`1px solid ${C.sidebar_border}`,display:'flex',flexDirection:'column',flexShrink:0}}>

        {/* Logo */}
        <div style={{padding:'18px 16px 14px',borderBottom:`1px solid ${C.border2}`}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
            <div style={{width:30,height:30,borderRadius:6,background:C.green,display:'flex',alignItems:'center',justifyContent:'center'}}><Ico name="chart" size={16} color={C.white}/></div>
            <div>
              <div style={{fontSize:14,fontWeight:800,color:C.text}}>CLEAN<span style={{color:C.green}}>IT</span></div>
              <div style={{fontSize:9,color:C.muted,letterSpacing:0.3}}>Finance</div>
            </div>
          </div>
          {/* Mini stats */}
          <div style={{display:'flex',flexDirection:'column',gap:4}}>
            {[
              {l:'CA',v:`${fmtN(Math.round(totalCA/1000))}K`,c:C.blue},
              {l:'Charges',v:`${fmtN(Math.round(totalDep/1000))}K`,c:C.red},
              {l:'Bénéfice',v:`${fmtN(Math.round((totalCA-totalDep)/1000))}K`,c:C.green},
            ].map(s=>(
              <div key={s.l} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:10,color:C.muted}}>{s.l}</span>
                <span style={{fontSize:11,fontWeight:700,color:s.c}}>{s.v} FCFA</span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <nav style={{flex:1,padding:'8px 0',overflowY:'auto'}}>
          {NAV.map(item=>{
            const active = nav===item.id;
            return (
              <button key={item.id} onClick={()=>setNav(item.id)}
                style={{width:'100%',padding:'9px 14px',border:'none',background:active?C.sidebar_active:'transparent',cursor:'pointer',display:'flex',alignItems:'center',gap:10,textAlign:'left',transition:'background .1s',borderLeft:active?`3px solid ${C.green}`:'3px solid transparent',fontFamily:'inherit'}}>
                <Ico name={item.icon} size={17} color={active?C.green:C.muted}/>
                <span style={{fontSize:13,fontWeight:active?700:400,color:active?C.green:C.text2}}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bouton New */}
        <div style={{padding:'12px 14px',borderTop:`1px solid ${C.border2}`}}>
          <button style={{width:'100%',padding:'9px 12px',borderRadius:4,border:'none',background:C.green,color:C.white,fontWeight:700,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontFamily:'inherit'}}>
            <Ico name="plus" size={16} color={C.white}/>
            Nouvelle transaction
          </button>
          <div style={{marginTop:10,fontSize:10,color:C.muted,textAlign:'center'}}>OHADA · TVA {(TVA_RATE*100).toFixed(2)}% · Cameroun</div>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div style={{flex:1,overflow:'auto',minWidth:0}}>
        {/* Header page */}
        <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:'12px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:100}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:34,height:34,borderRadius:4,background:C.green_bg,display:'flex',alignItems:'center',justifyContent:'center'}}><Ico name={currentNav?.icon||'home'} size={18} color={C.green}/></div>
            <div>
              <div style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:0.5}}>Finance & Comptabilité</div>
              <h1 style={{margin:0,fontSize:16,fontWeight:700,color:C.text}}>{currentNav?.label}</h1>
            </div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,background:C.bg,border:`1px solid ${C.border}`,borderRadius:4,padding:'7px 12px'}}>
              <Ico name="search" size={14} color={C.muted}/>
              <input placeholder="Rechercher..." style={{border:'none',outline:'none',fontSize:13,color:C.text,background:'transparent',width:160,fontFamily:'inherit'}}/>
            </div>
            <Btn label="Clôture" onClick={()=>{}} ghost sm icon="calendar"/>
            <Btn label="Exporter" onClick={()=>{}} ghost sm icon="download"/>
          </div>
        </div>

        {/* Contenu */}
        <div style={{padding:'22px 24px',maxWidth:1400}}>
          {SCREENS[nav]||SCREENS.dashboard}
        </div>
      </div>
    </div>
  );
}
