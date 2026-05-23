import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

// ═══════════════════════════════════════════════════════════════════
//  CLEANIT COMM — Style WeLink Huawei
//  Layout: IconNav | ListPanel | ContentArea | ContextPanel
// ═══════════════════════════════════════════════════════════════════

// ── Palette ────────────────────────────────────────────────────────
const SECTION_THEME = {
  chat:     {primary:'#185FA5',light:'#E6F1FB',grad:'linear-gradient(135deg,#185FA5 0%,#2563eb 100%)'},
  reunions: {primary:'#6D28D9',light:'#EDE9FE',grad:'linear-gradient(135deg,#6D28D9 0%,#8b5cf6 100%)'},
  email:    {primary:'#0D9488',light:'#CCFBF1',grad:'linear-gradient(135deg,#0D9488 0%,#14b8a6 100%)'},
  drive:    {primary:'#D97706',light:'#FEF3C7',grad:'linear-gradient(135deg,#B45309 0%,#f59e0b 100%)'},
  contacts: {primary:'#0F7B3C',light:'#D1FAE5',grad:'linear-gradient(135deg,#0F7B3C 0%,#22c55e 100%)'},
};

const P = {
  // Sidebar icons
  sidebarBg:  '#0f172a',
  sidebarAct: '#16213e',
  iconDef:    '#6b7280',
  iconAct:    '#2563eb',
  // List panel
  listBg:     '#ffffff',
  listBorder: '#f0f2f5',
  listHov:    '#f5f7fa',
  listAct:    '#e8f0fe',
  // Content
  contentBg:  '#f5f7fa',
  msgMeBg:    '#2563eb',
  msgMeText:  '#ffffff',
  msgOtherBg: '#ffffff',
  msgOtherText:'#1f2937',
  // Right panel
  rightBg:    '#ffffff',
  // Common
  blue:       '#2563eb',
  blue_l:     '#eff6ff',
  green:      '#22c55e',
  red:        '#ef4444',
  orange:     '#f97316',
  yellow:     '#eab308',
  purple:     '#8b5cf6',
  gray:       '#6b7280',
  text:       '#1f2937',
  text2:      '#374151',
  text3:      '#6b7280',
  text4:      '#9ca3af',
  border:     '#e5e7eb',
  white:      '#ffffff',
  shadow:     '0 1px 3px rgba(0,0,0,.08)',
  shadow2:    '0 4px 20px rgba(0,0,0,.12)',
};

// ── Icônes SVG propres (pas d'emojis) ───────────────────────────────
const Icon = ({name, size=20, color='currentColor', active=false}) => {
  const c = active ? P.iconAct : color;
  const icons = {
    chat:      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>,
    meeting:   <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>,
    email:     <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>,
    drive:     <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>,
    contacts:  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>,
    settings:  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>,
    send:      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>,
    attach:    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>,
    emoji:     <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>,
    search:    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>,
    plus:      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>,
    video:     <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>,
    phone:     <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>,
    pin:       <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>,
    info:      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>,
    file:      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>,
    download:  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>,
    check:     <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>,
    close:     <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>,
    back:      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>,
    grid:      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>,
    list:      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>,
    star:      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>,
    hash:      <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>,
    lock:      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>,
    bell:      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>,
    home:      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>,
  };
  return(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} style={{display:'block',flexShrink:0}}>
      {icons[name]||icons.chat}
    </svg>
  );
};

// ── Données ─────────────────────────────────────────────────────────
const ME = {id:'u1',nom:'Marie Kamga',avatar:'MK',couleur:'#2563eb',poste:'Chef de Projet',photo:'https://i.pravatar.cc/150?img=47'};

const CONTACTS = [
  {id:'u2',nom:'Jean Fouda',    poste:'Project Manager',  dept:'Operations',avatar:'JF',couleur:'#8b5cf6',status:'online', photo:'https://i.pravatar.cc/150?img=12'},
  {id:'u3',nom:'Alice Finance', poste:'Dir. Financière',  dept:'Finance',   avatar:'AF',couleur:'#ec4899',status:'busy',   photo:'https://i.pravatar.cc/150?img=9'},
  {id:'u4',nom:'Bob Comptable', poste:'Chef Comptable',   dept:'Finance',   avatar:'BC',couleur:'#0891b2',status:'offline',photo:'https://i.pravatar.cc/150?img=11'},
  {id:'u5',nom:'Pierre Etoga', poste:'Ingénieur Réseau', dept:'Technique', avatar:'PE',couleur:'#d97706',status:'online', photo:'https://i.pravatar.cc/150?img=15'},
  {id:'u6',nom:'Aline Biya',   poste:'Responsable RH',   dept:'RH',        avatar:'AB',couleur:'#dc2626',status:'online', photo:'https://i.pravatar.cc/150?img=5'},
  {id:'u7',nom:'David Mballa', poste:'Analyste BI',       dept:'Finance',   avatar:'DM',couleur:'#059669',status:'away',   photo:'https://i.pravatar.cc/150?img=22'},
  {id:'u8',nom:'Thomas Ngono', poste:'Technicien',        dept:'Terrain',   avatar:'TN',couleur:'#ea580c',status:'online', photo:'https://i.pravatar.cc/150?img=33'},
];

const CHANNELS = [
  {id:'ch1',nom:'général',         type:'public', unread:3, lastMsg:'Marie: Réunion à 10h ce matin', lastTs:Date.now()-900000,  pinned:true },
  {id:'ch2',nom:'terrain-douala',  type:'public', unread:0, lastMsg:'Thomas: Arrivé sur site DLA-001', lastTs:Date.now()-3600000, pinned:false},
  {id:'ch3',nom:'finance',         type:'private',unread:1, lastMsg:'Alice: Facture payée partiellement', lastTs:Date.now()-1800000, pinned:false},
  {id:'ch4',nom:'chefs-projet',    type:'private',unread:0, lastMsg:'Jean: Rapport prêt', lastTs:Date.now()-7200000, pinned:false},
  {id:'ch5',nom:'alertes-terrain', type:'system', unread:5, lastMsg:'⚠ Ali Moussa hors zone GAR-001', lastTs:Date.now()-600000,  pinned:true },
  {id:'ch6',nom:'annonces',        type:'system', unread:1, lastMsg:'[ANNONCE] Nouvelle politique HSE', lastTs:Date.now()-86400000, pinned:false},
];


const CROSS_NOTIFS = [
  {id:'n1',module:'Approvals',color:'#0F7B3C',msg:'Paiement APV-002 approuvé — Thomas Ngono 6.2M FCFA',ts:Date.now()-1800000,read:false},
  {id:'n2',module:'Pointage', color:'#D97706',msg:'Ali Moussa hors zone GAR-001 depuis 2h',ts:Date.now()-3600000,read:false},
  {id:'n3',module:'Finance',  color:'#185FA5',msg:'Virement VIR-2025-042 effectué — 18.5M FCFA',ts:Date.now()-7200000,read:true},
  {id:'n4',module:'Planning', color:'#6D28D9',msg:'Mission T181 planifiée — Thomas Ngono 19 mai 08h',ts:Date.now()-14400000,read:true},
  {id:'n5',module:'CRM',      color:'#D97706',msg:'Deal MTN Small Cells marqué Gagné — 95M FCFA',ts:Date.now()-86400000,read:true},
];

