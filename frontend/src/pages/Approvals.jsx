import { useState, useEffect, useCallback } from "react";
import { getBalance, createBill } from "../services/cleanitbooks.api";

// ═══ FORMATTERS ═══
const fmtN = n => new Intl.NumberFormat("fr-FR").format(Math.round(n||0));
const fmtD = d => d ? new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const fmtDT = d => d ? new Date(d).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"}) : "—";
const hoursAgo = d => Math.round((Date.now()-new Date(d))/(1000*3600));

// ═══ TYPES DE DEMANDES ═══
const TYPES = [
  {id:"payment_request",  label:"Demande de paiement",  color:"#0078d4",icon:"💳",desc:"Paiement fournisseur ou prestataire"},
  {id:"purchase_request", label:"Demande d'achat",     color:"#ca5010",icon:"🛒",desc:"Achat matériel ou équipement"},
  {id:"expense_report",   label:"Note de frais",         color:"#d13438",icon:"🧾",desc:"Remboursement frais professionnels"},
  {id:"leave_request",    label:"Demande de congé",      color:"#107c10",icon:"🏖",desc:"Congé annuel ou exceptionnel"},
  {id:"advance_request",  label:"Avance sur salaire",    color:"#5c2d91",icon:"💰",desc:"Avance sur salaire mensuel"},
  {id:"mission_request",  label:"Ordre de mission",      color:"#008575",icon:"✈️",desc:"Déplacement professionnel"},
  {id:"training_request", label:"Demande de formation",  color:"#8764b8",icon:"📚",desc:"Formation ou certification"},
  {id:"equipment_request",label:"Demande matériel",      color:"#004e8c",icon:"🔧",desc:"Attribution équipement terrain"},
];
const getType = id => TYPES.find(t=>t.id===id)||TYPES[0];

// ═══ APPROBATEURS ═══
const APPROVERS_INFO = {
  manager:  {label:"Responsable direct",   icon:"👤",color:"#0078d4"},
  finance1: {label:"Finance N1",            icon:"💰",color:"#107c10"},
  finance2: {label:"Finance N2",            icon:"💎",color:"#5c2d91"},
  rh:       {label:"Ressources Humaines",   icon:"👥",color:"#ca5010"},
  cfo:      {label:"Directeur Financier",   icon:"🏦",color:"#8764b8"},
  dg:       {label:"Directeur Général",     icon:"🎯",color:"#d13438"},
};

// ═══ MATRICE D'APPROBATION ═══
const DEFAULT_MATRIX = {
  payment_request: [
    {maxAmount:500000,   levels:["manager","dg"]},
    {maxAmount:5000000,  levels:["manager","finance1","dg"]},
    {maxAmount:20000000, levels:["manager","finance1","finance2","dg"]},
    {maxAmount:Infinity, levels:["manager","finance1","finance2","cfo","dg"]},
  ],
  purchase_request: [
    {maxAmount:1000000,  levels:["manager","finance1","dg"]},
    {maxAmount:Infinity, levels:["manager","finance1","finance2","dg"]},
  ],
  expense_report:   [{maxAmount:Infinity, levels:["manager","finance1"]}],
  leave_request:    [{maxAmount:Infinity, levels:["manager","rh"]}],
  advance_request:  [{maxAmount:Infinity, levels:["manager","finance1","dg"]}],
  mission_request:  [{maxAmount:Infinity, levels:["manager","finance1","dg"]}],
  training_request: [{maxAmount:Infinity, levels:["manager","rh","dg"]}],
  equipment_request:[{maxAmount:Infinity, levels:["manager","finance1","dg"]}],
};

const getRequiredLevels = (type, amount, matrix) => {
  const m = matrix||DEFAULT_MATRIX;
  const rules = m[type]||[{maxAmount:Infinity,levels:["manager","dg"]}];
  const rule = rules.find(r=>amount<=r.maxAmount)||rules[rules.length-1];
  return rule.levels;
};

const getWorkflowStatus = (item, matrix) => {
  const levels = getRequiredLevels(item.type, item.amount, matrix);
  const approved = (item.approvedBy||[]);
  const currentIdx = approved.length;
  const currentLevel = levels[currentIdx]||null;
  const isDone = approved.length>=levels.length;
  return {levels, approved, currentLevel, currentIdx, isDone, totalSteps:levels.length};
};

// ═══ ESCALADE ═══
const ESCALATION_HOURS = {manager:24, finance1:48, finance2:48, rh:24, cfo:72, dg:96};

const getEscalation = (item, matrix) => {
  if(!item.submittedAt) return null;
  const {currentLevel} = getWorkflowStatus(item, matrix);
  if(!currentLevel) return null;
  const maxH = ESCALATION_HOURS[currentLevel]||48;
  const elapsed = hoursAgo(item.lastActionAt||item.submittedAt);
  const pct = Math.min(100, Math.round(elapsed/maxH*100));
  const remaining = Math.max(0, maxH-elapsed);
  return {elapsed, maxH, pct, remaining, urgent: pct>=80, overdue: pct>=100};
};

