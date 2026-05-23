import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ============================================================
// i18n — FR / EN
// ============================================================
const TRANSLATIONS = {
  fr: {
    // Login
    select_profile: 'Choisir mon profil',
    enter_pin: 'Entrez votre code PIN',
    wrong_pin: 'Code PIN incorrect',
    language: 'Langue',
    // Navigation
    home: 'Accueil', scan: 'Scanner', camera: 'Caméra',
    missions: 'Missions', messages: 'Messages', profile: 'Profil',
    // Home bureau
    good_morning: 'Bonjour', good_afternoon: 'Bon après-midi', good_evening: 'Bonsoir',
    scan_qr: 'Scanner votre QR',
    qr_instruction: 'Présentez ce code au lecteur du bureau',
    today_schedule: 'Mon planning aujourd\'hui',
    no_events: 'Aucun événement aujourd\'hui',
    // Home terrain
    my_mission: 'Ma mission en cours',
    no_mission: 'Aucune mission assignée',
    contact_pm: 'Contactez votre chef de projet',
    arrive_site: 'Arriver sur le site',
    start_work: 'Commencer le travail',
    daily_report: 'Rapport journalier',
    finish_work: 'Terminer la mission',
    continue_tomorrow: 'Reprendre demain',
    // Pointage
    arrival: 'Arrivée', departure: 'Départ',
    on_site: 'Sur site', off_site: 'Hors site',
    take_arrival_photo: 'Prendre photo d\'arrivée',
    geofence_ok: 'Dans la zone autorisée',
    geofence_warn: 'Hors périmètre — signalé',
    pointed: 'Pointage enregistré',
    // CamIA / NoteCam
    take_photo: 'Prendre une photo',
    photo_saved: 'Photo enregistrée',
    send_to_project: 'Envoyer au projet',
    photo_sent: 'Photo envoyée au projet',
    gallery: 'Galerie',
    // Report
    write_report: 'Écrire un rapport',
    work_done_today: 'Travaux effectués aujourd\'hui',
    issues: 'Problèmes rencontrés',
    tomorrow_plan: 'Prévisions demain',
    send_report: 'Envoyer le rapport',
    report_sent: 'Rapport envoyé',
    // Profile
    my_profile: 'Mon profil',
    my_role: 'Mon rôle',
    region: 'Région',
    certifications: 'Certifications',
    theme: 'Thème',
    theme_dark: 'Sombre', theme_light: 'Clair',
    logout: 'Se déconnecter',
    app_version: 'Version',
    // Status
    available: 'Disponible', on_mission: 'En mission',
    completed: 'Terminé', pending: 'En attente',
    in_progress: 'En cours',
  },
  en: {
    select_profile: 'Choose your profile',
    enter_pin: 'Enter your PIN code',
    wrong_pin: 'Wrong PIN code',
    language: 'Language',
    home: 'Home', scan: 'Scan', camera: 'Camera',
    missions: 'Missions', messages: 'Messages', profile: 'Profile',
    good_morning: 'Good morning', good_afternoon: 'Good afternoon', good_evening: 'Good evening',
    scan_qr: 'Scan your QR code',
    qr_instruction: 'Show this code to the office reader',
    today_schedule: 'My schedule today',
    no_events: 'No events today',
    my_mission: 'Current mission',
    no_mission: 'No mission assigned',
    contact_pm: 'Contact your project manager',
    arrive_site: 'Arrive on site',
    start_work: 'Start work',
    daily_report: 'Daily report',
    finish_work: 'Complete mission',
    continue_tomorrow: 'Continue tomorrow',
    arrival: 'Arrival', departure: 'Departure',
    on_site: 'On site', off_site: 'Off site',
    take_arrival_photo: 'Take arrival photo',
    geofence_ok: 'Within authorised zone',
    geofence_warn: 'Outside perimeter — reported',
    pointed: 'Check-in recorded',
    take_photo: 'Take a photo',
    photo_saved: 'Photo saved',
    send_to_project: 'Send to project',
    photo_sent: 'Photo sent to project',
    gallery: 'Gallery',
    write_report: 'Write a report',
    work_done_today: 'Work done today',
    issues: 'Issues encountered',
    tomorrow_plan: 'Plans for tomorrow',
    send_report: 'Send report',
    report_sent: 'Report sent',
    my_profile: 'My profile',
    my_role: 'My role',
    region: 'Region',
    certifications: 'Certifications',
    theme: 'Theme',
    theme_dark: 'Dark', theme_light: 'Light',
    logout: 'Sign out',
    app_version: 'Version',
    available: 'Available', on_mission: 'On mission',
    completed: 'Completed', pending: 'Pending',
    in_progress: 'In progress',
  }
};

// ============================================================
// Theme system — CSS variables properly
// ============================================================
const THEMES = {
  dark: {
    '--m-bg':      '#0f172a',
    '--m-card':    '#1e293b',
    '--m-card2':   '#334155',
    '--m-border':  '#334155',
    '--m-text':    '#f1f5f9',
    '--m-text2':   '#94a3b8',
    '--m-text3':   '#64748b',
    '--m-input-bg':'#0f172a',
    '--m-overlay': 'rgba(0,0,0,0.7)',
  },
  light: {
    '--m-bg':      '#f8fafc',
    '--m-card':    '#ffffff',
    '--m-card2':   '#f1f5f9',
    '--m-border':  '#e2e8f0',
    '--m-text':    '#0f172a',
    '--m-text2':   '#475569',
    '--m-text3':   '#94a3b8',
    '--m-input-bg':'#ffffff',
    '--m-overlay': 'rgba(0,0,0,0.5)',
  }
};
const ACCENT = {
  '--m-blue':   '#3b82f6',
  '--m-green':  '#22c55e',
  '--m-red':    '#ef4444',
  '--m-orange': '#f97316',
  '--m-purple': '#a855f7',
  '--m-yellow': '#eab308',
  '--m-white':  '#ffffff',
};

