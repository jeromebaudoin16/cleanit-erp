import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const TYPE_FACTURE = { facture:'#0078d4', devis:'#7c3aed', avoir:'#ea580c', bon_commande:'#16a34a' };
const STATUS_F = { brouillon:{label:'Brouillon',color:'#94a3b8',bg:'#f8fafc'}, en_attente:{label:'En attente',color:'#f59e0b',bg:'#fefce8'}, paye:{label:'Payée',color:'#16a34a',bg:'#f0fdf4'}, en_retard:{label:'En retard',color:'#dc2626',bg:'#fef2f2'}, annule:{label:'Annulée',color:'#64748b',bg:'#f8fafc'} };

const SEED_FACTURES = [
  { id:1, numero:'FAC-2024-001', client:'MTN Cameroun', type:'facture', montantHT:15000000, tva:2887500, montantTTC:17887500, status:'paye', dateFacture:'2024-01-15', dateEcheance:'2024-02-15', description:'Installation 5G — Sites Douala Phase 1', po:'PO-2024-001' },
  { id:2, numero:'FAC-2024-002', client:'Orange Cameroun', type:'facture', montantHT:8500000, tva:1636250, montantTTC:10136250, status:'en_attente', dateFacture:'2024-02-01', dateEcheance:'2024-03-01', description:'Maintenance préventive Q1 2024', po:'PO-2024-002' },
  { id:3, numero:'DEV-2024-001', client:'Camtel', type:'devis', montantHT:25000000, tva:4812500, montantTTC:29812500, status:'brouillon', dateFacture:'2024-02-10', dateEcheance:'2024-03-10', description:'Déploiement 4G Nord Cameroun', po:'' },
  { id:4, numero:'FAC-2024-003', client:'Nexttel', type:'facture', montantHT:6000000, tva:1155000, montantTTC:7155000, status:'en_retard', dateFacture:'2024-01-01', dateEcheance:'2024-02-01', description:'Survey et préparation sites Yaoundé', po:'PO-2024-003' },
  { id:5, numero:'FAC-2024-004', client:'Huawei Technologies', type:'facture', montantHT:45000000, tva:8662500, montantTTC:53662500, status:'paye', dateFacture:'2024-03-01', dateEcheance:'2024-04-01', description:'Équipements OEM — PO-2024-001', po:'PO-2024-001' },
];

const SEED_DEPENSES = [
  { id:1, titre:'Carburant équipes terrain', categorie:'Transport', montant:850000, date:'2024-01-10', statut:'valide', technicien:'Thomas Ngono' },
  { id:2, titre:'Hébergement mission Garoua', categorie:'Hébergement', montant:320000, date:'2024-01-20', statut:'valide', technicien:'Ali Moussa' },
  { id:3, titre:'Matériel consommable câblage', categorie:'Matériel', montant:1200000, date:'2024-02-05', statut:'en_attente', technicien:'Samuel Djomo' },
  { id:4, titre:'Per diem techniciens déplacement', categorie:'Per diem', montant:650000, date:'2024-02-15', statut:'valide', technicien:'Équipe Douala' },
];

