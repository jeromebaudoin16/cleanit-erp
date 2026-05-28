import { useEffect, useState } from 'react';
import { api } from '../utils/api';

const generateMissionsPDF = (missions, users) => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(0, 102, 204);
  doc.rect(0, 0, 220, 28, 'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(18); doc.setFont('helvetica','bold');
  doc.text('CleanIT ERP', 14, 12);
  doc.setFontSize(11); doc.setFont('helvetica','normal');
  doc.text('Rapport des Missions — ' + new Date().toLocaleDateString('fr-FR'), 14, 21);
  
  // Stats
  doc.setTextColor(0,0,0);
  doc.setFontSize(10);
  const active = missions.filter(m=>m.status==='in_progress').length;
  const done = missions.filter(m=>m.status==='done').length;
  doc.text('Total: '+missions.length+' | En cours: '+active+' | Terminées: '+done, 14, 38);
  
  // Table
  const rows = missions.map(m => {
    const tech = users.find(u=>u.id===m.tech_id);
    return [
      m.code||'—', m.client||'—', m.site_name||m.site||'—',
      tech ? tech.firstName+' '+tech.lastName : '—',
      m.status==='in_progress'?'En cours':m.status==='pending'?'En attente':'Terminé',
      (m.progress||0)+'%', m.deadline||'—'
    ];
  });
  
  doc.autoTable({
    head: [['Code','Client','Site','Technicien','Statut','Avancement','Deadline']],
    body: rows, startY: 44,
    headStyles: { fillColor: [0,102,204], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [240,248,255] },
    columnStyles: { 5: { halign: 'center' } }
  });
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for(let i=1;i<=pageCount;i++){
    doc.setPage(i);
    doc.setFontSize(7); doc.setTextColor(150);
    doc.text('CleanIT ERP — Confidentiel — Page '+i+'/'+pageCount, 14, doc.internal.pageSize.height-8);
    doc.text('Généré le '+new Date().toLocaleString('fr-FR'), 140, doc.internal.pageSize.height-8);
  }
  
  doc.save('cleanit_missions_'+new Date().toISOString().split('T')[0]+'.pdf');
};

const generateUsersPDF = (users) => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFillColor(0,102,204);
  doc.rect(0,0,220,28,'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(18); doc.setFont('helvetica','bold');
  doc.text('CleanIT ERP', 14, 12);
  doc.setFontSize(11); doc.setFont('helvetica','normal');
  doc.text('Rapport des Utilisateurs — '+new Date().toLocaleDateString('fr-FR'), 14, 21);
  doc.setTextColor(0,0,0);
  doc.setFontSize(10);
  doc.text('Total: '+users.length+' utilisateurs actifs', 14, 38);
  const rows = users.map(u=>[
    u.firstName+' '+u.lastName, u.email, u.role,
    u.isActive?'Actif':'Inactif',
    u.lastSeen ? new Date(u.lastSeen).toLocaleDateString('fr-FR') : '—'
  ]);
  doc.autoTable({
    head: [['Nom','Email','Rôle','Statut','Dernière activité']],
    body: rows, startY: 44,
    headStyles: { fillColor: [0,102,204], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [240,248,255] }
  });
  doc.save('cleanit_users_'+new Date().toISOString().split('T')[0]+'.pdf');
};

export default function Reports() {
  const [missions, setMissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Charger jsPDF
    if(!window.jspdf) {
      const s1 = document.createElement('script');
      s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s1.onload = () => {
        const s2 = document.createElement('script');
        s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';
        s2.onload = () => setLoaded(true);
        document.head.appendChild(s2);
      };
      document.head.appendChild(s1);
    } else setLoaded(true);

    Promise.all([api.get('/missions'), api.get('/users')]).then(([ms,us]) => {
      setMissions(Array.isArray(ms.data)?ms.data:[]);
      setUsers(Array.isArray(us.data)?us.data:[]);
    }).catch(()=>{});
  }, []);

  const reports = [
    { id:'missions', title:'Rapport Missions', desc:'Toutes les missions avec techniciens et avancement', icon:'📋', color:'#0066CC',
      action: () => generateMissionsPDF(missions, users) },
    { id:'users', title:'Rapport Équipes', desc:'Liste des employés avec rôles et statuts', icon:'👥', color:'#7C3AED',
      action: () => generateUsersPDF(users) },
    { id:'sla', title:'Rapport SLA', desc:'Conformité aux accords de service par client', icon:'📊', color:'#059669',
      action: () => alert('Disponible après configuration des contrats SLA') },
    { id:'activite', title:'Rapport Activité', desc:'Pointages et présence sur sites', icon:'📍', color:'#EA580C',
      action: () => alert('Disponible - module pointage en cours') },
  ];

  return (
    <div style={{padding:24, fontFamily:"'Inter','Segoe UI',Arial,sans-serif"}}>
      <div style={{marginBottom:24}}>
        <h2 style={{fontSize:20,fontWeight:700,color:'#111',margin:0}}>Rapports & Exports</h2>
        <p style={{fontSize:13,color:'#888',marginTop:4}}>Générez des rapports PDF professionnels</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
        {reports.map(r=>(
          <div key={r.id} style={{background:'white',borderRadius:12,border:'1px solid #eee',
            padding:20,cursor:'pointer',transition:'box-shadow .2s'}}
            onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,.1)'}
            onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}
            onClick={loaded ? r.action : ()=>alert('Chargement en cours...')}>
            <div style={{fontSize:32,marginBottom:12}}>{r.icon}</div>
            <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:6}}>{r.title}</div>
            <div style={{fontSize:12,color:'#888',marginBottom:16}}>{r.desc}</div>
            <button style={{background:r.color,border:'none',borderRadius:8,padding:'8px 16px',
              color:'white',fontSize:12,fontWeight:600,cursor:'pointer',
              display:'flex',alignItems:'center',gap:6}}>
              <span>↓</span> Télécharger PDF
            </button>
          </div>
        ))}
      </div>
      <div style={{marginTop:24,background:'#F8FAFC',borderRadius:12,padding:16,border:'1px solid #E2E8F0'}}>
        <div style={{fontSize:13,fontWeight:600,color:'#374151',marginBottom:8}}>Données disponibles</div>
        <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
          {[['Missions',missions.length],['Utilisateurs',users.length]].map(([l,v])=>(
            <div key={l} style={{fontSize:12,color:'#6B7280'}}>
              <span style={{fontWeight:700,color:'#111'}}>{v}</span> {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
