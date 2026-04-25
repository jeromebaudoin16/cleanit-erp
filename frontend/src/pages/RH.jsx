import { useState } from 'react';

// ===== DESIGN SYSTEM ENTERPRISE HR =====
const C = {
  primary:   '#0f172a',
  primary2:  '#1e293b',
  primary3:  '#334155',
  accent:    '#3b82f6',
  accent2:   '#2563eb',
  accent_bg: '#eff6ff',
  green:     '#16a34a',
  green_bg:  '#f0fdf4',
  red:       '#dc2626',
  red_bg:    '#fef2f2',
  orange:    '#d97706',
  orange_bg: '#fffbeb',
  purple:    '#7c3aed',
  purple_bg: '#f5f3ff',
  teal:      '#0d9488',
  teal_bg:   '#f0fdfa',
  border:    '#e2e8f0',
  border2:   '#f1f5f9',
  text:      '#0f172a',
  text2:     '#475569',
  muted:     '#94a3b8',
  bg:        '#f8fafc',
  bg2:       '#f1f5f9',
  white:     '#ffffff',
};

const fmtD = d => d ? new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const fmtDT = d => d ? new Date(d).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) : '—';
const fmtN = n => new Intl.NumberFormat('fr-FR').format(Math.round(n||0));
const getInitials = (p,n) => `${p?.[0]||''}${n?.[0]||''}`.toUpperCase();

const AVATAR_COLORS = [
  {bg:'#dbeafe',text:'#1d4ed8'},{bg:'#ede9fe',text:'#7c3aed'},
  {bg:'#fce7f3',text:'#be185d'},{bg:'#d1fae5',text:'#065f46'},
  {bg:'#fee2e2',text:'#991b1b'},{bg:'#fef3c7',text:'#92400e'},
  {bg:'#e0f2fe',text:'#0369a1'},{bg:'#f3e8ff',text:'#6b21a8'},
];
const getAvatarColor = (name='') => AVATAR_COLORS[name.charCodeAt(0)%AVATAR_COLORS.length];

// ===== ICÔNES SVG =====
const Icon = ({n,size=16,color='currentColor',style={}}) => {
  const p = {
    home:'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
    users:'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
    user:'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z',
    external:'M16 11c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z M3 21v-1a7 7 0 017-7h4a7 7 0 017 7v1',
    payslip:'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    clock:'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2',
    calendar:'M8 2v4 M16 2v4 M3 10h18 M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z',
    chart:'M18 20V10 M12 20V4 M6 20v-6',
    plus:'M12 5v14 M5 12h14',
    close:'M18 6L6 18 M6 6l12 12',
    search:'M21 21l-4.35-4.35 M17 11A6 6 0 115 11a6 6 0 0112 0z',
    check:'M20 6L9 17l-5-5',
    edit:'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
    eye:'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12m-3 0a3 3 0 106 0 3 3 0 00-6 0',
    download:'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3',
    upload:'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
    mail:'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
    phone:'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.63 19.79 19.79 0 01.06 4 2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.91a16 16 0 006.12 6.12l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z',
    building:'M3 21h18 M3 7v14 M21 7v14 M9 21V7 M15 21V7 M3 7l9-4 9 4 M9 11v.01 M9 15v.01 M15 11v.01 M15 15v.01',
    briefcase:'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2',
    doc:'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6',
    star:'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    alert:'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01',
    shield:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    link:'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71',
    chevron_right:'M9 18l6-6-6-6',
    chevron_down:'M6 9l6 6 6-6',
    menu:'M3 12h18 M3 6h18 M3 18h18',
    org:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0',
    print:'M6 9V2h12v7 M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2 M6 14h12v8H6z',
    settings:'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
  };
  const d = p[n]; if(!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      {d.split(' M ').map((seg,i)=><path key={i} d={i===0?seg:`M ${seg}`}/>)}
    </svg>
  );
};

// ===== AVATAR =====
const Avatar = ({prenom='',nom='',size=40,photo}) => {
  const initials = getInitials(prenom,nom);
  const ac = getAvatarColor(prenom+nom);
  return (
    <div style={{width:size,height:size,borderRadius:'50%',background:photo?'transparent':ac.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.32,fontWeight:600,color:ac.text,flexShrink:0,overflow:'hidden',border:`2px solid ${C.white}`,boxShadow:'0 0 0 1px '+C.border}}>
      {photo ? <img src={photo} alt={initials} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : initials}
    </div>
  );
};

// ===== BADGE =====
const Badge = ({status,label,color,bg}) => {
  const cfg = {
    actif:      {l:'Actif',       c:'#065f46', bg:'#d1fae5'},
    inactif:    {l:'Inactif',     c:'#374151', bg:'#f3f4f6'},
    conge:      {l:'En congé',    c:'#92400e', bg:'#fef3c7'},
    suspendu:   {l:'Suspendu',    c:'#991b1b', bg:'#fee2e2'},
    paye:       {l:'Payé',        c:'#065f46', bg:'#d1fae5'},
    en_attente: {l:'En attente',  c:'#92400e', bg:'#fef3c7'},
    valide:     {l:'Validé',      c:'#1e40af', bg:'#dbeafe'},
    brouillon:  {l:'Brouillon',   c:'#374151', bg:'#f3f4f6'},
    present:    {l:'Présent',     c:'#065f46', bg:'#d1fae5'},
    absent:     {l:'Absent',      c:'#991b1b', bg:'#fee2e2'},
    retard:     {l:'Retard',      c:'#92400e', bg:'#fef3c7'},
    mi_temps:   {l:'Mi-temps',    c:'#1e40af', bg:'#dbeafe'},
    interne:    {l:'Interne',     c:'#1e40af', bg:'#dbeafe'},
    externe:    {l:'Externe',     c:'#6b21a8', bg:'#f3e8ff'},
    approuve:   {l:'Approuvé',    c:'#065f46', bg:'#d1fae5'},
    refuse:     {l:'Refusé',      c:'#991b1b', bg:'#fee2e2'},
    cdi:        {l:'CDI',         c:'#065f46', bg:'#d1fae5'},
    cdd:        {l:'CDD',         c:'#1e40af', bg:'#dbeafe'},
    stage:      {l:'Stage',       c:'#92400e', bg:'#fef3c7'},
    freelance:  {l:'Freelance',   c:'#6b21a8', bg:'#f3e8ff'},
  }[status] || {l:label||status, c:color||C.text2, bg:bg||C.bg2};
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',borderRadius:20,background:cfg.bg,color:cfg.c,fontSize:11,fontWeight:600,whiteSpace:'nowrap'}}>
      <span style={{width:5,height:5,borderRadius:'50%',background:cfg.c,flexShrink:0}}/>
      {cfg.l}
    </span>
  );
};

// ===== BOUTON =====
const Btn = ({label,onClick,variant='ghost',disabled,sm,icon,full,color}) => {
  const styles = {
    primary:{bg:C.accent,text:'white',border:'none'},
    danger: {bg:C.red,   text:'white',border:'none'},
    ghost:  {bg:'white', text:C.text2, border:`1px solid ${C.border}`},
    green:  {bg:C.green, text:'white', border:'none'},
    dark:   {bg:C.primary,text:'white',border:'none'},
  };
  const s = styles[variant]||styles.ghost;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6,
      padding:sm?'6px 12px':'9px 16px',width:full?'100%':'auto',
      borderRadius:6,border:s.border,background:disabled?C.bg2:s.bg,
      color:disabled?C.muted:s.text,fontWeight:500,fontSize:sm?12:13,
      cursor:disabled?'not-allowed':'pointer',fontFamily:'inherit',
      transition:'all .15s',whiteSpace:'nowrap',
    }}
    onMouseEnter={e=>{if(!disabled){e.currentTarget.style.opacity='0.85';e.currentTarget.style.transform='translateY(-1px)';}}}
    onMouseLeave={e=>{e.currentTarget.style.opacity='1';e.currentTarget.style.transform='translateY(0)';}}>
      {icon&&<Icon n={icon} size={sm?13:15} color={disabled?C.muted:s.text}/>}
      {label}
    </button>
  );
};

// ===== INPUT =====
const Input = ({type='text',value,onChange,placeholder,disabled,small,icon}) => (
  <div style={{position:'relative',display:'flex',alignItems:'center'}}>
    {icon&&<span style={{position:'absolute',left:10,pointerEvents:'none'}}><Icon n={icon} size={14} color={C.muted}/></span>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} disabled={disabled}
      style={{width:'100%',padding:small?`6px ${icon?'10px 6px 28px':'10px'}`:`9px ${icon?'12px 10px 36px':'12px'}`,borderRadius:6,border:`1px solid ${C.border}`,fontSize:13,color:C.text,background:disabled?C.bg2:C.white,boxSizing:'border-box',outline:'none',fontFamily:'inherit',transition:'border-color .15s',paddingLeft:icon?(small?28:36):undefined}}
      onFocus={e=>e.target.style.borderColor=C.accent}
      onBlur={e=>e.target.style.borderColor=C.border}/>
  </div>
);

