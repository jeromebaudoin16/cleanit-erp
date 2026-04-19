import { useEffect, useRef, useState } from 'react';

const SITES = [
  { code:'DLA-001', name:'Site Akwa Douala', lat:4.0511, lng:9.7085, status:'en_cours', type:'5G NR', progression:65 },
  { code:'DLA-003', name:'Site Bonabéri', lat:4.0667, lng:9.6500, status:'en_retard', type:'4G LTE', progression:30 },
  { code:'YDE-001', name:'Site Centre Yaoundé', lat:3.8480, lng:11.5021, status:'termine', type:'5G NR', progression:100 },
  { code:'BFN-001', name:'Site Bafoussam', lat:5.4764, lng:10.4214, status:'planifie', type:'4G LTE', progression:0 },
  { code:'GAR-001', name:'Site Garoua', lat:9.3019, lng:13.3920, status:'en_cours', type:'3G UMTS', progression:55 },
  { code:'KRI-001', name:'Site Kribi Port', lat:2.9395, lng:9.9087, status:'livre', type:'5G NR', progression:100 },
  { code:'LIM-001', name:'Site Limbé', lat:4.0167, lng:9.2000, status:'en_cours', type:'4G LTE', progression:75 },
  { code:'MAR-001', name:'Site Maroua', lat:10.5900, lng:14.3157, status:'planifie', type:'4G LTE', progression:0 },
];

const TECHNICIENS = [
  { id:1, nom:'Thomas Ngono', lat:4.0600, lng:9.7200, status:'en_mission', site:'DLA-001', type:'5G NR', phone:'+237 677 001 001', avatar:'TN', color:'#2563eb' },
  { id:2, nom:'Jean Mbarga', lat:3.8600, lng:11.5100, status:'en_mission', site:'YDE-001', type:'5G NR', phone:'+237 677 001 002', avatar:'JM', color:'#7c3aed' },
  { id:3, nom:'Samuel Djomo', lat:5.4900, lng:10.4400, status:'en_deplacement', site:'BFN-001', type:'4G LTE', phone:'+237 677 001 003', avatar:'SD', color:'#16a34a' },
  { id:4, nom:'Ali Moussa', lat:9.2800, lng:13.4100, status:'en_mission', site:'GAR-001', type:'3G UMTS', phone:'+237 677 001 004', avatar:'AM', color:'#d97706' },
  { id:5, nom:'Pierre Etoga', lat:4.0400, lng:9.6800, status:'disponible', site:'—', type:'—', phone:'+237 677 001 005', avatar:'PE', color:'#059669' },
];

const STATUS_SITES = {
  planifie:  { color:'#7c3aed', label:'Planifié' },
  en_cours:  { color:'#2563eb', label:'En cours' },
  termine:   { color:'#16a34a', label:'Terminé' },
  livre:     { color:'#059669', label:'Livré' },
  en_retard: { color:'#dc2626', label:'En retard' },
};

const STATUS_TECH = {
  en_mission:    { color:'#2563eb', label:'En mission', bg:'#eff6ff' },
  en_deplacement:{ color:'#d97706', label:'En déplacement', bg:'#fefce8' },
  disponible:    { color:'#16a34a', label:'Disponible', bg:'#f0fdf4' },
  hors_ligne:    { color:'#94a3b8', label:'Hors ligne', bg:'#f8fafc' },
};

const fmtN = n => new Intl.NumberFormat('fr-FR').format(n||0);

