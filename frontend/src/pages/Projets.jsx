import { useState } from 'react';
import { api } from '../utils/api';
import { Avatar, StatusBadge, ApprovalCard, Field, FluentInput, FluentSelect, FluentTextarea, FluentBtn, STATUS_STYLES, APPROVERS } from '../components/ApprovalsDesign';

const fmtN = n => new Intl.NumberFormat('fr-FR').format(Math.round(n||0));
const fmtD = d => d ? new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const fmtDT = d => d ? new Date(d).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'}) : '—';

const CLIENTS = ['MTN Cameroun','Orange Cameroun','Huawei Technologies','Nexttel Cameroun','Gouvernement Cameroun','CAMTEL','Entreprise Privée'];
const TECHNICIENS = ['Thomas Ngono','Jean Mbarga','Samuel Djomo','Ali Moussa','Pierre Etoga'];
const CHEFS_PROJET = ['Marie Kamga','Pierre Etoga','Jérôme Bell'];
const SITES = ['DLA-001','DLA-003','YDE-001','KRI-001','GAR-001','LIM-001','BFN-001'];

const PLANS_PAIEMENT = [
  { id:'direct',  label:'Paiement direct',  desc:'100% à la signature',    phases:[{label:'Paiement unique',pct:100}] },
  { id:'2phases', label:'2 phases',          desc:'Acompte + solde',        phases:[{label:'Acompte',pct:50},{label:'Solde',pct:50}] },
  { id:'3phases', label:'3 phases',          desc:'30 / 40 / 30',          phases:[{label:'Phase 1',pct:30},{label:'Phase 2',pct:40},{label:'Phase 3',pct:30}] },
  { id:'4phases', label:'4 phases',          desc:'25% par phase',          phases:[{label:'Phase 1',pct:25},{label:'Phase 2',pct:25},{label:'Phase 3',pct:25},{label:'Phase 4',pct:25}] },
  { id:'custom',  label:'Personnalisé',       desc:'Définir les % librement', phases:[] },
];

const WORKFLOW_PROJETS = [
  { key:'brouillon', label:'Brouillon',   color:'#605e5c', bg:'#edebe9', dot:'#a19f9d', step:0 },
  { key:'soumis',    label:'Soumis',       color:'#0078d4', bg:'#deecf9', dot:'#0078d4', step:1 },
  { key:'finance1',  label:'Finance 1',    color:'#5c2d91', bg:'#f4f0fb', dot:'#5c2d91', step:2 },
  { key:'finance2',  label:'Finance 2',    color:'#8764b8', bg:'#f4f0fb', dot:'#8764b8', step:3 },
  { key:'dg',        label:'Direction',    color:'#ca5010', bg:'#fff4ce', dot:'#ca5010', step:4 },
  { key:'approuve',  label:'Approuvé',     color:'#107c10', bg:'#dff6dd', dot:'#107c10', step:5 },
  { key:'en_cours',  label:'En cours',     color:'#0078d4', bg:'#deecf9', dot:'#0078d4', step:5 },
  { key:'termine',   label:'Terminé',      color:'#107c10', bg:'#dff6dd', dot:'#107c10', step:6 },
  { key:'rejete',    label:'Rejeté',       color:'#d13438', bg:'#fde7e9', dot:'#d13438', step:-1 },
];

const getWF = key => WORKFLOW_PROJETS.find(w=>w.key===key) || WORKFLOW_PROJETS[0];

const STATUS_PHASE = {
  attente:  { label:'En attente', color:'#605e5c', bg:'#edebe9' },
  en_cours: { label:'En cours',   color:'#0078d4', bg:'#deecf9' },
  paye:     { label:'Payé',       color:'#107c10', bg:'#dff6dd' },
  retard:   { label:'En retard',  color:'#d13438', bg:'#fde7e9' },
};

const SEED_PROJETS = [
  { id:'1', reference:'PROJ-2024-001', titre:'Installation 5G NR Site Akwa Douala', client:'MTN Cameroun', technicien:'Thomas Ngono', chefProjet:'Marie Kamga', site:'DLA-001', montantTotal:45000000, devise:'FCFA', status:'finance2', planPaiement:'3phases', phases:[{id:1,label:'Phase 1 — Démarrage',pct:30,montant:13500000,status:'paye',datePaiement:'2024-01-20',reference:'PAY-001'},{id:2,label:'Phase 2 — Mi-parcours',pct:40,montant:18000000,status:'en_cours',datePaiement:null,reference:null},{id:3,label:'Phase 3 — Livraison',pct:30,montant:13500000,status:'attente',datePaiement:null,reference:null}], dateCreation:'2024-01-10', dateDebut:'2024-01-15', dateFin:'2024-03-30', progression:65, description:'Déploiement complet 5G NR sur le site Akwa.', historique:[{action:'Soumis',par:'Marie Kamga',date:'2024-01-10T09:00:00',commentaire:'Accord technicien confirmé'},{action:'Approuvé Finance 1',par:'Alice Finance',date:'2024-01-11T14:30:00',commentaire:'Budget validé'}] },
  { id:'2', reference:'PROJ-2024-002', titre:'Maintenance préventive réseau Orange Q1', client:'Orange Cameroun', technicien:'Jean Mbarga', chefProjet:'Pierre Etoga', site:'YDE-001', montantTotal:12000000, devise:'FCFA', status:'approuve', planPaiement:'direct', phases:[{id:1,label:'Paiement unique',pct:100,montant:12000000,status:'paye',datePaiement:'2024-02-01',reference:'PAY-002'}], dateCreation:'2024-01-25', dateDebut:'2024-02-01', dateFin:'2024-02-28', progression:100, description:'Maintenance préventive complète réseau Orange.', historique:[{action:'Soumis',par:'Pierre Etoga',date:'2024-01-25T10:00:00',commentaire:''},{action:'Approuvé Finance 1',par:'Alice Finance',date:'2024-01-26T09:00:00',commentaire:''},{action:'Approuvé Finance 2',par:'Bob Finance',date:'2024-01-27T11:00:00',commentaire:''},{action:'Approuvé DG',par:'Jérôme Bell',date:'2024-01-28T08:00:00',commentaire:'Validé'}] },
  { id:'3', reference:'PROJ-2024-003', titre:'Survey et préparation site Garoua Nord', client:'Huawei Technologies', technicien:'Ali Moussa', chefProjet:'Marie Kamga', site:'GAR-001', montantTotal:8500000, devise:'FCFA', status:'brouillon', planPaiement:'2phases', phases:[{id:1,label:'Acompte démarrage',pct:50,montant:4250000,status:'attente',datePaiement:null,reference:null},{id:2,label:'Solde livraison',pct:50,montant:4250000,status:'attente',datePaiement:null,reference:null}], dateCreation:'2024-02-15', dateDebut:null, dateFin:null, progression:0, description:'Survey complet du site GAR-001.', historique:[] },
  { id:'4', reference:'PROJ-2024-004', titre:'Déploiement 4G LTE Site Limbé', client:'MTN Cameroun', technicien:'Samuel Djomo', chefProjet:'Pierre Etoga', site:'LIM-001', montantTotal:18500000, devise:'FCFA', status:'soumis', planPaiement:'3phases', phases:[{id:1,label:'Phase 1',pct:30,montant:5550000,status:'attente',datePaiement:null,reference:null},{id:2,label:'Phase 2',pct:40,montant:7400000,status:'attente',datePaiement:null,reference:null},{id:3,label:'Phase 3',pct:30,montant:5550000,status:'attente',datePaiement:null,reference:null}], dateCreation:'2024-02-20', dateDebut:'2024-03-01', dateFin:'2024-05-30', progression:0, description:'Déploiement 4G LTE complet site Limbé.', historique:[{action:'Soumis',par:'Pierre Etoga',date:'2024-02-20T10:00:00',commentaire:''}] },
];

