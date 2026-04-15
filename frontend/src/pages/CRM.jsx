import { useState } from 'react';

const CLIENTS = [
  { id:1, nom:'MTN Cameroun', type:'Opérateur Mobile', contact:'Jean-Pierre Mvogo', email:'jp.mvogo@mtn.cm', phone:'+237 679 000 001', ville:'Douala', statut:'actif', contrats:3, ca:45000000, depuis:'2022-01-15' },
  { id:2, nom:'Orange Cameroun', type:'Opérateur Mobile', contact:'Marie Claire Ateba', email:'mc.ateba@orange.cm', phone:'+237 699 000 002', ville:'Yaoundé', statut:'actif', contrats:2, ca:28000000, depuis:'2021-06-01' },
  { id:3, nom:'Camtel', type:'Opérateur Fixe', contact:'Paul Biya Jr', email:'p.biya@camtel.cm', phone:'+237 222 000 003', ville:'Yaoundé', statut:'prospet', contrats:0, ca:0, depuis:'2024-03-10' },
  { id:4, nom:'Nexttel', type:'Opérateur Mobile', contact:'Ahmed Moussa', email:'a.moussa@nexttel.cm', phone:'+237 676 000 004', ville:'Douala', statut:'actif', contrats:1, ca:12000000, depuis:'2023-02-20' },
  { id:5, nom:'Canal+ Cameroun', type:'Média', contact:'Sophie Ngo', email:'s.ngo@canal.cm', phone:'+237 695 000 005', ville:'Douala', statut:'inactif', contrats:1, ca:5000000, depuis:'2020-11-01' },
];

const STATUT = { actif:{label:'Actif',color:'#16a34a',bg:'#f0fdf4'}, prospet:{label:'Prospect',color:'#f59e0b',bg:'#fefce8'}, inactif:{label:'Inactif',color:'#dc2626',bg:'#fef2f2'} };
const fmtN = n => new Intl.NumberFormat('fr-FR').format(n);

