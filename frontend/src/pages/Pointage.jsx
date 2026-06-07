import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const C={
  blue:'#185FA5',blue_l:'#E6F1FB',blue_d:'#0C447C',
  green:'#0F7B3C',green_l:'#E8F5EE',
  orange:'#854F0B',orange_l:'#FAEEDA',
  red:'#A32D2D',red_l:'#FCEBEB',
  purple:'#403294',purple_l:'#F3EEF9',
  text:'#111827',text2:'#374151',text3:'#6B7280',
  border:'#E5E7EB',border2:'#F3F4F6',
  white:'#FFFFFF',bg:'#F9FAFB',
};

const fT=d=>{if(!d)return'—';const dt=new Date(d);return dt.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});};
const fD=d=>d?new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'}):'—';

const getToken=()=>localStorage.getItem('token')||sessionStorage.getItem('token')||'';
const API='https://backend-cleanit-erp.vercel.app';

const apiFetch=async(path)=>{
  const r=await fetch(API+path,{headers:{'Authorization':'Bearer '+getToken()}});
  if(!r.ok) throw new Error(r.status);
  return r.json();
};

const Icon=({d,size=16,color='currentColor',sw=1.8})=>(
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
    {(Array.isArray(d)?d:[d]).map((p,i)=><path key={i} d={p}/>)}
  </svg>
);

const IC={
  dashboard:['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z','M9 22V12h6v10'],
  map:'M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7',
  users:['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2','M23 21v-2a4 4 0 0 0-3-3.87','M16 3.13a4 4 0 0 1 0 7.75'],
  calendar:'M8 6V4m8 2V4m-9 4h10M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z',
  history:'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  alert:['M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z','M12 9v4','M12 17h.01'],
  qr:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h2v2h-2z M18 14h2v2h-2z M14 18h2v2h-2z M18 18h2v2h-2z',
  report:['M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2','M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2','M9 12h6','M9 16h4'],
  gps:['M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z','M12 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'],
  check:'M20 6 9 17l-5-5',
  x:'M18 6 6 18 M6 6l12 12',
  refresh:'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
};

const Av=({initials,size=32,color=C.blue})=>(
  <div style={{width:size,height:size,borderRadius:'50%',background:color+'18',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.35,fontWeight:500,color,flexShrink:0}}>
    {(initials||'?').slice(0,2).toUpperCase()}
  </div>
);

const Badge=({label,color,bg})=>(
  <span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:bg||color+'15',color,fontWeight:500,whiteSpace:'nowrap'}}>{label}</span>
);

const KPI=({label,value,sub,color,icon})=>(
  <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 14px',borderTop:`2px solid ${color}`}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
      <div style={{fontSize:11,color:C.text3,fontWeight:500}}>{label}</div>
      <Icon d={icon} size={14} color={color}/>
    </div>
    <div style={{fontSize:20,fontWeight:600,color,marginBottom:2}}>{value}</div>
    {sub&&<div style={{fontSize:10,color:C.text3}}>{sub}</div>}
  </div>
);

