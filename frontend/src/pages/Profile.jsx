import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const C = {
  blue:'#185FA5', blue_l:'#E6F1FB', blue_d:'#0C447C',
  green:'#3B6D11', green_l:'#EAF3DE',
  orange:'#854F0B', orange_l:'#FAEEDA',
  red:'#A32D2D', red_l:'#FCEBEB',
  purple:'#403294', purple_l:'#F3EEF9',
  border:'#E5E7EB', border2:'#F3F4F6',
  text:'#111827', text2:'#374151', text3:'#6B7280',
  white:'#FFFFFF', bg:'#F9FAFB',
};

const ROLES = {
  ADMIN:'Admin Système', DG:'Directeur Général', FINANCE:'Comptable',
  PROJECT_MANAGER:'Chef de Projet', TECHNICIAN:'Chef Terrain', HR:'Responsable RH',
};

// Icônes SVG inline — pas d'emojis
const Icon = ({d, size=16, color='currentColor'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
    {d.split(' M').map((seg,i)=><path key={i} d={i===0?seg:`M ${seg}`}/>)}
  </svg>
);

const ICONS = {
  profil:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  entreprise:'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  notifs:'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0',
  planning:'M8 6V4m8 2V4m-9 4h10 M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z',
  users:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  securite:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  apparence:'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z',
  integrations:'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  check:'M20 6 9 17l-5-5',
  lock:'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4',
  logout:'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  eye:'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  trash:'M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2',
  plus:'M12 5v14 M5 12h14',
  save:'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8',
  alert:'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
};

const SECTIONS = [
  {id:'profil',      label:'Mon profil',         icon:'profil'},
  {id:'entreprise',  label:'Entreprise',          icon:'entreprise'},
  {id:'notifications',label:'Notifications',     icon:'notifs'},
  {id:'planning',    label:'Planning & Agenda',   icon:'planning'},
  {id:'utilisateurs',label:'Utilisateurs & Rôles',icon:'users'},
  {id:'securite',    label:'Sécurité',            icon:'securite'},
  {id:'apparence',   label:'Apparence',           icon:'apparence'},
  {id:'integrations',label:'Intégrations',        icon:'integrations'},
];

const Toggle = ({val, onChange}) => (
  <div onClick={()=>onChange(!val)} style={{width:42,height:24,borderRadius:12,background:val?C.blue:C.border,cursor:'pointer',position:'relative',transition:'background .2s',flexShrink:0}}>
    <div style={{position:'absolute',top:3,left:val?21:3,width:18,height:18,borderRadius:'50%',background:C.white,transition:'left .2s',boxShadow:'0 1px 3px rgba(0,0,0,.2)'}}/>
  </div>
);

const Inp = ({value,onChange,placeholder,type='text',readOnly=false,style={}}) => (
  <input value={value||''} onChange={e=>onChange?.(e.target.value)} placeholder={placeholder}
    type={type} readOnly={readOnly}
    style={{padding:'9px 12px',borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,
      fontFamily:'inherit',outline:'none',background:readOnly?C.bg:C.white,
      color:readOnly?C.text3:C.text,width:'100%',boxSizing:'border-box',...style}}
    onFocus={e=>{if(!readOnly)e.target.style.borderColor=C.blue;}}
    onBlur={e=>e.target.style.borderColor=C.border}/>
);

const Sel = ({value,onChange,children,style={}}) => (
  <select value={value||''} onChange={e=>onChange(e.target.value)}
    style={{padding:'9px 12px',borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,
      fontFamily:'inherit',outline:'none',background:C.white,color:C.text,cursor:'pointer',...style}}>
    {children}
  </select>
);

function Alert({type='success',msg,onClose}){
  if(!msg) return null;
  const s = type==='success'
    ?{bg:C.green_l,c:C.green,border:'#86EFAC'}
    :{bg:C.red_l,c:C.red,border:'#FCA5A5'};
  return (
    <div style={{padding:'10px 14px',borderRadius:8,background:s.bg,border:`1px solid ${s.border}`,
      color:s.c,fontSize:13,marginBottom:14,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <Icon d={type==='success'?ICONS.check:ICONS.alert} size={15} color={s.c}/>
        {msg}
      </div>
      <button onClick={onClose} style={{border:'none',background:'none',cursor:'pointer',color:s.c,fontSize:16,lineHeight:1}}>×</button>
    </div>
  );
}

function Card({title,sub,children,onSave,saving,alert,setAlert}){
  return (
    <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden',marginBottom:16}}>
      <div style={{padding:'16px 20px',borderBottom:`1px solid ${C.border2}`}}>
        <div style={{fontSize:14,fontWeight:600,color:C.text}}>{title}</div>
        {sub&&<div style={{fontSize:12,color:C.text3,marginTop:2}}>{sub}</div>}
      </div>
      <div style={{padding:'6px 20px 18px'}}>
        {alert&&<div style={{marginTop:12}}><Alert type={alert.type} msg={alert.msg} onClose={()=>setAlert(null)}/></div>}
        {children}
      </div>
      {onSave&&(
        <div style={{padding:'12px 20px',borderTop:`1px solid ${C.border2}`,display:'flex',justifyContent:'flex-end',background:C.bg}}>
          <button onClick={onSave} disabled={saving}
            style={{padding:'9px 22px',borderRadius:8,border:'none',background:saving?C.border:C.blue,
              color:saving?C.text3:C.white,fontSize:13,fontWeight:600,cursor:saving?'not-allowed':'pointer',
              fontFamily:'inherit',display:'flex',alignItems:'center',gap:7,transition:'all .2s'}}>
            {saving?'Sauvegarde...':<><Icon d={ICONS.save} size={14} color="white"/>Sauvegarder</>}
          </button>
        </div>
      )}
    </div>
  );
}

function Row({label,sub,children}){
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',
      padding:'13px 0',borderBottom:`1px solid ${C.border2}`}}>
      <div style={{flex:1,marginRight:16}}>
        <div style={{fontSize:13,fontWeight:500,color:C.text}}>{label}</div>
        {sub&&<div style={{fontSize:11,color:C.text3,marginTop:2}}>{sub}</div>}
      </div>
      <div style={{flexShrink:0}}>{children}</div>
    </div>
  );
}

