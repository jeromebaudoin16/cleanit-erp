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
  {id:"EE001",nom:"Thomas Ngono",lat:4.0580,lng:9.7150,status:"en_mission",site:"DLA-001",siteLat:4.0511,siteLng:9.7085,phone:"+237 677 100 001",avatar:"TN",color:"#2563EB",matricule:"CLN-EXT-001",specialite:"5G NR / 4G LTE",battery:78,signal:4,lastUpdate:"À l'instant",taches:3,rapport:"Câblage RRU terminé. Test en cours.",heureDebut:"07:30"},
  {id:"EE002",nom:"Jean Mbarga",lat:3.8600,lng:11.5100,status:"en_mission",site:"YDE-001",siteLat:3.8480,siteLng:11.5021,phone:"+237 677 100 002",avatar:"JM",color:"#7C3AED",matricule:"CLN-EXT-002",specialite:"Survey RF",battery:92,signal:5,lastUpdate:"À l'instant",taches:2,rapport:"Installation antenne BBU terminée.",heureDebut:"08:00"},
  {id:"EE003",nom:"Samuel Djomo",lat:4.0300,lng:9.1800,status:"en_deplacement",site:"LIM-001",siteLat:4.0167,siteLng:9.2000,phone:"+237 677 100 003",avatar:"SD",color:"#059669",matricule:"CLN-EXT-003",specialite:"3G UMTS / 4G LTE",battery:45,signal:3,lastUpdate:"Il y a 3 min",taches:1,rapport:"En route vers site Limbé.",heureDebut:"09:15"},
  {id:"EE004",nom:"Ali Moussa",lat:9.2800,lng:13.4100,status:"en_mission",site:"GAR-001",siteLat:9.3019,siteLng:13.3920,phone:"+237 677 100 004",avatar:"AM",color:"#D97706",matricule:"CLN-EXT-004",specialite:"Supervision HSE",battery:63,signal:2,lastUpdate:"Il y a 5 min",taches:4,rapport:"Vérification sécurité pylône terminée.",heureDebut:"06:45"},
  {id:"EE005",nom:"René Talla",lat:4.0400,lng:9.6800,status:"disponible",site:"—",siteLat:null,siteLng:null,phone:"+237 677 100 005",avatar:"RT",color:"#DB2777",matricule:"CLN-EXT-005",specialite:"Fibre optique",battery:100,signal:5,lastUpdate:"En ligne",taches:0,rapport:"",heureDebut:"—"},
];

const STATUS_SITES = {
  planifie: {color:"#7C3AED",bg:"#EDE9FE",label:"Planifié"},
  en_cours: {color:"#2563EB",bg:"#DBEAFE",label:"En cours"},
  termine:  {color:"#059669",bg:"#D1FAE5",label:"Terminé"},
  livre:    {color:"#059669",bg:"#D1FAE5",label:"Livré"},
  en_retard:{color:"#DC2626",bg:"#FEE2E2",label:"En retard"},
};

const STATUS_TECH = {
  en_mission:    {color:"#2563EB",label:"En mission",bg:"#EFF6FF"},
  en_deplacement:{color:"#D97706",label:"En déplacement",bg:"#FEFCE8"},
  disponible:    {color:"#059669",label:"Disponible",bg:"#F0FDF4"},
  hors_ligne:    {color:"#94A3B8",label:"Hors ligne",bg:"#F8FAFC"},
};

const ALERTES = [
  {id:"A001",type:"RETARD",color:"#DC2626",msg:"DLA-003 en retard. Aucun technicien assigné.",time:"14:23"},
  {id:"A002",type:"BATTERIE",color:"#D97706",msg:"Batterie faible (45%) — Samuel Djomo",time:"14:30"},
  {id:"A003",type:"SIGNAL",color:"#D97706",msg:"Signal faible zone Garoua — Ali Moussa",time:"14:38"},
  {id:"A004",type:"DISPO",color:"#059669",msg:"René Talla disponible — Peut être dispatché",time:"14:40"},
];

// Styles Maptiler disponibles
const MAP_STYLES = [
  {id:"satellite",label:"Satellite HD",url:`https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_KEY}`},
  {id:"hybrid",label:"Hybride",url:`https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`},
  {id:"streets",label:"Standard",url:`https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`},
  {id:"topo",label:"Topographique",url:`https://api.maptiler.com/maps/topo/style.json?key=${MAPTILER_KEY}`},
  {id:"outdoor",label:"Terrain",url:`https://api.maptiler.com/maps/outdoor/style.json?key=${MAPTILER_KEY}`},
];