const Spinner=()=>(
  <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:40}}>
    <div style={{width:28,height:28,border:`3px solid ${C.blue_l}`,borderTopColor:C.blue,borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const NAV_ITEMS=[
  {id:'',l:'Dashboard',icon:IC.dashboard,url:'/pointage'},
  {id:'employes',l:'Équipe',icon:IC.users,url:'/pointage/employes'},
  {id:'historique',l:'Historique',icon:IC.history,url:'/pointage/historique'},
  {id:'alertes',l:'Alertes',icon:IC.alert,url:'/pointage/alertes'},
  {id:'rapports',l:'Rapports',icon:IC.report,url:'/pointage/rapports'},
];

function PointageNav({alertCount}){
  const navigate=useNavigate();
  const loc=useLocation();
  const seg=loc.pathname.split('/')[2]||'';
  return (
    <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',padding:'0 20px',flexShrink:0,overflowX:'auto'}}>
      {NAV_ITEMS.map(item=>{
        const active=seg===item.id;
        return (
          <button key={item.id} onClick={()=>navigate(item.url)}
            style={{padding:'10px 14px',border:'none',background:'none',cursor:'pointer',fontSize:12,fontFamily:'inherit',color:active?C.blue:C.text3,fontWeight:active?600:400,borderBottom:active?`2px solid ${C.blue}`:'2px solid transparent',marginBottom:-1,display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap',position:'relative'}}>
            <Icon d={item.icon} size={14} color={active?C.blue:C.text3}/>
            {item.l}
            {item.id==='alertes'&&alertCount>0&&<span style={{position:'absolute',top:6,right:4,fontSize:9,padding:'1px 4px',borderRadius:8,background:C.red,color:C.white,fontWeight:700}}>{alertCount}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ===== DASHBOARD =====
function Dashboard(){
  const [pointages,setPointages]=useState([]);
  const [users,setUsers]=useState([]);
  const [missions,setMissions]=useState([]);
  const [loading,setLoading]=useState(true);
  const [lastUpdate,setLastUpdate]=useState(null);

  const load=useCallback(async()=>{
    try{
      const [p,u,m]=await Promise.all([
        apiFetch('/pointages/all').catch(()=>[]),
        apiFetch('/users').catch(()=>[]),
        apiFetch('/missions').catch(()=>[]),
      ]);
      if(Array.isArray(p))setPointages(p);
      if(Array.isArray(u))setUsers(u);
      if(Array.isArray(m))setMissions(m);
      setLastUpdate(new Date());
    }catch(e){console.error(e);}
    finally{setLoading(false);}
  },[]);

  useEffect(()=>{load();const iv=setInterval(load,30000);return()=>clearInterval(iv);},[load]);

  if(loading)return <Spinner/>;

  const today=new Date();today.setHours(0,0,0,0);
  const todayPtgs=pointages.filter(p=>new Date(p.created_at)>=today);

  const bureau=users.filter(u=>!['technician','terrain'].includes(u.role));
  const terrain=users.filter(u=>['technician','terrain'].includes(u.role));

  const presentBureau=bureau.filter(u=>todayPtgs.some(p=>p.user_id===u.id));
  const missionsActives=missions.filter(m=>m.status==='in_progress');

  // Alertes calculées depuis pointages
  const alertes=[];
  terrain.forEach(u=>{
    const lastPtg=todayPtgs.filter(p=>p.user_id===u.id).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))[0];
    if(!lastPtg){
      const m=missions.find(ms=>ms.tech_id===u.id&&ms.status==='in_progress');
      if(m)alertes.push({id:'abs-'+u.id,type:'absence',message:`${u.firstName} ${u.lastName} — Mission sans pointage`,severite:'medium'});
    }
  });

  const getAv=(u)=>((u.firstName||'')[0]+(u.lastName||'')[0]).toUpperCase();
  const roleColor=(role)=>role==='admin'?C.red:role==='project_manager'?C.purple:role==='hr'?C.green:C.orange;

  return (
    <div style={{padding:'14px 20px',display:'flex',flexDirection:'column',gap:14}}>
      {lastUpdate&&(
        <div style={{fontSize:10,color:C.text3,textAlign:'right'}}>
          Mis à jour: {fT(lastUpdate)} · Auto-refresh 30s
        </div>
      )}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
        <KPI label="Bureau présents" value={`${presentBureau.length}/${bureau.length}`} sub="Aujourd'hui" color={C.blue} icon={IC.users}/>
        <KPI label="Terrain actifs" value={terrain.length} sub="Employés terrain" color={C.green} icon={IC.gps}/>
        <KPI label="Missions en cours" value={missionsActives.length} sub="Actives" color={C.orange} icon={IC.calendar}/>
        <KPI label="Pointages aujourd'hui" value={todayPtgs.length} sub="Total scans" color={C.purple} icon={IC.check}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        {/* Bureau */}
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden'}}>
          <div style={{padding:'10px 14px',borderBottom:`1px solid ${C.border2}`,display:'flex',alignItems:'center',gap:7}}>
            <Icon d={IC.qr} size={14} color={C.blue}/>
            <span style={{fontSize:13,fontWeight:600}}>Employés Bureau — Pointage QR</span>
          </div>
          {bureau.length===0&&<div style={{padding:20,color:C.text3,fontSize:12,textAlign:'center'}}>Aucun employé bureau</div>}
          {bureau.map(u=>{
            const ptg=todayPtgs.filter(p=>p.user_id===u.id).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))[0];
            const present=!!ptg;
            return (
              <div key={u.id} style={{padding:'9px 14px',borderBottom:`1px solid ${C.border2}`,display:'flex',alignItems:'center',gap:10}}>
                <Av initials={getAv(u)} size={30} color={present?C.green:C.text3}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.firstName} {u.lastName}</div>
                  <div style={{fontSize:10,color:C.text3}}>{u.role}</div>
                </div>
                {present
                  ?<Badge label={`✓ ${fT(ptg.created_at)}`} color={C.green}/>
                  :<Badge label="Absent" color={C.text3} bg={C.border2}/>}
              </div>
            );
          })}
        </div>

        {/* Terrain */}
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden'}}>
          <div style={{padding:'10px 14px',borderBottom:`1px solid ${C.border2}`,display:'flex',alignItems:'center',gap:7}}>
            <Icon d={IC.gps} size={14} color={C.orange}/>
            <span style={{fontSize:13,fontWeight:600}}>Techniciens Terrain</span>
          </div>
          {terrain.length===0&&<div style={{padding:20,color:C.text3,fontSize:12,textAlign:'center'}}>Aucun technicien terrain</div>}
          {terrain.map(u=>{
            const ptg=todayPtgs.filter(p=>p.user_id===u.id).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))[0];
            const mission=missions.find(m=>m.tech_id===u.id&&m.status==='in_progress');
            return (
              <div key={u.id} style={{padding:'9px 14px',borderBottom:`1px solid ${C.border2}`,display:'flex',alignItems:'center',gap:10}}>
                <Av initials={getAv(u)} size={30} color={C.orange}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.firstName} {u.lastName}</div>
                  <div style={{fontSize:10,color:C.text3}}>{mission?mission.site||'En mission':'Hors mission'}</div>
                </div>
                <Badge label={ptg?`✓ ${fT(ptg.created_at)}`:'Pas pointé'} color={ptg?C.green:C.text3} bg={ptg?C.green_l:C.border2}/>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alertes */}
      {alertes.length>0&&(
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden'}}>
          <div style={{padding:'10px 14px',borderBottom:`1px solid ${C.border2}`,display:'flex',alignItems:'center',gap:7}}>
            <Icon d={IC.alert} size={14} color={C.red}/>
            <span style={{fontSize:13,fontWeight:600}}>Alertes actives</span>
            <Badge label={alertes.length+' ouvertes'} color={C.red}/>
          </div>
          {alertes.map(al=>(
            <div key={al.id} style={{padding:'10px 14px',borderBottom:`1px solid ${C.border2}`,display:'flex',alignItems:'center',gap:10}}>
              <Icon d={IC.alert} size={15} color={C.orange}/>
              <div style={{flex:1,fontSize:12,color:C.text}}>{al.message}</div>
              <Badge label={al.severite} color={C.orange}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== ÉQUIPE =====
function Equipe(){
  const [users,setUsers]=useState([]);
  const [pointages,setPointages]=useState([]);
  const [loading,setLoading]=useState(true);
  const [section,setSection]=useState('bureau');

  useEffect(()=>{
    Promise.all([apiFetch('/users').catch(()=>[]),apiFetch('/pointages/all').catch(()=>[])])
      .then(([u,p])=>{
        if(Array.isArray(u))setUsers(u);
        if(Array.isArray(p))setPointages(p);
      }).finally(()=>setLoading(false));
  },[]);

  if(loading)return <Spinner/>;

  const today=new Date();today.setHours(0,0,0,0);
  const todayPtgs=pointages.filter(p=>new Date(p.created_at)>=today);
  const bureau=users.filter(u=>!['technician','terrain'].includes(u.role));
  const terrain=users.filter(u=>['technician','terrain'].includes(u.role));
  const getAv=(u)=>((u.firstName||'')[0]+(u.lastName||'')[0]).toUpperCase();

  return (
    <div style={{flex:1,overflow:'auto',padding:'14px 20px'}}>
      <div style={{display:'flex',border:`1px solid ${C.border}`,borderRadius:8,overflow:'hidden',marginBottom:14,alignSelf:'flex-start',width:'fit-content'}}>
        <button onClick={()=>setSection('bureau')} style={{padding:'7px 18px',border:'none',background:section==='bureau'?C.bg:'transparent',cursor:'pointer',fontSize:12,fontFamily:'inherit',color:section==='bureau'?C.blue:C.text3,fontWeight:section==='bureau'?600:400,display:'flex',alignItems:'center',gap:6}}>
          <Icon d={IC.qr} size={13} color={section==='bureau'?C.blue:C.text3}/>Bureau — QR Code
        </button>
        <button onClick={()=>setSection('terrain')} style={{padding:'7px 18px',border:'none',background:section==='terrain'?C.bg:'transparent',cursor:'pointer',fontSize:12,fontFamily:'inherit',color:section==='terrain'?C.orange:C.text3,fontWeight:section==='terrain'?600:400,display:'flex',alignItems:'center',gap:6}}>
          <Icon d={IC.gps} size={13} color={section==='terrain'?C.orange:C.text3}/>Terrain — GPS Passif
        </button>
      </div>

      {section==='bureau'&&(
        <>
          <div style={{padding:'9px 12px',background:C.blue_l,borderRadius:8,border:`1px solid #B5D4F4`,fontSize:12,color:C.blue_d,marginBottom:12,display:'flex',alignItems:'center',gap:7}}>
            <Icon d={IC.qr} size={14} color={C.blue_d}/>
            Les employés de bureau utilisent leur QR code personnel pour pointer à l'entrée et à la sortie des bureaux.
          </div>
          {bureau.length===0&&<div style={{padding:40,textAlign:'center',color:C.text3}}>Aucun employé bureau en base</div>}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:10}}>
            {bureau.map(u=>{
              const ptg=todayPtgs.filter(p=>p.user_id===u.id).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))[0];
              const present=!!ptg;
              const qrCode=`QR-${(u.firstName||'X')[0]}${(u.lastName||'X')[0]}-${u.id}`;
              return (
                <div key={u.id} style={{background:C.white,border:`1px solid ${present?C.green:C.border}`,borderRadius:10,padding:'14px',display:'flex',flexDirection:'column',gap:10}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <Av initials={getAv(u)} size={38} color={present?C.green:C.blue}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600}}>{u.firstName} {u.lastName}</div>
                      <div style={{fontSize:11,color:C.text3}}>{u.role}</div>
                    </div>
                    <Badge label={present?`✓ ${fT(ptg.created_at)}`:'Absent'} color={present?C.green:C.text3} bg={present?C.green_l:C.border2}/>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:8,borderTop:`1px solid ${C.border2}`}}>
                    <div style={{fontSize:10,color:C.text3,fontFamily:'monospace'}}>{qrCode}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {section==='terrain'&&(
        <>
          <div style={{padding:'9px 12px',background:C.orange_l,borderRadius:8,border:`1px solid #FAC775`,fontSize:12,color:C.orange,marginBottom:12,display:'flex',alignItems:'center',gap:7}}>
            <Icon d={IC.gps} size={14} color={C.orange}/>
            Tracking via QR Code — Les techniciens scannent le QR de leur site pour pointer.
          </div>
          {terrain.length===0&&<div style={{padding:40,textAlign:'center',color:C.text3}}>Aucun technicien terrain en base</div>}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:10}}>
            {terrain.map(u=>{
              const ptg=todayPtgs.filter(p=>p.user_id===u.id).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))[0];
              return (
                <div key={u.id} style={{background:C.white,border:`1px solid ${ptg?C.green:C.border}`,borderRadius:10,padding:'14px',display:'flex',flexDirection:'column',gap:10}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <Av initials={getAv(u)} size={38} color={C.orange}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600}}>{u.firstName} {u.lastName}</div>
                      <div style={{fontSize:11,color:C.text3}}>{u.email}</div>
                    </div>
                    <Badge label={ptg?`✓ ${fT(ptg.created_at)}`:'Pas pointé'} color={ptg?C.green:C.text3} bg={ptg?C.green_l:C.border2}/>
                  </div>
                  {ptg&&(
                    <div style={{padding:'7px 9px',background:C.bg,borderRadius:6,border:`1px solid ${C.border}`,fontSize:11}}>
                      <div style={{fontWeight:500,marginBottom:2}}>{ptg.site_name||ptg.site_code||'—'}</div>
                      <div style={{color:C.text3}}>{fT(ptg.created_at)} · {ptg.type}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ===== HISTORIQUE =====
function Historique(){
  const [pointages,setPointages]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    apiFetch('/pointages/all').then(d=>{if(Array.isArray(d))setPointages(d);}).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  if(loading)return <Spinner/>;

  return (
    <div style={{padding:'14px 20px'}}>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden'}}>
        <div style={{padding:'10px 14px',borderBottom:`1px solid ${C.border2}`,fontSize:13,fontWeight:600}}>
          Historique des pointages — {pointages.length} enregistrements
        </div>
        {pointages.length===0&&<div style={{padding:40,textAlign:'center',color:C.text3}}>Aucun pointage enregistré</div>}
        {pointages.length>0&&(
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:C.bg}}>
              {['Employé','Zone','Méthode','Heure','Distance','Statut'].map(h=><th key={h} style={{textAlign:'left',padding:'8px 14px',fontSize:10,fontWeight:600,color:C.text3,textTransform:'uppercase',letterSpacing:.4,borderBottom:`1px solid ${C.border}`}}>{h}</th>)}
            </tr></thead>
            <tbody>{[...pointages].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).map((p,i)=>(
              <tr key={p.id||i} onMouseEnter={e=>e.currentTarget.style.background=C.bg} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{padding:'10px 14px',borderBottom:`1px solid ${C.border2}`}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <Av initials={(p.user_name||'?').split(' ').map(n=>n[0]).join('').slice(0,2)} size={28}/>
                    <div style={{fontSize:12,fontWeight:500}}>{p.user_name||'ID '+p.user_id}</div>
                  </div>
                </td>
                <td style={{padding:'10px 14px',fontSize:12,color:C.text3,borderBottom:`1px solid ${C.border2}`}}>{p.site_name||p.site_code||'—'}</td>
                <td style={{padding:'10px 14px',borderBottom:`1px solid ${C.border2}`}}>
                  <div style={{display:'flex',alignItems:'center',gap:5}}>
                    <Icon d={IC.qr} size={12} color={C.blue}/>
                    <span style={{fontSize:11,color:C.blue,fontWeight:500}}>QR Code</span>
                  </div>
                </td>
                <td style={{padding:'10px 14px',fontSize:12,fontWeight:500,borderBottom:`1px solid ${C.border2}`}}>
                  {fD(p.created_at)} {fT(p.created_at)}
                </td>
                <td style={{padding:'10px 14px',fontSize:12,borderBottom:`1px solid ${C.border2}`,color:p.hors_zone?C.red:C.text3}}>
                  {p.distance_m!=null ? p.distance_m+'m' : '—'}
                </td>
                <td style={{padding:'10px 14px',borderBottom:`1px solid ${C.border2}`}}>
                  {p.valide!==false ? <Badge label="Valide ✓" color={C.green}/> : <Badge label="Hors zone ✗" color={C.red}/>}
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ===== ALERTES =====
function Alertes(){
  const [users,setUsers]=useState([]);
  const [missions,setMissions]=useState([]);
  const [pointages,setPointages]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    Promise.all([apiFetch('/users').catch(()=>[]),apiFetch('/missions').catch(()=>[]),apiFetch('/pointages/all').catch(()=>[])])
      .then(([u,m,p])=>{
        if(Array.isArray(u))setUsers(u);
        if(Array.isArray(m))setMissions(m);
        if(Array.isArray(p))setPointages(p);
      }).finally(()=>setLoading(false));
  },[]);

  if(loading)return <Spinner/>;

  const today=new Date();today.setHours(0,0,0,0);
  const todayPtgs=pointages.filter(p=>new Date(p.created_at)>=today);
  const terrain=users.filter(u=>['technician','terrain'].includes(u.role));

  const alertes=[];
  terrain.forEach(u=>{
    const ptg=todayPtgs.find(p=>p.user_id===u.id);
    const mission=missions.find(m=>m.tech_id===u.id&&m.status==='in_progress');
    if(mission&&!ptg){
      alertes.push({id:'abs-'+u.id,type:'absence',message:`${u.firstName} ${u.lastName} — En mission sans pointage aujourd'hui`,severite:'medium',zone:mission.site||'—'});
    }
  });

  return (
    <div style={{padding:'14px 20px',display:'flex',flexDirection:'column',gap:8}}>
      {alertes.length===0&&(
        <div style={{padding:40,textAlign:'center',color:C.green,background:C.green_l,borderRadius:10,border:`1px solid ${C.green}`}}>
          <Icon d={IC.check} size={24} color={C.green}/>
          <div style={{marginTop:8,fontSize:13,fontWeight:600}}>Aucune alerte active</div>
          <div style={{fontSize:11,marginTop:4}}>Tous les techniciens en mission ont pointé</div>
        </div>
      )}
      {alertes.map(al=>(
        <div key={al.id} style={{background:C.white,border:`1px solid ${C.orange}`,borderRadius:10,padding:'12px 14px',display:'flex',alignItems:'center',gap:12}}>
          <Icon d={IC.alert} size={18} color={C.orange}/>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:500,color:C.text,marginBottom:3}}>{al.message}</div>
            <div style={{fontSize:11,color:C.text3}}>Zone: {al.zone}</div>
          </div>
          <Badge label={al.severite} color={C.orange}/>
        </div>
      ))}
    </div>
  );
}

// ===== RAPPORTS =====
function Rapports(){
  const [pointages,setPointages]=useState([]);
  useEffect(()=>{apiFetch('/pointages/all').then(d=>{if(Array.isArray(d))setPointages(d);}).catch(()=>{});},[]);

  const exportCSV=()=>{
    const rows=[['ID','Employé','Site','Type','Date','Heure','GPS Lat','GPS Lng']];
    pointages.forEach(p=>{
      const dt=new Date(p.created_at);
      rows.push([p.id,p.user_name||p.user_id,p.site_name||p.site_code||'—',p.type,fD(p.created_at),fT(p.created_at),p.gps_lat||'',p.gps_lng||'']);
    });
    const csv=rows.map(r=>r.join(',')).join('\n');
    const a=document.createElement('a');
    a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
    a.download='cleanit-pointages-'+new Date().toISOString().slice(0,10)+'.csv';
    a.click();
  };

  return (
    <div style={{padding:'14px 20px'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
        {[
          ['Rapport présence bureau','Pointages QR du mois',C.blue,'qr'],
          ['Rapport terrain','Historique pointages terrain',C.orange,'terrain'],
          ['Rapport absences','Techniciens sans pointage',C.red,'absence'],
          ['Rapport heures travaillées','Total heures par employé',C.green,'heures'],
          ['Export global CSV','Tous les pointages — '+pointages.length+' enregistrements',C.text3,'csv'],
        ].map(([l,s,c,type])=>(
          <div key={l} onClick={type==='csv'?exportCSV:undefined}
            style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px',cursor:'pointer',borderLeft:`3px solid ${c}`}}
            onMouseEnter={e=>e.currentTarget.style.background=C.bg} onMouseLeave={e=>e.currentTarget.style.background=C.white}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
              <Icon d={IC.report} size={16} color={c}/>
              <span style={{fontSize:10,padding:'2px 7px',borderRadius:20,background:c+'15',color:c,fontWeight:500}}>{type==='csv'?'Exporter':'Générer'}</span>
            </div>
            <div style={{fontSize:13,fontWeight:600,marginBottom:3}}>{l}</div>
            <div style={{fontSize:11,color:C.text3}}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== PAGE PRINCIPALE =====
export default function Pointage(){
  const [alertCount,setAlertCount]=useState(0);
  const loc=useLocation();

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:C.bg,fontFamily:'inherit'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{padding:'10px 20px',borderBottom:`1px solid ${C.border}`,background:C.white,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <span style={{fontSize:15,fontWeight:600,color:C.text}}>Pointage & Présence</span>
          <div style={{fontSize:11,color:C.text3,marginTop:1}}>Bureau: QR Code · Terrain: GPS · Données en temps réel</div>
        </div>
        <div style={{fontSize:11,color:C.green,display:'flex',alignItems:'center',gap:4,padding:'4px 10px',background:C.green_l,borderRadius:20}}>
          <div style={{width:6,height:6,borderRadius:'50%',background:C.green}}/>Tracking actif
        </div>
      </div>
      <PointageNav alertCount={alertCount}/>
      <div style={{flex:1,overflow:'auto'}}>
        {(()=>{
          const seg=loc.pathname.split('/')[2]||'';
          if(seg==='employes'||seg==='equipe'||seg==='qrcodes') return <Equipe/>;
          if(seg==='historique') return <Historique/>;
          if(seg==='alertes') return <Alertes/>;
          if(seg==='rapports') return <Rapports/>;
          return <Dashboard/>;
        })()}
      </div>
    </div>
  );
}
