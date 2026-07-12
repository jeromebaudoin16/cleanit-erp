import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../utils/api';

const BASE = import.meta.env.VITE_API_URL || 'https://backend-one-kappa-96.vercel.app';
const tk = () => localStorage.getItem('token');

const C = {
  primary:'#0A2D6E', primaryL:'#E8F0FC', primaryD:'#061A45',
  green:'#107E3E',   greenL:'#DCFCE7',
  orange:'#E76500',  orangeL:'#FFF0E6',
  red:'#BB0000',     redL:'#FEE2E2',
  purple:'#6B21A8',  purpleL:'#F3E8FF',
  teal:'#0F766E',    tealL:'#CCFBF1',
  amber:'#B45309',   amberL:'#FEF3C7',
  gray:'#374151',    grayL:'#F3F4F6',
  border:'#E5E7EB',  border2:'#F9FAFB',
  text:'#111827',    text2:'#374151', text3:'#6B7280', text4:'#9CA3AF',
  white:'#FFFFFF',   bg:'#F8FAFC',
};

const DEPT = {
  terrain:   { color:C.primary,  bg:C.primaryL,  label:'Terrain' },
  commercial:{ color:C.green,    bg:C.greenL,    label:'Commercial' },
  rh:        { color:C.orange,   bg:C.orangeL,   label:'RH & Équipe' },
  finance:   { color:C.purple,   bg:C.purpleL,   label:'Finance' },
  direction: { color:C.red,      bg:C.redL,      label:'Direction' },
  it:        { color:C.teal,     bg:C.tealL,     label:'IT & Système' },
  personnel: { color:C.gray,     bg:C.grayL,     label:'Personnel' },
};

const Icon = ({ name, size=16, color='currentColor', style={} }) => {
  const icons = {
    calendar:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    clock:'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    users:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    check:'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    alert:'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    x:'M6 18L18 6M6 6l12 12',
    plus:'M12 4v16m8-8H4',
    edit:'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    trash:'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
    chevronL:'M15 19l-7-7 7-7', chevronR:'M9 5l7 7-7 7',
    filter:'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
    link:'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
    money:'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    briefcase:'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    target:'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
    eye:'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    refresh:'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    chat:'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    video:'M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    tool:'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    map:'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
    person:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    sun:'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
    book:'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    approval:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  };
  const TYPE_ICONS = { reunion_interne:'chat', reunion_externe:'video', mission:'tool', formation:'book', conge:'sun', jalon:'target', echeance:'money', personnel:'person' };
  const d = icons[name] || icons[TYPE_ICONS[name]] || icons.calendar;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={d}/>
    </svg>
  );
};

const TYPE_META = {
  reunion_interne: { label:'Réunion interne',    icon:'chat',    color:C.primary },
  reunion_externe: { label:'Réunion externe',    icon:'video',   color:C.teal },
  mission:         { label:'Mission terrain',    icon:'tool',    color:C.primary },
  formation:       { label:'Formation',          icon:'book',    color:C.teal },
  conge:           { label:'Congé / Absence',    icon:'sun',     color:C.orange },
  jalon:           { label:'Jalon projet',       icon:'target',  color:C.green },
  echeance:        { label:'Échéance financière',icon:'money',   color:C.purple },
  personnel:       { label:'Personnel',          icon:'person',  color:C.gray },
};

const VISIBILITY_OPTS = [
  { id:'personnel',  label:'Personnel (moi seul)' },
  { id:'equipe',     label:'Mon équipe' },
  { id:'entreprise', label:"Toute l'entreprise" },
];

const HOURS = [7,8,9,10,11,12,13,14,15,16,17,18];
const DAYS  = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