// ═══ SEED DATA ═══
const SEED = [
  {id:"1",reference:"APV-2025-001",type:"payment_request",title:"Paiement sous-traitant Thomas Ngono — DLA-001 Phase 2",amount:18000000,currency:"FCFA",status:"pending",priority:"haute",submittedBy:"Marie Kamga",submittedAt:"2025-05-12T09:00:00",lastActionAt:"2025-05-12T09:00:00",beneficiaryName:"Thomas Ngono",beneficiaryBank:"BICEC",beneficiaryAccount:"CM21 1001 2345 6789",justification:"Paiement phase 2 projet DLA-001 (40%). Travaux validés par le chef de projet.",site:"DLA-001",project:"PROJ-2025-001",approvedBy:["manager","finance1"],history:[{action:"Soumis",by:"Marie Kamga",at:"2025-05-12T09:00:00",comment:""},{action:"Approuvé Responsable",by:"Alice Finance",at:"2025-05-12T14:00:00",comment:"Budget disponible"},{action:"Approuvé Finance N1",by:"Bob Finance",at:"2025-05-13T10:00:00",comment:"Conforme"}]},
  {id:"2",reference:"APV-2025-002",type:"purchase_request",title:"Achat câbles fibre optique — Site YDE-001",amount:3500000,currency:"FCFA",status:"pending",priority:"normale",submittedBy:"Pierre Etoga",submittedAt:"2025-05-13T11:00:00",lastActionAt:"2025-05-13T11:00:00",beneficiaryName:"Tech Africa",beneficiaryBank:"SGC",beneficiaryAccount:"CM21 2001 9876 5432",justification:"Câbles requis pour finalisation réseau fibre YDE-001.",site:"YDE-001",project:"PROJ-2025-002",approvedBy:["manager"],history:[{action:"Soumis",by:"Pierre Etoga",at:"2025-05-13T11:00:00",comment:""},{action:"Approuvé Responsable",by:"Marie Kamga",at:"2025-05-13T14:00:00",comment:""}]},
  {id:"3",reference:"APV-2025-003",type:"expense_report",title:"Note de frais mission Garoua — Ali Moussa",amount:285000,currency:"FCFA",status:"paid",priority:"basse",submittedBy:"Ali Moussa",submittedAt:"2025-05-10T08:00:00",lastActionAt:"2025-05-11T09:00:00",beneficiaryName:"Ali Moussa",beneficiaryBank:"Afriland",beneficiaryAccount:"CM21 3001 1111 2222",justification:"Per diem 3 jours + transport Douala-Garoua.",site:"",project:"",approvedBy:["manager","finance1"],history:[{action:"Soumis",by:"Ali Moussa",at:"2025-05-10T08:00:00",comment:""},{action:"Approuvé Responsable",by:"Marie Kamga",at:"2025-05-10T14:00:00",comment:""},{action:"Approuvé Finance N1",by:"Alice Finance",at:"2025-05-11T09:00:00",comment:""},{action:"Payé",by:"Alice Finance",at:"2025-05-11T15:00:00",comment:"Virement effectué"}]},
  {id:"4",reference:"APV-2025-004",type:"leave_request",title:"Congé annuel — Samuel Djomo — 15 jours",amount:0,currency:"FCFA",status:"pending",priority:"normale",submittedBy:"Samuel Djomo",submittedAt:"2025-05-14T10:00:00",lastActionAt:"2025-05-14T10:00:00",justification:"Congé annuel du 01/06/2025 au 15/06/2025.",site:"",project:"",approvedBy:[],history:[{action:"Soumis",by:"Samuel Djomo",at:"2025-05-14T10:00:00",comment:""}]},
  {id:"5",reference:"APV-2025-005",type:"mission_request",title:"Ordre de mission — Kribi Port — Thomas Ngono",amount:420000,currency:"FCFA",status:"approved",priority:"haute",submittedBy:"Marie Kamga",submittedAt:"2025-05-08T08:00:00",lastActionAt:"2025-05-10T08:00:00",beneficiaryName:"Thomas Ngono",beneficiaryBank:"MTN Money",beneficiaryAccount:"677000001",justification:"Mission technique KRI-001. Transport + hébergement 5 jours.",site:"KRI-001",project:"PROJ-2025-001",approvedBy:["manager","finance1","dg"],history:[{action:"Soumis",by:"Marie Kamga",at:"2025-05-08T08:00:00",comment:""},{action:"Approuvé Responsable",by:"Alice Finance",at:"2025-05-08T14:00:00",comment:""},{action:"Approuvé Finance N1",by:"Bob Finance",at:"2025-05-09T10:00:00",comment:""},{action:"Approuvé DG",by:"Jérôme Bell",at:"2025-05-10T08:00:00",comment:"OK mission validée"}]},
];

// ═══ STYLE ═══
const S = {
  white:"#ffffff", bg:"#f3f4f8", border:"#e8eaed", border2:"#f3f4f6",
  text:"#1f2937", text3:"#6b7280", text4:"#a19f9d",
  blue:"#0078d4", green:"#107c10", red:"#d13438", orange:"#ca5010", purple:"#5c2d91",
  shadow:"0 1px 3px rgba(0,0,0,0.08)",
};

// ═══ MINI COMPOSANTS ═══
const Avatar = ({name="?",size=36,color="#0078d4"}) => (
  <div style={{width:size,height:size,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:size*0.38,flexShrink:0}}>
    {name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
  </div>
);

const Badge = ({label,color,bg,dot}) => (
  <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 9px",borderRadius:10,background:bg||color+"15",color,fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>
    {dot&&<span style={{width:7,height:7,borderRadius:"50%",background:color,display:"inline-block"}}/>}
    {label}
  </span>
);

const Btn = ({label,onClick,color="#0078d4",ghost,icon,disabled,sm,full}) => (
  <button onClick={onClick} disabled={disabled}
    style={{padding:sm?"5px 12px":"8px 16px",borderRadius:4,border:ghost?`1px solid ${color}`:"none",background:ghost?"transparent":disabled?"#e8eaed":color,color:ghost?color:disabled?"#a19f9d":"white",fontWeight:600,fontSize:sm?12:13,cursor:disabled?"not-allowed":"pointer",display:"inline-flex",alignItems:"center",gap:6,opacity:disabled?.6:1,width:full?"100%":"auto",justifyContent:"center",fontFamily:"Segoe UI,Arial,sans-serif",transition:"opacity .15s"}}>
    {icon&&<span>{icon}</span>}{label}
  </button>
);

const StatusChip = ({item, matrix}) => {
  const {levels,approved,currentLevel,isDone} = getWorkflowStatus(item, matrix);
  if(item.status==="paid") return <Badge label="💳 Payé" color="#107c10" bg="#dff6dd"/>;
  if(item.status==="rejected") return <Badge label="✕ Rejeté" color="#d13438" bg="#fde7e9"/>;
  if(item.status==="draft") return <Badge label="✎ Brouillon" color="#a19f9d" bg="#f3f4f8"/>;
  if(isDone) return <Badge label="✅ Approuvé" color="#107c10" bg="#dff6dd"/>;
  const inf = APPROVERS_INFO[currentLevel]||{};
  return <Badge label={`⏳ ${inf.label||currentLevel}`} color={inf.color||"#ca5010"} bg={(inf.color||"#ca5010")+"15"}/>;
};

// ═══ TIMELINE WORKFLOW ═══
const WorkflowTimeline = ({item, matrix}) => {
  const {levels, approved, currentIdx, isDone} = getWorkflowStatus(item, matrix);
  return (
    <div style={{display:"flex",alignItems:"center",gap:0,flexWrap:"wrap",gap:4}}>
      {levels.map((lvl,i) => {
        const inf = APPROVERS_INFO[lvl]||{label:lvl,color:"#0078d4",icon:"👤"};
        const done = i < approved.length;
        const active = i === currentIdx && !isDone;
        const isLast = i === levels.length-1;
        return (
          <div key={lvl} style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:done?"#107c10":active?inf.color:"#e8eaed",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,border:active?`2px solid ${inf.color}`:"none",boxShadow:active?"0 0 0 3px "+inf.color+"25":"none",transition:"all .2s"}}>
                {done?"✓":inf.icon}
              </div>
              <div style={{fontSize:9,color:done?"#107c10":active?inf.color:"#a19f9d",fontWeight:done||active?700:400,textAlign:"center",maxWidth:60,lineHeight:1.2}}>{inf.label}</div>
            </div>
            {!isLast&&<div style={{width:20,height:2,background:done?"#107c10":"#e8eaed",marginBottom:14,flexShrink:0}}/>}
          </div>
        );
      })}
    </div>
  );
};

