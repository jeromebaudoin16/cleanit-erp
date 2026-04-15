import { useEffect, useRef, useState } from 'react';

const SITES = [
  { code:'DLA-001', name:'Site Akwa Douala', lat:4.0511, lng:9.7085, status:'en_cours', type:'5G NR', progression:65, technicien:'Thomas Ngono', priority:'haute', budget:12500000, adresse:'Rue Joss, Akwa, Douala' },
  { code:'DLA-002', name:'Site Bonanjo', lat:4.0469, lng:9.6952, status:'planifie', type:'5G NR', progression:0, technicien:'—', priority:'normale', budget:8500000, adresse:'Avenue de Gaulle, Bonanjo, Douala' },
  { code:'DLA-003', name:'Site Bonabéri', lat:4.0667, lng:9.6500, status:'en_retard', type:'4G LTE', progression:30, technicien:'Jean Mbarga', priority:'critique', budget:3500000, adresse:'Zone Industrielle, Bonabéri, Douala' },
  { code:'YDE-001', name:'Site Centre Yaoundé', lat:3.8480, lng:11.5021, status:'termine', type:'5G NR', progression:100, technicien:'Samuel Djomo', priority:'haute', budget:15000000, adresse:'Avenue Kennedy, Centre, Yaoundé' },
  { code:'YDE-002', name:'Site Bastos', lat:3.8833, lng:11.5167, status:'en_cours', type:'5G NR', progression:45, technicien:'Pierre Etoga', priority:'normale', budget:2000000, adresse:'Quartier Bastos, Yaoundé' },
  { code:'BFN-001', name:'Site Bafoussam', lat:5.4764, lng:10.4214, status:'planifie', type:'4G LTE', progression:0, technicien:'—', priority:'normale', budget:9000000, adresse:'Centre Commercial, Bafoussam' },
  { code:'GAR-001', name:'Site Garoua', lat:9.3019, lng:13.3920, status:'en_cours', type:'3G UMTS', progression:55, technicien:'Ali Moussa', priority:'normale', budget:4500000, adresse:'Quartier Plateau, Garoua' },
  { code:'MAR-001', name:'Site Maroua', lat:10.5900, lng:14.3157, status:'planifie', type:'4G LTE', progression:0, technicien:'—', priority:'haute', budget:11000000, adresse:'Centre-ville, Maroua' },
  { code:'KRI-001', name:'Site Kribi Port', lat:2.9395, lng:9.9087, status:'livre', type:'5G NR', progression:100, technicien:'Thomas Ngono', priority:'haute', budget:18000000, adresse:'Zone Portuaire, Kribi' },
  { code:'LIM-001', name:'Site Limbé', lat:4.0167, lng:9.2000, status:'en_cours', type:'4G LTE', progression:75, technicien:'Ali Moussa', priority:'normale', budget:6500000, adresse:'Down Beach, Limbé' },
];

const STATUS_CONFIG = {
  planifie:  { color:'#7c3aed', label:'Planifié',  bg:'#f5f3ff' },
  en_cours:  { color:'#0078d4', label:'En cours',  bg:'#eff6ff' },
  termine:   { color:'#16a34a', label:'Terminé',   bg:'#f0fdf4' },
  livre:     { color:'#059669', label:'Livré',     bg:'#ecfdf5' },
  en_retard: { color:'#dc2626', label:'En retard', bg:'#fef2f2' },
};

