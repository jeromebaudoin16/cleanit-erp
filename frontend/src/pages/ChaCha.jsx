import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../utils/api';

const BASE_API = import.meta.env.VITE_API_URL || 'https://backend-cleanit-erp.vercel.app';

const TODAY_STR = new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

const SYSTEM = `Tu es ChaCha, l'assistante IA de CleanIT ERP — entreprise télécom au Cameroun partenaire Huawei.

DATE AUJOURD'HUI: ${TODAY_STR}
ENTREPRISE: CleanIT SARL · Douala, Cameroun · Sous-traitant Huawei · Infrastructure télécom
Clients: MTN Cameroun, Orange Cameroun, CAMTEL, Gouvernement Cameroun

RÈGLE ABSOLUE — DONNÉES EN TEMPS RÉEL:
TOUJOURS utiliser l'outil lire_donnees_systeme pour répondre aux questions sur:
- Le programme / planning / réunions / événements du jour ou de la semaine → module="planning"
- Les techniciens, leur disponibilité, leur programme → module="techniciens" puis module="planning"
- Les missions en cours ou à venir → module="missions"
- Les demandes d'approbation → module="approvals"
- Les employés, l'équipe → module="rh"
- Les bons de commande → module="bons_commande"
NE JAMAIS répondre de mémoire sur ces sujets. TOUJOURS appeler l'outil d'abord.

ACTIONS MULTI-ÉTAPES — IMPORTANT:
Tu peux et DOIS enchaîner plusieurs actions dans une seule demande de l'utilisateur. Exemple : si on te demande
"crée une réunion ET préviens telle personne", tu dois D'ABORD appeler creer_evenement_planning, PUIS, dans le
même échange, appeler envoyer_message_interne pour la personne concernée. Ne t'arrête jamais après la première
action si l'utilisateur en a demandé plusieurs — continue jusqu'à avoir TOUT fait. Si tu dois contacter une
personne par son nom, utilise d'abord lire_donnees_systeme(techniciens) pour trouver son ID réel.

CE QUE TU PEUX RÉELLEMENT FAIRE (actions vraies, persistées en base de données):
- Créer un événement Planning réel (creer_evenement_planning) — visible immédiatement par les participants
- Envoyer un message interne via CleanIT Comm (envoyer_message_interne) — PAS un email externe, PAS WhatsApp
- Créer une demande Approvals (creer_approbation)
- Générer un export Excel/Word (generer_rapport)

CE QUE TU NE PEUX PAS FAIRE — sois honnête si on te le demande, ne fais jamais semblant:
- Envoyer un vrai email externe (Gmail, Outlook...) — dis-le clairement et propose plutôt un message interne CleanIT Comm
- Envoyer un message WhatsApp — pas encore connecté au système
- Modifier le planning de quelqu'un d'autre dans un sens différent du tien : un événement Planning avec visibilite="equipe"
  ou "entreprise" et les bons participantsIds suffit à le rendre visible pour cette personne — explique cela à l'utilisateur
  plutôt que de prétendre avoir fait autre chose.

BONS DE COMMANDE — quand l'utilisateur importe un fichier BC (Excel ou PDF):
- Utilise analyser_bon_commande pour structurer les données extraites
- Types de BC possibles: Type A (planning projet: Site ID, Team Leader, Budget, Payment 1/2/3, dates Outbound/MOS/Install/QC — PAS de qté×prix), Type B (classique: Désignation, Qté, Prix unitaire, TVA, Total)
- Si une donnée est ambiguë ou manquante (budget vide, colonne inconnue, site non reconnu), POSE LA QUESTION à l'utilisateur avant de continuer — ne devine jamais silencieusement
- Une fois validé, propose de créer les jalons Planning et les demandes Approvals

COMMANDES SYSTÈME (utilise sans afficher):
- Navigation: ##NAVIGATE:/url##
- Excel: ##EXCEL:factures## ##EXCEL:paie## ##EXCEL:jobs##
- Word: ##WORD:contrat## ##WORD:rapport##
- Musique: ##MUSIC:titre##

RÈGLES:
- Réponds toujours en français, sois concise et professionnelle
- N'explique jamais ce que tu peux faire, fais-le directement
- Ne montre JAMAIS les commandes ## dans ta réponse
- Tu t'appelles ChaCha
- Sois proactive et anticipe les besoins
- Quand tu as terminé toutes les actions demandées, résume clairement ce qui a été fait et ce qui n'a pas pu être fait (et pourquoi)`;

const STORAGE_KEY = 'chacha_history';

const loadHistory = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'); } catch { return []; }
};
const saveHistory = (msgs) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-50))); } catch {}
};


