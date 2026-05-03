import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Q = {
  green:'#2CA01C', green2:'#1E8A10', green_l:'#EBF9E8', green_m:'#C8ECC3',
  blue:'#0077C5', blue2:'#005FA3', blue_l:'#E5F2FC',
  red:'#D52B1E', red_l:'#FDECEA',
  orange:'#E27000', orange_l:'#FEF3E2',
  purple:'#6B3FA0', purple_l:'#F3EEF9',
  text:'#1A1A1A', text2:'#3D3D3D', text3:'#6B7280', text4:'#9CA3AF',
  border:'#D1D5DB', border2:'#E5E7EB', border3:'#F3F4F6',
  bg:'#F5F5F5', bg2:'#FAFAFA', white:'#FFFFFF',
  sidebar:'#FFFFFF',
};

const TVA = 0.1925;
const FX = { FCFA:1, USD:610, EUR:660, CNY:84, XAF:1 };
const TODAY = new Date().toISOString().split("T")[0];

const fN = (n) => new Intl.NumberFormat("fr-FR").format(Math.round(n||0));
const fM = (n) => { const a=Math.abs(n||0); return a>=1e9?(n/1e9).toFixed(2)+"Md":a>=1e6?(n/1e6).toFixed(1)+"M":a>=1e3?(n/1e3).toFixed(0)+"K":String(Math.round(n||0)); };
const fD = (d) => d?new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}):"—";
const fD2 = (d) => d?new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"}):"—";
const toF = (m,d) => (m||0)*(FX[d]||1);

const ICONS = {
  home:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  invoice:"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  estimate:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2",
  receive:"M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M7 10l5 5 5-5",
  customer:"M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  vendor:"M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16",
  bill:"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6",
  paybill:"M12 2v4 M12 18v4 M4.93 4.93l2.83 2.83 M16.24 16.24l2.83 2.83 M2 12h4 M18 12h4",
  po:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2",
  bank:"M3 21h18 M3 10h18 M5 6l7-3 7 3 M4 10v11 M20 10v11 M8 14v3 M12 14v3 M16 14v3",
  recon:"M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  chart:"M18 20V10 M12 20V4 M6 20v-6",
  report:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  tax:"M9 14l2 2 4-4 M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  payroll:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  time:"M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 6v6l4 2",
  coa:"M4 6h16 M4 10h16 M4 14h16 M4 18h16",
  journal:"M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z",
  inventory:"M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  job:"M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
  bc:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2",
  import:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  plus:"M12 5v14 M5 12h14",
  search:"M21 21l-4.35-4.35 M17 11A6 6 0 115 11a6 6 0 0112 0z",
  close:"M18 6L6 18 M6 6l12 12",
  check:"M20 6L9 17l-5-5",
  edit:"M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  download:"M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  print:"M6 9V2h12v7 M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2 M6 14h12v8H6z",
  mail:"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  lock:"M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4",
  ai:"M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  chevr:"M9 18l6-6-6-6",
  chevd:"M6 9l6 6 6-6",
  alert:"M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
  money:"M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  terrain:"M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z",
  refresh:"M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  info:"M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 16v-4 M12 8h.01",
  settings:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
};

const Ico = ({n,s=16,c="currentColor"}) => {
  const d=ICONS[n]; if(!d) return null;
  return(
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke={c} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      style={{display:"block",flexShrink:0}}>
      {d.split(" M ").map((seg,i)=><path key={i} d={i===0?seg:"M "+seg}/>)}
    </svg>
  );
};

// ===== DONNEES =====
const INIT_CUSTOMERS = [
  {id:"C001",company:"MTN Cameroun",contact:"Alain Nkoulou",email:"a.nkoulou@mtn.cm",phone:"+237 222 501 000",city:"Douala",terms:"Net 30",creditLimit:500000000,taxCode:"TVA",balance:28500000,currency:"FCFA",type:"Telecom"},
  {id:"C002",company:"Orange Cameroun",contact:"Sophie Biyong",email:"s.biyong@orange.cm",phone:"+237 222 502 000",city:"Yaounde",terms:"Net 45",creditLimit:300000000,taxCode:"TVA",balance:10195875,currency:"FCFA",type:"Telecom"},
  {id:"C003",company:"Huawei Technologies",contact:"Mr. Chen Wei",email:"c.wei@huawei.com",phone:"+237 233 401 000",city:"Douala",terms:"Net 60",creditLimit:1000000000,taxCode:"Exonere",balance:28060000,currency:"USD",type:"OEM"},
  {id:"C004",company:"Gouvernement Cameroun",contact:"DG Marches Publics",email:"dg@marchespublics.cm",phone:"+237 222 230 000",city:"Yaounde",terms:"Net 90",creditLimit:2000000000,taxCode:"Exonere",balance:38160000,currency:"FCFA",type:"Gouvernement"},
  {id:"C005",company:"CAMTEL",contact:"DG CAMTEL",email:"dg@camtel.cm",phone:"+237 222 225 000",city:"Yaounde",terms:"Net 60",creditLimit:800000000,taxCode:"TVA",balance:71550000,currency:"FCFA",type:"Telecom"},
  {id:"C006",company:"Nexttel Cameroun",contact:"Pierre Essomba",email:"p.essomba@nexttel.cm",phone:"+237 222 610 000",city:"Douala",terms:"Net 30",creditLimit:100000000,taxCode:"TVA",balance:5127750,currency:"FCFA",type:"Telecom"},
];

const INIT_VENDORS = [
  {id:"V001",company:"Huawei Technologies",contact:"Mr. Chen Wei",email:"c.wei@huawei.com",phone:"+237 233 401 000",city:"Douala",terms:"Net 60",accountNum:"HW-CM-001",taxId:"P012345678A",currency:"USD",balance:28500000},
  {id:"V002",company:"Nokia Networks",contact:"Sophie Martin",email:"s.martin@nokia.com",phone:"+33 1 40 80 00 00",city:"Paris",terms:"Net 45",accountNum:"NOK-001",taxId:"",currency:"USD",balance:9232000},
  {id:"V003",company:"Ericsson Cameroun",contact:"Paul Biya Jr",email:"p.biya@ericsson.cm",phone:"+237 222 230 500",city:"Yaounde",terms:"Net 30",accountNum:"ERI-001",taxId:"P098765432B",currency:"EUR",balance:5610000},
  {id:"V004",company:"Total Energies Cameroun",contact:"Marc Ateba",email:"m.ateba@total.cm",phone:"+237 222 420 000",city:"Douala",terms:"Net 15",accountNum:"TOT-001",taxId:"P112233445C",currency:"FCFA",balance:850000},
  {id:"V005",company:"CAMTEL",contact:"Direction Commerciale",email:"dc@camtel.cm",phone:"+237 222 225 000",city:"Yaounde",terms:"Net 30",accountNum:"CAM-001",taxId:"P556677889D",currency:"FCFA",balance:1200000},
];

const INIT_JOBS = [
  {id:"JOB-001",customerId:"C001",name:"Installation 5G NR DLA-001",bcRef:"BC-HW-2024-143",status:"In Progress",startDate:"2024-01-15",endDate:"2024-06-30",description:"Deploiement 5G NR site Akwa Douala",jobType:"Telecom Installation",budgetHuawei:180000000,contractAmount:165000000,estimate:{labor:12000000,materials:30000000,subcontractors:5000000,equipment:2000000,overhead:3000000},phases:[{id:"PH1",name:"Phase 1 Mobilisation",pct:30,amount:49500000,status:"invoiced",invoiceRef:"INV-2024-001"},{id:"PH2",name:"Phase 2 Travaux",pct:40,amount:66000000,status:"pending",invoiceRef:null},{id:"PH3",name:"Phase 3 Reception",pct:30,amount:49500000,status:"pending",invoiceRef:null}]},
  {id:"JOB-002",customerId:"C002",name:"4G LTE Maintenance YDE-001",bcRef:"BC-HW-2024-141",status:"Closed",startDate:"2024-02-01",endDate:"2024-02-28",description:"Maintenance reseau 4G LTE Yaounde",jobType:"Maintenance",budgetHuawei:45000000,contractAmount:38000000,estimate:{labor:6000000,materials:12000000,subcontractors:2000000,equipment:500000,overhead:1500000},phases:[{id:"PH1",name:"Paiement unique",pct:100,amount:38000000,status:"invoiced",invoiceRef:"INV-2024-002"}]},
  {id:"JOB-003",customerId:"C004",name:"Infrastructure GAR-001",bcRef:"BC-HW-2024-139",status:"In Progress",startDate:"2024-03-08",endDate:"2024-04-30",description:"Infrastructure telecom zones rurales Garoua",jobType:"Infrastructure",budgetHuawei:35000000,contractAmount:29000000,estimate:{labor:7000000,materials:8000000,subcontractors:3000000,equipment:1000000,overhead:2000000},phases:[{id:"PH1",name:"Acompte 30%",pct:30,amount:8700000,status:"invoiced",invoiceRef:"INV-2024-004"},{id:"PH2",name:"Solde 70%",pct:70,amount:20300000,status:"pending",invoiceRef:null}]},
  {id:"JOB-004",customerId:"C005",name:"Fibre Optique BFN-001",bcRef:"BC-HW-2024-148",status:"Awarded",startDate:"2024-03-10",endDate:"2024-08-31",description:"Deploiement fibre 50km Bafoussam Nord",jobType:"Fiber",budgetHuawei:220000000,contractAmount:195000000,estimate:{labor:20000000,materials:80000000,subcontractors:15000000,equipment:5000000,overhead:8000000},phases:[{id:"PH1",name:"Phase 1 Genie civil",pct:35,amount:68250000,status:"pending",invoiceRef:null},{id:"PH2",name:"Phase 2 Tirage cable",pct:40,amount:78000000,status:"pending",invoiceRef:null},{id:"PH3",name:"Phase 3 Raccordements",pct:25,amount:48750000,status:"pending",invoiceRef:null}]},
];

const INIT_INVOICES = [
  {id:"INV-2024-001",customerId:"C001",jobId:"JOB-001",date:"2024-01-15",dueDate:"2024-02-15",terms:"Net 30",poNumber:"PO-MTN-001",memo:"Installation 5G NR DLA-001 Phase 1",lines:[{item:"Service Installation 5G",desc:"Installation antennes 5G NR DLA-001",qty:1,rate:8500000,amount:8500000,taxable:true,account:"704"},{item:"Main oeuvre techniciens",desc:"Main oeuvre terrain 15 jours",qty:15,rate:350000,amount:5250000,taxable:true,account:"704"},{item:"Materiel consommable",desc:"Cablage et consommables",qty:1,rate:300000,amount:300000,taxable:false,account:"704"}],subtotal:14050000,taxRate:0.1925,taxAmount:2696250,total:16746250,amountPaid:5000000,balance:11746250,status:"Partial",payments:[{date:"2024-01-20",amount:5000000,method:"Virement bancaire",ref:"VIR-MTN-001"}],currency:"FCFA"},
  {id:"INV-2024-002",customerId:"C002",jobId:"JOB-002",date:"2024-01-28",dueDate:"2024-03-01",terms:"Net 45",poNumber:"",memo:"4G LTE Maintenance YDE-001",lines:[{item:"Service Maintenance 4G",desc:"Maintenance preventive reseau 4G LTE",qty:1,rate:7200000,amount:7200000,taxable:true,account:"704"},{item:"Configuration reseau",desc:"Configuration et tests",qty:1,rate:1350000,amount:1350000,taxable:true,account:"704"}],subtotal:8550000,taxRate:0.1925,taxAmount:1645875,total:10195875,amountPaid:0,balance:10195875,status:"Overdue",payments:[],currency:"FCFA"},
  {id:"INV-2024-003",customerId:"C003",jobId:"JOB-001",date:"2024-02-10",dueDate:"2024-03-15",terms:"Net 30",poNumber:"HW-PO-143",memo:"Engineering Services 5G BC-HW-2024-143",lines:[{item:"Engineering Services",desc:"5G NR Engineering and Site Supervision",qty:40,rate:850,amount:34000,taxable:false,account:"704"},{item:"Technical Supervision",desc:"Technical site management",qty:10,rate:1200,amount:12000,taxable:false,account:"704"}],subtotal:46000,taxRate:0,taxAmount:0,total:46000,amountPaid:46000,balance:0,status:"Paid",payments:[{date:"2024-02-25",amount:46000,method:"Virement SWIFT",ref:"SWIFT-HW-001"}],currency:"USD"},
  {id:"INV-2024-004",customerId:"C004",jobId:"JOB-003",date:"2024-02-01",dueDate:"2024-04-01",terms:"Net 60",poNumber:"GOV-BTP-001",memo:"Infrastructure Telecom GAR-001 Acompte 30%",lines:[{item:"Infrastructure Telecom",desc:"Infrastructure telecom zones rurales Garoua",qty:1,rate:27000000,amount:27000000,taxable:true,account:"704"},{item:"Maintenance annuelle",desc:"Contrat maintenance preventive 12 mois",qty:1,rate:5000000,amount:5000000,taxable:true,account:"706"}],subtotal:32000000,taxRate:0.1925,taxAmount:6160000,total:38160000,amountPaid:11448000,balance:26712000,status:"Partial",payments:[{date:"2024-02-15",amount:11448000,method:"Virement bancaire",ref:"TRESOR-2024-001"}],currency:"FCFA"},
  {id:"INV-2024-005",customerId:"C005",jobId:"JOB-004",date:"2024-03-10",dueDate:"2024-05-10",terms:"Net 60",poNumber:"CAM-FO-001",memo:"Fibre Optique BFN-001",lines:[{item:"Installation Fibre 50km",desc:"Pose cable fibre optique 50km Bafoussam",qty:50,rate:1200000,amount:60000000,taxable:true,account:"704"}],subtotal:60000000,taxRate:0.1925,taxAmount:11550000,total:71550000,amountPaid:0,balance:71550000,status:"Sent",payments:[],currency:"FCFA"},
];

const INIT_BILLS = [
  {id:"BILL-2024-001",vendorId:"V001",date:"2024-01-15",dueDate:"2024-03-15",refNum:"HW-INV-2024-143",memo:"Equipements 5G NR BC-HW-2024-143",lines:[{account:"604",desc:"BBU 5900 5G NR x2",amount:50000000,job:"JOB-001"},{account:"604",desc:"RRU 5258 4T4R x6",amount:51000000,job:"JOB-001"}],total:101000000,amountPaid:28500000,balance:72500000,status:"Partial",payments:[{date:"2024-01-20",amount:28500000,method:"Virement SWIFT",ref:"SWIFT-001"}],currency:"FCFA"},
  {id:"BILL-2024-002",vendorId:"V002",date:"2024-02-01",dueDate:"2024-03-15",refNum:"NOK-INV-2024-001",memo:"Antennes 4G LTE x12",lines:[{account:"604",desc:"Antennes Nokia 4G LTE MIMO x12",amount:9232000,job:"JOB-002"}],total:9232000,amountPaid:0,balance:9232000,status:"Unpaid",payments:[],currency:"FCFA"},
  {id:"BILL-2024-003",vendorId:"V004",date:"2024-01-31",dueDate:"2024-02-15",refNum:"TOT-JAN-2024",memo:"Carburant vehicules terrain janvier 2024",lines:[{account:"624",desc:"Carburant vehicules terrain",amount:850000,job:null}],total:850000,amountPaid:850000,balance:0,status:"Paid",payments:[{date:"2024-02-05",amount:850000,method:"Cheque",ref:"CHQ-2024-001"}],currency:"FCFA"},
  {id:"BILL-2024-004",vendorId:"V005",date:"2024-02-15",dueDate:"2024-03-15",refNum:"CAM-Q1-2024",memo:"Liaisons fibre optique backbone Q1",lines:[{account:"626",desc:"Liaisons fibre optique permanentes",amount:1200000,job:null}],total:1200000,amountPaid:0,balance:1200000,status:"Unpaid",payments:[],currency:"FCFA"},
];

const INIT_POS = [
  {id:"PO-2024-001",vendorId:"V001",date:"2024-01-10",expectedDate:"2024-01-20",memo:"Equipements 5G NR pour BC-HW-2024-143",lines:[{item:"BBU 5900 5G NR",qty:2,rate:25000000,amount:50000000,account:"604",job:"JOB-001",received:2},{item:"RRU 5258 4T4R",qty:6,rate:8500000,amount:51000000,account:"604",job:"JOB-001",received:6}],total:101000000,status:"Received",currency:"FCFA"},
  {id:"PO-2024-002",vendorId:"V002",date:"2024-01-25",expectedDate:"2024-02-10",memo:"Antennes 4G LTE pour maintenance Orange",lines:[{item:"Antenne Nokia MIMO 4G",qty:12,rate:769333,amount:9232000,account:"604",job:"JOB-002",received:12}],total:9232000,status:"Received",currency:"FCFA"},
  {id:"PO-2024-003",vendorId:"V001",date:"2024-03-05",expectedDate:"2024-03-25",memo:"Equipements Fibre Optique BFN-001",lines:[{item:"Cable FTTH G657A2",qty:50,rate:450000,amount:22500000,account:"604",job:"JOB-004",received:0},{item:"Boitier epissure",qty:50,rate:85000,amount:4250000,account:"604",job:"JOB-004",received:0}],total:26750000,status:"Open",currency:"FCFA"},
];

const INIT_BANKS = [
  {id:"B001",name:"BICEC Compte principal",accountNum:"****4521",balance:45200000,type:"Checking",currency:"FCFA",lastSync:"2024-03-28"},
  {id:"B002",name:"SGC Compte operationnel",accountNum:"****8834",balance:12500000,type:"Checking",currency:"FCFA",lastSync:"2024-03-28"},
  {id:"B003",name:"Caisse principale Douala",accountNum:"CAISSE-001",balance:850000,type:"Cash",currency:"FCFA",lastSync:"2024-03-28"},
];

const INIT_EMPLOYEES = [
  {id:"E001",firstName:"Marie",lastName:"Kamga",title:"Chef de Projet Senior",dept:"Operations",hireDate:"2020-03-01",payType:"Salary",payRate:850000,status:"Active"},
  {id:"E002",firstName:"Jean",lastName:"Fouda",title:"Project Manager",dept:"Operations",hireDate:"2021-01-15",payType:"Salary",payRate:750000,status:"Active"},
  {id:"E003",firstName:"Pierre",lastName:"Etoga",title:"Ingenieur Reseau Senior",dept:"Technique",hireDate:"2019-06-01",payType:"Salary",payRate:900000,status:"Active"},
  {id:"E004",firstName:"Alice",lastName:"Finance",title:"Directrice Financiere",dept:"Finance",hireDate:"2018-01-01",payType:"Salary",payRate:1200000,status:"Active"},
  {id:"E005",firstName:"Bob",lastName:"Comptable",title:"Chef Comptable",dept:"Finance",hireDate:"2020-09-01",payType:"Salary",payRate:750000,status:"Active"},
];

