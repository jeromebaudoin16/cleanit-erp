import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend, ComposedChart
} from "recharts";

// ===== DESIGN SYSTEM =====
const C = {
  blue:"#2563EB", blue_l:"#DBEAFE", blue_m:"#3B82F6",
  green:"#059669", green_l:"#D1FAE5", green_m:"#10B981",
  orange:"#D97706", orange_l:"#FEF3C7", orange_m:"#F59E0B",
  red:"#DC2626", red_l:"#FEE2E2", red_m:"#EF4444",
  purple:"#7C3AED", purple_l:"#EDE9FE", purple_m:"#8B5CF6",
  cyan:"#0891B2", cyan_l:"#CFFAFE", cyan_m:"#06B6D4",
  pink:"#DB2777", pink_l:"#FCE7F3", pink_m:"#EC4899",
  indigo:"#4338CA", indigo_l:"#E0E7FF", indigo_m:"#6366F1",
  white:"#FFFFFF", bg:"#F8FAFC", bg2:"#F1F5F9",
  border:"#E2E8F0", border2:"#CBD5E1",
  text:"#0F172A", text2:"#475569", text3:"#94A3B8",
  shadow:"0 1px 3px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.04)",
  shadow2:"0 4px 6px rgba(0,0,0,.07),0 2px 4px rgba(0,0,0,.05)",
  shadow3:"0 10px 15px rgba(0,0,0,.08),0 4px 6px rgba(0,0,0,.04)",
};

const fmtN = n => new Intl.NumberFormat("fr-FR").format(Math.round(n||0));
const fmtM = n => n>=1000000000?`${(n/1000000000).toFixed(2)}Md`:n>=1000000?`${(n/1000000).toFixed(0)}M`:n>=1000?`${(n/1000).toFixed(0)}K`:`${Math.round(n)}`;

// ===== ICÔNES =====
const Ico = ({n,s=18,c="currentColor"}) => {
  const d = {
    chart:"M18 20V10 M12 20V4 M6 20v-6",
    trend:"M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
    money:"M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
    users:"M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
    project:"M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
    target:"M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 18c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6z M12 14c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z",
    alert:"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
    check:"M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3",
    info:"M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 16v-4 M12 8h.01",
    up:"M23 6l-9.5 9.5-5-5L1 18",
    ai:"M12 2a2 2 0 012 2v1a2 2 0 01-2 2 2 2 0 01-2-2V4a2 2 0 012-2z M12 17a2 2 0 012 2v1a2 2 0 01-2 2 2 2 0 01-2-2v-1a2 2 0 012-2z M4.93 4.93a2 2 0 012.83 0l.7.7a2 2 0 010 2.83 2 2 0 01-2.83 0l-.7-.7a2 2 0 010-2.83z M14.54 14.54a2 2 0 012.83 0l.7.7a2 2 0 010 2.83 2 2 0 01-2.83 0l-.7-.7a2 2 0 010-2.83z M2 12a2 2 0 012-2h1a2 2 0 012 2 2 2 0 01-2 2H4a2 2 0 01-2-2z M17 12a2 2 0 012-2h1a2 2 0 012 2 2 2 0 01-2 2h-1a2 2 0 01-2-2z",
    calendar:"M8 2v4 M16 2v4 M3 10h18 M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z",
    download:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
    filter:"M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  };
  const p = d[n]; if(!p) return null;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c}
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      style={{flexShrink:0,display:"block"}}>
      {p.split(" M ").map((seg,i)=><path key={i} d={i===0?seg:`M ${seg}`}/>)}
    </svg>
  );
};

// ===== TOOLTIP CUSTOM =====
const CustomTooltip = ({active,payload,label,prefix="",suffix=""}) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{background:"white",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",boxShadow:C.shadow3,fontFamily:"inherit"}}>
      <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:6}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:C.text2,marginBottom:2}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:p.color,flexShrink:0}}/>
          <span>{p.name}:</span><strong style={{color:C.text}}>{prefix}{fmtM(p.value)}{suffix}</strong>
        </div>
      ))}
    </div>
  );
};

// ===== DONNÉES =====
const CA_MENSUEL = [
  {mois:"Oct",ca:85,objectif:90,pipeline:120,charges:62},
  {mois:"Nov",ca:110,objectif:95,pipeline:155,charges:68},
  {mois:"Déc",ca:95,objectif:100,pipeline:140,charges:70},
  {mois:"Jan",ca:130,objectif:110,pipeline:185,charges:72},
  {mois:"Fév",ca:118,objectif:115,pipeline:165,charges:75},
  {mois:"Mar",ca:145,objectif:120,pipeline:210,charges:78},
  {mois:"Avr",ca:158,objectif:130,pipeline:225,charges:80,prev:true},
  {mois:"Mai",ca:172,objectif:140,pipeline:240,charges:82,prev:true},
  {mois:"Jun",ca:185,objectif:150,pipeline:260,charges:85,prev:true},
];

const CA_CLIENTS = [
  {client:"MTN",ca:450,objectif:500,prev:520},
  {client:"Orange",ca:320,objectif:350,prev:380},
  {client:"Huawei",ca:280,objectif:300,prev:310},
  {client:"Nexttel",ca:120,objectif:180,prev:200},
  {client:"CAMTEL",ca:95,objectif:200,prev:220},
  {client:"MINPOSTEL",ca:65,objectif:100,prev:120},
];

const SECTEUR_PIE = [
  {name:"Télécommunications",value:865,color:C.blue_m},
  {name:"Technologies",value:280,color:C.cyan_m},
  {name:"Secteur public",value:185,color:C.purple_m},
];

const MARGE_DATA = [
  {mois:"Oct",marge:35,charges:62},{mois:"Nov",marge:38,charges:68},
  {mois:"Déc",marge:32,charges:70},{mois:"Jan",marge:42,charges:72},
  {mois:"Fév",marge:40,charges:75},{mois:"Mar",marge:46,charges:78},
];

