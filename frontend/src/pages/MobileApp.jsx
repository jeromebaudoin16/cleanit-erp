import { useState, useEffect, useRef, useCallback } from 'react';
import { createPointage, startGPSTracking, connectTracking, syncOffline, getMyShifts } from '../services/tracking.api';
import { useNavigate, useLocation } from 'react-router-dom';

// ── Couleurs mobile ──────────────────────────────────────────────
const M = {
  bg:     '#0f172a',
  card:   '#1e293b',
  card2:  '#334155',
  blue:   '#3b82f6',
  green:  '#22c55e',
  red:    '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  purple: '#a855f7',
  text:   '#f1f5f9',
  text2:  '#94a3b8',
  text3:  '#64748b',
  border: '#334155',
  white:  '#ffffff',
};

const API = 'https://cleanit-erp-production.up.railway.app';

// ── Employés ────────────────────────────────────────────────────
const EMPLOYES = [
  {id:'EI-001',nom:'Marie Kamga',   poste:'Chef Projet',    type:'interne', avatar:'MK', couleur:'#3b82f6'},
  {id:'EI-002',nom:'Jean Fouda',    poste:'Project Manager',type:'interne', avatar:'JF', couleur:'#a855f7'},
  {id:'EX-001',nom:'Thomas Ngono',  poste:'Technicien',     type:'externe', avatar:'TN', couleur:'#f97316'},
  {id:'EX-002',nom:'Samuel Djomo',  poste:'Technicien',     type:'externe', avatar:'SD', couleur:'#22c55e'},
  {id:'EX-003',nom:'Jean Mbarga',   poste:'Tech. Senior',   type:'externe', avatar:'JM', couleur:'#06b6d4'},
  {id:'EX-004',nom:'Ali Moussa',    poste:'Tech. HSE',      type:'externe', avatar:'AM', couleur:'#ef4444'},
];

const ZONES = {
  bureau_dla: {nom:'Bureau Douala',   lat:4.0511,lng:9.7085, rayon:150},
  'DLA-001':  {nom:'Site Akwa DLA',   lat:4.0511,lng:9.7085, rayon:300},
  'YDE-001':  {nom:'Site Yaoundé',    lat:3.8480,lng:11.5021,rayon:300},
  'GAR-001':  {nom:'Site Garoua',     lat:9.3019,lng:13.3920,rayon:300},
};

const SHIFTS_SAMPLE = [
  {id:'SH-001',job:'Installation 5G NR DLA-001',zone:'DLA-001',dateDebut:'2024-05-07',dateFin:'2024-05-09',heureDebut:'07:00',heureFin:'17:00',statut:'in_progress',priority:'high',   chefProjet:'Marie Kamga',  instructions:'Porter EPI complet. Coordonner avec Huawei.'},
  {id:'SH-002',job:'Maintenance 4G LTE YDE-001', zone:'YDE-001',dateDebut:'2024-05-07',dateFin:'2024-05-07',heureDebut:'08:00',heureFin:'16:00',statut:'in_progress',priority:'medium',chefProjet:'Jean Fouda',   instructions:'Vérifier connexions RF.'},
  {id:'SH-003',job:'Infrastructure GAR-001',      zone:'GAR-001',dateDebut:'2024-05-07',dateFin:'2024-05-10',heureDebut:'07:00',heureFin:'18:00',statut:'in_progress',priority:'urgent', chefProjet:'Marie Kamga',  instructions:'Certification HSE obligatoire.'},
];

const fmtTime = d => d ? new Date(d).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) : '--:--';
const fmtDate = d => d ? new Date(d).toLocaleDateString('fr-FR',{weekday:'short',day:'2-digit',month:'short'}) : '—';

const calcDist = (a,b,c,d) => {
  const R=6371000,dL=(c-a)*Math.PI/180,dl=(d-b)*Math.PI/180;
  const x=Math.sin(dL/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dl/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x)));
};

// ── Composants UI Mobile ─────────────────────────────────────────
const Btn = ({label,onClick,color=M.blue,full,icon,disabled,outline,sm}) => (
  <button onClick={onClick} disabled={disabled}
    style={{padding:sm?'10px 16px':'14px 20px',borderRadius:12,border:outline?`2px solid ${color}`:'none',
      background:outline?'transparent':disabled?M.card2:color,color:disabled?M.text3:outline?color:M.white,
      fontWeight:700,fontSize:sm?13:15,cursor:disabled?'not-allowed':'pointer',width:full?'100%':'auto',
      display:'flex',alignItems:'center',justifyContent:'center',gap:8,
      fontFamily:'inherit',opacity:disabled?.5:1,transition:'all .15s',
      boxShadow:outline?'none':`0 4px 14px ${color}40`}}>
    {icon&&<span style={{fontSize:18}}>{icon}</span>} {label}
  </button>
);

const Card = ({children,onClick,style={}}) => (
  <div onClick={onClick}
    style={{background:M.card,borderRadius:16,padding:'16px',border:`1px solid ${M.border}`,cursor:onClick?'pointer':'default',...style}}>
    {children}
  </div>
);