// ===== CHACHA TOOLS =====
const CHACHA_TOOLS = [
  {type:"function",function:{name:"naviguer_module",description:"Naviguer vers un module CleanIT ERP",parameters:{type:"object",properties:{url:{type:"string",description:"URL: /dashboard /approvals /finance /rh /crm /terrain /map /bi /cleanitcomm /pointage /planning /techniciens /purchase-orders /cleanitbooks /bons-commande"}},required:["url"]}}},
  {type:"function",function:{name:"lire_donnees_systeme",description:"Lire les données réelles du système CleanIT ERP. UTILISE cet outil pour répondre aux questions sur le planning, les techniciens, les missions, les approbations, les employés.",parameters:{type:"object",properties:{module:{type:"string",enum:["planning","missions","techniciens","approvals","projets","bons_commande","rh"],description:"planning=événements et réunions, missions=missions terrain, techniciens=liste équipe, approvals=demandes en attente, projets=projets, bons_commande=BCs, rh=employés"}},required:["module"]}}},
  {type:"function",function:{name:"creer_approbation",description:"Créer une demande dans Approvals",parameters:{type:"object",properties:{titre:{type:"string"},montant:{type:"number"},beneficiaire:{type:"string"},site:{type:"string"},type:{type:"string",enum:["payment_request","leave_request","purchase_request"]}},required:["titre"]}}},
  {type:"function",function:{name:"creer_evenement_planning",description:"Créer un événement réel dans le module Planning, visible immédiatement par les participants assignés. Utilise lire_donnees_systeme(techniciens) d'abord pour obtenir les vrais IDs des participants.",parameters:{type:"object",properties:{
    titre:{type:"string"},
    type:{type:"string",enum:["reunion_interne","reunion_externe","mission","formation","conge","jalon","echeance"]},
    departement:{type:"string",enum:["terrain","commercial","rh","finance","direction","it","personnel"]},
    visibilite:{type:"string",enum:["personnel","equipe","entreprise"]},
    dateDebut:{type:"string",description:"Format YYYY-MM-DD"},
    dateFin:{type:"string",description:"Format YYYY-MM-DD, optionnel si même jour que dateDebut"},
    heureDebut:{type:"number",description:"Heure de début (7 à 18), ignoré si journeeComplete=true"},
    heureFin:{type:"number"},
    journeeComplete:{type:"boolean"},
    description:{type:"string"},
    participantsIds:{type:"array",items:{type:"string"},description:"IDs des utilisateurs participants, obtenus via lire_donnees_systeme(techniciens)"}
  },required:["titre","dateDebut"]}}},
  {type:"function",function:{name:"envoyer_message_interne",description:"Envoyer un message direct à un employé via CleanIT Comm (messagerie interne du système, pas WhatsApp ni email externe)",parameters:{type:"object",properties:{
    destinataireId:{type:"string",description:"ID de l'utilisateur destinataire, obtenu via lire_donnees_systeme(techniciens)"},
    texte:{type:"string"}
  },required:["destinataireId","texte"]}}},
  {type:"function",function:{name:"chercher_technicien",description:"Trouver un technicien disponible",parameters:{type:"object",properties:{competence:{type:"string"},region:{type:"string"}}}}},
  {type:"function",function:{name:"generer_rapport",description:"Générer Excel ou Word",parameters:{type:"object",properties:{type:{type:"string",enum:["factures","paie","jobs","contrat","rapport"]}},required:["type"]}}},
  {type:"function",function:{name:"analyser_bon_commande",description:"Structurer les données extraites d'un Bon de Commande importé (Excel ou PDF) après que l'utilisateur a uploadé un fichier",parameters:{type:"object",properties:{
    formatType:{type:"string",enum:["A","B","C"],description:"A=planning projet (budget/dates), B=classique (qté×prix), C=mixte"},
    sites:{type:"array",description:"Liste des sites extraits pour Type A",items:{type:"object",properties:{
      siteId:{type:"string"},siteName:{type:"string"},teamLeader:{type:"string"},
      budgetTotal:{type:"number"},outboundDate:{type:"string"},installStartDate:{type:"string"},
      installClosedDate:{type:"string"},remark:{type:"string"}
    }}},
    needsReview:{type:"boolean",description:"true si des données sont ambiguës et nécessitent une question à l'utilisateur"},
    reviewQuestion:{type:"string",description:"Question précise à poser si needsReview est true"}
  },required:["formatType"]}}},
];

