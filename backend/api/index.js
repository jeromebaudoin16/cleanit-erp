const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// ─── SÉCURITÉ ────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// ─── RATE LIMITING ───────────────────────────────────────────
const rateLimitMap = new Map();
const rateLimit = (max, windowMs) => (req, res, next) => {
  const key = req.ip + req.path;
  const now = Date.now();
  const record = rateLimitMap.get(key) || { count: 0, start: now };
  if (now - record.start > windowMs) { record.count = 0; record.start = now; }
  record.count++;
  rateLimitMap.set(key, record);
  if (record.count > max) return res.status(429).json({ message: 'Trop de tentatives. Attendez.' });
  next();
};

// ─── BASE DE DONNÉES ─────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 8000,
});

const JWT_SECRET = process.env.JWT_SECRET || 'cleanit_secret';
const sanitize = (str) => str ? String(str).replace(/[<>'"`;]/g, '').trim() : '';

// ─── MIDDLEWARE AUTH ──────────────────────────────────────────
const auth = (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Token requis' });
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { res.status(401).json({ message: 'Token invalide ou expiré' }); }
};

const isAdmin = (req, res, next) => {
  if (!['admin', 'dg'].includes(req.user?.role)) return res.status(403).json({ message: 'Accès refusé' });
  next();
};

// ─── AUTH ROUTES ─────────────────────────────────────────────
app.post('/auth/login', rateLimit(5, 60000), async (req, res) => {
  try {
    const email = sanitize(req.body.email || '');
    const password = req.body.password || '';
    if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis' });
    if (password.length > 100) return res.status(400).json({ message: 'Mot de passe invalide' });
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND "isActive" = true', [email.toLowerCase()]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    await pool.query('UPDATE users SET "lastSeen" = NOW() WHERE id = $1', [user.id]);
    res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
  } catch (e) { res.status(500).json({ message: 'Erreur serveur' }); }
});

app.post('/auth/register', rateLimit(3, 60000), async (req, res) => {
  try {
    const email = sanitize(req.body.email || '').toLowerCase();
    const firstName = sanitize(req.body.firstName || '');
    const lastName = sanitize(req.body.lastName || '');
    const role = ['terrain', 'bureau', 'pm'].includes(req.body.role) ? req.body.role : 'bureau';
    const password = req.body.password || '';
    if (!email || !password || !firstName) return res.status(400).json({ message: 'Champs requis manquants' });
    if (password.length < 8) return res.status(400).json({ message: 'Mot de passe trop court (min 8 caractères)' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Email invalide' });
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows[0]) return res.status(409).json({ message: 'Email déjà utilisé' });
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (email, password, "firstName", "lastName", role, "isActive", "createdAt") VALUES ($1,$2,$3,$4,$5,false,NOW()) RETURNING id, email, "firstName", "lastName", role, "isActive"',
      [email, hash, firstName, lastName, role]
    );
    const user = result.rows[0];
    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user, message: 'Compte créé. En attente de validation admin.' });
  } catch (e) { res.status(500).json({ message: 'Erreur serveur' }); }
});

app.get('/auth/me', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, "firstName", "lastName", role, "isActive", "lastSeen" FROM users WHERE id = $1', [req.user.sub]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ message: 'Erreur serveur' }); }
});

// ─── USERS ROUTES ─────────────────────────────────────────────
app.get('/users', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, "firstName", "lastName", role, "isActive", "lastSeen", "createdAt" FROM users ORDER BY "createdAt" DESC');
    res.json(result.rows);
  } catch (e) { res.status(500).json({ message: 'Erreur serveur' }); }
});

app.post('/users', auth, isAdmin, async (req, res) => {
  try {
    const email = sanitize(req.body.email || '').toLowerCase();
    const firstName = sanitize(req.body.firstName || '');
    const lastName = sanitize(req.body.lastName || '');
    const role = req.body.role || 'bureau';
    const password = req.body.password || 'CleanIT2024!';
    if (!email || !firstName) return res.status(400).json({ message: 'Email et prénom requis' });
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows[0]) return res.status(409).json({ message: 'Email déjà utilisé' });
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (email, password, "firstName", "lastName", role, "isActive", "createdAt") VALUES ($1,$2,$3,$4,$5,true,NOW()) RETURNING id, email, "firstName", "lastName", role, "isActive"',
      [email, hash, firstName, lastName, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) { res.status(500).json({ message: 'Erreur serveur' }); }
});

