// ===== DESIGN SYSTEM PARTAGÉ — Style Microsoft Approvals =====
// Utilisé par Approvals.jsx et Projets.jsx

export const COLORS = {
  bg: '#f3f4f8',
  white: '#ffffff',
  border: '#e8eaed',
  border2: '#d2d5db',
  text: '#1f2937',
  text2: '#4b5563',
  muted: '#9ca3af',
  light: '#d1d5db',
  blue: '#0078d4',
  blue2: '#106ebe',
  blue3: '#deecf9',
  green: '#107c10',
  green2: '#dff6dd',
  red: '#d13438',
  red2: '#fde7e9',
  orange: '#ca5010',
  orange2: '#fff4ce',
  purple: '#5c2d91',
  purple2: '#f4f0fb',
  gray: '#605e5c',
  gray2: '#edebe9',
};

export const STATUS_STYLES = {
  draft:        { label: 'Brouillon',    color: '#605e5c', bg: '#edebe9', dot: '#a19f9d' },
  submitted:    { label: 'Soumis',       color: '#0078d4', bg: '#deecf9', dot: '#0078d4' },
  review_1:     { label: 'Finance 1',    color: '#5c2d91', bg: '#f4f0fb', dot: '#5c2d91' },
  review_2:     { label: 'Finance 2',    color: '#8764b8', bg: '#f4f0fb', dot: '#8764b8' },
  pending_boss: { label: 'Direction',   color: '#ca5010', bg: '#fff4ce', dot: '#ca5010' },
  approved:     { label: 'Approuvé',    color: '#107c10', bg: '#dff6dd', dot: '#107c10' },
  paid:         { label: 'Payé',        color: '#107c10', bg: '#dff6dd', dot: '#107c10' },
  rejected:     { label: 'Rejeté',      color: '#d13438', bg: '#fde7e9', dot: '#d13438' },
  // Pour Projets
  brouillon:    { label: 'Brouillon',   color: '#605e5c', bg: '#edebe9', dot: '#a19f9d' },
  soumis:       { label: 'Soumis',      color: '#0078d4', bg: '#deecf9', dot: '#0078d4' },
  finance1:     { label: 'Finance 1',   color: '#5c2d91', bg: '#f4f0fb', dot: '#5c2d91' },
  finance2:     { label: 'Finance 2',   color: '#8764b8', bg: '#f4f0fb', dot: '#8764b8' },
  dg:           { label: 'Direction',   color: '#ca5010', bg: '#fff4ce', dot: '#ca5010' },
  approuve:     { label: 'Approuvé',    color: '#107c10', bg: '#dff6dd', dot: '#107c10' },
  en_cours:     { label: 'En cours',    color: '#0078d4', bg: '#deecf9', dot: '#0078d4' },
  termine:      { label: 'Terminé',     color: '#107c10', bg: '#dff6dd', dot: '#107c10' },
  rejete:       { label: 'Rejeté',      color: '#d13438', bg: '#fde7e9', dot: '#d13438' },
};

export const APPROVERS = [
  { id: 'f1', name: 'Alice Finance',    role: 'Finance 1',  initials: 'AF', color: '#5c2d91' },
  { id: 'f2', name: 'Bob Finance',      role: 'Finance 2',  initials: 'BF', color: '#8764b8' },
  { id: 'dg', name: 'Jérôme Bell',      role: 'Directeur Général', initials: 'JB', color: '#ca5010' },
];

// Avatar initiales style Microsoft
export const Avatar = ({ name, initials, color, size=36, online }) => (
  <div style={{ position: 'relative', flexShrink: 0 }}>
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color || '#0078d4',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontSize: size*0.33, fontWeight: 700,
      fontFamily: 'Segoe UI, Arial, sans-serif',
      userSelect: 'none',
    }}>
      {initials || (name ? name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : '?')}
    </div>
    {online !== undefined && (
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: size*0.28, height: size*0.28, borderRadius: '50%',
        background: online ? '#107c10' : '#a19f9d',
        border: '2px solid white',
      }}/>
    )}
  </div>
);

// Badge statut style Microsoft
export const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.draft;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 12,
      background: s.bg, color: s.color,
      fontSize: 12, fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 3, background: s.dot, flexShrink: 0 }}/>
      {s.label}
    </span>
  );
};

