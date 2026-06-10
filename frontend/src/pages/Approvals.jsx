import React, { useState, useEffect, useRef } from "react";
import { api, getUser } from "../utils/api";
import { useNavigate, useParams } from "react-router-dom";
import { getBalance } from "../services/cleanitbooks.api";

const fN = n => new Intl.NumberFormat("fr-FR").format(Math.round(n||0));
const fD = d => d ? new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const fDT = d => d ? new Date(d).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"}) : "—";
const hAgo = d => Math.round((Date.now()-new Date(d||Date.now()))/(1000*3600));

// ── ICONS SVG ─────────────────────────────────────────────────
const Ic = ({d,size=16,color="currentColor",sw=1.8}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {(Array.isArray(d)?d:[d]).map((p,i)=><path key={i} d={p}/>)}
  </svg>
);
const I = {
  payment:   "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  purchase:  "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
  expense:   "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z",
  leave:     "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  advance:   "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  mission:   "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
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
  alert:     "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  user:      ["M16 7a4 4 0 11-8 0 4 4 0 018 0z","M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"],
  list:      "M4 6h16M4 10h16M4 14h16M4 18h16",
  grid:      "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  download:  "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  send:      "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  brain:     ["M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"],
  bank:      ["M3 6l9-3 9 3v2H3V6z","M3 10h18v10H3V10z","M9 14v3","M12 14v3","M15 14v3"],
  edit:      "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  chart:     "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  audit:     "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  settings:  ["M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z","M15 12a3 3 0 11-6 0 3 3 0 016 0z"],
  attach:    "M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13",
  delegate:  "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
};

// ── TYPES ─────────────────────────────────────────────────────
const TYPES = [
  {id:"payment_request",  label:"Demande de paiement",   color:"#0066CC", ik:"payment"},
  {id:"purchase_request", label:"Demande d'achat",       color:"#D04A00", ik:"purchase"},
  {id:"expense_report",   label:"Note de frais",          color:"#C50F1F", ik:"expense"},
  {id:"leave_request",    label:"Demande de congé",       color:"#0E7A0D", ik:"leave"},
  {id:"advance_request",  label:"Avance sur salaire",     color:"#5C2D91", ik:"advance"},
  {id:"mission_request",  label:"Ordre de mission",       color:"#006E5A", ik:"mission"},
  {id:"training_request", label:"Demande de formation",   color:"#7600BC", ik:"training"},
  {id:"equipment_request",label:"Demande matériel",       color:"#003F87", ik:"equipment"},
];
const gType = id => TYPES.find(t=>t.id===id)||TYPES[0];

// ── APPROBATEURS ──────────────────────────────────────────────
const APR = {
  manager:  {label:"Responsable direct",  color:"#0066CC", limit:500000},
  finance1: {label:"Finance N1",           color:"#0E7A0D", limit:5000000},
  finance2: {label:"Finance N2",           color:"#5C2D91", limit:20000000},
  rh:       {label:"RH",                   color:"#D04A00", limit:0},
  cfo:      {label:"Directeur Financier",  color:"#7600BC", limit:50000000},
  dg:       {label:"Directeur Général",    color:"#C50F1F", limit:Infinity},
};

// ── MATRICE D'APPROBATION ─────────────────────────────────────
const DEFAULT_MATRIX = {
  payment_request:  [
    {max:250000,  lvls:["manager"],                              mode:"sequential", label:"Auto — Sous seuil"},
    {max:500000,  lvls:["manager","dg"],                         mode:"sequential", label:"Standard"},
    {max:5000000, lvls:["manager","finance1","dg"],              mode:"sequential", label:"Élevé"},
    {max:20000000,lvls:["manager","finance1","finance2","dg"],   mode:"sequential", label:"Très élevé"},
    {max:Infinity,lvls:["manager","finance1","finance2","cfo","dg"],mode:"sequential",label:"Exceptionnel"},
  ],
  purchase_request: [
    {max:1000000, lvls:["manager","finance1","dg"],              mode:"sequential", label:"Standard"},
    {max:Infinity,lvls:["manager","finance1","finance2","dg"],   mode:"sequential", label:"Élevé"},
  ],
  expense_report:   [{max:Infinity,lvls:["manager","finance1"],  mode:"parallel",   label:"Note de frais — Approbation parallèle"}],
  leave_request:    [{max:Infinity,lvls:["manager","rh"],        mode:"parallel",   label:"Congé — RH + Manager simultané"}],
  advance_request:  [{max:Infinity,lvls:["manager","finance1","dg"],mode:"sequential",label:"Avance salaire"}],
  mission_request:  [
    {max:1000000, lvls:["manager","finance1"],                   mode:"parallel",   label:"Mission courte"},
    {max:Infinity,lvls:["manager","finance1","dg"],              mode:"sequential", label:"Mission longue"},
  ],
  training_request: [{max:Infinity,lvls:["manager","rh","dg"],  mode:"sequential", label:"Formation"}],
  equipment_request:[{max:Infinity,lvls:["manager","finance1","dg"],mode:"sequential",label:"Équipement"}],
};

// Routage conditionnel — règles supplémentaires par condition
const CONDITIONAL_ROUTES = [
  {id:"cr1", label:"Site critique → DG obligatoire", active:true,
   conditions:[{field:"site", operator:"in", values:["DLA-001","YDE-001","KRI-001"]}],
   action:"add_level", level:"dg"},
  {id:"cr2", label:"Montant > 10M → CFO requis", active:true,
   conditions:[{field:"amount", operator:">", value:10000000}],
   action:"add_level", level:"cfo"},
  {id:"cr3", label:"Note de frais < 100K → Auto-approbation", active:true,
   conditions:[{field:"type", operator:"eq", value:"expense_report"},{field:"amount", operator:"<", value:100000}],
   action:"auto_approve"},
];


// ── PARAMÈTRES SYSTÈME ────────────────────────────────────────
const DEFAULT_SETTINGS = {
  autoApproval: {enabled:true, maxAmount:50000, types:["expense_report"]},
  delegation: {
    manager:  {delegate:"finance1", from:"", to:"", active:false},
    finance1: {delegate:"finance2", from:"", to:"", active:false},
    finance2: {delegate:"cfo",      from:"", to:"", active:false},
    rh:       {delegate:"manager",  from:"", to:"", active:false},
    cfo:      {delegate:"dg",       from:"", to:"", active:false},
    dg:       {delegate:"",         from:"", to:"", active:false},
  },
  escalation:   {hours:{manager:24,finance1:48,finance2:48,rh:24,cfo:72,dg:96}},
  notifications:{email:true, sms:false, inApp:true},
};

// ── LOGIQUE WORKFLOW ──────────────────────────────────────────
const getLevels = (type,amount,matrix) => {
  const rules = (matrix||DEFAULT_MATRIX)[type]||[{max:Infinity,lvls:["manager","dg"],mode:"sequential"}];
  return rules.find(r=>amount<=r.max)||rules[rules.length-1];
};

const getWF = (item,matrix) => {
  try {
    const type = item.type||"payment_request";
    const amount = Number(item.amount)||0;
    const rules = (matrix||DEFAULT_MATRIX)[type]||[{max:Infinity,lvls:["manager","dg"],mode:"sequential"}];
    const rule = rules.find(r=>amount<=(r.max||Infinity))||rules[rules.length-1]||{lvls:["manager","dg"],mode:"sequential"};
    let lvls = [...(rule.lvls||["manager","dg"])];
    const mode = rule.mode||"sequential";
    const app = item.approvedBy||[];
    // Routage conditionnel
    try {
      (CONDITIONAL_ROUTES||[]).filter(r=>r.active).forEach(r=>{
        const match = r.conditions.every(cond=>{
          const val = item[cond.field];
          if(cond.operator==="in") return (cond.values||[]).includes(val);
          if(cond.operator===">") return Number(val)>Number(cond.value);
          if(cond.operator==="<") return Number(val)<Number(cond.value);
          if(cond.operator==="eq") return val===cond.value;
          return false;
        });
        if(match && r.action==="add_level" && !lvls.includes(r.level)) lvls.push(r.level);
      });
    } catch(e) {}
    if(mode==="parallel") {
      const done = lvls.every(l=>app.includes(l));
      const pending = lvls.filter(l=>!app.includes(l));
      return {lvls,app,cur:pending[0]||null,done,mode,totalSteps:lvls.length,pending,isParallel:true};
    }
    const done = app.length>=lvls.length;
    return {lvls,app,cur:lvls[app.length]||null,done,mode,totalSteps:lvls.length,pending:[],isParallel:false};
  } catch(e) {
    return {lvls:["manager","dg"],app:[],cur:"manager",done:false,mode:"sequential",totalSteps:2,pending:[],isParallel:false};
  }
};

const getEsc = (item,settings) => {
  if(!item.submittedAt||["paid","rejected","draft"].includes(item.status)) return null;
  const {cur,done} = getWF(item,DEFAULT_MATRIX);
  if(!cur||done) return null;
  const hours = (settings||DEFAULT_SETTINGS).escalation.hours;
  const maxH = hours[cur]||48;
  const elapsed = hAgo(item.lastActionAt||item.submittedAt);
  const pct = Math.min(100, Math.round(elapsed/maxH*100));
  return {elapsed, maxH, pct, remaining:Math.max(0,maxH-elapsed), urgent:pct>=80, overdue:pct>=100};
};

// ── SEED DATA ─────────────────────────────────────────────────


const getDaysOld = d => d ? Math.floor((Date.now()-new Date(d))/(1000*3600*24)) : 0;
const isExpired = item => item.status==="pending" && getDaysOld(item.submittedAt) > 7;
const getExpiryLabel = item => { const d=getDaysOld(item.submittedAt); if(d>7) return "Expiré ("+d+"j)"; if(d>=5) return "Expire bientôt"; return null; };

const TEMPLATES = [
  {type:"payment_request",  title:"Paiement sous-traitant",  amount:0,   justification:"Paiement prestation sous-traitant selon contrat.",      icon:"payment"},
  {type:"purchase_request", title:"Achat matériel chantier", amount:0,   justification:"Achat matériel nécessaire pour le chantier.",            icon:"purchase"},
  {type:"expense_report",   title:"Note de frais mission",   amount:0,   justification:"Remboursement frais déplacement mission terrain.",       icon:"expense"},
  {type:"mission_request",  title:"Ordre de mission",        amount:0,   justification:"Déplacement site pour intervention technique.",          icon:"plane"},
  {type:"advance_request",  title:"Avance sur salaire",      amount:0,   justification:"Demande avance sur salaire — urgence personnelle.",      icon:"dollar"},
  {type:"leave_request",    title:"Congé annuel",            amount:0,   justification:"Demande congé annuel selon planning RH.",               icon:"leave"},
];

const SEED = [];


// ── DESIGN ────────────────────────────────────────────────────
const C = {
  white:"#fff", bg:"#F0F2F5", bg2:"#E8EBF0",
  border:"#D4D7DC", border2:"#E8EBF0",
  text:"#1A1D23", text2:"#3D4458", text3:"#6B7280", text4:"#9CA3AF",
  blue:"#0A2D6E", blueL:"#E6EDF8", green:"#0E7A0D", greenL:"#E8F5E9",
  red:"#C50F1F", redL:"#FEECEC", orange:"#D04A00", orangeL:"#FEF3E8",
  purple:"#5C2D91", navy:"#0A2D6E",
  shadow:"0 1px 3px rgba(0,0,0,0.07),0 0 0 1px rgba(0,0,0,0.03)",
};