const RH_PRESENCE = [
  {dept:"Projets",present:8,absent:0,conge:0,total:8},
  {dept:"Technique",present:5,absent:1,conge:1,total:7},
  {dept:"Finance",present:4,absent:0,conge:0,total:4},
  {dept:"Commercial",present:3,absent:0,conge:1,total:4},
  {dept:"RH",present:2,absent:0,conge:0,total:2},
  {dept:"Direction",present:2,absent:0,conge:0,total:2},
];

const SALAIRE_DEPT = [
  {dept:"Projets",interne:5200000,externe:2800000},
  {dept:"Technique",interne:3480000,externe:4200000},
  {dept:"Finance",interne:1680000,externe:0},
  {dept:"Commercial",interne:1520000,externe:0},
  {dept:"RH",interne:960000,externe:0},
  {dept:"Direction",interne:1550000,externe:0},
];

const PIPELINE_STAGES = [
  {stage:"Prospect",count:2,montant:90,color:C.text3},
  {stage:"Qualifié",count:1,montant:220,color:C.blue_m},
  {stage:"Proposition",count:1,montant:85,color:C.orange_m},
  {stage:"Négociation",count:2,montant:225,color:C.purple_m},
  {stage:"Gagné",count:1,montant:95,color:C.green_m},
  {stage:"Perdu",count:1,montant:38,color:C.red_m},
];

const PROJETS_DATA = [
  {name:"MTN 5G Core",avancement:68,budget:180,depense:122,retard:0,responsable:"Marie K."},
  {name:"CAMTEL Fibre P2",avancement:35,budget:220,depense:77,retard:0,responsable:"Marie K."},
  {name:"Huawei BTS Maint.",avancement:82,budget:45,depense:37,retard:0,responsable:"Pierre E."},
  {name:"Orange RF Q2",avancement:22,budget:85,depense:19,retard:21,responsable:"Jean F."},
  {name:"MTN Small Cells",avancement:100,budget:95,depense:91,retard:0,responsable:"Pierre E."},
  {name:"Nexttel Audit",avancement:10,budget:25,depense:2.5,retard:0,responsable:"Jean F."},
];

const PERF_RADAR = [
  {indicateur:"CA",A:85},{indicateur:"Pipeline",A:72},{indicateur:"Présence RH",A:87},
  {indicateur:"Délais projets",A:67},{indicateur:"Marge",A:74},{indicateur:"Satisfaction",A:80},
];

// ===== COMPOSANTS UI =====
const Card = ({children,style,onClick}) => (
  <div onClick={onClick} style={{background:"white",border:`1px solid ${C.border}`,borderRadius:12,boxShadow:C.shadow,overflow:"hidden",transition:"box-shadow .18s",cursor:onClick?"pointer":"default",...style}}
    onMouseEnter={e=>{if(onClick)e.currentTarget.style.boxShadow=C.shadow3}}
    onMouseLeave={e=>{if(onClick)e.currentTarget.style.boxShadow=C.shadow}}>
    {children}
  </div>
);

const CardHeader = ({title,subtitle,action}) => (
  <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border2}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
    <div>
      <div style={{fontSize:14,fontWeight:700,color:C.text}}>{title}</div>
      {subtitle&&<div style={{fontSize:11,color:C.text3,marginTop:2}}>{subtitle}</div>}
    </div>
    {action}
  </div>
);

// Animated counter
const Counter = ({to,duration=1000,prefix="",suffix=""}) => {
  const [v,setV] = useState(0);
  useEffect(()=>{
    if(!to) return;
    const t=Date.now();
    const r=()=>{
      const p=Math.min((Date.now()-t)/duration,1);
      const e=1-Math.pow(1-p,3);
      setV(Math.round(e*to));
      if(p<1) requestAnimationFrame(r);
    };
    requestAnimationFrame(r);
  },[to]);
  return <span>{prefix}{fmtM(v)}{suffix}</span>;
};

// KPI Card
const KpiCard = ({title,value,suffix="",prefix="",sub,color,bg,icon,trend,trendUp,delay=0,onClick}) => (
  <Card onClick={onClick} style={{animationDelay:`${delay}s`,animation:"fadeUp .4s ease both"}}>
    <div style={{padding:"18px 20px",borderLeft:`4px solid ${color}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:".5px",lineHeight:1.4,maxWidth:"70%"}}>{title}</div>
        <div style={{width:38,height:38,borderRadius:10,background:bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <Ico n={icon} s={18} c={color}/>
        </div>
      </div>
      <div style={{fontSize:28,fontWeight:800,color:color,letterSpacing:"-1px",marginBottom:4,lineHeight:1}}>
        {prefix}<Counter to={typeof value==="number"?value:0} duration={1200}/>{suffix}
      </div>
      <div style={{fontSize:11,color:C.text3,marginBottom:8}}>{sub}</div>
      {trend&&(
        <div style={{display:"flex",alignItems:"center",gap:4,fontSize:11,fontWeight:600,color:trendUp?C.green:C.red,padding:"3px 8px",borderRadius:20,background:trendUp?C.green_l:C.red_l,display:"inline-flex"}}>
          <span>{trendUp?"↑":"↓"}</span>{trend}
        </div>
      )}
    </div>
  </Card>
);

// Progress bar
const Prog = ({value,color,height=6,showLabel=false}) => (
  <div style={{display:"flex",alignItems:"center",gap:8}}>
    <div style={{flex:1,height,background:C.bg2,borderRadius:height/2,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${Math.min(value,100)}%`,background:color,borderRadius:height/2,transition:"width 1s ease"}}/>
    </div>
    {showLabel&&<span style={{fontSize:11,fontWeight:700,color,minWidth:32,textAlign:"right"}}>{value}%</span>}
  </div>
);

