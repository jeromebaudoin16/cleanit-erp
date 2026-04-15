import { useState } from 'react';

const SEED = [
  { id:1, numero:'SLA-2024-001', client:'MTN Cameroun', type:'SLA Gold', sites:['DLA-001','DLA-002','YDE-001'], dateDebut:'2024-01-01', dateFin:'2024-12-31', valeur:25000000, disponibilite:99.5, mttr:4, statut:'actif', penalites:0 },
  { id:2, numero:'SLA-2024-002', client:'Orange Cameroun', type:'SLA Silver', sites:['BFN-001','GAR-001'], dateDebut:'2024-03-01', dateFin:'2025-02-28', valeur:15000000, disponibilite:99.0, mttr:6, statut:'actif', penalites:250000 },
  { id:3, numero:'SLA-2024-003', client:'Nexttel', type:'SLA Bronze', sites:['LIM-001'], dateDebut:'2024-02-15', dateFin:'2025-02-14', valeur:8000000, disponibilite:98.5, mttr:8, statut:'actif', penalites:0 },
  { id:4, numero:'SLA-2023-004', client:'Camtel', type:'SLA Gold', sites:['MAR-001','KRI-001'], dateDebut:'2023-06-01', dateFin:'2024-05-31', valeur:35000000, disponibilite:99.5, mttr:4, statut:'expire', penalites:500000 },
];

const STATUT = { actif:{label:'Actif',color:'#16a34a',bg:'#f0fdf4'}, expire:{label:'Expiré',color:'#dc2626',bg:'#fef2f2'}, suspendu:{label:'Suspendu',color:'#f59e0b',bg:'#fefce8'} };
const fmtN = n => new Intl.NumberFormat('fr-FR').format(n);

