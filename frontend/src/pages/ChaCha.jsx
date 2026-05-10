import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MODEL    = 'llama-3.3-70b-versatile';

const SYSTEM = `Tu es ChaCha, l'assistante IA intégrée dans CleanIT ERP — système de gestion d'une entreprise télécom au Cameroun partenaire Huawei.

DONNÉES ENTREPRISE EN TEMPS RÉEL:
- Jobs actifs: Installation 5G NR DLA-001 (165M FCFA), Maintenance 4G YDE-001, Infrastructure GAR-001, Fibre BFN-001
- Clients: MTN Cameroun, Orange Cameroun, CAMTEL, Gouvernement Cameroun
- Factures en retard: Orange Cameroun 10.2M FCFA, Gouvernement 22.4M FCFA
- Trésorerie: 58.5M FCFA | CA Q1 2024: 207M FCFA
- 7 employés internes + 5 techniciens terrain
- Fournisseurs: Huawei Technologies, Nokia, Ericsson

TU PEUX:
- Répondre à toutes questions sur l'entreprise et ses données
- Générer des documents (dis "GENERER_EXCEL:type" ou "GENERER_WORD:type")
- Naviguer dans le système (dis "NAVIGUER:/url")
- Analyser les données financières
- Faire des recherches
- Jouer de la musique (dis "MUSIQUE:titre")

PERSONNALITÉ:
- Directe, intelligente, proactive
- Tu parles naturellement en français
- Tu n'expliques pas ce que tu peux faire — tu le fais directement
- Réponses concises et utiles
- Tu anticipes les besoins`;

