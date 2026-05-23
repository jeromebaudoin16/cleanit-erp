import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;

const SYSTEM = `Tu es ChaCha, l'assistante IA de CleanIT ERP — entreprise télécom au Cameroun partenaire Huawei.

DONNÉES ENTREPRISE:
- Jobs: Installation 5G NR DLA-001 (165M FCFA), Maintenance 4G YDE-001, Infrastructure GAR-001, Fibre BFN-001
- Clients: MTN Cameroun, Orange Cameroun, CAMTEL, Gouvernement Cameroun  
- Factures en retard: Orange 10.2M FCFA, Gouvernement 22.4M FCFA
- Trésorerie: 58.5M FCFA | CA Q1: 207M FCFA | 12 employés

COMMANDES SYSTÈME (utilise-les quand nécessaire, sans les afficher):
- Navigation: ##NAVIGATE:/url##
- Excel factures: ##EXCEL:factures##
- Excel paie: ##EXCEL:paie##  
- Excel jobs: ##EXCEL:jobs##
- Word contrat: ##WORD:contrat##
- Word rapport: ##WORD:rapport##
- Musique: ##MUSIC:titre##

RÈGLES:
- Réponds toujours en français, sois concise et intelligente
- N'explique jamais ce que tu peux faire, fais-le directement
- Ne montre JAMAIS les commandes ## dans ta réponse
- Tu t'appelles ChaCha, c'est tout ce que l'utilisateur doit savoir
- Sois proactive et anticipe les besoins`;

const STORAGE_KEY = 'chacha_history';

const loadHistory = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'); } catch { return []; }
};
const saveHistory = (msgs) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-50))); } catch {}
};


// ===== CHACHA TOOLS =====
const CHACHA_TOOLS = [
  {type:"function",function:{name:"naviguer_module",description:"Naviguer vers un module CleanIT ERP",parameters:{type:"object",properties:{url:{type:"string",description:"URL: /dashboard /approvals /finance /rh /crm /terrain /map /bi /cleanitcomm /pointage /planning /techniciens /purchase-orders /cleanitbooks"}},required:["url"]}}},
  {type:"function",function:{name:"lire_donnees_systeme",description:"Lire les données réelles du système",parameters:{type:"object",properties:{module:{type:"string",enum:["approvals","finances","techniciens","bc_sites"]}},required:["module"]}}},
  {type:"function",function:{name:"creer_approbation",description:"Créer une demande dans Approvals",parameters:{type:"object",properties:{titre:{type:"string"},montant:{type:"number"},beneficiaire:{type:"string"},site:{type:"string"},type:{type:"string",enum:["payment_request","leave_request","purchase_request"]}},required:["titre"]}}},
  {type:"function",function:{name:"chercher_technicien",description:"Trouver un technicien disponible",parameters:{type:"object",properties:{competence:{type:"string"},region:{type:"string"}}}}},
  {type:"function",function:{name:"generer_rapport",description:"Générer Excel ou Word",parameters:{type:"object",properties:{type:{type:"string",enum:["factures","paie","jobs","contrat","rapport"]}},required:["type"]}}},
];

