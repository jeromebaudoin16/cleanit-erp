import { useState, useEffect, useRef } from 'react';

// ============================================================
// CONSTANTES & DONNÉES
// ============================================================
const TVA = 0.1925;
const DEVISES = { FCFA: 1, USD: 620, EUR: 655, CNY: 85 };
const CLIENTS = [
  { id:1, nom:'MTN Cameroun',          email:'finance@mtn.cm',        tel:'+237 222 222 222', ville:'Douala' },
  { id:2, nom:'Orange Cameroun',       email:'comptabilite@orange.cm', tel:'+237 233 333 333', ville:'Yaoundé' },
  { id:3, nom:'Huawei Technologies',   email:'ap@huawei.com',          tel:'+237 244 444 444', ville:'Douala' },
  { id:4, nom:'Nexttel Cameroun',      email:'finance@nexttel.cm',     tel:'+237 255 555 555', ville:'Yaoundé' },
  { id:5, nom:'Gouvernement Cameroun', email:'tresor@finances.cm',     tel:'+237 222 234 567', ville:'Yaoundé' },
  { id:6, nom:'CAMTEL',                email:'achat@camtel.cm',        tel:'+237 222 345 678', ville:'Yaoundé' },
];
const PROJETS = [
  'DLA-001 · Site Akwa Douala','DLA-003 · Site Bonabéri',
  'YDE-001 · Site Centre Yaoundé','KRI-001 · Kribi Port',
  'GAR-001 · Site Garoua','LIM-001 · Site Limbé',
  'BFN-001 · Site Bafoussam','Infrastructure nationale',
];
const PRESTATIONS = [
  { libelle:'Installation antennes 5G NR',           pu:8500000,  unite:'Forfait' },
  { libelle:'Installation antennes 4G LTE',           pu:4200000,  unite:'Forfait' },
  { libelle:'Main d\'œuvre technicien senior',        pu:450000,   unite:'Jour' },
  { libelle:'Main d\'œuvre technicien',               pu:280000,   unite:'Jour' },
  { libelle:'Survey & étude de site',                 pu:1200000,  unite:'Forfait' },
  { libelle:'Maintenance préventive',                 pu:850000,   unite:'Forfait' },
  { libelle:'Configuration équipements réseau',       pu:650000,   unite:'Forfait' },
  { libelle:'Déplacement & transport (km)',           pu:800,      unite:'km' },
  { libelle:'Per diem technicien',                    pu:35000,    unite:'Jour' },
  { libelle:'Matériel consommable câblage',           pu:1,        unite:'FCFA' },
];
const MODES_PAIEMENT = [
  'Virement bancaire BICEC','Virement bancaire SGC','Virement bancaire UBC',
  'Chèque certifié','Espèces','Mobile Money MTN','Mobile Money Orange Money',
  'Virement international SWIFT','Lettre de crédit documentaire',
];
const CONDITIONS_PAIEMENT = [
  '30 jours net','60 jours net','90 jours net',
  'Paiement immédiat','30% acompte + 70% livraison',
  'Paiement en 3 fois (30-40-30)','Sur présentation de facture',
];

const fmtN  = (n, d='') => `${new Intl.NumberFormat('fr-FR').format(Math.round(n||0))}${d?' '+d:''}`;
const fmtD  = (d) => d ? new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'}) : '—';
const today = () => new Date().toISOString().split('T')[0];
const addDays = (n) => new Date(Date.now()+n*86400000).toISOString().split('T')[0];
const genNum = (prefix) => `${prefix}-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`;

const SEED_DEVIS = [
  { id:1, numero:'DEV-2024-0001', client:CLIENTS[0], projet:PROJETS[0], dateCreation:'2024-01-10', dateValidite:'2024-02-10', devise:'FCFA', conditions:'30 jours net', modePaiement:'Virement bancaire BICEC', objet:'Installation infrastructure 5G Phase 1 — Site Akwa Douala', lignes:[{id:1,libelle:'Installation antennes 5G NR',qte:2,pu:8500000,remise:0,tva:true,unite:'Forfait'},{id:2,libelle:'Main d\'œuvre technicien senior',qte:20,pu:450000,remise:5,tva:true,unite:'Jour'},{id:3,libelle:'Survey & étude de site',qte:1,pu:1200000,remise:0,tva:false,unite:'Forfait'}], status:'accepte', notes:'Devis accepté le 15/01/2024. Travaux démarrent le 01/02/2024.', factureId:null, acomptes:[], historique:[{date:'2024-01-10',action:'Devis créé',user:'Jérôme Bell'},{date:'2024-01-12',action:'Envoyé au client',user:'Jérôme Bell'},{date:'2024-01-15',action:'Accepté par MTN',user:'Système'}] },
  { id:2, numero:'DEV-2024-0002', client:CLIENTS[1], projet:PROJETS[2], dateCreation:'2024-01-20', dateValidite:'2024-02-20', devise:'FCFA', conditions:'60 jours net', modePaiement:'Virement bancaire SGC', objet:'Maintenance préventive Q1 2024 — Sites Yaoundé', lignes:[{id:1,libelle:'Maintenance préventive',qte:3,pu:850000,remise:10,tva:true,unite:'Forfait'},{id:2,libelle:'Main d\'œuvre technicien',qte:9,pu:280000,remise:0,tva:true,unite:'Jour'}], status:'envoye', notes:'En attente de validation direction achats Orange.', factureId:null, acomptes:[], historique:[{date:'2024-01-20',action:'Devis créé',user:'Marie Kamga'},{date:'2024-01-22',action:'Envoyé au client',user:'Marie Kamga'}] },
  { id:3, numero:'DEV-2024-0003', client:CLIENTS[3], projet:PROJETS[5], dateCreation:'2024-02-01', dateValidite:'2024-03-01', devise:'FCFA', conditions:'30% acompte + 70% livraison', modePaiement:'Virement bancaire BICEC', objet:'Déploiement 4G LTE — Site Limbé', lignes:[{id:1,libelle:'Installation antennes 4G LTE',qte:1,pu:4200000,remise:0,tva:true,unite:'Forfait'},{id:2,libelle:'Configuration équipements réseau',qte:1,pu:650000,remise:0,tva:true,unite:'Forfait'},{id:3,libelle:'Per diem technicien',qte:10,pu:35000,remise:0,tva:false,unite:'Jour'}], status:'brouillon', notes:'', factureId:null, acomptes:[], historique:[{date:'2024-02-01',action:'Devis créé',user:'Jérôme Bell'}] },
];

const SEED_FACTURES = [
  { id:101, numero:'FAC-2024-0001', devisId:1, client:CLIENTS[0], projet:PROJETS[0], dateEmission:'2024-01-16', dateEcheance:'2024-02-15', devise:'FCFA', conditions:'30 jours net', modePaiement:'Virement bancaire BICEC', objet:'Installation infrastructure 5G Phase 1 — Site Akwa Douala', lignes:[{id:1,libelle:'Installation antennes 5G NR',qte:2,pu:8500000,remise:0,tva:true,unite:'Forfait'},{id:2,libelle:'Main d\'œuvre technicien senior',qte:20,pu:450000,remise:5,tva:true,unite:'Jour'},{id:3,libelle:'Survey & étude de site',qte:1,pu:1200000,remise:0,tva:false,unite:'Forfait'}], status:'paye', notes:'Facture réglée par virement le 12/02/2024. Réf: VIR-BICEC-2024-0234', acomptes:[{id:1,date:'2024-01-20',montant:5000000,mode:'Virement bancaire BICEC',ref:'VIR-2024-001',note:'Acompte 30%'}], paiements:[{id:1,date:'2024-02-12',montant:0,mode:'Virement bancaire BICEC',ref:'VIR-BICEC-2024-0234',note:'Solde total réglé'}], historique:[{date:'2024-01-16',action:'Facture créée depuis DEV-2024-0001',user:'Jérôme Bell'},{date:'2024-01-16',action:'Envoyée par email',user:'Jérôme Bell'},{date:'2024-01-20',action:'Acompte reçu: 5 000 000 FCFA',user:'Système'},{date:'2024-02-12',action:'Paiement total reçu — Facture soldée',user:'Système'}] },
  { id:102, numero:'FAC-2024-0002', devisId:null, client:CLIENTS[4], projet:PROJETS[7], dateEmission:'2024-02-01', dateEcheance:'2024-04-01', devise:'FCFA', conditions:'Paiement en 3 fois (30-40-30)', modePaiement:'Virement bancaire BICEC', objet:'Déploiement infrastructure télécom zones rurales — Marché public', lignes:[{id:1,libelle:'Installation antennes 5G NR',qte:4,pu:8500000,remise:0,tva:true,unite:'Forfait'},{id:2,libelle:'Installation antennes 4G LTE',qte:6,pu:4200000,remise:5,tva:true,unite:'Forfait'},{id:3,libelle:'Main d\'œuvre technicien senior',qte:60,pu:450000,remise:0,tva:true,unite:'Jour'},{id:4,libelle:'Survey & étude de site',qte:4,pu:1200000,remise:0,tva:false,unite:'Forfait'}], status:'partiel', notes:'Marché public n°2024-INF-0012. Paiement échelonné selon avancement travaux.', acomptes:[{id:1,date:'2024-02-15',montant:15000000,mode:'Virement bancaire BICEC',ref:'TRESOR-2024-001',note:'1ère tranche 30%'}], paiements:[], historique:[{date:'2024-02-01',action:'Facture créée',user:'Jérôme Bell'},{date:'2024-02-01',action:'Envoyée au Trésor public',user:'Jérôme Bell'},{date:'2024-02-15',action:'1ère tranche reçue: 15 000 000 FCFA',user:'Système'}] },
  { id:103, numero:'FAC-2024-0003', devisId:null, client:CLIENTS[2], projet:PROJETS[3], dateEmission:'2024-02-10', dateEcheance:'2024-03-15', devise:'USD', conditions:'Sur présentation de facture', modePaiement:'Virement international SWIFT', objet:'Engineering & Technical Supervision Services — Kribi Port 5G', lignes:[{id:1,libelle:'Engineering services 5G NR',qte:40,pu:950,remise:0,tva:false,unite:'Jour'},{id:2,libelle:'Main d\'œuvre technicien senior',qte:15,pu:1200,remise:0,tva:false,unite:'Jour'}], status:'en_retard', notes:'Relance envoyée le 20/03/2024. Contact: Mr. Zhang Wei +86 138 0013 8000', acomptes:[], paiements:[], historique:[{date:'2024-02-10',action:'Facture créée',user:'Jérôme Bell'},{date:'2024-02-10',action:'Envoyée par email',user:'Jérôme Bell'},{date:'2024-03-20',action:'Relance envoyée',user:'Marie Kamga'}] },
];

