import { useState, useEffect } from 'react';
import { api, getUser } from '../utils/api';
import { MODULES, ALL_MODULE_PATHS, ROLE_LABELS } from '../navConfig';

const C = { bg:'#f5f7fa', card:'#fff', border:'#e2e8f0', text:'#1e293b', text2:'#64748b', blue:'#2563eb', green:'#16a34a', red:'#dc2626', amber:'#d97706' };

const RoleBadge = ({role}) => {
  const colors = { admin:C.red, project_manager:C.blue, hr:'#9333ea', technician:C.amber, bureau:C.text2 };
  const c = colors[role] || C.text2;
  return <span style={{fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:8,background:c+'15',color:c}}>{ROLE_LABELS[role]||role}</span>;
};

export default function Parametres(){
  const me = getUser();
  const [tab, setTab] = useState('utilisateurs');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null); // user en cours d'édition (permissions/rôle)
  const [toast, setToast] = useState(null);
  const [createForm, setCreateForm] = useState({ email:'', firstName:'', lastName:'', role:'bureau', password:'' });
  const [saving, setSaving] = useState(false);

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null), 3000); };

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/users'); setUsers(Array.isArray(r.data)?r.data:[]); }
    catch { showToast('Erreur de chargement des utilisateurs', 'error'); }
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const createUser = async () => {
    if(!createForm.email || !createForm.firstName) return showToast('Email et prénom requis', 'error');
    setSaving(true);
    try {
      await api.post('/users', createForm);
      showToast('Utilisateur créé');
      setShowCreate(false);
      setCreateForm({ email:'', firstName:'', lastName:'', role:'bureau', password:'' });
      load();
    } catch(e){ showToast(e.response?.data?.message || 'Erreur de création', 'error'); }
    setSaving(false);
  };

  const toggleActive = async (u) => {
    if (u.id === me?.id && u.isActive) {
      showToast('Tu ne peux pas désactiver ton propre compte.', 'error');
      return;
    }
    try {
      await api.put(`/users/${u.id}`, { isActive: !u.isActive });
      showToast(u.isActive ? 'Compte désactivé' : 'Compte activé');
      load();
    } catch { showToast('Erreur', 'error'); }
  };

  const saveEditing = async () => {
    if (editing.id === me?.id && editing.role !== 'admin') {
      showToast("Tu ne peux pas retirer ton propre rôle d'administrateur — ça te bloquerait hors de cette page. Demande à un autre admin de le faire si nécessaire.", 'error');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/users/${editing.id}`, { role: editing.role, moduleAccess: editing.customAccess ? editing.moduleAccess : null });
      showToast('Permissions mises à jour');
      setEditing(null);
      load();
    } catch(e){ showToast(e.response?.data?.message || 'Erreur', 'error'); }
    setSaving(false);
  };

  const openEdit = (u) => {
    setEditing({
      ...u,
      customAccess: Array.isArray(u.module_access),
      moduleAccess: Array.isArray(u.module_access) ? u.module_access : ALL_MODULE_PATHS.filter(p => true),
    });
  };

  if (me?.role !== 'admin') {
    return (
      <div style={{padding:40,textAlign:'center',color:C.text2}}>
        <div style={{fontSize:15,fontWeight:600}}>Accès réservé aux administrateurs</div>
      </div>
    );
  }

  return (
    <div style={{padding:'24px 28px',background:C.bg,minHeight:'100%'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <h1 style={{fontSize:20,fontWeight:800,color:C.text,margin:0}}>Paramètres</h1>
          <div style={{fontSize:12,color:C.text2,marginTop:2}}>Utilisateurs, rôles et accès aux modules</div>
        </div>
        <button onClick={()=>setShowCreate(true)} style={{padding:'9px 16px',borderRadius:8,border:'none',background:C.blue,color:'white',fontWeight:700,fontSize:13,cursor:'pointer'}}>
          + Nouvel utilisateur
        </button>
      </div>

      <div style={{display:'flex',gap:0,marginBottom:18,borderBottom:`1px solid ${C.border}`}}>
        {[{id:'utilisateurs',label:'Utilisateurs'},{id:'apropos',label:'À propos des accès'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'9px 16px',border:'none',borderBottom:`2px solid ${tab===t.id?C.blue:'transparent'}`,background:'transparent',color:tab===t.id?C.blue:C.text2,fontWeight:tab===t.id?700:500,fontSize:13,cursor:'pointer'}}>{t.label}</button>
        ))}
      </div>

      {tab==='utilisateurs' && (
        <div style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,overflow:'hidden'}}>
          {loading ? (
            <div style={{padding:40,textAlign:'center',color:C.text2,fontSize:13}}>Chargement...</div>
          ) : (
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#f8fafc'}}>
                  {['Nom','Email','Rôle','Accès modules','Statut','Dernière connexion',''].map(h=>(
                    <th key={h} style={{textAlign:'left',padding:'10px 14px',fontSize:11,fontWeight:700,color:C.text2,textTransform:'uppercase',letterSpacing:'0.4px',borderBottom:`1px solid ${C.border}`}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u=>(
                  <tr key={u.id} style={{borderBottom:`1px solid ${C.border}`}}>
                    <td style={{padding:'10px 14px',fontSize:13,fontWeight:600,color:C.text}}>{u.firstName} {u.lastName}</td>
                    <td style={{padding:'10px 14px',fontSize:12,color:C.text2}}>{u.email}</td>
                    <td style={{padding:'10px 14px'}}><RoleBadge role={u.role}/></td>
                    <td style={{padding:'10px 14px',fontSize:12}}>
                      {Array.isArray(u.module_access)
                        ? <span style={{color:C.amber,fontWeight:700}}>Personnalisé ({u.module_access.length})</span>
                        : <span style={{color:C.text2}}>Par défaut (rôle)</span>}
                    </td>
                    <td style={{padding:'10px 14px'}}>
                      <span style={{fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:8,background:u.isActive?C.green+'15':C.red+'15',color:u.isActive?C.green:C.red}}>
                        {u.isActive?'Actif':'Désactivé'}
                      </span>
                    </td>
                    <td style={{padding:'10px 14px',fontSize:12,color:C.text2}}>{u.lastSeen ? new Date(u.lastSeen).toLocaleDateString('fr-FR') : '—'}</td>
                    <td style={{padding:'10px 14px',textAlign:'right',whiteSpace:'nowrap'}}>
                      <button onClick={()=>openEdit(u)} style={{padding:'5px 10px',borderRadius:6,border:`1px solid ${C.border}`,background:'white',fontSize:11,fontWeight:600,cursor:'pointer',marginRight:6}}>Permissions</button>
                      <button onClick={()=>toggleActive(u)} style={{padding:'5px 10px',borderRadius:6,border:`1px solid ${C.border}`,background:'white',fontSize:11,fontWeight:600,cursor:'pointer',color:u.isActive?C.red:C.green}}>
                        {u.isActive?'Désactiver':'Activer'}
                      </button>
                    </td>
                  </tr>
                ))}
                {!users.length && (
                  <tr><td colSpan={7} style={{padding:30,textAlign:'center',color:C.text2,fontSize:13}}>Aucun utilisateur</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab==='apropos' && (
        <div style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,padding:20,fontSize:13,color:C.text,lineHeight:1.7}}>
          <p><strong>Par défaut</strong>, ce que voit un utilisateur dans la sidebar dépend uniquement de son <strong>rôle</strong> (Administrateur, Chef de Projet, RH, Technicien, Bureau).</p>
          <p>Tu peux <strong>personnaliser les accès</strong> d'un utilisateur précis via le bouton "Permissions" — ça remplace entièrement les règles du rôle pour cette personne (tu choisis exactement quels modules elle voit, peu importe son rôle). Pour revenir au comportement par défaut, décoche "Personnaliser les accès" dans sa fiche.</p>
          <p>Les <strong>administrateurs voient toujours tous les modules</strong>, quels que soient les réglages — c'est pour éviter de se retrouver bloqué hors du système par erreur.</p>
        </div>
      )}

      {/* Modal création */}
      {showCreate && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowCreate(false)}>
          <div style={{background:'white',borderRadius:14,width:'100%',maxWidth:420,padding:24}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:16}}>Nouvel utilisateur</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <input placeholder="Prénom" value={createForm.firstName} onChange={e=>setCreateForm(p=>({...p,firstName:e.target.value}))} style={{padding:10,borderRadius:8,border:`1px solid ${C.border}`,fontSize:13}}/>
              <input placeholder="Nom" value={createForm.lastName} onChange={e=>setCreateForm(p=>({...p,lastName:e.target.value}))} style={{padding:10,borderRadius:8,border:`1px solid ${C.border}`,fontSize:13}}/>
              <input placeholder="Email" value={createForm.email} onChange={e=>setCreateForm(p=>({...p,email:e.target.value}))} style={{padding:10,borderRadius:8,border:`1px solid ${C.border}`,fontSize:13}}/>
              <select value={createForm.role} onChange={e=>setCreateForm(p=>({...p,role:e.target.value}))} style={{padding:10,borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,background:'white'}}>
                {Object.entries(ROLE_LABELS).map(([k,l])=><option key={k} value={k}>{l}</option>)}
              </select>
              <input placeholder="Mot de passe initial (laisser vide = CleanIT2024!)" value={createForm.password} onChange={e=>setCreateForm(p=>({...p,password:e.target.value}))} style={{padding:10,borderRadius:8,border:`1px solid ${C.border}`,fontSize:13}}/>
              <div style={{fontSize:11,color:C.text2}}>L'utilisateur devra changer ce mot de passe à sa première connexion.</div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:18}}>
              <button onClick={()=>setShowCreate(false)} style={{flex:1,padding:11,borderRadius:8,border:`1px solid ${C.border}`,background:'white',fontSize:13,fontWeight:600,cursor:'pointer'}}>Annuler</button>
              <button onClick={createUser} disabled={saving} style={{flex:2,padding:11,borderRadius:8,border:'none',background:C.blue,color:'white',fontSize:13,fontWeight:700,cursor:'pointer',opacity:saving?0.6:1}}>{saving?'Création...':'Créer le compte'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal permissions */}
      {editing && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setEditing(null)}>
          <div style={{background:'white',borderRadius:14,width:'100%',maxWidth:520,maxHeight:'85vh',overflowY:'auto',padding:24}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:4}}>{editing.firstName} {editing.lastName}</div>
            <div style={{fontSize:12,color:C.text2,marginBottom:16}}>{editing.email}</div>

            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:700,color:C.text2,textTransform:'uppercase',marginBottom:6}}>Rôle</div>
              <select value={editing.role} onChange={e=>setEditing(p=>({...p,role:e.target.value}))} style={{width:'100%',padding:10,borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,background:'white',boxSizing:'border-box'}}>
                {Object.entries(ROLE_LABELS).map(([k,l])=><option key={k} value={k}>{l}</option>)}
              </select>
            </div>

            <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',marginBottom:14,padding:'10px 12px',borderRadius:8,background:'#f8fafc'}}>
              <input type="checkbox" checked={editing.customAccess} onChange={e=>setEditing(p=>({...p,customAccess:e.target.checked}))}/>
              <span style={{fontSize:13,fontWeight:600,color:C.text}}>Personnaliser les accès (sinon : permissions par défaut du rôle)</span>
            </label>

            {editing.customAccess && (
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                {MODULES.map(section=>(
                  <div key={section.section}>
                    <div style={{fontSize:11,fontWeight:700,color:C.text2,textTransform:'uppercase',marginBottom:6}}>{section.section}</div>
                    <div style={{display:'flex',flexDirection:'column',gap:4}}>
                      {section.items.map(item=>{
                        const checked = editing.moduleAccess.includes(item.path);
                        return (
                          <label key={item.path} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',padding:'5px 8px',borderRadius:6}}>
                            <input type="checkbox" checked={checked} onChange={e=>{
                              setEditing(p=>({...p, moduleAccess: e.target.checked ? [...p.moduleAccess, item.path] : p.moduleAccess.filter(x=>x!==item.path)}));
                            }}/>
                            <span style={{fontSize:13,color:C.text}}>{item.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setEditing(null)} style={{flex:1,padding:11,borderRadius:8,border:`1px solid ${C.border}`,background:'white',fontSize:13,fontWeight:600,cursor:'pointer'}}>Annuler</button>
              <button onClick={saveEditing} disabled={saving} style={{flex:2,padding:11,borderRadius:8,border:'none',background:C.blue,color:'white',fontSize:13,fontWeight:700,cursor:'pointer',opacity:saving?0.6:1}}>{saving?'Enregistrement...':'Enregistrer'}</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{position:'fixed',bottom:24,right:24,padding:'12px 18px',borderRadius:10,background:toast.type==='error'?C.red:C.green,color:'white',fontSize:13,fontWeight:600,boxShadow:'0 8px 24px rgba(0,0,0,0.2)',zIndex:10000}}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