const applyTheme = (theme) => {
  const root = document.documentElement;
  const vars = { ...THEMES[theme] || THEMES.dark, ...ACCENT };
  Object.entries(vars).forEach(([k,v]) => root.style.setProperty(k, v));
};

// ============================================================
// Data
// ============================================================
const EMPLOYES = [
  {id:'EI-001',nom:'Marie Kamga',   name:'Marie Kamga',   poste:'Chef Projet',     role:'bureau', pin:'1234', avatar:'MK', color:'#3b82f6', region:'Douala'},
  {id:'EI-002',nom:'Jean Fouda',    name:'Jean Fouda',    poste:'Project Manager', role:'bureau', pin:'2345', avatar:'JF', color:'#a855f7', region:'Yaoundé'},
  {id:'EI-003',nom:'Alice Finance', name:'Alice Finance',  poste:'Comptable',       role:'bureau', pin:'3456', avatar:'AF', color:'#22c55e', region:'Douala'},
  {id:'EX-001',nom:'Thomas Ngono', name:'Thomas Ngono',   poste:'Tech. 5G/4G',     role:'terrain',pin:'4567', avatar:'TN', color:'#f97316', region:'Douala', certs:['HCNP-5G','HCIP']},
  {id:'EX-002',nom:'Samuel Djomo', name:'Samuel Djomo',   poste:'Tech. 3G/4G',     role:'terrain',pin:'5678', avatar:'SD', color:'#22c55e', region:'Bafoussam', certs:['HCNP-4G']},
  {id:'EX-003',nom:'Jean Mbarga',  name:'Jean Mbarga',    poste:'Tech. RF',         role:'terrain',pin:'6789', avatar:'JM', color:'#06b6d4', region:'Yaoundé', certs:['HCNA-5G']},
  {id:'EX-004',nom:'Ali Moussa',   name:'Ali Moussa',     poste:'Superviseur HSE',  role:'terrain',pin:'7890', avatar:'AM', color:'#ef4444', region:'Garoua', certs:['HSE-L3']},
  {id:'EX-005',nom:'Pierre Etoga', name:'Pierre Etoga',   poste:'Tech. 5G/Fibre',   role:'terrain',pin:'8901', avatar:'PE', color:'#8b5cf6', region:'Douala', certs:['HCIP-5G','HCNP-4G']},
];

const MISSIONS_SEED = [
  {id:'M001', site:'DLA-001', siteName:'Tour MTN Bassa', client:'MTN', type:'Installation 5G NR', techId:'EX-001', status:'in_progress', progress:65, startDate:'2025-05-10', deadline:'2025-05-30', bcPo:'416121376123-2', checklist:[{t:'Sécurité site vérifiée',done:true},{t:'Photos arrivée envoyées',done:true},{t:'Câblage RRU secteur Sud',done:false},{t:'Tests signal 5G NR',done:false}], reports:[{date:'2025-05-20',text:'Câbles posés secteur Nord. Secteur Sud prévu demain.',by:'Thomas Ngono'}]},
  {id:'M002', site:'KRI-001', siteName:'Station CAMTEL Kribi', client:'CAMTEL', type:'Swap 4G→5G', techId:'EX-005', status:'in_progress', progress:80, startDate:'2025-05-05', deadline:'2025-05-22', bcPo:'4161HG3336731-43', checklist:[{t:'Inspection structure',done:true},{t:'Démontage ancien équipement',done:true},{t:'Installation BBU 5900',done:true},{t:'Tests finaux',done:false}], reports:[]},
  {id:'M003', site:'YDE-001', siteName:'Site Yaoundé Centre', client:'Orange', type:'Maintenance 4G', techId:'EX-003', status:'pending', progress:0, startDate:'2025-05-24', deadline:'2025-06-05', bcPo:'416121016354-58', checklist:[{t:'Préparation matériel',done:false},{t:'Autorisation accès site',done:false}], reports:[]},
];

const PLANNING_SEED = {
  'EI-001': [{h:'09:00',titre:'Réunion équipe projet',lieu:'Bureau Douala'},{h:'14:00',titre:'Revue BC MTN Q2',lieu:'Salle conf. A'}],
  'EI-002': [{h:'10:00',titre:'Dispatch missions terrain',lieu:'Bureau'},{h:'15:30',titre:'Appel client Orange',lieu:'Téléphone'}],
  'EI-003': [{h:'08:30',titre:'Saisie factures du mois',lieu:'Bureau Comptabilité'},{h:'11:00',titre:'Rapprochement bancaire',lieu:'Bureau'}],
};

// ============================================================
// Hooks & utils
// ============================================================
const getLang = () => localStorage.getItem('cleanit_mobile_lang') || 'fr';
const t = (key) => {
  const lang = getLang();
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['fr']?.[key] || key;
};
const getTheme = () => localStorage.getItem('cleanit_mobile_theme') || 'dark';

// SVG Icons
const Icon = ({name, size=22, color='var(--m-text)'}) => {
  const paths = {
    home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    qr: 'M12 4H4v8h8V4zM4 20h8v-8H4v8zM20 4h-8v8h8V4zM17 17h3v3h-3v-3zM14 14h3v3h-3v-3z M7 7h2v2H7V7z M7 15h2v2H7v-2z M15 7h2v2h-2V7z',
    camera: 'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z M12 17a4 4 0 100-8 4 4 0 000 8z',
    missions: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 000 4h6a2 2 0 000-4M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    message: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    profile: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    pin: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
    check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    alert: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    send: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
    report: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    photo: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
    sun: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
    moon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      style={{flexShrink:0,display:'block'}}>
      {(paths[name]||'').split(' M ').map((d,i)=>
        <path key={i} d={i===0?d:`M ${d}`}/>)}
    </svg>
  );
};