const INIT_ITEMS = [
  {id:"I001",type:"Service",name:"Service Installation 5G",desc:"Installation et configuration equipements 5G NR",rate:9000000,account:"704",taxable:true},
  {id:"I002",type:"Service",name:"Service Maintenance Reseau",desc:"Maintenance preventive et corrective reseau telecom",rate:5000000,account:"704",taxable:true},
  {id:"I003",type:"Service",name:"Engineering Services",desc:"Services ingenierie telecoms USD",rate:1200,account:"704",taxable:false},
  {id:"I004",type:"Service",name:"Survey RF",desc:"Releve et analyse mesures radiofrequences",rate:3500000,account:"704",taxable:true},
  {id:"I005",type:"Service",name:"Rapport Technique",desc:"Redaction rapport technique detaille",rate:800000,account:"704",taxable:true},
  {id:"I006",type:"Inventory Part",name:"BBU 5900 5G NR",desc:"Baseband Unit Huawei 5G NR",rate:25000000,account:"701",taxable:false,qty:2,prefVendor:"V001"},
  {id:"I007",type:"Inventory Part",name:"RRU 5258 4T4R",desc:"Remote Radio Unit Huawei",rate:8500000,account:"701",taxable:false,qty:0,prefVendor:"V001"},
  {id:"I008",type:"Inventory Part",name:"Antenne Nokia MIMO 4G",desc:"Antenne Nokia ALG 4T4R",rate:769333,account:"701",taxable:false,qty:0,prefVendor:"V002"},
  {id:"I009",type:"Non-inventory Part",name:"Cable fibre FTTH",desc:"Cable fibre optique G657A2",rate:450000,account:"604",taxable:false},
  {id:"I010",type:"Other Charge",name:"Per diem terrain",desc:"Indemnite terrain par technicien par jour",rate:30000,account:"625",taxable:false},
];

const INIT_BC = [
  {id:"BC-HW-2024-143",status:"Traite",dateReception:"2024-01-08",client:"MTN Cameroun",site:"DLA-001",type:"5G NR Installation",montantTotal:180000000,currency:"FCFA",jobId:"JOB-001",importMethod:"PDF auto",lignes:[{desc:"BBU 5900 5G NR",qte:2,pu:25000000,total:50000000},{desc:"RRU 5258 4T4R",qte:6,pu:8500000,total:51000000},{desc:"Installation et configuration",qte:1,pu:35000000,total:35000000},{desc:"Engineering services",qte:1,pu:44000000,total:44000000}]},
  {id:"BC-HW-2024-141",status:"Traite",dateReception:"2024-01-20",client:"Orange Cameroun",site:"YDE-001",type:"4G LTE Maintenance",montantTotal:45000000,currency:"FCFA",jobId:"JOB-002",importMethod:"PDF auto",lignes:[{desc:"Survey RF et audit reseau",qte:1,pu:15000000,total:15000000},{desc:"Remplacement antennes 4G LTE x12",qte:12,pu:1500000,total:18000000},{desc:"Optimisation parametres",qte:1,pu:12000000,total:12000000}]},
  {id:"BC-HW-2024-148",status:"Traite",dateReception:"2024-03-01",client:"CAMTEL",site:"BFN-001",type:"Fibre Optique",montantTotal:220000000,currency:"FCFA",jobId:"JOB-004",importMethod:"PDF auto",lignes:[{desc:"Cable fibre FTTH 50km",qte:50,pu:1500000,total:75000000},{desc:"Boitiers epissure x50",qte:50,pu:200000,total:10000000},{desc:"Genie civil tranchees",qte:1,pu:85000000,total:85000000},{desc:"Raccordements et tests",qte:1,pu:50000000,total:50000000}]},
  {id:"BC-HW-2024-149",status:"En attente",dateReception:"2024-03-15",client:"Nexttel",site:"MAR-001",type:"Survey RF",montantTotal:18000000,currency:"FCFA",jobId:null,importMethod:"Excel auto",lignes:[{desc:"Survey RF zones nord",qte:1,pu:10000000,total:10000000},{desc:"Rapport optimisation",qte:1,pu:8000000,total:8000000}]},
];

const INIT_COA = [
  {num:"101",name:"Capital social",type:"Equity",balance:50000000,normal:"C",sub:false},
  {num:"106",name:"Reserves legales",type:"Equity",balance:8500000,normal:"C",sub:false},
  {num:"120",name:"Resultat de l exercice",type:"Equity",balance:33000000,normal:"C",sub:false},
  {num:"161",name:"Emprunts bancaires",type:"Long Term Liability",balance:15000000,normal:"C",sub:false},
  {num:"221",name:"Batiments",type:"Fixed Asset",balance:5000000,normal:"D",sub:false},
  {num:"241",name:"Materiel et outillage",type:"Fixed Asset",balance:18500000,normal:"D",sub:false},
  {num:"244",name:"Materiel informatique",type:"Fixed Asset",balance:4200000,normal:"D",sub:false},
  {num:"321",name:"Matieres premieres",type:"Other Current Asset",balance:2500000,normal:"D",sub:false},
  {num:"401",name:"Fournisseurs dettes",type:"Accounts Payable",balance:0,normal:"C",sub:false},
  {num:"411",name:"Clients creances",type:"Accounts Receivable",balance:0,normal:"D",sub:false},
  {num:"421",name:"Personnel remunerations",type:"Other Current Liability",balance:0,normal:"C",sub:false},
  {num:"441",name:"Etat TVA collectee",type:"Other Current Liability",balance:0,normal:"C",sub:false},
  {num:"442",name:"Etat TVA deductible",type:"Other Current Asset",balance:0,normal:"D",sub:false},
  {num:"521",name:"Banque BICEC principal",type:"Bank",balance:45200000,normal:"D",sub:false},
  {num:"522",name:"Banque SGC operationnel",type:"Bank",balance:12500000,normal:"D",sub:false},
  {num:"531",name:"Caisse principale",type:"Bank",balance:850000,normal:"D",sub:false},
  {num:"601",name:"Achats de marchandises",type:"Cost of Goods Sold",balance:0,normal:"D",sub:false},
  {num:"604",name:"Achats matieres et fournitures",type:"Cost of Goods Sold",balance:0,normal:"D",sub:false},
  {num:"624",name:"Transport sur achats et ventes",type:"Expense",balance:0,normal:"D",sub:false},
  {num:"626",name:"Frais de telecommunications",type:"Expense",balance:0,normal:"D",sub:false},
  {num:"641",name:"Appointements et salaires",type:"Expense",balance:0,normal:"D",sub:false},
  {num:"645",name:"Charges sociales patronales",type:"Expense",balance:0,normal:"D",sub:false},
  {num:"701",name:"Ventes de marchandises",type:"Income",balance:0,normal:"C",sub:false},
  {num:"704",name:"Travaux etudes prestations",type:"Income",balance:0,normal:"C",sub:false},
  {num:"706",name:"Services vendus",type:"Income",balance:0,normal:"C",sub:false},
];

const INIT_PAYROLL = [
  {id:"PAY-2024-003",period:"Mars 2024",payDate:"2024-03-31",status:"Processed",
   employees:[
     {empId:"E001",name:"Marie Kamga",gross:850000,cnpsEmp:71400,irpp:95000,net:683600},
     {empId:"E002",name:"Jean Fouda",gross:750000,cnpsEmp:63000,irpp:75000,net:612000},
     {empId:"E003",name:"Pierre Etoga",gross:900000,cnpsEmp:75600,irpp:110000,net:714400},
     {empId:"E004",name:"Alice Finance",gross:1200000,cnpsEmp:100800,irpp:185000,net:914200},
     {empId:"E005",name:"Bob Comptable",gross:750000,cnpsEmp:63000,irpp:75000,net:612000},
   ]},
];

const INIT_TIME = [
  {id:"TE-001",empId:"E001",date:"2024-03-15",job:"JOB-001",service:"Chef de Projet",hours:8,billable:true,rate:53125,note:"Supervision installation antennes"},
  {id:"TE-002",empId:"E002",date:"2024-03-15",job:"JOB-001",service:"PM Terrain",hours:8,billable:true,rate:46875,note:"Coordination equipe terrain DLA-001"},
  {id:"TE-003",empId:"E003",date:"2024-03-16",job:"JOB-003",service:"Ingenieur Reseau",hours:10,billable:true,rate:56250,note:"Configuration equipements Garoua"},
  {id:"TE-004",empId:"E001",date:"2024-03-18",job:"JOB-004",service:"Chef de Projet",hours:6,billable:false,rate:0,note:"Reunion preparation BFN-001"},
  {id:"TE-005",empId:"E002",date:"2024-03-20",job:"JOB-002",service:"PM Terrain",hours:8,billable:true,rate:46875,note:"Cloture projet YDE-001"},
];

// ===== COMPOSANTS UI =====
const StatusBadge = ({status}) => {
  const cfg = {
    "Paid":      {l:"Paye",        c:Q.green,  bg:Q.green_l},
    "Partial":   {l:"Partiel",     c:Q.orange, bg:Q.orange_l},
    "Overdue":   {l:"En retard",   c:Q.red,    bg:Q.red_l},
    "Sent":      {l:"Envoye",      c:Q.blue,   bg:Q.blue_l},
    "Draft":     {l:"Brouillon",   c:Q.text3,  bg:Q.border3},
    "Unpaid":    {l:"Non paye",    c:Q.red,    bg:Q.red_l},
    "Open":      {l:"Ouvert",      c:Q.blue,   bg:Q.blue_l},
    "Received":  {l:"Recu",        c:Q.green,  bg:Q.green_l},
    "Closed":    {l:"Cloture",     c:Q.text3,  bg:Q.border3},
    "Accepted":  {l:"Accepte",     c:Q.green,  bg:Q.green_l},
    "Pending":   {l:"En attente",  c:Q.orange, bg:Q.orange_l},
    "In Progress":{l:"En cours",   c:Q.blue,   bg:Q.blue_l},
    "Awarded":   {l:"Attribue",    c:Q.purple, bg:Q.purple_l},
    "Processed": {l:"Traite",      c:Q.green,  bg:Q.green_l},
    "Active":    {l:"Actif",       c:Q.green,  bg:Q.green_l},
    "Traite":    {l:"Traite",      c:Q.green,  bg:Q.green_l},
    "matched":   {l:"Rapproche",   c:Q.green,  bg:Q.green_l},
    "unmatched": {l:"A rapprocher",c:Q.orange, bg:Q.orange_l},
  }[status]||{l:status,c:Q.text3,bg:Q.border3};
  return(
    <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 9px",
      borderRadius:20,background:cfg.bg,color:cfg.c,fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>
      <span style={{width:5,height:5,borderRadius:"50%",background:cfg.c,flexShrink:0}}/>
      {cfg.l}
    </span>
  );
};

const QBtn = ({label,onClick,variant="default",icon,sm,full,disabled}) => {
  const styles = {
    primary: {background:Q.green,     color:"white", border:"none"},
    blue:    {background:Q.blue,      color:"white", border:"none"},
    danger:  {background:Q.red,       color:"white", border:"none"},
    default: {background:Q.white,     color:Q.text2, border:"1px solid "+Q.border},
    ghost:   {background:"transparent",color:Q.blue, border:"1px solid "+Q.blue},
    light:   {background:Q.bg,        color:Q.text2, border:"1px solid "+Q.border},
  }[variant]||{background:Q.white,color:Q.text2,border:"1px solid "+Q.border};
  return(
    <button onClick={onClick} disabled={disabled}
      style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,
        padding:sm?"5px 12px":"8px 16px",borderRadius:4,
        border:styles.border,background:disabled?"#E5E7EB":styles.background,
        color:disabled?Q.text4:styles.color,
        fontWeight:600,fontSize:sm?12:13,cursor:disabled?"not-allowed":"pointer",
        fontFamily:"inherit",width:full?"100%":"auto",transition:"opacity .12s"}}
      onMouseEnter={e=>{if(!disabled)e.currentTarget.style.opacity=".85"}}
      onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
      {icon&&<Ico n={icon} s={sm?12:14} c={disabled?Q.text4:styles.color}/>}
      {label}
    </button>
  );
};

const QInput = ({type="text",value,onChange,placeholder,disabled,prefix,suffix,small}) => (
  <div style={{position:"relative",display:"flex",alignItems:"center"}}>
    {prefix&&<span style={{position:"absolute",left:9,fontSize:13,color:Q.text3,pointerEvents:"none",zIndex:1}}>{prefix}</span>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)}
      placeholder={placeholder||""} disabled={disabled}
      style={{width:"100%",padding:small?"5px 9px":"8px 11px",
        paddingLeft:prefix?26:small?9:11,paddingRight:suffix?26:small?9:11,
        borderRadius:3,border:"1px solid "+Q.border,
        fontSize:small?12:13,color:disabled?Q.text4:Q.text,
        background:disabled?Q.bg:Q.white,boxSizing:"border-box",
        outline:"none",fontFamily:"inherit"}}
      onFocus={e=>e.target.style.borderColor=Q.blue}
      onBlur={e=>e.target.style.borderColor=Q.border}/>
    {suffix&&<span style={{position:"absolute",right:9,fontSize:12,color:Q.text3,pointerEvents:"none"}}>{suffix}</span>}
  </div>
);

const QSelect = ({value,onChange,options,placeholder,small,disabled}) => (
  <select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled}
    style={{width:"100%",padding:small?"5px 9px":"8px 11px",borderRadius:3,
      border:"1px solid "+Q.border,fontSize:small?12:13,
      color:value?Q.text:Q.text4,background:disabled?Q.bg:Q.white,
      cursor:disabled?"not-allowed":"pointer",outline:"none",fontFamily:"inherit"}}
    onFocus={e=>e.target.style.borderColor=Q.blue}
    onBlur={e=>e.target.style.borderColor=Q.border}>
    {placeholder&&<option value="">{placeholder}</option>}
    {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
  </select>
);

const QTextarea = ({value,onChange,placeholder,rows=3}) => (
  <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{width:"100%",padding:"8px 11px",borderRadius:3,border:"1px solid "+Q.border,
      fontSize:13,color:Q.text,background:Q.white,resize:"vertical",
      boxSizing:"border-box",outline:"none",fontFamily:"inherit"}}
    onFocus={e=>e.target.style.borderColor=Q.blue}
    onBlur={e=>e.target.style.borderColor=Q.border}/>
);

const QField = ({label,children,required,col}) => (
  <div style={{gridColumn:col?"1/-1":"auto"}}>
    <label style={{display:"block",fontSize:12,fontWeight:600,color:Q.text3,marginBottom:4}}>
      {label}{required&&<span style={{color:Q.red,marginLeft:2}}>*</span>}
    </label>
    {children}
  </div>
);

