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

const DI = { pdf:'📄', xlsx:'📊', zip:'🗜️', doc:'📝' };
const fN = n => new Intl.NumberFormat('fr-FR').format(Math.round(n||0));

const SEED = [
  { id:1, initials:'AM', name:'Ali Moussa', role:'Technicien fibre', region:'Douala',
    statut:'Disponible', phone:'655 001 122', email:'ali.moussa@cleanit.cm', missions:12, sites_count:3, debut:'Mars 2022',
    pos:'DLA-001, Bassa — 4.0511N 9.7679E · Hier 17h32',
    certs:[{n:'Travail en hauteur',e:'2024-12-15',s:'expire'},{n:'Habilitation H2B2',e:'2025-08-20',s:'ok'},{n:'Fibre FTTH',e:'2025-11-30',s:'ok'}],
    sites:[
      {n:'DLA-001 Tour MTN Bassa',cl:'MTN',role:'Tech. principal',p:450000,d:0,dt:'Jan 2024',
       resp:{n:'Alain Fouda',r:'Resp. Réseau MTN',t:'679 000 001',em:'a.fouda@mtn.cm'},
       pm:{n:'Marie Kamga',r:'Chef projet CleanIT'},ct:{n:'Thomas Ngono'},per:'15 Jan - 28 Jan 2024',reg:'Bassa, Douala',
       docs:[{n:'Bon de commande MTN-DLA001',t:'pdf',s:'245 Ko',d:'12 Jan 2024'},{n:'Contrat signé',t:'pdf',s:'1.2 Mo',d:'13 Jan 2024'},{n:'PV réception',t:'pdf',s:'380 Ko',d:'28 Jan 2024'},{n:'Photos livraison',t:'zip',s:'8.4 Mo',d:'28 Jan 2024'}]},
      {n:'KRI-001 Station CAMTEL Kribi',cl:'CAMTEL',role:'Tech. senior',p:380000,d:120000,dt:'Nov 2023',
       resp:{n:'Ibrahim Sali',r:'Dir. Technique CAMTEL',t:'677 200 003',em:'i.sali@camtel.cm'},
       pm:{n:'Marie Kamga',r:'Chef projet CleanIT'},ct:{n:'Thomas Ngono'},per:'01 Nov - 22 Nov 2023',reg:'Kribi',
       docs:[{n:'Bon de commande CAMTEL-KRI001',t:'pdf',s:'198 Ko',d:'28 Oct 2023'},{n:'Contrat prestation',t:'pdf',s:'980 Ko',d:'30 Oct 2023'},{n:'PV réception partiel',t:'pdf',s:'290 Ko',d:'22 Nov 2023'}]},
      {n:'DLA-002 Pylône Orange Akwa',cl:'Orange',role:'Tech. fibre',p:290000,d:0,dt:'Fév 2024',
       resp:{n:'Claude Mvondo',r:'Chef projet Orange',t:'699 300 002',em:'c.mvondo@orange.cm'},
       pm:{n:'Pierre Etoga',r:'Chef projet CleanIT'},ct:{n:'Pierre Etoga'},per:'10 Fév - 18 Fév 2024',reg:'Akwa, Douala',
       docs:[{n:'Bon de commande Orange-DLA002',t:'pdf',s:'167 Ko',d:'08 Fév 2024'},{n:'Rapport technique',t:'pdf',s:'440 Ko',d:'18 Fév 2024'}]},
    ],
    feed:[
      {ty:'photo',dt:'Aujourd\'hui 08:32',li:'DLA-001, Bassa — 4.0511N 9.7679E',tx:'Arrivée sur site — photos état initial',ph:3},
      {ty:'msg',dt:'Hier 16:45',canal:'#DLA-001',tx:'Câbles posés au secteur Nord. En attente validation chef terrain.'},
      {ty:'photo',dt:'Hier 09:10',li:'DLA-001, Bassa — 4.0511N 9.7679E',tx:'Installation antenne secteur Nord phase 2',ph:2},
      {ty:'inter',dt:'12 mai 2025',tx:'Intervention terminée — DLA-001 phase 2',det:'Durée: 6h · Statut: Complet'},
      {ty:'msg',dt:'11 mai 11:20',canal:'#general',tx:'Disponible demain matin pour renfort si besoin.'},
      {ty:'checkin',dt:'10 mai 07:58',li:'DLA-002, Akwa — 4.0478N 9.6952E',tx:'Pointage arrivée sur site'},
    ]},
  { id:2, initials:'JM', name:'Jean Mbarga', role:'Électricien', region:'Douala',
    statut:'En mission', phone:'677 334 455', email:'jean.mbarga@cleanit.cm', missions:8, sites_count:2, debut:'Juin 2023',
    pos:'GRA-001, Garoua — 9.3013N 13.3924E · Aujourd\'hui 09h15',
    certs:[{n:'Habilitation H2B2',e:'2025-03-10',s:'expire_soon'},{n:'CACES R386',e:'2026-01-15',s:'ok'}],
    sites:[
      {n:'DLA-001 Tour MTN Bassa',cl:'MTN',role:'Électricien',p:320000,d:80000,dt:'Jan 2024',
       resp:{n:'Alain Fouda',r:'Resp. Réseau MTN',t:'679 000 001',em:'a.fouda@mtn.cm'},
       pm:{n:'Marie Kamga',r:'Chef projet CleanIT'},ct:{n:'Thomas Ngono'},per:'15 Jan - 28 Jan 2024',reg:'Bassa, Douala',
       docs:[{n:'Bon de commande MTN-DLA001',t:'pdf',s:'245 Ko',d:'12 Jan 2024'},{n:'PV réception',t:'pdf',s:'380 Ko',d:'28 Jan 2024'}]},
      {n:'GRA-001 Tour MTN Garoua',cl:'MTN',role:'Électricien',p:410000,d:0,dt:'Déc 2023',
       resp:{n:'Alain Fouda',r:'Resp. Réseau MTN',t:'679 000 001',em:'a.fouda@mtn.cm'},
       pm:{n:'Pierre Etoga',r:'Chef projet CleanIT'},ct:{n:'Pierre Etoga'},per:'01 Déc - 20 Déc 2023',reg:'Garoua Nord',
       docs:[{n:'Bon de commande MTN-GRA001',t:'pdf',s:'211 Ko',d:'28 Nov 2023'},{n:'Rapport intervention',t:'pdf',s:'410 Ko',d:'20 Déc 2023'}]},
    ],
    feed:[
      {ty:'checkin',dt:'Aujourd\'hui 07:45',li:'GRA-001, Garoua — 9.3013N 13.3924E',tx:'Pointage arrivée sur site'},
      {ty:'msg',dt:'Hier 18:00',canal:'#GRA-001',tx:'Coupure secteur détectée. Reprise travaux demain 6h.'},
      {ty:'photo',dt:'Hier 14:20',li:'GRA-001, Garoua — 9.3013N 13.3924E',tx:'État câblage avant intervention',ph:2},
      {ty:'inter',dt:'13 mai 2025',tx:'Remplacement transformateur — en cours',det:'Durée estimée: 2 jours · En cours'},
    ]},
  { id:3, initials:'SD', name:'Samuel Djomo', role:'Chef équipe', region:'Yaoundé',
    statut:'Disponible', phone:'699 887 766', email:'samuel.djomo@cleanit.cm', missions:15, sites_count:2, debut:'Jan 2022',
    pos:'Siège CleanIT, Yaoundé — 3.8667N 11.5167E · Aujourd\'hui 08h00',
    certs:[{n:'Management chantier',e:'2026-06-01',s:'ok'},{n:'Travail en hauteur',e:'2025-07-30',s:'ok'},{n:'Habilitation électrique',e:'2025-02-28',s:'expire'}],
    sites:[
      {n:'YDE-001 Pylône Orange Essos',cl:'Orange',role:'Chef équipe',p:550000,d:0,dt:'Mar 2024',
       resp:{n:'Claude Mvondo',r:'Chef projet Orange',t:'699 300 002',em:'c.mvondo@orange.cm'},
       pm:{n:'Marie Kamga',r:'Chef projet CleanIT'},ct:{n:'Samuel Djomo'},per:'01 Mar - 25 Mar 2024',reg:'Essos, Yaoundé',
       docs:[{n:'Bon de commande Orange-YDE001',t:'pdf',s:'178 Ko',d:'27 Fév 2024'},{n:'PV livraison final',t:'pdf',s:'310 Ko',d:'25 Mar 2024'}]},
      {n:'KRI-001 Station CAMTEL Kribi',cl:'CAMTEL',role:'Chef équipe',p:620000,d:0,dt:'Nov 2022',
       resp:{n:'Ibrahim Sali',r:'Dir. Technique CAMTEL',t:'677 200 003',em:'i.sali@camtel.cm'},
       pm:{n:'Marie Kamga',r:'Chef projet CleanIT'},ct:{n:'Samuel Djomo'},per:'01 Nov - 30 Nov 2022',reg:'Kribi',
       docs:[{n:'Bon de commande CAMTEL-KRI001',t:'pdf',s:'195 Ko',d:'28 Oct 2022'},{n:'Rapport final',t:'pdf',s:'520 Ko',d:'30 Nov 2022'}]},
    ],
    feed:[
      {ty:'msg',dt:'Aujourd\'hui 09:00',canal:'#general',tx:'Disponible cette semaine pour nouvelles missions.'},
      {ty:'inter',dt:'8 mai 2025',tx:'Mission YDE-001 terminée et validée',det:'Durée: 14 jours · Livraison acceptée'},
      {ty:'photo',dt:'7 mai 16:30',li:'YDE-001, Essos — 3.848N 11.502E',tx:'Photos finales livraison site',ph:3},
      {ty:'msg',dt:'6 mai 11:00',canal:'#YDE-001',tx:'Dernier câble raccordé. Test signal en cours.'},
    ]},
  { id:4, initials:'PE', name:'Pierre Etoga', role:'Chef terrain', region:'Douala',
    statut:'Disponible', phone:'677 112 233', email:'pierre.etoga@cleanit.cm', missions:20, sites_count:3, debut:'Sep 2021',
    pos:'Siège CleanIT, Douala — 4.0511N 9.7679E · Aujourd\'hui 07h30',
    certs:[{n:'Chef chantier télécom',e:'2026-03-15',s:'ok'},{n:'CACES R482',e:'2025-09-20',s:'ok'},{n:'Travail en hauteur',e:'2025-12-10',s:'ok'}],
    sites:[
      {n:'GRA-001 Tour MTN Garoua',cl:'MTN',role:'Chef terrain',p:780000,d:200000,dt:'Déc 2023',
       resp:{n:'Alain Fouda',r:'Resp. Réseau MTN',t:'679 000 001',em:'a.fouda@mtn.cm'},
       pm:{n:'Pierre Etoga',r:'Chef projet CleanIT'},ct:{n:'Pierre Etoga'},per:'01 Déc - 20 Déc 2023',reg:'Garoua Nord',
       docs:[{n:'Bon de commande MTN-GRA001',t:'pdf',s:'211 Ko',d:'28 Nov 2023'},{n:'Contrat',t:'pdf',s:'870 Ko',d:'29 Nov 2023'}]},
      {n:'DLA-002 Pylône Orange Akwa',cl:'Orange',role:'Chef terrain',p:450000,d:0,dt:'Fév 2024',
       resp:{n:'Claude Mvondo',r:'Chef projet Orange',t:'699 300 002',em:'c.mvondo@orange.cm'},
       pm:{n:'Pierre Etoga',r:'Chef projet CleanIT'},ct:{n:'Pierre Etoga'},per:'10 Fév - 18 Fév 2024',reg:'Akwa, Douala',
       docs:[{n:'Bon de commande',t:'pdf',s:'167 Ko',d:'08 Fév 2024'},{n:'Rapport final',t:'pdf',s:'440 Ko',d:'18 Fév 2024'}]},
    ],
    feed:[
      {ty:'msg',dt:'Hier 14:30',canal:'#chefs-terrain',tx:'Planning semaine 21 confirmé. Départ BAF-001 lundi 06h.'},
      {ty:'checkin',dt:'12 mai 08:00',li:'BAF-001, Bafoussam — 5.4734N 10.4178E',tx:'Inspection pré-chantier BAF-001'},
      {ty:'photo',dt:'10 mai 09:45',li:'BAF-001, Bafoussam — 5.4734N 10.4178E',tx:'État initial du site avant travaux',ph:3},
      {ty:'msg',dt:'9 mai 17:00',canal:'#general',tx:'Rapport journalier envoyé. Avancement conforme.'},
    ]},
];

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