function TabProfil({user,setUser}){
  const [form,setForm]=useState({firstName:'',lastName:'',email:'',phone:'',region:'',bio:''});
  const [pwd,setPwd]=useState({current:'',nouveau:'',confirm:''});
  const [saving1,setSaving1]=useState(false);
  const [saving2,setSaving2]=useState(false);
  const [alert1,setAlert1]=useState(null);
  const [alert2,setAlert2]=useState(null);

  useEffect(()=>{
    if(user) setForm({
      firstName:user.firstName||'',lastName:user.lastName||'',
      email:user.email||'',phone:user.phone||'',region:user.region||'',bio:user.bio||'',
    });
  },[user]);

  const saveProfile=async()=>{
    setSaving1(true);
    try{
      await api.put(`/users/${user.id}`,{firstName:form.firstName,lastName:form.lastName,phone:form.phone,region:form.region});
      setUser({...user,...form});
      try{const u=JSON.parse(localStorage.getItem('cleanit_user')||'{}');localStorage.setItem('cleanit_user',JSON.stringify({...u,...form}));}catch{}
      setAlert1({type:'success',msg:'Profil mis à jour avec succès'});
    }catch{
      setAlert1({type:'error',msg:'Erreur lors de la sauvegarde. Vérifiez votre connexion.'});
    }
    setSaving1(false);
  };

  const savePwd=async()=>{
    if(pwd.nouveau!==pwd.confirm){setAlert2({type:'error',msg:'Les mots de passe ne correspondent pas.'});return;}
    if(pwd.nouveau.length<8){setAlert2({type:'error',msg:'Mot de passe trop court — minimum 8 caractères.'});return;}
    setSaving2(true);
    try{
      await api.put(`/users/${user.id}`,{password:pwd.nouveau,currentPassword:pwd.current});
      setAlert2({type:'success',msg:'Mot de passe modifié avec succès'});
      setPwd({current:'',nouveau:'',confirm:''});
    }catch{
      setAlert2({type:'error',msg:'Mot de passe actuel incorrect ou erreur serveur.'});
    }
    setSaving2(false);
  };

  const lbl={fontSize:11,color:C.text3,marginBottom:4,display:'block',fontWeight:500};

  return (
    <>
      <Card title="Informations personnelles" sub="Visibles par toute l'équipe CleanIT"
        onSave={saveProfile} saving={saving1} alert={alert1} setAlert={setAlert1}>
        <div style={{display:'flex',alignItems:'center',gap:16,padding:'16px 0 12px',borderBottom:`1px solid ${C.border2}`,marginBottom:4}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:C.blue_l,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:700,color:C.blue_d,flexShrink:0,overflow:'hidden'}}>
            {user?.photoUrl?<img src={user.photoUrl} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="Photo profil"/>:<>{form.firstName?.[0]}{form.lastName?.[0]}</>}
          </div>
          <div>
            <div style={{fontSize:15,fontWeight:600,color:C.text,marginBottom:2}}>{form.firstName} {form.lastName}</div>
            <div style={{fontSize:12,color:C.text3,marginBottom:6}}>{ROLES[user?.role]||user?.role}</div>
            <div style={{display:'flex',gap:6,alignItems:'center'}}>
            <input type="file" id="photo-upload" accept="image/*" style={{display:'none'}}
              onChange={e=>{const file=e.target.files[0];if(file){const reader=new FileReader();reader.onload=r=>{const photoUrl=r.target.result;try{const u=JSON.parse(localStorage.getItem('cleanit_user')||'{}');localStorage.setItem('cleanit_user',JSON.stringify({...u,photoUrl}));setUser({...user,photoUrl});}catch{}setAlert1({type:'success',msg:'Photo mise à jour'});};reader.readAsDataURL(file);}}}/>
            <button onClick={()=>document.getElementById('photo-upload').click()} style={{fontSize:12,padding:'5px 12px',borderRadius:6,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit',color:C.text3}}>Changer la photo</button>
            {user?.photoUrl&&<button onClick={()=>{try{const u=JSON.parse(localStorage.getItem('cleanit_user')||'{}');delete u.photoUrl;localStorage.setItem('cleanit_user',JSON.stringify(u));setUser({...user,photoUrl:null});}catch{}}} style={{fontSize:11,padding:'3px 8px',borderRadius:5,border:`1px solid ${C.red}`,background:C.red_l,color:C.red,cursor:'pointer',fontFamily:'inherit'}}>Supprimer</button>}
          </div>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:4}}>
          <div><label style={lbl}>Prénom</label><Inp value={form.firstName} onChange={v=>setForm({...form,firstName:v})} placeholder="Prénom"/></div>
          <div><label style={lbl}>Nom</label><Inp value={form.lastName} onChange={v=>setForm({...form,lastName:v})} placeholder="Nom"/></div>
          <div><label style={lbl}>Email</label><Inp value={form.email} readOnly placeholder="Email"/></div>
          <div><label style={lbl}>Téléphone</label><Inp value={form.phone} onChange={v=>setForm({...form,phone:v})} placeholder="+237 6XX XXX XXX"/></div>
          <div><label style={lbl}>Rôle</label><Inp value={ROLES[user?.role]||user?.role||''} readOnly/></div>
          <div><label style={lbl}>Région</label><Inp value={form.region} onChange={v=>setForm({...form,region:v})} placeholder="Douala, Yaoundé..."/></div>
        </div>
      </Card>

      <Card title="Changer le mot de passe" sub="Minimum 8 caractères"
        onSave={savePwd} saving={saving2} alert={alert2} setAlert={setAlert2}>
        <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:4}}>
          <div><label style={lbl}>Mot de passe actuel</label><Inp value={pwd.current} onChange={v=>setPwd({...pwd,current:v})} type="password" placeholder="••••••••"/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div><label style={lbl}>Nouveau mot de passe</label><Inp value={pwd.nouveau} onChange={v=>setPwd({...pwd,nouveau:v})} type="password" placeholder="••••••••"/></div>
            <div><label style={lbl}>Confirmer</label><Inp value={pwd.confirm} onChange={v=>setPwd({...pwd,confirm:v})} type="password" placeholder="••••••••"/></div>
          </div>
        </div>
      </Card>
    </>
  );
}