// Badge
const Badge = ({label,color,bg}) => (
  <span style={{display:"inline-flex",alignItems:"center",padding:"2px 8px",borderRadius:20,background:bg,color,fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{label}</span>
);

// Section tab
const SectionTabs = ({tabs,active,onChange}) => (
  <div style={{display:"flex",gap:4,background:C.bg2,borderRadius:8,padding:3}}>
    {tabs.map(t=>(
      <button key={t.id} onClick={()=>onChange(t.id)} style={{padding:"6px 14px",borderRadius:6,border:"none",background:active===t.id?"white":"transparent",color:active===t.id?C.text:C.text3,fontWeight:active===t.id?700:400,fontSize:12,cursor:"pointer",fontFamily:"inherit",transition:"all .15s",boxShadow:active===t.id?C.shadow:"none"}}>
        {t.l}
      </button>
    ))}
  </div>
);

// ===== MODULE FINANCIER =====
const ModuleFinancier = () => {
  const totalCA = 683; // M FCFA
  const marge = 46;
  const charges = 78;

  return (
    <div style={{animation:"fadeUp .35s ease both"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        <KpiCard title="CA Trimestriel" value={683} suffix=" M FCFA" color={C.blue} bg={C.blue_l} icon="money" sub="Trim. 1 2024 · Objectif: 720M" trend="+18.4% vs T-1" trendUp delay={0}/>
        <KpiCard title="Marge brute" value={46} suffix="%" color={C.green} bg={C.green_l} icon="trend" sub="Marge opérationnelle" trend="+3pts vs mois dernier" trendUp delay={.06}/>
        <KpiCard title="Charges totales" value={78} suffix=" M FCFA" color={C.orange} bg={C.orange_l} icon="chart" sub="Salaires + opérationnel" trend="+4.2% maîtrisé" trendUp={false} delay={.12}/>
        <KpiCard title="Trésorerie nette" value={245} suffix=" M FCFA" color={C.purple} bg={C.purple_l} icon="money" sub="Disponible en banque" trend="+12% vs Fév" trendUp delay={.18}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:16,marginBottom:16}}>
        {/* CA vs Objectif vs Prévision */}
        <Card>
          <CardHeader title="CA réalisé vs Objectif vs Prévision IA" subtitle="Régression linéaire Python · Intervalle de confiance 95%"
            action={<button style={{fontSize:11,color:C.blue,background:C.blue_l,border:"none",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Exporter</button>}/>
          <div style={{padding:"16px 12px 8px"}}>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={CA_MENSUEL} margin={{top:5,right:20,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                <XAxis dataKey="mois" tick={{fontSize:11,fill:C.text3}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:C.text3}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}M`}/>
                <Tooltip content={<CustomTooltip suffix=" M"/>}/>
                <Legend wrapperStyle={{fontSize:11,paddingTop:8}}/>
                <Area type="monotone" dataKey="ca" name="CA réalisé" fill={C.blue_l} stroke={C.blue_m} strokeWidth={2.5} fillOpacity={.6} dot={(p)=>p.payload.prev?<circle key={p.key} cx={p.cx} cy={p.cy} r={4} fill={C.green_m} stroke="white" strokeWidth={2}/>:<circle key={p.key} cx={p.cx} cy={p.cy} r={4} fill={C.blue_m} stroke="white" strokeWidth={2}/>}/>
                <Line type="monotone" dataKey="objectif" name="Objectif" stroke={C.orange_m} strokeWidth={2} strokeDasharray="5 3" dot={false}/>
                <Line type="monotone" dataKey="charges" name="Charges" stroke={C.red_m} strokeWidth={1.5} strokeDasharray="3 2" dot={false}/>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* CA par client */}
        <Card>
          <CardHeader title="CA par client" subtitle="Réalisé vs Objectif vs Prévision"/>
          <div style={{padding:"12px 16px"}}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={CA_CLIENTS} margin={{top:5,right:10,left:0,bottom:0}} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                <XAxis dataKey="client" tick={{fontSize:10,fill:C.text3}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:C.text3}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}M`}/>
                <Tooltip content={<CustomTooltip suffix=" M"/>}/>
                <Bar dataKey="ca" name="CA actuel" fill={C.blue_m} radius={[4,4,0,0]}/>
                <Bar dataKey="prev" name="Prévision" fill={C.green_m} radius={[4,4,0,0]} opacity={.7}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
        {/* Marge mensuelle */}
        <Card>
          <CardHeader title="Marge mensuelle" subtitle="Marge brute en % du CA"/>
          <div style={{padding:"12px 16px"}}>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={MARGE_DATA} margin={{top:5,right:10,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                <XAxis dataKey="mois" tick={{fontSize:10,fill:C.text3}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:C.text3}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
                <Tooltip content={<CustomTooltip suffix="%"/>}/>
                <Area type="monotone" dataKey="marge" name="Marge %" fill={C.green_l} stroke={C.green_m} strokeWidth={2.5} fillOpacity={.7}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Répartition CA secteur */}
        <Card>
          <CardHeader title="CA par secteur"/>
          <div style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
            <ResponsiveContainer width="55%" height={160}>
              <PieChart>
                <Pie data={SECTEUR_PIE} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {SECTEUR_PIE.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip formatter={v=>`${v}M FCFA`} contentStyle={{fontSize:11,fontFamily:"inherit",border:`1px solid ${C.border}`,borderRadius:6}}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{flex:1}}>
              {SECTEUR_PIE.map((s,i)=>(
                <div key={s.name} style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:11,color:C.text2,display:"flex",alignItems:"center",gap:5}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:s.color}}/>
                      {s.name.split(" ")[0]}
                    </span>
                    <span style={{fontSize:11,fontWeight:700,color:C.text}}>{s.value}M</span>
                  </div>
                  <Prog value={Math.round(s.value/13.3)} color={s.color} height={4}/>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Indicateurs clés */}
        <Card>
          <CardHeader title="Indicateurs financiers clés"/>
          <div style={{padding:"8px 0"}}>
            {[
              {l:"CA cumulé 2024",v:"683M FCFA",c:C.blue,pct:76},
              {l:"Objectif annuel",v:"900M FCFA",c:C.text3,pct:100},
              {l:"Marge brute",v:"46%",c:C.green,pct:46},
              {l:"Ratio charges/CA",v:"11.4%",c:C.orange,pct:11},
              {l:"Croissance vs 2023",v:"+18.4%",c:C.purple,pct:18},
              {l:"Prévision T2",v:"515M FCFA",c:C.cyan,pct:57},
            ].map((item,i)=>(
              <div key={i} style={{padding:"9px 18px",borderBottom:i<5?`1px solid ${C.border2}`:"none"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:12,color:C.text2}}>{item.l}</span>
                  <span style={{fontSize:13,fontWeight:700,color:item.c}}>{item.v}</span>
                </div>
                <Prog value={item.pct} color={item.c} height={4}/>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ===== MODULE COMMERCIAL =====
const ModuleCommercial = () => (
  <div style={{animation:"fadeUp .35s ease both"}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
      <KpiCard title="Pipeline total" value={555} suffix=" M FCFA" color={C.blue} bg={C.blue_l} icon="target" sub="6 deals actifs" trend="+8.2% ce mois" trendUp delay={0}/>
      <KpiCard title="Taux conversion" value={25} suffix="%" color={C.green} bg={C.green_l} icon="check" sub="2 deals gagnés / 8 total" trend="+3pts vs objectif" trendUp delay={.06}/>
      <KpiCard title="Valeur pondérée" value={280} suffix=" M FCFA" color={C.purple} bg={C.purple_l} icon="chart" sub="Pipeline × probabilité" trend="Estimation fiable" trendUp delay={.12}/>
      <KpiCard title="Cycle vente moyen" value={87} suffix=" jours" color={C.orange} bg={C.orange_l} icon="calendar" sub="Prospect → Signature" trend="-5j vs trim. dernier" trendUp delay={.18}/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
      {/* Entonnoir */}
      <Card>
        <CardHeader title="Entonnoir commercial" subtitle="Valeur & nombre par étape"/>
        <div style={{padding:"16px 20px"}}>
          {PIPELINE_STAGES.map((s,i)=>{
            const maxM = Math.max(...PIPELINE_STAGES.map(x=>x.montant));
            const w = Math.max((s.montant/maxM)*100, s.count>0?8:0);
            return (
              <div key={s.stage} style={{marginBottom:i<PIPELINE_STAGES.length-1?14:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:10,height:10,borderRadius:2,background:s.color,flexShrink:0}}/>
                    <span style={{fontSize:13,fontWeight:500,color:C.text}}>{s.stage}</span>
                    <span style={{fontSize:11,padding:"1px 7px",borderRadius:10,background:C.bg2,color:C.text2,fontWeight:600}}>{s.count}</span>
                  </div>
                  <span style={{fontSize:13,fontWeight:700,color:s.color}}>{s.montant}M FCFA</span>
                </div>
                <div style={{height:10,background:C.bg2,borderRadius:5,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${w}%`,background:s.color,borderRadius:5,transition:"width 1s ease"}}/>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Performance par commercial */}
      <Card>
        <CardHeader title="Performance par commercial"/>
        <div style={{padding:"12px 16px"}}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={[
              {name:"Marie K.",deals:3,ca:495,objectif:500},
              {name:"Jean F.",deals:2,ca:185,objectif:250},
              {name:"Pierre E.",deals:2,ca:325,objectif:300},
              {name:"David M.",deals:1,ca:65,objectif:100},
            ]} margin={{top:5,right:10,left:0,bottom:20}}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
              <XAxis dataKey="name" tick={{fontSize:11,fill:C.text3}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:C.text3}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}M`}/>
              <Tooltip content={<CustomTooltip suffix=" M"/>}/>
              <Bar dataKey="ca" name="CA généré" fill={C.blue_m} radius={[4,4,0,0]}/>
              <Bar dataKey="objectif" name="Objectif" fill={C.orange_m} radius={[4,4,0,0]} opacity={.6}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>

    {/* Table deals */}
    <Card>
      <CardHeader title="Détail des opportunités" subtitle="Toutes les opportunités actives et clôturées"/>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:C.bg2}}>
              {["Deal","Client","Étape","Montant","Probabilité","Valeur pond.","Clôture","Responsable"].map(h=>(
                <th key={h} style={{padding:"9px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:C.text2,borderBottom:`2px solid ${C.border}`,whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              {name:"5G Réseau Cœur MTN",client:"MTN Cameroun",stage:"negociation",stageL:"Négociation",stageC:C.purple_m,stageBg:C.purple_l,montant:180,prob:75,close:"30/06",resp:"Marie K."},
              {name:"Fibre Optique CAMTEL",client:"CAMTEL",stage:"qualifie",stageL:"Qualifié",stageC:C.blue_m,stageBg:C.blue_l,montant:220,prob:45,close:"31/08",resp:"Marie K."},
              {name:"Maintenance Huawei",client:"Huawei",stage:"negociation",stageL:"Négociation",stageC:C.purple_m,stageBg:C.purple_l,montant:45,prob:85,close:"30/04",resp:"Pierre E."},
              {name:"Optimisation RF Orange",client:"Orange",stage:"proposition",stageL:"Proposition",stageC:C.orange_m,stageBg:C.orange_l,montant:85,prob:60,close:"15/05",resp:"Jean F."},
              {name:"Audit Nexttel",client:"Nexttel",stage:"prospect",stageL:"Prospect",stageC:C.text3,stageBg:C.bg2,montant:25,prob:30,close:"31/07",resp:"Jean F."},
              {name:"5G Small Cells MTN",client:"MTN Cameroun",stage:"gagne",stageL:"Gagné ✓",stageC:C.green_m,stageBg:C.green_l,montant:95,prob:100,close:"28/02",resp:"Pierre E."},
            ].map((d,i)=>(
              <tr key={i} style={{borderBottom:`1px solid ${C.border2}`,transition:"background .1s"}}
                onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                onMouseLeave={e=>e.currentTarget.style.background="white"}>
                <td style={{padding:"11px 14px",fontSize:13,fontWeight:600,color:C.text}}>{d.name}</td>
                <td style={{padding:"11px 14px",fontSize:12,color:C.text2}}>{d.client}</td>
                <td style={{padding:"11px 14px"}}><Badge label={d.stageL} color={d.stageC} bg={d.stageBg}/></td>
                <td style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:C.blue}}>{d.montant}M FCFA</td>
                <td style={{padding:"11px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <Prog value={d.prob} color={d.prob>=70?C.green_m:d.prob>=40?C.orange_m:C.red_m} height={5}/>
                    <span style={{fontSize:12,fontWeight:700,color:d.prob>=70?C.green:d.prob>=40?C.orange:C.red}}>{d.prob}%</span>
                  </div>
                </td>
                <td style={{padding:"11px 14px",fontSize:12,fontWeight:700,color:C.purple}}>{Math.round(d.montant*d.prob/100)}M FCFA</td>
                <td style={{padding:"11px 14px",fontSize:12,color:C.text3}}>{d.close}</td>
                <td style={{padding:"11px 14px",fontSize:12,color:C.text2}}>{d.resp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
);

// ===== MODULE RH =====
const ModuleRH = () => (
  <div style={{animation:"fadeUp .35s ease both"}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
      <KpiCard title="Effectif total" value={40} color={C.blue} bg={C.blue_l} icon="users" sub="Internes + Techniciens" trend="+2 ce trimestre" trendUp delay={0}/>
      <KpiCard title="Masse salariale" value={34.2} suffix=" M FCFA" color={C.orange} bg={C.orange_l} icon="money" sub="Mars 2024 · +4.2%" trend="+4.2% vs Fév" trendUp={false} delay={.06}/>
      <KpiCard title="Taux de présence" value={87} suffix="%" color={C.green} bg={C.green_l} icon="check" sub="34/40 présents · 3 absents" trend="+2pts vs semaine dernière" trendUp delay={.12}/>
      <KpiCard title="Congés en cours" value={3} color={C.purple} bg={C.purple_l} icon="calendar" sub="1 approuvé · 1 en attente" trend="Normal" trendUp delay={.18}/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
      {/* Présence par département */}
      <Card>
        <CardHeader title="Présence par département" subtitle="Aujourd'hui · 15 mars 2024"/>
        <div style={{padding:"12px 16px"}}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={RH_PRESENCE} margin={{top:5,right:10,left:0,bottom:0}} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
              <XAxis dataKey="dept" tick={{fontSize:10,fill:C.text3}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:C.text3}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="present" name="Présents" stackId="a" fill={C.green_m} radius={[0,0,0,0]}/>
              <Bar dataKey="absent" name="Absents" stackId="a" fill={C.red_m}/>
              <Bar dataKey="conge" name="Congés" stackId="a" fill={C.orange_m} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Masse salariale par département */}
      <Card>
        <CardHeader title="Masse salariale par département" subtitle="Internes + Externes en FCFA"/>
        <div style={{padding:"12px 16px"}}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={SALAIRE_DEPT} margin={{top:5,right:10,left:0,bottom:0}} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
              <XAxis dataKey="dept" tick={{fontSize:10,fill:C.text3}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:C.text3}} axisLine={false} tickLine={false} tickFormatter={v=>`${Math.round(v/1000000)}M`}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="interne" name="Internes" stackId="a" fill={C.blue_m}/>
              <Bar dataKey="externe" name="Externes" stackId="a" fill={C.cyan_m} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>

    {/* Table RH */}
    <Card>
      <CardHeader title="Effectif par département — Détail"/>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:C.bg2}}>
              {["Département","Effectif","Présents","Absents","Congés","Masse sal. internes","Masse sal. externes","Total masse sal.","Présence"].map(h=>(
                <th key={h} style={{padding:"9px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:C.text2,borderBottom:`2px solid ${C.border}`,whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RH_PRESENCE.map((r,i)=>{
              const sal = SALAIRE_DEPT[i];
              const pct = Math.round((r.present/r.total)*100);
              return (
                <tr key={r.dept} style={{borderBottom:`1px solid ${C.border2}`,transition:"background .1s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                  onMouseLeave={e=>e.currentTarget.style.background="white"}>
                  <td style={{padding:"11px 14px",fontSize:13,fontWeight:600,color:C.text}}>{r.dept}</td>
                  <td style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:C.blue}}>{r.total}</td>
                  <td style={{padding:"11px 14px"}}><Badge label={r.present} color={C.green} bg={C.green_l}/></td>
                  <td style={{padding:"11px 14px"}}><Badge label={r.absent} color={r.absent>0?C.red:C.text3} bg={r.absent>0?C.red_l:C.bg2}/></td>
                  <td style={{padding:"11px 14px"}}><Badge label={r.conge} color={r.conge>0?C.orange:C.text3} bg={r.conge>0?C.orange_l:C.bg2}/></td>
                  <td style={{padding:"11px 14px",fontSize:12,color:C.text2}}>{fmtN(sal?.interne||0)} FCFA</td>
                  <td style={{padding:"11px 14px",fontSize:12,color:C.text2}}>{sal?.externe>0?`${fmtN(sal.externe)} FCFA`:"—"}</td>
                  <td style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:C.orange}}>{fmtN((sal?.interne||0)+(sal?.externe||0))} FCFA</td>
                  <td style={{padding:"11px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <Prog value={pct} color={pct>=80?C.green_m:pct>=60?C.orange_m:C.red_m} height={5}/>
                      <span style={{fontSize:11,fontWeight:700,color:pct>=80?C.green:pct>=60?C.orange:C.red}}>{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
);

// ===== MODULE PROJETS =====
const ModuleProjets = () => (
  <div style={{animation:"fadeUp .35s ease both"}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
      <KpiCard title="Projets actifs" value={6} color={C.indigo} bg={C.indigo_l} icon="project" sub="4 dans délais · 2 à risque" trend="2 risques identifiés" trendUp={false} delay={0}/>
      <KpiCard title="Budget total engagé" value={650} suffix=" M FCFA" color={C.blue} bg={C.blue_l} icon="money" sub="Tous projets confondus" trend="Sous contrôle" trendUp delay={.06}/>
      <KpiCard title="Dépensé à ce jour" value={348.5} suffix=" M FCFA" color={C.orange} bg={C.orange_l} icon="chart" sub="53.6% du budget total" trend="+2.1% vs plan" trendUp={false} delay={.12}/>
      <KpiCard title="Projets terminés" value={1} color={C.green} bg={C.green_l} icon="check" sub="MTN Small Cells · Q1 2024" trend="Dans les délais" trendUp delay={.18}/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:16,marginBottom:16}}>
      {/* Avancement projets */}
      <Card>
        <CardHeader title="Avancement & Budget par projet" subtitle="Budget en millions FCFA"/>
        <div style={{padding:"12px 16px"}}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={PROJETS_DATA} layout="vertical" margin={{top:5,right:60,left:80,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false}/>
              <XAxis type="number" tick={{fontSize:10,fill:C.text3}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}M`}/>
              <YAxis type="category" dataKey="name" tick={{fontSize:11,fill:C.text2}} axisLine={false} tickLine={false} width={80}/>
              <Tooltip content={<CustomTooltip suffix=" M"/>}/>
              <Bar dataKey="budget" name="Budget" fill={C.blue_l} stroke={C.blue_m} strokeWidth={1} radius={[0,4,4,0]}/>
              <Bar dataKey="depense" name="Dépensé" fill={C.blue_m} radius={[0,4,4,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Radar performance globale */}
      <Card>
        <CardHeader title="Radar de performance globale" subtitle="Score sur 100 — Tous indicateurs"/>
        <div style={{padding:"8px 16px"}}>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={PERF_RADAR} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke={C.border}/>
              <PolarAngleAxis dataKey="indicateur" tick={{fontSize:10,fill:C.text2}}/>
              <PolarRadiusAxis domain={[0,100]} tick={{fontSize:9,fill:C.text3}} tickCount={4}/>
              <Radar name="CleanIT" dataKey="A" stroke={C.blue_m} fill={C.blue_m} fillOpacity={.2} strokeWidth={2}/>
              <Tooltip formatter={v=>[`${v}/100`,"Score"]} contentStyle={{fontSize:11,fontFamily:"inherit",border:`1px solid ${C.border}`,borderRadius:6}}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>

    {/* Table projets */}
    <Card>
      <CardHeader title="Tableau de bord projets" subtitle="Suivi détaillé budget, avancement et alertes"/>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:C.bg2}}>
              {["Projet","Responsable","Avancement","Budget","Dépensé","Reste","Retard","Statut"].map(h=>(
                <th key={h} style={{padding:"9px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:C.text2,borderBottom:`2px solid ${C.border}`,whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PROJETS_DATA.map((p,i)=>{
              const reste = p.budget-p.depense;
              const status = p.avancement===100?"Terminé":p.retard>0?"En retard":p.avancement>=60?"En cours":"Démarrage";
              const sc = p.avancement===100?C.green:p.retard>0?C.red:p.avancement>=60?C.blue:C.orange;
              const sb = p.avancement===100?C.green_l:p.retard>0?C.red_l:p.avancement>=60?C.blue_l:C.orange_l;
              return (
                <tr key={p.name} style={{borderBottom:`1px solid ${C.border2}`,transition:"background .1s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                  onMouseLeave={e=>e.currentTarget.style.background="white"}>
                  <td style={{padding:"11px 14px",fontSize:13,fontWeight:600,color:C.text}}>{p.name}</td>
                  <td style={{padding:"11px 14px",fontSize:12,color:C.text2}}>{p.responsable}</td>
                  <td style={{padding:"11px 14px",minWidth:120}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <Prog value={p.avancement} color={sc} height={6}/>
                      <span style={{fontSize:12,fontWeight:700,color:sc,minWidth:32}}>{p.avancement}%</span>
                    </div>
                  </td>
                  <td style={{padding:"11px 14px",fontSize:12,fontWeight:600,color:C.text}}>{p.budget}M FCFA</td>
                  <td style={{padding:"11px 14px",fontSize:12,color:C.text2}}>{p.depense}M FCFA</td>
                  <td style={{padding:"11px 14px",fontSize:12,fontWeight:600,color:reste>0?C.green:C.red}}>{reste.toFixed(1)}M FCFA</td>
                  <td style={{padding:"11px 14px"}}>{p.retard>0?<Badge label={`${p.retard}j`} color={C.red} bg={C.red_l}/>:<Badge label="—" color={C.text3} bg={C.bg2}/>}</td>
                  <td style={{padding:"11px 14px"}}><Badge label={status} color={sc} bg={sb}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
);

// ===== DASHBOARD GLOBAL =====
const DashboardGlobal = ({setTab}) => (
  <div style={{animation:"fadeUp .35s ease both"}}>
    {/* KPIs globaux */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
      <KpiCard title="CA total 2024" value={683} suffix=" M FCFA" color={C.blue} bg={C.blue_l} icon="money" sub="Trim. 1 · Objectif: 900M" trend="+18.4% vs T-1" trendUp onClick={()=>setTab("finance")} delay={0}/>
      <KpiCard title="Pipeline commercial" value={555} suffix=" M FCFA" color={C.green} bg={C.green_l} icon="target" sub="6 deals actifs · Conv. 25%" trend="+8.2% ce mois" trendUp onClick={()=>setTab("commercial")} delay={.06}/>
      <KpiCard title="Masse salariale" value={34.2} suffix=" M FCFA" color={C.orange} bg={C.orange_l} icon="users" sub="40 personnes · Présence 87%" trend="+4.2% maîtrisé" trendUp={false} onClick={()=>setTab("rh")} delay={.12}/>
      <KpiCard title="Budget projets" value={650} suffix=" M FCFA" color={C.purple} bg={C.purple_l} icon="project" sub="6 projets · 53.6% dépensé" trend="2 projets à risque" trendUp={false} onClick={()=>setTab("projets")} delay={.18}/>
    </div>

    {/* Graphiques principaux */}
    <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:16,marginBottom:16}}>
      <Card>
        <CardHeader title="Vue consolidée — CA, Pipeline & Charges" subtitle="6 mois historique + 3 mois prévision Python"
          action={<Badge label="IA Active" color={C.blue} bg={C.blue_l}/>}/>
        <div style={{padding:"16px 12px 8px"}}>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={CA_MENSUEL} margin={{top:5,right:20,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
              <XAxis dataKey="mois" tick={{fontSize:11,fill:C.text3}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:C.text3}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}M`}/>
              <Tooltip content={<CustomTooltip suffix=" M"/>}/>
              <Legend wrapperStyle={{fontSize:11,paddingTop:8}}/>
              <Area type="monotone" dataKey="pipeline" name="Pipeline" fill={C.green_l} stroke={C.green_m} strokeWidth={1.5} fillOpacity={.4} strokeDasharray="4 2"/>
              <Area type="monotone" dataKey="ca" name="CA réalisé" fill={C.blue_l} stroke={C.blue_m} strokeWidth={2.5} fillOpacity={.6}/>
              <Bar dataKey="charges" name="Charges" fill={C.orange_m} opacity={.7} radius={[2,2,0,0]}/>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Score global radar */}
      <Card>
        <CardHeader title="Score de performance globale" subtitle="Radar CleanIT — Tous indicateurs / 100"/>
        <div style={{padding:"8px"}}>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={PERF_RADAR} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke={C.border2}/>
              <PolarAngleAxis dataKey="indicateur" tick={{fontSize:10,fill:C.text2}}/>
              <PolarRadiusAxis domain={[0,100]} tick={{fontSize:9,fill:C.text3}} tickCount={4}/>
              <Radar name="Score" dataKey="A" stroke={C.blue_m} fill={C.blue_m} fillOpacity={.2} strokeWidth={2}/>
              <Tooltip formatter={v=>[`${v}/100`,"Score"]} contentStyle={{fontSize:11,fontFamily:"inherit",border:`1px solid ${C.border}`,borderRadius:6}}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>

    {/* 3 colonnes bottom */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:16}}>
      {/* Top clients */}
      <Card>
        <CardHeader title="Top clients par CA" action={<button style={{fontSize:11,color:C.blue,background:C.blue_l,border:"none",borderRadius:6,padding:"3px 8px",cursor:"pointer",fontFamily:"inherit",fontWeight:600}} onClick={()=>setTab("commercial")}>Voir →</button>}/>
        <div style={{padding:"8px 0"}}>
          {CA_CLIENTS.map((cl,i)=>(
            <div key={cl.client} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 18px",borderBottom:i<CA_CLIENTS.length-1?`1px solid ${C.border2}`:"none"}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:C.bg2,color:C.text3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>#{i+1}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:3}}>{cl.client}</div>
                <Prog value={Math.round(cl.ca/4.5)} color={[C.blue_m,C.cyan_m,C.purple_m,C.orange_m,C.green_m,C.pink_m][i]} height={4}/>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:13,fontWeight:700,color:C.blue}}>{cl.ca}M</div>
                <div style={{fontSize:10,color:C.text3}}>FCFA</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Projets statut */}
      <Card>
        <CardHeader title="Statut projets" action={<button style={{fontSize:11,color:C.purple,background:C.purple_l,border:"none",borderRadius:6,padding:"3px 8px",cursor:"pointer",fontFamily:"inherit",fontWeight:600}} onClick={()=>setTab("projets")}>Voir →</button>}/>
        <div style={{padding:"8px 0"}}>
          {PROJETS_DATA.map((p,i)=>{
            const sc = p.avancement===100?C.green_m:p.retard>0?C.red_m:p.avancement>=60?C.blue_m:C.orange_m;
            return (
              <div key={p.name} style={{padding:"10px 18px",borderBottom:i<PROJETS_DATA.length-1?`1px solid ${C.border2}`:"none"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:12,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1,marginRight:8}}>{p.name}</span>
                  <span style={{fontSize:11,fontWeight:700,color:sc,flexShrink:0}}>{p.avancement}%</span>
                </div>
                <Prog value={p.avancement} color={sc} height={5}/>
                {p.retard>0&&<div style={{fontSize:10,color:C.red,marginTop:3}}>⚠ {p.retard}j de retard</div>}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Alertes IA */}
      <Card>
        <CardHeader title="⚡ Alertes IA" subtitle="Détection automatique Python"/>
        <div style={{padding:"8px 0"}}>
          {[
            {type:"CRITIQUE",icon:"🔴",c:C.red,bg:C.red_l,msg:"Orange RF Q2 en retard 21j. Risque pénalités contrat."},
            {type:"ATTENTION",icon:"🟡",c:C.orange,bg:C.orange_l,msg:"3 tâches CRM urgentes. Risque perte Nexttel."},
            {type:"OPPORTUNITÉ",icon:"💡",c:C.blue,bg:C.blue_l,msg:"CA prévu +22% Avr-Mai. Besoin 3 techniciens."},
            {type:"POSITIF",icon:"🟢",c:C.green,bg:C.green_l,msg:"MTN 5G Core: prob. clôture 91% estimée par modèle."},
          ].map((a,i)=>(
            <div key={i} style={{padding:"10px 18px",borderBottom:i<3?`1px solid ${C.border2}`:"none",borderLeft:`3px solid ${a.c}`}}>
              <div style={{fontSize:11,fontWeight:700,color:a.c,marginBottom:4}}>{a.icon} {a.type}</div>
              <div style={{fontSize:12,color:C.text2,lineHeight:1.5}}>{a.msg}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>

    {/* Répartitions */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card>
        <CardHeader title="Présence RH par département"/>
        <div style={{padding:"12px 16px"}}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={RH_PRESENCE} margin={{top:5,right:10,left:0,bottom:0}} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
              <XAxis dataKey="dept" tick={{fontSize:10,fill:C.text3}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:C.text3}} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="present" name="Présents" stackId="a" fill={C.green_m}/>
              <Bar dataKey="absent" name="Absents" stackId="a" fill={C.red_m}/>
              <Bar dataKey="conge" name="Congés" stackId="a" fill={C.orange_m} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader title="Pipeline par étape commerciale"/>
        <div style={{padding:"12px 16px"}}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={PIPELINE_STAGES} margin={{top:5,right:10,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
              <XAxis dataKey="stage" tick={{fontSize:10,fill:C.text3}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:C.text3}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}M`}/>
              <Tooltip content={<CustomTooltip suffix=" M"/>}/>
              <Bar dataKey="montant" name="Montant" radius={[4,4,0,0]}>
                {PIPELINE_STAGES.map((s,i)=><Cell key={i} fill={s.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  </div>
);

// ===== NAVIGATION =====
const TABS = [
  {id:"global",    l:"Vue globale",    icon:"chart",   color:C.blue},
  {id:"finance",   l:"Financier",      icon:"money",   color:C.green},
  {id:"commercial",l:"Commercial",     icon:"target",  color:C.purple},
  {id:"rh",        l:"Ressources RH",  icon:"users",   color:C.orange},
  {id:"projets",   l:"Projets",        icon:"project", color:C.indigo},
];

// ===== EXPORT PRINCIPAL =====
export default function BI() {
  const [tab,setTab] = useState("global");
  const [period,setPeriod] = useState("3m");
  const activeTab = TABS.find(t=>t.id===tab);

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Inter','Segoe UI',Arial,sans-serif",WebkitFontSmoothing:"antialiased"}}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes pulse2{0%,100%{opacity:1}50%{opacity:.5}}
        *{box-sizing:border-box}
      `}</style>

      {/* TOPBAR */}
      <div style={{background:"white",borderBottom:`1px solid ${C.border}`,height:52,display:"flex",alignItems:"center",padding:"0 24px",gap:0,position:"sticky",top:0,zIndex:200,boxShadow:C.shadow}}>

        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginRight:24,paddingRight:24,borderRight:`1px solid ${C.border}`}}>
          <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${C.blue},${C.purple})`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Ico n="chart" s={16} c="white"/>
          </div>
          <div>
            <div style={{fontSize:14,fontWeight:800,color:C.text,letterSpacing:".3px"}}>CleanIT <span style={{color:C.blue}}>Analytics</span></div>
            <div style={{fontSize:10,color:C.text3}}>Business Intelligence</div>
          </div>
        </div>

        {/* Nav tabs */}
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            display:"flex",alignItems:"center",gap:7,
            height:"100%",padding:"0 16px",border:"none",
            borderBottom:`2px solid ${tab===t.id?t.color:"transparent"}`,
            background:"transparent",
            color:tab===t.id?t.color:C.text3,
            fontWeight:tab===t.id?700:400,
            fontSize:13,cursor:"pointer",fontFamily:"inherit",
            whiteSpace:"nowrap",transition:"all .15s",
          }}>
            <Ico n={t.icon} s={14} c={tab===t.id?t.color:C.text3}/>
            {t.l}
          </button>
        ))}

        <div style={{marginLeft:"auto",display:"flex",gap:12,alignItems:"center"}}>
          {/* Live indicator */}
          <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11,fontWeight:600,color:C.green,background:C.green_l,border:`1px solid ${C.green_m}30`,borderRadius:20,padding:"4px 12px"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:C.green_m,animation:"pulse2 2s infinite"}}/>
            Données temps réel
          </div>

          {/* Période */}
          <div style={{display:"flex",background:C.bg2,border:`1px solid ${C.border}`,borderRadius:6,overflow:"hidden"}}>
            {["7j","30j","3m","1an","Tout"].map(p=>(
              <button key={p} onClick={()=>setPeriod(p)} style={{padding:"5px 12px",border:"none",borderRight:`1px solid ${C.border}`,background:period===p?C.blue:"transparent",color:period===p?"white":C.text3,fontSize:11,fontWeight:period===p?700:400,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
                {p}
              </button>
            ))}
          </div>

          {/* Export */}
          <button style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",background:"white",border:`1px solid ${C.border}`,borderRadius:6,fontSize:12,fontWeight:500,color:C.text2,cursor:"pointer",fontFamily:"inherit"}}>
            <Ico n="download" s={13} c={C.text2}/>
            Exporter
          </button>
        </div>
      </div>

      {/* Sub-header */}
      <div style={{background:"white",borderBottom:`1px solid ${C.border2}`,padding:"10px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:activeTab?.color}}/>
          <h1 style={{fontSize:16,fontWeight:700,color:C.text,margin:0}}>{activeTab?.l}</h1>
          <span style={{fontSize:12,color:C.text3}}>· Mars 2024 · Données PostgreSQL</span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",background:C.bg2,border:`1px solid ${C.border}`,borderRadius:6,fontSize:12,color:C.text2,cursor:"pointer",fontFamily:"inherit"}}>
            <Ico n="filter" s={13} c={C.text2}/>Filtres
          </button>
          <button style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",background:C.bg2,border:`1px solid ${C.border}`,borderRadius:6,fontSize:12,color:C.text2,cursor:"pointer",fontFamily:"inherit"}}>
            <Ico n="calendar" s={13} c={C.text2}/>Mars 2024
          </button>
        </div>
      </div>

      {/* CONTENU */}
      <div style={{maxWidth:1440,margin:"0 auto",padding:"20px 24px"}}>
        {tab==="global"    &&<DashboardGlobal setTab={setTab}/>}
        {tab==="finance"   &&<ModuleFinancier/>}
        {tab==="commercial"&&<ModuleCommercial/>}
        {tab==="rh"        &&<ModuleRH/>}
        {tab==="projets"   &&<ModuleProjets/>}
      </div>
    </div>
  );
}
