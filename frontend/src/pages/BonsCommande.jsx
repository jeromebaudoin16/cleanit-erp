import { useState, useRef } from 'react';

const C = {
  green:'#2CA01C', green2:'#1a7a0e', green_bg:'#f0faf0',
  blue:'#0077C5', blue_bg:'#e8f1f9',
  red:'#d52b1e', red_bg:'#fdf0ef',
  orange:'#e27000', orange_bg:'#fef5e7',
  gray:'#6b6b6b', gray_bg:'#f4f4f6',
  border:'#d4d4d8', border2:'#e8e8ec',
  text:'#1a1a1a', text2:'#3d3d3d',
  muted:'#6b6b6b', light:'#9b9b9b',
  bg:'#f4f5f7', white:'#ffffff',
};

const fmtN = n => new Intl.NumberFormat('fr-FR').format(Math.round(n||0));
const fmtD = d => d ? new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const TVA_RATE = 0.1925;

const CLIENTS = ['MTN Cameroun','Orange Cameroun','Huawei Technologies','Nexttel Cameroun','Gouvernement Cameroun','CAMTEL'];
const SITES = ['DLA-001','DLA-003','YDE-001','KRI-001','GAR-001','LIM-001','BFN-001'];
const DEVISES = ['FCFA','USD','EUR','CNY'];
const DEVISES_RATES = {FCFA:1,USD:600,EUR:655,CNY:83};

// ===== ICÔNES SVG =====
const Ico = ({name, size=18, color='currentColor'}) => {
  const icons = {
    plus:'M12 5v14 M5 12h14',
    close:'M18 6L6 18 M6 6l12 12',
    search:'M21 21l-4.35-4.35 M17 11A6 6 0 115 11a6 6 0 0112 0z',
    upload:'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
    download:'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3',
    check:'M20 6L9 17l-5-5',
    eye:'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12m-3 0a3 3 0 106 0 3 3 0 00-6 0',
    edit:'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
    invoice:'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    project:'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
    link:'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71',
    alert:'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01',
    filter:'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
    excel:'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M8 13h2 M8 17h2 M12 13h4 M12 17h4',
    chevron_right:'M9 18l6-6-6-6',
    calendar:'M8 2v4 M16 2v4 M3 10h18 M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z',
    arrow_right:'M5 12h14 M12 5l7 7-7 7',
  };
  const d = icons[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {d.split(' M ').map((seg,i)=><path key={i} d={i===0?seg:`M ${seg}`}/>)}
    </svg>
  );
};

// ===== COMPOSANTS UI =====
const Badge = ({status,label}) => {
  const cfg = {
    brouillon:  {l:'Brouillon',  c:C.gray,   bg:C.gray_bg},
    recu:       {l:'Reçu',       c:C.blue,   bg:C.blue_bg},
    valide:     {l:'Validé',     c:C.green,  bg:C.green_bg},
    en_cours:   {l:'En cours',   c:C.orange, bg:C.orange_bg},
    termine:    {l:'Terminé',    c:C.green,  bg:C.green_bg},
    annule:     {l:'Annulé',     c:C.red,    bg:C.red_bg},
    facture:    {l:'Facturé',    c:C.green,  bg:C.green_bg},
    partiel:    {l:'Partiel',    c:C.orange, bg:C.orange_bg},
    non_facture:{l:'Non facturé',c:C.red,    bg:C.red_bg},
  }[status] || {l:label||status,c:C.gray,bg:C.gray_bg};
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'3px 9px',borderRadius:20,background:cfg.bg,color:cfg.c,fontSize:11,fontWeight:600,whiteSpace:'nowrap'}}>
      <span style={{width:5,height:5,borderRadius:'50%',background:cfg.c,flexShrink:0}}/>
      {cfg.l}
    </span>
  );
};

const Btn = ({label,onClick,primary,danger,ghost,disabled,sm,icon,full}) => (
  <button onClick={onClick} disabled={disabled} style={{
    display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6,
    padding:sm?'6px 12px':'9px 16px',width:full?'100%':'auto',
    borderRadius:4,border:danger?`1px solid ${C.red}`:primary?'none':ghost?`1px solid ${C.border}`:'none',
    background:disabled?'#e4e4e4':danger?C.red:primary?C.green:'white',
    color:disabled?C.light:danger||primary?'white':ghost?C.text2:C.green,
    fontWeight:600,fontSize:sm?12:13,cursor:disabled?'not-allowed':'pointer',
    fontFamily:'inherit',transition:'opacity .1s',whiteSpace:'nowrap',
  }} onMouseEnter={e=>{if(!disabled)e.currentTarget.style.opacity='0.88'}}
     onMouseLeave={e=>{if(!disabled)e.currentTarget.style.opacity='1'}}>
    {icon&&<Ico name={icon} size={14} color={disabled?C.light:danger||primary?'white':ghost?C.text2:C.green}/>}
    {label}
  </button>
);

const Field = ({label,required,children,hint,col1}) => (
  <div style={{gridColumn:col1?'1/-1':'auto'}}>
    <label style={{display:'block',fontSize:13,fontWeight:600,color:C.text2,marginBottom:5}}>
      {label}{required&&<span style={{color:C.red,marginLeft:2}}>*</span>}
    </label>
    {children}
    {hint&&<div style={{fontSize:11,color:C.muted,marginTop:3}}>{hint}</div>}
  </div>
);

const Input = ({type='text',value,onChange,placeholder,min,disabled,small}) => (
  <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} min={min} disabled={disabled}
    style={{width:'100%',padding:small?'6px 9px':'9px 12px',borderRadius:4,border:`1px solid ${C.border}`,fontSize:13,color:C.text,background:disabled?C.bg:C.white,boxSizing:'border-box',outline:'none',fontFamily:'inherit'}}
    onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border}/>
);

