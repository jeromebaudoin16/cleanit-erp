import { useState, useRef, useEffect } from 'react';
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
  terrain:   { color:C.blue,   bg:C.blue_l,   dc:C.blue_d,   label:'Terrain',    icon:'🔧' },
  commercial:{ color:C.green,  bg:C.green_l,  dc:C.green_d,  label:'Commercial', icon:'🤝' },
  rh:        { color:C.orange, bg:C.orange_l, dc:C.orange_d, label:'RH & Équipe',icon:'👥' },
  finance:   { color:C.purple, bg:C.purple_l, dc:C.purple_d, label:'Finance',    icon:'💰' },
  direction: { color:C.red,    bg:C.red_l,    dc:C.red_d,    label:'Direction',  icon:'🎯' },
};

const EVENTS_SEED = [
  {id:1,titre:'Installation 5G DLA-001',dept:'terrain',resp:'Thomas Ngono',photo:'https://i.pravatar.cc/150?img=15',debut:'2025-05-12',fin:'2025-05-16',hStart:8,hEnd:17,conflit:false},
  {id:2,titre:'Appel client MTN',dept:'commercial',resp:'Marie Kamga',photo:'https://i.pravatar.cc/150?img=47',debut:'2025-05-12',fin:'2025-05-12',hStart:14,hEnd:15,conflit:false},
  {id:3,titre:'Réunion direction',dept:'direction',resp:'Jérôme Bell',photo:'',debut:'2025-05-13',fin:'2025-05-13',hStart:9,hEnd:11,conflit:false},
  {id:4,titre:'Relance facture MTN',dept:'finance',resp:'Finance',photo:'',debut:'2025-05-13',fin:'2025-05-13',hStart:16,hEnd:17,conflit:false},
  {id:5,titre:'Formation CACES R482',dept:'rh',resp:'Ali Moussa',photo:'https://i.pravatar.cc/150?img=15',debut:'2025-05-14',fin:'2025-05-14',hStart:8,hEnd:17,conflit:true},
  {id:6,titre:'Présentation Orange',dept:'commercial',resp:'Marie Kamga',photo:'https://i.pravatar.cc/150?img=47',debut:'2025-05-14',fin:'2025-05-14',hStart:14,hEnd:16,conflit:false},
  {id:7,titre:'Paiement technicien',dept:'finance',resp:'Finance',photo:'',debut:'2025-05-14',fin:'2025-05-14',hStart:16,hEnd:17,conflit:false},
  {id:8,titre:'Swap 4G→5G KRI-001',dept:'terrain',resp:'Pierre Etoga',photo:'https://i.pravatar.cc/150?img=3',debut:'2025-05-15',fin:'2025-05-16',hStart:8,hEnd:17,conflit:false},
  {id:9,titre:'Entretien candidat fibre',dept:'rh',resp:'Responsable RH',photo:'',debut:'2025-05-15',fin:'2025-05-15',hStart:10,hEnd:11,conflit:false},
  {id:10,titre:'Revue mensuelle perf.',dept:'direction',resp:'Jérôme Bell',photo:'',debut:'2025-05-15',fin:'2025-05-15',hStart:15,hEnd:17,conflit:false},
  {id:11,titre:'Déclaration TVA — Échéance !',dept:'finance',resp:'Finance',photo:'',debut:'2025-05-16',fin:'2025-05-16',hStart:8,hEnd:9,conflit:false,urgent:true},
  {id:12,titre:'Congé annuel Ali Moussa',dept:'rh',resp:'Ali Moussa',photo:'https://i.pravatar.cc/150?img=15',debut:'2025-05-16',fin:'2025-05-16',hStart:8,hEnd:17,conflit:true},
  {id:13,titre:'Signature contrat CAMTEL',dept:'commercial',resp:'Marie Kamga',photo:'https://i.pravatar.cc/150?img=47',debut:'2025-05-16',fin:'2025-05-16',hStart:10,hEnd:12,conflit:false},
  {id:14,titre:'Mission GRA-001',dept:'terrain',resp:'Samuel Djomo',photo:'https://i.pravatar.cc/150?img=22',debut:'2025-05-19',fin:'2025-05-23',hStart:8,hEnd:17,conflit:false},
  {id:15,titre:'Deadline YDE-001',dept:'finance',resp:'Marie Kamga',photo:'',debut:'2025-05-20',fin:'2025-05-20',hStart:9,hEnd:10,conflit:false},
  {id:16,titre:'Déclaration CNPS',dept:'rh',resp:'Finance',photo:'',debut:'2025-05-28',fin:'2025-05-28',hStart:9,hEnd:10,conflit:false},
  {id:17,titre:'Paie du personnel',dept:'finance',resp:'Finance',photo:'',debut:'2025-05-30',fin:'2025-05-30',hStart:9,hEnd:11,conflit:false},
];