export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const techMarkersRef = useRef({});
  const routeLayerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedTech, setSelectedTech] = useState(null);
  const [techniciens, setTechniciens] = useState(TECHNICIENS_INIT);
  const [activeStyle, setActiveStyle] = useState("satellite");
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
  const [is3D, setIs3D] = useState(false);
  const [showCesium, setShowCesium] = useState(false);

  // GPS Live simulation
  useEffect(() => {
    if(!liveMode) return;
    const interval = setInterval(() => {
      setTechniciens(prev => prev.map(t => {
        if(t.status==="en_mission") return {...t, lat:t.lat+((Math.random()-0.5)*0.0002), lng:t.lng+((Math.random()-0.5)*0.0002), lastUpdate:"À l'instant"};
        if(t.status==="en_deplacement"&&t.siteLat) {
          const dLat=(t.siteLat-t.lat)*0.04;
          const dLng=(t.siteLng-t.lng)*0.04;
          return {...t, lat:t.lat+dLat, lng:t.lng+dLng, lastUpdate:"À l'instant"};
        }
        return t;
      }));
      setLastRefresh(new Date());
    }, 4000);
    return () => clearInterval(interval);
  }, [liveMode]);

  // Update marker positions
  useEffect(() => {
    if(!mapInstanceRef.current||!window.maplibregl) return;
    techniciens.forEach(tech => {
      const marker = techMarkersRef.current[tech.id];
      if(marker) marker.setLngLat([tech.lng, tech.lat]);
    });
  }, [techniciens]);

  // Load MapLibre GL (compatible Maptiler, gratuit)
  useEffect(() => {
    const loadLibs = async () => {
      if(!document.getElementById("maplibre-css")) {
        const link = document.createElement("link");
        link.id="maplibre-css"; link.rel="stylesheet";
        link.href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css";
        document.head.appendChild(link);
      }
      if(!window.maplibregl) {
        await new Promise((res,rej)=>{
          const s=document.createElement("script");
          s.src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js";
          s.onload=res; s.onerror=rej;
          document.head.appendChild(s);
        });
      }
      setLoaded(true);
    };
    loadLibs();
    return () => {
      if(mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current=null; }
    };
  }, []);

  // Init map
  useEffect(() => {
    if(!loaded||!mapRef.current||mapInstanceRef.current) return;
    const ml = window.maplibregl;

    const map = new ml.Map({
      container: mapRef.current,
      style: MAP_STYLES[0].url,
      center: [12.0, 5.5],
      zoom: 6,
      pitch: 0,
      bearing: 0,
      antialias: true,
    });

    // Navigation control (rotation, zoom, tilt)
    map.addControl(new ml.NavigationControl({visualizePitch:true}), "bottom-right");
    // Fullscreen
    map.addControl(new ml.FullscreenControl(), "bottom-right");
    // Geolocate
    map.addControl(new ml.GeolocateControl({
      positionOptions:{enableHighAccuracy:true},
      trackUserLocation:true,
      showUserHeading:true,
    }), "bottom-right");
    // Scale
    map.addControl(new ml.ScaleControl({unit:"metric"}), "bottom-left");

    map.on("load", () => {
      // Ajouter terrain 3D Maptiler
      map.addSource("terrain", {
        type:"raster-dem",
        url:`https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=${MAPTILER_KEY}`,
        tileSize:256,
      });
      map.setTerrain({source:"terrain", exaggeration:1.5});

      // Ajouter couche ciel
      map.setSky({
        "sky-color":"#199EF3",
        "sky-horizon-blend":0.5,
        "horizon-color":"#ffffff",
        "horizon-fog-blend":0.5,
        "fog-color":"#0000ff",
        "fog-ground-blend":0.5,
      });

      // Route source (vide au départ)
      map.addSource("route", {type:"geojson", data:{type:"FeatureCollection",features:[]}});
      map.addLayer({
        id:"route-line",
        type:"line",
        source:"route",
        layout:{"line-join":"round","line-cap":"round"},
        paint:{"line-color":"#3B82F6","line-width":5,"line-opacity":0.9},
      });
      map.addLayer({
        id:"route-line-deco",
        type:"line",
        source:"route",
        layout:{"line-join":"round","line-cap":"round"},
        paint:{"line-color":"white","line-width":2,"line-opacity":0.5,"line-dasharray":[0,4,3]},
      });

      // Marqueurs Sites
      SITES.forEach(site => {
        const cfg = STATUS_SITES[site.status]||STATUS_SITES.planifie;
        const el = document.createElement("div");
        el.innerHTML = `
          <div style="position:relative;width:58px;height:70px;cursor:pointer">
            <div style="width:58px;height:58px;border-radius:14px;background:${cfg.color};border:3px solid white;box-shadow:0 6px 20px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;flex-direction:column;position:relative">
              <span style="color:white;font-weight:900;font-size:13px;line-height:1">${site.type.includes("5G")?"5G":site.type.includes("4G")?"4G":"3G"}</span>
              <span style="color:rgba(255,255,255,.8);font-size:8px;font-weight:700;margin-top:1px">${site.code}</span>
              <div style="position:absolute;bottom:0;left:0;right:0;height:5px;background:rgba(255,255,255,.2);border-radius:0 0 4px 4px;overflow:hidden">
                <div style="height:100%;width:${site.progression}%;background:rgba(255,255,255,.8)"></div>
              </div>
              ${site.status==="en_retard"?`<div style="position:absolute;top:-5px;right:-5px;width:17px;height:17px;border-radius:50%;background:#DC2626;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:10px;color:white;font-weight:700">!</div>`:""}
            </div>
            <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-top:14px solid ${cfg.color}"></div>
            <div style="position:absolute;top:-26px;left:50%;transform:translateX(-50%);background:rgba(10,14,26,.88);color:white;font-size:10px;font-weight:700;padding:3px 8px;border-radius:10px;white-space:nowrap;backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,.1)">${site.name.length>16?site.name.slice(0,16)+"...":site.name}</div>
          </div>`;
        el.style.cssText="background:transparent;border:none;";
        el.addEventListener("click", () => {
          setSelected(site); setSelectedTech(null);
          map.flyTo({center:[site.lng,site.lat],zoom:17,pitch:45,bearing:Math.random()*60-30,duration:2000,essential:true});
          clearRoute(map);
          setRouteInfo(null);
        });
        const marker = new ml.Marker({element:el,anchor:"bottom"}).setLngLat([site.lng,site.lat]).addTo(map);
        markersRef.current[site.code] = marker;
      });

      // Marqueurs Techniciens avec photos
      TECHNICIENS_INIT.forEach(tech => {
        const st = STATUS_TECH[tech.status]||STATUS_TECH.disponible;
        const photo = PHOTOS[tech.id];
        const el = document.createElement("div");
        el.innerHTML = `
          <div style="position:relative;width:56px;height:68px;cursor:pointer">
            <div style="width:56px;height:56px;border-radius:50%;overflow:hidden;border:3px solid ${tech.color};box-shadow:0 6px 20px rgba(0,0,0,0.35);position:relative">
              ${photo
                ?`<img src="${photo}" style="width:100%;height:100%;object-fit:cover" onerror="this.parentNode.style.background='${tech.color}';this.style.display='none'"/>`
                :`<div style="width:100%;height:100%;background:${tech.color};display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:15px">${tech.avatar}</div>`
              }
              <div style="position:absolute;bottom:2px;right:2px;width:14px;height:14px;border-radius:50%;background:${st.color};border:2px solid white;${tech.status==="en_mission"?"animation:pulseGPS 1.5s infinite":""}"></div>
            </div>
            <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:13px solid ${tech.color}"></div>
            <div style="position:absolute;top:-26px;left:50%;transform:translateX(-50%);background:${tech.color};color:white;font-size:10px;font-weight:700;padding:3px 9px;border-radius:10px;white-space:nowrap;box-shadow:0 3px 8px rgba(0,0,0,.3)">${tech.nom.split(" ")[0]}</div>
          </div>`;
        el.style.cssText="background:transparent;border:none;";
        el.addEventListener("click", () => {
          setSelectedTech(tech); setSelected(null);
          map.flyTo({center:[tech.lng,tech.lat],zoom:17,pitch:60,bearing:Math.random()*60-30,duration:2000,essential:true});
          if(tech.siteLat&&tech.status!=="disponible") {
            calculateRoute(map, tech.lat, tech.lng, tech.siteLat, tech.siteLng, tech.id);
          } else {
            clearRoute(map); setRouteInfo(null);
          }
        });
        const marker = new ml.Marker({element:el,anchor:"bottom"}).setLngLat([tech.lng,tech.lat]).addTo(map);
        techMarkersRef.current[tech.id] = marker;
      });
    });

    mapInstanceRef.current = map;
  }, [loaded]);

  const clearRoute = (map) => {
    if(!map) return;
    try {
      const src = map.getSource("route");
      if(src) src.setData({type:"FeatureCollection",features:[]});
    } catch(e){}
  };

  const calculateRoute = useCallback(async (map, fromLat, fromLng, toLat, toLng, techId) => {
    setLoadingRoute(true); setRouteInfo(null);
    clearRoute(map);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
      const resp = await fetch(url);
      const data = await resp.json();
      if(data.code==="Ok"&&data.routes[0]) {
        const route = data.routes[0];
        const dist = (route.distance/1000).toFixed(1);
        const dur = Math.round(route.duration/60);
        setRouteInfo({distance:dist, duration:dur});
        // Afficher route sur carte MapLibre
        const src = map.getSource("route");
        if(src) {
          src.setData({
            type:"FeatureCollection",
            features:[{type:"Feature",geometry:route.geometry}]
          });
          // Fit bounds sur le trajet
          const coords = route.geometry.coordinates;
          const bounds = coords.reduce((b,c)=>b.extend(c), new window.maplibregl.LngLatBounds(coords[0],coords[0]));
          map.fitBounds(bounds, {padding:80,duration:2000,pitch:45});
        }
      }
    } catch(e) {
      // Fallback ligne droite
      const src = map?.getSource("route");
      if(src) src.setData({type:"FeatureCollection",features:[{type:"Feature",geometry:{type:"LineString",coordinates:[[fromLng,fromLat],[toLng,toLat]]}}]});
      setRouteInfo({distance:"~",duration:"~"});
    }
    setLoadingRoute(false);
  }, []);

  const toggle3D = () => {
    const map = mapInstanceRef.current;
    if(!map) return;
    if(!is3D) {
      map.easeTo({pitch:60, bearing:-20, duration:1000});
    } else {
      map.easeTo({pitch:0, bearing:0, duration:1000});
    }
    setIs3D(!is3D);
  };

  const changeStyle = (styleId) => {
    const map = mapInstanceRef.current;
    if(!map) return;
    const style = MAP_STYLES.find(s=>s.id===styleId);
    if(!style) return;
    setActiveStyle(styleId);
    map.setStyle(style.url);
    // Re-ajouter les sources après changement de style
    map.once("styledata", () => {
      try {
        if(!map.getSource("terrain")) {
          map.addSource("terrain", {type:"raster-dem",url:`https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=${MAPTILER_KEY}`,tileSize:256});
          map.setTerrain({source:"terrain",exaggeration:1.5});
        }
        if(!map.getSource("route")) {
          map.addSource("route",{type:"geojson",data:{type:"FeatureCollection",features:[]}});
          map.addLayer({id:"route-line",type:"line",source:"route",layout:{"line-join":"round","line-cap":"round"},paint:{"line-color":"#3B82F6","line-width":5,"line-opacity":.9}});
          map.addLayer({id:"route-line-deco",type:"line",source:"route",layout:{"line-join":"round","line-cap":"round"},paint:{"line-color":"white","line-width":2,"line-opacity":.5,"line-dasharray":[0,4,3]}});
        }
      } catch(e){}
    });
  };

  const flyToLocation = (lng, lat, zoom=17) => {
    mapInstanceRef.current?.flyTo({center:[lng,lat],zoom,pitch:55,bearing:Math.random()*40-20,duration:2000,essential:true});
  };

  const doDispatch = () => {
    if(!dispatchTech||!dispatchSite) return;
    const site = SITES.find(s=>s.code===dispatchSite.code);
    setTechniciens(prev=>prev.map(t=>t.id===dispatchTech.id?{...t,status:"en_deplacement",site:dispatchSite.code,siteLat:site?.lat,siteLng:site?.lng}:t));
    if(mapInstanceRef.current&&site) {
      calculateRoute(mapInstanceRef.current, dispatchTech.lat, dispatchTech.lng, site.lat, site.lng, dispatchTech.id);
    }
    setShowDispatch(false); setDispatchTech(null); setDispatchSite(null);
  };

  const filteredSites = SITES.filter(s=>{
    const mf=filter==="tous"||s.status===filter;
    const mq=!searchQ||s.code.toLowerCase().includes(searchQ.toLowerCase())||s.name.toLowerCase().includes(searchQ.toLowerCase());
    return mf&&mq;
  });

  return (
    <div style={{display:"flex",height:"calc(100vh - 56px)",overflow:"hidden",fontFamily:"'Segoe UI',Arial,sans-serif",background:"#0A0E1A"}}>

      {/* ===== PANEL GAUCHE ===== */}
      <div style={{width:300,background:"#0D1117",display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0,zIndex:10,borderRight:"1px solid rgba(255,255,255,.07)"}}>

        {/* Header */}
        <div style={{padding:"14px 16px",background:"linear-gradient(135deg,#0D1117 0%,#1a2744 100%)",flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div>
              <div style={{fontSize:14,fontWeight:800,color:"white",letterSpacing:".3px"}}>🛰 Digital Twin</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.35)",marginTop:1}}>{lastRefresh.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</div>
            </div>
            <button onClick={()=>setLiveMode(!liveMode)} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:20,border:"none",background:liveMode?"rgba(16,185,129,.12)":"rgba(255,255,255,.06)",color:liveMode?"#34D399":"rgba(255,255,255,.3)",fontSize:10,fontWeight:700,cursor:"pointer"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:liveMode?"#34D399":"#475569",animation:liveMode?"pulseLive 1.5s infinite":"none"}}/>
              {liveMode?"LIVE":"PAUSE"}
            </button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5}}>
            {[{l:"Sites",v:SITES.length,c:"#60A5FA"},{l:"Mission",v:techniciens.filter(t=>t.status==="en_mission").length,c:"#34D399"},{l:"Dispo",v:techniciens.filter(t=>t.status==="disponible").length,c:"#A78BFA"},{l:"Alertes",v:ALERTES.length,c:"#F87171"}].map(s=>(
              <div key={s.l} style={{background:"rgba(255,255,255,.05)",borderRadius:7,padding:"7px 4px",textAlign:"center",border:"1px solid rgba(255,255,255,.04)"}}>
                <div style={{fontSize:17,fontWeight:800,color:s.c}}>{s.v}</div>
                <div style={{fontSize:8,color:"rgba(255,255,255,.3)",marginTop:1}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",background:"rgba(255,255,255,.03)",borderBottom:"1px solid rgba(255,255,255,.06)",flexShrink:0}}>
          {[{id:"sites",l:"Sites"},{id:"techs",l:"Équipe"},{id:"missions",l:"Missions"},{id:"alertes",l:"⚠",badge:ALERTES.length}].map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{flex:1,padding:"9px 4px",border:"none",borderBottom:`2px solid ${activeTab===t.id?"#3B82F6":"transparent"}`,background:"transparent",color:activeTab===t.id?"#60A5FA":"rgba(255,255,255,.3)",fontSize:11,fontWeight:activeTab===t.id?700:400,cursor:"pointer",fontFamily:"inherit",position:"relative"}}>
              {t.l}
              {t.badge&&<span style={{position:"absolute",top:3,right:3,width:13,height:13,borderRadius:"50%",background:"#EF4444",color:"white",fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{t.badge}</span>}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{padding:"8px 10px",borderBottom:"1px solid rgba(255,255,255,.05)",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:7,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.07)",borderRadius:7,padding:"6px 10px"}}>
            <span style={{fontSize:12,opacity:.4}}>🔍</span>
            <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Rechercher..."
              style={{border:"none",outline:"none",background:"transparent",fontSize:12,flex:1,fontFamily:"inherit",color:"white"}}/>
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto"}}>

          {/* SITES */}
          {activeTab==="sites"&&(<>
            <div style={{padding:"7px 10px",borderBottom:"1px solid rgba(255,255,255,.05)",display:"flex",gap:4,flexWrap:"wrap"}}>
              {[{v:"tous",l:"Tous"},...Object.entries(STATUS_SITES).map(([k,v])=>({v:k,l:v.label,c:v.color}))].map(f=>(
                <button key={f.v} onClick={()=>setFilter(f.v)}
                  style={{padding:"2px 7px",borderRadius:5,border:`1px solid ${filter===f.v?(f.c||"#3B82F6"):"rgba(255,255,255,.08)"}`,background:filter===f.v?`${f.c||"#3B82F6"}15`:"transparent",color:filter===f.v?(f.c||"#60A5FA"):"rgba(255,255,255,.35)",fontSize:10,cursor:"pointer",fontWeight:filter===f.v?700:400}}>
                  {f.l}
                </button>
              ))}
            </div>
            {filteredSites.map(site=>{
              const cfg=STATUS_SITES[site.status]||STATUS_SITES.planifie;
              const techSite=techniciens.find(t=>t.site===site.code);
              return (
                <div key={site.code}
                  onClick={()=>{setSelected(site);setSelectedTech(null);flyToLocation(site.lng,site.lat,17);clearRoute(mapInstanceRef.current);setRouteInfo(null);}}
                  style={{padding:"11px 12px",borderBottom:"1px solid rgba(255,255,255,.04)",cursor:"pointer",background:selected?.code===site.code?"rgba(59,130,246,.08)":"transparent",borderLeft:`3px solid ${selected?.code===site.code?cfg.color:"transparent"}`,transition:"all .12s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.03)"}
                  onMouseLeave={e=>e.currentTarget.style.background=selected?.code===site.code?"rgba(59,130,246,.08)":"transparent"}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:11,fontWeight:700,color:cfg.color}}>{site.code}</span>
                    <span style={{padding:"1px 6px",borderRadius:5,fontSize:9,fontWeight:700,background:`${cfg.color}20`,color:cfg.color}}>{cfg.label}</span>
                  </div>
                  <div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.8)",marginBottom:2}}>{site.name}</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginBottom:5}}>📡 {site.type} · {site.client}</div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{flex:1,background:"rgba(255,255,255,.07)",borderRadius:3,height:4,overflow:"hidden"}}>
                      <div style={{width:`${site.progression}%`,height:"100%",background:cfg.color,borderRadius:3}}/>
                    </div>
                    <span style={{fontSize:10,fontWeight:700,color:cfg.color}}>{site.progression}%</span>
                  </div>
                  {techSite&&(
                    <div style={{marginTop:7,display:"flex",alignItems:"center",gap:7,padding:"4px 7px",borderRadius:6,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.05)"}}>
                      <div style={{width:20,height:20,borderRadius:"50%",overflow:"hidden",border:`1.5px solid ${techSite.color}`,flexShrink:0}}>
                        {PHOTOS[techSite.id]?<img src={PHOTOS[techSite.id]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{width:"100%",height:"100%",background:techSite.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:7,fontWeight:700}}>{techSite.avatar}</div>}
                      </div>
                      <span style={{fontSize:10,color:"rgba(255,255,255,.45)"}}>{techSite.nom.split(" ")[0]} · <span style={{color:STATUS_TECH[techSite.status]?.color}}>{STATUS_TECH[techSite.status]?.label}</span></span>
                    </div>
                  )}
                </div>
              );
            })}
          </>)}

          {/* ÉQUIPE */}
          {activeTab==="techs"&&(
            techniciens.filter(t=>!searchQ||t.nom.toLowerCase().includes(searchQ.toLowerCase())).map(tech=>{
              const st=STATUS_TECH[tech.status]||STATUS_TECH.disponible;
              return (
                <div key={tech.id}
                  onClick={()=>{setSelectedTech(tech);setSelected(null);flyToLocation(tech.lng,tech.lat,17);if(tech.siteLat&&tech.status!=="disponible")calculateRoute(mapInstanceRef.current,tech.lat,tech.lng,tech.siteLat,tech.siteLng,tech.id);}}
                  style={{padding:"12px",borderBottom:"1px solid rgba(255,255,255,.04)",cursor:"pointer",background:selectedTech?.id===tech.id?"rgba(59,130,246,.08)":"transparent",transition:"all .12s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.03)"}
                  onMouseLeave={e=>e.currentTarget.style.background=selectedTech?.id===tech.id?"rgba(59,130,246,.08)":"transparent"}>
                  <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}>
                    <div style={{position:"relative",flexShrink:0}}>
                      <div style={{width:40,height:40,borderRadius:"50%",overflow:"hidden",border:`2.5px solid ${tech.color}`,boxShadow:`0 0 0 2px ${tech.color}25`}}>
                        {PHOTOS[tech.id]?<img src={PHOTOS[tech.id]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{width:"100%",height:"100%",background:tech.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:12,fontWeight:700}}>{tech.avatar}</div>}
                      </div>
                      <div style={{position:"absolute",bottom:-1,right:-1,width:12,height:12,borderRadius:"50%",background:st.color,border:"2px solid #0D1117"}}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.88)"}}>{tech.nom}</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{tech.specialite}</div>
                    </div>
                    <span style={{padding:"2px 7px",borderRadius:10,fontSize:9,fontWeight:600,background:`${st.color}18`,color:st.color}}>{st.label}</span>
                  </div>
                  <div style={{display:"flex",gap:5,marginBottom:7}}>
                    <div style={{flex:1,display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,.04)",borderRadius:5,padding:"3px 7px"}}>
                      <span style={{fontSize:10}}>🔋</span>
                      <div style={{flex:1,background:"rgba(255,255,255,.07)",borderRadius:2,height:3}}>
                        <div style={{width:`${tech.battery}%`,height:"100%",background:tech.battery>50?"#10B981":tech.battery>20?"#F59E0B":"#EF4444",borderRadius:2}}/>
                      </div>
                      <span style={{fontSize:9,fontWeight:700,color:tech.battery>50?"#34D399":tech.battery>20?"#FCD34D":"#F87171"}}>{tech.battery}%</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:3,background:"rgba(255,255,255,.04)",borderRadius:5,padding:"3px 7px"}}>
                      <span style={{fontSize:10}}>📶</span>
                      <span style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.5)"}}>{tech.signal}/5</span>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:5}}>
                    {tech.status==="disponible"&&(
                      <button onClick={e=>{e.stopPropagation();setDispatchTech(tech);setShowDispatch(true);}} style={{flex:1,padding:"5px",borderRadius:5,border:"none",background:"#2563EB",color:"white",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>➤ Dispatcher</button>
                    )}
                    <button onClick={e=>{e.stopPropagation();window.open(`tel:${tech.phone}`);}} style={{flex:1,padding:"5px",borderRadius:5,border:"1px solid rgba(255,255,255,.08)",background:"transparent",color:"rgba(255,255,255,.5)",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>📞 Appeler</button>
                  </div>
                </div>
              );
            })
          )}

          {/* MISSIONS */}
          {activeTab==="missions"&&(
            <div>
              <div style={{padding:"8px 12px",borderBottom:"1px solid rgba(255,255,255,.05)",fontSize:10,color:"rgba(255,255,255,.3)",fontWeight:600}}>
                {techniciens.filter(t=>t.status==="en_mission"||t.status==="en_deplacement").length} missions actives
              </div>
              {techniciens.filter(t=>t.status==="en_mission"||t.status==="en_deplacement").map(tech=>{
                const site=SITES.find(s=>s.code===tech.site);
                const st=STATUS_TECH[tech.status];
                return (
                  <div key={tech.id} style={{padding:"12px",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                    <div style={{display:"flex",gap:9,alignItems:"center",marginBottom:7}}>
                      <div style={{width:34,height:34,borderRadius:"50%",overflow:"hidden",border:`2px solid ${tech.color}`,flexShrink:0}}>
                        {PHOTOS[tech.id]?<img src={PHOTOS[tech.id]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{width:"100%",height:"100%",background:tech.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:11,fontWeight:700}}>{tech.avatar}</div>}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.85)"}}>{tech.nom}</div>
                        <span style={{fontSize:9,padding:"1px 6px",borderRadius:8,background:`${st?.color}18`,color:st?.color,fontWeight:600}}>{st?.label}</span>
                      </div>
                    </div>
                    {site&&(
                      <>
                        <div style={{fontSize:11,color:"rgba(255,255,255,.45)",marginBottom:5}}>{site.code} · {site.name}</div>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <div style={{flex:1,background:"rgba(255,255,255,.07)",borderRadius:3,height:5,overflow:"hidden"}}>
                            <div style={{width:`${site.progression}%`,height:"100%",background:STATUS_SITES[site.status]?.color||"#3B82F6",borderRadius:3}}/>
                          </div>
                          <span style={{fontSize:10,fontWeight:700,color:STATUS_SITES[site.status]?.color||"#60A5FA"}}>{site.progression}%</span>
                        </div>
                      </>
                    )}
                    {tech.rapport&&<div style={{marginTop:6,fontSize:10,color:"rgba(255,255,255,.35)",fontStyle:"italic"}}>📋 {tech.rapport}</div>}
                    <button onClick={()=>{setSelectedTech(tech);setSelected(null);flyToLocation(tech.lng,tech.lat,17);if(tech.siteLat)calculateRoute(mapInstanceRef.current,tech.lat,tech.lng,tech.siteLat,tech.siteLng,tech.id);}}
                      style={{marginTop:8,width:"100%",padding:"5px",borderRadius:5,border:"1px solid rgba(255,255,255,.08)",background:"transparent",color:"rgba(255,255,255,.4)",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>
                      📍 Voir sur carte + Trajet
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* ALERTES */}
          {activeTab==="alertes"&&(
            ALERTES.map(a=>(
              <div key={a.id} style={{padding:"12px",borderBottom:"1px solid rgba(255,255,255,.04)",borderLeft:`3px solid ${a.color}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:9,fontWeight:700,color:a.color,letterSpacing:".5px"}}>{a.type}</span>
                  <span style={{fontSize:9,color:"rgba(255,255,255,.2)"}}>{a.time}</span>
                </div>
                <div style={{fontSize:12,color:"rgba(255,255,255,.6)",lineHeight:1.5,marginBottom:7}}>{a.msg}</div>
                <button style={{padding:"3px 9px",borderRadius:5,border:`1px solid ${a.color}40`,background:`${a.color}10`,color:a.color,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Traiter</button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ===== CARTE MAPLIBRE ===== */}
      <div style={{flex:1,position:"relative"}}>
        <div ref={mapRef} style={{width:"100%",height:"100%"}}/>

        {!loaded&&(
          <div style={{position:"absolute",inset:0,background:"#0A0E1A",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14}}>
            <div style={{width:52,height:52,borderRadius:"50%",border:"3px solid #3B82F6",borderTopColor:"transparent",animation:"spin 1s linear infinite"}}/>
            <div style={{color:"white",fontSize:14,fontWeight:600}}>Chargement carte satellite Maptiler...</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>Rotation 3D · Terrain · Satellite HD</div>
          </div>
        )}

        {loaded&&(
          <>
            {/* Styles carte */}
            <div style={{position:"absolute",top:14,left:14,zIndex:1000,background:"rgba(10,14,26,.92)",backdropFilter:"blur(12px)",borderRadius:12,padding:10,border:"1px solid rgba(255,255,255,.08)"}}>
              <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.25)",marginBottom:7,textTransform:"uppercase",letterSpacing:".6px"}}>Vue satellite</div>
              {MAP_STYLES.map(s=>(
                <button key={s.id} onClick={()=>changeStyle(s.id)}
                  style={{display:"block",width:"100%",padding:"6px 10px",marginBottom:3,borderRadius:7,border:`1px solid ${activeStyle===s.id?"#3B82F6":"rgba(255,255,255,.06)"}`,background:activeStyle===s.id?"#3B82F6":"rgba(255,255,255,.04)",color:activeStyle===s.id?"white":"rgba(255,255,255,.4)",fontSize:11,cursor:"pointer",fontWeight:activeStyle===s.id?700:400,textAlign:"left",fontFamily:"inherit",transition:"all .15s"}}>
                  {s.label}
                </button>
              ))}
              <div style={{height:1,background:"rgba(255,255,255,.06)",margin:"7px 0"}}/>
              <button onClick={toggle3D} style={{display:"flex",alignItems:"center",gap:6,width:"100%",padding:"6px 10px",borderRadius:7,border:`1px solid ${is3D?"#A78BFA":"rgba(255,255,255,.06)"}`,background:is3D?"rgba(167,139,250,.15)":"rgba(255,255,255,.04)",color:is3D?"#A78BFA":"rgba(255,255,255,.4)",fontSize:11,cursor:"pointer",fontWeight:is3D?700:400,fontFamily:"inherit",transition:"all .15s"}}>
                🏔 Vue 3D {is3D?"ON":"OFF"}
              </button>
              <button onClick={()=>setShowCesium(!showCesium)} style={{display:"flex",alignItems:"center",gap:6,width:"100%",marginTop:4,padding:"6px 10px",borderRadius:7,border:`1px solid ${showCesium?"#34D399":"rgba(255,255,255,.06)"}`,background:showCesium?"rgba(52,211,153,.15)":"rgba(255,255,255,.04)",color:showCesium?"#34D399":"rgba(255,255,255,.4)",fontSize:11,cursor:"pointer",fontWeight:showCesium?700:400,fontFamily:"inherit",transition:"all .15s"}}>
                🌍 Globe Cesium
              </button>
            </div>

            {/* Infos route */}
            {(routeInfo||loadingRoute)&&(
              <div style={{position:"absolute",top:14,left:"50%",transform:"translateX(-50%)",zIndex:1000,background:"rgba(10,14,26,.92)",backdropFilter:"blur(12px)",borderRadius:12,padding:"10px 20px",border:"1px solid rgba(59,130,246,.25)",display:"flex",alignItems:"center",gap:18}}>
                {loadingRoute?(
                  <div style={{display:"flex",alignItems:"center",gap:8,color:"rgba(255,255,255,.5)",fontSize:12}}>
                    <div style={{width:14,height:14,borderRadius:"50%",border:"2px solid #3B82F6",borderTopColor:"transparent",animation:"spin 1s linear infinite"}}/>
                    Calcul itinéraire GPS...
                  </div>
                ):(
                  <>
                    {[{l:"Distance",v:`${routeInfo.distance} km`,c:"#60A5FA"},{l:"Durée est.",v:`${routeInfo.duration} min`,c:"#34D399"},{l:"Arrivée est.",v:new Date(Date.now()+routeInfo.duration*60000).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),c:"rgba(255,255,255,.6)"}].map((m,i)=>(
                      <div key={m.l} style={{textAlign:"center"}}>
                        <div style={{fontSize:9,color:"rgba(255,255,255,.25)",marginBottom:2,textTransform:"uppercase",letterSpacing:".4px"}}>{m.l}</div>
                        <div style={{fontSize:16,fontWeight:700,color:m.c}}>{m.v}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* Actions rapides */}
            <div style={{position:"absolute",top:14,right:14,zIndex:1000,display:"flex",flexDirection:"column",gap:6}}>
              <button onClick={()=>setShowDispatch(true)}
                style={{display:"flex",alignItems:"center",gap:7,padding:"8px 14px",borderRadius:9,border:"none",background:"#2563EB",color:"white",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 16px rgba(37,99,235,.4)"}}>
                ➤ Dispatcher
              </button>
              <button onClick={()=>setActiveTab("alertes")}
                style={{display:"flex",alignItems:"center",gap:7,padding:"8px 14px",borderRadius:9,border:"1px solid rgba(239,68,68,.25)",background:"rgba(239,68,68,.08)",color:"#F87171",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                🔔 {ALERTES.length} alertes
              </button>
            </div>

            {/* Légende */}
            <div style={{position:"absolute",bottom:60,left:14,zIndex:1000,background:"rgba(10,14,26,.92)",backdropFilter:"blur(12px)",borderRadius:12,padding:"10px 14px",border:"1px solid rgba(255,255,255,.07)"}}>
              <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.25)",marginBottom:7,textTransform:"uppercase",letterSpacing:".6px"}}>Sites réseau</div>
              {Object.entries(STATUS_SITES).map(([k,v])=>(
                <div key={k} style={{display:"flex",alignItems:"center",gap:7,marginBottom:4,fontSize:11,color:"rgba(255,255,255,.55)"}}>
                  <div style={{width:10,height:10,borderRadius:2,background:v.color}}/>{v.label}
                </div>
              ))}
              <div style={{height:1,background:"rgba(255,255,255,.07)",margin:"7px 0"}}/>
              <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.25)",marginBottom:7,textTransform:"uppercase",letterSpacing:".6px"}}>Techniciens</div>
              {Object.entries(STATUS_TECH).map(([k,v])=>(
                <div key={k} style={{display:"flex",alignItems:"center",gap:7,marginBottom:4,fontSize:11,color:"rgba(255,255,255,.55)"}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:v.color}}/>{v.label}
                </div>
              ))}
              <div style={{height:1,background:"rgba(255,255,255,.07)",margin:"7px 0"}}/>
              <div style={{display:"flex",alignItems:"center",gap:7,fontSize:11,color:"rgba(255,255,255,.45)"}}>
                <div style={{width:14,height:3,background:"#3B82F6",borderRadius:2}}/>Itinéraire GPS
              </div>
            </div>
          </>
        )}

        {/* Globe Cesium overlay */}
        {showCesium&&(
          <div style={{position:"absolute",inset:0,zIndex:500,background:"rgba(0,0,0,.7)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{background:"#0D1117",borderRadius:16,padding:"20px",width:"90%",maxWidth:700,border:"1px solid rgba(255,255,255,.1)",boxShadow:"0 24px 80px rgba(0,0,0,.5)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:"white"}}>🌍 Globe 3D Cesium</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:2}}>Visualisation globe terrestre NASA/ESA</div>
                </div>
                <button onClick={()=>setShowCesium(false)} style={{width:30,height:30,borderRadius:"50%",background:"rgba(255,255,255,.08)",border:"none",color:"rgba(255,255,255,.5)",cursor:"pointer",fontSize:16}}>✕</button>
              </div>
              <iframe
                src={`https://cesium.com/ion/stories/viewer/?id=3fbdc0a7-fc51-4327-8b7c-a3d6a7a0f1fb`}
                style={{width:"100%",height:400,border:"none",borderRadius:10,background:"#000"}}
                title="Cesium Globe"
                allowFullScreen
              />
              <div style={{marginTop:12,padding:"10px 14px",background:"rgba(52,211,153,.08)",border:"1px solid rgba(52,211,153,.2)",borderRadius:8,fontSize:12,color:"rgba(255,255,255,.5)"}}>
                💡 Pour une intégration Cesium complète avec vos données CleanIT, créez un compte gratuit sur <span style={{color:"#34D399"}}>cesium.com/ion</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== PANEL DROIT ===== */}
      {(selected||selectedTech)&&(
        <div style={{width:290,background:"#0D1117",borderLeft:"1px solid rgba(255,255,255,.07)",display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0}}>

          {selected&&(()=>{
            const cfg=STATUS_SITES[selected.status]||STATUS_SITES.planifie;
            const techSite=techniciens.find(t=>t.site===selected.code);
            return (<>
              <div style={{padding:"14px",background:`linear-gradient(135deg,#0D1117,${cfg.color}33)`,borderBottom:"1px solid rgba(255,255,255,.07)",flexShrink:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:800,color:"white"}}>{selected.code}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.5)",marginTop:2}}>{selected.name}</div>
                    <span style={{display:"inline-block",marginTop:6,padding:"2px 9px",borderRadius:7,background:`${cfg.color}20`,color:cfg.color,fontSize:10,fontWeight:700}}>{cfg.label}</span>
                  </div>
                  <button onClick={()=>setSelected(null)} style={{width:24,height:24,borderRadius:"50%",background:"rgba(255,255,255,.08)",border:"none",color:"rgba(255,255,255,.5)",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                </div>
              </div>
              <div style={{flex:1,overflowY:"auto",padding:14}}>
                {[["Type réseau",selected.type],["Client",selected.client],["Projet",selected.projet],["Budget",`${selected.budget}M FCFA`],["GPS",`${selected.lat.toFixed(5)}°N, ${selected.lng.toFixed(5)}°E`]].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                    <span style={{fontSize:11,color:"rgba(255,255,255,.3)"}}>{l}</span>
                    <span style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.75)",textAlign:"right",maxWidth:150}}>{v}</span>
                  </div>
                ))}
                <div style={{marginTop:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(255,255,255,.4)",marginBottom:5}}>
                    <span>Progression</span><span style={{fontWeight:700,color:cfg.color}}>{selected.progression}%</span>
                  </div>
                  <div style={{background:"rgba(255,255,255,.07)",borderRadius:6,height:8,overflow:"hidden"}}>
                    <div style={{width:`${selected.progression}%`,height:"100%",background:cfg.color,borderRadius:6}}/>
                  </div>
                </div>
                {techSite?(
                  <div style={{marginTop:14,padding:12,borderRadius:10,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)"}}>
                    <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.3)",marginBottom:9,textTransform:"uppercase",letterSpacing:".4px"}}>Technicien sur site</div>
                    <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:9}}>
                      <div style={{width:42,height:42,borderRadius:"50%",overflow:"hidden",border:`2.5px solid ${techSite.color}`,flexShrink:0}}>
                        {PHOTOS[techSite.id]?<img src={PHOTOS[techSite.id]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{width:"100%",height:"100%",background:techSite.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:12,fontWeight:700}}>{techSite.avatar}</div>}
                      </div>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.85)"}}>{techSite.nom}</div>
                        <div style={{fontSize:10,color:STATUS_TECH[techSite.status]?.color,fontWeight:600,marginTop:1}}>{STATUS_TECH[techSite.status]?.label}</div>
                        <div style={{fontSize:9,color:"rgba(255,255,255,.25)",marginTop:1}}>🔋{techSite.battery}% · 📶{techSite.signal}/5</div>
                      </div>
                    </div>
                    {techSite.rapport&&<div style={{fontSize:10,color:"rgba(255,255,255,.4)",background:"rgba(255,255,255,.03)",padding:"6px 9px",borderRadius:6,lineHeight:1.5,marginBottom:9}}>📋 {techSite.rapport}</div>}
                    <div style={{display:"flex",gap:7}}>
                      <button onClick={()=>window.open(`tel:${techSite.phone}`)} style={{flex:1,padding:"7px",borderRadius:6,border:"none",background:techSite.color,color:"white",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>📞 Appeler</button>
                      <button onClick={()=>{setSelectedTech(techSite);setSelected(null);flyToLocation(techSite.lng,techSite.lat,17);if(techSite.siteLat)calculateRoute(mapInstanceRef.current,techSite.lat,techSite.lng,techSite.siteLat,techSite.siteLng,techSite.id);}}
                        style={{flex:1,padding:"7px",borderRadius:6,border:`1px solid ${techSite.color}40`,background:"transparent",color:techSite.color,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>🗺 Trajet</button>
                    </div>
                  </div>
                ):(
                  <div style={{marginTop:14,padding:12,borderRadius:10,background:"rgba(255,255,255,.03)",border:"1px dashed rgba(255,255,255,.08)"}}>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginBottom:9,textAlign:"center"}}>Aucun technicien assigné</div>
                    <button onClick={()=>{setDispatchSite(selected);setShowDispatch(true);}} style={{width:"100%",padding:"8px",borderRadius:7,border:"none",background:"#2563EB",color:"white",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>➤ Dispatcher un technicien</button>
                  </div>
                )}
              </div>
            </>);
          })()}

          {selectedTech&&!selected&&(()=>{
            const st=STATUS_TECH[selectedTech.status]||STATUS_TECH.disponible;
            const siteTech=SITES.find(s=>s.code===selectedTech.site);
            return (<>
              <div style={{padding:"14px",background:`linear-gradient(135deg,#0D1117,${selectedTech.color}33)`,borderBottom:"1px solid rgba(255,255,255,.07)",flexShrink:0}}>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{width:52,height:52,borderRadius:"50%",overflow:"hidden",border:`3px solid ${selectedTech.color}`,boxShadow:`0 0 0 3px ${selectedTech.color}25`,flexShrink:0}}>
                    {PHOTOS[selectedTech.id]?<img src={PHOTOS[selectedTech.id]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{width:"100%",height:"100%",background:selectedTech.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:15,fontWeight:700}}>{selectedTech.avatar}</div>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:800,color:"white"}}>{selectedTech.nom}</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,.4)",marginTop:1}}>{selectedTech.specialite}</div>
                    <span style={{display:"inline-block",marginTop:4,padding:"2px 8px",borderRadius:7,background:`${st.color}20`,color:st.color,fontSize:9,fontWeight:700}}>{st.label}</span>
                  </div>
                  <button onClick={()=>{setSelectedTech(null);setRouteInfo(null);clearRoute(mapInstanceRef.current);}} style={{width:24,height:24,borderRadius:"50%",background:"rgba(255,255,255,.08)",border:"none",color:"rgba(255,255,255,.5)",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",alignSelf:"flex-start"}}>✕</button>
                </div>
              </div>
              <div style={{flex:1,overflowY:"auto",padding:14}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginBottom:14}}>
                  {[{l:"Batterie",v:`${selectedTech.battery}%`,c:selectedTech.battery>50?"#34D399":selectedTech.battery>20?"#FCD34D":"#F87171"},{l:"Signal",v:`${selectedTech.signal}/5`,c:"#60A5FA"},{l:"Tâches",v:selectedTech.taches,c:"#A78BFA"}].map(m=>(
                    <div key={m.l} style={{background:"rgba(255,255,255,.04)",borderRadius:8,padding:"9px 6px",textAlign:"center",border:"1px solid rgba(255,255,255,.05)"}}>
                      <div style={{fontSize:9,color:"rgba(255,255,255,.25)",marginBottom:3,textTransform:"uppercase",letterSpacing:".3px"}}>{m.l}</div>
                      <div style={{fontSize:15,fontWeight:700,color:m.c}}>{m.v}</div>
                    </div>
                  ))}
                </div>
                {[["Matricule",selectedTech.matricule],["Téléphone",selectedTech.phone],["Site actuel",selectedTech.site],["Début",selectedTech.heureDebut],["Mise à jour",selectedTech.lastUpdate]].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.04)"}}>
                    <span style={{fontSize:11,color:"rgba(255,255,255,.3)"}}>{l}</span>
                    <span style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.7)",textAlign:"right",maxWidth:155}}>{v}</span>
                  </div>
                ))}
                {selectedTech.rapport&&(
                  <div style={{marginTop:12,padding:"9px 11px",background:"rgba(16,185,129,.07)",borderRadius:8,border:"1px solid rgba(16,185,129,.15)"}}>
                    <div style={{fontSize:9,fontWeight:700,color:"#34D399",marginBottom:5,textTransform:"uppercase",letterSpacing:".4px"}}>Dernier rapport</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.55)",lineHeight:1.6}}>{selectedTech.rapport}</div>
                  </div>
                )}
                {routeInfo&&(
                  <div style={{marginTop:12,padding:10,borderRadius:8,background:"rgba(59,130,246,.07)",border:"1px solid rgba(59,130,246,.2)"}}>
                    <div style={{fontSize:9,fontWeight:700,color:"#60A5FA",marginBottom:8,textTransform:"uppercase",letterSpacing:".4px"}}>Itinéraire GPS calculé</div>
                    <div style={{display:"flex",justifyContent:"space-around"}}>
                      <div style={{textAlign:"center"}}><div style={{fontSize:17,fontWeight:700,color:"#60A5FA"}}>{routeInfo.distance} km</div><div style={{fontSize:9,color:"rgba(255,255,255,.25)"}}>Distance</div></div>
                      <div style={{textAlign:"center"}}><div style={{fontSize:17,fontWeight:700,color:"#34D399"}}>{routeInfo.duration} min</div><div style={{fontSize:9,color:"rgba(255,255,255,.25)"}}>Durée est.</div></div>
                    </div>
                  </div>
                )}
                <div style={{display:"flex",gap:7,marginTop:14}}>
                  <button onClick={()=>window.open(`tel:${selectedTech.phone}`)} style={{flex:1,padding:"9px",borderRadius:7,border:"none",background:selectedTech.color,color:"white",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"inherit"}}>📞 Appeler</button>
                  {selectedTech.siteLat&&(
                    <button onClick={()=>calculateRoute(mapInstanceRef.current,selectedTech.lat,selectedTech.lng,selectedTech.siteLat,selectedTech.siteLng,selectedTech.id)}
                      style={{flex:1,padding:"9px",borderRadius:7,border:"1px solid rgba(59,130,246,.3)",background:"rgba(59,130,246,.08)",color:"#60A5FA",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"inherit"}}>
                      🗺 Trajet GPS
                    </button>
                  )}
                </div>
                {selectedTech.status==="disponible"&&(
                  <button onClick={()=>{setDispatchTech(selectedTech);setShowDispatch(true);}} style={{width:"100%",marginTop:7,padding:"9px",borderRadius:7,border:"none",background:"#059669",color:"white",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit"}}>➤ Dispatcher ce technicien</button>
                )}
              </div>
            </>);
          })()}
        </div>
      )}

      {/* ===== MODAL DISPATCH ===== */}
      {showDispatch&&(
        <div style={{position:"fixed",inset:0,zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div onClick={()=>{setShowDispatch(false);setDispatchTech(null);setDispatchSite(null);}} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.7)",backdropFilter:"blur(8px)"}}/>
          <div style={{position:"relative",background:"#0D1117",borderRadius:16,width:"100%",maxWidth:500,maxHeight:"90vh",overflow:"auto",boxShadow:"0 24px 80px rgba(0,0,0,.6)",border:"1px solid rgba(255,255,255,.08)"}}>
            <div style={{padding:"16px 20px",background:"linear-gradient(135deg,#1E293B,#2563EB22)",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:"white"}}>➤ Dispatch Technicien</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:2}}>Assigner un technicien à un chantier</div>
              </div>
              <button onClick={()=>{setShowDispatch(false);setDispatchTech(null);setDispatchSite(null);}} style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,.07)",border:"none",color:"rgba(255,255,255,.5)",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            <div style={{padding:"16px 20px"}}>
              <div style={{marginBottom:16}}>
                <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.3)",marginBottom:9,textTransform:"uppercase",letterSpacing:".5px"}}>Sélectionner un technicien</div>
                {techniciens.filter(t=>t.status==="disponible"||t.status==="en_deplacement").map(t=>(
                  <div key={t.id} onClick={()=>setDispatchTech(t)}
                    style={{display:"flex",alignItems:"center",gap:11,padding:"11px",borderRadius:9,border:`2px solid ${dispatchTech?.id===t.id?t.color:"rgba(255,255,255,.07)"}`,cursor:"pointer",background:dispatchTech?.id===t.id?`${t.color}0D`:"rgba(255,255,255,.02)",marginBottom:7,transition:"all .12s"}}>
                    <div style={{width:38,height:38,borderRadius:"50%",overflow:"hidden",border:`2px solid ${t.color}`,flexShrink:0}}>
                      {PHOTOS[t.id]?<img src={PHOTOS[t.id]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<div style={{width:"100%",height:"100%",background:t.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:11}}>{t.avatar}</div>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.85)"}}>{t.nom}</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{t.specialite}</div>
                    </div>
                    <span style={{padding:"2px 7px",borderRadius:9,fontSize:9,fontWeight:600,background:`${STATUS_TECH[t.status]?.color}18`,color:STATUS_TECH[t.status]?.color}}>{STATUS_TECH[t.status]?.label}</span>
                  </div>
                ))}
              </div>
              <div style={{marginBottom:16}}>
                <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.3)",marginBottom:9,textTransform:"uppercase",letterSpacing:".5px"}}>Sélectionner un site</div>
                {SITES.filter(s=>!["termine","livre"].includes(s.status)).map(s=>{
                  const cfg=STATUS_SITES[s.status];
                  return (
                    <div key={s.code} onClick={()=>setDispatchSite(s)}
                      style={{display:"flex",alignItems:"center",gap:11,padding:"11px",borderRadius:9,border:`2px solid ${dispatchSite?.code===s.code?cfg.color:"rgba(255,255,255,.07)"}`,cursor:"pointer",background:dispatchSite?.code===s.code?`${cfg.color}0D`:"rgba(255,255,255,.02)",marginBottom:7,transition:"all .12s"}}>
                      <div style={{width:38,height:38,borderRadius:9,background:cfg.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:10,flexShrink:0}}>
                        {s.type.includes("5G")?"5G":s.type.includes("4G")?"4G":"3G"}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,.85)"}}>{s.code} · {s.name}</div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{s.client} · {s.progression}% avancement</div>
                      </div>
                      <span style={{padding:"2px 7px",borderRadius:9,fontSize:9,fontWeight:600,background:`${cfg.color}18`,color:cfg.color}}>{cfg.label}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{display:"flex",gap:9}}>
                <button onClick={()=>{setShowDispatch(false);setDispatchTech(null);setDispatchSite(null);}} style={{flex:1,padding:"11px",borderRadius:8,border:"1px solid rgba(255,255,255,.08)",background:"transparent",color:"rgba(255,255,255,.4)",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Annuler</button>
                <button onClick={doDispatch} disabled={!dispatchTech||!dispatchSite}
                  style={{flex:2,padding:"11px",borderRadius:8,border:"none",background:dispatchTech&&dispatchSite?"#2563EB":"rgba(255,255,255,.06)",color:dispatchTech&&dispatchSite?"white":"rgba(255,255,255,.2)",fontSize:12,fontWeight:700,cursor:dispatchTech&&dispatchSite?"pointer":"not-allowed",fontFamily:"inherit"}}>
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
        @keyframes pulseGPS{0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,.5)}70%{box-shadow:0 0 0 8px rgba(37,99,235,0)}}
        .maplibregl-canvas{cursor:grab}
        .maplibregl-canvas:active{cursor:grabbing}
        .maplibregl-popup-content{background:#1E293B!important;border-radius:10px!important;color:white!important;border:1px solid rgba(255,255,255,.1)!important;padding:12px 14px!important;box-shadow:0 8px 32px rgba(0,0,0,.4)!important;}
        .maplibregl-popup-tip{border-top-color:#1E293B!important;border-bottom-color:#1E293B!important;}
        .maplibregl-ctrl-group{background:rgba(10,14,26,.92)!important;border:1px solid rgba(255,255,255,.08)!important;backdrop-filter:blur(12px);}
        .maplibregl-ctrl-group button{background:transparent!important;color:rgba(255,255,255,.7)!important;}
        .maplibregl-ctrl-group button:hover{background:rgba(255,255,255,.08)!important;}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px}
      `}</style>
    </div>
  );
}