// ═══ BUDGET CHECKER ═══
const BudgetChecker = ({amount}) => {
  const [bal, setBal] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    getBalance().then(d=>{
      if(d&&d.rows){
        const bank = d.rows.filter(r=>r.classe==="5").reduce((s,r)=>s+Number(r.debit)-Number(r.credit),0);
        setBal(bank);
      }
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[]);
  if(loading) return <div style={{fontSize:12,color:"#a19f9d",padding:"8px 12px",background:"#f3f4f8",borderRadius:4}}>⏳ Vérification budget...</div>;
  if(bal===null) return null;
  const ok = bal>=amount;
  const pct = amount>0?Math.round(amount/bal*100):0;
  return (
    <div style={{padding:"12px 14px",borderRadius:4,border:`1px solid ${ok?"#b3d5f0":"#f9e4a1"}`,background:ok?"#deecf9":"#fff4ce",marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <span style={{fontSize:12,fontWeight:700,color:ok?"#004e8c":"#7a4100"}}>
          {ok?"✅ Budget disponible":"⚠️ Budget insuffisant"}
        </span>
        <span style={{fontSize:11,color:ok?"#004e8c":"#7a4100"}}>{pct}% de la trésorerie</span>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
        <span style={{color:"#4b5563"}}>Demande: <strong>{fmtN(amount)} FCFA</strong></span>
        <span style={{color:"#4b5563"}}>Trésorerie: <strong style={{color:ok?"#107c10":"#d13438"}}>{fmtN(bal)} FCFA</strong></span>
      </div>
      <div style={{marginTop:8,height:6,background:"#e8eaed",borderRadius:3,overflow:"hidden"}}>
        <div style={{width:Math.min(100,pct)+"%",height:"100%",background:ok?"#0078d4":"#d13438",borderRadius:3,transition:"width .4s"}}/>
      </div>
    </div>
  );
};

// ═══ AI RISK SCORE ═══
const AIRiskScore = ({item}) => {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const analyze = async () => {
    setLoading(true);
    try {
      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions",{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":"Bearer "+import.meta.env.VITE_GROQ_API_KEY},
        body:JSON.stringify({model:"llama-3.3-70b-versatile",max_tokens:120,messages:[{role:"user",content:`Analyse cette demande ERP et donne un score de risque de 1 à 10 (1=faible,10=critique) avec une recommandation courte en français.
Type: ${item.type}, Montant: ${item.amount} FCFA, Titre: ${item.title}, Justification: ${item.justification||"aucune"}.
Réponds UNIQUEMENT en JSON: {"score":X,"niveau":"faible|moyen|élevé","recommandation":"...max 80 chars"}`}]})
      });
      const d = await resp.json();
      const text = d.choices?.[0]?.message?.content||"{}";
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      setScore(parsed);
    } catch(e){ setScore({score:5,niveau:"moyen",recommandation:"Analyse indisponible"}); }
    setLoading(false);
  };
  const colors = {faible:"#107c10",moyen:"#ca5010",élevé:"#d13438"};
  return (
    <div style={{padding:"12px 14px",borderRadius:4,border:"1px solid #e8eaed",background:"#fafafa",marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:12,fontWeight:700,color:"#5c2d91"}}>🤖 Analyse IA (ChaCha)</span>
        {!score&&<Btn label={loading?"Analyse...":"Analyser"} onClick={analyze} disabled={loading} sm color="#5c2d91"/>}
      </div>
      {score&&(
        <div style={{marginTop:8}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
            <div style={{fontSize:22,fontWeight:800,color:colors[score.niveau]||"#ca5010"}}>{score.score}/10</div>
            <Badge label={`Risque ${score.niveau}`} color={colors[score.niveau]||"#ca5010"}/>
          </div>
          <div style={{fontSize:12,color:"#374151",fontStyle:"italic"}}>{score.recommandation}</div>
        </div>
      )}
    </div>
  );
};

// ═══ ESCALADE TIMER ═══
const EscaladeBar = ({item, matrix}) => {
  const esc = getEscalation(item, matrix);
  if(!esc) return null;
  const color = esc.overdue?"#d13438":esc.urgent?"#ca5010":"#0078d4";
  return (
    <div style={{padding:"8px 12px",borderRadius:4,border:`1px solid ${color}30`,background:color+"08",marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}>
        <span style={{fontWeight:700,color}}>{esc.overdue?"🔴 Délai dépassé":esc.urgent?"🟡 Délai critique":"🟢 En cours"}</span>
        <span style={{color}}>{esc.overdue?"Escalade auto":esc.remaining+"h restantes"}</span>
      </div>
      <div style={{height:4,background:"#e8eaed",borderRadius:2}}>
        <div style={{width:esc.pct+"%",height:"100%",background:color,borderRadius:2,transition:"width .3s"}}/>
      </div>
    </div>
  );
};

// ═══ MODAL NOUVELLE DEMANDE ═══
const NouvelleDemandeModal = ({onClose,onSave,matrix}) => {
  const [step,setStep] = useState(1);
  const [type,setType] = useState("");
  const [form,setForm] = useState({title:"",amount:"",currency:"FCFA",priority:"normale",justification:"",site:"",project:"",beneficiaryName:"",beneficiaryBank:"",beneficiaryAccount:"",beneficiaryMobile:"",beneficiaryEmail:"",dateDebut:"",dateFin:"",destination:"",transportMode:""});
  const [saving,setSaving] = useState(false);
  const upd = (k,v) => setForm(p=>({...p,[k]:v}));
  const t = TYPES.find(tt=>tt.id===type);
  const needsAmount = ["payment_request","purchase_request","expense_report","advance_request","mission_request"].includes(type);
  const needsBenef = ["payment_request","purchase_request","advance_request","mission_request"].includes(type);
  const needsDates = ["leave_request","mission_request","training_request"].includes(type);
  const withSite = t?.withSite||["payment_request","purchase_request","mission_request","equipment_request"].includes(type);
  const levels = type ? getRequiredLevels(type, Number(form.amount)||0, matrix) : [];

  const handleSave = async (submit) => {
    if(!type||!form.title){alert("Type et titre obligatoires");return;}
    setSaving(true);
    const item = {id:Date.now().toString(),reference:`APV-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900+100))}`,type,...form,amount:Number(form.amount)||0,status:submit?"pending":"draft",submittedBy:"Utilisateur connecté",submittedAt:new Date().toISOString(),lastActionAt:new Date().toISOString(),approvedBy:[],history:submit?[{action:"Soumis",by:"Utilisateur connecté",at:new Date().toISOString(),comment:""}]:[]};
    onSave(item);setSaving(false);onClose();
  };

  const inp = (label,k,type2="text",placeholder="",required=false) => (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:600,color:"#323130",marginBottom:4,textTransform:"uppercase",letterSpacing:.4}}>{label}{required&&<span style={{color:"#d13438"}}> *</span>}</div>
      <input type={type2} value={form[k]} onChange={e=>upd(k,e.target.value)} placeholder={placeholder}
        style={{width:"100%",padding:"8px 10px",borderRadius:4,border:"1px solid #e8eaed",fontSize:13,fontFamily:"Segoe UI,Arial,sans-serif",outline:"none",boxSizing:"border-box"}}/>
    </div>
  );
  const sel = (label,k,opts,required=false) => (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:600,color:"#323130",marginBottom:4,textTransform:"uppercase",letterSpacing:.4}}>{label}{required&&<span style={{color:"#d13438"}}> *</span>}</div>
      <select value={form[k]} onChange={e=>upd(k,e.target.value)}
        style={{width:"100%",padding:"8px 10px",borderRadius:4,border:"1px solid #e8eaed",fontSize:13,fontFamily:"Segoe UI,Arial,sans-serif",outline:"none",background:"white"}}>
        <option value="">Sélectionner...</option>
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"white",borderRadius:6,width:"100%",maxWidth:660,maxHeight:"92vh",overflow:"auto",boxShadow:"0 16px 48px rgba(0,0,0,0.22)",fontFamily:"Segoe UI,Arial,sans-serif"}}>
        <div style={{background:t?.color||"#0078d4",padding:"20px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>
              Étape {step}/3 — {step===1?"Type":step===2?"Détails":"Bénéficiaire"}
            </div>
            <div style={{fontSize:18,fontWeight:700,color:"white"}}>{t?.label||"Nouvelle demande"}</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{display:"flex",gap:4}}>{[1,2,3].map(s=><div key={s} style={{width:s<=step?20:8,height:8,borderRadius:4,background:s<=step?"white":"rgba(255,255,255,0.3)",transition:"width .2s"}}/>)}</div>
            <button onClick={onClose} style={{width:30,height:30,borderRadius:"50%",background:"rgba(255,255,255,0.2)",border:"none",color:"white",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          </div>
        </div>
        <div style={{padding:24}}>
          {step===1&&(
            <div>
              <p style={{fontSize:13,color:"#605e5c",marginBottom:16,marginTop:0}}>Sélectionnez le type de demande :</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
                {TYPES.map(td=>(
                  <div key={td.id} onClick={()=>setType(td.id)}
                    style={{padding:14,borderRadius:4,border:`2px solid ${type===td.id?td.color:"#e8eaed"}`,background:type===td.id?td.color+"08":"white",cursor:"pointer",transition:"all .1s",display:"flex",gap:10,alignItems:"center"}}>
                    <span style={{fontSize:22}}>{td.icon}</span>
                    <div>
                      <div style={{fontSize:13,fontWeight:type===td.id?700:500,color:type===td.id?td.color:"#1f2937"}}>{td.label}</div>
                      <div style={{fontSize:11,color:"#a19f9d",marginTop:1}}>{td.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              {type&&levels.length>0&&(
                <div style={{padding:"10px 14px",background:"#deecf9",borderRadius:4,border:"1px solid #b3d5f0",marginBottom:16}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#004e8c",marginBottom:6}}>Workflow d'approbation requis :</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {levels.map((lvl,i)=>{
                      const inf = APPROVERS_INFO[lvl]||{label:lvl,color:"#0078d4",icon:"👤"};
                      return <span key={lvl} style={{display:"flex",alignItems:"center",gap:4,fontSize:11,fontWeight:600,color:inf.color,padding:"3px 8px",background:inf.color+"15",borderRadius:10}}>{inf.icon} {i+1}. {inf.label}</span>;
                    })}
                  </div>
                </div>
              )}
              <div style={{display:"flex",justifyContent:"flex-end",paddingTop:16,borderTop:"1px solid #f3f4f6"}}>
                <Btn label="Suivant →" onClick={()=>type&&setStep(2)} disabled={!type} color={t?.color||"#0078d4"}/>
              </div>
            </div>
          )}
          {step===2&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
                <div style={{gridColumn:"1/-1"}}>{inp("Titre de la demande","title","text",t?.desc||"",true)}</div>
                <div>{sel("Priorité","priority",["haute","normale","basse"])}</div>
                {needsAmount&&<div>{inp("Montant","amount","number","0",true)}</div>}
                {needsAmount&&<div>{sel("Devise","currency",["FCFA","USD","EUR","CNY"])}</div>}
                {needsDates&&<><div>{inp("Date début","dateDebut","date")}</div><div>{inp("Date fin","dateFin","date")}</div></>}
                {type==="mission_request"&&<><div>{inp("Destination","destination","text","Ex: Garoua — GAR-001")}</div><div>{sel("Transport","transportMode",["Véhicule société","Avion","Bus","Taxi","Véhicule personnel"])}</div></>}
                {withSite&&<><div>{sel("Site concerné","site",["DLA-001","DLA-003","YDE-001","KRI-001","GAR-001","LIM-001","Bureau principal"])}</div><div>{inp("Projet lié","project","text","Ex: PROJ-2025-001")}</div></>}
                <div style={{gridColumn:"1/-1"}}>
                  <div style={{fontSize:11,fontWeight:600,color:"#323130",marginBottom:4,textTransform:"uppercase",letterSpacing:.4}}>Justification <span style={{color:"#d13438"}}>*</span></div>
                  <textarea value={form.justification} onChange={e=>upd("justification",e.target.value)} rows={4} placeholder="Expliquez la raison et le contexte..."
                    style={{width:"100%",padding:"8px 10px",borderRadius:4,border:"1px solid #e8eaed",fontSize:13,fontFamily:"Segoe UI,Arial,sans-serif",outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
                </div>
              </div>
              {needsAmount&&form.amount>0&&<BudgetChecker amount={Number(form.amount)}/>}
              <div style={{display:"flex",justifyContent:"space-between",paddingTop:16,borderTop:"1px solid #f3f4f6"}}>
                <Btn label="← Retour" onClick={()=>setStep(1)} ghost color="#605e5c"/>
                <Btn label="Suivant →" onClick={()=>setStep(3)} color={t?.color||"#0078d4"}/>
              </div>
            </div>
          )}
          {step===3&&(
            <div>
              {needsBenef&&(
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#323130",marginBottom:12,textTransform:"uppercase",letterSpacing:.5}}>Bénéficiaire</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
                    <div>{inp("Nom complet","beneficiaryName","text","Prénom Nom",true)}</div>
                    <div>{inp("Email","beneficiaryEmail","email","email@exemple.cm")}</div>
                    <div>{sel("Banque","beneficiaryBank",["BICEC","Société Générale Cameroun","Afriland First Bank","UBA Cameroun","Ecobank","BGFI Bank"])}</div>
                    <div>{inp("Numéro de compte","beneficiaryAccount","text","CM21 XXXX XXXX XXXX")}</div>
                    <div>{inp("Mobile Money","beneficiaryMobile","text","6XX XXX XXX")}</div>
                  </div>
                </div>
              )}
              <div style={{background:"#f3f4f8",borderRadius:4,padding:16,marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:700,color:"#323130",marginBottom:10}}>Récapitulatif</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[{l:"Type",v:t?.label},{l:"Titre",v:form.title||"—"},{l:"Priorité",v:form.priority},...(needsAmount?[{l:"Montant",v:`${fmtN(Number(form.amount)||0)} ${form.currency}`}]:[]),...(form.beneficiaryName?[{l:"Bénéficiaire",v:form.beneficiaryName}]:[])].map(item=>(
                    <div key={item.l}><div style={{fontSize:10,color:"#a19f9d",textTransform:"uppercase",letterSpacing:.4,marginBottom:1}}>{item.l}</div><div style={{fontSize:13,fontWeight:500}}>{item.v}</div></div>
                  ))}
                </div>
              </div>
              <div style={{padding:"10px 12px",background:"#deecf9",borderRadius:4,border:"1px solid #b3d5f0",marginBottom:16,fontSize:12,color:"#004e8c"}}>
                📧 Workflow: <strong>{levels.map(l=>APPROVERS_INFO[l]?.label||l).join(" → ")}</strong>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",paddingTop:16,borderTop:"1px solid #f3f4f6"}}>
                <Btn label="← Retour" onClick={()=>setStep(2)} ghost color="#605e5c"/>
                <div style={{display:"flex",gap:8}}>
                  <Btn label="💾 Brouillon" onClick={()=>handleSave(false)} disabled={saving} ghost color="#0078d4"/>
                  <Btn label={saving?"Envoi...":"📤 Soumettre"} onClick={()=>handleSave(true)} disabled={saving} color={t?.color||"#0078d4"}/>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══ DETAIL PANEL ═══
const DetailPanel = ({item,onClose,onUpdate,matrix}) => {
  const [comment,setComment] = useState("");
  const [acting,setActing] = useState(false);
  const t = getType(item.type);
  const {levels,approved,currentLevel,isDone} = getWorkflowStatus(item,matrix);
  const needsPayment = ["payment_request","purchase_request","advance_request","mission_request","expense_report"].includes(item.type);

  const doAction = async (action) => {
    setActing(true);
    let newApproved = [...(item.approvedBy||[])];
    let newStatus = item.status;
    let actionLabel = "";
    if(action==="approve"){
      newApproved.push(currentLevel);
      actionLabel = `Approuvé — ${APPROVERS_INFO[currentLevel]?.label||currentLevel}`;
      newStatus = newApproved.length>=levels.length?"approved":"pending";
    } else if(action==="reject"){
      newStatus="rejected"; actionLabel="Rejeté";
    } else if(action==="pay"){
      newStatus="paid"; actionLabel="Payé — Virement effectué";
    } else if(action==="submit"){
      newStatus="pending"; actionLabel="Soumis";
    }
    const updated = {...item,status:newStatus,approvedBy:newApproved,lastActionAt:new Date().toISOString(),history:[...(item.history||[]),{action:actionLabel,by:"Utilisateur connecté",at:new Date().toISOString(),comment}]};
    onUpdate(updated);setComment("");setActing(false);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"Segoe UI,Arial,sans-serif"}}>
      <div style={{background:"white",borderRadius:6,width:"100%",maxWidth:900,maxHeight:"93vh",overflow:"auto",boxShadow:"0 16px 48px rgba(0,0,0,0.22)"}}>
        <div style={{background:t.color,padding:"20px 28px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginBottom:4}}>{item.reference} · {t.label}</div>
              <div style={{fontSize:18,fontWeight:700,color:"white",marginBottom:4}}>{item.title}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.8)"}}>Soumis par <strong>{item.submittedBy}</strong> · {fmtDT(item.submittedAt)}</div>
            </div>
            <button onClick={onClose} style={{width:30,height:30,borderRadius:"50%",background:"rgba(255,255,255,0.2)",border:"none",color:"white",cursor:"pointer",fontSize:18}}>×</button>
          </div>
          <WorkflowTimeline item={item} matrix={matrix}/>
        </div>
        <div style={{padding:24,display:"grid",gridTemplateColumns:"1.1fr 1fr",gap:24}}>
          <div>
            {item.amount>0&&(
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",background:"#f3f4f8",borderRadius:4,marginBottom:16,border:"1px solid #e8eaed"}}>
                <div>
                  <div style={{fontSize:11,color:"#a19f9d",textTransform:"uppercase",letterSpacing:.5,marginBottom:2}}>Montant</div>
                  <div style={{fontSize:24,fontWeight:800,color:t.color}}>{fmtN(item.amount)} {item.currency}</div>
                </div>
                <span style={{fontSize:36}}>{t.icon}</span>
              </div>
            )}
            {needsPayment&&item.status==="pending"&&item.amount>0&&<BudgetChecker amount={item.amount}/>}
            <AIRiskScore item={item}/>
            <EscaladeBar item={item} matrix={matrix}/>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:"#a19f9d",textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Informations</div>
              {[{l:"Type",v:t.label},{l:"Priorité",v:item.priority},...(item.site?[{l:"Site",v:item.site}]:[]),...(item.project?[{l:"Projet",v:item.project}]:[])].map((info,i)=>(
                <div key={info.l} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:i%2?"white":"#fafafa",borderBottom:"1px solid #f3f4f6"}}>
                  <span style={{fontSize:12,color:"#a19f9d"}}>{info.l}</span>
                  <span style={{fontSize:12,fontWeight:600}}>{info.v}</span>
                </div>
              ))}
            </div>
            <div style={{padding:"12px 14px",background:"#fafafa",borderRadius:4,border:"1px solid #e8eaed",fontSize:13,color:"#374151",lineHeight:1.6,marginBottom:16}}>{item.justification||"—"}</div>
            {item.beneficiaryName&&(
              <div style={{border:"1px solid #e8eaed",borderRadius:4,overflow:"hidden"}}>
                {[{l:"Bénéficiaire",v:item.beneficiaryName},...(item.beneficiaryBank?[{l:"Banque",v:item.beneficiaryBank}]:[]),...(item.beneficiaryAccount?[{l:"Compte",v:item.beneficiaryAccount}]:[])].map((info,i)=>(
                  <div key={info.l} style={{display:"flex",justifyContent:"space-between",padding:"9px 12px",background:i%2?"#fafafa":"white",borderBottom:"1px solid #f3f4f6"}}>
                    <span style={{fontSize:12,color:"#a19f9d"}}>{info.l}</span>
                    <span style={{fontSize:12,fontWeight:600,fontFamily:info.l==="Compte"?"monospace":"inherit"}}>{info.v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:"#a19f9d",textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>Historique du workflow</div>
              {(item.history||[]).map((h,i)=>(
                <div key={i} style={{display:"flex",gap:12,marginBottom:12}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:"#0078d4",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:11,fontWeight:700}}>✓</div>
                    {i<(item.history||[]).length-1&&<div style={{width:1,flex:1,background:"#e8eaed",margin:"3px 0"}}/>}
                  </div>
                  <div style={{paddingBottom:12,flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:"#1f2937"}}>{h.action}</div>
                    <div style={{fontSize:11,color:"#a19f9d"}}>par {h.by} · {fmtDT(h.at)}</div>
                    {h.comment&&<div style={{fontSize:11,color:"#4b5563",fontStyle:"italic",marginTop:3,padding:"4px 8px",background:"#f3f4f8",borderRadius:3}}>"{h.comment}"</div>}
                  </div>
                </div>
              ))}
              {(!item.history||item.history.length===0)&&<div style={{padding:16,textAlign:"center",color:"#a19f9d",fontSize:13}}>Aucune action</div>}
            </div>
            <div style={{background:"#f3f4f8",borderRadius:4,padding:16,border:"1px solid #e8eaed"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#a19f9d",textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Votre décision</div>
              <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={2} placeholder="Commentaire (optionnel)..."
                style={{width:"100%",padding:"8px 10px",borderRadius:4,border:"1px solid #e8eaed",fontSize:12,fontFamily:"Segoe UI,Arial,sans-serif",outline:"none",resize:"vertical",boxSizing:"border-box",marginBottom:10}}/>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {item.status==="draft"&&<Btn label="📤 Soumettre" onClick={()=>doAction("submit")} disabled={acting} color="#0078d4"/>}
                {item.status==="pending"&&!isDone&&currentLevel&&(
                  <Btn label={`✅ Approuver (${APPROVERS_INFO[currentLevel]?.label||currentLevel})`} onClick={()=>doAction("approve")} disabled={acting} color={APPROVERS_INFO[currentLevel]?.color||"#107c10"}/>
                )}
                {(item.status==="approved"||isDone)&&item.status!=="paid"&&<Btn label="💳 Marquer payé" onClick={()=>doAction("pay")} disabled={acting} color="#107c10"/>}
                {["pending"].includes(item.status)&&!isDone&&<Btn label="✕ Rejeter" onClick={()=>doAction("reject")} disabled={acting} ghost color="#d13438"/>}
                {["approved","paid","rejected"].includes(item.status)&&(
                  <div style={{fontSize:13,color:"#a19f9d",fontStyle:"italic",padding:"6px 0"}}>
                    {item.status==="paid"?"✅ Clôturé et payé":item.status==="approved"?"⏳ En attente paiement":"❌ Rejeté"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══ VUE KANBAN ═══
const KanbanView = ({items,onSelect,matrix}) => {
  const cols = [
    {key:"draft",label:"Brouillon",color:"#a19f9d"},
    {key:"pending_early",label:"En cours",color:"#0078d4"},
    {key:"pending_late",label:"Escalade",color:"#ca5010"},
    {key:"approved",label:"Approuvé",color:"#107c10"},
    {key:"paid",label:"Payé",color:"#107c10"},
    {key:"rejected",label:"Rejeté",color:"#d13438"},
  ];
  const getCol = item => {
    if(item.status==="draft") return "draft";
    if(item.status==="paid") return "paid";
    if(item.status==="rejected") return "rejected";
    if(item.status==="approved"||getWorkflowStatus(item,matrix).isDone) return "approved";
    const esc = getEscalation(item,matrix);
    return esc&&esc.urgent?"pending_late":"pending_early";
  };
  return (
    <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:8}}>
      {cols.map(col=>{
        const colItems = items.filter(i=>getCol(i)===col.key);
        return (
          <div key={col.key} style={{minWidth:230,flex:"0 0 230px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:10,height:10,borderRadius:2,background:col.color}}/>
                <span style={{fontSize:12,fontWeight:700,color:"#323130"}}>{col.label}</span>
              </div>
              <span style={{padding:"1px 8px",borderRadius:10,background:col.color+"15",color:col.color,fontSize:11,fontWeight:700}}>{colItems.length}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,minHeight:80}}>
              {colItems.map(item=>{
                const t = getType(item.type);
                return (
                  <div key={item.id} onClick={()=>onSelect(item)}
                    style={{padding:"12px 14px",background:"white",border:"1px solid #e8eaed",borderRadius:4,cursor:"pointer",borderLeft:`3px solid ${t.color}`,transition:"all .15s"}}
                    onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.12)";e.currentTarget.style.transform="translateY(-1px)"}}
                    onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none"}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#1f2937",marginBottom:4,lineHeight:1.3}}>{item.title.slice(0,50)}{item.title.length>50?"...":""}</div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:11,color:"#a19f9d"}}>{item.submittedBy}</span>
                      {item.amount>0&&<span style={{fontSize:11,fontWeight:700,color:t.color}}>{fmtN(item.amount)} F</span>}
                    </div>
                  </div>
                );
              })}
              {colItems.length===0&&<div style={{padding:16,textAlign:"center",color:"#a19f9d",fontSize:12,background:"#fafafa",borderRadius:4,border:"1px dashed #e8eaed"}}>Vide</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ═══ VUE MATRICE ═══
const MatriceView = ({matrix,setMatrix}) => {
  const [editing,setEditing] = useState(null);
  return (
    <div>
      <div style={{marginBottom:16,padding:"12px 16px",background:"#deecf9",borderRadius:4,border:"1px solid #b3d5f0",fontSize:13,color:"#004e8c"}}>
        ℹ️ La matrice définit les niveaux d'approbation selon le type et le montant. Cliquez sur une règle pour la modifier.
      </div>
      {TYPES.map(tp=>{
        const rules = (matrix[tp.id]||DEFAULT_MATRIX[tp.id]||[]);
        return (
          <div key={tp.id} style={{marginBottom:16,background:"white",borderRadius:4,border:"1px solid #e8eaed",overflow:"hidden"}}>
            <div style={{padding:"10px 16px",background:tp.color+"12",borderBottom:"1px solid #e8eaed",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18}}>{tp.icon}</span>
              <span style={{fontWeight:700,fontSize:13,color:tp.color}}>{tp.label}</span>
            </div>
            <div style={{padding:12}}>
              {rules.map((rule,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 10px",borderRadius:4,border:"1px solid #f3f4f6",marginBottom:6,background:"#fafafa"}}>
                  <div style={{fontSize:12,color:"#374151",minWidth:160}}>
                    {i===0?"Jusqu'à":rule.maxAmount===Infinity?"Plus de":i===rules.length-1?"Plus de":""}
                    {rule.maxAmount!==Infinity?" "+fmtN(rule.maxAmount)+" FCFA":""}
                  </div>
                  <div style={{display:"flex",gap:4,flex:1,flexWrap:"wrap"}}>
                    {rule.levels.map((lvl,j)=>{
                      const inf = APPROVERS_INFO[lvl]||{label:lvl,color:"#0078d4",icon:"👤"};
                      return <span key={lvl} style={{fontSize:11,padding:"2px 8px",borderRadius:10,background:inf.color+"15",color:inf.color,fontWeight:700}}>{j+1}. {inf.icon} {inf.label}</span>;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ═══ COMPOSANT PRINCIPAL ═══
export default function Approvals() {
  const [items,setItems] = useState(SEED);
  const [matrix,setMatrix] = useState(DEFAULT_MATRIX);
  const [view,setView] = useState("list");
  const [tab,setTab] = useState("all");
  const [selected,setSelected] = useState(null);
  const [showNew,setShowNew] = useState(false);
  const [search,setSearch] = useState("");
  const [filterType,setFilterType] = useState("tous");

  const updateItem = updated => {setItems(p=>p.map(i=>i.id===updated.id?updated:i));setSelected(updated);};
  const addItem = item => setItems(p=>[item,...p]);

  const pending = items.filter(i=>i.status==="pending"&&!getWorkflowStatus(i,matrix).isDone);
  const approved = items.filter(i=>i.status==="approved"||getWorkflowStatus(i,matrix).isDone);
  const escalated = items.filter(i=>{const e=getEscalation(i,matrix);return e&&e.urgent;});
  const totalMontant = items.reduce((s,i)=>s+i.amount,0);
  const totalApproved = approved.reduce((s,i)=>s+i.amount,0);

  const filtered = items.filter(i=>{
    const ms = !search||i.title.toLowerCase().includes(search.toLowerCase())||i.reference.toLowerCase().includes(search.toLowerCase())||i.submittedBy.toLowerCase().includes(search.toLowerCase());
    const mt = filterType==="tous"||i.type===filterType;
    const tabF = tab==="pending"?pending.includes(i):tab==="approved"?approved.includes(i):tab==="escalated"?escalated.includes(i):true;
    return ms&&mt&&tabF;
  });

  const TABS = [
    {id:"all",label:"Toutes",count:items.length,color:"#0078d4"},
    {id:"pending",label:"En attente",count:pending.length,color:"#ca5010"},
    {id:"approved",label:"Approuvées",count:approved.length,color:"#107c10"},
    {id:"escalated",label:"🔴 Escalade",count:escalated.length,color:"#d13438"},
    {id:"matrix",label:"⚙️ Matrice",count:null,color:"#5c2d91"},
  ];

  return (
    <div style={{minHeight:"100vh",background:"#f3f4f8",fontFamily:"Segoe UI,Arial,sans-serif"}}>
      <div style={{background:"white",borderBottom:"1px solid #e8eaed",padding:"0 28px"}}>
        <div style={{maxWidth:1400,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 0 12px"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:40,height:40,borderRadius:10,background:"linear-gradient(135deg,#0078d4,#5c2d91)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>✅</div>
              <div>
                <h1 style={{fontSize:18,fontWeight:800,color:"#1f2937",margin:"0 0 2px"}}>CleanIT Approvals</h1>
                <p style={{color:"#a19f9d",margin:0,fontSize:12}}>Workflow multi-niveaux · Matrice configurable · Connecté CleanITBooks</p>
              </div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <div style={{display:"flex",background:"#f3f4f8",borderRadius:4,padding:2,border:"1px solid #e8eaed"}}>
                {[{v:"list",icon:"≡"},{v:"kanban",icon:"⊞"}].map(vt=>(
                  <button key={vt.v} onClick={()=>setView(vt.v)} style={{padding:"6px 12px",borderRadius:3,border:"none",background:view===vt.v?"white":"transparent",color:view===vt.v?"#0078d4":"#a19f9d",fontWeight:view===vt.v?700:400,cursor:"pointer",fontSize:16,boxShadow:view===vt.v?"0 1px 3px rgba(0,0,0,0.1)":"none"}}>{vt.icon}</button>
                ))}
              </div>
              <Btn label="+ Nouvelle demande" onClick={()=>setShowNew(true)} color="#0078d4"/>
            </div>
          </div>
          <div style={{display:"flex",gap:0,borderTop:"1px solid #f3f4f6"}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)}
                style={{padding:"10px 16px",border:"none",borderBottom:`2px solid ${tab===t.id?t.color:"transparent"}`,background:"transparent",color:tab===t.id?t.color:"#a19f9d",fontWeight:tab===t.id?700:400,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6,transition:"all .1s"}}>
                {t.label}
                {t.count!=null&&t.count>0&&<span style={{padding:"1px 7px",borderRadius:10,background:tab===t.id?t.color+"20":"#f3f4f8",color:tab===t.id?t.color:"#a19f9d",fontSize:11,fontWeight:700}}>{t.count}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1400,margin:"0 auto",padding:"20px 28px"}}>
        {tab==="matrix"?<MatriceView matrix={matrix} setMatrix={setMatrix}/>:(
          <>
            <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
              {[
                {l:"Total demandes",v:items.length,c:"#0078d4",icon:"📋"},
                {l:"En attente",v:pending.length,c:"#ca5010",icon:"⏳"},
                {l:"Approuvées",v:approved.length,c:"#107c10",icon:"✅"},
                {l:"Escalades actives",v:escalated.length,c:"#d13438",icon:"🔴"},
                {l:"Montant soumis",v:fmtN(totalMontant)+" FCFA",c:"#5c2d91",icon:"💰"},
                {l:"Montant approuvé",v:fmtN(totalApproved)+" FCFA",c:"#107c10",icon:"💳"},
              ].map(k=>(
                <div key={k.l} style={{flex:1,minWidth:140,background:"white",borderRadius:4,padding:"14px 16px",border:"1px solid #e8eaed",boxShadow:S.shadow}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{fontSize:10,color:"#a19f9d",textTransform:"uppercase",letterSpacing:.5}}>{k.l}</span>
                    <div style={{width:28,height:28,borderRadius:4,background:k.c+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{k.icon}</div>
                  </div>
                  <div style={{fontSize:typeof k.v==="string"?13:22,fontWeight:700,color:k.c}}>{k.v}</div>
                </div>
              ))}
            </div>
            {escalated.length>0&&(
              <div style={{background:"#fde7e9",borderRadius:4,padding:"12px 16px",border:"1px solid #f9bdbd",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:18}}>🔴</span>
                  <span style={{fontSize:13,fontWeight:700,color:"#a4262c"}}>{escalated.length} demande{escalated.length>1?"s":""} en escalade — délai dépassé, action requise</span>
                </div>
                <Btn label="Voir →" onClick={()=>setTab("escalated")} ghost color="#d13438" sm/>
              </div>
            )}
            <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:240,display:"flex",alignItems:"center",gap:8,background:"white",borderRadius:4,padding:"8px 12px",border:"1px solid #e8eaed"}}>
                <span style={{color:"#a19f9d"}}>🔍</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
                  style={{flex:1,border:"none",outline:"none",fontSize:13,color:"#1f2937",background:"transparent",fontFamily:"Segoe UI,Arial,sans-serif"}}/>
              </div>
              <select value={filterType} onChange={e=>setFilterType(e.target.value)}
                style={{padding:"8px 12px",borderRadius:4,border:"1px solid #e8eaed",fontSize:13,background:"white",cursor:"pointer",fontFamily:"Segoe UI,Arial,sans-serif"}}>
                <option value="tous">Tous les types</option>
                {TYPES.map(t=><option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            {view==="kanban"&&<KanbanView items={filtered} onSelect={setSelected} matrix={matrix}/>}
            {view==="list"&&(
              <div style={{background:"white",borderRadius:4,border:"1px solid #e8eaed",overflow:"hidden",boxShadow:S.shadow}}>
                <table style={{width:"100%",borderCollapse:"collapse",minWidth:900}}>
                  <thead>
                    <tr style={{background:"#f3f4f8",borderBottom:"1px solid #e8eaed"}}>
                      {["Demande","Type","Soumis par","Montant","Workflow","Escalade","Statut",""].map(h=>(
                        <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#a19f9d",textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item,i)=>{
                      const t2 = getType(item.type);
                      const {levels,approved:app,currentIdx} = getWorkflowStatus(item,matrix);
                      const esc = getEscalation(item,matrix);
                      return (
                        <tr key={item.id} onClick={()=>setSelected(item)}
                          style={{borderBottom:"1px solid #f3f4f6",cursor:"pointer",background:"white"}}
                          onMouseEnter={e=>e.currentTarget.style.background="#f3f4f8"}
                          onMouseLeave={e=>e.currentTarget.style.background="white"}>
                          <td style={{padding:"12px 14px"}}>
                            <div style={{fontSize:13,fontWeight:600,color:"#1f2937",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</div>
                            <div style={{fontSize:11,color:"#a19f9d",fontFamily:"monospace"}}>{item.reference}</div>
                          </td>
                          <td style={{padding:"12px 14px"}}><span style={{fontSize:12}}>{t2.icon} {t2.label}</span></td>
                          <td style={{padding:"12px 14px",fontSize:13,color:"#374151"}}>{item.submittedBy}</td>
                          <td style={{padding:"12px 14px",fontSize:13,fontWeight:600,color:item.amount>0?t2.color:"#a19f9d"}}>{item.amount>0?fmtN(item.amount)+" F":"—"}</td>
                          <td style={{padding:"12px 14px"}}>
                            <div style={{fontSize:11,color:"#4b5563"}}>{app.length}/{levels.length} niveaux</div>
                            <div style={{width:60,height:4,background:"#e8eaed",borderRadius:2,marginTop:3}}>
                              <div style={{width:(app.length/levels.length*100)+"%",height:"100%",background:"#0078d4",borderRadius:2}}/>
                            </div>
                          </td>
                          <td style={{padding:"12px 14px"}}>
                            {esc&&esc.urgent?<Badge label={esc.overdue?"Dépassé":esc.remaining+"h"} color={esc.overdue?"#d13438":"#ca5010"}/>:<span style={{fontSize:11,color:"#a19f9d"}}>—</span>}
                          </td>
                          <td style={{padding:"12px 14px"}}><StatusChip item={item} matrix={matrix}/></td>
                          <td style={{padding:"12px 14px"}}>
                            <Btn label="Voir" onClick={e=>{e.stopPropagation();setSelected(item);}} sm ghost color="#0078d4"/>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filtered.length===0&&(
                  <div style={{padding:48,textAlign:"center",color:"#a19f9d"}}>
                    <div style={{fontSize:40,marginBottom:10}}>📋</div>
                    <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>Aucune demande</div>
                    <div style={{fontSize:13}}>Créez une nouvelle demande ou modifiez les filtres</div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      {selected&&<DetailPanel item={selected} onClose={()=>setSelected(null)} onUpdate={updateItem} matrix={matrix}/>}
      {showNew&&<NouvelleDemandeModal onClose={()=>setShowNew(false)} onSave={addItem} matrix={matrix}/>}
    </div>
  );
}