app.put('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });
    const updates = [];
    const values = [];
    let idx = 1;
    if (req.body.isActive !== undefined) { updates.push(`"isActive" = $${idx++}`); values.push(req.body.isActive); }
    if (req.body.role) { updates.push(`role = $${idx++}`); values.push(req.body.role); }
    if (req.body.firstName) { updates.push(`"firstName" = $${idx++}`); values.push(sanitize(req.body.firstName)); }
    if (req.body.password) { updates.push(`password = $${idx++}`); values.push(await bcrypt.hash(req.body.password, 12)); }
    if (!updates.length) return res.status(400).json({ message: 'Aucune modification' });
    values.push(id);
    const result = await pool.query(`UPDATE users SET ${updates.join(',')} WHERE id = $${idx} RETURNING id, email, "firstName", "lastName", role, "isActive"`, values);
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ message: 'Erreur serveur' }); }
});

// ─── HEALTH + DRP ─────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'ok', app: 'CleanIT ERP API', version: '2.1', ts: new Date().toISOString() }));
// GET /init - Créer les tables (admin only)
app.get('/init-db', async (req, res) => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS feed_posts (
      id SERIAL PRIMARY KEY, user_id INTEGER, user_name VARCHAR(100),
      user_av VARCHAR(10), site VARCHAR(50), site_name VARCHAR(100),
      text TEXT NOT NULL, photo_url TEXT, gps_lat VARCHAR(20),
      gps_lng VARCHAR(20), what3words VARCHAR(100),
      type VARCHAR(20) DEFAULT 'text',
      reactions JSONB DEFAULT '{"like":0,"fire":0,"clap":0}',
      comments_count INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT NOW()
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS missions (
      id SERIAL PRIMARY KEY, code VARCHAR(20) UNIQUE NOT NULL,
      site VARCHAR(50), site_name VARCHAR(100), client VARCHAR(100),
      type VARCHAR(100), tech_id INTEGER, status VARCHAR(20) DEFAULT 'pending',
      progress INTEGER DEFAULT 0, deadline VARCHAR(50), bc_number VARCHAR(100),
      checklist JSONB DEFAULT '[]', team_ids JSONB DEFAULT '[]',
      created_at TIMESTAMP DEFAULT NOW()
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS post_reactions (
      id SERIAL PRIMARY KEY, post_id INTEGER, user_id INTEGER,
      emoji VARCHAR(10), UNIQUE(post_id, user_id)
    )`);
    res.json({ ok: true, message: 'Tables créées avec succès' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});


// GET /init-db - Créer les tables
app.get('/init-db', async (req, res) => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS feed_posts (id SERIAL PRIMARY KEY, user_id INTEGER, user_name VARCHAR(100), user_av VARCHAR(10), site VARCHAR(50), site_name VARCHAR(100), text TEXT NOT NULL, photo_url TEXT, gps_lat VARCHAR(20), gps_lng VARCHAR(20), what3words VARCHAR(100), type VARCHAR(20) DEFAULT 'text', reactions JSONB DEFAULT '{"like":0,"fire":0,"clap":0}', comments_count INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT NOW())`);
    await pool.query(`CREATE TABLE IF NOT EXISTS missions (id SERIAL PRIMARY KEY, code VARCHAR(20) UNIQUE NOT NULL, site VARCHAR(50), site_name VARCHAR(100), client VARCHAR(100), type VARCHAR(100), tech_id INTEGER, status VARCHAR(20) DEFAULT 'pending', progress INTEGER DEFAULT 0, deadline VARCHAR(50), bc_number VARCHAR(100), checklist JSONB DEFAULT '[]', team_ids JSONB DEFAULT '[]', created_at TIMESTAMP DEFAULT NOW())`);
    await pool.query(`CREATE TABLE IF NOT EXISTS post_reactions (id SERIAL PRIMARY KEY, post_id INTEGER, user_id INTEGER, emoji VARCHAR(10), UNIQUE(post_id, user_id))`);
    res.json({ ok: true, message: 'Tables creees' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', db: 'connected', ts: new Date().toISOString() });
  } catch (e) { res.status(503).json({ status: 'unhealthy', db: 'disconnected' }); }
});


// DELETE /users/:id
app.delete('/users/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ message: 'ID invalide' });
    // Empecher suppression de son propre compte
    if (parseInt(id) === req.user.sub) return res.status(400).json({ message: 'Impossible de supprimer votre propre compte' });
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Compte supprime' });
  } catch (e) { res.status(500).json({ message: 'Erreur serveur' }); }
});

