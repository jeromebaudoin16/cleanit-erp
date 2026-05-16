import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import loginIllustration from '../assets/login-illustration.png';

const DEMO = [
  { email:'jerome@cleanit.cm',  password:'Jerome123!',  role:'DG',           label:'Directeur Général', color:'#0052CC', initials:'JB' },
  { email:'finance@cleanit.cm', password:'Finance123!', role:'Comptable',     label:'Comptable',         color:'#006644', initials:'AF' },
  { email:'chef@cleanit.cm',    password:'Chef123!',    role:'Chef Projet',   label:'Chef de Projet',    color:'#403294', initials:'PE' },
  { email:'terrain@cleanit.cm', password:'Terrain123!', role:'Chef Terrain',  label:'Chef Terrain',      color:'#00626E', initials:'TN' },
  { email:'hr@cleanit.cm',      password:'HR123!',      role:'RH',            label:'Responsable RH',    color:'#974F0C', initials:'CR' },
  { email:'admin@cleanit.cm',   password:'Admin123!',   role:'Admin',         label:'Admin Système',     color:'#555',    initials:'AD' },
];

const CSS = `
  @keyframes floatIllus {
    0%,100%{ transform:translateY(0px) rotate(0deg); }
    33%     { transform:translateY(-14px) rotate(.7deg); }
    66%     { transform:translateY(-7px) rotate(-.4deg); }
  }
  @keyframes floatCard {
    0%,100%{ transform:translateY(-50%) translateX(0px); }
    50%     { transform:translateY(calc(-50% - 5px)) translateX(0px); }
  }
  @keyframes floatBadge {
    0%,100%{ transform:translateX(-50%) translateY(0px); }
    50%     { transform:translateX(-50%) translateY(-5px); }
  }
  @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
  @keyframes shimmer {
    0%,100%{opacity:.1;transform:scale(1)}
    50%{opacity:.22;transform:scale(1.06)}
  }
  @keyframes fadeUp {
    from{opacity:0;transform:translateY(12px) translateX(-50%)}
    to{opacity:1;transform:translateY(0px) translateX(-50%)}
  }
  .demo-row:hover{ background:rgba(255,255,255,.65) !important; transform:translateX(2px); }
  .submit-btn:hover{ background:#003fa3 !important; }
  .submit-btn:active{ transform:scale(.98); }
`;