const Select = ({value,onChange,options,placeholder,disabled}) => (
  <select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
    style={{width:'100%',padding:'9px 12px',borderRadius:4,border:`1px solid ${C.border}`,fontSize:13,color:value?C.text:C.light,background:disabled?C.bg:C.white,cursor:'pointer',outline:'none',fontFamily:'inherit'}}
    onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border}>
    <option value="">{placeholder||'Sélectionner...'}</option>
    {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
  </select>
);

const Textarea = ({value,onChange,placeholder,rows=3}) => (
  <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} rows={rows}
    style={{width:'100%',padding:'9px 12px',borderRadius:4,border:`1px solid ${C.border}`,fontSize:13,color:C.text,background:C.white,resize:'vertical',boxSizing:'border-box',outline:'none',fontFamily:'inherit'}}
    onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border}/>
);

// Panel latéral
const Panel = ({title,subtitle,onClose,children,width=780}) => (
  <div style={{position:'fixed',inset:0,zIndex:200,display:'flex',justifyContent:'flex-end'}}>
    <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.4)'}}/>
    <div style={{position:'relative',width,maxWidth:'96vw',height:'100vh',background:C.white,boxShadow:'-4px 0 24px rgba(0,0,0,0.15)',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'16px 24px',borderBottom:`1px solid ${C.border2}`,display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0,background:C.green}}>
        <div>
          {subtitle&&<div style={{fontSize:11,color:'rgba(255,255,255,0.7)',textTransform:'uppercase',letterSpacing:0.5,marginBottom:2}}>{subtitle}</div>}
          <h2 style={{margin:0,fontSize:17,fontWeight:700,color:C.white}}>{title}</h2>
        </div>
        <button onClick={onClose} style={{width:32,height:32,borderRadius:4,border:'1px solid rgba(255,255,255,0.3)',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Ico name="close" size={16} color="white"/>
        </button>
      </div>
      <div style={{flex:1,overflow:'auto',padding:'20px 24px'}}>{children}</div>
    </div>
  </div>
);

// Tableau
const Table = ({cols,rows,onRowClick,empty='Aucune donnée'}) => (
  <div style={{border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden',background:C.white}}>
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',minWidth:500}}>
        <thead>
          <tr style={{background:C.bg,borderBottom:`2px solid ${C.border}`}}>
            {cols.map(col=><th key={col} style={{padding:'9px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:0.4,whiteSpace:'nowrap'}}>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length===0&&<tr><td colSpan={cols.length} style={{padding:'40px',textAlign:'center',color:C.light,fontSize:14}}>{empty}</td></tr>}
          {rows.map((row,i)=>(
            <tr key={i} onClick={()=>onRowClick&&onRowClick(i)} style={{borderBottom:`1px solid ${C.border2}`,background:i%2===0?C.white:'#fafafa',cursor:onRowClick?'pointer':'default'}}
              onMouseEnter={e=>{if(onRowClick)e.currentTarget.style.background='#f0faf0'}}
              onMouseLeave={e=>{if(onRowClick)e.currentTarget.style.background=i%2===0?C.white:'#fafafa'}}>
              {row.map((cell,j)=><td key={j} style={{padding:'11px 14px',fontSize:13,color:C.text,verticalAlign:'middle'}}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ===== DONNÉES SEED =====
const SEED_BCS = [
  {
    id:'1',
    numero:'BC-MTN-2024-001',
    client:'MTN Cameroun',
    dateReception:'2024-01-10',
    dateEcheance:'2024-03-31',
    site:'DLA-001',
    devise:'FCFA',
    status:'en_cours',
    description:'Installation équipements 5G NR Site Akwa Douala — Phase 1',
    projetCree:'PROJ-2024-001',
    facturesCrees:['FAC-2024-001','FAC-2024-002'],
    notes:'BC reçu par email le 10/01/2024. Importé depuis le portail MTN.',
    lignes:[
      {id:1,ref:'BBU-5G-01',description:'Base Band Unit 5G NR Huawei AAU5613',unite:'Unité',qte:2,puBC:4500000,tva:true,status:'facture',qteUtilisee:2,qteFacturee:2,notes:''},
      {id:2,ref:'ANT-5G-01',description:'Antenne active AAU 5G NR 64T64R',unite:'Unité',qte:6,puBC:850000,tva:true,status:'facture',qteUtilisee:6,qteFacturee:6,notes:''},
      {id:3,ref:'CBL-FO-01',description:'Câble fibre optique CPRI 10m',unite:'Mètre',qte:50,puBC:25000,tva:false,status:'partiel',qteUtilisee:35,qteFacturee:35,notes:'15m non utilisés'},
      {id:4,ref:'MOD-RF-01',description:'Module RF 2600MHz',unite:'Unité',qte:4,puBC:320000,tva:true,status:'non_facture',qteUtilisee:0,qteFacturee:0,notes:'Non requis sur ce site'},
      {id:5,ref:'MAIN-01',description:'Main d\'oeuvre installation & config',unite:'Jour',qte:15,puBC:350000,tva:true,status:'facture',qteUtilisee:15,qteFacturee:15,notes:''},
      {id:6,ref:'TRANS-01',description:'Transport et logistique matériel',unite:'Forfait',qte:1,puBC:450000,tva:false,status:'facture',qteUtilisee:1,qteFacturee:1,notes:''},
    ],
  },
  {
    id:'2',
    numero:'BC-ORA-2024-001',
    client:'Orange Cameroun',
    dateReception:'2024-01-25',
    dateEcheance:'2024-02-28',
    site:'YDE-001',
    devise:'FCFA',
    status:'valide',
    description:'Maintenance préventive réseau 4G LTE Secteur Centre Yaoundé Q1 2024',
    projetCree:'PROJ-2024-002',
    facturesCrees:['FAC-2024-003'],
    notes:'',
    lignes:[
      {id:1,ref:'MAINT-4G-01',description:'Maintenance préventive BTS 4G LTE',unite:'Site',qte:8,puBC:900000,tva:true,status:'facture',qteUtilisee:8,qteFacturee:8,notes:''},
      {id:2,ref:'REMP-BAT-01',description:'Remplacement batteries backup',unite:'Unité',qte:16,puBC:85000,tva:true,status:'partiel',qteUtilisee:12,qteFacturee:12,notes:'4 unités non remplacées'},
      {id:3,ref:'DIAG-01',description:'Diagnostic réseau et rapport',unite:'Forfait',qte:1,puBC:350000,tva:true,status:'facture',qteUtilisee:1,qteFacturee:1,notes:''},
    ],
  },
  {
    id:'3',
    numero:'BC-HUW-2024-001',
    client:'Huawei Technologies',
    dateReception:'2024-02-05',
    dateEcheance:'2024-04-30',
    site:'KRI-001',
    devise:'USD',
    status:'recu',
    description:'Engineering Services 5G NR Kribi Port — Technical Supervision',
    projetCree:'',
    facturesCrees:[],
    notes:'BC reçu en USD. Taux de change appliqué: 1 USD = 600 FCFA',
    lignes:[
      {id:1,ref:'ENG-5G-01',description:'5G NR Site Engineering Services',unite:'Day',qte:40,puBC:850,tva:false,status:'non_facture',qteUtilisee:0,qteFacturee:0,notes:''},
      {id:2,ref:'SUP-TEC-01',description:'Technical Supervision & Reporting',unite:'Day',qte:10,puBC:1200,tva:false,status:'non_facture',qteUtilisee:0,qteFacturee:0,notes:''},
      {id:3,ref:'DOC-01',description:'Technical Documentation',unite:'Package',qte:1,puBC:5000,tva:false,status:'non_facture',qteUtilisee:0,qteFacturee:0,notes:''},
    ],
  },
];

// ===== MODAL IMPORT BC =====
const ImportBCModal = ({onClose, onImport}) => {
  const [step, setStep] = useState(1);
  const [client, setClient] = useState('');
  const [numero, setNumero] = useState('');
  const [dateReception, setDateReception] = useState(new Date().toISOString().split('T')[0]);
  const [dateEcheance, setDateEcheance] = useState('');
  const [site, setSite] = useState('');
  const [devise, setDevise] = useState('FCFA');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [lignes, setLignes] = useState([
    {id:1,ref:'',description:'',unite:'Unité',qte:1,puBC:0,tva:true,status:'non_facture',qteUtilisee:0,qteFacturee:0,notes:''},
  ]);
  const [creerProjet, setCreerProjet] = useState(true);
  const [planPaiement, setPlanPaiement] = useState('3phases');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const addLigne = () => setLignes(p=>[...p,{id:Date.now(),ref:'',description:'',unite:'Unité',qte:1,puBC:0,tva:true,status:'non_facture',qteUtilisee:0,qteFacturee:0,notes:''}]);
  const updLigne = (i,k,v) => setLignes(p=>p.map((l,idx)=>idx===i?{...l,[k]:v}:l));
  const delLigne = (i) => setLignes(p=>p.filter((_,idx)=>idx!==i));

  const totalBC = lignes.reduce((s,l)=>s+l.qte*l.puBC*(l.tva?1+TVA_RATE:1),0);
  const totalHT = lignes.reduce((s,l)=>s+l.qte*l.puBC,0);

  const handleImport = async () => {
    if (!client||!numero) { alert('Client et numéro obligatoires'); return; }
    setSaving(true);
    const bc = {
      id: Date.now().toString(),
      numero, client, dateReception, dateEcheance, site, devise,
      description, notes, status:'recu',
      lignes, projetCree: creerProjet ? `PROJ-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900+100))}` : '',
      facturesCrees: [],
    };
    onImport(bc, creerProjet, planPaiement);
    setSaving(false);
    onClose();
  };

  const UNITES = ['Unité','Mètre','Kg','Litre','Forfait','Jour','Heure','m²','Package','Lot'];
  const PLANS = [
    {id:'direct',l:'Paiement direct 100%'},
    {id:'2phases',l:'2 phases (50/50)'},
    {id:'3phases',l:'3 phases (30/40/30)'},
    {id:'4phases',l:'4 phases (25/25/25/25)'},
    {id:'custom',l:'Personnalisé'},
  ];

  return (
    <Panel title="Importer un Bon de Commande" subtitle="Nouveau BC" onClose={onClose} width={900}>
      {/* Steps */}
      <div style={{display:'flex',gap:0,marginBottom:24,borderBottom:`1px solid ${C.border2}`,paddingBottom:16}}>
        {[{n:1,l:'Informations BC'},{n:2,l:'Liste des éléments'},{n:3,l:'Projet & Facturation'}].map((s,i)=>(
          <div key={s.n} style={{display:'flex',alignItems:'center',gap:8,marginRight:20}}>
            <div style={{width:26,height:26,borderRadius:'50%',background:step>=s.n?C.green:C.border,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:12,fontWeight:700,flexShrink:0}}>{step>s.n?'✓':s.n}</div>
            <span style={{fontSize:13,fontWeight:step===s.n?700:400,color:step>=s.n?C.green:C.muted}}>{s.l}</span>
            {i<2&&<Ico name="chevron_right" size={14} color={C.border}/>}
          </div>
        ))}
      </div>

      {/* STEP 1 */}
      {step===1&&(
        <div>
          {/* Import Excel/PDF */}
          <div style={{border:`2px dashed ${C.border}`,borderRadius:8,padding:'20px',textAlign:'center',marginBottom:20,background:'#fafafa',cursor:'pointer'}}
            onClick={()=>fileRef.current?.click()}
            onMouseEnter={e=>e.currentTarget.style.borderColor=C.green}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.pdf,.csv" style={{display:'none'}} onChange={()=>{}}/>
            <Ico name="upload" size={32} color={C.muted}/>
            <div style={{fontSize:14,fontWeight:600,color:C.text2,marginTop:8}}>Importer depuis Excel ou PDF</div>
            <div style={{fontSize:12,color:C.muted,marginTop:4}}>Formats supportés: .xlsx, .xls, .pdf, .csv</div>
            <Btn label="Choisir un fichier" onClick={()=>fileRef.current?.click()} ghost sm icon="upload" style={{marginTop:10}}/>
          </div>

          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
            <div style={{flex:1,height:1,background:C.border2}}/>
            <span style={{fontSize:12,color:C.muted,fontWeight:600}}>OU SAISIR MANUELLEMENT</span>
            <div style={{flex:1,height:1,background:C.border2}}/>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
            <Field label="Numéro BC *" required>
              <Input value={numero} onChange={setNumero} placeholder="Ex: BC-MTN-2024-001"/>
            </Field>
            <Field label="Client *" required>
              <Select value={client} onChange={setClient} options={CLIENTS} placeholder="Sélectionner client"/>
            </Field>
            <Field label="Date de réception" required>
              <Input type="date" value={dateReception} onChange={setDateReception}/>
            </Field>
            <Field label="Date d'échéance">
              <Input type="date" value={dateEcheance} onChange={setDateEcheance}/>
            </Field>
            <Field label="Site concerné">
              <Select value={site} onChange={setSite} options={SITES} placeholder="Sélectionner site"/>
            </Field>
            <Field label="Devise">
              <Select value={devise} onChange={setDevise} options={DEVISES}/>
            </Field>
            <Field label="Description des travaux" col1>
              <Textarea value={description} onChange={setDescription} placeholder="Description complète des travaux du bon de commande..."/>
            </Field>
            <Field label="Notes internes" col1>
              <Textarea value={notes} onChange={setNotes} placeholder="Notes, source du BC, conditions particulières..." rows={2}/>
            </Field>
          </div>

          <div style={{display:'flex',justifyContent:'flex-end',gap:10,paddingTop:16,borderTop:`1px solid ${C.border2}`}}>
            <Btn label="Annuler" onClick={onClose} ghost/>
            <Btn label="Suivant — Liste des éléments →" onClick={()=>setStep(2)} primary icon="arrow_right"/>
          </div>
        </div>
      )}

      {/* STEP 2 — Liste éléments BC */}
      {step===2&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:C.text}}>Liste des éléments du BC</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>{lignes.length} élément(s) · Total TTC: {fmtN(Math.round(totalBC))} {devise}</div>
            </div>
            <Btn label="+ Ajouter élément" onClick={addLigne} primary icon="plus" sm/>
          </div>

          <div style={{border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden',marginBottom:16}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:C.bg,borderBottom:`2px solid ${C.border}`}}>
                  {['Réf.','Description','Unité','Qté','Prix unit.',`TVA ${(TVA_RATE*100).toFixed(0)}%`,'Total TTC',''].map(h=>(
                    <th key={h} style={{padding:'9px 10px',textAlign:'left',fontSize:11,fontWeight:700,color:C.muted,textTransform:'uppercase',whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lignes.map((l,i)=>{
                  const ttc = l.qte*l.puBC*(l.tva?1+TVA_RATE:1);
                  return (
                    <tr key={l.id} style={{borderBottom:`1px solid ${C.border2}`,background:i%2===0?C.white:'#fafafa'}}>
                      <td style={{padding:'6px 8px',width:90}}><Input value={l.ref} onChange={v=>updLigne(i,'ref',v)} placeholder="Réf." small/></td>
                      <td style={{padding:'6px 8px'}}><Input value={l.description} onChange={v=>updLigne(i,'description',v)} placeholder="Description de l'élément" small/></td>
                      <td style={{padding:'6px 8px',width:90}}>
                        <select value={l.unite} onChange={e=>updLigne(i,'unite',e.target.value)} style={{width:'100%',padding:'6px 8px',borderRadius:4,border:`1px solid ${C.border}`,fontSize:12,background:C.white,fontFamily:'inherit'}}>
                          {UNITES.map(u=><option key={u} value={u}>{u}</option>)}
                        </select>
                      </td>
                      <td style={{padding:'6px 8px',width:65}}><Input type="number" value={l.qte} onChange={v=>updLigne(i,'qte',+v)} min="0" small/></td>
                      <td style={{padding:'6px 8px',width:110}}><Input type="number" value={l.puBC} onChange={v=>updLigne(i,'puBC',+v)} min="0" small/></td>
                      <td style={{padding:'6px 10px',width:60,textAlign:'center'}}><input type="checkbox" checked={l.tva} onChange={e=>updLigne(i,'tva',e.target.checked)} style={{width:16,height:16,cursor:'pointer',accentColor:C.green}}/></td>
                      <td style={{padding:'6px 10px',width:120,fontSize:13,fontWeight:600,color:C.blue,whiteSpace:'nowrap'}}>{fmtN(Math.round(ttc))} {devise}</td>
                      <td style={{padding:'6px 8px',width:30}}>
                        {lignes.length>1&&<button onClick={()=>delLigne(i)} style={{width:24,height:24,borderRadius:4,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ico name="close" size={12} color={C.muted}/></button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{background:C.bg,borderTop:`2px solid ${C.border}`}}>
                  <td colSpan={5} style={{padding:'10px 14px',fontSize:13,color:C.muted}}>
                    {lignes.length} élément(s)
                  </td>
                  <td colSpan={2} style={{padding:'10px 14px'}}>
                    <div style={{display:'flex',flexDirection:'column',gap:3}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:C.muted}}>
                        <span>HT :</span><span>{fmtN(totalHT)} {devise}</span>
                      </div>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:C.red}}>
                        <span>TVA :</span><span>{fmtN(Math.round(totalBC-totalHT))} {devise}</span>
                      </div>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:14,fontWeight:800,color:C.blue}}>
                        <span>TTC :</span><span>{fmtN(Math.round(totalBC))} {devise}</span>
                      </div>
                    </div>
                  </td>
                  <td/>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style={{display:'flex',justifyContent:'space-between',gap:10,paddingTop:16,borderTop:`1px solid ${C.border2}`}}>
            <Btn label="← Retour" onClick={()=>setStep(1)} ghost/>
            <Btn label="Suivant — Projet & Facturation →" onClick={()=>setStep(3)} primary icon="arrow_right"/>
          </div>
        </div>
      )}

      {/* STEP 3 — Projet & Facturation */}
      {step===3&&(
        <div>
          {/* Créer projet automatiquement */}
          <div style={{background:C.green_bg,borderRadius:8,padding:'16px 18px',border:`1px solid ${C.green}30`,marginBottom:20}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:creerProjet?12:0}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:36,height:36,borderRadius:8,background:C.green,display:'flex',alignItems:'center',justifyContent:'center'}}><Ico name="project" size={18} color="white"/></div>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:C.text}}>Créer un projet automatiquement</div>
                  <div style={{fontSize:12,color:C.muted}}>Le projet sera créé avec tous les détails du BC</div>
                </div>
              </div>
              <input type="checkbox" checked={creerProjet} onChange={e=>setCreerProjet(e.target.checked)} style={{width:20,height:20,cursor:'pointer',accentColor:C.green}}/>
            </div>
            {creerProjet&&(
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12,padding:'12px',background:'white',borderRadius:6,border:`1px solid ${C.border2}`}}>
                {[
                  {l:'Référence projet',v:`PROJ-${new Date().getFullYear()}-AUTO`},
                  {l:'Client',v:client},
                  {l:'Site',v:site||'À définir'},
                  {l:'Montant contrat',v:`${fmtN(Math.round(totalBC))} ${devise}`},
                ].map(item=>(
                  <div key={item.l}>
                    <div style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:0.4,marginBottom:2}}>{item.l}</div>
                    <div style={{fontSize:13,fontWeight:600,color:C.text}}>{item.v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Plan de paiement */}
          <div style={{background:C.bg,borderRadius:8,padding:'16px 18px',border:`1px solid ${C.border}`,marginBottom:20}}>
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:12}}>Plan de paiement / Facturation</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
              {PLANS.map(p=>(
                <div key={p.id} onClick={()=>setPlanPaiement(p.id)} style={{padding:12,borderRadius:6,border:`2px solid ${planPaiement===p.id?C.green:C.border}`,background:planPaiement===p.id?C.green_bg:C.white,cursor:'pointer',transition:'all .1s'}}>
                  <div style={{fontSize:13,fontWeight:planPaiement===p.id?700:500,color:planPaiement===p.id?C.green:C.text}}>{p.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Analyse des éléments BC */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:12}}>Analyse des éléments — 3 types de factures</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
              {[
                {
                  title:'Éléments à facturer',
                  icon:'check',
                  color:C.green,
                  bg:C.green_bg,
                  items:lignes.filter(l=>l.status==='facture'||l.status==='non_facture'),
                  desc:'Tous les éléments livrés et utilisés',
                },
                {
                  title:'Éléments partiels',
                  icon:'alert',
                  color:C.orange,
                  bg:C.orange_bg,
                  items:lignes.filter(l=>l.status==='partiel'),
                  desc:'Éléments partiellement utilisés',
                },
                {
                  title:'Non utilisés / Avoirs',
                  icon:'close',
                  color:C.red,
                  bg:C.red_bg,
                  items:lignes.filter(l=>l.status==='non_facture'&&l.qteUtilisee===0),
                  desc:'Éléments non fournis ou non requis',
                },
              ].map(type=>(
                <div key={type.title} style={{background:type.bg,borderRadius:8,padding:14,border:`1px solid ${type.color}25`}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                    <div style={{width:28,height:28,borderRadius:6,background:type.color,display:'flex',alignItems:'center',justifyContent:'center'}}><Ico name={type.icon} size={14} color="white"/></div>
                    <span style={{fontSize:13,fontWeight:700,color:type.color}}>{type.title}</span>
                  </div>
                  <div style={{fontSize:11,color:C.muted,marginBottom:8}}>{type.desc}</div>
                  <div style={{fontSize:14,fontWeight:800,color:type.color}}>
                    {fmtN(Math.round(type.items.reduce((s,l)=>s+l.qte*l.puBC*(l.tva?1+TVA_RATE:1),0)))} {devise}
                  </div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>{type.items.length} élément(s)</div>
                </div>
              ))}
            </div>
          </div>

          {/* Info workflow */}
          <div style={{padding:'12px 16px',background:'#eff6ff',borderRadius:6,border:`1px solid ${C.blue}25`,marginBottom:20,display:'flex',gap:10,alignItems:'flex-start'}}>
            <Ico name="link" size={16} color={C.blue}/>
            <div style={{fontSize:12,color:C.blue}}>
              <strong>Liaison automatique :</strong> Ce BC sera lié au projet créé. Toutes les factures générées depuis ce BC seront automatiquement rattachées au projet et au suivi de rentabilité dans Finance.
            </div>
          </div>

          <div style={{display:'flex',justifyContent:'space-between',gap:10,paddingTop:16,borderTop:`1px solid ${C.border2}`}}>
            <Btn label="← Retour" onClick={()=>setStep(2)} ghost/>
            <div style={{display:'flex',gap:8}}>
              <Btn label="Importer sans créer projet" onClick={()=>handleImport()} ghost icon="download"/>
              <Btn label={saving?'Import en cours...':'✓ Importer et créer projet'} onClick={handleImport} primary icon="check" disabled={saving}/>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
};

// ===== DÉTAIL BC =====
const DetailBC = ({bc, onClose, onUpdate}) => {
  const [activeTab, setActiveTab] = useState('elements');

  const toFCFA = (v, devise) => devise==='FCFA' ? v : v*(DEVISES_RATES[devise]||1);
  const totalTTC = bc.lignes.reduce((s,l)=>s+l.qte*l.puBC*(l.tva?1+TVA_RATE:1),0);
  const totalFacture = bc.lignes.filter(l=>l.status==='facture').reduce((s,l)=>s+l.qteFacturee*l.puBC*(l.tva?1+TVA_RATE:1),0);
  const totalPartiel = bc.lignes.filter(l=>l.status==='partiel').reduce((s,l)=>s+l.qteFacturee*l.puBC*(l.tva?1+TVA_RATE:1),0);
  const totalNonFacture = bc.lignes.filter(l=>l.status==='non_facture').reduce((s,l)=>s+l.qte*l.puBC*(l.tva?1+TVA_RATE:1),0);
  const pctFacture = totalTTC>0?Math.round(totalFacture/totalTTC*100):0;

  const updLigne = (id, k, v) => {
    const updated = {...bc, lignes:bc.lignes.map(l=>l.id===id?{...l,[k]:v}:l)};
    onUpdate(updated);
  };

  return (
    <Panel title={bc.numero} subtitle={bc.client} onClose={onClose} width={920}>
      {/* KPIs */}
      <div style={{display:'flex',gap:12,marginBottom:20}}>
        {[
          {l:'Montant BC total',v:`${fmtN(Math.round(totalTTC))} ${bc.devise}`,c:C.blue},
          {l:'Facturé',v:`${fmtN(Math.round(totalFacture+totalPartiel))} ${bc.devise} (${pctFacture}%)`,c:C.green},
          {l:'Non facturé',v:`${fmtN(Math.round(totalNonFacture))} ${bc.devise}`,c:C.red},
          {l:'Éléments',v:`${bc.lignes.length} lignes`,c:C.muted},
        ].map(k=>(
          <div key={k.l} style={{flex:1,background:C.bg,borderRadius:6,padding:'12px 14px',borderLeft:`3px solid ${k.c}`}}>
            <div style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:0.4,marginBottom:3}}>{k.l}</div>
            <div style={{fontSize:14,fontWeight:700,color:k.c}}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Infos BC */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16,padding:'12px 14px',background:C.bg,borderRadius:6}}>
        {[
          {l:'Client',v:bc.client},{l:'Site',v:bc.site||'—'},
          {l:'Réception',v:fmtD(bc.dateReception)},{l:'Échéance',v:fmtD(bc.dateEcheance)},
          {l:'Devise',v:bc.devise},{l:'Statut',v:<Badge status={bc.status}/>},
        ].map(item=>(
          <div key={item.l}>
            <div style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:0.4,marginBottom:2}}>{item.l}</div>
            <div style={{fontSize:13,fontWeight:600,color:C.text}}>{item.v}</div>
          </div>
        ))}
      </div>

      {bc.projetCree&&(
        <div style={{padding:'10px 14px',background:C.green_bg,borderRadius:6,border:`1px solid ${C.green}30`,marginBottom:14,display:'flex',alignItems:'center',gap:10}}>
          <Ico name="link" size={16} color={C.green}/>
          <span style={{fontSize:13,fontWeight:600,color:C.green}}>Projet lié: {bc.projetCree}</span>
          <Btn label="Voir le projet" onClick={()=>{}} ghost sm icon="eye"/>
        </div>
      )}

      {bc.description&&(
        <div style={{padding:'10px 14px',background:C.bg,borderRadius:6,marginBottom:14,fontSize:13,color:C.text2}}>{bc.description}</div>
      )}

      {/* Tabs */}
      <div style={{display:'flex',gap:2,borderBottom:`1px solid ${C.border}`,marginBottom:16}}>
        {[
          {id:'elements',l:'Éléments BC',n:bc.lignes.length},
          {id:'facture',l:'À facturer',n:bc.lignes.filter(l=>l.status==='facture').length,c:C.green},
          {id:'partiel',l:'Partiels',n:bc.lignes.filter(l=>l.status==='partiel').length,c:C.orange},
          {id:'non_facture',l:'Non facturés',n:bc.lignes.filter(l=>l.status==='non_facture').length,c:C.red},
        ].map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{padding:'8px 14px',border:'none',borderBottom:`2px solid ${activeTab===t.id?C.green:'transparent'}`,background:'transparent',color:activeTab===t.id?C.green:C.muted,fontWeight:activeTab===t.id?700:400,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontFamily:'inherit'}}>
            {t.l}
            {t.n>0&&<span style={{padding:'1px 7px',borderRadius:10,background:activeTab===t.id?(t.c||C.green_bg):C.bg,color:activeTab===t.id?(t.c||C.green):C.muted,fontSize:11,fontWeight:700}}>{t.n}</span>}
          </button>
        ))}
      </div>

      {/* Liste éléments filtrée */}
      {(() => {
        const filtered = activeTab==='elements'?bc.lignes:bc.lignes.filter(l=>l.status===activeTab);
        return (
          <div style={{border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden',marginBottom:16}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:C.bg,borderBottom:`2px solid ${C.border}`}}>
                  {['Réf.','Description','Unité','Qté BC','Prix unit.','Total BC','Qté utilisée','Qté facturée','Statut','Notes'].map(h=>(
                    <th key={h} style={{padding:'8px 10px',textAlign:'left',fontSize:10,fontWeight:700,color:C.muted,textTransform:'uppercase',whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l,i)=>{
                  const statusColors = {facture:C.green,partiel:C.orange,non_facture:C.red};
                  const rowBg = l.status==='facture'?'#f9fff9':l.status==='partiel'?'#fffaf5':l.status==='non_facture'?'#fff9f9':C.white;
                  return (
                    <tr key={l.id} style={{borderBottom:`1px solid ${C.border2}`,background:i%2===0?rowBg:'#fafafa'}}>
                      <td style={{padding:'9px 10px',fontSize:12,fontFamily:'monospace',color:C.muted,fontWeight:600}}>{l.ref}</td>
                      <td style={{padding:'9px 10px',fontSize:13,color:C.text,maxWidth:200}}>
                        <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.description}</div>
                      </td>
                      <td style={{padding:'9px 10px',fontSize:12,color:C.muted}}>{l.unite}</td>
                      <td style={{padding:'9px 10px',fontSize:13,fontWeight:600,textAlign:'center'}}>{l.qte}</td>
                      <td style={{padding:'9px 10px',fontSize:13,color:C.text}}>{fmtN(l.puBC)}</td>
                      <td style={{padding:'9px 10px',fontSize:13,fontWeight:700,color:C.blue}}>{fmtN(Math.round(l.qte*l.puBC*(l.tva?1+TVA_RATE:1)))}</td>
                      <td style={{padding:'9px 10px',textAlign:'center'}}>
                        <input type="number" value={l.qteUtilisee} min={0} max={l.qte}
                          onChange={e=>updLigne(l.id,'qteUtilisee',+e.target.value)}
                          style={{width:55,padding:'4px 6px',borderRadius:4,border:`1px solid ${C.border}`,fontSize:12,textAlign:'center',fontFamily:'inherit'}}/>
                      </td>
                      <td style={{padding:'9px 10px',textAlign:'center'}}>
                        <input type="number" value={l.qteFacturee} min={0} max={l.qte}
                          onChange={e=>updLigne(l.id,'qteFacturee',+e.target.value)}
                          style={{width:55,padding:'4px 6px',borderRadius:4,border:`1px solid ${C.border}`,fontSize:12,textAlign:'center',fontFamily:'inherit'}}/>
                      </td>
                      <td style={{padding:'9px 10px'}}>
                        <select value={l.status} onChange={e=>updLigne(l.id,'status',e.target.value)}
                          style={{padding:'4px 8px',borderRadius:4,border:`1px solid ${statusColors[l.status]||C.border}`,fontSize:11,color:statusColors[l.status]||C.text,background:'white',cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>
                          <option value="facture">Facturé</option>
                          <option value="partiel">Partiel</option>
                          <option value="non_facture">Non facturé</option>
                        </select>
                      </td>
                      <td style={{padding:'9px 10px',fontSize:11,color:C.muted,maxWidth:120}}>
                        <input value={l.notes} onChange={e=>updLigne(l.id,'notes',e.target.value)}
                          placeholder="Note..." style={{width:'100%',padding:'4px 6px',borderRadius:4,border:`1px solid ${C.border}`,fontSize:11,fontFamily:'inherit'}}/>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })()}

      {/* Actions */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',paddingTop:16,borderTop:`1px solid ${C.border2}`}}>
        <Btn label="Générer Facture éléments utilisés" onClick={()=>{}} primary icon="invoice"/>
        <Btn label="Générer Facture éléments partiels" onClick={()=>{}} ghost icon="invoice" style={{color:C.orange,borderColor:C.orange}}/>
        <Btn label="Générer Avoir non utilisés" onClick={()=>{}} ghost icon="invoice" style={{color:C.red,borderColor:C.red}}/>
        <div style={{flex:1}}/>
        <Btn label="Voir projet lié" onClick={()=>{}} ghost icon="project" sm/>
        <Btn label="Exporter BC" onClick={()=>{}} ghost icon="download" sm/>
      </div>
    </Panel>
  );
};

// ===== COMPOSANT PRINCIPAL =====
export default function BonsCommande() {
  const [bcs, setBcs] = useState(SEED_BCS);
  const [selected, setSelected] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');

  const handleImport = (bc, creerProjet, planPaiement) => {
    setBcs(p=>[bc,...p]);
    // Notification projet créé
    if (creerProjet) {
      setTimeout(()=>alert(`✅ BC importé avec succès!\n\nProjet ${bc.projetCree} créé automatiquement dans Finance & Projets.\nPlan de paiement: ${planPaiement}`),100);
    }
  };

  const updateBC = (updated) => {
    setBcs(p=>p.map(bc=>bc.id===updated.id?updated:bc));
    setSelected(updated);
  };

  const filtered = bcs.filter(bc=>{
    const ms = !search||bc.numero.toLowerCase().includes(search.toLowerCase())||bc.client.toLowerCase().includes(search.toLowerCase());
    const mf = filterStatus==='tous'||bc.status===filterStatus;
    return ms&&mf;
  });

  const totalMontant = filtered.reduce((s,bc)=>bc.devise==='FCFA'?s+bc.lignes.reduce((ss,l)=>ss+l.qte*l.puBC*(l.tva?1+TVA_RATE:1),0):s,0);

  return (
    <div style={{minHeight:'100vh',background:'#f4f5f7',fontFamily:'Segoe UI,Arial,sans-serif'}}>
      {/* Header */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:'0 28px'}}>
        <div style={{maxWidth:1400,margin:'0 auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 0 12px'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:36,height:36,borderRadius:8,background:C.blue,display:'flex',alignItems:'center',justifyContent:'center'}}><Ico name="excel" size={20} color="white"/></div>
              <div>
                <h1 style={{fontSize:18,fontWeight:700,color:C.text,margin:'0 0 2px'}}>Bons de Commande</h1>
                <p style={{color:C.muted,margin:0,fontSize:12}}>Import Excel/PDF · Création projet automatique · Liaison Finance</p>
              </div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <Btn label="Exporter" onClick={()=>{}} ghost icon="download" sm/>
              <Btn label="Importer un BC" onClick={()=>setShowImport(true)} primary icon="upload"/>
            </div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1400,margin:'0 auto',padding:'20px 28px'}}>
        {/* KPIs */}
        <div style={{display:'flex',gap:14,marginBottom:20,flexWrap:'wrap'}}>
          {[
            {l:'Total BCs',v:bcs.length,c:C.blue,icon:'excel'},
            {l:'En cours',v:bcs.filter(b=>b.status==='en_cours').length,c:C.orange,icon:'filter'},
            {l:'Montant total',v:`${fmtN(totalMontant)} FCFA`,c:C.green,icon:'invoice'},
            {l:'Projets créés',v:bcs.filter(b=>b.projetCree).length,c:C.blue,icon:'project'},
            {l:'Reçus / À traiter',v:bcs.filter(b=>b.status==='recu').length,c:C.red,icon:'alert'},
          ].map(k=>(
            <div key={k.l} style={{flex:1,minWidth:150,background:C.white,borderRadius:6,padding:'14px 16px',border:`1px solid ${C.border}`,boxShadow:'0 1px 3px rgba(0,0,0,0.06)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:0.4,marginBottom:4}}>{k.l}</div>
                <div style={{fontSize:typeof k.v==='string'?14:22,fontWeight:700,color:k.c}}>{k.v}</div>
              </div>
              <div style={{width:36,height:36,borderRadius:6,background:`${k.c}15`,display:'flex',alignItems:'center',justifyContent:'center'}}><Ico name={k.icon} size={18} color={k.c}/></div>
            </div>
          ))}
        </div>

        {/* Alerte BCs à traiter */}
        {bcs.filter(b=>b.status==='recu').length>0&&(
          <div style={{background:'#fef5e7',borderRadius:6,padding:'12px 16px',border:`1px solid ${C.orange}30`,marginBottom:16,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <Ico name="alert" size={18} color={C.orange}/>
              <span style={{fontSize:13,fontWeight:600,color:C.orange}}>{bcs.filter(b=>b.status==='recu').length} bon(s) de commande reçu(s) — Projet à créer</span>
            </div>
            <Btn label="Voir" onClick={()=>setFilterStatus('recu')} ghost sm/>
          </div>
        )}

        {/* Filtres */}
        <div style={{display:'flex',gap:10,marginBottom:14,alignItems:'center',flexWrap:'wrap'}}>
          <div style={{flex:1,minWidth:240,display:'flex',alignItems:'center',gap:8,background:C.white,border:`1px solid ${C.border}`,borderRadius:4,padding:'8px 12px'}}>
            <Ico name="search" size={16} color={C.muted}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Numéro BC, client..."
              style={{flex:1,border:'none',outline:'none',fontSize:13,color:C.text,background:'transparent',fontFamily:'inherit'}}/>
          </div>
          <div style={{display:'flex',background:C.white,border:`1px solid ${C.border}`,borderRadius:4,padding:2,gap:2}}>
            {['tous','recu','valide','en_cours','termine','annule'].map(s=>(
              <button key={s} onClick={()=>setFilterStatus(s)} style={{padding:'6px 12px',borderRadius:3,border:'none',background:filterStatus===s?C.green:'transparent',color:filterStatus===s?C.white:C.muted,fontWeight:filterStatus===s?700:400,fontSize:12,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>
                {s==='tous'?'Tous':s==='recu'?'Reçus':s==='valide'?'Validés':s==='en_cours'?'En cours':s==='termine'?'Terminés':'Annulés'}
              </button>
            ))}
          </div>
        </div>

        {/* Tableau BCs */}
        <Table
          cols={['Numéro BC','Client','Site','Date réception','Échéance','Montant TTC','Devise','Projet créé','Factures','Statut','']}
          rows={filtered.map(bc=>{
            const totalBC = bc.lignes.reduce((s,l)=>s+l.qte*l.puBC*(l.tva?1+TVA_RATE:1),0);
            return [
              <span style={{fontWeight:700,color:C.blue,fontFamily:'monospace',cursor:'pointer'}} onClick={()=>setSelected(bc)}>{bc.numero}</span>,
              <span style={{fontWeight:500}}>{bc.client}</span>,
              <span style={{fontSize:12,color:C.muted}}>{bc.site||'—'}</span>,
              <span style={{fontSize:12,color:C.muted}}>{fmtD(bc.dateReception)}</span>,
              <span style={{fontSize:12,color:new Date(bc.dateEcheance)<new Date()&&bc.status!=='termine'?C.red:C.muted}}>{fmtD(bc.dateEcheance)}</span>,
              <strong style={{color:C.blue}}>{fmtN(Math.round(totalBC))}</strong>,
              <span style={{padding:'2px 7px',borderRadius:10,background:bc.devise==='FCFA'?C.blue_bg:C.green_bg,color:bc.devise==='FCFA'?C.blue:C.green,fontSize:11,fontWeight:700}}>{bc.devise}</span>,
              bc.projetCree
                ? <span style={{display:'flex',alignItems:'center',gap:4,fontSize:12,color:C.green,fontWeight:600}}><Ico name="check" size={12} color={C.green}/>{bc.projetCree}</span>
                : <Btn label="Créer projet" onClick={()=>setSelected(bc)} ghost sm icon="plus"/>,
              <span style={{fontSize:12,color:C.muted}}>{bc.facturesCrees.length} facture(s)</span>,
              <Badge status={bc.status}/>,
              <div style={{display:'flex',gap:4}}>
                <button onClick={()=>setSelected(bc)} style={{width:28,height:28,borderRadius:4,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ico name="eye" size={13} color={C.muted}/></button>
                <button onClick={()=>setSelected(bc)} style={{width:28,height:28,borderRadius:4,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ico name="invoice" size={13} color={C.blue}/></button>
              </div>,
            ];
          })}
          onRowClick={i=>setSelected(filtered[i])}
          empty="Aucun bon de commande. Importez votre premier BC."
        />
      </div>

      {selected&&<DetailBC bc={selected} onClose={()=>setSelected(null)} onUpdate={updateBC}/>}
      {showImport&&<ImportBCModal onClose={()=>setShowImport(false)} onImport={handleImport}/>}
    </div>
  );
}