const HOURS = [8,9,10,11,12,13,14,15,16,17];
const DAYS_NAMES = ['Lun','Mar','Mer','Jeu','Ven'];
const WEEKS = [
  {label:'Semaine du 5 au 9 mai 2025', days:[5,6,7,8,9]},
  {label:'Semaine du 12 au 16 mai 2025', days:[12,13,14,15,16]},
  {label:'Semaine du 19 au 23 mai 2025', days:[19,20,21,22,23]},
];
const TODAY = 14;
const H_PX = 44;
const H_START = 8;

const CHACHA_RESPONSES = {
  'réunion':   'Je vais planifier une réunion. Vérification des disponibilités... Thomas Ngono et Marie Kamga sont libres mardi 20 mai à 10h. Je l\'ajoute au planning ?',
  'génère':    'Planning IA semaine du 19 mai : Lun — Mission GRA-001 (Samuel Djomo). Mar — Deadline YDE-001 + Réunion budget. Mer — Formation H2B2 (Jean Mbarga). Jeu — Réunion commerciale Orange. Ven — Paie du personnel. Confirmer ?',
  'conflit':   'Conflit Ali Moussa résolu : je propose de transférer YDE-001 à Samuel Djomo (disponible, score 78/100). Congé validé pour Ali les 16–18 mai. Confirmer le transfert ?',
  'planning':  'Pour un planning complet, dites-moi la semaine cible et les priorités. Ex : "Génère le planning de la semaine du 19 mai avec les missions terrain en priorité."',
  'disponible':'Techniciens disponibles semaine prochaine : Samuel Djomo (lun–ven), Jean Mbarga (mer–ven). Pierre Etoga revient lundi. Ali Moussa en congé vendredi.',
  'mission':   'Quelle mission souhaitez-vous planifier ? Précisez le site, le type de travail et la durée estimée. Je proposerai les meilleurs techniciens selon leurs compétences et disponibilités.',
};

