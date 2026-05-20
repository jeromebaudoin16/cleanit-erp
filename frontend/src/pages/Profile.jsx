import { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';

const C = {
  blue:'#185FA5', blue_l:'#E6F1FB', blue_d:'#0C447C',
  green:'#3B6D11', green_l:'#EAF3DE',
  orange:'#854F0B', orange_l:'#FAEEDA',
  red:'#A32D2D', red_l:'#FCEBEB',
  border:'#E5E7EB', border2:'#F3F4F6',
  text:'#111827', text2:'#374151', text3:'#6B7280',
  white:'#FFFFFF', bg:'#F9FAFB',
};

const ROLES = {
  ADMIN:'Admin Système', DG:'Directeur Général', FINANCE:'Comptable',
  PROJECT_MANAGER:'Chef de Projet', TECHNICIAN:'Chef Terrain', HR:'Responsable RH',
};

const USERS_SEED = [
  {id:1,firstName:'Jérôme',lastName:'Bell',email:'jerome@cleanit.cm',role:'DG',statut:'actif',createdAt:'2024-01-01'},
  {id:2,firstName:'Marie',lastName:'Kamga',email:'finance@cleanit.cm',role:'FINANCE',statut:'actif',createdAt:'2024-01-01'},
  {id:3,firstName:'Thomas',lastName:'Ngono',email:'chef@cleanit.cm',role:'PROJECT_MANAGER',statut:'actif',createdAt:'2024-01-15'},
  {id:4,firstName:'Pierre',lastName:'Etoga',email:'terrain@cleanit.cm',role:'TECHNICIAN',statut:'actif',createdAt:'2024-02-01'},
  {id:5,firstName:'Sophie',lastName:'Mbarga',email:'hr@cleanit.cm',role:'HR',statut:'actif',createdAt:'2024-02-15'},
  {id:6,firstName:'Claude',lastName:'Admin',email:'admin@cleanit.cm',role:'ADMIN',statut:'actif',createdAt:'2024-01-01'},
];

const SECTIONS = [
  {id:'profil',     label:'Mon profil',          icon:'👤'},
  {id:'entreprise', label:'Entreprise',           icon:'🏢'},
  {id:'notifications',label:'Notifications',     icon:'🔔'},
  {id:'planning',   label:'Planning & Agenda',   icon:'📅'},
  {id:'utilisateurs',label:'Utilisateurs & Rôles',icon:'👥'},
  {id:'securite',   label:'Sécurité',            icon:'🔒'},
  {id:'apparence',  label:'Apparence',           icon:'🎨'},
  {id:'integrations',label:'Intégrations',       icon:'🔗'},
];

const Toggle = ({val, onChange}) => (
  <div onClick={()=>onChange(!val)} style={{width:40,height:22,borderRadius:11,background:val?C.blue:C.border,cursor:'pointer',position:'relative',transition:'background .2s',flexShrink:0}}>
    <div style={{position:'absolute',top:2,left:val?20:2,width:18,height:18,borderRadius:'50%',background:C.white,transition:'left .2s',boxShadow:'0 1px 3px rgba(0,0,0,.2)'}}/>
  </div>
);

const Field = ({label,sub,children}) => (
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 0',borderBottom:`1px solid ${C.border2}`}}>
    <div style={{flex:1,marginRight:20}}>
      <div style={{fontSize:13,fontWeight:500,color:C.text,marginBottom:sub?2:0}}>{label}</div>
      {sub&&<div style={{fontSize:11,color:C.text3}}>{sub}</div>}
    </div>
    <div style={{flexShrink:0}}>{children}</div>
  </div>
);

const Inp = ({value,onChange,placeholder,type='text',readOnly=false}) => (
  <input value={value} onChange={e=>onChange?.(e.target.value)} placeholder={placeholder} type={type} readOnly={readOnly}
    style={{padding:'8px 12px',borderRadius:7,border:`1px solid ${C.border}`,fontSize:13,fontFamily:'inherit',outline:'none',background:readOnly?C.bg:C.white,color:readOnly?C.text3:C.text,width:'100%',boxSizing:'border-box'}}
    onFocus={e=>{if(!readOnly)e.target.style.borderColor=C.blue;}}
    onBlur={e=>e.target.style.borderColor=C.border}
  />
);

const Sel = ({value,onChange,children}) => (
  <select value={value} onChange={e=>onChange(e.target.value)}
    style={{padding:'8px 12px',borderRadius:7,border:`1px solid ${C.border}`,fontSize:13,fontFamily:'inherit',outline:'none',background:C.white,color:C.text,cursor:'pointer'}}>
    {children}
  </select>
);

const SaveBtn = ({onClick,saved}) => (
  <button onClick={onClick} style={{padding:'8px 20px',borderRadius:7,border:'none',background:saved?C.green:C.blue,color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'background .3s'}}>
    {saved?'✓ Sauvegardé':'Sauvegarder'}
  </button>
);

function SectionCard({title,sub,children,onSave,saved}){
  return (
    <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden',marginBottom:16}}>
      <div style={{padding:'16px 20px',borderBottom:`1px solid ${C.border2}`}}>
        <div style={{fontSize:14,fontWeight:600,color:C.text}}>{title}</div>
        {sub&&<div style={{fontSize:12,color:C.text3,marginTop:2}}>{sub}</div>}
      </div>
      <div style={{padding:'0 20px 16px'}}>
        {children}
      </div>
      {onSave&&(
        <div style={{padding:'12px 20px',borderTop:`1px solid ${C.border2}`,display:'flex',justifyContent:'flex-end',background:C.bg}}>
          <SaveBtn onClick={onSave} saved={saved}/>
        </div>
      )}
    </div>
  );
}

function TabProfil({user}){
  const [form,setForm] = useState({
    firstName:user?.firstName||'Jérôme',lastName:user?.lastName||'Bell',
    email:user?.email||'jerome@cleanit.cm',phone:'+237 677 000 000',
    role:user?.role||'DG',region:'Douala',
    bio:'Directeur Général de CleanIT Cameroun',
  });
  const [pwd,setPwd] = useState({current:'',nouveau:'',confirm:''});
  const [saved1,setSaved1] = useState(false);
  const [saved2,setSaved2] = useState(false);

  const save1 = () => {
    setSaved1(true);
    setTimeout(()=>setSaved1(false),2500);
  };
  const save2 = () => {
    if(pwd.nouveau!==pwd.confirm){alert('Les mots de passe ne correspondent pas.');return;}
    if(pwd.nouveau.length<8){alert('Le mot de passe doit faire au moins 8 caractères.');return;}
    setSaved2(true);
    setPwd({current:'',nouveau:'',confirm:''});
    setTimeout(()=>setSaved2(false),2500);
  };

  return (
    <>
      <SectionCard title="Informations personnelles" sub="Ces informations sont visibles par toute l'équipe CleanIT" onSave={save1} saved={saved1}>
        <div style={{display:'flex',alignItems:'center',gap:16,padding:'16px 0',borderBottom:`1px solid ${C.border2}`,marginBottom:8}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:C.blue_l,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:600,color:C.blue_d,flexShrink:0}}>
            {form.firstName[0]}{form.lastName[0]}
          </div>
          <div>
            <button style={{padding:'6px 14px',borderRadius:7,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontSize:12,fontFamily:'inherit',marginRight:8}}>Changer la photo</button>
            <div style={{fontSize:11,color:C.text3,marginTop:4}}>JPG, PNG — max 2 Mo</div>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:4}}>
          <div><div style={{fontSize:11,color:C.text3,marginBottom:4}}>Prénom</div><Inp value={form.firstName} onChange={v=>setForm({...form,firstName:v})}/></div>
          <div><div style={{fontSize:11,color:C.text3,marginBottom:4}}>Nom</div><Inp value={form.lastName} onChange={v=>setForm({...form,lastName:v})}/></div>
          <div><div style={{fontSize:11,color:C.text3,marginBottom:4}}>Email</div><Inp value={form.email} onChange={v=>setForm({...form,email:v})} type="email"/></div>
          <div><div style={{fontSize:11,color:C.text3,marginBottom:4}}>Téléphone</div><Inp value={form.phone} onChange={v=>setForm({...form,phone:v})}/></div>
          <div><div style={{fontSize:11,color:C.text3,marginBottom:4}}>Rôle</div><Inp value={ROLES[form.role]||form.role} readOnly/></div>
          <div><div style={{fontSize:11,color:C.text3,marginBottom:4}}>Région</div><Inp value={form.region} onChange={v=>setForm({...form,region:v})}/></div>
        </div>
      </SectionCard>

      <SectionCard title="Mot de passe" sub="Choisissez un mot de passe fort d'au moins 8 caractères" onSave={save2} saved={saved2}>
        <div style={{display:'flex',flexDirection:'column',gap:12,marginTop:8}}>
          <div><div style={{fontSize:11,color:C.text3,marginBottom:4}}>Mot de passe actuel</div><Inp value={pwd.current} onChange={v=>setPwd({...pwd,current:v})} type="password" placeholder="••••••••"/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div><div style={{fontSize:11,color:C.text3,marginBottom:4}}>Nouveau mot de passe</div><Inp value={pwd.nouveau} onChange={v=>setPwd({...pwd,nouveau:v})} type="password" placeholder="••••••••"/></div>
            <div><div style={{fontSize:11,color:C.text3,marginBottom:4}}>Confirmer</div><Inp value={pwd.confirm} onChange={v=>setPwd({...pwd,confirm:v})} type="password" placeholder="••••••••"/></div>
          </div>
        </div>
      </SectionCard>
    </>
  );
}

