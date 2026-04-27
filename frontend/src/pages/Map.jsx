import { useEffect, useRef, useState, useCallback } from "react";

// ===== DONNÉES ENRICHIES =====
const SITES = [
  {code:"DLA-001",name:"Site Akwa Douala",lat:4.0511,lng:9.7085,status:"en_cours",type:"5G NR",progression:65,client:"MTN Cameroun",projet:"PROJ-2024-001",budget:180,techId:1},
  {code:"DLA-003",name:"Site Bonabéri",lat:4.0667,lng:9.6500,status:"en_retard",type:"4G LTE",progression:30,client:"Orange Cameroun",projet:"PROJ-2024-002",budget:85,techId:null},
  {code:"YDE-001",name:"Site Centre Yaoundé",lat:3.8480,lng:11.5021,status:"termine",type:"5G NR",progression:100,client:"MTN Cameroun",projet:"PROJ-2024-001",budget:95,techId:2},
  {code:"BFN-001",name:"Site Bafoussam",lat:5.4764,lng:10.4214,status:"planifie",type:"4G LTE",progression:0,client:"CAMTEL",projet:"PROJ-2024-006",budget:50,techId:null},
  {code:"GAR-001",name:"Site Garoua",lat:9.3019,lng:13.3920,status:"en_cours",type:"3G UMTS",progression:55,client:"Nexttel",projet:"PROJ-2024-004",budget:45,techId:4},
  {code:"KRI-001",name:"Site Kribi Port",lat:2.9395,lng:9.9087,status:"livre",type:"5G NR",progression:100,client:"MTN Cameroun",projet:"PROJ-2024-001",budget:0,techId:null},
  {code:"LIM-001",name:"Site Limbé",lat:4.0167,lng:9.2000,status:"en_cours",type:"4G LTE",progression:75,client:"Orange Cameroun",projet:"PROJ-2024-002",budget:40,techId:3},
  {code:"MAR-001",name:"Site Maroua",lat:10.5900,lng:14.3157,status:"planifie",type:"4G LTE",progression:0,client:"CAMTEL",projet:"PROJ-2024-006",budget:30,techId:null},
];

const TECHNICIENS_INIT = [
  {id:1,nom:"Thomas Ngono",lat:4.0600,lng:9.7200,status:"en_mission",site:"DLA-001",type:"5G NR",phone:"+237 677 100 001",avatar:"TN",color:"#2563EB",matricule:"CLN-EXT-001",specialite:"5G NR / 4G LTE",battery:78,signal:4,lastUpdate:"Il y a 2 min",taches:3,rapport:"Câblage RRU terminé. Test en cours.",heureDebut:"07:30",heureActuelle:"14:45"},
  {id:2,nom:"Jean Mbarga",lat:3.8600,lng:11.5100,status:"en_mission",site:"YDE-001",type:"5G NR",phone:"+237 677 100 002",avatar:"JM",color:"#7C3AED",matricule:"CLN-EXT-002",specialite:"Survey & Optimisation RF",battery:92,signal:5,lastUpdate:"Il y a 1 min",taches:2,rapport:"Installation antenne BBU terminée.",heureDebut:"08:00",heureActuelle:"14:45"},
  {id:3,nom:"Samuel Djomo",lat:4.0300,lng:9.6900,status:"en_deplacement",site:"LIM-001",type:"4G LTE",phone:"+237 677 100 003",avatar:"SD",color:"#059669",matricule:"CLN-EXT-003",specialite:"3G UMTS / 4G LTE",battery:45,signal:3,lastUpdate:"Il y a 5 min",taches:1,rapport:"En route vers site Limbé.",heureDebut:"09:15",heureActuelle:"14:45"},
  {id:4,nom:"Ali Moussa",lat:9.2800,lng:13.4100,status:"en_mission",site:"GAR-001",type:"3G UMTS",phone:"+237 677 100 004",avatar:"AM",color:"#D97706",matricule:"CLN-EXT-004",specialite:"Supervision & HSE",battery:63,signal:2,lastUpdate:"Il y a 8 min",taches:4,rapport:"Vérification sécurité pylône terminée.",heureDebut:"06:45",heureActuelle:"14:45"},
  {id:5,nom:"René Talla",lat:4.0400,lng:9.6800,status:"disponible",site:"—",type:"—",phone:"+237 677 100 005",avatar:"RT",color:"#DB2777",matricule:"CLN-EXT-005",specialite:"Fibre optique FTTH",battery:100,signal:5,lastUpdate:"En ligne",taches:0,rapport:"",heureDebut:"—",heureActuelle:"14:45"},
];

const MISSIONS_ACTIVES = [
  {id:"M001",techId:1,siteCode:"DLA-001",titre:"Installation RRU 5G",debut:"08:00",fin_prevue:"17:00",avancement:65,priorite:"haute",projet:"PROJ-2024-001"},
  {id:"M002",techId:2,siteCode:"YDE-001",titre:"Config BBU Yaoundé",debut:"08:30",fin_prevue:"16:00",avancement:82,priorite:"normale",projet:"PROJ-2024-001"},
  {id:"M003",techId:3,siteCode:"LIM-001",titre:"Câblage fibre Limbé",debut:"09:30",fin_prevue:"18:00",avancement:22,priorite:"normale",projet:"PROJ-2024-002"},
  {id:"M004",techId:4,siteCode:"GAR-001",titre:"Maintenance préventive",debut:"07:00",fin_prevue:"15:00",avancement:55,priorite:"haute",projet:"PROJ-2024-004"},
];

const ALERTES = [
  {id:"A001",type:"retard",techId:3,msg:"Samuel Djomo en retard sur DLA-003 — 3h de décalage",time:"14:23",color:"#DC2626"},
  {id:"A002",type:"batterie",techId:3,msg:"Batterie faible (45%) — Samuel Djomo",time:"14:30",color:"#D97706"},
  {id:"A003",type:"signal",techId:4,msg:"Signal faible zone Garoua — Ali Moussa",time:"14:38",color:"#D97706"},
  {id:"A004",type:"mission",techId:5,msg:"René Talla disponible — Affecter à DLA-003",time:"14:40",color:"#059669"},
];

