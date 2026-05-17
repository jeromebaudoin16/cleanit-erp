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
        <div style={{display:'flex',alignItems:'center',gap:7,fontSize:12,color:C.blue_d,fontWeight:500}}>🔔 {ordres.length} nouveau{ordres.length>1?'x':''} site{ordres.length>1?'s':''} assigné{ordres.length>1?'s':''} — {ordres.map(o=>o.site).join(', ')}</div>
        <button style={{fontSize:11,padding:'3px 9px',borderRadius:5,border:`1px solid ${C.blue}`,background:'none',color:C.blue,cursor:'pointer',fontFamily:'inherit'}}>Voir →</button>
      </div>}

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:12}}>
        {[
          {v:missions.length+ordres.length,l:'Sites actifs',c:C.blue,icon:'🏗️'},
          {v:ordres.length,l:'À dispatcher',c:C.orange,icon:'⏳'},
          {v:missions.filter(m=>m.statut==='en_cours').length,l:'En cours',c:C.green,icon:'⚡'},
          {v:missions.filter(m=>m.pct<50&&m.statut==='en_cours').length,l:'Retard potentiel',c:C.red,icon:'⚠️'},
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

function TabOrdres({ordres,techs,onDispatch}){
  const [selected,setSelected]=useState({});
  const [dispatched,setDispatched]=useState([]);

  return (
    <div style={{padding:'14px 20px',background:C.bg}}>
      <div style={{fontSize:11,color:C.text3,marginBottom:12,padding:'8px 12px',background:C.white,border:`1px solid ${C.border}`,borderRadius:6,display:'flex',alignItems:'center',gap:6}}>
        ℹ️ Missions issues de CleanITBooks — filtrées pour votre compte chef de projet
      </div>
      {ordres.filter(o=>!dispatched.includes(o.id)).map(ord=>{
        const recos = techs.map(t=>scoreIA(t,ord)).filter(Boolean).sort((a,b)=>b.score-a.score).slice(0,3);
        const sel = selected[ord.id];
        return (
          <div key={ord.id} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,marginBottom:12,overflow:'hidden'}}>
            <div style={{padding:'12px 16px',borderBottom:`1px solid ${C.border2}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,marginBottom:2}}>{ord.site} — {ord.type} · {ord.client}</div>
                <div style={{fontSize:11,color:C.text3}}>JOB CleanITBooks · Deadline {ord.deadline}</div>
              </div>
              <span style={{fontSize:11,padding:'3px 10px',borderRadius:20,background:ord.urgence?C.red_l:C.orange_l,color:ord.urgence?C.red:C.orange,fontWeight:700}}>{ord.urgence?'Urgent':'À dispatcher'}</span>
            </div>
            <div style={{padding:'12px 16px',background:C.purple_l,borderBottom:`1px solid #D4C5F9`}}>
              <div style={{fontSize:11,fontWeight:700,color:C.purple,marginBottom:8,display:'flex',alignItems:'center',gap:5}}>🧠 ChaCha IA — Propositions d'équipe</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                {recos.map((rec,i)=>(
                  <div key={rec.tech.id} onClick={()=>setSelected({...selected,[ord.id]:rec.tech.id})}
                    style={{background:sel===rec.tech.id?'#E6F1FB':'#fff',border:`1px solid ${sel===rec.tech.id?C.blue:'#D4C5F9'}`,borderRadius:8,padding:'10px',cursor:'pointer',transition:'all .15s'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                      <span style={{fontSize:11,fontWeight:500}}>Équipe {String.fromCharCode(65+i)}</span>
                      <span style={{fontSize:14,fontWeight:700,color:rec.score>80?C.green:rec.score>60?C.orange:C.red}}>{rec.score}</span>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                      <Avatar photo={rec.tech.photo} name={rec.tech.name} size={22}/>
                      <span style={{fontSize:11}}>{rec.tech.name.split(' ')[0]}</span>
                      <span style={{fontSize:10,color:rec.dist<5?C.green:C.orange}}>{rec.dist}km</span>
                    </div>
                    <div style={{fontSize:10,color:C.text3,fontStyle:'italic',lineHeight:1.3}}>{rec.raison.slice(0,70)}...</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{padding:'10px 16px',display:'flex',gap:8,alignItems:'center'}}>
              <button onClick={()=>{if(sel){setDispatched([...dispatched,ord.id]);alert(`Équipe notifiée pour ${ord.site} !`);onDispatch(ord,TECHS_SEED.find(t=>t.id===sel));setSelected({...selected,[ord.id]:null});}} }
                disabled={!sel}
                style={{fontSize:12,padding:'6px 16px',borderRadius:6,border:'none',background:sel?C.blue:'#D1D5DB',color:sel?'#fff':'#9CA3AF',cursor:sel?'pointer':'not-allowed',fontFamily:'inherit',fontWeight:600}}>
                Valider et notifier l'équipe
              </button>
              <button style={{fontSize:12,padding:'6px 14px',borderRadius:6,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit'}}>Reporter</button>
              <button onClick={()=>setSelected({...selected,[ord.id]:'manual'})}
                style={{fontSize:11,padding:'5px 12px',borderRadius:6,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit',marginLeft:'auto',color:C.text3}}>
                Choisir manuellement
              </button>
            </div>
          </div>
        );
      })}
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
            <button style={{fontSize:11,padding:'4px 10px',borderRadius:6,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit'}}>📤 Partager client</button>
            <button style={{fontSize:11,padding:'4px 10px',borderRadius:6,border:'none',background:C.red_l,color:C.red,cursor:'pointer',fontFamily:'inherit'}}>⚠️ Signaler</button>
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
                <span style={{fontSize:14,color:item.done?C.green:C.text3}}>{item.done?'✅':'⭕'}</span>
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
            <button style={{fontSize:10,padding:'3px 8px',borderRadius:5,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit'}}>📷 Galerie</button>
            <button style={{fontSize:10,padding:'3px 8px',borderRadius:5,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit'}}>🔗 Partager</button>
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
          <button style={{width:28,height:28,borderRadius:6,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>🎤</button>
          <button style={{width:28,height:28,borderRadius:6,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>📎</button>
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
          <button style={{fontSize:11,padding:'5px 12px',borderRadius:6,border:'none',background:C.blue,color:'#fff',cursor:'pointer',fontFamily:'inherit'}}>+ Nouveau rapport</button>
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
              <button style={{fontSize:10,padding:'3px 8px',borderRadius:5,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit'}}>PDF ↓</button>
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
          <div style={{width:30,height:30,borderRadius:8,background:C.blue_l,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15}}>🗺️</div>
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
