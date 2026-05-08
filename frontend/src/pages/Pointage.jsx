import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

// ═══════════════════════════════════════════════════════════════════
//  CONSTANTES ET DONNÉES
// ═══════════════════════════════════════════════════════════════════
const API = 'https://cleanit-erp-production.up.railway.app';
const WS  = 'https://cleanit-erp-production.up.railway.app/tracking';
const MAPTILER_KEY = 'r30VkE2cM55t67KloPhg';

const ZONES = {
  bureau_dla: { lat:4.0511,  lng:9.7085,  rayon:150, nom:'Bureau Principal Douala', adresse:'Akwa, Douala',     type:'bureau', couleur:'#2563eb' },
  bureau_yde: { lat:3.8667,  lng:11.5167, rayon:150, nom:'Bureau Yaoundé',           adresse:'Bastos, Yaoundé',  type:'bureau', couleur:'#7c3aed' },
  'DLA-001':  { lat:4.0511,  lng:9.7085,  rayon:300, nom:'Site Akwa DLA-001',        adresse:'Akwa, Douala',     type:'site',   couleur:'#ea580c' },
  'DLA-002':  { lat:4.0612,  lng:9.7234,  rayon:300, nom:'Site Bonaberi DLA-002',    adresse:'Bonaberi, Douala', type:'site',   couleur:'#dc2626' },
  'YDE-001':  { lat:3.8480,  lng:11.5021, rayon:300, nom:'Site Yaoundé YDE-001',     adresse:'Centre, Yaoundé',  type:'site',   couleur:'#d97706' },
  'KRI-001':  { lat:2.9395,  lng:9.9087,  rayon:300, nom:'Site Kribi KRI-001',       adresse:'Kribi',             type:'site',   couleur:'#059669' },
  'GAR-001':  { lat:9.3019,  lng:13.3920, rayon:300, nom:'Site Garoua GAR-001',      adresse:'Garoua',            type:'site',   couleur:'#be185d' },
  'LIM-001':  { lat:4.0167,  lng:9.2000,  rayon:300, nom:'Site Limbé LIM-001',       adresse:'Limbé',             type:'site',   couleur:'#0891b2' },
};

const EMPLOYES_INTERNES = [
  { id:'EI-001', nom:'Marie Kamga',   poste:'Chef de Projet Senior', dept:'Operations', zone:'bureau_dla', qr:'QR-INT-MK-2024', avatar:'MK', couleur:'#2563eb', email:'m.kamga@cleanit.cm',   tel:'+237 677 001 001' },
  { id:'EI-002', nom:'Jean Fouda',    poste:'Project Manager',       dept:'Operations', zone:'bureau_dla', qr:'QR-INT-JF-2024', avatar:'JF', couleur:'#7c3aed', email:'j.fouda@cleanit.cm',    tel:'+237 677 002 002' },
  { id:'EI-003', nom:'Alice Finance', poste:'Dir. Financière',       dept:'Finance',    zone:'bureau_dla', qr:'QR-INT-AF-2024', avatar:'AF', couleur:'#be185d', email:'a.finance@cleanit.cm',  tel:'+237 677 003 003' },
  { id:'EI-004', nom:'Bob Comptable', poste:'Chef Comptable',        dept:'Finance',    zone:'bureau_dla', qr:'QR-INT-BC-2024', avatar:'BC', couleur:'#0891b2', email:'b.comptable@cleanit.cm',tel:'+237 677 004 004' },
  { id:'EI-005', nom:'Pierre Etoga',  poste:'Ingénieur Réseau',      dept:'Technique',  zone:'bureau_yde', qr:'QR-INT-PE-2024', avatar:'PE', couleur:'#d97706', email:'p.etoga@cleanit.cm',    tel:'+237 677 005 005' },
  { id:'EI-006', nom:'Aline Biya',    poste:'Responsable RH',        dept:'RH',         zone:'bureau_dla', qr:'QR-INT-AB-2024', avatar:'AB', couleur:'#dc2626', email:'a.biya@cleanit.cm',     tel:'+237 677 006 006' },
  { id:'EI-007', nom:'David Mballa',  poste:'Analyste BI',           dept:'Finance',    zone:'bureau_dla', qr:'QR-INT-DM-2024', avatar:'DM', couleur:'#059669', email:'d.mballa@cleanit.cm',   tel:'+237 677 007 007' },
];

const TECHNICIENS = [
  { id:'EX-001', nom:'Thomas Ngono',  poste:'Technicien Réseau',  dept:'Terrain', avatar:'TN', couleur:'#ea580c', email:'t.ngono@cleanit.cm',    tel:'+237 677 010 001', competences:['5G','4G LTE','Installation'] },
  { id:'EX-002', nom:'Samuel Djomo',  poste:'Technicien Réseau',  dept:'Terrain', avatar:'SD', couleur:'#059669', email:'s.djomo@cleanit.cm',    tel:'+237 677 010 002', competences:['Fibre','4G','Maintenance'] },
  { id:'EX-003', nom:'Jean Mbarga',   poste:'Technicien Senior',  dept:'Terrain', avatar:'JM', couleur:'#0891b2', email:'j.mbarga@cleanit.cm',   tel:'+237 677 010 003', competences:['5G','Survey RF','Drive Test'] },
  { id:'EX-004', nom:'Ali Moussa',    poste:'Technicien HSE',     dept:'Terrain', avatar:'AM', couleur:'#dc2626', email:'a.moussa@cleanit.cm',   tel:'+237 677 010 004', competences:['HSE','Sécurité','Pylône'] },
  { id:'EX-005', nom:'Rémi Atangana', poste:'Technicien Fibre',   dept:'Terrain', avatar:'RA', couleur:'#7c3aed', email:'r.atangana@cleanit.cm', tel:'+237 677 010 005', competences:['Fibre Optique','Soudure','FTTH'] },
];

const ALL_EMPLOYES = [
  ...EMPLOYES_INTERNES.map(e=>({...e,typeEmploye:'interne'})),
  ...TECHNICIENS.map(e=>({...e,typeEmploye:'externe'})),
];

const SEED_PRESENCES = [
  { userId:'EI-001', present:true,  entree:new Date(Date.now()-25200000).toISOString(), sortie:null,  zone:'bureau_dla', horsZone:false, dist:12,  lat:4.0511, lng:9.7085, battery:85, network:'WiFi'    },
  { userId:'EI-002', present:true,  entree:new Date(Date.now()-21600000).toISOString(), sortie:null,  zone:'bureau_dla', horsZone:false, dist:8,   lat:4.0511, lng:9.7085, battery:92, network:'WiFi'    },
  { userId:'EI-003', present:false, entree:new Date(Date.now()-28800000).toISOString(), sortie:new Date(Date.now()-3600000).toISOString(), zone:'bureau_dla', horsZone:false, dist:5,   lat:4.0511, lng:9.7085, battery:45, network:'4G' },
  { userId:'EI-004', present:true,  entree:new Date(Date.now()-18000000).toISOString(), sortie:null,  zone:'bureau_dla', horsZone:false, dist:20,  lat:4.0511, lng:9.7085, battery:78, network:'WiFi'    },
  { userId:'EI-006', present:true,  entree:new Date(Date.now()-14400000).toISOString(), sortie:null,  zone:'bureau_dla', horsZone:false, dist:15,  lat:4.0511, lng:9.7085, battery:63, network:'WiFi'    },
  { userId:'EX-001', present:true,  entree:new Date(Date.now()-14400000).toISOString(), sortie:null,  zone:'DLA-001',    horsZone:false, dist:45,  lat:4.0523, lng:9.7091, battery:41, network:'4G'      },
  { userId:'EX-002', present:true,  entree:new Date(Date.now()-10800000).toISOString(), sortie:null,  zone:'DLA-002',    horsZone:false, dist:88,  lat:4.0601, lng:9.7230, battery:67, network:'4G'      },
  { userId:'EX-003', present:true,  entree:new Date(Date.now()-18000000).toISOString(), sortie:null,  zone:'YDE-001',    horsZone:false, dist:120, lat:3.8490, lng:11.5035,battery:55, network:'3G'      },
  { userId:'EX-004', present:true,  entree:new Date(Date.now()-7200000).toISOString(),  sortie:null,  zone:'GAR-001',    horsZone:true,  dist:650, lat:9.3519, lng:13.4120,battery:23, network:'2G'      },
  { userId:'EX-005', present:false, entree:null, sortie:null, zone:'LIM-001', horsZone:false, dist:0, lat:null, lng:null, battery:null, network:null },
];

const SEED_HISTORIQUE = [
  { id:'h1', userId:'EI-001', type:'entree', zone:'bureau_dla', horsZone:false, dist:12,  heure:new Date(Date.now()-25200000).toISOString(), valide:true,  selfie:false },
  { id:'h2', userId:'EX-001', type:'entree', zone:'DLA-001',    horsZone:false, dist:45,  heure:new Date(Date.now()-14400000).toISOString(), valide:true,  selfie:true  },
  { id:'h3', userId:'EX-004', type:'entree', zone:'GAR-001',    horsZone:true,  dist:650, heure:new Date(Date.now()-7200000).toISOString(),  valide:false, selfie:true  },
  { id:'h4', userId:'EI-003', type:'sortie', zone:'bureau_dla', horsZone:false, dist:5,   heure:new Date(Date.now()-3600000).toISOString(),  valide:true,  selfie:false },
  { id:'h5', userId:'EX-002', type:'entree', zone:'DLA-002',    horsZone:false, dist:88,  heure:new Date(Date.now()-10800000).toISOString(), valide:true,  selfie:true  },
  { id:'h6', userId:'EI-002', type:'entree', zone:'bureau_dla', horsZone:false, dist:8,   heure:new Date(Date.now()-21600000).toISOString(), valide:true,  selfie:false },
  { id:'h7', userId:'EX-003', type:'entree', zone:'YDE-001',    horsZone:false, dist:120, heure:new Date(Date.now()-18000000).toISOString(), valide:true,  selfie:true  },
  { id:'h8', userId:'EI-006', type:'entree', zone:'bureau_dla', horsZone:false, dist:15,  heure:new Date(Date.now()-14400000).toISOString(), valide:true,  selfie:false },
];

const SEED_SHIFTS = [
  { id:'SH-001', jobId:'JOB-001', jobName:'Installation 5G NR DLA-001', technicienId:'EX-001', technicienNom:'Thomas Ngono',  chefProjetId:'EI-001', chefProjetNom:'Marie Kamga',  zone:'DLA-001', dateDebut:'2024-05-07', dateFin:'2024-05-09', heureDebut:'07:00', heureFin:'17:00', statut:'in_progress', priority:'high',   description:'Phase 2 installation équipements 5G NR', instructions:'Porter EPI complet. Coordonner avec équipe Huawei.' },
  { id:'SH-002', jobId:'JOB-002', jobName:'Maintenance 4G LTE YDE-001', technicienId:'EX-003', technicienNom:'Jean Mbarga',   chefProjetId:'EI-002', chefProjetNom:'Jean Fouda',   zone:'YDE-001', dateDebut:'2024-05-07', dateFin:'2024-05-07', heureDebut:'08:00', heureFin:'16:00', statut:'in_progress', priority:'medium', description:'Maintenance préventive antennes 4G',      instructions:'Vérifier connexions et paramètres RF.'  },
  { id:'SH-003', jobId:'JOB-003', jobName:'Infrastructure GAR-001',     technicienId:'EX-004', technicienNom:'Ali Moussa',    chefProjetId:'EI-001', chefProjetNom:'Marie Kamga',  zone:'GAR-001', dateDebut:'2024-05-07', dateFin:'2024-05-10', heureDebut:'07:00', heureFin:'18:00', statut:'in_progress', priority:'urgent', description:'Inspection sécurité pylône 45m',           instructions:'Certification HSE obligatoire. Harnais.' },
  { id:'SH-004', jobId:'JOB-004', jobName:'Fibre Optique BFN-001',      technicienId:'EX-005', technicienNom:'Rémi Atangana', chefProjetId:'EI-002', chefProjetNom:'Jean Fouda',   zone:'LIM-001', dateDebut:'2024-05-08', dateFin:'2024-05-12', heureDebut:'07:00', heureFin:'17:00', statut:'assigned',    priority:'high',   description:'Tirage câble fibre 50km phase 1',          instructions:'Équipement soudure disponible au dépôt.' },
  { id:'SH-005', jobId:'JOB-001', jobName:'Installation 5G NR DLA-001', technicienId:'EX-002', technicienNom:'Samuel Djomo',  chefProjetId:'EI-001', chefProjetNom:'Marie Kamga',  zone:'DLA-002', dateDebut:'2024-05-06', dateFin:'2024-05-06', heureDebut:'08:00', heureFin:'16:00', statut:'completed',   priority:'medium', description:'Configuration BBU et tests paramètres',    instructions:'Rapport à soumettre en fin de journée.'  },
];

