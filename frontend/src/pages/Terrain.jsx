import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJobs, getCustomers } from '../services/cleanitbooks.api';
import { api } from '../utils/api';

const C = {
  blue:'#185FA5', blue_l:'#E6F1FB', blue_d:'#0C447C',
  green:'#3B6D11', green_l:'#EAF3DE',
  orange:'#854F0B', orange_l:'#FAEEDA',
  red:'#A32D2D', red_l:'#FCEBEB',
  purple:'#403294', purple_l:'#F3EEF9',
  border:'#E5E7EB', border2:'#F3F4F6',
  text:'#111827', text2:'#374151', text3:'#6B7280',
  white:'#FFFFFF', bg:'#F9FAFB',
};

const SS = {
  'Disponible':    { bg:C.green_l,  c:C.green,  dot:C.green },
  'En mission':    { bg:C.blue_l,   c:C.blue_d, dot:C.blue  },
  'En congé':      { bg:C.orange_l, c:C.orange, dot:C.orange},
  'En déplacement':{ bg:C.orange_l, c:C.orange, dot:C.orange},
};

const TECHS_SEED = [
  {id:'T001',name:'Thomas Ngono',role:'5G NR / 4G LTE',region:'Douala',statut:'En mission',missions:47,note:4.8,lat:4.0511,lng:9.7679,certs:['HCNP-5G','HCIP-Carrier'],photo:'https://i.pravatar.cc/150?img=15'},
  {id:'T002',name:'Jean Mbarga',role:'Survey RF',region:'Yaoundé',statut:'Disponible',missions:32,note:4.5,lat:3.8480,lng:11.5021,certs:['HCNA-5G'],photo:'https://i.pravatar.cc/150?img=17'},
  {id:'T003',name:'Samuel Djomo',role:'3G / 4G LTE',region:'Bafoussam',statut:'En déplacement',missions:28,note:4.6,lat:5.4764,lng:10.4214,certs:['HCNP-4G'],photo:'https://i.pravatar.cc/150?img=22'},
  {id:'T004',name:'Ali Moussa',role:'Supervision HSE',region:'Garoua',statut:'Disponible',missions:19,note:4.2,lat:9.3019,lng:13.3920,certs:['HCNA-3G'],photo:'https://i.pravatar.cc/150?img=3'},
  {id:'T005',name:'Pierre Etoga',role:'5G NR / Fibre',region:'Douala',statut:'Disponible',missions:55,note:4.9,lat:4.0469,lng:9.6952,certs:['HCIP-5G','HCNP-4G'],photo:'https://i.pravatar.cc/150?img=25'},
];

const MISSIONS_SEED = [
  {id:'M001',site:'DLA-001',siteName:'Tour MTN Bassa',client:'MTN',type:'Installation 5G NR',techIds:['T001'],statut:'en_cours',pct:65,deadline:'30 mars',arrivee:'07h30',mode:'CleanCam',checklist:[{t:'Sécurité site vérifiée',done:true},{t:'Photos arrivée envoyées',done:true},{t:'Câblage RRU secteur Sud',done:false},{t:'Tests signal 5G NR',done:false}],messages:[{from:'Thomas N.',time:'16h45',txt:'Câbles posés secteur Nord. En attente validation.'},{from:'Vous',time:'16h50',txt:'OK Thomas. Continuez secteur Sud.',me:true}]},
  {id:'M002',site:'KRI-001',siteName:'Station CAMTEL Kribi',client:'CAMTEL',type:'Swap 4G→5G',techIds:['T005'],statut:'en_cours',pct:80,deadline:'22 avr',arrivee:'06h45',mode:'Geofencing',checklist:[{t:'Inspection structure',done:true},{t:'Démontage ancien équipement',done:true},{t:'Installation BBU 5900',done:true},{t:'Tests finaux',done:false}],messages:[{from:'Pierre E.',time:'14h20',txt:'Tests signal en cours. Bon résultat jusqu\'ici.'}]},
];

const ORDRES_SEED = [
  {id:'ORD-001',site:'DLA-004',siteName:'Tour MTN Bonabéri',client:'MTN',type:'Maintenance 4G LTE',deadline:'20 mai',urgence:true,jobId:'JOB-004'},
  {id:'ORD-002',site:'YDE-002',siteName:'Pylône Orange Melen',client:'Orange',type:'Installation 5G NR',deadline:'30 mai',urgence:false,jobId:'JOB-005'},
];

const RAPPORTS_SEED = [
  {id:'R001',site:'DLA-001',titre:'Rapport Phase 2 — DLA-001',tech:'Thomas Ngono',date:'12 mai 2025',statut:'validé',autoIA:true},
  {id:'R002',site:'KRI-001',titre:'Rapport Swap 4G→5G — KRI-001',tech:'Pierre Etoga',date:'20 mars 2025',statut:'en_attente',autoIA:false},
];

const scoreIA = (tech, ordre) => {
  if(tech.statut==='En mission') return null;
  const dist = {'T001':4.1,'T002':12,'T003':18,'T004':8,'T005':2.3}[tech.id]||15;
  const scoreDist = Math.max(0,40-dist*1.5);
  const scoreDispo = tech.statut==='Disponible'?30:tech.statut==='En déplacement'?10:0;
  const scoreNote = (tech.note/5)*20;
  const scoreMissions = Math.min(10,tech.missions/5);
  const total = Math.round(scoreDist+scoreDispo+scoreNote+scoreMissions);
  return {tech,score:total,dist:dist.toFixed(1),eta:Math.round(dist*3+5),
    raison:`${tech.name} ${tech.statut==='Disponible'?'est disponible':'est en déplacement'}, à ${dist.toFixed(1)}km, note ${tech.note}/5, ${tech.missions} missions.`};
};