// POST /users/bulk - Import CSV/JSON multiple
app.post('/users/bulk', auth, isAdmin, async (req, res) => {
  try {
    const { users } = req.body;
    if (!Array.isArray(users) || users.length === 0)
      return res.status(400).json({ message: 'Liste utilisateurs requise' });
    if (users.length > 200)
      return res.status(400).json({ message: 'Maximum 200 utilisateurs par import' });

    const results = { created: [], errors: [] };
    for (const u of users) {
      try {
        const email = sanitize(u.email || '').toLowerCase();
        const firstName = sanitize(u.firstName || u.prenom || '');
        const lastName = sanitize(u.lastName || u.nom || '');
        const role = u.role || 'technician';
        const password = u.password || 'CleanIT2024!';
        if (!email || !firstName) { results.errors.push({ email, reason: 'Email ou prenom manquant' }); continue; }
        const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (exists.rows[0]) { results.errors.push({ email, reason: 'Email deja utilise' }); continue; }
        const hash = await bcrypt.hash(password, 10);
        const r = await pool.query(
          'INSERT INTO users (email, password, "firstName", "lastName", role, "isActive", "createdAt") VALUES ($1,$2,$3,$4,$5,true,NOW()) RETURNING id, email, "firstName", "lastName", role',
          [email, hash, firstName, lastName, role]
        );
        results.created.push(r.rows[0]);
      } catch (err) { results.errors.push({ email: u.email, reason: err.message }); }
    }
    res.json({ total: users.length, created: results.created.length, errors: results.errors.length, details: results });
  } catch (e) { res.status(500).json({ message: 'Erreur serveur' }); }
});


// ─── INIT TABLES (auto-création si inexistantes) ──────────────
const initTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS feed_posts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      user_name VARCHAR(100),
      user_av VARCHAR(10),
      site VARCHAR(50),
      site_name VARCHAR(100),
      text TEXT NOT NULL,
      photo_url TEXT,
      gps_lat VARCHAR(20),
      gps_lng VARCHAR(20),
      what3words VARCHAR(100),
      type VARCHAR(20) DEFAULT 'text',
      reactions JSONB DEFAULT '{"like":0,"fire":0,"clap":0}',
      comments_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS missions (
      id SERIAL PRIMARY KEY,
      code VARCHAR(20) UNIQUE NOT NULL,
      site VARCHAR(50),
      site_name VARCHAR(100),
      client VARCHAR(100),
      type VARCHAR(100),
      tech_id INTEGER REFERENCES users(id),
      status VARCHAR(20) DEFAULT 'pending',
      progress INTEGER DEFAULT 0,
      deadline VARCHAR(50),
      bc_number VARCHAR(100),
      checklist JSONB DEFAULT '[]',
      team_ids JSONB DEFAULT '[]',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS post_reactions (
      id SERIAL PRIMARY KEY,
      post_id INTEGER REFERENCES feed_posts(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id),
      emoji VARCHAR(10),
      UNIQUE(post_id, user_id)
    )
  `);
};
initTables().catch(console.error);

// ─── FEED ROUTES ────────────────────────────────────────────
app.get('/feed', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT fp.*, u."firstName" || ' ' || u."lastName" as author_name
      FROM feed_posts fp
      LEFT JOIN users u ON fp.user_id = u.id
      ORDER BY fp.created_at DESC LIMIT 50
    `);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

