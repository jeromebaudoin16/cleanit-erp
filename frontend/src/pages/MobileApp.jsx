import { useState, useEffect, useRef } from 'react';
import { AuthAPI, FeedAPI, MissionsAPI } from '../services/api.mobile.js';
import { useNavigate, useLocation } from 'react-router-dom';

// ─── DESIGN SYSTEM ───────────────────────────────────────────
const THEMES = {
  light: {
    primary:'#0066CC',primaryL:'#E6F1FB',pink:'#E86C6C',pinkL:'#FFF0F0',
    gray:'#888888',success:'#22C55E',successL:'#EAF3DE',warning:'#F59E0B',
    warningL:'#FFFBEB',danger:'#DC2626',dangerL:'#FCEBEB',border:'#EFEFEF',
    bg:'#FFFFFF',bg2:'#F5F7FA',text:'#262626',text2:'#475569',text3:'#8E8E8E',text4:'#CBD5E1',
  },
  dark: {
    primary:'#3B82F6',primaryL:'#1E3A5F',pink:'#E86C6C',pinkL:'#2D1515',
    gray:'#94A3B8',success:'#22C55E',successL:'#14532D',warning:'#F59E0B',
    warningL:'#451A03',danger:'#EF4444',dangerL:'#450A0A',border:'#334155',
    bg:'#0F172A',bg2:'#1E293B',text:'#F1F5F9',text2:'#94A3B8',text3:'#64748B',text4:'#475569',
  }
};
const getC = () => THEMES[localStorage.getItem('cit_theme')||'light'];
let C = getC();

const FONT = "system-ui,-apple-system,sans-serif";

const getW3W = async (lat, lng) => {
  try {
    const key = import.meta.env.VITE_W3W_KEY || 'KBXRJ1U9';
    const res = await fetch('https://api.what3words.com/v3/convert-to-3wa?coordinates='+lat+','+lng+'&language=fr&key='+key);
    const data = await res.json();
    return data.words || null;
  } catch { return null; }
};

// ─── TRANSLATIONS ─────────────────────────────────────────────
const TR = {
  fr: {
    login: 'Connexion', create_account: 'Creer un compte',
    email: 'Email', password: 'Mot de passe',
    forgot: 'Mot de passe oublie ?',
    connect: 'Se connecter', google: 'Continuer avec Google',
    no_account: 'Pas encore de compte ?',
    fil: 'Fil', camera: 'Camera', mission: 'Mission',
    messages: 'Messages', pointer: 'Pointer',
    equipes: 'Equipes', dispatch: 'Dispatch',
    approvals: 'Approvals', analytics: 'Analytics',
    profile: 'Profil',
    publish: 'Publier', sites_actifs: 'Sites actifs',
    scan_qr: 'Scanner un QR', my_badge: 'Mon badge',
    pointage: 'Pointage', today: 'Aujourd hui',
    arrival: 'Arrivee', departure: 'Depart', duration: 'Duree',
    history: 'Historique',
    my_mission: 'Ma mission', no_mission: 'Aucune mission assignee',
    in_progress: 'En cours', pending: 'En attente', done: 'Termine',
    deadline: 'Deadline', checklist: 'Checklist',
    arrive_site: 'Arriver sur site', on_site: 'Sur site',
    daily_report: 'Rapport du jour', send_report: 'Envoyer le rapport',
    work_done: 'Travaux realises', issues: 'Problemes rencontres',
    team_on_site: 'Equipe sur site',
    send: 'Envoyer', cancel: 'Annuler',
    all: 'Tous', terrain: 'Terrain', bureau: 'Bureau',
    active_now: 'Actifs maintenant', not_pointed: 'Pas encore pointe',
    new_mission: 'Nouvelle', to_assign: 'A assigner',
    assign: 'Assigner',
    waiting: 'En attente', approved: 'Approuve', refused: 'Refuse',
    validate: 'Valider', reject: 'Rejeter', modify: 'Modifier',
    approve: 'Approuver',
    kpis: 'KPIs du mois', missions_progress: 'Avancement missions',
    revenue_client: 'CA par client', alerts: 'Alertes importantes',
    preferences: 'Preferences', language: 'Langue', theme: 'Theme',
    notifications: 'Notifications', account: 'Compte',
    change_password: 'Changer mot de passe',
    certifications: 'Certifications',
    install: 'Installer sur l ecran',
    logout: 'Se deconnecter',
    start_cam: 'Demarrer camera', take_photo: 'Prendre photo',
    send_to: 'Envoyer vers',
    light: 'Clair', dark: 'Sombre',
    react: 'Reagir', comment: 'Commenter',
    your_validation: 'Votre validation requise',
    final_decision: 'Decision finale DG requise',
    n1_validated: 'N1 valide',
  },
  en: {
    login: 'Sign In', create_account: 'Create account',
    email: 'Email', password: 'Password',
    forgot: 'Forgot password?',
    connect: 'Sign In', google: 'Continue with Google',
    no_account: 'No account yet?',
    fil: 'Feed', camera: 'Camera', mission: 'Mission',
    messages: 'Messages', pointer: 'Check In',
    equipes: 'Teams', dispatch: 'Dispatch',
    approvals: 'Approvals', analytics: 'Analytics',
    profile: 'Profile',
    publish: 'Post', sites_actifs: 'Active sites',
    scan_qr: 'Scan QR code', my_badge: 'My badge',
    pointage: 'Check-in', today: 'Today',
    arrival: 'Arrival', departure: 'Departure', duration: 'Duration',
    history: 'History',
    my_mission: 'My mission', no_mission: 'No mission assigned',
    in_progress: 'In progress', pending: 'Pending', done: 'Completed',
    deadline: 'Deadline', checklist: 'Checklist',
    arrive_site: 'Arrive on site', on_site: 'On site',
    daily_report: 'Daily report', send_report: 'Send report',
    work_done: 'Work completed', issues: 'Issues encountered',
    team_on_site: 'Team on site',
    send: 'Send', cancel: 'Cancel',
    all: 'All', terrain: 'Field', bureau: 'Office',
    active_now: 'Active now', not_pointed: 'Not checked in',
    new_mission: 'New', to_assign: 'To assign',
    assign: 'Assign',
    waiting: 'Pending', approved: 'Approved', refused: 'Refused',
    validate: 'Validate', reject: 'Reject', modify: 'Modify',
    approve: 'Approve',
    kpis: 'Monthly KPIs', missions_progress: 'Mission progress',
    revenue_client: 'Revenue by client', alerts: 'Important alerts',
    preferences: 'Preferences', language: 'Language', theme: 'Theme',
    notifications: 'Notifications', account: 'Account',
    change_password: 'Change password',
    certifications: 'Certifications',
    install: 'Install on home screen',
    logout: 'Sign out',
    start_cam: 'Start camera', take_photo: 'Take photo',
    send_to: 'Send to',
    light: 'Light', dark: 'Dark',
    react: 'React', comment: 'Comment',
    your_validation: 'Your validation required',
    final_decision: 'DG final decision required',
    n1_validated: 'N1 validated',
  }
};

const getLang = () => localStorage.getItem('cit_lang') || 'fr';
const t = (k) => TR[getLang()]?.[k] || TR.fr[k] || k;
const getTheme = () => localStorage.getItem('cit_theme') || 'light';

// ─── DATA ─────────────────────────────────────────────────────
const USERS = [
  {id:'EI-001',name:'Marie Kamga',role:'bureau',post:'Chef Projet',av:'MK',color:'#0066CC',region:'Douala'},
  {id:'EI-002',name:'Jean Fouda',role:'pm',post:'Project Manager',av:'JF',color:'#7C3AED',region:'Yaounde'},
  {id:'EI-003',name:'Alice Finance',role:'rh',post:'RH',av:'AF',color:'#059669',region:'Douala'},
  {id:'EI-004',name:'Jerome Admin',role:'admin',post:'Administrateur',av:'JA',color:'#DC2626',region:'Douala'},
  {id:'DG-001',name:'Directeur General',role:'dg',post:'DG',av:'DG',color:'#0F172A',region:'Douala'},
  {id:'EX-001',name:'Thomas Ngono',role:'terrain',post:'Tech 5G/4G',av:'TN',color:'#EA580C',region:'Douala',certs:['HCNP-5G','HCIP']},
  {id:'EX-002',name:'Samuel Djomo',role:'terrain',post:'Tech 3G/4G',av:'SD',color:'#16A34A',region:'Bafoussam',certs:['HCNP-4G']},
  {id:'EX-003',name:'Jean Mbarga',role:'terrain',post:'Tech RF',av:'JM',color:'#0891B2',region:'Yaounde',certs:['HCNA-5G']},
  {id:'EX-004',name:'Ali Moussa',role:'terrain',post:'HSE',av:'AM',color:'#DC2626',region:'Garoua',certs:['HSE-L3']},
  {id:'EX-005',name:'Pierre Etoga',role:'terrain',post:'Tech 5G/Fibre',av:'PE',color:'#7C3AED',region:'Douala',certs:['HCIP-5G','HCNP-4G']},
];

const MISSIONS = [
  {id:'M001',site:'DLA-001',siteName:'Tour MTN Bassa',client:'MTN',type:'Installation 5G NR',
   techId:'EX-001',status:'in_progress',pct:65,deadline:'30 mai',bc:'416121376123-2',
   checklist:[{l:'Securite site verifiee',ok:true},{l:'Photos arrivee envoyees',ok:true},{l:'Cablage RRU secteur Sud',ok:false},{l:'Tests signal 5G NR',ok:false}],
   team:['EX-001','EX-002'],
   reports:[{date:'20 mai',text:'Cables poses secteur Nord. Secteur Sud prevu demain.',by:'Thomas Ngono'}]},
  {id:'M002',site:'KRI-001',siteName:'Station CAMTEL Kribi',client:'CAMTEL',type:'Swap 4G vers 5G',
   techId:'EX-005',status:'in_progress',pct:80,deadline:'22 mai',bc:'4161HG3336731-43',
   checklist:[{l:'Inspection structure',ok:true},{l:'Demontage ancien equipement',ok:true},{l:'Installation BBU 5900',ok:true},{l:'Tests finaux',ok:false}],
   team:['EX-005'],reports:[]},
  {id:'M003',site:'YDE-001',siteName:'Site Yaounde Centre',client:'Orange',type:'Maintenance 4G',
   techId:'EX-003',status:'pending',pct:0,deadline:'05 juin',bc:'416121016354-58',
   checklist:[{l:'Preparation materiel',ok:false},{l:'Autorisation acces site',ok:false}],
   team:['EX-003'],reports:[]},
];

const loadFeedPosts = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('cit_feed_posts')||'null');
    if(saved && saved.length > 0) return saved;
  } catch {}
  return [
  {id:1,userId:'EX-001',userName:'thomas_ngono',site:'DLA-001',siteName:'MTN Bassa',
   text:'Cablage RRU secteur Nord termine. Passage secteur Sud demain matin.',
   time:'12 min',reactions:{like:5,fire:2,clap:3},comments:3,type:'photo'},
  {id:2,userId:'chacha',userName:'chacha_ia',type:'alert',
   alertType:'warning',title:'Alerte meteo — GAR-001',
   text:'Pluies prevues demain 14h. Terminez les travaux exterieurs avant 13h.',time:'30 min'},
  {id:3,userId:'company',userName:'cleanit_cameroun',type:'announcement',
   text:'Felicitations equipe KRI-001 — Mission Swap 4G vers 5G terminee avec succes. Excellent travail.',
   time:'hier',reactions:{like:12,clap:8,fire:6},comments:4},
  {id:4,userId:'EX-005',userName:'pierre_etoga',site:'KRI-001',siteName:'CAMTEL Kribi',
   text:'Installation BBU 5900 complete. Tests finaux demain matin 8h.',
   time:'2h',reactions:{like:4,fire:3,clap:2},comments:1,type:'photo'},
];
};
let FEED_POSTS = loadFeedPosts();
const compressPhoto = (dataUrl, maxWidth=400, quality=0.5) => {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxWidth/img.width, maxWidth/img.height, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  });
};

const saveFeedPosts = async () => {
  try {
    const toSave = await Promise.all(FEED_POSTS.slice(0,15).map(async p => {
      if(p.photoUrl && p.photoUrl.startsWith('data:')) {
        const compressed = await compressPhoto(p.photoUrl, 400, 0.4);
        return {...p, photoUrl: compressed};
      }
      return p;
    }));
    localStorage.setItem('cit_feed_posts', JSON.stringify(toSave));
  } catch(e) { console.warn('Feed save error:', e); }
};

const CONVOS = [
  {id:1,type:'project',code:'DLA-001',client:'MTN Bassa',color:'#E6F1FB',textColor:'#0C447C',
   last:'Thomas: Cablage secteur Nord termine',time:'09:15',unread:3,
   waGroup:'https://chat.whatsapp.com/LIEN_GROUPE_MTN'},
  {id:2,type:'project',code:'KRI-001',client:'CAMTEL',color:'#EAF3DE',textColor:'#27500A',
   last:'Pierre: Tests finaux demain matin',time:'Hier',unread:0,
   waGroup:'https://chat.whatsapp.com/LIEN_GROUPE_CAMTEL'},
  {id:3,type:'whatsapp',name:'MTN — Ing. Mbarga',av:'MTN',color:'#FFCC00',
   phone:'237XXXXXXXXX',
   last:'Le test est prevu demain 8h ?',time:'10:30',unread:1},
  {id:4,type:'whatsapp',name:'Orange — Mme Ekani',av:'ORA',color:'#F97316',
   phone:'237XXXXXXXXX',
   last:'Rapport de la semaine recu merci',time:'Hier',unread:0},
  {id:5,type:'whatsapp',name:'CAMTEL — M. Biya',av:'CAM',color:'#0066CC',
   phone:'237XXXXXXXXX',
   last:'Intervention confirmee pour lundi',time:'Hier',unread:2},
  {id:6,type:'dm',userId:'EI-002',name:'Jean Fouda',av:'JF',color:'#7C3AED',
   last:'Rapport de la semaine recu',time:'Lun',unread:0},
];

const APPROVALS = [
  {id:1,userId:'EX-001',name:'Thomas Ngono',av:'TN',color:'#EA580C',
   type:'conge',label:'Conge',detail:'Conge annuel · 02-06 juin · 5 jours',
   level:1,n1:'RH',n2:'',n1done:false,n2done:false},
  {id:2,userId:'EX-005',name:'Pierre Etoga',av:'PE',color:'#7C3AED',
   type:'frais',label:'Frais',detail:'Note de frais · Transport Kribi · 45 000 FCFA',
   level:2,n1:'N1',n2:'N2',n1done:true,n2done:false},
  {id:3,userId:'EX-002',name:'Samuel Djomo',av:'SD',color:'#16A34A',
   type:'materiel',label:'Materiel',detail:'Demande materiel · 2x Cable RF LMR-400',
   level:3,n1:'N1',n2:'N2',n1done:true,n2done:true},
];