const toLD = (d) => { const s=String(d||''); return s.includes('T')?s.slice(0,10):s; };
const fmtDateISO = (d) => { const dt=new Date(d); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`; };
const fmtDate = (d) => new Date(toLD(d)+'T00:00:00').toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'});
const addDays  = (d,n) => { const dt=new Date(d); dt.setDate(dt.getDate()+n); return dt; };
const dayName  = (d) => { const s=new Date(d).toLocaleDateString('fr-FR',{weekday:'short'}); return s.charAt(0).toUpperCase()+s.slice(1,3); };
const isSameDay= (a,b) => fmtDateISO(a)===fmtDateISO(b);

const norm = (ev) => ({...ev,
  all_day: ev.all_day===true||ev.all_day==='true'||ev.all_day===1,
  start_hour: Number(ev.start_hour)||8,
  end_hour: Number(ev.end_hour)||10,
  start_date: toLD(ev.start_date),
  end_date: toLD(ev.end_date||ev.start_date),
});

const SourceBadge = ({ ev }) => {
  if(!ev.link_module) return null;
  const cfg = {
    approvals:    { label:'Approvals', color:C.amber,  bg:C.amberL,  icon:'approval' },
    cleanitbooks: { label:'Books',     color:C.purple, bg:C.purpleL, icon:'money' },
    bons_commande:{ label:'BC',        color:C.teal,   bg:C.tealL,   icon:'briefcase' },
    mission:      { label:'Mission',   color:C.primary,bg:C.primaryL,icon:'tool' },
  }[ev.link_module] || { label:ev.link_module, color:C.gray, bg:C.grayL, icon:'link' };
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'2px 7px',borderRadius:20,fontSize:10,fontWeight:600,background:cfg.bg,color:cfg.color}}>
      <Icon name={cfg.icon} size={10} color={cfg.color}/>{cfg.label}
    </span>
  );
};

const Toast = ({ msg, type='success', onDone }) => {
  useEffect(()=>{ const t=setTimeout(onDone,3000); return()=>clearTimeout(t); },[]);
  const bg = type==='error'?C.red:type==='warn'?C.orange:C.green;
  const icon = type==='error'?'x':type==='warn'?'alert':'check';
  return (
    <div style={{position:'fixed',top:20,right:24,zIndex:9999,background:bg,color:'white',padding:'12px 18px',borderRadius:10,fontSize:13,fontWeight:600,boxShadow:'0 8px 24px rgba(0,0,0,.18)',display:'flex',alignItems:'center',gap:8,animation:'slideIn .2s ease'}}>
      <Icon name={icon} size={16} color="white"/>{msg}
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
};

const AvailBadge = ({ techId, startDate, endDate }) => {
  const [st, setSt] = useState('checking');
  useEffect(()=>{
    if(!techId||!startDate||!endDate) return;
    fetch(`${BASE}/planning/availability/${techId}?startDate=${startDate}&endDate=${endDate}`,{headers:{'Authorization':'Bearer '+tk()}})
      .then(r=>r.json()).then(d=>setSt(d.available?'free':'busy')).catch(()=>setSt('unknown'));
  },[techId,startDate,endDate]);
  if(st==='checking') return <span style={{fontSize:10,color:C.text4}}>Vérification...</span>;
  if(st==='busy') return <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'2px 8px',borderRadius:20,fontSize:10,fontWeight:600,background:C.redL,color:C.red}}><Icon name="alert" size={10} color={C.red}/> Conflit</span>;
  return <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'2px 8px',borderRadius:20,fontSize:10,fontWeight:600,background:C.greenL,color:C.green}}><Icon name="check" size={10} color={C.green}/> Disponible</span>;
};

const EventCard = ({ ev, onClick, compact=false }) => {
  const dept = DEPT[ev.dept]||DEPT.terrain;
  const meta = TYPE_META[ev.type]||{icon:'calendar',color:dept.color};
  const bg = ev.color||meta.color;
  const isAuto = !!ev.link_module;
  return (
    <div onClick={()=>onClick(ev)} style={{background:bg+'15',borderLeft:`3.5px solid ${bg}`,borderRadius:compact?4:6,padding:compact?'3px 6px':'7px 10px',cursor:'pointer',marginBottom:2,transition:'all .12s',position:'relative'}}
      onMouseEnter={e=>{e.currentTarget.style.background=bg+'28';}}
      onMouseLeave={e=>{e.currentTarget.style.background=bg+'15';}}>
      <div style={{display:'flex',alignItems:'center',gap:5}}>
        <Icon name={meta.icon} size={compact?10:12} color={bg}/>
        <span style={{fontSize:compact?9:11,fontWeight:600,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{ev.title}</span>
      </div>
      {!compact && (
        <div style={{fontSize:10,color:C.text3,marginTop:2,display:'flex',alignItems:'center',gap:6}}>
          <span>{ev.all_day?'Journée':ev.start_hour+'h–'+ev.end_hour+'h'}</span>
          {isAuto && <SourceBadge ev={ev}/>}
        </div>
      )}
    </div>
  );
};

const WeekView = ({ events, weekStart, onEventClick, onSlotClick }) => {
  const days = Array.from({length:7},(_,i)=>addDays(weekStart,i));
  const H = 50;
  const evForDay = (d) => events.filter(ev=>{ const dd=fmtDateISO(d); return dd>=toLD(ev.start_date)&&dd<=toLD(ev.end_date||ev.start_date); });
  return (
    <div style={{display:'flex',flex:1,overflow:'auto',minWidth:0}}>
      <div style={{width:48,flexShrink:0,borderRight:`1px solid ${C.border}`}}>
        <div style={{height:52,borderBottom:`1px solid ${C.border}`}}/>
        {HOURS.map(h=>(
          <div key={h} style={{height:H,borderBottom:`1px solid ${C.border2}`,display:'flex',alignItems:'flex-start',justifyContent:'flex-end',padding:'4px 8px 0'}}>
            <span style={{fontSize:10,color:C.text4,fontWeight:500}}>{h}h</span>
          </div>
        ))}
      </div>
      {days.map((day,di)=>{
        const today = isSameDay(day,new Date());
        const dayEvs = evForDay(day).map(norm);
        const allDayEvs = dayEvs.filter(ev=>ev.all_day);
        return (
          <div key={di} style={{flex:1,minWidth:72,borderRight:`1px solid ${C.border}`,position:'relative'}}>
            <div style={{height:52,borderBottom:`1px solid ${C.border}`,background:today?C.primaryL:C.white,position:'sticky',top:0,zIndex:2,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2}}>
              <span style={{fontSize:10,fontWeight:700,letterSpacing:'.5px',color:today?C.primary:C.text3,textTransform:'uppercase'}}>{dayName(day)}</span>
              <div style={{width:28,height:28,borderRadius:'50%',background:today?C.primary:'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <span style={{fontSize:13,fontWeight:700,color:today?C.white:C.text}}>{new Date(day).getDate()}</span>
              </div>
            </div>
            {allDayEvs.length>0 && (
              <div style={{padding:'6px 5px',borderBottom:`1px solid ${C.border2}`,background:today?'#F0F5FF':'#FAFAFA',minHeight:allDayEvs.length*30+10,display:'flex',flexDirection:'column',gap:4}}>
                {allDayEvs.map(ev=><EventCard key={ev.id} ev={ev} onClick={onEventClick}/>)}
              </div>
            )}
            {HOURS.map(h=>(
              <div key={h} onClick={()=>onSlotClick(fmtDateISO(day),h)} style={{height:H,borderBottom:`1px solid ${C.border2}`,padding:'2px 4px',cursor:'pointer',background:today?'#FAFCFF':'transparent'}}
                onMouseEnter={e=>e.currentTarget.style.background=today?'#EEF4FF':C.border2}
                onMouseLeave={e=>e.currentTarget.style.background=today?'#FAFCFF':'transparent'}>
                {dayEvs.filter(ev=>!ev.all_day&&ev.start_hour===h).map(ev=>(<EventCard key={ev.id} ev={ev} onClick={onEventClick} compact/>))}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

const MonthView = ({ events, currentDate, onEventClick, onSlotClick }) => {
  const year=currentDate.getFullYear(), month=currentDate.getMonth();
  const first=new Date(year,month,1);
  const startDay=addDays(first,-(first.getDay()===0?6:first.getDay()-1));
  const cells=Array.from({length:42},(_,i)=>addDays(startDay,i));
  const evForDay=(d)=>events.filter(ev=>{ const dd=fmtDateISO(d); return dd>=toLD(ev.start_date)&&dd<=toLD(ev.end_date||ev.start_date); });
  return (
    <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'auto'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderBottom:`1px solid ${C.border}`,background:C.bg}}>
        {DAYS.map(d=><div key={d} style={{padding:'8px 0',textAlign:'center',fontSize:11,fontWeight:700,color:C.text3,letterSpacing:'.5px',textTransform:'uppercase'}}>{d}</div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',flex:1}}>
        {cells.map((day,i)=>{
          const inMonth=new Date(day).getMonth()===month;
          const today=isSameDay(day,new Date());
          const dayEvs=evForDay(day).map(norm);
          return (
            <div key={i} onClick={()=>onSlotClick(fmtDateISO(day),9)} style={{minHeight:90,border:`1px solid ${C.border}`,padding:'5px 6px',background:today?C.primaryL:inMonth?C.white:'#FAFAFA',cursor:'pointer'}}
              onMouseEnter={e=>e.currentTarget.style.background=today?'#D6E4FF':inMonth?C.border2:'#F3F4F6'}
              onMouseLeave={e=>e.currentTarget.style.background=today?C.primaryL:inMonth?C.white:'#FAFAFA'}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:3}}>
                <div style={{width:24,height:24,borderRadius:'50%',background:today?C.primary:'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span style={{fontSize:12,fontWeight:today?700:500,color:today?C.white:inMonth?C.text:C.text4}}>{new Date(day).getDate()}</span>
                </div>
                {dayEvs.length>3&&<span style={{fontSize:9,color:C.text4}}>+{dayEvs.length-3}</span>}
              </div>
              {dayEvs.slice(0,3).map(ev=><EventCard key={ev.id} ev={ev} onClick={onEventClick} compact/>)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const GanttView = ({ events, missions, users, weekStart }) => {
  const totalDays = 70;
  const DAY_W = 28;
  const days = Array.from({length:totalDays},(_,i)=>addDays(weekStart,i));
  const getLeft = d => {const diff=(new Date(toLD(d)+'T00:00:00')-new Date(fmtDateISO(weekStart)+'T00:00:00'))/(86400000);return Math.max(0,diff)*DAY_W;};
  const getW = (s,e) => {const diff=(new Date(toLD(e)+'T00:00:00')-new Date(toLD(s)+'T00:00:00'))/(86400000)+1;return Math.max(DAY_W/2,diff)*DAY_W;};

  const ITEMS = [
    ...missions.map(m=>{
      const u=users.find(u=>u.id===m.tech_id);
      return { id:'m'+m.id, label:m.code+(m.site_name?' · '+m.site_name:''), sub:(u?.firstName||'')+(u?.lastName?' '+u.lastName:''),
        start:m.created_at?fmtDateISO(new Date(m.created_at)):fmtDateISO(weekStart), end:m.deadline||fmtDateISO(addDays(weekStart,14)),
        color:m.status==='done'?C.green:m.status==='in_progress'?C.primary:C.orange, progress:m.progress||0, type:'mission' };
    }),
    ...events.filter(ev=>['jalon','echeance','mission'].includes(ev.type)).map(ev=>({
      id:'e'+ev.id, label:ev.title, sub:ev.creator_name||ev.created_by_name||'',
      start:toLD(ev.start_date), end:toLD(ev.end_date||ev.start_date),
      color:ev.color||(DEPT[ev.dept]?.color||C.primary), progress:0, type:ev.type,
    })),
  ];
  const todayLeft = getLeft(fmtDateISO(new Date()));

  return (
    <div style={{flex:1,overflow:'auto',position:'relative'}}>
      <div style={{display:'flex',minWidth:220+totalDays*DAY_W}}>
        <div style={{width:220,flexShrink:0,borderRight:`2px solid ${C.border}`}}>
          <div style={{height:48,borderBottom:`1px solid ${C.border}`,background:C.bg,display:'flex',alignItems:'center',padding:'0 12px',gap:6}}>
            <Icon name="briefcase" size={13} color={C.text3}/>
            <span style={{fontSize:11,fontWeight:700,color:C.text3,letterSpacing:'.5px',textTransform:'uppercase'}}>Projet / Tâche</span>
          </div>
          {ITEMS.map(item=>(
            <div key={item.id} style={{height:44,borderBottom:`1px solid ${C.border2}`,padding:'0 12px',display:'flex',alignItems:'center',gap:8}}>
              <Icon name={item.type==='mission'?'tool':item.type==='jalon'?'target':'money'} size={12} color={item.color}/>
              <div style={{minWidth:0}}>
                <div style={{fontSize:11,fontWeight:600,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.label}</div>
                <div style={{fontSize:10,color:C.text4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{flex:1,position:'relative'}}>
          <div style={{height:48,borderBottom:`1px solid ${C.border}`,display:'flex',position:'sticky',top:0,background:C.white,zIndex:3}}>
            {days.map((d,i)=>{
              const today=isSameDay(d,new Date()); const isMon=new Date(d).getDay()===1;
              return (
                <div key={i} style={{width:DAY_W,flexShrink:0,borderRight:isMon?`1px solid ${C.border}`:`1px solid ${C.border2}`,background:today?C.primaryL:'transparent',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                  <span style={{fontSize:8,fontWeight:700,color:today?C.primary:C.text4,textTransform:'uppercase'}}>{dayName(d).charAt(0)}</span>
                  <span style={{fontSize:10,fontWeight:today?700:400,color:today?C.primary:C.text3}}>{new Date(d).getDate()}</span>
                </div>
              );
            })}
          </div>
          {ITEMS.map(item=>(
            <div key={item.id} style={{height:44,borderBottom:`1px solid ${C.border2}`,position:'relative',display:'flex'}}>
              {days.map((d,i)=>{ const today=isSameDay(d,new Date()); const isMon=new Date(d).getDay()===1;
                return <div key={i} style={{width:DAY_W,flexShrink:0,background:today?'#F0F5FF':i%2?'transparent':'#FAFAFA',borderRight:isMon?`1px solid ${C.border}`:`1px solid ${C.border2}`}}/>; })}
              {item.start&&(
                <div style={{position:'absolute',top:8,left:getLeft(item.start),width:getW(item.start,item.end),height:28,background:item.color+'20',border:`1.5px solid ${item.color}`,borderRadius:5,overflow:'hidden',minWidth:6,display:'flex',alignItems:'center',padding:'0 7px'}}>
                  {item.progress>0&&<div style={{position:'absolute',top:0,left:0,height:'100%',width:item.progress+'%',background:item.color+'40',borderRadius:4}}/>}
                  <span style={{fontSize:9,fontWeight:600,color:item.color,position:'relative',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                    {getW(item.start,item.end)>70?item.label+(item.progress>0?' '+item.progress+'%':''):''}
                  </span>
                </div>
              )}
            </div>
          ))}
          {todayLeft>=0&&todayLeft<=totalDays*DAY_W&&(
            <div style={{position:'absolute',top:48,bottom:0,left:todayLeft+DAY_W/2-1,width:2,background:C.red+'70',pointerEvents:'none',zIndex:2}}>
              <div style={{position:'absolute',top:-1,left:-18,background:C.red,color:'white',fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:4,whiteSpace:'nowrap'}}>Auj.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EventModal = ({ event, onClose, onSave, users, missions }) => {
  const isEdit = !!event?.id;
  const today = fmtDateISO(new Date());
  const [form, setForm] = useState({
    title:event?.title||'', type:event?.type||'reunion_interne', dept:event?.dept||'terrain', visibility:event?.visibility||'entreprise',
    startDate:toLD(event?.start_date)||today, endDate:toLD(event?.end_date)||today,
    startHour:event?.start_hour||8, endHour:event?.end_hour||10, allDay:event?.all_day||false, description:event?.description||'',
    location:event?.location||'', techIds:(Array.isArray(event?.tech_ids)?event.tech_ids:(event?.tech_ids?JSON.parse(event.tech_ids||'[]'):[])),
    zoomLink:event?.zoom_link||'', commChannel:event?.comm_channel||'',
  });
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const techList = (users||[]).filter(u=>['technician','project_manager','bureau','admin'].includes(u.role));
  const meta = TYPE_META[form.type]||{};

  const handleSave = async () => {
    if(!form.title.trim()) return;
    setSaving(true);
    const method=isEdit?'PUT':'POST';
    const url=isEdit?`${BASE}/planning/events/${event.id}`:`${BASE}/planning/events`;
    try {
      const resp = await fetch(url,{method,headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk()},body:JSON.stringify(form)});
      const r = await resp.json();
      setSaving(false);
      if(r?.id) onSave(r);
      else alert('Erreur sauvegarde: '+(r?.message||r?.error||JSON.stringify(r)));
    } catch(e) { setSaving(false); alert('Erreur réseau: '+e.message); }
  };

  const sel = (label,key,opts) => (
    <div style={{marginBottom:12}}>
      <label style={{fontSize:11,fontWeight:600,color:C.text2,display:'block',marginBottom:4}}>{label}</label>
      <select value={form[key]} onChange={e=>set(key,e.target.value)} style={{width:'100%',padding:'9px 10px',border:`1px solid ${C.border}`,borderRadius:8,fontSize:13,color:C.text,background:C.white,fontFamily:'inherit',outline:'none'}}>
        {opts.map(o=><option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </div>
  );
  const inp = (label,key,type='text',ph='') => (
    <div style={{marginBottom:12}}>
      <label style={{fontSize:11,fontWeight:600,color:C.text2,display:'block',marginBottom:4}}>{label}</label>
      <input type={type} value={form[key]} placeholder={ph} onChange={e=>set(key,type==='number'?Number(e.target.value):e.target.value)}
        style={{width:'100%',padding:'9px 10px',border:`1px solid ${C.border}`,borderRadius:8,fontSize:13,color:C.text,background:C.white,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/>
    </div>
  );

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:800,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:C.white,borderRadius:14,width:560,maxHeight:'90vh',overflow:'auto',boxShadow:'0 24px 60px rgba(0,0,0,.2)'}}>
        <div style={{padding:'16px 20px',borderBottom:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,background:C.white,zIndex:2}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:32,height:32,borderRadius:8,background:(meta.color||C.primary)+'18',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icon name={meta.icon||'calendar'} size={16} color={meta.color||C.primary}/>
            </div>
            <span style={{fontSize:14,fontWeight:700,color:C.text}}>{isEdit?"Modifier l'événement":'Nouvel événement'}</span>
          </div>
          <button onClick={onClose} style={{border:'none',background:C.grayL,borderRadius:8,width:30,height:30,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Icon name="x" size={14} color={C.text3}/>
          </button>
        </div>
        <div style={{padding:'16px 20px'}}>
          {inp('Titre *','title','text','Ex: Réunion budget MTN semaine 25')}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            {sel('Type','type',Object.entries(TYPE_META).map(([id,m])=>({id,label:m.label})))}
            {sel('Département','dept',Object.entries(DEPT).map(([id,d])=>({id,label:d.label})))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            {inp('Date début *','startDate','date')}
            {inp('Date fin','endDate','date')}
          </div>
          {!form.allDay&&(
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {sel('Heure début','startHour',HOURS.map(h=>({id:h,label:h+'h00'})))}
              {sel('Heure fin','endHour',HOURS.filter(h=>h>form.startHour).map(h=>({id:h,label:h+'h00'})))}
            </div>
          )}
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
            <input type="checkbox" id="ad" checked={form.allDay} onChange={e=>set('allDay',e.target.checked)} style={{width:15,height:15,cursor:'pointer',accentColor:C.primary}}/>
            <label htmlFor="ad" style={{fontSize:13,color:C.text2,cursor:'pointer'}}>Journée entière</label>
          </div>
          {sel('Visibilité','visibility',VISIBILITY_OPTS)}
          {inp('Lieu / Salle','location','text','Ex: Salle de conférence CleanIT')}
          {form.type==='reunion_externe'&&inp('Lien Zoom/Meet/Teams','zoomLink','url','https://')}
          {form.type==='reunion_interne'&&inp('Canal CleanIT Comm','commChannel','text','Ex: #weekly-bureau')}
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,fontWeight:600,color:C.text2,display:'block',marginBottom:6}}>Participants &amp; techniciens</label>
            <div style={{border:`1px solid ${C.border}`,borderRadius:8,maxHeight:140,overflowY:'auto',background:'#FAFAFA'}}>
              {techList.length===0&&<div style={{padding:'12px',textAlign:'center',fontSize:12,color:C.text4}}>Chargement...</div>}
              {techList.map(u=>{
                const checked=(form.techIds||[]).includes(String(u.id));
                return (
                  <div key={u.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 12px',borderBottom:`1px solid ${C.border2}`}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <input type="checkbox" checked={checked} onChange={e=>set('techIds',e.target.checked?[...(form.techIds||[]),String(u.id)]:(form.techIds||[]).filter(x=>x!==String(u.id)))} style={{cursor:'pointer',accentColor:C.primary}}/>
                      <div style={{width:28,height:28,borderRadius:'50%',background:C.primaryL,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:C.primary}}>
                        {(u.firstName||'?')[0]}{(u.lastName||'')[0]}
                      </div>
                      <div>
                        <div style={{fontSize:12,fontWeight:500,color:C.text}}>{u.firstName} {u.lastName}</div>
                        <div style={{fontSize:10,color:C.text4}}>{u.role}</div>
                      </div>
                    </div>
                    {checked&&<AvailBadge techId={u.id} startDate={form.startDate} endDate={form.endDate}/>}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{marginBottom:4}}>
            <label style={{fontSize:11,fontWeight:600,color:C.text2,display:'block',marginBottom:4}}>Description</label>
            <textarea value={form.description} rows={3} onChange={e=>set('description',e.target.value)} placeholder="Contexte, objectifs, notes..."
              style={{width:'100%',padding:'9px 10px',border:`1px solid ${C.border}`,borderRadius:8,fontSize:13,color:C.text,background:C.white,fontFamily:'inherit',resize:'vertical',outline:'none',boxSizing:'border-box'}}/>
          </div>
        </div>
        <div style={{padding:'12px 20px',borderTop:`1px solid ${C.border}`,display:'flex',gap:8,justifyContent:'flex-end',position:'sticky',bottom:0,background:C.white}}>
          <button onClick={onClose} style={{padding:'9px 18px',border:`1px solid ${C.border}`,borderRadius:8,background:C.white,fontSize:13,cursor:'pointer',fontFamily:'inherit',color:C.text2}}>Annuler</button>
          <button disabled={saving||!form.title.trim()} onClick={handleSave} style={{padding:'9px 20px',border:'none',borderRadius:8,background:C.primary,color:'white',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit',opacity:saving?0.6:1,display:'flex',alignItems:'center',gap:6}}>
            {saving ? <><Icon name="refresh" size={14} color="white"/> Enregistrement...</> : <><Icon name={isEdit?'edit':'plus'} size={14} color="white"/>{isEdit?'Enregistrer':"Créer l'événement"}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const EventDetail = ({ ev, onClose, onEdit, onDelete, navigate, users=[] }) => {
  const dept = DEPT[ev.dept]||DEPT.terrain;
  const meta = TYPE_META[ev.type]||{icon:'calendar',color:dept.color,label:ev.type};
  const color = ev.color||meta.color;
  const techIds = Array.isArray(ev.tech_ids)?ev.tech_ids:(ev.tech_ids?JSON.parse(ev.tech_ids||'[]'):[]);

  return (
    <div style={{position:'absolute',top:0,right:0,bottom:0,width:340,background:C.white,boxShadow:'-6px 0 30px rgba(0,0,0,.1)',zIndex:400,display:'flex',flexDirection:'column',borderLeft:`1px solid ${C.border}`}}>
      <div style={{padding:'14px 18px',borderBottom:`1px solid ${C.border}`,flexShrink:0,background:color+'10'}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:38,height:38,borderRadius:10,background:color+'20',border:`1.5px solid ${color}30`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <Icon name={meta.icon} size={18} color={color}/>
            </div>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:C.text,lineHeight:1.3}}>{ev.title}</div>
              <div style={{display:'flex',alignItems:'center',gap:6,marginTop:3}}>
                <span style={{fontSize:11,color,fontWeight:600}}>{meta.label}</span>
                {ev.link_module&&<SourceBadge ev={ev}/>}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{border:'none',background:C.grayL,borderRadius:7,width:28,height:28,cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <Icon name="x" size={13} color={C.text3}/>
          </button>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'14px 18px'}}>
        {[
          [<Icon name="calendar" size={13} color={C.text3}/>, 'Dates', toLD(ev.start_date)===toLD(ev.end_date)?fmtDate(ev.start_date):fmtDate(ev.start_date)+' → '+fmtDate(ev.end_date)],
          [<Icon name="clock" size={13} color={C.text3}/>, 'Horaire', ev.all_day?'Journée entière':`${Number(ev.start_hour)||0}h00 – ${Number(ev.end_hour)||0}h00`],
          [<Icon name="person" size={13} color={C.text3}/>, 'Créé par', ev.creator_name||ev.created_by_name||'—'],
          [<Icon name="eye" size={13} color={C.text3}/>, 'Visibilité', VISIBILITY_OPTS.find(v=>v.id===ev.visibility)?.label||ev.visibility],
          ev.location&&[<Icon name="map" size={13} color={C.text3}/>, 'Lieu', ev.location],
        ].filter(Boolean).map(([ico,label,val],i)=>(
          <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:`1px solid ${C.border2}`,gap:10}}>
            <div style={{display:'flex',alignItems:'center',gap:6,color:C.text3,flexShrink:0}}>{ico}<span style={{fontSize:12}}>{label}</span></div>
            <span style={{fontSize:12,fontWeight:500,color:C.text,textAlign:'right'}}>{val}</span>
          </div>
        ))}
        {ev.description&&(
          <div style={{marginTop:12,padding:'10px 12px',background:C.bg,borderRadius:8,fontSize:12,color:C.text2,lineHeight:1.6,borderLeft:`3px solid ${color}`}}>{ev.description}</div>
        )}
        {techIds.length>0&&(
          <div style={{marginTop:12}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
              <Icon name="users" size={13} color={C.text3}/>
              <span style={{fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:'.5px'}}>Participants ({techIds.length})</span>
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {techIds.map(id=>{
                const u = users.find(x=>String(x.id)===String(id));
                const label = u ? `${u.firstName||''} ${u.lastName||''}`.trim() : `Utilisateur ${id}`;
                return <span key={id} style={{padding:'3px 9px',borderRadius:20,background:C.primaryL,color:C.primary,fontSize:11,fontWeight:500}}>{label}</span>;
              })}
            </div>
          </div>
        )}
        {ev.link_module&&(
          <div style={{marginTop:12,padding:'10px 12px',background:C.amberL,borderRadius:8,border:`1px solid ${C.amber}30`,display:'flex',alignItems:'center',gap:8}}>
            <Icon name="link" size={14} color={C.amber}/>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:C.amber}}>Créé automatiquement</div>
              <div style={{fontSize:11,color:C.text3}}>Lié à {ev.link_module==='approvals'?'une demande Approvals':ev.link_module==='cleanitbooks'?'une écriture CleanITBooks':ev.link_module==='bons_commande'?'un bon de commande':'un module CleanIT'}</div>
            </div>
          </div>
        )}
      </div>
      <div style={{padding:'12px 18px',borderTop:`1px solid ${C.border}`,display:'flex',flexDirection:'column',gap:7,flexShrink:0}}>
        {ev.zoom_link&&<a href={ev.zoom_link} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'9px',borderRadius:8,background:C.primary,color:'white',textDecoration:'none',fontSize:12,fontWeight:600}}><Icon name="video" size={14} color="white"/> Rejoindre la réunion</a>}
        {ev.comm_channel&&<button onClick={()=>navigate('/comm')} style={{padding:'9px',borderRadius:8,border:'none',background:C.primaryL,color:C.primary,cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}><Icon name="chat" size={14} color={C.primary}/> Ouvrir dans CleanIT Comm</button>}
        {ev.link_module==='approvals'&&<button onClick={()=>navigate('/approvals')} style={{padding:'9px',borderRadius:8,border:'none',background:C.amberL,color:C.amber,cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}><Icon name="approval" size={14} color={C.amber}/> Voir dans Approvals</button>}
        {ev.link_module==='cleanitbooks'&&<button onClick={()=>navigate('/cleanitbooks')} style={{padding:'9px',borderRadius:8,border:'none',background:C.purpleL,color:C.purple,cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}><Icon name="money" size={14} color={C.purple}/> Voir dans CleanITBooks</button>}
        <div style={{display:'flex',gap:7}}>
          <button onClick={()=>onEdit(ev)} style={{flex:1,padding:'8px',borderRadius:7,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',fontFamily:'inherit',fontSize:12,color:C.text2,display:'flex',alignItems:'center',justifyContent:'center',gap:5}}><Icon name="edit" size={13} color={C.text2}/> Modifier</button>
          <button onClick={()=>onDelete(ev.id)} style={{flex:1,padding:'8px',borderRadius:7,border:`1px solid ${C.redL}`,background:C.redL,cursor:'pointer',fontFamily:'inherit',fontSize:12,color:C.red,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:5}}><Icon name="trash" size={13} color={C.red}/> Supprimer</button>
        </div>
      </div>
    </div>
  );
};

const PROJECT_COLORS = {
  MPBN:C.primary, B2B:C.green, IPCORE:C.purple, DWDM:C.orange, FULLSTRACK:C.red, EBU:C.gray,
};

const StatusBadgeBC = ({ status }) => {
  const cfg = {
    pending:{l:'En attente',c:C.text3,bg:C.grayL||C.border2},
    submitted:{l:'Soumis',c:C.orange,bg:'#FFF0E6'},
    approved:{l:'Approuvé',c:C.green,bg:C.greenL||'#DCFCE7'},
    rejected:{l:'Rejeté',c:C.red,bg:'#FEE2E2'},
  }[status]||{l:status,c:C.text3,bg:C.border2};
  return <span style={{padding:'3px 9px',borderRadius:20,background:cfg.bg,color:cfg.c,fontSize:11,fontWeight:600}}>{cfg.l}</span>;
};

const ProjectTableView = ({ navigate, onToast }) => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState('project_type');

  const load = useCallback(async () => {
    setLoading(true);
    const h = {'Authorization':'Bearer '+tk()};
    try {
      const s = await fetch(BASE+'/bc-sites',{headers:h}).then(r=>r.json()).catch(()=>[]);
      setSites(Array.isArray(s)?s:[]);
    } catch(e){}
    setLoading(false);
  },[]);

  useEffect(()=>{ load(); },[load]);

  const requestPayment = async (site) => {
    const amt = site.request_amount || site.budget_total;
    if(!confirm(`Créer une demande de paiement de ${Number(amt||0).toLocaleString('fr-FR')} FCFA pour ${site.site_id} ?`)) return;
    const r = await fetch(`${BASE}/bc-sites/${site.id}/request-payment`,{
      method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk()},
      body: JSON.stringify({amount: amt})
    }).then(r=>r.json()).catch(()=>null);
    if(r?.approval) { onToast('Demande de paiement créée dans Approvals'); load(); }
    else alert('Erreur: '+(r?.message||'inconnue'));
  };

  const createJalon = async (site) => {
    const r = await fetch(`${BASE}/bc-sites/${site.id}/create-jalon`,{
      method:'POST', headers:{'Authorization':'Bearer '+tk()}
    }).then(r=>r.json()).catch(()=>null);
    if(r?.event) { onToast('Jalon créé dans Planning'); load(); }
    else alert('Erreur: '+(r?.message||'inconnue'));
  };

  const groups = sites.reduce((acc,s)=>{
    const key = groupBy==='project_type' ? (s.project_type||'Sans type') : (s.team_leader||'Sans responsable');
    if(!acc[key]) acc[key]=[];
    acc[key].push(s);
    return acc;
  },{});

  const totalBudget = sites.reduce((s,x)=>s+Number(x.budget_total||0),0);
  const fmtN = n => Number(n||0).toLocaleString('fr-FR');

  return (
    <div style={{flex:1,overflow:'auto',padding:'16px 20px'}}>
      <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16,flexWrap:'wrap'}}>
        <div>
          <div style={{fontSize:13,color:C.text3}}>{sites.length} site(s) · Budget total {fmtN(totalBudget)} FCFA</div>
        </div>
        <div style={{flex:1}}/>
        <select value={groupBy} onChange={e=>setGroupBy(e.target.value)} style={{padding:'6px 12px',border:`1px solid ${C.border}`,borderRadius:8,fontSize:12,color:C.text2,background:C.white,fontFamily:'inherit'}}>
          <option value="project_type">Grouper par type de projet</option>
          <option value="team_leader">Grouper par technicien</option>
        </select>
        <button onClick={load} style={{padding:'6px 14px',border:`1px solid ${C.border}`,borderRadius:8,background:C.white,fontSize:12,fontWeight:600,color:C.text2,cursor:'pointer',fontFamily:'inherit'}}>Rafraîchir</button>
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:60,color:C.text3}}>Chargement...</div>
      ) : sites.length===0 ? (
        <div style={{textAlign:'center',padding:60,color:C.text3}}>
          Aucun site importé. Utilisez ChaCha pour importer un Bon de Commande (Excel ou PDF).
        </div>
      ) : (
        Object.entries(groups).map(([groupName, groupSites]) => (
          <div key={groupName} style={{marginBottom:24}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
              <div style={{width:10,height:10,borderRadius:3,background:PROJECT_COLORS[groupName]||C.gray}}/>
              <span style={{fontSize:13,fontWeight:700,color:C.text}}>{groupName}</span>
              <span style={{fontSize:11,color:C.text4}}>({groupSites.length} site{groupSites.length>1?'s':''})</span>
            </div>
            <div style={{background:C.white,borderRadius:10,border:`1px solid ${C.border}`,overflow:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                <thead>
                  <tr style={{background:C.bg,borderBottom:`1px solid ${C.border}`}}>
                    {['Site ID','Nom site','Team Leader','Budget Transport','Achat matériel','Budget Total','Payment 1','Payment 2','Payment 3','Balance','Outbound','Install Start','Install Closed','Statut','Actions'].map(h=>(
                      <th key={h} style={{padding:'8px 10px',textAlign:'left',fontWeight:700,color:C.text3,whiteSpace:'nowrap',fontSize:10,textTransform:'uppercase',letterSpacing:'.3px'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groupSites.map(s=>(
                    <tr key={s.id} style={{borderBottom:`1px solid ${C.border}`}}>
                      <td style={{padding:'8px 10px',fontWeight:700,color:C.primary,fontFamily:'monospace'}}>{s.site_id}</td>
                      <td style={{padding:'8px 10px',color:C.text}}>{s.site_name||'—'}</td>
                      <td style={{padding:'8px 10px',color:C.text2}}>{s.team_leader||'—'}</td>
                      <td style={{padding:'8px 10px',color:C.text3,textAlign:'right'}}>{Number(s.budget_transport)>0?fmtN(s.budget_transport):'—'}</td>
                      <td style={{padding:'8px 10px',color:C.text3,textAlign:'right'}}>{Number(s.budget_materiel)>0?fmtN(s.budget_materiel):'—'}</td>
                      <td style={{padding:'8px 10px',fontWeight:700,color:C.green,textAlign:'right'}}>{fmtN(s.budget_total)}</td>
                      <td style={{padding:'8px 10px',color:C.text3,textAlign:'right'}}>{Number(s.payment_1)>0?fmtN(s.payment_1):'—'}</td>
                      <td style={{padding:'8px 10px',color:C.text3,textAlign:'right'}}>{Number(s.payment_2)>0?fmtN(s.payment_2):'—'}</td>
                      <td style={{padding:'8px 10px',color:C.text3,textAlign:'right'}}>{Number(s.payment_3)>0?fmtN(s.payment_3):'—'}</td>
                      <td style={{padding:'8px 10px',fontWeight:600,color:Number(s.balance)>0?C.orange:C.text3,textAlign:'right'}}>{fmtN(s.balance)}</td>
                      <td style={{padding:'8px 10px',color:C.text3}}>{fmtDate(s.outbound_date)}</td>
                      <td style={{padding:'8px 10px',color:C.text3}}>{fmtDate(s.install_start_date)}</td>
                      <td style={{padding:'8px 10px',color:C.text3}}>{fmtDate(s.install_closed_date)}</td>
                      <td style={{padding:'8px 10px'}}><StatusBadgeBC status={s.approval_status}/></td>
                      <td style={{padding:'8px 10px',whiteSpace:'nowrap'}}>
                        <div style={{display:'flex',gap:4}}>
                          {!s.approval_id && (
                            <button onClick={()=>requestPayment(s)} title="Demander paiement"
                              style={{padding:'4px 8px',border:'none',borderRadius:6,background:'#FFF0E6',color:C.orange,fontSize:10,fontWeight:600,cursor:'pointer'}}>
                              Payer
                            </button>
                          )}
                          {s.approval_id && (
                            <button onClick={()=>navigate('/approvals')} title="Voir l'approbation"
                              style={{padding:'4px 8px',border:'none',borderRadius:6,background:C.primaryL,color:C.primary,fontSize:10,fontWeight:600,cursor:'pointer'}}>
                              Voir
                            </button>
                          )}
                          {!s.planning_event_id && (s.outbound_date||s.install_start_date) && (
                            <button onClick={()=>createJalon(s)} title="Créer jalon Planning"
                              style={{padding:'4px 8px',border:'none',borderRadius:6,background:'#F3E8FF',color:C.purple,fontSize:10,fontWeight:600,cursor:'pointer'}}>
                              Jalon
                            </button>
                          )}
                          {s.planning_event_id && (
                            <span style={{padding:'4px 8px',borderRadius:6,background:C.greenL||'#DCFCE7',color:C.green,fontSize:10,fontWeight:600}}>
                              ✓ Planifié
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{background:C.bg,fontWeight:700}}>
                    <td colSpan={5} style={{padding:'8px 10px',color:C.text3,textAlign:'right'}}>Sous-total :</td>
                    <td style={{padding:'8px 10px',color:C.green,textAlign:'right'}}>{fmtN(groupSites.reduce((s,x)=>s+Number(x.budget_total||0),0))}</td>
                    <td colSpan={8}/>
                  </tr>
                </tfoot>
              </table>
            </div>
            {groupSites.some(s=>s.remark) && (
              <div style={{marginTop:8,padding:'8px 12px',background:C.border2,borderRadius:8,fontSize:11,color:C.text3}}>
                {groupSites.filter(s=>s.remark).map(s=>(
                  <div key={s.id} style={{marginBottom:4}}><strong>{s.site_id}:</strong> {s.remark}</div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default function Planning() {
  const user = getUser();
  const navigate = useNavigate();
  const [view, setView] = useState('week');
  const [currentDate, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [missions, setMissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selEvent, setSelEvent] = useState(null);
  const [showModal, setModal] = useState(false);
  const [editEvent, setEdit] = useState(null);
  const [slotPref, setSlotPref] = useState(null);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState({dept:'all',type:'all',mine:false});
  const [showFilters, setShowFilters] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const weekStart = (() => { const d=new Date(currentDate); const day=d.getDay(); d.setDate(d.getDate()-(day===0?6:day-1)); d.setHours(0,0,0,0); return d; })();

  const load = useCallback(async () => {
    setLoading(true);
    const h = {'Authorization':'Bearer '+tk()};
    const s = fmtDateISO(addDays(weekStart,-60));
    const e = fmtDateISO(addDays(weekStart,120));
    try {
      const [evts,msns,usrs] = await Promise.all([
        fetch(`${BASE}/planning/events?start=${s}&end=${e}`,{headers:h}).then(r=>r.json()).catch(()=>[]),
        fetch(`${BASE}/missions`,{headers:h}).then(r=>r.json()).catch(()=>[]),
        fetch(`${BASE}/users`,{headers:h}).then(r=>r.json()).catch(()=>[]),
      ]);
      setEvents(Array.isArray(evts)?evts:[]);
      setMissions(Array.isArray(msns)?msns:[]);
      setUsers(Array.isArray(usrs)?usrs:[]);
    } catch(e){}
    setLoading(false);
  },[currentDate]);

  useEffect(()=>{ load(); },[load, reloadKey]);

  const filtered = events.filter(ev=>{
    if(filter.dept!=='all'&&ev.dept!==filter.dept) return false;
    if(filter.type!=='all'&&ev.type!==filter.type) return false;
    if(filter.mine&&ev.created_by!==user?.id) return false;
    return true;
  });

  const nav = (dir) => {
    const d=new Date(currentDate);
    if(view==='week') d.setDate(d.getDate()+dir*7);
    else if(view==='month') d.setMonth(d.getMonth()+dir);
    else d.setDate(d.getDate()+dir*7*4);
    setDate(d);
  };

  const headerLabel = () => {
    if(view==='week') { const we=addDays(weekStart,6); return `${new Date(weekStart).getDate()} ${new Date(weekStart).toLocaleDateString('fr-FR',{month:'short'})} – ${new Date(we).getDate()} ${new Date(we).toLocaleDateString('fr-FR',{month:'short',year:'numeric'})}`; }
    if(view==='month') { const m=currentDate.toLocaleDateString('fr-FR',{month:'long',year:'numeric'}); return m.charAt(0).toUpperCase()+m.slice(1); }
    return 'Vue Gantt — 10 semaines';
  };

  const handleSave = (saved) => { setModal(false); setEdit(null); setSlotPref(null); setReloadKey(k=>k+1); setToast({msg:editEvent?.id?'Événement modifié':'Événement créé',type:'success'}); };
  const handleDelete = async (id) => {
    if(!confirm('Supprimer cet événement ?')) return;
    await fetch(`${BASE}/planning/events/${id}`,{method:'DELETE',headers:{'Authorization':'Bearer '+tk()}});
    setSelEvent(null); setReloadKey(k=>k+1); setToast({msg:'Événement supprimé',type:'success'});
  };

  const autoCount = events.filter(ev=>ev.link_module).length;

  return (
    <div style={{height:'100vh',display:'flex',flexDirection:'column',background:C.bg,fontFamily:'Inter,system-ui,sans-serif',overflow:'hidden'}}>
      {toast&&<Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:'10px 18px',display:'flex',alignItems:'center',gap:10,flexShrink:0,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <button onClick={()=>nav(-1)} style={{width:30,height:30,border:`1px solid ${C.border}`,borderRadius:8,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="chevronL" size={14} color={C.text2}/></button>
          <button onClick={()=>setDate(new Date())} style={{padding:'5px 14px',border:`1px solid ${C.border}`,borderRadius:8,background:C.white,cursor:'pointer',fontSize:12,fontWeight:600,color:C.text2,fontFamily:'inherit'}}>Aujourd'hui</button>
          <button onClick={()=>nav(1)} style={{width:30,height:30,border:`1px solid ${C.border}`,borderRadius:8,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="chevronR" size={14} color={C.text2}/></button>
          <span style={{fontSize:14,fontWeight:700,color:C.text,minWidth:180,marginLeft:4}}>{headerLabel()}</span>
        </div>
        {autoCount>0&&(
          <div style={{display:'flex',alignItems:'center',gap:5,padding:'4px 10px',borderRadius:20,background:C.amberL,border:`1px solid ${C.amber}30`}}>
            <Icon name="link" size={12} color={C.amber}/>
            <span style={{fontSize:11,fontWeight:600,color:C.amber}}>{autoCount} événement{autoCount>1?'s':''} auto</span>
          </div>
        )}
        <div style={{flex:1}}/>
        <button onClick={()=>setShowFilters(p=>!p)} style={{padding:'5px 12px',border:`1px solid ${showFilters?C.primary:C.border}`,borderRadius:8,background:showFilters?C.primaryL:C.white,cursor:'pointer',fontSize:12,fontWeight:500,color:showFilters?C.primary:C.text2,fontFamily:'inherit',display:'flex',alignItems:'center',gap:5}}>
          <Icon name="filter" size={13} color={showFilters?C.primary:C.text2}/>Filtres
        </button>
        <div style={{display:'flex',border:`1px solid ${C.border}`,borderRadius:8,overflow:'hidden'}}>
          {[['week','Semaine','calendar'],['month','Mois','eye'],['gantt','Gantt','briefcase'],['projects','Tableau Projets','briefcase']].map(([v,l,ic])=>(
            <button key={v} onClick={()=>setView(v)} style={{padding:'6px 14px',border:'none',borderRight:`1px solid ${C.border}`,background:view===v?C.primary:C.white,color:view===v?C.white:C.text3,fontSize:12,fontWeight:view===v?700:500,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:5}}>
              <Icon name={ic} size={12} color={view===v?C.white:C.text3}/>{l}
            </button>
          ))}
        </div>
        <button onClick={()=>{setEdit(null);setSlotPref(null);setModal(true);}} style={{padding:'7px 16px',background:C.primary,color:C.white,border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:6}}>
          <Icon name="plus" size={14} color="white"/>Événement
        </button>
        <button onClick={()=>setReloadKey(k=>k+1)} style={{width:32,height:32,border:`1px solid ${C.border}`,borderRadius:8,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="refresh" size={14} color={C.text3}/></button>
      </div>
      {showFilters&&(
        <div style={{background:C.bg,borderBottom:`1px solid ${C.border}`,padding:'8px 18px',display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
          <select value={filter.dept} onChange={e=>setFilter(p=>({...p,dept:e.target.value}))} style={{padding:'5px 10px',border:`1px solid ${C.border}`,borderRadius:7,fontSize:12,color:C.text2,fontFamily:'inherit',background:C.white}}>
            <option value="all">Tous départements</option>{Object.entries(DEPT).map(([k,d])=><option key={k} value={k}>{d.label}</option>)}
          </select>
          <select value={filter.type} onChange={e=>setFilter(p=>({...p,type:e.target.value}))} style={{padding:'5px 10px',border:`1px solid ${C.border}`,borderRadius:7,fontSize:12,color:C.text2,fontFamily:'inherit',background:C.white}}>
            <option value="all">Tous types</option>{Object.entries(TYPE_META).map(([k,m])=><option key={k} value={k}>{m.label}</option>)}
          </select>
          <label style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:C.text2,cursor:'pointer'}}>
            <input type="checkbox" checked={filter.mine} onChange={e=>setFilter(p=>({...p,mine:e.target.checked}))} style={{cursor:'pointer',accentColor:C.primary}}/>Mes événements
          </label>
          <button onClick={()=>setFilter({dept:'all',type:'all',mine:false})} style={{padding:'4px 10px',border:'none',background:'none',cursor:'pointer',fontSize:12,color:C.text4,fontFamily:'inherit'}}>Réinitialiser</button>
        </div>
      )}
      <div style={{flex:1,display:'flex',overflow:'hidden',position:'relative'}}>
        {loading?(
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:14}}>
            <div style={{width:36,height:36,border:`3px solid ${C.primaryL}`,borderTopColor:C.primary,borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
            <span style={{fontSize:13,color:C.text3}}>Chargement du planning...</span>
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
          </div>
        ):(
          <>
            {view==='week'&&<WeekView events={filtered} weekStart={weekStart} onEventClick={setSelEvent} onSlotClick={(d,h)=>{setSlotPref({start_date:d,end_date:d,start_hour:h,end_hour:h+1});setEdit(null);setModal(true);}}/>}
            {view==='month'&&<MonthView events={filtered} currentDate={currentDate} onEventClick={setSelEvent} onSlotClick={(d,h)=>{setSlotPref({start_date:d,end_date:d,start_hour:h,end_hour:h+1});setEdit(null);setModal(true);}}/>}
            {view==='gantt'&&<GanttView events={filtered} missions={missions} users={users} weekStart={weekStart}/>}
            {view==='projects'&&<ProjectTableView navigate={navigate} onToast={(msg)=>setToast({msg,type:'success'})}/>}
          </>
        )}
        {selEvent&&<EventDetail ev={selEvent} users={users} onClose={()=>setSelEvent(null)} onEdit={(ev)=>{setEdit(ev);setSelEvent(null);setModal(true);}} onDelete={handleDelete} navigate={navigate}/>}
      </div>
      {showModal&&<EventModal event={editEvent||slotPref} onClose={()=>{setModal(false);setEdit(null);setSlotPref(null);}} onSave={handleSave} users={users} missions={missions}/>}
    </div>
  );
}