// ── COMPOSANTS UI ─────────────────────────────────────────────
const Av = ({name="?",size=32,color=C.blue}) => (
  <div style={{width:size,height:size,borderRadius:"50%",background:color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:size*0.35,flexShrink:0}}>
    {(name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
  </div>
);

const Badge = ({label,bg,color,dot}) => (
  <span style={{padding:"2px 9px",borderRadius:10,fontSize:11,fontWeight:700,background:bg,color,whiteSpace:"nowrap",display:"inline-flex",alignItems:"center",gap:4}}>
    {dot&&<span style={{width:6,height:6,borderRadius:"50%",background:color,display:"inline-block"}}/>}{label}
  </span>
);

const Btn = ({label,onClick,color=C.blue,ghost=false,disabled=false,sm=false,icon=null,full=false,danger=false}) => {
  const bg = danger?"#C50F1F":ghost?"transparent":disabled?"#E5E7EB":color;
  const fg = ghost?(danger?"#C50F1F":color):"#fff";
  return (
    <button onClick={onClick} disabled={disabled} style={{padding:sm?"5px 12px":"8px 18px",borderRadius:6,border:ghost?`1.5px solid ${danger?"#C50F1F":color}`:"none",background:disabled?"#E5E7EB":bg,color:disabled?"#9CA3AF":fg,fontWeight:600,fontSize:sm?11:13,cursor:disabled?"not-allowed":"pointer",display:"inline-flex",alignItems:"center",gap:6,opacity:disabled?.6:1,width:full?"100%":"auto",justifyContent:"center",fontFamily:"inherit",transition:"all .15s"}}>
      {icon&&<Ic d={I[icon]} size={13} color={disabled?"#9CA3AF":fg}/>}{label}
    </button>
  );
};

const StatusBadge = ({item,matrix}) => {
  const {cur,done} = getWF(item,matrix||DEFAULT_MATRIX);
  if(item.status==="paid")     return <Badge label="Payé"       bg="#D1FAE5" color="#065F46"/>;
  if(item.status==="rejected") return <Badge label="Rejeté"     bg="#FEE2E2" color="#991B1B"/>;
  if(item.status==="draft")    return <Badge label="Brouillon"  bg="#F3F4F6" color="#6B7280"/>;
  if(done||item.status==="approved") return <Badge label="Approuvé ✓" bg="#D1FAE5" color="#065F46"/>;
  const a = APR[cur]||{label:cur,color:C.orange};
  return <Badge label={"En attente — "+a.label} bg={a.color+"18"} color={a.color}/>;
};

// ── WORKFLOW TIMELINE ─────────────────────────────────────────
const WFLine = ({item,matrix,compact=false}) => {
  const {lvls,app,cur,done} = getWF(item,matrix||DEFAULT_MATRIX);
  return (
    <div style={{display:"flex",alignItems:"flex-start",flexWrap:"wrap",gap:4,rowGap:8}}>
      {lvls.map((lvl,i)=>{
        const a=APR[lvl]||{label:lvl,color:C.blue};
        const isDone=i<app.length, isAct=lvl===cur&&!done, isLast=i===lvls.length-1;
        return (
          <div key={lvl} style={{display:"flex",alignItems:"center",gap:0}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:compact?2:4}}>
              <div style={{width:compact?26:32,height:compact?26:32,borderRadius:"50%",background:isDone?C.green:isAct?a.color:"#E5E7EB",border:`2px solid ${isDone?C.green:isAct?a.color:"#D1D5DB"}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .3s",boxShadow:isAct?`0 0 0 3px ${a.color}25`:"none"}}>
                {isDone?<Ic d={I.check} size={compact?11:14} color="#fff" sw={2.5}/>:<span style={{fontSize:compact?9:10,fontWeight:700,color:isAct?"#fff":"#9CA3AF"}}>{i+1}</span>}
              </div>
              {!compact&&<div style={{fontSize:9,color:isDone?C.green:isAct?a.color:"#9CA3AF",fontWeight:isDone||isAct?700:400,textAlign:"center",maxWidth:60,lineHeight:1.2,marginTop:2}}>{a.label}</div>}
            </div>
            {!isLast&&<div style={{width:compact?20:28,height:2,background:isDone?C.green:"#E5E7EB",margin:compact?"0 3px 0":"0 4px 18px",transition:"background .3s"}}/>}
          </div>
        );
      })}
    </div>
  );
};


const ParallelBadge = ({lvls,app,config}) => (
  <div style={{display:"flex",flexWrap:"wrap",gap:6,padding:"10px 14px",background:"#EFF6FF",borderRadius:8,border:"1px solid #BFDBFE"}}>
    <div style={{width:"100%",fontSize:11,fontWeight:700,color:C.blue,marginBottom:4}}>⚡ Approbation parallèle — Tous les niveaux simultanément</div>
    {lvls.map((lvl,i)=>{
      const a=config?.approvers?.[lvl]||APR[lvl]||{label:lvl,color:C.blue};
      const done=app.includes(lvl);
      return (
        <div key={lvl} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",borderRadius:16,background:done?C.green+"18":"#fff",border:`1px solid ${done?C.green:C.border}`,fontSize:12}}>
          <div style={{width:16,height:16,borderRadius:"50%",background:done?C.green:C.border,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {done?<Ic d={I.check} size={10} color="#fff" sw={2.5}/>:<span style={{fontSize:8,color:"#fff",fontWeight:700}}>{i+1}</span>}
          </div>
          <span style={{fontWeight:600,color:done?C.green:C.text2}}>{a.label}</span>
          {done&&<span style={{fontSize:10,color:C.green}}>✓</span>}
        </div>
      );
    })}
  </div>
);


const ConditionalRoutingSettings = ({routes,setRoutes}) => {
  const [localRoutes, setLocalRoutes] = useState(routes||CONDITIONAL_ROUTES);
  const toggle = id => {
    const updated = localRoutes.map(r=>r.id===id?{...r,active:!r.active}:r);
    setLocalRoutes(updated);
    if(setRoutes) setRoutes(updated);
  };
  return (
    <div>
      <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12}}>Routage Conditionnel</div>
      <div style={{fontSize:11,color:C.text3,marginBottom:14}}>Ces règles modifient automatiquement le circuit d'approbation selon les conditions définies.</div>
      {localRoutes.map((r,i)=>(
        <div key={r.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:8,border:`1px solid ${C.border}`,background:r.active?"#0052CC06":"#F4F6FB",marginBottom:8}}>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:600,color:C.text}}>{r.label}</div>
            <div style={{fontSize:11,color:C.text4,marginTop:2}}>
              {(r.conditions||[]).map((cond,j)=>(
                <span key={j} style={{marginRight:6,padding:"1px 7px",borderRadius:8,background:C.border2,color:C.text3}}>
                  {cond.field} {cond.operator} {cond.value||cond.values?.join(',')||''}
                </span>
              ))}
              → {r.action==="add_level"?`Ajouter ${r.level}`:"Auto-approbation"}
            </div>
          </div>
          <div onClick={()=>toggle(r.id)}
            style={{width:36,height:20,borderRadius:10,background:r.active?C.blue:"#D1D5DB",cursor:"pointer",position:"relative",transition:"background .2s"}}>
            <div style={{position:"absolute",top:2,left:r.active?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
          </div>
        </div>
      ))}
    </div>
  );
};


// ── QUORUM HELPER ─────────────────────────────────────────────
const getQuorum = (matrix, type, amount) => {
  const rules = (matrix||DEFAULT_MATRIX)[type]||[{max:Infinity,lvls:["manager","dg"],mode:"sequential"}];
  const rule = rules.find(r=>amount<=(r.max||Infinity))||rules[rules.length-1];
  return rule.quorum||null; // {required:2, total:3}
};

// ── BC MATCHING COMPONENT ─────────────────────────────────────
const BCMatchingPanel = ({item, onMatch}) => {
  const [bcRef, setBcRef] = useState(item.bcRef||'');
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState(null);
  const SAMPLE_BC = [
    {ref:'BC-MTN-2025-047', client:'MTN Cameroun', amount:45000000, date:'2025-05-01'},
    {ref:'BC-ORA-2025-031', client:'Orange Cameroun', amount:28000000, date:'2025-04-15'},
    {ref:'BC-CAM-2025-019', client:'CAMTEL', amount:12000000, date:'2025-04-20'},
  ];
  const search = () => {
    setSearching(true);
    setTimeout(()=>{
      const bc = SAMPLE_BC.find(b=>b.ref.toLowerCase().includes(bcRef.toLowerCase()));
      setFound(bc||null); setSearching(false);
    },800);
  };
  const amountMatch = found && Math.abs(found.amount - item.amount) < found.amount * 0.05;
  return (
    <div style={{background:C.bg,borderRadius:8,padding:'14px 16px',border:`1px solid ${C.border}`}}>
      <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:10}}>🔗 Matching Bon de Commande</div>
      <div style={{display:'flex',gap:8,marginBottom:10}}>
        <input value={bcRef} onChange={e=>setBcRef(e.target.value)} placeholder="Réf. BC (ex: BC-MTN-2025-047)"
          style={{flex:1,padding:'7px 10px',borderRadius:6,border:`1px solid ${C.border}`,fontSize:12,outline:'none'}}/>
        <Btn label={searching?'Recherche...':'Rechercher'} onClick={search} disabled={!bcRef||searching} sm color={C.blue}/>
      </div>
      {found&&(
        <div style={{background:amountMatch?C.green_l:C.orange_l,borderRadius:6,padding:'10px 12px',border:`1px solid ${amountMatch?C.green:C.orange}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:C.text}}>{found.ref} — {found.client}</div>
              <div style={{fontSize:11,color:C.text3}}>Montant BC: {fN(found.amount)} FCFA · Date: {found.date}</div>
              {!amountMatch&&<div style={{fontSize:11,color:C.orange,fontWeight:600}}>⚠ Écart montant détecté</div>}
              {amountMatch&&<div style={{fontSize:11,color:C.green,fontWeight:600}}>✓ Montant conforme</div>}
            </div>
            <Btn label="Associer" onClick={()=>onMatch&&onMatch(found)} sm color={C.green}/>
          </div>
        </div>
      )}
      {found===null&&searching===false&&bcRef&&<div style={{fontSize:12,color:C.red}}>Aucun BC trouvé</div>}
    </div>
  );
};

// ── APPROBATION LIEN EMAIL ─────────────────────────────────────
const EmailApprovalLink = ({item}) => {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/approvals/${item.id}?action=approve&token=${btoa(item.id+'_'+Date.now())}`;
  const copy = () => { navigator.clipboard?.writeText(link).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);}); };
  const sendMail = () => {
    const subj = encodeURIComponent(`Action requise: ${item.title} — ${item.reference}`);
    const body = encodeURIComponent(`Bonjour,

Votre approbation est requise pour:
${item.title}
Montant: ${fN(item.amount)} FCFA

Cliquez pour approuver: ${link}

Cordialement,
CleanIT ERP`);
    window.open('mailto:?subject='+subj+'&body='+body);
  };
  return (
    <div style={{background:C.bg,borderRadius:8,padding:'12px 14px',border:`1px solid ${C.border}`}}>
      <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:8}}>📧 Approuver depuis email</div>
      <div style={{fontSize:11,color:C.text3,fontFamily:'monospace',background:C.white,padding:'6px 10px',borderRadius:4,marginBottom:8,wordBreak:'break-all'}}>
        {link.slice(0,60)}...
      </div>
      <div style={{display:'flex',gap:8}}>
        <Btn label={copied?'✓ Copié!':'Copier lien'} onClick={copy} sm color={copied?C.green:C.blue}/>
        <Btn label="Envoyer par email" onClick={sendMail} sm ghost color={C.blue}/>
      </div>
    </div>
  );
};

// ── NOTIFICATIONS PANEL ────────────────────────────────────────
const NotificationsPanel = ({items}) => {
  const pending = (items||[]).filter(i=>i.status==="pending");
  const urgent  = (items||[]).filter(i=>i.priority==="haute"&&i.status==="pending");
  return (
    <div>
      {urgent.length>0&&(
        <div style={{background:'#FEF2F2',borderRadius:8,padding:'10px 14px',marginBottom:12,border:'1px solid #FECACA'}}>
          <div style={{fontSize:12,fontWeight:700,color:C.red}}>🔔 {urgent.length} demande{urgent.length>1?"s":""} urgente{urgent.length>1?"s":""} en attente</div>
          {urgent.slice(0,3).map(i=>(
            <div key={i.id} style={{fontSize:11,color:C.text2,marginTop:4}}>• {i.title} — {fN(i.amount)} FCFA</div>
          ))}
        </div>
      )}
      {pending.length>0&&(
        <div style={{background:'#FFF7ED',borderRadius:8,padding:'10px 14px',border:'1px solid #FED7AA'}}>
          <div style={{fontSize:12,fontWeight:700,color:C.orange}}>⏳ {pending.length} demande{pending.length>1?"s":""} en attente d'approbation</div>
        </div>
      )}
    </div>
  );
};

// ── RÉCURRENTES APPROVAL ───────────────────────────────────────
const RecurringApprovalPanel = ({onAdd}) => {
  const [templates, setTemplates] = useState([
    {id:'RA001', title:'Frais mensuels équipe terrain', type:'expense_report', amount:500000, freq:'Mensuelle', active:true},
    {id:'RA002', title:'Abonnement logiciels', type:'purchase_request', amount:250000, freq:'Mensuelle', active:true},
  ]);
  const generate = (tpl) => {
    const newItem = {
      id:`APV-REC-${Date.now().toString().slice(-4)}`, reference:`APV-REC-${Date.now().toString().slice(-4)}`,
      type:tpl.type, title:tpl.title, amount:tpl.amount, currency:'FCFA',
      status:'draft', priority:'normale', submittedBy:'Système Récurrent',
      submittedAt:new Date().toISOString(), lastActionAt:new Date().toISOString(),
      justification:`Demande récurrente ${tpl.freq.toLowerCase()} — générée automatiquement`,
      approvedBy:[], attachments:[], history:[],
    };
    if(onAdd) onAdd(newItem);
    alert('Demande récurrente créée: '+newItem.reference);
  };
  return (
    <div style={{marginTop:16}}>
      <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>🔄 Demandes récurrentes</div>
      {templates.map(tpl=>(
        <div key={tpl.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',background:C.white,borderRadius:8,border:`1px solid ${C.border}`,marginBottom:8}}>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:600,color:C.text}}>{tpl.title}</div>
            <div style={{fontSize:11,color:C.text3}}>{tpl.freq} · {fN(tpl.amount)} FCFA</div>
          </div>
          <Btn label="Générer" onClick={()=>generate(tpl)} sm color={C.blue}/>
          <button onClick={()=>setTemplates(p=>p.map(t=>t.id===tpl.id?{...t,active:!t.active}:t))}
            style={{width:36,height:20,borderRadius:10,border:'none',background:tpl.active?C.green:'#D1D5DB',cursor:'pointer',position:'relative'}}>
            <div style={{position:'absolute',top:2,left:tpl.active?18:2,width:16,height:16,borderRadius:'50%',background:'#fff',transition:'left .2s'}}/>
          </button>
        </div>
      ))}
    </div>
  );
};

// ── BUDGET CHECK ──────────────────────────────────────────────
const BudgetCheck = ({amount}) => {
  const [bal,setBal]=useState(null);
  useEffect(()=>{getBalance().then(d=>{if(d?.rows){const b=d.rows.filter(r=>r.classe==="5").reduce((s,r)=>s+Number(r.debit)-Number(r.credit),0);setBal(b);}}).catch(()=>{});},[]);
  if(bal===null) return <div style={{padding:"10px 14px",borderRadius:6,background:C.bg2,fontSize:12,color:C.text3}}>Vérification budget CleanITBooks...</div>;
  const ok=bal>=amount, pct=amount>0?Math.min(100,Math.round(amount/bal*100)):0;
  return (
    <div style={{padding:"12px 14px",borderRadius:6,border:`1px solid ${ok?"#93C5FD":"#FCD34D"}`,background:ok?"#EFF6FF":"#FFFBEB"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}><Ic d={I.bank} size={14} color={ok?C.blue:C.orange}/><span style={{fontSize:12,fontWeight:700,color:ok?C.blue:C.orange}}>{ok?"Budget CleanITBooks disponible":"⚠ Budget insuffisant"}</span></div>
        <span style={{fontSize:11,color:C.text3}}>{pct}% de la trésorerie</span>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}>
        <span>Demande: <strong>{fN(amount)} FCFA</strong></span>
        <span>Trésorerie: <strong style={{color:ok?C.green:C.red}}>{fN(bal)} FCFA</strong></span>
      </div>
      <div style={{height:5,borderRadius:3,background:"#E5E7EB"}}><div style={{width:pct+"%",height:"100%",background:ok?C.blue:C.orange,borderRadius:3,transition:"width .5s"}}/></div>
    </div>
  );
};

// ── AI RISK ───────────────────────────────────────────────────
const AIRisk = ({item}) => {
  const [r,setR]=useState(null),[loading,setL]=useState(false);
  const run=async()=>{
    setL(true);
    try{
      const res=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+import.meta.env.VITE_GROQ_API_KEY},body:JSON.stringify({model:"llama-3.3-70b-versatile",max_tokens:120,messages:[{role:"user",content:"Analyse demande ERP. JSON uniquement {score:1-10,niveau:'faible|moyen|élevé',note:'max70chars'}. Type:"+item.type+",Montant:"+item.amount+" FCFA,Justif:"+(item.justification||"none")}]})});
      const d=await res.json();const txt=(d.choices?.[0]?.message?.content||"{}").replace(/```json|```/g,"").trim();
      setR(JSON.parse(txt));
    }catch{setR({score:5,niveau:"moyen",note:"Analyse indisponible"});}
    setL(false);
  };
  const clr={faible:C.green,moyen:C.orange,"élevé":C.red};
  return (
    <div style={{padding:"12px 14px",borderRadius:6,border:`1px solid ${C.border}`,background:C.white}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}><Ic d={I.brain} size={14} color={C.purple}/><span style={{fontSize:12,fontWeight:700,color:C.purple}}>Analyse IA — ChaCha</span></div>
        {!r&&<Btn label={loading?"Analyse...":"Analyser"} onClick={run} disabled={loading} sm color={C.purple}/>}
      </div>
      {r&&<div style={{marginTop:8,display:"flex",alignItems:"center",gap:10}}><div style={{fontSize:26,fontWeight:800,color:clr[r.niveau]||C.orange}}>{r.score}<span style={{fontSize:12,color:C.text4}}>/10</span></div><div><Badge label={"Risque "+r.niveau} bg={(clr[r.niveau]||C.orange)+"18"} color={clr[r.niveau]||C.orange}/><div style={{fontSize:12,color:C.text2,marginTop:3,fontStyle:"italic"}}>{r.note}</div></div></div>}
    </div>
  );
};

// ── ESCALADE ─────────────────────────────────────────────────
const EscBar = ({item,settings}) => {
  const e=getEsc(item,settings); if(!e) return null;
  const color=e.overdue?C.red:e.urgent?C.orange:C.blue;
  return (
    <div style={{padding:"10px 14px",borderRadius:6,border:`1px solid ${color}30`,background:color+"08"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}><Ic d={I.clock} size={13} color={color}/><span style={{fontSize:12,fontWeight:700,color}}>{e.overdue?"Délai dépassé — escalade auto":e.urgent?"Délai critique":"Dans les délais"}</span></div>
        <span style={{fontSize:11,color}}>{e.overdue?"Action requise":e.remaining+"h / "+e.maxH+"h"}</span>
      </div>
      <div style={{height:4,borderRadius:2,background:"#E5E7EB"}}><div style={{width:e.pct+"%",height:"100%",background:color,borderRadius:2,transition:"width .3s"}}/></div>
    </div>
  );
};

// ── ONGLET RAPPORTS ───────────────────────────────────────────
const ReportsView = ({items,matrix,settings}) => {
  const total = items.length;
  const paid = items.filter(i=>i.status==="paid");
  const pending = items.filter(i=>i.status==="pending"&&!getWF(i,matrix).done);
  const rejected = items.filter(i=>i.status==="rejected");
  const approvedItems = items.filter(i=>i.status==="approved"||getWF(i,matrix).done);
  const approvalRate = total>0?Math.round((approvedItems.length+paid.length)/total*100):0;
  const totalAmount = items.reduce((s,i)=>s+i.amount,0);
  const approvedAmount = [...approvedItems,...paid].reduce((s,i)=>s+i.amount,0);

  // Délai moyen par niveau (simulé depuis l'historique)
  const avgByLevel = {};
  items.forEach(item=>{
    (item.history||[]).forEach((h,idx)=>{
      if(idx===0) return;
      const prev = item.history[idx-1];
      const hours = Math.round((new Date(h.at)-new Date(prev.at))/(1000*3600));
      const lvl = h.action.includes("Responsable")?"manager":h.action.includes("N1")?"finance1":h.action.includes("N2")?"finance2":h.action.includes("DG")||h.action.includes("Général")?"dg":null;
      if(lvl){ if(!avgByLevel[lvl]) avgByLevel[lvl]={sum:0,count:0}; avgByLevel[lvl].sum+=hours; avgByLevel[lvl].count++; }
    });
  });

  // Répartition par type
  const byType = {};
  items.forEach(i=>{ byType[i.type]=(byType[i.type]||0)+1; });
  const maxByType = Math.max(...Object.values(byType),1);

  // Goulot d'étranglement (niveau le plus lent)
  const bottleneck = Object.entries(avgByLevel).sort((a,b)=>(b[1].sum/b[1].count)-(a[1].sum/a[1].count))[0];

  const KPI = ({label,value,color,icon}) => (
    <div style={{background:C.white,borderRadius:8,padding:"14px 16px",border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{fontSize:11,color:C.text3,textTransform:"uppercase",letterSpacing:.5,fontWeight:600}}>{label}</span>
        <div style={{width:28,height:28,borderRadius:6,background:color+"14",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic d={I[icon]} size={14} color={color}/></div>
      </div>
      <div style={{fontSize:22,fontWeight:800,color}}>{value}</div>
    </div>
  );

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
        <KPI label="Taux d'approbation" value={approvalRate+"%"} color={approvalRate>=70?C.green:C.orange} icon="chart"/>
        <KPI label="Délai moyen global" value={Object.values(avgByLevel).length>0?Math.round(Object.values(avgByLevel).reduce((s,v)=>s+v.sum/v.count,0)/Object.values(avgByLevel).length)+"h":"—"} color={C.blue} icon="clock"/>
        <KPI label="Montant approuvé" value={fN(approvedAmount)+" F"} color={C.green} icon="bank"/>
        <KPI label="Demandes rejetées" value={rejected.length} color={C.red} icon="x"/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        {/* Répartition par type */}
        <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.border}`,boxShadow:C.shadow,padding:16}}>
          <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:14}}>Répartition par type</div>
          {Object.entries(byType).map(([type,count])=>{
            const t=gType(type), pct=Math.round(count/total*100);
            return (
              <div key={type} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}><Ic d={I[t.ik]} size={13} color={t.color}/><span style={{color:C.text2}}>{t.label}</span></div>
                  <span style={{fontWeight:700,color:C.text}}>{count} ({pct}%)</span>
                </div>
                <div style={{height:6,borderRadius:3,background:"#E5E7EB"}}><div style={{width:(count/maxByType*100)+"%",height:"100%",background:t.color,borderRadius:3,transition:"width .5s"}}/></div>
              </div>
            );
          })}
        </div>

        {/* Délais par niveau */}
        <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.border}`,boxShadow:C.shadow,padding:16}}>
          <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:14}}>Délai moyen par niveau</div>
          {Object.entries(avgByLevel).length===0&&<div style={{color:C.text4,fontSize:13,textAlign:"center",padding:"20px 0"}}>Données insuffisantes</div>}
          {Object.entries(avgByLevel).map(([lvl,data])=>{
            const a=APR[lvl]||{label:lvl,color:C.blue};
            const avg=Math.round(data.sum/data.count);
            const maxH=(settings||DEFAULT_SETTINGS).escalation.hours[lvl]||48;
            const pct=Math.min(100,Math.round(avg/maxH*100));
            const color=pct>=80?C.red:pct>=60?C.orange:C.green;
            return (
              <div key={lvl} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                  <span style={{color:C.text2,fontWeight:600}}>{a.label}</span>
                  <span style={{fontWeight:700,color}}>{avg}h moy (max {maxH}h)</span>
                </div>
                <div style={{height:6,borderRadius:3,background:"#E5E7EB"}}><div style={{width:pct+"%",height:"100%",background:color,borderRadius:3}}/></div>
              </div>
            );
          })}
          {bottleneck&&(
            <div style={{marginTop:12,padding:"10px 12px",background:"#FEF2F2",borderRadius:6,border:"1px solid #FECACA",fontSize:12,color:C.red}}>
              <strong>Goulot:</strong> {APR[bottleneck[0]]?.label||bottleneck[0]} — {Math.round(bottleneck[1].sum/bottleneck[1].count)}h en moyenne
            </div>
          )}
        </div>
      </div>

      {/* Tableau récap */}
      <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.border}`,boxShadow:C.shadow,overflow:"hidden"}}>
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border2}`,fontWeight:700,fontSize:14,color:C.text}}>Récapitulatif par statut</div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:C.bg,borderBottom:`1px solid ${C.border}`}}>
            {["Statut","Nombre","Montant total","Pourcentage"].map(h=><th key={h} style={{padding:"9px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {[
              {label:"En attente",items:pending,color:C.orange},
              {label:"Approuvées",items:approvedItems,color:C.green},
              {label:"Payées",items:paid,color:"#065F46"},
              {label:"Rejetées",items:rejected,color:C.red},
              {label:"Brouillons",items:items.filter(i=>i.status==="draft"),color:C.text4},
            ].map(row=>(
              <tr key={row.label} style={{borderBottom:`1px solid ${C.border2}`}}>
                <td style={{padding:"10px 14px"}}><Badge label={row.label} bg={row.color+"18"} color={row.color}/></td>
                <td style={{padding:"10px 14px",fontWeight:700,fontSize:14,color:row.color}}>{row.items.length}</td>
                <td style={{padding:"10px 14px",fontSize:13,fontWeight:600}}>{fN(row.items.reduce((s,i)=>s+i.amount,0))} FCFA</td>
                <td style={{padding:"10px 14px",fontSize:13}}>{total>0?Math.round(row.items.length/total*100):0}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── ONGLET AUDIT TRAIL ────────────────────────────────────────
const AuditView = ({items}) => {
  const [filter,setFilter]=useState("");
  const allEvents = items.flatMap(item=>
    (item.history||[]).map(h=>({...h, ref:item.reference, title:item.title, type:item.type, amount:item.amount}))
  ).sort((a,b)=>new Date(b.at)-new Date(a.at));

  const filtered = allEvents.filter(e=>!filter||e.by.toLowerCase().includes(filter.toLowerCase())||e.action.toLowerCase().includes(filter.toLowerCase())||e.ref.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div>
      <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center"}}>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:8,background:C.white,borderRadius:6,padding:"8px 12px",border:`1px solid ${C.border}`}}>
          <Ic d={I.search} size={15} color={C.text4}/><input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filtrer par action, utilisateur, référence..." style={{flex:1,border:"none",outline:"none",fontSize:13,fontFamily:"inherit",color:C.text,background:"transparent"}}/>
        </div>
        <Btn label="Exporter" ghost color={C.text3} sm icon="download"/>
      </div>
      <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.border}`,boxShadow:C.shadow,overflow:"hidden"}}>
        <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.border2}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontWeight:700,fontSize:13,color:C.text}}>Journal d'audit — {filtered.length} événements</span>
        </div>
        <div style={{maxHeight:600,overflow:"auto"}}>
          {filtered.map((e,i)=>{
            const t=gType(e.type);
            return (
              <div key={i} style={{display:"flex",gap:12,padding:"12px 16px",borderBottom:`1px solid ${C.border2}`,alignItems:"flex-start"}}>
                <Av name={e.by} size={32} color={[C.blue,C.green,C.purple,C.orange,C.red][e.by?.charCodeAt(0)%5]||C.blue}/>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:2}}>
                    <span style={{fontSize:13,fontWeight:600,color:C.text}}>{e.action}</span>
                    <span style={{fontSize:11,color:C.text4,whiteSpace:"nowrap",marginLeft:8}}>{fDT(e.at)}</span>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:e.comment?4:0}}>
                    <span style={{fontSize:12,color:C.text3}}>par <strong>{e.by}</strong></span>
                    <span style={{color:C.border2}}>·</span>
                    <span style={{fontSize:11,fontFamily:"monospace",color:t.color}}>{e.ref}</span>
                    <span style={{color:C.border2}}>·</span>
                    <span style={{fontSize:11,color:C.text3}}>{e.title?.slice(0,40)}{e.title?.length>40?"...":""}</span>
                  </div>
                  {e.comment&&<div style={{fontSize:12,color:C.text2,fontStyle:"italic",padding:"4px 10px",background:C.bg,borderRadius:4,borderLeft:`2px solid ${C.border}`}}>{e.comment}</div>}
                </div>
                {e.amount>0&&<div style={{fontSize:12,fontWeight:700,color:t.color,whiteSpace:"nowrap"}}>{fN(e.amount)} F</div>}
              </div>
            );
          })}
          {filtered.length===0&&<div style={{padding:40,textAlign:"center",color:C.text4,fontSize:13}}>Aucun événement trouvé</div>}
        </div>
      </div>
    </div>
  );
};

