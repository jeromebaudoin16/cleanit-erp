import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const STATUS_EQ = {
  actif:       { label:'Actif',        color:'#16a34a', bg:'#f0fdf4' },
  maintenance: { label:'Maintenance',  color:'#f59e0b', bg:'#fefce8' },
  hors_service:{ label:'Hors service', color:'#dc2626', bg:'#fef2f2' },
  stock:       { label:'En stock',     color:'#0078d4', bg:'#eff6ff' },
};


const CatIc = ({d,size=20,color='currentColor',sw=1.7}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {(Array.isArray(d)?d:[d]).map((p,i)=><path key={i} d={p}/>)}
  </svg>
);
const CAT_ICONS = {
  antenna:   ['M12 2v20','M7 9a5 5 0 0110 0','M4 6a8 8 0 0116 0','M9 20h6'],
  bbu:       ['M4 4h16v16H4V4z','M4 9.3h16','M4 14.7h16','M9.3 4v16','M14.7 4v16'],
  dish:      ['M3 17a9 9 0 0118 0','M12 17V8','M9 5l3 3 3-3'],
  router:    ['M4 4h16v4H4V4z','M4 10h16v4H4v-4z','M4 16h16v4H4v-4z','M7 6h.01','M7 12h.01','M7 18h.01'],
  fiber:     ['M2 12h6','M16 12h6','M9 12a3 3 0 106 0 3 3 0 10-6 0z'],
  battery:   ['M4 8h13v8H4z','M17 11h2v2h-2z','M8 8v8M11 8v8'],
  bolt:      ['M13 2L4 14h6l-1 8 9-12h-6l1-8z'],
  tool:      ['M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z'],
  splice:    ['M4 12h4l2-4 4 8 2-4h4'],
};
const CATALOG_CATEGORIES = [
  { id:'ran',          label:'Accès Radio',                 color:'#ea580c' },
  { id:'transmission', label:'Transmission / DWDM',         color:'#0078d4' },
  { id:'microwave',    label:'Faisceaux hertziens',         color:'#7c3aed' },
  { id:'ipcore',       label:'Cœur de réseau IP',           color:'#16a34a' },
  { id:'entreprise',   label:'Entreprise / B2B',            color:'#dc2626' },
  { id:'energie',      label:'Alimentation & Énergie',      color:'#ca8a04' },
  { id:'fibre',        label:'Fibre optique & Raccordement',color:'#0d9488' },
  { id:'accessoires',  label:'Accessoires & Petit matériel',color:'#475569' },
];
const CATALOG_ITEMS = [
  { id:'bbu5900', cat:'ran', icon:'bbu', name:'BBU 5900', sub:'Unité bande de base 5G/4G/3G/2G',
    img:'https://image.chukouplus.com/upload/C_4415/file/20240416/66205eeb559fb0712f1d58c725cc5c26.jpg',
    desc:"Cœur numérique de la station de base : traite le signal radio et pilote les unités RRU/AAU déportées par fibre optique. Un seul châssis peut combiner plusieurs générations technologiques (2G à 5G).",
    usage:"Installé en armoire (intérieur ou extérieur) à la base du site. Raccordé aux RRU/AAU par fibre optique (CPRI) et au réseau de transport par le côté backhaul.",
    specs:["Jusqu'à 6 standards radio dans un même boîtier","Liaison optique CPRI vers RRU/AAU déportés","Format compact (~9U), intérieur ou armoire extérieure"] },
  { id:'aau', cat:'ran', icon:'antenna', name:'AAU Massive MIMO', sub:'Antenne active (ex. AAU5613/5619/5639)',
    img:'https://www.henanliyuan.com/Uploads/5ea39b5c30c1e8517.jpg',
    desc:"Combine l'antenne et l'électronique radio dans un seul boîtier extérieur fixé en hauteur, pour une couverture 4G/5G plus large avec une emprise réduite sur le mât.",
    usage:"Fixation directe sur mât/pylône à la hauteur définie par l'étude radio. Alimentation DC depuis le bas du site, liaison optique vers le BBU.",
    specs:["Plusieurs gammes de fréquences selon le modèle","Installation directe sur mât, sans câble RF séparé","Réduit le nombre d'équipements à installer en hauteur"] },
  { id:'rru3908', cat:'ran', icon:'antenna', name:'RRU 3908', sub:'Unité radio distante (RRU)',
    desc:"Amplifie et transmet le signal radio près de l'antenne, relié au BBU par fibre optique pour limiter les pertes de signal sur la liaison antenne-baie.",
    usage:"Monté sur mât ou en façade, le plus proche possible de l'antenne passive qu'il alimente, pour minimiser la perte en ligne RF.",
    specs:["Liaison optique CPRI vers le BBU","Installation sur mât ou en façade, proche de l'antenne","Plusieurs variantes selon la bande de fréquence"] },
  { id:'antenne-dir', cat:'ran', icon:'antenna', name:'Antenne directionnelle multibande', sub:'Antenne passive sectorielle',
    desc:"Antenne passive installée par trois (un triptyque par secteur) pour couvrir une zone géographique donnée autour du site.",
    usage:"Montage en triptyque (3 secteurs à 120°) sur le pylône, orientation et inclinaison (downtilt/azimut) réglées selon l'étude de couverture du site.",
    specs:["Plusieurs ports pour combiner plusieurs bandes","Réglage du downtilt pour ajuster la couverture","Montage sur mât ou pylône"] },
  { id:'osn9800', cat:'transmission', icon:'router', name:'OptiX OSN 9800', sub:'Transmission optique haute capacité',
    desc:"Plateforme de transmission utilisée pour le cœur du réseau de transport longue distance ; multiplexe plusieurs longueurs d'onde (DWDM) sur une seule fibre pour un très grand volume de trafic.",
    usage:"Installé en salle technique/data center, en baie 19/21 pouces, raccordé aux liaisons fibre longue distance entre sites majeurs du réseau de transport.",
    specs:["Technologie DWDM / OTN","Conçu pour les liaisons backbone et data center","Capacité évolutive par ajout de cartes"] },
  { id:'osn6800', cat:'transmission', icon:'router', name:'OptiX OSN 6800', sub:'Transmission métro (MS-OTN)',
    desc:"Plateforme orientée réseaux métropolitains : regroupe plusieurs types de trafic (TDM, paquet, OTN) sur une infrastructure unique, adaptée aux sites secondaires.",
    usage:"Déployé dans les nœuds de transmission métropolitains/régionaux reliant les sites entre eux dans une même zone urbaine.",
    specs:["Convergence TDM + Ethernet + OTN","Architecture flexible (MS-OTN)","Bon compromis coût / capacité pour le métro"] },
  { id:'dc908', cat:'transmission', icon:'router', name:'OptiXtrans DC908', sub:'Interconnexion data centers (DCI)',
    desc:"Équipement dédié à l'interconnexion de data centers à très haut débit, avec un déploiement automatisé conçu pour être rapide à mettre en service.",
    usage:"Installé entre deux sites de data center à interconnecter, raccordé sur la fibre noire dédiée entre les deux sites.",
    specs:["Interconnexion data center longue distance","Déploiement automatisé","Bande passante élevée par longueur d'onde"] },
  { id:'rtn950', cat:'microwave', icon:'dish', name:'RTN 950', sub:'Faisceau hertzien — unité intérieure (IDU)',
    desc:"Unité intérieure de transmission par faisceau hertzien, utilisée pour relier un site au réseau de transport quand la fibre optique n'est pas disponible.",
    usage:"Installé en armoire/baie à l'intérieur du shelter, raccordé à l'ODU extérieur par câble coaxial (FE/IF) et au réseau local du site côté Ethernet.",
    specs:["Liaison point-à-point sans fibre","Couplée à une unité extérieure (ODU) sur mât","Solution de backhaul pour sites isolés"] },
  { id:'odu', cat:'microwave', icon:'dish', name:'ODU faisceau hertzien', sub:'Unité extérieure (ODU) + antenne parabolique',
    desc:"Module extérieur monté sur mât et couplé à une antenne parabolique ; convertit et transmet le signal micro-ondes entre deux sites en visibilité directe.",
    usage:"Fixé directement derrière l'antenne parabolique sur le mât, en visibilité directe (ligne de vue) avec le site distant — alignement précis requis à l'installation.",
    specs:["Installation extérieure, résistant aux intempéries","Couplé à une antenne parabolique dédiée","Portée selon la fréquence et la taille d'antenne"] },
  { id:'ne40e', cat:'ipcore', icon:'router', name:'NE40E', sub:'Routeur de cœur de réseau IP',
    img:'https://www.henanliyuan.com/Uploads/6930f9e1df8046554.jpg',
    desc:"Routeur haut de gamme utilisé pour l'agrégation et le routage du trafic IP à fort débit, avec une haute disponibilité.",
    usage:"Installé en data center ou nœud central du réseau IP, en baie 19 pouces, raccordé aux liaisons de transport et aux équipements d'agrégation.",
    specs:["Hautes performances de routage IP","Redondance pour la haute disponibilité","Utilisé en cœur ou en agrégation réseau"] },
  { id:'cloudengine-campus', cat:'entreprise', icon:'router', name:'Commutateur de campus', sub:'Ex. S16700, S8700, S5755-H, S5735-L-V2',
    img:'https://www.henanliyuan.com/Uploads/5ec4a450128f78257.jpg',
    desc:"Gamme de commutateurs de campus, du modèle d'accès simple aux gros commutateurs cœur de réseau, pour les réseaux d'entreprise, gouvernement, éducation et finance.",
    usage:"Installé chez le client en armoire réseau (salle informatique, local technique), selon le rôle (accès, agrégation ou cœur) défini par l'architecture réseau du site.",
    specs:["Plusieurs gammes selon le débit (Gigabit à 100GE)","Modèles haut de gamme : cœur de réseau campus","Modèles d'accès : postes de travail"] },
  { id:'cloudengine-dc', cat:'entreprise', icon:'router', name:'Commutateur de data center', sub:'Ex. CE16800, CE9800, CE8800, CE6800',
    desc:"Gamme de commutateurs pour centre de données, avec automatisation et visibilité temps réel, utilisée aussi en campus haut de gamme.",
    usage:"Installé en baie de data center client, raccordant les serveurs et le stockage au réseau, ou en cœur de réseau campus pour les plus gros sites.",
    specs:["Modèles haut de gamme : cœur de très grande capacité","Modèles intermédiaires : agrégation/cœur data center","Modèles d'accès : le plus courant"] },
  { id:'routeur-agence', cat:'entreprise', icon:'router', name:'Routeur de succursale', sub:'Ex. AR6700, AR6100, AR650, AR630, AR610',
    desc:"Routeurs qui combinent routage, switching, sécurité et Wi-Fi dans un seul boîtier — utilisés en sortie de réseau pour les sièges/agences clients en B2B.",
    usage:"Installé en local technique chez le client, en coupure entre le réseau local de l'entreprise et la liaison opérateur (fibre/4G/5G) — souvent le tout premier équipement posé sur un site B2B.",
    specs:["Modèles d'entrée : petites/moyennes structures","Modèles avancés : sites plus importants, SD-WAN","Intègre souvent routage + Wi-Fi + sécurité"] },
  { id:'ea5800', cat:'entreprise', icon:'fiber', name:'Terminal de ligne optique (OLT)', sub:'Ex. série EA5800 / MA5800',
    img:'https://www.henanliyuan.com/Uploads/5d91782f3a3898333.jpg',
    desc:"Point de départ du réseau fibre optique passif (PON) vers les clients finaux ou entreprises raccordés en fibre.",
    usage:"Installé au central/nœud d'accès, raccordé en amont au réseau de transport et en aval aux fibres desservant les clients (FTTH/FTTB).",
    specs:["Point d'accès du réseau fibre passif (PON)","Dessert plusieurs clients depuis une seule fibre","Utilisé pour les raccordements FTTH / B2B fibre"] },
  { id:'etp-cabinet', cat:'energie', icon:'battery', name:"Armoire d'alimentation de site", sub:"Système d'alimentation -48V (ex. ETP48150/ETP48200)",
    desc:"Armoire d'alimentation qui convertit le courant alternatif du secteur en courant continu -48V pour tous les équipements télécom du site, avec gestion intégrée des batteries de secours.",
    usage:"Installée au pied du site (shelter ou armoire extérieure), c'est le point d'alimentation central : tout le matériel actif du site (BBU, transmission, etc.) y est raccordé en -48V.",
    specs:["Convertit AC secteur → DC -48V pour le site","Gestion intelligente de la charge batterie","Hauteur modulaire 1U à 11U selon la puissance"] },
  { id:'r4850', cat:'energie', icon:'bolt', name:'Module redresseur', sub:'Module de redressement enfichable (ex. R4850)',
    desc:"Module enfichable (\"hot-swap\") qui fait la conversion AC→DC à l'intérieur de l'armoire d'alimentation ; plusieurs modules en parallèle selon la puissance totale du site.",
    usage:"S'insère dans les emplacements prévus de l'armoire d'alimentation — remplaçable à chaud sans couper l'alimentation du site en cas de panne d'un module.",
    specs:["Haut rendement (>96%)","Remplaçable à chaud (hot-swap)","Plusieurs modules combinables selon la charge du site"] },
  { id:'batterie-site', cat:'energie', icon:'battery', name:'Batteries de site (plomb ou lithium)', sub:'Autonomie de secours en cas de coupure secteur',
    desc:"Bancs de batteries (technologie plomb-acide ou lithium selon le site) qui prennent le relais automatiquement en cas de coupure du secteur, pour maintenir le site actif.",
    usage:"Installées en armoire dédiée ou dans l'armoire d'alimentation elle-même, raccordées au bus -48V ; l'autonomie dépend du nombre de strings installées et de la consommation du site.",
    specs:["Bascule automatique en cas de coupure secteur","Plomb-acide (économique) ou lithium (plus léger, plus durable)","Autonomie dimensionnée selon la criticité du site"] },
  { id:'smu', cat:'energie', icon:'router', name:'Unité de supervision', sub:"Monitoring de l'alimentation et de l'environnement (SMU/PMU)",
    desc:"Carte de supervision qui surveille en temps réel l'état de l'alimentation, des batteries et de l'environnement du site (température, fumée, intrusion), avec alerte à distance.",
    usage:"Intégrée dans l'armoire d'alimentation, raccordée aux capteurs du site (température, fumée, porte) ; transmet les alertes au centre de supervision via le réseau.",
    specs:["Supervision à distance (SNMP/Ethernet)","Alerte température, fumée, intrusion porte","Écran LCD local pour diagnostic sur site"] },
  { id:'odf', cat:'fibre', icon:'fiber', name:'Tiroir de brassage optique (ODF)', sub:'Répartiteur optique',
    desc:"Tiroir installé en baie qui regroupe et organise les raccordements en fibre optique entre les câbles extérieurs et les équipements actifs, avec épissures et connecteurs.",
    usage:"Monté en baie 19/21 pouces dans le shelter, c'est le point de passage entre la fibre extérieure (vers les autres sites) et le câblage interne vers les équipements actifs.",
    specs:["1U à plusieurs U selon la densité de fibres","Connecteurs SC/LC/FC selon l'équipement","Tiroir à épissures pour protéger les soudures fibre"] },
  { id:'fat-fdt', cat:'fibre', icon:'fiber', name:'Boîtier de distribution fibre (FAT/FDT)', sub:'Point de dérivation sur le réseau fibre extérieur',
    desc:"Boîtier installé sur le parcours du câble fibre extérieur (poteau, façade, chambre) pour dériver et distribuer les fibres vers plusieurs destinations sans repasser par le central.",
    usage:"Installé sur poteau, en façade ou en chambre souterraine, au point où le câble fibre principal se divise vers plusieurs directions/clients.",
    specs:["Boîtier étanche (IP65/IP67) pour usage extérieur","Capacité de quelques à plusieurs dizaines de fibres","Utilisé en FTTH et en liaison inter-sites"] },
  { id:'splice-closure', cat:'fibre', icon:'splice', name:"Boîte d'épissure fibre", sub:'Protection des soudures de fibre optique',
    desc:"Boîtier hermétique qui protège les points de soudure (épissures) entre deux tronçons de câble fibre, indispensable à chaque raccordement ou réparation de câble extérieur.",
    usage:"Posé directement sur le câble au point de jonction (souterrain, aérien ou en chambre) ; refermé après l'opération de soudure pour protéger les fibres des intempéries.",
    specs:["Protection étanche des soudures fibre","Usage aérien, souterrain ou en chambre","Capacité variable selon le nombre de fibres à protéger"] },
  { id:'connecteurs-fibre', cat:'fibre', icon:'splice', name:'Connecteurs & jarretières fibre', sub:'Raccordement entre équipements et ODF (SC/LC/FC/ST)',
    desc:"Cordons et connecteurs qui relient physiquement les équipements actifs aux tiroirs ODF — chaque type de connecteur (SC, LC, FC, ST) correspond à un format de port différent.",
    usage:"Utilisés à chaque raccordement entre un équipement (BBU, transmission, switch) et le tiroir ODF, ou pour les tests/mesures avec un appareil de mesure optique.",
    specs:["SC : le plus courant en télécom/FTTH","LC : format compact, dense (data center)","FC/ST : connecteurs vissés, plus anciens mais robustes"] },
  { id:'feeder-jumper', cat:'accessoires', icon:'tool', name:'Câbles feeder / jumper RF', sub:'Liaison radiofréquence antenne ↔ équipement',
    desc:"Câbles coaxiaux qui transportent le signal radiofréquence entre l'antenne/RRU et le reste de la chaîne radio, avec des connecteurs adaptés à chaque extrémité.",
    usage:"Tirés le long du mât/pylône entre l'antenne ou le RRU et l'équipement en pied de mât ; longueur et type choisis selon la distance et la perte acceptable.",
    specs:["Plusieurs diamètres selon la longueur/perte tolérée","Connecteurs N, DIN ou 4.3-10 selon l'équipement","Protection contre l'humidité aux connexions"] },
  { id:'mise-terre', cat:'accessoires', icon:'tool', name:'Kit de mise à la terre & parafoudre', sub:'Protection électrique du site',
    desc:"Ensemble de câbles de terre, barrettes et parafoudres qui protègent les équipements et le personnel contre la foudre et les surtensions, obligatoire sur chaque site.",
    usage:"Installé sur le pylône, les câbles RF/fibre entrants et l'armoire électrique — chaque point d'entrée d'un câble extérieur doit être mis à la terre.",
    specs:["Protection contre la foudre et les surtensions","Barrettes de terre sur mât, câbles et armoires","Conformité obligatoire pour la sécurité du site"] },
  { id:'fixation-montage', cat:'accessoires', icon:'tool', name:'Supports de montage & visserie', sub:'Colliers, brides, rails, boulonnerie',
    desc:"Ensemble du petit matériel de fixation (colliers de câble, brides de mât, rails de baie, boulons, vis) nécessaire à l'installation physique de tous les équipements d'un site.",
    usage:"Utilisé à chaque étape d'installation : fixation des antennes/RRU sur mât, montage des équipements en baie, cheminement et attache des câbles.",
    specs:["Colliers et brides adaptés au diamètre du mât","Rails et vis standard 19/21 pouces pour les baies","Quantités variables selon la taille du site"] },
  { id:'manchons-thermo', cat:'accessoires', icon:'tool', name:'Manchons thermorétractables & rubans', sub:'Étanchéité et isolation des connexions',
    desc:"Manchons qui se rétractent à la chaleur pour étanchéifier les connexions de câbles, et rubans d'isolation/identification utilisés sur la quasi-totalité des raccordements d'un site.",
    usage:"Appliqués sur chaque connexion de câble RF ou électrique exposée aux intempéries, ainsi que pour le repérage couleur des câbles selon leur fonction.",
    specs:["Étanchéité des connexions extérieures","Plusieurs diamètres selon le câble","Rubans de couleur pour l'identification des circuits"] },
];

