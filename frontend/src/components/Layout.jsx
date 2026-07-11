import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getUser, doLogout, api } from '../utils/api';
import { useInactivityLogout } from '../hooks/useInactivityLogout';

const NAV = [
  { section:'OPÉRATIONS', color:'#64748b', items:[
    { path:'/dashboard', label:'Dashboard', roles:['admin','project_manager','hr'], icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path:'/sites', label:'Sites', roles:['admin','project_manager'], icon:'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
    { path:'/technicians', label:'Techniciens', roles:['admin','project_manager','hr'], icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },

    { path:'/planning', label:'Planning', roles:['admin','project_manager'], icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { path:'/terrain', label:'Gestion Terrain', roles:['admin','project_manager'], icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  ]},
  { section:'CLIENT OEM', color:'#f05a5a', items:[
    { path:'/inventaire', label:'Inventaire OEM', roles:['admin','project_manager'], icon:'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { path:'/purchase-orders', label:'Bons de Commande', roles:['admin','project_manager'], icon:'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
  ]},
  { section:'ENTREPRISE', color:'#34c97e', items:[
    { path:'/cleanitbooks', label:'CleanITBooks', roles:['admin'], icon:'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path:'/approvals', label:'Approvals', roles:['admin','project_manager','hr'], icon:'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path:'/contrats', label:'Contrats SLA', roles:['admin','project_manager'], icon:'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { path:'/projets', label:'Projets', roles:['admin','project_manager'], icon:'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
    { path:'/finance', label:'Finance', roles:['admin'], icon:'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path:'/pointage', label:'Pointage & Présence', roles:['admin','hr'], icon:'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path:'/rh', label:'Ressources Humaines', roles:['admin','hr'], icon:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { path:'/crm', label:'CRM Clients', roles:['admin','project_manager'], icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  ]},
  { section:'COMMUNICATION', color:'#0ea5e9', items:[
    { path:'/cleanitcomm', label:'CleanIT Comm', roles:['admin','project_manager','hr'], icon:'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  ]},
  { section:'INTELLIGENCE', color:'#a78bfa', items:[
    { path:'/bi', label:'Business Intelligence', roles:['admin','project_manager'], icon:'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    { path:'/mobile', label:'Application Mobile', roles:['admin','project_manager','hr'], icon:'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { path:'/map', label:'Carte Digital Twin', roles:['admin','project_manager'], icon:'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
    { path:'/ocr', label:'OCR Scanner', roles:['admin'], icon:'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z' },
    { path:'/parametres', label:'Paramètres', roles:['admin'], icon:'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009.6 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9.6a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z' },
  ]},
];

// Fonction de filtrage du menu par rôle + permissions personnalisées
const getNavForRole = (role, moduleAccess) => {
  return NAV.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (role === 'admin') return true; // l'admin garde toujours accès à tout
      if (Array.isArray(moduleAccess)) return moduleAccess.includes(item.path); // permissions personnalisées
      return item.roles.includes(role); // comportement par défaut basé sur le rôle
    })
  })).filter(section => section.items.length > 0);
};

const Icon = ({ path, size=16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
    {path.split(' M').map((d,i) => <path key={i} d={i===0?d:'M'+d} />)}
  </svg>
);

export default function Layout() {
  const nav = useNavigate();
  const loc = useLocation();
  const user = getUser();
  const [hovered, setHovered] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const sidebarRef = useRef(null);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Déconnexion automatique après 1h d'inactivité
  const handleInactivityLogout = useCallback(() => {
    doLogout();
  }, []);
  useInactivityLogout(60 * 60 * 1000, handleInactivityLogout, true);

  useEffect(() => {
    loadNotifs();
    const i = setInterval(loadNotifs, 30000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadNotifs = async () => {
    try {
      const r = await api.get('/notifications');
      setNotifs(Array.isArray(r.data) ? r.data : []);
    } catch {
      setNotifs([
        { id:1, title:'Bienvenue sur CleanIT', message:'Système opérationnel — Bonne journée', type:'success', read:false },
        { id:2, title:'Backend connecté', message:'Vercel API · Neon PostgreSQL · OK', type:'success', read:false },
      ]);
    }
  };



  const unread = notifs.filter(n => !n.read).length;
  const currentSection = NAV.find(s => s.items.some(i => i.path === loc.pathname));
  const currentItem = NAV.flatMap(s => s.items).find(i => i.path === loc.pathname);
  const filteredNav = getNavForRole(user?.role, user?.moduleAccess);

  return (
    <div style={{display:'flex', height:'100vh', overflow:'hidden', background:'#f5f7fa', fontFamily:"'Segoe UI', Arial, sans-serif"}}>

      {/* ===== SIDEBAR ===== */}
      <div
        ref={sidebarRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: hovered ? 240 : 60,
          minWidth: hovered ? 240 : 60,
          background:'linear-gradient(180deg, #0f1b2d 0%, #162032 60%, #0f1b2d 100%)',
          display:'flex', flexDirection:'column',
          transition:'width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1)',
          overflow:'hidden', flexShrink:0,
          boxShadow: hovered ? '4px 0 24px rgba(0,0,0,0.25)' : '2px 0 8px rgba(0,0,0,0.15)',
          zIndex:100,
        }}>

        {/* Logo */}
        <div style={{padding:'18px 0', display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid rgba(255,255,255,0.07)', cursor:'pointer', justifyContent: hovered?'flex-start':'center', paddingLeft: hovered?16:0}} onClick={() => nav('/dashboard')}>
          <div style={{width:34,height:34,borderRadius:8,overflow:'hidden',flexShrink:0,marginLeft:hovered?0:13,display:'flex',alignItems:'center',justifyContent:'center',background:'#fff'}}>
            <img src="/logo.png" alt="CleanIT" style={{width:34,height:34,objectFit:'contain'}} onError={e=>{e.target.style.display='none';}}/>
          </div>
          {hovered && (
            <div>
              <div style={{fontSize:14, fontWeight:800, color:'white', letterSpacing:'-0.3px', whiteSpace:'nowrap'}}>CleanIT ERP</div>
              <div style={{fontSize:9, color:'#4f8ef7', whiteSpace:'nowrap', fontWeight:600}}>Client Partner · Cameroun</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <div style={{flex:1, overflowY:'auto', overflowX:'hidden', padding:'8px 0'}}>
          {filteredNav.map(section => (
            <div key={section.section}>
              {hovered && (
                <div style={{padding:'10px 16px 4px', fontSize:9, fontWeight:800, color:section.color, textTransform:'uppercase', letterSpacing:'1.5px', whiteSpace:'nowrap', opacity:0.9}}>
                  {section.section}
                </div>
              )}
              {!hovered && <div style={{height:8}} />}
              {section.items.map(item => {
                const active = loc.pathname === item.path;
                return (
                  <button key={item.path} onClick={() => item.path==='/mobile' ? window.open('/mobile','_blank') : nav(item.path)} title={!hovered ? item.label : ''}
                    style={{
                      width:'100%', padding: hovered ? '9px 16px' : '10px 0',
                      border:'none', background: active ? `${section.color}20` : 'transparent',
                      color: active ? section.color : '#8899aa',
                      cursor:'pointer', display:'flex', alignItems:'center',
                      gap: hovered ? 10 : 0, fontSize:13,
                      fontWeight: active ? 600 : 400,
                      borderLeft: active ? `3px solid ${section.color}` : '3px solid transparent',
                      transition:'all .15s', justifyContent: hovered ? 'flex-start' : 'center',
                      whiteSpace:'nowrap', overflow:'hidden',
                    }}
                    onMouseEnter={e => { if(!active){ e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='#ccd6e0'; }}}
                    onMouseLeave={e => { if(!active){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#8899aa'; }}}>
                    <div style={{display:'flex', justifyContent:'center', width: hovered?'auto':34, flexShrink:0}}>
                      <Icon path={item.icon} size={16} />
                    </div>
                    {hovered && <span style={{overflow:'hidden', textOverflow:'ellipsis'}}>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{borderTop:'1px solid rgba(255,255,255,0.07)', padding:'8px 0'}}>
          <button onClick={doLogout} title={!hovered?'Déconnexion':''}
            style={{width:'100%', padding: hovered?'9px 16px':'10px 0', border:'none', background:'transparent', color:'#ef4444', cursor:'pointer', display:'flex', alignItems:'center', gap:10, fontSize:13, justifyContent: hovered?'flex-start':'center', transition:'all .15s'}}
            onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            <div style={{display:'flex', justifyContent:'center', width: hovered?'auto':34, flexShrink:0}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            </div>
            {hovered && 'Déconnexion'}
          </button>
        </div>
      </div>

      {/* ===== MAIN ===== */}
      <div style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden'}}>

        {/* TOPBAR */}
        <div style={{height:56, background:'#fafafa', borderBottom:'1px solid #e8ecf0', display:'flex', alignItems:'center', padding:'0 20px', gap:12, flexShrink:0, boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>

          {/* Breadcrumb */}
          <div style={{flex:1, display:'flex', alignItems:'center', gap:6, fontSize:13}}>
            <span style={{color:'#94a3b8', fontSize:12}}>CleanIT ERP</span>
            {currentSection && <>
              <span style={{color:'#d1d5db'}}>›</span>
              <span style={{color:currentSection.color, fontWeight:600, fontSize:12}}>{currentSection.section}</span>
            </>}
            {currentItem && <>
              <span style={{color:'#d1d5db'}}>›</span>
              <span style={{fontWeight:700, color:'#1e293b', fontSize:13}}>{currentItem.label}</span>
            </>}
          </div>

          {/* Notifs */}
          <div style={{position:'relative'}} ref={notifRef}>
            <button onClick={() => {setShowNotif(!showNotif); setShowProfile(false);}}
              style={{width:38, height:38, borderRadius:10, border:'1px solid #e8ecf0', background:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', transition:'all .2s'}}
              onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background='white'}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              {unread > 0 && <span style={{position:'absolute', top:7, right:7, width:8, height:8, borderRadius:'50%', background:'#ef4444', border:'2px solid white'}} />}
            </button>
            {showNotif && (
              <div style={{position:'absolute', top:'calc(100% + 8px)', right:0, width:320, background:'white', borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.12)', border:'1px solid #e8ecf0', zIndex:9999, overflow:'hidden'}}>
                <div style={{padding:'12px 16px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <span style={{fontWeight:700, fontSize:14, color:'#1e293b'}}>Notifications</span>
                  {unread>0 && <span style={{padding:'2px 8px', borderRadius:10, background:'#fef2f2', color:'#dc2626', fontSize:11, fontWeight:700}}>{unread} non lues</span>}
                </div>
                <div style={{maxHeight:280, overflowY:'auto'}}>
                  {notifs.map(n => (
                    <div key={n.id} style={{padding:'10px 16px', borderBottom:'1px solid #f8fafc', background: n.read?'white':'#f0f7ff', display:'flex', gap:10, cursor:'pointer'}}
                      onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background= n.read?'white':'#f0f7ff'}>
                      <div style={{width:8, height:8, borderRadius:'50%', background: n.type==='error'?'#ef4444':n.type==='warning'?'#f59e0b':'#22c55e', flexShrink:0, marginTop:5}} />
                      <div>
                        <div style={{fontSize:13, fontWeight:600, color:'#1e293b'}}>{n.title}</div>
                        <div style={{fontSize:12, color:'#64748b', marginTop:1}}>{n.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div style={{position:'relative'}} ref={profileRef}>
            <button onClick={() => {setShowProfile(!showProfile); setShowNotif(false);}}
              style={{display:'flex', alignItems:'center', gap:9, background:'white', border:'1px solid #e8ecf0', borderRadius:10, cursor:'pointer', padding:'5px 12px 5px 5px', transition:'all .2s'}}
              onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background='white'}>
              <div style={{width:32, height:32, borderRadius:8, overflow:'hidden', flexShrink:0, background:'linear-gradient(135deg,#334155,#475569)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:13}}>
                {user?.avatar_url || user?.photoUrl
                  ? <img src={user.avatar_url||user.photoUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{e.target.style.display='none';}}/>
                  : (user?.firstName?.[0]?.toUpperCase() || 'U')
                }
              </div>
              <div style={{textAlign:'left'}}>
                <div style={{fontSize:13, fontWeight:700, color:'#1e293b', lineHeight:1.2, whiteSpace:'nowrap'}}>{user?.firstName} {user?.lastName}</div>
                <div style={{fontSize:10, color:'#94a3b8', textTransform:'capitalize'}}>{user?.role}</div>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{transform: showProfile?'rotate(180deg)':'none', transition:'transform .2s'}}><path d="M19 9l-7 7-7-7"/></svg>
            </button>

            {showProfile && (
              <div style={{position:'absolute', top:'calc(100% + 8px)', right:0, width:220, background:'white', borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.12)', border:'1px solid #e8ecf0', zIndex:9999, overflow:'hidden'}}>
                {/* Header profil */}
                <div style={{padding:'16px', background:'linear-gradient(135deg,#0f1b2d,#162032)', color:'white'}}>
                  <div style={{display:'flex', alignItems:'center', gap:10}}>
                    <div style={{width:40, height:40, borderRadius:10, background:'linear-gradient(135deg,#334155,#475569)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:16}}>
                      {user?.firstName?.[0]?.toUpperCase()||'U'}
                    </div>
                    <div>
                      <div style={{fontWeight:700, fontSize:14}}>{user?.firstName} {user?.lastName}</div>
                      <div style={{fontSize:11, opacity:0.7}}>{user?.email}</div>
                      <div style={{fontSize:10, color:'#4f8ef7', fontWeight:600, textTransform:'capitalize', marginTop:2}}>{user?.role}</div>
                    </div>
                  </div>
                </div>
                {/* Menu items */}
                <div style={{padding:'6px'}}>
                  {[
                    { icon:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label:'Mon profil', path:'/profile', section:'profil' },
                    { icon:'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', label:'Paramètres', path:'/profile', section:'notifications' },
                  ].map(item => (
                    <button key={item.label} onClick={() => { setShowProfile(false); nav(item.path); }} style={{width:'100%', padding:'9px 12px', border:'none', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', gap:10, fontSize:13, color:'#374151', borderRadius:8, transition:'all .15s'}}
                      onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <div style={{width:28, height:28, borderRadius:7, background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8">
                          {item.icon.split(' M').map((d,i) => <path key={i} d={i===0?d:'M'+d} />)}
                        </svg>
                      </div>
                      {item.label}
                    </button>
                  ))}
                  <div style={{height:1, background:'#f1f5f9', margin:'4px 0'}} />
                  <button onClick={doLogout} style={{width:'100%', padding:'8px 10px', border:'none', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#ef4444', borderRadius:8, transition:'all .15s'}}
                    onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PAGE */}
        <div style={{flex:1, overflow:'auto'}}>
          <Outlet />
        </div>
      </div>

    </div>
  );
}
