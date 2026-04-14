import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const DEMO = [
  { email:'admin@cleanit.cm', password:'Admin123!', role:'Administrateur', color:'#4f8ef7' },
  { email:'jerome@cleanit.cm', password:'Jerome123!', role:'Admin (Jérôme Bell)', color:'#4f8ef7' },
  { email:'pm@cleanit.cm', password:'PM123!', role:'Project Manager', color:'#34c97e' },
  { email:'tech@cleanit.cm', password:'Tech123!', role:'Technicien', color:'#f59e0b' },
];

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email:'admin@cleanit.cm', password:'Admin123!' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      nav('/dashboard');
    } catch { setError('Email ou mot de passe incorrect. Vérifiez vos identifiants.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh', display:'flex', fontFamily:"'Segoe UI', Arial, sans-serif"}}>

      {/* LEFT — Branding */}
      <div style={{flex:1, background:'linear-gradient(135deg, #0f1b2d 0%, #162032 50%, #1a2a45 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:48, position:'relative', overflow:'hidden'}}>

        {/* Background pattern */}
        <div style={{position:'absolute', inset:0, opacity:0.03}}>
          {Array.from({length:20}).map((_,i) => (
            <div key={i} style={{position:'absolute', width: 200+i*30, height: 200+i*30, borderRadius:'50%', border:'1px solid white', top:'50%', left:'50%', transform:'translate(-50%,-50%)'}} />
          ))}
        </div>

        <div style={{position:'relative', textAlign:'center', maxWidth:400}}>
          {/* Logo */}
          <div style={{width:80, height:80, borderRadius:20, background:'linear-gradient(135deg,#4f8ef7,#6ea8fe)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', boxShadow:'0 12px 40px rgba(79,142,247,0.4)'}}>
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>

          <h1 style={{fontSize:36, fontWeight:900, color:'white', margin:'0 0 8px', letterSpacing:'-1px'}}>CleanIT ERP</h1>
          <p style={{fontSize:15, color:'#4f8ef7', fontWeight:600, marginBottom:16}}>ERP Télécom · Huawei Partner Cameroun</p>
          <p style={{fontSize:13, color:'#64748b', lineHeight:1.7, marginBottom:40}}>
            Plateforme de gestion intégrée pour les opérations télécom, la gestion des sites, des interventions et des approbations financières.
          </p>

          {/* Features */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, textAlign:'left'}}>
            {[
              {icon:'📡', label:'Gestion des Sites'},
              {icon:'🔧', label:'Interventions Terrain'},
              {icon:'📦', label:'Inventaire OEM Huawei'},
              {icon:'✅', label:'Workflow Approvals'},
              {icon:'💰', label:'Finance & Paiements'},
              {icon:'🤖', label:'Agent IA Intégré'},
            ].map(f => (
              <div key={f.label} style={{display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)'}}>
                <span style={{fontSize:16}}>{f.icon}</span>
                <span style={{fontSize:12, color:'#94a3b8', fontWeight:500}}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Login Form */}
      <div style={{width:480, background:'#f8fafc', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:48}}>

        <div style={{width:'100%', maxWidth:380}}>

          {/* Header */}
          <div style={{marginBottom:32}}>
            <h2 style={{fontSize:26, fontWeight:800, color:'#0f1b2d', margin:'0 0 6px', letterSpacing:'-0.5px'}}>Connexion</h2>
            <p style={{fontSize:13, color:'#64748b', margin:0}}>Accédez à votre espace de travail CleanIT</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, padding:'10px 14px', marginBottom:16, color:'#dc2626', fontSize:13, display:'flex', gap:8, alignItems:'center'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit}>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px'}}>Adresse Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email:e.target.value}))} required placeholder="votre@email.com"
                style={{width:'100%', padding:'11px 14px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box', background:'white', color:'#1e293b', transition:'border-color .2s'}}
                onFocus={e => e.target.style.borderColor='#4f8ef7'}
                onBlur={e => e.target.style.borderColor='#e2e8f0'} />
            </div>

            <div style={{marginBottom:24}}>
              <label style={{fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px'}}>Mot de passe</label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({...p, password:e.target.value}))} required placeholder="••••••••"
                style={{width:'100%', padding:'11px 14px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box', background:'white', color:'#1e293b', transition:'border-color .2s'}}
                onFocus={e => e.target.style.borderColor='#4f8ef7'}
                onBlur={e => e.target.style.borderColor='#e2e8f0'} />
            </div>

            <button type="submit" disabled={loading}
              style={{width:'100%', padding:'13px', borderRadius:8, border:'none', background: loading?'#94a3b8':'linear-gradient(135deg,#4f8ef7,#6ea8fe)', color:'white', fontSize:15, fontWeight:700, cursor: loading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow: loading?'none':'0 4px 16px rgba(79,142,247,0.35)', transition:'all .2s'}}>
              {loading
                ? <><div style={{width:18, height:18, borderRadius:'50%', border:'2px solid white', borderTopColor:'transparent', animation:'spin 1s linear infinite'}} />Connexion...</>
                : 'Se connecter →'
              }
            </button>
          </form>

          {/* Divider */}
          <div style={{display:'flex', alignItems:'center', gap:12, margin:'24px 0'}}>
            <div style={{flex:1, height:1, background:'#e2e8f0'}} />
            <span style={{fontSize:12, color:'#94a3b8', fontWeight:500}}>Comptes de démonstration</span>
            <div style={{flex:1, height:1, background:'#e2e8f0'}} />
          </div>

          {/* Demo accounts */}
          <div style={{display:'flex', flexDirection:'column', gap:6}}>
            {DEMO.map(u => (
              <button key={u.email} onClick={() => setForm({email:u.email, password:u.password})}
                style={{padding:'9px 14px', borderRadius:8, border:'1px solid #e2e8f0', background:'white', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', transition:'all .15s'}}
                onMouseEnter={e => {e.currentTarget.style.borderColor=u.color; e.currentTarget.style.background=`${u.color}08`;}}
                onMouseLeave={e => {e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.background='white';}}>
                <div style={{textAlign:'left'}}>
                  <div style={{fontSize:12, fontWeight:700, color:'#1e293b'}}>{u.email}</div>
                  <div style={{fontSize:11, color:'#94a3b8', marginTop:1}}>{u.password}</div>
                </div>
                <span style={{padding:'2px 8px', borderRadius:10, fontSize:10, fontWeight:700, background:`${u.color}15`, color:u.color}}>{u.role}</span>
              </button>
            ))}
          </div>

          <p style={{textAlign:'center', color:'#94a3b8', fontSize:11, marginTop:24}}>
            © 2026 CleanIT ERP · Huawei Partner Cameroun
          </p>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
