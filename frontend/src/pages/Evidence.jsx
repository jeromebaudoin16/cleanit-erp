import { useState, useRef, useEffect, useCallback } from 'react';

const fmtD = d => new Date(d).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'});

const WATERMARK_FIELDS = [
  { key:'technicien', label:'Technicien', default:'Thomas Ngono' },
  { key:'site', label:'Code Site', default:'DLA-001' },
  { key:'mission', label:'Mission', default:'Installation 5G' },
  { key:'entreprise', label:'Entreprise', default:'CleanIT ERP' },
];

export default function Evidence() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const animFrameRef = useRef(null);
  const watchIdRef = useRef(null);

  const [mode, setMode] = useState('camera'); // camera | gallery
  const [cameraActive, setCameraActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [facingMode, setFacingMode] = useState('environment');
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [gps, setGps] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [watermark, setWatermark] = useState({
    technicien: 'Thomas Ngono',
    site: 'DLA-001',
    mission: 'Installation 5G',
    entreprise: 'CleanIT ERP',
  });
  const [showSettings, setShowSettings] = useState(false);
  const [selected, setSelected] = useState(null);
  const [flash, setFlash] = useState(false);
  const [zoom, setZoom] = useState(1);
  const timerRef = useRef(null);

  // GPS continu
  useEffect(() => {
    startGPS();
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const startGPS = () => {
    if (!navigator.geolocation) { setGpsError('GPS non disponible'); return; }
    setGpsLoading(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude, alt: pos.coords.altitude });
        setGpsAccuracy(Math.round(pos.coords.accuracy));
        setGpsLoading(false);
        setGpsError(null);
      },
      err => { setGpsError('GPS indisponible'); setGpsLoading(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 2000 }
    );
  };

  // Démarrer caméra
  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      drawOverlay();
    } catch(e) {
      alert('Impossible d\'accéder à la caméra: ' + e.message);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setCameraActive(false);
  };

  // Overlay NoteCam en temps réel sur le canvas
  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const now = new Date();
    const dateStr = now.toLocaleString('fr-FR', { day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit' });

    // Fond semi-transparent en bas
    const barH = 180;
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, canvas.height - barH, canvas.width, barH);

    // Logo CleanIT
    ctx.fillStyle = '#4f8ef7';
    ctx.font = `bold ${canvas.width * 0.022}px Segoe UI, Arial`;
    ctx.fillText('● CleanIT ERP', 24, canvas.height - barH + 32);

    // Ligne séparatrice
    ctx.strokeStyle = '#4f8ef7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(24, canvas.height - barH + 40);
    ctx.lineTo(canvas.width - 24, canvas.height - barH + 40);
    ctx.stroke();

    const fSize = canvas.width * 0.018;
    ctx.font = `${fSize}px Segoe UI, Arial`;

    // Colonne gauche
    const leftData = [
      ['📅 Date/Heure', dateStr],
      ['📡 Site', watermark.site],
      ['🔧 Mission', watermark.mission],
      ['👷 Technicien', watermark.technicien],
    ];
    leftData.forEach(([label, val], i) => {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText(label + ':', 24, canvas.height - barH + 64 + i * 32);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${fSize}px Segoe UI, Arial`;
      ctx.fillText(val, 200, canvas.height - barH + 64 + i * 32);
      ctx.font = `${fSize}px Segoe UI, Arial`;
    });

    // Colonne droite — GPS
    if (gps) {
      const rightData = [
        ['📍 Latitude', gps.lat.toFixed(6) + '°'],
        ['📍 Longitude', gps.lng.toFixed(6) + '°'],
        ['🏔 Altitude', gps.alt ? gps.alt.toFixed(1) + ' m' : 'N/A'],
        ['🎯 Précision', gpsAccuracy ? `±${gpsAccuracy} m` : 'N/A'],
      ];
      rightData.forEach(([label, val], i) => {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText(label + ':', canvas.width / 2 + 24, canvas.height - barH + 64 + i * 32);
        ctx.fillStyle = '#34c97e';
        ctx.font = `bold ${fSize}px Segoe UI, Arial`;
        ctx.fillText(val, canvas.width / 2 + 180, canvas.height - barH + 64 + i * 32);
        ctx.font = `${fSize}px Segoe UI, Arial`;
      });
    } else {
      ctx.fillStyle = '#f59e0b';
      ctx.font = `bold ${fSize}px Segoe UI, Arial`;
      ctx.fillText('📍 GPS en cours de localisation...', canvas.width / 2 + 24, canvas.height - barH + 80);
    }

    // Entreprise + filigrane
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = `${canvas.width * 0.014}px Segoe UI, Arial`;
    ctx.fillText(watermark.entreprise, canvas.width - 200, canvas.height - 12);

    // Si enregistrement — point rouge clignotant
    if (recording) {
      ctx.fillStyle = `rgba(220,38,38,${Math.sin(Date.now()/300)*0.5+0.5})`;
      ctx.beginPath();
      ctx.arc(canvas.width - 40, 30, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = `bold ${fSize}px Segoe UI, Arial`;
      ctx.fillText('REC', canvas.width - 80, 36);
    }

    animFrameRef.current = requestAnimationFrame(drawOverlay);
  }, [gps, gpsAccuracy, watermark, recording]);

  useEffect(() => {
    if (cameraActive) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      drawOverlay();
    }
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [cameraActive, drawOverlay]);

  // Prendre photo
  const takePhoto = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Flash
    setFlash(true);
    setTimeout(() => setFlash(false), 150);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const photo = {
      id: Date.now(),
      type: 'photo',
      data: dataUrl,
      date: new Date().toISOString(),
      gps: gps ? { ...gps } : null,
      gpsAccuracy,
      watermark: { ...watermark },
      site: watermark.site,
      technicien: watermark.technicien,
    };
    setPhotos(p => [photo, ...p]);
  };

  // Démarrer/arrêter enregistrement vidéo
  const toggleRecord = () => {
    if (!streamRef.current) return;

    if (!recording) {
      chunksRef.current = [];
      const mr = new MediaRecorder(streamRef.current, { mimeType: 'video/webm;codecs=vp9' });
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const video = {
          id: Date.now(),
          type: 'video',
          url,
          blob,
          date: new Date().toISOString(),
          gps: gps ? { ...gps } : null,
          duration: recordingTime,
          watermark: { ...watermark },
          site: watermark.site,
          technicien: watermark.technicien,
        };
        setVideos(v => [video, ...v]);
        setRecordingTime(0);
      };
      mr.start(1000);
      mediaRecorderRef.current = mr;
      setRecording(true);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } else {
      mediaRecorderRef.current?.stop();
      clearInterval(timerRef.current);
      setRecording(false);
    }
  };

  // Flip caméra
  const flipCamera = async () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    if (cameraActive) {
      stopCamera();
      setTimeout(() => startCamera(), 200);
    }
  };

  // Télécharger photo
  const downloadPhoto = (photo) => {
    const a = document.createElement('a');
    a.href = photo.data;
    a.download = `CleanIT_${photo.site}_${photo.watermark.technicien}_${new Date(photo.date).toLocaleDateString('fr-FR').replace(/\//g,'-')}.jpg`;
    a.click();
  };

  const downloadVideo = (video) => {
    const a = document.createElement('a');
    a.href = video.url;
    a.download = `CleanIT_Video_${video.site}_${new Date(video.date).toLocaleDateString('fr-FR').replace(/\//g,'-')}.webm`;
    a.click();
  };

  const allMedia = [...photos.map(p=>({...p,mediaType:'photo'})), ...videos.map(v=>({...v,mediaType:'video'}))].sort((a,b) => new Date(b.date)-new Date(a.date));
  const fmtTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <div style={{height:'calc(100vh - 56px)', display:'flex', flexDirection:'column', background:'#0f1b2d', fontFamily:"'Segoe UI',Arial,sans-serif"}}>

      {/* Header */}
      <div style={{background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', padding:'10px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid rgba(255,255,255,0.1)', flexShrink:0}}>
        <div style={{flex:1}}>
          <div style={{fontSize:15, fontWeight:800, color:'white', display:'flex', alignItems:'center', gap:8}}>
            📸 Evidence & NoteCam
          </div>
          <div style={{fontSize:11, color:'#64748b'}}>Photos & vidéos géolocalisées avec filigrane automatique</div>
        </div>

        {/* GPS Status */}
        <div style={{display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:20, background:gps?'rgba(52,201,126,0.15)':'rgba(245,158,11,0.15)', border:`1px solid ${gps?'#34c97e':'#f59e0b'}40`}}>
          <div style={{width:8, height:8, borderRadius:'50%', background:gps?'#34c97e':'#f59e0b', animation:'pulse 2s infinite'}} />
          <span style={{fontSize:11, fontWeight:600, color:gps?'#34c97e':'#f59e0b'}}>
            {gpsLoading?'GPS...' : gps?`±${gpsAccuracy}m` : 'Pas GPS'}
          </span>
        </div>

        {/* Tabs */}
        <div style={{display:'flex', gap:4}}>
          {[{v:'camera',l:'📷 Caméra'},{v:'gallery',l:`🗂 Galerie (${allMedia.length})`}].map(t=>(
            <button key={t.v} onClick={()=>{setMode(t.v); if(t.v==='camera'&&!cameraActive){}; if(t.v!=='camera')stopCamera();}}
              style={{padding:'6px 12px', borderRadius:8, border:'none', background:mode===t.v?'#4f8ef7':'rgba(255,255,255,0.1)', color:'white', fontSize:12, cursor:'pointer', fontWeight:mode===t.v?700:400}}>
              {t.l}
            </button>
          ))}
        </div>

        <button onClick={()=>setShowSettings(!showSettings)} style={{padding:'6px 12px', borderRadius:8, border:'1px solid rgba(255,255,255,0.2)', background:'transparent', color:'white', fontSize:12, cursor:'pointer'}}>⚙ Config</button>
      </div>

      {/* Panneau configuration */}
      {showSettings && (
        <div style={{background:'rgba(15,27,45,0.98)', borderBottom:'1px solid rgba(255,255,255,0.1)', padding:'16px 20px', flexShrink:0}}>
          <div style={{fontSize:13, fontWeight:700, color:'white', marginBottom:12}}>⚙ Configuration du filigrane NoteCam</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10}}>
            {WATERMARK_FIELDS.map(f=>(
              <div key={f.key}>
                <label style={{fontSize:11, fontWeight:600, color:'#64748b', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.5px'}}>{f.label}</label>
                <input value={watermark[f.key]||''} onChange={e=>setWatermark(p=>({...p,[f.key]:e.target.value}))} placeholder={f.default}
                  style={{width:'100%', padding:'8px 10px', border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, fontSize:12, background:'rgba(255,255,255,0.08)', color:'white', outline:'none', boxSizing:'border-box'}} />
              </div>
            ))}
          </div>
          {gps && (
            <div style={{marginTop:10, padding:'8px 12px', borderRadius:8, background:'rgba(52,201,126,0.1)', border:'1px solid rgba(52,201,126,0.3)', fontSize:12, color:'#34c97e'}}>
              📍 GPS actif: {gps.lat.toFixed(6)}°, {gps.lng.toFixed(6)}° · Précision: ±{gpsAccuracy}m
            </div>
          )}
        </div>
      )}

      {/* MODE CAMÉRA */}
      {mode === 'camera' && (
        <div style={{flex:1, display:'flex', flexDirection:'column', position:'relative', overflow:'hidden'}}>

          {/* Viewfinder */}
          <div style={{flex:1, position:'relative', background:'black', overflow:'hidden'}}>
            <video ref={videoRef} autoPlay playsInline muted style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0}} />
            <canvas ref={canvasRef} style={{position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain'}} />

            {/* Flash effect */}
            {flash && <div style={{position:'absolute', inset:0, background:'white', opacity:0.8, zIndex:100}} />}

            {/* Si caméra pas active */}
            {!cameraActive && (
              <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16}}>
                <div style={{fontSize:64}}>📷</div>
                <div style={{fontSize:15, fontWeight:700, color:'white'}}>Activer la caméra</div>
                <div style={{fontSize:12, color:'#64748b', textAlign:'center', maxWidth:280}}>
                  Les photos et vidéos seront automatiquement géolocalisées avec toutes vos informations technicien
                </div>
                <button onClick={startCamera} style={{padding:'12px 32px', borderRadius:10, border:'none', background:'#4f8ef7', color:'white', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(79,142,247,0.4)'}}>
                  📷 Démarrer la caméra
                </button>
              </div>
            )}

            {/* Viseur overlay */}
            {cameraActive && (
              <>
                {/* Grille de composition */}
                <div style={{position:'absolute', inset:0, pointerEvents:'none', opacity:0.2}}>
                  {[33,66].map(p=><div key={p} style={{position:'absolute', top:`${p}%`, left:0, right:0, height:1, background:'white'}} />)}
                  {[33,66].map(p=><div key={p} style={{position:'absolute', left:`${p}%`, top:0, bottom:0, width:1, background:'white'}} />)}
                </div>

                {/* Coins viseur */}
                {[{top:20,left:20},{top:20,right:20},{bottom:200,left:20},{bottom:200,right:20}].map((pos,i)=>(
                  <div key={i} style={{position:'absolute', ...pos, width:24, height:24, pointerEvents:'none',
                    borderTop: (i<2)?'2px solid white':'none', borderBottom: (i>=2)?'2px solid white':'none',
                    borderLeft: (i===0||i===2)?'2px solid white':'none', borderRight: (i===1||i===3)?'2px solid white':'none',
                    opacity:0.7}} />
                ))}

                {/* GPS overlay temps réel */}
                <div style={{position:'absolute', top:12, left:12, background:'rgba(0,0,0,0.6)', borderRadius:8, padding:'8px 12px', backdropFilter:'blur(4px)'}}>
                  {gps ? (
                    <div style={{fontSize:11, color:'#34c97e', fontWeight:600}}>
                      <div>📍 {gps.lat.toFixed(6)}°N</div>
                      <div>📍 {gps.lng.toFixed(6)}°E</div>
                      {gps.alt && <div>🏔 {gps.alt.toFixed(0)}m</div>}
                      <div style={{color:'rgba(255,255,255,0.5)'}}>±{gpsAccuracy}m</div>
                    </div>
                  ) : (
                    <div style={{fontSize:11, color:'#f59e0b'}}>📍 Localisation GPS...</div>
                  )}
                </div>

                {/* Heure en temps réel */}
                <div style={{position:'absolute', top:12, right:12, background:'rgba(0,0,0,0.6)', borderRadius:8, padding:'8px 12px', backdropFilter:'blur(4px)', fontSize:11, color:'white', fontWeight:600, textAlign:'right'}}>
                  <div>{new Date().toLocaleDateString('fr-FR')}</div>
                  <TimeDisplay />
                </div>

                {/* Timer enregistrement */}
                {recording && (
                  <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'rgba(220,38,38,0.9)', borderRadius:20, padding:'8px 16px', display:'flex', alignItems:'center', gap:8}}>
                    <div style={{width:10, height:10, borderRadius:'50%', background:'white', animation:'pulse 1s infinite'}} />
                    <span style={{fontSize:16, fontWeight:800, color:'white'}}>{fmtTime(recordingTime)}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Contrôles caméra */}
          {cameraActive && (
            <div style={{background:'rgba(0,0,0,0.9)', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexShrink:0, backdropFilter:'blur(8px)'}}>

              {/* Galerie preview */}
              <div onClick={()=>{setMode('gallery');stopCamera();}} style={{cursor:'pointer'}}>
                {photos.length > 0 ? (
                  <img src={photos[0].data} style={{width:52, height:52, borderRadius:10, objectFit:'cover', border:'2px solid #4f8ef7'}} alt="dernière" />
                ) : (
                  <div style={{width:52, height:52, borderRadius:10, background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22}}>🖼</div>
                )}
              </div>

              <div style={{display:'flex', alignItems:'center', gap:16}}>
                {/* Bouton vidéo */}
                <button onClick={toggleRecord}
                  style={{width:52, height:52, borderRadius:'50%', border:`3px solid ${recording?'#dc2626':'rgba(255,255,255,0.4)'}`, background:recording?'#dc2626':'rgba(255,255,255,0.1)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, transition:'all .2s'}}>
                  {recording ? '⏹' : '🔴'}
                </button>

                {/* Bouton photo principal */}
                <button onClick={takePhoto}
                  style={{width:76, height:76, borderRadius:'50%', border:'4px solid white', background:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 20px rgba(255,255,255,0.3)', transition:'transform .1s, box-shadow .1s'}}
                  onMouseDown={e=>e.currentTarget.style.transform='scale(0.93)'}
                  onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}>
                  <div style={{width:58, height:58, borderRadius:'50%', background:'rgba(0,0,0,0.05)', border:'2px solid rgba(0,0,0,0.1)'}} />
                </button>

                {/* Zoom */}
                <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:4}}>
                  <input type="range" min={1} max={4} step={0.1} value={zoom} onChange={e=>setZoom(+e.target.value)}
                    style={{width:60, accentColor:'#4f8ef7', transform:'rotate(-90deg)'}} />
                  <span style={{fontSize:10, color:'white'}}>{zoom.toFixed(1)}x</span>
                </div>
              </div>

              <div style={{display:'flex', flexDirection:'column', gap:8}}>
                {/* Flip */}
                <button onClick={flipCamera} style={{width:44, height:44, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.1)', cursor:'pointer', fontSize:18, color:'white'}}>🔄</button>
                {/* Arrêter */}
                <button onClick={stopCamera} style={{width:44, height:44, borderRadius:'50%', border:'1px solid rgba(220,38,38,0.5)', background:'rgba(220,38,38,0.2)', cursor:'pointer', fontSize:16, color:'#dc2626'}}>✕</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE GALERIE */}
      {mode === 'gallery' && (
        <div style={{flex:1, overflowY:'auto', padding:16}}>
          {allMedia.length === 0 ? (
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'60%', gap:16, color:'white'}}>
              <div style={{fontSize:64}}>📁</div>
              <div style={{fontSize:16, fontWeight:700}}>Aucun média capturé</div>
              <div style={{fontSize:13, color:'#64748b', textAlign:'center'}}>Activez la caméra et prenez des photos géolocalisées</div>
              <button onClick={()=>setMode('camera')} style={{padding:'10px 24px', borderRadius:8, border:'none', background:'#4f8ef7', color:'white', fontSize:13, fontWeight:600, cursor:'pointer'}}>📷 Ouvrir la caméra</button>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div style={{display:'flex', gap:10, marginBottom:16}}>
                {[{l:'Photos',v:photos.length,c:'#4f8ef7',icon:'📷'},{l:'Vidéos',v:videos.length,c:'#dc2626',icon:'🎥'},{l:'Total médias',v:allMedia.length,c:'#34c97e',icon:'📁'}].map(s=>(
                  <div key={s.l} style={{flex:1, background:'rgba(255,255,255,0.06)', borderRadius:10, padding:'12px', textAlign:'center', border:`1px solid rgba(255,255,255,0.1)`}}>
                    <div style={{fontSize:20}}>{s.icon}</div>
                    <div style={{fontSize:20, fontWeight:800, color:s.c}}>{s.v}</div>
                    <div style={{fontSize:11, color:'#64748b'}}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* Grille médias */}
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12}}>
                {allMedia.map(media => (
                  <div key={media.id} onClick={()=>setSelected(media)}
                    style={{borderRadius:12, overflow:'hidden', border:'1px solid rgba(255,255,255,0.1)', cursor:'pointer', transition:'all .2s', background:'rgba(255,255,255,0.05)'}}
                    onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.02)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.4)';}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}>

                    {/* Thumbnail */}
                    <div style={{position:'relative', height:140, background:'#1a2a45', overflow:'hidden'}}>
                      {media.mediaType==='photo'
                        ? <img src={media.data} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="" />
                        : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:40}}>🎥</div>
                      }
                      <div style={{position:'absolute',top:8,right:8,padding:'2px 8px',borderRadius:8,background:media.mediaType==='photo'?'rgba(79,142,247,0.9)':'rgba(220,38,38,0.9)',fontSize:10,fontWeight:700,color:'white'}}>
                        {media.mediaType==='photo'?'📷 PHOTO':'🎥 VIDÉO'}
                      </div>
                      {media.gps && <div style={{position:'absolute',bottom:8,left:8,padding:'2px 6px',borderRadius:6,background:'rgba(52,201,126,0.9)',fontSize:9,fontWeight:600,color:'white'}}>📍 GPS</div>}
                    </div>

                    {/* Info */}
                    <div style={{padding:'10px 12px'}}>
                      <div style={{fontSize:11,fontWeight:700,color:'white',marginBottom:2}}>{media.site}</div>
                      <div style={{fontSize:10,color:'#64748b',marginBottom:4}}>{media.technicien}</div>
                      <div style={{fontSize:10,color:'#94a3b8'}}>{fmtD(media.date)}</div>
                      {media.gps && <div style={{fontSize:9,color:'#34c97e',marginTop:3}}>{media.gps.lat.toFixed(4)}°, {media.gps.lng.toFixed(4)}°</div>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal Media Détail */}
      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.95)',zIndex:9999,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'#0f1b2d',borderRadius:14,width:'100%',maxWidth:800,maxHeight:'90vh',overflow:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.5)'}}>
            <div style={{padding:'14px 20px',background:'rgba(255,255,255,0.05)',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
              <div style={{fontSize:15,fontWeight:800,color:'white'}}>{selected.mediaType==='photo'?'📷 Photo géolocalisée':'🎥 Vidéo géolocalisée'}</div>
              <button onClick={()=>setSelected(null)} style={{background:'rgba(255,255,255,0.1)',border:'none',color:'white',width:30,height:30,borderRadius:'50%',cursor:'pointer',fontSize:16}}>✕</button>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:0}}>
              {/* Media */}
              <div style={{padding:16,borderRight:'1px solid rgba(255,255,255,0.1)'}}>
                {selected.mediaType==='photo'
                  ? <img src={selected.data} style={{width:'100%',borderRadius:8,maxHeight:400,objectFit:'contain'}} alt="" />
                  : <video src={selected.url} controls style={{width:'100%',borderRadius:8,maxHeight:400}} />
                }
              </div>

              {/* Metadata */}
              <div style={{padding:16}}>
                <div style={{fontSize:12,fontWeight:700,color:'#64748b',marginBottom:12,textTransform:'uppercase',letterSpacing:'0.5px'}}>Informations NoteCam</div>
                {[
                  {l:'Date/Heure',v:fmtD(selected.date),icon:'📅'},
                  {l:'Technicien',v:selected.watermark?.technicien,icon:'👷'},
                  {l:'Site',v:selected.watermark?.site,icon:'📡'},
                  {l:'Mission',v:selected.watermark?.mission,icon:'🔧'},
                  {l:'Entreprise',v:selected.watermark?.entreprise,icon:'🏢'},
                  ...(selected.gps ? [
                    {l:'Latitude',v:selected.gps.lat.toFixed(6)+'°',icon:'📍'},
                    {l:'Longitude',v:selected.gps.lng.toFixed(6)+'°',icon:'📍'},
                    {l:'Altitude',v:selected.gps.alt?selected.gps.alt.toFixed(1)+'m':'N/A',icon:'🏔'},
                    {l:'Précision GPS',v:selected.gpsAccuracy?`±${selected.gpsAccuracy}m`:'N/A',icon:'🎯'},
                  ] : [{l:'GPS',v:'Non disponible',icon:'❌'}]),
                ].map(i=>(
                  <div key={i.l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                    <span style={{fontSize:11,color:'#64748b'}}>{i.icon} {i.l}</span>
                    <span style={{fontSize:11,fontWeight:600,color:'white',textAlign:'right',maxWidth:140}}>{i.v||'—'}</span>
                  </div>
                ))}

                {/* Lien Google Maps si GPS */}
                {selected.gps && (
                  <button onClick={()=>window.open(`https://maps.google.com/?q=${selected.gps.lat},${selected.gps.lng}`,'_blank')}
                    style={{width:'100%',marginTop:12,padding:'8px',borderRadius:8,border:'none',background:'rgba(79,142,247,0.2)',color:'#4f8ef7',fontSize:12,cursor:'pointer',fontWeight:600}}>
                    🗺 Voir sur Google Maps
                  </button>
                )}

                {/* Download */}
                <button onClick={()=>selected.mediaType==='photo'?downloadPhoto(selected):downloadVideo(selected)}
                  style={{width:'100%',marginTop:8,padding:'10px',borderRadius:8,border:'none',background:'#34c97e',color:'white',fontSize:13,cursor:'pointer',fontWeight:700}}>
                  📥 Télécharger avec filigrane
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

// Composant heure qui se met à jour chaque seconde
function TimeDisplay() {
  const [time, setTime] = useState(new Date().toLocaleTimeString('fr-FR'));
  useEffect(() => {
    const i = setInterval(() => setTime(new Date().toLocaleTimeString('fr-FR')), 1000);
    return () => clearInterval(i);
  }, []);
  return <div>{time}</div>;
}
