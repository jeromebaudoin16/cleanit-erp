// ===== DESIGN SYSTEM QUICKBOOKS =====
// Couleurs, composants et styles inspirés de QuickBooks Online

export const QB = {
  // Couleurs principales QuickBooks
  green:    '#2ca01c',
  green2:   '#1a7a0e',
  green3:   '#e8f5e5',
  green4:   '#f0faf0',
  blue:     '#0077c5',
  blue2:    '#005999',
  blue3:    '#e5f2fb',
  // Neutres
  bg:       '#f4f5f7',
  white:    '#ffffff',
  border:   '#d4d7dc',
  border2:  '#e8eaed',
  text:     '#1a1a1a',
  text2:    '#393a3d',
  muted:    '#6b6c72',
  light:    '#b0b3b8',
  // Statuts
  paid:     '#2ca01c',
  paidBg:   '#e8f5e5',
  due:      '#d52b1e',
  dueBg:    '#fde8e7',
  pending:  '#ad6800',
  pendingBg:'#fff3cd',
  draft:    '#6b6c72',
  draftBg:  '#f4f5f7',
  // Sidebar
  sidebar:  '#2d6a4f',
  sidebar2: '#1b4332',
  sidebarT: 'rgba(255,255,255,0.75)',
  sidebarA: '#ffffff',
};

// Badge statut style QuickBooks
export const QBBadge = ({ status, label }) => {
  const configs = {
    paye:       { l:'Payée',      c:'#2ca01c', bg:'#e8f5e5', border:'#a3d9a5' },
    envoye:     { l:'Envoyée',    c:'#0077c5', bg:'#e5f2fb', border:'#90c8f0' },
    en_retard:  { l:'En retard',  c:'#d52b1e', bg:'#fde8e7', border:'#f5a9a4' },
    partiel:    { l:'Partiel',    c:'#ad6800', bg:'#fff3cd', border:'#ffc107' },
    brouillon:  { l:'Brouillon',  c:'#6b6c72', bg:'#f4f5f7', border:'#d4d7dc' },
    annule:     { l:'Annulée',    c:'#6b6c72', bg:'#f4f5f7', border:'#d4d7dc' },
    en_attente: { l:'En attente', c:'#ad6800', bg:'#fff3cd', border:'#ffc107' },
    paye_dep:   { l:'Payée',      c:'#2ca01c', bg:'#e8f5e5', border:'#a3d9a5' },
    rejete:     { l:'Rejeté',     c:'#d52b1e', bg:'#fde8e7', border:'#f5a9a4' },
  };
  const cfg = configs[status] || configs.brouillon;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:3, background:cfg.bg, color:cfg.c, fontSize:12, fontWeight:600, border:`1px solid ${cfg.border}`, whiteSpace:'nowrap' }}>
      {label || cfg.l}
    </span>
  );
};

// Bouton style QuickBooks
export const QBBtn = ({ label, onClick, primary, ghost, danger, small, disabled, icon }) => {
  const bg = disabled?'#e8eaed':danger?'#d52b1e':primary?'#2ca01c':'white';
  const color = disabled?'#b0b3b8':danger||primary?'white':'#0077c5';
  const border = disabled?'#d4d7dc':danger?'#d52b1e':primary?'#2ca01c':'#0077c5';
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding:small?'5px 12px':'8px 16px', borderRadius:4, border:`1px solid ${border}`, background:bg, color, fontWeight:600, fontSize:small?12:13, cursor:disabled?'not-allowed':'pointer', display:'inline-flex', alignItems:'center', gap:6, fontFamily:'inherit', transition:'all .15s', whiteSpace:'nowrap' }}
      onMouseEnter={e=>{ if(!disabled){ e.currentTarget.style.background=primary?'#1a7a0e':danger?'#b52316':ghost?'#e5f2fb':'#f4f5f7'; } }}
      onMouseLeave={e=>{ if(!disabled){ e.currentTarget.style.background=bg; } }}>
      {icon&&<span style={{fontSize:small?12:14}}>{icon}</span>}
      {label}
    </button>
  );
};

// Input style QuickBooks
export const QBInput = ({ type='text', value, onChange, placeholder, min, prefix, suffix }) => (
  <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
    {prefix&&<span style={{ position:'absolute', left:10, fontSize:13, color:'#6b6c72', zIndex:1 }}>{prefix}</span>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} min={min}
      style={{ width:'100%', padding:`9px ${suffix?'32px':'10px'} 9px ${prefix?'26px':'10px'}`, borderRadius:4, border:'1px solid #d4d7dc', fontSize:13, color:'#1a1a1a', background:'white', outline:'none', boxSizing:'border-box', fontFamily:'inherit', transition:'border-color .15s' }}
      onFocus={e=>e.target.style.borderColor='#0077c5'}
      onBlur={e=>e.target.style.borderColor='#d4d7dc'}/>
    {suffix&&<span style={{ position:'absolute', right:10, fontSize:13, color:'#6b6c72' }}>{suffix}</span>}
  </div>
);

