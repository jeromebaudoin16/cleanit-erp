import { useState } from 'react';
import { api } from '../utils/api';

const fmtN = n => new Intl.NumberFormat('fr-FR').format(Math.round(n||0));
const fmtDate = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fmtDateTime = d => d ? new Date(d).toLocaleString('fr-FR') : '—';

// ===== DONNÉES =====
const CLIENTS = ['MTN Cameroun','Orange Cameroun','Huawei Technologies','Nexttel','Gouvernement Cameroun','CAMTEL','Entreprise Privée'];
const TECHNICIENS = ['Thomas Ngono','Jean Mbarga','Samuel Djomo','Ali Moussa','Pierre Etoga'];
const SITES = ['DLA-001','DLA-003','YDE-001','KRI-001','GAR-001','LIM-001','BFN-001'];

const PLANS_PAIEMENT = [
  { id:'direct', label:'Paiement direct', desc:'100% à la signature', phases:[{label:'Paiement unique',pct:100}] },
  { id:'2phases', label:'2 phases', desc:'Acompte + solde', phases:[{label:'Acompte',pct:50},{label:'Solde',pct:50}] },
  { id:'3phases', label:'3 phases', desc:'30/40/30 standard', phases:[{label:'Phase 1',pct:30},{label:'Phase 2',pct:40},{label:'Phase 3',pct:30}] },
  { id:'4phases', label:'4 phases', desc:'25% par phase', phases:[{label:'Phase 1',pct:25},{label:'Phase 2',pct:25},{label:'Phase 3',pct:25},{label:'Phase 4',pct:25}] },
  { id:'custom', label:'Personnalisé', desc:'Définir les % manuellement', phases:[] },
];

const STATUS_WORKFLOW = {
  brouillon:    { label:'Brouillon',         color:'#6b7280', bg:'#f3f4f6', step:0 },
  soumis:       { label:'Soumis',            color:'#1d4ed8', bg:'#eff6ff', step:1 },
  finance1:     { label:'Validation Finance 1',color:'#7c3aed', bg:'#f5f3ff', step:2 },
  finance2:     { label:'Validation Finance 2',color:'#9333ea', bg:'#fdf4ff', step:3 },
  dg:           { label:'Validation DG',     color:'#c2410c', bg:'#fff7ed', step:4 },
  approuve:     { label:'Approuvé',          color:'#16a34a', bg:'#f0fdf4', step:5 },
  en_cours:     { label:'En cours',          color:'#0891b2', bg:'#ecfeff', step:5 },
  termine:      { label:'Terminé',           color:'#059669', bg:'#ecfdf5', step:6 },
  rejete:       { label:'Rejeté',            color:'#dc2626', bg:'#fef2f2', step:-1 },
};

const STATUS_PHASE = {
  attente:  { label:'En attente', color:'#6b7280', bg:'#f3f4f6' },
  en_cours: { label:'En cours',   color:'#1d4ed8', bg:'#eff6ff' },
  paye:     { label:'Payé',       color:'#16a34a', bg:'#f0fdf4' },
  retard:   { label:'En retard',  color:'#dc2626', bg:'#fef2f2' },
};

const SEED_PROJETS = [
  {
    id:'1',
    reference:'PROJ-2024-001',
    titre:'Installation 5G NR Site Akwa Douala',
    client:'MTN Cameroun',
    technicien:'Thomas Ngono',
    chefProjet:'Marie Kamga',
    site:'DLA-001',
    montantTotal:45000000,
    devise:'FCFA',
    status:'finance2',
    planPaiement:'3phases',
    phases:[
      {id:1,label:'Phase 1 — Démarrage',pct:30,montant:13500000,status:'paye',datePaiement:'2024-01-20',reference:'PAY-001'},
      {id:2,label:'Phase 2 — Mi-parcours',pct:40,montant:18000000,status:'en_cours',datePaiement:null,reference:null},
      {id:3,label:'Phase 3 — Livraison',pct:30,montant:13500000,status:'attente',datePaiement:null,reference:null},
    ],
    dateCreation:'2024-01-10',
    dateDebut:'2024-01-15',
    dateFin:'2024-03-30',
    progression:65,
    description:'Déploiement complet 5G NR sur le site Akwa. Installation BBU, RRU et antennes sectorielles.',
    historique:[
      {action:'Soumis',par:'Marie Kamga',date:'2024-01-10T09:00:00',commentaire:'Accord technicien confirmé'},
      {action:'Approuvé Finance 1',par:'Alice Finance',date:'2024-01-11T14:30:00',commentaire:'Budget validé'},
      {action:'En cours validation Finance 2',par:'Bob Finance',date:'2024-01-12T10:00:00',commentaire:''},
    ],
    mails:[
      {destinataire:'finance1@cleanit.cm',sujet:'Approbation requise — PROJ-2024-001',date:'2024-01-10',status:'envoye'},
      {destinataire:'finance2@cleanit.cm',sujet:'Approbation requise — PROJ-2024-001',date:'2024-01-11',status:'envoye'},
    ],
  },
  {
    id:'2',
    reference:'PROJ-2024-002',
    titre:'Maintenance préventive réseau Orange Q1',
    client:'Orange Cameroun',
    technicien:'Jean Mbarga',
    chefProjet:'Pierre Etoga',
    site:'YDE-001',
    montantTotal:12000000,
    devise:'FCFA',
    status:'approuve',
    planPaiement:'direct',
    phases:[
      {id:1,label:'Paiement unique',pct:100,montant:12000000,status:'paye',datePaiement:'2024-02-01',reference:'PAY-002'},
    ],
    dateCreation:'2024-01-25',
    dateDebut:'2024-02-01',
    dateFin:'2024-02-28',
    progression:100,
    description:'Maintenance préventive complète du réseau Orange secteur Centre Yaoundé.',
    historique:[
      {action:'Soumis',par:'Pierre Etoga',date:'2024-01-25T10:00:00',commentaire:''},
      {action:'Approuvé Finance 1',par:'Alice Finance',date:'2024-01-26T09:00:00',commentaire:''},
      {action:'Approuvé Finance 2',par:'Bob Finance',date:'2024-01-27T11:00:00',commentaire:''},
      {action:'Approuvé DG',par:'Jérôme Bell',date:'2024-01-28T08:00:00',commentaire:'Validé'},
    ],
    mails:[],
  },
  {
    id:'3',
    reference:'PROJ-2024-003',
    titre:'Survey et préparation site Garoua Nord',
    client:'Huawei Technologies',
    technicien:'Ali Moussa',
    chefProjet:'Marie Kamga',
    site:'GAR-001',
    montantTotal:8500000,
    devise:'FCFA',
    status:'brouillon',
    planPaiement:'2phases',
    phases:[
      {id:1,label:'Acompte démarrage',pct:50,montant:4250000,status:'attente',datePaiement:null,reference:null},
      {id:2,label:'Solde livraison',pct:50,montant:4250000,status:'attente',datePaiement:null,reference:null},
    ],
    dateCreation:'2024-02-15',
    dateDebut:null,
    dateFin:null,
    progression:0,
    description:'Survey complet du site GAR-001 incluant étude de faisabilité et rapport technique.',
    historique:[],
    mails:[],
  },
];