const Select = ({value,onChange,options,placeholder,disabled}) => (
  <select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
    style={{width:'100%',padding:'9px 12px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:13,color:value?C.text:C.muted,background:disabled?C.bg2:C.white,cursor:'pointer',outline:'none',fontFamily:'inherit'}}
    onFocus={e=>e.target.style.borderColor=C.accent}
    onBlur={e=>e.target.style.borderColor=C.border}>
    <option value="">{placeholder||'Sélectionner...'}</option>
    {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
  </select>
);

const Textarea = ({value,onChange,placeholder,rows=3}) => (
  <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} rows={rows}
    style={{width:'100%',padding:'9px 12px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:13,color:C.text,background:C.white,resize:'vertical',boxSizing:'border-box',outline:'none',fontFamily:'inherit'}}
    onFocus={e=>e.target.style.borderColor=C.accent}
    onBlur={e=>e.target.style.borderColor=C.border}/>
);

const Field = ({label,required,children,hint,col1}) => (
  <div style={{gridColumn:col1?'1/-1':'auto'}}>
    <label style={{display:'block',fontSize:12,fontWeight:600,color:C.text2,marginBottom:5,textTransform:'uppercase',letterSpacing:0.4}}>
      {label}{required&&<span style={{color:C.red,marginLeft:2}}>*</span>}
    </label>
    {children}
    {hint&&<div style={{fontSize:11,color:C.muted,marginTop:3}}>{hint}</div>}
  </div>
);

// ===== PANEL LATÉRAL =====
const Panel = ({title,subtitle,onClose,children,width=720,actions}) => (
  <div style={{position:'fixed',inset:0,zIndex:300,display:'flex',justifyContent:'flex-end'}}>
    <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(15,23,42,0.5)',backdropFilter:'blur(2px)'}}/>
    <div style={{position:'relative',width,maxWidth:'95vw',height:'100vh',background:C.white,boxShadow:'-8px 0 40px rgba(0,0,0,0.15)',display:'flex',flexDirection:'column',animation:'slideIn .25s ease'}}>
      <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
      <div style={{padding:'20px 24px',borderBottom:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexShrink:0}}>
        <div>
          {subtitle&&<div style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:0.5,marginBottom:3}}>{subtitle}</div>}
          <h2 style={{margin:0,fontSize:18,fontWeight:700,color:C.text}}>{title}</h2>
        </div>
        <button onClick={onClose} style={{width:34,height:34,borderRadius:8,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',marginLeft:12,flexShrink:0}}>
          <Icon n="close" size={16} color={C.muted}/>
        </button>
      </div>
      <div style={{flex:1,overflow:'auto'}}>{children}</div>
      {actions&&(
        <div style={{padding:'16px 24px',borderTop:`1px solid ${C.border}`,display:'flex',gap:8,justifyContent:'flex-end',flexShrink:0,background:C.bg}}>
          {actions}
        </div>
      )}
    </div>
  </div>
);

// ===== MODAL =====
const Modal = ({title,onClose,children,maxWidth=560}) => (
  <div style={{position:'fixed',inset:0,zIndex:400,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
    <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(15,23,42,0.5)',backdropFilter:'blur(2px)'}}/>
    <div style={{position:'relative',width:'100%',maxWidth,background:C.white,borderRadius:12,boxShadow:'0 20px 60px rgba(0,0,0,0.2)',overflow:'hidden',maxHeight:'92vh',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'18px 24px',borderBottom:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
        <h3 style={{margin:0,fontSize:16,fontWeight:700,color:C.text}}>{title}</h3>
        <button onClick={onClose} style={{width:30,height:30,borderRadius:6,border:`1px solid ${C.border}`,background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Icon n="close" size={14} color={C.muted}/>
        </button>
      </div>
      <div style={{overflow:'auto',flex:1}}>{children}</div>
    </div>
  </div>
);

// ===== CARD =====
const Card = ({title,icon,children,action,actionLabel,style={}}) => (
  <div style={{background:C.white,borderRadius:10,border:`1px solid ${C.border}`,overflow:'hidden',...style}}>
    {title&&(
      <div style={{padding:'14px 20px',borderBottom:`1px solid ${C.border2}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {icon&&<Icon n={icon} size={16} color={C.accent}/>}
          <span style={{fontSize:14,fontWeight:600,color:C.text}}>{title}</span>
        </div>
        {action&&<button onClick={action} style={{fontSize:12,color:C.accent,background:'none',border:'none',cursor:'pointer',fontWeight:500}}>{actionLabel||'Voir tout →'}</button>}
      </div>
    )}
    {children}
  </div>
);

// ===== TABLEAU PROFESSIONNEL =====
const Table = ({cols,rows,onRowClick,empty='Aucune donnée'}) => (
  <div style={{overflowX:'auto'}}>
    <table style={{width:'100%',borderCollapse:'collapse'}}>
      <thead>
        <tr style={{background:C.bg,borderBottom:`1px solid ${C.border}`}}>
          {cols.map(c=><th key={c} style={{padding:'10px 16px',textAlign:'left',fontSize:11,fontWeight:600,color:C.muted,textTransform:'uppercase',letterSpacing:0.5,whiteSpace:'nowrap'}}>{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.length===0&&<tr><td colSpan={cols.length} style={{padding:'48px 16px',textAlign:'center',color:C.muted,fontSize:14}}>{empty}</td></tr>}
        {rows.map((row,i)=>(
          <tr key={i} onClick={()=>onRowClick&&onRowClick(i)}
            style={{borderBottom:`1px solid ${C.border2}`,cursor:onRowClick?'pointer':'default',transition:'background .1s'}}
            onMouseEnter={e=>{if(onRowClick)e.currentTarget.style.background='#f8fafc'}}
            onMouseLeave={e=>{e.currentTarget.style.background='white'}}>
            {row.map((cell,j)=><td key={j} style={{padding:'12px 16px',fontSize:13,color:C.text,verticalAlign:'middle'}}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ===== DONNÉES =====
const DEPARTEMENTS = ['Direction Générale','Technique & Ingénierie','Finance & Comptabilité','Ressources Humaines','Commercial & Business','Juridique & Conformité','Logistique & Opérations','Gestion de Projets'];
const POSTES = ['Directeur Général','Directeur Technique','Chef de Projet Senior','Chef de Projet','Ingénieur Télécom Senior','Ingénieur Télécom','Comptable Senior','Comptable','RH Manager','Commercial Senior','Juriste','Logisticien','Assistante de Direction','Technicien Senior','Technicien'];
const POSTES_EXT = ['Technicien Installation 5G','Technicien Installation 4G','Technicien Maintenance','Ingénieur RF Senior','Ingénieur RF','Chef d\'équipe terrain','Câbleur fibre optique','Électricien télécom','Génie civil télécom'];
const BANQUES = ['BICEC','Société Générale Cameroun','Afriland First Bank','UBA Cameroun','Ecobank Cameroun','MTN Mobile Money','Orange Money'];
const NIVEAUX = ['BEP/CAP','Bac','BTS/DUT','Licence','Master/Ingénieur','Doctorat'];
const CONTRATS = ['CDI','CDD','Stage','Freelance'];
const VILLES = ['Douala','Yaoundé','Bafoussam','Garoua','Bamenda','Kribi','Limbé','Buea'];

const SEED_INTERNES = [
  {id:'EI001',prenom:'Marie',nom:'Kamga',email:'marie.kamga@cleanit.cm',telephone:'+237 677 001 001',poste:'Chef de Projet Senior',departement:'Gestion de Projets',dateEmbauche:'2021-03-15',dateNaissance:'1988-07-22',lieuNaissance:'Douala',nationalite:'Camerounaise',cin:'12345678',salaireBase:650000,contrat:'CDI',status:'actif',genre:'F',ville:'Douala',adresse:'Akwa, Rue des Palmiers',banque:'BICEC',rib:'CM21 1001 1234 5678',matricule:'CLN-INT-001',niveauEtudes:'Master/Ingénieur',urgenceNom:'Paul Kamga',urgenceTel:'+237 699 001 001',urgenceLien:'Époux',photo:null,permissions:'chef_projet',documents:[{nom:'Contrat CDI',type:'contrat',date:'2021-03-15'},{nom:'Pièce d\'identité',type:'cin',date:'2021-03-15'},{nom:'Diplôme Master',type:'diplome',date:'2021-03-10'}],historique:[{date:'2023-01-01',action:'Promotion',detail:'Chef de Projet → Chef de Projet Senior',par:'DG'},{date:'2021-03-15',action:'Embauche',detail:'Recrutement CDI - Chef de Projet',par:'RH'}]},
  {id:'EI002',prenom:'Pierre',nom:'Etoga',email:'pierre.etoga@cleanit.cm',telephone:'+237 677 002 002',poste:'Ingénieur Télécom Senior',departement:'Technique & Ingénierie',dateEmbauche:'2020-06-01',dateNaissance:'1985-11-30',lieuNaissance:'Yaoundé',nationalite:'Camerounaise',cin:'87654321',salaireBase:580000,contrat:'CDI',status:'actif',genre:'M',ville:'Douala',adresse:'Bonanjo, Avenue de Gaulle',banque:'Société Générale Cameroun',rib:'CM21 2001 9876 5432',matricule:'CLN-INT-002',niveauEtudes:'Master/Ingénieur',urgenceNom:'Claire Etoga',urgenceTel:'+237 699 002 002',urgenceLien:'Épouse',photo:null,permissions:'technicien_senior',documents:[{nom:'Contrat CDI',type:'contrat',date:'2020-06-01'},{nom:'Pièce d\'identité',type:'cin',date:'2020-06-01'}],historique:[{date:'2022-06-01',action:'Augmentation',detail:'Révision salariale annuelle +8%',par:'DG'},{date:'2020-06-01',action:'Embauche',detail:'Recrutement CDI - Ingénieur Télécom',par:'RH'}]},
  {id:'EI003',prenom:'Aline',nom:'Biya',email:'aline.biya@cleanit.cm',telephone:'+237 677 003 003',poste:'RH Manager',departement:'Ressources Humaines',dateEmbauche:'2022-01-10',dateNaissance:'1990-04-15',lieuNaissance:'Bafoussam',nationalite:'Camerounaise',cin:'11223344',salaireBase:480000,contrat:'CDI',status:'actif',genre:'F',ville:'Douala',adresse:'Bonapriso, Rue des Fleurs',banque:'Afriland First Bank',rib:'CM21 3001 1111 2222',matricule:'CLN-INT-003',niveauEtudes:'Master/Ingénieur',urgenceNom:'Jean Biya',urgenceTel:'+237 699 003 003',urgenceLien:'Frère',photo:null,permissions:'rh_manager',documents:[{nom:'Contrat CDI',type:'contrat',date:'2022-01-10'}],historique:[{date:'2022-01-10',action:'Embauche',detail:'Recrutement CDI - RH Manager',par:'DG'}]},
  {id:'EI004',prenom:'David',nom:'Mballa',email:'david.mballa@cleanit.cm',telephone:'+237 677 004 004',poste:'Comptable Senior',departement:'Finance & Comptabilité',dateEmbauche:'2021-09-01',dateNaissance:'1987-02-18',lieuNaissance:'Douala',nationalite:'Camerounaise',cin:'44332211',salaireBase:420000,contrat:'CDI',status:'actif',genre:'M',ville:'Douala',adresse:'Deido, Rue du Commerce',banque:'BICEC',rib:'CM21 1001 4444 5555',matricule:'CLN-INT-004',niveauEtudes:'Licence',urgenceNom:'Rose Mballa',urgenceTel:'+237 699 004 004',urgenceLien:'Épouse',photo:null,permissions:'comptable',documents:[{nom:'Contrat CDI',type:'contrat',date:'2021-09-01'}],historique:[{date:'2021-09-01',action:'Embauche',detail:'Recrutement CDI - Comptable',par:'RH'}]},
  {id:'EI005',prenom:'Jean',nom:'Fouda',email:'jean.fouda@cleanit.cm',telephone:'+237 677 005 005',poste:'Commercial Senior',departement:'Commercial & Business',dateEmbauche:'2023-02-15',dateNaissance:'1992-09-05',lieuNaissance:'Yaoundé',nationalite:'Camerounaise',cin:'55667788',salaireBase:380000,contrat:'CDI',status:'conge',genre:'M',ville:'Yaoundé',adresse:'Bastos, Quartier Diplomatique',banque:'MTN Mobile Money',rib:'677005005',matricule:'CLN-INT-005',niveauEtudes:'Master/Ingénieur',urgenceNom:'Alice Fouda',urgenceTel:'+237 699 005 005',urgenceLien:'Sœur',photo:null,permissions:'commercial',documents:[{nom:'Contrat CDI',type:'contrat',date:'2023-02-15'}],historique:[{date:'2023-02-15',action:'Embauche',detail:'Recrutement CDI - Commercial',par:'RH'}]},
  {id:'EI006',prenom:'Sandra',nom:'Nguele',email:'sandra.nguele@cleanit.cm',telephone:'+237 677 006 006',poste:'Assistante de Direction',departement:'Direction Générale',dateEmbauche:'2020-11-01',dateNaissance:'1994-12-20',lieuNaissance:'Kribi',nationalite:'Camerounaise',cin:'99887766',salaireBase:320000,contrat:'CDI',status:'actif',genre:'F',ville:'Douala',adresse:'Akwa Nord, Rue des Jasmins',banque:'Orange Money',rib:'698006006',matricule:'CLN-INT-006',niveauEtudes:'BTS/DUT',urgenceNom:'Marc Nguele',urgenceTel:'+237 699 006 006',urgenceLien:'Père',photo:null,permissions:'assistante',documents:[{nom:'Contrat CDI',type:'contrat',date:'2020-11-01'},{nom:'Avenant salaire',type:'avenant',date:'2022-11-01'}],historique:[{date:'2022-11-01',action:'Avenant',detail:'Révision salariale +5%',par:'DG'},{date:'2020-11-01',action:'Embauche',detail:'Recrutement CDI - Assistante',par:'RH'}]},
];

const SEED_EXTERNES = [
  {id:'EE001',prenom:'Thomas',nom:'Ngono',telephone:'+237 677 100 001',poste:'Technicien Installation 5G',specialite:'5G NR / 4G LTE',status:'actif',matricule:'CLN-EXT-001',banque:'MTN Mobile Money',rib:'677100001',ville:'Douala',cin:'EXT001',dateNaissance:'1990-05-12',projetsActifs:['PROJ-2024-001'],totalPercu:13500000,tauxJournalier:85000,contrat:'Freelance',notePerf:4.8,nbProjets:7},
  {id:'EE002',prenom:'Jean',nom:'Mbarga',telephone:'+237 677 100 002',poste:'Ingénieur RF Senior',specialite:'Survey & Optimisation RF',status:'actif',matricule:'CLN-EXT-002',banque:'Orange Money',rib:'698100002',ville:'Yaoundé',cin:'EXT002',dateNaissance:'1985-09-22',projetsActifs:['PROJ-2024-002'],totalPercu:8500000,tauxJournalier:120000,contrat:'Freelance',notePerf:4.9,nbProjets:12},
  {id:'EE003',prenom:'Samuel',nom:'Djomo',telephone:'+237 677 100 003',poste:'Technicien Maintenance',specialite:'3G UMTS / 4G LTE',status:'actif',matricule:'CLN-EXT-003',banque:'BICEC',rib:'CM21 1001 8888',ville:'Douala',cin:'EXT003',dateNaissance:'1992-03-18',projetsActifs:['PROJ-2024-004'],totalPercu:6200000,tauxJournalier:70000,contrat:'Freelance',notePerf:4.5,nbProjets:5},
  {id:'EE004',prenom:'Ali',nom:'Moussa',telephone:'+237 677 100 004',poste:'Chef d\'équipe terrain',specialite:'Supervision & HSE',status:'actif',matricule:'CLN-EXT-004',banque:'MTN Mobile Money',rib:'677100004',ville:'Garoua',cin:'EXT004',dateNaissance:'1983-11-30',projetsActifs:['PROJ-2024-003'],totalPercu:4800000,tauxJournalier:95000,contrat:'Freelance',notePerf:4.7,nbProjets:9},
  {id:'EE005',prenom:'René',nom:'Talla',telephone:'+237 677 100 005',poste:'Câbleur fibre optique',specialite:'Fibre optique FTTH/FTTB',status:'actif',matricule:'CLN-EXT-005',banque:'Orange Money',rib:'698100005',ville:'Bafoussam',cin:'EXT005',dateNaissance:'1995-07-08',projetsActifs:[],totalPercu:2100000,tauxJournalier:55000,contrat:'Freelance',notePerf:4.2,nbProjets:3},
];

const SEED_CONGES = [
  {id:'C001',employeId:'EI005',employeNom:'Jean Fouda',type:'Congé annuel',dateDebut:'2024-03-01',dateFin:'2024-03-20',jours:20,status:'approuve',motif:'Congé annuel Q1 2024',remplacant:'Pierre Etoga',approuvePar:'Aline Biya',dateApprobation:'2024-02-20'},
  {id:'C002',employeId:'EI003',employeNom:'Aline Biya',type:'Congé maladie',dateDebut:'2024-03-10',dateFin:'2024-03-12',jours:3,status:'approuve',motif:'Ordonnance médicale',remplacant:'Sandra Nguele',approuvePar:'Marie Kamga',dateApprobation:'2024-03-10'},
  {id:'C003',employeId:'EI001',employeNom:'Marie Kamga',type:'Congé exceptionnel',dateDebut:'2024-04-05',dateFin:'2024-04-06',jours:2,status:'en_attente',motif:'Mariage frère',remplacant:'',approuvePar:'',dateApprobation:''},
];

const SEED_POINTAGES = [
  {id:'P001',employeId:'EI001',date:'2024-03-15',entree:'08:02',sortie:'17:45',pause:60,heures:8.72,status:'present',notes:''},
  {id:'P002',employeId:'EI002',date:'2024-03-15',entree:'07:55',sortie:'18:10',pause:60,heures:9.25,status:'present',notes:''},
  {id:'P003',employeId:'EI003',date:'2024-03-15',entree:'09:15',sortie:'17:30',pause:60,heures:7.25,status:'retard',notes:'Retard 1h15'},
  {id:'P004',employeId:'EI004',date:'2024-03-15',entree:'08:00',sortie:'17:00',pause:60,heures:8,status:'present',notes:''},
  {id:'P005',employeId:'EI005',date:'2024-03-15',entree:'',sortie:'',pause:0,heures:0,status:'absent',notes:'Congé annuel'},
  {id:'P006',employeId:'EI006',date:'2024-03-15',entree:'08:30',sortie:'17:30',pause:60,heures:8,status:'present',notes:''},
];

const SEED_BULLETINS = [
  {id:'B001',employeId:'EI001',mois:2,annee:2024,salaireBase:650000,primes:75000,avantages:50000,deductions:0,brut:775000,net:775000,status:'paye',datePaiement:'2024-02-28',modePaiement:'Virement BICEC'},
  {id:'B002',employeId:'EI002',mois:2,annee:2024,salaireBase:580000,primes:40000,avantages:30000,deductions:0,brut:650000,net:650000,status:'paye',datePaiement:'2024-02-28',modePaiement:'Virement SGC'},
  {id:'B003',employeId:'EI003',mois:2,annee:2024,salaireBase:480000,primes:0,avantages:25000,deductions:0,brut:505000,net:505000,status:'paye',datePaiement:'2024-02-28',modePaiement:'Virement Afriland'},
  {id:'B004',employeId:'EI001',mois:3,annee:2024,salaireBase:650000,primes:75000,avantages:50000,deductions:0,brut:775000,net:775000,status:'en_attente',datePaiement:null,modePaiement:'Virement BICEC'},
  {id:'B005',employeId:'EI002',mois:3,annee:2024,salaireBase:580000,primes:40000,avantages:30000,deductions:0,brut:650000,net:650000,status:'en_attente',datePaiement:null,modePaiement:'Virement SGC'},
  {id:'B006',employeId:'EI003',mois:3,annee:2024,salaireBase:480000,primes:0,avantages:25000,deductions:0,brut:505000,net:505000,status:'en_attente',datePaiement:null,modePaiement:'Virement Afriland'},
  {id:'B007',employeId:'EI004',mois:3,annee:2024,salaireBase:420000,primes:20000,avantages:20000,deductions:0,brut:460000,net:460000,status:'en_attente',datePaiement:null,modePaiement:'Virement BICEC'},
  {id:'B008',employeId:'EI006',mois:3,annee:2024,salaireBase:320000,primes:0,avantages:15000,deductions:0,brut:335000,net:335000,status:'en_attente',datePaiement:null,modePaiement:'Orange Money'},
];

const SEED_PAIEMENTS_EXT = [
  {id:'PE001',employeId:'EE001',projet:'PROJ-2024-001',client:'MTN Cameroun',phase:'Phase 1 — 30%',montantProjet:45000000,pct:30,montantNet:13500000,status:'paye',datePaiement:'2024-01-20',modePaiement:'MTN Mobile Money',ref:'PAY-EXT-001'},
  {id:'PE002',employeId:'EE002',projet:'PROJ-2024-002',client:'Orange Cameroun',phase:'Paiement unique',montantProjet:12000000,pct:100,montantNet:8500000,status:'paye',datePaiement:'2024-02-15',modePaiement:'Orange Money',ref:'PAY-EXT-002'},
  {id:'PE003',employeId:'EE001',projet:'PROJ-2024-001',client:'MTN Cameroun',phase:'Phase 2 — 40%',montantProjet:45000000,pct:40,montantNet:18000000,status:'en_attente',datePaiement:null,modePaiement:'MTN Mobile Money',ref:null},
  {id:'PE004',employeId:'EE003',projet:'PROJ-2024-004',client:'MTN Cameroun',phase:'Phase 1 — 25%',montantProjet:18500000,pct:25,montantNet:4625000,status:'en_attente',datePaiement:null,modePaiement:'Virement BICEC',ref:null},
];

const MOIS_LABELS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

// ===== PROFIL EMPLOYÉ COMPLET =====
const ProfilEmploye = ({employe,onClose,onUpdate,bulletins,estExterne}) => {
  const [activeTab, setActiveTab] = useState('infos');
  const ac = getAvatarColor(employe.prenom+employe.nom);
  const anciennete = employe.dateEmbauche ? Math.floor((Date.now()-new Date(employe.dateEmbauche))/(1000*60*60*24*365)) : 0;
  const bulletinsEmp = bulletins.filter(b=>b.employeId===employe.id);

  const TABS_INTERNES = [
    {id:'infos',l:'Informations',i:'user'},
    {id:'documents',l:'Documents',i:'doc'},
    {id:'paie',l:'Paie & Rémunération',i:'payslip'},
    {id:'historique',l:'Historique RH',i:'clock'},
    {id:'pointage',l:'Pointage',i:'calendar'},
  ];
  const TABS_EXTERNES = [
    {id:'infos',l:'Informations',i:'user'},
    {id:'projets',l:'Projets & Paiements',i:'link'},
    {id:'performance',l:'Performance',i:'star'},
  ];
  const TABS = estExterne ? TABS_EXTERNES : TABS_INTERNES;

  return (
    <Panel
      title=""
      onClose={onClose}
      width={860}
      actions={
        <div style={{display:'flex',gap:8,width:'100%',justifyContent:'space-between'}}>
          <div style={{display:'flex',gap:8}}>
            <Btn label="Télécharger dossier" icon="download" sm/>
            <Btn label="Envoyer email" icon="mail" sm/>
          </div>
          <div style={{display:'flex',gap:8}}>
            <Btn label="Modifier le profil" icon="edit" variant="primary" sm/>
            {!estExterne&&<Btn label="Générer bulletin" icon="payslip" variant="green" sm/>}
          </div>
        </div>
      }
    >
      {/* Header profil — style Workday/SuccessFactors */}
      <div style={{background:`linear-gradient(135deg, ${C.primary} 0%, ${C.primary2} 100%)`,padding:'32px 32px 0',position:'relative'}}>
        {/* Status badge */}
        <div style={{position:'absolute',top:16,right:20}}>
          <Badge status={employe.status}/>
        </div>

        <div style={{display:'flex',gap:20,alignItems:'flex-end',marginBottom:0}}>
          {/* Avatar large */}
          <div style={{flexShrink:0}}>
            <div style={{width:88,height:88,borderRadius:'50%',background:ac.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:700,color:ac.text,border:'4px solid rgba(255,255,255,0.2)'}}>
              {getInitials(employe.prenom,employe.nom)}
            </div>
          </div>

          {/* Infos principales */}
          <div style={{flex:1,paddingBottom:16}}>
            <div style={{fontSize:22,fontWeight:700,color:'white',marginBottom:4}}>
              {employe.prenom} {employe.nom}
            </div>
            <div style={{fontSize:14,color:'rgba(255,255,255,0.75)',marginBottom:8}}>
              {employe.poste} {employe.departement&&`· ${employe.departement}`}
            </div>
            <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
              {[
                {i:'briefcase',v:employe.matricule},
                {i:'mail',v:employe.email},
                {i:'phone',v:employe.telephone},
                {i:'building',v:employe.ville},
              ].filter(x=>x.v).map(item=>(
                <div key={item.i} style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:'rgba(255,255,255,0.7)'}}>
                  <Icon n={item.i} size={12} color="rgba(255,255,255,0.6)"/>
                  {item.v}
                </div>
              ))}
            </div>
          </div>

          {/* Stats rapides */}
          {!estExterne&&(
            <div style={{display:'flex',gap:1,paddingBottom:0}}>
              {[
                {l:'Ancienneté',v:`${anciennete} an${anciennete>1?'s':''}`,c:'rgba(255,255,255,0.9)'},
                {l:'Contrat',v:employe.contrat,c:'rgba(255,255,255,0.9)'},
              ].map(s=>(
                <div key={s.l} style={{textAlign:'center',padding:'8px 20px',borderLeft:'1px solid rgba(255,255,255,0.1)'}}>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:0.5,marginBottom:3}}>{s.l}</div>
                  <div style={{fontSize:14,fontWeight:600,color:s.c}}>{s.v}</div>
                </div>
              ))}
            </div>
          )}
          {estExterne&&(
            <div style={{display:'flex',gap:1,paddingBottom:0}}>
              {[
                {l:'Note',v:`${employe.notePerf}/5`,c:'#fbbf24'},
                {l:'Projets',v:employe.nbProjets,c:'rgba(255,255,255,0.9)'},
                {l:'Total perçu',v:`${fmtN(employe.totalPercu)} FCFA`,c:'rgba(255,255,255,0.9)'},
              ].map(s=>(
                <div key={s.l} style={{textAlign:'center',padding:'8px 20px',borderLeft:'1px solid rgba(255,255,255,0.1)'}}>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:0.5,marginBottom:3}}>{s.l}</div>
                  <div style={{fontSize:14,fontWeight:600,color:s.c}}>{s.v}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:0,marginTop:16,overflowX:'auto'}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
              display:'flex',alignItems:'center',gap:6,
              padding:'10px 18px',border:'none',
              borderBottom:`2px solid ${activeTab===t.id?'white':'transparent'}`,
              background:'transparent',color:activeTab===t.id?'white':'rgba(255,255,255,0.5)',
              fontWeight:activeTab===t.id?600:400,fontSize:13,cursor:'pointer',
              whiteSpace:'nowrap',fontFamily:'inherit',transition:'all .15s',
            }}>
              <Icon n={t.i} size={13} color={activeTab===t.id?'white':'rgba(255,255,255,0.5)'}/>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu onglets */}
      <div style={{padding:'24px 32px'}}>

        {/* ONGLET INFORMATIONS */}
        {activeTab==='infos'&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            {/* Infos personnelles */}
            <Card title="Informations personnelles" icon="user">
              <div style={{padding:'4px 0'}}>
                {[
                  {l:'Date de naissance',v:fmtD(employe.dateNaissance)},
                  {l:'Lieu de naissance',v:employe.lieuNaissance},
                  {l:'Nationalité',v:employe.nationalite},
                  {l:'N° CIN / Passeport',v:employe.cin},
                  {l:'Ville de résidence',v:employe.ville},
                  {l:'Adresse',v:employe.adresse},
                  {l:'Niveau d\'études',v:employe.niveauEtudes},
                ].map((item,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 20px',background:i%2===0?C.white:C.bg,borderBottom:`1px solid ${C.border2}`}}>
                    <span style={{fontSize:12,color:C.muted,fontWeight:500}}>{item.l}</span>
                    <span style={{fontSize:13,fontWeight:500,color:C.text}}>{item.v||'—'}</span>
                  </div>
                ))}
              </div>
            </Card>

            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {/* Infos professionnelles */}
              <Card title="Informations professionnelles" icon="briefcase">
                <div style={{padding:'4px 0'}}>
                  {[
                    {l:'Matricule',v:employe.matricule},
                    {l:'Poste',v:employe.poste},
                    ...(employe.departement?[{l:'Département',v:employe.departement}]:[]),
                    ...(employe.dateEmbauche?[{l:'Date d\'embauche',v:fmtD(employe.dateEmbauche)}]:[]),
                    {l:'Type de contrat',v:employe.contrat},
                    ...(employe.specialite?[{l:'Spécialité',v:employe.specialite}]:[]),
                  ].map((item,i)=>(
                    <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 20px',background:i%2===0?C.white:C.bg,borderBottom:`1px solid ${C.border2}`}}>
                      <span style={{fontSize:12,color:C.muted,fontWeight:500}}>{item.l}</span>
                      <span style={{fontSize:13,fontWeight:500,color:C.text}}>{item.v||'—'}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Contact & Banque */}
              <Card title="Coordonnées bancaires" icon="shield">
                <div style={{padding:'4px 0'}}>
                  {[
                    {l:'Banque / Mobile Money',v:employe.banque},
                    {l:'RIB / Numéro',v:employe.rib},
                  ].map((item,i)=>(
                    <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 20px',background:i%2===0?C.white:C.bg,borderBottom:`1px solid ${C.border2}`}}>
                      <span style={{fontSize:12,color:C.muted,fontWeight:500}}>{item.l}</span>
                      <span style={{fontSize:13,fontWeight:600,color:C.text,fontFamily:item.l==='RIB / Numéro'?'monospace':'inherit'}}>{item.v||'—'}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Contact urgence */}
              {employe.urgenceNom&&(
                <Card title="Contact d'urgence" icon="alert">
                  <div style={{padding:'4px 0'}}>
                    {[
                      {l:'Nom',v:employe.urgenceNom},
                      {l:'Téléphone',v:employe.urgenceTel},
                      {l:'Lien',v:employe.urgenceLien},
                    ].map((item,i)=>(
                      <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'9px 20px',background:i%2===0?C.white:C.bg,borderBottom:`1px solid ${C.border2}`}}>
                        <span style={{fontSize:12,color:C.muted}}>{item.l}</span>
                        <span style={{fontSize:13,fontWeight:500,color:C.text}}>{item.v}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* ONGLET DOCUMENTS */}
        {activeTab==='documents'&&(
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <span style={{fontSize:14,fontWeight:600,color:C.text}}>{employe.documents?.length||0} document(s)</span>
              <Btn label="Ajouter document" icon="upload" variant="primary" sm/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {(employe.documents||[]).map((doc,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',background:C.white,border:`1px solid ${C.border}`,borderRadius:8,cursor:'pointer',transition:'all .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                  <div style={{width:40,height:40,borderRadius:8,background:C.accent_bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Icon n="doc" size={20} color={C.accent}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{doc.nom}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2}}>Ajouté le {fmtD(doc.date)}</div>
                  </div>
                  <div style={{display:'flex',gap:4}}>
                    <button style={{width:28,height:28,borderRadius:4,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon n="eye" size={13} color={C.muted}/></button>
                    <button style={{width:28,height:28,borderRadius:4,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon n="download" size={13} color={C.muted}/></button>
                  </div>
                </div>
              ))}
              {(!employe.documents||employe.documents.length===0)&&(
                <div style={{gridColumn:'1/-1',padding:'40px',textAlign:'center',color:C.muted,background:C.bg,borderRadius:8,border:`1px dashed ${C.border}`}}>
                  <Icon n="doc" size={32} color={C.border} style={{margin:'0 auto 12px',display:'block'}}/>
                  <div style={{fontSize:14,fontWeight:500}}>Aucun document</div>
                  <div style={{fontSize:12,marginTop:4}}>Ajoutez contrat, CIN, diplômes...</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ONGLET PAIE */}
        {activeTab==='paie'&&(
          <div>
            {/* Résumé rémunération — PAS affiché si pas autorisé */}
            <div style={{background:`linear-gradient(135deg,${C.primary},${C.primary2})`,borderRadius:10,padding:'20px 24px',marginBottom:20,color:'white'}}>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.6)',textTransform:'uppercase',letterSpacing:0.5,marginBottom:4}}>Salaire de base</div>
              <div style={{fontSize:28,fontWeight:700}}>{fmtN(employe.salaireBase)} FCFA</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.6)',marginTop:4}}>par mois · {employe.contrat}</div>
            </div>

            <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:12}}>Bulletins de paie</div>
            {bulletinsEmp.length===0?(
              <div style={{padding:'32px',textAlign:'center',color:C.muted,background:C.bg,borderRadius:8}}>Aucun bulletin généré</div>
            ):(
              <Table
                cols={['Période','Salaire brut','Net à payer','Mode paiement','Date paiement','Statut','']}
                rows={bulletinsEmp.map(b=>[
                  <span style={{fontWeight:500}}>{MOIS_LABELS[b.mois-1]} {b.annee}</span>,
                  <span style={{fontWeight:600,color:C.text2}}>{fmtN(b.brut)} FCFA</span>,
                  <span style={{fontWeight:700,color:C.accent}}>{fmtN(b.net)} FCFA</span>,
                  <span style={{fontSize:12,color:C.muted}}>{b.modePaiement}</span>,
                  <span style={{fontSize:12,color:C.muted}}>{b.datePaiement?fmtD(b.datePaiement):'—'}</span>,
                  <Badge status={b.status}/>,
                  <div style={{display:'flex',gap:4}}>
                    <button style={{width:28,height:28,borderRadius:4,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon n="print" size={12} color={C.muted}/></button>
                    <button style={{width:28,height:28,borderRadius:4,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon n="download" size={12} color={C.muted}/></button>
                  </div>
                ])}
              />
            )}
          </div>
        )}

        {/* ONGLET HISTORIQUE */}
        {activeTab==='historique'&&(
          <div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
              <span style={{fontSize:14,fontWeight:600,color:C.text}}>Historique des événements RH</span>
              <Btn label="Ajouter événement" icon="plus" sm/>
            </div>
            <div style={{position:'relative'}}>
              <div style={{position:'absolute',left:19,top:0,bottom:0,width:2,background:C.border2}}/>
              {(employe.historique||[]).map((h,i)=>(
                <div key={i} style={{display:'flex',gap:16,marginBottom:20,position:'relative'}}>
                  <div style={{width:40,height:40,borderRadius:'50%',background:h.action==='Promotion'?C.green_bg:h.action==='Embauche'?C.accent_bg:h.action==='Augmentation'?C.orange_bg:C.bg2,border:`2px solid ${h.action==='Promotion'?C.green:h.action==='Embauche'?C.accent:h.action==='Augmentation'?C.orange:C.border}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,zIndex:1}}>
                    <Icon n={h.action==='Promotion'?'star':h.action==='Embauche'?'user':h.action==='Augmentation'?'chart':'doc'} size={16} color={h.action==='Promotion'?C.green:h.action==='Embauche'?C.accent:h.action==='Augmentation'?C.orange:C.muted}/>
                  </div>
                  <div style={{flex:1,background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:'14px 18px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                      <span style={{fontSize:14,fontWeight:600,color:C.text}}>{h.action}</span>
                      <span style={{fontSize:11,color:C.muted}}>{fmtD(h.date)}</span>
                    </div>
                    <div style={{fontSize:13,color:C.text2,marginBottom:4}}>{h.detail}</div>
                    <div style={{fontSize:11,color:C.muted}}>Par {h.par}</div>
                  </div>
                </div>
              ))}
              {(!employe.historique||employe.historique.length===0)&&(
                <div style={{padding:'32px',textAlign:'center',color:C.muted}}>Aucun événement enregistré</div>
              )}
            </div>
          </div>
        )}

        {/* ONGLET POINTAGE */}
        {activeTab==='pointage'&&(
          <div>
            <div style={{display:'flex',gap:12,marginBottom:20}}>
              {[
                {l:'Jours présents',v:22,c:C.green},
                {l:'Jours absents',v:2,c:C.red},
                {l:'Retards',v:1,c:C.orange},
                {l:'Heures ce mois',v:'168h',c:C.accent},
              ].map(k=>(
                <div key={k.l} style={{flex:1,background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:'14px 16px'}}>
                  <div style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:0.4,marginBottom:4}}>{k.l}</div>
                  <div style={{fontSize:22,fontWeight:700,color:k.c}}>{k.v}</div>
                </div>
              ))}
            </div>
            <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,overflow:'hidden'}}>
              <div style={{padding:'14px 20px',borderBottom:`1px solid ${C.border2}`,fontSize:14,fontWeight:600,color:C.text}}>Pointage — Mars 2024</div>
              <Table
                cols={['Date','Entrée','Sortie','Pause','Heures','Statut','Notes']}
                rows={SEED_POINTAGES.filter(p=>p.employeId===employe.id).map(p=>[
                  <span style={{fontWeight:500}}>{fmtD(p.date)}</span>,
                  <span style={{fontSize:13,color:C.green,fontWeight:600}}>{p.entree||'—'}</span>,
                  <span style={{fontSize:13,color:C.text2}}>{p.sortie||'—'}</span>,
                  <span style={{fontSize:12,color:C.muted}}>{p.pause?`${p.pause}min`:'—'}</span>,
                  <span style={{fontWeight:600}}>{p.heures?`${p.heures}h`:'—'}</span>,
                  <Badge status={p.status}/>,
                  <span style={{fontSize:12,color:C.muted}}>{p.notes||'—'}</span>,
                ])}
                empty="Aucun pointage enregistré"
              />
            </div>
          </div>
        )}

        {/* ONGLET PROJETS EXTERNES */}
        {activeTab==='projets'&&(
          <div>
            <div style={{display:'flex',gap:12,marginBottom:20}}>
              {[
                {l:'Projets réalisés',v:employe.nbProjets,c:C.accent},
                {l:'Total perçu',v:`${fmtN(employe.totalPercu)} FCFA`,c:C.green},
                {l:'Taux journalier',v:`${fmtN(employe.tauxJournalier)} FCFA`,c:C.text},
              ].map(k=>(
                <div key={k.l} style={{flex:1,background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:'14px 16px'}}>
                  <div style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:0.4,marginBottom:4}}>{k.l}</div>
                  <div style={{fontSize:typeof k.v==='string'&&k.v.length>10?16:22,fontWeight:700,color:k.c}}>{k.v}</div>
                </div>
              ))}
            </div>
            <Table
              cols={['Projet','Client','Phase','%','Montant net','Date','Statut']}
              rows={SEED_PAIEMENTS_EXT.filter(p=>p.employeId===employe.id).map(p=>[
                <span style={{fontWeight:600,color:C.accent}}>{p.projet}</span>,
                <span>{p.client}</span>,
                <span style={{fontSize:12,color:C.muted}}>{p.phase}</span>,
                <span style={{padding:'2px 8px',borderRadius:20,background:C.green_bg,color:C.green,fontSize:12,fontWeight:600}}>{p.pct}%</span>,
                <strong style={{color:C.orange}}>{fmtN(p.montantNet)} FCFA</strong>,
                <span style={{fontSize:12,color:C.muted}}>{p.datePaiement?fmtD(p.datePaiement):'—'}</span>,
                <Badge status={p.status}/>,
              ])}
              empty="Aucun paiement enregistré"
            />
          </div>
        )}

        {/* ONGLET PERFORMANCE */}
        {activeTab==='performance'&&(
          <div>
            <div style={{display:'flex',gap:12,marginBottom:20}}>
              <div style={{flex:1,background:`linear-gradient(135deg,${C.primary},${C.primary2})`,borderRadius:10,padding:'20px 24px',color:'white',textAlign:'center'}}>
                <div style={{fontSize:48,fontWeight:700,color:'#fbbf24'}}>{employe.notePerf}</div>
                <div style={{fontSize:16,color:'rgba(255,255,255,0.7)'}}>/ 5 — Note globale</div>
                <div style={{display:'flex',justifyContent:'center',gap:4,marginTop:8}}>
                  {[1,2,3,4,5].map(s=>(
                    <svg key={s} width="20" height="20" viewBox="0 0 24 24" fill={s<=Math.round(employe.notePerf)?'#fbbf24':'rgba(255,255,255,0.2)'} stroke={s<=Math.round(employe.notePerf)?'#fbbf24':'rgba(255,255,255,0.3)'} strokeWidth="1.5">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <div style={{background:C.bg,borderRadius:8,padding:20,textAlign:'center',color:C.muted}}>
              <Icon n="chart" size={32} color={C.border} style={{margin:'0 auto 12px',display:'block'}}/>
              <div style={{fontSize:14}}>Historique des évaluations à venir</div>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
};

// ===== BULLETIN DE PAIE OFFICIEL =====
const BulletinOfficiel = ({bulletin,employe,onClose,onValider}) => {
  if(!bulletin||!employe) return null;
  return (
    <Modal title="Bulletin de paie" onClose={onClose} maxWidth={640}>
      <div style={{padding:'24px'}}>
        {/* En-tête société */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,paddingBottom:16,borderBottom:`2px solid ${C.primary}`}}>
          <div>
            <div style={{fontSize:20,fontWeight:800,color:C.primary,letterSpacing:1}}>CLEANIT ERP</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>Télécommunications · Douala, Cameroun</div>
            <div style={{fontSize:11,color:C.muted}}>RCCM : DLA/2019/B/1234 · NIU : M012345678901P</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:14,fontWeight:700,color:C.primary,textTransform:'uppercase',letterSpacing:0.5}}>Bulletin de Paie</div>
            <div style={{fontSize:13,color:C.text2,marginTop:4}}>{MOIS_LABELS[bulletin.mois-1]} {bulletin.annee}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>Réf: {bulletin.id}</div>
          </div>
        </div>

        {/* Infos employé */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20,padding:'14px 16px',background:C.bg,borderRadius:8}}>
          {[
            {l:'Matricule',v:employe.matricule},
            {l:'Nom & Prénom',v:`${employe.prenom} ${employe.nom}`},
            {l:'Poste',v:employe.poste},
            {l:'Département',v:employe.departement||'—'},
            {l:'Date d\'embauche',v:fmtD(employe.dateEmbauche)},
            {l:'Contrat',v:employe.contrat},
          ].map(item=>(
            <div key={item.l}>
              <div style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:0.4,marginBottom:2}}>{item.l}</div>
              <div style={{fontSize:13,fontWeight:600,color:C.text}}>{item.v}</div>
            </div>
          ))}
        </div>

        {/* Tableau salaire */}
        <table style={{width:'100%',borderCollapse:'collapse',marginBottom:16}}>
          <thead>
            <tr style={{background:C.primary}}>
              <th style={{padding:'10px 14px',textAlign:'left',fontSize:12,fontWeight:600,color:'white',textTransform:'uppercase',letterSpacing:0.3}}>Libellé</th>
              <th style={{padding:'10px 14px',textAlign:'right',fontSize:12,fontWeight:600,color:'white',textTransform:'uppercase',letterSpacing:0.3}}>Montant (FCFA)</th>
            </tr>
          </thead>
          <tbody>
            {[
              {l:'Salaire de base',v:bulletin.salaireBase,color:C.text},
              ...(bulletin.primes>0?[{l:'Primes & Bonus',v:bulletin.primes,color:C.green}]:[]),
              ...(bulletin.avantages>0?[{l:'Avantages en nature',v:bulletin.avantages,color:C.accent}]:[]),
            ].map((item,i)=>(
              <tr key={i} style={{borderBottom:`1px solid ${C.border2}`,background:i%2===0?C.white:C.bg}}>
                <td style={{padding:'11px 14px',fontSize:13,color:item.color}}>{item.l}</td>
                <td style={{padding:'11px 14px',fontSize:13,fontWeight:600,color:item.color,textAlign:'right'}}>{fmtN(item.v)}</td>
              </tr>
            ))}
            <tr style={{background:C.green_bg,borderTop:`2px solid ${C.green}`}}>
              <td style={{padding:'12px 14px',fontSize:14,fontWeight:700,color:C.green}}>SALAIRE BRUT</td>
              <td style={{padding:'12px 14px',fontSize:14,fontWeight:700,color:C.green,textAlign:'right'}}>{fmtN(bulletin.brut)}</td>
            </tr>
            {bulletin.deductions>0&&(
              <tr style={{background:C.red_bg}}>
                <td style={{padding:'11px 14px',fontSize:13,color:C.red}}>Retenues & Déductions</td>
                <td style={{padding:'11px 14px',fontSize:13,fontWeight:600,color:C.red,textAlign:'right'}}>- {fmtN(bulletin.deductions)}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr style={{background:C.primary}}>
              <td style={{padding:'14px',fontSize:15,fontWeight:700,color:'white'}}>NET À PAYER</td>
              <td style={{padding:'14px',fontSize:20,fontWeight:800,color:'white',textAlign:'right'}}>{fmtN(bulletin.net)} FCFA</td>
            </tr>
          </tfoot>
        </table>

        {/* Paiement */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',background:C.bg,borderRadius:6,marginBottom:16}}>
          <div>
            <div style={{fontSize:11,color:C.muted,marginBottom:2}}>Mode de paiement</div>
            <div style={{fontSize:13,fontWeight:600,color:C.text}}>{bulletin.modePaiement}</div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <Badge status={bulletin.status}/>
            {bulletin.datePaiement&&<span style={{fontSize:12,color:C.muted}}>Payé le {fmtD(bulletin.datePaiement)}</span>}
          </div>
        </div>

        {/* Signature */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginTop:20,paddingTop:16,borderTop:`1px solid ${C.border}`}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:24}}>Signature employé</div>
            <div style={{height:1,background:C.border}}/>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:24}}>Signature Direction</div>
            <div style={{height:1,background:C.border}}/>
          </div>
        </div>

        <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:16}}>
          <Btn label="Fermer" onClick={onClose}/>
          <Btn label="Imprimer" icon="print" variant="ghost"/>
          <Btn label="Télécharger PDF" icon="download"/>
          {bulletin.status==='en_attente'&&<Btn label="Valider & Marquer payé" icon="check" variant="green" onClick={()=>{onValider(bulletin.id);onClose();}}/>}
        </div>
      </div>
    </Modal>
  );
};