const NOW = Date.now();
const MSGS = {
  ch1:[
    {id:'m1',uid:'u2',text:'Bonjour équipe ! Réunion de suivi DLA-001 à 10h ce matin.',ts:NOW-7200000,files:[]},
    {id:'m2',uid:'u5',text:'Les équipements 5G sont arrivés sur site. On commence l\'installation ce matin.',ts:NOW-7100000,files:[]},
    {id:'m3',uid:'u1',text:'Parfait Pierre. N\'oubliez pas le rapport photo pour le client Huawei.',ts:NOW-7000000,files:[]},
    {id:'m4',uid:'u8',text:'Selfie de présence envoyé via CleanITCam — vérifiée',ts:NOW-3600000,files:[]},
    {id:'m5',uid:'u3',text:'La facture INV-2024-003 a été partiellement payée. Solde restant : 22.4M FCFA.',ts:NOW-1800000,files:[{name:'INV-2024-003.pdf',size:'890 KB',type:'pdf'}]},
    {id:'m6',uid:'u1',text:'Merci Alice. Je relance le client aujourd\'hui.',ts:NOW-900000,files:[]},
  ],
  ch5:[
    {id:'a1',uid:'system',text:'[ALERTE] Ali Moussa est hors zone sur GAR-001 — Distance: 650m du périmètre autorisé',ts:NOW-7200000,type:'alert',alertType:'danger',files:[]},
    {id:'a2',uid:'system',text:'[BATTERIE] Batterie critique (23%) — Ali Moussa · Site Garoua',ts:NOW-3600000,type:'alert',alertType:'warning',files:[]},
    {id:'a3',uid:'u1',text:'Ali contacté par téléphone. Il retourne dans la zone.',ts:NOW-3000000,files:[]},
    {id:'a4',uid:'system',text:'[RÉSOLU] Ali Moussa est revenu dans la zone autorisée',ts:NOW-2400000,type:'alert',alertType:'success',files:[]},
    {id:'a5',uid:'system',text:'[ALERTE] Thomas Ngono — Sortie momentanée DLA-001 · 45m hors périmètre',ts:NOW-600000,type:'alert',alertType:'warning',files:[]},
  ],
  ch2:[
    {id:'t1',uid:'u8',text:'Arrivé sur site DLA-001. Équipe de 3 présente, météo favorable.',ts:NOW-18000000,files:[]},
    {id:'t2',uid:'u5',text:'Commencé l\'installation BBU 5900. Tout se passe bien.',ts:NOW-14400000,files:[{name:'Photo_BBU_Installation.jpg',size:'2.4 MB',type:'img'}]},
    {id:'t3',uid:'u1',text:'Super ! Continuez. Prenez des photos de chaque étape pour le rapport Huawei.',ts:NOW-10800000,files:[]},
  ],
  ch3:[
    {id:'f1',uid:'u3',text:'La facture INV-2024-002 d\'Orange Cameroun est en retard de 43 jours.',ts:NOW-86400000,files:[]},
    {id:'f2',uid:'u1',text:'Je vais appeler le service comptable Orange demain matin.',ts:NOW-82800000,files:[]},
    {id:'f3',uid:'u3',text:'INV-2024-003 partiellement payée ce matin — 9.6M FCFA reçus.',ts:NOW-1800000,files:[{name:'Virement_TRESOR_001.pdf',size:'340 KB',type:'pdf'}]},
  ],
};

const DRIVE_FILES = {
  ch1:[
    {id:'d1',name:'Rapport_DLA001_Phase1.pdf',  size:'2.4 MB',type:'pdf',  date:NOW-86400000, owner:'u1'},
    {id:'d2',name:'Planning_Mai2024.xlsx',        size:'1.2 MB',type:'excel',date:NOW-172800000,owner:'u2'},
    {id:'d3',name:'Photos_Installation_5G.zip',  size:'45 MB', type:'zip',  date:NOW-259200000,owner:'u8'},
    {id:'d4',name:'BC-2024-143_Confidentiel.pdf',size:'4.1 MB',type:'pdf',  date:NOW-345600000,owner:'u1'},
  ],
  ch5:[
    {id:'d5',name:'Rapport_Hors_Zone_GAR001.pdf',size:'890 KB',type:'pdf',date:NOW-7200000,owner:'system'},
    {id:'d6',name:'Tracé_GPS_Ali_20240507.kml',  size:'45 KB', type:'file',date:NOW-3600000,owner:'system'},
  ],
  ch2:[
    {id:'d7',name:'Photo_BBU_Installation.jpg',  size:'2.4 MB',type:'img', date:NOW-14400000,owner:'u8'},
    {id:'d8',name:'Rapport_Site_DLA001.pdf',     size:'1.8 MB',type:'pdf', date:NOW-18000000,owner:'u5'},
  ],
  ch3:[
    {id:'d9',name:'Facture_INV-2024-002.pdf',    size:'890 KB',type:'pdf', date:NOW-86400000,owner:'u3'},
    {id:'d10',name:'Virement_TRESOR_001.pdf',    size:'340 KB',type:'pdf', date:NOW-1800000, owner:'u3'},
  ],
};

const MEETINGS = [
  {id:'m1',titre:'Suivi DLA-001',   date:'2024-05-08',heure:'10:00',duree:60, participants:['u1','u2','u5'],statut:'today',   room:'cleanit-dla-001'},
  {id:'m2',titre:'Point Finance',   date:'2024-05-08',heure:'14:00',duree:30, participants:['u1','u3','u4'],statut:'today',   room:'cleanit-finance'},
  {id:'m3',titre:'Review MTN',      date:'2024-05-09',heure:'09:00',duree:90, participants:['u1','u2','u3'],statut:'upcoming',room:'cleanit-mtn'},
  {id:'m4',titre:'Briefing Garoua', date:'2024-05-09',heure:'07:00',duree:20, participants:['u1','u8'],     statut:'upcoming',room:'cleanit-garoua'},
];

const EMAILS_DATA = [
  {id:'e1',from:'MTN Cameroun',       email:'mtn@mtn.cm',       subject:'RE: Facture INV-2024-001 — Paiement',      preview:'Veuillez trouver le virement de 53,935,625 FCFA...',date:NOW-86400000, lu:true, starred:true, pj:1},
  {id:'e2',from:'Marchés Publics CM', email:'dg@marchespublics.cm',subject:'Contrat GAR-001 — Signature requise',   preview:'Le contrat d\'infrastructure telecom...',          date:NOW-172800000,lu:false,starred:false,pj:2},
  {id:'e3',from:'Chen Wei — Huawei',  email:'c.wei@huawei.com', subject:'BC-2024-143 — Mise à jour livraison',      preview:'Following our last discussion regarding...',     date:NOW-259200000,lu:false,starred:true, pj:0},
  {id:'e4',from:'Pierre Etoga',       email:'p.etoga@cleanit.cm',subject:'Rapport 5G NR DLA-001 Phase 2',           preview:'Voici le rapport d\'avancement...',              date:NOW-345600000,lu:true, starred:false,pj:3},
  {id:'e5',from:'CleanIT ERP',        email:'noreply@cleanit.cm',subject:'[AUTO] Alerte hors zone — Ali Moussa',    preview:'ALERTE GÉOFENCING: Ali Moussa détecté...',       date:NOW-7200000,  lu:false,starred:false,pj:0},
];

// ── Helpers ──────────────────────────────────────────────────────────
const fmtTime = d => {
  const diff = Date.now()-d;
  if(diff<60000) return 'maintenant';
  if(diff<3600000) return Math.floor(diff/60000)+'m';
  if(diff<86400000) return new Date(d).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  return new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'});
};
const fmtFull = d => new Date(d).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
const getUser = id => CONTACTS.find(u=>u.id===id)||ME;
const statusDot = s => s==='online'?P.green:s==='busy'?P.red:s==='away'?P.yellow:P.gray;

const FILE_ICON = type => ({
  pdf:'PDF',excel:'XLS',word:'DOC',zip:'ZIP',img:'IMG',video:'VID',file:'FILE'
})[type]||'📁';

const FILE_COLOR = type => ({
  pdf:P.red,excel:P.green,word:P.blue,zip:P.yellow,img:P.purple,video:P.orange
})[type]||P.gray;

// ── Avatar ───────────────────────────────────────────────────────────
const Av = ({user,size=32,showStatus=false}) => {
  const u = typeof user==='string' ? getUser(user) : user;
  return(
    <div style={{position:'relative',display:'inline-flex',flexShrink:0}}>
      <div style={{width:size,height:size,borderRadius:size*.3,background:u?.couleur||P.gray,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:size*.34,letterSpacing:-.5,userSelect:'none',overflow:'hidden'}}>
        {u?.photo?<img src={u.photo} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{e.target.style.display='none';}} alt=""/>:null}
        {!u?.photo&&(u?.avatar||'?')}
      </div>
      {showStatus&&u?.status&&(
        <div style={{position:'absolute',bottom:-1,right:-1,width:size*.32,height:size*.32,borderRadius:'50%',background:statusDot(u.status),border:'2px solid #fff'}}/>
      )}
    </div>
  );
};

