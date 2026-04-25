import { useState } from 'react';

// ===== SAP SUCCESSFACTORS DESIGN SYSTEM =====
const SAP = {
  blue:      '#0070F2',
  blue2:     '#0057B8',
  blue_bg:   '#EBF4FF',
  blue_light:'#F5F9FF',
  teal:      '#0A6ED1',
  green:     '#107E3E',
  green_bg:  '#F1F8F1',
  red:       '#BB0000',
  red_bg:    '#FFF0F0',
  orange:    '#E76500',
  orange_bg: '#FEF3E6',
  gray1:     '#32363A',
  gray2:     '#515456',
  gray3:     '#6A6D70',
  gray4:     '#89898B',
  gray5:     '#BDBDBD',
  gray6:     '#DCDCDC',
  gray7:     '#F4F4F4',
  gray8:     '#FAFAFA',
  white:     '#FFFFFF',
  border:    '#E0E0E0',
  border2:   '#EBEBEB',
  text:      '#32363A',
  text2:     '#515456',
  muted:     '#6A6D70',
  bg:        '#F4F4F4',
  sidebar:   '#354A5E',
  sidebar2:  '#223548',
};

const fmtN = n => new Intl.NumberFormat('fr-FR').format(Math.round(n||0));
const fmtD = d => d ? new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'}) : '—';
const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const MOIS_SHORT = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

const AVATAR_COLORS = [
  {bg:'#DFE9FF',c:'#0057B8'},{bg:'#FFDEFF',c:'#6B00A4'},
  {bg:'#DAFBE1',c:'#107E3E'},{bg:'#FEF3E6',c:'#AD4E00'},
  {bg:'#FFE9E9',c:'#BB0000'},{bg:'#E0F5FF',c:'#0070F2'},
  {bg:'#FFF8D6',c:'#6B5100'},{bg:'#F0EEFF',c:'#5B4AF7'},
];
const getAC = name => AVATAR_COLORS[(name?.charCodeAt(0)||0)%AVATAR_COLORS.length];
const getInitials = (p,n) => `${p?.[0]||''} ${n?.[0]||''} `.trim().replace(' ','').toUpperCase().slice(0,2);

// ===== ICÔNES SAP FIORI =====
const I = ({n,s=16,c='currentColor'}) => {
  const d = {
    home:'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
    people:'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
    person:'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z',
    calendar:'M8 2v4 M16 2v4 M3 10h18 M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z',
    clock:'M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 6v6l4 2',
    doc:'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    pay:'M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
    chart:'M18 20V10 M12 20V4 M6 20v-6',
    plus:'M12 5v14 M5 12h14',
    close:'M18 6L6 18 M6 6l12 12',
    search:'M21 21l-4.35-4.35 M17 11A6 6 0 115 11a6 6 0 0112 0z',
    check:'M20 6L9 17l-5-5',
    edit:'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
    eye:'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12m-3 0a3 3 0 106 0 3 3 0 00-6 0',
    down:'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3',
    mail:'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
    phone:'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.63 19.79 19.79 0 01.06 4 2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.91a16 16 0 006.12 6.12l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z',
    building:'M3 21h18 M3 7v14 M21 7v14 M9 21V7 M15 21V7 M3 7l9-4 9 4',
    alert:'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01',
    print:'M6 9V2h12v7 M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2 M6 14h12v8H6z',
    filter:'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
    star:'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    link:'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71',
    chev_r:'M9 18l6-6-6-6',
    chev_d:'M6 9l6 6 6-6',
    grid:'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
    list:'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01',
    upload:'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
    settings:'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
  };
  const path = d[n]; if(!path) return null;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
      {path.split(' M ').map((seg,i)=><path key={i} d={i===0?seg:`M ${seg}`}/>)}
    </svg>
  );
};

// ===== AVATAR SAP =====
const Av = ({p='',n='',size=40}) => {
  const ac = getAC(p+n);
  const init = getInitials(p,n);
  return (
    <div style={{width:size,height:size,borderRadius:'50%',background:ac.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.3,fontWeight:700,color:ac.c,flexShrink:0,border:`1.5px solid ${SAP.border}`,letterSpacing:0.5}}>
      {init}
    </div>
  );
};

// ===== BADGE SAP FIORI =====
const Badge = ({s,l}) => {
  const cfg = {
    actif:     {t:'Actif',      bg:SAP.green_bg,  c:SAP.green},
    inactif:   {t:'Inactif',    bg:SAP.gray7,     c:SAP.gray3},
    conge:     {t:'En congé',   bg:SAP.orange_bg, c:SAP.orange},
    suspendu:  {t:'Suspendu',   bg:SAP.red_bg,    c:SAP.red},
    paye:      {t:'Payé',       bg:SAP.green_bg,  c:SAP.green},
    en_attente:{t:'En attente', bg:SAP.orange_bg, c:SAP.orange},
    valide:    {t:'Validé',     bg:SAP.blue_bg,   c:SAP.blue},
    brouillon: {t:'Brouillon',  bg:SAP.gray7,     c:SAP.gray3},
    present:   {t:'Présent',    bg:SAP.green_bg,  c:SAP.green},
    absent:    {t:'Absent',     bg:SAP.red_bg,    c:SAP.red},
    retard:    {t:'Retard',     bg:SAP.orange_bg, c:SAP.orange},
    approuve:  {t:'Approuvé',   bg:SAP.green_bg,  c:SAP.green},
    refuse:    {t:'Refusé',     bg:SAP.red_bg,    c:SAP.red},
    cdi:       {t:'CDI',        bg:SAP.green_bg,  c:SAP.green},
    cdd:       {t:'CDD',        bg:SAP.blue_bg,   c:SAP.blue},
    freelance: {t:'Freelance',  bg:SAP.orange_bg, c:SAP.orange},
  }[s]||{t:l||s,bg:SAP.gray7,c:SAP.gray3};
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',borderRadius:4,background:cfg.bg,color:cfg.c,fontSize:12,fontWeight:600,whiteSpace:'nowrap',border:`1px solid ${cfg.c}30`}}>
      <span style={{width:6,height:6,borderRadius:'50%',background:cfg.c,flexShrink:0}}/>
      {cfg.t}
    </span>
  );
};

// ===== BOUTON SAP FIORI =====
const Btn = ({label,onClick,variant='secondary',disabled,sm,icon}) => {
  const v = {
    primary:  {bg:SAP.blue,  c:'white', border:SAP.blue},
    secondary:{bg:SAP.white, c:SAP.blue, border:SAP.blue},
    ghost:    {bg:'transparent',c:SAP.text2,border:SAP.border},
    danger:   {bg:SAP.red,   c:'white', border:SAP.red},
    positive: {bg:SAP.green, c:'white', border:SAP.green},
  }[variant]||{bg:SAP.white,c:SAP.text2,border:SAP.border};
  return (
    <button onClick={onClick} disabled={disabled} style={{display:'inline-flex',alignItems:'center',gap:6,padding:sm?'5px 12px':'8px 16px',borderRadius:4,border:`1px solid ${disabled?SAP.border:v.border}`,background:disabled?SAP.gray7:v.bg,color:disabled?SAP.gray4:v.c,fontSize:sm?12:13,fontWeight:500,cursor:disabled?'not-allowed':'pointer',fontFamily:'inherit',transition:'all .12s',whiteSpace:'nowrap'}}
      onMouseEnter={e=>{if(!disabled&&variant==='primary')e.currentTarget.style.background=SAP.blue2;}}
      onMouseLeave={e=>{if(!disabled&&variant==='primary')e.currentTarget.style.background=SAP.blue;}}>
      {icon&&<I n={icon} s={sm?13:15} c={disabled?SAP.gray4:v.c}/>}
      {label}
    </button>
  );
};

// ===== INPUT SAP =====
const Inp = ({type='text',value,onChange,placeholder,disabled,sm}) => (
  <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} disabled={disabled}
    style={{width:'100%',padding:sm?'6px 8px':'8px 10px',border:`1px solid ${SAP.border}`,borderRadius:4,fontSize:13,color:SAP.text,background:disabled?SAP.gray7:SAP.white,boxSizing:'border-box',outline:'none',fontFamily:'inherit'}}
    onFocus={e=>e.target.style.borderColor=SAP.blue}
    onBlur={e=>e.target.style.borderColor=SAP.border}/>
);
const Sel = ({value,onChange,options,placeholder,disabled}) => (
  <select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
    style={{width:'100%',padding:'8px 10px',border:`1px solid ${SAP.border}`,borderRadius:4,fontSize:13,color:value?SAP.text:SAP.muted,background:disabled?SAP.gray7:SAP.white,cursor:'pointer',outline:'none',fontFamily:'inherit'}}
    onFocus={e=>e.target.style.borderColor=SAP.blue}
    onBlur={e=>e.target.style.borderColor=SAP.border}>
    <option value="">{placeholder||'Sélectionner...'}</option>
    {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
  </select>
);
const Txt = ({value,onChange,placeholder,rows=3}) => (
  <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{width:'100%',padding:'8px 10px',border:`1px solid ${SAP.border}`,borderRadius:4,fontSize:13,color:SAP.text,background:SAP.white,resize:'vertical',boxSizing:'border-box',outline:'none',fontFamily:'inherit'}}
    onFocus={e=>e.target.style.borderColor=SAP.blue}
    onBlur={e=>e.target.style.borderColor=SAP.border}/>
);

// ===== FIELD LABEL =====
const Fld = ({label,required,children,hint}) => (
  <div>
    <label style={{display:'block',fontSize:12,fontWeight:600,color:SAP.muted,marginBottom:4,textTransform:'uppercase',letterSpacing:0.3}}>
      {label}{required&&<span style={{color:SAP.red,marginLeft:2}}>*</span>}
    </label>
    {children}
    {hint&&<div style={{fontSize:11,color:SAP.muted,marginTop:3}}>{hint}</div>}
  </div>
);