const SEED_ALERTES = [
  { id:'AL-001', type:'hors_zone',   userId:'EX-004', severite:'critical', statut:'open',         heure:new Date(Date.now()-7200000).toISOString(),  zone:'GAR-001', message:'Ali Moussa est à 650m du périmètre autorisé du Site Garoua GAR-001' },
  { id:'AL-002', type:'batterie',    userId:'EX-004', severite:'high',     statut:'open',         heure:new Date(Date.now()-3600000).toISOString(),   zone:'GAR-001', message:'Batterie critique (23%) — Ali Moussa · Site Garoua' },
  { id:'AL-003', type:'retard',      userId:'EX-005', severite:'medium',   statut:'acknowledged', heure:new Date(Date.now()-86400000).toISOString(),  zone:'LIM-001', message:'Rémi Atangana n\'a pas encore pointé pour le shift SH-004' },
  { id:'AL-004', type:'hors_zone',   userId:'EX-001', severite:'low',      statut:'resolved',     heure:new Date(Date.now()-172800000).toISOString(), zone:'DLA-001', message:'Thomas Ngono hors zone momentané — résolu automatiquement' },
];

// ═══════════════════════════════════════════════════════════════════
//  HELPERS ET COMPOSANTS UI
// ═══════════════════════════════════════════════════════════════════
const fmtTime  = d => d ? new Date(d).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) : '—';
const fmtDate  = d => d ? new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const fmtDate2 = d => d ? new Date(d).toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit',month:'short'}) : '—';
const fmtDur   = ms => { if(!ms||ms<0) return '—'; const h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000); return `${h}h${m.toString().padStart(2,'0')}`; };

const calcDist = (a,b,c,d) => {
  const R=6371000,dL=(c-a)*Math.PI/180,dl=(d-b)*Math.PI/180;
  const x=Math.sin(dL/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dl/2)**2;
  return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
};

const getEmp = id => ALL_EMPLOYES.find(e=>e.id===id);

// Couleurs système
const C = {
  navy:'#0f172a', blue:'#2563eb', blue_l:'#eff6ff', blue_m:'#dbeafe',
  green:'#16a34a', green_l:'#f0fdf4', green_m:'#dcfce7',
  red:'#dc2626', red_l:'#fef2f2', red_m:'#fecaca',
  orange:'#ea580c', orange_l:'#fff7ed', orange_m:'#fed7aa',
  yellow:'#ca8a04', yellow_l:'#fefce8', yellow_m:'#fef08a',
  purple:'#7c3aed', purple_l:'#f5f3ff',
  gray:'#6b7280', gray_l:'#f9fafb', gray_m:'#f3f4f6',
  text:'#111827', text2:'#374151', text3:'#6b7280', text4:'#9ca3af',
  white:'#ffffff', border:'#e5e7eb', border2:'#f3f4f6',
  shadow:'0 1px 3px rgba(0,0,0,.08)', shadow2:'0 4px 16px rgba(0,0,0,.1)',
  bg:'#f1f5f9',
};

// Composants de base
const Av = ({i,color,size=36,online,pulse})=>(
  <div style={{position:'relative',display:'inline-flex',flexShrink:0}}>
    <div style={{width:size,height:size,borderRadius:size*0.28,background:color||C.gray,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:size*0.35,letterSpacing:-.5,boxShadow:`0 2px 8px ${color}40`}}>
      {i}
    </div>
    {online!==undefined&&<div style={{position:'absolute',bottom:-1,right:-1,width:size*0.32,height:size*0.32,borderRadius:'50%',background:online?C.green:'#9ca3af',border:`2px solid white`,boxShadow:'0 1px 3px rgba(0,0,0,.2)'}}/>}
    {pulse&&<div style={{position:'absolute',inset:-3,borderRadius:size*0.35,border:`2px solid ${color}`,animation:'pulse-ring 1.5s infinite',opacity:.6}}/>}
  </div>
);

const Badge = ({label,color,bg,size=10})=>(
  <span style={{fontSize:size,fontWeight:700,padding:'2px 8px',borderRadius:20,background:bg||C.gray_l,color:color||C.text3,letterSpacing:.3,whiteSpace:'nowrap',display:'inline-block'}}>{label}</span>
);

const Btn = ({label,onClick,variant='primary',icon,sm,full,disabled})=>{
  const styles = {
    primary:   {bg:C.blue,   color:'white', border:'none'},
    danger:    {bg:C.red,    color:'white', border:'none'},
    success:   {bg:C.green,  color:'white', border:'none'},
    ghost:     {bg:'transparent', color:C.blue,  border:`1px solid ${C.blue}`},
    light:     {bg:C.gray_l, color:C.text2, border:`1px solid ${C.border}`},
    dark:      {bg:C.navy,   color:'white', border:'none'},
  };
  const s = styles[variant]||styles.primary;
  return(
    <button onClick={onClick} disabled={disabled}
      style={{padding:sm?'7px 14px':'10px 20px',borderRadius:9,border:s.border,background:s.bg,color:s.color,fontWeight:700,fontSize:sm?12:13,cursor:disabled?'not-allowed':'pointer',display:'inline-flex',alignItems:'center',gap:6,width:full?'100%':'auto',justifyContent:'center',opacity:disabled?.6:1,transition:'all .15s',fontFamily:'inherit',whiteSpace:'nowrap'}}>
      {icon&&<span>{icon}</span>} {label}
    </button>
  );
};

const StatCard = ({label,value,sub,color,icon,onClick})=>(
  <div onClick={onClick} style={{background:C.white,borderRadius:12,padding:'16px 18px',border:`1px solid ${C.border}`,borderTop:`3px solid ${color}`,boxShadow:C.shadow,cursor:onClick?'pointer':'default',transition:'all .2s'}}
    onMouseEnter={e=>{if(onClick){e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=C.shadow2;}}}
    onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow=C.shadow;}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
      <span style={{fontSize:10,color:C.text4,textTransform:'uppercase',letterSpacing:.6,fontWeight:700}}>{label}</span>
      <div style={{width:32,height:32,borderRadius:9,background:color+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>{icon}</div>
    </div>
    <div style={{fontSize:30,fontWeight:900,color,lineHeight:1,marginBottom:3}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:C.text4}}>{sub}</div>}
  </div>
);

// Badge statut shift
const ShiftBadge = ({statut})=>{
  const map = {
    assigned:    {l:'Assigné',       c:C.blue,   bg:C.blue_l},
    in_progress: {l:'En cours',      c:C.green,  bg:C.green_l},
    completed:   {l:'Terminé',       c:C.orange, bg:C.orange_l},
    validated:   {l:'Validé',        c:'#7c3aed',bg:'#f5f3ff'},
    cancelled:   {l:'Annulé',        c:C.gray,   bg:C.gray_l},
  };
  const s = map[statut]||{l:statut,c:C.gray,bg:C.gray_l};
  return <Badge label={s.l} color={s.c} bg={s.bg}/>;
};

const PriorityBadge = ({priority})=>{
  const map = {
    urgent:{l:'🔴 Urgent',c:C.red,bg:C.red_l},
    high:  {l:'🟠 Haute', c:C.orange,bg:C.orange_l},
    medium:{l:'🟡 Moyenne',c:C.yellow,bg:C.yellow_l},
    low:   {l:'🟢 Basse', c:C.green,bg:C.green_l},
  };
  const s=map[priority]||{l:priority,c:C.gray,bg:C.gray_l};
  return <Badge label={s.l} color={s.c} bg={s.bg}/>;
};

