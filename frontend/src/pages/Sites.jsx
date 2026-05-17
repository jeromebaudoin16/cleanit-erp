import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const C = {
  blue:'#185FA5', blue_l:'#E6F1FB',
  green:'#3B6D11', green_l:'#EAF3DE',
  orange:'#854F0B', orange_l:'#FAEEDA',
  gray:'#6B7280', gray_l:'#F9FAFB',
  border:'#E5E7EB', border2:'#F3F4F6',
  text:'#111827', text2:'#374151', text3:'#6B7280',
  white:'#FFFFFF', bg:'#F9FAFB',
};

const SS = {
  'En cours':  { bg:'#E6F1FB', c:'#185FA5' },
  'En attente':{ bg:'#FAEEDA', c:'#854F0B' },
  'Termine':   { bg:'#EAF3DE', c:'#3B6D11' },
};

function activityDot(days){ if(days<=7) return '#3B6D11'; if(days<=20) return '#BA7517'; return '#A32D2D'; }

const Ic = ({d,s=16,c='currentColor'}) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);

const Badge = ({statut}) => {
  const ss = SS[statut]||{bg:C.gray_l,c:C.gray};
  return <span style={{fontSize:11,padding:'3px 10px',borderRadius:20,background:ss.bg,color:ss.c,fontWeight:600}}>{statut==='Termine'?'Termine':statut}</span>;
};

const SEED = [
  {id:1,name:'DLA-001 Tour MTN Bassa',client:'MTN Cameroun',region:'Douala',statut:'En cours',lastActivity:3,chefProjet:'Marie Kamga',respClient:'Alain Fouda (MTN)',chefTerrain:'Thomas Ngono',lat:4.0511,lng:9.7679,techs:[{n:'Ali Moussa',r:'Technicien fibre'},{n:'Jean Mbarga',r:'Electricien'}],materiels:[{nom:'Antennes 4G Huawei',qte:4,unite:'unites'},{nom:'Cables coaxiaux RG8',qte:120,unite:'m'},{nom:'Onduleur 5KVA',qte:1,unite:'unite'}],history:[{date:'2024-01-15',desc:'Maintenance preventive'},{date:'2023-06-10',desc:'Installation antennes 4G'},{date:'2022-11-03',desc:'Deploiement initial'}]},
  {id:2,name:'YDE-001 Pylone Orange Essos',client:'Orange Cameroun',region:'Yaounde',statut:'En attente',lastActivity:20,chefProjet:'Pierre Etoga',respClient:'Claude Mvondo (Orange)',chefTerrain:'Pierre Etoga',lat:3.8480,lng:11.5021,techs:[{n:'Samuel Djomo',r:'Chef equipe'}],materiels:[{nom:'Cables fibre G657',qte:500,unite:'m'},{nom:'Boitiers jonction',qte:8,unite:'unites'}],history:[]},
  {id:3,name:'KRI-001 Station CAMTEL Kribi',client:'CAMTEL',region:'Kribi',statut:'Termine',lastActivity:45,chefProjet:'Marie Kamga',respClient:'Ibrahim Sali (CAMTEL)',chefTerrain:'Thomas Ngono',lat:2.9395,lng:9.9062,techs:[{n:'Ali Moussa',r:'Technicien senior'},{n:'Samuel Djomo',r:'Technicien'}],materiels:[{nom:'Equipements Cisco',qte:3,unite:'unites'},{nom:'Cables fibre SM',qte:2000,unite:'m'}],history:[{date:'2024-03-20',desc:'Remplacement equipements'},{date:'2023-08-14',desc:'Extension reseau'},{date:'2022-11-01',desc:'Deploiement fibre'}]},
  {id:4,name:'GRA-001 Tour MTN Garoua',client:'MTN Cameroun',region:'Garoua',statut:'En cours',lastActivity:1,chefProjet:'Pierre Etoga',respClient:'Alain Fouda (MTN)',chefTerrain:'Pierre Etoga',lat:9.3013,lng:13.3924,techs:[{n:'Jean Mbarga',r:'Technicien'}],materiels:[{nom:'Antennes directionnelles',qte:6,unite:'unites'},{nom:'Cables alimentation',qte:80,unite:'m'}],history:[{date:'2023-12-05',desc:'Installation initiale'}]},
  {id:5,name:'DLA-002 Pylone Orange Akwa',client:'Orange Cameroun',region:'Douala',statut:'En cours',lastActivity:8,chefProjet:'Marie Kamga',respClient:'Claude Mvondo (Orange)',chefTerrain:'Thomas Ngono',lat:4.0478,lng:9.6952,techs:[{n:'Ali Moussa',r:'Technicien fibre'}],materiels:[{nom:'Cables ADSS',qte:300,unite:'m'},{nom:'Pinces ancrage',qte:12,unite:'unites'}],history:[{date:'2024-02-18',desc:'Maintenance corrective'}]},
  {id:6,name:'BAF-001 Station CAMTEL Bafoussam',client:'CAMTEL',region:'Bafoussam',statut:'En attente',lastActivity:35,chefProjet:'Pierre Etoga',respClient:'Ibrahim Sali (CAMTEL)',chefTerrain:'',lat:5.4734,lng:10.4178,techs:[],materiels:[],history:[]},
];