function TabEntreprise(){
  const [form,setForm] = useState({
    nom:'CleanIT Cameroun SARL',secteur:'Sous-traitance télécom',
    adresse:'Avenue de la Liberté, Douala',bp:'BP 12345 Douala',
    tel:'+237 233 000 000',email:'contact@cleanit.cm',site:'www.cleanit.cm',
    capital:'10 000 000',rccm:'DLA/2024/B/12345',
    devise:'FCFA',timezone:'Africa/Douala',dateFormat:'DD/MM/YYYY',
    exercice:'Janvier – Décembre',
  });
  const [saved,setSaved]=useState(false);
  const save=()=>{setSaved(true);setTimeout(()=>setSaved(false),2500);};

  return (
    <>
      <SectionCard title="Informations de l'entreprise" onSave={save} saved={saved}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:8}}>
          <div style={{gridColumn:'1/3'}}><div style={{fontSize:11,color:C.text3,marginBottom:4}}>Raison sociale</div><Inp value={form.nom} onChange={v=>setForm({...form,nom:v})}/></div>
          <div><div style={{fontSize:11,color:C.text3,marginBottom:4}}>Secteur d'activité</div><Inp value={form.secteur} onChange={v=>setForm({...form,secteur:v})}/></div>
          <div><div style={{fontSize:11,color:C.text3,marginBottom:4}}>RCCM</div><Inp value={form.rccm} onChange={v=>setForm({...form,rccm:v})}/></div>
          <div style={{gridColumn:'1/3'}}><div style={{fontSize:11,color:C.text3,marginBottom:4}}>Adresse</div><Inp value={form.adresse} onChange={v=>setForm({...form,adresse:v})}/></div>
          <div><div style={{fontSize:11,color:C.text3,marginBottom:4}}>Téléphone</div><Inp value={form.tel} onChange={v=>setForm({...form,tel:v})}/></div>
          <div><div style={{fontSize:11,color:C.text3,marginBottom:4}}>Email entreprise</div><Inp value={form.email} onChange={v=>setForm({...form,email:v})}/></div>
          <div><div style={{fontSize:11,color:C.text3,marginBottom:4}}>Capital social</div><Inp value={form.capital} onChange={v=>setForm({...form,capital:v})}/></div>
          <div><div style={{fontSize:11,color:C.text3,marginBottom:4}}>Site web</div><Inp value={form.site} onChange={v=>setForm({...form,site:v})}/></div>
        </div>
      </SectionCard>
      <SectionCard title="Paramètres régionaux & comptables">
        <Field label="Devise" sub="Utilisée dans CleanITBooks et toutes les factures">
          <Sel value={form.devise} onChange={v=>setForm({...form,devise:v})}>
            <option>FCFA</option><option>EUR</option><option>USD</option>
          </Sel>
        </Field>
        <Field label="Fuseau horaire">
          <Sel value={form.timezone} onChange={v=>setForm({...form,timezone:v})}>
            <option>Africa/Douala</option><option>Africa/Lagos</option><option>Europe/Paris</option>
          </Sel>
        </Field>
        <Field label="Format de date">
          <Sel value={form.dateFormat} onChange={v=>setForm({...form,dateFormat:v})}>
            <option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option>
          </Sel>
        </Field>
        <Field label="Exercice comptable" sub="SYSCOHADA — année fiscale de référence">
          <span style={{fontSize:13,color:C.text}}>{form.exercice}</span>
        </Field>
      </SectionCard>
    </>
  );
}