// ===== CARTE DE CONFIRMATION BC — affichée dans le chat après extraction =====
const BcConfirmCard = ({ bc, onImported }) => {
  const [importing, setImporting] = useState(false);
  const [paymentMode, setPaymentMode] = useState('grouped'); // grouped | per-payment (Type A uniquement)
  const [error, setError] = useState(null);
  const BASE_API = 'https://backend-cleanit-erp.vercel.app';

  if(bc.imported) {
    return (
      <div style={{padding:'12px 16px',borderRadius:14,background:'rgba(34,197,94,.1)',border:'1px solid rgba(34,197,94,.3)',
        display:'flex',alignItems:'center',gap:10,maxWidth:'85%'}}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        <span style={{fontSize:13,color:'#86efac',fontWeight:600}}>
          {bc.sites.length} site(s) importé(s) avec succès dans Bons de Commande
        </span>
      </div>
    );
  }

  const importBC = async () => {
    setImporting(true); setError(null);
    const tk = localStorage.getItem('token');
    const h = {'Content-Type':'application/json','Authorization':'Bearer '+tk};
    try {
      // 1. Créer le BC parent
      const totalAmount = bc.sites.reduce((s,site)=>s+(Number(site.budgetTotal)||0),0);
      const bcRes = await fetch(BASE_API+'/bons-commande', {
        method:'POST', headers:h,
        body: JSON.stringify({
          numero: 'BC-'+Date.now().toString().slice(-6),
          client: bc.sites[0]?.client || 'Client',
          montantTotal: totalAmount,
          status: 'en_cours',
          notes: `Importé via ChaCha — Format ${bc.formatType}`,
        })
      }).then(r=>r.json());
      if(!bcRes?.id) throw new Error(bcRes?.message||'Erreur création du BC');

      // 2. Insérer les sites (Type A) ou les lignes (Type B)
      if(bc.formatType === 'B') {
        await fetch(BASE_API+'/bc-lines/bulk', {
          method:'POST', headers:h,
          body: JSON.stringify({ bcId: bcRes.id, lines: bc.sites.map(s=>({
            designation: s.siteName||s.designation||'Article',
            quantite: s.quantite||1, prixUnitaire: s.budgetTotal||s.prixUnitaire||0,
            totalHt: s.budgetTotal||0,
          })) })
        });
      } else {
        await fetch(BASE_API+'/bc-sites/bulk', {
          method:'POST', headers:h,
          body: JSON.stringify({ bcId: bcRes.id, sites: bc.sites })
        });
      }
      setImporting(false);
      onImported();
    } catch(e) {
      setImporting(false);
      setError(e.message);
    }
  };

  return (
    <div style={{maxWidth:'90%',borderRadius:14,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',overflow:'hidden'}}>
      <div style={{padding:'10px 14px',background:'rgba(139,92,246,.15)',borderBottom:'1px solid rgba(255,255,255,.08)',
        display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontSize:12,fontWeight:700,color:'#c4b5fd'}}>
          Bon de commande détecté — Type {bc.formatType}
        </span>
        <span style={{fontSize:11,color:'rgba(255,255,255,.5)'}}>{bc.sites.length} ligne(s)</span>
      </div>

      <div style={{maxHeight:200,overflowY:'auto',padding:'8px 14px'}}>
        {bc.sites.slice(0,8).map((s,i)=>(
          <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',
            borderBottom:'1px solid rgba(255,255,255,.05)',fontSize:12}}>
            <span style={{color:'rgba(255,255,255,.85)'}}>{s.siteId||s.designation||('Ligne '+(i+1))}</span>
            <span style={{color:'rgba(255,255,255,.6)',fontWeight:600}}>
              {Number(s.budgetTotal||0).toLocaleString('fr-FR')} F
            </span>
          </div>
        ))}
        {bc.sites.length>8 && <div style={{fontSize:11,color:'rgba(255,255,255,.4)',padding:'5px 0'}}>+{bc.sites.length-8} autre(s)...</div>}
      </div>

      {bc.needsReview && (
        <div style={{padding:'8px 14px',background:'rgba(251,191,36,.1)',borderTop:'1px solid rgba(251,191,36,.2)'}}>
          <span style={{fontSize:11,color:'#fbbf24'}}>⚠ {bc.reviewQuestion||'Certaines données nécessitent une vérification manuelle'}</span>
        </div>
      )}

      {bc.formatType==='A' && (
        <div style={{padding:'8px 14px',display:'flex',gap:6,alignItems:'center',borderTop:'1px solid rgba(255,255,255,.05)'}}>
          <span style={{fontSize:11,color:'rgba(255,255,255,.5)'}}>Paiements :</span>
          <button onClick={()=>setPaymentMode('grouped')} style={{fontSize:10,padding:'3px 8px',borderRadius:6,border:'none',cursor:'pointer',
            background:paymentMode==='grouped'?'rgba(139,92,246,.4)':'rgba(255,255,255,.08)',color:'#fff'}}>Groupé</button>
          <button onClick={()=>setPaymentMode('per-payment')} style={{fontSize:10,padding:'3px 8px',borderRadius:6,border:'none',cursor:'pointer',
            background:paymentMode==='per-payment'?'rgba(139,92,246,.4)':'rgba(255,255,255,.08)',color:'#fff'}}>Par paiement (P1/P2/P3)</button>
        </div>
      )}

      {error && <div style={{padding:'8px 14px',fontSize:11,color:'#f87171'}}>Erreur : {error}</div>}

      <div style={{padding:'10px 14px',borderTop:'1px solid rgba(255,255,255,.08)'}}>
        <button onClick={importBC} disabled={importing} style={{width:'100%',padding:'8px',borderRadius:8,border:'none',
          background:importing?'rgba(139,92,246,.3)':'linear-gradient(135deg,#7c3aed,#4f46e5)',color:'#fff',
          fontSize:12,fontWeight:700,cursor:importing?'default':'pointer'}}>
          {importing?'Importation en cours...':'Confirmer et importer'}
        </button>
      </div>
    </div>
  );
};