function DetailPage({ tech, onBack }) {
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
              <button style={{fontSize:12,padding:'6px 16px',borderRadius:20,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit',color:C.text2,fontWeight:500}}>📞 Appeler</button>
              <button style={{fontSize:12,padding:'6px 16px',borderRadius:20,border:`1px solid ${C.border}`,background:'none',cursor:'pointer',fontFamily:'inherit',color:C.text2,fontWeight:500}}>💬 WhatsApp</button>
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
                    <div style={{fontSize:11,color:C.text3}}>📍 {f.li}</div>
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
                    <div style={{fontSize:13,color:C.text}}>📍 {f.tx}</div>
                    <div style={{fontSize:11,color:C.text3,marginTop:2}}>🗺️ {f.li}</div>
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
                    <div style={{fontSize:11,color:C.text3,marginTop:3}}>📅 {f.dt}</div>
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

        {tab==='certs' && (
          <div style={{background:C.white}}>
            <div style={{padding:'12px 20px 4px',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:.8,color:C.text3}}>Certifications & habilitations</div>
            {(tech.certs||[]).map((cert,i)=>{
              const [bg,col,label] = CS[cert.s]||CS.ok;
              return (
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 20px',borderBottom:`1px solid ${C.border2}`}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:C.text}}>{cert.n}</div>
                    <div style={{fontSize:11,color:C.text3}}>Expire le {cert.e}</div>
                  </div>
                  <span style={{fontSize:11,padding:'3px 10px',borderRadius:20,background:bg,color:col,fontWeight:700}}>{label}</span>
                </div>
              );
            })}
          </div>
        )}

        {tab==='sites' && (()=>{
          const approvalsPay = loadApprovalsPaiements(tech.name);
          const {paid: aPaid, pending: aPending} = calcFromApprovals(approvalsPay);
          const totalPercu = tp + aPaid;
          const totalDu = td + aPending;
          return (
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
          </div>
          );
        })()}
      </div>
    </div>
  );
}


// Charger les paiements Approvals pour un technicien depuis localStorage
function loadApprovalsPaiements(techName) {
  try {
    const stored = localStorage.getItem('cleanit_approvals_cache');
    if (!stored) return [];
    const items = JSON.parse(stored);
    return items.filter(i => i.type === 'payment_request' && i.beneficiaryName === techName);
  } catch { return []; }
}
function calcFromApprovals(items) {
  const paid = items.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount || 0), 0);
  const pending = items.filter(i => ['pending','approved'].includes(i.status)).reduce((s, i) => s + (i.amount || 0), 0);
  return { paid, pending };
}

export default function Techniciens() {
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadTechs(); }, []);

  const loadTechs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/technicians');
      setTechs(res.data && res.data.length > 0 ? res.data : SEED);
    } catch { setTechs(SEED); }
    setLoading(false);
  };

  if (selected) return <DetailPage tech={selected} onBack={() => setSelected(null)} />;

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
          <span style={{ fontSize:14 }}>⚠️</span>
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
                    {hasExpired && <span style={{ fontSize:13 }}>⚠️</span>}
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