function Avatar({photo, name, size=18}){
  if(photo) return <img src={photo} alt={name} style={{width:size,height:size,borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>;
  const initials = (name||'').split(' ').map(w=>w[0]).join('').slice(0,2);
  return <div style={{width:size,height:size,borderRadius:'50%',background:C.blue_l,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.4,fontWeight:500,color:C.blue_d,flexShrink:0}}>{initials}</div>;
}

function EventBlock({ev, style={}}){
  const d = DEPT[ev.dept]||DEPT.terrain;
  return (
    <div style={{position:'absolute',left:3,right:3,borderRadius:6,padding:'4px 7px',background:ev.urgent?C.red_l:d.bg,color:d.dc,display:'flex',alignItems:'flex-start',gap:5,cursor:'pointer',overflow:'hidden',border:ev.urgent?`0.5px solid ${C.red}`:ev.conflit?`0.5px solid ${C.orange}`:'none',transition:'filter .15s',...style}}
      onMouseEnter={e=>e.currentTarget.style.filter='brightness(.93)'}
      onMouseLeave={e=>e.currentTarget.style.filter=''}>
      <Avatar photo={ev.photo} name={ev.resp} size={16}/>
      <div style={{minWidth:0}}>
        <div style={{fontSize:10,fontWeight:500,lineHeight:1.2,marginBottom:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ev.titre}</div>
        <div style={{fontSize:9,opacity:.8,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ev.resp}</div>
      </div>
    </div>
  );
}

function WeekView({events, weekIdx}){
  const week = WEEKS[weekIdx];
  const daysNums = week.days;

  return (
    <div style={{flex:1,overflow:'auto'}}>
      <div style={{display:'grid',gridTemplateColumns:'48px repeat(5,1fr)',position:'sticky',top:0,background:C.white,zIndex:10,borderBottom:`0.5px solid ${C.border}`}}>
        <div/>
        {DAYS_NAMES.map((d,i)=>{
          const num = daysNums[i];
          const isToday = num===TODAY && weekIdx===1;
          return (
            <div key={i} style={{textAlign:'center',padding:'8px 0',color:isToday?C.blue:C.text3,fontSize:11}}>
              {d}<br/>
              <strong style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:22,height:22,borderRadius:'50%',background:isToday?C.blue:'transparent',color:isToday?'#fff':C.text,fontSize:12,fontWeight:isToday?700:500}}>
                {num}
              </strong>
            </div>
          );
        })}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'48px repeat(5,1fr)'}}>
        <div>
          {HOURS.map(h=>(
            <div key={h} style={{height:H_PX,borderTop:`0.5px solid ${C.border}`,position:'relative'}}>
              <span style={{position:'absolute',top:-8,left:4,fontSize:9,color:C.text3}}>{h}h</span>
            </div>
          ))}
        </div>
        {daysNums.map((dayNum,di)=>{
          const isToday = dayNum===TODAY && weekIdx===1;
          const dayEvs = events.filter(e=>{
            const ds=Number(e.debut.split('-')[2]), de=Number(e.fin.split('-')[2]);
            return dayNum>=ds && dayNum<=de;
          });
          return (
            <div key={di} style={{borderLeft:`0.5px solid ${C.border}`,position:'relative',minHeight:HOURS.length*H_PX,background:isToday?'#E6F1FB08':'transparent'}}>
              {HOURS.map(h=><div key={h} style={{height:H_PX,borderTop:`0.5px solid ${C.border2}`}}/>)}
              {dayEvs.map((ev,ei)=>{
                const top = (ev.hStart-H_START)*H_PX;
                const height = Math.max((ev.hEnd-ev.hStart)*H_PX-4, 20);
                return <EventBlock key={ev.id} ev={ev} style={{top,height}}/>;
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthView({events}){
  const days = Array.from({length:31},(_,i)=>i+1);
  const weekDayStart = 3;
  const empties = Array.from({length:weekDayStart},(_,i)=>i);
  return (
    <div style={{padding:'12px 16px',flex:1,overflow:'auto'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:4}}>
        {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d=>(
          <div key={d} style={{fontSize:10,fontWeight:500,color:C.text3,textAlign:'center',padding:'4px 0'}}>{d}</div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
        {empties.map(i=><div key={'e'+i} style={{minHeight:55,background:C.white,border:`0.5px solid ${C.border}`,borderRadius:4,opacity:.3}}/>)}
        {days.map(day=>{
          const isToday = day===TODAY;
          const dayEvs = events.filter(e=>{
            const ds=Number(e.debut.split('-')[2]), de=Number(e.fin.split('-')[2]);
            return day>=ds && day<=de;
          });
          const isWeekend = (day+weekDayStart-1)%7>=5;
          return (
            <div key={day} style={{minHeight:55,background:C.white,border:`0.5px solid ${isToday?C.blue:C.border}`,borderRadius:4,padding:4,opacity:isWeekend?.4:1}}>
              <div style={{fontSize:10,fontWeight:500,marginBottom:2,display:'inline-flex',alignItems:'center',justifyContent:'center',width:18,height:18,borderRadius:'50%',background:isToday?C.blue:'transparent',color:isToday?'#fff':C.text}}>{day}</div>
              {dayEvs.slice(0,2).map(ev=>{
                const d=DEPT[ev.dept]||DEPT.terrain;
                return <div key={ev.id} style={{fontSize:9,padding:'1px 4px',borderRadius:3,background:ev.urgent?C.red_l:d.bg,color:d.dc,marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontWeight:500}}>{d.icon} {ev.titre.slice(0,16)}</div>;
              })}
              {dayEvs.length>2&&<div style={{fontSize:9,color:C.text3}}>+{dayEvs.length-2}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgendaView({events}){
  const grouped = {};
  const days = [14,15,16,19,20,21,23,28,30];
  const labels = {14:'Mercredi 14 mai — Aujourd\'hui',15:'Jeudi 15 mai',16:'Vendredi 16 mai',19:'Lundi 19 mai',20:'Mardi 20 mai',21:'Mercredi 21 mai',23:'Vendredi 23 mai',28:'Mercredi 28 mai',30:'Vendredi 30 mai'};
  days.forEach(d=>{
    grouped[d]=events.filter(e=>{const ds=Number(e.debut.split('-')[2]),de=Number(e.fin.split('-')[2]);return d>=ds&&d<=de;});
  });
  return (
    <div style={{flex:1,overflow:'auto'}}>
      {days.map(d=>{
        const evs=grouped[d]||[];
        if(!evs.length) return null;
        const dep=DEPT;
        return (
          <div key={d}>
            <div style={{padding:'8px 16px',fontSize:11,fontWeight:500,color:C.text3,borderBottom:`0.5px solid ${C.border}`,position:'sticky',top:0,background:C.white,zIndex:5}}>{labels[d]}</div>
            {evs.map(ev=>{
              const dt=dep[ev.dept]||dep.terrain;
              return (
                <div key={ev.id} style={{padding:'10px 16px',borderBottom:`0.5px solid ${C.border2}`,cursor:'pointer',borderLeft:`3px solid ${ev.urgent?C.red:dt.color}`,background:ev.conflit?C.orange_l+'15':ev.urgent?C.red_l+'20':'transparent'}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                  onMouseLeave={e=>e.currentTarget.style.background=ev.conflit?C.orange_l+'15':ev.urgent?C.red_l+'20':'transparent'}>
                  <div style={{fontSize:10,color:C.text3,marginBottom:3}}>{ev.hStart}h{ev.hStart!==ev.hEnd?`—${ev.hEnd}h`:' · Toute la journée'}{ev.urgent?' · ⚠️ Urgent':''}{ev.conflit?' · Conflit IA':''}</div>
                  <div style={{fontSize:13,fontWeight:500,color:C.text,marginBottom:3,display:'flex',alignItems:'center',gap:7}}>
                    <Avatar photo={ev.photo} name={ev.resp} size={20}/>
                    {ev.titre}
                  </div>
                  <div style={{fontSize:11,color:C.text3}}>{dt.icon} {dt.label} · {ev.resp}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function ChaChaPanel({onClose}){
  const [msgs,setMsgs] = useState([{from:'ai',txt:'Bonjour ! Dites-moi ce que vous voulez planifier. Ex : "Réunion MTN lundi prochain 10h" ou "Génère le planning de la semaine prochaine".'}]);
  const [input,setInput] = useState('');
  const [loading,setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'});},[msgs]);

  const send = () => {
    if(!input.trim()) return;
    const txt = input.trim();
    setMsgs(p=>[...p,{from:'user',txt}]);
    setInput('');
    setLoading(true);
    setTimeout(()=>{
      const key = Object.keys(CHACHA_RESPONSES).find(k=>txt.toLowerCase().includes(k));
      const rep = key ? CHACHA_RESPONSES[key] : 'Je comprends votre demande. Analyse des contraintes du système (disponibilités, certifications, charge)... Pouvez-vous préciser la semaine et le type d\'activité ?';
      setMsgs(p=>[...p,{from:'ai',txt:rep}]);
      setLoading(false);
    },900);
  };

  return (
    <div style={{borderBottom:`0.5px solid ${C.border}`,background:C.bg,display:'flex',flexDirection:'column',flexShrink:0,maxHeight:210}}>
      <div style={{padding:'8px 14px',borderBottom:`0.5px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12,fontWeight:500,color:C.purple}}>🧠 ChaCha — Planification intelligente</div>
        <button onClick={onClose} style={{border:'none',background:'none',cursor:'pointer',fontSize:16,color:C.text3}}>×</button>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'8px 14px',display:'flex',flexDirection:'column',gap:6}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{alignSelf:m.from==='user'?'flex-end':'flex-start',maxWidth:'88%',background:m.from==='user'?C.blue_l:C.white,border:`0.5px solid ${C.border}`,borderRadius:8,padding:'7px 10px',fontSize:12,color:m.from==='user'?C.blue_d:C.text}}>
            {m.txt}
          </div>
        ))}
        {loading&&<div style={{fontSize:12,color:C.text3,fontStyle:'italic'}}>ChaCha réfléchit...</div>}
        <div ref={endRef}/>
      </div>
      <div style={{padding:'8px 12px',display:'flex',gap:6,borderTop:`0.5px solid ${C.border}`}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Demandez à ChaCha de planifier..." style={{flex:1,padding:'6px 10px',borderRadius:6,border:`0.5px solid ${C.border}`,fontSize:12,fontFamily:'inherit',outline:'none'}}/>
        <button onClick={send} style={{padding:'6px 14px',borderRadius:6,border:'none',background:C.blue,color:'#fff',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>Envoyer</button>
      </div>
    </div>
  );
}

export default function Planning(){
  const [view,setView] = useState('semaine');
  const [weekIdx,setWeekIdx] = useState(1);
  const [events,setEvents] = useState(EVENTS_SEED);
  const [depts,setDepts] = useState({terrain:true,commercial:true,rh:true,finance:true,direction:true});
  const [showChaCha,setShowChaCha] = useState(false);
  const [showAdd,setShowAdd] = useState(false);
  const [form,setForm] = useState({titre:'',dept:'terrain',resp:'',debut:'2025-05-14',fin:'2025-05-14',hStart:'09',hEnd:'10'});
  const [roleFilter,setRoleFilter] = useState('all');

  useEffect(()=>{
    getJobs().then(jobs=>{
      if(!jobs||!jobs.length) return;
      const newEvs = jobs.slice(0,3).map((j,i)=>({
        id:100+i,titre:j.name||j.site||'Mission',dept:'terrain',
        resp:j.chefProjet||'Chef projet',photo:'',
        debut:j.startDate?.slice(0,10)||'2025-05-19',
        fin:j.endDate?.slice(0,10)||'2025-05-23',
        hStart:8,hEnd:17,conflit:false,
      }));
      setEvents(p=>[...EVENTS_SEED,...newEvs.filter(e=>!EVENTS_SEED.some(s=>s.titre===e.titre))]);
    }).catch(()=>{});
  },[]);

  const filteredEvents = events.filter(e=>depts[e.dept]);
  const conflits = events.filter(e=>e.conflit);

  const addEvent = () => {
    if(!form.titre) return;
    setEvents(p=>[...p,{...form,id:Date.now(),hStart:Number(form.hStart),hEnd:Number(form.hEnd),conflit:false,photo:''}]);
    setShowAdd(false);
    setForm({titre:'',dept:'terrain',resp:'',debut:'2025-05-14',fin:'2025-05-14',hStart:'09',hEnd:'10'});
  };

  const VIEWS=[{id:'semaine',l:'Semaine'},{id:'mois',l:'Mois'},{id:'agenda',l:'Agenda'}];

  return (
    <div style={{display:'flex',height:'100%',fontFamily:'inherit',background:C.white}}>

      {/* SIDEBAR */}
      <div style={{width:220,borderRight:`0.5px solid ${C.border}`,display:'flex',flexDirection:'column',background:C.white,flexShrink:0}}>
        <div style={{padding:'14px 16px',borderBottom:`0.5px solid ${C.border}`}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
            <span style={{fontSize:18}}>📅</span>
            <span style={{fontSize:14,fontWeight:500}}>Planning</span>
          </div>
          <button onClick={()=>setShowChaCha(!showChaCha)} style={{width:'100%',padding:'7px 10px',borderRadius:8,border:`0.5px solid ${C.border}`,background:showChaCha?C.purple_l:C.bg,cursor:'pointer',fontFamily:'inherit',fontSize:12,display:'flex',alignItems:'center',gap:6,color:showChaCha?C.purple:C.text3,fontWeight:showChaCha?500:400}}>
            🧠 Planifier avec ChaCha
          </button>
        </div>

        {/* Mini calendrier */}
        <div style={{padding:'12px 16px',borderBottom:`0.5px solid ${C.border}`}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
            <span style={{fontSize:11,fontWeight:500}}>Mai 2025</span>
            <div style={{display:'flex',gap:2}}>
              <button style={{width:18,height:18,borderRadius:4,border:`0.5px solid ${C.border}`,background:'none',cursor:'pointer',fontSize:11,lineHeight:1}}>‹</button>
              <button style={{width:18,height:18,borderRadius:4,border:`0.5px solid ${C.border}`,background:'none',cursor:'pointer',fontSize:11,lineHeight:1}}>›</button>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:1,textAlign:'center'}}>
            {['L','M','M','J','V','S','D'].map((d,i)=><div key={i} style={{fontSize:9,color:C.text3,padding:'2px 0'}}>{d}</div>)}
            {[null,null,null,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31].map((d,i)=>(
              <div key={i} style={{fontSize:9,padding:'3px 1px',borderRadius:'50%',background:d===TODAY?C.blue:'transparent',color:d===TODAY?'#fff':d?C.text:C.text3,cursor:d?'pointer':'default',fontWeight:d===TODAY?700:400}}>
                {d||''}
              </div>
            ))}
          </div>
        </div>

        {/* Filtres */}
        <div style={{padding:'12px 16px',borderBottom:`0.5px solid ${C.border}`}}>
          <div style={{fontSize:11,fontWeight:500,color:C.text3,marginBottom:8}}>Départements</div>
          {Object.entries(DEPT).map(([key,d])=>(
            <label key={key} style={{display:'flex',alignItems:'center',gap:7,cursor:'pointer',marginBottom:6,userSelect:'none'}}>
              <div onClick={()=>setDepts(p=>({...p,[key]:!p[key]}))} style={{width:14,height:14,borderRadius:3,background:depts[key]?d.color:C.border2,border:`0.5px solid ${depts[key]?d.color:C.border}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                {depts[key]&&<span style={{color:'#fff',fontSize:10,lineHeight:1,fontWeight:500}}>✓</span>}
              </div>
              <span style={{width:7,height:7,borderRadius:'50%',background:d.color,flexShrink:0}}/>
              <span style={{fontSize:12,color:C.text}}>{d.label}</span>
            </label>
          ))}
        </div>

        {/* Prochains événements */}
        <div style={{padding:'12px 16px',flex:1,overflowY:'auto'}}>
          <div style={{fontSize:11,fontWeight:500,color:C.text3,marginBottom:8}}>À venir</div>
          {[
            {titre:'Déclaration TVA',date:'Ven 16 mai',dept:'finance'},
            {titre:'Deadline YDE-001',date:'Mar 20 mai',dept:'finance'},
            {titre:'Signature CAMTEL',date:'Ven 16 mai · 10h',dept:'commercial'},
            {titre:'Déclaration CNPS',date:'Mer 28 mai',dept:'rh'},
            {titre:'Paie du personnel',date:'Ven 30 mai',dept:'finance'},
          ].map((ev,i)=>{
            const d=DEPT[ev.dept]||DEPT.terrain;
            return (
              <div key={i} style={{padding:'6px 8px',borderRadius:6,background:C.bg,marginBottom:5,borderLeft:`2px solid ${d.color}`}}>
                <div style={{fontSize:11,fontWeight:500,color:C.text}}>{ev.titre}</div>
                <div style={{fontSize:10,color:C.text3}}>{ev.date}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ZONE PRINCIPALE */}
      <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>

        {/* Header */}
        <div style={{padding:'10px 16px',borderBottom:`0.5px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <button style={{padding:'4px 10px',borderRadius:6,border:`0.5px solid ${C.border}`,background:'none',cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>Aujourd'hui</button>
            <div style={{display:'flex',gap:2}}>
              <button onClick={()=>setWeekIdx(p=>Math.max(0,p-1))} style={{width:24,height:24,borderRadius:6,border:`0.5px solid ${C.border}`,background:'none',cursor:'pointer'}}>‹</button>
              <button onClick={()=>setWeekIdx(p=>Math.min(WEEKS.length-1,p+1))} style={{width:24,height:24,borderRadius:6,border:`0.5px solid ${C.border}`,background:'none',cursor:'pointer'}}>›</button>
            </div>
            <span style={{fontSize:13,fontWeight:500}}>{WEEKS[weekIdx].label}</span>
          </div>
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            <div style={{display:'flex',border:`0.5px solid ${C.border}`,borderRadius:6,overflow:'hidden'}}>
              {VIEWS.map(v=>(
                <button key={v.id} onClick={()=>setView(v.id)} style={{padding:'5px 12px',border:'none',background:view===v.id?C.bg:'transparent',cursor:'pointer',fontSize:11,fontFamily:'inherit',color:view===v.id?C.blue:C.text3,fontWeight:view===v.id?500:400}}>
                  {v.l}
                </button>
              ))}
            </div>
            <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} style={{fontSize:11,padding:'4px 8px',borderRadius:6,border:`0.5px solid ${C.border}`,fontFamily:'inherit'}}>
              <option value="all">Toute l'entreprise</option>
              <option value="chef">Mon planning</option>
              <option value="terrain">Terrain seulement</option>
            </select>
            <button onClick={()=>setShowAdd(true)} style={{padding:'5px 14px',borderRadius:6,border:'none',background:C.blue,color:'#fff',fontSize:12,cursor:'pointer',fontFamily:'inherit',fontWeight:500}}>+ Planifier</button>
          </div>
        </div>

        {/* ChaCha Panel */}
        {showChaCha&&<ChaChaPanel onClose={()=>setShowChaCha(false)}/>}

        {/* Alerte conflits */}
        {conflits.length>0&&(
          <div style={{padding:'7px 16px',background:C.red_l,borderBottom:`0.5px solid #F7C1C1`,display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
            <span style={{fontSize:13}}>🧠</span>
            <span style={{fontSize:11,color:C.red_d}}><strong>ChaCha détecte {conflits.length} conflit{conflits.length>1?'s':''} :</strong> Ali Moussa en formation + congé — YDE-001 non couvert.</span>
            <button onClick={()=>setShowChaCha(true)} style={{marginLeft:'auto',fontSize:11,padding:'3px 10px',borderRadius:5,border:`0.5px solid ${C.red}`,background:'none',color:C.red,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>Résoudre →</button>
          </div>
        )}

        {/* Vues */}
        {view==='semaine'&&<WeekView events={filteredEvents} weekIdx={weekIdx}/>}
        {view==='mois'&&<MonthView events={filteredEvents}/>}
        {view==='agenda'&&<AgendaView events={filteredEvents}/>}
      </div>

      {/* Modal ajout */}
      {showAdd&&(
        <div style={{position:'fixed',inset:0,zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div onClick={()=>setShowAdd(false)} style={{position:'absolute',inset:0,background:'rgba(0,0,0,.35)'}}/>
          <div style={{position:'relative',background:C.white,borderRadius:12,padding:24,width:500,boxShadow:'0 20px 60px rgba(0,0,0,.15)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
              <span style={{fontSize:15,fontWeight:500}}>Planifier une activité</span>
              <button onClick={()=>setShowAdd(false)} style={{border:'none',background:'none',cursor:'pointer',fontSize:18,color:C.text3}}>×</button>
            </div>
            <div style={{display:'grid',gap:12}}>
              <div>
                <div style={{fontSize:11,color:C.text3,marginBottom:4}}>Titre</div>
                <input value={form.titre} onChange={e=>setForm({...form,titre:e.target.value})} placeholder="Ex: Réunion client MTN, Formation CACES..." style={{width:'100%',padding:'8px 10px',borderRadius:6,border:`0.5px solid ${C.border}`,fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <div>
                  <div style={{fontSize:11,color:C.text3,marginBottom:4}}>Département</div>
                  <select value={form.dept} onChange={e=>setForm({...form,dept:e.target.value})} style={{width:'100%',padding:'8px 10px',borderRadius:6,border:`0.5px solid ${C.border}`,fontSize:13,fontFamily:'inherit',outline:'none'}}>
                    {Object.entries(DEPT).map(([k,d])=><option key={k} value={k}>{d.icon} {d.label}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{fontSize:11,color:C.text3,marginBottom:4}}>Responsable</div>
                  <input value={form.resp} onChange={e=>setForm({...form,resp:e.target.value})} placeholder="Nom ou équipe" style={{width:'100%',padding:'8px 10px',borderRadius:6,border:`0.5px solid ${C.border}`,fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8}}>
                <div style={{gridColumn:'1/3'}}>
                  <div style={{fontSize:11,color:C.text3,marginBottom:4}}>Date début</div>
                  <input type="date" value={form.debut} onChange={e=>setForm({...form,debut:e.target.value})} style={{width:'100%',padding:'8px 10px',borderRadius:6,border:`0.5px solid ${C.border}`,fontSize:13,fontFamily:'inherit',outline:'none'}}/>
                </div>
                <div style={{gridColumn:'3/5'}}>
                  <div style={{fontSize:11,color:C.text3,marginBottom:4}}>Date fin</div>
                  <input type="date" value={form.fin} onChange={e=>setForm({...form,fin:e.target.value})} style={{width:'100%',padding:'8px 10px',borderRadius:6,border:`0.5px solid ${C.border}`,fontSize:13,fontFamily:'inherit',outline:'none'}}/>
                </div>
                <div>
                  <div style={{fontSize:11,color:C.text3,marginBottom:4}}>Heure début</div>
                  <select value={form.hStart} onChange={e=>setForm({...form,hStart:e.target.value})} style={{width:'100%',padding:'8px 6px',borderRadius:6,border:`0.5px solid ${C.border}`,fontSize:12,fontFamily:'inherit',outline:'none'}}>
                    {HOURS.map(h=><option key={h} value={h}>{h}h00</option>)}
                  </select>
                </div>
                <div>
                  <div style={{fontSize:11,color:C.text3,marginBottom:4}}>Heure fin</div>
                  <select value={form.hEnd} onChange={e=>setForm({...form,hEnd:e.target.value})} style={{width:'100%',padding:'8px 6px',borderRadius:6,border:`0.5px solid ${C.border}`,fontSize:12,fontFamily:'inherit',outline:'none'}}>
                    {HOURS.map(h=><option key={h} value={h}>{h}h00</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:4}}>
                <button onClick={()=>setShowAdd(false)} style={{padding:'8px 16px',borderRadius:6,border:`0.5px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit',fontSize:13}}>Annuler</button>
                <button onClick={addEvent} style={{padding:'8px 20px',borderRadius:6,border:'none',background:C.blue,color:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:13,fontWeight:500}}>Ajouter au planning</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
