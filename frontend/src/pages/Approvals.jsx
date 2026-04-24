import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const fmtN = n => new Intl.NumberFormat('fr-FR').format(Math.round(n||0));
const fmtD = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fmtDT = d => d ? new Date(d).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'}) : '—';
const getUser = () => { try { return JSON.parse(localStorage.getItem('user')||sessionStorage.getItem('user')||'{}'); } catch { return {}; } };

// ===== CONSTANTES =====
const WORKFLOW = [
  { key:'draft',        label:'Brouillon',       color:'#6b7280', bg:'#f3f4f6', step:0 },
  { key:'submitted',    label:'Soumis',           color:'#1d4ed8', bg:'#eff6ff', step:1 },
  { key:'review_1',     label:'Finance 1',        color:'#7c3aed', bg:'#f5f3ff', step:2 },
  { key:'review_2',     label:'Finance 2',        color:'#9333ea', bg:'#fdf4ff', step:3 },
  { key:'pending_boss', label:'Direction',        color:'#c2410c', bg:'#fff7ed', step:4 },
  { key:'approved',     label:'Approuvé',         color:'#16a34a', bg:'#f0fdf4', step:5 },
  { key:'paid',         label:'Payé',             color:'#059669', bg:'#ecfdf5', step:6 },
  { key:'rejected',     label:'Rejeté',           color:'#dc2626', bg:'#fef2f2', step:-1 },
];

const TYPES_DEMANDES = [
  { id:'payment_request', label:'Demande de paiement',   color:'#1d4ed8', desc:'Paiement fournisseur ou prestataire' },
  { id:'purchase_request', label:'Demande d\'achat',     color:'#d97706', desc:'Achat matériel ou équipement' },
  { id:'expense_report',  label:'Note de frais',          color:'#dc2626', desc:'Remboursement frais professionnels' },
  { id:'leave_request',   label:'Demande de congé',       color:'#059669', desc:'Congé annuel ou exceptionnel' },
  { id:'advance_request', label:'Demande d\'avance',     color:'#7c3aed', desc:'Avance sur salaire' },
  { id:'mission_request', label:'Ordre de mission',       color:'#0891b2', desc:'Déplacement professionnel' },
  { id:'training_request',label:'Demande de formation',   color:'#be185d', desc:'Formation ou certification' },
  { id:'equipment_request',label:'Demande matériel',      color:'#9333ea', desc:'Attribution équipement terrain' },
];

const MODES_PAIEMENT = ['Virement bancaire','Mobile Money MTN','Mobile Money Orange','Chèque','Espèces','Virement international'];
const BANQUES = ['BICEC','Société Générale Cameroun','Afriland First Bank','UBA Cameroun','Ecobank','BGFI Bank'];

const SEED_ITEMS = [
  { id:'1', reference:'APV-2024-001', type:'payment_request', title:'Paiement sous-traitant Thomas Ngono — DLA-001 Phase 2', amount:18000000, currency:'FCFA', status:'review_2', priority:'haute', submittedBy:'Marie Kamga', submittedAt:'2024-02-01T09:00:00', beneficiaryName:'Thomas Ngono', beneficiaryBank:'BICEC', beneficiaryAccount:'CM21 1001 2345 6789', justification:'Paiement phase 2 projet DLA-001 (40%). Travaux validés par le chef de projet.', site:'DLA-001', project:'PROJ-2024-001', history:[{action:'Soumis',by:'Marie Kamga',at:'2024-02-01T09:00:00',comment:''},{action:'Approuvé Finance 1',by:'Alice Finance',at:'2024-02-02T14:00:00',comment:'Budget disponible'}] },
  { id:'2', reference:'APV-2024-002', type:'purchase_request', title:'Achat câbles fibre optique — Site YDE-001', amount:3500000, currency:'FCFA', status:'pending_boss', priority:'normale', submittedBy:'Pierre Etoga', submittedAt:'2024-02-05T11:00:00', beneficiaryName:'Fournisseur Tech Africa', beneficiaryBank:'SGC', beneficiaryAccount:'CM21 2001 9876 5432', justification:'Câbles requis pour finalisation réseau fibre YDE-001. Devis approuvé.', site:'YDE-001', project:'PROJ-2024-002', history:[{action:'Soumis',by:'Pierre Etoga',at:'2024-02-05T11:00:00',comment:''},{action:'Approuvé Finance 1',by:'Alice Finance',at:'2024-02-06T09:00:00',comment:''},{action:'Approuvé Finance 2',by:'Bob Finance',at:'2024-02-07T10:00:00',comment:'Conforme budget'}] },
  { id:'3', reference:'APV-2024-003', type:'expense_report', title:'Note de frais mission Garoua — Ali Moussa', amount:285000, currency:'FCFA', status:'approved', priority:'basse', submittedBy:'Ali Moussa', submittedAt:'2024-01-28T08:00:00', beneficiaryName:'Ali Moussa', beneficiaryBank:'Afriland', beneficiaryAccount:'CM21 3001 1111 2222', justification:'Per diem 3 jours + transport Douala-Garoua aller-retour. Justificatifs joints.', site:'GAR-001', project:'', history:[{action:'Soumis',by:'Ali Moussa',at:'2024-01-28T08:00:00',comment:''},{action:'Approuvé Finance 1',by:'Alice Finance',at:'2024-01-29T09:00:00',comment:''},{action:'Approuvé Finance 2',by:'Bob Finance',at:'2024-01-30T10:00:00',comment:''},{action:'Approuvé DG',by:'Jérôme Bell',at:'2024-01-31T08:00:00',comment:'OK'}] },
  { id:'4', reference:'APV-2024-004', type:'leave_request', title:'Congé annuel — Samuel Djomo — 15 jours', amount:0, currency:'FCFA', status:'submitted', priority:'normale', submittedBy:'Samuel Djomo', submittedAt:'2024-02-10T10:00:00', beneficiaryName:'Samuel Djomo', beneficiaryBank:'', beneficiaryAccount:'', justification:'Congé annuel du 01/03/2024 au 15/03/2024. Remplacement assuré par Jean Mbarga.', site:'', project:'', history:[{action:'Soumis',by:'Samuel Djomo',at:'2024-02-10T10:00:00',comment:''}] },
  { id:'5', reference:'APV-2024-005', type:'advance_request', title:'Avance sur salaire — Jean Mbarga — Février 2024', amount:150000, currency:'FCFA', status:'draft', priority:'haute', submittedBy:'Jean Mbarga', submittedAt:'2024-02-12T09:00:00', beneficiaryName:'Jean Mbarga', beneficiaryBank:'BICEC', beneficiaryAccount:'CM21 1001 8888 7777', justification:'Avance 50% salaire pour urgence médicale familiale.', site:'', project:'', history:[] },
  { id:'6', reference:'APV-2024-006', type:'mission_request', title:'Ordre de mission — Kribi Port — Thomas Ngono', amount:420000, currency:'FCFA', status:'paid', priority:'haute', submittedBy:'Marie Kamga', submittedAt:'2024-01-15T08:00:00', beneficiaryName:'Thomas Ngono', beneficiaryBank:'MTN Money', beneficiaryAccount:'677000001', justification:'Mission technique KRI-001. Transport + hébergement 5 jours.', site:'KRI-001', project:'PROJ-2024-001', history:[{action:'Soumis',by:'Marie Kamga',at:'2024-01-15T08:00:00',comment:''},{action:'Approuvé Finance 1',by:'Alice Finance',at:'2024-01-16T09:00:00',comment:''},{action:'Approuvé Finance 2',by:'Bob Finance',at:'2024-01-17T10:00:00',comment:''},{action:'Approuvé DG',by:'Jérôme Bell',at:'2024-01-18T08:00:00',comment:''},{action:'Payé',by:'Alice Finance',at:'2024-01-19T09:00:00',comment:'Virement effectué'}] },
];

