import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import loginIllustration from '../assets/login-illustration.png';

const DEMO = [
  { email:'jerome@cleanit.cm',  password:'Jerome123!',  role:'DG',          color:'#E05C5C', initials:'JB' },
  { email:'finance@cleanit.cm', password:'Finance123!', role:'Comptable',    color:'#888',    initials:'AF' },
  { email:'chef@cleanit.cm',    password:'Chef123!',    role:'Chef Projet',  color:'#E05C5C', initials:'PE' },
  { email:'terrain@cleanit.cm', password:'Terrain123!', role:'Chef Terrain', color:'#888',    initials:'TN' },
  { email:'hr@cleanit.cm',      password:'HR123!',      role:'RH',           color:'#E05C5C', initials:'CR' },
  { email:'admin@cleanit.cm',   password:'Admin123!',   role:'Admin',        color:'#888',    initials:'AD' },
];

const CleanITLogo = () => (
  <svg width="130" height="36" viewBox="0 0 140 38" fill="none">
    <circle cx="19" cy="19" r="14" stroke="#888" strokeWidth="1.6" fill="none"/>
    <circle cx="19" cy="6.5" r="3"  fill="#E05C5C"/>
    <circle cx="8"  cy="26" r="3"   fill="#E05C5C"/>
    <circle cx="30" cy="26" r="3"   fill="#E05C5C"/>
    <line x1="19" y1="9.5" x2="10" y2="23.5" stroke="#ccc" strokeWidth="1.3"/>
    <line x1="19" y1="9.5" x2="28" y2="23.5" stroke="#ccc" strokeWidth="1.3"/>
    <line x1="11" y1="26"  x2="27" y2="26"   stroke="#ccc" strokeWidth="1.3"/>
    <text x="42" y="27" fontFamily="'Inter','Segoe UI',Arial,sans-serif" fontSize="19" fontWeight="700" fill="#888">CLEAN</text>
    <text x="103" y="27" fontFamily="'Inter','Segoe UI',Arial,sans-serif" fontSize="19" fontWeight="700" fill="#E05C5C">IT</text>
  </svg>
);

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState('');
  const [showDemo, setShowDemo] = useState(false);

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

  const inp = focused_key => ({
    width: '100%',
    padding: '10px 0',
    border: 'none',
    borderBottom: focused === focused_key ? '2px solid #E05C5C' : '1.5px solid #e8e8e8',
    fontSize: 14,
    outline: 'none',
    background: 'transparent',
    color: '#444',
    boxSizing: 'border-box',
    transition: 'border-color .2s',
    fontFamily: "'Inter','Segoe UI',Arial,sans-serif",
  });

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      fontFamily: "'Inter','Segoe UI',Arial,sans-serif",
      background: '#fff',
    }}>

      {/* ── GAUCHE — Illustration ──────────────────────────── */}
      <div style={{ overflow: 'hidden', background: '#fff' }}>
        <img
          src={loginIllustration}
          alt="CleanIT ERP"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />
      </div>

      {/* ── DROITE — Formulaire ────────────────────────────── */}
      <div style={{
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 56px',
        borderLeft: '1px solid #f0f0f0',
      }}>

        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <CleanITLogo/>
        </div>

        {/* Titre */}
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#888', margin: '0 0 6px', lineHeight: 1.2 }}>
          Connexion
        </h1>
        <p style={{ fontSize: 13, color: '#E05C5C', margin: '0 0 36px', fontWeight: 500 }}>
          Accédez à votre espace de travail
        </p>

        {/* Erreur */}
        {error && (
          <div style={{ background: '#fff5f5', padding: '10px 14px', borderRadius: 8, color: '#E05C5C', fontSize: 13, marginBottom: 20, border: '1px solid #ffd5d5' }}>
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          {/* Email */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: focused === 'email' ? '#E05C5C' : '#aaa', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>
              Email
            </label>
            <input
              type="email" value={form.email} required
              onChange={e => setForm({ ...form, email: e.target.value })}
              onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
              placeholder="votre@cleanit.cm"
              style={inp('email')}
            />
          </div>

          {/* Mot de passe */}
          <div style={{ marginBottom: 36 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: focused === 'pwd' ? '#E05C5C' : '#aaa', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} value={form.password} required
                onChange={e => setForm({ ...form, password: e.target.value })}
                onFocus={() => setFocused('pwd')} onBlur={() => setFocused('')}
                placeholder="••••••••"
                style={inp('pwd')}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#aaa', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                {showPass ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>

          {/* Bouton */}
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '13px', borderRadius: 28, border: 'none', background: '#E05C5C', color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .2s', opacity: loading ? .7 : 1, fontFamily: 'inherit', letterSpacing: '.2px' }}>
            {loading ? 'Connexion...' : 'Se connecter →'}
          </button>
        </form>

        {/* Accès démo */}
        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <button onClick={() => setShowDemo(!showDemo)}
            style={{ background: 'none', border: 'none', fontSize: 11, color: '#ccc', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', transition: 'color .2s' }}
            onMouseEnter={e => e.target.style.color = '#E05C5C'}
            onMouseLeave={e => e.target.style.color = '#ccc'}>
            {showDemo ? 'Masquer les comptes démo ›' : 'Accès démo ›'}
          </button>

          {showDemo && (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {DEMO.map(u => (
                <button key={u.email} onClick={() => loginAs(u)} disabled={loading}
                  style={{ width: '100%', textAlign: 'left', padding: '8px 12px', border: '1px solid #f5f5f5', borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all .15s', fontFamily: 'inherit' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: u.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 8, fontWeight: 800, flexShrink: 0 }}>
                    {u.initials}
                  </div>
                  <span style={{ flex: 1, fontSize: 11, color: '#666' }}>{u.email.split('@')[0]}</span>
                  <span style={{ fontSize: 10, color: u.color, fontWeight: 700 }}>{u.role}</span>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
