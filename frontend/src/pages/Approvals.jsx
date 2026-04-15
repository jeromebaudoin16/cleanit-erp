import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const STEPS = [
  { key:'draft',        label:'Brouillon',        color:'#94a3b8', bg:'#f8fafc', icon:'📝', step:0 },
  { key:'submitted',    label:'Soumis',            color:'#4f8ef7', bg:'#eff6ff', icon:'📤', step:1 },
  { key:'review_1',     label:'Review Finance 1',  color:'#7c3aed', bg:'#f5f3ff', icon:'👁',  step:2 },
  { key:'review_2',     label:'Review Finance 2',  color:'#a855f7', bg:'#faf5ff', icon:'👁',  step:3 },
  { key:'pending_boss', label:'Approbation Boss',  color:'#ea580c', bg:'#fff7ed', icon:'👔', step:4 },
  { key:'approved',     label:'Approuvé',          color:'#16a34a', bg:'#f0fdf4', icon:'✅', step:5 },
  { key:'paid',         label:'Payé',              color:'#059669', bg:'#ecfdf5', icon:'💳', step:6 },
  { key:'rejected',     label:'Rejeté',            color:'#dc2626', bg:'#fef2f2', icon:'❌', step:-1 },
];

const LIMIT = 250000;
const fmtN = n => n ? new Intl.NumberFormat('fr-FR').format(Math.round(n)) : '0';
const fmtD = d => d ? new Date(d).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'}) : '—';
const getStep = key => STEPS.find(s => s.key === key) || STEPS[0];
const getUser = () => { try { return JSON.parse(localStorage.getItem('user')||sessionStorage.getItem('user')||'{}'); } catch { return {}; } };

