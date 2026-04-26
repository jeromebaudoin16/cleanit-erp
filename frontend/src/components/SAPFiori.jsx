import { useState, useEffect, useRef } from 'react';

// ===== SAP FIORI EXACT DESIGN TOKENS =====
export const F = {
  // Brand Colors
  brand:      '#0070F2',
  brand_dark: '#0057B8',
  brand_light:'#E8F3FF',
  
  // Semantic Colors
  positive:   '#107E3E',
  positive_bg:'#F1F8F1',
  critical:   '#E76500',
  critical_bg:'#FEF3E6',
  negative:   '#BB0000',
  negative_bg:'#FFF0F0',
  info:       '#0070F2',
  info_bg:    '#E8F3FF',
  
  // Shell & Structure
  shell:      '#1B3A52',
  shell2:     '#0D2B40',
  shell_text: '#FFFFFF',
  
  // Neutrals — SAP exact
  base_1:     '#32363A',
  base_2:     '#515456',
  base_3:     '#6A6D70',
  base_4:     '#89898B',
  base_5:     '#BDBDBD',
  base_6:     '#D9D9D9',
  base_7:     '#EBEBEB',
  base_8:     '#F4F4F4',
  base_9:     '#FAFAFA',
  white:      '#FFFFFF',
  
  // Typography
  font:       "'72', '72full', Arial, Helvetica, sans-serif",
  size_h1:    '1.5rem',
  size_h2:    '1.25rem',
  size_h3:    '1rem',
  size_body:  '0.875rem',
  size_small: '0.75rem',
  size_tiny:  '0.6875rem',
  
  // Spacing (4px grid)
  sp1: '0.25rem',  // 4px
  sp2: '0.5rem',   // 8px
  sp3: '0.75rem',  // 12px
  sp4: '1rem',     // 16px
  sp5: '1.25rem',  // 20px
  sp6: '1.5rem',   // 24px
  sp8: '2rem',     // 32px
  
  // Borders
  border_radius: '0.25rem',
  border_color:  '#D9D9D9',
  border_focus:  '#0070F2',
  
  // Shadows
  shadow_1: '0 1px 4px 0 rgba(0,0,0,0.15)',
  shadow_2: '0 2px 8px 0 rgba(0,0,0,0.18)',
  shadow_3: '0 4px 16px 0 rgba(0,0,0,0.20)',
};

