import { useState } from 'react';

const fmtN = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(n||0));
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';
const TVA_RATE = 0.1925;

const CLIENTS = ['MTN Cameroun','Orange Cameroun','Huawei Technologies','Nexttel Cameroun','Gouvernement Cameroun','CAMTEL','Entreprise Privée'];
const DEVISES_LIST = ['FCFA','USD','EUR','CNY'];
const PROJETS = ['DLA-001 · Site Akwa','YDE-001 · Site Yaoundé','KRI-001 · Kribi Port','GAR-001 · Garoua','LIM-001 · Limbé'];
const DEVISES_RATES = { FCFA:1, USD:600, EUR:655, CNY:83 };
const MODES_PAIEMENT = ['Virement bancaire','Chèque','Espèces','Mobile Money MTN','Mobile Money Orange','Virement international'];

const FACTURES_DATA = [
  { id:1, numero:'FAC-2024-001', client:'MTN Cameroun', projet:'DLA-001 · Site Akwa',
    lignes:[
      {desc:'Installation antennes 5G NR',qte:1,pu:8500000,tva:true},
      {desc:'Main d\'œuvre techniciens (15j)',qte:15,pu:350000,tva:true},
      {desc:'Matériel consommable',qte:1,pu:450000,tva:false}
    ],
    montantHT:14050000, tva:2509625, montantTTC:16559625,
    status:'paye', dateEmission:'2024-01-15', dateEcheance:'2024-02-15',
    devise:'FCFA', modePaiement:'Virement bancaire',
    notes:'Paiement reçu le 12/02/2024',
    acomptes:[{date:'2024-01-20',montant:5000000,ref:'VIR-2024-001'}] },
  { id:2, numero:'FAC-2024-002', client:'Orange Cameroun', projet:'YDE-001 · Site Yaoundé',
    lignes:[
      {desc:'Déploiement 4G LTE secteur centre',qte:1,pu:7200000,tva:true},
      {desc:'Configuration équipements réseau',qte:1,pu:1350000,tva:true}
    ],
    montantHT:8550000, tva:1645875, montantTTC:10195875,
    status:'en_retard', dateEmission:'2024-01-28', dateEcheance:'2024-03-01',
    devise:'FCFA', modePaiement:'Chèque',
    notes:'Relance envoyée le 05/03/2024', acomptes:[] },
  { id:3, numero:'FAC-2024-003', client:'Huawei Technologies', projet:'KRI-001 · Kribi Port',
    lignes:[
      {desc:'Engineering services 5G NR',qte:40,pu:850,tva:false},
      {desc:'Technical supervision & reporting',qte:10,pu:1200,tva:false}
    ],
    montantHT:46000, tva:0, montantTTC:46000,
    status:'envoye', dateEmission:'2024-02-10', dateEcheance:'2024-03-15',
    devise:'USD', modePaiement:'Virement international',
    notes:'Invoice sent via email', acomptes:[] },
  { id:4, numero:'FAC-2024-004', client:'Gouvernement Cameroun', projet:'Infrastructure nationale',
    lignes:[
      {desc:'Déploiement infrastructure télécom zones rurales',qte:1,pu:27000000,tva:true},
      {desc:'Maintenance annuelle garantie',qte:1,pu:5000000,tva:true}
    ],
    montantHT:32000000, tva:6160000, montantTTC:38160000,
    status:'partiel', dateEmission:'2024-02-01', dateEcheance:'2024-04-01',
    devise:'FCFA', modePaiement:'Virement bancaire',
    notes:'Acompte 30% reçu. Solde en attente.',
    acomptes:[{date:'2024-02-15',montant:11448000,ref:'TRESOR-2024-001'}] },
  { id:5, numero:'DEV-2024-001', client:'Nexttel Cameroun', projet:'GAR-001 · Garoua',
    lignes:[
      {desc:'Survey réseau zone Nord',qte:1,pu:3500000,tva:true},
      {desc:'Rapport technique détaillé',qte:1,pu:800000,tva:true}
    ],
    montantHT:4300000, tva:827750, montantTTC:5127750,
    status:'brouillon', dateEmission:'2024-03-01', dateEcheance:'2024-04-01',
    devise:'FCFA', modePaiement:'Virement bancaire',
    notes:'', acomptes:[] },
];

const DEPENSES_DATA = [
  { id:1, numero:'DEP-2024-001', fournisseur:'Huawei Technologies', description:'Équipements 5G NR DLA-001', categorie:'Équipements', montant:28500000, devise:'FCFA', date:'2024-01-15', status:'paye', projet:'DLA-001', bc:'BC-2024-001' },
  { id:2, numero:'DEP-2024-002', fournisseur:'Nokia Networks', description:'Antennes 4G LTE x12 unités', categorie:'Équipements', montant:15200, devise:'USD', date:'2024-02-01', status:'en_attente', projet:'LIM-001', bc:'BC-2024-002' },
  { id:3, numero:'DEP-2024-003', fournisseur:'Total Énergies', description:'Carburant véhicules janvier', categorie:'Transport', montant:850000, devise:'FCFA', date:'2024-01-31', status:'paye', projet:'Général', bc:'' },
  { id:4, numero:'DEP-2024-004', fournisseur:'CAMTEL', description:'Liaisons fibre optique Q1 2024', categorie:'Télécoms', montant:1200000, devise:'FCFA', date:'2024-02-15', status:'en_attente', projet:'Général', bc:'' },
  { id:5, numero:'DEP-2024-005', fournisseur:'Ericsson Cameroun', description:'Maintenance équipements 3G/4G', categorie:'Maintenance', montant:8500, devise:'EUR', date:'2024-02-20', status:'paye', projet:'GAR-001', bc:'BC-2024-003' },
];

const TVA_DATA = { collectee:12819500, deductible:4250000, aVerser:8569500, echeance:'2024-03-31' };

const CASHFLOW = [
  { mois:'Oct', entrees:18500000, sorties:12000000 },
  { mois:'Nov', entrees:22000000, sorties:14500000 },
  { mois:'Dec', entrees:28000000, sorties:16000000 },
  { mois:'Jan', entrees:25000000, sorties:18000000 },
  { mois:'Fev', entrees:31000000, sorties:19500000 },
  { mois:'Mar', entrees:35000000, sorties:21000000 },
];