export default function Approvals() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('tous');
  const [actionModal, setActionModal] = useState(null);
  const [actionComment, setActionComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    projectName:'', projectCode:'', poNumber:'', siteCode:'',
    type:'payment_request', amount:'', description:'', justification:'',
    beneficiaryName:'', beneficiaryEmail:'', beneficiaryPhone:'',
    beneficiaryBank:'', beneficiaryAccount:'', beneficiaryMobile:'',
  });
  const currentUser = getUser();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([api.get('/approvals'), api.get('/approvals/stats')]);
      setItems(Array.isArray(r.data) ? r.data : []);
      setStats(s.data || {});
    } catch(e) {
      console.error('Erreur chargement approvals:', e);
      setItems([]);
    }
    finally { setLoading(false); }
  };

  const createApproval = async () => {
    setSaving(true);
    try {
      await api.post('/approvals', {
        ...form,
        amount: Number(form.amount),
        submittedBy: `${currentUser.firstName||''} ${currentUser.lastName||''}`.trim() || 'PM',
        submittedByEmail: currentUser.email || '',
      });
      setShowForm(false);
      setForm({ projectName:'', projectCode:'', poNumber:'', siteCode:'', type:'payment_request', amount:'', description:'', justification:'', beneficiaryName:'', beneficiaryEmail:'', beneficiaryPhone:'', beneficiaryBank:'', beneficiaryAccount:'', beneficiaryMobile:'' });
      load();
    } catch(e) { alert('Erreur création: ' + (e.response?.data?.message || e.message)); }
    finally { setSaving(false); }
  };

  const doAction = async () => {
    if (!actionModal) return;
    setActionLoading(true);
    try {
      const { id, action } = actionModal;
      const name = `${currentUser.firstName||''} ${currentUser.lastName||''}`.trim() || 'Utilisateur';
      const email = currentUser.email || '';
      if (action === 'submit')           await api.patch(`/approvals/${id}/submit`, { submittedBy: name, submittedByEmail: email });
      else if (action === 'review1_approve') await api.patch(`/approvals/${id}/review1`, { reviewer: name, reviewerEmail: email, decision: 'approve', comment: actionComment || 'Approuvé' });
      else if (action === 'review1_reject')  await api.patch(`/approvals/${id}/review1`, { reviewer: name, reviewerEmail: email, decision: 'reject',  comment: actionComment || 'Rejeté' });
      else if (action === 'review2_approve') await api.patch(`/approvals/${id}/review2`, { reviewer: name, reviewerEmail: email, decision: 'approve', comment: actionComment || 'Approuvé' });
      else if (action === 'review2_reject')  await api.patch(`/approvals/${id}/review2`, { reviewer: name, reviewerEmail: email, decision: 'reject',  comment: actionComment || 'Rejeté' });
      else if (action === 'boss_approve')    await api.patch(`/approvals/${id}/boss-approve`, { boss: name, decision: 'approve', comment: actionComment || 'Approuvé' });
      else if (action === 'boss_reject')     await api.patch(`/approvals/${id}/boss-approve`, { boss: name, decision: 'reject',  comment: actionComment || 'Rejeté' });
      else if (action === 'mark_paid')       await api.patch(`/approvals/${id}/mark-paid`, { paymentRef: `PAY-${Date.now().toString().slice(-6)}`, paymentMethod: 'Virement bancaire' });
      setActionModal(null); setActionComment('');
      load();
      if (selected?.id === id) { const r = await api.get(`/approvals/${id}`); setSelected(r.data); }
    } catch(e) { alert('Erreur: ' + (e.response?.data?.message || e.message)); }
    finally { setActionLoading(false); }
  };

  const filtered = items.filter(i => filterStatus === 'tous' || i.status === filterStatus);

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:12}}>
      <div style={{width:44,height:44,borderRadius:'50%',border:'3px solid #4f8ef7',borderTopColor:'transparent',animation:'spin 1s linear infinite'}} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{color:'#64748b',fontSize:14}}>Chargement Approvals...</span>
    </div>
  );

  return (
    <div style={{padding:24,background:'#f5f7fa',minHeight:'100%'}}>

      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:'#1e293b',margin:0}}>Approvals & Paiements</h1>
          <p style={{color:'#64748b',fontSize:13,margin:'4px 0 0'}}>
            Workflow de validation · Seuil auto-approbation : <strong style={{color:'#16a34a'}}>250 000 XAF</strong>
          </p>
        </div>
        <button onClick={()=>setShowForm(true)} style={{padding:'9px 18px',borderRadius:8,border:'none',background:'#4f8ef7',color:'white',fontSize:13,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
          + Nouvelle Demande
        </button>
      </div>

      {/* Workflow Banner */}
      <div style={{background:'white',borderRadius:12,padding:'16px 20px',border:'1px solid #e8ecf0',marginBottom:20,boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
        <div style={{fontSize:11,fontWeight:700,color:'#64748b',marginBottom:12,textTransform:'uppercase',letterSpacing:'0.5px'}}>Workflow de validation</div>
        <div style={{display:'flex',alignItems:'center',overflowX:'auto',gap:0}}>
          {[
            {label:'PM crée',sub:'Brouillon',color:'#94a3b8',icon:'📝'},
            {label:'Soumission',sub:'PM soumet',color:'#4f8ef7',icon:'📤'},
            {label:'< 250K XAF',sub:'Auto-approuvé',color:'#16a34a',icon:'⚡'},
            {label:'Finance 1',sub:'Review',color:'#7c3aed',icon:'👁'},
            {label:'Finance 2',sub:'Review',color:'#a855f7',icon:'👁'},
            {label:'Boss',sub:'Approbation finale',color:'#ea580c',icon:'👔'},
            {label:'Paiement',sub:'Virement effectué',color:'#059669',icon:'💳'},
          ].map((s,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center'}}>
              <div style={{textAlign:'center',padding:'0 10px',minWidth:90}}>
                <div style={{width:36,height:36,borderRadius:'50%',background:`${s.color}15`,border:`2px solid ${s.color}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,margin:'0 auto 5px'}}>{s.icon}</div>
                <div style={{fontSize:10,fontWeight:700,color:s.color,whiteSpace:'nowrap'}}>{s.label}</div>
                <div style={{fontSize:9,color:'#94a3b8',whiteSpace:'nowrap'}}>{s.sub}</div>
              </div>
              {i<6 && <div style={{fontSize:16,color:'#e2e8f0',flexShrink:0}}>→</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:10,marginBottom:20}}>
        {[
          {l:'Total',v:stats.total||items.length,c:'#4f8ef7'},
          {l:'Soumis',v:stats.submitted||0,c:'#f59e0b'},
          {l:'En review',v:stats.in_review||0,c:'#7c3aed'},
          {l:'Boss requis',v:stats.pending_boss||0,c:'#ea580c'},
          {l:'Approuvés',v:stats.approved||0,c:'#16a34a'},
          {l:'Payés',v:stats.paid||0,c:'#059669'},
          {l:'Montant payé',v:`${fmtN(stats.totalAmount||0)} XAF`,c:'#059669'},
          {l:'En attente',v:`${fmtN(stats.pendingAmount||0)} XAF`,c:'#f59e0b'},
        ].map(s=>(
          <div key={s.l} style={{background:'white',borderRadius:10,padding:'12px 14px',border:'1px solid #e8ecf0',textAlign:'center',borderTop:`3px solid ${s.c}`}}>
            <div style={{fontSize:s.l.includes('XAF')?11:20,fontWeight:800,color:s.c,lineHeight:1.2}}>{s.v}</div>
            <div style={{fontSize:10,color:'#64748b',marginTop:3}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{background:'white',borderRadius:10,padding:'10px 14px',border:'1px solid #e8ecf0',marginBottom:16,display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
        <span style={{fontSize:12,fontWeight:600,color:'#64748b',marginRight:4}}>Filtrer :</span>
        {[{v:'tous',l:'Tous'},...STEPS.map(s=>({v:s.key,l:s.label}))].map(f=>(
          <button key={f.v} onClick={()=>setFilterStatus(f.v)}
            style={{padding:'4px 10px',borderRadius:6,border:'none',background:filterStatus===f.v?'#4f8ef7':'#f1f5f9',color:filterStatus===f.v?'white':'#64748b',fontSize:11,cursor:'pointer',fontWeight:filterStatus===f.v?600:400}}>
            {f.l}
          </button>
        ))}
        <span style={{marginLeft:'auto',fontSize:11,color:'#94a3b8'}}>{filtered.length} demande(s)</span>
      </div>

      {/* Liste */}
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {filtered.length===0 && (
          <div style={{padding:60,textAlign:'center',background:'white',borderRadius:12,border:'1px solid #e8ecf0'}}>
            <div style={{fontSize:40,marginBottom:8}}>📋</div>
            <div style={{fontSize:15,fontWeight:700,color:'#1e293b',marginBottom:4}}>Aucune demande</div>
            <div style={{fontSize:13,color:'#64748b'}}>Créez votre première demande de paiement</div>
          </div>
        )}
        {filtered.map(item => {
          const st = getStep(item.status);
          return (
            <div key={item.id}
              style={{background:'white',borderRadius:12,border:`1px solid #e8ecf0`,padding:'16px 20px',cursor:'pointer',transition:'all .2s',display:'flex',gap:16,alignItems:'flex-start',flexWrap:'wrap',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}
              onClick={()=>setSelected(item)}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 4px 16px rgba(0,0,0,0.08)`;e.currentTarget.style.borderColor=st.color;}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.04)';e.currentTarget.style.borderColor='#e8ecf0';}}>

              <div style={{width:44,height:44,borderRadius:12,background:st.bg,border:`2px solid ${st.color}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>
                {st.icon}
              </div>

              <div style={{flex:1,minWidth:200}}>
                <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',marginBottom:4}}>
                  <span style={{fontSize:11,fontWeight:700,color:'#94a3b8'}}>{item.reference}</span>
                  <span style={{padding:'2px 8px',borderRadius:8,fontSize:11,fontWeight:600,background:st.bg,color:st.color}}>{st.label}</span>
                  {item.autoApproved && <span style={{padding:'2px 8px',borderRadius:8,fontSize:10,fontWeight:600,background:'#f0fdf4',color:'#16a34a'}}>⚡ Auto</span>}
                  <span style={{padding:'2px 8px',borderRadius:8,fontSize:10,background:item.amount<LIMIT?'#f0fdf4':'#fff7ed',color:item.amount<LIMIT?'#16a34a':'#ea580c',fontWeight:600}}>
                    {item.amount<LIMIT?'< 250K → Auto':'>250K → Boss'}
                  </span>
                </div>
                <div style={{fontSize:14,fontWeight:700,color:'#1e293b',marginBottom:3}}>{item.description||item.projectName||'—'}</div>
                <div style={{display:'flex',gap:12,fontSize:12,color:'#64748b',flexWrap:'wrap'}}>
                  {item.projectName && <span>📁 {item.projectName}</span>}
                  {item.siteCode && <span>📡 {item.siteCode}</span>}
                  {item.poNumber && <span>📄 {item.poNumber}</span>}
                  <span>👤 {item.submittedBy||'Non soumis'}</span>
                </div>
              </div>

              <div style={{textAlign:'right',minWidth:140}}>
                <div style={{fontSize:11,color:'#94a3b8',marginBottom:2}}>{item.beneficiaryName||'—'}</div>
                <div style={{fontSize:11,color:'#64748b',marginBottom:6}}>{item.beneficiaryBank||item.beneficiaryEmail||'—'}</div>
                <div style={{fontSize:20,fontWeight:800,color:item.status==='paid'?'#059669':item.status==='rejected'?'#dc2626':'#4f8ef7'}}>
                  {fmtN(item.amount)} <span style={{fontSize:11,fontWeight:600}}>XAF</span>
                </div>
              </div>

              {/* Quick actions */}
              <div style={{display:'flex',flexDirection:'column',gap:5,flexShrink:0}} onClick={e=>e.stopPropagation()}>
                {item.status==='draft' && (
                  <button onClick={()=>setActionModal({id:item.id,action:'submit',label:'Soumettre pour validation'})}
                    style={{padding:'5px 12px',borderRadius:6,border:'none',background:'#4f8ef7',color:'white',fontSize:11,cursor:'pointer',fontWeight:600,whiteSpace:'nowrap'}}>📤 Soumettre</button>
                )}
                {item.status==='review_1' && <>
                  <button onClick={()=>setActionModal({id:item.id,action:'review1_approve',label:'Approuver — Finance 1'})} style={{padding:'5px 12px',borderRadius:6,border:'none',background:'#16a34a',color:'white',fontSize:11,cursor:'pointer',fontWeight:600}}>✅ Approuver</button>
                  <button onClick={()=>setActionModal({id:item.id,action:'review1_reject',label:'Rejeter — Finance 1'})} style={{padding:'5px 12px',borderRadius:6,border:'none',background:'#dc2626',color:'white',fontSize:11,cursor:'pointer',fontWeight:600}}>❌ Rejeter</button>
                </>}
                {item.status==='review_2' && <>
                  <button onClick={()=>setActionModal({id:item.id,action:'review2_approve',label:'Approuver — Finance 2'})} style={{padding:'5px 12px',borderRadius:6,border:'none',background:'#16a34a',color:'white',fontSize:11,cursor:'pointer',fontWeight:600}}>✅ Approuver</button>
                  <button onClick={()=>setActionModal({id:item.id,action:'review2_reject',label:'Rejeter — Finance 2'})} style={{padding:'5px 12px',borderRadius:6,border:'none',background:'#dc2626',color:'white',fontSize:11,cursor:'pointer',fontWeight:600}}>❌ Rejeter</button>
                </>}
                {item.status==='pending_boss' && <>
                  <button onClick={()=>setActionModal({id:item.id,action:'boss_approve',label:'Approbation Boss'})} style={{padding:'5px 12px',borderRadius:6,border:'none',background:'#16a34a',color:'white',fontSize:11,cursor:'pointer',fontWeight:600}}>👔 Approuver</button>
                  <button onClick={()=>setActionModal({id:item.id,action:'boss_reject',label:'Rejeter — Boss'})} style={{padding:'5px 12px',borderRadius:6,border:'none',background:'#dc2626',color:'white',fontSize:11,cursor:'pointer',fontWeight:600}}>❌ Rejeter</button>
                </>}
                {item.status==='approved' && (
                  <button onClick={()=>setActionModal({id:item.id,action:'mark_paid',label:'Confirmer le paiement'})} style={{padding:'5px 12px',borderRadius:6,border:'none',background:'#059669',color:'white',fontSize:11,cursor:'pointer',fontWeight:600}}>💳 Marquer Payé</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Détail */}
      {selected && !actionModal && !showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setSelected(null)}>
          <div style={{background:'white',borderRadius:14,width:'100%',maxWidth:680,maxHeight:'90vh',overflow:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.3)'}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:'16px 24px',background:`linear-gradient(135deg,#0f1b2d,${getStep(selected.status).color})`,color:'white',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,borderRadius:'14px 14px 0 0'}}>
              <div>
                <div style={{fontSize:16,fontWeight:800}}>{selected.reference} · {selected.description}</div>
                <div style={{fontSize:12,opacity:0.8,marginTop:2}}>{selected.projectName} · {fmtN(selected.amount)} XAF</div>
              </div>
              <button onClick={()=>setSelected(null)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:30,height:30,borderRadius:'50%',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
            <div style={{padding:24}}>
              {/* Progress */}
              <div style={{background:'#f8fafc',borderRadius:10,padding:'14px 16px',marginBottom:20}}>
                <div style={{fontSize:11,fontWeight:700,color:'#64748b',marginBottom:10,textTransform:'uppercase'}}>Progression</div>
                <div style={{display:'flex',alignItems:'center',overflowX:'auto',gap:0}}>
                  {STEPS.filter(s=>s.step>=0).map((step,i,arr)=>{
                    const cur = getStep(selected.status);
                    const done = cur.step > step.step;
                    const active = cur.step === step.step;
                    return (
                      <div key={step.key} style={{display:'flex',alignItems:'center'}}>
                        <div style={{textAlign:'center',minWidth:64,padding:'0 4px'}}>
                          <div style={{width:30,height:30,borderRadius:'50%',background:done?'#16a34a':active?step.color:'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,margin:'0 auto 4px',border:active?`2px solid ${step.color}`:'none',color:done||active?'white':'#94a3b8',fontWeight:700,transition:'all .3s'}}>
                            {done?'✓':step.icon}
                          </div>
                          <div style={{fontSize:9,fontWeight:done||active?700:400,color:done?'#16a34a':active?step.color:'#94a3b8',lineHeight:1.2}}>{step.label}</div>
                        </div>
                        {i<arr.length-1 && <div style={{width:16,height:2,background:done?'#16a34a':'#e2e8f0',flexShrink:0}} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Montant */}
              <div style={{background:selected.amount>=LIMIT?'#fff7ed':'#f0fdf4',border:`1px solid ${selected.amount>=LIMIT?'#fed7aa':'#bbf7d0'}`,borderRadius:10,padding:'12px 16px',marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontSize:11,color:'#64748b',fontWeight:600}}>MONTANT</div>
                  <div style={{fontSize:28,fontWeight:900,color:selected.amount>=LIMIT?'#ea580c':'#16a34a'}}>{fmtN(selected.amount)} XAF</div>
                </div>
                <div style={{textAlign:'right'}}>
                  {selected.amount<LIMIT ? <div style={{padding:'6px 12px',borderRadius:8,background:'#dcfce7',color:'#16a34a',fontWeight:700,fontSize:12}}>⚡ Auto-approbation</div> : <div style={{padding:'6px 12px',borderRadius:8,background:'#fed7aa',color:'#ea580c',fontWeight:700,fontSize:12}}>👔 Validation Boss</div>}
                  {selected.autoApproved && <div style={{fontSize:11,color:'#16a34a',marginTop:4}}>✓ Auto-approuvé</div>}
                </div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16}}>
                <div style={{background:'#f8fafc',borderRadius:10,padding:'14px 16px'}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#64748b',marginBottom:8,textTransform:'uppercase'}}>Projet</div>
                  {[{l:'Nom',v:selected.projectName},{l:'Code',v:selected.projectCode},{l:'Site',v:selected.siteCode},{l:'PO',v:selected.poNumber},{l:'Type',v:selected.type}].filter(i=>i.v).map(i=>(
                    <div key={i.l} style={{display:'flex',gap:8,marginBottom:5,fontSize:12}}><span style={{color:'#94a3b8',minWidth:40}}>{i.l}</span><span style={{color:'#1e293b',fontWeight:600}}>{i.v}</span></div>
                  ))}
                </div>
                <div style={{background:'#f8fafc',borderRadius:10,padding:'14px 16px'}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#64748b',marginBottom:8,textTransform:'uppercase'}}>Bénéficiaire</div>
                  {[{l:'Nom',v:selected.beneficiaryName},{l:'Email',v:selected.beneficiaryEmail},{l:'Tél',v:selected.beneficiaryPhone},{l:'Banque',v:selected.beneficiaryBank},{l:'Compte',v:selected.beneficiaryAccount},{l:'Mobile',v:selected.beneficiaryMobile}].filter(i=>i.v).map(i=>(
                    <div key={i.l} style={{display:'flex',gap:8,marginBottom:5,fontSize:12}}><span style={{color:'#94a3b8',minWidth:40}}>{i.l}</span><span style={{color:'#1e293b',fontWeight:600}}>{i.v}</span></div>
                  ))}
                </div>
              </div>

              {/* Historique */}
              {selected.history?.length>0 && (
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#64748b',marginBottom:8,textTransform:'uppercase'}}>Historique</div>
                  {selected.history.map((h,i)=>(
                    <div key={i} style={{display:'flex',gap:10,padding:'8px 12px',borderRadius:8,background:i%2===0?'#f8fafc':'white',border:'1px solid #f1f5f9',marginBottom:4,fontSize:12}}>
                      <span style={{width:18,height:18,borderRadius:'50%',background:'#4f8ef7',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,flexShrink:0}}>{i+1}</span>
                      <div style={{flex:1}}><span style={{fontWeight:700,color:'#4f8ef7',textTransform:'uppercase',fontSize:10}}>{h.action}</span><span style={{color:'#374151',marginLeft:8}}>{h.comment}</span></div>
                      <div style={{fontSize:10,color:'#94a3b8',whiteSpace:'nowrap'}}>{fmtD(h.at)} · {h.by}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Paiement */}
              {selected.status==='paid' && (
                <div style={{background:'#ecfdf5',border:'1px solid #6ee7b7',borderRadius:8,padding:'12px 14px',marginBottom:16}}>
                  <div style={{fontWeight:700,color:'#059669',marginBottom:4}}>💳 Paiement effectué</div>
                  <div style={{fontSize:12,color:'#374151'}}>Réf: <strong>{selected.paymentReference}</strong> · {selected.paymentMethod}</div>
                  <div style={{fontSize:11,color:'#94a3b8',marginTop:2}}>Le {fmtD(selected.paidAt)}</div>
                </div>
              )}

              {/* Actions */}
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {selected.status==='draft' && <button onClick={()=>setActionModal({id:selected.id,action:'submit',label:'Soumettre'})} style={{padding:'9px 16px',borderRadius:8,border:'none',background:'#4f8ef7',color:'white',cursor:'pointer',fontSize:13,fontWeight:600}}>📤 Soumettre</button>}
                {selected.status==='review_1' && <>
                  <button onClick={()=>setActionModal({id:selected.id,action:'review1_approve',label:'Approuver Finance 1'})} style={{padding:'9px 16px',borderRadius:8,border:'none',background:'#16a34a',color:'white',cursor:'pointer',fontSize:13,fontWeight:600}}>✅ Approuver</button>
                  <button onClick={()=>setActionModal({id:selected.id,action:'review1_reject',label:'Rejeter Finance 1'})} style={{padding:'9px 16px',borderRadius:8,border:'none',background:'#dc2626',color:'white',cursor:'pointer',fontSize:13,fontWeight:600}}>❌ Rejeter</button>
                </>}
                {selected.status==='review_2' && <>
                  <button onClick={()=>setActionModal({id:selected.id,action:'review2_approve',label:'Approuver Finance 2'})} style={{padding:'9px 16px',borderRadius:8,border:'none',background:'#16a34a',color:'white',cursor:'pointer',fontSize:13,fontWeight:600}}>✅ Approuver</button>
                  <button onClick={()=>setActionModal({id:selected.id,action:'review2_reject',label:'Rejeter Finance 2'})} style={{padding:'9px 16px',borderRadius:8,border:'none',background:'#dc2626',color:'white',cursor:'pointer',fontSize:13,fontWeight:600}}>❌ Rejeter</button>
                </>}
                {selected.status==='pending_boss' && <>
                  <button onClick={()=>setActionModal({id:selected.id,action:'boss_approve',label:'Approbation Boss'})} style={{padding:'9px 16px',borderRadius:8,border:'none',background:'#16a34a',color:'white',cursor:'pointer',fontSize:13,fontWeight:600}}>👔 Approuver (Boss)</button>
                  <button onClick={()=>setActionModal({id:selected.id,action:'boss_reject',label:'Rejeter Boss'})} style={{padding:'9px 16px',borderRadius:8,border:'none',background:'#dc2626',color:'white',cursor:'pointer',fontSize:13,fontWeight:600}}>❌ Rejeter</button>
                </>}
                {selected.status==='approved' && <button onClick={()=>setActionModal({id:selected.id,action:'mark_paid',label:'Confirmer paiement'})} style={{padding:'9px 16px',borderRadius:8,border:'none',background:'#059669',color:'white',cursor:'pointer',fontSize:13,fontWeight:600}}>💳 Confirmer Paiement</button>}
                <button onClick={()=>setSelected(null)} style={{padding:'9px 16px',borderRadius:8,border:'1px solid #e2e8f0',background:'white',cursor:'pointer',fontSize:13,color:'#374151'}}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Action */}
      {actionModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:99999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'white',borderRadius:14,width:'100%',maxWidth:460,overflow:'hidden',boxShadow:'0 24px 64px rgba(0,0,0,0.3)'}}>
            <div style={{padding:'16px 20px',background:actionModal.action.includes('reject')?'linear-gradient(135deg,#7f1d1d,#dc2626)':actionModal.action==='mark_paid'?'linear-gradient(135deg,#064e3b,#059669)':'linear-gradient(135deg,#0f1b2d,#16a34a)',color:'white',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:15,fontWeight:800}}>{actionModal.label}</div>
              <button onClick={()=>{setActionModal(null);setActionComment('');}} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:26,height:26,borderRadius:'50%',cursor:'pointer',fontSize:14}}>✕</button>
            </div>
            <div style={{padding:24}}>
              {actionModal.action!=='mark_paid' && (
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:6}}>COMMENTAIRE {actionModal.action.includes('reject')?'(REQUIS)':'(OPTIONNEL)'}</label>
                  <textarea value={actionComment} onChange={e=>setActionComment(e.target.value)} placeholder="Expliquez votre décision..." rows={3} style={{width:'100%',padding:'10px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box',resize:'vertical'}} />
                </div>
              )}
              {actionModal.action==='mark_paid' && (
                <div style={{background:'#f0fdf4',borderRadius:8,padding:'12px 14px',marginBottom:16,fontSize:13,color:'#16a34a',fontWeight:600}}>
                  ✅ Un email de confirmation sera envoyé au bénéficiaire.
                </div>
              )}
              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>{setActionModal(null);setActionComment('');}} style={{flex:1,padding:11,borderRadius:8,border:'1px solid #e2e8f0',background:'white',cursor:'pointer',fontSize:13,color:'#374151'}}>Annuler</button>
                <button onClick={doAction} disabled={actionLoading||(actionModal.action.includes('reject')&&!actionComment)}
                  style={{flex:2,padding:11,borderRadius:8,border:'none',background:actionModal.action.includes('reject')?'#dc2626':actionModal.action==='mark_paid'?'#059669':'#16a34a',color:'white',cursor:'pointer',fontSize:13,fontWeight:700,opacity:(actionModal.action.includes('reject')&&!actionComment)?0.5:1}}>
                  {actionLoading?'Traitement...':'✓ Confirmer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Création */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'white',borderRadius:14,width:'100%',maxWidth:640,maxHeight:'90vh',overflow:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.3)'}}>
            <div style={{padding:'16px 24px',background:'linear-gradient(135deg,#0f1b2d,#4f8ef7)',color:'white',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0}}>
              <div>
                <div style={{fontSize:16,fontWeight:800}}>+ Nouvelle Demande de Paiement</div>
                <div style={{fontSize:11,opacity:0.8,marginTop:2}}>{'< 250 000 XAF'} = Auto · {'> 250 000 XAF'} = Validation Boss</div>
              </div>
              <button onClick={()=>setShowForm(false)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:28,height:28,borderRadius:'50%',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
            <div style={{padding:24}}>
              {form.amount && (
                <div style={{background:Number(form.amount)<LIMIT?'#f0fdf4':'#fff7ed',border:`1px solid ${Number(form.amount)<LIMIT?'#bbf7d0':'#fed7aa'}`,borderRadius:8,padding:'10px 14px',marginBottom:14,fontSize:13,fontWeight:600,color:Number(form.amount)<LIMIT?'#16a34a':'#ea580c'}}>
                  {Number(form.amount)<LIMIT?`⚡ ${fmtN(Number(form.amount))} XAF → Auto-approbation`:`👔 ${fmtN(Number(form.amount))} XAF → Boss requis`}
                </div>
              )}

              <div style={{fontSize:12,fontWeight:700,color:'#4f8ef7',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.5px'}}>📁 Projet</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                {[{l:'NOM PROJET *',k:'projectName',ph:'Installation 5G DLA-001'},{l:'CODE',k:'projectCode',ph:'DLA-001'},{l:'N° BON DE COMMANDE',k:'poNumber',ph:'PO-2024-001'},{l:'CODE SITE',k:'siteCode',ph:'DLA-001'},{l:'MONTANT (XAF) *',k:'amount',ph:'500000'},{l:'TYPE',k:'type',ph:'',sel:['payment_request','advance','expense','invoice']}].map(f=>(
                  <div key={f.k}>
                    <label style={{fontSize:11,fontWeight:700,color:'#64748b',display:'block',marginBottom:4}}>{f.l}</label>
                    {f.sel
                      ? <select value={form[f.k]||''} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} style={{width:'100%',padding:'9px 12px',border:'1.5px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white',outline:'none',boxSizing:'border-box'}}>{f.sel.map(o=><option key={o} value={o}>{o}</option>)}</select>
                      : <input type={f.k==='amount'?'number':'text'} value={form[f.k]||''} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={{width:'100%',padding:'9px 12px',border:'1.5px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} onFocus={e=>e.target.style.borderColor='#4f8ef7'} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
                    }
                  </div>
                ))}
              </div>

              {[{l:'DESCRIPTION *',k:'description',ph:'Paiement avancement installation Phase 1'},{l:'JUSTIFICATION',k:'justification',ph:'45% des travaux complétés selon planning'}].map(f=>(
                <div key={f.k} style={{marginBottom:12}}>
                  <label style={{fontSize:11,fontWeight:700,color:'#64748b',display:'block',marginBottom:4}}>{f.l}</label>
                  <textarea value={form[f.k]||''} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} rows={2} style={{width:'100%',padding:'9px 12px',border:'1.5px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box',resize:'vertical'}} />
                </div>
              ))}

              <div style={{fontSize:12,fontWeight:700,color:'#4f8ef7',marginBottom:8,marginTop:4,textTransform:'uppercase',letterSpacing:'0.5px'}}>👤 Bénéficiaire</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
                {[{l:'NOM COMPLET *',k:'beneficiaryName',ph:'Thomas Ngono'},{l:'EMAIL',k:'beneficiaryEmail',ph:'thomas@cleanit.cm'},{l:'TÉLÉPHONE',k:'beneficiaryPhone',ph:'+237 677 001 001'},{l:'MOBILE MONEY',k:'beneficiaryMobile',ph:'237677001001'},{l:'BANQUE',k:'beneficiaryBank',ph:'Société Générale Cameroun'},{l:'N° COMPTE',k:'beneficiaryAccount',ph:'SG-CM-001-234567'}].map(f=>(
                  <div key={f.k}>
                    <label style={{fontSize:11,fontWeight:700,color:'#64748b',display:'block',marginBottom:4}}>{f.l}</label>
                    <input value={form[f.k]||''} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={{width:'100%',padding:'9px 12px',border:'1.5px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} onFocus={e=>e.target.style.borderColor='#4f8ef7'} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
                  </div>
                ))}
              </div>

              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>setShowForm(false)} style={{flex:1,padding:12,borderRadius:8,border:'1px solid #e2e8f0',background:'white',cursor:'pointer',fontSize:13,color:'#374151'}}>Annuler</button>
                <button onClick={createApproval} disabled={!form.projectName||!form.amount||!form.description||!form.beneficiaryName||saving}
                  style={{flex:2,padding:12,borderRadius:8,border:'none',background:(form.projectName&&form.amount&&form.description&&form.beneficiaryName)?'#4f8ef7':'#e2e8f0',color:(form.projectName&&form.amount&&form.description&&form.beneficiaryName)?'white':'#94a3b8',cursor:(form.projectName&&form.amount&&form.description&&form.beneficiaryName)?'pointer':'not-allowed',fontSize:13,fontWeight:700}}>
                  {saving?'Création...':'✓ Créer la demande'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