// ── ONGLET SETTINGS ───────────────────────────────────────────
const SettingsView = ({settings,setSettings,matrix,setMatrix}) => {
  const [saved,setSaved]=useState(false);
  const save=()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);};
  const upd=(path,val)=>{
    const parts=path.split(".");
    setSettings(prev=>{
      const n={...prev};
      let cur=n;
      for(let i=0;i<parts.length-1;i++){cur[parts[i]]={...cur[parts[i]]};cur=cur[parts[i]];}
      cur[parts[parts.length-1]]=val;
      return n;
    });
  };

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      {/* Auto-approbation */}
      <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.border}`,boxShadow:C.shadow,padding:16}}>
        <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:4}}>Auto-approbation</div>
        <div style={{fontSize:12,color:C.text3,marginBottom:14}}>Approuver automatiquement les petites demandes sous un seuil défini</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,padding:"10px 12px",background:C.bg,borderRadius:6}}>
          <span style={{fontSize:13,fontWeight:600,color:C.text}}>Activer l'auto-approbation</span>
          <button onClick={()=>upd("autoApproval.enabled",!settings.autoApproval.enabled)} style={{width:44,height:24,borderRadius:12,border:"none",background:settings.autoApproval.enabled?C.green:"#D1D5DB",cursor:"pointer",position:"relative",transition:"background .2s"}}>
            <div style={{position:"absolute",top:2,left:settings.autoApproval.enabled?22:2,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}}/>
          </button>
        </div>
        <div style={{marginBottom:12}}>
          <label style={{fontSize:11,fontWeight:600,color:C.text2,textTransform:"uppercase",letterSpacing:.5,display:"block",marginBottom:4}}>Montant maximum</label>
          <input type="number" value={settings.autoApproval.maxAmount} onChange={e=>upd("autoApproval.maxAmount",Number(e.target.value))}
            style={{width:"100%",padding:"8px 12px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
          <div style={{fontSize:11,color:C.text4,marginTop:3}}>FCFA — Demandes sous ce seuil seront approuvées automatiquement</div>
        </div>
      </div>

      {/* Délégation */}
      <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.border}`,boxShadow:C.shadow,padding:16}}>
        <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:4}}>Délégation d'approbation</div>
        <div style={{fontSize:12,color:C.text3,marginBottom:14}}>Configurer un remplaçant quand un approbateur est absent</div>
        {Object.entries(settings.delegation).filter(([k])=>k!=="dg").map(([role,cfg])=>{
          const a=APR[role]||{label:role,color:C.blue};
          const del=APR[cfg.delegate]||{label:cfg.delegate,color:C.text3};
          return (
            <div key={role} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:`1px solid ${C.border2}`}}>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:a.color}}>{a.label}</div>
                <div style={{fontSize:11,color:C.text4}}>→ délègue à: <span style={{color:del.color,fontWeight:600}}>{del.label}</span></div>
              </div>
              <button onClick={()=>upd("delegation."+role+".active",!cfg.active)}
                style={{width:36,height:20,borderRadius:10,border:"none",background:cfg.active?C.green:"#D1D5DB",cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
                <div style={{position:"absolute",top:2,left:cfg.active?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
              </button>
            </div>
          );
        })}
      </div>

      {/* Escalade */}
      <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.border}`,boxShadow:C.shadow,padding:16}}>
        <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:4}}>Délais d'escalade</div>
        <div style={{fontSize:12,color:C.text3,marginBottom:14}}>Heures max avant escalade automatique</div>
        {Object.entries(settings.escalation.hours).map(([role,hours])=>{
          const a=APR[role]||{label:role,color:C.blue};
          return (
            <div key={role} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <span style={{fontSize:12,color:C.text2,minWidth:130,fontWeight:500}}>{a.label}</span>
              <input type="number" value={hours} onChange={e=>upd("escalation.hours."+role,Number(e.target.value))}
                style={{width:70,padding:"5px 8px",borderRadius:4,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",outline:"none",textAlign:"center"}}/>
              <span style={{fontSize:11,color:C.text4}}>heures</span>
            </div>
          );
        })}
      </div>

      {/* Limites par approbateur */}
      <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.border}`,boxShadow:C.shadow,padding:16}}>
        <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:4}}>Limites par approbateur</div>
        <div style={{fontSize:12,color:C.text3,marginBottom:14}}>Montant maximum qu'un niveau peut approuver</div>
        {Object.entries(APR).map(([role,a])=>(
          <div key={role} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <span style={{fontSize:12,color:a.color,minWidth:130,fontWeight:600}}>{a.label}</span>
            <input type="number" defaultValue={a.limit===Infinity?0:a.limit}
              style={{width:110,padding:"5px 8px",borderRadius:4,border:`1px solid ${C.border}`,fontSize:12,fontFamily:"inherit",outline:"none"}}/>
            <span style={{fontSize:11,color:C.text4}}>FCFA {a.limit===Infinity?"(illimité)":""}</span>
          </div>
        ))}
      </div>

      {/* Notifications */}
      <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.border}`,boxShadow:C.shadow,padding:16,gridColumn:"1/-1"}}>
        <div style={{fontWeight:700,fontSize:14,color:C.text,marginBottom:14}}>Notifications</div>
        <div style={{display:"flex",gap:24}}>
          {[{k:"email",label:"Email"},{k:"sms",label:"SMS"},{k:"inApp",label:"Notification in-app"}].map(n=>(
            <div key={n.k} style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>upd("notifications."+n.k,!settings.notifications[n.k])}
                style={{width:44,height:24,borderRadius:12,border:"none",background:settings.notifications[n.k]?C.blue:"#D1D5DB",cursor:"pointer",position:"relative",transition:"background .2s"}}>
                <div style={{position:"absolute",top:2,left:settings.notifications[n.k]?22:2,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
              </button>
              <span style={{fontSize:13,color:C.text2,fontWeight:500}}>{n.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{gridColumn:"1/-1",display:"flex",justifyContent:"flex-end",gap:8}}>
        {saved&&<div style={{display:"flex",alignItems:"center",gap:6,color:C.green,fontSize:13,fontWeight:600}}><Ic d={I.check} size={14} color={C.green} sw={2.5}/>Paramètres sauvegardés</div>}
        <Btn label="Sauvegarder" onClick={save} color={C.blue} icon="check"/>
      </div>
    </div>
  );
};

// ── ONGLET MATRICE ────────────────────────────────────────────
const MatriceView = ({matrix}) => (
  <div>
    <div style={{padding:"10px 14px",background:"#EFF6FF",borderRadius:6,border:"1px solid #BFDBFE",fontSize:13,color:C.blue,marginBottom:16}}>
      La matrice définit automatiquement le nombre de niveaux selon le type et le montant de la demande.
    </div>
    {TYPES.map(tp=>{
      const rules=(matrix||DEFAULT_MATRIX)[tp.id]||[];
      return (
        <div key={tp.id} style={{marginBottom:12,background:C.white,borderRadius:8,border:`1px solid ${C.border}`,overflow:"hidden",boxShadow:C.shadow}}>
          <div style={{padding:"10px 16px",background:tp.color+"10",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8}}>
            <Ic d={I[tp.ik]} size={16} color={tp.color}/><span style={{fontWeight:700,fontSize:13,color:tp.color}}>{tp.label}</span>
          </div>
          <div style={{padding:10}}>
            {rules.map((rule,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 10px",borderRadius:4,background:C.bg,marginBottom:6}}>
                <div style={{fontSize:12,color:C.text2,minWidth:180,flexShrink:0}}>
                  {rule.max===Infinity?"Tous montants":`Jusqu'à ${fN(rule.max)} FCFA`}
                </div>
                <div style={{display:"flex",gap:4,flex:1,flexWrap:"wrap"}}>
                  {rule.lvls.map((lvl,j)=>{const a=APR[lvl]||{label:lvl,color:C.blue};return <span key={lvl} style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:10,background:a.color+"15",color:a.color}}>{j+1}. {a.label}</span>;})}
                </div>
                <Badge label={rule.mode==="parallel"?"Parallèle":rule.mode==="quorum"?"Quorum":"Séquentiel"} bg={C.bg2} color={C.text3}/>
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

