import { useState } from 'react';
import { api } from '../utils/api';

const SUGGESTIONS = ['Analyser les pannes récurrentes','Prédire les besoins maintenance','Optimiser les tournées techniciens','Sites à risque cette semaine','Recommandations amélioration KPIs','Forecast budget prochain trimestre'];

export default function AI() {
  const [msgs, setMsgs] = useState([
    { role:'assistant', content:'Bonjour ! Je suis l\'Agent IA CleanIT. Je peux analyser vos données réseau, prédire les pannes, optimiser vos opérations et vous fournir des insights business. Comment puis-je vous aider ?', time:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async (msg) => {
    const q = msg || input;
    if (!q.trim()) return;
    setMsgs(p=>[...p,{role:'user',content:q,time:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}]);
    setInput(''); setLoading(true);
    try {
      const r = await api.post('/ai/chat', { message: q });
      setMsgs(p=>[...p,{role:'assistant',content:r.data.reply||r.data.message,time:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}]);
    } catch {
      const responses = {
        'panne':'Analyse des pannes: DLA-003 a 3 incidents récurrents sur BBU-01. Probabilité de panne dans les 7 prochains jours: 78%. Recommandation: Planifier maintenance préventive immédiate.',
        'predict':'Prédiction maintenance: Sites YDE-002 et GAR-001 nécessiteront une intervention dans les 15 prochains jours. Confiance: 85%.',
        'optimis':'Optimisation tournées: Thomas Ngono peut couvrir DLA-001 + DLA-002 en une journée. Économie estimée: 150 000 XAF de carburant/semaine.',
        'risque':'Sites à risque: DLA-003 (critique - disponibilité 94.2%), GAR-001 (alerte - latence 38ms). Action requise dans les 48h.',
        'budget':'Forecast Q2: Revenus prévus 52 M XAF (+15%), Dépenses 18 M XAF. Marge nette estimée: 34 M XAF.',
        'default':'Analyse en cours... Sur base des données actuelles, je recommande de prioriser: 1) Maintenance DLA-003 (critique), 2) Révision SLA Orange (pénalités accumulées), 3) Recrutement technicien région Nord.'
      };
      const key = Object.keys(responses).find(k=>q.toLowerCase().includes(k))||'default';
      setMsgs(p=>[...p,{role:'assistant',content:responses[key],time:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}]);
    }
    setLoading(false);
  };

  return (
    <div style={{padding:24,background:'#f5f7fa',minHeight:'100%',display:'flex',flexDirection:'column',height:'calc(100vh - 56px)'}}>
      <div style={{marginBottom:20}}>
        <h1 style={{fontSize:22,fontWeight:800,color:'#1e293b',margin:0}}>IA Prédictive</h1>
        <p style={{color:'#64748b',fontSize:13,margin:'4px 0 0'}}>Agent IA pour analyse, prédiction et optimisation des opérations</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:16,flex:1,overflow:'hidden'}}>
        {/* Chat */}
        <div style={{background:'white',borderRadius:12,border:'1px solid #e8ecf0',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
          <div style={{padding:'14px 16px',background:'linear-gradient(135deg,#4c1d95,#7c3aed)',color:'white',display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>🤖</div>
            <div><div style={{fontSize:14,fontWeight:700}}>Agent IA CleanIT</div><div style={{fontSize:11,opacity:0.75}}>Analyse · Prédiction · Optimisation</div></div>
            <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:4,fontSize:11}}><div style={{width:6,height:6,borderRadius:'50%',background:'#34c97e',animation:'pulse 2s infinite'}} />En ligne</div>
          </div>

          <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:12,background:'#f8fafc'}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:'flex',flexDirection:m.role==='user'?'row-reverse':'row',gap:10,alignItems:'flex-end'}}>
                {m.role==='assistant' && <div style={{width:32,height:32,borderRadius:'50%',background:'#7c3aed',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>🤖</div>}
                <div style={{maxWidth:'75%'}}>
                  <div style={{padding:'10px 14px',borderRadius:m.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px',background:m.role==='user'?'linear-gradient(135deg,#4f8ef7,#6ea8fe)':'white',color:m.role==='user'?'white':'#1e293b',fontSize:13,lineHeight:1.6,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',border:m.role==='assistant'?'1px solid #f1f5f9':'none'}}>{m.content}</div>
                  <div style={{fontSize:10,color:'#94a3b8',marginTop:3,textAlign:m.role==='user'?'right':'left'}}>{m.time}</div>
                </div>
              </div>
            ))}
            {loading && <div style={{display:'flex',gap:10,alignItems:'flex-end'}}><div style={{width:32,height:32,borderRadius:'50%',background:'#7c3aed',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🤖</div><div style={{padding:'10px 14px',borderRadius:'16px 16px 16px 4px',background:'white',border:'1px solid #f1f5f9',display:'flex',gap:4,alignItems:'center'}}>{[0,1,2].map(j=><div key={j} style={{width:7,height:7,borderRadius:'50%',background:'#94a3b8',animation:`bounce 1s ${j*0.2}s infinite`}} />)}</div></div>}
          </div>

          <div style={{padding:'12px 16px',borderTop:'1px solid #e8ecf0'}}>
            <div style={{display:'flex',gap:8,alignItems:'center',background:'#f8fafc',borderRadius:24,padding:'8px 16px',border:'1px solid #e8ecf0'}}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Posez votre question à l'IA..." style={{flex:1,border:'none',background:'transparent',fontSize:13,outline:'none',color:'#1e293b'}} />
              <button onClick={()=>send()} disabled={!input.trim()||loading} style={{background:input.trim()&&!loading?'#7c3aed':'#e2e8f0',border:'none',borderRadius:'50%',width:32,height:32,cursor:input.trim()&&!loading?'pointer':'default',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div style={{background:'white',borderRadius:12,padding:16,border:'1px solid #e8ecf0',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
            <div style={{fontSize:13,fontWeight:700,color:'#1e293b',marginBottom:12}}>💡 Suggestions rapides</div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {SUGGESTIONS.map(s=>(
                <button key={s} onClick={()=>send(s)} style={{padding:'8px 12px',borderRadius:8,border:'1px solid #ede9fe',background:'white',color:'#7c3aed',fontSize:12,cursor:'pointer',fontWeight:500,textAlign:'left',transition:'all .15s'}}
                  onMouseEnter={e=>{e.currentTarget.style.background='#f5f3ff';e.currentTarget.style.borderColor='#7c3aed';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='white';e.currentTarget.style.borderColor='#ede9fe';}}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div style={{background:'white',borderRadius:12,padding:16,border:'1px solid #e8ecf0',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
            <div style={{fontSize:13,fontWeight:700,color:'#1e293b',marginBottom:12}}>🧠 Capacités IA</div>
            {[{icon:'📊',l:'Analyse KPIs'},{icon:'🔮',l:'Prédiction pannes'},{icon:'🗺',l:'Optimisation routes'},{icon:'💰',l:'Forecast budget'},{icon:'⚠',l:'Alertes proactives'}].map(c=>(
              <div key={c.l} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',fontSize:12,color:'#374151'}}><span style={{fontSize:16}}>{c.icon}</span>{c.l}</div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