const getWF = key => WORKFLOW.find(w => w.key===key) || WORKFLOW[0];
const getType = id => TYPES_DEMANDES.find(t => t.id===id);

// ===== ICÔNES VECTORIELLES SVG =====
const Icon = ({ name, size=20, color='currentColor', strokeWidth=1.8 }) => {
  const paths = {
    plus: 'M12 4v16m-8-8h16',
    check: 'M5 13l4 4L19 7',
    x: 'M6 6l12 12M6 18L18 6',
    eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12m-3 0a3 3 0 106 0 3 3 0 00-6 0',
    edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    download: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
    send: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    dollar: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
    building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    filter: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
    chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    mail: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    chevron_right: 'M9 5l7 7-7 7',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    folder: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    briefcase: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    credit_card: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    map_pin: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
    thumbs_up: 'M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5',
    thumbs_down: 'M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]?.split(' M ').map((d,i) => <path key={i} d={i===0?d:`M ${d}`}/>)}
    </svg>
  );
};

// ===== BADGE STATUT =====
const StatusBadge = ({ status }) => {
  const wf = getWF(status);
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20, background:wf.bg, color:wf.color, fontSize:11, fontWeight:700, whiteSpace:'nowrap' }}>
      <span style={{ width:6, height:6, borderRadius:3, background:wf.color, display:'inline-block' }}/>
      {wf.label}
    </span>
  );
};

// ===== BADGE TYPE =====
const TypeBadge = ({ type }) => {
  const t = getType(type);
  if (!t) return null;
  return (
    <span style={{ padding:'3px 9px', borderRadius:8, background:`${t.color}12`, color:t.color, fontSize:11, fontWeight:700 }}>
      {t.label}
    </span>
  );
};

// ===== BADGE PRIORITÉ =====
const PriorityBadge = ({ priority }) => {
  const cfg = { haute:{c:'#dc2626',bg:'#fef2f2',l:'Haute'}, normale:{c:'#d97706',bg:'#fff7ed',l:'Normale'}, basse:{c:'#16a34a',bg:'#f0fdf4',l:'Basse'} }[priority] || {c:'#6b7280',bg:'#f3f4f6',l:priority};
  return <span style={{ padding:'3px 8px', borderRadius:6, background:cfg.bg, color:cfg.c, fontSize:10, fontWeight:700 }}>{cfg.l}</span>;
};

// ===== BARRE DE PROGRESSION WORKFLOW =====
const WorkflowBar = ({ status }) => {
  const steps = WORKFLOW.filter(w => w.step >= 0);
  const currentStep = getWF(status).step;
  const isRejected = status === 'rejected';
  return (
    <div style={{ padding:'16px 0' }}>
      <div style={{ display:'flex', alignItems:'center', position:'relative' }}>
        {steps.map((s, i) => {
          const done = currentStep > s.step;
          const active = currentStep === s.step && !isRejected;
          return (
            <div key={s.key} style={{ display:'flex', alignItems:'center', flex:i<steps.length-1?1:'none' }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, zIndex:1 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:done?'#16a34a':active?s.color:'#e5e7eb', display:'flex', alignItems:'center', justifyContent:'center', border:`2px solid ${done?'#16a34a':active?s.color:'#e5e7eb'}`, boxShadow:active?`0 0 0 4px ${s.color}20`:'none', transition:'all .3s' }}>
                  {done ? <Icon name="check" size={14} color="white" strokeWidth={2.5}/> : <span style={{ fontSize:11, fontWeight:800, color:done||active?'white':'#9ca3af' }}>{i+1}</span>}
                </div>
                <span style={{ fontSize:9, fontWeight:active||done?700:400, color:active?s.color:done?'#16a34a':'#9ca3af', whiteSpace:'nowrap', textAlign:'center' }}>{s.label}</span>
              </div>
              {i<steps.length-1&&<div style={{ flex:1, height:2, background:done?'#16a34a':'#e5e7eb', margin:'0 4px', marginBottom:22, transition:'background .3s' }}/>}
            </div>
          );
        })}
      </div>
      {isRejected&&<div style={{ marginTop:8, padding:'8px 12px', background:'#fef2f2', borderRadius:8, border:'1px solid #fecaca', display:'flex', alignItems:'center', gap:6 }}><Icon name="x" size={14} color="#dc2626"/><span style={{ fontSize:12, fontWeight:700, color:'#dc2626' }}>Demande rejetée</span></div>}
    </div>
  );
};