// ============================================================
// CALCULS
// ============================================================
const calcLigne = (l) => {
  const ht = l.qte * l.pu * (1 - (l.remise||0)/100);
  const tvaAmt = l.tva ? ht * TVA : 0;
  return { ht, tvaAmt, ttc: ht + tvaAmt };
};

const calcTotaux = (lignes=[]) => {
  const rows = lignes.map(calcLigne);
  const totalHT  = rows.reduce((s,r) => s+r.ht, 0);
  const totalTVA = rows.reduce((s,r) => s+r.tvaAmt, 0);
  return { totalHT, totalTVA, totalTTC: totalHT + totalTVA, rows };
};

const getStatutPaiement = (doc) => {
  const { totalTTC } = calcTotaux(doc.lignes);
  const totalAcomptes = (doc.acomptes||[]).reduce((s,a) => s+a.montant, 0);
  const totalPaiements = (doc.paiements||[]).reduce((s,p) => s+p.montant, 0);
  const encaisse = totalAcomptes + totalPaiements;
  const reste = totalTTC - encaisse;
  return { totalTTC, encaisse, reste, pct: totalTTC>0 ? Math.round(encaisse/totalTTC*100) : 0 };
};

// ============================================================
// COMPOSANTS UI
// ============================================================
const Badge = ({ status }) => {
  const MAP = {
    brouillon:  ['Brouillon',  '#6b7280','#f3f4f6'],
    envoye:     ['Envoyé',     '#1d4ed8','#eff6ff'],
    accepte:    ['Accepté',    '#16a34a','#f0fdf4'],
    refuse:     ['Refusé',     '#dc2626','#fef2f2'],
    expire:     ['Expiré',     '#d97706','#fff7ed'],
    brouillon_f:['Brouillon',  '#6b7280','#f3f4f6'],
    paye:       ['Payée',      '#16a34a','#f0fdf4'],
    partiel:    ['Partiel',    '#d97706','#fefce8'],
    en_retard:  ['En retard',  '#dc2626','#fef2f2'],
    annule:     ['Annulée',    '#7c3aed','#f5f3ff'],
    avoir:      ['Avoir',      '#0891b2','#ecfeff'],
  };
  const [l,c,bg] = MAP[status]||['?','#6b7280','#f3f4f6'];
  return <span style={{padding:'3px 10px',borderRadius:20,background:bg,color:c,fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>{l}</span>;
};

const DevBadge = ({ d }) => {
  const MAP = {FCFA:['#1d4ed8','#eff6ff'],USD:['#16a34a','#f0fdf4'],EUR:['#7c3aed','#f5f3ff'],CNY:['#d97706','#fff7ed']};
  const [c,bg] = MAP[d]||['#6b7280','#f3f4f6'];
  return <span style={{padding:'2px 7px',borderRadius:6,background:bg,color:c,fontSize:11,fontWeight:700}}>{d}</span>;
};

const Th = ({ch,right}) => <th style={{padding:'11px 14px',textAlign:right?'right':'left',fontSize:11,fontWeight:800,color:'#6b7280',textTransform:'uppercase',letterSpacing:.5,background:'#f8fafc',borderBottom:'2px solid #e5e7eb',whiteSpace:'nowrap'}}>{ch}</th>;
const Td = ({ch,style,onClick}) => <td onClick={onClick} style={{padding:'12px 14px',fontSize:13,color:'#374151',verticalAlign:'middle',...style}}>{ch}</td>;

const Input = ({label,value,onChange,type='text',required,placeholder,disabled}) => (
  <div>
    <label style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:.5,display:'block',marginBottom:5}}>
      {label}{required&&<span style={{color:'#dc2626',marginLeft:2}}>*</span>}
    </label>
    <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
      style={{width:'100%',padding:'9px 12px',borderRadius:10,border:'1.5px solid #e5e7eb',fontSize:13,color:'#111827',background:disabled?'#f9fafb':'white',boxSizing:'border-box',outline:'none'}}
      onFocus={e=>!disabled&&(e.target.style.borderColor='#1d4ed8')}
      onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
  </div>
);

const Select = ({label,value,onChange,options,required,disabled}) => (
  <div>
    <label style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:.5,display:'block',marginBottom:5}}>
      {label}{required&&<span style={{color:'#dc2626',marginLeft:2}}>*</span>}
    </label>
    <select value={value||''} onChange={e=>onChange(e.target.value)} disabled={disabled}
      style={{width:'100%',padding:'9px 12px',borderRadius:10,border:'1.5px solid #e5e7eb',fontSize:13,color:'#111827',background:disabled?'#f9fafb':'white',boxSizing:'border-box',outline:'none'}}>
      <option value=''>— Sélectionner —</option>
      {options.map(o => typeof o==='object'
        ? <option key={o.id||o.nom} value={typeof o==='string'?o:o.id}>{o.nom||o}</option>
        : <option key={o} value={o}>{o}</option>
      )}
    </select>
  </div>
);