// ===== GLOBAL STYLES INJECTION =====
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600;700&display=swap');
  
  .sap-app * {
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  .sap-app {
    font-family: 'Noto Sans', Arial, Helvetica, sans-serif;
    font-size: 14px;
    color: #32363A;
    background: #F4F4F4;
  }

  /* SAP Fiori Animations */
  @keyframes sap-slide-in {
    from { transform: translateX(100%); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
  }
  @keyframes sap-slide-up {
    from { transform: translateY(20px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes sap-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes sap-pulse {
    0%,100% { transform: scale(1); }
    50%      { transform: scale(1.05); }
  }
  @keyframes sap-shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  @keyframes sap-spin {
    to { transform: rotate(360deg); }
  }

  .sap-slide-in    { animation: sap-slide-in 0.28s cubic-bezier(0.4,0,0.2,1) both; }
  .sap-slide-up    { animation: sap-slide-up 0.22s cubic-bezier(0.4,0,0.2,1) both; }
  .sap-fade-in     { animation: sap-fade-in  0.18s ease both; }

  /* SAP Interactive States */
  .sap-btn         { transition: background 0.15s, box-shadow 0.15s, transform 0.1s; }
  .sap-btn:hover   { filter: brightness(0.93); }
  .sap-btn:active  { transform: scale(0.975); }

  .sap-row-hover   { transition: background 0.1s; cursor: pointer; }
  .sap-row-hover:hover { background: #E8F3FF !important; }

  .sap-card        { transition: box-shadow 0.18s; }
  .sap-card:hover  { box-shadow: 0 4px 16px rgba(0,0,0,0.14) !important; }

  .sap-nav-item    { transition: background 0.12s, color 0.12s; }
  .sap-nav-item:hover { background: rgba(255,255,255,0.08) !important; }

  /* SAP Focus Ring */
  .sap-input:focus  { outline: 2px solid #0070F2; outline-offset: -2px; }
  .sap-select:focus { outline: 2px solid #0070F2; outline-offset: -2px; }

  /* SAP Skeleton Loading */
  .sap-skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: sap-shimmer 1.4s infinite;
    border-radius: 4px;
  }
  
  /* SAP Tab Underline animation */
  .sap-tab-active { position: relative; }
  .sap-tab-active::after {
    content: '';
    position: absolute;
    bottom: -1px; left: 0; right: 0;
    height: 2px;
    background: #0070F2;
    animation: sap-fade-in 0.18s ease both;
  }

  /* SAP Tooltip */
  .sap-tooltip { position: relative; }
  .sap-tooltip::before {
    content: attr(data-tip);
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%; transform: translateX(-50%);
    background: #32363A;
    color: white;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 4px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s;
    z-index: 1000;
  }
  .sap-tooltip:hover::before { opacity: 1; }

  /* SAP Panel overlay */
  .sap-overlay {
    position: fixed; inset: 0; z-index: 500;
    background: rgba(13,43,64,0.4);
    backdrop-filter: blur(2px);
    animation: sap-fade-in 0.2s ease both;
  }
  .sap-panel {
    position: fixed; top: 0; right: 0; bottom: 0;
    background: white;
    box-shadow: -8px 0 32px rgba(0,0,0,0.22);
    display: flex; flex-direction: column;
    animation: sap-slide-in 0.28s cubic-bezier(0.4,0,0.2,1) both;
    z-index: 501;
  }
  
  /* SAP Modal */
  .sap-modal {
    animation: sap-slide-up 0.24s cubic-bezier(0.4,0,0.2,1) both;
  }

  /* SAP Status indicator dot */
  .sap-status-dot {
    display: inline-block;
    width: 8px; height: 8px;
    border-radius: 50%;
    margin-right: 6px;
  }
  
  /* SAP Progress bar */
  .sap-progress-bar {
    height: 6px;
    background: #EBEBEB;
    border-radius: 3px;
    overflow: hidden;
  }
  .sap-progress-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
  }

  /* SAP Tag/Badge */
  .sap-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    letter-spacing: 0.1px;
  }

  /* SAP Table */
  .sap-table { width: 100%; border-collapse: collapse; }
  .sap-table th {
    padding: 10px 16px;
    text-align: left;
    font-size: 12px;
    font-weight: 700;
    color: #6A6D70;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    background: #F4F4F4;
    border-bottom: 2px solid #D9D9D9;
    user-select: none;
    white-space: nowrap;
  }
  .sap-table td {
    padding: 12px 16px;
    font-size: 13px;
    color: #32363A;
    border-bottom: 1px solid #EBEBEB;
    vertical-align: middle;
  }
  .sap-table tr:last-child td { border-bottom: none; }
  .sap-table tr:nth-child(even) td { background: #FAFAFA; }
  
  /* SAP Form */
  .sap-field-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #6A6D70;
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .sap-input, .sap-select, .sap-textarea {
    width: 100%;
    padding: 9px 12px;
    border: 1px solid #D9D9D9;
    border-radius: 4px;
    font-size: 13px;
    font-family: inherit;
    color: #32363A;
    background: white;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
    appearance: none;
  }
  .sap-input:hover, .sap-select:hover { border-color: #BDBDBD; }
  .sap-input:focus, .sap-select:focus, .sap-textarea:focus {
    border-color: #0070F2;
    box-shadow: 0 0 0 2px rgba(0,112,242,0.15);
    outline: none;
  }
  .sap-input::placeholder, .sap-textarea::placeholder { color: #BDBDBD; }
  .sap-select { cursor: pointer; }
  .sap-textarea { resize: vertical; min-height: 80px; }

  /* SAP KPI Card */
  .sap-kpi {
    background: white;
    border: 1px solid #D9D9D9;
    border-radius: 4px;
    padding: 18px 20px;
    transition: box-shadow 0.18s;
    position: relative;
    overflow: hidden;
  }
  .sap-kpi::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: var(--kpi-color, #0070F2);
  }
  .sap-kpi:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
  
  /* Scrollbar SAP style */
  .sap-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
  .sap-scroll::-webkit-scrollbar-track { background: #F4F4F4; }
  .sap-scroll::-webkit-scrollbar-thumb { background: #BDBDBD; border-radius: 3px; }
  .sap-scroll::-webkit-scrollbar-thumb:hover { background: #89898B; }
`;

// Inject CSS once
if (typeof document !== 'undefined' && !document.getElementById('sap-fiori-css')) {
  const style = document.createElement('style');
  style.id = 'sap-fiori-css';
  style.textContent = GLOBAL_CSS;
  document.head.appendChild(style);
}

// ===== SAP ICON SYSTEM (SVG paths) =====
export const SapIcon = ({ name, size = 16, color = 'currentColor', className = '' }) => {
  const paths = {
    home:         'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
    employee:     'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z',
    group:        'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
    calendar:     'M8 2v4 M16 2v4 M3 10h18 M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z',
    clock:        'M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 6v6l4 2',
    document:     'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    salary:       'M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
    analytics:    'M18 20V10 M12 20V4 M6 20v-6',
    add:          'M12 5v14 M5 12h14',
    close:        'M18 6L6 18 M6 6l12 12',
    search:       'M21 21l-4.35-4.35 M17 11A6 6 0 115 11a6 6 0 0112 0z',
    check:        'M20 6L9 17l-5-5',
    edit:         'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
    view:         'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12m-3 0a3 3 0 106 0 3 3 0 00-6 0',
    download:     'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3',
    upload:       'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
    mail:         'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
    phone:        'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.63 19.79 19.79 0 01.06 4 2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.91a16 16 0 006.12 6.12l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z',
    location:     'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10m-3 0a3 3 0 106 0 3 3 0 00-6 0',
    building:     'M3 21h18 M3 7v14 M21 7v14 M9 21V7 M15 21V7 M3 7l9-4 9 4',
    alert:        'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01',
    print:        'M6 9V2h12v7 M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2 M6 14h12v8H6z',
    filter:       'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
    star:         'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    link:         'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71',
    chevron_r:    'M9 18l6-6-6-6',
    chevron_d:    'M6 9l6 6 6-6',
    grid:         'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
    list_view:    'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01',
    settings:     'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
    notification: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0',
    logout:       'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9',
    refresh:      'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15',
    more:         'M12 5h.01 M12 12h.01 M12 19h.01',
    expand:       'M15 3h6v6 M9 21H3v-6 M21 3l-7 7 M3 21l7-7',
    history:      'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    id_card:      'M2 4h20v16H2z M2 8h20 M6 12h4 M6 16h6 M16 12h2 M16 16h2',
    briefcase:    'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2',
    shield:       'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    external:     'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6 M15 3h6v6 M10 14L21 3',
  };
  const d = paths[name];
  if (!d) return null;
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: 'block' }}
      className={className}
    >
      {d.split(' M ').map((seg, i) => (
        <path key={i} d={i === 0 ? seg : `M ${seg}`} />
      ))}
    </svg>
  );
};

// ===== SAP AVATAR =====
const AVATAR_PALETTE = [
  { bg: '#DFE9FF', text: '#0057B8' },
  { bg: '#FFDEFF', text: '#6B00A4' },
  { bg: '#DAFBE1', text: '#107E3E' },
  { bg: '#FEF3E6', text: '#AD4E00' },
  { bg: '#FFE9E9', text: '#BB0000' },
  { bg: '#E0F5FF', text: '#0070F2' },
  { bg: '#FFF8D6', text: '#6B5100' },
  { bg: '#F0EEFF', text: '#5B4AF7' },
];

export const getAvatarStyle = (name = '') =>
  AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];

export const getInitials = (first = '', last = '') =>
  `${first[0] || ''}${last[0] || ''}`.toUpperCase();

export const SapAvatar = ({ first = '', last = '', size = 40, status }) => {
  const style = getAvatarStyle(first + last);
  const initials = getInitials(first, last);
  const statusColors = {
    actif: '#107E3E', conge: '#E76500',
    inactif: '#BDBDBD', suspendu: '#BB0000',
  };
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: style.bg, color: style.text,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.32, fontWeight: 700,
        border: `2px solid rgba(255,255,255,0.9)`,
        boxShadow: '0 0 0 1.5px #D9D9D9',
        letterSpacing: '0.5px',
        userSelect: 'none',
      }}>
        {initials}
      </div>
      {status && (
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: size * 0.28, height: size * 0.28,
          borderRadius: '50%',
          background: statusColors[status] || '#BDBDBD',
          border: '2px solid white',
        }} />
      )}
    </div>
  );
};

// ===== SAP BADGE/STATUS =====
const STATUS_CONFIG = {
  actif:      { label: 'Actif',       bg: '#F1F8F1', color: '#107E3E', dot: '#107E3E' },
  inactif:    { label: 'Inactif',     bg: '#F4F4F4', color: '#6A6D70', dot: '#BDBDBD' },
  conge:      { label: 'En congé',    bg: '#FEF3E6', color: '#AD4E00', dot: '#E76500' },
  suspendu:   { label: 'Suspendu',    bg: '#FFF0F0', color: '#BB0000', dot: '#BB0000' },
  paye:       { label: 'Payé',        bg: '#F1F8F1', color: '#107E3E', dot: '#107E3E' },
  en_attente: { label: 'En attente',  bg: '#FEF3E6', color: '#AD4E00', dot: '#E76500' },
  valide:     { label: 'Validé',      bg: '#E8F3FF', color: '#0057B8', dot: '#0070F2' },
  brouillon:  { label: 'Brouillon',   bg: '#F4F4F4', color: '#6A6D70', dot: '#BDBDBD' },
  present:    { label: 'Présent',     bg: '#F1F8F1', color: '#107E3E', dot: '#107E3E' },
  absent:     { label: 'Absent',      bg: '#FFF0F0', color: '#BB0000', dot: '#BB0000' },
  retard:     { label: 'Retard',      bg: '#FEF3E6', color: '#AD4E00', dot: '#E76500' },
  approuve:   { label: 'Approuvé',    bg: '#F1F8F1', color: '#107E3E', dot: '#107E3E' },
  refuse:     { label: 'Refusé',      bg: '#FFF0F0', color: '#BB0000', dot: '#BB0000' },
  cdi:        { label: 'CDI',         bg: '#F1F8F1', color: '#107E3E', dot: '#107E3E' },
  cdd:        { label: 'CDD',         bg: '#E8F3FF', color: '#0057B8', dot: '#0070F2' },
  freelance:  { label: 'Freelance',   bg: '#FEF3E6', color: '#AD4E00', dot: '#E76500' },
  stage:      { label: 'Stage',       bg: '#F4F4F4', color: '#6A6D70', dot: '#BDBDBD' },
};

export const SapBadge = ({ status, label, size = 'md' }) => {
  const cfg = STATUS_CONFIG[status] || {
    label: label || status,
    bg: '#F4F4F4', color: '#6A6D70', dot: '#BDBDBD',
  };
  return (
    <span className="sap-badge" style={{
      background: cfg.bg, color: cfg.color,
      fontSize: size === 'sm' ? '11px' : '12px',
      padding: size === 'sm' ? '2px 8px' : '3px 10px',
      border: `1px solid ${cfg.dot}30`,
    }}>
      <span className="sap-status-dot" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
};

// ===== SAP BUTTON =====
const BTN_VARIANTS = {
  primary:   { bg: '#0070F2', color: '#fff',     border: '#0070F2', hover: '#0057B8' },
  secondary: { bg: '#fff',    color: '#0070F2',  border: '#0070F2', hover: '#E8F3FF' },
  ghost:     { bg: 'transparent', color: '#32363A', border: '#D9D9D9', hover: '#F4F4F4' },
  positive:  { bg: '#107E3E', color: '#fff',     border: '#107E3E', hover: '#0B5C2B' },
  negative:  { bg: '#BB0000', color: '#fff',     border: '#BB0000', hover: '#8F0000' },
  attention: { bg: '#E76500', color: '#fff',     border: '#E76500', hover: '#C45600' },
};

export const SapButton = ({ label, onClick, variant = 'ghost', disabled, sm, icon, full, tooltip }) => {
  const v = BTN_VARIANTS[variant] || BTN_VARIANTS.ghost;
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="sap-btn"
      style={{
        display: 'inline-flex', alignItems: 'center',
        justifyContent: 'center', gap: '6px',
        padding: sm ? '5px 12px' : '8px 16px',
        width: full ? '100%' : 'auto',
        borderRadius: '4px',
        border: `1px solid ${disabled ? '#D9D9D9' : v.border}`,
        background: disabled ? '#F4F4F4' : hovered ? v.hover : v.bg,
        color: disabled ? '#BDBDBD' : hovered && variant === 'secondary' ? '#0057B8' : v.color,
        fontSize: sm ? '12px' : '13px',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
        letterSpacing: '0.1px',
      }}
    >
      {icon && <SapIcon name={icon} size={sm ? 13 : 15} color={disabled ? '#BDBDBD' : v.color} />}
      {label}
    </button>
  );
};

// ===== SAP INPUT =====
export const SapInput = ({ type = 'text', value, onChange, placeholder, disabled, compact, icon }) => (
  <div style={{ position: 'relative' }}>
    {icon && (
      <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
        <SapIcon name={icon} size={14} color="#89898B" />
      </div>
    )}
    <input
      type={type} value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || ''}
      disabled={disabled}
      className="sap-input"
      style={{ paddingLeft: icon ? '34px' : undefined, padding: compact ? '6px 10px' : undefined }}
    />
  </div>
);

export const SapSelect = ({ value, onChange, options, placeholder, disabled }) => (
  <select
    value={value} onChange={e => onChange(e.target.value)}
    disabled={disabled}
    className="sap-select"
  >
    <option value="">{placeholder || 'Sélectionner...'}</option>
    {options.map(o => (
      <option key={o.v || o} value={o.v || o}>{o.l || o}</option>
    ))}
  </select>
);

export const SapTextarea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea
    value={value} onChange={e => onChange(e.target.value)}
    placeholder={placeholder || ''} rows={rows}
    className="sap-textarea"
  />
);

// ===== SAP FIELD =====
export const SapField = ({ label, required, children, hint, colSpan }) => (
  <div style={{ gridColumn: colSpan ? `1 / -1` : undefined }}>
    <label className="sap-field-label">
      {label}
      {required && <span style={{ color: '#BB0000', marginLeft: '3px' }}>*</span>}
    </label>
    {children}
    {hint && <div style={{ fontSize: '11px', color: '#89898B', marginTop: '3px' }}>{hint}</div>}
  </div>
);

// ===== SAP PANEL (Side Sheet) =====
export const SapPanel = ({ title, subtitle, onClose, children, width = 860, footer }) => (
  <div>
    <div className="sap-overlay" onClick={onClose} />
    <div className="sap-panel sap-scroll" style={{ width, maxWidth: '96vw' }}>
      {/* Panel Header */}
      <div style={{
        padding: '0 24px',
        background: 'white',
        borderBottom: `1px solid #D9D9D9`,
        flexShrink: 0,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
      }}>
        <div>
          {subtitle && (
            <div style={{ fontSize: '11px', color: '#89898B', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>
              {subtitle}
            </div>
          )}
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#32363A' }}>{title}</h2>
        </div>
        <SapButton onClick={onClose} icon="close" variant="ghost" sm />
      </div>

      {/* Panel Content */}
      <div style={{ flex: 1, overflow: 'auto' }} className="sap-scroll">
        {children}
      </div>

      {/* Panel Footer */}
      {footer && (
        <div style={{
          padding: '12px 24px',
          borderTop: `1px solid #D9D9D9`,
          display: 'flex', gap: '8px', justifyContent: 'flex-end',
          flexShrink: 0, background: '#FAFAFA',
        }}>
          {footer}
        </div>
      )}
    </div>
  </div>
);

// ===== SAP MODAL =====
export const SapModal = ({ title, onClose, children, maxWidth = 560, noPadding }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px',
  }}>
    <div className="sap-overlay" onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
    <div className="sap-modal" style={{
      position: 'relative', zIndex: 1,
      width: '100%', maxWidth,
      background: 'white', borderRadius: '4px',
      boxShadow: '0 8px 40px rgba(0,0,0,0.24)',
      maxHeight: '92vh', display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Modal Header — SAP blue */}
      <div style={{
        padding: '14px 20px',
        background: '#1B3A52',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0,
      }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'white', letterSpacing: '0.1px' }}>
          {title}
        </h3>
        <button onClick={onClose} style={{
          width: '28px', height: '28px', borderRadius: '4px',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <SapIcon name="close" size={14} color="white" />
        </button>
      </div>
      <div style={{ overflow: 'auto', flex: 1 }} className="sap-scroll">
        {noPadding ? children : <div style={{ padding: '20px 24px' }}>{children}</div>}
      </div>
    </div>
  </div>
);

// ===== SAP TABLE =====
export const SapTable = ({ columns, rows, onRowClick, emptyText = 'Aucune donnée' }) => (
  <div style={{ overflowX: 'auto' }}>
    <table className="sap-table" style={{ width: '100%' }}>
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={columns.length} style={{ textAlign: 'center', padding: '48px', color: '#89898B' }}>
              {emptyText}
            </td>
          </tr>
        )}
        {rows.map((row, i) => (
          <tr
            key={i}
            onClick={() => onRowClick?.(i)}
            className={onRowClick ? 'sap-row-hover' : ''}
          >
            {row.map((cell, j) => <td key={j}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ===== SAP KPI CARD =====
export const SapKpi = ({ title, value, subtitle, color = '#0070F2', icon, trend, onClick }) => (
  <div
    className={`sap-kpi${onClick ? ' sap-card' : ''}`}
    onClick={onClick}
    style={{ '--kpi-color': color, cursor: onClick ? 'pointer' : 'default' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#89898B', textTransform: 'uppercase', letterSpacing: '0.4px', lineHeight: 1.4 }}>
        {title}
      </div>
      {icon && (
        <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SapIcon name={icon} size={16} color={color} />
        </div>
      )}
    </div>
    <div style={{ fontSize: typeof value === 'string' && value.length > 12 ? '18px' : '26px', fontWeight: 700, color, marginBottom: '4px', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
      {value}
    </div>
    {subtitle && <div style={{ fontSize: '12px', color: '#89898B' }}>{subtitle}</div>}
    {trend !== undefined && (
      <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: 600, color: trend >= 0 ? '#107E3E' : '#BB0000', display: 'flex', alignItems: 'center', gap: '3px' }}>
        <span style={{ fontSize: '13px' }}>{trend >= 0 ? '↑' : '↓'}</span>
        {Math.abs(trend)}% vs mois dernier
      </div>
    )}
  </div>
);

// ===== SAP SECTION HEADER =====
export const SapSection = ({ title, action, actionLabel, children, icon }) => (
  <div style={{ marginBottom: '24px' }}>
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '14px', paddingBottom: '10px',
      borderBottom: `2px solid #0070F2`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon && <SapIcon name={icon} size={16} color="#0070F2" />}
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0070F2', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </span>
      </div>
      {action && (
        <button onClick={action} style={{ fontSize: '12px', color: '#0070F2', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
          {actionLabel || 'Voir tout'}
        </button>
      )}
    </div>
    {children}
  </div>
);

// ===== SAP INFO ROW =====
export const SapInfoRow = ({ label, value, mono, color, last }) => (
  <div style={{
    display: 'grid', gridTemplateColumns: '200px 1fr',
    gap: '16px', alignItems: 'center',
    padding: '11px 0',
    borderBottom: last ? 'none' : `1px solid #EBEBEB`,
  }}>
    <span style={{ fontSize: '13px', color: '#89898B', fontWeight: 500 }}>{label}</span>
    <span style={{
      fontSize: '13px', color: color || '#32363A',
      fontFamily: mono ? 'monospace' : 'inherit',
      fontWeight: mono ? 500 : 400,
    }}>
      {value || '—'}
    </span>
  </div>
);

// ===== SAP CARD =====
export const SapCard = ({ title, icon, action, actionLabel, children, noBorder, style: extraStyle = {} }) => (
  <div style={{
    background: 'white',
    border: noBorder ? 'none' : '1px solid #D9D9D9',
    borderRadius: '4px',
    overflow: 'hidden',
    ...extraStyle,
  }}>
    {title && (
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #EBEBEB',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#FAFAFA',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {icon && <SapIcon name={icon} size={15} color="#0070F2" />}
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#32363A' }}>{title}</span>
        </div>
        {action && (
          <button onClick={action} style={{ fontSize: '12px', color: '#0070F2', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
            {actionLabel || 'Voir tout →'}
          </button>
        )}
      </div>
    )}
    {children}
  </div>
);

// ===== SAP PROGRESS BAR =====
export const SapProgress = ({ value, max = 100, color = '#0070F2', label, showPercent }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      {(label || showPercent) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '12px', color: '#6A6D70' }}>
          {label && <span>{label}</span>}
          {showPercent && <span style={{ fontWeight: 600, color }}>{pct}%</span>}
        </div>
      )}
      <div className="sap-progress-bar">
        <div className="sap-progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

// ===== SAP TIMELINE =====
export const SapTimeline = ({ items }) => (
  <div style={{ position: 'relative', paddingLeft: '28px' }}>
    <div style={{ position: 'absolute', left: '10px', top: 0, bottom: 0, width: '2px', background: '#EBEBEB' }} />
    {items.map((item, i) => {
      const dotColors = {
        Promotion: '#107E3E', Embauche: '#0070F2',
        Augmentation: '#E76500', Avenant: '#0070F2', default: '#89898B',
      };
      const c = dotColors[item.type] || dotColors.default;
      return (
        <div key={i} className="sap-slide-up" style={{ display: 'flex', gap: '12px', marginBottom: '16px', position: 'relative', animationDelay: `${i * 0.06}s` }}>
          <div style={{
            position: 'absolute', left: '-25px',
            width: '18px', height: '18px', borderRadius: '50%',
            background: c, border: '2px solid white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            top: '10px', zIndex: 1,
          }}>
            <SapIcon name={item.type === 'Promotion' ? 'star' : item.type === 'Embauche' ? 'employee' : 'salary'} size={9} color="white" />
          </div>
          <div style={{
            flex: 1, background: 'white',
            border: '1px solid #D9D9D9', borderRadius: '4px', padding: '12px 16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: c }}>{item.type}</span>
              <span style={{ fontSize: '11px', color: '#89898B' }}>{item.date}</span>
            </div>
            <div style={{ fontSize: '13px', color: '#515456', marginBottom: '3px' }}>{item.detail}</div>
            <div style={{ fontSize: '11px', color: '#89898B' }}>Par {item.by}</div>
          </div>
        </div>
      );
    })}
  </div>
);

// ===== SAP STAR RATING =====
export const SapStars = ({ value, max = 5, size = 20 }) => (
  <div style={{ display: 'flex', gap: '3px' }}>
    {Array.from({ length: max }, (_, i) => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24"
        fill={i < Math.round(value) ? '#F0AB00' : '#EBEBEB'}
        stroke={i < Math.round(value) ? '#D4960A' : '#D9D9D9'}
        strokeWidth="1"
      >
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ))}
  </div>
);

// ===== SAP SEARCH BAR =====
export const SapSearchBar = ({ value, onChange, placeholder }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'white', border: '1px solid #D9D9D9',
    borderRadius: '4px', padding: '7px 12px',
    flex: 1,
  }}
    onFocus={e => e.currentTarget.style.borderColor = '#0070F2'}
    onBlur={e => e.currentTarget.style.borderColor = '#D9D9D9'}
  >
    <SapIcon name="search" size={15} color="#89898B" />
    <input
      value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder || 'Rechercher...'}
      style={{ border: 'none', outline: 'none', fontSize: '13px', color: '#32363A', background: 'transparent', flex: 1, fontFamily: 'inherit' }}
    />
    {value && (
      <button onClick={() => onChange('')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
        <SapIcon name="close" size={13} color="#89898B" />
      </button>
    )}
  </div>
);

// ===== SAP TAB BAR =====
export const SapTabBar = ({ tabs, active, onChange, alerts = {} }) => (
  <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #D9D9D9', background: 'white', paddingLeft: '20px' }}>
    {tabs.map(tab => {
      const isActive = active === tab.id;
      const hasAlert = alerts[tab.id];
      return (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '12px 18px',
            border: 'none', background: 'transparent',
            borderBottom: `2px solid ${isActive ? '#0070F2' : 'transparent'}`,
            color: isActive ? '#0070F2' : '#6A6D70',
            fontWeight: isActive ? 700 : 400,
            fontSize: '13px', cursor: 'pointer',
            whiteSpace: 'nowrap', fontFamily: 'inherit',
            transition: 'color 0.12s, border-color 0.12s',
            position: 'relative',
            marginBottom: '-1px',
          }}
          onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#32363A'; }}
          onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#6A6D70'; }}
        >
          {tab.icon && <SapIcon name={tab.icon} size={14} color={isActive ? '#0070F2' : '#89898B'} />}
          {tab.label}
          {hasAlert && (
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: '#E76500', border: '2px solid white',
              position: 'absolute', top: '8px', right: '6px',
            }} />
          )}
        </button>
      );
    })}
  </div>
);

// ===== SAP STEPPER =====
export const SapStepper = ({ steps, current }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
    {steps.map((step, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
            background: current > i + 1 ? '#107E3E' : current === i + 1 ? '#0070F2' : '#EBEBEB',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: current >= i + 1 ? 'white' : '#89898B',
            fontSize: '12px', fontWeight: 700,
            transition: 'background 0.25s',
          }}>
            {current > i + 1 ? <SapIcon name="check" size={13} color="white" /> : i + 1}
          </div>
          <span style={{
            fontSize: '12px', fontWeight: current === i + 1 ? 600 : 400,
            color: current === i + 1 ? '#0070F2' : current > i + 1 ? '#107E3E' : '#89898B',
            whiteSpace: 'nowrap',
          }}>
            {step}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div style={{
            flex: 1, height: '1px', margin: '0 10px',
            background: current > i + 1 ? '#107E3E' : '#D9D9D9',
            transition: 'background 0.25s',
          }} />
        )}
      </div>
    ))}
  </div>
);

// ===== SAP ALERT BANNER =====
export const SapAlert = ({ type = 'information', message, action, actionLabel, onDismiss }) => {
  const cfg = {
    information: { bg: '#E8F3FF', border: '#0070F2', color: '#0057B8', icon: 'alert' },
    success:     { bg: '#F1F8F1', border: '#107E3E', color: '#107E3E', icon: 'check' },
    warning:     { bg: '#FEF3E6', border: '#E76500', color: '#AD4E00', icon: 'alert' },
    error:       { bg: '#FFF0F0', border: '#BB0000', color: '#BB0000', icon: 'alert' },
  }[type] || {};
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '11px 16px',
      background: cfg.bg,
      borderLeft: `4px solid ${cfg.border}`,
      borderRadius: '0 4px 4px 0',
      marginBottom: '12px',
      animation: 'sap-slide-up 0.2s ease both',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <SapIcon name={cfg.icon} size={16} color={cfg.color} />
        <span style={{ fontSize: '13px', fontWeight: 500, color: cfg.color }}>{message}</span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {action && (
          <button onClick={action} style={{ fontSize: '12px', color: cfg.color, background: 'none', border: `1px solid ${cfg.border}`, borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontWeight: 500 }}>
            {actionLabel}
          </button>
        )}
        {onDismiss && (
          <button onClick={onDismiss} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}>
            <SapIcon name="close" size={14} color={cfg.color} />
          </button>
        )}
      </div>
    </div>
  );
};

// ===== SAP EMPLOYEE CARD (Grid view) =====
export const SapEmployeeCard = ({ employee, onClick, showSalary = false }) => {
  const [hovered, setHovered] = useState(false);
  const { first, last, role, department, matricule, status, contract, seniority, phone, speciality } = employee;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white', borderRadius: '4px',
        border: `1px solid ${hovered ? '#0070F2' : '#D9D9D9'}`,
        overflow: 'hidden', cursor: 'pointer',
        boxShadow: hovered ? '0 4px 16px rgba(0,112,242,0.12)' : '0 1px 4px rgba(0,0,0,0.08)',
        transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Card accent bar */}
      <div style={{ height: '4px', background: hovered ? '#0070F2' : '#1B3A52', transition: 'background 0.18s' }} />

      <div style={{ padding: '18px 18px 14px' }}>
        {/* Header */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
          <SapAvatar first={first} last={last} size={54} status={status} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#32363A', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {first} {last}
            </div>
            <div style={{ fontSize: '12px', color: '#6A6D70', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {role}
            </div>
            <SapBadge status={status} size="sm" />
          </div>
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
          {[
            { icon: 'building', value: department || speciality },
            { icon: 'phone', value: phone },
            { icon: 'briefcase', value: contract ? `${contract}${seniority ? ` · ${seniority} an${seniority > 1 ? 's' : ''}` : ''}` : undefined },
          ].filter(x => x.value).map(item => (
            <div key={item.icon} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#515456' }}>
              <SapIcon name={item.icon} size={12} color="#89898B" />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          paddingTop: '10px', borderTop: '1px solid #EBEBEB',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '11px', color: '#89898B', fontFamily: 'monospace' }}>{matricule}</span>
          <span style={{
            fontSize: '11px', fontWeight: 600, color: '#0070F2',
            padding: '3px 8px', background: '#E8F3FF', borderRadius: '3px',
          }}>
            Ouvrir →
          </span>
        </div>
      </div>
    </div>
  );
};

export default {
  F, SapIcon, SapAvatar, SapBadge, SapButton, SapInput, SapSelect, SapTextarea,
  SapField, SapPanel, SapModal, SapTable, SapKpi, SapSection, SapInfoRow, SapCard,
  SapProgress, SapTimeline, SapStars, SapSearchBar, SapTabBar, SapStepper,
  SapAlert, SapEmployeeCard,
  getAvatarStyle, getInitials,
};