export default function MapPage() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef({});
  const techMarkersRef = useRef({});
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedTech, setSelectedTech] = useState(null);
  const [filter, setFilter] = useState('tous');
  const [showTechs, setShowTechs] = useState(true);
  const [activeLayer, setActiveLayer] = useState('satellite');
  const [searchQ, setSearchQ] = useState('');

  const LAYERS = [
    { id:'osm',       label:'Standard',  url:'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
    { id:'satellite', label:'Satellite', url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
    { id:'terrain',   label:'Terrain',   url:'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' },
  ];

  useEffect(() => {
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
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current || mapInstanceRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, { center:[5.5,12.0], zoom:6, zoomControl:false });
    L.control.zoom({ position:'bottomright' }).addTo(map);

    // Tile satellite par défaut
    tileLayerRef.current = L.tileLayer(LAYERS.find(l=>l.id==='satellite').url, {
      attribution:'© Esri', maxZoom:19
    }).addTo(map);

    // Marqueurs Sites
    SITES.forEach(site => {
      const cfg = STATUS_SITES[site.status] || STATUS_SITES.planifie;
      const icon = L.divIcon({
        html:`<div style="position:relative;width:46px;height:54px;">
          <div style="width:46px;height:46px;border-radius:50%;background:${cfg.color};border:3px solid white;box-shadow:0 4px 14px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;flex-direction:column;cursor:pointer;">
            <span style="color:white;font-weight:900;font-size:10px;">${site.type.includes('5G')?'5G':site.type.includes('4G')?'4G':'3G'}</span>
            <span style="color:rgba(255,255,255,0.8);font-size:7px;">${site.code}</span>
          </div>
          <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:10px solid ${cfg.color};"></div>
        </div>`,
        className:'', iconSize:[46,54], iconAnchor:[23,54], popupAnchor:[0,-58]
      });

      const marker = L.marker([site.lat, site.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:'Segoe UI',Arial,sans-serif;min-width:220px;padding:4px;">
            <div style="font-weight:800;font-size:14px;color:#0f172a;margin-bottom:6px;">${site.code} · ${site.name}</div>
            <span style="padding:3px 9px;border-radius:10px;font-size:11px;font-weight:600;background:${cfg.color}20;color:${cfg.color};">${cfg.label}</span>
            <div style="margin-top:8px;font-size:12px;color:#64748b;">${site.type}</div>
            <div style="background:#f1f5f9;border-radius:4px;height:6px;overflow:hidden;margin-top:8px;">
              <div style="width:${site.progression}%;height:100%;background:${cfg.color};border-radius:4px;"></div>
            </div>
            <div style="font-size:11px;color:#64748b;text-align:right;margin-top:3px;">${site.progression}%</div>
          </div>
        `, { maxWidth:250 });

      marker.on('click', () => { setSelected(site); setSelectedTech(null); });
      markersRef.current[site.code] = marker;
    });

    // Marqueurs Techniciens
    TECHNICIENS.forEach(tech => {
      const st = STATUS_TECH[tech.status] || STATUS_TECH.disponible;
      const icon = L.divIcon({
        html:`<div style="position:relative;width:38px;height:44px;">
          <div style="width:38px;height:38px;border-radius:12px;background:${tech.color};border:3px solid white;box-shadow:0 4px 14px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;cursor:pointer;">
            <span style="color:white;font-weight:900;font-size:11px;">${tech.avatar}</span>
          </div>
          <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:8px solid ${tech.color};"></div>
          <div style="position:absolute;top:-3px;right:-3px;width:12px;height:12px;border-radius:50%;background:${st.color};border:2px solid white;"></div>
        </div>`,
        className:'', iconSize:[38,44], iconAnchor:[19,44], popupAnchor:[0,-48]
      });

      const marker = L.marker([tech.lat, tech.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:'Segoe UI',Arial,sans-serif;min-width:200px;padding:4px;">
            <div style="font-weight:800;font-size:14px;color:#0f172a;margin-bottom:6px;">👷 ${tech.nom}</div>
            <span style="padding:3px 9px;border-radius:10px;font-size:11px;font-weight:600;background:${st.bg};color:${st.color};">${st.label}</span>
            <div style="margin-top:8px;font-size:12px;color:#64748b;">📡 Site: <strong>${tech.site}</strong></div>
            <div style="font-size:12px;color:#64748b;">📞 ${tech.phone}</div>
          </div>
        `, { maxWidth:230 });

      marker.on('click', () => { setSelectedTech(tech); setSelected(null); });
      techMarkersRef.current[tech.id] = marker;
    });

    // Localisation utilisateur
    navigator.geolocation?.getCurrentPosition(pos => {
      const { latitude:lat, longitude:lng } = pos.coords;
      L.marker([lat, lng], {
        icon: L.divIcon({
          html:`<div style="width:16px;height:16px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 2px 8px rgba(37,99,235,0.5);"></div>`,
          className:'', iconSize:[16,16], iconAnchor:[8,8]
        })
      }).addTo(map).bindPopup('📍 Votre position');
    }, ()=>{});

    mapInstanceRef.current = map;
  }, [loaded]);

  // Toggle techniciens
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    Object.values(techMarkersRef.current).forEach(m => {
      if (showTechs) mapInstanceRef.current.addLayer(m);
      else mapInstanceRef.current.removeLayer(m);
    });
  }, [showTechs]);

  const changeLayer = (layerId) => {
    if (!mapInstanceRef.current || !window.L) return;
    if (tileLayerRef.current) mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const layer = LAYERS.find(l => l.id === layerId);
    tileLayerRef.current = window.L.tileLayer(layer.url, { attribution:'© OpenStreetMap/Esri', maxZoom:19 }).addTo(mapInstanceRef.current);
    setActiveLayer(layerId);
  };

  const flyTo = (lat, lng, zoom=13) => {
    mapInstanceRef.current?.setView([lat, lng], zoom, { animate:true });
  };

  const openGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  const filteredSites = SITES.filter(s => {
    const mf = filter === 'tous' || s.status === filter;
    const mq = !searchQ || s.code.toLowerCase().includes(searchQ.toLowerCase()) || s.name.toLowerCase().includes(searchQ.toLowerCase());
    return mf && mq;
  });

  return (
    <div style={{display:'flex', height:'calc(100vh - 56px)', overflow:'hidden', fontFamily:"'Segoe UI',Arial,sans-serif"}}>

      {/* PANEL GAUCHE */}
      <div style={{width:300, background:'white', borderRight:'1px solid #e2e8f0', display:'flex', flexDirection:'column', overflow:'hidden', flexShrink:0, zIndex:10}}>
        <div style={{padding:'14px 16px', borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#0f172a,#1e293b)'}}>
          <h2 style={{fontSize:15, fontWeight:800, color:'white', margin:'0 0 3px'}}>🛰 Carte Digital Twin</h2>
          <p style={{fontSize:11, color:'#64748b', margin:0}}>Sites réseau + Techniciens terrain</p>
        </div>

        {/* Recherche */}
        <div style={{padding:'10px 12px', borderBottom:'1px solid #f1f5f9'}}>
          <input placeholder="🔍 Rechercher site..." value={searchQ} onChange={e=>setSearchQ(e.target.value)}
            style={{width:'100%', padding:'8px 10px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:12, outline:'none', boxSizing:'border-box'}} />
        </div>

        {/* Toggle techniciens */}
        <div style={{padding:'8px 12px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <span style={{fontSize:12, fontWeight:600, color:'#374151'}}>👷 Techniciens terrain</span>
          <button onClick={()=>setShowTechs(!showTechs)}
            style={{padding:'4px 10px', borderRadius:6, border:'none', background:showTechs?'#2563eb':'#f1f5f9', color:showTechs?'white':'#64748b', fontSize:11, cursor:'pointer', fontWeight:600}}>
            {showTechs?'Masquer':'Afficher'}
          </button>
        </div>

        {/* Filtres statut */}
        <div style={{padding:'8px 12px', borderBottom:'1px solid #f1f5f9', display:'flex', gap:4, flexWrap:'wrap'}}>
          {[{v:'tous',l:'Tous'}, ...Object.entries(STATUS_SITES).map(([k,v])=>({v:k,l:v.label,c:v.color}))].map(f=>(
            <button key={f.v} onClick={()=>setFilter(f.v)}
              style={{padding:'3px 8px', borderRadius:6, border:`1px solid ${filter===f.v?(f.c||'#2563eb'):'#e2e8f0'}`, background:filter===f.v?`${f.c||'#2563eb'}15`:'white', color:filter===f.v?(f.c||'#2563eb'):'#64748b', fontSize:10, cursor:'pointer', fontWeight:filter===f.v?700:400}}>
              {f.l}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{padding:'8px 12px', borderBottom:'1px solid #f1f5f9', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6}}>
          {[{l:'Sites',v:SITES.length,c:'#2563eb'},{l:'En cours',v:SITES.filter(s=>s.status==='en_cours').length,c:'#2563eb'},{l:'Critiques',v:SITES.filter(s=>s.status==='en_retard').length,c:'#dc2626'},{l:'Techs actifs',v:TECHNICIENS.filter(t=>t.status!=='hors_ligne').length,c:'#16a34a'},{l:'En mission',v:TECHNICIENS.filter(t=>t.status==='en_mission').length,c:'#2563eb'},{l:'Disponibles',v:TECHNICIENS.filter(t=>t.status==='disponible').length,c:'#059669'}].map(s=>(
            <div key={s.l} style={{background:`${s.c}08`, borderRadius:8, padding:'6px 8px', textAlign:'center', border:`1px solid ${s.c}15`}}>
              <div style={{fontSize:16, fontWeight:800, color:s.c}}>{s.v}</div>
              <div style={{fontSize:8, color:'#64748b'}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Techniciens */}
        {showTechs && (
          <div style={{borderBottom:'1px solid #f1f5f9'}}>
            <div style={{padding:'8px 12px 4px', fontSize:10, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.5px'}}>Techniciens</div>
            {TECHNICIENS.map(tech => {
              const st = STATUS_TECH[tech.status] || STATUS_TECH.disponible;
              return (
                <div key={tech.id} onClick={()=>{flyTo(tech.lat, tech.lng, 14); setSelectedTech(tech); setSelected(null);}}
                  style={{padding:'8px 12px', borderBottom:'1px solid #f8fafc', cursor:'pointer', background:selectedTech?.id===tech.id?`${tech.color}06`:'white', display:'flex', alignItems:'center', gap:8, transition:'all .15s'}}
                  onMouseEnter={e=>e.currentTarget.style.background=`${tech.color}06`}
                  onMouseLeave={e=>e.currentTarget.style.background=selectedTech?.id===tech.id?`${tech.color}06`:'white'}>
                  <div style={{width:32, height:32, borderRadius:10, background:tech.color, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:10, flexShrink:0, position:'relative'}}>
                    {tech.avatar}
                    <div style={{position:'absolute', top:-3, right:-3, width:10, height:10, borderRadius:'50%', background:st.color, border:'2px solid white'}} />
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12, fontWeight:700, color:'#1e293b'}}>{tech.nom}</div>
                    <div style={{fontSize:10, color:'#64748b'}}>{tech.site !== '—' ? `📡 ${tech.site}` : '—'}</div>
                  </div>
                  <div style={{padding:'2px 6px', borderRadius:6, background:st.bg, border:`1px solid ${st.color}25`}}>
                    <div style={{fontSize:8, fontWeight:700, color:st.color}}>{st.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Liste sites */}
        <div style={{flex:1, overflowY:'auto'}}>
          <div style={{padding:'8px 12px 4px', fontSize:10, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.5px'}}>Sites réseau</div>
          {filteredSites.map(site => {
            const cfg = STATUS_SITES[site.status] || STATUS_SITES.planifie;
            return (
              <div key={site.code} onClick={()=>{flyTo(site.lat, site.lng, 14); setSelected(site); setSelectedTech(null);}}
                style={{padding:'10px 12px', borderBottom:'1px solid #f8fafc', cursor:'pointer', background:selected?.code===site.code?`${cfg.color}08`:'white', borderLeft:`3px solid ${selected?.code===site.code?cfg.color:'transparent'}`, transition:'all .15s'}}
                onMouseEnter={e=>e.currentTarget.style.background=`${cfg.color}06`}
                onMouseLeave={e=>e.currentTarget.style.background=selected?.code===site.code?`${cfg.color}08`:'white'}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:3}}>
                  <span style={{fontSize:11, fontWeight:700, color:cfg.color}}>{site.code}</span>
                  <span style={{padding:'1px 6px', borderRadius:6, fontSize:9, fontWeight:700, background:`${cfg.color}15`, color:cfg.color}}>{cfg.label}</span>
                </div>
                <div style={{fontSize:11, fontWeight:600, color:'#1e293b', marginBottom:3}}>{site.name}</div>
                <div style={{background:'#f1f5f9', borderRadius:3, height:3, overflow:'hidden'}}>
                  <div style={{width:`${site.progression}%`, height:'100%', background:cfg.color, borderRadius:3}} />
                </div>
                <div style={{fontSize:9, color:'#94a3b8', textAlign:'right', marginTop:1}}>{site.progression}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CARTE */}
      <div style={{flex:1, position:'relative'}}>
        <div ref={mapRef} style={{width:'100%', height:'100%'}} />

        {!loaded && (
          <div style={{position:'absolute', inset:0, background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12}}>
            <div style={{width:44, height:44, borderRadius:'50%', border:'3px solid #2563eb', borderTopColor:'transparent', animation:'spin 1s linear infinite'}} />
            <div style={{color:'white', fontSize:13}}>Chargement de la carte satellite...</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {loaded && <>
          {/* Contrôles fond de carte */}
          <div style={{position:'absolute', top:12, left:12, zIndex:1000, background:'white', borderRadius:10, padding:10, boxShadow:'0 4px 16px rgba(0,0,0,0.12)'}}>
            <div style={{fontSize:10, fontWeight:700, color:'#64748b', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px'}}>Fond</div>
            {LAYERS.map(l=>(
              <button key={l.id} onClick={()=>changeLayer(l.id)}
                style={{display:'block', width:'100%', padding:'5px 10px', marginBottom:3, borderRadius:6, border:`1px solid ${activeLayer===l.id?'#2563eb':'#e2e8f0'}`, background:activeLayer===l.id?'#2563eb':'white', color:activeLayer===l.id?'white':'#374151', fontSize:11, cursor:'pointer', fontWeight:activeLayer===l.id?600:400, textAlign:'left'}}>
                {l.label}
              </button>
            ))}
          </div>

          {/* Légende */}
          <div style={{position:'absolute', bottom:40, left:12, zIndex:1000, background:'rgba(15,23,42,0.88)', borderRadius:10, padding:'10px 14px'}}>
            <div style={{fontSize:10, fontWeight:700, color:'#64748b', marginBottom:6, textTransform:'uppercase'}}>Sites</div>
            {Object.entries(STATUS_SITES).map(([k,v])=>(
              <div key={k} style={{display:'flex', alignItems:'center', gap:6, marginBottom:3, fontSize:11, color:'#e2e8f0'}}>
                <div style={{width:10, height:10, borderRadius:'50%', background:v.color}} />{v.label}
              </div>
            ))}
            <div style={{height:1, background:'rgba(255,255,255,0.1)', margin:'6px 0'}} />
            <div style={{fontSize:10, fontWeight:700, color:'#64748b', marginBottom:4}}>Techniciens</div>
            {Object.entries(STATUS_TECH).map(([k,v])=>(
              <div key={k} style={{display:'flex', alignItems:'center', gap:6, marginBottom:3, fontSize:11, color:'#e2e8f0'}}>
                <div style={{width:10, height:10, borderRadius:2, background:v.color}} />{v.label}
              </div>
            ))}
          </div>
        </>}
      </div>

      {/* PANEL DROIT — Détail */}
      {(selected || selectedTech) && (
        <div style={{width:280, background:'white', borderLeft:'1px solid #e2e8f0', display:'flex', flexDirection:'column', overflow:'hidden', flexShrink:0}}>

          {selected && (
            <>
              <div style={{padding:'14px 16px', background:`linear-gradient(135deg,#0f172a,${STATUS_SITES[selected.status]?.color||'#2563eb'})`, color:'white', display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div>
                  <div style={{fontSize:16, fontWeight:800}}>{selected.code}</div>
                  <div style={{fontSize:11, opacity:0.8, marginTop:2}}>{selected.name}</div>
                </div>
                <button onClick={()=>setSelected(null)} style={{background:'rgba(255,255,255,0.2)', border:'none', color:'white', width:24, height:24, borderRadius:'50%', cursor:'pointer', fontSize:13}}>✕</button>
              </div>
              <div style={{flex:1, overflowY:'auto', padding:16}}>
                <div style={{padding:'3px 10px', borderRadius:8, background:`${STATUS_SITES[selected.status]?.color||'#2563eb'}12`, display:'inline-block', marginBottom:14}}>
                  <span style={{fontSize:11, fontWeight:700, color:STATUS_SITES[selected.status]?.color||'#2563eb'}}>{STATUS_SITES[selected.status]?.label}</span>
                </div>
                {[{l:'Type',v:selected.type},{l:'GPS',v:`${selected.lat.toFixed(4)}°N, ${selected.lng.toFixed(4)}°E`}].map(i=>(
                  <div key={i.l} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #f8fafc'}}>
                    <span style={{fontSize:12, color:'#64748b'}}>{i.l}</span>
                    <span style={{fontSize:12, fontWeight:600, color:'#1e293b'}}>{i.v}</span>
                  </div>
                ))}
                <div style={{marginTop:14}}>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:12, color:'#64748b', marginBottom:6}}>
                    <span>Progression</span>
                    <span style={{fontWeight:700, color:STATUS_SITES[selected.status]?.color}}>{selected.progression}%</span>
                  </div>
                  <div style={{background:'#f1f5f9', borderRadius:6, height:10, overflow:'hidden'}}>
                    <div style={{width:`${selected.progression}%`, height:'100%', background:STATUS_SITES[selected.status]?.color||'#2563eb', borderRadius:6}} />
                  </div>
                </div>

                {/* Technicien sur ce site */}
                {(() => {
                  const tech = TECHNICIENS.find(t => t.site === selected.code);
                  return tech ? (
                    <div style={{marginTop:14, padding:'12px', borderRadius:10, background:`${tech.color}08`, border:`1px solid ${tech.color}20`}}>
                      <div style={{fontSize:11, fontWeight:700, color:'#64748b', marginBottom:6}}>👷 Technicien sur site</div>
                      <div style={{display:'flex', alignItems:'center', gap:8}}>
                        <div style={{width:36, height:36, borderRadius:10, background:tech.color, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:11}}>{tech.avatar}</div>
                        <div>
                          <div style={{fontSize:13, fontWeight:700, color:'#1e293b'}}>{tech.nom}</div>
                          <div style={{fontSize:11, color:'#64748b'}}>{STATUS_TECH[tech.status]?.label}</div>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                <div style={{display:'flex', gap:8, marginTop:16}}>
                  <button onClick={()=>openGoogleMaps(selected.lat, selected.lng)}
                    style={{flex:1, padding:'9px', borderRadius:8, border:'none', background:'#2563eb', color:'white', cursor:'pointer', fontSize:12, fontWeight:600}}>🗺 Google Maps</button>
                  <button onClick={()=>window.open(`https://earth.google.com/web/@${selected.lat},${selected.lng},500a,800d,35y`, '_blank')}
                    style={{flex:1, padding:'9px', borderRadius:8, border:'1px solid #e2e8f0', background:'white', color:'#374151', cursor:'pointer', fontSize:12, fontWeight:600}}>🌍 Earth</button>
                </div>
              </div>
            </>
          )}

          {selectedTech && !selected && (
            <>
              <div style={{padding:'14px 16px', background:`linear-gradient(135deg,#0f172a,${selectedTech.color})`, color:'white', display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div>
                  <div style={{fontSize:16, fontWeight:800}}>👷 {selectedTech.nom}</div>
                  <div style={{fontSize:11, opacity:0.8, marginTop:2}}>{STATUS_TECH[selectedTech.status]?.label}</div>
                </div>
                <button onClick={()=>setSelectedTech(null)} style={{background:'rgba(255,255,255,0.2)', border:'none', color:'white', width:24, height:24, borderRadius:'50%', cursor:'pointer', fontSize:13}}>✕</button>
              </div>
              <div style={{flex:1, overflowY:'auto', padding:16}}>
                <div style={{padding:'3px 10px', borderRadius:8, background:`${STATUS_TECH[selectedTech.status]?.bg}`, display:'inline-block', marginBottom:14}}>
                  <span style={{fontSize:11, fontWeight:700, color:STATUS_TECH[selectedTech.status]?.color}}>{STATUS_TECH[selectedTech.status]?.label}</span>
                </div>
                {[{l:'Site actuel',v:selectedTech.site},{l:'Téléphone',v:selectedTech.phone},{l:'GPS',v:`${selectedTech.lat.toFixed(4)}°N, ${selectedTech.lng.toFixed(4)}°E`}].map(i=>(
                  <div key={i.l} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #f8fafc'}}>
                    <span style={{fontSize:12, color:'#64748b'}}>{i.l}</span>
                    <span style={{fontSize:12, fontWeight:600, color:'#1e293b', textAlign:'right', maxWidth:160}}>{i.v}</span>
                  </div>
                ))}
                <div style={{display:'flex', gap:8, marginTop:16}}>
                  <button onClick={()=>openGoogleMaps(selectedTech.lat, selectedTech.lng)}
                    style={{flex:1, padding:'9px', borderRadius:8, border:'none', background:'#2563eb', color:'white', cursor:'pointer', fontSize:12, fontWeight:600}}>🗺 Localiser</button>
                  <button onClick={()=>window.open(`tel:${selectedTech.phone}`)}
                    style={{flex:1, padding:'9px', borderRadius:8, border:'1px solid #e2e8f0', background:'white', color:'#374151', cursor:'pointer', fontSize:12, fontWeight:600}}>📞 Appeler</button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        .leaflet-popup-content-wrapper { border-radius:12px!important; box-shadow:0 8px 32px rgba(0,0,0,0.15)!important; }
        .leaflet-popup-content { margin:14px 16px!important; }
      `}</style>
    </div>
  );
}