function TabEntreprise(){
  const [form,setForm]=useState({
    nom:'CleanIT Cameroun SARL',secteur:'Sous-traitance télécom',
    adresse:'Avenue de la Liberté, Douala',tel:'+237 233 000 000',
    email:'contact@cleanit.cm',rccm:'DLA/2024/B/12345',capital:'10 000 000',
  });
  const [prefs,setPrefs]=useState({devise:'FCFA',timezone:'Africa/Douala',dateFormat:'DD/MM/YYYY'});
  const [saving,setSaving]=useState(false);
  const [alert,setAlert]=useState(null);
  const lbl={fontSize:11,color:C.text3,marginBottom:4,display:'block',fontWeight:500};

  const save=()=>{
    setSaving(true);
    localStorage.setItem('cleanit_entreprise',JSON.stringify({...form,...prefs}));
    setTimeout(()=>{setSaving(false);setAlert({type:'success',msg:'Informations entreprise sauvegardées'});},600);
  };

  return (
    <>
      <Card title="Informations de l'entreprise" onSave={save} saving={saving} alert={alert} setAlert={setAlert}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:4}}>
          <div style={{gridColumn:'1/3'}}><label style={lbl}>Raison sociale</label><Inp value={form.nom} onChange={v=>setForm({...form,nom:v})}/></div>
          <div><label style={lbl}>Secteur</label><Inp value={form.secteur} onChange={v=>setForm({...form,secteur:v})}/></div>
          <div><label style={lbl}>RCCM</label><Inp value={form.rccm} onChange={v=>setForm({...form,rccm:v})}/></div>
          <div style={{gridColumn:'1/3'}}><label style={lbl}>Adresse</label><Inp value={form.adresse} onChange={v=>setForm({...form,adresse:v})}/></div>
          <div><label style={lbl}>Téléphone</label><Inp value={form.tel} onChange={v=>setForm({...form,tel:v})}/></div>
          <div><label style={lbl}>Email</label><Inp value={form.email} onChange={v=>setForm({...form,email:v})}/></div>
          <div><label style={lbl}>Capital social (FCFA)</label><Inp value={form.capital} onChange={v=>setForm({...form,capital:v})}/></div>
        </div>
      </Card>
      <Card title="Paramètres régionaux">
        <Row label="Devise" sub="Utilisée dans CleanITBooks et toutes les factures">
          <Sel value={prefs.devise} onChange={v=>setPrefs({...prefs,devise:v})} style={{width:140}}>
            <option>FCFA</option><option>EUR</option><option>USD</option>
          </Sel>
        </Row>
        <Row label="Fuseau horaire">
          <Sel value={prefs.timezone} onChange={v=>setPrefs({...prefs,timezone:v})} style={{width:180}}>
            <option>Africa/Douala</option><option>Africa/Lagos</option><option>Europe/Paris</option>
          </Sel>
        </Row>
        <Row label="Format de date">
          <Sel value={prefs.dateFormat} onChange={v=>setPrefs({...prefs,dateFormat:v})} style={{width:160}}>
            <option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option>
          </Sel>
        </Row>
        <div style={{marginTop:14,display:'flex',justifyContent:'flex-end'}}>
          <button onClick={()=>{localStorage.setItem('cleanit_prefs',JSON.stringify(prefs));setAlert({type:'success',msg:'Préférences régionales sauvegardées'});}}
            style={{padding:'8px 18px',borderRadius:8,border:'none',background:C.blue,color:C.white,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:6}}>
            <Icon d={ICONS.save} size={14} color="white"/>Sauvegarder
          </button>
        </div>
      </Card>
    </>
  );
}