// ===== COMPOSANTS UI =====
const Badge = ({status, type='workflow'}) => {
  const cfg = type==='workflow' ? STATUS_WORKFLOW[status] : STATUS_PHASE[status];
  if (!cfg) return null;
  return <span style={{padding:'4px 10px',borderRadius:20,background:cfg.bg,color:cfg.color,fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>{cfg.label}</span>;
};

const StepBar = ({status}) => {
  const steps = ['Soumis','Finance 1','Finance 2','DG','Approuvé'];
  const currentStep = STATUS_WORKFLOW[status]?.step || 0;
  return (
    <div style={{display:'flex',alignItems:'center',gap:0,width:'100%'}}>
      {steps.map((s,i) => (
        <div key={s} style={{display:'flex',alignItems:'center',flex:i<steps.length-1?1:'none'}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
            <div style={{width:28,height:28,borderRadius:'50%',background:i<currentStep?'#16a34a':i===currentStep?'#1d4ed8':'#e5e7eb',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:12,fontWeight:700,flexShrink:0}}>
              {i<currentStep?'✓':(i+1)}
            </div>
            <span style={{fontSize:9,color:i<=currentStep?'#374151':'#9ca3af',fontWeight:i===currentStep?700:400,whiteSpace:'nowrap'}}>{s}</span>
          </div>
          {i<steps.length-1&&<div style={{flex:1,height:2,background:i<currentStep?'#16a34a':'#e5e7eb',margin:'0 4px',marginBottom:16}}/>}
        </div>
      ))}
    </div>
  );
};

// ===== MODAL NOUVEAU PROJET =====
const NouveauProjetModal = ({onClose, onSave}) => {
  const [step, setStep] = useState(1); // 1=infos, 2=plan paiement, 3=recap
  const [titre, setTitre] = useState('');
  const [client, setClient] = useState('');
  const [technicien, setTechnicien] = useState('');
  const [site, setSite] = useState('');
  const [montant, setMontant] = useState('');
  const [devise, setDevise] = useState('FCFA');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [description, setDescription] = useState('');
  const [planId, setPlanId] = useState('3phases');
  const [phases, setPhases] = useState([{label:'Phase 1',pct:30},{label:'Phase 2',pct:40},{label:'Phase 3',pct:30}]);
  const [saving, setSaving] = useState(false);

  const totalPct = phases.reduce((s,p) => s+Number(p.pct), 0);
  const montantN = Number(montant) || 0;

  const selectPlan = (planId) => {
    setPlanId(planId);
    const plan = PLANS_PAIEMENT.find(p => p.id === planId);
    if (plan && plan.id !== 'custom') {
      setPhases(plan.phases.map(p => ({...p})));
    } else {
      setPhases([{label:'Phase 1',pct:50},{label:'Phase 2',pct:50}]);
    }
  };

  const addPhase = () => setPhases(p => [...p, {label:`Phase ${p.length+1}`,pct:0}]);
  const updPhase = (i,k,v) => setPhases(p => p.map((ph,idx) => idx===i?{...ph,[k]:v}:ph));
  const delPhase = (i) => setPhases(p => p.filter((_,idx) => idx!==i));

  const handleSave = async () => {
    if (!titre||!client||!technicien||!montant) { alert('Remplissez tous les champs obligatoires'); return; }
    if (totalPct !== 100) { alert(`Total des pourcentages = ${totalPct}%. Doit être 100%`); return; }
    setSaving(true);
    const projet = {
      id: Date.now().toString(),
      reference: `PROJ-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900+100))}`,
      titre, client, technicien, site, montantTotal: montantN, devise,
      dateDebut, dateFin, description,
      status: 'brouillon',
      planPaiement: planId,
      phases: phases.map((p,i) => ({
        id: i+1,
        label: p.label,
        pct: Number(p.pct),
        montant: Math.round(montantN * Number(p.pct) / 100),
        status: 'attente',
        datePaiement: null,
        reference: null,
      })),
      dateCreation: new Date().toISOString().split('T')[0],
      progression: 0,
      historique: [],
      mails: [],
    };
    try { await api.post('/projets', projet); } catch {}
    onSave(projet);
    setSaving(false);
    onClose();
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'white',borderRadius:22,width:'100%',maxWidth:700,maxHeight:'92vh',overflow:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
        {/* Header */}
        <div style={{background:'linear-gradient(135deg,#0f172a,#1d4ed8)',padding:'22px 28px',borderRadius:'22px 22px 0 0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:1}}>Nouveau projet</div>
            <div style={{fontSize:20,fontWeight:900,color:'white'}}>
              {step===1?'Informations projet':step===2?'Plan de paiement':'Récapitulatif'}
            </div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <div style={{display:'flex',gap:4}}>
              {[1,2,3].map(s=>(
                <div key={s} style={{width:28,height:28,borderRadius:'50%',background:step>=s?'white':'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:step>=s?'#1d4ed8':'white'}}>{s}</div>
              ))}
            </div>
            <button onClick={onClose} style={{width:32,height:32,borderRadius:9,background:'rgba(255,255,255,0.15)',border:'none',color:'white',cursor:'pointer',fontSize:16}}>✕</button>
          </div>
        </div>

        <div style={{padding:28}}>
          {/* STEP 1 — Infos */}
          {step===1 && (
            <div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
                {[
                  {label:'Titre du projet *',type:'text',value:titre,set:setTitre,placeholder:'Ex: Installation 5G Site Nord',full:true},
                  {label:'Client *',type:'select',value:client,set:setClient,options:CLIENTS},
                  {label:'Technicien *',type:'select',value:technicien,set:setTechnicien,options:TECHNICIENS},
                  {label:'Site',type:'select',value:site,set:setSite,options:SITES},
                  {label:'Montant total *',type:'number',value:montant,set:setMontant,placeholder:'0'},
                  {label:'Devise',type:'select',value:devise,set:setDevise,options:['FCFA','USD','EUR','CNY']},
                  {label:'Date début',type:'date',value:dateDebut,set:setDateDebut},
                  {label:'Date fin prévue',type:'date',value:dateFin,set:setDateFin},
                ].map(f => (
                  <div key={f.label} style={{gridColumn:f.full?'1/-1':'auto'}}>
                    <label style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:0.5,display:'block',marginBottom:5}}>{f.label}</label>
                    {f.type==='select' ? (
                      <select value={f.value} onChange={e=>f.set(e.target.value)} style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1.5px solid #e5e7eb',fontSize:13,background:'#f9fafb'}}>
                        <option value="">Sélectionner...</option>
                        {f.options.map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type={f.type} value={f.value} onChange={e=>f.set(e.target.value)} placeholder={f.placeholder||''} style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1.5px solid #e5e7eb',fontSize:13,background:'#f9fafb',boxSizing:'border-box'}}/>
                    )}
                  </div>
                ))}
              </div>
              <div style={{marginBottom:18}}>
                <label style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:0.5,display:'block',marginBottom:5}}>Description</label>
                <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} placeholder="Description des travaux..." style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1.5px solid #e5e7eb',fontSize:13,resize:'none',boxSizing:'border-box',fontFamily:'inherit'}}/>
              </div>
              <div style={{display:'flex',justifyContent:'flex-end'}}>
                <button onClick={()=>setStep(2)} style={{padding:'12px 28px',borderRadius:12,border:'none',background:'#1d4ed8',color:'white',fontWeight:800,fontSize:14,cursor:'pointer'}}>
                  Suivant — Plan de paiement →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 — Plan paiement */}
          {step===2 && (
            <div>
              <p style={{fontSize:13,color:'#6b7280',marginBottom:16}}>Montant total: <strong style={{color:'#111827',fontSize:16}}>{fmtN(montantN)} {devise}</strong></p>

              {/* Choix plan */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:22}}>
                {PLANS_PAIEMENT.map(p=>(
                  <div key={p.id} onClick={()=>selectPlan(p.id)} style={{padding:14,borderRadius:14,border:`2px solid ${planId===p.id?'#1d4ed8':'#e5e7eb'}`,background:planId===p.id?'#eff6ff':'white',cursor:'pointer',transition:'all .15s'}}>
                    <div style={{fontSize:13,fontWeight:800,color:planId===p.id?'#1d4ed8':'#111827',marginBottom:4}}>{p.label}</div>
                    <div style={{fontSize:11,color:'#9ca3af'}}>{p.desc}</div>
                  </div>
                ))}
              </div>

              {/* Phases */}
              <div style={{background:'#f8fafc',borderRadius:14,padding:18,marginBottom:16}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                  <h4 style={{margin:0,fontSize:13,fontWeight:800,color:'#111827'}}>Phases de paiement</h4>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:13,fontWeight:700,color:totalPct===100?'#16a34a':'#dc2626'}}>
                      Total: {totalPct}% {totalPct!==100&&'⚠️ Doit être 100%'}
                    </span>
                    <button onClick={addPhase} style={{padding:'6px 12px',borderRadius:8,border:'none',background:'#1d4ed8',color:'white',fontWeight:700,fontSize:12,cursor:'pointer'}}>+ Phase</button>
                  </div>
                </div>
                {phases.map((ph,i)=>(
                  <div key={i} style={{display:'flex',gap:10,alignItems:'center',marginBottom:10,background:'white',borderRadius:10,padding:12,border:'1px solid #e5e7eb'}}>
                    <div style={{width:28,height:28,borderRadius:8,background:'#1d4ed8',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:12,fontWeight:900,flexShrink:0}}>{i+1}</div>
                    <input value={ph.label} onChange={e=>updPhase(i,'label',e.target.value)} style={{flex:2,padding:'8px 10px',borderRadius:8,border:'1px solid #e5e7eb',fontSize:13}}/>
                    <div style={{flex:1,display:'flex',alignItems:'center',gap:6}}>
                      <input type="number" min="0" max="100" value={ph.pct} onChange={e=>updPhase(i,'pct',Number(e.target.value))} style={{width:60,padding:'8px 10px',borderRadius:8,border:'1px solid #e5e7eb',fontSize:13,textAlign:'center'}}/>
                      <span style={{fontSize:13,color:'#6b7280'}}>%</span>
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:'#1d4ed8',width:120,textAlign:'right'}}>{fmtN(Math.round(montantN*ph.pct/100))} {devise}</div>
                    {phases.length>1&&<button onClick={()=>delPhase(i)} style={{width:26,height:26,borderRadius:7,border:'1px solid #fecaca',background:'#fef2f2',color:'#dc2626',cursor:'pointer',fontSize:13,flexShrink:0}}>✕</button>}
                  </div>
                ))}
              </div>

              <div style={{display:'flex',gap:10,justifyContent:'space-between'}}>
                <button onClick={()=>setStep(1)} style={{padding:'12px 22px',borderRadius:12,border:'1.5px solid #e5e7eb',background:'white',color:'#6b7280',fontWeight:700,fontSize:14,cursor:'pointer'}}>← Retour</button>
                <button onClick={()=>setStep(3)} disabled={totalPct!==100} style={{padding:'12px 28px',borderRadius:12,border:'none',background:totalPct===100?'#1d4ed8':'#9ca3af',color:'white',fontWeight:800,fontSize:14,cursor:totalPct===100?'pointer':'not-allowed'}}>
                  Suivant — Récapitulatif →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Récap */}
          {step===3 && (
            <div>
              <div style={{background:'#f0fdf4',borderRadius:14,padding:18,border:'1px solid #bbf7d0',marginBottom:20}}>
                <div style={{fontSize:13,fontWeight:700,color:'#16a34a',marginBottom:10}}>✅ Récapitulatif du projet</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  {[
                    {l:'Titre',v:titre},{l:'Client',v:client},
                    {l:'Technicien',v:technicien},{l:'Site',v:site||'—'},
                    {l:'Montant total',v:`${fmtN(montantN)} ${devise}`},
                    {l:'Plan paiement',v:PLANS_PAIEMENT.find(p=>p.id===planId)?.label},
                  ].map(item=>(
                    <div key={item.l} style={{background:'white',borderRadius:9,padding:'10px 12px'}}>
                      <div style={{fontSize:10,color:'#9ca3af',textTransform:'uppercase',letterSpacing:0.4,marginBottom:2}}>{item.l}</div>
                      <div style={{fontSize:13,fontWeight:700,color:'#111827'}}>{item.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{marginBottom:20}}>
                <h4 style={{fontSize:13,fontWeight:800,color:'#111827',marginBottom:10}}>Phases de paiement</h4>
                {phases.map((ph,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',borderRadius:10,background:'#f8fafc',marginBottom:6,border:'1px solid #e5e7eb'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:24,height:24,borderRadius:7,background:'#1d4ed8',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:11,fontWeight:900}}>{i+1}</div>
                      <span style={{fontSize:13,fontWeight:600,color:'#374151'}}>{ph.label}</span>
                    </div>
                    <div style={{display:'flex',gap:12,alignItems:'center'}}>
                      <span style={{fontSize:12,color:'#6b7280'}}>{ph.pct}%</span>
                      <span style={{fontSize:14,fontWeight:800,color:'#1d4ed8'}}>{fmtN(Math.round(montantN*ph.pct/100))} {devise}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{background:'#fff7ed',borderRadius:12,padding:14,border:'1px solid #fed7aa',marginBottom:20}}>
                <div style={{fontSize:12,fontWeight:700,color:'#d97706',marginBottom:4}}>📧 Workflow d'approbation</div>
                <div style={{fontSize:12,color:'#92400e'}}>
                  Après soumission, des emails seront envoyés automatiquement à:<br/>
                  <strong>Finance 1 → Finance 2 → Directeur Général</strong>
                </div>
              </div>

              <div style={{display:'flex',gap:10,justifyContent:'space-between'}}>
                <button onClick={()=>setStep(2)} style={{padding:'12px 22px',borderRadius:12,border:'1.5px solid #e5e7eb',background:'white',color:'#6b7280',fontWeight:700,fontSize:14,cursor:'pointer'}}>← Retour</button>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={handleSave} disabled={saving} style={{padding:'12px 22px',borderRadius:12,border:'none',background:'#6b7280',color:'white',fontWeight:700,fontSize:14,cursor:'pointer'}}>💾 Brouillon</button>
                  <button onClick={handleSave} disabled={saving} style={{padding:'12px 24px',borderRadius:12,border:'none',background:'#16a34a',color:'white',fontWeight:800,fontSize:14,cursor:'pointer'}}>
                    {saving?'Soumission...':'📤 Créer et soumettre'}
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

// ===== MODAL DÉTAIL PROJET =====
const ProjetDetail = ({projet, onClose, onUpdate}) => {
  const [acting, setActing] = useState(false);
  const [commentaire, setCommentaire] = useState('');

  const doAction = async (action) => {
    setActing(true);
    const statusMap = {
      soumettre:'soumis', approuver_f1:'finance2', approuver_f2:'dg',
      approuver_dg:'approuve', rejeter:'rejete', demarrer:'en_cours', terminer:'termine',
    };
    const newStatus = statusMap[action];
    const actionLabels = {
      soumettre:'Soumis', approuver_f1:'Approuvé Finance 1',
      approuver_f2:'Approuvé Finance 2', approuver_dg:'Approuvé DG',
      rejeter:'Rejeté', demarrer:'Démarré', terminer:'Terminé',
    };
    const updated = {
      ...projet,
      status: newStatus,
      historique: [...(projet.historique||[]), {
        action: actionLabels[action],
        par: 'Utilisateur connecté',
        date: new Date().toISOString(),
        commentaire,
      }],
    };
    try { await api.patch(`/projets/${projet.id}`, updated); } catch {}
    onUpdate(updated);
    setActing(false);
    setCommentaire('');
  };

  const payerPhase = (phaseId) => {
    const updated = {
      ...projet,
      phases: projet.phases.map(p => p.id===phaseId ? {...p,status:'paye',datePaiement:new Date().toISOString().split('T')[0],reference:`PAY-${Date.now().toString().slice(-6)}`} : p),
    };
    onUpdate(updated);
  };

  const st = STATUS_WORKFLOW[projet.status] || STATUS_WORKFLOW.brouillon;
  const totalPaye = projet.phases.filter(p=>p.status==='paye').reduce((s,p)=>s+p.montant,0);
  const totalRestant = projet.montantTotal - totalPaye;

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.65)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'white',borderRadius:22,width:'100%',maxWidth:860,maxHeight:'93vh',overflow:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
        <div style={{background:`linear-gradient(135deg,#0f172a,${st.color})`,padding:'22px 28px',borderRadius:'22px 22px 0 0'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
            <div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>{projet.reference}</div>
              <div style={{fontSize:22,fontWeight:900,color:'white',marginBottom:4}}>{projet.titre}</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.6)'}}>👤 {projet.chefProjet} · 🔧 {projet.technicien} · 📡 {projet.site}</div>
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <Badge status={projet.status}/>
              <button onClick={onClose} style={{width:32,height:32,borderRadius:9,background:'rgba(255,255,255,0.15)',border:'none',color:'white',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
          </div>
          <StepBar status={projet.status}/>
        </div>

        <div style={{padding:28}}>
          {/* KPIs montants */}
          <div style={{display:'flex',gap:12,marginBottom:22}}>
            {[
              {l:'Montant total',v:`${fmtN(projet.montantTotal)} ${projet.devise}`,c:'#1d4ed8'},
              {l:'Payé',v:`${fmtN(totalPaye)} ${projet.devise}`,c:'#16a34a'},
              {l:'Restant',v:`${fmtN(totalRestant)} ${projet.devise}`,c:'#d97706'},
              {l:'Progression',v:`${projet.progression}%`,c:'#7c3aed'},
            ].map(k=>(
              <div key={k.l} style={{flex:1,background:'#f8fafc',borderRadius:12,padding:'12px 14px',borderLeft:`3px solid ${k.c}`}}>
                <div style={{fontSize:10,color:'#9ca3af',textTransform:'uppercase',letterSpacing:0.5,marginBottom:3}}>{k.l}</div>
                <div style={{fontSize:16,fontWeight:900,color:k.c}}>{k.v}</div>
              </div>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1.2fr 1fr',gap:18,marginBottom:22}}>
            {/* Phases paiement */}
            <div>
              <h4 style={{fontSize:13,fontWeight:800,color:'#111827',marginBottom:12}}>Phases de paiement</h4>
              {projet.phases.map(ph=>(
                <div key={ph.id} style={{background:'white',borderRadius:14,padding:16,border:`2px solid ${ph.status==='paye'?'#bbf7d0':ph.status==='en_cours'?'#bfdbfe':'#e5e7eb'}`,marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:'#111827'}}>{ph.label}</div>
                      <div style={{fontSize:11,color:'#6b7280'}}>{ph.pct}% du montant total</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:16,fontWeight:900,color:'#1d4ed8'}}>{fmtN(ph.montant)} {projet.devise}</div>
                      <Badge status={ph.status} type="phase"/>
                    </div>
                  </div>
                  {ph.status==='paye'&&(
                    <div style={{fontSize:11,color:'#16a34a',fontWeight:600}}>✓ Payé le {fmtDate(ph.datePaiement)} · Réf: {ph.reference}</div>
                  )}
                  {ph.status==='en_cours'&&projet.status==='approuve'&&(
                    <button onClick={()=>payerPhase(ph.id)} style={{padding:'7px 14px',borderRadius:8,border:'none',background:'#16a34a',color:'white',fontWeight:700,fontSize:12,cursor:'pointer',marginTop:6}}>
                      💳 Marquer comme payé
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Historique */}
            <div>
              <h4 style={{fontSize:13,fontWeight:800,color:'#111827',marginBottom:12}}>Historique du workflow</h4>
              <div style={{background:'#f8fafc',borderRadius:14,padding:16,maxHeight:280,overflow:'auto'}}>
                {projet.historique?.length===0&&<div style={{fontSize:13,color:'#9ca3af',textAlign:'center',padding:20}}>Aucune action encore</div>}
                {projet.historique?.map((h,i)=>(
                  <div key={i} style={{display:'flex',gap:10,marginBottom:12}}>
                    <div style={{width:8,height:8,borderRadius:4,background:'#1d4ed8',flexShrink:0,marginTop:5}}/>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:'#111827'}}>{h.action}</div>
                      <div style={{fontSize:11,color:'#6b7280'}}>par {h.par} · {fmtDateTime(h.date)}</div>
                      {h.commentaire&&<div style={{fontSize:11,color:'#374151',marginTop:2,fontStyle:'italic'}}>"{h.commentaire}"</div>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{marginTop:14}}>
                <textarea value={commentaire} onChange={e=>setCommentaire(e.target.value)} rows={2} placeholder="Commentaire (optionnel)..." style={{width:'100%',padding:'9px 12px',borderRadius:10,border:'1.5px solid #e5e7eb',fontSize:13,resize:'none',boxSizing:'border-box',fontFamily:'inherit',marginBottom:10}}/>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {projet.status==='brouillon'&&<button onClick={()=>doAction('soumettre')} disabled={acting} style={{flex:1,padding:'10px',borderRadius:10,border:'none',background:'#1d4ed8',color:'white',fontWeight:700,fontSize:13,cursor:'pointer'}}>📤 Soumettre</button>}
                  {projet.status==='soumis'&&<button onClick={()=>doAction('approuver_f1')} disabled={acting} style={{flex:1,padding:'10px',borderRadius:10,border:'none',background:'#7c3aed',color:'white',fontWeight:700,fontSize:13,cursor:'pointer'}}>✓ Approuver F1</button>}
                  {projet.status==='finance2'&&<button onClick={()=>doAction('approuver_f2')} disabled={acting} style={{flex:1,padding:'10px',borderRadius:10,border:'none',background:'#9333ea',color:'white',fontWeight:700,fontSize:13,cursor:'pointer'}}>✓ Approuver F2</button>}
                  {projet.status==='dg'&&<button onClick={()=>doAction('approuver_dg')} disabled={acting} style={{flex:1,padding:'10px',borderRadius:10,border:'none',background:'#c2410c',color:'white',fontWeight:700,fontSize:13,cursor:'pointer'}}>👔 DG Approuve</button>}
                  {projet.status==='approuve'&&<button onClick={()=>doAction('demarrer')} disabled={acting} style={{flex:1,padding:'10px',borderRadius:10,border:'none',background:'#0891b2',color:'white',fontWeight:700,fontSize:13,cursor:'pointer'}}>▶ Démarrer</button>}
                  {projet.status==='en_cours'&&<button onClick={()=>doAction('terminer')} disabled={acting} style={{flex:1,padding:'10px',borderRadius:10,border:'none',background:'#059669',color:'white',fontWeight:700,fontSize:13,cursor:'pointer'}}>✓ Terminer</button>}
                  {['soumis','finance2','dg'].includes(projet.status)&&<button onClick={()=>doAction('rejeter')} disabled={acting} style={{padding:'10px 14px',borderRadius:10,border:'none',background:'#dc2626',color:'white',fontWeight:700,fontSize:13,cursor:'pointer'}}>✕ Rejeter</button>}
                </div>
              </div>
            </div>
          </div>

          {/* Infos projet */}
          <div style={{background:'#f8fafc',borderRadius:14,padding:16}}>
            <h4 style={{fontSize:13,fontWeight:800,color:'#111827',marginBottom:12}}>Informations du projet</h4>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
              {[
                {l:'Client',v:projet.client},{l:'Site',v:projet.site||'—'},
                {l:'Début',v:fmtDate(projet.dateDebut)},{l:'Fin prévue',v:fmtDate(projet.dateFin)},
                {l:'Créé le',v:fmtDate(projet.dateCreation)},{l:'Plan paiement',v:PLANS_PAIEMENT.find(p=>p.id===projet.planPaiement)?.label||'—'},
              ].map(item=>(
                <div key={item.l}>
                  <div style={{fontSize:10,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:0.4,marginBottom:2}}>{item.l}</div>
                  <div style={{fontSize:13,fontWeight:600,color:'#374151'}}>{item.v}</div>
                </div>
              ))}
            </div>
            {projet.description&&<div style={{marginTop:12,padding:12,background:'white',borderRadius:10,border:'1px solid #e5e7eb'}}><div style={{fontSize:11,fontWeight:700,color:'#9ca3af',marginBottom:4}}>DESCRIPTION</div><div style={{fontSize:13,color:'#374151'}}>{projet.description}</div></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== COMPOSANT PRINCIPAL =====
const TABS = [
  {id:'dashboard',label:'Tableau de bord',icon:'📊'},
  {id:'projets',label:'Tous les projets',icon:'📁'},
  {id:'workflow',label:'File d\'approbation',icon:'⚡'},
  {id:'paiements',label:'Paiements',icon:'💳'},
];

export default function Projets() {
  const [tab, setTab] = useState('dashboard');
  const [projets, setProjets] = useState(SEED_PROJETS);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');

  const updateProjet = (updated) => {
    setProjets(p => p.map(pr => pr.id===updated.id ? updated : pr));
    setSelected(updated);
  };

  const addProjet = (p) => setProjets(prev => [p, ...prev]);

  const filtered = projets.filter(p => {
    const ms = !search || p.titre.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase()) || p.reference.toLowerCase().includes(search.toLowerCase());
    const mf = filterStatus==='tous' || p.status===filterStatus;
    return ms && mf;
  });

  const enAttente = projets.filter(p => ['soumis','finance2','dg'].includes(p.status));
  const totalMontant = projets.reduce((s,p) => s+p.montantTotal, 0);
  const totalPaye = projets.reduce((s,p) => s+p.phases.filter(ph=>ph.status==='paye').reduce((ss,ph)=>ss+ph.montant,0), 0);

  return (
    <div style={{minHeight:'100vh',background:'#f0f4ff',fontFamily:"'Segoe UI',Arial,sans-serif"}}>
      <div style={{background:'linear-gradient(135deg,#0f172a,#1e3a5f)',borderBottom:'1px solid rgba(255,255,255,.05)'}}>
        <div style={{maxWidth:1400,margin:'0 auto',padding:'20px 28px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div>
              <h1 style={{fontSize:22,fontWeight:900,color:'white',margin:'0 0 4px'}}>📁 Projets & Approvals</h1>
              <p style={{color:'#64748b',margin:0,fontSize:12}}>Workflow Finance 1 → Finance 2 → DG · Paiements multi-phases</p>
            </div>
            <button onClick={()=>setShowNew(true)} style={{padding:'11px 22px',borderRadius:12,border:'none',background:'#1d4ed8',color:'white',fontWeight:800,fontSize:14,cursor:'pointer',boxShadow:'0 4px 12px rgba(29,78,216,0.4)'}}>
              + Nouveau projet
            </button>
          </div>
          <div style={{display:'flex',gap:2}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'9px 16px',borderRadius:'9px 9px 0 0',border:'none',background:tab===t.id?'#f0f4ff':'transparent',color:tab===t.id?'#1d4ed8':'rgba(255,255,255,.5)',fontWeight:tab===t.id?800:500,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap'}}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1400,margin:'0 auto',padding:'24px 28px'}}>

        {/* DASHBOARD */}
        {tab==='dashboard' && (
          <div>
            <div style={{display:'flex',gap:14,marginBottom:24,flexWrap:'wrap'}}>
              {[
                {l:'Total projets',v:projets.length,c:'#1d4ed8',icon:'📁'},
                {l:'En approbation',v:enAttente.length,c:'#d97706',icon:'⏳'},
                {l:'Approuvés',v:projets.filter(p=>['approuve','en_cours','termine'].includes(p.status)).length,c:'#16a34a',icon:'✅'},
                {l:'Montant total',v:`${fmtN(totalMontant)} FCFA`,c:'#7c3aed',icon:'💰'},
                {l:'Total payé',v:`${fmtN(totalPaye)} FCFA`,c:'#059669',icon:'💳'},
                {l:'Rejetés',v:projets.filter(p=>p.status==='rejete').length,c:'#dc2626',icon:'❌'},
              ].map(k=>(
                <div key={k.l} style={{flex:1,minWidth:150,background:'white',borderRadius:14,padding:'16px 18px',borderLeft:`4px solid ${k.c}`,boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                    <span style={{fontSize:11,color:'#9ca3af',textTransform:'uppercase',letterSpacing:0.5}}>{k.l}</span>
                    <span style={{fontSize:18}}>{k.icon}</span>
                  </div>
                  <div style={{fontSize:typeof k.v==='string'?14:26,fontWeight:900,color:k.c}}>{k.v}</div>
                </div>
              ))}
            </div>

            {/* File approbation */}
            {enAttente.length>0&&(
              <div style={{background:'white',borderRadius:16,border:'1px solid #e5e7eb',overflow:'hidden',marginBottom:20,boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                <div style={{padding:'14px 18px',borderBottom:'1px solid #e5e7eb',background:'#fff7ed',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <h3 style={{margin:0,fontSize:14,fontWeight:800,color:'#d97706'}}>⏳ Projets en attente d'approbation ({enAttente.length})</h3>
                </div>
                {enAttente.map((p,i)=>{
                  const st = STATUS_WORKFLOW[p.status];
                  return (
                    <div key={p.id} onClick={()=>setSelected(p)} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 18px',borderBottom:i<enAttente.length-1?'1px solid #f9fafb':'none',cursor:'pointer'}}
                      onMouseEnter={e=>e.currentTarget.style.background='#fff7ed'}
                      onMouseLeave={e=>e.currentTarget.style.background='white'}>
                      <div style={{width:42,height:42,borderRadius:12,background:`${st?.color}12`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>📁</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:'#111827'}}>{p.reference} — {p.titre}</div>
                        <div style={{fontSize:11,color:'#6b7280'}}>👤 {p.chefProjet} · 🏢 {p.client} · {fmtN(p.montantTotal)} FCFA</div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <Badge status={p.status}/>
                        <span style={{fontSize:18,color:'#9ca3af'}}>›</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Projets récents */}
            <div style={{background:'white',borderRadius:16,border:'1px solid #e5e7eb',overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
              <div style={{padding:'14px 18px',borderBottom:'1px solid #e5e7eb',display:'flex',justifyContent:'space-between'}}>
                <h3 style={{margin:0,fontSize:14,fontWeight:800,color:'#111827'}}>Projets récents</h3>
                <button onClick={()=>setTab('projets')} style={{fontSize:12,fontWeight:700,color:'#1d4ed8',background:'none',border:'none',cursor:'pointer'}}>Voir tous →</button>
              </div>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',minWidth:700}}>
                  <thead>
                    <tr style={{background:'#f8fafc'}}>
                      {['Référence','Titre','Client','Montant','Progression','Statut'].map(h=>(
                        <th key={h} style={{padding:'11px 14px',textAlign:'left',fontSize:11,fontWeight:800,color:'#6b7280',textTransform:'uppercase',letterSpacing:0.5,borderBottom:'2px solid #e5e7eb'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {projets.slice(0,5).map((p,i)=>(
                      <tr key={p.id} onClick={()=>setSelected(p)} style={{borderBottom:'1px solid #f3f4f6',cursor:'pointer',background:i%2===0?'white':'#fafbfc'}}
                        onMouseEnter={e=>e.currentTarget.style.background='#eff6ff'}
                        onMouseLeave={e=>e.currentTarget.style.background=i%2===0?'white':'#fafbfc'}>
                        <td style={{padding:'12px 14px',fontSize:12,fontWeight:700,color:'#1d4ed8',fontFamily:'monospace'}}>{p.reference}</td>
                        <td style={{padding:'12px 14px',fontSize:13,fontWeight:600,color:'#111827',maxWidth:200}}><div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.titre}</div></td>
                        <td style={{padding:'12px 14px',fontSize:13,color:'#374151'}}>{p.client}</td>
                        <td style={{padding:'12px 14px',fontSize:13,fontWeight:700,color:'#374151'}}>{fmtN(p.montantTotal)}</td>
                        <td style={{padding:'12px 14px'}}>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <div style={{flex:1,height:6,background:'#f3f4f6',borderRadius:3,overflow:'hidden'}}>
                              <div style={{width:`${p.progression}%`,height:'100%',background:'#1d4ed8',borderRadius:3}}/>
                            </div>
                            <span style={{fontSize:11,fontWeight:700,color:'#374151',whiteSpace:'nowrap'}}>{p.progression}%</span>
                          </div>
                        </td>
                        <td style={{padding:'12px 14px'}}><Badge status={p.status}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TOUS LES PROJETS */}
        {tab==='projets' && (
          <div>
            <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
              <div style={{flex:1,minWidth:240,display:'flex',alignItems:'center',gap:8,background:'white',borderRadius:11,padding:'9px 13px',border:'1px solid #e5e7eb'}}>
                <span style={{color:'#9ca3af'}}>🔍</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Titre, client, référence..." style={{flex:1,border:'none',outline:'none',fontSize:13}}/>
              </div>
              <div style={{display:'flex',gap:5,background:'white',borderRadius:11,padding:3,border:'1px solid #e5e7eb',flexWrap:'wrap'}}>
                {['tous',...Object.keys(STATUS_WORKFLOW)].map(s=>(
                  <button key={s} onClick={()=>setFilterStatus(s)} style={{padding:'6px 11px',borderRadius:9,border:'none',background:filterStatus===s?'#1d4ed8':'transparent',color:filterStatus===s?'white':'#6b7280',fontWeight:700,fontSize:11,cursor:'pointer',whiteSpace:'nowrap'}}>
                    {s==='tous'?'Tous':STATUS_WORKFLOW[s]?.label}
                  </button>
                ))}
              </div>
              <button onClick={()=>setShowNew(true)} style={{padding:'10px 18px',borderRadius:11,border:'none',background:'#1d4ed8',color:'white',fontWeight:800,fontSize:13,cursor:'pointer'}}>+ Nouveau</button>
            </div>

            <div style={{background:'white',borderRadius:16,border:'1px solid #e5e7eb',overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',minWidth:900}}>
                  <thead>
                    <tr style={{background:'#f8fafc',borderBottom:'2px solid #e5e7eb'}}>
                      {['Référence','Titre','Client','Technicien','Montant total','Payé','Progression','Statut','Actions'].map(h=>(
                        <th key={h} style={{padding:'12px 14px',textAlign:'left',fontSize:11,fontWeight:800,color:'#6b7280',textTransform:'uppercase',letterSpacing:0.5,whiteSpace:'nowrap'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p,i)=>{
                      const payeTotal = p.phases.filter(ph=>ph.status==='paye').reduce((s,ph)=>s+ph.montant,0);
                      return (
                        <tr key={p.id} style={{borderBottom:'1px solid #f3f4f6',background:i%2===0?'white':'#fafbfc'}}
                          onMouseEnter={e=>e.currentTarget.style.background='#eff6ff'}
                          onMouseLeave={e=>e.currentTarget.style.background=i%2===0?'white':'#fafbfc'}>
                          <td style={{padding:'12px 14px',fontSize:12,fontWeight:700,color:'#1d4ed8',fontFamily:'monospace'}}>{p.reference}</td>
                          <td style={{padding:'12px 14px',fontSize:13,fontWeight:600,color:'#111827',maxWidth:180}}><div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.titre}</div></td>
                          <td style={{padding:'12px 14px',fontSize:12,color:'#374151'}}>{p.client}</td>
                          <td style={{padding:'12px 14px',fontSize:12,color:'#374151'}}>{p.technicien}</td>
                          <td style={{padding:'12px 14px',fontSize:13,fontWeight:700}}>{fmtN(p.montantTotal)}</td>
                          <td style={{padding:'12px 14px',fontSize:13,fontWeight:700,color:'#16a34a'}}>{fmtN(payeTotal)}</td>
                          <td style={{padding:'12px 14px',minWidth:120}}>
                            <div style={{display:'flex',alignItems:'center',gap:6}}>
                              <div style={{flex:1,height:5,background:'#f3f4f6',borderRadius:3,overflow:'hidden'}}>
                                <div style={{width:`${p.progression}%`,height:'100%',background:'#1d4ed8',borderRadius:3}}/>
                              </div>
                              <span style={{fontSize:10,fontWeight:700,color:'#374151'}}>{p.progression}%</span>
                            </div>
                          </td>
                          <td style={{padding:'12px 14px'}}><Badge status={p.status}/></td>
                          <td style={{padding:'12px 14px'}}>
                            <button onClick={()=>setSelected(p)} style={{padding:'6px 12px',borderRadius:8,border:'1px solid #e5e7eb',background:'white',color:'#374151',fontWeight:700,fontSize:12,cursor:'pointer'}}>👁 Voir</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filtered.length===0&&<div style={{padding:40,textAlign:'center',color:'#9ca3af'}}><div style={{fontSize:36,marginBottom:8}}>📁</div><div>Aucun projet trouvé</div></div>}
              </div>
            </div>
          </div>
        )}

        {/* FILE APPROBATION */}
        {tab==='workflow' && (
          <div>
            {['soumis','finance2','dg'].map(statusKey=>{
              const groupe = projets.filter(p=>p.status===statusKey);
              const st = STATUS_WORKFLOW[statusKey];
              return (
                <div key={statusKey} style={{marginBottom:20}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                    <div style={{width:10,height:10,borderRadius:5,background:st.color}}/>
                    <h3 style={{margin:0,fontSize:14,fontWeight:800,color:st.color}}>{st.label} ({groupe.length})</h3>
                  </div>
                  {groupe.length===0&&<div style={{padding:'14px 18px',background:'white',borderRadius:12,border:'1px solid #e5e7eb',color:'#9ca3af',fontSize:13}}>Aucun projet à ce stade</div>}
                  {groupe.map(p=>(
                    <div key={p.id} onClick={()=>setSelected(p)} style={{background:'white',borderRadius:14,padding:'16px 18px',border:`2px solid ${st.color}20`,marginBottom:8,cursor:'pointer',display:'flex',alignItems:'center',gap:14,boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor=st.color}
                      onMouseLeave={e=>e.currentTarget.style.borderColor=`${st.color}20`}>
                      <div style={{width:44,height:44,borderRadius:13,background:`${st.color}12`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>📁</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:'#111827'}}>{p.reference} — {p.titre}</div>
                        <div style={{fontSize:11,color:'#6b7280',marginTop:3'}}>👤 {p.chefProjet} · 🏢 {p.client} · 💰 {fmtN(p.montantTotal)} FCFA</div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:12,color:'#9ca3af'}}>Créé le {fmtDate(p.dateCreation)}</div>
                        <div style={{fontSize:13,fontWeight:700,color:st.color,marginTop:3}}>Action requise →</div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* PAIEMENTS */}
        {tab==='paiements' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:16}}>
              {projets.filter(p=>p.phases.some(ph=>ph.status!=='attente')).map(p=>(
                <div key={p.id} style={{background:'white',borderRadius:16,overflow:'hidden',border:'1px solid #e5e7eb',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                  <div style={{padding:'14px 16px',borderBottom:'1px solid #e5e7eb',background:'#f8fafc'}}>
                    <div style={{fontSize:11,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',letterSpacing:0.5,marginBottom:3}}>{p.reference}</div>
                    <div style={{fontSize:14,fontWeight:800,color:'#111827'}}>{p.titre}</div>
                    <div style={{fontSize:12,color:'#6b7280',marginTop:2}}>{p.client} · {fmtN(p.montantTotal)} FCFA</div>
                  </div>
                  <div style={{padding:14}}>
                    {p.phases.map(ph=>(
                      <div key={ph.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:'1px solid #f9fafb'}}>
                        <div>
                          <div style={{fontSize:12,fontWeight:600,color:'#374151'}}>{ph.label}</div>
                          <div style={{fontSize:10,color:'#9ca3af'}}>{ph.pct}% — {fmtN(ph.montant)} FCFA</div>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <span style={{padding:'3px 8px',borderRadius:8,background:STATUS_PHASE[ph.status]?.bg,color:STATUS_PHASE[ph.status]?.color,fontSize:10,fontWeight:700}}>{STATUS_PHASE[ph.status]?.label}</span>
                          {ph.datePaiement&&<div style={{fontSize:9,color:'#9ca3af',marginTop:2'}}>{fmtDate(ph.datePaiement)}</div>}
                        </div>
                      </div>
                    ))}
                    <div style={{marginTop:10}}>
                      <div style={{height:6,background:'#f3f4f6',borderRadius:3,overflow:'hidden'}}>
                        <div style={{width:`${p.phases.filter(ph=>ph.status==='paye').reduce((s,ph)=>s+ph.pct,0)}%`,height:'100%',background:'#16a34a',borderRadius:3}}/>
                      </div>
                      <div style={{fontSize:10,color:'#9ca3af',marginTop:4,textAlign:'right'}}>
                        {p.phases.filter(ph=>ph.status==='paye').reduce((s,ph)=>s+ph.pct,0)}% payé
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selected&&<ProjetDetail projet={selected} onClose={()=>setSelected(null)} onUpdate={updateProjet}/>}
      {showNew&&<NouveauProjetModal onClose={()=>setShowNew(false)} onSave={addProjet}/>}
    </div>
  );
}
