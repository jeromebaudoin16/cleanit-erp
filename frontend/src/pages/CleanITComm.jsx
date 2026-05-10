import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

// ═══════════════════════════════════════════════════════════════════
//  CLEANIT COMM — Chat · Réunions · Email · Cloud Drive
//  Inspiré de WeLink Huawei
// ═══════════════════════════════════════════════════════════════════

const API = 'https://cleanit-erp-production.up.railway.app';

// ── Couleurs ────────────────────────────────────────────────────────
const C = {
  navy:    '#0f172a',
  navy2:   '#1e293b',
  navy3:   '#334155',
  blue:    '#2563eb',
  blue_l:  '#eff6ff',
  blue_m:  '#dbeafe',
  green:   '#16a34a',
  green_l: '#f0fdf4',
  red:     '#dc2626',
  red_l:   '#fef2f2',
  orange:  '#ea580c',
  purple:  '#7c3aed',
  purple_l:'#f5f3ff',
  gray:    '#6b7280',
  bg:      '#f1f5f9',
  white:   '#ffffff',
  border:  '#e2e8f0',
  text:    '#0f172a',
  text2:   '#374151',
  text3:   '#6b7280',
  text4:   '#9ca3af',
  shadow:  '0 1px 3px rgba(0,0,0,.08)',
  shadow2: '0 4px 20px rgba(0,0,0,.12)',
};

// ── Données initiales ───────────────────────────────────────────────
const CONTACTS = [
  {id:'u1', nom:'Marie Kamga',   poste:'Chef de Projet',    dept:'Operations', avatar:'MK', couleur:'#2563eb', status:'online',  email:'m.kamga@cleanit.cm'},
  {id:'u2', nom:'Jean Fouda',    poste:'Project Manager',   dept:'Operations', avatar:'JF', couleur:'#7c3aed', status:'online',  email:'j.fouda@cleanit.cm'},
  {id:'u3', nom:'Alice Finance', poste:'Dir. Financière',   dept:'Finance',    avatar:'AF', couleur:'#be185d', status:'busy',    email:'a.finance@cleanit.cm'},
  {id:'u4', nom:'Bob Comptable', poste:'Chef Comptable',    dept:'Finance',    avatar:'BC', couleur:'#0891b2', status:'offline', email:'b.comptable@cleanit.cm'},
  {id:'u5', nom:'Pierre Etoga', poste:'Ingénieur Réseau',  dept:'Technique',  avatar:'PE', couleur:'#d97706', status:'online',  email:'p.etoga@cleanit.cm'},
  {id:'u6', nom:'Aline Biya',   poste:'Responsable RH',   dept:'RH',         avatar:'AB', couleur:'#dc2626', status:'online',  email:'a.biya@cleanit.cm'},
  {id:'u7', nom:'David Mballa', poste:'Analyste BI',       dept:'Finance',    avatar:'DM', couleur:'#059669', status:'away',    email:'d.mballa@cleanit.cm'},
  {id:'u8', nom:'Thomas Ngono', poste:'Technicien Réseau', dept:'Terrain',    avatar:'TN', couleur:'#ea580c', status:'online',  email:'t.ngono@cleanit.cm'},
];

const CHANNELS = [
  {id:'ch1', nom:'general',         desc:'Canal général CleanIT',           icon:'#', type:'public',  members:8,  unread:3},
  {id:'ch2', nom:'terrain-douala',  desc:'Techniciens terrain Douala',      icon:'#', type:'public',  members:5,  unread:0},
  {id:'ch3', nom:'finance',         desc:'Équipe Finance & Comptabilité',   icon:'#', type:'private', members:3,  unread:1},
  {id:'ch4', nom:'chefs-projet',    desc:'Réunions chefs de projet',        icon:'#', type:'private', members:4,  unread:0},
  {id:'ch5', nom:'alertes-terrain', desc:'Alertes géofencing automatiques', icon:'🚨',type:'system',  members:8,  unread:5},
  {id:'ch6', nom:'annonces',        desc:'Annonces de la direction',        icon:'📢',type:'system',  members:8,  unread:1},
];

const NOW = Date.now();
const MESSAGES_INIT = {
  ch1: [
    {id:'m1', userId:'u1', text:'Bonjour équipe ! Réunion de suivi projet à 10h ce matin.', ts:NOW-7200000, type:'text'},
    {id:'m2', userId:'u2', text:'Reçu Marie. Je prépare le rapport d\'avancement DLA-001.', ts:NOW-7100000, type:'text'},
    {id:'m3', userId:'u5', text:'Les équipements 5G sont arrivés sur site. On commence l\'installation.', ts:NOW-3600000, type:'text'},
    {id:'m4', userId:'u1', text:'Parfait Pierre ! N\'oubliez pas le rapport photo pour le client.', ts:NOW-3500000, type:'text'},
    {id:'m5', userId:'u8', text:'Selfie de présence envoyé via CleanITCam ✅', ts:NOW-1800000, type:'text'},
    {id:'m6', userId:'u3', text:'La facture INV-2024-003 a été payée partiellement ce matin. Solde : 22.4M FCFA', ts:NOW-900000, type:'alert', alertType:'finance'},
  ],
  ch5: [
    {id:'a1', userId:'system', text:'⚠️ Ali Moussa est hors zone sur GAR-001 — Distance: 650m du périmètre', ts:NOW-7200000, type:'alert', alertType:'geofence'},
    {id:'a2', userId:'system', text:'🔋 Batterie critique (23%) — Ali Moussa · Site Garoua', ts:NOW-3600000, type:'alert', alertType:'battery'},
    {id:'a3', userId:'u1', text:'Ali contacté. Il retourne sur la zone dans 10 minutes.', ts:NOW-3000000, type:'text'},
    {id:'a4', userId:'system', text:'✅ Ali Moussa est revenu dans la zone autorisée', ts:NOW-2400000, type:'alert', alertType:'ok'},
    {id:'a5', userId:'system', text:'⚠️ Thomas Ngono — Sortie de zone momentanée DLA-001 · 45m', ts:NOW-600000, type:'alert', alertType:'geofence'},
  ],
  ch2: [
    {id:'t1', userId:'u8', text:'Arrivé sur site DLA-001. Équipe de 3 personnes présente.', ts:NOW-18000000, type:'text'},
    {id:'t2', userId:'u5', text:'Commencé l\'installation des BBU. Tout se passe bien.', ts:NOW-14400000, type:'text'},
    {id:'t3', userId:'u1', text:'Super ! Prenez des photos de chaque étape pour le rapport Huawei.', ts:NOW-10800000, type:'text'},
  ],
};

const MEETINGS_INIT = [
  {id:'meet1', titre:'Réunion suivi DLA-001',      date:'2024-05-08', heure:'10:00', duree:60,  participants:['u1','u2','u5'],   statut:'today',    room:'cleanit-dla-001'},
  {id:'meet2', titre:'Point hebdo Finance',         date:'2024-05-08', heure:'14:00', duree:30,  participants:['u3','u4','u1'],   statut:'today',    room:'cleanit-finance-weekly'},
  {id:'meet3', titre:'Review client MTN Cameroun',  date:'2024-05-09', heure:'09:00', duree:90,  participants:['u1','u2','u3'],   statut:'upcoming', room:'cleanit-mtn-review'},
  {id:'meet4', titre:'Briefing terrain Garoua',     date:'2024-05-09', heure:'07:00', duree:20,  participants:['u1','u8','u5'],   statut:'upcoming', room:'cleanit-garoua-brief'},
  {id:'meet5', titre:'Revue mensuelle CleanIT',     date:'2024-05-01', heure:'09:00', duree:120, participants:['u1','u2','u3','u4','u5','u6','u7'], statut:'done', room:'cleanit-monthly'},
];

