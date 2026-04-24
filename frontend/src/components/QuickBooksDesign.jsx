// ===== DESIGN SYSTEM QUICKBOOKS =====
export const QB = {
  // Couleurs principales QuickBooks
  green:    '#2CA01C',
  green2:   '#1a7a0e',
  green3:   '#e8f5e2',
  green4:   '#f0faf0',
  teal:     '#0077C5',
  teal2:    '#005ea3',
  teal3:    '#e5f1fb',
  // Neutres
  bg:       '#f4f5f7',
  white:    '#ffffff',
  border:   '#d4d7dc',
  border2:  '#e8eaed',
  text:     '#1a1a1a',
  text2:    '#4a4a4a',
  muted:    '#767676',
  light:    '#b3b3b3',
  // Statuts
  red:      '#d52b1e',
  red2:     '#fdecea',
  orange:   '#e27000',
  orange2:  '#fff3e0',
  yellow:   '#f5a623',
  yellow2:  '#fffbf0',
  blue:     '#0077C5',
  blue2:    '#e5f1fb',
  purple:   '#6b4fbb',
  purple2:  '#f0ebff',
};

export const STATUS = {
  paye:       { label:'Payée',      color:'#2CA01C', bg:'#e8f5e2' },
  envoye:     { label:'Envoyée',    color:'#0077C5', bg:'#e5f1fb' },
  en_retard:  { label:'En retard',  color:'#d52b1e', bg:'#fdecea' },
  partiel:    { label:'Partiel',    color:'#e27000', bg:'#fff3e0' },
  brouillon:  { label:'Brouillon',  color:'#767676', bg:'#f4f5f7' },
  annule:     { label:'Annulée',    color:'#767676', bg:'#f4f5f7' },
  en_attente: { label:'En attente', color:'#e27000', bg:'#fff3e0' },
  paye_dep:   { label:'Payée',      color:'#2CA01C', bg:'#e8f5e2' },
  valide:     { label:'Validée',    color:'#2CA01C', bg:'#e8f5e2' },
  rejete:     { label:'Rejetée',    color:'#d52b1e', bg:'#fdecea' },
};

// Badge statut QuickBooks
export const QBBadge = ({ status }) => {
  const s = STATUS[status] || STATUS.brouillon;
  return (
    <span style={{ padding:'3px 10px', borderRadius:3, background:s.bg, color:s.color, fontSize:12, fontWeight:600, whiteSpace:'nowrap', border:`1px solid ${s.color}30` }}>
      {s.label}
    </span>
  );
};

// KPI Card QuickBooks
export const QBKpi = ({ title, value, sub, color, icon, trend, onClick }) => (
  <div onClick={onClick} style={{ background:'white', borderRadius:4, padding:'18px 20px', border:'1px solid #d4d7dc', cursor:onClick?'pointer':'default', flex:1, minWidth:160, transition:'box-shadow .15s' }}
    onMouseEnter={e=>onClick&&(e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.12)')}
    onMouseLeave={e=>onClick&&(e.currentTarget.style.boxShadow='none')}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
      <div style={{ fontSize:13, fontWeight:600, color:'#4a4a4a' }}>{title}</div>
      {icon&&<span style={{ fontSize:20 }}>{icon}</span>}
    </div>
    <div style={{ fontSize:24, fontWeight:700, color:color||'#1a1a1a', marginBottom:4 }}>{value}</div>
    {sub&&<div style={{ fontSize:12, color:'#767676' }}>{sub}</div>}
    {trend!==undefined&&(
      <div style={{ marginTop:8, fontSize:11, fontWeight:600, color:trend>=0?'#2CA01C':'#d52b1e' }}>
        {trend>=0?'▲':'▼'} {Math.abs(trend)}% vs mois dernier
      </div>
    )}
  </div>
);

// En-tête de section QuickBooks
export const QBSection = ({ title, action, actionLabel, children }) => (
  <div style={{ marginBottom:24 }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, paddingBottom:10, borderBottom:'2px solid #2CA01C' }}>
      <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:'#1a1a1a' }}>{title}</h3>
      {action&&<button onClick={action} style={{ padding:'7px 16px', borderRadius:3, border:'1px solid #2CA01C', background:'white', color:'#2CA01C', fontWeight:600, fontSize:13, cursor:'pointer' }}>{actionLabel||'Voir tout'}</button>}
    </div>
    {children}
  </div>
);

