import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';

// ═══════════════════════════════════════════════════════════
//  CLEANIT — POINTAGE & PRÉSENCE
//  Bureau: QR Code | Terrain: GPS Géofencing passif
// ═══════════════════════════════════════════════════════════

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

const fT=d=>{const dt=new Date(d);return dt.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});};
const fD=d=>d?new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'}):'—';

// SVG Icons — AUCUN EMOJI
const Icon=({d,size=16,color='currentColor',sw=1.8})=>(
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
    {(Array.isArray(d)?d:[d]).map((p,i)=><path key={i} d={p}/>)}
  </svg>
);
const IC={
  dashboard:['M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z','M9 22V12h6v10'],
  map:'M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7',
  users:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  calendar:'M8 6V4m8 2V4m-9 4h10M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z',
  history:'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  alert:'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
  qr:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h2v2h-2z M18 14h2v2h-2z M14 18h2v2h-2z M18 18h2v2h-2z',
  report:'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2 M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2 M9 12h6 M9 16h4',
  gps:'M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z M12 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  shield:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  phone:'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  check:'M20 6 9 17l-5-5',
  x:'M18 6 6 18 M6 6l12 12',
  camera:'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 0 2-2l2-2h10l2 2h2a2 2 0 0 1 2 2v11z M12 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  wifi:'M5 12.55a11 11 0 0 1 14.08 0 M1.42 9a16 16 0 0 1 21.16 0 M8.53 16.11a6 6 0 0 1 6.95 0 M12 20h.01',
  finger:'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M8 12a4 4 0 0 1 8 0v1a3 3 0 0 1-6 0',
  battery:'M17 7H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M22 11v2',
  task:'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2 M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2 M9 12l2 2 4-4',
  send:'M22 2 11 13 M22 2l-7 20-4-9-9-4 20-7z',
};

// Données zones
const ZONES={
  bureau_dla:{lat:4.0511,lng:9.7085,rayon:150,nom:'Bureau Principal — Douala',type:'bureau'},
  bureau_yde:{lat:3.8480,lng:11.5021,rayon:150,nom:'Bureau Yaoundé',type:'bureau'},
  'DLA-001':{lat:4.0650,lng:9.7300,rayon:500,nom:'Site DLA-001 — Bassa',type:'terrain'},
  'DLA-002':{lat:4.0400,lng:9.7100,rayon:500,nom:'Site DLA-002 — Bonabéri',type:'terrain'},
  'YDE-001':{lat:3.8800,lng:11.5100,rayon:500,nom:'Site YDE-001 — Yaoundé Centre',type:'terrain'},
  'GAR-001':{lat:9.3000,lng:13.3900,rayon:800,nom:'Site GAR-001 — Garoua',type:'terrain'},
  'LIM-001':{lat:4.0100,lng:9.1900,rayon:800,nom:'Site LIM-001 — Limbé',type:'terrain'},
};

// Employés bureau (QR code check-in)
const BUREAU=[
  {id:'EI-001',nom:'Marie Kamga',poste:'Chef de Projet Senior',dept:'Operations',zone:'bureau_dla',qr:'QR-INT-MK-2024',avatar:'MK',photo:'https://i.pravatar.cc/150?img=47',email:'m.kamga@cleanit.cm',tel:'+237 677 001 001'},
  {id:'EI-002',nom:'Jean Fouda',poste:'Project Manager',dept:'Operations',zone:'bureau_dla',qr:'QR-INT-JF-2024',avatar:'JF',photo:'https://i.pravatar.cc/150?img=12',email:'j.fouda@cleanit.cm',tel:'+237 677 002 002'},
  {id:'EI-003',nom:'Alice Finance',poste:'Dir. Financière',dept:'Finance',zone:'bureau_dla',qr:'QR-INT-AF-2024',avatar:'AF',photo:'https://i.pravatar.cc/150?img=9',email:'a.finance@cleanit.cm',tel:'+237 677 003 003'},
  {id:'EI-004',nom:'Bob Comptable',poste:'Chef Comptable',dept:'Finance',zone:'bureau_dla',qr:'QR-INT-BC-2024',avatar:'BC',photo:'https://i.pravatar.cc/150?img=11',email:'b.comptable@cleanit.cm',tel:'+237 677 004 004'},
  {id:'EI-005',nom:'Aline Biya',poste:'Responsable RH',dept:'RH',zone:'bureau_dla',qr:'QR-INT-AB-2024',avatar:'AB',photo:'https://i.pravatar.cc/150?img=5',email:'a.biya@cleanit.cm',tel:'+237 677 006 006'},
  {id:'EI-006',nom:'Jérôme Bell',poste:'Directeur Général',dept:'Direction',zone:'bureau_dla',qr:'QR-INT-JB-2024',avatar:'JB',photo:'https://i.pravatar.cc/150?img=8',email:'jerome@cleanit.cm',tel:'+237 677 000 001'},
];