// Timeline approbateurs style Microsoft Approvals
export const ApproversTimeline = ({ steps, currentStatus }) => {
  const allSteps = [
    { key: 'submitted',    label: 'Soumis',     role: 'Soumetteur' },
    { key: 'review_1',     label: 'Finance 1',  role: 'Alice Finance' },
    { key: 'review_2',     label: 'Finance 2',  role: 'Bob Finance' },
    { key: 'pending_boss', label: 'Direction',  role: 'Jérôme Bell DG' },
    { key: 'approved',     label: 'Approuvé',   role: '' },
  ];
  const statusOrder = ['submitted','review_1','review_2','pending_boss','approved','paid'];
  const currentIdx = statusOrder.indexOf(currentStatus);
  const isRejected = currentStatus === 'rejected';
  const colors = {
    submitted: '#0078d4', review_1: '#5c2d91',
    review_2: '#8764b8', pending_boss: '#ca5010', approved: '#107c10'
  };
  const initials = {
    submitted: 'SO', review_1: 'AF', review_2: 'BF', pending_boss: 'JB', approved: '✓'
  };

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, width: '100%', padding: '12px 0' }}>
      {allSteps.map((step, i) => {
        const stepIdx = statusOrder.indexOf(step.key);
        const done = currentIdx > stepIdx && !isRejected;
        const active = currentIdx === stepIdx && !isRejected;
        const pending = currentIdx < stepIdx || isRejected;
        const color = colors[step.key];
        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'flex-start', flex: i < allSteps.length-1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              {/* Cercle approbateur */}
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: done ? '#107c10' : active ? color : '#edebe9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: done||active ? 'white' : '#a19f9d',
                fontSize: done ? 18 : 13, fontWeight: 700,
                border: active ? `3px solid ${color}` : '3px solid transparent',
                boxShadow: active ? `0 0 0 3px ${color}25` : 'none',
                transition: 'all .3s',
                flexShrink: 0,
              }}>
                {done ? '✓' : initials[step.key]}
              </div>
              {/* Label */}
              <div style={{ textAlign: 'center', minWidth: 70 }}>
                <div style={{ fontSize: 11, fontWeight: done||active ? 700 : 400, color: done ? '#107c10' : active ? color : '#a19f9d' }}>{step.label}</div>
                <div style={{ fontSize: 10, color: '#a19f9d', marginTop: 1 }}>{step.role}</div>
              </div>
            </div>
            {/* Ligne connecteur */}
            {i < allSteps.length-1 && (
              <div style={{ flex: 1, height: 3, background: done ? '#107c10' : '#edebe9', margin: '19px 6px 0', borderRadius: 2, transition: 'background .3s' }}/>
            )}
          </div>
        );
      })}
      {isRejected && (
        <div style={{ position: 'absolute', right: 0, top: 8, padding: '4px 10px', borderRadius: 12, background: '#fde7e9', color: '#d13438', fontSize: 11, fontWeight: 700 }}>
          Rejeté
        </div>
      )}
    </div>
  );
};