export default function Contrats() {
  const [contrats] = useState(SEED);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = contrats.filter(c => !search || c.numero.toLowerCase().includes(search.toLowerCase()) || c.client.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{padding:24,background:'#f5f7fa',minHeight:'100%'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div><h1 style={{fontSize:22,fontWeight:800,color:'#1e293b',margin:0}}>Contrats SLA</h1><p style={{color:'#64748b',fontSize:13,margin:'4px 0 0'}}>Gestion des accords de niveau de service · {contrats.length} contrats</p></div>
        <button style={{padding:'9px 18px',borderRadius:8,border:'none',background:'#16a34a',color:'white',fontSize:13,fontWeight:600,cursor:'pointer'}}>+ Nouveau Contrat</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12,marginBottom:20}}>
        {[{l:'Total',v:contrats.length,c:'#4f8ef7'},{l:'Actifs',v:contrats.filter(c=>c.statut==='actif').length,c:'#16a34a'},{l:'Expirés',v:contrats.filter(c=>c.statut==='expire').length,c:'#dc2626'},{l:'Valeur totale',v:`${fmtN(contrats.reduce((s,c)=>s+c.valeur,0))} XAF`,c:'#7c3aed'},{l:'Pénalités',v:`${fmtN(contrats.reduce((s,c)=>s+c.penalites,0))} XAF`,c:'#f59e0b'}].map(s=>(
          <div key={s.l} style={{background:'white',borderRadius:10,padding:'14px',border:'1px solid #e8ecf0',textAlign:'center',borderTop:`3px solid ${s.c}`}}>
            <div style={{fontSize:s.l.includes('XAF')?12:22,fontWeight:800,color:s.c,lineHeight:1.2}}>{s.v}</div>
            <div style={{fontSize:11,color:'#64748b',marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{background:'white',borderRadius:10,padding:'12px 16px',border:'1px solid #e8ecf0',marginBottom:16}}>
        <input placeholder="Rechercher contrat, client..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:'100%',padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} />
      </div>

      <div style={{background:'white',borderRadius:10,border:'1px solid #e8ecf0',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{background:'#f8fafc',borderBottom:'2px solid #e2e8f0'}}>{['N° Contrat','Client','Type','Sites','Valeur','Dispo SLA','MTTR','Pénalités','Statut','Actions'].map(h=><th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:'#374151',textTransform:'uppercase',letterSpacing:'0.5px',whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(c=>{
              const st=STATUT[c.statut]||STATUT.actif;
              return (
                <tr key={c.id} style={{borderBottom:'1px solid #f8fafc'}} onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background='white'}>
                  <td style={{padding:'11px 14px',fontWeight:700,color:'#4f8ef7',fontSize:13}}>{c.numero}</td>
                  <td style={{padding:'11px 14px',fontSize:13,fontWeight:600,color:'#1e293b'}}>{c.client}</td>
                  <td style={{padding:'11px 14px'}}><span style={{padding:'2px 8px',borderRadius:8,fontSize:11,fontWeight:600,background:'#eff6ff',color:'#2563eb'}}>{c.type}</span></td>
                  <td style={{padding:'11px 14px',fontSize:12,color:'#64748b'}}>{c.sites.join(', ')}</td>
                  <td style={{padding:'11px 14px',fontSize:12,fontWeight:700,color:'#16a34a',whiteSpace:'nowrap'}}>{fmtN(c.valeur)} XAF</td>
                  <td style={{padding:'11px 14px',fontSize:12,fontWeight:700,color:c.disponibilite>=99.5?'#16a34a':'#f59e0b'}}>{c.disponibilite}%</td>
                  <td style={{padding:'11px 14px',fontSize:12,color:'#374151'}}>{c.mttr}h max</td>
                  <td style={{padding:'11px 14px',fontSize:12,fontWeight:700,color:c.penalites>0?'#dc2626':'#16a34a'}}>{fmtN(c.penalites)} XAF</td>
                  <td style={{padding:'11px 14px'}}><span style={{padding:'3px 9px',borderRadius:10,fontSize:11,fontWeight:600,background:st.bg,color:st.color}}>{st.label}</span></td>
                  <td style={{padding:'11px 14px'}}><button onClick={()=>setSelected(c)} style={{padding:'4px 12px',borderRadius:6,border:'1px solid #4f8ef7',background:'white',color:'#4f8ef7',fontSize:11,cursor:'pointer',fontWeight:600}}>Voir</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'white',borderRadius:14,width:'100%',maxWidth:540,overflow:'hidden',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
            <div style={{padding:'16px 20px',background:'linear-gradient(135deg,#0f1b2d,#16a34a)',color:'white',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><div style={{fontSize:16,fontWeight:800}}>{selected.numero}</div><div style={{fontSize:12,opacity:0.8}}>{selected.client} · {selected.type}</div></div>
              <button onClick={()=>setSelected(null)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:28,height:28,borderRadius:'50%',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
            <div style={{padding:24}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                {[{l:'Client',v:selected.client},{l:'Type SLA',v:selected.type},{l:'Début',v:new Date(selected.dateDebut).toLocaleDateString('fr-FR')},{l:'Fin',v:new Date(selected.dateFin).toLocaleDateString('fr-FR')},{l:'Valeur',v:`${fmtN(selected.valeur)} XAF`},{l:'Disponibilité',v:`${selected.disponibilite}% min`},{l:'MTTR Max',v:`${selected.mttr}h`},{l:'Pénalités',v:`${fmtN(selected.penalites)} XAF`}].map(i=>(
                  <div key={i.l} style={{background:'#f8fafc',borderRadius:8,padding:'10px 14px'}}>
                    <div style={{fontSize:10,color:'#94a3b8',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px'}}>{i.l}</div>
                    <div style={{fontSize:13,fontWeight:600,color:'#1e293b',marginTop:3}}>{i.v}</div>
                  </div>
                ))}
              </div>
              <div style={{background:'#f8fafc',borderRadius:8,padding:'12px 14px',marginBottom:14}}>
                <div style={{fontSize:11,color:'#94a3b8',fontWeight:700,marginBottom:6}}>SITES COUVERTS</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{selected.sites.map(s=><span key={s} style={{padding:'3px 10px',borderRadius:8,background:'#eff6ff',color:'#2563eb',fontSize:12,fontWeight:600}}>{s}</span>)}</div>
              </div>
              <button onClick={()=>setSelected(null)} style={{width:'100%',padding:11,borderRadius:8,border:'1px solid #e2e8f0',background:'white',cursor:'pointer',fontSize:13,fontWeight:600,color:'#374151'}}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