const PLAN_COMPTABLE = [
  { classe:'1', libelle:'Comptes de capitaux', comptes:[
    { num:'101000', libelle:'Capital social', solde:50000000, type:'passif' },
    { num:'106000', libelle:'Réserves', solde:12500000, type:'passif' },
    { num:'120000', libelle:'Résultat de l\'exercice', solde:8340000, type:'passif' },
  ]},
  { classe:'2', libelle:'Comptes d\'actif immobilisé', comptes:[
    { num:'215000', libelle:'Matériel et équipements', solde:45000000, type:'actif' },
    { num:'218000', libelle:'Véhicules', solde:18500000, type:'actif' },
    { num:'282000', libelle:'Amortissements matériel', solde:-12000000, type:'actif' },
  ]},
  { classe:'4', libelle:'Comptes de tiers', comptes:[
    { num:'411000', libelle:'Clients MTN Cameroun', solde:10195875, type:'actif' },
    { num:'411001', libelle:'Clients Orange Cameroun', solde:5127750, type:'actif' },
    { num:'401000', libelle:'Fournisseurs Huawei', solde:-8500000, type:'passif' },
    { num:'445000', libelle:'TVA collectée', solde:-12819500, type:'passif' },
    { num:'445200', libelle:'TVA déductible', solde:4250000, type:'actif' },
  ]},
  { classe:'5', libelle:'Comptes de trésorerie', comptes:[
    { num:'521000', libelle:'Banque principale BICEC', solde:28450000, type:'actif' },
    { num:'521001', libelle:'Banque secondaire SGC', solde:12800000, type:'actif' },
    { num:'571000', libelle:'Caisse principale', solde:1250000, type:'actif' },
  ]},
  { classe:'6', libelle:'Comptes de charges', comptes:[
    { num:'601000', libelle:'Achats matières premières', solde:15200000, type:'charge' },
    { num:'613000', libelle:'Locations et charges locatives', solde:3600000, type:'charge' },
    { num:'621000', libelle:'Personnel externe (sous-traitants)', solde:24500000, type:'charge' },
    { num:'641000', libelle:'Salaires et traitements', solde:18200000, type:'charge' },
    { num:'645000', libelle:'Charges sociales CNPS', solde:2184000, type:'charge' },
  ]},
  { classe:'7', libelle:'Comptes de produits', comptes:[
    { num:'701000', libelle:'Chiffre d\'affaires prestations', solde:85000000, type:'produit' },
    { num:'706000', libelle:'Prestations de services', solde:12500000, type:'produit' },
    { num:'764000', libelle:'Revenus financiers', solde:180000, type:'produit' },
  ]},
];

// ===== COMPOSANTS =====
const StatusBadge = ({ status }) => {
  const configs = {
    paye:       { l:'Payée',      bg:'#f0fdf4', c:'#16a34a' },
    envoye:     { l:'Envoyée',    bg:'#eff6ff', c:'#1d4ed8' },
    en_retard:  { l:'En retard',  bg:'#fef2f2', c:'#dc2626' },
    partiel:    { l:'Partiel',    bg:'#fefce8', c:'#d97706' },
    brouillon:  { l:'Brouillon',  bg:'#f3f4f6', c:'#6b7280' },
    annule:     { l:'Annulée',    bg:'#fdf4ff', c:'#7c3aed' },
    en_attente: { l:'En attente', bg:'#fff7ed', c:'#d97706' },
    accepte:    { l:'Accepté',    bg:'#f0fdf4', c:'#16a34a' },
    refuse:     { l:'Refusé',     bg:'#fef2f2', c:'#dc2626' },
  };
  const cfg = configs[status] || configs.brouillon;
  return (
    <span style={{ padding:'4px 10px', borderRadius:20, background:cfg.bg, color:cfg.c, fontSize:11, fontWeight:700, whiteSpace:'nowrap' }}>
      {cfg.l}
    </span>
  );
};

const DeviseTag = ({ devise }) => {
  const colors = { FCFA:{bg:'#eff6ff',c:'#1d4ed8'}, USD:{bg:'#f0fdf4',c:'#16a34a'}, EUR:{bg:'#faf5ff',c:'#7c3aed'}, CNY:{bg:'#fff7ed',c:'#d97706'} };
  const cl = colors[devise] || colors.FCFA;
  return <span style={{ padding:'2px 8px', borderRadius:6, background:cl.bg, color:cl.c, fontSize:11, fontWeight:700 }}>{devise}</span>;
};

const Th = ({ children }) => (
  <th style={{ padding:'12px 14px', textAlign:'left', fontSize:11, fontWeight:800, color:'#6b7280', textTransform:'uppercase', letterSpacing:0.5, background:'#f8fafc', borderBottom:'2px solid #e5e7eb', whiteSpace:'nowrap' }}>
    {children}
  </th>
);

const Td = ({ children, style }) => (
  <td style={{ padding:'13px 14px', fontSize:13, color:'#374151', verticalAlign:'middle', ...style }}>
    {children}
  </td>
);