const TABS = [
  {id:'infos',   label:'Informations', icon:'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'},
  {id:'techs',   label:'Techniciens',  icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0'},
  {id:'mats',    label:'Materiels',    icon:'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10'},
  {id:'history', label:'Historique',   icon:'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'},
];

function DetailPage({site, onBack}){
  const [tab, setTab] = useState('infos');
  const isEnCours = site.statut==='En cours';
  const openMap = () => window.open("https://www.openstreetmap.org/?mlat="+site.lat+"&mlon="+site.lng+"#map=17/"+site.lat+"/"+site.lng,'_blank');
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
      <div style={{padding:'12px 24px',borderBottom:'1px solid '+C.border,background:C.white,display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
        <button onClick={onBack} style={{padding:'5px 14px',borderRadius:6,border:'1px solid '+C.border,background:'none',cursor:'pointer',fontSize:12,color:C.text3,fontFamily:'inherit'}}>
          Retour Sites
        </button>
        <span style={{fontSize:15,fontWeight:700,color:C.text}}>{site.name}</span>
        <Badge statut={site.statut}/>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={openMap} style={{padding:'6px 14px',borderRadius:6,border:'1px solid '+C.border,background:'none',cursor:'pointer',fontSize:12,color:C.text2,fontFamily:'inherit'}}>
            Ouvrir carte
          </button>
          <button disabled={!isEnCours} style={{padding:'6px 14px',borderRadius:6,border:'none',background:isEnCours?C.blue_l:'#F3F4F6',cursor:isEnCours?'pointer':'not-allowed',fontSize:12,color:isEnCours?C.blue:C.text3,fontFamily:'inherit',fontWeight:600,opacity:isEnCours?1:.6}}>
            {isEnCours?'Configurer geofencing':'Geofencing '+(site.statut==='Termine'?'- site termine':'- en attente')}
          </button>
        </div>
      </div>
      <div style={{display:'flex',borderBottom:'1px solid '+C.border,background:C.white,padding:'0 24px',flexShrink:0}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'11px 18px',border:'none',background:'none',cursor:'pointer',fontSize:13,fontFamily:'inherit',display:'flex',alignItems:'center',gap:6,color:tab===t.id?C.blue:C.text3,fontWeight:tab===t.id?700:400,borderBottom:tab===t.id?'2px solid '+C.blue:'2px solid transparent',marginBottom:-1}}>
            <Ic d={t.icon} s={14} c={tab===t.id?C.blue:C.text3}/>{t.label}
          </button>
        ))}
      </div>
      <div style={{flex:1,padding:'28px 32px',overflowY:'auto',background:C.bg}}>
        {tab==='infos'&&(
          <div style={{maxWidth:500}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:.8,color:C.text3,marginBottom:16}}>Informations du site</div>
            {[['Client',site.client],['Region',site.region],['Statut',site.statut==='Termine'?'Termine':site.statut],['Chef de projet CleanIT',site.chefProjet],['Responsable client',site.respClient],['Chef terrain',site.chefTerrain||'—'],['Coordonnees GPS',Number(site.lat).toFixed(4)+'N, '+Number(site.lng).toFixed(4)+'E']].map(([l,v])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid '+C.border2,fontSize:13}}>
                <span style={{color:C.text3}}>{l}</span>
                <span style={{fontWeight:600,color:C.text}}>{v||'—'}</span>
              </div>
            ))}
          </div>
        )}
        {tab==='techs'&&(
          <div style={{maxWidth:500}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:.8,color:C.text3,marginBottom:16}}>Techniciens assignes</div>
            {!(site.techs&&site.techs.length)?<p style={{color:C.text3,fontSize:13,fontStyle:'italic'}}>Aucun technicien assigne</p>
            :(site.techs||[]).map((t,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid '+C.border2}}>
                <div style={{width:34,height:34,borderRadius:'50%',background:C.blue_l,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:C.blue,flexShrink:0}}>
                  {(t.n||t.name||'?').split(' ').map(w=>w[0]).join('')}
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:C.text}}>{t.n||t.name}</div>
                  <div style={{fontSize:11,color:C.text3}}>{t.r||t.role||'—'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab==='mats'&&(
          <div>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:.8,color:C.text3,marginBottom:16}}>Materiels du site</div>
            {!(site.materiels&&site.materiels.length)?<p style={{color:C.text3,fontSize:13,fontStyle:'italic'}}>Aucun materiel renseigne</p>
            :<table style={{width:'100%',maxWidth:520,borderCollapse:'collapse'}}>
              <thead><tr style={{borderBottom:'1px solid '+C.border}}>
                <th style={{textAlign:'left',padding:'8px 0',fontSize:11,color:C.text3,fontWeight:700,textTransform:'uppercase',letterSpacing:.5}}>Materiel</th>
                <th style={{textAlign:'right',padding:'8px 0',fontSize:11,color:C.text3,fontWeight:700,textTransform:'uppercase',letterSpacing:.5}}>Quantite</th>
              </tr></thead>
              <tbody>{(site.materiels||[]).map((m,i)=>(
                <tr key={i} style={{borderBottom:'1px solid '+C.border2}}>
                  <td style={{padding:'10px 0',fontSize:13,color:C.text}}>{m.nom||m.name}</td>
                  <td style={{padding:'10px 0',fontSize:13,textAlign:'right',color:C.text3}}>{m.qte||m.quantity} {m.unite||m.unit||''}</td>
                </tr>
              ))}</tbody>
            </table>}
          </div>
        )}
        {tab==='history'&&(
          <div style={{maxWidth:520}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:.8,color:C.text3,marginBottom:16}}>Historique des interventions</div>
            {!(site.history&&site.history.length)?<p style={{color:C.text3,fontSize:13,fontStyle:'italic'}}>Premier travail sur ce site — aucun historique</p>
            :(site.history||[]).map((h,i)=>(
              <div key={i} style={{display:'flex',gap:12,paddingBottom:16,position:'relative'}}>
                {i<site.history.length-1&&<div style={{position:'absolute',left:'3.5px',top:13,bottom:0,width:1,background:C.border}}/>}
                <div style={{width:8,height:8,borderRadius:'50%',background:C.blue,marginTop:5,flexShrink:0}}/>
                <div>
                  <div style={{fontSize:11,color:C.text3,marginBottom:3}}>{h.date}</div>
                  <div style={{fontSize:13,color:C.text}}>{h.desc||h.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Sites(){
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tous');
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState(null);

  useEffect(()=>{ loadSites(); },[]);

  const loadSites = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sites');
      if(res.data&&res.data.length>0){
        setSites(res.data);
      } else {
        setSites(SEED);
      }
    } catch { setSites(SEED); }
    setLoading(false);
  };

  const filtered = sites.filter(s=>{
    const matchF = filterStatus==='Tous'||s.statut===filterStatus;
    const q = search.toLowerCase();
    const matchQ = !q||s.name.toLowerCase().includes(q)||(s.client||'').toLowerCase().includes(q)||(s.region||'').toLowerCase().includes(q);
    return matchF&&matchQ;
  });

  if(selected) return <DetailPage site={selected} onBack={()=>setSelected(null)}/>;

  const FILTERS = ['Tous','En cours','En attente','Termine'];
  const KANBAN_COLS = ['En attente','En cours','Termine'];

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:C.bg}}>
      <div style={{padding:'14px 24px',borderBottom:'1px solid '+C.border,background:C.white,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:15,fontWeight:700,color:C.text}}>Sites</span>
          <span style={{fontSize:12,padding:'2px 10px',borderRadius:20,background:C.bg,color:C.text3,fontWeight:600}}>{filtered.length} site{filtered.length!==1?'s':''}</span>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." style={{fontSize:12,padding:'6px 12px',borderRadius:8,border:'1px solid '+C.border,background:C.bg,width:180,fontFamily:'inherit',outline:'none',color:C.text}}/>
          <div style={{display:'flex',gap:4}}>
            {FILTERS.map(f=>(
              <button key={f} onClick={()=>setFilterStatus(f)} style={{fontSize:12,padding:'5px 12px',borderRadius:20,border:'1px solid '+(filterStatus===f?C.blue:C.border),background:filterStatus===f?C.blue_l:'none',cursor:'pointer',color:filterStatus===f?C.blue:C.text3,fontFamily:'inherit',fontWeight:filterStatus===f?600:400}}>
                {f==='Termine'?'Termine':f}
              </button>
            ))}
          </div>
          <div style={{display:'flex',border:'1px solid '+C.border,borderRadius:8,overflow:'hidden'}}>
            <button onClick={()=>setView('list')} style={{padding:'6px 10px',border:'none',background:view==='list'?C.bg:'none',cursor:'pointer',borderRight:'1px solid '+C.border,fontSize:12,color:view==='list'?C.blue:C.text3,fontFamily:'inherit'}}>Liste</button>
            <button onClick={()=>setView('kanban')} style={{padding:'6px 10px',border:'none',background:view==='kanban'?C.bg:'none',cursor:'pointer',fontSize:12,color:view==='kanban'?C.blue:C.text3,fontFamily:'inherit'}}>Kanban</button>
          </div>
        </div>
      </div>

      {loading?(
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:C.text3,fontSize:14}}>Chargement des sites...</div>
      ):view==='list'?(
        <div style={{flex:1,overflowY:'auto',padding:'0 24px'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'1px solid '+C.border}}>
                <th style={{textAlign:'left',padding:'10px 0',fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:.5}}>Nom du site</th>
                <th style={{textAlign:'left',padding:'10px 0',fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:.5,width:140}}>Region</th>
                <th style={{textAlign:'left',padding:'10px 0',fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:.5,width:120}}>Statut</th>
                <th style={{width:120}}/>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s=>{
                const dot=activityDot(s.lastActivity||15);
                return (
                  <tr key={s.id} style={{borderBottom:'1px solid '+C.border2,cursor:'pointer'}}
                    onMouseEnter={e=>{e.currentTarget.style.background=C.bg;e.currentTarget.querySelector('[data-act]').style.display='flex';}}
                    onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.querySelector('[data-act]').style.display='none';}}
                    onClick={()=>setSelected(s)}>
                    <td style={{padding:'12px 0'}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:4,height:34,borderRadius:2,background:dot,flexShrink:0}}/>
                        <span style={{fontSize:13,fontWeight:600,color:C.text}}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{padding:'12px 0',fontSize:13,color:C.text3}}>{s.region}</td>
                    <td style={{padding:'12px 0'}}><Badge statut={s.statut}/></td>
                    <td style={{padding:'12px 0'}}>
                      <div data-act style={{display:'none',gap:4}}>
                        <button onClick={e=>{e.stopPropagation();window.open("https://www.openstreetmap.org/?mlat="+s.lat+"&mlon="+s.lng+"#map=17/"+s.lat+"/"+s.lng,'_blank');}}
                          style={{padding:'4px 8px',borderRadius:5,border:'1px solid '+C.border,background:C.white,cursor:'pointer',fontSize:11,color:C.text3,fontFamily:'inherit'}}>Carte</button>
                        <button onClick={e=>{e.stopPropagation();setSelected(s);}}
                          style={{padding:'4px 8px',borderRadius:5,border:'1px solid '+C.border,background:C.white,cursor:'pointer',fontSize:11,color:C.text2,fontFamily:'inherit',fontWeight:600}}>Ouvrir</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length===0&&<tr><td colSpan={4} style={{textAlign:'center',padding:40,color:C.text3,fontSize:13,fontStyle:'italic'}}>Aucun site trouve</td></tr>}
            </tbody>
          </table>
        </div>
      ):(
        <div style={{flex:1,overflowY:'auto',padding:20,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
          {KANBAN_COLS.map(col=>{
            const ss=SS[col]||{bg:C.bg,c:C.text3};
            const colSites=filtered.filter(s=>s.statut===col);
            return (
              <div key={col}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                  <span style={{fontSize:12,fontWeight:700,padding:'3px 10px',borderRadius:20,background:ss.bg,color:ss.c}}>{col==='Termine'?'Termine':col}</span>
                  <span style={{fontSize:11,color:C.text3}}>{colSites.length}</span>
                </div>
                {colSites.map(s=>{
                  const dot=activityDot(s.lastActivity||15);
                  return (
                    <div key={s.id} onClick={()=>setSelected(s)}
                      style={{padding:'10px 12px',borderRadius:8,border:'1px solid '+C.border,background:C.white,marginBottom:8,cursor:'pointer'}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor=C.blue}
                      onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
                      <div style={{display:'flex',gap:8,marginBottom:4}}>
                        <div style={{width:3,height:40,borderRadius:2,background:dot,flexShrink:0}}/>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,color:C.text,lineHeight:1.3,marginBottom:2}}>{s.name}</div>
                          <div style={{fontSize:11,color:C.text3}}>{s.client}</div>
                        </div>
                      </div>
                      {s.chefTerrain&&<div style={{fontSize:11,color:C.text3,marginTop:4}}>Chef terrain: {s.chefTerrain}</div>}
                    </div>
                  );
                })}
                {colSites.length===0&&<div style={{fontSize:12,color:C.text3,fontStyle:'italic',textAlign:'center',padding:'20px 0'}}>Aucun site</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
