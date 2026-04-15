import { useState } from 'react';

const KPI_DATA = [
  { label:'Disponibilité Réseau', value:99.2, unit:'%', target:99.5, color:'#34c97e', icon:'📶', trend:'+0.3%' },
  { label:'MTTR (Temps Réparation)', value:4.2, unit:'h', target:3.0, color:'#f59e0b', icon:'⏱', trend:'-0.8h' },
  { label:'Tickets Résolus', value:94, unit:'%', target:95, color:'#4f8ef7', icon:'🎫', trend:'+2%' },
  { label:'Sites Conformes SLA', value:87, unit:'%', target:90, color:'#7c3aed', icon:'📋', trend:'+5%' },
  { label:'Techniciens Actifs', value:18, unit:'', target:24, color:'#ef4444', icon:'👷', trend:'0' },
  { label:'Interventions/Mois', value:47, unit:'', target:50, color:'#0891b2', icon:'🔧', trend:'+3' },
];

const MONTHLY = [
  { mois:'Oct', tickets:38, interventions:32, sites:8 },
  { mois:'Nov', tickets:45, interventions:38, sites:10 },
  { mois:'Déc', tickets:52, interventions:44, sites:9 },
  { mois:'Jan', tickets:41, interventions:35, sites:11 },
  { mois:'Fév', tickets:48, interventions:40, sites:13 },
  { mois:'Mar', tickets:55, interventions:47, sites:15 },
];

