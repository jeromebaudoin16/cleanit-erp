import { useEffect, useRef, useState, useCallback } from "react";

// ===== PHOTOS (mêmes que RH) =====
const PHOTOS = {
  "EE001":"https://i.pravatar.cc/150?img=15",
  "EE002":"https://i.pravatar.cc/150?img=17",
  "EE003":"https://i.pravatar.cc/150?img=22",
  "EE004":"https://i.pravatar.cc/150?img=3",
  "EE005":"https://i.pravatar.cc/150?img=25",
};

// ===== DONNÉES =====
const SITES = [
  {code:"DLA-001",name:"Site Akwa Douala",lat:4.0511,lng:9.7085,status:"en_cours",type:"5G NR",progression:65,client:"MTN Cameroun",projet:"PROJ-2024-001",budget:180,techId:"EE001"},
  {code:"DLA-003",name:"Site Bonabéri",lat:4.0667,lng:9.6500,status:"en_retard",type:"4G LTE",progression:30,client:"Orange Cameroun",projet:"PROJ-2024-002",budget:85,techId:null},
  {code:"YDE-001",name:"Site Centre Yaoundé",lat:3.8480,lng:11.5021,status:"termine",type:"5G NR",progression:100,client:"MTN Cameroun",projet:"PROJ-2024-001",budget:95,techId:"EE002"},
  {code:"BFN-001",name:"Site Bafoussam",lat:5.4764,lng:10.4214,status:"planifie",type:"4G LTE",progression:0,client:"CAMTEL",projet:"PROJ-2024-006",budget:50,techId:null},
  {code:"GAR-001",name:"Site Garoua",lat:9.3019,lng:13.3920,status:"en_cours",type:"3G UMTS",progression:55,client:"Nexttel",projet:"PROJ-2024-004",budget:45,techId:"EE004"},
  {code:"KRI-001",name:"Site Kribi Port",lat:2.9395,lng:9.9087,status:"livre",type:"5G NR",progression:100,client:"MTN Cameroun",projet:"PROJ-2024-001",budget:0,techId:null},
  {code:"LIM-001",name:"Site Limbé",lat:4.0167,lng:9.2000,status:"en_cours",type:"4G LTE",progression:75,client:"Orange Cameroun",projet:"PROJ-2024-002",budget:40,techId:"EE003"},
  {code:"MAR-001",name:"Site Maroua",lat:10.5900,lng:14.3157,status:"planifie",type:"4G LTE",progression:0,client:"CAMTEL",projet:"PROJ-2024-006",budget:30,techId:null},
];

const TECHNICIENS_INIT = [
  {id:"EE001",nom:"Thomas Ngono",lat:4.0580,lng:9.7150,status:"en_mission",site:"DLA-001",siteLat:4.0511,siteLng:9.7085,type:"5G NR",phone:"+237 677 100 001",avatar:"TN",color:"#2563EB",matricule:"CLN-EXT-001",specialite:"5G NR / 4G LTE",battery:78,signal:4,lastUpdate:"À l'instant",taches:3,rapport:"Câblage RRU terminé. Test en cours.",heureDebut:"07:30"},
  {id:"EE002",nom:"Jean Mbarga",lat:3.8600,lng:11.5100,status:"en_mission",site:"YDE-001",siteLat:3.8480,siteLng:11.5021,type:"5G NR",phone:"+237 677 100 002",avatar:"JM",color:"#7C3AED",matricule:"CLN-EXT-002",specialite:"Survey RF",battery:92,signal:5,lastUpdate:"À l'instant",taches:2,rapport:"Installation antenne BBU terminée.",heureDebut:"08:00"},
  {id:"EE003",nom:"Samuel Djomo",lat:4.0300,lng:9.1800,status:"en_deplacement",site:"LIM-001",siteLat:4.0167,siteLng:9.2000,type:"4G LTE",phone:"+237 677 100 003",avatar:"SD",color:"#059669",matricule:"CLN-EXT-003",specialite:"3G UMTS / 4G LTE",battery:45,signal:3,lastUpdate:"Il y a 3 min",taches:1,rapport:"En route vers site Limbé.",heureDebut:"09:15"},
  {id:"EE004",nom:"Ali Moussa",lat:9.2800,lng:13.4100,status:"en_mission",site:"GAR-001",siteLat:9.3019,siteLng:13.3920,type:"3G UMTS",phone:"+237 677 100 004",avatar:"AM",color:"#D97706",matricule:"CLN-EXT-004",specialite:"Supervision HSE",battery:63,signal:2,lastUpdate:"Il y a 5 min",taches:4,rapport:"Vérification sécurité pylône terminée.",heureDebut:"06:45"},
  {id:"EE005",nom:"René Talla",lat:4.0400,lng:9.6800,status:"disponible",site:"—",siteLat:null,siteLng:null,type:"—",phone:"+237 677 100 005",avatar:"RT",color:"#DB2777",matricule:"CLN-EXT-005",specialite:"Fibre optique",battery:100,signal:5,lastUpdate:"En ligne",taches:0,rapport:"",heureDebut:"—"},
];

const STATUS_SITES = {
  planifie: {color:"#7C3AED",bg:"#EDE9FE",label:"Planifié"},
  en_cours: {color:"#2563EB",bg:"#DBEAFE",label:"En cours"},
  termine:  {color:"#059669",bg:"#D1FAE5",label:"Terminé"},
  livre:    {color:"#059669",bg:"#D1FAE5",label:"Livré"},
  en_retard:{color:"#DC2626",bg:"#FEE2E2",label:"En retard"},
};

const STATUS_TECH = {
  en_mission:    {color:"#2563EB",label:"En mission",    bg:"#EFF6FF"},
  en_deplacement:{color:"#D97706",label:"En déplacement",bg:"#FEFCE8"},
  disponible:    {color:"#059669",label:"Disponible",    bg:"#F0FDF4"},
  hors_ligne:    {color:"#94A3B8",label:"Hors ligne",    bg:"#F8FAFC"},
};