// Select style QuickBooks
export const QBSelect = ({ value, onChange, options, placeholder }) => (
  <select value={value} onChange={e=>onChange(e.target.value)}
    style={{ width:'100%', padding:'9px 10px', borderRadius:4, border:'1px solid #d4d7dc', fontSize:13, color:value?'#1a1a1a':'#6b6c72', background:'white', cursor:'pointer', outline:'none', fontFamily:'inherit' }}
    onFocus={e=>e.target.style.borderColor='#0077c5'}
    onBlur={e=>e.target.style.borderColor='#d4d7dc'}>
    <option value="">{placeholder||'Sélectionner...'}</option>
    {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
  </select>
);

// Textarea style QuickBooks
export const QBTextarea = ({ value, onChange, placeholder, rows=3 }) => (
  <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} rows={rows}
    style={{ width:'100%', padding:'9px 10px', borderRadius:4, border:'1px solid #d4d7dc', fontSize:13, color:'#1a1a1a', background:'white', outline:'none', resize:'vertical', boxSizing:'border-box', fontFamily:'inherit', transition:'border-color .15s' }}
    onFocus={e=>e.target.style.borderColor='#0077c5'}
    onBlur={e=>e.target.style.borderColor='#d4d7dc'}/>
);

// Label field
export const QBField = ({ label, required, children, hint, col }) => (
  <div style={{ gridColumn:col||'auto' }}>
    <label style={{ fontSize:12, fontWeight:600, color:'#393a3d', display:'block', marginBottom:5 }}>
      {label}{required&&<span style={{ color:'#d52b1e', marginLeft:2 }}>*</span>}
    </label>
    {children}
    {hint&&<div style={{ fontSize:11, color:'#6b6c72', marginTop:3 }}>{hint}</div>}
  </div>
);

// Table header cell
export const QBTh = ({ children, right, width }) => (
  <th style={{ padding:'10px 14px', textAlign:right?'right':'left', fontSize:11, fontWeight:700, color:'#6b6c72', textTransform:'uppercase', letterSpacing:0.5, background:'#f4f5f7', borderBottom:'2px solid #d4d7dc', whiteSpace:'nowrap', width:width||'auto' }}>
    {children}
  </th>
);

// Table data cell
export const QBTd = ({ children, right, style, onClick, bold, muted }) => (
  <td onClick={onClick} style={{ padding:'11px 14px', textAlign:right?'right':'left', fontSize:13, color:muted?'#6b6c72':'#1a1a1a', fontWeight:bold?700:400, verticalAlign:'middle', cursor:onClick?'pointer':'default', ...style }}>
    {children}
  </td>
);

// KPI Card style QuickBooks
export const QBKpiCard = ({ title, value, sub, color, icon, trend, onClick }) => (
  <div onClick={onClick} style={{ background:'white', borderRadius:6, padding:'18px 20px', border:'1px solid #d4d7dc', cursor:onClick?'pointer':'default', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', flex:1, minWidth:160, transition:'all .15s', borderTop:`3px solid ${color}` }}
    onMouseEnter={e=>{ if(onClick){ e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.12)'; e.currentTarget.style.transform='translateY(-1px)'; } }}
    onMouseLeave={e=>{ if(onClick){ e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.transform='translateY(0)'; } }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
      <span style={{ fontSize:12, fontWeight:600, color:'#6b6c72', textTransform:'uppercase', letterSpacing:0.3 }}>{title}</span>
      {icon&&<span style={{ fontSize:20, opacity:0.7 }}>{icon}</span>}
    </div>
    <div style={{ fontSize:24, fontWeight:700, color, letterSpacing:-0.5, marginBottom:4 }}>{value}</div>
    {sub&&<div style={{ fontSize:12, color:'#6b6c72' }}>{sub}</div>}
    {trend!==undefined&&(
      <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:6 }}>
        <span style={{ fontSize:11, color:trend>=0?'#2ca01c':'#d52b1e', fontWeight:600 }}>{trend>=0?'▲':'▼'} {Math.abs(trend)}% vs mois dernier</span>
      </div>
    )}
  </div>
);

// Section title
export const QBSection = ({ title, action, actionLabel, children }) => (
  <div style={{ marginBottom:24 }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
      <h3 style={{ fontSize:14, fontWeight:700, color:'#1a1a1a', margin:0 }}>{title}</h3>
      {action&&<button onClick={action} style={{ fontSize:12, fontWeight:600, color:'#0077c5', background:'none', border:'none', cursor:'pointer', padding:0 }}>{actionLabel||'Voir tout →'}</button>}
    </div>
    {children}
  </div>
);

// Barre progress QuickBooks
export const QBProgress = ({ value, color, height=6, label }) => (
  <div>
    {label&&<div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
      <span style={{ fontSize:11, color:'#6b6c72' }}>{label}</span>
      <span style={{ fontSize:11, fontWeight:700, color }}>{value}%</span>
    </div>}
    <div style={{ height, background:'#e8eaed', borderRadius:3, overflow:'hidden' }}>
      <div style={{ width:`${value}%`, height:'100%', background:color||'#2ca01c', borderRadius:3, transition:'width .4s' }}/>
    </div>
  </div>
);
