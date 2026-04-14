import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getUser, doLogout, api } from '../utils/api';

const NAV = [
  { section:'OPÉRATIONS', color:'#0078d4', items:[
    { path:'/dashboard', label:'Dashboard', icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path:'/sites', label:'Sites Réseau', icon:'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
    { path:'/tickets', label:'Tickets', icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { path:'/technicians', label:'Techniciens', icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { path:'/interventions', label:'Interventions', icon:'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    { path:'/planning', label:'Planning', icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ]},
  { section:'HUAWEI OEM', color:'#dc2626', items:[
    { path:'/inventaire', label:'Inventaire OEM', icon:'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { path:'/contrats', label:'Contrats SLA', icon:'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { path:'/mediation', label:'Médiation KPIs', icon:'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { path:'/provisioning', label:'Provisioning', icon:'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064' },
    { path:'/evidence', label:'Evidence Packs', icon:'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
    { path:'/purchase-orders', label:'Bons de Commande', icon:'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
  ]},
  { section:'ENTREPRISE', color:'#16a34a', items:[
    { path:'/crm', label:'CRM Clients', icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { path:'/finance', label:'Finance', icon:'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path:'/rh', label:'Ressources Humaines', icon:'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { path:'/map', label:'Carte Digital Twin', icon:'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
    { path:'/meteo', label:'Météo Sites', icon:'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z' },
    { path:'/messaging', label:'Messagerie', icon:'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  ]},
  { section:'INTELLIGENCE', color:'#7c3aed', items:[
    { path:'/analytics', label:'Analytics KPIs', icon:'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { path:'/bi', label:'Business Intelligence', icon:'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    { path:'/ai', label:'IA Prédictive', icon:'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  ]},
];

const Icon = ({ path, size=18, color='currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
    {path.split(' M').map((d,i) => <path key={i} d={i===0?d:'M'+d} />)}
  </svg>
);

export default function Layout() {
  const nav = useNavigate();
  const loc = useLocation();
  const user = getUser();
  const [collapsed, setCollapsed] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ 'OPÉRATIONS':true, 'HUAWEI OEM':true, 'ENTREPRISE':true, 'INTELLIGENCE':true });

  useEffect(() => {
    loadNotifs();
    const i = setInterval(loadNotifs, 30000);
    return () => clearInterval(i);
  }, []);

  const loadNotifs = async () => {
    try {
      const r = await api.get('/notifications');
      setNotifs(Array.isArray(r.data) ? r.data : []);
    } catch {
      setNotifs([
        { id:1, title:'Alarme critique', message:'LINK_DOWN BBU-01 — YDE-003', type:'error', read:false, createdAt:new Date() },
        { id:2, title:'Ticket assigné', message:'TK-1042 Réparation urgente fibre', type:'warning', read:false, createdAt:new Date() },
        { id:3, title:'Intervention validée', message:'BFS-001 Validée Huawei ✓', type:'success', read:true, createdAt:new Date() },
      ]);
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const msg = { role:'user', content:chatInput, time:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) };
    setChatMsgs(p => [...p, msg]);
    const q = chatInput; setChatInput(''); setChatLoading(true);
    try {
      const r = await api.post('/ai/chat', { message: q });
      setChatMsgs(p => [...p, { role:'assistant', content: r.data.reply || r.data.message || 'Réponse IA', time:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) }]);
    } catch {
      const replies = {
        'sites':'Vous avez 15 sites actifs au Cameroun. 3 sont en alerte: DLA-003, YDE-003, KRI-001. Je recommande une intervention prioritaire sur YDE-003.',
        'ticket':'38 tickets ouverts actuellement. 4 sont critiques et nécessitent une attention immédiate. Voulez-vous que je génère un rapport?',
        'technicien':'18 techniciens disponibles sur 24. Thomas Ngono est le plus proche du site YDE-003 (12 km).',
        'rapport':'Je peux générer un rapport PDF ou Excel. Quel module voulez-vous analyser?',
        'default':`Bonjour ${user?.firstName || ''} ! Je suis l'agent IA CleanIT. Je peux analyser vos données réseau, suggérer des interventions et automatiser vos processus. Comment puis-je vous aider?`
      };
      const key = Object.keys(replies).find(k => q.toLowerCase().includes(k)) || 'default';
      setChatMsgs(p => [...p, { role:'assistant', content:replies[key], time:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) }]);
    }
    setChatLoading(false);
  };

  const unread = notifs.filter(n => !n.read).length;
  const currentLabel = NAV.flatMap(s=>s.items).find(i=>i.path===loc.pathname)?.label || 'Dashboard';
  const currentSection = NAV.find(s=>s.items.some(i=>i.path===loc.pathname));
  const accentColor = currentSection?.color || '#0078d4';

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'#f0f2f5' }}>

      {/* ===== SIDEBAR ===== */}
      <div style={{ width:collapsed?56:230, background:'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)', display:'flex', flexDirection:'column', transition:'width 0.25s cubic-bezier(0.4,0,0.2,1)', flexShrink:0, overflow:'hidden', boxShadow:'4px 0 20px rgba(0,0,0,0.15)', zIndex:50 }}>

        {/* Logo */}
        <div style={{ padding:'16px 12px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:10, minHeight:64, cursor:'pointer' }} onClick={() => setCollapsed(!collapsed)}>
          <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#0078d4,#00bcf2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 12px rgba(0,120,212,0.4)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          {!collapsed && (
            <div style={{ overflow:'hidden' }}>
              <div style={{ fontSize:14, fontWeight:800, color:'white', letterSpacing:'-0.3px', whiteSpace:'nowrap' }}>CleanIT ERP</div>
              <div style={{ fontSize:9, color:'#64748b', whiteSpace:'nowrap' }}>Huawei Partner · Cameroun</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'8px 0' }}>
          {NAV.map(section => (
            <div key={section.section}>
              {!collapsed && (
                <button onClick={() => setExpandedSections(p => ({...p,[section.section]:!p[section.section]}))}
                  style={{ width:'100%', padding:'8px 14px 4px', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:9, fontWeight:800, color:section.color, textTransform:'uppercase', letterSpacing:'1px' }}>{section.section}</span>
                  <span style={{ color:'#475569', fontSize:10, transform: expandedSections[section.section]?'rotate(180deg)':'none', transition:'transform .2s' }}>▲</span>
                </button>
              )}
              {(collapsed || expandedSections[section.section]) && section.items.map(item => {
                const active = loc.pathname === item.path;
                return (
                  <button key={item.path} onClick={() => nav(item.path)} title={collapsed ? item.label : ''}
                    style={{ width:'100%', padding: collapsed?'10px 0':'8px 14px', border:'none', background: active?`${section.color}20`:'transparent', color: active?section.color:'#64748b', cursor:'pointer', display:'flex', alignItems:'center', gap:9, fontSize:12.5, fontWeight: active?600:400, borderLeft:`2px solid ${active?section.color:'transparent'}`, transition:'all .15s', justifyContent: collapsed?'center':'flex-start', whiteSpace:'nowrap', overflow:'hidden' }}
                    onMouseEnter={e => { if(!active){ e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='#e2e8f0'; }}}
                    onMouseLeave={e => { if(!active){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#64748b'; }}}>
                    <Icon path={item.icon} size={15} color={active?section.color:'currentColor'} />
                    {!collapsed && item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer sidebar */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'8px 0' }}>
          <button onClick={doLogout} title={collapsed?'Déconnexion':''}
            style={{ width:'100%', padding: collapsed?'10px 0':'9px 14px', border:'none', background:'transparent', color:'#ef4444', cursor:'pointer', display:'flex', alignItems:'center', gap:9, fontSize:12.5, justifyContent:collapsed?'center':'flex-start' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            {!collapsed && 'Déconnexion'}
          </button>
        </div>
      </div>

      {/* ===== MAIN AREA ===== */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* TOPBAR */}
        <div style={{ height:54, background:'white', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', padding:'0 20px', gap:12, flexShrink:0, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          {/* Breadcrumb */}
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
            <span style={{ color:'#94a3b8' }}>CleanIT ERP</span>
            <span style={{ color:'#cbd5e1' }}>›</span>
            {currentSection && <><span style={{ color:currentSection.color, fontWeight:600 }}>{currentSection.section}</span><span style={{ color:'#cbd5e1' }}>›</span></>}
            <span style={{ fontWeight:700, color:'#1e293b' }}>{currentLabel}</span>
          </div>

          {/* Agent IA Button */}
          <button onClick={() => setShowChat(!showChat)}
            style={{ padding:'6px 14px', borderRadius:8, border:`1px solid ${showChat?'#7c3aed':'#e2e8f0'}`, background: showChat?'#7c3aed':'white', color: showChat?'white':'#7c3aed', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:6, transition:'all .2s' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            Agent IA
          </button>

          {/* Notifications */}
          <div style={{ position:'relative' }}>
            <button onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
              style={{ width:36, height:36, borderRadius:8, border:'1px solid #e2e8f0', background:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              {unread > 0 && <span style={{ position:'absolute', top:6, right:6, width:8, height:8, borderRadius:'50%', background:'#ef4444', border:'2px solid white' }} />}
            </button>
            {showNotif && (
              <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, width:320, background:'white', borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.12)', border:'1px solid #e2e8f0', zIndex:9999, overflow:'hidden' }}>
                <div style={{ padding:'12px 16px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontWeight:700, fontSize:14, color:'#1e293b' }}>Notifications</span>
                  {unread > 0 && <span style={{ padding:'2px 8px', borderRadius:10, background:'#fef2f2', color:'#dc2626', fontSize:11, fontWeight:700 }}>{unread} non lues</span>}
                </div>
                <div style={{ maxHeight:280, overflowY:'auto' }}>
                  {notifs.map(n => (
                    <div key={n.id} style={{ padding:'10px 16px', borderBottom:'1px solid #f8fafc', background: n.read?'white':'#f0f7ff', display:'flex', gap:10, cursor:'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background= n.read?'white':'#f0f7ff'}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background: n.type==='error'?'#ef4444':n.type==='warning'?'#f59e0b':'#22c55e', flexShrink:0, marginTop:5 }} />
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{n.title}</div>
                        <div style={{ fontSize:12, color:'#64748b', marginTop:1 }}>{n.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div style={{ position:'relative' }}>
            <button onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
              style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'1px solid #e2e8f0', borderRadius:10, cursor:'pointer', padding:'4px 10px 4px 4px' }}>
              <div style={{ width:30, height:30, borderRadius:8, background:`linear-gradient(135deg,${accentColor},#00bcf2)`, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:13 }}>
                {user?.firstName?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ textAlign:'left' }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#1e293b', lineHeight:1.2 }}>{user?.firstName} {user?.lastName}</div>
                <div style={{ fontSize:10, color:'#94a3b8' }}>{user?.role}</div>
              </div>
            </button>
            {showProfile && (
              <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, width:200, background:'white', borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.12)', border:'1px solid #e2e8f0', zIndex:9999, overflow:'hidden' }}>
                <div style={{ padding:'14px 16px', background:`linear-gradient(135deg,#1e3a5f,${accentColor})`, color:'white' }}>
                  <div style={{ fontSize:14, fontWeight:700 }}>{user?.firstName} {user?.lastName}</div>
                  <div style={{ fontSize:11, opacity:0.8 }}>{user?.email}</div>
                </div>
                <div style={{ padding:8 }}>
                  <button onClick={doLogout} style={{ width:'100%', padding:'9px 12px', border:'none', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#ef4444', borderRadius:8 }}
                    onMouseEnter={e=>e.currentTarget.style.background='#fef2f2'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div style={{ flex:1, overflow:'auto' }} onClick={() => { setShowNotif(false); setShowProfile(false); }}>
          <Outlet />
        </div>
      </div>

      {/* ===== AGENT IA PANEL ===== */}
      {showChat && (
        <div style={{ width:340, background:'white', borderLeft:'1px solid #e2e8f0', display:'flex', flexDirection:'column', boxShadow:'-4px 0 20px rgba(0,0,0,0.06)', flexShrink:0 }}>
          <div style={{ padding:'14px 16px', background:'linear-gradient(135deg,#4c1d95,#7c3aed)', color:'white', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                Agent IA CleanIT
              </div>
              <div style={{ fontSize:10, opacity:0.75, marginTop:2 }}>Powered by Claude · OpenCAW Ready</div>
            </div>
            <button onClick={() => setShowChat(false)} style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'white', width:26, height:26, borderRadius:'50%', cursor:'pointer', fontSize:14 }}>✕</button>
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:12, display:'flex', flexDirection:'column', gap:10, background:'#f8fafc' }}>
            {chatMsgs.length === 0 && (
              <div style={{ textAlign:'center', padding:'20px 10px' }}>
                <div style={{ width:48, height:48, borderRadius:'50%', background:'#f5f3ff', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                </div>
                <div style={{ fontSize:14, fontWeight:700, color:'#1e293b', marginBottom:4 }}>Agent IA CleanIT</div>
                <div style={{ fontSize:12, color:'#64748b', marginBottom:14 }}>Je peux analyser vos données, suggérer des actions et automatiser vos processus.</div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {['Montrer les sites en alerte','Analyser les KPIs réseau','Technicien disponible le plus proche','Importer un bon de commande PO','Générer rapport performance'].map(s => (
                    <button key={s} onClick={() => setChatInput(s)}
                      style={{ padding:'7px 12px', borderRadius:20, border:'1px solid #ede9fe', background:'white', color:'#7c3aed', fontSize:12, cursor:'pointer', textAlign:'left', fontWeight:500 }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chatMsgs.map((m,i) => (
              <div key={i} style={{ display:'flex', flexDirection: m.role==='user'?'row-reverse':'row', gap:8, alignItems:'flex-end' }}>
                {m.role==='assistant' && (
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'#7c3aed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                  </div>
                )}
                <div style={{ maxWidth:'80%' }}>
                  <div style={{ padding:'9px 13px', borderRadius: m.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px', background: m.role==='user'?'#7c3aed':'white', color: m.role==='user'?'white':'#1e293b', fontSize:13, lineHeight:1.5, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border: m.role==='assistant'?'1px solid #f1f5f9':'none' }}>
                    {m.content}
                  </div>
                  <div style={{ fontSize:10, color:'#94a3b8', marginTop:3, textAlign: m.role==='user'?'right':'left' }}>{m.time}</div>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'#7c3aed', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                </div>
                <div style={{ padding:'9px 13px', borderRadius:'16px 16px 16px 4px', background:'white', border:'1px solid #f1f5f9', display:'flex', gap:4, alignItems:'center' }}>
                  {[0,1,2].map(j => <div key={j} style={{ width:6, height:6, borderRadius:'50%', background:'#94a3b8', animation:`bounce 1s ${j*0.2}s infinite` }} />)}
                </div>
              </div>
            )}
          </div>

          <div style={{ padding:'10px 12px', borderTop:'1px solid #e2e8f0' }}>
            <div style={{ display:'flex', gap:8, alignItems:'center', background:'#f8fafc', borderRadius:24, padding:'8px 14px', border:'1px solid #e2e8f0' }}>
              <input placeholder="Question à l'agent IA..." value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat();} }}
                style={{ flex:1, border:'none', background:'transparent', fontSize:13, outline:'none', color:'#1e293b' }} />
              <button onClick={sendChat} disabled={!chatInput.trim()}
                style={{ background: chatInput.trim()?'#7c3aed':'#e2e8f0', border:'none', borderRadius:'50%', width:30, height:30, cursor: chatInput.trim()?'pointer':'default', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}