// Logo CleanIT SVG
const CleanITLogo = ({ size = 32 }) => (
  <svg width={size * 3.2} height={size} viewBox="0 0 128 40" fill="none">
    {/* Cercle réseau */}
    <circle cx="20" cy="20" r="14" stroke="#888" strokeWidth="1.6" fill="none"/>
    {/* Nœuds */}
    <circle cx="20" cy="7"  r="3" fill="#E05C5C"/>
    <circle cx="9"  cy="27" r="3" fill="#E05C5C"/>
    <circle cx="31" cy="27" r="3" fill="#E05C5C"/>
    {/* Lignes de connexion */}
    <line x1="20" y1="10" x2="11" y2="25" stroke="#bbb" strokeWidth="1.2"/>
    <line x1="20" y1="10" x2="29" y2="25" stroke="#bbb" strokeWidth="1.2"/>
    <line x1="12" y1="27" x2="28" y2="27" stroke="#bbb" strokeWidth="1.2"/>
    {/* Texte CLEAN */}
    <text x="42" y="27" fontFamily="'Segoe UI',Arial,sans-serif" fontSize="18" fontWeight="700" fill="#888" letterSpacing=".5">CLEAN</text>
    {/* Texte IT */}
    <text x="100" y="27" fontFamily="'Segoe UI',Arial,sans-serif" fontSize="18" fontWeight="700" fill="#E05C5C" letterSpacing=".5">IT</text>
  </svg>
);

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email:'jerome@cleanit.cm', password:'Jerome123!' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState('');

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
      const res = await api.post('/auth/login', { email:acc.email, password:acc.password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      nav('/dashboard');
    } catch { setError('Compte non disponible.'); setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh', position:'relative', overflow:'hidden', fontFamily:"'Inter','Segoe UI',Arial,sans-serif", background:'linear-gradient(145deg,#eef3ff,#f5f0ff,#fdf8ff)'}}>
      <style>{CSS}</style>

      {/* ── ILLUSTRATION PLEIN ÉCRAN ──────────────────────────── */}
      <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center'}}>
        <div style={{animation:'floatIllus 6s ease-in-out infinite', maxWidth:650, width:'75%'}}>
          <img
            src={loginIllustration}
            alt="CleanIT illustration"
            style={{width:'100%', height:'auto', objectFit:'contain', filter:'drop-shadow(0 24px 48px rgba(79,142,247,.12))'}}
          />
        </div>
      </div>

      {/* Cercles décoratifs */}
      <div style={{position:'absolute', top:'8%',  right:'12%', width:180, height:180, borderRadius:'50%', background:'rgba(79,142,247,.07)', animation:'shimmer 4s ease-in-out infinite', pointerEvents:'none'}}/>
      <div style={{position:'absolute', bottom:'12%', left:'8%',  width:120, height:120, borderRadius:'50%', background:'rgba(64,50,148,.05)', animation:'shimmer 5s ease-in-out 1.5s infinite', pointerEvents:'none'}}/>
      <div style={{position:'absolute', top:'45%',  left:'4%',  width:80,  height:80,  borderRadius:'50%', background:'rgba(0,82,204,.04)', animation:'shimmer 3.5s ease-in-out 2.5s infinite', pointerEvents:'none'}}/>

      {/* Points flottants */}
      {[{t:'18%',l:'14%',s:8,c:'#4f8ef7',d:'0s'},{t:'70%',r:'14%',s:6,c:'#403294',d:'.6s'},{t:'35%',l:'6%',s:9,c:'#0052CC',d:'1.2s'},{t:'80%',l:'35%',s:5,c:'#6ea8fe',d:'1.8s'}].map((p,i)=>(
        <div key={i} style={{position:'absolute', top:p.t, left:p.l, right:p.r, width:p.s, height:p.s, borderRadius:'50%', background:p.c, animation:`pulse 3s ${p.d} ease-in-out infinite`, opacity:.4, pointerEvents:'none'}}/>
      ))}

      {/* ── FORMULAIRE FLOTTANT (droite) ──────────────────────── */}
      <div style={{position:'absolute', top:'50%', right:'4%', transform:'translateY(-50%)', animation:'floatCard 5s ease-in-out infinite', zIndex:10}}>
        <div style={{
          background:'rgba(255,255,255,.88)',
          backdropFilter:'blur(20px)',
          WebkitBackdropFilter:'blur(20px)',
          borderRadius:20,
          padding:'26px 24px',
          width:268,
          boxShadow:'0 8px 40px rgba(0,82,204,.14), 0 2px 12px rgba(0,0,0,.07)',
          border:'1px solid rgba(255,255,255,.92)',
        }}>
          {/* Logo */}
          <div style={{marginBottom:18}}>
            <CleanITLogo size={28}/>
          </div>

          <div style={{fontSize:13, fontWeight:800, color:'#0f172a', marginBottom:2}}>Connexion</div>
          <div style={{fontSize:11, color:'#94a3b8', marginBottom:18}}>Accédez à votre espace</div>

          {error && <div style={{background:'#fef2f2', padding:'8px 10px', borderRadius:7, color:'#dc2626', fontSize:11, marginBottom:12, border:'1px solid #fecaca'}}>{error}</div>}

          <form onSubmit={submit}>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:9, fontWeight:700, color:focused==='email'?'#0052CC':'#94a3b8', textTransform:'uppercase', letterSpacing:.9, display:'block', marginBottom:3}}>Email</label>
              <input
                type="email" value={form.email}
                onChange={e=>setForm({...form,email:e.target.value})}
                onFocus={()=>setFocused('email')} onBlur={()=>setFocused('')}
                placeholder="votre@cleanit.cm"
                style={{width:'100%', padding:'8px 0', border:'none', borderBottom:focused==='email'?'2px solid #0052CC':'1.5px solid #e2e8f0', fontSize:12, outline:'none', background:'transparent', color:'#0f172a', boxSizing:'border-box', transition:'border-color .2s'}}
              />
            </div>
            <div style={{marginBottom:18}}>
              <label style={{fontSize:9, fontWeight:700, color:focused==='pwd'?'#0052CC':'#94a3b8', textTransform:'uppercase', letterSpacing:.9, display:'block', marginBottom:3}}>Mot de passe</label>
              <div style={{position:'relative'}}>
                <input
                  type={showPass?'text':'password'} value={form.password}
                  onChange={e=>setForm({...form,password:e.target.value})}
                  onFocus={()=>setFocused('pwd')} onBlur={()=>setFocused('')}
                  placeholder="••••••••"
                  style={{width:'100%', padding:'8px 0', border:'none', borderBottom:focused==='pwd'?'2px solid #0052CC':'1.5px solid #e2e8f0', fontSize:12, outline:'none', background:'transparent', color:'#0f172a', boxSizing:'border-box', transition:'border-color .2s'}}
                />
                <button type="button" onClick={()=>setShowPass(!showPass)}
                  style={{position:'absolute', right:0, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#94a3b8', fontSize:10, cursor:'pointer', fontFamily:'inherit'}}>
                  {showPass?'Masquer':'Afficher'}
                </button>
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}
              style={{width:'100%', padding:'10px', borderRadius:20, border:'none', background:'#0052CC', color:'#fff', fontWeight:700, fontSize:12, cursor:loading?'not-allowed':'pointer', transition:'all .2s', opacity:loading?.7:1, fontFamily:'inherit'}}>
              {loading?'Connexion...':'Se connecter →'}
            </button>
          </form>

          {/* Séparateur */}
          <div style={{display:'flex', alignItems:'center', gap:7, margin:'14px 0 10px'}}>
            <div style={{flex:1, height:1, background:'rgba(0,0,0,.07)'}}/>
            <span style={{fontSize:9, color:'#cbd5e1', letterSpacing:.6, textTransform:'uppercase'}}>Accès rapide</span>
            <div style={{flex:1, height:1, background:'rgba(0,0,0,.07)'}}/>
          </div>

          {/* Comptes démo */}
          <div style={{display:'flex', flexDirection:'column', gap:4}}>
            {DEMO.map(u=>(
              <button key={u.email} className="demo-row" onClick={()=>loginAs(u)} disabled={loading}
                style={{width:'100%', textAlign:'left', padding:'5px 7px', border:'none', borderRadius:7, background:'rgba(255,255,255,.45)', cursor:'pointer', display:'flex', alignItems:'center', gap:7, transition:'all .15s', fontFamily:'inherit'}}>
                <div style={{width:18, height:18, borderRadius:'50%', background:u.color, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:8, fontWeight:800, flexShrink:0}}>
                  {u.initials}
                </div>
                <span style={{flex:1, fontSize:10, color:'#374151'}}>{u.email.split('@')[0]}</span>
                <span style={{fontSize:9, color:u.color, fontWeight:700}}>{u.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Badge "Système en ligne" */}
      <div style={{position:'absolute', bottom:'5%', left:'50%', animation:'floatBadge 7s ease-in-out 1s infinite', zIndex:10}}>
        <div style={{background:'rgba(255,255,255,.9)', borderRadius:20, padding:'7px 16px', boxShadow:'0 4px 16px rgba(0,0,0,.08)', display:'flex', alignItems:'center', gap:7, whiteSpace:'nowrap'}}>
          <div style={{width:7, height:7, borderRadius:'50%', background:'#22c55e', animation:'pulse 2s infinite'}}/>
          <span style={{fontSize:11, fontWeight:700, color:'#0f172a'}}>Système en ligne</span>
        </div>
      </div>
    </div>
  );
}
