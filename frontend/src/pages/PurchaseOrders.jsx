import { useState, useEffect, useRef } from 'react';
import { api, getToken } from '../utils/api';

export default function PurchaseOrders() {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [poFile, setPoFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/purchase-orders'); setPos(Array.isArray(r.data)?r.data:[]); }
    catch { setPos([]); }
    finally { setLoading(false); }
  };

  const importPO = async () => {
    setImporting(true);
    try {
      const fd = new FormData();
      if (poFile) fd.append('file', poFile);
      const r = await api.post('/purchase-orders/import', fd);
      setResult(r.data); load();
    } catch(e) { alert('Erreur import'); }
    finally { setImporting(false); }
  };

  const downloadTracker = async (id) => {
    const token = getToken();
    const res = await fetch(`${import.meta.env.VITE_API_URL||'http://localhost:3000'}/purchase-orders/${id}/tracker`, { headers:{ Authorization:`Bearer ${token}` } });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`tracker-po-${id}.xlsx`; a.click();
    URL.revokeObjectURL(url);
  };

  const fmtN = n => n ? new Intl.NumberFormat('fr-FR').format(n) : '0';
  const fmtD = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:12}}><div style={{width:40,height:40,borderRadius:'50%',border:'3px solid #7c3aed',borderTopColor:'transparent',animation:'spin 1s linear infinite'}} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><span style={{color:'#64748b'}}>Chargement bons de commande...</span></div>;

  return (
    <div style={{padding:24,background:'#f5f7fa',minHeight:'100%'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div><h1 style={{fontSize:22,fontWeight:800,color:'#1e293b',margin:0}}>Bons de Commande</h1><p style={{color:'#64748b',fontSize:13,margin:'4px 0 0'}}>Import et suivi des PO · {pos.length} bons de commande</p></div>
        <button onClick={()=>setShowImport(true)} style={{padding:'9px 18px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#4c1d95,#7c3aed)',color:'white',fontSize:13,fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
          📤 Importer un PO
        </button>
      </div>

      {pos.length===0 ? (
        <div style={{background:'white',borderRadius:12,padding:60,textAlign:'center',border:'2px dashed #e2e8f0'}}>
          <div style={{fontSize:48,marginBottom:12}}>📄</div>
          <div style={{fontSize:16,fontWeight:700,color:'#1e293b',marginBottom:6}}>Aucun bon de commande</div>
          <div style={{fontSize:13,color:'#64748b',marginBottom:20}}>Importez votre premier PO pour commencer</div>
          <button onClick={()=>setShowImport(true)} style={{padding:'10px 24px',borderRadius:8,border:'none',background:'#7c3aed',color:'white',fontSize:13,fontWeight:600,cursor:'pointer'}}>📤 Importer un PO</button>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {pos.map(po=>(
            <div key={po.id} style={{background:'white',borderRadius:12,border:'1px solid #e8ecf0',padding:'18px 20px',display:'flex',gap:16,alignItems:'center',flexWrap:'wrap',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
              <div style={{width:48,height:48,borderRadius:12,background:'#f5f3ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>📄</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',marginBottom:4}}>
                  <span style={{fontSize:14,fontWeight:700,color:'#1e293b'}}>{po.poNumber}</span>
                  <span style={{padding:'2px 8px',borderRadius:8,fontSize:11,fontWeight:600,background:'#f0fdf4',color:'#16a34a'}}>{po.status}</span>
                </div>
                <div style={{fontSize:13,color:'#64748b'}}>{po.supplier} · {fmtN(po.totalAmount)} {po.currency}</div>
                <div style={{fontSize:11,color:'#94a3b8',marginTop:2}}>{po.items?.length||0} articles · Importé le {fmtD(po.createdAt)}</div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>setSelected(po)} style={{padding:'7px 14px',borderRadius:8,border:'1px solid #7c3aed',background:'white',color:'#7c3aed',fontSize:12,cursor:'pointer',fontWeight:600}}>👁 Détails</button>
                <button onClick={()=>downloadTracker(po.id)} style={{padding:'7px 14px',borderRadius:8,border:'none',background:'#16a34a',color:'white',fontSize:12,cursor:'pointer',fontWeight:600}}>📥 Tracker Excel</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Import */}
      {showImport && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'white',borderRadius:14,width:'100%',maxWidth:580,maxHeight:'85vh',overflow:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
            <div style={{padding:'16px 24px',background:'linear-gradient(135deg,#4c1d95,#7c3aed)',color:'white',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0}}>
              <div><div style={{fontSize:16,fontWeight:800}}>📤 Importer Bon de Commande</div><div style={{fontSize:12,opacity:0.8}}>L'IA analyse et distribue dans tous les modules</div></div>
              <button onClick={()=>{setShowImport(false);setPoFile(null);setResult(null);}} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:28,height:28,borderRadius:'50%',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
            <div style={{padding:24}}>
              {!result ? (
                <>
                  <div style={{border:`2px dashed ${poFile?'#7c3aed':'#e2e8f0'}`,borderRadius:12,padding:36,textAlign:'center',background:poFile?'#fdf4ff':'#fafafa',cursor:'pointer',marginBottom:16,transition:'all .2s'}} onClick={()=>fileRef.current?.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();setPoFile(e.dataTransfer.files[0]);}}>
                    <div style={{fontSize:40,marginBottom:10}}>{poFile?'✅':'📁'}</div>
                    <div style={{fontSize:15,fontWeight:700,color:poFile?'#7c3aed':'#374151',marginBottom:4}}>{poFile?poFile.name:'Glissez votre fichier PO ici'}</div>
                    <div style={{fontSize:12,color:'#94a3b8'}}>PDF, Excel (.xlsx), Word (.docx) — Max 50MB</div>
                    <input ref={fileRef} type="file" accept=".pdf,.xlsx,.xls,.docx,.csv" style={{display:'none'}} onChange={e=>setPoFile(e.target.files[0])} />
                  </div>
                  <div style={{background:'#f0f7ff',borderRadius:10,padding:'14px 16px',marginBottom:16,display:'flex',gap:12}}>
                    <div style={{fontSize:24,flexShrink:0}}>🤖</div>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:'#0078d4',marginBottom:6}}>Actions automatiques de l'IA :</div>
                      <div style={{fontSize:12,color:'#374151',lineHeight:1.8}}>• Extraction articles, quantités et prix<br/>• Création équipements dans Inventaire OEM<br/>• Planification interventions dans Planning<br/>• Génération factures dans Finance<br/>• Notification Project Manager</div>
                    </div>
                  </div>
                  <button onClick={importPO} disabled={importing} style={{width:'100%',padding:13,borderRadius:10,border:'none',background:importing?'#94a3b8':'linear-gradient(135deg,#4c1d95,#7c3aed)',color:'white',fontSize:15,fontWeight:700,cursor:importing?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                    {importing?<><div style={{width:18,height:18,borderRadius:'50%',border:'2px solid white',borderTopColor:'transparent',animation:'spin 1s linear infinite'}} />Analyse IA...</>:'🤖 Analyser et importer'}
                  </button>
                </>
              ) : (
                <div>
                  <div style={{background:'#f0fdf4',border:'1px solid #22c55e',borderRadius:10,padding:'14px 16px',marginBottom:16,display:'flex',gap:10,alignItems:'center'}}>
                    <div style={{fontSize:22}}>✅</div>
                    <div><div style={{fontSize:14,fontWeight:700,color:'#16a34a'}}>PO importé avec succès !</div><div style={{fontSize:12,color:'#064e3b'}}>Tous les éléments ont été distribués</div></div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
                    {[{l:'N° PO',v:result.poNumber},{l:'Fournisseur',v:result.supplier},{l:'Montant',v:`${fmtN(result.totalAmount)} ${result.currency}`},{l:'Articles',v:`${result.items?.length||0}`}].map(i=>(
                      <div key={i.l} style={{background:'#f8fafc',borderRadius:8,padding:'10px 14px'}}><div style={{fontSize:10,color:'#94a3b8',fontWeight:700,textTransform:'uppercase'}}>{i.l}</div><div style={{fontSize:13,fontWeight:700,color:'#1e293b',marginTop:2}}>{i.v}</div></div>
                    ))}
                  </div>
                  {result.actions?.map((a,i)=>(
                    <div key={i} style={{display:'flex',gap:10,alignItems:'center',padding:'8px 12px',borderRadius:8,background:a.status==='done'?'#f0fdf4':'#fefce8',border:`1px solid ${a.status==='done'?'#bbf7d0':'#fef08a'}`,marginBottom:6}}>
                      <span style={{fontSize:16}}>{a.status==='done'?'✅':'⏳'}</span>
                      <span style={{fontSize:12,fontWeight:700,color:'#0078d4'}}>[{a.module}]</span>
                      <span style={{fontSize:12,color:'#374151'}}>{a.action}</span>
                    </div>
                  ))}
                  <div style={{display:'flex',gap:10,marginTop:16}}>
                    <button onClick={()=>{setResult(null);setPoFile(null);}} style={{flex:1,padding:10,borderRadius:8,border:'1px solid #e2e8f0',background:'white',cursor:'pointer',fontSize:13,fontWeight:600,color:'#374151'}}>← Importer autre</button>
                    <button onClick={()=>downloadTracker(result.id)} style={{flex:1,padding:10,borderRadius:8,border:'none',background:'#16a34a',color:'white',cursor:'pointer',fontSize:13,fontWeight:600}}>📥 Télécharger Tracker</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