const Btn = ({label,onClick,color='#1d4ed8',bg,outline,small,disabled,icon}) => (
  <button onClick={onClick} disabled={disabled}
    style={{padding:small?'7px 12px':'10px 18px',borderRadius:10,border:outline?`1.5px solid ${color}`:'none',
      background:disabled?'#e5e7eb':outline?'transparent':(bg||color),
      color:disabled?'#9ca3af':outline?color:'white',
      fontWeight:700,fontSize:small?12:13,cursor:disabled?'not-allowed':'pointer',
      display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap',transition:'all .15s'}}
    onMouseEnter={e=>{if(!disabled)e.currentTarget.style.opacity='.85';}}
    onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
    {icon&&<span>{icon}</span>}{label}
  </button>
);

const Modal = ({title,subtitle,color='#1d4ed8',onClose,children,wide}) => (
  <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',zIndex:2000,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:20,overflowY:'auto'}}>
    <div style={{background:'white',borderRadius:20,width:'100%',maxWidth:wide?1100:800,marginTop:20,marginBottom:20,boxShadow:'0 32px 80px rgba(0,0,0,0.3)'}}>
      <div style={{background:`linear-gradient(135deg,#0f172a,${color})`,padding:'22px 28px',borderRadius:'20px 20px 0 0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          {subtitle&&<div style={{fontSize:10,color:'rgba(255,255,255,.45)',textTransform:'uppercase',letterSpacing:1,marginBottom:3}}>{subtitle}</div>}
          <div style={{fontSize:20,fontWeight:900,color:'white'}}>{title}</div>
        </div>
        <button onClick={onClose} style={{width:34,height:34,borderRadius:10,background:'rgba(255,255,255,.12)',border:'none',color:'white',cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
      </div>
      <div style={{padding:28,maxHeight:'78vh',overflowY:'auto'}}>{children}</div>
    </div>
  </div>
);

const Section = ({title,children,action,actionLabel}) => (
  <div style={{marginBottom:24}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
      <h4 style={{margin:0,fontSize:12,fontWeight:800,color:'#6b7280',textTransform:'uppercase',letterSpacing:.8}}>{title}</h4>
      {action&&<button onClick={action} style={{fontSize:12,fontWeight:700,color:'#1d4ed8',background:'none',border:'none',cursor:'pointer'}}>{actionLabel||'Voir tout →'}</button>}
    </div>
    {children}
  </div>
);

const Separator = () => <div style={{height:1,background:'#f3f4f6',margin:'16px 0'}}/>;

const InfoGrid = ({items}) => (
  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,padding:18,background:'#f8fafc',borderRadius:14,marginBottom:20}}>
    {items.map(i=>(
      <div key={i.l}>
        <div style={{fontSize:10,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:.5,marginBottom:3}}>{i.l}</div>
        <div style={{fontSize:13,fontWeight:600,color:'#111827'}}>{i.v||'—'}</div>
      </div>
    ))}
  </div>
);

// ============================================================
// TABLEAU DE LIGNES (réutilisable)
// ============================================================
const LignesTable = ({lignes,setLignes,devise,readOnly}) => {
  const [showCatalog,setShowCatalog] = useState(false);
  const addLigne = () => setLignes(p=>[...p,{id:Date.now(),libelle:'',qte:1,pu:0,remise:0,tva:true,unite:'Forfait'}]);
  const updLigne = (id,k,v) => setLignes(p=>p.map(l=>l.id===id?{...l,[k]:v}:l));
  const delLigne = (id) => setLignes(p=>p.filter(l=>l.id!==id));
  const addFromCatalog = (p) => { setLignes(prev=>[...prev,{id:Date.now(),...p,qte:1,remise:0,tva:true}]); setShowCatalog(false); };

  const { totalHT, totalTVA, totalTTC } = calcTotaux(lignes);

  return (
    <div>
      {!readOnly&&(
        <div style={{display:'flex',gap:8,marginBottom:10}}>
          <Btn label="+ Ajouter une ligne" onClick={addLigne} outline color="#1d4ed8" small icon="➕"/>
          <Btn label="📋 Catalogue prestations" onClick={()=>setShowCatalog(true)} outline color="#7c3aed" small/>
        </div>
      )}
      <div style={{background:'white',borderRadius:14,border:'1px solid #e5e7eb',overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:900}}>
            <thead>
              <tr>
                <Th ch="#" /><Th ch="Description / Prestation"/>
                <Th ch="Unité"/><Th ch="Qté"/><Th ch="PU HT"/>
                <Th ch="Remise %"/><Th ch="Total HT" right/>
                <Th ch={`TVA ${(TVA*100).toFixed(2)}%`}/><Th ch="Total TTC" right/>
                {!readOnly&&<Th ch=""/>}
              </tr>
            </thead>
            <tbody>
              {lignes.map((l,i)=>{
                const {ht,tvaAmt,ttc} = calcLigne(l);
                return (
                  <tr key={l.id} style={{borderBottom:'1px solid #f3f4f6',background:i%2===0?'white':'#fafbfc'}}>
                    <Td ch={<span style={{fontSize:11,fontWeight:700,color:'#9ca3af',width:24,height:24,borderRadius:7,background:'#f3f4f6',display:'flex',alignItems:'center',justifyContent:'center'}}>{i+1}</span>}/>
                    <Td ch={readOnly?<span style={{fontWeight:500}}>{l.libelle}</span>:<input value={l.libelle} onChange={e=>updLigne(l.id,'libelle',e.target.value)} placeholder="Description de la prestation" style={{width:'100%',padding:'6px 10px',borderRadius:8,border:'1px solid #e5e7eb',fontSize:13,minWidth:220}}/>}/>
                    <Td ch={readOnly?<span style={{fontSize:11,color:'#6b7280'}}>{l.unite}</span>:<select value={l.unite} onChange={e=>updLigne(l.id,'unite',e.target.value)} style={{padding:'6px 8px',borderRadius:8,border:'1px solid #e5e7eb',fontSize:12}}><option>Forfait</option><option>Jour</option><option>Heure</option><option>Unité</option><option>km</option><option>FCFA</option></select>}/>
                    <Td ch={readOnly?l.qte:<input type="number" min="0" value={l.qte} onChange={e=>updLigne(l.id,'qte',+e.target.value)} style={{width:65,padding:'6px 8px',borderRadius:8,border:'1px solid #e5e7eb',fontSize:13,textAlign:'center'}}/>}/>
                    <Td ch={readOnly?fmtN(l.pu,devise):<input type="number" min="0" value={l.pu} onChange={e=>updLigne(l.id,'pu',+e.target.value)} style={{width:120,padding:'6px 8px',borderRadius:8,border:'1px solid #e5e7eb',fontSize:13}}/>}/>
                    <Td ch={readOnly?`${l.remise||0}%`:<input type="number" min="0" max="100" value={l.remise||0} onChange={e=>updLigne(l.id,'remise',+e.target.value)} style={{width:60,padding:'6px 8px',borderRadius:8,border:'1px solid #e5e7eb',fontSize:13,textAlign:'center'}}/>}/>
                    <Td ch={<span style={{fontWeight:700}}>{fmtN(ht,devise)}</span>} style={{textAlign:'right'}}/>
                    <Td ch={readOnly
                      ?<span style={{color:l.tva?'#dc2626':'#9ca3af',fontSize:11,fontWeight:600}}>{l.tva?'Oui':'Exonéré'}</span>
                      :<label style={{display:'flex',alignItems:'center',gap:5,cursor:'pointer'}}><input type="checkbox" checked={l.tva} onChange={e=>updLigne(l.id,'tva',e.target.checked)} style={{width:15,height:15}}/><span style={{fontSize:11}}>{l.tva?`+${fmtN(tvaAmt)}`:'Exonéré'}</span></label>
                    }/>
                    <Td ch={<span style={{fontWeight:800,color:'#1d4ed8'}}>{fmtN(ttc,devise)}</span>} style={{textAlign:'right'}}/>
                    {!readOnly&&<Td ch={lignes.length>1&&<button onClick={()=>delLigne(l.id)} style={{width:26,height:26,borderRadius:7,border:'1px solid #fecaca',background:'#fef2f2',color:'#dc2626',cursor:'pointer',fontSize:13}}>✕</button>}/>}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{background:'#f8fafc'}}>
                <td colSpan={readOnly?6:7} style={{padding:'12px 14px',fontSize:12,fontWeight:600,color:'#6b7280',textAlign:'right'}}>Total HT</td>
                <td colSpan={2} style={{padding:'12px 14px',textAlign:'right'}}><span style={{fontSize:14,fontWeight:800,color:'#374151'}}>{fmtN(totalHT,devise)}</span></td>
                {!readOnly&&<td/>}
              </tr>
              <tr style={{background:'#f8fafc'}}>
                <td colSpan={readOnly?6:7} style={{padding:'8px 14px',fontSize:12,fontWeight:600,color:'#dc2626',textAlign:'right'}}>TVA {(TVA*100).toFixed(2)}%</td>
                <td colSpan={2} style={{padding:'8px 14px',textAlign:'right'}}><span style={{fontSize:14,fontWeight:700,color:'#dc2626'}}>+ {fmtN(totalTVA,devise)}</span></td>
                {!readOnly&&<td/>}
              </tr>
              <tr style={{background:'#eff6ff'}}>
                <td colSpan={readOnly?6:7} style={{padding:'14px',fontSize:14,fontWeight:800,color:'#1d4ed8',textAlign:'right'}}>TOTAL TTC</td>
                <td colSpan={2} style={{padding:'14px',textAlign:'right'}}><span style={{fontSize:20,fontWeight:900,color:'#1d4ed8'}}>{fmtN(totalTTC,devise)}</span></td>
                {!readOnly&&<td/>}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {showCatalog&&(
        <Modal title="Catalogue des prestations" subtitle="Sélectionner" color="#7c3aed" onClose={()=>setShowCatalog(false)}>
          <div style={{display:'grid',gap:8}}>
            {PRESTATIONS.map((p,i)=>(
              <div key={i} onClick={()=>addFromCatalog(p)}
                style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px',borderRadius:12,border:'1px solid #e5e7eb',cursor:'pointer',transition:'all .15s'}}
                onMouseEnter={e=>{e.currentTarget.style.background='#f5f3ff';e.currentTarget.style.borderColor='#7c3aed';}}
                onMouseLeave={e=>{e.currentTarget.style.background='white';e.currentTarget.style.borderColor='#e5e7eb';}}>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:'#111827'}}>{p.libelle}</div>
                  <div style={{fontSize:11,color:'#9ca3af',marginTop:2}}>Unité: {p.unite}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:14,fontWeight:800,color:'#7c3aed'}}>{fmtN(p.pu)}</div>
                  <div style={{fontSize:10,color:'#9ca3af'}}>FCFA / {p.unite}</div>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

// ============================================================
// HISTORIQUE TIMELINE
// ============================================================
const Timeline = ({items}) => (
  <div style={{position:'relative',paddingLeft:28}}>
    <div style={{position:'absolute',left:9,top:6,bottom:6,width:2,background:'#e5e7eb'}}/>
    {items.map((h,i)=>(
      <div key={i} style={{position:'relative',marginBottom:16}}>
        <div style={{position:'absolute',left:-19,top:2,width:12,height:12,borderRadius:6,background:i===0?'#1d4ed8':'#e5e7eb',border:'2px solid white',boxShadow:'0 0 0 1px '+(i===0?'#1d4ed8':'#d1d5db')}}/>
        <div style={{fontSize:12,fontWeight:600,color:'#374151',marginBottom:2}}>{h.action}</div>
        <div style={{fontSize:11,color:'#9ca3af'}}>{fmtD(h.date)} · {h.user}</div>
      </div>
    ))}
  </div>
);

// ============================================================
// ENREGISTRER PAIEMENT
// ============================================================
const PaiementModal = ({doc,onSave,onClose}) => {
  const {totalTTC,encaisse,reste} = getStatutPaiement(doc);
  const [date,setDate] = useState(today());
  const [montant,setMontant] = useState(reste);
  const [mode,setMode] = useState('Virement bancaire BICEC');
  const [ref,setRef] = useState('');
  const [note,setNote] = useState('');

  const handleSave = () => {
    if (!montant||!date) return;
    onSave({id:Date.now(),date,montant:+montant,mode,ref,note});
    onClose();
  };

  return (
    <Modal title="Enregistrer un paiement" subtitle="Règlement" color="#16a34a" onClose={onClose}>
      <div style={{background:'#f0fdf4',borderRadius:14,padding:16,marginBottom:20}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
          {[
            {l:'Montant total TTC',v:fmtN(totalTTC,doc.devise),c:'#374151'},
            {l:'Déjà encaissé',v:fmtN(encaisse,doc.devise),c:'#16a34a'},
            {l:'Reste à payer',v:fmtN(reste,doc.devise),c:'#dc2626'},
          ].map(i=>(
            <div key={i.l} style={{textAlign:'center'}}>
              <div style={{fontSize:10,color:'#6b7280',textTransform:'uppercase',letterSpacing:.5,marginBottom:4}}>{i.l}</div>
              <div style={{fontSize:18,fontWeight:900,color:i.c}}>{i.v}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
        <Input label="Date du paiement" value={date} onChange={setDate} type="date" required/>
        <Input label={`Montant (${doc.devise})`} value={montant} onChange={setMontant} type="number" required/>
        <Select label="Mode de paiement" value={mode} onChange={setMode} options={MODES_PAIEMENT}/>
        <Input label="Référence / N° transaction" value={ref} onChange={setRef} placeholder="Ex: VIR-BICEC-2024-0234"/>
      </div>
      <div style={{marginBottom:20}}>
        <label style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:.5,display:'block',marginBottom:5}}>Note</label>
        <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} placeholder="Note optionnelle..." style={{width:'100%',padding:'9px 12px',borderRadius:10,border:'1.5px solid #e5e7eb',fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>
      </div>
      {+montant > reste && <div style={{marginBottom:14,padding:10,background:'#fef2f2',borderRadius:10,color:'#dc2626',fontSize:12,fontWeight:600}}>⚠️ Le montant saisi ({fmtN(+montant,doc.devise)}) dépasse le reste à payer ({fmtN(reste,doc.devise)})</div>}
      <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
        <Btn label="Annuler" onClick={onClose} outline color="#6b7280"/>
        <Btn label="✅ Enregistrer le paiement" onClick={handleSave} disabled={!montant||!date||+montant<=0} color="#16a34a"/>
      </div>
    </Modal>
  );
};

// ============================================================
// MODAL DEVIS / FACTURE (création & édition)
// ============================================================
const DocEditor = ({type,doc,onSave,onClose}) => {
  const isDevis = type==='devis';
  const [clientId,setClientId] = useState(doc?.client?.id||'');
  const [projet,setProjet] = useState(doc?.projet||'');
  const [objet,setObjet] = useState(doc?.objet||'');
  const [devise,setDevise] = useState(doc?.devise||'FCFA');
  const [conditions,setConditions] = useState(doc?.conditions||'30 jours net');
  const [modePaiement,setModePaiement] = useState(doc?.modePaiement||'Virement bancaire BICEC');
  const [dateCreation,setDateCreation] = useState(doc?.dateCreation||today());
  const [dateEch,setDateEch] = useState(doc?.dateEcheance||doc?.dateValidite||addDays(30));
  const [lignes,setLignes] = useState(doc?.lignes?.length>0?doc.lignes:[{id:Date.now(),libelle:'',qte:1,pu:0,remise:0,tva:true,unite:'Forfait'}]);
  const [notes,setNotes] = useState(doc?.notes||'');
  const [saving,setSaving] = useState(false);

  const client = CLIENTS.find(c=>c.id===+clientId);
  const {totalHT,totalTVA,totalTTC} = calcTotaux(lignes);

  const handleSave = (status) => {
    if (!clientId||!objet) return alert('Client et objet sont obligatoires');
    setSaving(true);
    const numero = doc?.numero || genNum(isDevis?'DEV':'FAC');
    const saved = {
      id: doc?.id||Date.now(),
      numero,
      client,
      projet,objet,devise,conditions,modePaiement,notes,lignes,
      status: status||'brouillon',
      acomptes: doc?.acomptes||[],
      paiements: doc?.paiements||[],
      historique: [...(doc?.historique||[]),{date:today(),action:doc?'Document modifié':'Document créé',user:'Jérôme Bell'}],
      ...(isDevis ? {
        dateCreation,
        dateValidite:dateEch,
        factureId: doc?.factureId||null,
      } : {
        devisId: doc?.devisId||null,
        dateEmission: dateCreation,
        dateEcheance: dateEch,
      }),
    };
    setTimeout(()=>{onSave(saved);setSaving(false);onClose();},400);
  };

  return (
    <Modal title={doc?`Modifier ${doc.numero}`:`Nouveau ${isDevis?'devis':'facture'}`} subtitle={isDevis?'Document commercial':'Document comptable'} color={isDevis?'#7c3aed':'#059669'} onClose={onClose} wide>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14,marginBottom:20}}>
        <Select label="Client" value={clientId} onChange={setClientId} options={CLIENTS} required/>
        <Select label="Projet associé" value={projet} onChange={setProjet} options={PROJETS}/>
        <Select label="Devise" value={devise} onChange={setDevise} options={Object.keys(DEVISES)}/>
        <Input label="Objet" value={objet} onChange={setObjet} placeholder="Objet de la prestation" required/>
        <Select label="Conditions de paiement" value={conditions} onChange={setConditions} options={CONDITIONS_PAIEMENT}/>
        <Select label="Mode de paiement" value={modePaiement} onChange={setModePaiement} options={MODES_PAIEMENT}/>
        <Input label={isDevis?'Date du devis':'Date d\'émission'} value={dateCreation} onChange={setDateCreation} type="date"/>
        <Input label={isDevis?'Date de validité':'Date d\'échéance'} value={dateEch} onChange={setDateEch} type="date"/>
        {client&&<div style={{padding:12,background:'#eff6ff',borderRadius:10,gridColumn:'1/-1'}}>
          <div style={{fontSize:11,fontWeight:700,color:'#1d4ed8',marginBottom:4}}>CLIENT SÉLECTIONNÉ</div>
          <div style={{display:'flex',gap:20,fontSize:13}}>
            <span><strong>{client.nom}</strong></span>
            <span>📧 {client.email}</span>
            <span>📞 {client.tel}</span>
            <span>📍 {client.ville}</span>
          </div>
        </div>}
      </div>

      <Section title="Lignes de prestation">
        <LignesTable lignes={lignes} setLignes={setLignes} devise={devise}/>
      </Section>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
        <div>
          <label style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:.5,display:'block',marginBottom:5}}>Notes & conditions particulières</label>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={4}
            placeholder="Conditions particulières, remarques, délais de livraison..."
            style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1.5px solid #e5e7eb',fontSize:13,resize:'vertical',boxSizing:'border-box',fontFamily:'inherit'}}/>
        </div>
        <div style={{background:'#f8fafc',borderRadius:14,padding:18}}>
          {[
            {l:'Montant HT',v:fmtN(totalHT,devise),c:'#374151'},
            {l:`TVA (${(TVA*100).toFixed(2)}%)`,v:`+ ${fmtN(totalTVA,devise)}`,c:'#dc2626'},
            {l:'TOTAL TTC',v:fmtN(totalTTC,devise),c:'#1d4ed8',big:true},
          ].map(t=>(
            <div key={t.l} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:t.big?'none':'1px solid #e5e7eb'}}>
              <span style={{fontSize:t.big?14:12,fontWeight:t.big?700:400,color:'#6b7280'}}>{t.l}</span>
              <span style={{fontSize:t.big?22:14,fontWeight:t.big?900:700,color:t.c}}>{t.v}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator/>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end',flexWrap:'wrap'}}>
        <Btn label="Annuler" onClick={onClose} outline color="#6b7280"/>
        <Btn label="💾 Sauvegarder brouillon" onClick={()=>handleSave('brouillon')} outline color="#374151" disabled={saving}/>
        {isDevis&&<Btn label="📤 Créer et envoyer" onClick={()=>handleSave('envoye')} color="#7c3aed" disabled={saving}/>}
        {!isDevis&&<Btn label="📤 Émettre la facture" onClick={()=>handleSave('envoye')} color="#059669" disabled={saving}/>}
      </div>
    </Modal>
  );
};

// ============================================================
// DETAIL DEVIS
// ============================================================
const DevisDetail = ({devis,onClose,onEdit,onConvertToFacture,onStatusChange}) => {
  const {totalHT,totalTVA,totalTTC} = calcTotaux(devis.lignes);
  return (
    <Modal title={devis.numero} subtitle="Devis commercial" color="#7c3aed" onClose={onClose} wide>
      <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <Badge status={devis.status}/> <DevBadge d={devis.devise}/>
        {devis.status==='envoye'&&<><Btn label="✅ Marquer accepté" onClick={()=>{onStatusChange(devis.id,'accepte');onClose();}} color="#16a34a" small/><Btn label="❌ Marquer refusé" onClick={()=>{onStatusChange(devis.id,'refuse');onClose();}} color="#dc2626" small/></>}
        {devis.status==='accepte'&&!devis.factureId&&<Btn label="🧾 Convertir en facture" onClick={()=>{onConvertToFacture(devis);onClose();}} color="#059669"/>}
        <Btn label="✏️ Modifier" onClick={()=>{onEdit(devis);onClose();}} outline color="#374151" small/>
        <Btn label="🖨 Imprimer" onClick={()=>window.print()} outline color="#374151" small/>
        <Btn label="📤 Envoyer par email" onClick={()=>alert('Email envoyé !')} outline color="#1d4ed8" small/>
      </div>

      <InfoGrid items={[
        {l:'Client',v:devis.client?.nom},
        {l:'Projet',v:devis.projet},
        {l:'Date du devis',v:fmtD(devis.dateCreation)},
        {l:'Date de validité',v:fmtD(devis.dateValidite)},
        {l:'Conditions',v:devis.conditions},
        {l:'Mode de paiement',v:devis.modePaiement},
      ]}/>

      <div style={{padding:14,background:'#f8fafc',borderRadius:12,marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,color:'#9ca3af',marginBottom:3,textTransform:'uppercase',letterSpacing:.5}}>Objet</div>
        <div style={{fontSize:14,fontWeight:500,color:'#111827'}}>{devis.objet}</div>
      </div>

      <Section title="Détail des prestations">
        <LignesTable lignes={devis.lignes} setLignes={()=>{}} devise={devis.devise} readOnly/>
      </Section>

      {devis.notes&&<div style={{padding:14,background:'#fefce8',borderRadius:12,border:'1px solid #fde68a',marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,color:'#92400e',marginBottom:4}}>Notes</div>
        <div style={{fontSize:13,color:'#78350f'}}>{devis.notes}</div>
      </div>}

      <Section title="Historique">
        <Timeline items={devis.historique||[]}/>
      </Section>
    </Modal>
  );
};

// ============================================================
// DETAIL FACTURE
// ============================================================
const FactureDetail = ({facture,onClose,onEdit,onPaiement,onStatusChange}) => {
  const {totalHT,totalTVA,totalTTC} = calcTotaux(facture.lignes);
  const {encaisse,reste,pct} = getStatutPaiement(facture);
  const [showPaiement,setShowPaiement] = useState(false);

  return (
    <>
      <Modal title={facture.numero} subtitle="Facture client" color="#059669" onClose={onClose} wide>
        <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap'}}>
          <Badge status={facture.status}/> <DevBadge d={facture.devise}/>
          {['envoye','partiel'].includes(facture.status)&&<Btn label="💳 Enregistrer paiement" onClick={()=>setShowPaiement(true)} color="#16a34a"/>}
          <Btn label="✏️ Modifier" onClick={()=>{onEdit(facture);onClose();}} outline color="#374151" small/>
          <Btn label="🖨 Imprimer" onClick={()=>window.print()} outline color="#374151" small/>
          <Btn label="📤 Email" onClick={()=>alert('Email envoyé !')} outline color="#1d4ed8" small/>
          <Btn label="📥 PDF" onClick={()=>alert('PDF généré !')} outline color="#7c3aed" small/>
          {facture.status==='paye'&&<Btn label="📋 Générer avoir" onClick={()=>alert('Avoir généré !')} outline color="#0891b2" small/>}
        </div>

        {/* Barre de paiement */}
        <div style={{background:'#f8fafc',borderRadius:14,padding:16,marginBottom:20}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
            <span style={{fontSize:13,fontWeight:600,color:'#374151'}}>Avancement du paiement</span>
            <span style={{fontSize:14,fontWeight:800,color:'#059669'}}>{pct}% encaissé</span>
          </div>
          <div style={{background:'#e5e7eb',borderRadius:8,height:12,overflow:'hidden',marginBottom:10}}>
            <div style={{width:`${pct}%`,height:'100%',background:pct>=100?'#16a34a':pct>0?'#d97706':'#e5e7eb',borderRadius:8,transition:'width .5s'}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
            {[
              {l:'Total TTC',v:fmtN(totalTTC,facture.devise),c:'#374151'},
              {l:'Encaissé',v:fmtN(encaisse,facture.devise),c:'#16a34a'},
              {l:'Reste à payer',v:fmtN(reste,facture.devise),c:reste>0?'#dc2626':'#16a34a'},
            ].map(i=>(
              <div key={i.l} style={{textAlign:'center',background:'white',borderRadius:10,padding:'10px 12px'}}>
                <div style={{fontSize:10,color:'#9ca3af',textTransform:'uppercase',letterSpacing:.5,marginBottom:3}}>{i.l}</div>
                <div style={{fontSize:16,fontWeight:900,color:i.c}}>{i.v}</div>
              </div>
            ))}
          </div>
        </div>

        <InfoGrid items={[
          {l:'Client',v:facture.client?.nom},
          {l:'Projet',v:facture.projet},
          {l:'Date d\'émission',v:fmtD(facture.dateEmission)},
          {l:'Date d\'échéance',v:fmtD(facture.dateEcheance)},
          {l:'Conditions',v:facture.conditions},
          {l:'Mode de paiement',v:facture.modePaiement},
        ]}/>

        <div style={{padding:14,background:'#f8fafc',borderRadius:12,marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:'#9ca3af',marginBottom:3,textTransform:'uppercase',letterSpacing:.5}}>Objet</div>
          <div style={{fontSize:14,fontWeight:500,color:'#111827'}}>{facture.objet}</div>
        </div>

        <Section title="Détail des prestations">
          <LignesTable lignes={facture.lignes} setLignes={()=>{}} devise={facture.devise} readOnly/>
        </Section>

        {/* Acomptes & Paiements */}
        {(facture.acomptes?.length>0||facture.paiements?.length>0)&&(
          <Section title="Paiements reçus">
            <div style={{background:'white',borderRadius:12,border:'1px solid #e5e7eb',overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#f8fafc'}}>{['Date','Type','Mode','Référence','Montant','Note'].map(h=><Th key={h} ch={h}/>)}</tr></thead>
                <tbody>
                  {[...(facture.acomptes||[]).map(a=>({...a,type:'Acompte'})),
                    ...(facture.paiements||[]).map(p=>({...p,type:'Paiement'}))
                  ].sort((a,b)=>new Date(a.date)-new Date(b.date)).map((p,i)=>(
                    <tr key={i} style={{borderBottom:'1px solid #f3f4f6'}}>
                      <Td ch={fmtD(p.date)}/>
                      <Td ch={<span style={{padding:'2px 8px',borderRadius:6,background:p.type==='Acompte'?'#fff7ed':'#f0fdf4',color:p.type==='Acompte'?'#d97706':'#16a34a',fontSize:11,fontWeight:700}}>{p.type}</span>}/>
                      <Td ch={p.mode} style={{fontSize:12}}/>
                      <Td ch={<span style={{fontFamily:'monospace',fontSize:12}}>{p.ref||'—'}</span>}/>
                      <Td ch={<span style={{fontWeight:800,color:'#16a34a'}}>{fmtN(p.montant,facture.devise)}</span>} style={{textAlign:'right'}}/>
                      <Td ch={p.note||'—'} style={{fontSize:12,color:'#6b7280'}}/>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {facture.notes&&<div style={{padding:14,background:'#fefce8',borderRadius:12,border:'1px solid #fde68a',marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:'#92400e',marginBottom:4}}>Notes</div>
          <div style={{fontSize:13,color:'#78350f'}}>{facture.notes}</div>
        </div>}

        <Section title="Historique">
          <Timeline items={facture.historique||[]}/>
        </Section>
      </Modal>

      {showPaiement&&<PaiementModal doc={facture} onClose={()=>setShowPaiement(false)} onSave={(p)=>onPaiement(facture.id,p)}/>}
    </>
  );
};

// ============================================================
// VUE DEVIS (liste)
// ============================================================
const VueDevis = ({devis,setDevis,factures,setFactures}) => {
  const [search,setSearch]   = useState('');
  const [filterS,setFilterS] = useState('tous');
  const [selected,setSelected] = useState(null);
  const [editing,setEditing]   = useState(null);
  const [creating,setCreating] = useState(false);

  const filtered = devis.filter(d=>{
    const ms = !search||d.client?.nom.toLowerCase().includes(search.toLowerCase())||d.numero.toLowerCase().includes(search.toLowerCase())||d.objet.toLowerCase().includes(search.toLowerCase());
    const mf = filterS==='tous'||d.status===filterS;
    return ms&&mf;
  });

  const handleSave = (d) => {
    setDevis(p=>p.find(x=>x.id===d.id)?p.map(x=>x.id===d.id?d:x):[d,...p]);
  };

  const handleStatusChange = (id,status) => {
    setDevis(p=>p.map(d=>d.id===id?{...d,status,historique:[...(d.historique||[]),{date:today(),action:`Statut changé → ${status}`,user:'Jérôme Bell'}]}:d));
  };

  const handleConvertToFacture = (dev) => {
    const fac = {
      id: Date.now(),
      numero: genNum('FAC'),
      devisId: dev.id,
      client: dev.client,
      projet: dev.projet,
      objet: dev.objet,
      devise: dev.devise,
      conditions: dev.conditions,
      modePaiement: dev.modePaiement,
      notes: dev.notes,
      lignes: dev.lignes,
      status: 'brouillon',
      dateEmission: today(),
      dateEcheance: addDays(30),
      acomptes: [],
      paiements: [],
      historique: [{date:today(),action:`Créée depuis ${dev.numero}`,user:'Jérôme Bell'}],
    };
    setFactures(p=>[fac,...p]);
    setDevis(p=>p.map(d=>d.id===dev.id?{...d,factureId:fac.id,historique:[...(d.historique||[]),{date:today(),action:`Converti en facture ${fac.numero}`,user:'Jérôme Bell'}]}:d));
    alert(`✅ Facture ${fac.numero} créée depuis ${dev.numero}`);
  };

  const stats = {
    total: devis.length,
    montantTotal: devis.reduce((s,d)=>s+calcTotaux(d.lignes).totalTTC,0),
    acceptes: devis.filter(d=>d.status==='accepte').length,
    enAttente: devis.filter(d=>d.status==='envoye').length,
    tauxTransfo: devis.length>0?Math.round(devis.filter(d=>d.status==='accepte').length/devis.length*100):0,
  };

  return (
    <div>
      {/* KPIs */}
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        {[
          {l:'Total devis',v:stats.total,c:'#374151',icon:'📋'},
          {l:'Montant total',v:fmtN(stats.montantTotal,'FCFA'),c:'#1d4ed8',icon:'💰'},
          {l:'Acceptés',v:stats.acceptes,c:'#16a34a',icon:'✅'},
          {l:'En attente réponse',v:stats.enAttente,c:'#d97706',icon:'⏳'},
          {l:'Taux de transformation',v:`${stats.tauxTransfo}%`,c:'#7c3aed',icon:'📈'},
        ].map(k=>(
          <div key={k.l} style={{flex:1,minWidth:150,background:'white',borderRadius:12,padding:'14px 16px',borderLeft:`3px solid ${k.c}`,boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
            <div style={{fontSize:11,color:'#9ca3af',marginBottom:4}}>{k.icon} {k.l}</div>
            <div style={{fontSize:18,fontWeight:900,color:k.c}}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{flex:1,minWidth:220,display:'flex',alignItems:'center',gap:8,background:'white',borderRadius:11,padding:'9px 13px',border:'1px solid #e5e7eb'}}>
          <span style={{color:'#9ca3af'}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Client, numéro, objet..." style={{flex:1,border:'none',outline:'none',fontSize:13}}/>
        </div>
        <div style={{display:'flex',gap:4,background:'white',borderRadius:11,padding:3,border:'1px solid #e5e7eb'}}>
          {['tous','brouillon','envoye','accepte','refuse','expire'].map(s=>(
            <button key={s} onClick={()=>setFilterS(s)} style={{padding:'6px 12px',borderRadius:9,border:'none',background:filterS===s?'#7c3aed':'transparent',color:filterS===s?'white':'#6b7280',fontWeight:700,fontSize:11,cursor:'pointer',whiteSpace:'nowrap'}}>
              {s==='tous'?'Tous':s==='brouillon'?'Brouillon':s==='envoye'?'Envoyés':s==='accepte'?'Acceptés':s==='refuse'?'Refusés':'Expirés'}
            </button>
          ))}
        </div>
        <Btn label="+ Nouveau devis" onClick={()=>setCreating(true)} color="#7c3aed" icon="📋"/>
      </div>

      {/* Table */}
      <div style={{background:'white',borderRadius:16,border:'1px solid #e5e7eb',overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:900}}>
            <thead><tr>{['Numéro','Client','Objet / Projet','Montant TTC','Devise','Créé le','Validité','Statut','Actions'].map(h=><Th key={h} ch={h}/>)}</tr></thead>
            <tbody>
              {filtered.map((d,i)=>{
                const {totalTTC}=calcTotaux(d.lignes);
                const expired = new Date(d.dateValidite)<new Date()&&!['accepte','refuse'].includes(d.status);
                return (
                  <tr key={d.id} style={{borderBottom:'1px solid #f3f4f6',background:i%2===0?'white':'#fafbfc',cursor:'pointer'}}
                    onMouseEnter={e=>e.currentTarget.style.background='#f5f3ff'}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===0?'white':'#fafbfc'}>
                    <Td ch={<span style={{fontWeight:800,color:'#7c3aed',fontFamily:'monospace'}} onClick={()=>setSelected(d)}>{d.numero}</span>}/>
                    <Td ch={<span style={{fontWeight:600}} onClick={()=>setSelected(d)}>{d.client?.nom}</span>}/>
                    <Td ch={<div onClick={()=>setSelected(d)}><div style={{fontWeight:500,fontSize:13}}>{d.objet}</div><div style={{fontSize:11,color:'#9ca3af',marginTop:1}}>{d.projet}</div></div>}/>
                    <Td ch={<span style={{fontWeight:800}}>{fmtN(totalTTC)}</span>} style={{textAlign:'right'}}/>
                    <Td ch={<DevBadge d={d.devise}/>}/>
                    <Td ch={fmtD(d.dateCreation)} style={{fontSize:12}}/>
                    <Td ch={<span style={{color:expired?'#dc2626':'#374151',fontWeight:expired?700:400,fontSize:12}}>{fmtD(d.dateValidite)}{expired&&' ⚠️'}</span>}/>
                    <Td ch={<Badge status={d.status}/>}/>
                    <Td ch={
                      <div style={{display:'flex',gap:4}}>
                        {[['👁','Voir',()=>setSelected(d)],['✏️','Modifier',()=>setEditing(d)],['📤','Envoyer',()=>handleStatusChange(d.id,'envoye')],['🧾','→ Facture',()=>handleConvertToFacture(d)]].map(([icon,title,fn])=>(
                          <button key={title} title={title} onClick={fn} style={{padding:'4px 8px',borderRadius:7,border:'1px solid #e5e7eb',background:'white',cursor:'pointer',fontSize:12,fontWeight:600,color:'#374151',whiteSpace:'nowrap'}}>{icon}</button>
                        ))}
                      </div>
                    }/>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length===0&&<div style={{padding:40,textAlign:'center',color:'#9ca3af'}}><div style={{fontSize:36,marginBottom:8}}>📋</div><div>Aucun devis trouvé</div></div>}
        </div>
      </div>

      {selected&&<DevisDetail devis={selected} onClose={()=>setSelected(null)} onEdit={d=>{setEditing(d);}} onConvertToFacture={handleConvertToFacture} onStatusChange={handleStatusChange}/>}
      {editing&&<DocEditor type="devis" doc={editing} onSave={handleSave} onClose={()=>setEditing(null)}/>}
      {creating&&<DocEditor type="devis" onSave={handleSave} onClose={()=>setCreating(false)}/>}
    </div>
  );
};

// ============================================================
// VUE FACTURES (liste)
// ============================================================
const VueFactures = ({factures,setFactures}) => {
  const [search,setSearch]   = useState('');
  const [filterS,setFilterS] = useState('tous');
  const [selected,setSelected] = useState(null);
  const [editing,setEditing]   = useState(null);
  const [creating,setCreating] = useState(false);

  const filtered = factures.filter(f=>{
    const ms = !search||f.client?.nom.toLowerCase().includes(search.toLowerCase())||f.numero.toLowerCase().includes(search.toLowerCase());
    const mf = filterS==='tous'||f.status===filterS;
    return ms&&mf;
  });

  const handleSave = (f) => {
    setFactures(p=>p.find(x=>x.id===f.id)?p.map(x=>x.id===f.id?f:x):[f,...p]);
  };

  const handlePaiement = (id, paiement) => {
    setFactures(p=>p.map(f=>{
      if (f.id!==id) return f;
      const newPaiements = [...(f.paiements||[]), paiement];
      const {totalTTC} = calcTotaux(f.lignes);
      const totalAcomptes = (f.acomptes||[]).reduce((s,a)=>s+a.montant,0);
      const totalPaiements = newPaiements.reduce((s,p)=>s+p.montant,0);
      const encaisse = totalAcomptes + totalPaiements;
      const newStatus = encaisse >= totalTTC ? 'paye' : encaisse > 0 ? 'partiel' : f.status;
      return {
        ...f,
        paiements: newPaiements,
        status: newStatus,
        historique: [...(f.historique||[]),{date:today(),action:`Paiement reçu: ${fmtN(paiement.montant,f.devise)}`,user:'Jérôme Bell'}],
      };
    }));
  };

  const totaux = {
    ca: filtered.reduce((s,f)=>s+calcTotaux(f.lignes).totalTTC,0),
    encaisse: filtered.reduce((s,f)=>s+getStatutPaiement(f).encaisse,0),
    reste: filtered.reduce((s,f)=>s+getStatutPaiement(f).reste,0),
    retard: filtered.filter(f=>f.status==='en_retard').length,
  };

  return (
    <div>
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        {[
          {l:'Chiffre d\'affaires',v:fmtN(totaux.ca,'FCFA'),c:'#1d4ed8',icon:'📈'},
          {l:'Encaissé',v:fmtN(totaux.encaisse,'FCFA'),c:'#16a34a',icon:'✅'},
          {l:'À encaisser',v:fmtN(totaux.reste,'FCFA'),c:'#d97706',icon:'⏳'},
          {l:'En retard',v:totaux.retard,c:'#dc2626',icon:'🚨'},
        ].map(k=>(
          <div key={k.l} style={{flex:1,minWidth:180,background:'white',borderRadius:12,padding:'14px 16px',borderLeft:`3px solid ${k.c}`,boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
            <div style={{fontSize:11,color:'#9ca3af',marginBottom:4}}>{k.icon} {k.l}</div>
            <div style={{fontSize:17,fontWeight:900,color:k.c}}>{k.v}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{flex:1,minWidth:220,display:'flex',alignItems:'center',gap:8,background:'white',borderRadius:11,padding:'9px 13px',border:'1px solid #e5e7eb'}}>
          <span style={{color:'#9ca3af'}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Client, numéro..." style={{flex:1,border:'none',outline:'none',fontSize:13}}/>
        </div>
        <div style={{display:'flex',gap:4,background:'white',borderRadius:11,padding:3,border:'1px solid #e5e7eb'}}>
          {['tous','brouillon','envoye','partiel','paye','en_retard','annule'].map(s=>(
            <button key={s} onClick={()=>setFilterS(s)} style={{padding:'6px 11px',borderRadius:9,border:'none',background:filterS===s?'#059669':'transparent',color:filterS===s?'white':'#6b7280',fontWeight:700,fontSize:11,cursor:'pointer',whiteSpace:'nowrap'}}>
              {s==='tous'?'Toutes':s==='brouillon'?'Brouillon':s==='envoye'?'Émises':s==='partiel'?'Partiel':s==='paye'?'Payées':s==='en_retard'?'En retard':'Annulées'}
            </button>
          ))}
        </div>
        <Btn label="+ Nouvelle facture" onClick={()=>setCreating(true)} color="#059669" icon="🧾"/>
        <Btn label="📥 Exporter" onClick={()=>alert('Export Excel/PDF...')} outline color="#374151" small/>
      </div>

      <div style={{background:'white',borderRadius:16,border:'1px solid #e5e7eb',overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:1000}}>
            <thead><tr>{['Numéro','Client','Objet','HT','TVA','TTC','Devise','Émission','Échéance','Encaissé','Statut','Actions'].map(h=><Th key={h} ch={h}/>)}</tr></thead>
            <tbody>
              {filtered.map((f,i)=>{
                const {totalHT,totalTVA,totalTTC}=calcTotaux(f.lignes);
                const {encaisse,pct}=getStatutPaiement(f);
                const overdue = new Date(f.dateEcheance)<new Date()&&f.status!=='paye';
                return (
                  <tr key={f.id} style={{borderBottom:'1px solid #f3f4f6',background:i%2===0?'white':'#fafbfc',cursor:'pointer'}}
                    onMouseEnter={e=>e.currentTarget.style.background='#f0fdf4'}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===0?'white':'#fafbfc'}>
                    <Td ch={<span style={{fontWeight:800,color:'#059669',fontFamily:'monospace'}} onClick={()=>setSelected(f)}>{f.numero}</span>}/>
                    <Td ch={<span style={{fontWeight:600}} onClick={()=>setSelected(f)}>{f.client?.nom}</span>}/>
                    <Td ch={<span style={{fontSize:12,color:'#6b7280'}} onClick={()=>setSelected(f)}>{f.objet?.substring(0,35)}{f.objet?.length>35?'…':''}</span>}/>
                    <Td ch={fmtN(totalHT)} style={{textAlign:'right',fontSize:12}}/>
                    <Td ch={<span style={{color:'#dc2626',fontSize:12}}>{fmtN(totalTVA)}</span>} style={{textAlign:'right'}}/>
                    <Td ch={<span style={{fontWeight:800}}>{fmtN(totalTTC)}</span>} style={{textAlign:'right'}}/>
                    <Td ch={<DevBadge d={f.devise}/>}/>
                    <Td ch={fmtD(f.dateEmission)} style={{fontSize:12}}/>
                    <Td ch={<span style={{color:overdue?'#dc2626':'#374151',fontWeight:overdue?700:400,fontSize:12}}>{fmtD(f.dateEcheance)}{overdue&&' ⚠️'}</span>}/>
                    <Td ch={
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <div style={{width:50,height:6,background:'#e5e7eb',borderRadius:3,overflow:'hidden'}}>
                          <div style={{width:`${pct}%`,height:'100%',background:pct>=100?'#16a34a':'#d97706',borderRadius:3}}/>
                        </div>
                        <span style={{fontSize:11,fontWeight:700,color:pct>=100?'#16a34a':'#d97706'}}>{pct}%</span>
                      </div>
                    }/>
                    <Td ch={<Badge status={f.status}/>}/>
                    <Td ch={
                      <div style={{display:'flex',gap:4}}>
                        {[['👁','Voir',()=>setSelected(f)],['✏️','Modifier',()=>setEditing(f)],['💳','Paiement',()=>{setSelected(f);}],['🖨','Imprimer',()=>window.print()]].map(([icon,title,fn])=>(
                          <button key={title} title={title} onClick={fn} style={{padding:'4px 7px',borderRadius:7,border:'1px solid #e5e7eb',background:'white',cursor:'pointer',fontSize:12}}>{icon}</button>
                        ))}
                      </div>
                    }/>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length===0&&<div style={{padding:40,textAlign:'center',color:'#9ca3af'}}><div style={{fontSize:36,marginBottom:8}}>🧾</div><div>Aucune facture trouvée</div></div>}
        </div>
      </div>

      {selected&&<FactureDetail facture={selected} onClose={()=>setSelected(null)} onEdit={f=>setEditing(f)} onPaiement={handlePaiement} onStatusChange={()=>{}}/>}
      {editing&&<DocEditor type="facture" doc={editing} onSave={handleSave} onClose={()=>setEditing(null)}/>}
      {creating&&<DocEditor type="facture" onSave={handleSave} onClose={()=>setCreating(false)}/>}
    </div>
  );
};

// ============================================================
// COMPOSANT RACINE
// ============================================================
const TABS = [
  {id:'dashboard', label:'Tableau de bord', icon:'📊'},
  {id:'devis',     label:'Devis',           icon:'📋'},
  {id:'factures',  label:'Factures',        icon:'🧾'},
  {id:'depenses',  label:'Dépenses',        icon:'💸'},
  {id:'tva',       label:'TVA',             icon:'🏛'},
  {id:'tresorerie',label:'Trésorerie',      icon:'💰'},
  {id:'comptable', label:'Plan comptable',  icon:'📚'},
  {id:'rapports',  label:'Rapports',        icon:'📈'},
];

const Dashboard = ({devis,factures,onNavigate}) => {
  const totalCA      = factures.reduce((s,f)=>s+calcTotaux(f.lignes).totalTTC,0);
  const totalEncaisse= factures.reduce((s,f)=>s+getStatutPaiement(f).encaisse,0);
  const totalReste   = factures.reduce((s,f)=>s+getStatutPaiement(f).reste,0);
  const totalDevis   = devis.reduce((s,d)=>s+calcTotaux(d.lignes).totalTTC,0);
  const CASHFLOW     = [{m:'Oct',e:18500000,s:12000000},{m:'Nov',e:22000000,s:14500000},{m:'Dec',e:28000000,s:16000000},{m:'Jan',e:25000000,s:18000000},{m:'Fev',e:31000000,s:19500000},{m:'Mar',e:35000000,s:21000000}];
  const maxCF        = Math.max(...CASHFLOW.map(c=>Math.max(c.e,c.s)));

  return (
    <div>
      <div style={{display:'flex',gap:14,marginBottom:24,flexWrap:'wrap'}}>
        {[
          {l:'Chiffre d\'affaires',v:fmtN(totalCA,'FCFA'),c:'#1d4ed8',icon:'📈',trend:'+12%',onClick:()=>onNavigate('factures')},
          {l:'Encaissé',v:fmtN(totalEncaisse,'FCFA'),c:'#16a34a',icon:'✅',trend:'+8%',onClick:()=>onNavigate('factures')},
          {l:'À encaisser',v:fmtN(totalReste,'FCFA'),c:'#d97706',icon:'⏳',trend:'-3%',onClick:()=>onNavigate('factures')},
          {l:'Devis en cours',v:fmtN(totalDevis,'FCFA'),c:'#7c3aed',icon:'📋',trend:'+5%',onClick:()=>onNavigate('devis')},
          {l:'Bénéfice estimé',v:fmtN(totalEncaisse*0.35,'FCFA'),c:'#059669',icon:'💎',trend:'+15%'},
        ].map(k=>(
          <div key={k.l} onClick={k.onClick} style={{flex:1,minWidth:150,background:'white',borderRadius:14,padding:'16px 18px',borderLeft:`4px solid ${k.c}`,boxShadow:'0 2px 10px rgba(0,0,0,.05)',cursor:k.onClick?'pointer':'default',transition:'all .2s'}}
            onMouseEnter={e=>k.onClick&&(e.currentTarget.style.transform='translateY(-2px)')}
            onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:`${k.c}12`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{k.icon}</div>
              <span style={{fontSize:11,fontWeight:700,padding:'2px 7px',borderRadius:6,background:k.trend?.startsWith('+')?'#dcfce7':'#fef2f2',color:k.trend?.startsWith('+')?'#16a34a':'#dc2626'}}>{k.trend}</span>
            </div>
            <div style={{fontSize:17,fontWeight:900,color:k.c,letterSpacing:-.3,marginBottom:3}}>{k.v}</div>
            <div style={{fontSize:12,fontWeight:600,color:'#374151'}}>{k.l}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1.6fr 1fr',gap:18,marginBottom:20}}>
        <div style={{background:'white',borderRadius:16,padding:22,border:'1px solid #e5e7eb',boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <h3 style={{margin:0,fontSize:14,fontWeight:800,color:'#111827'}}>Flux de trésorerie</h3>
            <div style={{display:'flex',gap:10,fontSize:11,color:'#6b7280'}}>
              <span><span style={{display:'inline-block',width:10,height:10,borderRadius:2,background:'#1d4ed8',marginRight:4,verticalAlign:'middle'}}/>Entrées</span>
              <span><span style={{display:'inline-block',width:10,height:10,borderRadius:2,background:'#ef4444',marginRight:4,verticalAlign:'middle'}}/>Sorties</span>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'flex-end',gap:8,height:130}}>
            {CASHFLOW.map((c,i)=>(
              <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                <div style={{width:'100%',display:'flex',gap:2,alignItems:'flex-end',height:100}}>
                  <div style={{flex:1,height:`${(c.e/maxCF)*100}px`,background:'#1d4ed8',borderRadius:'3px 3px 0 0'}}/>
                  <div style={{flex:1,height:`${(c.s/maxCF)*100}px`,background:'#ef4444',borderRadius:'3px 3px 0 0',opacity:.75}}/>
                </div>
                <span style={{fontSize:9,color:'#9ca3af',fontWeight:600}}>{c.m}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:'white',borderRadius:16,padding:22,border:'1px solid #e5e7eb',boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
          <h3 style={{margin:'0 0 14px',fontSize:14,fontWeight:800,color:'#111827'}}>TVA — {(TVA*100).toFixed(2)}%</h3>
          {[{l:'Collectée',v:12819500,c:'#dc2626'},{l:'Déductible',v:4250000,c:'#16a34a'},{l:'À verser DGI',v:8569500,c:'#d97706',big:true}].map(t=>(
            <div key={t.l} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:t.big?'none':'1px solid #f3f4f6'}}>
              <span style={{fontSize:t.big?13:12,fontWeight:t.big?700:400,color:'#6b7280'}}>{t.l}</span>
              <span style={{fontSize:t.big?16:13,fontWeight:t.big?900:700,color:t.c}}>{fmtN(t.v,'FCFA')}</span>
            </div>
          ))}
          <div style={{marginTop:12,padding:10,background:'#fff7ed',borderRadius:9,border:'1px solid #fed7aa'}}>
            <div style={{fontSize:10,fontWeight:700,color:'#d97706'}}>⚠️ Prochaine déclaration TVA</div>
            <div style={{fontSize:13,fontWeight:700,color:'#92400e',marginTop:2}}>31 Mars 2024</div>
          </div>
          <button onClick={()=>onNavigate('tva')} style={{marginTop:12,width:'100%',padding:10,borderRadius:10,border:'none',background:'#1d4ed8',color:'white',fontWeight:700,cursor:'pointer',fontSize:13}}>
            Générer déclaration TVA →
          </button>
        </div>
      </div>

      {/* Factures récentes */}
      <div style={{background:'white',borderRadius:16,border:'1px solid #e5e7eb',overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid #e5e7eb',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3 style={{margin:0,fontSize:14,fontWeight:800,color:'#111827'}}>Factures récentes</h3>
          <button onClick={()=>onNavigate('factures')} style={{fontSize:12,fontWeight:700,color:'#1d4ed8',background:'none',border:'none',cursor:'pointer'}}>Voir toutes →</button>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:700}}>
            <thead><tr style={{background:'#f8fafc'}}>{['Numéro','Client','Montant TTC','Encaissé','Devise','Échéance','Statut'].map(h=><Th key={h} ch={h}/>)}</tr></thead>
            <tbody>
              {factures.slice(0,5).map((f,i)=>{
                const {totalTTC}=calcTotaux(f.lignes);
                const {encaisse,pct}=getStatutPaiement(f);
                return (
                  <tr key={f.id} style={{borderBottom:'1px solid #f3f4f6',background:i%2===0?'white':'#fafbfc'}}>
                    <Td ch={<span style={{fontWeight:800,color:'#059669',fontFamily:'monospace'}}>{f.numero}</span>}/>
                    <Td ch={<span style={{fontWeight:500}}>{f.client?.nom}</span>}/>
                    <Td ch={<span style={{fontWeight:800}}>{fmtN(totalTTC)}</span>} style={{textAlign:'right'}}/>
                    <Td ch={
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <div style={{width:50,height:5,background:'#e5e7eb',borderRadius:3,overflow:'hidden'}}><div style={{width:`${pct}%`,height:'100%',background:pct>=100?'#16a34a':'#d97706',borderRadius:3}}/></div>
                        <span style={{fontSize:11,fontWeight:700,color:pct>=100?'#16a34a':'#d97706'}}>{pct}%</span>
                      </div>
                    }/>
                    <Td ch={<DevBadge d={f.devise}/>}/>
                    <Td ch={fmtD(f.dateEcheance)} style={{fontSize:12}}/>
                    <Td ch={<Badge status={f.status}/>}/>
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

export default function Finance() {
  const [tab,setTab]         = useState('dashboard');
  const [devis,setDevis]     = useState(SEED_DEVIS);
  const [factures,setFactures] = useState(SEED_FACTURES);

  return (
    <div style={{minHeight:'100vh',background:'#f0f4ff',fontFamily:"'Segoe UI',Arial,sans-serif"}}>
      <div style={{background:'linear-gradient(135deg,#0f172a,#1e3a5f)',borderBottom:'1px solid rgba(255,255,255,.05)'}}>
        <div style={{maxWidth:1400,margin:'0 auto',padding:'20px 28px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div>
              <h1 style={{fontSize:22,fontWeight:900,color:'white',margin:'0 0 4px',letterSpacing:-.3}}>💼 Finance & Comptabilité</h1>
              <p style={{color:'#64748b',margin:0,fontSize:12}}>OHADA · TVA {(TVA*100).toFixed(2)}% · FCFA / USD / EUR / CNY · CleanIT ERP</p>
            </div>
            <div style={{display:'flex',gap:8}}>
              {['📊 Bilan','📋 P&L','🏛 DGI-TVA'].map(b=>(
                <button key={b} style={{padding:'8px 14px',borderRadius:9,border:'1px solid rgba(255,255,255,.15)',background:'rgba(255,255,255,.06)',color:'white',fontWeight:600,fontSize:12,cursor:'pointer'}}>{b}</button>
              ))}
            </div>
          </div>
          <div style={{display:'flex',gap:2,overflowX:'auto',paddingBottom:1}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'9px 16px',borderRadius:'9px 9px 0 0',border:'none',background:tab===t.id?'#f0f4ff':'transparent',color:tab===t.id?'#1d4ed8':'rgba(255,255,255,.5)',fontWeight:tab===t.id?800:500,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap',transition:'all .15s',flexShrink:0}}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1400,margin:'0 auto',padding:'24px 28px'}}>
        {tab==='dashboard' && <Dashboard devis={devis} factures={factures} onNavigate={setTab}/>}
        {tab==='devis'     && <VueDevis devis={devis} setDevis={setDevis} factures={factures} setFactures={setFactures}/>}
        {tab==='factures'  && <VueFactures factures={factures} setFactures={setFactures}/>}
        {['depenses','tva','tresorerie','comptable','rapports'].includes(tab) && (
          <div style={{padding:40,textAlign:'center',marginTop:40}}>
            <div style={{fontSize:56,marginBottom:14}}>{TABS.find(t=>t.id===tab)?.icon}</div>
            <h2 style={{fontSize:22,fontWeight:800,color:'#111827',marginBottom:8}}>{TABS.find(t=>t.id===tab)?.label}</h2>
            <p style={{color:'#6b7280',marginBottom:20}}>Ce module sera développé dans la prochaine session</p>
          </div>
        )}
      </div>
    </div>
  );
}
