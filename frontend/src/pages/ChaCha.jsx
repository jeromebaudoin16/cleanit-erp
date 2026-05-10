import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// ═══════════════════════════════════════════════════════════════════
//  CHACHA — IA Intelligente CleanIT
//  Propulsée par Claude API (Anthropic)
//  Voix · Documents · Recherche · Musique · Vidéo · Actions système
// ═══════════════════════════════════════════════════════════════════

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

// Contexte système CleanIT pour ChaCha
const SYSTEM_PROMPT = `Tu es ChaCha, l'assistante IA intelligente du système CleanIT ERP de l'entreprise CleanIT Cameroun, spécialisée dans les télécommunications et partenaire Huawei.

IDENTITÉ:
- Ton nom est ChaCha
- Tu es intégrée dans CleanIT ERP, un système de gestion d'entreprise pour une société télécom au Cameroun
- Tu parles principalement français, tu peux aussi parler anglais
- Tu as accès aux données de l'entreprise en temps réel
- Tu es intelligente, proactive et tu anticipes les besoins

DONNÉES ENTREPRISE (contexte temps réel):
- Jobs actifs: Installation 5G NR DLA-001 (Contrat: 165M FCFA), Maintenance 4G LTE YDE-001, Infrastructure GAR-001, Fibre Optique BFN-001
- Clients principaux: MTN Cameroun, Orange Cameroun, CAMTEL, Gouvernement Cameroun
- Fournisseurs: Huawei Technologies, Nokia Networks, Ericsson
- Factures en retard: INV-2024-002 (Orange Cameroun: 10.2M FCFA), INV-2024-003 (Gouvernement: 22.4M FCFA)
- Employés: 7 internes + 5 techniciens terrain
- Chiffre d'affaires: 207M FCFA (Q1 2024)
- Trésorerie: 58.5M FCFA (BICEC + SGC + Caisse)

CE QUE TU PEUX FAIRE:
1. Répondre à toutes les questions sur l'entreprise et le système
2. Générer des documents Word, Excel, PDF sur demande
3. Effectuer des recherches web et résumer l'information
4. Naviguer dans le système (ouvrir des pages)
5. Créer des templates de documents
6. Analyser des données financières et opérationnelles
7. Jouer de la musique ou des vidéos YouTube sur demande
8. Donner des conseils stratégiques
9. Convertir des fichiers (PDF→Word, Excel→PDF, etc.)
10. Automatiser des tâches répétitives

NAVIGATION SYSTÈME (utilise ces commandes JSON quand nécessaire):
- Ouvrir CleanITBooks: {"action":"navigate","url":"/cleanitbooks"}
- Ouvrir Factures: {"action":"navigate","url":"/cleanitbooks/invoices"}
- Ouvrir Pointage: {"action":"navigate","url":"/pointage"}
- Ouvrir Planning: {"action":"navigate","url":"/pointage/planning"}
- Ouvrir Comm: {"action":"navigate","url":"/cleanitcomm"}
- Générer Excel: {"action":"generate_excel","type":"factures"|"paie"|"jobs"|"custom","data":"..."}
- Générer Word: {"action":"generate_word","type":"contrat"|"rapport"|"courrier","data":"..."}
- Jouer musique: {"action":"play_music","query":"nom artiste ou chanson"}
- Jouer vidéo: {"action":"play_video","query":"recherche vidéo"}
- Recherche web: {"action":"web_search","query":"terme de recherche"}

PERSONNALITÉ:
- Tu es directe, efficace, et amicale
- Tu utilises parfois des expressions camerounaises
- Tu anticipes les besoins et fais des suggestions proactives
- Tu expliques ce que tu fais en temps réel
- Tu es fière de travailler pour CleanIT Cameroun`;

// ── Palette ChaCha ───────────────────────────────────────────────────
const C = {
  bg:       '#0a0f1e',
  bg2:      '#111827',
  bg3:      '#1e293b',
  bg4:      '#334155',
  blue:     '#3b82f6',
  blue_l:   '#1e3a5f',
  blue_g:   'linear-gradient(135deg,#1d4ed8,#7c3aed)',
  purple:   '#8b5cf6',
  green:    '#10b981',
  red:      '#ef4444',
  orange:   '#f59e0b',
  cyan:     '#06b6d4',
  text:     '#f1f5f9',
  text2:    '#94a3b8',
  text3:    '#64748b',
  border:   '#1e293b',
  white:    '#ffffff',
  glow:     '0 0 20px rgba(59,130,246,.3)',
};

// ── Helpers ──────────────────────────────────────────────────────────
const fmtTime = d => new Date(d).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});