export default function CRM() {
  const [clients, setClients] = useState(CLIENTS);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom:'', type:'Opérateur Mobile', contact:'', email:'', phone:'', ville:'', statut:'prospet' });

  const filtered = clients.filter(c => !search || c.nom.toLowerCase().includes(search.toLowerCase()) || c.contact.toLowerCase().includes(search.toLowerCase()));
  const totalCA = clients.filter(c=>c.statut==='actif').reduce((s,c)=>s+c.ca,0);

  return (
    <div style={{padding:24,background:'#f5f7fa',minHeight:'100%'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div><h1 style={{fontSize:22,fontWeight:800,color:'#1e293b',margin:0}}>CRM Clients</h1><p style={{color:'#64748b',fontSize:13,margin:'4px 0 0'}}>Gestion des relations clients · {clients.length} clients</p></div>
        <button onClick={()=>setShowForm(true)} style={{padding:'9px 18px',borderRadius:8,border:'none',background:'#34c97e',color:'white',fontSize:13,fontWeight:600,cursor:'pointer'}}>+ Nouveau Client</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12,marginBottom:20}}>
        {[{l:'Total clients',v:clients.length,c:'#4f8ef7'},{l:'Actifs',v:clients.filter(c=>c.statut==='actif').length,c:'#34c97e'},{l:'Prospects',v:clients.filter(c=>c.statut==='prospet').length,c:'#f59e0b'},{l:'CA Total',v:`${fmtN(totalCA)} XAF`,c:'#7c3aed'},{l:'Contrats actifs',v:clients.reduce((s,c)=>s+c.contrats,0),c:'#ef4444'}].map(s=>(
          <div key={s.l} style={{background:'white',borderRadius:10,padding:'14px 16px',border:'1px solid #e8ecf0',textAlign:'center',borderTop:`3px solid ${s.c}`}}>
            <div style={{fontSize:s.l.includes('CA')?14:24,fontWeight:800,color:s.c,lineHeight:1.2}}>{s.v}</div>
            <div style={{fontSize:11,color:'#64748b',marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{background:'white',borderRadius:10,padding:'12px 16px',border:'1px solid #e8ecf0',marginBottom:16,display:'flex',gap:10,alignItems:'center'}}>
        <div style={{position:'relative',flex:1}}><span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#94a3b8'}}>🔍</span><input placeholder="Rechercher client, contact..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:'100%',padding:'8px 12px 8px 32px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} /></div>
        <span style={{fontSize:12,color:'#94a3b8'}}>{filtered.length} client(s)</span>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:14}}>
        {filtered.map(c=>{
          const st=STATUT[c.statut]||STATUT.actif;
          return (
            <div key={c.id} onClick={()=>setSelected(c)} style={{background:'white',borderRadius:12,border:'1px solid #e8ecf0',overflow:'hidden',cursor:'pointer',transition:'all .2s'}} onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)';e.currentTarget.style.transform='translateY(-2px)';}} onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='none';}}>
              <div style={{height:4,background:st.color}} />
              <div style={{padding:'16px 18px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                  <div>
                    <div style={{fontSize:16,fontWeight:700,color:'#1e293b'}}>{c.nom}</div>
                    <div style={{fontSize:12,color:'#64748b',marginTop:2}}>{c.type}</div>
                  </div>
                  <span style={{padding:'3px 9px',borderRadius:10,fontSize:11,fontWeight:600,background:st.bg,color:st.color}}>{st.label}</span>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:4,marginBottom:12,fontSize:12,color:'#374151'}}>
                  <div>👤 {c.contact}</div>
                  <div>📧 {c.email}</div>
                  <div>📞 {c.phone}</div>
                  <div>📍 {c.ville}</div>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderTop:'1px solid #f1f5f9'}}>
                  <div style={{textAlign:'center'}}><div style={{fontSize:16,fontWeight:800,color:'#4f8ef7'}}>{c.contrats}</div><div style={{fontSize:10,color:'#64748b'}}>Contrats</div></div>
                  <div style={{textAlign:'center'}}><div style={{fontSize:14,fontWeight:700,color:'#34c97e'}}>{fmtN(c.ca)}</div><div style={{fontSize:10,color:'#64748b'}}>CA XAF</div></div>
                  <div style={{textAlign:'center'}}><div style={{fontSize:12,fontWeight:600,color:'#64748b'}}>{new Date(c.depuis).toLocaleDateString('fr-FR',{month:'short',year:'numeric'})}</div><div style={{fontSize:10,color:'#64748b'}}>Depuis</div></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'white',borderRadius:14,width:'100%',maxWidth:500,overflow:'hidden',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
            <div style={{padding:'16px 20px',background:'linear-gradient(135deg,#0f1b2d,#34c97e)',color:'white',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><div style={{fontSize:16,fontWeight:800}}>{selected.nom}</div><div style={{fontSize:12,opacity:0.8}}>{selected.type}</div></div>
              <button onClick={()=>setSelected(null)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:28,height:28,borderRadius:'50%',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
            <div style={{padding:24}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {[{l:'Contact',v:selected.contact},{l:'Email',v:selected.email},{l:'Téléphone',v:selected.phone},{l:'Ville',v:selected.ville},{l:'Statut',v:STATUT[selected.statut]?.label},{l:'Contrats',v:selected.contrats},{l:'CA Total',v:`${fmtN(selected.ca)} XAF`},{l:'Client depuis',v:new Date(selected.depuis).toLocaleDateString('fr-FR')}].map(i=>(
                  <div key={i.l} style={{background:'#f8fafc',borderRadius:8,padding:'10px 14px'}}>
                    <div style={{fontSize:10,color:'#94a3b8',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.5px'}}>{i.l}</div>
                    <div style={{fontSize:13,fontWeight:600,color:'#1e293b',marginTop:3}}>{i.v}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>setSelected(null)} style={{width:'100%',marginTop:16,padding:11,borderRadius:8,border:'1px solid #e2e8f0',background:'white',cursor:'pointer',fontSize:13,fontWeight:600,color:'#374151'}}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