const Avatar = ({photo,name,size=36,dot,dotColor}) => (
  <div style={{position:'relative',flexShrink:0,width:size,height:size}}>
    {photo?<img src={photo} style={{width:size,height:size,borderRadius:'50%',objectFit:'cover'}} alt=""/>
    :<div style={{width:size,height:size,borderRadius:'50%',background:C.blue_l,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.28,fontWeight:700,color:C.blue_d}}>{name.split(' ').map(w=>w[0]).join('')}</div>}
    {dot&&<div style={{position:'absolute',bottom:1,right:1,width:Math.round(size*.28),height:Math.round(size*.28),borderRadius:'50%',background:dotColor||C.green,border:`2px solid ${C.white}`}}/>}
  </div>
);

function TabDashboard({missions,ordres,currentUser}){
  return (
    <div style={{padding:'14px 20px',background:C.bg}}>
      {ordres.length>0&&<div style={{background:C.blue_l,border:`1px solid #B5D4F4`,borderRadius:8,padding:'9px 14px',marginBottom:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:7,fontSize:12,color:C.blue_d,fontWeight:500}}>{ordres.length} nouveau{ordres.length>1?'x':''} site{ordres.length>1?'s':''} assigné{ordres.length>1?'s':''} — {ordres.map(o=>o.site).join(', ')}</div>
        <button onClick={()=>nav('/map')} style={{fontSize:11,padding:'3px 9px',borderRadius:5,border:`1px solid ${C.blue}`,background:'none',color:C.blue,cursor:'pointer',fontFamily:'inherit'}}>Voir →</button>
      </div>}

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:12}}>
        {[
          {v:missions.length+ordres.length,l:'Sites actifs',c:C.blue,icon:'🏗️'},
          {v:ordres.length,l:'À dispatcher',c:C.orange,icon:'⏳'},
          {v:missions.filter(m=>m.statut==='en_cours').length,l:'En cours',c:C.green,icon:'⚡'},
          {v:missions.filter(m=>m.pct<50&&m.statut==='en_cours').length,l:'Retard potentiel',c:C.red,icon:'alert'},
        ].map((k,i)=>(
          <div key={i} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:'10px 12px',borderTop:`2px solid ${k.c}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
              <div style={{fontSize:20,fontWeight:700,color:k.c}}>{k.v}</div>
              <span style={{fontSize:18}}>{k.icon}</span>
            </div>
            <div style={{fontSize:11,color:C.text3}}>{k.l}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,overflow:'hidden'}}>
          <div style={{padding:'9px 13px',borderBottom:`1px solid ${C.border2}`,fontSize:12,fontWeight:600,display:'flex',alignItems:'center',gap:5}}>⚡ Activité terrain live</div>
          {missions.map((m,i)=>(
            <div key={i} style={{padding:'7px 13px',borderBottom:`1px solid ${C.border2}`,display:'flex',alignItems:'center',gap:8,fontSize:11}}>
              <div style={{width:7,height:7,borderRadius:'50%',background:m.pct>60?C.green:C.orange,flexShrink:0,animation:m.statut==='en_cours'?'pulse 2s infinite':''}}/>
              <span style={{color:C.text}}><b>{m.tech||TECHS_SEED.find(t=>m.techIds?.includes(t.id))?.name?.split(' ')[0]||'—'}</b> · {m.site} · {m.arrivee} · {m.pct}%</span>
            </div>
          ))}
          {missions.length===0&&<div style={{padding:'12px 13px',fontSize:11,color:C.text3,fontStyle:'italic'}}>Aucune mission active</div>}
        </div>
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,overflow:'hidden'}}>
          <div style={{padding:'9px 13px',borderBottom:`1px solid ${C.border2}`,fontSize:12,fontWeight:600,display:'flex',alignItems:'center',gap:5}}>💬 Messages récents</div>
          {missions.flatMap(m=>m.messages||[]).slice(0,4).map((msg,i)=>(
            <div key={i} style={{padding:'6px 13px',borderBottom:`1px solid ${C.border2}`,fontSize:11}}>
              <div style={{fontWeight:600,color:C.text,marginBottom:1}}>{msg.from} <span style={{fontWeight:400,color:C.text3,fontSize:10}}>{msg.time}</span></div>
              <div style={{color:C.text3}}>{msg.txt.slice(0,60)}{msg.txt.length>60?'...':''}</div>
            </div>
          ))}
          {missions.flatMap(m=>m.messages||[]).length===0&&<div style={{padding:'12px 13px',fontSize:11,color:C.text3,fontStyle:'italic'}}>Aucun message récent</div>}
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}

// ===== RÔLES D'ÉQUIPE =====
const ROLES = ["Chef d\'équipe","Technicien principal","Technicien","Sécurité HSE","Support logistique"];

// ===== CARTE MEMBRE D'ÉQUIPE =====
function MembreCard({membre, index, onRemplace, onChangeRole, onRetirer, availableTechs}){
  const [showSwap, setShowSwap] = useState(false);
  const t = membre.tech;
  return (
    <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:9,padding:'10px 12px',position:'relative'}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
        <Avatar photo={t.photo} name={t.name} size={32}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.name}</div>
          <div style={{fontSize:10,color:C.text3}}>{t.role}</div>
        </div>
        <button onClick={()=>onRetirer(index)} style={{width:20,height:20,borderRadius:'50%',border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontSize:12,color:C.text3,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>✕</button>
      </div>
      <select value={membre.role} onChange={e=>onChangeRole(index,e.target.value)}
        style={{width:'100%',padding:'4px 6px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:11,fontFamily:'inherit',marginBottom:6,background:C.bg}}>
        {ROLES.map(r=><option key={r}>{r}</option>)}
      </select>
      <button onClick={()=>setShowSwap(!showSwap)}
        style={{fontSize:10,padding:'3px 8px',borderRadius:5,border:`1px solid ${C.blue}`,background:C.blue_l,color:C.blue_d,cursor:'pointer',fontFamily:'inherit',width:'100%'}}>
        {showSwap?'Annuler':'Remplacer'}
      </button>
      {showSwap&&(
        <div style={{position:'absolute',top:'100%',left:0,right:0,background:C.white,border:`1px solid ${C.border}`,borderRadius:8,zIndex:100,boxShadow:'0 4px 12px rgba(0,0,0,.12)',maxHeight:180,overflowY:'auto'}}>
          {availableTechs.filter(tech=>tech.id!==t.id).map(tech=>(
            <div key={tech.id} onClick={()=>{onRemplace(index,tech);setShowSwap(false);}}
              style={{padding:'8px 10px',cursor:'pointer',display:'flex',alignItems:'center',gap:8,borderBottom:`1px solid ${C.border2}`}}
              onMouseEnter={e=>e.currentTarget.style.background=C.bg}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <Avatar photo={tech.photo} name={tech.name} size={24}/>
              <div>
                <div style={{fontSize:11,fontWeight:500}}>{tech.name}</div>
                <div style={{fontSize:10,color:C.text3}}>{tech.role} · {tech.statut}</div>
              </div>
              <span style={{marginLeft:'auto',fontSize:10,padding:'1px 6px',borderRadius:10,background:tech.statut==='Disponible'?C.green_l:C.orange_l,color:tech.statut==='Disponible'?C.green:C.orange,fontWeight:600}}>{tech.statut}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== BUILDER D'ÉQUIPE =====
function TeamBuilder({ord, techs, onValider, onClose}){
  const [mode, setMode] = useState('chacha'); // 'chacha' | 'edit' | 'manuel'
  const [equipe, setEquipe] = useState([]);
  const [notesPM, setNotesPM] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  // Générer proposition ChaCha au montage
  useEffect(()=>{
    const avail = techs.filter(t=>t.statut==='Disponible');
    const chefsOptions = avail.filter(t=>t.note>=4.5||t.missions>40);
    const chef = chefsOptions[0]||avail[0];
    const autres = avail.filter(t=>t.id!==chef?.id).slice(0,2);
    const proposition = [
      chef&&{tech:chef, role:"Chef d\'équipe", scoreIA:92, raisonIA:`${chef.note}/5 — ${chef.missions} missions — Expert ${chef.role}`},
      ...autres.map((t,i)=>({tech:t, role:i===0?"Technicien principal":"Technicien", scoreIA:Math.round(70+Math.random()*20), raisonIA:`${t.role} — ${t.missions} missions`}))
    ].filter(Boolean);
    setEquipe(proposition);
  },[techs]);

  const ajouterTech = (tech) => {
    if(equipe.find(m=>m.tech.id===tech.id)) return;
    setEquipe([...equipe,{tech, role:'Technicien', scoreIA:null, raisonIA:'Ajout manuel PM'}]);
  };

  const retirerMembre = (idx) => setEquipe(equipe.filter((_,i)=>i!==idx));
  const remplacerMembre = (idx, newTech) => setEquipe(equipe.map((m,i)=>i===idx?{...m,tech:newTech}:m));
  const changerRole = (idx, role) => setEquipe(equipe.map((m,i)=>i===idx?{...m,role}:m));

  const disponibles = techs.filter(t=>t.statut==='Disponible'&&!equipe.find(m=>m.tech.id===t.id));

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:C.white,borderRadius:14,width:640,maxHeight:'90vh',overflow:'auto',boxShadow:'0 20px 40px rgba(0,0,0,.2)'}}>
        {/* Header */}
        <div style={{padding:'14px 18px',borderBottom:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center',background:'linear-gradient(135deg,#185FA5,#403294)'}}>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:'#fff'}}>{ord.site} — {ord.type}</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.7)'}}>Deadline: {ord.deadline} · {ord.client}</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#fff',fontSize:20,cursor:'pointer'}}>✕</button>
        </div>

        {/* Tabs mode */}
        <div style={{display:'flex',borderBottom:`1px solid ${C.border}`,background:C.bg}}>
          {[["chacha","ChaCha IA propose"],["edit","Modifier l'équipe"],["manuel","Créer manuellement"]].map(([id,l])=>(
            <button key={id} onClick={()=>setMode(id)}
              style={{padding:'10px 16px',border:'none',background:mode===id?C.white:'transparent',borderBottom:mode===id?`2px solid ${C.blue}`:'2px solid transparent',fontSize:12,fontWeight:mode===id?700:400,color:mode===id?C.blue:C.text3,cursor:'pointer',fontFamily:'inherit'}}>
              {l}
            </button>
          ))}
        </div>

        <div style={{padding:'16px 18px'}}>

          {/* MODE CHACHA */}
          {mode==='chacha'&&(
            <div>
              <div style={{padding:'10px 12px',background:C.purple_l,borderRadius:8,marginBottom:14,border:`1px solid #D4C5F9`}}>
                <div style={{fontSize:12,fontWeight:700,color:C.purple,marginBottom:4}}>ChaCha IA — Équipe recommandée</div>
                <div style={{fontSize:11,color:C.text3}}>Basé sur les compétences, disponibilité, distance et historique missions</div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
                {equipe.map((m,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:C.bg,borderRadius:8,border:`1px solid ${C.border}`}}>
                    <Avatar photo={m.tech.photo} name={m.tech.name} size={36}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600}}>{m.tech.name}</div>
                      <div style={{fontSize:11,color:C.text3}}>{m.tech.role} · {m.role}</div>
                      {m.raisonIA&&<div style={{fontSize:10,color:C.purple,marginTop:2,fontStyle:'italic'}}>{m.raisonIA}</div>}
                    </div>
                    {m.scoreIA&&<div style={{textAlign:'center',flexShrink:0}}>
                      <div style={{fontSize:18,fontWeight:700,color:m.scoreIA>80?C.green:m.scoreIA>60?C.orange:C.red}}>{m.scoreIA}</div>
                      <div style={{fontSize:9,color:C.text3}}>Score IA</div>
                    </div>}
                  </div>
                ))}
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>setMode('edit')}
                  style={{flex:1,padding:'9px',borderRadius:7,border:`1px solid ${C.blue}`,background:C.blue_l,color:C.blue,cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600}}>
                  Modifier cette équipe
                </button>
                <button onClick={()=>{onValider(ord,equipe,notesPM);}}
                  style={{flex:2,padding:'9px',borderRadius:7,border:'none',background:C.blue,color:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:700}}>
                  Accepter et notifier l'équipe
                </button>
              </div>
            </div>
          )}

          {/* MODE EDIT */}
          {mode==='edit'&&(
            <div>
              <div style={{fontSize:12,color:C.text3,marginBottom:12}}>Modifiez librement l'équipe proposée par ChaCha. Cliquez "Remplacer" sur un membre pour le changer.</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
                {equipe.map((m,i)=>(
                  <MembreCard key={i} membre={m} index={i}
                    onRemplace={remplacerMembre} onChangeRole={changerRole} onRetirer={retirerMembre}
                    availableTechs={techs}/>
                ))}
                {/* Bouton ajouter */}
                <div style={{border:`2px dashed ${C.border}`,borderRadius:9,padding:'10px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',minHeight:80}}
                  onClick={()=>setMode('add')}>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:20,color:C.text3,marginBottom:4}}>+</div>
                    <div style={{fontSize:11,color:C.text3}}>Ajouter un technicien</div>
                  </div>
                </div>
              </div>
              {/* Disponibles à ajouter */}
              {disponibles.length>0&&(
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:11,fontWeight:600,color:C.text3,marginBottom:6,textTransform:'uppercase',letterSpacing:'.5px'}}>Techniciens disponibles</div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {disponibles.map(t=>(
                      <button key={t.id} onClick={()=>ajouterTech(t)}
                        style={{fontSize:11,padding:'4px 10px',borderRadius:6,border:`1px solid ${C.green}`,background:C.green_l,color:C.green,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:5}}>
                        <Avatar photo={t.photo} name={t.name} size={16}/>
                        + {t.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <textarea value={notesPM} onChange={e=>setNotesPM(e.target.value)} placeholder="Notes pour l'équipe (instructions spécifiques, EPI requis, contact client...)"
                style={{width:'100%',padding:'8px 10px',borderRadius:7,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit',resize:'vertical',minHeight:60,boxSizing:'border-box',marginBottom:10}}/>
              <button onClick={()=>onValider(ord,equipe,notesPM)} disabled={equipe.length===0}
                style={{width:'100%',padding:'10px',borderRadius:7,border:'none',background:equipe.length>0?C.blue:'#D1D5DB',color:equipe.length>0?'#fff':'#9CA3AF',cursor:equipe.length>0?'pointer':'not-allowed',fontFamily:'inherit',fontSize:13,fontWeight:700}}>
                Valider l'équipe ({equipe.length} membre{equipe.length>1?'s':''}) et notifier
              </button>
            </div>
          )}

          {/* MODE MANUEL */}
          {mode==='manuel'&&(
            <div>
              <div style={{fontSize:12,color:C.text3,marginBottom:12}}>Composez votre équipe librement depuis la liste des techniciens.</div>
              {equipe.length>0&&(
                <div style={{marginBottom:12,padding:'10px 12px',background:C.blue_l,borderRadius:8,border:`1px solid #B5D4F4`}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.blue_d,marginBottom:6}}>Équipe en cours de composition ({equipe.length} membre{equipe.length>1?'s':''})</div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {equipe.map((m,i)=>(
                      <div key={i} style={{display:'flex',alignItems:'center',gap:5,padding:'4px 8px',background:C.white,borderRadius:6,border:`1px solid ${C.border}`}}>
                        <Avatar photo={m.tech.photo} name={m.tech.name} size={20}/>
                        <span style={{fontSize:11,fontWeight:500}}>{m.tech.name.split(' ')[0]}</span>
                        <select value={m.role} onChange={e=>changerRole(i,e.target.value)} style={{fontSize:10,border:`1px solid ${C.border}`,borderRadius:4,padding:'1px 3px',fontFamily:'inherit'}}>
                          {ROLES.map(r=><option key={r}>{r}</option>)}
                        </select>
                        <button onClick={()=>retirerMembre(i)} style={{background:'none',border:'none',cursor:'pointer',fontSize:12,color:C.text3}}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:12}}>
                {techs.map(t=>{
                  const deja = equipe.find(m=>m.tech.id===t.id);
                  return (
                    <div key={t.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:deja?C.green_l:C.white,border:`1px solid ${deja?C.green:C.border}`,borderRadius:8}}>
                      <Avatar photo={t.photo} name={t.name} size={34}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:600}}>{t.name}</div>
                        <div style={{fontSize:11,color:C.text3}}>{t.role} · {t.statut} · {t.region}</div>
                        <div style={{display:'flex',gap:4,marginTop:3,flexWrap:'wrap'}}>
                          {t.certs.map(cert=><span key={cert} style={{fontSize:9,padding:'1px 5px',borderRadius:4,background:C.blue_l,color:C.blue_d}}>{cert}</span>)}
                        </div>
                      </div>
                      <div style={{textAlign:'center',flexShrink:0}}>
                        <div style={{fontSize:13,fontWeight:700,color:t.note>=4.8?C.green:C.orange}}>{t.note}/5</div>
                        <div style={{fontSize:10,color:C.text3}}>{t.missions} missions</div>
                      </div>
                      {deja
                        ?<button onClick={()=>retirerMembre(equipe.findIndex(m=>m.tech.id===t.id))}
                            style={{fontSize:11,padding:'5px 10px',borderRadius:6,border:`1px solid ${C.green}`,background:C.green,color:'#fff',cursor:'pointer',fontFamily:'inherit'}}>
                            Retirer
                          </button>
                        :<button onClick={()=>ajouterTech(t)} disabled={t.statut==='En mission'}
                            style={{fontSize:11,padding:'5px 10px',borderRadius:6,border:`1px solid ${t.statut==='En mission'?C.border:C.blue}`,background:t.statut==='En mission'?'transparent':C.blue,color:t.statut==='En mission'?C.text3:'#fff',cursor:t.statut==='En mission'?'not-allowed':'pointer',fontFamily:'inherit'}}>
                            {t.statut==='En mission'?'Occupé':'+ Ajouter'}
                          </button>
                      }
                    </div>
                  );
                })}
              </div>
              <textarea value={notesPM} onChange={e=>setNotesPM(e.target.value)} placeholder="Instructions pour l'équipe..."
                style={{width:'100%',padding:'8px 10px',borderRadius:7,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit',resize:'vertical',minHeight:50,boxSizing:'border-box',marginBottom:10}}/>
              <button onClick={()=>onValider(ord,equipe,notesPM)} disabled={equipe.length===0}
                style={{width:'100%',padding:'10px',borderRadius:7,border:'none',background:equipe.length>0?C.blue:'#D1D5DB',color:equipe.length>0?'#fff':'#9CA3AF',cursor:equipe.length>0?'pointer':'not-allowed',fontFamily:'inherit',fontSize:13,fontWeight:700}}>
                Valider l'équipe ({equipe.length} membre{equipe.length>1?'s':''}) et notifier
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabOrdres({ordres,techs,onDispatch}){
  const [dispatched,setDispatched]=useState([]);
  const [showBuilder,setShowBuilder]=useState(null);

  const handleValider=(ord,equipe,notes)=>{
    setDispatched([...dispatched,ord.id]);
    setShowBuilder(null);
    const noms=equipe.map(m=>m.tech.name.split(' ')[0]).join(', ');
    alert(`Équipe validée pour ${ord.site} !\n\nMembres: ${noms}\n${notes?'Notes PM: '+notes:''}\n\nNotification envoyée via CleanIT Comm`);
    onDispatch(ord,equipe[0]?.tech);
  };

  return (
    <div style={{padding:'14px 20px',background:C.bg}}>
      {showBuilder&&<TeamBuilder ord={showBuilder} techs={techs} onValider={handleValider} onClose={()=>setShowBuilder(null)}/>}
      <div style={{fontSize:11,color:C.text3,marginBottom:12,padding:'8px 12px',background:C.white,border:`1px solid ${C.border}`,borderRadius:6}}>
        Missions issues de CleanITBooks — filtrées pour votre compte chef de projet
      </div>
      {ordres.filter(o=>!dispatched.includes(o.id)).map(ord=>(
        <div key={ord.id} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,marginBottom:12,overflow:'hidden'}}>
          <div style={{padding:'12px 16px',borderBottom:`1px solid ${C.border2}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,marginBottom:2}}>{ord.site} — {ord.type} · {ord.client}</div>
              <div style={{fontSize:11,color:C.text3}}>JOB CleanITBooks · Deadline {ord.deadline}</div>
            </div>
            <span style={{fontSize:11,padding:'3px 10px',borderRadius:20,background:ord.urgence?C.red_l:C.orange_l,color:ord.urgence?C.red:C.orange,fontWeight:700}}>{ord.urgence?'Urgent':'À dispatcher'}</span>
          </div>
          <div style={{padding:'12px 16px',display:'flex',gap:8,alignItems:'center'}}>
            <div style={{flex:1}}>
              <div style={{fontSize:11,color:C.text3,marginBottom:4}}>Aucune équipe assignée — En attente de dispatch PM</div>
              <div style={{display:'flex',gap:4}}>
                <span style={{fontSize:10,padding:'2px 7px',borderRadius:10,background:C.purple_l,color:C.purple,fontWeight:600}}>ChaCha IA disponible</span>
                <span style={{fontSize:10,padding:'2px 7px',borderRadius:10,background:C.blue_l,color:C.blue,fontWeight:600}}>Composition manuelle possible</span>
              </div>
            </div>
            <div style={{display:'flex',gap:6,flexShrink:0}}>
              <button onClick={()=>alert('Mission reportée')} style={{fontSize:11,padding:'6px 12px',borderRadius:6,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit',color:C.text3}}>
                Reporter
              </button>
              <button onClick={()=>setShowBuilder(ord)}
                style={{fontSize:12,padding:'7px 16px',borderRadius:6,border:'none',background:'linear-gradient(135deg,#185FA5,#403294)',color:'#fff',cursor:'pointer',fontFamily:'inherit',fontWeight:600,display:'flex',alignItems:'center',gap:5}}>
                Composer l'équipe →
              </button>
            </div>
          </div>
        </div>
      ))}
      {ordres.filter(o=>!dispatched.includes(o.id)).length===0&&(
        <div style={{textAlign:'center',padding:'40px 20px',color:C.text3,fontSize:13,fontStyle:'italic'}}>Aucun ordre de mission en attente</div>
      )}
    </div>
  );
}

function TabMissions({missions}){
  const [open,setOpen]=useState(missions[0]?.id||null);
  const m = missions.find(x=>x.id===open)||missions[0];

  return (
    <div style={{display:'grid',gridTemplateColumns:'240px 1fr',height:'500px'}}>
      <div style={{borderRight:`1px solid ${C.border}`,overflowY:'auto',background:C.white}}>
        {missions.map(mis=>(
          <div key={mis.id} onClick={()=>setOpen(mis.id)}
            style={{padding:'11px 14px',borderBottom:`1px solid ${C.border2}`,cursor:'pointer',background:open===mis.id?C.bg:C.white,borderLeft:`3px solid ${open===mis.id?C.blue:'transparent'}`}}>
            <div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:2}}>{mis.site}</div>
            <div style={{fontSize:11,color:C.text3,marginBottom:4}}>{mis.client} · {mis.type}</div>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <div style={{flex:1,height:4,background:C.border2,borderRadius:2}}><div style={{width:`${mis.pct}%`,height:'100%',background:mis.pct>60?C.green:C.orange,borderRadius:2}}/></div>
              <span style={{fontSize:10,fontWeight:700,color:mis.pct>60?C.green:C.orange}}>{mis.pct}%</span>
            </div>
          </div>
        ))}
        {missions.length===0&&<div style={{padding:20,fontSize:12,color:C.text3,fontStyle:'italic'}}>Aucune mission active</div>}
      </div>
      {m&&<div style={{overflowY:'auto',background:C.bg}}>
        <div style={{padding:'12px 16px',background:C.white,borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>{m.site} — {m.type}</div>
            <div style={{fontSize:11,color:C.text3}}>{m.client} · Arrivée {m.arrivee} ({m.mode}) · IA: fin prévue 17h</div>
          </div>
          <div style={{display:'flex',gap:6}}>
            <button onClick={()=>alert('Rapport partagé avec le client via CleanIT Comm')} style={{fontSize:11,padding:'4px 10px',borderRadius:6,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit'}}>Partager client</button>
            <button onClick={()=>alert('Incident signalé — alerte envoyée au PM et dans CleanIT Comm')} style={{fontSize:11,padding:'4px 10px',borderRadius:6,border:'none',background:C.red_l,color:C.red,cursor:'pointer',fontFamily:'inherit'}}>Signaler</button>
          </div>
        </div>
        <div style={{padding:'12px 16px'}}>
          <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:.5,color:C.text3,marginBottom:8}}>Timeline live</div>
          <div style={{display:'flex',alignItems:'center',gap:0,marginBottom:14}}>
            {['Arrivée','Photos','Travaux','Checklist','Rapport','Clôture'].map((step,i)=>{
              const done = i<2, current=i===2;
              return (
                <div key={i} style={{display:'flex',alignItems:'center',flex:1}}>
                  <div style={{flex:1,textAlign:'center',fontSize:9,padding:'4px 2px',borderRadius:4,background:done?C.green_l:current?C.blue_l:C.border2,color:done?C.green:current?C.blue:C.text3,fontWeight:done||current?600:400,border:current?`1px solid ${C.blue}`:'none'}}>
                    {step}
                  </div>
                  {i<5&&<div style={{width:8,height:1,background:done?C.green:C.border,flexShrink:0}}/>}
                </div>
              );
            })}
          </div>
          <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:.5,color:C.text3,marginBottom:8}}>Checklist terrain</div>
          <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,overflow:'hidden',marginBottom:12}}>
            {(m.checklist||[]).map((item,i)=>(
              <div key={i} style={{padding:'8px 12px',borderBottom:i<m.checklist.length-1?`1px solid ${C.border2}`:'none',display:'flex',alignItems:'center',gap:8,fontSize:12}}>
                <span style={{fontSize:14,color:item.done?C.green:C.text3}}>{item.done?'✓':''}</span>
                <span style={{color:item.done?C.text:C.text3}}>{item.t}</span>
              </div>
            ))}
          </div>
          <div style={{height:4,background:C.border2,borderRadius:2,marginBottom:4}}><div style={{width:`${m.pct}%`,height:'100%',background:m.pct>60?C.green:C.orange,borderRadius:2}}/></div>
          <div style={{fontSize:11,color:C.text3,marginBottom:12}}>Progression: {m.pct}%</div>
        </div>
      </div>}
    </div>
  );
}

function TabCommunication({missions}){
  const [activeChan,setActiveChan]=useState(missions[0]?.id||null);
  const [input,setInput]=useState('');
  const m = missions.find(x=>x.id===activeChan)||missions[0];

  return (
    <div style={{display:'grid',gridTemplateColumns:'200px 1fr',height:'500px'}}>
      <div style={{borderRight:`1px solid ${C.border}`,background:C.white}}>
        <div style={{padding:'9px 12px',borderBottom:`1px solid ${C.border2}`,fontSize:11,fontWeight:600,color:C.text3}}>Canaux auto-créés</div>
        {missions.map(mis=>(
          <div key={mis.id} onClick={()=>setActiveChan(mis.id)}
            style={{padding:'8px 12px',cursor:'pointer',fontSize:12,color:activeChan===mis.id?C.blue:C.text3,background:activeChan===mis.id?C.bg:'transparent',fontWeight:activeChan===mis.id?600:400,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            #{mis.site.toLowerCase().replace('-','')}<span style={{fontSize:10,background:C.red,color:'#fff',padding:'1px 5px',borderRadius:8}}>2</span>
          </div>
        ))}
        <div style={{padding:'9px 12px',borderTop:`1px solid ${C.border2}`,borderBottom:`1px solid ${C.border2}`,fontSize:11,fontWeight:600,color:C.text3,marginTop:4}}>Général</div>
        <div style={{padding:'8px 12px',fontSize:12,color:C.text3}}>#general</div>
        <div style={{padding:'8px 12px',fontSize:12,color:C.text3}}>#chefs-terrain</div>
      </div>
      <div style={{display:'flex',flexDirection:'column'}}>
        <div style={{padding:'9px 14px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',background:C.white,flexShrink:0}}>
          <span style={{fontSize:13,fontWeight:600}}>#{m?.site?.toLowerCase().replace('-','')||'—'}</span>
          <div style={{display:'flex',gap:6}}>
            <button onClick={()=>alert('Galerie photos du site — CleanCam')} style={{fontSize:10,padding:'3px 8px',borderRadius:5,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit'}}>Galerie</button>
            <button onClick={()=>navigator.clipboard?.writeText(window.location.href).then(()=>alert('Lien copié'))} style={{fontSize:10,padding:'3px 8px',borderRadius:5,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit'}}>Partager</button>
          </div>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'10px 14px',display:'flex',flexDirection:'column',gap:8}}>
          {(m?.messages||[]).map((msg,i)=>(
            <div key={i} style={{display:'flex',gap:8,alignItems:'flex-start',flexDirection:msg.me?'row-reverse':'row'}}>
              <div style={{width:26,height:26,borderRadius:'50%',background:msg.me?C.blue_l:C.green_l,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:msg.me?C.blue_d:C.green,flexShrink:0}}>
                {msg.me?'MK':msg.from.split(' ').map(w=>w[0]).join('')}
              </div>
              <div style={{maxWidth:'80%'}}>
                <div style={{fontSize:10,color:C.text3,marginBottom:2}}>{msg.from} · {msg.time}</div>
                <div style={{background:msg.me?C.blue_l:C.bg,border:`1px solid ${msg.me?'#B5D4F4':C.border}`,borderRadius:msg.me?'8px 0 8px 8px':'0 8px 8px 8px',padding:'7px 10px',fontSize:12,color:msg.me?C.blue_d:C.text}}>
                  {msg.txt}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{padding:'8px 12px',borderTop:`1px solid ${C.border}`,background:C.white,display:'flex',gap:6,alignItems:'center',flexShrink:0}}>
          <button onClick={()=>alert('Enregistrement vocal — disponible sur mobile')} style={{width:28,height:28,borderRadius:6,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}} title="Vocal"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></svg></button>
          <button onClick={()=>document.getElementById('terrain-file-input')?.click()} style={{width:28,height:28,borderRadius:6,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}} title="Joindre fichier"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg></button>
          <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Message... ou /done 75%" style={{flex:1,padding:'6px 10px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit',outline:'none'}}/>
          <button onClick={()=>setInput('')} style={{padding:'6px 12px',borderRadius:6,border:'none',background:C.blue,color:'#fff',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>Envoyer</button>
        </div>
      </div>
    </div>
  );
}

function TabRapports({rapports}){
  return (
    <div style={{padding:'14px 20px',background:C.bg}}>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,overflow:'hidden'}}>
        <div style={{padding:'10px 14px',borderBottom:`1px solid ${C.border2}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:12,fontWeight:600}}>Rapports d'intervention</span>
          <button onClick={()=>alert('Nouveau rapport — formulaire disponible dans Bons de Commande')} style={{fontSize:11,padding:'5px 12px',borderRadius:6,border:'none',background:C.blue,color:'#fff',cursor:'pointer',fontFamily:'inherit'}}>+ Nouveau rapport</button>
        </div>
        {rapports.map((r,i)=>(
          <div key={i} style={{padding:'11px 14px',borderBottom:i<rapports.length-1?`1px solid ${C.border2}`:'none',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:2}}>{r.titre}</div>
              <div style={{fontSize:11,color:C.text3}}>{r.tech} · {r.date}{r.autoIA?' · Auto-généré IA':''}</div>
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:r.statut==='validé'?C.green_l:C.orange_l,color:r.statut==='validé'?C.green:C.orange,fontWeight:600}}>
                {r.statut==='validé'?'Validé client':'En attente'}
              </span>
              <button onClick={()=>{const b=new Blob(['Rapport CleanIT — '+new Date().toLocaleDateString('fr-FR')],{type:'text/plain'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='rapport_terrain.txt';a.click()}} style={{fontSize:10,padding:'3px 8px',borderRadius:5,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit'}}>PDF ↓</button>
            </div>
          </div>
        ))}
        {rapports.length===0&&<div style={{padding:'20px 14px',fontSize:12,color:C.text3,fontStyle:'italic'}}>Aucun rapport</div>}
      </div>
    </div>
  );
}

const TABS = [
  {id:'dash',l:'Tableau de bord'},
  {id:'ordres',l:'Ordres de mission'},
  {id:'missions',l:'Missions actives'},
  {id:'comm',l:'Communication'},
  {id:'rapports',l:'Rapports'},
];

export default function Terrain(){
  // __TERRAIN_API__ — Chargement missions réelles
  const [realMissions, setRealMissions] = React.useState([]);
  const [realUsers, setRealUsers] = React.useState([]);
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const base = 'https://backend-cleanit-erp.vercel.app';
    const h = {'Authorization':'Bearer '+token};
    Promise.all([
      fetch(base+'/missions', {headers:h}).then(r=>r.json()).catch(()=>[]),
      fetch(base+'/users', {headers:h}).then(r=>r.json()).catch(()=>[])
    ]).then(([missions, users]) => {
      if(Array.isArray(missions) && missions.length > 0) setRealMissions(missions);
      if(Array.isArray(users) && users.length > 0) setRealUsers(users);
    });
  }, []);

  const navigate = useNavigate();
  const [tab,setTab] = useState('dash');
  const [missions,setMissions] = useState(MISSIONS_SEED);
  const [ordres,setOrdres] = useState(ORDRES_SEED);
  const [techs] = useState(TECHS_SEED);
  const [rapports] = useState(RAPPORTS_SEED);
  const [jobs,setJobs] = useState([]);

  useEffect(()=>{
    getJobs().then(j=>{
      if(j&&j.length>0){
        const myJobs = j.filter(job=>!missions.some(m=>m.site===job.site));
        setOrdres(prev=>[...ORDRES_SEED,...myJobs.slice(0,2).map((job,i)=>({
          id:'ORD-JOB-'+i,site:job.site||job.id,siteName:job.name,client:job.customer||'—',
          type:job.jobType||'Mission',deadline:job.endDate||'—',urgence:false,jobId:job.id,
        }))]);
      }
    }).catch(()=>{});
  },[]);

  const handleDispatch = (ordre,tech) => {
    const newMission = {
      id:'M-'+Date.now(),site:ordre.site,siteName:ordre.siteName,client:ordre.client,
      type:ordre.type,techIds:[tech.id],statut:'en_cours',pct:0,
      deadline:ordre.deadline,arrivee:'—',mode:'En attente',
      checklist:[{t:'Sécurité site vérifiée',done:false},{t:'Photos arrivée envoyées',done:false},{t:'Travaux effectués',done:false},{t:'Tests finaux',done:false}],
      messages:[],
    };
    setMissions(prev=>[...prev,newMission]);
    setOrdres(prev=>prev.filter(o=>o.id!==ordre.id));
  };

  const ordresCount = ordres.length;

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',fontFamily:'inherit'}}>
      <div style={{padding:'11px 20px',borderBottom:`1px solid ${C.border}`,background:C.white,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:30,height:30,borderRadius:8,background:C.blue_l,display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg></div>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:C.text}}>Gestion Terrain</div>
            <div style={{fontSize:10,color:C.text3}}>Chef de projet — missions filtrées par votre compte</div>
          </div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <div style={{fontSize:10,padding:'3px 9px',borderRadius:20,background:C.green_l,color:C.green,fontWeight:600,display:'flex',alignItems:'center',gap:4}}>
            <span style={{width:5,height:5,borderRadius:'50%',background:C.green,display:'inline-block',animation:'pulse 2s infinite'}}/>GPS Live
          </div>
          <button onClick={()=>navigate('/map')} style={{fontSize:11,padding:'5px 12px',borderRadius:6,border:'none',background:C.blue,color:'#fff',cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:4}}>
            🗺️ Carte Digital Twin
          </button>
        </div>
      </div>

      <div style={{display:'flex',borderBottom:`1px solid ${C.border}`,background:C.white,padding:'0 20px',overflowX:'auto',flexShrink:0}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'10px 14px',border:'none',background:'none',cursor:'pointer',fontSize:12,fontFamily:'inherit',color:tab===t.id?C.blue:C.text3,fontWeight:tab===t.id?700:400,borderBottom:tab===t.id?`2px solid ${C.blue}`:'2px solid transparent',marginBottom:-1,whiteSpace:'nowrap',position:'relative'}}>
            {t.l}
            {t.id==='ordres'&&ordresCount>0&&<span style={{position:'absolute',top:6,right:2,fontSize:9,background:C.blue,color:'#fff',padding:'1px 4px',borderRadius:8,fontWeight:700}}>{ordresCount}</span>}
          </button>
        ))}
      </div>

      <div style={{flex:1,overflowY:'auto'}}>
        {tab==='dash'&&<TabDashboard missions={missions} ordres={ordres} currentUser="chef@cleanit.cm"/>}
        {tab==='ordres'&&<TabOrdres ordres={ordres} techs={techs} onDispatch={handleDispatch}/>}
        {tab==='missions'&&<TabMissions missions={missions}/>}
        {tab==='comm'&&<TabCommunication missions={missions}/>}
        {tab==='rapports'&&<TabRapports rapports={rapports}/>}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}