// ─── HELPERS ──────────────────────────────────────────────────
const Av = ({u,size=44}) => (
  <div style={{width:size,height:size,borderRadius:size/4,
    background:u.color+'22',border:'1.5px solid '+u.color,
    display:'flex',alignItems:'center',justifyContent:'center',
    fontSize:size*0.3,fontWeight:700,color:u.color,flexShrink:0,fontFamily:FONT}}>
    {u.av}
  </div>
);

const AvatarCircle = ({av,color,size=40}) => (
  <div style={{width:size,height:size,borderRadius:'50%',
    background:color+'22',border:'1.5px solid '+color,
    display:'flex',alignItems:'center',justifyContent:'center',
    fontSize:size*0.28,fontWeight:700,color,flexShrink:0,fontFamily:FONT}}>
    {av}
  </div>
);

const ProgressBar = ({val,color,height=5}) => (
  <div style={{background:C.bg2,borderRadius:4,height,overflow:'hidden'}}>
    <div style={{width:Math.min(100,val)+'%',height:'100%',background:color||C.primary,borderRadius:4}}/>
  </div>
);

const Toast = ({msg,show,type}) => {
  const tp = type||'info';
  const bg = tp==='success'?'#16A34A':tp==='error'?'#DC2626':tp==='warning'?'#D97706':'#1E293B';
  const icon = tp==='success'?'✓':tp==='error'?'✕':tp==='warning'?'⚠':'ℹ';
  return (
    <div style={{position:'fixed',top:16,left:'50%',zIndex:9999,pointerEvents:'none',
      transform:'translateX(-50%) translateY('+(show?'0':'-80px')+')',
      transition:'transform .3s ease',
      background:bg,color:'#fff',padding:'10px 18px',borderRadius:24,
      fontSize:13,fontWeight:600,boxShadow:'0 8px 24px rgba(0,0,0,.25)',
      whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:8}}>
      <span style={{fontSize:14}}>{icon}</span>
      {msg}
    </div>
  );
};

const useToast = () => {
  const [msg,setMsg] = useState('');
  const [show,setShow] = useState(false);
  const [type,setType] = useState('info');
  const toast = (m, tp='info') => {
    setMsg(m);setType(tp);setShow(true);
    setTimeout(()=>setShow(false),2500);
  };
  return {toast,toastMsg:msg,toastShow:show,toastType:type};
};

// ─── NAVIGATION CONFIG ────────────────────────────────────────
// SVG Icons pour la navigation
const NAV_ICONS = {
  fil: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  camera: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  mission: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 000 4h6a2 2 0 000-4M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>,
  messages: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  pointer: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
  equipes: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  approvals: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  dispatch: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  analytics: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  profil: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

const TABS = {
  terrain: [
    {id:'fil',url:'/mobile'},
    {id:'camera',url:'/mobile/camera'},
    {id:'mission',url:'/mobile/mission'},
    {id:'messages',url:'/mobile/messages'},
    {id:'profil',url:'/mobile/profil'},
  ],
  bureau: [
    {id:'fil',url:'/mobile'},
    {id:'camera',url:'/mobile/camera'},
    {id:'messages',url:'/mobile/messages'},
    {id:'pointer',url:'/mobile/pointer'},
    {id:'equipes',url:'/mobile/equipes'},
    {id:'approvals',url:'/mobile/approvals'},
    {id:'dispatch',url:'/mobile/dispatch'},
    {id:'profil',url:'/mobile/profil'},
  ],
  pm: [
    {id:'fil',url:'/mobile'},
    {id:'camera',url:'/mobile/camera'},
    {id:'messages',url:'/mobile/messages'},
    {id:'pointer',url:'/mobile/pointer'},
    {id:'equipes',url:'/mobile/equipes'},
    {id:'approvals',url:'/mobile/approvals'},
    {id:'dispatch',url:'/mobile/dispatch'},
    {id:'profil',url:'/mobile/profil'},
  ],
  rh: [
    {id:'fil',url:'/mobile'},
    {id:'messages',url:'/mobile/messages'},
    {id:'pointer',url:'/mobile/pointer'},
    {id:'approvals',url:'/mobile/approvals'},
    {id:'profil',url:'/mobile/profil'},
  ],
  dg: [
    {id:'fil',url:'/mobile'},
    {id:'messages',url:'/mobile/messages'},
    {id:'approvals',url:'/mobile/approvals'},
    {id:'analytics',url:'/mobile/analytics'},
    {id:'equipes',url:'/mobile/equipes'},
    {id:'profil',url:'/mobile/profil'},
  ],
  admin: [
    {id:'fil',url:'/mobile'},
    {id:'messages',url:'/mobile/messages'},
    {id:'pointer',url:'/mobile/pointer'},
    {id:'equipes',url:'/mobile/equipes'},
    {id:'approvals',url:'/mobile/approvals'},
    {id:'dispatch',url:'/mobile/dispatch'},
    {id:'analytics',url:'/mobile/analytics'},
    {id:'profil',url:'/mobile/profil'},
  ],
};

const LABEL = {
  fil:'Fil',camera:'Camera',mission:'Mission',messages:'Messages',
  pointer:'Pointer',equipes:'Equipes',approvals:'Approvals',
  dispatch:'Dispatch',analytics:'Analytics',profil:'Profil',
};

// ─── BOTTOM NAV ───────────────────────────────────────────────
const BottomNav = ({user,navigate,active}) => {
  const tabs = TABS[user.role] || TABS.bureau;

  return (
    <div style={{position:'fixed',bottom:0,left:0,right:0,maxWidth:430,margin:'0 auto',
      background:getC().bg,borderTop:'1px solid '+getC().border,
      display:'flex',overflowX:'auto',zIndex:100,
      paddingBottom:'env(safe-area-inset-bottom,0px)',
      scrollbarWidth:'none',msOverflowStyle:'none'}}>
      {tabs.map(tab => {
        const isActive = active===tab.id || (active===''&&tab.id==='fil');
        return (
          <button key={tab.id} onClick={()=>navigate(tab.url)}
            style={{minWidth:58,padding:'8px 4px 7px',border:'none',
              background:'transparent',display:'flex',flexDirection:'column',
              alignItems:'center',gap:2,cursor:'pointer',position:'relative',
              fontFamily:FONT,flexShrink:0}}>
            {isActive&&<div style={{position:'absolute',top:0,left:'50%',
              transform:'translateX(-50%)',width:28,height:2.5,
              borderRadius:'0 0 3px 3px',background:getC().primary}}/>}
            <span style={{
              color:isActive?getC().primary:getC().text3,
              opacity:isActive?1:.45,
              display:'flex',alignItems:'center',justifyContent:'center'}}>
              {NAV_ICONS[tab.id]}
            </span>
            <span style={{fontSize:9,fontWeight:isActive?700:400,
              color:isActive?getC().primary:getC().text3}}>{LABEL[tab.id]||tab.id}</span>
          </button>
        );
      })}
    </div>
  );
};

// ─── HEADER ───────────────────────────────────────────────────
const Header = ({title,right,showLogo}) => (
  <div style={{background:C.bg,borderBottom:'1px solid '+C.border,
    padding:'0 14px',height:52,display:'flex',alignItems:'center',gap:10,
    position:'sticky',top:0,zIndex:10}}>
    {showLogo ? (
      <div style={{display:'flex',alignItems:'center',gap:6,flex:1}}>
        <svg width="22" height="20" viewBox="0 0 122 111" fill="none">
          <circle cx="61" cy="55" r="38" stroke="#888" strokeWidth="8" fill="none"/>
          <circle cx="61" cy="17" r="9" fill="#E86C6C"/>
          <circle cx="61" cy="93" r="9" fill="#E86C6C"/>
          <circle cx="23" cy="55" r="9" fill="#E86C6C"/>
          <circle cx="99" cy="55" r="9" fill="#E86C6C"/>
        </svg>
        <span style={{fontSize:16,fontWeight:700,letterSpacing:-.3,fontFamily:FONT}}>
          <span style={{color:C.gray}}>Clean</span>
          <span style={{color:C.pink}}>IT</span>
        </span>
      </div>
    ) : (
      <div style={{flex:1,fontSize:16,fontWeight:700,color:C.text,fontFamily:FONT}}>{title}</div>
    )}
    {right}
  </div>
);

// ─── SCREEN: LOGIN ────────────────────────────────────────────
const ScreenLogin = ({onLogin}) => {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const doLogin = async() => {
    if(!email||!pwd) return setErr('Veuillez remplir tous les champs');
    setLoading(true); setErr('');
    try {
      const r = await fetch('https://backend-cleanit-erp.vercel.app/auth/login',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({email:email.trim().toLowerCase(), password:pwd.trim()})
      });
      const d = await r.json();
      if(d.token){
        localStorage.setItem('token', d.token);
        localStorage.setItem('user', JSON.stringify(d.user));
        onLogin({
          id: d.user.id,
          name: d.user.firstName+' '+d.user.lastName,
          firstName: d.user.firstName,
          lastName: d.user.lastName,
          email: d.user.email,
          role: d.user.role,
          av: (d.user.firstName?.[0]||'?')+(d.user.lastName?.[0]||''),
          color:'#1B4F8A'
        });
      } else { setErr(d.message||'Email ou mot de passe incorrect'); }
    } catch(e){ setErr('Erreur de connexion. Vérifiez votre réseau.'); }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:'100vh', margin:0,
      background:'linear-gradient(160deg,#0C2D5A 0%,#1B4F8A 45%,#2E7D32 100%)',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      padding:'20px', fontFamily:"'Inter','Helvetica Neue',Arial,sans-serif",
      position:'relative', overflow:'hidden'
    }}>
      {/* Cercles décoratifs */}
      <div style={{position:'absolute',top:-80,right:-80,width:250,height:250,borderRadius:125,background:'rgba(255,255,255,0.05)'}}/>
      <div style={{position:'absolute',bottom:-60,left:-60,width:200,height:200,borderRadius:100,background:'rgba(255,255,255,0.05)'}}/>
      <div style={{position:'absolute',top:'30%',left:-40,width:120,height:120,borderRadius:60,background:'rgba(46,125,50,0.2)'}}/>

      {/* Logo + Nom */}
      <div style={{textAlign:'center',marginBottom:32,zIndex:1}}>
        <div style={{
          width:80,height:80,borderRadius:20,
          background:'linear-gradient(135deg,#ffffff22,#ffffff44)',
          border:'2px solid rgba(255,255,255,0.3)',
          display:'flex',alignItems:'center',justifyContent:'center',
          margin:'0 auto 16px', backdropFilter:'blur(10px)'
        }}>
          <span style={{fontSize:40}}>🏢</span>
        </div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:4,marginBottom:4}}>
          <span style={{fontSize:28,fontWeight:900,color:'white',letterSpacing:'-0.5px'}}>Clean</span>
          <span style={{fontSize:28,fontWeight:900,color:'#4CAF50',letterSpacing:'-0.5px'}}>IT</span>
          <span style={{fontSize:16,fontWeight:500,color:'rgba(255,255,255,0.7)',marginLeft:4}}>ERP</span>
        </div>
        <p style={{color:'rgba(255,255,255,0.6)',fontSize:13,margin:0,letterSpacing:'0.5px'}}>
          SYSTÈME DE GESTION TERRAIN
        </p>
      </div>

      {/* Carte login */}
      <div style={{
        background:'rgba(255,255,255,0.97)',
        borderRadius:24, padding:'32px 28px',
        width:'100%', maxWidth:380,
        boxShadow:'0 24px 80px rgba(0,0,0,0.4)',
        zIndex:1
      }}>
        <h2 style={{fontSize:20,fontWeight:700,color:'#0C2D5A',margin:'0 0 4px',textAlign:'center'}}>
          Connexion
        </h2>
        <p style={{fontSize:13,color:'#6B7280',textAlign:'center',marginBottom:24}}>
          Accédez à votre espace CleanIT
        </p>

        {/* Email */}
        <div style={{marginBottom:16}}>
          <label style={{display:'block',fontSize:12,fontWeight:700,color:'#374151',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.5px'}}>
            Email
          </label>
          <div style={{position:'relative'}}>
            <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:16}}>✉️</span>
            <input
              type="text" inputMode="email"
              value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="votre@email.com"
              autoComplete="username" autoCorrect="off"
              autoCapitalize="none" spellCheck="false"
              onKeyDown={e=>e.key==='Enter'&&doLogin()}
              style={{
                width:'100%',padding:'13px 14px 13px 40px',
                border:'1.5px solid #E5E7EB',borderRadius:12,
                fontSize:14,outline:'none',boxSizing:'border-box',
                background:'#F9FAFB',color:'#111827',
                transition:'border-color 0.2s'
              }}
              onFocus={e=>e.target.style.borderColor='#1B4F8A'}
              onBlur={e=>e.target.style.borderColor='#E5E7EB'}
            />
          </div>
        </div>

        {/* Mot de passe */}
        <div style={{marginBottom:20}}>
          <label style={{display:'block',fontSize:12,fontWeight:700,color:'#374151',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.5px'}}>
            Mot de passe
          </label>
          <div style={{position:'relative'}}>
            <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:16}}>🔒</span>
            <input
              type={showPwd?'text':'password'}
              value={pwd} onChange={e=>setPwd(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password" autoCorrect="off" autoCapitalize="none"
              onKeyDown={e=>e.key==='Enter'&&doLogin()}
              style={{
                width:'100%',padding:'13px 44px 13px 40px',
                border:'1.5px solid #E5E7EB',borderRadius:12,
                fontSize:14,outline:'none',boxSizing:'border-box',
                background:'#F9FAFB',color:'#111827',
                transition:'border-color 0.2s'
              }}
              onFocus={e=>e.target.style.borderColor='#1B4F8A'}
              onBlur={e=>e.target.style.borderColor='#E5E7EB'}
            />
            <button type="button" onClick={()=>setShowPwd(!showPwd)} style={{
              position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',
              background:'none',border:'none',cursor:'pointer',fontSize:18,
              color:'#6B7280',padding:4
            }}>{showPwd?'🙈':'👁️'}</button>
          </div>
        </div>

        {/* Erreur */}
        {err&&(
          <div style={{
            background:'#FEE2E2',color:'#991B1B',
            borderRadius:10,padding:'10px 14px',
            fontSize:13,marginBottom:16,textAlign:'center',
            border:'1px solid #FECACA'
          }}>⚠️ {err}</div>
        )}

        {/* Bouton */}
        <button onClick={doLogin} disabled={loading} style={{
          width:'100%',
          background:loading?'#9CA3AF':'linear-gradient(135deg,#1B4F8A,#0C2D5A)',
          color:'white',border:'none',borderRadius:12,
          padding:'14px',fontSize:15,fontWeight:700,
          cursor:loading?'not-allowed':'pointer',
          boxShadow:loading?'none':'0 4px 20px rgba(27,79,138,0.4)',
          transition:'all 0.2s',letterSpacing:'0.3px'
        }}>
          {loading ? '⏳ Connexion...' : 'Se connecter →'}
        </button>

        <div style={{textAlign:'center',marginTop:20,paddingTop:16,borderTop:'1px solid #F3F4F6'}}>
          <span style={{fontSize:11,color:'#9CA3AF'}}>CleanIT SARL · Douala, Cameroun</span>
        </div>
      </div>

      {/* Version */}
      <p style={{color:'rgba(255,255,255,0.3)',fontSize:11,marginTop:20,zIndex:1}}>
        v2.0 · 2026
      </p>
    </div>
  );
};