// ── PAGE DÉTAIL ───────────────────────────────────────────────
const DetailPage = ({items,onUpdate,settings,matrix}) => {
  const {id}=useParams(), nav=useNavigate();
  const [comment,setComment]=useState(""), [acting,setActing]=useState(false);
  const [files,setFiles]=useState([]);
  const item=items.find(i=>i.id===id);

  if(!item) return <div style={{padding:60,textAlign:"center"}}><div style={{color:C.text4,fontSize:16}}>Demande introuvable</div><br/><Btn label="Retour" onClick={()=>nav("/approvals")} ghost color={C.blue} icon="back"/></div>;

  const t=gType(item.type);
  const {lvls,app,cur,done}=getWF(item,matrix);
  const needsAmount=["payment_request","purchase_request","expense_report","advance_request","mission_request"].includes(item.type);

  const doAction=async action=>{ setActing(true); const bid=item._backendId; const u=getUser(); const uName=((u?.firstName||"")+" "+(u?.lastName||"")).trim()||u?.email?.split("@")[0]||"Utilisateur"; const uEmail=u?.email||""; let newApp=[...(item.approvedBy||[])],newStatus=item.status,label=""; if(action==="approve"){ const autoOk=settings.autoApproval.enabled&&item.amount<=settings.autoApproval.maxAmount; newApp=autoOk?[...lvls]:[...newApp,cur]; label=autoOk?"Auto-approuvé (sous seuil)":"Approuvé — "+(APR[cur]?.label||cur); newStatus=newApp.length>=lvls.length?"approved":"pending"; } else if(action==="reject"){newStatus="rejected";label="Rejeté";} else if(action==="pay"){newStatus="paid";label="Paiement effectué";} else if(action==="submit"){newStatus="pending";label="Soumis pour approbation";} const updated={...item,status:newStatus,approvedBy:newApp,bkStatus:newStatus,lastActionAt:new Date().toISOString(),history:[...(item.history||[]),{action:label,by:uName,at:new Date().toISOString(),comment}]}; onUpdate(updated);setComment(""); if(bid){ try{ const bks=item.bkStatus||"review_1"; if(action==="submit") await api.patch("/approvals/"+bid+"/submit",{submittedBy:uName,submittedByEmail:uEmail}); else if(action==="approve"){ if(bks==="submitted"||bks==="review_1"||bks==="draft") await api.patch("/approvals/"+bid+"/review1",{reviewer:uName,reviewerEmail:uEmail,decision:"approve",comment:comment||"Approuvé"}); else if(bks==="review_2") await api.patch("/approvals/"+bid+"/review2",{reviewer:uName,reviewerEmail:uEmail,decision:"approve",comment:comment||"Approuvé"}); else await api.patch("/approvals/"+bid+"/boss-approve",{boss:uName,decision:"approve",comment:comment||"Approuvé"}); } else if(action==="reject"){ if(bks==="submitted"||bks==="review_1"||bks==="draft") await api.patch("/approvals/"+bid+"/review1",{reviewer:uName,reviewerEmail:uEmail,decision:"reject",comment:comment||"Rejeté"}); else if(bks==="review_2") await api.patch("/approvals/"+bid+"/review2",{reviewer:uName,reviewerEmail:uEmail,decision:"reject",comment:comment||"Rejeté"}); else await api.patch("/approvals/"+bid+"/boss-approve",{boss:uName,decision:"reject",comment:comment||"Rejeté"}); } else if(action==="pay"){ await api.patch("/approvals/"+bid+"/mark-paid",{paymentRef:"PAY-"+Date.now().toString().slice(-6),paymentMethod:"Virement bancaire"}); } setTimeout(()=>reloadItems(),700); }catch(e){console.warn("Sync:",e.message);} } setActing(false); };

  const handleFile=e=>{
    const f=e.target.files[0]; if(!f) return;
    const reader=new FileReader();
    reader.onload=ev=>setFiles(prev=>[...prev,{name:f.name,size:f.size,data:ev.target.result}]);
    reader.readAsDataURL(f);
  };

  const Row=({label,value,mono=false})=>value?(
    <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border2}`}}>
      <span style={{fontSize:12,color:C.text3,minWidth:100}}>{label}</span>
      <span style={{fontSize:12,fontWeight:600,color:C.text,textAlign:"right",fontFamily:mono?"'Courier New',monospace":"inherit"}}>{value}</span>
    </div>
  ):null;

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Inter','Segoe UI',Arial,sans-serif"}}>
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"12px 28px",display:"flex",alignItems:"center",gap:10}}>
        <button onClick={()=>nav("/approvals")} style={{display:"flex",alignItems:"center",gap:6,border:"none",background:"none",cursor:"pointer",color:C.blue,fontSize:13,fontWeight:500,padding:0}}>
          <Ic d={I.back} size={14} color={C.blue}/>Approvals
        </button>
        <span style={{color:C.text4}}>/</span>
        <span style={{fontSize:13,color:C.text,fontWeight:600}}>{item.reference}</span>
        <div style={{marginLeft:"auto"}}><StatusBadge item={item} matrix={matrix}/></div>
      </div>
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"18px 28px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:16}}>
            <div style={{width:44,height:44,borderRadius:10,background:t.color+"14",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Ic d={I[t.ik]} size={22} color={t.color}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:11,color:C.text3,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{t.label} · {item.reference}</div>
              <h1 style={{fontSize:19,fontWeight:800,color:C.text,margin:"0 0 3px"}}>{item.title}</h1>
              <div style={{fontSize:12,color:C.text3}}>par <strong style={{color:C.text2}}>{item.submittedBy}</strong> · {fDT(item.submittedAt)}</div>
            </div>
            {item.amount>0&&<div style={{textAlign:"right",flexShrink:0}}><div style={{fontSize:11,color:C.text3,marginBottom:2}}>Montant</div><div style={{fontSize:24,fontWeight:800,color:t.color}}>{fN(item.amount)}</div><div style={{fontSize:11,color:C.text3}}>{item.currency}</div></div>}
          </div>
          <div style={{padding:"14px 16px",background:C.bg,borderRadius:8,border:`1px solid ${C.border2}`}}>
            <div style={{fontSize:10,color:C.text3,textTransform:"uppercase",letterSpacing:.8,marginBottom:10,fontWeight:600}}>Workflow — {app.length}/{lvls.length} étapes</div>
            {item.bkStatus && ["submitted","review_1","review_2","pending_boss"].includes(item.bkStatus) && 
              getWF(item,matrix).isParallel ? 
              <ParallelBadge lvls={getWF(item,matrix).lvls} app={item.approvedBy||[]} config={APR}/> : 
              <WFLine item={item} matrix={matrix}/>}
          </div>
        </div>
      </div>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"20px 28px",display:"grid",gridTemplateColumns:"1fr 360px",gap:20}}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {needsAmount&&item.status==="pending"&&item.amount>0&&<BudgetCheck amount={item.amount}/>}
          <EscBar item={item} settings={settings}/>
          <AIRisk item={item}/>
          <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.border}`,boxShadow:C.shadow,overflow:"hidden"}}>
            <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.border2}`,fontWeight:700,fontSize:13}}>Justification</div>
            <div style={{padding:"12px 16px",fontSize:13,color:C.text2,lineHeight:1.7}}>{item.justification||"—"}</div>
          </div>
          <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.border}`,boxShadow:C.shadow,overflow:"hidden"}}>
            <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.border2}`,fontWeight:700,fontSize:13}}>Informations</div>
            <div style={{padding:"4px 16px"}}><Row label="Type" value={t.label}/><Row label="Priorité" value={item.priority}/><Row label="Site" value={item.site}/><Row label="Projet" value={item.project}/><Row label="Date soumission" value={fD(item.submittedAt)}/></div>
          </div>
          {item.beneficiaryName&&(
            <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.border}`,boxShadow:C.shadow,overflow:"hidden"}}>
              <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.border2}`,fontWeight:700,fontSize:13}}>Bénéficiaire</div>
              <div style={{padding:"4px 16px"}}><Row label="Nom" value={item.beneficiaryName}/><Row label="Banque" value={item.beneficiaryBank}/><Row label="Compte" value={item.beneficiaryAccount} mono/><Row label="Mobile" value={item.beneficiaryMobile}/></div>
            </div>
          )}
          {/* Pièces jointes */}
          <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.border}`,boxShadow:C.shadow,overflow:"hidden"}}>
            <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.border2}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontWeight:700,fontSize:13}}>Pièces jointes ({(item.attachments||[]).length+files.length})</span>
              <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12,color:C.blue,fontWeight:600}}>
                <Ic d={I.attach} size={13} color={C.blue}/> Ajouter<input type="file" onChange={handleFile} style={{display:"none"}}/>
              </label>
            </div>
            <div style={{padding:12}}>
              {[...(item.attachments||[]),...files].map((f,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:C.bg,borderRadius:6,marginBottom:6}}>
                  <Ic d={I.attach} size={14} color={C.blue}/>
                  <span style={{fontSize:12,color:C.text2,flex:1}}>{f.name}</span>
                  <span style={{fontSize:11,color:C.text4}}>{f.size?Math.round(f.size/1024)+"KB":""}</span>
                </div>
              ))}
              {(item.attachments||[]).length===0&&files.length===0&&<div style={{textAlign:"center",color:C.text4,fontSize:12,padding:"12px 0"}}>Aucune pièce jointe</div>}
            </div>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {!["paid","rejected"].includes(item.status)&&(
            <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.border}`,boxShadow:C.shadow,overflow:"hidden"}}>
              <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.border2}`,fontWeight:700,fontSize:13}}>Votre décision</div>
              <div style={{padding:14}}>
                <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={3} placeholder="Commentaire (facultatif)..." style={{width:"100%",padding:"8px 10px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical",boxSizing:"border-box",marginBottom:10}}/>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {item.status==="pending"&&item._backendId&&<BCMatchingPanel item={item} onMatch={bc=>{const u={...item,bcRef:bc.ref};onUpdate(u);}}/>}
                  {item.status==="pending"&&<EmailApprovalLink item={item}/>}
                  {item.status==="draft"&&<Btn label="Soumettre pour approbation" onClick={()=>doAction("submit")} disabled={acting} icon="send" full color={C.blue}/>}
                  {item.status==="pending"&&!done&&cur&&<Btn label={"Approuver — "+(APR[cur]?.label||cur)} onClick={()=>doAction("approve")} disabled={acting} icon="check" full color={APR[cur]?.color||C.green}/>}
                  {(done||item.status==="approved")&&item.status!=="paid"&&<Btn label="Confirmer paiement" onClick={()=>doAction("pay")} disabled={acting} icon="bank" full color={C.green}/>}
                  {item.status==="pending"&&!done&&<Btn label="Rejeter la demande" onClick={()=>doAction("reject")} disabled={acting} icon="x" full ghost danger/>}
                </div>
              </div>
            </div>
          )}
          {["paid","rejected"].includes(item.status)&&(
            <div style={{padding:14,borderRadius:8,border:`1px solid ${item.status==="paid"?C.green:C.red}`,background:item.status==="paid"?"#D1FAE5":"#FEE2E2",textAlign:"center",fontSize:13,fontWeight:700,color:item.status==="paid"?C.green:C.red}}>
              {item.status==="paid"?"Demande clôturée et payée":"Demande rejetée"}
            </div>
          )}
          <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.border}`,boxShadow:C.shadow,overflow:"hidden"}}>
            <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.border2}`,fontWeight:700,fontSize:13}}>Historique</div>
            <div style={{padding:"8px 16px"}}>
              {(item.history||[]).length===0&&<div style={{padding:"16px 0",textAlign:"center",color:C.text4,fontSize:12}}>Aucune action</div>}
              {(item.history||[]).map((h,i)=>(
                <div key={i} style={{display:"flex",gap:10,paddingBottom:14}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                    <div style={{width:26,height:26,borderRadius:"50%",background:C.green,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic d={I.check} size={12} color="#fff" sw={2.5}/></div>
                    {i<(item.history||[]).length-1&&<div style={{width:1,flex:1,minHeight:12,background:C.border2,margin:"3px 0"}}/>}
                  </div>
                  <div style={{flex:1,paddingTop:3}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.text}}>{h.action}</div>
                    <div style={{fontSize:11,color:C.text3,marginTop:1}}>par {h.by} · {fDT(h.at)}</div>
                    {h.comment&&<div style={{fontSize:12,color:C.text2,marginTop:4,padding:"5px 8px",background:C.bg,borderRadius:4,borderLeft:`2px solid ${C.border}`,fontStyle:"italic"}}>{h.comment}</div>}
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

// ── MODAL NOUVELLE DEMANDE ────────────────────────────────────
const NewModal = ({onClose,onSave,matrix,settings}) => {
  const [step,setStep]=useState(1),[type,setType]=useState(""),[saving,setSaving]=useState(false);
  const [form,setForm]=useState({title:"",amount:"",currency:"FCFA",priority:"normale",justification:"",site:"",project:"",beneficiaryType:"",beneficiaryName:"",beneficiaryBank:"",beneficiaryAccount:"",beneficiaryMobile:"",beneficiaryEmail:"",dateDebut:"",dateFin:"",destination:"",transportMode:"",bcPo:"",bcProject:"",bcSiteCode:"",bcDuid:""});
  const [collabs,setCollabs]=React.useState([]);
  React.useEffect(()=>{api.get("/users").then(r=>{if(Array.isArray(r.data))setCollabs(r.data);}).catch(()=>{const stored=localStorage.getItem("cleanit_user");if(stored){try{const u=JSON.parse(stored);setCollabs([u]);}catch{}}});},[]);
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  // Charger les sites BC depuis localStorage (alimenté par module Bons de Commande)
  const bcSites=React.useMemo(()=>{try{return JSON.parse(localStorage.getItem('cleanit_bc_sites')||'[]');}catch{return[];}}, []);
  const handleSiteChange=(siteId)=>{
    upd('site',siteId);
    if(type==="payment_request"&&bcSites.length>0){
      const bc=bcSites.find(s=>s.site_id===siteId);
      if(bc){upd('bcPo',bc.po||'');upd('bcProject',(bc.project_code||'')+' — '+(bc.project_name||''));upd('bcSiteCode',bc.site_code||'');upd('bcDuid',bc.duid||'');}
    }
  };
  const siteOpts=bcSites.length>0?[...(new Set(bcSites.map(s=>s.site_id).filter(Boolean)))]
    :["DLA-001","DLA-003","YDE-001","KRI-001","GAR-001","LIM-001","Bureau principal"];
  const t=TYPES.find(tt=>tt.id===type);
  const rule=type?getLevels(type,Number(form.amount)||0,matrix):{lvls:[],mode:"sequential"};
  const lvls=rule.lvls;
  const needsAmt=["payment_request","purchase_request","expense_report","advance_request","mission_request"].includes(type);
  const needsBenef=["payment_request","purchase_request","advance_request","mission_request"].includes(type);
  const needsDates=["leave_request","mission_request","training_request"].includes(type);
  const withSite=["payment_request","purchase_request","mission_request","equipment_request"].includes(type);
  const isAutoApproved=settings?.autoApproval?.enabled&&Number(form.amount)<=settings.autoApproval.maxAmount&&settings.autoApproval.types?.includes(type);

  const Inp=({label,k,tp="text",ph="",req=false})=>(
    <div style={{marginBottom:12}}>
      <label style={{display:"block",fontSize:11,fontWeight:600,color:C.text2,marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>{label}{req&&<span style={{color:C.red}}> *</span>}</label>
      <input type={tp} value={form[k]} onChange={e=>upd(k,e.target.value)} placeholder={ph} style={{width:"100%",padding:"8px 10px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
    </div>
  );
  const Sel=({label,k,opts})=>(
    <div style={{marginBottom:12}}>
      <label style={{display:"block",fontSize:11,fontWeight:600,color:C.text2,marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>{label}</label>
      <select value={form[k]} onChange={e=>upd(k,e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",outline:"none",background:C.white}}>
        <option value="">Sélectionner...</option>{opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const save=submit=>{
    if(!type||!form.title){alert("Type et titre requis");return;}
    setSaving(true);
    const autoOk=isAutoApproved&&submit;
    const m=getLevels(type,Number(form.amount)||0,matrix);
    const item={id:"APV-"+Date.now(),reference:"APV-"+new Date().getFullYear()+"-"+String(Math.floor(Math.random()*900+100)),type,...form,amount:Number(form.amount)||0,status:autoOk?"approved":submit?"pending":"draft",submittedBy:"Utilisateur connecté",submittedAt:new Date().toISOString(),lastActionAt:new Date().toISOString(),approvedBy:autoOk?[...m.lvls]:[],attachments:[],history:submit?[{action:autoOk?"Auto-approuvé (sous seuil)":"Soumis",by:"Utilisateur connecté",at:new Date().toISOString(),comment:""}]:[]};
    onSave(item);setSaving(false);onClose();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:C.white,borderRadius:12,width:"100%",maxWidth:560,maxHeight:"92vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.25)",fontFamily:"inherit"}}>
        <div style={{background:t?.color||C.blue,padding:"16px 20px",borderRadius:"12px 12px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:10,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Étape {step}/3</div><div style={{fontSize:16,fontWeight:700,color:"#fff"}}>{t?.label||"Nouvelle demande"}</div></div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{display:"flex",gap:3}}>{[1,2,3].map(s=><div key={s} style={{width:s<=step?18:7,height:7,borderRadius:4,background:s<=step?"#fff":"rgba(255,255,255,0.3)",transition:"width .2s"}}/>)}</div>
            <button onClick={onClose} style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic d={I.x} size={14} color="#fff"/></button>
          </div>
        </div>
        <div style={{padding:20}}>
          {step===1&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
                {TYPES.map(td=>(
                  <div key={td.id} onClick={()=>setType(td.id)} style={{padding:"10px 12px",borderRadius:8,border:`2px solid ${type===td.id?td.color:C.border}`,background:type===td.id?td.color+"08":C.white,cursor:"pointer",transition:"all .15s",display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:30,height:30,borderRadius:6,background:td.color+"14",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ic d={I[td.ik]} size={15} color={td.color}/></div>
                    <div><div style={{fontSize:12,fontWeight:type===td.id?700:500,color:type===td.id?td.color:C.text}}>{td.label}</div></div>
                  </div>
                ))}
              </div>
              {type&&lvls.length>0&&(
                <div style={{padding:"10px 12px",background:"#EFF6FF",borderRadius:6,border:"1px solid #BFDBFE",marginBottom:12}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.blue,marginBottom:6}}>Workflow automatique :</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {lvls.map((l,i)=>{const a=APR[l]||{label:l,color:C.blue};return <span key={l} style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:10,background:a.color+"15",color:a.color}}>{i+1}. {a.label}</span>;})}
                  </div>
                </div>
              )}
              <div style={{display:"flex",justifyContent:"flex-end",paddingTop:12,borderTop:`1px solid ${C.border2}`}}>
                <Btn label="Suivant" onClick={()=>type&&setStep(2)} disabled={!type} color={t?.color||C.blue}/>
              </div>
            </div>
          )}
          {step===2&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
                <div style={{gridColumn:"1/-1"}}><Inp label="Titre" k="title" ph={t?.label} req/></div>
                <Sel label="Priorité" k="priority" opts={["haute","normale","basse"]}/>
                {needsAmt&&<Inp label="Montant" k="amount" tp="number" ph="0" req/>}
                {needsAmt&&<Sel label="Devise" k="currency" opts={["FCFA","USD","EUR","CNY"]}/>}
                {needsDates&&<><Inp label="Date début" k="dateDebut" tp="date"/><Inp label="Date fin" k="dateFin" tp="date"/></>}
                {type==="mission_request"&&<><Inp label="Destination" k="destination"/><Sel label="Transport" k="transportMode" opts={["Véhicule société","Avion","Bus","Taxi","Véhicule personnel"]}/></>}
                {withSite&&<>
                  <div style={{marginBottom:12}}>
                    <label style={{display:"block",fontSize:11,fontWeight:600,color:C.text2,marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>
                      Site {type==="payment_request"&&bcSites.length>0&&<span style={{fontSize:10,color:"#0066CC",fontWeight:400,textTransform:"none"}}> — {siteOpts.length} sites BC disponibles</span>}
                    </label>
                    <select value={form.site} onChange={e=>handleSiteChange(e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:6,border:"1px solid "+C.border,fontSize:13,fontFamily:"inherit",outline:"none",background:C.white}}>
                      <option value="">Sélectionner un site...</option>
                      {siteOpts.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                    {type==="payment_request"&&form.site&&bcSites.find(s=>s.site_id===form.site)&&<div style={{fontSize:10,color:"#0066CC",marginTop:3}}>✓ Champs BC remplis automatiquement</div>}
                  </div>
                  <Inp label="Projet" k="project" ph="PROJ-2025-001"/>
                </>}
                {type==="payment_request"&&<div style={{gridColumn:"1/-1",padding:"8px 12px",background:"#EFF6FF",borderRadius:6,border:"1px solid #BFDBFE",fontSize:11,color:"#0066CC",fontWeight:600}}>Bon de Commande — Champs optionnels (si paiement lié à un BC client)</div>}
                {type==="payment_request"&&<Inp label="N° BC / PO" k="bcPo" ph="ex: 416121376123-2"/>}
                {type==="payment_request"&&<Inp label="Code Projet BC" k="bcProject" ph="ex: 56A0KY1 — DWDM"/>}
                {type==="payment_request"&&<Inp label="Code Site" k="bcSiteCode" ph="ex: GN-CEN-BOUMNYEBEL_eLTE"/>}
                {type==="payment_request"&&<Inp label="DUID Équipement" k="bcDuid" ph="ex: ON-OSN9800-SWAP-T46-031"/>}
                <div style={{gridColumn:"1/-1"}}>
                  <label style={{display:"block",fontSize:11,fontWeight:600,color:C.text2,marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>Justification <span style={{color:C.red}}>*</span></label>
                  <textarea value={form.justification} onChange={e=>upd("justification",e.target.value)} rows={3} placeholder="Décrivez la raison de cette demande..." style={{width:"100%",padding:"8px 10px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
                </div>
              </div>
              {needsAmt&&Number(form.amount)>0&&<BudgetCheck amount={Number(form.amount)}/>}
              {isAutoApproved&&<div style={{padding:"8px 12px",background:"#D1FAE5",borderRadius:6,border:"1px solid #6EE7B7",fontSize:12,color:"#065F46",fontWeight:600,marginTop:8}}>✓ Cette demande sera auto-approuvée (sous le seuil de {fN(settings.autoApproval.maxAmount)} FCFA)</div>}
              <div style={{display:"flex",justifyContent:"space-between",paddingTop:12,borderTop:`1px solid ${C.border2}`,marginTop:12}}>
                <Btn label="Retour" onClick={()=>setStep(1)} ghost color={C.text3}/>
                <Btn label="Suivant" onClick={()=>setStep(3)} color={t?.color||C.blue}/>
              </div>
            </div>
          )}
          {step===3&&(
            <div>
              {needsBenef&&(
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>Bénéficiaire du paiement</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginBottom:12}}>
                    {[["collab","Collaborateur","Technicien ou employé"],["fournisseur","Fournisseur","Prestataire externe"],["autre","Autre","Loyer, TVA, CNPS..."]].map(([id,l,sub])=>(
                      <div key={id} onClick={()=>upd("beneficiaryType",id)}
                        style={{padding:"10px 8px",border:`2px solid ${form.beneficiaryType===id?C.blue:C.border}`,borderRadius:8,cursor:"pointer",textAlign:"center",background:form.beneficiaryType===id?C.blue+"0A":"transparent",transition:"all .15s"}}>
                        <div style={{fontSize:12,fontWeight:600,color:form.beneficiaryType===id?C.blue:C.text,marginBottom:2}}>{l}</div>
                        <div style={{fontSize:10,color:C.text3}}>{sub}</div>
                      </div>
                    ))}
                  </div>
                  {form.beneficiaryType==="collab"&&(
                    <div>
                      <div style={{marginBottom:10}}>
                        <label style={{display:"block",fontSize:11,fontWeight:600,color:C.text2,marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>Sélectionner le collaborateur <span style={{color:C.red}}>*</span></label>
                        <select value={form.beneficiaryName} onChange={e=>{const sel=collabs.find(u=>(u.firstName+" "+u.lastName)===e.target.value||u.email===e.target.value);upd("beneficiaryName",e.target.value);if(sel){upd("beneficiaryEmail",sel.email||"");upd("beneficiaryBank",sel.bank||sel.profile?.bank||"BICEC");upd("beneficiaryAccount",sel.account||sel.profile?.account||"");upd("beneficiaryMobile",sel.phone||sel.profile?.phone||"");}}}
                          style={{width:"100%",padding:"8px 10px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",outline:"none",background:C.white}}>
                          <option value="">Choisir un collaborateur...</option>
                          {collabs.map(u=><option key={u.id||u.email} value={(u.firstName||"")+" "+(u.lastName||"")}>{u.firstName} {u.lastName} — {u.role}</option>)}
                        </select>
                      </div>
                      {form.beneficiaryName&&(
                        <div style={{padding:"10px 12px",background:C.bg,borderRadius:6,border:`1px solid ${C.border}`,display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 12px",fontSize:12}}>
                          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:C.text3}}>Email</span><span style={{fontWeight:600}}>{form.beneficiaryEmail||"—"}</span></div>
                          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:C.text3}}>Banque</span><span style={{fontWeight:600}}>{form.beneficiaryBank||"—"}</span></div>
                          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:C.text3}}>Compte</span><span style={{fontWeight:500,fontSize:11,fontFamily:"monospace"}}>{form.beneficiaryAccount||"À compléter"}</span></div>
                          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:C.text3}}>Mobile Money</span><span style={{fontWeight:600}}>{form.beneficiaryMobile||"—"}</span></div>
                          <div style={{gridColumn:"1/-1",fontSize:10,color:C.green,display:"flex",alignItems:"center",gap:4,marginTop:4,paddingTop:6,borderTop:`1px solid ${C.border2}`}}>
                            <Ic d={I.check} size={11} color={C.green}/>Informations importées depuis le profil
                          </div>
                        </div>
                      )}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px",marginTop:8}}>
                        <div style={{gridColumn:"1/-1"}}>
                          <label style={{display:"block",fontSize:11,fontWeight:600,color:C.text2,marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>Banque</label>
                          <select value={form.beneficiaryBank} onChange={e=>upd("beneficiaryBank",e.target.value)} style={{width:"100%",padding:"8px 10px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",outline:"none",background:C.white,marginBottom:8}}>
                            {["BICEC","Société Générale Cameroun","Afriland First Bank","UBA Cameroun","Ecobank","BGFI Bank"].map(b=><option key={b}>{b}</option>)}
                          </select>
                        </div>
                        <Inp label="Numéro de compte" k="beneficiaryAccount" ph="CM21 XXXX XXXX XXXX"/>
                        <Inp label="Mobile Money" k="beneficiaryMobile" ph="6XX XXX XXX"/>
                      </div>
                    </div>
                  )}
                  {form.beneficiaryType==="fournisseur"&&(
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
                      <div style={{gridColumn:"1/-1"}}><Inp label="Nom du fournisseur" k="beneficiaryName" ph="Huawei Cameroun SARL" req/></div>
                      <Sel label="Banque" k="beneficiaryBank" opts={["BICEC","Société Générale Cameroun","Afriland First Bank","UBA Cameroun","Ecobank","BGFI Bank"]}/>
                      <Inp label="Numéro de compte" k="beneficiaryAccount" ph="CM21 XXXX XXXX XXXX"/>
                      <Inp label="Email" k="beneficiaryEmail" tp="email"/>
                      <Inp label="Téléphone" k="beneficiaryMobile" ph="+237 6XX XXX XXX"/>
                    </div>
                  )}
                  {form.beneficiaryType==="autre"&&(
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
                      <div style={{gridColumn:"1/-1"}}><Inp label="Nature du paiement" k="beneficiaryName" ph="ex: Loyer bureaux mai 2025 / TVA / CNPS" req/></div>
                      <Inp label="Référence / N° avis" k="beneficiaryAccount" ph="ex: CNPS-2025-Q1"/>
                      <Inp label="Contact / Email" k="beneficiaryEmail" tp="email" ph="dgi@impots.cm"/>
                    </div>
                  )}
                </div>
              )}
              <div style={{background:C.bg,borderRadius:6,padding:12,marginBottom:12,fontSize:12}}>
                <div style={{fontWeight:700,marginBottom:8}}>Récapitulatif</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  {[{l:"Type",v:t?.label},{l:"Titre",v:form.title||"—"},{l:"Priorité",v:form.priority},{l:"Montant",v:needsAmt?fN(Number(form.amount)||0)+" "+form.currency:null}].filter(i=>i.v).map(i=>(
                    <div key={i.l}><div style={{fontSize:10,color:C.text4,textTransform:"uppercase",marginBottom:1}}>{i.l}</div><div style={{fontWeight:500,color:C.text}}>{i.v}</div></div>
                  ))}
                </div>
              </div>
              {!isAutoApproved&&<div style={{padding:"8px 12px",background:"#EFF6FF",borderRadius:6,border:"1px solid #BFDBFE",marginBottom:12,fontSize:12,color:C.blue}}>Workflow: <strong>{lvls.map(l=>APR[l]?.label||l).join(" → ")}</strong></div>}
              {isAutoApproved&&<div style={{padding:"8px 12px",background:"#D1FAE5",borderRadius:6,border:"1px solid #6EE7B7",marginBottom:12,fontSize:12,color:"#065F46",fontWeight:600}}>✓ Auto-approbation active</div>}
              <div style={{display:"flex",justifyContent:"space-between",paddingTop:12,borderTop:`1px solid ${C.border2}`}}>
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

// ── PAGE LISTE ────────────────────────────────────────────────
const ListPage = ({items,onAdd,settings,setSettings,matrix,setMatrix}) => {
  const [condRoutes,setCondRoutes]=useState(CONDITIONAL_ROUTES||[]);
  const nav=useNavigate();
  const [tab,setTab]=useState("all"),[view,setView]=useState("list");
  const [search,setSearch]=useState(""),[ft,setFt]=useState(""),[showNew,setShowNew]=useState(false);
  const [amtMin,setAmtMin]=useState("");
  const [amtMax,setAmtMax]=useState("");
  const [dateFrom,setDateFrom]=useState("");
  const [dateTo,setDateTo]=useState("");

  const pending=items.filter(i=>i.status==="pending"&&!getWF(i,matrix).done);
  const approved=items.filter(i=>i.status==="approved"||getWF(i,matrix).done);
  const escalated=items.filter(i=>{const e=getEsc(i,settings);return e&&e.urgent;});
  const TABS=[
    {id:"all",label:"Toutes",n:items.length},
    {id:"pending",label:"En attente",n:pending.length},
    {id:"approved",label:"Approuvées",n:approved.length},
    {id:"escalated",label:"Escalade",n:escalated.length},
    {id:"cancelled",label:"Annulées",n:items.filter(i=>i.status==="cancelled").length},
    {id:"reports",label:"Rapports",n:null},
    {id:"audit",label:"Audit Trail",n:null},
    {id:"matrix",label:"Matrice",n:null},
    {id:"settings",label:"Paramètres",n:null},
  ];
  const isSpecial=["reports","audit","matrix","settings"].includes(tab);
  const filtered=isSpecial?[]:items.filter(i=>{
    const ms=!search||i.title.toLowerCase().includes(search.toLowerCase())||i.reference.toLowerCase().includes(search.toLowerCase())||i.submittedBy.toLowerCase().includes(search.toLowerCase());
    const mf=!ft||i.type===ft;
    const ma=!amtMin||i.amount>=parseFloat(String(amtMin).replace(/\s/g,""))||0;
    const mb=!amtMax||i.amount<=parseFloat(String(amtMax).replace(/\s/g,""))||Infinity;
    const md=!dateFrom||new Date(i.submittedAt)>=new Date(dateFrom);
    const me=!dateTo||new Date(i.submittedAt)<=new Date(dateTo+"T23:59:59");
    const mt=tab==="pending"?pending.includes(i):tab==="approved"?approved.includes(i):tab==="escalated"?escalated.includes(i):tab==="cancelled"?i.status==="cancelled":true;
    return ms&&mf&&mt;
  });

  const getCol=item=>{
    if(item.status==="draft") return "draft";
    if(item.status==="paid") return "paid";
    if(item.status==="rejected") return "rejected";
    const {done}=getWF(item,matrix);
    if(done||item.status==="approved") return "approved";
    const e=getEsc(item,settings);
    return e&&e.urgent?"escalade":"pending";
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Inter','Segoe UI',Arial,sans-serif"}}>
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"0 24px"}}>
        <div style={{maxWidth:1300,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0 10px"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:40,height:40,borderRadius:10,background:"linear-gradient(135deg,#0066CC,#5C2D91)",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic d={I.check} size={20} color="#fff" sw={2.5}/></div>
              <div><h1 style={{fontSize:17,fontWeight:800,color:C.text,margin:0}}>Approvals</h1><p style={{color:C.text3,margin:0,fontSize:11}}>Workflow multi-niveaux · Matrix · Budget check · IA · Audit · Délégation</p></div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {!isSpecial&&<div style={{display:"flex",background:C.bg,borderRadius:6,padding:2,border:`1px solid ${C.border}`}}>
                {[{v:"list",ik:"list"},{v:"kanban",ik:"grid"}].map(vt=>(
                  <button key={vt.v} onClick={()=>setView(vt.v)} style={{width:30,height:28,borderRadius:4,border:"none",background:view===vt.v?C.white:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:view===vt.v?C.shadow:"none"}}>
                    <Ic d={I[vt.ik]} size={14} color={view===vt.v?C.blue:C.text4}/>
                  </button>
                ))}
              </div>}
              <Btn label="Nouvelle demande" onClick={()=>setShowNew(true)} color={C.blue} icon="plus"/>
            </div>
          </div>
          <div style={{display:"flex",gap:0,overflowX:"auto"}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"9px 14px",border:"none",borderBottom:`2px solid ${tab===t.id?C.blue:"transparent"}`,background:"transparent",color:tab===t.id?C.blue:C.text3,fontWeight:tab===t.id?700:400,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:"inherit",whiteSpace:"nowrap",transition:"all .1s"}}>
                {t.label}{t.n!=null&&t.n>0&&<span style={{padding:"1px 6px",borderRadius:8,fontSize:10,fontWeight:700,background:tab===t.id?C.blue+"18":C.bg2,color:tab===t.id?C.blue:C.text3}}>{t.n}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{maxWidth:1300,margin:"0 auto",padding:"18px 24px"}}>
        {tab==="reports"&&<ReportsView items={items} matrix={matrix} settings={settings}/>}
        {tab==="notifications"&&<div style={{padding:16}}><NotificationsPanel items={items}/><RecurringApprovalPanel onAdd={add}/></div>}
        {tab==="audit"&&<AuditView items={items}/>}
        {tab==="matrix"&&<MatriceView matrix={matrix}/>}
        {tab==="settings"&&(
          <div>
            <div style={{marginBottom:20}}>
              {typeof ConditionalRoutingSettings==="function"&&<ConditionalRoutingSettings routes={condRoutes} setRoutes={setCondRoutes}/>}
            </div>
            <SettingsView settings={settings} setSettings={setSettings} matrix={matrix} setMatrix={setMatrix}/>
          </div>
        )}
        {!isSpecial&&(
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:18}}>
              {[
                {l:"Total",v:items.length,c:C.blue,ik:"list"},
                {l:"En attente",v:pending.length,c:C.orange,ik:"clock"},
                {l:"Approuvées",v:approved.length,c:C.green,ik:"check"},
                {l:"Escalades",v:escalated.length,c:C.red,ik:"alert"},
                {l:"Montant soumis",v:fN(items.reduce((s,i)=>s+i.amount,0))+" F",c:C.purple,ik:"bank"},
                {l:"Montant approuvé",v:fN([...approved,...items.filter(i=>i.status==="paid")].reduce((s,i)=>s+i.amount,0))+" F",c:C.green,ik:"bank"},
              ].map(k=>(
                <div key={k.l} style={{background:C.white,borderRadius:8,padding:"11px 13px",border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <span style={{fontSize:10,color:C.text3,textTransform:"uppercase",letterSpacing:.4,fontWeight:600}}>{k.l}</span>
                    <div style={{width:24,height:24,borderRadius:5,background:k.c+"14",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic d={I[k.ik]} size={12} color={k.c}/></div>
                  </div>
                  <div style={{fontSize:typeof k.v==="string"?10:18,fontWeight:800,color:k.c,lineHeight:1}}>{k.v}</div>
                </div>
              ))}
            </div>
            {escalated.length>0&&(
              <div style={{background:"#FEF2F2",borderRadius:8,padding:"11px 14px",border:"1px solid #FECACA",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}><Ic d={I.alert} size={16} color={C.red}/><span style={{fontSize:13,fontWeight:700,color:C.red}}>{escalated.length} demande{escalated.length>1?"s":""} en escalade</span></div>
                <Btn label="Voir" onClick={()=>setTab("escalated")} ghost color={C.red} sm/>
              </div>
            )}
            <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
              <div style={{flex:2,minWidth:180,display:"flex",alignItems:"center",gap:8,background:C.white,borderRadius:6,padding:"7px 12px",border:`1px solid ${C.border}`}}>
                <Ic d={I.search} size={14} color={C.text4}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par titre, référence, demandeur..." style={{flex:1,border:"none",outline:"none",fontSize:12,fontFamily:"inherit",color:C.text,background:"transparent"}}/>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,background:C.white,borderRadius:6,padding:"7px 12px",border:`1px solid ${C.border}`}}>
                <Ic d={I.filter} size={13} color={C.text3}/>
                <select value={ft} onChange={e=>setFt(e.target.value)} style={{border:"none",outline:"none",fontSize:12,fontFamily:"inherit",color:C.text,background:"transparent",cursor:"pointer"}}>
                  <option value="">Tous types</option>{TYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4,background:C.white,borderRadius:6,padding:"7px 10px",border:`1px solid ${C.border}`}}>
                <span style={{fontSize:10,color:C.text3,whiteSpace:"nowrap"}}>Montant:</span>
                <input value={amtMin} onChange={e=>setAmtMin(e.target.value)} placeholder="Min" style={{width:60,border:"none",outline:"none",fontSize:11,fontFamily:"inherit",color:C.text,background:"transparent"}}/>
                <span style={{color:C.text4}}>—</span>
                <input value={amtMax} onChange={e=>setAmtMax(e.target.value)} placeholder="Max" style={{width:60,border:"none",outline:"none",fontSize:11,fontFamily:"inherit",color:C.text,background:"transparent"}}/>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4,background:C.white,borderRadius:6,padding:"7px 10px",border:`1px solid ${C.border}`}}>
                <span style={{fontSize:10,color:C.text3,whiteSpace:"nowrap"}}>Du:</span>
                <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{border:"none",outline:"none",fontSize:11,fontFamily:"inherit",color:C.text,background:"transparent"}}/>
                <span style={{color:C.text4}}>Au:</span>
                <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} style={{border:"none",outline:"none",fontSize:11,fontFamily:"inherit",color:C.text,background:"transparent"}}/>
              </div>
              <Btn label="Export" ghost color={C.text3} sm icon="download"/>
            </div>
            {view==="kanban"&&(
              <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8}}>
                {[{key:"draft",label:"Brouillon",c:"#9CA3AF"},{key:"pending",label:"En attente",c:C.orange},{key:"escalade",label:"Escalade",c:C.red},{key:"approved",label:"Approuvé",c:C.green},{key:"paid",label:"Payé",c:"#065F46"},{key:"rejected",label:"Rejeté",c:C.red}].map(col=>{
                  const colItems=filtered.filter(i=>getCol(i)===col.key);
                  return (
                    <div key={col.key} style={{minWidth:200,flex:"0 0 200px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:7,height:7,borderRadius:"50%",background:col.c}}/><span style={{fontSize:11,fontWeight:700,color:C.text}}>{col.label}</span></div>
                        <span style={{fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:8,background:col.c+"15",color:col.c}}>{colItems.length}</span>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:7}}>
                        {colItems.map(item=>{
                          const tp=gType(item.type);
                          return (
                            <div key={item.id} onClick={()=>nav("/approvals/"+item.id)} style={{padding:"10px 12px",background:C.white,borderRadius:7,border:`1px solid ${C.border}`,cursor:"pointer",borderLeft:`3px solid ${tp.color}`,boxShadow:C.shadow,transition:"all .15s"}}
                              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.1)"}}
                              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=C.shadow}}>
                              <div style={{fontSize:11,fontWeight:600,color:C.text,marginBottom:5,lineHeight:1.3}}>{item.title.slice(0,45)}{item.title.length>45?"...":""}</div>
                              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                <span style={{fontSize:10,color:C.text3}}>{item.submittedBy}</span>
                                {item.amount>0&&<span style={{fontSize:10,fontWeight:700,color:tp.color}}>{fN(item.amount)} F</span>}
                              </div>
                              <div style={{marginTop:6}}><WFLine item={item} matrix={matrix} compact/></div>
                            </div>
                          );
                        })}
                        {colItems.length===0&&<div style={{padding:12,textAlign:"center",color:C.text4,fontSize:11,background:C.bg2,borderRadius:6,border:`1px dashed ${C.border}`}}>Vide</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {view==="list"&&(
              <div style={{background:C.white,borderRadius:8,border:`1px solid ${C.border}`,boxShadow:C.shadow,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr style={{background:C.bg,borderBottom:`1px solid ${C.border}`}}>
                    {["Demande","Type","Soumis par","Montant","Progression","Escalade","Statut",""].map(h=><th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {filtered.map(item=>{
                      const tp=gType(item.type),{lvls,app}=getWF(item,matrix),e=getEsc(item,settings);
                      const avC=[C.blue,C.green,C.purple,C.orange,C.red][item.submittedBy?.charCodeAt(0)%5]||C.blue;
                      return (
                        <tr key={item.id} onClick={()=>nav("/approvals/"+item.id)} style={{borderBottom:`1px solid ${C.border2}`,cursor:"pointer"}}
                          onMouseEnter={ev=>ev.currentTarget.style.background="#F8F9FE"}
                          onMouseLeave={ev=>ev.currentTarget.style.background=C.white}>
                          <td style={{padding:"11px 12px"}}>
                            <div style={{display:"flex",alignItems:"center",gap:9}}>
                              <div style={{width:30,height:30,borderRadius:6,background:tp.color+"14",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Ic d={I[tp.ik]} size={14} color={tp.color}/></div>
                              <div><div style={{fontSize:12,fontWeight:600,color:C.text,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</div><div style={{fontSize:10,color:C.text4,fontFamily:"monospace"}}>{item.reference}</div></div>
                            </div>
                          </td>
                          <td style={{padding:"11px 12px",fontSize:11,color:C.text2,whiteSpace:"nowrap"}}>{tp.label}</td>
                          <td style={{padding:"11px 12px"}}><div style={{display:"flex",alignItems:"center",gap:6}}><Av name={item.submittedBy} size={22} color={avC}/><span style={{fontSize:12,color:C.text2}}>{item.submittedBy}</span></div></td>
                          <td style={{padding:"11px 12px",fontSize:12,fontWeight:700,color:item.amount>0?tp.color:C.text4,whiteSpace:"nowrap"}}>{item.amount>0?fN(item.amount)+" F":"—"}</td>
                          <td style={{padding:"11px 12px"}}><div style={{fontSize:10,color:C.text3,marginBottom:3}}>{app.length}/{lvls.length}</div><div style={{width:60,height:4,background:"#E5E7EB",borderRadius:2}}><div style={{width:(lvls.length>0?app.length/lvls.length*100:0)+"%",height:"100%",background:C.blue,borderRadius:2}}/></div></td>
                          <td style={{padding:"11px 12px"}}>{e&&e.urgent?<Badge label={e.overdue?"Dépassé":e.remaining+"h"} bg={(e.overdue?C.red:C.orange)+"18"} color={e.overdue?C.red:C.orange}/>:<span style={{color:C.text4,fontSize:12}}>—</span>}</td>
                          <td style={{padding:"11px 12px"}}><StatusBadge item={item} matrix={matrix}/></td>
                          <td style={{padding:"11px 12px"}}><Ic d={I.chevron} size={14} color={C.blue}/></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filtered.length===0&&<div style={{padding:48,textAlign:"center",color:C.text4}}><Ic d={I.list} size={36} color={C.border}/><div style={{fontSize:14,fontWeight:700,marginTop:10,color:C.text3}}>Aucune demande</div></div>}
              </div>
            )}
          </>
        )}
      </div>
      {showNew&&<NewModal onClose={()=>setShowNew(false)} onSave={onAdd} matrix={matrix} settings={settings}/>}
    </div>
  );
};

// ── COMPOSANT PRINCIPAL ───────────────────────────────────────

const mapBkStatus=s=>{ if(!s||s==="draft") return "draft"; if(["submitted","review_1","review_2","pending_boss"].includes(s)) return "pending"; if(s==="approved") return "approved"; if(s==="paid") return "paid"; if(s==="rejected") return "rejected"; return "draft"; };
const buildApprovedBy=a=>{ const l=[]; if(a.reviewer1Decision==="approved") l.push("manager"); if(a.reviewer2Decision==="approved") l.push("finance1"); if(["approved","paid"].includes(a.status)) l.push("dg"); return l; };
const mapApproval=a=>({ id:String(a.id), _backendId:a.id, reference:a.reference||("APV-"+a.id), type:a.type||"payment_request", title:a.projectName||a.description||"Demande", amount:Number(a.amount)||0, currency:"FCFA", status:mapBkStatus(a.status), bkStatus:a.status, priority:Number(a.amount)>1000000?"haute":"normale", submittedBy:a.submittedBy||"Utilisateur", submittedAt:a.submittedAt||a.createdAt, lastActionAt:a.updatedAt||a.createdAt, beneficiaryName:a.beneficiaryName||"", beneficiaryBank:a.beneficiaryBank||"", beneficiaryAccount:a.beneficiaryAccount||"", beneficiaryMobile:a.beneficiaryMobile||"", justification:a.justification||a.description||"", site:a.siteCode||"", project:a.projectCode||"", history:Array.isArray(a.history)?a.history:[], attachments:[], approvedBy:buildApprovedBy(a), autoApproved:a.autoApproved||false, approvalComment:a.approvalComment||"", paidAt:a.paidAt, paymentReference:a.paymentReference, paymentMethod:a.paymentMethod });


const BulkBar = ({selected,items,onBulkAction,onClear}) => {
  if(!selected.length) return null;
  return (
    <div style={{position:"sticky",top:0,zIndex:50,background:"#0052CC",padding:"10px 20px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 2px 12px rgba(0,82,204,.3)"}}>
      <span style={{color:"#fff",fontSize:13,fontWeight:700}}>{selected.length} demande{selected.length>1?"s":""} sélectionnée{selected.length>1?"s":""}</span>
      <div style={{marginLeft:"auto",display:"flex",gap:8}}>
        <button onClick={()=>onBulkAction("approve")} style={{padding:"6px 16px",borderRadius:6,border:"none",background:"#22c55e",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>Tout approuver</button>
        <button onClick={()=>onBulkAction("reject")}  style={{padding:"6px 16px",borderRadius:6,border:"none",background:"#ef4444",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>Tout rejeter</button>
        <button onClick={onClear} style={{padding:"6px 16px",borderRadius:6,border:"1px solid rgba(255,255,255,.4)",background:"none",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>Annuler</button>
      </div>
    </div>
  );
};
const ExpiryBadge = ({item}) => {
  const label = getExpiryLabel(item);
  if(!label) return null;
  const expired = isExpired(item);
  return <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:8,background:expired?"#FEE2E2":"#FEF3C7",color:expired?"#AE2A19":"#92400E",marginLeft:6}}>{label}</span>;
};

export default function Approvals() {
  const {id}=useParams();
  const [items,setItems]=useState(SEED);

  const [selected,setSelected]=useState([]);
  const [showExpired,setShowExpired]=useState(false);
  const toggleSelect=id=>setSelected(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const selectAll=ids=>{const all=ids.every(id=>selected.includes(id));setSelected(all?selected.filter(x=>!ids.includes(x)):[...new Set([...selected,...ids])]);};
  const reloadItems=()=>{ api.get("/approvals").then(res=>{ if(res.data&&Array.isArray(res.data)&&res.data.length>0) setItems(res.data.map(mapApproval)); }).catch(()=>{}); };
  useEffect(()=>{ reloadItems(); },[]);
  const bulkAction = async (action) => {
    const pendingSelected = selected.filter(id => {
      const item = items.find(i => String(i.id)===String(id));
      return item && item.status === "pending";
    });
    for(const id of pendingSelected) {
      const item = items.find(i => String(i.id)===String(id));
      if(!item?._backendId) continue;
      const bid = item._backendId;
      try {
        if(action==="approve") {
          await api.patch("/approvals/"+bid+"/review1",{reviewer:"Utilisateur",reviewerEmail:"",decision:"approve",comment:"Approbation en masse"});
        } else {
          await api.patch("/approvals/"+bid+"/review1",{reviewer:"Utilisateur",reviewerEmail:"",decision:"reject",comment:"Rejet en masse"});
        }
      } catch(e) { console.warn("Bulk action:", e); }
    }
    setSelected([]);
    setTimeout(() => reloadItems(), 800);
  };

  const [matrix,setMatrix]=useState(DEFAULT_MATRIX);
  const [settings,setSettings]=useState(DEFAULT_SETTINGS);
  const upd=u=>setItems(p=>p.map(i=>i.id===u.id?u:i));
  const add=async item=>{ setItems(p=>[item,...p]); try{ const res=await api.post("/approvals",{type:item.type,projectName:item.title,amount:item.amount,currency:"XAF",description:item.justification||"",justification:item.justification||"",beneficiaryName:item.beneficiaryName||"",beneficiaryBank:item.beneficiaryBank||"",beneficiaryAccount:item.beneficiaryAccount||"",beneficiaryMobile:item.beneficiaryMobile||"",siteCode:item.site||"",projectCode:item.project||"",submittedBy:item.submittedBy||"Utilisateur"}); if(res.data?.id) setTimeout(()=>reloadItems(),600); }catch(e){console.warn("Create:",e);} };
  if(id) return <DetailPage items={items} onUpdate={upd} settings={settings} matrix={matrix}/>;
  return <ListPage items={items} onAdd={add} settings={settings} setSettings={setSettings} matrix={matrix} setMatrix={setMatrix}/>;
}