export default function Inventaire() {
  const [tab, setTab] = useState('stock');
  const [catSearch, setCatSearch] = useState('');
  const [catFilter, setCatFilter] = useState('tous');
  const [catSelected, setCatSelected] = useState(null);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [filterType, setFilterType] = useState('tous');
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ code:'', name:'', type:'BBU', model:'', serialNumber:'', site:'', status:'stock', condition:'neuf', prix:'', garantieExpiry:'' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/inventaire');
      const data = Array.isArray(r.data) ? r.data : [];
      setItems(data);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/inventaire', { ...form, prix: Number(form.prix) });
      setShowForm(false); load();
    } catch {
      setItems(p => [...p, { ...form, id: Date.now(), prix: Number(form.prix) }]);
      setShowForm(false);
    } finally { setSaving(false); }
  };

  const types = [...new Set(items.map(i => i.type).filter(Boolean))];
  const filtered = items.filter(i => {
    const ms = filterStatus === 'tous' || i.status === filterStatus;
    const mt = filterType === 'tous' || i.type === filterType;
    const mq = !search || i.name?.toLowerCase().includes(search.toLowerCase()) || i.code?.toLowerCase().includes(search.toLowerCase()) || i.site?.toLowerCase().includes(search.toLowerCase());
    return ms && mt && mq;
  });

  const fmtN = n => n ? new Intl.NumberFormat('fr-FR').format(n) : '—';
  const valeurTotale = items.reduce((s, i) => s + (Number(i.prix) || 0), 0);

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:12}}><div style={{width:40,height:40,borderRadius:'50%',border:'3px solid #ea580c',borderTopColor:'transparent',animation:'spin 1s linear infinite'}} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><span style={{color:'#64748b'}}>Chargement inventaire...</span></div>;

  return (
    <div style={{padding:24,background:'#f0f2f5',minHeight:'100%'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:'#1e293b',margin:0}}>Inventaire OEM Client</h1>
          <p style={{color:'#64748b',fontSize:13,margin:'4px 0 0'}}>Gestion des équipements réseau · {items.length} équipements · Valeur: {fmtN(valeurTotale)} XAF</p>
        </div>
        <button onClick={()=>setShowForm(true)} style={{padding:'9px 16px',borderRadius:8,border:'none',background:'#ea580c',color:'white',fontSize:13,fontWeight:600,cursor:'pointer'}}>+ Nouvel Équipement</button>
      </div>

      {/* Onglets */}
      <div style={{display:'flex',gap:0,marginBottom:18,borderBottom:'1px solid #e2e8f0'}}>
        <button onClick={()=>setTab('stock')} style={{padding:'9px 16px',border:'none',borderBottom:`2px solid ${tab==='stock'?'#ea580c':'transparent'}`,background:'transparent',color:tab==='stock'?'#ea580c':'#64748b',fontWeight:tab==='stock'?700:500,fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>Stock</button>
        <button onClick={()=>setTab('catalogue')} style={{padding:'9px 16px',border:'none',borderBottom:`2px solid ${tab==='catalogue'?'#ea580c':'transparent'}`,background:'transparent',color:tab==='catalogue'?'#ea580c':'#64748b',fontWeight:tab==='catalogue'?700:500,fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>Catalogue Matériel</button>
      </div>

      {tab==='stock' && <>
      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:10,marginBottom:20}}>
        {[{l:'Total',v:items.length,c:'#0078d4'},{l:'Actifs',v:items.filter(i=>i.status==='actif').length,c:'#16a34a'},{l:'En stock',v:items.filter(i=>i.status==='stock').length,c:'#0078d4'},{l:'Maintenance',v:items.filter(i=>i.status==='maintenance').length,c:'#f59e0b'},{l:'Hors service',v:items.filter(i=>i.status==='hors_service').length,c:'#dc2626'}].map(s=>(
          <div key={s.l} style={{background:'white',borderRadius:10,padding:'14px 16px',border:'1px solid #e2e8f0',textAlign:'center',borderTop:`3px solid ${s.c}`}}>
            <div style={{fontSize:24,fontWeight:800,color:s.c}}>{s.v}</div>
            <div style={{fontSize:11,color:'#64748b',marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{background:'white',borderRadius:10,padding:'12px 16px',border:'1px solid #e2e8f0',marginBottom:16,display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{position:'relative',flex:1,minWidth:200}}>
          <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#94a3b8'}}>🔍</span>
          <input placeholder="Rechercher par code, nom, site..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:'100%',padding:'8px 12px 8px 32px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} />
        </div>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>
          <option value="tous">Tous les statuts</option>
          {Object.entries(STATUS_EQ).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>
          <option value="tous">Tous les types</option>
          {types.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
        <span style={{fontSize:12,color:'#94a3b8',marginLeft:'auto'}}>{filtered.length} équipement(s)</span>
      </div>

      {/* Table */}
      <div style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{background:'#f8fafc',borderBottom:'2px solid #e2e8f0'}}>{['Code','Nom','Type','Modèle','N° Série','Site','Statut','État','Prix','Garantie','Actions'].map(h=><th key={h} style={{padding:'10px 12px',textAlign:'left',fontSize:11,fontWeight:700,color:'#374151',textTransform:'uppercase',letterSpacing:'0.5px',whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(item => {
              const st = STATUS_EQ[item.status] || STATUS_EQ.stock;
              return (
                <tr key={item.id} style={{borderBottom:'1px solid #f8fafc',cursor:'pointer'}} onClick={()=>setSelected(item)}
                  onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background='white'}>
                  <td style={{padding:'10px 12px',fontSize:12,fontWeight:700,color:'#ea580c'}}>{item.code}</td>
                  <td style={{padding:'10px 12px',fontSize:12,fontWeight:600,color:'#1e293b'}}>{item.name}</td>
                  <td style={{padding:'10px 12px'}}><span style={{padding:'2px 8px',borderRadius:8,fontSize:11,background:'#eff6ff',color:'#2563eb',fontWeight:600}}>{item.type}</span></td>
                  <td style={{padding:'10px 12px',fontSize:11,color:'#64748b'}}>{item.model}</td>
                  <td style={{padding:'10px 12px',fontSize:11,color:'#94a3b8',fontFamily:'monospace'}}>{item.serialNumber}</td>
                  <td style={{padding:'10px 12px',fontSize:12,fontWeight:600,color:'#0078d4'}}>{item.site||<span style={{color:'#cbd5e1'}}>—</span>}</td>
                  <td style={{padding:'10px 12px'}}><span style={{padding:'3px 9px',borderRadius:10,fontSize:11,fontWeight:600,background:st.bg,color:st.color}}>{st.label}</span></td>
                  <td style={{padding:'10px 12px',fontSize:12,color: item.condition==='neuf'?'#16a34a':item.condition==='bon'?'#0078d4':'#f59e0b',fontWeight:600}}>{item.condition}</td>
                  <td style={{padding:'10px 12px',fontSize:12,color:'#374151',whiteSpace:'nowrap'}}>{fmtN(item.prix)} XAF</td>
                  <td style={{padding:'10px 12px',fontSize:11,color: item.garantieExpiry&&new Date(item.garantieExpiry)<new Date()?'#dc2626':'#16a34a'}}>{item.garantieExpiry ? new Date(item.garantieExpiry).toLocaleDateString('fr-FR') : '—'}</td>
                  <td style={{padding:'10px 12px'}}><button style={{padding:'4px 10px',borderRadius:6,border:'1px solid #ea580c',background:'white',color:'#ea580c',fontSize:11,cursor:'pointer',fontWeight:600}}>Voir</button></td>
                </tr>
              );
            })}
            {filtered.length===0 && <tr><td colSpan={11} style={{padding:48,textAlign:'center',color:'#94a3b8'}}>Aucun équipement trouvé</td></tr>}
          </tbody>
        </table>
      </div>
      </>}

      {tab==='catalogue' && (
        <div>
          <div style={{background:'white',borderRadius:10,padding:'12px 16px',border:'1px solid #e2e8f0',marginBottom:16,display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
            <div style={{position:'relative',flex:1,minWidth:200}}>
              <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#94a3b8'}}>🔍</span>
              <input placeholder="Rechercher un équipement (BBU, RTN, OLT...)" value={catSearch} onChange={e=>setCatSearch(e.target.value)} style={{width:'100%',padding:'8px 12px 8px 32px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} />
            </div>
            <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{padding:'8px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>
              <option value="tous">Toutes les catégories</option>
              {CATALOG_CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
            {CATALOG_CATEGORIES.map(c=>(
              <span key={c.id} style={{padding:'4px 10px',borderRadius:12,fontSize:11,fontWeight:600,background:c.color+'15',color:c.color,border:`1px solid ${c.color}30`}}>{c.label}</span>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14}}>
            {CATALOG_ITEMS.filter(it=>{
              const mc = catFilter==='tous'||it.cat===catFilter;
              const mq = !catSearch || it.name.toLowerCase().includes(catSearch.toLowerCase()) || it.sub.toLowerCase().includes(catSearch.toLowerCase());
              return mc&&mq;
            }).map(it=>{
              const cat = CATALOG_CATEGORIES.find(c=>c.id===it.cat);
              return (
                <div key={it.id} onClick={()=>setCatSelected(it)} style={{background:'white',borderRadius:10,border:'1px solid #e2e8f0',padding:16,cursor:'pointer',transition:'all .15s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=cat.color;e.currentTarget.style.boxShadow='0 4px 14px rgba(0,0,0,0.07)';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='#e2e8f0';e.currentTarget.style.boxShadow='none';}}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:8}}>
                    {it.img && (
                      <img src={it.img} alt={it.name} style={{width:38,height:38,borderRadius:8,objectFit:'cover',flexShrink:0}}
                        onError={e=>{e.target.style.display='none'; e.target.nextSibling.style.display='flex';}} />
                    )}
                    <div style={{width:38,height:38,borderRadius:8,background:cat.color+'14',display:it.img?'none':'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <CatIc d={CAT_ICONS[it.icon]} size={19} color={cat.color}/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:700,color:'#1e293b'}}>{it.name}</div>
                      <div style={{fontSize:11,color:'#64748b',marginTop:1}}>{it.sub}</div>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:'#374151',lineHeight:1.5,marginBottom:8}}>{it.desc.slice(0,110)}{it.desc.length>110?'…':''}</div>
                  <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:8,background:cat.color+'12',color:cat.color}}>{cat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Détail */}
      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'white',borderRadius:14,width:'100%',maxWidth:500,overflow:'hidden',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
            <div style={{padding:'16px 20px',background:'linear-gradient(135deg,#7c2d12,#ea580c)',color:'white',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><div style={{fontSize:16,fontWeight:800}}>{selected.code}</div><div style={{fontSize:12,opacity:0.8}}>{selected.name}</div></div>
              <button onClick={()=>setSelected(null)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:28,height:28,borderRadius:'50%',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
            <div style={{padding:24}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {[{l:'Type',v:selected.type},{l:'Modèle',v:selected.model},{l:'N° Série',v:selected.serialNumber},{l:'Site assigné',v:selected.site||'En stock'},{l:'Statut',v:STATUS_EQ[selected.status]?.label||selected.status},{l:'État',v:selected.condition},{l:'Prix',v:`${fmtN(selected.prix)} XAF`},{l:'Garantie jusqu\'au',v:selected.garantieExpiry?new Date(selected.garantieExpiry).toLocaleDateString('fr-FR'):'—'},{l:'Date installation',v:selected.dateInstallation?new Date(selected.dateInstallation).toLocaleDateString('fr-FR'):'—'}].map(i=>(
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

      {/* Modal Détail Catalogue */}
      {catSelected && (() => { const cat = CATALOG_CATEGORIES.find(c=>c.id===catSelected.cat); return (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'white',borderRadius:14,width:'100%',maxWidth:480,overflow:'hidden',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
            <div style={{padding:'18px 20px',background:cat.color,color:'white',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                {catSelected.img && (
                  <img src={catSelected.img} alt={catSelected.name} style={{width:38,height:38,borderRadius:8,objectFit:'cover',flexShrink:0}}
                    onError={e=>{e.target.style.display='none'; e.target.nextSibling.style.display='flex';}} />
                )}
                <div style={{width:38,height:38,borderRadius:8,background:'rgba(255,255,255,0.18)',display:catSelected.img?'none':'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><CatIc d={CAT_ICONS[catSelected.icon]} size={19} color="white"/></div>
                <div><div style={{fontSize:16,fontWeight:800}}>{catSelected.name}</div><div style={{fontSize:12,opacity:0.85}}>{catSelected.sub}</div></div>
              </div>
              <button onClick={()=>setCatSelected(null)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:28,height:28,borderRadius:'50%',cursor:'pointer',fontSize:16,flexShrink:0}}>✕</button>
            </div>
            <div style={{padding:22}}>
              <p style={{fontSize:13,color:'#374151',lineHeight:1.7,margin:'0 0 14px'}}>{catSelected.desc}</p>
              {catSelected.usage && <>
                <div style={{fontSize:11,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:6}}>Usage sur site</div>
                <p style={{fontSize:13,color:'#374151',lineHeight:1.7,margin:'0 0 14px'}}>{catSelected.usage}</p>
              </>}
              <div style={{fontSize:11,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:8}}>Points clés</div>
              <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:18}}>
                {catSelected.specs.map((s,i)=>(
                  <div key={i} style={{display:'flex',gap:8,fontSize:12,color:'#1e293b'}}><span style={{color:cat.color,fontWeight:700}}>•</span>{s}</div>
                ))}
              </div>
              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>setCatSelected(null)} style={{flex:1,padding:11,borderRadius:8,border:'1px solid #e2e8f0',background:'white',cursor:'pointer',fontSize:13,fontWeight:600,color:'#374151'}}>Fermer</button>
                <button onClick={()=>{ setForm(p=>({...p,name:catSelected.name,model:catSelected.name,type:catSelected.icon==='dish'?'Antenne':catSelected.icon==='fiber'||catSelected.icon==='splice'?'Autre':catSelected.icon==='bbu'?'BBU':catSelected.icon==='antenna'?'Antenne':catSelected.icon==='battery'||catSelected.icon==='bolt'?'Autre':'Routeur'})); setCatSelected(null); setTab('stock'); setShowForm(true); }}
                  style={{flex:2,padding:11,borderRadius:8,border:'none',background:cat.color,color:'white',cursor:'pointer',fontSize:13,fontWeight:700}}>+ Ajouter au stock</button>
              </div>
            </div>
          </div>
        </div>
      ); })()}

      {/* Modal Form */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'white',borderRadius:14,width:'100%',maxWidth:520,maxHeight:'85vh',overflow:'auto',boxShadow:'0 24px 64px rgba(0,0,0,0.25)'}}>
            <div style={{padding:'16px 20px',background:'linear-gradient(135deg,#7c2d12,#ea580c)',color:'white',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0}}>
              <div style={{fontSize:16,fontWeight:800}}>+ Nouvel Équipement OEM</div>
              <button onClick={()=>setShowForm(false)} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:28,height:28,borderRadius:'50%',cursor:'pointer',fontSize:16}}>✕</button>
            </div>
            <div style={{padding:24,display:'flex',flexDirection:'column',gap:12}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                {[{l:'CODE *',k:'code',ph:'BBU-5900-004'},{l:'NOM *',k:'name',ph:'BBU 5900 5G NR'},{l:'MODÈLE',k:'model',ph:'Client BBU5900'},{l:'N° SÉRIE',k:'serialNumber',ph:'SN20240009'},{l:'SITE',k:'site',ph:'DLA-001 (vide si stock)'},{l:'PRIX (XAF)',k:'prix',ph:'8500000'},{l:'DATE INSTALLATION',k:'dateInstallation',ph:'',type:'date'},{l:'GARANTIE JUSQU\'AU',k:'garantieExpiry',ph:'',type:'date'}].map(f=>(
                  <div key={f.k}><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>{f.l}</label><input type={f.type||'text'} value={form[f.k]||''} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph||''} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} /></div>
                ))}
                <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>TYPE</label><select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>{['BBU','RRU','AAU','Switch','Routeur','Antenne','Autre'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>STATUT</label><select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>{Object.entries(STATUS_EQ).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>
                <div><label style={{fontSize:12,fontWeight:700,color:'#64748b',display:'block',marginBottom:5}}>ÉTAT</label><select value={form.condition} onChange={e=>setForm(p=>({...p,condition:e.target.value}))} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,background:'white'}}>{['neuf','bon','moyen','mauvais'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
              </div>
              <div style={{display:'flex',gap:10,marginTop:8}}>
                <button onClick={()=>setShowForm(false)} style={{flex:1,padding:11,borderRadius:8,border:'1px solid #e2e8f0',background:'white',cursor:'pointer',fontSize:13,color:'#374151'}}>Annuler</button>
                <button onClick={save} disabled={!form.code||!form.name||saving} style={{flex:2,padding:11,borderRadius:8,border:'none',background:(form.code&&form.name)?'#ea580c':'#e2e8f0',color:(form.code&&form.name)?'white':'#94a3b8',cursor:(form.code&&form.name)?'pointer':'not-allowed',fontSize:13,fontWeight:700}}>{saving?'Création...':'✓ Ajouter l\'équipement'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