const EMAILS_INIT = [
  {id:'e1', from:'mtn.cameroun@mtn.cm',       fromName:'MTN Cameroun',         subject:'RE: Facture INV-2024-001 — Paiement effectué',    preview:'Bonjour, Veuillez trouver ci-joint le virement de 53,935,625 FCFA...', date:new Date(NOW-86400000).toISOString(), lu:true,   starred:true,  dossier:'inbox', pj:1},
  {id:'e2', from:'dg.marchespublics.cm',       fromName:'Marchés Publics CM',   subject:'Contrat GAR-001 — Signature requise avant le 15/05', preview:'Monsieur, Le contrat d\'infrastructure telecom zones rurales...', date:new Date(NOW-172800000).toISOString(), lu:false,  starred:false, dossier:'inbox', pj:2},
  {id:'e3', from:'c.wei@huawei.com',           fromName:'Chen Wei — Huawei',    subject:'BC-2024-143 — Mise à jour planning livraison',       preview:'Dear team, Following our last discussion regarding...', date:new Date(NOW-259200000).toISOString(), lu:false,  starred:true,  dossier:'inbox', pj:0},
  {id:'e4', from:'p.etoga@cleanit.cm',         fromName:'Pierre Etoga',         subject:'Rapport installation 5G NR DLA-001 — Phase 2',       preview:'Bonjour Marie, Voici le rapport d\'avancement de la phase 2...', date:new Date(NOW-345600000).toISOString(), lu:true,   starred:false, dossier:'inbox', pj:3},
  {id:'e5', from:'no-reply@cleanit.cm',        fromName:'CleanIT ERP',          subject:'[AUTO] Alerte hors zone — Ali Moussa · GAR-001',     preview:'ALERTE GÉOFENCING: Ali Moussa a été détecté hors du périmètre...', date:new Date(NOW-7200000).toISOString(),  lu:false,  starred:false, dossier:'inbox', pj:0},
  {id:'e6', from:'a.biya@cleanit.cm',          fromName:'Aline Biya',           subject:'Bulletins de paie Mars 2024 — Distribution',         preview:'Bonjour à tous, Les bulletins de paie du mois de mars...', date:new Date(NOW-432000000).toISOString(), lu:true,   starred:false, dossier:'inbox', pj:7},
];

const DRIVE_INIT = [
  {id:'f1',  nom:'Rapport_Installation_5G_DLA001_Phase1.pdf',   type:'pdf',   taille:'2.4 MB', modif:new Date(NOW-86400000).toISOString(),  owner:'u1', shared:true,  folder:'Projets/DLA-001'},
  {id:'f2',  nom:'Facture_INV-2024-001_MTN.pdf',                 type:'pdf',   taille:'890 KB', modif:new Date(NOW-172800000).toISOString(), owner:'u3', shared:false, folder:'Finance/Factures'},
  {id:'f3',  nom:'Planning_Techniciens_Mai2024.xlsx',            type:'excel', taille:'1.2 MB', modif:new Date(NOW-259200000).toISOString(), owner:'u1', shared:true,  folder:'Plannings'},
  {id:'f4',  nom:'BC-2024-143_Huawei_Confidentiel.pdf',         type:'pdf',   taille:'4.1 MB', modif:new Date(NOW-345600000).toISOString(), owner:'u1', shared:false, folder:'Projets/DLA-001'},
  {id:'f5',  nom:'Bulletin_Paie_Mars2024_Equipe.zip',           type:'zip',   taille:'8.7 MB', modif:new Date(NOW-432000000).toISOString(), owner:'u6', shared:false, folder:'RH/Paie'},
  {id:'f6',  nom:'Photos_Site_GAR001_Inspection.zip',           type:'zip',   taille:'45 MB',  modif:new Date(NOW-518400000).toISOString(), owner:'u8', shared:true,  folder:'Projets/GAR-001'},
  {id:'f7',  nom:'Contrat_Maintenance_Orange_2024.docx',        type:'word',  taille:'320 KB', modif:new Date(NOW-604800000).toISOString(), owner:'u2', shared:true,  folder:'Commercial'},
  {id:'f8',  nom:'Procedure_HSE_Travaux_Hauteur.pdf',           type:'pdf',   taille:'1.8 MB', modif:new Date(NOW-691200000).toISOString(), owner:'u6', shared:true,  folder:'HSE'},
  {id:'f9',  nom:'Dashboard_KPIs_Q1_2024.xlsx',                 type:'excel', taille:'2.2 MB', modif:new Date(NOW-777600000).toISOString(), owner:'u7', shared:true,  folder:'Finance/Reporting'},
  {id:'f10', nom:'Guide_Installation_5G_NR_V3.pdf',             type:'pdf',   taille:'12 MB',  modif:new Date(NOW-864000000).toISOString(), owner:'u5', shared:true,  folder:'Technique'},
];

// ── Helpers ─────────────────────────────────────────────────────────
const fmtTime = d => {
  const now = new Date(), dt = new Date(d);
  const diff = now - dt;
  if(diff < 60000) return 'À l\'instant';
  if(diff < 3600000) return Math.floor(diff/60000)+'m';
  if(diff < 86400000) return fmtT(d);
  return dt.toLocaleDateString('fr-FR',{day:'2-digit',month:'short'});
};
const fmtT  = d => new Date(d).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
const fmtDt = d => new Date(d).toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit',month:'short'});
const getUser = id => CONTACTS.find(u=>u.id===id);
const statusColor = s => s==='online'?'#16a34a':s==='busy'?'#dc2626':s==='away'?'#d97706':'#9ca3af';

// ── Composants UI ────────────────────────────────────────────────────
const Av = ({i,color,size=32,status,online}) => (
  <div style={{position:'relative',display:'inline-flex',flexShrink:0}}>
    <div style={{width:size,height:size,borderRadius:size*.28,background:color||C.gray,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:size*.34,letterSpacing:-.5,boxShadow:`0 2px 8px ${color}40`}}>{i}</div>
    {status&&<div style={{position:'absolute',bottom:-1,right:-1,width:size*.32,height:size*.32,borderRadius:'50%',background:statusColor(status),border:'2px solid white'}}/>}
  </div>
);

const Ico = ({children,size=16}) => <span style={{fontSize:size,lineHeight:1,display:'inline-block'}}>{children}</span>;