export default function Finance() {
  const [factures, setFactures] = useState([]);
  const [depenses, setDepenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showForm, setShowForm] = useState(null);
  const [form, setForm] = useState({ numero:'', client:'', type:'facture', montantHT:'', description:'', dateFacture:'', dateEcheance:'', po:'' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [f, d] = await Promise.all([api.get('/finance'), api.get('/finance')]);
      setFactures(SEED_FACTURES); setDepenses(SEED_DEPENSES);
    } catch { setFactures(SEED_FACTURES); setDepenses(SEED_DEPENSES); }
    finally { setLoading(false); }
  };

  const save = async () => {
    setSaving(true);
    const tva = Number(form.montantHT) * 0.1925;
    const montantTTC = Number(form.montantHT) + tva;
    try { await api.post('/finance', { ...form, montantHT:Number(form.montantHT), tva, montantTTC, status:'brouillon' }); }
    catch { setFactures(p => [...p, { ...form, id:Date.now(), montantHT:Number(form.montantHT), tva, montantTTC, status:'brouillon' }]); }
    finally { setSaving(false); setShowForm(null); }
  };

  const fmtN = n => n ? new Intl.NumberFormat('fr-FR').format(Math.round(n)) : '0';
  const fmtD = d => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

  const totalFacture = factures.filter(f=>f.status==='paye').reduce((s,f)=>s+f.montantTTC,0);
  const totalAttente = factures.filter(f=>f.status==='en_attente').reduce((s,f)=>s+f.montantTTC,0);
  const totalRetard  = factures.filter(f=>f.status==='en_retard').reduce((s,f)=>s+f.montantTTC,0);
  const totalDepenses = depenses.reduce((s,d)=>s+d.montant,0);
  const benefice = totalFacture - totalDepenses;

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:12}}><div style={{width:40,height:40,borderRadius:'50%',border:'3px solid #16a34a',borderTopColor:'transparent',animation:'spin 1s linear infinite'}} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><span style={{color:'#64748b'}}>Chargement finance...</span></div>;

  return (
    <div style={{padding:24,background:'#f0f2f5',minHeight:'100%'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:'#1e293b',margin:0}}>Finance & Comptabilité</h1>
          <p style={{color:'#64748b',fontSize:13,margin:'4px 0 0'}}>Facturation, dépenses et suivi financier</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>setShowForm('facture')} style={{padding:'9px 16px',borderRadius:8,border:'none',background:'#0078d4',color:'white',fontSize:13,fontWeight:600,cursor:'pointer'}}>+ Facture</button>
          <button onClick={()=>setShowForm('depense')} style={{padding:'9px 16px',borderRadius:8,border:'none',background:'#ea580c',color:'white',fontSize:13,fontWeight:600,cursor:'pointer'}}>+ Dépense</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',borderBottom:'2px solid #e2e8f0',marginBottom:20}}>
        {[{v:'dashboard',l:'Dashboard'},{v:'factures',l:'Factures'},{v:'depenses',l:'Dépenses'}].map(t=>(
          <button key={t.v} onClick={()=>setActiveTab(t.v)} style={{padding:'10px 20px',border:'none',background:'transparent',cursor:'pointer',fontSize:13,fontWeight:activeTab===t.v?600:400,color:activeTab===t.v?'#0078d4':'#64748b',borderBottom:`2px solid ${activeTab===t.v?'#0078d4':'transparent'}`,marginBottom:-2}}>{t.l}</button>
        ))}
      </div>

      {activeTab==='dashboard' && (
        <div>
          {/* KPIs Financiers */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:14,marginBottom:20}}>
            {[
              {l:'Revenus encaissés',v:`${fmtN(totalFacture)} XAF`,c:'#16a34a',sub:`${factures.filter(f=>f.status==='paye').length} factures payées`},
              {l:'En attente',v:`${fmtN(totalAttente)} XAF`,c:'#f59e0b',sub:`${factures.filter(f=>f.status==='en_attente').length} factures`},
              {l:'En retard',v:`${fmtN(totalRetard)} XAF`,c:'#dc2626',sub:`${factures.filter(f=>f.status==='en_retard').length} factures`},
              {l:'Total dépenses',v:`${fmtN(totalDepenses)} XAF`,c:'#ea580c',sub:`${depenses.length} dépenses`},
              {l:'Bénéfice net',v:`${fmtN(benefice)} XAF`,c:benefice>=0?'#16a34a':'#dc2626',sub:'Revenus - Dépenses'},
            ].map(k=>(
              <div key={k.l} style={{background:'white',borderRadius:10,padding:'18px 16px',border:'1px solid #e2e8f0',borderTop:`3px solid ${k.c}`}}>
                <div style={{fontSize:11,color:'#64748b',fontWeight:600,marginBottom:6}}>{k.l.toUpperCase()}</div>
                <div style={{fontSize:18,fontWeight:800,color:k.c,marginBottom:4}}>{k.v}</div>
                <div style={{fontSize:11,color:'#94a3b8'}}>{k.sub}</div>
              </div>
            ))}
          </div>
          {/* Dernières factures */}
          <div style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',overflow:'hidden'}}>
            <div style={{padding:'14px 18px',borderBottom:'1px solid #f1f5f9',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:14,fontWeight:700,color:'#1e293b'}}>Dernières factures</span>
              <button onClick={()=>setActiveTab('factures')} style={{fontSize:12,color:'#0078d4',background:'none',border:'none',cursor:'pointer',fontWeight:600}}>Voir tout →</button>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{background:'#f8fafc'}}>{['N°','Client','Montant TTC','Statut','Échéance'].map(h=><th key={h} style={{padding:'9px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:'#374151',textTransform:'uppercase',letterSpacing:'0.5px'}}>{h}</th>)}</tr></thead>
              <tbody>
                {factures.slice(0,5).map(f=>{
                  const st=STATUS_F[f.status]||STATUS_F.brouillon;
                  return (
                    <tr key={f.id} style={{borderTop:'1px solid #f8fafc'}} onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background='white'}>
                      <td style={{padding:'10px 14px',fontSize:12,fontWeight:700,color:'#0078d4'}}>{f.numero}</td>
                      <td style={{padding:'10px 14px',fontSize:12,color:'#1e293b',fontWeight:600}}>{f.client}</td>
                      <td style={{padding:'10px 14px',fontSize:12,fontWeight:700,color:'#16a34a'}}>{fmtN(f.montantTTC)} XAF</td>
                      <td style={{padding:'10px 14px'}}><span style={{padding:'3px 9px',borderRadius:10,fontSize:11,fontWeight:600,background:st.bg,color:st.color}}>{st.label}</span></td>
                      <td style={{padding:'10px 14px',fontSize:11,color: f.status==='en_retard'?'#dc2626':'#64748b'}}>{fmtD(f.dateEcheance)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab==='factures' && (
        <div style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',overflow:'hidden'}}>
          <div style={{padding:'14px 18px',borderBottom:'1px solid #f1f5f9',display:'flex',justifyContent:'space-between'}}>
            <span style={{fontSize:14,fontWeight:700,color:'#1e293b'}}>Toutes les factures ({factures.length})</span>
          </div>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'#f8fafc',borderBottom:'2px solid #e2e8f0'}}>{['N°','Client','Type','Description','Montant HT','TVA','Montant TTC','Statut','Date','Échéance'].map(h=><th key={h} style={{padding:'10px 12px',textAlign:'left',fontSize:11,fontWeight:700,color:'#374151',textTransform:'uppercase',letterSpacing:'0.5px',whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
            <tbody>
              {factures.map(f=>{
                const st=STATUS_F[f.status]||STATUS_F.brouillon;
                return (
                  <tr key={f.id} style={{borderBottom:'1px solid #f8fafc'}} onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background='white'}>
                    <td style={{padding:'10px 12px',fontSize:12,fontWeight:700,color:'#0078d4'}}>{f.numero}</td>
                    <td style={{padding:'10px 12px',fontSize:12,fontWeight:600,color:'#1e293b'}}>{f.client}</td>
                    <td style={{padding:'10px 12px'}}><span style={{padding:'2px 7px',borderRadius:8,fontSize:10,background:`${TYPE_FACTURE[f.type]||'#64748b'}15`,color:TYPE_FACTURE[f.type]||'#64748b',fontWeight:600}}>{f.type}</span></td>
                    <td style={{padding:'10px 12px',fontSize:11,color:'#64748b',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.description}</td>
                    <td style={{padding:'10px 12px',fontSize:12,color:'#374151',whiteSpace:'nowrap'}}>{fmtN(f.montantHT)} XAF</td>
                    <td style={{padding:'10px 12px',fontSize:11,color:'#94a3b8',whiteSpace:'nowrap'}}>{fmtN(f.tva)} XAF</td>
                    <td style={{padding:'10px 12px',fontSize:12,fontWeight:700,color:'#16a34a',whiteSpace:'nowrap'}}>{fmtN(f.montantTTC)} XAF</td>
                    <td style={{padding:'10px 12px'}}><span style={{padding:'3px 9px',borderRadius:10,fontSize:11,fontWeight:600,background:st.bg,color:st.color}}>{st.label}</span></td>
                    <td style={{padding:'10px 12px',fontSize:11,color:'#64748b',whiteSpace:'nowrap'}}>{fmtD(f.dateFacture)}</td>
                    <td style={{padding:'10px 12px',fontSize:11,color:f.status==='en_retard'?'#dc2626':'#64748b',fontWeight:f.status==='en_retard'?600:400,whiteSpace:'nowrap'}}>{fmtD(f.dateEcheance)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab==='depenses' && (
        <div style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',overflow:'hidden'}}>
          <div style={{padding:'14px 18px',borderBottom:'1px solid #f1f5f9',display:'flex',justifyContent:'space-between'}}>
            <span style={{fontSize:14,fontWeight:700,color:'#1e293b'}}>Dépenses ({depenses.length}) · Total: {fmtN(totalDepenses)} XAF</span>
          </div>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'#f8fafc',borderBottom:'2px solid #e2e8f0'}}>{['Titre','Catégorie','Technicien','Montant','Date','Statut'].map(h=><th key={h} style={{padding:'10px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:'#374151',textTransform:'uppercase',letterSpacing:'0.5px'}}>{h}</th>)}</tr></thead>
            <tbody>
              {depenses.map(d=>(
                <tr key={d.id} style={{borderBottom:'1px solid #f8fafc'}} onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background='white'}>
                  <td style={{padding:'10px 14px',fontSize:13,fontWeight:600,color:'#1e293b'}}>{d.titre}</td>
                  <td style={{padding:'10px 14px'}}><span style={{padding:'2px 9px',borderRadius:8,fontSize:11,background:'#fff7ed',color:'#ea580c',fontWeight:600}}>{d.categorie}</span></td>
                  <td style={{padding:'10px 14px',fontSize:12,color:'#374151'}}>{d.technicien}</td>
                  <td style={{padding:'10px 14px',fontSize:13,fontWeight:700,color:'#dc2626'}}>{fmtN(d.montant)} XAF</td>
                  <td style={{padding:'10px 14px',fontSize:12,color:'#64748b'}}>{fmtD(d.date)}</td>
                  <td style={{padding:'10px 14px'}}><span style={{padding:'3px 9px',borderRadius:10,fontSize:11,fontWeight:600,background:d.statut==='valide'?'#f0fdf4':'#fefce8',color:d.statut==='valide'?'#16a34a':'#f59e0b'}}>{d.statut==='valide'?'Validée':'En attente'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'white',borderRadius:14,width:'100%',maxWidth:500,overflow:'hidden',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
            <div style={{padding:'16px 20px',background:'linear-gradient(135deg,#1e3a5f,#16a34a)',color:'white',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:16,fontWeight:800}}>+ Nouvelle {showForm==='facture'?'Facture':'Dépense'}</div>
              <button onClick={()=>setShowForm(null)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:28,height:28,borderRadius:'50%',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
            <div style={{padding:24,display:'flex',flexDirection:'column',gap:12}}>
              {showForm==='facture' ? (
                <>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    {[{l:'N° FACTURE *',k:'numero',ph:'FAC-2024-006'},{l:'CLIENT *',k:'client',ph:'MTN Cameroun'},{l:'MONTANT HT (XAF) *',k:'montantHT',ph:'10000000'},{l:'RÉFÉRENCE PO',k:'po',ph:'PO-2024-001'},{l:'DATE FACTURE',k:'dateFacture',ph:'',type:'date'},{l:'DATE ÉCHÉANCE',k:'dateEcheance',ph:'',type:'date'}].map(f=>(
                      <div key={f.k}><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>{f.l}</label><input type={f.type||'text'} value={form[f.k]||''} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} /></div>
                    ))}
                  </div>
                  {form.montantHT && <div style={{background:'#f0fdf4',borderRadius:8,padding:'12px 14px',fontSize:13,color:'#16a34a',fontWeight:600}}>TVA 19.25%: {fmtN(Number(form.montantHT)*0.1925)} XAF · TTC: {fmtN(Number(form.montantHT)*1.1925)} XAF</div>}
                  <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>DESCRIPTION</label><textarea value={form.description||''} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={2} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box',resize:'vertical'}} /></div>
                </>
              ) : (
                <>
                  {[{l:'TITRE *',k:'titre',ph:'Carburant équipes'},{l:'CATÉGORIE',k:'categorie',ph:'Transport'},{l:'MONTANT (XAF) *',k:'montant',ph:'500000'},{l:'TECHNICIEN',k:'technicien',ph:'Thomas Ngono'},{l:'DATE',k:'date',ph:'',type:'date'}].map(f=>(
                    <div key={f.k}><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>{f.l}</label><input type={f.type||'text'} value={form[f.k]||''} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} /></div>
                  ))}
                </>
              )}
              <div style={{display:'flex',gap:10,marginTop:8}}>
                <button onClick={()=>setShowForm(null)} style={{flex:1,padding:11,borderRadius:8,border:'1px solid #e2e8f0',background:'white',cursor:'pointer',fontSize:13,color:'#374151'}}>Annuler</button>
                <button onClick={save} disabled={saving} style={{flex:2,padding:11,borderRadius:8,border:'none',background:'#16a34a',color:'white',cursor:'pointer',fontSize:13,fontWeight:700}}>{saving?'Création...':'✓ Créer'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
