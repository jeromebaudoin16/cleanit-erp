import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// ================================================================
//  CLEANIT FINANCE — Module comptable complet
//  QuickBooks Enterprise + SYSCOHADA/OHADA + TVA 19.25% Cameroun
//  Lié à : Terrain, Approvals, Projets, RH, BI, Dashboard
// ================================================================

// ===== DESIGN TOKENS =====
const C = {
  // Palette principale — vert financier premium
  primary:    '#0F7B3C', // vert foncé premium
  primary_l:  '#E8F5EE',
  primary_m:  '#1a9e50',
  // Accents
  blue:       '#0B5CD7',
  blue_l:     '#EEF4FF',
  red:        '#C8281E',
  red_l:      '#FEF2F2',
  orange:     '#D97706',
  orange_l:   '#FFFBEB',
  purple:     '#6D28D9',
  purple_l:   '#F5F3FF',
  teal:       '#0D9488',
  teal_l:     '#F0FDFA',
  // Neutres
  text:       '#111827',
  text2:      '#374151',
  text3:      '#6B7280',
  text4:      '#9CA3AF',
  border:     '#E5E7EB',
  border2:    '#F3F4F6',
  bg:         '#F9FAFB',
  bg2:        '#F3F4F6',
  white:      '#FFFFFF',
  // Sidebar
  sidebar:    '#111827',
  sidebar2:   '#1F2937',
};

const TVA = 0.1925;
const FX  = { FCFA:1, USD:610, EUR:660, CNY:84 };

// ===== FORMATTERS =====
const fmtN  = n  => new Intl.NumberFormat('fr-FR').format(Math.round(n||0));
const fmtM  = n  => { const a=Math.abs(n||0); return a>=1e9?`${(n/1e9).toFixed(2)}Md`:a>=1e6?`${(n/1e6).toFixed(1)}M`:a>=1e3?`${(n/1e3).toFixed(0)}K`:`${Math.round(n||0)}`; };
const fmtD  = d  => d?new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}):'—';
const fmtD2 = d  => d?new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'}):'—';
const toFCFA= (m,d) => m*(FX[d]||1);

// ===== ICONS SVG =====
const SVG_PATHS = {
  home:        'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  invoice:     'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  expense:     'M21 4H3 M21 4v14a2 2 0 01-2 2H5a2 2 0 01-2-2V4 M12 9v4 M12 17h.01',
  bank:        'M3 21h18 M3 10h18 M5 6l7-3 7 3 M4 10v11 M20 10v11 M8 14v3 M12 14v3 M16 14v3',
  chart:       'M18 20V10 M12 20V4 M6 20v-6',
  report:      'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  tax:         'M9 14l2 2 4-4 M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  vendor:      'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
  cashflow:    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
  payroll:     'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  ohada:       'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  job:         'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
  ai:          'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  bc:          'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2',
  plus:        'M12 5v14 M5 12h14',
  search:      'M21 21l-4.35-4.35 M17 11A6 6 0 115 11a6 6 0 0112 0z',
  close:       'M18 6L6 18 M6 6l12 12',
  check:       'M20 6L9 17l-5-5',
  chevron_r:   'M9 18l6-6-6-6',
  chevron_d:   'M6 9l6 6 6-6',
  edit:        'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  download:    'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  print:       'M6 9V2h12v7 M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2 M6 14h12v8H6z',
  mail:        'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  alert:       'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01',
  lock:        'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4',
  link:        'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71',
  calendar:    'M8 2v4 M16 2v4 M3 10h18 M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  filter:      'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
  refresh:     'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15',
  terrain:     'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z',
  money:       'M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  trend_up:    'M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6',
  trend_down:  'M23 18l-9.5-9.5-5 5L1 6 M17 18h6v-6',
  eye:         'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z',
  eye_off:     'M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24 M1 1l22 22',
  info:        'M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 16v-4 M12 8h.01',
};

const Ico = ({n,s=16,c='currentColor'}) => {
  const d = SVG_PATHS[n]; if(!d) return null;
  return(
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c}
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{display:'block',flexShrink:0}}>
      {d.split(' M ').map((seg,i)=><path key={i} d={i===0?seg:`M ${seg}`}/>)}
    </svg>
  );
};

// ===== DONNÉES COMPLÈTES =====
const CLIENTS_LIST  = ['MTN Cameroun','Orange Cameroun','Huawei Technologies','Nexttel Cameroun','Gouvernement Cameroun','CAMTEL','Entreprise Privée','Ericsson Cameroun'];
const DEVISES_LIST  = ['FCFA','USD','EUR','CNY'];
const FOURNISSEURS  = ['Huawei Technologies','Nokia Networks','Ericsson','Total Énergies','CAMTEL','Afriland First Bank','Fournisseur local','BICEC'];
const CATEGORIES_CH = ['Équipements réseau','Main d\'œuvre','Transport & Logistique','Hébergement','Matériel consommable','Télécoms','Maintenance préventive','Per diem terrain','Sous-traitance','Frais généraux','Impôts & Taxes','Salaires'];
const MODES_PAI     = ['Virement bancaire','Mobile Money MTN','Mobile Money Orange','Chèque','Espèces','Virement international SWIFT'];
const BANQUES_LIST  = ['BICEC','Société Générale Cameroun','Afriland First Bank','UBA','Ecobank'];
const PROJETS_REF   = ['PROJ-2024-001 · DLA-001','PROJ-2024-002 · YDE-001','PROJ-2024-003 · GAR-001','PROJ-2024-004 · LIM-001','PROJ-2024-005 · BFN-001','PROJ-2024-006 · MAR-001'];
const BC_REF        = ['BC-HW-2024-143','BC-HW-2024-141','BC-HW-2024-139','BC-HW-2024-135','BC-HW-2024-148','BC-HW-2024-149'];

// Plan comptable SYSCOHADA complet
const PLAN_COMPTABLE = [
  { classe:'1', label:'Comptes de capitaux propres', color:C.primary,
    comptes:[
      {num:'101',label:'Capital social',solde:50000000,type:'P'},
      {num:'106',label:'Réserves légales',solde:8500000,type:'P'},
      {num:'110',label:'Report à nouveau',solde:12000000,type:'P'},
      {num:'120',label:'Résultat de l\'exercice',solde:33000000,type:'P'},
      {num:'161',label:'Emprunts bancaires',solde:-15000000,type:'P'},
      {num:'164',label:'Dettes financières diverses',solde:-3500000,type:'P'},
    ]
  },
  { classe:'2', label:'Comptes d\'immobilisations', color:C.blue,
    comptes:[
      {num:'211',label:'Terrains',solde:0,type:'A'},
      {num:'221',label:'Bâtiments',solde:5000000,type:'A'},
      {num:'241',label:'Matériel et outillage',solde:18500000,type:'A'},
      {num:'244',label:'Matériel informatique',solde:4200000,type:'A'},
      {num:'245',label:'Mobilier de bureau',solde:1800000,type:'A'},
      {num:'281',label:'Amortissements bâtiments',solde:-500000,type:'A'},
      {num:'284',label:'Amortissements matériel',solde:-3700000,type:'A'},
    ]
  },
  { classe:'3', label:'Comptes de stocks', color:C.teal,
    comptes:[
      {num:'321',label:'Matières premières',solde:2500000,type:'A'},
      {num:'322',label:'Fournitures consommables',solde:1200000,type:'A'},
      {num:'371',label:'Marchandises',solde:8500000,type:'A'},
    ]
  },
  { classe:'4', label:'Comptes de tiers', color:C.orange,
    comptes:[
      {num:'411',label:'Clients — MTN Cameroun',solde:28500000,type:'A'},
      {num:'412',label:'Clients — Orange Cameroun',solde:10195875,type:'A'},
      {num:'413',label:'Clients — Gouvernement',solde:38160000,type:'A'},
      {num:'401',label:'Fournisseurs — Huawei',solde:-28500000,type:'P'},
      {num:'421',label:'Personnel — Salaires à payer',solde:-4500000,type:'P'},
      {num:'441',label:'État — TVA collectée',solde:-8450000,type:'P'},
      {num:'442',label:'État — TVA déductible',solde:3200000,type:'A'},
      {num:'444',label:'État — IS à payer',solde:-6500000,type:'P'},
      {num:'447',label:'Retenues à la source',solde:-1200000,type:'P'},
    ]
  },
  { classe:'5', label:'Comptes de trésorerie', color:C.primary,
    comptes:[
      {num:'521',label:'Banque BICEC — Compte principal',solde:45200000,type:'A'},
      {num:'522',label:'Banque SGC — Compte opérationnel',solde:12500000,type:'A'},
      {num:'531',label:'Caisse principale',solde:850000,type:'A'},
      {num:'571',label:'Virements en cours',solde:2100000,type:'A'},
    ]
  },
  { classe:'6', label:'Comptes de charges', color:C.red,
    comptes:[
      {num:'601',label:'Achats de marchandises',solde:-8500000,type:'C'},
      {num:'604',label:'Achats d\'équipements réseau',solde:-28500000,type:'C'},
      {num:'624',label:'Transport et déplacements',solde:-2850000,type:'C'},
      {num:'626',label:'Frais télécoms',solde:-1200000,type:'C'},
      {num:'631',label:'Frais bancaires',solde:-450000,type:'C'},
      {num:'641',label:'Salaires et traitements',solde:-18000000,type:'C'},
      {num:'645',label:'Charges sociales patronales',solde:-4320000,type:'C'},
      {num:'651',label:'Sous-traitance techniciens ext.',solde:-9500000,type:'C'},
      {num:'661',label:'Intérêts bancaires',solde:-850000,type:'C'},
      {num:'691',label:'Impôts sur les sociétés',solde:-6500000,type:'C'},
    ]
  },
  { classe:'7', label:'Comptes de produits', color:C.primary,
    comptes:[
      {num:'701',label:'Ventes de services — Réseau',solde:85000000,type:'P'},
      {num:'702',label:'Ventes services ingénierie',solde:32000000,type:'P'},
      {num:'704',label:'Études et prestations techniques',solde:18500000,type:'P'},
      {num:'751',label:'Subventions d\'exploitation',solde:0,type:'P'},
      {num:'771',label:'Produits financiers',solde:1200000,type:'P'},
    ]
  },
];

// Factures enrichies
const SEED_FACTURES = [
  {id:1,numero:'FAC-2024-001',client:'MTN Cameroun',projet:'PROJ-2024-001 · DLA-001',bcRef:'BC-HW-2024-143',
   lignes:[{desc:'Installation antennes 5G NR — DLA-001',qte:1,pu:8500000,tva:true},{desc:'Main d\'œuvre techniciens (15j)',qte:15,pu:350000,tva:true},{desc:'Matériel consommable & câblage',qte:1,pu:450000,tva:false}],
   montantHT:14050000,tva:2709625,montantTTC:16759625,status:'paye',
   dateEmission:'2024-01-15',dateEcheance:'2024-02-15',devise:'FCFA',modePaiement:'Virement bancaire',
   notes:'Paiement reçu le 12/02/2024. Projet clôturé.',
   acomptes:[{date:'2024-01-20',montant:5000000,ref:'VIR-2024-001',mode:'Virement bancaire'}],
   compteCClient:'411',compteRevenu:'701'},
  {id:2,numero:'FAC-2024-002',client:'Orange Cameroun',projet:'PROJ-2024-002 · YDE-001',bcRef:'BC-HW-2024-141',
   lignes:[{desc:'Déploiement 4G LTE — YDE-001',qte:1,pu:7200000,tva:true},{desc:'Configuration et tests réseau',qte:1,pu:1350000,tva:true}],
   montantHT:8550000,tva:1645875,montantTTC:10195875,status:'en_retard',
   dateEmission:'2024-01-28',dateEcheance:'2024-03-01',devise:'FCFA',modePaiement:'Chèque',
   notes:'Relance envoyée le 05/03/2024. 2ème relance planifiée.',
   acomptes:[],compteCClient:'412',compteRevenu:'701'},
  {id:3,numero:'FAC-2024-003',client:'Huawei Technologies',projet:'PROJ-2024-001 · DLA-001',bcRef:'BC-HW-2024-143',
   lignes:[{desc:'Engineering services 5G NR',qte:40,pu:850,tva:false},{desc:'Technical site supervision',qte:10,pu:1200,tva:false}],
   montantHT:46000,tva:0,montantTTC:46000,status:'envoye',
   dateEmission:'2024-02-10',dateEcheance:'2024-03-15',devise:'USD',modePaiement:'Virement international SWIFT',
   notes:'Facture en USD. Conversion au taux du jour.',
   acomptes:[],compteCClient:'411',compteRevenu:'702'},
  {id:4,numero:'FAC-2024-004',client:'Gouvernement Cameroun',projet:'PROJ-2024-003 · GAR-001',bcRef:'BC-HW-2024-139',
   lignes:[{desc:'Infrastructure télécom zones rurales',qte:1,pu:27000000,tva:true},{desc:'Maintenance préventive annuelle',qte:1,pu:5000000,tva:true}],
   montantHT:32000000,tva:6160000,montantTTC:38160000,status:'partiel',
   dateEmission:'2024-02-01',dateEcheance:'2024-04-01',devise:'FCFA',modePaiement:'Virement bancaire',
   notes:'Acompte 30% reçu via Trésor public. Reste 70% après réception.',
   acomptes:[{date:'2024-02-15',montant:11448000,ref:'TRESOR-2024-001',mode:'Virement bancaire'}],
   compteCClient:'413',compteRevenu:'704'},
  {id:5,numero:'DEV-2024-001',client:'Nexttel Cameroun',projet:'PROJ-2024-004 · LIM-001',bcRef:'',
   lignes:[{desc:'Survey réseau LIM-001',qte:1,pu:3500000,tva:true},{desc:'Rapport technique détaillé',qte:1,pu:800000,tva:true}],
   montantHT:4300000,tva:827750,montantTTC:5127750,status:'brouillon',
   dateEmission:'2024-03-01',dateEcheance:'2024-04-01',devise:'FCFA',modePaiement:'Virement bancaire',
   notes:'',acomptes:[],compteCClient:'411',compteRevenu:'704'},
  {id:6,numero:'FAC-2024-005',client:'CAMTEL',projet:'PROJ-2024-005 · BFN-001',bcRef:'BC-HW-2024-148',
   lignes:[{desc:'Installation fibre optique 50km',qte:50,pu:1200000,tva:true}],
   montantHT:60000000,tva:11550000,montantTTC:71550000,status:'envoye',
   dateEmission:'2024-03-10',dateEcheance:'2024-05-10',devise:'FCFA',modePaiement:'Virement bancaire',
   notes:'Projet fibre Bafoussam-Nord.',
   acomptes:[],compteCClient:'411',compteRevenu:'701'},
];

// Dépenses enrichies
const SEED_DEPENSES = [
  {id:1,numero:'DEP-2024-001',fournisseur:'Huawei Technologies',description:'Équipements 5G NR DLA-001 — BBU+RRU',categorie:'Équipements réseau',montant:28500000,devise:'FCFA',date:'2024-01-15',status:'paye',projet:'PROJ-2024-001 · DLA-001',bcRef:'BC-HW-2024-143',compteCharge:'604',compteFourn:'401',tva_deductible:true},
  {id:2,numero:'DEP-2024-002',fournisseur:'Nokia Networks',description:'Antennes 4G LTE x12 — LIM-001',categorie:'Équipements réseau',montant:15200,devise:'USD',date:'2024-02-01',status:'en_attente',projet:'PROJ-2024-004 · LIM-001',bcRef:'',compteCharge:'604',compteFourn:'401',tva_deductible:false},
  {id:3,numero:'DEP-2024-003',fournisseur:'Total Énergies',description:'Carburant véhicules terrain — Jan 2024',categorie:'Transport & Logistique',montant:850000,devise:'FCFA',date:'2024-01-31',status:'paye',projet:'Général',bcRef:'',compteCharge:'624',compteFourn:'401',tva_deductible:true},
  {id:4,numero:'DEP-2024-004',fournisseur:'CAMTEL',description:'Liaisons fibre optique backbone Q1',categorie:'Télécoms',montant:1200000,devise:'FCFA',date:'2024-02-15',status:'en_attente',projet:'Général',bcRef:'',compteCharge:'626',compteFourn:'401',tva_deductible:true},
  {id:5,numero:'DEP-2024-005',fournisseur:'Ericsson Cameroun',description:'Maintenance préventive 3G/4G réseau',categorie:'Maintenance préventive',montant:8500,devise:'EUR',date:'2024-02-20',status:'paye',projet:'PROJ-2024-003 · GAR-001',bcRef:'BC-HW-2024-139',compteCharge:'604',compteFourn:'401',tva_deductible:false},
  {id:6,numero:'DEP-2024-006',fournisseur:'Fournisseur local',description:'Per diem techniciens terrain — Garoua',categorie:'Per diem terrain',montant:1800000,devise:'FCFA',date:'2024-02-25',status:'paye',projet:'PROJ-2024-003 · GAR-001',bcRef:'BC-HW-2024-139',compteCharge:'651',compteFourn:'401',tva_deductible:false},
  {id:7,numero:'SAL-2024-001',fournisseur:'Paie Mars 2024',description:'Salaires personnel interne — Mars 2024',categorie:'Salaires',montant:18000000,devise:'FCFA',date:'2024-03-30',status:'paye',projet:'Général',bcRef:'',compteCharge:'641',compteFourn:'421',tva_deductible:false},
];

