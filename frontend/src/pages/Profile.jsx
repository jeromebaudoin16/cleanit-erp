import { useState } from 'react';
import { api, getUser } from '../utils/api';

const ACTIVITIES = [
  { action:'Ticket TK-00042 résolu', time:'Il y a 2h', icon:'🎫', color:'#34c97e' },
  { action:'Intervention INT-00018 validée', time:'Il y a 5h', icon:'🔧', color:'#4f8ef7' },
  { action:'Approval APV-001234 soumis', time:'Hier', icon:'✅', color:'#7c3aed' },
  { action:'Site DLA-001 mis à jour', time:'Il y a 2 jours', icon:'📡', color:'#f59e0b' },
  { action:'Rapport mensuel généré', time:'Il y a 3 jours', icon:'📊', color:'#ef4444' },
];

export default function Profile() {
  const user = getUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [form, setForm] = useState({ firstName:user?.firstName||'', lastName:user?.lastName||'', email:user?.email||'', phone:'+237 677 000 000', region:'Littoral', ville:'Douala', bio:'Administrateur CleanIT ERP' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try { await api.put(`/users/${user?.id}`, form); } catch {}
    setSaving(false);
  };

  const roleColor = { admin:'#4f8ef7', project_manager:'#34c97e', technician:'#f59e0b', finance:'#7c3aed', hr:'#ef4444' };
  const roleLabel = { admin:'Administrateur', project_manager:'Project Manager', technician:'Technicien', finance:'Finance', hr:'RH', viewer:'Visiteur' };
  const rc = roleColor[user?.role] || '#64748b';
  const rl = roleLabel[user?.role] || user?.role;

  return (
    <div style={{padding:24, background:'#f5f7fa', minHeight:'100%'}}>

      {/* Cover + Avatar */}
      <div style={{background:'white', borderRadius:16, overflow:'hidden', marginBottom:20, boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
        <div style={{height:150, background:'linear-gradient(135deg,#0f1b2d 0%,#1a2a45 50%,#4f8ef7 100%)', position:'relative'}}>
          <div style={{position:'absolute', inset:0, opacity:0.08, backgroundImage:'radial-gradient(circle at 25px 25px, white 2px, transparent 0)', backgroundSize:'50px 50px'}} />
        </div>
        <div style={{padding:'0 32px 24px', display:'flex', alignItems:'flex-end', gap:20, marginTop:-50, flexWrap:'wrap'}}>
          <div style={{width:100, height:100, borderRadius:20, background:`linear-gradient(135deg,${rc},${rc}99)`, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:900, fontSize:38, border:'4px solid white', flexShrink:0, boxShadow:'0 4px 20px rgba(0,0,0,0.15)'}}>
            {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
          </div>
          <div style={{flex:1, paddingTop:54}}>
            <div style={{display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:4}}>
              <h1 style={{fontSize:22, fontWeight:800, color:'#0f1b2d', margin:0}}>{user?.firstName} {user?.lastName}</h1>
              <span style={{padding:'3px 10px', borderRadius:10, fontSize:11, fontWeight:700, background:`${rc}15`, color:rc}}>{rl}</span>
              <span style={{padding:'3px 10px', borderRadius:10, fontSize:11, fontWeight:600, background:'#f0fdf4', color:'#16a34a', display:'flex', alignItems:'center', gap:4}}>
                <span style={{width:6, height:6, borderRadius:'50%', background:'#16a34a', display:'inline-block'}} />En ligne
              </span>
            </div>
            <p style={{fontSize:13, color:'#64748b', margin:0}}>{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:12, marginBottom:20}}>
        {[{l:'Tickets assignés',v:12,icon:'🎫',c:'#4f8ef7'},{l:'Interventions',v:8,icon:'🔧',c:'#34c97e'},{l:'Sites gérés',v:5,icon:'📡',c:'#f59e0b'},{l:'Approvals créés',v:3,icon:'✅',c:'#7c3aed'}].map(s=>(
          <div key={s.l} style={{background:'white', borderRadius:12, padding:'16px', border:'1px solid #e8ecf0', display:'flex', alignItems:'center', gap:12}}>
            <div style={{width:44, height:44, borderRadius:12, background:`${s.c}12`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22}}>{s.icon}</div>
            <div><div style={{fontSize:22, fontWeight:800, color:s.c}}>{s.v}</div><div style={{fontSize:11, color:'#64748b'}}>{s.l}</div></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:'flex', borderBottom:'2px solid #e8ecf0', marginBottom:20, background:'white', borderRadius:'12px 12px 0 0', padding:'0 20px'}}>
        {[{v:'overview',l:'Vue générale'},{v:'edit',l:'Modifier'},{v:'security',l:'Sécurité'},{v:'activity',l:'Activité'}].map(t=>(
          <button key={t.v} onClick={()=>setActiveTab(t.v)} style={{padding:'14px 20px', border:'none', background:'transparent', cursor:'pointer', fontSize:13, fontWeight:activeTab===t.v?700:400, color:activeTab===t.v?'#4f8ef7':'#64748b', borderBottom:`2px solid ${activeTab===t.v?'#4f8ef7':'transparent'}`, marginBottom:-2}}>{t.l}</button>
        ))}
      </div>

      {activeTab==='overview' && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          <div style={{background:'white', borderRadius:12, padding:24, border:'1px solid #e8ecf0'}}>
            <h3 style={{fontSize:15, fontWeight:700, color:'#0f1b2d', marginBottom:16}}>👤 Informations</h3>
            {[{l:'Nom complet',v:`${user?.firstName} ${user?.lastName}`},{l:'Email',v:user?.email},{l:'Téléphone',v:form.phone},{l:'Région',v:form.region},{l:'Ville',v:form.ville},{l:'Rôle',v:rl},{l:'Statut',v:'Actif ✓'}].map(i=>(
              <div key={i.l} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #f8fafc'}}>
                <span style={{fontSize:13, color:'#64748b'}}>{i.l}</span>
                <span style={{fontSize:13, fontWeight:600, color:'#1e293b'}}>{i.v}</span>
              </div>
            ))}
          </div>
          <div style={{background:'white', borderRadius:12, padding:24, border:'1px solid #e8ecf0'}}>
            <h3 style={{fontSize:15, fontWeight:700, color:'#0f1b2d', marginBottom:16}}>⚡ Activité récente</h3>
            {ACTIVITIES.map((a,i)=>(
              <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'9px 0', borderBottom:'1px solid #f8fafc'}}>
                <div style={{width:36, height:36, borderRadius:10, background:`${a.color}12`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0}}>{a.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13, fontWeight:600, color:'#1e293b'}}>{a.action}</div>
                  <div style={{fontSize:11, color:'#94a3b8', marginTop:1}}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab==='edit' && (
        <div style={{background:'white', borderRadius:12, padding:24, border:'1px solid #e8ecf0', maxWidth:600}}>
          <h3 style={{fontSize:15, fontWeight:700, color:'#0f1b2d', marginBottom:20}}>✏ Modifier mes informations</h3>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
            {[{l:'Prénom',k:'firstName'},{l:'Nom',k:'lastName'},{l:'Email',k:'email'},{l:'Téléphone',k:'phone'},{l:'Région',k:'region'},{l:'Ville',k:'ville'}].map(f=>(
              <div key={f.k}>
                <label style={{fontSize:12, fontWeight:700, color:'#64748b', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.5px'}}>{f.l}</label>
                <input value={form[f.k]||''} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} style={{width:'100%', padding:'10px 12px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', boxSizing:'border-box'}} onFocus={e=>e.target.style.borderColor='#4f8ef7'} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
              </div>
            ))}
          </div>
          <div style={{marginTop:14}}>
            <label style={{fontSize:12, fontWeight:700, color:'#64748b', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.5px'}}>Bio</label>
            <textarea value={form.bio||''} onChange={e=>setForm(p=>({...p,bio:e.target.value}))} rows={3} style={{width:'100%', padding:'10px 12px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', boxSizing:'border-box', resize:'vertical'}} />
          </div>
          <button onClick={save} disabled={saving} style={{marginTop:16, padding:'10px 24px', borderRadius:8, border:'none', background:'#4f8ef7', color:'white', cursor:'pointer', fontSize:13, fontWeight:700}}>{saving?'Sauvegarde...':'✓ Sauvegarder'}</button>
        </div>
      )}

      {activeTab==='security' && (
        <div style={{background:'white', borderRadius:12, padding:24, border:'1px solid #e8ecf0', maxWidth:500}}>
          <h3 style={{fontSize:15, fontWeight:700, color:'#0f1b2d', marginBottom:20}}>🔒 Sécurité</h3>
          {[{l:'Nouveau mot de passe'},{l:'Confirmer le mot de passe'}].map(f=>(
            <div key={f.l} style={{marginBottom:14}}>
              <label style={{fontSize:12, fontWeight:700, color:'#64748b', display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.5px'}}>{f.l}</label>
              <input type="password" placeholder="••••••••" style={{width:'100%', padding:'10px 12px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', boxSizing:'border-box'}} />
            </div>
          ))}
          <button style={{padding:'10px 24px', borderRadius:8, border:'none', background:'#4f8ef7', color:'white', cursor:'pointer', fontSize:13, fontWeight:700}}>🔒 Changer</button>
          <div style={{marginTop:20, padding:'14px', borderRadius:10, background:'#f0fdf4', border:'1px solid #bbf7d0'}}>
            <div style={{fontSize:13, fontWeight:700, color:'#16a34a'}}>✅ Compte sécurisé · Session active</div>
          </div>
        </div>
      )}

      {activeTab==='activity' && (
        <div style={{background:'white', borderRadius:12, padding:24, border:'1px solid #e8ecf0'}}>
          <h3 style={{fontSize:15, fontWeight:700, color:'#0f1b2d', marginBottom:20}}>📋 Historique d'activité</h3>
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {[...ACTIVITIES,...ACTIVITIES].map((a,i)=>(
              <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:10, background:i%2===0?'#f8fafc':'white', border:'1px solid #f1f5f9'}}>
                <div style={{width:40, height:40, borderRadius:10, background:`${a.color}12`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0}}>{a.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13, fontWeight:600, color:'#1e293b'}}>{a.action}</div>
                  <div style={{fontSize:11, color:'#94a3b8', marginTop:2}}>{a.time}</div>
                </div>
                <span style={{padding:'2px 8px', borderRadius:8, fontSize:10, fontWeight:600, background:`${a.color}12`, color:a.color}}>Action</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
