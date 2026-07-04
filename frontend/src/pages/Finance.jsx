import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../utils/api';

const C={green:'#0F7B3C',green_l:'#E8F5EE',blue:'#185FA5',blue_l:'#E6F1FB',blue_d:'#0C447C',red:'#A32D2D',red_l:'#FCEBEB',orange:'#854F0B',orange_l:'#FAEEDA',purple:'#403294',purple_l:'#F3EEF9',text:'#111827',text2:'#374151',text3:'#6B7280',border:'#E5E7EB',border2:'#F3F4F6',white:'#FFFFFF',bg:'#F9FAFB'};
const fN=n=>new Intl.NumberFormat('fr-FR').format(Math.round(n||0))+' FCFA';
const fD=d=>d?new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}):'—';
const Icon=({d,size=16,color='currentColor'})=>(<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>{d.split(' M').map((s,i)=><path key={i} d={i===0?s:`M ${s}`}/>)}</svg>);
const IC={cash:'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1 M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',audit:'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2 M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2 M12 12h4 M12 16h4 M8 12h.01 M8 16h.01',encaisse:'M3 10h18 M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z',tva:'M9 14l6-6m-5.5.5h.01m4.99 5h.01 M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z',export:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',check:'M20 6 9 17l-5-5',up:'M7 17l9.2-9.2 M17 17V7H7',down:'M17 7l-9.2 9.2 M7 7v10h10',bell:'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0'};
const STATUT={pending:{label:'En attente',bg:C.orange_l,c:C.orange},approved:{label:'Approuvé',bg:C.blue_l,c:C.blue_d},paid:{label:'Payé ✓',bg:C.green_l,c:C.green},rejected:{label:'Rejeté',bg:C.red_l,c:C.red},draft:{label:'Brouillon',bg:C.border2,c:C.text3}};
const TRDATA=[]; // Données réelles depuis CleanITBooks — graphique affiché quand disponible
const SEED=[]; // Plus de données fictives — toutes les données viennent de l'API /approvals

function loadItems(){
  try{const s=localStorage.getItem('cleanit_approvals_cache');if(s){const d=JSON.parse(s);if(d?.length>0)return d;}}catch{}
  return [];
}

function TabTresorerie(){
  return (
    <div style={{padding:'14px 20px',display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
        {[[fN(87500000),'Solde du jour',C.green,IC.cash,'Trésorerie disponible'],[fN(58000000),'Entrées ce mois',C.blue,IC.up,'Encaissements clients'],[fN(35000000),'Sorties ce mois',C.orange,IC.down,'Paiements effectués'],[fN(14900000),'Paiements approuvés',C.purple,IC.audit,'En attente virement']].map(([v,l,c,ic,sub])=>(
          <div key={l} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 14px',borderTop:`2px solid ${c}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}><div style={{fontSize:11,color:C.text3,fontWeight:500}}>{l}</div><Icon d={ic} size={14} color={c}/></div>
            <div style={{fontSize:16,fontWeight:600,color:c,marginBottom:2}}>{v}</div>
            <div style={{fontSize:10,color:C.text3}}>{sub}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:12}}>
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px'}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:12}}>Flux de trésorerie — 6 mois</div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={TRDATA}>
              <defs>
                <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.green} stopOpacity={.1}/><stop offset="95%" stopColor={C.green} stopOpacity={0}/></linearGradient>
                <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.red} stopOpacity={.1}/><stop offset="95%" stopColor={C.red} stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border2}/>
              <XAxis dataKey="m" tick={{fontSize:11}}/><YAxis tick={{fontSize:10}} tickFormatter={v=>(v/1000000)+'M'}/>
              <Tooltip formatter={v=>fN(v)}/>
              <Legend wrapperStyle={{fontSize:11}}/>
              <Area type="monotone" dataKey="e" name="Entrées" stroke={C.green} fill="url(#ge)" strokeWidth={2}/>
              <Area type="monotone" dataKey="s" name="Sorties" stroke={C.red} fill="url(#gs)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px'}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>Prochaines échéances</div>
          {[['Salaires personnel',18500000,'30 mai',true],['CNPS Q1',4200000,'31 mai',true],['TVA avril',6800000,'15 juin',false],['Loyer bureaux',850000,'1 juin',false]].map(([l,m,d,u])=>(
            <div key={l} style={{padding:'8px 0',borderBottom:`1px solid ${C.border2}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{flex:1}}>
                {u&&<span style={{fontSize:9,padding:'1px 5px',borderRadius:8,background:C.red_l,color:C.red,fontWeight:600,marginRight:5}}>Urgent</span>}
                <span style={{fontSize:12}}>{l}</span>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:12,fontWeight:600}}>{(m/1000000).toFixed(1)}M</div>
                <div style={{fontSize:10,color:C.text3}}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TabAudit(){
  const [items,setItems]=useState([]);
  const [filterPerson,setFilterPerson]=useState('');
  const [filterSite,setFilterSite]=useState('');
  const [filterSt,setFilterSt]=useState('');
  const [viewBy,setViewBy]=useState('personne');
  const [expanded,setExpanded]=useState(null);

  useEffect(()=>{
    const data=loadItems();
    setItems(data);
    api.get('/approvals').then(r=>{if(Array.isArray(r.data)&&r.data.length>0){const m=[...SEED,...r.data.filter(a=>!SEED.find(s=>s.id===a.id))];setItems(m);try{localStorage.setItem('cleanit_approvals_cache',JSON.stringify(m));}catch{}}}).catch(()=>{});
  },[]);

  const pay=items.filter(i=>i.type==='payment_request');
  const filtered=pay.filter(i=>(!filterPerson||i.beneficiaryName===filterPerson)&&(!filterSite||i.site===filterSite)&&(!filterSt||i.status===filterSt));
  const persons=[...new Set(pay.map(i=>i.beneficiaryName).filter(Boolean))];
  const sites=[...new Set(pay.map(i=>i.site).filter(Boolean))];
  const totalPaid=filtered.filter(i=>i.status==='paid').reduce((s,i)=>s+i.amount,0);
  const totalPend=filtered.filter(i=>['pending','approved'].includes(i.status)).reduce((s,i)=>s+i.amount,0);

  const byPerson=persons.reduce((acc,p)=>{
    const pi=filtered.filter(i=>i.beneficiaryName===p);
    if(!pi.length) return acc;
    acc[p]={items:pi,paid:pi.filter(i=>i.status==='paid').reduce((s,i)=>s+i.amount,0),pending:pi.filter(i=>['pending','approved'].includes(i.status)).reduce((s,i)=>s+i.amount,0),rejected:pi.filter(i=>i.status==='rejected').reduce((s,i)=>s+i.amount,0)};
    return acc;
  },{});

  const exportCSV=()=>{
    const rows=['Date,Bénéficiaire,Type,Site,Projet,BC/PO,Montant,Statut,Réf. paiement'];
    filtered.forEach(i=>rows.push([fD(i.submittedAt),i.beneficiaryName||'—',i.beneficiaryType||'—',i.site||'—',i.project||'—',i.bcPo||'—',i.amount||0,STATUT[i.status]?.label||i.status,i.paymentRef||'—'].join(',')));
    const b=new Blob([rows.join('\n')],{type:'text/csv'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='audit_paiements.csv';a.click();
  };

  return (
    <div style={{padding:'12px 20px',display:'flex',flexDirection:'column',gap:12}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
        {[[fN(totalPaid),'Total payé',C.green],[fN(totalPend),'En attente / Approuvé',C.orange],[persons.length+' personnes','Bénéficiaires',C.blue]].map(([v,l,c])=>(
          <div key={l} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:'10px 12px',borderLeft:`3px solid ${c}`}}>
            <div style={{fontSize:11,color:C.text3,marginBottom:3}}>{l}</div>
            <div style={{fontSize:16,fontWeight:600,color:c}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{display:'flex',border:`1px solid ${C.border}`,borderRadius:7,overflow:'hidden'}}>
          {[['personne','Par personne'],['site','Par site']].map(([id,l])=>(
            <button key={id} onClick={()=>setViewBy(id)} style={{padding:'6px 12px',border:'none',background:viewBy===id?C.bg:'transparent',cursor:'pointer',fontSize:12,fontFamily:'inherit',color:viewBy===id?C.blue:C.text3,fontWeight:viewBy===id?600:400}}>{l}</button>
          ))}
        </div>
        <select value={filterPerson} onChange={e=>setFilterPerson(e.target.value)} style={{padding:'6px 9px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit'}}>
          <option value=''>Toutes personnes</option>{persons.map(p=><option key={p}>{p}</option>)}
        </select>
        <select value={filterSite} onChange={e=>setFilterSite(e.target.value)} style={{padding:'6px 9px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit'}}>
          <option value=''>Tous sites</option>{sites.map(s=><option key={s}>{s}</option>)}
        </select>
        <select value={filterSt} onChange={e=>setFilterSt(e.target.value)} style={{padding:'6px 9px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit'}}>
          <option value=''>Tous statuts</option><option value='paid'>Payé</option><option value='approved'>Approuvé</option><option value='pending'>En attente</option><option value='rejected'>Rejeté</option>
        </select>
        <span style={{fontSize:11,color:C.text3}}>{filtered.length} demandes</span>
        <button onClick={exportCSV} style={{marginLeft:'auto',fontSize:11,padding:'5px 10px',borderRadius:6,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:4}}>
          <Icon d={IC.export} size={12}/>CSV
        </button>
      </div>

      {viewBy==='personne'&&Object.entries(byPerson).map(([person,data])=>(
        <div key={person} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden'}}>
          <div style={{padding:'10px 14px',background:C.bg,borderBottom:`1px solid ${C.border2}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:9}}>
              <div style={{width:32,height:32,borderRadius:'50%',background:C.blue_l,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,color:C.blue_d}}>{person.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
              <div><div style={{fontSize:13,fontWeight:500}}>{person}</div><div style={{fontSize:11,color:C.text3}}>{data.items.length} demande{data.items.length>1?'s':''}</div></div>
            </div>
            <div style={{display:'flex',gap:12,fontSize:12}}>
              {data.paid>0&&<div style={{textAlign:'right'}}><div style={{fontSize:10,color:C.text3}}>Payé</div><div style={{fontWeight:600,color:C.green}}>{(data.paid/1000000).toFixed(1)}M</div></div>}
              {data.pending>0&&<div style={{textAlign:'right'}}><div style={{fontSize:10,color:C.text3}}>Attente</div><div style={{fontWeight:600,color:C.orange}}>{(data.pending/1000000).toFixed(1)}M</div></div>}
              {data.rejected>0&&<div style={{textAlign:'right'}}><div style={{fontSize:10,color:C.text3}}>Rejeté</div><div style={{fontWeight:600,color:C.red}}>{(data.rejected/1000000).toFixed(1)}M</div></div>}
            </div>
          </div>
          {data.items.map(item=>{
            const st=STATUT[item.status]||STATUT.pending;
            const isExp=expanded===item.id;
            return (
              <div key={item.id} onClick={()=>setExpanded(isExp?null:item.id)} style={{padding:'10px 14px',borderBottom:`1px solid ${C.border2}`,cursor:'pointer',background:isExp?C.bg:'transparent'}}
                onMouseEnter={e=>e.currentTarget.style.background=C.bg} onMouseLeave={e=>e.currentTarget.style.background=isExp?C.bg:'transparent'}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:500,marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.title}</div>
                    <div style={{fontSize:10,color:C.text3,display:'flex',gap:8,flexWrap:'wrap'}}>
                      {item.site&&<span>Site: <strong>{item.site}</strong></span>}
                      {item.project&&<span>{item.project}</span>}
                      {item.bcPo&&<span style={{fontFamily:'monospace'}}>PO: {item.bcPo}</span>}
                      <span>Soumis: {fD(item.submittedAt)}</span>
                    </div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0,marginLeft:10}}>
                    <div style={{fontSize:12,fontWeight:600,marginBottom:3}}>{fN(item.amount)}</div>
                    <span style={{fontSize:10,padding:'2px 7px',borderRadius:20,background:st.bg,color:st.c,fontWeight:600}}>{st.label}</span>
                  </div>
                </div>
                {isExp&&(
                  <div style={{marginTop:8,padding:'8px 10px',background:C.white,borderRadius:6,border:`1px solid ${C.border}`,fontSize:11,display:'flex',flexDirection:'column',gap:4}}>
                    {item.beneficiaryBank&&<div><strong>Banque:</strong> {item.beneficiaryBank} · {item.beneficiaryAccount||'—'}</div>}
                    {item.bcDuid&&<div><strong>DUID:</strong> <span style={{fontFamily:'monospace',color:C.text3}}>{item.bcDuid}</span></div>}
                    {item.paymentRef&&<div style={{color:C.green,fontWeight:600}}><Icon d={IC.check} size={12} color={C.green}/> Réf. virement: {item.paymentRef} — {fD(item.paidAt)}</div>}
                    <div><strong>Soumis par:</strong> {item.submittedBy}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {viewBy==='site'&&(
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:C.bg}}>{['Site','Projet','BC/PO','Bénéficiaire','Type','Montant','Statut','Réf. paiement'].map(h=><th key={h} style={{textAlign:'left',padding:'8px 12px',fontSize:10,fontWeight:600,color:C.text3,textTransform:'uppercase',letterSpacing:.4,borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr></thead>
            <tbody>{filtered.sort((a,b)=>(b.amount||0)-(a.amount||0)).map(item=>{const st=STATUT[item.status]||STATUT.pending;return(
              <tr key={item.id} onMouseEnter={e=>e.currentTarget.style.background=C.bg} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{padding:'9px 12px',fontSize:12,fontWeight:600,borderBottom:`1px solid ${C.border2}`}}>{item.site||'—'}</td>
                <td style={{padding:'9px 12px',fontSize:12,borderBottom:`1px solid ${C.border2}`}}>{item.project||'—'}</td>
                <td style={{padding:'9px 12px',fontSize:10,fontFamily:'monospace',color:C.text3,borderBottom:`1px solid ${C.border2}`}}>{item.bcPo||'—'}</td>
                <td style={{padding:'9px 12px',fontSize:12,borderBottom:`1px solid ${C.border2}`}}>{item.beneficiaryName||'—'}</td>
                <td style={{padding:'9px 12px',fontSize:11,borderBottom:`1px solid ${C.border2}`}}><span style={{padding:'2px 7px',borderRadius:20,background:item.beneficiaryType==='collab'?C.blue_l:C.border2,color:item.beneficiaryType==='collab'?C.blue_d:C.text3,fontWeight:500}}>{item.beneficiaryType==='collab'?'Collab.':item.beneficiaryType==='fournisseur'?'Fourn.':'Autre'}</span></td>
                <td style={{padding:'9px 12px',fontSize:12,fontWeight:600,borderBottom:`1px solid ${C.border2}`}}>{(item.amount/1000000).toFixed(1)}M</td>
                <td style={{padding:'9px 12px',borderBottom:`1px solid ${C.border2}`}}><span style={{fontSize:10,padding:'2px 7px',borderRadius:20,background:st.bg,color:st.c,fontWeight:600}}>{st.label}</span></td>
                <td style={{padding:'9px 12px',fontSize:11,fontFamily:'monospace',color:item.paymentRef?C.green:C.text3,borderBottom:`1px solid ${C.border2}`}}>{item.paymentRef||'—'}</td>
              </tr>
            );})}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TabEncaissements(){
  const clients=[]; // Données réelles depuis /api/cleanitbooks/invoices — à implémenter
  return (
    <div style={{padding:'14px 20px',display:'flex',flexDirection:'column',gap:14}}>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:'20px',textAlign:'center',color:C.text3,fontSize:13}}>
        Consultez <strong>CleanITBooks</strong> pour le suivi des encaissements et factures clients — données en temps réel depuis la comptabilité.
      </div>
    </div>
  );
}

function TabTVA(){
  const echeances=[
    {label:'Déclaration TVA — Avril 2025',montant:6840000,date:'15 juin 2025',statut:'À faire',urgent:true},
    {label:'CNPS — Trimestre Q1 2025',montant:4200000,date:'31 mai 2025',statut:'Urgent',urgent:true},
    {label:'IS — Acompte Juillet',montant:8500000,date:'15 juillet 2025',statut:'Planifié',urgent:false},
    {label:'Déclaration TVA — Mai 2025',montant:7200000,date:'15 juillet 2025',statut:'Planifié',urgent:false},
  ];
  const tva={collectee:28500000,deductible:12400000,nette:16100000};
  return (
    <div style={{padding:'14px 20px',display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
        {[[fN(tva.collectee),'TVA collectée (19.25%)',C.blue],[fN(tva.deductible),'TVA déductible',C.green],[fN(tva.nette),'TVA nette à décaisser',C.orange]].map(([v,l,c])=>(
          <div key={l} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:'12px 14px',borderLeft:`3px solid ${c}`}}>
            <div style={{fontSize:11,color:C.text3,marginBottom:3}}>{l}</div>
            <div style={{fontSize:16,fontWeight:600,color:c}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden'}}>
        <div style={{padding:'12px 16px',borderBottom:`1px solid ${C.border2}`,fontSize:13,fontWeight:600}}>Calendrier fiscal — Obligations DGI Cameroun</div>
        {echeances.map((e,i)=>(
          <div key={i} style={{padding:'12px 16px',borderBottom:`1px solid ${C.border2}`,display:'flex',alignItems:'center',justifyContent:'space-between',background:e.urgent?C.orange_l+'40':'transparent'}}>
            <div style={{flex:1}}>
              {e.urgent&&<span style={{fontSize:9,padding:'1px 5px',borderRadius:8,background:C.red_l,color:C.red,fontWeight:600,marginRight:6}}>Urgent</span>}
              <span style={{fontSize:13,fontWeight:500}}>{e.label}</span>
              <div style={{fontSize:11,color:C.text3,marginTop:2}}>Échéance: {e.date}</div>
            </div>
            <div style={{textAlign:'right',flexShrink:0,marginLeft:12}}>
              <div style={{fontSize:13,fontWeight:600}}>{fN(e.montant)}</div>
              <span style={{fontSize:10,padding:'2px 7px',borderRadius:20,background:e.urgent?C.red_l:C.blue_l,color:e.urgent?C.red:C.blue,fontWeight:600}}>{e.statut}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Finance(){

  // __FINANCE_API__ — Données financières réelles
  const [realFinance, setRealFinance] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    Promise.all([
      fetch('https://backend-cleanit-erp.vercel.app/stats', {headers:{'Authorization':'Bearer '+token}}).then(r=>r.json()).catch(()=>null),
      fetch('https://backend-cleanit-erp.vercel.app/journal', {headers:{'Authorization':'Bearer '+token}}).then(r=>r.json()).catch(()=>[])
    ]).then(([stats, journal]) => {
      if(stats || journal.length > 0) setRealFinance({stats, journal: Array.isArray(journal) ? journal : []});
    });
  }, []);

  const [tab,setTab]=useState('tresorerie');
  const TABS=[['tresorerie','Trésorerie',IC.cash],['audit','Audit paiements',IC.audit],['encaissements','Encaissements clients',IC.encaisse],['tva','TVA & Fiscalité',IC.tva]];
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',fontFamily:'inherit',background:C.bg}}>
      <div style={{padding:'10px 20px',borderBottom:`1px solid ${C.border}`,background:C.white,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <span style={{fontSize:15,fontWeight:600,color:C.text}}>Finance</span>
        <div style={{display:'flex',gap:4}}>
          {TABS.map(([id,l,ic])=>(
            <button key={id} onClick={()=>setTab(id)} style={{padding:'7px 14px',border:'none',borderRadius:7,background:tab===id?C.bg:'transparent',cursor:'pointer',fontFamily:'inherit',fontSize:12,color:tab===id?C.blue:C.text3,fontWeight:tab===id?600:400,display:'flex',alignItems:'center',gap:5,borderBottom:tab===id?`2px solid ${C.blue}`:'2px solid transparent'}}>
              <Icon d={ic} size={13} color={tab===id?C.blue:C.text3}/>{l}
            </button>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflow:'auto'}}>
        {tab==='tresorerie'&&<TabTresorerie/>}
        {tab==='audit'&&<TabAudit/>}
        {tab==='encaissements'&&<TabEncaissements/>}
        {tab==='tva'&&<TabTVA/>}
      </div>
    </div>
  );
}