// ===== BADGE STATUT PROJET =====
const ProjetBadge = ({ status }) => {
  const wf = getWF(status);
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:12, background:wf.bg, color:wf.color, fontSize:12, fontWeight:600 }}>
      <span style={{ width:6, height:6, borderRadius:3, background:wf.dot, flexShrink:0 }}/>
      {wf.label}
    </span>
  );
};

// ===== TIMELINE WORKFLOW PROJET =====
const ProjetTimeline = ({ status }) => {
  const steps = [
    { key:'soumis',   label:'Soumis',    initials:'CP', color:'#0078d4' },
    { key:'finance1', label:'Finance 1', initials:'AF', color:'#5c2d91' },
    { key:'finance2', label:'Finance 2', initials:'BF', color:'#8764b8' },
    { key:'dg',       label:'Direction', initials:'DG', color:'#ca5010' },
    { key:'approuve', label:'Approuvé',  initials:'✓',  color:'#107c10' },
  ];
  const order = ['soumis','finance1','finance2','dg','approuve','en_cours','termine'];
  const currentIdx = order.indexOf(status);
  const isRejected = status === 'rejete';

  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:0, padding:'12px 0' }}>
      {steps.map((s,i) => {
        const stepIdx = i;
        const done = currentIdx > stepIdx && !isRejected;
        const active = currentIdx === stepIdx && !isRejected;
        return (
          <div key={s.key} style={{ display:'flex', alignItems:'flex-start', flex:i<steps.length-1?1:'none' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:done?'#107c10':active?s.color:'#edebe9', display:'flex', alignItems:'center', justifyContent:'center', color:done||active?'white':'#a19f9d', fontSize:done?16:11, fontWeight:700, border:active?`3px solid ${s.color}`:'3px solid transparent', boxShadow:active?`0 0 0 3px ${s.color}25`:'none', flexShrink:0 }}>
                {done ? '✓' : s.initials}
              </div>
              <div style={{ textAlign:'center', minWidth:60 }}>
                <div style={{ fontSize:10, fontWeight:done||active?700:400, color:done?'#107c10':active?s.color:'#a19f9d' }}>{s.label}</div>
              </div>
            </div>
            {i<steps.length-1&&<div style={{ flex:1, height:2.5, background:done?'#107c10':'#edebe9', margin:'17px 4px 0', borderRadius:2 }}/>}
          </div>
        );
      })}
    </div>
  );
};

