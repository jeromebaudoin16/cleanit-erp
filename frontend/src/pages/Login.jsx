import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import loginIllustration from '../assets/login-illustration.png';

const DEMO = [
  { email:'jerome@cleanit.cm',  password:'Jerome123!',  role:'DG',          color:'#E05C5C', initials:'JB' },
  { email:'finance@cleanit.cm', password:'Finance123!', role:'Comptable',    color:'#888',    initials:'AF' },
  { email:'chef@cleanit.cm',    password:'Chef123!',    role:'Chef Projet',  color:'#E05C5C', initials:'PE' },
  { email:'terrain@cleanit.cm', password:'Terrain123!', role:'Terrain',      color:'#888',    initials:'TN' },
  { email:'hr@cleanit.cm',      password:'HR123!',      role:'RH',           color:'#E05C5C', initials:'CR' },
  { email:'admin@cleanit.cm',   password:'Admin123!',   role:'Admin',        color:'#888',    initials:'AD' },
];

const CleanITLogo = () => (
  <svg width="118" height="30" viewBox="0 0 128 32" fill="none">
    <circle cx="16" cy="16" r="11" stroke="#999" strokeWidth="1.3" fill="none"/>
    <circle cx="16" cy="6"  r="2.2" fill="#E05C5C"/>
    <circle cx="7"  cy="21" r="2.2" fill="#E05C5C"/>
    <circle cx="25" cy="21" r="2.2" fill="#E05C5C"/>
    <line x1="16" y1="8"  x2="9"    y2="19.5" stroke="#ddd" strokeWidth="1.1"/>
    <line x1="16" y1="8"  x2="23"   y2="19.5" stroke="#ddd" strokeWidth="1.1"/>
    <line x1="9.5" y1="21" x2="22.5" y2="21"  stroke="#ddd" strokeWidth="1.1"/>
    <text x="34" y="22" fontFamily="'Inter','Segoe UI',Arial,sans-serif" fontSize="16" fontWeight="700" fill="#999">CLEAN</text>
    <text x="88" y="22" fontFamily="'Inter','Segoe UI',Arial,sans-serif" fontSize="16" fontWeight="700" fill="#E05C5C">IT</text>
  </svg>
);

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState('');
  const [showAll, setShowAll] = useState(false);

  const submit = async e => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      nav('/dashboard');
    } catch { setError('Email ou mot de passe incorrect.'); }
    finally { setLoading(false); }
  };

  const loginAs = async acc => {
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', { email: acc.email, password: acc.password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      nav('/dashboard');
    } catch { setError('Compte non disponible.'); setLoading(false); }
  };

  const visibleDemo = showAll ? DEMO : DEMO.slice(0, 3);

  const inputStyle = k => ({
    width: '100%', padding: '8px 0', border: 'none', outline: 'none',
    borderBottom: focused === k ? '1.5px solid #E05C5C' : '1.5px solid #eee',
    fontSize: 13, background: 'transparent', color: '#333',
    boxSizing: 'border-box', transition: 'border-color .2s',
    fontFamily: "'Inter','Segoe UI',Arial,sans-serif",
  });

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr',
      fontFamily: "'Inter','Segoe UI',Arial,sans-serif", background: '#fff',
    }}>

      {/* ── GAUCHE — illustration sans cadre ── */}
      <div style={{
        background: '#fff', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 32,
      }}>
        <img
          src={loginIllustration}
          alt="CleanIT"
          style={{
            maxWidth: '100%', maxHeight: '80vh',
            objectFit: 'contain', display: 'block',
          }}
        />
      </div>

      {/* ── DROITE — formulaire ── */}
      <div style={{
        background: '#fff', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '48px 52px',
        borderLeft: '1px solid #f5f5f5',
      }}>

        {/* Logo */}
        <div style={{ marginBottom: 36 }}><CleanITLogo/></div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 5px', letterSpacing: '-.3px' }}>
          Connexion
        </h1>
        <p style={{ fontSize: 12, color: '#aaa', margin: '0 0 28px', lineHeight: 1.6 }}>
          Bienvenue. Entrez vos identifiants<br/>pour accéder à votre espace.
        </p>

        {error && (
          <div style={{ background: '#fff5f5', border: '1px solid #ffd5d5', borderRadius: 7, padding: '9px 12px', color: '#E05C5C', fontSize: 12, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: focused === 'email' ? '#E05C5C' : '#bbb', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 5 }}>
              Email
            </div>
            <input
              type="email" value={form.email} required
              onChange={e => setForm({ ...form, email: e.target.value })}
              onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
              placeholder="votre@cleanit.cm"
              style={inputStyle('email')}
            />
          </div>

          <div style={{ marginBottom: 26 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: focused === 'pwd' ? '#E05C5C' : '#bbb', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 5 }}>
              Mot de passe
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} value={form.password} required
                onChange={e => setForm({ ...form, password: e.target.value })}
                onFocus={() => setFocused('pwd')} onBlur={() => setFocused('')}
                placeholder="••••••••"
                style={inputStyle('pwd')}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: 10, color: '#ccc', cursor: 'pointer', fontFamily: 'inherit' }}>
                {showPass ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: 12, borderRadius: 8, border: 'none', background: '#E05C5C', color: '#fff', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, fontFamily: 'inherit', marginBottom: 20 }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Séparateur démo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 1, background: '#f4f4f4' }}/>
          <span style={{ fontSize: 9, color: '#ddd', letterSpacing: .6, textTransform: 'uppercase' }}>accès démo</span>
          <div style={{ flex: 1, height: 1, background: '#f4f4f4' }}/>
        </div>

        <div>
          {visibleDemo.map(u => (
            <button key={u.email} onClick={() => loginAs(u)} disabled={loading}
              style={{ width: '100%', textAlign: 'left', padding: '8px 10px', border: '1px solid #f0f0f0', borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5, fontFamily: 'inherit', transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: u.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 7, fontWeight: 700, flexShrink: 0 }}>
                {u.initials}
              </div>
              <span style={{ flex: 1, fontSize: 11, color: '#555' }}>{u.email.split('@')[0]}</span>
              <span style={{ fontSize: 9, color: u.color, fontWeight: 700 }}>{u.role}</span>
            </button>
          ))}
          <div style={{ textAlign: 'center', marginTop: 6 }}>
            <button onClick={() => setShowAll(!showAll)}
              style={{ background: 'none', border: 'none', fontSize: 10, color: '#ccc', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => e.target.style.color = '#E05C5C'}
              onMouseLeave={e => e.target.style.color = '#ccc'}>
              {showAll ? '− réduire' : '+ voir tous les comptes'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
