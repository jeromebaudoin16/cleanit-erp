import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const AM = {
  purple:'#5B4FE9', purpleLight:'#EDECFD', purpleDark:'#3D33C5',
  blue:'#0AA3E7', blueLight:'#E6F7FD',
  green:'#00A86B', greenLight:'#E6F7F1',
  orange:'#FF8C00', orangeLight:'#FFF4E6',
  red:'#E53935', redLight:'#FEECEC',
  gray1:'#1A1A2E', gray2:'#6B7280', gray3:'#E5E7EB',
  gray4:'#F9FAFB', white:'#FFFFFF', border:'#E5E7EB'
};

const fmtDate = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const fmtTime = d => d ? new Date(d).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) : '—';

const Badge = ({status}) => {
  const map = {
    pending:{bg:AM.orangeLight,c:AM.orange,l:'En attente'},
    approved:{bg:AM.greenLight,c:AM.green,l:'Approuvé'},
    rejected:{bg:AM.redLight,c:AM.red,l:'Rejeté'},
    n1:{bg:AM.blueLight,c:AM.blue,l:'Validation N1'},
    n2:{bg:AM.purpleLight,c:AM.purple,l:'Validation N2'},
    dg:{bg:AM.purpleLight,c:AM.purpleDark,l:'Validation DG'},
  };
  const s = map[status]||map.pending;
  return <span style={{display:'inline-block',padding:'3px 12px',borderRadius:20,fontSize:12,fontWeight:700,background:s.bg,color:s.c}}>{s.l}</span>;
};

const TypeIcon = ({type}) => {
  const icons = {conge:'🌴',autorisation:'📋',prime:'💰',formation:'🎓',autre:'📄',bill_approbation:'🧾',invoice_approbation:'📑',po_approbation:'🛒'};
  return <span style={{fontSize:20}}>{icons[type]||'📄'}</span>;
};

