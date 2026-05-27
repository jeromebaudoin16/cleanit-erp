# Plan de Reprise d'Activité (PRA/DRP) — CleanIT ERP

## Architecture Actuelle
| Composant | Service | URL | Uptime |
|-----------|---------|-----|--------|
| Frontend | Vercel CDN | cleanit-erp-frontend.vercel.app | 99.99% |
| Backend API | Vercel Serverless | backend-cleanit-erp.vercel.app | 99.99% |
| Base de données | Neon PostgreSQL | eu-west-2.aws.neon.tech | 99.95% |
| Code source | GitHub | github.com/jeromebaudoin16/cleanit-erp | 100% |

## Scénarios de Panne et Procédures

### Scénario 1 — Frontend inaccessible
- **Délai de reprise (RTO)** : < 5 minutes
- **Procédure** :
  1. Vérifier https://vercel.com/status
  2. Si Vercel down → activer mirror de secours
  3. `cd frontend && vercel --prod` pour forcer redéploiement

### Scénario 2 — Backend API inaccessible
- **RTO** : < 5 minutes
- **Procédure** :
  1. Tester : `curl https://backend-cleanit-erp.vercel.app/health`
  2. Si 503 → `cd backend && vercel --prod`
  3. Vérifier variables d'environnement Vercel

### Scénario 3 — Base de données corrompue
- **RTO** : < 30 minutes
- **RPO** (données perdues max) : 24 heures
- **Procédure** :
  1. Aller sur console.neon.tech
  2. Sélectionner un point de restauration (backups auto 7 jours)
  3. Restaurer vers nouvelle branche
  4. Mettre à jour DATABASE_URL dans Vercel

### Scénario 4 — Compte admin compromis
- **RTO** : < 15 minutes
- **Procédure** :
  1. Changer mot de passe : POST /auth/change-password
  2. Invalider tous les tokens (changer JWT_SECRET dans Vercel)
  3. `vercel env rm JWT_SECRET && vercel env add JWT_SECRET`
  4. Redeployer backend

### Scénario 5 — Perte totale de Vercel
- **RTO** : < 2 heures
- **Procédure** :
  1. Cloner repo GitHub sur nouveau serveur
  2. `npm install && npm run build`
  3. Déployer sur Koyeb/Railway alternative
  4. Mettre à jour DNS

## Contacts d'Urgence
- Admin système : jerome@cleanit.cm
- Vercel support : vercel.com/support
- Neon support : neon.tech/support
- GitHub : github.com/jeromebaudoin16/cleanit-erp

## Tests DRP
- Tester procédure mensuelle
- Simuler panne DB trimestriellement
- Backup DB hebdomadaire

## Métriques Cibles
| Métrique | Cible |
|----------|-------|
| RTO (reprise) | < 30 min |
| RPO (données perdues) | < 24h |
| Disponibilité annuelle | 99.9% |