const STATUS_SITES = {
  planifie: {color:"#7C3AED",label:"Planifié"},
  en_cours: {color:"#2563EB",label:"En cours"},
  termine:  {color:"#059669",label:"Terminé"},
  livre:    {color:"#059669",label:"Livré"},
  en_retard:{color:"#DC2626",label:"En retard"},
};

const STATUS_TECH = {
  en_mission:    {color:"#2563EB",label:"En mission",    bg:"#EFF6FF"},
  en_deplacement:{color:"#D97706",label:"En déplacement",bg:"#FEFCE8"},
  disponible:    {color:"#059669",label:"Disponible",    bg:"#F0FDF4"},
  hors_ligne:    {color:"#94A3B8",label:"Hors ligne",    bg:"#F8FAFC"},
  pause:         {color:"#F59E0B",label:"En pause",      bg:"#FEF3C7"},
};

const LAYERS = [
  {id:"osm",       label:"Standard",  url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"},
  {id:"satellite", label:"Satellite", url:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"},
  {id:"terrain",   label:"Terrain",   url:"https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"},
];

// Simulation trajectoires
const TRAJECTOIRES = {
  3: [[4.0511,9.7085],[4.0480,9.7050],[4.0420,9.7000],[4.0380,9.6950],[4.0300,9.6900]],
};

export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef({});
  const techMarkersRef = useRef({});
  const trajLayersRef = useRef({});
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedTech, setSelectedTech] = useState(null);
  const [filter, setFilter] = useState("tous");
  const [showTechs, setShowTechs] = useState(true);
  const [showTraj, setShowTraj] = useState(true);
  const [activeLayer, setActiveLayer] = useState("satellite");
  const [searchQ, setSearchQ] = useState("");
  const [techniciens, setTechniciens] = useState(TECHNICIENS_INIT);
  const [activeTab, setActiveTab] = useState("sites"); // sites | techs | missions | alertes
  const [showDispatch, setShowDispatch] = useState(false);
  const [dispatchTech, setDispatchTech] = useState(null);
  const [dispatchSite, setDispatchSite] = useState(null);
  const [liveMode, setLiveMode] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Simulation GPS live
  useEffect(() => {
    if(!liveMode) return;
    const interval = setInterval(() => {
      setTechniciens(prev => prev.map(t => {
        if(t.status === "en_deplacement") {
          const traj = TRAJECTOIRES[t.id];
          if(traj) {
            const idx = Math.floor(Date.now()/3000) % traj.length;
            return {...t, lat:traj[idx][0]+Math.random()*0.001, lng:traj[idx][1]+Math.random()*0.001, lastUpdate:"À l'instant"};
          }
        }
        if(t.status === "en_mission") {
          return {...t, lat:t.lat+((Math.random()-0.5)*0.0002), lng:t.lng+((Math.random()-0.5)*0.0002), lastUpdate:"À l'instant"};
        }
        return t;
      }));
      setLastRefresh(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, [liveMode]);

  // Mise à jour marqueurs GPS
  useEffect(() => {
    if(!mapInstanceRef.current || !window.L) return;
    techniciens.forEach(tech => {
      const marker = techMarkersRef.current[tech.id];
      if(marker) marker.setLatLng([tech.lat, tech.lng]);
    });
  }, [techniciens]);

  // Leaflet init
  useEffect(() => {
    if(!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css"; link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if(window.L) { setLoaded(true); return; }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
    return () => {
      if(mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if(!loaded || !mapRef.current || mapInstanceRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, {center:[5.5,12.0], zoom:6, zoomControl:false});
    L.control.zoom({position:"bottomright"}).addTo(map);

    tileLayerRef.current = L.tileLayer(LAYERS.find(l=>l.id==="satellite").url, {attribution:"© Esri", maxZoom:19}).addTo(map);

    // Sites
    SITES.forEach(site => {
      const cfg = STATUS_SITES[site.status] || STATUS_SITES.planifie;
      const icon = L.divIcon({
        html:`<div style="position:relative;width:50px;height:58px;">
          <div style="width:50px;height:50px;border-radius:12px;background:${cfg.color};border:3px solid white;box-shadow:0 4px 16px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;flex-direction:column;cursor:pointer;">
            <span style="color:white;font-weight:900;font-size:11px;">${site.type.includes("5G")?"5G":site.type.includes("4G")?"4G":"3G"}</span>
            <span style="color:rgba(255,255,255,0.8);font-size:8px;">${site.code}</span>
            ${site.status==="en_retard"?`<div style="position:absolute;top:-4px;right:-4px;width:14px;height:14px;border-radius:50%;background:#DC2626;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:8px;color:white">!</div>`:""}
          </div>
          <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:10px solid ${cfg.color};"></div>
        </div>`,
        className:"", iconSize:[50,58], iconAnchor:[25,58], popupAnchor:[0,-62]
      });

      const marker = L.marker([site.lat, site.lng], {icon})
        .addTo(map)
        .bindPopup(`
          <div style="font-family:'Segoe UI',sans-serif;min-width:240px;padding:4px">
            <div style="font-weight:800;font-size:14px;color:#0f172a;margin-bottom:6px">${site.code} · ${site.name}</div>
            <span style="padding:3px 9px;border-radius:10px;font-size:11px;font-weight:600;background:${cfg.color}20;color:${cfg.color}">${cfg.label}</span>
            <div style="margin-top:8px;font-size:12px;color:#64748b">📡 ${site.type} · 🏢 ${site.client}</div>
            <div style="background:#f1f5f9;border-radius:4px;height:6px;overflow:hidden;margin-top:8px">
              <div style="width:${site.progression}%;height:100%;background:${cfg.color};border-radius:4px"></div>
            </div>
            <div style="font-size:11px;color:#64748b;text-align:right;margin-top:3px">${site.progression}%</div>
          </div>
        `, {maxWidth:260});

      marker.on("click", () => { setSelected(site); setSelectedTech(null); });
      markersRef.current[site.code] = marker;
    });

    // Techniciens
    TECHNICIENS_INIT.forEach(tech => {
      const st = STATUS_TECH[tech.status] || STATUS_TECH.disponible;
      const icon = L.divIcon({
        html:`<div style="position:relative;width:42px;height:50px;">
          <div style="width:42px;height:42px;border-radius:50%;background:${tech.color};border:3px solid white;box-shadow:0 4px 16px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;">
            <span style="color:white;font-weight:900;font-size:12px">${tech.avatar}</span>
            <div style="position:absolute;top:-3px;right:-3px;width:13px;height:13px;border-radius:50%;background:${st.color};border:2px solid white;animation:${tech.status==="en_mission"?"pulseTech 2s infinite":"none"}"></div>
          </div>
          <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:9px solid ${tech.color}"></div>
        </div>`,
        className:"", iconSize:[42,50], iconAnchor:[21,50], popupAnchor:[0,-54]
      });

      const marker = L.marker([tech.lat, tech.lng], {icon})
        .addTo(map)
        .bindPopup(`
          <div style="font-family:'Segoe UI',sans-serif;min-width:220px;padding:4px">
            <div style="font-weight:800;font-size:14px;color:#0f172a;margin-bottom:6px">👷 ${tech.nom}</div>
            <span style="padding:3px 9px;border-radius:10px;font-size:11px;font-weight:600;background:${st.bg};color:${st.color}">${st.label}</span>
            <div style="margin-top:8px;font-size:12px;color:#64748b">📡 Site: <strong>${tech.site}</strong></div>
            <div style="font-size:12px;color:#64748b">📞 ${tech.phone}</div>
            <div style="font-size:12px;color:#64748b;margin-top:4px">🔋 ${tech.battery}% · 📶 ${tech.signal}/5</div>
          </div>
        `, {maxWidth:240});

      marker.on("click", () => { setSelectedTech(tech); setSelected(null); });
      techMarkersRef.current[tech.id] = marker;
    });

    // Trajectoires
    Object.entries(TRAJECTOIRES).forEach(([techId, points]) => {
      const line = L.polyline(points, {color:"#F59E0B", weight:3, opacity:0.7, dashArray:"6,6"}).addTo(map);
      const arrowHead = L.circleMarker(points[points.length-1], {radius:5, color:"#F59E0B", fillColor:"#F59E0B", fillOpacity:1}).addTo(map);
      trajLayersRef.current[techId] = [line, arrowHead];
    });

    mapInstanceRef.current = map;
  }, [loaded]);

  // Toggle techs
  useEffect(() => {
    if(!mapInstanceRef.current || !window.L) return;
    Object.values(techMarkersRef.current).forEach(m => {
      if(showTechs) mapInstanceRef.current.addLayer(m);
      else mapInstanceRef.current.removeLayer(m);
    });
  }, [showTechs]);

  // Toggle trajectoires
  useEffect(() => {
    if(!mapInstanceRef.current || !window.L) return;
    Object.values(trajLayersRef.current).forEach(layers => {
      layers.forEach(l => {
        if(showTraj) mapInstanceRef.current.addLayer(l);
        else mapInstanceRef.current.removeLayer(l);
      });
    });
  }, [showTraj]);

  const changeLayer = (layerId) => {
    if(!mapInstanceRef.current || !window.L) return;
    if(tileLayerRef.current) mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const layer = LAYERS.find(l=>l.id===layerId);
    tileLayerRef.current = window.L.tileLayer(layer.url, {attribution:"© OpenStreetMap/Esri", maxZoom:19}).addTo(mapInstanceRef.current);
    setActiveLayer(layerId);
  };

  const flyTo = (lat, lng, zoom=13) => mapInstanceRef.current?.setView([lat,lng], zoom, {animate:true});
  const openMaps = (lat, lng) => window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");

  const doDispatch = () => {
    if(!dispatchTech || !dispatchSite) return;
    setTechniciens(prev=>prev.map(t=>t.id===dispatchTech.id?{...t,status:"en_deplacement",site:dispatchSite.code}:t));
    setShowDispatch(false);
    alert(`✅ ${dispatchTech.nom} dispatché vers ${dispatchSite.code} — ${dispatchSite.name}`);
  };

  const filteredSites = SITES.filter(s => {
    const mf = filter==="tous"||s.status===filter;
    const mq = !searchQ||s.code.toLowerCase().includes(searchQ.toLowerCase())||s.name.toLowerCase().includes(searchQ.toLowerCase());
    return mf&&mq;
  });

  const techActifs = techniciens.filter(t=>t.status!=="hors_ligne");
  const enMission = techniciens.filter(t=>t.status==="en_mission");
  const disponibles = techniciens.filter(t=>t.status==="disponible");

  return (
    <div style={{display:"flex",height:"calc(100vh - 56px)",overflow:"hidden",fontFamily:"'Segoe UI',Arial,sans-serif"}}>

      {/* ===== PANEL GAUCHE ===== */}
      <div style={{width:320,background:"white",borderRight:"1px solid #E2E8F0",display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0,zIndex:10}}>

        {/* Header */}
        <div style={{padding:"14px 16px",background:"linear-gradient(135deg,#0F172A,#1E3A5F)",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div>
              <h2 style={{fontSize:15,fontWeight:800,color:"white",margin:"0 0 2px"}}>🛰 Digital Twin · Terrain</h2>
              <p style={{fontSize:11,color:"rgba(255,255,255,.55)",margin:0}}>Suivi temps réel · {lastRefresh.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
              <button onClick={()=>setLiveMode(!liveMode)} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 8px",borderRadius:20,border:"none",background:liveMode?"rgba(16,185,129,.2)":"rgba(255,255,255,.1)",color:liveMode?"#34D399":"rgba(255,255,255,.5)",fontSize:10,fontWeight:700,cursor:"pointer"}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:liveMode?"#34D399":"#94A3B8",animation:liveMode?"pulse 2s infinite":"none"}}/>
                {liveMode?"LIVE":"PAUSE"}
              </button>
            </div>
          </div>

          {/* Stats rapides */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
            {[{l:"Sites",v:SITES.length,c:"#60A5FA"},{l:"En mission",v:enMission.length,c:"#34D399"},{l:"Alertes",v:ALERTES.length,c:"#F87171"}].map(s=>(
              <div key={s.l} style={{background:"rgba(255,255,255,.08)",borderRadius:6,padding:"6px 8px",textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:800,color:s.c}}>{s.v}</div>
                <div style={{fontSize:9,color:"rgba(255,255,255,.45)"}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",borderBottom:"1px solid #E2E8F0",flexShrink:0}}>
          {[{id:"sites",l:"Sites"},{id:"techs",l:"Équipe"},{id:"missions",l:"Missions"},{id:"alertes",l:"Alertes",badge:ALERTES.length}].map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{flex:1,padding:"9px 4px",border:"none",borderBottom:`2px solid ${activeTab===t.id?"#2563EB":"transparent"}`,background:"white",color:activeTab===t.id?"#2563EB":"#64748B",fontSize:11,fontWeight:activeTab===t.id?700:400,cursor:"pointer",fontFamily:"inherit",position:"relative",transition:"all .12s"}}>
              {t.l}
              {t.badge&&<span style={{position:"absolute",top:4,right:4,width:14,height:14,borderRadius:"50%",background:"#DC2626",color:"white",fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{t.badge}</span>}
            </button>
          ))}
        </div>

        {/* Recherche */}
        <div style={{padding:"8px 12px",borderBottom:"1px solid #F1F5F9",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:6,padding:"6px 10px"}}>
            <span style={{fontSize:12}}>🔍</span>
            <input placeholder={activeTab==="sites"?"Rechercher site...":"Rechercher technicien..."} value={searchQ} onChange={e=>setSearchQ(e.target.value)}
              style={{border:"none",outline:"none",background:"transparent",fontSize:12,flex:1,fontFamily:"inherit",color:"#0F172A"}}/>
          </div>
        </div>

        {/* Contenu onglet */}
        <div style={{flex:1,overflowY:"auto"}}>

          {/* ONGLET SITES */}
          {activeTab==="sites"&&(
            <>
              {/* Filtres */}
              <div style={{padding:"8px 12px",borderBottom:"1px solid #F1F5F9",display:"flex",gap:4,flexWrap:"wrap"}}>
                {[{v:"tous",l:"Tous"},...Object.entries(STATUS_SITES).map(([k,v])=>({v:k,l:v.label,c:v.color}))].map(f=>(
                  <button key={f.v} onClick={()=>setFilter(f.v)}
                    style={{padding:"3px 8px",borderRadius:6,border:`1px solid ${filter===f.v?(f.c||"#2563EB"):"#E2E8F0"}`,background:filter===f.v?`${f.c||"#2563EB"}12`:"white",color:filter===f.v?(f.c||"#2563EB"):"#64748B",fontSize:10,cursor:"pointer",fontWeight:filter===f.v?700:400}}>
                    {f.l}
                  </button>
                ))}
              </div>

              {filteredSites.map(site=>{
                const cfg = STATUS_SITES[site.status]||STATUS_SITES.planifie;
                const techSite = techniciens.find(t=>t.site===site.code);
                return (
                  <div key={site.code} onClick={()=>{flyTo(site.lat,site.lng,14);setSelected(site);setSelectedTech(null);}}
                    style={{padding:"11px 14px",borderBottom:"1px solid #F8FAFC",cursor:"pointer",background:selected?.code===site.code?`${cfg.color}08`:"white",borderLeft:`3px solid ${selected?.code===site.code?cfg.color:"transparent"}`,transition:"all .12s"}}
                    onMouseEnter={e=>e.currentTarget.style.background=`${cfg.color}06`}
                    onMouseLeave={e=>e.currentTarget.style.background=selected?.code===site.code?`${cfg.color}08`:"white"}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:11,fontWeight:700,color:cfg.color}}>{site.code}</span>
                      <span style={{padding:"1px 7px",borderRadius:6,fontSize:9,fontWeight:700,background:`${cfg.color}15`,color:cfg.color}}>{cfg.label}</span>
                    </div>
                    <div style={{fontSize:12,fontWeight:600,color:"#1E293B",marginBottom:3}}>{site.name}</div>
                    <div style={{fontSize:10,color:"#94A3B8",marginBottom:5}}>📡 {site.type} · 🏢 {site.client}</div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{flex:1,background:"#F1F5F9",borderRadius:3,height:4,overflow:"hidden"}}>
                        <div style={{width:`${site.progression}%`,height:"100%",background:cfg.color,borderRadius:3}}/>
                      </div>
                      <span style={{fontSize:10,fontWeight:700,color:cfg.color,minWidth:28}}>{site.progression}%</span>
                    </div>
                    {techSite&&(
                      <div style={{marginTop:6,display:"flex",alignItems:"center",gap:6,padding:"4px 8px",borderRadius:6,background:`${techSite.color}10`,border:`1px solid ${techSite.color}20`}}>
                        <div style={{width:20,height:20,borderRadius:"50%",background:techSite.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:8,fontWeight:700}}>{techSite.avatar}</div>
                        <span style={{fontSize:10,color:"#475569",fontWeight:500}}>{techSite.nom} · <span style={{color:STATUS_TECH[techSite.status]?.color}}>{STATUS_TECH[techSite.status]?.label}</span></span>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* ONGLET ÉQUIPE */}
          {activeTab==="techs"&&(
            <>
              <div style={{padding:"8px 12px",borderBottom:"1px solid #F1F5F9",display:"flex",gap:8,alignItems:"center"}}>
                <button onClick={()=>setShowTechs(!showTechs)} style={{flex:1,padding:"5px",borderRadius:6,border:`1px solid ${showTechs?"#2563EB":"#E2E8F0"}`,background:showTechs?"#EFF6FF":"white",color:showTechs?"#2563EB":"#64748B",fontSize:11,cursor:"pointer",fontWeight:600,fontFamily:"inherit"}}>
                  {showTechs?"👁 Masquer sur carte":"👁 Afficher sur carte"}
                </button>
                <button onClick={()=>setShowTraj(!showTraj)} style={{flex:1,padding:"5px",borderRadius:6,border:`1px solid ${showTraj?"#D97706":"#E2E8F0"}`,background:showTraj?"#FEFCE8":"white",color:showTraj?"#D97706":"#64748B",fontSize:11,cursor:"pointer",fontWeight:600,fontFamily:"inherit"}}>
                  {showTraj?"📍 Masquer trajets":"📍 Afficher trajets"}
                </button>
              </div>

              {techniciens.filter(t=>!searchQ||t.nom.toLowerCase().includes(searchQ.toLowerCase())).map(tech=>{
                const st = STATUS_TECH[tech.status]||STATUS_TECH.disponible;
                return (
                  <div key={tech.id} onClick={()=>{flyTo(tech.lat,tech.lng,14);setSelectedTech(tech);setSelected(null);}}
                    style={{padding:"12px 14px",borderBottom:"1px solid #F8FAFC",cursor:"pointer",background:selectedTech?.id===tech.id?`${tech.color}08`:"white",transition:"all .12s"}}
                    onMouseEnter={e=>e.currentTarget.style.background=`${tech.color}06`}
                    onMouseLeave={e=>e.currentTarget.style.background=selectedTech?.id===tech.id?`${tech.color}08`:"white"}>
                    <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:8}}>
                      <div style={{position:"relative",flexShrink:0}}>
                        <div style={{width:38,height:38,borderRadius:10,background:tech.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:800,fontSize:12}}>{tech.avatar}</div>
                        <div style={{position:"absolute",top:-3,right:-3,width:12,height:12,borderRadius:"50%",background:st.color,border:"2px solid white"}}/>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:"#1E293B",marginBottom:1}}>{tech.nom}</div>
                        <div style={{fontSize:10,color:"#64748B"}}>{tech.specialite}</div>
                        <div style={{marginTop:4,display:"flex",gap:4}}>
                          <span style={{padding:"1px 7px",borderRadius:10,fontSize:10,fontWeight:600,background:st.bg,color:st.color}}>{st.label}</span>
                          {tech.site!=="—"&&<span style={{padding:"1px 7px",borderRadius:10,fontSize:10,fontWeight:600,background:"#F1F5F9",color:"#475569"}}>📡 {tech.site}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Métriques */}
                    <div style={{display:"flex",gap:8,marginBottom:8}}>
                      <div style={{flex:1,display:"flex",alignItems:"center",gap:4,background:"#F8FAFC",borderRadius:5,padding:"4px 6px"}}>
                        <span style={{fontSize:10}}>🔋</span>
                        <div style={{flex:1,background:"#E2E8F0",borderRadius:2,height:4,overflow:"hidden"}}>
                          <div style={{width:`${tech.battery}%`,height:"100%",background:tech.battery>50?"#10B981":tech.battery>20?"#F59E0B":"#EF4444",borderRadius:2}}/>
                        </div>
                        <span style={{fontSize:9,fontWeight:700,color:tech.battery>50?"#10B981":tech.battery>20?"#F59E0B":"#EF4444"}}>{tech.battery}%</span>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:2,background:"#F8FAFC",borderRadius:5,padding:"4px 6px"}}>
                        <span style={{fontSize:10}}>📶</span>
                        <span style={{fontSize:10,fontWeight:700,color:"#475569"}}>{tech.signal}/5</span>
                      </div>
                    </div>

                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:9,color:"#94A3B8"}}>⏱ {tech.lastUpdate}</span>
                      {tech.status==="disponible"&&(
                        <button onClick={e=>{e.stopPropagation();setDispatchTech(tech);setShowDispatch(true);}}
                          style={{padding:"4px 10px",borderRadius:6,border:"none",background:"#2563EB",color:"white",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                          ➤ Dispatcher
                        </button>
                      )}
                      {tech.status!=="disponible"&&(
                        <button onClick={e=>{e.stopPropagation();window.open(`tel:${tech.phone}`);}}
                          style={{padding:"4px 10px",borderRadius:6,border:"1px solid #E2E8F0",background:"white",color:"#475569",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                          📞 Appeler
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* ONGLET MISSIONS */}
          {activeTab==="missions"&&(
            <div>
              <div style={{padding:"10px 14px",borderBottom:"1px solid #F1F5F9",fontSize:11,color:"#64748B",fontWeight:600}}>
                {MISSIONS_ACTIVES.length} missions actives aujourd'hui
              </div>
              {MISSIONS_ACTIVES.map(m=>{
                const tech = techniciens.find(t=>t.id===m.techId);
                const site = SITES.find(s=>s.code===m.siteCode);
                return (
                  <div key={m.id} style={{padding:"12px 14px",borderBottom:"1px solid #F8FAFC"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <span style={{fontSize:12,fontWeight:700,color:"#1E293B"}}>{m.titre}</span>
                      <span style={{padding:"2px 7px",borderRadius:10,fontSize:9,fontWeight:700,background:m.priorite==="haute"?"#FEE2E2":"#F0FDF4",color:m.priorite==="haute"?"#DC2626":"#059669"}}>{m.priorite==="haute"?"🔴 Haute":"🟢 Normale"}</span>
                    </div>
                    {tech&&(
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                        <div style={{width:22,height:22,borderRadius:"50%",background:tech.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:8,fontWeight:700}}>{tech.avatar}</div>
                        <span style={{fontSize:11,color:"#475569"}}>{tech.nom}</span>
                        <span style={{fontSize:10,color:"#94A3B8"}}>→ {m.siteCode}</span>
                      </div>
                    )}
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                      <span style={{fontSize:10,color:"#94A3B8"}}>⏰ {m.debut} → {m.fin_prevue}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{flex:1,background:"#F1F5F9",borderRadius:3,height:6,overflow:"hidden"}}>
                        <div style={{width:`${m.avancement}%`,height:"100%",background:"#2563EB",borderRadius:3}}/>
                      </div>
                      <span style={{fontSize:10,fontWeight:700,color:"#2563EB"}}>{m.avancement}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ONGLET ALERTES */}
          {activeTab==="alertes"&&(
            <div>
              {ALERTES.map(a=>(
                <div key={a.id} style={{padding:"12px 14px",borderBottom:"1px solid #F8FAFC",borderLeft:`3px solid ${a.color}`,background:`${a.color}04`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                    <span style={{fontSize:11,fontWeight:700,color:a.color,textTransform:"uppercase",fontSize:9,letterSpacing:".4px"}}>{a.type}</span>
                    <span style={{fontSize:9,color:"#94A3B8"}}>{a.time}</span>
                  </div>
                  <div style={{fontSize:12,color:"#334155",lineHeight:1.5}}>{a.msg}</div>
                  <button style={{marginTop:6,padding:"3px 8px",borderRadius:4,border:`1px solid ${a.color}`,background:"white",color:a.color,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                    Traiter
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== CARTE ===== */}
      <div style={{flex:1,position:"relative"}}>
        <div ref={mapRef} style={{width:"100%",height:"100%"}}/>

        {!loaded&&(
          <div style={{position:"absolute",inset:0,background:"#0F172A",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
            <div style={{width:44,height:44,borderRadius:"50%",border:"3px solid #2563EB",borderTopColor:"transparent",animation:"spin 1s linear infinite"}}/>
            <div style={{color:"white",fontSize:13}}>Chargement de la carte satellite...</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}} @keyframes pulseTech{0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,.4)}70%{box-shadow:0 0 0 6px rgba(37,99,235,0)}}`}</style>
          </div>
        )}

        {loaded&&(
          <>
            {/* Contrôle fond carte */}
            <div style={{position:"absolute",top:12,left:12,zIndex:1000,background:"white",borderRadius:10,padding:10,boxShadow:"0 4px 16px rgba(0,0,0,.12)"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#64748B",marginBottom:6,textTransform:"uppercase",letterSpacing:".5px"}}>Fond de carte</div>
              {LAYERS.map(l=>(
                <button key={l.id} onClick={()=>changeLayer(l.id)}
                  style={{display:"block",width:"100%",padding:"5px 10px",marginBottom:3,borderRadius:6,border:`1px solid ${activeLayer===l.id?"#2563EB":"#E2E8F0"}`,background:activeLayer===l.id?"#2563EB":"white",color:activeLayer===l.id?"white":"#374151",fontSize:11,cursor:"pointer",fontWeight:activeLayer===l.id?600:400,textAlign:"left",fontFamily:"inherit"}}>
                  {l.label}
                </button>
              ))}
            </div>

            {/* Légende */}
            <div style={{position:"absolute",bottom:40,left:12,zIndex:1000,background:"rgba(15,23,42,.92)",borderRadius:10,padding:"10px 14px",backdropFilter:"blur(4px)"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#64748B",marginBottom:6,textTransform:"uppercase"}}>Sites réseau</div>
              {Object.entries(STATUS_SITES).map(([k,v])=>(
                <div key={k} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,fontSize:11,color:"#E2E8F0"}}>
                  <div style={{width:10,height:10,borderRadius:2,background:v.color}}/>{v.label}
                </div>
              ))}
              <div style={{height:1,background:"rgba(255,255,255,.1)",margin:"6px 0"}}/>
              <div style={{fontSize:10,fontWeight:700,color:"#64748B",marginBottom:4}}>Techniciens</div>
              {Object.entries(STATUS_TECH).map(([k,v])=>(
                <div key={k} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,fontSize:11,color:"#E2E8F0"}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:v.color}}/>{v.label}
                </div>
              ))}
              <div style={{height:1,background:"rgba(255,255,255,.1)",margin:"6px 0"}}/>
              <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"#FCD34D"}}>
                <div style={{width:16,height:2,background:"#F59E0B",borderTop:"2px dashed #F59E0B"}}/>Trajet en cours
              </div>
            </div>

            {/* Dispatch rapide depuis carte */}
            <div style={{position:"absolute",top:12,right:12,zIndex:1000,background:"white",borderRadius:10,padding:"8px 12px",boxShadow:"0 4px 16px rgba(0,0,0,.12)"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#64748B",marginBottom:6,textTransform:"uppercase",letterSpacing:".5px"}}>Actions rapides</div>
              <button onClick={()=>setShowDispatch(true)}
                style={{display:"flex",alignItems:"center",gap:6,width:"100%",padding:"7px 10px",borderRadius:6,border:"none",background:"#2563EB",color:"white",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:4}}>
                ➤ Dispatcher technicien
              </button>
              <button onClick={()=>setActiveTab("alertes")}
                style={{display:"flex",alignItems:"center",gap:6,width:"100%",padding:"7px 10px",borderRadius:6,border:"1px solid #E2E8F0",background:"white",color:"#475569",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                🔔 Alertes ({ALERTES.length})
              </button>
            </div>
          </>
        )}
      </div>

      {/* ===== PANEL DROIT DÉTAIL ===== */}
      {(selected||selectedTech)&&(
        <div style={{width:290,background:"white",borderLeft:"1px solid #E2E8F0",display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0}}>

          {/* DÉTAIL SITE */}
          {selected&&(
            <>
              <div style={{padding:"14px 16px",background:`linear-gradient(135deg,#0F172A,${STATUS_SITES[selected.status]?.color||"#2563EB"})`,color:"white",display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexShrink:0}}>
                <div>
                  <div style={{fontSize:16,fontWeight:800}}>{selected.code}</div>
                  <div style={{fontSize:11,opacity:.75,marginTop:2}}>{selected.name}</div>
                </div>
                <button onClick={()=>setSelected(null)} style={{background:"rgba(255,255,255,.2)",border:"none",color:"white",width:24,height:24,borderRadius:"50%",cursor:"pointer",fontSize:13}}>✕</button>
              </div>

              <div style={{flex:1,overflowY:"auto",padding:16}}>
                <div style={{display:"inline-flex",padding:"3px 10px",borderRadius:8,background:`${STATUS_SITES[selected.status]?.color||"#2563EB"}12`,marginBottom:14}}>
                  <span style={{fontSize:11,fontWeight:700,color:STATUS_SITES[selected.status]?.color}}>{STATUS_SITES[selected.status]?.label}</span>
                </div>

                {[["Type réseau",selected.type],["Client",selected.client],["Projet",selected.projet],["GPS",`${selected.lat.toFixed(4)}°N, ${selected.lng.toFixed(4)}°E`],["Budget",`${selected.budget}M FCFA`]].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #F8FAFC"}}>
                    <span style={{fontSize:12,color:"#64748B"}}>{l}</span>
                    <span style={{fontSize:12,fontWeight:600,color:"#1E293B",textAlign:"right",maxWidth:140}}>{v}</span>
                  </div>
                ))}

                <div style={{marginTop:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#64748B",marginBottom:6}}>
                    <span>Progression</span>
                    <span style={{fontWeight:700,color:STATUS_SITES[selected.status]?.color}}>{selected.progression}%</span>
                  </div>
                  <div style={{background:"#F1F5F9",borderRadius:6,height:10,overflow:"hidden"}}>
                    <div style={{width:`${selected.progression}%`,height:"100%",background:STATUS_SITES[selected.status]?.color||"#2563EB",borderRadius:6}}/>
                  </div>
                </div>

                {/* Tech sur ce site */}
                {(()=>{
                  const tech = techniciens.find(t=>t.site===selected.code);
                  return tech?(
                    <div style={{marginTop:14,padding:12,borderRadius:10,background:`${tech.color}08`,border:`1px solid ${tech.color}20`}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#64748B",marginBottom:8}}>👷 Technicien sur site</div>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                        <div style={{width:36,height:36,borderRadius:10,background:tech.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:800,fontSize:11}}>{tech.avatar}</div>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:"#1E293B"}}>{tech.nom}</div>
                          <div style={{fontSize:10,color:STATUS_TECH[tech.status]?.color,fontWeight:600}}>{STATUS_TECH[tech.status]?.label}</div>
                        </div>
                      </div>
                      {tech.rapport&&<div style={{fontSize:11,color:"#475569",background:"white",padding:"6px 10px",borderRadius:6,lineHeight:1.5}}>📋 {tech.rapport}</div>}
                      <div style={{display:"flex",gap:6,marginTop:8}}>
                        <button onClick={()=>window.open(`tel:${tech.phone}`)} style={{flex:1,padding:"6px",borderRadius:6,border:"none",background:tech.color,color:"white",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>📞 Appeler</button>
                        <button onClick={()=>{setSelectedTech(tech);setSelected(null);}} style={{flex:1,padding:"6px",borderRadius:6,border:`1px solid ${tech.color}`,background:"white",color:tech.color,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Voir profil</button>
                      </div>
                    </div>
                  ):disponibles.length>0?(
                    <div style={{marginTop:14,padding:12,borderRadius:10,background:"#F8FAFC",border:"1px dashed #CBD5E1"}}>
                      <div style={{fontSize:11,color:"#64748B",marginBottom:8}}>Aucun technicien sur ce site</div>
                      <button onClick={()=>{setDispatchSite(selected);setShowDispatch(true);}}
                        style={{width:"100%",padding:"7px",borderRadius:6,border:"none",background:"#2563EB",color:"white",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                        ➤ Dispatcher un technicien
                      </button>
                    </div>
                  ):null;
                })()}

                <div style={{display:"flex",gap:8,marginTop:14}}>
                  <button onClick={()=>openMaps(selected.lat,selected.lng)} style={{flex:1,padding:"9px",borderRadius:8,border:"none",background:"#2563EB",color:"white",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>🗺 Google Maps</button>
                  <button onClick={()=>window.open(`https://earth.google.com/web/@${selected.lat},${selected.lng},500a,800d,35y`,"_blank")} style={{flex:1,padding:"9px",borderRadius:8,border:"1px solid #E2E8F0",background:"white",color:"#374151",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>🌍 Earth</button>
                </div>
              </div>
            </>
          )}

          {/* DÉTAIL TECHNICIEN */}
          {selectedTech&&!selected&&(
            <>
              <div style={{padding:"14px 16px",background:`linear-gradient(135deg,#0F172A,${selectedTech.color})`,color:"white",display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexShrink:0}}>
                <div>
                  <div style={{fontSize:16,fontWeight:800}}>{selectedTech.nom}</div>
                  <div style={{fontSize:11,opacity:.75,marginTop:2}}>{selectedTech.specialite}</div>
                </div>
                <button onClick={()=>setSelectedTech(null)} style={{background:"rgba(255,255,255,.2)",border:"none",color:"white",width:24,height:24,borderRadius:"50%",cursor:"pointer",fontSize:13}}>✕</button>
              </div>

              <div style={{flex:1,overflowY:"auto",padding:16}}>
                <div style={{display:"inline-flex",padding:"3px 10px",borderRadius:8,background:STATUS_TECH[selectedTech.status]?.bg,marginBottom:14}}>
                  <span style={{fontSize:11,fontWeight:700,color:STATUS_TECH[selectedTech.status]?.color}}>{STATUS_TECH[selectedTech.status]?.label}</span>
                </div>

                {/* Métriques live */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                  <div style={{background:"#F8FAFC",borderRadius:8,padding:"10px",textAlign:"center"}}>
                    <div style={{fontSize:10,color:"#94A3B8",marginBottom:4}}>BATTERIE</div>
                    <div style={{fontSize:20,fontWeight:700,color:selectedTech.battery>50?"#10B981":selectedTech.battery>20?"#F59E0B":"#EF4444"}}>{selectedTech.battery}%</div>
                  </div>
                  <div style={{background:"#F8FAFC",borderRadius:8,padding:"10px",textAlign:"center"}}>
                    <div style={{fontSize:10,color:"#94A3B8",marginBottom:4}}>SIGNAL</div>
                    <div style={{fontSize:20,fontWeight:700,color:"#2563EB"}}>{selectedTech.signal}/5</div>
                  </div>
                  <div style={{background:"#F8FAFC",borderRadius:8,padding:"10px",textAlign:"center"}}>
                    <div style={{fontSize:10,color:"#94A3B8",marginBottom:4}}>TÂCHES</div>
                    <div style={{fontSize:20,fontWeight:700,color:"#7C3AED"}}>{selectedTech.taches}</div>
                  </div>
                  <div style={{background:"#F8FAFC",borderRadius:8,padding:"10px",textAlign:"center"}}>
                    <div style={{fontSize:10,color:"#94A3B8",marginBottom:4}}>DÉBUT</div>
                    <div style={{fontSize:16,fontWeight:700,color:"#475569"}}>{selectedTech.heureDebut}</div>
                  </div>
                </div>

                {[["Site actuel",selectedTech.site],["Téléphone",selectedTech.phone],["Matricule",selectedTech.matricule],["Spécialité",selectedTech.specialite],["GPS",`${selectedTech.lat.toFixed(4)}°N`],["Mise à jour",selectedTech.lastUpdate]].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #F8FAFC"}}>
                    <span style={{fontSize:12,color:"#64748B"}}>{l}</span>
                    <span style={{fontSize:12,fontWeight:600,color:"#1E293B",textAlign:"right",maxWidth:150}}>{v}</span>
                  </div>
                ))}

                {selectedTech.rapport&&(
                  <div style={{marginTop:12,padding:"10px 12px",background:"#F0FDF4",borderRadius:8,border:"1px solid #BBF7D0"}}>
                    <div style={{fontSize:10,fontWeight:700,color:"#059669",marginBottom:4}}>DERNIER RAPPORT</div>
                    <div style={{fontSize:12,color:"#1E293B",lineHeight:1.5}}>{selectedTech.rapport}</div>
                  </div>
                )}

                <div style={{display:"flex",gap:8,marginTop:14}}>
                  <button onClick={()=>window.open(`tel:${selectedTech.phone}`)} style={{flex:1,padding:"9px",borderRadius:8,border:"none",background:selectedTech.color,color:"white",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>📞 Appeler</button>
                  <button onClick={()=>openMaps(selectedTech.lat,selectedTech.lng)} style={{flex:1,padding:"9px",borderRadius:8,border:"1px solid #E2E8F0",background:"white",color:"#374151",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>🗺 Localiser</button>
                </div>
                {selectedTech.status==="disponible"&&(
                  <button onClick={()=>{setDispatchTech(selectedTech);setShowDispatch(true);}}
                    style={{width:"100%",marginTop:8,padding:"9px",borderRadius:8,border:"none",background:"#059669",color:"white",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit"}}>
                    ➤ Dispatcher ce technicien
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== MODAL DISPATCH ===== */}
      {showDispatch&&(
        <div style={{position:"fixed",inset:0,zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div onClick={()=>setShowDispatch(false)} style={{position:"absolute",inset:0,background:"rgba(15,23,42,.5)",backdropFilter:"blur(4px)"}}/>
          <div style={{position:"relative",background:"white",borderRadius:12,width:"100%",maxWidth:480,boxShadow:"0 20px 60px rgba(0,0,0,.25)",overflow:"hidden"}}>
            <div style={{padding:"14px 20px",background:"linear-gradient(135deg,#0F172A,#2563EB)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:"white"}}>➤ Dispatch Technicien</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.55)",marginTop:2}}>Assigner un technicien à un chantier</div>
              </div>
              <button onClick={()=>setShowDispatch(false)} style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,.2)",border:"none",color:"white",cursor:"pointer",fontSize:14}}>✕</button>
            </div>

            <div style={{padding:"16px 20px"}}>
              <div style={{marginBottom:16}}>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:"#64748B",marginBottom:8,textTransform:"uppercase",letterSpacing:".4px"}}>Technicien</label>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {techniciens.filter(t=>t.status==="disponible"||t.status==="en_deplacement").map(t=>(
                    <div key={t.id} onClick={()=>setDispatchTech(t)}
                      style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,border:`2px solid ${dispatchTech?.id===t.id?t.color:"#E2E8F0"}`,cursor:"pointer",background:dispatchTech?.id===t.id?`${t.color}08`:"white",transition:"all .12s"}}>
                      <div style={{width:32,height:32,borderRadius:8,background:t.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:11}}>{t.avatar}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:600,color:"#1E293B"}}>{t.nom}</div>
                        <div style={{fontSize:10,color:"#64748B"}}>{t.specialite}</div>
                      </div>
                      <span style={{padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600,background:STATUS_TECH[t.status]?.bg,color:STATUS_TECH[t.status]?.color}}>{STATUS_TECH[t.status]?.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{marginBottom:16}}>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:"#64748B",marginBottom:8,textTransform:"uppercase",letterSpacing:".4px"}}>Site de destination</label>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {SITES.filter(s=>!["termine","livre"].includes(s.status)).map(s=>{
                    const cfg = STATUS_SITES[s.status];
                    return (
                      <div key={s.code} onClick={()=>setDispatchSite(s)}
                        style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,border:`2px solid ${dispatchSite?.code===s.code?cfg.color:"#E2E8F0"}`,cursor:"pointer",background:dispatchSite?.code===s.code?`${cfg.color}08`:"white",transition:"all .12s"}}>
                        <div style={{width:32,height:32,borderRadius:8,background:cfg.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:10}}>{s.type.includes("5G")?"5G":s.type.includes("4G")?"4G":"3G"}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,fontWeight:600,color:"#1E293B"}}>{s.code} · {s.name}</div>
                          <div style={{fontSize:10,color:"#64748B"}}>{s.client} · {s.progression}% avancement</div>
                        </div>
                        <span style={{padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600,background:`${cfg.color}15`,color:cfg.color}}>{cfg.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setShowDispatch(false)} style={{flex:1,padding:"10px",borderRadius:8,border:"1px solid #E2E8F0",background:"white",color:"#475569",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Annuler</button>
                <button onClick={doDispatch} disabled={!dispatchTech||!dispatchSite}
                  style={{flex:2,padding:"10px",borderRadius:8,border:"none",background:dispatchTech&&dispatchSite?"#2563EB":"#CBD5E1",color:"white",fontSize:13,fontWeight:700,cursor:dispatchTech&&dispatchSite?"pointer":"not-allowed",fontFamily:"inherit"}}>
                  ➤ Confirmer le dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .leaflet-popup-content-wrapper{border-radius:12px!important;box-shadow:0 8px 32px rgba(0,0,0,.15)!important;}
        .leaflet-popup-content{margin:14px 16px!important;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes pulseTech{0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,.4)}70%{box-shadow:0 0 0 6px rgba(37,99,235,0)}}
      `}</style>
    </div>
  );
}