// QR Code
const QRCode = ({value,size=140})=>{
  const N=21, cell=Math.floor(size/N);
  const seed=value.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const rnd=(i,j)=>((seed*i*31+j*17+seed)%11)>4?1:0;
  const cells=Array.from({length:N},(_,i)=>Array.from({length:N},(_,j)=>{
    if((i<7&&j<7)||(i<7&&j>=N-7)||(i>=N-7&&j<7)) return 1;
    if(i===0||i===6||(i<7&&(j===0||j===6))) return 1;
    if(j===0||j===6||(j<7&&(i===0||i===6))) return 1;
    if(i===N-1||i===N-7||(i>=N-7&&(j===0||j===6))) return 1;
    if(j===N-1||j===N-7) return 1;
    if(i===8&&j%2===0) return 1;
    return rnd(i,j);
  }));
  return(
    <div style={{background:'white',padding:8,borderRadius:8,display:'inline-block',border:`1px solid ${C.border}`}}>
      {cells.map((row,i)=>(
        <div key={i} style={{display:'flex'}}>
          {row.map((v,j)=><div key={j} style={{width:cell,height:cell,background:v?'#111827':'white'}}/>)}
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  NAV PRINCIPALE POINTAGE
// ═══════════════════════════════════════════════════════════════════
const NAV_ITEMS = [
  { id:'',          l:'Dashboard',    icon:'📊', url:'/pointage' },
  { id:'map',       l:'Carte Live',   icon:'🗺️',  url:'/pointage/map' },
  { id:'employes',  l:'Employés',     icon:'👥', url:'/pointage/employes' },
  { id:'planning',  l:'Planning',     icon:'📅', url:'/pointage/planning' },
  { id:'historique',l:'Historique',   icon:'📋', url:'/pointage/historique' },
  { id:'alertes',   l:'Alertes',      icon:'🚨', url:'/pointage/alertes' },
  { id:'approbations',l:'Approbations',icon:'✅', url:'/pointage/approbations' },
  { id:'qrcodes',   l:'QR Codes',     icon:'⬛', url:'/pointage/qrcodes' },
  { id:'rapports',  l:'Rapports',     icon:'📈', url:'/pointage/rapports' },
];

const PointageNav = ({alertCount, presences}) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const loc       = location.pathname;
  const presents  = presences.filter(p=>p.present).length;
  const horsZone  = presences.filter(p=>p.horsZone).length;

  const activeId = (() => {
    const parts = loc.split('/').filter(Boolean);
    return parts[1]||'';
  })();

  return(
    <div style={{background:C.navy,borderBottom:'1px solid rgba(255,255,255,.06)'}}>
      <div style={{maxWidth:1400,margin:'0 auto',padding:'0 24px'}}>
        {/* Top bar */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',height:58}}>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <div style={{width:38,height:38,borderRadius:11,background:'#2563eb',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>⏱</div>
            <div>
              <div style={{fontSize:15,fontWeight:900,color:'white',letterSpacing:-.3}}>CleanIT Pointage</div>
              <div style={{fontSize:11,color:'#64748b'}}>Géofencing · GPS Tracking · Temps réel</div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            {horsZone>0&&(
              <div style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:20,background:'#dc262620',border:'1px solid #dc262640',cursor:'pointer'}} onClick={()=>navigate('/pointage/alertes')}>
                <div style={{width:8,height:8,borderRadius:4,background:'#dc2626',animation:'pulse-dot 1.5s infinite'}}/>
                <span style={{fontSize:12,fontWeight:700,color:'#fca5a5'}}>{horsZone} hors zone</span>
              </div>
            )}
            <div style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:20,background:'#16a34a15',border:'1px solid #16a34a30'}}>
              <div style={{width:8,height:8,borderRadius:4,background:C.green}}/>
              <span style={{fontSize:12,fontWeight:700,color:'#86efac'}}>{presents} présents</span>
            </div>
            <Btn label="+ Pointer" onClick={()=>{}} variant="dark" sm/>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:0,overflowX:'auto'}}>
          {NAV_ITEMS.map(t=>{
            const isActive = activeId===t.id;
            return(
              <button key={t.id} onClick={()=>navigate(t.url)}
                style={{padding:'10px 16px',border:'none',background:'transparent',borderBottom:isActive?'2px solid #2563eb':'2px solid transparent',
                  color:isActive?'white':'#64748b',fontWeight:isActive?700:500,fontSize:12,cursor:'pointer',
                  display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap',transition:'all .15s',fontFamily:'inherit',position:'relative'}}>
                {t.icon} {t.l}
                {t.id==='alertes'&&alertCount>0&&(
                  <span style={{position:'absolute',top:6,right:4,width:16,height:16,borderRadius:8,background:'#dc2626',color:'white',fontSize:9,fontWeight:900,display:'flex',alignItems:'center',justifyContent:'center'}}>{alertCount}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  PAGE DASHBOARD
// ═══════════════════════════════════════════════════════════════════
const PageDashboard = ({presences, historique, alertes, shifts, now, navigate}) => {
  const presents  = presences.filter(p=>p.present);
  const horsZone  = presences.filter(p=>p.horsZone);
  const internes  = presences.filter(p=>ALL_EMPLOYES.find(e=>e.id===p.userId)?.typeEmploye==='interne');
  const externes  = presences.filter(p=>ALL_EMPLOYES.find(e=>e.id===p.userId)?.typeEmploye==='externe');
  const openAlerts= alertes.filter(a=>a.statut==='open');

  return(
    <div style={{animation:'slideIn .25s ease'}}>
      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:12,marginBottom:20}}>
        <StatCard label="Présents" value={presents.length} sub={`/${presences.length} employés`} color={C.green} icon="✅" onClick={()=>navigate('/pointage/employes')}/>
        <StatCard label="Hors zone" value={horsZone.length} sub="alerte active" color={C.red} icon="🚨" onClick={()=>navigate('/pointage/alertes')}/>
        <StatCard label="Alertes ouvertes" value={openAlerts.length} sub="à traiter" color={C.orange} icon="⚠️" onClick={()=>navigate('/pointage/alertes')}/>
        <StatCard label="Internes présents" value={internes.filter(p=>p.present).length} sub={`/${internes.length} au bureau`} color={C.blue} icon="🏢" onClick={()=>navigate('/pointage/employes')}/>
        <StatCard label="Techniciens actifs" value={externes.filter(p=>p.present).length} sub={`/${externes.length} sur terrain`} color={C.orange} icon="🔧" onClick={()=>navigate('/pointage/employes')}/>
        <StatCard label="Shifts aujourd'hui" value={shifts.filter(s=>s.statut==='in_progress').length} sub="en cours" color={C.purple} icon="📅" onClick={()=>navigate('/pointage/planning')}/>
      </div>

      {/* Alertes critiques */}
      {openAlerts.length>0&&(
        <div style={{background:C.red_l,borderRadius:12,padding:'14px 18px',border:`1px solid ${C.red_m}`,marginBottom:20}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
            <span style={{fontSize:16,animation:'pulse-dot 1s infinite'}}>🚨</span>
            <span style={{fontSize:13,fontWeight:800,color:C.red}}>{openAlerts.length} alerte(s) critique(s) — Action requise</span>
            <Btn label="Voir tout" onClick={()=>navigate('/pointage/alertes')} variant="ghost" sm/>
          </div>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            {openAlerts.slice(0,3).map(a=>{
              const emp = getEmp(a.userId);
              return(
                <div key={a.id} style={{background:'white',borderRadius:10,padding:'10px 14px',border:`1px solid ${C.red_m}`,display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}
                  onClick={()=>navigate('/pointage/alertes')}>
                  <Av i={emp?.avatar||'?'} color={emp?.couleur||C.red} size={32} pulse/>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:C.text}}>{emp?.nom||a.userId}</div>
                    <div style={{fontSize:11,color:C.red}}>{a.message.substring(0,50)}...</div>
                  </div>
                  <Badge label={a.severite==='critical'?'🔴 Critique':'🟠 Haute'} color={a.severite==='critical'?C.red:C.orange} bg={a.severite==='critical'?C.red_l:C.orange_l}/>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:16,marginBottom:16}}>
        {/* Présences live */}
        <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,overflow:'hidden',boxShadow:C.shadow}}>
          <div style={{padding:'14px 18px',borderBottom:`1px solid ${C.border2}`,display:'flex',justifyContent:'space-between',alignItems:'center',background:'#fafafa'}}>
            <span style={{fontSize:13,fontWeight:800,color:C.text}}>Présences Live — {now.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</span>
            <div style={{display:'flex',gap:6}}>
              <Badge label={`${presents.length} présents`} color={C.green} bg={C.green_l}/>
              <Btn label="Voir tout" onClick={()=>navigate('/pointage/employes')} variant="light" sm/>
            </div>
          </div>
          <div style={{maxHeight:380,overflowY:'auto'}}>
            {presences.map((p,i)=>{
              const emp = getEmp(p.userId);
              if(!emp) return null;
              const duree = p.entree&&p.present ? now-new Date(p.entree) : null;
              return(
                <div key={p.userId} onClick={()=>navigate('/pointage/employes/'+p.userId)}
                  style={{display:'flex',alignItems:'center',gap:12,padding:'11px 18px',borderBottom:`1px solid ${C.border2}`,cursor:'pointer',transition:'background .1s',background:i%2===0?C.white:'#fafafa'}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.blue_l}
                  onMouseLeave={e=>e.currentTarget.style.background=i%2===0?C.white:'#fafafa'}>
                  <Av i={emp.avatar} color={emp.couleur} size={38} online={p.present}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
                      <span style={{fontSize:13,fontWeight:700,color:C.text}}>{emp.nom}</span>
                      <Badge label={emp.typeEmploye==='interne'?'Interne':'Terrain'} color={emp.typeEmploye==='interne'?C.blue:C.orange} bg={emp.typeEmploye==='interne'?C.blue_l:C.orange_l} size={9}/>
                      {p.horsZone&&<Badge label="⚠ Hors zone" color={C.red} bg={C.red_l} size={9}/>}
                    </div>
                    <div style={{fontSize:11,color:C.text3}}>{emp.poste} · {ZONES[p.zone]?.nom||p.zone}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontSize:12,fontWeight:700,color:p.present?C.green:C.gray}}>{p.present?'Présent':'Absent'}</div>
                    <div style={{fontSize:10,color:C.text4}}>
                      {p.entree?`▶ ${fmtTime(p.entree)}`:'—'}
                      {duree?` · ${fmtDur(duree)}`:''}
                    </div>
                    {p.battery&&<div style={{fontSize:10,color:p.battery<30?C.red:C.text4}}>🔋 {p.battery}%</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {/* Activité récente */}
          <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,overflow:'hidden',boxShadow:C.shadow,flex:1}}>
            <div style={{padding:'12px 16px',borderBottom:`1px solid ${C.border2}`,display:'flex',justifyContent:'space-between',alignItems:'center',background:'#fafafa'}}>
              <span style={{fontSize:13,fontWeight:800,color:C.text}}>Activité récente</span>
              <Btn label="Historique" onClick={()=>navigate('/pointage/historique')} variant="light" sm/>
            </div>
            <div style={{maxHeight:200,overflowY:'auto'}}>
              {historique.slice(0,8).map((h,i)=>{
                const emp=getEmp(h.userId);
                return(
                  <div key={h.id} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 16px',borderBottom:`1px solid ${C.border2}`,background:i%2===0?C.white:'#fafafa'}}>
                    <div style={{width:28,height:28,borderRadius:8,background:h.type==='entree'?C.green_l:h.type==='sortie'?C.red_l:C.blue_l,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0}}>
                      {h.type==='entree'?'▶':h.type==='sortie'?'⏹':'⏸'}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:700,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{emp?.nom||h.userId}</div>
                      <div style={{fontSize:10,color:C.text3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ZONES[h.zone]?.nom||h.zone}</div>
                    </div>
                    <div style={{flexShrink:0,textAlign:'right'}}>
                      <div style={{fontSize:11,fontWeight:700,color:h.type==='entree'?C.green:h.type==='sortie'?C.red:C.blue}}>
                        {h.type==='entree'?'Entrée':h.type==='sortie'?'Sortie':'Pause'}
                      </div>
                      <div style={{fontSize:10,color:C.text4}}>{fmtTime(h.heure)}</div>
                    </div>
                    {h.horsZone&&<span title="Hors zone">⚠️</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shifts actifs */}
          <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,overflow:'hidden',boxShadow:C.shadow}}>
            <div style={{padding:'12px 16px',borderBottom:`1px solid ${C.border2}`,display:'flex',justifyContent:'space-between',alignItems:'center',background:'#fafafa'}}>
              <span style={{fontSize:13,fontWeight:800,color:C.text}}>Shifts actifs</span>
              <Btn label="Planning" onClick={()=>navigate('/pointage/planning')} variant="light" sm/>
            </div>
            {shifts.filter(s=>s.statut==='in_progress').slice(0,3).map((s,i)=>{
              const tech=getEmp(s.technicienId);
              return(
                <div key={s.id} onClick={()=>navigate('/pointage/planning/'+s.id)}
                  style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px',borderBottom:`1px solid ${C.border2}`,cursor:'pointer'}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.blue_l}
                  onMouseLeave={e=>e.currentTarget.style.background='white'}>
                  <Av i={tech?.avatar||'?'} color={tech?.couleur||C.gray} size={30}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{tech?.nom}</div>
                    <div style={{fontSize:10,color:C.text3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.jobName}</div>
                  </div>
                  <PriorityBadge priority={s.priority}/>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats zones */}
      <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:'16px 20px',boxShadow:C.shadow}}>
        <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:14}}>Vue par zones</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:10}}>
          {Object.entries(ZONES).map(([key,zone])=>{
            const emps=presences.filter(p=>p.zone===key&&p.present);
            const hors=emps.filter(p=>p.horsZone);
            return(
              <div key={key} onClick={()=>navigate('/pointage/map')}
                style={{padding:'12px 14px',borderRadius:10,border:`1px solid ${hors.length>0?C.red_m:C.border}`,background:hors.length>0?C.red_l:C.gray_l,cursor:'pointer',transition:'all .15s'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow=C.shadow2;}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                  <div style={{width:8,height:8,borderRadius:4,background:zone.couleur}}/>
                  <span style={{fontSize:10,fontWeight:700,color:C.text3,textTransform:'uppercase'}}>{zone.type==='bureau'?'🏢':'📍'} {key}</span>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{zone.nom}</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:11,color:C.text3}}>{emps.length} présent(s)</span>
                  {hors.length>0&&<Badge label={`${hors.length} hors zone`} color={C.red} bg={C.red_m} size={9}/>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  PAGE CARTE LIVE
// ═══════════════════════════════════════════════════════════════════
const PageMap = ({presences, navigate}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(()=>{
    if(!mapRef.current || mapInstance.current) return;
    const script = document.createElement('script');
    script.src = `https://cdn.maptiler.com/maptiler-sdk-js/v2.0.3/maptiler-sdk.umd.min.js`;
    script.onload = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.maptiler.com/maptiler-sdk-js/v2.0.3/maptiler-sdk.css';
      document.head.appendChild(link);

      setTimeout(()=>{
        try {
          window.maptilersdk.config.apiKey = MAPTILER_KEY;
          const map = new window.maptilersdk.Map({
            container: mapRef.current,
            style: window.maptilersdk.MapStyle.STREETS,
            center: [9.7085, 4.0511],
            zoom: 10,
          });
          mapInstance.current = map;

          map.on('load', ()=>{
            // Ajouter zones géofencing
            Object.entries(ZONES).forEach(([key, zone])=>{
              const circle = [];
              for(let i=0;i<=64;i++){
                const angle = (i/64)*Math.PI*2;
                const latOff = (zone.rayon/111320)*Math.cos(angle);
                const lngOff = (zone.rayon/(111320*Math.cos(zone.lat*Math.PI/180)))*Math.sin(angle);
                circle.push([zone.lng+lngOff, zone.lat+latOff]);
              }
              map.addSource(`zone-${key}`, {type:'geojson',data:{type:'Feature',geometry:{type:'Polygon',coordinates:[circle]}}});
              map.addLayer({id:`zone-fill-${key}`,type:'fill',source:`zone-${key}`,paint:{'fill-color':zone.couleur,'fill-opacity':.12}});
              map.addLayer({id:`zone-line-${key}`,type:'line',source:`zone-${key}`,paint:{'line-color':zone.couleur,'line-width':2,'line-dasharray':[3,2]}});

              // Marqueur centre zone
              const el = document.createElement('div');
              el.style.cssText = `width:36px;height:36px;border-radius:10px;background:${zone.couleur};display:flex;align-items:center;justify-content:center;color:white;font-size:16px;font-weight:900;box-shadow:0 3px 10px ${zone.couleur}60;border:2px solid white;cursor:pointer;`;
              el.innerText = zone.type==='bureau'?'🏢':'📍';
              el.title = zone.nom;
              new window.maptilersdk.Marker({element:el}).setLngLat([zone.lng,zone.lat]).setPopup(new window.maptilersdk.Popup().setHTML(`<div style="padding:8px;font-family:sans-serif"><div style="font-weight:800;font-size:13px">${zone.nom}</div><div style="font-size:11px;color:#6b7280">${zone.adresse}</div><div style="font-size:11px;color:#6b7280">Rayon: ${zone.rayon}m</div></div>`)).addTo(map);
            });

            // Ajouter marqueurs employés
            presences.forEach(p=>{
              if(!p.lat||!p.lng||!p.present) return;
              const emp = getEmp(p.userId);
              if(!emp) return;
              const el = document.createElement('div');
              el.style.cssText = `width:40px;height:40px;border-radius:12px;background:${emp.couleur};display:flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:900;box-shadow:0 3px 12px ${emp.couleur}60;border:3px solid ${p.horsZone?'#dc2626':'white'};cursor:pointer;position:relative;`;
              el.innerText = emp.avatar;
              if(p.horsZone){
                const pulse = document.createElement('div');
                pulse.style.cssText = `position:absolute;inset:-4px;border-radius:16px;border:2px solid #dc2626;animation:pulse-ring 1.5s infinite;`;
                el.appendChild(pulse);
              }
              new window.maptilersdk.Marker({element:el}).setLngLat([p.lng,p.lat]).setPopup(
                new window.maptilersdk.Popup({offset:25}).setHTML(`
                  <div style="padding:10px;font-family:sans-serif;min-width:180px">
                    <div style="font-weight:800;font-size:14px;margin-bottom:4px">${emp.nom}</div>
                    <div style="font-size:12px;color:#6b7280;margin-bottom:6px">${emp.poste}</div>
                    <div style="font-size:11px;padding:4px 8px;border-radius:6px;background:${p.horsZone?'#fef2f2':'#f0fdf4'};color:${p.horsZone?'#dc2626':'#16a34a'};font-weight:700;">
                      ${p.horsZone?'⚠ Hors zone — '+p.dist+'m':'✅ Dans la zone — '+p.dist+'m'}
                    </div>
                    <div style="font-size:11px;color:#9ca3af;margin-top:4px">🔋 ${p.battery||'—'}% · ${p.network||'—'}</div>
                  </div>
                `)
              ).addTo(map);
            });
          });
        } catch(e){ console.error('Map error:', e); }
      }, 500);
    };
    document.head.appendChild(script);
  },[]);

  const horsZone = presences.filter(p=>p.horsZone&&p.present);

  return(
    <div style={{animation:'slideIn .25s ease'}}>
      <div style={{display:'flex',gap:10,marginBottom:14,alignItems:'center',flexWrap:'wrap'}}>
        <div style={{fontSize:14,fontWeight:800,color:C.text}}>Carte GPS Live</div>
        <div style={{display:'flex',gap:8,marginLeft:'auto'}}>
          <Badge label={`${presences.filter(p=>p.present).length} en ligne`} color={C.green} bg={C.green_l}/>
          {horsZone.length>0&&<Badge label={`${horsZone.length} hors zone`} color={C.red} bg={C.red_l}/>}
          <Btn label="Actualiser" onClick={()=>window.location.reload()} variant="light" sm icon="🔄"/>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:14}}>
        {/* Carte */}
        <div style={{borderRadius:14,overflow:'hidden',border:`1px solid ${C.border}`,boxShadow:C.shadow,height:520}}>
          <div ref={mapRef} style={{width:'100%',height:'100%'}}/>
        </div>

        {/* Panel positions */}
        <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,overflow:'hidden',boxShadow:C.shadow}}>
          <div style={{padding:'12px 16px',borderBottom:`1px solid ${C.border2}`,background:'#fafafa'}}>
            <div style={{fontSize:13,fontWeight:800,color:C.text}}>Positions en temps réel</div>
          </div>
          <div style={{overflowY:'auto',maxHeight:470}}>
            {presences.filter(p=>p.present).map(p=>{
              const emp=getEmp(p.userId);
              if(!emp) return null;
              return(
                <div key={p.userId} onClick={()=>navigate('/pointage/employes/'+p.userId)}
                  style={{padding:'11px 14px',borderBottom:`1px solid ${C.border2}`,cursor:'pointer',transition:'background .1s'}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.blue_l}
                  onMouseLeave={e=>e.currentTarget.style.background='white'}>
                  <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:6}}>
                    <Av i={emp.avatar} color={emp.couleur} size={30} online={true} pulse={p.horsZone}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:700,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{emp.nom}</div>
                      <div style={{fontSize:10,color:C.text3}}>{emp.poste}</div>
                    </div>
                    {p.horsZone&&<span style={{fontSize:14}}>⚠️</span>}
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4}}>
                    {[
                      {l:'Zone',v:ZONES[p.zone]?.nom?.substring(0,16)||p.zone},
                      {l:'Distance',v:`${p.dist}m`,c:p.horsZone?C.red:C.green},
                      {l:'Batterie',v:p.battery?`${p.battery}%`:'—',c:p.battery<30?C.red:C.text3},
                      {l:'Réseau',v:p.network||'—'},
                    ].map(item=>(
                      <div key={item.l} style={{background:'#f8fafc',borderRadius:6,padding:'4px 7px'}}>
                        <div style={{fontSize:8,color:C.text4,textTransform:'uppercase',letterSpacing:.3}}>{item.l}</div>
                        <div style={{fontSize:11,fontWeight:700,color:item.c||C.text2}}>{item.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {presences.filter(p=>!p.present).map(p=>{
              const emp=getEmp(p.userId);
              if(!emp) return null;
              return(
                <div key={p.userId} style={{padding:'10px 14px',borderBottom:`1px solid ${C.border2}`,opacity:.5}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <Av i={emp.avatar} color={emp.couleur} size={28} online={false}/>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:C.text}}>{emp.nom}</div>
                      <div style={{fontSize:10,color:C.text3}}>Absent</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  PAGE LISTE EMPLOYÉS
// ═══════════════════════════════════════════════════════════════════
const PageEmployes = ({presences, navigate}) => {
  const [search, setSearch] = useState('');
  const [filtre, setFiltre] = useState('tous');

  const filtered = ALL_EMPLOYES.filter(emp=>{
    const ms = !search||(emp.nom+emp.poste+emp.dept).toLowerCase().includes(search.toLowerCase());
    const mf = filtre==='tous'||emp.typeEmploye===filtre;
    return ms&&mf;
  });

  return(
    <div style={{animation:'slideIn .25s ease'}}>
      <div style={{display:'flex',gap:10,marginBottom:16,alignItems:'center',flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,background:C.white,borderRadius:10,padding:'8px 13px',border:`1px solid ${C.border}`,flex:1,maxWidth:300}}>
          <span style={{color:C.text4}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
            style={{flex:1,border:'none',outline:'none',fontSize:13,fontFamily:'inherit'}}/>
        </div>
        <div style={{display:'flex',gap:1,background:C.white,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden'}}>
          {[{v:'tous',l:'Tous'},{v:'interne',l:'🏢 Internes'},{v:'externe',l:'🔧 Techniciens'}].map(f=>(
            <button key={f.v} onClick={()=>setFiltre(f.v)}
              style={{padding:'8px 16px',border:'none',background:filtre===f.v?C.blue:'transparent',color:filtre===f.v?'white':C.gray,fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
              {f.l}
            </button>
          ))}
        </div>
        <div style={{marginLeft:'auto',fontSize:12,color:C.text3}}>{filtered.length} employé(s)</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
        {filtered.map(emp=>{
          const presence = presences.find(p=>p.userId===emp.id)||{present:false};
          const duree = presence.entree&&presence.present ? Date.now()-new Date(presence.entree) : null;
          return(
            <div key={emp.id} onClick={()=>navigate('/pointage/employes/'+emp.id)}
              style={{background:C.white,borderRadius:14,border:`2px solid ${presence.horsZone?C.red_m:presence.present?C.green_m:C.border}`,padding:18,cursor:'pointer',transition:'all .2s',boxShadow:C.shadow}}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=C.shadow2;}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow=C.shadow;}}>
              <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:14}}>
                <Av i={emp.avatar} color={emp.couleur} size={50} online={presence.present} pulse={presence.horsZone}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3,flexWrap:'wrap'}}>
                    <span style={{fontSize:14,fontWeight:800,color:C.text}}>{emp.nom}</span>
                    {presence.horsZone&&<Badge label="⚠ Hors zone" color={C.red} bg={C.red_l} size={9}/>}
                  </div>
                  <div style={{fontSize:12,color:C.text3,marginBottom:4}}>{emp.poste}</div>
                  <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                    <Badge label={emp.typeEmploye==='interne'?'🏢 Interne':'🔧 Terrain'} color={emp.typeEmploye==='interne'?C.blue:C.orange} bg={emp.typeEmploye==='interne'?C.blue_l:C.orange_l} size={9}/>
                    <Badge label={emp.dept} color={C.gray} bg={C.gray_l} size={9}/>
                  </div>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {[
                  {l:'Statut',    v:presence.present?'✅ Présent':'⚫ Absent', c:presence.present?C.green:C.gray},
                  {l:'Zone',      v:ZONES[presence.zone]?.nom?.substring(0,16)||'—'},
                  {l:'Entrée',    v:presence.entree?fmtTime(presence.entree):'—'},
                  {l:'Durée',     v:duree?fmtDur(duree):'—'},
                ].map(item=>(
                  <div key={item.l} style={{background:'#f8fafc',borderRadius:8,padding:'7px 10px'}}>
                    <div style={{fontSize:9,color:C.text4,textTransform:'uppercase',letterSpacing:.4,marginBottom:2}}>{item.l}</div>
                    <div style={{fontSize:12,fontWeight:700,color:item.c||C.text2}}>{item.v}</div>
                  </div>
                ))}
              </div>
              {emp.typeEmploye==='interne'&&(
                <div style={{marginTop:10,fontSize:11,color:C.text4,fontFamily:'monospace'}}>{emp.qr}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  PAGE FICHE EMPLOYÉ
// ═══════════════════════════════════════════════════════════════════
const PageEmployeDetail = ({presences, historique, shifts, navigate}) => {
  const {empId} = useParams();
  const emp = getEmp(empId);
  const presence = presences.find(p=>p.userId===empId)||{present:false};
  const empHistorique = historique.filter(h=>h.userId===empId);
  const empShifts = shifts.filter(s=>s.technicienId===empId);
  const [tab, setTab] = useState('overview');

  if(!emp) return(
    <div style={{textAlign:'center',padding:'60px',color:C.text4}}>
      <div style={{fontSize:48,marginBottom:12}}>😕</div>
      <div style={{fontSize:16,fontWeight:700}}>Employé introuvable</div>
      <Btn label="Retour" onClick={()=>navigate('/pointage/employes')} variant="light" sm/>
    </div>
  );

  const duree = presence.entree&&presence.present ? Date.now()-new Date(presence.entree) : null;

  return(
    <div style={{animation:'slideIn .25s ease'}}>
      {/* Breadcrumb */}
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:16,fontSize:12,color:C.text3}}>
        <span style={{cursor:'pointer',color:C.blue}} onClick={()=>navigate('/pointage/employes')}>Employés</span>
        <span>/</span>
        <span style={{fontWeight:700,color:C.text}}>{emp.nom}</span>
      </div>

      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#0f172a,#1e3a5f)',borderRadius:16,padding:'24px 28px',marginBottom:20,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-30,right:-30,width:200,height:200,borderRadius:'50%',background:'rgba(255,255,255,.03)'}}/>
        <div style={{display:'flex',alignItems:'center',gap:18,position:'relative',zIndex:1}}>
          <Av i={emp.avatar} color={emp.couleur} size={64} online={presence.present} pulse={presence.horsZone}/>
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4,flexWrap:'wrap'}}>
              <span style={{fontSize:22,fontWeight:900,color:'white'}}>{emp.nom}</span>
              <Badge label={presence.present?'✅ Présent':'⚫ Absent'} color={presence.present?'#86efac':'#d1d5db'} bg={presence.present?'rgba(22,163,74,.2)':'rgba(107,114,128,.2)'}/>
              {presence.horsZone&&<Badge label="⚠ HORS ZONE" color="#fca5a5" bg="rgba(220,38,38,.2)"/>}
            </div>
            <div style={{fontSize:14,color:'#94a3b8',marginBottom:6}}>{emp.poste} · {emp.dept}</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <Badge label={emp.typeEmploye==='interne'?'🏢 Employé interne':'🔧 Technicien terrain'} color="#93c5fd" bg="rgba(37,99,235,.2)"/>
              <Badge label={`📧 ${emp.email}`} color="#94a3b8" bg="rgba(255,255,255,.05)"/>
              <Badge label={`📞 ${emp.tel}`} color="#94a3b8" bg="rgba(255,255,255,.05)"/>
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>Durée de présence</div>
            <div style={{fontSize:28,fontWeight:900,color:presence.present?'#86efac':'#94a3b8'}}>{duree?fmtDur(duree):'—'}</div>
            {presence.entree&&<div style={{fontSize:11,color:'#64748b'}}>Depuis {fmtTime(presence.entree)}</div>}
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {[
          {l:'Zone actuelle',      v:ZONES[presence.zone]?.nom||'—',       c:C.blue},
          {l:'Distance périmètre', v:presence.dist?`${presence.dist}m`:'—', c:presence.horsZone?C.red:C.green},
          {l:'Batterie',          v:presence.battery?`${presence.battery}%`:'—', c:presence.battery<30?C.red:C.text},
          {l:'Réseau',            v:presence.network||'—',                  c:C.text},
        ].map((s,i)=>(
          <div key={i} style={{background:C.white,borderRadius:10,padding:'14px 16px',border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
            <div style={{fontSize:10,color:C.text4,textTransform:'uppercase',letterSpacing:.5,marginBottom:4}}>{s.l}</div>
            <div style={{fontSize:16,fontWeight:800,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:0,borderBottom:`1px solid ${C.border}`,marginBottom:20}}>
        {[{id:'overview',l:'Aperçu'},{id:'timeline',l:'Timeline'},{id:'historique',l:'Historique'},{id:'shifts',l:'Shifts'},emp.typeEmploye==='interne'?{id:'qr',l:'QR Code'}:{id:'tracking',l:'Tracé GPS'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:'10px 18px',border:'none',borderBottom:tab===t.id?`2px solid ${C.blue}`:'2px solid transparent',background:'transparent',color:tab===t.id?C.blue:C.gray,fontWeight:tab===t.id?700:500,fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>
            {t.l}
          </button>
        ))}
      </div>

      {/* Tab Overview */}
      {tab==='overview'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,padding:'20px'}}>
            <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:14}}>Informations personnelles</div>
            {[
              {l:'Matricule',    v:emp.id},
              {l:'Email',        v:emp.email},
              {l:'Téléphone',    v:emp.tel},
              {l:'Département',  v:emp.dept},
              {l:'Type',         v:emp.typeEmploye==='interne'?'Employé interne':'Technicien terrain'},
              ...(emp.competences?[{l:'Compétences',v:emp.competences.join(', ')}]:[]),
              ...(emp.typeEmploye==='interne'?[{l:'Zone bureau',v:ZONES[emp.zone]?.nom||emp.zone},{l:'Code QR',v:emp.qr}]:[]),
            ].map(item=>(
              <div key={item.l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:`1px solid ${C.border2}`,alignItems:'center'}}>
                <span style={{fontSize:12,color:C.text3}}>{item.l}</span>
                <span style={{fontSize:12,fontWeight:600,color:C.text,textAlign:'right',maxWidth:200}}>{item.v}</span>
              </div>
            ))}
          </div>
          <div style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,padding:'20px'}}>
            <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:14}}>Présence du jour</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {[
                {l:'Statut',            v:presence.present?'✅ Présent':'⚫ Absent',c:presence.present?C.green:C.gray},
                {l:'Heure d\'arrivée', v:presence.entree?fmtTime(presence.entree):'—'},
                {l:'Heure de départ',  v:presence.sortie?fmtTime(presence.sortie):'En cours'},
                {l:'Durée présence',   v:duree?fmtDur(duree):'—'},
                {l:'Zone',             v:ZONES[presence.zone]?.nom||'—'},
                {l:'Géofencing',       v:presence.horsZone?'⚠ Hors périmètre':'✅ Dans la zone',c:presence.horsZone?C.red:C.green},
                {l:'Coordonnées GPS',  v:presence.lat&&presence.lng?`${presence.lat?.toFixed(5)}°N, ${presence.lng?.toFixed(5)}°E`:'—'},
              ].map(item=>(
                <div key={item.l} style={{display:'flex',justifyContent:'space-between',padding:'8px 12px',borderRadius:8,background:'#f8fafc'}}>
                  <span style={{fontSize:12,color:C.text3}}>{item.l}</span>
                  <span style={{fontSize:12,fontWeight:700,color:item.c||C.text}}>{item.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Timeline */}
      {tab==='timeline'&&(
        <div style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,padding:'20px'}}>
          <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:16}}>Timeline de présence — Aujourd'hui</div>
          <div style={{position:'relative',paddingLeft:20}}>
            <div style={{position:'absolute',left:8,top:0,bottom:0,width:2,background:C.border,borderRadius:2}}/>
            {empHistorique.length===0&&<div style={{color:C.text4,fontSize:13}}>Aucun pointage aujourd'hui</div>}
            {empHistorique.map((h,i)=>(
              <div key={h.id} style={{position:'relative',marginBottom:16,paddingLeft:20}}>
                <div style={{position:'absolute',left:-12,top:4,width:14,height:14,borderRadius:7,background:h.type==='entree'?C.green:h.type==='sortie'?C.red:C.blue,border:'2px solid white',boxShadow:`0 2px 4px ${h.type==='entree'?C.green:C.red}40`}}/>
                <div style={{background:'#f8fafc',borderRadius:10,padding:'12px 14px',border:`1px solid ${C.border}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:14}}>{h.type==='entree'?'▶':h.type==='sortie'?'⏹':'⏸'}</span>
                      <span style={{fontSize:13,fontWeight:700,color:h.type==='entree'?C.green:h.type==='sortie'?C.red:C.blue}}>
                        {h.type==='entree'?'Entrée':h.type==='sortie'?'Sortie':'Pause'}
                      </span>
                      {h.selfie&&<Badge label="📷 Selfie vérifié" color={C.green} bg={C.green_l} size={9}/>}
                      {h.horsZone&&<Badge label="⚠ Hors zone" color={C.red} bg={C.red_l} size={9}/>}
                    </div>
                    <span style={{fontSize:12,fontWeight:700,color:C.text2}}>{fmtTime(h.heure)}</span>
                  </div>
                  <div style={{fontSize:11,color:C.text3}}>{ZONES[h.zone]?.nom||h.zone}</div>
                  <div style={{fontSize:11,color:h.horsZone?C.red:C.green,marginTop:2}}>
                    {h.horsZone?`⚠ Hors périmètre — ${h.dist}m`:`✅ Dans la zone — ${h.dist}m`}
                  </div>
                  <div style={{marginTop:6,display:'flex',gap:6}}>
                    <Badge label={h.valide?'✓ Validé':'⏳ En attente'} color={h.valide?C.green:C.orange} bg={h.valide?C.green_l:C.orange_l} size={9}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Historique */}
      {tab==='historique'&&(
        <div style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#f8fafc',borderBottom:`2px solid ${C.border}`}}>
                {['Date','Action','Zone','Distance','Selfie','Statut'].map(h=>(
                  <th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:10,fontWeight:800,color:C.text3,textTransform:'uppercase',letterSpacing:.5}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {empHistorique.length===0&&<tr><td colSpan={6} style={{padding:'40px',textAlign:'center',color:C.text4}}>Aucun historique</td></tr>}
              {empHistorique.map((h,i)=>(
                <tr key={h.id} style={{borderBottom:`1px solid ${C.border2}`,background:i%2===0?C.white:'#fafafa'}}>
                  <td style={{padding:'11px 14px',fontSize:12,color:C.text2}}>{fmtDate2(h.heure)} {fmtTime(h.heure)}</td>
                  <td style={{padding:'11px 14px'}}>
                    <Badge label={h.type==='entree'?'▶ Entrée':h.type==='sortie'?'⏹ Sortie':'⏸ Pause'} color={h.type==='entree'?C.green:h.type==='sortie'?C.red:C.blue} bg={h.type==='entree'?C.green_l:h.type==='sortie'?C.red_l:C.blue_l}/>
                  </td>
                  <td style={{padding:'11px 14px',fontSize:12,color:C.text2}}>{ZONES[h.zone]?.nom||h.zone}</td>
                  <td style={{padding:'11px 14px'}}>
                    <span style={{fontSize:12,fontWeight:700,color:h.horsZone?C.red:C.green}}>{h.horsZone?'⚠ ':''}{h.dist}m</span>
                  </td>
                  <td style={{padding:'11px 14px'}}>{h.selfie?<Badge label="📷 Vérifié" color={C.green} bg={C.green_l}/>:<Badge label="—" color={C.gray} bg={C.gray_l}/>}</td>
                  <td style={{padding:'11px 14px'}}><Badge label={h.valide?'✓ Validé':'⏳ Attente'} color={h.valide?C.green:C.orange} bg={h.valide?C.green_l:C.orange_l}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Shifts */}
      {tab==='shifts'&&(
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {empShifts.length===0&&<div style={{background:C.white,borderRadius:12,padding:'40px',textAlign:'center',color:C.text4,border:`1px solid ${C.border}`}}>Aucun shift assigné</div>}
          {empShifts.map(s=>(
            <div key={s.id} onClick={()=>navigate('/pointage/planning/'+s.id)}
              style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,padding:'16px 20px',cursor:'pointer',transition:'all .15s'}}
              onMouseEnter={e=>e.currentTarget.style.background=C.blue_l}
              onMouseLeave={e=>e.currentTarget.style.background='white'}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:2}}>{s.jobName}</div>
                  <div style={{fontSize:11,color:C.text3}}>{ZONES[s.zone]?.nom||s.zone} · {s.dateDebut} → {s.dateFin}</div>
                </div>
                <div style={{display:'flex',gap:6}}>
                  <PriorityBadge priority={s.priority}/>
                  <ShiftBadge statut={s.statut}/>
                </div>
              </div>
              <div style={{fontSize:12,color:C.text3}}>{s.description}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tab QR */}
      {tab==='qr'&&emp.typeEmploye==='interne'&&(
        <div style={{display:'flex',justifyContent:'center'}}>
          <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:'30px',textAlign:'center',maxWidth:300,boxShadow:C.shadow}}>
            <Av i={emp.avatar} color={emp.couleur} size={56}/>
            <div style={{fontSize:15,fontWeight:800,color:C.text,margin:'14px 0 4px'}}>{emp.nom}</div>
            <div style={{fontSize:12,color:C.text3,marginBottom:6}}>{emp.poste}</div>
            <Badge label={emp.dept} color={C.blue} bg={C.blue_l}/>
            <div style={{margin:'20px 0'}}>
              <QRCode value={emp.qr} size={180}/>
            </div>
            <div style={{fontSize:10,color:C.text4,fontFamily:'monospace',marginBottom:14}}>{emp.qr}</div>
            <div style={{fontSize:11,padding:'8px 12px',borderRadius:8,background:C.blue_l,color:C.blue,fontWeight:600,marginBottom:16}}>
              📍 Zone: {ZONES[emp.zone]?.nom}
            </div>
            <Btn label="🖨 Imprimer le QR code" onClick={()=>window.print()} variant="primary" full/>
          </div>
        </div>
      )}

      {/* Tab Tracking GPS */}
      {tab==='tracking'&&emp.typeEmploye==='externe'&&(
        <div style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,padding:'20px'}}>
          <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:14}}>Tracé GPS — Aujourd'hui</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
            {[
              {l:'Position actuelle',v:presence.lat?`${presence.lat?.toFixed(5)}°N`:'—'},
              {l:'Distance zone',v:presence.dist?`${presence.dist}m`:'—',c:presence.horsZone?C.red:C.green},
              {l:'Dernier signal',v:presence.entree?fmtTime(presence.entree):'—'},
            ].map((s,i)=>(
              <div key={i} style={{background:'#f8fafc',borderRadius:10,padding:'12px 14px',border:`1px solid ${C.border}`}}>
                <div style={{fontSize:10,color:C.text4,textTransform:'uppercase',marginBottom:4}}>{s.l}</div>
                <div style={{fontSize:15,fontWeight:800,color:s.c||C.text}}>{s.v}</div>
              </div>
            ))}
          </div>
          <div style={{background:'#f0f9ff',borderRadius:10,padding:'20px',textAlign:'center',color:C.blue}}>
            <div style={{fontSize:32,marginBottom:8}}>🗺️</div>
            <div style={{fontSize:13,fontWeight:700}}>Carte de tracé GPS disponible dans l'onglet Carte Live</div>
            <div style={{marginTop:10}}><Btn label="Voir sur la carte" onClick={()=>navigate('/pointage/map')} variant="ghost" sm/></div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  PAGE PLANNING / SHIFTS
// ═══════════════════════════════════════════════════════════════════
const PagePlanning = ({shifts, setShifts, navigate}) => {
  const [filtre, setFiltre] = useState('tous');
  const [showNew, setShowNew] = useState(false);
  const [newShift, setNewShift] = useState({jobId:'',jobName:'',technicienId:'',zone:'',dateDebut:'',dateFin:'',heureDebut:'07:00',heureFin:'17:00',description:'',instructions:'',priority:'medium'});

  const JOBS_LIST = [
    {id:'JOB-001',name:'Installation 5G NR DLA-001'},{id:'JOB-002',name:'Maintenance 4G LTE YDE-001'},
    {id:'JOB-003',name:'Infrastructure GAR-001'},{id:'JOB-004',name:'Fibre Optique BFN-001'},
  ];

  const filtered = shifts.filter(s=>filtre==='tous'||s.statut===filtre);
  const STATUTS = [{v:'tous',l:'Tous'},{v:'assigned',l:'Assignés'},{v:'in_progress',l:'En cours'},{v:'completed',l:'Terminés'},{v:'validated',l:'Validés'}];

  const saveShift = () => {
    if(!newShift.technicienId||!newShift.dateDebut){alert('Technicien et date obligatoires');return;}
    const tech=getEmp(newShift.technicienId);
    const job=JOBS_LIST.find(j=>j.id===newShift.jobId);
    const s={id:'SH-'+Date.now(),statut:'assigned',chefProjetId:'EI-001',chefProjetNom:'Marie Kamga',technicienNom:tech?.nom||'',jobName:job?.name||newShift.jobName,zoneName:ZONES[newShift.zone]?.nom||'',createdAt:new Date().toISOString(),...newShift};
    setShifts(p=>[s,...p]);
    setShowNew(false);
    setNewShift({jobId:'',jobName:'',technicienId:'',zone:'',dateDebut:'',dateFin:'',heureDebut:'07:00',heureFin:'17:00',description:'',instructions:'',priority:'medium'});
  };

  return(
    <div style={{animation:'slideIn .25s ease'}}>
      <div style={{display:'flex',gap:10,marginBottom:16,alignItems:'center',flexWrap:'wrap'}}>
        <div style={{display:'flex',gap:1,background:C.white,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden'}}>
          {STATUTS.map(s=>(
            <button key={s.v} onClick={()=>setFiltre(s.v)}
              style={{padding:'8px 14px',border:'none',background:filtre===s.v?C.blue:'transparent',color:filtre===s.v?'white':C.gray,fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
              {s.l}
            </button>
          ))}
        </div>
        <div style={{marginLeft:'auto'}}><Btn label="+ Nouveau shift" onClick={()=>setShowNew(true)} variant="primary" icon="📅"/></div>
      </div>

      {/* Modal nouveau shift */}
      {showNew&&(
        <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20,backdropFilter:'blur(4px)'}}>
          <div style={{background:C.white,borderRadius:16,width:'100%',maxWidth:560,boxShadow:'0 24px 64px rgba(0,0,0,.25)',overflow:'hidden',maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{background:'linear-gradient(135deg,#0f172a,#1e40af)',padding:'18px 24px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:16,fontWeight:800,color:'white'}}>📅 Nouveau shift / Mission</div>
              <button onClick={()=>setShowNew(false)} style={{width:30,height:30,borderRadius:8,background:'rgba(255,255,255,.15)',border:'none',color:'white',cursor:'pointer',fontSize:18}}>×</button>
            </div>
            <div style={{padding:24}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                {[
                  {l:'Job / Projet *',type:'sel',key:'jobId',opts:JOBS_LIST.map(j=>({v:j.id,l:j.name})),onChg:v=>{const j=JOBS_LIST.find(x=>x.id===v);setNewShift(p=>({...p,jobId:v,jobName:j?.name||''}));}},
                  {l:'Technicien *',type:'sel',key:'technicienId',opts:TECHNICIENS.map(t=>({v:t.id,l:t.nom+' — '+t.poste})),onChg:v=>setNewShift(p=>({...p,technicienId:v}))},
                  {l:'Zone / Site *',type:'sel',key:'zone',opts:Object.entries(ZONES).filter(([,v])=>v.type==='site').map(([k,v])=>({v:k,l:v.nom})),onChg:v=>setNewShift(p=>({...p,zone:v}))},
                  {l:'Priorité',type:'sel',key:'priority',opts:[{v:'urgent',l:'🔴 Urgent'},{v:'high',l:'🟠 Haute'},{v:'medium',l:'🟡 Moyenne'},{v:'low',l:'🟢 Basse'}],onChg:v=>setNewShift(p=>({...p,priority:v}))},
                  {l:'Date début *',type:'date',key:'dateDebut'},
                  {l:'Date fin *',type:'date',key:'dateFin'},
                  {l:'Heure début',type:'time',key:'heureDebut'},
                  {l:'Heure fin',type:'time',key:'heureFin'},
                ].map(f=>(
                  <div key={f.key}>
                    <label style={{fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:.4,display:'block',marginBottom:5}}>{f.l}</label>
                    {f.type==='sel'?(
                      <select value={newShift[f.key]} onChange={e=>f.onChg?f.onChg(e.target.value):setNewShift(p=>({...p,[f.key]:e.target.value}))}
                        style={{width:'100%',padding:'9px 11px',borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:12,color:C.text,background:'#f9fafb',fontFamily:'inherit'}}>
                        <option value=''>Sélectionner...</option>
                        {f.opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
                      </select>
                    ):(
                      <input type={f.type} value={newShift[f.key]} onChange={e=>setNewShift(p=>({...p,[f.key]:e.target.value}))}
                        style={{width:'100%',padding:'9px 11px',borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:12,color:C.text,background:'#f9fafb',fontFamily:'inherit'}}/>
                    )}
                  </div>
                ))}
                <div style={{gridColumn:'1/-1'}}>
                  <label style={{fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:.4,display:'block',marginBottom:5}}>Description</label>
                  <textarea value={newShift.description} onChange={e=>setNewShift(p=>({...p,description:e.target.value}))} rows={2} placeholder="Description de la mission..."
                    style={{width:'100%',padding:'9px 11px',borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:12,resize:'none',fontFamily:'inherit'}}/>
                </div>
                <div style={{gridColumn:'1/-1'}}>
                  <label style={{fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:.4,display:'block',marginBottom:5}}>Instructions spéciales</label>
                  <textarea value={newShift.instructions} onChange={e=>setNewShift(p=>({...p,instructions:e.target.value}))} rows={2} placeholder="Instructions pour le technicien..."
                    style={{width:'100%',padding:'9px 11px',borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:12,resize:'none',fontFamily:'inherit'}}/>
                </div>
              </div>
              <div style={{display:'flex',gap:10,marginTop:20}}>
                <Btn label="Annuler" onClick={()=>setShowNew(false)} variant="light" full/>
                <Btn label="✓ Créer le shift et notifier" onClick={saveShift} variant="primary" full/>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {filtered.length===0&&<div style={{background:C.white,borderRadius:12,padding:'40px',textAlign:'center',color:C.text4,border:`1px solid ${C.border}`}}>Aucun shift</div>}
        {filtered.map(s=>{
          const tech=getEmp(s.technicienId);
          const chef=getEmp(s.chefProjetId);
          return(
            <div key={s.id} onClick={()=>navigate('/pointage/planning/'+s.id)}
              style={{background:C.white,borderRadius:12,border:`1px solid ${s.statut==='in_progress'?C.green_m:s.priority==='urgent'?C.red_m:C.border}`,padding:'16px 20px',cursor:'pointer',transition:'all .15s',boxShadow:C.shadow}}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow=C.shadow2;}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow=C.shadow;}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <Av i={tech?.avatar||'?'} color={tech?.couleur||C.gray} size={40}/>
                  <div>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                      <span style={{fontSize:14,fontWeight:800,color:C.text}}>{tech?.nom||s.technicienId}</span>
                      <PriorityBadge priority={s.priority}/>
                      <ShiftBadge statut={s.statut}/>
                    </div>
                    <div style={{fontSize:12,color:C.text3}}>{s.jobName}</div>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.text}}>{s.dateDebut} → {s.dateFin}</div>
                  <div style={{fontSize:11,color:C.text3}}>{s.heureDebut} – {s.heureFin}</div>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                <div style={{background:'#f8fafc',borderRadius:8,padding:'7px 10px'}}>
                  <div style={{fontSize:9,color:C.text4,textTransform:'uppercase',marginBottom:2}}>Zone</div>
                  <div style={{fontSize:11,fontWeight:700,color:C.text}}>{ZONES[s.zone]?.nom||s.zone}</div>
                </div>
                <div style={{background:'#f8fafc',borderRadius:8,padding:'7px 10px'}}>
                  <div style={{fontSize:9,color:C.text4,textTransform:'uppercase',marginBottom:2}}>Chef projet</div>
                  <div style={{fontSize:11,fontWeight:700,color:C.text}}>{chef?.nom||s.chefProjetNom}</div>
                </div>
                <div style={{background:'#f8fafc',borderRadius:8,padding:'7px 10px'}}>
                  <div style={{fontSize:9,color:C.text4,textTransform:'uppercase',marginBottom:2}}>ID Shift</div>
                  <div style={{fontSize:11,fontWeight:700,color:C.text,fontFamily:'monospace'}}>{s.id}</div>
                </div>
              </div>
              {s.description&&<div style={{marginTop:8,fontSize:12,color:C.text3,padding:'8px 10px',background:'#f8fafc',borderRadius:8}}>{s.description}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  PAGE DÉTAIL SHIFT
// ═══════════════════════════════════════════════════════════════════
const PageShiftDetail = ({shifts, setShifts, presences, navigate}) => {
  const {shiftId} = useParams();
  const shift = shifts.find(s=>s.id===shiftId);
  if(!shift) return <div style={{padding:'40px',textAlign:'center',color:C.text4}}>Shift introuvable <Btn label="Retour" onClick={()=>navigate('/pointage/planning')} sm/></div>;

  const tech = getEmp(shift.technicienId);
  const chef = getEmp(shift.chefProjetId);
  const presence = presences.find(p=>p.userId===shift.technicienId);

  const updateStatut = (statut) => {
    setShifts(p=>p.map(s=>s.id===shiftId?{...s,statut}:s));
  };

  return(
    <div style={{animation:'slideIn .25s ease'}}>
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:16,fontSize:12,color:C.text3}}>
        <span style={{cursor:'pointer',color:C.blue}} onClick={()=>navigate('/pointage/planning')}>Planning</span>
        <span>/</span>
        <span style={{fontWeight:700,color:C.text}}>{shift.id}</span>
      </div>

      <div style={{background:'linear-gradient(135deg,#0f172a,#1e3a5f)',borderRadius:16,padding:'24px 28px',marginBottom:20}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
              <PriorityBadge priority={shift.priority}/>
              <ShiftBadge statut={shift.statut}/>
              <span style={{fontSize:11,color:'#64748b',fontFamily:'monospace'}}>{shift.id}</span>
            </div>
            <div style={{fontSize:20,fontWeight:900,color:'white',marginBottom:4}}>{shift.jobName}</div>
            <div style={{fontSize:13,color:'#94a3b8'}}>{ZONES[shift.zone]?.nom||shift.zone} · {shift.dateDebut} → {shift.dateFin}</div>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {shift.statut==='assigned'&&<Btn label="▶ Démarrer" onClick={()=>updateStatut('in_progress')} variant="success" sm/>}
            {shift.statut==='in_progress'&&<Btn label="✓ Marquer terminé" onClick={()=>updateStatut('completed')} variant="primary" sm/>}
            {shift.statut==='completed'&&<Btn label="✅ Valider" onClick={()=>updateStatut('validated')} variant="success" sm/>}
            {['assigned','in_progress'].includes(shift.statut)&&<Btn label="✕ Annuler" onClick={()=>updateStatut('cancelled')} variant="danger" sm/>}
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <div style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,padding:'20px'}}>
          <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:14}}>Technicien assigné</div>
          {tech&&(
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14,cursor:'pointer'}} onClick={()=>navigate('/pointage/employes/'+tech.id)}>
              <Av i={tech.avatar} color={tech.couleur} size={48} online={presence?.present}/>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:C.text}}>{tech.nom}</div>
                <div style={{fontSize:12,color:C.text3}}>{tech.poste}</div>
                <div style={{fontSize:11,color:C.blue}}>{tech.email}</div>
              </div>
            </div>
          )}
          {presence&&(
            <div style={{padding:'10px 12px',borderRadius:9,background:presence.horsZone?C.red_l:C.green_l,border:`1px solid ${presence.horsZone?C.red_m:C.green_m}`}}>
              <div style={{fontSize:12,fontWeight:700,color:presence.horsZone?C.red:C.green}}>
                {presence.present?(presence.horsZone?'⚠ Hors périmètre — '+presence.dist+'m':'✅ Sur zone — '+presence.dist+'m'):'⚫ Non pointé'}
              </div>
              {presence.present&&<div style={{fontSize:10,color:C.text3,marginTop:2}}>Depuis {fmtTime(presence.entree)} · 🔋 {presence.battery}%</div>}
            </div>
          )}
        </div>

        <div style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,padding:'20px'}}>
          <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:14}}>Détails du shift</div>
          {[
            {l:'Job',           v:shift.jobName},
            {l:'Zone / Site',   v:ZONES[shift.zone]?.nom||shift.zone},
            {l:'Période',       v:`${shift.dateDebut} → ${shift.dateFin}`},
            {l:'Horaires',      v:`${shift.heureDebut} – ${shift.heureFin}`},
            {l:'Chef de projet',v:chef?.nom||shift.chefProjetNom},
            {l:'Statut',        v:<ShiftBadge statut={shift.statut}/>},
          ].map(item=>(
            <div key={item.l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:`1px solid ${C.border2}`,alignItems:'center'}}>
              <span style={{fontSize:12,color:C.text3}}>{item.l}</span>
              <span style={{fontSize:12,fontWeight:600,color:C.text}}>{item.v}</span>
            </div>
          ))}
        </div>
      </div>

      {(shift.description||shift.instructions)&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          {shift.description&&(
            <div style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,padding:'16px 20px'}}>
              <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:8}}>Description</div>
              <div style={{fontSize:13,color:C.text2,lineHeight:1.6}}>{shift.description}</div>
            </div>
          )}
          {shift.instructions&&(
            <div style={{background:C.orange_l,borderRadius:12,border:`1px solid ${C.orange_m}`,padding:'16px 20px'}}>
              <div style={{fontSize:13,fontWeight:800,color:C.orange,marginBottom:8}}>⚠ Instructions spéciales</div>
              <div style={{fontSize:13,color:C.text2,lineHeight:1.6}}>{shift.instructions}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  PAGE ALERTES
// ═══════════════════════════════════════════════════════════════════
const PageAlertes = ({alertes, setAlertes}) => {
  const [filtre, setFiltre] = useState('tous');

  const ICONS = {hors_zone:'📍',retard:'⏰',absence:'❌',batterie:'🔋',offline:'📵'};
  const SEV_COLORS = {critical:{c:C.red,bg:C.red_l},high:{c:C.orange,bg:C.orange_l},medium:{c:C.yellow,bg:C.yellow_l},low:{c:C.green,bg:C.green_l}};

  const filtered = alertes.filter(a=>filtre==='tous'||a.statut===filtre);

  const ack = (id) => setAlertes(p=>p.map(a=>a.id===id?{...a,statut:'acknowledged'}:a));
  const resolve = (id) => setAlertes(p=>p.map(a=>a.id===id?{...a,statut:'resolved'}:a));

  return(
    <div style={{animation:'slideIn .25s ease'}}>
      <div style={{display:'flex',gap:10,marginBottom:16,alignItems:'center'}}>
        <div style={{display:'flex',gap:1,background:C.white,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden'}}>
          {[{v:'tous',l:'Toutes'},{v:'open',l:'🔴 Ouvertes'},{v:'acknowledged',l:'🟡 Traitées'},{v:'resolved',l:'🟢 Résolues'}].map(f=>(
            <button key={f.v} onClick={()=>setFiltre(f.v)}
              style={{padding:'8px 14px',border:'none',background:filtre===f.v?C.navy:'transparent',color:filtre===f.v?'white':C.gray,fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
              {f.l}
            </button>
          ))}
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:6}}>
          <Badge label={`${alertes.filter(a=>a.statut==='open').length} ouvertes`} color={C.red} bg={C.red_l}/>
        </div>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {filtered.length===0&&<div style={{background:C.white,borderRadius:12,padding:'40px',textAlign:'center',color:C.text4,border:`1px solid ${C.border}`}}>✅ Aucune alerte</div>}
        {filtered.map(a=>{
          const emp=getEmp(a.userId);
          const sev=SEV_COLORS[a.severite]||SEV_COLORS.medium;
          return(
            <div key={a.id} style={{background:C.white,borderRadius:12,border:`1px solid ${a.statut==='open'?sev.bg:C.border}`,padding:'16px 20px',boxShadow:C.shadow,borderLeft:`4px solid ${sev.c}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:36,height:36,borderRadius:10,background:sev.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{ICONS[a.type]||'⚠️'}</div>
                  <div>
                    <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
                      <Badge label={a.severite==='critical'?'🔴 Critique':a.severite==='high'?'🟠 Haute':a.severite==='medium'?'🟡 Moyenne':'🟢 Basse'} color={sev.c} bg={sev.bg}/>
                      <Badge label={a.statut==='open'?'Ouverte':a.statut==='acknowledged'?'Traitée':'Résolue'} color={a.statut==='open'?C.red:a.statut==='acknowledged'?C.orange:C.green} bg={a.statut==='open'?C.red_l:a.statut==='acknowledged'?C.orange_l:C.green_l}/>
                    </div>
                  </div>
                </div>
                <span style={{fontSize:11,color:C.text4}}>{fmtTime(a.heure)}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                {emp&&<Av i={emp.avatar} color={emp.couleur} size={30}/>}
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:C.text}}>{emp?.nom||a.userId}</div>
                  <div style={{fontSize:12,color:C.text3}}>{a.message}</div>
                </div>
              </div>
              {a.statut==='open'&&(
                <div style={{display:'flex',gap:8}}>
                  <Btn label="✓ Prendre en charge" onClick={()=>ack(a.id)} variant="primary" sm/>
                  <Btn label="✅ Marquer résolu" onClick={()=>resolve(a.id)} variant="success" sm/>
                  <Btn label="📞 Contacter" onClick={()=>{}} variant="light" sm/>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  PAGE APPROBATIONS
// ═══════════════════════════════════════════════════════════════════
const PageApprobations = ({historique, setHistorique}) => {
  const pending = historique.filter(h=>!h.valide);

  const approve = (id) => setHistorique(p=>p.map(h=>h.id===id?{...h,valide:true}:h));
  const reject  = (id) => setHistorique(p=>p.filter(h=>h.id!==id));

  return(
    <div style={{animation:'slideIn .25s ease'}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
        <div style={{fontSize:14,fontWeight:800,color:C.text}}>Approbations en attente</div>
        <Badge label={`${pending.length} pointage(s)`} color={C.orange} bg={C.orange_l}/>
      </div>

      {pending.length===0&&(
        <div style={{background:C.white,borderRadius:12,padding:'60px',textAlign:'center',border:`1px solid ${C.border}`}}>
          <div style={{fontSize:48,marginBottom:12}}>✅</div>
          <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:4}}>Tout est à jour</div>
          <div style={{fontSize:13,color:C.text3}}>Aucun pointage en attente d'approbation</div>
        </div>
      )}

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {historique.map((h,i)=>{
          const emp=getEmp(h.userId);
          return(
            <div key={h.id} style={{background:C.white,borderRadius:12,border:`1px solid ${!h.valide?C.orange_m:C.border}`,padding:'14px 18px',boxShadow:C.shadow}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                {emp&&<Av i={emp.avatar} color={emp.couleur} size={36}/>}
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                    <span style={{fontSize:13,fontWeight:700,color:C.text}}>{emp?.nom||h.userId}</span>
                    <Badge label={h.type==='entree'?'▶ Entrée':h.type==='sortie'?'⏹ Sortie':'⏸ Pause'} color={h.type==='entree'?C.green:h.type==='sortie'?C.red:C.blue} bg={h.type==='entree'?C.green_l:h.type==='sortie'?C.red_l:C.blue_l}/>
                    {h.horsZone&&<Badge label="⚠ Hors zone" color={C.red} bg={C.red_l}/>}
                    {h.selfie&&<Badge label="📷 Selfie" color={C.green} bg={C.green_l}/>}
                  </div>
                  <div style={{fontSize:11,color:C.text3}}>{ZONES[h.zone]?.nom||h.zone} · {fmtDate2(h.heure)} {fmtTime(h.heure)} · {h.dist}m du périmètre</div>
                </div>
                <div style={{display:'flex',gap:6}}>
                  {!h.valide?(
                    <>
                      <Btn label="✓ Approuver" onClick={()=>approve(h.id)} variant="success" sm/>
                      <Btn label="✕ Rejeter" onClick={()=>reject(h.id)} variant="danger" sm/>
                    </>
                  ):<Badge label="✓ Validé" color={C.green} bg={C.green_l}/>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  PAGE QR CODES
// ═══════════════════════════════════════════════════════════════════
const PageQRCodes = () => {
  const [section, setSection] = useState('internes');
  return(
    <div style={{animation:'slideIn .25s ease'}}>
      <div style={{display:'flex',gap:1,background:C.white,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden',marginBottom:20,display:'inline-flex'}}>
        {[{v:'internes',l:'🏢 Employés internes'},{v:'sites',l:'📍 Sites terrain'}].map(s=>(
          <button key={s.v} onClick={()=>setSection(s.v)}
            style={{padding:'9px 20px',border:'none',background:section===s.v?C.blue:'transparent',color:section===s.v?'white':C.gray,fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
            {s.l}
          </button>
        ))}
      </div>

      {section==='internes'&&(
        <div>
          <div style={{background:C.blue_l,borderRadius:10,padding:'12px 16px',marginBottom:20,fontSize:12,color:'#1e40af',fontWeight:600}}>
            ℹ️ Chaque employé interne possède un QR code <strong>personnel et nominatif</strong>. Il le scanne à son arrivée et départ du bureau. Le système récupère automatiquement les coordonnées GPS du téléphone.
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:16}}>
            {EMPLOYES_INTERNES.map(emp=>(
              <div key={emp.id} style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:'20px',textAlign:'center',boxShadow:C.shadow}}>
                <Av i={emp.avatar} color={emp.couleur} size={48}/>
                <div style={{fontSize:14,fontWeight:800,color:C.text,margin:'10px 0 2px'}}>{emp.nom}</div>
                <div style={{fontSize:11,color:C.text3,marginBottom:4}}>{emp.poste}</div>
                <Badge label={emp.dept} color={C.blue} bg={C.blue_l}/>
                <div style={{margin:'14px 0'}}><QRCode value={emp.qr} size={150}/></div>
                <div style={{fontSize:9,color:C.text4,fontFamily:'monospace',marginBottom:4}}>{emp.qr}</div>
                <div style={{fontSize:11,padding:'5px 8px',borderRadius:7,background:C.blue_l,color:C.blue,fontWeight:600,marginBottom:12}}>
                  📍 {ZONES[emp.zone]?.nom}
                </div>
                <Btn label="🖨 Imprimer" onClick={()=>window.print()} variant="primary" full sm/>
              </div>
            ))}
          </div>
        </div>
      )}

      {section==='sites'&&(
        <div>
          <div style={{background:C.orange_l,borderRadius:10,padding:'12px 16px',marginBottom:20,fontSize:12,color:'#9a3412',fontWeight:600}}>
            📍 Ces QR codes sont <strong>affichés physiquement sur chaque site</strong>. Quand un technicien scanne, l'app CleanITCam vérifie automatiquement sa position GPS et prend un selfie de vérification.
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:16}}>
            {Object.entries(ZONES).filter(([,v])=>v.type==='site').map(([key,zone])=>(
              <div key={key} style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:'20px',textAlign:'center',boxShadow:C.shadow}}>
                <div style={{width:48,height:48,borderRadius:14,background:zone.couleur,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:22,margin:'0 auto 10px'}}>📍</div>
                <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:2}}>{zone.nom}</div>
                <div style={{fontSize:11,color:C.text3,marginBottom:10}}>{zone.adresse}</div>
                <div style={{margin:'12px 0'}}><QRCode value={`CLEANIT-SITE-${key}`} size={150}/></div>
                <div style={{fontSize:9,color:C.text4,fontFamily:'monospace',marginBottom:4}}>CLEANIT-SITE-{key}</div>
                <div style={{fontSize:11,padding:'5px 8px',borderRadius:7,background:C.orange_l,color:C.orange,fontWeight:600,marginBottom:4}}>Rayon: {zone.rayon}m</div>
                <div style={{fontSize:10,color:C.text4,fontFamily:'monospace',marginBottom:12}}>{zone.lat.toFixed(4)}°N, {zone.lng.toFixed(4)}°E</div>
                <Btn label="🖨 Imprimer" onClick={()=>window.print()} variant="primary" full sm/>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  PAGE RAPPORTS
// ═══════════════════════════════════════════════════════════════════
const PageRapports = ({presences, historique, shifts, alertes}) => {
  const presents = presences.filter(p=>p.present).length;
  const txPresence = Math.round(presents/presences.length*100);

  return(
    <div style={{animation:'slideIn .25s ease'}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
        <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:'20px',boxShadow:C.shadow}}>
          <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:16}}>Résumé — Mai 2024</div>
          {[
            {l:'Employés suivis',       v:presences.length,         c:C.blue},
            {l:'Présents aujourd\'hui', v:presents,                 c:C.green},
            {l:'Taux de présence',      v:`${txPresence}%`,         c:txPresence>80?C.green:C.orange},
            {l:'Alertes ce mois',       v:alertes.length,           c:alertes.filter(a=>a.statut==='open').length>0?C.red:C.green},
            {l:'Shifts planifiés',      v:shifts.length,            c:C.blue},
            {l:'Shifts validés',        v:shifts.filter(s=>s.statut==='validated').length, c:C.green},
            {l:'Total pointages',       v:historique.length,        c:C.purple},
            {l:'Hors zone détectés',    v:historique.filter(h=>h.horsZone).length, c:C.red},
          ].map((item,i,arr)=>(
            <div key={item.l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:i<arr.length-1?`1px solid ${C.border2}`:0}}>
              <span style={{fontSize:12,color:C.text2}}>{item.l}</span>
              <span style={{fontSize:16,fontWeight:800,color:item.c}}>{item.v}</span>
            </div>
          ))}
        </div>
        <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:'20px',boxShadow:C.shadow}}>
          <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:16}}>Exports disponibles</div>
          {[
            {l:'Rapport de présence mensuel',   icon:'📊', desc:'Excel — toutes les présences, heures'},
            {l:'Feuilles de temps par employé', icon:'📋', desc:'PDF — timeline individuelle'},
            {l:'Rapport géofencing',            icon:'📍', desc:'Alertes hors zone, tracés GPS'},
            {l:'Planning techniciens',           icon:'📅', desc:'Shifts par période, par zone'},
            {l:'Export paie',                   icon:'💰', desc:'Heures validées pour calcul salaires'},
            {l:'Rapport sécurité HSE',          icon:'🦺', desc:'Incidents, présences sites à risque'},
            {l:'Rapport direction DRH',         icon:'📁', desc:'Synthèse exécutive mensuelle'},
          ].map(r=>(
            <div key={r.l} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:`1px solid ${C.border2}`,cursor:'pointer'}}
              onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={{width:36,height:36,borderRadius:10,background:C.blue_l,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{r.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>{r.l}</div>
                <div style={{fontSize:11,color:C.text4}}>{r.desc}</div>
              </div>
              <Btn label="Exporter" onClick={()=>{}} variant="ghost" sm/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
export default function Pointage() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const params     = useParams();
  const loc        = location.pathname;

  const [presences,  setPresences]  = useState(SEED_PRESENCES);
  const [historique, setHistorique] = useState(SEED_HISTORIQUE);
  const [shifts,     setShifts]     = useState(SEED_SHIFTS);
  const [alertes,    setAlertes]    = useState(SEED_ALERTES);
  const [now,        setNow]        = useState(new Date());

  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),1000); return()=>clearInterval(t); },[]);

  const openAlerts = alertes.filter(a=>a.statut==='open').length;

  const commonProps = {presences,setPresences,historique,setHistorique,shifts,setShifts,alertes,setAlertes,now,navigate,params};

  // Routing
  const getPage = () => {
    if(loc.match(/\/pointage\/employes\/(.+)/)) return <PageEmployeDetail {...commonProps}/>;
    if(loc.includes('/employes'))               return <PageEmployes {...commonProps}/>;
    if(loc.match(/\/pointage\/planning\/(.+)/)) return <PageShiftDetail {...commonProps}/>;
    if(loc.includes('/planning'))               return <PagePlanning {...commonProps}/>;
    if(loc.includes('/map'))                    return <PageMap {...commonProps}/>;
    if(loc.includes('/historique'))             return <PageHistorique {...commonProps}/>;
    if(loc.includes('/alertes'))                return <PageAlertes {...commonProps}/>;
    if(loc.includes('/approbations'))           return <PageApprobations {...commonProps}/>;
    if(loc.includes('/qrcodes'))                return <PageQRCodes {...commonProps}/>;
    if(loc.includes('/rapports'))               return <PageRapports {...commonProps}/>;
    return <PageDashboard {...commonProps}/>;
  };

  return(
    <div style={{minHeight:'100vh',background:C.bg,fontFamily:"'Segoe UI',system-ui,Arial,sans-serif"}}>
      <style>{`
        @keyframes slideIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:.8}100%{transform:scale(1.4);opacity:0}}
        @keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:.3}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}
      `}</style>

      <PointageNav alertCount={openAlerts} presences={presences}/>

      <div style={{maxWidth:1400,margin:'0 auto',padding:'24px 24px'}}>
        {getPage()}
      </div>
    </div>
  );
}

// Page historique (composant séparé pour clarté)
const PageHistorique = ({historique, setHistorique, navigate}) => {
  const [search, setSearch] = useState('');
  const [filtre, setFiltre] = useState('tous');

  const filtered = historique.filter(h=>{
    const emp=getEmp(h.userId);
    const ms=!search||(emp?.nom||h.userId).toLowerCase().includes(search.toLowerCase());
    const mf=filtre==='tous'||h.type===filtre||(filtre==='hors_zone'&&h.horsZone);
    return ms&&mf;
  });

  return(
    <div style={{animation:'slideIn .25s ease'}}>
      <div style={{display:'flex',gap:10,marginBottom:16,alignItems:'center',flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,background:C.white,borderRadius:10,padding:'8px 13px',border:`1px solid ${C.border}`,flex:1,maxWidth:280}}>
          <span style={{color:C.text4}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
            style={{flex:1,border:'none',outline:'none',fontSize:13,fontFamily:'inherit'}}/>
        </div>
        <div style={{display:'flex',gap:1,background:C.white,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden'}}>
          {[{v:'tous',l:'Tous'},{v:'entree',l:'▶ Entrées'},{v:'sortie',l:'⏹ Sorties'},{v:'hors_zone',l:'⚠ Hors zone'}].map(f=>(
            <button key={f.v} onClick={()=>setFiltre(f.v)}
              style={{padding:'8px 12px',border:'none',background:filtre===f.v?C.blue:'transparent',color:filtre===f.v?'white':C.gray,fontWeight:700,fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>
              {f.l}
            </button>
          ))}
        </div>
      </div>

      <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,overflow:'hidden',boxShadow:C.shadow}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:800}}>
            <thead>
              <tr style={{background:'#f8fafc',borderBottom:`2px solid ${C.border}`}}>
                {['Employé','Type','Action','Zone','Distance','Selfie','Heure','Statut','Actions'].map(h=>(
                  <th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:10,fontWeight:800,color:C.text3,textTransform:'uppercase',letterSpacing:.5,whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={9} style={{padding:'40px',textAlign:'center',color:C.text4}}>Aucun pointage</td></tr>}
              {filtered.map((h,i)=>{
                const emp=getEmp(h.userId);
                return(
                  <tr key={h.id} style={{borderBottom:`1px solid ${C.border2}`,background:i%2===0?C.white:'#fafafa',cursor:'pointer',transition:'background .1s'}}
                    onMouseEnter={e=>e.currentTarget.style.background=C.blue_l}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===0?C.white:'#fafafa'}
                    onClick={()=>navigate('/pointage/employes/'+h.userId)}>
                    <td style={{padding:'11px 14px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        {emp&&<Av i={emp.avatar} color={emp.couleur} size={28}/>}
                        <div>
                          <div style={{fontSize:12,fontWeight:700,color:C.text}}>{emp?.nom||h.userId}</div>
                          <div style={{fontSize:10,color:C.text4}}>{emp?.poste}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:'11px 14px'}}><Badge label={emp?.typeEmploye==='interne'?'🏢':'🔧'} color={emp?.typeEmploye==='interne'?C.blue:C.orange} bg={emp?.typeEmploye==='interne'?C.blue_l:C.orange_l}/></td>
                    <td style={{padding:'11px 14px'}}><Badge label={h.type==='entree'?'▶ Entrée':h.type==='sortie'?'⏹ Sortie':'⏸ Pause'} color={h.type==='entree'?C.green:h.type==='sortie'?C.red:C.blue} bg={h.type==='entree'?C.green_l:h.type==='sortie'?C.red_l:C.blue_l}/></td>
                    <td style={{padding:'11px 14px',fontSize:12,color:C.text2}}>{ZONES[h.zone]?.nom||h.zone}</td>
                    <td style={{padding:'11px 14px'}}><span style={{fontSize:12,fontWeight:700,color:h.horsZone?C.red:C.green}}>{h.horsZone?'⚠ ':''}{h.dist}m</span></td>
                    <td style={{padding:'11px 14px'}}>{h.selfie?<Badge label="📷 OK" color={C.green} bg={C.green_l}/>:<span style={{color:C.text4,fontSize:11}}>—</span>}</td>
                    <td style={{padding:'11px 14px',fontSize:12,color:C.text2,whiteSpace:'nowrap'}}>{fmtDate2(h.heure)} {fmtTime(h.heure)}</td>
                    <td style={{padding:'11px 14px'}}><Badge label={h.valide?'✓ Validé':'⏳ Attente'} color={h.valide?C.green:C.orange} bg={h.valide?C.green_l:C.orange_l}/></td>
                    <td style={{padding:'11px 14px'}} onClick={e=>e.stopPropagation()}>
                      <div style={{display:'flex',gap:4}}>
                        <button style={{padding:'4px 8px',borderRadius:6,border:`1px solid ${C.border}`,background:'white',cursor:'pointer',fontSize:11,color:C.blue,fontWeight:700}} onClick={()=>navigate('/pointage/employes/'+h.userId)}>Voir</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{background:'#f8fafc',borderTop:`2px solid ${C.border}`}}>
                <td colSpan={9} style={{padding:'10px 14px',fontSize:12,color:C.text3}}>
                  {filtered.length} pointage(s) · {filtered.filter(h=>h.horsZone).length} hors zone · {filtered.filter(h=>!h.valide).length} en attente
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
