import { useState, useRef, useEffect, useCallback } from 'react';
import { getJobs } from '../services/cleanitbooks.api';

const C = {
  blue:'#185FA5', blue_l:'#E6F1FB', blue_d:'#0C447C',
  green:'#3B6D11', green_l:'#EAF3DE', green_d:'#27500A',
  orange:'#854F0B', orange_l:'#FAEEDA', orange_d:'#633806',
  red:'#A32D2D', red_l:'#FCEBEB', red_d:'#501313',
  purple:'#403294', purple_l:'#F3EEF9', purple_d:'#26215C',
  border:'#E5E7EB', border2:'#F3F4F6',
  text:'#111827', text2:'#374151', text3:'#6B7280',
  white:'#FFFFFF', bg:'#F9FAFB',
};

const DEPT = {
  terrain:   { color:C.blue,   bg:C.blue_l,   dc:C.blue_d,   label:'Terrain',    emoji:'⚒' },
  commercial:{ color:C.green,  bg:C.green_l,  dc:C.green_d,  label:'Commercial', emoji:'⊕' },
  rh:        { color:C.orange, bg:C.orange_l, dc:C.orange_d, label:'RH & Équipe',emoji:'⊗' },
  finance:   { color:C.purple, bg:C.purple_l, dc:C.purple_d, label:'Finance',    emoji:'💰' },
  direction: { color:C.red,    bg:C.red_l,    dc:C.red_d,    label:'Direction',  emoji:'◎' },
  personnel: { color:C.text3,  bg:C.border2,  dc:C.text2,    label:'Personnel',  emoji:'◯' },
};

const EV_TYPES = [
  {id:'reunion_interne', label:'Réunion interne (CleanIT Comm)', emoji:'RéInt'},
  {id:'reunion_externe', label:'Réunion externe (Zoom/Teams/Meet)', emoji:'RéExt'},
  {id:'mission',         label:'Mission terrain', emoji:'⚒'},
  {id:'formation',       label:'Formation / Certification', emoji:'Form.'},
  {id:'conge',           label:'Congé / Absence', emoji:'Congé'},
  {id:'jalon',           label:'Jalon projet', emoji:'Jalon'},
  {id:'echeance',        label:'Échéance financière', emoji:'Éch.'},
  {id:'personnel',       label:'Événement personnel', emoji:'◯'},
];

const VISIBILITY = [
  {id:'personnel', label:'🔒 Personnel — seulement moi'},
  {id:'equipe',    label:'👥 Mon équipe'},
  {id:'entreprise',label:'🏢 Toute l\'entreprise'},
  {id:'partage',   label:'📤 Partagé (lien externe)'},
];

const WEEKS = [
  {label:'5 – 9 mai 2025',  days:[5,6,7,8,9]},
  {label:'12 – 16 mai 2025',days:[12,13,14,15,16]},
  {label:'19 – 23 mai 2025',days:[19,20,21,22,23]},
  {label:'26 – 30 mai 2025',days:[26,27,28,29,30]},
];
const DAYS_NAMES = ['Lun','Mar','Mer','Jeu','Ven'];
const TODAY_NUM = 14;
const CURRENT_WEEK = 1;
const HOURS = [8,9,10,11,12,13,14,15,16,17];
const H_PX = 48;

const SEED_EVENTS = []; // Données réelles depuis API

const CHACHA_KB = {
  'réunion':   (t) => `Réunion planifiée. ChaCha vérifie les disponibilités... Marie Kamga et Thomas Ngono sont libres ${t?.includes('lundi')?'lundi':'mardi'} prochain à 10h. Canal CleanIT Comm créé automatiquement. Souhaitez-vous que j'envoie les invitations ?`,
  'génère':    () => 'Planning semaine du 19 mai généré : Lun — Mission GRA-001 (Samuel Djomo). Mar — Deadline YDE-001 + Réunion commerciale Orange. Mer — Formation H2B2 (Jean Mbarga). Jeu — Revue budget Finance. Ven — Paie personnel. Voulez-vous que j\'applique ce planning ?',
  'conflit':   () => 'Conflit résolu : je propose de transférer YDE-001 à Samuel Djomo (disponible, score 78/100). Congé Ali Moussa confirmé les 16–18 mai. Souhaitez-vous confirmer le transfert de mission ?',
  'disponible':() => 'Disponibilités semaine prochaine : Samuel Djomo (lun–ven, charge 40%), Jean Mbarga (mer–ven), Pierre Etoga (lun–mer). Ali Moussa en congé vendredi.',
  'planning':  () => 'Pour générer un planning complet, précisez la semaine et les priorités. Ex : "Génère le planning de la semaine du 19 mai avec les missions terrain en priorité."',
  'mission':   () => 'Quelle mission planifier ? Précisez le site, le type de travail et la durée. ChaCha proposera les meilleurs techniciens selon compétences, disponibilité et distance.',
  'bloque':    () => 'Créneau bloqué dans votre planning personnel. Les autres utilisateurs verront "Occupé" sans détail. Quand souhaitez-vous ce time block ?',
  'annule':    () => 'Quel événement souhaitez-vous annuler ? Précisez le titre ou la date. ChaCha notifiera automatiquement les participants.',
};

const fmtDay = (num) => {
  const d = new Date(2025,4,num);
  return DAYS_NAMES[d.getDay()===0?6:d.getDay()-1]||'';
};

