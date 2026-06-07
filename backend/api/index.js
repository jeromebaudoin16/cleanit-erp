const express = require('express');
const webpush = require('web-push');

// Configurer VAPID
webpush.setVapidDetails(
  'mailto:admin@cleanit.cm',
  process.env.VAPID_PUBLIC_KEY || 'BNSQIjGGELW6UAg0K1bkGLRgkWf0xSn9pocHSAwrtMauehwBVm-v1fM3TE_QRoQVlBmq15FGbqMP3ZNmH7ZSjZc',
  process.env.VAPID_PRIVATE_KEY || 'R7FtPVAiJzlXqDKECMAToh1CwCGWY0YnAHzdQOKx8Xs'
);
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
    await pool.query(`CREATE TABLE IF NOT EXISTS push_subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      subscription JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS push_subscriptions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      subscription JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
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
    let siteLat=null, siteLng=null;
    if(site) {
      const siteQ = await pool.query('SELECT latitude,longitude FROM sites WHERE code=$1 LIMIT 1',[site]);
      if(siteQ.rows[0]) { siteLat=siteQ.rows[0].latitude; siteLng=siteQ.rows[0].longitude; }
    }
    const result = await pool.query(`
      INSERT INTO missions (code, site, site_name, client, type, tech_id, deadline, bc_number, checklist, site_lat, site_lng, site_rayon)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *
    `, [code, site, siteName||'', client, type||'', techId||null, deadline||null, bcNumber||null, JSON.stringify(checklist||[]), siteLat, siteLng, 500]);
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
    if (req.body.techId) { updates.push(`tech_id = $${idx++}`); values.push(req.body.techId); }
    if (!updates.length) return res.status(400).json({ message: 'Aucune modification' });
    values.push(req.params.id);
    const result = await pool.query(`UPDATE missions SET ${updates.join(',')} WHERE id = $${idx} RETURNING *`, values);
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ message: 'Erreur serveur' }); }
});


// ─── WHATSAPP ────────────────────────────────────────────────
const WA_TOKEN = process.env.WHATSAPP_TOKEN || '';
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID || '';
const WA_VERIFY = process.env.WHATSAPP_VERIFY_TOKEN || 'cleanit_webhook_2024';

app.get('/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if(mode === 'subscribe' && token === WA_VERIFY)
    return res.status(200).send(challenge);
  res.status(403).json({ message: 'Token invalide' });
});

app.post('/webhook/whatsapp', async (req, res) => {
  try {
    const body = req.body;
    if(body.object === 'whatsapp_business_account') {
      const messages = body.entry?.[0]?.changes?.[0]?.value?.messages;
      const contacts = body.entry?.[0]?.changes?.[0]?.value?.contacts;
      if(messages?.[0]) {
        const msg = messages[0];
        const contact = contacts?.[0];
        const fromName = contact?.profile?.name || msg.from;
        const text = msg.text?.body || msg.type || '';
        await pool.query(
          'INSERT INTO wa_messages (from_number,from_name,message,direction,wa_message_id) VALUES ($1,$2,$3,$4,$5)',
          [msg.from, fromName, text, 'incoming', msg.id]
        ).catch(()=>{});
      }
    }
  } catch(e) {}
  res.status(200).json({ status: 'ok' });
});

app.get('/whatsapp/status', auth, (req, res) => {
  res.json({
    configured: !!(WA_TOKEN && WA_PHONE_ID),
    webhookUrl: 'https://backend-cleanit-erp.vercel.app/webhook/whatsapp',
    verifyToken: WA_VERIFY
  });
});

app.post('/whatsapp/send', auth, async (req, res) => {
  try {
    const { to, message } = req.body;
    if(!to || !message) return res.status(400).json({ message: 'Destinataire et message requis' });
    if(!WA_TOKEN || !WA_PHONE_ID) return res.status(503).json({ message: 'WhatsApp non configure' });
    const r = await fetch(`https://graph.facebook.com/v18.0/${WA_PHONE_ID}/messages`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer '+WA_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product:'whatsapp', to: to.replace(/[^0-9]/g,''), type:'text', text:{ body: message } })
    });
    const data = await r.json();
    if(data.error) return res.status(400).json({ message: data.error.message });
    const msgId = data.messages?.[0]?.id;
    await pool.query(
      'INSERT INTO wa_messages (from_number,to_number,message,direction,wa_message_id) VALUES ($1,$2,$3,$4,$5)',
      [WA_PHONE_ID, to.replace(/[^0-9]/g,''), message, 'outgoing', msgId||'']
    ).catch(()=>{});
    res.json({ ok: true, messageId: msgId });
  } catch(e) { res.status(500).json({ message: 'Erreur envoi', error: e.message }); }
});


