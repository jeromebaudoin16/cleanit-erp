
// ===== CLEANIT RH DESIGN SYSTEM =====
// Inspiré de SAP SuccessFactors, Workday, BambooHR

export const R = {
  // Palette principale
  navy:     '#0f2b4c',
  navy2:    '#1a3f6f',
  navy3:    '#e8f0fb',
  blue:     '#1565c0',
  blue2:    '#1976d2',
  blue3:    '#e3f0ff',
  teal:     '#00796b',
  teal2:    '#e0f2f0',
  purple:   '#6a1b9a',
  purple2:  '#f3e5f5',
  green:    '#2e7d32',
  green2:   '#e8f5e9',
  orange:   '#e65100',
  orange2:  '#fff3e0',
  red:      '#c62828',
  red2:     '#ffebee',
  amber:    '#f57f17',
  amber2:   '#fffde7',
  gray1:    '#f5f6f8',
  gray2:    '#eceff1',
  gray3:    '#cfd8dc',
  gray4:    '#90a4ae',
  gray5:    '#546e7a',
  gray6:    '#37474f',
  text:     '#1a2332',
  text2:    '#3d5166',
  muted:    '#607d8b',
  light:    '#90a4ae',
  border:   '#dde3ea',
  border2:  '#edf0f4',
  bg:       '#f0f3f7',
  white:    '#ffffff',
};

// Couleurs avatar par département
export const DEPT_COLORS = {
  'Direction':       {bg:'#e8f0fb', color:'#1565c0', border:'#1565c0'},
  'Technique':       {bg:'#e0f2f0', color:'#00796b', border:'#00796b'},
  'Finance':         {bg:'#e8f5e9', color:'#2e7d32', border:'#2e7d32'},
  'RH':              {bg:'#f3e5f5', color:'#6a1b9a', border:'#6a1b9a'},
  'Commercial':      {bg:'#fff3e0', color:'#e65100', border:'#e65100'},
  'Juridique':       {bg:'#ffebee', color:'#c62828', border:'#c62828'},
  'Logistique':      {bg:'#fffde7', color:'#f57f17', border:'#f57f17'},
  'Projet':          {bg:'#e3f2fd', color:'#0277bd', border:'#0277bd'},
  'IT':              {bg:'#f3e5f5', color:'#4527a0', border:'#4527a0'},
};

// Icônes SVG RH
export const Icon = ({n, s=18, c='currentColor'}) => {
  const paths = {
    home: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
    users: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
    user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z',
    user_ext: 'M16 11a4 4 0 100-8 4 4 0 000 8z M8 21v-2a4 4 0 014-4h8a4 4 0 014 4v2',
    payslip: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    clock: 'M12 22a10 10 0 100-20 10 10 0 000 20z M12 6v6l4 2',
    calendar: 'M8 2v4 M16 2v4 M3 10h18 M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z',
    chart: 'M18 20V10 M12 20V4 M6 20v-6',
    salary: 'M12 1v22 M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6',
    org: 'M12 3h9v5h-9z M3 16h9v5H3z M15 16h9v5h-9z M12 8v5 M7.5 16v-3h9v3',
    doc: 'M9 12h6 M9 16h6 M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z M13 2v7h7',
    search: 'M21 21l-4.35-4.35 M17 11A6 6 0 115 11a6 6 0 0112 0z',
    plus: 'M12 5v14 M5 12h14',
    close: 'M18 6L6 18 M6 6l12 12',
    check: 'M20 6L9 17l-5-5',
    edit: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
    eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12m-3 0a3 3 0 106 0 3 3 0 00-6 0',
    download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3',
    upload: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
    phone: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.15 1.18 2 2 0 012.11 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.41 7a16 16 0 006.59 6.59l.95-.95a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z',
    mail: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
    location: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10m-3 0a3 3 0 106 0 3 3 0 00-6 0',
    star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    award: 'M12 15a7 7 0 100-14 7 7 0 000 14z M8.21 13.89L7 23l5-3 5 3-1.21-9.12',
    alert: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01',
    filter: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
    print: 'M6 9V2h12v7 M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2 M6 14h12v8H6z',
    chevron_r: 'M9 18l6-6-6-6',
    chevron_d: 'M6 9l6 6 6-6',
    lock: 'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4',
    briefcase: 'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2',
    trending: 'M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6',
    more: 'M12 13a1 1 0 100-2 1 1 0 000 2z M19 13a1 1 0 100-2 1 1 0 000 2z M5 13a1 1 0 100-2 1 1 0 000 2z',
    link: 'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71',
  };
  const d = paths[n];
  if (!d) return null;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {d.split(' M ').map((seg,i)=><path key={i} d={i===0?seg:`M ${seg}`}/>)}
    </svg>
  );
};