// Techniciens terrain (GPS passif — PAS de QR code)
const TERRAIN=[
  {id:'EX-001',nom:'Thomas Ngono',poste:'Technicien Réseau',avatar:'TN',photo:'https://i.pravatar.cc/150?img=15',email:'t.ngono@cleanit.cm',tel:'+237 677 010 001',competences:['5G','4G LTE','Installation'],ip:'196.207.45.12',device:'Samsung Galaxy A54',lat:4.0648,lng:9.7298,batterie:87,signal:'4G'},
  {id:'EX-002',nom:'Samuel Djomo',poste:'Technicien Réseau',avatar:'SD',photo:'https://i.pravatar.cc/150?img=22',email:'s.djomo@cleanit.cm',tel:'+237 677 010 002',competences:['Fibre','4G','Maintenance'],ip:'196.207.46.33',device:'Tecno Camon 19',lat:4.0402,lng:9.7098,batterie:62,signal:'4G'},
  {id:'EX-003',nom:'Jean Mbarga',poste:'Technicien Senior',avatar:'JM',photo:'https://i.pravatar.cc/150?img=3',email:'j.mbarga@cleanit.cm',tel:'+237 677 010 003',competences:['5G','Survey RF'],ip:'154.68.45.78',device:'iPhone 13',lat:3.8798,lng:11.5098,batterie:94,signal:'5G'},
  {id:'EX-004',nom:'Ali Moussa',poste:'Technicien HSE',avatar:'AM',photo:'https://i.pravatar.cc/150?img=33',email:'a.moussa@cleanit.cm',tel:'+237 677 010 004',competences:['HSE','Sécurité','Pylône'],ip:'154.68.46.22',device:'Samsung A35',lat:9.3650,lng:13.4200,batterie:23,signal:'3G'},
  {id:'EX-005',nom:'Rémi Atangana',poste:'Technicien Fibre',avatar:'RA',photo:'https://i.pravatar.cc/150?img=7',email:'r.atangana@cleanit.cm',tel:'+237 677 010 005',competences:['Fibre Optique','Soudure'],ip:'196.207.48.91',device:'Itel P55',lat:4.0098,lng:9.1898,batterie:71,signal:'4G'},
];

// Historique pointages
const HISTORIQUE=[
  {id:'h1',userId:'EI-001',type:'entree',zone:'bureau_dla',horsZone:false,dist:12,heure:new Date(Date.now()-25200000).toISOString(),valide:true,methode:'qr'},
  {id:'h2',userId:'EX-001',type:'entree',zone:'DLA-001',horsZone:false,dist:45,heure:new Date(Date.now()-14400000).toISOString(),valide:true,methode:'gps',photo:true},
  {id:'h3',userId:'EX-004',type:'entree',zone:'GAR-001',horsZone:true,dist:650,heure:new Date(Date.now()-7200000).toISOString(),valide:false,methode:'gps',photo:true},
  {id:'h4',userId:'EI-003',type:'sortie',zone:'bureau_dla',horsZone:false,dist:5,heure:new Date(Date.now()-3600000).toISOString(),valide:true,methode:'qr'},
  {id:'h5',userId:'EX-002',type:'entree',zone:'DLA-002',horsZone:false,dist:88,heure:new Date(Date.now()-10800000).toISOString(),valide:true,methode:'gps',photo:true},
  {id:'h6',userId:'EI-002',type:'entree',zone:'bureau_dla',horsZone:false,dist:8,heure:new Date(Date.now()-21600000).toISOString(),valide:true,methode:'qr'},
  {id:'h7',userId:'EX-003',type:'entree',zone:'YDE-001',horsZone:false,dist:120,heure:new Date(Date.now()-18000000).toISOString(),valide:true,methode:'gps',photo:true},
];