// ── Sidebar ──────────────────────────────────────────────────────────
const Sidebar = ({activeSection, navigate, unreadTotal}) => {
  const NAV = [
    {id:'chat',     icon:'💬', label:'Messages'},
    {id:'reunions', icon:'📹', label:'Réunions'},
    {id:'email',    icon:'📧', label:'Emails'},
    {id:'drive',    icon:'☁️',  label:'Cloud Drive'},
    {id:'contacts', icon:'👥', label:'Contacts'},
  ];
  return(
    <div style={{width:64,background:C.navy,display:'flex',flexDirection:'column',alignItems:'center',padding:'12px 0',gap:4,flexShrink:0}}>
      {/* Logo */}
      <div style={{width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,#2563eb,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,marginBottom:16,cursor:'pointer',boxShadow:'0 4px 12px rgba(37,99,235,.4)'}} onClick={()=>navigate('/')}>
        ⚡
      </div>
      {NAV.map(n=>{
        const isAct = activeSection===n.id;
        return(
          <div key={n.id} onClick={()=>navigate('/cleanitcomm/'+n.id)}
            title={n.label}
            style={{width:48,height:48,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,cursor:'pointer',position:'relative',transition:'all .15s',
              background:isAct?'rgba(37,99,235,.25)':'transparent',
              border:isAct?'1px solid rgba(37,99,235,.4)':'1px solid transparent'}}>
            {n.icon}
            {n.id==='chat'&&unreadTotal>0&&(
              <div style={{position:'absolute',top:4,right:4,width:16,height:16,borderRadius:8,background:C.red,color:'white',fontSize:9,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center'}}>
                {unreadTotal>9?'9+':unreadTotal}
              </div>
            )}
          </div>
        );
      })}
      <div style={{flex:1}}/>
      {/* User avatar */}
      <div style={{padding:'8px 0'}}>
        <Av i="MK" color={C.blue} size={36} status="online"/>
      </div>
    </div>
  );
};

// ── CHAT ─────────────────────────────────────────────────────────────
const SectionChat = ({navigate, params}) => {
  const [selChannel,  setSelChannel]  = useState(params.id||'ch1');
  const [selDM,       setSelDM]       = useState(null);
  const [messages,    setMessages]    = useState(MESSAGES_INIT);
  const [input,       setInput]       = useState('');
  const [search,      setSearch]      = useState('');
  const [showNewCh,   setShowNewCh]   = useState(false);
  const [showDMSel,   setShowDMSel]   = useState(false);
  const msgEndRef = useRef(null);
  const inputRef  = useRef(null);

  const currentMessages = selDM
    ? (messages['dm_'+selDM]||[])
    : (messages[selChannel]||[]);

  const currentTitle = selDM
    ? getUser(selDM)?.nom
    : '#'+CHANNELS.find(c=>c.id===selChannel)?.nom;

  useEffect(()=>{ msgEndRef.current?.scrollIntoView({behavior:'smooth'}); },[currentMessages]);

  const send = () => {
    if(!input.trim()) return;
    const key = selDM ? 'dm_'+selDM : selChannel;
    const msg = {id:'m'+Date.now(), userId:'u1', text:input.trim(), ts:Date.now(), type:'text'};
    setMessages(p=>({...p,[key]:[...(p[key]||[]),msg]}));
    setInput('');
    inputRef.current?.focus();
  };

  const handleKey = e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();} };

  const totalUnread = CHANNELS.reduce((s,c)=>s+c.unread,0);

  return(
    <div style={{flex:1,display:'flex',overflow:'hidden'}}>
      {/* Channels sidebar */}
      <div style={{width:240,background:C.navy2,display:'flex',flexDirection:'column',borderRight:'1px solid rgba(255,255,255,.06)'}}>
        <div style={{padding:'16px 14px 8px'}}>
          <div style={{fontSize:13,fontWeight:800,color:'white',marginBottom:10}}>CleanIT Comm</div>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,.08)',borderRadius:8,padding:'7px 10px'}}>
            <Ico>🔍</Ico>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
              style={{flex:1,background:'transparent',border:'none',outline:'none',color:'white',fontSize:12,fontFamily:'inherit'}}/>
          </div>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:'0 8px'}}>
          {/* Channels */}
          <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:.8,padding:'8px 6px 4px'}}>
            Canaux
            <span onClick={()=>setShowNewCh(true)} style={{float:'right',cursor:'pointer',fontSize:16,color:'rgba(255,255,255,.4)',lineHeight:.8}}>+</span>
          </div>
          {CHANNELS.filter(c=>!search||c.nom.includes(search.toLowerCase())).map(ch=>{
            const isAct = !selDM && selChannel===ch.id;
            return(
              <div key={ch.id} onClick={()=>{setSelChannel(ch.id);setSelDM(null);}}
                style={{display:'flex',alignItems:'center',gap:8,padding:'7px 8px',borderRadius:8,cursor:'pointer',marginBottom:1,
                  background:isAct?'rgba(37,99,235,.3)':'transparent',transition:'background .1s'}}
                onMouseEnter={e=>!isAct&&(e.currentTarget.style.background='rgba(255,255,255,.05)')}
                onMouseLeave={e=>!isAct&&(e.currentTarget.style.background='transparent')}>
                <span style={{fontSize:13,color:'rgba(255,255,255,.5)',fontWeight:700,width:16}}>{ch.icon||'#'}</span>
                <span style={{fontSize:12,color:isAct?'white':'rgba(255,255,255,.65)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontWeight:isAct?700:400}}>{ch.nom}</span>
                {ch.unread>0&&<span style={{background:C.red,color:'white',fontSize:9,fontWeight:800,padding:'1px 5px',borderRadius:10}}>{ch.unread}</span>}
              </div>
            );
          })}

          {/* DMs */}
          <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:.8,padding:'12px 6px 4px'}}>
            Messages directs
            <span onClick={()=>setShowDMSel(true)} style={{float:'right',cursor:'pointer',fontSize:16,color:'rgba(255,255,255,.4)',lineHeight:.8}}>+</span>
          </div>
          {CONTACTS.filter(u=>u.id!=='u1'&&(!search||u.nom.toLowerCase().includes(search.toLowerCase()))).map(u=>{
            const isAct = selDM===u.id;
            return(
              <div key={u.id} onClick={()=>{setSelDM(u.id);}}
                style={{display:'flex',alignItems:'center',gap:8,padding:'6px 8px',borderRadius:8,cursor:'pointer',marginBottom:1,
                  background:isAct?'rgba(37,99,235,.3)':'transparent',transition:'background .1s'}}
                onMouseEnter={e=>!isAct&&(e.currentTarget.style.background='rgba(255,255,255,.05)')}
                onMouseLeave={e=>!isAct&&(e.currentTarget.style.background='transparent')}>
                <Av i={u.avatar} color={u.couleur} size={24} status={u.status}/>
                <span style={{fontSize:12,color:isAct?'white':'rgba(255,255,255,.65)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontWeight:isAct?700:400}}>{u.nom}</span>
                <span style={{width:6,height:6,borderRadius:3,background:statusColor(u.status),flexShrink:0}}/>
              </div>
            );
          })}
        </div>
      </div>

      {/* Zone messages */}
      <div style={{flex:1,display:'flex',flexDirection:'column',background:C.white}}>
        {/* Header */}
        <div style={{padding:'12px 20px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:12,background:C.white,boxShadow:C.shadow}}>
          {selDM ? (
            <>
              <Av i={getUser(selDM)?.avatar||'?'} color={getUser(selDM)?.couleur||C.gray} size={34} status={getUser(selDM)?.status}/>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:C.text}}>{getUser(selDM)?.nom}</div>
                <div style={{fontSize:11,color:statusColor(getUser(selDM)?.status||'offline')}}>{getUser(selDM)?.status==='online'?'En ligne':getUser(selDM)?.status==='busy'?'Occupé':'Hors ligne'}</div>
              </div>
            </>
          ):(
            <>
              <div style={{fontSize:20,fontWeight:900,color:C.text3}}>#</div>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:C.text}}>{CHANNELS.find(c=>c.id===selChannel)?.nom}</div>
                <div style={{fontSize:11,color:C.text3}}>{CHANNELS.find(c=>c.id===selChannel)?.desc}</div>
              </div>
            </>
          )}
          <div style={{marginLeft:'auto',display:'flex',gap:8}}>
            <button onClick={()=>navigate('/cleanitcomm/reunions')}
              style={{display:'flex',alignItems:'center',gap:5,padding:'7px 12px',borderRadius:8,border:'none',background:C.blue,color:'white',fontSize:12,fontWeight:700,cursor:'pointer'}}>
              📹 Appel vidéo
            </button>
            <button style={{padding:'7px 10px',borderRadius:8,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',fontSize:13}}>🔍</button>
            <button style={{padding:'7px 10px',borderRadius:8,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',fontSize:13}}>📌</button>
          </div>
        </div>

        {/* Messages */}
        <div style={{flex:1,overflowY:'auto',padding:'20px 20px 8px'}}>
          {currentMessages.length===0&&(
            <div style={{textAlign:'center',padding:'60px',color:C.text4}}>
              <div style={{fontSize:48,marginBottom:12}}>💬</div>
              <div style={{fontSize:15,fontWeight:700,color:C.text3}}>Démarrez la conversation</div>
            </div>
          )}
          {currentMessages.map((msg,i)=>{
            const user = getUser(msg.userId);
            const isMe = msg.userId==='u1';
            const isSystem = msg.userId==='system';
            const prevMsg = currentMessages[i-1];
            const showAvatar = !prevMsg||prevMsg.userId!==msg.userId||msg.ts-prevMsg.ts>300000;

            if(isSystem) return(
              <div key={msg.id} style={{display:'flex',justifyContent:'center',marginBottom:8}}>
                <div style={{
                  padding:'6px 14px',borderRadius:20,fontSize:12,fontWeight:600,
                  background:msg.alertType==='geofence'?C.red_l:msg.alertType==='battery'?'#fef3c7':msg.alertType==='ok'?C.green_l:'#f3f4f6',
                  color:msg.alertType==='geofence'?C.red:msg.alertType==='battery'?'#92400e':msg.alertType==='ok'?C.green:C.gray,
                  border:`1px solid ${msg.alertType==='geofence'?'#fecaca':msg.alertType==='battery'?'#fde68a':msg.alertType==='ok'?'#bbf7d0':'#e5e7eb'}`,
                  maxWidth:'80%',textAlign:'center',
                }}>
                  {msg.text}
                  <span style={{fontSize:9,color:'inherit',opacity:.6,marginLeft:8}}>{fmtT(msg.ts)}</span>
                </div>
              </div>
            );

            return(
              <div key={msg.id} style={{display:'flex',gap:10,marginBottom:showAvatar?12:2,flexDirection:isMe?'row-reverse':'row'}}>
                {!isMe&&(
                  <div style={{width:34,flexShrink:0,marginTop:showAvatar?0:34}}>
                    {showAvatar&&<Av i={user?.avatar||'?'} color={user?.couleur||C.gray} size={34}/>}
                  </div>
                )}
                <div style={{maxWidth:'68%'}}>
                  {showAvatar&&!isMe&&(
                    <div style={{fontSize:11,fontWeight:700,color:C.text2,marginBottom:3}}>{user?.nom||'Inconnu'} <span style={{color:C.text4,fontWeight:400}}>{fmtT(msg.ts)}</span></div>
                  )}
                  <div style={{
                    padding:'9px 13px',borderRadius:isMe?'12px 12px 2px 12px':'12px 12px 12px 2px',
                    background:isMe?C.blue:'#f1f5f9',
                    color:isMe?'white':C.text,fontSize:13,lineHeight:1.5,
                    boxShadow:C.shadow,
                  }}>
                    {msg.text}
                  </div>
                  {showAvatar&&isMe&&<div style={{fontSize:10,color:C.text4,textAlign:'right',marginTop:2}}>{fmtT(msg.ts)}</div>}
                </div>
              </div>
            );
          })}
          <div ref={msgEndRef}/>
        </div>

        {/* Input */}
        <div style={{padding:'12px 20px',borderTop:`1px solid ${C.border}`,background:C.white}}>
          <div style={{display:'flex',alignItems:'flex-end',gap:10,background:'#f8fafc',borderRadius:12,border:`1px solid ${C.border}`,padding:'8px 12px'}}>
            <div style={{display:'flex',gap:6,paddingBottom:2}}>
              {['📎','📷','😊'].map(icon=>(
                <button key={icon} style={{padding:'4px',background:'none',border:'none',cursor:'pointer',fontSize:18,color:C.gray,borderRadius:6}}>{icon}</button>
              ))}
            </div>
            <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey}
              placeholder={`Message ${currentTitle}...`} rows={1}
              style={{flex:1,border:'none',background:'transparent',resize:'none',outline:'none',fontSize:13,fontFamily:'inherit',color:C.text,lineHeight:1.5,maxHeight:120,overflowY:'auto'}}/>
            <button onClick={send} disabled={!input.trim()}
              style={{padding:'8px 16px',borderRadius:9,border:'none',background:input.trim()?C.blue:'#e2e8f0',color:input.trim()?'white':C.text4,fontWeight:700,fontSize:13,cursor:input.trim()?'pointer':'default',transition:'all .15s',flexShrink:0}}>
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── RÉUNIONS ──────────────────────────────────────────────────────────
const SectionReunions = ({navigate}) => {
  const [meetings,    setMeetings]    = useState(MEETINGS_INIT);
  const [showNew,     setShowNew]     = useState(false);
  const [inMeeting,   setInMeeting]   = useState(null);
  const [newMeet,     setNewMeet]     = useState({titre:'',date:'',heure:'',duree:30,participants:[]});
  const jitsiRef = useRef(null);

  const today = meetings.filter(m=>m.statut==='today');
  const upcoming = meetings.filter(m=>m.statut==='upcoming');
  const past = meetings.filter(m=>m.statut==='done');

  const startMeeting = (meet) => {
    setInMeeting(meet);
  };

  const createMeeting = () => {
    if(!newMeet.titre||!newMeet.date||!newMeet.heure){alert('Titre, date et heure obligatoires');return;}
    const m = {...newMeet, id:'meet'+Date.now(), statut:'upcoming', room:'cleanit-'+newMeet.titre.toLowerCase().replace(/\s+/g,'-').substring(0,20)};
    setMeetings(p=>[...p,m]);
    setShowNew(false);
    setNewMeet({titre:'',date:'',heure:'',duree:30,participants:[]});
  };

  if(inMeeting) return(
    <div style={{flex:1,display:'flex',flexDirection:'column',background:'#000'}}>
      {/* Header réunion */}
      <div style={{background:C.navy2,padding:'12px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:'white'}}>{inMeeting.titre}</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,.5)'}}>Réunion en cours · {inMeeting.participants.length} participants</div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>setInMeeting(null)}
            style={{padding:'8px 16px',borderRadius:8,border:'none',background:C.red,color:'white',fontWeight:700,fontSize:12,cursor:'pointer'}}>
            📵 Quitter
          </button>
        </div>
      </div>

      {/* Jitsi Meet iframe */}
      <div ref={jitsiRef} style={{flex:1,position:'relative'}}>
        <iframe
          src={`https://meet.jit.si/CleanIT-${inMeeting.room}#userInfo.displayName="Marie Kamga"&config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&interfaceConfig.SHOW_BRAND_WATERMARK=false&interfaceConfig.SHOW_JITSI_WATERMARK=false`}
          style={{width:'100%',height:'100%',border:'none'}}
          allow="camera; microphone; fullscreen; display-capture"
          title="Réunion CleanIT"
        />
      </div>
    </div>
  );

  return(
    <div style={{flex:1,overflow:'auto',padding:'24px',background:C.bg}}>
      <div style={{maxWidth:900,margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
          <div>
            <div style={{fontSize:20,fontWeight:900,color:C.text}}>📹 Réunions & Vidéoconférence</div>
            <div style={{fontSize:12,color:C.text3}}>Propulsé par Jitsi Meet · Chiffrement end-to-end</div>
          </div>
          <div style={{display:'flex',gap:10}}>
            <button onClick={()=>startMeeting({titre:'Réunion instantanée',room:'cleanit-instant-'+Date.now(),participants:['u1']})}
              style={{display:'flex',alignItems:'center',gap:6,padding:'10px 18px',borderRadius:10,border:'none',background:C.green,color:'white',fontWeight:700,fontSize:13,cursor:'pointer'}}>
              📹 Démarrer maintenant
            </button>
            <button onClick={()=>setShowNew(true)}
              style={{display:'flex',alignItems:'center',gap:6,padding:'10px 18px',borderRadius:10,border:'none',background:C.blue,color:'white',fontWeight:700,fontSize:13,cursor:'pointer'}}>
              + Planifier
            </button>
          </div>
        </div>

        {/* Modal nouvelle réunion */}
        {showNew&&(
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
            <div style={{background:C.white,borderRadius:16,width:'100%',maxWidth:480,boxShadow:C.shadow2,overflow:'hidden'}}>
              <div style={{background:'linear-gradient(135deg,#1e40af,#7c3aed)',padding:'18px 24px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{fontSize:16,fontWeight:800,color:'white'}}>📅 Planifier une réunion</div>
                <button onClick={()=>setShowNew(false)} style={{background:'rgba(255,255,255,.2)',border:'none',color:'white',width:28,height:28,borderRadius:7,cursor:'pointer',fontSize:16}}>×</button>
              </div>
              <div style={{padding:24,display:'flex',flexDirection:'column',gap:14}}>
                {[
                  {l:'Titre *',type:'text',key:'titre',ph:'Ex: Réunion de suivi DLA-001'},
                  {l:'Date *', type:'date',key:'date',ph:''},
                  {l:'Heure *',type:'time',key:'heure',ph:''},
                ].map(f=>(
                  <div key={f.key}>
                    <label style={{fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:.4,display:'block',marginBottom:5}}>{f.l}</label>
                    <input type={f.type} value={newMeet[f.key]} onChange={e=>setNewMeet(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph}
                      style={{width:'100%',padding:'10px 12px',borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:13,fontFamily:'inherit',color:C.text}}/>
                  </div>
                ))}
                <div>
                  <label style={{fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:.4,display:'block',marginBottom:5}}>Durée</label>
                  <select value={newMeet.duree} onChange={e=>setNewMeet(p=>({...p,duree:+e.target.value}))}
                    style={{width:'100%',padding:'10px 12px',borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:13,fontFamily:'inherit',color:C.text}}>
                    {[15,30,45,60,90,120].map(d=><option key={d} value={d}>{d} minutes</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:.4,display:'block',marginBottom:5}}>Participants</label>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {CONTACTS.map(u=>{
                      const sel = newMeet.participants.includes(u.id);
                      return(
                        <div key={u.id} onClick={()=>setNewMeet(p=>({...p,participants:sel?p.participants.filter(x=>x!==u.id):[...p.participants,u.id]}))}
                          style={{display:'flex',alignItems:'center',gap:5,padding:'5px 10px',borderRadius:20,cursor:'pointer',fontSize:11,fontWeight:600,
                            background:sel?C.blue_m:C.bg,color:sel?C.blue:C.text3,border:`1px solid ${sel?C.blue:C.border}`}}>
                          <Av i={u.avatar} color={u.couleur} size={18}/>
                          {u.nom.split(' ')[0]}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={{display:'flex',gap:10,marginTop:4}}>
                  <button onClick={()=>setShowNew(false)} style={{flex:1,padding:'11px',borderRadius:9,border:`1px solid ${C.border}`,background:C.white,color:C.gray,fontWeight:700,fontSize:13,cursor:'pointer'}}>Annuler</button>
                  <button onClick={createMeeting} style={{flex:2,padding:'11px',borderRadius:9,border:'none',background:C.blue,color:'white',fontWeight:700,fontSize:13,cursor:'pointer'}}>✓ Planifier</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aujourd'hui */}
        {today.length>0&&(
          <div style={{marginBottom:24}}>
            <div style={{fontSize:12,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:12}}>Aujourd'hui</div>
            {today.map(m=>(
              <MeetCard key={m.id} meet={m} onStart={()=>startMeeting(m)} canStart/>
            ))}
          </div>
        )}

        {/* À venir */}
        {upcoming.length>0&&(
          <div style={{marginBottom:24}}>
            <div style={{fontSize:12,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:12}}>À venir</div>
            {upcoming.map(m=>(
              <MeetCard key={m.id} meet={m} onStart={()=>startMeeting(m)} canStart/>
            ))}
          </div>
        )}

        {/* Passées */}
        <div>
          <div style={{fontSize:12,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:12}}>Réunions passées</div>
          {past.map(m=>(
            <MeetCard key={m.id} meet={m} onStart={()=>startMeeting(m)} canStart={false}/>
          ))}
        </div>
      </div>
    </div>
  );
};

const MeetCard = ({meet, onStart, canStart}) => (
  <div style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,padding:'16px 20px',marginBottom:10,display:'flex',alignItems:'center',gap:16,boxShadow:C.shadow}}>
    <div style={{width:48,height:48,borderRadius:12,background:canStart?'linear-gradient(135deg,#2563eb,#7c3aed)':'#f3f4f6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>
      📹
    </div>
    <div style={{flex:1}}>
      <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:3}}>{meet.titre}</div>
      <div style={{fontSize:12,color:C.text3}}>{meet.date} à {meet.heure} · {meet.duree} min</div>
      <div style={{display:'flex',gap:4,marginTop:6}}>
        {meet.participants.slice(0,5).map(uid=>{
          const u=getUser(uid); if(!u) return null;
          return <Av key={uid} i={u.avatar} color={u.couleur} size={20}/>;
        })}
        {meet.participants.length>5&&<span style={{fontSize:10,color:C.text4,marginLeft:3}}>+{meet.participants.length-5}</span>}
      </div>
    </div>
    <div style={{display:'flex',gap:8}}>
      {canStart&&(
        <button onClick={onStart}
          style={{padding:'8px 16px',borderRadius:8,border:'none',background:meet.statut==='today'?C.green:C.blue,color:'white',fontWeight:700,fontSize:12,cursor:'pointer'}}>
          {meet.statut==='today'?'▶ Rejoindre':'▶ Démarrer'}
        </button>
      )}
      {!canStart&&<span style={{fontSize:11,color:C.text4,padding:'8px 12px'}}>Terminée</span>}
    </div>
  </div>
);

// ── EMAIL ─────────────────────────────────────────────────────────────
const SectionEmail = () => {
  const [emails,    setEmails]    = useState(EMAILS_INIT);
  const [selEmail,  setSelEmail]  = useState(null);
  const [dossier,   setDossier]   = useState('inbox');
  const [compose,   setCompose]   = useState(false);
  const [compData,  setCompData]  = useState({to:'',subject:'',body:''});
  const [sending,   setSending]   = useState(false);
  const [sentOk,    setSentOk]    = useState(false);

  const filtered = emails.filter(e=>e.dossier===dossier);
  const unread = emails.filter(e=>!e.lu&&e.dossier==='inbox').length;

  const sendEmail = async () => {
    if(!compData.to||!compData.subject){alert('Destinataire et sujet obligatoires');return;}
    setSending(true);
    // Simulation envoi — en prod : EmailJS
    await new Promise(r=>setTimeout(r,1500));
    const sent = {...compData, id:'e'+Date.now(), from:'m.kamga@cleanit.cm', fromName:'Marie Kamga', date:new Date().toISOString(), lu:true, starred:false, dossier:'sent', pj:0};
    setEmails(p=>[sent,...p]);
    setSending(false);
    setSentOk(true);
    setTimeout(()=>{setSentOk(false);setCompose(false);setCompData({to:'',subject:'',body:''});},2000);
  };

  const DOSSIERS = [{id:'inbox',l:'Boîte de réception',icon:'📥'},{id:'sent',l:'Envoyés',icon:'📤'},{id:'starred',l:'Importants',icon:'⭐'}];

  return(
    <div style={{flex:1,display:'flex',overflow:'hidden'}}>
      {/* Sidebar email */}
      <div style={{width:220,background:C.navy2,padding:'16px 10px',display:'flex',flexDirection:'column',gap:2}}>
        <button onClick={()=>setCompose(true)}
          style={{display:'flex',alignItems:'center',gap:8,padding:'11px 14px',borderRadius:10,border:'none',background:C.blue,color:'white',fontWeight:700,fontSize:13,cursor:'pointer',marginBottom:16,width:'100%'}}>
          ✏️ Nouveau message
        </button>
        {DOSSIERS.map(d=>{
          const isAct=dossier===d.id||(!dossier&&d.id==='inbox');
          return(
            <div key={d.id} onClick={()=>{setDossier(d.id);setSelEmail(null);}}
              style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:8,cursor:'pointer',
                background:isAct?'rgba(37,99,235,.3)':'transparent',color:isAct?'white':'rgba(255,255,255,.65)',fontSize:13,fontWeight:isAct?700:400}}>
              <span>{d.icon}</span>{d.l}
              {d.id==='inbox'&&unread>0&&<span style={{marginLeft:'auto',background:C.red,color:'white',fontSize:9,padding:'1px 5px',borderRadius:10,fontWeight:800}}>{unread}</span>}
            </div>
          );
        })}
      </div>

      {/* Liste emails */}
      {!selEmail&&(
        <div style={{width:320,borderRight:`1px solid ${C.border}`,background:C.white,overflowY:'auto'}}>
          <div style={{padding:'14px 16px',borderBottom:`1px solid ${C.border}`,fontSize:13,fontWeight:800,color:C.text}}>
            {DOSSIERS.find(d=>d.id===dossier)?.l||'Boîte de réception'} {unread>0&&dossier==='inbox'?`(${unread})` :''}
          </div>
          {filtered.length===0&&<div style={{padding:'40px',textAlign:'center',color:C.text4}}>Aucun email</div>}
          {filtered.map(email=>(
            <div key={email.id} onClick={()=>{setSelEmail(email);setEmails(p=>p.map(e=>e.id===email.id?{...e,lu:true}:e));}}
              style={{padding:'14px 16px',borderBottom:`1px solid #f8fafc`,cursor:'pointer',background:selEmail?.id===email.id?C.blue_l:'white',
                borderLeft:!email.lu?`3px solid ${C.blue}`:'3px solid transparent'}}
              onMouseEnter={e=>e.currentTarget.style.background=C.bg}
              onMouseLeave={e=>e.currentTarget.style.background=selEmail?.id===email.id?C.blue_l:'white'}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                <div style={{fontSize:12,fontWeight:email.lu?500:800,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{email.fromName}</div>
                <div style={{fontSize:10,color:C.text4,flexShrink:0,marginLeft:8}}>{fmtTime(email.date)}</div>
              </div>
              <div style={{fontSize:12,fontWeight:email.lu?400:700,color:email.lu?C.text3:C.text,marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{email.subject}</div>
              <div style={{fontSize:11,color:C.text4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{email.preview}</div>
              {email.pj>0&&<div style={{fontSize:10,color:C.blue,marginTop:3}}>📎 {email.pj} pièce(s) jointe(s)</div>}
            </div>
          ))}
        </div>
      )}

      {/* Vue email */}
      {selEmail&&(
        <div style={{flex:1,overflowY:'auto',background:C.white}}>
          <div style={{padding:'16px 24px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:12}}>
            <button onClick={()=>setSelEmail(null)} style={{padding:'6px 12px',borderRadius:7,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',fontSize:12,color:C.text3}}>← Retour</button>
            <div style={{display:'flex',gap:8,marginLeft:'auto'}}>
              {[{l:'↩ Répondre',fn:()=>setCompose(true)},{l:'↪ Transférer',fn:()=>setCompose(true)}].map(a=>(
                <button key={a.l} onClick={a.fn} style={{padding:'6px 12px',borderRadius:7,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',fontSize:12,color:C.text2,fontWeight:600}}>{a.l}</button>
              ))}
            </div>
          </div>
          <div style={{padding:'24px'}}>
            <div style={{fontSize:20,fontWeight:800,color:C.text,marginBottom:16}}>{selEmail.subject}</div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20,padding:'12px 16px',background:C.bg,borderRadius:10}}>
              <div style={{width:40,height:40,borderRadius:12,background:C.blue,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:14}}>
                {selEmail.fromName.charAt(0)}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>{selEmail.fromName}</div>
                <div style={{fontSize:11,color:C.text3}}>{selEmail.from}</div>
              </div>
              <div style={{fontSize:11,color:C.text4}}>{fmtDt(selEmail.date)} à {fmtT(selEmail.date)}</div>
            </div>
            <div style={{fontSize:13,color:C.text2,lineHeight:1.8,padding:'0 4px'}}>
              {selEmail.preview}
              <br/><br/>
              {selEmail.pj>0&&(
                <div style={{padding:'12px 14px',background:C.bg,borderRadius:8,border:`1px solid ${C.border}`,marginTop:16}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.text3,marginBottom:8}}>📎 PIÈCES JOINTES ({selEmail.pj})</div>
                  {Array.from({length:selEmail.pj}).map((_,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:i<selEmail.pj-1?`1px solid ${C.border}`:'none'}}>
                      <span style={{fontSize:16}}>📄</span>
                      <span style={{fontSize:12,color:C.blue,cursor:'pointer',fontWeight:500}}>Document_{i+1}.pdf</span>
                      <span style={{fontSize:10,color:C.text4,marginLeft:'auto'}}>Cliquer pour télécharger</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compose modal */}
      {compose&&(
        <div style={{position:'fixed',bottom:0,right:0,width:520,background:C.white,borderRadius:'16px 16px 0 0',boxShadow:'0 -8px 32px rgba(0,0,0,.15)',zIndex:500,border:`1px solid ${C.border}`}}>
          <div style={{background:'linear-gradient(135deg,#1e40af,#7c3aed)',padding:'14px 20px',borderRadius:'16px 16px 0 0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontSize:14,fontWeight:800,color:'white'}}>✏️ Nouveau message</div>
            <button onClick={()=>setCompose(false)} style={{background:'rgba(255,255,255,.2)',border:'none',color:'white',width:26,height:26,borderRadius:6,cursor:'pointer',fontSize:16}}>×</button>
          </div>
          <div style={{padding:16}}>
            {[{l:'À',key:'to',ph:'Email du destinataire'},{l:'Objet',key:'subject',ph:'Sujet du message'}].map(f=>(
              <div key={f.key} style={{display:'flex',alignItems:'center',borderBottom:`1px solid ${C.border}`,paddingBottom:8,marginBottom:8}}>
                <span style={{fontSize:11,fontWeight:700,color:C.text3,width:40}}>{f.l}</span>
                <input value={compData[f.key]} onChange={e=>setCompData(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph}
                  style={{flex:1,border:'none',outline:'none',fontSize:13,color:C.text,fontFamily:'inherit'}}/>
              </div>
            ))}
            <textarea value={compData.body} onChange={e=>setCompData(p=>({...p,body:e.target.value}))} placeholder="Écrivez votre message..." rows={8}
              style={{width:'100%',border:'none',outline:'none',resize:'none',fontSize:13,color:C.text,fontFamily:'inherit',lineHeight:1.6}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
              <div style={{display:'flex',gap:8}}>
                {['📎','🖼️','🔗'].map(ic=>(
                  <button key={ic} style={{background:'none',border:'none',cursor:'pointer',fontSize:18,color:C.gray}}>{ic}</button>
                ))}
              </div>
              <button onClick={sendEmail} disabled={sending}
                style={{padding:'9px 20px',borderRadius:9,border:'none',background:C.blue,color:'white',fontWeight:700,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
                {sentOk?'✅ Envoyé !':sending?'Envoi...':'➤ Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── CLOUD DRIVE ───────────────────────────────────────────────────────
const SectionDrive = () => {
  const [files,     setFiles]     = useState(DRIVE_INIT);
  const [search,    setSearch]    = useState('');
  const [viewType,  setViewType]  = useState('list');
  const [folder,    setFolder]    = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const fileInputRef = useRef(null);

  const filtered = files.filter(f=>
    (!search||(f.nom+f.folder).toLowerCase().includes(search.toLowerCase()))&&
    (!folder||f.folder.startsWith(folder))
  );

  const folders = [...new Set(files.map(f=>f.folder.split('/')[0]))];

  const FILE_ICONS = {pdf:'📄',excel:'📊',word:'📝',zip:'📦',img:'🖼️',video:'🎥',default:'📁'};
  const FILE_COLORS = {pdf:'#dc2626',excel:'#16a34a',word:'#2563eb',zip:'#d97706',img:'#7c3aed',video:'#be185d',default:C.gray};

  const handleUpload = async (e) => {
    const f = e.target.files[0];
    if(!f) return;
    setUploading(true);
    for(let i=0;i<=100;i+=10){
      await new Promise(r=>setTimeout(r,80));
      setUploadPct(i);
    }
    const ext = f.name.split('.').pop().toLowerCase();
    const type = ext==='pdf'?'pdf':['xlsx','xls'].includes(ext)?'excel':['doc','docx'].includes(ext)?'word':['zip','rar'].includes(ext)?'zip':'default';
    setFiles(p=>[{id:'f'+Date.now(),nom:f.name,type,taille:formatBytes(f.size),modif:new Date().toISOString(),owner:'u1',shared:false,folder:folder||'Mes fichiers'},...p]);
    setUploading(false);
    setUploadPct(0);
  };

  const formatBytes = b => b>1048576?`${(b/1048576).toFixed(1)} MB`:b>1024?`${(b/1024).toFixed(0)} KB`:`${b} B`;

  return(
    <div style={{flex:1,display:'flex',overflow:'hidden'}}>
      {/* Sidebar drive */}
      <div style={{width:220,background:C.navy2,padding:'16px 10px',display:'flex',flexDirection:'column',gap:2}}>
        <input ref={fileInputRef} type="file" style={{display:'none'}} onChange={handleUpload}/>
        <button onClick={()=>fileInputRef.current?.click()}
          style={{display:'flex',alignItems:'center',gap:8,padding:'11px 14px',borderRadius:10,border:'none',background:C.blue,color:'white',fontWeight:700,fontSize:13,cursor:'pointer',marginBottom:16,width:'100%'}}>
          ☁️ Déposer un fichier
        </button>
        {[{id:null,l:'Tous les fichiers',icon:'☁️'},{id:'Mes fichiers',l:'Mes fichiers',icon:'📁'},{id:'Projets',l:'Projets',icon:'🏗️'},{id:'Finance',l:'Finance',icon:'💰'},{id:'RH',l:'RH',icon:'👥'},{id:'Technique',l:'Technique',icon:'🔧'},{id:'HSE',l:'HSE',icon:'🦺'}].map(f=>{
          const isAct=folder===f.id;
          return(
            <div key={f.id||'all'} onClick={()=>setFolder(f.id)}
              style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:8,cursor:'pointer',fontSize:13,
                background:isAct?'rgba(37,99,235,.3)':'transparent',color:isAct?'white':'rgba(255,255,255,.65)',fontWeight:isAct?700:400}}>
              <span>{f.icon}</span>{f.l}
              <span style={{marginLeft:'auto',fontSize:10,color:'rgba(255,255,255,.3)'}}>{files.filter(x=>!f.id||x.folder.startsWith(f.id)).length}</span>
            </div>
          );
        })}
        {/* Usage */}
        <div style={{marginTop:'auto',padding:'12px 8px'}}>
          <div style={{fontSize:10,color:'rgba(255,255,255,.4)',marginBottom:6}}>Stockage utilisé</div>
          <div style={{height:4,borderRadius:2,background:'rgba(255,255,255,.1)',marginBottom:4}}>
            <div style={{width:'34%',height:'100%',borderRadius:2,background:C.blue}}/>
          </div>
          <div style={{fontSize:10,color:'rgba(255,255,255,.4)'}}>3.4 GB / 10 GB</div>
        </div>
      </div>

      {/* Main drive */}
      <div style={{flex:1,display:'flex',flexDirection:'column',background:C.bg,overflow:'hidden'}}>
        {/* Toolbar */}
        <div style={{padding:'14px 20px',background:C.white,borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:12}}>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8fafc',borderRadius:9,padding:'8px 13px',border:`1px solid ${C.border}`,flex:1,maxWidth:320}}>
            <span style={{color:C.text4}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher des fichiers..."
              style={{flex:1,border:'none',background:'transparent',outline:'none',fontSize:13,fontFamily:'inherit'}}/>
          </div>
          <div style={{marginLeft:'auto',display:'flex',gap:6}}>
            {['list','grid'].map(v=>(
              <button key={v} onClick={()=>setViewType(v)}
                style={{padding:'7px 10px',borderRadius:7,border:`1px solid ${C.border}`,background:viewType===v?C.blue:C.white,color:viewType===v?'white':C.text3,cursor:'pointer',fontSize:14}}>
                {v==='list'?'☰':'⊞'}
              </button>
            ))}
          </div>
        </div>

        {/* Upload progress */}
        {uploading&&(
          <div style={{padding:'10px 20px',background:C.blue_l,borderBottom:`1px solid ${C.blue_m}`}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:5}}>
              <span style={{fontSize:12,color:C.blue,fontWeight:700}}>Upload en cours... {uploadPct}%</span>
            </div>
            <div style={{height:3,borderRadius:2,background:C.blue_m}}>
              <div style={{width:uploadPct+'%',height:'100%',borderRadius:2,background:C.blue,transition:'width .1s'}}/>
            </div>
          </div>
        )}

        <div style={{flex:1,overflowY:'auto',padding:'20px'}}>
          {viewType==='list'?(
            <div style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,overflow:'hidden',boxShadow:C.shadow}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 100px 120px 100px 80px',gap:0,padding:'10px 16px',background:'#f8fafc',borderBottom:`2px solid ${C.border}`,fontSize:10,fontWeight:800,color:C.text3,textTransform:'uppercase',letterSpacing:.5}}>
                <span>Nom</span><span>Taille</span><span>Modifié</span><span>Propriétaire</span><span>Actions</span>
              </div>
              {filtered.length===0&&<div style={{padding:'40px',textAlign:'center',color:C.text4}}>Aucun fichier</div>}
              {filtered.map((f,i)=>{
                const owner=getUser(f.owner);
                const ic=FILE_ICONS[f.type]||FILE_ICONS.default;
                const col=FILE_COLORS[f.type]||FILE_COLORS.default;
                return(
                  <div key={f.id} style={{display:'grid',gridTemplateColumns:'1fr 100px 120px 100px 80px',gap:0,padding:'11px 16px',borderBottom:`1px solid #f8fafc`,alignItems:'center',
                    background:i%2===0?C.white:'#fafbfc',transition:'background .1s',cursor:'pointer'}}
                    onMouseEnter={e=>e.currentTarget.style.background=C.blue_l}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===0?C.white:'#fafbfc'}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:34,height:34,borderRadius:9,background:col+'15',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{ic}</div>
                      <div style={{minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.nom}</div>
                        <div style={{fontSize:10,color:C.text4}}>{f.folder}</div>
                      </div>
                    </div>
                    <span style={{fontSize:12,color:C.text3}}>{f.taille}</span>
                    <span style={{fontSize:11,color:C.text3}}>{fmtDt(f.modif)}</span>
                    <div style={{display:'flex',alignItems:'center',gap:5}}>
                      {owner&&<Av i={owner.avatar} color={owner.couleur} size={20}/>}
                      <span style={{fontSize:10,color:C.text4}}>{owner?.nom.split(' ')[0]}</span>
                    </div>
                    <div style={{display:'flex',gap:5}}>
                      {['⬇','🔗','✏️'].map(ic=>(
                        <button key={ic} style={{padding:'4px',background:'none',border:'none',cursor:'pointer',fontSize:13,color:C.gray,borderRadius:4}}>{ic}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ):(
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12}}>
              {filtered.map(f=>{
                const ic=FILE_ICONS[f.type]||FILE_ICONS.default;
                const col=FILE_COLORS[f.type]||FILE_COLORS.default;
                return(
                  <div key={f.id} style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,padding:'16px',cursor:'pointer',transition:'all .2s',boxShadow:C.shadow}}
                    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=C.shadow2;}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow=C.shadow;}}>
                    <div style={{width:'100%',height:80,borderRadius:9,background:col+'15',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,marginBottom:10}}>{ic}</div>
                    <div style={{fontSize:11,fontWeight:700,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.nom}</div>
                    <div style={{fontSize:10,color:C.text4,marginTop:3}}>{f.taille}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── CONTACTS ──────────────────────────────────────────────────────────
const SectionContacts = ({navigate}) => {
  const [search, setSearch] = useState('');
  const byDept = CONTACTS.reduce((acc,c)=>{
    const d=c.dept||'Autre';
    if(!acc[d]) acc[d]=[];
    acc[d].push(c);
    return acc;
  },{});

  const filtered = CONTACTS.filter(c=>!search||(c.nom+c.poste+c.dept).toLowerCase().includes(search.toLowerCase()));

  return(
    <div style={{flex:1,overflow:'auto',padding:'24px',background:C.bg}}>
      <div style={{maxWidth:900,margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <div style={{fontSize:20,fontWeight:900,color:C.text}}>👥 Répertoire de l'équipe</div>
          <div style={{display:'flex',alignItems:'center',gap:8,background:C.white,borderRadius:10,padding:'8px 14px',border:`1px solid ${C.border}`,width:250}}>
            <span style={{color:C.text4}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
              style={{flex:1,border:'none',outline:'none',fontSize:13,fontFamily:'inherit'}}/>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14}}>
          {filtered.map(u=>(
            <div key={u.id} style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:'20px',boxShadow:C.shadow,transition:'all .2s',cursor:'pointer'}}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=C.shadow2;}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow=C.shadow;}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                <Av i={u.avatar} color={u.couleur} size={50} status={u.status}/>
                <div>
                  <div style={{fontSize:14,fontWeight:800,color:C.text}}>{u.nom}</div>
                  <div style={{fontSize:12,color:C.text3}}>{u.poste}</div>
                  <div style={{fontSize:10,padding:'2px 7px',borderRadius:10,background:C.blue_l,color:C.blue,fontWeight:600,display:'inline-block',marginTop:3}}>{u.dept}</div>
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:5,marginBottom:12}}>
                <div style={{fontSize:11,color:C.text3}}>📧 {u.email}</div>
                <div style={{fontSize:11,color:statusColor(u.status),fontWeight:600}}>
                  ● {u.status==='online'?'En ligne':u.status==='busy'?'Occupé':u.status==='away'?'Absent':'Hors ligne'}
                </div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>navigate('/cleanitcomm/chat')}
                  style={{flex:1,padding:'7px',borderRadius:8,border:'none',background:C.blue,color:'white',fontSize:12,fontWeight:700,cursor:'pointer'}}>
                  💬 Message
                </button>
                <button onClick={()=>navigate('/cleanitcomm/reunions')}
                  style={{flex:1,padding:'7px',borderRadius:8,border:`1px solid ${C.border}`,background:C.white,color:C.text2,fontSize:12,fontWeight:600,cursor:'pointer'}}>
                  📹 Appel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── COMPOSANT PRINCIPAL ───────────────────────────────────────────────
export default function CleanITComm() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const params    = useParams();
  const loc       = location.pathname;

  const section = params.section || 'chat';

  const unreadTotal = CHANNELS.reduce((s,c)=>s+c.unread,0);

  const getSection = () => {
    switch(section) {
      case 'reunions': return <SectionReunions navigate={navigate}/>;
      case 'email':    return <SectionEmail/>;
      case 'drive':    return <SectionDrive/>;
      case 'contacts': return <SectionContacts navigate={navigate}/>;
      default:         return <SectionChat navigate={navigate} params={params}/>;
    }
  };

  return(
    <div style={{height:'100vh',display:'flex',fontFamily:"'Segoe UI',system-ui,Arial,sans-serif",overflow:'hidden'}}>
      <style>{`
        @keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}
        textarea{color:inherit}
      `}</style>

      <Sidebar activeSection={section} navigate={navigate} unreadTotal={unreadTotal}/>

      <div style={{flex:1,display:'flex',overflow:'hidden',animation:'slideIn .2s ease'}}>
        {getSection()}
      </div>
    </div>
  );
}