// Card demande style Microsoft Approvals
export const ApprovalCard = ({ item, onClick, statusKey }) => {
  const s = STATUS_STYLES[statusKey] || STATUS_STYLES.draft;
  const fmtN = n => new Intl.NumberFormat('fr-FR').format(Math.round(n||0));
  const fmtD = d => d ? new Date(d).toLocaleDateString('fr-FR', {day:'2-digit',month:'short',year:'numeric'}) : '—';
  const initials = item.submittedBy?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() || '??';  const avatarColors = ['#0078d4','#107c10','#5c2d91','#ca5010','#d13438','#8764b8'];
  const avatarColor = avatarColors[item.submittedBy?.charCodeAt(0) % avatarColors.length] || '#0078d4';

  return (
    <div onClick={onClick}
      style={{
        background: 'white', borderRadius: 8, padding: 0,
        border: '1px solid #e8eaed', cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        transition: 'all .15s', overflow: 'hidden',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,120,212,0.15)'; e.currentTarget.style.borderColor = '#0078d4'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#e8eaed'; }}>

      {/* Bande couleur statut */}
      <div style={{ height: 4, background: s.dot }}/>

      <div style={{ padding: '16px 18px' }}>
        {/* Header card */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1 }}>
            <Avatar name={item.submittedBy} initials={initials} color={avatarColor} size={38}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', marginBottom: 2, lineHeight: 1.3 }}>{item.title || item.titre}</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>par {item.submittedBy || item.chefProjet} · {fmtD(item.submittedAt || item.dateCreation)}</div>
            </div>
          </div>
          <StatusBadge status={statusKey}/>
        </div>

        {/* Montant si applicable */}
        {(item.amount > 0 || item.montantTotal > 0) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, padding: '6px 10px', background: '#f3f4f8', borderRadius: 6 }}>
            <span style={{ fontSize: 13, color: '#4b5563', fontWeight: 400 }}>Montant :</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0078d4' }}>
              {fmtN(item.amount || item.montantTotal)} {item.currency || item.devise || 'FCFA'}
            </span>
          </div>
        )}

        {/* Mini timeline approbateurs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
          {APPROVERS.map((a, i) => {
            const statusOrder = ['submitted','review_1','review_2','pending_boss','approved','paid'];
            const approverIdx = [1, 2, 3][i];
            const currentIdx = statusOrder.indexOf(statusKey);
            const done = currentIdx > approverIdx;
            const active = currentIdx === approverIdx;
            return (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center' }}>
                <div title={`${a.name} — ${a.role}`} style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: done ? '#107c10' : active ? a.color : '#edebe9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: done||active ? 'white' : '#a19f9d',
                  fontSize: 9, fontWeight: 700,
                  border: active ? `2px solid ${a.color}` : '2px solid transparent',
                  cursor: 'default',
                }}>{done ? '✓' : a.initials}</div>
                {i < APPROVERS.length-1 && <div style={{ width: 14, height: 1.5, background: done ? '#107c10' : '#edebe9' }}/>}
              </div>
            );
          })}
          <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 6 }}>{s.label}</span>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #f3f4f8' }}>
          <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>{item.reference}</div>
          <div style={{ display: 'flex', gap: 5 }}>
            {item.priority === 'haute' && <span style={{ padding: '2px 7px', borderRadius: 4, background: '#fde7e9', color: '#d13438', fontSize: 10, fontWeight: 700 }}>Urgent</span>}
            {(item.site || item.siteCode) && <span style={{ padding: '2px 7px', borderRadius: 4, background: '#deecf9', color: '#0078d4', fontSize: 10, fontWeight: 600 }}>{item.site || item.siteCode}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

// Champ formulaire style Microsoft Fluent
export const Field = ({ label, required, children, hint }) => (
  <div style={{ marginBottom: 0 }}>
    <label style={{
      fontSize: 12, fontWeight: 600, color: '#323130',
      display: 'block', marginBottom: 4,
    }}>
      {label}{required && <span style={{ color: '#d13438', marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {hint && <div style={{ fontSize: 11, color: '#a19f9d', marginTop: 3 }}>{hint}</div>}
  </div>
);

export const FluentInput = ({ type='text', value, onChange, placeholder, min, disabled }) => (
  <input
    type={type} value={value} onChange={e=>onChange(e.target.value)}
    placeholder={placeholder||''} min={min} disabled={disabled}
    style={{
      width: '100%', padding: '7px 10px',
      borderRadius: 0, border: 'none',
      borderBottom: '2px solid #d2d5db',
      fontSize: 14, color: '#1f2937',
      background: 'transparent', outline: 'none',
      boxSizing: 'border-box', transition: 'border-color .15s',
      fontFamily: 'Segoe UI, Arial, sans-serif',
    }}
    onFocus={e => e.target.style.borderBottomColor = '#0078d4'}
    onBlur={e => e.target.style.borderBottomColor = '#d2d5db'}
  />
);

export const FluentSelect = ({ value, onChange, options, placeholder }) => (
  <select
    value={value} onChange={e=>onChange(e.target.value)}
    style={{
      width: '100%', padding: '7px 10px',
      borderRadius: 0, border: 'none',
      borderBottom: '2px solid #d2d5db',
      fontSize: 14, color: value ? '#1f2937' : '#a19f9d',
      background: 'transparent', cursor: 'pointer', outline: 'none',
      fontFamily: 'Segoe UI, Arial, sans-serif',
    }}
    onFocus={e => e.target.style.borderBottomColor = '#0078d4'}
    onBlur={e => e.target.style.borderBottomColor = '#d2d5db'}>
    <option value="">{placeholder || 'Sélectionner...'}</option>
    {options.map(o => <option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
  </select>
);

export const FluentTextarea = ({ value, onChange, placeholder, rows=4 }) => (
  <textarea
    value={value} onChange={e=>onChange(e.target.value)}
    placeholder={placeholder||''} rows={rows}
    style={{
      width: '100%', padding: '8px 10px',
      borderRadius: 4, border: '1px solid #d2d5db',
      fontSize: 14, color: '#1f2937',
      background: 'white', outline: 'none', resize: 'vertical',
      boxSizing: 'border-box', transition: 'border-color .15s',
      fontFamily: 'Segoe UI, Arial, sans-serif',
    }}
    onFocus={e => e.target.style.borderColor = '#0078d4'}
    onBlur={e => e.target.style.borderColor = '#d2d5db'}/>
);

// Bouton style Fluent
export const FluentBtn = ({ label, onClick, color='#0078d4', ghost, disabled, icon }) => (
  <button onClick={onClick} disabled={disabled}
    style={{
      padding: '8px 16px', borderRadius: 4,
      border: ghost ? `1px solid ${color}` : 'none',
      background: disabled ? '#f3f4f6' : ghost ? 'transparent' : color,
      color: disabled ? '#a19f9d' : ghost ? color : 'white',
      fontWeight: 600, fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', gap: 6,
      fontFamily: 'Segoe UI, Arial, sans-serif',
      transition: 'all .15s',
    }}
    onMouseEnter={e => { if(!disabled) e.currentTarget.style.background = ghost ? `${color}12` : color === '#0078d4' ? '#106ebe' : color; }}
    onMouseLeave={e => { if(!disabled) e.currentTarget.style.background = ghost ? 'transparent' : color; }}>
    {icon && <span style={{fontSize:14}}>{icon}</span>}
    {label}
  </button>
);