// Missions (Planning sync)
const MISSIONS=[
  {id:'SH-001',jobId:'JOB-001',jobName:'Installation 5G NR — DLA-001',techId:'EX-001',techNom:'Thomas Ngono',pmId:'EI-001',pmNom:'Marie Kamga',zone:'DLA-001',dateDebut:'2024-05-07',dateFin:'2024-05-09',hStart:'07:00',hEnd:'17:00',statut:'in_progress',priorite:'haute',valide_pm:true},
  {id:'SH-002',jobId:'JOB-002',jobName:'Maintenance 4G LTE — YDE-001',techId:'EX-003',techNom:'Jean Mbarga',pmId:'EI-002',pmNom:'Jean Fouda',zone:'YDE-001',dateDebut:'2024-05-07',dateFin:'2024-05-07',hStart:'08:00',hEnd:'16:00',statut:'in_progress',priorite:'normale',valide_pm:true},
  {id:'SH-003',jobId:'JOB-003',jobName:'Inspection Pylône — GAR-001',techId:'EX-004',techNom:'Ali Moussa',pmId:'EI-001',pmNom:'Marie Kamga',zone:'GAR-001',dateDebut:'2024-05-07',dateFin:'2024-05-10',hStart:'07:00',hEnd:'18:00',statut:'alerte_absence',priorite:'critique',valide_pm:true},
  {id:'SH-004',jobId:'JOB-004',jobName:'Fibre Optique — LIM-001',techId:'EX-005',techNom:'Rémi Atangana',pmId:'EI-002',pmNom:'Jean Fouda',zone:'LIM-001',dateDebut:'2024-05-08',dateFin:'2024-05-12',hStart:'07:00',hEnd:'17:00',statut:'assigned',priorite:'haute',valide_pm:false},
  {id:'SH-005',jobId:'JOB-005',jobName:'Config BBU — DLA-002',techId:'EX-002',techNom:'Samuel Djomo',pmId:'EI-001',pmNom:'Marie Kamga',zone:'DLA-002',dateDebut:'2024-05-06',dateFin:'2024-05-06',hStart:'08:00',hEnd:'16:00',statut:'completed',priorite:'normale',valide_pm:true},
];

const ALERTES=[
  {id:'AL-001',type:'hors_zone',userId:'EX-004',severite:'critical',statut:'open',heure:new Date(Date.now()-7200000).toISOString(),zone:'GAR-001',message:'Ali Moussa hors périmètre GAR-001 — 650m du site'},
  {id:'AL-002',type:'batterie',userId:'EX-004',severite:'high',statut:'open',heure:new Date(Date.now()-3600000).toISOString(),zone:'GAR-001',message:'Batterie critique 23% — Ali Moussa · Garoua'},
  {id:'AL-003',type:'absence',userId:'EX-005',severite:'medium',statut:'acknowledged',heure:new Date(Date.now()-86400000).toISOString(),zone:'LIM-001',message:'Rémi Atangana — Mission SH-004 sans pointage GPS depuis 2h'},
  {id:'AL-004',type:'hors_zone',userId:'EX-001',severite:'low',statut:'resolved',heure:new Date(Date.now()-172800000).toISOString(),zone:'DLA-001',message:'Thomas Ngono hors zone momentané — résolu automatiquement'},
];

// Calculer distance GPS
function distGPS(lat1,lng1,lat2,lng2){
  const R=6371000;const dLat=(lat2-lat1)*Math.PI/180;const dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)));
}

// Statut technicien terrain
function statutTerrain(tech){
  const mission=MISSIONS.find(m=>m.techId===tech.id&&['in_progress','alerte_absence'].includes(m.statut));
  if(!mission) return {label:'Hors mission',color:C.text3,bg:C.border2};
  const zone=ZONES[mission.zone];
  if(!zone) return {label:'En mission',color:C.blue,bg:C.blue_l};
  const dist=distGPS(tech.lat,tech.lng,zone.lat,zone.lng);
  if(dist<=zone.rayon) return {label:'Sur site ✓',color:C.green,bg:C.green_l,dist};
  return {label:'Hors zone ⚠',color:C.red,bg:C.red_l,dist};
}