const LAYERS = [
  {id:"satellite",label:"Satellite",url:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"},
  {id:"osm",      label:"Standard", url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"},
  {id:"terrain",  label:"Terrain",  url:"https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"},
];

const ALERTES = [
  {id:"A001",type:"RETARD",   color:"#DC2626",msg:"DLA-003 en retard de 3 semaines. Aucun technicien assigné.",time:"14:23"},
  {id:"A002",type:"BATTERIE", color:"#D97706",msg:"Batterie faible (45%) — Samuel Djomo sur LIM-001",time:"14:30"},
  {id:"A003",type:"SIGNAL",   color:"#D97706",msg:"Signal faible zone Garoua — Ali Moussa",time:"14:38"},
  {id:"A004",type:"DISPO",    color:"#059669",msg:"René Talla disponible — Peut être dispatché",time:"14:40"},
];

export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef({});
  const techMarkersRef = useRef({});
  const routeLayersRef = useRef({});
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedTech, setSelectedTech] = useState(null);
  const [techniciens, setTechniciens] = useState(TECHNICIENS_INIT);
  const [activeLayer, setActiveLayer] = useState("satellite");
  const [searchQ, setSearchQ] = useState("");
  const [activeTab, setActiveTab] = useState("sites");
  const [filter, setFilter] = useState("tous");
  const [showDispatch, setShowDispatch] = useState(false);
  const [dispatchTech, setDispatchTech] = useState(null);
  const [dispatchSite, setDispatchSite] = useState(null);
  const [liveMode, setLiveMode] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [routeInfo, setRouteInfo] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // GPS live simulation
  useEffect(() => {
    if(!liveMode) return;
    const interval = setInterval(() => {
      setTechniciens(prev => prev.map(t => {
        if(t.status==="en_mission") {
          return {...t, lat:t.lat+((Math.random()-0.5)*0.0003), lng:t.lng+((Math.random()-0.5)*0.0003), lastUpdate:"À l'instant"};
        }
        if(t.status==="en_deplacement" && t.siteLat) {
          // Simuler avance vers le site
          const dLat = (t.siteLat - t.lat) * 0.05;
          const dLng = (t.siteLng - t.lng) * 0.05;
          return {...t, lat:t.lat+dLat, lng:t.lng+dLng, lastUpdate:"À l'instant"};
        }
        return t;
      }));
      setLastRefresh(new Date());
    }, 4000);
    return () => clearInterval(interval);
  }, [liveMode]);

  // Mise à jour positions marqueurs
  useEffect(() => {
    if(!mapInstanceRef.current || !window.L) return;
    techniciens.forEach(tech => {
      const marker = techMarkersRef.current[tech.id];
      if(marker) marker.setLatLng([tech.lat, tech.lng]);
    });
  }, [techniciens]);

  // Calcul itinéraire réel via OSRM (gratuit, pas de clé API)
  const calculateRoute = useCallback(async (fromLat, fromLng, toLat, toLng, techId) => {
    setLoadingRoute(true);
    setRouteInfo(null);
    // Supprimer ancien itinéraire
    if(routeLayersRef.current[techId] && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(routeLayersRef.current[techId]);
      delete routeLayersRef.current[techId];
    }
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson&steps=true`;
      const resp = await fetch(url);
      const data = await resp.json();
      if(data.code==="Ok" && data.routes[0]) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map(c=>[c[1],c[0]]);
        const dist = (route.distance/1000).toFixed(1);
        const dur = Math.round(route.duration/60);
        setRouteInfo({distance:dist, duration:dur});
        if(mapInstanceRef.current && window.L) {
          // Ligne de route
          const routeLine = window.L.polyline(coords, {
            color:"#2563EB", weight:4, opacity:0.85,
            dashArray:null,
          }).addTo(mapInstanceRef.current);
          // Décoration animée
          const dashed = window.L.polyline(coords, {
            color:"white", weight:2, opacity:0.5, dashArray:"8,12"
          }).addTo(mapInstanceRef.current);
          // Groupe
          const grp = window.L.layerGroup([routeLine, dashed]).addTo(mapInstanceRef.current);
          routeLayersRef.current[techId] = grp;
          // Ajuster vue sur le trajet
          const bounds = window.L.latLngBounds(coords);
          mapInstanceRef.current.fitBounds(bounds, {padding:[60,60]});
        }
      }
    } catch(e) {
      console.error("Route error:", e);
      // Fallback: ligne droite
      if(mapInstanceRef.current && window.L) {
        const line = window.L.polyline([[fromLat,fromLng],[toLat,toLng]], {
          color:"#F59E0B", weight:3, dashArray:"8,6", opacity:0.8
        }).addTo(mapInstanceRef.current);
        routeLayersRef.current[techId] = line;
      }
      setRouteInfo({distance:"N/A", duration:"N/A"});
    }
    setLoadingRoute(false);
  }, []);

  // Leaflet init
  useEffect(() => {
    if(!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id="leaflet-css"; link.rel="stylesheet";
      link.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if(window.L) { setLoaded(true); return; }
    const script = document.createElement("script");
    script.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload=()=>setLoaded(true);
    document.head.appendChild(script);
    return()=>{
      if(mapInstanceRef.current){mapInstanceRef.current.remove();mapInstanceRef.current=null;}
    };
  }, []);

  // Créer marqueur photo technicien
  const createTechIcon = useCallback((tech) => {
    const st = STATUS_TECH[tech.status]||STATUS_TECH.disponible;
    const photo = PHOTOS[tech.id];
    return window.L.divIcon({
      html:`<div style="position:relative;width:52px;height:62px">
        <div style="width:52px;height:52px;border-radius:50%;overflow:hidden;border:3px solid ${tech.color};box-shadow:0 4px 16px rgba(0,0,0,0.3);cursor:pointer;position:relative">
          ${photo
            ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.nextSibling.style.display='flex'"/>
               <div style="display:none;width:100%;height:100%;background:${tech.color};align-items:center;justify-content:center;color:white;font-weight:700;font-size:14px">${tech.avatar}</div>`
            : `<div style="width:100%;height:100%;background:${tech.color};display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:14px">${tech.avatar}</div>`
          }
          <div style="position:absolute;bottom:1px;right:1px;width:13px;height:13px;border-radius:50%;background:${st.color};border:2px solid white;${tech.status==="en_mission"?"animation:pulseMarker 2s infinite":""}"></div>
        </div>
        <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:12px solid ${tech.color}"></div>
        <div style="position:absolute;top:-22px;left:50%;transform:translateX(-50%);background:${tech.color};color:white;font-size:9px;font-weight:700;padding:2px 7px;border-radius:10px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.2)">${tech.nom.split(" ")[0]}</div>
      </div>`,
      className:"", iconSize:[52,62], iconAnchor:[26,62], popupAnchor:[0,-66]
    });
  }, []);

  // Créer marqueur site
  const createSiteIcon = useCallback((site) => {
    const cfg = STATUS_SITES[site.status]||STATUS_SITES.planifie;
    return window.L.divIcon({
      html:`<div style="position:relative;width:54px;height:64px">
        <div style="width:54px;height:54px;border-radius:12px;background:${cfg.color};border:3px solid white;box-shadow:0 4px 16px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;flex-direction:column;cursor:pointer;position:relative">
          <span style="color:white;font-weight:900;font-size:13px">${site.type.includes("5G")?"5G":site.type.includes("4G")?"4G":"3G"}</span>
          <span style="color:rgba(255,255,255,.8);font-size:8px;font-weight:600">${site.code}</span>
          ${site.status==="en_retard"?`<div style="position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#DC2626;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:9px;color:white;font-weight:700">!</div>`:""}
          <div style="position:absolute;bottom:-2px;left:50%;transform:translateX(-50%);width:100%;height:4px;background:rgba(255,255,255,.3);border-radius:0 0 4px 4px;overflow:hidden">
            <div style="height:100%;width:${site.progression}%;background:rgba(255,255,255,.8)"></div>
          </div>
        </div>
        <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:12px solid ${cfg.color}"></div>
        <div style="position:absolute;top:-22px;left:50%;transform:translateX(-50%);background:rgba(15,23,42,.85);color:white;font-size:9px;font-weight:600;padding:2px 7px;border-radius:10px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.3)">${site.name.length>18?site.name.slice(0,18)+"...":site.name}</div>
      </div>`,
      className:"", iconSize:[54,64], iconAnchor:[27,64], popupAnchor:[0,-68]
    });
  }, []);

  useEffect(() => {
    if(!loaded || !mapRef.current || mapInstanceRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, {center:[5.5,12.0], zoom:6, zoomControl:false});
    L.control.zoom({position:"bottomright"}).addTo(map);
    tileLayerRef.current = L.tileLayer(LAYERS[0].url, {attribution:"© Esri", maxZoom:19}).addTo(map);

    // Sites
    SITES.forEach(site => {
      const cfg = STATUS_SITES[site.status]||STATUS_SITES.planifie;
      const icon = window.L.divIcon({
        html:`<div style="position:relative;width:54px;height:64px">
          <div style="width:54px;height:54px;border-radius:12px;background:${cfg.color};border:3px solid white;box-shadow:0 4px 16px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;flex-direction:column;cursor:pointer;position:relative">
            <span style="color:white;font-weight:900;font-size:13px">${site.type.includes("5G")?"5G":site.type.includes("4G")?"4G":"3G"}</span>
            <span style="color:rgba(255,255,255,.8);font-size:8px;font-weight:600">${site.code}</span>
            ${site.status==="en_retard"?`<div style="position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#DC2626;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:9px;color:white;font-weight:700">!</div>`:""}
          </div>
          <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:12px solid ${cfg.color}"></div>
          <div style="position:absolute;top:-22px;left:50%;transform:translateX(-50%);background:rgba(15,23,42,.85);color:white;font-size:9px;font-weight:600;padding:2px 7px;border-radius:10px;white-space:nowrap">${site.name.length>16?site.name.slice(0,16)+"...":site.name}</div>
        </div>`,
        className:"", iconSize:[54,64], iconAnchor:[27,64], popupAnchor:[0,-68]
      });
      const marker = L.marker([site.lat, site.lng], {icon}).addTo(map);
      marker.on("click", () => {
        setSelected(site);
        setSelectedTech(null);
        map.flyTo([site.lat, site.lng], 14, {animate:true, duration:1.2});
        setRouteInfo(null);
        // Supprimer routes existantes
        Object.values(routeLayersRef.current).forEach(l=>map.removeLayer(l));
        routeLayersRef.current = {};
      });
      markersRef.current[site.code] = marker;
    });

    // Techniciens avec photos
    TECHNICIENS_INIT.forEach(tech => {
      const st = STATUS_TECH[tech.status]||STATUS_TECH.disponible;
      const photo = PHOTOS[tech.id];
      const icon = L.divIcon({
        html:`<div style="position:relative;width:52px;height:62px">
          <div style="width:52px;height:52px;border-radius:50%;overflow:hidden;border:3px solid ${tech.color};box-shadow:0 4px 16px rgba(0,0,0,0.3);cursor:pointer">
            ${photo
              ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover"/>`
              : `<div style="width:100%;height:100%;background:${tech.color};display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:14px">${tech.avatar}</div>`
            }
            <div style="position:absolute;bottom:1px;right:1px;width:13px;height:13px;border-radius:50%;background:${st.color};border:2px solid white"></div>
          </div>
          <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:12px solid ${tech.color}"></div>
          <div style="position:absolute;top:-22px;left:50%;transform:translateX(-50%);background:${tech.color};color:white;font-size:9px;font-weight:700;padding:2px 7px;border-radius:10px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.2)">${tech.nom.split(" ")[0]}</div>
        </div>`,
        className:"", iconSize:[52,62], iconAnchor:[26,62], popupAnchor:[0,-66]
      });
      const marker = L.marker([tech.lat, tech.lng], {icon}).addTo(map);
      marker.on("click", () => {
        setSelectedTech(tech);
        setSelected(null);
        map.flyTo([tech.lat, tech.lng], 14, {animate:true, duration:1.2});
        // Calculer itinéraire si technicien a un site assigné
        if(tech.siteLat && tech.status !== "disponible") {
          calculateRoute(tech.lat, tech.lng, tech.siteLat, tech.siteLng, tech.id);
        } else {
          setRouteInfo(null);
          Object.values(routeLayersRef.current).forEach(l=>map.removeLayer(l));
          routeLayersRef.current = {};
        }
      });
      techMarkersRef.current[tech.id] = marker;
    });

    mapInstanceRef.current = map;
  }, [loaded, calculateRoute]);

  const changeLayer = (layerId) => {
    if(!mapInstanceRef.current||!window.L) return;
    if(tileLayerRef.current) mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const layer = LAYERS.find(l=>l.id===layerId);
    tileLayerRef.current = window.L.tileLayer(layer.url, {attribution:"© OpenStreetMap/Esri", maxZoom:19}).addTo(mapInstanceRef.current);
    setActiveLayer(layerId);
  };

  const flyToLocation = (lat, lng, zoom=15) => {
    mapInstanceRef.current?.flyTo([lat, lng], zoom, {animate:true, duration:1.5});
  };

  const doDispatch = () => {
    if(!dispatchTech||!dispatchSite) return;
    const site = SITES.find(s=>s.code===dispatchSite.code);
    setTechniciens(prev=>prev.map(t=>t.id===dispatchTech.id?{...t,status:"en_deplacement",site:dispatchSite.code,siteLat:site?.lat,siteLng:site?.lng}:t));
    calculateRoute(dispatchTech.lat, dispatchTech.lng, site?.lat, site?.lng, dispatchTech.id);
    setShowDispatch(false);
    setDispatchTech(null);
    setDispatchSite(null);
  };

  const filteredSites = SITES.filter(s=>{
    const mf = filter==="tous"||s.status===filter;
    const mq = !searchQ||s.code.toLowerCase().includes(searchQ.toLowerCase())||s.name.toLowerCase().includes(searchQ.toLowerCase());
    return mf&&mq;
  });

  const disponibles = techniciens.filter(t=>t.status==="disponible");

  return (
    <div style={{display:"flex",height:"calc(100vh - 56px)",overflow:"hidden",fontFamily:"'Segoe UI',Arial,sans-serif",background:"#0F172A"}}>

      {/* ===== PANEL GAUCHE ===== */}
      <div style={{width:310,background:"#0F172A",display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0,zIndex:10,borderRight:"1px solid rgba(255,255,255,.08)"}}>

        {/* Header */}
        <div style={{padding:"16px",background:"linear-gradient(135deg,#0F172A,#1E3A5F)",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:"white",letterSpacing:".3px"}}>🛰 Digital Twin</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:2}}>{lastRefresh.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</div>
            </div>
            <button onClick={()=>setLiveMode(!liveMode)} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:20,border:"none",background:liveMode?"rgba(16,185,129,.15)":"rgba(255,255,255,.08)",color:liveMode?"#34D399":"rgba(255,255,255,.4)",fontSize:11,fontWeight:700,cursor:"pointer"}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:liveMode?"#34D399":"#475569",animation:liveMode?"pulseLive 1.5s infinite":"none"}}/>
              {liveMode?"LIVE":"PAUSE"}
            </button>
          </div>
          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
            {[{l:"Sites",v:SITES.length,c:"#60A5FA"},{l:"En mission",v:techniciens.filter(t=>t.status==="en_mission").length,c:"#34D399"},{l:"Dispo",v:disponibles.length,c:"#A78BFA"},{l:"Alertes",v:ALERTES.length,c:"#F87171"}].map(s=>(
              <div key={s.l} style={{background:"rgba(255,255,255,.06)",borderRadius:8,padding:"8px 4px",textAlign:"center",border:"1px solid rgba(255,255,255,.05)"}}>
                <div style={{fontSize:18,fontWeight:800,color:s.c}}>{s.v}</div>
                <div style={{fontSize:9,color:"rgba(255,255,255,.35)",marginTop:1}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",background:"rgba(255,255,255,.04)",borderBottom:"1px solid rgba(255,255,255,.06)",flexShrink:0}}>
          {[{id:"sites",l:"Sites"},{id:"techs",l:"Équipe"},{id:"missions",l:"Missions"},{id:"alertes",l:"Alertes",badge:ALERTES.length}].map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{flex:1,padding:"10px 4px",border:"none",borderBottom:`2px solid ${activeTab===t.id?"#3B82F6":"transparent"}`,background:"transparent",color:activeTab===t.id?"#60A5FA":"rgba(255,255,255,.35)",fontSize:11,fontWeight:activeTab===t.id?700:400,cursor:"pointer",fontFamily:"inherit",position:"relative",transition:"all .12s"}}>
              {t.l}
              {t.badge&&<span style={{position:"absolute",top:4,right:4,width:14,height:14,borderRadius:"50%",background:"#EF4444",color:"white",fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{t.badge}</span>}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{padding:"10px",borderBottom:"1px solid rgba(255,255,255,.06)",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,padding:"7px 10px"}}>
            <span style={{fontSize:13,opacity:.5}}>🔍</span>
            <input value={searchQ} onChange={e=>setSearchQ(e.target.value)}
              placeholder={activeTab==="sites"?"Rechercher un site...":"Rechercher technicien..."}
              style={{border:"none",outline:"none",background:"transparent",fontSize:12,flex:1,fontFamily:"inherit",color:"white"}}/>
          </div>
        </div>

        {/* Contenu scroll */}
        <div style={{flex:1,overflowY:"auto"}}>

          {/* ===== SITES ===== */}
          {activeTab==="sites"&&(
            <>
              <div style={{padding:"8px 10px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",gap:4,flexWrap:"wrap"}}>
                {[{v:"tous",l:"Tous"},...Object.entries(STATUS_SITES).map(([k,v])=>({v:k,l:v.label,c:v.color}))].map(f=>(
                  <button key={f.v} onClick={()=>setFilter(f.v)}
                    style={{padding:"3px 8px",borderRadius:6,border:`1px solid ${filter===f.v?(f.c||"#3B82F6"):"rgba(255,255,255,.1)"}`,background:filter===f.v?`${f.c||"#3B82F6"}18`:"transparent",color:filter===f.v?(f.c||"#60A5FA"):"rgba(255,255,255,.4)",fontSize:10,cursor:"pointer",fontWeight:filter===f.v?700:400}}>
                    {f.l}
                  </button>
                ))}
              </div>
              {filteredSites.map(site=>{
                const cfg = STATUS_SITES[site.status]||STATUS_SITES.planifie;
                const techSite = techniciens.find(t=>t.site===site.code);
                return (
                  <div key={site.code}
                    onClick={()=>{
                      setSelected(site); setSelectedTech(null);
                      flyToLocation(site.lat, site.lng, 14);
                      setRouteInfo(null);
                      Object.values(routeLayersRef.current).forEach(l=>mapInstanceRef.current?.removeLayer(l));
                      routeLayersRef.current={};
                    }}
                    style={{padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,.04)",cursor:"pointer",background:selected?.code===site.code?"rgba(59,130,246,.1)":"transparent",borderLeft:`3px solid ${selected?.code===site.code?cfg.color:"transparent"}`,transition:"all .12s"}}
                    onMouseEnter={e=>e.currentTarget.style.background=`rgba(255,255,255,.04)`}
                    onMouseLeave={e=>e.currentTarget.style.background=selected?.code===site.code?"rgba(59,130,246,.1)":"transparent"}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:11,fontWeight:700,color:cfg.color}}>{site.code}</span>
                      <span style={{padding:"1px 7px",borderRadius:6,fontSize:9,fontWeight:700,background:`${cfg.color}22`,color:cfg.color}}>{cfg.label}</span>
                    </div>
                    <div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.85)",marginBottom:3}}>{site.name}</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,.35)",marginBottom:6}}>📡 {site.type} · 🏢 {site.client}</div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{flex:1,background:"rgba(255,255,255,.08)",borderRadius:3,height:4,overflow:"hidden"}}>
                        <div style={{width:`${site.progression}%`,height:"100%",background:cfg.color,borderRadius:3}}/>
                      </div>
                      <span style={{fontSize:10,fontWeight:700,color:cfg.color,minWidth:28}}>{site.progression}%</span>
                    </div>
                    {techSite&&(
                      <div style={{marginTop:8,display:"flex",alignItems:"center",gap:8,padding:"5px 8px",borderRadius:6,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.06)"}}>
                        <div style={{width:22,height:22,borderRadius:"50%",overflow:"hidden",border:`2px solid ${techSite.color}`,flexShrink:0}}>
                          {PHOTOS[techSite.id]
                            ?<img src={PHOTOS[techSite.id]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
                            :<div style={{width:"100%",height:"100%",background:techSite.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:8,fontWeight:700}}>{techSite.avatar}</div>
                          }
                        </div>
                        <span style={{fontSize:10,color:"rgba(255,255,255,.55)"}}>{techSite.nom} · <span style={{color:STATUS_TECH[techSite.status]?.color}}>{STATUS_TECH[techSite.status]?.label}</span></span>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* ===== ÉQUIPE ===== */}
          {activeTab==="techs"&&(
            techniciens.filter(t=>!searchQ||t.nom.toLowerCase().includes(searchQ.toLowerCase())).map(tech=>{
              const st = STATUS_TECH[tech.status]||STATUS_TECH.disponible;
              return (
                <div key={tech.id}
                  onClick={()=>{
                    setSelectedTech(tech); setSelected(null);
                    flyToLocation(tech.lat, tech.lng, 14);
                    if(tech.siteLat&&tech.status!=="disponible") {
                      calculateRoute(tech.lat, tech.lng, tech.siteLat, tech.siteLng, tech.id);
                    }
                  }}
                  style={{padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,.04)",cursor:"pointer",background:selectedTech?.id===tech.id?"rgba(59,130,246,.1)":"transparent",transition:"all .12s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.04)"}
                  onMouseLeave={e=>e.currentTarget.style.background=selectedTech?.id===tech.id?"rgba(59,130,246,.1)":"transparent"}>
                  <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
                    <div style={{position:"relative",flexShrink:0}}>
                      <div style={{width:42,height:42,borderRadius:"50%",overflow:"hidden",border:`2.5px solid ${tech.color}`,boxShadow:`0 0 0 2px ${tech.color}30`}}>
                        {PHOTOS[tech.id]
                          ?<img src={PHOTOS[tech.id]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={tech.nom}/>
                          :<div style={{width:"100%",height:"100%",background:tech.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:13,fontWeight:700}}>{tech.avatar}</div>
                        }
                      </div>
                      <div style={{position:"absolute",bottom:-2,right:-2,width:13,height:13,borderRadius:"50%",background:st.color,border:"2px solid #0F172A"}}/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.9)"}}>{tech.nom}</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,.35)",marginTop:1}}>{tech.specialite}</div>
                    </div>
                    <span style={{padding:"2px 7px",borderRadius:10,fontSize:10,fontWeight:600,background:`${st.color}18`,color:st.color,flexShrink:0}}>{st.label}</span>
                  </div>

                  {/* Batterie + signal */}
                  <div style={{display:"flex",gap:6,marginBottom:8}}>
                    <div style={{flex:1,display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.05)",borderRadius:6,padding:"4px 8px"}}>
                      <span style={{fontSize:11}}>🔋</span>
                      <div style={{flex:1,background:"rgba(255,255,255,.08)",borderRadius:2,height:4,overflow:"hidden"}}>
                        <div style={{width:`${tech.battery}%`,height:"100%",background:tech.battery>50?"#10B981":tech.battery>20?"#F59E0B":"#EF4444",borderRadius:2}}/>
                      </div>
                      <span style={{fontSize:10,fontWeight:700,color:tech.battery>50?"#34D399":tech.battery>20?"#FCD34D":"#F87171"}}>{tech.battery}%</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,.05)",borderRadius:6,padding:"4px 8px"}}>
                      <span style={{fontSize:11}}>📶</span>
                      <span style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.6)"}}>{tech.signal}/5</span>
                    </div>
                  </div>

                  {tech.site!=="—"&&(
                    <div style={{fontSize:10,color:"rgba(255,255,255,.35)",marginBottom:6}}>📡 Site: <span style={{color:"rgba(255,255,255,.6)",fontWeight:600}}>{tech.site}</span></div>
                  )}

                  <div style={{display:"flex",gap:6}}>
                    {tech.status==="disponible"&&(
                      <button onClick={e=>{e.stopPropagation();setDispatchTech(tech);setShowDispatch(true);}}
                        style={{flex:1,padding:"6px 8px",borderRadius:6,border:"none",background:"#2563EB",color:"white",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                        ➤ Dispatcher
                      </button>
                    )}
                    <button onClick={e=>{e.stopPropagation();window.open(`tel:${tech.phone}`);}}
                      style={{flex:1,padding:"6px 8px",borderRadius:6,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"rgba(255,255,255,.6)",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                      📞 Appeler
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* ===== MISSIONS ===== */}
          {activeTab==="missions"&&(
            <div>
              <div style={{padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,.06)",fontSize:11,color:"rgba(255,255,255,.4)",fontWeight:600}}>
                {techniciens.filter(t=>t.status!=="disponible"&&t.status!=="hors_ligne").length} missions actives
              </div>
              {techniciens.filter(t=>t.status==="en_mission"||t.status==="en_deplacement").map(tech=>{
                const site = SITES.find(s=>s.code===tech.site);
                return (
                  <div key={tech.id} style={{padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                    <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
                      <div style={{width:34,height:34,borderRadius:"50%",overflow:"hidden",border:`2px solid ${tech.color}`,flexShrink:0}}>
                        {PHOTOS[tech.id]?<img src={PHOTOS[tech.id]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{width:"100%",height:"100%",background:tech.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:11,fontWeight:700}}>{tech.avatar}</div>}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.85)"}}>{tech.nom}</div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>{STATUS_TECH[tech.status]?.label} · {tech.site}</div>
                      </div>
                    </div>
                    {site&&(
                      <>
                        <div style={{fontSize:11,color:"rgba(255,255,255,.5)",marginBottom:6}}>{site.name} · {site.client}</div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{flex:1,background:"rgba(255,255,255,.08)",borderRadius:3,height:5,overflow:"hidden"}}>
                            <div style={{width:`${site.progression}%`,height:"100%",background:`${STATUS_SITES[site.status]?.color||"#3B82F6"}`,borderRadius:3}}/>
                          </div>
                          <span style={{fontSize:10,fontWeight:700,color:STATUS_SITES[site.status]?.color||"#60A5FA"}}>{site.progression}%</span>
                        </div>
                      </>
                    )}
                    {tech.rapport&&<div style={{marginTop:8,fontSize:11,color:"rgba(255,255,255,.4)",fontStyle:"italic"}}>📋 {tech.rapport}</div>}
                    <button onClick={()=>{
                      setSelectedTech(tech);setSelected(null);
                      flyToLocation(tech.lat,tech.lng,14);
                      if(tech.siteLat) calculateRoute(tech.lat,tech.lng,tech.siteLat,tech.siteLng,tech.id);
                    }} style={{marginTop:8,width:"100%",padding:"6px",borderRadius:6,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"rgba(255,255,255,.5)",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                      📍 Voir sur la carte
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* ===== ALERTES ===== */}
          {activeTab==="alertes"&&(
            <div>
              {ALERTES.map(a=>(
                <div key={a.id} style={{padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,.04)",borderLeft:`3px solid ${a.color}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontSize:10,fontWeight:700,color:a.color,letterSpacing:".4px"}}>{a.type}</span>
                    <span style={{fontSize:10,color:"rgba(255,255,255,.25)"}}>{a.time}</span>
                  </div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.65)",lineHeight:1.5,marginBottom:8}}>{a.msg}</div>
                  <button style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${a.color}40`,background:`${a.color}12`,color:a.color,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                    Traiter →
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
            <div style={{width:48,height:48,borderRadius:"50%",border:"3px solid #3B82F6",borderTopColor:"transparent",animation:"spin 1s linear infinite"}}/>
            <div style={{color:"white",fontSize:13,fontWeight:500}}>Chargement carte satellite...</div>
          </div>
        )}

        {loaded&&(
          <>
            {/* Sélecteur fond */}
            <div style={{position:"absolute",top:14,left:14,zIndex:1000,background:"rgba(15,23,42,.92)",backdropFilter:"blur(8px)",borderRadius:10,padding:10,border:"1px solid rgba(255,255,255,.1)"}}>
              <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.3)",marginBottom:7,textTransform:"uppercase",letterSpacing:".6px"}}>Fond de carte</div>
              {LAYERS.map(l=>(
                <button key={l.id} onClick={()=>changeLayer(l.id)}
                  style={{display:"block",width:"100%",padding:"6px 10px",marginBottom:3,borderRadius:6,border:`1px solid ${activeLayer===l.id?"#3B82F6":"rgba(255,255,255,.1)"}`,background:activeLayer===l.id?"#3B82F6":"rgba(255,255,255,.05)",color:activeLayer===l.id?"white":"rgba(255,255,255,.5)",fontSize:11,cursor:"pointer",fontWeight:activeLayer===l.id?600:400,textAlign:"left",fontFamily:"inherit"}}>
                  {l.label}
                </button>
              ))}
            </div>

            {/* Infos route */}
            {(routeInfo||loadingRoute)&&(
              <div style={{position:"absolute",top:14,left:"50%",transform:"translateX(-50%)",zIndex:1000,background:"rgba(15,23,42,.92)",backdropFilter:"blur(8px)",borderRadius:10,padding:"10px 18px",border:"1px solid rgba(59,130,246,.3)",display:"flex",alignItems:"center",gap:16}}>
                {loadingRoute?(
                  <div style={{display:"flex",alignItems:"center",gap:8,color:"rgba(255,255,255,.6)",fontSize:12}}>
                    <div style={{width:14,height:14,borderRadius:"50%",border:"2px solid #3B82F6",borderTopColor:"transparent",animation:"spin 1s linear infinite"}}/>
                    Calcul de l'itinéraire...
                  </div>
                ):(
                  <>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginBottom:2}}>DISTANCE</div>
                      <div style={{fontSize:16,fontWeight:700,color:"#60A5FA"}}>{routeInfo.distance} km</div>
                    </div>
                    <div style={{width:1,height:30,background:"rgba(255,255,255,.1)"}}/>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginBottom:2}}>DURÉE EST.</div>
                      <div style={{fontSize:16,fontWeight:700,color:"#34D399"}}>{routeInfo.duration} min</div>
                    </div>
                    <div style={{width:1,height:30,background:"rgba(255,255,255,.1)"}}/>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginBottom:2}}>ARRIVÉE EST.</div>
                      <div style={{fontSize:14,fontWeight:600,color:"rgba(255,255,255,.7)"}}>
                        {new Date(Date.now()+routeInfo.duration*60000).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Actions rapides */}
            <div style={{position:"absolute",top:14,right:14,zIndex:1000,display:"flex",flexDirection:"column",gap:6}}>
              <button onClick={()=>setShowDispatch(true)}
                style={{display:"flex",alignItems:"center",gap:7,padding:"8px 14px",borderRadius:8,border:"none",background:"#2563EB",color:"white",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 12px rgba(37,99,235,.4)"}}>
                ➤ Dispatcher technicien
              </button>
              <button onClick={()=>setActiveTab("alertes")}
                style={{display:"flex",alignItems:"center",gap:7,padding:"8px 14px",borderRadius:8,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.1)",color:"#F87171",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                🔔 {ALERTES.length} alertes actives
              </button>
            </div>

            {/* Légende */}
            <div style={{position:"absolute",bottom:40,left:14,zIndex:1000,background:"rgba(15,23,42,.92)",backdropFilter:"blur(8px)",borderRadius:10,padding:"10px 14px",border:"1px solid rgba(255,255,255,.08)"}}>
              <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.3)",marginBottom:7,textTransform:"uppercase",letterSpacing:".6px"}}>Sites réseau</div>
              {Object.entries(STATUS_SITES).map(([k,v])=>(
                <div key={k} style={{display:"flex",alignItems:"center",gap:7,marginBottom:4,fontSize:11,color:"rgba(255,255,255,.6)"}}>
                  <div style={{width:10,height:10,borderRadius:2,background:v.color}}/>{v.label}
                </div>
              ))}
              <div style={{height:1,background:"rgba(255,255,255,.08)",margin:"7px 0"}}/>
              <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.3)",marginBottom:7,textTransform:"uppercase",letterSpacing:".6px"}}>Techniciens</div>
              {Object.entries(STATUS_TECH).map(([k,v])=>(
                <div key={k} style={{display:"flex",alignItems:"center",gap:7,marginBottom:4,fontSize:11,color:"rgba(255,255,255,.6)"}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:v.color}}/>{v.label}
                </div>
              ))}
              <div style={{height:1,background:"rgba(255,255,255,.08)",margin:"7px 0"}}/>
              <div style={{display:"flex",alignItems:"center",gap:7,fontSize:11,color:"rgba(255,255,255,.5)"}}>
                <div style={{width:14,height:3,background:"#3B82F6",borderRadius:2}}/> Itinéraire GPS
              </div>
            </div>
          </>
        )}
      </div>

      {/* ===== PANEL DROIT DÉTAIL ===== */}
      {(selected||selectedTech)&&(
        <div style={{width:300,background:"#0F172A",borderLeft:"1px solid rgba(255,255,255,.08)",display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0}}>

          {/* DÉTAIL SITE */}
          {selected&&(()=>{
            const cfg = STATUS_SITES[selected.status]||STATUS_SITES.planifie;
            const techSite = techniciens.find(t=>t.site===selected.code);
            return (
              <>
                <div style={{padding:"16px",background:`linear-gradient(135deg,#0F172A,${cfg.color}44)`,flexShrink:0,borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div>
                      <div style={{fontSize:16,fontWeight:800,color:"white",marginBottom:2}}>{selected.code}</div>
                      <div style={{fontSize:12,color:"rgba(255,255,255,.6)"}}>{selected.name}</div>
                    </div>
                    <button onClick={()=>setSelected(null)} style={{width:26,height:26,borderRadius:"50%",background:"rgba(255,255,255,.1)",border:"none",color:"rgba(255,255,255,.6)",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                  </div>
                  <span style={{padding:"3px 10px",borderRadius:8,background:`${cfg.color}25`,color:cfg.color,fontSize:11,fontWeight:700}}>{cfg.label}</span>
                </div>

                <div style={{flex:1,overflowY:"auto",padding:16}}>
                  {[["Type réseau",selected.type],["Client",selected.client],["Projet",selected.projet],["Budget",`${selected.budget}M FCFA`],["GPS",`${selected.lat.toFixed(4)}°N, ${selected.lng.toFixed(4)}°E`]].map(([l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                      <span style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>{l}</span>
                      <span style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.8)",textAlign:"right",maxWidth:160}}>{v}</span>
                    </div>
                  ))}

                  <div style={{marginTop:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"rgba(255,255,255,.4)",marginBottom:6}}>
                      <span>Progression</span>
                      <span style={{fontWeight:700,color:cfg.color}}>{selected.progression}%</span>
                    </div>
                    <div style={{background:"rgba(255,255,255,.08)",borderRadius:6,height:10,overflow:"hidden"}}>
                      <div style={{width:`${selected.progression}%`,height:"100%",background:cfg.color,borderRadius:6,position:"relative"}}>
                        <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent)",animation:"shimmer 2s infinite"}}/>
                      </div>
                    </div>
                  </div>

                  {techSite?(
                    <div style={{marginTop:16,padding:14,borderRadius:10,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)"}}>
                      <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.35)",marginBottom:10,textTransform:"uppercase",letterSpacing:".4px"}}>Technicien sur site</div>
                      <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:10}}>
                        <div style={{width:44,height:44,borderRadius:"50%",overflow:"hidden",border:`2.5px solid ${techSite.color}`,flexShrink:0}}>
                          {PHOTOS[techSite.id]?<img src={PHOTOS[techSite.id]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{width:"100%",height:"100%",background:techSite.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:13,fontWeight:700}}>{techSite.avatar}</div>}
                        </div>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.9)"}}>{techSite.nom}</div>
                          <div style={{fontSize:10,color:STATUS_TECH[techSite.status]?.color,fontWeight:600}}>{STATUS_TECH[techSite.status]?.label}</div>
                          <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:2}}>🔋 {techSite.battery}% · 📶 {techSite.signal}/5</div>
                        </div>
                      </div>
                      {techSite.rapport&&<div style={{fontSize:11,color:"rgba(255,255,255,.5)",background:"rgba(255,255,255,.04)",padding:"8px 10px",borderRadius:6,lineHeight:1.5}}>📋 {techSite.rapport}</div>}
                      <div style={{display:"flex",gap:8,marginTop:10}}>
                        <button onClick={()=>window.open(`tel:${techSite.phone}`)} style={{flex:1,padding:"7px",borderRadius:6,border:"none",background:techSite.color,color:"white",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>📞 Appeler</button>
                        <button onClick={()=>{setSelectedTech(techSite);setSelected(null);flyToLocation(techSite.lat,techSite.lng,15);if(techSite.siteLat)calculateRoute(techSite.lat,techSite.lng,techSite.siteLat,techSite.siteLng,techSite.id);}}
                          style={{flex:1,padding:"7px",borderRadius:6,border:`1px solid ${techSite.color}`,background:"transparent",color:techSite.color,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>📍 Trajet</button>
                      </div>
                    </div>
                  ):(
                    <div style={{marginTop:16,padding:14,borderRadius:10,background:"rgba(255,255,255,.03)",border:"1px dashed rgba(255,255,255,.1)"}}>
                      <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginBottom:10,textAlign:"center"}}>Aucun technicien assigné</div>
                      <button onClick={()=>{setDispatchSite(selected);setShowDispatch(true);}}
                        style={{width:"100%",padding:"8px",borderRadius:8,border:"none",background:"#2563EB",color:"white",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                        ➤ Dispatcher un technicien
                      </button>
                    </div>
                  )}
                </div>
              </>
            );
          })()}

          {/* DÉTAIL TECHNICIEN */}
          {selectedTech&&!selected&&(()=>{
            const st = STATUS_TECH[selectedTech.status]||STATUS_TECH.disponible;
            const siteTech = SITES.find(s=>s.code===selectedTech.site);
            return (
              <>
                <div style={{padding:"16px",background:`linear-gradient(135deg,#0F172A,${selectedTech.color}44)`,flexShrink:0,borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{display:"flex",gap:12,alignItems:"center"}}>
                      <div style={{width:54,height:54,borderRadius:"50%",overflow:"hidden",border:`3px solid ${selectedTech.color}`,boxShadow:`0 0 0 3px ${selectedTech.color}30`,flexShrink:0}}>
                        {PHOTOS[selectedTech.id]?<img src={PHOTOS[selectedTech.id]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{width:"100%",height:"100%",background:selectedTech.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:16,fontWeight:700}}>{selectedTech.avatar}</div>}
                      </div>
                      <div>
                        <div style={{fontSize:15,fontWeight:800,color:"white",marginBottom:2}}>{selectedTech.nom}</div>
                        <div style={{fontSize:11,color:"rgba(255,255,255,.5)"}}>{selectedTech.specialite}</div>
                        <span style={{display:"inline-block",marginTop:5,padding:"2px 8px",borderRadius:8,background:`${st.color}20`,color:st.color,fontSize:10,fontWeight:700}}>{st.label}</span>
                      </div>
                    </div>
                    <button onClick={()=>{setSelectedTech(null);setRouteInfo(null);Object.values(routeLayersRef.current).forEach(l=>mapInstanceRef.current?.removeLayer(l));routeLayersRef.current={};}}
                      style={{width:26,height:26,borderRadius:"50%",background:"rgba(255,255,255,.1)",border:"none",color:"rgba(255,255,255,.6)",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
                  </div>
                </div>

                <div style={{flex:1,overflowY:"auto",padding:16}}>
                  {/* Métriques live */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
                    {[{l:"Batterie",v:`${selectedTech.battery}%`,c:selectedTech.battery>50?"#34D399":selectedTech.battery>20?"#FCD34D":"#F87171"},{l:"Signal",v:`${selectedTech.signal}/5`,c:"#60A5FA"},{l:"Tâches",v:selectedTech.taches,c:"#A78BFA"}].map(m=>(
                      <div key={m.l} style={{background:"rgba(255,255,255,.05)",borderRadius:8,padding:"10px 8px",textAlign:"center",border:"1px solid rgba(255,255,255,.06)"}}>
                        <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginBottom:4,textTransform:"uppercase",letterSpacing:".3px"}}>{m.l}</div>
                        <div style={{fontSize:16,fontWeight:700,color:m.c}}>{m.v}</div>
                      </div>
                    ))}
                  </div>

                  {[["Matricule",selectedTech.matricule],["Téléphone",selectedTech.phone],["Site actuel",selectedTech.site],["Début de mission",selectedTech.heureDebut],["Mise à jour",selectedTech.lastUpdate]].map(([l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                      <span style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>{l}</span>
                      <span style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.75)",textAlign:"right",maxWidth:160}}>{v}</span>
                    </div>
                  ))}

                  {selectedTech.rapport&&(
                    <div style={{marginTop:14,padding:"10px 12px",background:"rgba(16,185,129,.08)",borderRadius:8,border:"1px solid rgba(16,185,129,.2)"}}>
                      <div style={{fontSize:10,fontWeight:700,color:"#34D399",marginBottom:6,textTransform:"uppercase",letterSpacing:".4px"}}>Dernier rapport</div>
                      <div style={{fontSize:12,color:"rgba(255,255,255,.65)",lineHeight:1.6}}>{selectedTech.rapport}</div>
                    </div>
                  )}

                  {siteTech&&(
                    <div style={{marginTop:14,padding:12,borderRadius:10,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)"}}>
                      <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.3)",marginBottom:8,textTransform:"uppercase"}}>Site assigné</div>
                      <div style={{fontSize:12,fontWeight:600,color:STATUS_SITES[siteTech.status]?.color}}>{siteTech.code} · {siteTech.name}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:3}}>{siteTech.client} · {siteTech.progression}% avancement</div>
                    </div>
                  )}

                  {routeInfo&&(
                    <div style={{marginTop:14,padding:12,borderRadius:10,background:"rgba(59,130,246,.08)",border:"1px solid rgba(59,130,246,.2)"}}>
                      <div style={{fontSize:10,fontWeight:700,color:"#60A5FA",marginBottom:8,textTransform:"uppercase",letterSpacing:".4px"}}>Itinéraire GPS calculé</div>
                      <div style={{display:"flex",justifyContent:"space-around"}}>
                        <div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:700,color:"#60A5FA"}}>{routeInfo.distance} km</div><div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>Distance</div></div>
                        <div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:700,color:"#34D399"}}>{routeInfo.duration} min</div><div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>Durée est.</div></div>
                      </div>
                    </div>
                  )}

                  <div style={{display:"flex",gap:8,marginTop:16}}>
                    <button onClick={()=>window.open(`tel:${selectedTech.phone}`)} style={{flex:1,padding:"9px",borderRadius:8,border:"none",background:selectedTech.color,color:"white",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>📞 Appeler</button>
                    {selectedTech.siteLat&&(
                      <button onClick={()=>calculateRoute(selectedTech.lat,selectedTech.lng,selectedTech.siteLat,selectedTech.siteLng,selectedTech.id)}
                        style={{flex:1,padding:"9px",borderRadius:8,border:"1px solid rgba(59,130,246,.3)",background:"rgba(59,130,246,.1)",color:"#60A5FA",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>
                        🗺 Calculer trajet
                      </button>
                    )}
                  </div>
                  {selectedTech.status==="disponible"&&(
                    <button onClick={()=>{setDispatchTech(selectedTech);setShowDispatch(true);}}
                      style={{width:"100%",marginTop:8,padding:"9px",borderRadius:8,border:"none",background:"#059669",color:"white",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit"}}>
                      ➤ Dispatcher ce technicien
                    </button>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ===== MODAL DISPATCH ===== */}
      {showDispatch&&(
        <div style={{position:"fixed",inset:0,zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div onClick={()=>{setShowDispatch(false);setDispatchTech(null);setDispatchSite(null);}} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.6)",backdropFilter:"blur(6px)"}}/>
          <div style={{position:"relative",background:"#0F172A",borderRadius:14,width:"100%",maxWidth:500,maxHeight:"90vh",overflow:"auto",boxShadow:"0 24px 80px rgba(0,0,0,.5)",border:"1px solid rgba(255,255,255,.08)"}}>
            <div style={{padding:"16px 20px",background:"linear-gradient(135deg,#1E293B,#2563EB44)",borderBottom:"1px solid rgba(255,255,255,.08)",display:"flex",justifyContent:"space-between",alignItems:"center",borderRadius:"14px 14px 0 0"}}>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:"white"}}>➤ Dispatch Technicien</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:2}}>Assigner un technicien à un chantier</div>
              </div>
              <button onClick={()=>{setShowDispatch(false);setDispatchTech(null);setDispatchSite(null);}} style={{width:30,height:30,borderRadius:"50%",background:"rgba(255,255,255,.08)",border:"none",color:"rgba(255,255,255,.6)",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>

            <div style={{padding:"16px 20px"}}>
              <div style={{marginBottom:16}}>
                <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.35)",marginBottom:10,textTransform:"uppercase",letterSpacing:".5px"}}>Sélectionner un technicien</div>
                {techniciens.filter(t=>t.status==="disponible"||t.status==="en_deplacement").map(t=>(
                  <div key={t.id} onClick={()=>setDispatchTech(t)}
                    style={{display:"flex",alignItems:"center",gap:12,padding:"12px",borderRadius:10,border:`2px solid ${dispatchTech?.id===t.id?t.color:"rgba(255,255,255,.08)"}`,cursor:"pointer",background:dispatchTech?.id===t.id?`${t.color}10`:"rgba(255,255,255,.03)",marginBottom:8,transition:"all .12s"}}>
                    <div style={{width:40,height:40,borderRadius:"50%",overflow:"hidden",border:`2px solid ${t.color}`,flexShrink:0}}>
                      {PHOTOS[t.id]?<img src={PHOTOS[t.id]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{width:"100%",height:"100%",background:t.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:12}}>{t.avatar}</div>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.85)"}}>{t.nom}</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>{t.specialite}</div>
                    </div>
                    <span style={{padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600,background:`${STATUS_TECH[t.status]?.color}18`,color:STATUS_TECH[t.status]?.color}}>{STATUS_TECH[t.status]?.label}</span>
                  </div>
                ))}
              </div>

              <div style={{marginBottom:16}}>
                <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.35)",marginBottom:10,textTransform:"uppercase",letterSpacing:".5px"}}>Sélectionner un site</div>
                {SITES.filter(s=>!["termine","livre"].includes(s.status)).map(s=>{
                  const cfg = STATUS_SITES[s.status];
                  return (
                    <div key={s.code} onClick={()=>setDispatchSite(s)}
                      style={{display:"flex",alignItems:"center",gap:12,padding:"12px",borderRadius:10,border:`2px solid ${dispatchSite?.code===s.code?cfg.color:"rgba(255,255,255,.08)"}`,cursor:"pointer",background:dispatchSite?.code===s.code?`${cfg.color}10`:"rgba(255,255,255,.03)",marginBottom:8,transition:"all .12s"}}>
                      <div style={{width:40,height:40,borderRadius:8,background:cfg.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:11,flexShrink:0}}>
                        {s.type.includes("5G")?"5G":s.type.includes("4G")?"4G":"3G"}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.85)"}}>{s.code} · {s.name}</div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>{s.client} · {s.progression}%</div>
                      </div>
                      <span style={{padding:"2px 8px",borderRadius:10,fontSize:10,fontWeight:600,background:`${cfg.color}18`,color:cfg.color}}>{cfg.label}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>{setShowDispatch(false);setDispatchTech(null);setDispatchSite(null);}}
                  style={{flex:1,padding:"11px",borderRadius:8,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"rgba(255,255,255,.5)",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                  Annuler
                </button>
                <button onClick={doDispatch} disabled={!dispatchTech||!dispatchSite}
                  style={{flex:2,padding:"11px",borderRadius:8,border:"none",background:dispatchTech&&dispatchSite?"#2563EB":"rgba(255,255,255,.08)",color:dispatchTech&&dispatchSite?"white":"rgba(255,255,255,.25)",fontSize:13,fontWeight:700,cursor:dispatchTech&&dispatchSite?"pointer":"not-allowed",fontFamily:"inherit"}}>
                  ➤ Confirmer le dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulseLive{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes pulseMarker{0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,.5)}70%{box-shadow:0 0 0 8px rgba(37,99,235,0)}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
        .leaflet-popup-content-wrapper{border-radius:12px!important;box-shadow:0 8px 32px rgba(0,0,0,.3)!important;background:#1E293B!important;color:white!important;}
        .leaflet-popup-content{margin:12px 14px!important;}
        .leaflet-popup-tip{background:#1E293B!important;}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px}
      `}</style>
    </div>
  );
}
