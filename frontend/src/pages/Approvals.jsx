import { useState } from 'react';
import { api } from '../utils/api';
import { Avatar, StatusBadge, ApproversTimeline, ApprovalCard, Field, FluentInput, FluentSelect, FluentTextarea, FluentBtn, STATUS_STYLES, APPROVERS } from '../components/ApprovalsDesign';

const fmtN = n => new Intl.NumberFormat('fr-FR').format(Math.round(n||0));
const fmtD = d => d ? new Date(d).toLocaleDateString('fr-FR', {day:'2-digit',month:'short',year:'numeric'}) : '—';
const fmtDT = d => d ? new Date(d).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'}) : '—';

const TYPES_DEMANDES = [
  { id:'payment_request',  label:'Demande de paiement',  color:'#0078d4', icon:'💳', desc:'Paiement fournisseur ou prestataire', withSite:true },
  { id:'purchase_request', label:'Demande d\'achat',     color:'#ca5010', icon:'🛒', desc:'Achat matériel ou équipement', withSite:true },
  { id:'expense_report',   label:'Note de frais',         color:'#d13438', icon:'🧾', desc:'Remboursement frais professionnels', withSite:false },
  { id:'leave_request',    label:'Demande de congé',      color:'#107c10', icon:'🏖', desc:'Congé annuel ou exceptionnel', withSite:false },
  { id:'advance_request',  label:'Avance sur salaire',    color:'#5c2d91', icon:'💰', desc:'Avance sur salaire mensuel', withSite:false },
  { id:'mission_request',  label:'Ordre de mission',      color:'#008575', icon:'✈️', desc:'Déplacement professionnel', withSite:true },
  { id:'training_request', label:'Demande de formation',  color:'#8764b8', icon:'📚', desc:'Formation ou certification métier', withSite:false },
  { id:'equipment_request',label:'Demande matériel',      color:'#004e8c', icon:'🔧', desc:'Attribution équipement terrain', withSite:true },
];

const MODES_PAIEMENT = ['Virement bancaire','Mobile Money MTN','Mobile Money Orange','Chèque','Espèces','Virement international'];
const BANQUES = ['BICEC','Société Générale Cameroun','Afriland First Bank','UBA Cameroun','Ecobank','BGFI Bank'];
const SITES = ['DLA-001','DLA-003','YDE-001','KRI-001','GAR-001','LIM-001','Bureau principal'];

const getType = id => TYPES_DEMANDES.find(t => t.id===id);

const SEED = [
  { id:'1', reference:'APV-2024-001', type:'payment_request', title:'Paiement sous-traitant Thomas Ngono — DLA-001 Phase 2', amount:18000000, currency:'FCFA', status:'review_2', priority:'haute', submittedBy:'Marie Kamga', submittedAt:'2024-02-01T09:00:00', beneficiaryName:'Thomas Ngono', beneficiaryBank:'BICEC', beneficiaryAccount:'CM21 1001 2345 6789', justification:'Paiement phase 2 projet DLA-001 (40%). Travaux validés par le chef de projet.', site:'DLA-001', project:'PROJ-2024-001', history:[{action:'Soumis',by:'Marie Kamga',at:'2024-02-01T09:00:00',comment:''},{action:'Approuvé Finance 1',by:'Alice Finance',at:'2024-02-02T14:00:00',comment:'Budget disponible'}] },
  { id:'2', reference:'APV-2024-002', type:'purchase_request', title:'Achat câbles fibre optique — Site YDE-001', amount:3500000, currency:'FCFA', status:'pending_boss', priority:'normale', submittedBy:'Pierre Etoga', submittedAt:'2024-02-05T11:00:00', beneficiaryName:'Tech Africa', beneficiaryBank:'SGC', beneficiaryAccount:'CM21 2001 9876 5432', justification:'Câbles requis pour finalisation réseau fibre YDE-001.', site:'YDE-001', project:'PROJ-2024-002', history:[{action:'Soumis',by:'Pierre Etoga',at:'2024-02-05T11:00:00',comment:''},{action:'Approuvé Finance 1',by:'Alice Finance',at:'2024-02-06T09:00:00',comment:''},{action:'Approuvé Finance 2',by:'Bob Finance',at:'2024-02-07T10:00:00',comment:'Conforme budget'}] },
  { id:'3', reference:'APV-2024-003', type:'expense_report', title:'Note de frais mission Garoua — Ali Moussa', amount:285000, currency:'FCFA', status:'approved', priority:'basse', submittedBy:'Ali Moussa', submittedAt:'2024-01-28T08:00:00', beneficiaryName:'Ali Moussa', beneficiaryBank:'Afriland', beneficiaryAccount:'CM21 3001 1111 2222', justification:'Per diem 3 jours + transport Douala-Garoua aller-retour.', site:'', project:'', history:[{action:'Soumis',by:'Ali Moussa',at:'2024-01-28T08:00:00',comment:''},{action:'Approuvé Finance 1',by:'Alice Finance',at:'2024-01-29T09:00:00',comment:''},{action:'Approuvé Finance 2',by:'Bob Finance',at:'2024-01-30T10:00:00',comment:''},{action:'Approuvé DG',by:'Jérôme Bell',at:'2024-01-31T08:00:00',comment:'OK'}] },
  { id:'4', reference:'APV-2024-004', type:'leave_request', title:'Congé annuel — Samuel Djomo — 15 jours', amount:0, currency:'FCFA', status:'submitted', priority:'normale', submittedBy:'Samuel Djomo', submittedAt:'2024-02-10T10:00:00', beneficiaryName:'Samuel Djomo', beneficiaryBank:'', beneficiaryAccount:'', justification:'Congé annuel du 01/03/2024 au 15/03/2024. Remplacement assuré par Jean Mbarga.', site:'', project:'', history:[{action:'Soumis',by:'Samuel Djomo',at:'2024-02-10T10:00:00',comment:''}] },
  { id:'5', reference:'APV-2024-005', type:'advance_request', title:'Avance sur salaire — Jean Mbarga — Février 2024', amount:150000, currency:'FCFA', status:'draft', priority:'haute', submittedBy:'Jean Mbarga', submittedAt:'2024-02-12T09:00:00', beneficiaryName:'Jean Mbarga', beneficiaryBank:'BICEC', beneficiaryAccount:'CM21 1001 8888 7777', justification:'Avance 50% salaire pour urgence médicale familiale.', site:'', project:'', history:[] },
  { id:'6', reference:'APV-2024-006', type:'mission_request', title:'Ordre de mission — Kribi Port — Thomas Ngono', amount:420000, currency:'FCFA', status:'paid', priority:'haute', submittedBy:'Marie Kamga', submittedAt:'2024-01-15T08:00:00', beneficiaryName:'Thomas Ngono', beneficiaryBank:'MTN Money', beneficiaryAccount:'677000001', justification:'Mission technique KRI-001. Transport + hébergement 5 jours.', site:'KRI-001', project:'PROJ-2024-001', history:[{action:'Soumis',by:'Marie Kamga',at:'2024-01-15T08:00:00',comment:''},{action:'Approuvé Finance 1',by:'Alice Finance',at:'2024-01-16T09:00:00',comment:''},{action:'Approuvé Finance 2',by:'Bob Finance',at:'2024-01-17T10:00:00',comment:''},{action:'Approuvé DG',by:'Jérôme Bell',at:'2024-01-18T08:00:00',comment:''},{action:'Payé',by:'Alice Finance',at:'2024-01-19T09:00:00',comment:'Virement effectué'}] },
];

