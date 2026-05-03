import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ===== DESIGN SYSTEM CLAIR =====
const C = {
  blue:"#1a73e8", blue_l:"#e8f0fe", blue_d:"#1558b0",
  green:"#0f9d58", green_l:"#e6f4ea", green_d:"#0b7a44",
  orange:"#f29900", orange_l:"#fef3c7",
  red:"#ea4335", red_l:"#fce8e6",
  purple:"#7c3aed", purple_l:"#f3e8ff",
  gray:"#5f6368", gray_l:"#f1f3f4", gray_m:"#9aa0a6",
  text:"#202124", text2:"#5f6368", text3:"#9aa0a6",
  white:"#ffffff", bg:"#f8f9fa", border:"#e8eaed",
  shadow:"0 1px 3px rgba(0,0,0,.08)",
};

// SVG Icons
const Ico = ({n,s=16,c="currentColor"})=>{
  const paths={
    map:"M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z M8 2v16 M16 6v16",
    users:"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
    file:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
    clock:"M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 6v6l4 2",
    alert:"M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
    check:"M20 6 9 17l-5-5",
    plus:"M12 5v14 M5 12h14",
    send:"M22 2 11 13 M22 2l-7 20-4-9-9-4 20-7z",
    camera:"M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    chart:"M18 20V10 M12 20V4 M6 20v-6",
    gps:"M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    task:"M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
    star:"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    building:"M3 21h18 M3 7v14 M21 7v14 M9 21V7 M15 21V7 M3 7l9-4 9 4",
    phone:"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 8.63a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 2 0h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L6.91 9.91a16 16 0 0 0 6.12 6.12l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
    info:"M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 16v-4 M12 8h.01",
    close:"M18 6 6 18 M6 6l12 12",
    ai:"M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    cert:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 15l3 3 6-6",
    money:"M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
    msg:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    download:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
    shield:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    lock:"M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
    eye_off:"M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24 M1 1l22 22",
  };
  const p=paths[n];
  if(!p) return null;
  return(
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c}
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      style={{display:"block",flexShrink:0}}>
      {p.split(" M ").map((seg,i)=><path key={i} d={i===0?seg:`M ${seg}`}/>)}
    </svg>
  );
};

// Données techniciens
const PHOTOS_TECH={
  "EE001":"https://i.pravatar.cc/150?img=15",
  "EE002":"https://i.pravatar.cc/150?img=17",
  "EE003":"https://i.pravatar.cc/150?img=22",
  "EE004":"https://i.pravatar.cc/150?img=3",
  "EE005":"https://i.pravatar.cc/150?img=25",
};

// ===== DONNÉES BC HUAWEI =====
// Note: prix masqués avant transmission aux PM
const BC_HUAWEI = [
  {
    id:"BC-HW-2024-147",site:"DLA-003",siteName:"Site Bonabéri",
    type:"4G LTE Maintenance",priorite:"urgent",
    statut:"en_attente",dateReception:"2024-03-15",deadline:"2024-03-20",
    description:"Maintenance corrective antennes 4G LTE suite coupure signal",
    techIds:[],iaScore:null,
    // prix: masqué PM — visible Finance/Approvals uniquement
  },
  {
    id:"BC-HW-2024-148",site:"BFN-001",siteName:"Site Bafoussam",
    type:"5G NR Installation",priorite:"normale",
    statut:"en_attente",dateReception:"2024-03-15",deadline:"2024-04-15",
    description:"Installation complète station 5G NR avec BBU et 3 RRU",
    techIds:[],iaScore:null,
  },
  {
    id:"BC-HW-2024-149",site:"MAR-001",siteName:"Site Maroua",
    type:"Survey RF",priorite:"normale",
    statut:"en_attente",dateReception:"2024-03-15",deadline:"2024-04-30",
    description:"Relevé mesures RF et optimisation paramètres réseau zone nord",
    techIds:[],iaScore:null,
  },
  {
    id:"BC-HW-2024-143",site:"DLA-001",siteName:"Site Akwa Douala",
    type:"5G NR Installation",priorite:"haute",
    statut:"en_cours",dateReception:"2024-03-10",deadline:"2024-03-30",
    description:"Installation RRU 5G NR pylône principal Akwa",
    techIds:["EE001"],iaScore:82,
    timeline:[
      {etape:"BC reçu · IA lit le PDF",heure:"06:00",done:true,type:"auto"},
      {etape:"PM assigne Thomas Ngono",heure:"07:00",done:true,type:"pm",detail:"IA score 82/100 · PM valide"},
      {etape:"Thomas accepte la mission",heure:"07:08",done:true,type:"tech",detail:"Réponse en 8 min"},
      {etape:"Arrivée sur site DLA-001",heure:"07:30",done:true,type:"auto",detail:"CleanCam · IA confirme équipement 5G"},
      {etape:"Travaux en cours · 65%",heure:"En cours",done:false,current:true,type:"work",detail:"« Câblage RRU terminé. Tests en cours. »"},
      {etape:"Départ détecté · Geofencing",heure:"—",done:false,type:"auto"},
      {etape:"Certificat PDF généré",heure:"—",done:false,type:"cert"},
    ],
  },
  {
    id:"BC-HW-2024-141",site:"LIM-001",siteName:"Site Limbé",
    type:"Survey RF",priorite:"normale",
    statut:"en_cours",dateReception:"2024-03-12",deadline:"2024-03-25",
    description:"Mesures RF et optimisation réseau zone côtière",
    techIds:["EE003"],iaScore:71,
  },
  {
    id:"BC-HW-2024-139",site:"GAR-001",siteName:"Site Garoua",
    type:"Maintenance HSE",priorite:"normale",
    statut:"en_cours",dateReception:"2024-03-08",deadline:"2024-03-20",
    description:"Inspection sécurité et mise aux normes HSE pylône Garoua",
    techIds:["EE004"],iaScore:68,
  },
  {
    id:"BC-HW-2024-135",site:"YDE-001",siteName:"Site Yaoundé Centre",
    type:"5G NR Configuration",priorite:"normale",
    statut:"termine",dateReception:"2024-03-01",deadline:"2024-03-15",
    description:"Configuration paramètres 5G NR et tests end-to-end",
    techIds:["EE001","EE002"],iaScore:90,
  },
];

const TECHNICIENS=[
  {id:"EE001",nom:"Thomas Ngono",specialite:"5G NR / 4G LTE",statut:"en_mission",
   bcId:"BC-HW-2024-143",site:"DLA-001",phone:"+237 677 100 001",
   battery:78,signal:4,pointageArrivee:"07:30",pointageArriveeType:"CleanCam",
   taches_done:3,taches_total:5,lat:4.0511,lng:9.7085,
   dernierMessage:"Câblage RRU terminé. Tests en cours.",note:4.5,
   paiement:{statut:"en_attente",montant:850000,timing:"fin_projet",demande:"tech"},
  },
  {id:"EE002",nom:"Jean Mbarga",specialite:"Survey RF",statut:"termine_journee",
   bcId:"BC-HW-2024-135",site:"YDE-001",phone:"+237 677 100 002",
   battery:92,signal:5,pointageArrivee:"08:00",pointageArriveeType:"CleanCam",
   pointageDepart:"16:00",pointageDepartType:"Geofencing",
   taches_done:3,taches_total:3,lat:3.8480,lng:11.5021,
   dernierMessage:"Mission terminée. Site YDE-001 opérationnel.",note:4.8,
   paiement:{statut:"en_attente",montant:1100000,timing:"fin_journee",demande:"system"},
  },
  {id:"EE003",nom:"Samuel Djomo",specialite:"3G UMTS / 4G LTE",statut:"en_deplacement",
   bcId:"BC-HW-2024-141",site:"LIM-001",phone:"+237 677 100 003",
   battery:45,signal:3,pointageArrivee:null,eta:"45min",
   taches_done:0,taches_total:4,lat:4.0167,lng:9.2000,
   dernierMessage:"En route. ETA 45min.",note:3.9,
   paiement:{statut:"non_defini",montant:null},
  },
  {id:"EE004",nom:"Ali Moussa",specialite:"Supervision HSE",statut:"en_mission",
   bcId:"BC-HW-2024-139",site:"GAR-001",phone:"+237 677 100 004",
   battery:63,signal:2,pointageArrivee:"06:45",pointageArriveeType:"Geofencing",
   taches_done:4,taches_total:6,lat:9.3019,lng:13.3920,
   dernierMessage:"Vérification sécurité pylône terminée.",note:4.2,
   paiement:{statut:"en_attente",montant:1200000,timing:"avant_travaux",demande:"tech"},
  },
  {id:"EE005",nom:"René Talla",specialite:"Fibre optique",statut:"disponible",
   bcId:null,site:"—",phone:"+237 677 100 005",
   battery:100,signal:5,pointageArrivee:null,
   taches_done:0,taches_total:0,lat:4.0400,lng:9.6800,
   dernierMessage:"",note:4.6,
   paiement:{statut:"non_defini",montant:null},
  },
];