const QTable = ({cols,rows,onRowClick,empty="Aucun enregistrement",compact}) => (
  <div style={{border:"1px solid "+Q.border,borderRadius:4,overflow:"hidden",background:Q.white}}>
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",minWidth:400}}>
        <thead>
          <tr style={{background:"#F9FAFB",borderBottom:"2px solid "+Q.border}}>
            {cols.map((col,i)=>(
              <th key={i} style={{padding:compact?"7px 12px":"9px 14px",
                textAlign:col.right?"right":"left",fontSize:11,fontWeight:700,
                color:Q.text3,textTransform:"uppercase",letterSpacing:.4,
                whiteSpace:"nowrap",width:col.w}}>
                {col.l||col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length===0&&(
            <tr><td colSpan={cols.length} style={{padding:"32px",textAlign:"center",color:Q.text4,fontSize:13}}>{empty}</td></tr>
          )}
          {rows.map((row,i)=>(
            <tr key={i} onClick={()=>onRowClick&&onRowClick(i)}
              style={{borderBottom:"1px solid "+Q.border2,
                cursor:onRowClick?"pointer":"default",
                background:i%2===0?Q.white:"#FAFAFA",transition:"background .1s"}}
              onMouseEnter={e=>{if(onRowClick)e.currentTarget.style.background=Q.blue_l}}
              onMouseLeave={e=>{if(onRowClick)e.currentTarget.style.background=i%2===0?Q.white:"#FAFAFA"}}>
              {row.map((cell,j)=>(
                <td key={j} style={{padding:compact?"7px 12px":"10px 14px",fontSize:13,
                  color:Q.text,verticalAlign:"middle",
                  textAlign:cols[j]&&cols[j].right?"right":"left"}}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const QPanel = ({title,sub,onClose,children,width=720,footer}) => (
  <div style={{position:"fixed",inset:0,zIndex:600,display:"flex",justifyContent:"flex-end"}}>
    <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.35)"}}/>
    <div style={{position:"relative",width,maxWidth:"97vw",height:"100vh",
      background:Q.white,boxShadow:"-4px 0 32px rgba(0,0,0,.12)",
      display:"flex",flexDirection:"column",overflow:"hidden",
      animation:"qbSlide .2s ease"}}>
      <div style={{padding:"14px 20px",borderBottom:"1px solid "+Q.border,
        display:"flex",justifyContent:"space-between",alignItems:"center",
        background:"#F9FAFB",flexShrink:0}}>
        <div>
          {sub&&<div style={{fontSize:10,color:Q.text4,textTransform:"uppercase",letterSpacing:.5,marginBottom:1}}>{sub}</div>}
          <div style={{fontSize:17,fontWeight:700,color:Q.text}}>{title}</div>
        </div>
        <button onClick={onClose}
          style={{width:28,height:28,borderRadius:3,border:"1px solid "+Q.border,
            background:Q.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Ico n="close" s={14} c={Q.text3}/>
        </button>
      </div>
      <div style={{flex:1,overflow:"auto",padding:"18px 20px"}}>{children}</div>
      {footer&&(
        <div style={{padding:"12px 20px",borderTop:"1px solid "+Q.border,
          background:"#F9FAFB",display:"flex",gap:8,justifyContent:"flex-end",flexShrink:0}}>
          {footer}
        </div>
      )}
    </div>
  </div>
);

const QKpi = ({label,value,sub,color=Q.green,icon,onClick,trend,badge}) => (
  <div onClick={onClick}
    style={{background:Q.white,border:"1px solid "+Q.border,borderRadius:4,
      padding:"16px 18px",cursor:onClick?"pointer":"default",
      transition:"box-shadow .15s",borderTop:"3px solid "+color}}
    onMouseEnter={e=>{if(onClick)e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,.08)"}}
    onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
      <span style={{fontSize:11,fontWeight:600,color:Q.text3,textTransform:"uppercase",letterSpacing:.4}}>{label}</span>
      {icon&&<div style={{width:30,height:30,borderRadius:4,background:color+"20",
        display:"flex",alignItems:"center",justifyContent:"center"}}>
        <Ico n={icon} s={15} c={color}/>
      </div>}
    </div>
    <div style={{fontSize:24,fontWeight:700,color:Q.text,marginBottom:3}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:Q.text4}}>{sub}</div>}
    {trend!==undefined&&(
      <div style={{display:"inline-flex",alignItems:"center",gap:3,marginTop:5,
        fontSize:11,fontWeight:600,color:trend>=0?Q.green:Q.red}}>
        {trend>=0?"↑":"↓"} {Math.abs(trend)}% vs M-1
      </div>
    )}
    {badge&&<div style={{marginTop:6,fontSize:10,fontWeight:600,
      color:badge.c,background:badge.bg,padding:"2px 7px",borderRadius:10,display:"inline-flex"}}>
      {badge.l}
    </div>}
  </div>
);

const QTooltip = ({active,payload,label}) => {
  if(!active||!payload||!payload.length) return null;
  return(
    <div style={{background:Q.white,border:"1px solid "+Q.border,borderRadius:4,
      padding:"10px 14px",boxShadow:"0 4px 12px rgba(0,0,0,.1)"}}>
      <div style={{fontSize:11,fontWeight:600,color:Q.text3,marginBottom:6}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}>
          <div style={{width:10,height:10,borderRadius:2,background:p.color}}/>
          <span style={{fontSize:12,color:Q.text}}>{p.name}: <strong>{fM(p.value)} F</strong></span>
        </div>
      ))}
    </div>
  );
};

// ================================================================
//  DASHBOARD HOME
// ================================================================
const ViewHome = ({invoices,bills,jobs,onNav}) => {
  const navigate = useNavigate();
  const totalAR   = invoices.reduce((s,i)=>s+(i.balance||0)*(i.currency==="USD"?FX.USD:1),0);
  const totalAP   = bills.reduce((s,b)=>s+(b.balance||0),0);
  const totalCA   = invoices.reduce((s,i)=>s+toF(i.total,i.currency),0);
  const totalPaid = invoices.reduce((s,i)=>s+toF(i.amountPaid,i.currency),0);
  const overdue   = invoices.filter(i=>i.status==="Overdue");

  const CASH_DATA = [
    {m:"Oct",in:18500000,out:12000000},{m:"Nov",in:22000000,out:14500000},
    {m:"Dec",in:28000000,out:16000000},{m:"Jan",in:25000000,out:18000000},
    {m:"Fev",in:31000000,out:19500000},{m:"Mar",in:42000000,out:25000000},
  ];

  const QUICK_ACTIONS = [
    {l:"Nouvelle facture",icon:"invoice",color:Q.green,nav:"new_invoice"},
    {l:"Recevoir paiement",icon:"receive",color:Q.blue,nav:"invoices"},
    {l:"Saisir un bill",icon:"bill",color:Q.orange,nav:"new_bill"},
    {l:"Payer un bill",icon:"paybill",color:Q.red,nav:"bills"},
    {l:"Nouveau devis",icon:"estimate",color:Q.purple,nav:"estimates"},
    {l:"Import BC Huawei",icon:"import",color:Q.orange,nav:"bc_import"},
    {l:"Saisir heures",icon:"time",color:Q.blue,nav:"time"},
    {l:"Lancer la paie",icon:"payroll",color:Q.green,nav:"payroll"},
    {l:"Rapprocher banque",icon:"recon",color:Q.purple,nav:"banking"},
    {l:"Rapport P et L",icon:"report",color:Q.text3,nav:"reports"},
    {l:"Module Terrain",icon:"terrain",color:Q.green,nav:"_terrain"},
    {l:"Plan comptable",icon:"coa",color:Q.text3,nav:"coa"},
  ];

  return (
    <div>
      {overdue.length>0&&(
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 18px",
          background:"#FEF3C7",border:"1px solid "+Q.orange+"40",borderRadius:4,marginBottom:18}}>
          <Ico n="alert" s={15} c={Q.orange}/>
          <span style={{fontSize:13,color:Q.text2,flex:1}}>
            <strong style={{color:Q.orange}}>Alerte : </strong>
            {overdue.length} facture(s) en retard — {fM(overdue.reduce((s,i)=>s+i.balance,0))} FCFA
          </span>
          <QBtn label="Voir les retards" variant="ghost" sm onClick={()=>onNav("invoices")}/>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
        <QKpi label="Chiffre d affaires" value={fM(totalCA)+" F"}
          sub={invoices.length+" factures emises"} trend={18} color={Q.green} icon="chart"
          onClick={()=>onNav("invoices")}/>
        <QKpi label="Encours clients AR" value={fM(totalAR)+" F"}
          sub={invoices.filter(i=>i.balance>0).length+" factures en attente"}
          color={Q.blue} icon="invoice" onClick={()=>onNav("invoices")}
          badge={overdue.length>0?{l:overdue.length+" en retard",c:Q.red,bg:Q.red_l}:null}/>
        <QKpi label="Dettes fournisseurs AP" value={fM(totalAP)+" F"}
          sub={bills.filter(b=>b.balance>0).length+" bills a payer"}
          color={Q.orange} icon="bill" onClick={()=>onNav("bills")}/>
        <QKpi label="Tresorerie" value={fM(58550000)+" F"}
          sub="BICEC + SGC + Caisse" trend={12} color={Q.green} icon="bank"
          onClick={()=>onNav("banking")}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:14,marginBottom:16}}>
        <div style={{background:Q.white,border:"1px solid "+Q.border,borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:"1px solid "+Q.border,
            display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,fontWeight:700,color:Q.text}}>Cash Flow — 6 derniers mois</span>
            <QBtn label="Rapport complet" variant="light" sm icon="report" onClick={()=>onNav("reports")}/>
          </div>
          <div style={{padding:"14px 16px"}}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={CASH_DATA} margin={{top:5,right:5,left:0,bottom:0}}>
                <defs>
                  <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={Q.green} stopOpacity={.15}/>
                    <stop offset="95%" stopColor={Q.green} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={Q.red} stopOpacity={.1}/>
                    <stop offset="95%" stopColor={Q.red} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={Q.border2} vertical={false}/>
                <XAxis dataKey="m" tick={{fontSize:11,fill:Q.text3}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:Q.text3}} axisLine={false} tickLine={false} tickFormatter={fM}/>
                <Tooltip content={<QTooltip/>}/>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:11}}/>
                <Area type="monotone" dataKey="in" name="Entrees" stroke={Q.green} strokeWidth={2} fill="url(#gIn)"/>
                <Area type="monotone" dataKey="out" name="Sorties" stroke={Q.red} strokeWidth={2} fill="url(#gOut)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:Q.white,border:"1px solid "+Q.border,borderRadius:4,overflow:"hidden",flex:1}}>
            <div style={{padding:"10px 14px",borderBottom:"1px solid "+Q.border,fontSize:13,fontWeight:700,color:Q.text}}>AR Resume</div>
            <div style={{padding:"12px 14px"}}>
              {[
                {l:"Total facture",v:fM(totalCA),c:Q.text},
                {l:"Encaisse",v:fM(totalPaid),c:Q.green},
                {l:"En attente",v:fM(totalAR),c:Q.orange},
                {l:"En retard",v:fM(overdue.reduce((s,i)=>s+i.balance,0)),c:Q.red},
              ].map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",
                  padding:"5px 0",borderBottom:i<3?"1px solid "+Q.border2:"none"}}>
                  <span style={{fontSize:12,color:Q.text3}}>{r.l}</span>
                  <span style={{fontSize:12,fontWeight:700,color:r.c}}>{r.v} F</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{background:Q.white,border:"1px solid "+Q.border,borderRadius:4,padding:"12px 14px",flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:Q.text,marginBottom:10}}>AP Aging</div>
            {[{l:"Courant",v:1200000,c:Q.green},{l:"1-30j",v:9232000,c:Q.orange},{l:"31-60j",v:28500000,c:Q.red}].map((a,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"5px 0",borderBottom:i<2?"1px solid "+Q.border2:"none"}}>
                <span style={{fontSize:12,color:Q.text3}}>{a.l}</span>
                <span style={{fontSize:12,fontWeight:700,color:a.c}}>{fM(a.v)} F</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{background:Q.white,border:"1px solid "+Q.border,borderRadius:4,overflow:"hidden",marginBottom:16}}>
        <div style={{padding:"10px 16px",borderBottom:"1px solid "+Q.border,fontSize:13,fontWeight:700,color:Q.text}}>
          Actions rapides
        </div>
        <div style={{padding:"14px 16px",display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10}}>
          {QUICK_ACTIONS.map((a,i)=>(
            <button key={i} onClick={()=>a.nav==="_terrain"?navigate("/terrain"):onNav(a.nav)}
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,
                padding:"12px 8px",borderRadius:4,border:"1px solid "+Q.border2,
                background:Q.bg,cursor:"pointer",fontFamily:"inherit",transition:"all .12s"}}
              onMouseEnter={e=>{e.currentTarget.style.background=a.color+"10";e.currentTarget.style.borderColor=a.color+"40"}}
              onMouseLeave={e=>{e.currentTarget.style.background=Q.bg;e.currentTarget.style.borderColor=Q.border2}}>
              <div style={{width:36,height:36,borderRadius:4,background:a.color+"15",
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Ico n={a.icon} s={18} c={a.color}/>
              </div>
              <span style={{fontSize:10,fontWeight:600,color:Q.text2,textAlign:"center",lineHeight:1.3}}>{a.l}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{background:Q.white,border:"1px solid "+Q.border,borderRadius:4,overflow:"hidden"}}>
        <div style={{padding:"10px 16px",borderBottom:"1px solid "+Q.border,
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:13,fontWeight:700,color:Q.text}}>Jobs actifs</span>
          <QBtn label="Voir tous" variant="light" sm onClick={()=>onNav("jobs")}/>
        </div>
        <QTable
          cols={[{l:"Job"},{l:"Client"},{l:"BC Huawei"},{l:"Statut"},{l:"Contrat",right:true},{l:"Facture",right:true},{l:"Avancement"}]}
          rows={jobs.map(j=>{
            const cust=INIT_CUSTOMERS.find(c=>c.id===j.customerId);
            const inv=invoices.filter(i=>i.jobId===j.id);
            const facture=inv.reduce((s,i)=>s+toF(i.total,i.currency),0);
            const pct=j.contractAmount>0?Math.round(facture/j.contractAmount*100):0;
            return[
              <span style={{fontWeight:700,color:Q.blue,cursor:"pointer"}} onClick={()=>onNav("jobs")}>{j.name}</span>,
              cust?cust.company:"—",
              j.bcRef?<span style={{fontSize:11,padding:"2px 7px",borderRadius:10,background:Q.orange_l,color:Q.orange}}>{j.bcRef}</span>:"—",
              <StatusBadge status={j.status}/>,
              <span style={{fontWeight:600}}>{fM(j.contractAmount)} F</span>,
              <span style={{fontWeight:600,color:Q.green}}>{fM(facture)} F</span>,
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:80,height:5,background:Q.border2,borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:pct+"%",background:pct>80?Q.green:pct>40?Q.orange:Q.blue,borderRadius:2}}/>
                </div>
                <span style={{fontSize:11,color:Q.text3}}>{pct}%</span>
              </div>
            ];
          })}
          onRowClick={()=>onNav("jobs")}
        />
      </div>
    </div>
  );
};