const ScreenFil = ({user,navigate}) => {
  const [openEmoji,setOpenEmoji] = useState(null);
  const [reactions,setReactions] = useState({});
  const [viewPhoto,setViewPhoto] = useState(null);
  const [refreshing,setRefreshing] = useState(false);
  const [pullY,setPullY] = useState(0);
  const [posts, setPosts] = useState(FEED_POSTS);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const touchStartY = useRef(0);
  const C2 = getC();
  const EMOJIS = ['👍','🔥','👏','😮','😂','🙏'];

  // Charger posts depuis la DB
  useEffect(() => {
    const loadPosts = async () => {
      setLoadingFeed(true);
      try {
        const data = await FeedAPI.getPosts();
        if(Array.isArray(data) && data.length > 0) {
          const formatted = data.map(p => ({
            id: p.id,
            userId: String(p.user_id),
            userName: p.user_name?.toLowerCase().replace(' ','_') || 'user',
            name: p.user_name,
            site: p.site,
            siteName: p.site_name,
            text: p.text,
            photoUrl: p.photo_url,
            gpsLat: p.gps_lat,
            gpsLng: p.gps_lng,
            what3words: p.what3words,
            type: p.photo_url ? 'photo' : 'text',
            reactions: p.reactions || {like:0,fire:0,clap:0},
            comments: p.comments_count || 0,
            time: new Date(p.created_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}),
            date: new Date(p.created_at).toLocaleDateString('fr-FR'),
          }));
          setPosts(formatted);
          FEED_POSTS.length = 0;
          FEED_POSTS.push(...formatted);
        }
      } catch(e) {
        console.log('Feed offline - localStorage');
      } finally { setLoadingFeed(false); }
    };
    loadPosts();
  }, []);

  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchMove = (e) => {
    if(e.currentTarget.scrollTop > 0) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if(delta > 0) setPullY(Math.min(delta*0.4,60));
  };
  const handleTouchEnd = async () => {
    if(pullY > 40){
      setRefreshing(true);
      try {
        const data = await FeedAPI.getPosts();
        if(Array.isArray(data) && data.length > 0) {
          const formatted = data.map(p => ({
            id: p.id, userId: String(p.user_id),
            userName: p.user_name?.toLowerCase().replace(' ','_')||'user',
            name: p.user_name, site: p.site, siteName: p.site_name,
            text: p.text, photoUrl: p.photo_url,
            gpsLat: p.gps_lat, gpsLng: p.gps_lng, what3words: p.what3words,
            type: p.photo_url?'photo':'text',
            reactions: p.reactions||{like:0,fire:0,clap:0},
            comments: p.comments_count||0,
            time: new Date(p.created_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}),
          }));
          setPosts(formatted);
        }
      } catch(e) { console.log('Refresh offline'); }
      setRefreshing(false);
    }
    setPullY(0);
  };

  const terrainUsers = USERS.filter(u=>u.role==='terrain');

  if(viewPhoto) return (
    <div style={{position:'fixed',inset:0,background:'#000',zIndex:9999,display:'flex',flexDirection:'column'}}>
      <div style={{background:'rgba(0,0,0,.7)',padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <button onClick={()=>setViewPhoto(null)}
          style={{background:'rgba(255,255,255,.15)',border:'none',borderRadius:8,
            padding:'7px 14px',color:'white',cursor:'pointer',fontFamily:FONT,fontSize:13}}>
          ← Retour
        </button>
        <div style={{fontSize:12,color:'rgba(255,255,255,.7)',textAlign:'center'}}>
          <div style={{fontWeight:600,color:'white'}}>{viewPhoto.userName||viewPhoto.name}</div>
          <div style={{fontSize:10}}>{viewPhoto.time}</div>
        </div>
        {viewPhoto.photoUrl
          ? <a href={viewPhoto.photoUrl} download={'CleanIT-'+Date.now()+'.jpg'}
              style={{background:'#0066CC',borderRadius:8,padding:'7px 14px',color:'white',
                fontSize:12,fontWeight:600,textDecoration:'none'}}>⬇ Enreg.</a>
          : <div style={{width:70}}/>}
      </div>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
        {viewPhoto.photoUrl
          ? <img src={viewPhoto.photoUrl} style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain'}}/>
          : <div style={{textAlign:'center',color:'rgba(255,255,255,.3)'}}>
              <div style={{fontSize:48,marginBottom:8}}>📷</div>
              <div style={{fontSize:13}}>Photo CleanCam</div>
            </div>}
      </div>
      <div style={{background:'#0F172A',padding:'14px 16px',borderTop:'2px solid #E86C6C'}}>
        {viewPhoto.site && (
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
            <div style={{width:28,height:28,borderRadius:6,background:'#1E293B',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0066CC" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:'white'}}>{viewPhoto.site}</div>
              <div style={{fontSize:10,color:'#64748B'}}>{viewPhoto.siteName}</div>
            </div>
          </div>
        )}
        <div style={{background:'#1E293B',borderRadius:10,padding:'10px 14px',marginBottom:10}}>
          <div style={{fontSize:10,fontWeight:700,color:'#94A3B8',textTransform:'uppercase',letterSpacing:.8,marginBottom:6}}>Coordonnees GPS</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <div>
              <div style={{fontSize:10,color:'#64748B',marginBottom:2}}>Latitude</div>
              <div style={{fontSize:16,fontWeight:700,color:'#22C55E',fontFamily:'monospace'}}>{viewPhoto.gpsLat||'N/A'}</div>
            </div>
            <div>
              <div style={{fontSize:10,color:'#64748B',marginBottom:2}}>Longitude</div>
              <div style={{fontSize:16,fontWeight:700,color:'#22C55E',fontFamily:'monospace'}}>{viewPhoto.gpsLng||'N/A'}</div>
            </div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(232,108,108,.1)',borderRadius:8,padding:'8px 12px',border:'1px solid rgba(232,108,108,.3)'}}>
          <span style={{fontSize:16,color:'#E86C6C',fontWeight:900}}>///</span>
          <a href={'https://what3words.com/'+(viewPhoto.what3words||'')} target='_blank' rel='noopener noreferrer'
            style={{fontSize:12,fontWeight:700,color:'#E86C6C',textDecoration:'none'}}>
            {viewPhoto.what3words||'localisation.site.cleanit'} ↗
          </a>
        </div>
        <div style={{marginTop:8,fontSize:10,color:'#475569',textAlign:'center'}}>{viewPhoto.date||''} · {viewPhoto.time}</div>
      </div>
    </div>
  );

  return (
    <div style={{flex:1,overflowY:'auto',background:C2.bg,paddingBottom:80}}
      onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>

      {/* Pull to refresh */}
      <div style={{height:pullY,display:'flex',alignItems:'center',justifyContent:'center',
        overflow:'hidden',transition:pullY===0?'height .3s':undefined}}>
        {pullY>10 && (
          <div style={{display:'flex',alignItems:'center',gap:6,color:C2.primary,fontSize:11}}>
            {refreshing
              ? <div style={{width:14,height:14,border:'2px solid '+C2.primary,borderTopColor:'transparent',
                  borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{transform:`rotate(${pullY*3}deg)`}}>
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>}
            {refreshing?'Actualisation...':pullY>40?'Relacher...':'Tirer pour actualiser'}
          </div>
        )}
      </div>

      {/* Header */}
      <div style={{background:C2.bg,borderBottom:'1px solid '+C2.border,padding:'0 14px',height:52,
        display:'flex',alignItems:'center',gap:10,position:'sticky',top:0,zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:6,flex:1}}>
          <svg width="22" height="20" viewBox="0 0 122 111" fill="none">
            <circle cx="61" cy="55" r="38" stroke="#888" strokeWidth="8" fill="none"/>
            <circle cx="61" cy="17" r="9" fill="#E86C6C"/>
            <circle cx="61" cy="93" r="9" fill="#E86C6C"/>
            <circle cx="23" cy="55" r="9" fill="#E86C6C"/>
            <circle cx="99" cy="55" r="9" fill="#E86C6C"/>
          </svg>
          <span style={{fontSize:16,fontWeight:700,letterSpacing:-.3,fontFamily:FONT}}>
            <span style={{color:C2.gray}}>Clean</span><span style={{color:C2.pink}}>IT</span>
          </span>
        </div>
        <div style={{display:'flex',gap:14,alignItems:'center'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C2.text}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{cursor:'pointer'}}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <div style={{position:'relative',cursor:'pointer'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C2.text}
              strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <div style={{position:'absolute',top:-3,right:-3,width:8,height:8,
              background:C2.pink,borderRadius:'50%',border:'1.5px solid white'}}/>
          </div>
        </div>
      </div>

      {/* Stories */}
      <div style={{padding:'10px 14px 6px',borderBottom:'1px solid '+C2.border}}>
        <div style={{fontSize:10,fontWeight:600,color:C2.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>
          Sites actifs
        </div>
        <div style={{display:'flex',gap:12,overflowX:'auto',paddingBottom:2}}>
          {terrainUsers.map(u=>{
            const m = MISSIONS.find(ms=>ms.techId===u.id);
            return (
              <div key={u.id} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,flexShrink:0}}>
                <div style={{width:52,height:52,borderRadius:'50%',padding:2,
                  background:`linear-gradient(135deg,${C2.gray},${C2.pink})`}}>
                  <div style={{width:'100%',height:'100%',borderRadius:'50%',background:C2.bg,padding:2}}>
                    <div style={{width:'100%',height:'100%',borderRadius:'50%',background:u.color+'22',
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:13,fontWeight:700,color:u.color}}>{u.av}</div>
                  </div>
                </div>
                <span style={{fontSize:9,color:C2.text,maxWidth:52,overflow:'hidden',
                  textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m?m.site:u.av}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feed */}
      {posts.map(post=>(
        <div key={post.id} style={{borderBottom:'1px solid '+C2.border}}>
          <div style={{padding:'8px 12px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              {post.userId==='chacha'
                ? <div style={{width:30,height:30,borderRadius:'50%',background:C2.primaryL,border:'1.5px solid '+C2.primary,
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:C2.primary}}>CC</div>
                : post.userId==='company'
                ? <div style={{width:30,height:30,borderRadius:8,background:C2.bg2,border:'1px solid '+C2.border,
                    display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <svg width="16" height="15" viewBox="0 0 122 111" fill="none">
                      <circle cx="61" cy="55" r="28" stroke="#888" strokeWidth="7" fill="none"/>
                      <circle cx="61" cy="27" r="8" fill="#E86C6C"/>
                      <circle cx="61" cy="83" r="8" fill="#E86C6C"/>
                      <circle cx="33" cy="55" r="8" fill="#E86C6C"/>
                      <circle cx="89" cy="55" r="8" fill="#E86C6C"/>
                    </svg>
                  </div>
                : <div style={{width:30,height:30,borderRadius:'50%',padding:1.5,
                    background:`linear-gradient(135deg,${C2.gray},${C2.pink})`}}>
                    <div style={{width:'100%',height:'100%',borderRadius:'50%',background:C2.bg,padding:1.5}}>
                      <div style={{width:'100%',height:'100%',borderRadius:'50%',background:C2.primaryL,
                        display:'flex',alignItems:'center',justifyContent:'center',
                        fontSize:10,fontWeight:700,color:C2.primary}}>
                        {(post.userName||'').slice(-3,-1).toUpperCase()||'CL'}
                      </div>
                    </div>
                  </div>}
              <div>
                <div style={{fontSize:12,fontWeight:700,color:post.userId==='chacha'?C2.primary:C2.text}}>
                  {post.userName}
                </div>
                {post.site
                  ? <div style={{fontSize:9,color:C2.text3}}>📍 {post.site} · {post.siteName} · {post.time}</div>
                  : <div style={{fontSize:9,color:C2.text3}}>{post.time}</div>}
              </div>
            </div>
            {post.userId==='chacha'
              ? <div style={{background:C2.primaryL,padding:'2px 8px',borderRadius:10,fontSize:9,color:C2.primary,fontWeight:600}}>IA</div>
              : <span style={{fontSize:18,cursor:'pointer',color:C2.text3}}>⋯</span>}
          </div>

          {post.type==='photo' && (
            <div onClick={()=>setViewPhoto(post)}
              style={{background:'#1E293B',height:220,display:'flex',alignItems:'center',
                justifyContent:'center',position:'relative',overflow:'hidden',cursor:'pointer'}}>
              {post.photoUrl
                ? <img src={post.photoUrl} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                : <div style={{textAlign:'center',color:'rgba(255,255,255,.3)'}}>
                    <div style={{fontSize:32,marginBottom:4}}>📷</div>
                    <div style={{fontSize:10}}>Photo CleanCam</div>
                  </div>}
              {post.site && (
                <div style={{position:'absolute',bottom:8,right:10,background:'rgba(0,0,0,.6)',
                  padding:'2px 7px',borderRadius:10,fontSize:8,color:'white'}}>📍 {post.site}</div>
              )}
            </div>
          )}
          {post.type==='alert' && (
            <div style={{margin:'0 12px',background:C2.warningL,borderRadius:8,
              padding:'10px 12px',borderLeft:'3px solid '+C2.warning}}>
              <div style={{fontSize:11,fontWeight:700,color:'#92400E',marginBottom:3}}>🌧 {post.title}</div>
              <div style={{fontSize:11,color:'#78350F',lineHeight:1.5}}>{post.text}</div>
            </div>
          )}

          <div style={{padding:'8px 12px'}}>
            {post.type!=='alert' && (
              <div style={{fontSize:11,color:C2.text,lineHeight:1.4,marginBottom:6}}>
                <span style={{fontWeight:700}}>{post.userName}</span> {post.text}
              </div>
            )}
            {post.reactions && (
              <div style={{display:'flex',alignItems:'center',gap:4,marginBottom:6}}>
                <span style={{fontSize:12}}>{reactions[post.id]||''}{post.reactions.fire>0?'🔥':''}{post.reactions.clap>0?'👏':''}</span>
                <span style={{fontSize:11,fontWeight:600,color:C2.text}}>
                  {(post.reactions.like||0)+(post.reactions.fire||0)+(post.reactions.clap||0)+(reactions[post.id]?1:0)} reactions
                </span>
              </div>
            )}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',
              paddingTop:6,borderTop:'1px solid '+C2.border,position:'relative'}}>
              <div style={{display:'flex',gap:14,alignItems:'center'}}>
                <div style={{position:'relative'}}>
                  <button onClick={()=>setOpenEmoji(openEmoji===post.id?null:post.id)}
                    style={{background:'none',border:'none',cursor:'pointer',padding:0,lineHeight:1,
                      display:'flex',alignItems:'center'}}>
                    {reactions[post.id]
                      ? <span style={{fontSize:20}}>{reactions[post.id]}</span>
                      : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C2.text}
                          strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                          <line x1="9" y1="9" x2="9.01" y2="9"/>
                          <line x1="15" y1="9" x2="15.01" y2="9"/>
                        </svg>}
                  </button>
                  {openEmoji===post.id && (
                    <div style={{position:'absolute',bottom:32,left:-4,background:C2.bg,
                      border:'0.5px solid '+C2.border,borderRadius:20,padding:'6px 8px',
                      display:'flex',gap:6,boxShadow:'0 4px 16px rgba(0,0,0,.15)',zIndex:10}}>
                      {EMOJIS.map(e=>(
                        <button key={e} onClick={()=>{setReactions(r=>({...r,[post.id]:e}));setOpenEmoji(null);}}
                          style={{background:'none',border:'none',cursor:'pointer',fontSize:20,padding:2}}>
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C2.text}
                  strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{cursor:'pointer'}}>
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C2.text}
                  strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{cursor:'pointer'}}>
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </div>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C2.text}
                strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{cursor:'pointer'}}>
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
              </svg>
            </div>
            {post.comments>0 && <div style={{fontSize:10,color:C2.text3,marginTop:4}}>Voir les {post.comments} commentaires</div>}
            <div style={{fontSize:9,color:C2.text4,marginTop:2,textTransform:'uppercase',letterSpacing:.3}}>{post.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ScreenCamera = ({user, gps, now}) => {
  const vRef = useRef(null);
  const cRef = useRef(null);
  const streamRef = useRef(null);
  const [active, setActive] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [last, setLast] = useState(null);
  const [flash, setFlash] = useState(false);
  const [w3wAddress, setW3wAddress] = useState(null);
  const {toast, toastMsg, toastShow,toastType} = useToast();
  const n = now || new Date();

  useEffect(() => {
    if(gps && !w3wAddress) {
      getW3W(gps.lat, gps.lng).then(w => { if(w) setW3wAddress(w); });
    }
  }, [gps]);

  const stopCam = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if(vRef.current) vRef.current.srcObject = null;
    setActive(false);
  };

  const startCam = async () => {
    try {
      const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
      const constraints = isMobile
        ? {video:{facingMode:'environment'}, audio:false}
        : {video:{width:{ideal:1280},height:{ideal:720}}, audio:false};

      const s = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = s;

      if(vRef.current) {
        vRef.current.srcObject = s;
        vRef.current.muted = true;
        vRef.current.volume = 0;
        vRef.current.onloadedmetadata = () => {
          vRef.current?.play().catch(e => console.warn(e));
          setActive(true);
        };
        // Fallback si onloadedmetadata ne se declenche pas
        setTimeout(() => {
          if(!active && vRef.current?.readyState >= 1) {
            vRef.current.play().catch(()=>{});
            setActive(true);
          }
        }, 1500);
      }
    } catch(e) {
      if(e.name==='NotAllowedError') toast('Autorisez la camera dans le navigateur');
      else if(e.name==='NotFoundError') toast('Aucune camera detectee');
      else toast('Erreur: '+e.name);
    }
  };

  const shoot = () => {
    const v = vRef.current;
    const canvas = cRef.current;
    if(!v || !canvas) return;
    canvas.width = v.videoWidth || 640;
    canvas.height = v.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    const barH = 60;
    ctx.fillStyle = 'rgba(0,0,0,.75)';
    ctx.fillRect(0, canvas.height-barH, canvas.width, barH);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px system-ui';
    const mission = MISSIONS.find(m => m.techId === user.id);
    ctx.fillText('CleanIT — '+user.name+(mission?' — '+mission.site:''), 10, canvas.height-barH+20);
    ctx.font = '11px system-ui';
    const d = n.toLocaleDateString('fr-FR')+' '+n.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
    const g = gps?' · '+gps.lat.toFixed(4)+','+gps.lng.toFixed(4):'';
    ctx.fillText(d+g, 10, canvas.height-barH+38);
    ctx.fillStyle = '#E86C6C';
    ctx.font = 'bold 10px system-ui';
    ctx.fillText('///'+(w3wAddress||'localisation.site.cleanit'), 10, canvas.height-barH+54);
    const url = canvas.toDataURL('image/jpeg', 0.9);
    const photoId = Date.now();
    setPhotos(p => [{id:photoId, url}, ...p]);
    setLast(url);
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
    // Sauvegarder automatiquement dans le telephone
    const link = document.createElement('a');
    link.href = url;
    link.download = 'CleanIT-'+user.name.replace(' ','-')+'-'+new Date().toISOString().slice(0,10)+'-'+photoId+'.jpg';
    link.click();
    toast('Photo sauvegardee dans Telechargements');
  };

  useEffect(() => () => stopCam(), []);

  const C2 = getC();

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',background:'#000',position:'relative'}}>
      <Toast msg={toastMsg} show={toastShow} type={toastType}/>
      <canvas ref={cRef} style={{display:'none'}}/>
      {flash && <div style={{position:'absolute',inset:0,background:'#fff',zIndex:50,opacity:.7,pointerEvents:'none'}}/>}

      <div style={{flex:1,position:'relative',overflow:'hidden',background:'#0a0a0a',minHeight:300}}>
        <video ref={vRef} autoPlay playsInline
          style={{width:'100%',height:'100%',objectFit:'cover',
            display:active?'block':'none'}}/>

        {!active && (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',
            justifyContent:'center',height:'100%',gap:10}}>
            {last
              ? <img src={last} style={{maxWidth:'100%',maxHeight:'65vh',objectFit:'contain',borderRadius:6}}/>
              : <div style={{textAlign:'center',color:'rgba(255,255,255,.3)'}}>
                  <div style={{fontSize:48,marginBottom:8}}>📷</div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,.5)'}}>Appuyez pour demarrer</div>
                </div>
            }
          </div>
        )}

        {active && (
          <>
            <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.2,pointerEvents:'none'}}
              viewBox="0 0 3 4">
              <line x1="1" y1="0" x2="1" y2="4" stroke="white" strokeWidth=".04"/>
              <line x1="2" y1="0" x2="2" y2="4" stroke="white" strokeWidth=".04"/>
              <line x1="0" y1="1.33" x2="3" y2="1.33" stroke="white" strokeWidth=".04"/>
              <line x1="0" y1="2.67" x2="3" y2="2.67" stroke="white" strokeWidth=".04"/>
            </svg>
            <div style={{position:'absolute',top:10,left:10,background:'rgba(0,0,0,.5)',
              padding:'3px 8px',borderRadius:10,display:'flex',alignItems:'center',gap:4}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#22C55E'}}/>
              <span style={{fontSize:8,color:'white',fontWeight:500}}>
                GPS {gps ? Math.round(gps.accuracy)+'m' : '...'}
              </span>
            </div>
            <div style={{position:'absolute',bottom:0,left:0,right:0,
              background:'linear-gradient(transparent,rgba(0,0,0,.8))',padding:'10px 12px 6px'}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,.9)',fontWeight:600}}>{user.name}</div>
              <div style={{fontSize:8,color:'rgba(255,255,255,.6)'}}>
                {n.toLocaleDateString('fr-FR')} {n.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
                {gps ? ' · '+gps.lat.toFixed(5)+', '+gps.lng.toFixed(5) : ''}
              </div>
              <div style={{fontSize:8,color:'#E86C6C',marginTop:1}}>///{w3wAddress||'GPS en cours...'}</div>
            </div>
          </>
        )}
      </div>

      <div style={{background:'#111',padding:'6px 12px',display:'flex',justifyContent:'center',gap:6}}>
        {['Grille','Before/After','Scan serie'].map((m,i)=>(
          <button key={i} style={{background:'rgba(255,255,255,.1)',border:'none',
            borderRadius:8,padding:'4px 10px',color:'white',fontSize:9,
            cursor:'pointer',fontFamily:FONT}}>{m}</button>
        ))}
      </div>

      <div style={{background:'#0a0a0a',padding:'14px 20px 24px',
        display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{width:52,height:52}}>
          {photos[0] && <img src={photos[0].url}
            style={{width:52,height:52,borderRadius:8,objectFit:'cover',
              border:'2px solid rgba(255,255,255,.2)'}}/>}
        </div>

        {active ? (
          <button onClick={shoot}
            style={{width:70,height:70,borderRadius:'50%',border:'4px solid white',
              background:'transparent',cursor:'pointer',
              display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{width:56,height:56,borderRadius:'50%',background:'white'}}/>
          </button>
        ) : (
          <button onClick={startCam}
            style={{width:70,height:70,borderRadius:'50%',border:'none',
              background:'#0066CC',cursor:'pointer',
              display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round'><path d='M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z'/><circle cx='12' cy='13' r='4'/></svg>
          </button>
        )}

        <div style={{width:52,display:'flex',flexDirection:'column',gap:8,alignItems:'center'}}>
          {active ? (
            <button onClick={stopCam}
              style={{width:42,height:42,borderRadius:10,border:'1px solid #333',
                background:'#1a1a1a',cursor:'pointer',display:'flex',
                alignItems:'center',justifyContent:'center'}}>
              <div style={{width:14,height:14,background:'#ef4444',borderRadius:2}}/>
            </button>
          ) : photos.length > 0 ? (
            <button onClick={()=>toast('Photo envoyee au projet')}
              style={{padding:'8px 10px',borderRadius:8,border:'none',
                background:'#0066CC',cursor:'pointer',color:'white',
                fontSize:10,fontWeight:600,fontFamily:FONT}}>
              Envoyer
            </button>
          ) : null}
        </div>
      </div>

      {!active && photos.length > 0 && (
        <div style={{background:'#0a0a0a',padding:'0 12px 12px',
          display:'flex',gap:5,overflowX:'auto'}}>
          {photos.map(p=>(
            <img key={p.id} src={p.url}
              style={{width:52,height:52,borderRadius:6,objectFit:'cover',
                flexShrink:0,border:'1.5px solid #333'}}/>
          ))}
        </div>
      )}

      {!active && (
        <div style={{background:'#0a0a0a',padding:'0 14px 10px',textAlign:'center'}}>
          <div style={{fontSize:9,color:'rgba(255,255,255,.4)',marginBottom:6}}>Envoyer vers</div>
          <div style={{display:'flex',gap:6,justifyContent:'center'}}>
            {[
              {label:'Fil', action:()=>{
                if(last){
                  const mission = MISSIONS.find(m=>m.techId===user.id);
                  const newPost = {
                    id:Date.now(),
                    userId:user.id,
                    userName:user.name.toLowerCase().replace(' ','_'),
                    name:user.name,
                    site:mission?.site||'',
                    siteName:mission?.siteName||'',
                    text:'Photo prise sur site — '+( mission?.site||'CleanIT'),
                    time:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}),
                    date:new Date().toLocaleDateString('fr-FR'),
                    gpsLat:gps ? gps.lat.toFixed(5)+'° N' : null,
                    gpsLng:gps ? gps.lng.toFixed(5)+'° E' : null,
                    gpsAcc:gps?.accuracy||null,
                    what3words:w3wAddress||'localisation.site.cleanit',
                    reactions:{like:0,fire:0,clap:0},
                    comments:0,
                    type:'photo',
                    photoUrl:last
                  };
                  // Publier vers API
                  try { FeedAPI.createPost({
                      text: newPost.text, site: newPost.site,
                      siteName: newPost.siteName, photoUrl: newPost.photoUrl,
                      gpsLat: newPost.gpsLat, gpsLng: newPost.gpsLng,
                      what3words: newPost.what3words, type: 'photo'
                    }).catch(e => console.log('API offline'));
                  } catch(e) {}
                  FEED_POSTS.unshift(newPost);
                  saveFeedPosts();
                  toast('Photo publiee dans le Fil', 'success');
                } else toast('Prenez une photo d abord');
              }},
              {label:'Projet', action:()=>{ toast('Envoye au projet'); }},
              {label:'Message', action:()=>{ toast('Envoye en message'); }},
            ].map(({label,action})=>(
              <button key={label} onClick={action}
                style={{background:'rgba(255,255,255,.15)',border:'none',
                  borderRadius:20,padding:'5px 14px',color:'white',
                  fontSize:9,cursor:'pointer',fontFamily:FONT,fontWeight:500}}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── SCREEN: MESSAGES ─────────────────────────────────────────
const ScreenMessages = () => {
  const [openConv, setOpenConv] = useState(null);
  const [msg, setMsg] = useState('');
  const [chatMsgs, setChatMsgs] = useState([
    {id:1,from:'other',text:'Bonjour, ou en est la mission ?',time:'09:10'},
    {id:2,from:'me',text:'On a termine le cablage secteur Nord.',time:'09:12'},
    {id:3,from:'other',text:'Parfait, le secteur Sud pour quand ?',time:'09:15'},
  ]);

  const C2 = getC();

  if(openConv) return (
    <div style={{flex:1,display:'flex',flexDirection:'column',background:C2.bg,paddingBottom:0}}>
      <div style={{background:C2.bg,borderBottom:'1px solid '+C2.border,
        padding:'10px 14px',display:'flex',alignItems:'center',gap:10}}>
        <button onClick={()=>setOpenConv(null)}
          style={{background:'none',border:'none',cursor:'pointer',
            color:C2.primary,fontSize:22,padding:0,fontFamily:FONT}}>←</button>
        <div style={{width:36,height:36,
          borderRadius:openConv.type==='project'?10:'50%',
          background:(openConv.color||C2.primary)+'22',
          border:'1.5px solid '+(openConv.color||C2.primary),
          display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:12,fontWeight:700,
          color:openConv.textColor||openConv.color||C2.primary}}>
          {openConv.av||openConv.code?.split('-')[0]||'?'}
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:700,color:C2.text}}>
            {openConv.type==='project'
              ? openConv.code+' · '+openConv.client
              : openConv.name||openConv.from}
          </div>
          {openConv.type==='whatsapp'&&(
            <div style={{fontSize:10,color:'#25D366',fontWeight:600,
              display:'flex',alignItems:'center',gap:4}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#25D366'}}/>
              WhatsApp Business · {openConv.phone||'Non configuré'}
            </div>
          )}
        </div>
        <span style={{fontSize:20,cursor:'pointer'}}>📞</span>
        {openConv.waGroup && (
          <a href={openConv.waGroup} target='_blank' rel='noopener noreferrer'
            style={{background:'#25D366',border:'none',borderRadius:8,
              padding:'6px 10px',color:'white',fontSize:11,fontWeight:700,
              textDecoration:'none',display:'flex',alignItems:'center',gap:4}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Groupe
          </a>
        )}
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'12px 14px',
        display:'flex',flexDirection:'column',gap:8,paddingBottom:80}}>
        {chatMsgs.map(m=>(
          <div key={m.id} style={{display:'flex',
            justifyContent:m.from==='me'?'flex-end':'flex-start'}}>
            <div style={{maxWidth:'75%',padding:'9px 12px',
              borderRadius:m.from==='me'?'16px 16px 4px 16px':'16px 16px 16px 4px',
              background:m.from==='me'?C2.primary:C2.bg2,
              color:m.from==='me'?'#fff':C2.text}}>
              <div style={{fontSize:13,lineHeight:1.4}}>{m.text}</div>
              <div style={{fontSize:9,marginTop:4,textAlign:'right',
                color:m.from==='me'?'rgba(255,255,255,.7)':C2.text3,
                display:'flex',alignItems:'center',justifyContent:'flex-end',gap:3}}>
                {m.time}
                {m.from==='me' && openConv.type==='whatsapp' && (
                  <span style={{color:'rgba(255,255,255,.7)'}}>✓✓</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{position:'fixed',bottom:0,left:0,right:0,maxWidth:430,margin:'0 auto',
        padding:'10px 14px',background:C2.bg,borderTop:'1px solid '+C2.border,
        display:'flex',gap:8,zIndex:50}}>
        <input value={msg} onChange={e=>setMsg(e.target.value)}
          placeholder="Ecrivez un message..."
          onKeyDown={e=>{if(e.key==='Enter'&&msg.trim()){
            setChatMsgs(p=>[...p,{id:Date.now(),from:'me',text:msg,
              time:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}]);
            setMsg('');
          }}}
          style={{flex:1,padding:'10px 14px',border:'0.5px solid '+C2.border,
            borderRadius:24,fontSize:13,fontFamily:FONT,
            background:C2.bg2,color:C2.text,outline:'none'}}/>
        <button onClick={async ()=>{
          if(!msg.trim()) return;
          const newMsg = {id:Date.now(),from:'me',text:msg,
            time:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})};
          setChatMsgs(p=>[...p,newMsg]);
          const msgText = msg;
          setMsg('');
          // Si conversation WhatsApp → envoyer via API
          if(openConv.type==='whatsapp' && openConv.phone) {
            try {
              const token = localStorage.getItem('cit_token');
              await fetch('https://backend-cleanit-erp.vercel.app/whatsapp/send', {
                method:'POST',
                headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
                body: JSON.stringify({to: openConv.phone, message: msgText})
              });
            } catch(e) { console.log('WhatsApp send error:', e); }
          }
        }} style={{width:42,height:42,borderRadius:21,background:C2.primary,
          border:'none',cursor:'pointer',display:'flex',alignItems:'center',
          justifyContent:'center',flexShrink:0}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );

  const C2b = getC();
  return (
    <div style={{flex:1,overflowY:'auto',background:C2b.bg,paddingBottom:80}}>
      <Header title="Messages" right={
        <div style={{display:'flex',gap:14}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke={C2b.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{cursor:'pointer'}}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
      }/>
      {[
        {label:'Projets en cours',items:CONVOS.filter(cv=>cv.type==='project')},
        {label:'Clients WhatsApp',items:CONVOS.filter(cv=>cv.type==='whatsapp')},
        {label:'Messages directs',items:CONVOS.filter(cv=>cv.type==='dm')},
      ].map(sec=>(
        <div key={sec.label}>
          <div style={{padding:'8px 14px 4px',background:C2b.bg2,
            borderBottom:'0.5px solid '+C2b.border}}>
            <span style={{fontSize:10,fontWeight:700,color:C2b.text3,
              textTransform:'uppercase',letterSpacing:.5}}>{sec.label}</span>
          </div>
          {sec.items.map(conv=>(
            <div key={conv.id} onClick={()=>setOpenConv(conv)}
              style={{display:'flex',alignItems:'center',gap:10,
                padding:'12px 14px',borderBottom:'0.5px solid '+C2b.border,
                cursor:'pointer',background:C2b.bg}}>
              <div style={{position:'relative',flexShrink:0}}>
                {conv.type==='project' ? (
                  <div style={{width:44,height:44,borderRadius:10,
                    background:conv.color,border:'1px solid '+C2b.border,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:11,fontWeight:700,color:conv.textColor}}>
                    {conv.code.split('-')[0]}
                  </div>
                ) : (
                  <div style={{width:44,height:44,borderRadius:'50%',
                    background:(conv.color||C2b.primary)+'22',
                    border:'1.5px solid '+(conv.color||C2b.primary),
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:12,fontWeight:700,color:conv.color||C2b.primary}}>
                    {conv.av||conv.name?.slice(0,2)}
                  </div>
                )}
                {conv.type==='whatsapp'&&(
                  <div style={{position:'absolute',bottom:-1,right:-1,
                    width:14,height:14,background:'#25D366',borderRadius:'50%',
                    border:'2px solid white',display:'flex',alignItems:'center',
                    justifyContent:'center',fontSize:8,color:'white',fontWeight:700}}>
                    W
                  </div>
                )}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                  <span style={{fontSize:13,fontWeight:conv.unread?700:500,color:C2b.text}}>
                    {conv.type==='project'?conv.code+' · '+conv.client:conv.name}
                  </span>
                  <span style={{fontSize:10,color:C2b.text3}}>{conv.time}</span>
                </div>
                <div style={{fontSize:11,color:C2b.text3,overflow:'hidden',
                  textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{conv.last}</div>
              </div>
              {conv.unread>0&&(
                <div style={{width:20,height:20,borderRadius:10,
                  background:C2b.pink||'#E86C6C',color:'white',fontSize:10,fontWeight:700,
                  display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  {conv.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// ─── SCREEN: POINTER ──────────────────────────────────────────
const ScreenPointer = ({user, gps}) => {
  const [mode, setMode] = useState('badge');
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animRef = useRef(null);
  const {toast,toastMsg,toastShow,toastType} = useToast();
  const C2 = getC();

  useEffect(() => {
    const token = localStorage.getItem('cit_token');
    fetch('https://backend-cleanit-erp.vercel.app/pointages',{headers:{'Authorization':'Bearer '+token}})
      .then(r=>r.json()).then(d=>{if(Array.isArray(d))setHistory(d);}).catch(()=>{});
    if(!window.jsQR){
      const s=document.createElement('script');
      s.src='https://cdnjs.cloudflare.com/ajax/libs/jsqr/1.4.0/jsQR.min.js';
      document.head.appendChild(s);
    }
    return()=>stopScan();
  },[]);

  const stopScan = () => {
    if(animRef.current) cancelAnimationFrame(animRef.current);
    if(streamRef.current) streamRef.current.getTracks().forEach(t=>t.stop());
    streamRef.current=null; setScanning(false);
  };

  const scanFrame = () => {
    if(!videoRef.current||!canvasRef.current) return;
    const v=videoRef.current; const cv=canvasRef.current;
    const ctx=cv.getContext('2d');
    if(v.readyState===v.HAVE_ENOUGH_DATA){
      cv.width=v.videoWidth; cv.height=v.videoHeight;
      ctx.drawImage(v,0,0,cv.width,cv.height);
      const img=ctx.getImageData(0,0,cv.width,cv.height);
      if(window.jsQR){
        const code=window.jsQR(img.data,img.width,img.height);
        if(code){handleQRCode(code.data);return;}
      }
    }
    animRef.current=requestAnimationFrame(scanFrame);
  };

  const startScan = async() => {
    setScanning(true); setScanned(null);
    try {
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
      streamRef.current=stream;
      if(videoRef.current){videoRef.current.srcObject=stream;await videoRef.current.play();}
      scanFrame();
    } catch(e){toast('Camera non disponible','error');setScanning(false);}
  };

  const handleQRCode = async(data) => {
    stopScan();
    let site={code:data,name:data};
    try{const p=JSON.parse(data);site={code:p.code||data,name:p.name||data};}catch(e){}
    setScanned(site); setLoading(true);
    try {
      const token=localStorage.getItem('cit_token');
      const r=await fetch('https://backend-cleanit-erp.vercel.app/pointages',{
        method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
        body:JSON.stringify({siteCode:site.code,siteName:site.name,type:'arrivee',gpsLat:gps?.lat,gpsLng:gps?.lng})
      });
      const d=await r.json();
      toast('Pointage: '+site.name,'success');
      setHistory(h=>[{...d,site_name:site.name,created_at:new Date().toISOString()},...h]);
    } catch(e){toast('Erreur','error');}
    setLoading(false);
  };

  const bColor={admin:'#DC2626',project_manager:'#7C3AED',hr:'#059669',technician:'#EA580C',terrain:'#EA580C'}[user.role]||C2.primary;
  const av=((user.firstName||user.name||'U')[0]+((user.lastName||'')[0]||'')).toUpperCase();

  return(
    <div style={{flex:1,overflowY:'auto',background:C2.bg,paddingBottom:80}}>
      <Toast msg={toastMsg} show={toastShow} type={toastType}/>
      <Header title="Pointer"/>
      <div style={{display:'flex',borderBottom:'1px solid '+C2.border}}>
        {[['badge','Badge'],['scan','Scanner QR'],['historique','Historique']].map(([id,lbl])=>(
          <button key={id} onClick={()=>{setMode(id);if(id!=='scan')stopScan();}}
            style={{flex:1,padding:'9px 4px',border:'none',background:C2.bg,fontSize:10,
              fontWeight:mode===id?700:500,cursor:'pointer',fontFamily:FONT,
              color:mode===id?C2.primary:C2.text3,
              borderBottom:mode===id?'2px solid '+C2.primary:'2px solid transparent'}}>{lbl}</button>
        ))}
      </div>
      {mode==='badge'&&(
        <div style={{padding:20,display:'flex',flexDirection:'column',alignItems:'center',gap:14}}>
          <div style={{width:120,height:120,borderRadius:24,background:bColor+'15',border:'2px solid '+bColor,
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:44,fontWeight:800,color:bColor}}>{av}</div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:18,fontWeight:700,color:C2.text}}>{user.firstName||user.name} {user.lastName||''}</div>
            <div style={{fontSize:12,color:C2.text3}}>{user.role} · CleanIT</div>
          </div>
          <div style={{background:bColor,borderRadius:10,padding:'8px 20px',width:'100%',textAlign:'center',color:'white',fontSize:12,fontWeight:600}}>
            ID: EMP-{String(user.id||'001').padStart(4,'0')}
          </div>
        </div>
      )}
      {mode==='scan'&&(
        <div style={{padding:16,display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
          {!scanning&&!scanned&&(
            <button onClick={startScan} style={{background:C2.primary,border:'none',borderRadius:12,
              padding:'14px 32px',color:'white',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:FONT}}>
              📷 Scanner QR du site
            </button>
          )}
          {scanning&&(
            <div style={{position:'relative',width:'100%',maxWidth:320,borderRadius:16,overflow:'hidden',border:'2px solid '+C2.primary}}>
              <video ref={videoRef} style={{width:'100%',display:'block'}} playsInline muted/>
              <canvas ref={canvasRef} style={{display:'none'}}/>
              <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
                width:180,height:180,border:'2px solid white',borderRadius:8,
                boxShadow:'0 0 0 1000px rgba(0,0,0,.5)'}}/>
              <button onClick={stopScan} style={{position:'absolute',bottom:12,left:'50%',transform:'translateX(-50%)',
                background:'rgba(0,0,0,.6)',border:'none',borderRadius:20,padding:'8px 20px',
                color:'white',fontSize:12,cursor:'pointer',fontFamily:FONT}}>Annuler</button>
            </div>
          )}
          {scanned&&(
            <div style={{background:C2.successL,borderRadius:12,padding:16,width:'100%',textAlign:'center',border:'1px solid '+C2.success}}>
              <div style={{fontSize:24,marginBottom:8}}>✅</div>
              <div style={{fontSize:14,fontWeight:700,color:C2.success}}>Pointage enregistré</div>
              <div style={{fontSize:12,color:C2.text,marginTop:6}}>{scanned.name}</div>
              <div style={{fontSize:10,color:C2.text3,marginTop:4}}>{new Date().toLocaleString('fr-FR')}</div>
              <button onClick={()=>{setScanned(null);}} style={{marginTop:12,background:C2.primary,border:'none',
                borderRadius:8,padding:'8px 20px',color:'white',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:FONT}}>
                Scanner encore
              </button>
            </div>
          )}
        </div>
      )}
      {mode==='historique'&&(
        <div style={{padding:'8px 0'}}>
          {history.length===0?<div style={{padding:32,textAlign:'center',color:C2.text3}}>Aucun pointage</div>:
          history.map((h,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderBottom:'0.5px solid '+C2.border}}>
              <div style={{width:36,height:36,borderRadius:'50%',background:C2.successL,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>📍</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:C2.text}}>{h.site_name||h.site_code}</div>
                <div style={{fontSize:10,color:C2.text3}}>{new Date(h.created_at).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</div>
              </div>
              <div style={{background:C2.successL,color:C2.success,padding:'3px 8px',borderRadius:8,fontSize:10,fontWeight:700}}>✓</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
const ScreenMission = ({user,gps,navigate}) => {
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [arrived,setArrived] = useState(false);
  const [showReport,setShowReport] = useState(false);
  const [report,setReport] = useState({done:'',issues:''});
  const {toast,toastMsg,toastShow,toastType} = useToast();

  useEffect(() => {
    MissionsAPI.getMy().then(data => {
      if(Array.isArray(data) && data.length > 0) {
        const m = data[0];
        setMission({
          id: m.id, site: m.site, siteName: m.site_name,
          client: m.client, type: m.type, techId: m.tech_id,
          status: m.status, pct: m.progress||0,
          deadline: m.deadline||'', bc: m.bc_number||'',
          checklist: m.checklist||[], team: m.team_ids||[],
          reports: []
        });
      } else {
        // Fallback demo
        const demo = MISSIONS.find(ms=>ms.techId===user.id);
        setMission(demo||null);
      }
    }).catch(() => {
      const demo = MISSIONS.find(ms=>ms.techId===user.id);
      setMission(demo||null);
    }).finally(() => setLoading(false));
  }, []);
  const statusColors = {in_progress:C.primary,pending:C.warning,done:C.success};

  return (
    <div style={{flex:1,overflowY:'auto',background:C.bg,paddingBottom:80}}>
      <Toast msg={toastMsg} show={toastShow} type={toastType}/>
      <Header title={t('my_mission')} right={
        mission && <span style={{background:`${statusColors[mission.status]}22`,
          color:statusColors[mission.status],padding:'4px 10px',
          borderRadius:20,fontSize:10,fontWeight:700}}>
          {t(mission.status)}
        </span>
      }/>
      {!mission ? (
        <div style={{margin:16,background:C.bg2,borderRadius:14,
          padding:'32px 20px',textAlign:'center',border:'0.5px solid '+C.border}}>
          <div style={{fontSize:36,marginBottom:10}}>📋</div>
          <div style={{fontSize:14,fontWeight:500,color:C.text}}>{t('no_mission')}</div>
        </div>
      ) : (
        <div style={{padding:0}}>
          <div style={{background:`linear-gradient(135deg,${C.primary},#004499)`,
            padding:'14px 16px 16px'}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,.7)',textTransform:'uppercase',
              letterSpacing:.5,marginBottom:3}}>{mission.client}</div>
            <div style={{fontSize:17,fontWeight:700,color:'white',marginBottom:2}}>
              {mission.siteName}
            </div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.8)',marginBottom:10}}>
              {mission.type} · {mission.site}
            </div>
            <div style={{background:'rgba(255,255,255,.2)',borderRadius:6,height:5,marginBottom:5,overflow:'hidden'}}>
              <div style={{width:mission.pct+'%',height:'100%',background:'white',borderRadius:6}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',
              fontSize:10,color:'rgba(255,255,255,.8)'}}>
              <span>{mission.pct}% complete</span>
              <span>{t('deadline')}: {mission.deadline}</span>
            </div>
            <div style={{marginTop:8,background:'rgba(255,255,255,.12)',
              borderRadius:6,padding:'4px 8px',fontSize:9,
              color:'rgba(255,255,255,.7)',fontFamily:'monospace'}}>
              BC: {mission.bc}
            </div>
          </div>

          <div style={{padding:'12px 14px',borderBottom:'1px solid '+C.border}}>
            {gps && (
              <div style={{background:C.successL,borderRadius:8,padding:'7px 10px',
                marginBottom:10,display:'flex',alignItems:'center',gap:6}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:C.success}}/>
                <span style={{fontSize:11,color:'#3B6D11',fontWeight:500}}>
                  GPS actif · precision {Math.round(gps.accuracy||50)}m
                </span>
              </div>
            )}
            <div style={{display:'flex',gap:8,marginBottom:8}}>
              <button onClick={()=>{if(!arrived){setArrived(true);toast('Arrivee enregistree');}}}
                style={{flex:1,padding:'11px',border:'none',cursor:'pointer',fontFamily:FONT,
                  borderRadius:10,fontSize:13,fontWeight:700,
                  background:arrived?C.successL:C.primary,
                  color:arrived?'#3B6D11':'white',
                  border:arrived?'1px solid '+C.success:'none'}}>
                {arrived ? '✓ '+t('on_site') : t('arrive_site')}
              </button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <button onClick={()=>navigate('/mobile/camera')}
                style={{padding:'10px',border:'0.5px solid '+C.border,
                  background:C.bg,borderRadius:10,fontSize:12,fontWeight:500,
                  color:C.text,cursor:'pointer',fontFamily:FONT}}>
                📷 Photo
              </button>
              <button onClick={()=>setShowReport(true)}
                style={{padding:'10px',border:'1px solid '+C.warning,
                  background:C.warningL,borderRadius:10,fontSize:12,fontWeight:500,
                  color:C.warning,cursor:'pointer',fontFamily:FONT}}>
                📝 Rapport
              </button>
            </div>
          </div>

          <div style={{padding:'12px 14px',borderBottom:'1px solid '+C.border}}>
            <div style={{display:'flex',justifyContent:'space-between',
              alignItems:'center',marginBottom:10}}>
              <span style={{fontSize:13,fontWeight:700,color:C.text}}>{t('checklist')}</span>
              <span style={{fontSize:11,color:C.text3,background:C.bg2,
                padding:'3px 8px',borderRadius:10}}>
                {mission.checklist.filter(i=>i.ok).length}/{mission.checklist.length}
              </span>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {mission.checklist.map((item,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,
                  padding:'9px 10px',borderRadius:8,
                  background:item.ok?C.successL:C.bg2,
                  border:'0.5px solid '+(item.ok?C.success:C.border)}}>
                  <div style={{width:20,height:20,borderRadius:6,flexShrink:0,
                    background:item.ok?C.success:C.bg,
                    border:'1.5px solid '+(item.ok?C.success:C.text4),
                    display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {item.ok && <span style={{color:'white',fontSize:11,fontWeight:700}}>✓</span>}
                  </div>
                  <span style={{fontSize:12,color:item.ok?C.text3:C.text,
                    textDecoration:item.ok?'line-through':'none'}}>
                    {item.l}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {mission.team?.length>0 && (
            <div style={{padding:'12px 14px'}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>
                {t('team_on_site')}
              </div>
              {mission.team.map(tid=>{
                const u = USERS.find(u=>u.id===tid);
                if(!u) return null;
                return (
                  <div key={tid} style={{display:'flex',alignItems:'center',gap:10,
                    marginBottom:8}}>
                    <AvatarCircle av={u.av} color={u.color} size={38}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:C.text}}>{u.name}</div>
                      <div style={{fontSize:10,color:C.text3}}>{u.post}</div>
                    </div>
                    <div style={{width:8,height:8,borderRadius:'50%',background:C.success}}/>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showReport && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',
          zIndex:500,display:'flex',alignItems:'flex-end'}}>
          <div style={{background:C.bg,width:'100%',maxWidth:430,margin:'0 auto',
            borderRadius:'16px 16px 0 0',padding:'20px 16px',
            maxHeight:'75vh',overflowY:'auto'}}>
            <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:14}}>
              {t('daily_report')}
            </div>
            {[['done',t('work_done')],['issues',t('issues')]].map(([k,l])=>(
              <div key={k} style={{marginBottom:12}}>
                <div style={{fontSize:11,fontWeight:600,color:C.text2,marginBottom:5}}>{l}</div>
                <textarea value={report[k]}
                  onChange={e=>setReport(r=>({...r,[k]:e.target.value}))}
                  rows={3} placeholder="Optionnel..."
                  style={{width:'100%',background:C.bg2,border:'0.5px solid '+C.border,
                    borderRadius:8,padding:'9px 11px',color:C.text,fontSize:13,
                    fontFamily:FONT,resize:'none',outline:'none',boxSizing:'border-box'}}/>
              </div>
            ))}
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setShowReport(false)}
                style={{flex:1,padding:11,border:'0.5px solid '+C.border,
                  background:'none',color:C.text2,borderRadius:10,
                  cursor:'pointer',fontFamily:FONT,fontSize:13}}>
                {t('cancel')}
              </button>
              <button onClick={()=>{setShowReport(false);toast('Rapport envoye ✓');
                setReport({done:'',issues:''}); }}
                style={{flex:2,padding:11,border:'none',background:C.primary,
                  color:'white',borderRadius:10,cursor:'pointer',
                  fontFamily:FONT,fontSize:13,fontWeight:700}}>
                {t('send_report')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── SCREEN: EQUIPES ──────────────────────────────────────────
const ScreenEquipes = ({user}) => {
  const [tab,setTab] = useState('all');
  const [users,setUsers] = useState([]);
  const [loading,setLoading] = useState(true);
  const C2 = getC();
  useEffect(()=>{
    const load = () => {
      const token = localStorage.getItem('cit_token');
      fetch('https://backend-cleanit-erp.vercel.app/users',{headers:{'Authorization':'Bearer '+token}})
        .then(r=>r.json()).then(d=>{if(Array.isArray(d))setUsers(d);}).catch(()=>{}).finally(()=>setLoading(false));
    };
    load();
    const iv = setInterval(load, 10000);
    return ()=>clearInterval(iv);
  },[]);
  const terrain = users.filter(u=>['technician','terrain'].includes(u.role));
  const bureau = users.filter(u=>!['technician','terrain'].includes(u.role));
  const canAll = ['admin','hr','dg'].includes(user.role);
  const display = tab==='terrain'?terrain:tab==='bureau'&&canAll?bureau:canAll?users:terrain;
  return (
    <div style={{flex:1,overflowY:'auto',background:C2.bg,paddingBottom:80}}>
      <Header title="Equipes"/>
      {loading?<div style={{padding:32,textAlign:'center'}}><div style={{width:32,height:32,border:'3px solid '+C2.primaryL,borderTopColor:C2.primary,borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto'}}/></div>:(
        <>
          <div style={{display:'flex',borderBottom:'1px solid '+C2.border}}>
            {(canAll?[['all','Tous ('+users.length+')'],['terrain','Terrain ('+terrain.length+')'],['bureau','Bureau ('+bureau.length+')']]:
              [['all','Terrain ('+terrain.length+')']]).map(([id,lbl])=>(
              <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:'9px 4px',border:'none',background:C2.bg,
                fontSize:10,fontWeight:tab===id?700:500,cursor:'pointer',fontFamily:FONT,
                color:tab===id?C2.primary:C2.text3,borderBottom:tab===id?'2px solid '+C2.primary:'2px solid transparent'}}>{lbl}</button>
            ))}
          </div>
          {display.map(u=>{
            const av=((u.firstName||'')[0]+(u.lastName||'')[0]).toUpperCase();
            const col=u.role==='admin'?'#DC2626':u.role==='project_manager'?'#7C3AED':u.role==='hr'?'#059669':'#EA580C';
            const active=u.lastSeen&&(Date.now()-new Date(u.lastSeen).getTime())<1800000;
            return(
              <div key={u.id} style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px',borderBottom:'0.5px solid '+C2.border}}>
                <div style={{position:'relative'}}>
                  <div style={{width:44,height:44,borderRadius:'50%',background:col+'22',border:'1.5px solid '+col,
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:col}}>{av}</div>
                  <div style={{position:'absolute',bottom:0,right:0,width:12,height:12,borderRadius:'50%',
                    background:active?'#22C55E':'#9CA3AF',border:'2px solid white'}}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:C2.text}}>{u.firstName} {u.lastName}</div>
                  <div style={{fontSize:10,color:C2.text3}}>{u.role} · {u.email}</div>
                </div>
                <div style={{background:active?'#DCFCE7':'#F3F4F6',color:active?'#16A34A':'#6B7280',
                  padding:'3px 8px',borderRadius:10,fontSize:10,fontWeight:700}}>
                  {active?'Actif':'Hors ligne'}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};
const ScreenDispatch = ({user}) => {
  const [tab,setTab] = useState('active');
  const [missions,setMissions] = useState([]);
  const [users,setUsers] = useState([]);
  const {toast,toastMsg,toastShow,toastType} = useToast();
  const C2 = getC();
  useEffect(()=>{
    const load = () => {
      const tk = localStorage.getItem('cit_token');
      const h = {'Authorization':'Bearer '+tk};
      const b = 'https://backend-cleanit-erp.vercel.app';
      Promise.all([fetch(b+'/missions',{headers:h}).then(r=>r.json()).catch(()=>[]),
        fetch(b+'/users',{headers:h}).then(r=>r.json()).catch(()=>[])]).then(([ms,us])=>{
        if(Array.isArray(ms))setMissions(ms);if(Array.isArray(us))setUsers(us);});
    };
    load();const iv=setInterval(load,10000);return()=>clearInterval(iv);
  },[]);
  const active=missions.filter(m=>m.status==='in_progress');
  const pending=missions.filter(m=>m.status==='pending');
  const avail=users.filter(u=>['technician','terrain'].includes(u.role)&&!missions.find(m=>m.tech_id===u.id&&m.status==='in_progress'));
  const assign=async(mId,uId,uName)=>{
    const tk=localStorage.getItem('cit_token');
    const r=await fetch('https://backend-cleanit-erp.vercel.app/missions/'+mId,{method:'PUT',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk},
      body:JSON.stringify({techId:uId,status:'in_progress'})}).then(r=>r.json()).catch(()=>null);
    if(r?.id){toast(uName+' assigné(e)','success');setMissions(ms=>ms.map(m=>m.id===mId?{...m,tech_id:uId,status:'in_progress'}:m));}
    else toast('Erreur','error');
  };
  const C = getC();
  return(
    <div style={{flex:1,overflowY:'auto',background:C2.bg,paddingBottom:80}}>
      <Toast msg={toastMsg} show={toastShow} type={toastType}/>
      <Header title="Dispatch"/>
      <div style={{display:'flex',borderBottom:'1px solid '+C2.border}}>
        {[['active','En cours ('+active.length+')'],['assign','A assigner ('+pending.length+')']].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:'9px 4px',border:'none',background:C2.bg,
            fontSize:10,fontWeight:tab===id?700:500,cursor:'pointer',fontFamily:FONT,
            color:tab===id?C2.primary:C2.text3,borderBottom:tab===id?'2px solid '+C2.primary:'2px solid transparent'}}>{lbl}</button>
        ))}
      </div>
      {tab==='active'&&active.map(m=>{
        const tech=users.find(u=>u.id===m.tech_id);
        return(<div key={m.id} style={{padding:'12px 14px',borderBottom:'0.5px solid '+C2.border}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
            <div><div style={{fontSize:10,color:C2.text3}}>{m.client} · {m.site}</div>
              <div style={{fontSize:13,fontWeight:700,color:C2.text}}>{m.type||'Mission'}</div></div>
            <div style={{background:C2.primaryL,color:C2.primary,padding:'3px 9px',borderRadius:10,fontSize:10,fontWeight:700}}>En cours</div>
          </div>
          <div style={{background:C2.bg2,borderRadius:4,height:5,marginBottom:6}}>
            <div style={{width:(m.progress||0)+'%',height:'100%',background:C2.primary,borderRadius:4}}/></div>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            {tech&&<span style={{fontSize:11,color:C2.text}}>{tech.firstName} {tech.lastName}</span>}
            <span style={{fontSize:10,color:C2.text3}}>📅 {m.deadline||'—'}</span>
          </div>
        </div>);
      })}
      {tab==='assign'&&pending.map(m=>(
        <div key={m.id} style={{padding:12,margin:'8px 14px',background:C2.bg2,borderRadius:12,border:'0.5px solid '+C2.border}}>
          <div style={{fontSize:13,fontWeight:700,color:C2.text}}>{m.client} · {m.site}</div>
          <div style={{fontSize:11,color:C2.text3,marginBottom:10}}>{m.type} · {m.deadline||'—'}</div>
          {avail.map(u=>(
            <div key={u.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',
              padding:'7px 9px',background:C2.bg,borderRadius:8,border:'0.5px solid '+C2.border,marginBottom:5}}>
              <span style={{fontSize:11,color:C2.text}}>{u.firstName} {u.lastName}</span>
              <button onClick={()=>assign(m.id,u.id,u.firstName+' '+u.lastName)}
                style={{background:C2.primary,border:'none',borderRadius:6,padding:'4px 10px',
                  color:'white',fontSize:10,fontWeight:700,cursor:'pointer',fontFamily:FONT}}>Assigner</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
const ScreenApprovals = ({user}) => {
  const [tab,setTab] = useState('pending');
  const [loadingApprovals, setLoadingApprovals] = useState(false);

  // Charger depuis la DB
  useEffect(() => {
    setLoadingApprovals(true);
    const token = localStorage.getItem('cit_token');
    fetch('https://backend-cleanit-erp.vercel.app/approvals', {
      headers:{'Authorization':'Bearer '+token}
    }).then(r=>r.json()).then(data => {
      if(Array.isArray(data) && data.length > 0) {
        const formatted = data.map(a=>({
          id:a.id, userId:String(a.user_id), name:a.user_name,
          av:(a.user_name||'U').split(' ').map(n=>n[0]).join('').slice(0,2),
          color:'#0066CC', type:a.type, label:a.label, detail:a.detail,
          level:a.n1_done&&a.n2_done?3:a.n1_done?2:1,
          n1done:a.n1_done, n2done:a.n2_done, status:a.status
        }));
        setItems(formatted);
      }
    }).catch(()=>{}).finally(()=>setLoadingApprovals(false));
  }, []);

  // Filtrer selon le role
  const getVisibleItems = () => {
    if(user.role==='dg') return APPROVALS.filter(a=>a.n1done&&a.n2done); // DG voit N1+N2 valides
    if(user.role==='rh') return APPROVALS.filter(a=>a.type==='conge'&&!a.n1done); // RH voit conges N1
    if(user.role==='admin') return APPROVALS; // Admin voit tout
    if(user.role==='pm'||user.role==='bureau') return APPROVALS.filter(a=>a.n1done&&!a.n2done); // N2
    return APPROVALS.filter(a=>a.userId===user.id); // Autres voient les leurs
  };
  const [items,setItems] = useState(getVisibleItems());
  const {toast,toastMsg,toastShow,toastType} = useToast();

  const typeColors = {conge:'#F5F7FA',frais:C.primaryL,materiel:'#F5F7FA',paiement:'#FFF8E6'};
  const typeTextColors = {conge:C.text2,frais:C.primary,materiel:C.text2,paiement:C.warning};

  const ChainStep = ({label,done,active}) => (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,zIndex:2}}>
      <div style={{width:26,height:26,borderRadius:'50%',
        background:done?C.successL:active?C.warningL:C.bg2,
        border:'2px solid '+(done?C.success:active?C.warning:C.text4),
        display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>
        {done?'✓':active?'⏱':''}
      </div>
      <span style={{fontSize:8,fontWeight:600,
        color:done?C.success:active?C.warning:C.text4}}>
        {label}{done?' ✓':''}
      </span>
    </div>
  );

  return (
    <div style={{flex:1,overflowY:'auto',background:C.bg,paddingBottom:80}}>
      <Toast msg={toastMsg} show={toastShow} type={toastType}/>
      <Header title={t('approvals')} right={
        <div style={{background:C.dangerL,padding:'4px 10px',borderRadius:20,
          display:'flex',alignItems:'center',gap:4}}>
          <div style={{width:6,height:6,borderRadius:'50%',background:C.pink}}/>
          <span style={{fontSize:10,color:C.danger,fontWeight:700}}>
            {items.length} en attente
          </span>
        </div>
      }/>
      <div style={{display:'flex',borderBottom:'1px solid '+C.border}}>
        {[['pending',t('waiting')],['approved',t('approved')],['refused',t('refused')]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{flex:1,padding:'9px 4px',border:'none',background:C.bg,
              fontSize:10,fontWeight:tab===id?700:500,cursor:'pointer',fontFamily:FONT,
              color:tab===id?C.primary:C.text3,
              borderBottom:tab===id?'2px solid '+C.primary:'2px solid transparent'}}>
            {lbl}
          </button>
        ))}
      </div>

      {tab==='pending' && items.map(item=>{
        const n1Active = !item.n1done;
        const n2Active = item.n1done && !item.n2done;
        const dgActive = item.n1done && item.n2done;
        const width = item.n1done&&item.n2done?'85%':item.n1done?'55%':'20%';

        return (
          <div key={item.id} style={{padding:'12px 14px',borderBottom:'0.5px solid '+C.border}}>
            <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:10}}>
              <AvatarCircle av={item.av} color={item.color} size={36}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>{item.name}</div>
                <div style={{fontSize:10,color:C.text3}}>{item.detail}</div>
              </div>
              <div style={{background:typeColors[item.type]||C.bg2,
                color:typeTextColors[item.type]||C.text2,
                padding:'3px 8px',borderRadius:8,fontSize:9,fontWeight:700,flexShrink:0}}>
                {item.label}
              </div>
            </div>

            <div style={{position:'relative',marginBottom:10,padding:'0 4px'}}>
              <div style={{position:'absolute',top:13,left:18,right:18,
                height:2,background:C.border,zIndex:0}}/>
              <div style={{position:'absolute',top:13,left:18,width,
                height:2,background:C.success,zIndex:1,transition:'width .5s'}}/>
              <div style={{display:'flex',justifyContent:'space-between',position:'relative',zIndex:2}}>
                <ChainStep label="Soumis" done={true} active={false}/>
                <ChainStep label={item.n1||'N1'} done={item.n1done} active={n1Active}/>
                <ChainStep label={item.n2||'N2'} done={item.n2done} active={n2Active}/>
                <ChainStep label="DG" done={false} active={dgActive}/>
              </div>
            </div>

            <div style={{borderRadius:8,padding:'7px 10px',marginBottom:10,
              background:dgActive?C.warningL:n2Active?C.successL:C.warningL,
              borderLeft:'3px solid '+(dgActive?C.warning:n2Active?C.success:C.warning),
              fontSize:10,color:dgActive?'#92400E':n2Active?'#3B6D11':'#92400E',
              display:'flex',alignItems:'center',gap:5}}>
              {dgActive?'👑 '+t('final_decision'):
               n2Active?'✓ '+t('n1_validated')+' — '+t('your_validation')+' (N2)':
               '⏱ '+t('your_validation')+' ('+item.n1+')'}
            </div>

            <div style={{display:'flex',gap:7}}>
              <button onClick={()=>toast('Rejete')}
                style={{flex:1,padding:8,border:'0.5px solid '+C.dangerL,
                  background:C.bg,borderRadius:8,fontSize:11,color:C.danger,
                  fontWeight:700,cursor:'pointer',fontFamily:FONT}}>
                {t('reject')}
              </button>
              <button onClick={()=>toast('Modifie')}
                style={{flex:1,padding:8,border:'0.5px solid '+C.warningL,
                  background:C.bg,borderRadius:8,fontSize:11,color:C.warning,
                  fontWeight:700,cursor:'pointer',fontFamily:FONT}}>
                {t('modify')}
              </button>
              <button onClick={()=>{
                setItems(prev=>prev.map(i=>i.id===item.id?
                  {...i,n1done:i.n1done?i.n1done:true,
                   n2done:i.n1done&&!i.n2done?true:i.n2done}:i));
                toast('Valide ✓');
              }} style={{flex:2,padding:8,border:'none',
                background:dgActive?C.primary:C.success,borderRadius:8,
                fontSize:11,color:'white',fontWeight:700,cursor:'pointer',fontFamily:FONT,
                display:'flex',alignItems:'center',justifyContent:'center',gap:4}}>
                {dgActive?'👑 '+t('approve'):'✓ '+t('validate')}
              </button>
            </div>
          </div>
        );
      })}

      {tab==='approved' && (
        <div style={{padding:14,display:'flex',flexDirection:'column',gap:8}}>
          {[{av:'MK',color:'#0066CC',name:'Marie Kamga',detail:'Note de frais approuvee · 25 mai'},
            {av:'TN',color:'#EA580C',name:'Thomas Ngono',detail:'Conge approuve · 15 mai'}].map((item,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,
              padding:'10px 12px',background:C.successL,borderRadius:10,
              border:'0.5px solid #C0DD97'}}>
              <AvatarCircle av={item.av} color={item.color} size={34}/>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:C.text}}>{item.name}</div>
                <div style={{fontSize:10,color:'#3B6D11'}}>{item.detail}</div>
              </div>
              <span style={{fontSize:20}}>✅</span>
            </div>
          ))}
        </div>
      )}

      {tab==='refused' && (
        <div style={{padding:14}}>
          <div style={{display:'flex',gap:10,padding:'10px 12px',
            background:C.dangerL,borderRadius:10,border:'0.5px solid #F7C1C1'}}>
            <AvatarCircle av="AM" color={C.danger} size={34}/>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:C.text}}>Ali Moussa</div>
              <div style={{fontSize:10,color:C.danger,marginBottom:4}}>Conge refuse par DG · 20 mai</div>
              <div style={{background:C.bg,borderRadius:6,padding:'5px 8px',
                fontSize:10,color:C.text2,fontStyle:'italic'}}>
                Motif: Mission GAR-001 en cours
              </div>
            </div>
            <span style={{fontSize:20}}>❌</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── SCREEN: ANALYTICS ────────────────────────────────────────
const ScreenAnalytics = () => {
  const [stats,setStats] = useState(null);
  const [missions,setMissions] = useState([]);
  const C2 = getC();
  useEffect(()=>{
    const load = () => {
      const tk=localStorage.getItem('cit_token');
      const h={'Authorization':'Bearer '+tk};
      const b='https://backend-cleanit-erp.vercel.app';
      Promise.all([fetch(b+'/stats',{headers:h}).then(r=>r.json()).catch(()=>null),
        fetch(b+'/missions',{headers:h}).then(r=>r.json()).catch(()=>[])]).then(([s,ms])=>{
        if(s)setStats(s);if(Array.isArray(ms))setMissions(ms);});
    };
    load();const iv=setInterval(load,10000);return()=>clearInterval(iv);
  },[]);
  if(!stats)return(<div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',background:getC().bg}}>
    <div style={{width:40,height:40,border:'3px solid '+getC().primaryL,borderTopColor:getC().primary,borderRadius:'50%',animation:'spin .8s linear infinite'}}/></div>);
  const kpis=[
    {l:'Utilisateurs actifs',v:stats.users?.active||0,s:'/ '+stats.users?.total+' total',c:getC().primary},
    {l:'Missions en cours',v:stats.missions?.active||0,s:stats.missions?.total+' total',c:getC().success},
    {l:'Tickets ouverts',v:stats.tickets?.open||0,s:'urgence',c:(stats.tickets?.open||0)>5?getC().danger:getC().warning},
    {l:'Approvals en attente',v:stats.approvals?.pending||0,s:'à valider',c:getC().warning},
  ];
  return(
    <div style={{flex:1,overflowY:'auto',background:getC().bg,paddingBottom:80}}>
      <Header title="Analytics"/>
      <div style={{padding:'12px 14px',display:'flex',flexDirection:'column',gap:10}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {kpis.map(({l,v,s,c})=>(
            <div key={l} style={{background:getC().bg2,borderRadius:10,padding:'10px 12px'}}>
              <div style={{fontSize:9,color:getC().text3,marginBottom:4}}>{l}</div>
              <div style={{fontSize:22,fontWeight:700,color:getC().text}}>{v}</div>
              <div style={{fontSize:9,color:c,fontWeight:600}}>{s}</div>
            </div>
          ))}
        </div>
        <div style={{background:getC().bg2,borderRadius:10,padding:'10px 12px'}}>
          <div style={{fontSize:12,fontWeight:700,color:getC().text,marginBottom:10}}>Missions</div>
          {missions.map(m=>(
            <div key={m.id} style={{marginBottom:8}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                <span style={{fontSize:11,color:getC().text}}>{m.code} · {m.client}</span>
                <span style={{fontSize:11,fontWeight:700,color:m.status==='in_progress'?getC().primary:getC().warning}}>{m.progress||0}%</span>
              </div>
              <div style={{background:getC().border,borderRadius:4,height:4}}>
                <div style={{width:(m.progress||0)+'%',height:'100%',background:m.status==='in_progress'?getC().primary:getC().warning,borderRadius:4}}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{textAlign:'center',padding:8,background:getC().bg2,borderRadius:10}}>
          <div style={{fontSize:10,color:getC().primary}}>⟳ Mise à jour toutes les 30 secondes</div>
        </div>
      </div>
    </div>
  );
};
const ScreenProfil = ({user,onLogout}) => {
  const [lang,setLang] = useState(getLang());
  const [theme,setTheme] = useState(getTheme());
  const [notifs,setNotifs] = useState(true);
  const {toast,toastMsg,toastShow,toastType} = useToast();
  const userObj = USERS.find(u=>u.id===user.id)||user;
  const missions = MISSIONS.filter(m=>m.techId===user.id);

  const saveLang = (l) => { setLang(l);localStorage.setItem('cit_lang',l); };
  const saveTheme = (th) => {
    setTheme(th);
    localStorage.setItem('cit_theme',th);
    document.documentElement.style.setProperty('--mob-bg', th==='dark'?'#0F172A':'#FFFFFF');
    document.body.style.background = th==='dark'?'#0F172A':'#FFFFFF';
    document.body.style.color = th==='dark'?'#F1F5F9':'#262626';
  };

  return (
    <div style={{flex:1,overflowY:'auto',background:C.bg,paddingBottom:80}}>
      <Toast msg={toastMsg} show={toastShow} type={toastType}/>
      <div style={{background:`linear-gradient(135deg,${C.primary},#004499)`,
        padding:'20px 14px 16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
          <div style={{position:'relative'}}>
            <div style={{width:58,height:58,borderRadius:'50%',
              background:'rgba(255,255,255,.2)',border:'2.5px solid white',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:20,fontWeight:700,color:'white'}}>
              {userObj.av}
            </div>
            <button style={{position:'absolute',bottom:-2,right:-2,width:22,height:22,
              borderRadius:'50%',background:C.pink,border:'2px solid white',
              display:'flex',alignItems:'center',justifyContent:'center',
              cursor:'pointer',fontSize:10}}>
              📷
            </button>
          </div>
          <div>
            <div style={{fontSize:17,fontWeight:700,color:'white'}}>{userObj.name}</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.8)',marginTop:2}}>
              {userObj.post} · {userObj.region}
            </div>
            <div style={{fontSize:10,color:'rgba(255,255,255,.6)',fontFamily:'monospace',marginTop:2}}>
              {userObj.id}
            </div>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
          {[
            {label:'Missions',val:missions.length||3},
            {label:'Certs',val:userObj.certs?.length||0},
            {label:'Presence',val:'98%'},
          ].map(({label,val})=>(
            <div key={label} style={{background:'rgba(255,255,255,.15)',
              borderRadius:8,padding:'7px',textAlign:'center'}}>
              <div style={{fontSize:15,fontWeight:700,color:'white'}}>{val}</div>
              <div style={{fontSize:8,color:'rgba(255,255,255,.7)'}}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:'10px 14px'}}>
        <div style={{fontSize:10,fontWeight:700,color:C.text3,
          textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>
          {t('preferences')}
        </div>
        <div style={{background:C.bg2,borderRadius:12,overflow:'hidden',
          marginBottom:12,border:'0.5px solid '+C.border}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:'12px 14px',borderBottom:'0.5px solid '+C.border}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:32,height:32,borderRadius:8,background:C.primaryL,
                display:'flex',alignItems:'center',justifyContent:'center',}}><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#0066CC' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='10'/><line x1='2' y1='12' x2='22' y2='12'/><path d='M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z'/></svg></div>
              <span style={{fontSize:13,color:C.text}}>{t('language')}</span>
            </div>
            <div style={{display:'flex',border:'0.5px solid '+C.border,
              borderRadius:8,overflow:'hidden',background:C.bg}}>
              {['fr','en'].map(l=>(
                <button key={l} onClick={()=>saveLang(l)}
                  style={{padding:'5px 12px',border:'none',cursor:'pointer',fontFamily:FONT,
                    fontSize:12,fontWeight:lang===l?700:400,
                    background:lang===l?C.primary:C.bg,
                    color:lang===l?'white':C.text3}}>
                  {l==='fr'?'FR':'EN'}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:'12px 14px',borderBottom:'0.5px solid '+C.border}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:32,height:32,borderRadius:8,background:C.bg2,
                display:'flex',alignItems:'center',justifyContent:'center',}}><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#475569' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z'/></svg></div>
              <span style={{fontSize:13,color:C.text}}>{t('theme')}</span>
            </div>
            <div style={{display:'flex',border:'0.5px solid '+C.border,
              borderRadius:8,overflow:'hidden',background:C.bg}}>
              {[['light',t('light')],['dark',t('dark')]].map(([th,lbl])=>(
                <button key={th} onClick={()=>saveTheme(th)}
                  style={{padding:'5px 12px',border:'none',cursor:'pointer',fontFamily:FONT,
                    fontSize:11,fontWeight:theme===th?700:400,
                    background:theme===th?C.primary:C.bg,
                    color:theme===th?'white':C.text3}}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:'12px 14px'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:32,height:32,borderRadius:8,background:C.successL,
                display:'flex',alignItems:'center',justifyContent:'center',}}><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#22C55E' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9'/><path d='M13.73 21a2 2 0 01-3.46 0'/></svg></div>
              <span style={{fontSize:13,color:C.text}}>{t('notifications')}</span>
            </div>
            <div onClick={async()=>{
              if(!notifs){
                if('Notification' in window){
                  const perm = await Notification.requestPermission();
                  if(perm==='granted'){
                    try {
                      if('serviceWorker' in navigator){
                        const reg = await navigator.serviceWorker.ready;
                        // Convertir la clé VAPID en Uint8Array (requis par Chrome)
                        const vapidKey = 'BNSQIjGGELW6UAg0K1bkGLRgkWf0xSn9pocHSAwrtMauehwBVm-v1fM3TE_QRoQVlBmq15FGbqMP3ZNmH7ZSjZc';
                        const padding = '='.repeat((4 - vapidKey.length % 4) % 4);
                        const base64 = (vapidKey + padding).replace(/-/g, '+').replace(/_/g, '/');
                        const rawData = window.atob(base64);
                        const outputArray = new Uint8Array(rawData.length);
                        for(let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
                        const sub = await reg.pushManager.subscribe({
                          userVisibleOnly: true,
                          applicationServerKey: outputArray
                        });
                        const token = localStorage.getItem('cit_token') || localStorage.getItem('token') || localStorage.getItem('cit_mobile_token');
                        const resp = await fetch('https://backend-cleanit-erp.vercel.app/push/subscribe',{
                          method:'POST',
                          headers:{'Content-Type':'application/json','Authorization':'Bearer '+(token||'')},
                          body:JSON.stringify({
                            subscription:JSON.parse(JSON.stringify(sub)),
                            userId: JSON.parse(localStorage.getItem('cit_mobile_user')||'{}')?.id || null
                          })
                        }).then(r=>r.json()).catch(e=>({error:e.message}));
                        if(resp.ok) {
                          setNotifs(true);
                          alert('Notifications activées !');
                        } else {
                          alert('Erreur: '+JSON.stringify(resp));
                        }
                      }
                    } catch(e){ alert('Erreur: '+e.message); }
                  } else { alert('Permission refusée par Chrome'); }
                }
              } else { setNotifs(false); }
            }}
              style={{width:38,height:22,borderRadius:11,cursor:'pointer',
                background:notifs?C.success:C.border,position:'relative',
                transition:'background .2s'}}>
              <div style={{position:'absolute',top:2,
                left:notifs?16:2,width:18,height:18,borderRadius:9,
                background:'white',transition:'left .2s'}}/>
            </div>
          </div>
        </div>

        <div style={{fontSize:10,fontWeight:700,color:C.text3,
          textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>
          {t('account')}
        </div>
        <div style={{background:C.bg2,borderRadius:12,overflow:'hidden',
          marginBottom:12,border:'0.5px solid '+C.border}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:'12px 14px',borderBottom:'0.5px solid '+C.border,cursor:'pointer'}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:32,height:32,borderRadius:8,background:C.warningL,
                display:'flex',alignItems:'center',justifyContent:'center',}}><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#F59E0B' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='3' y='11' width='18' height='11' rx='2'/><path d='M7 11V7a5 5 0 0110 0v4'/></svg></div>
              <span style={{fontSize:13,color:C.text}}>{t('change_password')}</span>
            </div>
            <span style={{color:C.text4}}>›</span>
          </div>
          {userObj.certs?.length>0 && (
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
              padding:'12px 14px',cursor:'pointer'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:32,height:32,borderRadius:8,background:C.bg2,
                  display:'flex',alignItems:'center',justifyContent:'center',}}><svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#0066CC' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='8' r='6'/><path d='M15.477 12.89L17 22l-5-3-5 3 1.523-9.11'/></svg></div>
                <div>
                  <div style={{fontSize:13,color:C.text,marginBottom:4}}>
                    {t('certifications')}
                  </div>
                  <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                    {userObj.certs.map(cert=>(
                      <span key={cert} style={{fontSize:9,background:C.primaryL,
                        color:C.primary,padding:'2px 6px',borderRadius:10,fontWeight:600}}>
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div onClick={async ()=>{
          // Demander permission notifications
          if('Notification' in window){
            const perm = await Notification.requestPermission();
            if(perm==='granted'){
              try {
                if('serviceWorker' in navigator){
                  const reg = await navigator.serviceWorker.ready;
                  const vapidKey = 'BNSQIjGGELW6UAg0K1bkGLRgkWf0xSn9pocHSAwrtMauehwBVm-v1fM3TE_QRoQVlBmq15FGbqMP3ZNmH7ZSjZc';
                  const sub = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: vapidKey
                  });
                  // Envoyer subscription au backend
                  const token = localStorage.getItem('cit_token');
                  await fetch('https://backend-cleanit-erp.vercel.app/push/subscribe', {
                    method: 'POST',
                    headers: {'Content-Type':'application/json','Authorization':'Bearer '+token},
                    body: JSON.stringify({ subscription: sub })
                  });
                  localStorage.setItem('push_sub', JSON.stringify(sub));
                  toast('Notifications activées !', 'success');
                }
              } catch(err) {
                toast('Erreur activation notifs', 'error');
              }
            } else {
              toast('Permission refusée', 'error');
            }
          }
          // PWA install
          if(window.deferredPrompt){
            window.deferredPrompt.prompt();
            window.deferredPrompt.userChoice.then(()=>{window.deferredPrompt=null;});
          }
        }} style={{background:C.bg2,borderRadius:12,padding:'12px 14px',
          marginBottom:12,border:'0.5px solid '+C.border,cursor:'pointer',
          display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:32,height:32,borderRadius:8,background:getC().bg2,
              display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={getC().text2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <div>
              <div style={{fontSize:13,color:C.text}}>{t('install')}</div>
              <div style={{fontSize:10,color:C.text3}}>Ajouter CleanIT sur votre ecran</div>
            </div>
          </div>
          <span style={{color:C.text4}}>›</span>
        </div>

        <button onClick={onLogout}
          style={{width:'100%',padding:13,border:'0.5px solid '+getC().dangerL,
            background:getC().bg,borderRadius:12,fontSize:13,fontWeight:700,
            color:getC().danger,cursor:'pointer',fontFamily:FONT,
            display:'flex',alignItems:'center',justifyContent:'center',gap:8,
            marginBottom:8}}>
          <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4'/><polyline points='16 17 21 12 16 7'/><line x1='21' y1='12' x2='9' y2='12'/></svg>
          {t('logout')}
        </button>
        <div style={{textAlign:'center',fontSize:10,color:C.text4}}>
          CleanIT ERP Mobile v4.0 · Cameroun
        </div>
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────
export default function MobileApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const loc = location.pathname;
  const [user,setUser] = useState(null);
  const [gps,setGps] = useState(null);
  const [now,setNow] = useState(new Date());

  useEffect(()=>{
    const saved = localStorage.getItem('cit_mobile_user');
    if(saved) try{setUser(JSON.parse(saved));}catch{}
    if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
  },[]);

  useEffect(()=>{
    const id = setInterval(()=>setNow(new Date()),1000);
    return()=>clearInterval(id);
  },[]);

  useEffect(()=>{
    if(!navigator.geolocation||!user) return;
    const wid = navigator.geolocation.watchPosition(
      p=>setGps({lat:p.coords.latitude,lng:p.coords.longitude,accuracy:p.coords.accuracy}),
      ()=>{},{enableHighAccuracy:true,timeout:10000,maximumAge:5000}
    );
    return()=>navigator.geolocation.clearWatch(wid);
  },[user]);

  const login = (u) => {setUser(u);localStorage.setItem('cit_mobile_user',JSON.stringify(u));};
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); };
    const handleOffline = () => { setIsOnline(false); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handler Google OAuth - recuperer le token depuis l URL
  useEffect(() => {
    const hash = window.location.hash;
    if(hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      if(token) {
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {'Authorization': 'Bearer '+token}
        }).then(r=>r.json()).then(profile=>{
          const u = {
            id: 'g_'+profile.sub,
            name: profile.name,
            email: profile.email,
            role: 'bureau',
            post: 'Employe',
            av: (profile.given_name[0]||'G')+(profile.family_name?.[0]||''),
            color: '#4285F4',
            region: 'CleanIT',
            avatar: profile.picture,
          };
          login(u);
          window.location.hash = '';
        }).catch(console.error);
      }
    }
  }, []);
  const logout = () => {setUser(null);localStorage.removeItem('cit_mobile_user');};

  if(!user) return <ScreenLogin onLogin={login}/>;

  const parts = loc.split('/').filter(Boolean);
  const activePage = parts[1]||'fil';
  const common = {user,gps,navigate,now};

  const getPage = () => {
    if(loc.includes('/camera'))   return <ScreenCamera {...common}/>;
    if(loc.includes('/messages')) return <ScreenMessages/>;
    if(loc.includes('/pointer'))  return <ScreenPointer {...common}/>;
    if(loc.includes('/mission'))  return <ScreenMission {...common}/>;
    if(loc.includes('/equipes'))  return <ScreenEquipes user={user}/>;
    if(loc.includes('/dispatch')) return <ScreenDispatch/>;
    if(loc.includes('/approvals'))return <ScreenApprovals user={user}/>;
    if(loc.includes('/analytics'))return <ScreenAnalytics/>;
    if(loc.includes('/profil'))   return <ScreenProfil {...common} onLogout={logout}/>;
    return <ScreenFil {...common}/>;
  };

  const isCamera = loc.includes('/camera');

  return (
    <div style={{minHeight:'100vh',background:C.bg,fontFamily:FONT,
      maxWidth:430,margin:'0 auto',display:'flex',flexDirection:'column',
      position:'relative'}}>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        body{margin:0;overscroll-behavior:none}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .screen-enter{animation:slideIn .25s ease-out}
        .fade-enter{animation:fadeIn .2s ease-out}
        .skeleton{animation:pulse 1.5s ease-in-out infinite;background:#E2E8F0;border-radius:6px}
      `}</style>
      {getPage()}
      {!isCamera && <BottomNav user={user} navigate={navigate} active={activePage}/>}
    </div>
  );
}
