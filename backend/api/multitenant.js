// CleanIT ERP — Multi-tenant SaaS module
// Routes: /saas/register, /saas/company, /saas/plans, /saas/payment, /saas/trial-status
const bcrypt = require('bcryptjs'); // bcryptjs — pas bcrypt
const jwt = require('jsonwebtoken');

const PLANS = {
  starter:    { name:'Starter',    max_users:5,   price_usd:39  },
  business:   { name:'Business',   max_users:20,  price_usd:89  },
  enterprise: { name:'Enterprise', max_users:999, price_usd:149 },
};

// Initialise les tables et enregistre les routes AVANT le middleware 404
// Doit être appelé synchronement pour que les routes soient enregistrées
function initRoutes(pool, app, auth) {
  // POST /saas/register — Inscription nouvelle entreprise
  app.post('/saas/register', async (req, res) => {
    try {
      const { companyName, email, password, firstName, lastName, plan } = req.body;
      if (!companyName || !email || !password || !firstName)
        return res.status(400).json({ message: 'Champs requis manquants' });
      const exists = await pool.query('SELECT id FROM companies WHERE email=$1', [email]);
      if (exists.rows[0]) return res.status(409).json({ message: 'Email déjà utilisé' });
      const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g,'-').replace(/-+/g,'-').slice(0,30)+'-'+Date.now().toString(36);
      const company = await pool.query(
        `INSERT INTO companies(name,slug,email,plan,plan_status,trial_ends_at) VALUES($1,$2,$3,$4,'trial',NOW()+INTERVAL '14 days') RETURNING *`,
        [companyName, slug, email, plan||'starter']
      );
      const cid = company.rows[0].id;
      const hash = await bcrypt.hash(password, 12);
      const user = await pool.query(
        `INSERT INTO users(email,password,"firstName","lastName",role,"isActive",company_id,"createdAt") VALUES($1,$2,$3,$4,'admin',true,$5,NOW()) RETURNING id,email,"firstName","lastName",role`,
        [email, hash, firstName, lastName||'', cid]
      );
      const token = jwt.sign({ sub:user.rows[0].id, email, role:'admin', company_id:cid }, process.env.JWT_SECRET, { expiresIn:'7d' });
      res.status(201).json({ message:'Compte créé — 14 jours d\'essai gratuit activé', token, company:company.rows[0], user:user.rows[0] });
    } catch(e) { res.status(500).json({ message:'Erreur: '+e.message }); }
  });

  // GET /saas/plans
  app.get('/saas/plans', async (req, res) => {
    res.json(Object.entries(PLANS).map(([id,p])=>({id,...p})));
  });

  // GET /saas/company
  app.get('/saas/company', auth, async (req, res) => {
    try {
      const c = await pool.query('SELECT * FROM companies WHERE id=$1', [req.user.company_id]);
      if (!c.rows[0]) return res.status(404).json({ message:'Entreprise non trouvée' });
      res.json(c.rows[0]);
    } catch(e) { res.status(500).json({ message:e.message }); }
  });

  // GET /saas/trial-status
  app.get('/saas/trial-status', auth, async (req, res) => {
    try {
      const c = await pool.query('SELECT plan,plan_status,trial_ends_at FROM companies WHERE id=$1',[req.user.company_id]);
      if (!c.rows[0]) return res.status(404).json({message:'Non trouvé'});
      const daysLeft = Math.max(0, Math.ceil((new Date(c.rows[0].trial_ends_at)-new Date())/(1000*60*60*24)));
      res.json({ ...c.rows[0], trial_days_left:daysLeft, is_active: c.rows[0].plan_status==='active'||(c.rows[0].plan_status==='trial'&&daysLeft>0) });
    } catch(e) { res.status(500).json({message:e.message}); }
  });
}

// Initialise les tables DB (async — ne bloque pas le démarrage)
async function initDB(pool) {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS companies(
      id SERIAL PRIMARY KEY, name VARCHAR(200) NOT NULL, slug VARCHAR(100) UNIQUE NOT NULL,
      email VARCHAR(200) UNIQUE NOT NULL, plan VARCHAR(20) DEFAULT 'starter',
      plan_status VARCHAR(20) DEFAULT 'trial', trial_ends_at TIMESTAMP DEFAULT NOW()+INTERVAL '14 days',
      is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW()
    )`);
    // Ajouter company_id aux tables principales si absent
    for(const t of ['users','sites','bons_commande','planning_events','missions','approvals','employees']) {
      await pool.query(`DO $$ BEGIN IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='${t}') THEN
        IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='${t}' AND column_name='company_id') THEN
          ALTER TABLE ${t} ADD COLUMN company_id INTEGER; END IF; END IF; END $$`).catch(()=>{});
    }
    console.log('Multi-tenant DB init OK');
  } catch(e) { console.error('Multi-tenant DB error:', e.message); }
}

module.exports = { initRoutes, initDB, PLANS };
