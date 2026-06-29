// Registre des modules de l'application — utilisé par Layout.jsx (sidebar) ET
// la page Paramètres > Utilisateurs (grille de permissions).
// Garder cette liste synchronisée avec la structure des sections dans Layout.jsx.
export const MODULES = [
  { section:'Opérations', items:[
    { path:'/dashboard', label:'Dashboard', roles:['admin','project_manager','hr'] },
    { path:'/sites', label:'Sites', roles:['admin','project_manager'] },
    { path:'/technicians', label:'Techniciens', roles:['admin','project_manager','hr'] },
    { path:'/planning', label:'Planning', roles:['admin','project_manager'] },
    { path:'/terrain', label:'Gestion Terrain', roles:['admin','project_manager'] },
  ]},
  { section:'Client OEM', items:[
    { path:'/inventaire', label:'Inventaire OEM', roles:['admin','project_manager'] },
    { path:'/catalogue-oem', label:'Catalogue Huawei', roles:['admin','project_manager'] },
    { path:'/purchase-orders', label:'Bons de Commande', roles:['admin','project_manager'] },
  ]},
  { section:'Entreprise', items:[
    { path:'/cleanitbooks', label:'CleanITBooks', roles:['admin'] },
    { path:'/approvals', label:'Approvals', roles:['admin','project_manager','hr'] },
    { path:'/contrats', label:'Contrats SLA', roles:['admin','project_manager'] },
    { path:'/projets', label:'Projets', roles:['admin','project_manager'] },
    { path:'/finance', label:'Finance', roles:['admin'] },
    { path:'/pointage', label:'Pointage & Présence', roles:['admin','hr'] },
    { path:'/rh', label:'Ressources Humaines', roles:['admin','hr'] },
    { path:'/crm', label:'CRM Clients', roles:['admin','project_manager'] },
  ]},
  { section:'Communication', items:[
    { path:'/cleanitcomm', label:'CleanIT Comm', roles:['admin','project_manager','hr'] },
  ]},
  { section:'Intelligence', items:[
    { path:'/bi', label:'Business Intelligence', roles:['admin','project_manager'] },
    { path:'/mobile', label:'Application Mobile', roles:['admin','project_manager','hr'] },
    { path:'/map', label:'Carte Digital Twin', roles:['admin','project_manager'] },
    { path:'/ocr', label:'OCR Scanner', roles:['admin'] },
  ]},
];

export const ALL_MODULE_PATHS = MODULES.flatMap(s => s.items.map(i => i.path));

export const ROLE_LABELS = {
  admin: 'Administrateur',
  project_manager: 'Chef de Projet',
  hr: 'Ressources Humaines',
  technician: 'Technicien',
  bureau: 'Bureau',
};