// Avatar employé
export const Avatar = ({prenom, nom, photo, dept, size=40}) => {
  const initials = `${prenom?.[0]||'?'}${nom?.[0]||'?'}`.toUpperCase();
  const dc = DEPT_COLORS[dept] || {bg:'#e8f0fb', color:'#1565c0'};
  if (photo) return (
    <img src={photo} alt={`${prenom} ${nom}`}
      style={{width:size,height:size,borderRadius:'50%',objectFit:'cover',border:`2px solid ${dc.border}`,flexShrink:0}}/>
  );
  return (
    <div style={{width:size,height:size,borderRadius:'50%',background:dc.bg,border:`2px solid ${dc.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.32,fontWeight:600,color:dc.color,flexShrink:0,letterSpacing:0.5,userSelect:'none'}}>
      {initials}
    </div>
  );
};

// Badge statut RH
export const RHBadge = ({status}) => {
  const cfg = {
    actif:       {l:'Actif',         c:'#2e7d32', bg:'#e8f5e9'},
    inactif:     {l:'Inactif',       c:'#546e7a', bg:'#eceff1'},
    conge:       {l:'En congé',      c:'#e65100', bg:'#fff3e0'},
    maladie:     {l:'Arrêt maladie', c:'#c62828', bg:'#ffebee'},
    essai:       {l:'Période essai', c:'#0277bd', bg:'#e3f2fd'},
    paye:        {l:'Payé',          c:'#2e7d32', bg:'#e8f5e9'},
    en_attente:  {l:'En attente',    c:'#f57f17', bg:'#fffde7'},
    valide:      {l:'Validé',        c:'#1565c0', bg:'#e8f0fb'},
    rejete:      {l:'Rejeté',        c:'#c62828', bg:'#ffebee'},
    interne:     {l:'Interne',       c:'#1565c0', bg:'#e8f0fb'},
    externe:     {l:'Externe',       c:'#6a1b9a', bg:'#f3e5f5'},
    present:     {l:'Présent',       c:'#2e7d32', bg:'#e8f5e9'},
    absent:      {l:'Absent',        c:'#c62828', bg:'#ffebee'},
    retard:      {l:'Retard',        c:'#e65100', bg:'#fff3e0'},
  }[status] || {l:status, c:'#546e7a', bg:'#eceff1'};
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',borderRadius:20,background:cfg.bg,color:cfg.c,fontSize:11,fontWeight:600,whiteSpace:'nowrap'}}>
      <span style={{width:5,height:5,borderRadius:'50%',background:cfg.c,flexShrink:0}}/>
      {cfg.l}
    </span>
  );
};

// Bouton RH
export const RHBtn = ({label, onClick, primary, danger, ghost, disabled, sm, icon, full}) => {
  const bg = disabled?'#e0e0e0':primary?R.blue:danger?R.red:'transparent';
  const color = disabled?R.light:primary||danger?'white':ghost?R.blue2:R.blue2;
  const border = disabled?R.border:primary?'none':danger?`1px solid ${R.red}`:ghost?`1px solid ${R.blue}`:'none';
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6,
      padding:sm?'6px 12px':'9px 20px',width:full?'100%':'auto',
      borderRadius:6,border,background:bg,color,
      fontWeight:600,fontSize:sm?12:13,cursor:disabled?'not-allowed':'pointer',
      fontFamily:'inherit',transition:'all .15s',whiteSpace:'nowrap',
      boxShadow:primary&&!disabled?'0 2px 6px rgba(21,101,192,0.25)':'none',
    }}
    onMouseEnter={e=>{if(!disabled&&!primary&&!danger)e.currentTarget.style.background=R.blue3}}
    onMouseLeave={e=>{if(!disabled&&!primary&&!danger)e.currentTarget.style.background='transparent'}}>
      {icon&&<Icon n={icon} s={14} c={disabled?R.light:primary||danger?'white':R.blue2}/>}
      {label}
    </button>
  );
};

// Champ formulaire
export const RHField = ({label, required, children, hint, col1}) => (
  <div style={{gridColumn:col1?'1/-1':'auto'}}>
    <label style={{display:'block',fontSize:12,fontWeight:600,color:R.text2,marginBottom:6,textTransform:'uppercase',letterSpacing:0.4}}>
      {label}{required&&<span style={{color:R.red,marginLeft:3}}>*</span>}
    </label>
    {children}
    {hint&&<div style={{fontSize:11,color:R.muted,marginTop:3}}>{hint}</div>}
  </div>
);

export const RHInput = ({type='text',value,onChange,placeholder,disabled,small}) => (
  <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} disabled={disabled}
    style={{width:'100%',padding:small?'7px 10px':'10px 12px',borderRadius:6,border:`1.5px solid ${R.border}`,fontSize:13,color:R.text,background:disabled?R.gray1:R.white,boxSizing:'border-box',outline:'none',fontFamily:'inherit',transition:'border-color .15s'}}
    onFocus={e=>e.target.style.borderColor=R.blue} onBlur={e=>e.target.style.borderColor=R.border}/>
);

export const RHSelect = ({value,onChange,options,placeholder,disabled}) => (
  <select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
    style={{width:'100%',padding:'10px 12px',borderRadius:6,border:`1.5px solid ${R.border}`,fontSize:13,color:value?R.text:R.light,background:disabled?R.gray1:R.white,cursor:'pointer',outline:'none',fontFamily:'inherit'}}
    onFocus={e=>e.target.style.borderColor=R.blue} onBlur={e=>e.target.style.borderColor=R.border}>
    <option value="">{placeholder||'Sélectionner...'}</option>
    {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
  </select>
);

export const RHTextarea = ({value,onChange,placeholder,rows=4}) => (
  <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} rows={rows}
    style={{width:'100%',padding:'10px 12px',borderRadius:6,border:`1.5px solid ${R.border}`,fontSize:13,color:R.text,background:R.white,resize:'vertical',boxSizing:'border-box',outline:'none',fontFamily:'inherit'}}
    onFocus={e=>e.target.style.borderColor=R.blue} onBlur={e=>e.target.style.borderColor=R.border}/>
);

// Panel latéral pleine hauteur
export const RHPanel = ({title, subtitle, onClose, children, width=780, color}) => (
  <div style={{position:'fixed',inset:0,zIndex:300,display:'flex',justifyContent:'flex-end'}}>
    <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(10,20,40,0.5)',backdropFilter:'blur(2px)'}}/>
    <div style={{position:'relative',width,maxWidth:'96vw',height:'100vh',background:R.white,display:'flex',flexDirection:'column',boxShadow:'-8px 0 32px rgba(0,0,0,0.15)'}}>
      <div style={{padding:'18px 24px',background:color||R.navy,display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
        <div>
          {subtitle&&<div style={{fontSize:11,color:'rgba(255,255,255,0.6)',textTransform:'uppercase',letterSpacing:0.8,marginBottom:3}}>{subtitle}</div>}
          <h2 style={{margin:0,fontSize:18,fontWeight:700,color:'white'}}>{title}</h2>
        </div>
        <button onClick={onClose} style={{width:34,height:34,borderRadius:8,border:'1px solid rgba(255,255,255,0.25)',background:'rgba(255,255,255,0.1)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Icon n="close" s={16} c="white"/>
        </button>
      </div>
      <div style={{flex:1,overflow:'auto'}}>{children}</div>
    </div>
  </div>
);

// Modal centré
export const RHModal = ({title, onClose, children, width=600}) => (
  <div style={{position:'fixed',inset:0,zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
    <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(10,20,40,0.5)',backdropFilter:'blur(2px)'}}/>
    <div style={{position:'relative',width:'100%',maxWidth:width,maxHeight:'90vh',overflow:'auto',background:R.white,borderRadius:12,boxShadow:'0 20px 60px rgba(0,0,0,0.25)'}}>
      <div style={{padding:'18px 24px',background:R.navy,display:'flex',justifyContent:'space-between',alignItems:'center',borderRadius:'12px 12px 0 0'}}>
        <h2 style={{margin:0,fontSize:17,fontWeight:700,color:'white'}}>{title}</h2>
        <button onClick={onClose} style={{width:32,height:32,borderRadius:6,border:'1px solid rgba(255,255,255,0.25)',background:'rgba(255,255,255,0.1)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Icon n="close" s={16} c="white"/></button>
      </div>
      <div style={{padding:'24px'}}>{children}</div>
    </div>
  </div>
);

// Section card
export const RHCard = ({title, action, actionLabel, actionIcon, children, noPad}) => (
  <div style={{background:R.white,borderRadius:10,border:`1px solid ${R.border}`,overflow:'hidden',marginBottom:16}}>
    {title&&(
      <div style={{padding:'14px 20px',borderBottom:`1px solid ${R.border2}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:14,fontWeight:700,color:R.text}}>{title}</span>
        {action&&<RHBtn label={actionLabel||'Voir tout'} onClick={action} icon={actionIcon} ghost sm/>}
      </div>
    )}
    <div style={noPad?{}:{padding:'16px 20px'}}>{children}</div>
  </div>
);