export default function ChaCha() {
  const navigate  = useNavigate();
  const [open,    setOpen]    = useState(false);
  const [msgs,    setMsgs]    = useState([]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [listening,setListening]=useState(false);
  const [speaking, setSpeaking]=useState(false);
  const [wakeActive,setWakeActive]=useState(false);
  const endRef    = useRef(null);
  const inputRef  = useRef(null);
  const synthRef  = useRef(window.speechSynthesis);
  const wakeRef   = useRef(null);
  const recognRef = useRef(null);

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}); },[msgs]);

  // Activation vocale continue — écoute "ChaCha"
  useEffect(()=>{
    startWakeWord();
    return ()=>{ wakeRef.current?.stop(); };
  },[]);

  const startWakeWord = () => {
    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR) return;
    try {
      const r = new SR();
      r.lang='fr-FR'; r.continuous=true; r.interimResults=true;
      r.onresult = (e)=>{
        const transcript = Array.from(e.results).map(r=>r[0].transcript).join(' ').toLowerCase();
        if(transcript.includes('chacha')||transcript.includes('cha cha')){
          setOpen(true);
          setWakeActive(true);
          setTimeout(()=>setWakeActive(false),2000);
          r.stop();
          setTimeout(startWakeWord, 3000);
        }
      };
      r.onerror = ()=>{ setTimeout(startWakeWord,5000); };
      r.onend   = ()=>{ if(!listening) setTimeout(startWakeWord,2000); };
      r.start();
      wakeRef.current = r;
    } catch(e){}
  };

  // Voix
  const speak = useCallback((text)=>{
    if(!synthRef.current) return;
    synthRef.current.cancel();
    const clean = text.replace(/\*\*/g,'').replace(/#{1,3}\s/g,'').replace(/`[^`]+`/g,'').substring(0,400);
    const u = new SpeechSynthesisUtterance(clean);
    u.lang='fr-FR'; u.rate=1.05; u.pitch=1.1; u.volume=0.9;
    const voices=synthRef.current.getVoices();
    const fr=voices.find(v=>v.lang.startsWith('fr'));
    if(fr) u.voice=fr;
    u.onstart=()=>setSpeaking(true);
    u.onend=()=>setSpeaking(false);
    u.onerror=()=>setSpeaking(false);
    synthRef.current.speak(u);
  },[]);

  // Écoute manuelle
  const startListening = ()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){ alert('Utilisez Chrome pour la reconnaissance vocale'); return; }
    wakeRef.current?.stop();
    const r=new SR();
    r.lang='fr-FR'; r.continuous=false; r.interimResults=false;
    r.onstart=()=>setListening(true);
    r.onend=()=>{ setListening(false); setTimeout(startWakeWord,1000); };
    r.onerror=()=>{ setListening(false); setTimeout(startWakeWord,1000); };
    r.onresult=(e)=>{
      const t=e.results[0][0].transcript;
      setInput(t);
      setTimeout(()=>send(t),300);
    };
    r.start();
    recognRef.current=r;
  };

  // Traiter actions
  const processActions = useCallback(async (text)=>{
    if(text.includes('NAVIGUER:')){
      const url=text.match(/NAVIGUER:([^\s\n]+)/)?.[1];
      if(url) setTimeout(()=>navigate(url),800);
    }
    if(text.includes('GENERER_EXCEL:')){
      const type=text.match(/GENERER_EXCEL:(\w+)/)?.[1]||'custom';
      const ExcelJS=(await import('exceljs')).default;
      const wb=new ExcelJS.Workbook();
      const ws=wb.addWorksheet('ChaCha Export');
      ws.getRow(1).values=['Document généré par ChaCha IA','','','CleanIT ERP'];
      ws.getRow(1).getCell(1).font={bold:true,size:14};
      if(type==='factures'){
        ws.addRow([]);
        const h=ws.addRow(['N° Facture','Client','Date','Échéance','Total TTC','Statut']);
        h.eachCell(c=>{c.font={bold:true,color:{argb:'FFFFFFFF'}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF2563EB'}};});
        ws.columns=[{width:16},{width:28},{width:14},{width:14},{width:18},{width:14}];
        [['INV-2024-001','MTN Cameroun','15/01/2024','15/02/2024','53 935 625','Payée'],
         ['INV-2024-002','Orange Cameroun','28/01/2024','13/03/2024','10 195 875','En retard'],
         ['INV-2024-003','Gouvernement CM','01/02/2024','01/04/2024','32 000 000','Partielle'],
         ['INV-2024-004','CAMTEL','10/03/2024','09/05/2024','71 550 000','Envoyée'],
        ].forEach((r,i)=>{ const row=ws.addRow(r); if(i%2===0) row.eachCell(c=>c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFDEEAF1'}}); });
      } else if(type==='paie'){
        ws.addRow([]);
        const h=ws.addRow(['Matricule','Employé','Poste','Brut','CNPS','IRPP','Net']);
        h.eachCell(c=>{c.font={bold:true,color:{argb:'FFFFFFFF'}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF7C3AED'}};});
        ws.columns=[{width:10},{width:22},{width:22},{width:14},{width:12},{width:12},{width:14}];
        [['EI-001','Marie Kamga','Chef Projet',850000,71400,72983,705617],
         ['EI-002','Jean Fouda','PM',750000,63000,58233,628767],
         ['EI-003','Alice Finance','Dir. Fin.',1200000,100800,133233,965967],
        ].forEach((r,i)=>{ const row=ws.addRow(r); if(i%2===0) row.eachCell(c=>c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF5F3FF'}}); });
      } else if(type==='jobs'){
        ws.addRow([]);
        const h=ws.addRow(['Job ID','Nom','Client','Contrat FCFA','Coûts','Statut']);
        h.eachCell(c=>{c.font={bold:true,color:{argb:'FFFFFFFF'}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF059669'}};});
        ws.columns=[{width:12},{width:30},{width:22},{width:16},{width:14},{width:14}];
        [['JOB-001','Installation 5G NR DLA-001','MTN Cameroun',165000000,35000000,'En cours'],
         ['JOB-002','Maintenance 4G YDE-001','Orange Cameroun',38000000,19200000,'Terminé'],
         ['JOB-003','Infrastructure GAR-001','Gouvernement CM',29000000,12600000,'En cours'],
        ].forEach((r,i)=>{ const row=ws.addRow(r); if(i%2===0) row.eachCell(c=>c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF0FDF4'}}); });
      }
      const buf=await wb.xlsx.writeBuffer();
      const a=document.createElement('a');
      a.href=URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
      a.download=`chacha_${type}_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
    }
    if(text.includes('GENERER_WORD:')){
      const type=text.match(/GENERER_WORD:(\w+)/)?.[1]||'rapport';
      const today=new Date().toLocaleDateString('fr-FR');
      const html=`<html><head><meta charset="utf-8"/><style>body{font-family:Calibri;font-size:11pt;margin:2cm}h1{color:#1F4E79;text-align:center}h2{color:#2563EB;border-bottom:1px solid #2563EB;padding-bottom:3px}.header{background:#1F4E79;color:white;padding:15px;text-align:center;margin-bottom:20px}</style></head><body>
      <div class="header"><h2 style="color:white;margin:0">⚡ CleanIT ERP — Document généré par ChaCha IA</h2><p style="margin:5px 0;opacity:.8">${today}</p></div>
      <h1>${type==='contrat'?'CONTRAT DE PRESTATIONS':type==='rapport'?'RAPPORT D\'ACTIVITÉ':'DOCUMENT CleanIT'}</h1>
      <h2>1. Parties</h2><p>CleanIT Cameroun — ${today}</p>
      <h2>2. Objet</h2><p>[À compléter selon vos besoins]</p>
      <h2>3. Conditions financières</h2><p>Montant: ____________ FCFA | TVA 19.25%: ____________</p>
      <h2>4. Signatures</h2>
      <table width="100%"><tr><td width="50%"><p>Pour CleanIT:</p><br/><p>________________</p></td><td><p>Pour le Client:</p><br/><p>________________</p></td></tr></table>
      </body></html>`;
      const blob=new Blob([html],{type:'application/msword'});
      const a=document.createElement('a');
      a.href=URL.createObjectURL(blob);
      a.download=`chacha_${type}_${today.replace(/\//g,'-')}.doc`;
      a.click();
    }
    if(text.includes('MUSIQUE:')){
      const q=text.match(/MUSIQUE:([^\n]+)/)?.[1]||'musique';
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`, '_blank');
    }
  },[navigate]);

  // Envoyer message
  const send = useCallback(async(text)=>{
    const msg=(text||input).trim();
    if(!msg||loading) return;
    setInput('');
    setLoading(true);
    const userMsg={role:'user',content:msg,ts:Date.now()};
    setMsgs(p=>[...p,userMsg]);

    try {
      const history=msgs.slice(-8).map(m=>({role:m.role,content:m.content}));
      history.push({role:'user',content:msg});

      const res=await fetch(GROQ_API,{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${GROQ_KEY}`},
        body:JSON.stringify({model:MODEL,messages:[{role:'system',content:SYSTEM},...history],max_tokens:800,temperature:0.7}),
      });

      if(!res.ok) throw new Error(`Groq: ${res.status}`);
      const data=await res.json();
      const reply=data.choices[0]?.message?.content||'Désolée, je n\'ai pas pu répondre.';

      await processActions(reply);
      const clean=reply.replace(/NAVIGUER:[^\s\n]+/g,'').replace(/GENERER_EXCEL:\w+/g,'').replace(/GENERER_WORD:\w+/g,'').replace(/MUSIQUE:[^\n]+/g,'').trim();

      const aMsg={role:'assistant',content:clean,ts:Date.now()};
      setMsgs(p=>[...p,aMsg]);
      speak(clean);
    } catch(e){
      const err={role:'assistant',content:`Erreur de connexion: ${e.message}`,ts:Date.now()};
      setMsgs(p=>[...p,err]);
    }
    setLoading(false);
  },[input,loading,msgs,processActions,speak]);

  const handleKey=e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();} };

  const renderMd=(t)=>{
    if(!t) return '';
    return t.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
      .replace(/^- (.+)$/gm,'<div style="padding:1px 0 1px 12px;position:relative"><span style="position:absolute;left:2px">•</span>$1</div>')
      .replace(/\n/g,'<br/>');
  };

  return(
    <>
      {/* Bouton flottant ChaCha */}
      <div style={{position:'fixed',bottom:24,right:24,zIndex:9999}}>
        {/* Indicateur wake word */}
        {wakeActive&&(
          <div style={{position:'absolute',bottom:'100%',right:0,marginBottom:8,background:'#10b981',color:'white',padding:'6px 12px',borderRadius:20,fontSize:12,fontWeight:700,whiteSpace:'nowrap',boxShadow:'0 4px 12px rgba(16,185,129,.4)'}}>
            👋 Bonjour ! ChaCha à votre service
          </div>
        )}

        {/* Panel chat */}
        {open&&(
          <div style={{position:'absolute',bottom:'calc(100% + 12px)',right:0,width:380,height:520,background:'#0f172a',borderRadius:20,boxShadow:'0 24px 64px rgba(0,0,0,.4)',display:'flex',flexDirection:'column',overflow:'hidden',border:'1px solid rgba(255,255,255,.08)'}}>
            {/* Header */}
            <div style={{padding:'14px 16px',background:'linear-gradient(135deg,#1e3a5f,#312e81)',display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
              <div style={{position:'relative'}}>
                <div style={{width:38,height:38,borderRadius:12,background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,boxShadow:'0 0 16px rgba(59,130,246,.5)'}}>🤖</div>
                <div style={{position:'absolute',bottom:-1,right:-1,width:11,height:11,borderRadius:6,background:'#10b981',border:'2px solid #0f172a'}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:800,color:'white'}}>ChaCha</div>
                <div style={{fontSize:10,color:speaking?'#60a5fa':'#10b981',fontWeight:600}}>
                  {speaking?'🔊 En train de parler...':loading?'⏳ Réflexion...':'● En ligne · Llama 3.3 70B'}
                </div>
              </div>
              <div style={{display:'flex',gap:6}}>
                <button onClick={()=>synthRef.current?.cancel()} style={{width:28,height:28,borderRadius:8,background:'rgba(255,255,255,.1)',border:'none',color:'white',cursor:'pointer',fontSize:13}}>🔇</button>
                <button onClick={()=>setOpen(false)} style={{width:28,height:28,borderRadius:8,background:'rgba(255,255,255,.1)',border:'none',color:'white',cursor:'pointer',fontSize:16}}>×</button>
              </div>
            </div>

            {/* Messages */}
            <div style={{flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:12}}>
              {msgs.length===0&&(
                <div style={{textAlign:'center',marginTop:60,color:'rgba(255,255,255,.3)'}}>
                  <div style={{fontSize:40,marginBottom:12}}>🤖</div>
                  <div style={{fontSize:14,fontWeight:700,color:'rgba(255,255,255,.5)'}}>Bonjour, je suis ChaCha</div>
                  <div style={{fontSize:12,marginTop:4,color:'rgba(255,255,255,.3)'}}>Posez-moi n'importe quelle question</div>
                  <div style={{fontSize:11,marginTop:8,color:'rgba(255,255,255,.2)'}}>ou dites "ChaCha" pour m'activer</div>
                </div>
              )}
              {msgs.map((m,i)=>{
                const isMe=m.role==='user';
                return(
                  <div key={i} style={{display:'flex',justifyContent:isMe?'flex-end':'flex-start',gap:8}}>
                    {!isMe&&<div style={{width:28,height:28,borderRadius:9,background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0,alignSelf:'flex-end'}}>🤖</div>}
                    <div style={{maxWidth:'80%',padding:'10px 13px',borderRadius:isMe?'14px 14px 4px 14px':'14px 14px 14px 4px',background:isMe?'#3b82f6':'rgba(255,255,255,.06)',color:'white',fontSize:13,lineHeight:1.5,border:isMe?'none':'1px solid rgba(255,255,255,.08)'}}>
                      {isMe?m.content:<div dangerouslySetInnerHTML={{__html:renderMd(m.content)}}/>}
                    </div>
                  </div>
                );
              })}
              {loading&&(
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <div style={{width:28,height:28,borderRadius:9,background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🤖</div>
                  <div style={{padding:'10px 14px',borderRadius:'14px 14px 14px 4px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.08)',display:'flex',gap:4,alignItems:'center'}}>
                    {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:3,background:'#3b82f6',animation:`bounce ${0.6+i*0.15}s ease infinite alternate`}}/>)}
                  </div>
                </div>
              )}
              <div ref={endRef}/>
            </div>

            {/* Input */}
            <div style={{padding:'12px',background:'rgba(255,255,255,.03)',borderTop:'1px solid rgba(255,255,255,.06)',flexShrink:0}}>
              <div style={{display:'flex',gap:8,alignItems:'flex-end',background:'rgba(255,255,255,.06)',borderRadius:14,padding:'8px 12px',border:'1px solid rgba(255,255,255,.08)'}}>
                <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey} ref={inputRef}
                  placeholder="Demandez à ChaCha..." rows={1}
                  style={{flex:1,background:'transparent',border:'none',outline:'none',color:'white',fontSize:13,fontFamily:'inherit',resize:'none',lineHeight:1.5,maxHeight:80,overflowY:'auto'}}/>
                <div style={{display:'flex',gap:6,flexShrink:0}}>
                  <button onClick={listening?()=>recognRef.current?.stop():startListening}
                    style={{width:32,height:32,borderRadius:10,border:'none',background:listening?'#ef4444':'rgba(255,255,255,.1)',color:'white',cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    🎤
                  </button>
                  <button onClick={()=>send()} disabled={!input.trim()||loading}
                    style={{width:32,height:32,borderRadius:10,border:'none',background:input.trim()&&!loading?'#3b82f6':'rgba(255,255,255,.1)',color:'white',cursor:input.trim()&&!loading?'pointer':'default',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    ➤
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bouton principal */}
        <button onClick={()=>setOpen(p=>!p)}
          style={{width:56,height:56,borderRadius:16,background:open?'#1e293b':'linear-gradient(135deg,#3b82f6,#8b5cf6)',border:open?'2px solid #3b82f6':'none',color:'white',cursor:'pointer',fontSize:26,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:open?'0 0 0 3px rgba(59,130,246,.3)':'0 8px 24px rgba(59,130,246,.4)',transition:'all .2s',position:'relative'}}>
          {open?'×':'🤖'}
          {!open&&msgs.length>0&&(
            <div style={{position:'absolute',top:-4,right:-4,width:16,height:16,borderRadius:8,background:'#ef4444',border:'2px solid white',fontSize:9,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center'}}>
              {msgs.filter(m=>m.role==='assistant').length}
            </div>
          )}
        </button>
      </div>

      <style>{`
        @keyframes bounce{from{transform:translateY(0)}to{transform:translateY(-6px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </>
  );
}