// ===== MODAL DÉTAIL FACTURE =====
const FactureModal = ({ facture, onClose }) => {
  if (!facture) return null;
  const totalPaye = facture.acomptes?.reduce((s,a) => s + a.montant, 0) || 0;
  const reste = facture.montantTTC - totalPaye;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'white', borderRadius:20, width:'100%', maxWidth:820, maxHeight:'92vh', overflow:'auto', boxShadow:'0 24px 64px rgba(0,0,0,0.25)' }}>
        <div style={{ background:'linear-gradient(135deg,#0f172a,#1d4ed8)', padding:'24px 28px', borderRadius:'20px 20px 0 0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Détail document</div>
              <div style={{ fontSize:26, fontWeight:900, color:'white' }}>{facture.numero}</div>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <StatusBadge status={facture.status}/>
              <button onClick={onClose} style={{ width:34, height:34, borderRadius:10, background:'rgba(255,255,255,0.15)', border:'none', color:'white', cursor:'pointer', fontSize:18 }}>✕</button>
            </div>
          </div>
        </div>
        <div style={{ padding:28 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:22, padding:18, background:'#f8fafc', borderRadius:14 }}>
            {[
              { l:'Client', v:facture.client },
              { l:'Projet', v:facture.projet },
              { l:'Date émission', v:fmtDate(facture.dateEmission) },
              { l:'Date échéance', v:fmtDate(facture.dateEcheance) },
              { l:'Devise', v:facture.devise },
              { l:'Mode paiement', v:facture.modePaiement },
            ].map(i => (
              <div key={i.l}>
                <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:0.5, marginBottom:3 }}>{i.l}</div>
                <div style={{ fontSize:14, fontWeight:600, color:'#111827' }}>{i.v}</div>
              </div>
            ))}
          </div>
          <h4 style={{ fontSize:12, fontWeight:800, color:'#6b7280', textTransform:'uppercase', letterSpacing:0.8, marginBottom:10 }}>Lignes de prestation</h4>
          <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:18 }}>
            <thead>
              <tr>{['Description','Qté','Prix unitaire','TVA','Total TTC'].map(h=><Th key={h}>{h}</Th>)}</tr>
            </thead>
            <tbody>
              {facture.lignes.map((l,i) => {
                const ht = l.qte * l.pu;
                const tva = l.tva ? ht * TVA_RATE : 0;
                return (
                  <tr key={i} style={{ borderBottom:'1px solid #f3f4f6' }}>
                    <Td>{l.desc}</Td>
                    <Td style={{ textAlign:'center' }}>{l.qte}</Td>
                    <Td>{fmtN(l.pu)} {facture.devise}</Td>
                    <Td style={{ color:l.tva?'#dc2626':'#9ca3af' }}>{l.tva ? `${(TVA_RATE*100).toFixed(2)}%` : 'Exonéré'}</Td>
                    <Td style={{ fontWeight:700, color:'#111827' }}>{fmtN(ht+tva)} {facture.devise}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:18 }}>
            <div style={{ width:300, background:'#f8fafc', borderRadius:12, padding:16 }}>
              {[
                { l:'Montant HT', v:`${fmtN(facture.montantHT)} ${facture.devise}`, color:'#374151' },
                { l:`TVA (${(TVA_RATE*100).toFixed(2)}%)`, v:`${fmtN(facture.tva)} ${facture.devise}`, color:'#dc2626' },
                { l:'Montant TTC', v:`${fmtN(facture.montantTTC)} ${facture.devise}`, color:'#1d4ed8', big:true },
                ...(totalPaye > 0 ? [
                  { l:'Acomptes reçus', v:`- ${fmtN(totalPaye)} ${facture.devise}`, color:'#16a34a' },
                  { l:'Reste à payer', v:`${fmtN(reste)} ${facture.devise}`, color:'#d97706', big:true },
                ] : []),
              ].map(t => (
                <div key={t.l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:t.big?'none':'1px solid #e5e7eb' }}>
                  <span style={{ fontSize:t.big?14:12, fontWeight:t.big?700:400, color:'#6b7280' }}>{t.l}</span>
                  <span style={{ fontSize:t.big?18:13, fontWeight:t.big?900:600, color:t.color }}>{t.v}</span>
                </div>
              ))}
            </div>
          </div>
          {facture.notes && (
            <div style={{ marginBottom:16, padding:12, background:'#fefce8', borderRadius:10, border:'1px solid #fde68a' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#92400e', marginBottom:4 }}>Notes</div>
              <div style={{ fontSize:13, color:'#78350f' }}>{facture.notes}</div>
            </div>
          )}
          {facture.acomptes?.length > 0 && (
            <div style={{ marginBottom:16, padding:14, background:'#f0fdf4', borderRadius:10, border:'1px solid #bbf7d0' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#16a34a', marginBottom:8 }}>Acomptes reçus</div>
              {facture.acomptes.map((a,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                  <span>{fmtDate(a.date)} — Réf: {a.ref}</span>
                  <strong style={{ color:'#16a34a' }}>{fmtN(a.montant)} {facture.devise}</strong>
                </div>
              ))}
            </div>
          )}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {[
              ['🖨 Imprimer','#374151','#f3f4f6'],
              ['📤 Envoyer par email','#1d4ed8','#eff6ff'],
              ['📥 Télécharger PDF','#7c3aed','#f5f3ff'],
              ['💳 Enregistrer paiement','#16a34a','#f0fdf4'],
              ['📋 Dupliquer','#d97706','#fefce8'],
              ['❌ Annuler','#dc2626','#fef2f2'],
            ].map(([l,c,bg]) => (
              <button key={l} style={{ padding:'9px 14px', borderRadius:10, border:`1px solid ${c}30`, background:bg, color:c, fontWeight:700, fontSize:12, cursor:'pointer' }}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== MODAL NOUVELLE FACTURE =====
const NouvelleFactureModal = ({ onClose, onSave }) => {
  const [client, setClient] = useState('');
  const [projet, setProjet] = useState('');
  const [devise, setDevise] = useState('FCFA');
  const [dateEcheance, setDateEcheance] = useState('');
  const [modePaiement, setModePaiement] = useState('Virement bancaire');
  const [notes, setNotes] = useState('');
  const [lignes, setLignes] = useState([{ desc:'', qte:1, pu:0, tva:true }]);

  const addLigne = () => setLignes(p => [...p, { desc:'', qte:1, pu:0, tva:true }]);
  const updLigne = (i,k,v) => setLignes(p => p.map((l,idx) => idx===i ? {...l,[k]:v} : l));
  const delLigne = (i) => setLignes(p => p.filter((_,idx) => idx!==i));

  const montantHT = lignes.reduce((s,l) => s + l.qte * l.pu, 0);
  const tvaTotal  = lignes.reduce((s,l) => s + (l.tva ? l.qte * l.pu * TVA_RATE : 0), 0);
  const montantTTC = montantHT + tvaTotal;

  const handleSave = (asDraft) => {
    if (!client) { alert('Client obligatoire'); return; }
    onSave({
      id: Date.now(),
      numero: `FAC-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900+100))}`,
      client, projet, devise, dateEcheance,
      dateEmission: new Date().toISOString().split('T')[0],
      modePaiement, notes, lignes,
      montantHT, tva: tvaTotal, montantTTC,
      status: asDraft ? 'brouillon' : 'envoye',
      acomptes: [],
    });
    onClose();
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'white', borderRadius:20, width:'100%', maxWidth:920, maxHeight:'93vh', overflow:'auto', boxShadow:'0 24px 64px rgba(0,0,0,0.25)' }}>
        <div style={{ background:'linear-gradient(135deg,#0f172a,#059669)', padding:'22px 28px', borderRadius:'20px 20px 0 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:1 }}>Nouveau document</div>
            <div style={{ fontSize:22, fontWeight:900, color:'white' }}>Créer une facture</div>
          </div>
          <button onClick={onClose} style={{ width:34, height:34, borderRadius:10, background:'rgba(255,255,255,0.15)', border:'none', color:'white', cursor:'pointer', fontSize:18 }}>✕</button>
        </div>
        <div style={{ padding:28 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
            {[
              { label:'Client *', type:'select', value:client, set:setClient, options:CLIENTS },
              { label:'Projet associé', type:'select', value:projet, set:setProjet, options:PROJETS },
              { label:'Devise', type:'select', value:devise, set:setDevise, options:DEVISES_LIST },
              { label:'Date échéance', type:'date', value:dateEcheance, set:setDateEcheance },
              { label:'Mode de paiement', type:'select', value:modePaiement, set:setModePaiement, options:MODES_PAIEMENT },
            ].map(f => (
              <div key={f.label}>
                <label style={{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:0.5, display:'block', marginBottom:6 }}>{f.label}</label>
                {f.type==='select' ? (
                  <select value={f.value} onChange={e=>f.set(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #e5e7eb', fontSize:13, color:'#111827', background:'#f9fafb' }}>
                    <option value="">Sélectionner...</option>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={f.type} value={f.value} onChange={e=>f.set(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #e5e7eb', fontSize:13, color:'#111827', background:'#f9fafb', boxSizing:'border-box' }}/>
                )}
              </div>
            ))}
          </div>
          <h4 style={{ fontSize:12, fontWeight:800, color:'#6b7280', textTransform:'uppercase', letterSpacing:0.8, marginBottom:10 }}>Lignes de prestation</h4>
          <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:10 }}>
            <thead>
              <tr>{['Description','Qté','Prix unitaire',`TVA ${(TVA_RATE*100).toFixed(2)}%`,'Total TTC',''].map(h=><Th key={h}>{h}</Th>)}</tr>
            </thead>
            <tbody>
              {lignes.map((l,i) => {
                const total = l.qte * l.pu * (l.tva ? 1+TVA_RATE : 1);
                return (
                  <tr key={i} style={{ borderBottom:'1px solid #f3f4f6' }}>
                    <Td><input value={l.desc} onChange={e=>updLigne(i,'desc',e.target.value)} placeholder="Description" style={{ width:'100%', padding:'7px 10px', borderRadius:8, border:'1px solid #e5e7eb', fontSize:13 }}/></Td>
                    <Td><input type="number" min="0" value={l.qte} onChange={e=>updLigne(i,'qte',+e.target.value)} style={{ width:65, padding:'7px 10px', borderRadius:8, border:'1px solid #e5e7eb', fontSize:13, textAlign:'center' }}/></Td>
                    <Td><input type="number" min="0" value={l.pu} onChange={e=>updLigne(i,'pu',+e.target.value)} style={{ width:130, padding:'7px 10px', borderRadius:8, border:'1px solid #e5e7eb', fontSize:13 }}/></Td>
                    <Td style={{ textAlign:'center' }}><input type="checkbox" checked={l.tva} onChange={e=>updLigne(i,'tva',e.target.checked)} style={{ width:18, height:18, cursor:'pointer' }}/></Td>
                    <Td style={{ fontWeight:700, color:'#1d4ed8', whiteSpace:'nowrap' }}>{fmtN(Math.round(total))} {devise}</Td>
                    <Td>{lignes.length>1&&<button onClick={()=>delLigne(i)} style={{ width:26, height:26, borderRadius:7, border:'1px solid #fecaca', background:'#fef2f2', color:'#dc2626', cursor:'pointer', fontSize:14 }}>✕</button>}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button onClick={addLigne} style={{ padding:'8px 16px', borderRadius:10, border:'1px dashed #1d4ed8', background:'#eff6ff', color:'#1d4ed8', fontWeight:700, fontSize:13, cursor:'pointer', marginBottom:20 }}>+ Ajouter une ligne</button>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:22 }}>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:0.5, display:'block', marginBottom:6 }}>Notes</label>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={4} placeholder="Conditions de paiement, notes..." style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #e5e7eb', fontSize:13, resize:'vertical', boxSizing:'border-box', fontFamily:'inherit' }}/>
            </div>
            <div style={{ background:'#f8fafc', borderRadius:14, padding:18 }}>
              {[
                { l:'Montant HT', v:`${fmtN(montantHT)} ${devise}`, c:'#374151' },
                { l:`TVA (${(TVA_RATE*100).toFixed(2)}%)`, v:`${fmtN(Math.round(tvaTotal))} ${devise}`, c:'#dc2626' },
                { l:'Montant TTC', v:`${fmtN(Math.round(montantTTC))} ${devise}`, c:'#1d4ed8', big:true },
              ].map(t => (
                <div key={t.l} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:t.big?'none':'1px solid #e5e7eb' }}>
                  <span style={{ fontSize:t.big?14:12, fontWeight:t.big?700:400, color:'#6b7280' }}>{t.l}</span>
                  <span style={{ fontSize:t.big?20:14, fontWeight:t.big?900:700, color:t.c }}>{t.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <button onClick={onClose} style={{ padding:'12px 24px', borderRadius:12, border:'1.5px solid #e5e7eb', background:'white', color:'#6b7280', fontWeight:700, fontSize:14, cursor:'pointer' }}>Annuler</button>
            <button onClick={()=>handleSave(true)} style={{ padding:'12px 24px', borderRadius:12, border:'none', background:'#f3f4f6', color:'#374151', fontWeight:700, fontSize:14, cursor:'pointer' }}>💾 Brouillon</button>
            <button onClick={()=>handleSave(false)} style={{ padding:'12px 24px', borderRadius:12, border:'none', background:'#1d4ed8', color:'white', fontWeight:800, fontSize:14, cursor:'pointer' }}>📤 Créer et envoyer</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== VUE FACTURES =====
const VueFactures = ({ factures, setFactures }) => {
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [filterDevise, setFilterDevise] = useState('tous');

  const filtered = factures.filter(f => {
    const ms = !search || f.client.toLowerCase().includes(search.toLowerCase()) || f.numero.toLowerCase().includes(search.toLowerCase());
    const mf = filterStatus==='tous' || f.status===filterStatus;
    const md = filterDevise==='tous' || f.devise===filterDevise;
    return ms && mf && md;
  });

  const totalTTC   = filtered.reduce((s,f) => s+f.montantTTC, 0);
  const totalPaye  = filtered.filter(f=>f.status==='paye').reduce((s,f) => s+f.montantTTC, 0);
  const totalAttente = filtered.filter(f=>['envoye','partiel'].includes(f.status)).reduce((s,f) => s+f.montantTTC, 0);
  const totalRetard  = filtered.filter(f=>f.status==='en_retard').reduce((s,f) => s+f.montantTTC, 0);

  return (
    <div>
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        {[
          { l:'Total TTC',    v:`${fmtN(totalTTC)} FCFA`,    c:'#1d4ed8' },
          { l:'Encaissé',     v:`${fmtN(totalPaye)} FCFA`,   c:'#16a34a' },
          { l:'En attente',   v:`${fmtN(totalAttente)} FCFA', c:'#d97706' },
          { l:'En retard',    v:`${fmtN(totalRetard)} FCFA`,  c:'#dc2626' },
        ].map(k => (
          <div key={k.l} style={{ flex:1, minWidth:180, background:'white', borderRadius:12, padding:'14px 16px', borderLeft:`3px solid ${k.c}`, boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize:10, color:'#9ca3af', textTransform:'uppercase', letterSpacing:0.5, marginBottom:4 }}>{k.l}</div>
            <div style={{ fontSize:17, fontWeight:900, color:k.c }}>{k.v}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ flex:1, minWidth:220, display:'flex', alignItems:'center', gap:8, background:'white', borderRadius:11, padding:'9px 13px', border:'1px solid #e5e7eb' }}>
          <span style={{ color:'#9ca3af' }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Client, numéro..." style={{ flex:1, border:'none', outline:'none', fontSize:13, color:'#111827' }}/>
        </div>
        <div style={{ display:'flex', gap:5, background:'white', borderRadius:11, padding:3, border:'1px solid #e5e7eb' }}>
          {['tous','brouillon','envoye','partiel','paye','en_retard'].map(s => (
            <button key={s} onClick={()=>setFilterStatus(s)} style={{ padding:'6px 12px', borderRadius:9, border:'none', background:filterStatus===s?'#1d4ed8':'transparent', color:filterStatus===s?'white':'#6b7280', fontWeight:700, fontSize:11, cursor:'pointer', whiteSpace:'nowrap' }}>
              {s==='tous'?'Toutes':s==='brouillon'?'Brouillon':s==='envoye'?'Envoyées':s==='partiel'?'Partielles':s==='paye'?'Payées':'En retard'}
            </button>
          ))}
        </div>
        <button onClick={()=>setShowNew(true)} style={{ padding:'10px 18px', borderRadius:11, border:'none', background:'#059669', color:'white', fontWeight:800, fontSize:13, cursor:'pointer' }}>+ Nouvelle facture</button>
      </div>
      <div style={{ background:'white', borderRadius:16, border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:900 }}>
            <thead><tr>{['Numéro','Client','Projet','Montant HT','TVA','Montant TTC','Devise','Émission','Échéance','Statut','Actions'].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
            <tbody>
              {filtered.map((f,i) => (
                <tr key={f.id} style={{ borderBottom:'1px solid #f3f4f6', cursor:'pointer', background:i%2===0?'white':'#fafbfc' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#eff6ff'}
                  onMouseLeave={e=>e.currentTarget.style.background=i%2===0?'white':'#fafbfc'}>
                  <Td style={{ fontWeight:800, color:'#1d4ed8' }} onClick={()=>setSelected(f)}>{f.numero}</Td>
                  <Td style={{ fontWeight:600 }}>{f.client}</Td>
                  <Td style={{ color:'#6b7280', fontSize:12 }}>{f.projet}</Td>
                  <Td>{fmtN(f.montantHT)}</Td>
                  <Td style={{ color:'#dc2626' }}>{fmtN(f.tva)}</Td>
                  <Td style={{ fontWeight:800, color:'#111827' }}>{fmtN(f.montantTTC)}</Td>
                  <Td><DeviseTag devise={f.devise}/></Td>
                  <Td style={{ fontSize:12 }}>{fmtDate(f.dateEmission)}</Td>
                  <Td style={{ fontSize:12, color:new Date(f.dateEcheance)<new Date()&&f.status!=='paye'?'#dc2626':'#374151', fontWeight:new Date(f.dateEcheance)<new Date()&&f.status!=='paye'?700:400 }}>{fmtDate(f.dateEcheance)}</Td>
                  <Td><StatusBadge status={f.status}/></Td>
                  <Td>
                    <div style={{ display:'flex', gap:4 }}>
                      {[['👁','Voir'],['✏️','Modifier'],['📤','Envoyer'],['🖨','Imprimer']].map(([icon,title]) => (
                        <button key={title} title={title} onClick={()=>icon==='👁'&&setSelected(f)}
                          style={{ width:28, height:28, borderRadius:7, border:'1px solid #e5e7eb', background:'white', cursor:'pointer', fontSize:13 }}>{icon}</button>
                      ))}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length===0&&<div style={{ padding:40, textAlign:'center', color:'#9ca3af' }}><div style={{ fontSize:36, marginBottom:8 }}>🧾</div><div>Aucune facture trouvée</div></div>}
        </div>
      </div>
      {selected&&<FactureModal facture={selected} onClose={()=>setSelected(null)}/>}
      {showNew&&<NouvelleFactureModal onClose={()=>setShowNew(false)} onSave={f=>setFactures(p=>[f,...p])}/>}
    </div>
  );
};

// ===== VUE PLAN COMPTABLE =====
const VuePlanComptable = () => {
  const [expanded, setExpanded] = useState({});
  const toggle = (k) => setExpanded(p => ({...p,[k]:!p[k]}));
  return (
    <div>
      <div style={{ background:'white', borderRadius:16, border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #e5e7eb', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:'#111827' }}>Plan Comptable OHADA — CleanIT ERP</h3>
          <div style={{ display:'flex', gap:8 }}>
            <button style={{ padding:'7px 14px', borderRadius:9, border:'1px solid #e5e7eb', background:'white', color:'#374151', fontWeight:700, fontSize:12, cursor:'pointer' }}>📥 Exporter Excel</button>
            <button style={{ padding:'7px 14px', borderRadius:9, border:'none', background:'#1d4ed8', color:'white', fontWeight:700, fontSize:12, cursor:'pointer' }}>+ Nouveau compte</button>
          </div>
        </div>
        {PLAN_COMPTABLE.map(cls => (
          <div key={cls.classe}>
            <div onClick={()=>toggle(cls.classe)} style={{ padding:'14px 20px', background:'#f8fafc', borderBottom:'1px solid #e5e7eb', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}
              onMouseEnter={e=>e.currentTarget.style.background='#eff6ff'}
              onMouseLeave={e=>e.currentTarget.style.background='#f8fafc'}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:'#1d4ed815', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900, color:'#1d4ed8' }}>{cls.classe}</div>
                <span style={{ fontSize:14, fontWeight:700, color:'#111827' }}>Classe {cls.classe} — {cls.libelle}</span>
                <span style={{ padding:'2px 8px', borderRadius:6, background:'#e5e7eb', fontSize:11, color:'#6b7280' }}>{cls.comptes.length} comptes</span>
              </div>
              <span style={{ color:'#9ca3af', fontSize:16 }}>{expanded[cls.classe]?'▼':'▶'}</span>
            </div>
            {expanded[cls.classe]&&(
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#fafbfc' }}>
                    {['N° Compte','Libellé','Type','Solde'].map(h => <th key={h} style={{ padding:'9px 20px', textAlign:'left', fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:0.5, borderBottom:'1px solid #f3f4f6' }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {cls.comptes.map((c,i) => (
                    <tr key={c.num} style={{ borderBottom:'1px solid #f9fafb', background:i%2===0?'white':'#fafbfc' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#f0f9ff'}
                      onMouseLeave={e=>e.currentTarget.style.background=i%2===0?'white':'#fafbfc'}>
                      <td style={{ padding:'11px 20px', fontSize:13, fontWeight:700, color:'#1d4ed8', fontFamily:'monospace' }}>{c.num}</td>
                      <td style={{ padding:'11px 20px', fontSize:13, color:'#374151' }}>{c.libelle}</td>
                      <td style={{ padding:'11px 20px' }}>
                        <span style={{ padding:'2px 9px', borderRadius:6, background:c.type==='actif'?'#eff6ff':c.type==='passif'?'#fef2f2':c.type==='charge'?'#fff7ed':'#f0fdf4', color:c.type==='actif'?'#1d4ed8':c.type==='passif'?'#dc2626':c.type==='charge'?'#d97706':'#16a34a', fontSize:11, fontWeight:700 }}>
                          {c.type.charAt(0).toUpperCase()+c.type.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding:'11px 20px', fontSize:13, fontWeight:700, color:c.solde>=0?'#16a34a':'#dc2626', textAlign:'right' }}>{fmtN(Math.abs(c.solde))} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== VUE TVA =====
const VueTVA = () => (
  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
    <div style={{ background:'white', borderRadius:16, padding:24, border:'1px solid #e5e7eb', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
      <h3 style={{ margin:'0 0 20px', fontSize:15, fontWeight:800, color:'#111827' }}>TVA du mois — Taux: {(TVA_RATE*100).toFixed(2)}%</h3>
      {[
        { l:'TVA collectée (sur ventes)', v:TVA_DATA.collectee, c:'#dc2626', icon:'📤' },
        { l:'TVA déductible (sur achats)', v:TVA_DATA.deductible, c:'#16a34a', icon:'📥' },
        { l:'TVA nette à verser', v:TVA_DATA.aVerser, c:'#d97706', icon:'🏛', big:true },
      ].map(t => (
        <div key={t.l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom:t.big?'none':'1px solid #f3f4f6' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:18 }}>{t.icon}</span>
            <span style={{ fontSize:t.big?14:13, fontWeight:t.big?700:500, color:'#374151' }}>{t.l}</span>
          </div>
          <span style={{ fontSize:t.big?20:15, fontWeight:t.big?900:700, color:t.c }}>{fmtN(t.v)} FCFA</span>
        </div>
      ))}
      <div style={{ marginTop:16, padding:14, background:'#fff7ed', borderRadius:12, border:'1px solid #fed7aa' }}>
        <div style={{ fontSize:12, fontWeight:700, color:'#d97706', marginBottom:4 }}>⚠️ Prochaine déclaration TVA</div>
        <div style={{ fontSize:14, fontWeight:800, color:'#92400e' }}>{fmtDate(TVA_DATA.echeance)}</div>
      </div>
      <button style={{ marginTop:14, width:'100%', padding:12, borderRadius:11, border:'none', background:'#1d4ed8', color:'white', fontWeight:700, cursor:'pointer', fontSize:14 }}>
        📋 Générer déclaration TVA DGI
      </button>
    </div>
    <div style={{ background:'white', borderRadius:16, padding:24, border:'1px solid #e5e7eb', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
      <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:800, color:'#111827' }}>Historique TVA</h3>
      {['Janvier 2024','Décembre 2023','Novembre 2023','Octobre 2023'].map((m,i) => (
        <div key={m} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #f3f4f6' }}>
          <span style={{ fontSize:13, fontWeight:500, color:'#374151' }}>{m}</span>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#374151' }}>{fmtN(8569500-i*500000)} FCFA</span>
            <span style={{ padding:'2px 8px', borderRadius:6, background:'#f0fdf4', color:'#16a34a', fontSize:11, fontWeight:700 }}>Déclaré</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ===== VUE CASHFLOW =====
const VueCashflow = () => {
  const maxFlow = Math.max(...CASHFLOW.map(c => Math.max(c.entrees, c.sorties)));
  return (
    <div style={{ background:'white', borderRadius:16, padding:24, border:'1px solid #e5e7eb', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h3 style={{ margin:0, fontSize:15, fontWeight:800, color:'#111827' }}>Flux de trésorerie — 6 derniers mois</h3>
        <div style={{ display:'flex', gap:14, fontSize:12, color:'#6b7280' }}>
          <span><span style={{ display:'inline-block', width:12, height:12, borderRadius:3, background:'#1d4ed8', marginRight:5, verticalAlign:'middle' }}/>Entrées</span>
          <span><span style={{ display:'inline-block', width:12, height:12, borderRadius:3, background:'#ef4444', marginRight:5, verticalAlign:'middle' }}/>Sorties</span>
          <span><span style={{ display:'inline-block', width:12, height:12, borderRadius:3, background:'#22c55e', marginRight:5, verticalAlign:'middle' }}/>Marge</span>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:180, paddingBottom:24, position:'relative' }}>
        <div style={{ position:'absolute', left:0, right:0, bottom:24, display:'flex', flexDirection:'column', justifyContent:'space-between', height:156, pointerEvents:'none' }}>
          {[100,75,50,25,0].map(p => (
            <div key={p} style={{ borderTop:'1px dashed #f3f4f6', width:'100%', position:'relative' }}>
              <span style={{ position:'absolute', right:'100%', marginRight:6, fontSize:9, color:'#d1d5db', fontWeight:600 }}>{Math.round(maxFlow*p/100/1000000)}M</span>
            </div>
          ))}
        </div>
        {CASHFLOW.map((c,i) => {
          const marge = c.entrees - c.sorties;
          return (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
              <div style={{ width:'100%', display:'flex', gap:2, alignItems:'flex-end', height:156 }}>
                <div style={{ flex:1, height:`${(c.entrees/maxFlow)*156}px`, background:'#1d4ed8', borderRadius:'4px 4px 0 0', transition:'height .4s', position:'relative' }}/>
                <div style={{ flex:1, height:`${(c.sorties/maxFlow)*156}px`, background:'#ef4444', borderRadius:'4px 4px 0 0', opacity:0.75 }}/>
                <div style={{ flex:1, height:`${(marge/maxFlow)*156}px`, background:'#22c55e', borderRadius:'4px 4px 0 0', opacity:0.85 }}/>
              </div>
              <span style={{ fontSize:10, color:'#9ca3af', fontWeight:600 }}>{c.mois}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display:'flex', gap:12, marginTop:12 }}>
        {[
          { l:'Total entrées', v:CASHFLOW.reduce((s,c)=>s+c.entrees,0), c:'#1d4ed8' },
          { l:'Total sorties', v:CASHFLOW.reduce((s,c)=>s+c.sorties,0), c:'#ef4444' },
          { l:'Marge totale', v:CASHFLOW.reduce((s,c)=>s+(c.entrees-c.sorties),0), c:'#22c55e' },
        ].map(k => (
          <div key={k.l} style={{ flex:1, background:'#f8fafc', borderRadius:10, padding:'12px 14px' }}>
            <div style={{ fontSize:10, color:'#9ca3af', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 }}>{k.l}</div>
            <div style={{ fontSize:15, fontWeight:800, color:k.c }}>{fmtN(k.v)} FCFA</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== VUE DÉPENSES =====
const VueDepenses = ({ depenses, setDepenses }) => {
  const [search, setSearch] = useState('');
  const filtered = depenses.filter(d => !search || d.fournisseur.toLowerCase().includes(search.toLowerCase()) || d.description.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <div style={{ display:'flex', gap:10, marginBottom:16, alignItems:'center' }}>
        <div style={{ flex:1, display:'flex', alignItems:'center', gap:8, background:'white', borderRadius:11, padding:'9px 13px', border:'1px solid #e5e7eb' }}>
          <span style={{ color:'#9ca3af' }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Fournisseur, description..." style={{ flex:1, border:'none', outline:'none', fontSize:13 }}/>
        </div>
        <button style={{ padding:'10px 18px', borderRadius:11, border:'none', background:'#dc2626', color:'white', fontWeight:800, fontSize:13, cursor:'pointer' }}>+ Nouvelle dépense</button>
      </div>
      <div style={{ background:'white', borderRadius:16, border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:800 }}>
            <thead><tr>{['Référence','Fournisseur','Description','Catégorie','Projet','Montant','Devise','Date','BC','Statut'].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
            <tbody>
              {filtered.map((d,i) => (
                <tr key={d.id} style={{ borderBottom:'1px solid #f3f4f6', background:i%2===0?'white':'#fafbfc' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#fef2f2'}
                  onMouseLeave={e=>e.currentTarget.style.background=i%2===0?'white':'#fafbfc'}>
                  <Td style={{ fontWeight:700, color:'#dc2626', fontFamily:'monospace' }}>{d.numero}</Td>
                  <Td style={{ fontWeight:600 }}>{d.fournisseur}</Td>
                  <Td style={{ color:'#6b7280', fontSize:12 }}>{d.description}</Td>
                  <Td><span style={{ padding:'2px 8px', borderRadius:6, background:'#f3f4f6', fontSize:11, fontWeight:600 }}>{d.categorie}</span></Td>
                  <Td style={{ color:'#1d4ed8', fontWeight:600 }}>{d.projet}</Td>
                  <Td style={{ fontWeight:800, color:'#111827' }}>{fmtN(d.montant)}</Td>
                  <Td><DeviseTag devise={d.devise}/></Td>
                  <Td style={{ fontSize:12 }}>{fmtDate(d.date)}</Td>
                  <Td style={{ fontSize:11, color:'#6b7280', fontFamily:'monospace' }}>{d.bc||'—'}</Td>
                  <Td><StatusBadge status={d.status}/></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ===== COMPOSANT PRINCIPAL FINANCE =====
const TABS_FINANCE = [
  { id:'dashboard', label:'Tableau de bord', icon:'📊' },
  { id:'factures',  label:'Factures',        icon:'🧾' },
  { id:'depenses',  label:'Dépenses',         icon:'💸' },
  { id:'tva',       label:'TVA',              icon:'🏛' },
  { id:'cashflow',  label:'Trésorerie',       icon:'💰' },
  { id:'comptabilite', label:'Plan comptable',icon:'📚' },
  { id:'rapports',  label:'Rapports',         icon:'📈' },
];

const Dashboard = ({ factures, depenses, onNavigate }) => {
  const maxFlow = Math.max(...CASHFLOW.map(c => Math.max(c.entrees, c.sorties)));
  const totalCA  = factures.reduce((s,f) => s+f.montantTTC, 0);
  const totalPaye = factures.filter(f=>f.status==='paye').reduce((s,f) => s+f.montantTTC, 0);
  const totalImpaye = factures.filter(f=>['envoye','partiel','en_retard'].includes(f.status)).reduce((s,f) => s+f.montantTTC, 0);
  const totalDepenses = depenses.reduce((s,d) => s+(d.devise==='FCFA'?d.montant:d.montant*DEVISES_RATES[d.devise]), 0);
  const benefice = totalPaye - totalDepenses;

  return (
    <div>
      <div style={{ display:'flex', gap:14, marginBottom:24, flexWrap:'wrap' }}>
        {[
          { l:'Chiffre d\'affaires', v:`${fmtN(totalCA)} FCFA`, c:'#1d4ed8', icon:'📈', trend:'+12%' },
          { l:'Encaissé', v:`${fmtN(totalPaye)} FCFA`, c:'#16a34a', icon:'✅', trend:'+8%' },
          { l:'À encaisser', v:`${fmtN(totalImpaye)} FCFA`, c:'#d97706', icon:'⏳', trend:'-3%' },
          { l:'Dépenses totales', v:`${fmtN(totalDepenses)} FCFA`, c:'#dc2626', icon:'💸', trend:'+5%' },
          { l:'Bénéfice net', v:`${fmtN(benefice)} FCFA`, c:'#7c3aed', icon:'💎', trend:'+15%' },
        ].map(k => (
          <div key={k.l} style={{ flex:1, minWidth:160, background:'white', borderRadius:14, padding:'16px 18px', borderLeft:`4px solid ${k.c}`, boxShadow:'0 2px 10px rgba(0,0,0,0.05)', cursor:'pointer' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:`${k.c}12`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{k.icon}</div>
              <span style={{ fontSize:11, fontWeight:700, padding:'2px 7px', borderRadius:6, background:k.trend.startsWith('+')?'#dcfce7':'#fef2f2', color:k.trend.startsWith('+')?'#16a34a':'#dc2626' }}>{k.trend}</span>
            </div>
            <div style={{ fontSize:18, fontWeight:900, color:k.c, letterSpacing:-0.3, marginBottom:3 }}>{k.v}</div>
            <div style={{ fontSize:12, fontWeight:600, color:'#374151' }}>{k.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:18, marginBottom:24 }}>
        <div style={{ background:'white', borderRadius:16, padding:22, border:'1px solid #e5e7eb', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <h3 style={{ margin:0, fontSize:14, fontWeight:800, color:'#111827' }}>Flux de trésorerie — 6 mois</h3>
            <div style={{ display:'flex', gap:10, fontSize:11, color:'#6b7280' }}>
              <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:'#1d4ed8', marginRight:4, verticalAlign:'middle' }}/>Entrées</span>
              <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:2, background:'#ef4444', marginRight:4, verticalAlign:'middle' }}/>Sorties</span>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:140 }}>
            {CASHFLOW.map((c,i) => (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                <div style={{ width:'100%', display:'flex', gap:2, alignItems:'flex-end', height:112 }}>
                  <div style={{ flex:1, height:`${(c.entrees/maxFlow)*112}px`, background:'#1d4ed8', borderRadius:'3px 3px 0 0' }}/>
                  <div style={{ flex:1, height:`${(c.sorties/maxFlow)*112}px`, background:'#ef4444', borderRadius:'3px 3px 0 0', opacity:0.75 }}/>
                </div>
                <span style={{ fontSize:9, color:'#9ca3af', fontWeight:600 }}>{c.mois}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background:'white', borderRadius:16, padding:22, border:'1px solid #e5e7eb', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
          <h3 style={{ margin:'0 0 16px', fontSize:14, fontWeight:800, color:'#111827' }}>TVA — Taux {(TVA_RATE*100).toFixed(2)}%</h3>
          {[
            { l:'Collectée', v:TVA_DATA.collectee, c:'#dc2626' },
            { l:'Déductible', v:TVA_DATA.deductible, c:'#16a34a' },
            { l:'À verser DGI', v:TVA_DATA.aVerser, c:'#d97706', big:true },
          ].map(t => (
            <div key={t.l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:t.big?'none':'1px solid #f3f4f6' }}>
              <span style={{ fontSize:t.big?13:12, fontWeight:t.big?700:400, color:'#6b7280' }}>{t.l}</span>
              <span style={{ fontSize:t.big?16:13, fontWeight:t.big?900:700, color:t.c }}>{fmtN(t.v)} FCFA</span>
            </div>
          ))}
          <div style={{ marginTop:12, padding:10, background:'#fff7ed', borderRadius:9, border:'1px solid #fed7aa' }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#d97706' }}>⚠️ Prochaine déclaration</div>
            <div style={{ fontSize:13, fontWeight:700, color:'#92400e', marginTop:2 }}>{fmtDate(TVA_DATA.echeance)}</div>
          </div>
        </div>
      </div>

      <div style={{ background:'white', borderRadius:16, border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid #e5e7eb', display:'flex', justifyContent:'space-between' }}>
          <h3 style={{ margin:0, fontSize:14, fontWeight:800, color:'#111827' }}>Factures récentes</h3>
          <button onClick={()=>onNavigate('factures')} style={{ fontSize:12, fontWeight:700, color:'#1d4ed8', background:'none', border:'none', cursor:'pointer' }}>Voir toutes →</button>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
            <thead><tr style={{ background:'#f8fafc' }}>{['Numéro','Client','Montant TTC','Devise','Échéance','Statut'].map(h=><Th key={h}>{h}</Th>)}</tr></thead>
            <tbody>
              {factures.slice(0,5).map((f,i) => (
                <tr key={f.id} style={{ borderBottom:'1px solid #f3f4f6', background:i%2===0?'white':'#fafbfc' }}>
                  <Td style={{ fontWeight:700, color:'#1d4ed8' }}>{f.numero}</Td>
                  <Td style={{ fontWeight:500 }}>{f.client}</Td>
                  <Td style={{ fontWeight:800 }}>{fmtN(f.montantTTC)}</Td>
                  <Td><DeviseTag devise={f.devise}/></Td>
                  <Td style={{ fontSize:12, color:new Date(f.dateEcheance)<new Date()&&f.status!=='paye'?'#dc2626':'#374151' }}>{fmtDate(f.dateEcheance)}</Td>
                  <Td><StatusBadge status={f.status}/></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ===== COMPOSANT RACINE =====
export default function Finance() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [factures, setFactures] = useState(FACTURES_DATA);
  const [depenses, setDepenses] = useState(DEPENSES_DATA);
  const [devise, setDevise] = useState('FCFA');
  const [periode, setPeriode] = useState('mois');

  return (
    <div style={{ minHeight:'100vh', background:'#f0f4ff', fontFamily:"'Segoe UI',Arial,sans-serif" }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0f172a,#1e3a5f)', padding:'22px 32px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:1400, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <div>
              <h1 style={{ fontSize:24, fontWeight:900, color:'white', margin:'0 0 5px', letterSpacing:-0.3 }}>💼 Finance & Comptabilité</h1>
              <p style={{ color:'#64748b', margin:0, fontSize:12 }}>OHADA · TVA {(TVA_RATE*100).toFixed(2)}% · FCFA / USD / EUR / CNY</p>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <div style={{ display:'flex', gap:5, background:'rgba(255,255,255,0.05)', borderRadius:10, padding:3 }}>
                {Object.keys(DEVISES_RATES).map(d => (
                  <button key={d} onClick={()=>setDevise(d)} style={{ padding:'6px 12px', borderRadius:8, border:'none', background:devise===d?'#1d4ed8':'transparent', color:'white', fontWeight:700, fontSize:12, cursor:'pointer' }}>{d}</button>
                ))}
              </div>
              {['Clôture mensuelle','Export comptable'].map(b => (
                <button key={b} style={{ padding:'9px 14px', borderRadius:9, border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.05)', color:'white', fontWeight:600, fontSize:12, cursor:'pointer' }}>{b}</button>
              ))}
            </div>
          </div>
          {/* Tabs */}
          <div style={{ display:'flex', gap:2 }}>
            {TABS_FINANCE.map(tab => (
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ padding:'10px 16px', borderRadius:'10px 10px 0 0', border:'none', background:activeTab===tab.id?'#f0f4ff':'transparent', color:activeTab===tab.id?'#1d4ed8':'rgba(255,255,255,0.55)', fontWeight:activeTab===tab.id?800:500, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6, transition:'all .15s' }}>
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ maxWidth:1400, margin:'0 auto', padding:'28px 32px' }}>
        {activeTab==='dashboard'   && <Dashboard factures={factures} depenses={depenses} onNavigate={setActiveTab}/>}
        {activeTab==='factures'    && <VueFactures factures={factures} setFactures={setFactures}/>}
        {activeTab==='depenses'    && <VueDepenses depenses={depenses} setDepenses={setDepenses}/>}
        {activeTab==='tva'         && <VueTVA/>}
        {activeTab==='cashflow'    && <VueCashflow/>}
        {activeTab==='comptabilite'&& <VuePlanComptable/>}
        {activeTab==='rapports'    && (
          <div style={{ padding:40, textAlign:'center', marginTop:40 }}>
            <div style={{ fontSize:56, marginBottom:14 }}>📈</div>
            <h2 style={{ fontSize:22, fontWeight:800, color:'#111827', marginBottom:8 }}>Rapports financiers</h2>
            <p style={{ color:'#6b7280', marginBottom:20 }}>P&L · Bilan · Compte de résultat OHADA · Liasses fiscales</p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              {['P&L Mensuel','Bilan annuel','Compte résultat OHADA','Liasse fiscale DGI','Rapport TVA','Balance générale'].map(r => (
                <button key={r} style={{ padding:'11px 18px', borderRadius:11, border:'1px solid #e5e7eb', background:'white', color:'#374151', fontWeight:700, fontSize:13, cursor:'pointer' }}>📄 {r}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