function Av({photo,name,size=18}){
  if(photo) return <img src={photo} alt={name||''} style={{width:size,height:size,borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>;
  const init=(name||'??').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  return <div style={{width:size,height:size,borderRadius:'50%',background:C.blue_l,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.35,fontWeight:500,color:C.blue_d,flexShrink:0}}>{init}</div>;
}

function EvDetail({ev, onClose}){
  const d = DEPT[ev.dept]||DEPT.terrain;
  const type = EV_TYPES.find(t=>t.id===ev.type)||{};
  return (
    <div style={{position:'fixed',top:0,right:0,bottom:0,width:340,background:C.white,boxShadow:'-4px 0 24px rgba(0,0,0,.12)',zIndex:400,display:'flex',flexDirection:'column',borderLeft:`1px solid ${C.border}`}}>

      {/* Widget Missions Réelles */}
      <div style={{background:'white',borderRadius:12,border:'1px solid #eee',padding:20,marginBottom:20}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h3 style={{margin:0,fontSize:16,fontWeight:700,color:'#111'}}>Missions en cours</h3>
          <span style={{background:'#DBEAFE',color:'#1D4ED8',borderRadius:20,padding:'3px 12px',fontSize:12,fontWeight:600}}>
            {realMissions.filter(m=>m.status==='in_progress').length} actives
          </span>
        </div>
        {loadingPlan ? (
          <div style={{textAlign:'center',padding:20,color:'#888'}}>Chargement...</div>
        ) : realMissions.length === 0 ? (
          <div style={{textAlign:'center',padding:20,color:'#888',fontSize:13}}>Aucune mission</div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {realMissions.map(m=>{
              const tech = realUsers.find(u=>u.id===m.tech_id);
              const colors = {in_progress:{bg:'#DBEAFE',text:'#1D4ED8',label:'En cours'},
                pending:{bg:'#FEF3C7',text:'#D97706',label:'En attente'},
                done:{bg:'#DCFCE7',text:'#16A34A',label:'Terminé'}};
              const col = colors[m.status]||colors.pending;
              return (
                <div key={m.id} style={{padding:'12px 14px',background:'#F8FAFC',borderRadius:8,border:'1px solid #E2E8F0'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:'#111'}}>{m.code} · {m.client}</div>
                      <div style={{fontSize:11,color:'#888'}}>{m.site_name||m.site} · {m.type||'Mission'}</div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{background:col.bg,color:col.text,borderRadius:20,
                        padding:'3px 10px',fontSize:11,fontWeight:600}}>{col.label}</span>
                      {tech&&<span style={{fontSize:11,color:'#555'}}>👷 {tech.firstName} {tech.lastName}</span>}
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{flex:1,background:'#E2E8F0',borderRadius:4,height:6}}>
                      <div style={{width:(m.progress||0)+'%',height:'100%',
                        background:col.text,borderRadius:4,transition:'width .3s'}}/>
                    </div>
                    <span style={{fontSize:11,fontWeight:700,color:col.text,minWidth:30}}>{m.progress||0}%</span>
                    {m.deadline&&<span style={{fontSize:10,color:'#888'}}>📅 {m.deadline}</span>}
                  </div>
                  <div style={{display:'flex',gap:6,marginTop:8}}>
                    {m.status!=='done'&&(
                      <>
                        <button onClick={()=>updateMissionStatus(m.id,'in_progress',Math.min((m.progress||0)+10,100))}
                          style={{background:'#DBEAFE',border:'none',borderRadius:6,padding:'4px 10px',
                            color:'#1D4ED8',fontSize:11,fontWeight:600,cursor:'pointer'}}>+10%</button>
                        <button onClick={()=>updateMissionStatus(m.id,'done',100)}
                          style={{background:'#DCFCE7',border:'none',borderRadius:6,padding:'4px 10px',
                            color:'#16A34A',fontSize:11,fontWeight:600,cursor:'pointer'}}>✓ Terminer</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{padding:'14px 18px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:32,height:32,borderRadius:8,background:d.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17}}>{type.emoji||d.emoji}</div>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:C.text}}>{ev.titre}</div>
            <div style={{fontSize:11,color:C.text3}}>{d.label} · {type.label||''}</div>
          </div>
        </div>
        <button onClick={onClose} style={{border:'none',background:'none',cursor:'pointer',fontSize:20,color:C.text3,lineHeight:1}}>×</button>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'14px 18px',display:'flex',flexDirection:'column',gap:10}}>
        <div style={{display:'flex',flex:'column',gap:6,fontSize:12,color:C.text3}}>
          {[
            ['Responsable', <div style={{display:'flex',alignItems:'center',gap:5}}><Av photo={ev.photo} name={ev.resp} size={18}/>{ev.resp}</div>],
            ['Date', `${ev.debut} → ${ev.fin}`],
            ['Horaire', `${ev.hStart}h00 – ${ev.hEnd}h00`],
            ['Visibilité', VISIBILITY.find(v=>v.id===ev.visib)?.label||'—'],
          ].map(([l,v])=>(
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${C.border2}`,alignItems:'center'}}>
              <span style={{color:C.text3}}>{l}</span><span style={{fontWeight:500,color:C.text,textAlign:'right'}}>{v}</span>
            </div>
          ))}
          {ev.ai&&<div style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:C.purple,padding:'6px 0'}}><span style={{fontSize:14}}>⚡</span>Planifié par ChaCha</div>}
          {ev.conflit&&<div style={{padding:'8px 10px',background:C.orange_l,borderRadius:6,fontSize:11,color:C.orange_d,border:`1px solid #FAC775`}}>⚠️ Conflit détecté : {ev.conflitMsg}</div>}
          {ev.urgent&&<div style={{padding:'8px 10px',background:C.red_l,borderRadius:6,fontSize:11,color:C.red_d,fontWeight:600}}>⚠️ Échéance urgente — action requise</div>}
        </div>

        {ev.email_info&&(
          <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:'10px 12px'}}>
            <div style={{fontSize:10,color:C.text3,marginBottom:4}}>Email reçu</div>
            <div style={{fontSize:12,color:C.text,marginBottom:3}}>{ev.email_info}</div>
            <button onClick={()=>alert('Email complet affiché')} style={{fontSize:11,padding:'4px 10px',borderRadius:5,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit',color:C.text3}}>Voir l'email →</button>
          </div>
        )}
      </div>

      <div style={{padding:'12px 18px',borderTop:`1px solid ${C.border}`,display:'flex',flexDirection:'column',gap:7,flexShrink:0}}>
        {ev.type==='reunion_interne'&&ev.canal&&(
          <button onClick={()=>alert(`Ouverture canal ${ev.canal} dans CleanIT Comm`)} style={{width:'100%',padding:'9px',borderRadius:7,border:'none',background:C.blue,color:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            💬 Rejoindre dans CleanIT Comm →
          </button>
        )}
        {ev.lien_zoom&&(
          <button onClick={()=>alert(`Ouverture Zoom: ${ev.lien_zoom}`)} style={{width:'100%',padding:'9px',borderRadius:7,border:'none',background:C.blue,color:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            📹 Rejoindre la réunion (Zoom) →
          </button>
        )}
        {ev.lien_module&&(
          <button onClick={()=>alert(`Navigation vers module: ${ev.lien_module}${ev.lien_detail?' — '+ev.lien_detail:''}`)} style={{width:'100%',padding:'9px',borderRadius:7,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit',fontSize:12,color:C.text2,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            {ev.lien_module==='terrain'?'🗺️ Ouvrir dans Gestion Terrain':ev.lien_module==='cleanitbooks'?'📊 Ouvrir dans CleanITBooks':ev.lien_module==='approvals'?'✅ Traiter dans Approvals':ev.lien_module==='rh'?'👥 Dossier RH':ev.lien_module==='bi'?'📈 Business Intelligence':'Ouvrir →'}
          </button>
        )}
        <button onClick={onClose} style={{width:'100%',padding:'8px',borderRadius:7,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit',fontSize:12,color:C.text3}}>Fermer</button>
      </div>
    </div>
  );
}

function EventBlock({ev,onClick}){
  const d=DEPT[ev.dept]||DEPT.terrain;
  const top=(ev.hStart-8)*H_PX;
  const height=Math.max((ev.hEnd-ev.hStart)*H_PX-4,22);
  return (
    <div onClick={()=>onClick(ev)}
      style={{position:'absolute',left:3,right:3,top,height,borderRadius:6,padding:'4px 7px',background:ev.urgent?C.red_l:d.bg,color:d.dc,display:'flex',alignItems:'flex-start',gap:5,cursor:'pointer',overflow:'hidden',border:ev.urgent?`1px solid ${C.red}`:ev.conflit?`1px solid ${C.orange}`:'none',transition:'filter .15s',zIndex:2}}
      onMouseEnter={e=>e.currentTarget.style.filter='brightness(.92)'}
      onMouseLeave={e=>e.currentTarget.style.filter=''}>
      <Av photo={ev.photo} name={ev.resp} size={15}/>
      <div style={{minWidth:0,flex:1}}>
        <div style={{fontSize:10,fontWeight:500,lineHeight:1.2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ev.titre}</div>
        {height>35&&<div style={{fontSize:9,opacity:.8,marginTop:1}}>{ev.resp}</div>}
        {height>60&&ev.ai&&<div style={{fontSize:9,marginTop:2,opacity:.7}}>⚡ ChaCha</div>}
      </div>
    </div>
  );
}

function WeekView({events,weekIdx,onEventClick}){
  const week=WEEKS[weekIdx];
  return (
    <div style={{flex:1,overflow:'auto'}}>
      <div style={{display:'grid',gridTemplateColumns:'44px repeat(5,1fr)',position:'sticky',top:0,background:C.white,zIndex:10,borderBottom:`1px solid ${C.border}`}}>
        <div/>
        {DAYS_NAMES.map((d,i)=>{
          const num=week.days[i];
          const isToday=num===TODAY_NUM&&weekIdx===CURRENT_WEEK;
          return (
            <div key={i} style={{textAlign:'center',padding:'8px 0',color:isToday?C.blue:C.text3,fontSize:11}}>
              {d}<br/>
              <strong style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:22,height:22,borderRadius:'50%',background:isToday?C.blue:'transparent',color:isToday?'#fff':C.text,fontSize:12,fontWeight:isToday?600:500}}>{num}</strong>
            </div>
          );
        })}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'44px repeat(5,1fr)'}}>
        <div>
          {HOURS.map(h=>(
            <div key={h} style={{height:H_PX,borderTop:`1px solid ${C.border2}`,position:'relative'}}>
              <span style={{position:'absolute',top:-8,left:4,fontSize:9,color:C.text3}}>{h}h</span>
            </div>
          ))}
        </div>
        {week.days.map((dayNum,di)=>{
          const isToday=dayNum===TODAY_NUM&&weekIdx===CURRENT_WEEK;
          const dayEvs=events.filter(e=>{
            const ds=Number(e.debut.split('-')[2]),de=Number(e.fin.split('-')[2]);
            return dayNum>=ds&&dayNum<=de;
          });
          return (
            <div key={di} style={{borderLeft:`1px solid ${C.border}`,position:'relative',height:HOURS.length*H_PX,background:isToday?'rgba(24,95,165,.03)':'transparent'}}>
              {HOURS.map(h=><div key={h} style={{height:H_PX,borderTop:`1px solid ${C.border2}`}}/>)}
              {isToday&&<div style={{position:'absolute',top:110,left:0,right:0,height:1.5,background:C.red,zIndex:3}}><div style={{position:'absolute',left:-4,top:-3,width:7,height:7,borderRadius:'50%',background:C.red}}/></div>}
              {dayEvs.map(ev=><EventBlock key={ev.id} ev={ev} onClick={onEventClick}/>)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthView({events,onEventClick}){
  const days=Array.from({length:31},(_,i)=>i+1);
  return (
    <div style={{flex:1,overflow:'auto',padding:'12px 16px'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:4}}>
        {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d=><div key={d} style={{fontSize:10,fontWeight:500,color:C.text3,textAlign:'center',padding:'4px 0'}}>{d}</div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
        {Array.from({length:3}).map((_,i)=><div key={'e'+i} style={{minHeight:56,background:C.white,border:`1px solid ${C.border}`,borderRadius:4,opacity:.3}}/>)}
        {days.map(day=>{
          const isToday=day===TODAY_NUM;
          const dayEvs=events.filter(e=>{const ds=Number(e.debut.split('-')[2]),de=Number(e.fin.split('-')[2]);return day>=ds&&day<=de;});
          const isWe=(day+2)%7>=5;
          return (
            <div key={day} style={{minHeight:56,background:C.white,border:`1px solid ${isToday?C.blue:C.border}`,borderRadius:4,padding:4,opacity:isWe?.4:1}}>
              <div style={{fontSize:10,fontWeight:500,marginBottom:2,display:'inline-flex',alignItems:'center',justifyContent:'center',width:18,height:18,borderRadius:'50%',background:isToday?C.blue:'transparent',color:isToday?'#fff':C.text}}>{day}</div>
              {dayEvs.slice(0,2).map(ev=>{
                const d=DEPT[ev.dept]||DEPT.terrain;
                return <div key={ev.id} onClick={()=>onEventClick(ev)} style={{fontSize:9,padding:'1px 4px',borderRadius:3,background:ev.urgent?C.red_l:d.bg,color:d.dc,marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontWeight:500,cursor:'pointer'}}>{ev.titre.slice(0,16)}</div>;
              })}
              {dayEvs.length>2&&<div style={{fontSize:9,color:C.text3}}>+{dayEvs.length-2}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgendaView({events,onEventClick}){
  const groups=[
    {day:14,label:"Mercredi 14 mai — Aujourd'hui"},
    {day:15,label:"Jeudi 15 mai"},{day:16,label:"Vendredi 16 mai"},
    {day:19,label:"Lundi 19 mai"},{day:20,label:"Mardi 20 mai"},
    {day:21,label:"Mercredi 21 mai"},{day:28,label:"Mercredi 28 mai"},
    {day:30,label:"Vendredi 30 mai"},
  ];
  return (
    <div style={{flex:1,overflowY:'auto'}}>
      {groups.map(({day,label})=>{
        const evs=events.filter(e=>{const ds=Number(e.debut.split('-')[2]),de=Number(e.fin.split('-')[2]);return day>=ds&&day<=de;});
        if(!evs.length) return null;
        return (
          <div key={day}>
            <div style={{padding:'8px 16px',fontSize:11,fontWeight:600,color:C.text3,borderBottom:`1px solid ${C.border}`,position:'sticky',top:0,background:C.white,zIndex:5}}>{label}</div>
            {evs.map(ev=>{
              const d=DEPT[ev.dept]||DEPT.terrain;
              const type=EV_TYPES.find(t=>t.id===ev.type)||{};
              return (
                <div key={ev.id} onClick={()=>onEventClick(ev)} style={{padding:'10px 16px',borderBottom:`1px solid ${C.border2}`,cursor:'pointer',borderLeft:`3px solid ${ev.urgent?C.red:d.color}`,background:ev.conflit?'rgba(133,79,11,.04)':ev.urgent?'rgba(163,45,45,.04)':'transparent'}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                  onMouseLeave={e=>e.currentTarget.style.background=ev.conflit?'rgba(133,79,11,.04)':ev.urgent?'rgba(163,45,45,.04)':'transparent'}>
                  <div style={{fontSize:10,color:C.text3,marginBottom:3}}>{ev.hStart}h{ev.hEnd!==ev.hStart?`–${ev.hEnd}h`:' · Toute la journée'}{ev.urgent?' · ⚠️ Urgent':''}{ev.conflit?' · ⚠️ Conflit':''}</div>
                  <div style={{fontSize:13,fontWeight:500,color:C.text,marginBottom:3,display:'flex',alignItems:'center',gap:7}}>
                    <span style={{fontSize:10,padding:'2px 6px',borderRadius:4,background:d.bg,color:d.dc,fontWeight:600}}>{d.label.split(' ')[0]}</span>{ev.titre}
                    {ev.ai&&<span style={{fontSize:10,color:C.purple,opacity:.7}}>⚡</span>}
                  </div>
                  <div style={{fontSize:11,color:C.text3,display:'flex',alignItems:'center',gap:5}}><Av photo={ev.photo} name={ev.resp} size={16}/>{ev.resp} · {d.label}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function AddModal({onClose,onAdd}){
  const [form,setForm]=useState({titre:'',dept:'terrain',type:'reunion_interne',resp:'',debut:'2025-05-14',fin:'2025-05-14',hStart:'09',hEnd:'10',visib:'entreprise',notes:''});
  const submit=()=>{
    if(!form.titre.trim()) return;
    onAdd({...form,id:Date.now(),hStart:Number(form.hStart),hEnd:Number(form.hEnd),conflit:false,photo:'',ai:false,urgent:false});
    onClose();
  };
  const inp={width:'100%',padding:'8px 10px',borderRadius:7,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit',outline:'none',boxSizing:'border-box'};
  const lbl={fontSize:10,color:C.text3,marginBottom:4,display:'block',textTransform:'uppercase',letterSpacing:.5};
  return (
    <div style={{position:'fixed',inset:0,zIndex:500,background:'rgba(0,0,0,.4)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.white,borderRadius:12,width:500,boxShadow:'0 20px 60px rgba(0,0,0,.2)',overflow:'hidden',maxHeight:'90vh',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'14px 18px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <span style={{fontSize:14,fontWeight:600}}>Nouvel événement</span>
          <button onClick={onClose} style={{border:'none',background:'none',cursor:'pointer',fontSize:20,color:C.text3}}>×</button>
        </div>
        <div style={{padding:'16px 18px',overflowY:'auto',display:'flex',flexDirection:'column',gap:12}}>
          <div><label style={lbl}>Titre</label><input value={form.titre} onChange={e=>setForm({...form,titre:e.target.value})} placeholder="Titre de l'événement" style={{...inp,fontSize:14,fontWeight:500}}/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <div><label style={lbl}>Type</label>
              <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={inp}>
                {EV_TYPES.map(t=><option key={t.id} value={t.id}>{t.emoji} {t.label}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Département</label>
              <select value={form.dept} onChange={e=>setForm({...form,dept:e.target.value})} style={inp}>
                {Object.entries(DEPT).map(([k,d])=><option key={k} value={k}>{d.emoji} {d.label}</option>)}
              </select>
            </div>
          </div>
          <div><label style={lbl}>Responsable / Participants</label><input value={form.resp} onChange={e=>setForm({...form,resp:e.target.value})} placeholder="Nom ou équipe" style={inp}/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8}}>
            <div style={{gridColumn:'1/3'}}><label style={lbl}>Date début</label><input type="date" value={form.debut} onChange={e=>setForm({...form,debut:e.target.value})} style={inp}/></div>
            <div style={{gridColumn:'3/5'}}><label style={lbl}>Date fin</label><input type="date" value={form.fin} onChange={e=>setForm({...form,fin:e.target.value})} style={inp}/></div>
            <div><label style={lbl}>Début</label>
              <select value={form.hStart} onChange={e=>setForm({...form,hStart:e.target.value})} style={inp}>
                {HOURS.map(h=><option key={h} value={String(h).padStart(2,'0')}>{h}h00</option>)}
              </select>
            </div>
            <div><label style={lbl}>Fin</label>
              <select value={form.hEnd} onChange={e=>setForm({...form,hEnd:e.target.value})} style={inp}>
                {HOURS.map(h=><option key={h} value={String(h).padStart(2,'0')}>{h}h00</option>)}
              </select>
            </div>
          </div>
          <div><label style={lbl}>Visibilité</label>
            <select value={form.visib} onChange={e=>setForm({...form,visib:e.target.value})} style={inp}>
              {VISIBILITY.map(v=><option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
          </div>
          <div><label style={lbl}>Notes</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={2} placeholder="Lieu, lien de réunion, contexte..." style={{...inp,resize:'vertical'}}/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <div><label style={lbl}>Répétition</label>
              <select value={form.recurrence||'none'} onChange={e=>setForm({...form,recurrence:e.target.value})} style={inp}>
                <option value="none">Pas de répétition</option>
                <option value="daily">Chaque jour</option>
                <option value="weekly">Chaque semaine</option>
                <option value="biweekly">Toutes les 2 semaines</option>
                <option value="monthly">Chaque mois</option>
              </select>
            </div>
            <div><label style={lbl}>Priorité</label>
              <select value={form.priority||'normale'} onChange={e=>setForm({...form,priority:e.target.value})} style={inp}>
                <option value="faible">Faible</option>
                <option value="normale">Normale</option>
                <option value="haute">Haute</option>
                <option value="critique">Critique</option>
              </select>
            </div>
          </div>
          <div style={{padding:'9px 12px',borderRadius:7,background:C.purple_l,border:`1px solid #D4C5F9`,fontSize:11,color:C.purple_d,display:'flex',alignItems:'center',gap:7}}>
            <span style={{fontSize:14}}>⚡</span>ChaCha vérifiera les disponibilités et notifiera automatiquement les participants
          </div>
        </div>
        <div style={{padding:'12px 18px',borderTop:`1px solid ${C.border}`,display:'flex',justifyContent:'flex-end',gap:8,flexShrink:0}}>
          <button onClick={onClose} style={{padding:'8px 16px',borderRadius:7,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit',fontSize:13}}>Annuler</button>
          <button onClick={submit} style={{padding:'8px 20px',borderRadius:7,border:'none',background:C.blue,color:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:13,fontWeight:600}}>Créer l'événement</button>
        </div>
      </div>
    </div>
  );
}

export default function Planning(){
  const [realMissions, setRealMissions] = useState([]);
  const [realUsers, setRealUsers] = useState([]);
  const [loadingPlan, setLoadingPlan] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_URL || 'https://backend-cleanit-erp.vercel.app';
    Promise.all([
      fetch(base+'/missions',{headers:{'Authorization':'Bearer '+token}}).then(r=>r.json()).catch(()=>[]),
      fetch(base+'/users',{headers:{'Authorization':'Bearer '+token}}).then(r=>r.json()).catch(()=>[]),
    ]).then(([missions, users]) => {
      if(Array.isArray(missions)) setRealMissions(missions);
      if(Array.isArray(users)) setRealUsers(users);
    }).finally(() => setLoadingPlan(false));
  }, []);

  const updateMissionStatus = async (id, status, progress) => {
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_URL || 'https://backend-cleanit-erp.vercel.app';
    await fetch(base+'/missions/'+id, {
      method:'PUT',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
      body: JSON.stringify({status, progress})
    }).then(r=>r.json()).catch(()=>null);
    setRealMissions(ms => ms.map(m => m.id===id ? {...m, status, progress} : m));
  };

  const [view,setView]=useState('semaine');
  const [weekIdx,setWeekIdx]=useState(CURRENT_WEEK);
  const [events,setEvents]=useState(SEED_EVENTS);
  const [depts,setDepts]=useState(Object.keys(DEPT).reduce((a,k)=>({...a,[k]:true}),{}));
  const [selEv,setSelEv]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [chachaVal,setChachaVal]=useState('');
  const [chachaMsg,setChachaMsg]=useState('');
  const [chachaFocus,setChachaFocus]=useState(false);
  const chachaRef=useRef(null);

  useEffect(()=>{
    getJobs().then(jobs=>{
      if(!jobs?.length) return;
      const newEvs=jobs.slice(0,3).map((j,i)=>({
        id:1000+i,titre:j.name||j.site||'Mission',dept:'terrain',type:'mission',
        resp:j.chefProjet||'Chef projet',photo:'',
        debut:j.startDate?.slice(0,10)||'2025-05-19',
        fin:j.endDate?.slice(0,10)||'2025-05-23',
        hStart:8,hEnd:17,visib:'entreprise',conflit:false,ai:true,
        lien_module:'terrain',lien_detail:j.site||j.id,
      }));
      setEvents(p=>[...SEED_EVENTS,...newEvs.filter(e=>!SEED_EVENTS.some(s=>s.titre===e.titre))]);
    }).catch(()=>{});
  },[]);

  const handleChacha=useCallback((e)=>{
    if(e.key!=='Enter') return;
    const v=chachaVal.trim().toLowerCase();
    if(!v) return;
    const key=Object.keys(CHACHA_KB).find(k=>v.includes(k));
    const rep=key?CHACHA_KB[key](v):'Je comprends votre demande. Analyse des disponibilités et contraintes... Pouvez-vous préciser la semaine et le type d\'activité ?';
    setChachaMsg(rep);
    setChachaVal('');
    setTimeout(()=>setChachaMsg(''),10000);
  },[chachaVal]);

  const SUGGS=['Réunion MTN lundi 10h','Génère planning semaine prochaine','Conflit vendredi — résoudre','Bloque 2h demain matin'];
  const filteredEvs=events.filter(e=>depts[e.dept]);
  const conflits=events.filter(e=>e.conflit);
  const VIEWS=[{id:'semaine',l:'Semaine'},{id:'mois',l:'Mois'},{id:'agenda',l:'Agenda'},{id:'taches',l:'Tâches ⚡'}];
  const [tasks,setTasks]=useState([
    {id:1,titre:'Finaliser rapport DLA-001',duree:90,deadline:'2025-05-16',priorite:'haute',done:false,dept:'terrain'},
    {id:2,titre:'Préparer présentation Orange Q2',duree:60,deadline:'2025-05-14',priorite:'critique',done:false,dept:'commercial'},
    {id:3,titre:'Déclaration TVA mai',duree:45,deadline:'2025-05-16',priorite:'critique',done:false,dept:'finance'},
    {id:4,titre:'Évaluation mensuelle équipe',duree:120,deadline:'2025-05-20',priorite:'normale',done:false,dept:'rh'},
    {id:5,titre:'Mise à jour certifications terrain',duree:30,deadline:'2025-05-22',priorite:'haute',done:false,dept:'terrain'},
  ]);
  const [newTask,setNewTask]=useState({titre:'',duree:30,deadline:'',priorite:'normale',dept:'terrain'});

  return (
    <div style={{display:'flex',height:'100%',fontFamily:'inherit'}}>
      {/* SIDEBAR */}
      <div style={{width:210,borderRight:`1px solid ${C.border}`,display:'flex',flexDirection:'column',background:C.white,flexShrink:0}}>
        <div style={{padding:'13px 14px 10px'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
            <span style={{fontSize:17}}>📅</span>
            <span style={{fontSize:14,fontWeight:600,color:C.text}}>Planning</span>
          </div>
          {/* Mini cal */}
          <div style={{marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:7}}>
              <span style={{fontSize:11,fontWeight:600}}>Mai 2025</span>
              <div style={{display:'flex',gap:2}}>
                <button style={{width:17,height:17,border:`1px solid ${C.border}`,borderRadius:4,background:'none',cursor:'pointer',fontSize:10,lineHeight:1}}>‹</button>
                <button style={{width:17,height:17,border:`1px solid ${C.border}`,borderRadius:4,background:'none',cursor:'pointer',fontSize:10,lineHeight:1}}>›</button>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',textAlign:'center',rowGap:2}}>
              {['L','M','M','J','V','S','D'].map((d,i)=><div key={i} style={{fontSize:9,color:C.text3,padding:'1px 0'}}>{d}</div>)}
              {[null,null,null,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31].map((d,i)=>(
                <div key={i} style={{fontSize:9,padding:'2px 1px',borderRadius:'50%',background:d===TODAY_NUM?C.blue:'transparent',color:d===TODAY_NUM?'#fff':d?C.text:'',cursor:d?'pointer':'default',fontWeight:d===TODAY_NUM?600:400}}>{d||''}</div>
              ))}
            </div>
          </div>
          <button onClick={()=>setShowAdd(true)} style={{width:'100%',padding:'7px',borderRadius:7,border:'none',background:C.blue,color:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>
            + Nouvel événement
          </button>
        </div>
        <div style={{padding:'10px 14px',borderTop:`1px solid ${C.border}`}}>
          <div style={{fontSize:10,fontWeight:600,color:C.text3,marginBottom:7,textTransform:'uppercase',letterSpacing:.5}}>Calendriers</div>
          <div style={{display:'flex',flexDirection:'column',gap:5}}>
            {Object.entries(DEPT).map(([k,d])=>(
              <label key={k} style={{display:'flex',alignItems:'center',gap:7,cursor:'pointer',fontSize:11,userSelect:'none'}}>
                <div onClick={()=>setDepts(p=>({...p,[k]:!p[k]}))} style={{width:14,height:14,borderRadius:3,background:depts[k]?d.color:C.border2,border:`1px solid ${depts[k]?d.color:C.border}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  {depts[k]&&<span style={{color:'#fff',fontSize:9,lineHeight:1,fontWeight:600}}>✓</span>}
                </div>
                <span style={{width:7,height:7,borderRadius:'50%',background:d.color,flexShrink:0}}/>
                <span style={{color:C.text}}>{d.label}</span>
              </label>
            ))}
          </div>
        </div>
        {/* Briefing IA */}
        <div style={{margin:'10px 14px',padding:'10px',borderRadius:8,background:C.purple_l,border:`1px solid #D4C5F9`,flex:1}}>
          <div style={{fontSize:10,fontWeight:600,color:C.purple,marginBottom:6,display:'flex',alignItems:'center',gap:4}}>⚡ Briefing ChaCha</div>
          <div style={{fontSize:11,color:C.text2,lineHeight:1.5}}>
            {`${filteredEvs.filter(e=>{const d=Number(e.debut.split('-')[2]),de=Number(e.fin.split('-')[2]);return TODAY_NUM>=d&&TODAY_NUM<=de;}).length} événements aujourd'hui`}
            {conflits.length>0&&<><br/><span style={{color:C.red,fontWeight:600}}>{conflits.length} conflit{conflits.length>1?'s':''} détecté{conflits.length>1?'s':''}</span></>}
            <br/>Prochain : <span style={{color:C.text,fontWeight:600}}>Formation CACES 08h</span>
          </div>
        </div>
      </div>

      {/* ZONE PRINCIPALE */}
      <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>
        {/* BARRE CHACHA */}
        <div style={{padding:'8px 16px',borderBottom:`1px solid ${C.border}`,background:C.white,flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:7,padding:'7px 12px',borderRadius:8,border:`1px solid ${chachaFocus?C.blue:C.border}`,background:C.bg,transition:'border-color .15s'}}>
            <span style={{fontSize:14}}>⚡</span>
            <input ref={chachaRef} value={chachaVal} onChange={e=>setChachaVal(e.target.value)} onKeyDown={handleChacha} onFocus={()=>setChachaFocus(true)} onBlur={()=>setChachaFocus(false)} placeholder="Planifiez avec ChaCha — ex: réunion MTN vendredi 10h, ou génère mon planning..." style={{flex:1,border:'none',background:'transparent',fontSize:12,fontFamily:'inherit',outline:'none',color:C.text}}/>
            <kbd style={{fontSize:9,padding:'2px 5px',borderRadius:4,border:`1px solid ${C.border}`,color:C.text3}}>↵</kbd>
          </div>
          {chachaMsg&&(
            <div style={{marginTop:8,padding:'9px 12px',borderRadius:7,background:C.purple_l,border:`1px solid #D4C5F9`,fontSize:12,color:C.purple_d}}>
              ⚡ {chachaMsg}
            </div>
          )}
          {!chachaMsg&&chachaFocus&&(
            <div style={{marginTop:6,display:'flex',gap:5,flexWrap:'wrap'}}>
              {SUGGS.map(s=>(
                <button key={s} onClick={()=>{setChachaVal(s);chachaRef.current?.focus();}} style={{fontSize:10,padding:'3px 9px',borderRadius:20,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',fontFamily:'inherit',color:C.text3}}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* NAV */}
        <div style={{padding:'8px 16px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',background:C.white,flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <button onClick={()=>setWeekIdx(CURRENT_WEEK)} style={{padding:'4px 10px',borderRadius:6,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>Aujourd'hui</button>
            <div style={{display:'flex',gap:2}}>
              <button onClick={()=>setWeekIdx(p=>Math.max(0,p-1))} style={{width:24,height:24,borderRadius:6,border:`1px solid ${C.border}`,background:'none',cursor:'pointer'}}>‹</button>
              <button onClick={()=>setWeekIdx(p=>Math.min(WEEKS.length-1,p+1))} style={{width:24,height:24,borderRadius:6,border:`1px solid ${C.border}`,background:'none',cursor:'pointer'}}>›</button>
            </div>
            <span style={{fontSize:13,fontWeight:600,color:C.text}}>{WEEKS[weekIdx].label}</span>
          </div>
          <div style={{display:'flex',gap:5,alignItems:'center'}}>
            <div style={{display:'flex',border:`1px solid ${C.border}`,borderRadius:6,overflow:'hidden'}}>
              {VIEWS.map(v=>(
                <button key={v.id} onClick={()=>setView(v.id)} style={{padding:'5px 12px',border:'none',background:view===v.id?C.bg:'transparent',cursor:'pointer',fontSize:11,fontFamily:'inherit',color:view===v.id?C.blue:C.text3,fontWeight:view===v.id?600:400}}>
                  {v.l}
                </button>
              ))}
            </div>
            <button onClick={()=>setShowAdd(true)} style={{padding:'5px 14px',borderRadius:6,border:'none',background:C.blue,color:'#fff',fontSize:12,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>+ Planifier</button>
          </div>
        </div>

        {/* ALERTE CONFLIT */}
        {conflits.length>0&&(
          <div style={{padding:'6px 16px',background:C.orange_l,borderBottom:`1px solid #FAC775`,display:'flex',alignItems:'center',gap:7,flexShrink:0}}>
            <span style={{fontSize:12}}>⚡</span>
            <span style={{fontSize:11,color:C.orange_d}}><strong>ChaCha :</strong> {conflits[0].conflitMsg||'Conflit détecté'} — tapez "conflit" dans la barre pour résoudre.</span>
            <button onClick={()=>{setChachaVal('conflit');chachaRef.current?.focus();}} style={{marginLeft:'auto',fontSize:10,padding:'2px 8px',borderRadius:5,border:`1px solid ${C.orange}`,background:'none',color:C.orange,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>Résoudre →</button>
          </div>
        )}

        {/* VUES */}
        {view==='semaine'&&<WeekView events={filteredEvs} weekIdx={weekIdx} onEventClick={setSelEv}/>}
        {view==='mois'&&<MonthView events={filteredEvs} onEventClick={setSelEv}/>}
        {view==='agenda'&&<AgendaView events={filteredEvs} onEventClick={setSelEv}/>}
        {view==='taches'&&(
          <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
            <div style={{maxWidth:720,margin:'0 auto'}}>
              <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 16px',marginBottom:12,display:'flex',gap:8,alignItems:'flex-end'}}>
                <div style={{flex:1}}><div style={{fontSize:10,color:C.text3,marginBottom:3}}>Nouvelle tâche</div><input value={newTask.titre} onChange={e=>setNewTask({...newTask,titre:e.target.value})} onKeyDown={e=>{if(e.key==='Enter'&&newTask.titre){setTasks(p=>[...p,{...newTask,id:Date.now(),done:false}]);setNewTask({titre:'',duree:30,deadline:'',priorite:'normale',dept:'terrain'});}} } placeholder="Ajouter une tâche... (Entrée pour valider)" style={{width:'100%',padding:'8px 10px',borderRadius:7,border:`1px solid ${C.border}`,fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/></div>
                <div><div style={{fontSize:10,color:C.text3,marginBottom:3}}>Durée</div><select value={newTask.duree} onChange={e=>setNewTask({...newTask,duree:Number(e.target.value)})} style={{padding:'8px',borderRadius:7,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit'}}><option value={15}>15 min</option><option value={30}>30 min</option><option value={45}>45 min</option><option value={60}>1h</option><option value={90}>1h30</option><option value={120}>2h</option></select></div>
                <div><div style={{fontSize:10,color:C.text3,marginBottom:3}}>Deadline</div><input type="date" value={newTask.deadline} onChange={e=>setNewTask({...newTask,deadline:e.target.value})} style={{padding:'8px',borderRadius:7,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit'}}/></div>
                <div><div style={{fontSize:10,color:C.text3,marginBottom:3}}>Priorité</div><select value={newTask.priorite} onChange={e=>setNewTask({...newTask,priorite:e.target.value})} style={{padding:'8px',borderRadius:7,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit'}}><option value="faible">Faible</option><option value="normale">Normale</option><option value="haute">Haute</option><option value="critique">Critique</option></select></div>
              </div>
              <div style={{padding:'7px 12px',background:C.purple_l,border:`1px solid #D4C5F9`,borderRadius:8,marginBottom:12,fontSize:11,color:'#26215C',display:'flex',alignItems:'center',gap:6}}>
                ⚡ ChaCha auto-schedule les tâches non terminées dans vos créneaux libres — tapez "planifie mes tâches" dans la barre
              </div>
              <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden'}}>
                <div style={{padding:'10px 16px',borderBottom:`1px solid ${C.border2}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:12,fontWeight:600,color:C.text}}>{tasks.filter(t=>!t.done).length} tâche{tasks.filter(t=>!t.done).length>1?'s':''} en attente</span>
                  <span style={{fontSize:11,color:C.text3}}>{tasks.filter(t=>t.done).length} terminée{tasks.filter(t=>t.done).length>1?'s':''}</span>
                </div>
                {tasks.sort((a,b)=>a.done===b.done?0:a.done?1:-1).map((task,i)=>{
                  const pColors={critique:[C.red_l,C.red],haute:[C.orange_l,C.orange],normale:[C.blue_l,C.blue],faible:[C.border2,C.text3]};
                  const [pbg,pc]=pColors[task.priorite]||pColors.normale;
                  const overdue=task.deadline&&new Date(task.deadline)<new Date()&&!task.done;
                  return (
                    <div key={task.id} style={{padding:'11px 16px',borderBottom:`1px solid ${C.border2}`,display:'flex',alignItems:'center',gap:12,background:task.done?C.bg:'transparent',opacity:task.done?.6:1}}>
                      <div onClick={()=>setTasks(p=>p.map(t=>t.id===task.id?{...t,done:!t.done}:t))} style={{width:18,height:18,borderRadius:4,border:`2px solid ${task.done?C.green:C.border}`,background:task.done?C.green:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        {task.done&&<span style={{color:'#fff',fontSize:11,lineHeight:1,fontWeight:700}}>✓</span>}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:task.done?400:500,color:task.done?C.text3:C.text,textDecoration:task.done?'line-through':'none'}}>{task.titre}</div>
                        <div style={{fontSize:11,color:overdue?C.red:C.text3,marginTop:2,display:'flex',gap:8}}>
                          <span>{task.duree} min</span>
                          {task.deadline&&<span style={{color:overdue?C.red:C.text3,fontWeight:overdue?600:400}}>{overdue?'⚠️ ':''}Deadline {task.deadline}</span>}
                        </div>
                      </div>
                      <span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:pbg,color:pc,fontWeight:600,flexShrink:0}}>{task.priorite}</span>
                      <button onClick={()=>setTasks(p=>p.filter(t=>t.id!==task.id))} style={{border:'none',background:'none',cursor:'pointer',fontSize:14,color:C.text3,padding:'0 4px',flexShrink:0}}>×</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PANEL DÉTAIL */}
      {selEv&&<EvDetail ev={selEv} onClose={()=>setSelEv(null)}/>}
      {showAdd&&<AddModal onClose={()=>setShowAdd(false)} onAdd={ev=>{setEvents(p=>[...p,ev]);}}/>}
    </div>
  );
}
