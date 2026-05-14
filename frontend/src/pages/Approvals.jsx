import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getBalance } from "../services/cleanitbooks.api";

// ─── FORMATTERS ───────────────────────────────────────────────
const fN = n => new Intl.NumberFormat("fr-FR").format(Math.round(n||0));
const fD = d => d ? new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const fDT = d => d ? new Date(d).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"}) : "—";
const hAgo = d => Math.round((Date.now()-new Date(d))/(1000*3600));

// ─── SVG ICONS (pas d'emojis) ─────────────────────────────────
const Icon = ({d,size=16,color="currentColor",stroke=1.8}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d)?d.map((p,i)=><path key={i} d={p}/>):<path d={d}/>}
  </svg>
);
const ICONS = {
  payment:   "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  purchase:  "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
  expense:   "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z",
  leave:     ["M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"],
  advance:   "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  mission:   ["M12 19l9 2-9-18-9 18 9-2zm0 0v-8"],
  training:  "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  equipment: ["M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z","M15 12a3 3 0 11-6 0 3 3 0 016 0z"],
  check:     "M5 13l4 4L19 7",
  x:         "M6 18L18 6M6 6l12 12",
  chevron:   "M9 5l7 7-7 7",
  back:      "M10 19l-7-7m0 0l7-7m-7 7h18",
  plus:      "M12 4v16m8-8H4",
  search:    "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  filter:    "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z",
  clock:     "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  alert:     ["M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"],
  user:      ["M16 7a4 4 0 11-8 0 4 4 0 018 0z","M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"],
  list:      "M4 6h16M4 10h16M4 14h16M4 18h16",
  grid:      ["M3 7V5a2 2 0 012-2h2","M17 3h2a2 2 0 012 2v2","M21 17v2a2 2 0 01-2 2h-2","M7 21H5a2 2 0 01-2-2v-2"],
  download:  "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  send:      "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
  brain:     ["M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"],
  bank:      ["M3 6l9-3 9 3v2H3V6z","M3 10h18v10H3V10z","M9 14v3","M12 14v3","M15 14v3"],
  edit:      ["M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"],
};

// ─── TYPES ────────────────────────────────────────────────────
const TYPES = [
  {id:"payment_request",  label:"Demande de paiement",  color:"#0066CC", iconKey:"payment"},
  {id:"purchase_request", label:"Demande d'achat",      color:"#D04A00", iconKey:"purchase"},
  {id:"expense_report",   label:"Note de frais",         color:"#C50F1F", iconKey:"expense"},
  {id:"leave_request",    label:"Demande de congé",      color:"#0E7A0D", iconKey:"leave"},
  {id:"advance_request",  label:"Avance sur salaire",    color:"#5C2D91", iconKey:"advance"},
  {id:"mission_request",  label:"Ordre de mission",      color:"#006E5A", iconKey:"mission"},
  {id:"training_request", label:"Demande de formation",  color:"#7600BC", iconKey:"training"},
  {id:"equipment_request",label:"Demande matériel",      color:"#003F87", iconKey:"equipment"},
];
const getType = id => TYPES.find(t=>t.id===id)||TYPES[0];

// ─── APPROBATEURS ─────────────────────────────────────────────
const APPROVERS = {
  manager:  {label:"Responsable direct",   color:"#0066CC"},
  finance1: {label:"Finance N1",            color:"#0E7A0D"},
  finance2: {label:"Finance N2",            color:"#5C2D91"},
  rh:       {label:"RH",                    color:"#D04A00"},
  cfo:      {label:"Directeur Financier",   color:"#7600BC"},
  dg:       {label:"Directeur Général",     color:"#C50F1F"},
};

// ─── MATRICE ──────────────────────────────────────────────────
const MATRIX = {
  payment_request:  [{max:500000,lvls:["manager","dg"]},{max:5000000,lvls:["manager","finance1","dg"]},{max:20000000,lvls:["manager","finance1","finance2","dg"]},{max:Infinity,lvls:["manager","finance1","finance2","cfo","dg"]}],
  purchase_request: [{max:1000000,lvls:["manager","finance1","dg"]},{max:Infinity,lvls:["manager","finance1","finance2","dg"]}],
  expense_report:   [{max:Infinity,lvls:["manager","finance1"]}],
  leave_request:    [{max:Infinity,lvls:["manager","rh"]}],
  advance_request:  [{max:Infinity,lvls:["manager","finance1","dg"]}],
  mission_request:  [{max:Infinity,lvls:["manager","finance1","dg"]}],
  training_request: [{max:Infinity,lvls:["manager","rh","dg"]}],
  equipment_request:[{max:Infinity,lvls:["manager","finance1","dg"]}],
};
const getLevels = (type,amount) => {const rules=MATRIX[type]||[{max:Infinity,lvls:["manager","dg"]}];return (rules.find(r=>amount<=r.max)||rules[rules.length-1]).lvls;};
const getWF = item => {const lvls=getLevels(item.type,item.amount||0);const app=item.approvedBy||[];return {lvls,app,cur:lvls[app.length]||null,done:app.length>=lvls.length};};

// ─── ESCALADE ─────────────────────────────────────────────────
const ESC_H = {manager:24,finance1:48,finance2:48,rh:24,cfo:72,dg:96};
const getEsc = item => {
  if(!item.submittedAt||["paid","rejected","draft"].includes(item.status)) return null;
  const {cur,done} = getWF(item); if(!cur||done) return null;
  const maxH=ESC_H[cur]||48, elapsed=hAgo(item.lastActionAt||item.submittedAt), pct=Math.min(100,Math.round(elapsed/maxH*100));
  return {elapsed,maxH,pct,remaining:Math.max(0,maxH-elapsed),urgent:pct>=80,overdue:pct>=100};
};