// ─── INIT APPROVALS TABLE ─────────────────────────────────────
pool.query(`CREATE TABLE IF NOT EXISTS approvals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  user_name VARCHAR(100),
  type VARCHAR(50),
  label VARCHAR(50),
  detail TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  n1_done BOOLEAN DEFAULT false,
  n2_done BOOLEAN DEFAULT false,
  dg_done BOOLEAN DEFAULT false,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)`).catch(console.error);

// ─── APPROVALS ROUTES ─────────────────────────────────────────
app.get('/approvals', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM approvals ORDER BY created_at DESC');
    res.json(result.rows);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur' }); }
});

app.post('/approvals', auth, async (req, res) => {
  try {
    const { type, label, detail } = req.body;
    const user = await pool.query('SELECT "firstName","lastName" FROM users WHERE id=$1',[req.user.sub]);
    const u = user.rows[0];
    const result = await pool.query(
      'INSERT INTO approvals (user_id,user_name,type,label,detail) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.user.sub, u.firstName+' '+u.lastName, type, label, detail]
    );
    res.status(201).json(result.rows[0]);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur' }); }
});

app.put('/approvals/:id', auth, async (req, res) => {
  try {
    const { action, comment } = req.body;
    const role = req.user.role;
    const appr = await pool.query('SELECT * FROM approvals WHERE id=$1',[req.params.id]);
    if(!appr.rows[0]) return res.status(404).json({ message: 'Introuvable' });
    let update = {};
    if(action==='approve') {
      if(['hr','rh'].includes(role) && !appr.rows[0].n1_done) update = {n1_done:true};
      else if(['pm','project_manager','bureau'].includes(role) && appr.rows[0].n1_done && !appr.rows[0].n2_done) update = {n2_done:true};
      else if(['admin','dg'].includes(role)) update = {dg_done:true, status:'approved'};
    } else if(action==='reject') {
      update = {status:'rejected', comment: comment||''};
    }
    if(!Object.keys(update).length) return res.status(400).json({ message: 'Action non autorisee' });
    const sets = Object.entries(update).map(([k,v],i)=>`"${k}"=$${i+1}`).join(',');
    const vals = [...Object.values(update), req.params.id];
    const result = await pool.query(
      `UPDATE approvals SET ${sets},updated_at=NOW() WHERE id=$${vals.length} RETURNING *`,
      vals
    );
    res.json(result.rows[0]);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur' }); }
});


pool.query(`CREATE TABLE IF NOT EXISTS tickets (id SERIAL PRIMARY KEY, code VARCHAR(20), title VARCHAR(200) NOT NULL, description TEXT, type VARCHAR(50) DEFAULT 'incident', priority VARCHAR(20) DEFAULT 'medium', status VARCHAR(20) DEFAULT 'open', site VARCHAR(50), client VARCHAR(100), assigned_to INTEGER, created_by INTEGER, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`).catch(console.error);

app.get('/tickets', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tickets ORDER BY created_at DESC');
    res.json(result.rows);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur' }); }
});

app.post('/tickets', auth, async (req, res) => {
  try {
    const { title, description, type, priority, site, client } = req.body;
    if(!title) return res.status(400).json({ message: 'Titre requis' });
    const count = await pool.query('SELECT COUNT(*) FROM tickets');
    const code = 'TK-' + String(parseInt(count.rows[0].count)+1001);
    const result = await pool.query('INSERT INTO tickets (code,title,description,type,priority,site,client,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [code, title, description||'', type||'incident', priority||'medium', site||'', client||'', req.user.sub]);
    res.status(201).json(result.rows[0]);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

app.put('/tickets/:id', auth, async (req, res) => {
  try {
    const { status, priority } = req.body;
    const updates = []; const values = []; let idx = 1;
    if(status) { updates.push(`status=$${idx++}`); values.push(status); }
    if(priority) { updates.push(`priority=$${idx++}`); values.push(priority); }
    if(!updates.length) return res.status(400).json({ message: 'Aucune modif' });
    values.push(req.params.id);
    const result = await pool.query(`UPDATE tickets SET ${updates.join(',')},updated_at=NOW() WHERE id=$${idx} RETURNING *`, values);
    res.json(result.rows[0]);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur' }); }
});

app.get('/stats', auth, async (req, res) => {
  try {
    const [users, missions, posts, tickets, approvals] = await Promise.all([
      pool.query('SELECT COUNT(*) as total, COUNT(CASE WHEN "isActive" THEN 1 END) as active FROM users'),
      pool.query("SELECT COUNT(*) as total, COUNT(CASE WHEN status='in_progress' THEN 1 END) as active, COUNT(CASE WHEN status='pending' THEN 1 END) as pending FROM missions"),
      pool.query('SELECT COUNT(*) as total FROM feed_posts'),
      pool.query("SELECT COUNT(*) as total, COUNT(CASE WHEN status='open' THEN 1 END) as open FROM tickets").catch(()=>({rows:[{total:0,open:0}]})),
      pool.query("SELECT COUNT(*) as total, COUNT(CASE WHEN status='pending' THEN 1 END) as pending FROM approvals").catch(()=>({rows:[{total:0,pending:0}]})),
    ]);
    res.json({
      users: { total: parseInt(users.rows[0].total), active: parseInt(users.rows[0].active) },
      missions: { total: parseInt(missions.rows[0].total), active: parseInt(missions.rows[0].active), pending: parseInt(missions.rows[0].pending) },
      posts: parseInt(posts.rows[0].total),
      tickets: { total: parseInt(tickets.rows[0].total), open: parseInt(tickets.rows[0].open) },
      approvals: { total: parseInt(approvals.rows[0].total), pending: parseInt(approvals.rows[0].pending) },
    });
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});


// ─── POINTAGES TABLE ──────────────────────────────────────────
pool.query(`CREATE TABLE IF NOT EXISTS pointages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  user_name VARCHAR(100),
  site_code VARCHAR(50),
  site_name VARCHAR(100),
  type VARCHAR(20) DEFAULT 'arrivee',
  gps_lat VARCHAR(20),
  gps_lng VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
)`).catch(console.error);

// ─── GEOFENCING ──────────────────────────────────────────────
const ZONES_BUREAU = [
  {code:'HUA-DLA',nom:'Huawei Douala Bonapriso',lat:4.021841,lng:9.698572,rayon:150},
  {code:'COL-DLA',nom:'Ancien Collège des Nations Bonapriso',lat:4.024400,lng:9.705468,rayon:150},
];

function distGPS(lat1,lng1,lat2,lng2){
  const R=6371000;
  const dLat=(lat2-lat1)*Math.PI/180;
  const dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)));
}

function checkGeofencingBureau(lat,lng){
  if(!lat||!lng) return {valide:true,distance:null,zone:null,horsZone:false};
  const latN=parseFloat(lat);const lngN=parseFloat(lng);
  for(const zone of ZONES_BUREAU){
    const dist=distGPS(latN,lngN,zone.lat,zone.lng);
    if(dist<=zone.rayon) return {valide:true,distance:dist,zone:zone.nom,horsZone:false};
  }
  const dists=ZONES_BUREAU.map(z=>({z,d:distGPS(latN,lngN,z.lat,z.lng)}));
  const nearest=dists.sort((a,b)=>a.d-b.d)[0];
  return {valide:false,distance:nearest.d,zone:nearest.z.nom,horsZone:true};
}

async function checkGeofencingTerrain(userId,lat,lng){
  if(!lat||!lng) return {valide:true,distance:null,zone:null,horsZone:false};
  const latN=parseFloat(lat);const lngN=parseFloat(lng);
  const mission=await pool.query(
    "SELECT * FROM missions WHERE tech_id=$1 AND status='in_progress' AND site_lat IS NOT NULL LIMIT 1",
    [userId]
  );
  if(!mission.rows[0]) return {valide:true,distance:null,zone:null,horsZone:false};
  const m=mission.rows[0];
  const rayon=m.site_rayon||500;
  const dist=distGPS(latN,lngN,parseFloat(m.site_lat),parseFloat(m.site_lng));
  if(dist<=rayon) return {valide:true,distance:dist,zone:m.site_name||m.site,horsZone:false};
  return {valide:false,distance:dist,zone:m.site_name||m.site,horsZone:true};
}

app.post('/pointages', auth, async (req, res) => {
  try {
    const { siteCode, siteName, type, gpsLat, gpsLng } = req.body;
    const userQ = await pool.query('SELECT "firstName","lastName",role FROM users WHERE id=$1',[req.user.sub]);
    const u = userQ.rows[0];
    const isTerrain = ['technician','terrain'].includes(u.role);
    
    let geo;
    if(isTerrain){
      geo = await checkGeofencingTerrain(req.user.sub, gpsLat, gpsLng);
    } else {
      geo = checkGeofencingBureau(gpsLat, gpsLng);
    }

    const result = await pool.query(
      'INSERT INTO pointages (user_id,user_name,site_code,site_name,type,gps_lat,gps_lng,valide,distance_m,hors_zone,zone_nom) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',
      [req.user.sub, u.firstName+' '+u.lastName,
       siteCode||geo.zone||'', siteName||geo.zone||'',
       type||'arrivee', gpsLat||null, gpsLng||null,
       geo.valide, geo.distance, geo.horsZone, geo.zone]
    );
    res.status(201).json({...result.rows[0], geofencing: geo});
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

app.get('/pointages', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pointages WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50',[req.user.sub]);
    res.json(result.rows);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur' }); }
});

app.get('/pointages/all', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pointages ORDER BY created_at DESC LIMIT 200');
    res.json(result.rows);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur' }); }
});


// ─── WHATSAPP MESSAGES TABLE ──────────────────────────────────
pool.query(`CREATE TABLE IF NOT EXISTS wa_messages (
  id SERIAL PRIMARY KEY,
  from_number VARCHAR(30),
  from_name VARCHAR(100),
  to_number VARCHAR(30),
  message TEXT NOT NULL,
  direction VARCHAR(10) DEFAULT 'incoming',
  status VARCHAR(20) DEFAULT 'received',
  wa_message_id VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW()
)`).catch(console.error);

// GET /wa-messages - Tous les messages
app.get('/wa-messages', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM wa_messages ORDER BY created_at DESC LIMIT 100');
    res.json(result.rows);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur' }); }
});

// GET /wa-messages/:number - Messages d un contact
app.get('/wa-messages/:number', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM wa_messages WHERE from_number=$1 OR to_number=$1 ORDER BY created_at ASC LIMIT 50',
      [req.params.number]
    );
    res.json(result.rows);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur' }); }
});


// ─── PUSH SUBSCRIPTIONS ───────────────────────────────────────
pool.query(`CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  subscription JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)`).catch(console.error);

// Sauvegarder subscription push
app.post('/push/subscribe', async (req, res) => {
  try {
    const { subscription } = req.body;
    if(!subscription) return res.status(400).json({ message: 'Subscription requise' });
    // Supprimer ancienne subscription de cet user
    const rawId = req.body.userId;
    const userId = rawId && !isNaN(parseInt(rawId)) ? parseInt(rawId) : null;
    if(userId) await pool.query('DELETE FROM push_subscriptions WHERE user_id=$1',[userId]).catch(()=>{});
    await pool.query(
      'INSERT INTO push_subscriptions (user_id,subscription) VALUES ($1,$2)',
      [userId, JSON.stringify(subscription)]
    );
    res.json({ ok: true, message: 'Notification push activée' });
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', detail: e.message }); }
});

// Envoyer notification push à un user
app.post('/push/send', auth, isAdmin, async (req, res) => {
  try {
    const { userId, title, body, url } = req.body;

    const query = userId
      ? 'SELECT subscription FROM push_subscriptions WHERE user_id=$1'
      : 'SELECT subscription FROM push_subscriptions';
    const params = userId ? [userId] : [];
    const subs = await pool.query(query, params);
    const payload = JSON.stringify({ title, body, url: url||'/mobile', icon:'/icons/icon-192.png' });
    let sent = 0;
    const errors = [];
    for(const row of subs.rows) {
      try {
        await webpush.sendNotification(row.subscription, payload);
        sent++;
      } catch(e) {
        errors.push({code: e.statusCode, msg: e.message});
        if(e.statusCode === 410 || e.statusCode === 404) {
          await pool.query('DELETE FROM push_subscriptions WHERE id=$1',[row.id]).catch(()=>{});
        }
      }
    }
    if(errors.length > 0) console.error('Push errors:', JSON.stringify(errors));
    res.json({ ok: true, sent, total: subs.rows.length, errors });
  } catch(e) { res.status(500).json({ message: 'Erreur envoi push', error: e.message }); }
});

// Envoyer notif automatique lors d'assignation mission
app.post('/push/notify-mission', auth, async (req, res) => {
  try {
    const { techId, missionCode, siteName } = req.body;

    const subs = await pool.query('SELECT subscription FROM push_subscriptions WHERE user_id=$1',[techId]);
    const payload = JSON.stringify({
      title: '🔧 Nouvelle mission assignée',
      body: missionCode+' — '+siteName,
      url: '/mobile/mission',
      icon: '/icons/icon-192.png'
    });
    for(const row of subs.rows) {
      await webpush.sendNotification(JSON.parse(row.subscription), payload).catch(()=>{});
    }
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ ok: false }); }
});


// GET /technicians — Liste des techniciens avec stats
app.get('/technicians', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, u.email, u."firstName", u."lastName",
        u.role, u."isActive", u."lastSeen",
        COUNT(DISTINCT m.id) as missions_count
      FROM users u
      LEFT JOIN missions m ON m.tech_id = u.id
      WHERE u.role = 'technician' AND u."isActive" = true
      GROUP BY u.id
      ORDER BY u."firstName", u."lastName"
    `);
    // Formater pour la page Techniciens
    const techs = result.rows.map(u => ({
      id: u.id,
      initials: (u.firstName?.[0]||'?') + (u.lastName?.[0]||''),
      name: (u.firstName||'') + ' ' + (u.lastName||''),
      email: u.email,
      role: 'Technicien',
      region: 'Cameroun',
      statut: 'Disponible',
      missions: parseInt(u.missions_count) || 0,
      sites_count: parseInt(u.missions_count) || 0,
      debut: new Date(u.lastSeen || Date.now()).getFullYear().toString(),
      certs: [],
      sites: [],
      feed: []
    }));
    res.json(techs);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});


// GET /notifications — Notifications système
app.get('/notifications', auth, async (req, res) => {
  try {
    const [feed, approvals] = await Promise.all([
      pool.query('SELECT * FROM feed_posts ORDER BY created_at DESC LIMIT 5'),
      pool.query("SELECT * FROM approvals WHERE status='pending' ORDER BY created_at DESC LIMIT 5")
    ]);
    const notifs = [
      ...feed.rows.map(f=>({id:'f'+f.id,title:'Nouveau post',message:f.content?.substring(0,60),type:'feed',read:false,created_at:f.created_at})),
      ...approvals.rows.map(a=>({id:'a'+a.id,title:'Approbation en attente',message:a.label||a.type,type:'approval',read:false,created_at:a.created_at}))
    ];
    res.json(notifs);
  } catch(e) { res.json([]); }
});

// ─── CONVERSATIONS & MESSAGES ─────────────────────────────────
app.get('/conversations', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*,
        u1.id as p1_id, u1."firstName" as p1_first, u1."lastName" as p1_last,
        u2.id as p2_id, u2."firstName" as p2_first, u2."lastName" as p2_last,
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id=c.id AND m.read=false AND m.from_id!=$1) as unread
      FROM conversations c
      JOIN users u1 ON u1.id = c.participant_1
      JOIN users u2 ON u2.id = c.participant_2
      WHERE c.participant_1=$1 OR c.participant_2=$1
      ORDER BY c.last_message_at DESC
    `, [req.user.sub]);
    res.json(result.rows);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

app.post('/conversations', auth, async (req, res) => {
  try {
    const { participantId } = req.body;
    const me = req.user.sub;
    const p1 = Math.min(me, participantId);
    const p2 = Math.max(me, participantId);
    const existing = await pool.query('SELECT * FROM conversations WHERE participant_1=$1 AND participant_2=$2',[p1,p2]);
    if (existing.rows[0]) return res.json(existing.rows[0]);
    const result = await pool.query('INSERT INTO conversations (participant_1, participant_2) VALUES ($1,$2) RETURNING *',[p1,p2]);
    res.status(201).json(result.rows[0]);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

app.get('/messages/:convId', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages WHERE conversation_id=$1 ORDER BY created_at ASC LIMIT 100',[req.params.convId]);
    await pool.query('UPDATE messages SET read=true WHERE conversation_id=$1 AND from_id!=$2',[req.params.convId, req.user.sub]);
    res.json(result.rows);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
});

app.post('/messages', auth, async (req, res) => {
  try {
    const { conversationId, text, photoUrl } = req.body;
    if (!text && !photoUrl) return res.status(400).json({ message: 'Message vide' });
    const user = await pool.query('SELECT "firstName","lastName" FROM users WHERE id=$1',[req.user.sub]);
    const u = user.rows[0];
    const result = await pool.query(
      'INSERT INTO messages (conversation_id, from_id, from_name, text, photo_url) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [conversationId, req.user.sub, u.firstName+' '+u.lastName, text||null, photoUrl||null]
    );
    await pool.query('UPDATE conversations SET last_message=$1, last_message_at=NOW() WHERE id=$2',[text||'Photo', conversationId]);
    res.status(201).json(result.rows[0]);
  } catch(e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
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

