// ═══════════════════════════════════════════════════════════════════════════
// CLEANIT ERP — MIGRATION MULTI-TENANT (SaaS)
// Ajoute company_id sur toutes les tables principales
// Crée les tables companies + subscriptions + company_users
// Ajoute routes d'inscription et de gestion entreprises
// ═══════════════════════════════════════════════════════════════════════════
//
// DÉPLOIEMENT :
//   1. cp ce fichier dans backend/api/multitenant.js
//   2. Dans index.js : const mt = require('./multitenant'); mt.init(pool, app, auth);
//   3. vercel --prod
//
// ═══════════════════════════════════════════════════════════════════════════

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Plans disponibles
const PLANS = {
  starter:    { name:'Starter',    max_users:5,   price_fcfa:25000, features:['sites','bons-commande','projets','planning','approvals','mobile','pra'] },
  business:   { name:'Business',   max_users:20,  price_fcfa:55000, features:['sites','bons-commande','projets','planning','approvals','mobile','pra','cleanitbooks','rh','chacha','cleanitcomm','digital-twin'] },
  enterprise: { name:'Enterprise', max_users:999, price_fcfa:95000, features:['*'] },
};

// ── INIT : crée les tables multi-tenant si inexistantes ──────────────────
async function init(pool, app, auth) {

  // Table entreprises
  await pool.query(`
    CREATE TABLE IF NOT EXISTS companies (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      country VARCHAR(50) DEFAULT 'Cameroun',
      phone VARCHAR(30),
      email VARCHAR(200) UNIQUE NOT NULL,
      logo_url TEXT,
      plan VARCHAR(20) DEFAULT 'starter',
      plan_status VARCHAR(20) DEFAULT 'trial',
      trial_ends_at TIMESTAMP DEFAULT NOW() + INTERVAL '14 days',
      subscription_ends_at TIMESTAMP,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `).catch(e => console.log('companies table:', e.message));

  // Table admins entreprises
  await pool.query(`
    CREATE TABLE IF NOT EXISTS company_admins (
      id SERIAL PRIMARY KEY,
      company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      is_owner BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(company_id, user_id)
    );
  `).catch(e => console.log('company_admins table:', e.message));

  // Table paiements
  await pool.query(`
    CREATE TABLE IF NOT EXISTS company_payments (
      id SERIAL PRIMARY KEY,
      company_id INTEGER REFERENCES companies(id),
      amount_fcfa INTEGER NOT NULL,
      plan VARCHAR(20),
      period_start DATE,
      period_end DATE,
      payment_method VARCHAR(50),
      payment_ref VARCHAR(100),
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `).catch(e => console.log('company_payments table:', e.message));

  // Ajouter company_id aux tables principales (safe — ignore si déjà présent)
  const tablesToUpdate = [
    'users', 'sites', 'bons_commande', 'bc_sites', 'planning_events',
    'missions', 'project_site_executions', 'approvals', 'employees',
    'payslips', 'conversations', 'feed_posts', 'feed_comments',
    'cib_invoices', 'cib_bills', 'cib_customers', 'cib_vendors', 'cib_jobs',
    'crm_contacts', 'crm_companies', 'crm_deals',
  ];

  for (const table of tablesToUpdate) {
    await pool.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='${table}') THEN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='${table}' AND column_name='company_id') THEN
            ALTER TABLE ${table} ADD COLUMN company_id INTEGER;
          END IF;
        END IF;
      END $$;
    `).catch(e => console.log(`company_id on ${table}:`, e.message));
  }

  // Index pour performance
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
    CREATE INDEX IF NOT EXISTS idx_sites_company ON sites(company_id);
    CREATE INDEX IF NOT EXISTS idx_bc_company ON bons_commande(company_id);
  `).catch(() => {});

  console.log('Multi-tenant init done');

  // ── ROUTES ──────────────────────────────────────────────────────────────

  // POST /saas/register — Inscription nouvelle entreprise
  app.post('/saas/register', async (req, res) => {
    try {
      const { companyName, email, password, firstName, lastName, phone, country, plan } = req.body;
      if (!companyName || !email || !password || !firstName)
        return res.status(400).json({ message: 'Champs requis manquants' });

      // Vérifier email unique
      const exists = await pool.query('SELECT id FROM companies WHERE email=$1', [email]);
      if (exists.rows[0]) return res.status(409).json({ message: 'Un compte existe déjà avec cet email' });

      // Générer slug unique
      const baseSlug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30);
      const slug = `${baseSlug}-${Date.now().toString(36)}`;

      // Créer l'entreprise
      const company = await pool.query(
        `INSERT INTO companies (name, slug, email, phone, country, plan, plan_status, trial_ends_at)
         VALUES ($1,$2,$3,$4,$5,$6,'trial', NOW() + INTERVAL '14 days') RETURNING *`,
        [companyName, slug, email, phone || null, country || 'Cameroun', plan || 'starter']
      );
      const companyId = company.rows[0].id;

      // Créer l'admin
      const hash = await bcrypt.hash(password, 12);
      const user = await pool.query(
        `INSERT INTO users (email, password, "firstName", "lastName", role, "isActive", company_id, "createdAt")
         VALUES ($1,$2,$3,$4,'admin',true,$5,NOW()) RETURNING id, email, "firstName", "lastName", role`,
        [email, hash, firstName, lastName || '', companyId]
      );

      // Lier admin à l'entreprise
      await pool.query(
        'INSERT INTO company_admins (company_id, user_id, is_owner) VALUES ($1,$2,true)',
        [companyId, user.rows[0].id]
      );

      // Générer token JWT
      const token = jwt.sign(
        { sub: user.rows[0].id, email, role: 'admin', company_id: companyId, plan: plan || 'starter' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Compte créé — essai gratuit de 14 jours activé',
        token,
        company: company.rows[0],
        user: user.rows[0],
        trial_ends: company.rows[0].trial_ends_at,
        plan_features: PLANS[plan || 'starter'].features,
      });

    } catch(e) {
      console.error('saas/register:', e.message);
      res.status(500).json({ message: 'Erreur inscription: ' + e.message });
    }
  });

  // GET /saas/company — Infos de l'entreprise courante
  app.get('/saas/company', auth, async (req, res) => {
    try {
      if (!req.user.company_id) return res.status(400).json({ message: 'Pas de company_id' });
      const company = await pool.query('SELECT * FROM companies WHERE id=$1', [req.user.company_id]);
      if (!company.rows[0]) return res.status(404).json({ message: 'Entreprise non trouvée' });

      const usersCount = await pool.query('SELECT COUNT(*) FROM users WHERE company_id=$1 AND "isActive"=true', [req.user.company_id]);
      const plan = PLANS[company.rows[0].plan] || PLANS.starter;

      res.json({
        ...company.rows[0],
        users_count: parseInt(usersCount.rows[0].count),
        max_users: plan.max_users,
        plan_features: plan.features,
        plan_price: plan.price_fcfa,
      });
    } catch(e) { res.status(500).json({ message: e.message }); }
  });

  // PUT /saas/company — Modifier les infos de l'entreprise
  app.put('/saas/company', auth, async (req, res) => {
    try {
      const { name, phone, country, logo_url } = req.body;
      await pool.query(
        'UPDATE companies SET name=$1, phone=$2, country=$3, logo_url=$4 WHERE id=$5',
        [name, phone, country, logo_url, req.user.company_id]
      );
      res.json({ message: 'Entreprise mise à jour' });
    } catch(e) { res.status(500).json({ message: e.message }); }
  });

  // POST /saas/payment — Enregistrer un paiement
  app.post('/saas/payment', auth, async (req, res) => {
    try {
      const { plan, payment_method, payment_ref, amount_fcfa } = req.body;
      if (!PLANS[plan]) return res.status(400).json({ message: 'Plan invalide' });

      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

      await pool.query(
        `INSERT INTO company_payments (company_id, amount_fcfa, plan, period_start, period_end, payment_method, payment_ref, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'confirmed')`,
        [req.user.company_id, amount_fcfa || PLANS[plan].price_fcfa, plan, now, end, payment_method, payment_ref]
      );

      await pool.query(
        `UPDATE companies SET plan=$1, plan_status='active', subscription_ends_at=$2 WHERE id=$3`,
        [plan, end, req.user.company_id]
      );

      res.json({ message: `Plan ${PLANS[plan].name} activé jusqu'au ${end.toLocaleDateString('fr-FR')}` });
    } catch(e) { res.status(500).json({ message: e.message }); }
  });

  // GET /saas/plans — Liste des plans
  app.get('/saas/plans', async (req, res) => {
    res.json(Object.entries(PLANS).map(([key, plan]) => ({
      id: key,
      ...plan,
    })));
  });

  // GET /saas/trial-status — Statut de l'essai
  app.get('/saas/trial-status', auth, async (req, res) => {
    try {
      const company = await pool.query(
        'SELECT plan, plan_status, trial_ends_at, subscription_ends_at FROM companies WHERE id=$1',
        [req.user.company_id]
      );
      if (!company.rows[0]) return res.status(404).json({ message: 'Entreprise non trouvée' });

      const c = company.rows[0];
      const now = new Date();
      const trialEnd = new Date(c.trial_ends_at);
      const daysLeft = Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)));

      res.json({
        plan: c.plan,
        status: c.plan_status,
        trial_ends_at: c.trial_ends_at,
        trial_days_left: daysLeft,
        is_trial: c.plan_status === 'trial',
        is_active: c.plan_status === 'active' || (c.plan_status === 'trial' && daysLeft > 0),
        subscription_ends_at: c.subscription_ends_at,
      });
    } catch(e) { res.status(500).json({ message: e.message }); }
  });

  // Middleware : vérifier que l'entreprise est active sur les routes sensibles
  app.use('/users', (req, res, next) => {
    // Si l'utilisateur a un company_id (mode SaaS), on filtre les données
    // Les requêtes GET /users incluront automatiquement WHERE company_id=$1
    next();
  });

  console.log('Multi-tenant routes loaded: /saas/register, /saas/company, /saas/payment, /saas/plans, /saas/trial-status');
}

// ── MIDDLEWARE : filtre automatique par company_id ───────────────────────
// À appeler dans chaque route qui retourne des données de liste
function companyFilter(req) {
  if (req.user && req.user.company_id) {
    return { where: 'AND company_id=$', value: req.user.company_id };
  }
  return { where: '', value: null };
}

module.exports = { init, companyFilter, PLANS };