// ===== FORMULAIRE AJOUT EMPLOYÉ =====
const FormulaireEmploye = ({type,onClose,onSave}) => {
  const [step,setStep] = useState(1);
  const [prenom,setPrenom] = useState('');
  const [nom,setNom] = useState('');
  const [email,setEmail] = useState('');
  const [telephone,setTelephone] = useState('');
  const [poste,setPoste] = useState('');
  const [departement,setDepartement] = useState('');
  const [dateEmbauche,setDateEmbauche] = useState('');
  const [dateNaissance,setDateNaissance] = useState('');
  const [salaireBase,setSalaireBase] = useState('');
  const [contrat,setContrat] = useState('CDI');
  const [genre,setGenre] = useState('');
  const [ville,setVille] = useState('');
  const [adresse,setAdresse] = useState('');
  const [cin,setCin] = useState('');
  const [niveauEtudes,setNiveauEtudes] = useState('');
  const [banque,setBanque] = useState('');
  const [rib,setRib] = useState('');
  const [urgenceNom,setUrgenceNom] = useState('');
  const [urgenceTel,setUrgenceTel] = useState('');
  const [urgenceLien,setUrgenceLien] = useState('');
  const [specialite,setSpecialite] = useState('');
  const [tauxJournalier,setTauxJournalier] = useState('');

  const steps = type==='interne'
    ? ['Identité','Poste & Contrat','Banque & Urgence']
    : ['Identité','Spécialité','Coordonnées bancaires'];

  const save = () => {
    const id = `${type==='interne'?'EI':'EE'}${Date.now()}`;
    const emp = {
      id, prenom, nom, email, telephone, poste, banque, rib, cin,
      matricule:`CLN-${type==='interne'?'INT':'EXT'}-${String(Math.floor(Math.random()*900+100))}`,
      status:'actif', genre, ville, adresse, niveauEtudes,
      dateNaissance, nationalite:'Camerounaise',
      urgenceNom, urgenceTel, urgenceLien,
      documents:[], historique:[{date:new Date().toISOString().split('T')[0],action:'Embauche',detail:`Recrutement ${contrat} - ${poste}`,par:'RH'}],
      ...(type==='interne'?{departement,dateEmbauche,salaireBase:Number(salaireBase)||0,contrat,permissions:'employe'}
        :{specialite,tauxJournalier:Number(tauxJournalier)||0,contrat:'Freelance',projetsActifs:[],totalPercu:0,notePerf:0,nbProjets:0}),
    };
    onSave(emp); onClose();
  };

  const isInterne = type==='interne';

  return (
    <Modal title={isInterne?'Nouvel employé interne':'Nouveau technicien externe'} onClose={onClose} maxWidth={620}>
      <div style={{padding:'20px 24px'}}>
        {/* Steps */}
        <div style={{display:'flex',gap:0,marginBottom:24}}>
          {steps.map((s,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',flex:i<steps.length-1?1:'auto'}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:step>i+1?C.green:step===i+1?C.accent:C.bg2,display:'flex',alignItems:'center',justifyContent:'center',color:step>=i+1?'white':C.muted,fontSize:12,fontWeight:700,flexShrink:0}}>
                  {step>i+1?<Icon n="check" size={13} color="white"/>:i+1}
                </div>
                <span style={{fontSize:12,fontWeight:step===i+1?600:400,color:step===i+1?C.accent:step>i+1?C.green:C.muted}}>{s}</span>
              </div>
              {i<steps.length-1&&<div style={{flex:1,height:1,background:step>i+1?C.green:C.border,margin:'0 12px'}}/>}
            </div>
          ))}
        </div>

        {/* STEP 1 — Identité */}
        {step===1&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <Field label="Prénom" required><Input value={prenom} onChange={setPrenom} placeholder="Prénom"/></Field>
            <Field label="Nom" required><Input value={nom} onChange={setNom} placeholder="Nom de famille"/></Field>
            <Field label="Genre"><Select value={genre} onChange={setGenre} options={[{v:'M',l:'Masculin'},{v:'F',l:'Féminin'}]} placeholder="Genre"/></Field>
            <Field label="Date de naissance"><Input type="date" value={dateNaissance} onChange={setDateNaissance}/></Field>
            <Field label="N° CIN / Passeport"><Input value={cin} onChange={setCin} placeholder="Ex: 12345678"/></Field>
            <Field label="Téléphone" required><Input value={telephone} onChange={setTelephone} placeholder="+237 6XX XXX XXX"/></Field>
            {isInterne&&<Field label="Email professionnel"><Input type="email" value={email} onChange={setEmail} placeholder="prenom.nom@cleanit.cm"/></Field>}
            <Field label="Niveau d'études"><Select value={niveauEtudes} onChange={setNiveauEtudes} options={NIVEAUX} placeholder="Niveau"/></Field>
            <Field label="Ville" col1><Select value={ville} onChange={setVille} options={VILLES} placeholder="Ville de résidence"/></Field>
          </div>
        )}

        {/* STEP 2 — Poste / Spécialité */}
        {step===2&&isInterne&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <Field label="Poste" required><Select value={poste} onChange={setPoste} options={POSTES} placeholder="Sélectionner"/></Field>
            <Field label="Département" required><Select value={departement} onChange={setDepartement} options={DEPARTEMENTS} placeholder="Département"/></Field>
            <Field label="Type de contrat"><Select value={contrat} onChange={setContrat} options={CONTRATS}/></Field>
            <Field label="Date d'embauche" required><Input type="date" value={dateEmbauche} onChange={setDateEmbauche}/></Field>
            <Field label="Salaire de base (FCFA)" required col1><Input type="number" value={salaireBase} onChange={setSalaireBase} placeholder="Ex: 450 000"/></Field>
          </div>
        )}
        {step===2&&!isInterne&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <Field label="Poste" required><Select value={poste} onChange={setPoste} options={POSTES_EXT} placeholder="Sélectionner"/></Field>
            <Field label="Spécialité" required><Input value={specialite} onChange={setSpecialite} placeholder="Ex: 5G NR / 4G LTE"/></Field>
            <Field label="Taux journalier (FCFA)"><Input type="number" value={tauxJournalier} onChange={setTauxJournalier} placeholder="Ex: 85 000"/></Field>
          </div>
        )}

        {/* STEP 3 — Banque & Urgence */}
        {step===3&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div style={{gridColumn:'1/-1',fontSize:13,fontWeight:600,color:C.text,paddingBottom:8,borderBottom:`1px solid ${C.border2}`}}>Coordonnées bancaires</div>
            <Field label="Banque / Mobile Money" required><Select value={banque} onChange={setBanque} options={BANQUES} placeholder="Sélectionner"/></Field>
            <Field label="RIB / Numéro de compte" required><Input value={rib} onChange={setRib} placeholder="CM21 XXXX ou 6XX XXX XXX"/></Field>
            {isInterne&&(
              <>
                <div style={{gridColumn:'1/-1',fontSize:13,fontWeight:600,color:C.text,paddingBottom:8,borderBottom:`1px solid ${C.border2}`,marginTop:8}}>Contact d'urgence</div>
                <Field label="Nom complet"><Input value={urgenceNom} onChange={setUrgenceNom} placeholder="Prénom Nom"/></Field>
                <Field label="Téléphone"><Input value={urgenceTel} onChange={setUrgenceTel} placeholder="+237 6XX XXX XXX"/></Field>
                <Field label="Lien de parenté"><Select value={urgenceLien} onChange={setUrgenceLien} options={['Époux/Épouse','Père','Mère','Frère','Sœur','Ami(e)','Autre']} placeholder="Lien"/></Field>
              </>
            )}
          </div>
        )}

        <div style={{display:'flex',justifyContent:'space-between',gap:8,paddingTop:20,borderTop:`1px solid ${C.border2}`,marginTop:20}}>
          <Btn label="Annuler" onClick={onClose}/>
          <div style={{display:'flex',gap:8}}>
            {step>1&&<Btn label="← Retour" onClick={()=>setStep(s=>s-1)}/>}
            {step<steps.length&&<Btn label="Suivant →" onClick={()=>setStep(s=>s+1)} variant="primary"/>}
            {step===steps.length&&<Btn label="✓ Créer le profil" onClick={save} variant="green"/>}
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ===== ONGLET DASHBOARD RH =====
const DashboardRH = ({internes,externes,bulletins,paiementsExt,setTab}) => {
  const actifs = internes.filter(e=>e.status==='actif').length;
  const conge = internes.filter(e=>e.status==='conge').length;
  const bulletinsAttente = bulletins.filter(b=>b.status==='en_attente');
  const paiExtAttente = paiementsExt.filter(p=>p.status==='en_attente');

  // Répartition par département
  const parDep = DEPARTEMENTS.map(d=>{
    const n = internes.filter(e=>e.departement===d).length;
    return {dep:d,n};
  }).filter(x=>x.n>0).sort((a,b)=>b.n-a.n);
  const maxN = Math.max(...parDep.map(x=>x.n),1);

  // Présence aujourd'hui
  const presents = SEED_POINTAGES.filter(p=>p.status==='present').length;
  const absents = SEED_POINTAGES.filter(p=>p.status==='absent').length;
  const retards = SEED_POINTAGES.filter(p=>p.status==='retard').length;

  return (
    <div>
      {/* Alertes urgentes */}
      {(bulletinsAttente.length>0||paiExtAttente.length>0)&&(
        <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
          {bulletinsAttente.length>0&&(
            <div style={{flex:1,minWidth:280,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',background:'#fffbeb',border:`1px solid #fde68a`,borderRadius:8,borderLeft:`4px solid ${C.orange}`}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <Icon n="alert" size={18} color={C.orange}/>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:'#92400e'}}>{bulletinsAttente.length} bulletin(s) en attente de validation</div>
                  <div style={{fontSize:11,color:'#b45309'}}>À valider avant la fin du mois</div>
                </div>
              </div>
              <Btn label="Traiter" onClick={()=>setTab('paie')} sm/>
            </div>
          )}
          {paiExtAttente.length>0&&(
            <div style={{flex:1,minWidth:280,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',background:'#fff1f2',border:`1px solid #fecdd3`,borderRadius:8,borderLeft:`4px solid ${C.red}`}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <Icon n="alert" size={18} color={C.red}/>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:'#991b1b'}}>{paiExtAttente.length} paiement(s) externe(s) en attente</div>
                  <div style={{fontSize:11,color:'#b91c1c'}}>{fmtN(paiExtAttente.reduce((s,p)=>s+p.montantNet,0))} FCFA à décaisser</div>
                </div>
              </div>
              <Btn label="Traiter" onClick={()=>setTab('paiements_ext')} sm/>
            </div>
          )}
        </div>
      )}

      {/* KPIs — sans salaires visibles */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
        {[
          {l:'Effectif total',v:internes.length,sub:`${actifs} actifs · ${conge} en congé`,c:C.accent,bg:C.accent_bg,i:'users'},
          {l:'Techniciens externes',v:externes.length,sub:`${externes.filter(e=>e.status==='actif').length} disponibles`,c:C.purple,bg:C.purple_bg,i:'external'},
          {l:'Présents aujourd\'hui',v:presents,sub:`${retards} retard(s) · ${absents} absent(s)`,c:C.green,bg:C.green_bg,i:'check'},
          {l:'Bulletins ce mois',v:bulletins.filter(b=>b.mois===3&&b.annee===2024).length,sub:`${bulletinsAttente.length} en attente`,c:C.orange,bg:C.orange_bg,i:'payslip'},
        ].map(k=>(
          <div key={k.l} style={{background:C.white,borderRadius:10,padding:'18px 20px',border:`1px solid ${C.border}`,borderTop:`3px solid ${k.c}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:500,color:C.muted,textTransform:'uppercase',letterSpacing:0.4}}>{k.l}</div>
              <div style={{width:32,height:32,borderRadius:8,background:k.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Icon n={k.i} size={16} color={k.c}/>
              </div>
            </div>
            <div style={{fontSize:28,fontWeight:700,color:k.c,marginBottom:4}}>{k.v}</div>
            <div style={{fontSize:11,color:C.muted}}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Grille principale */}
      <div style={{display:'grid',gridTemplateColumns:'1.3fr 1fr',gap:16,marginBottom:16}}>

        {/* Répartition par département */}
        <Card title="Effectifs par département" icon="org">
          <div style={{padding:'4px 0'}}>
            {parDep.map(({dep,n},i)=>(
              <div key={dep} style={{padding:'10px 20px',display:'flex',alignItems:'center',gap:12,borderBottom:`1px solid ${C.border2}`,background:i%2===0?C.white:C.bg}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:500,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:4}}>{dep}</div>
                  <div style={{height:5,background:C.border2,borderRadius:3,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${(n/maxN)*100}%`,background:C.accent,borderRadius:3}}/>
                  </div>
                </div>
                <div style={{width:20,textAlign:'right',fontSize:13,fontWeight:700,color:C.text,flexShrink:0}}>{n}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Présence temps réel */}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <Card title="Présence — Aujourd'hui" icon="clock" action={()=>setTab('pointage')} actionLabel="Voir tout →">
            {/* Donut présence */}
            <div style={{padding:'16px 20px'}}>
              <div style={{display:'flex',gap:12,marginBottom:16}}>
                {[
                  {l:'Présents',v:presents,c:C.green,bg:C.green_bg},
                  {l:'Absents',v:absents,c:C.red,bg:C.red_bg},
                  {l:'Retards',v:retards,c:C.orange,bg:C.orange_bg},
                ].map(k=>(
                  <div key={k.l} style={{flex:1,textAlign:'center',padding:'10px 8px',background:k.bg,borderRadius:8}}>
                    <div style={{fontSize:20,fontWeight:700,color:k.c}}>{k.v}</div>
                    <div style={{fontSize:10,color:k.c,marginTop:2,fontWeight:500}}>{k.l}</div>
                  </div>
                ))}
              </div>
              {SEED_POINTAGES.slice(0,3).map((p,i)=>{
                const emp = SEED_INTERNES.find(e=>e.id===p.employeId);
                if(!emp) return null;
                const ac = getAvatarColor(emp.prenom+emp.nom);
                return (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:i<2?`1px solid ${C.border2}`:'none'}}>
                    <div style={{width:32,height:32,borderRadius:'50%',background:ac.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:ac.text,flexShrink:0}}>
                      {getInitials(emp.prenom,emp.nom)}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:500,color:C.text}}>{emp.prenom} {emp.nom}</div>
                      <div style={{fontSize:11,color:C.muted}}>{p.entree?`Arrivé à ${p.entree}`:'Absent'}</div>
                    </div>
                    <Badge status={p.status}/>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Congés en cours */}
          <Card title="Congés en cours" icon="calendar">
            <div style={{padding:'8px 16px'}}>
              {SEED_CONGES.filter(c=>c.status==='approuve').map((c,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:i<1?`1px solid ${C.border2}`:'none'}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:500,color:C.text}}>{c.employeNom}</div>
                    <div style={{fontSize:11,color:C.muted}}>{c.type} · {c.jours}j</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:11,color:C.muted}}>{fmtD(c.dateDebut)}</div>
                    <div style={{fontSize:11,color:C.muted}}>→ {fmtD(c.dateFin)}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Derniers bulletins — montants masqués pour les rôles non autorisés */}
      <Card title="Activité récente — Bulletins de paie" icon="payslip" action={()=>setTab('paie')}>
        <Table
          cols={['Employé','Département','Période','Statut','Paiement']}
          rows={bulletins.slice(0,5).map(b=>{
            const emp = SEED_INTERNES.find(e=>e.id===b.employeId);
            return [
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                {emp&&<Avatar prenom={emp.prenom} nom={emp.nom} size={30}/>}
                <div>
                  <div style={{fontSize:13,fontWeight:500}}>{b.employeNom}</div>
                  <div style={{fontSize:11,color:C.muted}}>{emp?.matricule}</div>
                </div>
              </div>,
              <span style={{fontSize:12,color:C.muted}}>{emp?.departement||'—'}</span>,
              <span style={{fontWeight:500}}>{MOIS_LABELS[b.mois-1]} {b.annee}</span>,
              <Badge status={b.status}/>,
              <span style={{fontSize:12,color:C.muted}}>{b.modePaiement}</span>,
            ];
          })}
          empty="Aucun bulletin"
        />
      </Card>
    </div>
  );
};

// ===== ONGLET POINTAGE GLOBAL =====
const PointageGlobal = ({internes}) => {
  const [dateSelect, setDateSelect] = useState('2024-03-15');
  return (
    <div>
      <div style={{display:'flex',gap:12,marginBottom:16,alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,background:C.white,border:`1px solid ${C.border}`,borderRadius:6,padding:'8px 12px'}}>
          <Icon n="calendar" size={14} color={C.muted}/>
          <input type="date" value={dateSelect} onChange={e=>setDateSelect(e.target.value)}
            style={{border:'none',outline:'none',fontSize:13,color:C.text,background:'transparent',fontFamily:'inherit'}}/>
        </div>
        <div style={{display:'flex',gap:8,marginLeft:'auto'}}>
          <Btn label="Exporter rapport" icon="download" sm/>
          <Btn label="Saisir pointage" icon="plus" variant="primary" sm/>
        </div>
      </div>

      {/* Stats du jour */}
      <div style={{display:'flex',gap:12,marginBottom:20}}>
        {[
          {l:'Total employés',v:internes.length,c:C.text},
          {l:'Présents',v:SEED_POINTAGES.filter(p=>p.status==='present').length,c:C.green},
          {l:'Absents',v:SEED_POINTAGES.filter(p=>p.status==='absent').length,c:C.red},
          {l:'Retards',v:SEED_POINTAGES.filter(p=>p.status==='retard').length,c:C.orange},
          {l:'Moy. heures travaillées',v:'8.2h',c:C.accent},
        ].map(k=>(
          <div key={k.l} style={{flex:1,background:C.white,borderRadius:8,padding:'14px 16px',border:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,color:C.muted,textTransform:'uppercase',letterSpacing:0.4,marginBottom:4}}>{k.l}</div>
            <div style={{fontSize:22,fontWeight:700,color:k.c}}>{k.v}</div>
          </div>
        ))}
      </div>

      <Card title={`Pointage du ${fmtD(dateSelect)}`} icon="clock">
        <Table
          cols={['Employé','Département','Arrivée','Départ','Pause','Heures travaillées','Statut','Notes']}
          rows={SEED_POINTAGES.map(p=>{
            const emp = internes.find(e=>e.id===p.employeId);
            if(!emp) return null;
            return [
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <Avatar prenom={emp.prenom} nom={emp.nom} size={32}/>
                <div>
                  <div style={{fontSize:13,fontWeight:500}}>{emp.prenom} {emp.nom}</div>
                  <div style={{fontSize:11,color:C.muted}}>{emp.matricule}</div>
                </div>
              </div>,
              <span style={{fontSize:12,color:C.muted}}>{emp.departement}</span>,
              <span style={{fontSize:13,fontWeight:600,color:p.entree?C.green:C.muted}}>{p.entree||'—'}</span>,
              <span style={{fontSize:13,color:p.sortie?C.text2:C.muted}}>{p.sortie||'—'}</span>,
              <span style={{fontSize:12,color:C.muted}}>{p.pause?`${p.pause}min`:'—'}</span>,
              <span style={{fontSize:13,fontWeight:600,color:p.heures>=8?C.green:p.heures>0?C.orange:C.muted}}>{p.heures?`${p.heures}h`:'—'}</span>,
              <Badge status={p.status}/>,
              <span style={{fontSize:11,color:C.muted}}>{p.notes||'—'}</span>,
            ].filter(Boolean);
          }).filter(Boolean)}
          empty="Aucun pointage pour cette date"
        />
      </Card>
    </div>
  );
};

// ===== ONGLET GESTION CONGÉS =====
const GestionConges = () => {
  const [showNew, setShowNew] = useState(false);
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div style={{display:'flex',gap:12}}>
          {[
            {l:'En attente',v:SEED_CONGES.filter(c=>c.status==='en_attente').length,c:C.orange},
            {l:'Approuvés',v:SEED_CONGES.filter(c=>c.status==='approuve').length,c:C.green},
            {l:'Refusés',v:SEED_CONGES.filter(c=>c.status==='refuse').length,c:C.red},
          ].map(k=>(
            <div key={k.l} style={{background:C.white,borderRadius:6,padding:'10px 14px',border:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:18,fontWeight:700,color:k.c}}>{k.v}</span>
              <span style={{fontSize:12,color:C.muted}}>{k.l}</span>
            </div>
          ))}
        </div>
        <Btn label="Demande de congé" icon="plus" variant="primary"/>
      </div>
      <Card title="Demandes de congés" icon="calendar">
        <Table
          cols={['Employé','Type de congé','Début','Fin','Durée','Remplaçant','Statut','Actions']}
          rows={SEED_CONGES.map(c=>[
            <span style={{fontWeight:500}}>{c.employeNom}</span>,
            <span style={{fontSize:12}}>{c.type}</span>,
            <span style={{fontSize:12,color:C.muted}}>{fmtD(c.dateDebut)}</span>,
            <span style={{fontSize:12,color:C.muted}}>{fmtD(c.dateFin)}</span>,
            <span style={{padding:'2px 8px',borderRadius:20,background:C.accent_bg,color:C.accent,fontSize:11,fontWeight:600}}>{c.jours}j</span>,
            <span style={{fontSize:12,color:C.muted}}>{c.remplacant||'—'}</span>,
            <Badge status={c.status}/>,
            <div style={{display:'flex',gap:4}}>
              {c.status==='en_attente'&&<>
                <button style={{padding:'4px 10px',borderRadius:4,border:'none',background:C.green_bg,color:C.green,cursor:'pointer',fontSize:11,fontWeight:600}}>Approuver</button>
                <button style={{padding:'4px 10px',borderRadius:4,border:'none',background:C.red_bg,color:C.red,cursor:'pointer',fontSize:11,fontWeight:600}}>Refuser</button>
              </>}
              {c.status!=='en_attente'&&<span style={{fontSize:12,color:C.muted}}>par {c.approuvePar}</span>}
            </div>
          ])}
          empty="Aucune demande de congé"
        />
      </Card>
    </div>
  );
};

// ===== ONGLET PAIE MENSUELLE =====
const PaieMensuelle = ({internes,bulletins,setBulletins}) => {
  const [selectedBulletin, setSelectedBulletin] = useState(null);
  const [showGenerer, setShowGenerer] = useState(false);
  const [moisFilter, setMoisFilter] = useState('3');
  const [anneeFilter, setAnneeFilter] = useState('2024');

  const filtered = bulletins.filter(b=>
    (!moisFilter||b.mois===Number(moisFilter))&&
    (!anneeFilter||b.annee===Number(anneeFilter))
  );
  const totalBrut = filtered.reduce((s,b)=>s+b.brut,0);
  const totalNet = filtered.reduce((s,b)=>s+b.net,0);
  const attente = filtered.filter(b=>b.status==='en_attente').length;

  const validerBulletin = (id) => {
    setBulletins(p=>p.map(b=>b.id===id?{...b,status:'paye',datePaiement:new Date().toISOString().split('T')[0]}:b));
  };
  const validerTous = () => {
    setBulletins(p=>p.map(b=>filtered.find(f=>f.id===b.id&&b.status==='en_attente')?{...b,status:'paye',datePaiement:new Date().toISOString().split('T')[0]}:b));
  };

  return (
    <div>
      {/* Filtres + actions */}
      <div style={{display:'flex',gap:10,marginBottom:16,alignItems:'center',flexWrap:'wrap'}}>
        <div style={{display:'flex',gap:8}}>
          <Select value={moisFilter} onChange={setMoisFilter} options={MOIS_LABELS.map((m,i)=>({v:String(i+1),l:m}))}/>
          <Select value={anneeFilter} onChange={setAnneeFilter} options={['2024','2023'].map(y=>({v:y,l:y}))}/>
        </div>
        <div style={{flex:1}}/>
        {attente>0&&<Btn label={`Valider tous (${attente})`} icon="check" variant="green" sm onClick={validerTous}/>}
        <Btn label="Générer la paie" icon="plus" variant="primary" onClick={()=>setShowGenerer(true)}/>
      </div>

      {/* Résumé masse salariale — affiché seulement si autorisé */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
        {[
          {l:'Masse salariale brute',v:`${fmtN(totalBrut)} FCFA`,c:C.text},
          {l:'Total net à payer',v:`${fmtN(totalNet)} FCFA`,c:C.accent},
          {l:'Bulletins en attente',v:attente,c:attente>0?C.orange:C.green},
        ].map(k=>(
          <div key={k.l} style={{background:C.white,borderRadius:8,padding:'16px 18px',border:`1px solid ${C.border}`}}>
            <div style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:0.4,marginBottom:6}}>{k.l}</div>
            <div style={{fontSize:typeof k.v==='number'?24:18,fontWeight:700,color:k.c}}>{k.v}</div>
          </div>
        ))}
      </div>

      <Card title={`Bulletins de paie — ${MOIS_LABELS[Number(moisFilter)-1]||'Tous'} ${anneeFilter}`} icon="payslip">
        <Table
          cols={['Employé','Département','Salaire de base','Primes','Avantages','Brut','Net à payer','Mode','Statut','']}
          rows={filtered.map(b=>{
            const emp = internes.find(e=>e.id===b.employeId);
            return [
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                {emp&&<Avatar prenom={emp.prenom} nom={emp.nom} size={32}/>}
                <div>
                  <div style={{fontSize:13,fontWeight:500}}>{b.employeNom}</div>
                  <div style={{fontSize:11,color:C.muted}}>{emp?.matricule}</div>
                </div>
              </div>,
              <span style={{fontSize:12,color:C.muted}}>{emp?.departement||'—'}</span>,
              <span style={{fontSize:13}}>{fmtN(b.salaireBase)}</span>,
              <span style={{fontSize:13,color:C.green}}>{b.primes>0?`+${fmtN(b.primes)}`:'—'}</span>,
              <span style={{fontSize:13,color:C.accent}}>{b.avantages>0?`+${fmtN(b.avantages)}`:'—'}</span>,
              <span style={{fontSize:13,fontWeight:500}}>{fmtN(b.brut)}</span>,
              <strong style={{color:C.accent,fontSize:14}}>{fmtN(b.net)} FCFA</strong>,
              <span style={{fontSize:12,color:C.muted}}>{b.modePaiement}</span>,
              <Badge status={b.status}/>,
              <div style={{display:'flex',gap:4}}>
                <button onClick={()=>setSelectedBulletin(b)} style={{width:28,height:28,borderRadius:4,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon n="eye" size={12} color={C.muted}/></button>
                {b.status==='en_attente'&&<button onClick={()=>validerBulletin(b.id)} style={{width:28,height:28,borderRadius:4,border:`1px solid ${C.green}`,background:C.green_bg,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon n="check" size={12} color={C.green}/></button>}
                <button style={{width:28,height:28,borderRadius:4,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon n="print" size={12} color={C.muted}/></button>
              </div>
            ];
          })}
          empty="Aucun bulletin pour cette période. Générez la paie du mois."
        />
      </Card>

      {selectedBulletin&&(
        <BulletinOfficiel
          bulletin={selectedBulletin}
          employe={internes.find(e=>e.id===selectedBulletin.employeId)}
          onClose={()=>setSelectedBulletin(null)}
          onValider={validerBulletin}
        />
      )}
    </div>
  );
};

// ===== PAIEMENTS EXTERNES =====
const PaiementsExternes = ({externes,paiementsExt,setPaiementsExt}) => {
  const [showNew, setShowNew] = useState(false);
  const [empId, setEmpId] = useState('');
  const [projet, setProjet] = useState('');
  const [phase, setPhase] = useState('');
  const [montantProjet, setMontantProjet] = useState('');
  const [pct, setPct] = useState('');
  const [modeP, setModeP] = useState('');
  const emp = externes.find(e=>e.id===empId);
  const montantNet = Math.round((Number(montantProjet)||0)*(Number(pct)||0)/100);

  const valider = (id) => setPaiementsExt(p=>p.map(pe=>pe.id===id?{...pe,status:'paye',datePaiement:new Date().toISOString().split('T')[0],ref:'PAY-EXT-'+Date.now().toString().slice(-6)}:pe));

  const save = () => {
    if(!empId||!projet||!pct) return;
    setPaiementsExt(p=>[{id:'PE'+Date.now(),employeId:empId,projet,client:'',phase,montantProjet:Number(montantProjet)||0,pct:Number(pct)||0,montantNet,status:'en_attente',datePaiement:null,modePaiement:modeP||emp?.banque||'',ref:null},...p]);
    setShowNew(false); setEmpId(''); setProjet(''); setPhase(''); setMontantProjet(''); setPct(''); setModeP('');
  };

  const totalAttente = paiementsExt.filter(p=>p.status==='en_attente').reduce((s,p)=>s+p.montantNet,0);
  const totalPaye = paiementsExt.filter(p=>p.status==='paye').reduce((s,p)=>s+p.montantNet,0);

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
        {[
          {l:'En attente de paiement',v:`${fmtN(totalAttente)} FCFA`,sub:`${paiementsExt.filter(p=>p.status==='en_attente').length} paiements`,c:C.orange},
          {l:'Total versé',v:`${fmtN(totalPaye)} FCFA`,sub:'Historique complet',c:C.green},
          {l:'Techniciens actifs',v:externes.filter(e=>e.status==='actif').length,sub:'Sur projets en cours',c:C.accent},
        ].map(k=>(
          <div key={k.l} style={{background:C.white,borderRadius:8,padding:'16px 18px',border:`1px solid ${C.border}`}}>
            <div style={{fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:0.4,marginBottom:6}}>{k.l}</div>
            <div style={{fontSize:18,fontWeight:700,color:k.c}}>{k.v}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:2}}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
        <Btn label="Nouveau paiement" icon="plus" variant="primary" onClick={()=>setShowNew(true)}/>
      </div>

      <Card title="Paiements techniciens externes" icon="external">
        <Table
          cols={['Technicien','Projet','Phase','% négocié','Montant net','Mode paiement','Date','Statut','']}
          rows={paiementsExt.map(p=>{
            const ext = externes.find(e=>e.id===p.employeId);
            return [
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                {ext&&<Avatar prenom={ext.prenom} nom={ext.nom} size={32}/>}
                <div>
                  <div style={{fontSize:13,fontWeight:500}}>{ext?`${ext.prenom} ${ext.nom}`:p.employeId}</div>
                  <div style={{fontSize:11,color:C.muted}}>{ext?.matricule}</div>
                </div>
              </div>,
              <span style={{fontSize:12,fontWeight:600,color:C.accent}}>{p.projet}</span>,
              <span style={{fontSize:12,color:C.muted}}>{p.phase}</span>,
              <span style={{padding:'2px 10px',borderRadius:20,background:C.green_bg,color:C.green,fontSize:12,fontWeight:700}}>{p.pct}%</span>,
              <strong style={{color:C.orange,fontSize:14}}>{fmtN(p.montantNet)} FCFA</strong>,
              <span style={{fontSize:12,color:C.muted}}>{p.modePaiement}</span>,
              <span style={{fontSize:12,color:C.muted}}>{p.datePaiement?fmtD(p.datePaiement):'—'}</span>,
              <Badge status={p.status}/>,
              <div style={{display:'flex',gap:4}}>
                {p.status==='en_attente'&&<button onClick={()=>valider(p.id)} style={{padding:'5px 12px',borderRadius:4,border:'none',background:C.green,color:'white',cursor:'pointer',fontSize:12,fontWeight:600}}>Valider & Payer</button>}
                <button style={{width:28,height:28,borderRadius:4,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon n="print" size={12} color={C.muted}/></button>
              </div>
            ];
          })}
          empty="Aucun paiement externe enregistré"
        />
      </Card>

      {showNew&&(
        <Modal title="Nouveau paiement technicien" onClose={()=>setShowNew(false)} maxWidth={520}>
          <div style={{padding:'24px'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16}}>
              <Field label="Technicien" required col1>
                <Select value={empId} onChange={setEmpId} options={externes.map(e=>({v:e.id,l:`${e.prenom} ${e.nom} — ${e.specialite}`}))} placeholder="Sélectionner"/>
              </Field>
              {emp&&(
                <div style={{gridColumn:'1/-1',display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:C.green_bg,borderRadius:8,border:`1px solid ${C.border}`}}>
                  <Avatar prenom={emp.prenom} nom={emp.nom} size={40}/>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:C.text}}>{emp.prenom} {emp.nom} · {emp.matricule}</div>
                    <div style={{fontSize:12,color:C.muted}}>{emp.specialite} · {emp.banque} : {emp.rib}</div>
                  </div>
                </div>
              )}
              <Field label="Référence projet" required><Input value={projet} onChange={setProjet} placeholder="Ex: PROJ-2024-001"/></Field>
              <Field label="Phase"><Select value={phase} onChange={setPhase} options={['Phase 1','Phase 2','Phase 3','Phase 4','Paiement unique','Solde final']} placeholder="Sélectionner"/></Field>
              <Field label="Montant total projet (FCFA)" required><Input type="number" value={montantProjet} onChange={setMontantProjet} placeholder="Ex: 45 000 000"/></Field>
              <Field label="Pourcentage négocié (%)" required><Input type="number" value={pct} onChange={setPct} placeholder="Ex: 30" min="0" max="100"/></Field>
              <Field label="Mode de paiement" col1><Select value={modeP} onChange={setModeP} options={BANQUES} placeholder={emp?.banque||'Sélectionner'}/></Field>
            </div>
            {montantNet>0&&(
              <div style={{padding:'16px 20px',background:`linear-gradient(135deg,${C.primary},${C.primary2})`,borderRadius:8,marginBottom:16,textAlign:'center',color:'white'}}>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.6)',marginBottom:4}}>Montant net à verser</div>
                <div style={{fontSize:28,fontWeight:700}}>{fmtN(montantNet)} FCFA</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.6)',marginTop:2}}>{pct}% × {fmtN(Number(montantProjet))} FCFA</div>
              </div>
            )}
            <div style={{display:'flex',gap:8,justifyContent:'flex-end',paddingTop:16,borderTop:`1px solid ${C.border}`}}>
              <Btn label="Annuler" onClick={()=>setShowNew(false)}/>
              <Btn label="Créer paiement" icon="check" variant="green" onClick={save} disabled={!empId||!projet||!pct}/>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ===== LISTE EMPLOYÉS (interne ou externe) =====
const ListeEmployes = ({employes,type,onSelect,onAdd}) => {
  const [search,setSearch] = useState('');
  const [filterStatus,setFilterStatus] = useState('tous');
  const [filterDep,setFilterDep] = useState('tous');
  const [view,setView] = useState('list');

  const filtered = employes.filter(e=>{
    const ms = !search||`${e.prenom} ${e.nom} ${e.matricule} ${e.poste||''} ${e.specialite||''}`.toLowerCase().includes(search.toLowerCase());
    const mf = filterStatus==='tous'||e.status===filterStatus;
    const md = filterDep==='tous'||e.departement===filterDep||!e.departement;
    return ms&&mf&&md;
  });

  const isInterne = type==='interne';

  return (
    <div>
      {/* Barre d'outils */}
      <div style={{display:'flex',gap:10,marginBottom:16,alignItems:'center',flexWrap:'wrap'}}>
        <Input value={search} onChange={setSearch} placeholder={`Rechercher ${isInterne?'un employé':'un technicien'}...`} icon="search"/>
        <div style={{display:'flex',background:C.white,border:`1px solid ${C.border}`,borderRadius:6,padding:2,gap:1}}>
          {[{v:'tous',l:'Tous'},{v:'actif',l:'Actifs'},{v:'conge',l:'En congé'},{v:'inactif',l:'Inactifs'}].map(s=>(
            <button key={s.v} onClick={()=>setFilterStatus(s.v)} style={{padding:'6px 12px',borderRadius:4,border:'none',background:filterStatus===s.v?C.accent:'transparent',color:filterStatus===s.v?'white':C.muted,fontWeight:filterStatus===s.v?600:400,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>{s.l}</button>
          ))}
        </div>
        {isInterne&&(
          <Select value={filterDep} onChange={setFilterDep} options={[{v:'tous',l:'Tous départements'},...DEPARTEMENTS.map(d=>({v:d,l:d}))]}/>
        )}
        {/* Vue grille / liste */}
        <div style={{display:'flex',background:C.white,border:`1px solid ${C.border}`,borderRadius:6,padding:2}}>
          {[{v:'list',i:'menu'},{v:'grid',i:'org'}].map(vt=>(
            <button key={vt.v} onClick={()=>setView(vt.v)} style={{width:32,height:32,borderRadius:4,border:'none',background:view===vt.v?C.accent:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Icon n={vt.i} size={15} color={view===vt.v?'white':C.muted}/>
            </button>
          ))}
        </div>
        <div style={{marginLeft:'auto'}}>
          <Btn label={isInterne?'+ Nouvel employé':'+ Nouveau technicien'} icon="plus" variant="primary" onClick={onAdd}/>
        </div>
      </div>

      <div style={{fontSize:12,color:C.muted,marginBottom:12}}>{filtered.length} résultat(s)</div>

      {/* VUE GRILLE — Cards profils style enterprise */}
      {view==='grid'&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
          {filtered.map(e=>{
            const ac = getAvatarColor(e.prenom+e.nom);
            const anciennete = e.dateEmbauche?Math.floor((Date.now()-new Date(e.dateEmbauche))/(1000*60*60*24*365)):0;
            return (
              <div key={e.id} onClick={()=>onSelect(e)} style={{background:C.white,borderRadius:10,border:`1px solid ${C.border}`,overflow:'hidden',cursor:'pointer',transition:'all .2s'}}
                onMouseEnter={e2=>{e2.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)';e2.currentTarget.style.transform='translateY(-2px)';e2.currentTarget.style.borderColor=C.accent;}}
                onMouseLeave={e2=>{e2.currentTarget.style.boxShadow='none';e2.currentTarget.style.transform='translateY(0)';e2.currentTarget.style.borderColor=C.border;}}>
                {/* Header couleur */}
                <div style={{height:6,background:`linear-gradient(90deg,${C.accent},${C.purple})`}}/>
                <div style={{padding:'20px 20px 16px'}}>
                  <div style={{display:'flex',gap:14,alignItems:'flex-start',marginBottom:14}}>
                    <div style={{width:56,height:56,borderRadius:'50%',background:ac.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700,color:ac.text,flexShrink:0,border:`3px solid ${C.white}`,boxShadow:`0 0 0 2px ${C.border}`}}>
                      {getInitials(e.prenom,e.nom)}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:15,fontWeight:700,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.prenom} {e.nom}</div>
                      <div style={{fontSize:12,color:C.muted,marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.poste}</div>
                      <div style={{marginTop:6}}><Badge status={e.status}/></div>
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:6}}>
                    {[
                      {i:'briefcase',v:e.matricule},
                      ...(isInterne?[{i:'building',v:e.departement}]:[{i:'star',v:e.specialite}]),
                      {i:'phone',v:e.telephone},
                    ].map(item=>(
                      <div key={item.i} style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:C.text2}}>
                        <Icon n={item.i} size={12} color={C.muted}/>
                        <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.v||'—'}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:14,paddingTop:12,borderTop:`1px solid ${C.border2}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div style={{fontSize:11,color:C.muted}}>
                      {isInterne?`${anciennete} an${anciennete>1?'s':''} d'ancienneté`:`${e.nbProjets} projets réalisés`}
                    </div>
                    <div style={{fontSize:11,color:C.muted,fontFamily:'monospace'}}>{e.contrat}</div>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length===0&&(
            <div style={{gridColumn:'1/-1',padding:'48px',textAlign:'center',color:C.muted,background:C.white,borderRadius:10,border:`1px dashed ${C.border}`}}>
              <Icon n="users" size={40} color={C.border} style={{margin:'0 auto 12px',display:'block'}}/>
              <div style={{fontSize:15,fontWeight:500}}>Aucun résultat</div>
              <div style={{fontSize:12,marginTop:4}}>Modifiez vos filtres ou ajoutez un profil</div>
            </div>
          )}
        </div>
      )}

      {/* VUE LISTE */}
      {view==='list'&&(
        <Card>
          <Table
            cols={isInterne
              ? ['Employé','Poste','Département','Contrat','Embauche','Téléphone','Banque','Statut','']
              : ['Technicien','Spécialité','Projets actifs','Taux/jour','Total perçu','Téléphone','Banque','Statut','']
            }
            rows={filtered.map(e=>[
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <Avatar prenom={e.prenom} nom={e.nom} size={36}/>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:C.text}}>{e.prenom} {e.nom}</div>
                  <div style={{fontSize:11,color:C.muted,fontFamily:'monospace'}}>{e.matricule}</div>
                </div>
              </div>,
              <span style={{fontSize:12}}>{e.poste}</span>,
              ...(isInterne
                ? [<span style={{padding:'2px 8px',borderRadius:20,background:C.accent_bg,color:C.accent,fontSize:11,fontWeight:500}}>{e.departement}</span>]
                : [<span style={{padding:'2px 8px',borderRadius:20,background:C.purple_bg,color:C.purple,fontSize:11,fontWeight:500}}>{e.specialite}</span>]
              ),
              ...(isInterne
                ? [<Badge status={e.contrat?.toLowerCase()||'cdi'}/>,<span style={{fontSize:12,color:C.muted}}>{fmtD(e.dateEmbauche)}</span>]
                : [<div style={{display:'flex',gap:3,flexWrap:'wrap'}}>{e.projetsActifs?.length>0?e.projetsActifs.map(p=><span key={p} style={{padding:'2px 6px',borderRadius:8,background:C.accent_bg,color:C.accent,fontSize:10,fontWeight:600}}>{p}</span>):<span style={{color:C.muted,fontSize:12}}>Aucun</span>}</div>,<span style={{fontSize:13,fontWeight:600,color:C.text}}>{fmtN(e.tauxJournalier)} FCFA</span>]
              ),
              ...(isInterne
                ? []
                : [<strong style={{color:C.green}}>{fmtN(e.totalPercu)} FCFA</strong>]
              ),
              <span style={{fontSize:12,color:C.muted}}>{e.telephone}</span>,
              <span style={{fontSize:12,color:C.muted}}>{e.banque}</span>,
              <Badge status={e.status}/>,
              <div style={{display:'flex',gap:4}}>
                <button onClick={()=>onSelect(e)} style={{width:28,height:28,borderRadius:4,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon n="eye" size={12} color={C.muted}/></button>
                <button style={{width:28,height:28,borderRadius:4,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon n="edit" size={12} color={C.muted}/></button>
              </div>
            ])}
            onRowClick={i=>onSelect(filtered[i])}
            empty="Aucun profil trouvé"
          />
        </Card>
      )}
    </div>
  );
};

// ===== NAVIGATION =====
const NAV_TABS = [
  {id:'dashboard',   l:'Tableau de bord',      i:'home'},
  {id:'internes',    l:'Employés internes',     i:'users'},
  {id:'externes',    l:'Techniciens externes',  i:'external'},
  {id:'conges',      l:'Congés & Absences',     i:'calendar'},
  {id:'pointage',    l:'Pointage & Présence',   i:'clock'},
  {id:'paie',        l:'Paie mensuelle',        i:'payslip'},
  {id:'paiements_ext',l:'Paiements externes',  i:'link'},
];

// ===== COMPOSANT PRINCIPAL =====
export default function RH() {
  const [tab,setTab] = useState('dashboard');
  const [internes,setInternes] = useState(SEED_INTERNES);
  const [externes,setExternes] = useState(SEED_EXTERNES);
  const [bulletins,setBulletins] = useState(SEED_BULLETINS);
  const [paiementsExt,setPaiementsExt] = useState(SEED_PAIEMENTS_EXT);
  const [selectedEmp,setSelectedEmp] = useState(null);
  const [selectedType,setSelectedType] = useState(null);
  const [showAddInt,setShowAddInt] = useState(false);
  const [showAddExt,setShowAddExt] = useState(false);

  const bulletinsAttente = bulletins.filter(b=>b.status==='en_attente').length;
  const paiExtAttente = paiementsExt.filter(p=>p.status==='en_attente').length;

  return (
    <div style={{minHeight:'100vh',background:C.bg,fontFamily:"'Segoe UI',Arial,sans-serif"}}>

      {/* HEADER ENTREPRISE */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,position:'sticky',top:0,zIndex:100}}>
        <div style={{maxWidth:1440,margin:'0 auto'}}>
          {/* Top bar */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 28px 0'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:38,height:38,borderRadius:10,background:`linear-gradient(135deg,${C.primary},${C.accent})`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Icon n="users" size={20} color="white"/>
              </div>
              <div>
                <div style={{fontSize:17,fontWeight:700,color:C.text}}>Ressources Humaines</div>
                <div style={{fontSize:11,color:C.muted}}>CleanIT ERP · Gestion du personnel</div>
              </div>
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              {tab==='internes'&&<Btn label="+ Nouvel employé" icon="plus" variant="primary" sm onClick={()=>setShowAddInt(true)}/>}
              {tab==='externes'&&<Btn label="+ Nouveau technicien" icon="plus" variant="primary" sm onClick={()=>setShowAddExt(true)}/>}
              {tab==='paie'&&<Btn label="Générer la paie" icon="payslip" variant="dark" sm/>}
              {tab==='paiements_ext'&&<Btn label="Nouveau paiement" icon="plus" variant="primary" sm/>}
            </div>
          </div>

          {/* Tabs navigation */}
          <div style={{display:'flex',gap:0,overflowX:'auto',padding:'0 28px'}}>
            {NAV_TABS.map(t=>{
              const hasAlert = (t.id==='paie'&&bulletinsAttente>0)||(t.id==='paiements_ext'&&paiExtAttente>0);
              return (
                <button key={t.id} onClick={()=>setTab(t.id)} style={{
                  display:'flex',alignItems:'center',gap:7,
                  padding:'12px 16px',border:'none',
                  borderBottom:`2px solid ${tab===t.id?C.accent:'transparent'}`,
                  background:'transparent',
                  color:tab===t.id?C.accent:C.muted,
                  fontWeight:tab===t.id?600:400,
                  fontSize:13,cursor:'pointer',whiteSpace:'nowrap',
                  fontFamily:'inherit',transition:'all .15s',position:'relative',
                }}>
                  <Icon n={t.i} size={14} color={tab===t.id?C.accent:C.muted}/>
                  {t.l}
                  {hasAlert&&(
                    <span style={{position:'absolute',top:8,right:6,width:8,height:8,borderRadius:'50%',background:C.orange,border:`2px solid ${C.white}`}}/>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div style={{maxWidth:1440,margin:'0 auto',padding:'24px 28px'}}>
        {tab==='dashboard'&&<DashboardRH internes={internes} externes={externes} bulletins={bulletins} paiementsExt={paiementsExt} setTab={setTab}/>}
        {tab==='internes'&&<ListeEmployes employes={internes} type="interne" onSelect={e=>{setSelectedEmp(e);setSelectedType('interne');}} onAdd={()=>setShowAddInt(true)}/>}
        {tab==='externes'&&<ListeEmployes employes={externes} type="externe" onSelect={e=>{setSelectedEmp(e);setSelectedType('externe');}} onAdd={()=>setShowAddExt(true)}/>}
        {tab==='conges'&&<GestionConges/>}
        {tab==='pointage'&&<PointageGlobal internes={internes}/>}
        {tab==='paie'&&<PaieMensuelle internes={internes} bulletins={bulletins} setBulletins={setBulletins}/>}
        {tab==='paiements_ext'&&<PaiementsExternes externes={externes} paiementsExt={paiementsExt} setPaiementsExt={setPaiementsExt}/>}
      </div>

      {/* MODALS & PANELS */}
      {selectedEmp&&(
        <ProfilEmploye
          employe={selectedEmp}
          onClose={()=>setSelectedEmp(null)}
          onUpdate={emp=>{selectedType==='interne'?setInternes(p=>p.map(e=>e.id===emp.id?emp:e)):setExternes(p=>p.map(e=>e.id===emp.id?emp:e));}}
          bulletins={bulletins}
          estExterne={selectedType==='externe'}
        />
      )}
      {showAddInt&&<FormulaireEmploye type="interne" onClose={()=>setShowAddInt(false)} onSave={e=>setInternes(p=>[e,...p])}/>}
      {showAddExt&&<FormulaireEmploye type="externe" onClose={()=>setShowAddExt(false)} onSave={e=>setExternes(p=>[e,...p])}/>}
    </div>
  );
}