// ===== FORMULAIRE NOUVELLE DEMANDE =====
const NouvelleDemandeModal = ({ onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [type, setType] = useState('');
  const [form, setForm] = useState({
    title:'', amount:'', currency:'FCFA', priority:'normale',
    justification:'', site:'', project:'',
    beneficiaryName:'', beneficiaryBank:'', beneficiaryAccount:'',
    beneficiaryMobile:'', beneficiaryEmail:'',
    dateDebut:'', dateFin:'', nbJours:'',
    destination:'', transportMode:'',
  });
  const [saving, setSaving] = useState(false);

  const upd = (k,v) => setForm(p=>({...p,[k]:v}));
  const selectedType = getType(type);
  const needsAmount = ['payment_request','purchase_request','expense_report','advance_request','mission_request'].includes(type);
  const needsBeneficiary = ['payment_request','purchase_request','advance_request','mission_request'].includes(type);
  const needsDates = ['leave_request','mission_request','training_request'].includes(type);

  const handleSave = async (submit=false) => {
    if (!type||!form.title) { alert('Type et titre obligatoires'); return; }
    setSaving(true);
    const item = {
      id: Date.now().toString(),
      reference: `APV-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900+100))}`,
      type, ...form,
      amount: Number(form.amount)||0,
      status: submit?'submitted':'draft',
      submittedBy: 'Utilisateur connecté',
      submittedAt: new Date().toISOString(),
      history: submit?[{action:'Soumis',by:'Utilisateur connecté',at:new Date().toISOString(),comment:''}]:[],
    };
    try { await api.post('/approvals', item); } catch {}
    onSave(item);
    setSaving(false);
    onClose();
  };

  const F = ({label, children, required}) => (
    <div>
      <label style={{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:0.5, display:'block', marginBottom:6 }}>{label}{required&&<span style={{color:'#dc2626'}}> *</span>}</label>
      {children}
    </div>
  );

  const Input = ({type:t='text',value,onChange,placeholder,min}) => (
    <input type={t} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} min={min}
      style={{ width:'100%', padding:'10px 13px', borderRadius:10, border:'1.5px solid #e5e7eb', fontSize:13, color:'#111827', background:'#f9fafb', boxSizing:'border-box', outline:'none', transition:'border-color .15s' }}
      onFocus={e=>e.target.style.borderColor='#1d4ed8'} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
  );

  const Select = ({value,onChange,options,placeholder}) => (
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{ width:'100%', padding:'10px 13px', borderRadius:10, border:'1.5px solid #e5e7eb', fontSize:13, color:'#111827', background:'#f9fafb', cursor:'pointer' }}>
      <option value="">{placeholder||'Sélectionner...'}</option>
      {options.map(o => <option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
    </select>
  );

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'white', borderRadius:22, width:'100%', maxWidth:680, maxHeight:'93vh', overflow:'auto', boxShadow:'0 32px 80px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div style={{ background:`linear-gradient(135deg,#0f172a,${selectedType?.color||'#1d4ed8'})`, padding:'22px 28px', borderRadius:'22px 22px 0 0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:1, marginBottom:3 }}>Nouvelle demande</div>
              <div style={{ fontSize:20, fontWeight:900, color:'white' }}>
                {step===1?'Choisir le type':step===2?'Détails de la demande':'Bénéficiaire & Récapitulatif'}
              </div>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <div style={{ display:'flex', gap:4 }}>
                {[1,2,3].map(s=>(
                  <div key={s} style={{ width:26, height:26, borderRadius:'50%', background:step>=s?'white':'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:step>=s?selectedType?.color||'#1d4ed8':'white' }}>{s}</div>
                ))}
              </div>
              <button onClick={onClose} style={{ width:32, height:32, borderRadius:9, background:'rgba(255,255,255,0.15)', border:'none', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon name="x" size={16} color="white"/>
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding:28 }}>
          {/* STEP 1 — Choisir type */}
          {step===1&&(
            <div>
              <p style={{ fontSize:13, color:'#6b7280', marginBottom:18 }}>Sélectionnez le type de demande que vous souhaitez soumettre :</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }}>
                {TYPES_DEMANDES.map(t=>(
                  <div key={t.id} onClick={()=>setType(t.id)}
                    style={{ padding:16, borderRadius:14, border:`2px solid ${type===t.id?t.color:'#e5e7eb'}`, background:type===t.id?`${t.color}08`:'white', cursor:'pointer', transition:'all .15s' }}
                    onMouseEnter={e=>{ if(type!==t.id) e.currentTarget.style.borderColor=t.color; }}
                    onMouseLeave={e=>{ if(type!==t.id) e.currentTarget.style.borderColor='#e5e7eb'; }}>
                    <div style={{ width:40, height:40, borderRadius:12, background:`${t.color}15`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10, border:`1px solid ${t.color}25` }}>
                      <Icon name={t.id==='payment_request'?'dollar':t.id==='purchase_request'?'briefcase':t.id==='expense_report'?'credit_card':t.id==='leave_request'?'calendar':t.id==='advance_request'?'dollar':t.id==='mission_request'?'map_pin':t.id==='training_request'?'users':'folder'} size={20} color={t.color}/>
                    </div>
                    <div style={{ fontSize:13, fontWeight:800, color:type===t.id?t.color:'#111827', marginBottom:3 }}>{t.label}</div>
                    <div style={{ fontSize:11, color:'#9ca3af' }}>{t.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button onClick={()=>type&&setStep(2)} disabled={!type}
                  style={{ padding:'12px 28px', borderRadius:12, border:'none', background:type?selectedType?.color||'#1d4ed8':'#e5e7eb', color:'white', fontWeight:800, fontSize:14, cursor:type?'pointer':'not-allowed' }}>
                  Suivant →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 — Détails */}
          {step===2&&(
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                <F label="Titre de la demande" required>
                  <Input value={form.title} onChange={v=>upd('title',v)} placeholder="Ex: Paiement prestataire Phase 2"/>
                </F>
                <F label="Priorité">
                  <Select value={form.priority} onChange={v=>upd('priority',v)} options={[{v:'haute',l:'Haute'},{v:'normale',l:'Normale'},{v:'basse',l:'Basse'}]}/>
                </F>
                {needsAmount&&(
                  <>
                    <F label="Montant" required>
                      <Input type="number" value={form.amount} onChange={v=>upd('amount',v)} placeholder="0" min="0"/>
                    </F>
                    <F label="Devise">
                      <Select value={form.currency} onChange={v=>upd('currency',v)} options={['FCFA','USD','EUR','CNY']}/>
                    </F>
                  </>
                )}
                {needsDates&&(
                  <>
                    <F label="Date début">
                      <Input type="date" value={form.dateDebut} onChange={v=>upd('dateDebut',v)}/>
                    </F>
                    <F label="Date fin">
                      <Input type="date" value={form.dateFin} onChange={v=>upd('dateFin',v)}/>
                    </F>
                  </>
                )}
                {type==='mission_request'&&(
                  <>
                    <F label="Destination">
                      <Input value={form.destination} onChange={v=>upd('destination',v)} placeholder="Ex: Garoua — Site GAR-001"/>
                    </F>
                    <F label="Mode de transport">
                      <Select value={form.transportMode} onChange={v=>upd('transportMode',v)} options={['Véhicule société','Avion','Bus','Taxi','Véhicule personnel']}/>
                    </F>
                  </>
                )}
                {['payment_request','purchase_request','mission_request','equipment_request'].includes(type)&&(
                  <>
                    <F label="Site concerné">
                      <Select value={form.site} onChange={v=>upd('site',v)} options={['DLA-001','DLA-003','YDE-001','KRI-001','GAR-001','LIM-001','Bureau principal']} placeholder="Aucun"/>
                    </F>
                    <F label="Projet lié">
                      <Input value={form.project} onChange={v=>upd('project',v)} placeholder="Ex: PROJ-2024-001"/>
                    </F>
                  </>
                )}
              </div>
              <F label="Justification" required>
                <textarea value={form.justification} onChange={e=>upd('justification',e.target.value)} rows={4}
                  placeholder="Expliquez la raison et le contexte de cette demande..."
                  style={{ width:'100%', padding:'10px 13px', borderRadius:10, border:'1.5px solid #e5e7eb', fontSize:13, resize:'vertical', boxSizing:'border-box', fontFamily:'inherit', outline:'none' }}
                  onFocus={e=>e.target.style.borderColor='#1d4ed8'} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
              </F>
              <div style={{ display:'flex', gap:10, justifyContent:'space-between', marginTop:20 }}>
                <button onClick={()=>setStep(1)} style={{ padding:'11px 22px', borderRadius:12, border:'1.5px solid #e5e7eb', background:'white', color:'#6b7280', fontWeight:700, fontSize:14, cursor:'pointer' }}>← Retour</button>
                <button onClick={()=>setStep(needsBeneficiary?3:3)} style={{ padding:'11px 24px', borderRadius:12, border:'none', background:selectedType?.color||'#1d4ed8', color:'white', fontWeight:800, fontSize:14, cursor:'pointer' }}>Suivant →</button>
              </div>
            </div>
          )}

          {/* STEP 3 — Bénéficiaire + Récap */}
          {step===3&&(
            <div>
              {needsBeneficiary&&(
                <div style={{ background:'#f8fafc', borderRadius:14, padding:18, marginBottom:20 }}>
                  <h4 style={{ margin:'0 0 14px', fontSize:13, fontWeight:800, color:'#111827', display:'flex', alignItems:'center', gap:8 }}>
                    <Icon name="users" size={16} color="#1d4ed8"/> Informations du bénéficiaire
                  </h4>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <F label="Nom complet" required>
                      <Input value={form.beneficiaryName} onChange={v=>upd('beneficiaryName',v)} placeholder="Prénom Nom"/>
                    </F>
                    <F label="Email">
                      <Input type="email" value={form.beneficiaryEmail} onChange={v=>upd('beneficiaryEmail',v)} placeholder="email@exemple.com"/>
                    </F>
                    <F label="Banque">
                      <Select value={form.beneficiaryBank} onChange={v=>upd('beneficiaryBank',v)} options={BANQUES} placeholder="Sélectionner banque"/>
                    </F>
                    <F label="Numéro de compte / IBAN">
                      <Input value={form.beneficiaryAccount} onChange={v=>upd('beneficiaryAccount',v)} placeholder="CM21 XXXX XXXX XXXX"/>
                    </F>
                    <F label="Mobile Money">
                      <Input value={form.beneficiaryMobile} onChange={v=>upd('beneficiaryMobile',v)} placeholder="6XX XXX XXX"/>
                    </F>
                  </div>
                </div>
              )}

              {/* Récapitulatif */}
              <div style={{ background:'#f0fdf4', borderRadius:14, padding:18, border:'1px solid #bbf7d0', marginBottom:20 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#16a34a', marginBottom:12, display:'flex', alignItems:'center', gap:6 }}>
                  <Icon name="check" size={14} color="#16a34a" strokeWidth={2.5}/> Récapitulatif de la demande
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {[
                    {l:'Type',v:selectedType?.label},{l:'Titre',v:form.title},
                    {l:'Priorité',v:form.priority},{l:'Montant',v:needsAmount?`${fmtN(Number(form.amount)||0)} ${form.currency}`:'N/A'},
                    {l:'Bénéficiaire',v:form.beneficiaryName||'—'},
                    ...(form.site?[{l:'Site',v:form.site}]:[]),
                    ...(form.project?[{l:'Projet',v:form.project}]:[]),
                  ].map(item=>(
                    <div key={item.l} style={{ background:'white', borderRadius:9, padding:'8px 12px' }}>
                      <div style={{ fontSize:9, color:'#9ca3af', textTransform:'uppercase', letterSpacing:0.4, marginBottom:2 }}>{item.l}</div>
                      <div style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{item.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background:'#fff7ed', borderRadius:12, padding:'12px 16px', border:'1px solid #fed7aa', marginBottom:20, display:'flex', gap:10, alignItems:'flex-start' }}>
                <Icon name="mail" size={16} color="#d97706"/>
                <div style={{ fontSize:12, color:'#92400e' }}>
                  <strong>Workflow automatique :</strong> Un email sera envoyé à Finance 1, puis Finance 2, puis la Direction Générale pour approbation successive.
                </div>
              </div>

              <div style={{ display:'flex', gap:10, justifyContent:'space-between' }}>
                <button onClick={()=>setStep(2)} style={{ padding:'11px 22px', borderRadius:12, border:'1.5px solid #e5e7eb', background:'white', color:'#6b7280', fontWeight:700, fontSize:14, cursor:'pointer' }}>← Retour</button>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>handleSave(false)} disabled={saving} style={{ padding:'11px 20px', borderRadius:12, border:'none', background:'#6b7280', color:'white', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                    <span style={{ display:'flex', alignItems:'center', gap:6 }}><Icon name="folder" size={14} color="white"/> Brouillon</span>
                  </button>
                  <button onClick={()=>handleSave(true)} disabled={saving} style={{ padding:'11px 22px', borderRadius:12, border:'none', background:selectedType?.color||'#1d4ed8', color:'white', fontWeight:800, fontSize:14, cursor:'pointer' }}>
                    <span style={{ display:'flex', alignItems:'center', gap:6 }}><Icon name="send" size={14} color="white"/> {saving?'Soumission...':'Soumettre'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== MODAL DÉTAIL DEMANDE =====
const DetailModal = ({ item, onClose, onUpdate }) => {
  const [comment, setComment] = useState('');
  const [acting, setActing] = useState(false);

  const wf = getWF(item.status);
  const t = getType(item.type);

  const doAction = async (action) => {
    setActing(true);
    const statusMap = { approve_f1:'review_2', approve_f2:'pending_boss', approve_dg:'approved', reject:'rejected', submit:'submitted', pay:'paid' };
    const labelMap = { approve_f1:'Approuvé Finance 1', approve_f2:'Approuvé Finance 2', approve_dg:'Approuvé Direction', reject:'Rejeté', submit:'Soumis', pay:'Payé' };
    const updated = {
      ...item,
      status: statusMap[action],
      history: [...(item.history||[]), { action:labelMap[action], by:'Utilisateur connecté', at:new Date().toISOString(), comment }],
    };
    try { await api.patch(`/approvals/${item.id}`, updated); } catch {}
    onUpdate(updated);
    setComment('');
    setActing(false);
  };

  const ActionBtn = ({ action, label, color, icon }) => (
    <button onClick={()=>doAction(action)} disabled={acting}
      style={{ padding:'10px 16px', borderRadius:11, border:'none', background:color, color:'white', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6, flex:1, justifyContent:'center' }}>
      <Icon name={icon} size={14} color="white" strokeWidth={2.5}/> {label}
    </button>
  );

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'white', borderRadius:22, width:'100%', maxWidth:820, maxHeight:'93vh', overflow:'auto', boxShadow:'0 32px 80px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div style={{ background:`linear-gradient(135deg,#0f172a,${t?.color||wf.color})`, padding:'22px 28px', borderRadius:'22px 22px 0 0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
            <div>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
                <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:1 }}>{item.reference}</span>
                <TypeBadge type={item.type}/>
                <PriorityBadge priority={item.priority}/>
              </div>
              <div style={{ fontSize:20, fontWeight:900, color:'white', marginBottom:4 }}>{item.title}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)' }}>
                Soumis par <strong style={{color:'white'}}>{item.submittedBy}</strong> · {fmtDT(item.submittedAt)}
              </div>
            </div>
            <button onClick={onClose} style={{ width:32, height:32, borderRadius:9, background:'rgba(255,255,255,0.15)', border:'none', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon name="x" size={16} color="white"/>
            </button>
          </div>
          <WorkflowBar status={item.status}/>
        </div>

        <div style={{ padding:28 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1.1fr 1fr', gap:20 }}>

            {/* Colonne gauche */}
            <div>
              {/* Montant */}
              {item.amount>0&&(
                <div style={{ background:'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderRadius:14, padding:'18px 20px', border:'1px solid #bbf7d0', marginBottom:16, display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon name="dollar" size={24} color="white"/>
                  </div>
                  <div>
                    <div style={{ fontSize:11, color:'#6b7280', textTransform:'uppercase', letterSpacing:0.5, marginBottom:3 }}>Montant demandé</div>
                    <div style={{ fontSize:24, fontWeight:900, color:'#16a34a' }}>{fmtN(item.amount)} {item.currency}</div>
                  </div>
                </div>
              )}

              {/* Infos */}
              <div style={{ background:'#f8fafc', borderRadius:14, padding:18, marginBottom:16 }}>
                <h4 style={{ margin:'0 0 12px', fontSize:12, fontWeight:800, color:'#6b7280', textTransform:'uppercase', letterSpacing:0.8 }}>Informations</h4>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  {[
                    {l:'Type',v:t?.label},{l:'Priorité',v:item.priority},
                    ...(item.site?[{l:'Site',v:item.site}]:[]),
                    ...(item.project?[{l:'Projet',v:item.project}]:[]),
                    ...(item.dateDebut?[{l:'Date début',v:fmtD(item.dateDebut)},{l:'Date fin',v:fmtD(item.dateFin)}]:[]),
                    ...(item.destination?[{l:'Destination',v:item.destination},{l:'Transport',v:item.transportMode||'—'}]:[]),
                  ].map(info=>(
                    <div key={info.l}>
                      <div style={{ fontSize:9, color:'#9ca3af', textTransform:'uppercase', letterSpacing:0.4, marginBottom:2 }}>{info.l}</div>
                      <div style={{ fontSize:12, fontWeight:600, color:'#374151' }}>{info.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Justification */}
              <div style={{ background:'#f8fafc', borderRadius:14, padding:18, marginBottom:16 }}>
                <h4 style={{ margin:'0 0 10px', fontSize:12, fontWeight:800, color:'#6b7280', textTransform:'uppercase', letterSpacing:0.8 }}>Justification</h4>
                <p style={{ fontSize:13, color:'#374151', lineHeight:1.6, margin:0 }}>{item.justification||'—'}</p>
              </div>

              {/* Bénéficiaire */}
              {item.beneficiaryName&&(
                <div style={{ background:'#f8fafc', borderRadius:14, padding:18 }}>
                  <h4 style={{ margin:'0 0 12px', fontSize:12, fontWeight:800, color:'#6b7280', textTransform:'uppercase', letterSpacing:0.8, display:'flex', alignItems:'center', gap:6 }}>
                    <Icon name="users" size={13} color="#6b7280"/> Bénéficiaire
                  </h4>
                  {[
                    {l:'Nom',v:item.beneficiaryName},{l:'Email',v:item.beneficiaryEmail||'—'},
                    {l:'Banque',v:item.beneficiaryBank||'—'},{l:'Compte',v:item.beneficiaryAccount||'—'},
                    {l:'Mobile Money',v:item.beneficiaryMobile||'—'},
                  ].filter(x=>x.v!=='—'||x.l==='Nom').map(info=>(
                    <div key={info.l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid #e5e7eb' }}>
                      <span style={{ fontSize:12, color:'#6b7280' }}>{info.l}</span>
                      <span style={{ fontSize:12, fontWeight:600, color:'#111827', fontFamily:info.l==='Compte'?'monospace':'inherit' }}>{info.v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Colonne droite — Historique + Actions */}
            <div>
              <div style={{ background:'#f8fafc', borderRadius:14, padding:18, marginBottom:16 }}>
                <h4 style={{ margin:'0 0 12px', fontSize:12, fontWeight:800, color:'#6b7280', textTransform:'uppercase', letterSpacing:0.8, display:'flex', alignItems:'center', gap:6 }}>
                  <Icon name="clock" size={13} color="#6b7280"/> Historique du workflow
                </h4>
                {(!item.history||item.history.length===0)&&(
                  <div style={{ padding:16, textAlign:'center', color:'#9ca3af', fontSize:13 }}>Aucune action enregistrée</div>
                )}
                {item.history?.map((h,i)=>(
                  <div key={i} style={{ display:'flex', gap:10, marginBottom:12 }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background:'#1d4ed815', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Icon name="check" size={12} color="#1d4ed8" strokeWidth={2.5}/>
                      </div>
                      {i<item.history.length-1&&<div style={{ width:1, flex:1, background:'#e5e7eb', margin:'3px 0' }}/>}
                    </div>
                    <div style={{ paddingBottom:12 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:'#111827' }}>{h.action}</div>
                      <div style={{ fontSize:11, color:'#6b7280' }}>par {h.by} · {fmtDT(h.at)}</div>
                      {h.comment&&<div style={{ fontSize:11, color:'#374151', fontStyle:'italic', marginTop:2 }}>"{h.comment}"</div>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ background:'white', borderRadius:14, padding:18, border:'1px solid #e5e7eb' }}>
                <h4 style={{ margin:'0 0 12px', fontSize:12, fontWeight:800, color:'#6b7280', textTransform:'uppercase', letterSpacing:0.8 }}>Actions</h4>
                <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={2}
                  placeholder="Commentaire (optionnel)..."
                  style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #e5e7eb', fontSize:13, resize:'none', boxSizing:'border-box', fontFamily:'inherit', marginBottom:12, outline:'none' }}
                  onFocus={e=>e.target.style.borderColor='#1d4ed8'} onBlur={e=>e.target.style.borderColor='#e5e7eb'}/>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {item.status==='draft'&&<ActionBtn action="submit" label="Soumettre" color="#1d4ed8" icon="send"/>}
                  {item.status==='submitted'&&<ActionBtn action="approve_f1" label="Approuver (F1)" color="#7c3aed" icon="thumbs_up"/>}
                  {item.status==='review_2'&&<ActionBtn action="approve_f2" label="Approuver (F2)" color="#9333ea" icon="thumbs_up"/>}
                  {item.status==='pending_boss'&&<ActionBtn action="approve_dg" label="Approuver (DG)" color="#c2410c" icon="thumbs_up"/>}
                  {item.status==='approved'&&<ActionBtn action="pay" label="Marquer payé" color="#059669" icon="credit_card"/>}
                  {['submitted','review_2','pending_boss'].includes(item.status)&&(
                    <button onClick={()=>doAction('reject')} disabled={acting}
                      style={{ padding:'10px 14px', borderRadius:11, border:'none', background:'#dc2626', color:'white', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                      <Icon name="thumbs_down" size={14} color="white"/> Rejeter
                    </button>
                  )}
                  {['approved','paid','rejected'].includes(item.status)&&(
                    <div style={{ fontSize:13, color:'#9ca3af', fontStyle:'italic', padding:'8px 0' }}>
                      {item.status==='approved'?'En attente de paiement...':item.status==='paid'?'✅ Demande clôturée':'❌ Demande rejetée'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== COMPOSANT PRINCIPAL =====
const TABS = [
  { id:'all', label:'Toutes les demandes', icon:'folder' },
  { id:'pending', label:'En attente', icon:'clock' },
  { id:'approved', label:'Approuvées', icon:'check' },
  { id:'stats', label:'Statistiques', icon:'chart' },
];

export default function Approvals() {
  const [items, setItems] = useState(SEED_ITEMS);
  const [tab, setTab] = useState('all');
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [filterType, setFilterType] = useState('tous');

  const updateItem = (updated) => {
    setItems(p => p.map(i => i.id===updated.id ? updated : i));
    setSelected(updated);
  };

  const addItem = (item) => setItems(p => [item,...p]);

  const pending = items.filter(i => ['submitted','review_2','pending_boss'].includes(i.status));
  const totalMontant = items.filter(i=>i.amount>0).reduce((s,i)=>s+i.amount,0);
  const totalApproved = items.filter(i=>['approved','paid'].includes(i.status)).reduce((s,i)=>s+i.amount,0);

  const filtered = items.filter(i => {
    const ms = !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.reference.toLowerCase().includes(search.toLowerCase()) || i.submittedBy.toLowerCase().includes(search.toLowerCase());
    const mf = filterStatus==='tous' || i.status===filterStatus;
    const mt = filterType==='tous' || i.type===filterType;
    const tabFilter = tab==='pending'?['submitted','review_2','pending_boss'].includes(i.status):tab==='approved'?['approved','paid'].includes(i.status):true;
    return ms && mf && mt && tabFilter;
  });

  return (
    <div style={{ minHeight:'100vh', background:'#f0f4ff', fontFamily:"'Segoe UI',Arial,sans-serif" }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0f172a,#1e3a5f)', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
        <div style={{ maxWidth:1400, margin:'0 auto', padding:'20px 28px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div>
              <h1 style={{ fontSize:22, fontWeight:900, color:'white', margin:'0 0 4px', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon name="thumbs_up" size={20} color="white"/>
                </div>
                Approvals — Demandes internes
              </h1>
              <p style={{ color:'#64748b', margin:0, fontSize:12 }}>Paiements · Achats · Congés · Missions · Notes de frais · Formations</p>
            </div>
            <button onClick={()=>setShowNew(true)}
              style={{ padding:'11px 22px', borderRadius:12, border:'none', background:'#1d4ed8', color:'white', fontWeight:800, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', gap:8, boxShadow:'0 4px 12px rgba(29,78,216,0.4)' }}>
              <Icon name="plus" size={16} color="white" strokeWidth={2.5}/> Nouvelle demande
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:2 }}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)}
                style={{ padding:'9px 16px', borderRadius:'9px 9px 0 0', border:'none', background:tab===t.id?'#f0f4ff':'transparent', color:tab===t.id?'#1d4ed8':'rgba(255,255,255,.5)', fontWeight:tab===t.id?800:500, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap', transition:'all .15s' }}>
                <Icon name={t.icon} size={14} color={tab===t.id?'#1d4ed8':'rgba(255,255,255,0.5)'}/> {t.label}
                {t.id==='pending'&&pending.length>0&&<span style={{ padding:'1px 6px', borderRadius:10, background:'#dc2626', color:'white', fontSize:10, fontWeight:800 }}>{pending.length}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1400, margin:'0 auto', padding:'24px 28px' }}>

        {/* KPIs */}
        <div style={{ display:'flex', gap:14, marginBottom:22, flexWrap:'wrap' }}>
          {[
            {l:'Total demandes',v:items.length,c:'#1d4ed8',icon:'folder'},
            {l:'En attente d\'approbation',v:pending.length,c:'#d97706',icon:'clock'},
            {l:'Approuvées',v:items.filter(i=>i.status==='approved'||i.status==='paid').length,c:'#16a34a',icon:'check'},
            {l:'Montant total soumis',v:`${fmtN(totalMontant)} FCFA`,c:'#7c3aed',icon:'dollar'},
            {l:'Montant approuvé',v:`${fmtN(totalApproved)} FCFA`,c:'#059669',icon:'thumbs_up'},
            {l:'Rejetées',v:items.filter(i=>i.status==='rejected').length,c:'#dc2626',icon:'x'},
          ].map(k=>(
            <div key={k.l} style={{ flex:1, minWidth:150, background:'white', borderRadius:14, padding:'14px 16px', borderLeft:`4px solid ${k.c}`, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <span style={{ fontSize:10, color:'#9ca3af', textTransform:'uppercase', letterSpacing:0.5 }}>{k.l}</span>
                <div style={{ width:30, height:30, borderRadius:9, background:`${k.c}12`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon name={k.icon} size={14} color={k.c}/>
                </div>
              </div>
              <div style={{ fontSize:typeof k.v==='string'?14:22, fontWeight:900, color:k.c }}>{k.v}</div>
            </div>
          ))}
        </div>

        {/* Filtres */}
        {tab!=='stats'&&(
          <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
            <div style={{ flex:1, minWidth:240, display:'flex', alignItems:'center', gap:8, background:'white', borderRadius:11, padding:'9px 13px', border:'1px solid #e5e7eb' }}>
              <Icon name="search" size={16} color="#9ca3af"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Référence, titre, soumis par..."
                style={{ flex:1, border:'none', outline:'none', fontSize:13, color:'#111827', background:'transparent' }}/>
            </div>
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
              style={{ padding:'9px 13px', borderRadius:11, border:'1px solid #e5e7eb', fontSize:13, color:'#374151', background:'white', cursor:'pointer' }}>
              <option value="tous">Tous statuts</option>
              {WORKFLOW.map(w=><option key={w.key} value={w.key}>{w.label}</option>)}
            </select>
            <select value={filterType} onChange={e=>setFilterType(e.target.value)}
              style={{ padding:'9px 13px', borderRadius:11, border:'1px solid #e5e7eb', fontSize:13, color:'#374151', background:'white', cursor:'pointer' }}>
              <option value="tous">Tous types</option>
              {TYPES_DEMANDES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <button style={{ padding:'9px 14px', borderRadius:11, border:'1px solid #e5e7eb', background:'white', color:'#374151', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
              <Icon name="download" size={14} color="#374151"/> Exporter
            </button>
          </div>
        )}

        {/* Liste demandes */}
        {tab!=='stats'&&(
          <div style={{ background:'white', borderRadius:16, border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:900 }}>
                <thead>
                  <tr style={{ background:'#f8fafc', borderBottom:'2px solid #e5e7eb' }}>
                    {['Référence','Titre','Type','Soumis par','Montant','Priorité','Date','Statut','Actions'].map(h=>(
                      <th key={h} style={{ padding:'12px 14px', textAlign:'left', fontSize:11, fontWeight:800, color:'#6b7280', textTransform:'uppercase', letterSpacing:0.5, whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item,i)=>(
                    <tr key={item.id} style={{ borderBottom:'1px solid #f3f4f6', background:i%2===0?'white':'#fafbfc', cursor:'pointer' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#eff6ff'}
                      onMouseLeave={e=>e.currentTarget.style.background=i%2===0?'white':'#fafbfc'}>
                      <td style={{ padding:'13px 14px', fontSize:12, fontWeight:700, color:'#1d4ed8', fontFamily:'monospace' }} onClick={()=>setSelected(item)}>{item.reference}</td>
                      <td style={{ padding:'13px 14px', maxWidth:220 }} onClick={()=>setSelected(item)}>
                        <div style={{ fontSize:13, fontWeight:600, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title}</div>
                        {item.site&&<div style={{ fontSize:10, color:'#9ca3af', marginTop:2, display:'flex', alignItems:'center', gap:3 }}><Icon name="map_pin" size={10} color="#9ca3af"/> {item.site}</div>}
                      </td>
                      <td style={{ padding:'13px 14px' }}><TypeBadge type={item.type}/></td>
                      <td style={{ padding:'13px 14px', fontSize:13, color:'#374151' }}>{item.submittedBy}</td>
                      <td style={{ padding:'13px 14px', fontSize:13, fontWeight:700, color:item.amount>0?'#374151':'#9ca3af' }}>{item.amount>0?`${fmtN(item.amount)} ${item.currency}`:'—'}</td>
                      <td style={{ padding:'13px 14px' }}><PriorityBadge priority={item.priority}/></td>
                      <td style={{ padding:'13px 14px', fontSize:11, color:'#6b7280' }}>{fmtD(item.submittedAt)}</td>
                      <td style={{ padding:'13px 14px' }}><StatusBadge status={item.status}/></td>
                      <td style={{ padding:'13px 14px' }}>
                        <div style={{ display:'flex', gap:5 }}>
                          <button onClick={()=>setSelected(item)}
                            style={{ width:30, height:30, borderRadius:8, border:'1px solid #e5e7eb', background:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
                            title="Voir détail">
                            <Icon name="eye" size={14} color="#6b7280"/>
                          </button>
                          {['submitted','review_2','pending_boss'].includes(item.status)&&(
                            <button onClick={()=>setSelected(item)}
                              style={{ width:30, height:30, borderRadius:8, border:'1px solid #bbf7d0', background:'#f0fdf4', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
                              title="Approuver">
                              <Icon name="thumbs_up" size={14} color="#16a34a"/>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length===0&&(
                <div style={{ padding:48, textAlign:'center', color:'#9ca3af' }}>
                  <div style={{ width:56, height:56, borderRadius:16, background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                    <Icon name="folder" size={28} color="#d1d5db"/>
                  </div>
                  <div style={{ fontSize:15, fontWeight:600, marginBottom:4 }}>Aucune demande trouvée</div>
                  <div style={{ fontSize:13 }}>Modifiez vos filtres ou créez une nouvelle demande</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STATS */}
        {tab==='stats'&&(
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
            <div style={{ background:'white', borderRadius:16, padding:24, border:'1px solid #e5e7eb', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ margin:'0 0 16px', fontSize:14, fontWeight:800, color:'#111827' }}>Répartition par statut</h3>
              {WORKFLOW.map(w=>{
                const count = items.filter(i=>i.status===w.key).length;
                const pct = items.length>0?Math.round(count/items.length*100):0;
                return (
                  <div key={w.key} style={{ marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:12, fontWeight:600, color:'#374151' }}>{w.label}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:w.color }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height:6, background:'#f3f4f6', borderRadius:3, overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', background:w.color, borderRadius:3, transition:'width .5s' }}/>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ background:'white', borderRadius:16, padding:24, border:'1px solid #e5e7eb', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ margin:'0 0 16px', fontSize:14, fontWeight:800, color:'#111827' }}>Répartition par type</h3>
              {TYPES_DEMANDES.map(t=>{
                const count = items.filter(i=>i.type===t.id).length;
                const montant = items.filter(i=>i.type===t.id).reduce((s,i)=>s+i.amount,0);
                const pct = items.length>0?Math.round(count/items.length*100):0;
                return (
                  <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <div style={{ width:32, height:32, borderRadius:9, background:`${t.color}12`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Icon name="folder" size={14} color={t.color}/>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                        <span style={{ fontSize:12, fontWeight:600, color:'#374151' }}>{t.label}</span>
                        <span style={{ fontSize:11, color:'#6b7280' }}>{count} · {fmtN(montant)} FCFA</span>
                      </div>
                      <div style={{ height:5, background:'#f3f4f6', borderRadius:3, overflow:'hidden' }}>
                        <div style={{ width:`${pct}%`, height:'100%', background:t.color, borderRadius:3 }}/>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selected&&<DetailModal item={selected} onClose={()=>setSelected(null)} onUpdate={updateItem}/>}
      {showNew&&<NouvelleDemandeModal onClose={()=>setShowNew(false)} onSave={addItem}/>}
    </div>
  );
}