export default function ChaCha() {
  const navigate   = useNavigate();
  const [open,     setOpen]     = useState(false);
  const [msgs,     setMsgs]     = useState(loadHistory);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [listening,setListening]= useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [wakeOn,   setWakeOn]   = useState(false);

  const endRef    = useRef(null);
  const inputRef  = useRef(null);
  const synthRef  = useRef(window.speechSynthesis);
  const wakeRef   = useRef(null);
  const recRef    = useRef(null);

  // Persister historique
  useEffect(()=>saveHistory(msgs),[msgs]);
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}); },[msgs,open]);

  // Wake word continu
  useEffect(()=>{ startWake(); return()=>wakeRef.current?.abort?.(); },[]);

  const startWake = useCallback(()=>{
    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR) return;
    try {
      const r = new SR();
      r.lang='fr-FR'; r.continuous=true; r.interimResults=true;
      r.onresult=(e)=>{
        const t=Array.from(e.results).map(x=>x[0].transcript).join(' ').toLowerCase();
        if(t.includes('chacha')||t.includes('cha cha')){
          setOpen(true); setWakeOn(true);
          setTimeout(()=>setWakeOn(false),2000);
          r.stop(); setTimeout(startWake,3000);
        }
      };
      r.onerror=()=>setTimeout(startWake,5000);
      r.onend=()=>{ if(!listening) setTimeout(startWake,2000); };
      r.start(); wakeRef.current=r;
    } catch{}
  },[listening]);

  // Voix
  const speak = useCallback((text)=>{
    if(!synthRef.current||!text||!voiceOn) return;
    synthRef.current.cancel();
    const clean=text.replace(/#{1,3}\s?/g,'').replace(/\*\*/g,'').replace(/\*/g,'')
      .replace(/`[^`]+`/g,'').replace(/##[^#]+##/g,'')
      .replace(/Erreur:.*/g,'').substring(0,400);
    if(!clean.trim()) return;
    const trySpeak=()=>{
      const u=new SpeechSynthesisUtterance(clean);
      u.lang='fr-FR'; u.rate=0.95; u.pitch=1.0; u.volume=1;
      const voices=synthRef.current.getVoices();
      // Priorité: voix française féminine native
      const fr = voices.find(v=>v.lang==='fr-FR'&&v.name.includes('Female'))
        || voices.find(v=>v.lang==='fr-FR')
        || voices.find(v=>v.lang.startsWith('fr'))
        || voices.find(v=>v.default);
      if(fr){ u.voice=fr; }
      u.onstart=()=>setSpeaking(true);
      u.onend=()=>setSpeaking(false);
      u.onerror=(e)=>{ setSpeaking(false); console.warn('Speech error:',e.error); };
      synthRef.current.speak(u);
    };
    // Attendre que les voix soient chargées
    if(synthRef.current.getVoices().length>0){ trySpeak(); }
    else{ synthRef.current.onvoiceschanged=()=>{ trySpeak(); synthRef.current.onvoiceschanged=null; }; }
  },[]);

  // Actions
  const doActions = useCallback(async(text)=>{
    const nav=text.match(/##NAVIGATE:([^#]+)##/);
    if(nav){ setTimeout(()=>navigate(nav[1].trim()),500); }

    const excel=text.match(/##EXCEL:(\w+)##/);
    if(excel){
      const type=excel[1];
      const ExcelJS=(await import('exceljs')).default;
      const wb=new ExcelJS.Workbook(); wb.creator='ChaCha';
      const ws=wb.addWorksheet(type);
      const hStyle={font:{bold:true,color:{argb:'FFFFFFFF'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:'FF1F4E79'}},alignment:{horizontal:'center'}};
      if(type==='factures'){
        ws.columns=[{key:'id',width:16,header:'N° Facture'},{key:'client',width:26,header:'Client'},{key:'date',width:14,header:'Date'},{key:'total',width:18,header:'Total TTC'},{key:'statut',width:14,header:'Statut'}];
        ws.getRow(1).eachCell(c=>{c.font=hStyle.font;c.fill=hStyle.fill;c.alignment=hStyle.alignment;});
        [['INV-2024-001','MTN Cameroun','15/01/2024','53 935 625 F','Payée'],['INV-2024-002','Orange Cameroun','28/01/2024','10 195 875 F','En retard'],['INV-2024-003','Gouvernement CM','01/02/2024','32 000 000 F','Partielle'],['INV-2024-004','CAMTEL','10/03/2024','71 550 000 F','Envoyée']].forEach((r,i)=>{const row=ws.addRow({id:r[0],client:r[1],date:r[2],total:r[3],statut:r[4]});if(i%2===0)row.eachCell(c=>c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFDEEAF1'}});});
      } else if(type==='paie'){
        ws.columns=[{key:'mat',width:10,header:'Matricule'},{key:'nom',width:22,header:'Employé'},{key:'brut',width:14,header:'Brut'},{key:'cnps',width:12,header:'CNPS'},{key:'net',width:14,header:'Net'}];
        ws.getRow(1).eachCell(c=>{c.font=hStyle.font;c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF7C3AED'}};c.alignment=hStyle.alignment;});
        [['EI-001','Marie Kamga','850 000','71 400','705 617'],['EI-002','Jean Fouda','750 000','63 000','628 767'],['EI-003','Alice Finance','1 200 000','100 800','965 967']].forEach((r,i)=>{const row=ws.addRow({mat:r[0],nom:r[1],brut:r[2],cnps:r[3],net:r[4]});if(i%2===0)row.eachCell(c=>c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF5F3FF'}});});
      } else if(type==='jobs'){
        ws.columns=[{key:'id',width:12,header:'Job ID'},{key:'nom',width:30,header:'Nom'},{key:'client',width:22,header:'Client'},{key:'contrat',width:16,header:'Contrat'},{key:'statut',width:14,header:'Statut'}];
        ws.getRow(1).eachCell(c=>{c.font=hStyle.font;c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF059669'}};c.alignment=hStyle.alignment;});
        [['JOB-001','Installation 5G NR DLA-001','MTN Cameroun','165 000 000 F','En cours'],['JOB-002','Maintenance 4G LTE YDE-001','Orange Cameroun','38 000 000 F','Terminé'],['JOB-003','Infrastructure GAR-001','Gouvernement CM','29 000 000 F','En cours'],['JOB-004','Fibre Optique BFN-001','CAMTEL','195 000 000 F','Attribué']].forEach((r,i)=>{const row=ws.addRow({id:r[0],nom:r[1],client:r[2],contrat:r[3],statut:r[4]});if(i%2===0)row.eachCell(c=>c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF0FDF4'}});});
      }
      const buf=await wb.xlsx.writeBuffer();
      const a=document.createElement('a');
      a.href=URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
      a.download=`${type}_${new Date().toISOString().split('T')[0]}.xlsx`; a.click();
    }

    const word=text.match(/##WORD:(\w+)##/);
    if(word){
      const type=word[1]; const today=new Date().toLocaleDateString('fr-FR');
      const html=`<html><head><meta charset="utf-8"/><style>body{font-family:Calibri,Arial;font-size:11pt;margin:2.5cm}h1{color:#1F4E79;text-align:center;font-size:16pt}h2{color:#2563EB;font-size:13pt;border-bottom:1px solid #2563EB;padding-bottom:4px;margin-top:20px}.header{background:linear-gradient(135deg,#1F4E79,#2563EB);color:white;padding:20px;text-align:center;border-radius:5px;margin-bottom:25px}.signature{display:flex;justify-content:space-between;margin-top:50px}.sig{text-align:center;width:45%}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px}th{background:#1F4E79;color:white}</style></head><body>
<div class="header"><h2 style="margin:0;color:white">⚡ CleanIT ERP</h2><p style="margin:5px 0;opacity:.8;font-size:10pt">Document généré — ${today}</p></div>
<h1>${type==='contrat'?'CONTRAT DE PRESTATIONS DE SERVICES':type==='rapport'?'RAPPORT D\'ACTIVITÉ':type==='courrier'?'COURRIER':'DOCUMENT'}</h1>
${type==='contrat'?`
<h2>ARTICLE 1 — PARTIES CONTRACTANTES</h2>
<p><strong>Le Prestataire :</strong> CleanIT Cameroun, société de services télécom, sise à Douala, Cameroun.</p>
<p><strong>Le Client :</strong> _________________________________, représenté par _________________________.</p>
<h2>ARTICLE 2 — OBJET</h2>
<p>Le présent contrat a pour objet : _____________________________________________</p>
<h2>ARTICLE 3 — MONTANT ET PAIEMENT</h2>
<table><tr><th>Prestation</th><th>Montant HT</th><th>TVA 19.25%</th><th>Total TTC</th></tr>
<tr><td>_____________</td><td>____________ FCFA</td><td>____________ FCFA</td><td>____________ FCFA</td></tr></table>
<h2>ARTICLE 4 — DURÉE</h2>
<p>Durée : _________ mois à compter du _____________</p>
<h2>ARTICLE 5 — SIGNATURES</h2>
<div class="signature"><div class="sig"><p>Pour CleanIT Cameroun</p><br/><br/><hr/><p style="font-size:9pt">Signature & Cachet</p></div>
<div class="sig"><p>Pour le Client</p><br/><br/><hr/><p style="font-size:9pt">Signature & Cachet</p></div></div>`:
type==='rapport'?`<h2>1. RÉSUMÉ EXÉCUTIF</h2><p>Période : _____________ | Établi le : ${today}</p>
<h2>2. INDICATEURS CLÉS</h2>
<table><tr><th>Indicateur</th><th>Valeur</th><th>Objectif</th><th>Écart</th></tr>
<tr><td>Chiffre d'affaires</td><td>207 M FCFA</td><td>200 M FCFA</td><td>+3.5%</td></tr>
<tr><td>Jobs actifs</td><td>5</td><td>—</td><td>—</td></tr></table>
<h2>3. OBSERVATIONS</h2><p>_______________________________________________</p>`:
`<p>Douala, le ${today}</p><p>Objet : ______________________________</p><br/><p>Madame, Monsieur,</p><br/><p>_____________________________________________</p><br/><p>Veuillez agréer nos cordiales salutations.</p><br/><p>La Direction</p>`}
</body></html>`;
      const a=document.createElement('a');
      a.href=URL.createObjectURL(new Blob([html],{type:'application/msword'}));
      a.download=`${type}_cleanit_${today.replace(/\//g,'-')}.doc`; a.click();
    }

    const music=text.match(/##MUSIC:([^#]+)##/);
    if(music) window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(music[1])}`, '_blank');
  },[navigate]);

  // Envoi
  const send = useCallback(async(txt)=>{
    const msg=(txt||input).trim();
    if(!msg||loading) return;
    setInput('');
    setLoading(true);
    const userMsg={role:'user',content:msg,ts:Date.now()};
    setMsgs(p=>[...p,userMsg]);

    try {
      const history=msgs.slice(-12).map(m=>({role:m.role,content:m.content}));
      history.push({role:'user',content:msg});

      // ===== GROQ TOOL USE =====
      const res = await fetch(GROQ_API, {
        method: 'POST',
        headers: {'Content-Type':'application/json', 'Authorization': `Bearer ${GROQ_KEY}`},
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{role:'system', content:SYSTEM}, ...history],
          tools: CHACHA_TOOLS,
          tool_choice: 'auto',
          max_tokens: 800,
          temperature: 0.3
        })
      });

      if(!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      const choice = data.choices[0];
      const assistantMsg = choice.message;

      // Gérer les tool calls
      if(choice.finish_reason === 'tool_calls' && assistantMsg.tool_calls) {
        const toolResults = [];
        for(const tc of assistantMsg.tool_calls) {
          const args = JSON.parse(tc.function.arguments || '{}');
          let result = '';

          switch(tc.function.name) {
            case 'naviguer_module':
              setTimeout(() => navigate(args.url), 300);
              result = `Navigation vers ${args.url} effectuée`;
              break;
            case 'lire_donnees_systeme':
              result = lireSysteme(args.module);
              break;
            case 'creer_approbation': {
              const newApproval = {
                id: 'APV-' + Date.now(),
                title: args.titre,
                type: args.type || 'payment_request',
                amount: args.montant || 0,
                beneficiaryName: args.beneficiaire || '',
                site: args.site || '',
                justification: args.justification || '',
                status: 'pending',
                submittedAt: new Date().toISOString(),
                submittedBy: 'ChaCha IA'
              };
              try {
                const existing = JSON.parse(localStorage.getItem('cleanit_approvals_cache') || '[]');
                localStorage.setItem('cleanit_approvals_cache', JSON.stringify([...existing, newApproval]));
                result = JSON.stringify({succes: true, id: newApproval.id, message: 'Demande créée avec succès'});
              } catch(e) { result = JSON.stringify({succes: false, erreur: e.message}); }
              break;
            }
            case 'chercher_technicien':
              result = lireSysteme('techniciens');
              break;
            case 'generer_rapport':
              await doActions(`##EXCEL:${args.type}## ##WORD:${args.type}##`);
              result = `Rapport ${args.type} généré`;
              break;
            case 'afficher_alerte':
              result = `Alerte affichée: ${args.message}`;
              break;
            default:
              result = 'Action exécutée';
          }
          toolResults.push({role: 'tool', tool_call_id: tc.id, content: result});
        }

        // 2ème appel Groq avec les résultats des outils
        const res2 = await fetch(GROQ_API, {
          method: 'POST',
          headers: {'Content-Type':'application/json', 'Authorization': `Bearer ${GROQ_KEY}`},
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{role:'system', content:SYSTEM}, ...history, assistantMsg, ...toolResults],
            max_tokens: 600,
            temperature: 0.3
          })
        });
        const data2 = await res2.json();
        const finalText = data2.choices[0]?.message?.content || 'Action effectuée.';
        setMsgs(p=>[...p, {role:'assistant', content:finalText, ts:Date.now()}]);
        speak(finalText);
      } else {
        // Réponse texte directe
        const raw = assistantMsg.content || '';
        await doActions(raw);
        const clean = raw.replace(/##[^#]+##/g,'').trim();
        setMsgs(p=>[...p, {role:'assistant', content:clean, ts:Date.now()}]);
        speak(clean);
      }
    } catch(e){
      console.error('ChaCha error:', e, 'KEY:', GROQ_KEY?.slice(0,10));
      const err={role:'assistant',content:`Erreur: ${e.message||e} — Clé: ${GROQ_KEY?'OK ('+GROQ_KEY.slice(0,8)+'...)':'MANQUANTE'}`,ts:Date.now()};
      setMsgs(p=>[...p,err]);
    }
    setLoading(false);
  },[input,loading,msgs,doActions,speak]);

  // Micro manuel
  const startListening=()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR) return;
    wakeRef.current?.stop();
    const r=new SR();
    r.lang='fr-FR'; r.continuous=false; r.interimResults=false;
    r.onstart=()=>setListening(true);
    r.onend=()=>{ setListening(false); setTimeout(startWake,1000); };
    r.onerror=()=>{ setListening(false); setTimeout(startWake,1000); };
    r.onresult=(e)=>{ const t=e.results[0][0].transcript; setInput(t); setTimeout(()=>send(t),200); };
    r.start(); recRef.current=r;
  };

  const handleKey=e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();} };

  const renderMd=(t)=>{
    if(!t) return '';
    return t
      .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
      .replace(/^### (.+)$/gm,'<div style="font-weight:700;font-size:12px;color:#a78bfa;margin:8px 0 3px">$1</div>')
      .replace(/^## (.+)$/gm,'<div style="font-weight:800;font-size:13px;color:#c4b5fd;margin:10px 0 4px">$1</div>')
      .replace(/^- (.+)$/gm,'<div style="padding:2px 0 2px 14px;position:relative"><span style="position:absolute;left:4px;color:#8b5cf6">•</span>$1</div>')
      .replace(/`([^`]+)`/g,'<code style="background:rgba(139,92,246,.2);padding:1px 5px;border-radius:3px;font-size:11px">$1</code>')
      .replace(/\n\n/g,'<br/><br/>')
      .replace(/\n/g,'<br/>');
  };

  return(
    <>
      <style>{`
        @keyframes chacha-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes chacha-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(.96)}}
        @keyframes chacha-typing{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
        @keyframes chacha-glow{0%,100%{box-shadow:0 0 20px rgba(139,92,246,.4)}50%{box-shadow:0 0 40px rgba(139,92,246,.8)}}
        @keyframes chacha-appear{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:none}}
        .chacha-msg{animation:chacha-appear .2s ease}
        .chacha-input:focus{border-color:rgba(139,92,246,.5)!important;box-shadow:0 0 0 2px rgba(139,92,246,.15)!important}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(139,92,246,.3);border-radius:3px}
      `}</style>

      {/* Wake word indicator */}
      {wakeOn&&(
        <div style={{position:'fixed',top:20,left:'50%',transform:'translateX(-50%)',zIndex:10001,background:'linear-gradient(135deg,#7c3aed,#4f46e5)',color:'white',padding:'10px 20px',borderRadius:24,fontSize:13,fontWeight:700,boxShadow:'0 8px 32px rgba(124,58,237,.5)',animation:'chacha-appear .3s ease',display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:16}}>✨</span> ChaCha activée
        </div>
      )}

      {/* Panel chat */}
      {open&&(
        <div style={{position:'fixed',bottom:88,right:24,width:360,height:560,zIndex:10000,display:'flex',flexDirection:'column',borderRadius:20,overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.06)',animation:'chacha-appear .25s ease',background:'#0d0f17'}}>

          {/* Header */}
          <div style={{padding:'14px 16px',background:'linear-gradient(135deg,#13111e,#1a1535)',display:'flex',alignItems:'center',gap:10,flexShrink:0,borderBottom:'1px solid rgba(255,255,255,.06)'}}>
            <div style={{position:'relative',flexShrink:0}}>
              <div style={{width:40,height:40,borderRadius:13,background:'linear-gradient(135deg,#7c3aed,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',animation:speaking?'chacha-glow 1s infinite':'none'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2"/>
                  <path d="M8 12s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </div>
              <div style={{position:'absolute',bottom:-1,right:-1,width:11,height:11,borderRadius:6,background:'#10b981',border:'2px solid #0d0f17'}}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:800,color:'white',letterSpacing:-.2}}>ChaCha</div>
              <div style={{fontSize:10,fontWeight:500,color:speaking?'#a78bfa':loading?'#60a5fa':'#10b981',display:'flex',alignItems:'center',gap:4}}>
                {speaking?(<><span style={{display:'flex',gap:2}}>{[0,1,2].map(i=><span key={i} style={{width:3,height:3+(i*2),background:'#a78bfa',borderRadius:2,display:'inline-block',animation:`chacha-typing .8s ${i*.15}s ease infinite`}}/>)}</span> En train de parler</>):loading?'Réflexion en cours...':'Assistante IA · En ligne'}
              </div>
            </div>
            <div style={{display:'flex',gap:4}}>
              <button onClick={()=>setVoiceOn(p=>!p)} title={voiceOn?'Désactiver la voix':'Activer la voix'} style={{width:30,height:30,borderRadius:9,background:voiceOn?'rgba(139,92,246,.3)':'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.08)',color:voiceOn?'#a78bfa':'rgba(255,255,255,.3)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700}}>{voiceOn?'VON':'VOFF'}</button>
              <button onClick={()=>synthRef.current?.cancel()} title="Couper le son"
                style={{width:30,height:30,borderRadius:9,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.08)',color:'rgba(255,255,255,.5)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
              </button>
              <button onClick={()=>{ setMsgs([]); saveHistory([]); }} title="Effacer l'historique"
                style={{width:30,height:30,borderRadius:9,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.08)',color:'rgba(255,255,255,.5)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
              </button>
              <button onClick={()=>setOpen(false)}
                style={{width:30,height:30,borderRadius:9,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.08)',color:'rgba(255,255,255,.5)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,lineHeight:1}}>
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{flex:1,overflowY:'auto',padding:'16px 14px',display:'flex',flexDirection:'column',gap:10}}>
            {msgs.length===0&&(
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:12,opacity:.5}}>
                <div style={{width:56,height:56,borderRadius:18,background:'linear-gradient(135deg,#7c3aed,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2"/>
                    <path d="M8 12s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
                  </svg>
                </div>
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:14,fontWeight:700,color:'rgba(255,255,255,.7)'}}>Bonjour, je suis ChaCha</div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,.35)',marginTop:4}}>Comment puis-je vous aider ?</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,.2)',marginTop:8}}>Dites "ChaCha" ou cliquez sur 🎤</div>
                </div>
              </div>
            )}

            {msgs.map((m,i)=>{
              const isMe=m.role==='user';
              const time=new Date(m.ts).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
              return(
                <div key={i} className="chacha-msg" style={{display:'flex',flexDirection:isMe?'row-reverse':'row',gap:8,alignItems:'flex-end'}}>
                  {!isMe&&(
                    <div style={{width:28,height:28,borderRadius:9,background:'linear-gradient(135deg,#7c3aed,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2"/>
                        <path d="M8 12s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
                      </svg>
                    </div>
                  )}
                  <div style={{maxWidth:'78%'}}>
                    <div style={{
                      padding:'10px 13px',
                      borderRadius:isMe?'14px 14px 3px 14px':'14px 14px 14px 3px',
                      background:isMe?'linear-gradient(135deg,#7c3aed,#4f46e5)':'rgba(255,255,255,.06)',
                      color:'rgba(255,255,255,.92)',fontSize:13,lineHeight:1.55,
                      border:isMe?'none':'1px solid rgba(255,255,255,.07)',
                      backdropFilter:'blur(10px)',
                    }}>
                      {isMe?m.content:<div dangerouslySetInnerHTML={{__html:renderMd(m.content)}}/>}
                    </div>
                    <div style={{fontSize:9,color:'rgba(255,255,255,.2)',marginTop:2,textAlign:isMe?'right':'left',padding:'0 4px'}}>{time}</div>
                  </div>
                </div>
              );
            })}

            {loading&&(
              <div className="chacha-msg" style={{display:'flex',gap:8,alignItems:'flex-end'}}>
                <div style={{width:28,height:28,borderRadius:9,background:'linear-gradient(135deg,#7c3aed,#4f46e5)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2"/>
                    <path d="M8 12s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
                  </svg>
                </div>
                <div style={{padding:'12px 14px',borderRadius:'14px 14px 14px 3px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.07)',display:'flex',gap:5,alignItems:'center'}}>
                  {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:3,background:'#8b5cf6',animation:`chacha-typing .8s ${i*.2}s ease infinite`}}/>)}
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* Input */}
          <div style={{padding:'12px',borderTop:'1px solid rgba(255,255,255,.06)',background:'rgba(255,255,255,.02)',flexShrink:0}}>
            <div className="chacha-input" style={{display:'flex',alignItems:'flex-end',gap:8,background:'rgba(255,255,255,.06)',borderRadius:14,padding:'8px 10px 8px 14px',border:'1px solid rgba(255,255,255,.08)',transition:'all .15s'}}>
              <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey}
                placeholder="Posez votre question..." rows={1}
                style={{flex:1,background:'transparent',border:'none',outline:'none',color:'rgba(255,255,255,.9)',fontSize:13,fontFamily:'inherit',resize:'none',lineHeight:1.5,maxHeight:90,overflowY:'auto',paddingTop:2}}/>
              <div style={{display:'flex',gap:5,flexShrink:0}}>
                <button onClick={listening?()=>recRef.current?.stop():startListening} title="Parler"
                  style={{width:34,height:34,borderRadius:11,border:'none',background:listening?'rgba(239,68,68,.25)':'rgba(255,255,255,.08)',color:listening?'#ef4444':'rgba(255,255,255,.5)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all .15s',animation:listening?'chacha-pulse .8s infinite':'none'}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                </button>
                <button onClick={()=>send()} disabled={!input.trim()||loading}
                  style={{width:34,height:34,borderRadius:11,border:'none',background:input.trim()&&!loading?'linear-gradient(135deg,#7c3aed,#4f46e5)':'rgba(255,255,255,.08)',color:input.trim()&&!loading?'white':'rgba(255,255,255,.25)',cursor:input.trim()&&!loading?'pointer':'default',display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s',boxShadow:input.trim()&&!loading?'0 4px 14px rgba(124,58,237,.4)':'none'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bouton flottant */}
      <button onClick={()=>setOpen(p=>!p)}
        style={{position:'fixed',bottom:24,right:24,zIndex:10000,width:52,height:52,borderRadius:16,background:open?'rgba(255,255,255,.1)':'linear-gradient(135deg,#7c3aed,#4f46e5)',border:open?'1px solid rgba(255,255,255,.15)':'none',color:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:open?'none':'0 8px 28px rgba(124,58,237,.5)',transition:'all .2s',animation:!open&&msgs.length===0?'chacha-bounce 3s ease 2s 3':'none',backdropFilter:open?'blur(10px)':'none'}}>
        {open?(
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ):(
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2"/>
            <path d="M8 12s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        )}
        {!open&&msgs.filter(m=>m.role==='assistant').length>0&&(
          <div style={{position:'absolute',top:-3,right:-3,width:14,height:14,borderRadius:7,background:'#ef4444',border:'2px solid #0f172a',fontSize:8,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',color:'white'}}>
            {Math.min(msgs.filter(m=>m.role==='assistant').length,9)}
          </div>
        )}
      </button>
    </>
  );
}
