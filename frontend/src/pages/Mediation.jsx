import { useState } from 'react';

const KPI_RESEAU = [
  { site:'DLA-001', region:'Littoral', dispo:99.8, alarm:2, trafic:850, latence:8, statut:'normal' },
  { site:'DLA-003', region:'Littoral', dispo:94.2, alarm:8, trafic:320, latence:45, statut:'critique' },
  { site:'YDE-001', region:'Centre', dispo:99.5, alarm:1, trafic:720, latence:10, statut:'normal' },
  { site:'YDE-002', region:'Centre', dispo:97.8, alarm:4, trafic:410, latence:22, statut:'alerte' },
  { site:'BFN-001', region:'Ouest', dispo:99.1, alarm:3, trafic:290, latence:15, statut:'normal' },
  { site:'KRI-001', region:'Sud', dispo:100, alarm:0, trafic:180, latence:6, statut:'normal' },
  { site:'GAR-001', region:'Nord', dispo:96.5, alarm:5, trafic:150, latence:38, statut:'alerte' },
];

const ST = { normal:{label:'Normal',color:'#16a34a',bg:'#f0fdf4'}, alerte:{label:'Alerte',color:'#f59e0b',bg:'#fefce8'}, critique:{label:'Critique',color:'#dc2626',bg:'#fef2f2'} };

export default function Mediation() {
  const [kpis] = useState(KPI_RESEAU);
  const [filter, setFilter] = useState('tous');

  const filtered = kpis.filter(k => filter==='tous' || k.statut===filter);
  const avgDispo = (kpis.reduce((s,k)=>s+k.dispo,0)/kpis.length).toFixed(2);
  const totalAlarm = kpis.reduce((s,k)=>s+k.alarm,0);

  return (
    <div style={{padding:24,background:'#f5f7fa',minHeight:'100%'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div><h1 style={{fontSize:22,fontWeight:800,color:'#1e293b',margin:0}}>Médiation & KPIs Réseau</h1><p style={{color:'#64748b',fontSize:13,margin:'4px 0 0'}}>Supervision des performances réseau en temps réel</p></div>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:'#34c97e',animation:'pulse 2s infinite'}} />
          <span style={{fontSize:12,color:'#34c97e',fontWeight:600}}>Données temps réel</span>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12,marginBottom:20}}>
        {[{l:'Disponibilité Moy.',v:`${avgDispo}%`,c:'#34c97e',icon:'📶'},{l:'Sites normaux',v:kpis.filter(k=>k.statut==='normal').length,c:'#34c97e',icon:'✅'},{l:'En alerte',v:kpis.filter(k=>k.statut==='alerte').length,c:'#f59e0b',icon:'⚠'},{l:'Critiques',v:kpis.filter(k=>k.statut==='critique').length,c:'#dc2626',icon:'🚨'},{l:'Alarmes actives',v:totalAlarm,c:'#7c3aed',icon:'🔔'},{l:'Trafic total',v:`${kpis.reduce((s,k)=>s+k.trafic,0)} Mbps`,c:'#4f8ef7',icon:'📊'}].map(s=>(
          <div key={s.l} style={{background:'white',borderRadius:10,padding:'14px',border:'1px solid #e8ecf0',textAlign:'center',borderTop:`3px solid ${s.c}`}}>
            <div style={{fontSize:22,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:s.l.includes('Mbps')||s.l.includes('%')||s.l.includes('Moy')?14:22,fontWeight:800,color:s.c,lineHeight:1.2}}>{s.v}</div>
            <div style={{fontSize:10,color:'#64748b',marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{background:'white',borderRadius:10,padding:'10px 14px',border:'1px solid #e8ecf0',marginBottom:16,display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
        <span style={{fontSize:12,fontWeight:600,color:'#64748b',marginRight:4}}>Filtrer :</span>
        {[{v:'tous',l:'Tous'},{v:'normal',l:'Normal'},{v:'alerte',l:'Alerte'},{v:'critique',l:'Critique'}].map(f=>(
          <button key={f.v} onClick={()=>setFilter(f.v)} style={{padding:'5px 12px',borderRadius:6,border:'none',background:filter===f.v?'#4f8ef7':'#f1f5f9',color:filter===f.v?'white':'#64748b',fontSize:12,cursor:'pointer',fontWeight:filter===f.v?600:400}}>{f.l}</button>
        ))}
      </div>

      <div style={{background:'white',borderRadius:10,border:'1px solid #e8ecf0',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{background:'#f8fafc',borderBottom:'2px solid #e2e8f0'}}>{['Site','Région','Disponibilité','Alarmes','Trafic','Latence','Statut'].map(h=><th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:'#374151',textTransform:'uppercase',letterSpacing:'0.5px'}}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(k=>{
              const st=ST[k.statut]||ST.normal;
              return (
                <tr key={k.site} style={{borderBottom:'1px solid #f8fafc'}} onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background='white'}>
                  <td style={{padding:'11px 14px',fontWeight:700,color:'#4f8ef7',fontSize:13}}>{k.site}</td>
                  <td style={{padding:'11px 14px',fontSize:12,color:'#64748b'}}>{k.region}</td>
                  <td style={{padding:'11px 14px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{flex:1,background:'#f1f5f9',borderRadius:4,height:6,overflow:'hidden'}}><div style={{width:`${k.dispo}%`,height:'100%',background:k.dispo>=99?'#34c97e':k.dispo>=97?'#f59e0b':'#dc2626',borderRadius:4}} /></div>
                      <span style={{fontSize:12,fontWeight:700,color:k.dispo>=99?'#34c97e':k.dispo>=97?'#f59e0b':'#dc2626',minWidth:42}}>{k.dispo}%</span>
                    </div>
                  </td>
                  <td style={{padding:'11px 14px'}}><span style={{fontSize:14,fontWeight:800,color:k.alarm===0?'#34c97e':k.alarm<5?'#f59e0b':'#dc2626'}}>{k.alarm}</span></td>
                  <td style={{padding:'11px 14px',fontSize:12,color:'#374151'}}>{k.trafic} Mbps</td>
                  <td style={{padding:'11px 14px',fontSize:12,color:k.latence<15?'#34c97e':k.latence<30?'#f59e0b':'#dc2626',fontWeight:600}}>{k.latence}ms</td>
                  <td style={{padding:'11px 14px'}}><span style={{padding:'3px 9px',borderRadius:10,fontSize:11,fontWeight:600,background:st.bg,color:st.color,display:'flex',alignItems:'center',gap:4,width:'fit-content'}}><span style={{width:6,height:6,borderRadius:'50%',background:st.color,flexShrink:0}} />{st.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