// Scoring IA technicien pour un BC
const scoreIA=(tech,bc)=>{
  if(tech.statut==="hors_ligne") return null;
  // Distance simulée (en vrai, calcul GPS Haversine)
  const distances={"EE001":4.1,"EE002":12,"EE003":18,"EE004":45,"EE005":2.3};
  const dist=distances[tech.id]||20;
  const scoreDist=Math.max(0,40-dist*1.5);
  const scoreBat=(tech.battery/100)*25;
  const scoreSig=(tech.signal/5)*15;
  const scoreDispo=tech.statut==="disponible"?20:tech.statut==="en_deplacement"?8:0;
  const scoreComp=(bc.type.includes("5G")&&tech.specialite.includes("5G"))||
    (bc.type.includes("4G")&&tech.specialite.includes("4G"))||
    (bc.type.includes("RF")&&tech.specialite.includes("RF"))||
    (bc.type.includes("HSE")&&tech.specialite.includes("HSE"))?10:0;
  const total=Math.round(scoreDist+scoreBat+scoreSig+scoreDispo+scoreComp);
  return{tech,score:total,dist:dist.toFixed(1),
    details:{distance:Math.round(scoreDist),batterie:Math.round(scoreBat),
      signal:Math.round(scoreSig),disponibilite:Math.round(scoreDispo),competence:scoreComp},
    eta:Math.round(dist*3+5),
    explication:tech.statut==="disponible"
      ?`${tech.nom} est disponible, à ${dist.toFixed(1)}km, batterie ${tech.battery}%${scoreComp>0?", compétence correspondante":""}.`
      :`${tech.nom} est en déplacement, à ${dist.toFixed(1)}km — disponible sous peu.`
  };
};

const getRecos=(bc)=>TECHNICIENS
  .map(t=>scoreIA(t,bc)).filter(Boolean)
  .filter(s=>s.score>0).sort((a,b)=>b.score-a.score).slice(0,3);

// Statuts
const ST_TECH={
  en_mission:{color:C.blue,bg:C.blue_l,label:"En mission"},
  en_deplacement:{color:C.orange,bg:C.orange_l,label:"En déplacement"},
  disponible:{color:C.green,bg:C.green_l,label:"Disponible"},
  termine_journee:{color:C.gray,bg:C.gray_l,label:"Mission terminée"},
  hors_ligne:{color:C.gray,bg:C.gray_l,label:"Hors ligne"},
};
const ST_BC={
  en_attente:{color:C.orange,bg:C.orange_l,label:"À assigner"},
  en_cours:{color:C.blue,bg:C.blue_l,label:"En cours"},
  termine:{color:C.green,bg:C.green_l,label:"Terminé"},
};
const ST_PAY={
  en_attente:{color:C.orange,bg:C.orange_l,label:"En attente PM"},
  paye:{color:C.green,bg:C.green_l,label:"Payé"},
  non_defini:{color:C.gray,bg:C.gray_l,label:"Non défini"},
};
const TIMING_PAY={
  avant_travaux:"Avant travaux",fin_projet:"Fin de projet",
  fin_journee:"Fin de journée",acompte:"Acompte 50%",non_defini:"—",
};

// ===== COMPOSANTS UI =====
const fmtN=n=>n?new Intl.NumberFormat("fr-FR").format(Math.round(n)):"—";

const Card=({children,style})=>(
  <div style={{background:C.white,border:`1px solid ${C.border}`,
    borderRadius:12,boxShadow:C.shadow,overflow:"hidden",...style}}>
    {children}
  </div>
);