// ── Générateur documents ─────────────────────────────────────────────
const generateExcel = async (type, content, filename) => {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'ChaCha — CleanIT IA';
  wb.created = new Date();

  const ws = wb.addWorksheet(filename||'ChaCha Export');

  // Header
  ws.mergeCells('A1:F1');
  ws.getCell('A1').value = 'CleanIT ERP — Généré par ChaCha IA — '+new Date().toLocaleDateString('fr-FR');
  ws.getCell('A1').font = {name:'Calibri',bold:true,color:{argb:'FFFFFFFF'},size:12};
  ws.getCell('A1').fill = {type:'pattern',pattern:'solid',fgColor:{argb:'FF1F4E79'}};
  ws.getCell('A1').alignment = {horizontal:'center',vertical:'middle'};
  ws.getRow(1).height = 28;

  // Contenu dynamique selon type
  if(type==='factures') {
    ws.addRow([]);
    const hRow = ws.addRow(['N° Facture','Client','Date','Échéance','Total TTC','Statut']);
    hRow.eachCell(cell=>{cell.font={bold:true,color:{argb:'FFFFFFFF'}};cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF2563EB'}};});
    ws.columns = [{width:16},{width:28},{width:14},{width:14},{width:18},{width:14}];
    const data = [
      ['INV-2024-001','MTN Cameroun','15/01/2024','15/02/2024','53 935 625','Payée'],
      ['INV-2024-002','Orange Cameroun','28/01/2024','13/03/2024','10 195 875','En retard'],
      ['INV-2024-003','Gouvernement CM','01/02/2024','01/04/2024','32 000 000','Partielle'],
      ['INV-2024-004','CAMTEL','10/03/2024','09/05/2024','71 550 000','Envoyée'],
    ];
    data.forEach((row,i)=>{
      const r = ws.addRow(row);
      if(i%2===0) r.eachCell(cell=>cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFDEEAF1'}});
      const statusCell = r.getCell(6);
      if(row[5]==='En retard') statusCell.font={color:{argb:'FFDC2626'},bold:true};
      else if(row[5]==='Payée') statusCell.font={color:{argb:'FF16A34A'},bold:true};
    });
    const totalRow = ws.addRow(['','','','','TOTAL','167 681 500 FCFA']);
    totalRow.getCell(5).font={bold:true};
    totalRow.getCell(6).font={bold:true,color:{argb:'FF2563EB'}};
  } else if(type==='paie') {
    ws.addRow([]);
    const hRow = ws.addRow(['Matricule','Employé','Poste','Brut FCFA','CNPS 8.4%','IRPP','Net FCFA']);
    hRow.eachCell(cell=>{cell.font={bold:true,color:{argb:'FFFFFFFF'}};cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF7C3AED'}};});
    ws.columns=[{width:12},{width:24},{width:22},{width:16},{width:14},{width:12},{width:16}];
    const emps = [
      ['EI-001','Marie Kamga','Chef de Projet Senior',850000,71400,72983,705617],
      ['EI-002','Jean Fouda','Project Manager',750000,63000,58233,628767],
      ['EI-003','Alice Finance','Dir. Financière',1200000,100800,133233,965967],
      ['EI-004','Bob Comptable','Chef Comptable',750000,63000,58233,628767],
      ['EI-005','Pierre Etoga','Ingénieur Réseau',900000,75600,83733,740667],
      ['EI-006','Aline Biya','Responsable RH',700000,58800,50733,590467],
      ['EI-007','David Mballa','Analyste BI',750000,63000,58233,628767],
    ];
    emps.forEach((e,i)=>{
      const r=ws.addRow(e);
      if(i%2===0) r.eachCell(cell=>cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF5F3FF'}});
    });
    const t=ws.addRow(['','TOTAL (7 employés)','',5900000,495600,515382,4889017]);
    t.eachCell(cell=>cell.font={bold:true});
  } else if(type==='jobs') {
    ws.addRow([]);
    const hRow=ws.addRow(['Job ID','Nom du job','Client','Contrat FCFA','Coûts réels','Marge','Statut']);
    hRow.eachCell(cell=>{cell.font={bold:true,color:{argb:'FFFFFFFF'}};cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF059669'}};});
    ws.columns=[{width:12},{width:32},{width:24},{width:18},{width:16},{width:14},{width:14}];
    const jobs=[
      ['JOB-001','Installation 5G NR DLA-001','MTN Cameroun',165000000,35000000,'78.8%','En cours'],
      ['JOB-002','Maintenance 4G LTE YDE-001','Orange Cameroun',38000000,19200000,'49.5%','Terminé'],
      ['JOB-003','Infrastructure GAR-001','Gouvernement CM',29000000,12600000,'56.6%','En cours'],
      ['JOB-004','Fibre Optique BFN-001','CAMTEL',195000000,27200000,'86.0%','Attribué'],
      ['JOB-005','Survey RF MAR-001','Nexttel',15000000,0,'100%','En attente'],
    ];
    jobs.forEach((j,i)=>{
      const r=ws.addRow(j);
      if(i%2===0) r.eachCell(cell=>cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF0FDF4'}});
    });
  } else {
    // Custom — utiliser le contenu généré par l'IA
    ws.addRow([]);
    ws.addRow(['Contenu généré par ChaCha IA']);
    const lines = (content||'').split('\n').filter(l=>l.trim());
    lines.forEach(line=>{
      if(line.startsWith('|')) {
        const cells = line.split('|').filter(c=>c.trim()&&!c.includes('---'));
        if(cells.length>1) ws.addRow(cells.map(c=>c.trim()));
      } else {
        ws.addRow([line]);
      }
    });
  }

  const buf = await wb.xlsx.writeBuffer();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([buf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
  a.download = (filename||'chacha_export')+'_'+new Date().toISOString().split('T')[0]+'.xlsx';
  a.click();
  return 'Fichier Excel généré avec succès ✅';
};

const generateWord = async (type, content, filename) => {
  // Génération Word via HTML + Blob (compatible Office)
  const today = new Date().toLocaleDateString('fr-FR');
  let html = '';

  if(type==='contrat') {
    html = `
      <html><head><meta charset="utf-8"/><style>
        body{font-family:Calibri,Arial;font-size:11pt;margin:2cm;color:#1a1a1a}
        h1{color:#1F4E79;font-size:16pt;text-align:center;margin-bottom:5px}
        h2{color:#2563EB;font-size:13pt;margin-top:20px;border-bottom:1px solid #2563EB;padding-bottom:3px}
        .header{text-align:center;margin-bottom:30px;padding:15px;border:2px solid #1F4E79;border-radius:5px}
        .logo{font-size:24pt;font-weight:bold;color:#1F4E79}
        table{width:100%;border-collapse:collapse;margin:10px 0}
        td,th{border:1px solid #ddd;padding:8px;font-size:10pt}
        th{background:#1F4E79;color:white}
        .article{margin:15px 0;padding:10px;background:#f8fafc;border-left:3px solid #2563EB}
        .signature{margin-top:40px;display:flex;justify-content:space-between}
        .sig-box{text-align:center;width:45%}
      </style></head><body>
      <div class="header">
        <div class="logo">⚡ CleanIT ERP</div>
        <div>Système de Gestion d'Entreprise Télécom</div>
        <div style="color:#6b7280;font-size:9pt">Généré par ChaCha IA — ${today}</div>
      </div>
      <h1>CONTRAT DE PRESTATIONS DE SERVICES</h1>
      <p style="text-align:center;color:#6b7280">Réf: CONT-${Date.now().toString().slice(-6)} | Date: ${today}</p>
      ${content || `
        <h2>ARTICLE 1 — PARTIES CONTRACTANTES</h2>
        <div class="article">
          <p><strong>Le Prestataire :</strong> CleanIT Cameroun, société spécialisée dans les infrastructures télécom, sise à Douala.</p>
          <p><strong>Le Client :</strong> [Nom du client], représenté par [Représentant].</p>
        </div>
        <h2>ARTICLE 2 — OBJET DU CONTRAT</h2>
        <div class="article"><p>[Description des prestations]</p></div>
        <h2>ARTICLE 3 — MONTANT ET CONDITIONS DE PAIEMENT</h2>
        <div class="article">
          <table><tr><th>Prestation</th><th>Montant HT</th><th>TVA 19.25%</th><th>Total TTC</th></tr>
          <tr><td>[Prestation]</td><td>[Montant]</td><td>[TVA]</td><td>[Total]</td></tr></table>
        </div>
        <h2>ARTICLE 4 — DURÉE</h2>
        <div class="article"><p>Le présent contrat prend effet à la date de signature pour une durée de [durée].</p></div>
        <div class="signature">
          <div class="sig-box"><p>Pour CleanIT Cameroun</p><br/><br/><p>___________________</p><p>Directeur Général</p></div>
          <div class="sig-box"><p>Pour le Client</p><br/><br/><p>___________________</p><p>Représentant légal</p></div>
        </div>
      `}
      </body></html>`;
  } else if(type==='rapport') {
    html = `
      <html><head><meta charset="utf-8"/><style>
        body{font-family:Calibri,Arial;font-size:11pt;margin:2cm;color:#1a1a1a}
        h1{color:#1F4E79;font-size:18pt;text-align:center}
        h2{color:#2563EB;font-size:13pt;margin-top:20px}
        .kpi{display:inline-block;width:22%;margin:5px;padding:10px;text-align:center;background:#EFF6FF;border:1px solid #DBEAFE;border-radius:5px}
        .kpi-val{font-size:16pt;font-weight:bold;color:#1D4ED8}
        table{width:100%;border-collapse:collapse}
        td,th{border:1px solid #ddd;padding:6px}th{background:#1F4E79;color:white}
        tr:nth-child(even){background:#f8fafc}
      </style></head><body>
      <h1>⚡ RAPPORT CleanIT ERP</h1>
      <p style="text-align:center;color:#6b7280">Généré par ChaCha IA — ${today}</p>
      ${content || `
        <h2>Vue d'ensemble Q1 2024</h2>
        <div>
          <div class="kpi"><div class="kpi-val">207M</div><div>CA FCFA</div></div>
          <div class="kpi"><div class="kpi-val">5</div><div>Jobs actifs</div></div>
          <div class="kpi"><div class="kpi-val">6</div><div>Clients</div></div>
          <div class="kpi"><div class="kpi-val">58.5M</div><div>Trésorerie</div></div>
        </div>
        <h2>Jobs en cours</h2>
        <table><tr><th>Job</th><th>Client</th><th>Contrat</th><th>Avancement</th><th>Statut</th></tr>
        <tr><td>Installation 5G NR DLA-001</td><td>MTN Cameroun</td><td>165M FCFA</td><td>45%</td><td>En cours</td></tr>
        <tr><td>Infrastructure GAR-001</td><td>Gouvernement CM</td><td>29M FCFA</td><td>30%</td><td>En cours</td></tr>
        </table>
      `}
      </body></html>`;
  } else {
    html = `<html><head><meta charset="utf-8"/><style>body{font-family:Calibri;font-size:11pt;margin:2cm} h1{color:#1F4E79} h2{color:#2563EB}</style></head><body>
    <h1>Document CleanIT ERP</h1>
    <p style="color:#6b7280">Généré par ChaCha IA — ${today}</p>
    ${content||'<p>Contenu généré par ChaCha</p>'}
    </body></html>`;
  }

  const blob = new Blob([html],{type:'application/msword'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (filename||'document_chacha')+'_'+today.replace(/\//g,'-')+'.doc';
  a.click();
  return 'Document Word généré avec succès ✅';
};

// ── Composant principal ChaCha ───────────────────────────────────────
export default function ChaCha() {
  const navigate = useNavigate();
  const [messages,    setMessages]    = useState([{
    id:'init', role:'assistant', content:`Bonjour ! Je suis **ChaCha**, votre assistante IA intelligente CleanIT 🌟

Je peux vous aider à :
- 💬 Répondre à toutes vos questions sur l'entreprise
- 📊 Générer des documents Excel, Word, PDF
- 🔍 Faire des recherches sur internet
- 🎵 Jouer de la musique ou des vidéos
- 🗂️ Naviguer dans le système
- 📈 Analyser vos données financières

Que puis-je faire pour vous ?`, ts:Date.now(), actions:[]
  }]);
  const [input,       setInput]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [listening,   setListening]   = useState(false);
  const [speaking,    setSpeaking]    = useState(false);
  const [theme,       setTheme]       = useState('dark');
  const [showMedia,   setShowMedia]   = useState(null); // {type:'music'|'video', query:''}
  const [mediaUrl,    setMediaUrl]    = useState('');
  const [searchRes,   setSearchRes]   = useState(null);
  const [sidePanel,   setSidePanel]   = useState('suggestions');
  const [docHistory,  setDocHistory]  = useState([]);

  const msgEndRef   = useRef(null);
  const inputRef    = useRef(null);
  const recognRef   = useRef(null);
  const synthRef    = useRef(window.speechSynthesis);

  useEffect(()=>{ msgEndRef.current?.scrollIntoView({behavior:'smooth'}); },[messages]);

  // ── Synthèse vocale ─────────────────────────────────────────────────
  const speak = useCallback((text) => {
    if(!synthRef.current) return;
    synthRef.current.cancel();
    const clean = text.replace(/\*\*/g,'').replace(/#{1,3}\s/g,'').replace(/[🌟💬📊🔍🎵🗂️📈✅❌⚠️]/g,'').substring(0,300);
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = 'fr-FR';
    utt.rate = 1.05;
    utt.pitch = 1.1;
    utt.volume = 0.9;
    const voices = synthRef.current.getVoices();
    const frVoice = voices.find(v=>v.lang.startsWith('fr'));
    if(frVoice) utt.voice = frVoice;
    utt.onstart  = ()=>setSpeaking(true);
    utt.onend    = ()=>setSpeaking(false);
    utt.onerror  = ()=>setSpeaking(false);
    synthRef.current.speak(utt);
  },[]);

  const stopSpeaking = () => { synthRef.current?.cancel(); setSpeaking(false); };

  // ── Reconnaissance vocale ───────────────────────────────────────────
  const startListening = () => {
    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){ alert('Reconnaissance vocale non supportée sur ce navigateur. Utilisez Chrome.'); return; }
    const r = new SR();
    r.lang = 'fr-FR';
    r.continuous = false;
    r.interimResults = false;
    r.onstart  = ()=>setListening(true);
    r.onend    = ()=>setListening(false);
    r.onerror  = ()=>setListening(false);
    r.onresult = (e)=>{
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setTimeout(()=>sendMessage(transcript), 300);
    };
    r.start();
    recognRef.current = r;
  };

  const stopListening = () => { recognRef.current?.stop(); setListening(false); };

  // ── Traitement des actions IA ────────────────────────────────────────
  const processActions = useCallback(async (response) => {
    const actions = [];
    // Extraire JSON actions de la réponse
    const jsonMatches = response.match(/\{[^{}]*"action"[^{}]*\}/g);
    if(jsonMatches) {
      for(const match of jsonMatches) {
        try {
          const action = JSON.parse(match);
          actions.push(action);
          if(action.action==='navigate') {
            setTimeout(()=>navigate(action.url), 1500);
          } else if(action.action==='generate_excel') {
            const result = await generateExcel(action.type||'custom', action.data||'', 'chacha_'+action.type);
            setDocHistory(p=>[{type:'excel',name:'chacha_'+action.type+'.xlsx',ts:Date.now()},...p.slice(0,9)]);
            return result;
          } else if(action.action==='generate_word') {
            const result = await generateWord(action.type||'rapport', action.data||'', 'chacha_'+action.type);
            setDocHistory(p=>[{type:'word',name:'chacha_'+action.type+'.doc',ts:Date.now()},...p.slice(0,9)]);
            return result;
          } else if(action.action==='play_music') {
            setShowMedia({type:'music',query:action.query});
            setMediaUrl(`https://www.youtube.com/embed/search?q=${encodeURIComponent(action.query)}&autoplay=1`);
          } else if(action.action==='play_video') {
            setShowMedia({type:'video',query:action.query});
            setMediaUrl(`https://www.youtube.com/results?search_query=${encodeURIComponent(action.query)}`);
          } else if(action.action==='web_search') {
            setSearchRes({query:action.query, loading:true});
            setSidePanel('search');
          }
        } catch(e){}
      }
    }
    return null;
  },[navigate]);

  // ── Appel Claude API ─────────────────────────────────────────────────
  const callClaude = async (userMessage, history) => {
    const msgs = history.filter(m=>m.role!=='system').slice(-10).map(m=>({
      role: m.role,
      content: m.content,
    }));
    msgs.push({role:'user', content:userMessage});

    const response = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: msgs,
      }),
    });

    if(!response.ok) throw new Error('API Error: '+response.status);
    const data = await response.json();
    return data.content[0]?.text || 'Désolée, je n\'ai pas pu répondre.';
  };

  // ── Envoi message ────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const msg = (text||input).trim();
    if(!msg||loading) return;
    setInput('');
    setLoading(true);

    const userMsg = {id:'u'+Date.now(), role:'user', content:msg, ts:Date.now()};
    setMessages(p=>[...p, userMsg]);

    // Réponses rapides locales pour actions évidentes
    const lower = msg.toLowerCase();
    let quickReply = null;

    if(lower.includes('facture') && (lower.includes('excel')||lower.includes('générer')||lower.includes('exporter'))) {
      quickReply = 'Je génère votre fichier Excel des factures maintenant... 📊';
      await generateExcel('factures','','factures_cleanit');
      setDocHistory(p=>[{type:'excel',name:'factures_cleanit.xlsx',ts:Date.now()},...p.slice(0,9)]);
    } else if(lower.includes('paie') && (lower.includes('excel')||lower.includes('bulletin')||lower.includes('générer'))) {
      quickReply = 'Je génère le fichier Excel des bulletins de paie... 💰';
      await generateExcel('paie','','paie_mars_2024');
      setDocHistory(p=>[{type:'excel',name:'paie_mars_2024.xlsx',ts:Date.now()},...p.slice(0,9)]);
    } else if(lower.includes('job') && (lower.includes('excel')||lower.includes('rapport'))) {
      quickReply = 'Je génère le rapport Excel des jobs en cours... 🏗️';
      await generateExcel('jobs','','rapport_jobs');
      setDocHistory(p=>[{type:'excel',name:'rapport_jobs.xlsx',ts:Date.now()},...p.slice(0,9)]);
    } else if(lower.includes('contrat') && (lower.includes('word')||lower.includes('document')||lower.includes('créer')||lower.includes('générer'))) {
      quickReply = 'Je génère un template de contrat Word... 📝';
      await generateWord('contrat','','contrat_template');
      setDocHistory(p=>[{type:'word',name:'contrat_template.doc',ts:Date.now()},...p.slice(0,9)]);
    } else if(lower.includes('rapport') && (lower.includes('word')||lower.includes('document'))) {
      quickReply = 'Je génère le rapport Word... 📄';
      await generateWord('rapport','','rapport_cleanit');
      setDocHistory(p=>[{type:'word',name:'rapport_cleanit.doc',ts:Date.now()},...p.slice(0,9)]);
    } else if(lower.includes('cleanitbooks')||lower.includes('factures')||lower.includes('ouvre facture')) {
      quickReply = 'Je vous ouvre CleanITBooks — Facturation AR... 🧾';
      setTimeout(()=>navigate('/cleanitbooks/invoices'),1000);
    } else if(lower.includes('pointage')||lower.includes('présence')||lower.includes('géofencing')) {
      quickReply = 'Je vous ouvre le module Pointage & Présence... ⏱️';
      setTimeout(()=>navigate('/pointage'),1000);
    } else if(lower.includes('planning')||lower.includes('shifts')) {
      quickReply = 'Je vous ouvre le Planning terrain... 📅';
      setTimeout(()=>navigate('/pointage/planning'),1000);
    } else if(lower.includes('musique')||lower.includes('chanson')||lower.includes('music')) {
      const query = msg.replace(/joue|play|mets|met|la musique|une chanson/gi,'').trim()||'musique camerounaise';
      setShowMedia({type:'music',query});
      quickReply = `Je lance "${query}" pour vous 🎵`;
    }

    let assistantContent = quickReply;

    if(!quickReply) {
      try {
        assistantContent = await callClaude(msg, messages);
        // Traiter les actions dans la réponse
        const actionResult = await processActions(assistantContent);
        if(actionResult) assistantContent = actionResult + '\n\n' + assistantContent;
        // Nettoyer les JSON d'action de l'affichage
        assistantContent = assistantContent.replace(/\{[^{}]*"action"[^{}]*\}/g,'').trim();
      } catch(e) {
        console.error('Claude API error:', e);
        assistantContent = `Je rencontre un problème de connexion à mon cerveau IA 🧠

En attendant, voici ce que je peux faire localement :
- **Générer Excel** : "Génère le fichier Excel des factures"
- **Générer Word** : "Crée un contrat Word"
- **Naviguer** : "Ouvre CleanITBooks"
- **Jouer musique** : "Joue de la musique"

Erreur: ${e.message}`;
      }
    }

    const assistantMsg = {id:'a'+Date.now(), role:'assistant', content:assistantContent||'', ts:Date.now()};
    setMessages(p=>[...p, assistantMsg]);
    setLoading(false);

    // Lire la réponse vocalement
    if(assistantContent) speak(assistantContent);
  },[input, loading, messages, navigate, processActions, speak]);

  const handleKey = e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();} };

  // ── Suggestions rapides ──────────────────────────────────────────────
  const SUGGESTIONS = [
    {icon:'📊', label:'Rapport Excel factures',  action:()=>sendMessage('Génère le fichier Excel de toutes les factures')},
    {icon:'💰', label:'Bulletin paie Excel',      action:()=>sendMessage('Génère le fichier Excel des bulletins de paie')},
    {icon:'📝', label:'Template contrat Word',    action:()=>sendMessage('Crée un template de contrat Word')},
    {icon:'📈', label:'Rapport jobs en cours',    action:()=>sendMessage('Génère un rapport Excel des jobs en cours')},
    {icon:'🧾', label:'Ouvrir CleanITBooks',      action:()=>sendMessage('Ouvre CleanITBooks factures')},
    {icon:'⏱️', label:'Voir le pointage',         action:()=>sendMessage('Ouvre le module pointage')},
    {icon:'🏗️', label:'Planning techniciens',     action:()=>sendMessage('Ouvre le planning terrain')},
    {icon:'🎵', label:'Jouer de la musique',      action:()=>sendMessage('Joue de la musique camerounaise')},
    {icon:'💡', label:'Factures en retard ?',     action:()=>sendMessage('Quelles sont les factures en retard et les montants ?')},
    {icon:'📍', label:'Qui est hors zone ?',      action:()=>sendMessage('Qui est hors zone en ce moment ?')},
    {icon:'💵', label:'Trésorerie actuelle',      action:()=>sendMessage('Quel est le solde de trésorerie actuel ?')},
    {icon:'🔍', label:'Analyse financière Q1',   action:()=>sendMessage('Fais une analyse financière du Q1 2024')},
  ];

  // ── Rendu Markdown simple ────────────────────────────────────────────
  const renderMd = (text) => {
    if(!text) return '';
    return text
      .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g,'<em>$1</em>')
      .replace(/^### (.+)$/gm,'<h3 style="color:#60a5fa;font-size:13px;margin:10px 0 4px">$1</h3>')
      .replace(/^## (.+)$/gm,'<h2 style="color:#93c5fd;font-size:14px;margin:12px 0 5px">$1</h2>')
      .replace(/^# (.+)$/gm,'<h1 style="color:#bfdbfe;font-size:15px;margin:14px 0 6px">$1</h1>')
      .replace(/^- (.+)$/gm,'<div style="padding:2px 0 2px 16px;position:relative"><span style="position:absolute;left:4px;color:#3b82f6">•</span>$1</div>')
      .replace(/\n/g,'<br/>');
  };

  const bg = theme==='dark' ? C.bg : '#f8fafc';
  const cardBg = theme==='dark' ? C.bg2 : '#ffffff';
  const panelBg = theme==='dark' ? C.bg3 : '#f1f5f9';
  const textColor = theme==='dark' ? C.text : '#111827';
  const text2Color = theme==='dark' ? C.text2 : '#374151';

  return(
    <div style={{height:'100vh',display:'flex',background:bg,fontFamily:"'Segoe UI',system-ui,sans-serif",overflow:'hidden',transition:'background .3s'}}>
      <style>{`
        @keyframes pulse-glow{0%,100%{box-shadow:0 0 10px rgba(59,130,246,.4)}50%{box-shadow:0 0 25px rgba(59,130,246,.8)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes wave{0%,100%{transform:scaleY(1)}50%{transform:scaleY(2)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:4px}
        .msg-bubble{animation:fadeIn .25s ease}
        .suggestion-btn:hover{background:rgba(59,130,246,.2)!important;border-color:#3b82f6!important;transform:translateY(-1px)}
      `}</style>

      {/* ── Panel gauche — Historique et suggestions ── */}
      <div style={{width:260,background:cardBg,borderRight:`1px solid ${theme==='dark'?C.border:'#e2e8f0'}`,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {/* Logo ChaCha */}
        <div style={{padding:'20px 16px',borderBottom:`1px solid ${theme==='dark'?C.border:'#e2e8f0'}`}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:40,height:40,borderRadius:12,background:C.blue_g,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,boxShadow:C.glow}}>
              🤖
            </div>
            <div>
              <div style={{fontSize:16,fontWeight:900,color:textColor,letterSpacing:-.3}}>ChaCha</div>
              <div style={{fontSize:10,color:C.green,fontWeight:600,display:'flex',alignItems:'center',gap:4}}>
                <div style={{width:6,height:6,borderRadius:3,background:C.green}}/>
                IA Active · Claude API
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',padding:'8px',gap:4,borderBottom:`1px solid ${theme==='dark'?C.border:'#e2e8f0'}`}}>
          {[{id:'suggestions',l:'Suggestions'},{id:'docs',l:'Documents'},{id:'search',l:'Recherche'}].map(t=>(
            <button key={t.id} onClick={()=>setSidePanel(t.id)}
              style={{flex:1,padding:'6px',borderRadius:7,border:'none',background:sidePanel===t.id?C.blue:'transparent',color:sidePanel===t.id?C.white:text2Color,fontSize:10,fontWeight:sidePanel===t.id?700:500,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>
              {t.l}
            </button>
          ))}
        </div>

        <div style={{flex:1,overflowY:'auto',padding:'12px 10px'}}>
          {/* Suggestions */}
          {sidePanel==='suggestions'&&(
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              <div style={{fontSize:10,fontWeight:700,color:text2Color,textTransform:'uppercase',letterSpacing:.5,marginBottom:4}}>Actions rapides</div>
              {SUGGESTIONS.map((s,i)=>(
                <button key={i} onClick={s.action} className="suggestion-btn"
                  style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:9,border:`1px solid ${theme==='dark'?C.border:'#e2e8f0'}`,background:'transparent',color:text2Color,fontSize:12,cursor:'pointer',textAlign:'left',transition:'all .15s',fontFamily:'inherit',width:'100%'}}>
                  <span style={{fontSize:16,flexShrink:0}}>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Documents générés */}
          {sidePanel==='docs'&&(
            <div>
              <div style={{fontSize:10,fontWeight:700,color:text2Color,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>Documents générés</div>
              {docHistory.length===0&&(
                <div style={{textAlign:'center',padding:'30px 10px',color:C.text3}}>
                  <div style={{fontSize:32,marginBottom:8}}>📁</div>
                  <div style={{fontSize:11}}>Aucun document généré</div>
                  <div style={{fontSize:10,marginTop:4}}>Demandez à ChaCha de créer un fichier Excel ou Word</div>
                </div>
              )}
              {docHistory.map((d,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:9,border:`1px solid ${theme==='dark'?C.border:'#e2e8f0'}`,marginBottom:6}}>
                  <span style={{fontSize:20}}>{d.type==='excel'?'📊':'📝'}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,fontWeight:600,color:textColor,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.name}</div>
                    <div style={{fontSize:9,color:C.text3}}>{new Date(d.ts).toLocaleTimeString('fr-FR')}</div>
                  </div>
                </div>
              ))}

              {/* Templates prédéfinis */}
              <div style={{fontSize:10,fontWeight:700,color:text2Color,textTransform:'uppercase',letterSpacing:.5,margin:'16px 0 8px'}}>Templates</div>
              {[
                {icon:'📊',label:'Factures Excel',  action:()=>sendMessage('Génère le fichier Excel des factures')},
                {icon:'💰',label:'Paie Excel',       action:()=>sendMessage('Génère le bulletin de paie Excel')},
                {icon:'📝',label:'Contrat Word',     action:()=>sendMessage('Crée un contrat Word')},
                {icon:'📈',label:'Rapport jobs',     action:()=>sendMessage('Génère rapport Excel des jobs')},
                {icon:'📄',label:'Courrier Word',    action:()=>sendMessage('Crée un courrier Word')},
              ].map((t,i)=>(
                <button key={i} onClick={t.action} className="suggestion-btn"
                  style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',borderRadius:9,border:`1px solid ${theme==='dark'?C.border:'#e2e8f0'}`,background:'transparent',color:text2Color,fontSize:11,cursor:'pointer',textAlign:'left',width:'100%',marginBottom:4,fontFamily:'inherit',transition:'all .15s'}}>
                  <span>{t.icon}</span><span>{t.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Recherche */}
          {sidePanel==='search'&&(
            <div>
              <div style={{fontSize:10,fontWeight:700,color:text2Color,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>Recherche intégrée</div>
              {searchRes?(
                <div>
                  <div style={{fontSize:11,color:C.text3,marginBottom:8}}>Résultats pour : <strong style={{color:textColor}}>{searchRes.query}</strong></div>
                  <div style={{background:C.bg3,borderRadius:10,padding:'12px',fontSize:11,color:text2Color,lineHeight:1.6}}>
                    {searchRes.loading?'🔍 Recherche en cours...':`Voici les informations trouvées pour "${searchRes.query}". Demandez à ChaCha d'affiner les résultats.`}
                  </div>
                </div>
              ):(
                <div style={{textAlign:'center',padding:'30px 10px',color:C.text3}}>
                  <div style={{fontSize:32,marginBottom:8}}>🔍</div>
                  <div style={{fontSize:11}}>Demandez à ChaCha de faire une recherche</div>
                  <div style={{fontSize:10,marginTop:4}}>"Recherche les prix des antennes 5G Huawei"</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Paramètres thème */}
        <div style={{padding:'10px 12px',borderTop:`1px solid ${theme==='dark'?C.border:'#e2e8f0'}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:11,color:text2Color}}>Thème</span>
          <div style={{display:'flex',gap:4}}>
            {[{id:'dark',l:'🌙'},{id:'light',l:'☀️'},{id:'blue',l:'🌊'}].map(t=>(
              <button key={t.id} onClick={()=>setTheme(t.id)}
                style={{width:28,height:28,borderRadius:7,border:theme===t.id?`2px solid ${C.blue}`:'1px solid transparent',background:theme===t.id?C.blue+'30':'transparent',cursor:'pointer',fontSize:14}}>
                {t.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Zone principale — Chat ── */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {/* Header */}
        <div style={{padding:'14px 24px',background:cardBg,borderBottom:`1px solid ${theme==='dark'?C.border:'#e2e8f0'}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{position:'relative'}}>
              <div style={{width:44,height:44,borderRadius:13,background:C.blue_g,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,boxShadow:speaking?C.glow:'none',animation:speaking?'pulse-glow 1s infinite':'none'}}>
                🤖
              </div>
              <div style={{position:'absolute',bottom:-2,right:-2,width:14,height:14,borderRadius:7,background:C.green,border:'2px solid '+cardBg}}/>
            </div>
            <div>
              <div style={{fontSize:16,fontWeight:900,color:textColor}}>ChaCha</div>
              <div style={{fontSize:11,color:speaking?C.blue:C.green,fontWeight:600}}>
                {speaking?'🔊 En train de parler...':loading?'⏳ En train de réfléchir...':'✅ Prête · Claude AI'}
              </div>
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>setMessages([messages[0]])}
              style={{padding:'7px 14px',borderRadius:8,border:`1px solid ${theme==='dark'?C.border:'#e2e8f0'}`,background:'transparent',color:text2Color,fontSize:12,cursor:'pointer',fontWeight:600}}>
              🗑️ Effacer
            </button>
            <button onClick={stopSpeaking} style={{padding:'7px 14px',borderRadius:8,border:`1px solid ${theme==='dark'?C.border:'#e2e8f0'}`,background:'transparent',color:speaking?C.red:text2Color,fontSize:12,cursor:'pointer',fontWeight:600}}>
              {speaking?'⏹ Stop':'🔇'}
            </button>
          </div>
        </div>

        {/* Lecteur média */}
        {showMedia&&(
          <div style={{background:C.bg2,padding:'12px 20px',borderBottom:`1px solid ${C.border}`,display:'flex',alignItems:'center',gap:12}}>
            <span style={{fontSize:20}}>{showMedia.type==='music'?'🎵':'📹'}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:C.text}}>{showMedia.type==='music'?'Lecture musicale':'Vidéo'} : {showMedia.query}</div>
              <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(showMedia.query)}`} target="_blank" rel="noreferrer"
                style={{fontSize:11,color:C.blue}}>🔗 Ouvrir sur YouTube</a>
            </div>
            <button onClick={()=>setShowMedia(null)} style={{padding:'5px 10px',borderRadius:7,border:'none',background:C.bg3,color:C.text2,cursor:'pointer',fontSize:11}}>✕ Fermer</button>
          </div>
        )}

        {/* Messages */}
        <div style={{flex:1,overflowY:'auto',padding:'20px 24px',display:'flex',flexDirection:'column',gap:16}}>
          {messages.map((msg)=>{
            const isMe = msg.role==='user';
            return(
              <div key={msg.id} className="msg-bubble" style={{display:'flex',flexDirection:isMe?'row-reverse':'row',gap:10,alignItems:'flex-start'}}>
                {!isMe&&(
                  <div style={{width:36,height:36,borderRadius:11,background:C.blue_g,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0,boxShadow:C.glow}}>🤖</div>
                )}
                <div style={{maxWidth:'72%'}}>
                  <div style={{
                    padding:'12px 16px',
                    borderRadius:isMe?'16px 16px 4px 16px':'16px 16px 16px 4px',
                    background:isMe?C.blue:cardBg,
                    color:isMe?C.white:textColor,
                    fontSize:13,lineHeight:1.6,
                    boxShadow:isMe?`0 4px 14px ${C.blue}40`:C.shadow,
                    border:isMe?'none':`1px solid ${theme==='dark'?C.border:'#e2e8f0'}`,
                  }}>
                    {isMe?(
                      <span>{msg.content}</span>
                    ):(
                      <div dangerouslySetInnerHTML={{__html:renderMd(msg.content)}}/>
                    )}
                  </div>
                  <div style={{fontSize:9,color:C.text3,marginTop:3,textAlign:isMe?'right':'left'}}>{fmtTime(msg.ts)}</div>
                </div>
              </div>
            );
          })}

          {/* Loader */}
          {loading&&(
            <div className="msg-bubble" style={{display:'flex',gap:10,alignItems:'center'}}>
              <div style={{width:36,height:36,borderRadius:11,background:C.blue_g,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,animation:'pulse-glow 1s infinite'}}>🤖</div>
              <div style={{padding:'14px 18px',borderRadius:'16px 16px 16px 4px',background:cardBg,border:`1px solid ${theme==='dark'?C.border:'#e2e8f0'}`,display:'flex',gap:5,alignItems:'center'}}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{width:7,height:7,borderRadius:4,background:C.blue,animation:`wave 1s ease ${i*0.2}s infinite`}}/>
                ))}
                <span style={{fontSize:12,color:C.text3,marginLeft:6}}>ChaCha réfléchit...</span>
              </div>
            </div>
          )}
          <div ref={msgEndRef}/>
        </div>

        {/* Input zone */}
        <div style={{padding:'16px 24px',background:cardBg,borderTop:`1px solid ${theme==='dark'?C.border:'#e2e8f0'}`}}>
          {/* Indicateur écoute */}
          {listening&&(
            <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderRadius:10,background:C.red+'20',border:`1px solid ${C.red}40`,marginBottom:10}}>
              <div style={{width:10,height:10,borderRadius:5,background:C.red,animation:'pulse-glow .8s infinite'}}/>
              <span style={{fontSize:12,color:C.red,fontWeight:700}}>Écoute en cours... Parlez maintenant</span>
              <button onClick={stopListening} style={{marginLeft:'auto',padding:'3px 8px',borderRadius:6,border:'none',background:C.red,color:'white',fontSize:11,cursor:'pointer'}}>Arrêter</button>
            </div>
          )}

          <div style={{display:'flex',gap:10,alignItems:'flex-end'}}>
            {/* Bouton vocal */}
            <button onClick={listening?stopListening:startListening}
              style={{width:46,height:46,borderRadius:13,border:'none',background:listening?C.red:C.bg3||'#1e293b',color:listening?C.white:C.text2,fontSize:20,cursor:'pointer',flexShrink:0,transition:'all .2s',animation:listening?'pulse-glow .8s infinite':'none',boxShadow:listening?`0 0 0 3px ${C.red}40`:'none'}}>
              🎤
            </button>

            {/* Input */}
            <div style={{flex:1,background:theme==='dark'?C.bg3:'#f1f5f9',borderRadius:14,border:`1px solid ${theme==='dark'?C.border:'#e2e8f0'}`,padding:'10px 14px',display:'flex',alignItems:'flex-end',gap:8,transition:'border-color .15s'}}>
              <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey}
                placeholder="Écrivez à ChaCha ou cliquez sur 🎤 pour parler..." rows={1}
                style={{flex:1,border:'none',background:'transparent',resize:'none',outline:'none',fontSize:13,fontFamily:'inherit',color:textColor,lineHeight:1.5,maxHeight:100,overflowY:'auto'}}/>
              <div style={{display:'flex',gap:6,flexShrink:0}}>
                <button style={{padding:'4px',background:'none',border:'none',cursor:'pointer',fontSize:18,color:C.text3}}>📎</button>
              </div>
            </div>

            {/* Bouton envoyer */}
            <button onClick={()=>sendMessage()} disabled={!input.trim()||loading}
              style={{width:46,height:46,borderRadius:13,border:'none',background:input.trim()&&!loading?C.blue:'#334155',color:input.trim()&&!loading?C.white:'#64748b',fontSize:20,cursor:input.trim()&&!loading?'pointer':'default',flexShrink:0,transition:'all .2s',boxShadow:input.trim()&&!loading?`0 4px 14px ${C.blue}50`:'none'}}>
              {loading?<div style={{width:20,height:20,border:'2px solid rgba(255,255,255,.3)',borderTop:'2px solid white',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto'}}/>:'➤'}
            </button>
          </div>

          <div style={{fontSize:10,color:C.text3,textAlign:'center',marginTop:8}}>
            ChaCha propulsée par Claude AI (Anthropic) · Appuyez sur Entrée pour envoyer · 🎤 pour parler
          </div>
        </div>
      </div>
    </div>
  );
}