function TabNotifications(){
  const stored=()=>{try{return JSON.parse(localStorage.getItem('cleanit_notifs')||'{}');}catch{return{};}};
  const [n,setN]=useState({
    email_facture:true,email_approb:true,email_mission:true,email_certif:true,email_conge:false,
    sys_facture:true,sys_approb:true,sys_mission:true,sys_terrain:true,sys_rh:true,
    rappel_delai:'15',briefing:true,...stored(),
  });
  const [saved,setSaved]=useState(false);

  const save=()=>{
    localStorage.setItem('cleanit_notifs',JSON.stringify(n));
    setSaved(true);setTimeout(()=>setSaved(false),2000);
  };

  const ntRow=(k,l,s)=>(
    <Row key={k} label={l} sub={s}>
      <Toggle val={!!n[k]} onChange={v=>setN({...n,[k]:v})}/>
    </Row>
  );

  return (
    <>
      <Card title="Notifications email" sub="Envoyées à votre adresse professionnelle"
        onSave={save} saving={false} alert={saved?{type:'success',msg:'Préférences sauvegardées localement'}:null} setAlert={()=>setSaved(false)}>
        {ntRow('email_facture','Nouvelle facture créée','CleanITBooks')}
        {ntRow('email_approb','Demande d\'approbation reçue','Approvals')}
        {ntRow('email_mission','Mission terrain assignée','Gestion Terrain')}
        {ntRow('email_certif','Certification expirée','Techniciens')}
        {ntRow('email_conge','Demande de congé soumise','RH')}
      </Card>
      <Card title="Notifications système" sub="Alertes dans l'interface CleanIT">
        {ntRow('sys_facture','Factures en attente')}
        {ntRow('sys_approb','Approbations en attente')}
        {ntRow('sys_mission','Nouvelles missions disponibles')}
        {ntRow('sys_terrain','Alertes terrain (urgences)')}
        {ntRow('sys_rh','Alertes RH (certifications, congés)')}
      </Card>
      <Card title="Rappels Planning">
        <Row label="Rappel avant un événement">
          <Sel value={n.rappel_delai} onChange={v=>setN({...n,rappel_delai:v})} style={{width:160}}>
            <option value="5">5 min avant</option>
            <option value="15">15 min avant</option>
            <option value="30">30 min avant</option>
            <option value="60">1 heure avant</option>
          </Sel>
        </Row>
        <Row label="Briefing quotidien ChaCha" sub="Résumé envoyé chaque matin à 7h30">
          <Toggle val={!!n.briefing} onChange={v=>setN({...n,briefing:v})}/>
        </Row>
      </Card>
    </>
  );
}

function TabPlanning(){
  const stored=()=>{try{return JSON.parse(localStorage.getItem('cleanit_planning_prefs')||'{}');}catch{return{};}};
  const [p,setP]=useState({hDebut:'08',hFin:'18',jours:[1,2,3,4,5],buffer:'15',autoSchedule:true,recurr:true,...stored()});
  const [saved,setSaved]=useState(false);
  const JOURS=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

  const save=()=>{
    localStorage.setItem('cleanit_planning_prefs',JSON.stringify(p));
    setSaved(true);setTimeout(()=>setSaved(false),2000);
  };

  return (
    <>
      <Card title="Heures de travail" sub="ChaCha ne planifie jamais en dehors de ces heures"
        onSave={save} saving={false} alert={saved?{type:'success',msg:'Préférences Planning sauvegardées'}:null} setAlert={()=>setSaved(false)}>
        <Row label="Début de journée">
          <Sel value={p.hDebut} onChange={v=>setP({...p,hDebut:v})} style={{width:120}}>
            {['06','07','08','09','10'].map(h=><option key={h} value={h}>{h}h00</option>)}
          </Sel>
        </Row>
        <Row label="Fin de journée">
          <Sel value={p.hFin} onChange={v=>setP({...p,hFin:v})} style={{width:120}}>
            {['17','18','19','20','21'].map(h=><option key={h} value={h}>{h}h00</option>)}
          </Sel>
        </Row>
        <Row label="Jours travaillés">
          <div style={{display:'flex',gap:5}}>
            {JOURS.map((j,i)=>(
              <button key={i} onClick={()=>{const jrs=(p.jours||[]);setP({...p,jours:jrs.includes(i+1)?jrs.filter(d=>d!==i+1):[...jrs,i+1]});}}
                style={{width:34,height:34,borderRadius:7,border:`1px solid ${(p.jours||[]).includes(i+1)?C.blue:C.border}`,background:(p.jours||[]).includes(i+1)?C.blue_l:'none',color:(p.jours||[]).includes(i+1)?C.blue:C.text3,cursor:'pointer',fontSize:11,fontWeight:600,fontFamily:'inherit'}}>
                {j}
              </button>
            ))}
          </div>
        </Row>
        <Row label="Temps tampon entre réunions" sub="ChaCha ajoute automatiquement ce délai">
          <Sel value={p.buffer} onChange={v=>setP({...p,buffer:v})} style={{width:160}}>
            <option value="0">Aucun</option>
            <option value="10">10 minutes</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
          </Sel>
        </Row>
        <Row label="Auto-scheduling ChaCha" sub="ChaCha place vos tâches dans les créneaux libres">
          <Toggle val={!!p.autoSchedule} onChange={v=>setP({...p,autoSchedule:v})}/>
        </Row>
        <Row label="Événements récurrents" sub="Activer la répétition automatique">
          <Toggle val={!!p.recurr} onChange={v=>setP({...p,recurr:v})}/>
        </Row>
      </Card>
    </>
  );
}