// Composants UI
const Av=({initials,size=32,color=C.blue,photo=null})=>(
  photo
    ?<img src={photo} alt={initials} style={{width:size,height:size,borderRadius:'50%',objectFit:'cover',flexShrink:0}} onError={e=>{e.target.style.display='none';}}/>
    :<div style={{width:size,height:size,borderRadius:'50%',background:color+'18',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.35,fontWeight:500,color,flexShrink:0}}>{initials}</div>
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

// NAV avec icônes SVG
const NAV_ITEMS=[
  {id:'',l:'Dashboard',icon:IC.dashboard,url:'/pointage'},
  {id:'map',l:'Carte Live',icon:IC.map,url:'/pointage/map'},
  {id:'equipe',l:'Équipe',icon:IC.users,url:'/pointage/equipe'},
  {id:'planning',l:'Missions',icon:IC.calendar,url:'/pointage/planning'},
  {id:'historique',l:'Historique',icon:IC.history,url:'/pointage/historique'},
  {id:'alertes',l:'Alertes',icon:IC.alert,url:'/pointage/alertes'},
  {id:'rapports',l:'Rapports',icon:IC.report,url:'/pointage/rapports'},
];

function PointageNav(){
  const navigate=useNavigate();
  const loc=useLocation();
  const alertCount=ALERTES.filter(a=>a.statut==='open').length;
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
  const presentBureau=BUREAU.filter(e=>HISTORIQUE.some(h=>h.userId===e.id&&h.type==='entree'&&h.valide&&new Date(h.heure)>new Date(Date.now()-86400000)));
  const presentTerrain=TERRAIN.filter(t=>{const st=statutTerrain(t);return st.label.includes('✓');});
  const alertsOpen=ALERTES.filter(a=>a.statut==='open');
  const missionsActives=MISSIONS.filter(m=>m.statut==='in_progress');

  return (
    <div style={{padding:'14px 20px',display:'flex',flexDirection:'column',gap:14}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
        <KPI label="Bureau présents" value={`${presentBureau.length}/${BUREAU.length}`} sub="Aujourd'hui" color={C.blue} icon={IC.users}/>
        <KPI label="Terrain actifs" value={`${presentTerrain.length}/${TERRAIN.length}`} sub="GPS confirmé" color={C.green} icon={IC.gps}/>
        <KPI label="Missions en cours" value={missionsActives.length} sub="Planning synchronisé" color={C.orange} icon={IC.calendar}/>
        <KPI label="Alertes ouvertes" value={alertsOpen.length} sub={alertsOpen.filter(a=>a.severite==='critical').length+' critiques'} color={C.red} icon={IC.alert}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        {/* Bureau */}
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden'}}>
          <div style={{padding:'10px 14px',borderBottom:`1px solid ${C.border2}`,display:'flex',alignItems:'center',gap:7}}>
            <Icon d={IC.qr} size={14} color={C.blue}/>
            <span style={{fontSize:13,fontWeight:600}}>Employés Bureau — Pointage QR</span>
          </div>
          {BUREAU.map(emp=>{
            const h=HISTORIQUE.filter(h=>h.userId===emp.id).sort((a,b)=>new Date(b.heure)-new Date(a.heure))[0];
            const present=h&&h.type==='entree'&&h.valide;
            return (
              <div key={emp.id} style={{padding:'9px 14px',borderBottom:`1px solid ${C.border2}`,display:'flex',alignItems:'center',gap:10}}>
                <Av initials={emp.avatar} size={30} color={present?C.green:C.text3}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{emp.nom}</div>
                  <div style={{fontSize:10,color:C.text3}}>{emp.dept}</div>
                </div>
                {present
                  ?<Badge label={`✓ ${fT(h.heure)}`} color={C.green}/>
                  :<Badge label="Absent" color={C.text3} bg={C.border2}/>}
              </div>
            );
          })}
        </div>

        {/* Terrain */}
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden'}}>
          <div style={{padding:'10px 14px',borderBottom:`1px solid ${C.border2}`,display:'flex',alignItems:'center',gap:7}}>
            <Icon d={IC.gps} size={14} color={C.orange}/>
            <span style={{fontSize:13,fontWeight:600}}>Techniciens Terrain — GPS Passif</span>
          </div>
          {TERRAIN.map(tech=>{
            const st=statutTerrain(tech);
            const mission=MISSIONS.find(m=>m.techId===tech.id&&m.statut==='in_progress');
            return (
              <div key={tech.id} style={{padding:'9px 14px',borderBottom:`1px solid ${C.border2}`,display:'flex',alignItems:'center',gap:10}}>
                <Av initials={tech.avatar} size={30} color={C.orange}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{tech.nom}</div>
                  <div style={{fontSize:10,color:C.text3,display:'flex',gap:8}}>
                    <span style={{fontFamily:'monospace'}}>{tech.ip}</span>
                    <span>{tech.signal}</span>
                    {tech.batterie<30&&<span style={{color:C.red}}>🔋{tech.batterie}%</span>}
                  </div>
                  {mission&&<div style={{fontSize:10,color:C.text3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{mission.zone} · {mission.jobName.slice(0,30)}</div>}
                </div>
                <Badge label={st.label} color={st.color} bg={st.bg}/>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alertes récentes */}
      {alertsOpen.length>0&&(
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden'}}>
          <div style={{padding:'10px 14px',borderBottom:`1px solid ${C.border2}`,display:'flex',alignItems:'center',gap:7}}>
            <Icon d={IC.alert} size={14} color={C.red}/>
            <span style={{fontSize:13,fontWeight:600}}>Alertes actives</span>
            <Badge label={alertsOpen.length+' ouvertes'} color={C.red}/>
          </div>
          {alertsOpen.map(al=>{
            const sev={critical:C.red,high:C.orange,medium:C.blue,low:C.text3};
            const ic={hors_zone:IC.gps,batterie:IC.battery,absence:IC.calendar};
            return (
              <div key={al.id} style={{padding:'10px 14px',borderBottom:`1px solid ${C.border2}`,display:'flex',alignItems:'center',gap:10,background:al.severite==='critical'?C.red_l+'40':'transparent'}}>
                <Icon d={ic[al.type]||IC.alert} size={15} color={sev[al.severite]||C.text3}/>
                <div style={{flex:1,fontSize:12,color:C.text}}>{al.message}</div>
                <div style={{fontSize:10,color:C.text3,flexShrink:0}}>{fT(al.heure)}</div>
                <Badge label={al.severite} color={sev[al.severite]||C.text3}/>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ===== ÉQUIPE =====
function Equipe(){
  const [section,setSection]=useState('bureau');
  const [showQR,setShowQR]=useState(null);

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
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:10}}>
            {BUREAU.map(emp=>{
              const h=HISTORIQUE.filter(h=>h.userId===emp.id).sort((a,b)=>new Date(b.heure)-new Date(a.heure))[0];
              const present=h&&h.type==='entree'&&h.valide;
              return (
                <div key={emp.id} style={{background:C.white,border:`1px solid ${present?C.green:C.border}`,borderRadius:10,padding:'14px',display:'flex',flexDirection:'column',gap:10}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <Av initials={emp.avatar} size={38} color={present?C.green:C.blue}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600}}>{emp.nom}</div>
                      <div style={{fontSize:11,color:C.text3}}>{emp.poste} · {emp.dept}</div>
                    </div>
                    <Badge label={present?`✓ ${fT(h.heure)}`:'Absent'} color={present?C.green:C.text3} bg={present?C.green_l:C.border2}/>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:8,borderTop:`1px solid ${C.border2}`}}>
                    <div style={{fontSize:10,color:C.text3,fontFamily:'monospace'}}>{emp.qr}</div>
                    <button onClick={()=>setShowQR(showQR===emp.id?null:emp.id)} style={{fontSize:11,padding:'4px 10px',borderRadius:6,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:4}}>
                      <Icon d={IC.qr} size={12}/>QR Code
                    </button>
                  </div>
                  {showQR===emp.id&&(
                    <div style={{padding:'12px',background:C.bg,borderRadius:7,textAlign:'center',border:`1px solid ${C.border}`}}>
                      <div style={{width:80,height:80,margin:'0 auto 6px',background:'#000',borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'#fff',fontFamily:'monospace'}}>{emp.qr}</div>
                      <div style={{fontSize:10,color:C.text3}}>Scanner à l'entrée du bureau</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {section==='terrain'&&(
        <>
          <div style={{padding:'9px 12px',background:C.orange_l,borderRadius:8,border:`1px solid #FAC775`,fontSize:12,color:C.orange,marginBottom:12,display:'flex',alignItems:'center',gap:7}}>
            <Icon d={IC.shield} size={14} color={C.orange}/>
            Tracking passif — Aucune action requise du technicien. Détection automatique via GPS, IP, empreinte appareil et photo CleanCam.
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:10}}>
            {TERRAIN.map(tech=>{
              const st=statutTerrain(tech);
              const mission=MISSIONS.find(m=>m.techId===tech.id&&['in_progress','alerte_absence'].includes(m.statut));
              return (
                <div key={tech.id} style={{background:C.white,border:`1px solid ${st.color==='green'?C.green:st.color===C.red?C.red:C.border}`,borderRadius:10,padding:'14px',display:'flex',flexDirection:'column',gap:10}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <Av initials={tech.avatar} size={38} color={C.orange}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600}}>{tech.nom}</div>
                      <div style={{fontSize:11,color:C.text3}}>{tech.poste}</div>
                    </div>
                    <Badge label={st.label} color={st.color} bg={st.bg}/>
                  </div>
                  {mission&&(
                    <div style={{padding:'7px 9px',background:C.bg,borderRadius:6,border:`1px solid ${C.border}`,fontSize:11}}>
                      <div style={{fontWeight:500,marginBottom:2}}>{mission.zone} — {mission.jobName.slice(0,35)}</div>
                      <div style={{color:C.text3}}>{mission.hStart} → {mission.hEnd} · PM: {mission.pmNom}</div>
                    </div>
                  )}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,fontSize:11,paddingTop:6,borderTop:`1px solid ${C.border2}`}}>
                    {[
                      [IC.wifi,'IP',tech.ip],
                      [IC.phone,'Appareil',tech.device.slice(0,16)],
                      [IC.battery,'Batterie',tech.batterie+'%',tech.batterie<30?C.red:C.green],
                      [IC.gps,'Signal',tech.signal],
                    ].map(([ic,l,v,c])=>(
                      <div key={l} style={{display:'flex',alignItems:'center',gap:5}}>
                        <Icon d={ic} size={11} color={c||C.text3}/>
                        <span style={{color:C.text3}}>{l}:</span>
                        <span style={{fontWeight:500,color:c||C.text,fontFamily:l==='IP'?'monospace':'inherit',fontSize:l==='IP'?10:11}}>{v}</span>
                      </div>
                    ))}
                  </div>
                  {st.dist&&<div style={{fontSize:10,color:st.color,fontWeight:500}}>Distance du site: {st.dist}m{st.dist>ZONES[mission?.zone]?.rayon?' — HORS PÉRIMÈTRE':' — Dans le périmètre'}</div>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ===== MISSIONS (Planning sync) =====
function PlanningMissions(){
  const [missions,setMissions]=useState(MISSIONS);
  const prioriteC={critique:C.red,haute:C.orange,normale:C.blue};
  const statutC={in_progress:{l:'En cours',c:C.blue,bg:C.blue_l},completed:{l:'Terminée',c:C.green,bg:C.green_l},assigned:{l:'Assignée',c:C.purple,bg:C.purple_l},alerte_absence:{l:'⚠ Absence',c:C.red,bg:C.red_l}};

  const validerMission=(id)=>{
    setMissions(p=>p.map(m=>m.id===id?{...m,valide_pm:true,statut:'in_progress'}:m));
  };

  return (
    <div style={{padding:'14px 20px',display:'flex',flexDirection:'column',gap:12}}>
      <div style={{padding:'9px 12px',background:C.purple_l,borderRadius:8,border:`1px solid #D4C5F9`,fontSize:12,color:'#26215C',display:'flex',alignItems:'center',gap:7}}>
        <Icon d={IC.calendar} size={14} color={C.purple}/>
        Planning propose les missions · Le responsable de projet valide ou modifie avant démarrage
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {missions.map(m=>{
          const st=statutC[m.statut]||statutC.assigned;
          const pc=prioriteC[m.priorite]||C.text3;
          const tech=TERRAIN.find(t=>t.id===m.techId);
          const stTech=tech?statutTerrain(tech):null;
          return (
            <div key={m.id} style={{background:C.white,border:`1px solid ${m.statut==='alerte_absence'?C.red:C.border}`,borderRadius:10,overflow:'hidden'}}>
              <div style={{padding:'11px 14px',display:'flex',alignItems:'center',gap:10,borderBottom:`1px solid ${C.border2}`}}>
                <div style={{width:3,height:36,borderRadius:2,background:pc,flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.jobName}</div>
                  <div style={{fontSize:11,color:C.text3}}>{m.zone} · {m.dateDebut} → {m.dateFin} · {m.hStart}–{m.hEnd}</div>
                </div>
                <div style={{display:'flex',gap:6,flexShrink:0}}>
                  <Badge label={m.priorite} color={pc}/>
                  <Badge label={st.l} color={st.c} bg={st.bg}/>
                  {!m.valide_pm&&<Badge label="En attente PM" color={C.orange}/>}
                </div>
              </div>
              <div style={{padding:'9px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
                <div style={{display:'flex',alignItems:'center',gap:16,fontSize:12}}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    {tech&&<Av initials={tech.avatar} size={24} color={C.orange}/>}
                    <div>
                      <div style={{fontWeight:500}}>{m.techNom}</div>
                      {stTech&&<div style={{fontSize:10,color:stTech.color}}>{stTech.label}</div>}
                    </div>
                  </div>
                  <div style={{fontSize:11,color:C.text3}}>PM: {m.pmNom}</div>
                </div>
                <div style={{display:'flex',gap:6}}>
                  {!m.valide_pm&&(
                    <button onClick={()=>validerMission(m.id)} style={{fontSize:11,padding:'5px 12px',borderRadius:6,border:'none',background:C.green,color:C.white,cursor:'pointer',fontFamily:'inherit',fontWeight:500,display:'flex',alignItems:'center',gap:4}}>
                      <Icon d={IC.check} size={12} color={C.white}/>Valider
                    </button>
                  )}
                  {m.statut==='alerte_absence'&&(
                    <button style={{fontSize:11,padding:'5px 12px',borderRadius:6,border:`1px solid ${C.red}`,background:C.red_l,color:C.red,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:4}}>
                      <Icon d={IC.send} size={12} color={C.red}/>Contacter
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== HISTORIQUE =====
function Historique(){
  const getAllEmps=()=>[...BUREAU,...TERRAIN];
  const getEmp=id=>getAllEmps().find(e=>e.id===id);
  const methodeIcon={qr:IC.qr,gps:IC.gps};
  const methodeColor={qr:C.blue,gps:C.orange};

  return (
    <div style={{padding:'14px 20px'}}>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden'}}>
        <div style={{padding:'10px 14px',borderBottom:`1px solid ${C.border2}`,fontSize:13,fontWeight:600}}>Historique des pointages — Aujourd'hui</div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{background:C.bg}}>
            {['Employé','Zone','Méthode','Heure','Distance','Statut'].map(h=><th key={h} style={{textAlign:'left',padding:'8px 14px',fontSize:10,fontWeight:600,color:C.text3,textTransform:'uppercase',letterSpacing:.4,borderBottom:`1px solid ${C.border}`}}>{h}</th>)}
          </tr></thead>
          <tbody>{HISTORIQUE.sort((a,b)=>new Date(b.heure)-new Date(a.heure)).map(h=>{
            const emp=getEmp(h.userId);
            const zone=ZONES[h.zone];
            return (
              <tr key={h.id} onMouseEnter={e=>e.currentTarget.style.background=C.bg} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{padding:'10px 14px',borderBottom:`1px solid ${C.border2}`}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <Av initials={emp?.avatar||'??'} size={28}/>
                    <div style={{fontSize:12,fontWeight:500}}>{emp?.nom||h.userId}</div>
                  </div>
                </td>
                <td style={{padding:'10px 14px',fontSize:12,color:C.text3,borderBottom:`1px solid ${C.border2}`}}>{zone?.nom||h.zone}</td>
                <td style={{padding:'10px 14px',borderBottom:`1px solid ${C.border2}`}}>
                  <div style={{display:'flex',alignItems:'center',gap:5}}>
                    <Icon d={methodeIcon[h.methode]||IC.check} size={12} color={methodeColor[h.methode]||C.text3}/>
                    <span style={{fontSize:11,color:methodeColor[h.methode]||C.text3,fontWeight:500}}>{h.methode==='qr'?'QR Code':'GPS Auto'}</span>
                    {h.photo&&<Badge label="Photo" color={C.purple}/>}
                  </div>
                </td>
                <td style={{padding:'10px 14px',fontSize:12,fontWeight:500,borderBottom:`1px solid ${C.border2}`}}>{fT(h.heure)}</td>
                <td style={{padding:'10px 14px',fontSize:12,color:h.horsZone?C.red:C.text3,borderBottom:`1px solid ${C.border2}`}}>{h.dist}m</td>
                <td style={{padding:'10px 14px',borderBottom:`1px solid ${C.border2}`}}>
                  {h.valide?<Badge label="Valide ✓" color={C.green}/>:<Badge label="Invalide" color={C.red}/>}
                </td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </div>
  );
}

// ===== ALERTES =====
function Alertes(){
  const [alertes,setAlertes]=useState(ALERTES);
  const sevC={critical:C.red,high:C.orange,medium:C.blue,low:C.text3};
  const typeIC={hors_zone:IC.gps,batterie:IC.battery,absence:IC.calendar};

  return (
    <div style={{padding:'14px 20px',display:'flex',flexDirection:'column',gap:8}}>
      {alertes.map(al=>{
        const tech=TERRAIN.find(t=>t.id===al.userId);
        const c=sevC[al.severite]||C.text3;
        return (
          <div key={al.id} style={{background:C.white,border:`1px solid ${al.statut==='open'?c:C.border}`,borderRadius:10,padding:'12px 14px',display:'flex',alignItems:'center',gap:12,opacity:al.statut==='resolved'?.6:1}}>
            <Icon d={typeIC[al.type]||IC.alert} size={18} color={c}/>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:500,color:C.text,marginBottom:3}}>{al.message}</div>
              <div style={{fontSize:11,color:C.text3}}>{fD(al.heure)} · {fT(al.heure)} · Zone: {al.zone}</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:5,flexShrink:0,alignItems:'flex-end'}}>
              <Badge label={al.severite} color={c}/>
              <Badge label={al.statut==='open'?'Ouvert':al.statut==='acknowledged'?'Vu':'Résolu'} color={al.statut==='resolved'?C.green:al.statut==='acknowledged'?C.orange:C.red}/>
            </div>
            {al.statut==='open'&&(
              <button onClick={()=>setAlertes(p=>p.map(a=>a.id===al.id?{...a,statut:'acknowledged'}:a))}
                style={{fontSize:11,padding:'5px 10px',borderRadius:6,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit',flexShrink:0}}>
                Accusé
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ===== RAPPORTS =====
function Rapports(){
  return (
    <div style={{padding:'14px 20px'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
        {[
          ['Rapport présence bureau','Pointages QR du mois',C.blue],
          ['Rapport terrain GPS','Historique GPS + photos CleanCam',C.orange],
          ['Rapport absences','Alertes absence + missions non démarrées',C.red],
          ['Rapport heures travaillées','Total heures par employé → Paie CleanITBooks',C.green],
          ['Rapport hors-zone','Incidents géofencing du mois',C.purple],
          ['Export global CSV','Tous les pointages exportés',C.text3],
        ].map(([l,s,c])=>(
          <div key={l} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px',cursor:'pointer',borderLeft:`3px solid ${c}`}}
            onMouseEnter={e=>e.currentTarget.style.background=C.bg} onMouseLeave={e=>e.currentTarget.style.background=C.white}>
            <div style={{display:'flex',align:'center',justifyContent:'space-between',marginBottom:6}}>
              <Icon d={IC.report} size={16} color={c}/>
              <span style={{fontSize:10,padding:'2px 7px',borderRadius:20,background:c+'15',color:c,fontWeight:500}}>Générer</span>
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
  const loc=useLocation();
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:C.bg,fontFamily:'inherit'}}>
      <div style={{padding:'10px 20px',borderBottom:`1px solid ${C.border}`,background:C.white,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <span style={{fontSize:15,fontWeight:600,color:C.text}}>Pointage & Présence</span>
          <div style={{fontSize:11,color:C.text3,marginTop:1}}>Bureau: QR Code · Terrain: GPS Géofencing passif · CleanCam IA</div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <div style={{fontSize:11,color:C.green,display:'flex',alignItems:'center',gap:4,padding:'4px 10px',background:C.green_l,borderRadius:20}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:C.green}}/>Tracking actif
          </div>
        </div>
      </div>
      <PointageNav/>
      <div style={{flex:1,overflow:'auto'}}>
        {(()=>{
          const seg=loc.pathname.split('/')[2]||'';
          if(seg==='equipe'||seg==='employes') return <Equipe/>;
          if(seg==='planning') return <PlanningMissions/>;
          if(seg==='historique') return <Historique/>;
          if(seg==='alertes') return <Alertes/>;
          if(seg==='rapports') return <Rapports/>;
          if(seg==='map') return <div style={{padding:20,color:C.text3,fontSize:13}}>Carte Live GPS — intégrée dans le module Carte Digital Twin</div>;
          return <Dashboard/>;
        })()}
      </div>
    </div>
  );
}
