import { useState, useEffect, useRef, Component } from 'react';
import jsQR from 'jsqr';
import QRCode from 'qrcode';
import { AuthAPI, FeedAPI, MissionsAPI } from '../services/api.mobile.js';
import { useNavigate, useLocation } from 'react-router-dom';
import { useInactivityLogout } from '../hooks/useInactivityLogout';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  componentDidCatch(e, i) { console.error('Crash:', e, i); }
  render() {
    if (this.state.error) return (
      <div style={{padding:24,fontFamily:'monospace',background:'#fff',minHeight:'100vh',color:'#111'}}>
        <h2 style={{color:'#DC2626',fontSize:16}}>Erreur: {this.state.error?.message||String(this.state.error)}</h2>
        <pre style={{fontSize:10,overflow:'auto',whiteSpace:'pre-wrap'}}>{this.state.error?.stack?.slice(0,800)}</pre>
        <button onClick={()=>{localStorage.clear();location.href='/mlogin.html';}} style={{marginTop:16,padding:'10px 20px',background:'#1B4F8A',color:'white',border:'none',borderRadius:8,fontSize:14,cursor:'pointer'}}>Retour login</button>
      </div>
    );
    return this.props.children;
  }
}


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
    equipe: 'Équipe',
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
    equipe: 'Team',
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
// Utilisateurs chargés depuis l'API — voir ScreenFil useEffect
const USERS = [];

// Missions chargées depuis l'API — voir MissionsAPI
const MISSIONS = [];

const loadFeedPosts = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('cit_feed_posts')||'null');
    if(saved && saved.length > 0) return saved;
  } catch {}
  return [];
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

// Conversations chargées depuis l'API

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
  equipe: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  approvals: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
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
    {id:'equipe',url:'/mobile/equipe'},
    {id:'approvals',url:'/mobile/approvals'},
    {id:'profil',url:'/mobile/profil'},
  ],
  pm: [
    {id:'fil',url:'/mobile'},
    {id:'camera',url:'/mobile/camera'},
    {id:'messages',url:'/mobile/messages'},
    {id:'pointer',url:'/mobile/pointer'},
    {id:'equipe',url:'/mobile/equipe'},
    {id:'approvals',url:'/mobile/approvals'},
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
    {id:'equipe',url:'/mobile/equipe'},
    {id:'profil',url:'/mobile/profil'},
  ],
  admin: [
    {id:'fil',url:'/mobile'},
    {id:'messages',url:'/mobile/messages'},
    {id:'pointer',url:'/mobile/pointer'},
    {id:'equipe',url:'/mobile/equipe'},
    {id:'approvals',url:'/mobile/approvals'},
    {id:'analytics',url:'/mobile/analytics'},
    {id:'profil',url:'/mobile/profil'},
  ],
};

const LABEL = {
  fil:'Fil',camera:'Camera',mission:'Mission',messages:'Messages',
  pointer:'Pointer',equipe:'Équipe',approvals:'Approvals',
  analytics:'Analytics',profil:'Profil',
};

