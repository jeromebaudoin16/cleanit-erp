import { useState } from 'react';

export default function BI() {
  const [period, setPeriod] = useState('trimestre');

  const DATA = {
    revenus: [32000000, 38000000, 45000000, 41000000, 52000000, 48000000],
    depenses: [12000000, 14000000, 16000000, 13000000, 18000000, 15000000],
    mois: ['Oct','Nov','Déc','Jan','Fév','Mar'],
  };
  const fmtN = n => new Intl.NumberFormat('fr-FR',{notation:'compact',maximumFractionDigits:1}).format(n);
  const maxR = Math.max(...DATA.revenus);

  return (
    <div style={{padding:24,background:'#f5f7fa',minHeight:'100%'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div><h1 style={{fontSize:22,fontWeight:800,color:'#1e293b',margin:0}}>Business Intelligence</h1><p style={{color:'#64748b',fontSize:13,margin:'4px 0 0'}}>Analyses avancées et insights métier</p></div>
        <select value={period} onChange={e=>setPeriod(e.target.value)} style={{padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>
          <option value="mois">Ce mois</option><option value="trimestre">Ce trimestre</option><option value="annee">Cette année</option>
        </select>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:12,marginBottom:20}}>
        {[{l:'Revenus totaux',v:'256 M XAF',c:'#34c97e',t:'+18%',icon:'📈'},{l:'Marge brute',v:'68%',c:'#4f8ef7',t:'+3%',icon:'💰'},{l:'ROI Projets',v:'142%',c:'#7c3aed',t:'+12%',icon:'🎯'},{l:'Coût par site',v:'3.2 M XAF',c:'#f59e0b',t:'-5%',icon:'🏗'},{l:'Taux fidélisation',v:'94%',c:'#34c97e',t:'+2%',icon:'🤝'}].map(s=>(
          <div key={s.l} style={{background:'white',borderRadius:12,padding:'18px 16px',border:'1px solid #e8ecf0',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
              <div style={{fontSize:11,color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px'}}>{s.l}</div>
              <span style={{fontSize:20}}>{s.icon}</span>
            </div>
            <div style={{fontSize:24,fontWeight:800,color:s.c,marginBottom:4}}>{s.v}</div>
            <div style={{fontSize:11,color:s.t.startsWith('+')?'#34c97e':'#ef4444',fontWeight:600}}>{s.t} vs période précédente</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16}}>
        {/* Graphique revenus */}
        <div style={{background:'white',borderRadius:12,padding:24,border:'1px solid #e8ecf0',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
            <h3 style={{fontSize:15,fontWeight:700,color:'#1e293b',margin:0}}>📊 Revenus vs Dépenses</h3>
            <div style={{display:'flex',gap:12}}>
              {[{c:'#34c97e',l:'Revenus'},{c:'#ef4444',l:'Dépenses'}].map(l=><div key={l.l} style={{display:'flex',alignItems:'center',gap:4,fontSize:12,color:'#64748b'}}><div style={{width:12,height:12,borderRadius:3,background:l.c}} />{l.l}</div>)}
            </div>
          </div>
          <div style={{display:'flex',alignItems:'flex-end',gap:12,height:180}}>
            {DATA.mois.map((m,i)=>(
              <div key={m} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                <div style={{width:'100%',display:'flex',gap:4,alignItems:'flex-end',height:150}}>
                  <div style={{flex:1,height:`${(DATA.revenus[i]/maxR)*140}px`,background:'#34c97e',borderRadius:'4px 4px 0 0',minHeight:4}} />
                  <div style={{flex:1,height:`${(DATA.depenses[i]/maxR)*140}px`,background:'#ef444460',borderRadius:'4px 4px 0 0',minHeight:4}} />
                </div>
                <div style={{fontSize:10,color:'#64748b',fontWeight:600}}>{m}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top métriques */}
        <div style={{background:'white',borderRadius:12,padding:24,border:'1px solid #e8ecf0',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
          <h3 style={{fontSize:15,fontWeight:700,color:'#1e293b',marginBottom:16}}>🏆 Top Performances</h3>
          {[{label:'KRI-001 Kribi',value:99,color:'#34c97e'},{label:'YDE-001 Yaoundé',value:94,color:'#4f8ef7'},{label:'DLA-001 Douala',value:88,color:'#7c3aed'},{label:'BFN-001 Bafoussam',value:75,color:'#f59e0b'},{label:'GAR-001 Garoua',value:61,color:'#ef4444'}].map(s=>(
            <div key={s.label} style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#374151',marginBottom:4}}><span>{s.label}</span><span style={{fontWeight:700,color:s.color}}>{s.value}%</span></div>
              <div style={{background:'#f1f5f9',borderRadius:4,height:6,overflow:'hidden'}}><div style={{width:`${s.value}%`,height:'100%',background:s.color,borderRadius:4,transition:'width .8s'}} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