// Données BC Huawei avec prix réels (visible Finance uniquement)
const BC_HUAWEI_COMPLETS = [
  {id:'BC-HW-2024-143',site:'DLA-001',type:'5G NR Installation',client:'MTN Cameroun',
   montantHuawei:180000000,montantNego:165000000,marge:15000000,devise:'FCFA',
   statut:'en_cours',dateReception:'2024-03-10',
   lignesDetail:[
     {desc:'BBU 5900 5G NR',qte:2,pu:25000000,total:50000000},
     {desc:'RRU 5258 4T4R',qte:6,pu:8500000,total:51000000},
     {desc:'Installation & câblage',qte:1,pu:35000000,total:35000000},
     {desc:'Engineering services',qte:1,pu:44000000,total:44000000},
   ]},
  {id:'BC-HW-2024-141',site:'LIM-001',type:'Survey RF',client:'Orange Cameroun',
   montantHuawei:45000000,montantNego:38000000,marge:7000000,devise:'FCFA',
   statut:'en_cours',dateReception:'2024-03-12',
   lignesDetail:[
     {desc:'Survey RF terrain',qte:1,pu:20000000,total:20000000},
     {desc:'Rapport technique',qte:1,pu:15000000,total:15000000},
     {desc:'Optimisation paramètres',qte:1,pu:10000000,total:10000000},
   ]},
  {id:'BC-HW-2024-139',site:'GAR-001',type:'Maintenance HSE',client:'Nexttel',
   montantHuawei:35000000,montantNego:29000000,marge:6000000,devise:'FCFA',
   statut:'termine',dateReception:'2024-03-08',
   lignesDetail:[
     {desc:'Inspection HSE pylône',qte:1,pu:15000000,total:15000000},
     {desc:'Mise aux normes sécurité',qte:1,pu:12000000,total:12000000},
     {desc:'Rapport conformité',qte:1,pu:8000000,total:8000000},
   ]},
  {id:'BC-HW-2024-148',site:'BFN-001',type:'5G NR Installation',client:'CAMTEL',
   montantHuawei:220000000,montantNego:195000000,marge:25000000,devise:'FCFA',
   statut:'en_attente',dateReception:'2024-03-15',
   lignesDetail:[
     {desc:'BBU 5900 5G NR x3',qte:3,pu:25000000,total:75000000},
     {desc:'RRU 5258 x9',qte:9,pu:8500000,total:76500000},
     {desc:'Fibre backbone 20km',qte:20,pu:2000000,total:40000000},
     {desc:'Installation complète',qte:1,pu:28500000,total:28500000},
   ]},
];

// Données trésorerie mensuelle
const TRESORERIE_DATA = [
  {mois:'Sep',entrees:18500000,sorties:12000000,solde:45000000},
  {mois:'Oct',entrees:22000000,sorties:14500000,solde:52500000},
  {mois:'Nov',entrees:28000000,sorties:16000000,solde:64500000},
  {mois:'Déc',entrees:35000000,sorties:22000000,solde:77500000},
  {mois:'Jan',entrees:25000000,sorties:18000000,solde:84500000},
  {mois:'Fév',entrees:31000000,sorties:19500000,solde:96000000},
  {mois:'Mar',entrees:42000000,sorties:25000000,solde:113000000},
];

// Données paie
const SEED_PAIE = [
  {id:1,matricule:'CLN-INT-001',nom:'Marie Kamga',poste:'Chef de Projet Senior',dept:'Opérations',salaireBrut:850000,cnps:61200,irpp:95000,autresDed:0,salaireNet:693800,statut:'paye',mois:'Mars 2024'},
  {id:2,matricule:'CLN-INT-002',nom:'Jean Fouda',poste:'Project Manager',dept:'Opérations',salaireBrut:750000,cnps:54000,irpp:75000,autresDed:0,salaireNet:621000,statut:'paye',mois:'Mars 2024'},
  {id:3,matricule:'CLN-INT-003',nom:'Pierre Etoga',poste:'Ingénieur Réseau Senior',dept:'Technique',salaireBrut:900000,cnps:64800,irpp:110000,autresDed:0,salaireNet:725200,statut:'paye',mois:'Mars 2024'},
  {id:4,matricule:'CLN-INT-004',nom:'Alice Finance',poste:'Directrice Financière',dept:'Finance',salaireBrut:1200000,cnps:86400,irpp:185000,autresDed:0,salaireNet:928600,statut:'en_attente',mois:'Mars 2024'},
  {id:5,matricule:'CLN-INT-005',nom:'Bob Comptable',poste:'Chef Comptable',dept:'Finance',salaireBrut:750000,cnps:54000,irpp:75000,autresDed:0,salaireNet:621000,statut:'en_attente',mois:'Mars 2024'},
];

// Journaux comptables
const SEED_JOURNAUX = [
  {id:1,date:'2024-03-15',journal:'VTE',libelle:'FAC-2024-001 — MTN Cameroun — Installation 5G NR',debit:411,credit:701,montantD:16759625,montantC:14050000,tvaC:2709625,ref:'FAC-2024-001'},
  {id:2,date:'2024-03-15',journal:'BQ',libelle:'Règlement VIR-2024-001 — MTN Cameroun',debit:521,credit:411,montantD:5000000,montantC:5000000,tvaC:0,ref:'VIR-2024-001'},
  {id:3,date:'2024-03-16',journal:'ACH',libelle:'DEP-2024-001 — Huawei Technologies — Équipements 5G',debit:604,credit:401,montantD:28500000,montantC:28500000,tvaC:0,ref:'DEP-2024-001'},
  {id:4,date:'2024-03-20',journal:'OD',libelle:'Salaires Mars 2024 — 5 agents',debit:641,credit:421,montantD:18000000,montantC:18000000,tvaC:0,ref:'SAL-2024-001'},
  {id:5,date:'2024-03-25',journal:'TVA',libelle:'Déclaration TVA Fév 2024 — Solde à payer',debit:441,credit:521,montantD:8450000,montantC:8450000,tvaC:0,ref:'TVA-FEV-2024'},
  {id:6,date:'2024-03-28',journal:'VTE',libelle:'FAC-2024-004 — Gouvernement — Acompte 30%',debit:521,credit:413,montantD:11448000,montantC:11448000,tvaC:0,ref:'TRESOR-2024-001'},
];

// ===== COMPOSANTS UI =====
const Badge = ({status, label, color, bg}) => {
  const cfg = {
    paye:       {l:'Payée',       c:C.primary,   b:C.primary_l},
    envoye:     {l:'Envoyée',     c:C.blue,      b:C.blue_l},
    en_retard:  {l:'En retard',   c:C.red,       b:C.red_l},
    partiel:    {l:'Partiel',     c:C.orange,    b:C.orange_l},
    brouillon:  {l:'Brouillon',   c:C.text3,     b:C.bg2},
    annule:     {l:'Annulée',     c:C.text4,     b:C.bg2},
    en_attente: {l:'En attente',  c:C.orange,    b:C.orange_l},
    valide:     {l:'Validée',     c:C.primary,   b:C.primary_l},
    en_cours:   {l:'En cours',    c:C.blue,      b:C.blue_l},
    termine:    {l:'Terminé',     c:C.primary,   b:C.primary_l},
  }[status]||{l:label||status,c:color||C.text3,b:bg||C.bg2};
  return(
    <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',borderRadius:20,background:cfg.b,color:cfg.c,fontSize:11,fontWeight:600,whiteSpace:'nowrap'}}>
      <span style={{width:5,height:5,borderRadius:'50%',background:cfg.c,flexShrink:0}}/>
      {cfg.l}
    </span>
  );
};

const Btn = ({label,onClick,variant='default',icon,sm,full,disabled}) => {
  const s = {
    primary: {bg:C.primary,     c:'white',      border:'none'},
    success: {bg:C.primary,     c:'white',      border:'none'},
    danger:  {bg:C.red,         c:'white',      border:'none'},
    blue:    {bg:C.blue,        c:'white',       border:'none'},
    default: {bg:C.white,       c:C.text2,      border:`1px solid ${C.border}`},
    ghost:   {bg:'transparent', c:C.text3,      border:`1px solid ${C.border}`},
    dark:    {bg:C.sidebar,     c:'white',       border:'none'},
  }[variant]||{bg:C.white,c:C.text2,border:`1px solid ${C.border}`};
  return(
    <button onClick={onClick} disabled={disabled}
      style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6,
        padding:sm?'5px 11px':'8px 16px',borderRadius:6,border:s.border,
        background:disabled?C.bg2:s.bg,color:disabled?C.text4:s.c,
        fontWeight:600,fontSize:sm?11:13,cursor:disabled?'not-allowed':'pointer',
        fontFamily:'inherit',width:full?'100%':'auto',transition:'opacity .15s',opacity:1}}
      onMouseEnter={e=>{if(!disabled)e.currentTarget.style.opacity='.85'}}
      onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
      {icon&&<Ico n={icon} s={sm?12:14} c={disabled?C.text4:s.c}/>}
      {label}
    </button>
  );
};

const Input = ({type='text',value,onChange,placeholder,min,max,disabled,small,prefix,suffix}) => (
  <div style={{position:'relative',display:'flex',alignItems:'center'}}>
    {prefix&&<span style={{position:'absolute',left:10,fontSize:13,color:C.text3,pointerEvents:'none'}}>{prefix}</span>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)}
      placeholder={placeholder||''} min={min} max={max} disabled={disabled}
      style={{width:'100%',padding:small?'6px 10px':'9px 12px',paddingLeft:prefix?28:small?10:12,paddingRight:suffix?28:small?10:12,
        borderRadius:6,border:`1px solid ${C.border}`,fontSize:13,color:disabled?C.text4:C.text,
        background:disabled?C.bg2:C.white,boxSizing:'border-box',outline:'none',fontFamily:'inherit',transition:'border-color .15s'}}
      onFocus={e=>e.target.style.borderColor=C.primary}
      onBlur={e=>e.target.style.borderColor=C.border}/>
    {suffix&&<span style={{position:'absolute',right:10,fontSize:13,color:C.text3,pointerEvents:'none'}}>{suffix}</span>}
  </div>
);

const Select = ({value,onChange,options,placeholder,small}) => (
  <select value={value} onChange={e=>onChange(e.target.value)}
    style={{width:'100%',padding:small?'6px 10px':'9px 12px',borderRadius:6,
      border:`1px solid ${C.border}`,fontSize:13,color:value?C.text:C.text4,
      background:C.white,cursor:'pointer',outline:'none',fontFamily:'inherit',transition:'border-color .15s'}}
    onFocus={e=>e.target.style.borderColor=C.primary}
    onBlur={e=>e.target.style.borderColor=C.border}>
    <option value="">{placeholder||'Sélectionner...'}</option>
    {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
  </select>
);

const Textarea = ({value,onChange,placeholder,rows=3}) => (
  <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{width:'100%',padding:'9px 12px',borderRadius:6,border:`1px solid ${C.border}`,
      fontSize:13,color:C.text,background:C.white,resize:'vertical',
      boxSizing:'border-box',outline:'none',fontFamily:'inherit'}}
    onFocus={e=>e.target.style.borderColor=C.primary}
    onBlur={e=>e.target.style.borderColor=C.border}/>
);

const Field = ({label,children,required,span}) => (
  <div style={{gridColumn:span?'1/-1':'auto'}}>
    <label style={{display:'block',fontSize:12,fontWeight:600,color:C.text3,marginBottom:5}}>
      {label}{required&&<span style={{color:C.red,marginLeft:2}}>*</span>}
    </label>
    {children}
  </div>
);

const Card = ({children,style,onClick}) => (
  <div onClick={onClick}
    style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,overflow:'hidden',
      cursor:onClick?'pointer':'default',transition:'box-shadow .15s',...style}}
    onMouseEnter={e=>{if(onClick)e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,.08)'}}
    onMouseLeave={e=>{if(onClick)e.currentTarget.style.boxShadow='none'}}>
    {children}
  </div>
);