// Tableau QuickBooks
export const QBTable = ({ headers, rows, onRowClick, emptyMsg }) => (
  <div style={{ border:'1px solid #d4d7dc', borderRadius:4, overflow:'hidden' }}>
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', minWidth:600 }}>
        <thead>
          <tr style={{ background:'#f4f5f7', borderBottom:'2px solid #d4d7dc' }}>
            {headers.map(h=>(
              <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:12, fontWeight:700, color:'#4a4a4a', textTransform:'uppercase', letterSpacing:0.3, whiteSpace:'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length===0&&(
            <tr><td colSpan={headers.length} style={{ padding:40, textAlign:'center', color:'#767676', fontSize:14 }}>{emptyMsg||'Aucune donnée'}</td></tr>
          )}
          {rows.map((row,i)=>(
            <tr key={i} onClick={()=>onRowClick&&onRowClick(i)} style={{ borderBottom:'1px solid #e8eaed', background:i%2===0?'white':'#fafbfc', cursor:onRowClick?'pointer':'default' }}
              onMouseEnter={e=>onRowClick&&(e.currentTarget.style.background='#f0faf0')}
              onMouseLeave={e=>onRowClick&&(e.currentTarget.style.background=i%2===0?'white':'#fafbfc')}>
              {row.map((cell,j)=>(
                <td key={j} style={{ padding:'11px 14px', fontSize:13, color:'#1a1a1a', verticalAlign:'middle' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Champ formulaire QuickBooks
export const QBField = ({ label, required, children, hint }) => (
  <div>
    <label style={{ fontSize:13, fontWeight:600, color:'#1a1a1a', display:'block', marginBottom:5 }}>
      {label}{required&&<span style={{ color:'#d52b1e', marginLeft:2 }}>*</span>}
    </label>
    {children}
    {hint&&<div style={{ fontSize:11, color:'#767676', marginTop:3 }}>{hint}</div>}
  </div>
);

export const QBInput = ({ type='text', value, onChange, placeholder, min, disabled }) => (
  <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} min={min} disabled={disabled}
    style={{ width:'100%', padding:'8px 10px', borderRadius:3, border:'1px solid #d4d7dc', fontSize:13, color:'#1a1a1a', background:disabled?'#f4f5f7':'white', boxSizing:'border-box', outline:'none', transition:'border-color .15s', fontFamily:'inherit' }}
    onFocus={e=>e.target.style.borderColor='#0077C5'}
    onBlur={e=>e.target.style.borderColor='#d4d7dc'}/>
);

export const QBSelect = ({ value, onChange, options, placeholder, disabled }) => (
  <select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
    style={{ width:'100%', padding:'8px 10px', borderRadius:3, border:'1px solid #d4d7dc', fontSize:13, color:value?'#1a1a1a':'#767676', background:'white', cursor:'pointer', outline:'none', fontFamily:'inherit' }}
    onFocus={e=>e.target.style.borderColor='#0077C5'}
    onBlur={e=>e.target.style.borderColor='#d4d7dc'}>
    <option value="">{placeholder||'Sélectionner...'}</option>
    {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
  </select>
);

export const QBTextarea = ({ value, onChange, placeholder, rows=4 }) => (
  <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} rows={rows}
    style={{ width:'100%', padding:'8px 10px', borderRadius:3, border:'1px solid #d4d7dc', fontSize:13, color:'#1a1a1a', background:'white', resize:'vertical', boxSizing:'border-box', outline:'none', fontFamily:'inherit' }}
    onFocus={e=>e.target.style.borderColor='#0077C5'}
    onBlur={e=>e.target.style.borderColor='#d4d7dc'}/>
);

export const QBBtn = ({ label, onClick, primary, danger, disabled, icon, small }) => {
  const bg = disabled?'#d4d7dc':danger?'#d52b1e':primary?'#2CA01C':'white';
  const color = disabled?'#767676':danger||primary?'white':'#2CA01C';
  const border = disabled?'#d4d7dc':danger?'#d52b1e':'#2CA01C';
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding:small?'6px 12px':'9px 18px', borderRadius:3, border:`1px solid ${border}`, background:bg, color, fontWeight:600, fontSize:small?12:13, cursor:disabled?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap', transition:'all .15s', fontFamily:'inherit' }}
      onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.opacity='0.85'; }}
      onMouseLeave={e=>{ if(!disabled) e.currentTarget.style.opacity='1'; }}>
      {icon&&<span>{icon}</span>}{label}
    </button>
  );
};

// Modal QuickBooks
export const QBModal = ({ title, subtitle, onClose, children, maxWidth=700 }) => (
  <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:'inherit' }}>
    <div style={{ background:'white', borderRadius:4, width:'100%', maxWidth, maxHeight:'92vh', overflow:'auto', boxShadow:'0 8px 32px rgba(0,0,0,0.2)' }}>
      {/* Header vert QuickBooks */}
      <div style={{ background:'#2CA01C', padding:'16px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          {subtitle&&<div style={{ fontSize:11, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:2 }}>{subtitle}</div>}
          <div style={{ fontSize:18, fontWeight:700, color:'white' }}>{title}</div>
        </div>
        <button onClick={onClose} style={{ width:28, height:28, borderRadius:'50%', background:'rgba(255,255,255,0.2)', border:'none', color:'white', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
      </div>
      <div style={{ padding:24 }}>{children}</div>
    </div>
  </div>
);