export default function ChaCha() {
  const navigate   = useNavigate();
  const user = getUser();
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
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const synthRef  = useRef(window.speechSynthesis);
  const wakeRef   = useRef(null);
  const recRef    = useRef(null);

  // Persister historique
  useEffect(()=>saveHistory(msgs),[msgs]);
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}); },[msgs,open]);

  // Wake word DÉSACTIVÉ — un micro continu en arrière-plan sur toute l'app
  // causait des activations Chrome intempestives et des comportements erratiques.
  // ChaCha s'ouvre désormais uniquement via clic manuel sur la bulle.
  // useEffect(()=>{ startWake(); return()=>wakeRef.current?.abort?.(); },[]);

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

  // ===== LIRE DONNÉES SYSTÈME DEPUIS API =====
  const lireSysteme = async (module) => {
    const token = localStorage.getItem('token');
    const h = {'Authorization':'Bearer '+token};
    try {
      switch(module) {
        case 'techniciens':
        case 'users': {
          const data = await fetch(BASE_API+'/users',{headers:h}).then(r=>r.json()).catch(()=>[]);
          const techs = Array.isArray(data)?data.filter(u=>['technician','project_manager','bureau','admin'].includes(u.role)):[];
          return JSON.stringify(techs.map(u=>({id:u.id,nom:`${u.firstName||''} ${u.lastName||''}`.trim(),role:u.role,email:u.email,statut:u.isActive?'actif':'inactif'})));
        }
        case 'missions': {
          const data = await fetch(BASE_API+'/missions',{headers:h}).then(r=>r.json()).catch(()=>[]);
          return JSON.stringify(Array.isArray(data)?data.slice(0,20):[]);
        }
        case 'planning': {
          const today = new Date().toISOString().split('T')[0];
          const end = new Date(Date.now()+30*86400000).toISOString().split('T')[0];
          const data = await fetch(`${BASE_API}/planning/events?start=${today}&end=${end}`,{headers:h}).then(r=>r.json()).catch(()=>[]);
          return JSON.stringify(Array.isArray(data)?data.slice(0,30).map(e=>({id:e.id,titre:e.title,date:e.start_date,heure:e.all_day?'journée':e.start_hour+'h-'+e.end_hour+'h',type:e.type})):[]);
        }
        case 'approvals': {
          const data = await fetch(BASE_API+'/approvals',{headers:h}).then(r=>r.json()).catch(()=>[]);
          return JSON.stringify(Array.isArray(data)?data.slice(0,20):[]);
        }
        case 'projets':
        case 'projects': {
          const data = await fetch(BASE_API+'/projects',{headers:h}).then(r=>r.json()).catch(()=>[]);
          return JSON.stringify(Array.isArray(data)?data.slice(0,20):[]);
        }
        case 'bons_commande': {
          const data = await fetch(BASE_API+'/bons-commande',{headers:h}).then(r=>r.json()).catch(()=>[]);
          return JSON.stringify(Array.isArray(data)?data.slice(0,10):[]);
        }
        case 'employes':
        case 'rh': {
          const data = await fetch(BASE_API+'/users',{headers:h}).then(r=>r.json()).catch(()=>[]);
          return JSON.stringify(Array.isArray(data)?data.map(u=>({id:u.id,nom:`${u.firstName||''} ${u.lastName||''}`.trim(),role:u.role,dept:u.department,statut:u.isActive?'actif':'inactif'})):[]);
        }
        default:
          return JSON.stringify({message:`Module "${module}" non reconnu. Modules disponibles: techniciens, missions, planning, approvals, projets, bons_commande, employes`});
      }
    } catch(e) {
      return JSON.stringify({erreur:`Impossible de charger ${module}: ${e.message}`});
    }
  };

  // ===== UPLOAD BON DE COMMANDE =====
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    setUploading(true);
    const userMsg = {role:'user', content:`📎 Fichier importé: ${file.name}`, ts:Date.now()};
    setMsgs(p=>[...p, userMsg]);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('file', file);
      const r = await fetch(BASE_API+'/bons-commande/analyze', {method:'POST', headers:{'Authorization':'Bearer '+token}, body:fd});
      const data = await r.json();
      if(!r.ok) throw new Error(data.message||'Erreur analyse fichier');

      let extractedText = '';
      if(data.type === 'excel') {
        extractedText = data.sheets.map(s => `Feuille "${s.name}":\n` + s.rows.map(row => row.filter(v=>v!==null).join(' | ')).join('\n')).join('\n\n');
      } else if(data.type === 'pdf') {
        if(data.warning) {
          setUploading(false);
          setMsgs(p=>[...p, {role:'assistant', content:`⚠ ${data.warning}\n\nVous pouvez essayer d'exporter ce document en Excel/CSV depuis votre logiciel, ou me décrire les informations principales (sites, montants, dates) directement dans le chat.`, ts:Date.now()}]);
          e.target.value = '';
          return;
        }
        extractedText = data.text || '';
      }

      // Envoyer le contenu extrait à ChaCha pour structuration
      const prompt = `J'ai importé un Bon de Commande (fichier: ${file.name}). Voici le contenu brut extrait:\n\n${extractedText.slice(0,6000)}\n\nAnalyse ce BC : détecte le format (Type A planning-projet avec budgets/dates, ou Type B classique avec qté×prix), extrais les données structurées, et utilise l'outil analyser_bon_commande. Si une donnée est ambiguë, pose-moi la question avant de continuer.`;
      setUploading(false);
      await send(prompt);
    } catch(err) {
      setUploading(false);
      setMsgs(p=>[...p, {role:'assistant', content:`Erreur lors de l'import: ${err.message}`, ts:Date.now()}]);
    }
    e.target.value = '';
  };

  // ===== FALLBACK GEMINI — convertit les outils format OpenAI/Groq vers le format Gemini =====
  const toGeminiTools = (tools) => [{
    functionDeclarations: tools.map(t => ({
      name: t.function.name,
      description: t.function.description,
      parameters: t.function.parameters,
    }))
  }];

  // Convertit l'historique de messages format OpenAI (role/content/tool_calls) vers le format Gemini (role/parts)
  const toGeminiContents = (sysPrompt, msgs) => {
    const contents = [];
    for (const m of msgs) {
      if (m.role === 'system') continue; // géré séparément via systemInstruction
      if (m.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: m.content }] });
      } else if (m.role === 'assistant') {
        if (m.tool_calls) {
          contents.push({ role: 'model', parts: m.tool_calls.map(tc => ({
            functionCall: { name: tc.function.name, args: JSON.parse(tc.function.arguments || '{}') }
          })) });
        } else {
          contents.push({ role: 'model', parts: [{ text: m.content || '' }] });
        }
      } else if (m.role === 'tool') {
        contents.push({ role: 'user', parts: [{ functionResponse: { name: m.name || 'resultat', response: { content: m.content } } }] });
      }
    }
    return contents;
  };

  // Appelle Gemini avec les mêmes outils (via le proxy backend — la clé reste côté serveur). Retourne un objet normalisé { content, tool_calls } comme Groq/OpenAI.
  const callGemini = async (sysPrompt, msgs, tools) => {
    const tk = localStorage.getItem('token');
    const body = {
      systemInstruction: { parts: [{ text: sysPrompt }] },
      contents: toGeminiContents(sysPrompt, msgs),
      tools: toGeminiTools(tools),
    };
    const ctrl = new AbortController();
    const timeoutId = setTimeout(()=>ctrl.abort(), 28000);
    const res = await fetch(BASE_API+'/chacha/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer '+tk },
      signal: ctrl.signal,
      body: JSON.stringify(body),
    });
    clearTimeout(timeoutId);
    if (!res.ok) { const errData = await res.json().catch(()=>({})); throw new Error(`Gemini ${res.status}: ${errData.error?.message||errData.message||'erreur inconnue'}`); }
    const data = await res.json();
    const cand = data.candidates?.[0];
    if (!cand) throw new Error('Gemini: réponse vide');
    const parts = cand.content?.parts || [];
    const funcCalls = parts.filter(p => p.functionCall);
    if (funcCalls.length > 0) {
      return {
        finish_reason: 'tool_calls',
        message: {
          tool_calls: funcCalls.map((p, i) => ({
            id: 'gemini_call_' + i,
            function: { name: p.functionCall.name, arguments: JSON.stringify(p.functionCall.args || {}) }
          }))
        }
      };
    }
    const textPart = parts.find(p => p.text);
    return { finish_reason: 'stop', message: { content: textPart?.text || '' } };
  };

  // Envoi
  const send = useCallback(async(txt)=>{
    const msg=(txt||input).trim();
    if(!msg||loading) return;
    setInput('');
    if(inputRef.current) inputRef.current.style.height='auto';
    setLoading(true);
    const userMsg={role:'user',content:msg,ts:Date.now()};
    setMsgs(p=>[...p,userMsg]);

    try {
      const history=msgs.slice(-12).map(m=>({role:m.role,content:m.content}));
      history.push({role:'user',content:msg});

      // ===== GROQ TOOL USE (avec fallback Gemini si Groq échoue) — via proxy backend, clé jamais exposée =====
      let choice, assistantMsg, usingGemini = false;
      const tk = localStorage.getItem('token');
      try {
        const ctrl = new AbortController();
        const timeoutId = setTimeout(()=>ctrl.abort(), 28000);
        const res = await fetch(BASE_API+'/chacha/groq', {
          method: 'POST',
          headers: {'Content-Type':'application/json', 'Authorization': `Bearer ${tk}`},
          signal: ctrl.signal,
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: [{role:'system', content:SYSTEM}, ...history],
            tools: CHACHA_TOOLS,
            tool_choice: 'auto',
            max_tokens: 800,
            temperature: 0.3
          })
        });
        clearTimeout(timeoutId);
        if(!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        if(!data.choices || !data.choices[0]) throw new Error('Réponse Groq invalide');
        choice = data.choices[0];
        assistantMsg = choice.message;
      } catch(groqErr) {
        console.warn('Groq indisponible, bascule sur Gemini:', groqErr.message);
        usingGemini = true;
        const gemResult = await callGemini(SYSTEM, history, CHACHA_TOOLS);
        choice = gemResult;
        assistantMsg = gemResult.message;
      }

      // ===== BOUCLE AGENTIQUE MULTI-ÉTAPES =====
      // Permet à ChaCha d'enchaîner plusieurs actions (créer réunion PUIS envoyer email PUIS poster message...)
      // au lieu de s'arrêter après le premier outil appelé.
      let messages = [{role:'system', content:SYSTEM}, ...history];
      let currentMsg = assistantMsg;
      let currentChoice = choice;
      let finalText = '';
      let iterations = 0;
      const MAX_ITERATIONS = 6;

      while(currentChoice.finish_reason === 'tool_calls' && currentMsg.tool_calls && iterations < MAX_ITERATIONS) {
        iterations++;
        const toolResults = [];
        for(const tc of currentMsg.tool_calls) {
          const args = JSON.parse(tc.function.arguments || '{}');
          let result = '';

          switch(tc.function.name) {
            case 'naviguer_module':
              setTimeout(() => navigate(args.url), 300);
              result = `Navigation vers ${args.url} effectuée`;
              break;
            case 'lire_donnees_systeme':
              result = await lireSysteme(args.module);
              break;
            case 'creer_approbation': {
              try {
                const tk = localStorage.getItem('token');
                const r = await fetch(BASE_API+'/approvals', {
                  method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk},
                  body: JSON.stringify({
                    label: args.titre, type: args.type||'payment_request',
                    amount: args.montant||0, beneficiaryName: args.beneficiaire||'',
                    siteCode: args.site||'', detail: args.justification||'',
                  })
                }).then(r=>r.json());
                result = r?.id
                  ? JSON.stringify({succes:true, id:r.id, message:'Demande créée dans Approvals'})
                  : JSON.stringify({succes:false, erreur:r?.message||'Erreur inconnue'});
              } catch(e) { result = JSON.stringify({succes:false, erreur:e.message}); }
              break;
            }
            case 'chercher_technicien':
              result = await lireSysteme('techniciens');
              break;
            case 'generer_rapport':
              await doActions(`##EXCEL:${args.type}## ##WORD:${args.type}##`);
              result = `Rapport ${args.type} généré`;
              break;
            case 'afficher_alerte':
              result = `Alerte affichée: ${args.message}`;
              break;
            case 'creer_evenement_planning': {
              try {
                const tk = localStorage.getItem('token');
                const r = await fetch(BASE_API+'/planning/events', {
                  method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk},
                  body: JSON.stringify({
                    title: args.titre, type: args.type||'reunion_interne', dept: args.departement||'terrain',
                    visibility: args.visibilite||'entreprise', startDate: args.dateDebut, endDate: args.dateFin||args.dateDebut,
                    startHour: args.heureDebut, endHour: args.heureFin, allDay: args.journeeComplete||false,
                    description: args.description||'', techIds: args.participantsIds||[],
                  })
                }).then(r=>r.json());
                result = r?.id
                  ? JSON.stringify({succes:true, id:r.id, message:'Événement créé dans Planning, visible pour tous les participants assignés'})
                  : JSON.stringify({succes:false, erreur:r?.message||'Erreur inconnue'});
              } catch(e) { result = JSON.stringify({succes:false, erreur:e.message}); }
              break;
            }
            case 'envoyer_message_interne': {
              try {
                const tk = localStorage.getItem('token');
                const r = await fetch(BASE_API+'/conversations', {
                  method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk},
                  body: JSON.stringify({ participantId: args.destinataireId })
                }).then(r=>r.json());
                if(r?.id) {
                  await fetch(BASE_API+'/messages', {
                    method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+tk},
                    body: JSON.stringify({ conversationId: r.id, text: args.texte })
                  });
                  result = JSON.stringify({succes:true, message:'Message envoyé'});
                } else result = JSON.stringify({succes:false, erreur:'Conversation introuvable'});
              } catch(e) { result = JSON.stringify({succes:false, erreur:e.message}); }
              break;
            }
            case 'analyser_bon_commande': {
              const sitesCount = (args.sites||[]).length;
              result = JSON.stringify({recu:true, formatType:args.formatType, sitesCount, needsReview:args.needsReview||false});
              setMsgs(p=>[...p, {
                role:'bcConfirm', ts:Date.now(),
                bc: { formatType: args.formatType, sites: args.sites||[], needsReview: args.needsReview||false, reviewQuestion: args.reviewQuestion||'' }
              }]);
              break;
            }
            default:
              result = 'Action exécutée';
          }
          toolResults.push({role: 'tool', tool_call_id: tc.id, content: result});
        }

        messages = [...messages, currentMsg, ...toolResults];

        if(usingGemini) {
          try {
            const gemResult = await callGemini(SYSTEM, messages.filter(m=>m.role!=='system'), CHACHA_TOOLS);
            currentChoice = gemResult;
            currentMsg = gemResult.message;
            finalText = currentMsg.content || '';
          } catch(gemErr) {
            finalText = 'Une partie des actions a été effectuée, mais une erreur est survenue en cours de route (' + gemErr.message + '). Vérifiez le résultat dans les modules concernés.';
            break;
          }
        } else {
          let resNext, dataNext;
          try {
            const ctrl2 = new AbortController();
            const timeoutId2 = setTimeout(()=>ctrl2.abort(), 28000);
            resNext = await fetch(BASE_API+'/chacha/groq', {
              method: 'POST',
              headers: {'Content-Type':'application/json', 'Authorization': `Bearer ${tk}`},
              signal: ctrl2.signal,
              body: JSON.stringify({
                model: 'openai/gpt-oss-120b',
                messages,
                tools: CHACHA_TOOLS,
                tool_choice: 'auto',
                max_tokens: 800,
                temperature: 0.3
              })
            });
            clearTimeout(timeoutId2);
            dataNext = await resNext.json();
            if(!resNext.ok || !dataNext.choices || !dataNext.choices[0]) throw new Error('Groq invalide en cours de boucle');
            currentChoice = dataNext.choices[0];
            currentMsg = currentChoice.message;
            finalText = currentMsg.content || '';
          } catch(groqLoopErr) {
            console.warn('Groq indisponible en boucle, bascule sur Gemini:', groqLoopErr.message);
            usingGemini = true;
            try {
              const gemResult = await callGemini(SYSTEM, messages.filter(m=>m.role!=='system'), CHACHA_TOOLS);
              currentChoice = gemResult;
              currentMsg = gemResult.message;
              finalText = currentMsg.content || '';
            } catch(gemErr) {
              finalText = 'Une partie des actions a été effectuée, mais une erreur est survenue en cours de route (' + gemErr.message + '). Vérifiez le résultat dans les modules concernés.';
              break;
            }
          }
        }
      }

      if(iterations >= MAX_ITERATIONS && currentChoice.finish_reason === 'tool_calls') {
        finalText = (finalText||'') + '\n\n(Certaines étapes supplémentaires nécessitent une vérification manuelle — limite de sécurité atteinte.)';
      }
      if(!finalText) finalText = 'Action effectuée.';
      setMsgs(p=>[...p, {role:'assistant', content:finalText, ts:Date.now()}]);
      speak(finalText);

      if(choice.finish_reason !== 'tool_calls') {
        // Réponse texte directe sans aucun outil — gérer les commandes ## (export Excel/Word etc.)
        const raw = assistantMsg.content || '';
        await doActions(raw);
      }
    } catch(e){
      console.error('ChaCha error:', e);
      const err={role:'assistant',content:`Erreur: ${e.name==='AbortError'?'délai dépassé, réessaie':(e.message||e)}`,ts:Date.now()};
      setMsgs(p=>[...p,err]);
    } finally {
      setLoading(false);
    }
  },[input,loading,msgs,doActions,speak]);

  // Micro manuel
  const startListening=()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR) return;
    wakeRef.current?.stop();
    const r=new SR();
    r.lang='fr-FR'; r.continuous=false; r.interimResults=false;
    r.onstart=()=>setListening(true);
    r.onend=()=>{ setListening(false); };
    r.onerror=()=>{ setListening(false); };
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

  // Panel position and drag state (must be declared before any conditional return)
  const [panelPos, setPanelPos] = useState(()=>{
    try{const p=JSON.parse(localStorage.getItem('chacha_panel_pos'));return p||{right:24,bottom:88};}catch{return {right:24,bottom:88};}
  });
  const [panelSize, setPanelSize] = useState(()=>{
    try{const s=JSON.parse(localStorage.getItem('chacha_panel_size'));return s||{width:360,height:560};}catch{return {width:360,height:560};}
  });
  const PANEL_MIN = {width:300,height:380};
  const PANEL_MAX = {width:680,height:860};
  const panelResizing = useRef(false);
  const panelResizeStart = useRef({x:0,y:0,width:360,height:560});
  const onResizeMouseDown = (e) => {
    panelResizing.current = true;
    panelResizeStart.current = {x:e.clientX, y:e.clientY, width:panelSize.width, height:panelSize.height};
    e.preventDefault(); e.stopPropagation();
  };
  const onResizeTouchStart = (e) => {
    panelResizing.current = true;
    panelResizeStart.current = {x:e.touches[0].clientX, y:e.touches[0].clientY, width:panelSize.width, height:panelSize.height};
    e.stopPropagation();
  };
  const panelDragging = useRef(false);
  const panelDragOffset = useRef({x:0,y:0});
  const onPanelMouseDown = (e) => {
    if(e.target.tagName==='BUTTON'||e.target.tagName==='TEXTAREA'||e.target.tagName==='INPUT') return;
    panelDragging.current = true;
    panelDragOffset.current = {x:e.clientX, y:e.clientY};
    e.preventDefault();
  };
  const onPanelTouchStart = (e) => {
    if(e.target.tagName==='BUTTON'||e.target.tagName==='TEXTAREA') return;
    panelDragging.current = true;
    panelDragOffset.current = {x:e.touches[0].clientX, y:e.touches[0].clientY};
  };

  // Cacher ChaCha sur mobile app
  const isMobilePage = window.location.pathname.startsWith('/mobile');

  const [pos, setPos] = useState(()=>{
    try{const p=JSON.parse(localStorage.getItem('chacha_pos'));return p||{right:24,bottom:24};}catch{return {right:24,bottom:24};}
  });
  const dragging = useRef(false);
  const dragOffset = useRef({x:0,y:0});

  const onMouseDown = (e) => {
    dragging.current = true;
    dragOffset.current = {x: e.clientX, y: e.clientY};
    e.preventDefault();
  };
  const onTouchStart = (e) => {
    dragging.current = true;
    dragOffset.current = {x: e.touches[0].clientX, y: e.touches[0].clientY};
  };
  useEffect(()=>{
    const move = (cx,cy) => {
      if(!dragging.current) return;
      const dx = cx - dragOffset.current.x;
      const dy = cy - dragOffset.current.y;
      dragOffset.current = {x:cx, y:cy};
      setPos(p => {
        const nr = Math.max(8, Math.min(window.innerWidth-60, (p.right||24) - dx));
        const nb = Math.max(8, Math.min(window.innerHeight-60, (p.bottom||24) - dy));
        const np = {right:nr, bottom:nb};
        localStorage.setItem('chacha_pos', JSON.stringify(np));
        return np;
      });
    };
    const movePanel = (cx,cy) => {
      if(!panelDragging.current) return;
      const dx = cx - panelDragOffset.current.x;
      const dy = cy - panelDragOffset.current.y;
      panelDragOffset.current = {x:cx, y:cy};
      setPanelPos(p => {
        const nr = Math.max(8, Math.min(window.innerWidth-panelSize.width-20, (p.right||24) - dx));
        const nb = Math.max(8, Math.min(window.innerHeight-panelSize.height-20, (p.bottom||88) - dy));
        const np = {right:nr, bottom:nb};
        localStorage.setItem('chacha_panel_pos', JSON.stringify(np));
        return np;
      });
    };
    const resizePanel = (cx,cy) => {
      if(!panelResizing.current) return;
      const dx = cx - panelResizeStart.current.x;
      const dy = cy - panelResizeStart.current.y;
      const nw = Math.max(PANEL_MIN.width, Math.min(PANEL_MAX.width, panelResizeStart.current.width - dx));
      const nh = Math.max(PANEL_MIN.height, Math.min(PANEL_MAX.height, panelResizeStart.current.height - dy));
      const ns = {width:nw, height:nh};
      setPanelSize(ns);
      localStorage.setItem('chacha_panel_size', JSON.stringify(ns));
    };
    const onMM = (e) => { move(e.clientX, e.clientY); movePanel(e.clientX, e.clientY); resizePanel(e.clientX, e.clientY); };
    const onTM = (e) => {
      move(e.touches[0].clientX, e.touches[0].clientY);
      movePanel(e.touches[0].clientX, e.touches[0].clientY);
      resizePanel(e.touches[0].clientX, e.touches[0].clientY);
    };
    const stop = () => { dragging.current = false; panelDragging.current = false; panelResizing.current = false; };
    window.addEventListener('mousemove', onMM);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchmove', onTM, {passive:true});
    window.addEventListener('touchend', stop);
    return()=>{
      window.removeEventListener('mousemove', onMM);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchmove', onTM);
      window.removeEventListener('touchend', stop);
    };
  },[]);

  if(isMobilePage) return null;

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
        <div onMouseDown={onPanelMouseDown} onTouchStart={onPanelTouchStart} style={{position:'fixed',bottom:panelPos.bottom,right:panelPos.right,width:panelSize.width,height:panelSize.height,zIndex:10000,cursor:'default',display:'flex',flexDirection:'column',borderRadius:20,overflow:'hidden',boxShadow:'0 32px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.06)',animation:'chacha-appear .25s ease',background:'#0d0f17'}}>
          <div onMouseDown={onResizeMouseDown} onTouchStart={onResizeTouchStart} title="Redimensionner"
            style={{position:'absolute',top:0,left:0,width:18,height:18,cursor:'nwse-resize',zIndex:10002,display:'flex',alignItems:'flex-start',justifyContent:'flex-start',padding:3}}>
            <svg width="11" height="11" viewBox="0 0 11 11" style={{opacity:.45}}>
              <path d="M1 10 L10 1 M4.5 10 L10 4.5 M8 10 L10 8" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </div>

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
              <button onClick={()=>{
                  const presets=[{width:360,height:560},{width:480,height:680},{width:620,height:800}];
                  const curIdx=presets.findIndex(p=>Math.abs(p.width-panelSize.width)<20);
                  const next=presets[(curIdx+1)%presets.length]||presets[0];
                  setPanelSize(next); localStorage.setItem('chacha_panel_size', JSON.stringify(next));
                }} title="Agrandir / réduire la fenêtre"
                style={{width:30,height:30,borderRadius:9,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.08)',color:'rgba(255,255,255,.5)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              </button>
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
                  <div style={{fontSize:14,fontWeight:700,color:'rgba(255,255,255,.7)'}}>{`Bonjour${user?.firstName ? ' '+user.firstName : ''}, je suis ChaCha`}</div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,.35)',marginTop:4}}>Comment puis-je vous aider ?</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,.2)',marginTop:8}}>Dites "ChaCha" ou cliquez sur 🎤</div>
                </div>
              </div>
            )}

            {msgs.map((m,i)=>{
              if(m.role==='bcConfirm') return <BcConfirmCard key={i} bc={m.bc} onImported={()=>setMsgs(p=>p.map((mm,ii)=>ii===i?{...mm,bc:{...mm.bc,imported:true}}:mm))}/>;
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
              <textarea ref={inputRef} value={input}
                onChange={e=>{
                  setInput(e.target.value);
                  e.target.style.height='auto';
                  e.target.style.height=Math.min(e.target.scrollHeight,90)+'px';
                }}
                onKeyDown={handleKey}
                placeholder="Posez votre question..." rows={1}
                style={{flex:1,background:'transparent',border:'none',outline:'none',color:'rgba(255,255,255,.9)',fontSize:13,fontFamily:'inherit',resize:'none',lineHeight:1.5,maxHeight:90,overflowY:'auto',paddingTop:2}}/>
              <div style={{display:'flex',gap:5,flexShrink:0}}>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.pdf" onChange={handleFileUpload} style={{display:'none'}}/>
                <button onClick={()=>fileInputRef.current?.click()} disabled={uploading} title="Importer un Bon de Commande (Excel/PDF)"
                  style={{width:34,height:34,borderRadius:11,border:'none',background:uploading?'rgba(139,92,246,.25)':'rgba(255,255,255,.08)',color:uploading?'#a78bfa':'rgba(255,255,255,.5)',cursor:uploading?'default':'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all .15s'}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                  </svg>
                </button>
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
        onMouseDown={onMouseDown} onTouchStart={onTouchStart} style={{position:'fixed',bottom:pos.bottom,right:pos.right,zIndex:10000,cursor:'grab',width:52,height:52,borderRadius:16,background:open?'rgba(255,255,255,.1)':'linear-gradient(135deg,#7c3aed,#4f46e5)',border:open?'1px solid rgba(255,255,255,.15)':'none',color:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:open?'none':'0 8px 28px rgba(124,58,237,.5)',transition:'all .2s',animation:!open&&msgs.length===0?'chacha-bounce 3s ease 2s 3':'none',backdropFilter:open?'blur(10px)':'none'}}>
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
