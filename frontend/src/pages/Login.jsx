import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import loginIllustration from '../assets/login-illustration.png';

const DEMO = [
  { email:'admin@cleanit.cm', password:'Admin123!', role:'Administrateur', color:'#4f8ef7' },
  { email:'jerome@cleanit.cm', password:'Jerome123!', role:'Admin', color:'#4f8ef7' },
  { email:'pm@cleanit.cm', password:'PM123!', role:'PM', color:'#34c97e' },
  { email:'tech@cleanit.cm', password:'Tech123!', role:'Tech', color:'#f59e0b' },
];

export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email:'admin@cleanit.cm', password:'Admin123!' });
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

  const inputStyle = k => ({
    width:'100%', padding:'10px 0', border:'none',
    borderBottom: focused===k ? '2px solid #4f8ef7' : '1.5px solid #e2e8f0',
    fontSize:15, outline:'none', background:'transparent', color:'#0f172a'
  });

  return (
    <div style={{minHeight:'100vh', display:'flex', background:'#fff', fontFamily:"'Segoe UI',Arial,sans-serif"}}>
      
      {/* GAUCHE */}
      <div style={{width:440, padding:'48px 44px', display:'flex', flexDirection:'column', justifyContent:'center'}}>
        {/* Logo bien placé */}
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:44}}>
          <div style={{width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#4f8ef7,#6ea8fe)', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <div style={{fontSize:17, fontWeight:900, color:'#0f1b2d', letterSpacing:'-.3px'}}>CleanIT ERP</div>
        </div>

        <h1 style={{fontSize:26, fontWeight:800, color:'#0f172a', margin:'0 0 8px', lineHeight:1.25}}>Prêt à gérer<br/>votre réseau télécom ?</h1>
        <p style={{fontSize:13, color:'#64748b', margin:'0 0 32px'}}>Connectez-vous à votre espace</p>

        {error && <div style={{background:'#fef2f2', padding:'10px', borderRadius:8, color:'#dc2626', fontSize:13, marginBottom:16}}>{error}</div>}

        <form onSubmit={submit}>
          <div style={{marginBottom:24}}>
            <label style={{fontSize:11, fontWeight:700, color:focused==='email'?'#4f8ef7':'#94a3b8', textTransform:'uppercase', letterSpacing:.8}}>Email</label>
            <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} onFocus={()=>setFocused('email')} onBlur={()=>setFocused('')} style={inputStyle('email')} />
          </div>
          <div style={{marginBottom:32}}>
            <label style={{fontSize:11, fontWeight:700, color:focused==='pwd'?'#4f8ef7':'#94a3b8', textTransform:'uppercase', letterSpacing:.8}}>Mot de passe</label>
            <div style={{position:'relative'}}>
              <input type={showPass?'text':'password'} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onFocus={()=>setFocused('pwd')} onBlur={()=>setFocused('')} style={inputStyle('pwd')} />
              <button type="button" onClick={()=>setShowPass(!showPass)} style={{position:'absolute', right:0, top:8, background:'none', border:'none', color:'#94a3b8', fontSize:12, cursor:'pointer'}}>{showPass?'Masquer':'Afficher'}</button>
            </div>
          </div>
          <button disabled={loading} style={{width:'100%', padding:'12px', borderRadius:24, border:'none', background:'#4f8ef7', color:'#fff', fontWeight:700, cursor:'pointer'}}>{loading?'Connexion...':'Se connecter →'}</button>
        </form>

        <div style={{display:'flex', alignItems:'center', gap:8, margin:'24px 0 12px'}}><div style={{flex:1,height:1,background:'#f1f5f9'}}/><span style={{fontSize:11,color:'#cbd5e1'}}>Démo</span><div style={{flex:1,height:1,background:'#f1f5f9'}}/></div>
        {DEMO.map(u=><button key={u.email} onClick={()=>setForm({email:u.email,password:u.password})} style={{width:'100%', textAlign:'left', padding:'8px 10px', marginBottom:6, border:'1px solid #f1f5f9', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:12}}>{u.email} <span style={{float:'right', color:u.color, fontSize:10}}>{u.role}</span></button>)}
      </div>

      {/* DROITE - IMAGE GRANDE COLLÉE */}
      <div style={{flex:1, background:'#fafbff', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <img src={loginIllustration} alt="login" style={{width:'100%', height:'100%', objectFit:'contain', maxHeight:'100vh'}} />
      </div>
    </div>
  );
}