export default function ApprovalsMax() {
  const [view, setView] = useState('dashboard');
  const [approvals, setApprovals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({type:'conge',label:'',description:'',dateDebut:'',dateFin:'',montant:''});
  const user = JSON.parse(localStorage.getItem('cleanit_user')||'{}');

  useEffect(() => { loadApprovals(); }, []);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const [approvalsRes, journalRes] = await Promise.all([
        api.get('/approvals').catch(()=>({data:[]})),
        api.get('/journal').catch(()=>({data:[]}))
      ]);
      const hrApprovals = Array.isArray(approvalsRes.data) ? approvalsRes.data : [];
      // Créer approvals financières depuis les bills/factures
      const journal = Array.isArray(journalRes.data) ? journalRes.data : [];
      const finApprovals = journal
        .filter(j => j.type === 'bill' || j.amount > 5000000)
        .map(j => ({
          id: 'FIN-'+j.id, type: 'bill_approbation',
          label: 'Bill ' + (j.reference||j.id) + ' — ' + new Intl.NumberFormat('fr-FR').format(j.amount||0) + ' FCFA',
          status: j.approved ? 'approved' : 'pending',
          n1_done: false, n2_done: false, dg_done: false,
          user_name: j.vendor || 'CleanITBooks',
          created_at: j.date || new Date().toISOString(),
          amount: j.amount, source: 'cleanitbooks'
        }));
      const all = [...hrApprovals, ...finApprovals];
      if(all.length > 0) setApprovals(all);
    } catch(e) {}
    setLoading(false);
  };

  const getLevel = (a) => {
    if(a.status==='approved') return 'approved';
    if(a.status==='rejected') return 'rejected';
    if(!a.n1_done) return 'n1';
    if(!a.n2_done) return 'n2';
    if(!a.dg_done) return 'dg';
    return 'approved';
  };

  const filtered = filter==='all' ? approvals : approvals.filter(a => {
    if(filter==='pending') return a.status==='pending';
    if(filter==='approved') return a.status==='approved';
    if(filter==='rejected') return a.status==='rejected';
    return true;
  });

  const stats = {
    total: approvals.length,
    pending: approvals.filter(a=>a.status==='pending').length,
    approved: approvals.filter(a=>a.status==='approved').length,
    rejected: approvals.filter(a=>a.status==='rejected').length,
  };

  const approve = async (id, action) => {
    try {
      await api.put('/approvals/'+id, {action, comment});
      setComment('');
      loadApprovals();
      if(selected?.id===id) { setSelected(null); setView('liste'); }
    } catch(e) { alert('Erreur lors de laction'); }
  };

  const submitForm = async () => {
    try {
      await api.post('/approvals', formData);
      setShowForm(false);
      setFormData({type:'conge',label:'',description:'',dateDebut:'',dateFin:'',montant:''});
      loadApprovals();
    } catch(e) { alert('Erreur lors de la soumission'); }
  };

  const TopNav = () => (
    <div style={{background:AM.white,borderBottom:'1px solid '+AM.border,padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',height:56,position:'sticky',top:0,zIndex:100}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <div style={{width:32,height:32,borderRadius:8,background:AM.purple,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{color:'white',fontWeight:700,fontSize:14}}>A</span>
        </div>
        <span style={{fontSize:16,fontWeight:700,color:AM.gray1}}>ApprovalMax</span>
        <span style={{fontSize:11,color:AM.purple,background:AM.purpleLight,padding:'2px 8px',borderRadius:10,marginLeft:4}}>CleanIT Edition</span>
      </div>
      <div style={{display:'flex',gap:4}}>
        {[{id:'dashboard',l:'Tableau de bord',icon:'📊'},{id:'liste',l:'Liste',icon:'📋'},{id:'kanban',l:'Pipeline',icon:'🎯'}].map(v=>(
          <button key={v.id} onClick={()=>{setView(v.id);setSelected(null);}} style={{
            padding:'8px 16px',border:'none',borderRadius:6,cursor:'pointer',fontSize:14,
            background:view===v.id?AM.purpleLight:'transparent',
            color:view===v.id?AM.purple:AM.gray2,fontWeight:view===v.id?700:400,
          }}>{v.icon} {v.l}</button>
        ))}
      </div>
      <button onClick={()=>setShowForm(true)} style={{background:AM.purple,color:'white',border:'none',borderRadius:6,padding:'8px 18px',fontSize:14,fontWeight:600,cursor:'pointer'}}>+ Nouvelle demande</button>
    </div>
  );

  const Dashboard = () => (
    <div style={{padding:'28px',maxWidth:1200,margin:'0 auto'}}>
      <h2 style={{fontSize:22,fontWeight:700,color:AM.gray1,marginBottom:4}}>Tableau de bord</h2>
      <p style={{color:AM.gray2,marginBottom:24,fontSize:14}}>Suivi des demandes — CleanIT SARL</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
        {[
          {l:'Total demandes',v:stats.total,c:AM.gray1,bg:AM.white,icon:'📋'},
          {l:'En attente',v:stats.pending,c:AM.orange,bg:AM.orangeLight,icon:'⏳'},
          {l:'Approuvées',v:stats.approved,c:AM.green,bg:AM.greenLight,icon:'✅'},
          {l:'Rejetées',v:stats.rejected,c:AM.red,bg:AM.redLight,icon:'❌'},
        ].map((k,i)=>(
          <div key={i} style={{background:k.bg,borderRadius:12,padding:'20px',border:'1px solid '+AM.border}}>
            <div style={{fontSize:28,marginBottom:8}}>{k.icon}</div>
            <div style={{fontSize:32,fontWeight:700,color:k.c}}>{k.v}</div>
            <div style={{fontSize:13,color:AM.gray2,marginTop:4}}>{k.l}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20}}>
        <div style={{background:AM.white,borderRadius:12,border:'1px solid '+AM.border,padding:'20px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <h3 style={{fontSize:15,fontWeight:700,color:AM.gray1,margin:0}}>Demandes récentes</h3>
            <button onClick={()=>setView('liste')} style={{background:AM.purpleLight,color:AM.purple,border:'none',borderRadius:6,padding:'6px 14px',fontSize:13,fontWeight:600,cursor:'pointer'}}>Voir tout →</button>
          </div>
          {approvals.slice(0,6).map((a,i)=>(
            <div key={i} onClick={()=>{setSelected(a);setView('detail');}} style={{display:'flex',alignItems:'center',gap:12,padding:'10px',borderRadius:8,cursor:'pointer',marginBottom:4}}
              onMouseOver={e=>e.currentTarget.style.background=AM.gray4} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
              <TypeIcon type={a.type}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14,color:AM.gray1}}>{a.label||a.type}</div>
                <div style={{fontSize:12,color:AM.gray2}}>{a.user_name||'Utilisateur'} · {fmtDate(a.created_at)}</div>
              </div>
              <Badge status={getLevel(a)}/>
            </div>
          ))}
          {approvals.length===0&&<div style={{textAlign:'center',padding:'32px',color:AM.gray2,fontSize:14}}>Aucune demande</div>}
        </div>
        <div style={{background:AM.white,borderRadius:12,border:'1px solid '+AM.border,padding:'20px'}}>
          <h3 style={{fontSize:15,fontWeight:700,color:AM.gray1,marginBottom:16}}>Pipeline</h3>
          {[
            {l:'Chef équipe (N1)',n:approvals.filter(a=>a.status==='pending'&&!a.n1_done).length,c:AM.blue},
            {l:'Project Manager (N2)',n:approvals.filter(a=>a.status==='pending'&&a.n1_done&&!a.n2_done).length,c:AM.purple},
            {l:'Direction (DG)',n:approvals.filter(a=>a.status==='pending'&&a.n2_done&&!a.dg_done).length,c:AM.orange},
          ].map((s,i)=>(
            <div key={i} style={{marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:13,color:AM.gray2}}>{s.l}</span>
                <span style={{fontSize:13,fontWeight:700,color:s.c}}>{s.n}</span>
              </div>
              <div style={{height:6,borderRadius:3,background:AM.gray3}}>
                <div style={{height:'100%',borderRadius:3,background:s.c,width:(stats.total>0?(s.n/Math.max(stats.total,1)*100):0)+'%'}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Liste = () => (
    <div style={{padding:'28px',maxWidth:1200,margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <h2 style={{fontSize:22,fontWeight:700,color:AM.gray1,margin:0}}>Toutes les demandes</h2>
        <div style={{display:'flex',gap:8}}>
          {[{v:'all',l:'Toutes'},{v:'pending',l:'En attente'},{v:'approved',l:'Approuvées'},{v:'rejected',l:'Rejetées'}].map(f=>(
            <button key={f.v} onClick={()=>setFilter(f.v)} style={{padding:'6px 16px',border:'1px solid '+AM.border,borderRadius:20,fontSize:13,cursor:'pointer',background:filter===f.v?AM.purple:'white',color:filter===f.v?'white':AM.gray2,fontWeight:filter===f.v?700:400}}>{f.l}</button>
          ))}
        </div>
      </div>
      <div style={{background:AM.white,borderRadius:12,border:'1px solid '+AM.border,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:AM.gray4}}>
              {['Type','Demande','Demandeur','Date','Niveau','Statut','Actions'].map(h=>(
                <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:12,fontWeight:700,color:AM.gray2,textTransform:'uppercase',letterSpacing:'0.5px'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length===0
              ? <tr><td colSpan={7} style={{padding:'48px',textAlign:'center',color:AM.gray2}}>Aucune demande</td></tr>
              : filtered.map((a,i)=>(
                <tr key={i} style={{borderBottom:'1px solid '+AM.gray3}} onMouseOver={e=>e.currentTarget.style.background=AM.gray4} onMouseOut={e=>e.currentTarget.style.background='white'}>
                  <td style={{padding:'14px 16px'}}><TypeIcon type={a.type}/></td>
                  <td style={{padding:'14px 16px'}}>
                    <div style={{fontWeight:600,color:AM.gray1,fontSize:14}}>{a.label||a.type}</div>
                    <div style={{fontSize:12,color:AM.gray2}}>#{a.id}</div>
                  </td>
                  <td style={{padding:'14px 16px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:28,height:28,borderRadius:14,background:AM.purple,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:12,fontWeight:700}}>{(a.user_name||'?')[0]}</div>
                      <span style={{fontSize:14,color:AM.gray1}}>{a.user_name||'—'}</span>
                    </div>
                  </td>
                  <td style={{padding:'14px 16px',fontSize:13,color:AM.gray2}}>{fmtDate(a.created_at)}</td>
                  <td style={{padding:'14px 16px',fontSize:13,color:AM.gray2}}>
                    {!a.n1_done?'⏳ Chef équipe':!a.n2_done?'⏳ PM':!a.dg_done?'⏳ DG':'✅ Complet'}
                  </td>
                  <td style={{padding:'14px 16px'}}><Badge status={getLevel(a)}/></td>
                  <td style={{padding:'14px 16px'}}>
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={()=>{setSelected(a);setView('detail');}} style={{padding:'5px 12px',background:AM.purpleLight,color:AM.purple,border:'none',borderRadius:6,fontSize:13,fontWeight:600,cursor:'pointer'}}>Voir</button>
                      {a.status==='pending'&&<>
                        <button onClick={()=>approve(a.id,'approve')} style={{padding:'5px 10px',background:AM.greenLight,color:AM.green,border:'none',borderRadius:6,fontSize:13,fontWeight:700,cursor:'pointer'}}>✓</button>
                        <button onClick={()=>approve(a.id,'reject')} style={{padding:'5px 10px',background:AM.redLight,color:AM.red,border:'none',borderRadius:6,fontSize:13,fontWeight:700,cursor:'pointer'}}>✗</button>
                      </>}
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );

  const Kanban = () => {
    const cols = [
      {id:'new',l:'Nouvelles',c:AM.gray2,filter:a=>a.status==='pending'&&!a.n1_done},
      {id:'n1',l:'Chef équipe N1',c:AM.blue,filter:a=>a.status==='pending'&&a.n1_done&&!a.n2_done},
      {id:'n2',l:'Project Manager N2',c:AM.purple,filter:a=>a.status==='pending'&&a.n2_done&&!a.dg_done},
      {id:'approved',l:'Approuvées',c:AM.green,filter:a=>a.status==='approved'},
      {id:'rejected',l:'Rejetées',c:AM.red,filter:a=>a.status==='rejected'},
    ];
    return (
      <div style={{padding:'28px',overflowX:'auto'}}>
        <h2 style={{fontSize:22,fontWeight:700,color:AM.gray1,marginBottom:20}}>Pipeline d approbation</h2>
        <div style={{display:'flex',gap:16,minWidth:1000}}>
          {cols.map(col=>{
            const items = approvals.filter(col.filter);
            return (
              <div key={col.id} style={{flex:1,minWidth:180}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12,padding:'0 4px'}}>
                  <div style={{width:10,height:10,borderRadius:5,background:col.c}}/>
                  <span style={{fontWeight:700,color:AM.gray1,fontSize:13}}>{col.l}</span>
                  <span style={{background:AM.gray3,color:AM.gray2,borderRadius:10,padding:'1px 8px',fontSize:12,fontWeight:600,marginLeft:'auto'}}>{items.length}</span>
                </div>
                <div style={{background:AM.gray4,borderRadius:10,padding:8,minHeight:350}}>
                  {items.map((a,i)=>(
                    <div key={i} onClick={()=>{setSelected(a);setView('detail');}} style={{
                      background:AM.white,borderRadius:8,padding:'12px',marginBottom:8,
                      cursor:'pointer',border:'1px solid '+AM.border,
                      borderLeft:'3px solid '+col.c,
                    }} onMouseOver={e=>e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'} onMouseOut={e=>e.currentTarget.style.boxShadow='none'}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                        <TypeIcon type={a.type}/>
                        <span style={{fontWeight:600,fontSize:13,color:AM.gray1}}>{a.label||a.type}</span>
                      </div>
                      <div style={{fontSize:12,color:AM.gray2,marginBottom:8}}>👤 {a.user_name||'—'}<br/>📅 {fmtDate(a.created_at)}</div>
                      <Badge status={getLevel(a)}/>
                    </div>
                  ))}
                  {items.length===0&&<div style={{textAlign:'center',padding:'24px',color:AM.gray2,fontSize:13}}>Vide</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const Detail = ({a}) => {
    if(!a) return null;
    const steps = [
      {l:'Chef équipe (N1)',done:a.n1_done,current:!a.n1_done&&a.status==='pending'},
      {l:'Project Manager (N2)',done:a.n2_done,current:a.n1_done&&!a.n2_done&&a.status==='pending'},
      {l:'Direction Générale (DG)',done:a.dg_done,current:a.n2_done&&!a.dg_done&&a.status==='pending'},
    ];
    return (
      <div style={{padding:'28px',maxWidth:960,margin:'0 auto'}}>
        <button onClick={()=>{setSelected(null);setView('liste');}} style={{background:AM.purpleLight,color:AM.purple,border:'none',borderRadius:6,padding:'8px 16px',fontSize:14,fontWeight:600,cursor:'pointer',marginBottom:20}}>← Retour à la liste</button>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20}}>
          <div>
            <div style={{background:AM.white,borderRadius:12,border:'1px solid '+AM.border,padding:'24px',marginBottom:16}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}>
                <div style={{display:'flex',alignItems:'center',gap:14}}>
                  <div style={{width:52,height:52,borderRadius:14,background:AM.purpleLight,display:'flex',alignItems:'center',justifyContent:'center',fontSize:30}}><TypeIcon type={a.type}/></div>
                  <div>
                    <h2 style={{margin:0,fontSize:20,fontWeight:700,color:AM.gray1}}>{a.label||a.type}</h2>
                    <div style={{fontSize:13,color:AM.gray2,marginTop:2}}>#{a.id} · {fmtDate(a.created_at)}</div>
                  </div>
                </div>
                <Badge status={getLevel(a)}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>
                {[['Demandeur',a.user_name||'—'],['Type',a.type],['Soumis le',fmtDate(a.created_at)],['Référence','#'+a.id]].map(([k,v])=>(
                  <div key={k} style={{background:AM.gray4,borderRadius:8,padding:'10px 14px'}}>
                    <div style={{fontSize:12,color:AM.gray2,marginBottom:2}}>{k}</div>
                    <div style={{fontSize:14,fontWeight:600,color:AM.gray1}}>{v}</div>
                  </div>
                ))}
              </div>
              {a.status==='pending'&&(
                <div style={{borderTop:'1px solid '+AM.border,paddingTop:16}}>
                  <h4 style={{fontSize:14,fontWeight:700,color:AM.gray1,marginBottom:10}}>💬 Commentaire & Décision</h4>
                  <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Ajouter un commentaire..." rows={3}
                    style={{width:'100%',padding:'10px',border:'1px solid '+AM.border,borderRadius:8,fontSize:14,resize:'vertical',outline:'none',boxSizing:'border-box',marginBottom:12}}/>
                  <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                    <button onClick={()=>approve(a.id,'reject')} style={{background:AM.redLight,color:AM.red,border:'1px solid '+AM.red,borderRadius:6,padding:'10px 24px',fontSize:14,fontWeight:700,cursor:'pointer'}}>✗ Rejeter</button>
                    <button onClick={()=>approve(a.id,'approve')} style={{background:AM.green,color:'white',border:'none',borderRadius:6,padding:'10px 24px',fontSize:14,fontWeight:700,cursor:'pointer'}}>✓ Approuver</button>
                  </div>
                </div>
              )}
            </div>
            <div style={{background:AM.white,borderRadius:12,border:'1px solid '+AM.border,padding:'20px'}}>
              <h3 style={{fontSize:15,fontWeight:700,color:AM.gray1,marginBottom:16}}>📜 Audit Trail</h3>
              {[
                {icon:'📤',l:'Demande soumise',d:a.created_at,by:a.user_name,done:true},
                {icon:a.n1_done?'✅':'⏳',l:'Validation Chef équipe (N1)',d:a.n1_done?a.updated_at:null,by:'Chef équipe',done:a.n1_done},
                {icon:a.n2_done?'✅':'⏳',l:'Validation Project Manager (N2)',d:a.n2_done?a.updated_at:null,by:'PM',done:a.n2_done},
                {icon:a.dg_done?'✅':'⏳',l:'Validation Direction (DG)',d:a.dg_done?a.updated_at:null,by:'DG',done:a.dg_done},
              ].map((s,i)=>(
                <div key={i} style={{display:'flex',gap:12,marginBottom:12}}>
                  <div style={{width:32,height:32,borderRadius:16,flexShrink:0,background:s.done?AM.greenLight:AM.gray4,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>{s.icon}</div>
                  <div style={{flex:1,background:AM.gray4,borderRadius:8,padding:'8px 14px'}}>
                    <div style={{fontWeight:600,fontSize:13,color:AM.gray1}}>{s.l}</div>
                    <div style={{fontSize:12,color:AM.gray2}}>{s.d?fmtTime(s.d):'En attente'} · {s.by}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{background:AM.white,borderRadius:12,border:'1px solid '+AM.border,padding:'20px',marginBottom:16}}>
              <h3 style={{fontSize:15,fontWeight:700,color:AM.gray1,marginBottom:16}}>🎯 Niveaux validation</h3>
              {steps.map((s,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:12,marginBottom:14,paddingBottom:14,borderBottom:i<steps.length-1?'1px solid '+AM.gray3:'none'}}>
                  <div style={{width:32,height:32,borderRadius:16,border:'2px solid',flexShrink:0,borderColor:s.done?AM.green:s.current?AM.orange:AM.gray3,background:s.done?AM.green:s.current?AM.orangeLight:AM.gray4,display:'flex',alignItems:'center',justifyContent:'center',color:s.done?'white':s.current?AM.orange:AM.gray2,fontWeight:700,fontSize:s.done?16:14}}>{s.done?'✓':i+1}</div>
                  <div><div style={{fontSize:13,fontWeight:600,color:s.done?AM.green:s.current?AM.orange:AM.gray2}}>{s.l}</div><div style={{fontSize:12,color:AM.gray2}}>{s.done?'Validé':s.current?'En attente':'En attente'}</div></div>
                </div>
              ))}
            </div>
            <div style={{background:a.status==='approved'?AM.greenLight:a.status==='rejected'?AM.redLight:AM.orangeLight,borderRadius:12,border:'1px solid '+(a.status==='approved'?AM.green:a.status==='rejected'?AM.red:AM.orange),padding:'20px',textAlign:'center'}}>
              <div style={{fontSize:36,marginBottom:8}}>{a.status==='approved'?'🎉':a.status==='rejected'?'❌':'⏳'}</div>
              <div style={{fontWeight:700,color:a.status==='approved'?AM.green:a.status==='rejected'?AM.red:AM.orange,fontSize:15}}>
                {a.status==='approved'?'Demande approuvée':a.status==='rejected'?'Demande rejetée':'En cours de traitement'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FormModal = () => (
    <div style={{position:'fixed',inset:0,background:'rgba(26,26,46,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
      <div style={{background:AM.white,borderRadius:16,padding:'28px',width:560,maxWidth:'90vw',boxShadow:'0 24px 80px rgba(0,0,0,0.25)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
          <h3 style={{margin:0,fontSize:18,fontWeight:700,color:AM.gray1}}>Nouvelle demande</h3>
          <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:AM.gray2}}>×</button>
        </div>
        <div style={{marginBottom:18}}>
          <label style={{display:'block',fontSize:13,fontWeight:600,color:AM.gray2,marginBottom:8}}>Type de demande *</label>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8}}>
            {[{v:'conge',l:'Congé',i:'🌴'},{v:'autorisation',l:'Autorisation',i:'📋'},{v:'prime',l:'Prime',i:'💰'},{v:'formation',l:'Formation',i:'🎓'},{v:'autre',l:'Autre',i:'📄'}].map(t=>(
              <button key={t.v} onClick={()=>setFormData(p=>({...p,type:t.v}))} style={{padding:'12px 6px',border:'2px solid',borderRadius:10,cursor:'pointer',textAlign:'center',borderColor:formData.type===t.v?AM.purple:AM.border,background:formData.type===t.v?AM.purpleLight:'white'}}>
                <div style={{fontSize:22}}>{t.i}</div>
                <div style={{fontSize:11,fontWeight:600,color:formData.type===t.v?AM.purple:AM.gray2,marginTop:4}}>{t.l}</div>
              </button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{display:'block',fontSize:13,fontWeight:600,color:AM.gray2,marginBottom:4}}>Titre *</label>
          <input value={formData.label} onChange={e=>setFormData(p=>({...p,label:e.target.value}))} placeholder="Ex: Congé annuel du 15 au 30 juillet..."
            style={{width:'100%',padding:'10px 12px',border:'1px solid '+AM.border,borderRadius:8,fontSize:14,outline:'none',boxSizing:'border-box'}}/>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{display:'block',fontSize:13,fontWeight:600,color:AM.gray2,marginBottom:4}}>Description</label>
          <textarea value={formData.description} onChange={e=>setFormData(p=>({...p,description:e.target.value}))} rows={3}
            style={{width:'100%',padding:'10px 12px',border:'1px solid '+AM.border,borderRadius:8,fontSize:14,resize:'vertical',outline:'none',boxSizing:'border-box'}}/>
        </div>
        {(formData.type==='conge'||formData.type==='autorisation')&&(
          <div style={{display:'flex',gap:12,marginBottom:14}}>
            <div style={{flex:1}}><label style={{display:'block',fontSize:13,fontWeight:600,color:AM.gray2,marginBottom:4}}>Date début</label><input type="date" value={formData.dateDebut} onChange={e=>setFormData(p=>({...p,dateDebut:e.target.value}))} style={{width:'100%',padding:'10px 12px',border:'1px solid '+AM.border,borderRadius:8,fontSize:14,outline:'none',boxSizing:'border-box'}}/></div>
            <div style={{flex:1}}><label style={{display:'block',fontSize:13,fontWeight:600,color:AM.gray2,marginBottom:4}}>Date fin</label><input type="date" value={formData.dateFin} onChange={e=>setFormData(p=>({...p,dateFin:e.target.value}))} style={{width:'100%',padding:'10px 12px',border:'1px solid '+AM.border,borderRadius:8,fontSize:14,outline:'none',boxSizing:'border-box'}}/></div>
          </div>
        )}
        {formData.type==='prime'&&(
          <div style={{marginBottom:14}}>
            <label style={{display:'block',fontSize:13,fontWeight:600,color:AM.gray2,marginBottom:4}}>Montant (FCFA)</label>
            <input type="number" value={formData.montant} onChange={e=>setFormData(p=>({...p,montant:e.target.value}))} placeholder="Ex: 150000" style={{width:'100%',padding:'10px 12px',border:'1px solid '+AM.border,borderRadius:8,fontSize:14,outline:'none',boxSizing:'border-box'}}/>
          </div>
        )}
        <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:20,borderTop:'1px solid '+AM.border,paddingTop:16}}>
          <button onClick={()=>setShowForm(false)} style={{padding:'10px 20px',border:'1px solid '+AM.border,borderRadius:8,background:'white',cursor:'pointer',fontSize:14,fontWeight:600}}>Annuler</button>
          <button onClick={submitForm} disabled={!formData.label} style={{padding:'10px 24px',background:formData.label?AM.purple:'#ccc',color:'white',border:'none',borderRadius:8,cursor:formData.label?'pointer':'not-allowed',fontSize:14,fontWeight:700}}>Soumettre →</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:AM.gray4,fontFamily:"'Inter','Helvetica Neue',Arial,sans-serif"}}>
      <TopNav/>
      {loading
        ? <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'70vh',flexDirection:'column',gap:16}}>
            <div style={{width:44,height:44,borderRadius:22,border:'3px solid '+AM.purple,borderTopColor:'transparent',animation:'spin 1s linear infinite'}}/>
            <p style={{color:AM.gray2,fontSize:14}}>Chargement...</p>
          </div>
        : <>
            {view==='dashboard'&&<Dashboard/>}
            {view==='liste'&&<Liste/>}
            {view==='kanban'&&<Kanban/>}
            {view==='detail'&&selected&&<Detail a={selected}/>}
          </>
      }
      {showForm&&<FormModal/>}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
