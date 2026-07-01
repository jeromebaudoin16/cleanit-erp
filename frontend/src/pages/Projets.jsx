import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE = import.meta.env.VITE_API_URL || 'https://backend-cleanit-erp.vercel.app';
const tk = () => localStorage.getItem('token') || '';
const h = () => ({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tk() });

const C = {
  blue:'#1B4F8A',blueL:'#EFF6FF',orange:'#EA580C',orangeL:'#FFF7ED',
  green:'#16A34A',greenL:'#F0FDF4',red:'#DC2626',redL:'#FEF2F2',
  purple:'#7C3AED',purpleL:'#F5F3FF',teal:'#0D9488',tealL:'#F0FDFA',
  gray:'#64748B',bg:'#F1F5F9',white:'#FFFFFF',border:'#E2E8F0',
  text:'#1E293B',text2:'#475569',text3:'#94A3B8',
};
const SP={en_cours:{label:'En cours',color:C.blue,bg:C.blueL},planifie:{label:'Planifié',color:C.purple,bg:C.purpleL},termine:{label:'Terminé',color:C.green,bg:C.greenL},suspendu:{label:'Suspendu',color:C.gray,bg:'#F8FAFC'},annule:{label:'Annulé',color:C.red,bg:C.redL}};
const SS={pending:{label:'À démarrer',color:C.gray,bg:'#F8FAFC'},in_progress:{label:'En cours',color:C.blue,bg:C.blueL},done:{label:'Terminé',color:C.green,bg:C.greenL},blocked:{label:'Bloqué',color:C.red,bg:C.redL}};
const SST={pending:{label:'À faire',color:C.gray},in_progress:{label:'En cours',color:C.blue},done:{label:'Terminé',color:C.green},blocked:{label:'Bloqué',color:C.red}};
const TYPES=['MPBN','DWDM','IP Core','IP RAN','B2B Entreprise','FTTH/FTTB','Faisceau hertzien','Installation DAS','Maintenance préventive','Rural Start','Alarme & Supervision','Énergie / Solaire','Climatisation / Ventilation','Autre'];
const fM=v=>{const n=parseFloat(v)||0;return n>=1e9?(n/1e9).toFixed(1)+' Md':n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(0)+'K':n.toLocaleString('fr-FR');};
const Pill=({label,color,bg})=><span style={{fontSize:11,fontWeight:700,padding:'2px 10px',borderRadius:10,background:bg,color,whiteSpace:'nowrap'}}>{label}</span>;
const Bar=({v,color=C.blue})=><div style={{height:6,background:C.border,borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.min(100,v||0)}%`,background:color,borderRadius:3,transition:'width .3s'}}/></div>;

function ListView({projects,loading,onSelect,onNew}){
  const[search,setSearch]=useState('');
  const[fs,setFs]=useState('tous');
  const filtered=projects.filter(p=>(fs==='tous'||p.status===fs)&&(!search||[p.name,p.client,p.po_reference].some(x=>x?.toLowerCase().includes(search.toLowerCase()))));
  return(
    <div style={{padding:24,background:C.bg,minHeight:'100%'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
        <div><h1 style={{fontSize:22,fontWeight:800,color:C.text,margin:0}}>Suivi des Projets</h1>
          <p style={{color:C.text2,fontSize:13,margin:'4px 0 0'}}>{projects.length} projet{projects.length>1?'s':''} — chaque projet peut couvrir plusieurs sites</p>
        </div>
        <button onClick={onNew} style={{padding:'10px 20px',borderRadius:8,border:'none',background:C.blue,color:'white',fontSize:13,fontWeight:700,cursor:'pointer'}}>+ Nouveau projet</button>
      </div>
      <div style={{background:C.white,borderRadius:10,padding:'12px 16px',border:`1px solid ${C.border}`,marginBottom:16,display:'flex',gap:10,flexWrap:'wrap'}}>
        <input placeholder="Nom, client, référence BC..." value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,minWidth:200,padding:'8px 12px',border:`1px solid ${C.border}`,borderRadius:8,fontSize:13,outline:'none'}}/>
        <select value={fs} onChange={e=>setFs(e.target.value)} style={{padding:'8px 12px',border:`1px solid ${C.border}`,borderRadius:8,fontSize:13,background:'white'}}>
          <option value="tous">Tous statuts</option>{Object.entries(SP).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
        {[['En cours',projects.filter(p=>p.status==='en_cours').length,C.blue],['Planifiés',projects.filter(p=>p.status==='planifie').length,C.purple],['Terminés',projects.filter(p=>p.status==='termine').length,C.green],['Sites total',projects.reduce((s,p)=>s+(p.sites_count||0),0),C.teal]].map(([l,v,c])=>(
          <div key={l} style={{background:C.white,borderRadius:10,padding:'14px 16px',border:`1px solid ${C.border}`,borderTop:`3px solid ${c}`}}>
            <div style={{fontSize:22,fontWeight:800,color:c}}>{v}</div><div style={{fontSize:12,color:C.text2,marginTop:2}}>{l}</div>
          </div>
        ))}
      </div>
      {loading?<div style={{textAlign:'center',padding:40,color:C.text3}}>Chargement...</div>:filtered.length===0?(
        <div style={{background:C.white,borderRadius:10,padding:40,textAlign:'center',border:`1px solid ${C.border}`}}>
          <div style={{fontSize:36,marginBottom:12}}>📋</div>
          <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:6}}>{projects.length===0?'Aucun projet créé':'Aucun résultat'}</div>
          {projects.length===0&&<button onClick={onNew} style={{padding:'10px 20px',borderRadius:8,border:'none',background:C.blue,color:'white',fontSize:13,fontWeight:700,cursor:'pointer'}}>+ Créer un projet</button>}
        </div>
      ):(
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {filtered.map(p=>{const st=SP[p.status]||SP.en_cours;const prog=p.avg_progress||0;return(
            <div key={p.id} onClick={()=>onSelect(p.id)} style={{background:C.white,borderRadius:10,border:`1px solid ${C.border}`,padding:'16px 20px',cursor:'pointer',transition:'all .15s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=C.blue;e.currentTarget.style.boxShadow='0 4px 14px rgba(27,79,138,0.08)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.boxShadow='none';}}>
              <div style={{display:'flex',alignItems:'flex-start',gap:14}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                    <span style={{fontSize:15,fontWeight:700,color:C.text}}>{p.name}</span>
                    <Pill label={st.label} color={st.color} bg={st.bg}/>
                    {p.type&&<Pill label={p.type} color={C.teal} bg={C.tealL}/>}
                  </div>
                  <div style={{fontSize:12,color:C.text2,marginBottom:10}}>
                    {p.client&&<span>{p.client}</span>}
                    {p.po_reference&&<span style={{marginLeft:8,color:C.text3}}>· Réf. {p.po_reference}</span>}
                    {p.chef_nom&&<span style={{marginLeft:8,color:C.text3}}>· CDP: {p.chef_nom}</span>}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:16}}>
                    <div style={{flex:1,maxWidth:300}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                        <span style={{fontSize:11,color:C.text2}}>Avancement</span>
                        <span style={{fontSize:11,fontWeight:700,color:prog>=100?C.green:C.blue}}>{prog}%</span>
                      </div>
                      <Bar v={prog} color={prog>=100?C.green:C.blue}/>
                    </div>
                    <span style={{fontSize:12,color:C.text3}}>{p.sites_count||0} site{(p.sites_count||0)>1?'s':''}</span>
                    {p.budget>0&&<span style={{fontSize:12,color:C.text2,fontWeight:600}}>{fM(p.budget)} FCFA</span>}
                  </div>
                </div>
                <div style={{color:C.text3,fontSize:18}}>›</div>
              </div>
            </div>
          );})}
        </div>
      )}
    </div>
  );
}

function DetailView({projectId,onBack}){
  const[proj,setProj]=useState(null);const[loading,setLoading]=useState(true);
  const[tab,setTab]=useState('sites');const[toast,setToast]=useState('');
  const[showAS,setShowAS]=useState(false);const[showAStep,setShowAStep]=useState(false);
  const[ns,setNs]=useState({site_code:'',site_name:'',region:'',status:'pending'});
  const[nst,setNst]=useState({label:'',status:'pending',target_date:'',notes:''});
  const[saving,setSaving]=useState(false);
  const showT=m=>{setToast(m);setTimeout(()=>setToast(''),3000);};
  const load=useCallback(async()=>{setLoading(true);try{const r=await fetch(`${BASE}/projects-list/${projectId}`,{headers:h()});setProj(await r.json());}catch{}setLoading(false);},[projectId]);
  useEffect(()=>{load();},[load]);

  const addSite=async()=>{if(!ns.site_code&&!ns.site_name)return showT('Code ou nom requis');setSaving(true);try{await fetch(`${BASE}/projects-list/${projectId}/sites`,{method:'POST',headers:h(),body:JSON.stringify(ns)});setNs({site_code:'',site_name:'',region:'',status:'pending'});setShowAS(false);showT('Site ajouté ✓');load();}catch{showT('Erreur');}setSaving(false);};
  const updSite=async(sid,u)=>{try{await fetch(`${BASE}/projects-list/${projectId}/sites/${sid}`,{method:'PUT',headers:h(),body:JSON.stringify(u)});load();}catch{showT('Erreur');}};
  const addStep=async()=>{if(!nst.label)return showT('Libellé requis');setSaving(true);try{await fetch(`${BASE}/projects-list/${projectId}/steps`,{method:'POST',headers:h(),body:JSON.stringify({...nst,order_index:proj?.steps?.length||0})});setNst({label:'',status:'pending',target_date:'',notes:''});setShowAStep(false);showT('Étape ajoutée ✓');load();}catch{showT('Erreur');}setSaving(false);};
  const updStep=async(sid,u)=>{try{await fetch(`${BASE}/projects-list/${projectId}/steps/${sid}`,{method:'PUT',headers:h(),body:JSON.stringify(u)});load();}catch{showT('Erreur');}};

  if(loading)return<div style={{padding:40,textAlign:'center',color:C.text3}}>Chargement...</div>;
  if(!proj||proj.message)return<div style={{padding:40,textAlign:'center',color:C.red}}>Projet introuvable</div>;
  const st=SP[proj.status]||SP.en_cours;
  const totalS=proj.sites?.length||0;const doneS=proj.sites?.filter(s=>s.status==='done').length||0;
  const avgP=totalS>0?Math.round(proj.sites.reduce((s,si)=>s+(si.progress||0),0)/totalS):0;
  const doneT=proj.steps?.filter(s=>s.status==='done').length||0;const totalT=proj.steps?.length||0;

  return(
    <div style={{padding:24,background:C.bg,minHeight:'100%'}}>
      {toast&&<div style={{position:'fixed',top:16,right:24,background:C.green,color:'white',padding:'10px 20px',borderRadius:8,zIndex:9999,fontWeight:600,fontSize:13}}>{toast}</div>}
      <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:20}}>
        <button onClick={onBack} style={{padding:'8px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:C.white,fontSize:13,cursor:'pointer',color:C.text2}}>← Projets</button>
        <div style={{flex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
            <h1 style={{fontSize:20,fontWeight:800,color:C.text,margin:0}}>{proj.name}</h1>
            <Pill label={st.label} color={st.color} bg={st.bg}/>
            {proj.type&&<Pill label={proj.type} color={C.teal} bg={C.tealL}/>}
          </div>
          <div style={{fontSize:12,color:C.text2,marginTop:4}}>
            {proj.client&&<span>{proj.client}</span>}
            {proj.po_reference&&<span style={{marginLeft:8}}>· Réf. BC: <strong>{proj.po_reference}</strong></span>}
            {proj.chef_nom&&<span style={{marginLeft:8}}>· CDP: {proj.chef_nom}</span>}
          </div>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
        {[['Sites',`${doneS}/${totalS}`,C.blue,'terminés'],['Avancement',`${avgP}%`,avgP>=100?C.green:C.blue,'global'],['Étapes',`${doneT}/${totalT}`,C.purple,'complétées'],['Budget',proj.budget>0?fM(proj.budget)+' FCFA':'—',C.teal,'budget']].map(([l,v,c,s])=>(
          <div key={l} style={{background:C.white,borderRadius:10,padding:'14px 16px',border:`1px solid ${C.border}`,borderTop:`3px solid ${c}`}}>
            <div style={{fontSize:13,color:C.text2,marginBottom:4}}>{l}</div><div style={{fontSize:20,fontWeight:800,color:c}}>{v}</div><div style={{fontSize:11,color:C.text3}}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{background:C.white,borderRadius:10,border:`1px solid ${C.border}`,overflow:'hidden'}}>
        <div style={{display:'flex',borderBottom:`1px solid ${C.border}`}}>
          {[['sites',`Sites (${totalS})`],['etapes',`Étapes (${totalT})`],['missions',`Missions (${proj.missions?.length||0})`]].map(([id,l])=>(
            <button key={id} onClick={()=>setTab(id)} style={{padding:'12px 20px',border:'none',borderBottom:`2px solid ${tab===id?C.blue:'transparent'}`,background:'transparent',color:tab===id?C.blue:C.text2,fontWeight:tab===id?700:400,fontSize:13,cursor:'pointer'}}>
              {l}
            </button>
          ))}
        </div>
        <div style={{padding:20}}>
          {tab==='sites'&&(
            <div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}>
                <span style={{fontSize:13,color:C.text2}}>Sites rattachés à ce projet</span>
                <button onClick={()=>setShowAS(!showAS)} style={{padding:'6px 14px',borderRadius:7,border:'none',background:C.blue,color:'white',fontSize:12,fontWeight:600,cursor:'pointer'}}>+ Ajouter un site</button>
              </div>
              {showAS&&(
                <div style={{background:C.bg,borderRadius:8,padding:16,marginBottom:14,border:`1px solid ${C.border}`}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:10,alignItems:'end'}}>
                    {['site_code:Code site:GAR-001','site_name:Nom du site:Tour Garoua Centre','region:Région:Nord Cameroun'].map(s=>{const[f,l,ph]=s.split(':');return(
                      <div key={f}><div style={{fontSize:11,color:C.text2,marginBottom:4}}>{l}</div>
                        <input value={ns[f]} onChange={e=>setNs(p=>({...p,[f]:e.target.value}))} placeholder={ph} style={{width:'100%',padding:'8px 10px',border:`1px solid ${C.border}`,borderRadius:7,fontSize:13,boxSizing:'border-box'}}/>
                      </div>
                    );})}
                    <button onClick={addSite} disabled={saving} style={{padding:'8px 16px',borderRadius:7,border:'none',background:C.green,color:'white',fontSize:13,fontWeight:600,cursor:'pointer'}}>Ajouter</button>
                  </div>
                </div>
              )}
              {proj.sites?.length===0?<div style={{textAlign:'center',padding:24,color:C.text3,fontSize:13}}>Aucun site — ajoutez les sites couverts par ce projet</div>:(
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {proj.sites.map(site=>{const sst=SS[site.status]||SS.pending;return(
                    <div key={site.id} style={{background:C.bg,borderRadius:8,padding:'12px 16px',border:`1px solid ${C.border}`}}>
                      <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <div style={{flex:1}}>
                          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                            {site.site_code&&<span style={{fontSize:12,fontWeight:700,color:C.blue,background:C.blueL,padding:'2px 8px',borderRadius:6}}>{site.site_code}</span>}
                            <span style={{fontSize:13,fontWeight:600,color:C.text}}>{site.site_name||site.site_code}</span>
                            {site.region&&<span style={{fontSize:11,color:C.text3}}>· {site.region}</span>}
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:12}}>
                            <div style={{flex:1,maxWidth:250}}><Bar v={site.progress} color={site.status==='done'?C.green:C.blue}/></div>
                            <span style={{fontSize:11,color:C.text2}}>{site.progress||0}%</span>
                          </div>
                        </div>
                        <div style={{display:'flex',gap:8,alignItems:'center'}}>
                          <select value={site.status} onChange={e=>updSite(site.id,{status:e.target.value})} style={{padding:'4px 8px',border:`1px solid ${C.border}`,borderRadius:6,fontSize:12,background:'white',cursor:'pointer'}}>
                            {Object.entries(SS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                          </select>
                          <input type="number" min="0" max="100" value={site.progress||0} onChange={e=>updSite(site.id,{progress:parseInt(e.target.value)||0})} title="Avancement %" style={{width:60,padding:'4px 8px',border:`1px solid ${C.border}`,borderRadius:6,fontSize:12,textAlign:'center'}}/>
                        </div>
                      </div>
                    </div>
                  );})}
                </div>
              )}
            </div>
          )}
          {tab==='etapes'&&(
            <div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}>
                <span style={{fontSize:13,color:C.text2}}>Timeline du projet — étapes à définir avec Nodem Espérance</span>
                <button onClick={()=>setShowAStep(!showAStep)} style={{padding:'6px 14px',borderRadius:7,border:'none',background:C.blue,color:'white',fontSize:12,fontWeight:600,cursor:'pointer'}}>+ Ajouter une étape</button>
              </div>
              {showAStep&&(
                <div style={{background:C.bg,borderRadius:8,padding:16,marginBottom:14,border:`1px solid ${C.border}`}}>
                  <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto',gap:10,alignItems:'end'}}>
                    <div><div style={{fontSize:11,color:C.text2,marginBottom:4}}>Libellé *</div>
                      <input value={nst.label} onChange={e=>setNst(p=>({...p,label:e.target.value}))} placeholder="ex: Étude & Validation, Installation antennes..." style={{width:'100%',padding:'8px 10px',border:`1px solid ${C.border}`,borderRadius:7,fontSize:13,boxSizing:'border-box'}}/>
                    </div>
                    <div><div style={{fontSize:11,color:C.text2,marginBottom:4}}>Statut</div>
                      <select value={nst.status} onChange={e=>setNst(p=>({...p,status:e.target.value}))} style={{width:'100%',padding:'8px 10px',border:`1px solid ${C.border}`,borderRadius:7,fontSize:13,background:'white'}}>
                        {Object.entries(SST).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </div>
                    <div><div style={{fontSize:11,color:C.text2,marginBottom:4}}>Date cible</div>
                      <input type="date" value={nst.target_date} onChange={e=>setNst(p=>({...p,target_date:e.target.value}))} style={{width:'100%',padding:'8px 10px',border:`1px solid ${C.border}`,borderRadius:7,fontSize:13,boxSizing:'border-box'}}/>
                    </div>
                    <button onClick={addStep} disabled={saving} style={{padding:'8px 16px',borderRadius:7,border:'none',background:C.green,color:'white',fontSize:13,fontWeight:600,cursor:'pointer'}}>Ajouter</button>
                  </div>
                </div>
              )}
              {proj.steps?.length===0?<div style={{textAlign:'center',padding:24,color:C.text3,fontSize:13}}>Aucune étape définie — les étapes spécifiques à chaque type de projet seront définies avec le Chef de Projet</div>:(
                <div style={{position:'relative'}}>
                  <div style={{position:'absolute',left:19,top:0,bottom:0,width:2,background:C.border}}/>
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    {proj.steps.map((step,idx)=>{const sst=SST[step.status]||SST.pending;return(
                      <div key={step.id} style={{display:'flex',gap:16,alignItems:'flex-start'}}>
                        <div style={{width:40,height:40,borderRadius:'50%',background:step.status==='done'?C.green:step.status==='in_progress'?C.blue:C.white,border:`2px solid ${sst.color}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,zIndex:1,fontSize:13,fontWeight:700,color:['done','in_progress'].includes(step.status)?'white':sst.color}}>
                          {step.status==='done'?'✓':(idx+1)}
                        </div>
                        <div style={{flex:1,background:C.bg,borderRadius:8,padding:'12px 14px',border:`1px solid ${C.border}`}}>
                          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                            <span style={{fontSize:13,fontWeight:600,color:C.text}}>{step.label}</span>
                            <Pill label={sst.label} color={sst.color} bg={sst.color+'18'}/>
                          </div>
                          <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
                            {step.target_date&&<span style={{fontSize:11,color:C.text3}}>Cible: {new Date(step.target_date).toLocaleDateString('fr-FR')}</span>}
                            <div style={{marginLeft:'auto',display:'flex',gap:5}}>
                              {['pending','in_progress','done','blocked'].map(s=>(
                                <button key={s} onClick={()=>updStep(step.id,{status:s})} style={{padding:'3px 8px',borderRadius:5,border:`1px solid ${step.status===s?SST[s].color:C.border}`,background:step.status===s?SST[s].color:'white',color:step.status===s?'white':C.text2,fontSize:10,fontWeight:600,cursor:'pointer'}}>
                                  {SST[s].label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );})}
                  </div>
                </div>
              )}
            </div>
          )}
          {tab==='missions'&&(
            <div>
              <div style={{fontSize:13,color:C.text2,marginBottom:14}}>Missions terrain liées aux sites de ce projet</div>
              {proj.missions?.length===0?<div style={{textAlign:'center',padding:24,color:C.text3,fontSize:13}}>Aucune mission terrain associée pour l'instant</div>:(
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {proj.missions.map(m=>(
                    <div key={m.id} style={{background:C.bg,borderRadius:8,padding:'12px 16px',border:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:12}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:600,color:C.text}}>{m.code} — {m.type||'Mission'}</div>
                        <div style={{fontSize:11,color:C.text2}}>Site: {m.site} · Statut: {m.status}</div>
                      </div>
                      <div style={{fontSize:12,color:C.text3}}>{m.progress||0}%</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NewForm({onSave,onCancel,users}){
  const[form,setForm]=useState({name:'',client:'',type:'',po_reference:'',chef_projet_id:'',status:'en_cours',start_date:'',target_date:'',description:'',budget:'',currency:'FCFA'});
  const[saving,setSaving]=useState(false);
  const save=async()=>{if(!form.name)return;setSaving(true);try{const r=await fetch(`${BASE}/projects-list`,{method:'POST',headers:h(),body:JSON.stringify({...form,budget:parseFloat(form.budget)||0,chef_projet_id:form.chef_projet_id||null})});const data=await r.json();if(r.ok)onSave(data.id);}catch{}setSaving(false);};
  const inp=(f,p={})=><input value={form[f]} onChange={e=>setForm(prev=>({...prev,[f]:e.target.value}))} style={{width:'100%',padding:'9px 12px',border:`1px solid ${C.border}`,borderRadius:8,fontSize:13,boxSizing:'border-box',outline:'none'}} {...p}/>;
  return(
    <div style={{padding:24,background:C.bg,minHeight:'100%'}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
        <button onClick={onCancel} style={{padding:'8px 14px',borderRadius:8,border:`1px solid ${C.border}`,background:C.white,fontSize:13,cursor:'pointer',color:C.text2}}>← Annuler</button>
        <h1 style={{fontSize:20,fontWeight:800,color:C.text,margin:0}}>Nouveau projet</h1>
      </div>
      <div style={{background:C.white,borderRadius:10,padding:24,border:`1px solid ${C.border}`,maxWidth:640}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
          <div style={{gridColumn:'1/-1'}}>
            <div style={{fontSize:12,color:C.text2,marginBottom:4}}>Nom du projet *</div>
            {inp('name',{placeholder:'ex: Déploiement 5G Nord Cameroun — MTN'})}
          </div>
          {[['client','Client','ex: MTN Cameroun'],['po_reference','Référence BC / PO','ex: 416121376123-2']].map(([f,l,ph])=>(
            <div key={f}><div style={{fontSize:12,color:C.text2,marginBottom:4}}>{l}</div>{inp(f,{placeholder:ph})}</div>
          ))}
          <div><div style={{fontSize:12,color:C.text2,marginBottom:4}}>Type de projet</div>
            <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={{width:'100%',padding:'9px 12px',border:`1px solid ${C.border}`,borderRadius:8,fontSize:13,background:'white'}}>
              <option value="">— Sélectionner —</option>{TYPES.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div><div style={{fontSize:12,color:C.text2,marginBottom:4}}>Chef de Projet</div>
            <select value={form.chef_projet_id} onChange={e=>setForm(p=>({...p,chef_projet_id:e.target.value}))} style={{width:'100%',padding:'9px 12px',border:`1px solid ${C.border}`,borderRadius:8,fontSize:13,background:'white'}}>
              <option value="">— Non assigné —</option>
              {(users||[]).filter(u=>['admin','project_manager'].includes(u.role)).map(u=><option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
            </select>
          </div>
          <div><div style={{fontSize:12,color:C.text2,marginBottom:4}}>Statut</div>
            <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} style={{width:'100%',padding:'9px 12px',border:`1px solid ${C.border}`,borderRadius:8,fontSize:13,background:'white'}}>
              {Object.entries(SP).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          {[['start_date','Date de démarrage','date'],['target_date','Date cible de fin','date'],['budget','Budget (FCFA)','number']].map(([f,l,t])=>(
            <div key={f}><div style={{fontSize:12,color:C.text2,marginBottom:4}}>{l}</div>{inp(f,{type:t,placeholder:t==='number'?'0':undefined})}</div>
          ))}
          <div style={{gridColumn:'1/-1'}}><div style={{fontSize:12,color:C.text2,marginBottom:4}}>Description</div>
            <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3} placeholder="Contexte et objectifs du projet..." style={{width:'100%',padding:'9px 12px',border:`1px solid ${C.border}`,borderRadius:8,fontSize:13,resize:'vertical',boxSizing:'border-box',outline:'none'}}/>
          </div>
        </div>
        <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
          <button onClick={onCancel} style={{padding:'10px 20px',borderRadius:8,border:`1px solid ${C.border}`,background:'white',fontSize:13,cursor:'pointer'}}>Annuler</button>
          <button onClick={save} disabled={saving||!form.name} style={{padding:'10px 24px',borderRadius:8,border:'none',background:form.name?C.blue:C.border,color:'white',fontSize:13,fontWeight:700,cursor:form.name?'pointer':'default'}}>
            {saving?'Création...':'Créer le projet'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Projets(){
  const[view,setView]=useState('list');const[selId,setSelId]=useState(null);
  const[projects,setProjects]=useState([]);const[users,setUsers]=useState([]);const[loading,setLoading]=useState(true);
  const load=useCallback(async()=>{setLoading(true);try{const[r,u]=await Promise.all([fetch(`${BASE}/projects-list`,{headers:h()}).then(r=>r.json()).catch(()=>[]),fetch(`${BASE}/users`,{headers:h()}).then(r=>r.json()).catch(()=>[])]);setProjects(Array.isArray(r)?r:[]);setUsers(Array.isArray(u)?u:[]);}catch{}setLoading(false);},[]);
  useEffect(()=>{load();},[load]);
  if(view==='new')return<NewForm users={users} onSave={id=>{setSelId(id);setView('detail');load();}} onCancel={()=>setView('list')}/>;
  if(view==='detail'&&selId)return<DetailView projectId={selId} onBack={()=>{setView('list');load();}}/>;
  return<ListView projects={projects} loading={loading} onSelect={id=>{setSelId(id);setView('detail');}} onNew={()=>setView('new')}/>;
}