// ─── SEED DATA ────────────────────────────────────────────────
const SEED = [
  {id:"APV-2025-001",reference:"APV-2025-001",type:"payment_request",title:"Paiement sous-traitant Thomas Ngono — DLA-001 Phase 2",amount:18000000,currency:"FCFA",status:"pending",priority:"haute",submittedBy:"Marie Kamga",submittedAt:"2025-05-12T09:00:00",lastActionAt:"2025-05-13T10:00:00",beneficiaryName:"Thomas Ngono",beneficiaryBank:"BICEC",beneficiaryAccount:"CM21 1001 2345 6789",justification:"Paiement phase 2 projet DLA-001 (40%). Travaux validés par le chef de projet.",site:"DLA-001",project:"PROJ-2025-001",approvedBy:["manager","finance1"],history:[{action:"Soumis",by:"Marie Kamga",at:"2025-05-12T09:00:00",comment:""},{action:"Approuvé — Responsable direct",by:"Alice Finance",at:"2025-05-12T14:00:00",comment:"Budget OK"},{action:"Approuvé — Finance N1",by:"Bob Finance",at:"2025-05-13T10:00:00",comment:"Conforme au contrat"}]},
  {id:"APV-2025-002",reference:"APV-2025-002",type:"purchase_request",title:"Achat câbles fibre optique — Site YDE-001",amount:3500000,currency:"FCFA",status:"pending",priority:"normale",submittedBy:"Pierre Etoga",submittedAt:"2025-05-13T11:00:00",lastActionAt:"2025-05-13T11:00:00",beneficiaryName:"Tech Africa SARL",beneficiaryBank:"SGC",beneficiaryAccount:"CM21 2001 9876 5432",justification:"Câbles requis pour finalisation réseau fibre YDE-001. Livraison urgente.",site:"YDE-001",project:"PROJ-2025-002",approvedBy:["manager"],history:[{action:"Soumis",by:"Pierre Etoga",at:"2025-05-13T11:00:00",comment:""},{action:"Approuvé — Responsable direct",by:"Marie Kamga",at:"2025-05-13T14:00:00",comment:""}]},
  {id:"APV-2025-003",reference:"APV-2025-003",type:"expense_report",title:"Note de frais mission Garoua — Ali Moussa",amount:285000,currency:"FCFA",status:"paid",priority:"basse",submittedBy:"Ali Moussa",submittedAt:"2025-05-10T08:00:00",lastActionAt:"2025-05-11T15:00:00",beneficiaryName:"Ali Moussa",beneficiaryBank:"Afriland First Bank",beneficiaryAccount:"CM21 3001 1111 2222",justification:"Per diem 3 jours + transport Douala-Garoua aller-retour.",site:"",project:"",approvedBy:["manager","finance1"],history:[{action:"Soumis",by:"Ali Moussa",at:"2025-05-10T08:00:00",comment:""},{action:"Approuvé — Responsable direct",by:"Marie Kamga",at:"2025-05-10T14:00:00",comment:""},{action:"Approuvé — Finance N1",by:"Alice Finance",at:"2025-05-11T09:00:00",comment:""},{action:"Paiement effectué",by:"Alice Finance",at:"2025-05-11T15:00:00",comment:"Virement BICEC effectué"}]},
  {id:"APV-2025-004",reference:"APV-2025-004",type:"leave_request",title:"Congé annuel — Samuel Djomo — 15 jours",amount:0,currency:"FCFA",status:"pending",priority:"normale",submittedBy:"Samuel Djomo",submittedAt:"2025-05-14T10:00:00",lastActionAt:"2025-05-14T10:00:00",justification:"Congé annuel du 01/06/2025 au 15/06/2025. Remplacement assuré par Jean Mbarga.",site:"",project:"",approvedBy:[],history:[{action:"Soumis",by:"Samuel Djomo",at:"2025-05-14T10:00:00",comment:""}]},
  {id:"APV-2025-005",reference:"APV-2025-005",type:"mission_request",title:"Ordre de mission — Kribi Port — Thomas Ngono",amount:420000,currency:"FCFA",status:"approved",priority:"haute",submittedBy:"Marie Kamga",submittedAt:"2025-05-08T08:00:00",lastActionAt:"2025-05-10T08:00:00",beneficiaryName:"Thomas Ngono",beneficiaryBank:"MTN Mobile Money",beneficiaryAccount:"677000001",justification:"Mission technique KRI-001. Transport + hébergement 5 jours.",site:"KRI-001",project:"PROJ-2025-001",approvedBy:["manager","finance1","dg"],history:[{action:"Soumis",by:"Marie Kamga",at:"2025-05-08T08:00:00",comment:""},{action:"Approuvé — Responsable direct",by:"Alice Finance",at:"2025-05-08T14:00:00",comment:""},{action:"Approuvé — Finance N1",by:"Bob Finance",at:"2025-05-09T10:00:00",comment:""},{action:"Approuvé — Directeur Général",by:"Jérôme Bell",at:"2025-05-10T08:00:00",comment:"Mission validée, bonne chance"}]},
  {id:"APV-2025-006",reference:"APV-2025-006",type:"advance_request",title:"Avance sur salaire — Jean Mbarga — Mai 2025",amount:150000,currency:"FCFA",status:"draft",priority:"haute",submittedBy:"Jean Mbarga",submittedAt:"2025-05-14T09:00:00",lastActionAt:"2025-05-14T09:00:00",beneficiaryName:"Jean Mbarga",beneficiaryBank:"BICEC",beneficiaryAccount:"CM21 1001 8888 7777",justification:"Avance 50% salaire pour urgence médicale familiale.",site:"",project:"",approvedBy:[],history:[]},
];

// ─── DESIGN TOKENS ────────────────────────────────────────────
const C = {
  white:"#ffffff", bg:"#F5F6FA", bg2:"#EEF0F5",
  border:"#E2E5EC", border2:"#ECF0F7",
  text:"#1A1D23", text2:"#3D4458", text3:"#6B7280", text4:"#9CA3AF",
  blue:"#0066CC", green:"#0E7A0D", red:"#C50F1F", orange:"#D04A00", purple:"#5C2D91",
  shadow:"0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
  shadow2:"0 4px 16px rgba(0,0,0,0.12)",
};