// Simple QR code generator (SVG)
const QRCode = ({value, size=180}) => {
  const cells = 21;
  const cell = size/cells;
  // Pattern de base simulé visuellement
  const pattern = [];
  for(let r=0;r<cells;r++) for(let c=0;c<cells;c++){
    const hash = (value.charCodeAt(r%value.length)*31+c*17+r*7)%3;
    const corner = (r<7&&c<7)||(r<7&&c>13)||(r>13&&c<7);
    const edge = (r===0||r===6||c===0||c===6)&&r<7&&c<7;
    const edge2 = (r===0||r===6||c===14||c===20)&&r<7&&c>13;
    const edge3 = (r===14||r===20||c===0||c===6)&&r>13&&c<7;
    const filled = corner||edge||edge2||edge3||hash===0;
    if(filled) pattern.push({r,c});
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="var(--m-card)"/>
      {pattern.map(({r,c},i)=>(
        <rect key={i} x={c*cell} y={r*cell} width={cell-0.5} height={cell-0.5}
          fill="var(--m-text)" rx={0.5}/>
      ))}
    </svg>
  );
};

// Progress bar component
const ProgressBar = ({value, color='var(--m-blue)'}) => (
  <div style={{background:'var(--m-card2)',borderRadius:8,height:8,overflow:'hidden',width:'100%'}}>
    <div style={{width:`${value}%`,height:'100%',background:color,borderRadius:8,transition:'width .6s ease'}}/>
  </div>
);

// Avatar component
const Avatar = ({emp, size=44}) => (
  <div style={{width:size,height:size,borderRadius:size/3,background:emp.color+'33',
    border:`2px solid ${emp.color}`,display:'flex',alignItems:'center',
    justifyContent:'center',fontSize:size*0.35,fontWeight:700,color:emp.color,flexShrink:0}}>
    {emp.avatar}
  </div>
);

// Toast notification
const Toast = ({msg, type='success', visible}) => (
  <div style={{position:'fixed',top:20,left:'50%',transform:`translateX(-50%) translateY(${visible?0:-80}px)`,
    zIndex:9999,background:type==='success'?'var(--m-green)':'var(--m-red)',
    color:'#fff',padding:'10px 20px',borderRadius:12,fontSize:13,fontWeight:600,
    boxShadow:'0 8px 24px rgba(0,0,0,.3)',transition:'transform .3s ease',whiteSpace:'nowrap'}}>
    {msg}
  </div>
);

