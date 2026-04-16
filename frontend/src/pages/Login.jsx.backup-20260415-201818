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
  const [showPass, setShowPass] = useState(false);

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

  return (
    <div style={{minHeight:'100vh', display:'flex', fontFamily:"'Segoe UI',Arial,sans-serif"}}>
      {/* LEFT */}
      <div style={{flex:1, background:'linear-gradient(135deg,#0f1b2d 0%,#1a2a45 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:48, position:'relative', overflow:'hidden'}}>
        <div style={{position:'absolute', inset:0, overflow:'hidden', opacity:0.04}}>
          {[200,300,400,500,600].map(s=><div key={s} style={{position:'absolute',width:s,height:s,borderRadius:'50%',border:'1px solid white',top:'50%',left:'50%',transform:'translate(-50%,-50%)'}} />)}
        </div>
        <div style={{position:'relative', textAlign:'center', maxWidth:420}}>
          <div style={{width:80,height:80,borderRadius:24,background:'linear-gradient(135deg,#4f8ef7,#6ea8fe)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 28px',boxShadow:'0 16px 48px rgba(79,142,247,0.35)'}}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <h1 style={{fontSize:38,fontWeight:900,color:'white',margin:'0 0 8px',letterSpacing:'-1px'}}>CleanIT ERP</h1>
          <p style={{fontSize:14,color:'#4f8ef7',fontWeight:600,marginBottom:12}}>Plateforme de Gestion Télécom</p>
          <p style={{fontSize:13,color:'#64748b',lineHeight:1.8,marginBottom:40}}>Gestion intégrée des opérations réseau, interventions terrain, inventaire et approbations financières.</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,textAlign:'left'}}>
            {[{icon:'📡','label':'Sites Réseau'},{icon:'🔧','label':'Interventions'},{icon:'📦','label':'Inventaire OEM'},{icon:'✅','label':'Approvals'},{icon:'💰','label':'Finance'},{icon:'🤖','label':'Agent IA'}].map(f=>(
              <div key={f.label} style={{display:'flex',alignItems:'center',gap:8,padding:'9px 12px',borderRadius:10,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)'}}>
                <span style={{fontSize:16}}>{f.icon}</span>
                <span style={{fontSize:12,color:'#94a3b8',fontWeight:500}}>{f.label}</span>
              </div>
            ))}
          </div>
          <div style={{marginTop:40,padding:'14px 20px',borderRadius:12,background:'rgba(79,142,247,0.1)',border:'1px solid rgba(79,142,247,0.2)'}}>
            <p style={{fontSize:12,color:'#4f8ef7',margin:0,fontWeight:500}}>🌍 Déployé sur Railway & Vercel · DB Neon PostgreSQL</p>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{width:500,background:'#f8fafc',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:48}}>
        <div style={{width:'100%',maxWidth:380}}>
          <div style={{marginBottom:32}}>
            <h2 style={{fontSize:28,fontWeight:800,color:'#0f1b2d',margin:'0 0 6px',letterSpacing:'-0.5px'}}>Bon retour 👋</h2>
            <p style={{fontSize:13,color:'#64748b',margin:0}}>Connectez-vous à votre espace de travail</p>
          </div>

          {error && <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'10px 14px',marginBottom:16,color:'#dc2626',fontSize:13,display:'flex',gap:8,alignItems:'center'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>{error}</div>}

          <form onSubmit={submit}>
            {[{label:'Email',key:'email',type:showPass?'text':'email',ph:'votre@email.com'},{label:'Mot de passe',key:'password',type:showPass?'text':'password',ph:'••••••••'}].map(f=>(
              <div key={f.key} style={{marginBottom:16}}>
                <label style={{fontSize:12,fontWeight:700,color:'#374151',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.5px'}}>{f.label}</label>
                <div style={{position:'relative'}}>
                  <input type={f.type} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} required placeholder={f.ph}
                    style={{width:'100%',padding:'11px 14px',border:'1.5px solid #e2e8f0',borderRadius:8,fontSize:14,outline:'none',boxSizing:'border-box',background:'white',color:'#1e293b',transition:'border-color .2s'}}
                    onFocus={e=>e.target.style.borderColor='#4f8ef7'} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
                  {f.key==='password' && <button type="button" onClick={()=>setShowPass(!showPass)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#94a3b8',fontSize:12}}>{showPass?'Cacher':'Voir'}</button>}
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} style={{width:'100%',padding:'13px',borderRadius:8,border:'none',background:loading?'#94a3b8':'linear-gradient(135deg,#4f8ef7,#6ea8fe)',color:'white',fontSize:15,fontWeight:700,cursor:loading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:loading?'none':'0 4px 16px rgba(79,142,247,0.35)',transition:'all .2s'}}>
              {loading?<><div style={{width:18,height:18,borderRadius:'50%',border:'2px solid white',borderTopColor:'transparent',animation:'spin 1s linear infinite'}} />Connexion...</>:'Se connecter →'}
            </button>
          </form>

          <div style={{display:'flex',alignItems:'center',gap:12,margin:'24px 0'}}>
            <div style={{flex:1,height:1,background:'#e2e8f0'}} />
            <span style={{fontSize:11,color:'#94a3b8',fontWeight:500,whiteSpace:'nowrap'}}>Comptes de démonstration</span>
            <div style={{flex:1,height:1,background:'#e2e8f0'}} />
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {DEMO.map(u=>(
              <button key={u.email} onClick={()=>setForm({email:u.email,password:u.password})}
                style={{padding:'9px 14px',borderRadius:8,border:'1px solid #e2e8f0',background:'white',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',transition:'all .15s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=u.color;e.currentTarget.style.background=`${u.color}08`;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='#e2e8f0';e.currentTarget.style.background='white';}}>
                <div style={{textAlign:'left'}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#1e293b'}}>{u.email}</div>
                  <div style={{fontSize:11,color:'#94a3b8',marginTop:1}}>{u.password}</div>
                </div>
                <span style={{padding:'2px 8px',borderRadius:10,fontSize:10,fontWeight:700,background:`${u.color}15`,color:u.color}}>{u.role}</span>
              </button>
            ))}
          </div>
          <p style={{textAlign:'center',color:'#94a3b8',fontSize:11,marginTop:24}}>© 2026 CleanIT ERP · Tous droits réservés</p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