// ─── MINI COMPOSANTS ──────────────────────────────────────────
const Avatar = ({name="?",size=32,color=C.blue}) => (
  <div style={{width:size,height:size,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:size*0.36,flexShrink:0,letterSpacing:"-0.5px"}}>
    {(name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
  </div>
);

const StatusBadge = ({item}) => {
  const {cur,done} = getWF(item);
  const map = {
    draft:    {label:"Brouillon",    bg:"#F3F4F6",color:"#6B7280"},
    paid:     {label:"Payé",         bg:"#D1FAE5",color:"#065F46"},
    rejected: {label:"Rejeté",       bg:"#FEE2E2",color:"#991B1B"},
  };
  if(map[item.status]) {const s=map[item.status];return <span style={{padding:"3px 10px",borderRadius:12,fontSize:11,fontWeight:700,background:s.bg,color:s.color,whiteSpace:"nowrap"}}>{s.label}</span>;}
  if(done||item.status==="approved") return <span style={{padding:"3px 10px",borderRadius:12,fontSize:11,fontWeight:700,background:"#D1FAE5",color:"#065F46"}}>Approuvé</span>;
  const inf = APPROVERS[cur]||{label:cur,color:C.orange};
  return <span style={{padding:"3px 10px",borderRadius:12,fontSize:11,fontWeight:700,background:inf.color+"18",color:inf.color,whiteSpace:"nowrap"}}>En attente — {inf.label}</span>;
};

const PriorityBadge = ({p}) => {
  const m={haute:{bg:"#FEE2E2",color:"#991B1B",label:"Haute"},normale:{bg:"#FEF3C7",color:"#92400E",label:"Normale"},basse:{bg:"#D1FAE5",color:"#065F46",label:"Basse"}};
  const s=m[p]||m.normale;
  return <span style={{padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:600,background:s.bg,color:s.color}}>{s.label}</span>;
};

const Btn = ({label,onClick,color=C.blue,ghost=false,disabled=false,sm=false,icon=null,full=false,danger=false}) => {
  const bg = danger?"#C50F1F":ghost?"transparent":disabled?"#E5E7EB":color;
  const fg = ghost?(danger?"#C50F1F":color):disabled?C.text4:"#fff";
  return (
    <button onClick={onClick} disabled={disabled} style={{padding:sm?"5px 12px":"8px 18px",borderRadius:6,border:ghost?`1.5px solid ${danger?"#C50F1F":color}`:"none",background:bg,color:fg,fontWeight:600,fontSize:sm?11:13,cursor:disabled?"not-allowed":"pointer",display:"inline-flex",alignItems:"center",gap:6,opacity:disabled?0.5:1,width:full?"100%":"auto",justifyContent:"center",fontFamily:"inherit",transition:"all .15s",letterSpacing:"0.01em"}}>
      {icon&&<Icon d={ICONS[icon]} size={14} color={fg}/>}{label}
    </button>
  );
};

// ─── WORKFLOW TIMELINE ────────────────────────────────────────
const WorkflowSteps = ({item,compact=false}) => {
  const {lvls,app,cur,done} = getWF(item);
  return (
    <div style={{display:"flex",alignItems:"flex-start",gap:0,flexWrap:"wrap",rowGap:8}}>
      {lvls.map((lvl,i) => {
        const inf=APPROVERS[lvl]||{label:lvl,color:C.blue};
        const isDone = i<app.length;
        const isActive = lvl===cur && !done;
        const isLast = i===lvls.length-1;
        return (
          <div key={lvl} style={{display:"flex",alignItems:"center",gap:0}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{width:compact?28:34,height:compact?28:34,borderRadius:"50%",background:isDone?C.green:isActive?inf.color:C.bg2,border:`2px solid ${isDone?C.green:isActive?inf.color:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .3s",boxShadow:isActive?`0 0 0 3px ${inf.color}20`:"none"}}>
                {isDone
                  ? <Icon d={ICONS.check} size={compact?12:15} color="#fff" stroke={2.5}/>
                  : <span style={{fontSize:compact?10:11,fontWeight:700,color:isActive?"#fff":C.text4}}>{i+1}</span>
                }
              </div>
              {!compact&&<div style={{fontSize:10,color:isDone?C.green:isActive?inf.color:C.text4,fontWeight:isDone||isActive?700:400,textAlign:"center",maxWidth:64,lineHeight:1.3}}>{inf.label}</div>}
            </div>
            {!isLast&&<div style={{width:compact?24:32,height:2,background:isDone?C.green:C.border2,margin:compact?"0 2px 0":"0 4px 16px",flexShrink:0,transition:"background .3s"}}/>}
          </div>
        );
      })}
    </div>
  );
};

// ─── BUDGET CHECKER ───────────────────────────────────────────
const BudgetCheck = ({amount}) => {
  const [bal,setBal]=useState(null);
  useEffect(()=>{getBalance().then(d=>{if(d?.rows){const b=d.rows.filter(r=>r.classe==="5").reduce((s,r)=>s+Number(r.debit)-Number(r.credit),0);setBal(b);}}).catch(()=>{});},[]);
  if(bal===null) return <div style={{padding:"10px 14px",borderRadius:6,background:C.bg2,fontSize:12,color:C.text3}}>Vérification budget CleanITBooks...</div>;
  const ok=bal>=amount, pct=amount>0?Math.min(100,Math.round(amount/bal*100)):0;
  return (
    <div style={{padding:"12px 14px",borderRadius:6,border:`1px solid ${ok?"#93C5FD":"#FCD34D"}`,background:ok?"#EFF6FF":"#FFFBEB"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <Icon d={ICONS.bank} size={14} color={ok?C.blue:C.orange}/>
          <span style={{fontSize:12,fontWeight:700,color:ok?C.blue:C.orange}}>{ok?"Budget disponible":"Budget insuffisant"}</span>
        </div>
        <span style={{fontSize:11,color:C.text3}}>{pct}% de la trésorerie</span>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.text2,marginBottom:8}}>
        <span>Demande : <strong>{fN(amount)} FCFA</strong></span>
        <span>Trésorerie : <strong style={{color:ok?C.green:C.red}}>{fN(bal)} FCFA</strong></span>
      </div>
      <div style={{height:5,borderRadius:3,background:C.border2,overflow:"hidden"}}>
        <div style={{width:pct+"%",height:"100%",background:ok?C.blue:C.orange,borderRadius:3,transition:"width .5s"}}/>
      </div>
    </div>
  );
};

// ─── AI RISK ─────────────────────────────────────────────────
const AIRisk = ({item}) => {
  const [r,setR]=useState(null); const [loading,setL]=useState(false);
  const run = async () => {
    setL(true);
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+import.meta.env.VITE_GROQ_API_KEY},body:JSON.stringify({model:"llama-3.3-70b-versatile",max_tokens:120,messages:[{role:"user",content:"Analyse cette demande ERP. JSON uniquement: {score:1-10,niveau:'faible|moyen|élevé',note:'max 70 chars'}. Type:"+item.type+", Montant:"+item.amount+" FCFA, Justif:"+(item.justification||"none")}]})});
      const d=await res.json(); const txt=(d.choices?.[0]?.message?.content||"{}").replace(/```json|```/g,"").trim();
      setR(JSON.parse(txt));
    } catch {setR({score:5,niveau:"moyen",note:"Analyse indisponible"});}
    setL(false);
  };
  const clr={faible:C.green,moyen:C.orange,"élevé":C.red};
  return (
    <div style={{padding:"12px 14px",borderRadius:6,border:`1px solid ${C.border}`,background:C.white}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <Icon d={ICONS.brain} size={14} color={C.purple}/>
          <span style={{fontSize:12,fontWeight:700,color:C.purple}}>Analyse IA — ChaCha</span>
        </div>
        {!r&&<Btn label={loading?"Analyse...":"Analyser"} onClick={run} disabled={loading} sm color={C.purple}/>}
      </div>
      {r&&(
        <div style={{marginTop:10,display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontSize:28,fontWeight:800,color:clr[r.niveau]||C.orange,lineHeight:1}}>{r.score}<span style={{fontSize:13,fontWeight:500,color:C.text4}}>/10</span></div>
          <div>
            <span style={{padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:700,background:(clr[r.niveau]||C.orange)+"18",color:clr[r.niveau]||C.orange}}>Risque {r.niveau}</span>
            <div style={{fontSize:12,color:C.text2,marginTop:4,fontStyle:"italic"}}>{r.note}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── ESCALADE BAR ─────────────────────────────────────────────
const EscBar = ({item}) => {
  const e=getEsc(item); if(!e) return null;
  const color=e.overdue?C.red:e.urgent?C.orange:C.blue;
  return (
    <div style={{padding:"10px 14px",borderRadius:6,border:`1px solid ${color}30`,background:color+"08"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <Icon d={ICONS.clock} size={13} color={color}/>
          <span style={{fontSize:12,fontWeight:700,color}}>{e.overdue?"Délai dépassé — escalade auto":e.urgent?"Délai critique":"Dans les délais"}</span>
        </div>
        <span style={{fontSize:11,color}}>{e.overdue?"Action requise":e.remaining+"h restantes / "+e.maxH+"h"}</span>
      </div>
      <div style={{height:4,borderRadius:2,background:C.border2}}>
        <div style={{width:e.pct+"%",height:"100%",background:color,borderRadius:2,transition:"width .3s"}}/>
      </div>
    </div>
  );
};

// ─── PAGE DÉTAIL ──────────────────────────────────────────────
const DetailPage = ({items,onUpdate}) => {
  const {id} = useParams();
  const navigate = useNavigate();
  const [comment,setComment] = useState("");
  const [acting,setActing] = useState(false);
  const item = items.find(i=>i.id===id);

  if(!item) return (
    <div style={{padding:60,textAlign:"center"}}>
      <div style={{fontSize:40,marginBottom:12,color:C.text4}}>
        <Icon d={ICONS.alert} size={48} color={C.text4}/>
      </div>
      <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:8}}>Demande introuvable</div>
      <Btn label="Retour aux approbations" onClick={()=>navigate("/approvals")} icon="back" ghost color={C.blue}/>
    </div>
  );

  const t = getType(item.type);
  const {lvls,app,cur,done} = getWF(item);
  const needsAmount = ["payment_request","purchase_request","expense_report","advance_request","mission_request"].includes(item.type);

  const doAction = (action) => {
    setActing(true);
    let newApp=[...(item.approvedBy||[])], newStatus=item.status, label="";
    if(action==="approve"){newApp.push(cur);label="Approuvé — "+(APPROVERS[cur]?.label||cur);newStatus=newApp.length>=lvls.length?"approved":"pending";}
    else if(action==="reject"){newStatus="rejected";label="Rejeté";}
    else if(action==="pay"){newStatus="paid";label="Paiement effectué";}
    else if(action==="submit"){newStatus="pending";label="Soumis pour approbation";}
    const updated={...item,status:newStatus,approvedBy:newApp,lastActionAt:new Date().toISOString(),history:[...(item.history||[]),{action:label,by:"Utilisateur connecté",at:new Date().toISOString(),comment}]};
    onUpdate(updated);setComment("");setActing(false);
  };

  const InfoRow = ({label,value,mono=false}) => value?(
    <div style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${C.border2}`}}>
      <span style={{fontSize:12,color:C.text3,minWidth:100}}>{label}</span>
      <span style={{fontSize:12,fontWeight:600,color:C.text,textAlign:"right",fontFamily:mono?"'Courier New',monospace":"inherit"}}>{value}</span>
    </div>
  ):null;

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Inter','Segoe UI',Arial,sans-serif"}}>
      {/* BREADCRUMB */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"12px 28px",display:"flex",alignItems:"center",gap:10}}>
        <button onClick={()=>navigate("/approvals")} style={{display:"flex",alignItems:"center",gap:6,border:"none",background:"none",cursor:"pointer",color:C.blue,fontSize:13,fontWeight:500,padding:0}}>
          <Icon d={ICONS.back} size={14} color={C.blue}/> Approvals
        </button>
        <span style={{color:C.text4,fontSize:13}}>/</span>
        <span style={{fontSize:13,color:C.text,fontWeight:600}}>{item.reference}</span>
        <div style={{marginLeft:"auto"}}><StatusBadge item={item}/></div>
      </div>

      {/* HEADER */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"20px 28px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:16}}>
            <div style={{width:44,height:44,borderRadius:10,background:t.color+"15",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Icon d={ICONS[t.iconKey]} size={22} color={t.color}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:11,color:C.text3,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{t.label} · {item.reference}</div>
              <h1 style={{fontSize:20,fontWeight:800,color:C.text,margin:"0 0 4px"}}>{item.title}</h1>
              <div style={{fontSize:12,color:C.text3}}>Soumis par <strong style={{color:C.text2}}>{item.submittedBy}</strong> · {fDT(item.submittedAt)} · <PriorityBadge p={item.priority}/></div>
            </div>
            {item.amount>0&&(
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:11,color:C.text3,marginBottom:2}}>Montant</div>
                <div style={{fontSize:26,fontWeight:800,color:t.color}}>{fN(item.amount)}</div>
                <div style={{fontSize:11,color:C.text3}}>{item.currency}</div>
              </div>
            )}
          </div>
          {/* WORKFLOW */}
          <div style={{padding:"16px 18px",background:C.bg,borderRadius:8,border:`1px solid ${C.border2}`}}>
            <div style={{fontSize:11,color:C.text3,textTransform:"uppercase",letterSpacing:.8,marginBottom:12,fontWeight:600}}>Workflow d'approbation — {app.length}/{lvls.length} étape{lvls.length>1?"s":""}</div>
            <WorkflowSteps item={item}/>
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 28px",display:"grid",gridTemplateColumns:"1fr 380px",gap:24}}>

        {/* COLONNE GAUCHE */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>

          {/* Alertes */}
          {needsAmount&&item.status==="pending"&&item.amount>0&&<BudgetCheck amount={item.amount}/>}
          <EscBar item={item}/>
          <AIRisk item={item}/>

          {/* Justification */}
          <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.border}`,overflow:"hidden",boxShadow:C.shadow}}>
            <div style={{padding:"12px 18px",borderBottom:`1px solid ${C.border2}`,fontWeight:700,fontSize:13,color:C.text}}>Justification</div>
            <div style={{padding:"14px 18px",fontSize:13,color:C.text2,lineHeight:1.7}}>{item.justification||"Aucune justification fournie."}</div>
          </div>

          {/* Informations */}
          <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.border}`,overflow:"hidden",boxShadow:C.shadow}}>
            <div style={{padding:"12px 18px",borderBottom:`1px solid ${C.border2}`,fontWeight:700,fontSize:13,color:C.text}}>Informations</div>
            <div style={{padding:"4px 18px"}}>
              <InfoRow label="Type de demande" value={t.label}/>
              <InfoRow label="Priorité" value={item.priority?.charAt(0).toUpperCase()+item.priority?.slice(1)}/>
              <InfoRow label="Site concerné" value={item.site}/>
              <InfoRow label="Projet lié" value={item.project}/>
              <InfoRow label="Date de soumission" value={fD(item.submittedAt)}/>
              <InfoRow label="Dernière action" value={fDT(item.lastActionAt)}/>
            </div>
          </div>

          {/* Bénéficiaire */}
          {item.beneficiaryName&&(
            <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.border}`,overflow:"hidden",boxShadow:C.shadow}}>
              <div style={{padding:"12px 18px",borderBottom:`1px solid ${C.border2}`,fontWeight:700,fontSize:13,color:C.text}}>Informations bénéficiaire</div>
              <div style={{padding:"4px 18px"}}>
                <InfoRow label="Nom" value={item.beneficiaryName}/>
                <InfoRow label="Banque" value={item.beneficiaryBank}/>
                <InfoRow label="Numéro de compte" value={item.beneficiaryAccount} mono/>
                <InfoRow label="Mobile Money" value={item.beneficiaryMobile}/>
                <InfoRow label="Email" value={item.beneficiaryEmail}/>
              </div>
            </div>
          )}
        </div>

        {/* COLONNE DROITE */}
        <div style={{display:"flex",flexDirection:"column",gap:16}}>

          {/* Actions */}
          {!["paid","rejected"].includes(item.status)&&(
            <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.border}`,boxShadow:C.shadow,overflow:"hidden"}}>
              <div style={{padding:"12px 18px",borderBottom:`1px solid ${C.border2}`,fontWeight:700,fontSize:13,color:C.text}}>Votre décision</div>
              <div style={{padding:16}}>
                <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={3} placeholder="Commentaire (facultatif)..."
                  style={{width:"100%",padding:"9px 12px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical",boxSizing:"border-box",marginBottom:12,color:C.text,background:C.bg}}/>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {item.status==="draft"&&<Btn label="Soumettre pour approbation" onClick={()=>doAction("submit")} disabled={acting} icon="send" full color={C.blue}/>}
                  {item.status==="pending"&&!done&&cur&&(
                    <Btn label={"Approuver — "+(APPROVERS[cur]?.label||cur)} onClick={()=>doAction("approve")} disabled={acting} icon="check" full color={APPROVERS[cur]?.color||C.green}/>
                  )}
                  {(done||item.status==="approved")&&item.status!=="paid"&&(
                    <Btn label="Confirmer le paiement" onClick={()=>doAction("pay")} disabled={acting} icon="bank" full color={C.green}/>
                  )}
                  {item.status==="pending"&&!done&&(
                    <Btn label="Rejeter la demande" onClick={()=>doAction("reject")} disabled={acting} icon="x" full ghost danger/>
                  )}
                </div>
              </div>
            </div>
          )}
          {["paid","rejected"].includes(item.status)&&(
            <div style={{padding:"14px 18px",borderRadius:8,border:`1px solid ${item.status==="paid"?C.green:C.red}`,background:item.status==="paid"?"#D1FAE5":"#FEE2E2",textAlign:"center",fontSize:13,fontWeight:700,color:item.status==="paid"?C.green:C.red}}>
              {item.status==="paid"?"Demande clôturée et payée":"Demande rejetée"}
            </div>
          )}

          {/* Historique */}
          <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.border}`,boxShadow:C.shadow,overflow:"hidden"}}>
            <div style={{padding:"12px 18px",borderBottom:`1px solid ${C.border2}`,fontWeight:700,fontSize:13,color:C.text}}>Historique du workflow</div>
            <div style={{padding:"8px 18px"}}>
              {(item.history||[]).length===0&&<div style={{padding:"20px 0",textAlign:"center",color:C.text4,fontSize:13}}>Aucune action enregistrée</div>}
              {(item.history||[]).map((h,i)=>(
                <div key={i} style={{display:"flex",gap:12,paddingBottom:16}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:C.green,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <Icon d={ICONS.check} size={13} color="#fff" stroke={2.5}/>
                    </div>
                    {i<(item.history||[]).length-1&&<div style={{width:1,flex:1,minHeight:16,background:C.border,margin:"4px 0"}}/>}
                  </div>
                  <div style={{flex:1,paddingTop:4}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.text}}>{h.action}</div>
                    <div style={{fontSize:11,color:C.text3,marginTop:2}}>par {h.by} · {fDT(h.at)}</div>
                    {h.comment&&<div style={{fontSize:12,color:C.text2,marginTop:6,padding:"6px 10px",background:C.bg,borderRadius:4,borderLeft:`3px solid ${C.border}`,fontStyle:"italic"}}>{h.comment}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MODAL NOUVELLE DEMANDE ───────────────────────────────────
const NewRequestModal = ({onClose,onSave}) => {
  const [step,setStep]=useState(1);
  const [type,setType]=useState("");
  const [form,setForm]=useState({title:"",amount:"",currency:"FCFA",priority:"normale",justification:"",site:"",project:"",beneficiaryName:"",beneficiaryBank:"",beneficiaryAccount:"",beneficiaryMobile:"",beneficiaryEmail:"",dateDebut:"",dateFin:"",destination:"",transportMode:""});
  const [saving,setSaving]=useState(false);
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  const t=TYPES.find(tt=>tt.id===type);
  const lvls=type?getLevels(type,Number(form.amount)||0):[];
  const needsAmount=["payment_request","purchase_request","expense_report","advance_request","mission_request"].includes(type);
  const needsBenef=["payment_request","purchase_request","advance_request","mission_request"].includes(type);
  const needsDates=["leave_request","mission_request","training_request"].includes(type);
  const withSite=["payment_request","purchase_request","mission_request","equipment_request"].includes(type);

  const Inp=({label,k,tp="text",ph="",req=false})=>(
    <div style={{marginBottom:14}}>
      <label style={{display:"block",fontSize:11,fontWeight:600,color:C.text2,marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>{label}{req&&<span style={{color:C.red}}> *</span>}</label>
      <input type={tp} value={form[k]} onChange={e=>upd(k,e.target.value)} placeholder={ph}
        style={{width:"100%",padding:"9px 12px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box",color:C.text,background:C.white}}/>
    </div>
  );
  const Sel=({label,k,opts,req=false})=>(
    <div style={{marginBottom:14}}>
      <label style={{display:"block",fontSize:11,fontWeight:600,color:C.text2,marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>{label}{req&&<span style={{color:C.red}}> *</span>}</label>
      <select value={form[k]} onChange={e=>upd(k,e.target.value)} style={{width:"100%",padding:"9px 12px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",outline:"none",background:C.white,color:C.text}}>
        <option value="">Sélectionner...</option>
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const save=(submit)=>{
    if(!type||!form.title){alert("Type et titre obligatoires");return;}
    setSaving(true);
    const item={id:"APV-"+Date.now(),reference:"APV-"+new Date().getFullYear()+"-"+String(Math.floor(Math.random()*900+100)),type,...form,amount:Number(form.amount)||0,status:submit?"pending":"draft",submittedBy:"Utilisateur connecté",submittedAt:new Date().toISOString(),lastActionAt:new Date().toISOString(),approvedBy:[],history:submit?[{action:"Soumis",by:"Utilisateur connecté",at:new Date().toISOString(),comment:""}]:[]};
    onSave(item);setSaving(false);onClose();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:C.white,borderRadius:12,width:"100%",maxWidth:580,maxHeight:"92vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.25)",fontFamily:"inherit"}}>
        {/* Header */}
        <div style={{background:t?.color||C.blue,padding:"18px 22px",borderRadius:"12px 12px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Étape {step}/3</div>
            <div style={{fontSize:16,fontWeight:700,color:"#fff"}}>{t?.label||"Nouvelle demande"}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{display:"flex",gap:3}}>{[1,2,3].map(s=><div key={s} style={{width:s<=step?20:7,height:7,borderRadius:4,background:s<=step?"#fff":"rgba(255,255,255,0.3)",transition:"width .2s"}}/>)}</div>
            <button onClick={onClose} style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Icon d={ICONS.x} size={14} color="#fff"/>
            </button>
          </div>
        </div>
        <div style={{padding:22}}>
          {/* STEP 1 */}
          {step===1&&(
            <div>
              <p style={{fontSize:13,color:C.text3,marginBottom:16,marginTop:0}}>Choisissez le type de demande à créer :</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
                {TYPES.map(td=>(
                  <div key={td.id} onClick={()=>setType(td.id)}
                    style={{padding:"12px 14px",borderRadius:8,border:`2px solid ${type===td.id?td.color:C.border}`,background:type===td.id?td.color+"08":C.white,cursor:"pointer",transition:"all .15s",display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:32,height:32,borderRadius:7,background:td.color+"15",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <Icon d={ICONS[td.iconKey]} size={16} color={td.color}/>
                    </div>
                    <div>
                      <div style={{fontSize:12,fontWeight:type===td.id?700:500,color:type===td.id?td.color:C.text}}>{td.label}</div>
                      <div style={{fontSize:10,color:C.text4}}>{td.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              {type&&lvls.length>0&&(
                <div style={{padding:"10px 14px",background:"#EFF6FF",borderRadius:6,border:"1px solid #BFDBFE",marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.blue,marginBottom:6}}>Workflow requis :</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {lvls.map((l,i)=>{const inf=APPROVERS[l]||{label:l,color:C.blue};return <span key={l} style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:10,background:inf.color+"15",color:inf.color}}>{i+1}. {inf.label}</span>;})}
                  </div>
                </div>
              )}
              <div style={{display:"flex",justifyContent:"flex-end",paddingTop:14,borderTop:`1px solid ${C.border2}`}}>
                <Btn label="Suivant" onClick={()=>type&&setStep(2)} disabled={!type} color={t?.color||C.blue}/>
              </div>
            </div>
          )}
          {/* STEP 2 */}
          {step===2&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
                <div style={{gridColumn:"1/-1"}}><Inp label="Titre de la demande" k="title" ph={t?.label} req/></div>
                <Sel label="Priorité" k="priority" opts={["haute","normale","basse"]}/>
                {needsAmount&&<Inp label="Montant" k="amount" tp="number" ph="0" req/>}
                {needsAmount&&<Sel label="Devise" k="currency" opts={["FCFA","USD","EUR","CNY"]}/>}
                {needsDates&&<><Inp label="Date début" k="dateDebut" tp="date"/><Inp label="Date fin" k="dateFin" tp="date"/></>}
                {type==="mission_request"&&<><Inp label="Destination" k="destination" ph="Ex: Garoua — GAR-001"/><Sel label="Transport" k="transportMode" opts={["Véhicule société","Avion","Bus","Taxi","Véhicule personnel"]}/></>}
                {withSite&&<><Sel label="Site" k="site" opts={["DLA-001","DLA-003","YDE-001","KRI-001","GAR-001","LIM-001","Bureau principal"]}/><Inp label="Projet" k="project" ph="PROJ-2025-001"/></>}
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"block",fontSize:11,fontWeight:600,color:C.text2,marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>Justification <span style={{color:C.red}}>*</span></label>
                  <textarea value={form.justification} onChange={e=>upd("justification",e.target.value)} rows={3} placeholder="Décrivez la raison et le contexte de cette demande..."
                    style={{width:"100%",padding:"9px 12px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical",boxSizing:"border-box",color:C.text,background:C.white}}/>
                </div>
              </div>
              {needsAmount&&Number(form.amount)>0&&<div style={{marginTop:4}}><BudgetCheck amount={Number(form.amount)}/></div>}
              <div style={{display:"flex",justifyContent:"space-between",paddingTop:14,borderTop:`1px solid ${C.border2}`,marginTop:12}}>
                <Btn label="Retour" onClick={()=>setStep(1)} ghost color={C.text3}/>
                <Btn label="Suivant" onClick={()=>setStep(3)} color={t?.color||C.blue}/>
              </div>
            </div>
          )}
          {/* STEP 3 */}
          {step===3&&(
            <div>
              {needsBenef&&(
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:12,textTransform:"uppercase",letterSpacing:.5}}>Informations bénéficiaire</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
                    <Inp label="Nom complet" k="beneficiaryName" ph="Prénom Nom" req/>
                    <Inp label="Email" k="beneficiaryEmail" tp="email" ph="email@exemple.cm"/>
                    <Sel label="Banque" k="beneficiaryBank" opts={["BICEC","Société Générale Cameroun","Afriland First Bank","UBA Cameroun","Ecobank","BGFI Bank"]}/>
                    <Inp label="Numéro de compte" k="beneficiaryAccount" ph="CM21 XXXX XXXX XXXX"/>
                    <Inp label="Mobile Money" k="beneficiaryMobile" ph="6XX XXX XXX"/>
                  </div>
                </div>
              )}
              <div style={{background:C.bg,borderRadius:8,padding:14,marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:10}}>Récapitulatif</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[{l:"Type",v:t?.label},{l:"Titre",v:form.title||"—"},{l:"Priorité",v:form.priority},{l:"Montant",v:needsAmount?fN(Number(form.amount)||0)+" "+form.currency:null},{l:"Bénéficiaire",v:form.beneficiaryName||null}].filter(i=>i.v).map(i=>(
                    <div key={i.l}><div style={{fontSize:10,color:C.text4,textTransform:"uppercase",letterSpacing:.4,marginBottom:2}}>{i.l}</div><div style={{fontSize:13,fontWeight:500,color:C.text}}>{i.v}</div></div>
                  ))}
                </div>
              </div>
              <div style={{padding:"10px 14px",background:"#EFF6FF",borderRadius:6,border:"1px solid #BFDBFE",marginBottom:14,fontSize:12,color:C.blue}}>
                Workflow : <strong>{lvls.map(l=>APPROVERS[l]?.label||l).join(" → ")}</strong>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",paddingTop:14,borderTop:`1px solid ${C.border2}`}}>
                <Btn label="Retour" onClick={()=>setStep(2)} ghost color={C.text3}/>
                <div style={{display:"flex",gap:8}}>
                  <Btn label="Brouillon" onClick={()=>save(false)} disabled={saving} ghost color={C.blue} icon="edit"/>
                  <Btn label={saving?"Envoi...":"Soumettre"} onClick={()=>save(true)} disabled={saving} color={t?.color||C.blue} icon="send"/>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── PAGE LISTE ───────────────────────────────────────────────
const ListPage = ({items,onAdd}) => {
  const navigate = useNavigate();
  const [tab,setTab]=useState("all");
  const [view,setView]=useState("list");
  const [search,setSearch]=useState("");
  const [filterType,setFilterType]=useState("");
  const [showNew,setShowNew]=useState(false);

  const pending=items.filter(i=>i.status==="pending"&&!getWF(i).done);
  const approved=items.filter(i=>i.status==="approved"||getWF(i).done);
  const escalated=items.filter(i=>{const e=getEsc(i);return e&&e.urgent;});

  const filtered=items.filter(i=>{
    const ms=!search||i.title.toLowerCase().includes(search.toLowerCase())||i.reference.toLowerCase().includes(search.toLowerCase())||i.submittedBy.toLowerCase().includes(search.toLowerCase());
    const mt=!filterType||i.type===filterType;
    const tf=tab==="pending"?pending.includes(i):tab==="approved"?approved.includes(i):tab==="escalated"?escalated.includes(i):true;
    return ms&&mt&&tf;
  });

  const TABS=[
    {id:"all",label:"Toutes",n:items.length},
    {id:"pending",label:"En attente",n:pending.length},
    {id:"approved",label:"Approuvées",n:approved.length},
    {id:"escalated",label:"Escalade",n:escalated.length,warn:true},
    {id:"matrix",label:"Matrice",n:null},
  ];

  const getCol=item=>{
    if(item.status==="draft") return "draft";
    if(item.status==="paid") return "paid";
    if(item.status==="rejected") return "rejected";
    const {done}=getWF(item); if(done||item.status==="approved") return "approved";
    const e=getEsc(item); return e&&e.urgent?"escalade":"pending";
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Inter','Segoe UI',Arial,sans-serif"}}>
      {/* HEADER */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"0 28px"}}>
        <div style={{maxWidth:1300,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 0 12px"}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:42,height:42,borderRadius:10,background:"linear-gradient(135deg,#0066CC,#5C2D91)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Icon d={ICONS.check} size={22} color="#fff" stroke={2.5}/>
              </div>
              <div>
                <h1 style={{fontSize:18,fontWeight:800,color:C.text,margin:0}}>Approvals</h1>
                <p style={{color:C.text3,margin:0,fontSize:12}}>Workflow multi-niveaux · Matrice configurable · Connecté CleanITBooks</p>
              </div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <div style={{display:"flex",background:C.bg,borderRadius:6,padding:2,border:`1px solid ${C.border}`}}>
                {[{v:"list",icon:"list"},{v:"kanban",icon:"grid"}].map(vt=>(
                  <button key={vt.v} onClick={()=>setView(vt.v)} style={{width:30,height:28,borderRadius:4,border:"none",background:view===vt.v?C.white:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:view===vt.v?C.shadow:"none",transition:"all .15s"}}>
                    <Icon d={ICONS[vt.icon]} size={14} color={view===vt.v?C.blue:C.text4}/>
                  </button>
                ))}
              </div>
              <Btn label="Nouvelle demande" onClick={()=>setShowNew(true)} color={C.blue} icon="plus"/>
            </div>
          </div>
          {/* TABS */}
          <div style={{display:"flex",gap:0}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)}
                style={{padding:"10px 16px",border:"none",borderBottom:`2px solid ${tab===t.id?C.blue:"transparent"}`,background:"transparent",color:tab===t.id?C.blue:C.text3,fontWeight:tab===t.id?700:400,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontFamily:"inherit",transition:"all .1s"}}>
                {t.label}
                {t.n>0&&<span style={{padding:"1px 7px",borderRadius:10,fontSize:11,fontWeight:700,background:tab===t.id?C.blue+"18":C.bg2,color:tab===t.id?C.blue:C.text3}}>{t.n}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1300,margin:"0 auto",padding:"20px 28px"}}>
        {/* KPIs */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:12,marginBottom:20}}>
          {[
            {l:"Total",v:items.length,c:C.blue,icon:"list"},
            {l:"En attente",v:pending.length,c:C.orange,icon:"clock"},
            {l:"Approuvées",v:approved.length,c:C.green,icon:"check"},
            {l:"Escalades",v:escalated.length,c:C.red,icon:"alert"},
            {l:"Montant soumis",v:fN(items.reduce((s,i)=>s+i.amount,0))+" F",c:C.purple,icon:"bank"},
            {l:"Montant approuvé",v:fN(approved.reduce((s,i)=>s+i.amount,0))+" F",c:C.green,icon:"bank"},
          ].map(k=>(
            <div key={k.l} style={{background:C.white,borderRadius:8,padding:"12px 14px",border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:10,color:C.text3,textTransform:"uppercase",letterSpacing:.5,fontWeight:600}}>{k.l}</span>
                <div style={{width:26,height:26,borderRadius:6,background:k.c+"14",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Icon d={ICONS[k.icon]} size={13} color={k.c}/>
                </div>
              </div>
              <div style={{fontSize:typeof k.v==="string"?11:20,fontWeight:800,color:k.c,lineHeight:1}}>{k.v}</div>
            </div>
          ))}
        </div>

        {tab==="matrix"&&<MatriceView matrix={MATRIX}/>}
        {tab!=="matrix"&&<>{/* ALERTE ESCALADE */}<
        {escalated.length>0&&(
          <div style={{background:"#FEF2F2",borderRadius:8,padding:"12px 16px",border:`1px solid #FECACA`,marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Icon d={ICONS.alert} size={18} color={C.red}/>
              <span style={{fontSize:13,fontWeight:700,color:C.red}}>{escalated.length} demande{escalated.length>1?"s":""} en escalade — délai dépassé</span>
            </div>
            <Btn label="Voir" onClick={()=>setTab("escalated")} ghost color={C.red} sm/>
          </div>
        )}

        {/* FILTRES */}
        <div style={{display:"flex",gap:10,marginBottom:16}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:8,background:C.white,borderRadius:6,padding:"8px 12px",border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
            <Icon d={ICONS.search} size={15} color={C.text4}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par titre, référence, nom..."
              style={{flex:1,border:"none",outline:"none",fontSize:13,color:C.text,background:"transparent",fontFamily:"inherit"}}/>
          </div>
          <div style={{position:"relative",display:"flex",alignItems:"center",gap:8,background:C.white,borderRadius:6,padding:"8px 12px",border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
            <Icon d={ICONS.filter} size={14} color={C.text3}/>
            <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{border:"none",outline:"none",fontSize:13,color:C.text,background:"transparent",fontFamily:"inherit",cursor:"pointer"}}>
              <option value="">Tous les types</option>
              {TYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <Btn label="Exporter" ghost color={C.text3} sm icon="download"/>
        </div>

        {/* VUE KANBAN */}
        {view==="kanban"&&(
          <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:8}}>
            {[{key:"draft",label:"Brouillon",c:"#9CA3AF"},{key:"pending",label:"En attente",c:C.orange},{key:"escalade",label:"Escalade",c:C.red},{key:"approved",label:"Approuvé",c:C.green},{key:"paid",label:"Payé",c:C.green},{key:"rejected",label:"Rejeté",c:C.red}].map(col=>{
              const colItems=filtered.filter(i=>getCol(i)===col.key);
              return (
                <div key={col.key} style={{minWidth:220,flex:"0 0 220px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:col.c}}/>
                      <span style={{fontSize:12,fontWeight:700,color:C.text}}>{col.label}</span>
                    </div>
                    <span style={{fontSize:11,fontWeight:700,padding:"1px 7px",borderRadius:10,background:col.c+"15",color:col.c}}>{colItems.length}</span>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {colItems.map(item=>{
                      const tp=getType(item.type);
                      return (
                        <div key={item.id} onClick={()=>navigate("/approvals/"+item.id)}
                          style={{padding:"12px 14px",background:C.white,borderRadius:8,border:`1px solid ${C.border}`,cursor:"pointer",borderLeft:`3px solid ${tp.color}`,boxShadow:C.shadow,transition:"all .15s"}}
                          onMouseEnter={e=>{e.currentTarget.style.boxShadow=C.shadow2;e.currentTarget.style.transform="translateY(-1px)"}}
                          onMouseLeave={e=>{e.currentTarget.style.boxShadow=C.shadow;e.currentTarget.style.transform="none"}}>
                          <div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:6,lineHeight:1.4}}>{item.title.slice(0,50)}{item.title.length>50?"...":""}</div>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <span style={{fontSize:11,color:C.text3}}>{item.submittedBy}</span>
                            {item.amount>0&&<span style={{fontSize:11,fontWeight:700,color:tp.color}}>{fN(item.amount)} F</span>}
                          </div>
                          <div style={{marginTop:8}}><WorkflowSteps item={item} compact/></div>
                        </div>
                      );
                    })}
                    {colItems.length===0&&<div style={{padding:16,textAlign:"center",color:C.text4,fontSize:12,background:C.bg2,borderRadius:8,border:`1px dashed ${C.border}`}}>Vide</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VUE LISTE */}
        {view==="list"&&(
          <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.border}`,overflow:"hidden",boxShadow:C.shadow}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:C.bg,borderBottom:`1px solid ${C.border}`}}>
                  {["Demande","Type","Soumis par","Montant","Progression","Escalade","Statut",""].map(h=>(
                    <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.6,whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item,idx)=>{
                  const tp=getType(item.type);
                  const {lvls,app}=getWF(item);
                  const e=getEsc(item);
                  const avColor=[C.blue,C.green,C.purple,C.orange,C.red][item.submittedBy?.charCodeAt(0)%5]||C.blue;
                  return (
                    <tr key={item.id}
                      onClick={()=>navigate("/approvals/"+item.id)}
                      style={{borderBottom:`1px solid ${C.border2}`,cursor:"pointer",transition:"background .1s"}}
                      onMouseEnter={e2=>{e2.currentTarget.style.background="#F8F9FE"}}
                      onMouseLeave={e2=>{e2.currentTarget.style.background=C.white}}>
                      <td style={{padding:"12px 14px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:32,height:32,borderRadius:7,background:tp.color+"14",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            <Icon d={ICONS[tp.iconKey]} size={15} color={tp.color}/>
                          </div>
                          <div>
                            <div style={{fontSize:13,fontWeight:600,color:C.text,maxWidth:220,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</div>
                            <div style={{fontSize:11,color:C.text4,fontFamily:"'Courier New',monospace"}}>{item.reference}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{padding:"12px 14px",fontSize:12,color:C.text2,whiteSpace:"nowrap"}}>{tp.label}</td>
                      <td style={{padding:"12px 14px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <Avatar name={item.submittedBy} size={24} color={avColor}/>
                          <span style={{fontSize:12,color:C.text2}}>{item.submittedBy}</span>
                        </div>
                      </td>
                      <td style={{padding:"12px 14px",fontSize:13,fontWeight:700,color:item.amount>0?tp.color:C.text4,whiteSpace:"nowrap"}}>{item.amount>0?fN(item.amount)+" F":"—"}</td>
                      <td style={{padding:"12px 14px"}}>
                        <div style={{fontSize:11,color:C.text3,marginBottom:4}}>{app.length}/{lvls.length} niveaux</div>
                        <div style={{width:80,height:4,background:C.bg2,borderRadius:2,overflow:"hidden"}}>
                          <div style={{width:(lvls.length>0?app.length/lvls.length*100:0)+"%",height:"100%",background:C.blue,borderRadius:2,transition:"width .3s"}}/>
                        </div>
                      </td>
                      <td style={{padding:"12px 14px"}}>
                        {e&&e.urgent
                          ? <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:10,background:e.overdue?C.red+"18":C.orange+"18",color:e.overdue?C.red:C.orange}}>{e.overdue?"Dépassé":e.remaining+"h"}</span>
                          : <span style={{color:C.text4,fontSize:12}}>—</span>
                        }
                      </td>
                      <td style={{padding:"12px 14px"}}><StatusBadge item={item}/></td>
                      <td style={{padding:"12px 14px"}}>
                        <div style={{display:"flex",alignItems:"center",color:C.blue}}>
                          <Icon d={ICONS.chevron} size={16} color={C.blue}/>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length===0&&(
              <div style={{padding:60,textAlign:"center",color:C.text4}}>
                <Icon d={ICONS.list} size={40} color={C.border}/>
                <div style={{fontSize:15,fontWeight:700,marginTop:12,marginBottom:4,color:C.text3}}>Aucune demande</div>
                <div style={{fontSize:13}}>Créez une nouvelle demande ou modifiez les filtres</div>
              </div>
            )}
          </div>
        )}
      </div>
      </>
      }{showNew&&<NewRequestModal onClose={()=>setShowNew(false)} onSave={onAdd}/>}
    </div>
  );
};

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────
export default function Approvals() {
  const {id} = useParams();
  const [items,setItems] = useState(SEED);
  const updateItem = u => setItems(p=>p.map(i=>i.id===u.id?u:i));
  const addItem = item => setItems(p=>[item,...p]);

  if(id) return <DetailPage items={items} onUpdate={updateItem}/>;
  return <ListPage items={items} onAdd={addItem}/>;
}