function TabNotifications(){
  const [notifs,setNotifs]=useState({
    email_facture:true, email_approbation:true, email_mission:true,
    email_certif:true, email_conge:false, email_planning:true,
    sys_facture:true, sys_approbation:true, sys_mission:true,
    sys_terrain:true, sys_bi:false, sys_rh:true,
    rappel_planning:true, rappel_delai:'15',
  });
  const [saved,setSaved]=useState(false);
  const save=()=>{setSaved(true);setTimeout(()=>setSaved(false),2500);};

  return (
    <>
      <SectionCard title="Notifications email" sub="Envoyées à votre adresse email CleanIT" onSave={save} saved={saved}>
        {[
          ['email_facture','Nouvelle facture créée','CleanITBooks'],
          ['email_approbation','Demande d\'approbation reçue','Approvals'],
          ['email_mission','Mission terrain assignée','Gestion Terrain'],
          ['email_certif','Certification expirée ou proche de l\'expiration','Techniciens'],
          ['email_conge','Demande de congé soumise','RH'],
          ['email_planning','Rappel d\'événement Planning','Planning'],
        ].map(([k,l,s])=>(
          <Field key={k} label={l} sub={s}>
            <Toggle val={notifs[k]} onChange={v=>setNotifs({...notifs,[k]:v})}/>
          </Field>
        ))}
      </SectionCard>
      <SectionCard title="Notifications système" sub="Alertes dans l'interface CleanIT">
        {[
          ['sys_facture','Factures en attente de validation'],
          ['sys_approbation','Approbations en attente'],
          ['sys_mission','Nouvelles missions disponibles'],
          ['sys_terrain','Alertes terrain (urgences, incidents)'],
          ['sys_bi','Rapports Business Intelligence générés'],
          ['sys_rh','Alertes RH (certifications, congés)'],
        ].map(([k,l])=>(
          <Field key={k} label={l}>
            <Toggle val={notifs[k]} onChange={v=>setNotifs({...notifs,[k]:v})}/>
          </Field>
        ))}
      </SectionCard>
      <SectionCard title="Rappels Planning">
        <Field label="Rappel avant un événement" sub="Notification envoyée X minutes avant le début">
          <Sel value={notifs.rappel_delai} onChange={v=>setNotifs({...notifs,rappel_delai:v})}>
            <option value="5">5 min avant</option>
            <option value="15">15 min avant</option>
            <option value="30">30 min avant</option>
            <option value="60">1 heure avant</option>
          </Sel>
        </Field>
        <Field label="Briefing quotidien ChaCha" sub="Résumé de la journée envoyé chaque matin à 7h30">
          <Toggle val={notifs.rappel_planning} onChange={v=>setNotifs({...notifs,rappel_planning:v})}/>
        </Field>
      </SectionCard>
    </>
  );
}

