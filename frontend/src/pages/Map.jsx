import { useEffect, useRef, useState, useCallback } from "react";

const MAPTILER_KEY = "r30VkE2cM55t67KloPhg";

const PHOTOS = {
  "EE001":"https://i.pravatar.cc/150?img=15",
  "EE002":"https://i.pravatar.cc/150?img=17",
  "EE003":"https://i.pravatar.cc/150?img=22",
  "EE004":"https://i.pravatar.cc/150?img=3",
  "EE005":"https://i.pravatar.cc/150?img=25",
};

const SITES = [
  {code:"DLA-001",bcPo:"416121376123-2",bcDuid:"ON-OSN9800-DLA-001",name:"Site Akwa Douala",lat:4.0511,lng:9.7085,status:"en_cours",type:"5G NR",progression:65,client:"MTN Cameroun",projet:"PROJ-2024-001",budget:180,techId:"EE001"},
  {code:"DLA-003",name:"Site Bonabéri",lat:4.0667,lng:9.6500,status:"en_retard",type:"4G LTE",progression:30,client:"Orange Cameroun",projet:"PROJ-2024-002",budget:85,techId:null},
  {code:"YDE-001",bcPo:"416121016354-58",name:"Site Centre Yaoundé",lat:3.8480,lng:11.5021,status:"termine",type:"5G NR",progression:100,client:"MTN Cameroun",projet:"PROJ-2024-001",budget:95,techId:"EE002"},
  {code:"BFN-001",name:"Site Bafoussam",lat:5.4764,lng:10.4214,status:"planifie",type:"4G LTE",progression:0,client:"CAMTEL",projet:"PROJ-2024-006",budget:50,techId:null},
  {code:"GAR-001",bcPo:"4161HG3336731-43",name:"Site Garoua",lat:9.3019,lng:13.3920,status:"en_cours",type:"3G UMTS",progression:55,client:"Nexttel",projet:"PROJ-2024-004",budget:45,techId:"EE004"},
  {code:"KRI-001",name:"Site Kribi Port",lat:2.9395,lng:9.9087,status:"livre",type:"5G NR",progression:100,client:"MTN Cameroun",projet:"PROJ-2024-001",budget:0,techId:null},
  {code:"LIM-001",name:"Site Limbé",lat:4.0167,lng:9.2000,status:"en_cours",type:"4G LTE",progression:75,client:"Orange Cameroun",projet:"PROJ-2024-002",budget:40,techId:"EE003"},
  {code:"MAR-001",name:"Site Maroua",lat:10.5900,lng:14.3157,status:"planifie",type:"4G LTE",progression:0,client:"CAMTEL",projet:"PROJ-2024-006",budget:30,techId:null},
];

const TECHNICIENS_INIT = [
  {id:"EE001",nom:"Thomas Ngono",lat:4.0580,lng:9.7150,status:"en_mission",site:"DLA-001",siteLat:4.0511,siteLng:9.7085,phone:"+237 677 100 001",avatar:"TN",color:"#1a73e8",matricule:"CLN-EXT-001",specialite:"5G NR / 4G LTE",battery:78,signal:4,lastUpdate:"À l\'instant",taches:3,rapport:"Câblage RRU terminé. Test en cours.",heureDebut:"07:30",
    trajectory:[{lat:4.0400,lng:9.6900,time:"07:30"},{lat:4.0450,lng:9.7000,time:"08:15"},{lat:4.0500,lng:9.7080,time:"09:00"},{lat:4.0511,lng:9.7085,time:"09:30"},{lat:4.0580,lng:9.7150,time:"14:45"}]},
  {id:"EE002",nom:"Jean Mbarga",lat:3.8600,lng:11.5100,status:"en_mission",site:"YDE-001",siteLat:3.8480,siteLng:11.5021,phone:"+237 677 100 002",avatar:"JM",color:"#7c3aed",matricule:"CLN-EXT-002",specialite:"Survey RF",battery:92,signal:5,lastUpdate:"À l\'instant",taches:2,rapport:"Installation antenne BBU terminée.",heureDebut:"08:00",
    trajectory:[{lat:3.8200,lng:11.4800,time:"08:00"},{lat:3.8350,lng:11.4900,time:"08:45"},{lat:3.8480,lng:11.5021,time:"09:30"},{lat:3.8600,lng:11.5100,time:"14:45"}]},
  {id:"EE003",nom:"Samuel Djomo",lat:4.0300,lng:9.1800,status:"en_deplacement",site:"LIM-001",siteLat:4.0167,siteLng:9.2000,phone:"+237 677 100 003",avatar:"SD",color:"#0f9d58",matricule:"CLN-EXT-003",specialite:"3G UMTS / 4G LTE",battery:45,signal:3,lastUpdate:"Il y a 3 min",taches:1,rapport:"En route vers site Limbé.",heureDebut:"09:15",
    trajectory:[{lat:4.0500,lng:9.0500,time:"09:15"},{lat:4.0400,lng:9.1000,time:"10:30"},{lat:4.0300,lng:9.1800,time:"14:45"}]},
  {id:"EE004",nom:"Ali Moussa",lat:9.2800,lng:13.4100,status:"en_mission",site:"GAR-001",siteLat:9.3019,siteLng:13.3920,phone:"+237 677 100 004",avatar:"AM",color:"#f29900",matricule:"CLN-EXT-004",specialite:"Supervision HSE",battery:63,signal:2,lastUpdate:"Il y a 5 min",taches:4,rapport:"Vérification sécurité pylône terminée.",heureDebut:"06:45",
    trajectory:[{lat:9.2500,lng:13.3500,time:"06:45"},{lat:9.2700,lng:13.3800,time:"08:00"},{lat:9.3019,lng:13.3920,time:"09:00"},{lat:9.2800,lng:13.4100,time:"14:45"}]},
  {id:"EE005",nom:"René Talla",lat:4.0400,lng:9.6800,status:"disponible",site:"—",siteLat:null,siteLng:null,phone:"+237 677 100 005",avatar:"RT",color:"#db2777",matricule:"CLN-EXT-005",specialite:"Fibre optique",battery:100,signal:5,lastUpdate:"En ligne",taches:0,rapport:"",heureDebut:"—",
    trajectory:[{lat:4.0400,lng:9.6800,time:"08:00"}]},
];

// Geofences prédéfinis
const GEOFENCES_INIT = [
  {id:"GF001",name:"Zone Douala Centre",lat:4.0511,lng:9.7085,radius:3000,color:"#1a73e8",active:true},
  {id:"GF002",name:"Zone Bonabéri Alerte",lat:4.0667,lng:9.6500,radius:2000,color:"#ea4335",active:true},
];

const STATUS_SITES = {
  planifie: {color:"#7c3aed",bg:"#f3e8ff",label:"Planifié"},
  en_cours: {color:"#1a73e8",bg:"#e8f0fe",label:"En cours"},
  termine:  {color:"#0f9d58",bg:"#e6f4ea",label:"Terminé"},
  livre:    {color:"#0f9d58",bg:"#e6f4ea",label:"Livré"},
  en_retard:{color:"#ea4335",bg:"#fce8e6",label:"En retard"},
};

const STATUS_TECH = {
  en_mission:    {color:"#1a73e8",label:"En mission",    bg:"#e8f0fe"},
  en_deplacement:{color:"#f29900",label:"En déplacement",bg:"#fef3c7"},
  disponible:    {color:"#0f9d58",label:"Disponible",    bg:"#e6f4ea"},
  hors_ligne:    {color:"#9aa0a6",label:"Hors ligne",    bg:"#f1f3f4"},
};

const LAYERS = [
  {id:"hybrid",   label:"🛰 Hybride HD",  url:`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}`},
  {id:"satellite",label:"📡 Satellite",   url:`https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}`},
  {id:"streets",  label:"🏙 Standard",    url:`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`},
  {id:"outdoor",  label:"⛰ Terrain",     url:`https://api.maptiler.com/maps/outdoor-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`},
];

// SVG Icons professionnels
const SvgIco = ({d,size=18,color="currentColor",strokeWidth=1.75}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
    style={{display:"block",flexShrink:0}}>
    {(Array.isArray(d)?d:[d]).map((path,i)=><path key={i} d={path}/>)}
  </svg>
);

const ICONS = {
  sites:    ["M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 1-.6 1.7","M17.3 11a6 6 0 1 1-11 3","M12 12v9","M12 2v3","M4.2 4.2l2.1 2.1","M19.8 4.2l-2.1 2.1"],
  techs:    ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75"],
  missions: ["M22 11.08V12a10 10 0 1 1-5.93-9.14","M22 4 12 14.01l-3-3"],
  alertes:  ["M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z","M12 9v4","M12 17h.01"],
  geofence: ["M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z","M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"],
  replay:   ["M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8","M3 3v5h5","M12 7v5l4 2"],
  photos:   ["M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z","M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  collab:   ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75"],
  live:     ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z","M12 8v4l3 3"],
  heat:     ["M12 2c0 6-8 8-8 14a8 8 0 0 0 16 0c0-6-8-8-8-14z","M12 12c0 3-3 4-3 7a3 3 0 0 0 6 0c0-3-3-4-3-7z"],
  measure:  ["M2 20h20","M5 4v16","M19 4v16","M5 8h4","M5 12h8","M5 16h4"],
  zones:    ["M3 3h7v7H3z","M14 3h7v7h-7z","M14 14h7v7h-7z","M3 14h7v7H3z"],
  dispatch: ["M5 12h14","M12 5l7 7-7 7"],
  layers:   ["M12 2 2 7l10 5 10-5-10-5z","M2 17l10 5 10-5","M2 12l10 5 10-5"],
  close:    ["M18 6 6 18","M6 6l12 12"],
  phone:    ["M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 8.63a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 2 0h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L6.91 9.91a16 16 0 0 0 6.12 6.12l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"],
  gps:      ["M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z","M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"],
  eye:      ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  msg:      ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"],
  check:    ["M20 6 9 17l-5-5"],
  warning:  ["M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z","M12 9v4","M12 17h.01"],
  chart:    ["M18 20V10","M12 20V4","M6 20v-6"],
  settings: ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z","M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"],
};

const NAV_ICONS = [
  {id:"sites",    icon:"sites",    label:"Sites"},
  {id:"techs",    icon:"techs",    label:"Équipe"},
  {id:"missions", icon:"missions", label:"Missions"},
  {id:"alertes",  icon:"alertes",  label:"Alertes", badge:4},
  {id:"geofence", icon:"geofence", label:"Zones"},
  {id:"replay",   icon:"replay",   label:"Replay"},
  {id:"photos",   icon:"photos",   label:"Photos"},
];

// Calcul distance entre 2 points GPS (Haversine)
const haversine=(lat1,lng1,lat2,lng2)=>{
  const R=6371000;
  const dLat=(lat2-lat1)*Math.PI/180;
  const dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
};

// ===== IA DISPATCH - Scorer les techniciens pour un site =====
const scoreDispatch=(tech, site, allTechs)=>{
  if(tech.status==="hors_ligne") return null;
  const dist=haversine(tech.lat,tech.lng,site.lat,site.lng);
  const distKm=dist/1000;
  
  // Score distance (40pts max) - moins c'est loin, plus le score est haut
  const scoreDistance = Math.max(0, 40 - (distKm * 4));
  
  // Score batterie (25pts max)
  const scoreBattery = (tech.battery / 100) * 25;
  
  // Score signal (15pts max)
  const scoreSignal = (tech.signal / 5) * 15;
  
  // Score disponibilité (20pts max)
  const scoreDisponible = tech.status === "disponible" ? 20 : tech.status === "en_deplacement" ? 8 : 0;
  
  // Score compétence (bonus 10pts si spécialité match)
  const scoreCompetence = (
    (site.type.includes("5G") && tech.specialite.includes("5G")) ||
    (site.type.includes("4G") && tech.specialite.includes("4G")) ||
    (site.type.includes("3G") && tech.specialite.includes("3G"))
  ) ? 10 : 0;
  
  const total = scoreDistance + scoreBattery + scoreSignal + scoreDisponible + scoreCompetence;
  
  return {
    tech,
    score: Math.round(total),
    distKm: distKm.toFixed(1),
    details: {
      distance: Math.round(scoreDistance),
      battery: Math.round(scoreBattery),
      signal: Math.round(scoreSignal),
      disponibilite: Math.round(scoreDisponible),
      competence: scoreCompetence,
    },
    etaMin: Math.round(distKm * 3 + 5), // estimation simple: 20km/h + 5min
    raison: tech.status==="disponible"
      ? `Disponible · ${distKm.toFixed(1)}km · Spécialité ${tech.specialite}`
      : `En déplacement · ${distKm.toFixed(1)}km`,
  };
};

const getIARecommandations=(site, techs)=>{
  return techs
    .map(t=>scoreDispatch(t, site, techs))
    .filter(Boolean)
    .filter(s=>s.score>0)
    .sort((a,b)=>b.score-a.score)
    .slice(0,3);
};