// ─── BOTTOM NAV ───────────────────────────────────────────────
const BottomNav = ({user,navigate,active,unreadCount=0}) => {
  const tabs = TABS[user.role] || TABS.bureau;

  return (
    <div style={{position:'fixed',bottom:0,left:0,right:0,maxWidth:430,margin:'0 auto',
      background:getC().bg,borderTop:'1px solid '+getC().border,
      display:'flex',overflowX:'auto',zIndex:100,
      paddingBottom:'env(safe-area-inset-bottom,0px)',
      scrollbarWidth:'none',msOverflowStyle:'none'}}>
      {tabs.map(tab => {
        const isActive = active===tab.id || (active===''&&tab.id==='fil');
        const showBadge = tab.id==='messages' && unreadCount>0 && !isActive;
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
              display:'flex',alignItems:'center',justifyContent:'center',
              position:'relative'}}>
              {NAV_ICONS[tab.id]}
              {showBadge&&<div style={{position:'absolute',top:-4,right:-6,
                width:16,height:16,borderRadius:8,background:'#E86C6C',
                color:'white',fontSize:9,fontWeight:700,
                display:'flex',alignItems:'center',justifyContent:'center',
                border:'1.5px solid '+getC().bg}}>
                {unreadCount>9?'9+':unreadCount}
              </div>}
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
  const [lit, setLit] = useState(false);
  const [dragging, setDragging] = useState(false);
  const cordZoneRef = useRef(null);
  const startYRef = useRef(0);

  const doLogin = async() => {
    if(!email||!pwd) return setErr('Veuillez remplir tous les champs');
    setLoading(true); setErr('');
    try {
      const r = await fetch('https://backend-cleanit-erp.vercel.app/auth/login',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({email:email.trim().toLowerCase(), password:pwd})
      });
      const d = await r.json();
      if(d.token){
        localStorage.setItem('token', d.token);
        localStorage.setItem('user', JSON.stringify(d.user));
        if('Notification' in window && Notification.permission === 'granted' && 'serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(async reg => {
            try {
              const vapidKey = 'BNSQIjGGELW6UAg0K1bkGLRgkWf0xSn9pocHSAwrtMauehwBVm-v1fM3TE_QRoQVlBmq15FGbqMP3ZNmH7ZSjZc';
              const padding = '='.repeat((4 - vapidKey.length % 4) % 4);
              const base64 = (vapidKey + padding).replace(/-/g, '+').replace(/_/g, '/');
              const rawData = window.atob(base64);
              const outputArray = new Uint8Array(rawData.length);
              for(let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
              const sub = await reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:outputArray});
              await fetch('https://backend-cleanit-erp.vercel.app/push/subscribe', {
                method:'POST',
                headers:{'Content-Type':'application/json','Authorization':'Bearer '+d.token},
                body: JSON.stringify({subscription: JSON.parse(JSON.stringify(sub)), userId: d.user?.id||null})
              });
            } catch(e) { console.log('Push auto-register:', e.message); }
          }).catch(()=>{});
        }
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

  // Interaction du cordon — glisser ou cliquer pour activer le pylône
  const turnOn = () => setLit(true);
  const turnOff = () => setLit(false);

  const onCordStart = (clientY) => { setDragging(true); startYRef.current = clientY; };
  const onCordMove = (clientY) => { if(dragging && clientY - startYRef.current > 35 && !lit) turnOn(); };
  const onCordEnd = () => setDragging(false);

  useEffect(() => {
    const mm = e => onCordMove(e.clientY);
    const tm = e => onCordMove(e.touches[0].clientY);
    const up = () => onCordEnd();
    window.addEventListener('mousemove', mm);
    window.addEventListener('touchmove', tm);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', mm);
      window.removeEventListener('touchmove', tm);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchend', up);
    };
  }, [dragging, lit]);

  const RED = '#E85D5D';

  return (
    <div style={{
      minHeight:'100vh', margin:0, background: lit ? '#0D1722' : '#080B10',
      display:'flex', flexDirection:'column',
      fontFamily:"'Inter','Helvetica Neue',Arial,sans-serif",
      position:'relative', overflow:'hidden',
      transition:'background 1.2s ease',
    }}>
      <style>{`
        @keyframes citBlink { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes citBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(4px)} }
      `}</style>

      {/* Étoiles discrètes */}
      <div style={{position:'absolute',inset:0,backgroundImage:
        'radial-gradient(1px 1px at 20% 8%, rgba(255,255,255,0.4), transparent),'+
        'radial-gradient(1px 1px at 70% 4%, rgba(255,255,255,0.3), transparent),'+
        'radial-gradient(1.5px 1.5px at 85% 12%, rgba(255,255,255,0.5), transparent),'+
        'radial-gradient(1px 1px at 40% 16%, rgba(255,255,255,0.3), transparent),'+
        'radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.4), transparent)'
      }}/>

      {/* Status bar / marque */}
      <div style={{position:'relative',zIndex:5,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 28px 0'}}>
        <span style={{fontSize:13,fontWeight:600,color:'#C8CDD3'}}>CleanIT</span>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <svg width="16" height="16" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="34" stroke="#9CA3AF" strokeWidth="6"/>
            <circle cx="50" cy="16" r="9" fill={RED}/>
            <circle cx="79" cy="34" r="9" fill={RED}/>
            <circle cx="79" cy="66" r="9" fill={RED}/>
            <circle cx="21" cy="50" r="9" fill={RED}/>
            <circle cx="50" cy="50" r="9" fill={RED}/>
          </svg>
          <span style={{fontSize:13,fontWeight:600,color:'#C8CDD3'}}>CleanIT ERP</span>
        </div>
      </div>

      {/* Scène pylône */}
      <div style={{position:'relative',height:'42vh',minHeight:300,maxHeight:380,display:'flex',justifyContent:'center',alignItems:'flex-end'}}>
        {/* Brume au sol */}
        <div style={{position:'absolute',bottom:-10,left:'50%',transform:'translateX(-50%)',width:280,height:60,
          background:'radial-gradient(ellipse, rgba(150,160,175,0.12) 0%, transparent 75%)',pointerEvents:'none',zIndex:1}}/>
        {/* Halo */}
        <div style={{position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',width:200,height:200,borderRadius:'50%',
          background:'radial-gradient(circle, rgba(232,93,93,0.3) 0%, transparent 70%)',opacity:lit?1:0,
          transition:'opacity 0.7s ease',pointerEvents:'none'}}/>
        {/* Faisceau lumineux vers la carte */}
        <div style={{position:'absolute',top:55,left:'50%',transform:'translateX(-50%)',width:200,height:420,
          background:'linear-gradient(to bottom, rgba(232,93,93,0) 0%, rgba(232,93,93,0.05) 35%, rgba(232,93,93,0.12) 70%, rgba(232,93,93,0.2) 100%)',
          opacity:lit?1:0,transition:'opacity 0.9s ease',pointerEvents:'none',zIndex:1,
          clipPath:'polygon(44% 0%, 56% 0%, 100% 100%, 0% 100%)'}}/>

        <div style={{position:'relative',width:140,height:'100%',maxHeight:400,zIndex:2}}>
          <svg viewBox="0 0 140 400" fill="none" style={{width:'100%',height:'100%',display:'block'}}>
            <line x1="62" y1="26" x2="14" y2="394" stroke={lit?'#5E6B7A':'#4A5562'} strokeWidth="3.5" style={{transition:'stroke .5s'}}/>
            <line x1="78" y1="26" x2="126" y2="394" stroke={lit?'#5E6B7A':'#4A5562'} strokeWidth="3.5" style={{transition:'stroke .5s'}}/>
            <line x1="62" y1="26" x2="42" y2="394" stroke={lit?'#5E6B7A':'#4A5562'} strokeWidth="2" opacity="0.55"/>
            <line x1="78" y1="26" x2="98" y2="394" stroke={lit?'#5E6B7A':'#4A5562'} strokeWidth="2" opacity="0.55"/>

            <g stroke={lit?'#4D5868':'#3A4452'} strokeWidth="1.4" style={{transition:'stroke .5s'}}>
              <path d="M 14 394 L 30 360 M 30 394 L 14 360"/>
              <path d="M 17 360 L 33 326 M 33 360 L 17 326"/>
              <path d="M 20 326 L 35 292 M 35 326 L 20 292"/>
              <path d="M 23 292 L 37 258 M 37 292 L 23 258"/>
              <path d="M 26 258 L 39 224 M 39 258 L 26 224"/>
              <path d="M 29 224 L 41 190 M 41 224 L 29 190"/>
              <path d="M 32 190 L 43 156 M 43 190 L 32 156"/>
              <path d="M 35 156 L 45 122 M 45 156 L 35 122"/>
              <path d="M 38 122 L 47 88 M 47 122 L 38 88"/>
              <path d="M 41 88 L 50 54 M 50 88 L 41 54"/>
              <path d="M 44 54 L 62 26 M 53 54 L 62 26"/>
            </g>
            <g stroke={lit?'#4D5868':'#3A4452'} strokeWidth="1.4" style={{transition:'stroke .5s'}}>
              <path d="M 126 394 L 110 360 M 110 394 L 126 360"/>
              <path d="M 123 360 L 107 326 M 107 360 L 123 326"/>
              <path d="M 120 326 L 105 292 M 105 326 L 120 292"/>
              <path d="M 117 292 L 103 258 M 103 292 L 117 258"/>
              <path d="M 114 258 L 101 224 M 101 258 L 114 224"/>
              <path d="M 111 224 L 99 190 M 99 224 L 111 190"/>
              <path d="M 108 190 L 97 156 M 97 190 L 108 156"/>
              <path d="M 105 156 L 95 122 M 95 156 L 105 122"/>
              <path d="M 102 122 L 93 88 M 93 122 L 102 88"/>
              <path d="M 99 88 L 90 54 M 90 88 L 99 54"/>
              <path d="M 96 54 L 78 26 M 87 54 L 78 26"/>
            </g>
            <g stroke={lit?'#4D5868':'#3A4452'} strokeWidth="1.3" opacity="0.85" style={{transition:'stroke .5s'}}>
              <line x1="14" y1="394" x2="126" y2="394"/>
              <line x1="17" y1="360" x2="123" y2="360"/>
              <line x1="20" y1="326" x2="120" y2="326"/>
              <line x1="23" y1="292" x2="117" y2="292"/>
              <line x1="26" y1="258" x2="114" y2="258"/>
              <line x1="29" y1="224" x2="111" y2="224"/>
              <line x1="32" y1="190" x2="108" y2="190"/>
              <line x1="35" y1="156" x2="105" y2="156"/>
              <line x1="38" y1="122" x2="102" y2="122"/>
              <line x1="41" y1="88" x2="99" y2="88"/>
              <line x1="44" y1="54" x2="96" y2="54"/>
            </g>

            <rect x="6" y="392" width="18" height="6" rx="1" fill="#2A323D"/>
            <rect x="116" y="392" width="18" height="6" rx="1" fill="#2A323D"/>
            <rect x="36" y="392" width="14" height="5" rx="1" fill="#2A323D" opacity="0.7"/>
            <rect x="90" y="392" width="14" height="5" rx="1" fill="#2A323D" opacity="0.7"/>

            <g stroke={lit?'#4D5868':'#3A4452'} strokeWidth="1" opacity="0.6">
              <line x1="50" y1="380" x2="56" y2="380"/>
              <line x1="49" y1="350" x2="55" y2="350"/>
              <line x1="48" y1="320" x2="54" y2="320"/>
              <line x1="47" y1="290" x2="53" y2="290"/>
              <line x1="46" y1="260" x2="52" y2="260"/>
              <line x1="45" y1="230" x2="51" y2="230"/>
              <line x1="44" y1="200" x2="50" y2="200"/>
            </g>

            <path d="M 70 60 C 68 120, 72 200, 69 280 C 67 330, 71 370, 70 394" stroke={lit?'#4D5868':'#3A4452'} strokeWidth="1.2" opacity="0.5" fill="none"/>
            <rect x="42" y="44" width="36" height="5" rx="1" fill="#2A323D"/>

            <rect x="24" y="22" width="9" height="30" rx="1.5" fill={lit?RED:'#2A323D'} style={lit?{filter:'drop-shadow(0 0 5px rgba(232,93,93,0.7))'}:{}}/>
            <rect x="65" y="14" width="9" height="30" rx="1.5" fill={lit?RED:'#2A323D'} style={lit?{filter:'drop-shadow(0 0 5px rgba(232,93,93,0.7))'}:{}}/>
            <rect x="106" y="22" width="9" height="30" rx="1.5" fill={lit?RED:'#2A323D'} style={lit?{filter:'drop-shadow(0 0 5px rgba(232,93,93,0.7))'}:{}}/>

            <circle cx="36" cy="90" r="8" fill={lit?RED:'#2A323D'} style={lit?{filter:'drop-shadow(0 0 5px rgba(232,93,93,0.7))'}:{}}/>
            <circle cx="104" cy="90" r="8" fill={lit?RED:'#2A323D'} style={lit?{filter:'drop-shadow(0 0 5px rgba(232,93,93,0.7))'}:{}}/>

            <line x1="70" y1="14" x2="70" y2="4" stroke={lit?'#5E6B7A':'#4A5562'} strokeWidth="2"/>
            <circle cx="70" cy="3" r="4.5" fill={lit?'#FF4444':'#5A2020'} style={lit?{filter:'drop-shadow(0 0 8px rgba(255,68,68,1))',animation:'citBlink 1.6s ease-in-out infinite'}:{}}/>
          </svg>

          {!lit && (
            <div style={{position:'absolute',bottom:30,right:-30,fontSize:10,color:'#5B6472',fontWeight:600,
              textAlign:'center',width:95,animation:'citBob 1.6s ease-in-out infinite'}}>
              Tirez le cordon pour activer le site
            </div>
          )}

          <div ref={cordZoneRef}
            onMouseDown={e=>onCordStart(e.clientY)}
            onTouchStart={e=>onCordStart(e.touches[0].clientY)}
            onClick={()=>{ if(!dragging){ lit ? turnOff() : turnOn(); } }}
            style={{position:'absolute',bottom:0,right:-56,width:60,height:170,cursor:dragging?'grabbing':'grab'}}>
            <div style={{position:'absolute',top:0,left:'50%',width:2,height:105,background:'#4A5562',transform:'translateX(-50%)'}}/>
            <div style={{position:'absolute',top:lit?145:105,left:'50%',transform:'translate(-50%,0)',width:24,height:24,
              borderRadius:'50%',background:RED,boxShadow:'0 4px 12px rgba(0,0,0,0.4)',transition:'top .25s cubic-bezier(0.34,1.56,0.64,1)'}}>
              <div style={{position:'absolute',inset:7,borderRadius:'50%',background:'rgba(255,255,255,0.35)'}}/>
            </div>
          </div>
        </div>
      </div>

      {/* Carte de connexion */}
      <div style={{position:'relative',zIndex:3,marginTop:-28,background:'#12161B',borderRadius:'28px 28px 0 0',
        padding:'30px 28px 28px',flex:1,
        border:lit?'1.5px solid rgba(232,93,93,0.5)':'1.5px solid rgba(232,93,93,0)',
        borderBottom:'none',
        transform:lit?'translateY(0)':'translateY(100%)',opacity:lit?1:0,
        boxShadow:lit?'0 0 0 1px rgba(232,93,93,0.15), 0 -10px 30px -6px rgba(232,93,93,0.25), 0 0 40px -8px rgba(232,93,93,0.3), inset 0 0 24px -8px rgba(232,93,93,0.18)':'none',
        transition:'transform 0.7s cubic-bezier(0.16,1,0.3,1), opacity 0.5s ease, border-color 1.1s ease, box-shadow 1.1s ease'}}>

        <div style={{width:76,height:76,borderRadius:'50%',background:'#1A1F26',
          border:lit?'2px solid rgba(232,93,93,0.8)':'2px solid rgba(232,93,93,0.4)',
          display:'flex',alignItems:'center',justifyContent:'center',margin:'-58px auto 22px',position:'relative',zIndex:2,
          boxShadow:lit?'0 0 22px rgba(232,93,93,0.35)':'none',transition:'border-color .9s ease, box-shadow .9s ease'}}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="1.8">
            <circle cx="12" cy="8" r="4"/>
            <path d="M4 21v-1a8 8 0 0116 0v1"/>
          </svg>
        </div>

        <div style={{marginBottom:14}}>
          <label style={{display:'block',fontSize:11,fontWeight:600,color:'#8A9099',marginBottom:7,textTransform:'uppercase',letterSpacing:'0.6px'}}>Email</label>
          <div style={{display:'flex',alignItems:'center',background:'rgba(255,255,255,0.04)',border:'1.5px solid rgba(255,255,255,0.1)',borderRadius:14,padding:'0 16px',height:50}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#565C66" strokeWidth="2" style={{marginRight:10,flexShrink:0}}>
              <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
            </svg>
            <input type="text" inputMode="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="vous@cleanit.cm" autoComplete="username" autoCorrect="off" autoCapitalize="none" spellCheck="false"
              onKeyDown={e=>e.key==='Enter'&&doLogin()}
              style={{flex:1,background:'none',border:'none',outline:'none',color:'#FAFAF8',fontSize:14}}/>
          </div>
        </div>

        <div style={{marginBottom:8}}>
          <label style={{display:'block',fontSize:11,fontWeight:600,color:'#8A9099',marginBottom:7,textTransform:'uppercase',letterSpacing:'0.6px'}}>Mot de passe</label>
          <div style={{display:'flex',alignItems:'center',background:'rgba(255,255,255,0.04)',border:'1.5px solid rgba(255,255,255,0.1)',borderRadius:14,padding:'0 16px',height:50}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#565C66" strokeWidth="2" style={{marginRight:10,flexShrink:0}}>
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="••••••••"
              autoComplete="current-password" autoCorrect="off" autoCapitalize="none"
              onKeyDown={e=>e.key==='Enter'&&doLogin()}
              style={{flex:1,background:'none',border:'none',outline:'none',color:'#FAFAF8',fontSize:14}}/>
          </div>
        </div>

        {err && (
          <div style={{background:'rgba(232,93,93,0.1)',color:'#F2A0A0',borderRadius:10,padding:'9px 13px',
            fontSize:12.5,marginTop:14,textAlign:'center',border:'1px solid rgba(232,93,93,0.25)'}}>
            {err}
          </div>
        )}

        <button onClick={doLogin} disabled={loading} style={{width:'100%',height:51,
          background:loading?'#6B4444':RED,border:'none',borderRadius:14,color:'#14171A',
          fontSize:15,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:8,
          marginTop:18,cursor:loading?'default':'pointer'}}>
          {loading ? 'Connexion...' : (<>Se connecter
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </>)}
        </button>

        <div style={{textAlign:'center',marginTop:18,fontSize:11,color:'#565C66'}}>
          CleanIT SARL — Douala, Cameroun
        </div>
      </div>
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
  const [terrainUsers, setTerrainUsers] = useState([]);
  const [activeMissions, setActiveMissions] = useState([]);
  const touchStartY = useRef(0);
  const C2 = getC();
  const EMOJIS = ['👍','🔥','👏','😮','😂','🙏'];

  // Charger les techniciens terrain et leurs missions actives ("Sites actifs")
  useEffect(() => {
    const tk = localStorage.getItem('token');
    const h = {'Authorization':'Bearer '+tk};
    const b = 'https://backend-cleanit-erp.vercel.app';
    Promise.all([
      fetch(b+'/users',{headers:h}).then(r=>r.json()).catch(()=>[]),
      fetch(b+'/missions',{headers:h}).then(r=>r.json()).catch(()=>[]),
    ]).then(([us,ms])=>{
      if(Array.isArray(us)){
        const colors = ['#0066CC','#7C3AED','#059669','#EA580C','#DC2626'];
        setTerrainUsers(us.filter(u=>['technician','terrain'].includes(u.role)).map((u,i)=>({
          id: u.id,
          av: ((u.firstName||'?')[0]+(u.lastName||'')[0]).toUpperCase(),
          color: colors[i%colors.length],
        })));
      }
      if(Array.isArray(ms)) setActiveMissions(ms.filter(m=>m.status==='in_progress'));
    });
  }, []);

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
            siteName: (()=>{const s=p.site_name||'';try{return s.startsWith('{')?JSON.parse(s).siteName||s:s;}catch{return s;}})(),
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
            name: p.user_name, site: p.site, siteName: (()=>{const s=p.site_name||'';try{return s.startsWith('{')?JSON.parse(s).siteName||s:s;}catch{return s;}})(),
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
            const m = activeMissions.find(ms=>ms.tech_id===u.id);
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

const ScreenCamera = ({user, gps, now, navigate}) => {
  const vRef = useRef(null);
  const cRef = useRef(null);
  const streamRef = useRef(null);
  const [active, setActive] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [last, setLast] = useState(null);
  const [flash, setFlash] = useState(false);
  const [w3wAddress, setW3wAddress] = useState(null);
  const [myMission, setMyMission] = useState(null);
  const [siteInput, setSiteInput] = useState('');
  const [siteEdited, setSiteEdited] = useState(false);
  const {toast, toastMsg, toastShow,toastType} = useToast();
  const n = now || new Date();

  useEffect(() => {
    const tk = localStorage.getItem('token');
    fetch('https://backend-cleanit-erp.vercel.app/missions/my',{headers:{'Authorization':'Bearer '+tk}})
      .then(r=>r.json()).then(d=>{
        if(Array.isArray(d) && d[0]){
          setMyMission(d[0]);
          // Pré-remplir avec le site du planning, seulement si l'utilisateur n'a pas déjà tapé quelque chose
          if(!siteEdited) setSiteInput(d[0].site||'');
        }
      }).catch(()=>{});
  }, []);

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

  const [address, setAddress] = useState(null);
  useEffect(() => {
    if(gps?.lat && gps?.lng){
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${gps.lat}&lon=${gps.lng}&addressdetails=1`,
        {headers:{'User-Agent':'CleanIT-ERP-CleanCam/1.0'}})
        .then(r=>r.json()).then(d=>{
          const a = d.address||{};
          const parts = [a.country, a.state, a.county, a.suburb||a.neighbourhood||a.road].filter(Boolean);
          setAddress(parts.join(', ')||d.display_name||null);
        }).catch(()=>{});
    }
  }, [gps?.lat, gps?.lng]);

  const shoot = () => {
    if(!siteInput.trim()){
      toast('Indiquez le code du site avant de prendre la photo','error');
      return;
    }
    const v = vRef.current;
    const canvas = cRef.current;
    if(!v || !canvas) return;
    canvas.width = v.videoWidth || 640;
    canvas.height = v.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);

    // Encart légende en haut à gauche — format Lat/Long/Alt/Accuracy/Time/Address
    const lines = [
      `Latitude: ${gps?.lat?.toFixed(7)||'—'}`,
      `Longitude: ${gps?.lng?.toFixed(7)||'—'}`,
      `Altitude: ${gps?.altitude!=null?gps.altitude.toFixed(1)+' m':'—'}`,
      `Accuracy: ${gps?.accuracy!=null?gps.accuracy.toFixed(1)+' m':'—'}`,
      `Time: ${n.toLocaleDateString('en-GB',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'})} ${n.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}`,
      `Address: ${address||'Localisation en cours...'}`,
      siteInput?`Site: ${siteInput}`:'Site: —',
    ];
    const lineH = 17;
    const padX = 12, padY = 10;
    const boxW = Math.min(canvas.width*0.78, 340);
    const boxH = lines.length*lineH + padY*2;
    ctx.fillStyle = 'rgba(255,255,255,.88)';
    ctx.fillRect(0, 0, boxW, boxH);
    ctx.fillStyle = '#111';
    ctx.font = '12px system-ui, sans-serif';
    ctx.textBaseline = 'top';
    lines.forEach((line,i)=>{
      ctx.fillText(line, padX, padY + i*lineH);
    });

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

      <button onClick={()=>{stopCam(); navigate('/mobile');}}
        style={{position:'absolute',top:14,left:14,zIndex:40,width:34,height:34,borderRadius:'50%',
          background:'rgba(0,0,0,.55)',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>

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
            <div style={{position:'absolute',top:10,right:10,display:'flex',alignItems:'center',gap:5,
              background:'rgba(0,0,0,.55)',borderRadius:10,padding:'3px 6px 3px 10px',
              border:siteInput.trim()?'1px solid transparent':'1px solid rgba(232,93,93,.7)'}}>
              <span style={{fontSize:8,color:'rgba(255,255,255,.6)'}}>Site:</span>
              <input value={siteInput} onChange={e=>{setSiteInput(e.target.value);setSiteEdited(true);}}
                placeholder="Obligatoire"
                style={{background:'transparent',border:'none',outline:'none',color:'white',
                  fontSize:9,fontWeight:600,fontFamily:FONT,width:90,padding:'2px 0'}}/>
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
        <div style={{background:'#0a0a0a',padding:'0 14px 12px',textAlign:'center'}}>
          <div style={{fontSize:11,color:'rgba(34,197,94,.9)',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            <span>✓</span> Photo enregistrée dans la galerie
          </div>
        </div>
      )}
    </div>
  );
};

// ─── SCREEN: MESSAGES ─────────────────────────────────────────
// Composant réutilisable : crée une room Daily.co via le backend puis affiche l'iframe
const DailyFrame = ({ room, displayName, audioOnly }) => {
  const [roomUrl, setRoomUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const tk = localStorage.getItem('token');
    fetch('https://backend-cleanit-erp.vercel.app/calls/daily-room', {
      method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk},
      body: JSON.stringify({ roomName: room })
    }).then(r=>r.json()).then(r=>{
      if(r.url) setRoomUrl(r.url); else setError(r.message||'Erreur création room');
    }).catch(e=>setError(e.message));
  }, [room]);

  if(error) return (
    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:13,padding:20,textAlign:'center'}}>
      Erreur de connexion : {error}
    </div>
  );
  if(!roomUrl) return (
    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,.6)',fontSize:13}}>
      Connexion en cours...
    </div>
  );
  return (
    <iframe
      src={`${roomUrl}?displayname=${encodeURIComponent(displayName||'Utilisateur')}`}
      style={{flex:1,border:'none'}}
      allow="camera; microphone; fullscreen; display-capture" title="Appel"/>
  );
};

const ScreenMessages = () => {
  const [openConv, setOpenConv] = useState(null);
  const [inCall, setInCall] = useState(null); // {type:'audio'|'video'}
  const [msg, setMsg] = useState('');
  const [chatMsgs, setChatMsgs] = useState([]);
  const [convos, setConvos] = useState([]);
  const [convId, setConvId] = useState(null);
  const pollRef = useRef(null);
  const meId = JSON.parse(localStorage.getItem('user')||'{}').id;
  const token = localStorage.getItem('token');
  const BASE = 'https://backend-cleanit-erp.vercel.app';

  useEffect(()=>{
    fetch(BASE+'/conversations',{headers:{'Authorization':'Bearer '+token}})
      .then(r=>r.json()).then(d=>{ if(Array.isArray(d)) setConvos(d); }).catch(()=>{});
  },[]);
  const [msgTab, setMsgTab] = useState('messages');
  const [contacts, setContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState('');

  useEffect(()=>{
    const fetchOnline = () => {
      const tk = localStorage.getItem('token');
      const me = JSON.parse(localStorage.getItem('user')||'{}');
      fetch('https://backend-cleanit-erp.vercel.app/users/online',{headers:{'Authorization':'Bearer '+tk}})
        .then(r=>r.json()).then(users=>{
          if(!Array.isArray(users)) return;
          setContacts(users.filter(u=>u.id!==me.id).map(u=>({
            id:u.id, name:(u.firstName||'')+(u.lastName?' '+u.lastName:''),
            role:u.role==='project_manager'?'Project Manager':u.role==='hr'?'RH Manager':u.role==='admin'?'Administrateur':'Technicien',
            status:u.status||'offline', avatar:((u.firstName||'')[0]||'?')+((u.lastName||'')[0]||''),
          })));
        }).catch(()=>{});
    };
    fetchOnline();
    const iv = setInterval(fetchOnline, 30000);
    return () => clearInterval(iv);
  },[]);


  // Charger la liste des conversations avec les derniers messages
  const loadConvList = async () => {
    try {
      const tk = localStorage.getItem('token');
      const me = JSON.parse(localStorage.getItem('user')||'{}');
      const users = await fetch(BASE+'/users/online',{headers:{'Authorization':'Bearer '+tk}}).then(r=>r.json()).catch(()=>[]);
      if(Array.isArray(users)) {
        setContacts(users.filter(u=>u.id!==me.id).map(u=>({
          id:u.id, name:(u.firstName||'')+(u.lastName?' '+u.lastName:''),
          role:u.role==='project_manager'?'Project Manager':u.role==='hr'?'RH Manager':u.role==='admin'?'Administrateur':'Technicien',
          status:u.status||'offline', avatar:((u.firstName||'')[0]||'?')+((u.lastName||'')[0]||''),
        })));
      }
    } catch(e){}
  };

  const openConvFn = async(conv) => {
    setOpenConv(conv);
    try {
      const r = await fetch(BASE+'/conversations',{
        method:'POST',
        headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'},
        body: JSON.stringify({participantId: conv.otherId})
      }).then(r=>r.json());
      setConvId(r.id);
      loadMsgs(r.id);
      if(pollRef.current) clearInterval(pollRef.current);
      // Polling messages toutes les 3s quand conversation ouverte
      pollRef.current = setInterval(()=>loadMsgs(r.id), 3000);
    } catch(e){}
  };

  const loadMsgs = async(cid) => {
    try {
      const d = await fetch(BASE+'/messages/'+cid,{headers:{'Authorization':'Bearer '+token}}).then(r=>r.json());
      if(Array.isArray(d)) setChatMsgs(d);
    } catch(e){}
  };

  useEffect(()=>()=>{ if(pollRef.current) clearInterval(pollRef.current); },[]);

  const C2 = getC();

  if(openConv) return (
    <div style={{position:'fixed',inset:0,display:'flex',flexDirection:'column',background:C2.bg,zIndex:200,maxWidth:430,margin:'0 auto'}}>
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
        <button onClick={async ()=>{
            const tk = localStorage.getItem('token');
            const me = JSON.parse(localStorage.getItem('user')||'{}');
            const room = `CleanIT-dm-${[me.id, openConv.otherId].sort((a,b)=>a-b).join('-')}`;
            try {
              const r = await fetch('https://backend-cleanit-erp.vercel.app/calls/initiate',{
                method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk},
                body:JSON.stringify({calleeId:openConv.otherId, type:'video', room})
              }).then(r=>r.json());
              setInCall({type:'video', callId:r.id, room});
            } catch(e){ setInCall({type:'video', room}); }
          }}
          style={{background:'none',border:'none',cursor:'pointer',padding:6,
            display:'flex',alignItems:'center',justifyContent:'center'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C2.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
        </button>
        <button onClick={async ()=>{
            const tk = localStorage.getItem('token');
            const me = JSON.parse(localStorage.getItem('user')||'{}');
            const room = `CleanIT-dm-${[me.id, openConv.otherId].sort((a,b)=>a-b).join('-')}`;
            try {
              const r = await fetch('https://backend-cleanit-erp.vercel.app/calls/initiate',{
                method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk},
                body:JSON.stringify({calleeId:openConv.otherId, type:'audio', room})
              }).then(r=>r.json());
              setInCall({type:'audio', callId:r.id, room});
            } catch(e){ setInCall({type:'audio', room}); }
          }}
          style={{background:'none',border:'none',cursor:'pointer',padding:6,
            display:'flex',alignItems:'center',justifyContent:'center'}}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={C2.primary} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
          </svg>
        </button>
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
        {chatMsgs.map((m,i)=>{
          const meId = JSON.parse(localStorage.getItem('user')||'{}').id;
          const isMe = m.from_id ? Number(m.from_id)===Number(meId) : m.from==='me';
          const timeStr = m.created_at
            ? new Date(m.created_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})
            : (m.time||'');
          return (
          <div key={m.id||i} style={{display:'flex',
            justifyContent:isMe?'flex-end':'flex-start'}}>
            <div style={{maxWidth:'75%',padding:'9px 12px',
              borderRadius:isMe?'16px 16px 4px 16px':'16px 16px 16px 4px',
              background:isMe?C2.primary:C2.bg2,
              color:isMe?'#fff':C2.text}}>
              {!isMe&&<div style={{fontSize:10,fontWeight:700,color:C2.primary,marginBottom:3}}>{m.from_name||''}</div>}
              <div style={{fontSize:13,lineHeight:1.4}}>{m.text}</div>
              <div style={{fontSize:9,marginTop:4,textAlign:'right',
                color:isMe?'rgba(255,255,255,.7)':C2.text3}}>
                {timeStr}
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {inCall && (
        <div style={{position:'fixed',inset:0,background:'#0b1120',zIndex:300,
          display:'flex',flexDirection:'column',maxWidth:430,margin:'0 auto'}}>
          <div style={{padding:'10px 16px',background:'#111827',display:'flex',
            alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:'#fff'}}>
                {inCall.type==='video'?'Appel vidéo':'Appel audio'} · {openConv.name||openConv.from}
              </div>
              <div style={{fontSize:10,color:'rgba(255,255,255,.5)'}}>En cours</div>
            </div>
            <button onClick={async ()=>{
                const tk = localStorage.getItem('token');
                if(inCall.callId) await fetch(`https://backend-cleanit-erp.vercel.app/calls/${inCall.callId}/end`,{method:'POST',headers:{'Authorization':'Bearer '+tk}}).catch(()=>{});
                setInCall(null);
              }}
              style={{padding:'6px 14px',borderRadius:8,border:'none',background:'#DC2626',
                color:'#fff',fontWeight:700,fontSize:11,cursor:'pointer'}}>
              Quitter
            </button>
          </div>
          <DailyFrame
            room={inCall.room||`CleanIT-dm-${[JSON.parse(localStorage.getItem('user')||'{}').id, openConv.otherId].sort((a,b)=>a-b).join('-')}`}
            displayName={JSON.parse(localStorage.getItem('user')||'{}').firstName}
            audioOnly={inCall.type==='audio'}/>
        </div>
      )}

      <div style={{position:'fixed',bottom:0,left:0,right:0,maxWidth:430,margin:'0 auto',
        padding:'10px 14px',background:C2.bg,borderTop:'1px solid '+C2.border,
        display:'flex',gap:8,zIndex:50}}>
        <input value={msg} onChange={e=>setMsg(e.target.value)}
          placeholder="Ecrivez un message..."
          onKeyDown={e=>{if(e.key==='Enter'&&msg.trim()){
            document.querySelector('[data-send-btn]')?.click();
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
              const token = localStorage.getItem('token');
              await fetch('https://backend-cleanit-erp.vercel.app/whatsapp/send', {
                method:'POST',
                headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
                body: JSON.stringify({to: openConv.phone, message: msgText})
              });
            } catch(e) { console.log('WhatsApp send error:', e); }
          } else if(convId) {
            try {
              const tkn = localStorage.getItem('token');
              const saved = await fetch('https://backend-cleanit-erp.vercel.app/messages',{
                method:'POST',
                headers:{'Content-Type':'application/json','Authorization':'Bearer '+tkn},
                body: JSON.stringify({conversationId: convId, text: msgText})
              }).then(r=>r.json());
              if(saved.id) setChatMsgs(p=>[...p, saved]);
            } catch(e) { console.log('Message send error:', e); }
          }
        }} data-send-btn style={{width:42,height:42,borderRadius:21,background:C2.primary,
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

  return (
    <div style={{flex:1,overflowY:'auto',background:C2.bg,paddingBottom:80}}>
      <Header title="Messages" right={
        <div style={{display:'flex',gap:14}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C2.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{cursor:'pointer'}}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
      }/>
      <div style={{display:'flex',padding:'8px 14px',gap:6,borderBottom:'1px solid '+C2.border}}>
        {[['messages','Conversations'],['contacts','Contacts']].map(([id,lbl])=>(
          <button key={id} onClick={()=>setMsgTab(id)}
            style={{flex:1,padding:'7px',border:'none',borderRadius:8,background:msgTab===id?'#1B4F8A':'transparent',color:msgTab===id?'white':C2.text3,fontWeight:msgTab===id?600:400,fontSize:12,cursor:'pointer',fontFamily:FONT}}>
            {lbl}
          </button>
        ))}
      </div>
      {msgTab==='contacts'&&(
        <div style={{padding:'10px 14px'}}>
          <input value={contactSearch} onChange={e=>setContactSearch(e.target.value)} placeholder="Rechercher..."
            style={{width:'100%',padding:'9px 12px',border:'1px solid '+C2.border,borderRadius:8,fontSize:13,marginBottom:8,boxSizing:'border-box',outline:'none',fontFamily:FONT}}/>
          {contacts.filter(c=>!contactSearch||c.name.toLowerCase().includes(contactSearch.toLowerCase())).map((c,i)=>(
            <div key={i} onClick={async()=>{
              const tk2=localStorage.getItem('token');
              const r=await fetch('https://backend-cleanit-erp.vercel.app/conversations',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk2},body:JSON.stringify({participantId:c.id})}).then(r=>r.json()).catch(()=>null);
              if(r?.id) setMsgTab('messages');
            }} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 6px',borderRadius:8,cursor:'pointer',marginBottom:3}}>
              <div style={{width:42,height:42,borderRadius:'50%',background:'#1B4F8A22',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#1B4F8A',flexShrink:0,position:'relative'}}>
                {c.avatar}
                <div style={{position:'absolute',bottom:1,right:1,width:10,height:10,borderRadius:'50%',background:c.status==='online'?'#22c55e':'#9ca3af',border:'2px solid white'}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:C2.text}}>{c.name}</div>
                <div style={{fontSize:11,color:C2.text3}}>{c.role}</div>
              </div>
              <span style={{fontSize:10,color:c.status==='online'?'#22c55e':'#9ca3af'}}>{c.status==='online'?'En ligne':'Hors ligne'}</span>
            </div>
          ))}
          {contacts.length===0&&<div style={{textAlign:'center',padding:24,color:C2.text3,fontSize:13}}>Chargement...</div>}
        </div>
      )}
      {msgTab==='messages'&&(
        <div>
          {convos.filter(c=>{const isP1=c.p1_id===meId;const otherId=isP1?c.p2_id:c.p1_id;return Number(otherId)!==Number(meId);}).map(c=>{
            const isP1=c.p1_id===meId;
            const otherFirst=isP1?c.p2_first:c.p1_first;
            const otherLast=isP1?c.p2_last:c.p1_last;
            const otherId=isP1?c.p2_id:c.p1_id;
            const av=((otherFirst||'')[0]+(otherLast||'')[0]).toUpperCase();
            const conv={id:c.id,type:'dm',otherId,name:(otherFirst||'')+' '+(otherLast||''),av,color:'#1B4F8A',last:c.last_message||'Nouvelle conversation',time:c.last_message_at?new Date(c.last_message_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}):'',unread:parseInt(c.unread)||0};
            return (
              <div key={conv.id} onClick={()=>openConvFn(conv)} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',borderBottom:'0.5px solid '+C2.border,cursor:'pointer',background:C2.bg}}>
                <div style={{width:44,height:44,borderRadius:'50%',background:'#1B4F8A22',border:'1.5px solid #1B4F8A',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#1B4F8A'}}>
                  {conv.av}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                    <span style={{fontSize:13,fontWeight:conv.unread?700:500,color:C2.text}}>{conv.name}</span>
                    <span style={{fontSize:10,color:C2.text3}}>{conv.time}</span>
                  </div>
                  <div style={{fontSize:11,color:C2.text3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{conv.last}</div>
                </div>
                {conv.unread>0&&<div style={{width:20,height:20,borderRadius:10,background:'#E86C6C',color:'white',fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{conv.unread}</div>}
              </div>
            );
          })}
          {convos.length===0&&<div style={{textAlign:'center',padding:32,color:C2.text3,fontSize:13}}>Aucune conversation — allez dans Contacts</div>}
        </div>
      )}
    </div>
  );
};
// ─── BADGE PERSONNEL AVEC VRAI QR CODE SCANNABLE ──────────────
const BadgeQR = ({ user, bColor, av }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !user?.id) return;
    const payload = JSON.stringify({
      type: 'CLEANIT_POINTAGE',
      userId: user.id,
      userName: `${user.firstName || user.name || ''} ${user.lastName || ''}`.trim(),
      role: user.role,
      code: 'CLEANIT-EMP-' + user.id,
    });
    QRCode.toCanvas(canvasRef.current, payload, {
      width: 200, margin: 1,
      color: { dark: bColor || '#1a1a1a', light: '#ffffff' },
    }).catch(() => {});
  }, [user?.id, bColor]);

  return (
    <div style={{padding:20,display:'flex',flexDirection:'column',alignItems:'center',gap:14}}>
      <div style={{width:120,height:120,borderRadius:24,background:bColor+'15',border:'2px solid '+bColor,
        display:'flex',alignItems:'center',justifyContent:'center',fontSize:44,fontWeight:800,color:bColor}}>{av}</div>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:18,fontWeight:700,color:'#111'}}>{user.firstName||user.name} {user.lastName||''}</div>
        <div style={{fontSize:12,color:'#888'}}>{user.role} · CleanIT</div>
      </div>
      <div style={{background:'#fff',borderRadius:14,padding:14,boxShadow:'0 2px 12px rgba(0,0,0,.08)',border:'1px solid #eee'}}>
        <canvas ref={canvasRef}/>
      </div>
      <div style={{fontSize:11,color:'#999',textAlign:'center',maxWidth:260}}>
        Scannez ce QR depuis l'onglet "Scanner QR" pour pointer votre arrivée ou votre départ
      </div>
      <div style={{background:bColor,borderRadius:10,padding:'8px 20px',width:'100%',textAlign:'center',color:'white',fontSize:12,fontWeight:600}}>
        ID: EMP-{String(user.id||'001').padStart(4,'0')}
      </div>
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
    const token = localStorage.getItem('token');
    fetch('https://backend-cleanit-erp.vercel.app/pointages',{headers:{'Authorization':'Bearer '+token}})
      .then(r=>r.json()).then(d=>{if(Array.isArray(d))setHistory(d);}).catch(()=>{});
    return()=>stopScan();
  },[]);

  const stopScan = () => {
    if(animRef.current) cancelAnimationFrame(animRef.current);
    if(streamRef.current) streamRef.current.getTracks().forEach(t=>t.stop());
    streamRef.current=null; setScanning(false);
  };

  // Coupe la caméra si l'utilisateur quitte l'écran sans cliquer "Arrêter"
  // (navigation vers un autre onglet) — évite que le flux reste actif en arrière-plan
  useEffect(() => () => {
    if(animRef.current) cancelAnimationFrame(animRef.current);
    if(streamRef.current) streamRef.current.getTracks().forEach(t=>t.stop());
    streamRef.current = null;
  }, []);

  const scanFrame = () => {
    if(!videoRef.current||!canvasRef.current) return;
    const v=videoRef.current; const cv=canvasRef.current;
    const ctx=cv.getContext('2d');
    if(v.readyState===v.HAVE_ENOUGH_DATA){
      cv.width=v.videoWidth; cv.height=v.videoHeight;
      ctx.drawImage(v,0,0,cv.width,cv.height);
      const img=ctx.getImageData(0,0,cv.width,cv.height);
      if(jsQR){
        const code=jsQR(img.data,img.width,img.height);
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

  const parseQrName = (raw) => {
    if (!raw) return 'Site inconnu';
    if (!String(raw).trim().startsWith('{')) return raw;
    try {
      const p = JSON.parse(raw);
      return p.siteName || p.userName || p.name || 'Badge personnel';
    } catch (e) { return 'Badge scanné'; }
  };

  const handleQRCode = async(data) => {
    stopScan();
    let site={code:data,name:parseQrName(data)};
    try{
      const p=JSON.parse(data);
      if(p.type==='CLEANIT_POINTAGE'){
        // Badge personnel scanné par son propriétaire — pointage sur son lieu de travail
        site={code:p.code||data, name:'Poste de travail — '+(p.userName||'employé'), userId:p.userId, userName:p.userName};
      } else {
        site={code:p.code||data, name:p.siteName||p.name||parseQrName(data)};
      }
    }catch(e){}
    setScanned(site); setLoading(true);
    try {
      const token=localStorage.getItem('token');
      const r=await fetch('https://backend-cleanit-erp.vercel.app/pointages',{
        method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
        body:JSON.stringify({siteCode:site.code,siteName:site.name,gpsLat:gps?.lat,gpsLng:gps?.lng})
      });
      const d=await r.json();
      toast((d.type==='arrivee'?'Arrivée':'Départ')+' enregistré — '+site.name,'success');
      setHistory(h=>[d,...h]);
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
        <BadgeQR user={user} bColor={bColor} av={av}/>
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
              <div style={{fontSize:12,color:C2.text,marginTop:6}}>{scanned?.name||'Pointage enregistré'}</div>
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
              <div style={{width:36,height:36,borderRadius:'50%',background:h.type==='depart'?'#FEF3C7':C2.successL,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>
                {h.type==='depart'?'🚪':'📍'}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:C2.text}}>
                  {parseQrName(h.site_name||h.site_code)||'Pointage'}
                </div>
                <div style={{fontSize:10,color:C2.text3}}>
                  {h.type==='depart'?'Départ':'Arrivée'} · {new Date(h.created_at).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}
                </div>
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
  const [allUsers, setAllUsers] = useState([]);
  const {toast,toastMsg,toastShow,toastType} = useToast();

  useEffect(() => {
    const tk = localStorage.getItem('token');
    fetch('https://backend-cleanit-erp.vercel.app/users',{headers:{'Authorization':'Bearer '+tk}})
      .then(r=>r.json()).then(d=>{
        if(Array.isArray(d)){
          const colors=['#0066CC','#7C3AED','#059669','#EA580C','#DC2626'];
          setAllUsers(d.map((u,i)=>({
            id:u.id, name:(u.firstName||'')+' '+(u.lastName||''),
            post:u.role, av:((u.firstName||'?')[0]+(u.lastName||'')[0]).toUpperCase(),
            color:colors[i%colors.length],
          })));
        }
      }).catch(()=>{});
  }, []);

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
                const u = allUsers.find(u=>u.id===tid);
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
const ScreenEquipe = ({user, navigate}) => {
  const [tab,setTab] = useState('team');
  const [users,setUsers] = useState([]);
  const [missions,setMissions] = useState([]);
  const [loading,setLoading] = useState(true);
  const {toast,toastMsg,toastShow,toastType} = useToast();
  const C2 = getC();

  useEffect(()=>{
    const load = () => {
      const tk = localStorage.getItem('token');
      const h = {'Authorization':'Bearer '+tk};
      const b = 'https://backend-cleanit-erp.vercel.app';
      Promise.all([
        fetch(b+'/users',{headers:h}).then(r=>r.json()).catch(()=>[]),
        fetch(b+'/missions',{headers:h}).then(r=>r.json()).catch(()=>[]),
      ]).then(([us,ms])=>{
        if(Array.isArray(us)) setUsers(us);
        if(Array.isArray(ms)) setMissions(ms);
      }).finally(()=>setLoading(false));
    };
    load();
    const iv = setInterval(load, 10000);
    return ()=>clearInterval(iv);
  },[]);

  const terrain = users.filter(u=>['technician','terrain'].includes(u.role));
  const bureau = users.filter(u=>!['technician','terrain'].includes(u.role));
  const canAll = ['admin','hr','dg'].includes(user.role);
  const display = tab==='team'?(canAll?[...terrain,...bureau]:terrain):[];
  const active = missions.filter(m=>m.status==='in_progress');
  const pending = missions.filter(m=>m.status==='pending');
  const avail = users.filter(u=>['technician','terrain'].includes(u.role)&&!missions.find(m=>m.tech_id===u.id&&m.status==='in_progress'));

  const assign = async(mId,uId,uName) => {
    const tk = localStorage.getItem('token');
    const r = await fetch('https://backend-cleanit-erp.vercel.app/missions/'+mId,{method:'PUT',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk},
      body:JSON.stringify({techId:uId,status:'in_progress'})}).then(r=>r.json()).catch(()=>null);
    if(r?.id){ toast(uName+' assigné(e)','success'); setMissions(ms=>ms.map(m=>m.id===mId?{...m,tech_id:uId,status:'in_progress'}:m)); }
    else toast('Erreur','error');
  };

  const callUser = async (otherId, type) => {
    const tk = localStorage.getItem('token');
    const me = JSON.parse(localStorage.getItem('user')||'{}');
    const room = `CleanIT-dm-${[me.id, otherId].sort((a,b)=>a-b).join('-')}`;
    try {
      const r = await fetch('https://backend-cleanit-erp.vercel.app/calls/initiate',{
        method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk},
        body:JSON.stringify({calleeId:otherId, type, room})
      }).then(r=>r.json());
      navigate('/mobile/messages', { state:{ startCall:{type, callId:r.id, room} } });
    } catch(e){ toast('Erreur appel','error'); }
  };

  return (
    <div style={{flex:1,overflowY:'auto',background:C2.bg,paddingBottom:80}}>
      <Toast msg={toastMsg} show={toastShow} type={toastType}/>
      <Header title="Équipe"/>
      {loading?(
        <div style={{padding:32,textAlign:'center'}}><div style={{width:32,height:32,border:'3px solid '+C2.primaryL,borderTopColor:C2.primary,borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto'}}/></div>
      ):(
        <>
          <div style={{display:'flex',borderBottom:'1px solid '+C2.border}}>
            {[['team','Équipe ('+(canAll?users.length:terrain.length)+')'],['active','En cours ('+active.length+')'],['assign','À assigner ('+pending.length+')']].map(([id,lbl])=>(
              <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:'9px 4px',border:'none',background:C2.bg,
                fontSize:10,fontWeight:tab===id?700:500,cursor:'pointer',fontFamily:FONT,
                color:tab===id?C2.primary:C2.text3,borderBottom:tab===id?'2px solid '+C2.primary:'2px solid transparent'}}>{lbl}</button>
            ))}
          </div>

          {tab==='team' && display.map(u=>{
            const av=((u.firstName||'')[0]+(u.lastName||'')[0]).toUpperCase();
            const col=u.role==='admin'?'#DC2626':u.role==='project_manager'?'#7C3AED':u.role==='hr'?'#059669':'#EA580C';
            const isActive=u.lastSeen&&(Date.now()-new Date(u.lastSeen).getTime())<1800000;
            const isMe = u.id===user.id;
            return(
              <div key={u.id} style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px',borderBottom:'0.5px solid '+C2.border}}>
                <div style={{position:'relative'}}>
                  <div style={{width:44,height:44,borderRadius:'50%',background:col+'22',border:'1.5px solid '+col,
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:col}}>{av}</div>
                  <div style={{position:'absolute',bottom:0,right:0,width:12,height:12,borderRadius:'50%',
                    background:isActive?'#22C55E':'#9CA3AF',border:'2px solid white'}}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:C2.text}}>{u.firstName} {u.lastName}</div>
                  <div style={{fontSize:10,color:C2.text3}}>{u.role} · {u.email}</div>
                </div>
                {!isMe && (
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={()=>callUser(u.id,'audio')} title="Appeler"
                      style={{width:30,height:30,borderRadius:'50%',border:'none',background:C2.primaryL,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C2.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {tab==='team' && display.length===0 && (
            <div style={{padding:30,textAlign:'center',color:C2.text3,fontSize:12}}>Aucun membre d'équipe</div>
          )}

          {tab==='active' && active.map(m=>{
            const tech=users.find(u=>u.id===m.tech_id);
            return(<div key={m.id} style={{padding:'12px 14px',borderBottom:'0.5px solid '+C2.border}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <div><div style={{fontSize:10,color:C2.text3}}>{m.client} · {m.site}</div>
                  <div style={{fontSize:13,fontWeight:700,color:C2.text}}>{m.type||'Mission'}</div></div>
                <div style={{background:C2.primaryL,color:C2.primary,padding:'3px 9px',borderRadius:10,fontSize:10,fontWeight:700}}>En cours</div>
              </div>
              <div style={{background:C2.bg2,borderRadius:4,height:5,marginBottom:6}}>
                <div style={{width:(m.progress||0)+'%',height:'100%',background:C2.primary,borderRadius:4}}/></div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                {tech&&<span style={{fontSize:11,color:C2.text}}>{tech.firstName} {tech.lastName}</span>}
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:10,color:C2.text3}}>📅 {m.deadline||'—'}</span>
                  {tech && <button onClick={()=>callUser(tech.id,'audio')} style={{width:26,height:26,borderRadius:'50%',border:'none',background:C2.primaryL,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C2.primary} strokeWidth="2" strokeLinecap="round"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </button>}
                </div>
              </div>
            </div>);
          })}
          {tab==='active' && active.length===0 && (
            <div style={{padding:30,textAlign:'center',color:C2.text3,fontSize:12}}>Aucune mission en cours</div>
          )}

          {tab==='assign' && pending.map(m=>(
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
          {tab==='assign' && pending.length===0 && (
            <div style={{padding:30,textAlign:'center',color:C2.text3,fontSize:12}}>Aucune mission à assigner</div>
          )}
        </>
      )}
    </div>
  );
};
const ScreenApprovals = ({user}) => {
  const C = getC();
  const [tab,setTab] = useState('pending');
  const [items,setItems] = useState([]);
  const [loadingApprovals, setLoadingApprovals] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [newReqForm, setNewReqForm] = useState({type:'payment_request',label:'',detail:'',montant:'',duid:'',beneficiaire:''});
  const [submitting, setSubmitting] = useState(false);
  const {toast,toastMsg,toastShow,toastType} = useToast();

  const BASE = 'https://backend-cleanit-erp.vercel.app';
  const isApprover = ['admin','project_manager','hr','dg','bureau'].includes(user?.role);
  const isPM = ['project_manager','pm'].includes(user?.role);

  const loadApprovals = () => {
    setLoadingApprovals(true);
    const token = localStorage.getItem('token');
    fetch(BASE+'/approvals', {headers:{'Authorization':'Bearer '+token}})
      .then(r=>r.json()).then(data => {
        if(Array.isArray(data)) {
          const formatted = data.map(a=>({
            id:a.id, userId:String(a.user_id), name:a.user_name||'Inconnu',
            av:(a.user_name||'U').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase(),
            color:'#0066CC', type:a.type, label:a.label||a.type, detail:a.detail||'',
            montant:a.amount||0, duid:a.duid||'', beneficiaire:a.beneficiary_name||'',
            level:a.n1_done&&a.n2_done?3:a.n1_done?2:1,
            n1done:a.n1_done, n2done:a.n2_done, status:a.status||'pending',
            createdAt:a.created_at
          }));
          setItems(formatted);
        }
      }).catch(()=>{}).finally(()=>setLoadingApprovals(false));
  };

  useEffect(()=>{ loadApprovals(); }, []);

  const doAction = async (id, action) => {
    setActionLoading(id+'_'+action);
    const token = localStorage.getItem('token');
    try {
      const r = await fetch(BASE+'/approvals/'+id, {
        method:'PUT',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
        body: JSON.stringify({action})
      });
      const data = await r.json();
      if(data.id || data.message) {
        toast(action==='approve'?'✓ Validé avec succès':'✗ Rejeté');
        loadApprovals();
      } else { toast('Erreur — '+JSON.stringify(data)); }
    } catch(e) { toast('Erreur réseau'); }
    setActionLoading(null);
  };

  const submitRequest = async () => {
    if(!newReqForm.label.trim()) { toast('Le titre est obligatoire'); return; }
    setSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const r = await fetch(BASE+'/approvals', {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
        body: JSON.stringify({
          type: newReqForm.type,
          label: newReqForm.label,
          detail: newReqForm.detail,
          amount: Number(newReqForm.montant)||0,
          duid: newReqForm.duid,
          siteCode: newReqForm.duid,         // aussi en siteCode comme le backend attend
          beneficiaryName: newReqForm.beneficiaire,  // camelCase comme le backend attend
          justification: newReqForm.detail,
        })
      });
      const data = await r.json();
      if(data.id || r.ok) {
        toast('✓ Demande soumise avec succès');
        setShowNewRequest(false);
        setNewReqForm({type:'payment_request',label:'',detail:'',montant:'',duid:'',beneficiaire:''});
        loadApprovals();
      } else { toast('Erreur: '+(data.error||'Vérifiez les champs')); }
    } catch(e) { toast('Erreur réseau'); }
    setSubmitting(false);
  };

  const pendingItems = items.filter(a=>a.status==='pending');
  const approvedItems = items.filter(a=>a.status==='approved');
  const rejectedItems = items.filter(a=>a.status==='rejected');

  const typeColors = {conge:'#F5F7FA',frais:C.primaryL,materiel:'#F5F7FA',paiement:'#FFF8E6',payment_request:'#FFF8E6',leave_request:'#F5F7FA',purchase_request:'#E8F3FF'};
  const typeTextColors = {conge:C.text2,frais:C.primary,materiel:C.text2,paiement:C.warning,payment_request:C.warning,leave_request:C.text2,purchase_request:C.primary};

  const ChainStep = ({label,done,active}) => (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,zIndex:2}}>
      <div style={{width:26,height:26,borderRadius:'50%',
        background:done?C.successL:active?C.warningL:C.bg2,
        border:'2px solid '+(done?C.success:active?C.warning:C.text4),
        display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700}}>
        {done?'✓':active?'·':''}
      </div>
      <span style={{fontSize:8,fontWeight:600,color:done?C.success:active?C.warning:C.text4}}>
        {label}{done?' ✓':''}
      </span>
    </div>
  );

  const ApprovalCard = ({item}) => {
    const n1Active = !item.n1done;
    const n2Active = item.n1done && !item.n2done;
    const dgActive = item.n1done && item.n2done;
    const width = item.n1done&&item.n2done?'85%':item.n1done?'55%':'20%';
    const actId = actionLoading?.startsWith(item.id);
    return (
      <div style={{padding:'12px 14px',borderBottom:'0.5px solid '+C.border}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:10}}>
          <AvatarCircle av={item.av} color={item.color} size={36}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>{item.name}</div>
            <div style={{fontSize:10,color:C.text3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.detail||item.label}</div>
            {item.montant>0&&<div style={{fontSize:10,fontWeight:700,color:'#E76500',marginTop:2}}>{new Intl.NumberFormat('fr-FR').format(item.montant)} FCFA</div>}
          </div>
          <div style={{background:typeColors[item.type]||C.bg2,color:typeTextColors[item.type]||C.text2,padding:'3px 8px',borderRadius:8,fontSize:9,fontWeight:700,flexShrink:0}}>{item.label}</div>
        </div>
        <div style={{position:'relative',marginBottom:10,padding:'0 4px'}}>
          <div style={{position:'absolute',top:13,left:18,right:18,height:2,background:C.border,zIndex:0}}/>
          <div style={{position:'absolute',top:13,left:18,width,height:2,background:C.success,zIndex:1,transition:'width .5s'}}/>
          <div style={{display:'flex',justifyContent:'space-between',position:'relative',zIndex:2}}>
            <ChainStep label="Soumis" done={true} active={false}/>
            <ChainStep label="N1" done={item.n1done} active={n1Active}/>
            <ChainStep label="N2" done={item.n2done} active={n2Active}/>
            <ChainStep label="Final" done={false} active={dgActive}/>
          </div>
        </div>
        {isApprover && (
          <div style={{display:'flex',gap:7}}>
            <button disabled={actId} onClick={()=>doAction(item.id,'reject')}
              style={{flex:1,padding:8,border:'0.5px solid '+C.dangerL,background:C.bg,borderRadius:8,fontSize:11,color:C.danger,fontWeight:700,cursor:'pointer',fontFamily:FONT,opacity:actId?0.5:1}}>
              {actionLoading===item.id+'_reject'?'...':'✕ Rejeter'}
            </button>
            <button disabled={actId} onClick={()=>doAction(item.id,'approve')}
              style={{flex:2,padding:8,border:'none',background:dgActive?C.primary:C.success,borderRadius:8,fontSize:11,color:'white',fontWeight:700,cursor:'pointer',fontFamily:FONT,display:'flex',alignItems:'center',justifyContent:'center',gap:4,opacity:actId?0.5:1}}>
              {actionLoading===item.id+'_approve'?'...':(dgActive?'Approuver final':'✓ Valider')}
            </button>
          </div>
        )}
        {!isApprover && (
          <div style={{fontSize:10,color:C.text3,textAlign:'center',padding:'6px 0',background:C.bg2,borderRadius:8}}>
            En attente de validation — Niveau {item.level}
          </div>
        )}
      </div>
    );
  };

  const HistoryCard = ({item, type}) => (
    <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:type==='approved'?C.successL:C.dangerL,borderRadius:10,border:'0.5px solid '+(type==='approved'?'#C0DD97':'#F7C1C1')}}>
      <AvatarCircle av={item.av} color={item.color} size={34}/>
      <div style={{flex:1}}>
        <div style={{fontSize:12,fontWeight:700,color:C.text}}>{item.name}</div>
        <div style={{fontSize:10,color:type==='approved'?'#3B6D11':C.danger}}>{item.label} · {item.createdAt?new Date(item.createdAt).toLocaleDateString('fr-FR'):''}</div>
        {item.montant>0&&<div style={{fontSize:10,color:C.text2}}>{new Intl.NumberFormat('fr-FR').format(item.montant)} FCFA</div>}
      </div>
      <span style={{fontSize:18}}>{type==='approved'?'✅':'❌'}</span>
    </div>
  );

  return (
    <div style={{flex:1,overflowY:'auto',background:C.bg,paddingBottom:80}}>
      <Toast msg={toastMsg} show={toastShow} type={toastType}/>
      <Header title={t('approvals')} right={
        (isPM||isApprover) ? (
          <button onClick={()=>setShowNewRequest(true)}
            style={{background:C.primary,color:'white',border:'none',borderRadius:8,padding:'5px 11px',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:FONT}}>
            + Demande
          </button>
        ) : (
          <div style={{background:C.dangerL,padding:'4px 10px',borderRadius:20,display:'flex',alignItems:'center',gap:4}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:C.pink}}/>
            <span style={{fontSize:10,color:C.danger,fontWeight:700}}>{pendingItems.length} en attente</span>
          </div>
        )
      }/>

      {/* Nouvelle demande modal */}
      {showNewRequest && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'flex-end'}}>
          <div style={{background:C.bg,borderRadius:'18px 18px 0 0',padding:20,width:'100%',maxHeight:'85vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div style={{fontSize:15,fontWeight:700,color:C.text}}>Nouvelle demande</div>
              <button onClick={()=>setShowNewRequest(false)} style={{border:'none',background:C.bg2,color:C.text2,borderRadius:8,width:30,height:30,cursor:'pointer',fontSize:16,fontFamily:FONT}}>×</button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div>
                <label style={{fontSize:11,color:C.text2,fontWeight:600,display:'block',marginBottom:4}}>Type de demande</label>
                <select value={newReqForm.type} onChange={e=>setNewReqForm(p=>({...p,type:e.target.value}))}
                  style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1px solid '+C.border,fontSize:13,background:C.bg,color:C.text,fontFamily:FONT}}>
                  <option value="payment_request">Demande de paiement</option>
                  <option value="leave_request">Demande de congé</option>
                  <option value="purchase_request">Demande d'achat</option>
                  <option value="advance_request">Avance sur salaire</option>
                  <option value="expense_report">Note de frais</option>
                </select>
              </div>
              <div>
                <label style={{fontSize:11,color:C.text2,fontWeight:600,display:'block',marginBottom:4}}>Titre / Objet *</label>
                <input value={newReqForm.label} onChange={e=>setNewReqForm(p=>({...p,label:e.target.value}))}
                  placeholder="Ex: Paiement matériaux site DLA-001"
                  style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1px solid '+C.border,fontSize:13,background:C.bg,color:C.text,fontFamily:FONT,boxSizing:'border-box'}}/>
              </div>
              <div>
                <label style={{fontSize:11,color:C.text2,fontWeight:600,display:'block',marginBottom:4}}>Détails / Justification</label>
                <textarea value={newReqForm.detail} onChange={e=>setNewReqForm(p=>({...p,detail:e.target.value}))}
                  placeholder="Description de la demande..."
                  rows={3}
                  style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1px solid '+C.border,fontSize:13,background:C.bg,color:C.text,fontFamily:FONT,boxSizing:'border-box',resize:'none'}}/>
              </div>
              {['payment_request','purchase_request','advance_request','expense_report'].includes(newReqForm.type) && (
                <div>
                  <label style={{fontSize:11,color:C.text2,fontWeight:600,display:'block',marginBottom:4}}>Montant (FCFA)</label>
                  <input type="number" value={newReqForm.montant} onChange={e=>setNewReqForm(p=>({...p,montant:e.target.value}))}
                    placeholder="Ex: 150000"
                    style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1px solid '+C.border,fontSize:13,background:C.bg,color:C.text,fontFamily:FONT,boxSizing:'border-box'}}/>
                </div>
              )}
              <div>
                <label style={{fontSize:11,color:C.text2,fontWeight:600,display:'block',marginBottom:4}}>DUID (identifiant site)</label>
                <input value={newReqForm.duid} onChange={e=>setNewReqForm(p=>({...p,duid:e.target.value}))}
                  placeholder="Ex: DLA-001-A"
                  style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1px solid '+C.border,fontSize:13,background:C.bg,color:C.text,fontFamily:FONT,boxSizing:'border-box'}}/>
              </div>
              {['payment_request','purchase_request'].includes(newReqForm.type) && (
                <div>
                  <label style={{fontSize:11,color:C.text2,fontWeight:600,display:'block',marginBottom:4}}>Bénéficiaire / Fournisseur</label>
                  <input value={newReqForm.beneficiaire} onChange={e=>setNewReqForm(p=>({...p,beneficiaire:e.target.value}))}
                    placeholder="Ex: MTN Cameroun"
                    style={{width:'100%',padding:'10px 12px',borderRadius:10,border:'1px solid '+C.border,fontSize:13,background:C.bg,color:C.text,fontFamily:FONT,boxSizing:'border-box'}}/>
                </div>
              )}
              <button disabled={submitting} onClick={submitRequest}
                style={{padding:'13px',background:C.primary,color:'white',border:'none',borderRadius:12,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:FONT,marginTop:4,opacity:submitting?0.6:1}}>
                {submitting?'Envoi en cours...':'Soumettre la demande'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:'flex',borderBottom:'1px solid '+C.border}}>
        {[['pending',t('waiting')],['approved',t('approved')],['refused',t('refused')]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{flex:1,padding:'9px 4px',border:'none',background:C.bg,fontSize:10,fontWeight:tab===id?700:500,cursor:'pointer',fontFamily:FONT,color:tab===id?C.primary:C.text3,borderBottom:tab===id?'2px solid '+C.primary:'2px solid transparent'}}>
            {lbl} {id==='pending'&&pendingItems.length>0?`(${pendingItems.length})`:''}
          </button>
        ))}
      </div>

      {loadingApprovals && (
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:40}}>
          <div style={{width:32,height:32,border:'3px solid '+C.primaryL,borderTopColor:C.primary,borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
        </div>
      )}

      {!loadingApprovals && tab==='pending' && (
        pendingItems.length===0
          ? <div style={{padding:40,textAlign:'center',color:C.text3}}>
              <div style={{fontSize:32,marginBottom:8}}>✓</div>
              <div style={{fontSize:13,fontWeight:600}}>Aucune demande en attente</div>
            </div>
          : pendingItems.map(item=><ApprovalCard key={item.id} item={item}/>)
      )}

      {!loadingApprovals && tab==='approved' && (
        approvedItems.length===0
          ? <div style={{padding:40,textAlign:'center',color:C.text3,fontSize:13}}>Aucune demande approuvée</div>
          : <div style={{padding:14,display:'flex',flexDirection:'column',gap:8}}>
              {approvedItems.map(item=><HistoryCard key={item.id} item={item} type="approved"/>)}
            </div>
      )}

      {!loadingApprovals && tab==='refused' && (
        rejectedItems.length===0
          ? <div style={{padding:40,textAlign:'center',color:C.text3,fontSize:13}}>Aucune demande rejetée</div>
          : <div style={{padding:14,display:'flex',flexDirection:'column',gap:8}}>
              {rejectedItems.map(item=><HistoryCard key={item.id} item={item} type="refused"/>)}
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
      const tk=localStorage.getItem('token');
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
  const [realStats,setRealStats] = useState({missionsCount:0,presenceRate:null});
  const {toast,toastMsg,toastShow,toastType} = useToast();
  const userObj = USERS.find(u=>u.id===user.id)||user;

  useEffect(()=>{
    const tk = localStorage.getItem('token');
    const h = {'Authorization':'Bearer '+tk};
    const b = 'https://backend-cleanit-erp.vercel.app';
    Promise.all([
      fetch(b+'/missions/my',{headers:h}).then(r=>r.json()).catch(()=>[]),
      fetch(b+'/pointages',{headers:h}).then(r=>r.json()).catch(()=>[]),
    ]).then(([ms,pts])=>{
      const missionsCount = Array.isArray(ms) ? ms.length : 0;
      // Taux de présence réel = jours avec au moins 1 pointage valide sur les 30 derniers jours
      let presenceRate = null;
      if(Array.isArray(pts) && pts.length>0){
        const last30 = new Date(); last30.setDate(last30.getDate()-30);
        const recentValid = pts.filter(p=>p.valide!==false && new Date(p.created_at)>=last30);
        const daysWithPointage = new Set(recentValid.map(p=>(p.created_at||'').slice(0,10))).size;
        presenceRate = Math.round((daysWithPointage/30)*100);
      }
      setRealStats({missionsCount, presenceRate});
    });
  },[]);

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
            {label:'Missions',val:realStats.missionsCount},
            {label:'Certs',val:userObj.certs?.length||0},
            {label:'Presence',val:realStats.presenceRate!==null?realStats.presenceRate+'%':'—'},
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
                if(!('Notification' in window)){ alert('Notifications non supportées sur ce navigateur'); return; }
                try {
                  const perm = await Notification.requestPermission();
                  if(perm!=='granted'){ alert('Permission refusée — activez les notifications dans les paramètres Chrome'); return; }
                  if(!('serviceWorker' in navigator)){ alert('Service Worker non disponible'); return; }
                  const reg = await navigator.serviceWorker.ready;
                  // Clé VAPID en Uint8Array
                  const vapidKey = 'BNSQIjGGELW6UAg0K1bkGLRgkWf0xSn9pocHSAwrtMauehwBVm-v1fM3TE_QRoQVlBmq15FGbqMP3ZNmH7ZSjZc';
                  const padding = '='.repeat((4-vapidKey.length%4)%4);
                  const base64 = (vapidKey+padding).replace(/-/g,'+').replace(/_/g,'/');
                  const rawData = window.atob(base64);
                  const key = new Uint8Array(rawData.length);
                  for(let i=0;i<rawData.length;++i) key[i]=rawData.charCodeAt(i);
                  // S'abonner aux push
                  const sub = await reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:key});
                  const token = localStorage.getItem('token');
                  if(!token){ alert('Non connecté — reconnectez-vous'); return; }
                  // Envoyer au backend
                  const r = await fetch('https://backend-cleanit-erp.vercel.app/push/subscribe',{
                    method:'POST',
                    headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
                    body:JSON.stringify({subscription: sub.toJSON()})
                  });
                  const data = await r.json();
                  if(r.ok && data.ok){
                    setNotifs(true);
                    // Toast de confirmation
                    new Notification('CleanIT ERP', {body:'Notifications activées ✓', icon:'/icon-192.png'});
                  } else {
                    alert('Erreur serveur: '+(data.message||data.detail||JSON.stringify(data)));
                  }
                } catch(e){ alert('Erreur: '+e.message); }
              } else {
                setNotifs(false);
                // Désabonner
                if('serviceWorker' in navigator){
                  const reg = await navigator.serviceWorker.ready;
                  const sub = await reg.pushManager.getSubscription();
                  if(sub) await sub.unsubscribe().catch(()=>{});
                }
              }
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
                  const token = localStorage.getItem('token');
                  const pushUser = JSON.parse(localStorage.getItem('user')||localStorage.getItem('cit_mobile_user')||'{}');
                  await fetch('https://backend-cleanit-erp.vercel.app/push/subscribe', {
                    method: 'POST',
                    headers: {'Content-Type':'application/json','Authorization':'Bearer '+token},
                    body: JSON.stringify({ subscription: sub, userId: pushUser.id||null })
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

  // Magic link handler
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token') || params.get('t');
    const urlUid = params.get('uid') || params.get('u');
    if(urlToken && urlUid) {
      localStorage.setItem('token', urlToken);
      const u = {
        id: parseInt(urlUid), role:'project_manager',
        firstName:'Nodem', lastName:'Espérance',
        email:'projects.cmr@cleanit-sevrices.com',
        av:'NE', color:'#1B4F8A', name:'Nodem Espérance'
      };
      localStorage.setItem('user', JSON.stringify(u));
      localStorage.setItem('cit_mobile_user', JSON.stringify(u));
      window.history.replaceState({}, '', '/mobile');
      login(u);
    }
  }, []);

  useEffect(()=>{
    const id = setInterval(()=>setNow(new Date()),1000);
    // Ping toutes les 2 minutes pour maintenir last_seen actif
    const pingId = setInterval(()=>{
      const tk = localStorage.getItem('token');
      if(tk) fetch('https://backend-cleanit-erp.vercel.app/ping',{method:'POST',headers:{'Authorization':'Bearer '+tk}}).catch(()=>{});
    }, 120000);
    // Ping immédiat au chargement
    const tk0 = localStorage.getItem('token');
    if(tk0) fetch('https://backend-cleanit-erp.vercel.app/ping',{method:'POST',headers:{'Authorization':'Bearer '+tk0}}).catch(()=>{});
    return()=>clearInterval(id);
  },[]);

  useEffect(()=>{
    if(!navigator.geolocation||!user) return;
    let lastSent = 0;
    const sendLocation = (lat, lng, accuracy) => {
      const now2 = Date.now();
      if(now2 - lastSent < 30000) return; // throttle: max 1 envoi / 30s
      lastSent = now2;
      const tk = localStorage.getItem('token');
      if(!tk) return;
      // Batterie si dispo (API navigator.getBattery, support partiel)
      const sendWithBattery = (batteryLevel) => {
        fetch('https://backend-cleanit-erp.vercel.app/location/update', {
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk},
          body: JSON.stringify({ lat, lng, accuracy, battery: batteryLevel })
        }).catch(()=>{});
      };
      if(navigator.getBattery) {
        navigator.getBattery().then(b=>sendWithBattery(Math.round(b.level*100))).catch(()=>sendWithBattery(null));
      } else {
        sendWithBattery(null);
      }
    };
    const wid = navigator.geolocation.watchPosition(
      p=>{
        const coords = {lat:p.coords.latitude,lng:p.coords.longitude,accuracy:p.coords.accuracy,altitude:p.coords.altitude};
        setGps(coords);
        sendLocation(coords.lat, coords.lng, coords.accuracy);
      },
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
  const logout = () => {setUser(null);localStorage.removeItem('cit_mobile_user');localStorage.removeItem('token');localStorage.removeItem('cit_last_activity');};

  // Déconnexion automatique après 1h d'inactivité
  useInactivityLogout(60 * 60 * 1000, logout, !!user);

  // Hooks déclarés avant tout return conditionnel
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);

  useEffect(()=>{
    if(!user) return;
    const fetchUnread = () => {
      const tk = localStorage.getItem('token');
      if(!tk) return;
      fetch('https://backend-cleanit-erp.vercel.app/conversations/list',{headers:{'Authorization':'Bearer '+tk}})
        .then(r=>r.json())
        .then(data=>{ if(Array.isArray(data)) setUnreadCount(data.reduce((s,c)=>s+(parseInt(c.unread_count)||0),0)); })
        .catch(()=>{});
    };
    fetchUnread();
    const iv = setInterval(fetchUnread, 5000);
    return()=>clearInterval(iv);
  },[user]);

  // Polling appel entrant — global, fonctionne peu importe l'écran ouvert
  useEffect(()=>{
    if(!user) return;
    const checkIncoming = () => {
      const tk = localStorage.getItem('token');
      if(!tk) return;
      if(incomingCall && !activeCall){
        // Une popup est déjà affichée : vérifier que l'appel est toujours "ringing" côté serveur
        fetch(`https://backend-cleanit-erp.vercel.app/calls/incoming`,{headers:{'Authorization':'Bearer '+tk}})
          .then(r=>r.json())
          .then(call=>{
            if(!call || call.id!==incomingCall.id) setIncomingCall(null); // appel annulé/expiré/répondu ailleurs
          }).catch(()=>{});
        return;
      }
      if(activeCall) return;
      fetch('https://backend-cleanit-erp.vercel.app/calls/incoming',{headers:{'Authorization':'Bearer '+tk}})
        .then(r=>r.json())
        .then(call=>{ if(call) setIncomingCall(call); })
        .catch(()=>{});
    };
    checkIncoming();
    const iv = setInterval(checkIncoming, 3000);
    return()=>clearInterval(iv);
  },[user, incomingCall, activeCall]);

  if(!user) return <ScreenLogin onLogin={login}/>;

  const parts = loc.split('/').filter(Boolean);
  const activePage = parts[1]||'fil';
  const common = {user,gps,navigate,now};

  const getPage = () => {
    if(loc.includes('/camera'))   return <ScreenCamera {...common}/>;
    if(loc.includes('/messages')) return <ScreenMessages/>;
    if(loc.includes('/pointer'))  return <ScreenPointer {...common}/>;
    if(loc.includes('/mission'))  return <ScreenMission {...common}/>;
    if(loc.includes('/equipe'))  return <ScreenEquipe user={user} navigate={navigate}/>;
    if(loc.includes('/approvals'))return <ScreenApprovals user={user}/>;
    if(loc.includes('/analytics'))return <ScreenAnalytics/>;
    if(loc.includes('/profil'))   return <ScreenProfil {...common} onLogout={logout}/>;
    return <ScreenFil {...common}/>;
  };

  const isCamera = loc.includes('/camera');
  const tabs = TABS[user.role] || TABS.bureau;

  const handleSwipeStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleSwipeEnd = (e) => {
    if(isCamera) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if(Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return;
    const currentIdx = tabs.findIndex(t=>t.id===activePage||(activePage===''&&t.id==='fil'));
    if(dx < 0 && currentIdx < tabs.length-1) navigate(tabs[currentIdx+1].url);
    if(dx > 0 && currentIdx > 0) navigate(tabs[currentIdx-1].url);
  };

  return (
    <ErrorBoundary><div
      style={{minHeight:'100vh',background:C.bg,fontFamily:FONT,
        maxWidth:430,margin:'0 auto',display:'flex',flexDirection:'column',
        position:'relative'}}
      onTouchStart={handleSwipeStart}
      onTouchEnd={handleSwipeEnd}>
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
      {!isCamera && <BottomNav user={user} navigate={navigate} active={activePage} unreadCount={unreadCount}/>}

      {incomingCall && !activeCall && (
        <div style={{position:'fixed',top:16,left:16,right:16,zIndex:950,maxWidth:398,margin:'0 auto',
          background:'#111827',color:'#fff',borderRadius:14,padding:'16px 18px',
          boxShadow:'0 12px 40px rgba(0,0,0,.4)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
            <div style={{width:40,height:40,borderRadius:'50%',background:'#0A2D6E',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:700,flexShrink:0}}>
              {(incomingCall.caller_name||'?')[0]}
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700}}>{incomingCall.caller_name}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.6)'}}>
                {incomingCall.type==='audio'?'Appel audio entrant':'Appel vidéo entrant'}
              </div>
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={async ()=>{
                const tk = localStorage.getItem('token');
                await fetch(`https://backend-cleanit-erp.vercel.app/calls/${incomingCall.id}/respond`,{method:'POST',
                  headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk},
                  body:JSON.stringify({accepted:false})}).catch(()=>{});
                setIncomingCall(null);
              }}
              style={{flex:1,padding:'10px',borderRadius:9,border:'none',background:'#DC2626',
                color:'#fff',fontWeight:700,fontSize:12,cursor:'pointer'}}>
              Refuser
            </button>
            <button onClick={async ()=>{
                const tk = localStorage.getItem('token');
                await fetch(`https://backend-cleanit-erp.vercel.app/calls/${incomingCall.id}/respond`,{method:'POST',
                  headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk},
                  body:JSON.stringify({accepted:true})}).catch(()=>{});
                setActiveCall({type:incomingCall.type, room:incomingCall.room, withName:incomingCall.caller_name, callId:incomingCall.id});
                setIncomingCall(null);
              }}
              style={{flex:1,padding:'10px',borderRadius:9,border:'none',background:'#16A34A',
                color:'#fff',fontWeight:700,fontSize:12,cursor:'pointer'}}>
              Répondre
            </button>
          </div>
        </div>
      )}

      {activeCall && (
        <div style={{position:'fixed',inset:0,background:'#0b1120',zIndex:960,
          display:'flex',flexDirection:'column',maxWidth:430,margin:'0 auto'}}>
          <div style={{padding:'10px 16px',background:'#111827',display:'flex',
            alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:'#fff'}}>
                {activeCall.type==='video'?'Appel vidéo':'Appel audio'} · {activeCall.withName||''}
              </div>
              <div style={{fontSize:10,color:'rgba(255,255,255,.5)'}}>En cours</div>
            </div>
            <button onClick={async ()=>{
                const tk = localStorage.getItem('token');
                if(activeCall.callId) await fetch(`https://backend-cleanit-erp.vercel.app/calls/${activeCall.callId}/end`,{method:'POST',headers:{'Authorization':'Bearer '+tk}}).catch(()=>{});
                setActiveCall(null);
              }}
              style={{padding:'6px 14px',borderRadius:8,border:'none',background:'#DC2626',
                color:'#fff',fontWeight:700,fontSize:11,cursor:'pointer'}}>
              Quitter
            </button>
          </div>
          <DailyFrame room={activeCall.room} displayName={user?.firstName} audioOnly={activeCall.type==='audio'}/>
        </div>
      )}
    </div></ErrorBoundary>
  );
}