function TabPlanning(){
  const [prefs,setPrefs]=useState({
    heure_debut:'08',heure_fin:'18',
    jours:[1,2,3,4,5],
    focus_lundi:false,focus_mardi:false,focus_mercredi:true,focus_jeudi:false,focus_vendredi:false,
    focus_debut:'09',focus_fin:'12',
    buffer:'15',autoSchedule:true,recurr:true,
  });
  const [saved,setSaved]=useState(false);
  const JOURS=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

  return (
    <>
      <SectionCard title="Heures de travail" sub="ChaCha ne planifiera jamais en dehors de ces heures" onSave={()=>{setSaved(true);setTimeout(()=>setSaved(false),2500);}} saved={saved}>
        <Field label="Début de journée">
          <Sel value={prefs.heure_debut} onChange={v=>setPrefs({...prefs,heure_debut:v})}>
            {['06','07','08','09','10'].map(h=><option key={h} value={h}>{h}h00</option>)}
          </Sel>
        </Field>
        <Field label="Fin de journée">
          <Sel value={prefs.heure_fin} onChange={v=>setPrefs({...prefs,heure_fin:v})}>
            {['17','18','19','20','21'].map(h=><option key={h} value={h}>{h}h00</option>)}
          </Sel>
        </Field>
        <Field label="Jours travaillés">
          <div style={{display:'flex',gap:5}}>
            {JOURS.map((j,i)=>(
              <button key={i} onClick={()=>setPrefs(p=>({...p,jours:p.jours.includes(i+1)?p.jours.filter(d=>d!==i+1):[...p.jours,i+1]}))}
                style={{width:32,height:32,borderRadius:6,border:`1px solid ${prefs.jours.includes(i+1)?C.blue:C.border}`,background:prefs.jours.includes(i+1)?C.blue_l:'none',color:prefs.jours.includes(i+1)?C.blue:C.text3,cursor:'pointer',fontSize:11,fontWeight:prefs.jours.includes(i+1)?600:400,fontFamily:'inherit'}}>
                {j}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Temps tampon entre réunions" sub="ChaCha ajoute ce délai automatiquement">
          <Sel value={prefs.buffer} onChange={v=>setPrefs({...prefs,buffer:v})}>
            <option value="0">Aucun</option>
            <option value="10">10 min</option>
            <option value="15">15 min</option>
            <option value="30">30 min</option>
          </Sel>
        </Field>
      </SectionCard>

      <SectionCard title="Focus time" sub="Créneaux protégés — aucune réunion ne peut être planifiée pendant ces heures">
        <Field label="Jours de focus">
          <div style={{display:'flex',gap:5}}>
            {['Lun','Mar','Mer','Jeu','Ven'].map((j,i)=>{
              const k=`focus_${['lundi','mardi','mercredi','jeudi','vendredi'][i]}`;
              return (
                <button key={i} onClick={()=>setPrefs(p=>({...p,[k]:!p[k]}))}
                  style={{width:32,height:32,borderRadius:6,border:`1px solid ${prefs[k]?C.purple:C.border}`,background:prefs[k]?'#F3EEF9':'none',color:prefs[k]?'#403294':C.text3,cursor:'pointer',fontSize:11,fontFamily:'inherit'}}>
                  {j}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Horaire focus">
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <Sel value={prefs.focus_debut} onChange={v=>setPrefs({...prefs,focus_debut:v})}>
              {['08','09','10','11'].map(h=><option key={h} value={h}>{h}h</option>)}
            </Sel>
            <span style={{color:C.text3,fontSize:12}}>→</span>
            <Sel value={prefs.focus_fin} onChange={v=>setPrefs({...prefs,focus_fin:v})}>
              {['11','12','13','14'].map(h=><option key={h} value={h}>{h}h</option>)}
            </Sel>
          </div>
        </Field>
        <Field label="Auto-scheduling ChaCha" sub="ChaCha place automatiquement vos tâches dans les créneaux libres">
          <Toggle val={prefs.autoSchedule} onChange={v=>setPrefs({...prefs,autoSchedule:v})}/>
        </Field>
        <Field label="Événements récurrents" sub="Activer la répétition automatique des événements">
          <Toggle val={prefs.recurr} onChange={v=>setPrefs({...prefs,recurr:v})}/>
        </Field>
      </SectionCard>
    </>
  );
}

function TabUtilisateurs(){
  const [users,setUsers]=useState(USERS_SEED);
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({firstName:'',lastName:'',email:'',role:'TECHNICIAN'});
  const [search,setSearch]=useState('');

  const filtered=users.filter(u=>
    (u.firstName+' '+u.lastName+' '+u.email).toLowerCase().includes(search.toLowerCase())
  );

  const addUser=()=>{
    if(!form.email||!form.firstName) return;
    setUsers(p=>[...p,{...form,id:Date.now(),statut:'actif',createdAt:new Date().toISOString().slice(0,10)}]);
    setForm({firstName:'',lastName:'',email:'',role:'TECHNICIAN'});
    setShowAdd(false);
  };

  const toggleStatut=(id)=>setUsers(p=>p.map(u=>u.id===id?{...u,statut:u.statut==='actif'?'inactif':'actif'}:u));
  const deleteUser=(id)=>{if(window.confirm('Supprimer cet utilisateur ?'))setUsers(p=>p.filter(u=>u.id!==id));};

  const ROLE_COLORS={DG:[C.red_l,C.red],ADMIN:['#F3EEF9','#403294'],FINANCE:['#EAF3DE',C.green],PROJECT_MANAGER:[C.blue_l,C.blue_d],TECHNICIAN:['#F3F4F6',C.text3],HR:[C.orange_l,C.orange]};

  return (
    <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden'}}>
      <div style={{padding:'16px 20px',borderBottom:`1px solid ${C.border2}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:14,fontWeight:600,color:C.text}}>Utilisateurs & Rôles</div>
          <div style={{fontSize:12,color:C.text3,marginTop:2}}>{users.length} utilisateurs · {users.filter(u=>u.statut==='actif').length} actifs</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." style={{padding:'7px 12px',borderRadius:7,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit',outline:'none',width:180}}/>
          <button onClick={()=>setShowAdd(!showAdd)} style={{padding:'7px 16px',borderRadius:7,border:'none',background:C.blue,color:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600}}>+ Ajouter</button>
        </div>
      </div>

      {showAdd&&(
        <div style={{padding:'14px 20px',background:C.blue_l,borderBottom:`1px solid #B5D4F4`}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 2fr 1fr auto',gap:8,alignItems:'end'}}>
            <div><div style={{fontSize:10,color:C.text3,marginBottom:3}}>Prénom</div><input value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} style={{width:'100%',padding:'7px 9px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/></div>
            <div><div style={{fontSize:10,color:C.text3,marginBottom:3}}>Nom</div><input value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} style={{width:'100%',padding:'7px 9px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/></div>
            <div><div style={{fontSize:10,color:C.text3,marginBottom:3}}>Email</div><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} type="email" style={{width:'100%',padding:'7px 9px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/></div>
            <div><div style={{fontSize:10,color:C.text3,marginBottom:3}}>Rôle</div>
              <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} style={{width:'100%',padding:'7px 9px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'inherit',outline:'none'}}>
                {Object.entries(ROLES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div style={{display:'flex',gap:5}}>
              <button onClick={addUser} style={{padding:'7px 12px',borderRadius:6,border:'none',background:C.blue,color:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600}}>Créer</button>
              <button onClick={()=>setShowAdd(false)} style={{padding:'7px 10px',borderRadius:6,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit',fontSize:12}}>✕</button>
            </div>
          </div>
        </div>
      )}

      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead>
          <tr style={{background:C.bg}}>
            {['Utilisateur','Email','Rôle','Statut','Créé le','Actions'].map(h=>(
              <th key={h} style={{textAlign:'left',padding:'9px 16px',fontSize:11,fontWeight:600,color:C.text3,textTransform:'uppercase',letterSpacing:.5,borderBottom:`1px solid ${C.border}`}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map(u=>{
            const [rbg,rc]=ROLE_COLORS[u.role]||['#F3F4F6',C.text3];
            return (
              <tr key={u.id} style={{borderBottom:`1px solid ${C.border2}`}}
                onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{padding:'11px 16px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:9}}>
                    <div style={{width:32,height:32,borderRadius:'50%',background:C.blue_l,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,color:C.blue_d,flexShrink:0}}>
                      {u.firstName[0]}{u.lastName[0]}
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:500,color:C.text}}>{u.firstName} {u.lastName}</div>
                    </div>
                  </div>
                </td>
                <td style={{padding:'11px 16px',fontSize:12,color:C.text3}}>{u.email}</td>
                <td style={{padding:'11px 16px'}}>
                  <span style={{fontSize:11,padding:'3px 9px',borderRadius:20,background:rbg,color:rc,fontWeight:600}}>{ROLES[u.role]||u.role}</span>
                </td>
                <td style={{padding:'11px 16px'}}>
                  <span style={{fontSize:11,padding:'3px 9px',borderRadius:20,background:u.statut==='actif'?C.green_l:C.border2,color:u.statut==='actif'?C.green:C.text3,fontWeight:600}}>{u.statut==='actif'?'Actif':'Inactif'}</span>
                </td>
                <td style={{padding:'11px 16px',fontSize:12,color:C.text3}}>{u.createdAt}</td>
                <td style={{padding:'11px 16px'}}>
                  <div style={{display:'flex',gap:5}}>
                    <button onClick={()=>toggleStatut(u.id)} style={{fontSize:11,padding:'4px 9px',borderRadius:5,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit',color:C.text3}}>
                      {u.statut==='actif'?'Désactiver':'Activer'}
                    </button>
                    <button onClick={()=>deleteUser(u.id)} style={{fontSize:11,padding:'4px 9px',borderRadius:5,border:`1px solid #FCA5A5`,background:C.red_l,cursor:'pointer',fontFamily:'inherit',color:C.red}}>✕</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TabSecurite(){
  const [twofa,setTwofa]=useState(false);
  const [sessions]=useState([
    {device:'Chrome · Windows 11',lieu:'Douala, CM',date:'Aujourd\'hui 09h14',current:true},
    {device:'Firefox · Ubuntu 24',lieu:'Douala, CM',date:'Hier 16h30',current:false},
    {device:'Safari · iPhone 15',lieu:'Yaoundé, CM',date:'14 mai 2025',current:false},
  ]);

  return (
    <>
      <SectionCard title="Authentification à deux facteurs" sub="Renforcez la sécurité de votre compte">
        <Field label="Activer l'authentification 2FA" sub="Une vérification par SMS sera requise à chaque connexion">
          <Toggle val={twofa} onChange={setTwofa}/>
        </Field>
      </SectionCard>
      <SectionCard title="Sessions actives" sub="Appareils connectés à votre compte CleanIT">
        {sessions.map((s,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',borderBottom:i<sessions.length-1?`1px solid ${C.border2}`:'none'}}>
            <div>
              <div style={{fontSize:13,fontWeight:500,color:C.text,display:'flex',alignItems:'center',gap:7}}>
                {s.device}
                {s.current&&<span style={{fontSize:10,padding:'2px 7px',borderRadius:10,background:C.green_l,color:C.green,fontWeight:600}}>Session actuelle</span>}
              </div>
              <div style={{fontSize:11,color:C.text3}}>{s.lieu} · {s.date}</div>
            </div>
            {!s.current&&<button style={{fontSize:11,padding:'4px 10px',borderRadius:5,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit',color:C.red}}>Déconnecter</button>}
          </div>
        ))}
        <button style={{marginTop:10,fontSize:12,padding:'7px 14px',borderRadius:7,border:`1px solid ${C.red}`,background:C.red_l,color:C.red,cursor:'pointer',fontFamily:'inherit',fontWeight:500}}>Déconnecter toutes les autres sessions</button>
      </SectionCard>
      <SectionCard title="Journal d'activité" sub="Dernières actions effectuées sur votre compte">
        {[
          ['Connexion réussie','Aujourd\'hui 09h14 · Chrome · Douala'],
          ['Mot de passe modifié','12 mai 2025 · 14h22'],
          ['Connexion réussie','10 mai 2025 · Safari · Douala'],
        ].map(([a,d],i)=>(
          <div key={i} style={{padding:'9px 0',borderBottom:`1px solid ${C.border2}`,display:'flex',justifyContent:'space-between',fontSize:12}}>
            <span style={{color:C.text}}>{a}</span><span style={{color:C.text3}}>{d}</span>
          </div>
        ))}
      </SectionCard>
    </>
  );
}

function TabApparence(){
  const [prefs,setPrefs]=useState({theme:'light',density:'normal',sidebar:'full',lang:'fr',couleur:'blue'});
  const [saved,setSaved]=useState(false);
  const THEMES=[{id:'light',l:'Clair'},{id:'dark',l:'Sombre'},{id:'auto',l:'Automatique'}];
  const COULEURS=[{id:'blue',c:'#185FA5'},{id:'green',c:'#3B6D11'},{id:'purple',c:'#403294'},{id:'red',c:'#A32D2D'},{id:'orange',c:'#854F0B'}];

  return (
    <SectionCard title="Préférences d'affichage" onSave={()=>{setSaved(true);setTimeout(()=>setSaved(false),2500);}} saved={saved}>
      <Field label="Thème" sub="Clair, sombre ou automatique selon le système">
        <div style={{display:'flex',border:`1px solid ${C.border}`,borderRadius:7,overflow:'hidden'}}>
          {THEMES.map(t=>(
            <button key={t.id} onClick={()=>setPrefs({...prefs,theme:t.id})} style={{padding:'6px 12px',border:'none',background:prefs.theme===t.id?C.bg:'transparent',cursor:'pointer',fontSize:12,fontFamily:'inherit',color:prefs.theme===t.id?C.blue:C.text3,fontWeight:prefs.theme===t.id?600:400}}>
              {t.l}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Couleur principale" sub="Couleur d'accent dans toute l'interface">
        <div style={{display:'flex',gap:6}}>
          {COULEURS.map(cl=>(
            <div key={cl.id} onClick={()=>setPrefs({...prefs,couleur:cl.id})} style={{width:24,height:24,borderRadius:'50%',background:cl.c,cursor:'pointer',border:prefs.couleur===cl.id?`3px solid ${cl.c}`:  `2px solid transparent`,outline:prefs.couleur===cl.id?`2px solid ${cl.c}40`:'none',transition:'all .15s'}}/>
          ))}
        </div>
      </Field>
      <Field label="Densité d'affichage">
        <Sel value={prefs.density} onChange={v=>setPrefs({...prefs,density:v})}>
          <option value="compact">Compact</option>
          <option value="normal">Normal</option>
          <option value="comfortable">Confortable</option>
        </Sel>
      </Field>
      <Field label="Barre de navigation">
        <Sel value={prefs.sidebar} onChange={v=>setPrefs({...prefs,sidebar:v})}>
          <option value="full">Complète (avec labels)</option>
          <option value="mini">Mini (icônes seulement)</option>
          <option value="auto">Automatique</option>
        </Sel>
      </Field>
      <Field label="Langue de l'interface">
        <Sel value={prefs.lang} onChange={v=>setPrefs({...prefs,lang:v})}>
          <option value="fr">Français</option>
          <option value="en">English</option>
        </Sel>
      </Field>
    </SectionCard>
  );
}

function TabIntegrations(){
  const [integrations]=useState([
    {id:'claude',name:'Groq API — Llama 3',desc:'Moteur IA de ChaCha — déjà connecté et actif',status:'connecté',color:'#403294'},
    {id:'sendgrid',name:'SendGrid — Email',desc:'Notifications et alertes email',status:'non configuré',color:C.text3},
    {id:'cleanitcomm',name:'CleanIT Comm',desc:'Communication interne native — pas besoin d\'intégration externe',status:'natif',color:C.green},
    {id:'googlecal',name:'Google Calendar',desc:'Synchronisation agenda externe',status:'non configuré',color:C.text3},
    {id:'whatsapp',name:'WhatsApp Business API',desc:'Notifications WhatsApp aux techniciens',status:'non configuré',color:C.text3},
  ]);

  return (
    <>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden',marginBottom:16}}>
        <div style={{padding:'16px 20px',borderBottom:`1px solid ${C.border2}`}}>
          <div style={{fontSize:14,fontWeight:600,color:C.text}}>Intégrations actives</div>
          <div style={{fontSize:12,color:C.text3,marginTop:2}}>Connectez CleanIT ERP à vos outils externes</div>
        </div>
        {integrations.map((integ,i)=>(
          <div key={i} style={{padding:'14px 20px',borderBottom:i<integrations.length-1?`1px solid ${C.border2}`:'none',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:40,height:40,borderRadius:9,background:integ.status==='connecté'?'#F3EEF9':C.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,border:`1px solid ${C.border}`,flexShrink:0}}>
                {integ.id==='groq'?'🧠':integ.id==='sendgrid'?'📧':integ.id==='googlecal'?'📅':integ.id==='cleanitcomm'?'💬':'📱'}
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:500,color:C.text}}>{integ.name}</div>
                <div style={{fontSize:11,color:C.text3}}>{integ.desc}</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:11,padding:'3px 9px',borderRadius:20,background:integ.status==='connecté'?C.green_l:integ.status==='natif'?C.blue_l:C.border2,color:integ.status==='connecté'?C.green:integ.status==='natif'?C.blue:C.text3,fontWeight:600}}>
                {integ.status==='connecté'?'✓ Connecté':integ.status==='natif'?'✓ Natif':'Non configuré'}
              </span>
              <button style={{fontSize:11,padding:'4px 10px',borderRadius:5,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit',color:C.text3}}>
                {integ.status==='connecté'?'Configurer':'Connecter'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden'}}>
        <div style={{padding:'16px 20px',borderBottom:`1px solid ${C.border2}`}}>
          <div style={{fontSize:14,fontWeight:600,color:C.text}}>Clé API CleanIT</div>
          <div style={{fontSize:12,color:C.text3,marginTop:2}}>Utilisez cette clé pour accéder à l'API CleanIT depuis vos outils</div>
        </div>
        <div style={{padding:'16px 20px'}}>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <div style={{flex:1,padding:'9px 12px',borderRadius:7,background:C.bg,border:`1px solid ${C.border}`,fontSize:12,fontFamily:'monospace',color:C.text3,letterSpacing:.5}}>
              cleanit_sk_•••••••••••••••••••••••••••••••
            </div>
            <button onClick={()=>alert('Clé copiée !')} style={{padding:'9px 14px',borderRadius:7,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit',fontSize:12}}>Copier</button>
            <button onClick={()=>{if(window.confirm('Regénérer la clé API ? L\'ancienne clé sera invalidée.'))alert('Nouvelle clé générée.');}} style={{padding:'9px 14px',borderRadius:7,border:`1px solid ${C.red}`,background:C.red_l,color:C.red,cursor:'pointer',fontFamily:'inherit',fontSize:12}}>Regénérer</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Profile(){
  const [section,setSection]=useState('profil');
  const [user,setUser]=useState(null);

  useEffect(()=>{
    try{
      const stored=localStorage.getItem('cleanit_user');
      if(stored) setUser(JSON.parse(stored));
    } catch{}
    api.get('/auth/me').then(r=>setUser(r.data)).catch(()=>{});
  },[]);

  const isAdmin=['ADMIN','DG'].includes(user?.role);

  const visibleSections=SECTIONS.filter(s=>s.id!=='utilisateurs'||isAdmin);

  const TABS={
    profil:<TabProfil user={user}/>,
    entreprise:<TabEntreprise/>,
    notifications:<TabNotifications/>,
    planning:<TabPlanning/>,
    utilisateurs:<TabUtilisateurs/>,
    securite:<TabSecurite/>,
    apparence:<TabApparence/>,
    integrations:<TabIntegrations/>,
  };

  return (
    <div style={{display:'flex',height:'100%',background:C.bg,fontFamily:'inherit'}}>
      {/* Sidebar navigation paramètres */}
      <div style={{width:220,borderRight:`1px solid ${C.border}`,background:C.white,flexShrink:0,display:'flex',flexDirection:'column'}}>
        <div style={{padding:'18px 16px',borderBottom:`1px solid ${C.border2}`}}>
          <div style={{fontSize:15,fontWeight:600,color:C.text}}>Paramètres</div>
          {user&&<div style={{fontSize:12,color:C.text3,marginTop:3}}>{user.firstName} {user.lastName}</div>}
        </div>
        <nav style={{padding:'8px 0',flex:1,overflowY:'auto'}}>
          {visibleSections.map(s=>(
            <button key={s.id} onClick={()=>setSection(s.id)}
              style={{width:'100%',textAlign:'left',padding:'9px 16px',border:'none',background:section===s.id?C.bg:'transparent',cursor:'pointer',fontFamily:'inherit',fontSize:13,color:section===s.id?C.blue:C.text2,fontWeight:section===s.id?600:400,borderLeft:section===s.id?`2px solid ${C.blue}`:'2px solid transparent',display:'flex',alignItems:'center',gap:9}}>
              <span style={{fontSize:16}}>{s.icon}</span>{s.label}
            </button>
          ))}
        </nav>
        <div style={{padding:'12px 16px',borderTop:`1px solid ${C.border2}`}}>
          <button onClick={()=>{localStorage.removeItem('cleanit_user');window.location.href='/login';}}
            style={{width:'100%',padding:'8px',borderRadius:7,border:`1px solid ${C.red}`,background:C.red_l,color:C.red,cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:500}}>
            Se déconnecter
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div style={{flex:1,overflowY:'auto',padding:'24px 32px'}}>
        <div style={{maxWidth:720}}>
          {TABS[section]||null}
        </div>
      </div>
    </div>
  );
}
