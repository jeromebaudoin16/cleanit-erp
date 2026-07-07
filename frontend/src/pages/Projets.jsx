import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../utils/api';

const C = {
  bg:'#F0F4F9',white:'#FFFFFF',navy:'#0A1628',blue:'#2563EB',
  teal:'#0D9488',green:'#16A34A',orange:'#EA580C',purple:'#7C3AED',
  red:'#DC2626',gold:'#D97706',gray:'#6B7280',
  border:'rgba(10,15,30,.06)',
  shadow:'0 1px 3px rgba(10,15,30,.06),0 0 0 1px rgba(10,15,30,.06)',
  shadowMd:'0 4px 16px rgba(10,15,30,.08),0 1px 4px rgba(10,15,30,.04)',
};
const card = {background:C.white,borderRadius:14,boxShadow:C.shadow,padding:20};
const b = (bg,color,border) => ({padding:'7px 16px',borderRadius:8,border:border||'none',background:bg,color,fontSize:13,fontWeight:600,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:6,fontFamily:'inherit',transition:'all .15s'});
const SV = {pending:{bg:'#F1F5F9',text:'#64748B',label:'En attente'},in_progress:{bg:'#EFF6FF',text:'#2563EB',label:'En cours'},done:{bg:'#F0FDF4',text:'#16A34A',label:'Terminé'},blocked:{bg:'#FEF2F2',text:'#DC2626',label:'Bloqué'}};
const TC = ['#0D9488','#7C3AED','#1D4ED8','#EA580C','#D97706','#16A34A','#0891B2'];
const Spin = () => <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{animation:'spin 1s linear infinite'}}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;

// ── PhotoUploadZone ───────────────────────────────────────────────────────
function PhotoUploadZone({phaseId,executionPhaseId,photos=[],onPhotosChange,isCatalogue=false}) {
  const ref = useRef(null);
  const [uploading,setUploading] = useState(false);
  const [err,setErr] = useState('');
  const endpoint = isCatalogue ? `/project-phases/${phaseId}/photos` : `/project-execution-phases/${executionPhaseId}/photos`;

  const doUpload = async (files) => {
    if(!files?.length) return;
    setUploading(true); setErr('');
    const added = [];
    for(const f of Array.from(files)){
      if(!f.type.startsWith('image/')) { setErr('Seules les images sont acceptées'); continue; }
      if(f.size > 10*1024*1024) { setErr('Image trop lourde (max 10 Mo)'); continue; }
      try {
        const fd = new FormData();
        fd.append('file',f);
        if(isCatalogue) fd.append('caption',f.name.replace(/\.[^.]+$/,''));
        // Ne PAS définir Content-Type manuellement — le navigateur génère le boundary automatiquement
        const res = await api.post(endpoint, fd);
        added.push(res.data);
      } catch(e){ setErr('Erreur upload: '+(e.response?.data?.message||e.message)); }
    }
    setUploading(false);
    if(added.length) onPhotosChange([...photos,...added]);
  };

  const del = async (pid) => {
    if(!window.confirm('Supprimer cette photo ?')) return;
    try {
      await api.delete(isCatalogue ? `/project-phase-photos/${pid}` : `/project-execution-photos/${pid}`);
      onPhotosChange(photos.filter(p=>p.id!==pid));
    } catch(e){ setErr('Erreur suppression'); }
  };

  return (
    <div style={{marginTop:10}}>
      {photos.length>0 && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))',gap:8,marginBottom:10}}>
          {photos.map(ph => (
            <div key={ph.id} style={{position:'relative',borderRadius:8,overflow:'hidden',aspectRatio:'1',background:'#F1F5F9'}}>
              <img src={ph.url||ph.photo_url} alt={ph.caption||'photo'} onClick={()=>window.open(ph.url||ph.photo_url,'_blank')}
                   style={{width:'100%',height:'100%',objectFit:'cover',cursor:'pointer',display:'block'}} />
              <button onClick={()=>del(ph.id)} style={{position:'absolute',top:4,right:4,background:'rgba(0,0,0,.55)',border:'none',borderRadius:5,color:'white',width:22,height:22,cursor:'pointer',fontSize:12,lineHeight:1,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
              {ph.caption && <div style={{position:'absolute',bottom:0,left:0,right:0,background:'rgba(0,0,0,.5)',color:'white',fontSize:9,padding:'2px 5px',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{ph.caption}</div>}
            </div>
          ))}
        </div>
      )}
      <div style={{position:'relative',borderRadius:9,overflow:'hidden'}}
           onDrop={e=>{e.preventDefault();doUpload(e.dataTransfer.files);}}
           onDragOver={e=>e.preventDefault()}>
        <div style={{border:'1.5px dashed rgba(37,99,235,.35)',borderRadius:9,padding:'14px 16px',
          textAlign:'center',background:'rgba(37,99,235,.02)',pointerEvents:'none'}}>
          {uploading
            ? <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,color:C.blue,fontSize:13,fontWeight:600}}><Spin/> Upload en cours...</div>
            : <div>
                <svg style={{display:'block',margin:'0 auto 6px'}} width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth={2} strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <div style={{fontSize:13,fontWeight:700,color:C.blue}}>Ajouter des photos</div>
                <div style={{fontSize:10.5,color:C.gray,marginTop:2}}>JPG · PNG · WebP · max 8 Mo</div>
              </div>
          }
        </div>
        {!uploading && <input type="file" multiple accept="image/*"
          onChange={e=>{doUpload(e.target.files);e.target.value='';}}
          style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:0,cursor:'pointer'}}/>}
      </div>
      {err && <div style={{marginTop:6,padding:'6px 10px',background:'#FEF2F2',borderRadius:6,color:C.red,fontSize:12}}>{err}</div>}
    </div>
  );
}