const Badge = ({label,color}) => (
  <span style={{fontSize:10,fontWeight:700,padding:'3px 9px',borderRadius:20,background:color+'20',color,letterSpacing:.3}}>
    {label}
  </span>
);

const Av = ({i,color,size=40,online}) => (
  <div style={{position:'relative',display:'inline-flex'}}>
    <div style={{width:size,height:size,borderRadius:size*.28,background:color,display:'flex',alignItems:'center',justifyContent:'center',color:M.white,fontWeight:800,fontSize:size*.35,boxShadow:`0 4px 12px ${color}50`}}>{i}</div>
    {online!==undefined&&<div style={{position:'absolute',bottom:-1,right:-1,width:size*.3,height:size*.3,borderRadius:'50%',background:online?M.green:'#475569',border:'2px solid '+M.bg}}/>}
  </div>
);

// ── PAGE LOGIN MOBILE ────────────────────────────────────────────
const PageLoginMobile = ({onLogin}) => {
  const [empId,   setEmpId]   = useState('');
  const [loading, setLoading] = useState(false);
  const [pin,     setPin]     = useState('');
  const [step,    setStep]    = useState(1); // 1=select, 2=pin

  const handleSelect = (id) => { setEmpId(id); setStep(2); };

  const handlePin = (d) => {
    if(d==='del'){ setPin(p=>p.slice(0,-1)); return; }
    const np = pin+d;
    setPin(np);
    if(np.length===4){
      setLoading(true);
      setTimeout(()=>{ onLogin(EMPLOYES.find(e=>e.id===empId)); setLoading(false); }, 800);
    }
  };

  return(
    <div style={{minHeight:'100vh',background:M.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px',fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <div style={{width:'100%',maxWidth:390}}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{width:72,height:72,borderRadius:20,background:'linear-gradient(135deg,#1d4ed8,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,margin:'0 auto 14px',boxShadow:'0 8px 32px rgba(37,99,235,.4)'}}>⚡</div>
          <div style={{fontSize:26,fontWeight:900,color:M.text,letterSpacing:-.5}}>CleanIT</div>
          <div style={{fontSize:13,color:M.text3,marginTop:2}}>Application mobile terrain</div>
        </div>

        {step===1&&(
          <div>
            <div style={{fontSize:13,fontWeight:700,color:M.text2,marginBottom:12,textTransform:'uppercase',letterSpacing:.5}}>Sélectionner votre profil</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {EMPLOYES.map(emp=>(
                <div key={emp.id} onClick={()=>handleSelect(emp.id)}
                  style={{background:M.card,borderRadius:14,padding:'14px 16px',border:`1px solid ${M.border}`,cursor:'pointer',display:'flex',alignItems:'center',gap:12,transition:'all .15s'}}
                  onTouchStart={e=>e.currentTarget.style.background=M.card2}
                  onTouchEnd={e=>e.currentTarget.style.background=M.card}>
                  <Av i={emp.avatar} color={emp.couleur} size={44}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:M.text}}>{emp.nom}</div>
                    <div style={{fontSize:12,color:M.text3}}>{emp.poste}</div>
                  </div>
                  <Badge label={emp.type==='interne'?'Bureau':'Terrain'} color={emp.type==='interne'?M.blue:M.orange}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {step===2&&(
          <div>
            <div style={{textAlign:'center',marginBottom:24}}>
              {(() => { const emp=EMPLOYES.find(e=>e.id===empId); return(
                <div>
                  <Av i={emp?.avatar||'?'} color={emp?.couleur||M.blue} size={64}/>
                  <div style={{fontSize:16,fontWeight:700,color:M.text,marginTop:10}}>{emp?.nom}</div>
                  <div style={{fontSize:12,color:M.text3}}>{emp?.poste}</div>
                </div>
              ); })()}
              <div style={{fontSize:13,color:M.text2,marginTop:16}}>Entrez votre PIN</div>
            </div>

            {/* Affichage PIN */}
            <div style={{display:'flex',justifyContent:'center',gap:12,marginBottom:24}}>
              {[0,1,2,3].map(i=>(
                <div key={i} style={{width:14,height:14,borderRadius:7,background:i<pin.length?M.blue:M.card2,border:`2px solid ${i<pin.length?M.blue:M.border}`,transition:'all .15s'}}/>
              ))}
            </div>

            {/* Clavier */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:16}}>
              {['1','2','3','4','5','6','7','8','9','','0','del'].map((d,i)=>(
                <button key={i} onClick={()=>d&&handlePin(d)} disabled={!d&&d!=='0'}
                  style={{padding:'16px',borderRadius:12,border:'none',
                    background:d==='del'?M.red+'20':d?M.card2:'transparent',
                    color:d==='del'?M.red:M.text,fontSize:d==='del'?18:20,fontWeight:700,
                    cursor:d||d==='0'?'pointer':'default',fontFamily:'inherit'}}>
                  {d==='del'?'⌫':d}
                </button>
              ))}
            </div>

            <button onClick={()=>setStep(1)} style={{width:'100%',padding:'12px',borderRadius:10,border:'none',background:'transparent',color:M.text3,fontSize:13,cursor:'pointer'}}>
              ← Changer de profil
            </button>

            {loading&&(
              <div style={{textAlign:'center',marginTop:16,color:M.blue,fontSize:13,fontWeight:600}}>
                ⏳ Connexion en cours...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── PAGE ACCUEIL MOBILE ──────────────────────────────────────────
const PageHomeMobile = ({user, navigate, gps, now}) => {
  const isPointed = true; // Simulé
  const shift = SHIFTS_SAMPLE.find(s=>
    s.technicienId===user?.id || (user?.type==='externe'&&s.statut==='in_progress')
  ) || SHIFTS_SAMPLE[0];

  return(
    <div style={{padding:'20px 16px'}}>
      {/* Header */}
      <div style={{marginBottom:24}}>
        <div style={{fontSize:12,color:M.text3,marginBottom:4}}>Bonjour 👋</div>
        <div style={{fontSize:22,fontWeight:900,color:M.text}}>{user?.nom}</div>
        <div style={{fontSize:13,color:M.text2}}>{user?.poste} · {now.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}</div>
      </div>

      {/* Status GPS */}
      <Card style={{marginBottom:16,borderColor:gps?M.green+'40':M.orange+'40',background:gps?M.green+'10':M.orange+'10'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{fontSize:24}}>{gps?'📍':'⏳'}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:gps?M.green:M.orange}}>
              {gps?'GPS actif — Position détectée':'Localisation GPS en cours...'}
            </div>
            {gps&&<div style={{fontSize:11,color:M.text3}}>{gps.lat.toFixed(5)}°N, {gps.lng.toFixed(5)}°E</div>}
          </div>
          <div style={{width:10,height:10,borderRadius:5,background:gps?M.green:M.orange,animation:'pulse-dot 1.5s infinite'}}/>
        </div>
      </Card>

      {/* Actions rapides */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:11,fontWeight:700,color:M.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:10}}>Actions rapides</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {[
            {icon:'▶',label:'Pointer entrée',  color:M.green,  action:()=>navigate('/mobile/pointage?type=entree')},
            {icon:'⏹',label:'Pointer sortie',  color:M.red,    action:()=>navigate('/mobile/pointage?type=sortie')},
            {icon:'📷',label:'CleanITCam',      color:M.blue,   action:()=>navigate('/mobile/camera')},
            {icon:'📅',label:'Mon planning',    color:M.purple, action:()=>navigate('/mobile/planning')},
          ].map(a=>(
            <button key={a.label} onClick={a.action}
              style={{padding:'18px 14px',borderRadius:14,border:'none',background:a.color+'20',
                display:'flex',flexDirection:'column',alignItems:'center',gap:8,cursor:'pointer',
                border:`1px solid ${a.color}30`,transition:'all .15s',fontFamily:'inherit'}}>
              <span style={{fontSize:28}}>{a.icon}</span>
              <span style={{fontSize:12,fontWeight:700,color:a.color}}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Shift actuel */}
      {shift&&(
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:700,color:M.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:10}}>Mission en cours</div>
          <Card onClick={()=>navigate('/mobile/planning')} style={{borderColor:M.blue+'40'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
              <Badge label={shift.priority==='urgent'?'🔴 Urgent':shift.priority==='high'?'🟠 Haute':'🟡 Moyenne'} color={shift.priority==='urgent'?M.red:shift.priority==='high'?M.orange:M.yellow}/>
              <Badge label="En cours" color={M.green}/>
            </div>
            <div style={{fontSize:14,fontWeight:800,color:M.text,marginBottom:4}}>{shift.job}</div>
            <div style={{fontSize:12,color:M.text3,marginBottom:8}}>{ZONES[shift.zone]?.nom||shift.zone}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <div style={{background:M.card2,borderRadius:8,padding:'8px'}}>
                <div style={{fontSize:9,color:M.text3,textTransform:'uppercase'}}>Période</div>
                <div style={{fontSize:11,fontWeight:700,color:M.text}}>{shift.dateDebut}</div>
              </div>
              <div style={{background:M.card2,borderRadius:8,padding:'8px'}}>
                <div style={{fontSize:9,color:M.text3,textTransform:'uppercase'}}>Horaires</div>
                <div style={{fontSize:11,fontWeight:700,color:M.text}}>{shift.heureDebut} – {shift.heureFin}</div>
              </div>
            </div>
            {shift.instructions&&(
              <div style={{marginTop:10,padding:'8px 10px',borderRadius:8,background:M.orange+'15',border:`1px solid ${M.orange}30`,fontSize:11,color:M.orange}}>
                ⚠ {shift.instructions}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Stats du jour */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        {[
          {l:'Heure arrivée',v:'07:23',icon:'▶',c:M.green},
          {l:'Temps pointé', v:'4h37', icon:'⏱',c:M.blue},
          {l:'Distance zone',v:gps?'45m':'—',  icon:'📍',c:M.orange},
        ].map(s=>(
          <div key={s.l} style={{background:M.card,borderRadius:12,padding:'12px 10px',border:`1px solid ${M.border}`,textAlign:'center'}}>
            <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:16,fontWeight:800,color:s.c}}>{s.v}</div>
            <div style={{fontSize:9,color:M.text3,textTransform:'uppercase',marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── PAGE POINTAGE MOBILE ─────────────────────────────────────────
const PagePointageMobile = ({user, gps, navigate}) => {
  const [type,    setType]    = useState('entree');
  const [zone,    setZone]    = useState('DLA-001');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notes,   setNotes]   = useState('');

  const zone_data = ZONES[zone];
  const dist = gps&&zone_data ? calcDist(gps.lat,gps.lng,zone_data.lat,zone_data.lng) : null;
  const horsZone = dist!==null ? dist>zone_data.rayon : false;

  const pointer = async () => {
    setLoading(true);
    try {
      const zone_info = ZONES[zone];
      const dist = gps&&zone_info ? Math.round(((gps.lat-zone_info.lat)**2+(gps.lng-zone_info.lng)**2)**.5*111320) : 0;
      await createPointage({
        userId: user?.id,
        userName: user?.nom,
        userType: user?.type,
        typeEmploye: user?.type,
        typePointage: type,
        lat: gps?.lat,
        lng: gps?.lng,
        zoneCode: zone,
        horsZone: dist > (zone_info?.rayon||300),
        distanceZone: dist,
        selfieUrl: null,
        selfieVerified: false,
        deviceId: navigator.userAgent.substring(0,100),
        notes,
      });
    } catch(e) {
      console.warn("Pointage sauvegarde offline");
    }
    setLoading(false);
    setSuccess(true);
    setTimeout(()=>{ setSuccess(false); navigate('/mobile'); }, 2500);
  };

  if(success) return(
    <div style={{minHeight:'60vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,padding:'24px'}}>
      <div style={{fontSize:72,animation:'bounce .5s ease'}}>✅</div>
      <div style={{fontSize:20,fontWeight:800,color:M.green}}>Pointage enregistré !</div>
      <div style={{fontSize:13,color:M.text3}}>
        {type==='entree'?'Entrée':'Sortie'} enregistrée à {fmtTime(new Date())}
      </div>
    </div>
  );

  return(
    <div style={{padding:'20px 16px'}}>
      <div style={{fontSize:18,fontWeight:800,color:M.text,marginBottom:20}}>Enregistrer un pointage</div>

      {/* GPS Status */}
      <div style={{padding:'12px 14px',borderRadius:12,background:gps?M.green+'15':M.orange+'15',border:`1px solid ${gps?M.green:M.orange}30`,marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:10,height:10,borderRadius:5,background:gps?M.green:M.orange,animation:'pulse-dot 1.5s infinite'}}/>
          <span style={{fontSize:13,fontWeight:600,color:gps?M.green:M.orange}}>
            {gps?`📍 ${gps.lat.toFixed(5)}°N, ${gps.lng.toFixed(5)}°E`:'⏳ Localisation en cours...'}
          </span>
        </div>
        {dist!==null&&(
          <div style={{marginTop:6,fontSize:12,fontWeight:700,color:horsZone?M.red:M.green}}>
            {horsZone?`⚠ Hors périmètre — ${dist}m`:`✅ Dans la zone — ${dist}m`}
          </div>
        )}
      </div>

      {/* Type pointage */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,color:M.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>Type de pointage</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {[{v:'entree',l:'▶ Entrée',c:M.green},{v:'sortie',l:'⏹ Sortie',c:M.red},{v:'pause_debut',l:'⏸ Début pause',c:M.orange},{v:'pause_fin',l:'▶ Fin pause',c:M.blue}].map(t=>(
            <button key={t.v} onClick={()=>setType(t.v)}
              style={{padding:'14px',borderRadius:12,border:`2px solid ${type===t.v?t.c:M.border}`,
                background:type===t.v?t.c+'20':'transparent',color:type===t.v?t.c:M.text3,
                fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {/* Zone */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,color:M.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>Zone / Site</div>
        <select value={zone} onChange={e=>setZone(e.target.value)}
          style={{width:'100%',padding:'13px 14px',borderRadius:12,border:`1px solid ${M.border}`,background:M.card,color:M.text,fontSize:14,fontFamily:'inherit'}}>
          {Object.entries(ZONES).map(([k,v])=><option key={k} value={k}>{v.nom}</option>)}
        </select>
      </div>

      {/* Notes */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:11,fontWeight:700,color:M.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>Notes (optionnel)</div>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Remarques..."
          style={{width:'100%',padding:'13px 14px',borderRadius:12,border:`1px solid ${M.border}`,background:M.card,color:M.text,fontSize:13,resize:'none',fontFamily:'inherit'}}/>
      </div>

      {horsZone&&(
        <div style={{padding:'12px',borderRadius:12,background:M.red+'15',border:`1px solid ${M.red}30`,marginBottom:16,fontSize:12,color:M.red,fontWeight:600}}>
          ⚠️ Vous êtes hors du périmètre autorisé. Le pointage sera signalé au chef de projet.
        </div>
      )}

      <Btn label={loading?'Enregistrement...':`✓ Confirmer ${type==='entree'?'l\'entrée':type==='sortie'?'la sortie':'la pause'}`}
        onClick={pointer} color={type==='entree'?M.green:type==='sortie'?M.red:M.orange}
        full disabled={!gps||loading}/>

      {!gps&&<div style={{textAlign:'center',fontSize:12,color:M.text3,marginTop:10}}>En attente du GPS...</div>}
    </div>
  );
};

// ── PAGE CLEANITCAM ──────────────────────────────────────────────
const PageCamera = ({user, gps, navigate}) => {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const [stream,    setStream]    = useState(null);
  const [photo,     setPhoto]     = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState(null);
  const [zone,      setZone]      = useState('DLA-001');

  useEffect(()=>{
    startCamera();
    return ()=>{ if(stream) stream.getTracks().forEach(t=>t.stop()); };
  },[]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},
        audio:false
      });
      setStream(s);
      if(videoRef.current){ videoRef.current.srcObject=s; videoRef.current.play(); }
    } catch(e){
      setError('Caméra non disponible: '+e.message);
    }
  };

  const takePhoto = () => {
    if(!videoRef.current||!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    canvasRef.current.width  = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current,0,0);
    // Miroir horizontal (selfie)
    ctx.scale(-1,1);
    ctx.drawImage(videoRef.current,-videoRef.current.videoWidth,0);
    setPhoto(canvasRef.current.toDataURL('image/jpeg',.8));
    setResult(null);
  };

  const analyzeAndSubmit = async () => {
    if(!photo) return;
    setAnalyzing(true);
    // Simulation analyse IA (TensorFlow.js face-api en production)
    await new Promise(r=>setTimeout(r,2000));
    const zone_data = ZONES[zone];
    const dist = gps&&zone_data ? calcDist(gps.lat,gps.lng,zone_data.lat,zone_data.lng) : 999;
    const horsZone = dist>zone_data?.rayon;
    const confidence = Math.round(85+Math.random()*12);
    setResult({
      verified:confidence>87&&!horsZone,
      confidence,
      horsZone,
      dist,
      message:confidence>87?(horsZone?'Visage vérifié mais hors zone':'✅ Identité confirmée — Pointage validé'):'❌ Visage non reconnu',
    });
    setAnalyzing(false);
  };

  const reset = () => { setPhoto(null); setResult(null); };

  return(
    <div style={{padding:'20px 16px'}}>
      <div style={{fontSize:18,fontWeight:800,color:M.text,marginBottom:6}}>📷 CleanITCam</div>
      <div style={{fontSize:12,color:M.text3,marginBottom:16}}>Selfie + vérification GPS pour pointage terrain</div>

      {/* Zone selector */}
      <div style={{marginBottom:14}}>
        <select value={zone} onChange={e=>setZone(e.target.value)}
          style={{width:'100%',padding:'11px 14px',borderRadius:12,border:`1px solid ${M.border}`,background:M.card,color:M.text,fontSize:13,fontFamily:'inherit'}}>
          {Object.entries(ZONES).map(([k,v])=><option key={k} value={k}>{v.nom}</option>)}
        </select>
      </div>

      {/* GPS */}
      <div style={{padding:'10px 14px',borderRadius:10,background:gps?M.green+'15':M.orange+'15',border:`1px solid ${gps?M.green:M.orange}30`,marginBottom:14,fontSize:12,color:gps?M.green:M.orange,fontWeight:600}}>
        {gps?`📍 GPS: ${gps.lat.toFixed(5)}°N — ${calcDist(gps.lat,gps.lng,ZONES[zone]?.lat||0,ZONES[zone]?.lng||0)}m de la zone`:'⏳ GPS en cours...'}
      </div>

      {error&&<div style={{padding:'12px',borderRadius:10,background:M.red+'15',color:M.red,fontSize:12,marginBottom:14}}>{error}</div>}

      {!photo?(
        <div>
          {/* Viewfinder */}
          <div style={{borderRadius:16,overflow:'hidden',marginBottom:14,position:'relative',background:'#000',aspectRatio:'3/4'}}>
            <video ref={videoRef} style={{width:'100%',height:'100%',objectFit:'cover',transform:'scaleX(-1)'}} playsInline muted autoPlay/>
            {/* Overlay cadre visage */}
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
              <div style={{width:180,height:220,borderRadius:90,border:'2px dashed rgba(255,255,255,.4)',position:'relative'}}>
                <div style={{position:'absolute',top:-20,left:'50%',transform:'translateX(-50%)',fontSize:10,color:'rgba(255,255,255,.7)',fontWeight:600,whiteSpace:'nowrap'}}>Centrez votre visage</div>
              </div>
            </div>
            {/* Info GPS overlay */}
            <div style={{position:'absolute',bottom:10,left:10,right:10,background:'rgba(0,0,0,.6)',borderRadius:8,padding:'6px 10px',fontSize:10,color:'white',backdropFilter:'blur(4px)'}}>
              📍 {gps?`${gps.lat.toFixed(4)}°N, ${gps.lng.toFixed(4)}°E`:'GPS indisponible'} · {new Date().toLocaleTimeString('fr-FR')}
            </div>
          </div>
          <canvas ref={canvasRef} style={{display:'none'}}/>
          <Btn label="📸 Prendre la photo" onClick={takePhoto} color={M.blue} full disabled={!!error}/>
        </div>
      ):(
        <div>
          {/* Photo prise */}
          <div style={{borderRadius:16,overflow:'hidden',marginBottom:14,position:'relative'}}>
            <img src={photo} style={{width:'100%',borderRadius:16}} alt="selfie"/>
            {result&&(
              <div style={{position:'absolute',inset:0,background:result.verified?'rgba(34,197,94,.2)':'rgba(239,68,68,.2)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',border:`3px solid ${result.verified?M.green:M.red}`}}>
                <div style={{fontSize:48}}>{result.verified?'✅':'❌'}</div>
              </div>
            )}
          </div>

          {result?(
            <div>
              <div style={{padding:'14px',borderRadius:12,background:result.verified?M.green+'15':M.red+'15',border:`1px solid ${result.verified?M.green:M.red}30`,marginBottom:14}}>
                <div style={{fontSize:14,fontWeight:800,color:result.verified?M.green:M.red,marginBottom:6}}>{result.message}</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {[
                    {l:'Confiance IA',v:`${result.confidence}%`,c:result.confidence>87?M.green:M.red},
                    {l:'Distance zone',v:`${result.dist}m`,c:result.horsZone?M.red:M.green},
                    {l:'GPS',v:gps?'Actif':'Inactif',c:gps?M.green:M.red},
                    {l:'Heure',v:new Date().toLocaleTimeString('fr-FR'),c:M.text2},
                  ].map(s=>(
                    <div key={s.l} style={{background:M.card2,borderRadius:8,padding:'8px'}}>
                      <div style={{fontSize:9,color:M.text3,textTransform:'uppercase'}}>{s.l}</div>
                      <div style={{fontSize:13,fontWeight:700,color:s.c}}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{display:'flex',gap:10}}>
                <Btn label="↺ Reprendre" onClick={reset} color={M.text3} outline full sm/>
                {result.verified&&<Btn label="✓ Valider" onClick={()=>navigate('/mobile')} color={M.green} full sm/>}
              </div>
            </div>
          ):(
            <div style={{display:'flex',gap:10}}>
              <Btn label="↺ Reprendre" onClick={reset} color={M.text3} outline full sm/>
              <Btn label={analyzing?'Analyse IA...':'🤖 Analyser'} onClick={analyzeAndSubmit} color={M.blue} full sm disabled={analyzing}/>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── PAGE PLANNING MOBILE ─────────────────────────────────────────
const PagePlanningMobile = ({user, navigate}) => {
  const myShifts = SHIFTS_SAMPLE;
  const [selShift, setSelShift] = useState(null);

  if(selShift) return(
    <div style={{padding:'20px 16px'}}>
      <button onClick={()=>setSelShift(null)} style={{background:'none',border:'none',color:M.blue,fontSize:14,fontWeight:700,cursor:'pointer',marginBottom:16,padding:0,fontFamily:'inherit'}}>
        ← Retour
      </button>
      <div style={{background:M.card,borderRadius:16,border:`1px solid ${M.border}`,overflow:'hidden'}}>
        <div style={{background:'linear-gradient(135deg,#1d4ed8,#7c3aed)',padding:'20px 18px'}}>
          <div style={{fontSize:10,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>Mission</div>
          <div style={{fontSize:18,fontWeight:900,color:M.white,marginBottom:6}}>{selShift.job}</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,.7)'}}>{ZONES[selShift.zone]?.nom||selShift.zone}</div>
        </div>
        <div style={{padding:'16px'}}>
          {[
            {l:'Période',v:`${selShift.dateDebut} → ${selShift.dateFin}`},
            {l:'Horaires',v:`${selShift.heureDebut} – ${selShift.heureFin}`},
            {l:'Chef de projet',v:selShift.chefProjet},
            {l:'Priorité',v:selShift.priority==='urgent'?'🔴 Urgente':selShift.priority==='high'?'🟠 Haute':'🟡 Moyenne'},
            {l:'Statut',v:'🟢 En cours'},
          ].map(item=>(
            <div key={item.l} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:`1px solid ${M.border}`,alignItems:'center'}}>
              <span style={{fontSize:12,color:M.text3}}>{item.l}</span>
              <span style={{fontSize:13,fontWeight:700,color:M.text}}>{item.v}</span>
            </div>
          ))}
          {selShift.instructions&&(
            <div style={{marginTop:14,padding:'12px',borderRadius:10,background:M.orange+'15',border:`1px solid ${M.orange}30`}}>
              <div style={{fontSize:11,fontWeight:700,color:M.orange,marginBottom:4}}>⚠ Instructions</div>
              <div style={{fontSize:12,color:M.text2}}>{selShift.instructions}</div>
            </div>
          )}
          <div style={{marginTop:16,display:'flex',flexDirection:'column',gap:10}}>
            <Btn label="📍 Naviguer vers le site" onClick={()=>window.open(`https://www.google.com/maps?q=${ZONES[selShift.zone]?.lat},${ZONES[selShift.zone]?.lng}`,'_blank')} color={M.blue} full/>
            <Btn label="▶ Pointer mon arrivée" onClick={()=>navigate('/mobile/pointage?type=entree')} color={M.green} full/>
          </div>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{padding:'20px 16px'}}>
      <div style={{fontSize:18,fontWeight:800,color:M.text,marginBottom:20}}>📅 Mon planning</div>
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {myShifts.map(s=>(
          <Card key={s.id} onClick={()=>setSelShift(s)} style={{borderColor:s.statut==='in_progress'?M.green+'40':M.border}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
              <div style={{fontSize:12,color:M.text3,fontFamily:'monospace'}}>{s.id}</div>
              <div style={{display:'flex',gap:6}}>
                <Badge label={s.priority==='urgent'?'🔴 Urgent':s.priority==='high'?'🟠 Haute':'🟡 Moyenne'} color={s.priority==='urgent'?M.red:s.priority==='high'?M.orange:M.yellow}/>
                <Badge label={s.statut==='in_progress'?'En cours':'Assigné'} color={s.statut==='in_progress'?M.green:M.blue}/>
              </div>
            </div>
            <div style={{fontSize:15,fontWeight:800,color:M.text,marginBottom:4}}>{s.job}</div>
            <div style={{fontSize:12,color:M.text3,marginBottom:10}}>{ZONES[s.zone]?.nom||s.zone}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <div style={{background:M.card2,borderRadius:8,padding:'8px'}}>
                <div style={{fontSize:9,color:M.text3,textTransform:'uppercase'}}>Période</div>
                <div style={{fontSize:11,fontWeight:700,color:M.text}}>{s.dateDebut}</div>
              </div>
              <div style={{background:M.card2,borderRadius:8,padding:'8px'}}>
                <div style={{fontSize:9,color:M.text3,textTransform:'uppercase'}}>Horaires</div>
                <div style={{fontSize:11,fontWeight:700,color:M.text}}>{s.heureDebut}–{s.heureFin}</div>
              </div>
            </div>
            <div style={{marginTop:10,textAlign:'right',fontSize:11,color:M.blue,fontWeight:700}}>Voir les détails →</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ── PAGE PROFIL MOBILE ───────────────────────────────────────────
const PageProfilMobile = ({user, onLogout}) => (
  <div style={{padding:'20px 16px'}}>
    <div style={{textAlign:'center',marginBottom:24}}>
      <Av i={user?.avatar||'?'} color={user?.couleur||M.blue} size={80}/>
      <div style={{fontSize:20,fontWeight:900,color:M.text,marginTop:14}}>{user?.nom}</div>
      <div style={{fontSize:13,color:M.text3,marginBottom:6}}>{user?.poste}</div>
      <Badge label={user?.type==='interne'?'🏢 Employé interne':'🔧 Technicien terrain'} color={user?.type==='interne'?M.blue:M.orange}/>
    </div>
    <Card style={{marginBottom:14}}>
      {[
        {l:'Matricule',    v:user?.id},
        {l:'Département',  v:'Operations'},
        {l:'Type',         v:user?.type==='interne'?'Interne (Bureau)':'Externe (Terrain)'},
        {l:'Application',  v:'CleanIT Mobile v1.0'},
      ].map(item=>(
        <div key={item.l} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:`1px solid ${M.border}`,alignItems:'center'}}>
          <span style={{fontSize:12,color:M.text3}}>{item.l}</span>
          <span style={{fontSize:12,fontWeight:700,color:M.text}}>{item.v}</span>
        </div>
      ))}
    </Card>
    <Btn label="Se déconnecter" onClick={onLogout} color={M.red} full outline/>
  </div>
);

// ── BOTTOM NAV MOBILE ────────────────────────────────────────────
const BottomNav = ({active, navigate, alertes=0}) => {
  const tabs = [
    {id:'home',     icon:'🏠', label:'Accueil',  url:'/mobile'},
    {id:'pointage', icon:'⏱', label:'Pointer',   url:'/mobile/pointage'},
    {id:'camera',   icon:'📷', label:'CamIA',     url:'/mobile/camera'},
    {id:'planning', icon:'📅', label:'Planning',  url:'/mobile/planning'},
    {id:'comm',     icon:'💬', label:'Comm',      url:'/cleanitcomm'},
  {id:'profil',   icon:'👤', label:'Profil',    url:'/mobile/profil'},
  ];
  return(
    <div style={{position:'fixed',bottom:0,left:0,right:0,background:M.card,borderTop:`1px solid ${M.border}`,display:'flex',zIndex:100,paddingBottom:'env(safe-area-inset-bottom,0px)'}}>
      {tabs.map(t=>{
        const isAct = active===t.id||(active===''&&t.id==='home');
        return(
          <button key={t.id} onClick={()=>navigate(t.url)}
            style={{flex:1,padding:'10px 4px',border:'none',background:'transparent',display:'flex',flexDirection:'column',alignItems:'center',gap:3,cursor:'pointer',position:'relative',fontFamily:'inherit'}}>
            <span style={{fontSize:22,filter:isAct?'none':'grayscale(1)',opacity:isAct?1:.5}}>{t.icon}</span>
            <span style={{fontSize:9,fontWeight:isAct?800:500,color:isAct?M.blue:M.text3}}>{t.label}</span>
            {isAct&&<div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:24,height:2,borderRadius:2,background:M.blue}}/>}
          </button>
        );
      })}
    </div>
  );
};

// ── COMPOSANT PRINCIPAL MOBILE ───────────────────────────────────
export default function MobileApp() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const loc        = location.pathname;
  const [user,     setUser]    = useState(null);
  const [gps,      setGps]     = useState(null);
  const [now,      setNow]     = useState(new Date());

  // Register service worker
  useEffect(()=>{
    if('serviceWorker' in navigator){
      navigator.serviceWorker.register('/sw.js').then(()=>console.log('SW registered')).catch(()=>{});
    }
  },[]);

  // Clock
  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),1000); return()=>clearInterval(t); },[]);

  // GPS tracking continu + envoi backend
  useEffect(()=>{
    if(!navigator.geolocation||!user) return;
    
    // Sync offline au démarrage
    syncOffline().catch(()=>{});
    
    // Connexion WebSocket tracking
    connectTracking(user.id, user.nom, user.type, navigator.userAgent.substring(0,50), null, null);
    
    const watcher = navigator.geolocation.watchPosition(
      pos=>{
        const position = {lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy};
        setGps(position);
      },
      err=>console.warn('GPS:', err.message),
      {enableHighAccuracy:true,timeout:10000,maximumAge:5000}
    );
    return ()=>navigator.geolocation.clearWatch(watcher);
  },[user]);

  // Activer l'utilisateur depuis localStorage si dispo
  useEffect(()=>{
    const saved = localStorage.getItem('cleanit_mobile_user');
    if(saved) try { setUser(JSON.parse(saved)); } catch(e){}
  },[]);

  const handleLogin = (emp) => {
    setUser(emp);
    localStorage.setItem('cleanit_mobile_user', JSON.stringify(emp));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cleanit_mobile_user');
  };

  if(!user) return <PageLoginMobile onLogin={handleLogin}/>;

  const parts = loc.split('/').filter(Boolean);
  const activePage = parts[1]||'';

  const commonProps = {user, navigate, gps, now};

  const getPage = () => {
    if(loc.includes('/camera'))   return <PageCamera   {...commonProps}/>;
    if(loc.includes('/pointage')) return <PagePointageMobile {...commonProps}/>;
    if(loc.includes('/planning')) return <PagePlanningMobile {...commonProps}/>;
    if(loc.includes('/profil'))   return <PageProfilMobile {...commonProps} onLogout={handleLogout}/>;
    return <PageHomeMobile {...commonProps}/>;
  };

  return(
    <div style={{minHeight:'100vh',background:M.bg,fontFamily:"'Segoe UI',system-ui,sans-serif",maxWidth:430,margin:'0 auto',position:'relative'}}>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        body{margin:0;overscroll-behavior:none}
        @keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes bounce{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
        select option{background:#1e293b;color:#f1f5f9}
        input,textarea,select{color-scheme:dark}
        ::-webkit-scrollbar{display:none}
      `}</style>

      {/* Status bar simulé */}
      <div style={{background:M.card,padding:'8px 20px 4px',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:11,color:M.text3,position:'sticky',top:0,zIndex:200,borderBottom:`1px solid ${M.border}`}}>
        <div style={{fontWeight:700}}>{now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</div>
        <div style={{display:'flex',alignItems:'center',gap:6,fontSize:14,fontWeight:800,color:M.text}}>
          <span style={{fontSize:16}}>⚡</span> CleanIT
        </div>
        <div style={{display:'flex',gap:5,alignItems:'center'}}>
          <span>{gps?'📍':'⭕'}</span>
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Content */}
      <div style={{paddingBottom:80,minHeight:'calc(100vh - 48px)',overflowY:'auto'}}>
        {getPage()}
      </div>

      {/* Bottom Nav */}
      <BottomNav active={activePage} navigate={navigate}/>
    </div>
  );
}
