import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: 'admin@cleanit.cm', password: 'Admin123!' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(true);

  const submit = async e => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', form);
      const store = remember ? localStorage : sessionStorage;
      store.setItem('token', res.data.token);
      store.setItem('user', JSON.stringify(res.data.user));
      nav('/dashboard');
    } catch { setError('Email ou mot de passe incorrect'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0078d4 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:420 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:72, height:72, borderRadius:20, background:'linear-gradient(135deg,#0078d4,#00bcf2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:'0 8px 32px rgba(0,120,212,0.4)' }}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <h1 style={{ fontSize:28, fontWeight:800, color:'white', marginBottom:4, letterSpacing:'-0.5px' }}>CleanIT ERP</h1>
          <p style={{ color:'#93c5fd', fontSize:14 }}>ERP Télécom · Huawei Partner Cameroun</p>
        </div>

        {/* Card */}
        <div style={{ background:'white', borderRadius:20, padding:32, boxShadow:'0 24px 64px rgba(0,0,0,0.3)' }}>
          <h2 style={{ fontSize:20, fontWeight:700, color:'#1e293b', marginBottom:4 }}>Connexion</h2>
          <p style={{ color:'#64748b', fontSize:13, marginBottom:24 }}>Accédez à votre espace de travail</p>

          {error && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, padding:'10px 14px', marginBottom:16, color:'#dc2626', fontSize:13 }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={submit}>
            {[
              { label:'EMAIL', key:'email', type:'email', placeholder:'votre@email.com' },
              { label:'MOT DE PASSE', key:'password', type:'password', placeholder:'••••••••' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom:16 }}>
                <label style={{ fontSize:11, fontWeight:700, color:'#64748b', letterSpacing:'0.5px', display:'block', marginBottom:6 }}>{f.label}</label>
                <input
                  type={f.type} placeholder={f.placeholder} value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required
                  style={{ width:'100%', padding:'11px 14px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:14, outline:'none', boxSizing:'border-box', transition:'border-color .2s' }}
                  onFocus={e => e.target.style.borderColor='#0078d4'}
                  onBlur={e => e.target.style.borderColor='#e2e8f0'}
                />
              </div>
            ))}

            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24 }}>
              <input type="checkbox" id="rem" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ width:15, height:15, cursor:'pointer' }} />
              <label htmlFor="rem" style={{ fontSize:13, color:'#64748b', cursor:'pointer' }}>Se souvenir de moi</label>
            </div>

            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:'13px', borderRadius:10, border:'none', background: loading ? '#94a3b8' : 'linear-gradient(135deg,#0078d4,#00bcf2)', color:'white', fontSize:15, fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all .2s' }}>
              {loading
                ? <><div style={{ width:18, height:18, borderRadius:'50%', border:'2px solid white', borderTopColor:'transparent', animation:'spin 1s linear infinite' }} /> Connexion...</>
                : '→ Se connecter'
              }
            </button>
          </form>

          <div style={{ marginTop:20, padding:'12px 14px', background:'#f8fafc', borderRadius:10, border:'1px solid #f1f5f9' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px' }}>Comptes de démonstration</div>
            {[
              { email:'admin@cleanit.cm', pass:'Admin123!', role:'Administrateur' },
              { email:'jerome@cleanit.cm', pass:'Jerome123!', role:'Admin (Jérôme Bell)' },
              { email:'pm@cleanit.cm', pass:'PM123!', role:'Project Manager' },
              { email:'tech@cleanit.cm', pass:'Tech123!', role:'Technicien' },
            ].map(u => (
              <div key={u.email} onClick={() => setForm({ email: u.email, password: u.pass })}
                style={{ fontSize:12, color:'#374151', padding:'4px 0', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #f1f5f9' }}
                onMouseEnter={e => e.currentTarget.style.color='#0078d4'}
                onMouseLeave={e => e.currentTarget.style.color='#374151'}>
                <span><b>{u.email}</b> / {u.pass}</span>
                <span style={{ fontSize:10, color:'#94a3b8' }}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign:'center', color:'#475569', fontSize:12, marginTop:20 }}>
          © 2026 CleanIT ERP · Huawei Partner Cameroun
        </p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