// ===== JUMEAU NUMÉRIQUE ÉQUIPEMENTS =====
const EquipmentTwin = ({site, iotData, onClose}) => {
  const iot = iotData[site.code] || {};
  const EQUIPS = {
    '5G NR': [{name:'BBU 5900',type:'bbu',status:iot.alerte?'warning':'ok',detail:'Baie rack 2U — 6 ports RRU'},{name:'RRU 5900 Ant1',type:'rru',status:'ok',detail:'2600MHz — TDD 100MHz'},{name:'RRU 5900 Ant2',type:'rru',status:iot.alerte?'warning':'ok',detail:'3500MHz — TDD 100MHz'},{name:'Antenne AAU',type:'ant',status:'ok',detail:'64T64R — Azimut 180°'},{name:'Fibres optiques',type:'fiber',status:'ok',detail:'2x OM3 — 100m'}],
    '4G LTE': [{name:'BBU 3910',type:'bbu',status:'ok',detail:'Baie rack 2U'},{name:'RRU 3959',type:'rru',status:'ok',detail:'1800MHz — FDD 20MHz'},{name:'Antenne 4T4R',type:'ant',status:'ok',detail:'Azimut 60°/180°/300°'}],
    '3G UMTS': [{name:'NodeB',type:'bbu',status:iot.alerte?'critical':'ok',detail:'Rack 2U UMTS 2100'},{name:'RRU UMTS',type:'rru',status:iot.alerte?'warning':'ok',detail:'2100MHz WCDMA'},{name:'Antenne 2T2R',type:'ant',status:'ok',detail:'Azimut 120°/240°'}],
  };
  const equips = EQUIPS[site.type] || EQUIPS['4G LTE'];
  const statusC = {ok:'#0F7B3C',warning:'#D97706',critical:'#A32D2D'};
  const statusL = {ok:'Opérationnel',warning:'Attention',critical:'Critique'};
  return(
    <div style={{position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.7)'}}>
      <div style={{background:'#0f172a',borderRadius:16,width:520,maxHeight:'80vh',overflow:'auto',border:'1px solid #1e293b',color:'#e2e8f0'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid #1e293b',display:'flex',justifyContent:'space-between',alignItems:'center',background:'linear-gradient(135deg,#185FA5,#0F7B3C)'}}>
          <div>
            <div style={{fontSize:15,fontWeight:700}}>Jumeau numérique — {site.code}</div>
            <div style={{fontSize:11,opacity:.7}}>{site.name} · {site.type} · {site.client}</div>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#fff',fontSize:18,cursor:'pointer'}}>✕</button>
        </div>
        <div style={{padding:16}}>
          {/* IoT capteurs */}
          <div style={{background:'#1e293b',borderRadius:10,padding:12,marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:8}}>Capteurs IoT temps réel</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
              {[['Température',iot.temp+'°C',iot.temp>60?'critical':'ok'],['Humidité',iot.humidity+'%',iot.humidity>80?'warning':'ok'],['Vibration',iot.vibration||'—',iot.vibration==='élevée'?'warning':'ok'],['Tension',iot.tension+'V','ok']].map(([l,v,s])=>(
                <div key={l} style={{background:'#0f172a',borderRadius:7,padding:'8px 10px',borderLeft:`2px solid ${statusC[s]}`}}>
                  <div style={{fontSize:9,color:'#64748b',marginBottom:2}}>{l}</div>
                  <div style={{fontSize:14,fontWeight:700,color:statusC[s]}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Équipements */}
          <div style={{fontSize:11,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:8}}>Infrastructure équipements</div>
          {equips.map((eq,i)=>(
            <div key={i} style={{background:'#1e293b',borderRadius:8,padding:'10px 12px',marginBottom:6,display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:statusC[eq.status],flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600}}>{eq.name}</div>
                <div style={{fontSize:10,color:'#94a3b8'}}>{eq.detail}</div>
              </div>
              <span style={{fontSize:10,padding:'2px 7px',borderRadius:10,background:statusC[eq.status]+'20',color:statusC[eq.status],fontWeight:600}}>{statusL[eq.status]}</span>
            </div>
          ))}
          {/* BC Info */}
          {site.bcPo&&(
            <div style={{background:'#1e293b',borderRadius:8,padding:'10px 12px',marginTop:6,borderLeft:'2px solid #D97706'}}>
              <div style={{fontSize:10,color:'#94a3b8',marginBottom:3}}>Bon de Commande MTN</div>
              <div style={{fontSize:11,fontFamily:'monospace',color:'#fbbf24'}}>PO: {site.bcPo}</div>
              <div style={{fontSize:10,color:'#94a3b8',marginTop:2}}>Progression: {site.progression}% · Budget: {site.budget}M FCFA</div>
            </div>
          )}
          {/* Prochaine maintenance */}
          <div style={{background:'#1e293b',borderRadius:8,padding:'10px 12px',marginTop:6,borderLeft:`2px solid ${iot.alerte?'#A32D2D':'#185FA5'}`}}>
            <div style={{fontSize:10,color:'#94a3b8',marginBottom:3}}>{iot.alerte?'⚠ Action requise':'Prochaine maintenance'}</div>
            <div style={{fontSize:11,color:iot.alerte?'#fca5a5':'#93c5fd'}}>{iot.alerte?'Inspection immédiate — température ou vibration anormale':'Maintenance préventive planifiée dans 45 jours'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef({});
  const techMarkersRef = useRef({});
  const routeLayersRef = useRef([]);
  const geofenceLayersRef = useRef({});
  const replayLayersRef = useRef([]);
  const heatLayerRef = useRef(null);

  const [loaded, setLoaded] = useState(false);
  const [techniciens, setTechniciens] = useState(TECHNICIENS_INIT);
  const [activeLayer, setActiveLayer] = useState("hybrid");
  const [liveMode, setLiveMode] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [routeInfo, setRouteInfo] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [filter, setFilter] = useState("tous");
  const [searchQ, setSearchQ] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState("sites");
  const [selected, setSelected] = useState(null);
  const [selectedTech, setSelectedTech] = useState(null);
  const [showDispatch, setShowDispatch] = useState(false);
  const [dispatchTech, setDispatchTech] = useState(null);
  const [dispatchSite, setDispatchSite] = useState(null);
  // IA Prédictions pannes (Groq)
  const [faultPredictions, setFaultPredictions] = useState([]);
  const [loadingIA, setLoadingIA] = useState(false);
  // Météo sites
  const [weatherData, setWeatherData] = useState({});
  const [loadingWeather, setLoadingWeather] = useState(false);
  // Équipement digital twin
  const [showEquipTwin, setShowEquipTwin] = useState(null);
  // Couverture réseau simulation
  const [coverageCircle, setCoverageCircle] = useState(null);
  // Photos CleanCam sur carte
  const [camPhotos] = useState([
    {id:'cp1',siteCode:'DLA-001',techId:'EE001',techNom:'Thomas Ngono',lat:4.0520,lng:9.7090,photo:'https://i.pravatar.cc/150?img=15',caption:'BBU 5900 installé — câblage RRU terminé',ts:Date.now()-3600000},
    {id:'cp2',siteCode:'YDE-001',techId:'EE002',techNom:'Jean Mbarga',lat:3.8490,lng:11.5030,photo:'https://i.pravatar.cc/150?img=17',caption:'Antenne 5G NR positionnée — azimut 180°',ts:Date.now()-7200000},
    {id:'cp3',siteCode:'GAR-001',techId:'EE004',techNom:'Ali Moussa',lat:9.3025,lng:13.3925,photo:'https://i.pravatar.cc/150?img=3',caption:'Inspection pylône 45m — harnais conforme HSE',ts:Date.now()-14400000},
  ]);
  // IoT capteurs simulés
  const [iotData] = useState({
    'DLA-001':{temp:42,humidity:68,vibration:'normale',tension:220,alerte:false},
    'YDE-001':{temp:38,humidity:55,vibration:'normale',tension:220,alerte:false},
    'GAR-001':{temp:61,humidity:32,vibration:'élevée',tension:218,alerte:true},
    'LIM-001':{temp:45,humidity:78,vibration:'normale',tension:219,alerte:false},
    'DLA-003':{temp:40,humidity:65,vibration:'normale',tension:221,alerte:false},
  });
  // Timeline slider
  const [timelineHour, setTimelineHour] = useState(14);
  const [timelineActive, setTimelineActive] = useState(false);


  // Nouvelles features
  const [geofences, setGeofences] = useState(GEOFENCES_INIT);
  const [showGeofences, setShowGeofences] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [replayTech, setReplayTech] = useState(null);
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [replayStep, setReplayStep] = useState(0);
  const [proximityAlerts, setProximityAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNightMode, setShowNightMode] = useState(false);
  const [measureMode, setMeasureMode] = useState(false);
  const measurePointsRef = useRef([]);
  const measureLayersRef = useRef([]);
  // Nouvelles features 2026
  const [iaRecommandations, setIaRecommandations] = useState([]);
  const [showIADispatch, setShowIADispatch] = useState(false);
  const [iaTargetSite, setIaTargetSite] = useState(null);
  const [collabCursors, setCollabCursors] = useState([
    {id:"PM001",nom:"Marie Kamga",lat:4.05,lng:9.71,color:"#db2777",lastSeen:"maintenant"},
    {id:"PM002",nom:"Jean Fouda",lat:3.85,lng:11.50,color:"#f29900",lastSeen:"il y a 2 min"},
  ]);
  const [photos, setPhotos] = useState([
    {id:"P001",techId:"EE001",lat:4.0511,lng:9.7085,url:"https://picsum.photos/200/150?random=1",desc:"Antenne RRU installée - DLA-001",time:"09:45",site:"DLA-001"},
    {id:"P002",techId:"EE002",lat:3.8480,lng:11.5021,url:"https://picsum.photos/200/150?random=2",desc:"BBU configuration terminée - YDE-001",time:"11:20",site:"YDE-001"},
    {id:"P003",techId:"EE004",lat:9.3019,lng:13.3920,url:"https://picsum.photos/200/150?random=3",desc:"Inspection pylône sécurisée - GAR-001",time:"10:15",site:"GAR-001"},
  ]);
  const [showPhotos, setShowPhotos] = useState(true);
  const [showCollab, setShowCollab] = useState(true);
  const photoMarkersRef = useRef({});
  const collabMarkersRef = useRef({});
  const measureModeRef = useRef(false);

  // ===== GPS LIVE =====

  // ===== IA DISPATCH via Groq/ChaCha =====
  const chachaDispatch = async (site, availableTechs) => {
    setLoadingIA(true);
    try {
      const prompt = `Tu es le système de dispatch IA de CleanIT Cameroun.
Mission: Site ${site.code} - ${site.name} - Type: ${site.type} - Statut: ${site.status}
Client: ${site.client} - Budget: ${site.budget}M FCFA

Techniciens disponibles:
${availableTechs.map(t => `- ${t.nom} (${t.matricule}): ${t.specialite}, batterie ${t.battery}%, signal ${t.signal}/5, ${t.taches} tâches en cours`).join('\n')}

Analyse et recommande le meilleur technicien pour cette mission. Considère:
1. Adéquation compétences/type de mission
2. Disponibilité et charge actuelle  
3. Performance batterie et signal
4. Historique missions similaires

Réponds UNIQUEMENT en JSON valide:
{"techId":"EE00X","score":85,"raison":"Explication courte","risques":"Risques potentiels","conseils":"Conseils terrain","ranking":[{"techId":"EE00X","score":85,"justification":"..."}]}`;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          messages: [{role:'user', content: prompt}]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || '{}';
      const clean = text.replace(/```json|```/g,'').trim();
      const result = JSON.parse(clean);
      setFaultPredictions(prev => [...prev, {type:'dispatch', site: site.code, ...result, ts: Date.now()}]);
      return result;
    } catch(e) {
      console.error('ChaCha dispatch error:', e);
      return null;
    } finally {
      setLoadingIA(false);
    }
  };

  // ===== PRÉDICTION PANNES via Groq =====
  const predictFaults = async () => {
    setLoadingIA(true);
    try {
      const sitesData = SITES.map(s => ({
        code: s.code,
        name: s.name,
        type: s.type,
        status: s.status,
        progression: s.progression,
        iot: iotData[s.code] || {}
      }));

      const prompt = `Tu es un expert en maintenance réseau télécom pour CleanIT Cameroun.
Analyse ces sites et prédit les risques de panne dans les 72 prochaines heures:

${JSON.stringify(sitesData, null, 2)}

Pour chaque site à risque, donne une prédiction. Réponds en JSON:
{"predictions":[{"siteCode":"DLA-001","risque":"élevé","probabilite":75,"cause":"Température capteur 42°C proche seuil","action":"Inspection refroidissement sous 24h"}]}`;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{role:'user', content: prompt}]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || '{"predictions":[]}';
      const clean = text.replace(/```json|```/g,'').trim();
      const {predictions} = JSON.parse(clean);
      setFaultPredictions(predictions || []);
    } catch(e) { console.error('Fault prediction error:', e); }
    finally { setLoadingIA(false); }
  };

  // ===== MÉTÉO open-meteo.com =====
  const fetchWeather = async () => {
    setLoadingWeather(true);
    try {
      const results = {};
      for(const site of SITES.slice(0,4)) { // 4 premiers sites pour limiter les appels
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${site.lat}&longitude=${site.lng}&current=temperature_2m,precipitation,wind_speed_10m,weathercode&timezone=Africa/Douala`;
        const res = await fetch(url);
        const data = await res.json();
        const cur = data.current;
        results[site.code] = {
          temp: Math.round(cur?.temperature_2m || 28),
          pluie: (cur?.precipitation || 0) > 0,
          vent: Math.round(cur?.wind_speed_10m || 15),
          code: cur?.weathercode || 0,
          danger: (cur?.precipitation > 5) || (cur?.wind_speed_10m > 40)
        };
      }
      setWeatherData(results);
    } catch(e) { console.error('Weather error:', e); }
    finally { setLoadingWeather(false); }
  };

  // Charger météo au démarrage
  useEffect(() => { fetchWeather(); }, []);

  useEffect(()=>{
    if(!liveMode) return;
    const interval=setInterval(()=>{
      setTechniciens(prev=>prev.map(t=>{
        if(t.status==="en_mission") return {...t,lat:t.lat+((Math.random()-0.5)*0.0002),lng:t.lng+((Math.random()-0.5)*0.0002),lastUpdate:"À l\'instant"};
        if(t.status==="en_deplacement"&&t.siteLat){
          const dLat=(t.siteLat-t.lat)*0.05,dLng=(t.siteLng-t.lng)*0.05;
          return {...t,lat:t.lat+dLat,lng:t.lng+dLng,lastUpdate:"À l\'instant"};
        }
        return t;
      }));
      setLastRefresh(new Date());
    },5000);
    return()=>clearInterval(interval);
  },[liveMode]);

  // ===== UPDATE MARKERS GPS =====
  useEffect(()=>{
    if(!mapInstanceRef.current||!window.L) return;
    techniciens.forEach(t=>{
      const m=techMarkersRef.current[t.id];
      if(m) m.setLatLng([t.lat,t.lng]);
    });
  },[techniciens]);

  // ===== ALERTES PROXIMITÉ =====
  useEffect(()=>{
    const alerts=[];
    const disponibles=techniciens.filter(t=>t.status==="disponible");
    const sitesRetard=SITES.filter(s=>s.status==="en_retard"&&!s.techId);
    disponibles.forEach(tech=>{
      sitesRetard.forEach(site=>{
        const dist=haversine(tech.lat,tech.lng,site.lat,site.lng);
        if(dist<5000){
          alerts.push({techId:tech.id,techNom:tech.nom,siteCode:site.code,siteName:site.name,dist:Math.round(dist/100)/10,color:"#0f9d58"});
        }
      });
    });
    setProximityAlerts(alerts);
    if(alerts.length>0&&notifications.length===0){
      setNotifications(prev=>[...prev,{id:Date.now(),msg:`${alerts[0].techNom} est à ${alerts[0].dist}km de ${alerts[0].siteCode}`,color:"#0f9d58",time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}]);
    }
  },[techniciens]);

  // ===== CHARGEMENT LEAFLET + PLUGINS =====
  useEffect(()=>{
    const addCSS=(id,href)=>{
      if(document.getElementById(id)) return;
      const link=document.createElement("link");
      link.id=id;link.rel="stylesheet";link.href=href;
      document.head.appendChild(link);
    };
    const addScript=(src,onload)=>{
      const s=document.createElement("script");
      s.src=src;s.onload=onload;
      document.head.appendChild(s);
      return s;
    };

    addCSS("leaflet-css","https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");
    addCSS("leaflet-cluster-css","https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css");

    if(window.L){setLoaded(true);return;}

    addScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",()=>{
      addScript("https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js",()=>{
        addScript("https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js",()=>{
          setLoaded(true);
        });
      });
    });

    return()=>{if(mapInstanceRef.current){mapInstanceRef.current.remove();mapInstanceRef.current=null;}};
  },[]);

  // ===== INIT CARTE =====
  useEffect(()=>{
    if(!loaded||!mapRef.current||mapInstanceRef.current) return;
    const L=window.L;

    const map=L.map(mapRef.current,{
      center:[5.5,12.0],zoom:6,
      zoomControl:false,
      preferCanvas:true,
    });

    L.control.zoom({position:"bottomright"}).addTo(map);

    // Tuile Hybride HD
    tileLayerRef.current=L.tileLayer(LAYERS[0].url,{
      attribution:'© Maptiler © OpenStreetMap',
      maxZoom:20,tileSize:256,detectRetina:true,crossOrigin:true,
    }).addTo(map);

    // ===== CLUSTER SITES =====
    const siteCluster=L.markerClusterGroup({
      maxClusterRadius:60,
      iconCreateFunction:(cluster)=>{
        const count=cluster.getChildCount();
        return L.divIcon({
          html:`<div style="width:44px;height:44px;border-radius:50%;background:#1a73e8;border:3px solid white;box-shadow:0 3px 12px rgba(26,115,232,.4);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:14px">${count}</div>`,
          className:"",iconSize:[44,44],iconAnchor:[22,22]
        });
      },
      spiderfyOnMaxZoom:true,
      showCoverageOnHover:false,
    });

    SITES.forEach(site=>{
      const cfg=STATUS_SITES[site.status]||STATUS_SITES.planifie;
      const icon=L.divIcon({
        html:`<div style="position:relative;width:54px;height:66px;cursor:pointer">
          <div style="position:absolute;top:-22px;left:50%;transform:translateX(-50%);background:${cfg.color};color:white;font-size:9px;font-weight:700;padding:2px 7px;border-radius:8px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.2)">${site.name.length>16?site.name.slice(0,16)+"...":site.name}</div>
          <div style="width:54px;height:54px;border-radius:12px;background:${cfg.color};border:3px solid white;box-shadow:0 4px 16px rgba(0,0,0,.25);display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative">
            <span style="color:white;font-weight:900;font-size:14px;line-height:1">${site.type.includes("5G")?"5G":site.type.includes("4G")?"4G":"3G"}</span>
            <span style="color:rgba(255,255,255,.85);font-size:8px;font-weight:600;margin-top:1px">${site.code}</span>
            <div style="position:absolute;bottom:0;left:0;right:0;height:4px;background:rgba(0,0,0,.2);border-radius:0 0 4px 4px;overflow:hidden"><div style="height:100%;width:${site.progression}%;background:rgba(255,255,255,.75)"></div></div>
            ${site.status==="en_retard"?`<div style="position:absolute;top:-5px;right:-5px;width:17px;height:17px;border-radius:50%;background:#ea4335;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:9px;color:white;font-weight:700">!</div>`:""}
          </div>
          <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-top:14px solid ${cfg.color}"></div>
        </div>`,
        className:"",iconSize:[54,66],iconAnchor:[27,66]
      });
      const marker=L.marker([site.lat,site.lng],{icon});
      marker.on("click",()=>{
        setSelected(site);setSelectedTech(null);
        map.flyTo([site.lat,site.lng],15,{animate:true,duration:1.2});
        clearRoutes(map);setRouteInfo(null);
      });
      markersRef.current[site.code]=marker;
      siteCluster.addLayer(marker);
    });
    map.addLayer(siteCluster);

    // ===== CLUSTER TECHNICIENS =====
    const techCluster=L.markerClusterGroup({
      maxClusterRadius:50,
      iconCreateFunction:(cluster)=>{
        const count=cluster.getChildCount();
        return L.divIcon({
          html:`<div style="width:40px;height:40px;border-radius:50%;background:#0f9d58;border:3px solid white;box-shadow:0 3px 12px rgba(15,157,88,.4);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:14px">${count}</div>`,
          className:"",iconSize:[40,40],iconAnchor:[20,20]
        });
      },
      spiderfyOnMaxZoom:true,
      showCoverageOnHover:false,
    });

    TECHNICIENS_INIT.forEach(tech=>{
      const st=STATUS_TECH[tech.status]||STATUS_TECH.disponible;
      const photo=PHOTOS[tech.id];
      const icon=L.divIcon({
        html:`<div style="position:relative;width:50px;height:62px;cursor:pointer">
          <div style="position:absolute;top:-22px;left:50%;transform:translateX(-50%);background:${tech.color};color:white;font-size:9px;font-weight:700;padding:2px 7px;border-radius:8px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.2)">${tech.nom.split(" ")[0]}</div>
          <div style="width:50px;height:50px;border-radius:50%;overflow:hidden;border:3px solid ${tech.color};box-shadow:0 0 0 2px rgba(255,255,255,.9),0 4px 14px rgba(0,0,0,.25)">
            ${photo?`<img src="${photo}" style="width:100%;height:100%;object-fit:cover" loading="lazy"/>`:`<div style="width:100%;height:100%;background:${tech.color};display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:14px">${tech.avatar}</div>`}
            <div style="position:absolute;bottom:3px;right:3px;width:12px;height:12px;border-radius:50%;background:${st.color};border:2px solid white"></div>
          </div>
          <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:12px solid ${tech.color}"></div>
        </div>`,
        className:"",iconSize:[50,62],iconAnchor:[25,62]
      });
      const marker=L.marker([tech.lat,tech.lng],{icon});
      marker.on("click",()=>{
        setSelectedTech(tech);setSelected(null);
        map.flyTo([tech.lat,tech.lng],15,{animate:true,duration:1.2});
        if(tech.siteLat&&tech.status!=="disponible"){
          calculateRoute(map,tech.lat,tech.lng,tech.siteLat,tech.siteLng);
        } else {clearRoutes(map);setRouteInfo(null);}
      });
      techMarkersRef.current[tech.id]=marker;
      techCluster.addLayer(marker);
    });
    map.addLayer(techCluster);

    // ===== GEOFENCES =====
    GEOFENCES_INIT.forEach(gf=>{
      const circle=L.circle([gf.lat,gf.lng],{
        radius:gf.radius,
        color:gf.color,
        fillColor:gf.color,
        fillOpacity:0.08,
        weight:2,
        dashArray:"6,4",
      }).addTo(map);
      const label=L.divIcon({
        html:`<div style="background:${gf.color};color:white;font-size:9px;font-weight:700;padding:2px 7px;border-radius:8px;white-space:nowrap;opacity:.85">${gf.name}</div>`,
        className:"",iconAnchor:[0,0]
      });
      L.marker([gf.lat,gf.lng],{icon:label}).addTo(map);
      geofenceLayersRef.current[gf.id]=circle;
    });

    // ===== MODE MESURE =====
    map.on("click",(e)=>{
      if(!measureModeRef.current) return;
      const pts=measurePointsRef.current;
      // Marqueur point cliqué
      const dot=L.circleMarker(e.latlng,{
        radius:6,color:"#ea4335",fillColor:"#ea4335",fillOpacity:1,weight:2,
      }).addTo(map);
      measureLayersRef.current.push(dot);
      pts.push(e.latlng);
      if(pts.length===2){
        const dist=haversine(pts[0].lat,pts[0].lng,pts[1].lat,pts[1].lng);
        const line=L.polyline(pts,{color:"#ea4335",weight:3,dashArray:"6,4"}).addTo(map);
        const midLat=(pts[0].lat+pts[1].lat)/2;
        const midLng=(pts[0].lng+pts[1].lng)/2;
        const lbl=L.divIcon({
          html:`<div style="background:#ea4335;color:white;font-size:11px;font-weight:700;padding:4px 10px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.2);white-space:nowrap">${(dist/1000).toFixed(2)} km · ${Math.round(dist)} m</div>`,
          className:"",iconAnchor:[0,12]
        });
        const lblMarker=L.marker([midLat,midLng],{icon:lbl}).addTo(map);
        measureLayersRef.current.push(line,lblMarker);
        measurePointsRef.current=[];
      }
    });

    // ===== MARQUEURS PHOTOS GÉOLOCALISÉES (CleanCam) =====
    const addPhotoMarkers=(photosList)=>{
      photosList.forEach(photo=>{
        const tech=TECHNICIENS_INIT.find(t=>t.id===photo.techId);
        const icon=L.divIcon({
          html:`<div style="position:relative;cursor:pointer">
            <div style="width:44px;height:44px;border-radius:6px;overflow:hidden;border:3px solid ${tech?.color||"#1a73e8"};box-shadow:0 3px 10px rgba(0,0,0,.3)">
              <img src="${photo.url}" style="width:100%;height:100%;object-fit:cover"/>
            </div>
            <div style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);background:${tech?.color||"#1a73e8"};color:white;font-size:8px;font-weight:700;padding:1px 5px;border-radius:5px;white-space:nowrap">📷 ${photo.time}</div>
            <div style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid ${tech?.color||"#1a73e8"}"></div>
          </div>`,
          className:"",iconSize:[44,44],iconAnchor:[22,50]
        });
        const marker=L.marker([photo.lat,photo.lng],{icon,zIndexOffset:100})
          .addTo(map)
          .bindPopup(`<div style="font-family:Inter,sans-serif;padding:4px">
            <img src="${photo.url}" style="width:200px;height:120px;object-fit:cover;border-radius:6px;margin-bottom:8px"/>
            <div style="font-size:11px;font-weight:700;color:#202124;margin-bottom:3px">${photo.desc}</div>
            <div style="font-size:10px;color:#5f6368">${tech?.nom||"Technicien"} · ${photo.time} · ${photo.site}</div>
          </div>`,{maxWidth:220});
        photoMarkersRef.current[photo.id]=marker;
      });
    };
    addPhotoMarkers([
      {id:"P001",techId:"EE001",lat:4.0511,lng:9.7085,url:"https://picsum.photos/200/150?random=1",desc:"Antenne RRU installée - DLA-001",time:"09:45",site:"DLA-001"},
      {id:"P002",techId:"EE002",lat:3.8480,lng:11.5021,url:"https://picsum.photos/200/150?random=2",desc:"BBU configuration terminée - YDE-001",time:"11:20",site:"YDE-001"},
      {id:"P003",techId:"EE004",lat:9.3019,lng:13.3920,url:"https://picsum.photos/200/150?random=3",desc:"Inspection pylône - GAR-001",time:"10:15",site:"GAR-001"},
    ]);

    // ===== CURSEURS COLLABORATIFS (autres PMs en ligne) =====
    const collabData=[
      {id:"PM001",nom:"Marie Kamga",lat:4.05,lng:9.71,color:"#db2777"},
      {id:"PM002",nom:"Jean Fouda",lat:3.85,lng:11.50,color:"#f29900"},
    ];
    collabData.forEach(pm=>{
      const icon=L.divIcon({
        html:`<div style="position:relative">
          <div style="width:32px;height:32px;border-radius:50%;background:${pm.color};border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white">${pm.nom.split(" ").map(n=>n[0]).join("")}</div>
          <div style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);background:${pm.color};color:white;font-size:8px;font-weight:700;padding:1px 5px;border-radius:5px;white-space:nowrap">👤 ${pm.nom.split(" ")[0]}</div>
        </div>`,
        className:"",iconSize:[32,32],iconAnchor:[16,16]
      });
      const marker=L.marker([pm.lat,pm.lng],{icon,zIndexOffset:200}).addTo(map);
      collabMarkersRef.current[pm.id]=marker;
    });

    mapInstanceRef.current=map;
  },[loaded]);

  // ===== TOGGLE PHOTOS =====
  useEffect(()=>{
    Object.values(photoMarkersRef.current).forEach(m=>{
      if(!mapInstanceRef.current) return;
      try{
        if(showPhotos) mapInstanceRef.current.addLayer(m);
        else mapInstanceRef.current.removeLayer(m);
      }catch(e){}
    });
  },[showPhotos]);

  // ===== TOGGLE COLLAB =====
  useEffect(()=>{
    Object.values(collabMarkersRef.current).forEach(m=>{
      if(!mapInstanceRef.current) return;
      try{
        if(showCollab) mapInstanceRef.current.addLayer(m);
        else mapInstanceRef.current.removeLayer(m);
      }catch(e){}
    });
  },[showCollab]);

  // Simulation mouvement curseurs collaboratifs
  useEffect(()=>{
    if(!showCollab) return;
    const interval=setInterval(()=>{
      setCollabCursors(prev=>prev.map(pm=>({
        ...pm,
        lat:pm.lat+((Math.random()-0.5)*0.002),
        lng:pm.lng+((Math.random()-0.5)*0.002),
        lastSeen:"maintenant"
      })));
    },8000);
    return()=>clearInterval(interval);
  },[showCollab]);

  // Update curseurs collab sur carte
  useEffect(()=>{
    collabCursors.forEach(pm=>{
      const m=collabMarkersRef.current[pm.id];
      if(m) m.setLatLng([pm.lat,pm.lng]);
    });
  },[collabCursors]);

  // ===== HEATMAP =====
  useEffect(()=>{
    if(!mapInstanceRef.current||!window.L||!window.L.heatLayer) return;
    if(heatLayerRef.current){
      mapInstanceRef.current.removeLayer(heatLayerRef.current);
      heatLayerRef.current=null;
    }
    if(showHeatmap){
      const heatPoints=SITES.map(s=>[s.lat,s.lng,s.progression/100]);
      heatLayerRef.current=window.L.heatLayer(heatPoints,{
        radius:50,blur:30,maxZoom:10,
        gradient:{0.3:"#0f9d58",0.6:"#f29900",1.0:"#ea4335"}
      }).addTo(mapInstanceRef.current);
    }
  },[showHeatmap]);

  // ===== GEOFENCES TOGGLE =====
  useEffect(()=>{
    if(!mapInstanceRef.current) return;
    Object.values(geofenceLayersRef.current).forEach(layer=>{
      if(showGeofences) mapInstanceRef.current.addLayer(layer);
      else mapInstanceRef.current.removeLayer(layer);
    });
  },[showGeofences]);

  // ===== REPLAY TRAJECTOIRE =====
  const replayIntervalRef = useRef(null);
  
  const runReplay = useCallback(()=>{
    if(replayIntervalRef.current) clearInterval(replayIntervalRef.current);
    let step = 0;
    
    replayIntervalRef.current = setInterval(()=>{
      setReplayStep(s=>{
        const tech = replayTech;
        if(!tech) { clearInterval(replayIntervalRef.current); return s; }
        const traj = tech.trajectory;
        if(s >= traj.length - 1){
          clearInterval(replayIntervalRef.current);
          setReplayPlaying(false);
          return s;
        }
        const current = traj[s];
        const next = traj[s+1];
        if(mapInstanceRef.current && window.L){
          const seg = window.L.polyline(
            [[current.lat,current.lng],[next.lat,next.lng]],
            {color:tech.color, weight:5, opacity:.9}
          ).addTo(mapInstanceRef.current);
          const dot = window.L.circleMarker([next.lat,next.lng],{
            radius:8, color:"white", fillColor:tech.color,
            fillOpacity:1, weight:2.5,
          }).addTo(mapInstanceRef.current);
          const popup = window.L.popup({closeButton:false,offset:[0,-10]})
            .setLatLng([next.lat,next.lng])
            .setContent(`<div style="font-family:Inter,sans-serif;font-size:11px;font-weight:700;color:#202124">${tech.nom.split(" ")[0]} · ${next.time}</div>`)
            .openOn(mapInstanceRef.current);
          replayLayersRef.current.push(seg, dot);
          mapInstanceRef.current.panTo([next.lat, next.lng], {animate:true, duration:.5});
        }
        return s + 1;
      });
    }, 1200);
  }, [replayTech]);

  useEffect(()=>{
    if(replayPlaying && replayTech){
      runReplay();
    } else {
      if(replayIntervalRef.current) clearInterval(replayIntervalRef.current);
    }
    return()=>{ if(replayIntervalRef.current) clearInterval(replayIntervalRef.current); };
  },[replayPlaying, replayTech, runReplay]);

  const startReplay=(tech)=>{
    // Nettoyer ancien replay
    replayLayersRef.current.forEach(l=>{try{mapInstanceRef.current.removeLayer(l);}catch(e){}});
    replayLayersRef.current=[];
    setReplayTech(tech);
    setReplayStep(0);
    setReplayPlaying(true);
    setSidebarTab("replay");
    setSidebarOpen(true);
    if(mapInstanceRef.current&&tech.trajectory.length>0){
      mapInstanceRef.current.flyTo([tech.trajectory[0].lat,tech.trajectory[0].lng],14,{animate:true,duration:1.5});
    }
  };

  const stopReplay=()=>{
    setReplayPlaying(false);
    setReplayTech(null);
    setReplayStep(0);
    replayLayersRef.current.forEach(l=>{try{mapInstanceRef.current.removeLayer(l);}catch(e){}});
    replayLayersRef.current=[];
  };

  const clearRoutes=(map)=>{
    routeLayersRef.current.forEach(l=>{try{map.removeLayer(l);}catch(e){}});
    routeLayersRef.current=[];
  };

  const calculateRoute=useCallback(async(map,fromLat,fromLng,toLat,toLng)=>{
    setLoadingRoute(true);setRouteInfo(null);
    clearRoutes(map);
    try{
      const url=`https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
      const resp=await fetch(url);
      const data=await resp.json();
      if(data.code==="Ok"&&data.routes[0]){
        const route=data.routes[0];
        const coords=route.geometry.coordinates.map(c=>[c[1],c[0]]);
        const dist=(route.distance/1000).toFixed(1);
        const dur=Math.round(route.duration/60);
        setRouteInfo({distance:dist,duration:dur});
        const line=window.L.polyline(coords,{color:"#1a73e8",weight:5,opacity:.9}).addTo(map);
        const deco=window.L.polyline(coords,{color:"white",weight:2,opacity:.6,dashArray:"6,10"}).addTo(map);
        routeLayersRef.current=[line,deco];
        const bounds=window.L.latLngBounds(coords);
        map.fitBounds(bounds,{padding:[80,80],animate:true,duration:1.5});
      }
    }catch(e){
      const line=window.L.polyline([[fromLat,fromLng],[toLat,toLng]],{color:"#f29900",weight:3,dashArray:"8,6",opacity:.8}).addTo(map);
      routeLayersRef.current=[line];
      setRouteInfo({distance:"~",duration:"~"});
    }
    setLoadingRoute(false);
  },[]);

  const changeLayer=(layerId)=>{
    if(!mapInstanceRef.current||!window.L) return;
    if(tileLayerRef.current) mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const layer=LAYERS.find(l=>l.id===layerId);
    tileLayerRef.current=window.L.tileLayer(layer.url,{
      attribution:"© Maptiler © OpenStreetMap",
      maxZoom:20,tileSize:256,detectRetina:true,crossOrigin:true,
    }).addTo(mapInstanceRef.current);
    setActiveLayer(layerId);
  };

  const flyTo=(lat,lng,zoom=15)=>mapInstanceRef.current?.flyTo([lat,lng],zoom,{animate:true,duration:1.2});

  const closePanel=()=>{
    setSelected(null);setSelectedTech(null);
    setRouteInfo(null);clearRoutes(mapInstanceRef.current);
  };

  const handleNavClick=(tabId)=>{
    if(sidebarOpen&&sidebarTab===tabId) setSidebarOpen(false);
    else{setSidebarTab(tabId);setSidebarOpen(true);}
  };

  const toggleMeasure=()=>{
    const next = !measureMode;
    measureModeRef.current = next;
    if(!next){
      measureLayersRef.current.forEach(l=>{try{mapInstanceRef.current.removeLayer(l);}catch(e){}});
      measureLayersRef.current=[];
      measurePointsRef.current=[];
    }
    setMeasureMode(next);
  };

  const doDispatch=()=>{
    if(!dispatchTech||!dispatchSite) return;
    const site=SITES.find(s=>s.code===dispatchSite.code);
    setTechniciens(prev=>prev.map(t=>t.id===dispatchTech.id?{...t,status:"en_deplacement",site:dispatchSite.code,siteLat:site?.lat,siteLng:site?.lng}:t));
    if(mapInstanceRef.current&&site) calculateRoute(mapInstanceRef.current,dispatchTech.lat,dispatchTech.lng,site.lat,site.lng);
    setShowDispatch(false);setDispatchTech(null);setDispatchSite(null);
  };

  const filteredSites=SITES.filter(s=>{
    const mf=filter==="tous"||s.status===filter;
    const mq=!searchQ||s.code.toLowerCase().includes(searchQ.toLowerCase())||s.name.toLowerCase().includes(searchQ.toLowerCase());
    return mf&&mq;
  });

  const panelOpen=!!(selected||selectedTech);

  return(
    <div style={{display:"flex",height:"calc(100vh - 56px)",overflow:"hidden",fontFamily:"\'Inter\',\'Segoe UI\',Arial,sans-serif",position:"relative"}}>

      {/* ===== BARRE ICÔNES GAUCHE ===== */}
      <div style={{width:60,flexShrink:0,background:"white",borderRight:"1px solid #e8eaed",display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 0",gap:3,zIndex:50,boxShadow:"2px 0 8px rgba(0,0,0,.06)"}}>

        {/* Logo */}
        <div style={{width:38,height:38,borderRadius:10,background:"#1a73e8",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10,flexShrink:0}}>
          <SvgIco d={ICONS.layers} size={18} color="white"/>
        </div>

        {/* Nav */}
        {NAV_ICONS.map(nav=>(
          <div key={nav.id} onClick={()=>handleNavClick(nav.id)}
            title={nav.label}
            style={{width:44,height:44,borderRadius:10,background:sidebarOpen&&sidebarTab===nav.id?"#e8f0fe":"transparent",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative",transition:"all .15s",gap:1}}
            onMouseEnter={e=>e.currentTarget.style.background=sidebarOpen&&sidebarTab===nav.id?"#e8f0fe":"#f1f3f4"}
            onMouseLeave={e=>e.currentTarget.style.background=sidebarOpen&&sidebarTab===nav.id?"#e8f0fe":"transparent"}>
            <SvgIco d={ICONS[nav.icon]||ICONS.sites} size={18} color={sidebarOpen&&sidebarTab===nav.id?"#1a73e8":"#5f6368"}/>
            <span style={{fontSize:7,color:sidebarOpen&&sidebarTab===nav.id?"#1a73e8":"#5f6368",fontWeight:sidebarOpen&&sidebarTab===nav.id?700:400}}>{nav.label}</span>
            {nav.badge&&<div style={{position:"absolute",top:3,right:3,width:13,height:13,borderRadius:"50%",background:"#ea4335",color:"white",fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{nav.badge}</div>}
          </div>
        ))}

        <div style={{width:32,height:1,background:"#e8eaed",margin:"6px 0"}}/>

        {/* Live */}
        <div onClick={()=>setLiveMode(!liveMode)} title={liveMode?"GPS Live":"GPS Pause"}
          style={{width:44,height:44,borderRadius:10,background:liveMode?"#e6f4ea":"transparent",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:2}}>
          <SvgIco d={ICONS.live} size={18} color={liveMode?"#0f9d58":"#9aa0a6"}/>
          <span style={{fontSize:7,color:liveMode?"#0f9d58":"#9aa0a6",fontWeight:700,marginTop:1}}>{liveMode?"LIVE":"OFF"}</span>
        </div>

        {/* Heatmap */}
        <div onClick={()=>setShowHeatmap(!showHeatmap)} title="Heatmap interventions"
          style={{width:44,height:44,borderRadius:10,background:showHeatmap?"#fce8e6":"transparent",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:2}}>
          <SvgIco d={ICONS.heat} size={18} color={showHeatmap?"#ea4335":"#5f6368"}/>
          <span style={{fontSize:7,color:showHeatmap?"#ea4335":"#5f6368",fontWeight:showHeatmap?700:400,marginTop:1}}>Chaleur</span>
        </div>

        {/* Mesure */}
        <div onClick={toggleMeasure} title="Mesurer une distance"
          style={{width:44,height:44,borderRadius:10,background:measureMode?"#fff3cd":"transparent",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:2}}>
          <SvgIco d={ICONS.measure} size={18} color={measureMode?"#f29900":"#5f6368"}/>
          <span style={{fontSize:7,color:measureMode?"#f29900":"#5f6368",fontWeight:measureMode?700:400,marginTop:1}}>Mesure</span>
        </div>

        {/* Zones */}
        <div onClick={()=>setShowGeofences(!showGeofences)} title="Afficher/masquer les zones"
          style={{width:44,height:44,borderRadius:10,background:showGeofences?"#e8f0fe":"transparent",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:2}}>
          <SvgIco d={ICONS.zones} size={18} color={showGeofences?"#1a73e8":"#5f6368"}/>
          <span style={{fontSize:7,color:showGeofences?"#1a73e8":"#5f6368",fontWeight:showGeofences?700:400,marginTop:1}}>Zones</span>
        </div>

        {/* Photos CleanCam */}
        <div onClick={()=>{setShowPhotos(!showPhotos);}} title="Photos CleanCam terrain"
          style={{width:44,height:44,borderRadius:10,background:showPhotos?"#e8f0fe":"transparent",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:2}}>
          <SvgIco d={ICONS.photos} size={18} color={showPhotos?"#1a73e8":"#5f6368"}/>
          <span style={{fontSize:7,color:showPhotos?"#1a73e8":"#5f6368",fontWeight:showPhotos?700:400,marginTop:1}}>Photos</span>
        </div>

        {/* Collab */}
        <div onClick={()=>{setShowCollab(!showCollab);}} title="PMs collaboratifs en ligne"
          style={{width:44,height:44,borderRadius:10,background:showCollab?"#fce8f3":"transparent",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:2,position:"relative"}}>
          <SvgIco d={ICONS.collab} size={18} color={showCollab?"#db2777":"#5f6368"}/>
          <span style={{fontSize:7,color:showCollab?"#db2777":"#5f6368",fontWeight:showCollab?700:400,marginTop:1}}>Collab</span>
          <div style={{position:"absolute",top:3,right:3,width:7,height:7,borderRadius:"50%",background:"#0f9d58",border:"1.5px solid white"}}/>
        </div>

        {/* Dispatch IA */}
        <div onClick={()=>setShowDispatch(true)} title="Dispatcher un technicien"
          style={{width:44,height:44,borderRadius:10,background:"#1a73e8",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:2,marginTop:4}}>
          <SvgIco d={ICONS.dispatch} size={18} color="white"/>
          <span style={{fontSize:7,color:"rgba(255,255,255,.85)",fontWeight:700,marginTop:1}}>Dispatch</span>
        </div>

        {/* Alerte proximité badge */}
        {proximityAlerts.length>0&&(
          <div style={{width:44,height:44,borderRadius:10,background:"#e6f4ea",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:2,position:"relative"}}
            onClick={()=>handleNavClick("alertes")}>
            <SvgIco d={ICONS.missions} size={18} color="#0f9d58"/>
            <span style={{fontSize:7,color:"#0f9d58",fontWeight:700,marginTop:1}}>Proxi</span>
            <div style={{position:"absolute",top:3,right:3,width:13,height:13,borderRadius:"50%",background:"#0f9d58",color:"white",fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{proximityAlerts.length}</div>
          </div>
        )}
      </div>

      {/* ===== SIDEBAR EXPANDABLE ===== */}
      <div style={{width:sidebarOpen?280:0,flexShrink:0,background:"white",borderRight:sidebarOpen?"1px solid #e8eaed":"none",display:"flex",flexDirection:"column",overflow:"hidden",transition:"width .2s ease",zIndex:40,boxShadow:sidebarOpen?"4px 0 12px rgba(0,0,0,.08)":"none"}}>
        {sidebarOpen&&(
          <>
            <div style={{padding:"12px 14px",borderBottom:"1px solid #f1f3f4",flexShrink:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:13,fontWeight:700,color:"#202124"}}>{NAV_ICONS.find(n=>n.id===sidebarTab)?.label||sidebarTab}</span>
                <button onClick={()=>setSidebarOpen(false)} style={{width:24,height:24,borderRadius:"50%",background:"#f1f3f4",border:"none",cursor:"pointer",fontSize:14,color:"#5f6368",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
              </div>
              {!["replay","geofence"].includes(sidebarTab)&&(
                <div style={{display:"flex",alignItems:"center",gap:8,background:"#f1f3f4",borderRadius:20,padding:"7px 12px"}}>
                  <span style={{fontSize:13,color:"#9aa0a6"}}>🔍</span>
                  <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Rechercher..."
                    style={{border:"none",outline:"none",background:"transparent",fontSize:12,flex:1,fontFamily:"inherit",color:"#202124"}}/>
                </div>
              )}
            </div>

            <div style={{flex:1,overflowY:"auto"}}>

              {/* ===== SITES ===== */}
              {sidebarTab==="sites"&&(
                <>
                  <div style={{padding:"6px 10px",borderBottom:"1px solid #f1f3f4",display:"flex",gap:4,flexWrap:"wrap"}}>
              {/* Météo overlay */}
              {Object.keys(weatherData).length>0&&(
                <div style={{marginBottom:8,padding:"8px 10px",background:"#E6F1FB",borderRadius:8,border:"1px solid #B5D4F4"}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#0C447C",marginBottom:5,textTransform:"uppercase",letterSpacing:".5px"}}>Météo sites en temps réel</div>
                  {Object.entries(weatherData).map(([code,w])=>(
                    <div key={code} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:"1px solid rgba(0,0,0,0.05)"}}>
                      <span style={{fontSize:11,fontWeight:600,color:"#1B3A52"}}>{code}</span>
                      <div style={{display:"flex",gap:8,alignItems:"center",fontSize:10}}>
                        <span style={{color:"#D97706"}}>{w.temp}°C</span>
                        <span style={{color:"#6B7280"}}>{w.vent}km/h</span>
                        {w.pluie&&<span style={{color:"#185FA5",fontWeight:700}}>Pluie</span>}
                        {w.danger&&<span style={{color:"#A32D2D",fontWeight:700,background:"#FCEBEB",padding:"1px 5px",borderRadius:8}}>⚠ Danger</span>}
                      </div>
                    </div>
                  ))}
                  <button onClick={fetchWeather} style={{marginTop:5,fontSize:10,padding:"3px 8px",borderRadius:5,border:"1px solid #B5D4F4",background:"none",color:"#185FA5",cursor:"pointer",fontFamily:"inherit"}}>
                    {loadingWeather?"Chargement...":"Actualiser météo"}
                  </button>
                </div>
              )}

                    {[{v:"tous",l:"Tous"},...Object.entries(STATUS_SITES).map(([k,v])=>({v:k,l:v.label,c:v.color}))].map(f=>(
                      <button key={f.v} onClick={()=>setFilter(f.v)}
                        style={{padding:"2px 8px",borderRadius:12,border:`1px solid ${filter===f.v?(f.c||"#1a73e8"):"#e8eaed"}`,background:filter===f.v?`${f.c||"#1a73e8"}12`:"white",color:filter===f.v?(f.c||"#1a73e8"):"#5f6368",fontSize:9,cursor:"pointer",fontWeight:filter===f.v?700:400}}>
                        {f.l}
                      </button>
                    ))}
                  </div>
                  {filteredSites.map(site=>{
                    const cfg=STATUS_SITES[site.status]||STATUS_SITES.planifie;
                    const techSite=techniciens.find(t=>t.site===site.code);
                    return(
                      <div key={site.code}
                        onClick={()=>{setSelected(site);setSelectedTech(null);flyTo(site.lat,site.lng,15);clearRoutes(mapInstanceRef.current);setRouteInfo(null);}}
                        style={{padding:"10px 12px",borderBottom:"1px solid #f1f3f4",cursor:"pointer",background:selected?.code===site.code?"#e8f0fe":"white",borderLeft:`3px solid ${selected?.code===site.code?cfg.color:"transparent"}`,transition:"all .1s"}}
                        onMouseEnter={e=>e.currentTarget.style.background=selected?.code===site.code?"#e8f0fe":"#f8f9fa"}
                        onMouseLeave={e=>e.currentTarget.style.background=selected?.code===site.code?"#e8f0fe":"white"}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                          <span style={{fontSize:11,fontWeight:700,color:cfg.color}}>{site.code}</span>
                          <span style={{fontSize:8,fontWeight:600,padding:"1px 6px",borderRadius:8,background:cfg.bg,color:cfg.color}}>{cfg.label}</span>
                        </div>
                        <div style={{fontSize:11,fontWeight:500,color:"#202124",marginBottom:2}}>{site.name}</div>
                        <div style={{fontSize:9,color:"#5f6368",marginBottom:5}}>📡 {site.type} · {site.client}</div>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:techSite?5:0}}>
                          <div style={{flex:1,height:3,background:"#e8eaed",borderRadius:2,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${site.progression}%`,background:cfg.color,borderRadius:2}}/>
                          </div>
                          <span style={{fontSize:9,fontWeight:700,color:cfg.color}}>{site.progression}%</span>
                        </div>
                        {techSite&&(
                          <div style={{display:"flex",alignItems:"center",gap:6,padding:"3px 7px",borderRadius:8,background:"#f8f9fa"}}>
                            <div style={{width:16,height:16,borderRadius:"50%",overflow:"hidden",border:`1.5px solid ${techSite.color}`,flexShrink:0}}>
                              {PHOTOS[techSite.id]?<img src={PHOTOS[techSite.id]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{width:"100%",height:"100%",background:techSite.color}}/>}
                            </div>
                            <span style={{fontSize:9,color:"#5f6368"}}>{techSite.nom.split(" ")[0]} · <span style={{color:STATUS_TECH[techSite.status]?.color,fontWeight:600}}>{STATUS_TECH[techSite.status]?.label}</span></span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}

              {/* ===== ÉQUIPE ===== */}
              {sidebarTab==="techs"&&techniciens.filter(t=>!searchQ||t.nom.toLowerCase().includes(searchQ.toLowerCase())).map(tech=>{
                const st=STATUS_TECH[tech.status]||STATUS_TECH.disponible;
                return(
                  <div key={tech.id}
                    onClick={()=>{setSelectedTech(tech);setSelected(null);flyTo(tech.lat,tech.lng,15);if(tech.siteLat&&tech.status!=="disponible")calculateRoute(mapInstanceRef.current,tech.lat,tech.lng,tech.siteLat,tech.siteLng);}}
                    style={{padding:"10px 12px",borderBottom:"1px solid #f1f3f4",cursor:"pointer",background:selectedTech?.id===tech.id?"#e8f0fe":"white",transition:"all .1s"}}
                    onMouseEnter={e=>e.currentTarget.style.background=selectedTech?.id===tech.id?"#e8f0fe":"#f8f9fa"}
                    onMouseLeave={e=>e.currentTarget.style.background=selectedTech?.id===tech.id?"#e8f0fe":"white"}>
                    <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:6}}>
                      <div style={{position:"relative",flexShrink:0}}>
                        <div style={{width:36,height:36,borderRadius:"50%",overflow:"hidden",border:`2.5px solid ${tech.color}`}}>
                          {PHOTOS[tech.id]?<img src={PHOTOS[tech.id]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{width:"100%",height:"100%",background:tech.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:11,fontWeight:700}}>{tech.avatar}</div>}
                        </div>
                        <div style={{position:"absolute",bottom:-1,right:-1,width:11,height:11,borderRadius:"50%",background:st.color,border:"2px solid white"}}/>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:700,color:"#202124"}}>{tech.nom}</div>
                        <div style={{fontSize:9,color:"#5f6368"}}>{tech.specialite}</div>
                        <div style={{marginTop:3,display:"flex",gap:4,flexWrap:"wrap"}}>
                          <span style={{fontSize:8,fontWeight:600,padding:"1px 6px",borderRadius:8,background:st.bg,color:st.color}}>{st.label}</span>
                          <span style={{fontSize:8,color:tech.battery>50?"#0f9d58":tech.battery>20?"#f29900":"#ea4335",fontWeight:600}}>🔋{tech.battery}%</span>
                          <span style={{fontSize:8,color:"#5f6368"}}>📶{tech.signal}/5</span>
                        </div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:5}}>
                      <button onClick={e=>{e.stopPropagation();startReplay(tech);}}
                        style={{flex:1,padding:"5px",borderRadius:6,border:"1px solid #e8eaed",background:"white",color:"#5f6368",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>
                        ⏮ Replay trajet
                      </button>
                      {tech.status==="disponible"&&(
                        <button onClick={e=>{e.stopPropagation();setDispatchTech(tech);setShowDispatch(true);}}
                          style={{flex:1,padding:"5px",borderRadius:6,border:"none",background:"#1a73e8",color:"white",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                          ➤ Dispatcher
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* ===== MISSIONS ===== */}
              {sidebarTab==="missions"&&(
                <div>
                  <div style={{padding:"8px 12px",borderBottom:"1px solid #f1f3f4",fontSize:10,color:"#5f6368",fontWeight:600}}>
                    {techniciens.filter(t=>t.status==="en_mission"||t.status==="en_deplacement").length} missions actives
                  </div>
                  {techniciens.filter(t=>t.status==="en_mission"||t.status==="en_deplacement").map(tech=>{
                    const site=SITES.find(s=>s.code===tech.site);
                    const st=STATUS_TECH[tech.status];
                    return(
                      <div key={tech.id} style={{padding:"10px 12px",borderBottom:"1px solid #f1f3f4"}}>
                        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:5}}>
                          <div style={{width:30,height:30,borderRadius:"50%",overflow:"hidden",border:`2px solid ${tech.color}`,flexShrink:0}}>
                            {PHOTOS[tech.id]?<img src={PHOTOS[tech.id]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{width:"100%",height:"100%",background:tech.color}}/>}
                          </div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:11,fontWeight:700,color:"#202124"}}>{tech.nom}</div>
                            <span style={{fontSize:8,fontWeight:600,padding:"1px 6px",borderRadius:8,background:st?.bg,color:st?.color}}>{st?.label}</span>
                          </div>
                        </div>
                        {site&&(
                          <>
                            <div style={{fontSize:10,color:"#5f6368",marginBottom:4}}>{site.code} · {site.name}</div>
                            <div style={{display:"flex",alignItems:"center",gap:6}}>
                              <div style={{flex:1,height:4,background:"#e8eaed",borderRadius:2,overflow:"hidden"}}>
                                <div style={{height:"100%",width:`${site.progression}%`,background:STATUS_SITES[site.status]?.color||"#1a73e8",borderRadius:2}}/>
                              </div>
                              <span style={{fontSize:9,fontWeight:700,color:STATUS_SITES[site.status]?.color||"#1a73e8"}}>{site.progression}%</span>
                            </div>
                          </>
                        )}
                        {tech.rapport&&<div style={{marginTop:4,fontSize:9,color:"#5f6368",fontStyle:"italic"}}>📋 {tech.rapport}</div>}
                        <div style={{display:"flex",gap:5,marginTop:6}}>
                          <button onClick={()=>{setSelectedTech(tech);setSelected(null);flyTo(tech.lat,tech.lng,15);if(tech.siteLat)calculateRoute(mapInstanceRef.current,tech.lat,tech.lng,tech.siteLat,tech.siteLng);}}
                            style={{flex:1,padding:"5px",borderRadius:6,border:"1px solid #e8eaed",background:"white",color:"#5f6368",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Voir + Trajet</button>
                          <button onClick={()=>startReplay(tech)}
                            style={{flex:1,padding:"5px",borderRadius:6,border:"1px solid #e8eaed",background:"white",color:"#5f6368",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Replay</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ===== ALERTES ===== */}
              {sidebarTab==="alertes"&&(
                <div>
              {/* Bouton prédiction pannes IA */}
              <div style={{margin:"0 0 12px 0",padding:"10px 12px",background:"linear-gradient(135deg,#185FA5,#6D28D9)",borderRadius:9}}>
                <div style={{fontSize:11,fontWeight:700,color:"#fff",marginBottom:6}}>Prédiction pannes — ChaCha IA</div>
                <button onClick={predictFaults} disabled={loadingIA}
                  style={{width:"100%",padding:"8px",borderRadius:7,border:"none",background:"rgba(255,255,255,0.15)",color:"#fff",fontSize:12,fontWeight:600,cursor:loadingIA?"not-allowed":"pointer",fontFamily:"inherit"}}>
                  {loadingIA?"Analyse en cours...":"Analyser les risques (72h)"}
                </button>
                {faultPredictions.length>0&&faultPredictions.filter(p=>p.siteCode).map(p=>(
                  <div key={p.siteCode} style={{marginTop:6,padding:"7px 9px",background:"rgba(0,0,0,0.3)",borderRadius:6}}>
                    <div style={{fontSize:11,fontWeight:700,color:p.probabilite>60?"#fca5a5":"#fde68a"}}>{p.siteCode} — {p.probabilite}% risque</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",marginTop:2}}>{p.cause}</div>
                    <div style={{fontSize:10,color:"#86efac",marginTop:1}}>Action: {p.action}</div>
                  </div>
                ))}
              </div>

                  {/* Alertes proximité */}
                  {proximityAlerts.length>0&&(
                    <div style={{padding:"8px 12px",background:"#e6f4ea",borderBottom:"1px solid #ceead6"}}>
                      <div style={{fontSize:10,fontWeight:700,color:"#137333",marginBottom:6}}>🎯 Alertes de proximité</div>
                      {proximityAlerts.map((a,i)=>(
                        <div key={i} style={{marginBottom:6,padding:"6px 8px",background:"white",borderRadius:7,border:"1px solid #ceead6"}}>
                          <div style={{fontSize:10,fontWeight:600,color:"#202124",marginBottom:2}}>{a.techNom} → {a.siteCode}</div>
                          <div style={{fontSize:9,color:"#5f6368",marginBottom:4}}>Distance: {a.dist} km · {a.siteName}</div>
                          <button onClick={()=>{
                            const tech=techniciens.find(t=>t.id===a.techId);
                            const site=SITES.find(s=>s.code===a.siteCode);
                            if(tech&&site){setDispatchTech(tech);setDispatchSite(site);setShowDispatch(true);}
                          }} style={{width:"100%",padding:"4px",borderRadius:5,border:"none",background:"#0f9d58",color:"white",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                            ➤ Dispatcher maintenant
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Alertes système */}
                  {[
                    {type:"RETARD",color:"#ea4335",msg:"DLA-003 en retard. Aucun technicien assigné.",time:"14:23"},
                    {type:"BATTERIE",color:"#f29900",msg:"Batterie faible (45%) — Samuel Djomo",time:"14:30"},
                    {type:"SIGNAL",color:"#f29900",msg:"Signal faible zone Garoua — Ali Moussa",time:"14:38"},
                  ].map((a,i)=>(
                    <div key={i} style={{padding:"10px 12px",borderBottom:"1px solid #f1f3f4",borderLeft:`3px solid ${a.color}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:9,fontWeight:700,color:a.color,letterSpacing:".4px"}}>{a.type}</span>
                        <span style={{fontSize:9,color:"#9aa0a6"}}>{a.time}</span>
                      </div>
                      <div style={{fontSize:11,color:"#202124",lineHeight:1.5,marginBottom:5}}>{a.msg}</div>
                      <button style={{padding:"3px 9px",borderRadius:6,border:`1px solid ${a.color}`,background:"white",color:a.color,fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Traiter</button>
                    </div>
                  ))}
                </div>
              )}

              {/* ===== GEOFENCES ===== */}
              {sidebarTab==="geofence"&&(
                <div>
                  <div style={{padding:"10px 12px",borderBottom:"1px solid #f1f3f4"}}>
                    <div style={{fontSize:11,color:"#5f6368",marginBottom:10}}>Zones de surveillance actives. Si un technicien sort d\'une zone → alerte automatique.</div>
                    {geofences.map(gf=>(
                      <div key={gf.id} style={{padding:"8px 10px",borderRadius:8,border:`1px solid ${gf.color}30`,background:`${gf.color}06`,marginBottom:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                          <span style={{fontSize:11,fontWeight:700,color:gf.color}}>{gf.name}</span>
                          <div style={{display:"flex",gap:4}}>
                            <span style={{fontSize:9,color:"#5f6368"}}>R:{(gf.radius/1000).toFixed(1)}km</span>
                            <div style={{width:28,height:16,borderRadius:8,background:gf.active?"#0f9d58":"#e8eaed",cursor:"pointer",position:"relative",transition:"background .2s"}}
                              onClick={()=>setGeofences(prev=>prev.map(g=>g.id===gf.id?{...g,active:!g.active}:g))}>
                              <div style={{position:"absolute",top:2,left:gf.active?12:2,width:12,height:12,borderRadius:"50%",background:"white",transition:"left .2s"}}/>
                            </div>
                          </div>
                        </div>
                        <div style={{fontSize:9,color:"#5f6368"}}>📍 {gf.lat.toFixed(4)}°N, {gf.lng.toFixed(4)}°E</div>
                      </div>
                    ))}
                    <button style={{width:"100%",padding:"8px",borderRadius:8,border:"2px dashed #e8eaed",background:"white",color:"#5f6368",fontSize:10,cursor:"pointer",fontFamily:"inherit",marginTop:4}}>
                      + Créer une zone
                    </button>
                  </div>
                </div>
              )}

              {/* ===== PHOTOS CLEANCAM ===== */}
              {sidebarTab==="photos"&&(
                <div>
                  <div style={{padding:"10px 12px",background:"#e8f0fe",borderBottom:"1px solid #d2e3fc",fontSize:11,color:"#1a73e8",fontWeight:600}}>
                    📷 Photos CleanCam · Géolocalisées terrain
                  </div>
                  {photos.map(photo=>{
                    const tech=TECHNICIENS_INIT.find(t=>t.id===photo.techId);
                    return(
                      <div key={photo.id} style={{padding:"10px 12px",borderBottom:"1px solid #f1f3f4",cursor:"pointer"}}
                        onClick={()=>{flyTo(photo.lat,photo.lng,16);}}>
                        <img src={photo.url} style={{width:"100%",height:100,objectFit:"cover",borderRadius:8,marginBottom:8}}/>
                        <div style={{fontSize:11,fontWeight:600,color:"#202124",marginBottom:3}}>{photo.desc}</div>
                        <div style={{display:"flex",gap:8,alignItems:"center"}}>
                          <div style={{width:20,height:20,borderRadius:"50%",overflow:"hidden",border:`1.5px solid ${tech?.color||"#1a73e8"}`,flexShrink:0}}>
                            {PHOTOS[photo.techId]?<img src={PHOTOS[photo.techId]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{width:"100%",height:"100%",background:tech?.color}}/>}
                          </div>
                          <span style={{fontSize:9,color:"#5f6368"}}>{tech?.nom} · {photo.time}</span>
                          <span style={{fontSize:9,color:"#1a73e8",fontWeight:600,marginLeft:"auto"}}>📍 {photo.site}</span>
                        </div>
                        <button onClick={e=>{e.stopPropagation();flyTo(photo.lat,photo.lng,17);}}
                          style={{width:"100%",marginTop:6,padding:"5px",borderRadius:6,border:"1px solid #e8eaed",background:"white",color:"#5f6368",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>
                          📍 Voir sur carte
                        </button>
                      </div>
                    );
                  })}
                  {/* Simuler nouvelle photo */}
                  <div style={{padding:"10px 12px"}}>
                    <button onClick={()=>{
                      const newPhoto={
                        id:`P${Date.now()}`,techId:"EE003",
                        lat:4.0167+Math.random()*0.01,lng:9.2000+Math.random()*0.01,
                        url:`https://picsum.photos/200/150?random=${Math.floor(Math.random()*100)}`,
                        desc:"Nouvelle photo terrain - LIM-001",
                        time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),
                        site:"LIM-001"
                      };
                      setPhotos(prev=>[newPhoto,...prev]);
                      // Ajouter marqueur sur carte
                      if(mapInstanceRef.current&&window.L){
                        const tech=TECHNICIENS_INIT.find(t=>t.id===newPhoto.techId);
                        const icon=window.L.divIcon({
                          html:`<div style="width:44px;height:44px;border-radius:6px;overflow:hidden;border:3px solid ${tech?.color||"#0f9d58"};box-shadow:0 3px 10px rgba(0,0,0,.3)"><img src="${newPhoto.url}" style="width:100%;height:100%;object-fit:cover"/></div>`,
                          className:"",iconSize:[44,44],iconAnchor:[22,50]
                        });
                        const m=window.L.marker([newPhoto.lat,newPhoto.lng],{icon})
                          .addTo(mapInstanceRef.current)
                          .bindPopup(`<div style="font-family:Inter,sans-serif"><img src="${newPhoto.url}" style="width:200px;height:120px;object-fit:cover;border-radius:6px;margin-bottom:6px"/><div style="font-size:11px;font-weight:700">${newPhoto.desc}</div></div>`,{maxWidth:220});
                        photoMarkersRef.current[newPhoto.id]=m;
                        mapInstanceRef.current.flyTo([newPhoto.lat,newPhoto.lng],15,{animate:true,duration:1.2});
                      }
                    }} style={{width:"100%",padding:"8px",borderRadius:8,border:"2px dashed #1a73e8",background:"#e8f0fe",color:"#1a73e8",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                      📷 Simuler nouvelle photo CleanCam
                    </button>
                  </div>
                </div>
              )}

              {/* ===== COLLAB ===== */}
              {sidebarTab==="collab"&&(
                <div>
                  <div style={{padding:"10px 12px",background:"#fce8f3",borderBottom:"1px solid #f9c3e3",fontSize:11,color:"#db2777",fontWeight:600}}>
                    👥 Project Managers en ligne — Temps réel
                  </div>
                  <div style={{padding:"8px 12px",borderBottom:"1px solid #f1f3f4",fontSize:10,color:"#5f6368"}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <div style={{width:7,height:7,borderRadius:"50%",background:"#0f9d58"}}/>
                      <span style={{fontWeight:600,color:"#0f9d58"}}>Vous êtes connecté</span>
                      <span style={{marginLeft:"auto",fontSize:9}}>Session active · {lastRefresh.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</span>
                    </div>
                  </div>
                  {collabCursors.map(pm=>(
                    <div key={pm.id} style={{padding:"10px 12px",borderBottom:"1px solid #f1f3f4"}}>
                      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                        <div style={{width:36,height:36,borderRadius:"50%",background:pm.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:12,flexShrink:0,position:"relative"}}>
                          {pm.nom.split(" ").map(n=>n[0]).join("")}
                          <div style={{position:"absolute",bottom:0,right:0,width:10,height:10,borderRadius:"50%",background:"#0f9d58",border:"2px solid white"}}/>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,fontWeight:700,color:"#202124"}}>{pm.nom}</div>
                          <div style={{fontSize:9,color:"#5f6368"}}>En ligne · Vue sur {pm.lat.toFixed(3)}°N</div>
                        </div>
                        <span style={{fontSize:9,color:"#0f9d58",fontWeight:600}}>En ligne</span>
                      </div>
                      <div style={{display:"flex",gap:5}}>
                        <button onClick={()=>flyTo(pm.lat,pm.lng,13)}
                          style={{flex:1,padding:"5px",borderRadius:6,border:"1px solid #e8eaed",background:"white",color:"#5f6368",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>
                          👁 Voir sa vue
                        </button>
                        <button style={{flex:1,padding:"5px",borderRadius:6,border:"none",background:pm.color,color:"white",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                          💬 Message
                        </button>
                      </div>
                    </div>
                  ))}
                  <div style={{padding:"10px 12px",background:"#f8f9fa"}}>
                    <div style={{fontSize:10,fontWeight:700,color:"#5f6368",marginBottom:6}}>Sessions actives</div>
                    <div style={{fontSize:10,color:"#5f6368"}}>👤 Vous · PM Principal</div>
                    {collabCursors.map(pm=>(
                      <div key={pm.id} style={{fontSize:10,color:"#5f6368",marginTop:3}}>
                        <span style={{color:pm.color}}>●</span> {pm.nom} · {pm.lastSeen}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===== REPLAY ===== */}
              {sidebarTab==="replay"&&(
                <div style={{padding:"12px"}}>
                {/* Timeline slider amélioré */}
                <div style={{padding:"8px 12px",background:"#E6F1FB",borderRadius:8,marginBottom:10,border:"1px solid #B5D4F4"}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#0C447C",marginBottom:6}}>Timeline — {timelineHour}h00</div>
                  <input type="range" min="6" max="20" value={timelineHour} onChange={e=>setTimelineHour(Number(e.target.value))}
                    style={{width:"100%",accentColor:"#185FA5"}}/>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#6B7280",marginTop:2}}>
                    <span>06h</span><span>10h</span><span>14h</span><span>18h</span><span>20h</span>
                  </div>
                  <button onClick={()=>setTimelineActive(p=>!p)}
                    style={{marginTop:6,width:"100%",padding:"7px",borderRadius:6,border:"none",background:timelineActive?"#A32D2D":"#185FA5",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                    {timelineActive?"Arrêter l'animation":"Lancer l'animation"}
                  </button>
                </div>

                  {!replayTech?(
                    <div>
                      <div style={{fontSize:11,color:"#5f6368",marginBottom:10}}>Rejouer le trajet d\'un technicien sur toute sa journée.</div>
                      {techniciens.map(tech=>(
                        <div key={tech.id} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 10px",borderRadius:8,border:"1px solid #e8eaed",marginBottom:6,cursor:"pointer",background:"white"}}
                          onClick={()=>startReplay(tech)}
                          onMouseEnter={e=>e.currentTarget.style.background="#f8f9fa"}
                          onMouseLeave={e=>e.currentTarget.style.background="white"}>
                          <div style={{width:32,height:32,borderRadius:"50%",overflow:"hidden",border:`2px solid ${tech.color}`,flexShrink:0}}>
                            {PHOTOS[tech.id]?<img src={PHOTOS[tech.id]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{width:"100%",height:"100%",background:tech.color}}/>}
                          </div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:11,fontWeight:600,color:"#202124"}}>{tech.nom}</div>
                            <div style={{fontSize:9,color:"#5f6368"}}>{tech.trajectory.length} points · {tech.heureDebut} → 14:45</div>
                          </div>
                          <span style={{fontSize:12}}></span>
                        </div>
                      ))}
                    </div>
                  ):(
                    <div>
                      <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:14}}>
                        <div style={{width:36,height:36,borderRadius:"50%",overflow:"hidden",border:`2px solid ${replayTech.color}`,flexShrink:0}}>
                          {PHOTOS[replayTech.id]?<img src={PHOTOS[replayTech.id]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{width:"100%",height:"100%",background:replayTech.color}}/>}
                        </div>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,color:"#202124"}}>{replayTech.nom}</div>
                          <div style={{fontSize:9,color:"#5f6368"}}>Replay trajet journée</div>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div style={{marginBottom:12}}>
                        {replayTech.trajectory.map((pt,i)=>(
                          <div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                            <div style={{width:10,height:10,borderRadius:"50%",background:i<=replayStep?replayTech.color:"#e8eaed",border:`2px solid ${i<=replayStep?replayTech.color:"#e8eaed"}`,flexShrink:0}}/>
                            <div style={{fontSize:10,color:i<=replayStep?"#202124":"#9aa0a6",flex:1}}>
                              <span style={{fontWeight:600}}>{pt.time}</span> · {pt.lat.toFixed(4)}°N
                            </div>
                            {i===replayStep&&<span style={{fontSize:9,color:replayTech.color,fontWeight:700}}>← ici</span>}
                          </div>
                        ))}
                      </div>

                      {/* Barre progression */}
                      <div style={{height:4,background:"#e8eaed",borderRadius:2,overflow:"hidden",marginBottom:12}}>
                        <div style={{height:"100%",width:`${(replayStep/(replayTech.trajectory.length-1))*100}%`,background:replayTech.color,borderRadius:2,transition:"width .3s"}}/>
                      </div>

                      {/* Contrôles */}
                      <div style={{display:"flex",gap:6}}>
                        <button onClick={()=>setReplayPlaying(!replayPlaying)}
                          style={{flex:1,padding:"8px",borderRadius:7,border:"none",background:"#1a73e8",color:"white",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                          {replayPlaying?"⏸ Pause":"▶ Play"}
                        </button>
                        <button onClick={stopReplay}
                          style={{flex:1,padding:"8px",borderRadius:7,border:"1px solid #e8eaed",background:"white",color:"#5f6368",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                          ⏹ Stop
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ===== CARTE PLEIN ÉCRAN ===== */}
      <div style={{flex:1,position:"relative",overflow:"hidden"}}>
        <div ref={mapRef} style={{width:"100%",height:"100%"}}/>

        {/* Chargement */}
        {!loaded&&(
          <div style={{position:"absolute",inset:0,background:"#f1f3f4",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
            <div style={{width:44,height:44,borderRadius:"50%",border:"3px solid #1a73e8",borderTopColor:"transparent",animation:"spin 1s linear infinite"}}/>
            <div style={{color:"#5f6368",fontSize:13}}>Chargement carte Maptiler HD...</div>
          </div>
        )}

        {loaded&&(
          <>
            {/* Mode mesure - instruction */}
            {measureMode&&(
              <div style={{position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",zIndex:20,background:"#f29900",color:"white",borderRadius:10,padding:"8px 16px",fontSize:12,fontWeight:700,boxShadow:"0 2px 10px rgba(0,0,0,.2)"}}>
                📏 Mode mesure actif — Cliquez 2 points sur la carte
              </div>
            )}

            {/* Info route */}
            {(routeInfo||loadingRoute)&&!measureMode&&(
              <div style={{position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",zIndex:20,background:"white",borderRadius:10,padding:"8px 18px",boxShadow:"0 2px 10px rgba(0,0,0,.15)",display:"flex",alignItems:"center",gap:14}}>
                {loadingRoute?(
                  <div style={{display:"flex",alignItems:"center",gap:8,color:"#5f6368",fontSize:12}}>
                    <div style={{width:14,height:14,borderRadius:"50%",border:"2px solid #1a73e8",borderTopColor:"transparent",animation:"spin 1s linear infinite"}}/>
                    Calcul itinéraire GPS...
                  </div>
                ):(
                  <>
                    <div style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,color:"#1a73e8"}}>{routeInfo.distance} km</div><div style={{fontSize:8,color:"#5f6368",textTransform:"uppercase",letterSpacing:".4px",marginTop:1}}>Distance</div></div>
                    <div style={{width:1,height:24,background:"#e8eaed"}}/>
                    <div style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,color:"#0f9d58"}}>{routeInfo.duration} min</div><div style={{fontSize:8,color:"#5f6368",textTransform:"uppercase",letterSpacing:".4px",marginTop:1}}>Durée est.</div></div>
                    <div style={{width:1,height:24,background:"#e8eaed"}}/>
                    <div style={{textAlign:"center"}}><div style={{fontSize:14,fontWeight:600,color:"#5f6368"}}>{new Date(Date.now()+routeInfo.duration*60000).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</div><div style={{fontSize:8,color:"#5f6368",textTransform:"uppercase",letterSpacing:".4px",marginTop:1}}>Arrivée</div></div>
                  </>
                )}
              </div>
            )}

            {/* Replay indicator */}
            {replayPlaying&&(
              <div style={{position:"absolute",top:12,right:panelOpen?292:12,zIndex:20,background:"#1a73e8",color:"white",borderRadius:10,padding:"6px 12px",fontSize:11,fontWeight:700,boxShadow:"0 2px 10px rgba(0,0,0,.2)",display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:"white",animation:"livePulse 1s infinite"}}/>
                Replay en cours...
              </div>
            )}

            {/* Sélecteur vue */}
            <div style={{position:"absolute",bottom:40,left:12,zIndex:20,background:"white",borderRadius:10,padding:"8px",boxShadow:"0 2px 10px rgba(0,0,0,.12)"}}>
              <div style={{fontSize:8,fontWeight:700,color:"#5f6368",marginBottom:5,textTransform:"uppercase",letterSpacing:".5px"}}>Vue carte</div>
              {LAYERS.map(l=>(
                <button key={l.id} onClick={()=>changeLayer(l.id)}
                  style={{display:"block",width:"100%",padding:"5px 9px",marginBottom:2,borderRadius:6,border:`1px solid ${activeLayer===l.id?"#1a73e8":"#e8eaed"}`,background:activeLayer===l.id?"#e8f0fe":"white",color:activeLayer===l.id?"#1a73e8":"#5f6368",fontSize:10,cursor:"pointer",fontWeight:activeLayer===l.id?700:400,textAlign:"left",fontFamily:"inherit"}}>
                  {l.label}
                </button>
              ))}
            </div>

            {/* Légende */}
            <div style={{position:"absolute",bottom:40,right:panelOpen?292:52,zIndex:20,background:"white",borderRadius:10,padding:"8px 12px",boxShadow:"0 2px 10px rgba(0,0,0,.12)"}}>
              <div style={{fontSize:8,fontWeight:700,color:"#5f6368",marginBottom:5,textTransform:"uppercase",letterSpacing:".5px"}}>Sites</div>
              {Object.entries(STATUS_SITES).map(([k,v])=>(
                <div key={k} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,fontSize:10,color:"#3c4043"}}>
                  <div style={{width:8,height:8,borderRadius:2,background:v.color,flexShrink:0}}/>{v.label}
                </div>
              ))}
              <div style={{height:1,background:"#e8eaed",margin:"5px 0"}}/>
              <div style={{fontSize:8,fontWeight:700,color:"#5f6368",marginBottom:5,textTransform:"uppercase",letterSpacing:".5px"}}>Techniciens</div>
              {Object.entries(STATUS_TECH).map(([k,v])=>(
                <div key={k} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,fontSize:10,color:"#3c4043"}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:v.color,flexShrink:0}}/>{v.label}
                </div>
              ))}
              <div style={{height:1,background:"#e8eaed",margin:"5px 0"}}/>
              <div style={{display:"flex",alignItems:"center",gap:6,fontSize:10,color:"#3c4043"}}>
                <div style={{width:14,height:3,background:"#1a73e8",borderRadius:1,flexShrink:0}}/>Itinéraire GPS
              </div>
              {showHeatmap&&<div style={{display:"flex",alignItems:"center",gap:6,fontSize:10,color:"#3c4043",marginTop:3}}>
                <div style={{width:14,height:6,background:"linear-gradient(90deg,#0f9d58,#f29900,#ea4335)",borderRadius:1,flexShrink:0}}/>Heatmap
              </div>}
            </div>
          </>
        )}

        {/* ===== PANEL DROIT SLIDE-IN ===== */}
        <div style={{
          position:"absolute",top:0,right:0,bottom:0,
          width:panelOpen?280:0,
          background:"white",
          boxShadow:panelOpen?"-4px 0 20px rgba(0,0,0,.12)":"none",
          transition:"width .25s ease",
          overflow:"hidden",
          zIndex:30,
          display:"flex",flexDirection:"column",
        }}>
          {panelOpen&&(
            <>
              {/* SITE */}
              {selected&&(()=>{
                const cfg=STATUS_SITES[selected.status]||STATUS_SITES.planifie;
                const techSite=techniciens.find(t=>t.site===selected.code);
                return(<>
                  <div style={{padding:"14px",background:`linear-gradient(135deg,#fff,${cfg.bg})`,borderBottom:"1px solid #e8eaed",flexShrink:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        <div style={{fontSize:15,fontWeight:800,color:"#202124"}}>{selected.code}</div>
                        <div style={{fontSize:11,color:"#5f6368",marginTop:1}}>{selected.name}</div>
                        <span style={{display:"inline-block",marginTop:5,fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:8,background:cfg.bg,color:cfg.color}}>{cfg.label}</span>
                      </div>
                      <button onClick={closePanel} style={{width:24,height:24,borderRadius:"50%",background:"#f1f3f4",border:"none",color:"#5f6368",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                    </div>
                  </div>
                  <div style={{flex:1,overflowY:"auto",padding:14}}>
                    <div style={{marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#5f6368",marginBottom:5}}>
                        <span>Progression</span><span style={{fontWeight:700,color:cfg.color}}>{selected.progression}%</span>
                      </div>
                      <div style={{height:8,background:"#e8eaed",borderRadius:4,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${selected.progression}%`,background:cfg.color,borderRadius:4}}/>
                      </div>
                    </div>
                    {[["Type réseau",selected.type],["Client",selected.client],["Projet",selected.projet],["Budget",`${selected.budget}M FCFA`],["GPS",`${selected.lat.toFixed(5)}°N, ${selected.lng.toFixed(5)}°E`]].map(([l,v])=>(
                      <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f1f3f4"}}>
                        <span style={{fontSize:11,color:"#5f6368"}}>{l}</span>
                        <span style={{fontSize:11,fontWeight:600,color:"#202124",textAlign:"right",maxWidth:150}}>{v}</span>
                      </div>
                    ))}
                    {techSite?(
                      <div style={{marginTop:12,padding:12,borderRadius:10,background:"#f8f9fa",border:"1px solid #e8eaed"}}>
                        <div style={{fontSize:10,fontWeight:700,color:"#5f6368",marginBottom:8,textTransform:"uppercase",letterSpacing:".4px"}}>Technicien sur site</div>
                        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
                          <div style={{width:40,height:40,borderRadius:"50%",overflow:"hidden",border:`2.5px solid ${techSite.color}`,flexShrink:0}}>
                            {PHOTOS[techSite.id]?<img src={PHOTOS[techSite.id]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{width:"100%",height:"100%",background:techSite.color}}/>}
                          </div>
                          <div>
                            <div style={{fontSize:12,fontWeight:700,color:"#202124"}}>{techSite.nom}</div>
                            <div style={{fontSize:10,color:STATUS_TECH[techSite.status]?.color,fontWeight:600}}>{STATUS_TECH[techSite.status]?.label}</div>
                            <div style={{fontSize:9,color:"#5f6368",marginTop:1}}>🔋{techSite.battery}% · 📶{techSite.signal}/5</div>
                          </div>
                        </div>
                        {techSite.rapport&&<div style={{fontSize:10,color:"#5f6368",background:"#e6f4ea",padding:"6px 9px",borderRadius:6,lineHeight:1.5,marginBottom:8}}>📋 {techSite.rapport}</div>}
                        <div style={{display:"flex",gap:6}}>
                          <button onClick={()=>window.open(`tel:${techSite.phone}`)} style={{flex:1,padding:"7px",borderRadius:7,border:"none",background:"#1a73e8",color:"white",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Appeler</button>
                          <button onClick={()=>startReplay(techSite)} style={{flex:1,padding:"7px",borderRadius:7,border:"1px solid #e8eaed",background:"white",color:"#5f6368",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Replay</button>
                        </div>
                      </div>
                    ):(
                      <div style={{marginTop:12,padding:12,borderRadius:10,background:"#fce8e6",border:"1px solid #f5c6c2"}}>
                        <div style={{fontSize:11,color:"#c5221f",marginBottom:8,fontWeight:500}}>⚠ Aucun technicien assigné</div>
                        <button onClick={()=>{setDispatchSite(selected);setShowDispatch(true);}} style={{width:"100%",padding:"7px",borderRadius:7,border:"none",background:"#1a73e8",color:"white",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>➤ Dispatcher un technicien</button>
                      </div>
                    )}
                  </div>
                </>);
              })()}

              {/* TECHNICIEN */}
              {selectedTech&&!selected&&(()=>{
                const st=STATUS_TECH[selectedTech.status]||STATUS_TECH.disponible;
                const siteTech=SITES.find(s=>s.code===selectedTech.site);
                return(<>
                  <div style={{padding:"14px",background:`linear-gradient(135deg,${selectedTech.color}08,${selectedTech.color}18)`,borderBottom:"1px solid #e8eaed",flexShrink:0}}>
                    <div style={{display:"flex",gap:12,alignItems:"center"}}>
                      <div style={{width:52,height:52,borderRadius:"50%",overflow:"hidden",border:`3px solid ${selectedTech.color}`,boxShadow:`0 0 0 2px ${selectedTech.color}30`,flexShrink:0}}>
                        {PHOTOS[selectedTech.id]?<img src={PHOTOS[selectedTech.id]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{width:"100%",height:"100%",background:selectedTech.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:16,fontWeight:700}}>{selectedTech.avatar}</div>}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:800,color:"#202124"}}>{selectedTech.nom}</div>
                        <div style={{fontSize:10,color:"#5f6368",marginTop:1}}>{selectedTech.specialite}</div>
                        <span style={{display:"inline-block",marginTop:4,fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:8,background:st.bg,color:st.color}}>{st.label}</span>
                      </div>
                      <button onClick={closePanel} style={{width:24,height:24,borderRadius:"50%",background:"rgba(0,0,0,.06)",border:"none",color:"#5f6368",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",alignSelf:"flex-start",flexShrink:0}}>✕</button>
                    </div>
                  </div>
                  <div style={{flex:1,overflowY:"auto",padding:14}}>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginBottom:14}}>
                      {[{l:"Batterie",v:`${selectedTech.battery}%`,c:selectedTech.battery>50?"#0f9d58":selectedTech.battery>20?"#f29900":"#ea4335"},{l:"Signal",v:`${selectedTech.signal}/5`,c:"#1a73e8"},{l:"Tâches",v:selectedTech.taches,c:"#7c3aed"}].map(m=>(
                        <div key={m.l} style={{background:"#f8f9fa",borderRadius:8,padding:"9px 6px",textAlign:"center",border:"1px solid #e8eaed"}}>
                          <div style={{fontSize:16,fontWeight:700,color:m.c,lineHeight:1.1}}>{m.v}</div>
                          <div style={{fontSize:8,color:"#5f6368",textTransform:"uppercase",letterSpacing:".3px",marginTop:3}}>{m.l}</div>
                        </div>
                      ))}
                    </div>
                    {[["Matricule",selectedTech.matricule],["Téléphone",selectedTech.phone],["Site actuel",selectedTech.site],["Début mission",selectedTech.heureDebut],["GPS mis à jour",selectedTech.lastUpdate]].map(([l,v])=>(
                      <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f1f3f4"}}>
                        <span style={{fontSize:11,color:"#5f6368"}}>{l}</span>
                        <span style={{fontSize:11,fontWeight:600,color:"#202124",textAlign:"right",maxWidth:155}}>{v}</span>
                      </div>
                    ))}
                    {selectedTech.rapport&&(
                      <div style={{marginTop:12,padding:"8px 10px",background:"#e6f4ea",borderRadius:8,borderLeft:"3px solid #0f9d58"}}>
                        <div style={{fontSize:8,fontWeight:700,color:"#137333",marginBottom:4,textTransform:"uppercase",letterSpacing:".4px"}}>Dernier rapport terrain</div>
                        <div style={{fontSize:11,color:"#202124",lineHeight:1.6}}>{selectedTech.rapport}</div>
                      </div>
                    )}
                    {routeInfo&&(
                      <div style={{marginTop:12,padding:"8px 10px",background:"#e8f0fe",borderRadius:8}}>
                        <div style={{fontSize:8,fontWeight:700,color:"#1a73e8",marginBottom:7,textTransform:"uppercase",letterSpacing:".4px"}}>Itinéraire GPS calculé</div>
                        <div style={{display:"flex",justifyContent:"space-around"}}>
                          <div style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,color:"#1a73e8"}}>{routeInfo.distance} km</div><div style={{fontSize:8,color:"#5f6368"}}>Distance</div></div>
                          <div style={{width:1,background:"#c9d7f8"}}/>
                          <div style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,color:"#0f9d58"}}>{routeInfo.duration} min</div><div style={{fontSize:8,color:"#5f6368"}}>Durée est.</div></div>
                        </div>
                      </div>
                    )}
                    {siteTech&&(
                      <div style={{marginTop:12,padding:10,borderRadius:8,background:"#f8f9fa",border:"1px solid #e8eaed"}}>
                        <div style={{fontSize:10,fontWeight:700,color:"#5f6368",marginBottom:6,textTransform:"uppercase"}}>Site assigné</div>
                        <div style={{fontSize:11,fontWeight:600,color:STATUS_SITES[siteTech.status]?.color||"#1a73e8"}}>{siteTech.code} · {siteTech.name}</div>
                        <div style={{fontSize:10,color:"#5f6368",marginTop:2}}>{siteTech.client} · {siteTech.progression}%</div>
                      </div>
                    )}
                  </div>
                  <div style={{padding:"10px 12px",borderTop:"1px solid #e8eaed",display:"flex",gap:5,flexShrink:0,flexWrap:"wrap"}}>
                    <button onClick={()=>window.open(`tel:${selectedTech.phone}`)} style={{flex:1,padding:"8px",borderRadius:7,border:"none",background:"#1a73e8",color:"white",cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"inherit"}}>Appeler</button>
                    {selectedTech.siteLat&&(
                      <button onClick={()=>calculateRoute(mapInstanceRef.current,selectedTech.lat,selectedTech.lng,selectedTech.siteLat,selectedTech.siteLng)}
                        style={{flex:1,padding:"8px",borderRadius:7,border:"1px solid #1a73e8",background:"white",color:"#1a73e8",cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"inherit"}}>
                        🗺 Trajet GPS
                      </button>
                    )}
                    <button onClick={()=>startReplay(selectedTech)}
                      style={{flex:1,padding:"8px",borderRadius:7,border:"1px solid #e8eaed",background:"white",color:"#5f6368",cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"inherit"}}>
                      ⏮ Replay
                    </button>
                    {selectedTech.status==="disponible"&&(
                      <button onClick={()=>{setDispatchTech(selectedTech);setShowDispatch(true);}}
                        style={{flex:1,padding:"8px",borderRadius:7,border:"none",background:"#0f9d58",color:"white",cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"inherit"}}>
                        ➤ Dispatch
                      </button>
                    )}
                  </div>
                </>);
              })()}
            </>
          )}
        </div>
      </div>

      {/* ===== MODAL DISPATCH ===== */}
      {showDispatch&&(
        <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div onClick={()=>{setShowDispatch(false);setDispatchTech(null);setDispatchSite(null);}} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.4)",backdropFilter:"blur(4px)"}}/>
          <div style={{position:"relative",background:"white",borderRadius:14,width:"100%",maxWidth:480,maxHeight:"90vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
            <div style={{padding:"14px 18px",background:"linear-gradient(135deg,#1a73e8,#1558b0)",borderRadius:"14px 14px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:"white"}}>🤖 Dispatch IA — Recommandations</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,.7)",marginTop:2}}>Score IA: distance · batterie · signal · compétence · disponibilité</div>
              </div>
              <button onClick={()=>{setShowDispatch(false);setDispatchTech(null);setDispatchSite(null);setIaRecommandations([]);}} style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,.15)",border:"none",color:"white",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            <div style={{padding:"16px 18px"}}>
              {/* IA: choisir le site en premier pour avoir les recommandations */}
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:700,color:"#5f6368",marginBottom:8,textTransform:"uppercase",letterSpacing:".5px"}}>1. Site de destination</div>
                {SITES.filter(s=>!["termine","livre"].includes(s.status)).map(s=>{
                  const cfg=STATUS_SITES[s.status];
                  return(
                    <div key={s.code} onClick={()=>{
                      setDispatchSite(s);
                      const recs=getIARecommandations(s,techniciens);
                      setIaRecommandations(recs);
                      if(recs.length>0) setDispatchTech(recs[0].tech);
                    }}
                      style={{display:"flex",alignItems:"center",gap:10,padding:"10px",borderRadius:9,border:`2px solid ${dispatchSite?.code===s.code?cfg.color:"#e8eaed"}`,cursor:"pointer",background:dispatchSite?.code===s.code?`${cfg.color}08`:"white",marginBottom:6,transition:"all .12s"}}>
                      <div style={{width:36,height:36,borderRadius:8,background:cfg.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:10,flexShrink:0}}>
                        {s.type.includes("5G")?"5G":s.type.includes("4G")?"4G":"3G"}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:600,color:"#202124"}}>{s.code} · {s.name}</div>
                        <div style={{fontSize:10,color:"#5f6368"}}>{s.client} · {s.progression}%</div>
                      </div>
                      <span style={{fontSize:9,fontWeight:600,padding:"2px 7px",borderRadius:8,background:cfg.bg,color:cfg.color}}>{cfg.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Recommandations IA */}
              {iaRecommandations.length>0&&(
                <div style={{marginBottom:14,padding:12,background:"#e8f0fe",borderRadius:10,border:"1px solid #d2e3fc"}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#1a73e8",marginBottom:8}}>🤖 Recommandations IA pour {dispatchSite?.code}</div>
                  {iaRecommandations.map((rec,i)=>(
                    <div key={rec.tech.id} onClick={()=>setDispatchTech(rec.tech)}
                      style={{display:"flex",gap:10,alignItems:"center",padding:"8px 10px",borderRadius:8,border:`2px solid ${dispatchTech?.id===rec.tech.id?rec.tech.color:"rgba(26,115,232,.2)"}`,background:dispatchTech?.id===rec.tech.id?`${rec.tech.color}08`:"white",marginBottom:6,cursor:"pointer",transition:"all .12s"}}>
                      {i===0&&<div style={{position:"absolute",marginLeft:-8,marginTop:-8,background:"#0f9d58",color:"white",fontSize:8,fontWeight:700,padding:"1px 5px",borderRadius:5}}>MEILLEUR</div>}
                      <div style={{width:34,height:34,borderRadius:"50%",overflow:"hidden",border:`2px solid ${rec.tech.color}`,flexShrink:0}}>
                        {PHOTOS[rec.tech.id]?<img src={PHOTOS[rec.tech.id]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{width:"100%",height:"100%",background:rec.tech.color}}/>}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:11,fontWeight:700,color:"#202124"}}>{rec.tech.nom}</div>
                        <div style={{fontSize:9,color:"#5f6368"}}>{rec.raison}</div>
                        <div style={{fontSize:9,color:"#5f6368",marginTop:1}}>ETA: ~{rec.etaMin} min</div>
                      </div>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontSize:16,fontWeight:800,color:rec.score>60?"#0f9d58":rec.score>40?"#f29900":"#ea4335"}}>{rec.score}</div>
                        <div style={{fontSize:7,color:"#5f6368",textTransform:"uppercase"}}>Score IA</div>
                        <div style={{fontSize:7,color:"#5f6368"}}>/100</div>
                      </div>
                    </div>
                  ))}
                  {/* Détail score */}
                  {dispatchTech&&iaRecommandations.find(r=>r.tech.id===dispatchTech.id)&&(()=>{
                    const rec=iaRecommandations.find(r=>r.tech.id===dispatchTech.id);
                    return(
                      <div style={{padding:"8px 10px",background:"white",borderRadius:7,border:"1px solid #d2e3fc",marginTop:6}}>
                        <div style={{fontSize:9,fontWeight:700,color:"#5f6368",marginBottom:5}}>DÉTAIL DU SCORE</div>
                        {[["Distance",rec.details.distance,40,"km"],["Batterie",rec.details.battery,25,"%"],["Signal",rec.details.signal,15,"/5"],["Disponibilité",rec.details.disponibilite,20,""],["Compétence",rec.details.competence,10,""]].map(([l,v,max,u])=>(
                          <div key={l} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                            <span style={{fontSize:9,color:"#5f6368",width:70}}>{l}</span>
                            <div style={{flex:1,height:4,background:"#e8eaed",borderRadius:2,overflow:"hidden"}}>
                              <div style={{height:"100%",width:`${(v/max)*100}%`,background:"#1a73e8",borderRadius:2}}/>
                            </div>
                            <span style={{fontSize:9,fontWeight:600,color:"#1a73e8",minWidth:24}}>{v}/{max}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:700,color:"#5f6368",marginBottom:8,textTransform:"uppercase",letterSpacing:".5px"}}>2. Ou choisir manuellement</div>
                {techniciens.filter(t=>t.status==="disponible"||t.status==="en_deplacement").map(t=>(
                  <div key={t.id} onClick={()=>setDispatchTech(t)}
                    style={{display:"flex",alignItems:"center",gap:10,padding:"10px",borderRadius:9,border:`2px solid ${dispatchTech?.id===t.id?t.color:"#e8eaed"}`,cursor:"pointer",background:dispatchTech?.id===t.id?`${t.color}08`:"white",marginBottom:6,transition:"all .12s"}}>
                    <div style={{width:36,height:36,borderRadius:"50%",overflow:"hidden",border:`2px solid ${t.color}`,flexShrink:0}}>
                      {PHOTOS[t.id]?<img src={PHOTOS[t.id]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{width:"100%",height:"100%",background:t.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:11}}>{t.avatar}</div>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#202124"}}>{t.nom}</div>
                      <div style={{fontSize:10,color:"#5f6368"}}>{t.specialite} · 🔋{t.battery}%</div>
                    </div>
                    <span style={{fontSize:9,fontWeight:600,padding:"2px 7px",borderRadius:8,background:STATUS_TECH[t.status]?.bg,color:STATUS_TECH[t.status]?.color}}>{STATUS_TECH[t.status]?.label}</span>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{setShowDispatch(false);setDispatchTech(null);setDispatchSite(null);}} style={{flex:1,padding:"10px",borderRadius:8,border:"1px solid #e8eaed",background:"white",color:"#5f6368",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Annuler</button>
                <button onClick={()=>{doDispatch();}} disabled={!dispatchTech||!dispatchSite}
                  style={{flex:2,padding:"10px",borderRadius:8,border:"none",background:dispatchTech&&dispatchSite?"#1a73e8":"#e8eaed",color:dispatchTech&&dispatchSite?"white":"#9aa0a6",fontSize:12,fontWeight:700,cursor:dispatchTech&&dispatchSite?"pointer":"not-allowed",fontFamily:"inherit"}}>
                  ✅ Valider le dispatch (PM) + GPS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JUMEAU NUMÉRIQUE ÉQUIPEMENT */}
      {showEquipTwin&&<EquipmentTwin site={showEquipTwin} iotData={iotData} onClose={()=>setShowEquipTwin(null)}/>}

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes livePulse{0%,100%{opacity:1}50%{opacity:.3}}
        .leaflet-popup-content-wrapper{border-radius:10px!important;box-shadow:0 4px 20px rgba(0,0,0,.15)!important;}
        .leaflet-popup-content{margin:12px 14px!important;}
        .leaflet-control-zoom{border:none!important;box-shadow:0 2px 8px rgba(0,0,0,.12)!important;}
        .leaflet-control-zoom a{background:white!important;color:#202124!important;border:none!important;border-bottom:1px solid #e8eaed!important;}
        .leaflet-control-zoom a:hover{background:#f1f3f4!important;}
        .marker-cluster{background:transparent!important;border:none!important;}
        .marker-cluster div{background:transparent!important;}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#e8eaed;border-radius:2px}
      `}</style>
    </div>
  );
}