// Tableau RH
export const RHTable = ({cols, rows, onRowClick, empty='Aucune donnée'}) => (
  <div style={{border:`1px solid ${R.border}`,borderRadius:8,overflow:'hidden',background:R.white}}>
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',minWidth:500}}>
        <thead>
          <tr style={{background:R.gray1,borderBottom:`2px solid ${R.border}`}}>
            {cols.map(col=>(
              <th key={col} style={{padding:'10px 16px',textAlign:'left',fontSize:11,fontWeight:700,color:R.muted,textTransform:'uppercase',letterSpacing:0.5,whiteSpace:'nowrap'}}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length===0&&(
            <tr><td colSpan={cols.length} style={{padding:'48px 16px',textAlign:'center',color:R.light,fontSize:14}}>{empty}</td></tr>
          )}
          {rows.map((row,i)=>(
            <tr key={i} onClick={()=>onRowClick&&onRowClick(i)}
              style={{borderBottom:`1px solid ${R.border2}`,background:i%2===0?R.white:'#fafbfc',cursor:onRowClick?'pointer':'default',transition:'background .1s'}}
              onMouseEnter={e=>{if(onRowClick)e.currentTarget.style.background=R.blue3}}
              onMouseLeave={e=>{if(onRowClick)e.currentTarget.style.background=i%2===0?R.white:'#fafbfc'}}>
              {row.map((cell,j)=>(
                <td key={j} style={{padding:'12px 16px',fontSize:13,color:R.text,verticalAlign:'middle'}}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// KPI Card
export const RHKpi = ({label, value, sub, color, icon, trend, onClick}) => (
  <div onClick={onClick} style={{background:R.white,borderRadius:10,padding:'18px 20px',border:`1px solid ${R.border}`,flex:1,minWidth:160,cursor:onClick?'pointer':'default',transition:'all .15s',position:'relative',overflow:'hidden'}}
    onMouseEnter={e=>{if(onClick){e.currentTarget.style.borderColor=color||R.blue;e.currentTarget.style.boxShadow=`0 4px 16px ${color||R.blue}20`}}}
    onMouseLeave={e=>{if(onClick){e.currentTarget.style.borderColor=R.border;e.currentTarget.style.boxShadow='none'}}}>
    <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:color||R.blue,borderRadius:'10px 10px 0 0'}}/>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
      <div style={{fontSize:11,fontWeight:700,color:R.muted,textTransform:'uppercase',letterSpacing:0.5}}>{label}</div>
      {icon&&<div style={{width:34,height:34,borderRadius:8,background:`${color||R.blue}15`,display:'flex',alignItems:'center',justifyContent:'center'}}><Icon n={icon} s={16} c={color||R.blue}/></div>}
    </div>
    <div style={{fontSize:26,fontWeight:700,color:color||R.text,marginBottom:4,lineHeight:1}}>{value}</div>
    {sub&&<div style={{fontSize:12,color:R.muted}}>{sub}</div>}
    {trend!==undefined&&(
      <div style={{marginTop:8,display:'inline-flex',alignItems:'center',gap:4,padding:'2px 8px',borderRadius:20,background:trend>=0?R.green2:R.red2}}>
        <span style={{fontSize:11,color:trend>=0?R.green:R.red,fontWeight:700}}>{trend>=0?'↑':'↓'} {Math.abs(trend)}%</span>
        <span style={{fontSize:10,color:R.muted}}>vs mois dernier</span>
      </div>
    )}
  </div>
);

export const fmtN = n => new Intl.NumberFormat('fr-FR').format(Math.round(n||0));
export const fmtD = d => d ? new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}) : '—';
export const fmtDT = d => d ? new Date(d).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) : '—';
export const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
export const MOIS_COURTS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