// ===== MODAL NOUVELLE DEMANDE =====
const NouvelleDemandeModal = ({ onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [type, setType] = useState('');
  const [form, setForm] = useState({ title:'', amount:'', currency:'FCFA', priority:'normale', justification:'', site:'', project:'', beneficiaryName:'', beneficiaryBank:'', beneficiaryAccount:'', beneficiaryMobile:'', beneficiaryEmail:'', dateDebut:'', dateFin:'', destination:'', transportMode:'' });
  const [saving, setSaving] = useState(false);
  const upd = (k,v) => setForm(p=>({...p,[k]:v}));
  const t = getType(type);
  const needsAmount = ['payment_request','purchase_request','expense_report','advance_request','mission_request'].includes(type);
  const needsBenef = ['payment_request','purchase_request','advance_request','mission_request'].includes(type);
  const needsDates = ['leave_request','mission_request','training_request'].includes(type);
  const withSite = t?.withSite;

  const handleSave = async (submit) => {
    if (!type||!form.title) { alert('Type et titre obligatoires'); return; }
    setSaving(true);
    const item = { id:Date.now().toString(), reference:`APV-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900+100))}`, type, ...form, amount:Number(form.amount)||0, status:submit?'submitted':'draft', submittedBy:'Utilisateur connecté', submittedAt:new Date().toISOString(), history:submit?[{action:'Soumis',by:'Utilisateur connecté',at:new Date().toISOString(),comment:''}]:[] };
    try { await api.post('/approvals', item); } catch {}
    onSave(item); setSaving(false); onClose();
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'white',borderRadius:4,width:'100%',maxWidth:640,maxHeight:'92vh',overflow:'auto',boxShadow:'0 16px 48px rgba(0,0,0,0.22)',fontFamily:'Segoe UI,Arial,sans-serif'}}>

        {/* Header style Fluent */}
        <div style={{background:t?.color||'#0078d4',padding:'20px 24px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.7)',textTransform:'uppercase',letterSpacing:1,marginBottom:3}}>
              Étape {step} sur 3 — {step===1?'Type de demande':step===2?'Détails':'Bénéficiaire'}
            </div>
            <div style={{fontSize:18,fontWeight:600,color:'white'}}>{t?.label||'Nouvelle demande'}</div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            {/* Steps dots */}
            <div style={{display:'flex',gap:5}}>
              {[1,2,3].map(s=><div key={s} style={{width:s<=step?20:8,height:8,borderRadius:4,background:s<=step?'white':'rgba(255,255,255,0.3)',transition:'width .2s'}}/>)}
            </div>
            <button onClick={onClose} style={{width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,0.2)',border:'none',color:'white',cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
          </div>
        </div>

        <div style={{padding:24}}>

          {/* STEP 1 — Choisir type */}
          {step===1&&(
            <div>
              <p style={{fontSize:13,color:'#605e5c',marginBottom:16,marginTop:0}}>Sélectionnez le type de demande :</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:20}}>
                {TYPES_DEMANDES.map(td=>(
                  <div key={td.id} onClick={()=>setType(td.id)} style={{padding:14,borderRadius:4,border:`2px solid ${type===td.id?td.color:'#e8eaed'}`,background:type===td.id?`${td.color}08`:'white',cursor:'pointer',transition:'all .1s',display:'flex',gap:10,alignItems:'center'}}
                    onMouseEnter={e=>{if(type!==td.id)e.currentTarget.style.borderColor='#a19f9d'}}
                    onMouseLeave={e=>{if(type!==td.id)e.currentTarget.style.borderColor='#e8eaed'}}>
                    <span style={{fontSize:22}}>{td.icon}</span>
                    <div>
                      <div style={{fontSize:13,fontWeight:type===td.id?700:500,color:type===td.id?td.color:'#1f2937'}}>{td.label}</div>
                      <div style={{fontSize:11,color:'#a19f9d',marginTop:1}}>{td.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',gap:8,paddingTop:16,borderTop:'1px solid #f3f4f6'}}>
                <FluentBtn label="Annuler" onClick={onClose} ghost color="#605e5c"/>
                <FluentBtn label="Suivant →" onClick={()=>type&&setStep(2)} disabled={!type} color={t?.color||'#0078d4'}/>
              </div>
            </div>
          )}

          {/* STEP 2 — Détails */}
          {step===2&&(
            <div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
                <div style={{gridColumn:'1/-1'}}>
                  <Field label="Titre de la demande" required>
                    <FluentInput value={form.title} onChange={v=>upd('title',v)} placeholder={`Ex: ${t?.desc}`}/>
                  </Field>
                </div>
                <Field label="Priorité">
                  <FluentSelect value={form.priority} onChange={v=>upd('priority',v)} options={[{v:'haute',l:'🔴 Haute'},{v:'normale',l:'🟡 Normale'},{v:'basse',l:'🟢 Basse'}]}/>
                </Field>
                {needsAmount&&(
                  <>
                    <Field label="Montant" required>
                      <FluentInput type="number" value={form.amount} onChange={v=>upd('amount',v)} placeholder="0"/>
                    </Field>
                    <Field label="Devise">
                      <FluentSelect value={form.currency} onChange={v=>upd('currency',v)} options={['FCFA','USD','EUR','CNY']}/>
                    </Field>
                  </>
                )}
                {needsDates&&(
                  <>
                    <Field label="Date début">
                      <FluentInput type="date" value={form.dateDebut} onChange={v=>upd('dateDebut',v)}/>
                    </Field>
                    <Field label="Date fin">
                      <FluentInput type="date" value={form.dateFin} onChange={v=>upd('dateFin',v)}/>
                    </Field>
                  </>
                )}
                {type==='mission_request'&&(
                  <>
                    <Field label="Destination">
                      <FluentInput value={form.destination} onChange={v=>upd('destination',v)} placeholder="Ex: Garoua — Site GAR-001"/>
                    </Field>
                    <Field label="Mode de transport">
                      <FluentSelect value={form.transportMode} onChange={v=>upd('transportMode',v)} options={['Véhicule société','Avion','Bus','Taxi','Véhicule personnel']}/>
                    </Field>
                  </>
                )}
                {withSite&&(
                  <>
                    <Field label="Site concerné">
                      <FluentSelect value={form.site} onChange={v=>upd('site',v)} options={SITES} placeholder="Sélectionner un site"/>
                    </Field>
                    <Field label="Projet lié">
                      <FluentInput value={form.project} onChange={v=>upd('project',v)} placeholder="Ex: PROJ-2024-001"/>
                    </Field>
                  </>
                )}
                <div style={{gridColumn:'1/-1'}}>
                  <Field label="Justification" required>
                    <FluentTextarea value={form.justification} onChange={v=>upd('justification',v)} placeholder="Expliquez la raison et le contexte de cette demande..." rows={4}/>
                  </Field>
                </div>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',gap:8,paddingTop:16,borderTop:'1px solid #f3f4f6'}}>
                <FluentBtn label="← Retour" onClick={()=>setStep(1)} ghost color="#605e5c"/>
                <FluentBtn label="Suivant →" onClick={()=>setStep(3)} color={t?.color||'#0078d4'}/>
              </div>
            </div>
          )}

          {/* STEP 3 — Bénéficiaire */}
          {step===3&&(
            <div>
              {needsBenef&&(
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:12,fontWeight:600,color:'#323130',marginBottom:14,textTransform:'uppercase',letterSpacing:0.5}}>Informations du bénéficiaire</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
                    <Field label="Nom complet" required><FluentInput value={form.beneficiaryName} onChange={v=>upd('beneficiaryName',v)} placeholder="Prénom Nom"/></Field>
                    <Field label="Email"><FluentInput type="email" value={form.beneficiaryEmail} onChange={v=>upd('beneficiaryEmail',v)} placeholder="email@exemple.cm"/></Field>
                    <Field label="Banque"><FluentSelect value={form.beneficiaryBank} onChange={v=>upd('beneficiaryBank',v)} options={BANQUES} placeholder="Sélectionner"/></Field>
                    <Field label="Numéro de compte"><FluentInput value={form.beneficiaryAccount} onChange={v=>upd('beneficiaryAccount',v)} placeholder="CM21 XXXX XXXX XXXX"/></Field>
                    <Field label="Mobile Money (optionnel)"><FluentInput value={form.beneficiaryMobile} onChange={v=>upd('beneficiaryMobile',v)} placeholder="6XX XXX XXX"/></Field>
                  </div>
                  <div style={{height:1,background:'#f3f4f6',margin:'18px 0'}}/>
                </div>
              )}

              {/* Récap */}
              <div style={{background:'#f3f4f8',borderRadius:4,padding:16,marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:600,color:'#323130',marginBottom:10}}>Récapitulatif</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {[
                    {l:'Type',v:t?.label},{l:'Titre',v:form.title||'—'},
                    {l:'Priorité',v:form.priority},
                    ...(needsAmount?[{l:'Montant',v:`${fmtN(Number(form.amount)||0)} ${form.currency}`}]:[]),
                    ...(needsBenef&&form.beneficiaryName?[{l:'Bénéficiaire',v:form.beneficiaryName}]:[]),
                    ...(withSite&&form.site?[{l:'Site',v:form.site}]:[]),
                  ].map(item=>(
                    <div key={item.l}>
                      <div style={{fontSize:10,color:'#a19f9d',textTransform:'uppercase',letterSpacing:0.4,marginBottom:1}}>{item.l}</div>
                      <div style={{fontSize:13,fontWeight:500,color:'#1f2937'}}>{item.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info workflow */}
              <div style={{display:'flex',gap:10,alignItems:'flex-start',padding:'10px 12px',background:'#deecf9',borderRadius:4,marginBottom:16,border:'1px solid #b3d5f0'}}>
                <span style={{fontSize:16}}>📧</span>
                <div style={{fontSize:12,color:'#004e8c'}}>
                  Après soumission, des notifications seront envoyées automatiquement à <strong>Finance 1 → Finance 2 → Direction Générale</strong>.
                </div>
              </div>

              <div style={{display:'flex',justifyContent:'space-between',gap:8,paddingTop:16,borderTop:'1px solid #f3f4f6'}}>
                <FluentBtn label="← Retour" onClick={()=>setStep(2)} ghost color="#605e5c"/>
                <div style={{display:'flex',gap:8}}>
                  <FluentBtn label="Enregistrer brouillon" onClick={()=>handleSave(false)} disabled={saving} ghost color="#0078d4" icon="💾"/>
                  <FluentBtn label={saving?'Envoi...':'Soumettre'} onClick={()=>handleSave(true)} disabled={saving} color={t?.color||'#0078d4'} icon="📤"/>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== PANEL DÉTAIL =====
const DetailPanel = ({ item, onClose, onUpdate }) => {
  const [comment, setComment] = useState('');
  const [acting, setActing] = useState(false);
  const t = getType(item.type);
  const wf = STATUS_STYLES[item.status] || STATUS_STYLES.draft;
  const avatarColors = ['#0078d4','#107c10','#5c2d91','#ca5010','#d13438'];
  const avatarColor = avatarColors[item.submittedBy?.charCodeAt(0)%avatarColors.length]||'#0078d4';

  const doAction = async (action) => {
    setActing(true);
    const statusMap = { submit:'submitted', approve_f1:'review_2', approve_f2:'pending_boss', approve_dg:'approved', pay:'paid', reject:'rejected' };
    const labelMap = { submit:'Soumis', approve_f1:'Approuvé Finance 1', approve_f2:'Approuvé Finance 2', approve_dg:'Approuvé Direction', pay:'Payé', reject:'Rejeté' };
    const updated = { ...item, status:statusMap[action], history:[...(item.history||[]),{action:labelMap[action],by:'Utilisateur connecté',at:new Date().toISOString(),comment}] };
    try { await api.patch(`/approvals/${item.id}`, updated); } catch {}
    onUpdate(updated); setComment(''); setActing(false);
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:'Segoe UI,Arial,sans-serif'}}>
      <div style={{background:'white',borderRadius:4,width:'100%',maxWidth:880,maxHeight:'93vh',overflow:'auto',boxShadow:'0 16px 48px rgba(0,0,0,0.22)'}}>

        {/* Header */}
        <div style={{background:t?.color||'#0078d4',padding:'20px 28px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
            <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
              <Avatar name={item.submittedBy} color={avatarColor} size={44}/>
              <div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.7)',marginBottom:4}}>{item.reference} · {t?.label}</div>
                <div style={{fontSize:18,fontWeight:600,color:'white',marginBottom:4}}>{item.title}</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.8)'}}>Soumis par <strong>{item.submittedBy}</strong> · {fmtDT(item.submittedAt)}</div>
              </div>
            </div>
            <button onClick={onClose} style={{width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,0.2)',border:'none',color:'white',cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
          </div>
          {/* Timeline approbateurs */}
          <ApproversTimeline currentStatus={item.status}/>
        </div>

        <div style={{padding:28,display:'grid',gridTemplateColumns:'1.1fr 1fr',gap:24}}>

          {/* Colonne gauche */}
          <div>
            {/* Montant */}
            {item.amount>0&&(
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 18px',background:'#f3f4f8',borderRadius:4,marginBottom:18,border:'1px solid #e8eaed'}}>
                <div>
                  <div style={{fontSize:11,color:'#a19f9d',textTransform:'uppercase',letterSpacing:0.5,marginBottom:2}}>Montant demandé</div>
                  <div style={{fontSize:22,fontWeight:700,color:'#0078d4'}}>{fmtN(item.amount)} {item.currency}</div>
                </div>
                <span style={{fontSize:32}}>{t?.icon}</span>
              </div>
            )}

            {/* Infos */}
            <div style={{marginBottom:18}}>
              <div style={{fontSize:11,fontWeight:700,color:'#a19f9d',textTransform:'uppercase',letterSpacing:0.5,marginBottom:10}}>Informations</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:0}}>
                {[
                  {l:'Type',v:t?.label||item.type},
                  {l:'Priorité',v:item.priority},
                  ...(item.site?[{l:'Site',v:item.site}]:[]),
                  ...(item.project?[{l:'Projet',v:item.project}]:[]),
                  ...(item.dateDebut?[{l:'Dates',v:`${fmtD(item.dateDebut)} → ${fmtD(item.dateFin)}`}]:[]),
                  ...(item.destination?[{l:'Destination',v:item.destination}]:[]),
                ].map((info,i)=>(
                  <div key={info.l} style={{padding:'10px 12px',background:i%2===0?'#fafafa':'white',borderBottom:'1px solid #f3f4f6'}}>
                    <div style={{fontSize:10,color:'#a19f9d',textTransform:'uppercase',letterSpacing:0.4,marginBottom:1}}>{info.l}</div>
                    <div style={{fontSize:13,fontWeight:500,color:'#1f2937'}}>{info.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Justification */}
            <div style={{marginBottom:18}}>
              <div style={{fontSize:11,fontWeight:700,color:'#a19f9d',textTransform:'uppercase',letterSpacing:0.5,marginBottom:8}}>Justification</div>
              <div style={{padding:'12px 14px',background:'#fafafa',borderRadius:4,border:'1px solid #e8eaed',fontSize:13,color:'#374151',lineHeight:1.6}}>{item.justification||'—'}</div>
            </div>

            {/* Bénéficiaire */}
            {item.beneficiaryName&&(
              <div>
                <div style={{fontSize:11,fontWeight:700,color:'#a19f9d',textTransform:'uppercase',letterSpacing:0.5,marginBottom:10}}>Bénéficiaire</div>
                <div style={{border:'1px solid #e8eaed',borderRadius:4,overflow:'hidden'}}>
                  {[
                    {l:'Nom',v:item.beneficiaryName},
                    ...(item.beneficiaryEmail?[{l:'Email',v:item.beneficiaryEmail}]:[]),
                    ...(item.beneficiaryBank?[{l:'Banque',v:item.beneficiaryBank}]:[]),
                    ...(item.beneficiaryAccount?[{l:'Compte',v:item.beneficiaryAccount}]:[]),
                    ...(item.beneficiaryMobile?[{l:'Mobile Money',v:item.beneficiaryMobile}]:[]),
                  ].map((info,i)=>(
                    <div key={info.l} style={{display:'flex',justifyContent:'space-between',padding:'9px 12px',background:i%2===0?'#fafafa':'white',borderBottom:i<4?'1px solid #f3f4f6':'none'}}>
                      <span style={{fontSize:12,color:'#a19f9d'}}>{info.l}</span>
                      <span style={{fontSize:12,fontWeight:600,color:'#1f2937',fontFamily:info.l==='Compte'?'monospace':'inherit'}}>{info.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Colonne droite — Historique + Actions */}
          <div>
            {/* Historique */}
            <div style={{marginBottom:18}}>
              <div style={{fontSize:11,fontWeight:700,color:'#a19f9d',textTransform:'uppercase',letterSpacing:0.5,marginBottom:12}}>Historique du workflow</div>
              <div style={{position:'relative'}}>
                {(!item.history||item.history.length===0)&&(
                  <div style={{padding:16,textAlign:'center',color:'#a19f9d',fontSize:13,background:'#fafafa',borderRadius:4,border:'1px solid #e8eaed'}}>Aucune action enregistrée</div>
                )}
                {item.history?.map((h,i)=>(
                  <div key={i} style={{display:'flex',gap:12,marginBottom:12}}>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0}}>
                      <div style={{width:30,height:30,borderRadius:'50%',background:'#0078d4',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:12,fontWeight:700}}>✓</div>
                      {i<item.history.length-1&&<div style={{width:1,flex:1,background:'#e8eaed',margin:'3px 0'}}/>}
                    </div>
                    <div style={{paddingBottom:12,flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:'#1f2937'}}>{h.action}</div>
                      <div style={{fontSize:11,color:'#a19f9d',marginTop:1}}>par {h.by} · {fmtDT(h.at)}</div>
                      {h.comment&&<div style={{fontSize:11,color:'#4b5563',fontStyle:'italic',marginTop:3,padding:'4px 8px',background:'#f3f4f8',borderRadius:3}}>"{h.comment}"</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Zone actions */}
            <div style={{background:'#f3f4f8',borderRadius:4,padding:16,border:'1px solid #e8eaed'}}>
              <div style={{fontSize:11,fontWeight:700,color:'#a19f9d',textTransform:'uppercase',letterSpacing:0.5,marginBottom:10}}>Votre décision</div>
              <FluentTextarea value={comment} onChange={setComment} placeholder="Commentaire ou motif (optionnel)..." rows={2}/>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>
                {item.status==='draft'&&<FluentBtn label="Soumettre pour approbation" onClick={()=>doAction('submit')} disabled={acting} color="'#0078d4'" icon="📤"/>}
                {item.status==='submitted'&&<FluentBtn label="Approuver (Finance 1)" onClick={()=>doAction('approve_f1')} disabled={acting} color="#5c2d91" icon="✅"/>}
                {item.status==='review_2'&&<FluentBtn label="Approuver (Finance 2)" onClick={()=>doAction('approve_f2')} disabled={acting} color="#8764b8" icon="✅"/>}
                {item.status==='pending_boss'&&<FluentBtn label="Approuver (Direction)" onClick={()=>doAction('approve_dg')} disabled={acting} color="#ca5010" icon="✅"/>}
                {item.status==='approved'&&<FluentBtn label="Marquer comme payé" onClick={()=>doAction('pay')} disabled={acting} color="#107c10" icon="💳"/>}
                {['submitted','review_2','pending_boss'].includes(item.status)&&(
                  <FluentBtn label="Rejeter" onClick={()=>doAction('reject')} disabled={acting} ghost color="#d13438" icon="✕"/>
                )}
                {['approved','paid','rejected'].includes(item.status)&&(
                  <div style={{fontSize:13,color:'#a19f9d',fontStyle:'italic',padding:'6px 0'}}>
                    {item.status==='paid'?'✅ Demande clôturée et payée':item.status==='approved'?'⏳ En attente de paiement':'❌ Demande rejetée'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== VUE KANBAN =====
const KanbanView = ({ items, onSelect }) => {
  const columns = [
    { key:'draft',        label:'Brouillon',  items:items.filter(i=>i.status==='draft') },
    { key:'submitted',    label:'Soumis',      items:items.filter(i=>i.status==='submitted') },
    { key:'review_2',     label:'Finance 1→2', items:items.filter(i=>['review_1','review_2'].includes(i.status)) },
    { key:'pending_boss', label:'Direction',   items:items.filter(i=>i.status==='pending_boss') },
    { key:'approved',     label:'Approuvé',    items:items.filter(i=>['approved','paid'].includes(i.status)) },
    { key:'rejected',     label:'Rejeté',      items:items.filter(i=>i.status==='rejected') },
  ];
  return (
    <div style={{display:'flex',gap:12,overflowX:'auto',paddingBottom:8}}>
      {columns.map(col=>{
        const s = STATUS_STYLES[col.key]||STATUS_STYLES.draft;
        return (
          <div key={col.key} style={{minWidth:240,flex:'0 0 240px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <div style={{width:10,height:10,borderRadius:2,background:s.dot}}/>
                <span style={{fontSize:12,fontWeight:700,color:'#323130'}}>{col.label}</span>
              </div>
              <span style={{padding:'1px 8px',borderRadius:10,background:s.bg,color:s.color,fontSize:11,fontWeight:700}}>{col.items.length}</span>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8,minHeight:100}}>
              {col.items.map(item=>(
                <ApprovalCard key={item.id} item={item} onClick={()=>onSelect(item)} statusKey={item.status}/>
              ))}
              {col.items.length===0&&<div style={{padding:16,textAlign:'center',color:'#a19f9d',fontSize:12,background:'#fafafa',borderRadius:4,border:'1px dashed #e8eaed'}}>Aucune demande</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ===== COMPOSANT PRINCIPAL =====
export default function Approvals() {
  const [items, setItems] = useState(SEED);
  const [view, setView] = useState('list'); // list | kanban
  const [tab, setTab] = useState('all');
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('tous');

  const updateItem = (updated) => { setItems(p=>p.map(i=>i.id===updated.id?updated:i)); setSelected(updated); };
  const addItem = (item) => setItems(p=>[item,...p]);

  const pending = items.filter(i=>['submitted','review_2','pending_boss'].includes(i.status));
  const totalMontant = items.reduce((s,i)=>s+i.amount,0);
  const totalApproved = items.filter(i=>['approved','paid'].includes(i.status)).reduce((s,i)=>s+i.amount,0);

  const filtered = items.filter(i=>{
    const ms = !search||i.title.toLowerCase().includes(search.toLowerCase())||i.reference.toLowerCase().includes(search.toLowerCase())||i.submittedBy.toLowerCase().includes(search.toLowerCase());
    const mt = filterType==='tous'||i.type===filterType;
    const tabF = tab==='pending'?['submitted','review_2','pending_boss'].includes(i.status):tab==='approved'?['approved','paid'].includes(i.status):true;
    return ms&&mt&&tabF;
  });

  const TABS_LIST = [
    {id:'all',label:'Toutes',count:items.length},
    {id:'pending',label:'En attente',count:pending.length},
    {id:'approved',label:'Approuvées',count:items.filter(i=>['approved','paid'].includes(i.status)).length},
  ];

  return (
    <div style={{minHeight:'100vh',background:'#f3f4f8',fontFamily:'Segoe UI,Arial,sans-serif'}}>

      {/* Header style Microsoft */}
      <div style={{background:'white',borderBottom:'1px solid #e8eaed',padding:'0 28px'}}>
        <div style={{maxWidth:1400,margin:'0 auto'}}>
          {/* Top bar */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 0 12px'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:36,height:36,borderRadius:8,background:'#0078d4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>✅</div>
              <div>
                <h1 style={{fontSize:18,fontWeight:700,color:'#1f2937',margin:'0 0 2px'}}>Approvals</h1>
                <p style={{color:'#a19f9d',margin:0,fontSize:12}}>Demandes internes · Paiements · Congés · Missions · Formations</p>
              </div>
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              {/* Vue toggle */}
              <div style={{display:'flex',background:'#f3f4f8',borderRadius:4,padding:2,border:'1px solid #e8eaed'}}>
                {[{v:'list',icon:'≡'},{v:'kanban',icon:'⊞'}].map(vt=>(
                  <button key={vt.v} onClick={()=>setView(vt.v)} style={{padding:'6px 12px',borderRadius:3,border:'none',background:view===vt.v?'white':'transparent',color:view===vt.v?'#0078d4':'#a19f9d',fontWeight:view===vt.v?700:400,cursor:'pointer',fontSize:16,boxShadow:view===vt.v?'0 1px 3px rgba(0,0,0,0.1)':'none'}}>
                    {vt.icon}
                  </button>
                ))}
              </div>
              <button onClick={()=>setShowNew(true)} style={{padding:'8px 16px',borderRadius:4,border:'none',background:'#0078d4',color:'white',fontWeight:600,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
                + Nouvelle demande
              </button>
            </div>
          </div>

          {/* Tabs navigation */}
          <div style={{display:'flex',gap:0,borderTop:'1px solid #f3f4f6'}}>
            {TABS_LIST.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'10px 16px',border:'none',borderBottom:`2px solid ${tab===t.id?'#0078d4':'transparent'}`,background:'transparent',color:tab===t.id?'#0078d4':'#a19f9d',fontWeight:tab===t.id?700:400,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:6,transition:'all .1s'}}>
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
            {l:'Total demandes',v:items.length,c:'#0078d4',bg:'#deecf9',icon:'📋'},
            {l:'En attente approbation',v:pending.length,c:'#ca5010',bg:'#fff4ce',icon:'⏳'},
            {l:'Approuvées / Payées',v:items.filter(i=>['approved','paid'].includes(i.status)).length,c:'#107c10',bg:'#dff6dd',icon:'✅'},
            {l:'Montant total soumis',v:`${fmtN(totalMontant)} FCFA`,c:'#5c2d91',bg:'#f4f0fb',icon:'💰'},
            {l:'Montant approuvé',v:`${fmtN(totalApproved)} FCFA`,c:'#107c10',bg:'#dff6dd',icon:'💳'},
            {l:'Rejetées',v:items.filter(i=>i.status==='rejected').length,c:'#d13438',bg:'#fde7e9',icon:'❌'},
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

        {/* Alertes en attente */}
        {pending.length>0&&tab!=='approved'&&(
          <div style={{background:'#fff4ce',borderRadius:4,padding:'12px 16px',border:'1px solid #f9e4a1',marginBottom:16,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:18}}>⏳</span>
              <span style={{fontSize:13,fontWeight:600,color:'#7a4100'}}>{pending.length} demande{pending.length>1?'s':''} en attente de votre approbation</span>
            </div>
            <button onClick={()=>setTab('pending')} style={{padding:'6px 14px',borderRadius:4,border:'1px solid #ca5010',background:'transparent',color:'#ca5010',fontWeight:600,fontSize:12,cursor:'pointer'}}>Voir →</button>
          </div>
        )}

        {/* Filtres */}
        <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
          <div style={{flex:1,minWidth:240,display:'flex',alignItems:'center',gap:8,background:'white',borderRadius:4,padding:'8px 12px',border:'1px solid #e8eaed'}}>
            <span style={{color:'#a19f9d',fontSize:14}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par titre, référence, nom..."
              style={{flex:1,border:'none',outline:'none',fontSize:13,color:'#1f2937',background:'transparent',fontFamily:'Segoe UI,Arial,sans-serif'}}/>
          </div>
          <select value={filterType} onChange={e=>setFilterType(e.target.value)}
            style={{padding:'8px 12px',borderRadius:4,border:'1px solid #e8eaed',fontSize:13,color:'#374151',background:'white',cursor:'pointer',fontFamily:'Segoe UI,Arial,sans-serif'}}>
            <option value="tous">Tous les types</option>
            {TYPES_DEMANDES.map(t=><option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
          </select>
          <button style={{padding:'8px 14px',borderRadius:4,border:'1px solid #e8eaed',background:'white',color:'#374151',fontWeight:500,fontSize:13,cursor:'pointer'}}>
            📥 Exporter
          </button>
        </div>

        {/* Vue Kanban */}
        {view==='kanban'&&<KanbanView items={filtered} onSelect={setSelected}/>}

        {/* Vue Liste */}
        {view==='list'&&(
          <div style={{background:'white',borderRadius:4,border:'1px solid #e8eaed',overflow:'hidden',boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',minWidth:900}}>
                <thead>
                  <tr style={{background:'#f3f4f8',borderBottom:'1px solid #e8eaed'}}>
                    {['Demande','Type','Soumis par','Montant','Priorité','Date','Statut',''].map(h=>(
                      <th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:'#a19f9d',textTransform:'uppercase',letterSpacing:0.5,whiteSpace:'nowrap'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item,i)=>{
                    const t2 = getType(item.type);
                    const avatarColor = ['#0078d4','#107c10','#5c2d91','#ca5010','#d13438'][item.submittedBy?.charCodeAt(0)%5]||'#0078d4';
                    return (
                      <tr key={item.id} onClick={()=>setSelected(item)}
                        style={{borderBottom:'1px solid #f3f4f6',cursor:'pointer',background:'white'}}
                        onMouseEnter={e=>e.currentTarget.style.background='#f3f4f8'}
                        onMouseLeave={e=>e.currentTarget.style.background='white'}>
                        <td style={{padding:'12px 14px'}}>
                          <div style={{display:'flex',gap:10,alignItems:'center'}}>
                            <Avatar name={item.submittedBy} color={avatarColor} size={32}/>
                            <div>
                              <div style={{fontSize:13,fontWeight:600,color:'#1f2937',maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.title}</div>
                              <div style={{fontSize:11,color:'#a19f9d',fontFamily:'monospace'}}>{item.reference}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{padding:'12px 14px'}}>
                          <span style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:'#4b5563'}}>
                            <span style={{fontSize:16}}>{t2?.icon}</span>{t2?.label}
                          </span>
                        </td>
                        <td style={{padding:'12px 14px',fontSize:13,color:'#374151'}}>{item.submittedBy}</td>
                        <td style={{padding:'12px 14px',fontSize:13,fontWeight:600,color:item.amount>0?'#0078d4':'#a19f9d'}}>{item.amount>0?`${fmtN(item.amount)} ${item.currency}`:'—'}</td>
                        <td style={{padding:'12px 14px'}}>
                          <span style={{padding:'2px 8px',borderRadius:3,background:item.priority==='haute'?'#fde7e9':item.priority==='basse'?'#dff6dd':'#fff4ce',color:item.priority==='haute'?'#d13438':item.priority==='basse'?'#107c10':'#7a4100',fontSize:11,fontWeight:600}}>
                            {item.priority==='haute'?'🔴 Haute':item.priority==='basse'?'🟢 Basse':'🟡 Normale'}
                          </span>
                        </td>
                        <td style={{padding:'12px 14px',fontSize:12,color:'#a19f9d'}}>{fmtD(item.submittedAt)}</td>
                        <td style={{padding:'12px 14px'}}><StatusBadge status={item.status}/></td>
                        <td style={{padding:'12px 14px'}}>
                          <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
                            <button onClick={e=>{e.stopPropagation();setSelected(item)}}
                              style={{padding:'5px 12px',borderRadius:3,border:'1px solid #e8eaed',background:'white',color:'#374151',fontSize:12,cursor:'pointer',fontWeight:500}}>
                              Voir
                            </button>
                            {['submitted','review_2','pending_boss'].includes(item.status)&&(
                              <button onClick={e=>{e.stopPropagation();setSelected(item)}}
                                style={{padding:'5px 12px',borderRadius:3,border:'none',background:'#0078d4',color:'white',fontSize:12,cursor:'pointer',fontWeight:600}}>
                                Approuver
                              </button>
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
                  <div style={{fontSize:40,marginBottom:10}}>📋</div>
                  <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>Aucune demande trouvée</div>
                  <div style={{fontSize:13}}>Créez une nouvelle demande ou modifiez vos filtres</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selected&&<DetailPanel item={selected} onClose={()=>setSelected(null)} onUpdate={updateItem}/>}
      {showNew&&<NouvelleDemandeModal onClose={()=>setShowNew(false)} onSave={addItem}/>}
    </div>
  );
}
