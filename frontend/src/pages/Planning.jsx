import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { getJobs } from '../services/cleanitbooks.api';

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

const TYPE_STYLES = {
  mission:    {bg:C.blue_l,   c:C.blue_d,  label:'Mission terrain', emoji:'🔧'},
  reunion:    {bg:C.green_l,  c:C.green,   label:'Réunion',          emoji:'📅'},
  formation:  {bg:C.orange_l, c:C.orange,  label:'Formation',         emoji:'🎓'},
  conge:      {bg:C.red_l,    c:C.red,     label:'Congé RH',          emoji:'🏖️'},
  jalon:      {bg:C.purple_l, c:C.purple,  label:'Jalon projet',      emoji:'📌'},
};

const SEED_EVENTS = [
  {id:1,titre:'Installation 5G DLA-001',type:'mission',resp:'Thomas Ngono',photo:'https://i.pravatar.cc/150?img=15',debut:'2025-05-12',fin:'2025-05-28',statut:'en_cours',conflit:false},
  {id:2,titre:'Swap 4G→5G KRI-001',type:'mission',resp:'Pierre Etoga',photo:'https://i.pravatar.cc/150?img=3',debut:'2025-05-15',fin:'2025-05-22',statut:'en_cours',conflit:false},
  {id:3,titre:'Réunion client MTN',type:'reunion',resp:'Marie Kamga',photo:'https://i.pravatar.cc/150?img=47',debut:'2025-05-21',fin:'2025-05-21',statut:'planifie',conflit:false},
  {id:4,titre:'Formation CACES R482',type:'formation',resp:'Ali Moussa',photo:'https://i.pravatar.cc/150?img=15',debut:'2025-05-14',fin:'2025-05-14',statut:'termine',conflit:false},
  {id:5,titre:'Congé annuel Ali Moussa',type:'conge',resp:'Ali Moussa',photo:'https://i.pravatar.cc/150?img=15',debut:'2025-05-16',fin:'2025-05-18',statut:'approuve',conflit:true,conflitMsg:'Ali Moussa assigné à YDE-001 le 20 mai'},
  {id:6,titre:'Deadline livraison YDE-001',type:'jalon',resp:'Marie Kamga',photo:'https://i.pravatar.cc/150?img=47',debut:'2025-05-20',fin:'2025-05-20',statut:'planifie',conflit:false},
  {id:7,titre:'Maintenance GRA-001',type:'mission',resp:'Samuel Djomo',photo:'https://i.pravatar.cc/150?img=22',debut:'2025-05-23',fin:'2025-05-28',statut:'planifie',conflit:false},
  {id:8,titre:'Formation Habilitation H2B2',type:'formation',resp:'Jean Mbarga',photo:'https://i.pravatar.cc/150?img=17',debut:'2025-05-24',fin:'2025-05-24',statut:'planifie',conflit:false},
];

const CHARGE_DATA = [
  {name:'Ali Moussa',photo:'https://i.pravatar.cc/150?img=15',pct:85,h:34,surcharge:false},
  {name:'Jean Mbarga',photo:'https://i.pravatar.cc/150?img=17',pct:112,h:45,surcharge:true},
  {name:'Samuel Djomo',photo:'https://i.pravatar.cc/150?img=22',pct:40,h:16,surcharge:false},
  {name:'Pierre Etoga',photo:'https://i.pravatar.cc/150?img=3',pct:70,h:28,surcharge:false},
];

const DAYS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const DAYS_NUM = [12,13,14,15,16,17,18,19,20,21,22,23,24,25];

function getDayEvents(dayNum, events){
  return events.filter(e=>{
    const ds=Number(e.debut.split('-')[2]), de=Number(e.fin.split('-')[2]);
    return dayNum>=ds&&dayNum<=de;
  });
}