// ===== PANEL LATÉRAL SAP =====
const Panel = ({title,subtitle,onClose,children,width=860,footer}) => (
  <div style={{position:'fixed',inset:0,zIndex:300,display:'flex',justifyContent:'flex-end'}}>
    <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(50,54,58,0.45)'}}/>
    <div style={{position:'relative',width,maxWidth:'96vw',height:'100vh',background:SAP.white,boxShadow:'-4px 0 20px rgba(0,0,0,0.18)',display:'flex',flexDirection:'column'}}>
      {/* Header SAP */}
      <div style={{padding:'16px 24px',borderBottom:`1px solid ${SAP.border}`,display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0,background:SAP.white}}>
        <div>
          {subtitle&&<div style={{fontSize:11,color:SAP.muted,marginBottom:2,textTransform:'uppercase',letterSpacing:0.4}}>{subtitle}</div>}
          <h2 style={{margin:0,fontSize:16,fontWeight:700,color:SAP.text}}>{title}</h2>
        </div>
        <button onClick={onClose} style={{width:32,height:32,borderRadius:4,border:`1px solid ${SAP.border}`,background:SAP.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <I n="close" s={16} c={SAP.muted}/>
        </button>
      </div>
      <div style={{flex:1,overflow:'auto'}}>{children}</div>
      {footer&&(
        <div style={{padding:'12px 24px',borderTop:`1px solid ${SAP.border}`,display:'flex',gap:8,justifyContent:'flex-end',flexShrink:0,background:SAP.gray8}}>
          {footer}
        </div>
      )}
    </div>
  </div>
);

// ===== MODAL SAP =====
const Modal = ({title,onClose,children,maxWidth=560}) => (
  <div style={{position:'fixed',inset:0,zIndex:400,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
    <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(50,54,58,0.45)'}}/>
    <div style={{position:'relative',width:'100%',maxWidth,background:SAP.white,borderRadius:4,boxShadow:'0 8px 32px rgba(0,0,0,0.2)',overflow:'hidden',maxHeight:'92vh',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'14px 20px',borderBottom:`1px solid ${SAP.border}`,display:'flex',justifyContent:'space-between',alignItems:'center',background:SAP.blue,flexShrink:0}}>
        <h3 style={{margin:0,fontSize:15,fontWeight:700,color:'white'}}>{title}</h3>
        <button onClick={onClose} style={{width:28,height:28,borderRadius:4,border:'1px solid rgba(255,255,255,0.3)',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><I n="close" s={14} c="white"/></button>
      </div>
      <div style={{overflow:'auto',flex:1}}>{children}</div>
    </div>
  </div>
);

// ===== TABLEAU SAP FIORI =====
const Tbl = ({cols,rows,onRow,empty='Aucune donnée'}) => (
  <div style={{overflowX:'auto'}}>
    <table style={{width:'100%',borderCollapse:'collapse'}}>
      <thead>
        <tr style={{background:SAP.gray7,borderBottom:`2px solid ${SAP.border}`}}>
          {cols.map(c=><th key={c} style={{padding:'10px 16px',textAlign:'left',fontSize:12,fontWeight:700,color:SAP.gray2,letterSpacing:0.3,whiteSpace:'nowrap',userSelect:'none'}}>{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.length===0&&<tr><td colSpan={cols.length} style={{padding:'48px',textAlign:'center',color:SAP.muted,fontSize:14}}>{empty}</td></tr>}
        {rows.map((row,i)=>(
          <tr key={i} onClick={()=>onRow&&onRow(i)}
            style={{borderBottom:`1px solid ${SAP.border2}`,background:i%2===0?SAP.white:SAP.gray8,cursor:onRow?'pointer':'default'}}
            onMouseEnter={e=>{if(onRow)e.currentTarget.style.background=SAP.blue_bg}}
            onMouseLeave={e=>{if(onRow)e.currentTarget.style.background=i%2===0?SAP.white:SAP.gray8}}>
            {row.map((cell,j)=><td key={j} style={{padding:'11px 16px',fontSize:13,color:SAP.text,verticalAlign:'middle'}}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ===== SECTION SAP (titre bleu + ligne) =====
const Sec = ({title,children,action,actionLabel}) => (
  <div style={{marginBottom:24}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,paddingBottom:8,borderBottom:`2px solid ${SAP.blue}`}}>
      <span style={{fontSize:14,fontWeight:700,color:SAP.blue,textTransform:'uppercase',letterSpacing:0.5}}>{title}</span>
      {action&&<button onClick={action} style={{fontSize:12,color:SAP.blue,background:'none',border:'none',cursor:'pointer',fontWeight:500}}>{actionLabel||'Voir tout'}</button>}
    </div>
    {children}
  </div>
);

// ===== DONNÉES =====
const DEPTS = ['Direction Générale','Technique & Ingénierie','Finance & Comptabilité','Ressources Humaines','Commercial & Business','Juridique & Conformité','Logistique & Opérations','Gestion de Projets'];
const POSTES = ['Directeur Général','Directeur Technique','Chef de Projet Senior','Chef de Projet','Ingénieur Télécom Senior','Ingénieur Télécom','Comptable Senior','Comptable','RH Manager','Commercial Senior','Juriste','Logisticien','Assistante de Direction','Technicien Senior','Technicien'];
const POSTES_EXT = ['Technicien Installation 5G','Technicien Installation 4G','Technicien Maintenance','Ingénieur RF Senior','Ingénieur RF','Chef d\'équipe terrain','Câbleur fibre optique','Électricien télécom'];
const BANQUES = ['BICEC','Société Générale Cameroun','Afriland First Bank','UBA Cameroun','Ecobank','MTN Mobile Money','Orange Money'];
const NIVEAUX = ['BEP/CAP','Bac','BTS/DUT','Licence','Master/Ingénieur','Doctorat'];
const CONTRATS = ['CDI','CDD','Stage','Freelance'];
const VILLES = ['Douala','Yaoundé','Bafoussam','Garoua','Bamenda','Kribi','Limbé','Buea'];

const EMPLOYES = [
  {id:'EI001',p:'Marie',n:'Kamga',email:'marie.kamga@cleanit.cm',tel:'+237 677 001 001',poste:'Chef de Projet Senior',dept:'Gestion de Projets',embauche:'2021-03-15',naissance:'1988-07-22',lieuN:'Douala',nation:'Camerounaise',cin:'12345678',salaire:650000,contrat:'CDI',status:'actif',genre:'F',ville:'Douala',adresse:'Akwa, Rue des Palmiers',banque:'BICEC',rib:'CM21 1001 1234 5678',mat:'CLN-INT-001',etudes:'Master/Ingénieur',urgNom:'Paul Kamga',urgTel:'+237 699 001 001',urgLien:'Époux',docs:[{nom:'Contrat CDI',type:'Contrat',date:'2021-03-15'},{nom:'Pièce identité',type:'CIN',date:'2021-03-15'},{nom:'Diplôme Master',type:'Diplôme',date:'2021-03-10'}],histo:[{date:'2023-01-01',evt:'Promotion',detail:'Chef de Projet → Chef de Projet Senior',par:'DG Jérôme Bell'},{date:'2021-03-15',evt:'Embauche',detail:'Recrutement CDI - Chef de Projet',par:'RH Aline Biya'}]},
  {id:'EI002',p:'Pierre',n:'Etoga',email:'pierre.etoga@cleanit.cm',tel:'+237 677 002 002',poste:'Ingénieur Télécom Senior',dept:'Technique & Ingénierie',embauche:'2020-06-01',naissance:'1985-11-30',lieuN:'Yaoundé',nation:'Camerounaise',cin:'87654321',salaire:580000,contrat:'CDI',status:'actif',genre:'M',ville:'Douala',adresse:'Bonanjo, Avenue de Gaulle',banque:'Société Générale Cameroun',rib:'CM21 2001 9876 5432',mat:'CLN-INT-002',etudes:'Master/Ingénieur',urgNom:'Claire Etoga',urgTel:'+237 699 002 002',urgLien:'Épouse',docs:[{nom:'Contrat CDI',type:'Contrat',date:'2020-06-01'},{nom:'Pièce identité',type:'CIN',date:'2020-06-01'}],histo:[{date:'2022-06-01',evt:'Augmentation',detail:'Révision salariale annuelle +8%',par:'DG Jérôme Bell'},{date:'2020-06-01',evt:'Embauche',detail:'Recrutement CDI - Ingénieur Télécom',par:'RH'}]},
  {id:'EI003',p:'Aline',n:'Biya',email:'aline.biya@cleanit.cm',tel:'+237 677 003 003',poste:'RH Manager',dept:'Ressources Humaines',embauche:'2022-01-10',naissance:'1990-04-15',lieuN:'Bafoussam',nation:'Camerounaise',cin:'11223344',salaire:480000,contrat:'CDI',status:'actif',genre:'F',ville:'Douala',adresse:'Bonapriso, Rue des Fleurs',banque:'Afriland First Bank',rib:'CM21 3001 1111 2222',mat:'CLN-INT-003',etudes:'Master/Ingénieur',urgNom:'Jean Biya',urgTel:'+237 699 003 003',urgLien:'Frère',docs:[{nom:'Contrat CDI',type:'Contrat',date:'2022-01-10'}],histo:[{date:'2022-01-10',evt:'Embauche',detail:'Recrutement CDI - RH Manager',par:'DG'}]},
  {id:'EI004',p:'David',n:'Mballa',email:'david.mballa@cleanit.cm',tel:'+237 677 004 004',poste:'Comptable Senior',dept:'Finance & Comptabilité',embauche:'2021-09-01',naissance:'1987-02-18',lieuN:'Douala',nation:'Camerounaise',cin:'44332211',salaire:420000,contrat:'CDI',status:'actif',genre:'M',ville:'Douala',adresse:'Deido, Rue du Commerce',banque:'BICEC',rib:'CM21 1001 4444 5555',mat:'CLN-INT-004',etudes:'Licence',urgNom:'Rose Mballa',urgTel:'+237 699 004 004',urgLien:'Épouse',docs:[{nom:'Contrat CDI',type:'Contrat',date:'2021-09-01'}],histo:[{date:'2021-09-01',evt:'Embauche',detail:'Recrutement CDI - Comptable',par:'RH'}]},
  {id:'EI005',p:'Jean',n:'Fouda',email:'jean.fouda@cleanit.cm',tel:'+237 677 005 005',poste:'Commercial Senior',dept:'Commercial & Business',embauche:'2023-02-15',naissance:'1992-09-05',lieuN:'Yaoundé',nation:'Camerounaise',cin:'55667788',salaire:380000,contrat:'CDI',status:'conge',genre:'M',ville:'Yaoundé',adresse:'Bastos',banque:'MTN Mobile Money',rib:'677005005',mat:'CLN-INT-005',etudes:'Master/Ingénieur',urgNom:'Alice Fouda',urgTel:'+237 699 005 005',urgLien:'Sœur',docs:[{nom:'Contrat CDI',type:'Contrat',date:'2023-02-15'}],histo:[{date:'2023-02-15',evt:'Embauche',detail:'Recrutement CDI - Commercial',par:'RH'}]},
  {id:'EI006',p:'Sandra',n:'Nguele',email:'sandra.nguele@cleanit.cm',tel:'+237 677 006 006',poste:'Assistante de Direction',dept:'Direction Générale',embauche:'2020-11-01',naissance:'1994-12-20',lieuN:'Kribi',nation:'Camerounaise',cin:'99887766',salaire:320000,contrat:'CDI',status:'actif',genre:'F',ville:'Douala',adresse:'Akwa Nord',banque:'Orange Money',rib:'698006006',mat:'CLN-INT-006',etudes:'BTS/DUT',urgNom:'Marc Nguele',urgTel:'+237 699 006 006',urgLien:'Père',docs:[{nom:'Contrat CDI',type:'Contrat',date:'2020-11-01'},{nom:'Avenant salaire',type:'Avenant',date:'2022-11-01'}],histo:[{date:'2022-11-01',evt:'Avenant',detail:'Révision salariale +5%',par:'DG'},{date:'2020-11-01',evt:'Embauche',detail:'Recrutement CDI',par:'RH'}]},
];

const EXTERNES = [
  {id:'EE001',p:'Thomas',n:'Ngono',tel:'+237 677 100 001',poste:'Technicien Installation 5G',spec:'5G NR / 4G LTE',status:'actif',mat:'CLN-EXT-001',banque:'MTN Mobile Money',rib:'677100001',ville:'Douala',cin:'EXT001',naissance:'1990-05-12',projets:['PROJ-2024-001'],totalPercu:13500000,taux:85000,contrat:'Freelance',note:4.8,nbProjets:7},
  {id:'EE002',p:'Jean',n:'Mbarga',tel:'+237 677 100 002',poste:'Ingénieur RF Senior',spec:'Survey & Optimisation RF',status:'actif',mat:'CLN-EXT-002',banque:'Orange Money',rib:'698100002',ville:'Yaoundé',cin:'EXT002',naissance:'1985-09-22',projets:['PROJ-2024-002'],totalPercu:8500000,taux:120000,contrat:'Freelance',note:4.9,nbProjets:12},
  {id:'EE003',p:'Samuel',n:'Djomo',tel:'+237 677 100 003',poste:'Technicien Maintenance',spec:'3G UMTS / 4G LTE',status:'actif',mat:'CLN-EXT-003',banque:'BICEC',rib:'CM21 1001 8888',ville:'Douala',cin:'EXT003',naissance:'1992-03-18',projets:['PROJ-2024-004'],totalPercu:6200000,taux:70000,contrat:'Freelance',note:4.5,nbProjets:5},
  {id:'EE004',p:'Ali',n:'Moussa',tel:'+237 677 100 004',poste:'Chef d\'équipe terrain',spec:'Supervision & HSE',status:'actif',mat:'CLN-EXT-004',banque:'MTN Mobile Money',rib:'677100004',ville:'Garoua',cin:'EXT004',naissance:'1983-11-30',projets:['PROJ-2024-003'],totalPercu:4800000,taux:95000,contrat:'Freelance',note:4.7,nbProjets:9},
  {id:'EE005',p:'René',n:'Talla',tel:'+237 677 100 005',poste:'Câbleur fibre optique',spec:'Fibre optique FTTH',status:'actif',mat:'CLN-EXT-005',banque:'Orange Money',rib:'698100005',ville:'Bafoussam',cin:'EXT005',naissance:'1995-07-08',projets:[],totalPercu:2100000,taux:55000,contrat:'Freelance',note:4.2,nbProjets:3},
];

const BULLETINS_SEED = [
  {id:'B001',empId:'EI001',mois:2,annee:2024,base:650000,primes:75000,avantages:50000,ded:0,brut:775000,net:775000,status:'paye',datePai:'2024-02-28',mode:'Virement BICEC'},
  {id:'B002',empId:'EI002',mois:2,annee:2024,base:580000,primes:40000,avantages:30000,ded:0,brut:650000,net:650000,status:'paye',datePai:'2024-02-28',mode:'Virement SGC'},
  {id:'B003',empId:'EI003',mois:2,annee:2024,base:480000,primes:0,avantages:25000,ded:0,brut:505000,net:505000,status:'paye',datePai:'2024-02-28',mode:'Virement Afriland'},
  {id:'B004',empId:'EI001',mois:3,annee:2024,base:650000,primes:75000,avantages:50000,ded:0,brut:775000,net:775000,status:'en_attente',datePai:null,mode:'Virement BICEC'},
  {id:'B005',empId:'EI002',mois:3,annee:2024,base:580000,primes:40000,avantages:30000,ded:0,brut:650000,net:650000,status:'en_attente',datePai:null,mode:'Virement SGC'},
  {id:'B006',empId:'EI003',mois:3,annee:2024,base:480000,primes:0,avantages:25000,ded:0,brut:505000,net:505000,status:'en_attente',datePai:null,mode:'Virement Afriland'},
  {id:'B007',empId:'EI004',mois:3,annee:2024,base:420000,primes:20000,avantages:20000,ded:0,brut:460000,net:460000,status:'en_attente',datePai:null,mode:'Virement BICEC'},
  {id:'B008',empId:'EI006',mois:3,annee:2024,base:320000,primes:0,avantages:15000,ded:0,brut:335000,net:335000,status:'en_attente',datePai:null,mode:'Orange Money'},
];

const POINTAGES_SEED = [
  {id:'P001',empId:'EI001',date:'2024-03-15',entree:'08:02',sortie:'17:45',heures:8.72,status:'present',note:''},
  {id:'P002',empId:'EI002',date:'2024-03-15',entree:'07:55',sortie:'18:10',heures:9.25,status:'present',note:''},
  {id:'P003',empId:'EI003',date:'2024-03-15',entree:'09:15',sortie:'17:30',heures:7.25,status:'retard',note:'Retard 1h15'},
  {id:'P004',empId:'EI004',date:'2024-03-15',entree:'08:00',sortie:'17:00',heures:8,status:'present',note:''},
  {id:'P005',empId:'EI005',date:'2024-03-15',entree:'',sortie:'',heures:0,status:'absent',note:'Congé annuel'},
  {id:'P006',empId:'EI006',date:'2024-03-15',entree:'08:30',sortie:'17:30',heures:8,status:'present',note:''},
];

const CONGES_SEED = [
  {id:'C001',empId:'EI005',empNom:'Jean Fouda',type:'Congé annuel',debut:'2024-03-01',fin:'2024-03-20',jours:20,status:'approuve',motif:'Congé annuel Q1 2024',remplacant:'Pierre Etoga',approPar:'Aline Biya',dateAppro:'2024-02-20'},
  {id:'C002',empId:'EI003',empNom:'Aline Biya',type:'Congé maladie',debut:'2024-03-10',fin:'2024-03-12',jours:3,status:'approuve',motif:'Ordonnance médicale',remplacant:'Sandra Nguele',approPar:'Marie Kamga',dateAppro:'2024-03-10'},
  {id:'C003',empId:'EI001',empNom:'Marie Kamga',type:'Congé exceptionnel',debut:'2024-04-05',fin:'2024-04-06',jours:2,status:'en_attente',motif:'Mariage',remplacant:'',approPar:'',dateAppro:''},
];

const PAIEMENTS_EXT_SEED = [
  {id:'PE001',empId:'EE001',projet:'PROJ-2024-001',client:'MTN Cameroun',phase:'Phase 1 (30%)',montantP:45000000,pct:30,net:13500000,status:'paye',datePai:'2024-01-20',mode:'MTN Mobile Money',ref:'PAY-EXT-001'},
  {id:'PE002',empId:'EE002',projet:'PROJ-2024-002',client:'Orange Cameroun',phase:'Paiement unique',montantP:12000000,pct:100,net:8500000,status:'paye',datePai:'2024-02-15',mode:'Orange Money',ref:'PAY-EXT-002'},
  {id:'PE003',empId:'EE001',projet:'PROJ-2024-001',client:'MTN Cameroun',phase:'Phase 2 (40%)',montantP:45000000,pct:40,net:18000000,status:'en_attente',datePai:null,mode:'MTN Mobile Money',ref:null},
  {id:'PE004',empId:'EE003',projet:'PROJ-2024-004',client:'MTN Cameroun',phase:'Phase 1 (25%)',montantP:18500000,pct:25,net:4625000,status:'en_attente',datePai:null,mode:'Virement BICEC',ref:null},
];

// ===== PROFIL EMPLOYÉ STYLE SAP SUCCESSFACTORS =====
const ProfilSAP = ({emp,onClose,bulletins,estExt}) => {
  const [tab,setTab] = useState('infos');
  const ac = getAC(emp.p+emp.n);
  const anciennete = emp.embauche ? Math.floor((Date.now()-new Date(emp.embauche))/(365.25*24*3600*1000)) : 0;
  const bEmp = bulletins.filter(b=>b.empId===emp.id);

  const TABS = estExt
    ? [{id:'infos',l:'Informations'},{id:'projets',l:'Projets & Paiements'},{id:'perf',l:'Performance'}]
    : [{id:'infos',l:'Informations personnelles'},{id:'emploi',l:'Emploi & Contrat'},{id:'paie',l:'Paie & Rémunération'},{id:'docs',l:'Documents'},{id:'histo',l:'Historique RH'}];

  // Champ info display style SAP
  const InfoRow = ({label,value,mono}) => (
    <div style={{padding:'12px 0',borderBottom:`1px solid ${SAP.border2}`,display:'grid',gridTemplateColumns:'180px 1fr',gap:16,alignItems:'center'}}>
      <span style={{fontSize:13,color:SAP.muted,fontWeight:500}}>{label}</span>
      <span style={{fontSize:13,color:SAP.text,fontWeight:400,fontFamily:mono?'monospace':'inherit'}}>{value||'—'}</span>
    </div>
  );

  return (
    <Panel title="" onClose={onClose} width={900}
      footer={<>
        <Btn label="Fermer" onClick={onClose} variant="ghost"/>
        {!estExt&&<Btn label="Générer bulletin" icon="pay" variant="secondary"/>}
        <Btn label="Modifier" icon="edit" variant="primary"/>
      </>}>

      {/* HEADER PROFIL — Style SAP People Profile */}
      <div style={{background:`linear-gradient(135deg, ${SAP.sidebar} 0%, ${SAP.sidebar2} 100%)`,padding:'28px 32px',position:'relative'}}>
        <div style={{display:'flex',gap:20,alignItems:'center'}}>
          {/* Grand avatar */}
          <div style={{width:88,height:88,borderRadius:'50%',background:ac.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:700,color:ac.c,border:'3px solid rgba(255,255,255,0.3)',flexShrink:0}}>
            {getInitials(emp.p,emp.n)}
          </div>
          {/* Infos principales */}
          <div style={{flex:1}}>
            <div style={{fontSize:24,fontWeight:700,color:'white',marginBottom:4}}>{emp.p} {emp.n}</div>
            <div style={{fontSize:14,color:'rgba(255,255,255,0.8)',marginBottom:8}}>{emp.poste}{emp.dept?` · ${emp.dept}`:''}</div>
            <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
              {[
                {i:'building',v:emp.ville},{i:'mail',v:emp.email},
                {i:'phone',v:emp.tel},
              ].filter(x=>x.v).map(item=>(
                <div key={item.i} style={{display:'flex',alignItems:'center',gap:6,fontSize:13,color:'rgba(255,255,255,0.7)'}}>
                  <I n={item.i} s={13} c="rgba(255,255,255,0.6)"/>
                  {item.v}
                </div>
              ))}
            </div>
          </div>
          {/* Chips status */}
          <div style={{display:'flex',flexDirection:'column',gap:8,alignItems:'flex-end'}}>
            <Badge s={emp.status}/>
            <span style={{fontSize:12,color:'rgba(255,255,255,0.6)',fontFamily:'monospace'}}>{emp.mat}</span>
            {!estExt&&<span style={{fontSize:12,color:'rgba(255,255,255,0.6)'}}>{emp.contrat} · {anciennete} an{anciennete>1?'s':''}</span>}
            {estExt&&<div style={{display:'flex',gap:3}}>{[1,2,3,4,5].map(s=><svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s<=Math.round(emp.note)?'#FFD700':'rgba(255,255,255,0.2)'} stroke="none"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>)}</div>}
          </div>
        </div>

        {/* Navigation tabs — style SAP */}
        <div style={{display:'flex',gap:0,marginTop:20,borderTop:'1px solid rgba(255,255,255,0.15)',paddingTop:4}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'10px 20px',border:'none',borderBottom:`3px solid ${tab===t.id?'white':'transparent'}`,background:'transparent',color:tab===t.id?'white':'rgba(255,255,255,0.55)',fontWeight:tab===t.id?600:400,fontSize:13,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit',transition:'all .15s'}}>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENU ONGLETS */}
      <div style={{padding:'24px 32px'}}>

        {/* Informations personnelles */}
        {tab==='infos'&&(
          <div>
            <Sec title="Informations personnelles">
              <InfoRow label="Prénom" value={emp.p}/>
              <InfoRow label="Nom" value={emp.n}/>
              <InfoRow label="Genre" value={emp.genre==='M'?'Masculin':'Féminin'}/>
              <InfoRow label="Date de naissance" value={fmtD(emp.naissance)}/>
              <InfoRow label="Lieu de naissance" value={emp.lieuN}/>
              <InfoRow label="Nationalité" value={emp.nation}/>
              <InfoRow label="N° CIN / Passeport" value={emp.cin} mono/>
              <InfoRow label="Niveau d\'études" value={emp.etudes}/>
            </Sec>
            <Sec title="Coordonnées">
              <InfoRow label="Téléphone" value={emp.tel}/>
              <InfoRow label="Email professionnel" value={emp.email}/>
              <InfoRow label="Ville" value={emp.ville}/>
              <InfoRow label="Adresse" value={emp.adresse}/>
            </Sec>
            <Sec title="Contact d\'urgence">
              <InfoRow label="Nom" value={emp.urgNom}/>
              <InfoRow label="Téléphone" value={emp.urgTel}/>
              <InfoRow label="Lien de parenté" value={emp.urgLien}/>
            </Sec>
          </div>
        )}

        {/* Emploi & Contrat */}
        {tab==='emploi'&&(
          <div>
            <Sec title="Poste & Organisation">
              <InfoRow label="Matricule" value={emp.mat} mono/>
              <InfoRow label="Poste" value={emp.poste}/>
              <InfoRow label="Département" value={emp.dept}/>
              <InfoRow label="Type de contrat" value={emp.contrat}/>
              <InfoRow label="Date d\'embauche" value={fmtD(emp.embauche)}/>
              <InfoRow label="Ancienneté" value={`${anciennete} an${anciennete>1?'s':''}`}/>
              <InfoRow label="Statut" value={<Badge s={emp.status}/>}/>
            </Sec>
            <Sec title="Coordonnées bancaires">
              <InfoRow label="Banque / Mobile Money" value={emp.banque}/>
              <InfoRow label="RIB / Numéro de compte" value={emp.rib} mono/>
            </Sec>
          </div>
        )}

        {/* Paie & Rémunération — accès restreint */}
        {tab==='paie'&&(
          <div>
            <div style={{background:SAP.blue_bg,border:`1px solid ${SAP.blue}30`,borderRadius:4,padding:'14px 20px',marginBottom:20,display:'flex',alignItems:'center',gap:10}}>
              <I n="alert" s={16} c={SAP.blue}/>
              <span style={{fontSize:13,color:SAP.blue}}>Les informations de rémunération sont visibles uniquement par les personnes habilitées.</span>
            </div>
            <Sec title="Rémunération">
              <div style={{background:`linear-gradient(135deg,${SAP.sidebar},${SAP.sidebar2})`,borderRadius:8,padding:'20px 24px',marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,0.55)',textTransform:'uppercase',letterSpacing:0.4,marginBottom:4}}>Salaire de base mensuel</div>
                  <div style={{fontSize:32,fontWeight:700,color:'white'}}>{fmtN(emp.salaire)} <span style={{fontSize:16,fontWeight:400}}>FCFA</span></div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,0.5)',marginTop:4}}>{emp.contrat} · Versement mensuel</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:12,color:'rgba(255,255,255,0.55)',marginBottom:4}}>Banque de versement</div>
                  <div style={{fontSize:14,fontWeight:600,color:'rgba(255,255,255,0.85)'}}>{emp.banque}</div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,0.5)',fontFamily:'monospace'}}>{emp.rib}</div>
                </div>
              </div>
            </Sec>
            <Sec title="Bulletins de paie">
              {bEmp.length===0
                ? <div style={{padding:'24px',textAlign:'center',color:SAP.muted,background:SAP.gray8,borderRadius:4}}>Aucun bulletin généré</div>
                : <div style={{border:`1px solid ${SAP.border}`,borderRadius:4,overflow:'hidden'}}>
                    <Tbl
                      cols={['Période','Salaire de base','Primes','Avantages','Brut','Net à payer','Mode paiement','Date paiement','Statut','']}
                      rows={bEmp.map(b=>[
                        <span style={{fontWeight:600}}>{MOIS_SHORT[b.mois-1]} {b.annee}</span>,
                        <span>{fmtN(b.base)} FCFA</span>,
                        <span style={{color:SAP.green}}>{b.primes>0?`+${fmtN(b.primes)}`:' —'}</span>,
                        <span style={{color:SAP.blue}}>{b.avantages>0?`+${fmtN(b.avantages)}`:' —'}</span>,
                        <span style={{fontWeight:500}}>{fmtN(b.brut)} FCFA</span>,
                        <strong style={{color:SAP.blue,fontSize:14}}>{fmtN(b.net)} FCFA</strong>,
                        <span style={{fontSize:12,color:SAP.muted}}>{b.mode}</span>,
                        <span style={{fontSize:12,color:SAP.muted}}>{b.datePai?fmtD(b.datePai):'—'}</span>,
                        <Badge s={b.status}/>,
                        <div style={{display:'flex',gap:4}}>
                          <button style={{padding:'4px 8px',border:`1px solid ${SAP.border}`,borderRadius:4,background:SAP.white,cursor:'pointer',fontSize:11}}><I n="eye" s={12} c={SAP.muted}/></button>
                          <button style={{padding:'4px 8px',border:`1px solid ${SAP.border}`,borderRadius:4,background:SAP.white,cursor:'pointer',fontSize:11}}><I n="print" s={12} c={SAP.muted}/></button>
                        </div>
                      ])}
                    />
                  </div>
              }
            </Sec>
          </div>
        )}

        {/* Documents */}
        {tab==='docs'&&(
          <div>
            <div style={{display:'flex',justifyContent:'flex-end',marginBottom:16}}>
              <Btn label="Ajouter document" icon="upload" variant="secondary" sm/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {(emp.docs||[]).map((doc,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',background:SAP.white,border:`1px solid ${SAP.border}`,borderRadius:4,cursor:'pointer',transition:'border-color .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=SAP.blue}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=SAP.border}>
                  <div style={{width:40,height:40,borderRadius:4,background:SAP.blue_bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <I n="doc" s={20} c={SAP.blue}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:SAP.text}}>{doc.nom}</div>
                    <div style={{fontSize:11,color:SAP.muted,marginTop:1}}>{doc.type} · {fmtD(doc.date)}</div>
                  </div>
                  <div style={{display:'flex',gap:4}}>
                    <button style={{width:28,height:28,border:`1px solid ${SAP.border}`,borderRadius:4,background:SAP.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><I n="eye" s={13} c={SAP.muted}/></button>
                    <button style={{width:28,height:28,border:`1px solid ${SAP.border}`,borderRadius:4,background:SAP.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><I n="down" s={13} c={SAP.muted}/></button>
                  </div>
                </div>
              ))}
              {(!emp.docs||emp.docs.length===0)&&(
                <div style={{gridColumn:'1/-1',padding:'40px',textAlign:'center',color:SAP.muted,background:SAP.gray8,borderRadius:4,border:`1px dashed ${SAP.border}`}}>
                  <I n="doc" s={32} c={SAP.border}/>
                  <div style={{fontSize:14,marginTop:10}}>Aucun document</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Historique RH */}
        {tab==='histo'&&(
          <div>
            <div style={{display:'flex',justifyContent:'flex-end',marginBottom:16}}>
              <Btn label="Ajouter événement" icon="plus" variant="secondary" sm/>
            </div>
            <div style={{position:'relative',paddingLeft:32}}>
              <div style={{position:'absolute',left:12,top:0,bottom:0,width:2,background:SAP.border}}/>
              {(emp.histo||[]).map((h,i)=>{
                const colors = {Promotion:SAP.green,Embauche:SAP.blue,Augmentation:SAP.orange,Avenant:SAP.teal};
                const c = colors[h.evt]||SAP.gray3;
                return (
                  <div key={i} style={{display:'flex',gap:14,marginBottom:20,position:'relative'}}>
                    <div style={{position:'absolute',left:-31,width:20,height:20,borderRadius:'50%',background:c,border:`2px solid ${SAP.white}`,display:'flex',alignItems:'center',justifyContent:'center',top:10}}>
                      <I n={h.evt==='Promotion'?'star':h.evt==='Embauche'?'person':'pay'} s={10} c="white"/>
                    </div>
                    <div style={{flex:1,background:SAP.white,border:`1px solid ${SAP.border}`,borderRadius:4,padding:'14px 18px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                        <span style={{fontSize:14,fontWeight:600,color:c}}>{h.evt}</span>
                        <span style={{fontSize:12,color:SAP.muted}}>{fmtD(h.date)}</span>
                      </div>
                      <div style={{fontSize:13,color:SAP.text2,marginBottom:4}}>{h.detail}</div>
                      <div style={{fontSize:11,color:SAP.muted}}>Par {h.par}</div>
                    </div>
                  </div>
                );
              })}
              {(!emp.histo||emp.histo.length===0)&&<div style={{padding:'32px',textAlign:'center',color:SAP.muted}}>Aucun événement</div>}
            </div>
          </div>
        )}

        {/* Projets externes */}
        {tab==='projets'&&(
          <div>
            <div style={{display:'flex',gap:12,marginBottom:20}}>
              {[{l:'Projets réalisés',v:emp.nbProjets,c:SAP.blue},{l:'Total perçu',v:`${fmtN(emp.totalPercu)} FCFA`,c:SAP.green},{l:'Taux journalier',v:`${fmtN(emp.taux)} FCFA`,c:SAP.text}].map(k=>(
                <div key={k.l} style={{flex:1,background:SAP.blue_light,border:`1px solid ${SAP.border}`,borderRadius:4,padding:'14px 16px'}}>
                  <div style={{fontSize:11,color:SAP.muted,textTransform:'uppercase',letterSpacing:0.4,marginBottom:4}}>{k.l}</div>
                  <div style={{fontSize:typeof k.v==='number'?24:16,fontWeight:700,color:k.c}}>{k.v}</div>
                </div>
              ))}
            </div>
            <Sec title="Paiements par projet">
              <div style={{border:`1px solid ${SAP.border}`,borderRadius:4,overflow:'hidden'}}>
                <Tbl
                  cols={['Projet','Client','Phase','% négocié','Montant net','Date','Statut']}
                  rows={PAIEMENTS_EXT_SEED.filter(p=>p.empId===emp.id).map(p=>[
                    <span style={{fontWeight:600,color:SAP.blue}}>{p.projet}</span>,
                    p.client,
                    <span style={{fontSize:12,color:SAP.muted}}>{p.phase}</span>,
                    <span style={{padding:'2px 8px',borderRadius:4,background:SAP.green_bg,color:SAP.green,fontSize:12,fontWeight:600}}>{p.pct}%</span>,
                    <strong style={{color:SAP.orange}}>{fmtN(p.net)} FCFA</strong>,
                    <span style={{fontSize:12,color:SAP.muted}}>{p.datePai?fmtD(p.datePai):'—'}</span>,
                    <Badge s={p.status}/>,
                  ])}
                  empty="Aucun paiement"
                />
              </div>
            </Sec>
          </div>
        )}

        {/* Performance externe */}
        {tab==='perf'&&(
          <div style={{textAlign:'center',padding:'40px 20px'}}>
            <div style={{fontSize:64,fontWeight:700,color:SAP.blue,marginBottom:8}}>{emp.note}</div>
            <div style={{fontSize:16,color:SAP.muted,marginBottom:16}}>/ 5 — Note de performance globale</div>
            <div style={{display:'flex',justifyContent:'center',gap:6,marginBottom:24}}>
              {[1,2,3,4,5].map(s=>(
                <svg key={s} width="28" height="28" viewBox="0 0 24 24" fill={s<=Math.round(emp.note)?'#F0AB00':SAP.gray6} stroke={s<=Math.round(emp.note)?'#E09900':SAP.gray5} strokeWidth="1">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
              ))}
            </div>
            <div style={{fontSize:13,color:SAP.muted}}>Basé sur {emp.nbProjets} projets réalisés</div>
          </div>
        )}
      </div>
    </Panel>
  );
};

// ===== BULLETIN OFFICIEL SAP =====
const BulletinOfficiel = ({b,emp,onClose,onValider}) => {
  if(!b||!emp) return null;
  return (
    <Modal title={`Bulletin de paie — ${MOIS[b.mois-1]} ${b.annee}`} onClose={onClose} maxWidth={680}>
      <div style={{padding:'24px'}}>
        {/* En-tête société */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,paddingBottom:16,borderBottom:`2px solid ${SAP.blue}`}}>
          <div>
            <div style={{fontSize:22,fontWeight:800,color:SAP.sidebar,letterSpacing:0.5}}>CLEAN<span style={{color:SAP.blue}}>IT</span></div>
            <div style={{fontSize:11,color:SAP.muted}}>Télécommunications · Douala, Cameroun</div>
            <div style={{fontSize:11,color:SAP.muted}}>RCCM : DLA/2019/B/1234 · NIU : M012345678901P</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:13,fontWeight:700,color:SAP.sidebar,textTransform:'uppercase',letterSpacing:0.5}}>Bulletin de Paie</div>
            <div style={{fontSize:13,color:SAP.text2,marginTop:4}}>{MOIS[b.mois-1]} {b.annee}</div>
            <div style={{fontSize:11,color:SAP.muted,fontFamily:'monospace',marginTop:2}}>Réf: {b.id}</div>
          </div>
        </div>

        {/* Infos employé */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20,padding:'14px 16px',background:SAP.gray8,borderRadius:4,border:`1px solid ${SAP.border}`}}>
          {[
            {l:'Matricule',v:emp.mat},{l:'Nom & Prénom',v:`${emp.p} ${emp.n}`},
            {l:'Poste',v:emp.poste},{l:'Département',v:emp.dept||'—'},
            {l:'Date d\'embauche',v:fmtD(emp.embauche)},{l:'Type de contrat',v:emp.contrat},
          ].map(item=>(
            <div key={item.l}>
              <div style={{fontSize:10,color:SAP.muted,textTransform:'uppercase',letterSpacing:0.4,marginBottom:2}}>{item.l}</div>
              <div style={{fontSize:13,fontWeight:600,color:SAP.text}}>{item.v}</div>
            </div>
          ))}
        </div>

        {/* Tableau paie */}
        <table style={{width:'100%',borderCollapse:'collapse',marginBottom:16}}>
          <thead>
            <tr style={{background:SAP.sidebar}}>
              <th style={{padding:'10px 14px',textAlign:'left',fontSize:12,fontWeight:600,color:'white',textTransform:'uppercase',letterSpacing:0.3}}>Libellé</th>
              <th style={{padding:'10px 14px',textAlign:'right',fontSize:12,fontWeight:600,color:'white',textTransform:'uppercase',letterSpacing:0.3}}>Montant (FCFA)</th>
            </tr>
          </thead>
          <tbody>
            {[
              {l:'Salaire de base',v:b.base,c:SAP.text},
              ...(b.primes>0?[{l:'Primes & Bonus',v:b.primes,c:SAP.green}]:[]),
              ...(b.avantages>0?[{l:'Avantages en nature',v:b.avantages,c:SAP.blue}]:[]),
            ].map((item,i)=>(
              <tr key={i} style={{borderBottom:`1px solid ${SAP.border2}`,background:i%2===0?SAP.white:SAP.gray8}}>
                <td style={{padding:'11px 14px',fontSize:13,color:item.c}}>{item.l}</td>
                <td style={{padding:'11px 14px',fontSize:13,fontWeight:600,color:item.c,textAlign:'right'}}>{fmtN(item.v)}</td>
              </tr>
            ))}
            <tr style={{background:SAP.green_bg,borderTop:`2px solid ${SAP.green}`}}>
              <td style={{padding:'12px 14px',fontSize:14,fontWeight:700,color:SAP.green}}>SALAIRE BRUT</td>
              <td style={{padding:'12px 14px',fontSize:14,fontWeight:700,color:SAP.green,textAlign:'right'}}>{fmtN(b.brut)}</td>
            </tr>
            {b.ded>0&&(
              <tr style={{background:SAP.red_bg}}>
                <td style={{padding:'11px 14px',fontSize:13,color:SAP.red}}>Retenues & Déductions</td>
                <td style={{padding:'11px 14px',fontSize:13,fontWeight:600,color:SAP.red,textAlign:'right'}}>- {fmtN(b.ded)}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr style={{background:SAP.blue}}>
              <td style={{padding:'14px',fontSize:16,fontWeight:700,color:'white'}}>NET À PAYER</td>
              <td style={{padding:'14px',fontSize:22,fontWeight:800,color:'white',textAlign:'right'}}>{fmtN(b.net)} FCFA</td>
            </tr>
          </tfoot>
        </table>

        {/* Paiement info */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:SAP.gray8,borderRadius:4,marginBottom:20,border:`1px solid ${SAP.border}`}}>
          <div>
            <div style={{fontSize:11,color:SAP.muted,marginBottom:2}}>Mode de paiement</div>
            <div style={{fontSize:13,fontWeight:600,color:SAP.text}}>{b.mode}</div>
          </div>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <Badge s={b.status}/>
            {b.datePai&&<span style={{fontSize:12,color:SAP.muted}}>Le {fmtD(b.datePai)}</span>}
          </div>
        </div>

        {/* Signatures */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,paddingTop:16,borderTop:`1px solid ${SAP.border}`}}>
          {['Signature de l\'employé','Signature de la Direction'].map(s=>(
            <div key={s} style={{textAlign:'center'}}>
              <div style={{fontSize:11,color:SAP.muted,marginBottom:32}}>{s}</div>
              <div style={{height:1,background:SAP.border}}/>
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:20}}>
          <Btn label="Fermer" onClick={onClose} variant="ghost"/>
          <Btn label="Imprimer" icon="print" variant="secondary"/>
          <Btn label="Télécharger PDF" icon="down" variant="secondary"/>
          {b.status==='en_attente'&&<Btn label="Valider & Marquer payé" icon="check" variant="positive" onClick={()=>{onValider(b.id);onClose();}}/>}
        </div>
      </div>
    </Modal>
  );
};

// ===== FORMULAIRE EMPLOYÉ 3 ÉTAPES =====
const FormEmploye = ({type,onClose,onSave}) => {
  const [step,setStep] = useState(1);
  const [f,setF] = useState({p:'',n:'',email:'',tel:'',genre:'',naissance:'',cin:'',etudes:'',ville:'',adresse:'',poste:'',dept:'',contrat:'CDI',embauche:'',salaire:'',banque:'',rib:'',urgNom:'',urgTel:'',urgLien:'',spec:'',taux:'',});
  const u = (k,v) => setF(p=>({...p,[k]:v}));
  const isInt = type==='interne';

  const save = () => {
    if(!f.p||!f.n) { alert('Prénom et nom obligatoires'); return; }
    const emp = {
      id:`${isInt?'EI':'EE'}${Date.now()}`,
      p:f.p,n:f.n,email:f.email,tel:f.tel,genre:f.genre,
      naissance:f.naissance,lieuN:f.ville,nation:'Camerounaise',cin:f.cin,
      etudes:f.etudes,ville:f.ville,adresse:f.adresse,
      poste:f.poste,banque:f.banque,rib:f.rib,
      mat:`CLN-${isInt?'INT':'EXT'}-${String(Math.floor(Math.random()*900+100))}`,
      status:'actif',urgNom:f.urgNom,urgTel:f.urgTel,urgLien:f.urgLien,
      docs:[],histo:[{date:new Date().toISOString().split('T')[0],evt:'Embauche',detail:`Recrutement ${f.contrat||'Freelance'} - ${f.poste}`,par:'RH'}],
      ...(isInt?{dept:f.dept,contrat:f.contrat,embauche:f.embauche,salaire:Number(f.salaire)||0}
            :{spec:f.spec,taux:Number(f.taux)||0,contrat:'Freelance',projets:[],totalPercu:0,note:0,nbProjets:0}),
    };
    onSave(emp); onClose();
  };

  const steps = isInt
    ? ['Identité','Poste & Contrat','Banque & Urgence']
    : ['Identité','Spécialité & Taux','Coordonnées bancaires'];

  return (
    <Modal title={isInt?'Nouvel employé interne':'Nouveau technicien externe'} onClose={onClose} maxWidth={620}>
      <div style={{padding:'20px 24px'}}>
        {/* Steps */}
        <div style={{display:'flex',alignItems:'center',marginBottom:24,gap:0}}>
          {steps.map((s,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',flex:i<steps.length-1?1:'auto'}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:step>i+1?SAP.green:step===i+1?SAP.blue:SAP.gray6,display:'flex',alignItems:'center',justifyContent:'center',color:step>=i+1?'white':SAP.gray3,fontSize:12,fontWeight:700,flexShrink:0}}>
                  {step>i+1?<I n="check" s={13} c="white"/>:i+1}
                </div>
                <span style={{fontSize:12,fontWeight:step===i+1?600:400,color:step===i+1?SAP.blue:step>i+1?SAP.green:SAP.muted,whiteSpace:'nowrap'}}>{s}</span>
              </div>
              {i<steps.length-1&&<div style={{flex:1,height:1,background:step>i+1?SAP.green:SAP.border,margin:'0 12px'}}/>}
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step===1&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <Fld label="Prénom" required><Inp value={f.p} onChange={v=>u('p',v)} placeholder="Prénom"/></Fld>
            <Fld label="Nom" required><Inp value={f.n} onChange={v=>u('n',v)} placeholder="Nom de famille"/></Fld>
            <Fld label="Genre"><Sel value={f.genre} onChange={v=>u('genre',v)} options={[{v:'M',l:'Masculin'},{v:'F',l:'Féminin'}]} placeholder="Genre"/></Fld>
            <Fld label="Date de naissance"><Inp type="date" value={f.naissance} onChange={v=>u('naissance',v)}/></Fld>
            <Fld label="N° CIN / Passeport"><Inp value={f.cin} onChange={v=>u('cin',v)} placeholder="Ex: 12345678"/></Fld>
            <Fld label="Téléphone" required><Inp value={f.tel} onChange={v=>u('tel',v)} placeholder="+237 6XX XXX XXX"/></Fld>
            {isInt&&<Fld label="Email professionnel"><Inp type="email" value={f.email} onChange={v=>u('email',v)} placeholder="prenom.nom@cleanit.cm"/></Fld>}
            <Fld label="Niveau d\'études"><Sel value={f.etudes} onChange={v=>u('etudes',v)} options={NIVEAUX} placeholder="Niveau"/></Fld>
            <Fld label="Ville" style={{gridColumn:'1/-1'}}><Sel value={f.ville} onChange={v=>u('ville',v)} options={VILLES} placeholder="Ville"/></Fld>
          </div>
        )}

        {/* STEP 2 */}
        {step===2&&isInt&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <Fld label="Poste" required><Sel value={f.poste} onChange={v=>u('poste',v)} options={POSTES} placeholder="Sélectionner"/></Fld>
            <Fld label="Département" required><Sel value={f.dept} onChange={v=>u('dept',v)} options={DEPTS} placeholder="Département"/></Fld>
            <Fld label="Type de contrat"><Sel value={f.contrat} onChange={v=>u('contrat',v)} options={CONTRATS}/></Fld>
            <Fld label="Date d\'embauche" required><Inp type="date" value={f.embauche} onChange={v=>u('embauche',v)}/></Fld>
            <Fld label="Salaire de base (FCFA)" required style={{gridColumn:'1/-1'}}><Inp type="number" value={f.salaire} onChange={v=>u('salaire',v)} placeholder="Ex: 450 000"/></Fld>
          </div>
        )}
        {step===2&&!isInt&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <Fld label="Poste" required><Sel value={f.poste} onChange={v=>u('poste',v)} options={POSTES_EXT} placeholder="Sélectionner"/></Fld>
            <Fld label="Spécialité" required><Inp value={f.spec} onChange={v=>u('spec',v)} placeholder="Ex: 5G NR / 4G LTE"/></Fld>
            <Fld label="Taux journalier (FCFA)"><Inp type="number" value={f.taux} onChange={v=>u('taux',v)} placeholder="Ex: 85 000"/></Fld>
          </div>
        )}

        {/* STEP 3 */}
        {step===3&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div style={{gridColumn:'1/-1',fontSize:13,fontWeight:700,color:SAP.blue,paddingBottom:8,borderBottom:`2px solid ${SAP.blue}`}}>COORDONNÉES BANCAIRES</div>
            <Fld label="Banque / Mobile Money" required><Sel value={f.banque} onChange={v=>u('banque',v)} options={BANQUES} placeholder="Sélectionner"/></Fld>
            <Fld label="RIB / Numéro de compte" required><Inp value={f.rib} onChange={v=>u('rib',v)} placeholder="CM21 XXXX ou 6XX XXX XXX"/></Fld>
            {isInt&&<>
              <div style={{gridColumn:'1/-1',fontSize:13,fontWeight:700,color:SAP.blue,paddingBottom:8,borderBottom:`2px solid ${SAP.blue}`,marginTop:8}}>CONTACT D'URGENCE</div>
              <Fld label="Nom complet"><Inp value={f.urgNom} onChange={v=>u('urgNom',v)} placeholder="Prénom Nom"/></Fld>
              <Fld label="Téléphone"><Inp value={f.urgTel} onChange={v=>u('urgTel',v)} placeholder="+237 6XX XXX XXX"/></Fld>
              <Fld label="Lien de parenté"><Sel value={f.urgLien} onChange={v=>u('urgLien',v)} options={['Époux/Épouse','Père','Mère','Frère','Sœur','Ami(e)','Autre']} placeholder="Lien"/></Fld>
            </>}
          </div>
        )}

        <div style={{display:'flex',justifyContent:'space-between',gap:8,paddingTop:20,borderTop:`1px solid ${SAP.border}`,marginTop:20}}>
          <Btn label="Annuler" onClick={onClose} variant="ghost"/>
          <div style={{display:'flex',gap:8}}>
            {step>1&&<Btn label="← Retour" onClick={()=>setStep(s=>s-1)} variant="secondary"/>}
            {step<steps.length&&<Btn label="Suivant →" onClick={()=>setStep(s=>s+1)} variant="primary"/>}
            {step===steps.length&&<Btn label="✓ Créer le profil" onClick={save} variant="positive"/>}
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ===== FORMULAIRE PAIEMENT EXTERNE =====
const FormPaiExt = ({externes,onClose,onSave}) => {
  const [empId,setEmpId] = useState('');
  const [projet,setProjet] = useState('');
  const [phase,setPhase] = useState('');
  const [montantP,setMontantP] = useState('');
  const [pct,setPct] = useState('');
  const [mode,setMode] = useState('');
  const emp = externes.find(e=>e.id===empId);
  const net = Math.round((Number(montantP)||0)*(Number(pct)||0)/100);

  const save = () => {
    if(!empId||!projet||!pct) return;
    onSave({id:'PE'+Date.now(),empId,projet,client:'',phase,montantP:Number(montantP)||0,pct:Number(pct)||0,net,status:'en_attente',datePai:null,mode:mode||emp?.banque||'',ref:null});
    onClose();
  };

  return (
    <Modal title="Nouveau paiement technicien" onClose={onClose} maxWidth={540}>
      <div style={{padding:'24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:16}}>
          <Fld label="Technicien" required style={{gridColumn:'1/-1'}}>
            <Sel value={empId} onChange={setEmpId} options={externes.map(e=>({v:e.id,l:`${e.p} ${e.n} — ${e.spec}`}))} placeholder="Sélectionner technicien"/>
          </Fld>
          {emp&&(
            <div style={{gridColumn:'1/-1',display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:SAP.blue_light,borderRadius:4,border:`1px solid ${SAP.border}`}}>
              <Av p={emp.p} n={emp.n} size={40}/>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:SAP.text}}>{emp.p} {emp.n} · {emp.mat}</div>
                <div style={{fontSize:12,color:SAP.muted}}>{emp.spec} · {emp.banque} : {emp.rib}</div>
              </div>
            </div>
          )}
          <Fld label="Référence projet" required><Inp value={projet} onChange={setProjet} placeholder="Ex: PROJ-2024-001"/></Fld>
          <Fld label="Phase"><Sel value={phase} onChange={setPhase} options={['Phase 1','Phase 2','Phase 3','Phase 4','Paiement unique','Solde final']} placeholder="Sélectionner"/></Fld>
          <Fld label="Montant total projet (FCFA)" required><Inp type="number" value={montantP} onChange={setMontantP} placeholder="Ex: 45 000 000"/></Fld>
          <Fld label="Pourcentage négocié (%)" required><Inp type="number" value={pct} onChange={setPct} placeholder="Ex: 30"/></Fld>
          <Fld label="Mode de paiement" style={{gridColumn:'1/-1'}}><Sel value={mode} onChange={setMode} options={BANQUES} placeholder={emp?.banque||'Sélectionner'}/></Fld>
        </div>
        {net>0&&(
          <div style={{padding:'16px 20px',background:SAP.sidebar,borderRadius:4,marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.6)'}}>Montant net à verser</div>
            <div style={{fontSize:24,fontWeight:700,color:'white'}}>{fmtN(net)} FCFA</div>
          </div>
        )}
        <div style={{display:'flex',gap:8,justifyContent:'flex-end',paddingTop:16,borderTop:`1px solid ${SAP.border}`}}>
          <Btn label="Annuler" onClick={onClose} variant="ghost"/>
          <Btn label="Créer paiement" icon="check" variant="positive" onClick={save} disabled={!empId||!projet||!pct}/>
        </div>
      </div>
    </Modal>
  );
};

// ===== DASHBOARD RH SAP =====
const Dashboard = ({employes,externes,bulletins,paiExt,setTab}) => {
  const actifs = employes.filter(e=>e.status==='actif').length;
  const bAtt = bulletins.filter(b=>b.status==='en_attente');
  const pAtt = paiExt.filter(p=>p.status==='en_attente');
  const presents = POINTAGES_SEED.filter(p=>p.status==='present').length;
  const retards = POINTAGES_SEED.filter(p=>p.status==='retard').length;
  const absents = POINTAGES_SEED.filter(p=>p.status==='absent').length;

  const parDept = DEPTS.map(d=>({d,n:employes.filter(e=>e.dept===d).length})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n);
  const maxN = Math.max(...parDept.map(x=>x.n),1);

  return (
    <div>
      {/* Alertes */}
      {(bAtt.length>0||pAtt.length>0)&&(
        <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
          {bAtt.length>0&&(
            <div style={{flex:1,minWidth:280,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',background:SAP.orange_bg,borderLeft:`4px solid ${SAP.orange}`,borderRadius:'0 4px 4px 0'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <I n="alert" s={16} c={SAP.orange}/>
                <div style={{fontSize:13,fontWeight:600,color:SAP.orange}}>{bAtt.length} bulletin(s) de paie en attente de validation</div>
              </div>
              <Btn label="Traiter" onClick={()=>setTab('paie')} variant="ghost" sm/>
            </div>
          )}
          {pAtt.length>0&&(
            <div style={{flex:1,minWidth:280,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',background:SAP.red_bg,borderLeft:`4px solid ${SAP.red}`,borderRadius:'0 4px 4px 0'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <I n="alert" s={16} c={SAP.red}/>
                <div style={{fontSize:13,fontWeight:600,color:SAP.red}}>{pAtt.length} paiement(s) externe(s) en attente · {fmtN(pAtt.reduce((s,p)=>s+p.net,0))} FCFA</div>
              </div>
              <Btn label="Traiter" onClick={()=>setTab('paiements_ext')} variant="ghost" sm/>
            </div>
          )}
        </div>
      )}

      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
        {[
          {l:'Effectif interne',v:employes.length,sub:`${actifs} actifs · ${employes.length-actifs} congé`,c:SAP.blue,i:'people'},
          {l:'Techniciens externes',v:externes.length,sub:`${externes.filter(e=>e.status==='actif').length} actifs`,c:'#7c3aed',i:'person'},
          {l:'Présents aujourd\'hui',v:presents,sub:`${retards} retard(s) · ${absents} absent(s)`,c:SAP.green,i:'clock'},
          {l:'Bulletins en attente',v:bAtt.length,sub:'À valider avant fin du mois',c:bAtt.length>0?SAP.orange:SAP.green,i:'doc'},
        ].map(k=>(
          <div key={k.l} style={{background:SAP.white,borderRadius:4,padding:'18px 20px',border:`1px solid ${SAP.border}`,borderTop:`3px solid ${k.c}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:600,color:SAP.muted,textTransform:'uppercase',letterSpacing:0.3}}>{k.l}</div>
              <div style={{width:32,height:32,borderRadius:4,background:SAP.blue_light,display:'flex',alignItems:'center',justifyContent:'center'}}><I n={k.i} s={16} c={k.c}/></div>
            </div>
            <div style={{fontSize:30,fontWeight:700,color:k.c,marginBottom:4}}>{k.v}</div>
            <div style={{fontSize:12,color:SAP.muted}}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Grille */}
      <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:16,marginBottom:16}}>
        {/* Équipe interne */}
        <div style={{background:SAP.white,border:`1px solid ${SAP.border}`,borderRadius:4,overflow:'hidden'}}>
          <div style={{padding:'12px 16px',borderBottom:`1px solid ${SAP.border}`,display:'flex',justifyContent:'space-between',alignItems:'center',background:SAP.gray8}}>
            <span style={{fontSize:13,fontWeight:700,color:SAP.text}}>Équipe interne — Profils</span>
            <button onClick={()=>setTab('internes')} style={{fontSize:12,color:SAP.blue,background:'none',border:'none',cursor:'pointer',fontWeight:500}}>Voir tous →</button>
          </div>
          {employes.slice(0,5).map((e,i)=>(
            <div key={e.id} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 16px',borderBottom:`1px solid ${SAP.border2}`,background:i%2===0?SAP.white:SAP.gray8}}>
              <Av p={e.p} n={e.n} size={36}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:SAP.text}}>{e.p} {e.n}</div>
                <div style={{fontSize:11,color:SAP.muted}}>{e.poste} · {e.mat}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <Badge s={e.status}/>
                <div style={{fontSize:10,color:SAP.muted,marginTop:3}}>{e.dept}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Droite */}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {/* Présence */}
          <div style={{background:SAP.white,border:`1px solid ${SAP.border}`,borderRadius:4,overflow:'hidden'}}>
            <div style={{padding:'12px 16px',borderBottom:`1px solid ${SAP.border}`,display:'flex',justifyContent:'space-between',alignItems:'center',background:SAP.gray8}}>
              <span style={{fontSize:13,fontWeight:700,color:SAP.text}}>Présence — Aujourd\'hui</span>
              <button onClick={()=>setTab('pointage')} style={{fontSize:12,color:SAP.blue,background:'none',border:'none',cursor:'pointer',fontWeight:500}}>Pointage →</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',borderBottom:`1px solid ${SAP.border}`}}>
              {[{l:'Présents',v:presents,c:SAP.green},{l:'Retards',v:retards,c:SAP.orange},{l:'Absents',v:absents,c:SAP.red}].map((k,i)=>(
                <div key={k.l} style={{padding:'12px',textAlign:'center',borderRight:i<2?`1px solid ${SAP.border2}`:''}}>
                  <div style={{fontSize:22,fontWeight:700,color:k.c}}>{k.v}</div>
                  <div style={{fontSize:10,color:SAP.muted,textTransform:'uppercase',letterSpacing:0.3,marginTop:2}}>{k.l}</div>
                </div>
              ))}
            </div>
            <div style={{padding:'10px 16px'}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:SAP.muted,marginBottom:5}}>
                <span>Taux de présence</span>
                <span style={{fontWeight:600,color:SAP.green}}>{Math.round(presents/employes.length*100)}%</span>
              </div>
              <div style={{height:6,background:SAP.gray6,borderRadius:3,overflow:'hidden'}}>
                <div style={{width:`${Math.round(presents/employes.length*100)}%`,height:'100%',background:SAP.green,borderRadius:3}}/>
              </div>
            </div>
          </div>

          {/* Répartition depts */}
          <div style={{background:SAP.white,border:`1px solid ${SAP.border}`,borderRadius:4,overflow:'hidden',flex:1}}>
            <div style={{padding:'12px 16px',borderBottom:`1px solid ${SAP.border}`,background:SAP.gray8}}>
              <span style={{fontSize:13,fontWeight:700,color:SAP.text}}>Effectifs par département</span>
            </div>
            <div style={{padding:'4px 0'}}>
              {parDept.slice(0,5).map(({d,n},i)=>(
                <div key={d} style={{padding:'8px 16px',borderBottom:i<4?`1px solid ${SAP.border2}`:'',background:i%2===0?SAP.white:SAP.gray8}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,fontSize:12}}>
                    <span style={{color:SAP.text2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d}</span>
                    <span style={{fontWeight:700,color:SAP.text,marginLeft:8,flexShrink:0}}>{n}</span>
                  </div>
                  <div style={{height:4,background:SAP.gray6,borderRadius:2,overflow:'hidden'}}>
                    <div style={{width:`${(n/maxN)*100}%`,height:'100%',background:SAP.blue,borderRadius:2}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bulletins récents */}
      <div style={{background:SAP.white,border:`1px solid ${SAP.border}`,borderRadius:4,overflow:'hidden'}}>
        <div style={{padding:'12px 16px',borderBottom:`1px solid ${SAP.border}`,display:'flex',justifyContent:'space-between',alignItems:'center',background:SAP.gray8}}>
          <span style={{fontSize:13,fontWeight:700,color:SAP.text}}>Activité paie récente</span>
          <button onClick={()=>setTab('paie')} style={{fontSize:12,color:SAP.blue,background:'none',border:'none',cursor:'pointer',fontWeight:500}}>Gérer →</button>
        </div>
        <Tbl
          cols={['Employé','Département','Période','Mode paiement','Statut']}
          rows={bulletins.slice(0,5).map(b=>{
            const e = employes.find(emp=>emp.id===b.empId);
            return [
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                {e&&<Av p={e.p} n={e.n} size={30}/>}
                <div>
                  <div style={{fontSize:13,fontWeight:500}}>{e?`${e.p} ${e.n}`:'—'}</div>
                  <div style={{fontSize:11,color:SAP.muted}}>{e?.mat}</div>
                </div>
              </div>,
              <span style={{fontSize:12,color:SAP.muted}}>{e?.dept||'—'}</span>,
              <span style={{fontWeight:500}}>{MOIS_SHORT[b.mois-1]} {b.annee}</span>,
              <span style={{fontSize:12,color:SAP.muted}}>{b.mode}</span>,
              <Badge s={b.status}/>,
            ];
          })}
        />
      </div>
    </div>
  );
};

// ===== LISTE EMPLOYÉS STYLE SAP =====
const ListeEmployes = ({employes,type,onSelect,onAdd}) => {
  const [search,setSearch] = useState('');
  const [filterStatus,setFilterStatus] = useState('tous');
  const [filterDept,setFilterDept] = useState('tous');
  const [view,setView] = useState('list');
  const isInt = type==='interne';

  const filtered = employes.filter(e=>{
    const ms = !search||`${e.p} ${e.n} ${e.mat} ${e.poste||''} ${e.spec||''}`.toLowerCase().includes(search.toLowerCase());
    const mf = filterStatus==='tous'||e.status===filterStatus;
    const md = filterDept==='tous'||e.dept===filterDept||!e.dept;
    return ms&&mf&&md;
  });

  return (
    <div>
      {/* Toolbar SAP Fiori */}
      <div style={{display:'flex',gap:10,marginBottom:16,alignItems:'center',flexWrap:'wrap',background:SAP.white,padding:'10px 14px',border:`1px solid ${SAP.border}`,borderRadius:4}}>
        <div style={{display:'flex',alignItems:'center',gap:8,flex:1,minWidth:220,background:SAP.gray8,border:`1px solid ${SAP.border}`,borderRadius:4,padding:'6px 10px'}}>
          <I n="search" s={14} c={SAP.muted}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Rechercher ${isInt?'un employé':'un technicien'}...`}
            style={{flex:1,border:'none',outline:'none',fontSize:13,color:SAP.text,background:'transparent',fontFamily:'inherit'}}/>
        </div>
        <div style={{display:'flex',background:SAP.gray8,border:`1px solid ${SAP.border}`,borderRadius:4,padding:2}}>
          {[{v:'tous',l:'Tous'},{v:'actif',l:'Actifs'},{v:'conge',l:'Congés'},{v:'inactif',l:'Inactifs'}].map(s=>(
            <button key={s.v} onClick={()=>setFilterStatus(s.v)} style={{padding:'5px 12px',borderRadius:3,border:'none',background:filterStatus===s.v?SAP.blue:'transparent',color:filterStatus===s.v?'white':SAP.muted,fontWeight:filterStatus===s.v?600:400,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>{s.l}</button>
          ))}
        </div>
        {isInt&&(
          <select value={filterDept} onChange={e=>setFilterDept(e.target.value)} style={{padding:'7px 10px',border:`1px solid ${SAP.border}`,borderRadius:4,fontSize:12,color:SAP.text,background:SAP.white,cursor:'pointer',fontFamily:'inherit'}}>
            <option value="tous">Tous départements</option>
            {DEPTS.map(d=><option key={d} value={d}>{d}</option>)}
          </select>
        )}
        {/* Vue toggle */}
        <div style={{display:'flex',background:SAP.gray8,border:`1px solid ${SAP.border}`,borderRadius:4,padding:2}}>
          {[{v:'list',i:'list'},{v:'grid',i:'grid'}].map(vt=>(
            <button key={vt.v} onClick={()=>setView(vt.v)} style={{width:30,height:30,borderRadius:3,border:'none',background:view===vt.v?SAP.blue:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <I n={vt.i} s={14} c={view===vt.v?'white':SAP.muted}/>
            </button>
          ))}
        </div>
        <div style={{marginLeft:'auto'}}>
          <Btn label={isInt?'+ Nouvel employé':'+ Nouveau technicien'} icon="plus" variant="primary" onClick={onAdd} sm/>
        </div>
      </div>

      <div style={{fontSize:12,color:SAP.muted,marginBottom:10}}>{filtered.length} enregistrement(s)</div>

      {/* VUE GRILLE */}
      {view==='grid'&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:12}}>
          {filtered.map(e=>{
            const ac = getAC(e.p+e.n);
            const anc = e.embauche?Math.floor((Date.now()-new Date(e.embauche))/(365.25*24*3600*1000)):0;
            return (
              <div key={e.id} onClick={()=>onSelect(e)} style={{background:SAP.white,borderRadius:4,border:`1px solid ${SAP.border}`,overflow:'hidden',cursor:'pointer',transition:'all .15s'}}
                onMouseEnter={e2=>{e2.currentTarget.style.borderColor=SAP.blue;e2.currentTarget.style.boxShadow='0 2px 8px rgba(0,112,242,0.1)';}}
                onMouseLeave={e2=>{e2.currentTarget.style.borderColor=SAP.border;e2.currentTarget.style.boxShadow='none';}}>
                {/* Band couleur haut */}
                <div style={{height:5,background:SAP.blue}}/>
                <div style={{padding:'18px 18px 14px'}}>
                  <div style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:14}}>
                    <div style={{width:54,height:54,borderRadius:'50%',background:ac.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700,color:ac.c,flexShrink:0,border:`2px solid ${SAP.white}`,boxShadow:`0 0 0 1.5px ${SAP.border}`}}>
                      {getInitials(e.p,e.n)}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:700,color:SAP.text,marginBottom:2}}>{e.p} {e.n}</div>
                      <div style={{fontSize:11,color:SAP.muted,marginBottom:6,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.poste}</div>
                      <Badge s={e.status}/>
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:5}}>
                    {[
                      {i:'building',v:isInt?e.dept:e.spec},
                      {i:'phone',v:e.tel},
                      {i:'pay',v:isInt?`${anc} an${anc>1?'s':''} · ${e.contrat}`:`${e.nbProjets} projets · ${fmtN(e.taux)} FCFA/j`},
                    ].map(item=>(
                      <div key={item.i} style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:SAP.text2}}>
                        <I n={item.i} s={12} c={SAP.muted}/>
                        <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.v||'—'}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${SAP.border2}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:11,color:SAP.muted,fontFamily:'monospace'}}>{e.mat}</span>
                    <button style={{padding:'4px 10px',border:`1px solid ${SAP.blue}`,borderRadius:4,background:SAP.blue_bg,color:SAP.blue,fontSize:11,cursor:'pointer',fontWeight:500}}>Ouvrir</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VUE LISTE */}
      {view==='list'&&(
        <div style={{background:SAP.white,border:`1px solid ${SAP.border}`,borderRadius:4,overflow:'hidden'}}>
          <Tbl
            cols={isInt
              ? ['Employé','Poste','Département','Contrat','Date embauche','Téléphone','Statut','Actions']
              : ['Technicien','Spécialité','Projets actifs','Taux/jour','Total perçu','Téléphone','Statut','Actions']}
            rows={filtered.map(e=>[
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <Av p={e.p} n={e.n} size={34}/>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:SAP.text}}>{e.p} {e.n}</div>
                  <div style={{fontSize:11,color:SAP.muted,fontFamily:'monospace'}}>{e.mat}</div>
                </div>
              </div>,
              <span style={{fontSize:12,color:SAP.text2}}>{e.poste}</span>,
              isInt
                ? <span style={{padding:'2px 8px',borderRadius:4,background:SAP.blue_bg,color:SAP.blue,fontSize:11,fontWeight:500}}>{e.dept}</span>
                : <span style={{padding:'2px 8px',borderRadius:4,background:SAP.blue_bg,color:SAP.teal,fontSize:11,fontWeight:500}}>{e.spec}</span>,
              isInt
                ? <Badge s={e.contrat?.toLowerCase()||'cdi'}/>
                : <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>{e.projets?.length>0?e.projets.map(p=><span key={p} style={{padding:'1px 6px',borderRadius:3,background:SAP.blue_bg,color:SAP.blue,fontSize:10,fontWeight:600}}>{p}</span>):<span style={{color:SAP.muted,fontSize:12}}>Aucun</span>}</div>,
              isInt
                ? <span style={{fontSize:12,color:SAP.muted}}>{fmtD(e.embauche)}</span>
                : <strong style={{color:SAP.green}}>{fmtN(e.taux)} FCFA</strong>,
              isInt
                ? <span style={{fontSize:12,color:SAP.muted}}>{e.tel}</span>
                : <strong style={{color:SAP.orange}}>{fmtN(e.totalPercu)} FCFA</strong>,
              <Badge s={e.status}/>,
              <div style={{display:'flex',gap:4}}>
                <button onClick={()=>onSelect(e)} style={{padding:'4px 10px',border:`1px solid ${SAP.blue}`,borderRadius:4,background:SAP.blue_bg,color:SAP.blue,cursor:'pointer',fontSize:11,fontWeight:500}}>Ouvrir</button>
                <button style={{width:28,height:28,border:`1px solid ${SAP.border}`,borderRadius:4,background:SAP.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><I n="edit" s={12} c={SAP.muted}/></button>
              </div>
            ])}
            onRow={i=>onSelect(filtered[i])}
            empty="Aucun profil trouvé"
          />
        </div>
      )}
    </div>
  );
};

// ===== POINTAGE =====
const Pointage = ({employes}) => {
  const [date,setDate] = useState('2024-03-15');
  return (
    <div>
      <div style={{display:'flex',gap:10,marginBottom:16,alignItems:'center',background:SAP.white,padding:'10px 14px',border:`1px solid ${SAP.border}`,borderRadius:4}}>
        <I n="calendar" s={16} c={SAP.muted}/>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{border:'none',outline:'none',fontSize:13,color:SAP.text,fontFamily:'inherit',cursor:'pointer'}}/>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <Btn label="Exporter" icon="down" variant="ghost" sm/>
          <Btn label="Saisir pointage" icon="plus" variant="primary" sm/>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
        {[
          {l:'Total',v:employes.length,c:SAP.text},
          {l:'Présents',v:POINTAGES_SEED.filter(p=>p.status==='present').length,c:SAP.green},
          {l:'Absents',v:POINTAGES_SEED.filter(p=>p.status==='absent').length,c:SAP.red},
          {l:'Retards',v:POINTAGES_SEED.filter(p=>p.status==='retard').length,c:SAP.orange},
          {l:'Moy. heures',v:'8.2h',c:SAP.blue},
        ].map(k=>(
          <div key={k.l} style={{background:SAP.white,borderRadius:4,padding:'14px 16px',border:`1px solid ${SAP.border}`,borderTop:`3px solid ${k.c}`}}>
            <div style={{fontSize:11,color:SAP.muted,textTransform:'uppercase',letterSpacing:0.3,marginBottom:4}}>{k.l}</div>
            <div style={{fontSize:22,fontWeight:700,color:k.c}}>{k.v}</div>
          </div>
        ))}
      </div>
      <div style={{background:SAP.white,border:`1px solid ${SAP.border}`,borderRadius:4,overflow:'hidden'}}>
        <div style={{padding:'12px 16px',borderBottom:`1px solid ${SAP.border}`,background:SAP.gray8,fontSize:13,fontWeight:700,color:SAP.text}}>Pointage du {fmtD(date)}</div>
        <Tbl
          cols={['Employé','Département','Arrivée','Départ','Heures travaillées','Statut','Notes']}
          rows={POINTAGES_SEED.map(pt=>{
            const e = employes.find(emp=>emp.id===pt.empId);
            if(!e) return null;
            return [
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <Av p={e.p} n={e.n} size={30}/>
                <div>
                  <div style={{fontSize:13,fontWeight:500}}>{e.p} {e.n}</div>
                  <div style={{fontSize:11,color:SAP.muted}}>{e.mat}</div>
                </div>
              </div>,
              <span style={{fontSize:12,color:SAP.muted}}>{e.dept}</span>,
              <span style={{fontSize:13,fontWeight:600,color:pt.entree?SAP.green:SAP.muted}}>{pt.entree||'—'}</span>,
              <span style={{fontSize:13,color:pt.sortie?SAP.text2:SAP.muted}}>{pt.sortie||'—'}</span>,
              <span style={{fontWeight:600,color:pt.heures>=8?SAP.green:pt.heures>0?SAP.orange:SAP.muted}}>{pt.heures?`${pt.heures}h`:'—'}</span>,
              <Badge s={pt.status}/>,
              <span style={{fontSize:11,color:SAP.muted}}>{pt.note||'—'}</span>,
            ];
          }).filter(Boolean)}
          empty="Aucun pointage"
        />
      </div>
    </div>
  );
};

// ===== CONGÉS =====
const Conges = () => (
  <div>
    <div style={{display:'flex',gap:12,marginBottom:20}}>
      {[
        {l:'En attente',v:CONGES_SEED.filter(c=>c.status==='en_attente').length,c:SAP.orange},
        {l:'Approuvés',v:CONGES_SEED.filter(c=>c.status==='approuve').length,c:SAP.green},
        {l:'Refusés',v:CONGES_SEED.filter(c=>c.status==='refuse').length,c:SAP.red},
      ].map(k=>(
        <div key={k.l} style={{background:SAP.white,borderRadius:4,padding:'14px 18px',border:`1px solid ${SAP.border}`,borderTop:`3px solid ${k.c}`,display:'flex',alignItems:'center',gap:12}}>
          <div style={{fontSize:24,fontWeight:700,color:k.c}}>{k.v}</div>
          <div style={{fontSize:13,color:SAP.muted}}>{k.l}</div>
        </div>
      ))}
      <div style={{marginLeft:'auto'}}>
        <Btn label="Nouvelle demande" icon="plus" variant="primary"/>
      </div>
    </div>
    <div style={{background:SAP.white,border:`1px solid ${SAP.border}`,borderRadius:4,overflow:'hidden'}}>
      <div style={{padding:'12px 16px',borderBottom:`1px solid ${SAP.border}`,background:SAP.gray8,fontSize:13,fontWeight:700,color:SAP.text}}>Demandes de congés</div>
      <Tbl
        cols={['Employé','Type','Date début','Date fin','Durée','Remplaçant','Statut','Actions']}
        rows={CONGES_SEED.map(c=>[
          <span style={{fontWeight:500}}>{c.empNom}</span>,
          <span style={{fontSize:12}}>{c.type}</span>,
          <span style={{fontSize:12,color:SAP.muted}}>{fmtD(c.debut)}</span>,
          <span style={{fontSize:12,color:SAP.muted}}>{fmtD(c.fin)}</span>,
          <span style={{padding:'2px 8px',borderRadius:4,background:SAP.blue_bg,color:SAP.blue,fontSize:12,fontWeight:600}}>{c.jours}j</span>,
          <span style={{fontSize:12,color:SAP.muted}}>{c.remplacant||'—'}</span>,
          <Badge s={c.status}/>,
          <div style={{display:'flex',gap:4}}>
            {c.status==='en_attente'&&<>
              <button style={{padding:'4px 10px',border:`1px solid ${SAP.green}`,borderRadius:4,background:SAP.green_bg,color:SAP.green,cursor:'pointer',fontSize:11,fontWeight:600}}>Approuver</button>
              <button style={{padding:'4px 10px',border:`1px solid ${SAP.red}`,borderRadius:4,background:SAP.red_bg,color:SAP.red,cursor:'pointer',fontSize:11,fontWeight:600}}>Refuser</button>
            </>}
            {c.status!=='en_attente'&&<span style={{fontSize:11,color:SAP.muted}}>par {c.approPar}</span>}
          </div>
        ])}
      />
    </div>
  </div>
);

// ===== PAIE MENSUELLE =====
const PaieMensuelle = ({employes,bulletins,setBulletins}) => {
  const [selB,setSelB] = useState(null);
  const [mois,setMois] = useState('3');
  const [annee,setAnnee] = useState('2024');
  const filtered = bulletins.filter(b=>(!mois||b.mois===Number(mois))&&(!annee||b.annee===Number(annee)));
  const att = filtered.filter(b=>b.status==='en_attente').length;
  const totalNet = filtered.reduce((s,b)=>s+b.net,0);
  const totalBrut = filtered.reduce((s,b)=>s+b.brut,0);

  const valider = id => setBulletins(p=>p.map(b=>b.id===id?{...b,status:'paye',datePai:new Date().toISOString().split('T')[0]}:b));
  const validerTous = () => setBulletins(p=>p.map(b=>filtered.find(f=>f.id===b.id&&b.status==='en_attente')?{...b,status:'paye',datePai:new Date().toISOString().split('T')[0]}:b));

  return (
    <div>
      <div style={{display:'flex',gap:10,marginBottom:16,alignItems:'center',background:SAP.white,padding:'10px 14px',border:`1px solid ${SAP.border}`,borderRadius:4,flexWrap:'wrap'}}>
        <Sel value={mois} onChange={setMois} options={MOIS_SHORT.map((m,i)=>({v:String(i+1),l:m}))}/>
        <Sel value={annee} onChange={setAnnee} options={['2024','2023'].map(y=>({v:y,l:y}))}/>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          {att>0&&<Btn label={`Valider tous (${att})`} icon="check" variant="positive" sm onClick={validerTous}/>}
          <Btn label="Générer la paie" icon="plus" variant="primary" sm/>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
        {[
          {l:'Masse salariale brute',v:`${fmtN(totalBrut)} FCFA`,c:SAP.text},
          {l:'Total net à payer',v:`${fmtN(totalNet)} FCFA`,c:SAP.blue},
          {l:'Bulletins en attente',v:att,c:att>0?SAP.orange:SAP.green},
        ].map(k=>(
          <div key={k.l} style={{background:SAP.white,borderRadius:4,padding:'16px 18px',border:`1px solid ${SAP.border}`,borderTop:`3px solid ${k.c}`}}>
            <div style={{fontSize:11,color:SAP.muted,textTransform:'uppercase',letterSpacing:0.3,marginBottom:6}}>{k.l}</div>
            <div style={{fontSize:typeof k.v==='number'?28:18,fontWeight:700,color:k.c}}>{k.v}</div>
          </div>
        ))}
      </div>

      <div style={{background:SAP.white,border:`1px solid ${SAP.border}`,borderRadius:4,overflow:'hidden'}}>
        <div style={{padding:'12px 16px',borderBottom:`1px solid ${SAP.border}`,background:SAP.gray8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:13,fontWeight:700,color:SAP.text}}>Bulletins — {MOIS[Number(mois)-1]||''} {annee}</span>
        </div>
        <Tbl
          cols={['Employé','Département','Base','Primes','Avantages','Brut','Net à payer','Mode','Statut','Actions']}
          rows={filtered.map(b=>{
            const e = employes.find(emp=>emp.id===b.empId);
            return [
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                {e&&<Av p={e.p} n={e.n} size={30}/>}
                <div>
                  <div style={{fontSize:13,fontWeight:500}}>{e?`${e.p} ${e.n}`:'—'}</div>
                  <div style={{fontSize:11,color:SAP.muted}}>{e?.mat}</div>
                </div>
              </div>,
              <span style={{fontSize:12,color:SAP.muted}}>{e?.dept||'—'}</span>,
              <span style={{fontSize:12}}>{fmtN(b.base)}</span>,
              <span style={{fontSize:12,color:SAP.green}}>{b.primes>0?`+${fmtN(b.primes)}`:'—'}</span>,
              <span style={{fontSize:12,color:SAP.blue}}>{b.avantages>0?`+${fmtN(b.avantages)}`:'—'}</span>,
              <span style={{fontWeight:500}}>{fmtN(b.brut)}</span>,
              <strong style={{color:SAP.blue,fontSize:14}}>{fmtN(b.net)} FCFA</strong>,
              <span style={{fontSize:11,color:SAP.muted}}>{b.mode}</span>,
              <Badge s={b.status}/>,
              <div style={{display:'flex',gap:4}}>
                <button onClick={()=>setSelB(b)} style={{padding:'4px 8px',border:`1px solid ${SAP.blue}`,borderRadius:4,background:SAP.blue_bg,color:SAP.blue,cursor:'pointer',fontSize:11,fontWeight:500}}>Voir</button>
                {b.status==='en_attente'&&<button onClick={()=>valider(b.id)} style={{padding:'4px 8px',border:`1px solid ${SAP.green}`,borderRadius:4,background:SAP.green_bg,color:SAP.green,cursor:'pointer',fontSize:11,fontWeight:500}}>Valider</button>}
                <button style={{width:26,height:26,border:`1px solid ${SAP.border}`,borderRadius:4,background:SAP.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><I n="print" s={11} c={SAP.muted}/></button>
              </div>
            ];
          })}
          empty="Aucun bulletin pour cette période"
        />
      </div>
      {selB&&<BulletinOfficiel b={selB} emp={employes.find(e=>e.id===selB.empId)} onClose={()=>setSelB(null)} onValider={valider}/>}
    </div>
  );
};

// ===== PAIEMENTS EXTERNES =====
const PaiementsExt = ({externes,paiExt,setPaiExt}) => {
  const [showNew,setShowNew] = useState(false);
  const att = paiExt.filter(p=>p.status==='en_attente');
  const totalAtt = att.reduce((s,p)=>s+p.net,0);
  const totalPaye = paiExt.filter(p=>p.status==='paye').reduce((s,p)=>s+p.net,0);
  const valider = id => setPaiExt(p=>p.map(pe=>pe.id===id?{...pe,status:'paye',datePai:new Date().toISOString().split('T')[0],ref:'PAY-EXT-'+Date.now().toString().slice(-6)}:pe));

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
        {[
          {l:'En attente de paiement',v:`${fmtN(totalAtt)} FCFA`,sub:`${att.length} paiements`,c:SAP.orange},
          {l:'Total versé aux techniciens',v:`${fmtN(totalPaye)} FCFA`,sub:'Historique complet',c:SAP.green},
          {l:'Techniciens actifs',v:externes.filter(e=>e.status==='actif').length,sub:'Sur projets',c:SAP.blue},
        ].map(k=>(
          <div key={k.l} style={{background:SAP.white,borderRadius:4,padding:'16px 18px',border:`1px solid ${SAP.border}`,borderTop:`3px solid ${k.c}`}}>
            <div style={{fontSize:11,color:SAP.muted,textTransform:'uppercase',letterSpacing:0.3,marginBottom:6}}>{k.l}</div>
            <div style={{fontSize:16,fontWeight:700,color:k.c}}>{k.v}</div>
            <div style={{fontSize:11,color:SAP.muted,marginTop:2}}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
        <Btn label="Nouveau paiement" icon="plus" variant="primary" onClick={()=>setShowNew(true)}/>
      </div>
      <div style={{background:SAP.white,border:`1px solid ${SAP.border}`,borderRadius:4,overflow:'hidden'}}>
        <div style={{padding:'12px 16px',borderBottom:`1px solid ${SAP.border}`,background:SAP.gray8,fontSize:13,fontWeight:700,color:SAP.text}}>Paiements techniciens externes</div>
        <Tbl
          cols={['Technicien','Projet','Phase','% négocié','Montant net','Mode paiement','Date','Référence','Statut','Actions']}
          rows={paiExt.map(p=>{
            const ext = externes.find(e=>e.id===p.empId);
            return [
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                {ext&&<Av p={ext.p} n={ext.n} size={30}/>}
                <div>
                  <div style={{fontSize:13,fontWeight:500}}>{ext?`${ext.p} ${ext.n}`:'—'}</div>
                  <div style={{fontSize:11,color:SAP.muted}}>{ext?.mat}</div>
                </div>
              </div>,
              <span style={{fontWeight:600,color:SAP.blue,fontSize:12}}>{p.projet}</span>,
              <span style={{fontSize:12,color:SAP.muted}}>{p.phase}</span>,
              <span style={{padding:'2px 8px',borderRadius:4,background:SAP.green_bg,color:SAP.green,fontSize:12,fontWeight:600}}>{p.pct}%</span>,
              <strong style={{color:SAP.orange,fontSize:14}}>{fmtN(p.net)} FCFA</strong>,
              <span style={{fontSize:12,color:SAP.muted}}>{p.mode}</span>,
              <span style={{fontSize:12,color:SAP.muted}}>{p.datePai?fmtD(p.datePai):'—'}</span>,
              <span style={{fontSize:11,fontFamily:'monospace',color:SAP.muted}}>{p.ref||'—'}</span>,
              <Badge s={p.status}/>,
              <div style={{display:'flex',gap:4}}>
                {p.status==='en_attente'&&<button onClick={()=>valider(p.id)} style={{padding:'5px 12px',border:`1px solid ${SAP.green}`,borderRadius:4,background:SAP.green,color:'white',cursor:'pointer',fontSize:11,fontWeight:600}}>Payer</button>}
                <button style={{width:26,height:26,border:`1px solid ${SAP.border}`,borderRadius:4,background:SAP.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><I n="print" s={11} c={SAP.muted}/></button>
              </div>
            ];
          })}
          empty="Aucun paiement enregistré"
        />
      </div>
      {showNew&&<FormPaiExt externes={externes} onClose={()=>setShowNew(false)} onSave={p=>setPaiExt(prev=>[p,...prev])}/>}
    </div>
  );
};

// ===== NAVIGATION TABS =====
const NAV = [
  {id:'dashboard',l:'Tableau de bord',i:'home'},
  {id:'internes',l:'Employés internes',i:'people'},
  {id:'externes',l:'Techniciens externes',i:'person'},
  {id:'conges',l:'Congés & Absences',i:'calendar'},
  {id:'pointage',l:'Pointage & Présence',i:'clock'},
  {id:'paie',l:'Bulletins de paie',i:'doc'},
  {id:'paiements_ext',l:'Paiements externes',i:'pay'},
];

// ===== COMPOSANT PRINCIPAL =====
export default function RH() {
  const [tab,setTab] = useState('dashboard');
  const [employes,setEmployes] = useState(EMPLOYES);
  const [externes,setExternes] = useState(EXTERNES);
  const [bulletins,setBulletins] = useState(BULLETINS_SEED);
  const [paiExt,setPaiExt] = useState(PAIEMENTS_EXT_SEED);
  const [selEmp,setSelEmp] = useState(null);
  const [selType,setSelType] = useState(null);
  const [showAddInt,setShowAddInt] = useState(false);
  const [showAddExt,setShowAddExt] = useState(false);

  const bAtt = bulletins.filter(b=>b.status==='en_attente').length;
  const pAtt = paiExt.filter(p=>p.status==='en_attente').length;

  return (
    <div style={{minHeight:'100vh',background:SAP.bg,fontFamily:"'Segoe UI',Arial,sans-serif"}}>

      {/* SHELL SAP FIORI — Header */}
      <div style={{background:SAP.sidebar,height:44,display:'flex',alignItems:'center',padding:'0 20px',gap:16,position:'sticky',top:0,zIndex:200}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginRight:20}}>
          <div style={{width:28,height:28,background:SAP.blue,borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center'}}><I n="people" s={16} c="white"/></div>
          <span style={{fontSize:14,fontWeight:700,color:'white',letterSpacing:0.3}}>CLEAN<span style={{color:'#4da6ff'}}>IT</span> — People & HR</span>
        </div>
        <div style={{flex:1}}/>
        <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(255,255,255,0.1)',borderRadius:4,padding:'5px 10px'}}>
          <I n="search" s={13} c="rgba(255,255,255,0.6)"/>
          <input placeholder="Rechercher..." style={{background:'transparent',border:'none',outline:'none',color:'white',fontSize:12,width:140,fontFamily:'inherit'}}/>
        </div>
        <div style={{width:28,height:28,background:'rgba(255,255,255,0.1)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}><I n="settings" s={14} c="rgba(255,255,255,0.7)"/></div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:30,height:30,borderRadius:'50%',background:SAP.blue,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'white'}}>AB</div>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:'white'}}>Aline Biya</div>
            <div style={{fontSize:9,color:'rgba(255,255,255,0.5)'}}>RH Manager</div>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div style={{background:SAP.white,borderBottom:`1px solid ${SAP.border}`,padding:'0 20px',display:'flex',gap:0,position:'sticky',top:44,zIndex:100}}>
        {NAV.map(t=>{
          const hasAlert = (t.id==='paie'&&bAtt>0)||(t.id==='paiements_ext'&&pAtt>0);
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              display:'flex',alignItems:'center',gap:7,
              padding:'12px 18px',border:'none',
              borderBottom:`2px solid ${tab===t.id?SAP.blue:'transparent'}`,
              background:'transparent',
              color:tab===t.id?SAP.blue:SAP.gray3,
              fontWeight:tab===t.id?700:400,
              fontSize:13,cursor:'pointer',
              whiteSpace:'nowrap',fontFamily:'inherit',
              transition:'all .12s',position:'relative',
            }}>
              <I n={t.i} s={14} c={tab===t.id?SAP.blue:SAP.gray3}/>
              {t.l}
              {hasAlert&&<span style={{position:'absolute',top:6,right:4,width:7,height:7,borderRadius:'50%',background:SAP.orange,border:'2px solid white'}}/>}
            </button>
          );
        })}
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8,padding:'8px 0'}}>
          {tab==='internes'&&<Btn label="+ Nouvel employé" icon="plus" variant="primary" sm onClick={()=>setShowAddInt(true)}/>}
          {tab==='externes'&&<Btn label="+ Nouveau technicien" icon="plus" variant="primary" sm onClick={()=>setShowAddExt(true)}/>}
          {tab==='paie'&&<Btn label="Générer la paie" icon="doc" variant="secondary" sm/>}
          {tab==='paiements_ext'&&<Btn label="Nouveau paiement" icon="plus" variant="primary" sm/>}
        </div>
      </div>

      {/* CONTENU */}
      <div style={{maxWidth:1440,margin:'0 auto',padding:'20px 24px'}}>
        {tab==='dashboard'&&<Dashboard employes={employes} externes={externes} bulletins={bulletins} paiExt={paiExt} setTab={setTab}/>}
        {tab==='internes'&&<ListeEmployes employes={employes} type="interne" onSelect={e=>{setSelEmp(e);setSelType('interne');}} onAdd={()=>setShowAddInt(true)}/>}
        {tab==='externes'&&<ListeEmployes employes={externes} type="externe" onSelect={e=>{setSelEmp(e);setSelType('externe');}} onAdd={()=>setShowAddExt(true)}/>}
        {tab==='conges'&&<Conges/>}
        {tab==='pointage'&&<Pointage employes={employes}/>}
        {tab==='paie'&&<PaieMensuelle employes={employes} bulletins={bulletins} setBulletins={setBulletins}/>}
        {tab==='paiements_ext'&&<PaiementsExt externes={externes} paiExt={paiExt} setPaiExt={setPaiExt}/>}
      </div>

      {/* PANELS & MODALS */}
      {selEmp&&(
        <ProfilSAP
          emp={selEmp}
          onClose={()=>setSelEmp(null)}
          bulletins={bulletins}
          estExt={selType==='externe'}
        />
      )}
      {showAddInt&&<FormEmploye type="interne" onClose={()=>setShowAddInt(false)} onSave={e=>setEmployes(p=>[e,...p])}/>}
      {showAddExt&&<FormEmploye type="externe" onClose={()=>setShowAddExt(false)} onSave={e=>setExternes(p=>[e,...p])}/>}
    </div>
  );
}
