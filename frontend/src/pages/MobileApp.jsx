import { useState, useEffect, useRef } from 'react';
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

const FEED_POSTS = [
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

const CONVOS = [
  {id:1,type:'project',code:'DLA-001',client:'MTN Bassa',color:'#E6F1FB',textColor:'#0C447C',
   last:'Thomas: Cablage secteur Nord termine',time:'09:15',unread:3},
  {id:2,type:'project',code:'KRI-001',client:'CAMTEL',color:'#EAF3DE',textColor:'#27500A',
   last:'Pierre: Tests finaux demain matin',time:'Hier',unread:0},
  {id:3,type:'whatsapp',name:'MTN — Ing. Mbarga',av:'MTN',color:'#FFCC00',
   last:'Le test est prevu demain 8h ?',time:'10:30',unread:1},
  {id:4,type:'whatsapp',name:'Orange — Mme Ekani',av:'ORA',color:'#F97316',
   last:'Rapport de la semaine recu merci',time:'Hier',unread:0},
  {id:5,type:'dm',userId:'EI-002',name:'Jean Fouda',av:'JF',color:'#7C3AED',
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

const Toast = ({msg,show}) => (
  <div style={{position:'fixed',top:16,left:'50%',zIndex:9999,pointerEvents:'none',
    transform:`translateX(-50%) translateY(${show?0:-60}px)`,transition:'transform .25s',
    background:'#1E293B',color:'#fff',padding:'10px 20px',borderRadius:10,
    fontSize:13,fontWeight:500,boxShadow:'0 4px 16px rgba(0,0,0,.3)',whiteSpace:'nowrap'}}>
    {msg}
  </div>
);

const useToast = () => {
  const [msg,setMsg] = useState('');
  const [show,setShow] = useState(false);
  const toast = (m) => { setMsg(m);setShow(true);setTimeout(()=>setShow(false),2200); };
  return {toast,toastMsg:msg,toastShow:show};
};

// ─── NAVIGATION CONFIG ────────────────────────────────────────
const TABS = {
  terrain: [
    {id:'fil',icon:'🏠',url:'/mobile'},
    {id:'camera',icon:'📷',url:'/mobile/camera'},
    {id:'mission',icon:'📋',url:'/mobile/mission'},
    {id:'messages',icon:'💬',url:'/mobile/messages'},
    {id:'profil',icon:'👤',url:'/mobile/profil'},
  ],
  bureau: [
    {id:'fil',icon:'🏠',url:'/mobile'},
    {id:'camera',icon:'📷',url:'/mobile/camera'},
    {id:'messages',icon:'💬',url:'/mobile/messages'},
    {id:'pointer',icon:'📲',url:'/mobile/pointer'},
    {id:'equipes',icon:'👥',url:'/mobile/equipes'},
    {id:'approvals',icon:'✅',url:'/mobile/approvals'},
    {id:'dispatch',icon:'📡',url:'/mobile/dispatch'},
    {id:'profil',icon:'👤',url:'/mobile/profil'},
  ],
  pm: [
    {id:'fil',icon:'🏠',url:'/mobile'},
    {id:'camera',icon:'📷',url:'/mobile/camera'},
    {id:'messages',icon:'💬',url:'/mobile/messages'},
    {id:'pointer',icon:'📲',url:'/mobile/pointer'},
    {id:'equipes',icon:'👥',url:'/mobile/equipes'},
    {id:'approvals',icon:'✅',url:'/mobile/approvals'},
    {id:'dispatch',icon:'📡',url:'/mobile/dispatch'},
    {id:'profil',icon:'👤',url:'/mobile/profil'},
  ],
  rh: [
    {id:'fil',icon:'🏠',url:'/mobile'},
    {id:'messages',icon:'💬',url:'/mobile/messages'},
    {id:'pointer',icon:'📲',url:'/mobile/pointer'},
    {id:'approvals',icon:'✅',url:'/mobile/approvals'},
    {id:'profil',icon:'👤',url:'/mobile/profil'},
  ],
  dg: [
    {id:'fil',icon:'🏠',url:'/mobile'},
    {id:'messages',icon:'💬',url:'/mobile/messages'},
    {id:'approvals',icon:'✅',url:'/mobile/approvals'},
    {id:'analytics',icon:'📊',url:'/mobile/analytics'},
    {id:'equipes',icon:'👥',url:'/mobile/equipes'},
    {id:'profil',icon:'👤',url:'/mobile/profil'},
  ],
  admin: [
    {id:'fil',icon:'🏠',url:'/mobile'},
    {id:'messages',icon:'💬',url:'/mobile/messages'},
    {id:'pointer',icon:'📲',url:'/mobile/pointer'},
    {id:'equipes',icon:'👥',url:'/mobile/equipes'},
    {id:'approvals',icon:'✅',url:'/mobile/approvals'},
    {id:'dispatch',icon:'📡',url:'/mobile/dispatch'},
    {id:'analytics',icon:'📊',url:'/mobile/analytics'},
    {id:'profil',icon:'👤',url:'/mobile/profil'},
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
            <span style={{fontSize:18,filter:isActive?'none':'grayscale(1)',
              opacity:isActive?1:.5}}>{tab.icon}</span>
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
  const [sel, setSel] = useState(null);

  if(!sel) return (
    <div style={{minHeight:'100vh',background:'#FFFFFF',fontFamily:'system-ui,sans-serif',
      maxWidth:430,margin:'0 auto',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'32px 20px 12px',textAlign:'center'}}>
        <div style={{width:68,height:68,background:'#fff',borderRadius:18,
          margin:'0 auto 14px',display:'flex',alignItems:'center',
          justifyContent:'center',border:'0.5px solid #EFEFEF',
          boxShadow:'0 2px 12px rgba(0,0,0,.07)'}}>
          <svg width="44" height="40" viewBox="0 0 122 111" fill="none">
            <circle cx="61" cy="55" r="38" stroke="#888" strokeWidth="8" fill="none"/>
            <circle cx="61" cy="17" r="12" fill="#E86C6C"/>
            <circle cx="61" cy="93" r="12" fill="#E86C6C"/>
            <circle cx="23" cy="55" r="12" fill="#E86C6C"/>
            <circle cx="99" cy="55" r="12" fill="#E86C6C"/>
          </svg>
        </div>
        <div style={{fontSize:22,fontWeight:700,marginBottom:3}}>
          <span style={{color:'#888'}}>Clean</span>
          <span style={{color:'#E86C6C'}}>IT</span>
          <span style={{color:'#262626',fontWeight:400,fontSize:16}}> ERP</span>
        </div>
        <div style={{fontSize:11,color:'#8E8E8E',textTransform:'uppercase',letterSpacing:.8}}>
          Choisissez votre profil
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'8px 16px 24px'}}>
        {[['Bureau et Management',USERS.filter(u=>u.role!=='terrain')],
          ['Equipe Terrain',USERS.filter(u=>u.role==='terrain')]].map(([label,users])=>(
          <div key={label}>
            <div style={{fontSize:10,fontWeight:700,color:'#8E8E8E',
              textTransform:'uppercase',letterSpacing:.6,margin:'12px 0 6px'}}>{label}</div>
            {users.map(u=>(
              <button key={u.id} onClick={()=>{setSel(u);}}
                style={{width:'100%',display:'flex',alignItems:'center',
                  gap:12,padding:'12px 14px',background:'#fff',
                  border:'0.5px solid #EFEFEF',borderRadius:12,
                  marginBottom:7,cursor:'pointer',fontFamily:'inherit',textAlign:'left'}}>
                <div style={{width:44,height:44,borderRadius:11,
                  background:u.color+'22',border:'1.5px solid '+u.color,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:14,fontWeight:700,color:u.color,flexShrink:0}}>
                  {u.av}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:'#262626'}}>{u.name}</div>
                  <div style={{fontSize:11,color:'#8E8E8E',marginTop:2}}>{u.post} · {u.region}</div>
                </div>
                <span style={{color:'#CBD5E1',fontSize:18}}>›</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'#fff',fontFamily:'system-ui,sans-serif',
      maxWidth:430,margin:'0 auto',display:'flex',flexDirection:'column',
      padding:'40px 24px'}}>
      <button onClick={()=>setSel(null)}
        style={{background:'none',border:'none',cursor:'pointer',color:'#475569',
          fontSize:13,fontFamily:'inherit',marginBottom:20,
          display:'flex',alignItems:'center',gap:4,padding:0}}>
        ← Retour
      </button>
      <div style={{textAlign:'center',marginBottom:24}}>
        <div style={{width:60,height:60,borderRadius:15,margin:'0 auto 10px',
          background:sel.color+'22',border:'1.5px solid '+sel.color,
          display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:20,fontWeight:700,color:sel.color}}>{sel.av}</div>
        <div style={{fontSize:17,fontWeight:700,color:'#262626'}}>{sel.name}</div>
        <div style={{fontSize:12,color:'#8E8E8E',marginTop:3}}>{sel.post}</div>
      </div>
      <button onClick={()=>onLogin(sel)}
        style={{width:'100%',padding:14,border:'none',background:'#0066CC',
          color:'white',borderRadius:12,fontSize:15,fontWeight:700,
          cursor:'pointer',fontFamily:'inherit',marginBottom:12}}>
        Se connecter
      </button>
      <button style={{width:'100%',padding:11,border:'0.5px solid #EFEFEF',
        background:'#fff',color:'#262626',borderRadius:12,fontSize:13,
        fontWeight:500,cursor:'pointer',fontFamily:'inherit',
        display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continuer avec Google (bientot)
      </button>
    </div>
  );
};

// ─── SCREEN: FIL ──────────────────────────────────────────────
const ScreenFil = ({user,navigate}) => {
  const [openEmoji,setOpenEmoji] = useState(null);
  const [reactions,setReactions] = useState({});
  const terrainUsers = USERS.filter(u=>u.role==='terrain');
  const EMOJIS = ['👍','🔥','👏','😮','😂','🙏'];

  const addReaction = (postId,emoji) => {
    setReactions(r=>({...r,[postId]:emoji}));
    setOpenEmoji(null);
  };

  return (
    <div style={{flex:1,overflowY:'auto',background:C.bg,paddingBottom:80}}>
      <Header showLogo right={
        <div style={{display:'flex',gap:14,alignItems:'center'}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={getC().text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{cursor:'pointer'}}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span style={{fontSize:20,cursor:'pointer',position:'relative'}}>
            🔔
            <div style={{position:'absolute',top:-2,right:-2,width:8,height:8,
              background:C.pink,borderRadius:'50%',border:'1.5px solid white'}}/>
          </span>
        </div>
      }/>

      {/* Stories */}
      <div style={{padding:'10px 14px 6px',borderBottom:'1px solid '+C.border}}>
        <div style={{fontSize:10,fontWeight:600,color:C.text3,
          textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>
          {t('sites_actifs')}
        </div>
        <div style={{display:'flex',gap:12,overflowX:'auto',paddingBottom:2}}>
          {terrainUsers.map(u => {
            const m = MISSIONS.find(ms=>ms.techId===u.id);
            return (
              <div key={u.id} style={{display:'flex',flexDirection:'column',
                alignItems:'center',gap:3,flexShrink:0}}>
                <div style={{width:52,height:52,borderRadius:'50%',padding:2,
                  background:`linear-gradient(135deg,${C.gray},${C.pink})`}}>
                  <div style={{width:'100%',height:'100%',borderRadius:'50%',
                    background:C.bg,padding:2}}>
                    <div style={{width:'100%',height:'100%',borderRadius:'50%',
                      background:u.color+'22',display:'flex',alignItems:'center',
                      justifyContent:'center',fontSize:13,fontWeight:700,color:u.color}}>
                      {u.av}
                    </div>
                  </div>
                </div>
                <span style={{fontSize:9,color:C.text,maxWidth:52,
                  overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',
                  textAlign:'center'}}>
                  {m ? m.site : u.av}
                </span>
              </div>
            );
          })}
          <div style={{display:'flex',flexDirection:'column',
            alignItems:'center',gap:3,flexShrink:0}}>
            <div style={{width:52,height:52,borderRadius:'50%',
              border:'1.5px dashed '+C.border,display:'flex',
              alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
              <span style={{fontSize:22,color:C.text4}}>＋</span>
            </div>
            <span style={{fontSize:9,color:C.text3}}>{t('publish')}</span>
          </div>
        </div>
      </div>

      {/* Feed */}
      {FEED_POSTS.map(post => (
        <div key={post.id} style={{borderBottom:'1px solid '+C.border}}>
          {/* Post header */}
          <div style={{padding:'8px 12px',display:'flex',
            alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              {post.userId==='chacha' ? (
                <div style={{width:30,height:30,borderRadius:'50%',
                  background:C.primaryL,border:'1.5px solid '+C.primary,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:10,fontWeight:700,color:C.primary}}>CC</div>
              ) : post.userId==='company' ? (
                <div style={{width:30,height:30,borderRadius:8,
                  background:C.bg2,border:'1px solid '+C.border,
                  display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width="16" height="15" viewBox="0 0 122 111" fill="none">
                    <circle cx="61" cy="55" r="28" stroke="#888" strokeWidth="7" fill="none"/>
                    <circle cx="61" cy="27" r="8" fill="#E86C6C"/>
                    <circle cx="61" cy="83" r="8" fill="#E86C6C"/>
                    <circle cx="33" cy="55" r="8" fill="#E86C6C"/>
                    <circle cx="89" cy="55" r="8" fill="#E86C6C"/>
                  </svg>
                </div>
              ) : (
                <div style={{width:30,height:30,borderRadius:'50%',padding:1.5,
                  background:`linear-gradient(135deg,${C.gray},${C.pink})`}}>
                  <div style={{width:'100%',height:'100%',borderRadius:'50%',
                    background:C.bg,padding:1.5}}>
                    <div style={{width:'100%',height:'100%',borderRadius:'50%',
                      background:C.primaryL,display:'flex',alignItems:'center',
                      justifyContent:'center',fontSize:10,fontWeight:700,color:C.primary}}>
                      {post.userId.slice(-3,-1).toUpperCase()}
                    </div>
                  </div>
                </div>
              )}
              <div>
                <div style={{fontSize:12,fontWeight:700,
                  color:post.userId==='chacha'?C.primary:C.text}}>
                  {post.userName}
                </div>
                {post.site && (
                  <div style={{fontSize:9,color:C.text3,
                    display:'flex',alignItems:'center',gap:2}}>
                    📍 {post.site} · {post.siteName} · {post.time}
                  </div>
                )}
                {!post.site && (
                  <div style={{fontSize:9,color:C.text3}}>{post.time}</div>
                )}
              </div>
            </div>
            {post.userId==='chacha' && (
              <div style={{background:C.primaryL,padding:'2px 8px',
                borderRadius:10,fontSize:9,color:C.primary,fontWeight:600}}>IA</div>
            )}
            {post.userId!=='chacha' && (
              <span style={{fontSize:18,cursor:'pointer',color:C.text3}}>⋯</span>
            )}
          </div>

          {/* Post body */}
          {post.type==='photo' && (
            <div style={{background:'#1E293B',height:170,
              display:'flex',alignItems:'center',justifyContent:'center',
              position:'relative'}}>
              <div style={{textAlign:'center',color:'rgba(255,255,255,.3)'}}>
                <div style={{fontSize:32,marginBottom:4}}>📷</div>
                <div style={{fontSize:10}}>Photo CleanCam</div>
              </div>
              <div style={{position:'absolute',bottom:8,right:10,
                background:'rgba(0,0,0,.5)',padding:'2px 7px',
                borderRadius:10,fontSize:8,color:'white'}}>
                📍 {post.site}
              </div>
            </div>
          )}
          {post.type==='alert' && (
            <div style={{margin:'0 12px',background:C.warningL,
              borderRadius:8,padding:'10px 12px',borderLeft:'3px solid '+C.warning}}>
              <div style={{fontSize:11,fontWeight:700,color:'#92400E',
                marginBottom:3,display:'flex',alignItems:'center',gap:4}}>
                🌧 {post.title}
              </div>
              <div style={{fontSize:11,color:'#78350F',lineHeight:1.5}}>{post.text}</div>
            </div>
          )}

          {/* Caption */}
          <div style={{padding:'8px 12px'}}>
            {post.type!=='alert' && (
              <div style={{fontSize:11,color:C.text,lineHeight:1.4,marginBottom:6}}>
                <span style={{fontWeight:700}}>{post.userName}</span>
                {' '}{post.text}
              </div>
            )}

            {/* Reactions summary */}
            {post.reactions && (
              <div style={{display:'flex',alignItems:'center',gap:4,marginBottom:6}}>
                <span style={{fontSize:12}}>
                  {reactions[post.id]||''}
                  {post.reactions.fire>0?'🔥':''}
                  {post.reactions.clap>0?'👏':''}
                </span>
                <span style={{fontSize:11,fontWeight:600,color:C.text}}>
                  {(post.reactions.like||0)+(post.reactions.fire||0)+(post.reactions.clap||0)+
                   (reactions[post.id]?1:0)} reactions
                </span>
              </div>
            )}

            {/* Actions */}
            <div style={{display:'flex',justifyContent:'space-between',
              alignItems:'center',paddingTop:6,borderTop:'1px solid '+C.border,
              position:'relative'}}>
              <div style={{display:'flex',gap:14,alignItems:'center'}}>
                {/* Emoji button */}
                <div style={{position:'relative'}}>
                  <button onClick={()=>setOpenEmoji(openEmoji===post.id?null:post.id)}
                    style={{background:'none',border:'none',cursor:'pointer',
                      fontSize:20,padding:0,lineHeight:1}}>
                    {reactions[post.id]||'😊'}
                  </button>
                  {openEmoji===post.id && (
                    <div style={{position:'absolute',bottom:32,left:-4,
                      background:C.bg,border:'0.5px solid '+C.border,
                      borderRadius:20,padding:'6px 8px',display:'flex',
                      gap:6,alignItems:'center',
                      boxShadow:'0 4px 16px rgba(0,0,0,.15)',
                      zIndex:10,whiteSpace:'nowrap'}}>
                      {EMOJIS.map(e=>(
                        <button key={e} onClick={()=>addReaction(post.id,e)}
                          style={{background:'none',border:'none',cursor:'pointer',
                            fontSize:20,padding:2}}>
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={getC().text} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{cursor:'pointer'}}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={getC().text} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{cursor:'pointer'}}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </div>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={getC().text} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{cursor:'pointer'}}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            </div>
            {post.comments>0 && (
              <div style={{fontSize:10,color:C.text3,marginTop:4}}>
                Voir les {post.comments} commentaires
              </div>
            )}
            <div style={{fontSize:9,color:C.text4,marginTop:2,
              textTransform:'uppercase',letterSpacing:.3}}>
              {post.time}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── SCREEN: CAMERA ───────────────────────────────────────────
const ScreenCamera = ({user, gps, now}) => {
  const vRef = useRef(null);
  const cRef = useRef(null);
  const streamRef = useRef(null);
  const [active, setActive] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [last, setLast] = useState(null);
  const [flash, setFlash] = useState(false);
  const {toast, toastMsg, toastShow} = useToast();
  const n = now || new Date();

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
    ctx.fillText('///mangue.soleil.pylone', 10, canvas.height-barH+54);
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
      <Toast msg={toastMsg} show={toastShow}/>
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
              <div style={{fontSize:8,color:'#E86C6C',marginTop:1}}>///mangue.soleil.pylone</div>
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
              background:'#0066CC',cursor:'pointer',fontSize:28,
              display:'flex',alignItems:'center',justifyContent:'center'}}>
            📷
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
                  const newPost = {id:Date.now(),userId:user.id,userName:user.name.toLowerCase().replace(' ','_'),
                    site:MISSIONS.find(m=>m.techId===user.id)?.site||'',
                    siteName:MISSIONS.find(m=>m.techId===user.id)?.siteName||'',
                    text:'Photo prise sur site',time:'A l instant',
                    reactions:{like:0,fire:0,clap:0},comments:0,type:'photo',photoUrl:last};
                  FEED_POSTS.unshift(newPost);
                  toast('Photo publiee dans le Fil');
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
            <div style={{fontSize:10,color:'#25D366',fontWeight:600}}>via WhatsApp</div>
          )}
        </div>
        <span style={{fontSize:20,cursor:'pointer'}}>📞</span>
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
                color:m.from==='me'?'rgba(255,255,255,.7)':C2.text3}}>
                {m.time}
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
        <button onClick={()=>{
          if(!msg.trim()) return;
          setChatMsgs(p=>[...p,{id:Date.now(),from:'me',text:msg,
            time:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}]);
          setMsg('');
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
const ScreenPointer = ({user,gps}) => {
  const [tab,setTab] = useState('scan');
  const {toast,toastMsg,toastShow} = useToast();

  return (
    <div style={{flex:1,overflowY:'auto',background:C.bg,paddingBottom:80}}>
      <Toast msg={toastMsg} show={toastShow}/>
      <Header title={t('pointage')} right={
        gps && (
          <div style={{background:C.successL,padding:'4px 10px',borderRadius:20,
            display:'flex',alignItems:'center',gap:4}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:C.success}}/>
            <span style={{fontSize:10,color:'#3B6D11',fontWeight:600}}>GPS · {Math.round(gps.accuracy||6)}m</span>
          </div>
        )
      }/>
      <div style={{display:'flex',margin:'8px 14px',background:C.bg2,
        borderRadius:10,padding:3,gap:2}}>
        {[['scan','Scanner QR'],['badge','Mon badge']].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{flex:1,padding:'7px 4px',border:'none',cursor:'pointer',fontFamily:FONT,
              fontSize:11,fontWeight:tab===id?700:500,borderRadius:8,
              background:tab===id?C.bg:'transparent',
              color:tab===id?C.primary:C.text3,
              boxShadow:tab===id?'0 1px 3px rgba(0,0,0,.1)':'none'}}>
            {lbl}
          </button>
        ))}
      </div>

      {tab==='scan' && (
        <div style={{padding:'0 14px'}}>
          <div style={{background:'#0F172A',borderRadius:14,height:180,
            display:'flex',alignItems:'center',justifyContent:'center',
            position:'relative',marginBottom:12,overflow:'hidden'}}>
            <div style={{width:140,height:140,position:'relative'}}>
              {[[0,0],[0,1],[1,0],[1,1]].map(([t,l],i)=>(
                <div key={i} style={{position:'absolute',width:24,height:24,
                  [t?'bottom':'top']:0,[l?'right':'left']:0,
                  borderTop:!t?'3px solid '+C.pink:'none',
                  borderBottom:t?'3px solid '+C.pink:'none',
                  borderLeft:!l?'3px solid '+C.pink:'none',
                  borderRight:l?'3px solid '+C.pink:'none',
                  borderRadius:!t&&!l?'4px 0 0 0':!t&&l?'0 4px 0 0':t&&!l?'0 0 0 4px':'0 0 4px 0'}}/>
              ))}
              <div style={{position:'absolute',top:'50%',left:'10%',right:'10%',
                height:1.5,background:'rgba(232,108,108,.6)',transform:'translateY(-50%)'}}/>
              <div style={{position:'absolute',inset:0,display:'flex',
                alignItems:'center',justifyContent:'center',
                color:'rgba(255,255,255,.15)',fontSize:10,textAlign:'center',paddingTop:20}}>
                QR de votre bureau
              </div>
            </div>
            {gps && (
              <div style={{position:'absolute',bottom:8,right:10,
                background:'rgba(255,255,255,.1)',padding:'2px 7px',
                borderRadius:8,fontSize:8,color:'rgba(255,255,255,.6)'}}>
                Bureau Douala · {Math.round(gps.accuracy||6)}m
              </div>
            )}
          </div>
          <div style={{background:C.warningL,borderRadius:10,padding:'9px 12px',
            marginBottom:12,borderLeft:'3px solid '+C.warning,fontSize:10,color:'#92400E'}}>
            Scannez le QR code imprime sur votre bureau pour enregistrer votre arrivee ou depart
          </div>
          <div style={{background:C.bg2,borderRadius:12,padding:'12px',marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,color:C.text3,
              textTransform:'uppercase',letterSpacing:.5,marginBottom:10}}>
              {t('today')}
            </div>
            <div style={{display:'flex',justifyContent:'space-around'}}>
              {[
                {icon:'🟢',label:t('arrival'),val:'08:45',color:C.success},
                {icon:'🔵',label:t('duration'),val:'3h15',color:C.primary},
                {icon:'⚪',label:t('departure'),val:'--:--',color:C.text4},
              ].map(({icon,label,val,color})=>(
                <div key={label} style={{textAlign:'center'}}>
                  <div style={{fontSize:22,marginBottom:4}}>{icon}</div>
                  <div style={{fontSize:13,fontWeight:700,color}}>{val}</div>
                  <div style={{fontSize:9,color:C.text3}}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:C.text3,
              textTransform:'uppercase',letterSpacing:.5,marginBottom:6}}>
              {t('history')}
            </div>
            {[['Ven 23 mai','08:52','17:30','8h38'],['Jeu 22 mai','09:05','17:45','8h40']].map(([day,arr,dep,dur])=>(
              <div key={day} style={{display:'flex',justifyContent:'space-between',
                alignItems:'center',padding:'8px 10px',background:C.bg2,
                borderRadius:8,marginBottom:5}}>
                <span style={{fontSize:11,fontWeight:500,color:C.text}}>{day}</span>
                <div style={{display:'flex',gap:6,alignItems:'center',fontSize:10}}>
                  <span style={{color:C.success}}>{arr}</span>
                  <span style={{color:C.text4}}>→</span>
                  <span style={{color:C.danger}}>{dep}</span>
                  <span style={{background:C.primaryL,color:C.primary,
                    padding:'1px 6px',borderRadius:10,fontWeight:600}}>{dur}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='badge' && (
        <div style={{padding:'0 14px'}}>
          <div style={{background:`linear-gradient(135deg,${C.primary},#004499)`,
            borderRadius:14,padding:16,textAlign:'center',marginBottom:12}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
              <AvatarCircle av={user.av} color={'rgba(255,255,255,.5)'} size={40}/>
              <div style={{textAlign:'left'}}>
                <div style={{fontSize:14,fontWeight:700,color:'white'}}>{user.name}</div>
                <div style={{fontSize:10,color:'rgba(255,255,255,.8)'}}>{user.post} · {user.id}</div>
              </div>
            </div>
            <div style={{background:'white',borderRadius:8,padding:12,
              display:'inline-block',marginBottom:8}}>
              <svg width="100" height="100" viewBox="0 0 21 21">
                <rect width="21" height="21" fill="white"/>
                <rect x="0" y="0" width="7" height="7" fill="#0F172A" rx="1"/>
                <rect x="1" y="1" width="5" height="5" fill="white"/>
                <rect x="2" y="2" width="3" height="3" fill="#0F172A"/>
                <rect x="14" y="0" width="7" height="7" fill="#0F172A" rx="1"/>
                <rect x="15" y="1" width="5" height="5" fill="white"/>
                <rect x="16" y="2" width="3" height="3" fill="#0F172A"/>
                <rect x="0" y="14" width="7" height="7" fill="#0F172A" rx="1"/>
                <rect x="1" y="15" width="5" height="5" fill="white"/>
                <rect x="2" y="16" width="3" height="3" fill="#0F172A"/>
                <rect x="9" y="1" width="1" height="2" fill="#0F172A"/>
                <rect x="11" y="0" width="2" height="1" fill="#0F172A"/>
                <rect x="8" y="8" width="2" height="2" fill="#0F172A"/>
                <rect x="11" y="8" width="3" height="1" fill="#0F172A"/>
                <rect x="17" y="8" width="3" height="2" fill="#0F172A"/>
                <rect x="8" y="12" width="3" height="1" fill="#0F172A"/>
                <rect x="14" y="12" width="4" height="2" fill="#0F172A"/>
              </svg>
            </div>
            <div style={{fontSize:9,color:'rgba(255,255,255,.6)'}}>Badge d identification uniquement</div>
          </div>
          <div style={{background:C.bg2,borderRadius:10,padding:'12px 14px',textAlign:'center',
            border:'0.5px solid '+C.border}}>
            <div style={{fontSize:20,marginBottom:6}}>🖨️</div>
            <div style={{fontSize:11,color:C.text3,lineHeight:1.5}}>
              Le QR de pointage est imprime et pose sur votre bureau par l admin
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── SCREEN: MISSION ──────────────────────────────────────────
const ScreenMission = ({user,gps,navigate}) => {
  const mission = MISSIONS.find(m=>m.techId===user.id);
  const [arrived,setArrived] = useState(false);
  const [showReport,setShowReport] = useState(false);
  const [report,setReport] = useState({done:'',issues:''});
  const {toast,toastMsg,toastShow} = useToast();
  const statusColors = {in_progress:C.primary,pending:C.warning,done:C.success};

  return (
    <div style={{flex:1,overflowY:'auto',background:C.bg,paddingBottom:80}}>
      <Toast msg={toastMsg} show={toastShow}/>
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
const ScreenEquipes = () => {
  const [tab,setTab] = useState('all');
  const terrainUsers = USERS.filter(u=>u.role==='terrain');
  const bureauUsers = USERS.filter(u=>!['terrain'].includes(u.role));
  const display = tab==='terrain'?terrainUsers:tab==='bureau'?bureauUsers:USERS.filter(u=>u.role!=='admin');

  const getStatus = (u) => {
    const m = MISSIONS.find(ms=>ms.techId===u.id&&ms.status==='in_progress');
    if(m) return {label:'Sur site',color:C.success,labelBg:C.successL,site:m.site,since:'07:30'};
    if(u.role!=='terrain') return {label:'Au bureau',color:C.primary,labelBg:C.primaryL,site:'Bureau Douala',since:'08:45'};
    return {label:'Absent',color:C.text4,labelBg:C.bg2,site:'',since:''};
  };

  return (
    <div style={{flex:1,overflowY:'auto',background:C.bg,paddingBottom:80}}>
      <Header title={t('equipes')} right={
        <div style={{display:'flex',gap:12}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={getC().text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{cursor:'pointer'}}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <span style={{fontSize:20,cursor:'pointer'}}>⚙️</span>
        </div>
      }/>
      <div style={{display:'flex',borderBottom:'1px solid '+C.border}}>
        {[['all',`${t('all')} (${USERS.length-1})`],['terrain',`${t('terrain')} (${terrainUsers.length})`],['bureau',`${t('bureau')} (${bureauUsers.length})`]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{flex:1,padding:'9px 2px',border:'none',background:C.bg,
              fontSize:10,fontWeight:tab===id?700:500,cursor:'pointer',fontFamily:FONT,
              color:tab===id?C.primary:C.text3,
              borderBottom:tab===id?'2px solid '+C.primary:'2px solid transparent'}}>
            {lbl}
          </button>
        ))}
      </div>
      <div>
        {display.filter(u=>u.role!=='admin').map(u=>{
          const st = getStatus(u);
          return (
            <div key={u.id} style={{display:'flex',alignItems:'center',gap:10,
              padding:'11px 14px',borderBottom:'0.5px solid '+C.border,
              opacity:st.label==='Absent'?.6:1}}>
              <div style={{position:'relative',flexShrink:0}}>
                <AvatarCircle av={u.av} color={u.color} size={44}/>
                <div style={{position:'absolute',bottom:0,right:0,
                  width:12,height:12,borderRadius:'50%',
                  background:st.color,border:'2px solid white'}}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:C.text}}>{u.name}</div>
                <div style={{fontSize:10,color:C.text3}}>{u.post}</div>
                {st.site && (
                  <div style={{fontSize:10,color:C.primary,
                    display:'flex',alignItems:'center',gap:2,marginTop:1}}>
                    📍 {st.site}
                  </div>
                )}
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{background:st.labelBg,color:st.color,
                  padding:'3px 8px',borderRadius:10,fontSize:10,fontWeight:700,marginBottom:2}}>
                  {st.label}
                </div>
                {st.since && <div style={{fontSize:9,color:C.text3}}>depuis {st.since}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── SCREEN: DISPATCH ─────────────────────────────────────────
const ScreenDispatch = () => {
  const [tab,setTab] = useState('active');
  const {toast,toastMsg,toastShow} = useToast();
  const statusColors = {in_progress:C.primary,pending:C.warning,done:C.success};
  const statusLabels = {in_progress:'En cours',pending:'En attente',done:'Termine'};

  return (
    <div style={{flex:1,overflowY:'auto',background:C.bg,paddingBottom:80}}>
      <Toast msg={toastMsg} show={toastShow}/>
      <Header title={t('dispatch')} right={
        <button style={{background:C.primary,border:'none',borderRadius:8,
          padding:'6px 12px',color:'white',fontSize:11,fontWeight:700,
          cursor:'pointer',fontFamily:FONT,display:'flex',alignItems:'center',gap:4}}>
          + {t('new_mission')}
        </button>
      }/>
      <div style={{display:'flex',borderBottom:'1px solid '+C.border}}>
        {[['active','En cours ('+MISSIONS.filter(m=>m.status==='in_progress').length+')'],
          ['assign',t('to_assign')+' ('+MISSIONS.filter(m=>m.status==='pending').length+')']].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{flex:1,padding:'9px 4px',border:'none',background:C.bg,
              fontSize:10,fontWeight:tab===id?700:500,cursor:'pointer',fontFamily:FONT,
              color:tab===id?C.primary:C.text3,
              borderBottom:tab===id?'2px solid '+C.primary:'2px solid transparent'}}>
            {lbl}
          </button>
        ))}
      </div>

      <div>
        {tab==='active' && MISSIONS.filter(m=>m.status==='in_progress').map(m=>{
          const tech = USERS.find(u=>u.id===m.techId);
          return (
            <div key={m.id} style={{padding:'12px 14px',borderBottom:'0.5px solid '+C.border}}>
              <div style={{display:'flex',justifyContent:'space-between',
                alignItems:'flex-start',marginBottom:8}}>
                <div>
                  <div style={{fontSize:10,color:C.text3,marginBottom:2}}>{m.client} · {m.site}</div>
                  <div style={{fontSize:14,fontWeight:700,color:C.text}}>{m.type}</div>
                </div>
                <div style={{background:statusColors[m.status]+'22',color:statusColors[m.status],
                  padding:'3px 9px',borderRadius:10,fontSize:10,fontWeight:700}}>
                  {statusLabels[m.status]}
                </div>
              </div>
              <ProgressBar val={m.pct} color={statusColors[m.status]} height={5}/>
              <div style={{display:'flex',justifyContent:'space-between',
                alignItems:'center',marginTop:8}}>
                <div style={{display:'flex',alignItems:'center',gap:-4}}>
                  {m.team?.map((tid,i)=>{
                    const u=USERS.find(u=>u.id===tid);
                    if(!u) return null;
                    return (
                      <div key={tid} style={{width:26,height:26,borderRadius:'50%',
                        background:u.color+'22',border:'2px solid white',
                        display:'flex',alignItems:'center',justifyContent:'center',
                        fontSize:9,fontWeight:700,color:u.color,
                        marginLeft:i>0?-8:0,zIndex:m.team.length-i}}>
                        {u.av}
                      </div>
                    );
                  })}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:10,color:C.text3}}>📅 {m.deadline}</span>
                  <button style={{background:'none',border:'0.5px solid '+C.border,
                    borderRadius:6,padding:'4px 8px',fontSize:10,color:C.primary,
                    cursor:'pointer',fontFamily:FONT}}>
                    Voir
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {tab==='assign' && (
          <div style={{padding:14}}>
            {MISSIONS.filter(m=>m.status==='pending').map(m=>{
              const available = USERS.filter(u=>u.role==='terrain'&&
                !MISSIONS.find(ms=>ms.techId===u.id&&ms.status==='in_progress'));
              return (
                <div key={m.id} style={{background:C.bg2,borderRadius:12,
                  padding:12,marginBottom:12,border:'0.5px solid '+C.border}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:3}}>
                    {m.client} · {m.site}
                  </div>
                  <div style={{fontSize:11,color:C.text3,marginBottom:10}}>
                    {m.type} · {m.deadline}
                  </div>
                  <div style={{fontSize:10,fontWeight:700,color:C.text3,
                    textTransform:'uppercase',letterSpacing:.4,marginBottom:8}}>
                    Techniciens disponibles
                  </div>
                  {available.map(u=>(
                    <div key={u.id} style={{display:'flex',alignItems:'center',
                      justifyContent:'space-between',padding:'7px 9px',
                      background:C.bg,borderRadius:8,
                      border:'0.5px solid '+C.border,marginBottom:5}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <AvatarCircle av={u.av} color={u.color} size={30}/>
                        <div>
                          <div style={{fontSize:11,fontWeight:600,color:C.text}}>{u.name}</div>
                          <div style={{fontSize:9,color:C.text3}}>{u.post} · {u.region}</div>
                        </div>
                      </div>
                      <button onClick={()=>toast(u.name+' assigne(e) ✓')}
                        style={{background:C.primary,border:'none',borderRadius:6,
                          padding:'4px 10px',color:'white',fontSize:10,fontWeight:700,
                          cursor:'pointer',fontFamily:FONT}}>
                        {t('assign')}
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── SCREEN: APPROVALS ────────────────────────────────────────
const ScreenApprovals = ({user}) => {
  const [tab,setTab] = useState('pending');
  const [items,setItems] = useState(APPROVALS);
  const {toast,toastMsg,toastShow} = useToast();

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
      <Toast msg={toastMsg} show={toastShow}/>
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
  const kpis = [
    {label:'CA du mois',val:'207M',change:'+18.4%',up:true},
    {label:'Missions',val:'5',sub:'3 en cours',color:C.primary},
    {label:'Paiements dus',val:'7.7M',sub:'3 factures',danger:true},
    {label:'Equipe active',val:'8/8',sub:'Tous actifs',color:C.success},
  ];
  const clients = [
    {name:'MTN',val:78,color:'#FFCC00',amount:'78M'},
    {name:'Orange',val:55,color:'#F97316',amount:'55M'},
    {name:'CAMTEL',val:45,color:C.primary,amount:'45M'},
    {name:'Autres',val:29,color:C.text4,amount:'29M'},
  ];
  const alerts = [
    {icon:'🔴',title:'Facture impayee MTN',sub:'4.2M FCFA · Echeance depassee',border:C.danger},
    {icon:'🟡',title:'KRI-001 deadline proche',sub:'Deadline dans 2 jours · 80% fait',border:C.warning},
    {icon:'🔵',title:'3 approvals en attente',sub:'Dont 1 decision finale DG',border:C.primary},
  ];

  return (
    <div style={{flex:1,overflowY:'auto',background:C.bg,paddingBottom:80}}>
      <Header title={t('analytics')} right={
        <div style={{background:C.bg2,borderRadius:8,padding:'4px 10px',
          fontSize:10,color:C.text2,display:'flex',alignItems:'center',gap:4,cursor:'pointer'}}>
          📅 Mai 2025
        </div>
      }/>
      <div style={{padding:'12px 14px',display:'flex',flexDirection:'column',gap:12}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {kpis.map(({label,val,change,up,sub,color,danger})=>(
            <div key={label} style={{background:C.bg2,borderRadius:10,padding:'10px 12px'}}>
              <div style={{fontSize:10,color:C.text3,marginBottom:4}}>{label}</div>
              <div style={{fontSize:20,fontWeight:700,color:danger?C.danger:C.text}}>{val}</div>
              {change && (
                <div style={{fontSize:10,color:up?C.success:C.danger,fontWeight:600,
                  display:'flex',alignItems:'center',gap:2}}>
                  {up?'📈':'📉'} {change}
                </div>
              )}
              {sub && <div style={{fontSize:9,color:color||C.text3,fontWeight:500}}>{sub}</div>}
            </div>
          ))}
        </div>

        <div style={{background:C.bg2,borderRadius:10,padding:'10px 12px'}}>
          <div style={{display:'flex',justifyContent:'space-between',
            alignItems:'center',marginBottom:10}}>
            <span style={{fontSize:12,fontWeight:700,color:C.text}}>{t('missions_progress')}</span>
            <span style={{fontSize:10,color:C.primary,cursor:'pointer'}}>Voir tout</span>
          </div>
          {MISSIONS.map(m=>{
            const colors = {in_progress:C.primary,pending:C.warning,done:C.success};
            return (
              <div key={m.id} style={{marginBottom:8}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                  <span style={{fontSize:11,color:C.text}}>{m.site} · {m.client}</span>
                  <span style={{fontSize:11,fontWeight:700,color:colors[m.status]}}>{m.pct}%</span>
                </div>
                <ProgressBar val={m.pct} color={colors[m.status]} height={5}/>
              </div>
            );
          })}
        </div>

        <div style={{background:C.bg2,borderRadius:10,padding:'10px 12px'}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:10}}>
            {t('revenue_client')}
          </div>
          {clients.map(({name,val,color,amount})=>(
            <div key={name} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
              <span style={{fontSize:11,color:C.text,minWidth:60}}>{name}</span>
              <div style={{flex:1,background:C.border,borderRadius:4,height:8,overflow:'hidden'}}>
                <div style={{width:val+'%',height:'100%',background:color,borderRadius:4,
                  transition:'width .6s'}}/>
              </div>
              <span style={{fontSize:10,fontWeight:700,color:C.text,minWidth:30}}>{amount}</span>
            </div>
          ))}
        </div>

        <div style={{background:C.bg2,borderRadius:10,padding:'10px 12px'}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:8}}>
            {t('alerts')}
          </div>
          {alerts.map(({icon,title,sub,border})=>(
            <div key={title} style={{display:'flex',gap:8,padding:'7px 9px',
              background:C.bg,borderRadius:8,marginBottom:5,
              borderLeft:'3px solid '+border}}>
              <span style={{fontSize:14,flexShrink:0}}>{icon}</span>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:C.text}}>{title}</div>
                <div style={{fontSize:10,color:C.text3}}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── SCREEN: PROFIL ───────────────────────────────────────────
const ScreenProfil = ({user,onLogout}) => {
  const [lang,setLang] = useState(getLang());
  const [theme,setTheme] = useState(getTheme());
  const [notifs,setNotifs] = useState(true);
  const {toast,toastMsg,toastShow} = useToast();
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
      <Toast msg={toastMsg} show={toastShow}/>
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
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🌐</div>
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
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🌙</div>
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
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🔔</div>
              <span style={{fontSize:13,color:C.text}}>{t('notifications')}</span>
            </div>
            <div onClick={()=>setNotifs(!notifs)}
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
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🔒</div>
              <span style={{fontSize:13,color:C.text}}>{t('change_password')}</span>
            </div>
            <span style={{color:C.text4}}>›</span>
          </div>
          {userObj.certs?.length>0 && (
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
              padding:'12px 14px',cursor:'pointer'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:32,height:32,borderRadius:8,background:C.bg2,
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🏆</div>
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

        <div onClick={()=>{
          if(window.deferredPrompt){
            window.deferredPrompt.prompt();
            window.deferredPrompt.userChoice.then(()=>{window.deferredPrompt=null;});
          } else {
            toast('Ouvrez ce lien dans Chrome sur Android pour installer');
          }
        }} style={{background:C.bg2,borderRadius:12,padding:'12px 14px',
          marginBottom:12,border:'0.5px solid '+C.border,cursor:'pointer',
          display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:32,height:32,borderRadius:8,background:C.bg2,
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>📲</div>
            <div>
              <div style={{fontSize:13,color:C.text}}>{t('install')}</div>
              <div style={{fontSize:10,color:C.text3}}>Ajouter CleanIT sur votre ecran</div>
            </div>
          </div>
          <span style={{color:C.text4}}>›</span>
        </div>

        <button onClick={onLogout}
          style={{width:'100%',padding:13,border:'0.5px solid '+C.dangerL,
            background:C.bg,borderRadius:12,fontSize:13,fontWeight:700,
            color:C.danger,cursor:'pointer',fontFamily:FONT,
            display:'flex',alignItems:'center',justifyContent:'center',gap:8,
            marginBottom:8}}>
          🚪 {t('logout')}
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
    if(loc.includes('/equipes'))  return <ScreenEquipes/>;
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
      <style>{`*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}body{margin:0;overscroll-behavior:none}`}</style>
      {getPage()}
      {!isCamera && <BottomNav user={user} navigate={navigate} active={activePage}/>}
    </div>
  );
}