// ============================================================
// LOGIN SCREEN
// ============================================================
const PageLogin = ({onLogin}) => {
  const [selected, setSelected] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [lang, setLang] = useState(getLang());
  const [theme, setTheme] = useState(getTheme());
  const [step, setStep] = useState('select'); // select | pin

  const handleTheme = (th) => {
    setTheme(th);
    localStorage.setItem('cleanit_mobile_theme', th);
    applyTheme(th);
  };
  const handleLang = (l) => {
    setLang(l);
    localStorage.setItem('cleanit_mobile_lang', l);
  };

  const handleSelect = (emp) => {
    setSelected(emp);
    setPin('');
    setError('');
    setStep('pin');
  };

  const handlePin = (digit) => {
    if(pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    if(newPin.length === 4) {
      setTimeout(() => {
        if(newPin === selected.pin) {
          onLogin(selected);
        } else {
          setError(TRANSLATIONS[lang].wrong_pin);
          setPin('');
        }
      }, 200);
    }
  };

  const bg = theme === 'dark' ? '#0f172a' : '#f8fafc';
  const card = theme === 'dark' ? '#1e293b' : '#fff';
  const text = theme === 'dark' ? '#f1f5f9' : '#0f172a';
  const text2 = theme === 'dark' ? '#94a3b8' : '#64748b';
  const border = theme === 'dark' ? '#334155' : '#e2e8f0';

  return (
    <div style={{minHeight:'100vh',background:bg,display:'flex',flexDirection:'column',
      fontFamily:"'Segoe UI',system-ui,sans-serif",maxWidth:430,margin:'0 auto'}}>
      {/* Header */}
      <div style={{padding:'24px 20px 16px',textAlign:'center'}}>
        <img src="/logo.png" alt="CleanIT" style={{height:36,marginBottom:12}}
          onError={e=>{e.target.style.display='none';}}/>
        <div style={{fontSize:22,fontWeight:800,color:text,letterSpacing:-.5}}>CleanIT ERP</div>
        <div style={{fontSize:12,color:text2,marginTop:3}}>Mobile · v2.0</div>
      </div>

      {/* Lang + Theme toggles */}
      <div style={{display:'flex',justifyContent:'center',gap:8,padding:'0 20px 16px'}}>
        <div style={{display:'flex',border:`1px solid ${border}`,borderRadius:8,overflow:'hidden'}}>
          {['fr','en'].map(l=>(
            <button key={l} onClick={()=>handleLang(l)}
              style={{padding:'6px 14px',border:'none',background:lang===l?'#3b82f6':'transparent',
                color:lang===l?'#fff':text2,fontSize:12,fontWeight:lang===l?700:400,cursor:'pointer',fontFamily:'inherit'}}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{display:'flex',border:`1px solid ${border}`,borderRadius:8,overflow:'hidden'}}>
          {['dark','light'].map(th=>(
            <button key={th} onClick={()=>handleTheme(th)}
              style={{padding:'6px 10px',border:'none',background:theme===th?'#3b82f6':'transparent',
                color:theme===th?'#fff':text2,fontSize:11,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:3}}>
              {th==='dark'?'🌙':'☀️'}
            </button>
          ))}
        </div>
      </div>

      {step === 'select' && (
        <div style={{padding:'0 20px',flex:1,overflowY:'auto'}}>
          <div style={{fontSize:14,fontWeight:600,color:text2,marginBottom:12,textAlign:'center'}}>
            {TRANSLATIONS[lang].select_profile}
          </div>
          {/* Bureau */}
          <div style={{fontSize:11,fontWeight:700,color:text2,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:8}}>
            Bureau
          </div>
          {EMPLOYES.filter(e=>e.role==='bureau').map(emp=>(
            <button key={emp.id} onClick={()=>handleSelect(emp)}
              style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'12px 14px',
                background:card,border:`1px solid ${border}`,borderRadius:12,marginBottom:8,
                cursor:'pointer',fontFamily:'inherit',textAlign:'left'}}>
              <Avatar emp={emp} size={42}/>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:text}}>{emp.nom}</div>
                <div style={{fontSize:11,color:text2}}>{emp.poste} · {emp.region}</div>
              </div>
            </button>
          ))}
          {/* Terrain */}
          <div style={{fontSize:11,fontWeight:700,color:text2,textTransform:'uppercase',letterSpacing:'.5px',marginTop:16,marginBottom:8}}>
            Terrain / Field
          </div>
          {EMPLOYES.filter(e=>e.role==='terrain').map(emp=>(
            <button key={emp.id} onClick={()=>handleSelect(emp)}
              style={{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'12px 14px',
                background:card,border:`1px solid ${border}`,borderRadius:12,marginBottom:8,
                cursor:'pointer',fontFamily:'inherit',textAlign:'left'}}>
              <Avatar emp={emp} size={42}/>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:text}}>{emp.nom}</div>
                <div style={{fontSize:11,color:text2}}>{emp.poste} · {emp.region}</div>
                {emp.certs&&<div style={{display:'flex',gap:4,marginTop:3,flexWrap:'wrap'}}>
                  {emp.certs.map(c=><span key={c} style={{fontSize:9,padding:'1px 5px',borderRadius:4,background:'#3b82f620',color:'#3b82f6'}}>{c}</span>)}
                </div>}
              </div>
            </button>
          ))}
          <div style={{height:20}}/>
        </div>
      )}

      {step === 'pin' && selected && (
        <div style={{padding:'0 24px',flex:1,display:'flex',flexDirection:'column',alignItems:'center'}}>
          <div style={{marginBottom:20,textAlign:'center'}}>
            <Avatar emp={selected} size={64}/>
            <div style={{fontSize:16,fontWeight:700,color:text,marginTop:10}}>{selected.nom}</div>
            <div style={{fontSize:12,color:text2}}>{selected.poste}</div>
          </div>
          <div style={{fontSize:13,color:text2,marginBottom:16}}>{TRANSLATIONS[lang].enter_pin}</div>
          {/* PIN dots */}
          <div style={{display:'flex',gap:12,marginBottom:8}}>
            {[0,1,2,3].map(i=>(
              <div key={i} style={{width:16,height:16,borderRadius:'50%',
                background:pin.length>i?selected.color:border,
                transition:'background .15s'}}/>
            ))}
          </div>
          {error&&<div style={{fontSize:12,color:'var(--m-red,#ef4444)',marginBottom:12}}>{error}</div>}
          {/* Keypad */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,width:'100%',maxWidth:260,marginTop:12}}>
            {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((d,i)=>(
              <button key={i} onClick={()=>{
                  if(d==='⌫') setPin(p=>p.slice(0,-1));
                  else if(d!=='') handlePin(String(d));
                }}
                style={{padding:'18px',borderRadius:16,border:`1px solid ${border}`,
                  background:d===''?'transparent':card,color:text,fontSize:20,fontWeight:600,
                  cursor:d===''?'default':'pointer',fontFamily:'inherit',
                  opacity:d===''?0:1}}>
                {d}
              </button>
            ))}
          </div>
          <button onClick={()=>{setStep('select');setPin('');setError('');}}
            style={{marginTop:20,background:'transparent',border:'none',color:text2,fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>
            ← Retour
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================
// HOME BUREAU
// ============================================================
const PageHomeBureau = ({user, now}) => {
  const hour = now.getHours();
  const greeting = hour<12 ? t('good_morning') : hour<18 ? t('good_afternoon') : t('good_evening');
  const planning = PLANNING_SEED[user.id] || [];

  return (
    <div style={{padding:'0 16px 100px',overflowY:'auto',flex:1}}>
      {/* Greeting */}
      <div style={{padding:'20px 0 16px'}}>
        <div style={{fontSize:13,color:'var(--m-text2)'}}>
          {now.toLocaleDateString(getLang()==='fr'?'fr-FR':'en-GB',{weekday:'long',day:'numeric',month:'long'})}
        </div>
        <div style={{fontSize:22,fontWeight:800,color:'var(--m-text)',marginTop:2}}>
          {greeting}, {user.nom.split(' ')[0]} 👋
        </div>
      </div>

      {/* QR Code card */}
      <div style={{background:'var(--m-card)',borderRadius:16,padding:'20px',marginBottom:16,
        border:'1px solid var(--m-border)',textAlign:'center'}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--m-text2)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:12}}>
          {t('scan_qr')}
        </div>
        <div style={{display:'inline-block',padding:12,background:'var(--m-card)',borderRadius:12,
          border:'2px solid var(--m-blue)',boxShadow:'0 0 24px rgba(59,130,246,.2)'}}>
          <QRCode value={`CLEANIT:${user.id}:${user.nom}`} size={160}/>
        </div>
        <div style={{fontSize:11,color:'var(--m-text2)',marginTop:10}}>{t('qr_instruction')}</div>
        <div style={{marginTop:8,fontSize:12,fontWeight:700,color:'var(--m-blue)',letterSpacing:2}}>{user.id}</div>
      </div>

      {/* Planning du jour */}
      <div style={{background:'var(--m-card)',borderRadius:16,padding:'16px',border:'1px solid var(--m-border)'}}>
        <div style={{fontSize:14,fontWeight:700,color:'var(--m-text)',marginBottom:12,display:'flex',alignItems:'center',gap:6}}>
          <Icon name="calendar" size={16} color="var(--m-blue)"/>
          {t('today_schedule')}
        </div>
        {planning.length===0
          ? <div style={{fontSize:13,color:'var(--m-text2)',textAlign:'center',padding:'12px 0'}}>{t('no_events')}</div>
          : planning.map((ev,i)=>(
            <div key={i} style={{display:'flex',gap:10,padding:'10px 0',
              borderBottom:i<planning.length-1?'1px solid var(--m-border)':'none'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--m-blue)',minWidth:45}}>{ev.h}</div>
              <div>
                <div style={{fontSize:13,fontWeight:500,color:'var(--m-text)'}}>{ev.titre}</div>
                <div style={{fontSize:11,color:'var(--m-text2)',marginTop:1}}>{ev.lieu}</div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
};

// ============================================================
// HOME TERRAIN
// ============================================================
const PageHomeTerrain = ({user, gps, navigate}) => {
  const mission = MISSIONS_SEED.find(m=>m.techId===user.id) || null;
  const [arrived, setArrived] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState({done:'',issues:'',tomorrow:''});
  const [toast, setToast] = useState({visible:false,msg:''});

  const showToast = (msg, type='success') => {
    setToast({visible:true,msg,type});
    setTimeout(()=>setToast(t=>({...t,visible:false})),2500);
  };

  const statusColor = {in_progress:'var(--m-blue)',pending:'var(--m-orange)',completed:'var(--m-green)'};

  return (
    <div style={{padding:'0 16px 100px',overflowY:'auto',flex:1}}>
      <Toast msg={toast.msg} type={toast.type} visible={toast.visible}/>

      <div style={{padding:'20px 0 16px'}}>
        <div style={{fontSize:22,fontWeight:800,color:'var(--m-text)'}}>
          {t('my_mission')}
        </div>
      </div>

      {!mission ? (
        <div style={{background:'var(--m-card)',borderRadius:16,padding:'32px 20px',textAlign:'center',border:'1px solid var(--m-border)'}}>
          <Icon name="missions" size={40} color="var(--m-text2)"/>
          <div style={{fontSize:14,color:'var(--m-text2)',marginTop:12}}>{t('no_mission')}</div>
          <div style={{fontSize:12,color:'var(--m-text3)',marginTop:6}}>{t('contact_pm')}</div>
        </div>
      ) : (
        <>
          {/* Mission card */}
          <div style={{background:'var(--m-card)',borderRadius:16,padding:'16px',marginBottom:12,border:'1px solid var(--m-border)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
              <div>
                <div style={{fontSize:11,color:'var(--m-text2)',textTransform:'uppercase',letterSpacing:'.5px'}}>{mission.client}</div>
                <div style={{fontSize:16,fontWeight:700,color:'var(--m-text)',marginTop:2}}>{mission.siteName}</div>
                <div style={{fontSize:12,color:'var(--m-text2)',marginTop:2}}>{mission.type}</div>
              </div>
              <div style={{padding:'4px 10px',borderRadius:20,background:statusColor[mission.status]+'22',
                color:statusColor[mission.status],fontSize:11,fontWeight:700}}>
                {t(mission.status === 'in_progress' ? 'in_progress' : mission.status)}
              </div>
            </div>
            <ProgressBar value={mission.progress} color={statusColor[mission.status]}/>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:6,fontSize:11,color:'var(--m-text2)'}}>
              <span>{mission.progress}% complété</span>
              <span>Deadline: {mission.deadline}</span>
            </div>
            <div style={{marginTop:10,padding:'8px 10px',background:'var(--m-card2)',borderRadius:8,fontSize:11,color:'var(--m-text2)'}}>
              BC: <span style={{color:'var(--m-blue)',fontWeight:600,fontFamily:'monospace'}}>{mission.bcPo}</span>
            </div>
          </div>

          {/* GPS status */}
          {gps && (
            <div style={{background:'var(--m-card)',borderRadius:12,padding:'10px 14px',marginBottom:12,
              border:'1px solid var(--m-border)',display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:'var(--m-green)',
                animation:'pulse 1.5s ease infinite'}}/>
              <span style={{fontSize:12,color:'var(--m-text2)'}}>
                GPS actif · Précision {Math.round(gps.accuracy||50)}m
              </span>
            </div>
          )}

          {/* Actions */}
          <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:12}}>
            {!arrived && (
              <button onClick={()=>{setArrived(true);showToast(t('pointed'));}}
                style={{padding:'16px',borderRadius:14,border:'none',
                  background:'linear-gradient(135deg,var(--m-blue),#6366f1)',
                  color:'#fff',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit',
                  display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                <Icon name="pin" size={18} color="#fff"/>
                {t('arrive_site')}
              </button>
            )}
            {arrived && (
              <div style={{padding:'12px 14px',borderRadius:12,background:'var(--m-green)22',
                border:'1px solid var(--m-green)',display:'flex',alignItems:'center',gap:8}}>
                <Icon name="check" size={16} color="var(--m-green)"/>
                <span style={{fontSize:13,color:'var(--m-green)',fontWeight:600}}>{t('on_site')} ✓</span>
              </div>
            )}
            <button onClick={()=>navigate('/mobile/camera')}
              style={{padding:'14px',borderRadius:14,border:'1px solid var(--m-border)',
                background:'var(--m-card)',color:'var(--m-text)',fontSize:14,fontWeight:600,
                cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              <Icon name="camera" size={18} color="var(--m-blue)"/>
              {t('take_arrival_photo')}
            </button>
            <button onClick={()=>setShowReport(true)}
              style={{padding:'14px',borderRadius:14,border:'1px solid var(--m-border)',
                background:'var(--m-card)',color:'var(--m-text)',fontSize:14,fontWeight:600,
                cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              <Icon name="report" size={18} color="var(--m-orange)"/>
              {t('daily_report')}
            </button>
          </div>

          {/* Checklist */}
          <div style={{background:'var(--m-card)',borderRadius:16,padding:'16px',marginBottom:12,border:'1px solid var(--m-border)'}}>
            <div style={{fontSize:13,fontWeight:700,color:'var(--m-text)',marginBottom:10}}>Checklist</div>
            {mission.checklist.map((item,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',
                borderBottom:i<mission.checklist.length-1?'1px solid var(--m-border)':'none'}}>
                <div style={{width:20,height:20,borderRadius:6,
                  background:item.done?'var(--m-green)':'var(--m-card2)',
                  border:`2px solid ${item.done?'var(--m-green)':'var(--m-border)'}`,
                  display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  {item.done&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <span style={{fontSize:13,color:item.done?'var(--m-text2)':'var(--m-text)',
                  textDecoration:item.done?'line-through':'none'}}>{item.t}</span>
              </div>
            ))}
          </div>

          {/* Reports history */}
          {mission.reports.length > 0 && (
            <div style={{background:'var(--m-card)',borderRadius:16,padding:'16px',border:'1px solid var(--m-border)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--m-text)',marginBottom:10}}>Rapports précédents</div>
              {mission.reports.map((r,i)=>(
                <div key={i} style={{padding:'10px',background:'var(--m-card2)',borderRadius:10,marginBottom:6}}>
                  <div style={{fontSize:11,color:'var(--m-text2)',marginBottom:4}}>{r.date} · {r.by}</div>
                  <div style={{fontSize:13,color:'var(--m-text)'}}>{r.text}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Report modal */}
      {showReport && (
        <div style={{position:'fixed',inset:0,background:'var(--m-overlay,rgba(0,0,0,0.7))',zIndex:999,
          display:'flex',alignItems:'flex-end'}}>
          <div style={{background:'var(--m-card)',width:'100%',borderRadius:'20px 20px 0 0',
            padding:'20px 16px',maxHeight:'80vh',overflowY:'auto'}}>
            <div style={{fontSize:15,fontWeight:700,color:'var(--m-text)',marginBottom:16}}>
              {t('write_report')}
            </div>
            {[
              {key:'done', label:t('work_done_today')},
              {key:'issues', label:t('issues')},
              {key:'tomorrow', label:t('tomorrow_plan')},
            ].map(field=>(
              <div key={field.key} style={{marginBottom:12}}>
                <div style={{fontSize:12,color:'var(--m-text2)',marginBottom:6,fontWeight:600}}>{field.label}</div>
                <textarea value={report[field.key]} onChange={e=>setReport(r=>({...r,[field.key]:e.target.value}))}
                  rows={3} placeholder="..."
                  style={{width:'100%',background:'var(--m-card2)',border:'1px solid var(--m-border)',
                    borderRadius:10,padding:'10px 12px',color:'var(--m-text)',fontSize:13,
                    fontFamily:'inherit',resize:'none',outline:'none',boxSizing:'border-box'}}/>
              </div>
            ))}
            <div style={{display:'flex',gap:10,marginTop:4}}>
              <button onClick={()=>setShowReport(false)}
                style={{flex:1,padding:'12px',borderRadius:12,border:'1px solid var(--m-border)',
                  background:'transparent',color:'var(--m-text2)',cursor:'pointer',fontFamily:'inherit',fontSize:13}}>
                Annuler
              </button>
              <button onClick={()=>{setShowReport(false);showToast(t('report_sent'));setReport({done:'',issues:'',tomorrow:''}); }}
                style={{flex:2,padding:'12px',borderRadius:12,border:'none',
                  background:'var(--m-blue)',color:'#fff',cursor:'pointer',fontFamily:'inherit',
                  fontSize:13,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                <Icon name="send" size={14} color="#fff"/>
                {t('send_report')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// CAMERA — NoteCam style
// ============================================================
const PageCamera = ({user, gps}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [lastPhoto, setLastPhoto] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [flash, setFlash] = useState(false);
  const [toast, setToast] = useState({visible:false,msg:''});
  const now = new Date();

  const showToast = (msg) => {
    setToast({visible:true,msg});
    setTimeout(()=>setToast(t=>({...t,visible:false})),2500);
  };

  const startCamera = async() => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false});
      if(videoRef.current) videoRef.current.srcObject = s;
      setStream(s);
      setCameraOn(true);
    } catch(e) {
      showToast('Caméra non accessible');
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(t=>t.stop());
    setStream(null);
    setCameraOn(false);
  };

  const takePhoto = () => {
    if(!videoRef.current||!canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video,0,0);
    // Ajouter watermark
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0,canvas.height-70,canvas.width,70);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Segoe UI';
    ctx.fillText(`CleanIT · ${user.nom}`,12,canvas.height-45);
    ctx.font = '13px Segoe UI';
    ctx.fillText(`${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}${gps?` · GPS: ${gps.lat.toFixed(4)},${gps.lng.toFixed(4)}`:''}`,12,canvas.height-18);
    const dataUrl = canvas.toDataURL('image/jpeg',0.9);
    const photo = {id:Date.now(),url:dataUrl,ts:now.toISOString(),user:user.nom,gps};
    setPhotos(p=>[photo,...p]);
    setLastPhoto(dataUrl);
    setFlash(true);
    setTimeout(()=>setFlash(false),200);
    showToast(t('photo_saved'));
  };

  useEffect(()=>{ return()=>stopCamera(); },[]);

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',background:'#000',position:'relative',overflow:'hidden'}}>
      <Toast msg={toast.msg} visible={toast.visible}/>
      <canvas ref={canvasRef} style={{display:'none'}}/>

      {/* Flash overlay */}
      {flash&&<div style={{position:'absolute',inset:0,background:'#fff',zIndex:50,opacity:.8}}/>}

      {/* Viewfinder */}
      <div style={{flex:1,position:'relative',background:'#111'}}>
        {cameraOn
          ? <video ref={videoRef} autoPlay playsInline muted
              style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          : (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:16}}>
              {lastPhoto
                ? <img src={lastPhoto} style={{maxWidth:'100%',maxHeight:'60vh',objectFit:'contain',borderRadius:8}}/>
                : <Icon name="camera" size={48} color="#334155"/>
              }
            </div>
          )
        }

        {/* Overlay info */}
        {cameraOn&&(
          <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'12px 16px',
            background:'linear-gradient(transparent,rgba(0,0,0,.8))'}}>
            <div style={{fontSize:12,color:'rgba(255,255,255,.7)'}}>
              {user.nom} · {now.toLocaleDateString('fr-FR')} {now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
            </div>
            {gps&&<div style={{fontSize:11,color:'rgba(255,255,255,.5)'}}>
              GPS {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
            </div>}
          </div>
        )}

        {/* Grid lines */}
        {cameraOn&&(
          <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.2}} viewBox="0 0 300 400">
            <line x1="100" y1="0" x2="100" y2="400" stroke="white" strokeWidth=".5"/>
            <line x1="200" y1="0" x2="200" y2="400" stroke="white" strokeWidth=".5"/>
            <line x1="0" y1="133" x2="300" y2="133" stroke="white" strokeWidth=".5"/>
            <line x1="0" y1="266" x2="300" y2="266" stroke="white" strokeWidth=".5"/>
          </svg>
        )}
      </div>

      {/* Controls */}
      <div style={{background:'#0a0a0a',padding:'20px 24px 30px',display:'flex',alignItems:'center',gap:20}}>
        {/* Galerie */}
        <div style={{flex:1,display:'flex',justifyContent:'flex-start'}}>
          {photos[0]
            ? <div style={{width:52,height:52,borderRadius:10,overflow:'hidden',border:'2px solid #fff'}}>
                <img src={photos[0].url} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              </div>
            : <div style={{width:52,height:52,borderRadius:10,border:'2px solid #333',
                display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Icon name="photo" size={20} color="#555"/>
              </div>
          }
        </div>

        {/* Shutter */}
        {cameraOn
          ? <button onClick={takePhoto}
              style={{width:72,height:72,borderRadius:'50%',border:'4px solid #fff',
                background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{width:58,height:58,borderRadius:'50%',background:'#fff'}}/>
            </button>
          : <button onClick={startCamera}
              style={{width:72,height:72,borderRadius:'50%',border:'4px solid #3b82f6',
                background:'#3b82f6',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icon name="camera" size={28} color="#fff"/>
            </button>
        }

        {/* Stop / Send */}
        <div style={{flex:1,display:'flex',justifyContent:'flex-end',gap:8}}>
          {cameraOn
            ? <button onClick={stopCamera}
                style={{padding:'10px',borderRadius:10,border:'1px solid #333',background:'#111',
                  cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div style={{width:16,height:16,background:'#ef4444',borderRadius:2}}/>
              </button>
            : photos.length>0&&(
                <button onClick={()=>showToast(t('photo_sent'))}
                  style={{padding:'10px 14px',borderRadius:10,border:'none',background:'#3b82f6',
                    cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                  <Icon name="send" size={16} color="#fff"/>
                  <span style={{fontSize:12,color:'#fff',fontWeight:600}}>{t('send_to_project')}</span>
                </button>
              )
          }
        </div>
      </div>

      {/* Photos strip */}
      {photos.length>0&&!cameraOn&&(
        <div style={{background:'#0a0a0a',padding:'0 12px 16px'}}>
          <div style={{display:'flex',gap:8,overflowX:'auto'}}>
            {photos.map(p=>(
              <img key={p.id} src={p.url}
                style={{width:64,height:64,borderRadius:8,objectFit:'cover',flexShrink:0,
                  border:'2px solid #333'}}/>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// PROFIL
// ============================================================
const PageProfil = ({user, onLogout}) => {
  const [lang, setLang] = useState(getLang());
  const [theme, setTheme] = useState(getTheme());

  const handleLang = (l) => { setLang(l); localStorage.setItem('cleanit_mobile_lang', l); };
  const handleTheme = (th) => {
    setTheme(th);
    localStorage.setItem('cleanit_mobile_theme', th);
    applyTheme(th);
  };

  return (
    <div style={{padding:'0 16px 100px',overflowY:'auto',flex:1}}>
      <div style={{padding:'20px 0 16px'}}>
        <div style={{fontSize:20,fontWeight:800,color:'var(--m-text)'}}>{t('my_profile')}</div>
      </div>
      {/* User card */}
      <div style={{background:'var(--m-card)',borderRadius:16,padding:'20px',marginBottom:16,
        border:'1px solid var(--m-border)',display:'flex',alignItems:'center',gap:14}}>
        <Avatar emp={user} size={56}/>
        <div>
          <div style={{fontSize:17,fontWeight:700,color:'var(--m-text)'}}>{user.nom}</div>
          <div style={{fontSize:12,color:'var(--m-text2)',marginTop:2}}>{user.poste}</div>
          <div style={{fontSize:11,color:'var(--m-blue)',marginTop:3,fontWeight:600}}>{user.id}</div>
        </div>
      </div>

      {/* Settings */}
      {[
        {label:t('language'), content:(
          <div style={{display:'flex',border:'1px solid var(--m-border)',borderRadius:8,overflow:'hidden'}}>
            {['fr','en'].map(l=>(
              <button key={l} onClick={()=>handleLang(l)}
                style={{padding:'6px 14px',border:'none',background:lang===l?'var(--m-blue)':'transparent',
                  color:lang===l?'#fff':'var(--m-text2)',fontSize:12,fontWeight:lang===l?700:400,
                  cursor:'pointer',fontFamily:'inherit'}}>
                {l==='fr'?'Français':'English'}
              </button>
            ))}
          </div>
        )},
        {label:t('theme'), content:(
          <div style={{display:'flex',border:'1px solid var(--m-border)',borderRadius:8,overflow:'hidden'}}>
            {[['dark',t('theme_dark')],['light',t('theme_light')]].map(([th,label])=>(
              <button key={th} onClick={()=>handleTheme(th)}
                style={{padding:'6px 14px',border:'none',background:theme===th?'var(--m-blue)':'transparent',
                  color:theme===th?'#fff':'var(--m-text2)',fontSize:12,fontWeight:theme===th?700:400,
                  cursor:'pointer',fontFamily:'inherit'}}>
                {label}
              </button>
            ))}
          </div>
        )},
      ].map(({label,content},i)=>(
        <div key={i} style={{background:'var(--m-card)',borderRadius:14,padding:'14px 16px',
          marginBottom:10,border:'1px solid var(--m-border)',display:'flex',
          justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontSize:13,fontWeight:500,color:'var(--m-text)'}}>{label}</div>
          {content}
        </div>
      ))}

      {user.certs&&(
        <div style={{background:'var(--m-card)',borderRadius:14,padding:'14px 16px',
          marginBottom:10,border:'1px solid var(--m-border)'}}>
          <div style={{fontSize:13,fontWeight:500,color:'var(--m-text)',marginBottom:8}}>{t('certifications')}</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {user.certs.map(c=>(
              <span key={c} style={{fontSize:11,padding:'3px 10px',borderRadius:20,
                background:'var(--m-blue)22',color:'var(--m-blue)',fontWeight:600}}>{c}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{background:'var(--m-card)',borderRadius:14,padding:'14px 16px',
        marginBottom:10,border:'1px solid var(--m-border)',display:'flex',
        justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontSize:12,color:'var(--m-text2)'}}>
          {t('app_version')}: <span style={{color:'var(--m-text)',fontWeight:600}}>2.0.0</span>
          {' '}· CleanIT ERP Mobile
        </div>
      </div>

      <button onClick={onLogout}
        style={{width:'100%',padding:'15px',borderRadius:14,border:'1px solid var(--m-red)',
          background:'var(--m-red)15',color:'var(--m-red)',fontSize:14,fontWeight:700,
          cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',
          justifyContent:'center',gap:8,marginTop:8}}>
        <Icon name="logout" size={18} color="var(--m-red)"/>
        {t('logout')}
      </button>
    </div>
  );
};

// ============================================================
// BOTTOM NAV
// ============================================================
const BottomNav = ({active, navigate, role}) => {
  const bureauTabs = [
    {id:'home',     icon:'home',     label:()=>t('home'),    url:'/mobile'},
    {id:'pointage', icon:'qr',       label:()=>t('scan'),    url:'/mobile/pointage'},
    {id:'camera',   icon:'camera',   label:()=>t('camera'),  url:'/mobile/camera'},
    {id:'messages', icon:'message',  label:()=>t('messages'),url:'/cleanitcomm'},
    {id:'profil',   icon:'profile',  label:()=>t('profile'), url:'/mobile/profil'},
  ];
  const terrainTabs = [
    {id:'home',     icon:'home',     label:()=>t('home'),    url:'/mobile'},
    {id:'missions', icon:'missions', label:()=>t('missions'),url:'/mobile'},
    {id:'camera',   icon:'camera',   label:()=>t('camera'),  url:'/mobile/camera'},
    {id:'messages', icon:'message',  label:()=>t('messages'),url:'/cleanitcomm'},
    {id:'profil',   icon:'profile',  label:()=>t('profile'), url:'/mobile/profil'},
  ];
  const tabs = role === 'bureau' ? bureauTabs : terrainTabs;

  return (
    <div style={{position:'fixed',bottom:0,left:0,right:0,maxWidth:430,margin:'0 auto',
      background:'var(--m-card)',borderTop:'1px solid var(--m-border)',
      display:'flex',zIndex:100,paddingBottom:'env(safe-area-inset-bottom,0px)',
      backdropFilter:'blur(12px)'}}>
      {tabs.map(tab=>{
        const isActive = active===tab.id||(active===''&&tab.id==='home');
        return (
          <button key={tab.id} onClick={()=>navigate(tab.url)}
            style={{flex:1,padding:'10px 4px 8px',border:'none',background:'transparent',
              display:'flex',flexDirection:'column',alignItems:'center',gap:4,
              cursor:'pointer',position:'relative',fontFamily:'inherit'}}>
            {isActive&&<div style={{position:'absolute',top:0,left:'50%',
              transform:'translateX(-50%)',width:28,height:3,borderRadius:3,background:'var(--m-blue)'}}/>}
            <Icon name={tab.icon} size={20}
              color={isActive?'var(--m-blue)':'var(--m-text3)'}/>
            <span style={{fontSize:9,fontWeight:isActive?700:400,
              color:isActive?'var(--m-blue)':'var(--m-text3)'}}>
              {tab.label()}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// ============================================================
// MAIN
// ============================================================
export default function MobileApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const loc = location.pathname;
  const [user, setUser] = useState(null);
  const [gps, setGps] = useState(null);
  const [now, setNow] = useState(new Date());

  // Apply theme on mount
  useEffect(()=>{ applyTheme(getTheme()); },[]);

  // Clock
  useEffect(()=>{
    const t = setInterval(()=>setNow(new Date()),1000);
    return()=>clearInterval(t);
  },[]);

  // GPS
  useEffect(()=>{
    if(!navigator.geolocation||!user) return;
    const w = navigator.geolocation.watchPosition(
      pos=>setGps({lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy}),
      ()=>{},
      {enableHighAccuracy:true,timeout:10000,maximumAge:5000}
    );
    return()=>navigator.geolocation.clearWatch(w);
  },[user]);

  // Restore session
  useEffect(()=>{
    const saved = localStorage.getItem('cleanit_mobile_user');
    if(saved) try { setUser(JSON.parse(saved)); } catch{}
  },[]);

  const handleLogin = (emp) => {
    setUser(emp);
    localStorage.setItem('cleanit_mobile_user', JSON.stringify(emp));
  };
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cleanit_mobile_user');
  };

  if(!user) return <PageLogin onLogin={handleLogin}/>;

  const parts = loc.split('/').filter(Boolean);
  const activePage = parts[1]||'home';
  const common = {user, gps, navigate, now};

  const getPage = () => {
    if(loc.includes('/camera'))   return <PageCamera {...common}/>;
    if(loc.includes('/profil'))   return <PageProfil {...common} onLogout={handleLogout}/>;
    if(user.role==='bureau')      return <PageHomeBureau {...common}/>;
    return <PageHomeTerrain {...common}/>;
  };

  return (
    <div style={{minHeight:'100vh',background:'var(--m-bg)',fontFamily:"'Segoe UI',system-ui,sans-serif",
      maxWidth:430,margin:'0 auto',position:'relative',display:'flex',flexDirection:'column'}}>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        body{margin:0;overscroll-behavior:none}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        textarea::placeholder,input::placeholder{color:var(--m-text3)}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:var(--m-border);border-radius:3px}
      `}</style>
      {getPage()}
      <BottomNav active={activePage} navigate={navigate} role={user.role}/>
    </div>
  );
}