// ================================================================
//  CUSTOMER CENTER
// ================================================================
const CustomerCenter = ({customers,invoices,onNewInvoice}) => {
  const [sel,setSel]       = useState(null);
  const [search,setSearch] = useState("");
  const [tab,setTab]       = useState("transactions");
  const [showForm,setShowForm] = useState(false);

  const filtered  = customers.filter(c=>!search||(c.company+c.contact+c.city).toLowerCase().includes(search.toLowerCase()));
  const selCust   = customers.find(c=>c.id===sel);
  const selInvs   = invoices.filter(i=>i.customerId===sel);

  return(
    <div style={{display:"flex",gap:0,height:"calc(100vh - 140px)",border:"1px solid "+Q.border,borderRadius:4,overflow:"hidden",background:Q.white}}>
      <div style={{width:280,borderRight:"1px solid "+Q.border,display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"10px 12px",borderBottom:"1px solid "+Q.border,background:"#F9FAFB"}}>
          <div style={{fontSize:12,fontWeight:700,color:Q.text3,textTransform:"uppercase",letterSpacing:.4,marginBottom:8}}>
            Clients ({filtered.length})
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,background:Q.white,
            border:"1px solid "+Q.border,borderRadius:3,padding:"5px 9px"}}>
            <Ico n="search" s={13} c={Q.text4}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
              style={{border:"none",outline:"none",fontSize:12,flex:1,fontFamily:"inherit",color:Q.text,background:"transparent"}}/>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto"}}>
          {filtered.map(c=>(
            <div key={c.id} onClick={()=>{setSel(c.id);setTab("transactions")}}
              style={{padding:"10px 14px",borderBottom:"1px solid "+Q.border2,cursor:"pointer",
                background:sel===c.id?Q.blue_l:"transparent",transition:"background .1s"}}
              onMouseEnter={e=>{if(sel!==c.id)e.currentTarget.style.background=Q.bg}}
              onMouseLeave={e=>{if(sel!==c.id)e.currentTarget.style.background="transparent"}}>
              <div style={{fontSize:13,fontWeight:sel===c.id?700:500,color:sel===c.id?Q.blue:Q.text,marginBottom:2}}>{c.company}</div>
              <div style={{fontSize:11,color:Q.text3}}>{c.city} · {c.type}</div>
              {c.balance>0&&<div style={{fontSize:11,fontWeight:600,color:Q.orange,marginTop:2}}>Solde: {fM(c.balance)} {c.currency}</div>}
            </div>
          ))}
        </div>
        <div style={{padding:"10px 12px",borderTop:"1px solid "+Q.border,background:"#F9FAFB"}}>
          <QBtn label="Nouveau client" variant="primary" icon="plus" full onClick={()=>setShowForm(true)}/>
        </div>
      </div>

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {!selCust?(
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:Q.text4,fontSize:14}}>
            Selectionner un client
          </div>
        ):(
          <>
            <div style={{padding:"14px 20px",borderBottom:"1px solid "+Q.border,background:"#F9FAFB"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{width:44,height:44,borderRadius:4,background:Q.green_l,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:16,fontWeight:700,color:Q.green}}>
                    {selCust.company.slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{fontSize:17,fontWeight:700,color:Q.text}}>{selCust.company}</div>
                    <div style={{fontSize:12,color:Q.text3}}>{selCust.contact} · {selCust.phone}</div>
                    <div style={{fontSize:11,color:Q.text4}}>{selCust.city}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <QBtn label="Nouvelle facture" variant="primary" sm icon="invoice" onClick={()=>onNewInvoice(selCust.id)}/>
                  <QBtn label="Modifier" variant="light" sm icon="edit"/>
                </div>
              </div>
              <div style={{display:"flex",gap:12,marginTop:12}}>
                {[{l:"Solde ouvert",v:fM(selCust.balance)+" "+selCust.currency,c:selCust.balance>0?Q.orange:Q.green},
                  {l:"Conditions",v:selCust.terms,c:Q.text},{l:"Code TVA",v:selCust.taxCode,c:Q.text},{l:"Devise",v:selCust.currency,c:Q.blue}
                ].map((s,i)=>(
                  <div key={i} style={{padding:"7px 12px",background:Q.white,borderRadius:3,border:"1px solid "+Q.border,textAlign:"center"}}>
                    <div style={{fontSize:9,color:Q.text4,textTransform:"uppercase",letterSpacing:.3,marginBottom:2}}>{s.l}</div>
                    <div style={{fontSize:12,fontWeight:700,color:s.c}}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:"flex",padding:"0 20px",borderBottom:"1px solid "+Q.border,background:Q.white}}>
              {["transactions","contacts","notes"].map(t=>(
                <button key={t} onClick={()=>setTab(t)}
                  style={{padding:"9px 16px",border:"none",background:"transparent",
                    borderBottom:tab===t?"2px solid "+Q.blue:"2px solid transparent",
                    color:tab===t?Q.blue:Q.text3,fontWeight:tab===t?700:400,
                    fontSize:12,cursor:"pointer",fontFamily:"inherit",textTransform:"capitalize"}}>
                  {t==="transactions"?"Transactions":t==="contacts"?"Contacts":"Notes"}
                </button>
              ))}
            </div>
            <div style={{flex:1,overflow:"auto",padding:"16px 20px"}}>
              {tab==="transactions"&&(
                <QTable
                  cols={[{l:"Type"},{l:"N Document"},{l:"Date"},{l:"Echeance"},{l:"Montant",right:true},{l:"Solde",right:true},{l:"Statut"}]}
                  rows={selInvs.map(inv=>[
                    <span style={{fontSize:11,padding:"2px 7px",borderRadius:10,background:Q.green_l,color:Q.green}}>Facture</span>,
                    <span style={{fontWeight:700,color:Q.blue}}>{inv.id}</span>,
                    fD(inv.date),fD(inv.dueDate),
                    <span style={{fontWeight:600}}>{fM(inv.total)} {inv.currency}</span>,
                    <span style={{fontWeight:600,color:inv.balance>0?Q.orange:Q.green}}>{fM(inv.balance)} {inv.currency}</span>,
                    <StatusBadge status={inv.status}/>,
                  ])}
                  empty="Aucune transaction pour ce client"
                />
              )}
              {tab==="contacts"&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {[{l:"Entreprise",v:selCust.company},{l:"Contact",v:selCust.contact},
                    {l:"Email",v:selCust.email},{l:"Telephone",v:selCust.phone},
                    {l:"Ville",v:selCust.city},{l:"Conditions",v:selCust.terms},
                  ].map(it=>(
                    <div key={it.l} style={{padding:"9px 12px",background:Q.bg,borderRadius:3,border:"1px solid "+Q.border2}}>
                      <div style={{fontSize:9,color:Q.text4,textTransform:"uppercase",letterSpacing:.3,marginBottom:2}}>{it.l}</div>
                      <div style={{fontSize:12,fontWeight:500,color:Q.text}}>{it.v}</div>
                    </div>
                  ))}
                </div>
              )}
              {tab==="notes"&&<QTextarea value="" onChange={()=>{}} placeholder="Ajouter une note..." rows={4}/>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ================================================================
//  INVOICE LIST + FORM + DETAIL
// ================================================================
const InvoiceList = ({invoices,customers,jobs,items,onNew,onView}) => {
  const [search,setSearch] = useState("");
  const [filtre,setFiltre] = useState("All");

  const filtered = invoices.filter(inv=>{
    const c=customers.find(x=>x.id===inv.customerId);
    const ms=!search||(inv.id+(c?c.company:"")+inv.memo).toLowerCase().includes(search.toLowerCase());
    const mf=filtre==="All"||inv.status===filtre;
    return ms&&mf;
  });

  return(
    <div>
      <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:7,background:Q.white,
          border:"1px solid "+Q.border,borderRadius:3,padding:"6px 10px",flex:1,maxWidth:280}}>
          <Ico n="search" s={13} c={Q.text4}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher facture..."
            style={{border:"none",outline:"none",fontSize:13,flex:1,fontFamily:"inherit",color:Q.text,background:"transparent"}}/>
        </div>
        <div style={{display:"flex",gap:1,background:Q.white,border:"1px solid "+Q.border,borderRadius:3,overflow:"hidden"}}>
          {["All","Sent","Partial","Paid","Overdue","Draft"].map(f=>(
            <button key={f} onClick={()=>setFiltre(f)}
              style={{padding:"6px 12px",border:"none",background:filtre===f?Q.blue:"transparent",
                color:filtre===f?Q.white:Q.text3,fontSize:12,fontWeight:filtre===f?700:400,
                cursor:"pointer",fontFamily:"inherit"}}>
              {f==="All"?"Toutes":f==="Sent"?"Envoyees":f==="Partial"?"Partielles":f==="Paid"?"Payees":f==="Overdue"?"Retard":"Brouillons"}
            </button>
          ))}
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <QBtn label="Exporter" variant="light" sm icon="download"/>
          <QBtn label="Creer une facture" variant="primary" icon="plus" onClick={onNew}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:12}}>
        {[{l:"Total facture",v:fM(filtered.reduce((s,i)=>s+toF(i.total,i.currency),0))+" F",c:Q.text},
          {l:"Encaisse",v:fM(filtered.reduce((s,i)=>s+toF(i.amountPaid,i.currency),0))+" F",c:Q.green},
          {l:"Encours AR",v:fM(filtered.filter(i=>i.balance>0).reduce((s,i)=>s+toF(i.balance,i.currency),0))+" F",c:Q.orange},
          {l:"En retard",v:fM(filtered.filter(i=>i.status==="Overdue").reduce((s,i)=>s+i.balance,0))+" F",c:Q.red},
          {l:"TVA collectee",v:fM(filtered.reduce((s,i)=>s+toF(i.taxAmount,i.currency),0))+" F",c:Q.purple},
        ].map((s,i)=>(
          <div key={i} style={{background:Q.white,border:"1px solid "+Q.border,borderRadius:3,padding:"9px 12px"}}>
            <div style={{fontSize:10,color:Q.text4,marginBottom:3,textTransform:"uppercase",letterSpacing:.3}}>{s.l}</div>
            <div style={{fontSize:14,fontWeight:700,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>
      <QTable
        cols={[{l:"N Facture",w:130},{l:"Client"},{l:"Job"},{l:"Date"},{l:"Echeance"},{l:"Montant",right:true},{l:"Solde",right:true},{l:"Statut"},{l:"Actions",w:120}]}
        rows={filtered.map((inv,idx)=>{
          const cust=customers.find(c=>c.id===inv.customerId);
          const job=jobs.find(j=>j.id===inv.jobId);
          return[
            <span style={{fontWeight:700,color:Q.blue,cursor:"pointer"}} onClick={()=>onView(inv.id)}>{inv.id}</span>,
            <span style={{fontSize:12}}>{cust?cust.company:"—"}</span>,
            job?<span style={{fontSize:11,color:Q.text3}}>{job.name}</span>:"—",
            fD2(inv.date),
            <span style={{color:inv.status==="Overdue"?Q.red:Q.text,fontSize:12}}>{fD2(inv.dueDate)}</span>,
            <span style={{fontWeight:600}}>{fM(inv.total)} {inv.currency}</span>,
            <span style={{fontWeight:700,color:inv.balance>0?Q.orange:Q.green}}>{fM(inv.balance)} {inv.currency}</span>,
            <StatusBadge status={inv.status}/>,
            <div style={{display:"flex",gap:4}}>
              <QBtn label="Voir" variant="light" sm onClick={()=>onView(inv.id)}/>
              {inv.balance>0&&<QBtn label="Paiement" variant="primary" sm/>}
            </div>
          ];
        })}
        onRowClick={(i)=>onView(filtered[i].id)}
      />
    </div>
  );
};

const InvoiceForm = ({customers,jobs,items,onSave,onClose,initialCustomerId}) => {
  const [custId,   setCustId]   = useState(initialCustomerId||"");
  const [jobId,    setJobId]    = useState("");
  const [date,     setDate]     = useState(TODAY);
  const [dueDate,  setDueDate]  = useState("");
  const [terms,    setTerms]    = useState("Net 30");
  const [poNum,    setPoNum]    = useState("");
  const [memo,     setMemo]     = useState("");
  const [currency, setCurrency] = useState("FCFA");
  const [lines,    setLines]    = useState([{item:"",desc:"",qty:1,rate:0,amount:0,taxable:true,account:"704"}]);

  const cust     = customers.find(c=>c.id===custId);
  const custJobs = jobs.filter(j=>j.customerId===custId);

  const updLine=(i,k,v)=>setLines(p=>p.map((l,idx)=>{
    if(idx!==i) return l;
    const nl={...l,[k]:v};
    if(k==="qty"||k==="rate") nl.amount=nl.qty*nl.rate;
    if(k==="item"){
      const it=items.find(x=>x.name===v);
      if(it){nl.desc=it.desc;nl.rate=it.rate;nl.amount=nl.qty*it.rate;nl.taxable=it.taxable;nl.account=it.account;}
    }
    return nl;
  }));

  const subtotal = lines.reduce((s,l)=>s+l.amount,0);
  const taxAmt   = cust&&cust.taxCode==="TVA"?lines.filter(l=>l.taxable).reduce((s,l)=>s+l.amount*TVA,0):0;
  const total    = subtotal+taxAmt;

  const save=(status)=>{
    if(!custId){alert("Selectionner un client");return;}
    onSave({id:"INV-"+new Date().getFullYear()+"-"+String(Math.floor(Math.random()*900+100)).padStart(3,"0"),
      customerId:custId,jobId,date,dueDate,terms,poNumber:poNum,memo,currency,lines,
      subtotal,taxRate:TVA,taxAmount:taxAmt,total,amountPaid:0,balance:total,
      status,payments:[]});
    onClose();
  };

  return(
    <QPanel title="Creer une facture" sub="Accounts Receivable" onClose={onClose} width={820}
      footer={<><QBtn label="Annuler" onClick={onClose} variant="light"/><QBtn label="Brouillon" onClick={()=>save("Draft")} variant="default" icon="download"/><QBtn label="Enregistrer et envoyer" onClick={()=>save("Sent")} variant="primary" icon="mail"/></>}>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:14,marginBottom:18}}>
        <QField label="Client" required>
          <QSelect value={custId} onChange={v=>{setCustId(v);setCurrency((customers.find(c=>c.id===v)||{currency:"FCFA"}).currency);}}
            placeholder="Selectionner un client" options={customers.map(c=>({v:c.id,l:c.company}))}/>
        </QField>
        <QField label="Date"><QInput type="date" value={date} onChange={setDate}/></QField>
        <QField label="Conditions"><QSelect value={terms} onChange={setTerms} options={["Net 15","Net 30","Net 45","Net 60","Net 90","Immediate"]}/></QField>
        {custId&&custJobs.length>0&&(
          <QField label="Customer Job">
            <QSelect value={jobId} onChange={setJobId} placeholder="Aucun job" options={custJobs.map(j=>({v:j.id,l:j.name}))}/>
          </QField>
        )}
        <QField label="Date echeance"><QInput type="date" value={dueDate} onChange={setDueDate}/></QField>
        <QField label="N PO client"><QInput value={poNum} onChange={setPoNum} placeholder="PO du client"/></QField>
        <QField label="Devise"><QSelect value={currency} onChange={setCurrency} options={["FCFA","USD","EUR","CNY"]}/></QField>
      </div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:700,color:Q.text3,textTransform:"uppercase",letterSpacing:.4,marginBottom:10}}>Lignes de facturation</div>
        <div style={{border:"1px solid "+Q.border,borderRadius:3,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:"#F9FAFB",borderBottom:"1px solid "+Q.border}}>
                {["Article","Description","Qte","Prix unitaire","TVA "+Math.round(TVA*10000)/100+"%","Montant",""].map((h,i)=>(
                  <th key={i} style={{padding:"8px 11px",textAlign:i>=2&&i<=5?"right":"left",fontSize:11,fontWeight:700,color:Q.text3,textTransform:"uppercase",letterSpacing:.3}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.map((l,i)=>(
                <tr key={i} style={{borderBottom:"1px solid "+Q.border2}}>
                  <td style={{padding:"5px 8px",width:180}}>
                    <QSelect value={l.item} onChange={v=>updLine(i,"item",v)} placeholder="Selectionner..." options={items.map(it=>it.name)} small/>
                  </td>
                  <td style={{padding:"5px 8px"}}>
                    <QInput value={l.desc} onChange={v=>updLine(i,"desc",v)} placeholder="Description" small/>
                  </td>
                  <td style={{padding:"5px 8px",width:70}}>
                    <QInput type="number" value={l.qty} onChange={v=>updLine(i,"qty",+v)} small/>
                  </td>
                  <td style={{padding:"5px 8px",width:140}}>
                    <QInput type="number" value={l.rate} onChange={v=>updLine(i,"rate",+v)} small suffix={currency}/>
                  </td>
                  <td style={{padding:"5px 11px",textAlign:"center",width:70}}>
                    <input type="checkbox" checked={l.taxable} onChange={e=>updLine(i,"taxable",e.target.checked)} style={{width:15,height:15,cursor:"pointer",accentColor:Q.green}}/>
                  </td>
                  <td style={{padding:"5px 11px",width:140,textAlign:"right",fontWeight:600,fontSize:13,color:Q.text}}>
                    {fM(l.amount)} {currency}
                  </td>
                  <td style={{padding:"5px 8px",width:32}}>
                    {lines.length>1&&(
                      <button onClick={()=>setLines(p=>p.filter((_,idx)=>idx!==i))}
                        style={{width:22,height:22,borderRadius:3,border:"1px solid "+Q.border,background:Q.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <Ico n="close" s={11} c={Q.text3}/>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{padding:"8px 11px",borderTop:"1px solid "+Q.border2,background:"#FAFAFA"}}>
            <QBtn label="+ Ajouter une ligne" onClick={()=>setLines(p=>[...p,{item:"",desc:"",qty:1,rate:0,amount:0,taxable:true,account:"704"}])} variant="light" sm/>
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:16,marginBottom:16}}>
        <QField label="Memo"><QTextarea value={memo} onChange={setMemo} placeholder="Message facture, conditions..."/></QField>
        <div style={{background:"#F9FAFB",borderRadius:3,border:"1px solid "+Q.border,padding:"14px 16px"}}>
          {[{l:"Sous-total HT",v:fM(subtotal)+" "+currency,c:Q.text,big:false},
            {l:"TVA "+Math.round(TVA*10000)/100+"%",v:taxAmt>0?fM(Math.round(taxAmt))+" "+currency:"Exonere",c:Q.red,big:false},
            {l:"TOTAL TTC",v:fM(Math.round(total))+" "+currency,c:Q.blue,big:true},
          ].map((t,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:t.big?"none":"1px solid "+Q.border2}}>
              <span style={{fontSize:t.big?13:12,color:Q.text3,fontWeight:t.big?600:400}}>{t.l}</span>
              <span style={{fontSize:t.big?20:13,fontWeight:t.big?800:600,color:t.c}}>{t.v}</span>
            </div>
          ))}
        </div>
      </div>
    </QPanel>
  );
};

const InvoiceDetail = ({invoice,customers,jobs,onClose}) => {
  if(!invoice) return null;
  const cust=customers.find(c=>c.id===invoice.customerId);
  const job=jobs.find(j=>j.id===invoice.jobId);
  return(
    <QPanel title={invoice.id} sub={(cust?cust.company:"")+" · "+invoice.status} onClose={onClose} width={720}
      footer={<><QBtn label="Imprimer" variant="light" sm icon="print"/><QBtn label="Envoyer" variant="light" sm icon="mail"/><QBtn label="PDF" variant="light" sm icon="download"/>{invoice.balance>0&&<QBtn label="Recevoir paiement" variant="primary" sm icon="receive"/>}</>}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"14px 18px",background:invoice.status==="Overdue"?Q.red_l:Q.green_l,
        borderRadius:4,marginBottom:16,border:"1px solid "+(invoice.status==="Overdue"?Q.red:Q.green)+"20"}}>
        <div>
          <div style={{fontSize:11,color:Q.text3,marginBottom:3}}>Montant total</div>
          <div style={{fontSize:28,fontWeight:800,color:Q.blue}}>{fM(invoice.total)} {invoice.currency}</div>
        </div>
        <StatusBadge status={invoice.status}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
        {[{l:"Client",v:cust?cust.company:"—"},{l:"Job",v:job?job.name:"—"},{l:"BC Huawei",v:job?job.bcRef:"—"},
          {l:"Emission",v:fD(invoice.date)},{l:"Echeance",v:fD(invoice.dueDate)},{l:"Conditions",v:invoice.terms},
        ].map(it=>(
          <div key={it.l} style={{padding:"8px 12px",background:"#F9FAFB",borderRadius:3,border:"1px solid "+Q.border2}}>
            <div style={{fontSize:9,color:Q.text4,textTransform:"uppercase",letterSpacing:.4,marginBottom:2}}>{it.l}</div>
            <div style={{fontSize:12,fontWeight:600,color:Q.text}}>{it.v}</div>
          </div>
        ))}
      </div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:700,color:Q.text3,textTransform:"uppercase",letterSpacing:.4,marginBottom:8}}>Lignes</div>
        <QTable
          cols={[{l:"Description"},{l:"Qte"},{l:"P.U.",right:true},{l:"TVA",right:true},{l:"Montant",right:true}]}
          rows={invoice.lines.map(l=>[l.desc,l.qty,<span style={{fontWeight:500}}>{fM(l.rate)} {invoice.currency}</span>,l.taxable?(Math.round(TVA*10000)/100)+"%":"—",<strong style={{color:Q.blue}}>{fM(l.amount)} {invoice.currency}</strong>])}
          compact/>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
        <div style={{width:280,background:"#F9FAFB",borderRadius:3,border:"1px solid "+Q.border,padding:"12px 16px"}}>
          {[{l:"HT",v:fM(invoice.subtotal)+" "+invoice.currency,c:Q.text,b:false},
            {l:"TVA "+Math.round(TVA*10000)/100+"%",v:fM(invoice.taxAmount)+" "+invoice.currency,c:Q.red,b:false},
            {l:"TTC",v:fM(invoice.total)+" "+invoice.currency,c:Q.blue,b:true},
            ...(invoice.amountPaid>0?[{l:"Acomptes recus",v:"- "+fM(invoice.amountPaid)+" "+invoice.currency,c:Q.green,b:false},{l:"Solde du",v:fM(invoice.balance)+" "+invoice.currency,c:Q.orange,b:true}]:[]),
          ].map((t,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:t.b?"none":"1px solid "+Q.border2}}>
              <span style={{fontSize:t.b?13:11,color:Q.text3,fontWeight:t.b?600:400}}>{t.l}</span>
              <span style={{fontSize:t.b?18:13,fontWeight:t.b?800:600,color:t.c}}>{t.v}</span>
            </div>
          ))}
        </div>
      </div>
      {invoice.payments&&invoice.payments.length>0&&(
        <div style={{padding:"10px 14px",background:Q.green_l,borderRadius:3,border:"1px solid "+Q.green+"20",marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:Q.green,marginBottom:8}}>Paiements recus</div>
          {invoice.payments.map((p,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"4px 0"}}>
              <span>{fD(p.date)} · {p.ref} · {p.method}</span>
              <strong style={{color:Q.green}}>{fM(p.amount)} {invoice.currency}</strong>
            </div>
          ))}
        </div>
      )}
    </QPanel>
  );
};

