import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

const C = {
  blue:'#185FA5', blue_l:'#E6F1FB', blue_d:'#0C447C',
  green:'#3B6D11', green_l:'#EAF3DE',
  orange:'#854F0B', orange_l:'#FAEEDA',
  red:'#A32D2D', red_l:'#FCEBEB',
  border:'#E5E7EB', border2:'#F3F4F6',
  text:'#111827', text2:'#374151', text3:'#6B7280',
  white:'#FFFFFF', bg:'#F9FAFB',
};

const SS = {
  'Disponible': { bg:C.green_l, c:C.green, dot:C.green },
  'En mission': { bg:C.blue_l,  c:C.blue_d, dot:C.blue },
  'En congé':   { bg:C.orange_l,c:C.orange, dot:C.orange },
};

const CS = {
  ok:          [C.green_l, C.green,  'Valide'],
  expire:      [C.red_l,   C.red,    'Expirée'],
  expire_soon: [C.orange_l,C.orange, 'Expire bientôt'],
};

const DI = { pdf:'PDF', xlsx:'XLS', zip:'ZIP', doc:'DOC' };
const fN = n => new Intl.NumberFormat('fr-FR').format(Math.round(n||0));


function SiteSheet({ site, tech, onBack }) {
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <div style={{padding:'16px 24px',borderBottom:`1px solid ${C.border}`,background:C.white,flexShrink:0}}>
        <button onClick={onBack} style={{fontSize:12,padding:'5px 14px',borderRadius:20,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit',color:C.text3,marginBottom:12,display:'flex',alignItems:'center',gap:5}}>
          ← Retour — {tech.name}
        </button>
        <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:4}}>{site.n}</div>
        <div style={{display:'flex',gap:8}}>
          <span style={{fontSize:12,padding:'3px 10px',borderRadius:20,background:C.blue_l,color:C.blue_d,fontWeight:600}}>{site.cl}</span>
          <span style={{fontSize:12,padding:'3px 10px',borderRadius:20,background:C.bg,color:C.text3}}>{site.reg}</span>
          <span style={{fontSize:12,padding:'3px 10px',borderRadius:20,background:C.bg,color:C.text3}}>{site.per}</span>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,padding:'14px 20px',borderBottom:`1px solid ${C.border2}`}}>
          <div style={{background:site.p>0?C.green_l:C.bg,borderRadius:10,padding:'16px 20px',border:`1px solid ${site.p>0?C.green:C.border}`}}>
            <div style={{fontSize:11,fontWeight:600,color:C.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:6}}>Perçu par {tech.name.split(' ')[0]}</div>
            <div style={{fontSize:24,fontWeight:700,color:C.green}}>+{fN(site.p)} F</div>
          </div>
          <div style={{background:site.d>0?C.red_l:C.green_l,borderRadius:10,padding:'16px 20px',border:`1px solid ${site.d>0?C.red:C.green}`}}>
            <div style={{fontSize:11,fontWeight:600,color:C.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:6}}>Montant dû</div>
            <div style={{fontSize:24,fontWeight:700,color:site.d>0?C.red:C.green}}>{site.d>0?fN(site.d)+' F':'Soldé ✓'}</div>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,padding:'0 20px 16px',borderBottom:`1px solid ${C.border2}`}}>
          <div style={{background:C.bg,borderRadius:10,padding:'14px 16px',border:`1px solid ${C.border}`}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:.8,color:C.text3,marginBottom:10,display:'flex',alignItems:'center',gap:5}}>🏢 Côté client</div>
            {[['Client',site.cl],['Responsable',site.resp.n],['Rôle',site.resp.r],['Tél.',site.resp.t],['Email',site.resp.em]].map(([l,v])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${C.border2}`,fontSize:12}}>
                <span style={{color:C.text3}}>{l}</span><span style={{fontWeight:600,fontSize:11}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{background:C.bg,borderRadius:10,padding:'14px 16px',border:`1px solid ${C.border}`}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:.8,color:C.text3,marginBottom:10,display:'flex',alignItems:'center',gap:5}}>👥 Côté CleanIT</div>
            {[['Chef de projet',site.pm.n],['Rôle',site.pm.r],['Chef terrain',site.ct.n],['Période',site.per],['Région',site.reg]].map(([l,v])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${C.border2}`,fontSize:12}}>
                <span style={{color:C.text3}}>{l}</span><span style={{fontWeight:600,fontSize:11}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{padding:'12px 20px 4px',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:.8,color:C.text3}}>Documents</div>
        {(site.docs||[]).map((d,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 20px',borderBottom:`1px solid ${C.border2}`,cursor:'pointer'}}
            onMouseEnter={e=>e.currentTarget.style.background=C.bg} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <span style={{fontSize:20,flexShrink:0}}>{DI[d.t]||'📄'}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:600,color:C.text}}>{d.n}</div>
              <div style={{fontSize:11,color:C.text3}}>{d.s} · {d.d}</div>
            </div>
            <span style={{fontSize:12,color:C.text3}}>↓</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailPage({ tech, onBack, showAddCert=false, setShowAddCert=()=>{}, newCert={n:'',org:'',date:'',expire:'',s:'ok'}, setNewCert=()=>{}, addCertToTech=()=>{}, removeCert=()=>{}, saving=false }) {
  const [tab, setTab] = useState('activite');
  const [openSite, setOpenSite] = useState(null);
  const [showLoc, setShowLoc] = useState(false);
  const ss = SS[tech.statut] || SS['Disponible'];
  const TABS = [
    {id:'activite',l:'Activité'},
    {id:'profil',l:'Profil'},
    {id:'certs',l:'Certifications'},
    {id:'sites',l:'Sites & paiements'},
  ];

  if (openSite !== null) {
    return <SiteSheet site={tech.sites[openSite]} tech={tech} onBack={()=>setOpenSite(null)}/>;
  }

  const tp = (tech.sites||[]).reduce((s,x)=>s+x.p,0);
  const td = (tech.sites||[]).reduce((s,x)=>s+x.d,0);
  const [approvalsPay, setApprovalsPay] = React.useState([]);
  React.useEffect(() => { loadApprovalsPaiements(tech.name).then(setApprovalsPay); }, [tech.name]);
  const aPaid = approvalsPay.filter(i=>i.status==='paid').reduce((s,i)=>s+(i.amount||0),0);
  const aPending = approvalsPay.filter(i=>['pending','approved'].includes(i.status)).reduce((s,i)=>s+(i.amount||0),0);
  const totalPercu = tp + aPaid;
  const totalDu = td + aPending;

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <div style={{padding:'16px 24px',borderBottom:`1px solid ${C.border}`,background:C.white,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:16}}>
          <button onClick={onBack} style={{fontSize:12,padding:'5px 14px',borderRadius:20,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit',color:C.text3,flexShrink:0,marginTop:2}}>← Retour</button>
          <div style={{width:52,height:52,borderRadius:'50%',background:C.blue_l,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700,color:C.blue_d,flexShrink:0}}>{tech.initials}</div>
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4,flexWrap:'wrap'}}>
              <span style={{fontSize:17,fontWeight:700,color:C.text}}>{tech.name}</span>
              <span style={{fontSize:12,padding:'3px 12px',borderRadius:20,background:ss.bg,color:ss.c,fontWeight:700}}>{tech.statut}</span>
            </div>
            <div style={{fontSize:13,color:C.text3,marginBottom:10}}>{tech.role} · {tech.region}</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button onClick={()=>window.open('tel:'+tech.tel.replace(/\s/g,''))} style={{fontSize:12,padding:'6px 16px',borderRadius:20,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit',color:C.text2,fontWeight:500}}>Appeler</button>
              <button onClick={()=>window.open('https://wa.me/237'+tech.tel.replace(/[^0-9]/g,'').slice(-9))} style={{fontSize:12,padding:'6px 16px',borderRadius:20,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit',color:C.green,fontWeight:500,borderColor:C.green}}>WhatsApp</button>
              <button onClick={()=>setShowLoc(!showLoc)} style={{fontSize:12,padding:'6px 16px',borderRadius:20,border:`1px solid ${C.blue}`,background:C.blue_l,color:C.blue_d,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>📍 Localiser</button>
            </div>
          </div>
        </div>
      </div>

      {showLoc && (
        <div style={{padding:'9px 20px',background:C.blue_l,borderBottom:`1px solid #B5D4F4`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <span style={{fontSize:12,color:C.blue_d}}>Dernière position — {tech.pos}</span>
          <button onClick={()=>setShowLoc(false)} style={{fontSize:11,border:'none',background:'none',cursor:'pointer',color:C.blue,fontFamily:'inherit'}}>Fermer</button>
        </div>
      )}

      <div style={{display:'flex',borderBottom:`1px solid ${C.border}`,background:C.white,padding:'0 20px',overflowX:'auto',flexShrink:0}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'10px 15px',border:'none',background:'none',cursor:'pointer',fontSize:13,fontFamily:'inherit',color:tab===t.id?C.blue:C.text3,fontWeight:tab===t.id?700:400,borderBottom:tab===t.id?`2px solid ${C.blue}`:'2px solid transparent',marginBottom:-1,whiteSpace:'nowrap',flexShrink:0}}>
            {t.l}
          </button>
        ))}
      </div>

      <div style={{flex:1,overflowY:'auto',background:C.bg}}>
        {tab==='activite' && (
          <div>
            {(tech.feed||[]).map((f,i)=>(
              <div key={i} style={{padding:'12px 20px',borderBottom:`1px solid ${C.border2}`,background:C.white,marginBottom:4}}>
                {f.ty==='photo' && (
                  <>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:7}}>
                      <div style={{width:28,height:28,borderRadius:'50%',background:C.blue_l,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:C.blue_d}}>{tech.initials}</div>
                      <span style={{fontSize:13,fontWeight:700}}>{tech.name}</span>
                      <span style={{fontSize:11,color:C.text3}}>a partagé des photos</span>
                    </div>
                    <div style={{fontSize:13,marginBottom:7,color:C.text}}>{f.tx}</div>
                    <div style={{display:'grid',gridTemplateColumns:`repeat(${Math.min(f.ph,3)},1fr)`,gap:3,borderRadius:8,overflow:'hidden',maxWidth:220,marginBottom:6}}>
                      {Array(f.ph).fill(0).map((_,j)=>(
                        <div key={j} style={{aspectRatio:'1',background:C.border2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>📸</div>
                      ))}
                    </div>
                    <div style={{fontSize:11,color:C.text3}}>{f.li}</div>
                    <div style={{fontSize:11,color:C.text3,marginTop:2}}>🕐 {f.dt}</div>
                  </>
                )}
                {f.ty==='msg' && (
                  <>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                      <div style={{width:28,height:28,borderRadius:'50%',background:C.green_l,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:C.green}}>{tech.initials}</div>
                      <span style={{fontSize:13,fontWeight:700}}>{tech.name}</span>
                      <span style={{fontSize:12,padding:'1px 8px',borderRadius:10,background:C.blue_l,color:C.blue}}>{f.canal}</span>
                    </div>
                    <div style={{background:C.bg,borderRadius:'0 10px 10px 10px',padding:'8px 12px',fontSize:13,display:'inline-block',maxWidth:'90%',color:C.text}}>{f.tx}</div>
                    <div style={{fontSize:11,color:C.text3,marginTop:4}}>🕐 {f.dt}</div>
                  </>
                )}
                {f.ty==='checkin' && (
                  <>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                      <div style={{width:28,height:28,borderRadius:'50%',background:C.orange_l,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:C.orange}}>{tech.initials}</div>
                      <span style={{fontSize:13,fontWeight:700}}>{tech.name}</span>
                      <span style={{fontSize:11,color:C.text3}}>a pointé sur site</span>
                    </div>
                    <div style={{fontSize:13,color:C.text}}>{f.tx}</div>
                    <div style={{fontSize:11,color:C.text3,marginTop:2}}>{f.li}</div>
                    <div style={{fontSize:11,color:C.text3,marginTop:2}}>🕐 {f.dt}</div>
                  </>
                )}
                {f.ty==='inter' && (
                  <>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                      <div style={{width:28,height:28,borderRadius:'50%',background:C.border2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🔧</div>
                      <span style={{fontSize:13,fontWeight:700}}>Intervention</span>
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:3}}>{f.tx}</div>
                    <div style={{fontSize:12,color:C.text3}}>{f.det}</div>
                    <div style={{fontSize:11,color:C.text3,marginTop:3}}>{f.dt}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {tab==='profil' && (
          <div style={{padding:'16px 20px',background:C.white}}>
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
              <div style={{width:56,height:56,borderRadius:'50%',background:C.blue_l,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700,color:C.blue_d,flexShrink:0}}>{tech.initials}</div>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:2}}>{tech.name}</div>
                <div style={{fontSize:12,color:C.text3}}>{tech.role} · {tech.region}</div>
                <div style={{display:'flex',gap:16,marginTop:8}}>
                  {[[tech.missions,'missions'],[tech.sites_count,'sites'],[tech.certs.filter(c=>c.s==='ok').length,'certs valides']].map(([v,l])=>(
                    <div key={l} style={{textAlign:'center'}}>
                      <div style={{fontSize:16,fontWeight:700,color:C.text}}>{v}</div>
                      <div style={{fontSize:10,color:C.text3}}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {[['Téléphone',tech.phone],['Email',tech.email],['Région',tech.region],['Dans l\'équipe depuis',tech.debut],['Statut actuel',tech.statut]].map(([l,v])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'9px 0',borderBottom:`1px solid ${C.border2}`,fontSize:13}}>
                <span style={{color:C.text3}}>{l}</span><span style={{fontWeight:600,color:C.text}}>{v}</span>
              </div>
            ))}
          </div>
        )}

        {tab==='certs' && newCert && setShowAddCert && (
          <div style={{background:C.white}}>
            <div style={{padding:'12px 20px 4px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:.8,color:C.text3}}>Certifications & habilitations</span>
              <div style={{display:'flex',gap:6}}>
                <button onClick={()=>setShowAddCert(true)} style={{fontSize:11,padding:'4px 10px',background:C.blue_l,color:C.blue_d,border:'none',borderRadius:6,cursor:'pointer',fontWeight:600}}>+ Ajouter</button>

              </div>
            </div>
            {showAddCert&&(
              <div style={{margin:'0 20px 12px',padding:12,background:C.bg,borderRadius:8,border:'1px solid '+C.border}}>
                <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:8}}>{showAddCert===true?'Nouvelle certification':'Modifier la certification'}</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                  <div><label style={{fontSize:10,color:C.text3,display:'block',marginBottom:2}}>Nom *</label><input value={newCert.n} onChange={e=>setNewCert(p=>({...p,n:e.target.value}))} placeholder="Ex: HCNP-5G" style={{width:'100%',padding:'6px',border:'1px solid '+C.border,borderRadius:4,fontSize:12,boxSizing:'border-box'}}/></div>
                  <div><label style={{fontSize:10,color:C.text3,display:'block',marginBottom:2}}>Organisme</label><input value={newCert.org} onChange={e=>setNewCert(p=>({...p,org:e.target.value}))} placeholder="Ex: Huawei" style={{width:'100%',padding:'6px',border:'1px solid '+C.border,borderRadius:4,fontSize:12,boxSizing:'border-box'}}/></div>
                  <div><label style={{fontSize:10,color:C.text3,display:'block',marginBottom:2}}>Date obtention</label><input type="date" value={newCert.date} onChange={e=>setNewCert(p=>({...p,date:e.target.value}))} style={{width:'100%',padding:'6px',border:'1px solid '+C.border,borderRadius:4,fontSize:12,boxSizing:'border-box'}}/></div>
                  <div><label style={{fontSize:10,color:C.text3,display:'block',marginBottom:2}}>Expiration</label><input type="date" value={newCert.expire} onChange={e=>setNewCert(p=>({...p,expire:e.target.value}))} style={{width:'100%',padding:'6px',border:'1px solid '+C.border,borderRadius:4,fontSize:12,boxSizing:'border-box'}}/></div>
                </div>
                <div style={{display:'flex',gap:6}}>
                  <select value={newCert.s} onChange={e=>setNewCert(p=>({...p,s:e.target.value}))} style={{padding:'6px',border:'1px solid '+C.border,borderRadius:4,fontSize:12,flex:1}}>
                    <option value="ok">Valide</option><option value="expire_soon">Expire bientôt</option><option value="expire">Expirée</option>
                  </select>
                  <label style={{fontSize:11,padding:'6px 10px',background:C.bg,border:'1px solid '+C.border,borderRadius:4,cursor:'pointer',whiteSpace:'nowrap'}}>
                    📎 PDF
                    <input type="file" accept=".pdf,image/*" style={{display:'none'}} onChange={e=>{
                      const f=e.target.files[0]; if(!f) return;
                      setNewCert(p=>({...p,pdfName:f.name}));
                    }}/>
                  </label>
                  <button onClick={()=>addCertToTech(tech)} disabled={saving||!newCert.n} style={{padding:'6px 14px',background:C.blue,color:'#fff',border:'none',borderRadius:4,cursor:'pointer',fontSize:12,fontWeight:600}}>{saving?'...':'Ajouter'}</button>
                  <button onClick={()=>setShowAddCert(false)} style={{padding:'6px 10px',background:'#fff',border:'1px solid '+C.border,borderRadius:4,cursor:'pointer',fontSize:12}}>×</button>
                </div>
              </div>
            )}
            {(tech.certs||[]).map((cert,i)=>{
              // Calculer statut réel selon date expiration
              const certStatus = (() => {
                if(!cert.expire) return cert.s||'ok';
                const exp = new Date(cert.expire);
                const now = new Date();
                const diff = (exp-now)/(1000*3600*24);
                if(diff < 0) return 'expire';
                if(diff < 90) return 'expire_soon';
                return 'ok';
              })();
              const [bg,col,label] = CS[certStatus]||CS.ok;
              return (
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 20px',borderBottom:`1px solid ${C.border2}`,cursor:'pointer'}}
                  onClick={()=>setShowAddCert(cert)}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:C.text}}>{cert.n}</div>
                    <div style={{fontSize:11,color:C.text3}}>Expire le {cert.e}</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:11,padding:'3px 10px',borderRadius:20,background:bg,color:col,fontWeight:700}}>{label}</span>
                    <button onClick={e=>{e.stopPropagation();if(window.confirm('Supprimer?'))removeCert(tech,cert.id);}}
                      style={{padding:'2px 7px',background:C.red_l,color:C.red,border:'none',borderRadius:4,fontSize:11,cursor:'pointer'}}>×</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab==='sites' && (
          <>
          <div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,padding:'14px 20px',borderBottom:`1px solid ${C.border2}`,background:C.white}}>
              <div style={{background:C.green_l,borderRadius:10,padding:'16px 20px',border:`1px solid ${C.green}`}}>
                <div style={{fontSize:11,fontWeight:600,color:C.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:6}}>Total perçu</div>
                <div style={{fontSize:24,fontWeight:700,color:C.green}}>{fN(totalPercu)} F</div>
                {aPaid>0&&<div style={{fontSize:10,color:C.green,marginTop:3}}>dont {fN(aPaid)} F via Approvals</div>}
              </div>
              <div style={{background:totalDu>0?C.red_l:C.green_l,borderRadius:10,padding:'16px 20px',border:`1px solid ${totalDu>0?C.red:C.green}`}}>
                <div style={{fontSize:11,fontWeight:600,color:C.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:6}}>Montant dû</div>
                <div style={{fontSize:24,fontWeight:700,color:totalDu>0?C.red:C.green}}>{totalDu>0?fN(totalDu)+' F':'Tout soldé ✓'}</div>
                {aPending>0&&<div style={{fontSize:10,color:C.orange,marginTop:3}}>{fN(aPending)} F approuvé en cours</div>}
              </div>
            </div>
            {(tech.sites||[]).map((s,i)=>(
              <div key={i} onClick={()=>setOpenSite(i)}
                style={{display:'flex',alignItems:'center',padding:'12px 20px',borderBottom:`1px solid ${C.border2}`,cursor:'pointer',background:C.white}}
                onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                onMouseLeave={e=>e.currentTarget.style.background=C.white}>
                <div style={{display:'flex',alignItems:'center',gap:10,flex:1}}>
                  <div style={{width:3,height:34,borderRadius:2,background:s.d>0?C.red:C.green,flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:C.text}}>{s.n}</div>
                    <div style={{fontSize:11,color:C.text3}}>{s.cl} · {s.role} · {s.dt}</div>
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0,marginRight:8}}>
                  <div style={{fontSize:13,color:C.green,fontWeight:700}}>+{fN(s.p)} F</div>
                  {s.d>0?<div style={{fontSize:11,color:C.red}}>Dû: {fN(s.d)} F</div>:<div style={{fontSize:11,color:C.green}}>Soldé</div>}
                </div>
                <span style={{fontSize:14,color:C.text3}}>›</span>
              </div>
            ))}
          </div>
          {approvalsPay.length>0&&(
            <div style={{borderTop:`1px solid ${C.border2}`,background:C.white}}>
              <div style={{padding:'10px 20px',fontSize:11,fontWeight:600,color:C.text3,textTransform:'uppercase',letterSpacing:.5,borderBottom:`1px solid ${C.border2}`}}>Paiements Approvals liés ({approvalsPay.length})</div>
              {approvalsPay.map((ap,i)=>{
                const stC=ap.status==='paid'?C.green:ap.status==='rejected'?C.red:C.orange;
                const stL=ap.status==='paid'?'Payé ✓':ap.status==='rejected'?'Rejeté':ap.status==='approved'?'Approuvé':'En attente';
                return (
                  <div key={i} style={{padding:'10px 20px',borderBottom:`1px solid ${C.border2}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:500,marginBottom:2}}>{ap.title||ap.site+' — '+ap.project}</div>
                      <div style={{fontSize:10,color:C.text3}}>
                        {ap.site&&<span>Site: {ap.site} · </span>}
                        {ap.bcPo&&<span style={{fontFamily:'monospace'}}>PO: {ap.bcPo} · </span>}
                        {ap.paymentRef&&<span style={{color:C.green}}>Réf: {ap.paymentRef} · </span>}
                        <span>Soumis: {ap.submittedAt?.slice(0,10)||'—'}</span>
                      </div>
                    </div>
                    <div style={{textAlign:'right',flexShrink:0,marginLeft:12}}>
                      <div style={{fontSize:12,fontWeight:600,marginBottom:3}}>{new Intl.NumberFormat('fr-FR').format(ap.amount||0)} F</div>
                      <span style={{fontSize:10,padding:'2px 7px',borderRadius:20,background:stC+'15',color:stC,fontWeight:600}}>{stL}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
}


// Charger l'historique réel des demandes de paiement Approvals pour un technicien, depuis le backend
async function loadApprovalsPaiements(techName) {
  try {
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_URL || 'https://backend-one-kappa-96.vercel.app';
    const res = await fetch(base + '/approvals', { headers: { 'Authorization': 'Bearer ' + token } });
    const rows = await res.json();
    if (!Array.isArray(rows)) return [];
    return rows
      .filter(r => r.type === 'payment_request' && r.beneficiary_name === techName)
      .map(r => ({ id: r.id, status: r.status, amount: parseFloat(r.amount) || 0 }));
  } catch { return []; }
}

export default function Techniciens() {
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showAddCert, setShowAddCert] = useState(false);
  const [newCert, setNewCert] = useState({n:'',org:'',date:'',expire:'',s:'ok'});

  // Quand on clique sur une cert existante → pré-remplir le formulaire
  React.useEffect(()=>{
    if(showAddCert&&typeof showAddCert==='object'){
      setNewCert({n:showAddCert.n||'',org:showAddCert.org||'',date:showAddCert.date||'',expire:showAddCert.expire||'',s:showAddCert.s||'ok'});
    } else if(showAddCert===true){
      setNewCert({n:'',org:'',date:'',expire:'',s:'ok'});
    }
  },[showAddCert]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/technicians').then(res => {
      setTechs(Array.isArray(res.data) ? res.data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const saveCert = async (techId, certs) => {
    setSaving(true);
    try {
      await api.put('/technicians/'+techId+'/certifications', {certifications: certs});
      setTechs(p=>p.map(t=>t.id===techId?{...t,certs}:t));
      if(selected?.id===techId) setSelected(s=>({...s,certs}));
    } catch(e){}
    setSaving(false);
  };

  const addCertToTech = async (tech) => {
    if(!newCert.n.trim()) return;
    let certs;
    if(showAddCert&&typeof showAddCert==='object'){
      // Mode modification
      certs = (tech.certs||[]).map(c=>c.id===showAddCert.id?{...c,...newCert}:c);
    } else {
      // Mode ajout
      certs = [...(tech.certs||[]), {...newCert, id:'cert-'+Date.now()}];
    }
    await saveCert(tech.id, certs);
    setNewCert({n:'',org:'',date:'',expire:'',s:'ok'});
    setShowAddCert(false);
  };

  const removeCert = async (tech, certId) => {
    const certs = (tech.certs||[]).filter(c=>c.id!==certId);
    await saveCert(tech.id, certs);
  };

  if (selected) return <DetailPage tech={selected} onBack={() => setSelected(null)}
    showAddCert={showAddCert} setShowAddCert={setShowAddCert}
    newCert={newCert} setNewCert={setNewCert}
    addCertToTech={addCertToTech} removeCert={removeCert} saving={saving}/>;

  const expiredCerts = techs.flatMap(t =>
    (t.certs||[]).filter(c => c.s === 'expire' || c.s === 'expire_soon')
      .map(c => ({ tech: t.name, cert: c.n, expire: c.e, soon: c.s === 'expire_soon' }))
  );

  const counts = {
    dispo: techs.filter(t => t.statut === 'Disponible').length,
    mission: techs.filter(t => t.statut === 'En mission').length,
    conge: techs.filter(t => t.statut === 'En congé').length,
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:C.bg }}>
      <div style={{ padding:'14px 24px', borderBottom:`1px solid ${C.border}`, background:C.white, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:15, fontWeight:700, color:C.text }}>Techniciens</span>
          <span style={{ fontSize:12, padding:'2px 10px', borderRadius:20, background:C.bg, color:C.text3, fontWeight:600 }}>{techs.length}</span>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {counts.dispo > 0 && <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:C.green_l, color:C.green, fontWeight:700 }}>{counts.dispo} disponible{counts.dispo > 1 ? 's' : ''}</span>}
          {counts.mission > 0 && <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:C.blue_l, color:C.blue_d, fontWeight:700 }}>{counts.mission} en mission</span>}
          {counts.conge > 0 && <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:C.orange_l, color:C.orange, fontWeight:700 }}>{counts.conge} en congé</span>}
        </div>
      </div>

      {expiredCerts.length > 0 && (
        <div style={{ padding:'10px 24px', background:C.red_l, borderBottom:`1px solid #FCA5A5`, display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span style={{ fontSize:12, color:C.red }}>
            {expiredCerts.map((e, i) => (
              <span key={i}>{i > 0 && ' · '}<strong>{e.tech}</strong> — {e.cert} ({e.soon ? 'expire bientôt' : 'EXPIRÉE'} {e.expire})</span>
            ))}
          </span>
        </div>
      )}

      {loading ? (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:C.text3 }}>Chargement...</div>
      ) : (
        <div style={{ flex:1, overflowY:'auto', padding:'16px 24px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
            {techs.map(t => {
              const ss = SS[t.statut] || SS['Disponible'];
              const hasExpired = (t.certs||[]).some(c => c.s === 'expire');
              return (
                <div key={t.id} onClick={() => setSelected(t)}
                  style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:'16px 14px', cursor:'pointer', textAlign:'center', transition:'border-color .15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.blue}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                  <div style={{ position:'relative', width:52, height:52, margin:'0 auto 10px' }}>
                    <div style={{ width:52, height:52, borderRadius:'50%', background:C.blue_l, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:C.blue_d }}>{t.initials}</div>
                    <div style={{ position:'absolute', bottom:1, right:1, width:13, height:13, borderRadius:'50%', background:ss.dot, border:`2px solid ${C.white}` }}/>
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:3, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                    {t.name}
                    {hasExpired && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>}
                  </div>
                  <div style={{ fontSize:11, color:C.text3, marginBottom:8 }}>{t.role}</div>
                  <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:ss.bg, color:ss.c, fontWeight:700 }}>{t.statut}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