const CardHead=({title,sub,action,icon,color=C.blue})=>(
  <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,
    display:"flex",justifyContent:"space-between",alignItems:"center"}}>
    <div style={{display:"flex",alignItems:"center",gap:9}}>
      {icon&&<div style={{width:30,height:30,borderRadius:8,
        background:`${color}15`,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <Ico n={icon} s={15} c={color}/>
      </div>}
      <div>
        <div style={{fontSize:13,fontWeight:700,color:C.text}}>{title}</div>
        {sub&&<div style={{fontSize:10,color:C.text3,marginTop:1}}>{sub}</div>}
      </div>
    </div>
    {action}
  </div>
);

const Badge=({color=C.gray,bg,label})=>(
  <span style={{display:"inline-flex",alignItems:"center",padding:"2px 8px",
    borderRadius:20,background:bg||C.gray_l,color,fontSize:11,fontWeight:600,
    whiteSpace:"nowrap"}}>{label}</span>
);

const Prog=({value,color=C.blue,h=5})=>(
  <div style={{flex:1,height:h,background:C.border,borderRadius:h/2,overflow:"hidden"}}>
    <div style={{height:"100%",width:`${Math.min(value||0,100)}%`,
      background:color,borderRadius:h/2,transition:"width .6s"}}/>
  </div>
);

const Btn=({label,onClick,variant="default",icon,sm,full,disabled})=>{
  const s={
    primary:{background:C.blue,color:"white",border:`1px solid ${C.blue}`},
    success:{background:C.green,color:"white",border:`1px solid ${C.green}`},
    danger:{background:C.red,color:"white",border:`1px solid ${C.red}`},
    default:{background:C.white,color:C.text,border:`1px solid ${C.border}`},
    ghost:{background:"transparent",color:C.text2,border:"1px solid transparent"},
  };
  return(
    <button onClick={onClick} disabled={disabled}
      style={{display:"inline-flex",alignItems:"center",gap:5,
        padding:sm?"4px 10px":"7px 14px",borderRadius:8,
        fontSize:sm?11:12,fontWeight:600,cursor:disabled?"not-allowed":"pointer",
        fontFamily:"inherit",opacity:disabled?.5:1,
        width:full?"100%":"auto",justifyContent:"center",
        transition:"all .15s",...s[variant]}}>
      {icon&&<Ico n={icon} s={sm?12:14} c="currentColor"/>}
      {label}
    </button>
  );
};

const TechAv=({id,size=36})=>{
  const t=TECHNICIENS.find(x=>x.id===id);
  if(!t) return null;
  const ph=PHOTOS_TECH[id];
  return(
    <div style={{width:size,height:size,borderRadius:"50%",overflow:"hidden",
      border:`2px solid ${ST_TECH[t.statut]?.color||C.gray}`,flexShrink:0}}>
      {ph?<img src={ph} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
        :<div style={{width:"100%",height:"100%",
          background:ST_TECH[t.statut]?.color||C.gray,
          display:"flex",alignItems:"center",justifyContent:"center",
          color:"white",fontWeight:700,fontSize:size*.3}}>
          {t.nom.split(" ").map(x=>x[0]).join("")}
        </div>}
    </div>
  );
};

const Modal=({title,onClose,children,maxW=640})=>(
  <div style={{position:"fixed",inset:0,zIndex:500,
    display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div onClick={onClose} style={{position:"absolute",inset:0,
      background:"rgba(0,0,0,.4)",backdropFilter:"blur(4px)"}}/>
    <div style={{position:"relative",background:C.white,borderRadius:14,
      width:"100%",maxWidth:maxW,maxHeight:"90vh",overflow:"auto",
      boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
      <div style={{padding:"13px 18px",borderBottom:`1px solid ${C.border}`,
        display:"flex",justifyContent:"space-between",alignItems:"center",
        position:"sticky",top:0,background:C.white,zIndex:1}}>
        <span style={{fontSize:15,fontWeight:700,color:C.text}}>{title}</span>
        <button onClick={onClose}
          style={{width:26,height:26,borderRadius:"50%",background:C.gray_l,
            border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Ico n="close" s={13} c={C.text2}/>
        </button>
      </div>
      <div style={{padding:"16px 18px"}}>{children}</div>
    </div>
  </div>
);

// ===== DASHBOARD PM =====
const DashboardPM=({setTab,bcs,techs})=>{
  const bcAttente=bcs.filter(b=>b.statut==="en_attente").length;
  const missions=bcs.filter(b=>b.statut==="en_cours").length;
  const terrain=techs.filter(t=>t.statut==="en_mission"||t.statut==="en_deplacement").length;
  const paiements=techs.filter(t=>t.paiement?.statut==="en_attente").length;
  const bcSelMission=bcs.find(b=>b.id==="BC-HW-2024-143");

  return(
    <div style={{animation:"fadeUp .3s ease both"}}>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
        {[
          {l:"BC Huawei à assigner",v:bcAttente,c:C.orange,bg:C.orange_l,
           sub:"Reçus · en attente PM",icon:"file",
           badge:{label:"Urgent: 1",c:C.red,bg:C.red_l},tab:"bons"},
          {l:"Missions actives",v:missions,c:C.blue,bg:C.blue_l,
           sub:"Techniciens sur le terrain",icon:"clock",tab:"missions"},
          {l:"Techniciens terrain",v:terrain,c:C.green,bg:C.green_l,
           sub:`${techs.filter(t=>t.statut==="disponible").length} disponible(s)`,icon:"users",tab:"equipe"},
          {l:"Paiements en attente",v:paiements,c:C.purple,bg:C.purple_l,
           sub:"Décision PM requise",icon:"money",
           badge:{label:"À valider",c:C.orange,bg:C.orange_l},tab:"paiements"},
        ].map((k,i)=>(
          <div key={i} onClick={()=>setTab(k.tab)}
            style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,
              padding:"14px 16px",borderLeft:`4px solid ${k.c}`,cursor:"pointer",
              transition:"box-shadow .15s",animation:`fadeUp .3s ${i*.06}s ease both`}}
            onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,.1)"}
            onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:10,fontWeight:700,color:C.text3,
                textTransform:"uppercase",letterSpacing:".5px"}}>{k.l}</span>
              <div style={{width:30,height:30,borderRadius:8,background:k.bg,
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Ico n={k.icon} s={15} c={k.c}/>
              </div>
            </div>
            <div style={{fontSize:26,fontWeight:800,color:k.c,lineHeight:1,marginBottom:3}}>{k.v}</div>
            <div style={{fontSize:10,color:C.text3,marginBottom:k.badge?6:0}}>{k.sub}</div>
            {k.badge&&<span style={{display:"inline-flex",padding:"2px 7px",
              borderRadius:20,background:k.badge.bg,color:k.badge.c,
              fontSize:10,fontWeight:600}}>{k.badge.label}</span>}
          </div>
        ))}
      </div>

      {/* Flux BC → Mission */}
      <Card style={{marginBottom:14}}>
        <CardHead title="Flux Bon de commande Huawei → Mission" icon="file" color={C.blue}
          action={<Badge color={C.orange} bg={C.orange_l} label={`${bcAttente} BC à assigner`}/>}/>
        <div style={{display:"flex",alignItems:"center",padding:"14px 20px",
          background:C.bg,gap:0,overflowX:"auto"}}>
          {[
            {l:"BC Huawei reçu",s:"IA lit le PDF automatiquement",c:C.blue,bg:C.blue_l,icon:"file"},
            {l:"PM étudie",s:"Analyse · Scoring IA tech",c:C.purple,bg:C.purple_l,icon:"ai"},
            {l:"Notif mobile",s:"Tech accepte ou décline",c:C.orange,bg:C.orange_l,icon:"send"},
            {l:"Sur site",s:"CleanCam + Geofencing auto",c:C.green,bg:C.green_l,icon:"gps"},
            {l:"Mission terminée",s:"Certificat PDF auto généré",c:C.green,bg:C.green_l,icon:"cert"},
            {l:"Paiement",s:"Décision flexible du PM",c:C.blue,bg:C.blue_l,icon:"money"},
          ].map((s,i,arr)=>(
            <div key={i} style={{display:"flex",alignItems:"center",flex:1,minWidth:0}}>
              <div style={{flex:1,textAlign:"center",minWidth:80}}>
                <div style={{width:38,height:38,borderRadius:10,background:s.bg,
                  margin:"0 auto 6px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Ico n={s.icon} s={17} c={s.c}/>
                </div>
                <div style={{fontSize:10,fontWeight:700,color:C.text,
                  textTransform:"uppercase",letterSpacing:".3px"}}>{s.l}</div>
                <div style={{fontSize:9,color:C.text3,marginTop:2}}>{s.s}</div>
              </div>
              {i<arr.length-1&&<div style={{color:C.text3,fontSize:14,
                fontWeight:700,padding:"0 4px",flexShrink:0,marginBottom:16}}>→</div>}
            </div>
          ))}
        </div>
      </Card>

      <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:14}}>

        {/* Colonne gauche */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>

          {/* BC urgents */}
          <Card>
            <CardHead title="Bons de commande à assigner" icon="file" color={C.orange}
              action={<Btn label="Voir tous" variant="ghost" sm onClick={()=>setTab("bons")}/>}/>
            {bcs.filter(b=>b.statut==="en_attente").map((bc,i,arr)=>(
              <div key={bc.id} style={{padding:"10px 14px",
                borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none",
                display:"flex",gap:10,alignItems:"flex-start"}}>
                <div style={{width:7,height:7,borderRadius:50,
                  background:bc.priorite==="urgent"?C.red:C.blue,
                  flexShrink:0,marginTop:4}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2}}>
                    <span style={{fontSize:12,fontWeight:700,color:C.blue}}>{bc.id}</span>
                    {bc.priorite==="urgent"&&
                      <Badge color={C.red} bg={C.red_l} label="Urgent"/>}
                  </div>
                  <div style={{fontSize:11,color:C.text,fontWeight:500,marginBottom:1}}>
                    {bc.site} · {bc.siteName}
                  </div>
                  <div style={{fontSize:10,color:C.text3,marginBottom:4}}>
                    {bc.type} · Deadline: {bc.deadline}
                  </div>
                  {/* IA suggestion */}
                  <div style={{fontSize:10,color:C.purple,
                    background:C.purple_l,padding:"3px 8px",borderRadius:6,
                    display:"inline-flex",alignItems:"center",gap:4}}>
                    <Ico n="ai" s={10} c={C.purple}/>
                    {bc.id==="BC-HW-2024-147"?"René Talla recommandé · score 87/100 · 2.3km":
                     bc.id==="BC-HW-2024-148"?"Thomas Ngono recommandé · score 72/100":
                     "Aucun tech disponible dans rayon 50km"}
                  </div>
                </div>
                <Btn label="Assigner →" variant="primary" sm onClick={()=>setTab("bons")}/>
              </div>
            ))}
          </Card>

          {/* Missions actives */}
          <Card>
            <CardHead title="Missions en cours" icon="clock" color={C.green}
              action={<Btn label="Voir toutes" variant="ghost" sm onClick={()=>setTab("missions")}/>}/>
            {bcs.filter(b=>b.statut==="en_cours").map((bc,i,arr)=>{
              const tech=techs.find(t=>bc.techIds?.includes(t.id));
              const st=ST_BC[bc.statut];
              const prog=bc.id==="BC-HW-2024-143"?65:bc.id==="BC-HW-2024-141"?20:80;
              return(
                <div key={bc.id} style={{padding:"10px 14px",
                  borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none",
                  borderLeft:`3px solid ${st.color}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",
                    alignItems:"center",marginBottom:3}}>
                    <span style={{fontSize:12,fontWeight:700,color:C.text}}>{bc.id}</span>
                    <Badge color={tech?ST_TECH[tech.statut]?.color:C.gray}
                      bg={tech?ST_TECH[tech.statut]?.bg:C.gray_l}
                      label={tech?ST_TECH[tech.statut]?.label:"—"}/>
                  </div>
                  <div style={{fontSize:11,color:C.text2,marginBottom:2}}>
                    {bc.type} · {bc.site}
                  </div>
                  {tech&&<div style={{fontSize:10,color:C.text3,marginBottom:5}}>
                    {tech.nom}
                    {tech.pointageArrivee?` · Arrivée ${tech.pointageArrivee} (${tech.pointageArriveeType})`:
                     tech.eta?` · ETA ${tech.eta}`:""}
                  </div>}
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <Prog value={prog} color={st.color}/>
                    <span style={{fontSize:11,fontWeight:700,color:st.color}}>{prog}%</span>
                    <Btn label="Chat" variant="default" sm/>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>

        {/* Colonne droite */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>

          {/* Pointage auto */}
          <Card>
            <CardHead title="Pointage automatique" icon="gps" color={C.purple}
              action={<Badge color={C.green} bg={C.green_l} label="100% auto"/>}/>
            {[
              {tech:"EE001",type:"ARRIVÉE",heure:"07:30",mode:"CleanCam",
               detail:"IA: équipement 5G détecté · site confirmé",c:C.green},
              {tech:"EE004",type:"ARRIVÉE",heure:"06:45",mode:"Geofencing",
               detail:"Zone 500m confirmée · entrée validée",c:C.green},
              {tech:"EE002",type:"DÉPART",heure:"16:00",mode:"Geofencing",
               detail:"Sorti zone · non revenu · mission terminée",c:C.red},
              {tech:"EE003",type:"EN ROUTE",heure:"09:15",mode:"GPS",
               detail:"ETA LIM-001: 45min",c:C.orange},
            ].map((p,i,arr)=>(
              <div key={i} style={{display:"flex",gap:8,padding:"7px 12px",
                borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none"}}>
                <div style={{width:9,height:9,borderRadius:"50%",
                  background:p.c,flexShrink:0,marginTop:4}}/>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:1}}>
                    <span style={{fontSize:11,fontWeight:600,color:C.text}}>
                      {TECHNICIENS.find(t=>t.id===p.tech)?.nom.split(" ")[0]} — {p.type}
                    </span>
                    <span style={{fontSize:9,padding:"1px 6px",borderRadius:10,
                      background:p.c==="C.green"?C.green_l:C.bg,
                      color:p.c,fontWeight:600,border:`1px solid ${p.c}20`}}>
                      {p.mode}
                    </span>
                  </div>
                  <div style={{fontSize:9,color:C.text3}}>{p.heure} · {p.detail}</div>
                </div>
              </div>
            ))}
            <div style={{padding:"7px 12px",background:C.bg,
              borderTop:`1px solid ${C.border}`,
              fontSize:10,color:C.text3,display:"flex",alignItems:"center",gap:5}}>
              <Ico n="info" s={11} c={C.purple}/>
              Pointage 100% automatique — CleanCam + Geofencing + IA anti-fraude
            </div>
          </Card>

          {/* Notif mobile */}
          <Card>
            <CardHead title="Notification mobile" icon="send" color={C.orange}
              action={<Badge color={C.orange} bg={C.orange_l} label="En attente réponse"/>}/>
            <div style={{padding:12}}>
              <div style={{background:C.bg,padding:10,borderRadius:10,marginBottom:8}}>
                <div style={{fontSize:9,color:C.text3,textAlign:"center",marginBottom:6}}>
                  CleanIT Mobile
                </div>
                <div style={{background:C.white,borderRadius:10,
                  overflow:"hidden",border:`1px solid ${C.border}`}}>
                  <div style={{padding:"8px 10px",background:C.blue}}>
                    <div style={{fontSize:11,fontWeight:600,color:"white",marginBottom:1}}>
                      Nouvelle mission assignée
                    </div>
                    <div style={{fontSize:9,color:"rgba(255,255,255,.8)"}}>
                      BC-HW-2024-147 · Urgent
                    </div>
                  </div>
                  <div style={{padding:"8px 10px"}}>
                    <div style={{fontSize:11,fontWeight:600,color:C.text,marginBottom:2}}>
                      DLA-003 · Bonabéri
                    </div>
                    <div style={{fontSize:10,color:C.text2,marginBottom:2}}>
                      4G LTE Maintenance
                    </div>
                    <div style={{fontSize:10,color:C.blue,fontWeight:500,marginBottom:4}}>
                      2.3km de ta position
                    </div>
                    <div style={{fontSize:9,color:C.text3}}>
                      PM: Marie Kamga · Priorité urgente
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",
                    gap:6,padding:"0 8px 8px"}}>
                    <button style={{padding:"7px",borderRadius:7,border:"none",
                      background:C.green,color:"white",fontSize:10,
                      fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                      Accepter
                    </button>
                    <button style={{padding:"7px",borderRadius:7,border:"none",
                      background:C.red_l,color:C.red,fontSize:10,
                      fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                      Décliner
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Timeline mission */}
          <Card>
            <CardHead title="Timeline · BC-HW-2024-143" icon="clock" color={C.blue}/>
            <div style={{padding:"10px 0"}}>
              {bcSelMission?.timeline?.map((step,i,arr)=>(
                <div key={i} style={{display:"flex",gap:10,padding:"6px 14px",
                  position:"relative"}}>
                  {i<arr.length-1&&<div style={{position:"absolute",
                    left:18,top:20,width:1,height:"100%",
                    background:step.done?C.green:C.border}}/>}
                  <div style={{width:10,height:10,borderRadius:"50%",flexShrink:0,
                    marginTop:3,zIndex:1,
                    background:step.current?C.blue:step.done?C.green:C.border,
                    border:step.current?`2px solid ${C.blue}`:
                      step.done?`2px solid ${C.green}`:`2px solid ${C.border}`,
                    animation:step.current?"livePulse 1.5s infinite":"none"}}/>
                  <div style={{flex:1,opacity:!step.done&&!step.current?.4:1}}>
                    <div style={{fontSize:11,fontWeight:step.current?600:500,
                      color:step.current?C.blue:C.text}}>{step.etape}</div>
                    {step.detail&&<div style={{fontSize:9,color:C.text3,marginTop:1}}>
                      {step.detail}
                    </div>}
                  </div>
                  <span style={{fontSize:9,color:step.current?C.blue:C.text3,
                    fontWeight:step.current?600:400,flexShrink:0,marginTop:2}}>
                    {step.heure}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ===== BONS DE COMMANDE =====
const BonsCommande=({bcs,techs})=>{
  const [selBC,setSelBC]=useState(null);
  const [showDispatch,setShowDispatch]=useState(null);
  const [selTech,setSelTech]=useState(null);
  const [recos,setRecos]=useState([]);

  const openDispatch=(bc)=>{
    setShowDispatch(bc);
    setRecos(getRecos(bc));
    setSelTech(null);
  };

  return(
    <div style={{animation:"fadeUp .3s ease both"}}>
      <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center"}}>
        <div style={{display:"flex",gap:4}}>
          {["Tous","À assigner","En cours","Terminé"].map(f=>(
            <button key={f} style={{padding:"5px 12px",borderRadius:7,
              border:`1px solid ${C.border}`,background:C.white,
              color:C.text2,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>
              {f}
            </button>
          ))}
        </div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6,
          fontSize:11,color:C.text3,background:C.gray_l,padding:"5px 10px",
          borderRadius:7,border:`1px solid ${C.border}`}}>
          <Ico n="lock" s={12} c={C.purple}/>
          Prix masqués — visible Finance uniquement
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {bcs.map(bc=>{
          const st=ST_BC[bc.statut]||ST_BC.en_attente;
          const bcTechs=techs.filter(t=>bc.techIds?.includes(t.id));
          const prog=bc.id==="BC-HW-2024-143"?65:
            bc.id==="BC-HW-2024-141"?20:
            bc.id==="BC-HW-2024-139"?80:
            bc.id==="BC-HW-2024-135"?100:0;
          return(
            <Card key={bc.id}>
              <div style={{padding:"14px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",
                  alignItems:"flex-start",marginBottom:10}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:13,fontWeight:700,color:C.blue}}>{bc.id}</span>
                      <Badge color={st.color} bg={st.bg} label={st.label}/>
                      {bc.priorite==="urgent"&&<Badge color={C.red} bg={C.red_l} label="Urgent"/>}
                      {bc.priorite==="haute"&&<Badge color={C.orange} bg={C.orange_l} label="Priorité haute"/>}
                    </div>
                    <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:3}}>
                      {bc.type} · {bc.siteName}
                    </div>
                    <div style={{fontSize:11,color:C.text3,marginBottom:6}}>
                      Site: {bc.site} · Reçu: {bc.dateReception} · Deadline: {bc.deadline}
                    </div>
                    <div style={{fontSize:12,color:C.text2,background:C.bg,
                      padding:"6px 10px",borderRadius:7,borderLeft:`3px solid ${C.border}`,
                      marginBottom:8}}>
                      {bc.description}
                    </div>
                    {/* Prix masqué */}
                    <div style={{display:"flex",alignItems:"center",gap:6,
                      fontSize:11,color:C.purple,background:C.purple_l,
                      padding:"4px 9px",borderRadius:20,display:"inline-flex",marginBottom:8}}>
                      <Ico n="eye_off" s={12} c={C.purple}/>
                      Montant confidentiel — visible Finance/Comptabilité uniquement
                    </div>
                  </div>
                  <div style={{marginLeft:14,flexShrink:0,textAlign:"right"}}>
                    <div style={{fontSize:22,fontWeight:800,color:st.color}}>{prog}%</div>
                    <div style={{fontSize:10,color:C.text3}}>Avancement</div>
                  </div>
                </div>

                {bc.statut==="en_cours"&&(
                  <div style={{marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                      <Prog value={prog} color={st.color} h={6}/>
                      <span style={{fontSize:11,fontWeight:700,color:st.color}}>{prog}%</span>
                    </div>
                    {/* Techniciens assignés */}
                    {bcTechs.length>0&&(
                      <div style={{display:"flex",gap:8,alignItems:"center",
                        padding:"6px 10px",background:C.bg,borderRadius:8}}>
                        <div style={{display:"flex",gap:-6}}>
                          {bcTechs.map((t,i)=>(
                            <div key={t.id} style={{marginLeft:i>0?-8:0,zIndex:bcTechs.length-i}}>
                              <TechAv id={t.id} size={26}/>
                            </div>
                          ))}
                        </div>
                        <span style={{fontSize:11,color:C.text2}}>
                          {bcTechs.map(t=>t.nom.split(" ")[0]).join(", ")}
                        </span>
                        {bc.iaScore&&<span style={{marginLeft:"auto",fontSize:10,
                          color:C.purple,background:C.purple_l,
                          padding:"2px 7px",borderRadius:10,fontWeight:600}}>
                          Score IA: {bc.iaScore}/100
                        </span>}
                      </div>
                    )}
                  </div>
                )}

                {/* IA Recommandation pour BC en attente */}
                {bc.statut==="en_attente"&&(
                  <div style={{padding:"8px 10px",background:C.purple_l,
                    borderRadius:8,marginBottom:10,
                    border:`1px solid ${C.purple}20`}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.purple,
                      marginBottom:4,display:"flex",alignItems:"center",gap:5}}>
                      <Ico n="ai" s={11} c={C.purple}/>
                      Recommandation IA
                    </div>
                    {bc.id==="BC-HW-2024-147"&&(
                      <div style={{fontSize:11,color:C.text2}}>
                        René Talla est disponible à 2.3km, batterie 100%, signal 5/5.
                        Score 87/100. ETA ~12min.
                      </div>
                    )}
                    {bc.id==="BC-HW-2024-148"&&(
                      <div style={{fontSize:11,color:C.text2}}>
                        Thomas Ngono correspond (5G NR), score 72/100.
                        Actuellement sur DLA-001 — disponible dans ~2h.
                      </div>
                    )}
                    {bc.id==="BC-HW-2024-149"&&(
                      <div style={{fontSize:11,color:C.red}}>
                        Aucun technicien disponible dans un rayon de 50km.
                        Recrutement externe nécessaire ou reporter la mission.
                      </div>
                    )}
                  </div>
                )}

                <div style={{display:"flex",gap:8}}>
                  {bc.statut==="en_attente"&&(
                    <Btn label="Dispatcher IA →" icon="ai" variant="primary"
                      onClick={()=>openDispatch(bc)}/>
                  )}
                  {bc.statut==="en_cours"&&(
                    <>
                      <Btn label="Voir timeline" icon="clock" variant="default" sm/>
                      <Btn label="Chat équipe" icon="msg" variant="default" sm/>
                    </>
                  )}
                  {bc.statut==="termine"&&(
                    <Btn label="Télécharger certificat" icon="cert" variant="success" sm/>
                  )}
                  <Btn label="Détails" icon="info" variant="default" sm
                    onClick={()=>setSelBC(bc)}/>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal Dispatch IA */}
      {showDispatch&&(
        <Modal title={`Dispatcher IA · ${showDispatch.id}`}
          onClose={()=>setShowDispatch(null)} maxW={600}>
          <div style={{padding:"10px 12px",background:C.blue_l,
            borderRadius:8,marginBottom:14,border:`1px solid ${C.blue}20`}}>
            <div style={{fontSize:12,fontWeight:700,color:C.blue,marginBottom:3}}>
              {showDispatch.type} · {showDispatch.siteName}
            </div>
            <div style={{fontSize:11,color:C.text2}}>{showDispatch.description}</div>
            <div style={{fontSize:10,color:C.text3,marginTop:4}}>
              Deadline: {showDispatch.deadline}
              {/* Prix non affiché au PM */}
            </div>
          </div>

          <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:10}}>
            Recommandations IA — Validation PM requise
          </div>

          {recos.map((rec,i)=>(
            <div key={rec.tech.id}
              onClick={()=>setSelTech(rec.tech)}
              style={{display:"flex",gap:12,alignItems:"flex-start",
                padding:"10px 12px",borderRadius:10,
                border:`2px solid ${selTech?.id===rec.tech.id?rec.tech.color:C.border}`,
                background:selTech?.id===rec.tech.id?`${rec.tech.color}06`:C.white,
                cursor:"pointer",marginBottom:8,transition:"all .12s"}}>
              <div style={{width:26,height:26,borderRadius:"50%",
                background:i===0?C.green_l:i===1?C.orange_l:C.gray_l,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:12,fontWeight:700,color:i===0?C.green:i===1?C.orange:C.gray,
                flexShrink:0}}>{i+1}</div>
              <TechAv id={rec.tech.id} size={38}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>{rec.tech.nom}</div>
                <div style={{fontSize:10,color:C.text3,marginBottom:4}}>
                  {rec.tech.specialite} · {rec.dist}km · 🔋{rec.tech.battery}% · ETA ~{rec.eta}min
                </div>
                <div style={{fontSize:11,color:C.text2,fontStyle:"italic",
                  background:C.bg,padding:"4px 8px",borderRadius:6,marginBottom:6}}>
                  « {rec.explication} »
                </div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {Object.entries(rec.details).map(([k,v])=>(
                    <span key={k} style={{fontSize:9,padding:"1px 6px",
                      borderRadius:10,background:C.bg,color:C.text2,
                      border:`1px solid ${C.border}`}}>
                      {k}: {v}/{k==="distance"?40:k==="batterie"?25:k==="signal"?15:k==="disponibilite"?20:10}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{textAlign:"center",flexShrink:0}}>
                <div style={{fontSize:20,fontWeight:800,
                  color:rec.score>70?C.green:rec.score>50?C.orange:C.red}}>
                  {rec.score}
                </div>
                <div style={{fontSize:8,color:C.text3}}>/100</div>
              </div>
            </div>
          ))}

          <div style={{display:"flex",gap:8,marginTop:12}}>
            <Btn label="Annuler" variant="default" onClick={()=>setShowDispatch(null)}/>
            <Btn label={`Valider le dispatch${selTech?` → ${selTech.nom}`:""}`}
              variant="success" disabled={!selTech}
              onClick={()=>{
                alert(`Mission dispatché à ${selTech?.nom} — notification mobile envoyée`);
                setShowDispatch(null);
              }}/>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ===== ÉQUIPE TERRAIN =====
const EquipeTerrain=({techs})=>{
  const [selTech,setSelTech]=useState(null);
  const [search,setSearch]=useState("");

  const filtered=techs.filter(t=>
    !search||t.nom.toLowerCase().includes(search.toLowerCase())||
    t.specialite.toLowerCase().includes(search.toLowerCase())
  );

  return(
    <div style={{animation:"fadeUp .3s ease both"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:14}}>
        {Object.entries(ST_TECH).map(([k,v])=>{
          const count=techs.filter(t=>t.statut===k).length;
          return(
            <div key={k} style={{background:C.white,border:`1px solid ${C.border}`,
              borderRadius:10,padding:"10px 12px",textAlign:"center",cursor:"pointer"}}>
              <div style={{fontSize:18,fontWeight:800,color:v.color}}>{count}</div>
              <div style={{fontSize:10,color:C.text2,marginTop:2}}>{v.label}</div>
            </div>
          );
        })}
      </div>

      <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,
          background:C.white,border:`1px solid ${C.border}`,
          borderRadius:8,padding:"6px 12px",flex:1,maxWidth:280}}>
          <Ico n="chart" s={13} c={C.text3}/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Rechercher technicien..."
            style={{border:"none",outline:"none",fontSize:12,flex:1,
              fontFamily:"inherit",color:C.text,background:"transparent"}}/>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
        {filtered.map(tech=>{
          const st=ST_TECH[tech.statut]||ST_TECH.hors_ligne;
          return(
            <Card key={tech.id} style={{cursor:"pointer"}}
              onClick={()=>setSelTech(tech)}>
              <div style={{padding:"14px",
                background:`linear-gradient(135deg,${C.white},${st.bg})`,
                borderBottom:`1px solid ${C.border}`}}>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{position:"relative",flexShrink:0}}>
                    <TechAv id={tech.id} size={48}/>
                    <div style={{position:"absolute",bottom:0,right:0,
                      width:13,height:13,borderRadius:"50%",
                      background:st.color,border:`2px solid ${C.white}`}}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:C.text}}>{tech.nom}</div>
                    <div style={{fontSize:11,color:C.text3,marginTop:1}}>{tech.specialite}</div>
                    <Badge color={st.color} bg={st.bg} label={st.label}/>
                  </div>
                  <div style={{textAlign:"right"}}>
                    {[1,2,3,4,5].map(i=>(
                      <span key={i} style={{color:i<=Math.round(tech.note)?C.orange:C.border,
                        fontSize:11}}>★</span>
                    ))}
                    <div style={{fontSize:10,color:C.text3,marginTop:2}}>{tech.note}/5</div>
                  </div>
                </div>
              </div>
              <div style={{padding:"12px 14px"}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7,marginBottom:10}}>
                  {[
                    {l:"Batterie",v:`${tech.battery}%`,
                     c:tech.battery>50?C.green:tech.battery>20?C.orange:C.red},
                    {l:"Signal",v:`${tech.signal}/5`,c:C.blue},
                    {l:"Tâches",v:`${tech.taches_done}/${tech.taches_total}`,c:C.purple},
                  ].map(m=>(
                    <div key={m.l} style={{background:C.bg,borderRadius:7,
                      padding:"7px",textAlign:"center"}}>
                      <div style={{fontSize:14,fontWeight:700,color:m.c}}>{m.v}</div>
                      <div style={{fontSize:9,color:C.text3,textTransform:"uppercase",
                        letterSpacing:".3px",marginTop:2}}>{m.l}</div>
                    </div>
                  ))}
                </div>
                {tech.pointageArrivee&&(
                  <div style={{fontSize:11,color:C.text2,marginBottom:4,
                    display:"flex",alignItems:"center",gap:5}}>
                    <Ico n="gps" s={11} c={C.green}/>
                    Arrivée {tech.pointageArrivee} · {tech.pointageArriveeType||"auto"}
                    {tech.pointageDepart&&` · Départ ${tech.pointageDepart}`}
                  </div>
                )}
                {tech.dernierMessage&&(
                  <div style={{fontSize:10,color:C.text2,
                    background:C.green_l,padding:"5px 8px",
                    borderRadius:6,borderLeft:`3px solid ${C.green}`,marginBottom:8}}>
                    {tech.dernierMessage}
                  </div>
                )}
                <div style={{display:"flex",gap:6}}>
                  <Btn label="Appeler" icon="phone" sm
                    onClick={e=>{e.stopPropagation();window.open(`tel:${tech.phone}`);}}/>
                  <Btn label="Détails" icon="info" sm variant="primary"/>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {selTech&&(
        <Modal title={`Profil · ${selTech.nom}`} onClose={()=>setSelTech(null)} maxW={680}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
            <div>
              <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:14}}>
                <TechAv id={selTech.id} size={56}/>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:C.text}}>{selTech.nom}</div>
                  <div style={{fontSize:11,color:C.text3,marginTop:1}}>{selTech.specialite}</div>
                </div>
              </div>
              {[["Matricule",selTech.id],["Téléphone",selTech.phone],
                ["Statut",ST_TECH[selTech.statut]?.label],
                ["Mission en cours",selTech.bcId||"—"],
                ["Site actuel",selTech.site],
                ["Arrivée (auto)",selTech.pointageArrivee?
                  `${selTech.pointageArrivee} · ${selTech.pointageArriveeType}`:"—"],
                ["Départ (auto)",selTech.pointageDepart?
                  `${selTech.pointageDepart} · ${selTech.pointageDepartType}`:"—"],
              ].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",
                  padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:11,color:C.text3}}>{l}</span>
                  <span style={{fontSize:11,fontWeight:600,color:C.text}}>{v}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:12}}>
                {[{l:"Batterie",v:`${selTech.battery}%`,
                   c:selTech.battery>50?C.green:C.red},
                  {l:"Signal",v:`${selTech.signal}/5`,c:C.blue},
                  {l:"Tâches",v:`${selTech.taches_done}/${selTech.taches_total}`,c:C.orange},
                  {l:"Note",v:`${selTech.note}/5`,c:C.purple},
                ].map(m=>(
                  <div key={m.l} style={{background:C.bg,borderRadius:8,
                    padding:"10px",textAlign:"center"}}>
                    <div style={{fontSize:18,fontWeight:700,color:m.c}}>{m.v}</div>
                    <div style={{fontSize:9,color:C.text3,marginTop:2}}>{m.l}</div>
                  </div>
                ))}
              </div>
              {selTech.dernierMessage&&(
                <div style={{padding:"8px 10px",background:C.green_l,
                  borderRadius:8,borderLeft:`3px solid ${C.green}`,marginBottom:12}}>
                  <div style={{fontSize:9,fontWeight:700,color:C.green,
                    marginBottom:3,textTransform:"uppercase"}}>
                    Dernier message terrain
                  </div>
                  <div style={{fontSize:11,color:C.text}}>{selTech.dernierMessage}</div>
                </div>
              )}
              <div style={{display:"flex",gap:8}}>
                <Btn label="Appeler" icon="phone" variant="primary" full
                  onClick={()=>window.open(`tel:${selTech.phone}`)}/>
                <Btn label="Message" icon="msg" variant="default" full/>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ===== POINTAGE GPS =====
const PointageGPS=({techs})=>(
  <div style={{animation:"fadeUp .3s ease both"}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
      {[
        {l:"Arrivées auto aujourd'hui",v:techs.filter(t=>t.pointageArrivee).length,c:C.green,icon:"gps"},
        {l:"Départs auto aujourd'hui",v:techs.filter(t=>t.pointageDepart).length,c:C.red,icon:"gps"},
        {l:"Mode manuel",v:0,c:C.purple,icon:"shield",sub:"0% — 100% automatique"},
      ].map((s,i)=>(
        <div key={i} style={{background:C.white,border:`1px solid ${C.border}`,
          borderRadius:12,padding:"14px 16px",borderLeft:`4px solid ${s.c}`}}>
          <div style={{fontSize:22,fontWeight:800,color:s.c,marginBottom:3}}>{s.v}</div>
          <div style={{fontSize:11,color:C.text2}}>{s.l}</div>
          {s.sub&&<div style={{fontSize:10,color:C.text3,marginTop:3}}>{s.sub}</div>}
        </div>
      ))}
    </div>

    <Card>
      <CardHead title="Journal de pointage automatique" icon="gps" color={C.purple}
        action={<div style={{display:"flex",alignItems:"center",gap:5,
          fontSize:10,color:C.purple,background:C.purple_l,
          padding:"3px 9px",borderRadius:20}}>
          <Ico n="shield" s={11} c={C.purple}/>
          Certifié IA anti-fraude
        </div>}/>
      <div>
        {[
          {tech:"EE004",event:"ARRIVÉE",heure:"06:45",site:"GAR-001",
           mode:"Geofencing",detail:"Zone 500m validée · entrée confirmée",c:C.green,
           coord:"9.3019°N, 13.3920°E"},
          {tech:"EE001",event:"ARRIVÉE",heure:"07:30",site:"DLA-001",
           mode:"CleanCam",detail:"Photo analysée · équipement 5G NR détecté · IA confirme site",c:C.green,
           coord:"4.0511°N, 9.7085°E"},
          {tech:"EE003",event:"EN ROUTE",heure:"09:15",site:"LIM-001",
           mode:"GPS Live",detail:"Départ depuis Douala · ETA 45min",c:C.orange,
           coord:"4.0300°N, 9.1800°E"},
          {tech:"EE002",event:"ARRIVÉE",heure:"08:00",site:"YDE-001",
           mode:"CleanCam",detail:"Photo + Geofencing · double validation",c:C.green,
           coord:"3.8480°N, 11.5021°E"},
          {tech:"EE002",event:"DÉPART",heure:"16:00",site:"YDE-001",
           mode:"Geofencing",detail:"Sorti de zone 500m · non revenu depuis 2h",c:C.red,
           coord:"3.8480°N, 11.5021°E"},
        ].map((p,i,arr)=>{
          const tech=TECHNICIENS.find(t=>t.id===p.tech);
          return(
            <div key={i} style={{display:"flex",gap:12,padding:"10px 16px",
              borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:0}}>
                <div style={{width:10,height:10,borderRadius:"50%",
                  background:p.c,flexShrink:0}}/>
                {i<arr.length-1&&<div style={{width:1,flex:1,
                  background:C.border,minHeight:20}}/>}
              </div>
              <TechAv id={p.tech} size={34}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:2}}>
                  <span style={{fontSize:12,fontWeight:700,color:C.text}}>
                    {tech?.nom}
                  </span>
                  <span style={{padding:"2px 8px",borderRadius:20,
                    background:p.c===C.green?C.green_l:p.c===C.red?C.red_l:C.orange_l,
                    color:p.c,fontSize:10,fontWeight:700}}>{p.event}</span>
                  <span style={{padding:"2px 8px",borderRadius:20,
                    background:C.purple_l,color:C.purple,
                    fontSize:10,fontWeight:600}}>{p.mode}</span>
                </div>
                <div style={{fontSize:11,color:C.text2,marginBottom:2}}>
                  {p.heure} · Site {p.site} · {p.coord}
                </div>
                <div style={{fontSize:10,color:C.text3}}>{p.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{padding:"8px 16px",background:C.bg,
        borderTop:`1px solid ${C.border}`,fontSize:10,color:C.text3,
        display:"flex",alignItems:"center",gap:6}}>
        <Ico n="info" s={11} c={C.purple}/>
        Aucune action manuelle requise. CleanCam + Geofencing + IA anti-fraude GPS.
        Le PM peut voir les pointages mais ne peut pas les modifier.
      </div>
    </Card>
  </div>
);

// ===== PAIEMENTS =====
const PaiementsTerrain=({techs})=>{
  const [paiements,setPaiements]=useState(
    techs.filter(t=>t.paiement?.statut!=="non_defini")
      .map(t=>({...t.paiement,techId:t.id,techNom:t.nom,
        bcId:t.bcId,site:t.site}))
  );
  const [selPay,setSelPay]=useState(null);

  const total=paiements.filter(p=>p.statut==="en_attente")
    .reduce((s,p)=>s+(p.montant||0),0);

  return(
    <div style={{animation:"fadeUp .3s ease both"}}>
      {/* Note confidentialité */}
      <div style={{display:"flex",alignItems:"center",gap:8,
        padding:"10px 14px",background:C.purple_l,borderRadius:10,
        border:`1px solid ${C.purple}20`,marginBottom:14,
        fontSize:12,color:C.purple}}>
        <Ico n="shield" s={14} c={C.purple}/>
        <strong>Confidentialité :</strong> Les montants affichés ici sont les paiements
        négociés avec les techniciens — pas les montants des BC Huawei.
        Les prix Huawei sont visibles uniquement dans Finance & Approvals.
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",
        gap:12,marginBottom:16}}>
        {[
          {l:"Total en attente",v:fmtN(total)+" FCFA",c:C.orange},
          {l:"Techniciens à payer",v:paiements.filter(p=>p.statut==="en_attente").length,c:C.blue},
          {l:"Payés aujourd'hui",v:paiements.filter(p=>p.statut==="paye").length,c:C.green},
        ].map((s,i)=>(
          <div key={i} style={{background:C.white,border:`1px solid ${C.border}`,
            borderRadius:12,padding:"14px 16px",borderLeft:`4px solid ${s.c}`}}>
            <div style={{fontSize:20,fontWeight:700,color:s.c,marginBottom:3}}>{s.v}</div>
            <div style={{fontSize:11,color:C.text2}}>{s.l}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardHead title="Paiements techniciens — Décision PM" icon="money" color={C.blue}
          sub="Montants négociés par le PM · Indépendant des prix BC Huawei"/>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
            <thead>
              <tr style={{background:C.bg}}>
                {["Technicien","Mission / Site","Montant négocié",
                  "Timing","Demande","Statut","Action PM"].map(h=>(
                  <th key={h} style={{padding:"9px 14px",textAlign:"left",
                    fontSize:10,fontWeight:700,color:C.text2,
                    borderBottom:`2px solid ${C.border}`,whiteSpace:"nowrap"}}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paiements.map((p,i)=>{
                const stP=ST_PAY[p.statut]||ST_PAY.non_defini;
                return(
                  <tr key={i} style={{borderBottom:`1px solid ${C.border}`}}
                    onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                    onMouseLeave={e=>e.currentTarget.style.background=C.white}>
                    <td style={{padding:"11px 14px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <TechAv id={p.techId} size={30}/>
                        <div>
                          <div style={{fontSize:12,fontWeight:600,color:C.text}}>
                            {p.techNom}
                          </div>
                          <div style={{fontSize:10,color:C.text3}}>Technicien ext.</div>
                        </div>
                      </div>
                    </td>
                    <td style={{padding:"11px 14px"}}>
                      <div style={{fontSize:12,color:C.text}}>{p.bcId||"—"}</div>
                      <div style={{fontSize:10,color:C.text3}}>📡 {p.site}</div>
                    </td>
                    <td style={{padding:"11px 14px"}}>
                      {p.montant?(
                        <span style={{fontSize:13,fontWeight:700,color:C.blue}}>
                          {fmtN(p.montant)} FCFA
                        </span>
                      ):<span style={{fontSize:11,color:C.text3}}>À négocier</span>}
                    </td>
                    <td style={{padding:"11px 14px"}}>
                      <Badge color={C.purple} bg={C.purple_l}
                        label={TIMING_PAY[p.timing]||"—"}/>
                    </td>
                    <td style={{padding:"11px 14px"}}>
                      <span style={{fontSize:11,color:C.text2}}>
                        {p.demande==="tech"?"Demande tech":
                         p.demande==="system"?"Auto système":"—"}
                      </span>
                    </td>
                    <td style={{padding:"11px 14px"}}>
                      <Badge color={stP.color} bg={stP.bg} label={stP.label}/>
                    </td>
                    <td style={{padding:"11px 14px"}}>
                      <div style={{display:"flex",gap:5}}>
                        {p.statut==="en_attente"&&(
                          <>
                            <Btn label="Payer" variant="success" sm
                              onClick={()=>setSelPay(p)}/>
                            <Btn label="Reporter" variant="default" sm/>
                          </>
                        )}
                        {p.statut==="paye"&&(
                          <span style={{fontSize:10,color:C.green,fontWeight:600}}>
                            ✓ Payé
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{padding:"8px 14px",background:C.bg,
          borderTop:`1px solid ${C.border}`,
          fontSize:10,color:C.text3,display:"flex",alignItems:"center",gap:6}}>
          <Ico n="info" s={11} c={C.gray}/>
          Paiements flexibles — Avant/pendant/après travaux selon contexte.
          Pas de déclenchement automatique. Décision PM uniquement.
        </div>
      </Card>

      {/* Modal confirmer paiement */}
      {selPay&&(
        <Modal title="Confirmer le paiement" onClose={()=>setSelPay(null)} maxW={480}>
          <div style={{padding:"12px 14px",background:C.blue_l,
            borderRadius:10,marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:6}}>
              {selPay.techNom}
            </div>
            <div style={{fontSize:12,color:C.text2,marginBottom:4}}>
              Mission: {selPay.bcId} · Site: {selPay.site}
            </div>
            <div style={{fontSize:18,fontWeight:800,color:C.blue}}>
              {fmtN(selPay.montant)} FCFA
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <Btn label="Annuler" variant="default" onClick={()=>setSelPay(null)}/>
            <Btn label="Confirmer le paiement" variant="success"
              onClick={()=>{
                setPaiements(prev=>prev.map(p=>
                  p.techId===selPay.techId?{...p,statut:"paye"}:p
                ));
                setSelPay(null);
              }}/>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ===== MISSIONS =====
const MissionsActives=({bcs,techs})=>{
  const [selMission,setSelMission]=useState(null);
  const missions=bcs.filter(b=>b.statut==="en_cours"||b.statut==="termine");

  return(
    <div style={{animation:"fadeUp .3s ease both"}}>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {missions.map(bc=>{
          const bcTechs=techs.filter(t=>bc.techIds?.includes(t.id));
          const st=ST_BC[bc.statut];
          const prog=bc.id==="BC-HW-2024-143"?65:
            bc.id==="BC-HW-2024-141"?20:
            bc.id==="BC-HW-2024-139"?80:100;

          return(
            <Card key={bc.id} style={{cursor:"pointer"}}
              onClick={()=>setSelMission(bc)}>
              <div style={{padding:"14px 16px",
                borderLeft:`4px solid ${st.color}`}}>
                <div style={{display:"flex",justifyContent:"space-between",
                  alignItems:"flex-start",marginBottom:10}}>
                  <div>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:13,fontWeight:700,color:C.blue}}>{bc.id}</span>
                      <Badge color={st.color} bg={st.bg} label={st.label}/>
                    </div>
                    <div style={{fontSize:14,fontWeight:600,color:C.text}}>
                      {bc.type} · {bc.siteName}
                    </div>
                    <div style={{fontSize:11,color:C.text3,marginTop:2}}>
                      Site: {bc.site} · Deadline: {bc.deadline}
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:22,fontWeight:800,color:st.color}}>{prog}%</div>
                    <div style={{fontSize:10,color:C.text3}}>Avancement</div>
                  </div>
                </div>

                <div style={{marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <Prog value={prog} color={st.color} h={7}/>
                    <span style={{fontSize:12,fontWeight:700,color:st.color}}>{prog}%</span>
                  </div>
                </div>

                {bcTechs.length>0&&(
                  <div style={{display:"flex",gap:10,alignItems:"center",
                    padding:"8px 12px",background:C.bg,borderRadius:9,marginBottom:10}}>
                    {bcTechs.map((t,i)=>(
                      <div key={t.id} style={{display:"flex",gap:8,alignItems:"center",
                        flex:1,minWidth:0}}>
                        <div style={{position:"relative",flexShrink:0}}>
                          <TechAv id={t.id} size={36}/>
                          {t.pointageArrivee&&<div style={{position:"absolute",
                            bottom:-1,right:-1,width:11,height:11,borderRadius:"50%",
                            background:C.green,border:`2px solid ${C.white}`}}/>}
                        </div>
                        <div>
                          <div style={{fontSize:12,fontWeight:600,color:C.text}}>{t.nom}</div>
                          <div style={{fontSize:10,color:C.text3}}>
                            {t.pointageArrivee?
                              `Arrivée ${t.pointageArrivee} · ${t.pointageArriveeType}`:
                              t.eta?`En route · ETA ${t.eta}`:"—"}
                          </div>
                          {t.dernierMessage&&(
                            <div style={{fontSize:10,color:C.text3,
                              fontStyle:"italic",marginTop:2}}>
                              « {t.dernierMessage.length>50?
                                t.dernierMessage.slice(0,50)+"...":t.dernierMessage} »
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{display:"flex",gap:8}}>
                  <Btn label="Voir timeline" icon="clock" variant="default" sm/>
                  <Btn label="Chat équipe" icon="msg" variant="default" sm/>
                  {bc.statut==="termine"&&(
                    <Btn label="Télécharger certificat" icon="cert" variant="success" sm/>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal timeline */}
      {selMission&&(
        <Modal title={`Timeline · ${selMission.id}`} onClose={()=>setSelMission(null)}>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:2}}>
              {selMission.type} · {selMission.siteName}
            </div>
            <div style={{fontSize:11,color:C.text3}}>
              {selMission.site} · Deadline: {selMission.deadline}
            </div>
          </div>
          {(selMission.timeline||[
            {etape:"BC reçu · IA lit le PDF",heure:"Auto",done:true,type:"auto"},
            {etape:"PM assigne technicien",heure:"—",done:true,type:"pm"},
            {etape:"Technicien accepte",heure:"—",done:true,type:"tech"},
            {etape:"Arrivée sur site (auto)",heure:"—",done:true,type:"auto"},
            {etape:"Travaux en cours",heure:"En cours",done:false,current:true,type:"work"},
            {etape:"Départ (Geofencing)",heure:"—",done:false,type:"auto"},
            {etape:"Certificat PDF généré",heure:"—",done:false,type:"cert"},
          ]).map((step,i,arr)=>(
            <div key={i} style={{display:"flex",gap:12,padding:"8px 0",
              position:"relative"}}>
              {i<arr.length-1&&<div style={{position:"absolute",
                left:5,top:20,width:1,height:"100%",
                background:step.done?C.green:C.border}}/>}
              <div style={{width:10,height:10,borderRadius:"50%",
                flexShrink:0,marginTop:4,zIndex:1,
                background:step.current?C.blue:step.done?C.green:C.border}}/>
              <div style={{flex:1,opacity:!step.done&&!step.current?.4:1}}>
                <div style={{fontSize:12,fontWeight:step.current?600:500,
                  color:step.current?C.blue:C.text}}>{step.etape}</div>
                {step.detail&&<div style={{fontSize:10,color:C.text3,marginTop:2}}>
                  {step.detail}
                </div>}
              </div>
              <span style={{fontSize:10,color:step.current?C.blue:C.text3,
                fontWeight:step.current?600:400}}>{step.heure}</span>
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
};

// ===== ONGLETS =====
const TABS=[
  {id:"dashboard",label:"Tableau de bord",icon:"chart"},
  {id:"bons",label:"BC Huawei",icon:"file",badge:3},
  {id:"missions",label:"Missions actives",icon:"clock"},
  {id:"equipe",label:"Équipe terrain",icon:"users"},
  {id:"pointage",label:"Pointage GPS",icon:"gps"},
  {id:"paiements",label:"Paiements",icon:"money"},
];

export default function Terrain() {
  const navigate=useNavigate();
  const [tab,setTab]=useState("dashboard");
  const [bcs,setBcs]=useState(BC_HUAWEI);
  const [techs,setTechs]=useState(TECHNICIENS);
  const active=TABS.find(t=>t.id===tab);

  return(
    <div style={{minHeight:"100vh",background:C.bg,
      fontFamily:"'Inter','Segoe UI',Arial,sans-serif",
      WebkitFontSmoothing:"antialiased"}}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        @keyframes livePulse{0%,100%{opacity:1}50%{opacity:.35}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
      `}</style>

      {/* TOPBAR */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,
        height:50,display:"flex",alignItems:"center",padding:"0 20px",
        position:"sticky",top:0,zIndex:200,boxShadow:C.shadow}}>

        <div style={{display:"flex",alignItems:"center",gap:9,
          paddingRight:16,marginRight:4,borderRight:`1px solid ${C.border}`}}>
          <div style={{width:30,height:30,borderRadius:8,background:C.blue,
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Ico n="map" s={15} c="white"/>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>Gestion Terrain</div>
            <div style={{fontSize:9,color:C.text3}}>Operations · Project Manager</div>
          </div>
        </div>

        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{display:"flex",alignItems:"center",gap:6,height:50,
              padding:"0 12px",border:"none",
              borderBottom:`2px solid ${tab===t.id?C.blue:"transparent"}`,
              background:"transparent",
              color:tab===t.id?C.blue:C.text2,
              fontWeight:tab===t.id?700:400,
              fontSize:11,cursor:"pointer",fontFamily:"inherit",
              whiteSpace:"nowrap",transition:"all .12s",position:"relative"}}>
            <Ico n={t.icon} s={13} c={tab===t.id?C.blue:C.text2}/>
            {t.label}
            {t.badge&&<span style={{position:"absolute",top:8,right:4,
              width:14,height:14,borderRadius:"50%",background:C.red,
              color:"white",fontSize:8,fontWeight:700,
              display:"flex",alignItems:"center",justifyContent:"center"}}>
              {t.badge}
            </span>}
          </button>
        ))}

        <div style={{marginLeft:"auto",display:"flex",gap:10,alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:5,fontSize:11,
            fontWeight:600,color:C.green,background:C.green_l,
            border:`1px solid ${C.green}30`,borderRadius:20,padding:"4px 10px"}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:C.green,
              animation:"livePulse 2s infinite"}}/>
            GPS Live
          </div>
          {/* NAVIGATION INTERNE — pas window.open */}
          <Btn label="Carte Digital Twin" icon="gps" variant="primary" sm
            onClick={()=>navigate("/map")}/>
        </div>
      </div>

      {/* SUB-HEADER */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,
        padding:"7px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:C.blue}}/>
          <span style={{fontSize:14,fontWeight:700,color:C.text}}>{active?.label}</span>
          <span style={{fontSize:11,color:C.text3}}>
            · {new Date().toLocaleDateString("fr-FR",{
              weekday:"long",day:"numeric",month:"long",year:"numeric"
            })}
          </span>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn label="Rapport journalier" icon="download" variant="default" sm/>
          <Btn label="2 alertes" icon="alert" variant="default" sm/>
        </div>
      </div>

      {/* CONTENU */}
      <div style={{maxWidth:1440,margin:"0 auto",padding:"18px 20px"}}>
        {tab==="dashboard"&&<DashboardPM setTab={setTab} bcs={bcs} techs={techs}/>}
        {tab==="bons"      &&<BonsCommande bcs={bcs} techs={techs}/>}
        {tab==="missions"  &&<MissionsActives bcs={bcs} techs={techs}/>}
        {tab==="equipe"    &&<EquipeTerrain techs={techs}/>}
        {tab==="pointage"  &&<PointageGPS techs={techs}/>}
        {tab==="paiements" &&<PaiementsTerrain techs={techs}/>}
      </div>
    </div>
  );
}