// ── Catalogue ─────────────────────────────────────────────────────────────
function Catalogue({onSelect}) {
  const [types,setTypes] = useState([]);
  const [loading,setLoading] = useState(true);
  useEffect(()=>{ api.get('/project-catalogue').then(r=>setTypes(r.data||[])).catch(()=>{}).finally(()=>setLoading(false)); },[]);
  if(loading) return <div style={{padding:40,textAlign:'center',color:C.gray}}>Chargement...</div>;
  return (
    <div>
      <div style={{marginBottom:24}}>
        <div style={{fontSize:22,fontWeight:700,color:C.navy,letterSpacing:'-.02em',marginBottom:4}}>Catalogue des Types de Projets</div>
        <div style={{fontSize:13.5,color:C.gray}}>Référentiel des processus d'exécution — IP Core, Rural Start et autres types</div>
      </div>
      {types.length===0 ? (
        <div style={{...card,textAlign:'center',padding:48,color:C.gray}}>
          Aucun type de projet. Vérifiez que le backend a bien initialisé IP Core et Rural Start.
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))',gap:14}}>
          {types.map((t,i)=>{
            const col = t.color||TC[i%TC.length];
            return (
              <div key={t.id} onClick={()=>onSelect(t)}
                   style={{...card,cursor:'pointer',borderTop:`3px solid ${col}`,paddingTop:16,transition:'all .18s'}}
                   onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow=C.shadowMd;}}
                   onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=C.shadow;}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <div style={{width:36,height:36,borderRadius:9,background:col+'18',display:'flex',alignItems:'center',justifyContent:'center',color:col,fontSize:18}}>
                    📋
                  </div>
                  <div>
                    <div style={{fontSize:15,fontWeight:700,color:C.navy}}>{t.name}</div>
                    <div style={{fontSize:11,color:C.gray,marginTop:1}}>{t.category}</div>
                  </div>
                </div>
                <div style={{fontSize:13,color:C.gray,lineHeight:1.55,marginBottom:14}}>
                  {t.description?.slice(0,90)}{t.description?.length>90?'...':''}
                </div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:11.5,fontWeight:600,color:col,background:col+'15',padding:'3px 10px',borderRadius:20}}>
                    {t.phases_count||'—'} phases
                  </span>
                  <span style={{fontSize:12,color:C.blue,fontWeight:500}}>Voir →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── TypeDetail ─────────────────────────────────────────────────────────────
function TypeDetail({type,onBack,onAttach,onSelectSite}) {
  const [phases,setPhases] = useState([]);
  const [sites,setSites] = useState([]);
  const [tab,setTab] = useState('phases');
  const [loading,setLoading] = useState(true);
  const [expanded,setExpanded] = useState(null);
  const col = type.color||C.teal;

  useEffect(()=>{
    setLoading(true);
    Promise.all([api.get(`/project-catalogue/${type.id}`),api.get(`/project-catalogue/${type.id}/sites`)])
      .then(([d,s])=>{ setPhases(d.data.phases||[]); setSites(s.data||[]); })
      .catch(()=>{}).finally(()=>setLoading(false));
  },[type.id]);

  const updatePhotos = (phaseId,newPh) => setPhases(p=>p.map(x=>x.id===phaseId?{...x,photos:newPh}:x));

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
        <button onClick={onBack} style={{...b(C.white,C.navy,`1px solid ${C.border}`),padding:'6px 12px'}}>← Catalogue</button>
        <div style={{flex:1}}>
          <div style={{fontSize:20,fontWeight:700,color:C.navy,display:'flex',alignItems:'center',gap:8}}>
            <span style={{width:10,height:10,borderRadius:3,background:col,display:'inline-block'}}/>
            {type.name}
          </div>
          <div style={{fontSize:12.5,color:C.gray,marginTop:2}}>{type.category}</div>
        </div>
        <button onClick={onAttach} style={{...b(C.navy,'white')}}> + Rattacher un site</button>
      </div>

      <div style={{...card,marginBottom:14,borderLeft:`3px solid ${col}`}}>
        <div style={{fontSize:13,color:C.navy,lineHeight:1.65}}>{type.description}</div>
        {type.context&&<div style={{fontSize:12.5,color:C.gray,marginTop:8,lineHeight:1.6,fontStyle:'italic'}}>{type.context}</div>}
      </div>

      <div style={{display:'flex',borderBottom:`1px solid ${C.border}`,marginBottom:20}}>
        {['phases','sites'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:'9px 20px',border:'none',cursor:'pointer',fontSize:13.5,fontWeight:600,background:'none',fontFamily:'inherit',color:tab===t?col:C.gray,borderBottom:tab===t?`2px solid ${col}`:'2px solid transparent',marginBottom:-1}}>
            {t==='phases'?`Processus (${phases.length} phases)`:`Sites en cours (${sites.length})`}
          </button>
        ))}
      </div>

      {loading && <div style={{textAlign:'center',color:C.gray,padding:32}}>Chargement...</div>}

      {!loading && tab==='phases' && (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {phases.map((ph,idx)=>(
            <div key={ph.id} style={{...card,padding:0,overflow:'hidden',borderLeft:`3px solid ${ph.is_client_scope?C.gold:col}`}}>
              <div onClick={()=>setExpanded(expanded===ph.id?null:ph.id)}
                   style={{display:'flex',alignItems:'flex-start',gap:12,padding:'14px 18px',cursor:'pointer'}}>
                <div style={{width:32,height:32,borderRadius:'50%',flexShrink:0,background:ph.is_client_scope?C.gold+'20':col+'18',border:`2px solid ${ph.is_client_scope?C.gold:col}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:ph.is_client_scope?C.gold:col}}>
                  {idx+1}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                    <span style={{fontSize:14,fontWeight:700,color:C.navy}}>{ph.title}</span>
                    {ph.is_client_scope && <span style={{fontSize:10.5,fontWeight:700,padding:'2px 8px',borderRadius:20,background:C.gold+'18',color:C.gold}}>Hors périmètre CleanIT</span>}
                    {ph.photos?.length>0 && <span style={{fontSize:10.5,color:C.blue}}>📷 {ph.photos.length}</span>}
                  </div>
                  <div style={{fontSize:12.5,color:C.gray,marginTop:3,lineHeight:1.55}}>{ph.description}</div>
                </div>
                <span style={{color:C.gray,fontSize:18,flexShrink:0}}>{expanded===ph.id?'▲':'▼'}</span>
              </div>
              {expanded===ph.id && (
                <div style={{padding:'0 18px 16px',borderTop:`1px solid ${C.border}`}}>
                  <div style={{fontSize:11,fontWeight:600,color:C.gray,marginTop:14,marginBottom:4,textTransform:'uppercase',letterSpacing:'.05em'}}>Photos illustratives de la phase</div>
                  <PhotoUploadZone phaseId={ph.id} photos={ph.photos||[]} onPhotosChange={np=>updatePhotos(ph.id,np)} isCatalogue={true} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && tab==='sites' && (
        <div>
          {sites.length===0 ? (
            <div style={{...card,textAlign:'center',padding:40,color:C.gray}}>
              <div style={{fontSize:14,marginBottom:6}}>Aucun site rattaché</div>
              <div style={{fontSize:12.5}}>Utilisez "Rattacher un site" pour commencer le suivi</div>
            </div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))',gap:12}}>
              {sites.map(s=>{
                const pct = s.total_phases ? Math.round(((s.done_phases||0)/s.total_phases)*100) : 0;
                return (
                  <div key={s.id} style={{...card,cursor:'pointer',transition:'all .18s'}}
                       onClick={()=>onSelectSite(s)}
                       onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=C.shadowMd;}}
                       onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=C.shadow;}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                      <div>
                        <div style={{fontSize:14.5,fontWeight:700,color:C.navy}}>{s.site_code}</div>
                        <div style={{fontSize:12,color:C.gray,marginTop:2}}>{s.site_name||s.region}</div>
                      </div>
                      <span style={{fontSize:13,fontWeight:700,color:pct===100?C.green:C.blue}}>{pct}%</span>
                    </div>
                    <div style={{height:4,background:'#F1F5F9',borderRadius:2,overflow:'hidden',marginBottom:8}}>
                      <div style={{width:`${pct}%`,height:'100%',background:pct===100?C.green:col,borderRadius:2}}/>
                    </div>
                    <div style={{fontSize:11.5,color:C.gray}}>{s.done_phases||0}/{s.total_phases||0} phases · {s.client}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── AttachSiteForm ────────────────────────────────────────────────────────
function AttachSiteForm({type,onBack,onSuccess}) {
  const [sites,setSites] = useState([]);
  const [form,setForm] = useState({site_code:'',site_name:'',client:'',bc_reference:'',region:'',start_date:''});
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState('');
  const inp = {width:'100%',padding:'9px 12px',border:`1px solid ${C.border}`,borderRadius:8,fontSize:13.5,fontFamily:'inherit',outline:'none',background:C.white,color:C.navy,boxSizing:'border-box'};

  useEffect(()=>{ api.get('/sites').then(r=>setSites(r.data||[])).catch(()=>{}); },[]);

  const submit = async () => {
    if(!form.site_code) return setError('Le code site est requis');
    setSaving(true); setError('');
    try {
      await api.post(`/project-catalogue/${type.id}/sites`,form);
      onSuccess();
    } catch(e) { setError(e.response?.data?.message||'Erreur lors du rattachement'); setSaving(false); }
  };

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <button onClick={onBack} style={{...b(C.white,C.navy,`1px solid ${C.border}`),padding:'6px 12px'}}>← Retour</button>
        <div>
          <div style={{fontSize:18,fontWeight:700,color:C.navy}}>Rattacher un site à {type.name}</div>
          <div style={{fontSize:12.5,color:C.gray,marginTop:2}}>Les {type.phases_count||'—'} phases seront copiées automatiquement</div>
        </div>
      </div>
      <div style={{...card,maxWidth:500}}>
        {[
          {label:'Code site (DUID)',field:'site_code',type:'select'},
          {label:'Nom du site',field:'site_name',ph:'Tour MTN Garoua Centre'},
          {label:'Client',field:'client',ph:'MTN Cameroun'},
          {label:'Référence BC',field:'bc_reference',ph:'416121376123-2'},
          {label:'Région',field:'region',ph:'Nord Cameroun'},
          {label:'Date de démarrage',field:'start_date',it:'date'},
        ].map(({label,field,ph,type:ft,it})=>(
          <div key={field} style={{marginBottom:14}}>
            <label style={{display:'block',fontSize:12,fontWeight:600,color:C.gray,marginBottom:5,textTransform:'uppercase',letterSpacing:'.04em'}}>{label}</label>
            {ft==='select'
              ? <select value={form[field]} onChange={e=>{ const s=sites.find(x=>x.code===e.target.value); if(s) setForm(f=>({...f,site_code:s.code,site_name:s.name,region:s.region||''})); else setForm(f=>({...f,site_code:e.target.value})); }} style={{...inp,appearance:'none'}}>
                  <option value="">Saisir manuellement ou sélectionner</option>
                  {sites.map(s=><option key={s.id} value={s.code}>{s.code} — {s.name}</option>)}
                </select>
              : <input type={it||'text'} value={form[field]} placeholder={ph} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))} style={inp} />
            }
          </div>
        ))}
        {error && <div style={{padding:'8px 12px',background:'#FEF2F2',borderRadius:8,color:C.red,fontSize:13,marginBottom:14}}>{error}</div>}
        <button onClick={submit} disabled={saving} style={{...b(C.navy,'white'),width:'100%',justifyContent:'center',padding:12}}>
          {saving ? <><Spin/> Rattachement...</> : '✓ Rattacher et copier les phases'}
        </button>
      </div>
    </div>
  );
}

// ── SiteExecution ────────────────────────────────────────────────────────
function SiteExecution({execId,onBack}) {
  const [exec,setExec] = useState(null);
  const [phases,setPhases] = useState([]);
  const [loading,setLoading] = useState(true);
  const [expanded,setExpanded] = useState(null);
  const [notes,setNotes] = useState({});
  const [savingNote,setSavingNote] = useState(null);

  const load = useCallback(async()=>{
    try {
      const r = await api.get(`/project-site-executions/${execId}`);
      setExec(r.data); setPhases(r.data.phases||[]);
      const n={}; (r.data.phases||[]).forEach(p=>{n[p.id]=p.notes||'';});
      setNotes(n);
    } catch(e){console.error(e);}
    finally{setLoading(false);}
  },[execId]);

  useEffect(()=>{load();},[load]);

  const setStatus = async(pid,status)=>{
    try {
      await api.put(`/project-execution-phases/${pid}`,{status});
      setPhases(p=>p.map(x=>x.id===pid?{...x,status,
        started_at:status==='in_progress'&&!x.started_at?new Date().toISOString():x.started_at,
        completed_at:status==='done'?new Date().toISOString():null
      }:x));
    } catch(e){alert('Erreur mise à jour statut');}
  };

  const saveNote = async(pid)=>{
    setSavingNote(pid);
    try{ await api.put(`/project-execution-phases/${pid}`,{notes:notes[pid]}); }
    catch(e){alert('Erreur sauvegarde');}
    setSavingNote(null);
  };

  const updatePhotos = (pid,np) => setPhases(p=>p.map(x=>x.id===pid?{...x,photos:np}:x));

  if(loading) return <div style={{padding:40,textAlign:'center',color:C.gray}}>Chargement...</div>;
  if(!exec) return <div style={{padding:40,color:C.red}}>Exécution introuvable.</div>;

  const done = phases.filter(p=>p.status==='done').length;
  const pct = phases.length ? Math.round((done/phases.length)*100) : 0;

  return (
    <div>
      <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:20}}>
        <button onClick={onBack} style={{...b(C.white,C.navy,`1px solid ${C.border}`),padding:'6px 12px',marginTop:2}}>← Retour</button>
        <div style={{flex:1}}>
          <div style={{fontSize:20,fontWeight:700,color:C.navy}}>{exec.site_code} — {exec.type_name}</div>
          <div style={{fontSize:13,color:C.gray,marginTop:3}}>{exec.site_name} · {exec.client} · {exec.region}</div>
        </div>
        <div style={{textAlign:'right',flexShrink:0}}>
          <div style={{fontSize:26,fontWeight:800,color:pct===100?C.green:C.blue,letterSpacing:'-.03em'}}>{pct}%</div>
          <div style={{fontSize:11.5,color:C.gray}}>{done}/{phases.length} phases</div>
        </div>
      </div>

      <div style={{height:6,background:'#F1F5F9',borderRadius:3,overflow:'hidden',marginBottom:20}}>
        <div style={{width:`${pct}%`,height:'100%',background:pct===100?C.green:C.blue,borderRadius:3,transition:'width .5s'}}/>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {phases.map((ph,idx)=>{
          const st = SV[ph.status]||SV.pending;
          const isOpen = expanded===ph.id;
          return (
            <div key={ph.id} style={{...card,padding:0,overflow:'hidden',borderLeft:`3px solid ${ph.status==='done'?C.green:ph.status==='in_progress'?C.blue:ph.is_client_scope?C.gold:C.border}`}}>
              <div onClick={()=>setExpanded(isOpen?null:ph.id)}
                   style={{display:'flex',alignItems:'flex-start',gap:12,padding:'13px 16px',cursor:'pointer'}}>
                <div style={{width:30,height:30,borderRadius:'50%',flexShrink:0,background:ph.status==='done'?C.green:ph.status==='in_progress'?C.blue:'#F1F5F9',display:'flex',alignItems:'center',justifyContent:'center',color:ph.status==='done'||ph.status==='in_progress'?'white':C.gray,fontSize:12,fontWeight:700}}>
                  {ph.status==='done'?'✓':idx+1}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:7,flexWrap:'wrap'}}>
                    <span style={{fontSize:14,fontWeight:600,color:C.navy}}>{ph.title}</span>
                    <span style={{fontSize:10.5,fontWeight:600,padding:'2px 8px',borderRadius:20,background:st.bg,color:st.text}}>{st.label}</span>
                    {ph.is_client_scope && <span style={{fontSize:10.5,padding:'2px 8px',borderRadius:20,background:C.gold+'18',color:C.gold,fontWeight:600}}>Hors périmètre</span>}
                    {ph.photos?.length>0 && <span style={{fontSize:10.5,color:C.blue}}>📷 {ph.photos.length}</span>}
                  </div>
                  <div style={{fontSize:12,color:C.gray,marginTop:3,lineHeight:1.5}}>{ph.description?.slice(0,80)}{ph.description?.length>80?'...':''}</div>
                </div>
                <span style={{color:C.gray,fontSize:16,flexShrink:0,marginTop:4}}>{isOpen?'▲':'▼'}</span>
              </div>

              {isOpen && (
                <div style={{padding:'0 16px 16px',borderTop:`1px solid ${C.border}`}}>
                  {!ph.is_client_scope && (
                    <div style={{marginTop:14,marginBottom:14}}>
                      <div style={{fontSize:11,fontWeight:600,color:C.gray,marginBottom:8,textTransform:'uppercase',letterSpacing:'.05em'}}>Statut de la phase</div>
                      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                        {[{s:'pending',l:'En attente',bg:'#F1F5F9',c:C.gray},{s:'in_progress',l:'En cours',bg:'#EFF6FF',c:C.blue},{s:'done',l:'Terminé',bg:'#F0FDF4',c:C.green},{s:'blocked',l:'Bloqué',bg:'#FEF2F2',c:C.red}].map(({s,l,bg,c})=>(
                          <button key={s} onClick={()=>setStatus(ph.id,s)}
                            style={{padding:'6px 14px',borderRadius:20,border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:12.5,fontWeight:600,background:ph.status===s?c:bg,color:ph.status===s?'white':c,transition:'all .15s'}}>
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{marginBottom:16}}>
                    <div style={{fontSize:11,fontWeight:600,color:C.gray,marginBottom:6,textTransform:'uppercase',letterSpacing:'.05em'}}>Notes terrain</div>
                    <textarea value={notes[ph.id]||''} onChange={e=>setNotes(n=>({...n,[ph.id]:e.target.value}))}
                      placeholder="Observations, problèmes rencontrés..." rows={3}
                      style={{width:'100%',padding:'9px 12px',border:`1px solid ${C.border}`,borderRadius:8,fontSize:13,fontFamily:'inherit',resize:'vertical',outline:'none',color:C.navy,boxSizing:'border-box'}} />
                    <button onClick={()=>saveNote(ph.id)} disabled={savingNote===ph.id}
                      style={{...b(C.navy,'white'),marginTop:8,fontSize:12}}>
                      {savingNote===ph.id?'Sauvegarde...':'💾 Sauvegarder la note'}
                    </button>
                  </div>

                  {/* ── UPLOAD PHOTOS ── */}
                  <div>
                    <div style={{fontSize:11,fontWeight:600,color:C.gray,marginBottom:6,textTransform:'uppercase',letterSpacing:'.05em'}}>
                      Photos terrain ({ph.photos?.length||0} photo{ph.photos?.length!==1?'s':''})
                    </div>
                    <PhotoUploadZone
                      executionPhaseId={ph.id}
                      photos={ph.photos||[]}
                      onPhotosChange={np=>updatePhotos(ph.id,np)}
                      isCatalogue={false}
                    />
                  </div>

                  {(ph.started_at||ph.completed_at) && (
                    <div style={{marginTop:14,display:'flex',gap:20,fontSize:11.5,color:C.gray}}>
                      {ph.started_at && <span>Démarré : {new Date(ph.started_at).toLocaleDateString('fr-FR')}</span>}
                      {ph.completed_at && <span>Terminé : {new Date(ph.completed_at).toLocaleDateString('fr-FR')}</span>}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function Projets() {
  const [view,setView] = useState('catalogue');
  const [selType,setSelType] = useState(null);
  const [selExecId,setSelExecId] = useState(null);

  return (
    <div style={{padding:24,background:C.bg,minHeight:'100%'}}>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      {view==='catalogue' && <Catalogue onSelect={t=>{setSelType(t);setView('type');}} />}
      {view==='type' && selType && <TypeDetail type={selType} onBack={()=>setView('catalogue')} onAttach={()=>setView('attach')} onSelectSite={s=>{setSelExecId(s.id);setView('exec');}} />}
      {view==='attach' && selType && <AttachSiteForm type={selType} onBack={()=>setView('type')} onSuccess={()=>setView('type')} />}
      {view==='exec' && selExecId && <SiteExecution execId={selExecId} onBack={()=>setView('type')} />}
    </div>
  );
}