// ===== CARD PROJET =====
const ProjetCard = ({ projet, onClick }) => {
  const wf = getWF(projet.status);
  const totalPaye = projet.phases.filter(p=>p.status==='paye').reduce((s,p)=>s+p.montant,0);
  const pctPaye = projet.montantTotal > 0 ? Math.round(totalPaye/projet.montantTotal*100) : 0;
  const avatarColors = ['#0078d4','#107c10','#5c2d91','#ca5010','#d13438'];
  const avatarColor = avatarColors[projet.chefProjet?.charCodeAt(0)%5]||'#0078d4';
  const techColor = avatarColors[projet.technicien?.charCodeAt(0)%5]||'#ca5010';

  return (
    <div onClick={onClick} style={{ background:'white', borderRadius:4, overflow:'hidden', border:'1px solid #e8eaed', cursor:'pointer', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', transition:'all .15s' }}
      onMouseEnter={e=>{ e.currentTarget.style.boxShadow='0 4px 16px rgba(0,120,212,0.15)'; e.currentTarget.style.borderColor='#0078d4'; }}
      onMouseLeave={e=>{ e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor='#e8eaed'; }}>

      {/* Bande couleur */}
      <div style={{ height:4, background:wf.dot }}/>

      <div style={{ padding:'16px 18px' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
          <div style={{ flex:1, marginRight:10 }}>
            <div style={{ fontSize:11, color:'#a19f9d', fontFamily:'monospace', marginBottom:4 }}>{projet.reference}</div>
            <div style={{ fontSize:14, fontWeight:600, color:'#1f2937', lineHeight:1.3, marginBottom:6 }}>{projet.titre}</div>
            <div style={{ fontSize:12, color:'#4b5563' }}>{projet.client}</div>
          </div>
          <ProjetBadge status={projet.status}/>
        </div>

        {/* Equipe */}
        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <Avatar name={projet.chefProjet} color={avatarColor} size={26}/>
            <span style={{ fontSize:11, color:'#4b5563' }}>{projet.chefProjet}</span>
          </div>
          <span style={{ color:'#e8eaed' }}>·</span>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <Avatar name={projet.technicien} color={techColor} size={26}/>
            <span style={{ fontSize:11, color:'#4b5563' }}>{projet.technicien}</span>
          </div>
        </div>

        {/* Montant + progression */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <span style={{ fontSize:15, fontWeight:700, color:'#0078d4' }}>{fmtN(projet.montantTotal)} {projet.devise}</span>
          <span style={{ fontSize:12, color:'#a19f9d' }}>{pctPaye}% payé</span>
        </div>

        {/* Barre progression paiement */}
        <div style={{ height:5, background:'#f3f4f8', borderRadius:3, overflow:'hidden', marginBottom:10 }}>
          <div style={{ height:'100%', width:`${projet.progression}%`, background:wf.dot, borderRadius:3, transition:'width .4s' }}/>
        </div>

        {/* Mini timeline approbateurs */}
        <div style={{ display:'flex', alignItems:'center', gap:3, marginBottom:10 }}>
          {['soumis','finance1','finance2','dg'].map((s,i) => {
            const order = ['soumis','finance1','finance2','dg','approuve','en_cours','termine'];
            const done = order.indexOf(projet.status) > i;
            const active = order.indexOf(projet.status) === i+1;
            const colors = ['#0078d4','#5c2d91','#8764b8','#ca5010'];
            const inits = ['CP','AF','BF','DG'];
            return (
              <div key={s} style={{ display:'flex', alignItems:'center' }}>
                <div style={{ width:22, height:22, borderRadius:'50%', background:done?'#107c10':active?colors[i]:'#edebe9', display:'flex', alignItems:'center', justifyContent:'center', color:done||active?'white':'#a19f9d', fontSize:8, fontWeight:700, border:active?`2px solid ${colors[i]}`:'2px solid transparent' }}>
                  {done?'✓':inits[i]}
                </div>
                {i<3&&<div style={{ width:12, height:1.5, background:done?'#107c10':'#edebe9' }}/>}
              </div>
            );
          })}
          <span style={{ fontSize:10, color:'#a19f9d', marginLeft:6 }}>{wf.label}</span>
        </div>

        {/* Footer */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:10, borderTop:'1px solid #f3f4f6' }}>
          <div style={{ display:'flex', gap:5 }}>
            {projet.site&&<span style={{ padding:'2px 7px', borderRadius:3, background:'#deecf9', color:'#0078d4', fontSize:10, fontWeight:600 }}>📡 {projet.site}</span>}
          </div>
          <span style={{ fontSize:11, color:'#a19f9d' }}>{fmtD(projet.dateCreation)}</span>
        </div>
      </div>
    </div>
  );
};

// ===== MODAL NOUVEAU PROJET =====
const NouveauProjetModal = ({ onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [titre, setTitre] = useState('');
  const [client, setClient] = useState('');
  const [technicien, setTechnicien] = useState('');
  const [chefProjet, setChefProjet] = useState('');
  const [site, setSite] = useState('');
  const [montant, setMontant] = useState('');
  const [devise, setDevise] = useState('FCFA');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [description, setDescription] = useState('');
  const [planId, setPlanId] = useState('3phases');
  const [phases, setPhases] = useState([{label:'Phase 1',pct:30},{label:'Phase 2',pct:40},{label:'Phase 3',pct:30}]);
  const [saving, setSaving] = useState(false);

  const totalPct = phases.reduce((s,p)=>s+Number(p.pct),0);
  const montantN = Number(montant)||0;

  const selectPlan = (id) => {
    setPlanId(id);
    const plan = PLANS_PAIEMENT.find(p=>p.id===id);
    if (plan && id!=='custom') setPhases(plan.phases.map(p=>({...p})));
    else setPhases([{label:'Phase 1',pct:50},{label:'Phase 2',pct:50}]);
  };

  const addPhase = () => setPhases(p=>[...p,{label:`Phase ${p.length+1}`,pct:0}]);
  const updPhase = (i,k,v) => setPhases(p=>p.map((ph,idx)=>idx===i?{...ph,[k]:v}:ph));
  const delPhase = (i) => setPhases(p=>p.filter((_,idx)=>idx!==i));

  const handleSave = async (submit) => {
    if (!titre||!client||!technicien||!montant) { alert('Remplissez les champs obligatoires'); return; }
    if (totalPct!==100) { alert(`Total phases = ${totalPct}%. Doit être 100%.`); return; }
    setSaving(true);
    const projet = {
      id:Date.now().toString(),
      reference:`PROJ-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900+100))}`,
      titre, client, technicien, chefProjet, site, montantTotal:montantN, devise,
      dateDebut, dateFin, description,
      status:submit?'soumis':'brouillon',
      planPaiement:planId,
      phases:phases.map((p,i)=>({ id:i+1, label:p.label, pct:Number(p.pct), montant:Math.round(montantN*Number(p.pct)/100), status:'attente', datePaiement:null, reference:null })),
      dateCreation:new Date().toISOString().split('T')[0],
      progression:0,
      historique:submit?[{action:'Soumis',par:'Utilisateur connecté',date:new Date().toISOString(),commentaire:''}]:[],
    };
    try { await api.post('/projets', projet); } catch {}
    onSave(projet); setSaving(false); onClose();
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'white',borderRadius:4,width:'100%',maxWidth:680,maxHeight:'92vh',overflow:'auto',boxShadow:'0 16px 48px rgba(0,0,0,0.22)',fontFamily:'Segoe UI,Arial,sans-serif'}}>

        {/* Header */}
        <div style={{background:'#0078d4',padding:'20px 24px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.7)',textTransform:'uppercase',letterSpacing:1,marginBottom:3}}>
              Étape {step} sur 3
            </div>
            <div style={{fontSize:18,fontWeight:600,color:'white'}}>
              {step===1?'Informations du projet':step===2?'Plan de paiement':'Récapitulatif'}
            </div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <div style={{display:'flex',gap:5}}>
              {[1,2,3].map(s=><div key={s} style={{width:s<=step?20:8,height:8,borderRadius:4,background:s<=step?'white':'rgba(255,255,255,0.3)',transition:'width .2s'}}/>)}
            </div>
            <button onClick={onClose} style={{width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,0.2)',border:'none',color:'white',cursor:'pointer',fontSize:18}}>×</button>
          </div>
        </div>

        <div style={{padding:24}}>

          {/* STEP 1 */}
          {step===1&&(
            <div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginBottom:20}}>
                <div style={{gridColumn:'1/-1'}}>
                  <Field label="Titre du projet" required>
                    <FluentInput value={titre} onChange={setTitre} placeholder="Ex: Installation 5G NR Site Akwa"/>
                  </Field>
                </div>
                <Field label="Client" required>
                  <FluentSelect value={client} onChange={setClient} options={CLIENTS} placeholder="Sélectionner client"/>
                </Field>
                <Field label="Site" required>
                  <FluentSelect value={site} onChange={setSite} options={SITES} placeholder="Sélectionner site"/>
                </Field>
                <Field label="Chef de projet" required>
                  <FluentSelect value={chefProjet} onChange={setChefProjet} options={CHEFS_PROJET} placeholder="Sélectionner"/>
                </Field>
                <Field label="Technicien responsable" required>
                  <FluentSelect value={technicien} onChange={setTechnicien} options={TECHNICIENS} placeholder="Sélectionner"/>
                </Field>
                <Field label="Montant total" required>
                  <FluentInput type="number" value={montant} onChange={setMontant} placeholder="0"/>
                </Field>
                <Field label="Devise">
                  <FluentSelect value={devise} onChange={setDevise} options={['FCFA','USD','EUR','CNY']}/>
                </Field>
                <Field label="Date début">
                  <FluentInput type="date" value={dateDebut} onChange={setDateDebut}/>
                </Field>
                <Field label="Date fin prévue">
                  <FluentInput type="date" value={dateFin} onChange={setDateFin}/>
                </Field>
                <div style={{gridColumn:'1/-1'}}>
                  <Field label="Description des travaux">
                    <FluentTextarea value={description} onChange={setDescription} placeholder="Décrivez les travaux à réaliser..." rows={3}/>
                  </Field>
                </div>
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',gap:8,paddingTop:16,borderTop:'1px solid #f3f4f6'}}>
                <FluentBtn label="Annuler" onClick={onClose} ghost color="#605e5c"/>
                <FluentBtn label="Suivant →" onClick={()=>setStep(2)} color="#0078d4"/>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step===2&&(
            <div>
              <div style={{padding:'10px 14px',background:'#f3f4f8',borderRadius:4,marginBottom:16,border:'1px solid #e8eaed'}}>
                <span style={{fontSize:12,color:'#4b5563'}}>Montant total : </span>
                <span style={{fontSize:16,fontWeight:700,color:'#0078d4'}}>{fmtN(montantN)} {devise}</span>
              </div>

              {/* Choix plan */}
              <div style={{marginBottom:18}}>
                <div style={{fontSize:12,fontWeight:600,color:'#323130',marginBottom:10}}>Choisir le plan de paiement</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                  {PLANS_PAIEMENT.map(p=>(
                    <div key={p.id} onClick={()=>selectPlan(p.id)} style={{padding:12,borderRadius:4,border:`2px solid ${planId===p.id?'#0078d4':'#e8eaed'}`,background:planId===p.id?'#deecf9':'white',cursor:'pointer',transition:'all .1s'}}>
                      <div style={{fontSize:13,fontWeight:planId===p.id?700:500,color:planId===p.id?'#0078d4':'#1f2937',marginBottom:2}}>{p.label}</div>
                      <div style={{fontSize:11,color:'#a19f9d'}}>{p.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phases */}
              <div style={{background:'#f3f4f8',borderRadius:4,padding:16,marginBottom:16}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <span style={{fontSize:12,fontWeight:700,color:'#323130'}}>Détail des phases</span>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontSize:12,fontWeight:700,color:totalPct===100?'#107c10':'#d13438'}}>
                      Total : {totalPct}% {totalPct!==100&&'⚠️'}
                    </span>
                    <FluentBtn label="+ Phase" onClick={addPhase} ghost color="#0078d4"/>
                  </div>
                </div>
                {phases.map((ph,i)=>(
                  <div key={i} style={{display:'flex',gap:10,alignItems:'center',marginBottom:8,background:'white',borderRadius:4,padding:'10px 12px',border:'1px solid #e8eaed'}}>
                    <div style={{width:24,height:24,borderRadius:'50%',background:'#0078d4',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</div>
                    <div style={{flex:2}}>
                      <FluentInput value={ph.label} onChange={v=>updPhase(i,'label',v)} placeholder="Nom de la phase"/>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6,flex:1}}>
                      <FluentInput type="number" value={ph.pct} onChange={v=>updPhase(i,'pct',Number(v))} placeholder="0"/>
                      <span style={{fontSize:13,color:'#a19f9d',flexShrink:0}}>%</span>
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:'#0078d4',width:130,textAlign:'right',flexShrink:0}}>{fmtN(Math.round(montantN*ph.pct/100))} {devise}</div>
                    {phases.length>1&&<button onClick={()=>delPhase(i)} style={{width:24,height:24,borderRadius:'50%',border:'1px solid #fde7e9',background:'#fde7e9',color:'#d13438',cursor:'pointer',fontSize:14,flexShrink:0}}>×</button>}
                  </div>
                ))}
              </div>

              <div style={{display:'flex',justifyContent:'space-between',gap:8,paddingTop:16,borderTop:'1px solid #f3f4f6'}}>
                <FluentBtn label="← Retour" onClick={()=>setStep(1)} ghost color="#605e5c"/>
                <FluentBtn label="Suivant →" onClick={()=>totalPct===100&&setStep(3)} disabled={totalPct!==100} color="#0078d4"/>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step===3&&(
            <div>
              <div style={{background:'#f3f4f8',borderRadius:4,padding:16,marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:600,color:'#323130',marginBottom:12}}>Récapitulatif du projet</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {[
                    {l:'Titre',v:titre},{l:'Client',v:client},
                    {l:'Chef de projet',v:chefProjet},{l:'Technicien',v:technicien},
                    {l:'Site',v:site||'—'},{l:'Montant total',v:`${fmtN(montantN)} ${devise}`},
                    {l:'Plan paiement',v:PLANS_PAIEMENT.find(p=>p.id===planId)?.label},
                    {l:'Phases',v:`${phases.length} phase${phases.length>1?'s':''}`},
                  ].map(item=>(
                    <div key={item.l} style={{background:'white',borderRadius:3,padding:'8px 10px',border:'1px solid #e8eaed'}}>
                      <div style={{fontSize:10,color:'#a19f9d',textTransform:'uppercase',letterSpacing:0.4,marginBottom:2}}>{item.l}</div>
                      <div style={{fontSize:13,fontWeight:500,color:'#1f2937'}}>{item.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phases recap */}
              <div style={{marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:600,color:'#323130',marginBottom:8}}>Phases de paiement</div>
                {phases.map((ph,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px',background:i%2===0?'#f3f4f8':'white',borderRadius:3,marginBottom:2}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:20,height:20,borderRadius:'50%',background:'#0078d4',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:10,fontWeight:700}}>{i+1}</div>
                      <span style={{fontSize:13,color:'#374151'}}>{ph.label}</span>
                    </div>
                    <div style={{display:'flex',gap:16,alignItems:'center'}}>
                      <span style={{fontSize:11,color:'#a19f9d'}}>{ph.pct}%</span>
                      <span style={{fontSize:13,fontWeight:700,color:'#0078d4'}}>{fmtN(Math.round(montantN*ph.pct/100))} {devise}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{display:'flex',gap:10,alignItems:'flex-start',padding:'10px 12px',background:'#deecf9',borderRadius:4,marginBottom:16,border:'1px solid #b3d5f0'}}>
                <span style={{fontSize:16}}>📧</span>
                <div style={{fontSize:12,color:'#004e8c'}}>Après soumission, des notifications seront envoyées à <strong>Finance 1 → Finance 2 → Direction Générale</strong> pour approbation successive.</div>
              </div>

              <div style={{display:'flex',justifyContent:'space-between',gap:8,paddingTop:16,borderTop:'1px solid #f3f4f6'}}>
                <FluentBtn label="← Retour" onClick={()=>setStep(2)} ghost color="#605e5c"/>
                <div style={{display:'flex',gap:8}}>
                  <FluentBtn label="💾 Brouillon" onClick={()=>handleSave(false)} disabled={saving} ghost color="#0078d4"/>
                  <FluentBtn label={saving?'Soumission...':'📤 Créer et soumettre'} onClick={()=>handleSave(true)} disabled={saving} color="#107c10"/>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== PANEL DÉTAIL PROJET =====
const ProjetDetail = ({ projet, onClose, onUpdate }) => {
  const [comment, setComment] = useState('');
  const [acting, setActing] = useState(false);
  const wf = getWF(projet.status);
  const avatarColor = ['#0078d4','#107c10','#5c2d91'][projet.chefProjet?.charCodeAt(0)%3]||'#0078d4';
  const techColor = ['#ca5010','#d13438','#8764b8'][projet.technicien?.charCodeAt(0)%3]||'#ca5010';
  const totalPaye = projet.phases.filter(p=>p.status==='paye').reduce((s,p)=>s+p.montant,0);
  const totalRestant = projet.montantTotal - totalPaye;

  const doAction = async (action) => {
    setActing(true);
    const statusMap = { soumettre:'soumis', approuver_f1:'finance2', approuver_f2:'dg', approuver_dg:'approuve', rejeter:'rejete', demarrer:'en_cours', terminer:'termine' };
    const labelMap = { soumettre:'Soumis', approuver_f1:'Approuvé Finance 1', approuver_f2:'Approuvé Finance 2', approuver_dg:'Approuvé Direction', rejeter:'Rejeté', demarrer:'Démarré', terminer:'Terminé' };
    const updated = { ...projet, status:statusMap[action], historique:[...(projet.historique||[]),{action:labelMap[action],par:'Utilisateur connecté',date:new Date().toISOString(),commentaire:comment}] };
    try { await api.patch(`/projets/${projet.id}`, updated); } catch {}
    onUpdate(updated); setComment(''); setActing(false);
  };

  const payerPhase = (phaseId) => {
    const updated = { ...projet, phases:projet.phases.map(p=>p.id===phaseId?{...p,status:'paye',datePaiement:new Date().toISOString().split('T')[0],reference:`PAY-${Date.now().toString().slice(-6)}`}:p) };
    onUpdate(updated);
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:'Segoe UI,Arial,sans-serif'}}>
      <div style={{background:'white',borderRadius:4,width:'100%',maxWidth:900,maxHeight:'93vh',overflow:'auto',boxShadow:'0 16px 48px rgba(0,0,0,0.22)'}}>

        {/* Header */}
        <div style={{background:wf.dot,padding:'20px 28px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
            <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
              <div style={{width:48,height:48,borderRadius:4,background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>📁</div>
              <div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.7)',marginBottom:4,fontFamily:'monospace'}}>{projet.reference}</div>
                <div style={{fontSize:20,fontWeight:600,color:'white',marginBottom:4}}>{projet.titre}</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.8)'}}>
                  {projet.client} · 📡 {projet.site}
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,0.2)',border:'none',color:'white',cursor:'pointer',fontSize:18}}>×</button>
          </div>
          <ProjetTimeline status={projet.status}/>
        </div>

        <div style={{padding:28}}>
          {/* KPIs */}
          <div style={{display:'flex',gap:12,marginBottom:22}}>
            {[
              {l:'Montant total',v:`${fmtN(projet.montantTotal)} ${projet.devise}`,c:'#0078d4',bg:'#deecf9'},
              {l:'Payé',v:`${fmtN(totalPaye)} ${projet.devise}`,c:'#107c10',bg:'#dff6dd'},
              {l:'Restant',v:`${fmtN(totalRestant)} ${projet.devise}`,c:'#ca5010',bg:'#fff4ce'},
              {l:'Avancement',v:`${projet.progression}%`,c:wf.dot,bg:wf.bg},
            ].map(k=>(
              <div key={k.l} style={{flex:1,background:k.bg,borderRadius:4,padding:'12px 14px',border:`1px solid ${k.c}30`}}>
                <div style={{fontSize:10,color:k.c,textTransform:'uppercase',letterSpacing:0.5,marginBottom:4,opacity:0.7}}>{k.l}</div>
                <div style={{fontSize:18,fontWeight:700,color:k.c}}>{k.v}</div>
              </div>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1.2fr 1fr',gap:22}}>

            {/* Colonne gauche */}
            <div>
              {/* Équipe */}
              <div style={{marginBottom:18}}>
                <div style={{fontSize:11,fontWeight:700,color:'#a19f9d',textTransform:'uppercase',letterSpacing:0.5,marginBottom:10}}>Équipe</div>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {[
                    {label:'Chef de projet',name:projet.chefProjet,color:avatarColor},
                    {label:'Technicien',name:projet.technicien,color:techColor},
                  ].map(p=>(
                    <div key={p.label} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:'#f3f4f8',borderRadius:4}}>
                      <Avatar name={p.name} color={p.color} size={34}/>
                      <div>
                        <div style={{fontSize:11,color:'#a19f9d',marginBottom:1}}>{p.label}</div>
                        <div style={{fontSize:13,fontWeight:600,color:'#1f2937'}}>{p.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Infos */}
              <div style={{marginBottom:18}}>
                <div style={{fontSize:11,fontWeight:700,color:'#a19f9d',textTransform:'uppercase',letterSpacing:0.5,marginBottom:10}}>Informations</div>
                <div style={{border:'1px solid #e8eaed',borderRadius:4,overflow:'hidden'}}>
                  {[
                    {l:'Client',v:projet.client},
                    {l:'Site',v:projet.site||'—'},
                    {l:'Plan paiement',v:PLANS_PAIEMENT.find(p=>p.id===projet.planPaiement)?.label||'—'},
                    {l:'Date début',v:fmtD(projet.dateDebut)},
                    {l:'Date fin prévue',v:fmtD(projet.dateFin)},
                    {l:'Créé le',v:fmtD(projet.dateCreation)},
                  ].map((info,i)=>(
                    <div key={info.l} style={{display:'flex',justifyContent:'space-between',padding:'9px 12px',background:i%2===0?'#fafafa':'white',borderBottom:i<5?'1px solid #f3f4f6':'none'}}>
                      <span style={{fontSize:12,color:'#a19f9d'}}>{info.l}</span>
                      <span style={{fontSize:12,fontWeight:600,color:'#1f2937'}}>{info.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phases paiement */}
              <div>
                <div style={{fontSize:11,fontWeight:700,color:'#a19f9d',textTransform:'uppercase',letterSpacing:0.5,marginBottom:10}}>Phases de paiement</div>
                {projet.phases.map(ph=>{
                  const sp = STATUS_PHASE[ph.status]||STATUS_PHASE.attente;
                  return (
                    <div key={ph.id} style={{marginBottom:8,borderRadius:4,border:`1px solid ${ph.status==='paye'?'#a7d7a7':'#e8eaed'}`,overflow:'hidden'}}>
                      <div style={{padding:'10px 14px',background:ph.status==='paye'?'#dff6dd':'white'}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                          <div>
                            <div style={{fontSize:13,fontWeight:600,color:'#1f2937'}}>{ph.label}</div>
                            <div style={{fontSize:11,color:'#a19f9d'}}>{ph.pct}% — {fmtN(ph.montant)} {projet.devise}</div>
                          </div>
                          <span style={{padding:'3px 9px',borderRadius:10,background:sp.bg,color:sp.color,fontSize:11,fontWeight:600}}>{sp.label}</span>
                        </div>
                        {ph.status==='paye'&&<div style={{fontSize:11,color:'#107c10',fontWeight:600}}>✓ Payé le {fmtD(ph.datePaiement)} · Réf: {ph.reference}</div>}
                        {ph.status!=='paye'&&projet.status==='approuve'&&(
                          <button onClick={()=>payerPhase(ph.id)} style={{marginTop:6,padding:'6px 14px',borderRadius:3,border:'none',background:'#107c10',color:'white',fontSize:12,fontWeight:600,cursor:'pointer'}}>
                            💳 Marquer payé
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Colonne droite */}
            <div>
              {/* Historique */}
              <div style={{marginBottom:18}}>
                <div style={{fontSize:11,fontWeight:700,color:'#a19f9d',textTransform:'uppercase',letterSpacing:0.5,marginBottom:10}}>Historique</div>
                <div style={{maxHeight:220,overflow:'auto'}}>
                  {(!projet.historique||projet.historique.length===0)&&(
                    <div style={{padding:14,textAlign:'center',color:'#a19f9d',fontSize:13,background:'#fafafa',borderRadius:4,border:'1px solid #e8eaed'}}>Aucune action</div>
                  )}
                  {projet.historique?.map((h,i)=>(
                    <div key={i} style={{display:'flex',gap:10,marginBottom:12}}>
                      <div style={{display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0}}>
                        <div style={{width:28,height:28,borderRadius:'50%',background:'#0078d4',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:12}}>✓</div>
                        {i<projet.historique.length-1&&<div style={{width:1,flex:1,background:'#e8eaed',margin:'3px 0'}}/>}
                      </div>
                      <div style={{paddingBottom:10}}>
                        <div style={{fontSize:12,fontWeight:600,color:'#1f2937'}}>{h.action}</div>
                        <div style={{fontSize:11,color:'#a19f9d'}}>par {h.par} · {fmtDT(h.date)}</div>
                        {h.commentaire&&<div style={{fontSize:11,color:'#4b5563',fontStyle:'italic',marginTop:2}}>"{h.commentaire}"</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              {projet.description&&(
                <div style={{marginBottom:18}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#a19f9d',textTransform:'uppercase',letterSpacing:0.5,marginBottom:8}}>Description</div>
                  <div style={{padding:'12px 14px',background:'#fafafa',borderRadius:4,border:'1px solid #e8eaed',fontSize:13,color:'#374151',lineHeight:1.6}}>{projet.description}</div>
                </div>
              )}

              {/* Actions */}
              <div style={{background:'#f3f4f8',borderRadius:4,padding:16,border:'1px solid #e8eaed'}}>
                <div style={{fontSize:11,fontWeight:700,color:'#a19f9d',textTransform:'uppercase',letterSpacing:0.5,marginBottom:10}}>Votre décision</div>
                <FluentTextarea value={comment} onChange={setComment} placeholder="Commentaire (optionnel)..." rows={2}/>
                <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:10}}>
                  {projet.status==='brouillon'&&<FluentBtn label="📤 Soumettre" onClick={()=>doAction('soumettre')} disabled={acting} color="#0078d4"/>}
                  {projet.status==='soumis'&&<FluentBtn label="✅ Approuver F1" onClick={()=>doAction('approuver_f1')} disabled={acting} color="#5c2d91"/>}
                  {projet.status==='finance2'&&<FluentBtn label="✅ Approuver F2" onClick={()=>doAction('approuver_f2')} disabled={acting} color="#8764b8"/>}
                  {projet.status==='dg'&&<FluentBtn label="✅ Approuver DG" onClick={()=>doAction('approuver_dg')} disabled={acting} color="#ca5010"/>}
                  {projet.status==='approuve'&&<FluentBtn label="▶ Démarrer" onClick={()=>doAction('demarrer')} disabled={acting} color="#0078d4"/>}
                  {projet.status==='en_cours'&&<FluentBtn label="✓ Terminer" onClick={()=>doAction('terminer')} disabled={acting} color="#107c10"/>}
                  {['soumis','finance2','dg'].includes(projet.status)&&<FluentBtn label="✕ Rejeter" onClick={()=>doAction('rejeter')} disabled={acting} ghost color="#d13438"/>}
                  {['approuve','en_cours','termine','rejete'].includes(projet.status)&&(
                    <div style={{fontSize:12,color:'#a19f9d',fontStyle:'italic',padding:'6px 0'}}>{projet.status==='termine'?'✅ Projet terminé':projet.status==='rejete'?'❌ Projet rejeté':'En cours d\'exécution...' }</div>
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

// ===== VUE KANBAN PROJETS =====
const KanbanProjets = ({ projets, onSelect }) => {
  const columns = [
    { key:'brouillon', label:'Brouillon',  items:projets.filter(p=>p.status==='brouillon') },
    { key:'soumis',    label:'Soumis',      items:projets.filter(p=>p.status==='soumis') },
    { key:'finance1',  label:'Finance 1→2', items:projets.filter(p=>['finance1','finance2'].includes(p.status)) },
    { key:'dg',        label:'Direction',   items:projets.filter(p=>p.status==='dg') },
    { key:'en_cours',  label:'En cours',    items:projets.filter(p=>['approuve','en_cours'].includes(p.status)) },
    { key:'termine',   label:'Terminé',     items:projets.filter(p=>p.status==='termine') },
  ];
  return (
    <div style={{display:'flex',gap:12,overflowX:'auto',paddingBottom:8}}>
      {columns.map(col=>{
        const wf = getWF(col.key);
        return (
          <div key={col.key} style={{minWidth:240,flex:'0 0 240px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <div style={{width:10,height:10,borderRadius:2,background:wf.dot}}/>
                <span style={{fontSize:12,fontWeight:700,color:'#323130'}}>{col.label}</span>
              </div>
              <span style={{padding:'1px 8px',borderRadius:10,background:wf.bg,color:wf.color,fontSize:11,fontWeight:700}}>{col.items.length}</span>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8,minHeight:100}}>
              {col.items.map(p=><ProjetCard key={p.id} projet={p} onClick={()=>onSelect(p)}/>)}
              {col.items.length===0&&<div style={{padding:16,textAlign:'center',color:'#a19f9d',fontSize:12,background:'#fafafa',borderRadius:4,border:'1px dashed #e8eaed'}}>Aucun projet</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ===== COMPOSANT PRINCIPAL =====
export default function Projets() {
  const [projets, setProjets] = useState(SEED_PROJETS);
  const [view, setView] = useState('list');
  const [tab, setTab] = useState('all');
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');

  const updateProjet = (updated) => { setProjets(p=>p.map(pr=>pr.id===updated.id?updated:pr)); setSelected(updated); };
  const addProjet = (p) => setProjets(prev=>[p,...prev]);

  const enAttente = projets.filter(p=>['soumis','finance2','dg'].includes(p.status));
  const totalMontant = projets.reduce((s,p)=>s+p.montantTotal,0);
  const totalPaye = projets.reduce((s,p)=>s+p.phases.filter(ph=>ph.status==='paye').reduce((ss,ph)=>ss+ph.montant,0),0);

  const filtered = projets.filter(p=>{
    const ms = !search||p.titre.toLowerCase().includes(search.toLowerCase())||p.client.toLowerCase().includes(search.toLowerCase())||p.reference.toLowerCase().includes(search.toLowerCase());
    const mf = filterStatus==='tous'||p.status===filterStatus;
    const tabF = tab==='pending'?['soumis','finance2','dg'].includes(p.status):tab==='approved'?['approuve','en_cours','termine'].includes(p.status):true;
    return ms&&mf&&tabF;
  });

  const TABS_LIST = [
    {id:'all',label:'Tous les projets',count:projets.length},
    {id:'pending',label:'En approbation',count:enAttente.length},
    {id:'approved',label:'Approuvés',count:projets.filter(p=>['approuve','en_cours','termine'].includes(p.status)).length},
  ];

  return (
    <div style={{minHeight:'100vh',background:'#f3f4f8',fontFamily:'Segoe UI,Arial,sans-serif'}}>

      {/* Header */}
      <div style={{background:'white',borderBottom:'1px solid #e8eaed',padding:'0 28px'}}>
        <div style={{maxWidth:1400,margin:'0 auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 0 12px'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:36,height:36,borderRadius:8,background:'#0078d4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>📁</div>
              <div>
                <h1 style={{fontSize:18,fontWeight:700,color:'#1f2937',margin:'0 0 2px'}}>Projets & Approvals</h1>
                <p style={{color:'#a19f9d',margin:0,fontSize:12}}>Workflow Finance 1 → Finance 2 → Direction · Paiements multi-phases</p>
              </div>
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <div style={{display:'flex',background:'#f3f4f8',borderRadius:4,padding:2,border:'1px solid #e8eaed'}}>
                {[{v:'list',icon:'≡'},{v:'kanban',icon:'⊞'},{v:'cards',icon:'⊡'}].map(vt=>(
                  <button key={vt.v} onClick={()=>setView(vt.v)} style={{padding:'6px 12px',borderRadius:3,border:'none',background:view===vt.v?'white':'transparent',color:view===vt.v?'#0078d4':'#a19f9d',fontWeight:view===vt.v?700:400,cursor:'pointer',fontSize:16,boxShadow:view===vt.v?'0 1px 3px rgba(0,0,0,0.1)':'none'}}>
                    {vt.icon}
                  </button>
                ))}
              </div>
              <button onClick={()=>setShowNew(true)} style={{padding:'8px 16px',borderRadius:4,border:'none',background:'#0078d4',color:'white',fontWeight:600,fontSize:13,cursor:'pointer'}}>
                + Nouveau projet
              </button>
            </div>
          </div>
          <div style={{display:'flex',gap:0,borderTop:'1px solid #f3f4f6'}}>
            {TABS_LIST.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'10px 16px',border:'none',borderBottom:`2px solid ${tab===t.id?'#0078d4':'transparent'}`,background:'transparent',color:tab===t.id?'#0078d4':'#a19f9d',fontWeight:tab===t.id?700:400,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
                {t.label}
                {t.count>0&&<span style={{padding:'1px 7px',borderRadius:10,background:tab===t.id?'#deecf9':'#f3f4f8',color:tab===t.id?'#0078d4':'#a19f9d',fontSize:11,fontWeight:700}}>{t.count}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1400,margin:'0 auto',padding:'20px 28px'}}>

        {/* KPIs */}
        <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
          {[
            {l:'Total projets',v:projets.length,c:'#0078d4',bg:'#deecf9',icon:'📁'},
            {l:'En approbation',v:enAttente.length,c:'#ca5010',bg:'#fff4ce',icon:'⏳'},
            {l:'Approuvés',v:projets.filter(p=>['approuve','en_cours','termine'].includes(p.status)).length,c:'#107c10',bg:'#dff6dd',icon:'✅'},
            {l:'Montant total',v:`${fmtN(totalMontant)} FCFA`,c:'#5c2d91',bg:'#f4f0fb',icon:'💰'},
            {l:'Total payé',v:`${fmtN(totalPaye)} FCFA`,c:'#107c10',bg:'#dff6dd',icon:'💳'},
            {l:'Rejetés',v:projets.filter(p=>p.status==='rejete').length,c:'#d13438',bg:'#fde7e9',icon:'❌'},
          ].map(k=>(
            <div key={k.l} style={{flex:1,minWidth:150,background:'white',borderRadius:4,padding:'14px 16px',border:'1px solid #e8eaed',boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <span style={{fontSize:10,color:'#a19f9d',textTransform:'uppercase',letterSpacing:0.5}}>{k.l}</span>
                <div style={{width:28,height:28,borderRadius:4,background:k.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>{k.icon}</div>
              </div>
              <div style={{fontSize:typeof k.v==='string'?14:22,fontWeight:700,color:k.c}}>{k.v}</div>
            </div>
          ))}
        </div>

        {/* Alerte approbation */}
        {enAttente.length>0&&tab!=='approved'&&(
          <div style={{background:'#fff4ce',borderRadius:4,padding:'12px 16px',border:'1px solid #f9e4a1',marginBottom:16,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:18}}>⏳</span>
              <span style={{fontSize:13,fontWeight:600,color:'#7a4100'}}>{enAttente.length} projet{enAttente.length>1?'s':''} en attente d'approbation</span>
            </div>
            <button onClick={()=>setTab('pending')} style={{padding:'6px 14px',borderRadius:4,border:'1px solid #ca5010',background:'transparent',color:'#ca5010',fontWeight:600,fontSize:12,cursor:'pointer'}}>Voir →</button>
          </div>
        )}

        {/* Filtres */}
        <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
          <div style={{flex:1,minWidth:240,display:'flex',alignItems:'center',gap:8,background:'white',borderRadius:4,padding:'8px 12px',border:'1px solid #e8eaed'}}>
            <span style={{color:'#a19f9d'}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Titre, client, référence..."
              style={{flex:1,border:'none',outline:'none',fontSize:13,color:'#1f2937',background:'transparent',fontFamily:'Segoe UI,Arial,sans-serif'}}/>
          </div>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
            style={{padding:'8px 12px',borderRadius:4,border:'1px solid #e8eaed',fontSize:13,color:'#374151',background:'white',cursor:'pointer',fontFamily:'Segoe UI,Arial,sans-serif'}}>
            <option value="tous">Tous les statuts</option>
            {WORKFLOW_PROJETS.map(w=><option key={w.key} value={w.key}>{w.label}</option>)}
          </select>
          <button style={{padding:'8px 14px',borderRadius:4,border:'1px solid #e8eaed',background:'white',color:'#374151',fontWeight:500,fontSize:13,cursor:'pointer'}}>📥 Exporter</button>
        </div>

        {/* Vue Kanban */}
        {view==='kanban'&&<KanbanProjets projets={filtered} onSelect={setSelected}/>}

        {/* Vue Cards */}
        {view==='cards'&&(
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:14}}>
            {filtered.map(p=><ProjetCard key={p.id} projet={p} onClick={()=>setSelected(p)}/>)}
            {filtered.length===0&&<div style={{gridColumn:'1/-1',padding:48,textAlign:'center',color:'#a19f9d',background:'white',borderRadius:4,border:'1px solid #e8eaed'}}><div style={{fontSize:40,marginBottom:10}}>📁</div><div style={{fontSize:15,fontWeight:600}}>Aucun projet trouvé</div></div>}
          </div>
        )}

        {/* Vue Liste */}
        {view==='list'&&(
          <div style={{background:'white',borderRadius:4,border:'1px solid #e8eaed',overflow:'hidden',boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:900}}>
                <thead>
                  <tr style={{background:'#f3f4f8',borderBottom:'1px solid #e8eaed'}}>
                    {['Projet','Client','Équipe','Montant','Payé','Progression','Statut',''].map(h=>(
                      <th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:'#a19f9d',textTransform:'uppercase',letterSpacing:0.5,whiteSpace:'nowrap'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p,i)=>{
                    const payeTotal = p.phases.filter(ph=>ph.status==='paye').reduce((s,ph)=>s+ph.montant,0);
                    const avatarColor = ['#0078d4','#107c10','#5c2d91'][p.chefProjet?.charCodeAt(0)%3]||'#0078d4';
                    return (
                      <tr key={p.id} onClick={()=>setSelected(p)} style={{borderBottom:'1px solid #f3f4f6',cursor:'pointer',background:'white'}}
                        onMouseEnter={e=>e.currentTarget.style.background='#f3f4f8'}
                        onMouseLeave={e=>e.currentTarget.style.background='white'}>
                        <td style={{padding:'12px 14px'}}>
                          <div style={{fontSize:11,color:'#a19f9d',fontFamily:'monospace',marginBottom:2}}>{p.reference}</div>
                          <div style={{fontSize:13,fontWeight:600,color:'#1f2937',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.titre}</div>
                          {p.site&&<div style={{fontSize:11,color:'#0078d4',marginTop:2}}>📡 {p.site}</div>}
                        </td>
                        <td style={{padding:'12px 14px',fontSize:13,color:'#374151'}}>{p.client}</td>
                        <td style={{padding:'12px 14px'}}>
                          <div style={{display:'flex',gap:4}}>
                            <Avatar name={p.chefProjet} color={avatarColor} size={26}/>
                            <Avatar name={p.technicien} color={'#ca5010'} size={26}/>
                          </div>
                        </td>
                        <td style={{padding:'12px 14px',fontSize:13,fontWeight:600,color:'#0078d4'}}>{fmtN(p.montantTotal)}</td>
                        <td style={{padding:'12px 14px',fontSize:13,fontWeight:600,color:'#107c10'}}>{fmtN(payeTotal)}</td>
                        <td style={{padding:'12px 14px',minWidth:120}}>
                          <div style={{display:'flex',alignItems:'center',gap:6}}>
                            <div style={{flex:1,height:5,background:'#f3f4f8',borderRadius:3,overflow:'hidden'}}>
                              <div style={{width:`${p.progression}%`,height:'100%',background:getWF(p.status).dot,borderRadius:3}}/>
                            </div>
                            <span style={{fontSize:10,fontWeight:700,color:'#a19f9d'}}>{p.progression}%</span>
                          </div>
                        </td>
                        <td style={{padding:'12px 14px'}}><ProjetBadge status={p.status}/></td>
                        <td style={{padding:'12px 14px'}}>
                          <div style={{display:'flex',gap:5,justifyContent:'flex-end'}}>
                            <button onClick={e=>{e.stopPropagation();setSelected(p)}} style={{padding:'5px 12px',borderRadius:3,border:'1px solid #e8eaed',background:'white',color:'#374151',fontSize:12,cursor:'pointer',fontWeight:500}}>Voir</button>
                            {['soumis','finance2','dg'].includes(p.status)&&(
                              <button onClick={e=>{e.stopPropagation();setSelected(p)}} style={{padding:'5px 12px',borderRadius:3,border:'none',background:'#0078d4',color:'white',fontSize:12,cursor:'pointer',fontWeight:600}}>Approuver</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length===0&&(
                <div style={{padding:48,textAlign:'center',color:'#a19f9d'}}>
                  <div style={{fontSize:40,marginBottom:10}}>📁</div>
                  <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>Aucun projet trouvé</div>
                  <div style={{fontSize:13}}>Créez un nouveau projet ou modifiez vos filtres</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selected&&<ProjetDetail projet={selected} onClose={()=>setSelected(null)} onUpdate={updateProjet}/>}
      {showNew&&<NouveauProjetModal onClose={()=>setShowNew(false)} onSave={addProjet}/>}
    </div>
  );
}