function TabUtilisateurs({currentUser}){
  const [users,setUsers]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({firstName:'',lastName:'',email:'',password:'',role:'TECHNICIAN'});
  const [saving,setSaving]=useState(false);
  const [search,setSearch]=useState('');
  const [alert,setAlert]=useState(null);

  const ROLE_COLORS={
    DG:[C.red_l,C.red],ADMIN:['#F3EEF9','#403294'],
    FINANCE:[C.green_l,C.green],PROJECT_MANAGER:[C.blue_l,C.blue_d],
    TECHNICIAN:[C.border2,C.text3],HR:[C.orange_l,C.orange],
  };

  useEffect(()=>{ loadUsers(); },[]);

  const loadUsers=async()=>{
    setLoading(true);
    try{const r=await api.get('/users');setUsers(Array.isArray(r.data)?r.data:[]);}
    catch{setUsers([]);}
    setLoading(false);
  };

  const addUser=async()=>{
    if(!form.email||!form.firstName||!form.password){setAlert({type:'error',msg:'Remplissez tous les champs obligatoires'});return;}
    setSaving(true);
    try{
      await api.post('/users',form);
      setAlert({type:'success',msg:`Utilisateur ${form.firstName} créé avec succès`});
      setForm({firstName:'',lastName:'',email:'',password:'',role:'TECHNICIAN'});
      setShowAdd(false);
      loadUsers();
    }catch(e){
      setAlert({type:'error',msg:'Erreur création utilisateur. Email peut-être déjà utilisé.'});
    }
    setSaving(false);
  };

  const toggleStatut=async(u)=>{
    try{
      await api.put(`/users/${u.id}`,{isActive:!u.isActive});
      loadUsers();
    }catch{setAlert({type:'error',msg:'Erreur lors de la modification'});}
  };

  const filtered=users.filter(u=>`${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase()));
  const lbl={fontSize:11,color:C.text3,marginBottom:4,display:'block',fontWeight:500};

  return (
    <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden'}}>
      <div style={{padding:'16px 20px',borderBottom:`1px solid ${C.border2}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:14,fontWeight:600,color:C.text}}>Utilisateurs & Rôles</div>
          <div style={{fontSize:12,color:C.text3,marginTop:2}}>{loading?'Chargement...':`${users.length} utilisateurs`}</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
            style={{padding:'7px 12px',borderRadius:7,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit',outline:'none',width:180}}/>
          <button onClick={()=>setShowAdd(!showAdd)}
            style={{padding:'7px 14px',borderRadius:7,border:'none',background:C.blue,color:C.white,cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',gap:6}}>
            <Icon d={ICONS.plus} size={14} color="white"/>Ajouter
          </button>
        </div>
      </div>

      {alert&&<div style={{padding:'0 20px 0'}}><div style={{marginTop:12}}><Alert type={alert.type} msg={alert.msg} onClose={()=>setAlert(null)}/></div></div>}

      {showAdd&&(
        <div style={{padding:'14px 20px',background:C.blue_l,borderBottom:`1px solid #B5D4F4`}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 2fr 1.5fr 1fr auto',gap:8,alignItems:'end'}}>
            <div><label style={lbl}>Prénom *</label><Inp value={form.firstName} onChange={v=>setForm({...form,firstName:v})}/></div>
            <div><label style={lbl}>Nom</label><Inp value={form.lastName} onChange={v=>setForm({...form,lastName:v})}/></div>
            <div><label style={lbl}>Email *</label><Inp value={form.email} onChange={v=>setForm({...form,email:v})} type="email"/></div>
            <div><label style={lbl}>Mot de passe *</label><Inp value={form.password} onChange={v=>setForm({...form,password:v})} type="password"/></div>
            <div><label style={lbl}>Rôle</label>
              <Sel value={form.role} onChange={v=>setForm({...form,role:v})}>
                {Object.entries(ROLES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </Sel>
            </div>
            <div style={{display:'flex',gap:5,paddingBottom:1}}>
              <button onClick={addUser} disabled={saving}
                style={{padding:'9px 14px',borderRadius:7,border:'none',background:saving?C.border:C.blue,color:C.white,cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600}}>
                {saving?'..':'Créer'}
              </button>
              <button onClick={()=>setShowAdd(false)}
                style={{padding:'9px 10px',borderRadius:7,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit',fontSize:12}}>✕</button>
            </div>
          </div>
        </div>
      )}

      {loading?<div style={{padding:24,textAlign:'center',color:C.text3,fontSize:13}}>Chargement des utilisateurs...</div>:(
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:C.bg}}>
              {['Utilisateur','Email','Rôle','Statut','Actions'].map(h=>(
                <th key={h} style={{textAlign:'left',padding:'9px 16px',fontSize:11,fontWeight:600,color:C.text3,textTransform:'uppercase',letterSpacing:.5,borderBottom:`1px solid ${C.border}`}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u=>{
              const [rbg,rc]=ROLE_COLORS[u.role]||[C.border2,C.text3];
              const isMe=u.email===currentUser?.email;
              return (
                <tr key={u.id} style={{borderBottom:`1px solid ${C.border2}`}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'11px 16px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:9}}>
                      <div style={{width:32,height:32,borderRadius:'50%',background:C.blue_l,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:C.blue_d,flexShrink:0}}>
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <div>
                        <div style={{fontSize:13,fontWeight:500,color:C.text}}>{u.firstName} {u.lastName} {isMe&&<span style={{fontSize:10,padding:'1px 6px',borderRadius:8,background:C.blue_l,color:C.blue,fontWeight:600}}>Vous</span>}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{padding:'11px 16px',fontSize:12,color:C.text3}}>{u.email}</td>
                  <td style={{padding:'11px 16px'}}>
                    <span style={{fontSize:11,padding:'3px 9px',borderRadius:20,background:rbg,color:rc,fontWeight:600}}>{ROLES[u.role]||u.role}</span>
                  </td>
                  <td style={{padding:'11px 16px'}}>
                    <span style={{fontSize:11,padding:'3px 9px',borderRadius:20,background:u.isActive!==false?C.green_l:C.border2,color:u.isActive!==false?C.green:C.text3,fontWeight:600}}>
                      {u.isActive!==false?'Actif':'Inactif'}
                    </span>
                  </td>
                  <td style={{padding:'11px 16px'}}>
                    {!isMe&&(
                      <button onClick={()=>toggleStatut(u)}
                        style={{fontSize:11,padding:'4px 10px',borderRadius:5,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit',color:C.text3}}>
                        {u.isActive!==false?'Désactiver':'Activer'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length===0&&!loading&&<tr><td colSpan={5} style={{padding:'20px',textAlign:'center',color:C.text3,fontSize:13}}>Aucun utilisateur trouvé</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}

function TabSecurite({user}){
  const [twofa,setTwofa]=useState(localStorage.getItem('cleanit_2fa')==='1');
  const [saved,setSaved]=useState(false);
  const [pwd,setPwd]=useState({current:'',nouveau:'',confirm:''});
  const [pwdAlert,setPwdAlert]=useState(null);
  const [savingPwd,setSavingPwd]=useState(false);

  const savePwd=async()=>{
    if(!pwd.current){setPwdAlert({type:'error',msg:'Mot de passe actuel requis'});return;}
    if(pwd.nouveau!==pwd.confirm){setPwdAlert({type:'error',msg:'Les nouveaux mots de passe ne correspondent pas'});return;}
    if(pwd.nouveau.length<8){setPwdAlert({type:'error',msg:'Minimum 8 caractères requis'});return;}
    setSavingPwd(true);
    try{
      await api.put(`/users/${user?.id}`,{password:pwd.nouveau,currentPassword:pwd.current});
      setPwdAlert({type:'success',msg:'Mot de passe modifié avec succès'});
      setPwd({current:'',nouveau:'',confirm:''});
    }catch{
      setPwdAlert({type:'error',msg:'Mot de passe actuel incorrect ou erreur serveur'});
    }
    setSavingPwd(false);
  };

  const lbl={fontSize:11,color:C.text3,marginBottom:4,display:'block',fontWeight:500};

  return (
    <>
      <Card title="Changer le mot de passe" sub="Minimum 8 caractères"
        onSave={savePwd} saving={savingPwd} alert={pwdAlert} setAlert={setPwdAlert}>
        <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:4}}>
          <div><label style={lbl}>Mot de passe actuel</label><Inp value={pwd.current} onChange={v=>setPwd({...pwd,current:v})} type="password" placeholder="Votre mot de passe actuel"/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div><label style={lbl}>Nouveau mot de passe</label><Inp value={pwd.nouveau} onChange={v=>setPwd({...pwd,nouveau:v})} type="password" placeholder="Minimum 8 caractères"/></div>
            <div><label style={lbl}>Confirmer le nouveau</label><Inp value={pwd.confirm} onChange={v=>setPwd({...pwd,confirm:v})} type="password" placeholder="Répéter le mot de passe"/></div>
          </div>
        </div>
      </Card>
      <Card title="Authentification à deux facteurs"
        alert={saved?{type:'success',msg:'Paramètres de sécurité sauvegardés'}:null}
        setAlert={()=>setSaved(false)}>
        <Row label="Activer l'authentification 2FA" sub="Une vérification SMS requise à chaque connexion">
          <Toggle val={twofa} onChange={v=>{setTwofa(v);localStorage.setItem('cleanit_2fa',v?'1':'0');setSaved(true);setTimeout(()=>setSaved(false),2000);}}/>
        </Row>
        <Row label="Sessions actives" sub="Gérez vos connexions actives">
          <span style={{fontSize:12,color:C.text3}}>1 session active</span>
        </Row>
      </Card>
      <Card title="Journal d'activité" sub="Dernières actions sur votre compte">
        {[
          ['Connexion réussie','Aujourd\'hui · Chrome · Douala'],
          ['Profil consulté','Aujourd\'hui · Firefox · Douala'],
          ['Connexion réussie','Hier · Safari · Yaoundé'],
        ].map(([a,d],i)=>(
          <div key={i} style={{padding:'10px 0',borderBottom:`1px solid ${C.border2}`,display:'flex',justifyContent:'space-between',fontSize:12}}>
            <span style={{color:C.text,fontWeight:500}}>{a}</span>
            <span style={{color:C.text3}}>{d}</span>
          </div>
        ))}
      </Card>
    </>
  );
}

function TabApparence(){
  const stored=()=>{try{return JSON.parse(localStorage.getItem('cleanit_apparence')||'{}');}catch{return{};}};
  const [p,setP]=useState({theme:'light',couleur:'blue',density:'normal',lang:'fr',...stored()});
  const [saved,setSaved]=useState(false);
  const COULEURS=[{id:'blue',c:'#185FA5'},{id:'green',c:'#3B6D11'},{id:'purple',c:'#403294'},{id:'red',c:'#A32D2D'},{id:'orange',c:'#854F0B'}];

  const applyTheme=(theme,couleur)=>{
    const root=document.documentElement;
    if(theme==='dark'){root.style.setProperty('--bg-color','#1a1a2e');root.style.setProperty('--text-color','#e2e8f0');document.body.style.background='#1a1a2e';}
    else{root.style.setProperty('--bg-color','#F9FAFB');root.style.setProperty('--text-color','#111827');document.body.style.background='';}
    const COLS={'blue':'#185FA5','green':'#3B6D11','purple':'#403294','red':'#A32D2D','orange':'#854F0B'};
    if(COLS[couleur]) root.style.setProperty('--primary-color',COLS[couleur]);
  };
  const save=()=>{
    localStorage.setItem('cleanit_apparence',JSON.stringify(p));
    // Appliquer immédiatement via data-attributes
    const root=document.documentElement;
    root.setAttribute('data-theme',p.theme==='dark'?'dark':'light');
    if(p.couleur&&p.couleur!=='blue') root.setAttribute('data-color',p.couleur);
    else root.removeAttribute('data-color');
    root.setAttribute('data-density',p.density||'normal');
    setSaved(true);setTimeout(()=>setSaved(false),2000);
  };
  useEffect(()=>{ applyTheme(p.theme,p.couleur); },[]);

  return (
    <Card title="Préférences d'affichage"
      onSave={save} saving={false}
      alert={saved?{type:'success',msg:'Préférences d\'affichage sauvegardées'}:null}
      setAlert={()=>setSaved(false)}>
      <Row label="Thème" sub="Clair, sombre ou automatique">
        <div style={{display:'flex',border:`1px solid ${C.border}`,borderRadius:8,overflow:'hidden'}}>
          {[['light','Clair'],['dark','Sombre'],['auto','Auto']].map(([id,l])=>(
            <button key={id} onClick={()=>setP({...p,theme:id})}
              style={{padding:'7px 14px',border:'none',background:p.theme===id?C.bg:'transparent',cursor:'pointer',fontSize:12,fontFamily:'inherit',color:p.theme===id?C.blue:C.text3,fontWeight:p.theme===id?600:400}}>
              {l}
            </button>
          ))}
        </div>
      </Row>
      <Row label="Couleur principale" sub="Couleur d'accent dans toute l'interface">
        <div style={{display:'flex',gap:7}}>
          {COULEURS.map(cl=>(
            <div key={cl.id} onClick={()=>setP({...p,couleur:cl.id})}
              style={{width:26,height:26,borderRadius:'50%',background:cl.c,cursor:'pointer',
                outline:p.couleur===cl.id?`3px solid ${cl.c}`:'none',outlineOffset:2,transition:'outline .15s'}}/>
          ))}
        </div>
      </Row>
      <Row label="Langue de l'interface" sub="Redémarrage requis pour application complète">
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <Sel value={p.lang} onChange={v=>{setP({...p,lang:v});localStorage.setItem('cleanit_lang',v);}} style={{width:160}}>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </Sel>
          {p.lang!==localStorage.getItem('cleanit_lang')&&<span style={{fontSize:10,color:C.orange,fontWeight:600}}>Recharger la page</span>}
        </div>
      </Row>
      <Row label="Densité d'affichage">
        <Sel value={p.density} onChange={v=>setP({...p,density:v})} style={{width:160}}>
          <option value="compact">Compact</option>
          <option value="normal">Normal</option>
          <option value="comfortable">Confortable</option>
        </Sel>
      </Row>
    </Card>
  );
}


function BtnConfigurer({igId}){
  const configure=()=>{
    const configs={
      sendgrid:()=>{const k=window.prompt('Clé API SendGrid:');if(k)localStorage.setItem('cleanit_sendgrid_key',k);},
      googlecal:()=>{const id=window.prompt('Client ID Google Calendar:');if(id)localStorage.setItem('cleanit_gcal_id',id);},
      whatsapp:()=>{const t=window.prompt('Token WhatsApp Business API:');if(t)localStorage.setItem('cleanit_wa_token',t);},
    };
    const fn=configs[igId];
    if(fn){fn();window.location.reload();}
    else window.alert('Configuration disponible prochainement.');
  };
  return <button onClick={configure} style={{fontSize:11,padding:'4px 10px',borderRadius:5,border:'1px solid #185FA5',background:'#E6F1FB',cursor:'pointer',fontFamily:'inherit',color:'#185FA5',fontWeight:500}}>Configurer</button>;
}

function TabIntegrations(){
  const integrations=[
    {id:'groq',name:'Groq API — Llama 3',desc:'Moteur IA de ChaCha — connecté et actif',status:'connecté',icon:ICONS.check},
    {id:'cleanitcomm',name:'CleanIT Comm',desc:'Communication interne — messagerie et réunions. Intégré nativement.',status:'natif',icon:ICONS.check},
    {id:'sendgrid',name:'SendGrid — Email',desc:'Pour envoyer de vraies notifications email aux utilisateurs',status:'non configuré',icon:ICONS.alert},
    {id:'googlecal',name:'Google Calendar',desc:'Synchronise votre Planning CleanIT avec Google Agenda sur mobile',status:'non configuré',icon:ICONS.alert},
    {id:'whatsapp',name:'WhatsApp — Notifications',desc:'Notifie les techniciens sur WhatsApp lors d\'assignation de mission',status:'non configuré',icon:ICONS.alert},
  ];

  const stColors={
    'connecté':[C.green_l,C.green,'✓ Connecté'],
    'natif':[C.blue_l,C.blue,'✓ Natif'],
    'non configuré':[C.border2,C.text3,'Non configuré'],
  };

  return (
    <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden'}}>
      <div style={{padding:'16px 20px',borderBottom:`1px solid ${C.border2}`}}>
        <div style={{fontSize:14,fontWeight:600,color:C.text}}>Intégrations</div>
        <div style={{fontSize:12,color:C.text3,marginTop:2}}>Connectez CleanIT ERP à des services externes</div>
      </div>
      {integrations.map((ig,i)=>{
        const [bg,c,label]=stColors[ig.status]||stColors['non configuré'];
        return (
          <div key={ig.id} style={{padding:'14px 20px',borderBottom:i<integrations.length-1?`1px solid ${C.border2}`:'none',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:40,height:40,borderRadius:9,background:ig.status==='non configuré'?C.bg:bg,display:'flex',alignItems:'center',justifyContent:'center',border:`1px solid ${C.border}`,flexShrink:0}}>
                <Icon d={ig.icon} size={16} color={ig.status==='non configuré'?C.text3:c}/>
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:500,color:C.text}}>{ig.name}</div>
                <div style={{fontSize:11,color:C.text3}}>{ig.desc}</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:11,padding:'3px 9px',borderRadius:20,background:bg,color:c,fontWeight:600}}>{label}</span>
              {ig.status==='non configuré'&&(
<BtnConfigurer igId={ig.id}/>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Profile(){
  const [section,setSection]=useState('profil');
  const [user,setUser]=useState(()=>{
    try{const u=localStorage.getItem('cleanit_user');if(u){const p=JSON.parse(u);return {id:p.id||p.userId||1,firstName:p.firstName||p.name?.split(' ')[0]||'Utilisateur',lastName:p.lastName||p.name?.split(' ')[1]||'',email:p.email||'',phone:p.phone||'',role:p.role||'ADMIN',region:p.region||'Douala',photoUrl:p.photoUrl||null};}}catch{}
    return {id:1,firstName:'Jérôme',lastName:'Bell',email:'jerome@cleanit.cm',phone:'+237 677 000 001',role:'ADMIN',region:'Douala'};
  });
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    // Charger depuis localStorage IMMÉDIATEMENT
    const stored=localStorage.getItem('cleanit_user');
    if(stored){try{setUser(JSON.parse(stored));}catch{}}
    setLoading(false);
    // Rafraîchir depuis l'API en arrière-plan
    api.get('/auth/me').then(r=>{
      setUser(r.data);
      localStorage.setItem('cleanit_user',JSON.stringify(r.data));
    }).catch(()=>{});
  },[]);

  const isAdmin=['ADMIN','DG'].includes(user?.role);
  const visibleSections=SECTIONS.filter(s=>s.id!=='utilisateurs'||isAdmin);

  const TABS={
    profil:<TabProfil user={user} setUser={setUser}/>,
    entreprise:<TabEntreprise/>,
    notifications:<TabNotifications/>,
    planning:<TabPlanning/>,
    utilisateurs:<TabUtilisateurs currentUser={user}/>,
    securite:<TabSecurite user={user}/>,
    apparence:<TabApparence/>,
    integrations:<TabIntegrations/>,
  };

  if(loading) return <div style={{display:'flex',height:'100%',alignItems:'center',justifyContent:'center',fontSize:13,color:C.text3}}>Chargement...</div>;

  return (
    <div style={{display:'flex',height:'100%',background:C.bg,fontFamily:'inherit'}}>
      {/* Sidebar paramètres */}
      <div style={{width:230,borderRight:`1px solid ${C.border}`,background:C.white,flexShrink:0,display:'flex',flexDirection:'column'}}>
        <div style={{padding:'18px 16px',borderBottom:`1px solid ${C.border2}`}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
          <img src="/logo.png" alt="CleanIT" style={{height:22,objectFit:'contain'}}/>
        </div>
        <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:2}}>Paramètres</div>
          {user&&<div style={{fontSize:12,color:C.text3}}>{user.firstName} {user.lastName} · {ROLES[user.role]||user.role}</div>}
        </div>
        <nav style={{padding:'8px 0',flex:1,overflowY:'auto'}}>
          {visibleSections.map(s=>(
            <button key={s.id} onClick={()=>setSection(s.id)}
              style={{width:'100%',textAlign:'left',padding:'9px 14px',border:'none',
                background:section===s.id?C.bg:'transparent',cursor:'pointer',fontFamily:'inherit',
                fontSize:13,color:section===s.id?C.blue:C.text2,fontWeight:section===s.id?600:400,
                borderLeft:section===s.id?`2px solid ${C.blue}`:'2px solid transparent',
                display:'flex',alignItems:'center',gap:10,transition:'all .12s'}}>
              <Icon d={ICONS[s.icon]} size={15} color={section===s.id?C.blue:C.text3}/>
              {s.label}
            </button>
          ))}
        </nav>
        <div style={{padding:'12px 16px',borderTop:`1px solid ${C.border2}`}}>
          <button onClick={()=>{localStorage.removeItem('cleanit_user');window.location.href='/login';}}
            style={{width:'100%',padding:'9px',borderRadius:8,border:`1px solid ${C.red}`,background:C.red_l,color:C.red,cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:7}}>
            <Icon d={ICONS.logout} size={14} color={C.red}/>Se déconnecter
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div style={{flex:1,overflowY:'auto',padding:'24px 28px'}}>
        <div style={{maxWidth:700}}>
          {TABS[section]||null}
        </div>
      </div>
    </div>
  );
}