app.post('/feed', auth, async (req, res) => {
  try {
    const { text, site, siteName, photoUrl, gpsLat, gpsLng, what3words, type } = req.body;
    if (!text) return res.status(400).json({ message: 'Texte requis' });
    const user = await pool.query('SELECT "firstName", "lastName" FROM users WHERE id = $1', [req.user.sub]);
    const u = user.rows[0];
    const av = (u.firstName[0] + u.lastName[0]).toUpperCase();
    const result = await pool.query(`
      INSERT INTO feed_posts (user_id, user_name, user_av, site, site_name, text, photo_url, gps_lat, gps_lng, what3words, type)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *
    `, [req.user.sub, u.firstName+' '+u.lastName, av, site||'', siteName||'', text, photoUrl||null, gpsLat||null, gpsLng||null, what3words||null, type||'text']);
    res.status(201).json(result.rows[0]);
  } catch (e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

app.post('/feed/:id/react', auth, async (req, res) => {
  try {
    const { emoji } = req.body;
    const { id } = req.params;
    await pool.query(`
      INSERT INTO post_reactions (post_id, user_id, emoji) VALUES ($1,$2,$3)
      ON CONFLICT (post_id, user_id) DO UPDATE SET emoji = $3
    `, [id, req.user.sub, emoji]);
    const count = await pool.query('SELECT COUNT(*) FROM post_reactions WHERE post_id = $1', [id]);
    res.json({ reactions: parseInt(count.rows[0].count) });
  } catch (e) { res.status(500).json({ message: 'Erreur serveur' }); }
});

// ─── MISSIONS ROUTES ────────────────────────────────────────
app.get('/missions', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, u."firstName" || ' ' || u."lastName" as tech_name
      FROM missions m
      LEFT JOIN users u ON m.tech_id = u.id
      ORDER BY m.created_at DESC
    `);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

app.get('/missions/my', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM missions WHERE tech_id = $1 ORDER BY created_at DESC', [req.user.sub]);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ message: 'Erreur serveur' }); }
});

app.post('/missions', auth, async (req, res) => {
  try {
    const { code, site, siteName, client, type, techId, deadline, bcNumber, checklist } = req.body;
    if (!code || !site || !client) return res.status(400).json({ message: 'Code, site et client requis' });
    const result = await pool.query(`
      INSERT INTO missions (code, site, site_name, client, type, tech_id, deadline, bc_number, checklist)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *
    `, [code, site, siteName||'', client, type||'', techId||null, deadline||null, bcNumber||null, JSON.stringify(checklist||[])]);
    res.status(201).json(result.rows[0]);
  } catch (e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

app.put('/missions/:id', auth, async (req, res) => {
  try {
    const { status, progress, checklist } = req.body;
    const updates = [];
    const values = [];
    let idx = 1;
    if (status) { updates.push(`status = $${idx++}`); values.push(status); }
    if (progress !== undefined) { updates.push(`progress = $${idx++}`); values.push(progress); }
    if (checklist) { updates.push(`checklist = $${idx++}`); values.push(JSON.stringify(checklist)); }
    if (!updates.length) return res.status(400).json({ message: 'Aucune modification' });
    values.push(req.params.id);
    const result = await pool.query(`UPDATE missions SET ${updates.join(',')} WHERE id = $${idx} RETURNING *`, values);
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ message: 'Erreur serveur' }); }
});

// 404
app.use((req, res) => res.status(404).json({ message: 'Route introuvable' }));

module.exports = app;

// GET /metrics - Dashboard monitoring admin
app.get('/metrics', auth, isAdmin, async (req, res) => {
  try {
    const [users, dbCheck] = await Promise.all([
      pool.query('SELECT COUNT(*) as total, COUNT(CASE WHEN "isActive" THEN 1 END) as active FROM users'),
      pool.query('SELECT NOW() as db_time')
    ]);
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: { connected: true, time: dbCheck.rows[0].db_time },
      users: { total: parseInt(users.rows[0].total), active: parseInt(users.rows[0].active) },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '2.1'
    });
  } catch (e) {
    res.status(503).json({ status: 'degraded', error: e.message });
  }
});