// ================================================================
//  VENDOR CENTER
// ================================================================
const VendorCenter = ({vendors,bills,onNewBill}) => {
  const [sel,setSel]         = useState(null);
  const [search,setSearch]   = useState("");
  const [tab,setTab]         = useState("transactions");

  const filtered  = vendors.filter(v=>!search||(v.company+v.city).toLowerCase().includes(search.toLowerCase()));
  const selVendor = vendors.find(v=>v.id===sel);
  const selBills  = bills.filter(b=>b.vendorId===sel);

  return(
    <div style={{display:"flex",gap:0,height:"calc(100vh - 140px)",border:"1px solid "+Q.border,borderRadius:4,overflow:"hidden",background:Q.white}}>
      <div style={{width:280,borderRight:"1px solid "+Q.border,display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"10px 12px",borderBottom:"1px solid "+Q.border,background:"#F9FAFB"}}>
          <div style={{fontSize:12,fontWeight:700,color:Q.text3,textTransform:"uppercase",letterSpacing:.4,marginBottom:8}}>Fournisseurs ({filtered.length})</div>
          <div style={{display:"flex",alignItems:"center",gap:6,background:Q.white,border:"1px solid "+Q.border,borderRadius:3,padding:"5px 9px"}}>
            <Ico n="search" s={13} c={Q.text4}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
              style={{border:"none",outline:"none",fontSize:12,flex:1,fontFamily:"inherit",color:Q.text,background:"transparent"}}/>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto"}}>
          {filtered.map(v=>(
            <div key={v.id} onClick={()=>{setSel(v.id);setTab("transactions")}}
              style={{padding:"10px 14px",borderBottom:"1px solid "+Q.border2,cursor:"pointer",
                background:sel===v.id?Q.blue_l:"transparent",transition:"background .1s"}}
              onMouseEnter={e=>{if(sel!==v.id)e.currentTarget.style.background=Q.bg}}
              onMouseLeave={e=>{if(sel!==v.id)e.currentTarget.style.background="transparent"}}>
              <div style={{fontSize:13,fontWeight:sel===v.id?700:500,color:sel===v.id?Q.blue:Q.text,marginBottom:2}}>{v.company}</div>
              <div style={{fontSize:11,color:Q.text3}}>{v.city} · {v.currency}</div>
              {v.balance>0&&<div style={{fontSize:11,fontWeight:600,color:Q.red,marginTop:2}}>Du: {fM(v.balance)} {v.currency}</div>}
            </div>
          ))}
        </div>
        <div style={{padding:"10px 12px",borderTop:"1px solid "+Q.border,background:"#F9FAFB"}}>
          <QBtn label="Nouveau fournisseur" variant="primary" icon="plus" full/>
        </div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {!selVendor?(
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:Q.text4,fontSize:14}}>Selectionner un fournisseur</div>
        ):(
          <>
            <div style={{padding:"14px 20px",borderBottom:"1px solid "+Q.border,background:"#F9FAFB"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{width:44,height:44,borderRadius:4,background:Q.orange_l,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:Q.orange}}>
                    {selVendor.company.slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{fontSize:17,fontWeight:700,color:Q.text}}>{selVendor.company}</div>
                    <div style={{fontSize:12,color:Q.text3}}>{selVendor.contact} · {selVendor.phone}</div>
                    <div style={{fontSize:11,color:Q.text4}}>N compte: {selVendor.accountNum} · {selVendor.terms}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <QBtn label="Saisir un bill" variant="primary" sm icon="bill" onClick={()=>onNewBill(selVendor.id)}/>
                  <QBtn label="Creer un PO" variant="ghost" sm icon="po"/>
                </div>
              </div>
              <div style={{display:"flex",gap:12,marginTop:12}}>
                {[{l:"Solde du",v:fM(selVendor.balance)+" "+selVendor.currency,c:selVendor.balance>0?Q.red:Q.green},
                  {l:"Conditions",v:selVendor.terms,c:Q.text},{l:"Devise",v:selVendor.currency,c:Q.blue},
                ].map((s,i)=>(
                  <div key={i} style={{padding:"7px 12px",background:Q.white,borderRadius:3,border:"1px solid "+Q.border,textAlign:"center"}}>
                    <div style={{fontSize:9,color:Q.text4,textTransform:"uppercase",letterSpacing:.3,marginBottom:2}}>{s.l}</div>
                    <div style={{fontSize:12,fontWeight:700,color:s.c}}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:"flex",padding:"0 20px",borderBottom:"1px solid "+Q.border,background:Q.white}}>
              {["transactions","contacts"].map(t=>(
                <button key={t} onClick={()=>setTab(t)}
                  style={{padding:"9px 16px",border:"none",background:"transparent",
                    borderBottom:tab===t?"2px solid "+Q.blue:"2px solid transparent",
                    color:tab===t?Q.blue:Q.text3,fontWeight:tab===t?700:400,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                  {t==="transactions"?"Transactions":"Contacts"}
                </button>
              ))}
            </div>
            <div style={{flex:1,overflow:"auto",padding:"16px 20px"}}>
              {tab==="transactions"&&(
                <QTable
                  cols={[{l:"Type"},{l:"N Doc"},{l:"Date"},{l:"Echeance"},{l:"Montant",right:true},{l:"Solde",right:true},{l:"Statut"}]}
                  rows={selBills.map(b=>[
                    <span style={{fontSize:11,padding:"2px 7px",borderRadius:10,background:Q.orange_l,color:Q.orange}}>Bill</span>,
                    <span style={{fontWeight:700,color:Q.blue}}>{b.id}</span>,
                    fD(b.date),fD(b.dueDate),
                    <span style={{fontWeight:600}}>{fM(b.total)} {b.currency}</span>,
                    <span style={{fontWeight:700,color:b.balance>0?Q.red:Q.green}}>{fM(b.balance)} {b.currency}</span>,
                    <StatusBadge status={b.status}/>,
                  ])}
                  empty="Aucun bill pour ce fournisseur"
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ================================================================
//  BILLS LIST + FORM
// ================================================================
const BillList = ({bills,vendors,jobs,onNew,onPay}) => {
  const [search,setSearch] = useState("");
  const [filtre,setFiltre] = useState("All");

  const filtered = bills.filter(b=>{
    const v=vendors.find(x=>x.id===b.vendorId);
    const ms=!search||(b.id+(v?v.company:"")+b.memo).toLowerCase().includes(search.toLowerCase());
    const mf=filtre==="All"||b.status===filtre;
    return ms&&mf;
  });

  return(
    <div>
      <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:7,background:Q.white,border:"1px solid "+Q.border,borderRadius:3,padding:"6px 10px",flex:1,maxWidth:280}}>
          <Ico n="search" s={13} c={Q.text4}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher bill..."
            style={{border:"none",outline:"none",fontSize:13,flex:1,fontFamily:"inherit",color:Q.text,background:"transparent"}}/>
        </div>
        <div style={{display:"flex",gap:1,background:Q.white,border:"1px solid "+Q.border,borderRadius:3,overflow:"hidden"}}>
          {["All","Unpaid","Partial","Paid"].map(f=>(
            <button key={f} onClick={()=>setFiltre(f)}
              style={{padding:"6px 12px",border:"none",background:filtre===f?Q.orange:"transparent",
                color:filtre===f?Q.white:Q.text3,fontSize:12,fontWeight:filtre===f?700:400,cursor:"pointer",fontFamily:"inherit"}}>
              {f==="All"?"Tous":f==="Unpaid"?"Non payes":f==="Partial"?"Partiels":"Payes"}
            </button>
          ))}
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <QBtn label="Saisir un bill" variant="primary" icon="plus" onClick={()=>onNew()}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
        {[{l:"Total AP",v:fM(filtered.filter(b=>b.balance>0).reduce((s,b)=>s+b.balance,0))+" F",c:Q.red},
          {l:"Echeant",v:fM(filtered.filter(b=>b.balance>0).reduce((s,b)=>s+b.balance,0))+" F",c:Q.orange},
          {l:"En retard",v:fM(filtered.filter(b=>{if(!b.dueDate||b.status==="Paid")return false;return new Date(b.dueDate)<new Date();}).reduce((s,b)=>s+b.balance,0))+" F",c:Q.red},
          {l:"Paye ce mois",v:fM(filtered.filter(b=>b.status==="Paid").reduce((s,b)=>s+b.total,0))+" F",c:Q.green},
        ].map((s,i)=>(
          <div key={i} style={{background:Q.white,border:"1px solid "+Q.border,borderRadius:3,padding:"9px 12px"}}>
            <div style={{fontSize:10,color:Q.text4,marginBottom:3,textTransform:"uppercase",letterSpacing:.3}}>{s.l}</div>
            <div style={{fontSize:14,fontWeight:700,color:s.c}}>{s.v}</div>
          </div>
        ))}
      </div>
      <QTable
        cols={[{l:"N Bill"},{l:"Fournisseur"},{l:"Job"},{l:"Date"},{l:"Echeance"},{l:"Montant",right:true},{l:"Solde",right:true},{l:"Statut"},{l:"Actions"}]}
        rows={filtered.map(b=>{
          const v=vendors.find(x=>x.id===b.vendorId);
          const j=jobs.find(x=>x.id===(b.lines[0]?b.lines[0].job:null));
          return[
            <span style={{fontWeight:700,color:Q.orange}}>{b.id}</span>,
            <span style={{fontSize:12}}>{v?v.company:"—"}</span>,
            j?<span style={{fontSize:11,color:Q.text3}}>{j.name}</span>:"—",
            fD2(b.date),
            <span style={{color:new Date(b.dueDate)<new Date()&&b.status!=="Paid"?Q.red:Q.text,fontSize:12}}>{fD2(b.dueDate)}</span>,
            <span style={{fontWeight:600}}>{fM(b.total)} {b.currency}</span>,
            <span style={{fontWeight:700,color:b.balance>0?Q.red:Q.green}}>{fM(b.balance)} {b.currency}</span>,
            <StatusBadge status={b.status}/>,
            <div style={{display:"flex",gap:4}}>
              <QBtn label="Voir" variant="light" sm/>
              {b.balance>0&&<QBtn label="Payer" variant="primary" sm onClick={()=>onPay(b)}/>}
            </div>
          ];
        })}
      />
    </div>
  );
};

const BillForm = ({vendors,jobs,onSave,onClose,initialVendorId}) => {
  const [vendorId,setVendorId] = useState(initialVendorId||"");
  const [date,    setDate]     = useState(TODAY);
  const [dueDate, setDueDate]  = useState("");
  const [refNum,  setRefNum]   = useState("");
  const [memo,    setMemo]     = useState("");
  const [lines,   setLines]    = useState([{account:"604",desc:"",amount:0,job:"",billable:false}]);

  const total = lines.reduce((s,l)=>s+l.amount,0);

  const ACCTS_CH = INIT_COA.filter(a=>["Expense","Cost of Goods Sold","Other Expense"].includes(a.type));

  const save=()=>{
    if(!vendorId){alert("Selectionner un fournisseur");return;}
    onSave({id:"BILL-"+new Date().getFullYear()+"-"+String(Math.floor(Math.random()*900+100)).padStart(3,"0"),
      vendorId,date,dueDate,refNum,memo,lines,total,amountPaid:0,balance:total,status:"Unpaid",payments:[],currency:"FCFA"});
    onClose();
  };

  return(
    <QPanel title="Saisir un bill fournisseur" sub="Accounts Payable" onClose={onClose} width={760}
      footer={<><QBtn label="Annuler" onClick={onClose} variant="light"/><QBtn label="Enregistrer le bill" onClick={save} variant="primary" icon="check"/></>}>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:14,marginBottom:18}}>
        <QField label="Fournisseur" required>
          <QSelect value={vendorId} onChange={setVendorId} placeholder="Selectionner..." options={vendors.map(v=>({v:v.id,l:v.company}))}/>
        </QField>
        <QField label="Date"><QInput type="date" value={date} onChange={setDate}/></QField>
        <QField label="Date echeance"><QInput type="date" value={dueDate} onChange={setDueDate}/></QField>
        <QField label="N reference facture fournisseur"><QInput value={refNum} onChange={setRefNum} placeholder="Ref. facture fournisseur"/></QField>
        <QField label="Memo" col><QInput value={memo} onChange={setMemo} placeholder="Description de la depense"/></QField>
      </div>
      <div style={{border:"1px solid "+Q.border,borderRadius:3,overflow:"hidden",marginBottom:16}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:"#F9FAFB",borderBottom:"1px solid "+Q.border}}>
              {["Compte","Description","Montant FCFA","Customer Job","Facturable",""].map((h,i)=>(
                <th key={i} style={{padding:"8px 10px",textAlign:i===2?"right":"left",fontSize:11,fontWeight:700,color:Q.text3,textTransform:"uppercase",letterSpacing:.3}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.map((l,i)=>(
              <tr key={i} style={{borderBottom:"1px solid "+Q.border2}}>
                <td style={{padding:"5px 8px",width:180}}>
                  <QSelect value={l.account} onChange={v=>setLines(p=>p.map((x,xi)=>xi===i?{...x,account:v}:x))}
                    options={ACCTS_CH.map(a=>({v:a.num,l:a.num+" — "+a.name}))} small/>
                </td>
                <td style={{padding:"5px 8px"}}>
                  <QInput value={l.desc} onChange={v=>setLines(p=>p.map((x,xi)=>xi===i?{...x,desc:v}:x))} placeholder="Description" small/>
                </td>
                <td style={{padding:"5px 8px",width:140}}>
                  <QInput type="number" value={l.amount} onChange={v=>setLines(p=>p.map((x,xi)=>xi===i?{...x,amount:+v}:x))} small/>
                </td>
                <td style={{padding:"5px 8px",width:160}}>
                  <QSelect value={l.job} onChange={v=>setLines(p=>p.map((x,xi)=>xi===i?{...x,job:v}:x))}
                    placeholder="Aucun" options={jobs.map(j=>({v:j.id,l:j.name}))} small/>
                </td>
                <td style={{padding:"5px 10px",textAlign:"center",width:80}}>
                  <input type="checkbox" checked={l.billable} onChange={e=>setLines(p=>p.map((x,xi)=>xi===i?{...x,billable:e.target.checked}:x))} style={{width:15,height:15,accentColor:Q.green}}/>
                </td>
                <td style={{padding:"5px 8px",width:32}}>
                  {lines.length>1&&(
                    <button onClick={()=>setLines(p=>p.filter((_,xi)=>xi!==i))}
                      style={{width:22,height:22,borderRadius:3,border:"1px solid "+Q.border,background:Q.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <Ico n="close" s={11} c={Q.text3}/>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{padding:"8px 10px",borderTop:"1px solid "+Q.border2,background:"#FAFAFA",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <QBtn label="+ Ajouter une ligne" onClick={()=>setLines(p=>[...p,{account:"604",desc:"",amount:0,job:"",billable:false}])} variant="light" sm/>
          <div style={{fontSize:15,fontWeight:700,color:Q.red}}>Total: {fM(total)} FCFA</div>
        </div>
      </div>
    </QPanel>
  );
};

// ================================================================
//  PURCHASE ORDERS
// ================================================================
const POList = ({pos,vendors,jobs}) => {
  const [search,setSearch] = useState("");
  const filtered = pos.filter(p=>!search||(p.id+(vendors.find(v=>v.id===p.vendorId)||{company:""}).company+p.memo).toLowerCase().includes(search.toLowerCase()));

  return(
    <div>
      <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:7,background:Q.white,border:"1px solid "+Q.border,borderRadius:3,padding:"6px 10px",flex:1,maxWidth:280}}>
          <Ico n="search" s={13} c={Q.text4}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher PO..."
            style={{border:"none",outline:"none",fontSize:13,flex:1,fontFamily:"inherit",color:Q.text,background:"transparent"}}/>
        </div>
        <div style={{marginLeft:"auto"}}><QBtn label="Nouveau PO" variant="primary" icon="plus"/></div>
      </div>
      <QTable
        cols={[{l:"N PO"},{l:"Fournisseur"},{l:"Job"},{l:"Date"},{l:"Date prevue"},{l:"Total",right:true},{l:"Statut"},{l:"Actions"}]}
        rows={filtered.map(po=>{
          const v=vendors.find(x=>x.id===po.vendorId);
          const j=jobs.find(x=>x.id===(po.lines[0]?po.lines[0].job:null));
          return[
            <span style={{fontWeight:700,color:Q.purple}}>{po.id}</span>,
            v?v.company:"—",
            j?<span style={{fontSize:11,color:Q.text3}}>{j.name}</span>:"—",
            fD2(po.date),fD2(po.expectedDate),
            <strong>{fM(po.total)} {po.currency}</strong>,
            <StatusBadge status={po.status}/>,
            <div style={{display:"flex",gap:4}}>
              <QBtn label="Voir" variant="light" sm/>
              <QBtn label="Recevoir" variant="ghost" sm/>
              <QBtn label="Bill" variant="primary" sm/>
            </div>
          ];
        })}
      />
    </div>
  );
};

// ================================================================
//  BANKING
// ================================================================
const BankingView = ({banks,transactions}) => {
  const [selBank,setSelBank] = useState(banks[0]?banks[0].id:null);
  const [mode,setMode]       = useState("feed");
  const selTxns  = transactions.filter(t=>t.bankId===selBank);
  const selAcc   = banks.find(b=>b.id===selBank);
  const totalBank= banks.reduce((s,b)=>s+b.balance,0);

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:18}}>
        {banks.map(b=>(
          <div key={b.id} onClick={()=>setSelBank(b.id)}
            style={{background:Q.white,border:"2px solid "+(selBank===b.id?Q.blue:Q.border),
              borderRadius:4,padding:"14px 18px",cursor:"pointer",
              borderTop:"3px solid "+(b.type==="Cash"?Q.orange:Q.green),transition:"border-color .1s"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:Q.text}}>{b.name}</div>
                <div style={{fontSize:11,color:Q.text3}}>{b.accountNum} · Sync: {fD2(b.lastSync)}</div>
              </div>
              <Ico n={b.type==="Cash"?"money":"bank"} s={20} c={b.type==="Cash"?Q.orange:Q.green}/>
            </div>
            <div style={{fontSize:22,fontWeight:700,color:b.balance>0?Q.green:Q.red}}>{fM(b.balance)} FCFA</div>
            <div style={{fontSize:10,color:Q.text4,marginTop:3}}>{b.type}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"12px 16px",background:Q.green_l,border:"1px solid "+Q.green+"30",
        borderRadius:4,marginBottom:16}}>
        <span style={{fontSize:14,fontWeight:700,color:Q.text}}>Tresorerie totale</span>
        <span style={{fontSize:24,fontWeight:800,color:Q.green}}>{fM(totalBank)} FCFA</span>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {["feed","reconcile"].map(m=>(
          <button key={m} onClick={()=>setMode(m)}
            style={{padding:"7px 16px",borderRadius:3,border:"1px solid "+(mode===m?Q.blue:Q.border),
              background:mode===m?Q.blue_l:Q.white,color:mode===m?Q.blue:Q.text3,
              fontSize:12,fontWeight:mode===m?700:400,cursor:"pointer",fontFamily:"inherit"}}>
            {m==="feed"?"Bank Feed Transactions":"Rapprochement bancaire"}
          </button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <QBtn label="Synchroniser" variant="light" sm icon="refresh"/>
          <QBtn label="Exporter" variant="light" sm icon="download"/>
        </div>
      </div>
      {mode==="feed"&&(
        <QTable
          cols={[{l:"Date"},{l:"Description"},{l:"Reference"},{l:"Debit",right:true},{l:"Credit",right:true},{l:"Statut"},{l:"Actions"}]}
          rows={selTxns.map(t=>[
            fD2(t.date),
            <span style={{fontSize:12,fontWeight:500}}>{t.desc}</span>,
            <span style={{fontSize:11,color:Q.text4}}>{t.ref||"—"}</span>,
            t.amount<0?<span style={{color:Q.red,fontWeight:600}}>{fM(Math.abs(t.amount))} F</span>:"—",
            t.amount>0?<span style={{color:Q.green,fontWeight:600}}>{fM(t.amount)} F</span>:"—",
            <StatusBadge status={t.status}/>,
            <div style={{display:"flex",gap:4}}>
              {t.status==="unmatched"&&<QBtn label="Rapprocher" variant="primary" sm/>}
              {t.status==="matched"&&<QBtn label="Voir" variant="light" sm/>}
            </div>
          ])}
        />
      )}
      {mode==="reconcile"&&(
        <div style={{background:Q.white,border:"1px solid "+Q.border,borderRadius:4,padding:"20px",maxWidth:600}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
            <QField label="Compte a rapprocher">
              <QSelect value={selBank} onChange={setSelBank} options={banks.map(b=>({v:b.id,l:b.name}))}/>
            </QField>
            <QField label="Date du releve"><QInput type="date" value={TODAY} onChange={()=>{}}/></QField>
            <QField label="Solde du releve bancaire">
              <QInput type="number" value="" onChange={()=>{}} prefix="FCFA" placeholder="Solde selon releve"/>
            </QField>
          </div>
          <div style={{display:"flex",gap:10,padding:"12px 16px",background:Q.green_l,borderRadius:3,marginBottom:16}}>
            {[{l:"Solde QB",v:fM(selAcc?selAcc.balance:0)},{l:"Solde releve",v:"—"},{l:"Ecart",v:"—"}].map((s,i)=>(
              <div key={i} style={{flex:1,textAlign:"center"}}>
                <div style={{fontSize:10,color:Q.text4,textTransform:"uppercase",marginBottom:3}}>{s.l}</div>
                <div style={{fontSize:18,fontWeight:700,color:Q.text}}>{s.v} FCFA</div>
              </div>
            ))}
          </div>
          <QBtn label="Demarrer le rapprochement" variant="primary" icon="recon"/>
        </div>
      )}
    </div>
  );
};

// ================================================================
//  JOB CENTER
// ================================================================
const JobCenter = ({jobs,customers,invoices,bills,time}) => {
  const [sel,setSel]    = useState(null);
  const [tab,setTab]    = useState("overview");
  const [showNew,setShowNew] = useState(false);

  const selJob  = jobs.find(j=>j.id===sel);
  const selInvs = invoices.filter(i=>i.jobId===sel);
  const selBills= bills.filter(b=>b.lines.some(l=>l.job===sel));
  const selTime = time.filter(t=>t.job===sel);

  const totalInvoiced = selInvs.reduce((s,i)=>s+toF(i.total,i.currency),0);
  const totalCost     = selBills.reduce((s,b)=>s+b.total,0)+selTime.reduce((s,t)=>s+t.hours*t.rate,0);
  const totalEst      = selJob?Object.values(selJob.estimate||{}).reduce((s,v)=>s+v,0):0;
  const margin        = totalInvoiced-totalCost;

  return(
    <div style={{display:"flex",gap:0,height:"calc(100vh - 140px)",border:"1px solid "+Q.border,borderRadius:4,overflow:"hidden",background:Q.white}}>
      <div style={{width:300,borderRight:"1px solid "+Q.border,display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"10px 12px",borderBottom:"1px solid "+Q.border,background:"#F9FAFB"}}>
          <div style={{fontSize:12,fontWeight:700,color:Q.text3,textTransform:"uppercase",letterSpacing:.4,marginBottom:4}}>Jobs / Projets ({jobs.length})</div>
        </div>
        <div style={{flex:1,overflowY:"auto"}}>
          {jobs.map(j=>{
            const c=customers.find(x=>x.id===j.customerId);
            const inv=invoices.filter(i=>i.jobId===j.id);
            const facture=inv.reduce((s,i)=>s+toF(i.total,i.currency),0);
            const pct=j.contractAmount>0?Math.round(facture/j.contractAmount*100):0;
            return(
              <div key={j.id} onClick={()=>{setSel(j.id);setTab("overview")}}
                style={{padding:"10px 14px",borderBottom:"1px solid "+Q.border2,cursor:"pointer",
                  background:sel===j.id?Q.blue_l:"transparent",
                  borderLeft:"3px solid "+(j.status==="In Progress"?Q.blue:j.status==="Closed"?Q.green:j.status==="Awarded"?Q.purple:Q.text4)}}>
                <div style={{fontSize:13,fontWeight:sel===j.id?700:500,color:sel===j.id?Q.blue:Q.text,marginBottom:2}}>{j.name}</div>
                <div style={{fontSize:11,color:Q.text3,marginBottom:3}}>{c?c.company:"—"} · {j.jobType}</div>
                {j.bcRef&&<div style={{fontSize:10,padding:"1px 6px",background:Q.orange_l,color:Q.orange,borderRadius:8,display:"inline-block",marginBottom:4}}>{j.bcRef}</div>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <StatusBadge status={j.status}/>
                  <span style={{fontSize:11,color:Q.text3}}>{pct}% facture</span>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{padding:"10px 12px",borderTop:"1px solid "+Q.border,background:"#F9FAFB"}}>
          <QBtn label="Nouveau job" variant="primary" icon="plus" full onClick={()=>setShowNew(true)}/>
        </div>
      </div>

      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {!selJob?(
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:Q.text4,fontSize:14}}>Selectionner un job</div>
        ):(
          <>
            <div style={{padding:"14px 20px",borderBottom:"1px solid "+Q.border,background:"#F9FAFB"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                    <div style={{fontSize:17,fontWeight:700,color:Q.text}}>{selJob.name}</div>
                    <StatusBadge status={selJob.status}/>
                    {selJob.bcRef&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:10,background:Q.orange_l,color:Q.orange}}>{selJob.bcRef}</span>}
                  </div>
                  <div style={{fontSize:12,color:Q.text3}}>{(customers.find(c=>c.id===selJob.customerId)||{company:"—"}).company} · {selJob.jobType}</div>
                  <div style={{fontSize:11,color:Q.text4}}>{selJob.startDate} vers {selJob.endDate}</div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <QBtn label="Creer facture" variant="primary" sm icon="invoice"/>
                  <QBtn label="Saisir depense" variant="ghost" sm icon="bill"/>
                  <QBtn label="Saisir heures" variant="light" sm icon="time"/>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
                {[
                  {l:"Budget Huawei",v:fM(selJob.budgetHuawei)+" F",c:Q.orange,lock:true},
                  {l:"Contrat CleanIT",v:fM(selJob.contractAmount)+" F",c:Q.blue,lock:false},
                  {l:"Budget estime",v:fM(totalEst)+" F",c:Q.text,lock:false},
                  {l:"Couts reels",v:fM(totalCost)+" F",c:Q.red,lock:false},
                  {l:"Marge nette",v:fM(margin)+" F",c:margin>0?Q.green:Q.red,lock:false},
                ].map((s,i)=>(
                  <div key={i} style={{padding:"9px 12px",background:Q.white,borderRadius:3,border:"1px solid "+Q.border,borderTop:"3px solid "+s.c}}>
                    <div style={{display:"flex",alignItems:"center",gap:3,marginBottom:3}}>
                      <span style={{fontSize:9,color:Q.text4,textTransform:"uppercase",letterSpacing:.3}}>{s.l}</span>
                      {s.lock&&<Ico n="lock" s={9} c={Q.orange}/>}
                    </div>
                    <div style={{fontSize:14,fontWeight:700,color:s.c}}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:"flex",padding:"0 20px",borderBottom:"1px solid "+Q.border,background:Q.white}}>
              {[
                {id:"overview",l:"Vue generale"},
                {id:"phases",l:"Phases"},
                {id:"invoices",l:"Factures ("+selInvs.length+")"},
                {id:"expenses",l:"Depenses ("+selBills.length+")"},
                {id:"time",l:"Heures ("+selTime.length+")"},
                {id:"profitability",l:"Rentabilite"},
              ].map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id)}
                  style={{padding:"9px 14px",border:"none",background:"transparent",
                    borderBottom:tab===t.id?"2px solid "+Q.blue:"2px solid transparent",
                    color:tab===t.id?Q.blue:Q.text3,fontWeight:tab===t.id?700:400,
                    fontSize:12,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
                  {t.l}
                </button>
              ))}
            </div>
            <div style={{flex:1,overflow:"auto",padding:"16px 20px"}}>
              {tab==="overview"&&(
                <div>
                  <div style={{fontSize:13,color:Q.text2,lineHeight:1.7,marginBottom:16,
                    padding:"10px 14px",background:Q.bg,borderRadius:3,border:"1px solid "+Q.border2}}>
                    {selJob.description}
                  </div>
                  <div style={{marginBottom:16}}>
                    <div style={{fontSize:12,fontWeight:700,color:Q.text3,textTransform:"uppercase",letterSpacing:.4,marginBottom:10}}>Estimates vs Actuals par categorie</div>
                    {Object.entries(selJob.estimate||{}).map(([cat,budget])=>{
                      const labelMap={labor:"Main oeuvre",materials:"Materiaux",subcontractors:"Sous-traitants",equipment:"Equipements",overhead:"Frais generaux"};
                      const reel=cat==="labor"?selTime.reduce((s,t)=>s+t.hours*t.rate,0):0;
                      const pct=budget>0?Math.round(reel/budget*100):0;
                      const over=reel>budget;
                      return(
                        <div key={cat} style={{display:"flex",alignItems:"center",gap:12,marginBottom:8,
                          padding:"9px 14px",background:Q.white,borderRadius:3,border:"1px solid "+Q.border2}}>
                          <span style={{width:120,fontSize:12,color:Q.text2,flexShrink:0}}>{labelMap[cat]||cat}</span>
                          <div style={{flex:1,height:5,background:Q.border2,borderRadius:2,overflow:"hidden"}}>
                            <div style={{height:"100%",width:Math.min(pct,100)+"%",
                              background:over?Q.red:pct>80?Q.orange:Q.green,borderRadius:2,transition:"width .6s"}}/>
                          </div>
                          <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
                            <span style={{fontSize:11,color:Q.text3,minWidth:100,textAlign:"right"}}>{fM(reel)} / {fM(budget)} F</span>
                            <span style={{fontSize:11,fontWeight:700,color:over?Q.red:Q.green,minWidth:40,textAlign:"right"}}>{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {tab==="phases"&&(
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div style={{fontSize:13,fontWeight:700,color:Q.text}}>Phases de facturation (Progress Invoicing)</div>
                    <QBtn label="Facturer une phase" variant="primary" sm icon="invoice"/>
                  </div>
                  {(selJob.phases||[]).map((ph,i)=>(
                    <div key={i} style={{padding:"12px 16px",background:Q.white,border:"1px solid "+Q.border,
                      borderRadius:3,marginBottom:8,borderLeft:"4px solid "+(ph.status==="invoiced"?Q.green:Q.orange)}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <div>
                          <div style={{fontSize:13,fontWeight:600,color:Q.text}}>{ph.name}</div>
                          {ph.invoiceRef&&<div style={{fontSize:11,color:Q.green}}>Ref: {ph.invoiceRef}</div>}
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:16,fontWeight:700,color:Q.blue}}>{fM(ph.amount)} FCFA</div>
                          <div style={{fontSize:11,color:Q.text3}}>{ph.pct}% du contrat</div>
                        </div>
                      </div>
                      <StatusBadge status={ph.status==="invoiced"?"Paid":"Pending"}/>
                      {ph.status!=="invoiced"&&<div style={{marginTop:8}}><QBtn label="Creer la facture" variant="primary" sm icon="invoice"/></div>}
                    </div>
                  ))}
                </div>
              )}
              {tab==="invoices"&&(
                <QTable
                  cols={[{l:"Facture"},{l:"Date"},{l:"Montant",right:true},{l:"Solde",right:true},{l:"Statut"}]}
                  rows={selInvs.map(i=>[
                    <span style={{fontWeight:700,color:Q.blue}}>{i.id}</span>,
                    fD(i.date),
                    <strong>{fM(i.total)} {i.currency}</strong>,
                    <span style={{color:i.balance>0?Q.orange:Q.green}}>{fM(i.balance)} {i.currency}</span>,
                    <StatusBadge status={i.status}/>
                  ])}
                  empty="Aucune facture pour ce job"
                />
              )}
              {tab==="expenses"&&(
                <QTable
                  cols={[{l:"Bill"},{l:"Description"},{l:"Montant",right:true},{l:"Statut"}]}
                  rows={selBills.map(b=>[
                    <span style={{fontWeight:700,color:Q.orange}}>{b.id}</span>,
                    b.memo,
                    <strong style={{color:Q.red}}>{fM(b.total)} FCFA</strong>,
                    <StatusBadge status={b.status}/>
                  ])}
                  empty="Aucune depense liee a ce job"
                />
              )}
              {tab==="time"&&(
                <QTable
                  cols={[{l:"Date"},{l:"Employe"},{l:"Service"},{l:"Heures",right:true},{l:"Taux",right:true},{l:"Montant",right:true},{l:"Facturable"}]}
                  rows={selTime.map(t=>{
                    const e=INIT_EMPLOYEES.find(x=>x.id===t.empId);
                    return[
                      fD(t.date),
                      e?e.firstName+" "+e.lastName:"—",
                      t.service,
                      <strong>{t.hours}h</strong>,
                      fM(t.rate)+" F",
                      <strong style={{color:Q.blue}}>{fM(t.hours*t.rate)} F</strong>,
                      t.billable?<span style={{color:Q.green,fontWeight:600}}>Oui</span>:<span style={{color:Q.text3}}>Non</span>
                    ];
                  })}
                  empty="Aucune heure enregistree pour ce job"
                />
              )}
              {tab==="profitability"&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                  <div style={{background:Q.white,border:"1px solid "+Q.border,borderRadius:4,padding:"16px"}}>
                    <div style={{fontSize:13,fontWeight:700,color:Q.text,marginBottom:12}}>P et L — Ce job</div>
                    {[
                      {l:"Revenus factures",v:fM(totalInvoiced)+" F",c:Q.green},
                      {l:"Couts materiaux",v:"- "+fM(selBills.reduce((s,b)=>s+b.total,0))+" F",c:Q.red},
                      {l:"Couts main oeuvre",v:"- "+fM(selTime.reduce((s,t)=>s+t.hours*t.rate,0))+" F",c:Q.orange},
                      {l:"Marge brute",v:fM(margin)+" F",c:margin>0?Q.green:Q.red},
                      {l:"Taux de marge",v:totalInvoiced>0?Math.round(margin/totalInvoiced*100)+"%":"—",c:margin>0?Q.green:Q.red},
                    ].map((r,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<4?"1px solid "+Q.border2:"none"}}>
                        <span style={{fontSize:12,color:Q.text3}}>{r.l}</span>
                        <span style={{fontSize:i===3?16:13,fontWeight:i===3?800:600,color:r.c}}>{r.v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{background:Q.white,border:"1px solid "+Q.border,borderRadius:4,padding:"16px"}}>
                    <div style={{fontSize:13,fontWeight:700,color:Q.text,marginBottom:12}}>Estimates vs Actuals</div>
                    {[
                      {l:"Budget estime total",v:fM(totalEst)+" F",c:Q.blue},
                      {l:"Couts reels totaux",v:fM(totalCost)+" F",c:Q.red},
                      {l:"Ecart budget",v:fM(totalEst-totalCost)+" F",c:(totalEst-totalCost)>=0?Q.green:Q.red},
                      {l:"Budget consomme",v:totalEst>0?Math.round(totalCost/totalEst*100)+"%":"—",c:Q.text},
                      {l:"Contrat vs facture",v:fM(totalInvoiced-selJob.contractAmount)+" F",c:(totalInvoiced-selJob.contractAmount)>=0?Q.green:Q.orange},
                    ].map((r,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:i<4?"1px solid "+Q.border2:"none"}}>
                        <span style={{fontSize:12,color:Q.text3}}>{r.l}</span>
                        <span style={{fontSize:13,fontWeight:600,color:r.c}}>{r.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {showNew&&(
        <QPanel title="Nouveau Customer Job" sub="Job Center" onClose={()=>setShowNew(false)} width={660}
          footer={<><QBtn label="Annuler" onClick={()=>setShowNew(false)} variant="light"/><QBtn label="Creer le job" variant="primary" icon="check"/></>}>
          <div style={{padding:"20px",textAlign:"center",color:Q.text3}}>
            Formulaire de creation de job — lier un BC Huawei, definir le budget confidentiel, les phases de facturation...
          </div>
        </QPanel>
      )}
    </div>
  );
};

// ================================================================
//  PAYROLL
// ================================================================
const PayrollView = ({employees}) => {
  const [tab,setTab] = useState("run");
  const sel = INIT_PAYROLL[0];
  const totalBrut = sel?sel.employees.reduce((s,e)=>s+e.gross,0):0;
  const totalNet  = sel?sel.employees.reduce((s,e)=>s+e.net,0):0;
  const totalCnps = sel?sel.employees.reduce((s,e)=>s+e.cnpsEmp,0):0;
  const totalIrpp = sel?sel.employees.reduce((s,e)=>s+e.irpp,0):0;
  const chargePatr= Math.round(totalBrut*0.1085);

  return(
    <div>
      <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center"}}>
        <div style={{fontSize:14,fontWeight:700,color:Q.text}}>Paie et Ressources Humaines</div>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <QBtn label="Lancer la paie" variant="primary" icon="payroll"/>
          <QBtn label="Declarer CNPS" variant="ghost" sm icon="tax"/>
          <QBtn label="Declarer IRPP" variant="ghost" sm icon="tax"/>
        </div>
      </div>
      <div style={{display:"flex",gap:0,borderBottom:"1px solid "+Q.border,marginBottom:16}}>
        {[{id:"run",l:"Bulletin de paie"},{id:"employees",l:"Employes"},{id:"reports",l:"Rapports"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:"9px 18px",border:"none",borderBottom:tab===t.id?"2px solid "+Q.blue:"2px solid transparent",
              background:"transparent",color:tab===t.id?Q.blue:Q.text3,fontWeight:tab===t.id?700:400,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
            {t.l}
          </button>
        ))}
      </div>
      {tab==="run"&&sel&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:18}}>
            {[{l:"Masse salariale brute",v:fM(totalBrut)+" F",c:Q.text},
              {l:"CNPS employes 8.4%",v:fM(totalCnps)+" F",c:Q.red},
              {l:"IRPP retenu",v:fM(totalIrpp)+" F",c:Q.orange},
              {l:"Net a payer",v:fM(totalNet)+" F",c:Q.green},
              {l:"Charges patronales",v:fM(chargePatr)+" F",c:Q.purple},
            ].map((s,i)=>(
              <div key={i} style={{background:Q.white,border:"1px solid "+Q.border,borderRadius:3,padding:"12px 14px",borderTop:"3px solid "+s.c}}>
                <div style={{fontSize:10,color:Q.text4,textTransform:"uppercase",letterSpacing:.3,marginBottom:4}}>{s.l}</div>
                <div style={{fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div>
              </div>
            ))}
          </div>
          <QTable
            cols={[{l:"Employe"},{l:"Poste"},{l:"Salaire brut",right:true},{l:"CNPS",right:true},{l:"IRPP",right:true},{l:"Net a payer",right:true},{l:"Statut"},{l:"Action"}]}
            rows={sel.employees.map(e=>{
              const emp=INIT_EMPLOYEES.find(x=>x.id===e.empId);
              return[
                <strong>{e.name}</strong>,
                <span style={{fontSize:11,color:Q.text3}}>{emp?emp.title:""}</span>,
                fM(e.gross)+" F",
                <span style={{color:Q.red}}>{fM(e.cnpsEmp)} F</span>,
                <span style={{color:Q.orange}}>{fM(e.irpp)} F</span>,
                <strong style={{color:Q.green,fontSize:14}}>{fM(e.net)} F</strong>,
                <StatusBadge status={sel.status}/>,
                <QBtn label="Bulletin" variant="light" sm icon="print"/>
              ];
            })}
          />
          <div style={{display:"flex",gap:8,marginTop:14}}>
            <QBtn label="Imprimer tous les bulletins" variant="light" sm icon="print"/>
            <QBtn label="Virer les salaires" variant="primary" sm icon="bank"/>
          </div>
        </div>
      )}
      {tab==="employees"&&(
        <div>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
            <QBtn label="Nouvel employe" variant="primary" icon="plus"/>
          </div>
          <QTable
            cols={[{l:"Matricule"},{l:"Employe"},{l:"Poste"},{l:"Departement"},{l:"Type"},{l:"Salaire brut",right:true},{l:"Date embauche"},{l:"Statut"}]}
            rows={employees.map(e=>[
              <span style={{fontSize:11,color:Q.text4}}>{e.id}</span>,
              <strong>{e.firstName+" "+e.lastName}</strong>,
              <span style={{fontSize:11,color:Q.text3}}>{e.title}</span>,
              e.dept,e.payType,
              <span style={{fontWeight:600}}>{fM(e.payRate)} F</span>,
              fD2(e.hireDate),
              <StatusBadge status={e.status}/>
            ])}
          />
        </div>
      )}
      {tab==="reports"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {["Resume paie mensuel","Detail paie par employe","Resume gains employes","Responsabilite fiscale","IRPP par employe","Declaration CNPS mensuelle","Masse salariale annuelle","Bulletins de paie archives","Charges sociales recap"].map((r,i)=>(
            <div key={i} style={{padding:"14px 16px",background:Q.white,border:"1px solid "+Q.border,borderRadius:3,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <Ico n="report" s={15} c={Q.green}/>
                <span style={{fontSize:12,fontWeight:600,color:Q.text}}>{r}</span>
              </div>
              <QBtn label="Generer" variant="primary" sm/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ================================================================
//  TIME TRACKING
// ================================================================
const TimeView = ({employees,jobs}) => {
  const [entries,setEntries] = useState(INIT_TIME);
  const [mode,setMode]       = useState("single");
  const DAYS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

  return(
    <div>
      <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center"}}>
        <div style={{display:"flex",gap:0,background:Q.white,border:"1px solid "+Q.border,borderRadius:3,overflow:"hidden"}}>
          {["weekly","single"].map(m=>(
            <button key={m} onClick={()=>setMode(m)}
              style={{padding:"7px 14px",border:"none",background:mode===m?Q.green:Q.white,
                color:mode===m?Q.white:Q.text3,fontSize:12,fontWeight:mode===m?700:400,cursor:"pointer",fontFamily:"inherit"}}>
              {m==="weekly"?"Feuille hebdomadaire":"Entree unique"}
            </button>
          ))}
        </div>
        <div style={{marginLeft:"auto"}}><QBtn label="Enregistrer les heures" variant="primary" icon="time"/></div>
      </div>
      {mode==="single"&&(
        <div style={{background:Q.white,border:"1px solid "+Q.border,borderRadius:4,padding:"20px",maxWidth:600}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <QField label="Employe"><QSelect value="" onChange={()=>{}} placeholder="Selectionner..." options={employees.map(e=>({v:e.id,l:e.firstName+" "+e.lastName}))}/></QField>
            <QField label="Date"><QInput type="date" value={TODAY} onChange={()=>{}}/></QField>
            <QField label="Customer Job"><QSelect value="" onChange={()=>{}} placeholder="Selectionner un job..." options={jobs.map(j=>({v:j.id,l:j.name}))}/></QField>
            <QField label="Service Item"><QSelect value="" onChange={()=>{}} placeholder="Type de service..." options={["Service Installation 5G","Maintenance","Survey RF","Management","Transport"]}/></QField>
            <QField label="Duree (heures)"><QInput type="number" value="" onChange={()=>{}} placeholder="0.00" suffix="h"/></QField>
            <QField label="Taux horaire"><QInput type="number" value="" onChange={()=>{}} prefix="FCFA" placeholder="0"/></QField>
            <QField label="Note" col><QTextarea value="" onChange={()=>{}} placeholder="Description du travail effectue..."/></QField>
            <QField label="Facturable">
              <div style={{display:"flex",alignItems:"center",gap:8,paddingTop:6}}>
                <input type="checkbox" style={{width:16,height:16,accentColor:Q.green}}/>
                <span style={{fontSize:13,color:Q.text2}}>Facturable au client</span>
              </div>
            </QField>
          </div>
          <div style={{marginTop:16,display:"flex",gap:8,justifyContent:"flex-end"}}>
            <QBtn label="Annuler" variant="light"/>
            <QBtn label="Enregistrer" variant="primary" icon="check"/>
          </div>
        </div>
      )}
      {mode==="weekly"&&(
        <div style={{background:Q.white,border:"1px solid "+Q.border,borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:"1px solid "+Q.border,background:"#F9FAFB"}}>
            <span style={{fontSize:13,fontWeight:700,color:Q.text}}>Feuille de temps hebdomadaire</span>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:800}}>
              <thead>
                <tr style={{background:"#F9FAFB",borderBottom:"1px solid "+Q.border}}>
                  <th style={{padding:"9px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:Q.text3,textTransform:"uppercase",width:180}}>Customer Job</th>
                  <th style={{padding:"9px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:Q.text3,textTransform:"uppercase",width:160}}>Service</th>
                  {DAYS.map(d=>(
                    <th key={d} style={{padding:"9px 8px",textAlign:"center",fontSize:11,fontWeight:700,color:Q.text3,textTransform:"uppercase"}}>{d}</th>
                  ))}
                  <th style={{padding:"9px 14px",textAlign:"right",fontSize:11,fontWeight:700,color:Q.text3,textTransform:"uppercase"}}>Total</th>
                </tr>
              </thead>
              <tbody>
                {jobs.slice(0,3).map((job,i)=>(
                  <tr key={i} style={{borderBottom:"1px solid "+Q.border2}}>
                    <td style={{padding:"7px 14px",fontSize:12}}>{job.name}</td>
                    <td style={{padding:"7px 8px",fontSize:12}}>Service principal</td>
                    {DAYS.map((d,di)=>(
                      <td key={d} style={{padding:"7px 6px",width:50}}>
                        <QInput type="number" value={i===0?[8,8,0,6,8,0,0][di]||"":""} onChange={()=>{}} small/>
                      </td>
                    ))}
                    <td style={{padding:"7px 14px",textAlign:"right",fontWeight:700,color:Q.blue}}>{i===0?"30h":"0h"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div style={{marginTop:20}}>
        <div style={{fontSize:12,fontWeight:700,color:Q.text3,textTransform:"uppercase",letterSpacing:.4,marginBottom:10}}>Entrees recentes</div>
        <QTable
          cols={[{l:"Date"},{l:"Employe"},{l:"Job"},{l:"Service"},{l:"Heures",right:true},{l:"Montant",right:true},{l:"Facturable"},{l:"Note"}]}
          rows={entries.map(t=>{
            const e=INIT_EMPLOYEES.find(x=>x.id===t.empId);
            const j=jobs.find(x=>x.id===t.job);
            return[
              fD2(t.date),
              e?e.firstName+" "+e.lastName:"—",
              <span style={{fontSize:11,color:Q.text3}}>{j?j.name:"—"}</span>,
              t.service,
              <strong>{t.hours}h</strong>,
              <span style={{color:Q.blue,fontWeight:600}}>{fM(t.hours*t.rate)} F</span>,
              t.billable?<span style={{color:Q.green,fontWeight:600}}>Oui</span>:<span style={{color:Q.text3}}>Non</span>,
              <span style={{fontSize:11,color:Q.text3,fontStyle:"italic"}}>{t.note}</span>
            ];
          })}
        />
      </div>
    </div>
  );
};

// ================================================================
//  CHART OF ACCOUNTS
// ================================================================
const COAView = () => {
  const [search,setSearch] = useState("");
  const [filter,setFilter] = useState("All");

  const types=["All","Bank","Accounts Receivable","Accounts Payable","Income","Expense","Cost of Goods Sold","Equity","Fixed Asset","Other Current Asset","Other Current Liability","Long Term Liability"];
  const TYPE_COLORS={"Bank":Q.green,"Accounts Receivable":Q.blue,"Accounts Payable":Q.orange,"Income":Q.green,"Expense":Q.red,"Cost of Goods Sold":Q.red,"Equity":Q.purple,"Fixed Asset":Q.blue,"Other Current Asset":Q.blue,"Other Current Liability":Q.orange,"Long Term Liability":Q.orange};

  const filtered=INIT_COA.filter(a=>{
    const ms=!search||(a.num+a.name).toLowerCase().includes(search.toLowerCase());
    const mf=filter==="All"||a.type===filter;
    return ms&&mf;
  });

  return(
    <div>
      <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:7,background:Q.white,border:"1px solid "+Q.border,borderRadius:3,padding:"6px 10px",flex:1,maxWidth:280}}>
          <Ico n="search" s={13} c={Q.text4}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un compte..."
            style={{border:"none",outline:"none",fontSize:13,flex:1,fontFamily:"inherit",color:Q.text,background:"transparent"}}/>
        </div>
        <QSelect value={filter} onChange={setFilter} options={types.map(t=>({v:t,l:t==="All"?"Tous les types":t}))} small/>
        <div style={{marginLeft:"auto"}}>
          <QBtn label="Nouveau compte" variant="primary" icon="plus"/>
        </div>
      </div>
      <QTable
        cols={[{l:"N Compte",w:100},{l:"Nom du compte"},{l:"Type"},{l:"Solde debiteur",right:true},{l:"Solde crediteur",right:true},{l:"Normal"},{l:"Actions",w:100}]}
        rows={filtered.map(a=>[
          <span style={{fontWeight:700,color:TYPE_COLORS[a.type]||Q.text3,fontFamily:"monospace"}}>{a.num}</span>,
          <span style={{fontWeight:500,paddingLeft:a.sub?16:0}}>{a.name}</span>,
          <span style={{fontSize:11,padding:"2px 7px",borderRadius:10,background:(TYPE_COLORS[a.type]||Q.text3)+"15",color:TYPE_COLORS[a.type]||Q.text3,fontWeight:600}}>{a.type}</span>,
          a.balance>0?<span style={{color:Q.blue,fontWeight:600}}>{fM(a.balance)} F</span>:"—",
          a.balance<0?<span style={{color:Q.red,fontWeight:600}}>{fM(Math.abs(a.balance))} F</span>:"—",
          <span style={{fontSize:11,padding:"2px 7px",borderRadius:10,background:a.normal==="D"?Q.blue_l:Q.orange_l,color:a.normal==="D"?Q.blue:Q.orange,fontWeight:600}}>{a.normal==="D"?"Debiteur":"Crediteur"}</span>,
          <QBtn label="Modifier" variant="light" sm icon="edit"/>
        ])}
      />
    </div>
  );
};

// ================================================================
//  ITEMS LIST
// ================================================================
const ItemsView = () => {
  const [search,setSearch] = useState("");
  const [filter,setFilter] = useState("All");
  const TYPE_COLORS={"Service":Q.green,"Inventory Part":Q.blue,"Non-inventory Part":Q.orange,"Other Charge":Q.purple};

  const filtered=INIT_ITEMS.filter(it=>{
    const ms=!search||it.name.toLowerCase().includes(search.toLowerCase());
    const mf=filter==="All"||it.type===filter;
    return ms&&mf;
  });

  return(
    <div>
      <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:7,background:Q.white,border:"1px solid "+Q.border,borderRadius:3,padding:"6px 10px",flex:1,maxWidth:280}}>
          <Ico n="search" s={13} c={Q.text4}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un article..."
            style={{border:"none",outline:"none",fontSize:13,flex:1,fontFamily:"inherit",color:Q.text,background:"transparent"}}/>
        </div>
        <div style={{display:"flex",gap:1,background:Q.white,border:"1px solid "+Q.border,borderRadius:3,overflow:"hidden"}}>
          {["All","Service","Inventory Part"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{padding:"6px 11px",border:"none",background:filter===f?Q.green:"transparent",
                color:filter===f?Q.white:Q.text3,fontSize:11,fontWeight:filter===f?700:400,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
              {f==="All"?"Tous":f==="Service"?"Services":"Stock"}
            </button>
          ))}
        </div>
        <div style={{marginLeft:"auto"}}><QBtn label="Nouvel article" variant="primary" icon="plus"/></div>
      </div>
      <QTable
        cols={[{l:"Nom"},{l:"Type"},{l:"Description"},{l:"Taux de vente",right:true},{l:"Compte"},{l:"TVA"},{l:"Actions"}]}
        rows={filtered.map(it=>[
          <strong style={{color:Q.text}}>{it.name}</strong>,
          <span style={{fontSize:11,padding:"2px 7px",borderRadius:10,background:(TYPE_COLORS[it.type]||Q.text3)+"15",color:TYPE_COLORS[it.type]||Q.text3,fontWeight:600}}>{it.type}</span>,
          <span style={{fontSize:11,color:Q.text3}}>{it.desc}</span>,
          <span style={{fontWeight:600}}>{typeof it.rate==="number"&&it.rate>1000?fM(it.rate)+" F":it.rate}</span>,
          <span style={{fontFamily:"monospace",fontSize:11,color:Q.blue}}>{it.account}</span>,
          it.taxable?<span style={{color:Q.green,fontSize:11,fontWeight:600}}>TVA {Math.round(TVA*10000)/100}%</span>:<span style={{color:Q.text3,fontSize:11}}>Exonere</span>,
          <QBtn label="Modifier" variant="light" sm icon="edit"/>
        ])}
      />
    </div>
  );
};

// ================================================================
//  BC IMPORT
// ================================================================
const BCImportView = ({bcs,jobs}) => {
  const [selBC,setSelBC]         = useState(null);
  const [processing,setProcessing]= useState(false);

  const simulateImport = () => {
    setProcessing(true);
    setTimeout(()=>setProcessing(false),2000);
  };

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",
        background:"#FEF3C7",border:"1px solid "+Q.orange+"40",borderRadius:4,marginBottom:18}}>
        <Ico n="lock" s={16} c={Q.orange}/>
        <div style={{flex:1}}>
          <strong style={{color:Q.orange}}>CONFIDENTIEL — Comptabilite et Direction uniquement.</strong>
          <span style={{fontSize:12,color:Q.text2}}> Les montants Huawei sont masques pour les Project Managers.</span>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
        <div
          onDragOver={e=>{e.preventDefault();}}
          onDrop={e=>{e.preventDefault();simulateImport();}}
          style={{border:"2px dashed "+Q.border,borderRadius:6,padding:"32px 20px",
            textAlign:"center",background:"#FAFAFA",cursor:"pointer"}}
          onClick={simulateImport}>
          <div style={{width:50,height:50,borderRadius:8,background:Q.green_l,
            display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
            <Ico n="import" s={24} c={Q.green}/>
          </div>
          <div style={{fontSize:14,fontWeight:700,color:Q.text,marginBottom:6}}>
            {processing?"Lecture IA en cours...":"Importer BC Huawei"}
          </div>
          <div style={{fontSize:12,color:Q.text3,marginBottom:14}}>
            Glisser-deposer un fichier PDF ou Excel<br/>
            Lecture automatique par IA
          </div>
          <QBtn label="Parcourir les fichiers" variant="primary" icon="import"/>
          {processing&&(
            <div style={{marginTop:12,padding:"8px 14px",background:Q.green_l,borderRadius:3,fontSize:12,color:Q.green,fontWeight:600}}>
              IA en lecture... Extraction automatique des donnees
            </div>
          )}
        </div>
        <div style={{background:Q.white,border:"1px solid "+Q.border,borderRadius:4,padding:"20px"}}>
          <div style={{fontSize:13,fontWeight:700,color:Q.text,marginBottom:14}}>Saisie manuelle</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <QField label="N BC Huawei"><QInput value="" onChange={()=>{}} placeholder="BC-HW-2024-XXX"/></QField>
            <QField label="Client"><QSelect value="" onChange={()=>{}} placeholder="Selectionner..." options={["MTN Cameroun","Orange Cameroun","CAMTEL","Nexttel","Gouvernement"]}/></QField>
            <QField label="Site"><QInput value="" onChange={()=>{}} placeholder="DLA-001, YDE-001..."/></QField>
            <QField label="Montant total Huawei"><QInput type="number" value="" onChange={()=>{}} prefix="FCFA"/></QField>
            <QBtn label="Creer le job depuis ce BC" variant="primary" icon="job" full/>
          </div>
        </div>
      </div>
      <div style={{fontSize:13,fontWeight:700,color:Q.text,marginBottom:12}}>BC Huawei importes ({bcs.length})</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {bcs.map(bc=>{
          const job=jobs.find(j=>j.bcRef===bc.id);
          return(
            <div key={bc.id} style={{background:Q.white,border:"1px solid "+Q.border,borderRadius:4,overflow:"hidden",cursor:"pointer"}}
              onClick={()=>setSelBC(selBC===bc.id?null:bc.id)}>
              <div style={{padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                    <span style={{fontSize:14,fontWeight:700,color:Q.orange}}>{bc.id}</span>
                    <StatusBadge status={bc.status}/>
                    <span style={{fontSize:11,padding:"2px 7px",borderRadius:10,background:Q.blue_l,color:Q.blue}}>{bc.type}</span>
                    <span style={{fontSize:10,color:Q.text4}}>Import: {bc.importMethod}</span>
                  </div>
                  <div style={{fontSize:12,color:Q.text2}}>{bc.client} · Recu: {fD2(bc.dateReception)}</div>
                </div>
                <div style={{display:"flex",gap:16,alignItems:"center"}}>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:11,color:Q.text4,marginBottom:2}}>Montant Huawei</div>
                    <div style={{fontSize:18,fontWeight:800,color:Q.orange}}>{fM(bc.montantTotal)} {bc.currency}</div>
                  </div>
                  {job?(
                    <div style={{textAlign:"center",padding:"6px 12px",background:Q.green_l,borderRadius:3}}>
                      <div style={{fontSize:9,color:Q.green,textTransform:"uppercase",marginBottom:2}}>Job cree</div>
                      <div style={{fontSize:11,fontWeight:700,color:Q.green}}>{job.id}</div>
                    </div>
                  ):(
                    <QBtn label="Creer le Job" variant="primary" sm icon="job"/>
                  )}
                  <Ico n={selBC===bc.id?"chevd":"chevr"} s={16} c={Q.text3}/>
                </div>
              </div>
              {selBC===bc.id&&(
                <div style={{borderTop:"1px solid "+Q.border,padding:"14px 18px",background:"#F9FAFB"}}>
                  <div style={{fontSize:12,fontWeight:700,color:Q.text3,textTransform:"uppercase",letterSpacing:.4,marginBottom:10}}>
                    Detail des lignes — Donnees extraites automatiquement
                  </div>
                  <QTable
                    cols={[{l:"Description"},{l:"Qte",right:true},{l:"Prix unitaire",right:true},{l:"Total",right:true}]}
                    rows={bc.lignes.map(l=>[l.desc,l.qte,<span style={{color:Q.text3}}>{fM(l.pu)} {bc.currency}</span>,<strong style={{color:Q.orange}}>{fM(l.total)} {bc.currency}</strong>])}
                    compact/>
                  <div style={{display:"flex",justifyContent:"flex-end",marginTop:10,padding:"10px 14px",background:Q.orange_l,borderRadius:3}}>
                    <span style={{fontSize:14,fontWeight:800,color:Q.orange}}>TOTAL: {fM(bc.montantTotal)} {bc.currency}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ================================================================
//  REPORTS
// ================================================================
const ReportsView = () => {
  const REPORT_GROUPS = [
    {name:"Company and Financial",color:Q.green,icon:"report",reports:["Profit and Loss Standard","Profit and Loss Detail","Profit and Loss by Job","P et L Comparatif","Bilan comptable OHADA","Bilan Comparatif","Balance de verification","Grand Livre","Tableau des flux de tresorerie","Budget vs Reel","Forecast financier"]},
    {name:"Clients et Accounts Receivable",color:Q.blue,icon:"customer",reports:["AR Aging Summary","AR Aging Detail","Balance clients resume","Balance clients detail","Rapport de recouvrements","Factures non payees","Couts non factures","Delai moyen de paiement","Collections report"]},
    {name:"Sales",color:Q.green,icon:"invoice",reports:["Ventes par client","Ventes par article","Ventes par job","Ventes par classe","CA mensuel","Factures en attente","Devis ouverts","Progress Invoicing","Previsions CA"]},
    {name:"Fournisseurs et Accounts Payable",color:Q.orange,icon:"vendor",reports:["AP Aging Summary","AP Aging Detail","Balance fournisseurs resume","Balance fournisseurs detail","Bills non payes","PO ouverts","Achats par fournisseur","Achats par article"]},
    {name:"Job Costing",color:Q.purple,icon:"job",reports:["Rentabilite par job","Rentabilite par job detail","Estimates vs Actuals resume","Estimates vs Actuals detail","Couts par job resume","Couts par fournisseur","Couts non factures par job","PO ouverts par job","Temps par job resume","Temps par job detail"]},
    {name:"Payroll",color:Q.green,icon:"payroll",reports:["Resume paie","Detail paie","Resume gains employes","Responsabilite fiscale","Declaration CNPS","Declaration IRPP","Masse salariale annuelle"]},
    {name:"Banking",color:Q.blue,icon:"bank",reports:["Detail depots","Detail cheques","Cheques manquants","Historique rapprochement","Rapport de tresorerie","Releve de compte"]},
    {name:"Tax et Fiscalite",color:Q.orange,icon:"tax",reports:["Declaration TVA mensuelle","TVA collectee par client","TVA deductible par fournisseur","Rapport IS","Acomptes IS","Resume fiscal annuel"]},
  ];

  return(
    <div>
      <div style={{fontSize:14,fontWeight:700,color:Q.text,marginBottom:16}}>
        Rapports — {REPORT_GROUPS.reduce((s,g)=>s+g.reports.length,0)} rapports disponibles
      </div>
      {REPORT_GROUPS.map((group,gi)=>(
        <div key={gi} style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,
            padding:"8px 14px",background:Q.white,border:"1px solid "+Q.border,
            borderRadius:4,borderLeft:"4px solid "+group.color}}>
            <Ico n={group.icon} s={15} c={group.color}/>
            <span style={{fontSize:13,fontWeight:700,color:Q.text}}>{group.name}</span>
            <span style={{fontSize:11,color:Q.text4,marginLeft:4}}>({group.reports.length} rapports)</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:8}}>
            {group.reports.map((r,ri)=>(
              <div key={ri}
                style={{padding:"11px 14px",background:Q.white,border:"1px solid "+Q.border2,
                  borderRadius:3,cursor:"pointer",display:"flex",justifyContent:"space-between",
                  alignItems:"center",transition:"all .1s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=group.color;e.currentTarget.style.background=group.color+"08"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=Q.border2;e.currentTarget.style.background=Q.white}}>
                <span style={{fontSize:12,color:Q.text,fontWeight:500}}>{r}</span>
                <div style={{display:"flex",gap:4,flexShrink:0}}>
                  <QBtn label="Voir" variant="light" sm/>
                  <QBtn label="Export" variant="light" sm icon="download"/>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ================================================================
//  NAVIGATION
// ================================================================
const QB_NAV = [
  {section:"HOME",items:[{id:"home",label:"Tableau de bord",icon:"home"}]},
  {section:"CUSTOMERS",items:[
    {id:"customers",label:"Customer Center",icon:"customer"},
    {id:"invoices",label:"Creer des factures",icon:"invoice"},
    {id:"estimates",label:"Devis",icon:"estimate"},
    {id:"receive",label:"Recevoir paiements",icon:"receive"},
  ]},
  {section:"VENDORS",items:[
    {id:"vendors",label:"Vendor Center",icon:"vendor"},
    {id:"bills",label:"Saisir des bills",icon:"bill"},
    {id:"paybills",label:"Payer des bills",icon:"paybill"},
    {id:"pos",label:"Purchase Orders",icon:"po"},
  ]},
  {section:"EMPLOYEES",items:[
    {id:"payroll",label:"Paie et RH",icon:"payroll"},
    {id:"time",label:"Saisie des heures",icon:"time"},
  ]},
  {section:"BANKING",items:[
    {id:"banking",label:"Banking et Tresorerie",icon:"bank"},
  ]},
  {section:"COMPANY",items:[
    {id:"coa",label:"Plan comptable",icon:"coa"},
    {id:"items",label:"Articles et Services",icon:"inventory"},
    {id:"jobs",label:"Job Center",icon:"job"},
    {id:"bc_import",label:"Import BC Huawei",icon:"bc"},
  ]},
  {section:"REPORTS",items:[
    {id:"reports",label:"Rapports",icon:"report"},
  ]},
];

// ================================================================
//  EXPORT PRINCIPAL
// ================================================================
export default function CleanITBooks() {
  const navigate = useNavigate();
  const [nav,         setNav]         = useState("home");
  const [customers,   setCustomers]   = useState(INIT_CUSTOMERS);
  const [vendors,     setVendors]     = useState(INIT_VENDORS);
  const [invoices,    setInvoices]    = useState(INIT_INVOICES);
  const [bills,       setBills]       = useState(INIT_BILLS);
  const [pos,         setPos]         = useState(INIT_POS);
  const [jobs,        setJobs]        = useState(INIT_JOBS);
  const [employees,   setEmployees]   = useState(INIT_EMPLOYEES);
  const [time,        setTime]        = useState(INIT_TIME);
  const [banks,       setBanks]       = useState(INIT_BANKS);
  const [bcs,         setBcs]         = useState(INIT_BC);

  const [showInvForm,  setShowInvForm]  = useState(false);
  const [showBillForm, setShowBillForm] = useState(false);
  const [selBillVendor,setSelBillVendor]= useState(null);
  const [selInvoice,   setSelInvoice]   = useState(null);
  const [invFormCust,  setInvFormCust]  = useState(null);

  const INIT_TRANSACTIONS = [
    {id:"TXN-001",bankId:"B001",date:"2024-03-28",desc:"VIR RECU MTN CAMEROUN",amount:5000000,type:"deposit",status:"matched",ref:"VIR-MTN-001"},
    {id:"TXN-002",bankId:"B001",date:"2024-03-25",desc:"PAIEMENT HUAWEI TECHNOLOGIES",amount:-28500000,type:"payment",status:"matched",ref:"BILL-2024-001"},
    {id:"TXN-003",bankId:"B001",date:"2024-03-22",desc:"VIR RECU TRESOR PUBLIC",amount:11448000,type:"deposit",status:"matched",ref:"TRESOR-2024-001"},
    {id:"TXN-004",bankId:"B001",date:"2024-03-20",desc:"SALAIRES MARS 2024",amount:-18000000,type:"payment",status:"matched",ref:"SAL-MAR-2024"},
    {id:"TXN-005",bankId:"B001",date:"2024-03-15",desc:"CAMTEL FACTURATION Q1",amount:-1200000,type:"payment",status:"unmatched",ref:null},
    {id:"TXN-006",bankId:"B001",date:"2024-03-10",desc:"COMMISSION BANCAIRE",amount:-45000,type:"fee",status:"matched",ref:"FEE-MAR-2024"},
  ];

  const handleNav = useCallback((id)=>{
    if(id==="new_invoice"){setShowInvForm(true);return;}
    if(id==="new_bill"){setShowBillForm(true);return;}
    setNav(id);
    setSelInvoice(null);
  },[]);

  const currentSection = QB_NAV.find(s=>s.items.some(it=>it.id===nav));
  const currentItem    = QB_NAV.flatMap(s=>s.items).find(it=>it.id===nav);

  const totalAR = invoices.reduce((s,i)=>s+(i.balance||0)*(i.currency==="USD"?FX.USD:1),0);
  const totalAP = bills.reduce((s,b)=>s+b.balance,0);
  const tresor  = banks.reduce((s,b)=>s+b.balance,0);

  const renderContent = () => {
    switch(nav){
      case "home":      return <ViewHome invoices={invoices} bills={bills} jobs={jobs} onNav={handleNav}/>;
      case "customers": return <CustomerCenter customers={customers} invoices={invoices} onNewInvoice={(cId)=>{setInvFormCust(cId);setShowInvForm(true);}}/>;
      case "vendors":   return <VendorCenter vendors={vendors} bills={bills} onNewBill={(vId)=>{setSelBillVendor(vId);setShowBillForm(true);}}/>;
      case "invoices":
      case "receive":   return <InvoiceList invoices={invoices} customers={customers} jobs={jobs} items={INIT_ITEMS} onNew={()=>setShowInvForm(true)} onView={(id)=>setSelInvoice(invoices.find(i=>i.id===id))}/>;
      case "bills":
      case "paybills":  return <BillList bills={bills} vendors={vendors} jobs={jobs} onNew={()=>setShowBillForm(true)} onPay={()=>{}}/>;
      case "pos":       return <POList pos={pos} vendors={vendors} jobs={jobs}/>;
      case "estimates": return <div style={{padding:"40px",textAlign:"center",color:Q.text4}}>Module Devis — meme structure que les factures avec champs Markup et Expiration</div>;
      case "payroll":   return <PayrollView employees={employees}/>;
      case "time":      return <TimeView employees={employees} jobs={jobs}/>;
      case "banking":   return <BankingView banks={banks} transactions={INIT_TRANSACTIONS}/>;
      case "coa":       return <COAView/>;
      case "items":     return <ItemsView/>;
      case "jobs":      return <JobCenter jobs={jobs} customers={customers} invoices={invoices} bills={bills} time={time}/>;
      case "bc_import": return <BCImportView bcs={bcs} jobs={jobs}/>;
      case "reports":   return <ReportsView/>;
      default:          return <ViewHome invoices={invoices} bills={bills} jobs={jobs} onNav={handleNav}/>;
    }
  };

  return(
    <div style={{minHeight:"100vh",display:"flex",fontFamily:"\"Segoe UI\",\"Helvetica Neue\",Arial,sans-serif",background:Q.bg,WebkitFontSmoothing:"antialiased"}}>
      <style>{`
        @keyframes qbSlide{from{transform:translateX(100%)}to{transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-thumb{background:${Q.border};border-radius:3px}
        ::-webkit-scrollbar-track{background:transparent}
        input[type=number]::-webkit-inner-spin-button{opacity:1}
      `}</style>

      <div style={{width:220,background:Q.sidebar,borderRight:"1px solid "+Q.border,
        display:"flex",flexDirection:"column",flexShrink:0,
        position:"sticky",top:0,height:"100vh",overflowY:"auto",
        boxShadow:"2px 0 8px rgba(0,0,0,.04)"}}>
        <div style={{padding:"16px 14px 12px",borderBottom:"1px solid "+Q.border}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <div style={{width:32,height:32,borderRadius:5,background:Q.green,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Ico n="chart" s={17} c="white"/>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:Q.text,letterSpacing:-.3}}>CleanIT<span style={{color:Q.green}}>Books</span></div>
              <div style={{fontSize:9,color:Q.text4,letterSpacing:.3}}>SYSCOHADA · TVA 19.25%</div>
            </div>
          </div>
          <div style={{background:Q.bg,borderRadius:4,padding:"8px 10px",display:"flex",flexDirection:"column",gap:4}}>
            {[{l:"AR",v:fM(totalAR),c:Q.blue},{l:"AP",v:fM(totalAP),c:Q.orange},{l:"Tresor",v:fM(tresor),c:Q.green}].map(s=>(
              <div key={s.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:9,color:Q.text4,textTransform:"uppercase",letterSpacing:.3}}>{s.l}</span>
                <span style={{fontSize:10,fontWeight:700,color:s.c}}>{s.v} F</span>
              </div>
            ))}
          </div>
        </div>
        <nav style={{flex:1,padding:"6px 0",overflowY:"auto"}}>
          {QB_NAV.map(section=>(
            <div key={section.section}>
              <div style={{padding:"8px 14px 3px",fontSize:9,fontWeight:700,color:Q.text4,textTransform:"uppercase",letterSpacing:1}}>{section.section}</div>
              {section.items.map(item=>{
                const active=nav===item.id;
                return(
                  <button key={item.id} onClick={()=>handleNav(item.id)}
                    style={{width:"100%",padding:"7px 12px",border:"none",
                      borderLeft:"3px solid "+(active?Q.green:"transparent"),
                      background:active?Q.green_l:"transparent",
                      cursor:"pointer",display:"flex",alignItems:"center",gap:9,
                      textAlign:"left",fontFamily:"inherit",transition:"all .1s"}}
                    onMouseEnter={e=>{if(!active){e.currentTarget.style.background=Q.bg;e.currentTarget.style.borderLeftColor=Q.border;}}}
                    onMouseLeave={e=>{if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.borderLeftColor="transparent";}}}>
                    <Ico n={item.icon} s={15} c={active?Q.green:Q.text3}/>
                    <span style={{fontSize:12,fontWeight:active?700:400,color:active?Q.green:Q.text2}}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div style={{padding:"10px 12px",borderTop:"1px solid "+Q.border}}>
          <button onClick={()=>navigate("/terrain")}
            style={{width:"100%",padding:"7px 10px",borderRadius:3,border:"1px solid "+Q.border,
              background:Q.bg,cursor:"pointer",display:"flex",alignItems:"center",gap:8,
              fontFamily:"inherit",marginBottom:6,transition:"all .1s"}}
            onMouseEnter={e=>{e.currentTarget.style.background=Q.green_l;e.currentTarget.style.borderColor=Q.green;}}
            onMouseLeave={e=>{e.currentTarget.style.background=Q.bg;e.currentTarget.style.borderColor=Q.border;}}>
            <Ico n="terrain" s={13} c={Q.text3}/>
            <span style={{fontSize:11,color:Q.text3}}>Module Terrain</span>
          </button>
          <button onClick={()=>navigate("/finance")}
            style={{width:"100%",padding:"7px 10px",borderRadius:3,border:"1px solid "+Q.border,
              background:Q.bg,cursor:"pointer",display:"flex",alignItems:"center",gap:8,
              fontFamily:"inherit",transition:"all .1s"}}
            onMouseEnter={e=>{e.currentTarget.style.background=Q.blue_l;e.currentTarget.style.borderColor=Q.blue;}}
            onMouseLeave={e=>{e.currentTarget.style.background=Q.bg;e.currentTarget.style.borderColor=Q.border;}}>
            <Ico n="money" s={13} c={Q.text3}/>
            <span style={{fontSize:11,color:Q.text3}}>Module Finance</span>
          </button>
        </div>
      </div>

      <div style={{flex:1,overflow:"auto",minWidth:0,display:"flex",flexDirection:"column"}}>
        <div style={{background:Q.white,borderBottom:"1px solid "+Q.border,padding:"9px 22px",
          display:"flex",justifyContent:"space-between",alignItems:"center",
          position:"sticky",top:0,zIndex:200,boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:30,height:30,borderRadius:4,background:Q.green_l,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Ico n={currentItem?currentItem.icon:"home"} s={16} c={Q.green}/>
            </div>
            <div>
              <div style={{fontSize:10,color:Q.text4,textTransform:"uppercase",letterSpacing:.5}}>
                CleanITBooks · {currentSection?currentSection.section:""}
              </div>
              <div style={{fontSize:14,fontWeight:700,color:Q.text}}>{currentItem?currentItem.label:""}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:7,background:Q.bg,border:"1px solid "+Q.border,borderRadius:3,padding:"6px 11px"}}>
              <Ico n="search" s={13} c={Q.text4}/>
              <input placeholder="Recherche globale..." style={{border:"none",outline:"none",fontSize:13,color:Q.text,background:"transparent",width:180,fontFamily:"inherit"}}/>
            </div>
            <QBtn label="Creer" variant="primary" sm icon="plus" onClick={()=>{if(["customers","invoices","receive"].includes(nav))setShowInvForm(true);else if(["vendors","bills","paybills"].includes(nav))setShowBillForm(true);}}/>
            <QBtn label="Imprimer" variant="light" sm icon="print"/>
            <QBtn label="Exporter" variant="light" sm icon="download"/>
            <div style={{padding:"4px 10px",background:Q.green_l,borderRadius:3,border:"1px solid "+Q.green+"30",fontSize:10,fontWeight:600,color:Q.green}}>
              OHADA · TVA {Math.round(TVA*10000)/100}%
            </div>
          </div>
        </div>
        <div style={{flex:1,padding:"18px 22px",maxWidth:1600,width:"100%",animation:"fadeIn .2s ease"}}>
          {renderContent()}
        </div>
      </div>

      {showInvForm&&(
        <InvoiceForm
          customers={customers} jobs={jobs} items={INIT_ITEMS}
          initialCustomerId={invFormCust||""}
          onSave={(inv)=>{setInvoices(p=>[...p,inv]);setInvFormCust(null);}}
          onClose={()=>{setShowInvForm(false);setInvFormCust(null);}}/>
      )}
      {showBillForm&&(
        <BillForm
          vendors={vendors} jobs={jobs}
          initialVendorId={selBillVendor||""}
          onSave={(b)=>{setBills(p=>[...p,b]);setSelBillVendor(null);}}
          onClose={()=>{setShowBillForm(false);setSelBillVendor(null);}}/>
      )}
      {selInvoice&&(
        <InvoiceDetail
          invoice={selInvoice} customers={customers} jobs={jobs}
          onClose={()=>setSelInvoice(null)}/>
      )}
    </div>
  );
}