const CardHead = ({title,sub,action,icon,color=C.primary}) => (
  <div style={{padding:'13px 18px',borderBottom:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
    <div style={{display:'flex',alignItems:'center',gap:9}}>
      {icon&&<div style={{width:30,height:30,borderRadius:7,background:`${color}15`,display:'flex',alignItems:'center',justifyContent:'center'}}><Ico n={icon} s={15} c={color}/></div>}
      <div>
        <div style={{fontSize:13,fontWeight:700,color:C.text}}>{title}</div>
        {sub&&<div style={{fontSize:10,color:C.text4,marginTop:1}}>{sub}</div>}
      </div>
    </div>
    {action}
  </div>
);

// Slide Panel
const SlidePanel = ({title,sub,onClose,children,width=680}) => (
  <div style={{position:'fixed',inset:0,zIndex:500,display:'flex',justifyContent:'flex-end'}}>
    <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(0,0,0,.45)',backdropFilter:'blur(3px)'}}/>
    <div style={{position:'relative',width,maxWidth:'96vw',height:'100vh',background:C.white,
      boxShadow:'-8px 0 40px rgba(0,0,0,.15)',display:'flex',flexDirection:'column',overflow:'hidden',
      animation:'slideIn .25s ease'}}>
      <div style={{padding:'15px 22px',borderBottom:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center',background:C.white,flexShrink:0}}>
        <div>
          {sub&&<div style={{fontSize:10,color:C.text4,textTransform:'uppercase',letterSpacing:.5,marginBottom:2}}>{sub}</div>}
          <div style={{fontSize:17,fontWeight:700,color:C.text}}>{title}</div>
        </div>
        <button onClick={onClose} style={{width:30,height:30,borderRadius:6,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Ico n="close" s={15} c={C.text3}/>
        </button>
      </div>
      <div style={{flex:1,overflow:'auto',padding:'20px 22px'}}>{children}</div>
    </div>
  </div>
);

// Table générique
const Table = ({cols,rows,onRowClick,empty='Aucune donnée'}) => (
  <div style={{border:`1px solid ${C.border}`,borderRadius:8,overflow:'hidden'}}>
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',minWidth:500}}>
        <thead>
          <tr style={{background:C.bg,borderBottom:`1px solid ${C.border}`}}>
            {cols.map(col=>(
              <th key={col} style={{padding:'9px 14px',textAlign:'left',fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:.4,whiteSpace:'nowrap'}}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length===0&&<tr><td colSpan={cols.length} style={{padding:'40px',textAlign:'center',color:C.text4,fontSize:13}}>{empty}</td></tr>}
          {rows.map((row,i)=>(
            <tr key={i} onClick={()=>onRowClick&&onRowClick(i)}
              style={{borderBottom:`1px solid ${C.border}`,cursor:onRowClick?'pointer':'default',transition:'background .1s'}}
              onMouseEnter={e=>{if(onRowClick)e.currentTarget.style.background=C.primary_l}}
              onMouseLeave={e=>{if(onRowClick)e.currentTarget.style.background=i%2===0?C.white:'#FAFAFA'}}>
              {row.map((cell,j)=>(
                <td key={j} style={{padding:'11px 14px',fontSize:13,color:C.text,verticalAlign:'middle',background:i%2===0?C.white:'#FAFAFA'}}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// KPI Card
const KpiCard = ({title,value,sub,trend,color=C.primary,icon,onClick,badge}) => (
  <Card onClick={onClick} style={{padding:'18px 20px',borderLeft:`4px solid ${color}`}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
      <div style={{fontSize:11,fontWeight:600,color:C.text3,textTransform:'uppercase',letterSpacing:.5,maxWidth:'70%'}}>{title}</div>
      <div style={{width:32,height:32,borderRadius:8,background:`${color}15`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
        <Ico n={icon} s={16} c={color}/>
      </div>
    </div>
    <div style={{fontSize:26,fontWeight:800,color,lineHeight:1,marginBottom:4}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:C.text4,marginBottom:6}}>{sub}</div>}
    {trend!==undefined&&(
      <div style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:11,fontWeight:600,color:trend>=0?C.primary:C.red,background:trend>=0?C.primary_l:C.red_l,padding:'2px 8px',borderRadius:20}}>
        <Ico n={trend>=0?'trend_up':'trend_down'} s={11} c={trend>=0?C.primary:C.red}/>
        {Math.abs(trend)}% vs M-1
      </div>
    )}
    {badge&&<div style={{marginTop:6,display:'inline-flex',alignItems:'center',gap:4,fontSize:10,fontWeight:600,color:badge.c,background:badge.b,padding:'2px 7px',borderRadius:20}}>{badge.l}</div>}
  </Card>
);

// Tooltip recharts custom
const CustomTooltip = ({active,payload,label,devise='FCFA'}) => {
  if(!active||!payload?.length) return null;
  return(
    <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:'10px 14px',boxShadow:'0 4px 16px rgba(0,0,0,.1)'}}>
      <div style={{fontSize:11,fontWeight:700,color:C.text3,marginBottom:6}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{display:'flex',gap:8,alignItems:'center',marginBottom:3}}>
          <div style={{width:10,height:10,borderRadius:2,background:p.color}}/>
          <span style={{fontSize:12,color:C.text}}>{p.name}: <strong>{fmtN(p.value)} {devise}</strong></span>
        </div>
      ))}
    </div>
  );
};

// ================================================================
//  MODULE 1 — DASHBOARD FINANCIER
// ================================================================
const DashboardFinance = ({factures,depenses,onNavigate}) => {
  const navigate = useNavigate();
  const totalCA   = factures.reduce((s,f)=>s+f.montantTTC,0);
  const totalDep  = depenses.reduce((s,d)=>s+toFCFA(d.montant,d.devise),0);
  const totalTVA  = factures.reduce((s,f)=>s+f.tva,0);
  const totalPaye = factures.filter(f=>f.status==='paye').reduce((s,f)=>s+f.montantTTC,0);
  const enRetard  = factures.filter(f=>f.status==='en_retard');
  const benefice  = totalCA - totalDep;

  const caParMois = TRESORERIE_DATA.map(d=>({mois:d.mois,CA:d.entrees,Charges:d.sorties,Marge:d.entrees-d.sorties}));

  const repartCA = [
    {name:'MTN Cameroun',value:42000000,color:C.primary},
    {name:'Gouvernement',value:38160000,color:C.blue},
    {name:'Orange Cameroun',value:10195875,color:C.orange},
    {name:'CAMTEL',value:71550000,color:C.teal},
    {name:'Autres',value:12000000,color:C.purple},
  ];

  return(
    <div>
      {/* Bandeau alerte IA */}
      {enRetard.length>0&&(
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 18px',background:'#FEF3C7',border:`1px solid ${C.orange}40`,borderRadius:9,marginBottom:18}}>
          <Ico n="alert" s={18} c={C.orange}/>
          <div style={{flex:1}}>
            <span style={{fontWeight:700,color:C.orange}}>IA Finance : </span>
            <span style={{fontSize:13,color:C.text2}}>{enRetard.length} facture(s) en retard — Total {fmtM(enRetard.reduce((s,f)=>s+f.montantTTC,0))} FCFA — Relances automatiques disponibles</span>
          </div>
          <Btn label="Voir les retards" variant="ghost" sm onClick={()=>onNavigate('factures')}/>
        </div>
      )}

      {/* KPIs principaux */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        <KpiCard title="Chiffre d'affaires" value={`${fmtM(totalCA)} FCFA`} sub={`${factures.length} factures`} trend={18} color={C.primary} icon="chart" onClick={()=>onNavigate('factures')}/>
        <KpiCard title="Charges totales" value={`${fmtM(totalDep)} FCFA`} sub={`${depenses.length} dépenses`} trend={-5} color={C.red} icon="expense" onClick={()=>onNavigate('depenses')}/>
        <KpiCard title="Bénéfice net" value={`${fmtM(benefice)} FCFA`} sub={`Marge ${Math.round(benefice/totalCA*100)}%`} trend={22} color={C.blue} icon="trend_up"/>
        <KpiCard title="TVA collectée" value={`${fmtM(totalTVA)} FCFA`} sub={`Taux ${(TVA*100).toFixed(2)}%`} color={C.purple} icon="tax" onClick={()=>onNavigate('tva')}
          badge={{l:'Déclaration mensuelle',c:C.orange,b:C.orange_l}}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:22}}>
        <KpiCard title="Encaissé" value={`${fmtM(totalPaye)} FCFA`} color={C.primary} icon="check"/>
        <KpiCard title="En attente" value={`${fmtM(totalCA-totalPaye)} FCFA`} color={C.orange} icon="invoice"/>
        <KpiCard title="Trésorerie" value={`${fmtM(58200000)} FCFA`} sub="Banques + Caisse" color={C.teal} icon="bank" onClick={()=>onNavigate('tresorerie')}/>
        <KpiCard title="Masse salariale" value={`${fmtM(18000000)} FCFA`} sub="Mars 2024" color={C.purple} icon="payroll" onClick={()=>onNavigate('paie')}/>
      </div>

      {/* Charts principaux */}
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginBottom:20}}>
        {/* Courbe CA vs Charges */}
        <Card>
          <CardHead title="Évolution CA, Charges & Marge" sub="6 derniers mois — FCFA" icon="chart"/>
          <div style={{padding:'16px 18px'}}>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={caParMois} margin={{top:5,right:10,left:10,bottom:0}}>
                <defs>
                  <linearGradient id="gCA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.primary} stopOpacity={.15}/>
                    <stop offset="95%" stopColor={C.primary} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gCh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.red} stopOpacity={.12}/>
                    <stop offset="95%" stopColor={C.red} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                <XAxis dataKey="mois" tick={{fontSize:11,fill:C.text3}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:C.text3}} axisLine={false} tickLine={false} tickFormatter={v=>fmtM(v)}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:12}}/>
                <Area type="monotone" dataKey="CA" name="CA" stroke={C.primary} strokeWidth={2.5} fill="url(#gCA)"/>
                <Area type="monotone" dataKey="Charges" name="Charges" stroke={C.red} strokeWidth={2} fill="url(#gCh)"/>
                <Line type="monotone" dataKey="Marge" name="Marge" stroke={C.blue} strokeWidth={2} dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Répartition CA par client */}
        <Card>
          <CardHead title="CA par client" sub="Répartition 2024" icon="vendor"/>
          <div style={{padding:'12px 16px'}}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={repartCA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {repartCA.map((e,i)=><Cell key={i} fill={e.color} stroke="none"/>)}
                </Pie>
                <Tooltip formatter={(v)=>[`${fmtM(v)} FCFA`,'CA']}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              {repartCA.map((e,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <div style={{width:9,height:9,borderRadius:2,background:e.color}}/>
                    <span style={{fontSize:11,color:C.text3}}>{e.name}</span>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,color:e.color}}>{fmtM(e.value)} F</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Alertes + Actions rapides */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        {/* Factures en retard */}
        <Card>
          <CardHead title="Factures en retard" icon="alert" color={C.red}
            action={<Btn label="Voir toutes" variant="ghost" sm onClick={()=>onNavigate('factures')}/>}/>
          <div>
            {enRetard.length===0?(
              <div style={{padding:'24px',textAlign:'center',color:C.text4,fontSize:13}}>Aucune facture en retard ✓</div>
            ):enRetard.map((f,i)=>(
              <div key={f.id} style={{display:'flex',gap:12,padding:'10px 16px',borderBottom:`1px solid ${C.border}`,alignItems:'center'}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.text}}>{f.numero}</div>
                  <div style={{fontSize:11,color:C.text3}}>{f.client} · Éch. {fmtD(f.dateEcheance)}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.red}}>{fmtM(f.montantTTC)} F</div>
                  <div style={{fontSize:10,color:C.text4}}>{Math.round((new Date()-new Date(f.dateEcheance))/(1000*60*60*24))}j de retard</div>
                </div>
                <Btn label="Relancer" variant="ghost" sm/>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions rapides + Liens modules */}
        <Card>
          <CardHead title="Actions rapides & Liens modules" icon="link" color={C.blue}/>
          <div style={{padding:'12px 14px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {[
              {label:'Nouvelle facture',   icon:'invoice',  color:C.primary, action:()=>onNavigate('factures')},
              {label:'Nouvelle dépense',   icon:'expense',  color:C.red,     action:()=>onNavigate('depenses')},
              {label:'Voir trésorerie',    icon:'bank',     color:C.teal,    action:()=>onNavigate('tresorerie')},
              {label:'Déclaration TVA',    icon:'tax',      color:C.purple,  action:()=>onNavigate('tva')},
              {label:'BC Huawei complets', icon:'bc',       color:C.orange,  action:()=>onNavigate('bc_huawei')},
              {label:'États OHADA',        icon:'ohada',    color:C.primary, action:()=>onNavigate('ohada')},
              {label:'Paie & Salaires',    icon:'payroll',  color:C.blue,    action:()=>onNavigate('paie')},
              {label:'Vers Terrain →',     icon:'terrain',  color:C.teal,    action:()=>navigate('/terrain')},
            ].map((a,i)=>(
              <button key={i} onClick={a.action}
                style={{display:'flex',alignItems:'center',gap:9,padding:'10px 12px',borderRadius:8,
                  border:`1px solid ${a.color}20`,background:`${a.color}08`,cursor:'pointer',
                  fontFamily:'inherit',transition:'all .15s'}}
                onMouseEnter={e=>{e.currentTarget.style.background=`${a.color}15`;e.currentTarget.style.borderColor=`${a.color}40`}}
                onMouseLeave={e=>{e.currentTarget.style.background=`${a.color}08`;e.currentTarget.style.borderColor=`${a.color}20`}}>
                <Ico n={a.icon} s={15} c={a.color}/>
                <span style={{fontSize:12,fontWeight:600,color:a.color}}>{a.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ================================================================
//  MODULE 2 — FACTURATION
// ================================================================
const VueFactures = ({factures,setFactures}) => {
  const [showForm, setShowForm]   = useState(false);
  const [detail,   setDetail]     = useState(null);
  const [filtre,   setFiltre]     = useState('tous');
  const [search,   setSearch]     = useState('');

  const filtered = factures.filter(f=>{
    const ms = !search||(f.numero+f.client+f.projet).toLowerCase().includes(search.toLowerCase());
    const mf = filtre==='tous'||f.status===filtre;
    return ms&&mf;
  });

  const totalFiltre = filtered.reduce((s,f)=>s+toFCFA(f.montantTTC,f.devise),0);

  const addFacture = (f) => setFactures(p=>[...p,f]);

  return(
    <div>
      <div style={{display:'flex',gap:10,marginBottom:16,alignItems:'center',flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,background:C.white,border:`1px solid ${C.border}`,borderRadius:7,padding:'7px 12px',flex:1,maxWidth:280}}>
          <Ico n="search" s={14} c={C.text4}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher facture, client..."
            style={{border:'none',outline:'none',fontSize:13,flex:1,fontFamily:'inherit',color:C.text,background:'transparent'}}/>
        </div>
        <div style={{display:'flex',gap:3,background:C.white,border:`1px solid ${C.border}`,borderRadius:7,overflow:'hidden'}}>
          {['tous','paye','envoye','en_retard','partiel','brouillon'].map(f=>(
            <button key={f} onClick={()=>setFiltre(f)}
              style={{padding:'6px 12px',border:'none',background:filtre===f?C.primary_l:'transparent',
                color:filtre===f?C.primary:C.text3,fontSize:11,fontWeight:filtre===f?700:400,cursor:'pointer',fontFamily:'inherit'}}>
              {f==='tous'?'Toutes':f==='paye'?'Payées':f==='envoye'?'Envoyées':f==='en_retard'?'Retard':f==='partiel'?'Partiel':'Brouillons'}
            </button>
          ))}
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <Btn label="Importer" variant="ghost" sm icon="download"/>
          <Btn label="Exporter" variant="ghost" sm icon="download"/>
          <Btn label="Nouvelle facture" variant="primary" icon="plus" onClick={()=>setShowForm(true)}/>
        </div>
      </div>

      {/* Stats filtrage */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,marginBottom:14}}>
        {[
          {l:'Total filtré',v:`${fmtM(totalFiltre)} F`,c:C.primary},
          {l:'Payées',v:`${fmtM(factures.filter(f=>f.status==='paye').reduce((s,f)=>s+f.montantTTC,0))} F`,c:C.primary},
          {l:'En attente',v:`${fmtM(factures.filter(f=>['envoye','partiel'].includes(f.status)).reduce((s,f)=>s+f.montantTTC,0))} F`,c:C.blue},
          {l:'En retard',v:`${fmtM(factures.filter(f=>f.status==='en_retard').reduce((s,f)=>s+f.montantTTC,0))} F`,c:C.red},
          {l:'TVA collectée',v:`${fmtM(factures.reduce((s,f)=>s+f.tva,0))} F`,c:C.purple},
        ].map((s,i)=>(
          <div key={i} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:'10px 14px'}}>
            <div style={{fontSize:10,color:C.text4,marginBottom:3}}>{s.l}</div>
            <div style={{fontSize:14,fontWeight:700,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>

      <Table
        cols={['N° Facture','Client','BC Huawei','Émission','Échéance','Montant TTC','Statut','Actions']}
        rows={filtered.map((f,i)=>[
          <span style={{fontWeight:700,color:C.blue,cursor:'pointer'}} onClick={()=>setDetail(f)}>{f.numero}</span>,
          f.client,
          f.bcRef?<span style={{fontSize:11,color:C.orange,background:C.orange_l,padding:'2px 7px',borderRadius:10}}>{f.bcRef}</span>:'—',
          fmtD(f.dateEmission),
          <span style={{color:f.status==='en_retard'?C.red:C.text}}>{fmtD(f.dateEcheance)}</span>,
          <strong style={{color:C.blue}}>{fmtN(f.montantTTC)} {f.devise}</strong>,
          <Badge status={f.status}/>,
          <div style={{display:'flex',gap:5}}>
            <Btn label="Voir" variant="ghost" sm onClick={()=>setDetail(f)}/>
            {f.status!=='paye'&&<Btn label="Enreg. paiement" variant="primary" sm/>}
          </div>
        ])}
      />

      {showForm&&<FormFacture onClose={()=>setShowForm(false)} onSave={addFacture}/>}
      {detail&&<DetailFacture facture={detail} onClose={()=>setDetail(null)}/>}
    </div>
  );
};

// Formulaire Facture
const FormFacture = ({onClose,onSave,initial={}}) => {
  const [client,   setClient]   = useState(initial.client||'');
  const [projet,   setProjet]   = useState(initial.projet||'');
  const [bcRef,    setBcRef]    = useState(initial.bcRef||'');
  const [devise,   setDevise]   = useState(initial.devise||'FCFA');
  const [echeance, setEcheance] = useState(initial.dateEcheance||'');
  const [mode,     setMode]     = useState(initial.modePaiement||'Virement bancaire');
  const [notes,    setNotes]    = useState(initial.notes||'');
  const [lignes,   setLignes]   = useState(initial.lignes||[{desc:'',qte:1,pu:0,tva:true}]);

  const addL=()=>setLignes(p=>[...p,{desc:'',qte:1,pu:0,tva:true}]);
  const updL=(i,k,v)=>setLignes(p=>p.map((l,idx)=>idx===i?{...l,[k]:v}:l));
  const delL=(i)=>setLignes(p=>p.filter((_,idx)=>idx!==i));
  const ht=lignes.reduce((s,l)=>s+l.qte*l.pu,0);
  const tvaTotal=lignes.reduce((s,l)=>s+(l.tva?l.qte*l.pu*TVA:0),0);
  const ttc=ht+tvaTotal;

  const save=(submit)=>{
    if(!client){alert('Client obligatoire');return;}
    onSave({id:Date.now(),numero:`FAC-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900+100)).padStart(3,'0')}`,
      client,projet,bcRef,devise,dateEcheance:echeance,dateEmission:new Date().toISOString().split('T')[0],
      modePaiement:mode,notes,lignes,montantHT:ht,tva:tvaTotal,montantTTC:ttc,
      status:submit?'envoye':'brouillon',acomptes:[],compteCClient:'411',compteRevenu:'701'});
    onClose();
  };

  return(
    <SlidePanel title="Nouvelle facture" sub="Facturation client" onClose={onClose} width={740}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:18}}>
        <Field label="Client" required><Select value={client} onChange={setClient} options={CLIENTS_LIST} placeholder="Sélectionner le client"/></Field>
        <Field label="Projet associé"><Select value={projet} onChange={setProjet} options={PROJETS_REF} placeholder="Aucun projet"/></Field>
        <Field label="Référence BC Huawei"><Select value={bcRef} onChange={setBcRef} options={BC_REF} placeholder="Aucun BC"/></Field>
        <Field label="Devise"><Select value={devise} onChange={setDevise} options={DEVISES_LIST}/></Field>
        <Field label="Date d'échéance" required><Input type="date" value={echeance} onChange={setEcheance}/></Field>
        <Field label="Mode de paiement"><Select value={mode} onChange={setMode} options={MODES_PAI}/></Field>
      </div>

      <div style={{marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:10}}>Lignes de facturation</div>
        <div style={{border:`1px solid ${C.border}`,borderRadius:8,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:C.bg}}>
                {['Description','Qté','Prix unitaire',`TVA ${(TVA*100).toFixed(2)}%`,'Total TTC',''].map(h=>(
                  <th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:11,fontWeight:700,color:C.text3,textTransform:'uppercase'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lignes.map((l,i)=>{
                const tot=l.qte*l.pu*(l.tva?1+TVA:1);
                return(
                  <tr key={i} style={{borderTop:`1px solid ${C.border}`}}>
                    <td style={{padding:'6px 8px'}}><Input value={l.desc} onChange={v=>updL(i,'desc',v)} placeholder="Prestation / Description" small/></td>
                    <td style={{padding:'6px 8px',width:70}}><Input type="number" value={l.qte} onChange={v=>updL(i,'qte',+v)} small/></td>
                    <td style={{padding:'6px 8px',width:140}}><Input type="number" value={l.pu} onChange={v=>updL(i,'pu',+v)} suffix={devise} small/></td>
                    <td style={{padding:'6px 12px',textAlign:'center',width:70}}>
                      <input type="checkbox" checked={l.tva} onChange={e=>updL(i,'tva',e.target.checked)} style={{width:16,height:16,cursor:'pointer',accentColor:C.primary}}/>
                    </td>
                    <td style={{padding:'6px 12px',fontSize:13,fontWeight:600,color:C.blue,width:140}}>{fmtN(Math.round(tot))} {devise}</td>
                    <td style={{padding:'6px 8px',width:36}}>
                      {lignes.length>1&&<button onClick={()=>delL(i)} style={{width:24,height:24,borderRadius:5,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><Ico n="close" s={12} c={C.text3}/></button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{padding:'8px 12px',borderTop:`1px solid ${C.border}`}}>
            <Btn label="+ Ajouter une ligne" onClick={addL} variant="ghost" sm/>
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:18}}>
        <Field label="Notes & Conditions"><Textarea value={notes} onChange={setNotes} placeholder="Conditions de paiement, remarques..."/></Field>
        <div style={{background:C.bg,borderRadius:8,padding:'14px 16px'}}>
          {[{l:'Montant HT',v:`${fmtN(ht)} ${devise}`,c:C.text,big:false},
            {l:`TVA (${(TVA*100).toFixed(2)}%)`,v:`${fmtN(Math.round(tvaTotal))} ${devise}`,c:C.red,big:false},
            {l:'Montant TTC',v:`${fmtN(Math.round(ttc))} ${devise}`,c:C.blue,big:true},
          ].map(t=>(
            <div key={t.l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:t.big?'none':`1px solid ${C.border}`}}>
              <span style={{fontSize:t.big?13:12,color:C.text3,fontWeight:t.big?600:400}}>{t.l}</span>
              <span style={{fontSize:t.big?20:13,fontWeight:t.big?800:600,color:t.c}}>{t.v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:'flex',gap:10,justifyContent:'flex-end',paddingTop:14,borderTop:`1px solid ${C.border}`}}>
        <Btn label="Annuler" onClick={onClose} variant="ghost"/>
        <Btn label="Brouillon" onClick={()=>save(false)} variant="default" icon="download"/>
        <Btn label="Créer et envoyer" onClick={()=>save(true)} variant="primary" icon="mail"/>
      </div>
    </SlidePanel>
  );
};

// Détail Facture
const DetailFacture = ({facture,onClose}) => {
  const totalPaye = facture.acomptes?.reduce((s,a)=>s+a.montant,0)||0;
  const reste     = facture.montantTTC-totalPaye;
  return(
    <SlidePanel title={facture.numero} sub={`${facture.client} · ${facture.devise}`} onClose={onClose} width={680}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 18px',background:facture.status==='en_retard'?C.red_l:C.primary_l,borderRadius:9,marginBottom:18}}>
        <div>
          <div style={{fontSize:11,color:C.text3,marginBottom:3}}>Montant TTC</div>
          <div style={{fontSize:28,fontWeight:800,color:C.blue}}>{fmtN(facture.montantTTC)} {facture.devise}</div>
          {facture.devise!=='FCFA'&&<div style={{fontSize:11,color:C.text3}}>≈ {fmtN(toFCFA(facture.montantTTC,facture.devise))} FCFA</div>}
        </div>
        <Badge status={facture.status}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:18}}>
        {[{l:'Client',v:facture.client},{l:'Projet',v:facture.projet||'—'},{l:'BC Huawei',v:facture.bcRef||'—'},
          {l:'Émission',v:fmtD(facture.dateEmission)},{l:'Échéance',v:fmtD(facture.dateEcheance)},{l:'Paiement',v:facture.modePaiement}
        ].map(it=>(
          <div key={it.l} style={{padding:'9px 12px',background:C.bg,borderRadius:7}}>
            <div style={{fontSize:10,color:C.text4,textTransform:'uppercase',letterSpacing:.4,marginBottom:2}}>{it.l}</div>
            <div style={{fontSize:13,fontWeight:600,color:C.text}}>{it.v}</div>
          </div>
        ))}
      </div>

      <div style={{marginBottom:18}}>
        <div style={{fontSize:12,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:10}}>Lignes de facturation</div>
        <Table cols={['Description','Qté','P.U.','TVA','Total TTC']}
          rows={facture.lignes.map(l=>{const ht=l.qte*l.pu;const tv=l.tva?ht*TVA:0;return[l.desc,l.qte,`${fmtN(l.pu)} ${facture.devise}`,l.tva?`${(TVA*100).toFixed(2)}%`:'Exonéré',<strong style={{color:C.blue}}>{fmtN(ht+tv)} {facture.devise}</strong>];})}/>
      </div>

      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:18}}>
        <div style={{width:300,background:C.bg,borderRadius:8,padding:'14px 16px'}}>
          {[{l:'HT',v:`${fmtN(facture.montantHT)} ${facture.devise}`,c:C.text,big:false},
            {l:`TVA (${(TVA*100).toFixed(2)}%)`,v:`${fmtN(facture.tva)} ${facture.devise}`,c:C.red,big:false},
            {l:'TTC',v:`${fmtN(facture.montantTTC)} ${facture.devise}`,c:C.blue,big:true},
            ...(totalPaye>0?[{l:'Acomptes reçus',v:`- ${fmtN(totalPaye)} ${facture.devise}`,c:C.primary,big:false},{l:'Reste à payer',v:`${fmtN(reste)} ${facture.devise}`,c:C.orange,big:true}]:[]),
          ].map(t=>(
            <div key={t.l} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:t.big?'none':`1px solid ${C.border}`}}>
              <span style={{fontSize:t.big?13:12,fontWeight:t.big?600:400,color:C.text3}}>{t.l}</span>
              <span style={{fontSize:t.big?19:13,fontWeight:t.big?800:600,color:t.c}}>{t.v}</span>
            </div>
          ))}
        </div>
      </div>

      {facture.notes&&<div style={{marginBottom:14,padding:'10px 14px',background:C.orange_l,borderRadius:8,fontSize:13,color:C.text2,borderLeft:`3px solid ${C.orange}`}}>{facture.notes}</div>}

      {facture.acomptes?.length>0&&(
        <div style={{marginBottom:14,padding:'12px 14px',background:C.primary_l,borderRadius:8,borderLeft:`3px solid ${C.primary}`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.primary,marginBottom:8}}>Acomptes reçus</div>
          {facture.acomptes.map((a,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4}}>
              <span>{fmtD(a.date)} — {a.ref} ({a.mode})</span>
              <strong style={{color:C.primary}}>{fmtN(a.montant)} {facture.devise}</strong>
            </div>
          ))}
        </div>
      )}

      {/* Écriture comptable générée */}
      <div style={{marginBottom:14,padding:'12px 14px',background:C.blue_l,borderRadius:8,border:`1px solid ${C.blue}20`}}>
        <div style={{fontSize:11,fontWeight:700,color:C.blue,marginBottom:6}}>ÉCRITURE COMPTABLE — Journal Ventes</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8,fontSize:11}}>
          <div style={{fontWeight:700,color:C.text3}}>Compte débit</div>
          <div style={{fontWeight:700,color:C.text3}}>Compte crédit</div>
          <div style={{fontWeight:700,color:C.text3}}>Débit</div>
          <div style={{fontWeight:700,color:C.text3}}>Crédit</div>
          <div>411 — Clients</div><div>701 — Ventes services</div>
          <div style={{color:C.primary,fontWeight:600}}>{fmtN(facture.montantTTC)} F</div>
          <div style={{color:C.blue,fontWeight:600}}>{fmtN(facture.montantHT)} F</div>
          <div>411 — Clients</div><div>441 — TVA collectée</div>
          <div></div><div style={{color:C.purple,fontWeight:600}}>{fmtN(facture.tva)} F</div>
        </div>
      </div>

      <div style={{display:'flex',gap:8,flexWrap:'wrap',paddingTop:14,borderTop:`1px solid ${C.border}`}}>
        <Btn label="Imprimer" variant="ghost" sm icon="print"/>
        <Btn label="Envoyer" variant="ghost" sm icon="mail"/>
        <Btn label="PDF" variant="ghost" sm icon="download"/>
        <Btn label="Enreg. paiement" variant="primary" sm icon="check"/>
        <Btn label="Dupliquer" variant="ghost" sm icon="edit"/>
        {facture.status!=='annule'&&<Btn label="Annuler" variant="danger" sm/>}
      </div>
    </SlidePanel>
  );
};

// ================================================================
//  MODULE 3 — DÉPENSES & ACHATS
// ================================================================
const VueDepenses = ({depenses,setDepenses}) => {
  const [showForm, setShowForm] = useState(false);
  const [detail,   setDetail]   = useState(null);
  const [filtre,   setFiltre]   = useState('tous');
  const [search,   setSearch]   = useState('');

  const filtered = depenses.filter(d=>{
    const ms = !search||(d.numero+d.fournisseur+d.description+d.projet).toLowerCase().includes(search.toLowerCase());
    const mf = filtre==='tous'||d.status===filtre||d.categorie===filtre;
    return ms&&mf;
  });

  const totalFiltre = filtered.reduce((s,d)=>s+toFCFA(d.montant,d.devise),0);

  return(
    <div>
      <div style={{display:'flex',gap:10,marginBottom:16,alignItems:'center',flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,background:C.white,border:`1px solid ${C.border}`,borderRadius:7,padding:'7px 12px',flex:1,maxWidth:280}}>
          <Ico n="search" s={14} c={C.text4}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher dépense..."
            style={{border:'none',outline:'none',fontSize:13,flex:1,fontFamily:'inherit',color:C.text,background:'transparent'}}/>
        </div>
        <div style={{display:'flex',gap:3,background:C.white,border:`1px solid ${C.border}`,borderRadius:7,overflow:'hidden'}}>
          {['tous','paye','en_attente'].map(f=>(
            <button key={f} onClick={()=>setFiltre(f)}
              style={{padding:'6px 12px',border:'none',background:filtre===f?C.red_l:'transparent',
                color:filtre===f?C.red:C.text3,fontSize:11,fontWeight:filtre===f?700:400,cursor:'pointer',fontFamily:'inherit'}}>
              {f==='tous'?'Toutes':f==='paye'?'Payées':'En attente'}
            </button>
          ))}
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <Btn label="Importer" variant="ghost" sm icon="download"/>
          <Btn label="Nouvelle dépense" variant="primary" icon="plus" onClick={()=>setShowForm(true)}/>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:14}}>
        {[{l:'Total charges',v:`${fmtM(totalFiltre)} F`,c:C.red},
          {l:'Payées',v:`${fmtM(depenses.filter(d=>d.status==='paye').reduce((s,d)=>s+toFCFA(d.montant,d.devise),0))} F`,c:C.primary},
          {l:'En attente',v:`${fmtM(depenses.filter(d=>d.status==='en_attente').reduce((s,d)=>s+toFCFA(d.montant,d.devise),0))} F`,c:C.orange},
          {l:'TVA déductible',v:`${fmtM(depenses.filter(d=>d.tva_deductible).reduce((s,d)=>s+toFCFA(d.montant,d.devise)*TVA,0))} F`,c:C.blue},
        ].map((s,i)=>(
          <div key={i} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:'10px 14px'}}>
            <div style={{fontSize:10,color:C.text4,marginBottom:3}}>{s.l}</div>
            <div style={{fontSize:14,fontWeight:700,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>

      <Table
        cols={['N° Dépense','Fournisseur','Catégorie','Projet','BC Huawei','Montant','Statut','Actions']}
        rows={filtered.map((d,i)=>[
          <span style={{fontWeight:700,color:C.red,cursor:'pointer'}} onClick={()=>setDetail(d)}>{d.numero}</span>,
          d.fournisseur,
          <span style={{fontSize:11,padding:'2px 7px',borderRadius:10,background:C.bg2,color:C.text3}}>{d.categorie}</span>,
          d.projet,
          d.bcRef?<span style={{fontSize:11,color:C.orange,background:C.orange_l,padding:'2px 7px',borderRadius:10}}>{d.bcRef}</span>:'—',
          <strong style={{color:C.red}}>{fmtN(d.montant)} {d.devise}{d.devise!=='FCFA'?<span style={{fontSize:10,color:C.text4}}> ≈{fmtM(toFCFA(d.montant,d.devise))}F</span>:null}</strong>,
          <Badge status={d.status}/>,
          <div style={{display:'flex',gap:5}}>
            <Btn label="Voir" variant="ghost" sm onClick={()=>setDetail(d)}/>
            {d.status==='en_attente'&&<Btn label="Valider" variant="primary" sm/>}
          </div>
        ])}
      />

      {showForm&&<FormDepense onClose={()=>setShowForm(false)} onSave={d=>setDepenses(p=>[...p,d])}/>}
      {detail&&(
        <SlidePanel title={detail.numero} sub={detail.fournisseur} onClose={()=>setDetail(null)} width={640}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
            {[{l:'Fournisseur',v:detail.fournisseur},{l:'Catégorie',v:detail.categorie},
              {l:'Date',v:fmtD(detail.date)},{l:'Statut',v:<Badge status={detail.status}/>},
              {l:'Projet',v:detail.projet||'—'},{l:'BC Huawei',v:detail.bcRef||'—'},
              {l:'Compte charge',v:detail.compteCharge||'—'},{l:'TVA déductible',v:detail.tva_deductible?'Oui':'Non'},
            ].map(it=>(
              <div key={it.l} style={{padding:'9px 12px',background:C.bg,borderRadius:7}}>
                <div style={{fontSize:10,color:C.text4,textTransform:'uppercase',letterSpacing:.4,marginBottom:2}}>{it.l}</div>
                <div style={{fontSize:13,fontWeight:600,color:C.text}}>{it.v}</div>
              </div>
            ))}
          </div>
          <div style={{padding:'14px 16px',background:C.red_l,borderRadius:8,marginBottom:14,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:13,fontWeight:600,color:C.text2}}>{detail.description}</span>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:22,fontWeight:800,color:C.red}}>{fmtN(detail.montant)} {detail.devise}</div>
              {detail.devise!=='FCFA'&&<div style={{fontSize:11,color:C.text4}}>≈ {fmtN(toFCFA(detail.montant,detail.devise))} FCFA</div>}
            </div>
          </div>
          <div style={{padding:'12px 14px',background:C.blue_l,borderRadius:8,border:`1px solid ${C.blue}20`,marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:C.blue,marginBottom:6}}>ÉCRITURE COMPTABLE — Journal Achats</div>
            <div style={{fontSize:12,color:C.text2}}>Débit <strong>{detail.compteCharge}</strong> — Crédit <strong>401 (Fournisseurs)</strong> — {fmtN(toFCFA(detail.montant,detail.devise))} FCFA</div>
          </div>
          <div style={{display:'flex',gap:8,paddingTop:14,borderTop:`1px solid ${C.border}`}}>
            <Btn label="Imprimer" variant="ghost" sm icon="print"/>
            {detail.status==='en_attente'&&<Btn label="Valider le paiement" variant="primary" sm icon="check"/>}
          </div>
        </SlidePanel>
      )}
    </div>
  );
};

const FormDepense = ({onClose,onSave}) => {
  const [fourn,   setFourn]   = useState('');
  const [desc,    setDesc]    = useState('');
  const [cat,     setCat]     = useState('');
  const [montant, setMontant] = useState('');
  const [devise,  setDevise]  = useState('FCFA');
  const [date,    setDate]    = useState(new Date().toISOString().split('T')[0]);
  const [projet,  setProjet]  = useState('');
  const [bcRef,   setBcRef]   = useState('');
  const [compteC, setCompteC] = useState('604');
  const [tvaD,    setTvaD]    = useState(false);

  const save=()=>{
    if(!fourn){alert('Fournisseur obligatoire');return;}
    onSave({id:Date.now(),numero:`DEP-${new Date().getFullYear()}-${String(Math.floor(Math.random()*900+100)).padStart(3,'0')}`,
      fournisseur:fourn,description:desc,categorie:cat,montant:+montant,devise,date,projet,bcRef,
      status:'en_attente',compteCharge:compteC,compteFourn:'401',tva_deductible:tvaD});
    onClose();
  };

  return(
    <SlidePanel title="Nouvelle dépense" sub="Enregistrer une charge" onClose={onClose} width={680}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:18}}>
        <Field label="Fournisseur" required><Select value={fourn} onChange={setFourn} options={FOURNISSEURS} placeholder="Sélectionner"/></Field>
        <Field label="Catégorie" required><Select value={cat} onChange={setCat} options={CATEGORIES_CH} placeholder="Catégorie"/></Field>
        <Field label="Montant" required><Input type="number" value={montant} onChange={setMontant} placeholder="0" suffix={devise}/></Field>
        <Field label="Devise"><Select value={devise} onChange={setDevise} options={DEVISES_LIST}/></Field>
        <Field label="Date" required><Input type="date" value={date} onChange={setDate}/></Field>
        <Field label="Compte de charge"><Input value={compteC} onChange={setCompteC} placeholder="604"/></Field>
        <Field label="Projet lié"><Select value={projet} onChange={setProjet} options={[...PROJETS_REF,'Général']} placeholder="Aucun"/></Field>
        <Field label="Référence BC Huawei"><Select value={bcRef} onChange={setBcRef} options={BC_REF} placeholder="Aucun BC"/></Field>
        <Field label="Description" span><Input value={desc} onChange={setDesc} placeholder="Description détaillée de la dépense"/></Field>
        <Field label="TVA déductible">
          <div style={{display:'flex',alignItems:'center',gap:8,paddingTop:6}}>
            <input type="checkbox" checked={tvaD} onChange={e=>setTvaD(e.target.checked)} style={{width:16,height:16,accentColor:C.primary}}/>
            <span style={{fontSize:13,color:C.text2}}>TVA récupérable ({(TVA*100).toFixed(2)}%)</span>
          </div>
        </Field>
      </div>
      {tvaD&&montant&&(
        <div style={{padding:'10px 14px',background:C.primary_l,borderRadius:8,marginBottom:14,fontSize:13,color:C.primary}}>
          TVA déductible estimée : <strong>{fmtN(Math.round(+montant*TVA))} {devise}</strong>
        </div>
      )}
      <div style={{display:'flex',gap:10,justifyContent:'flex-end',paddingTop:14,borderTop:`1px solid ${C.border}`}}>
        <Btn label="Annuler" onClick={onClose} variant="ghost"/>
        <Btn label="Enregistrer la dépense" onClick={save} variant="primary" icon="check"/>
      </div>
    </SlidePanel>
  );
};

// ================================================================
//  MODULE 4 — BC HUAWEI (prix complets — Finance uniquement)
// ================================================================
const VueBCHuawei = () => {
  const [detail, setDetail] = useState(null);
  const totalMontants = BC_HUAWEI_COMPLETS.reduce((s,b)=>s+b.montantHuawei,0);
  const totalNego     = BC_HUAWEI_COMPLETS.reduce((s,b)=>s+b.montantNego,0);
  const totalMarges   = BC_HUAWEI_COMPLETS.reduce((s,b)=>s+b.marge,0);

  return(
    <div>
      {/* Alerte confidentialité */}
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',background:'#FEF3C7',border:`1px solid ${C.orange}40`,borderRadius:9,marginBottom:16}}>
        <Ico n="lock" s={17} c={C.orange}/>
        <div style={{flex:1,fontSize:13,color:C.text2}}>
          <strong style={{color:C.orange}}>CONFIDENTIEL — Finance & Comptabilité uniquement.</strong> Les montants Huawei sont masqués pour les Project Managers. Visible ici pour la comptabilité, le suivi des marges et la création des projets.
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:18}}>
        {[{l:'Total BC Huawei',v:`${fmtM(totalMontants)} F`,c:C.orange},
          {l:'Total négocié',v:`${fmtM(totalNego)} F`,c:C.blue},
          {l:'Marges totales',v:`${fmtM(totalMarges)} F`,c:C.primary},
          {l:'Taux de marge moyen',v:`${Math.round(totalMarges/totalMontants*100)}%`,c:C.teal},
        ].map((s,i)=>(
          <div key={i} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 18px',borderLeft:`4px solid ${s.c}`}}>
            <div style={{fontSize:10,color:C.text4,textTransform:'uppercase',letterSpacing:.5,marginBottom:5}}>{s.l}</div>
            <div style={{fontSize:22,fontWeight:800,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {BC_HUAWEI_COMPLETS.map(bc=>(
          <Card key={bc.id} onClick={()=>setDetail(bc)}>
            <div style={{padding:'16px 18px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                <div>
                  <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:4}}>
                    <span style={{fontSize:14,fontWeight:700,color:C.orange}}>{bc.id}</span>
                    <Badge status={bc.statut}/>
                    <span style={{fontSize:11,padding:'2px 8px',borderRadius:10,background:C.bg2,color:C.text3}}>{bc.type}</span>
                  </div>
                  <div style={{fontSize:13,color:C.text2}}>{bc.client} · Site {bc.site} · {fmtD(bc.dateReception)}</div>
                </div>
                <div style={{display:'flex',gap:20,textAlign:'right'}}>
                  <div>
                    <div style={{fontSize:10,color:C.text4,marginBottom:2}}>Montant Huawei</div>
                    <div style={{fontSize:16,fontWeight:800,color:C.orange}}>{fmtM(bc.montantHuawei)} FCFA</div>
                  </div>
                  <div>
                    <div style={{fontSize:10,color:C.text4,marginBottom:2}}>Montant négocié</div>
                    <div style={{fontSize:16,fontWeight:800,color:C.blue}}>{fmtM(bc.montantNego)} FCFA</div>
                  </div>
                  <div>
                    <div style={{fontSize:10,color:C.text4,marginBottom:2}}>Marge</div>
                    <div style={{fontSize:16,fontWeight:800,color:C.primary}}>{fmtM(bc.marge)} FCFA</div>
                    <div style={{fontSize:10,color:C.primary}}>{Math.round(bc.marge/bc.montantHuawei*100)}%</div>
                  </div>
                </div>
              </div>
              {/* Barre marge */}
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{flex:1,height:6,background:C.bg2,borderRadius:3,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${Math.round(bc.marge/bc.montantHuawei*100)}%`,background:C.primary,borderRadius:3}}/>
                </div>
                <span style={{fontSize:11,color:C.primary,fontWeight:600}}>Marge {Math.round(bc.marge/bc.montantHuawei*100)}%</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {detail&&(
        <SlidePanel title={detail.id} sub={`${detail.client} · CONFIDENTIEL`} onClose={()=>setDetail(null)} width={680}>
          <div style={{display:'flex',gap:12,marginBottom:16}}>
            {[{l:'Prix Huawei',v:`${fmtN(detail.montantHuawei)} ${detail.devise}`,c:C.orange},
              {l:'Négocié',v:`${fmtN(detail.montantNego)} ${detail.devise}`,c:C.blue},
              {l:'Marge',v:`${fmtN(detail.marge)} ${detail.devise}`,c:C.primary},
            ].map(s=>(
              <div key={s.l} style={{flex:1,padding:'12px',background:C.bg,borderRadius:8,textAlign:'center'}}>
                <div style={{fontSize:10,color:C.text4,marginBottom:4,textTransform:'uppercase'}}>{s.l}</div>
                <div style={{fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div>
              </div>
            ))}
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:10}}>Détail du bon de commande</div>
            <Table cols={['Description','Qté','P.U.','Total']}
              rows={detail.lignesDetail.map(l=>[l.desc,l.qte,`${fmtN(l.pu)} ${detail.devise}`,<strong style={{color:C.orange}}>{fmtN(l.total)} {detail.devise}</strong>])}/>
          </div>
          <div style={{padding:'10px 14px',background:C.primary_l,borderRadius:8,fontSize:12,color:C.primary}}>
            Ces informations sont masquées pour les PM. Seul le type de mission et le site sont transmis aux Project Managers.
          </div>
        </SlidePanel>
      )}
    </div>
  );
};

// ================================================================
//  MODULE 5 — TRÉSORERIE & BANQUE
// ================================================================
const VueTresorerie = () => {
  const totalBanque = 45200000+12500000;
  const totalCaisse = 850000;
  const totalVir    = 2100000;
  const soldeTotal  = totalBanque+totalCaisse+totalVir;

  const RELEVES = [
    {date:'2024-03-28',libelle:'VIR reçu MTN Cameroun — FAC-2024-001',type:'e',montant:5000000,solde:113000000,ref:'VIR-2024-001'},
    {date:'2024-03-25',libelle:'Paiement Huawei Technologies DEP-2024-001',type:'s',montant:28500000,solde:108000000,ref:'DEP-2024-001'},
    {date:'2024-03-22',libelle:'VIR reçu Gouvernement — Acompte FAC-2024-004',type:'e',montant:11448000,solde:136500000,ref:'TRESOR-2024-001'},
    {date:'2024-03-20',libelle:'Salaires Mars 2024',type:'s',montant:18000000,solde:125052000,ref:'SAL-2024-001'},
    {date:'2024-03-15',libelle:'Total Énergies — Carburant véhicules',type:'s',montant:850000,solde:143052000,ref:'DEP-2024-003'},
    {date:'2024-03-10',libelle:'CAMTEL — Liaisons fibre Q1',type:'s',montant:1200000,solde:143902000,ref:'DEP-2024-004'},
  ];

  return(
    <div>
      {/* Comptes bancaires */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {[{l:'BICEC — Principal',v:`${fmtM(45200000)} FCFA`,c:C.primary,sub:'Compte courant'},
          {l:'SGC — Opérationnel',v:`${fmtM(12500000)} FCFA`,c:C.blue,sub:'Compte courant'},
          {l:'Caisse principale',v:`${fmtM(850000)} FCFA`,c:C.teal,sub:'Espèces'},
          {l:'TOTAL TRÉSORERIE',v:`${fmtM(soldeTotal)} FCFA`,c:C.primary,sub:'Tous comptes',big:true},
        ].map((s,i)=>(
          <div key={i} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,padding:'16px 18px',borderLeft:`4px solid ${s.c}`}}>
            <div style={{fontSize:10,color:C.text4,textTransform:'uppercase',letterSpacing:.5,marginBottom:5}}>{s.l}</div>
            <div style={{fontSize:s.big?22:19,fontWeight:700,color:s.c,marginBottom:3}}>{s.v}</div>
            <div style={{fontSize:10,color:C.text4}}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Courbe trésorerie */}
      <Card style={{marginBottom:20}}>
        <CardHead title="Évolution de la trésorerie" sub="6 derniers mois" icon="bank"/>
        <div style={{padding:'16px 18px'}}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={TRESORERIE_DATA} margin={{top:5,right:10,left:10,bottom:0}}>
              <defs>
                <linearGradient id="gTr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.primary} stopOpacity={.2}/>
                  <stop offset="95%" stopColor={C.primary} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
              <XAxis dataKey="mois" tick={{fontSize:11,fill:C.text3}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:C.text3}} axisLine={false} tickLine={false} tickFormatter={v=>fmtM(v)}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:12}}/>
              <Area type="monotone" dataKey="solde" name="Solde trésorerie" stroke={C.primary} strokeWidth={2.5} fill="url(#gTr)"/>
              <Bar dataKey="entrees" name="Entrées" fill={`${C.primary}60`}/>
              <Bar dataKey="sorties" name="Sorties" fill={`${C.red}50`}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Relevé bancaire */}
      <Card>
        <CardHead title="Relevé bancaire — BICEC Principal" sub="Mars 2024" icon="bank"
          action={<div style={{display:'flex',gap:8}}><Btn label="Rapprocher" variant="default" sm icon="check"/><Btn label="Exporter" variant="ghost" sm icon="download"/></div>}/>
        <Table
          cols={['Date','Libellé','Référence','Débit','Crédit','Solde']}
          rows={RELEVES.map(r=>[
            fmtD2(r.date),r.libelle,
            <span style={{fontSize:11,color:C.text4}}>{r.ref}</span>,
            r.type==='s'?<strong style={{color:C.red}}>- {fmtN(r.montant)} F</strong>:'—',
            r.type==='e'?<strong style={{color:C.primary}}>+ {fmtN(r.montant)} F</strong>:'—',
            <span style={{fontWeight:600,color:C.text}}>{fmtN(r.solde)} F</span>
          ])}
        />
      </Card>
    </div>
  );
};

// ================================================================
//  MODULE 6 — PLAN COMPTABLE OHADA/SYSCOHADA
// ================================================================
const VuePlanComptable = () => {
  const [expanded, setExpanded] = useState('1');
  const [showJournal, setShowJournal] = useState(false);

  const totalActif   = PLAN_COMPTABLE.flatMap(c=>c.comptes).filter(c=>c.type==='A'&&c.solde>0).reduce((s,c)=>s+c.solde,0);
  const totalPassif  = PLAN_COMPTABLE.flatMap(c=>c.comptes).filter(c=>c.type==='P'&&c.solde>0).reduce((s,c)=>s+Math.abs(c.solde),0);
  const totalCharges = PLAN_COMPTABLE.flatMap(c=>c.comptes).filter(c=>c.type==='C').reduce((s,c)=>s+Math.abs(c.solde),0);
  const totalProduits= PLAN_COMPTABLE.flatMap(c=>c.comptes).filter(c=>c.solde>0&&c.type==='P'&&PLAN_COMPTABLE.find(cl=>cl.classe==='7')?.comptes.includes(c)).reduce((s,c)=>s+c.solde,136700000);

  return(
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:18}}>
        {[{l:'Total Actif',v:`${fmtM(totalActif)} F`,c:C.blue},
          {l:'Total Passif',v:`${fmtM(totalPassif)} F`,c:C.purple},
          {l:'Total Charges',v:`${fmtM(totalCharges)} F`,c:C.red},
          {l:'Total Produits',v:`${fmtM(totalProduits)} F`,c:C.primary},
        ].map((s,i)=>(
          <div key={i} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px',borderLeft:`4px solid ${s.c}`}}>
            <div style={{fontSize:10,color:C.text4,textTransform:'uppercase',letterSpacing:.4,marginBottom:5}}>{s.l}</div>
            <div style={{fontSize:20,fontWeight:700,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div style={{fontSize:13,fontWeight:700,color:C.text}}>Plan comptable SYSCOHADA — 9 classes</div>
        <div style={{display:'flex',gap:8}}>
          <Btn label="Voir journal" variant="default" sm icon="report" onClick={()=>setShowJournal(!showJournal)}/>
          <Btn label="Exporter Grand Livre" variant="ghost" sm icon="download"/>
        </div>
      </div>

      {PLAN_COMPTABLE.map(classe=>(
        <Card key={classe.classe} style={{marginBottom:8}}>
          <div onClick={()=>setExpanded(expanded===classe.classe?null:classe.classe)}
            style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',cursor:'pointer',userSelect:'none'}}>
            <div style={{width:28,height:28,borderRadius:6,background:`${classe.color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:classe.color}}>{classe.classe}</div>
            <div style={{flex:1}}>
              <span style={{fontSize:13,fontWeight:700,color:C.text}}>Classe {classe.classe} — {classe.label}</span>
              <span style={{fontSize:11,color:C.text4,marginLeft:8}}>{classe.comptes.length} comptes</span>
            </div>
            <div style={{fontSize:13,fontWeight:700,color:classe.color}}>
              {fmtM(classe.comptes.reduce((s,c)=>s+Math.abs(c.solde),0))} FCFA
            </div>
            <Ico n={expanded===classe.classe?'chevron_d':'chevron_r'} s={16} c={C.text4}/>
          </div>
          {expanded===classe.classe&&(
            <div style={{borderTop:`1px solid ${C.border}`}}>
              <Table
                cols={['N° Compte','Intitulé','Débit','Crédit','Solde']}
                rows={classe.comptes.map(c=>[
                  <span style={{fontWeight:700,color:classe.color}}>{c.num}</span>,
                  c.label,
                  c.solde>0?<span style={{color:C.blue,fontWeight:600}}>{fmtN(c.solde)} F</span>:'—',
                  c.solde<0?<span style={{color:C.red,fontWeight:600}}>{fmtN(Math.abs(c.solde))} F</span>:'—',
                  <span style={{fontWeight:700,color:c.solde>=0?C.primary:C.red}}>{fmtN(Math.abs(c.solde))} F</span>
                ])}
              />
            </div>
          )}
        </Card>
      ))}

      {/* Journal comptable */}
      {showJournal&&(
        <Card style={{marginTop:16}}>
          <CardHead title="Journal comptable — Mars 2024" icon="report" color={C.blue}
            action={<Btn label="Exporter" variant="ghost" sm icon="download"/>}/>
          <Table
            cols={['Date','Journal','Libellé','Réf.','Débit','Crédit']}
            rows={SEED_JOURNAUX.map(j=>[
              fmtD2(j.date),
              <span style={{fontSize:11,padding:'2px 6px',borderRadius:6,background:C.bg2,color:C.text3,fontWeight:600}}>{j.journal}</span>,
              j.libelle,
              <span style={{fontSize:11,color:C.text4}}>{j.ref}</span>,
              <span style={{color:C.blue,fontWeight:600}}>{fmtN(j.montantD)} F</span>,
              <span style={{color:C.red,fontWeight:600}}>{fmtN(j.montantC)} F</span>,
            ])}
          />
        </Card>
      )}
    </div>
  );
};

// ================================================================
//  MODULE 7 — TVA & FISCALITÉ
// ================================================================
const VueTVA = ({factures,depenses}) => {
  const tvaCollectee = factures.reduce((s,f)=>s+f.tva,0);
  const tvaDeductible= depenses.filter(d=>d.tva_deductible).reduce((s,d)=>s+toFCFA(d.montant,d.devise)*TVA/(1+TVA),0);
  const soldeNet     = tvaCollectee - tvaDeductible;

  const DATA_TVA = ['Jan','Fév','Mar','Avr','Mai','Jun'].map((m,i)=>({
    mois:m,
    collectee: [4200000,3800000,tvaCollectee,4500000,5100000,4800000][i],
    deductible:[1800000,2100000,Math.round(tvaDeductible),2400000,2800000,2600000][i],
  }));

  return(
    <div>
      {/* KPIs TVA */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {[{l:'TVA collectée',v:`${fmtM(tvaCollectee)} FCFA`,c:C.red,sub:`Taux ${(TVA*100).toFixed(2)}%`},
          {l:'TVA déductible',v:`${fmtM(Math.round(tvaDeductible))} FCFA`,c:C.primary,sub:'Sur achats'},
          {l:'TVA nette à payer',v:`${fmtM(Math.round(soldeNet))} FCFA`,c:C.orange,sub:'Solde mensuel'},
          {l:'Prochain dépôt',v:'15 Avr 2024',c:C.blue,sub:'Déclaration mensuelle'},
        ].map((s,i)=>(
          <div key={i} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,padding:'16px 18px',borderLeft:`4px solid ${s.c}`}}>
            <div style={{fontSize:10,color:C.text4,textTransform:'uppercase',letterSpacing:.5,marginBottom:5}}>{s.l}</div>
            <div style={{fontSize:20,fontWeight:700,color:s.c,marginBottom:3}}>{s.v}</div>
            <div style={{fontSize:11,color:C.text4}}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginBottom:18}}>
        <Card>
          <CardHead title="TVA collectée vs déductible" sub="6 mois — FCFA" icon="tax"/>
          <div style={{padding:'16px'}}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={DATA_TVA} margin={{top:5,right:10,left:10,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                <XAxis dataKey="mois" tick={{fontSize:11,fill:C.text3}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:C.text3}} axisLine={false} tickLine={false} tickFormatter={v=>fmtM(v)}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:12}}/>
                <Bar dataKey="collectee" name="TVA collectée" fill={C.red} radius={[3,3,0,0]}/>
                <Bar dataKey="deductible" name="TVA déductible" fill={C.primary} radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHead title="Déclaration TVA — Mars 2024" icon="tax" color={C.purple}/>
          <div style={{padding:'16px'}}>
            {[{l:'Base HT imposable',v:`${fmtM(factures.reduce((s,f)=>s+f.montantHT,0))} F`,c:C.text},
              {l:`TVA collectée (${(TVA*100).toFixed(2)}%)`,v:`${fmtM(tvaCollectee)} F`,c:C.red},
              {l:'TVA déductible',v:`- ${fmtM(Math.round(tvaDeductible))} F`,c:C.primary},
              {l:'TVA nette DUE',v:`${fmtM(Math.round(soldeNet))} F`,c:C.orange},
            ].map((t,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:i<3?`1px solid ${C.border}`:'none'}}>
                <span style={{fontSize:12,color:C.text3}}>{t.l}</span>
                <span style={{fontSize:i===3?16:13,fontWeight:i===3?800:600,color:t.c}}>{t.v}</span>
              </div>
            ))}
            <div style={{marginTop:14,display:'flex',gap:8}}>
              <Btn label="Télédéclarer" variant="primary" full icon="mail"/>
            </div>
            <div style={{marginTop:8,display:'flex',gap:8}}>
              <Btn label="Imprimer" variant="ghost" sm icon="print" full/>
              <Btn label="Exporter" variant="ghost" sm icon="download" full/>
            </div>
          </div>
        </Card>
      </div>

      {/* Tableau détaillé TVA par facture */}
      <Card>
        <CardHead title="Détail TVA par facture" sub="Mars 2024 — Journal TVA" icon="report"/>
        <Table
          cols={['Facture','Client','Montant HT','TVA (19.25%)','Montant TTC','Statut']}
          rows={factures.map(f=>[
            <span style={{fontWeight:700,color:C.blue}}>{f.numero}</span>,
            f.client,
            <span style={{color:C.text2}}>{fmtN(f.montantHT)} {f.devise}</span>,
            <span style={{color:C.red,fontWeight:600}}>{fmtN(f.tva)} {f.devise}</span>,
            <strong style={{color:C.blue}}>{fmtN(f.montantTTC)} {f.devise}</strong>,
            <Badge status={f.status}/>,
          ])}
        />
      </Card>
    </div>
  );
};

// ================================================================
//  MODULE 8 — ÉTATS FINANCIERS OHADA
// ================================================================
const VueOHADA = () => {
  const [activeEtat, setActiveEtat] = useState('bilan');

  const BilanActif = () => (
    <div>
      <div style={{fontSize:12,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>ACTIF</div>
      <Table cols={['Compte','Libellé','Exercice 2024','Exercice 2023','Var.']}
        rows={[
          ['211-244','Immobilisations corporelles nettes','29 500 000','32 000 000',<span style={{color:C.red}}>-7.8%</span>],
          ['3XX','Stocks & en-cours','12 200 000','10 500 000',<span style={{color:C.primary}}>+16.2%</span>],
          ['411-413','Créances clients','76 855 875','58 000 000',<span style={{color:C.primary}}>+32.5%</span>],
          ['521-531','Trésorerie active','58 650 000','45 000 000',<span style={{color:C.primary}}>+30.3%</span>],
          ['','','','',''],
          ['','TOTAL ACTIF','177 205 875','145 500 000',<strong style={{color:C.primary}}>+21.8%</strong>],
        ]}/>
    </div>
  );

  const BilanPassif = () => (
    <div style={{marginTop:16}}>
      <div style={{fontSize:12,fontWeight:700,color:C.text3,textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>PASSIF</div>
      <Table cols={['Compte','Libellé','Exercice 2024','Exercice 2023','Var.']}
        rows={[
          ['101-106','Capitaux propres & réserves','70 500 000','55 000 000',<span style={{color:C.primary}}>+28.2%</span>],
          ['120','Résultat de l\'exercice','33 000 000','25 000 000',<span style={{color:C.primary}}>+32.0%</span>],
          ['161-164','Dettes financières LT','18 500 000','22 000 000',<span style={{color:C.primary}}>-15.9%</span>],
          ['401-447','Dettes court terme','55 205 875','43 500 000',<span style={{color:C.red}}>+26.9%</span>],
          ['','','','',''],
          ['','TOTAL PASSIF','177 205 875','145 500 000',<strong style={{color:C.primary}}>+21.8%</strong>],
        ]}/>
    </div>
  );

  return(
    <div>
      <div style={{display:'flex',gap:8,marginBottom:18}}>
        {[{id:'bilan',l:'Bilan SYSCOHADA'},{id:'cr',l:'Compte de résultat'},{id:'flux',l:'Tableau de flux'},{id:'notes',l:'Notes annexes'}].map(e=>(
          <button key={e.id} onClick={()=>setActiveEtat(e.id)}
            style={{padding:'8px 16px',borderRadius:7,border:`1px solid ${activeEtat===e.id?C.primary:C.border}`,
              background:activeEtat===e.id?C.primary_l:C.white,color:activeEtat===e.id?C.primary:C.text3,
              fontSize:12,fontWeight:activeEtat===e.id?700:400,cursor:'pointer',fontFamily:'inherit'}}>
            {e.l}
          </button>
        ))}
        <div style={{marginLeft:'auto'}}><Btn label="Exporter OHADA" variant="primary" sm icon="download"/></div>
      </div>

      {activeEtat==='bilan'&&(
        <Card>
          <CardHead title="Bilan SYSCOHADA — Exercice clos au 31 mars 2024" icon="ohada" color={C.primary}
            action={<div style={{fontSize:11,padding:'3px 10px',borderRadius:20,background:C.primary_l,color:C.primary,fontWeight:600}}>OHADA / SYSCOHADA</div>}/>
          <div style={{padding:'16px 18px'}}>
            <BilanActif/><BilanPassif/>
          </div>
        </Card>
      )}

      {activeEtat==='cr'&&(
        <Card>
          <CardHead title="Compte de résultat — Mars 2024" icon="chart" color={C.primary}/>
          <div style={{padding:'16px 18px'}}>
            <Table cols={['Compte','Libellé','Montant 2024','Montant 2023']}
              rows={[
                ['70X','Chiffre d\'affaires net',<strong style={{color:C.primary}}>136 700 000 F</strong>,'98 500 000 F'],
                ['60X-62X','Achats & charges externes','- 38 250 000 F','- 28 000 000 F'],
                ['64X','Charges de personnel','- 22 320 000 F','- 18 500 000 F'],
                ['65X','Sous-traitance','- 9 500 000 F','- 7 200 000 F'],
                ['68X','Dotations amortissements','- 4 200 000 F','- 3 800 000 F'],
                ['','Résultat exploitation','62 430 000 F','41 000 000 F'],
                ['66X','Charges financières','- 850 000 F','- 1 200 000 F'],
                ['77X','Produits financiers','1 200 000 F','800 000 F'],
                ['','Résultat avant impôt','62 780 000 F','40 600 000 F'],
                ['691','Impôt sur les sociétés (IS)','- 29 780 000 F','- 15 600 000 F'],
                ['','','',''],
                ['','RÉSULTAT NET',<strong style={{color:C.primary,fontSize:15}}>33 000 000 F</strong>,<strong>25 000 000 F</strong>],
              ]}/>
          </div>
        </Card>
      )}

      {activeEtat==='flux'&&(
        <Card>
          <CardHead title="Tableau des flux de trésorerie — Mars 2024" icon="cashflow" color={C.teal}/>
          <div style={{padding:'16px 18px'}}>
            <Table cols={['Rubrique','Libellé','Montant']}
              rows={[
                ['A','ACTIVITÉS OPÉRATIONNELLES',''],
                ['','Encaissements clients',<span style={{color:C.primary,fontWeight:600}}>+ 75 448 000 F</span>],
                ['','Décaissements fournisseurs',<span style={{color:C.red,fontWeight:600}}>- 32 350 000 F</span>],
                ['','Charges de personnel payées',<span style={{color:C.red,fontWeight:600}}>- 18 000 000 F</span>],
                ['','TVA payée',<span style={{color:C.red,fontWeight:600}}>- 8 450 000 F</span>],
                ['','Flux net activités opérationnelles',<strong style={{color:C.primary}}>+ 16 648 000 F</strong>],
                ['B','ACTIVITÉS D\'INVESTISSEMENT',''],
                ['','Acquisition matériel',<span style={{color:C.red,fontWeight:600}}>- 2 500 000 F</span>],
                ['','Flux net investissements',<strong style={{color:C.red}}>- 2 500 000 F</strong>],
                ['C','ACTIVITÉS DE FINANCEMENT',''],
                ['','Remboursement emprunt',<span style={{color:C.red,fontWeight:600}}>- 1 500 000 F</span>],
                ['','Flux net financement',<strong style={{color:C.red}}>- 1 500 000 F</strong>],
                ['','',''],
                ['','VARIATION NETTE TRÉSORERIE',<strong style={{color:C.primary,fontSize:14}}>+ 12 648 000 F</strong>],
                ['','Trésorerie ouverture','45 552 000 F'],
                ['','TRÉSORERIE CLÔTURE',<strong style={{color:C.primary,fontSize:14}}>58 200 000 F</strong>],
              ]}/>
          </div>
        </Card>
      )}

      {activeEtat==='notes'&&(
        <Card>
          <CardHead title="Notes annexes SYSCOHADA" icon="report"/>
          <div style={{padding:'20px'}}>
            {[{t:'Note 1 — Méthodes comptables',c:'La société applique les règles du Système Comptable OHADA révisé (SYSCOHADA) et l\'Acte Uniforme relatif au Droit Comptable et à l\'Information Financière (AUDCIF) 2017. Les états financiers sont établis en FCFA.'},
              {t:'Note 2 — TVA',c:`La TVA applicable au Cameroun est de ${(TVA*100).toFixed(2)}%. La société est assujettie mensuellement. Le solde net TVA de mars 2024 s'élève à ${fmtN(Math.round(SEED_FACTURES.reduce((s,f)=>s+f.tva,0)*0.7))} FCFA.`},
              {t:'Note 3 — Immobilisations',c:'Les immobilisations sont comptabilisées au coût d\'acquisition diminué des amortissements cumulés. Les taux d\'amortissement linéaire appliqués : Bâtiments 5%, Matériel 20%, Matériel informatique 33%.'},
              {t:'Note 4 — Créances clients',c:'Les créances clients sont comptabilisées à leur valeur nominale. Une provision pour dépréciation est constituée dès lors que le risque de non-recouvrement est avéré.'},
            ].map((n,i)=>(
              <div key={i} style={{marginBottom:16,paddingBottom:16,borderBottom:i<3?`1px solid ${C.border}`:'none'}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:6}}>{n.t}</div>
                <div style={{fontSize:13,color:C.text2,lineHeight:1.7}}>{n.c}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// ================================================================
//  MODULE 9 — PAIE & RH FINANCIER
// ================================================================
const VuePayroll = () => {
  const [paie, setPaie] = useState(SEED_PAIE);
  const totalBrut    = paie.reduce((s,p)=>s+p.salaireBrut,0);
  const totalCnps    = paie.reduce((s,p)=>s+p.cnps,0);
  const totalIrpp    = paie.reduce((s,p)=>s+p.irpp,0);
  const totalNet     = paie.reduce((s,p)=>s+p.salaireNet,0);
  const chargesPatr  = Math.round(totalBrut*0.1085); // CNPS patronal Cameroun ~10.85%

  return(
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:20}}>
        {[{l:'Masse salariale brute',v:`${fmtM(totalBrut)} F`,c:C.text},
          {l:'CNPS employés',v:`${fmtM(totalCnps)} F`,c:C.red},
          {l:'IRPP',v:`${fmtM(totalIrpp)} F`,c:C.orange},
          {l:'Net à payer',v:`${fmtM(totalNet)} F`,c:C.primary},
          {l:'Charges patronales',v:`${fmtM(chargesPatr)} F`,c:C.purple},
        ].map((s,i)=>(
          <div key={i} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px',borderLeft:`4px solid ${s.c}`}}>
            <div style={{fontSize:10,color:C.text4,textTransform:'uppercase',letterSpacing:.4,marginBottom:5}}>{s.l}</div>
            <div style={{fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>

      <Card style={{marginBottom:16}}>
        <CardHead title="Bulletin de paie — Mars 2024" sub="Personnel interne CleanIT" icon="payroll"
          action={<div style={{display:'flex',gap:8}}><Btn label="Valider tout" variant="primary" sm icon="check"/><Btn label="Virer" variant="default" sm icon="bank"/></div>}/>
        <Table
          cols={['Matricule','Employé','Poste','Salaire Brut','CNPS (8.4%)','IRPP','Net à payer','Statut','Action']}
          rows={paie.map((p,i)=>[
            <span style={{fontSize:11,color:C.text4}}>{p.matricule}</span>,
            <strong style={{color:C.text}}>{p.nom}</strong>,
            <span style={{fontSize:11,color:C.text3}}>{p.poste}</span>,
            `${fmtN(p.salaireBrut)} F`,
            <span style={{color:C.red}}>{fmtN(p.cnps)} F</span>,
            <span style={{color:C.orange}}>{fmtN(p.irpp)} F</span>,
            <strong style={{color:C.primary,fontSize:13}}>{fmtN(p.salaireNet)} F</strong>,
            <Badge status={p.statut}/>,
            p.statut==='en_attente'
              ?<Btn label="Valider" variant="primary" sm onClick={()=>setPaie(prev=>prev.map((pe,idx)=>idx===i?{...pe,statut:'paye'}:pe))}/>
              :<span style={{fontSize:11,color:C.text4}}>✓ Payé</span>
          ])}
        />
      </Card>

      {/* Cotisations sociales */}
      <Card>
        <CardHead title="Déclarations sociales & fiscales" sub="Mars 2024" icon="tax"/>
        <div style={{padding:'16px 18px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:C.text3,marginBottom:10,textTransform:'uppercase',letterSpacing:.5}}>CNPS (Caisse Nationale de Prévoyance Sociale)</div>
            {[{l:'Cotisation employés (8.4%)',v:`${fmtN(totalCnps)} F`},{l:'Cotisation patronale (10.85%)',v:`${fmtN(chargesPatr)} F`},{l:'TOTAL CNPS',v:`${fmtN(totalCnps+chargesPatr)} F`,big:true}].map((t,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:i<2?`1px solid ${C.border}`:'none'}}>
                <span style={{fontSize:12,color:C.text3}}>{t.l}</span>
                <span style={{fontSize:t.big?15:13,fontWeight:t.big?700:600,color:t.big?C.primary:C.text}}>{t.v}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:C.text3,marginBottom:10,textTransform:'uppercase',letterSpacing:.5}}>IRPP (Impôt sur le Revenu des Personnes Physiques)</div>
            {[{l:'IRPP retenu à la source',v:`${fmtN(totalIrpp)} F`},{l:'Déclaration mensuelle',v:'15/04/2024'},{l:'TOTAL IRPP',v:`${fmtN(totalIrpp)} F`,big:true}].map((t,i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:i<2?`1px solid ${C.border}`:'none'}}>
                <span style={{fontSize:12,color:C.text3}}>{t.l}</span>
                <span style={{fontSize:t.big?15:13,fontWeight:t.big?700:600,color:t.big?C.orange:C.text}}>{t.v}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

// ================================================================
//  MODULE 10 — JOB COSTING & RENTABILITÉ PROJETS
//  Lié à : BC Huawei (budget), Dépenses (coûts réels), Factures (CA)
// ================================================================

// Données projets enrichies avec budget Huawei + dépenses réelles liées
const PROJETS_JC = [
  {
    id:'PROJ-2024-001',
    nom:'Déploiement 5G NR DLA-001',
    client:'MTN Cameroun',
    bcRef:'BC-HW-2024-143',
    // Prix Huawei (confidentiel PM)
    budgetHuawei:180000000,
    // Prix négocié CleanIT
    montantContrat:165000000,
    // Factures émises liées
    facturesIds:[1,3],
    // Dépenses réelles liées au projet
    depensesLiees:[
      {ref:'DEP-2024-001',libelle:'Équipements 5G NR Huawei',montant:28500000,categorie:'Équipements'},
      {ref:'DEP-2024-003',libelle:'Carburant terrain janvier',montant:850000,categorie:'Transport'},
      {ref:'DEP-2024-006',libelle:'Per diem techniciens terrain',montant:1800000,categorie:'Per diem'},
      {ref:'SAL-PORTION',libelle:'Salaires techniciens (portion)',montant:6000000,categorie:'Main oeuvre'},
    ],
    // Budget estimé par poste
    budgetEstime:{
      equipements:30000000,
      maindoeuvre:12000000,
      transport:2000000,
      perdiem:3000000,
      sousTraitance:5000000,
    },
    avancement:65,
    statut:'en_cours',
    dateDebut:'2024-01-15',
    dateFin:'2024-06-30',
    heures:480,
    chef:'Marie Kamga',
  },
  {
    id:'PROJ-2024-002',
    nom:'4G LTE YDE-001',
    client:'Orange Cameroun',
    bcRef:'BC-HW-2024-141',
    budgetHuawei:45000000,
    montantContrat:38000000,
    facturesIds:[2],
    depensesLiees:[
      {ref:'DEP-2024-002',libelle:'Antennes 4G LTE Nokia x12',montant:9232000,categorie:'Équipements'},
      {ref:'DEP-TRANS-002',libelle:'Transport équipements Limbé',montant:650000,categorie:'Transport'},
      {ref:'SAL-PORTION',libelle:'Salaires techniciens (portion)',montant:3500000,categorie:'Main oeuvre'},
    ],
    budgetEstime:{
      equipements:12000000,
      maindoeuvre:6000000,
      transport:1500000,
      perdiem:1500000,
      sousTraitance:2000000,
    },
    avancement:100,
    statut:'termine',
    dateDebut:'2024-02-01',
    dateFin:'2024-02-28',
    heures:320,
    chef:'Jean Fouda',
  },
  {
    id:'PROJ-2024-003',
    nom:'Infrastructure GAR-001',
    client:'Gouvernement Cameroun',
    bcRef:'BC-HW-2024-139',
    budgetHuawei:35000000,
    montantContrat:29000000,
    facturesIds:[4],
    depensesLiees:[
      {ref:'DEP-2024-005',libelle:'Maintenance 3G/4G Ericsson',montant:5610000,categorie:'Maintenance'},
      {ref:'DEP-2024-006',libelle:'Per diem techniciens Garoua',montant:1800000,categorie:'Per diem'},
      {ref:'DEP-TRANS-003',libelle:'Transport Garoua A/R',montant:1200000,categorie:'Transport'},
      {ref:'SAL-PORTION',libelle:'Salaires techniciens (portion)',montant:4500000,categorie:'Main oeuvre'},
    ],
    budgetEstime:{
      equipements:8000000,
      maindoeuvre:7000000,
      transport:2500000,
      perdiem:3000000,
      sousTraitance:3000000,
    },
    avancement:80,
    statut:'en_cours',
    dateDebut:'2024-03-08',
    dateFin:'2024-03-20',
    heures:720,
    chef:'Pierre Etoga',
  },
  {
    id:'PROJ-2024-004',
    nom:'Survey RF LIM-001',
    client:'Nexttel Cameroun',
    bcRef:'',
    budgetHuawei:0,
    montantContrat:5127750,
    facturesIds:[5],
    depensesLiees:[
      {ref:'DEP-TRANS-004',libelle:'Transport Limbé',montant:480000,categorie:'Transport'},
      {ref:'SAL-PORTION',libelle:'Salaires techniciens (portion)',montant:1800000,categorie:'Main oeuvre'},
    ],
    budgetEstime:{
      equipements:0,
      maindoeuvre:2000000,
      transport:800000,
      perdiem:500000,
      sousTraitance:0,
    },
    avancement:20,
    statut:'en_cours',
    dateDebut:'2024-03-01',
    dateFin:'2024-04-01',
    heures:160,
    chef:'Jean Fouda',
  },
  {
    id:'PROJ-2024-005',
    nom:'Fibre optique BFN-001',
    client:'CAMTEL',
    bcRef:'BC-HW-2024-148',
    budgetHuawei:220000000,
    montantContrat:195000000,
    facturesIds:[6],
    depensesLiees:[
      {ref:'DEP-CABLE',libelle:'Câble fibre optique 50km',montant:25000000,categorie:'Équipements'},
      {ref:'DEP-TRANS-005',libelle:'Transport matériel Bafoussam',montant:2200000,categorie:'Transport'},
    ],
    budgetEstime:{
      equipements:80000000,
      maindoeuvre:20000000,
      transport:8000000,
      perdiem:5000000,
      sousTraitance:15000000,
    },
    avancement:35,
    statut:'en_cours',
    dateDebut:'2024-03-10',
    dateFin:'2024-08-31',
    heures:0,
    chef:'Marie Kamga',
  },
];

const VueRentabilite = ({factures,depenses}) => {
  const [selProj, setSelProj] = useState(null);
  const [view, setView]       = useState('table'); // table | chart

  // Calculs dynamiques par projet
  const projetsCalc = PROJETS_JC.map(p => {
    const totalDepense = p.depensesLiees.reduce((s,d)=>s+d.montant,0);
    const totalBudgetEst = Object.values(p.budgetEstime).reduce((s,v)=>s+v,0);
    const caFacture   = factures.filter(f=>p.facturesIds.includes(f.id)).reduce((s,f)=>s+f.montantTTC,0);
    const margeReelle = caFacture - totalDepense;
    const margeContrat= p.montantContrat - totalDepense;
    const ecartBudget = totalBudgetEst - totalDepense;
    const pctDepense  = totalBudgetEst>0 ? Math.round(totalDepense/totalBudgetEst*100) : 0;
    const pctMarge    = caFacture>0 ? Math.round(margeReelle/caFacture*100) : 0;
    return {...p, totalDepense, totalBudgetEst, caFacture, margeReelle, margeContrat, ecartBudget, pctDepense, pctMarge};
  });

  const totalBudgets  = projetsCalc.reduce((s,p)=>s+p.budgetHuawei,0);
  const totalContrats = projetsCalc.reduce((s,p)=>s+p.montantContrat,0);
  const totalDepenses = projetsCalc.reduce((s,p)=>s+p.totalDepense,0);
  const totalCA       = projetsCalc.reduce((s,p)=>s+p.caFacture,0);
  const totalMarge    = totalCA - totalDepenses;

  const DATA_CHART = projetsCalc.map(p=>({
    name: p.id.replace('PROJ-2024-','P'),
    Budget: Math.round(p.totalBudgetEst/1e6*10)/10,
    Dépensé: Math.round(p.totalDepense/1e6*10)/10,
    'CA facturé': Math.round(p.caFacture/1e6*10)/10,
    Marge: Math.round(p.margeReelle/1e6*10)/10,
  }));

  const COULEURS_CAT = {
    'Équipements':C.blue,'Transport':C.orange,'Per diem':C.teal,
    'Main oeuvre':C.purple,'Maintenance':C.red,'Sous-traitance':C.primary,
  };

  return(
    <div>
      {/* KPIs globaux */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:20}}>
        {[
          {l:'Budget Huawei total',v:`${fmtM(totalBudgets)} F`,c:C.orange,
           sub:'Prix BC confidentiels',icon:'bc'},
          {l:'Contrats négociés',v:`${fmtM(totalContrats)} F`,c:C.blue,
           sub:`Marge brute: ${fmtM(totalBudgets-totalContrats)} F`,icon:'invoice'},
          {l:'Dépenses réelles',v:`${fmtM(totalDepenses)} F`,c:C.red,
           sub:`Sur ${projetsCalc.length} projets actifs`,icon:'expense'},
          {l:'CA facturé',v:`${fmtM(totalCA)} F`,c:C.primary,
           sub:'Factures émises liées',icon:'chart'},
          {l:'Marge nette réelle',v:`${fmtM(totalMarge)} F`,c:totalMarge>0?C.primary:C.red,
           sub:`${totalCA>0?Math.round(totalMarge/totalCA*100):0}% du CA`,icon:'trend_up'},
        ].map((s,i)=>(
          <div key={i} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,
            padding:'14px 16px',borderLeft:`4px solid ${s.c}`}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <span style={{fontSize:10,color:C.text4,textTransform:'uppercase',letterSpacing:.4}}>{s.l}</span>
              <Ico n={s.icon} s={15} c={s.c}/>
            </div>
            <div style={{fontSize:20,fontWeight:800,color:s.c,marginBottom:3}}>{s.v}</div>
            <div style={{fontSize:10,color:C.text4}}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Toggle table / chart */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:700,color:C.text}}>
          Job Costing — Budget Huawei vs Dépenses réelles vs CA facturé
        </div>
        <div style={{display:'flex',gap:6}}>
          {['table','chart'].map(v=>(
            <button key={v} onClick={()=>setView(v)}
              style={{padding:'5px 12px',borderRadius:6,border:`1px solid ${v===view?C.primary:C.border}`,
                background:v===view?C.primary_l:C.white,color:v===view?C.primary:C.text3,
                fontSize:11,fontWeight:v===view?700:400,cursor:'pointer',fontFamily:'inherit'}}>
              {v==='table'?'Tableau':'Graphique'}
            </button>
          ))}
          <Btn label="Exporter" variant="ghost" sm icon="download"/>
        </div>
      </div>

      {/* Vue graphique */}
      {view==='chart'&&(
        <Card style={{marginBottom:16}}>
          <CardHead title="Budget estimé vs Dépenses réelles vs CA — en millions FCFA" icon="chart"/>
          <div style={{padding:'16px'}}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={DATA_CHART} margin={{top:5,right:10,left:10,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                <XAxis dataKey="name" tick={{fontSize:11,fill:C.text3}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:C.text3}} axisLine={false} tickLine={false} unit="M"/>
                <Tooltip formatter={(v,n)=>[`${v}M FCFA`,n]}/>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:12}}/>
                <Bar dataKey="Budget" name="Budget estimé" fill={`${C.blue}70`} radius={[3,3,0,0]}/>
                <Bar dataKey="Dépensé" name="Dépenses réelles" fill={`${C.red}80`} radius={[3,3,0,0]}/>
                <Bar dataKey="CA facturé" name="CA facturé" fill={`${C.primary}90`} radius={[3,3,0,0]}/>
                <Bar dataKey="Marge" name="Marge nette" fill={`${C.teal}90`} radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Vue tableau */}
      {view==='table'&&(
        <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:16}}>
          {projetsCalc.map(p=>{
            const pctBudget = p.totalBudgetEst>0?Math.round(p.totalDepense/p.totalBudgetEst*100):0;
            const surBudget = p.totalDepense > p.totalBudgetEst;
            return(
              <Card key={p.id} onClick={()=>setSelProj(p===selProj?null:p)}
                style={{borderLeft:`4px solid ${p.statut==='termine'?C.primary:p.statut==='en_cours'?C.blue:C.text4}`}}>
                <div style={{padding:'14px 18px'}}>
                  {/* Header projet */}
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:4}}>
                        <span style={{fontSize:13,fontWeight:700,color:C.blue}}>{p.id}</span>
                        <span style={{fontSize:11,padding:'2px 8px',borderRadius:10,
                          background:p.statut==='termine'?C.primary_l:p.statut==='en_cours'?C.blue_l:C.bg2,
                          color:p.statut==='termine'?C.primary:p.statut==='en_cours'?C.blue:C.text3,
                          fontWeight:600}}>{p.statut==='termine'?'Terminé':p.statut==='en_cours'?'En cours':'Planifié'}</span>
                        {p.bcRef&&<span style={{fontSize:11,padding:'2px 8px',borderRadius:10,background:C.orange_l,color:C.orange}}>{p.bcRef}</span>}
                        {surBudget&&<span style={{fontSize:11,padding:'2px 8px',borderRadius:10,background:C.red_l,color:C.red,fontWeight:700}}>⚠ Hors budget</span>}
                      </div>
                      <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:2}}>{p.nom}</div>
                      <div style={{fontSize:11,color:C.text3}}>{p.client} · Chef: {p.chef} · {p.dateDebut} → {p.dateFin}</div>
                    </div>
                    {/* Avancement */}
                    <div style={{textAlign:'right',flexShrink:0,marginLeft:16}}>
                      <div style={{fontSize:22,fontWeight:800,color:C.blue}}>{p.avancement}%</div>
                      <div style={{fontSize:10,color:C.text4}}>Avancement</div>
                    </div>
                  </div>

                  {/* 4 métriques financières clés */}
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:12}}>
                    {[
                      {l:'Budget Huawei',v:p.budgetHuawei>0?`${fmtM(p.budgetHuawei)} F`:'Sans BC',
                       c:C.orange,bg:C.orange_l,lock:true},
                      {l:'Budget estimé projet',v:`${fmtM(p.totalBudgetEst)} F`,
                       c:C.blue,bg:C.blue_l,lock:false},
                      {l:'Dépenses réelles',v:`${fmtM(p.totalDepense)} F`,
                       c:surBudget?C.red:C.primary,bg:surBudget?C.red_l:C.primary_l,lock:false},
                      {l:'CA facturé client',v:p.caFacture>0?`${fmtM(p.caFacture)} F`:'Non facturé',
                       c:C.primary,bg:C.primary_l,lock:false},
                    ].map((m,i)=>(
                      <div key={i} style={{background:m.bg,borderRadius:8,padding:'10px 12px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:4,marginBottom:4}}>
                          <span style={{fontSize:9,color:m.c,textTransform:'uppercase',letterSpacing:.4,fontWeight:600}}>{m.l}</span>
                          {m.lock&&<Ico n="lock" s={9} c={C.orange}/>}
                        </div>
                        <div style={{fontSize:15,fontWeight:800,color:m.c}}>{m.v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Barres Budget estimé vs Dépensé */}
                  <div style={{marginBottom:8}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:C.text3,marginBottom:4}}>
                      <span>Budget consommé: <strong style={{color:surBudget?C.red:C.primary}}>{pctBudget}%</strong></span>
                      <span style={{color:C.text4}}>{fmtM(p.totalDepense)} F dépensé / {fmtM(p.totalBudgetEst)} F estimé</span>
                    </div>
                    <div style={{height:7,background:C.bg2,borderRadius:4,overflow:'hidden',position:'relative'}}>
                      <div style={{position:'absolute',top:0,left:0,height:'100%',
                        width:`${Math.min(pctBudget,100)}%`,
                        background:surBudget?C.red:pctBudget>80?C.orange:C.primary,
                        borderRadius:4,transition:'width .6s'}}/>
                    </div>
                    {surBudget&&(
                      <div style={{fontSize:10,color:C.red,marginTop:3}}>
                        ⚠ Dépassement de {fmtM(p.totalDepense-p.totalBudgetEst)} FCFA ({Math.round((p.totalDepense-p.totalBudgetEst)/p.totalBudgetEst*100)}%)
                      </div>
                    )}
                    {!surBudget&&p.ecartBudget>0&&(
                      <div style={{fontSize:10,color:C.primary,marginTop:3}}>
                        ✓ Reste {fmtM(p.ecartBudget)} FCFA disponible dans le budget
                      </div>
                    )}
                  </div>

                  {/* Marge */}
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',
                    background:p.margeReelle>0?C.primary_l:C.red_l,borderRadius:7}}>
                    <span style={{fontSize:12,color:C.text2}}>Marge nette réelle</span>
                    <div style={{textAlign:'right'}}>
                      <span style={{fontSize:16,fontWeight:800,color:p.margeReelle>0?C.primary:C.red}}>
                        {p.margeReelle>0?'+':''}{fmtM(p.margeReelle)} FCFA
                      </span>
                      {p.caFacture>0&&<span style={{fontSize:11,color:C.text3,marginLeft:8}}>
                        ({p.pctMarge}% du CA)
                      </span>}
                    </div>
                  </div>
                </div>

                {/* Détail dépenses (expanded) */}
                {selProj?.id===p.id&&(
                  <div style={{borderTop:`1px solid ${C.border}`,padding:'14px 18px',background:C.bg}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>

                      {/* Dépenses réelles liées */}
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:C.text3,textTransform:'uppercase',
                          letterSpacing:.5,marginBottom:10,display:'flex',alignItems:'center',gap:6}}>
                          <Ico n="expense" s={13} c={C.red}/>
                          Dépenses réelles liées au projet
                        </div>
                        {p.depensesLiees.map((d,i)=>(
                          <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',
                            padding:'7px 10px',background:C.white,borderRadius:7,marginBottom:5,
                            border:`1px solid ${C.border}`}}>
                            <div>
                              <div style={{fontSize:12,fontWeight:500,color:C.text}}>{d.libelle}</div>
                              <div style={{display:'flex',gap:6,marginTop:2}}>
                                <span style={{fontSize:9,padding:'1px 6px',borderRadius:8,
                                  background:`${COULEURS_CAT[d.categorie]||C.blue}15`,
                                  color:COULEURS_CAT[d.categorie]||C.blue,fontWeight:600}}>
                                  {d.categorie}
                                </span>
                                <span style={{fontSize:9,color:C.text4}}>{d.ref}</span>
                              </div>
                            </div>
                            <span style={{fontSize:13,fontWeight:700,color:C.red}}>{fmtM(d.montant)} F</span>
                          </div>
                        ))}
                        {/* Total */}
                        <div style={{display:'flex',justifyContent:'space-between',padding:'8px 10px',
                          background:C.red_l,borderRadius:7,border:`1px solid ${C.red}20`,marginTop:4}}>
                          <span style={{fontSize:12,fontWeight:700,color:C.text3}}>TOTAL DÉPENSÉ</span>
                          <span style={{fontSize:14,fontWeight:800,color:C.red}}>{fmtM(p.totalDepense)} FCFA</span>
                        </div>
                      </div>

                      {/* Budget estimé par poste vs réel */}
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:C.text3,textTransform:'uppercase',
                          letterSpacing:.5,marginBottom:10,display:'flex',alignItems:'center',gap:6}}>
                          <Ico n="chart" s={13} c={C.blue}/>
                          Budget estimé vs Réel par poste
                        </div>
                        {Object.entries(p.budgetEstime).map(([poste,budget],i)=>{
                          const labelMap = {
                            equipements:'Équipements',maindoeuvre:'Main oeuvre',
                            transport:'Transport',perdiem:'Per diem',sousTraitance:'Sous-traitance'
                          };
                          const reel = p.depensesLiees
                            .filter(d=>d.categorie===COULEURS_CAT[labelMap[poste]]?labelMap[poste]:labelMap[poste])
                            .reduce((s,d)=>s+d.montant,0);
                          const pct  = budget>0?Math.round(reel/budget*100):0;
                          const over = reel>budget;
                          return budget>0?(
                            <div key={i} style={{marginBottom:8}}>
                              <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:3}}>
                                <span style={{color:C.text2,fontWeight:500}}>{labelMap[poste]}</span>
                                <span style={{color:over?C.red:C.text3}}>
                                  {fmtM(reel)} / {fmtM(budget)} F
                                  <span style={{marginLeft:6,fontWeight:700,color:over?C.red:C.primary}}>{pct}%</span>
                                </span>
                              </div>
                              <div style={{height:5,background:C.bg2,borderRadius:3,overflow:'hidden'}}>
                                <div style={{height:'100%',width:`${Math.min(pct,100)}%`,
                                  background:over?C.red:pct>80?C.orange:C.blue,borderRadius:3}}/>
                              </div>
                            </div>
                          ):null;
                        })}

                        {/* Synthèse marge */}
                        <div style={{marginTop:12,padding:'10px 12px',background:C.blue_l,borderRadius:8,
                          border:`1px solid ${C.blue}20`}}>
                          <div style={{fontSize:11,fontWeight:700,color:C.blue,marginBottom:6}}>
                            SYNTHÈSE FINANCIÈRE
                          </div>
                          {[
                            {l:'Contrat CleanIT',v:`${fmtM(p.montantContrat)} F`,c:C.blue},
                            {l:'Total dépenses',v:`- ${fmtM(p.totalDepense)} F`,c:C.red},
                            {l:'Marge sur coûts',v:`${fmtM(p.margeContrat)} F`,c:p.margeContrat>0?C.primary:C.red},
                            {l:'CA facturé',v:`${fmtM(p.caFacture)} F`,c:C.primary},
                            {l:'Reste à facturer',v:`${fmtM(Math.max(0,p.montantContrat-p.caFacture))} F`,c:C.orange},
                          ].map(row=>(
                            <div key={row.l} style={{display:'flex',justifyContent:'space-between',
                              padding:'4px 0',borderBottom:`1px solid ${C.blue}15`}}>
                              <span style={{fontSize:11,color:C.text3}}>{row.l}</span>
                              <span style={{fontSize:11,fontWeight:700,color:row.c}}>{row.v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Lien vers factures liées */}
                    {p.facturesIds.length>0&&(
                      <div style={{marginTop:12,padding:'10px 12px',background:C.primary_l,borderRadius:8,
                        display:'flex',alignItems:'center',gap:10}}>
                        <Ico n="invoice" s={14} c={C.primary}/>
                        <span style={{fontSize:12,color:C.text2}}>
                          {p.facturesIds.length} facture(s) liée(s) à ce projet
                        </span>
                        <span style={{marginLeft:'auto',fontSize:13,fontWeight:700,color:C.primary}}>
                          {fmtM(p.caFacture)} FCFA facturé
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ================================================================
//  MODULE 11 — RAPPORTS & ANALYTICS
// ================================================================
const VueRapports = ({factures,depenses}) => {
  const RAPPORTS_LIST = [
    {n:'Profit & Loss (P&L)',d:'Compte de résultat mensuel — CA, charges, bénéfice net',icon:'chart',color:C.primary},
    {n:'Balance générale',d:'Soldes de tous les comptes SYSCOHADA — débit/crédit',icon:'report',color:C.blue},
    {n:'Bilan comptable OHADA',d:'Actif / Passif — Exercice en cours vs N-1',icon:'ohada',color:C.purple},
    {n:'Âge des créances (AR Aging)',d:'Factures clients par ancienneté — 0-30j, 31-60j, 61-90j, +90j',icon:'invoice',color:C.orange},
    {n:'Âge des dettes (AP Aging)',d:'Dettes fournisseurs par ancienneté',icon:'vendor',color:C.red},
    {n:'Cash Flow Statement',d:'Tableau des flux de trésorerie OHADA',icon:'cashflow',color:C.teal},
    {n:'TVA mensuelle',d:'Déclaration TVA — collectée, déductible, solde net',icon:'tax',color:C.orange},
    {n:'Rentabilité par projet',d:'CA, charges, marge par projet BC Huawei',icon:'job',color:C.primary},
    {n:'Performance commerciale',d:'CA par client, par période, par type de service',icon:'trend_up',color:C.blue},
    {n:'Prévisions trésorerie',d:'Projection trésorerie 3-6 mois — IA prédictive',icon:'ai',color:C.purple},
    {n:'Déclarations IRPP/CNPS',d:'Récapitulatif cotisations sociales & fiscales',icon:'payroll',color:C.teal},
    {n:'Rapport BC Huawei',d:'Synthèse marges sur bons de commande Huawei',icon:'bc',color:C.orange},
  ];

  return(
    <div>
      <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>Rapports disponibles — {RAPPORTS_LIST.length} rapports</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
        {RAPPORTS_LIST.map((r,i)=>(
          <Card key={i} onClick={()=>{}} style={{padding:'16px 18px',borderLeft:`3px solid ${r.color}`}}>
            <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
              <div style={{width:34,height:34,borderRadius:8,background:`${r.color}15`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <Ico n={r.icon} s={17} c={r.color}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:3}}>{r.n}</div>
                <div style={{fontSize:11,color:C.text4,marginBottom:10,lineHeight:1.5}}>{r.d}</div>
                <div style={{display:'flex',gap:6}}>
                  <Btn label="Générer" variant="primary" sm/>
                  <Btn label="Export Excel" variant="ghost" sm icon="download"/>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ================================================================
//  MODULE 12 — IA FINANCE AGENT
// ================================================================
const VueIAFinance = ({factures,depenses}) => {
  const navigate = useNavigate();
  const enRetard  = factures.filter(f=>f.status==='en_retard');
  const montantRetard = enRetard.reduce((s,f)=>s+toFCFA(f.montantTTC,f.devise),0);
  const totalCA   = factures.reduce((s,f)=>s+f.montantTTC,0);
  const totalDep  = depenses.reduce((s,d)=>s+toFCFA(d.montant,d.devise),0);
  const marge     = totalCA-totalDep;

  const INSIGHTS = [
    {type:'danger',icon:'alert',title:`${enRetard.length} facture(s) en retard — ${fmtM(montantRetard)} FCFA`,
     detail:'Orange Cameroun est en retard de 12 jours. Probabilité de paiement dans 30j : 62%. Recommandation : relance téléphonique + email recommandé.',
     action:'Envoyer relances',color:C.red},
    {type:'warning',icon:'trend_down',title:'Marge en baisse sur PROJ-2024-004',
     detail:'La marge sur Survey LIM-001 est à 12.2% vs objectif 25%. Les charges de transport ont dépassé le budget de 35%. Action corrective recommandée.',
     action:'Voir détails',color:C.orange},
    {type:'success',icon:'trend_up',title:'CA Q1 2024 en hausse de +18% vs Q1 2023',
     detail:`Chiffre d'affaires de ${fmtM(totalCA)} FCFA au Q1 2024. Objectif annuel : 900M FCFA. Pace actuel : ${fmtM(totalCA*4)} FCFA projeté. Excellente trajectoire.`,
     action:'Voir rapport',color:C.primary},
    {type:'info',icon:'tax',title:'Déclaration TVA à déposer avant le 15 avril',
     detail:`TVA nette due pour mars 2024 : ${fmtM(factures.reduce((s,f)=>s+f.tva,0)*0.7)} FCFA. Préparation automatique disponible. Délai de dépôt : 15/04/2024.`,
     action:'Préparer TVA',color:C.purple},
    {type:'info',icon:'cashflow',title:'Trésorerie prévisionnelle 3 mois',
     detail:'Projection IA : Trésorerie en hausse. Solde prévu au 30/06/2024 : 145M FCFA (+27%). Risque de trésorerie identifié en mai si FAC-2024-002 non réglée.',
     action:'Voir prévisions',color:C.teal},
    {type:'warning',icon:'bc',title:'BC-HW-2024-149 sans ressource disponible',
     detail:'Le BC de Maroua (MAR-001) n\'a aucun technicien disponible dans un rayon de 50km. Budget : 1.2M FCFA. Recommandation : recrutement externe ou partenaire local.',
     action:'Voir terrain',color:C.orange,navigate:'/terrain'},
  ];

  const PREVISIONS = [
    {mois:'Avr',caPrevu:38000000,chargesPrevu:22000000,margePrevu:16000000,confiance:92},
    {mois:'Mai',caPrevu:42000000,chargesPrevu:24000000,margePrevu:18000000,confiance:85},
    {mois:'Jun',caPrevu:45000000,chargesPrevu:25000000,margePrevu:20000000,confiance:78},
  ];

  return(
    <div>
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'14px 18px',background:C.primary_l,border:`1px solid ${C.primary}30`,borderRadius:10,marginBottom:20}}>
        <div style={{width:38,height:38,borderRadius:10,background:C.primary_l,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <Ico n="ai" s={20} c={C.primary}/>
        </div>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:C.text}}>IA Finance Agent — CleanIT</div>
          <div style={{fontSize:12,color:C.text3}}>Analyse continue de vos données financières · Dernière mise à jour : maintenant</div>
        </div>
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6,fontSize:12,color:C.primary,fontWeight:600,background:C.white,padding:'5px 12px',borderRadius:20,border:`1px solid ${C.primary}30`}}>
          <div style={{width:6,height:6,borderRadius:'50%',background:C.primary,animation:'pulse 2s infinite'}}/>
          En ligne
        </div>
      </div>

      {/* Insights IA */}
      <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:20}}>
        {INSIGHTS.map((insight,i)=>(
          <div key={i} style={{background:C.white,border:`1px solid ${insight.color}30`,borderRadius:10,padding:'14px 18px',borderLeft:`4px solid ${insight.color}`}}>
            <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
              <div style={{width:32,height:32,borderRadius:8,background:`${insight.color}15`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <Ico n={insight.icon} s={16} c={insight.color}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4}}>{insight.title}</div>
                <div style={{fontSize:12,color:C.text3,lineHeight:1.6,marginBottom:8}}>{insight.detail}</div>
                <Btn label={insight.action} variant="ghost" sm
                  onClick={()=>insight.navigate?navigate(insight.navigate):null}/>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prévisions trésorerie */}
      <Card>
        <CardHead title="Prévisions IA — Trésorerie 3 mois" sub="Confiance : 78-92%" icon="ai" color={C.purple}/>
        <div style={{padding:'16px 18px'}}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={PREVISIONS} margin={{top:5,right:10,left:10,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
              <XAxis dataKey="mois" tick={{fontSize:12,fill:C.text3}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:C.text3}} axisLine={false} tickLine={false} tickFormatter={v=>fmtM(v)}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:12}}/>
              <Bar dataKey="caPrevu" name="CA prévu" fill={`${C.primary}80`} radius={[3,3,0,0]}/>
              <Bar dataKey="chargesPrevu" name="Charges prévues" fill={`${C.red}70`} radius={[3,3,0,0]}/>
              <Bar dataKey="margePrevu" name="Marge prévue" fill={`${C.blue}90`} radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginTop:10}}>
            {PREVISIONS.map((p,i)=>(
              <div key={i} style={{background:C.bg,borderRadius:8,padding:'10px 14px',textAlign:'center'}}>
                <div style={{fontSize:11,color:C.text4,marginBottom:3}}>{p.mois} 2024</div>
                <div style={{fontSize:14,fontWeight:700,color:C.primary}}>{fmtM(p.margePrevu)} F</div>
                <div style={{fontSize:10,color:C.text4}}>Marge prévue</div>
                <div style={{fontSize:10,color:C.blue,marginTop:3}}>Confiance {p.confiance}%</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

// ================================================================
//  MODULE 13 — FOURNISSEURS
// ================================================================
const VueFournisseurs = () => {
  const FOURN_DATA = [
    {nom:'Huawei Technologies',pays:'Chine',devise:'FCFA/USD',soldeDu:28500000,soldeEchu:0,status:'ok',lastPay:'2024-01-15',contacts:'Mr. Chen Wei'},
    {nom:'Nokia Networks',pays:'France',devise:'USD',soldeDu:9232000,soldeEchu:9232000,status:'retard',lastPay:'2024-02-01',contacts:'Sophie Martin'},
    {nom:'Ericsson Cameroun',pays:'Cameroun',devise:'EUR',soldeDu:5610000,soldeEchu:0,status:'ok',lastPay:'2024-02-20',contacts:'Paul Biya Jr.'},
    {nom:'Total Énergies',pays:'Cameroun',devise:'FCFA',soldeDu:850000,soldeEchu:0,status:'ok',lastPay:'2024-01-31',contacts:'Marc Ateba'},
    {nom:'CAMTEL',pays:'Cameroun',devise:'FCFA',soldeDu:1200000,soldeEchu:1200000,status:'retard',lastPay:'2024-02-15',contacts:'Direction CAMTEL'},
  ];

  const totalDu    = FOURN_DATA.reduce((s,f)=>s+f.soldeDu,0);
  const totalEchu  = FOURN_DATA.reduce((s,f)=>s+f.soldeEchu,0);

  return(
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:18}}>
        {[{l:'Total dettes fournisseurs',v:`${fmtM(totalDu)} F`,c:C.red},
          {l:'Montants échus',v:`${fmtM(totalEchu)} F`,c:C.orange},
          {l:'Fournisseurs à payer',v:`${FOURN_DATA.filter(f=>f.soldeDu>0).length}`,c:C.primary},
        ].map((s,i)=>(
          <div key={i} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px',borderLeft:`4px solid ${s.c}`}}>
            <div style={{fontSize:10,color:C.text4,textTransform:'uppercase',letterSpacing:.4,marginBottom:5}}>{s.l}</div>
            <div style={{fontSize:20,fontWeight:700,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>
      <Card>
        <CardHead title="Fournisseurs — Comptes fournisseurs (AP)" icon="vendor"
          action={<Btn label="Nouveau fournisseur" variant="primary" sm icon="plus"/>}/>
        <Table
          cols={['Fournisseur','Pays','Devise','Solde dû','Échu','Dernier paiement','Statut','Actions']}
          rows={FOURN_DATA.map(f=>[
            <strong style={{color:C.text}}>{f.nom}</strong>,
            f.pays, f.devise,
            <span style={{color:C.red,fontWeight:600}}>{fmtN(f.soldeDu)} F</span>,
            <span style={{color:f.soldeEchu>0?C.red:C.text4}}>{f.soldeEchu>0?`${fmtN(f.soldeEchu)} F`:'—'}</span>,
            fmtD(f.lastPay),
            <Badge status={f.status==='ok'?'valide':'en_retard'} label={f.status==='ok'?'À jour':'En retard'}/>,
            <div style={{display:'flex',gap:4}}>
              <Btn label="Payer" variant="primary" sm/>
              <Btn label="Détails" variant="ghost" sm/>
            </div>
          ])}
        />
      </Card>
    </div>
  );
};

// ================================================================
//  NAVIGATION PRINCIPALE
// ================================================================
const NAV = [
  {id:'dashboard',   label:'Tableau de bord',    icon:'home'},
  {id:'factures',    label:'Facturation (AR)',    icon:'invoice'},
  {id:'depenses',    label:'Dépenses (AP)',       icon:'expense'},
  {id:'bc_huawei',   label:'BC Huawei — Marges', icon:'bc'},
  {id:'tresorerie',  label:'Trésorerie & Banque', icon:'bank'},
  {id:'comptable',   label:'Plan comptable OHADA',icon:'ohada'},
  {id:'tva',         label:'TVA & Fiscalité',     icon:'tax'},
  {id:'ohada',       label:'États financiers',    icon:'report'},
  {id:'paie',        label:'Paie & RH financier', icon:'payroll'},
  {id:'rentabilite', label:'Job Costing',         icon:'job'},
  {id:'rapports',    label:'Rapports',            icon:'chart'},
  {id:'ia_finance',  label:'IA Finance Agent',    icon:'ai'},
  {id:'fournisseurs',label:'Fournisseurs',        icon:'vendor'},
];

// ================================================================
//  EXPORT PRINCIPAL
// ================================================================
export default function Finance() {
  const navigate = useNavigate();
  const [nav,       setNav]       = useState('dashboard');
  const [factures,  setFactures]  = useState(SEED_FACTURES);
  const [depenses,  setDepenses]  = useState(SEED_DEPENSES);
  const [searchQ,   setSearchQ]   = useState('');
  const [showSearch,setShowSearch]= useState(false);

  const totalCA   = factures.reduce((s,f)=>s+f.montantTTC,0);
  const totalDep  = depenses.reduce((s,d)=>s+toFCFA(d.montant,d.devise),0);
  const benefice  = totalCA-totalDep;
  const currentNav= NAV.find(n=>n.id===nav);

  const SCREENS = {
    dashboard:   <DashboardFinance factures={factures} depenses={depenses} onNavigate={setNav}/>,
    factures:    <VueFactures factures={factures} setFactures={setFactures}/>,
    depenses:    <VueDepenses depenses={depenses} setDepenses={setDepenses}/>,
    bc_huawei:   <VueBCHuawei/>,
    tresorerie:  <VueTresorerie/>,
    comptable:   <VuePlanComptable/>,
    tva:         <VueTVA factures={factures} depenses={depenses}/>,
    ohada:       <VueOHADA/>,
    paie:        <VuePayroll/>,
    rentabilite: <VueRentabilite factures={factures} depenses={depenses}/>,
    rapports:    <VueRapports factures={factures} depenses={depenses}/>,
    ia_finance:  <VueIAFinance factures={factures} depenses={depenses}/>,
    fournisseurs:<VueFournisseurs/>,
  };

  // Groupes de navigation pour le menu horizontal
  const NAV_GROUPS = [
    {label:'Vue générale', items:['dashboard']},
    {label:'Transactions',    items:['factures','depenses','bc_huawei','fournisseurs']},
    {label:'Trésorerie',      items:['tresorerie']},
    {label:'Comptabilité',    items:['comptable','tva','ohada']},
    {label:'Paie & Projets',  items:['paie','rentabilite']},
    {label:'Analyses',        items:['rapports','ia_finance']},
  ];

  const activeGroup = NAV_GROUPS.find(g=>g.items.includes(nav));

  return(
    <div style={{minHeight:'100vh',background:C.bg,fontFamily:'"Inter","Segoe UI",Arial,sans-serif',WebkitFontSmoothing:'antialiased'}}>
      <style>{`
        @keyframes slideIn{from{transform:translateX(100%)}to{transform:none}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
        ::-webkit-scrollbar-track{background:transparent}
      `}</style>

      {/* ===== TOPBAR PRINCIPAL ===== */}
      <div style={{background:C.sidebar,position:'sticky',top:0,zIndex:200,boxShadow:'0 2px 8px rgba(0,0,0,.15)'}}>

        {/* Ligne 1 — Logo + KPIs + actions */}
        <div style={{display:'flex',alignItems:'center',padding:'0 24px',height:50,gap:0,borderBottom:`1px solid #1F2937`}}>
          {/* Logo */}
          <div style={{display:'flex',alignItems:'center',gap:9,paddingRight:20,marginRight:8,borderRight:`1px solid #374151`}}>
            <div style={{width:28,height:28,borderRadius:7,background:C.primary,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <Ico n="chart" s={14} c="white"/>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:'white',letterSpacing:-.2}}>
                CLEAN<span style={{color:C.primary}}>IT</span>
                <span style={{fontSize:9,fontWeight:400,color:'#6B7280',marginLeft:6}}>Finance</span>
              </div>
            </div>
          </div>

          {/* KPIs inline */}
          <div style={{display:'flex',gap:1,background:'#1F2937',borderRadius:7,overflow:'hidden',marginRight:12}}>
            {[{l:'CA',v:fmtM(totalCA),c:'#34D399'},{l:'Charges',v:fmtM(totalDep),c:'#F87171'},{l:'Bénéfice',v:fmtM(benefice),c:'#60A5FA'}].map(s=>(
              <div key={s.l} style={{padding:'5px 12px',textAlign:'center'}}>
                <div style={{fontSize:8,color:'#6B7280',textTransform:'uppercase',letterSpacing:.4}}>{s.l}</div>
                <div style={{fontSize:12,fontWeight:700,color:s.c}}>{s.v} F</div>
              </div>
            ))}
          </div>

          {/* Séparateur */}
          <div style={{fontSize:10,color:'#4B5563',padding:'3px 10px',borderRadius:20,background:'#1F2937',marginRight:'auto',fontWeight:600}}>
            OHADA · TVA {(TVA*100).toFixed(2)}% · FCFA
          </div>

          {/* Actions droite */}
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <div style={{display:'flex',alignItems:'center',gap:7,background:'#1F2937',border:`1px solid #374151`,borderRadius:7,padding:'5px 10px'}}>
              <Ico n="search" s={13} c="#6B7280"/>
              <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Rechercher..."
                style={{border:'none',outline:'none',fontSize:12,color:'white',background:'transparent',width:150,fontFamily:'inherit'}}/>
            </div>
            <button onClick={()=>setNav('factures')}
              style={{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 14px',borderRadius:7,border:'none',background:C.primary,color:'white',fontWeight:600,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
              <Ico n="plus" s={13} c="white"/>
              Nouvelle transaction
            </button>
            <button onClick={()=>navigate('/terrain')}
              style={{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:7,border:`1px solid #374151`,background:'transparent',color:'#9CA3AF',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}
              onMouseEnter={e=>e.currentTarget.style.background='#1F2937'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <Ico n="terrain" s={12} c="#9CA3AF"/>
              Terrain
            </button>
          </div>
        </div>

        {/* Ligne 2 — Navigation par groupes */}
        <div style={{display:'flex',padding:'0 24px',gap:0,overflowX:'auto'}}>
          {NAV_GROUPS.map(group=>(
            <div key={group.label} style={{position:'relative',flexShrink:0}}>
              {/* Groupe header */}
              <button
                onClick={()=>setNav(group.items[0])}
                style={{padding:'0 14px',height:38,border:'none',background:'transparent',
                  color:activeGroup?.label===group.label?'white':'#9CA3AF',
                  fontWeight:activeGroup?.label===group.label?700:400,
                  fontSize:12,cursor:'pointer',fontFamily:'inherit',
                  borderBottom:activeGroup?.label===group.label?`2px solid ${C.primary}`:'2px solid transparent',
                  whiteSpace:'nowrap',transition:'all .12s'}}
                onMouseEnter={e=>{if(activeGroup?.label!==group.label)e.currentTarget.style.color='#D1D5DB'}}
                onMouseLeave={e=>{if(activeGroup?.label!==group.label)e.currentTarget.style.color='#9CA3AF'}}>
                {group.label}
              </button>
            </div>
          ))}
        </div>

        {/* Ligne 3 — Sous-onglets du groupe actif */}
        {activeGroup&&activeGroup.items.length>1&&(
          <div style={{display:'flex',padding:'0 24px',gap:2,background:'#1F2937',overflowX:'auto'}}>
            {activeGroup.items.map(itemId=>{
              const item=NAV.find(n=>n.id===itemId);
              if(!item) return null;
              const active=nav===item.id;
              return(
                <button key={item.id} onClick={()=>setNav(item.id)}
                  style={{display:'inline-flex',alignItems:'center',gap:6,padding:'7px 14px',
                    border:'none',background:active?`${C.primary}20`:'transparent',
                    borderRadius:'6px 6px 0 0',color:active?C.primary:'#6B7280',
                    fontWeight:active?600:400,fontSize:11,cursor:'pointer',fontFamily:'inherit',
                    whiteSpace:'nowrap',borderBottom:active?`2px solid ${C.primary}`:'2px solid transparent',
                    transition:'all .12s'}}
                  onMouseEnter={e=>{if(!active)e.currentTarget.style.color='#9CA3AF'}}
                  onMouseLeave={e=>{if(!active)e.currentTarget.style.color='#6B7280'}}>
                  <Ico n={item.icon} s={12} c={active?C.primary:'#6B7280'}/>
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== CONTENU PRINCIPAL ===== */}
      <div style={{padding:'20px 24px',maxWidth:1440,margin:'0 auto'}}>
        {SCREENS[nav]||SCREENS.dashboard}
      </div>
    </div>
  );
}