function CalView({events}){
  const [showForm,setShowForm]=useState(false);
  const conflits = events.filter(e=>e.conflit);
  const calDays = [12,13,14,15,16,17,18,19,20,21,22,23,24,25];
  const empties = [false,false,false,false,false,true,true];

  return (
    <div style={{padding:'14px 20px',background:C.bg}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:6}}>
        {DAYS.map(d=><div key={d} style={{fontSize:10,fontWeight:500,color:C.text3,textAlign:'center',padding:'4px 0'}}>{d}</div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:12}}>
        {[...Array(14)].map((_,i)=>{
          const dayNum = i<14?calDays[i]||null:null;
          if(!dayNum) return <div key={i} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:5,padding:5,minHeight:58,opacity:.4}}/>;
          const isToday=dayNum===15;
          const dayEvs=getDayEvents(dayNum,events);
          return (
            <div key={i} style={{background:C.white,border:`1px solid ${isToday?C.blue:C.border}`,borderRadius:5,padding:5,minHeight:58,background:isToday?'#E6F1FB20':C.white}}>
              <div style={{fontSize:11,fontWeight:isToday?700:400,marginBottom:3,color:isToday?C.white:'inherit',background:isToday?C.blue:'transparent',borderRadius:isToday?'50%':0,width:isToday?20:undefined,height:isToday?20:undefined,display:isToday?'flex':'block',alignItems:'center',justifyContent:'center'}}>{dayNum}</div>
              {dayEvs.slice(0,2).map((ev,j)=>{
                const ts=TYPE_STYLES[ev.type]||TYPE_STYLES.mission;
                return <div key={j} style={{fontSize:9,padding:'1px 3px',borderRadius:3,background:ts.bg,color:ts.c,marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',border:ev.conflit?`1px solid ${C.red}`:'none'}}>
                  {ts.emoji} {ev.titre.slice(0,15)}{ev.conflit?' ⚠️':''}
                </div>;
              })}
              {dayEvs.length>2&&<div style={{fontSize:9,color:C.text3}}>+{dayEvs.length-2}</div>}
            </div>
          );
        })}
      </div>
      {conflits.length>0&&(
        <div style={{padding:'9px 12px',background:C.red_l,border:`1px solid #FCA5A5`,borderRadius:7,display:'flex',alignItems:'center',gap:7,fontSize:12,color:C.red}}>
          🧠 <div><b>Conflit IA détecté :</b> {conflits.map(c=>c.conflitMsg).join(' · ')} <span style={{textDecoration:'underline',cursor:'pointer',fontSize:11}}>Résoudre →</span></div>
        </div>
      )}
    </div>
  );
}

