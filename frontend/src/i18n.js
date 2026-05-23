// ===== CLEANIT i18n — Traductions FR/EN =====
export const translations = {
  fr: {
    // Navigation
    'Dashboard': 'Tableau de bord',
    'Sites': 'Sites',
    'Techniciens': 'Techniciens',
    'Planning': 'Planning',
    'Gestion Terrain': 'Gestion Terrain',
    'Inventaire OEM': 'Inventaire OEM',
    'Bons de Commande': 'Bons de Commande',
    'CleanITBooks': 'CleanITBooks',
    'Approvals': 'Approbations',
    'Projets': 'Projets',
    'Finance': 'Finance',
    'Pointage & Présence': 'Pointage & Présence',
    'Ressources Humaines': 'Ressources Humaines',
    'CRM Clients': 'CRM Clients',
    'CleanIT Comm': 'CleanIT Comm',
    'Business Intelligence': 'Business Intelligence',
    'Carte Digital Twin': 'Carte Digital Twin',
    'Contrats SLA': 'Contrats SLA',
    // Actions
    'Sauvegarder': 'Sauvegarder',
    'Annuler': 'Annuler',
    'Supprimer': 'Supprimer',
    'Modifier': 'Modifier',
    'Ajouter': 'Ajouter',
    'Exporter': 'Exporter',
    'Importer': 'Importer',
    'Valider': 'Valider',
    'Refuser': 'Refuser',
    // Profile
    'Mon profil': 'Mon profil',
    'Paramètres': 'Paramètres',
    'Se déconnecter': 'Se déconnecter',
    'Changer la photo': 'Changer la photo',
    'Notifications': 'Notifications',
    'Sécurité': 'Sécurité',
    'Apparence': 'Apparence',
    'Intégrations': 'Intégrations',
    'Langue de l\'interface': 'Langue de l\'interface',
    'Thème': 'Thème',
    'Clair': 'Clair',
    'Sombre': 'Sombre',
    'Auto': 'Auto',
    // Statuts
    'En cours': 'En cours',
    'Terminé': 'Terminé',
    'En attente': 'En attente',
    'Approuvé': 'Approuvé',
    'Rejeté': 'Rejeté',
  },
  en: {
    // Navigation
    'Dashboard': 'Dashboard',
    'Sites': 'Sites',
    'Techniciens': 'Technicians',
    'Planning': 'Planning',
    'Gestion Terrain': 'Field Management',
    'Inventaire OEM': 'OEM Inventory',
    'Bons de Commande': 'Purchase Orders',
    'CleanITBooks': 'CleanITBooks',
    'Approvals': 'Approvals',
    'Projets': 'Projects',
    'Finance': 'Finance',
    'Pointage & Présence': 'Attendance',
    'Ressources Humaines': 'Human Resources',
    'CRM Clients': 'CRM Clients',
    'CleanIT Comm': 'CleanIT Comm',
    'Business Intelligence': 'Business Intelligence',
    'Carte Digital Twin': 'Digital Twin Map',
    'Contrats SLA': 'SLA Contracts',
    // Actions
    'Sauvegarder': 'Save',
    'Annuler': 'Cancel',
    'Supprimer': 'Delete',
    'Modifier': 'Edit',
    'Ajouter': 'Add',
    'Exporter': 'Export',
    'Importer': 'Import',
    'Valider': 'Validate',
    'Refuser': 'Reject',
    // Profile
    'Mon profil': 'My profile',
    'Paramètres': 'Settings',
    'Se déconnecter': 'Sign out',
    'Changer la photo': 'Change photo',
    'Notifications': 'Notifications',
    'Sécurité': 'Security',
    'Apparence': 'Appearance',
    'Intégrations': 'Integrations',
    'Langue de l\'interface': 'Interface language',
    'Thème': 'Theme',
    'Clair': 'Light',
    'Sombre': 'Dark',
    'Auto': 'Auto',
    // Statuts
    'En cours': 'In progress',
    'Terminé': 'Completed',
    'En attente': 'Pending',
    'Approuvé': 'Approved',
    'Rejeté': 'Rejected',
  }
};

// Hook simple
export function getLang() {
  return localStorage.getItem('cleanit_lang') || 'fr';
}

export function t(key) {
  const lang = getLang();
  return translations[lang]?.[key] || key;
}

// Appliquer la langue sur le Layout navigation
export function applyLangToNav(navItems) {
  const lang = getLang();
  if(lang === 'fr') return navItems;
  return navItems.map(item => ({
    ...item,
    label: translations[lang]?.[item.label] || item.label,
    items: item.items?.map(sub => ({
      ...sub,
      label: translations[lang]?.[sub.label] || sub.label
    }))
  }));
}