const MAP_LAYERS = [
  { id:'osm',       label:'Carte Standard',  url:'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
  { id:'satellite', label:'Vue Satellite',   url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
  { id:'terrain',   label:'Relief Terrain',  url:'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' },
  { id:'topo',      label:'Topo + Routes',   url:'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png' },
];

const fmtN = n => new Intl.NumberFormat('fr-FR').format(n||0);

export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const routeLayerRef = useRef(null);
  const tileLayerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('tous');
  const [activeLayer, setActiveLayer] = useState('satellite');
  const [showRoute, setShowRoute] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => {
    // CSS Leaflet
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (window.L) { setLoaded(true); return; }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current || mapInstanceRef.current) return;
    const L = window.L;

    const map = L.map(mapRef.current, {
      center: [5.5, 12.0],
      zoom: 6,
      zoomControl: false,
    });

    // Zoom control en bas à droite
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Tile layer satellite par défaut
    const layer = MAP_LAYERS.find(l => l.id === 'satellite');
    tileLayerRef.current = L.tileLayer(layer.url, {
      attribution: '© Esri, Maxar, GeoEye',
      maxZoom: 19,
    }).addTo(map);

    // Marqueurs
    SITES.forEach(site => {
      const cfg = STATUS_CONFIG[site.status] || STATUS_CONFIG.planifie;
      const icon = L.divIcon({
        html: `
          <div style="position:relative;width:44px;height:52px;cursor:pointer;">
            <div style="
              width:44px;height:44px;border-radius:50%;
              background:${cfg.color};border:3px solid white;
              box-shadow:0 4px 16px rgba(0,0,0,0.4);
              display:flex;align-items:center;justify-content:center;
              flex-direction:column;gap:0;
              transition:transform .2s;
            ">
              <span style="color:white;font-weight:900;font-size:9px;line-height:1;">${site.type.includes('5G')?'5G':site.type.includes('4G')?'4G':'3G'}</span>
              <span style="color:rgba(255,255,255,0.8);font-size:7px;">${site.code}</span>
            </div>
            <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);
              width:0;height:0;
              border-left:7px solid transparent;border-right:7px solid transparent;
              border-top:10px solid ${cfg.color};">
            </div>
          </div>
        `,
        className: '',
        iconSize: [44, 52],
        iconAnchor: [22, 52],
        popupAnchor: [0, -56],
      });

      const marker = L.marker([site.lat, site.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:'Segoe UI',Arial,sans-serif;min-width:240px;padding:6px 2px;">
            <div style="font-weight:800;font-size:15px;color:#0f1b2d;margin-bottom:8px;">${site.code} · ${site.name}</div>
            <div style="margin-bottom:8px;display:flex;gap:6px;flex-wrap:wrap;">
              <span style="padding:3px 9px;border-radius:10px;font-size:11px;font-weight:600;background:${cfg.color}20;color:${cfg.color};">${cfg.label}</span>
              <span style="padding:3px 9px;border-radius:10px;font-size:11px;background:#eff6ff;color:#2563eb;">${site.type}</span>
            </div>
            <div style="font-size:12px;color:#64748b;margin-bottom:3px;">📍 ${site.adresse}</div>
            <div style="font-size:12px;color:#64748b;margin-bottom:3px;">👷 ${site.technicien}</div>
            <div style="font-size:12px;color:#16a34a;font-weight:600;margin-bottom:8px;">💰 ${fmtN(site.budget)} XAF</div>
            <div style="background:#f1f5f9;border-radius:4px;height:6px;overflow:hidden;margin-bottom:4px;">
              <div style="width:${site.progression}%;height:100%;background:${cfg.color};border-radius:4px;"></div>
            </div>
            <div style="font-size:11px;color:#64748b;text-align:right;">${site.progression}% complété</div>
          </div>
        `, { maxWidth: 280 });

      marker.on('click', () => setSelected(site));
      markersRef.current[site.code] = marker;
    });

    // Localisation utilisateur
    navigator.geolocation?.getCurrentPosition(pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      setUserLocation({ lat, lng });
      L.marker([lat, lng], {
        icon: L.divIcon({
          html: `<div style="width:18px;height:18px;border-radius:50%;background:#4f8ef7;border:3px solid white;box-shadow:0 2px 8px rgba(79,142,247,0.5);animation:pulse 2s infinite;"></div>`,
          className: '',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        })
      }).addTo(map).bindPopup('📍 Votre position');
    }, () => {});

    mapInstanceRef.current = map;
  }, [loaded]);

  // Changer le fond de carte
  const changeLayer = (layerId) => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const layer = MAP_LAYERS.find(l => l.id === layerId);
    tileLayerRef.current = L.tileLayer(layer.url, {
      attribution: '© OpenStreetMap / Esri',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);
    setActiveLayer(layerId);
  };

  // Tracer itinéraire via OSRM (gratuit, routage réel)
  const getRoute = async (site) => {
    if (!userLocation || !mapInstanceRef.current || !window.L) {
      alert('Activez la géolocalisation pour obtenir un itinéraire');
      return;
    }
    setRouteLoading(true);
    setShowRoute(true);
    const L = window.L;

    try {
      // OSRM - routing engine gratuit basé sur OpenStreetMap
      const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${site.lng},${site.lat}?overview=full&geometries=geojson&steps=true`;
      const r = await fetch(url);
      const data = await r.json();

      if (data.routes?.length > 0) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);

        // Supprimer ancien itinéraire
        if (routeLayerRef.current) mapInstanceRef.current.removeLayer(routeLayerRef.current);

        // Tracer la route
        routeLayerRef.current = L.polyline(coords, {
          color: '#4f8ef7',
          weight: 5,
          opacity: 0.85,
          dashArray: null,
        }).addTo(mapInstanceRef.current);

        // Ajuster la vue
        mapInstanceRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [40, 40] });

        const km = (route.distance / 1000).toFixed(1);
        const min = Math.round(route.duration / 60);
        setDistance({ km, min, steps: route.legs[0]?.steps?.length || 0 });
      }
    } catch(e) {
      // Fallback : ligne directe
      if (routeLayerRef.current) mapInstanceRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = window.L.polyline([
        [userLocation.lat, userLocation.lng],
        [site.lat, site.lng]
      ], { color:'#4f8ef7', weight:4, dashArray:'8,6' }).addTo(mapInstanceRef.current);

      const dx = site.lat - userLocation.lat;
      const dy = site.lng - userLocation.lng;
      const km = (Math.sqrt(dx*dx+dy*dy) * 111).toFixed(1);
      setDistance({ km, min: Math.round(km * 1.5), steps: 0 });
    }
    setRouteLoading(false);
  };

  // Ouvrir dans Google Maps
  const openGoogleMaps = (site) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${site.lat},${site.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  // Ouvrir dans Google Earth
  const openGoogleEarth = (site) => {
    const url = `https://earth.google.com/web/@${site.lat},${site.lng},500a,800d,35y,0h,45t,0r`;
    window.open(url, '_blank');
  };

  const filtered = SITES.filter(s => {
    const mf = filter === 'tous' || s.status === filter;
    const mq = !searchQ || s.code.toLowerCase().includes(searchQ.toLowerCase()) || s.name.toLowerCase().includes(searchQ.toLowerCase());
    return mf && mq;
  });

  return (
    <div style={{display:'flex', height:'calc(100vh - 56px)', overflow:'hidden'}}>

      {/* ===== PANEL GAUCHE ===== */}
      <div style={{width:300, background:'white', borderRight:'1px solid #e8ecf0', display:'flex', flexDirection:'column', overflow:'hidden', flexShrink:0, zIndex:10}}>

        <div style={{padding:'14px 16px', borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#0f1b2d,#1a2a45)'}}>
          <h2 style={{fontSize:15, fontWeight:800, color:'white', margin:'0 0 4px'}}>🛰 Carte Digital Twin</h2>
          <p style={{fontSize:11, color:'#64748b', margin:0}}>Réseau Cameroun · Navigation temps réel</p>
        </div>

        {/* Recherche */}
        <div style={{padding:'10px 12px', borderBottom:'1px solid #f1f5f9'}}>
          <div style={{position:'relative'}}>
            <span style={{position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', fontSize:13}}>🔍</span>
            <input placeholder="Rechercher un site..." value={searchQ} onChange={e=>setSearchQ(e.target.value)}
              style={{width:'100%', padding:'8px 10px 8px 30px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:12, outline:'none', boxSizing:'border-box'}} />
          </div>
        </div>

        {/* Filtres */}
        <div style={{padding:'8px 12px', borderBottom:'1px solid #f1f5f9', display:'flex', gap:4, flexWrap:'wrap'}}>
          {[{v:'tous',l:'Tous'}, ...Object.entries(STATUS_CONFIG).map(([k,v])=>({v:k,l:v.label,c:v.color}))].map(f=>(
            <button key={f.v} onClick={()=>setFilter(f.v)}
              style={{padding:'3px 8px', borderRadius:6, border:`1px solid ${filter===f.v?(f.c||'#4f8ef7'):'#e2e8f0'}`, background:filter===f.v?(f.c||'#4f8ef7')+'15':'white', color:filter===f.v?(f.c||'#4f8ef7'):'#64748b', fontSize:10, cursor:'pointer', fontWeight:filter===f.v?700:400}}>
              {f.l}
            </button>
          ))}
        </div>

        {/* Distance info */}
        {distance && (
          <div style={{padding:'10px 14px', background:'#eff6ff', borderBottom:'1px solid #bfdbfe'}}>
            <div style={{fontSize:12, fontWeight:700, color:'#0078d4', marginBottom:4}}>📍 Itinéraire calculé</div>
            <div style={{display:'flex', gap:16, fontSize:12, color:'#374151'}}>
              <span>🛣 <strong>{distance.km} km</strong></span>
              <span>⏱ <strong>~{distance.min} min</strong></span>
              {distance.steps > 0 && <span>📋 {distance.steps} étapes</span>}
            </div>
            <button onClick={()=>{if(routeLayerRef.current&&mapInstanceRef.current){mapInstanceRef.current.removeLayer(routeLayerRef.current);routeLayerRef.current=null;}setDistance(null);setShowRoute(false);}}
              style={{marginTop:6, fontSize:10, color:'#dc2626', background:'none', border:'none', cursor:'pointer', fontWeight:600}}>✕ Supprimer l'itinéraire</button>
          </div>
        )}

        {/* Liste sites */}
        <div style={{flex:1, overflowY:'auto'}}>
          {filtered.map(site => {
            const cfg = STATUS_CONFIG[site.status] || STATUS_CONFIG.planifie;
            const isSelected = selected?.code === site.code;
            return (
              <div key={site.code}
                onClick={() => {
                  setSelected(site);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([site.lat, site.lng], 14, { animate: true });
                    markersRef.current[site.code]?.openPopup();
                  }
                }}
                style={{padding:'12px 14px', borderBottom:'1px solid #f8fafc', cursor:'pointer', background:isSelected?`${cfg.color}08`:'white', borderLeft:`3px solid ${isSelected?cfg.color:'transparent'}`, transition:'all .15s'}}
                onMouseEnter={e=>e.currentTarget.style.background=`${cfg.color}06`}
                onMouseLeave={e=>e.currentTarget.style.background=isSelected?`${cfg.color}08`:'white'}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:3}}>
                  <span style={{fontSize:12, fontWeight:700, color:cfg.color}}>{site.code}</span>
                  <span style={{padding:'1px 6px', borderRadius:6, fontSize:9, fontWeight:700, background:cfg.color+'15', color:cfg.color}}>{cfg.label}</span>
                </div>
                <div style={{fontSize:11, fontWeight:600, color:'#1e293b', marginBottom:3}}>{site.name}</div>
                <div style={{fontSize:10, color:'#94a3b8', marginBottom:5}}>📍 {site.adresse}</div>
                <div style={{background:'#f1f5f9', borderRadius:3, height:3, overflow:'hidden'}}>
                  <div style={{width:`${site.progression}%`, height:'100%', background:cfg.color, borderRadius:3}} />
                </div>
                <div style={{fontSize:9, color:'#94a3b8', textAlign:'right', marginTop:2}}>{site.progression}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== CARTE PRINCIPALE ===== */}
      <div style={{flex:1, position:'relative'}}>
        <div ref={mapRef} style={{width:'100%', height:'100%'}} />

        {!loaded && (
          <div style={{position:'absolute', inset:0, background:'#0f1b2d', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16}}>
            <div style={{width:48, height:48, borderRadius:'50%', border:'3px solid #4f8ef7', borderTopColor:'transparent', animation:'spin 1s linear infinite'}} />
            <div style={{color:'white', fontSize:14, fontWeight:600}}>Chargement de la carte satellite...</div>
            <div style={{color:'#64748b', fontSize:12}}>Réseau Cameroun · Données OpenStreetMap</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {loaded && (
          <>
            {/* Contrôles couches */}
            <div style={{position:'absolute', top:12, left:12, zIndex:1000, background:'white', borderRadius:10, padding:'10px', boxShadow:'0 4px 16px rgba(0,0,0,0.15)', border:'1px solid #e8ecf0'}}>
              <div style={{fontSize:10, fontWeight:700, color:'#64748b', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px'}}>Fond de carte</div>
              <div style={{display:'flex', flexDirection:'column', gap:4}}>
                {MAP_LAYERS.map(l => (
                  <button key={l.id} onClick={()=>changeLayer(l.id)}
                    style={{padding:'5px 10px', borderRadius:6, border:`1px solid ${activeLayer===l.id?'#4f8ef7':'#e2e8f0'}`, background:activeLayer===l.id?'#4f8ef7':'white', color:activeLayer===l.id?'white':'#374151', fontSize:11, cursor:'pointer', fontWeight:activeLayer===l.id?600:400, textAlign:'left', whiteSpace:'nowrap'}}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Légende */}
            <div style={{position:'absolute', bottom:40, left:12, zIndex:1000, background:'rgba(15,27,45,0.9)', borderRadius:10, padding:'10px 14px', border:'1px solid rgba(255,255,255,0.1)'}}>
              <div style={{fontSize:10, fontWeight:700, color:'#64748b', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px'}}>Légende</div>
              {Object.entries(STATUS_CONFIG).map(([k,v])=>(
                <div key={k} style={{display:'flex', alignItems:'center', gap:6, marginBottom:4, fontSize:11, color:'#e2e8f0'}}>
                  <div style={{width:10, height:10, borderRadius:'50%', background:v.color, flexShrink:0}} />{v.label}
                </div>
              ))}
            </div>

            {/* Stats overlay */}
            <div style={{position:'absolute', top:12, right:12, zIndex:1000, display:'flex', gap:8}}>
              {[{l:'Total',v:SITES.length,c:'#4f8ef7'},{l:'En cours',v:SITES.filter(s=>s.status==='en_cours').length,c:'#0078d4'},{l:'Critiques',v:SITES.filter(s=>s.status==='en_retard').length,c:'#dc2626'}].map(s=>(
                <div key={s.l} style={{background:'rgba(15,27,45,0.9)', borderRadius:8, padding:'8px 12px', border:`1px solid ${s.c}40`, textAlign:'center'}}>
                  <div style={{fontSize:18, fontWeight:800, color:s.c}}>{s.v}</div>
                  <div style={{fontSize:9, color:'#64748b'}}>{s.l}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ===== PANEL DROIT — Détail site ===== */}
      {selected && (
        <div style={{width:300, background:'white', borderLeft:'1px solid #e8ecf0', display:'flex', flexDirection:'column', overflow:'hidden', flexShrink:0, animation:'slideIn .25s ease'}}>
          <div style={{padding:'14px 16px', background:`linear-gradient(135deg,#0f1b2d,${STATUS_CONFIG[selected.status]?.color||'#4f8ef7'})`, color:'white', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexShrink:0}}>
            <div>
              <div style={{fontSize:16, fontWeight:800}}>{selected.code}</div>
              <div style={{fontSize:11, opacity:0.8, marginTop:2}}>{selected.name}</div>
            </div>
            <button onClick={()=>setSelected(null)} style={{background:'rgba(255,255,255,0.2)', border:'none', color:'white', width:24, height:24, borderRadius:'50%', cursor:'pointer', fontSize:12, flexShrink:0}}>✕</button>
          </div>

          <div style={{flex:1, overflowY:'auto', padding:16}}>
            {/* Infos site */}
            {[{l:'Statut',v:STATUS_CONFIG[selected.status]?.label},{l:'Technologie',v:selected.type},{l:'Priorité',v:selected.priority},{l:'Technicien',v:selected.technicien},{l:'Adresse',v:selected.adresse},{l:'Budget',v:`${fmtN(selected.budget)} XAF`},{l:'GPS',v:`${selected.lat.toFixed(4)}, ${selected.lng.toFixed(4)}`}].map(i=>(
              <div key={i.l} style={{display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid #f8fafc', gap:8}}>
                <span style={{fontSize:12, color:'#64748b', flexShrink:0}}>{i.l}</span>
                <span style={{fontSize:12, fontWeight:600, color:'#1e293b', textAlign:'right'}}>{i.v}</span>
              </div>
            ))}

            {/* Progression */}
            <div style={{marginTop:14, marginBottom:16}}>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:12, color:'#64748b', marginBottom:6}}>
                <span>Progression</span>
                <span style={{fontWeight:700, color:STATUS_CONFIG[selected.status]?.color}}>{selected.progression}%</span>
              </div>
              <div style={{background:'#f1f5f9', borderRadius:6, height:10, overflow:'hidden'}}>
                <div style={{width:`${selected.progression}%`, height:'100%', background:STATUS_CONFIG[selected.status]?.color||'#4f8ef7', borderRadius:6}} />
              </div>
            </div>

            {/* Navigation section */}
            <div style={{background:'#f8fafc', borderRadius:10, padding:'12px', marginBottom:12, border:'1px solid #e8ecf0'}}>
              <div style={{fontSize:12, fontWeight:700, color:'#1e293b', marginBottom:10, display:'flex', alignItems:'center', gap:6}}>
                🧭 Navigation & Accès
              </div>

              {/* Itinéraire OSRM */}
              <button onClick={()=>getRoute(selected)} disabled={routeLoading}
                style={{width:'100%', padding:'9px', borderRadius:8, border:'none', background:routeLoading?'#94a3b8':'#4f8ef7', color:'white', cursor:routeLoading?'not-allowed':'pointer', fontSize:12, fontWeight:600, marginBottom:8, display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
                {routeLoading?<><div style={{width:14,height:14,borderRadius:'50%',border:'2px solid white',borderTopColor:'transparent',animation:'spin 1s linear infinite'}} />Calcul...</>:'🛣 Calculer l\'itinéraire'}
              </button>
              <div style={{fontSize:10, color:'#94a3b8', textAlign:'center', marginBottom:8}}>Via OSRM · Routes réelles OpenStreetMap</div>

              {/* Google Maps */}
              <button onClick={()=>openGoogleMaps(selected)}
                style={{width:'100%', padding:'9px', borderRadius:8, border:'1px solid #e2e8f0', background:'white', color:'#374151', cursor:'pointer', fontSize:12, fontWeight:600, marginBottom:8, display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
                🗺 Ouvrir dans Google Maps
              </button>

              {/* Google Earth */}
              <button onClick={()=>openGoogleEarth(selected)}
                style={{width:'100%', padding:'9px', borderRadius:8, border:'1px solid #e2e8f0', background:'white', color:'#374151', cursor:'pointer', fontSize:12, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
                🌍 Vue Google Earth
              </button>
            </div>

            {/* Partager position */}
            <button onClick={()=>{navigator.clipboard?.writeText(`https://maps.google.com/?q=${selected.lat},${selected.lng}`);alert('Lien GPS copié !');}}
              style={{width:'100%', padding:'9px', borderRadius:8, border:'1px solid #e2e8f0', background:'white', color:'#374151', cursor:'pointer', fontSize:12, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
              📋 Copier le lien GPS
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { transform:translateX(100%);opacity:0; } to { transform:translateX(0);opacity:1; } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        .leaflet-popup-content-wrapper { border-radius:12px!important; box-shadow:0 8px 32px rgba(0,0,0,0.15)!important; }
        .leaflet-popup-content { margin:14px 16px!important; }
        .leaflet-container { font-family:'Segoe UI',Arial,sans-serif!important; }
      `}</style>
    </div>
  );
}