function GanttView({events}){
  return (
    <div style={{padding:'14px 20px',background:C.bg}}>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:'180px 1fr',borderBottom:`1px solid ${C.border}`}}>
          <div style={{padding:'8px 12px',fontSize:10,fontWeight:600,color:C.text3,borderRight:`1px solid ${C.border2}`}}>Activité</div>
          <div style={{display:'grid',gridTemplateColumns:`repeat(${DAYS_NUM.length},1fr)`,fontSize:9,color:C.text3}}>
            {DAYS_NUM.map(d=><div key={d} style={{padding:'8px 2px',textAlign:'center',borderRight:`1px solid ${C.border2}`,background:d===15?C.blue_l:'transparent',color:d===15?C.blue:C.text3,fontWeight:d===15?700:400}}>{d}</div>)}
          </div>
        </div>
        {events.map((ev,i)=>{
          const ts=TYPE_STYLES[ev.type]||TYPE_STYLES.mission;
          const ds=Number(ev.debut.split('-')[2]), de=Number(ev.fin.split('-')[2]);
          const colStart=DAYS_NUM.indexOf(ds)+1, colEnd=DAYS_NUM.indexOf(de)+2;
          return (
            <div key={i} style={{display:'grid',gridTemplateColumns:'180px 1fr',borderTop:`1px solid ${C.border2}`}}>
              <div style={{padding:'7px 12px',fontSize:11,borderRight:`1px solid ${C.border2}`,display:'flex',alignItems:'center',gap:6}}>
                <span>{ts.emoji}</span>{ev.titre.slice(0,22)}
              </div>
              <div style={{display:'grid',gridTemplateColumns:`repeat(${DAYS_NUM.length},1fr)`,padding:'4px 0',alignItems:'center'}}>
                <div style={{gridColumn:`${colStart}/${colEnd}`,background:ev.conflit?C.red:ts.bg,color:ev.conflit?'#fff':ts.c,borderRadius:4,height:18,display:'flex',alignItems:'center',padding:'0 6px',fontSize:9,fontWeight:600,border:ev.conflit?`1px solid ${C.red}`:'none'}}>
                  {ev.resp.split(' ')[0]}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChargeView(){
  return (
    <div style={{padding:'14px 20px',background:C.bg}}>
      <div style={{fontSize:11,color:C.text3,marginBottom:12}}>Charge de travail — semaine 12–25 mai</div>
      <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:14}}>
        {CHARGE_DATA.map((p,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{display:'flex',alignItems:'center',gap:8,width:140,flexShrink:0}}>
              <img src={p.photo} style={{width:24,height:24,borderRadius:'50%'}} alt=""/>
              <span style={{fontSize:12,color:C.text}}>{p.name.split(' ')[0]}</span>
            </div>
            <div style={{flex:1,background:C.border2,borderRadius:4,overflow:'hidden',height:22}}>
              <div style={{width:`${Math.min(p.pct,100)}%`,height:'100%',background:p.surcharge?C.red:p.pct>75?C.orange:C.blue,display:'flex',alignItems:'center',padding:'0 8px',fontSize:10,color:'#fff',fontWeight:600}}>
                {p.pct}% — {p.h}h{p.surcharge?' ⚠️ Surchargé':''}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{fontSize:11,color:C.text3,padding:'8px 12px',background:C.white,border:`1px solid ${C.border}`,borderRadius:6,display:'flex',alignItems:'center',gap:6}}>
        🧠 IA suggère de transférer 1 mission de <b style={{margin:'0 4px'}}>Jean Mbarga</b> → <b style={{margin:'0 4px'}}>Samuel Djomo</b> (40% disponible)
      </div>
    </div>
  );
}

function ListView({events,onAdd}){
  return (
    <div style={{background:C.bg}}>
      <table style={{width:'100%',borderCollapse:'collapse',background:C.white}}>
        <thead>
          <tr style={{background:C.bg}}>
            {['Activité','Type','Responsable','Début','Fin','Statut'].map(h=>(
              <th key={h} style={{textAlign:'left',padding:'9px 14px',fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:.5,borderBottom:`1px solid ${C.border}`}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {events.map((ev,i)=>{
            const ts=TYPE_STYLES[ev.type]||TYPE_STYLES.mission;
            const stStyles={
              'en_cours':{bg:C.blue_l,c:C.blue,l:'En cours'},
              'planifie':{bg:C.orange_l,c:C.orange,l:'Planifié'},
              'termine':{bg:C.green_l,c:C.green,l:'Terminé'},
              'approuve':{bg:C.green_l,c:C.green,l:'Approuvé RH'},
            };
            const st=stStyles[ev.statut]||{bg:C.border2,c:C.text3,l:ev.statut};
            return (
              <tr key={i} style={{borderBottom:`1px solid ${C.border2}`}}
                onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                onMouseLeave={e=>e.currentTarget.style.background=C.white}>
                <td style={{padding:'10px 14px',fontSize:13,fontWeight:500,color:C.text,display:'flex',alignItems:'center',gap:6}}>
                  <span>{ts.emoji}</span>{ev.titre}
                  {ev.conflit&&<span style={{fontSize:11,padding:'1px 6px',borderRadius:8,background:C.red_l,color:C.red}}>⚠️ Conflit</span>}
                </td>
                <td style={{padding:'10px 14px'}}><span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:ts.bg,color:ts.c,fontWeight:500}}>{ts.label}</span></td>
                <td style={{padding:'10px 14px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,fontSize:12}}><img src={ev.photo} style={{width:20,height:20,borderRadius:'50%'}} alt=""/>{ev.resp}</div>
                </td>
                <td style={{padding:'10px 14px',fontSize:12,color:C.text3}}>{ev.debut.split('-').slice(1).reverse().join('/')}</td>
                <td style={{padding:'10px 14px',fontSize:12,color:C.text3}}>{ev.fin.split('-').slice(1).reverse().join('/')}</td>
                <td style={{padding:'10px 14px'}}><span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:st.bg,color:st.c,fontWeight:500}}>{st.l}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Planning(){
  const [view,setView]=useState('cal');
  const [events,setEvents]=useState(SEED_EVENTS);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({titre:'',type:'mission',resp:'',debut:'',fin:'',statut:'planifie'});
  const conflits = events.filter(e=>e.conflit);

  useEffect(()=>{
    getJobs().then(jobs=>{
      if(jobs&&jobs.length>0){
        const newEvs = jobs.slice(0,3).map((j,i)=>({
          id:100+i,titre:j.name||j.site,type:'mission',resp:j.chefProjet||'—',
          photo:'https://i.pravatar.cc/150?img='+(i+10),
          debut:j.startDate?.slice(0,10)||'2025-05-12',
          fin:j.endDate?.slice(0,10)||'2025-05-28',
          statut:j.statut==='En cours'?'en_cours':j.statut==='Terminé'?'termine':'planifie',conflit:false,
        }));
        setEvents(prev=>[...SEED_EVENTS,...newEvs.filter(e=>!SEED_EVENTS.some(s=>s.titre===e.titre))]);
      }
    }).catch(()=>{});
  },[]);

  const addEvent=()=>{
    if(!form.titre||!form.debut) return;
    setEvents(prev=>[...prev,{...form,id:Date.now(),conflit:false,photo:'https://i.pravatar.cc/150?img=30'}]);
    setShowForm(false);
    setForm({titre:'',type:'mission',resp:'',debut:'',fin:'',statut:'planifie'});
  };

  const VIEWS=[{id:'cal',l:'📅 Calendrier'},{id:'gantt',l:'📊 Gantt'},{id:'charge',l:'⚡ Charge'},{id:'list',l:'☰ Liste'}];
  const TYPES=['mission','reunion','formation','conge','jalon'];

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',fontFamily:'inherit'}}>
      <div style={{padding:'11px 20px',borderBottom:`1px solid ${C.border}`,background:C.white,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:15,fontWeight:700,color:C.text}}>Planning</span>
          <span style={{fontSize:11,color:C.text3}}>Mai 2025 — Toutes activités</span>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <div style={{display:'flex',border:`1px solid ${C.border}`,borderRadius:7,overflow:'hidden'}}>
            {VIEWS.map(v=>(
              <button key={v.id} onClick={()=>setView(v.id)} style={{padding:'5px 12px',border:'none',background:view===v.id?C.bg:'transparent',cursor:'pointer',fontSize:11,fontFamily:'inherit',color:view===v.id?C.blue:C.text3,fontWeight:view===v.id?600:400}}>
                {v.l}
              </button>
            ))}
          </div>
          <button onClick={()=>setShowForm(!showForm)} style={{fontSize:12,padding:'6px 14px',borderRadius:6,border:'none',background:C.blue,color:'#fff',cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>+ Planifier</button>
        </div>
      </div>

      <div style={{padding:'8px 20px',borderBottom:`1px solid ${C.border}`,display:'flex',gap:8,alignItems:'center',background:C.white,flexWrap:'wrap',flexShrink:0}}>
        <span style={{fontSize:10,color:C.text3}}>Types :</span>
        {Object.entries(TYPE_STYLES).map(([k,v])=>(
          <span key={k} style={{fontSize:11,padding:'2px 9px',borderRadius:20,background:v.bg,color:v.c,fontWeight:500,cursor:'pointer'}}>{v.emoji} {v.label}</span>
        ))}
        {conflits.length>0&&<span style={{marginLeft:'auto',fontSize:10,padding:'3px 9px',borderRadius:5,background:C.red_l,color:C.red,fontWeight:600,display:'flex',alignItems:'center',gap:4}}>🧠 {conflits.length} conflit{conflits.length>1?'s':''} IA</span>}
      </div>

      {showForm&&(
        <div style={{padding:'12px 20px',background:C.blue_l,borderBottom:`1px solid #B5D4F4`,flexShrink:0}}>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr auto',gap:8,alignItems:'end'}}>
            <div><label style={{fontSize:10,color:C.text3,display:'block',marginBottom:3}}>Titre</label><input value={form.titre} onChange={e=>setForm({...form,titre:e.target.value})} placeholder="Nom de l'activité" style={{width:'100%',padding:'7px 9px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/></div>
            <div><label style={{fontSize:10,color:C.text3,display:'block',marginBottom:3}}>Type</label>
              <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={{width:'100%',padding:'7px 9px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit',outline:'none'}}>
                {TYPES.map(t=><option key={t} value={t}>{TYPE_STYLES[t].emoji} {TYPE_STYLES[t].label}</option>)}
              </select>
            </div>
            <div><label style={{fontSize:10,color:C.text3,display:'block',marginBottom:3}}>Responsable</label><input value={form.resp} onChange={e=>setForm({...form,resp:e.target.value})} placeholder="Nom" style={{width:'100%',padding:'7px 9px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/></div>
            <div><label style={{fontSize:10,color:C.text3,display:'block',marginBottom:3}}>Début</label><input type="date" value={form.debut} onChange={e=>setForm({...form,debut:e.target.value})} style={{width:'100%',padding:'7px 9px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit',outline:'none'}}/></div>
            <div><label style={{fontSize:10,color:C.text3,display:'block',marginBottom:3}}>Fin</label><input type="date" value={form.fin} onChange={e=>setForm({...form,fin:e.target.value})} style={{width:'100%',padding:'7px 9px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit',outline:'none'}}/></div>
            <div style={{display:'flex',gap:6}}>
              <button onClick={addEvent} style={{padding:'7px 14px',borderRadius:6,border:'none',background:C.blue,color:'#fff',fontSize:12,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>Ajouter</button>
              <button onClick={()=>setShowForm(false)} style={{padding:'7px 12px',borderRadius:6,border:`1px solid ${C.border}`,background:'none',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>✕</button>
            </div>
          </div>
        </div>
      )}

      <div style={{flex:1,overflowY:'auto'}}>
        {view==='cal'&&<CalView events={events}/>}
        {view==='gantt'&&<GanttView events={events}/>}
        {view==='charge'&&<ChargeView/>}
        {view==='list'&&<ListView events={events}/>}
      </div>
    </div>
  );
}