const maxVal = Math.max(...MONTHLY.flatMap(m => [m.tickets, m.interventions, m.sites]));

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('kpis');

  return (
    <div style={{padding:24,background:'#f5f7fa',minHeight:'100%'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div><h1 style={{fontSize:22,fontWeight:800,color:'#1e293b',margin:0}}>Analytics & KPIs</h1><p style={{color:'#64748b',fontSize:13,margin:'4px 0 0'}}>Tableau de bord des performances réseau</p></div>
        <div style={{display:'flex',gap:8}}>
          <select style={{padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}><option>6 derniers mois</option><option>3 mois</option><option>Cette année</option></select>
          <button style={{padding:'8px 16px',borderRadius:8,border:'none',background:'#4f8ef7',color:'white',fontSize:13,fontWeight:600,cursor:'pointer'}}>📊 Exporter</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',borderBottom:'2px solid #e8ecf0',marginBottom:20}}>
        {[{v:'kpis',l:'KPIs Réseau'},{v:'tendances',l:'Tendances'},{v:'sites',l:'Performance Sites'}].map(t=>(
          <button key={t.v} onClick={()=>setActiveTab(t.v)} style={{padding:'10px 20px',border:'none',background:'transparent',cursor:'pointer',fontSize:13,fontWeight:activeTab===t.v?700:400,color:activeTab===t.v?'#4f8ef7':'#64748b',borderBottom:`2px solid ${activeTab===t.v?'#4f8ef7':'transparent'}`,marginBottom:-2}}>{t.l}</button>
        ))}
      </div>

      {activeTab==='kpis' && (
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
            {KPI_DATA.map(k=>{
              const pct = Math.min(100,(k.value/k.target)*100);
              const ok = k.value >= k.target * 0.95;
              return (
                <div key={k.label} style={{background:'white',borderRadius:12,padding:'20px',border:'1px solid #e8ecf0',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
                    <div>
                      <div style={{fontSize:11,color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:4}}>{k.label}</div>
                      <div style={{fontSize:30,fontWeight:900,color:k.color,lineHeight:1}}>{k.value}<span style={{fontSize:16,fontWeight:600,color:'#94a3b8'}}>{k.unit}</span></div>
                    </div>
                    <div style={{fontSize:28}}>{k.icon}</div>
                  </div>
                  <div style={{background:'#f1f5f9',borderRadius:6,height:8,overflow:'hidden',marginBottom:8}}>
                    <div style={{width:`${pct}%`,height:'100%',background:ok?'#34c97e':pct>70?'#f59e0b':'#ef4444',borderRadius:6,transition:'width .8s'}} />
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#64748b'}}>
                    <span>Cible: {k.target}{k.unit}</span>
                    <span style={{color:ok?'#34c97e':'#f59e0b',fontWeight:600}}>{k.trend} vs mois dernier</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab==='tendances' && (
        <div style={{background:'white',borderRadius:12,padding:24,border:'1px solid #e8ecf0'}}>
          <h3 style={{fontSize:15,fontWeight:700,color:'#1e293b',marginBottom:20}}>📈 Évolution mensuelle</h3>
          <div style={{display:'flex',alignItems:'flex-end',gap:16,height:200,paddingBottom:8}}>
            {MONTHLY.map((m,i)=>(
              <div key={m.mois} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                <div style={{width:'100%',display:'flex',gap:3,alignItems:'flex-end',height:160}}>
                  {[{v:m.tickets,c:'#4f8ef7'},{v:m.interventions,c:'#34c97e'},{v:m.sites,c:'#f59e0b'}].map((b,j)=>(
                    <div key={j} style={{flex:1,height:`${(b.v/maxVal)*140}px`,background:b.c,borderRadius:'4px 4px 0 0',minHeight:4,transition:'height .5s'}} title={b.v} />
                  ))}
                </div>
                <div style={{fontSize:11,color:'#64748b',fontWeight:600}}>{m.mois}</div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:16,marginTop:12,justifyContent:'center'}}>
            {[{c:'#4f8ef7',l:'Tickets'},{c:'#34c97e',l:'Interventions'},{c:'#f59e0b',l:'Sites actifs'}].map(l=>(
              <div key={l.l} style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:'#64748b'}}>
                <div style={{width:12,height:12,borderRadius:3,background:l.c}} />{l.l}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab==='sites' && (
        <div style={{background:'white',borderRadius:12,border:'1px solid #e8ecf0',overflow:'hidden'}}>
          <div style={{padding:'14px 18px',borderBottom:'1px solid #f1f5f9'}}><span style={{fontSize:14,fontWeight:700,color:'#1e293b'}}>Performance par site</span></div>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'#f8fafc'}}>{['Site','Région','Disponibilité','Tickets','Interventions','Score'].map(h=><th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:'#374151',textTransform:'uppercase',letterSpacing:'0.5px'}}>{h}</th>)}</tr></thead>
            <tbody>
              {[{site:'DLA-001',region:'Littoral',dispo:99.8,tickets:3,interv:2,score:95},{site:'YDE-001',region:'Centre',dispo:99.5,tickets:5,interv:3,score:91},{site:'KRI-001',region:'Sud',dispo:100,tickets:1,interv:1,score:99},{site:'DLA-003',region:'Littoral',dispo:94.2,tickets:12,interv:8,score:72},{site:'GAR-001',region:'Nord',dispo:97.8,tickets:6,interv:4,score:84}].map(s=>(
                <tr key={s.site} style={{borderTop:'1px solid #f8fafc'}} onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background='white'}>
                  <td style={{padding:'11px 14px',fontWeight:700,color:'#4f8ef7',fontSize:13}}>{s.site}</td>
                  <td style={{padding:'11px 14px',fontSize:12,color:'#64748b'}}>{s.region}</td>
                  <td style={{padding:'11px 14px'}}><span style={{fontWeight:700,color:s.dispo>=99?'#34c97e':s.dispo>=97?'#f59e0b':'#ef4444'}}>{s.dispo}%</span></td>
                  <td style={{padding:'11px 14px',fontSize:12,color:'#374151'}}>{s.tickets}</td>
                  <td style={{padding:'11px 14px',fontSize:12,color:'#374151'}}>{s.interv}</td>
                  <td style={{padding:'11px 14px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{flex:1,background:'#f1f5f9',borderRadius:4,height:6,overflow:'hidden'}}><div style={{width:`${s.score}%`,height:'100%',background:s.score>=90?'#34c97e':s.score>=75?'#f59e0b':'#ef4444',borderRadius:4}} /></div>
                      <span style={{fontSize:12,fontWeight:700,color:'#1e293b',minWidth:28}}>{s.score}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