// ── Icon Nav (colonne la plus à gauche) ──────────────────────────────
const IconNav = ({active, navigate, badge}) => {
  const tabs = [
    {id:'chat',     icon:'chat',     label:'Messages'},
    {id:'reunions', icon:'meeting',  label:'Réunions'},
    {id:'email',    icon:'email',    label:'Emails'},
    {id:'drive',    icon:'drive',    label:'Cloud Drive'},
    {id:'contacts', icon:'contacts', label:'Contacts'},
  ];
  return(
    <div style={{width:56,background:P.sidebarBg,display:'flex',flexDirection:'column',alignItems:'center',padding:'10px 0',gap:2,flexShrink:0,borderRight:'1px solid rgba(255,255,255,.05)'}}>
      {/* Logo */}
      <div onClick={()=>navigate('/')} title="Retour accueil"
        style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#2563eb,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',marginBottom:14,boxShadow:'0 4px 12px rgba(37,99,235,.4)'}}>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="white"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
      </div>

      {tabs.map(t=>{
        const isAct = active===t.id;
        const bd = t.id==='chat'&&badge>0;
        return(
          <div key={t.id} onClick={()=>navigate('/cleanitcomm/'+t.id)} title={t.label}
            style={{width:44,height:44,borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',position:'relative',transition:'all .15s',
              background:isAct?'rgba(37,99,235,.2)':'transparent'}}>
            <Icon name={t.icon} size={22} color={isAct?P.iconAct:'rgba(255,255,255,.4)'} active={isAct}/>
            {bd&&(
              <div style={{position:'absolute',top:6,right:6,width:16,height:16,borderRadius:8,background:P.red,color:'#fff',fontSize:9,fontWeight:900,display:'flex',alignItems:'center',justifyContent:'center'}}>
                {badge>9?'9+':badge}
              </div>
            )}
          </div>
        );
      })}

      <div style={{flex:1}}/>

      {/* Settings & Avatar */}
      <div style={{width:44,height:44,borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',marginBottom:4}}
        title="Paramètres">
        <Icon name="settings" size={20} color="rgba(255,255,255,.35)"/>
      </div>
      <div style={{marginBottom:8,cursor:'pointer'}} title={ME.nom}>
        <Av user={ME} size={32} showStatus={true}/>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  SECTION CHAT
// ═══════════════════════════════════════════════════════════════════
const SectionChat = ({navigate}) => {
  const [selId,     setSelId]     = useState('ch1');
  const [isDM,      setIsDM]      = useState(false);
  const [messages,  setMessages]  = useState(MSGS);
  const [input,     setInput]     = useState('');
  const [search,    setSearch]    = useState('');
  const [showRight, setShowRight] = useState(true);
  const [compose,   setCompose]   = useState(false);
  const msgEnd = useRef(null);
  const inputRef = useRef(null);

  const key = isDM ? 'dm_'+selId : selId;
  const msgs = messages[key]||[];
  const channel = !isDM ? CHANNELS.find(c=>c.id===selId) : null;
  const dmUser  = isDM  ? getUser(selId) : null;
  const files   = DRIVE_FILES[selId]||[];
  const totalUnread = CHANNELS.reduce((s,c)=>s+c.unread,0);

  useEffect(()=>{ msgEnd.current?.scrollIntoView({behavior:'smooth'}); },[msgs.length, selId]);

  const send = () => {
    if(!input.trim()) return;
    const msg = {id:'m'+Date.now(), uid:'u1', text:input.trim(), ts:Date.now(), files:[]};
    setMessages(p=>({...p,[key]:[...(p[key]||[]),msg]}));
    setInput('');
    inputRef.current?.focus();
  };

  const ALERT_STYLE = {
    danger:  {bg:'#fef2f2',color:P.red,   border:'#fecaca'},
    warning: {bg:'#fffbeb',color:'#d97706',border:'#fde68a'},
    success: {bg:'#f0fdf4',color:P.green, border:'#bbf7d0'},
  };

  const filtChannels = CHANNELS.filter(c=>!search||c.nom.includes(search.toLowerCase()));
  const filtContacts = CONTACTS.filter(u=>!search||u.nom.toLowerCase().includes(search.toLowerCase()));

  return(
    <div style={{flex:1,display:'flex',overflow:'hidden'}}>

      {/* ── List Panel ─────────────────────────────────────────── */}
      <div style={{width:260,background:P.listBg,borderRight:`1px solid ${P.listBorder}`,display:'flex',flexDirection:'column',flexShrink:0}}>

        {/* Search */}
        <div style={{padding:'12px 12px 8px'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f5f7fa',borderRadius:9,padding:'8px 11px',border:'1px solid #eef0f3'}}>
            <Icon name="search" size={15} color={P.text4}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
              style={{flex:1,background:'transparent',border:'none',outline:'none',fontSize:13,color:P.text,fontFamily:'inherit'}}/>
          </div>
        </div>

        {/* Channels */}
        <div style={{flex:1,overflowY:'auto'}}>
          <div style={{padding:'6px 12px 3px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:10,fontWeight:700,color:P.text4,textTransform:'uppercase',letterSpacing:.6}}>Canaux</span>
            <div style={{cursor:'pointer',color:P.blue}} onClick={()=>{}}><Icon name="plus" size={14} color={P.blue}/></div>
          </div>

          {filtChannels.map(ch=>{
            const isAct = !isDM&&selId===ch.id;
            return(
              <div key={ch.id} onClick={()=>{setSelId(ch.id);setIsDM(false);}}
                style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',cursor:'pointer',
                  background:isAct?P.listAct:'transparent',borderLeft:isAct?`3px solid ${P.blue}`:'3px solid transparent',
                  transition:'all .1s'}}
                onMouseEnter={e=>{if(!isAct)e.currentTarget.style.background=P.listHov;}}
                onMouseLeave={e=>{if(!isAct)e.currentTarget.style.background='transparent';}}>
                {/* Canal icon */}
                <div style={{width:34,height:34,borderRadius:9,background:ch.type==='system'?'#fef3c7':ch.type==='private'?'#ede9fe':'#dbeafe',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Icon name={ch.type==='system'?'bell':ch.type==='private'?'lock':'hash'} size={16}
                    color={ch.type==='system'?P.yellow:ch.type==='private'?P.purple:P.blue}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:1}}>
                    <span style={{fontSize:13,fontWeight:isAct||ch.unread>0?700:500,color:P.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:130}}>
                      {ch.nom}
                    </span>
                    <span style={{fontSize:10,color:P.text4,flexShrink:0}}>{fmtTime(ch.lastTs)}</span>
                  </div>
                  <div style={{fontSize:11,color:P.text4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ch.lastMsg}</div>
                </div>
                {ch.unread>0&&(
                  <div style={{width:18,height:18,borderRadius:9,background:P.red,color:'#fff',fontSize:10,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    {ch.unread}
                  </div>
                )}
              </div>
            );
          })}

          {/* Messages directs */}
          <div style={{padding:'10px 12px 3px',display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:4}}>
            <span style={{fontSize:10,fontWeight:700,color:P.text4,textTransform:'uppercase',letterSpacing:.6}}>Messages directs</span>
            <div style={{cursor:'pointer'}}><Icon name="plus" size={14} color={P.blue}/></div>
          </div>

          {filtContacts.map(u=>{
            const isAct = isDM&&selId===u.id;
            return(
              <div key={u.id} onClick={()=>{setSelId(u.id);setIsDM(true);}}
                style={{display:'flex',alignItems:'center',gap:10,padding:'7px 12px',cursor:'pointer',
                  background:isAct?P.listAct:'transparent',borderLeft:isAct?`3px solid ${P.blue}`:'3px solid transparent',
                  transition:'all .1s'}}
                onMouseEnter={e=>{if(!isAct)e.currentTarget.style.background=P.listHov;}}
                onMouseLeave={e=>{if(!isAct)e.currentTarget.style.background='transparent';}}>
                <Av user={u} size={32} showStatus={true}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:isAct?700:500,color:P.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.nom}</div>
                  <div style={{fontSize:11,color:statusDot(u.status),fontWeight:600}}>
                    {u.status==='online'?'En ligne':u.status==='busy'?'Occupé':u.status==='away'?'Absent':'Hors ligne'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Content Area ───────────────────────────────────────── */}
      <div style={{flex:1,display:'flex',flexDirection:'column',background:P.contentBg,overflow:'hidden'}}>

        {/* Header */}
        <div style={{padding:'0 16px',height:52,borderBottom:`1px solid ${P.border}`,background:P.white,display:'flex',alignItems:'center',gap:12,flexShrink:0,boxShadow:P.shadow}}>
          {isDM ? (
            <>
              <Av user={dmUser} size={34} showStatus={true}/>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:P.text}}>{dmUser?.nom}</div>
                <div style={{fontSize:11,color:statusDot(dmUser?.status)}}>{dmUser?.status==='online'?'En ligne':dmUser?.status==='busy'?'Occupé':'Hors ligne'}</div>
              </div>
            </>
          ):(
            <>
              <div style={{width:34,height:34,borderRadius:9,background:channel?.type==='system'?'#fef3c7':channel?.type==='private'?'#ede9fe':'#dbeafe',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Icon name={channel?.type==='system'?'bell':channel?.type==='private'?'lock':'hash'} size={17} color={channel?.type==='system'?P.yellow:channel?.type==='private'?P.purple:P.blue}/>
              </div>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:P.text}}>{channel?.nom}</div>
                <div style={{fontSize:11,color:P.text3}}>Canal {channel?.type==='private'?'privé':channel?.type==='system'?'système':'public'}</div>
              </div>
            </>
          )}
          <div style={{marginLeft:'auto',display:'flex',gap:6}}>
            <button onClick={()=>navigate('/cleanitcomm/reunions')}
              style={{display:'flex',alignItems:'center',gap:5,padding:'6px 12px',borderRadius:8,border:'none',background:P.blue,color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer'}}>
              <Icon name="video" size={14} color="#fff"/> Appel vidéo
            </button>
            <button style={{width:34,height:34,borderRadius:8,border:`1px solid ${P.border}`,background:P.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icon name="phone" size={16} color={P.text3}/>
            </button>
            <button onClick={()=>setShowRight(!showRight)}
              style={{width:34,height:34,borderRadius:8,border:`1px solid ${showRight?P.blue:P.border}`,background:showRight?P.blue_l:P.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icon name="info" size={16} color={showRight?P.blue:P.text3}/>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{flex:1,overflowY:'auto',padding:'16px 20px',display:'flex',flexDirection:'column',gap:0}}>
          {msgs.length===0&&(
            <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,color:P.text4}}>
              <Icon name="chat" size={48} color={P.border}/>
              <div style={{fontSize:15,fontWeight:600}}>Démarrez la conversation</div>
            </div>
          )}
          {msgs.map((msg,i)=>{
            const isMe = msg.uid==='u1';
            const isSys = msg.uid==='system';
            const user = getUser(msg.uid);
            const prev = msgs[i-1];
            const grouped = prev&&prev.uid===msg.uid&&msg.ts-prev.ts<300000;
            const alertSt = ALERT_STYLE[msg.alertType]||{};

            if(isSys) return(
              <div key={msg.id} style={{display:'flex',justifyContent:'center',marginBottom:6}}>
                <div style={{padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:600,background:alertSt.bg||'#f3f4f6',color:alertSt.color||P.gray,border:`1px solid ${alertSt.border||'#e5e7eb'}`,maxWidth:'80%',textAlign:'center'}}>
                  {msg.text}
                  <span style={{fontSize:9,marginLeft:8,opacity:.6}}>{fmtFull(msg.ts)}</span>
                </div>
              </div>
            );

            return(
              <div key={msg.id} style={{display:'flex',flexDirection:isMe?'row-reverse':'row',gap:8,marginBottom:grouped?2:10,alignItems:'flex-end'}}>
                {!isMe&&(
                  <div style={{width:32,flexShrink:0}}>
                    {!grouped&&<Av user={user} size={32}/>}
                  </div>
                )}
                <div style={{maxWidth:'65%',display:'flex',flexDirection:'column',alignItems:isMe?'flex-end':'flex-start'}}>
                  {!grouped&&!isMe&&<div style={{fontSize:11,fontWeight:700,color:P.text3,marginBottom:3,paddingLeft:2}}>{user?.nom}</div>}
                  <div style={{padding:'9px 13px',borderRadius:isMe?'14px 14px 4px 14px':'14px 14px 14px 4px',
                    background:isMe?P.msgMeBg:P.msgOtherBg,color:isMe?P.msgMeText:P.msgOtherText,
                    fontSize:13,lineHeight:1.5,boxShadow:isMe?`0 2px 8px ${P.blue}30`:P.shadow}}>
                    {msg.text}
                  </div>
                  {/* Fichiers joints */}
                  {msg.files?.length>0&&msg.files.map(f=>(
                    <div key={f.name} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderRadius:10,background:P.white,border:`1px solid ${P.border}`,marginTop:4,cursor:'pointer',boxShadow:P.shadow}}>
                      <div style={{width:32,height:32,borderRadius:8,background:FILE_COLOR(f.type)+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>
                        {FILE_ICON(f.type)}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:600,color:P.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.name}</div>
                        <div style={{fontSize:10,color:P.text4}}>{f.size}</div>
                      </div>
                      <Icon name="download" size={14} color={P.blue}/>
                    </div>
                  ))}
                  {!grouped&&<div style={{fontSize:9,color:P.text4,marginTop:3,paddingLeft:2}}>{fmtFull(msg.ts)}</div>}
                </div>
              </div>
            );
          })}
          <div ref={msgEnd}/>
        </div>

        {/* Input */}
        <div style={{padding:'10px 16px',background:P.white,borderTop:`1px solid ${P.border}`,flexShrink:0}}>
          <div style={{display:'flex',alignItems:'flex-end',gap:10,background:'#f5f7fa',borderRadius:12,border:`1px solid ${P.border}`,padding:'8px 12px',transition:'border-color .2s'}}
            onFocus={e=>e.currentTarget.style.borderColor=P.blue}
            onBlur={e=>e.currentTarget.style.borderColor=P.border}>
            <div style={{display:'flex',gap:4,paddingBottom:2}}>
              {[['attach','Joindre'],['emoji','Emoji']].map(([ic,tt])=>(
                <button key={ic} title={tt} style={{width:30,height:30,borderRadius:7,border:'none',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <Icon name={ic} size={18} color={P.text4}/>
                </button>
              ))}
            </div>
            <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
              placeholder={`Message ${isDM?dmUser?.nom:'#'+channel?.nom}...`} rows={1}
              style={{flex:1,border:'none',background:'transparent',resize:'none',outline:'none',fontSize:13,fontFamily:'inherit',color:P.text,lineHeight:1.5,maxHeight:100,overflowY:'auto'}}/>
            <button onClick={send} disabled={!input.trim()}
              style={{width:34,height:34,borderRadius:9,border:'none',background:input.trim()?P.blue:'#e5e7eb',cursor:input.trim()?'pointer':'default',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .15s'}}>
              <Icon name="send" size={16} color="#fff"/>
            </button>
          </div>
        </div>
      </div>

      {/* ── Right Panel ────────────────────────────────────────── */}
      {showRight&&(
        <div style={{width:260,background:P.rightBg,borderLeft:`1px solid ${P.listBorder}`,display:'flex',flexDirection:'column',flexShrink:0,overflow:'hidden'}}>

          {/* Infos canal/contact */}
          <div style={{padding:'16px',borderBottom:`1px solid ${P.border}`,textAlign:'center'}}>
            {isDM?(
              <>
                <Av user={dmUser} size={52} showStatus={true}/>
                <div style={{fontSize:14,fontWeight:800,color:P.text,marginTop:10}}>{dmUser?.nom}</div>
                <div style={{fontSize:12,color:P.text3,marginBottom:4}}>{dmUser?.poste}</div>
                <div style={{fontSize:11,color:statusDot(dmUser?.status),fontWeight:600}}>{dmUser?.status==='online'?'● En ligne':dmUser?.status==='busy'?'● Occupé':'● Hors ligne'}</div>
                <div style={{display:'flex',gap:8,marginTop:12,justifyContent:'center'}}>
                  <button style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'8px 12px',borderRadius:9,border:`1px solid ${P.border}`,background:'#f9fafb',cursor:'pointer'}}>
                    <Icon name="phone" size={16} color={P.blue}/>
                    <span style={{fontSize:10,color:P.text3}}>Appel</span>
                  </button>
                  <button onClick={()=>navigate('/cleanitcomm/reunions')} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'8px 12px',borderRadius:9,border:`1px solid ${P.border}`,background:'#f9fafb',cursor:'pointer'}}>
                    <Icon name="video" size={16} color={P.blue}/>
                    <span style={{fontSize:10,color:P.text3}}>Vidéo</span>
                  </button>
                  <button style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'8px 12px',borderRadius:9,border:`1px solid ${P.border}`,background:'#f9fafb',cursor:'pointer'}}>
                    <Icon name="info" size={16} color={P.blue}/>
                    <span style={{fontSize:10,color:P.text3}}>Profil</span>
                  </button>
                </div>
              </>
            ):(
              <>
                <div style={{width:52,height:52,borderRadius:14,background:channel?.type==='system'?'#fef3c7':channel?.type==='private'?'#ede9fe':'#dbeafe',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto'}}>
                  <Icon name={channel?.type==='system'?'bell':channel?.type==='private'?'lock':'hash'} size={24} color={channel?.type==='system'?P.yellow:channel?.type==='private'?P.purple:P.blue}/>
                </div>
                <div style={{fontSize:14,fontWeight:800,color:P.text,marginTop:10}}>#{channel?.nom}</div>
                <div style={{fontSize:11,color:P.text3,marginTop:2}}>Canal {channel?.type==='private'?'privé':'public'}</div>
                <div style={{fontSize:11,color:P.text4,marginTop:4}}>Membres · Fichiers partagés</div>
              </>
            )}
          </div>

          {/* Fichiers liés */}
          <div style={{flex:1,overflowY:'auto'}}>
            <div style={{padding:'12px 14px 6px',fontSize:11,fontWeight:700,color:P.text3,textTransform:'uppercase',letterSpacing:.5,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              Fichiers partagés
              <button onClick={()=>navigate('/cleanitcomm/drive')} style={{fontSize:10,color:P.blue,background:'none',border:'none',cursor:'pointer',fontFamily:'inherit'}}>Voir tout</button>
            </div>
            {files.length===0&&<div style={{padding:'20px',textAlign:'center',fontSize:12,color:P.text4}}>Aucun fichier</div>}
            {files.map(f=>{
              const owner = getUser(f.owner);
              return(
                <div key={f.id} style={{display:'flex',alignItems:'center',gap:9,padding:'9px 14px',borderBottom:`1px solid #f8fafc`,cursor:'pointer',transition:'background .1s'}}
                  onMouseEnter={e=>e.currentTarget.style.background='#f5f7fa'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{width:34,height:34,borderRadius:9,background:FILE_COLOR(f.type)+'15',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>
                    {FILE_ICON(f.type)}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:600,color:P.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.name}</div>
                    <div style={{fontSize:10,color:P.text4}}>{f.size} · {fmtTime(f.date)}</div>
                  </div>
                  <Icon name="download" size={13} color={P.text4}/>
                </div>
              );
            })}

            {/* Membres du canal */}
            {!isDM&&(
              <>
                <div style={{padding:'12px 14px 6px',fontSize:11,fontWeight:700,color:P.text3,textTransform:'uppercase',letterSpacing:.5}}>Membres</div>
                {[ME,...CONTACTS.slice(0,4)].map(u=>(
                  <div key={u.id} style={{display:'flex',alignItems:'center',gap:9,padding:'7px 14px'}}>
                    <Av user={u} size={28} showStatus={true}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:P.text}}>{u.nom}</div>
                      <div style={{fontSize:10,color:P.text4}}>{u.poste}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  SECTION RÉUNIONS
// ═══════════════════════════════════════════════════════════════════
const SectionReunions = ({navigate}) => {
  const [meetings, setMeetings] = useState(MEETINGS);
  const [inMeeting, setInMeeting] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [newM, setNewM] = useState({titre:'',date:'',heure:'',duree:30,participants:[]});

  const create = () => {
    if(!newM.titre||!newM.date||!newM.heure) return;
    setMeetings(p=>[...p,{...newM,id:'m'+Date.now(),statut:'upcoming',room:'cleanit-'+newM.titre.toLowerCase().replace(/\s+/g,'-').slice(0,20)}]);
    setShowNew(false);
    setNewM({titre:'',date:'',heure:'',duree:30,participants:[]});
  };

  if(inMeeting) return(
    <div style={{flex:1,display:'flex',flexDirection:'column'}}>
      <div style={{padding:'10px 20px',background:P.sidebarBg,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:'#fff'}}>{inMeeting.titre}</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,.5)'}}>En cours · {inMeeting.participants.length} participants</div>
        </div>
        <button onClick={()=>setInMeeting(null)} style={{padding:'7px 16px',borderRadius:8,border:'none',background:P.red,color:'#fff',fontWeight:700,fontSize:12,cursor:'pointer',display:'flex',alignItems:'center',gap:5}}>
          <Icon name="close" size={14} color="#fff"/> Quitter
        </button>
      </div>
      <iframe src={`https://meet.jit.si/CleanIT-${inMeeting.room}#userInfo.displayName="${ME.nom}"&config.prejoinPageEnabled=false&interfaceConfig.SHOW_JITSI_WATERMARK=false`}
        style={{flex:1,border:'none'}} allow="camera; microphone; fullscreen; display-capture" title="Réunion"/>
    </div>
  );

  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',background:P.contentBg}}>
      <div style={{padding:'14px 20px',background:SECTION_THEME.reunions.grad,borderBottom:'none',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
        <div style={{fontSize:16,fontWeight:800,color:'#fff'}}>Réunions & Vidéoconférence</div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>setInMeeting({titre:'Réunion instantanée',room:'instant-'+Date.now(),participants:['u1']})}
            style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:9,border:'none',background:P.green,color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer'}}>
            <Icon name="video" size={15} color="#fff"/> Démarrer maintenant
          </button>
          <button onClick={()=>setShowNew(true)}
            style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:9,border:'none',background:P.blue,color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer'}}>
            <Icon name="plus" size={15} color="#fff"/> Planifier
          </button>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'20px'}}>
        {['today','upcoming','done'].map(statut=>{
          const filtered = meetings.filter(m=>m.statut===statut);
          if(filtered.length===0) return null;
          return(
            <div key={statut} style={{marginBottom:24}}>
              <div style={{fontSize:11,fontWeight:700,color:P.text4,textTransform:'uppercase',letterSpacing:.6,marginBottom:12}}>
                {statut==='today'?'Aujourd\'hui':statut==='upcoming'?'À venir':'Passées'}
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {filtered.map(m=>(
                  <div key={m.id} style={{background:P.white,borderRadius:12,border:`1px solid ${P.border}`,padding:'16px 20px',display:'flex',alignItems:'center',gap:16,boxShadow:P.shadow}}>
                    <div style={{width:48,height:48,borderRadius:12,background:statut==='done'?'#f3f4f6':'linear-gradient(135deg,#2563eb,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <Icon name="video" size={22} color={statut==='done'?P.text4:'#fff'}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700,color:P.text,marginBottom:3}}>{m.titre}</div>
                      <div style={{fontSize:12,color:P.text3,marginBottom:6}}>{m.date} à {m.heure} · {m.duree} min</div>
                      <div style={{display:'flex',gap:-6}}>
                        {m.participants.slice(0,5).map(uid=>(
                          <div key={uid} style={{marginRight:-8}}><Av user={getUser(uid)||ME} size={22}/></div>
                        ))}
                        {m.participants.length>5&&<span style={{fontSize:10,color:P.text4,marginLeft:12}}>+{m.participants.length-5}</span>}
                      </div>
                    </div>
                    {statut!=='done'&&(
                      <button onClick={()=>setInMeeting(m)}
                        style={{padding:'8px 18px',borderRadius:9,border:'none',background:statut==='today'?P.green:P.blue,color:'#fff',fontWeight:700,fontSize:12,cursor:'pointer'}}>
                        {statut==='today'?'Rejoindre':'Démarrer'}
                      </button>
                    )}
                    {statut==='done'&&<span style={{fontSize:12,color:P.text4}}>Terminée</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showNew&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:P.white,borderRadius:16,width:'100%',maxWidth:440,boxShadow:P.shadow2,overflow:'hidden'}}>
            <div style={{background:'linear-gradient(135deg,#1e40af,#7c3aed)',padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:15,fontWeight:800,color:'#fff'}}>Planifier une réunion</div>
              <button onClick={()=>setShowNew(false)} style={{background:'rgba(255,255,255,.2)',border:'none',color:'#fff',width:28,height:28,borderRadius:7,cursor:'pointer',fontSize:16}}>×</button>
            </div>
            <div style={{padding:20,display:'flex',flexDirection:'column',gap:12}}>
              {[{l:'Titre',type:'text',k:'titre',ph:'Ex: Suivi projet DLA-001'},{l:'Date',type:'date',k:'date'},{l:'Heure',type:'time',k:'heure'}].map(f=>(
                <div key={f.k}>
                  <label style={{fontSize:11,fontWeight:700,color:P.text4,textTransform:'uppercase',letterSpacing:.4,display:'block',marginBottom:4}}>{f.l}</label>
                  <input type={f.type} value={newM[f.k]} onChange={e=>setNewM(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph||''}
                    style={{width:'100%',padding:'9px 11px',borderRadius:8,border:`1px solid ${P.border}`,fontSize:13,fontFamily:'inherit',color:P.text}}/>
                </div>
              ))}
              <div>
                <label style={{fontSize:11,fontWeight:700,color:P.text4,textTransform:'uppercase',letterSpacing:.4,display:'block',marginBottom:6}}>Participants</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {CONTACTS.map(u=>{
                    const sel=newM.participants.includes(u.id);
                    return(
                      <div key={u.id} onClick={()=>setNewM(p=>({...p,participants:sel?p.participants.filter(x=>x!==u.id):[...p.participants,u.id]}))}
                        style={{display:'flex',alignItems:'center',gap:5,padding:'4px 10px',borderRadius:20,cursor:'pointer',fontSize:11,fontWeight:600,
                          background:sel?P.blue_l:P.listHov,color:sel?P.blue:P.text3,border:`1px solid ${sel?P.blue:P.border}`}}>
                        <Av user={u} size={16}/>{u.nom.split(' ')[0]}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{display:'flex',gap:10,marginTop:4}}>
                <button onClick={()=>setShowNew(false)} style={{flex:1,padding:'10px',borderRadius:9,border:`1px solid ${P.border}`,background:P.white,color:P.gray,fontWeight:700,fontSize:13,cursor:'pointer'}}>Annuler</button>
                <button onClick={create} style={{flex:2,padding:'10px',borderRadius:9,border:'none',background:P.blue,color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer'}}>✓ Planifier</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  SECTION EMAIL
// ═══════════════════════════════════════════════════════════════════
const SectionEmail = () => {
  const [emails,   setEmails]   = useState(EMAILS_DATA);
  const [sel,      setSel]      = useState(null);
  const [folder,   setFolder]   = useState('inbox');
  const [compose,  setCompose]  = useState(false);
  const [form,     setForm]     = useState({to:'',subject:'',body:''});
  const [sending,  setSending]  = useState(false);

  const filtered = folder==='starred'?emails.filter(e=>e.starred):emails;
  const unread   = emails.filter(e=>!e.lu).length;

  const send = async () => {
    if(!form.to||!form.subject) return;
    setSending(true);
    await new Promise(r=>setTimeout(r,1200));
    setSending(false);
    setCompose(false);
    setForm({to:'',subject:'',body:''});
  };

  const FOLDERS = [
    {id:'inbox',  l:'Boîte de réception', icon:'home'},
    {id:'starred',l:'Importants',          icon:'star'},
  ];

  return(
    <div style={{flex:1,display:'flex',overflow:'hidden'}}>
      {/* List */}
      <div style={{width:320,background:P.listBg,borderRight:`1px solid ${P.listBorder}`,display:'flex',flexDirection:'column',flexShrink:0}}>
        <div style={{padding:'12px'}}>
          <button onClick={()=>setCompose(true)}
            style={{width:'100%',padding:'10px',borderRadius:9,border:'none',background:P.blue,color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            <Icon name="plus" size={16} color="#fff"/> Nouveau message
          </button>
        </div>
        <div style={{padding:'0 8px 6px'}}>
          {FOLDERS.map(f=>(
            <div key={f.id} onClick={()=>setSel(null)||setFolder(f.id)}
              style={{display:'flex',alignItems:'center',gap:9,padding:'8px 10px',borderRadius:8,cursor:'pointer',
                background:folder===f.id?P.listAct:'transparent',borderLeft:folder===f.id?`3px solid ${P.blue}`:'3px solid transparent'}}>
              <Icon name={f.icon} size={16} color={folder===f.id?P.blue:P.text3}/>
              <span style={{fontSize:13,fontWeight:folder===f.id?700:500,color:folder===f.id?P.blue:P.text2}}>{f.l}</span>
              {f.id==='inbox'&&unread>0&&<span style={{marginLeft:'auto',background:P.red,color:'#fff',fontSize:10,padding:'1px 5px',borderRadius:10,fontWeight:800}}>{unread}</span>}
            </div>
          ))}
        </div>
        <div style={{flex:1,overflowY:'auto',borderTop:`1px solid ${P.border}`}}>
          {filtered.map(email=>(
            <div key={email.id} onClick={()=>{setSel(email);setEmails(p=>p.map(e=>e.id===email.id?{...e,lu:true}:e));}}
              style={{padding:'12px',borderBottom:`1px solid #f8fafc`,cursor:'pointer',
                background:sel?.id===email.id?P.listAct:'transparent',
                borderLeft:!email.lu?`3px solid ${P.blue}`:'3px solid transparent',
                transition:'background .1s'}}
              onMouseEnter={e=>{if(sel?.id!==email.id)e.currentTarget.style.background=P.listHov;}}
              onMouseLeave={e=>{if(sel?.id!==email.id)e.currentTarget.style.background='transparent';}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:3,alignItems:'center'}}>
                <span style={{fontSize:13,fontWeight:email.lu?500:800,color:P.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{email.from}</span>
                <span style={{fontSize:10,color:P.text4,flexShrink:0,marginLeft:8}}>{fmtTime(email.date)}</span>
              </div>
              <div style={{fontSize:12,fontWeight:email.lu?400:700,color:email.lu?P.text3:P.text,marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{email.subject}</div>
              <div style={{fontSize:11,color:P.text4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{email.preview}</div>
              {email.pj>0&&<div style={{fontSize:10,color:P.blue,marginTop:3}}>📎 {email.pj} pièce(s)</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,background:sel?P.white:P.contentBg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {!sel&&(
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:12,color:P.text4}}>
            <Icon name="email" size={56} color={P.border}/>
            <div style={{fontSize:15,fontWeight:600}}>Sélectionnez un email</div>
          </div>
        )}
        {sel&&(
          <>
            <div style={{padding:'12px 20px',borderBottom:`1px solid ${P.border}`,display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
              <button onClick={()=>setSel(null)} style={{padding:'6px 12px',borderRadius:7,border:`1px solid ${P.border}`,background:P.white,cursor:'pointer',fontSize:12,color:P.text3,display:'flex',alignItems:'center',gap:5}}>
                <Icon name="back" size={13} color={P.text3}/> Retour
              </button>
              <div style={{marginLeft:'auto',display:'flex',gap:6}}>
                {[{l:'Répondre',icon:'send'},{l:'Transférer',icon:'attach'}].map(a=>(
                  <button key={a.l} onClick={()=>setCompose(true)} style={{padding:'6px 12px',borderRadius:7,border:`1px solid ${P.border}`,background:P.white,cursor:'pointer',fontSize:12,color:P.text2,fontWeight:600,display:'flex',alignItems:'center',gap:5}}>
                    <Icon name={a.icon} size={13} color={P.text3}/>{a.l}
                  </button>
                ))}
              </div>
            </div>
            <div style={{flex:1,overflowY:'auto',padding:'24px'}}>
              <div style={{fontSize:20,fontWeight:800,color:P.text,marginBottom:16}}>{sel.subject}</div>
              <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',background:'#f8fafc',borderRadius:10,marginBottom:20}}>
                <div style={{width:42,height:42,borderRadius:12,background:P.blue,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:16}}>{sel.from.charAt(0)}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:P.text}}>{sel.from}</div>
                  <div style={{fontSize:11,color:P.text3}}>{sel.email}</div>
                </div>
                <div style={{fontSize:11,color:P.text4}}>{new Date(sel.date).toLocaleString('fr-FR')}</div>
              </div>
              <div style={{fontSize:13,color:P.text2,lineHeight:1.8}}>{sel.preview}<br/><br/>Cordialement,<br/>Service concerné</div>
              {sel.pj>0&&(
                <div style={{marginTop:20,padding:'14px',background:'#f8fafc',borderRadius:10,border:`1px solid ${P.border}`}}>
                  <div style={{fontSize:11,fontWeight:700,color:P.text3,marginBottom:8}}>PIÈCES JOINTES ({sel.pj})</div>
                  {Array.from({length:sel.pj}).map((_,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:9,padding:'7px 0',borderBottom:i<sel.pj-1?`1px solid ${P.border}`:'none'}}>
                      <div style={{fontSize:20}}>📄</div>
                      <span style={{fontSize:12,color:P.blue,cursor:'pointer',fontWeight:500}}>Document_{i+1}.pdf</span>
                      <span style={{marginLeft:'auto',fontSize:10,color:P.text4}}>Télécharger</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Compose popup */}
      {compose&&(
        <div style={{position:'fixed',bottom:0,right:0,width:500,background:P.white,borderRadius:'14px 14px 0 0',boxShadow:'0 -8px 30px rgba(0,0,0,.15)',zIndex:1000,border:`1px solid ${P.border}`}}>
          <div style={{background:'linear-gradient(135deg,#1e40af,#7c3aed)',padding:'12px 18px',borderRadius:'14px 14px 0 0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontSize:14,fontWeight:700,color:'#fff'}}>Nouveau message</div>
            <button onClick={()=>setCompose(false)} style={{background:'rgba(255,255,255,.2)',border:'none',color:'#fff',width:26,height:26,borderRadius:6,cursor:'pointer',fontSize:16}}>×</button>
          </div>
          <div style={{padding:14}}>
            {[{l:'À',k:'to',ph:'Email du destinataire'},{l:'Objet',k:'subject',ph:'Sujet'}].map(f=>(
              <div key={f.k} style={{display:'flex',alignItems:'center',borderBottom:`1px solid ${P.border}`,paddingBottom:8,marginBottom:8,gap:8}}>
                <span style={{fontSize:11,fontWeight:700,color:P.text4,width:36}}>{f.l}</span>
                <input value={form[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph}
                  style={{flex:1,border:'none',outline:'none',fontSize:13,color:P.text,fontFamily:'inherit'}}/>
              </div>
            ))}
            <textarea value={form.body} onChange={e=>setForm(p=>({...p,body:e.target.value}))} placeholder="Votre message..." rows={7}
              style={{width:'100%',border:'none',outline:'none',resize:'none',fontSize:13,color:P.text,fontFamily:'inherit',lineHeight:1.6}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8,paddingTop:8,borderTop:`1px solid ${P.border}`}}>
              <div style={{display:'flex',gap:6}}>
                {[['attach','Joindre'],['pin','Épingler']].map(([ic,tt])=>(
                  <button key={ic} title={tt} style={{width:30,height:30,borderRadius:7,border:'none',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Icon name={ic} size={16} color={P.text4}/>
                  </button>
                ))}
              </div>
              <button onClick={send} style={{padding:'8px 20px',borderRadius:9,border:'none',background:P.blue,color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
                <Icon name="send" size={14} color="#fff"/>{sending?'Envoi...':'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  SECTION CLOUD DRIVE
// ═══════════════════════════════════════════════════════════════════
const SectionDrive = () => {
  const ALL_FILES = Object.values(DRIVE_FILES).flat();
  const [files,    setFiles]   = useState(ALL_FILES);
  const [folder,   setFolder]  = useState(null);
  const [view,     setView]    = useState('list');
  const [search,   setSearch]  = useState('');
  const [uploading,setUploading]=useState(false);
  const [pct,      setPct]     = useState(0);
  const fileRef = useRef(null);

  const FOLDERS = ['Projets','Finance','RH','Technique','HSE','Terrain'];
  const filtered = files.filter(f=>(!folder||f.name.includes(folder))&&(!search||f.name.toLowerCase().includes(search.toLowerCase())));

  const upload = async (e) => {
    const f=e.target.files[0]; if(!f) return;
    setUploading(true);
    for(let i=0;i<=100;i+=5){await new Promise(r=>setTimeout(r,40));setPct(i);}
    const ext=f.name.split('.').pop().toLowerCase();
    const type=['pdf'].includes(ext)?'pdf':['xlsx','xls'].includes(ext)?'excel':['doc','docx'].includes(ext)?'word':['zip'].includes(ext)?'zip':['jpg','png','gif'].includes(ext)?'img':'file';
    setFiles(p=>[{id:'f'+Date.now(),name:f.name,size:f.size>1048576?`${(f.size/1048576).toFixed(1)} MB`:`${Math.round(f.size/1024)} KB`,type,date:Date.now(),owner:'u1'},...p]);
    setUploading(false);setPct(0);
  };

  return(
    <div style={{flex:1,display:'flex',overflow:'hidden'}}>
      {/* Sidebar */}
      <div style={{width:220,background:P.listBg,borderRight:`1px solid ${P.listBorder}`,padding:'12px 8px',display:'flex',flexDirection:'column',gap:2,flexShrink:0}}>
        <input ref={fileRef} type="file" style={{display:'none'}} onChange={upload}/>
        <button onClick={()=>fileRef.current?.click()}
          style={{width:'100%',padding:'10px',borderRadius:9,border:'none',background:SECTION_THEME.drive.primary,color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginBottom:10}}>
          <Icon name="plus" size={16} color="#fff"/> Déposer un fichier
        </button>
        {[{id:null,l:'Tous les fichiers',icon:'drive'},{id:'Projets',l:'Projets',icon:'file'},{id:'Finance',l:'Finance',icon:'list'},{id:'RH',l:'RH',icon:'contacts'},{id:'Technique',l:'Technique',icon:'settings'},{id:'HSE',l:'HSE',icon:'info'}].map(f=>{
          const isAct=folder===f.id;
          return(
            <div key={f.id||'all'} onClick={()=>setFolder(f.id)}
              style={{display:'flex',alignItems:'center',gap:9,padding:'8px 10px',borderRadius:8,cursor:'pointer',fontSize:13,
                background:isAct?P.listAct:'transparent',borderLeft:isAct?`3px solid ${P.blue}`:'3px solid transparent',color:isAct?P.blue:P.text2,fontWeight:isAct?700:500}}>
              <Icon name={f.icon} size={16} color={isAct?P.blue:P.text3}/>
              {f.l}
              <span style={{marginLeft:'auto',fontSize:10,color:P.text4}}>{files.filter(x=>!f.id||x.name.includes(f.id)).length}</span>
            </div>
          );
        })}
        <div style={{marginTop:'auto',padding:'10px 6px'}}>
          <div style={{fontSize:10,color:P.text4,marginBottom:5}}>Stockage</div>
          <div style={{height:4,borderRadius:2,background:'#e5e7eb',marginBottom:3}}>
            <div style={{width:'34%',height:'100%',borderRadius:2,background:P.blue}}/>
          </div>
          <div style={{fontSize:10,color:P.text4}}>3.4 GB / 10 GB</div>
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',background:P.contentBg}}>
        <div style={{padding:'12px 16px',background:P.white,borderBottom:`1px solid ${P.border}`,display:'flex',gap:12,alignItems:'center',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f5f7fa',borderRadius:9,padding:'7px 12px',border:`1px solid ${P.border}`,flex:1,maxWidth:320}}>
            <Icon name="search" size={15} color={P.text4}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher des fichiers..."
              style={{flex:1,border:'none',background:'transparent',outline:'none',fontSize:13,fontFamily:'inherit'}}/>
          </div>
          <div style={{marginLeft:'auto',display:'flex',gap:4}}>
            {[['list','list'],['grid','grid']].map(([v,ic])=>(
              <button key={v} onClick={()=>setView(v)}
                style={{width:32,height:32,borderRadius:7,border:`1px solid ${P.border}`,background:view===v?P.blue:P.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Icon name={ic} size={15} color={view===v?'#fff':P.text3}/>
              </button>
            ))}
          </div>
        </div>

        {uploading&&(
          <div style={{padding:'8px 16px',background:P.blue_l,borderBottom:`1px solid #dbeafe`,fontSize:12,color:P.blue,fontWeight:600}}>
            Upload en cours... {pct}%
            <div style={{height:3,borderRadius:2,background:'#bfdbfe',marginTop:4}}><div style={{width:pct+'%',height:'100%',borderRadius:2,background:P.blue,transition:'width .05s'}}/></div>
          </div>
        )}

        <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
          {view==='list'?(
            <div style={{background:P.white,borderRadius:12,border:`1px solid ${P.border}`,overflow:'hidden',boxShadow:P.shadow}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 90px 110px 90px 60px',padding:'9px 14px',background:'#f8fafc',borderBottom:`2px solid ${P.border}`,fontSize:10,fontWeight:800,color:P.text4,textTransform:'uppercase',letterSpacing:.5}}>
                <span>Nom</span><span>Taille</span><span>Modifié</span><span>Propriétaire</span><span></span>
              </div>
              {filtered.length===0&&<div style={{padding:'40px',textAlign:'center',color:P.text4}}>Aucun fichier</div>}
              {filtered.map((f,i)=>{
                const owner=getUser(f.owner);
                return(
                  <div key={f.id} style={{display:'grid',gridTemplateColumns:'1fr 90px 110px 90px 60px',padding:'10px 14px',borderBottom:`1px solid #f8fafc`,alignItems:'center',cursor:'pointer',transition:'background .1s'}}
                    onMouseEnter={e=>e.currentTarget.style.background='#f5f7fa'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:32,height:32,borderRadius:8,background:FILE_COLOR(f.type)+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{FILE_ICON(f.type)}</div>
                      <span style={{fontSize:12,fontWeight:600,color:P.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.name}</span>
                    </div>
                    <span style={{fontSize:11,color:P.text3}}>{f.size}</span>
                    <span style={{fontSize:11,color:P.text3}}>{fmtTime(f.date)}</span>
                    <div style={{display:'flex',alignItems:'center',gap:5}}>
                      {owner&&<Av user={owner} size={18}/>}
                      <span style={{fontSize:10,color:P.text4}}>{owner?.nom.split(' ')[0]}</span>
                    </div>
                    <div style={{display:'flex',gap:4}}>
                      <button style={{width:24,height:24,borderRadius:6,border:'none',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon name="download" size={13} color={P.text4}/></button>
                    </div>
                  </div>
                );
              })}
            </div>
          ):(
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:10}}>
              {filtered.map(f=>(
                <div key={f.id} style={{background:P.white,borderRadius:12,border:`1px solid ${P.border}`,padding:'14px',cursor:'pointer',transition:'all .15s',boxShadow:P.shadow,textAlign:'center'}}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=P.shadow2;}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow=P.shadow;}}>
                  <div style={{height:60,display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,marginBottom:8}}>{FILE_ICON(f.type)}</div>
                  <div style={{fontSize:11,fontWeight:600,color:P.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.name}</div>
                  <div style={{fontSize:10,color:P.text4,marginTop:2}}>{f.size}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  SECTION CONTACTS
// ═══════════════════════════════════════════════════════════════════
const SectionContacts = ({navigate}) => {
  const [search, setSearch] = useState('');
  const [sel, setSel] = useState(null);
  const filtered = [ME,...CONTACTS].filter(u=>!search||(u.nom+u.poste).toLowerCase().includes(search.toLowerCase()));

  return(
    <div style={{flex:1,display:'flex',overflow:'hidden'}}>
      {/* List */}
      <div style={{width:280,background:P.listBg,borderRight:`1px solid ${P.listBorder}`,display:'flex',flexDirection:'column',flexShrink:0}}>
        <div style={{padding:'12px'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f5f7fa',borderRadius:9,padding:'8px 11px',border:`1px solid ${P.border}`}}>
            <Icon name="search" size={15} color={P.text4}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un contact..."
              style={{flex:1,background:'transparent',border:'none',outline:'none',fontSize:13,fontFamily:'inherit'}}/>
          </div>
        </div>
        <div style={{flex:1,overflowY:'auto'}}>
          {filtered.map(u=>{
            const isMe2=u.id==='u1';
            return(
              <div key={u.id} onClick={()=>setSel(u)}
                style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',cursor:'pointer',background:sel?.id===u.id?P.listAct:'transparent',borderLeft:sel?.id===u.id?`3px solid ${P.blue}`:'3px solid transparent',transition:'background .1s'}}
                onMouseEnter={e=>{if(sel?.id!==u.id)e.currentTarget.style.background=P.listHov;}}
                onMouseLeave={e=>{if(sel?.id!==u.id)e.currentTarget.style.background='transparent';}}>
                <Av user={u} size={38} showStatus={true}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:P.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.nom}{isMe2?' (moi)':''}</div>
                  <div style={{fontSize:11,color:P.text3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.poste}</div>
                </div>
                <div style={{width:8,height:8,borderRadius:4,background:statusDot(u.status||'online'),flexShrink:0}}/>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail */}
      <div style={{flex:1,background:sel?P.white:P.contentBg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {!sel&&(
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:12,color:P.text4}}>
            <Icon name="contacts" size={56} color={P.border}/>
            <div style={{fontSize:15,fontWeight:600}}>Sélectionnez un contact</div>
          </div>
        )}
        {sel&&(
          <div style={{flex:1,overflowY:'auto'}}>
            {/* Cover */}
            <div style={{height:120,background:`linear-gradient(135deg,${sel.couleur}40,${sel.couleur}20)`,position:'relative'}}/>
            <div style={{padding:'0 28px 24px',marginTop:-32}}>
              <div style={{display:'flex',alignItems:'flex-end',gap:16,marginBottom:16}}>
                <Av user={sel} size={72} showStatus={true}/>
                <div style={{flex:1,paddingBottom:8}}>
                  <div style={{fontSize:20,fontWeight:900,color:P.text}}>{sel.nom}</div>
                  <div style={{fontSize:13,color:P.text3}}>{sel.poste}</div>
                </div>
                <div style={{display:'flex',gap:8,paddingBottom:8}}>
                  <button onClick={()=>navigate('/cleanitcomm/chat')}
                    style={{display:'flex',alignItems:'center',gap:5,padding:'8px 14px',borderRadius:9,border:'none',background:P.blue,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer'}}>
                    <Icon name="chat" size={14} color="#fff"/> Message
                  </button>
                  <button onClick={()=>navigate('/cleanitcomm/reunions')}
                    style={{display:'flex',alignItems:'center',gap:5,padding:'8px 14px',borderRadius:9,border:`1px solid ${P.border}`,background:P.white,color:P.text2,fontSize:12,fontWeight:600,cursor:'pointer'}}>
                    <Icon name="video" size={14} color={P.text3}/> Vidéo
                  </button>
                  <button style={{display:'flex',alignItems:'center',gap:5,padding:'8px 14px',borderRadius:9,border:`1px solid ${P.border}`,background:P.white,color:P.text2,fontSize:12,fontWeight:600,cursor:'pointer'}}>
                    <Icon name="email" size={14} color={P.text3}/> Email
                  </button>
                </div>
              </div>
              <div style={{background:'#f8fafc',borderRadius:12,padding:'16px 20px',border:`1px solid ${P.border}`}}>
                <div style={{fontSize:12,fontWeight:700,color:P.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:12}}>Informations</div>
                {[
                  {l:'Département',  v:sel.dept||'—'},
                  {l:'Poste',        v:sel.poste},
                  {l:'Email',        v:sel.id+'.cleanit@cleanit.cm'},
                  {l:'Statut',       v:sel.status==='online'?'En ligne':sel.status==='busy'?'Occupé':sel.status==='away'?'Absent':'Hors ligne', c:statusDot(sel.status)},
                ].map(item=>(
                  <div key={item.l} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:`1px solid ${P.border}`,alignItems:'center'}}>
                    <span style={{fontSize:12,color:P.text3}}>{item.l}</span>
                    <span style={{fontSize:12,fontWeight:600,color:item.c||P.text}}>{item.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
export default function CleanITComm() {
  const navigate = useNavigate();
  const params   = useParams();
  const section  = params.section||'chat';
  const unread   = CHANNELS.reduce((s,c)=>s+c.unread,0);

  const getSection = () => {
    switch(section){
      case 'reunions': return <SectionReunions navigate={navigate}/>;
      case 'email':    return <SectionEmail/>;
      case 'drive':    return <SectionDrive/>;
      case 'contacts': return <SectionContacts navigate={navigate}/>;
      default:         return <SectionChat navigate={navigate}/>;
    }
  };

  return(
    <div style={{height:'100vh',display:'flex',fontFamily:"'Segoe UI',system-ui,-apple-system,Arial,sans-serif",overflow:'hidden',background:P.listBg}}>
      <style>{`
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:4px}
        textarea,input{color:inherit;font-family:inherit}
        button{font-family:inherit}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      `}</style>
      <IconNav active={section} navigate={navigate} badge={unread}/>
      <div style={{flex:1,display:'flex',overflow:'hidden',animation:'fadeIn .2s ease'}}>
        {getSection()}
      </div>
    </div>
  );
}
